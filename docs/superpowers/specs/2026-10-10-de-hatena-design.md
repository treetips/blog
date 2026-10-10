# はてな痕跡の除去(de-hatena)設計仕様

- 日付: 2026-10-10
- 状態: 承認済み (2026-10-10)
- 関連 ADR: `docs/adr/0002-de-hatena.md`、`docs/adr/0003-vite-plus-tooling.md`

## 目的

本サイトははてなブログからの移行で、はてな由来の痕跡が残っている。
はてなへの**技術的依存をゼロ**にし、サイトは Cloudflare + Astro のみに依存する状態にする。
(文章内の外部リンクとして はてなドメインが写っていても処理上の依存は発生しないものとする。)

## 非目標

- 画像最適化(WebP/AVIF変換, astro:assets)は行わない（続編タスク）
- はてなドメインに向けた旧URL互換リダイレクト(?page=N, /entry/entry/*)の提供は続ける
- 記事本文の文章リンク (d.hatena.ne.jp 等) は書き換えない
- URLのフラット化は行わない (`/blog-images/images/fotolife/t/treeapps/<日付>/<ファイル>`構造維持)
- `fotolife` という旧語がURLに含まれるが、実行時の参照先ではないので除去対象外とする

## 現状のインベントリ (2026-10-10 調査)

| 種別             | 現状                                                                                                    | 残す/消す                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 画像実体         | `public/hatena-images/{897ファイル,206MB}` (git追跡, md参照 895点、ローカルアセット側と全部対応)        | **改名する**(git mvで履歴継続)                          |
| URLパス          | `/hatena-images/images/fotolife/t/treeapps/...` (md 548ファイル)                                        | **`/blog-images/images/fotolife/t/treeapps/...`へ改名** |
| altテキスト      | `![f:id:treeapps:...]` が md に残留                                                                     | **空 alt に(標準markdown のまま)**                      |
| Worker 送信先    | `HATENA_IMAGE_CDN` への404時フォールバック + referer: treeapps.hatenablog.com                           | **関数と constant を削除**                              |
| Worker 旧URL 301 | `/hatena-images/*` は将来 404 になる                                                                    | **`/blog-images/*`への 301 を追加**                     |
| 旧ページURL互換  | `/?page=N` を `/entry/` へ寄せる (worker, Actionsで常時更新) と `/entry/entry/*` (`public/_redirects`)  | **継続**(機能変更なし)                                  |
| 一時ツール       | `scripts/convert-hatena-export.ts`, `scripts/download-hatena-images.ts`, `package.json#images:download` | **削除**                                                |
| 文章リンク       | md内に はてなドメイン への `<a>` など                                                                   | 触らない                                                |
| docs参照波及     | README.md / DEPLOYMENT.md / `.agents/skills/cloudflare/SKILL.md` に画像DL手順の記述                     | 更新                                                    |

## 構成 (かかわる単位と責務)

1. **Asset リネージ**
   - `git mv public/hatena-images/images public/blog-images/images` (1回)
   - この単位だけが「実体の移動」。そのほかは参照の名前が変わるだけで内部データはそのまま。

2. **URL パスの md 側変換**
   - `scripts/migrate-image-urls.ts` (一回限り, 変換後に削除):
     - `src/content/blog/**/*.md` 内の `/hatena-images/images/...` を `/blog-images/images/...` に置換
     - 一致する alt (`f:id:<user>:<日時><p?>`) だけを空 alt にする(一律でなく、この用途の alt だけ)
     - 検査: 置換漏れ 0 パスを diffで確認、参照画像が全部解決することを assert
   - markdownは記法のまま(URL 内部を変えるだけなので `<img>` や HTML埋め込みにはしない)
   - 対象は `![alt](url)` 形式。HTML直書きの `<img src>` がある md は今回スコープ外(存在確認は実装時に行ない、あれば一括置換に含める)

3. **Worker (src/worker.ts)**
   - 削除: `HATENA_IMAGE_CDN` 定数、`/hatena-images/*` 向けのはてな fetch 分岐と referer 送り
   - 追加: `/hatena-images/` で始まるパスを `/blog-images/` + 残部 へ 301 redirect
   - 現行の canonical redirect, `/?page=N` → `/entry/...` redirect, `env.ASSETS.fetch` の流しは変えない
   - 期待: Worker が はてなドメインに fetch しないコードになる

4. **width/height 注入プラグイン (ビルド時)**
   - 実装: `src/markdown/image-size-plugin.ts` (Sätteri hast plugin / Astro 7 既定プロセッサ)
   - 生成 HTML の `<img src>` が `/blog-images/` を指すとき、`public/blog-images/` にある実ファイルの寸法を sharp で読み `width` / `height` 属性を注入し、`decoding="async"` も付ける。それ以外の属性は導入しない
   - 旧 `markdown.rehypePlugins` (unified) は Astro 7 で default 外 (セットで `@astrojs/markdown-remark` が必要かつ非推奨) のため、Sätteri の `hastPlugins` を採用 (`@astrojs/markdown-satteri` を依存に追加)
   - markdown 自体は無変更。CLS (レイアウトシフト) はこれで消えるはず
   - 条件分岐 (画面幅など) は設けない

5. **ツール整備 (AGENTS.md の要求を満たす最小構成)**
   - `bun add -d vite-plus`(バージョンは1.1.0固定)
   - `package.json` に `lint` → `bunx vp check`、`format` → `bunx vp check --fix` を追加
   - CI(deploy.yml)では `bun run lint` 1行を追加(ワークフローの大改修はしない)
   - **過去のフォーマット差分(実測 663ファイル)は、本目的のコミット群と分離した「format apply」コミット**にする
   - lint/format が緑になったら `astro check` → `bun run build` の順で確認する

6. **文書**:
   - README.md / DEPLOYMENT.md / `.agents/skills/cloudflare/SKILL.md` 内の「画像のダウンロード手順」「hatena-images構成」を削除/更新
   - `docs/adr/0001-cloudflare-cf-cli-migration.md`(承認済み決定の記録), `docs/adr/0002-de-hatena.md`(本変更), `docs/adr/0003-vp-tooling.md`(Vite+ 使用判定) を新設し `docs/adr/INDEX.md` から参照

## URL の単一の真実源

- 画像 URL は **`/blog-images/`** だけが単一の真実源。旧 `/hatena-images/` は Worker の 301 の 1 箇所と、寸法注入プラグインの prefix 判定にしか現れない。

## バリデーション

1. `bun run lint`(vp check) + `bun run build`(astro build) 緑
2. `dist` 内 HTML の `<img src="/hatena-images` 参照 0件(301がWorker側にあって、HTMLは新URLで書かれることの検証)
3. `dist` 内 HTML に 下記が 0件: (a) `/hatena-images` (b) `f:id:` (c) `cdn-ak.f.st-hatena.com`
4. 旧URL→301→新URL の curl 証明 (`/hatena-images/images/fotolife/t/treeapps/20150627/20150627153007.png` など1〜2件)
5. 生成 HTML の `<img>` に `width`/`height` が入っている(grep + 目視1件)
6. `astro check` と `bun run build`
7. 会社/自宅の Safari で記事ページ遷移を確認(チラつき調査の対効果測定。推奨のみ、スコープ外)

## リスクと緩和

- **大規模 git mv** (897ファイル): 「rename コミット」を独立させ、その後の md 変換コミットと差分が混ざらないようにする
- **外部からの旧画像URLリンク**: 有無は未調査(ブックマーク・検索インデックス可能性)。404 にしたままにせず、301 で全部受ける
- **sharp の build 時間増**: 画像ごとに metadata の IO 発生。897枚の metadata は1〜2秒程度と考え軽微
- **CI との整合**: `bun add -d vite-plus` で packageManager(bun) 配下に置き、CI は既存の `bun install --frozen-lockfile` をそのまま使う。lockfile 更新をコミットに含めること

## タスク分類(実装計画に引き継ぎ)

1. ADR 整備 (3枚+INDEX)
2. vp tooling 追加 ('format apply' コミットを最初に)
3. Worker 変更 (hatena CDN削除+301 追加)
4. Asset rename (git mv) + md convert (script → run → verify → remove script)
5. 寸法注入 plugin 実装
6. docs 更新 + skill 更新
7. 検証 (lint/build/curl/greps) 全経路
8. PR提出

## 前提の確認事項

- **順序**: cf移行(PR#2)を先にマージする。本タスクは `main` から分岐する。両方とも共通の依存物(worker.ts, README, DEPLOYMENT.md)を触れるため conflict を避ける
- **git 操作**: AGENTS.md の「git 操作は指示がある場合のみ」に従う。本計画の実行開始を human partner が承認した時点で、その計画内のコミット・ブランチ・PR 作成は指示とみなす
