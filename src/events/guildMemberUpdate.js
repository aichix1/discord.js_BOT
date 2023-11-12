import yaml from 'js-yaml';
import { Events } from 'discord.js';
const { Logger } = await import(process.env.src + 'function/logger.js');
const env = yaml.load(process.env.Discord);
const roles = env.Role;

export const name = Events.GuildMemberUpdate;
export async function execute(oldMember, newMember, client) {
	const log = new Logger(this.name);
	if (newMember.guild.id !== env.Guild) return;
	if (oldMember._roles.length === newMember._roles.length) return;
	if (oldMember._roles.length < newMember._roles.length) {
		try {
			const roleId = newMember._roles.filter(i => oldMember._roles.indexOf(i) === -1)[0];
			const unAuthorized = newMember.guild.roles.cache.get(roles.UnAuthorized);
			const isUnAuthorized = newMember._roles.filter(i => i === unAuthorized.id).length === 1;
			const authorized = newMember.guild.roles.cache.get(roles.Authorized);
			const isAuthorized = newMember._roles.filter(i => i === authorized.id).length === 1;
			switch (roleId) {
				case roles.Owner:
				case roles.Administrator:
				case roles.Moderator:
				case roles.Stage:
					if (!isAuthorized) await newMember.roles.add(authorized).catch(e => log.err(e));
				case Roles.Authorized:
					if (isUnAuthorized) await newMember.roles.remove(unAuthorized).catch(e => log.err(e));
			}
		} catch (e) { log.info(e) }
	} else {
		try {
			const roleId = oldMember._roles.filter(i => newMember._roles.indexOf(i) == -1)[0];
			const roleName = newMember.guild.roles.cache.find(role => role.id === roleId).name;
		} catch (e) { log.info(e) }
	}
}