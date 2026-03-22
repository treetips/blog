---
title: "GAEで開発を続けるのはコストがかかり過ぎる気がする"
publishedAt: "2013-01-03T04:08:29+09:00"
basename: "2013/01/03/GAEで開発を続けるのはコストがかかり過ぎる気がす"
sourceUrl: "/entry/2013/01/03/GAEで開発を続けるのはコストがかかり過ぎる気がす/"
legacyUrl: "/entry/2013/01/03/GAEで開発を続けるのはコストがかかり過ぎる気がす/"
categories: ["gae", "slim3", "サイト作成"]
image: "/hatena-images/images/fotolife/t/treeapps/20160521/20160521191008.png"
---
どうなんでしょうねGAEの開発って。

![f:id:treeapps:20160521191008p:plain](/hatena-images/images/fotolife/t/treeapps/20160521/20160521191008.png)

GAEの開発ですが、非常にコストが高く感じます。 slim3＋scenic3でtree-tipsを作り、続いて以下のサイトを試しに作ってみました。 http://tree-it-news.appspot.com/[!\[\]\(//b.hatena.ne.jp/entry/image/http://tree-it-news.appspot.com/\)](http://b.hatena.ne.jp/entry/http://tree-it-news.appspot.com/) （現在datastoreを一切使わず完全オンメモリで稼働中です。運用し続けられるか怪しい） 開発環境は同じくslim3＋scenic3です。

datastoreがどうしても嫌で、tree-tipsではdatastoreはPV数取得以外では使いませんでした。 tree-it-newsでdatastoreをちょっと使うようにしたんですが、↓あっという間にこんな風になりました。 ![f:id:treeapps:20130103033827p:plain](/hatena-images/images/fotolife/t/treeapps/20130103/20130103033827.png) datastoreへの書き込み数上限オーバーです。 あまりにも簡単にオーバーしたのでびっくりしました。時間にしてわずか30分程度でこれです。 （cronを5分毎に回して、全件削除→データ一括書き込み、が原因です）

オーバーしたものはどうしようも無いので対策を考えていく訳ですが、 GAE自体の制限が多く、沢山の対策が必要になります。 制限はdatastoreに限った話ではありません。頑張って対策考えれば解決できるかもしれません。しかし・・・ GAEを使うこと自体どうなの？と思ってしまいました。 課金版を使っても制限自体は消えないよ？という呪縛付き。

どう考えてもデータベースのデータがメインとなるサイトは厳しい。 かといって静的ページメインのサイトならば無料ブログでいいのではないか。 serverman@VPSやsaases@VPSの最安値プランなら月額500円以下なので、VPS借りた方がコストは下がりそうです。datastoreでなくMySQLも使えますし。 しかしVPS借りるからにはそのサイトで収益（adsense等で鯖代を稼ぐ）が必要なので、あまり気軽に借りられないのですよね・・・

現状だと中々GAEを使うのは要件にマッチしにくそうなので、これからに期待、ですね。。。[作ればわかる！Google App Engine for Javaプログラミング](http://www.amazon.co.jp/exec/obidos/ASIN/4798123021/treeapps5-22/) ![作ればわかる！Google App Engine for Javaプログラミング](https://images-fe.ssl-images-amazon.com/images/I/61kcHFnzWtL._SL160_.jpg)
