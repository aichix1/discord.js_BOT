from googletrans import Translator
from iso639 import Lang as Language
from iso639.exceptions import InvalidLanguageValue
import re, json, yaml, codecs
translator = Translator()
Path1 = 'data/trans/data1.yaml'
Path2 = 'data/trans/data2.yaml'

with codecs.open(Path1, 'r', 'utf-8') as f:
	dict = yaml.safe_load(f)

id = dict['id']
dict['msg'] = dict['msg'].replace('\\n', '\r\n')
msg = dict['msg']
src = dict['src']
dest = dict['dest']

src2 = translator.detect(re.sub(r'\r|\n','', msg)).lang
if src == '':
	src = src2

if dest == '':
	dest = 'en' if src != 'en' else 'ja'

if src == dest:
	if src == src2:dest = 'en' if src != 'en' else 'ja'
	else: src = src2

if src != dest and dest == src2 and (dest != 'ja'):
	tmp	= src
	src	= dest
	dest = tmp
	
msg1 = msg
#print(msg1)
#print(src, dest)
msg2 = translator.translate(msg1, src = src,	dest = dest).text
#print(msg2)
msg3 = translator.translate(msg2, src = dest, dest = src ).text
#print(msg3)

with codecs.open(Path2, 'r', 'utf-8') as f:
	dict2 = yaml.safe_load(f)
if dict2 == None:	dict2 = {}
dict2[str(id)] = {'done':0, 'm1':msg1, 'm2':msg2, 'm3':msg3, 'src':src, 'dest':dest}

with codecs.open(Path2, 'w', 'utf-8') as f:
	yaml.dump(dict2, f)