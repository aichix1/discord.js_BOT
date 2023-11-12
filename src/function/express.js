const { src, data } = process.env;
const { Logger } = await import(src + 'function/logger.js');
import Express from 'express';
const app = new Express();
import favicon from 'serve-favicon';
app.use(favicon(data + 'favicon.ico'));
const port = 3000;

export async function expressRun(client) {
	const log = new Logger('exRun');
	try {
		if (client.express !== undefined) client.express.close();
		client.express = app.listen(port, () => log.info('express run'));
		app.get('/', async (req, res) => await response(res));
		app.post('/', async (req, res) => await response(res));
	} catch (e) { log.err(e) }
}


async function response(res) {
	res.send(`<title>Translator1</title>
<style>body{color: #fff;background-color: #121212;font-size: 50px;}</style>
Translator1はオンライン！<br>
${port}`);
}