import fs from 'fs';
import { Transform } from 'stream';
const { Logger } = await import(process.env.src + 'function/logger.js');
const log = new Logger('rewrite');
const path = src + 'function/test';

async function reWrite(type) {
	const files = fs.readdirSync(path).filter(file => file.endsWith('.js'));
	const fPath1 = path + '/' + file;
	const fPath2 = fPath1.replace(/2{0,}(?=\.js)/, '2');
	for (const file of files)
		if (type) fs.writeFileSync(fPath1, reWriteCom(fs.readFileSync(fPath1, 'utf8')));
		else fs.createReadStream(fPath1, 'utf8').pipe(trans).pipe(fs.createWriteStream(fPath2, 'utf8'));
}

const trans = new Transform({
	transform(chunk, encoding, done) {
		this.push(reWriteCom(chunk).toString());
	}
})

function reWriteCom(txt) {
	txt = txt.toString();
	if (!txt.includes('module.exports'))
		return txt.replace(/import( .* )from ('.*');/g, 'const$1= require($2);')
			.replace(/export (|async )function (.*)(?=\()/g, 'module.exports = {\n\tname: \'$2\',\n\t$1$2')
			.replace(/(?<=module.exports = {\n[\s\S]*{[\s\S]*\n)(?=\t)/g, '\t')
			.replace(/(?<=module.exports[\s\S]*)(?=\n})/g, '\n\t}')
	else
		return txt
			.replace(/const( .* )= require\(('.*')\)(?=;)/g, 'import$1from $2')
			.replace(/(?<=module.exports = {\n[\s\S]*,\n\t(async )?)(?=.*\()/g, 'export function ')
			.replace(/export function async (?=export function)/g, '')
			.replace(/(?<=module.exports = {\n[\s\S]*\n)\t/g, '')
			.replace(/module.exports = {([\s\S]*name:.*,\n)?/g, '')
			.replace(/\n}(?=\n})/g, '')
}

await reWrite(null);