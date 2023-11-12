import { setTimeout } from 'timers/promises';
import { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
const { Logger } = await import(process.env.src + 'function/logger.js');

export const data = new SlashCommandBuilder()
	.setName('calc')
	.setDescription('Generates a calculator!')
	.setDescriptionLocalizations({ ja: '電卓' })
	.addBooleanOption(option => option
		.setName('ephemeral')
		.setDescription('Whether it\'s visible or not to other people')
		.setDescriptionLocalizations({ ja: '一時的' })
		.setRequired(true));

export const cooldown = 3;
export const name = 'calc';
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	const ephemeral = interaction.options.getBoolean('ephemeral');
	if (!interaction.channel) return interaction.reply({ content: msg[0], ephemeral: true });
	const l = interaction.locale;
	if (interaction.channel.viewable || interaction.channel.sendable)
		try {
			interaction.reply({ content: '``` ```', components, ephemeral: ephemeral });
			const filter = (b) => b.customId.indexOf('_calc') !== -1;
			const collector = interaction.channel
				.createMessageComponentCollector({ componentType: 'BUTTON', time: 15 * 60 * 1000, filter });
		}
		catch (e) {
			log.err(e);
			interaction.reply({ content: msg[l][3], ephemeral: true });
		}
	else try { interaction.reply({ content: msg[l][0], ephemeral: true }) } catch { null }
}

export const components = new Array;
components[0] = new ActionRowBuilder().addComponents([
	new ButtonBuilder().setLabel('1').setStyle(1).setCustomId('1_calc'),
	new ButtonBuilder().setStyle(1).setCustomId('2_calc').setLabel('2'),
	new ButtonBuilder().setStyle(1).setCustomId('3_calc').setLabel('3'),
	new ButtonBuilder().setStyle(1).setCustomId('+_calc').setStyle(3).setLabel('+'),
]);
components[1] = new ActionRowBuilder().addComponents([
	new ButtonBuilder().setLabel('4').setStyle(1).setCustomId('4_calc'),
	new ButtonBuilder().setStyle(1).setCustomId('5_calc').setLabel('5'),
	new ButtonBuilder().setStyle(1).setCustomId('6_calc').setLabel('6'),
	new ButtonBuilder().setStyle(1).setCustomId('/_calc').setStyle(3).setLabel('/'),
]);
components[2] = new ActionRowBuilder().addComponents([
	new ButtonBuilder().setLabel('7').setStyle(1).setCustomId('7_calc'),
	new ButtonBuilder().setStyle(1).setCustomId('8_calc').setLabel('8'),
	new ButtonBuilder().setStyle(1).setCustomId('9_calc').setLabel('9'),
	new ButtonBuilder().setStyle(1).setCustomId('*_calc').setStyle(3).setLabel('*'),
]);
components[3] = new ActionRowBuilder().addComponents([
	new ButtonBuilder().setLabel('.').setStyle(1).setCustomId('._calc'),
	new ButtonBuilder().setStyle(1).setCustomId('0_calc').setLabel('0'),
	new ButtonBuilder().setStyle(3).setCustomId('=_calc').setLabel('='),
	new ButtonBuilder().setStyle(1).setCustomId('-_calc').setStyle(3).setLabel('-'),
]);
components[4] = new ActionRowBuilder().addComponents([
	new ButtonBuilder().setLabel('(').setStyle(3).setCustomId('(_calc'),
	new ButtonBuilder().setStyle(3).setCustomId(')_calc').setLabel(')'),
	new ButtonBuilder().setStyle(4).setCustomId('c_calc').setLabel('C'),
	new ButtonBuilder().setCustomId('e_calc').setStyle(4).setLabel('<=='),
]);

export const msg = {
	en: [
		'Unable to use this command. This could have been caused from using the command in a private channel, ' +
		'a private thread or a public thread inside a private channel.',
		'Even a 3rd grader would know that this is an invalid operation 😐',
		'Sorry, But humans haven\'t evolved to the point of calculating nothingness yet..',
		'Ran into problems while executing this command:\n'
	],
	ja: [
		'コマンド使用不可、プライベートチャネル・スレッド・チャネル内の公開スレッドでコマンド使用が原因',
		'無効な操作', '解無し', 'コマンド実行エラー'
	]
};