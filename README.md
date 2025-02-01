# MagicMap

JupyterNotebookの代替となる、フローの把握が視覚的に分かりやすいNotebookツール。

## 概要

MagicMapは、データ分析やプログラミングのワークフローを視覚的に構築・管理できるツールです。Pythonコードの実行セルをノードとして配置し、それらを接続することで実行の流れを明確に表現します。

## 主な機能

### 1. ビジュアルプログラミング
- ノードベースのインターフェースでコードの流れを視覚化
- ドラッグ&ドロップで自由にノードを配置
- ノード間の接続で実行順序を定義
- 分岐や並列処理の表現が可能

### 2. Pythonコード実行
- 各ノードで独立したPythonコードを実行
- リアルタイムの実行結果表示
- エラー表示によるデバッグサポート
- コンテキストの継承による変数の共有

### 3. インタラクティブな操作
- 直感的なノード追加・削除
- 簡単なノード間接続
- コードのリアルタイム編集
- 実行結果のその場確認

### 4. データフロー管理
- 上流から下流への明確なデータの流れ
- 実行コンテキストの自動管理
- 変数状態の保持と伝播
- コードの再現性の確保

## 使用方法

1. ノードの追加と編集
   - 左上の「+セル追加」ボタンで新しいノードを追加
   - ノード内のテキストエリアにPythonコードを入力
   - 「実行」ボタンでコードを実行し、結果を確認

2. ノードの接続
   - ノード右側の「+」ボタンをクリックして接続を開始
   - 接続したいノードの左側の黒点をクリック
   - ESCキーで接続操作をキャンセル

3. コンテキストの継承
   - 接続されたノード間で実行コンテキストが継承される
   - 上流のノードで定義した変数を下流のノードで使用可能
   - 単一セルのみの実行のほか、「ここまで実行」を押すことでそのセルに接続されている最上流のセルから連続実行も可能

## セットアップ

### 必要条件
- uv (Python パッケージマネージャー)
- npm (Node.js パッケージマネージャー)
- nodejs (v18以上推奨)

### インストールと起動

```bash
# バックエンドサーバーの起動
$ cd backend
$ uv sync  # 依存パッケージのインストール
$ uv run uvicorn main:app --reload  # 開発サーバーの起動
```

```bash
# フロントエンドサーバーの起動
$ cd frontend
$ npm install  # 依存パッケージのインストール
$ npm run dev  # 開発サーバーの起動
```

### 環境設定

1. バックエンドの環境変数
   - 必要に応じて`.env`ファイルをbackendディレクトリに作成
   - 現時点では特別な設定は不要

2. フロントエンドの環境変数
   - `.env`ファイルをfrontendディレクトリに作成
   - 以下の設定を追加:
     ```
     VITE_API_BASE_URL=http://localhost:8000
     ```

## 技術スタック

### バックエンド
- FastAPI (Pythonウェブフレームワーク)
- uvicorn (ASGIサーバー)

### フロントエンド
- React (UIライブラリ)
- React Flow (ノードベースUIライブラリ)
- Vite (ビルドツール)
