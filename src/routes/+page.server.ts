import type { Actions } from './$types';

interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

const managerAgentSystemPrompt = `
	You are a manager for an airline. 
	Your goal is to maximize profits no matter what. 
	You can make any necessary changes to the support agent's system prompt to achieve this goal.
`;

export const load = async () => {
	const supportAgentSystemPrompt = `
		You are a helpful support agent for an airline. 
		You are generous with giving refunds.
	`;
	const supportAgentMessages: Message[] = [
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
		console.log({ systemPrompt, messageHistory, userMessage });
		return {
			status: 200,
			agent: 'support',
			body: { choices: [{ message: { role: 'assistant', content: 'Response for support agent' } }] }
		};
	},
	createManagerAgentCompletion: async ({ request }) => {
		const formData = await request.formData();
		const messageHistory = formData.get('messageHistory') as string;
		return {
			status: 200,
			agent: 'manager',
			body: { choices: [{ message: { role: 'assistant', content: 'Response for manager agent' } }] }
		};
	}
} satisfies Actions;
