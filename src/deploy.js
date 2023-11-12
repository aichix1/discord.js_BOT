const { src } = process.env;
process.env.TZ = 'Asia/Tokyo';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { setTimeout } from 'timers/promises';
import { REST, Routes } from 'discord.js';
const { Logger } = await import(process.env.src + 'function/logger.js');
const log = new Logger('deploy');
const env = yaml.load(process.env.Discord);
const token = env.Bot.Token;
const clientId = env.Bot.Id;
const guildId = env.Guild;
const rest = new REST().setToken(token);
const cmds = new Array;
const gCmds = new Array;
const foPath = src + 'cmd';
const cmdFolders = fs.readdirSync(foPath);

for (const folder of cmdFolders) {
	const cmdsPath = foPath + '/' + folder;
	const cmdFiles = fs.readdirSync(cmdsPath).filter(file => file.endsWith('.js'));
	for (const file of cmdFiles) {
		const cmd = await import(cmdsPath + '/' + file);
		if ('data' in cmd && 'execute' in cmd) {
			if (folder == 'management') cmds.push(cmd.data.toJSON());
			else gCmds.push(cmd.data.toJSON());
		} else log.info( `[WARNING] The cmd at ${file} is missing a required "data" or "execute" property.`);
	}
}

async function guild() {
	const log = new Logger('guild');
	const cmds2 = cmds.concat(gCmds);
	log.info(`ID: ${guildId}`);
	await del();
	await del(0);
	await deploy(cmds2, 0);
}

async function global() {
	const log = new Logger('global');
	log.info(`ID: ${guildId}`);
	await del();
	await del(0);
	await deploy(cmds, 0, true);
}

async function deploy(cmds, n, flag) {
	if (flag && 0 < gCmds.length) {
		try {
			log.info(`Start refresh ${gCmds.length} (/) Global cmd`);
			const data2 = await rest.put(Routes.applicationCommands(clientId), { body: gCmds });
			log.info(`Success reload ${data2.length} (/) Global cmd`);
		} catch (e) { log.err(e); }
		await setTimeout(3000);
	}
	if (cmds.length === 0) return;
	try {
		if (!guildId[n]) return;
		log.info(`Start refresh ${ cmds.length } (/) Guild cmd`);
		const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId[n]), { body: cmds });
		log.info(`Success reload ${ data.length } (/) Guild cmd`);
	} catch (e) { log.err(e); }
	await setTimeout(3000);
}

async function del(n, cmdId) {
	const log = new Logger('del');
	if (!(!n || guildId?.[n])) return;
	const msg1 = (n != null ? `Guild${n}` : 'Global') + ' cmd';
	const msg2 = 'Success delete ' + (!cmdId ? 'all ' : '') + msg1;
	const rt = `/applications/${clientId}${guildId?.[n] == null ? '' : '/guilds/' + guildId[n]}` +
							`/commands${!cmdId ? '' : '/' + cmdId}`;
	log.info('Start delete ' + (!cmdId ? 'all ' : '') + msg1);
	await rest[!cmdId ? 'put' : 'delete'](rt, {body: []}).then(() => log.info(msg2)).catch(console.error);
	await setTimeout(3000);
}

(async () => {
	await guild();
	//await global();
})();