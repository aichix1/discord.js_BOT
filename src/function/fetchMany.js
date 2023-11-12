import { Collection } from 'discord.js';

function array2Collection(messages) {
	return new Collection(messages.slice().sort((a, b) => {
		const a_id = BigInt(a.id);
		const b_id = BigInt(b.id);
		return (a_id > b_id ? 1 : (a_id === b_id ? 0 : -1));
	}).map(e => [e.id, e]));
}

export const name = 'fetchMany';
export async function fetchMany(channel, options = { limit: 50 }) {
	//const log = new Logger('fetchMany');
	if ((options.limit ?? 50) <= 100) { return channel.messages.fetch(options); }
	if (typeof options.around === 'string') {
		const messages = await channel.messages.fetch({ ...options, limit: 100 });
		const limit = Math.floor((options.limit - 100) / 2);
		if (messages.size < 100) { return messages; }
		const backward = fetchMany(channel, { limit, before: messages.last().id });
		const forward = fetchMany(channel, { limit, after: messages.first().id });
		return array2Collection([messages, ...await Promise.all([backward, forward])].flatMap(e => [...e.values()]));
	}
	let temp;
	function buildParameter() {
		const req_cnt = Math.min(options.limit - messages.length, 100);
		if (typeof options.after === 'string') {
			const after = temp ? temp.first().id : options.after;
			return { ...options, limit: req_cnt, after };
		}
		const before = temp ? temp.last().id : options.before;
		return { ...options, limit: req_cnt, before };
	}
	const messages = [];
	while (messages.length < options.limit) {
		const param = buildParameter();
		temp = await channel.messages.fetch(param);
		messages.push(...temp.values());
		if (param.limit > temp.size) { break; }
	}
	return array2Collection(messages);
}