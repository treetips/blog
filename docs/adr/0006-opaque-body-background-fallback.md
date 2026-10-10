# ADR 0006 — body に不透明な下地色を常設し、Chromium 系の黒フラッシュを遮る

- 日付: 2026-10-10
- 状態: Accepted
- 参照: ADR 0004 / 0005、Vivaldi (Chromium) での黒フラッシュ実報告 (Safari・Firefox はほぼ非表示)

## 背景

ADR 0005 (SVG グラス歪み廃止 + color-scheme 明示) を本番適用後も、Vivaldi (Chromium) で記事遷移時に一瞬黒い画面が「かなりハッキリ」見える報告があった。Firefox / Safari ではほぼ見えない。

Chromium の commit 時にブラウザ既定の canvas (テーマが暗い場合は黒) が覗く問題を expected としたとき、本サイトの構造 (fixed 擬似要素 + backdrop-filter 面板) で初回ラスタが遅れると黒が露出する構えが説明として 成立する。ただし 1 フレームの合成事象のため自動検証 (screenshot/trace) では再現・確定はできなかった (ツール側の遷移中計測は保護のため不可)。

## 決定

- `body` に不透明な下地色 `#dad4dd` (壁紙の平均色) を **常設**する。
- `body::before` の壁紙レイヤー (ADR 0004) は維持。
- ついでに Chromium 側で「preload したが未使用」警告が出ていた wallpaper JPG の `<link rel=preload>` を削除 (image-set は webp 分岐のみ実際に使われるため)。

## 妥当性

- fixed 擬似要素の初期描画に遅れが出たとしても、その下の body の不透明な明色下地が露出するため、黒 (ブラウザ暗色テーマ) は決して見えない。
- 黒がそもそも別の原因 (backdrop-filter の合成バグ等) だった場合も、「canvas に届く前に下地が埋まっている」構造は黒の露出を原理的に防ぐ防御層として機能する。

## トレードオフ

- 効果の確定は Chromium 実機 (Vivaldi/Chrome) での遷移確認に依存 (自動検証不可)。
- 壁紙が持つ色調からの色ずれは平均色 `#dad4dd` を使うことで最小化 (ADR 0004 と同じ値)。
