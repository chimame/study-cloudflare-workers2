## 方針

- 通常のアプリケーションを構成からエッジを使用する
- エッジだけでアプリケーションを構築する

## 目次

1. Cloudflare Workerとオリジン
  - Next.jsのサンプルプログラムを作る
    - Supabaseの準備
    - テーブルの作成
    - getServerSidePropsでページの作成
  - オリジンの準備
    - Dockerfileの作成
    - Cloud Runへのデプロイ
  - Cloudflare WorkerでISRを実施
    - KVの準備
    - Workerでrequest cache（fetchでの）の説明
    - waitUntilでKVにキャッシュを作成（疑似ISR）
2. 画像ファイルのアップロード（R2）
3. エッジでアプリケーションを動かす（オリジンの廃止）
4. データベースのロケーションもエッジに移す（D1）
5. セッション（KV or durable object）
6. メール送信処理（MailChannels）
7. Cronと非同期処理
