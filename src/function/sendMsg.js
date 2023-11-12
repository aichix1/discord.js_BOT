const { Logger } = await import(process.env.src + 'function/logger.js');

export async function sendMsg(interaction, client, name, icon_url, embed, content) {
	const log = new Logger('sendMsg');
	const nickname = name ?? interaction.member?.displayName;
	const avatarURL = icon_url ?? interaction.author.avatarURL({ dynamic: true });
	const webhook = client.webhooks.get(interaction.channel.id) ?? await getWebhook(interaction, client);
	webhook.send({
		content: content ?? interaction.content,
		username: nickname,
		avatarURL: avatarURL,
		embeds: embed
	}).catch(e => console.error(e));
}

async function getWebhook(interaction, client) {
	const log = new Logger('getWebhook');
	const webhooks = await interaction.channel.fetchWebhooks();
	const webhook = webhooks?.find(v => v.token) ?? await interaction.channel.createWebhook({ name: 'Bot Webhook' });
	if (webhook) client.webhooks.set(interaction.channel.id, webhook);
	return webhook;
}