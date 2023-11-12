const { src } = process.env;
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Tokyo');
process.env.TZ = 'Asia/Tokyo';
import gaxios from 'gaxios';
gaxios.instance.defaults = { proxy: false };
const env = yaml.load(process.env.Discord);
const token = env.Bot.Token;
import { Client, Collection, GatewayIntentBits } from 'discord.js';
const { Guilds, GuildMessages, GuildMembers, MessageContent, GuildVoiceStates,
	GuildMessageReactions, GuildPresences } = GatewayIntentBits;
const intents = [Guilds, GuildMessages, GuildMembers, MessageContent, GuildVoiceStates,
	GuildMessageReactions,  GuildPresences];
const client = new Client({ intents: intents });
const { Logger } = await import(src + 'function/logger.js');
const { dictImport } = await import(src + 'function/dictImport.js');
const { tpc } = await import(src + 'function/topic.js');
import { expressRun as express } from './function/express.js';
const log = new Logger('BOT');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = await import('file:' + path.join(eventsPath, file));
	if (event.once) client.once(event.name, async (...args) => await event.execute(...args, client));
	else client.on(event.name, async (...args) => await event.execute(...args, client));
}

client.webhooks = new Map;
client.rpc = gaxios;
client.var = new Object;
client.var2 = {
	lock: [false, new Object],
	connect: new Object, player: new Object,
	ids: [new Collection, new Object],
	userPre: new Object, speaker: new Object, audience: new Object };

client.cools = new Collection();
client.cmds = new Collection();

const foldersPath = path.join(__dirname, 'cmd');
const cmdFolders = fs.readdirSync(foldersPath);
for (const folder of cmdFolders) {
	const cmdsPath = path.join(foldersPath, folder);
	const cmdFiles = fs.readdirSync(cmdsPath).filter(file => file.endsWith('.js'));
	for (const file of cmdFiles) {
		const filePath = path.join(cmdsPath, file);
		const cmd = await import('file:' + filePath);
		if ('data' in cmd && 'execute' in cmd) client.cmds.set(cmd.data.name, cmd);
		else log.warning(` ${filePath} is missing`);
	}
}

client.login(token);
await express(client);

cron.schedule('0 3,13,23,33,43,53 * * * *', async () => {
	const log = new Logger('cron_topic');
	moment.tz.setDefault('Asia/Tokyo');
	const dict = await dictImport(data + 'list/dict.yaml');
	if (dict === null) return;
	const topics = dict.topics[moment().hour()];
	if (topics === undefined) return;
	await tpc(client, topics).catch(e => log.info('err: ', e));
});

cron.schedule('*/30 * * * * *', async () => {
	const log = new Logger('cron_express');
	const us = ['https://', '.repl.co/'];
	const { subs } = process.env;
	for (const [i, s] of subs.entries())
		client.rpc.request({ baseURL: us[0] + s, url: us[1] })
			//.catch(() => null)
			.catch(async e => { if (i === 1) await express(client) });
});