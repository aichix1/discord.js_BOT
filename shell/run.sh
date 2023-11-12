path1=data/log/log/$(TZ=JST-9 date +%Y%m%d).md
path2=data/sounds

if [ ! -e $path1 ]; then
	touch $path1
fi

if [ -n "$(ls $path2)" ]; then
	rm ${path2}/*
fi

node src/index 2>>data/log/err.md

#path2=data/log/log/$(TZ=JST-9 date +%Y%m%d-%H%M%S).md
#node src/index 2>>$path1 >&1 | tee $path2
#node src/web/index

#VOICEVOX/run &
#node src/index &
#node src/web/index