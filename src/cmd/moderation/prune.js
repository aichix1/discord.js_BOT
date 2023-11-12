const { src } = process.env;
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setTimeout } from 'timers/promises';
const { Logger } = await import(src + 'function/logger.js');
const { fetchMany } = await import(src + 'function/fetchMany.js');

export const data = new SlashCommandBuilder()
	.setName('prune')
	.setDescription('Prune up to 99 messages.')
	.setDescriptionLocalizations({ ja: '最大99件のメッセージ削除' })
	.addIntegerOption(option => option
		.setName('amount')
		.setDescription('Number of messages to prune')
		.setDescriptionLocalizations({ ja: '削除メッセージ数' })
		.setMinValue(1)
		.setMaxValue(100)
		.setRequired(true))
	.addUserOption(option => option
		.setName('target')
		.setDescription('Target User')
		.setDescriptionLocalizations({ ja: 'ターゲットユーザー' }))
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

const local1 = {
	en: 'There was an error trying to prune messages in this channel!',
	ja: '[Error] メッセージ削除エラー'
};
const local2 = { en: 'Successfully pruned', ja: '削除完了: ' };

export const cooldown = 5;
export const name = 'purne';
export async function execute(interaction) {
	const log = new Logger(this.name);
	const amount = interaction.options.getInteger('amount');
	const target = interaction.options.getUser('target');
	await interaction[f]]({ ephemeral: true });
	const limit = amount <= 50 ? 100 : amount * 2;
	const fetchedMessages = await fetchMany(interaction.channel, { limit: limit });
	const messages = fetchedMessages
		.filter(message => message.author.id === (target?.id ?? message.author?.id)).first(amount);
	
	await interaction.channel.bulkDelete(messages).catch(e => {
		console.err(e);
		await interaction[met.e](local1[interaction.locale] ?? local1.en).catch(e => log.err(e));
	});
	
	const c1 = local2[interaction.locale] ?? local2.en;
	await interaction[met.e](c1 + ` \`${messages.length}\` messages.`).catch(e => log.err(e));
	setTimeout(async () => { await interaction[met.l].catch(e => log.err(e)) }, 5000);
}