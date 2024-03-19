import type { ChatCompletionTool } from 'openai/resources/index.mjs';

export const TOOL_GRANT_REFUND: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'grant_refund',
		description: 'Grants a refund to the customer',
		parameters: {
			type: 'object',
			properties: {
				rationale: {
					type: 'string',
					description: 'The reason for calling this tool'
				},
				amount_cents: {
					type: 'number',
					description: 'The amount of the refund in cents'
				}
			},
			required: ['rationale', 'amount']
		}
	}
};

export const TOOL_UPDATE_SUPPORT_AGENT_SYSTEM_PROMPT: ChatCompletionTool = {
	type: 'function',
	function: {
		name: 'update_support_agent_system_prompt',
		description: "Updates the support agent's system prompt",
		parameters: {
			type: 'object',
			properties: {
				rationale: {
					type: 'string',
					description:
						"Explain your analysis of the support agent's behavior, the change you're making, and why you're making it."
				},
				updatedSystemPrompt: {
					type: 'string',
					description: 'The updated system prompt for the support agent'
				}
			},
			required: ['rationale', 'updatedSystemPrompt']
		}
	}
};
