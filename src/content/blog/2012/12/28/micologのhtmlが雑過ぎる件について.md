---
title: "micologのhtmlが雑過ぎる件について"
publishedAt: "2012-12-28T21:53:24+09:00"
basename: "2012/12/28/micologのhtmlが雑過ぎる件について"
sourceUrl: "/entry/2012/12/28/micologのhtmlが雑過ぎる件について/"
legacyUrl: "/entry/2012/12/28/micologのhtmlが雑過ぎる件について/"
categories: ["gae"]
image: "/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png"
---
むむむむ・・・

![f:id:treeapps:20170917230836p:plain](/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png)

[Google Code Archive - Long-term storage for Google Code Project Hosting.](http://code.google.com/p/micolog/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://code.google.com/p/micolog/\)](http://b.hatena.ne.jp/entry/http://code.google.com/p/micolog/) micolog0.74で新たにブログを始めようと思い、デフォルトテンプレートのhtmlを見ながらオレオレテンプレを作っているのですが、micologのhtmlソースが雑すぎる！と感じています。

ざっと気づいた部分は以下の通り。

- 開始タグと終了タグが噛み合ってない部分がある
- javascriptがhtmlの中にベタ書きされている
- {% if entries %} と {%if entries%} のようなスペースの有り無しが統一されてない
- インデントがバラバラ
- 一定の感覚で改行されてない

こういう所がいい加減だから、普及が遅れる原因になっている気がします・・・残念・・・ しかし他のCMSも同じくらいソースが汚いです。 みんなコーディングルールを決めて統一感のあるソースを書いたりしないのかな。 汚いソースだとバグが出やすいし、機械的にコーディングできないからデメリットしかないと思います。
