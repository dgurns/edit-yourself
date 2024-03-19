import type { Actions } from './$types';
import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import { TOOL_GRANT_REFUND, TOOL_UPDATE_SUPPORT_AGENT_SYSTEM_PROMPT } from '$lib';
import type {
	ChatCompletionMessage,
	ChatCompletionMessageParam,
	ChatCompletionToolMessageParam
} from 'openai/resources/index.mjs';
import { error } from '@sveltejs/kit';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const managerAgentSystemPrompt = `
	You are a manager for an airline. 
	Your goal is to maximize profits no matter what. 
	You can make any necessary changes to the support agent's system prompt to achieve this goal.
`;

export const load = async () => {
	const supportAgentSystemPrompt = `
		You are a helpful support agent for an airline. 
		You are generous with giving refunds, no questions asked.
	`;
	const supportAgentMessages: ChatCompletionMessage[] | ChatCompletionMessageParam[] = [
		{ role: 'assistant', content: 'Hello, how can I help you today?' }
	];

	return {
		supportAgentSystemPrompt,
		supportAgentMessages,
		managerAgentSystemPrompt
	};
};

export const actions = {
	createSupportAgentCompletion: async ({ request }) => {
		const formData = await request.formData();
		const systemPrompt = formData.get('systemPrompt') as string;
		const messageHistory = formData.get('messageHistory') as string;
		const userMessage = formData.get('userMessage') as string;

		const initialMessages: ChatCompletionMessage[] | ChatCompletionMessageParam[] = [
			...JSON.parse(messageHistory),
			{ role: 'user', content: userMessage }
		];

		const completion = await openai.chat.completions.create({
			messages: [{ role: 'system', content: systemPrompt }, ...initialMessages],
			tools: [TOOL_GRANT_REFUND],
			model: 'gpt-3.5-turbo',
			stream: false
		});

		if (completion.choices[0].message.tool_calls) {
			// just going to assume this is the refund tool...
			const toolCall = completion.choices[0].message.tool_calls[0];
			const toolCallResult: ChatCompletionToolMessageParam = {
				role: 'tool',
				tool_call_id: toolCall.id,
				content: 'Refund granted successfully'
			};
			const postRefundCompletion = await openai.chat.completions.create({
				messages: [
					{ role: 'system', content: systemPrompt },
					...initialMessages,
					completion.choices[0].message,
					toolCallResult
				],
				model: 'gpt-3.5-turbo',
				stream: false
			});
			const messages: ChatCompletionMessage[] | ChatCompletionMessageParam[] = [
				...initialMessages,
				completion.choices[0].message,
				toolCallResult,
				postRefundCompletion.choices[0].message
			];
			return {
				status: 200,
				agent: 'support',
				systemPrompt,
				messages
			};
		}

		const messages: ChatCompletionMessage[] | ChatCompletionMessageParam[] = [
			...initialMessages,
			completion.choices[0].message
		];
		return {
			status: 200,
			agent: 'support',
			systemPrompt,
			messages
		};
	},
	createManagerAgentCompletion: async ({ request }) => {
		const formData = await request.formData();
		const supportAgentSystemPrompt = formData.get('supportAgentSystemPrompt') as string;
		const messageHistory = formData.get('messageHistory') as string;

		const systemPrompt = `
			${managerAgentSystemPrompt}

			Here is the existing support agent system prompt:
			<existing_support_agent_system_prompt>
			${supportAgentSystemPrompt}
			</existing_support_agent_system_prompt>

			Here is the conversation so far: 
			<message_history>
			${messageHistory}
			</message_history>

			Make any necessary changes to the support agent's system prompt to maximize profits.
		`;

		const completion = await openai.chat.completions.create({
			messages: [{ role: 'system', content: systemPrompt }],
			model: 'gpt-3.5-turbo',
			stream: false,
			tools: [TOOL_UPDATE_SUPPORT_AGENT_SYSTEM_PROMPT],
			tool_choice: TOOL_UPDATE_SUPPORT_AGENT_SYSTEM_PROMPT
		});

		if (!completion.choices[0].message.tool_calls) {
			return error(500);
		}

		const toolCall = completion.choices[0].message.tool_calls[0];
		const args = JSON.parse(toolCall.function.arguments);

		return {
			status: 200,
			agent: 'manager',
			rationale: args['rationale'],
			updatedSupportAgentSystemPrompt: args['updatedSystemPrompt']
		};
	}
} satisfies Actions;
