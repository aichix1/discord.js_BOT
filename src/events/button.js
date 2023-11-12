const { src } = process.env;
const { Logger } = await import(src + 'function/logger.js');
const { sendMsg } = await import(src + 'function/sendMsg.js');
const met = (await import(src + 'list/met.js')).interaction;

export const name = 'button';
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	const cmdName = interaction?.message?.interaction?.commandName;
	if (cmdName == null) return;
	switch (cmdName) {
		case 't':
			await trans(interaction, client);
			break;
		case 'calc':
			await calc(interaction, client);
	}
}

async function trans(interaction, client) {
	const log = new Logger('transBtn');
	if (interaction.user !== interaction.message.interaction.user) {
		const content = local1[interaction.locale] ?? local1.en;
		await interaction.channel.send(content).catch(e => log.err(e)).then(e => { return });
	}
	const embed = interaction.message.embeds;
	embed[0].data.fields.splice(-1);
	const content = embed[0].data.description;
	const name = embed[0].data?.author.name;
	const icon_url = embed[0].data?.author.icon_url;
	delete embed[0].data.description;
	delete embed[0].data.author.name;
	delete embed[0].data.author.icon_url;
	try { await sendMsg(interaction, client, name, icon_url, embed, content); } catch (e) { log.err(e); }
}

const { components, msg } = await import(src + 'cmd/utility/calc.js');

async function calc(interaction, client) {
	const log = new Logger('calc');
	await interaction[met.u]();
	const l = interaction.locale;
	let result = interaction.message.content.replace(/`{3}| /g, '');
	if (interaction.customId[0] === '=')
		if (result) try { result = eval(result).toString() } catch { interaction.channel.send(msg[l][1]) }
		else await interaction.channel.send(msg[l][2]);
	else if (interaction.customId[0] === 'e') result = result.substring(0, result.length - 1);
	else if (interaction.customId[0] === 'c') result = '';
	else result += interaction.customId[0];
	const rep = { content: '```' + result + ' ```', components };
	try { await interaction[met.e](rep) } catch { await interaction.reply(rep) };
}

const local1 = {
	ja: '[Error] 実行者エラー',
	en: '[Error] author error'
};