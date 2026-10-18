# ADR 0008 — experimental.parallelPrerender を有効化する

- 日付: 2026-10-19
- 状態: Accepted
- 参照: https://astro.build/blog/astro-740/ 、`astro.config.ts`

## 背景

Astro 7.2.9 → 7.4.0 への更新 (2026-10-19) に伴い、7.4 の新機能がこのプロジェクトに適合するかを検証した。
静的生成 983 ページに対し、 experimental ながらページ生成をワーカースレッドへ分散する
`experimental.parallelPrerender` フラグが唯一ビルド時間に効く候補だった。

human partner が experimental フラグのリスクを受け入れた上での有効化を明示したため、
分析で示した「効いても数秒程度」との見込みをあえて覆して採用する。

## 決定

- `astro.config.ts` に `experimental.parallelPrerender: true` を有効化する
- `workers` 数は明示せず既定 (全コア - 1) に任せる。ローカルと CI のコア数差は既定値が吸収する
- 測定結果 (手元, `astro build --timings`):
  - ビルド要約: 983ページ / flag 無し 4.85s → 有り 3.79s (単回測定なので誤差あり)
  - 全ビルド 5.28s のうち `generate pages` 985ms、`prerenderer setup` (ワーカー起動) 166ms
  - ページ描画 (component render) は 985 ページ全体で 611ms と元々軽量
- このフラグはAstro が提供する prerenderer が使われる場合のみ効果がある。
  本プロジェクトはアダプター (`@astrojs/cloudflare` 等) を使わないため、
  フラグが無視される警告も出ず、常に効果が発揮される構成である

## トレードオフ

- experimental フラグのため、将来のマイナーリリースで挙動変更・撤去の可能性がある。
  撤去時は `astro build` の警告で判るので、リリースノート確認を `update-deps` 運用に含める
- ワーカー1本ごとにメモリを増やす。CI / ローカルでビルドがメモリ不足・逆に遅化した場合は
  `experimental.parallelPrerender: { workers: N }` で下げる (config コメントに記載済み)
- 効果はページ描画フェーズのみ。ビルド時間の大半 (setup 31.7%, client bundle 22.2%) は
  別工程のため、投稿数が増えて描画が重くなった時にこそ差が開く
