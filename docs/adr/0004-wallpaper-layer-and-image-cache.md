# ADR 0004 — 背景描画を fixed レイヤー化し、記事画像に長期キャッシュを適用する

- 日付: 2026-10-10
- 状態: Accepted
- 参照: 2026-10-10 の背景チラつき調査 (会社 M5・Safari で記事遷移時に背景がチラつく)、ADR 0002

## 背景

2026-10-10 の調査で、記事ページ遷移時の背景チラつきの温床として次を特定した。

1. `body` に `background-attachment: fixed` の壁紙 — WebKit では slow repaint の源泉で、記事読み込み中のレイアウト変更ごとに壁紙が全面再描画される
2. 記事画像の再取得 — `/blog-images/*` (当時 `/hatena-images/*`) に `cache-control: public, max-age=0, must-revalidate` が付き、ETag/Last-Modified も無いのでブラウザはキャッシュを使えず毎回取り直す
3. 下地色 `#e0d1d5` が壁紙の色調と乖離 — 画像未ロードの一瞬に色味の違う下地が露出する

(レイアウトシフトの温床だった `width`/`height` 未指定は ADR 0002 対応の寸法注入で解消済み)

## 決定

1. **背景を `body::before` (position:fixed, z-index:-1) に移す**
   - `background-attachment: fixed` を廃止し、壁紙は固定レイヤーとして描く (Safari 定跡のワークアラウンド)
   - `html` のグラデーションは初期描画のフォールバックとして維持
2. **下地色を壁紙の平均色へ変更** — sharp で算出した `#dad4dd` (旧 `#e0d1d5`)
3. **画像の長期キャッシュ**
   - `public/_headers` に `/blog-images/*` → `Cache-Control: public, max-age=31536000, immutable` を追加
   - **Worker 側で無条件に上書き** (`status 200` の `/blog-images/*` ASSETS 応答に確定値を付与)。理由: Workers Static Assets は既定値として `Cache-Control: public, max-age=0, must-revalidate` を常時応答に付けるため「無ければ付与」の分岐は常に no-op になる。また `_headers` では複数ルール (`/blog-images/*` と `/*.jpg` 等) の同時一致で同名ヘッダーが連結され得るため、Worker で確定値に整理するのが確実
   - 404 応答には immutable を付けない (誤 URL を 1 年間キャッシュさせるリスク回避)

## 妥当性

- 画像 URL ははてなのタイムスタンプ付きファイル名で内容不変 (同一 URL の内容は変わり得ない) ので immutable が安全
- 背景レイヤー化は見た目の変化なし (壁紙は viewport 固定 Stretch のまま)
- worker 側の応答ヘッダー上書きは `/blog-images/*` に限定する

## トレードオフ

- `_headers` の本来の値と Worker の上書きが重なる構成 (ヘッダーの確定は Worker 側が authority)
- 変更後の視覚確認は Safari (会社/自宅) で行う必要がある (本 ADR の効果はブラウザ依存のため自動検証は不可)

## 留意

- ADR 0002 追加の寸法注入 (width/height) により、調整済み
- 未対応のフォローアップ項目はなし (本 ADR でチラつき調査の提案は完了とする)
