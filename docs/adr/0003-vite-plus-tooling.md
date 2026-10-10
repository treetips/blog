# ADR 0003 — lint / formatter に Vite+ (`vp check`) を採用する

- 日付: 2026-10-10
- 状態: Accepted
- 参照: https://viteplus.dev/ 、AGENTS.md の「ソースの変更後は lint を実行して…」の要件

## 背景

AGENTS.md に「ソースの変更後は lint → フォーマッター → ビルド」の検証サイクルが定義されたが、リポジトリには lint/formatter が未導入だった。

候補の優先順位は human partner により指定済み: (1) Vite+、(2) 不可なら oxlint + oxfmt。

## 決定

- **Vite+ (`vp` CLI) を採用する**
- `vite-plus` を devDependency として固定 (1.1.0) し、`bunx vp check` を lint+format の実行手段とする
- スパイク結果:
  - Astro 7.2.9 は内部 Vite 8.1.0 を同梱しており、Vite+ 移行の前提 (Vite 8+) を満たす
  - プロジェクトの完全移行 (`vp build` / `vp dev` への乗り換え) はせず、`vp check` 単体を既存 Astro のビルドパイプラインと併用する (スパイクで `vp check` が未移行の Astro プロジェクトで動作することを確認)
- `package.json` には `lint` (`bunx vp check`) と `format` (`bunx vp check --fix`) を追加。CI は `bun run lint` の 1 行追加の最小差分
- 既存のフォーマット差分 (実測 663 ファイル) は `format apply` コミットとして独立させ、機能変更と混ぜない

## トレードオフ

- `vp check` の type-check は既定でオフのまま (astro check と二重になるため)。`tsgo` による高速 type-check は将来検討
- vite-plus は beta 系のバージョン体系を持つため、lockfile 固定と `update-deps` 時の確認を運用に含める
