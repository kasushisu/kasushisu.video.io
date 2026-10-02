# Firebase 無料版セットアップ手順

この版は **Firebase Storageを使いません**。
無料運用は次の構成です。

- Firebase Authentication：Googleログイン
- Cloud データベース：タイトル・説明・カテゴリ・YouTube URL・画像/動画URLなどを保存
- GitHub Pages：サイト本体 + プレビュー画像/動画を保存

## 1. データベース

すでに作成済みであればそのままでOKです。

Firebase Console → データベース Database → ルール に
`firestore.rules` の内容を貼り付けて公開してください。

## 2. Authentication

すでに設定済みであればそのままでOKです。

- Googleログイン：有効
- Authorized domains：GitHub Pagesのドメインを追加
  例：`kasushisu.github.io`

## 3. Storageは設定不要

Firebase Storageは使用しません。
Blazeプランへの変更も不要です。

## 4. GitHubへこのフォルダ内のファイルをアップロード

主なファイル:

- `index.html`
- `admin.html`
- `data.js`
- `app.js`
- `firebase.js`
- `index-firestore.js`
- `admin-firestore.js`
- `styles.css`
- `admin.css`
- `firestore.rules`

## 5. 初回のみ管理者登録

GitHub Pagesで公開後、`admin.html` を開きます。

1. 「Googleでログイン」
2. 管理に使うGoogleアカウントを選ぶ
3. 最初にログインした1人が管理者として `settings/admin` に登録されます
4. 「初期データを登録」を1回押します

## 6. 文章・項目の編集

adminで編集して「保存する」を押すだけです。
別PC・スマホの公開ページにも反映されます。

## 7. 画像・動画を変更する方法

### GitHubにファイルを追加

例:

```text
images/
  pan.webp
  lower-third.webp

videos/
  push-in.webm
  wipe.webm
```

adminの「プレビュー画像 / 動画 URL・GitHub内パス」に、たとえば:

```text
images/pan.webp
```

または

```text
videos/push-in.webm
```

と入力して保存します。

GitHub Pages上では、そのファイルがそのまま表示されます。

### 完全なURLでもOK

```text
https://kasushisu.github.io/リポジトリ名/images/pan.webp
```

のようなURLも登録できます。

## 日常運用

- 文言変更 → adminだけで完結
- 項目追加 → adminだけで完結
- YouTube URL変更 → adminだけで完結
- 画像/動画追加・差し替え → GitHubへファイルを置く → adminでパスを登録
- サイトのデザイン・機能変更 → GitHubのHTML/CSS/JSを更新

Firebase Storageは使わないので、Sparkプランのまま運用できます。
