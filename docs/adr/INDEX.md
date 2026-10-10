# 常時ロード対象のADR

| ADR  | タイトル                                               | ステータス | 影響範囲                    |
| ---- | ------------------------------------------------------ | ---------- | --------------------------- |
| 0001 | Cloudflare 新 CLI `cf` への移行                        | Accepted   | デプロイ全体                |
| 0002 | はてな痕跡の除去 (de-hatena)                           | Accepted   | 画像URL・Worker・コンテンツ |
| 0003 | lint / formatter に Vite+ (`vp check`) を採用          | Accepted   | ツールチェーン              |
| 0004 | 背景描画の fixed レイヤー化と記事画像の長期キャッシュ  | Accepted   | 表示・キャッシュ            |
| 0005 | SVG グラス歪みフィルタの廃止と color-scheme の先行宣言 | Accepted   | 表示 (Chrome 黒フラッシュ)  |

- ステータス凡例
  - 提案済み (Proposed)
  - 承認済み (Accepted)
  - 代替済み (Superseded)
  - 非推奨 (Deprecated)
  - 棄却 (Rejected)

- ADR ファイルは `docs/adr/0001-xxx.md` の形でフラットに置く (フォルダは作らない)
