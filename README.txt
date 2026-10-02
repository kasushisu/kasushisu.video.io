Business Video Visual Library
==============================

index.html  : 公開用ライブラリ
admin.html  : 管理画面
data.js     : 初期データ
app.js      : 共通処理 / プレビュー描画
styles.css  : 公開画面共通CSS
admin.css   : 管理画面CSS

使い方:
1. 同じフォルダ内の index.html / admin.html をWebサーバー上に置いてください。
2. admin.html で項目を編集すると、同じブラウザ・同じサイト上の index.html に反映されます。
3. 画像や短い動画はブラウザの localStorage に保存します。大容量動画は外部URL運用を推奨します。
4. 「JSON書き出し」で編集データをバックアップできます。

注意:
file:// で直接開く場合、ブラウザによってはページ間で localStorage を共有できないことがあります。
その場合は VS Code Live Server、Python http.server、または通常のWebサーバーで同じフォルダを配信してください。


Firebase / UI update:
- firebase.js で Firebase App と Google Analytics を初期化しています。
- GitHub Pages向けにブラウザES Modulesを使用しています。
- index.html には常時表示の「管理画面」ボタンを追加しました。
- admin.html は保存後に「編集完了！」トーストと保存ボタン状態変化を表示します。
- 現在、管理データの保存先は localStorage のままです。Firebase Analyticsは接続済みですが、Firestore/Storage保存はまだ行いません。
