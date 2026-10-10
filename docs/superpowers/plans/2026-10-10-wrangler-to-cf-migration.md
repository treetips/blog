# wrangler → cf CLI 移行実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cloudflare の新 CLI `cf`（1.0.0-beta）+ `cloudflare.config.ts` に移行し、`cf deploy` で本番デプロイできるようにする。

**Architecture:** `wrangler.jsonc` を `cf migrate` で `cloudflare.config.ts`（プラットフォーム設定）+ `wrangler.config.ts`（ビルド設定；Vite プラグインなしなので Wrangler バンドラ）に変換する。Astro は静的ビルド（`output: 'static'`、アダプタなし）で、`cf` が Astro を検出して `astro build` に委譲する場合、BOS が出力されず `cf build` が失敗する既知事例があるため、Task 3 で意思決定ゲートを設ける。

**Tech Stack:** cf 1.0.0-beta.x、Wrangler 4.136+（バンドラとして維持）、Node.js ≥ 22.18、bun（パッケージ管理のみ）、GitHub Actions

**Spec:** `docs/superpowers/plans/2026-10-10-wrangler-to-cf-migration.md`（本計画。参照記事: https://zenn.dev/sora_kumo/articles/cloudflare-to-cf , https://blog.bokvi.com/blog/cloudflare-cf-cli/ , https://developers.cloudflare.com/cf/wrangler/migrate/）

## Global Constraints

- `cf` は Bun をサポートしない。`cloudflare.config.ts` を読むコマンドは Node.js ≥ 22.18 で実行する（プロジェクトの `package.json` は bun パッケージマネージャだが、`cf` コマンドの実行は必ず `npx cf` / node 経由にする）
- `cf migrate` は git ワークツリーがクリーンであることが前提（`--force` は使わない）
- アップロードする Worker の挙動を変えないこと（canonical リダイレクト・はてな画像プロキシ・routes・observability は現状維持）
- このリポジトリにはシークレット・`--var`・プレビュー環境・Queue・`wrangler tail` の運用は存在しない（記事 Step 5 の該当落とし穴は対象外）
- `wrangler.jsonc` の削除は `cf deploy` による本番デプロイ成功を確認した後に限定する

## Review Focus

- **routes の消失**：`bunkei-programmer.net/*` と `www.bunkei-programmer.net/*` の 2 route が `triggers.fetch()` に移行されているか。移行漏れがあると apex/`www` の配信が壊れる → Task 2 Step 2 で config 確認、Task 6 で古典的 `wrangler deploy --dry-run` の route と突き合わせて確認
- **`run_worker_first` の消失**：現状全リクエストが先に Worker に来る挙動（301 リダイレクト・はてな画像フォールバック）が維持されるか。`assets.runWorkerFirst: true` への移行を Task 2 で確認する
- **Astro 委譲による BOS 欠落**：`cf build` / `cf deploy --dry-run` が `.cloudflare/output/v0/config.json` を見つけられず失敗する事例あり → Task 3 のゲート
- **`ASSETS` バインディングの型-sync**：`src/worker.ts` の `Env.ASSETS: Fetcher` が `.cloudflare/types/index.d.ts` と一致するか → Task 5 で `bun run check`
- **認証情報の互換**：CI（`.github/workflows/deploy.yml`）で `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` 環境変数がそのまま `cf deploy` で使えるか → Task 6

---

## 現状で把握しているファイル一覧と移行先

| 現行                                  | 役割                                                         | 移行先                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `wrangler.jsonc`                      | Worker 名・互換日・entrypoint・assets・routes・observability | `cloudflare.config.ts`（`wrangler migrate` 生成）+ `wrangler.config.ts`（assets directory 等のビルド設定） |
| `package.json:10` `deploy` スクリプト | `bunx wrangler deploy`                                       | `npx cf deploy`                                                                                            |
| `deploy.sh:35-43`                     | Wrangler ログ回転 + `bunx wrangler deploy`                   | ログ回転を撤去し `npx cf deploy` へ                                                                        |
| `.github/workflows/deploy.yml:73`     | `./deploy.sh` 呼び出し                                       | 変更なし（deploy.sh 内で吸収）                                                                             |
| `src/worker.ts:3-5` `Env`             | 手書き `Env { ASSETS: Fetcher }`                             | 生成型 `Env`（`.cloudflare/types/index.d.ts`）に置換                                                       |
| `.gitignore`                          | `.wrangler/`, `.wrangler-logs/`                              | `cf migrate` が `.cloudflare/` を追記、`.wrangler-logs/` は撤去時に整理                                    |

---

### Task 1: 検証ブランチでの `cf migrate`（dry-run → 実行）

**Files:**

- Create: `cloudflare.config.ts`（cf migrate が生成）
- Create: `wrangler.config.ts`（cf migrate が生成）
- Modify: `package.json` / `bun.lock`（cf が devDependency 追加・wrangler を 4.136+ に引き上げ）
- Modify: `.gitignore`（`.cloudflare/` 追加）

**Interfaces:**

- Consumes: `wrangler.jsonc`（現行設定、23 行）
- Produces: `cloudflare.config.ts` に `worker.entrypoint: ./src/worker.ts`、`triggers.fetch()` × 2、`assets.runWorkerFirst` 相当が存在すること。後続タスクはこの生成ファイルを前提とする

- [ ] **Step 1: 検証ブランチを作成し、ワークツリーをクリーンにする**

```bash
git checkout main && git pull
git switch -c migrate-cf-cli
git status --porcelain   # 空であること
```

- [ ] **Step 2: dry-run で変更内容を確認する**

```bash
npx cf migrate --dry-run
```

Expected: 変更対象ファイル一覧が出力される（書き込みは発生しない）

- [ ] **Step 3: `cf migrate` を実行する**

```bash
npx cf migrate
```

Expected: `cloudflare.config.ts` + `wrangler.config.ts` が生成され、`package.json` に `cf`（1.0.0-beta.x）と wrangler ≥ 4.136 が入り、手作業フォローアップ項目の一覧が表示される

- [ ] **Step 4: 生成物をコミットする**

```bash
git add -A
git commit -m "feat: run cf migrate from wrangler.jsonc"
```

---

### Task 2: 生成された `cloudflare.config.ts` の整備

**Files:**

- Modify: `cloudflare.config.ts`
- Modify: `wrangler.config.ts`（必要なら）
- Read-only: `src/worker.ts`（behavior を変えない）

**Interfaces:**

- Consumes: Task 1 で生成された設定ファイル
- Produces: `cloudflare.config.ts` が以下を満たすこと（Step 2 の検証で確認）
  - `worker.name: "bunkei-programmer-net"`
  - `worker.compatibilityDate: "2026-03-22"`
  - `worker.entrypoint: "./src/worker.ts"`
  - `worker.observability: { enabled: true }`
  - `worker.env: { ASSETS: bindings.assets() }`
  - `worker.triggers` に `triggers.fetch({ pattern: "bunkei-programmer.net/*", zone: "bunkei-programmer.net" })` と `triggers.fetch({ pattern: "www.bunkei-programmer.net/*", zone: "bunkei-programmer.net" })`
  - `worker.assets.runWorkerFirst: true`（旧 `assets.run_worker_first: true` の相当。`cf migrate` が入れてくれるか確認し、無ければ手動追加）

- [ ] **Step 1: 生成されたファイルを読み、TODO コメント・例外スローを洗い出す**

```bash
cat cloudflare.config.ts wrangler.config.ts
```

Expected: `TODO(@cloudflare)` コメントの有無と、`routes` / `run_worker_first` / `assets` / `observability` の行き先が把握できる。routes が `triggers.fetch()` に来ていない場合、旧 `wrangler.jsonc`（後で削除するので残っており、Before として使える）と突き合わせて `triggers.fetch({ pattern: "...", zone: "bunkei-programmer.net" })` を手動で追記する

- [ ] **Step 2: 動作面の設定が揃っていることを確認して反映する**

確認内容（旧 `wrangler.jsonc` との対比で全項目）:

1. `assets.runWorkerFirst: true`（旧 `run_worker_first: true`。欠けている手で追加）
2. `notFoundHandling` / `htmlHandling` は旧設定と同じく未指定でよいか確認（旧設定でも指定なしなので、追加はしない）
3. 旧設定には `directory: "./dist"` がある → 無いこと自体が正しい（`wrangler.config.ts` の `assetsDirectory` に移っているはず。無ければ手動で追加）

```bash
cat wrangler.config.ts
# assetsDirectory: "./dist" があること
# （無ければ）assetsDirectory: "./dist" を追記
```

- [ ] **Step 3: 変更をコミットする**

```bash
git add cloudflare.config.ts wrangler.config.ts
git commit -m "fix: complete manual follow-ups in cloudflare.config.ts"
```

---

### Task 3: 意思決定ゲート — `cf build` の検証

> **結果（2026-10-10 実行後）: PASS（フォールバック 2 の変形で解決）**
> Step 2 の `cf build` は既知事例どおり `astro build` 委譲 → BOS 欠落エラーで失敗した。
> Step 3 の案 A（フラグ明示）は `cf build --help` に bundler 指定フラグがなく不成立。
> 案 B（BOS 手動生成）は、自前スクリプトではなく **Wrangler の隠しフラグで解決**:
> `npx wrangler build --x-new-config --x-cf-build-output` が `cloudflare.config.ts` +
> `wrangler.config.ts` から `.cloudflare/output/v0/`（BOS）を生成する。
> その後 `npx cf deploy --prebuilt --dry-run` が検証を通過（assets 3785 ファイル読み込み、
> `env.ASSETS` バインディング確認、dry-run 完了）。
> 以降のデプロイ経路は「`astro build` → `wrangler build --x-new-config --x-cf-build-output` → `cf deploy --prebuilt`」で統一する。

**Files:**

- Modify: `docs/superpowers/plans/2026-10-10-wrangler-to-cf-migration.md`（結果を書き戻し）

**Interfaces:**

- Consumes: Task 2 で整備済みの `cloudflare.config.ts`
- Produces: ゲート判定。PASS なら Task 4 以降へ進行、FAIL ならフォールバック案選定

- [ ] **Step 1: BOS に必要な成果物を先に作る**

旧 `dist/` は Astro ビルドの出力で、`cf build` 実行時には Astro に委譲する挙動になる。まず現状のデプロイ経路が壊れていないことを確認しつつ、ビルドを通す。

```bash
bun run build
```

Expected: `dist/` が更新され、`astro check`（`bun run check` の一部）が成功

- [ ] **Step 2: `cf build` を実行する**

```bash
npx cf build
```

- **PASS**（`Delegating to npx astro build` → `.cloudflare/output/v0/config.json` が生成され検証を通る）: Task 4 へ。特に `astro build` 委譲でも BOS が出た場合は本計画の前提（失敗する事例）が解消されているためそのまま進む
- **FAIL**（`Build Output Specification: no root config found` が出る — 同構成の既知事例）: Step 3 へ

- [ ] **Step 3: FAIL の場合のフォールバック案を実行する**

優先順に試す（1 つ成功で進む）:

1. **`--bundler wrangler` による明示**（cf 側の Astro 自動検出を通らず Wrangler バンドラに委譲するルートがあるか確認）:

```bash
npx cf build --help   # bundler / builder を選ぶフラグの有無を確認
```

フラグがあれば指定して再実行。BOS が生成されたら PASS。

2. **BOS を手動生成して `cf deploy --prebuilt`**: `dist/`（Astro 生成物）と `src/worker.ts` を BOS 形式（`.cloudflare/output/v0/config.json` + `workers/default/`）へ組み立てるローカルスクリプト（例: `scripts/prepare-build-output.ts`）を書き、`deploy` スクリプトを `bun run build && bun scripts/prepare-build-output.ts && cf deploy --prebuilt` にする。BOS の形式は `npx cf build` が成功する Vite プロジェクトや Wrangler ≥ 4.136 の `--x-cf-build-output` が出力する実物を模範にする（推測で書かない）

3. **どちらも難しい場合、移行中止を human partner に報告する**: `cf` が Astro 静的サイトのビルド委譲に未対応という新規の問題報告（issue 提出）候補になり得る。この場合移行は凍結し `wrangler.jsonc` を維持する

- [ ] **Step 4: 判定結果を本計画に書き戻してコミットする**

```bash
git add docs/superpowers/plans/2026-10-10-wrangler-to-cf-migration.md
git commit -m "docs: record cf build gate result"
```

---

### Task 4: スクリプト・CI の更新（Node 前提への書き換え）

**Files:**

- Modify: `package.json:10`（`deploy` スクリプト）
- Modify: `deploy.sh:35-43`（ログ回転の撤去と deploy コマンド置換）
- Modify: `.github/workflows/deploy.yml`（変更不要なら刻）

**Interfaces:**

- Consumes: Task 3 の PASS
- Produces: `npm run deploy` → `cf deploy` 一本。Task 7 のドキュメント更新が参照する

- [ ] **Step 1: `package.json` の `deploy` を書き換える**

旧:

```json
"deploy": "bun run build && WRANGLER_LOG_PATH=.wrangler-logs bunx wrangler deploy"
```

新（`cf` は Bun ランタイムで失敗するため `npx cf` を通す。Node ≥ 22.18 は `engines` により既に確保済み）:

```json
"deploy": "bun run build && cf deploy --dry-run && npx cf deploy"
```

（dry-run を先に挟む理由: 上行でビルドし、失敗すれば何もアップロードしない）

- [ ] **Step 2: `deploy.sh` から Wrangler ログの回転を撤去しコマンドを置換する**

削除する部分: `rotate_wrangler_logs` 関数全体、`mkdir -p .wrangler-logs`、2 回の呼び出し、`WRANGLER_LOG_PATH=.wrangler-logs` 変数より先の部分。残すのは bun 存在チェックとビルド:

```bash
echo "Astro でサイトをビルドします。"
ASTRO_TELEMETRY_DISABLED=1 bun run build

echo "Cloudflare Workers にデプロイします。"
npx cf deploy
```

- [ ] **Step 3: `.github/workflows/deploy.yml` の確認**

```bash
grep -n "deploy.sh" .github/workflows/deploy.yml
```

Expected: `./deploy.sh` 呼び出しのみでワークフロー自体の変更が不要なことを確認（Node のセットアップは既にある）。変更があればコミットに含める

- [ ] **Step 4: コミット**

```bash
git add package.json deploy.sh .github/workflows/deploy.yml
git commit -m "feat: switch deploy commands from wrangler to cf"
```

---

### Task 5: 型生成と `Env` の型同期

**Files:**

- Create: `.cloudflare/types/index.d.ts`（生成物。`.cloudflare/` は gitignore 済みなので**コミットしない**）
- Modify: `src/worker.ts:3-5`
- Modify: `tsconfig.json`（生成物 include が必要な場合）

**Interfaces:**

- Consumes: `cloudflare.config.ts` の `env: { ASSETS: bindings.assets() }`
- Produces: `src/worker.ts` が `Env` を生成物から import する。はてな画像フォールバックもこの型で動作検証する

- [ ] **Step 1: 型生成**

```bash
npx cf workers types
```

Expected: `.cloudflare/types/index.d.ts` に `Env` が生成される（`ASSETS` は `Fetcher`）

- [ ] **Step 2: `src/worker.ts` の手書き `Env` を生成物の import に差し替える**

```ts
import type { Env } from "../.cloudflare/types/index";
```

（生成物が tsconfig の exclude 対象の場合、include に `.cloudflare/types/**` を足す。最終判断は `bun run check` の結果で）

- [ ] **Note: 生成物がリポジトリに残らない代替案**

`.cloudflare/` が exclude される配合の tsconfig/実行環境で型 import が安定しない場合、手書き `Env { ASSETS: Fetcher }` を保持する選択も残す（現在の Env は 1 プロパティのみで型差異のリスクが小さいため、Task 2 が正しく終わっていれば問題にならない）。

- [ ] **Step 3: `bun run check` と `bun run build` が通ること**

```bash
bun run check
```

- [ ] **Step 4: コミット**

```bash
git add -A
git commit -m "feat: import generated Env type from cf workers types"
```

---

### Task 6: 動作検証（dry-run → 本番）

**Files:**

- Modify: なし（検証のみ。必要ならそのとき報告・対応）

**Interfaces:**

- Consumes: Task 1-5 の全部
- Produces: 本番デプロイ成功証跡（URL・リダイレクト挙動確認）

- [ ] **Step 1: 一致検証 — 古典的な wrangler dry-run で route・assets 情報を得る**

旧 `wrangler.jsonc` はまだ残っている:

```bash
npx wrangler deploy --dry-run 2>&1 | tail -40
```

Expected: `bunkei-programmer.net/*` と `www.bunkei-programmer.net/*` の route が表示される → Task 2 の結果と突き合わせて記録する

- [ ] **Step 2: `cf deploy --dry-run` を実行する**

```bash
npx cf deploy --dry-run
```

Expected: `cf build` 成功 + worker 設定検証が通る（アップロードなし）

- [ ] **Step 3: ローカル実行確認**

```bash
./run.sh
```

Expected: 既存の開発サーバーが従来と同じ挙動を示す（canonical リダイレクトは本番側の動作のため対象外。成否が確認できる範囲の静的確認のみ）

- [ ] **Step 4: 本番デプロイ**

実際のデプロイは `main` にマージ後の GitHub Actions で自動実行される。ローカルから即時反映することもできるが、初回は PR 経由の GitHub Actions 実行を選ぶ

```bash
npx cf deploy --dry-run    # 再確認
git push origin migrate-cf-cli   # PR 作成 → マージ → Actions でデプロイ
```

Expected: `bunkei-programmer.net` と `www.bunkei-programmer.net`（301 リダイレクト）が正常動作すること

- [ ] **Step 5: `www` → apex リダイレクトの実URL確認**

```bash
curl -sI https://www.bunkei-programmer.net/ | head -5
curl -sI https://bunkei-programmer.net/ | head -3
```

Expected: それぞれ 301（www）と 200（apex）

---

### Task 7: 旧設定・文書・参照の後片付け

**Files:**

- Delete: `wrangler.jsonc`
- Modify: `DEPLOYMENT.md`（`wrangler login`、`.wrangler-logs/` の説明を `cf` に書き換え）
- Modify: `README.md`（`.wrangler-logs/` の言及、コミット排除一覧）
- Modify: `.gitignore`（`.wrangler-logs/` の行は Wrangler が依然依存として入るため当面残す）
- Modify: `.agents/skills/cloudflare/SKILL.md`（参照順 1 位を `wrangler.jsonc` → `cloudflare.config.ts` に更新）
- Modify: `package.json`（余計な devDependency が残っていれば entries 調整）

**Interfaces:**

- Consumes: Task 6 の PASS（本番動作確認済み）
- Produces: リポジトリに旧設定が残らない状態

- [ ] **Step 1: `wrangler.jsonc` 削除（本番デプロイ成功の後でのみ実行）**

```bash
git rm wrangler.jsonc
```

- [ ] **Step 2: 文書更新**

`DEPLOYMENT.md` での該当箇所は、読み取りのうえ `wrangler login` / `.wrangler-logs` の説明を `cf` 仕様（`cf auth login`、BOS は `.cloudflare/output/v0/`）に書き換える。`README` の `.wrangler-logs` ← 同様

- [ ] **Step 3: `bunx cf` のスクリプト等に Node 版追加に伴う使用書式の整合確認**

`bunx cf` ではないこと（Bun は cf をサポートしない）。最終 grep:

```bash
grep -rn "wrangler" --include="*.{ts,json,md,jsonc,sh}" . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.wrangler --exclude-dir=backup
```

Expected: 残る wrangler 参照は（a）wrangler パッケージ自体が依存として必要な事実、（b）Wrangler 以外の参照（コンテンツ中のブログ記事、`about.astro` など）のみ

- [ ] **Step 4: 最終コミット**

```bash
git add -A
git commit -m "chore: remove wrangler.jsonc and update docs for cf CLI"
```

- [ ] **Step 5: 最終動作確認（Task 6 Step 5 相当を再実行）**

本番公開 URL（`bunkei-programmer.net`）の apex 200 / `www` 301 を再確認。

---

## Self-Review の結果

**Spec coverage**: 記事 Step 1〜6 を本リポジトリに適用した Task 1〜7 に全対応。ただし Step 3（Vite / React Router 連携）と Step 5（Windows・`--var`・tail）は対象外と確認済みで除外。
**Placeholder scan**: Task 3 Step 3 のみ複数案のフォールバック構造。ただし各案に実行手順と期待値を書いた。他に "TBD" / "implement later" はなし。
**Type consistency**: `Env` の生成 import（Task 5）と `cloudflare.config.ts` のバインディング定義は一致。
**Review Focus**: 全 5 項目を Task 2 / 3 / 5 / 6 のいずれかの検証ステップに組み込み済み。
