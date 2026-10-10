# ADR 0005 — SVG グラス歪みフィルタを廃止し color-scheme を head で先行宣言する

- 日付: 2026-10-10
- 状態: Accepted
- 参照: ADR 0004、2026-10-10 の Chrome 黒フラッシュ報告 (Safari は良好、Chrome でのみ記事遷移時に背景が一瞬黒くチラつく)

## 背景

ADR 0004 の背景レイヤー化後、Safari での背景チラつきは収まったが、Chrome でのみ記事遷移時に一瞬黒い背景が見えると報告された。

Chromium 実機調査 (DevTools 相当ツール) で記事ページを計測した結果、候補として次が浮上した。

1. `.panel--glass::after` (全面・約 1040×1790px) が **backdrop-filter と SVG 参照フィルタ (`filter: url(#glass-distortion)`, feTurbulence + feDisplacementMap) を重ねていた**。Blink ではこの組み合わせの初回ラスタで黒/透明タイルが一瞬描かれる既知の不具合クラスがある。背景を fixed レイヤー化し合成構造が変わったタイミングで顕在化
2. `<meta name="color-scheme">` 未指定 (CSS の `color-scheme: light` はレンダリングブロッキングの global.css 内のみ)。OS ダークモードの Chrome では CSS 適用前の最初のフレームを暗色で描くことがある

## 決定

1. **SVG グラス歪みを廃止**
   - `liquid-glass.css` の `.liquid-glass::after` / `.panel--glass::after` から `filter: url(#glass-distortion)` と backdrop-filter を削除
   - 参照がなくなるため `BaseLayout.astro` から `#glass-distortion` の SVG defs も削除
   - 表現は `--liquid-glass-sheen` (半透明の光沢レイヤー) とパネル本体の blur で維持
2. **`<head>` に `<meta name="color-scheme" content="light">` を追加** (CSS の `color-scheme: light` は維持)

## トレードオフ

- グラスの「歪み」表現 (displacement) が失われる。視覚差はごく小さい (sheen と blur は残る)
- 黒フラッシュの直接観測は自動検証できない (1 フレームの合成アーティファクト)。効果は Chrome 実機での遷移確認で判定する
- ADR 0004 の背景レイヤー化の構造は維持する (本 ADR は Chrome 特有の表示問題のみを扱う)
