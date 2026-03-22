---
title: "s2robotを使ってみました"
publishedAt: "2012-09-12T00:24:19+09:00"
basename: "2012/09/12/s2robotを使ってみました"
sourceUrl: "/entry/2012/09/12/s2robotを使ってみました/"
legacyUrl: "/entry/2012/09/12/s2robotを使ってみました/"
categories: ["java", "seasar"]
---
そういえばtree-tipsの[サイトマップ](http://d.hatena.ne.jp/keyword/%A5%B5%A5%A4%A5%C8%A5%DE%A5%C3%A5%D7)[xml](http://d.hatena.ne.jp/keyword/xml)を作ってなかったので、作る事にしました。 まだページも少ないので手動で作ろうかとも思いましたが、 せっかくなので[localhost](http://d.hatena.ne.jp/keyword/localhost)をクロールしてリンクを収集しようとしました。

[Seasar2 - S2Robot 概要](http://s2robot.sandbox.seasar.org/ja/)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://s2robot.sandbox.seasar.org/ja/\)](http://b.hatena.ne.jp/entry/http://s2robot.sandbox.seasar.org/ja/) 同じく[seasar](http://d.hatena.ne.jp/keyword/seasar)プロダクののFess [!\[\]\(http://b.hatena.ne.jp/entry/image/http://fess.sourceforge.jp/ja/\)](http://b.hatena.ne.jp/entry/http://fess.sourceforge.jp/ja/)は、 内部でsolrとs2robotを組み合わせて使ってるそうです。Fess凄い。

以下、ざっくり使ったみた感想です。

- diconファイルで設定できるし、 [java](http://d.hatena.ne.jp/keyword/java) でも設定できる、一体どっちで設定するのがいいか迷う。

- デフォルトのXPathTransFormerは機能が足りなすぎて使えない。

- 標準で並列処理できるのは素晴らしい。

本当は負荷かけても全く構わない自分のサイトの[localhost](http://d.hatena.ne.jp/keyword/localhost)に向けて、 1ページだけクロールし、そのページからアンカーリンクを取得してhrefの値を収集。 それを[サイトマップ](http://d.hatena.ne.jp/keyword/%A5%B5%A5%A4%A5%C8%A5%DE%A5%C3%A5%D7)[xml](http://d.hatena.ne.jp/keyword/xml)として使用、という事を標準機能だけでやりたかったんですが、 [XPath](http://d.hatena.ne.jp/keyword/XPath)でaタグの「ラベル」は取得できますが、 属性であるhrefが取得できず。。。（単に取得方法を知らないだけかも）

あと、クロールするページのURL（[localhost](http://d.hatena.ne.jp/keyword/localhost)）のフィルタ（[正規表現](http://d.hatena.ne.jp/keyword/%C0%B5%B5%AC%C9%BD%B8%BD)で可能）はできても、 クロールしたページ内のパース処理のフィルタ（headタグは無視とか）はできないようです。 処理的に激しく無駄なので省きたいです。

結局XPathTransFormerを参考に、HtmlTransformerを継承したSitemapTransformerを作りました。

なんか本来のクロールの使い道とは違う気がしますが、 初めてのクローラ作成と、[サイトマップ](http://d.hatena.ne.jp/keyword/%A5%B5%A5%A4%A5%C8%A5%DE%A5%C3%A5%D7)[xml](http://d.hatena.ne.jp/keyword/xml)の自動生成＋ping送信までできました。
