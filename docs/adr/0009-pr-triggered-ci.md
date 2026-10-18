# ADR 0009 — PR トリガーの CI を追加する

- 日付: 2026-10-19
- 状態: Accepted
- 参照: `.github/workflows/ci.yml` 、`.github/workflows/deploy.yml` 、ADR 0003

## 背景

ワークフローは `deploy.yml` (push to main と手動実行) のみで、PR では検証が一切走らない。
デプロイ前に lint / type-check / build を通過させる仕組みが PR 時点に欠けていた。

human partner が「PR 作成時に CI を実行したい」と要求した。

## 決定

- 新規 `.github/workflows/ci.yml` を追加する
- トリガーは `pull_request` のみ (PR 作成・更新時)。push to main は既存 `deploy.yml` が
  同様の検証 (lint / check) を前段で行うため対象外
- ステップは `bun install --frozen-lockfile` → `bun run lint` → `bun run check` → `bun run build`
- **読み取り専用** PR 上で deploy も X カード生成コミットも行わない。
  Why not: deploy.yml の X カード生成は PR への git push (書き込み権限) と ImageMagick を
  必要とし、CI の本来の役割 (検証) と混ぜると原因特定が難しくなるため。
  書き込み系は push to main の deploy.yml に一任する
- ランナー / バージョン (ubuntu-latest, Node lts/*, Bun 1.3.10) は
  deploy.yml と同一にして、検証環境がローカル・CI・デプロイで乖離しないようにする
- 検証用に build も実行する。シークレット不要の静的ビルドであり (CLOUDFLARE_* は
  deploy.sh 専用)、PR 上でビルドが壊れていないことを確実にできるため

## トレードオフ

- merge ゲート (チェック必須化・マージ禁止) は GitHub リポジトリ設定側の作業で、
  このワークフロー追加だけでは強制されない
- ワークフローファイルの変更自体は初回マージまで既存 PR (PR #8) 上で検証される
- 必須ステータスチェックの context は**チェックラン名 (`ci`) で指定する**。
  GitHub UI 上の表示は `CI / ci` (workflow名 / job名) に合成されているが、
  Branch Protection API の `contexts` にその形で渡すとワークフロー名まで
  照合されず報告されないチェック扱いになり、CI が緑でも merge が BLOCKED になる
  (2026-10-19 実測)。`contexts: ["ci"]` で登録すると GitHub Actions アプリ
  (`app_id: 15368`) に解決される
