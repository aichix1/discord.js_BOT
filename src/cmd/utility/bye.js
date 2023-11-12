import { SlashCommandBuilder} from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
const { Logger } = await import(process.env.src + 'function/logger.js');
const met = (await import(src + 'list/met.js')).interaction;

export const data = new SlashCommandBuilder()
	.setName('bye')
	.setDescription('Disconnect voice channel!')
	.setDescriptionLocalizations({ja:'ボイスチャネルから切断'});

export const cooldown = 5;
export async function execute(interaction, client, channelId) {
	const log = new Logger('bye');
	if (interaction.type === 2)
		await interaction[met.f]({ ephemeral: true }).catch(e => log.err(e));
	
	const { connect } = client.voiceVox;
	const { guild } = interaction;
	channelId = channelId ?? interaction.channelId;
	connect[channelId] = getVoiceConnection(guild.id, channelId);
	if (connect[channelId]?._state.status === 'ready') connect[channelId].destroy();
	
	if (interaction.type === 2) await interaction[met.e]('Bye VC').catch(e => log.err(e));
}