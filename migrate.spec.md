# 目的

## 現状の整理

- ブログを移行したいです。
- はてなブログ https://treeapps.hatenablog.com/ でブログを運営していました。
- 独自ドメインとして https://www.bunkei-programmer.net/ を設定していました。
- しかし、現在は独自ドメイン設定が外れてしまいました。
- [はてな記法](https://help.hatenablog.com/entry/text-hatena-list) で記事が記述されています。

## ゴール

- はてなブログから [astro@6.0.8](https://astro.build/) に移行したいです。
- デプロイ先は [Cloudflare Workers](https://www.cloudflare.com/ja-jp/developer-platform/products/workers/) にしたいです。
- `https://bunkei-programmer.net/` の独自ドメインを使いたいです。
- `はてな記法` を `markdown` 形式に移行したいです。
- Astroではmarkdownで記事を管理したいです。
- `https://www.bunkei-programmer.net/` ではなく `https://bunkei-programmer.net/` でアクセス可能にする。
- `https://www.bunkei-programmer.net/` にアクセスされたら `https://bunkei-programmer.net/` に301リダイレクトする。

## 既存のはてなブログの記事をエクスポートできるか

- `backup/treeapps.hatenablog.com.export.txt` が記事のバックアップです。
- 形式は `MT（MovableType）形式のテキストファイル` です。
