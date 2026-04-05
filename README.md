# bunkei-programmer.net

はてなブログ `treeapps.hatenablog.com` を Astro 6.0.8 に移行したブログです。  
記事は Markdown で管理し、Cloudflare Workers で配信します。

## 概要

- 元ブログ: `https://treeapps.hatenablog.com/`
- 正規ドメイン: `https://bunkei-programmer.net/`
- 旧 `www` は apex に `301` リダイレクトします
- 一覧、記事詳細、タグ一覧、RSS、sitemap を含みます
- 画像はローカルに取り込み、必要に応じて MP4 に変換しています

## 技術スタック

- [Astro 6.0.8](https://astro.build/)
- [Bun](https://bun.sh/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [ImageMagick](https://imagemagick.org/)

## 必要環境

- Bun 1.3 系
- Node.js 相当の実行環境
- `ffmpeg` 画像変換をやり直す場合に必要
- `bun install` 済みの `node_modules`

## 初回セットアップ

```sh
bun install
brew install imagemagick
```

## ローカル確認

開発サーバーを起動します。

```sh
./run.sh
```

必要に応じてホストやポートを変えられます。

```sh
HOST=0.0.0.0 PORT=4321 ./run.sh
```

直接 Bun で起動する場合は次です。

```sh
bun run dev
```

## ビルド

```sh
bun run build
```

## デプロイ

```sh
./deploy.sh
```

直接 Bun で実行する場合は次です。

```sh
bun run deploy
```

`deploy.sh` はビルド後に Cloudflare Workers へデプロイします。  
実行ログは `.wrangler-logs/` に保存され、最新 10 件だけ残るようにしています。

### GitHub Actions での自動デプロイ

`main` ブランチに push すると、GitHub Actions から Cloudflare Workers へ自動デプロイします。  
事前に GitHub の Secrets に次の 2 つを登録してください。

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

ワークフロー定義は [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) にあります。

## 記事データの再生成

はてなブログのバックアップから Markdown を再生成する場合は、次を順番に実行します。

```sh
bun run content:generate
bun run images:download
```

必要なら、ページング用のリダイレクトマップだけ再生成できます。

```sh
bun run redirects:generate
```

旧ブログ側のページング URL を再クロールしてスナップショットごと更新したい場合は、インターバルを指定して実行します。

```sh
bun run redirects:generate -- --refresh --delay-ms 1000
```

X 用カード画像を差分のある記事だけに対して生成する場合は次です。`design/x-post-image-template.png` に記事タイトルを焼き込み、記事と同じ階層の `public/` 配下へ出力し、対象記事の frontmatter に `cardImage` を書き込みます。

```sh
bun run x-card
```

`magick` と `design/fonts/PlemolJP-Bold.ttf` が必要です。フォントを変える場合は `X_CARD_FONT_PATH=/path/to/font.ttf bun run x-card` を使います。

X への投稿文を確認したい場合は次です。`src/content/` 配下の記事から、現在時刻の 12 時間以内に `publishedAt` があるものだけを対象に、投稿文を標準出力します。

```sh
bun run x-post
```

Astro 本体と公式インテグレーションを Astro 公式の手順で更新する場合は次です。

```sh
bun run update-deps
```

この script は、まず `@astrojs/upgrade` で Astro 本体と公式インテグレーションを更新し、その後 `npm-check-updates` で残りの依存を更新して最後に `bun install` を実行します。

## 新規記事の作成

フロントマター付きの新規記事ファイルを作成します。`publishedAt` には実行時点の JST が入ります。

```sh
bun run new-post -- "記事タイトル"
```

タイトルを省略した場合は `タイトル未設定` で生成されます。生成先は `src/content/blog/YYYY/MM/DD/HHmmss.md` です。

## 主要スクリプト

- `bun run new-post -- "記事タイトル"`
  - `src/content/blog/` にフロントマター付きの新規記事を作成します
- `bun run update-deps`
  - `@astrojs/upgrade` で Astro 本体と公式インテグレーションを更新した後、`npm-check-updates` で残りの依存を更新し、最後に `bun install` を実行します
- `bun run dev`
  - 開発サーバーを起動します
- `bun run build`
  - 静的サイトを生成します
- `bun run content:generate`
  - はてなブログの export から Markdown を再生成します
- `bun run images:download`
  - 記事内で参照する画像を `public/hatena-images/` に保存します
- `bun run x-card`
  - git 差分のある記事だけに対して X カード画像を生成し、`cardImage` を frontmatter に反映します
- `bun run x-post`
  - 直近 12 時間以内の記事を対象に、X 投稿用の文面を標準出力します
- `bun run redirects:generate`
  - 保存済みスナップショットから、はてなブログのページング URL を Astro 側の URL に対応付けます
- `bun run deploy`
  - ビルド後に Cloudflare Workers へデプロイします

## ディレクトリ構成

- `src/content/blog/`
  - 記事本文の Markdown
- `public/hatena-images/`
  - はてなブログから取り込んだ画像と動画
- `src/generated/`
  - ビルド時に生成する補助データ
- `backup/`
  - はてなブログの export 元データ
- `dist/`
  - Astro のビルド成果物

## 補足

- `dist/`、`.astro/`、`node_modules/`、`.wrangler/` はコミットしません
- `src/content/blog/` は編集対象です。ここに記事を置きます
- 旧ブログのページング URL は `?page=...` 形式ですが、Astro 側では `"/page/<n>/"` に変換しています
- `treeapps.hatenablog.com` のホスト自体はこのリポジトリの管理外です

## ライセンス

このリポジトリの内容はブログ移行用途で管理しています。必要に応じて運用ポリシーに合わせて追記してください。
