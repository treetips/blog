---
title: "tree-tipsでtwitter bootstrap2.0を使ってみて思ったこと"
publishedAt: "2012-11-08T00:35:51+09:00"
basename: "2012/11/08/tree-tipsでtwitter_bootstrap2.0を使ってみて思ったこと"
sourceUrl: "/entry/2012/11/08/tree-tipsでtwitter_bootstrap2.0を使ってみて思ったこと/"
legacyUrl: "/entry/2012/11/08/tree-tipsでtwitter_bootstrap2.0を使ってみて思ったこと/"
categories: ["サイト作成"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418115102.png"
---
ちょっとした感想を書いてみました〜

![f:id:treeapps:20180418115102p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418115102.png)

前回の記事に引き続き、思ったことシリーズです。 結論を先に言ってしまうと、bootstrapを使ってよかった事は殆ど無かった

ボタンのグループ機能と、フォームを縦に整列できるのだけは良かったです。 特に不便だと思った事を列挙します。

- 設定できる列の数が少なすぎる。（最大12列）
- hero・well・p要素のpadding・marginが大きすぎて見栄えが悪すぎる。
- 要素の色が少ないので、bootstrap臭がし過ぎる。

一番困ったのが列数です。 サイドバーが2列か3列かで迷ったのですが、2列と3列の横幅の差が大きいのです。 3列だとちょっと幅が広すぎるけど、どうしようもない。 paddingとmarginはもう諦めて、セレクタを上書きしまくって対応しました。 [twitter bootstrap本体を触らずにカスタマイズする方法 - 文系プログラマによるTIPSブログ](/entry/2012/11/03/twitter_bootstrapをカスタマイズして使う/)[!\[\]\(//b.hatena.ne.jp/entry/image//entry/2012/11/03/twitter_bootstrapをカスタマイズして使う\)](http://b.hatena.ne.jp/entry//entry/2012/11/03/twitter_bootstrapをカスタマイズして使う/) 要素の色は面倒なので諦めてます。

結局今のtree-tipsを見ると、bootstrap臭をなくす事に注力してしまい、 bootstrapを使う＝デザインに時間をかけない、という方向と逆の方向にいっているのですね。

個人的には列数を30個近くにできる1kb css frameworkがおすすめです。 細かいデザインが気になる人にはbootstrapは向かないのかもしれませんね。
