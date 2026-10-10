# ADR 0002 — はてな由来の痕跡を除去し Cloudflare + Astro に集約する

- 日付: 2026-10-10
- 状態: Accepted
- 参照: `docs/superpowers/specs/2026-10-10-de-hatena-design.md`

## 背景

本サイトは treeapps.hatenablog.com からの移行で、以下のはてな痕跡が残っていた。

1. 画像 URL が `/hatena-images/images/fotolife/t/treeapps/...` (md 548 ファイル、画像実体 897 ファイルはすでにローカル `public/hatena-images/` にあり git 追跡済み)
2. alt テキストが `f:id:treeapps:...` (はてな記法の残留)
3. Worker がローカル 404 時にはてな CDN (`cdn-ak.f.st-hatena.com`) にフォールバックし `referer: treeapps.hatenablog.com` を送る
4. 一回限りの移行ツール (`convert-hatena-export.ts` / `download-hatena-images.ts`) が残存

なお 2026-10-10 の調査で、md が参照する全画像 (895 点) がローカルに存在すること (実行時のはてな CDN 参照はほぼ発生していないこと)、および記事 548 ページの画像読み込み中にレイアウトシフト (width/height 未指定) が繰り返され Safari の fixed 背景再描画と相まって画面チラつきの温床になっていることを確認した。

## 決定

- 画像を `git mv` で `public/hatena-images/` → `public/blog-images/` へ改名。md はパス接頭辞の置換のみ (標準 markdown `![alt](url)` を維持)
- `f:id:...` alt のみ空 alt に置換
- Worker: はてな CDN フォールバックと referer を削除し、旧 `/hatena-images/*` → `/blog-images/*` の 301 を追加
- 旧 URL 互換 (`/?page=N` ↔ `/entry/`, `/entry/entry/*` 正規化) は変更せず継続。機能はすでに Worker + Static Assets 内で完結している
- 移行ツール 2 本と `images:download` スクリプトを削除
- width/height は markdown を HTML 化せず、ビルド時の rehype プラグインで生成 `<img>` に注入 (markdown は純粋なまま)

## 替えないこと

- 記事本文中のはてなドメインへの外部リンク (内容としてのリンク) は書き換えない
- `fotolife` という語が内部パスに残る (参照先ではなく固定パスの一部であり、フラット化のベネフィットが検証コストに見合わないため)
- 画像の最適化 (astro:assets) は別タスク

## トレードオフ

- 大規模リネーム (900 ファイル弱) を含むため、rename コミットを独立させて差分審査性を確保する
- 旧画像 URL への外部リンク有無は未調査のため、404 にせず 301 で全部受ける
