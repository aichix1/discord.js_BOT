const { src } = process.env;
import fs from 'fs';
import yaml from 'js-yaml';
import { setTimeout } from 'timers/promises';
import { PythonShell } from 'python-shell';
import { translate } from 'google-translate-api-x';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
const { Logger } = await import(src + 'function/logger.js');
const { dictImport } = await import(src + 'function/dictImport.js');
const { rng } = await import(src + 'cmd/utility/rng.js');
const la = (await import (src + 'list/language.js')).default;
const met = (await import(src + 'list/met.js')).interaction;
const path1 = process.env.data + 'trans/data1.yaml';
const path2 = process.env.data + 'trans/data2.yaml';
const errMsg = ['[Error] Json Read', '[Error] Time Out', '[Error] Data None'];

export const data = new SlashCommandBuilder()
	.setName('t')
	.setDescription('Translate')
	.setDescriptionLocalizations({ ja: '翻訳' })
	.addStringOption(option => option
		.setName('msg')
		.setDescription('input message. Input \n for a line break')
		.setDescriptionLocalizations({ ja: 'メッセージを入力 改行は\\nを入力' })
		.setMaxLength(1000)
		.setRequired(true))
	.addStringOption(option => option
		.setName('src')
		.setDescription('Source Language')
		.setDescriptionLocalizations({ ja: 'ソース言語' })
		.addChoices(
			{ name: la.ja, value: 'ja' }, { name: la.en, value: 'en' }, { name: la.de, value: 'de' },
			{ name: la.fr, value: 'fr' }, { name: la.it, value: 'it' }, { name: la.nl, value: 'nl' },
			{ name: la.la, value: 'la' }, { name: la.el, value: 'el' }, { name: la.fi, value: 'fi' },
			{ name: la.ru, value: 'ru' }, { name: la.id, value: 'id' }, { name: la.vi, value: 'vi' },
			{ name: la.ms, value: 'ms' }, { name: la.ko, value: 'ko' },
			{ name: la.zh_CN, value: 'zh-CN' }, { name: la.zh_TW, value: 'zh-TW' }
		))
	.addStringOption(option => option
		.setName('dest')
		.setDescription('Target Language')
		.setDescriptionLocalizations({ ja: 'ターゲット言語' })
		.addChoices(
			{ name: la.ja, value: 'ja' }, { name: la.en, value: 'en' }, { name: la.de, value: 'de' },
			{ name: la.fr, value: 'fr' }, { name: la.it, value: 'it' }, { name: la.nl, value: 'nl' },
			{ name: la.la, value: 'la' }, { name: la.el, value: 'el' }, { name: la.fi, value: 'fi' },
			{ name: la.ru, value: 'ru' }, { name: la.id, value: 'id' }, { name: la.vi, value: 'vi' },
			{ name: la.ms, value: 'ms' }, { name: la.ko, value: 'ko' },
			{ name: la.zh_CN, value: 'zh-CN' }, { name: la.zh_TW, value: 'zh-TW' }
		))
	.addUserOption(option => option
		.setName('user')
		.setDescription('Mention User')
		.setDescriptionLocalizations({ ja: 'ユーザーメンション' }))
	.addRoleOption(option => option
		.setName('role')
		.setDescription('Mention Role')
		.setDescriptionLocalizations({ ja: 'ロールメンション' }))
	.addStringOption(option => option
		.setName('url1')
		.setDescription('URL Enter "\\n" to break a line and multiple links are possible')
		.setDescriptionLocalizations({ ja: 'URL 「\\n」の入力で改行し複数リンクも可' }))
	.addStringOption(option => option
		.setName('url2')
		.setDescription('URL Enter "\\n" to break a line and multiple links are possible')
		.setDescriptionLocalizations({ ja: 'URL 「\\n」の入力で改行し複数リンクも可' }))
	.addStringOption(option => option
		.setName('module')
		.setDescription('Translation module')
		.setDescriptionLocalizations({ ja: '翻訳モジュール' })
		.addChoices({ name: 'Python', value: '0' }, { name: 'JavaScript', value: '1' }));

export const cooldown = 6;
export async function execute(interaction, client) {
	const log = new Logger('t');
	//try { await interaction.deferReply({ ephemeral: true }) }
	try { await interaction[met.f]({ ephemeral: true }) }
	catch (e) { return log.err(e?.rawError?.message, '\n', e?.requestBody) }
	const txt = await Align(interaction.options._hoistedOptions, interaction.id, 0);
	const [embed, error] = await Translate(txt, interaction);
	if (error === 1 || error === 2) return await interaction[met.e](errMsg[error - 1]).catch(e => log.err(e));
	else if (!embed) return await interaction[met.e](errMsg[2]).catch(e => log.err(e));
	const ok = new ButtonBuilder()
		.setCustomId(`Translate<TAB>Publish<TAB>${interaction.id}`)
		.setLabel('Publish')
		.setStyle(ButtonStyle.Success);
	const row = [new ActionRowBuilder().addComponents(ok)];
	await interaction.editReply({ embeds: embed, components: row })
		.catch(e => interaction.reply({ embeds: embed, components: row })
		.catch(e => log.err(e)));
}


export async function TranslatePre(txt, id) {
	const log = new Logger('translatePre');
	txt = await lang(txt);
	return (await trans(txt, txt.src, txt.dest)).text;
}

async function Align(txt, id, n) {
	//const log = new Logger('align');
	const list = { src: '', dest: '', msg: '', id: id };
	switch (n) {
		case 0:
			for (const v of txt) list[v.name] = v.value;
			list.msg = list.msg.replace(/\\n/g, '\n')
			return list;
	
		case 1:
			const arr = txt.split(/ {1,}/);
			txt = arr.splice(0, 5);
			txt.push(arr.join(' '));
			return { src: txt[1], dest: txt[2], msg: txt[3], id: id, user: '', url1: txt[4], url2: txt[5] };
	}
}

async function Translate(txt, interaction) {
	const log = new Logger('translate');
	const fun = txt.module != 1 ? python : js;
	const id = String(interaction.id);
	txt = await lang(txt);
	return await embed(interaction, await fun(txt, id));
}

async function lang(txt) {
	//const log = new Logger('lang');
	if (txt.src === '' && txt.dest === '') try { await trans(txt) } catch { null }
	if (txt.dest === '' || txt.dest === undefined)
		if (txt.src !== 'en') txt.dest = 'en';
		else txt.dest = 'ja';
	return txt;
}

async function embed(interaction, d) {
	const c1 = 'a.) Original Message';
	const c2 = 'b.) ' + d.src + ' => ' + d.dest;
	const c3 = 'c.) ' + d.dest + ' => ' + d.src;
	const c4 = (d.user != null ? `<@${d.user}>${d.role != null ? '\n' : ''}` : '') +
		(d.role != null ? `<@&${d.role}>` : '');

	const avaterURL = interaction.user.displayAvatarURL({ format: 'png' });
	const embed = new EmbedBuilder()
		.setColor(0x0000ff)
		.setAuthor({ name: interaction.member?.displayName, iconURL: avaterURL });
	if (c4 !== '') embed.setDescription(c4);

	embed.addFields(
		{ value: d.m1, name: c1, inline: false },
		{ value: d.m2, name: c2, inline: false },
		{ value: d.m3, name: c3, inline: false });
	return [[embed], 0];
}

async function python(txt, id) {
	const log = new Logger('python');

	fs.writeFileSync(path1, yaml.dump(txt));
	const options = { mode: 'text', pythonOptions: ['-u'], scriptPath: './Python/user/' };
	const pyshell = new PythonShell('translate.py', options);
	pyshell.send(txt);
	pyshell.on('message', d => log.info(d));
	const start = new Date();

	try {
		while (!fs.existsSync(path2))
			if (30000 < new Date() - start) return ['', 2]; else await setTimeout(100);
		while (!(await dictImport(path2))?.[id])
			if (60000 < new Date() - start) return ['', 2]; else await setTimeout(100);
	} catch (e) { log.info(e); return ['', 1]; }

	const j = await dictImport(path2);
	const src = la[j[id].src] ?? j[id].src;
	const dest = la[j[id].dest] ?? j[id].dest;
	const m2 = j[id].m2 + (txt.url1?.replace(/^|\\n/g, '\n') ?? '\n') + (txt.url2?.replace(/^|\\n/g, '\n') ?? '\n');
	await jsonWrite(structuredClone(j), id);
	return { src, dest, m1: j[id].m1, m2, m3: j[id].m3 + '\n\nby Python', user: txt.user, role: txt.role };
}

async function jsonWrite(j, id) {
	const log = new Logger('jsonWrite');
	try {
		await setTimeout(10);
		delete j[id];
		fs.writeFileSync(path2, yaml.dump(j));
	} catch (e) { log.err(e) }
}


async function js(txt) {
	const log = new Logger('js');
	const res1 = await trans(txt, txt.src, txt.dest);
	const s1 = txt.src !== '' ? txt.src : res1.from.language.iso;
	const res2 = await trans(txt, txt.dest, s1);
	const dest = la?.[txt.dest] ?? txt.dest;
	const m2 = res1.text + (txt.url1?.replace(/^|\\n/g, '\n') ?? '\n') + (txt.url2?.replace(/^|\\n/g, '\n') ?? '\n');
	return { src: la?.[s1] ?? s1, dest, m1: txt.msg, m2, m3: res2.text + '\n\nby JavaScript',
		user: txt.user, role: txt.role };
}

async function trans(txt, from, to) {
	//const log = new Logger('trans');
	const proxys = ['https://hidester.com/proxy/', 'http://168.63.76.32:3128'];
	const agent = new HttpsProxyAgent(await rng(proxys));
	const res = await translate(txt.msg, { from: from !== '' && from != null ? from : 'auto',
		to: to !== '' && to != null ? to : 'en', requestOprions: { agent: agent } });
	if (txt.src === '') txt.src = res.from.language.iso;
	return res;
}