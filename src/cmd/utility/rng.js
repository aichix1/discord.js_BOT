const { src } = process.env;
import { SlashCommandBuilder } from 'discord.js';
const { Logger } = await import(src + 'function/logger.js');
const { sendMsg } = await import(src + 'function/sendMsg.js');
const met = (await import(src + 'list/met.js')).interaction;

export const data = new SlashCommandBuilder()
	.setName('rng')
	.setDescription('Random Number Generator')
	.setDescriptionLocalizations({ ja: '乱数生成' })
	.addIntegerOption(option => option
		.setName('quantity')
		.setDescription('quantity')
		.setDescriptionLocalizations({ ja: '数' })
		.setMinValue(1)
		.setMaxValue(100)
		.setRequired(true))
	.addIntegerOption(option => option
		.setName('max')
		.setDescription('Max Number')
		.setDescriptionLocalizations({ ja: '最大値' })
		.setMinValue(2)
		.setMaxValue(100)
		.setRequired(true));

export const cooldown = 1;
export const name = 'RNG';
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	try {
		await interaction[met.f]({ ephemeral: true });
		await interaction[met.lr]()
	} catch (e) { log.err(e); }
	const max = interaction.options.getInteger('max');
	const quantity = interaction.options.getInteger('quantity') ?? 1;
	const arr = new Array;
	for (let n = 0; n < quantity; n++) arr.push(String(await getRandomInt(1, max)));
	const content = `${quantity}D${max} => ${arr.join(',  ')}`;
	const iconUrl = interaction.user.displayAvatarURL({ format: 'png' });
	const name = interaction.member?.displayName;
	try { await sendMsg(interaction, client, name, iconUrl, null, content); } catch (e) { log.err(e); }
}

export async function getRandomInt(min, max) {
	return Math.floor(Math.random() * (Math.floor(max + 1) - Math.ceil(min)) + Math.ceil(min));
}

export async function rng(min, max) {
	if (Array.isArray(min)) return min[Math.floor(Math.random() * min.length)];
	else if (typeof min === 'object') {
		const keys = Object.keys(min);
		return min[keys[Math.floor(Math.random() * keys.length)]];
	} else return Math.floor(Math.random() * (max - min + 1) + min);
}