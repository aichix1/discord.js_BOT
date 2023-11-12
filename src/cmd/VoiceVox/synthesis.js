const { src } = process.env;
import fs from 'fs';
import yaml from 'js-yaml';
import { setTimeout } from 'timers/promises';
import { execSync } from 'child_process';
import { translate } from 'google-translate-api-x';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Collection, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getVoiceConnection, createAudioResource, createAudioPlayer, NoSubscriberBehavior, StreamType }
	from '@discordjs/voice';
const { writeFile, idDel } = import(src + 'events/msgCreate.js');
const { rng } = await import(src + 'cmd/utility/rng.js');
const { Logger } = await import(src + 'function/logger.js');
const { dictImport } = await import(src + 'function/dictImport.js');
const join = (await import(src + 'cmd/utility/join.js')).execute;
const met = (await import(src + 'list/met.js')).interaction;

const default_voice = 12;
const dict2 = await dictImport(process.env.data + 'list/presets.yaml');

export const data = new SlashCommandBuilder()
	.setName('synthesis')
	.setDescription('synthesis')
	.setDescriptionLocalizations({ ja: '音声合成' })
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addStringOption(option => option
		.setName('msg')
		.setDescription('input message.')
		.setDescriptionLocalizations({ ja: 'メッセージを入力' })
		.setMaxLength(100)
		.setRequired(true))
	.addIntegerOption(option => option
		.setName('voice')
		.setDescription('voice ID')
		.setDescriptionLocalizations({ ja: 'ボイスID' })
		.setMinValue(0)
		.setMaxValue(66))
	.addIntegerOption(option => option
		.setName('preset')
		.setDescription('presets ID')
		.setDescriptionLocalizations({ ja: 'プリセットID' })
		.setMinValue(0)
		.setMaxValue(166))
	.addBooleanOption(option => option
		.setName('delete')
		.setDescription('delete')
		.setDescriptionLocalizations({ ja: '削除' }));

export const cooldown = 2;
export const name = 'synthesis';
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	await interaction[met.f]({ ephemeral: true }).catch(e => log.err(e));
	const { convCom } = await import (src + 'events/msgCreate.js');
	const { ids } = client.var2;
	const { id } = interaction;
	ids[0].set(id, 0);
	const channelId = interaction.channelId;
	if (ids[1][channelId] === undefined) ids[1][channelId] = new Collection;
	ids[1][channelId].set(id, 0);
	client.var.dict = client.var.dict ?? await dictImport(null);
	if (client.var.dict == null) return;
	const list = new Object;
	for (const li of interaction.options._hoistedOptions) list[li.name] = li.value;
	const d = await convCom(client, ' ', list.msg, true, false);
	await tts(interaction, client, channelId, id, null, d.a);
	if (list.delete || list.delete === undefined) await interaction[met.lr]().catch(e => null);
}

export async function hanZen(str) {
	const log = new Logger('hanZen');
	try {
		str = str.replace(/[Ａ-Ｚ０-９]/ig, s => {
			return String.fromCharCode(s.codePointAt(0) - 0xFEE0);
		});
		return str.toLowerCase();
	} catch (e) { log.err(e) }
}

export async function tts(interaction, client, channelId, id, user, msg) {
	const log = new Logger('tts');
	const { ids, lock } = client.var2;
	const { set } = client.var.dict;
	const voice = set?.[user]?.voice ?? default_voice;
	const preset = set?.[user]?.preset ?? default_voice;
	const volume = set?.[user]?.volume ?? 1;
	const msg2 = msg.replace(/[ぁ-んァ-ンヴーｧ-ﾝﾞﾟ-]/g, '');
	const pre = dict2.filter(v => { if (v.id === preset) return v.speedScale });
	const spd = pre[0].speedScale;
	const time = Math.round(((msg.length - msg2.length) * 1 + msg2.length * 1.8) * spd * 190);
	const url = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURI(msg)}&speaker=${voice}`;
	while (lock[0] || id !== [...ids[0].keys()][0]) await setTimeout(100);
	lock[0] = true;
	try {
		let url2;
		try { url2 = (await client.rpc.request({ url: url })).data; }
		catch (e) {
			await setTimeout(e.response.data.retryAfter * 1000 + 1000);
			url2 = (await client.rpc.request({ url: url })).data;
			log.err(e.response.data.retryAfter, msg.slice(0, 20));
		}
		lock[0] = false;
		ids[0].delete(id);
		if (url2 != null) await play(interaction, client, channelId, id, msg, url2.mp3StreamingUrl, null, time);
	} catch (e) { log.err(e); await idDel(client, channelId, id); }
	ids[1][channelId].delete(id);
}

export async function tts2(interaction, client, channelId, id, user, msg, msg3) {
	const log = new Logger('tts2');
	const { ids } = client.var2;
	ids[0].delete(id);
	try {
		const type = await rng(0, 5) !== 0 ? 0 : 1;
		const cmdT = type === 0 ? 'edge-tts --text' : 'gtts-cli';
		const path = process.env.data + `sounds/${id}.mp3`;
		const out = (type === 0 ? ' --write-media ' : ' --output ') + path;
	
		const proxys = ['https://hidester.com/proxy/', 'http://168.63.76.32:3128'];
		const agent = new HttpsProxyAgent(await rng(proxys));
		const ls = await dictImport(process.env.data + 'list/edge.yaml');
		const res = await translate(msg3, { to: 'en', requestOprions: { agent: agent } });
		const l = await rng(ls[res.from.language?.iso] ?? ls.en);
		const isJA = res.from.language?.iso === 'ja';
		const { edgeTts } = client.var.dict;
		const spd = edgeTts[isJA]?.spd;
		const vol = edgeTts[isJA]?.vol;
		const opt = type === 0 ? (` --voice ${l} --volume=${vol ?? 0}% --rate=+${spd ?? 0}%`) : '';
		
		const vtt =  type === 0 ? ` --write-subtitles ${process.env.data}list/vtt.vtt` : '';
		const cmd = `${cmdT} "${isJA ? msg : (msg3 !== '' ? msg3 : msg)}"${out}${opt}${vtt}`;
		await execSync(cmd, (error, stdout) => null);
		const sounds = fs.readFileSync(path);
		const time = sounds.length / (type === 0 ? 6 : 4);
		await play(interaction, client, channelId, id, msg, path, null, time, type === 0 ? l : 1);
		fs.unlinkSync(path);
	} catch (e) { log.err(e) }
	ids[1][channelId].delete(id);
}

export async function play(interaction, client, channelId, id, msg, path, volume, time, l) {
	const log = new Logger('play');
	const { ids, lock, player, connect } = client.var2;
	if (!player[channelId])
		player[channelId] = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
	let resource;
	if (volume !== null) {
		resource = createAudioResource(path, { inlineVolume: true });
		resource.volume.setVolume(volume);
	} else resource = createAudioResource(path, { inputType: StreamType.Arbitrary });
	
	if (lock[1][channelId] === undefined) lock[1][channelId] = false;
	while (id !== [...ids[1][channelId]?.keys()][0] || lock[1][channelId])
		await setTimeout(100);
	lock[1][channelId] = true;
	ids[1][channelId].delete(id);
	player[channelId].play(resource);
	
	await getConnection(interaction, client, interaction.guild.id, channelId);
	for (let n = 0; n < 2; n++) {
		try { connect[channelId].subscribe(player[channelId]); break; }
		catch (e) {
			if (n === 2) log.err(e); else await getConnection(interaction, client, interaction.guild.id, channelId) }
	}

	const isTTS = l != null;
	const model = isTTS ? `model: ${l ?? ''}` : '';
	const time2 = String((time / 1000).toFixed(1)).padStart(4, ' ');
	log.info(`len:${ids[1][channelId].size}, t:${time2}[s], ${model}\n${msg}`);
	
	await setTimeout(time + 2000);
	lock[1][channelId] = false;
}

async function getConnection(interaction, client, guildId, channelId) {
	const log = new Logger('getConnec');
	const { connect } = client.var2;
	try {
		connect[channelId] = getVoiceConnection(guildId, channelId);
		if (connect[channelId]?._state.status !== 'ready')
			await join(interaction, client, channelId, true);
	} catch (e) { log.err(e) }
}