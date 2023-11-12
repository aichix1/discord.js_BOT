const { data } = process.env;
import fs from 'fs';
import { inspect } from 'util';
const dest = logStream();

const reset   = '\u001b[0m ';
const green   = '\u001b[32m';
const blue    = '\u001b[34m';
const yellow  = '\u001b[33m';
const red     = '\u001b[31m';
//const magenta = '\u001b[35m';//

export class Logger {
	constructor(name, parent) {
		this.name = name;
		this.parent = parent;
	}

	createChild(name) { return new Logger(name, this) }
	
	info(...msgs) { this.#makeMessage(green, ...msgs) }
	err(...msgs) { this.#makeMessage(yellow, ...msgs) }
	war(...msgs) { this.#makeMessage(red, ...msgs) }
	info2(...msgs) { this.#makeMessage(blue, ...msgs) }
	error(...msgs) { this.#makeMessage(yellow, ...msgs) }
	warning(...msgs) { this.#makeMessage(red, ...msgs) }
	
	#makeMessage(color, ...msgs) {
		const parents = new Array;
		let child = this;
		while (child.parent) {
			parents.unshift(child.parent);
			child = child.parent;
		}
		const str = '2-digit';
		const time = { month: str, day: str, hour: str, minute: str, second: str };
		const msg = ([color, `[${new Intl.DateTimeFormat('ja-JP', time).format(Date.now())}]`,
			`[${[...parents, this].map(it => it.name).join('/')}]`, reset,
			[...msgs.map(it => typeof it === 'string' ? it : inspect(it, { colors: true }))].join(' ')]).join('');
		const msg2 = '# ' + msg.replace(/\u001b\[[0-9]{1,2}m/g, '').replace(/(?<=\]) /, '\n') + '\n';
		fs.appendFileSync(dest, msg2 + '\n', { flag: 'a' });
		console.log(msg);
		if (color === yellow || color === red) console.error(msg2);
	}
}

function logStream() {
	const foPath = data + 'log/log';
	const files = fs.readdirSync(foPath).filter(file => file.endsWith('.md'));
	let [path, t] = [undefined, 0];
	for (const file of files) {
		const fPath = foPath + '/' + file;
		[path, t] = [[fPath], [fs.statSync(fPath).mtime]].map(arr => t < arr[1] ? [path, t] : [arr[0], arr[1]]);
		[path, t] = [path[0], t[0]];
	}
	return path;
}