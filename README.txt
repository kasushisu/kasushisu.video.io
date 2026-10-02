Business Video Visual Library - データベース 無料版
=================================================

無料構成:
- データベース: コンテンツデータ
- Authentication: 管理者Googleログイン
- GitHub Pages: HTML/CSS/JS + 画像/動画
- Firebase Storage: 使用しません

公開:
- index.html

管理:
- admin.html

初回:
1. アクセスルールを公開
2. Authentication Googleを有効化
3. Authorized domainsにGitHub Pagesドメイン追加
4. GitHub Pagesへ本ファイル一式をアップロード
5. admin.htmlへGoogleログイン
6. 初期データを登録

プレビュー素材:
- GitHub内に images/ や videos/ フォルダを作る
- adminの「プレビュー画像 / 動画 URL・GitHub内パス」に入力
  例: images/pan.webp
  例: videos/wipe.webm

詳しくは FIREBASE_SETUP.md を参照してください。


権限管理:
- 管理者 / 編集者に対応
- 編集者追加手順は ROLE_SETUP.md を参照


編集者管理:
- 管理者画面の「👥 編集者を管理」からメールアドレスだけで編集許可を付与・解除できます。
- 詳細は EDITOR_ACCESS.md を参照してください。
