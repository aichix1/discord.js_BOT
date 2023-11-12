import fs from 'fs';
import yaml from 'js-yaml';
const { src, data } = process.env;
const { Logger } = await import(src + 'function/logger.js');

export const name = 'dictImport';
export async function dictImport(path) {
	const log = new Logger('dictImport');
	try { return yaml.load(fs.readFileSync(path ?? data + 'list/dict.yaml', 'utf8').replace(/\t/g, '  ')) }
	catch (e) { log.err(e); return null }
}