import { Events } from 'discord.js';
const { Logger } = await import(process.env.src + 'function/logger.js');

export const name = 'modalSubmit';
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	const arr = new Array;
	for (const k of interaction.fields.fields) arr[k[0]] = k[1].value;
	log.info(arr);
}