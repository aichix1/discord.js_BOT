Replitでの使用を前提とする
https://discord.com/developers/applications
上記URLからBOTのToken、ClientIDなどを取得する

Secretsにdata/list/env.txtのフォーマットで上記に加えて各種IDを書き込む
（JSONにYAMLのフォーマットで書き込んでいる）

Shellて環境の再読み込みがされるまでEnterを押す
ディスクの読み書きが終了後、ブラウザをリロードする
（しないとSecretsの値が反映されない？）

「npm run init」を実行する
Runを押すと実行できる