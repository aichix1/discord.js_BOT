const { Logger } = await import(process.env.src + 'function/logger.js');

export const name = 'stringSelectMenu';
export async function execute(interaction, client) {
	const log = new Logger(this.name);
	log.info(interaction);
}