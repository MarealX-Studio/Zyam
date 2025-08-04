# Zyam

[![Pricing](https://img.shields.io/badge/pricing-free-blue?logo=free&labelColor=528bff&color=155EEF)](https://zyam.top)
[![GitHub Stars](https://img.shields.io/github/stars/MarealX-Studio/Zyam?style=social)](https://github.com/MarealX-Studio/Zyam/stargazers)
[![GitHub Release](https://img.shields.io/github/v/release/MarealX-Studio/Zyam)](https://github.com/MarealX-Studio/Zyam/releases/latest)
[![GitHub Downloads](https://img.shields.io/github/downloads/MarealX-Studio/Zyam/total)](https://github.com/MarealX-Studio/Zyam/releases)
[![Build Status](https://github.com/MarealX-Studio/Zyam/actions/workflows/release.yml/badge.svg?branch=release)](https://github.com/MarealX-Studio/Zyam/actions/workflows/release.yml)

<div>
  <a href="https://trendshift.io/repositories/12784" target="_blank"><img src="https://trendshift.io/api/badge/repositories/12784" alt="codexu%2Fzyam | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
  <a href="https://www.producthunt.com/products/zyam-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-zyam&#0045;2" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=956348&theme=light&t=1749194675492" alt="Zyam - A&#0032;cross&#0045;platform&#0032;Markdown&#0032;note&#0045;taking&#0032;application | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</div>

## ガイド

[English](../README.md) | [简体中文](README.zh.md) | 日本語

🖥️ 公式ドキュメント：[https://zyam.top](https://zyam.top)

💬 コミュニティに参加：[WeChat/QQグループ](https://github.com/MarealX-Studio/Zyam/discussions/110)、[Discord](https://discord.gg/SXyVZGpbpk)、[Telegram](https://t.me/zyam)

Zyamは、AIを使用して記録と執筆を橋渡しし、断片化された知識を読みやすいノートに整理することに専念するクロスプラットフォームの`Markdown`ノートアプリケーションです。

![](https://s2.loli.net/2025/06/13/UbVGPrhFl3etnQz.png)

## なぜZyamを選ぶのか？

- **軽量**：[インストールパッケージ](https://github.com/MarealX-Studio/Zyam/releases)は**わずか20MB**、無料で広告やバンドルソフトウェアはありません。
- **クロスプラットフォーム**：Tauri2のクロスプラットフォーム機能のおかげで、Windows、MacOS、Linux、iOS、Androidをサポートし、無料で複数デバイスでのデータ同期をサポートします。
- `スクリーンショット`、`テキスト`、`イラスト`、`ファイル`、`リンク`など、さまざまな記録方法をサポートし、さまざまなシナリオでの断片化された記録ニーズに対応します。
- **ネイティブの`Markdown(.md)`をストレージ形式として使用**し、修正を加えず、簡単に移行できます。
- **ネイティブのオフライン使用**をサポートし、`GitHub、Giteeプライベートリポジトリ`へのリアルタイム同期と履歴のロールバック、WebDAV同期をサポートします。
- **AI強化**：ChatGPT、Gemini、Ollama、LM Studio、Grokなどのモデルを設定可能で、カスタムサードパーティモデル設定をサポートします。
- **RAG**：あなたのノートはあなたの知識ベースです。埋め込みモデルと再ランキングモデルをサポートします。

## スクリーンショット

記録：

![1.png](https://s2.loli.net/2025/05/19/Cs5viKfkqb2HJmd.png)

執筆：

![2.png](https://s2.loli.net/2025/05/19/5vwQBPoLr6jzgUA.png)

テーマ：

![3.png](https://s2.loli.net/2025/05/19/8yU72prmWdsCHeu.png)

## 記録から執筆へ

従来のノートアプリケーションは通常、記録機能を提供しません。ユーザーは手動でコンテンツをコピーして貼り付ける必要があり、記録の効率が大幅に低下します。断片化された記録コンテンツに直面すると、整理に多大な労力が必要です。

Zyamは`記録`と`執筆`のページに分かれており、次の関係があります：

- 記録はノートに整理され、執筆ページに転送されて詳細な作成が行われます。
- 執筆中はいつでも記録を挿入できます。

### 記録

記録機能は**AIチャットボット**に似ていますが、対話中に以前に記録したコンテンツと関連付けることができ、対話モードから整理モードに切り替えて、記録を読みやすいノートに整理できます。

次の補助機能は、より効果的に記録するのに役立ちます：

- **タグ**：さまざまな記録シナリオを区別するため。
- **ペルソナ**：カスタムプロンプトをサポートし、AIアシスタントを正確に制御します。
- **クリップボードアシスタント**：クリップボード内のテキストや画像を自動的に認識し、リストに記録します。

### 執筆

執筆セクションは、**ファイルマネージャー**と**Markdownエディター**の2つの部分に分かれています。

**ファイルマネージャー**

- ローカルMarkdownファイルとGitHub同期ファイルの管理をサポートします。
- 無制限のディレクトリ階層をサポートします。
- 複数のソート方法をサポートします。

**Markdownエディター**

- WYSIWYG、即時レンダリング、分割画面プレビューモードをサポートします。
- バージョン管理をサポートし、履歴のロールバックが可能です。
- 会話、継続、ポリッシュ、翻訳機能のためのAI支援をサポートします。
- 画像ホスティングをサポートし、画像をアップロードしてMarkdown画像リンクに変換します。
- HTMLからMarkdownへの変換をサポートし、コピーされたブラウザコンテンツを自動的にMarkdown形式に変換します。
- アウトライン、数式、マインドマップ、チャート、フローチャート、ガントチャート、シーケンス図、五線譜、マルチメディア、音声読み上げ、タイトルアンカー、コードハイライトとコピー、graphvizレンダリング、plantuml UML図をサポートします。
- リアルタイムのローカルコンテンツ保存、遅延（10秒間編集されていない場合）自動同期、履歴のロールバックをサポートします。

## 使い方

### ダウンロード

現在、Mac、Windows、Linuxをサポートしています。Tauri2のクロスプラットフォーム機能のおかげで、将来的にはiOSとAndroidもサポートします。

| Windows | MacOS | Linux | Android | iOS |
| --- | --- | --- | --- | --- |
| ✅ beta | ✅ beta | ✅ beta | 🛠️ alpha | 🛠️ alpha |
| [ダウンロード 17 MB](https://zyam.top/ja/guide/download.html) | [ダウンロード 20.7 MB](https://zyam.top/ja/guide/download.html) | [ダウンロード 21.7 MB](https://zyam.top/ja/guide/download.html) | [ダウンロード](https://zyam.top/ja/guide/download.html) | [ダウンロード](https://zyam.top/ja/guide/download.html) |

> [UpgradeLink アップデートとダウンロードサービスを提供します](http://upgrade.toolsetlink.com/upgrade/example/tauri-example.html)

### 強化

ノートアプリケーションは設定なしで直接使用できます。より良い体験をしたい場合は、設定ページを開いてAIと同期を設定してください。

## その他の機能

- グローバル検索：特定のコンテンツを迅速に検索してジャンプできます。
- 画像ホスティング管理：画像リポジトリのコンテンツを便利に管理できます。
- テーマと外観：ダークテーマをサポートし、Markdown、コードなどの外観設定をサポートします。
- 国際化サポート：現在、中国語と英語に対応しています。

## 貢献

- [貢献ガイドを読む](CONTRIBUTING.md)
- [更新計画](https://github.com/MarealX-Studio/Zyam/issues/46)
- [バグや改善提案を提出する](https://github.com/MarealX-Studio/Zyam/issues)
- [ディスカッション](https://github.com/MarealX-Studio/Zyam/discussions)

## 貢献者

<a href="https://github.com/MarealX-Studio/Zyam/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MarealX-Studio/Zyam" />
</a>

## スポンサー

<div>
  <a href="https://docs.siliconflow.cn/cn/usercases/use-siliconcloud-in-Zyam?utm_source=Zyam" target="_blank">
    <img src="https://s2.loli.net/2025/06/11/65TLRh813e2YFzr.png" />
  </a>
  <a href="https://www.qiniu.com/products/ai-token-api?utm_source=Zyam" target="_blank">
    <img src="https://s2.loli.net/2025/06/11/OKJq542lTs7U9xg.png" />
  </a>
  <a href="http://upgrade.toolsetlink.com/upgrade/example/tauri-example.html" target="_blank">
    <img src="https://s2.loli.net/2025/06/11/r2dqNIWVXp4RaFe.png" />
  </a>
</div>

## Star履歴

[![Star History Chart](https://api.star-history.com/svg?repos=MarealX-Studio/Zyam&type=Date)](https://www.star-history.com/#MarealX-Studio/Zyam&Date)
