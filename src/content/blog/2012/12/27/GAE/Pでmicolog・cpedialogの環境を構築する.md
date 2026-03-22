---
title: "GAE/Pでmicolog・cpedialogの環境を構築する"
publishedAt: "2012-12-27T17:26:00+09:00"
basename: "2012/12/27/GAE/Pでmicolog・cpedialogの環境を構築する"
sourceUrl: "/entry/2012/12/27/GAE/Pでmicolog・cpedialogの環境を構築する/"
legacyUrl: "/entry/2012/12/27/GAE/Pでmicolog・cpedialogの環境を構築する/"
categories: ["gae", "サイト作成"]
image: "/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png"
---
ちょっとだけ試してみました〜

![f:id:treeapps:20170917230836p:plain](/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png)

[tree-tips: GAEにmicologをインストールする | Google App Engine](http://tree-tips.appspot.com/gae/install/micolog/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://tree-tips.appspot.com/gae/install/micolog/\)](http://b.hatena.ne.jp/entry/http://tree-tips.appspot.com/gae/install/micolog/) tree-tipsの方にGAE/Pでmicologを動かすための手順を公開したのですが、 どうやらmicolog以外にも適用できるようです。 この記事はsrcフォルダにmicologをコピーしましたが、cpedialogをコピーしても動きました。

これはGAE/J、というかjavaとは大違いですね。 javaだったらネームスペースが違うだの、大量のエラーが出るでしょう。 こういうところはLL言語の羨ましいところです。

動いたんですが、cpedialogは使わないんですけどね。 micologのソースを少し見てからcpedialogを入れたんですが、cpedialogはどうも余計な挙動が目立つし、初期画面が凝りすぎている。

私にとってはデフォルトは最小限の機能のみでいい、のです。凝ったものはテンプレートとして配布してデフォルトはシンプルにして欲しい。 カスタマイズするのに大量のソースを読みたくないのですよ。 そういう理由で、デフォルトがシンプルなmicologは私にとっては都合がよかったです。

このmicologを使ってSEO情報サイトを作ろうとしているのですが、CMSは階層型のカテゴリ構造が表現し難い、という問題にぶち当たってます。（最初から薄々解ってた事ですが）

### 自分が望んでいる構造

```html
親カテゴリ
　├─子カテゴリ１
　│　　├─ページ１
　│　　└─ページ２
　└─子カテゴリ２
　　　　├─ページ１
　　　　└─ページ２
```

### micologの構造

```html
親カテゴリ
子カテゴリ１
子カテゴリ２
```

親子関係の機能自体は有るんですが、完全にフラットな構造になっています。 これはユーザビリティ・UI的に明らかに好ましくないので、なんとかしてみたいと思います。

[Google Code Archive - Long-term storage for Google Code Project Hosting.](http://code.google.com/p/micolog/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://code.google.com/p/micolog/\)](http://b.hatena.ne.jp/entry/http://code.google.com/p/micolog/) [Google Code Archive - Long-term storage for Google Code Project Hosting.](http://code.google.com/p/cpedialog/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://code.google.com/p/cpedialog/\)](http://b.hatena.ne.jp/entry/http://code.google.com/p/cpedialog/)
