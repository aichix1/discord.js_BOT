const { src } = process.env;
import yaml from 'js-yaml';
import { StageInstanceManager } from 'discord.js';
const { Logger } = await import(src + 'function/logger.js');
const { rng } = await import(src + 'cmd/utility/rng.js');
const env = yaml.load(process.env.Discord);

export async function tpc(client, tpcs) {
	const log = new Logger('tpc');
	const types = ['speaker', 'audience'];
	let tpcs2;
	//for (const user of Object.keys(tpcs))
	//	for (const type of types)
	//		if (!!client.var[type]?.[env.Stage?.get(user)) tpcs2 = tpcs[user];
	for (const user of Object.keys(tpcs)) {
		for (const type of types) {
			if (!!client.var[type]?.[env.Stage]?.get(user)) {
				tpcs2 = tpcs[user];
			}
		}
	}
	if (tpcs2 === undefined) tpcs2 = tpcs.null;
	const tpc = await rng(tpcs2);
	const guild = await client.guilds.fetch(env.Guild);
	const stageInstance = await new StageInstanceManager(guild);
	const tpc2 = (await stageInstance.fetch(env.Stage).catch(e => null))?.topic;
	const flag = tpcs2.reduce((pre, cur) => { return pre || cur === tpc2 }, false);
	if (!flag)
		try { await stageInstance.edit(env.Stage, { topic: tpc }) }
		catch { await stageInstance.create(env.Stage, { topic: tpc }).catch(e => null) }//log.info(e)); }
}