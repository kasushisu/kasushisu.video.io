# 管理者 / 編集者 権限の設定方法

この版では、Googleログインしたユーザーを次の2種類に分けられます。

- `admin`：管理者
- `editor`：コンテンツ編集者

公開ページを見るだけの場合はログイン不要です。

## 最初の管理者

これまで通り、`settings/admin` に登録されている最初のユーザーが管理者です。

## 編集者を追加する方法

### 1. 編集者に一度 admin.html へGoogleログインしてもらう

Authentication の「ユーザー」一覧に表示されます。

### 2. Authenticationで編集者の「ユーザーUID」をコピー

例:

```text
0ZUDDyHEbCM7ZRPHN48DY...
```

### 3. Firestore Database → データ を開く

`＋ コレクションを開始` を押します。

コレクションID:

```text
users
```

### 4. ドキュメントIDに、その人のUIDをそのまま貼り付ける

例:

```text
0ZUDDyHEbCM7ZRPHN48DY...
```

「自動ID」は使わないでください。

### 5. フィールドを追加

最低限これだけでOKです。

| フィールド | 型 | 値 |
|---|---|---|
| `role` | string | `editor` |
| `email` | string | 編集者のメールアドレス |

例:

```text
role  = editor
email = kasugai@tifana.com
```

保存します。

### 6. 編集者がadmin.htmlへ再ログイン

これで管理画面が開き、コンテンツの追加・編集・削除ができます。

## 管理者として追加したい場合

`role` の値を

```text
admin
```

にします。

## 権限を外す場合

Firestoreの `users/{UID}` ドキュメントを削除するか、
`role` を `editor` / `admin` 以外へ変更します。

## 必須

Firebase Console → Firestore Database → ルール に
このフォルダの `firestore.rules` を貼り付けて「公開」してください。

古いルールのままだと編集者は保存できません。
