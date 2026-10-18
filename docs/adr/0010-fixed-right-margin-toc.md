# ADR 0010 — 記事ページ右余白の固定目次 (TOC) を追加する

- 日付: 2026-10-19
- 状態: Accepted
- 参照: `src/pages/entry/[...slug].astro`、`src/components/ArticleToc.astro`、`src/lib/toc.js`、`src/styles/toc.css`

## 背景

記事詳細ページに右サイドの目次を求められた (2026-10-19 の会話)。
案としては (A) パネル外の右余白に fixed 配置する方式、(B) パネル内を 2 カラム化する方式、
(C) クライアント JS で DOM を走査して目次を組む方式 (tocbot など) が挙がった。

運用上の強い要件として「手動操作を伴う構成にしない」ことがある。
(A) はビルド時データと CSS だけで完結し、投稿側の作業・メンテが一切発生しないため採用する。

## 決定

- 案A を採用する。目次は `.toc-rail` としてパネル右の余白に `position: fixed` で置く
- データは Markdown 処理系 (`@astrojs/markdown-satteri`) から自動供給する
  - プロセッサー (`@astrojs/markdown-satteri`) は見出しに `id` (github-slugger) を自動付与し、
    `render(post)` の戻り値に `headings: { depth, slug, text }[]` を同梱する
  - 投稿側での手動リンク付け・rehype-slug の追加は不要
- 目次対象は h2 (章) / h3 (節) の 2 階層とする。h4 以降は除外、親を持たない h3 は章として扱う
  - 組み立てロジックは `src/lib/toc.js` に切り出し、`bun test` で保護する
- h2 が 1 つもない記事では目次要素ごと出力しない (空の目次を防ぐ)
- スクロール連動ハイライトを初回から組み込む (IntersectionObserver、約 40 行)
- 表示条件は `@media (min-width: 1440px)` 以上とする
  - パネル幅 1080px に対し、1280px では右余白が 100px しかなく目次が潰れる。
    余白が最低幅を確保できる 1440px を出現条件とする
- 目次をパネルの外に置く。`BaseLayout` に `overlay` という名前付き slot を追加し、
  記事ページは `<Fragment slot="overlay">` 経由で出力する

## トレードオフ

- 横幅 1440px 未満 (ノート PC 多数) では目次が表示されない。
  モバイル向けの代替 (記事冒頭の折りたたみ目次など) は必要になった時点で別途判断する
- `backdrop-filter` を持つ `.panel` の内側に fixed 要素を置くと包含ブロックが崩れ、
  `overflow-hidden` で切り取られるため、パネル内配置は技術的に不可能。
  BaseLayout への差し込み口追加はこの制約のための必須変更である
- パネル内 2 カラム化 (案B) は `overflow-hidden → overflow-clip` 変更を伴い、
  本文幅かパネル幅の改修が必要。見た目への影響が大きく採用しなかった
- クライアント DOM 走査 (案C) は JS 無効で目次が出ない・ロード後のレイアウトシフトが
  起きるため、ビルド時データが無料で得られる本プロジェクトでは採用しなかった
