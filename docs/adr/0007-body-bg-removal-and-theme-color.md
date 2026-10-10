# ADR 0007 — body 背景の撤去と theme-color による遷移フレーム制御

- 日付: 2026-10-10
- 状態: Accepted
- 参照: ADR 0004 / 0005 / 0006、Vivaldi での黒フラッシュ継続報告 + 「背景画像がレイヤー的に後ろで塗りつぶし背景の方が前に来る」報告

## 背景

ADR 0006 で `body` に不透明な下地色 (`#dad4dd`) を常設した結果、次の 2 問題が発生し得た (実報告に整合)。

1. **z 順序の回帰**: CSS の描画順 (CSS2.1 Appendix E) では、body の background は「負 z-index の子孫レイヤー」の **後**に塗られる。`body::before` の壁紙レイヤー (z-index:-1) は body の背景より先に塗られるため、body に色を敷くと**壁紙が隠れる**。「背景画像が後ろ・塗りつぶし背景が前」という報告はこれと一致する
2. **黒フラッシュ残存**: Chromium 系では遷移確定から最初の描画までのフレームを **`meta theme-color`** で塗る挙動があり (Vivaldi も本件の対象)、`meta color-scheme` の宣言だけではこの pre-paint フレームは制御できなかった

## 決定

1. **`body` の background-color を撤去** (`margin:0` のみに戻す)。壁紙レイヤーの `body::before` (background-color 付き) が下地を兼ねる
2. **`<meta name="theme-color" content="#dad4dd">` を `<head>` に追加**。Vivaldi / Chrome の遷移中 pre-paint フレームを壁紙平均色で塗り、黒フラッシュの露出を消す
3. `meta color-scheme: light` は維持 (フォーム色や prefers-color-scheme の解決方向として必要)

## 妥当性

- 描画順を仕様どおりに固定する事で、壁紙は「負 z-index の最初の合成レイヤー」(= body 内容より前、canvas の後) に戻る。body 背景とのカチ合いがなくなる
- theme-color は Chromium (Vivaldi 含む) が新ドキュメントの初期フレーム用色として参照する仕組みで、テーマが暗いブラウザであっても明色の 1 フレームを強制できる

## トレードオフ

- 黒フラッシュの一時的な原因特定には実機確認が残る (合成事象の自動観測不可)。本 ADR は「Chromium の遷移フレーム色」を直接制御するため、仮説が合っていれば迫ующий確定が最短
- もし遷移フレーム黒が残る場合は、bootstrap 中の r会议由入ってき `backdrop-filter: blur(10px)` を付けた `.panel` が最初のラスタで黒を出している可能性を次に絞る (ADR 0007 の初期確認事項)
