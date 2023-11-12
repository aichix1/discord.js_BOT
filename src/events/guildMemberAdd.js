import yaml from 'js-yaml';
import { Events } from 'discord.js';
const { Logger } = await import(process.env.src + 'function/logger.js');
const env = yaml.load(process.env.Discord);

export const name = Events.GuildMemberAdd;
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	if (interaction.guild.id !== env.Guild) return;
	try {
		const isBOT = interaction.user.bot;
		await interaction.roles.add(interaction.guild.roles.cache.get(env.Role[isBOT ? 'BOT' : 'UnAuthorized']));
	} catch (e) { log.err('[Error] Auto role Error'); }
}