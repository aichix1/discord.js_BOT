const { src } = process.env;
import fs from 'fs';
import yaml from 'js-yaml';
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Tokyo');
import { setTimeout } from 'timers/promises';
import { Collection, Events } from 'discord.js';
const { Logger } = await import(src + 'function/logger.js');
const { dictImport } = await import(src + 'function/dictImport.js');
const { hanZen, tts, tts2 } = await import(src + 'cmd/VoiceVox/synthesis.js');
const { convCom, writeFile, isOn, idDel } = await import(src + 'events/msgCreate.js');


export const name = Events.VoiceStateUpdate;
export async function execute(oldState, newState, client) {
	const log = new Logger(this.name);
	await setTimeout(1000);
	const { ids } = client.voiceVox;
	const user = newState.member.user.username;
	const li = ['serverDeaf', 'serverMute', 'selfDeaf', 'selfMute', 'selfVideo', 'streaming'];
	const bool = li.map(v => { return oldState[v] === newState[v]; });
	const [bool1, bool2] = bool.reduce((pre, cur) => { return [pre[0] && cur, pre[1] || cur]; }, [true, false]);
	if (!bool1 && bool2 ||
		(oldState.channelId === newState.channelId && oldState.suppress === newState.suppress &&
		oldState.requestToSpeakTimestamp === null && newState.requestToSpeakTimestamp === null)) return;
	const interaction = newState.channelId !== null ? newState : oldState;
	const channelId = interaction.channel.id;
	await voiceState(oldState, newState, client, channelId, user);
	if (interaction.member.user.bot) return;
	client.var.dict = client.var.dict ?? await dictImport(null);
	if (client.var.dict == null) return;
	const msg = await io(oldState, newState);

	if (ids[1][channelId] === undefined) ids[1][channelId] = new Collection;
	const id = interaction.id + moment().format('hhmmssSS');
	await writeFile(user, msg, true);
	const flag2 = await isOn(interaction, client, channelId);
	const d = await convCom(client, user, msg, false, true);
	
	if (flag2 && !/aichix[1-2]/gu.test(user)) {
		ids[0].set(id, 0);
		ids[1][channelId].set(id, 0);
		if (!/aichix3/.test(user)) interaction.channel.send(d.a).catch(e => log.err(e));
		//await tts(interaction, client, channelId, id, user, msg);
		await tts2(interaction, client, channelId, id, user, d.a, d.c);
	}
}


async function io(o, n) {
	return 'さん' + (o.channelId === null || n.channelId === null ?
		('が' + (o.channelId === null ? '入室し' : '退室し')) :
		(!n.suppress ? 'がスピーカー' + (n.requestToSpeakTimestamp == null ? 'になり' : 'に招待され') :
			(!o.suppress ? 'がスピーカー' + (o.requestToSpeakTimestamp === null ? 'から降り' : 'を辞退し') :
				(o.requestToSpeakTimestamp === null ? 'がスピーカーをリクエストし' : 'のスピーカーリクエストを取り下げ')))) + 'ました';
}

async function voiceState(o, n, client, channelId, user) {
	const log = new Logger('voiceState');
	try {
		const { speaker, audience } = client.voiceVox;
		if (!speaker[channelId]) speaker[channelId] = new Collection;
		if (!audience[channelId]) audience[channelId] = new Collection;
		if (o.channelId === null && n.channelId !== null) await voiceState2(client, channelId, o.id, user, 0, 1);
		else if (o.channelId !== null && n.channelId === null) await voiceState2(client, channelId, o.id, user, 0, 0);
		else if (n.requestToSpeakTimestamp !== null || (o.requestToSpeakTimestamp !== null || o.suppress && n.suppress))
			return;
		else if (!n.suppress) await voiceState2(client, channelId, o.id, user, 1, 0);
		else await voiceState2(client, channelId, o.id, user, 0, 1);
	} catch (e) { log.err(e) }
}

async function voiceState2(client, channelId, id, user, f1, f2) {
	const log = new Logger('voiceState2');
	try {
		const { speaker, audience } = client.voiceVox;
		speaker[channelId][f1 ? 'set' : 'delete'](user, id);
		audience[channelId][f2 ? 'set' : 'delete'](user, id);
	} catch (e) { log.err(e) }
}