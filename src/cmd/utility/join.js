const { src } = process.env;
import yaml from 'js-yaml';
import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
const { Logger } = await import(process.env.src + 'function/logger.js');
import { setTimeout } from 'timers/promises';
const env = yaml.load(process.env.Discord);
const met = (await import(src + 'list/met.js')).interaction;

export const data = new SlashCommandBuilder()
	.setName('join')
	.setDescription('Join voice channel!')
	.setDescriptionLocalizations({ ja: 'ボイスチャネルに接続' });

export const cooldown = 5;
export async function execute(interaction, client, channelId, flag) {
	const log = new Logger('join');
	if (interaction.type === 2 && !flag)
		await interaction[met.f]({ ephemeral: true }).catch(e => log.err(e));

	let { connect } = client.var2;
	const guildId = interaction.guild?.id ?? env.Guild;
	const guild = await client.guilds.fetch(guildId);
	channelId = channelId ?? interaction.channelId ?? env.Stage;
	const con = {
		group: channelId,
		guildId: guildId,
		channelId: channelId,
		adapterCreator: guild.voiceAdapterCreator,
		selfMute: false,
		selfDeaf: false,
	};
	
	connect[channelId] = await joinVoiceChannel(con);
	await setTimeout(1500);
	
	for (let n = 0; n < 3; n++)
		try { await guild.members.me.voice.setSuppressed(false); break; }
		catch (e) { if (n < 2) await setTimeout(500); else log.err(e) }
	
	if (interaction.type === 2 && !flag) await interaction[met.lr]().catch(e => log.err(e));
}