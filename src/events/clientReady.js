import { Events } from 'discord.js';
const { Logger } = await import(process.env.src + 'function/logger.js');
import yaml from 'js-yaml';
const env = yaml.load(process.env.Discord);

export const name = Events.ClientReady;
export const once = true;
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	log.info(`Ready! Logged in as ${client.user.tag}`);
	await client.channels.resolve(env.Stage)?.send('startup');
}