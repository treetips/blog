# デプロイ手順

## ビルド

```sh
ASTRO_TELEMETRY_DISABLED=1 bun run build
```

はてなブログのバックアップから記事や画像を再生成する場合は、先に次を実行します。

```sh
bun run content:generate
bun run images:download
```

## デプロイ

```sh
./deploy.sh
```

`bun` で同等の処理を実行する場合は次です。

```sh
bun run deploy
```

この手順で `dist/` に生成された静的サイトを Cloudflare Workers 経由で配信します。  
Worker は次の zone route に割り当てています。

- `bunkei-programmer.net/*`
- `www.bunkei-programmer.net/*`

Cloudflare へのログインが必要な場合は次を実行します。

```sh
WRANGLER_LOG_PATH=.wrangler-logs bunx wrangler login
```

## GitHub Actions での自動デプロイ

`main` ブランチへの push を契機に GitHub Actions から自動デプロイします。  
実行前に GitHub の Secrets に次の 2 つを登録してください。

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

ワークフロー定義は [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) にあります。

## ホスト方針

- 正規ホスト: `https://bunkei-programmer.net/`
- リダイレクト:
  - `https://www.bunkei-programmer.net/*` -> `https://bunkei-programmer.net/*`
  - `http://bunkei-programmer.net/*` -> `https://bunkei-programmer.net/*`
  - `http://www.bunkei-programmer.net/*` -> `https://bunkei-programmer.net/*`
- ステータスコード: `301`

## 補足

- `treeapps.hatenablog.com` はこのリポジトリの管理外なので、Cloudflare Workers だけではリダイレクトできません。
- `/entry/entry/*` のパス補正は `public/_redirects` で処理しています。
- `deploy.sh` は Wrangler のログをこのワークスペース内の `.wrangler-logs/` に保存し、`~/Library/Preferences/` に書き込まないようにしています。
