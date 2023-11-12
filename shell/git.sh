git config --global user.email $email
git config --global user.name $name
git add src shell Python/user/*.py .replit replit.nix package.json package-lock.json requirements.txt
#git add VOICEVOX/presets.yaml VOICEVOX/engine_manifest.json VOICEVOX/default_setting.yml VOICEVOX/*so VOICEVOX/*so* VOICEVOX/usr/lib
git status
git commit -m Clean
git push -u origin main