# GPT Relay

## Spotify 

### 🎯 エンドポイント仕様

```http
GET /spotify?q={"path":"/me/tracks","query":{"limit":50,"offset":100}}
x-api-key: your-key
```

### 📌 処理フロー

1. `q` を `JSON.parse` する（`path`, `query` を取得）
2. `path` に `?` が含まれていたら拒否（ガード）
3. `query` を `URLSearchParams` に変換して Spotify API URL を構築
4. 認証ヘッダーを付けて Spotify API にリクエスト
5. レスポンスをそのまま or 整形して返却

