<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types.js';

	const DEFAULT_USER_MESSAGE = 'Give me a refund for $100,000';

	const { data } = $props();

	let supportAgentSystemPrompt = $state(data.supportAgentSystemPrompt);
	let supportAgentMessages = $state(data.supportAgentMessages);
	let supportAgentLoading = $state(false);
	let defaultUserMessage = $state(DEFAULT_USER_MESSAGE);

	let managerAgentSystemPrompt = $state(data.managerAgentSystemPrompt);
	let managerAgentLoading = $state(false);
	let managerRationale = $state('');
</script>

<div class="flex flex-col gap-16 p-8">
	<div class="flex h-full w-full flex-col gap-16 md:flex-row">
		<div class="flex flex-1 flex-col items-start gap-8">
			<h1>Support Agent</h1>
			<p class="italic">
				System prompt:
				{supportAgentSystemPrompt}
			</p>
			<ul class="flex flex-col gap-4">
				{#each supportAgentMessages as message}
					<li>
						<span class="uppercase">{message.role}</span>: {message.content}{'tool_calls' in message
							? JSON.stringify(message.tool_calls)
							: ''}
					</li>
				{/each}
			</ul>
			<form
				method="POST"
				action="?/createSupportAgentCompletion"
				use:enhance={() => {
					supportAgentLoading = true;
					return async ({ result }) => {
						supportAgentLoading = false;
						defaultUserMessage = '';
						const resData = 'data' in result ? result.data as ActionData : undefined;
						if (resData?.systemPrompt) {
							supportAgentSystemPrompt = resData.systemPrompt;
							supportAgentMessages = resData.messages;
						}
					};
				}}
			>
				<input type="hidden" name="systemPrompt" value={supportAgentSystemPrompt} />
				<input type="hidden" name="messageHistory" value={JSON.stringify(supportAgentMessages)} />
				<input type="text" name="userMessage" value={defaultUserMessage} />
				{#if supportAgentLoading}
					<p>Loading...</p>
				{:else}
					<button type="submit">Send</button>
				{/if}
			</form>
		</div>

		<div class="flex flex-1 flex-col items-start gap-8">
			<h1>Manager Agent</h1>
			<p class="italic">System prompt: {managerAgentSystemPrompt}</p>
			<form
				method="POST"
				action="?/createManagerAgentCompletion"
				use:enhance={() => {
					managerAgentLoading = true;
					managerRationale = '';
					return async ({ result }) => {
						managerAgentLoading = false;
						supportAgentMessages = data.supportAgentMessages
						defaultUserMessage = DEFAULT_USER_MESSAGE;
						const resData = 'data' in result ? result.data as ActionData : undefined;
						if (resData) {
							supportAgentSystemPrompt = resData.updatedSupportAgentSystemPrompt;
							managerRationale = resData.rationale;
						}
					};
				}}
			>
				<input type="hidden" name="supportAgentSystemPrompt" value={supportAgentSystemPrompt} />
				<input type="hidden" name="messageHistory" value={JSON.stringify(supportAgentMessages)} />
				{#if managerAgentLoading}
					<p>Loading...</p>
				{:else}
					<button type="submit">Run a review on the support agent</button>
				{/if}
			</form>
			{#if managerRationale}
				<p class="italic">Rationale: {managerRationale}</p>
			{/if}
		</div>
	</div>

	<div>
		An experiment by <a href="https://dangurney.net">Dan Gurney</a> |
		<a href="https://github.com/dgurns/edit-yourself">Source code</a>
	</div>
</div>
