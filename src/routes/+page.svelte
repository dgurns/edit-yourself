<script lang="ts">
	const { data, form } = $props();

	let supportAgentSystemPrompt = data.supportAgentSystemPrompt;
	let supportAgentMessages = data.supportAgentMessages;
	let managerAgentSystemPrompt = data.managerAgentSystemPrompt;

	if (form && form.agent === 'support' && form.messages) {
		supportAgentMessages = form.messages;
	}
</script>

<div class="flex h-full w-full flex-row gap-16 p-8">
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
		<form method="POST" action="?/createSupportAgentCompletion">
			<input type="hidden" name="systemPrompt" value={supportAgentSystemPrompt} />
			<input type="hidden" name="messageHistory" value={JSON.stringify(supportAgentMessages)} />
			<textarea name="userMessage"></textarea>
			<button type="submit">Send</button>
		</form>
	</div>

	<div class="flex flex-1 flex-col items-start gap-8">
		<h1>Manager Agent</h1>
		<p class="italic">System prompt: {managerAgentSystemPrompt}</p>
		<form method="POST" action="?/createManagerAgentCompletion">
			<input type="hidden" name="messageHistory" value={JSON.stringify(supportAgentMessages)} />
			<button type="submit">Run a review on the support agent</button>
		</form>
	</div>
</div>
