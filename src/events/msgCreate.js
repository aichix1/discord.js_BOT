const { src, data } = process.env;
import fs from 'fs';
import yaml from 'js-yaml';
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Tokyo');
import { setTimeout } from 'timers/promises';
import { Collection, Events } from 'discord.js';
const { Logger } = await import(src + 'function/logger.js');
const { dictImport } = await import(src + 'function/dictImport.js');
const { hanZen, tts, tts2 } = await import(src + 'cmd/VoiceVox/synthesis.js');
const { sendMsg } = await import(src + 'function/sendMsg.js');
const { rng } = await import(src + 'cmd/utility/rng.js');
const met = (await import(src + 'list/met.js')).interaction;
const fd = fs.openSync(data + 'log/chat.txt', 'a');
const env = yaml.load(process.env.Discord);

export const name = Events.MessageCreate;
export async function execute(interaction, client) {
	const log = new Logger('msgCreate');
	const { ids, lock, userPre, speaker } = client.var2;
	const channelId = interaction.channelId;
	const channelType = interaction.channel.type;
	const user = interaction.member?.user?.username;
	if (interaction.type === 29) return await interaction.delete().catch(e => null).then(e => { return });
	if (channelType === 5 && interaction.guild.id === env.Guild)
		await interaction.crosspost().catch(e => log.info(e?.rawError?.message)).then(e => { return });
	const authorBot = interaction.author.bot;
	const content = interaction.cleanContent;
	if ((!user || channelType !== 13 || authorBot) && content !== 'startup') return;
	const id = interaction.id;
	await stageMember(interaction, client, channelId);
	client.var.dict = client.var.dict ?? await dictImport(null);
	if (client.var.dict == null) return;
	
	const d = await convCom(client, user, content, user === userPre[channelId], false);
	if (/(?:test|テスト|startup)$/.test(d.b) && interaction.type !== 31)
		(async () => await interaction[met.l]()
			.catch(e => log.err(e?.rawError?.message ?? e?.rawError ?? e)))();
	
	if (/^!calc/.test(content)) return calc(interaction, client, content.replace(/^!calc ?/, ''));
	if (env.Stage !== channelId) return;
	const atch = interaction.attachments;
	const f1 = (key => { return [atch.get(key).url, atch.get(key).proxyURL]; });
	const [url, proxyURL] = atch.size ? f1([...atch.keys()][0]) : [null, null];
	await writeFile(user, `${content}${0 < atch.size ? `\n${url}\n${proxyURL}` : ''}`, true);
	
	if (ids[1][channelId] === undefined) ids[1][channelId] = new Collection;
	ids[0].set(id, 0);
	ids[1][channelId].set(id, 0);
	userPre[channelId] = user;
	const isJA = (/[\p{sc=Hira}\p{sc=Kana}]/gu.test(d.b));
	if (!isJA || lock[0]) await tts2(interaction, client, channelId, id, user, d.a, d.c);
	else await tts(interaction, client, channelId, id, user, d.a);
}

export async function writeFile(user, msg, path) {
	const log = new Logger('writeFile');
	const date = moment().format('YYYY/MM/DD HH:mm:ss');
	const file = path === true ? fd : fs.openSync(path, 'a');
	try { fs.writeSync(file, `${date}\t${user !== null ? `${user}\t` : ''}${msg}\n`); }
	catch (e) { log.err(e.message); }
}

export async function convCom(client, user, txt, flag, flag2) {
	const log = new Logger('convCom');
	//log.info(client);
	client.var.name = client.var.name ?? await dictImport(data + 'list/name.yaml');
	if (client.var.name == null) return;
	const { dict, name } = client.var;
	const a = await convMsg(client, dict[user] === undefined ? user : await rng(name[user]));
	const d = await convMsg(client, txt === '' ? '画像添付' : txt);
	const msg = (!flag || flag2 ? a.b : '') + (!flag && !flag2 ? ' ' : '') + d.b;
	return { u: a.b, a: msg, b: d.b, c: d.c };
}

async function convMsg(client, txt) {
	const log = new Logger('convMsg');
	const { dict, name } = client.var;
	try {
		txt = await hanZen(txt);
		for (const li of name.name) txt = txt.replace(new RegExp(li[0], 'gi'), li[1]);
		txt = txt.replace(/\p{ExtPict}/gu, '');
		txt = txt.replace(/\n/g, '\\n');
		for (const li of dict.sym) txt = txt.replace(RegExp(li, 'giu'), '');
		for (const li of dict.symbol) txt = txt.replace(new RegExp(li, 'gi'), '');
		for (const li of dict.del) txt = txt.replace(new RegExp(li, 'gi'), '');
		for (const li of dict.dict) txt = txt.replace(new RegExp(li[0], 'gi'), li[1]);
		for (const li of dict.script)
			txt = txt.replace(new RegExp(li[0].replace(/\\sc/gius, '(?!\\p{Alpha})'), 'gisu'), li[1]);
	} catch (e) { log.err(e); }
	const txt2 = await repeat(txt.length < 70 ? txt : (txt.slice(0, 70) + '、以下略'));
	return { b: txt2, c: txt };
}

export async function idDel(client, channelId, id) {
	const log = new Logger('idDel');
	try {
		const { ids } = client.var2;
		ids[0].delete(id);
		ids[1][channelId].delete(id);
	} catch (e) { log.err(e); }
}

async function stageMember(interaction, client, channelId) {
	const log = new Logger('stageMember');
	const { speaker, audience } = client.var2;
	if (!speaker[channelId]) speaker[channelId] = new Collection;
	if (!audience[channelId]) audience[channelId] = new Collection;
	try {
		const members = await interaction.member.voice.channel?.members;
		if (members == null) return;
		for (const member of members.keys()) {
			const VoiceState = (await interaction.guild.members.fetch(member)).voice;
			if (!VoiceState.suppress) speaker[channelId].set(members.get(member).user.username, member);
			else audience[channelId].set(members.get(member).user.username, member);
		}
	} catch (e) { log.err(e) }
}

async function repeat(txt) {
	const log = new Logger('repeat');
	const txt2 = txt;
	for (let i = 0; i < txt2.length; i++)
		for (let j = i + 2; j < txt2.length - 2; j++)
			try { txt = txt.replace(new RegExp(`(${txt.slice(i, j).replace(/[.+?*\\]/, '')}){3,}`, 'ig'), '$1$1'); }
			catch (e) { log.err(e) }
	return txt;
}

async function calc(interaction, client, str) {
	const log = new Logger('calc');
	const str0 = str;
	try {
		if (/[^0-9+\-*/^\.]/.test(str)) return;
		while (str.includes('^')) {
			const n = str.search(/\^/);
			const a = [str.substr(0, n), str.substr(n + 1)];
			const b1 = a[0].replace(/(Math\..*)?[0-9\.]{1,}\)?$/, '');
			const b2 = a[0].replace(/.*(?=(Math\.[a-z]{1,})?[0-9\.]{1,}\)?)$/, '');
			const b3 = a[1].replace(/(?<=^[0-9\.]{1,}).*/, '');
			const b4 = a[1].replace(/^[0-9\.]{1,}/, '');
			str = b1 + 'Math.pow(' + b2 + ', ' + b3 + ')' + b4;
		}
		log.info(str);
		const result = str0 + ' = ' + eval(str).toString();
		const name = interaction.member?.displayName;
		const iconUrl = interaction.author.displayAvatarURL({ format: 'png' });
		await interaction.delete();
		try { await sendMsg(interaction, client, name, iconUrl, null, result) } catch (e) { log.err(e); }
	} catch (e) { log.err(e); await client.channels.resolve(interaction.channel.id)?.send('無効な計算') }
}