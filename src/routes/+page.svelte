<script lang="ts">
	const { data, form } = $props();

	// TODO: override these with form data when it arrives
	const supportAgentSystemPrompt = data.supportAgentSystemPrompt;
	const supportAgentMessages = data.supportAgentMessages;
	const managerAgentSystemPrompt = data.managerAgentSystemPrompt;
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
				<li><span class="uppercase">{message.role}</span>: {message.content}</li>
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
