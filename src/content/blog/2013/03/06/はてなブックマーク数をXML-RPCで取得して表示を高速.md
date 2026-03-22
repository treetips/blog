---
title: "はてなブックマーク数をXML-RPCで取得して表示を高速化"
publishedAt: "2013-03-06T00:55:12+09:00"
basename: "2013/03/06/はてなブックマーク数をXML-RPCで取得して表示を高速"
sourceUrl: "/entry/2013/03/06/はてなブックマーク数をXML-RPCで取得して表示を高速/"
legacyUrl: "/entry/2013/03/06/はてなブックマーク数をXML-RPCで取得して表示を高速/"
categories: ["java", "サイト作成", "gae"]
image: "/hatena-images/images/fotolife/t/treeapps/20160521/20160521191008.png"
---
実はXML-RPCで取得できるんですよ〜 ![f:id:treeapps:20160521191008p:plain](/hatena-images/images/fotolife/t/treeapps/20160521/20160521191008.png)

[自分のブログに「○○users」を表示する - はてなブックマークヘルプ](http://b.hatena.ne.jp/help/count#count)[!\[\]\(//b.hatena.ne.jp/entry/image/http://b.hatena.ne.jp/help/count%23count\)](http://b.hatena.ne.jp/entry/http://b.hatena.ne.jp/help/count%23count) はてなブックマークの数を、画像で取得する機能があり、皆使っていますね。 しかし手軽に使える反面、デメリットもあるのです。

問題通常このAPIは「1URLに付き1カウント数を取得する」ためのものです。 つまり、100URLあったら100回画像取得のためのリクエストが送信されます。 tree-tipsの場合は70URL程度あるので、70回APIを呼んでカウント画像を取得しているのです。 これが実は結構な負荷になっており、サイトのパフォーマンスを低下させる原因になっているのです。 はてなブックマークの他にも、tweetbuzzでtweet数を取得することもできます。 http://tweetbuzz.jp/static/imgcounter[!\[\]\(//b.hatena.ne.jp/entry/image/http://tweetbuzz.jp/static/imgcounter\)](http://b.hatena.ne.jp/entry/http://tweetbuzz.jp/static/imgcounter) しかしこのtweetbuzzははてなより遥かに重く、非常にサイトパフォーマンスを低下させます。 この2つが原因で、GoogleAnalytics等のサイトパフォーマンスのレポートは酷いスコアになりがちです。

また、小さいとはいえ、50〜100個近い画像を表示する事になるので、 ブラウザへの負担もかかるでしょう。

解決策この問題を打開すべく、はてなブックマーク件数取得APIを使ってみました。 [はてなブックマーク件数取得APIとは - はてなキーワード](http://d.hatena.ne.jp/keyword/%A4%CF%A4%C6%A4%CA%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%B7%EF%BF%F4%BC%E8%C6%C0API)[!\[\]\(//b.hatena.ne.jp/entry/image/http://d.hatena.ne.jp/keyword/%A4%CF%A4%C6%A4%CA%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%B7%EF%BF%F4%BC%E8%C6%C0API\)](http://b.hatena.ne.jp/entry/http://d.hatena.ne.jp/keyword/%A4%CF%A4%C6%A4%CA%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%B7%EF%BF%F4%BC%E8%C6%C0API) XML-RPCを使って、URLを渡すと、そのURLのブックマーク数が取得できます。 最大50URLを一気に調べる事ができ、XML-RPCのパフォーマンスも良好です。

現在試しにXML-RPCで全URLのカウント数を取得し、EHCacheで2時間メモリにキャッシュする、 という高速化をtree-tipsで試験中です。 キャッシュの期限が過ぎた場合は再度カウント数を取得しにいきますが、 最大50件までなので、tree-tipsの場合は1秒間隔で2回、計2秒かかることになります。

本当は、cronで1時間毎にカウント数を取得 → データストアを更新 → キャッシュ更新、 キャッシュが無い場合はデータストアから取得、とすれば2秒も待たなくて済むのですが、 面倒臭いのでそこまでやってません。

総評カウント数再取得時に2秒多く待たされた方はごめんなさい。 ともあれ、メモリキャッシュ方式に変更して、サイトの表示速度が大分早くなったと思います。

なお、今までのカウント画像と何か変わった？と一瞬気づかないかもしれません。 カウント画像そっくりになるようCSSで装飾しているので、見た目の違和感も少ないと思います。[作ればわかる！Google App Engine for Javaプログラミング](http://www.amazon.co.jp/exec/obidos/ASIN/4798123021/treeapps5-22/) ![作ればわかる！Google App Engine for Javaプログラミング](http://ecx.images-amazon.com/images/I/51MtVWqlepL._SL160_.jpg)
