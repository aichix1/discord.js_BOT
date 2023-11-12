import { setTimeout } from 'timers/promises';
import { Events, Collection } from 'discord.js';
const { Logger } = await import(process.env.src + 'function/logger.js');
const met = (await import(src + 'list/met.js')).interaction;

export const name = Events.InteractionCreate;
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	if (interaction.isChatInputCommand()) {
		const cmd = client.cmds.get(interaction.commandName);
		if (!cmd) return;
		const { cools } = client;
		if (!cools.has(cmd.data.name)) cools.set(cmd.data.name, new Collection());
		const now = Date.now();
		const tStamps = cools.get(cmd.data.name);
		const defaultCool = 5;
		const cool = (cmd.cooldown ?? defaultCool) * 1000 / (interaction.guild.ownerId === interaction.user.id ? 2 : 1);
		
		if (tStamps.has(interaction.user.id)) {
			const expiration = tStamps.get(interaction.user.id);
			if (now < expiration) return await cooldown(interaction, cmd, now, expiration);
		}
		
		tStamps.set(interaction.user.id, now + cool);
		setTimeout(() => tStamps.delete(interaction.user.id), cool);
		
		const content = local[interaction.locale]?.[2] ?? local.en[2];
		await cmd.execute(interaction, client)
			.catch((e) => { log.err(e); interaction.reply({ content: content, ephemeral: true })
				.catch(() => interaction[met.e]({ content: content }).catch(e => log.err(e))) });
	}
	else if (interaction.isButton()) await interaction.client.emit('button', interaction, client);
	else if (interaction.isModalSubmit()) await interaction.client.emit('modalSubmit', interaction, client);
	else if (interaction.isStringSelectMenu()) await interaction.client.emit('stringSelectMenu', interaction, client);
}

async function cooldown(interaction, cmd, now, expiration) {
	const log = new Logger('cool');
	const expired = Math.round(expiration / 1000);
	const c1 = local[interaction.locale]?.[0] ?? local.en[0];
	const c2 = local[interaction.locale]?.[1] ?? local.en[1];
	const content = c1 + cmd.data.name + '\n' + c2 + `<t:${expired}:R>`;
	try {
		await interaction.reply({ content: content, ephemeral: true });
		await setTimeout(expiration - now);
		await interaction[met.l].catch(e => log.err(e));
	} catch (e) { log.err(e?.rawError?.message, '\n', e?.requestBody) }
}

const local = {
	ja: [
		'クールダウン中：',
		'使用可能まで',
		'コマンド実行エラー',
	],
	en: [
		'Please wait, you are on a cooldown for ',
		'. You can use it again ',
		'There was an error while executing this command!',
	]
};

const local1 = {
	ja: 'クールダウン中：',
	en: 'Please wait, you are on a cooldown for '
};
const local2 = {
	ja: '使用可能まで',
	en: '. You can use it again '
};
const local3 = {
	ja: 'コマンド実行エラー',
	en: 'There was an error while executing this command!'
};