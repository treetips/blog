---
title: "solrで緯度経度をボックス検索する"
publishedAt: "2012-08-03T03:02:38+09:00"
basename: "2012/08/03/solrで緯度経度をボックス検索する"
sourceUrl: "/entry/2012/08/03/solrで緯度経度をボックス検索する/"
legacyUrl: "/entry/2012/08/03/solrで緯度経度をボックス検索する/"
categories: ["java", "solr", "mysql"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png"
---
![f:id:treeapps:20180418131549p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png)

solrに限った話ではありませんが、

最近緯度・経度を使って、ボックス（四角形の範囲内）検索をする要件が増えています。

方法はいくつかありますが、やりやすい方式を上げてみます。

緯度をbetween検索、かつ、軽度をbeween検索。

この方式が一番汎用性があるかもしれません。

X軸とY軸に対して、四角形になるよう検索するだけです。

例えばディズニーランド latitude=35.632507, longitude=139.88127 、の場合、

(latitude between 35.630 and 35.640) and (longitude between 139.880 and 139.881)

というようなbetween検索を行います。

例えばマウスでドラッグドロップした範囲を検索する場合は、ドラッグ地点とドロップ地点の座標が算出できるのでbetween検索できます。

これは、solrであろうとmysqlであろうとjavaであろうとできる検索方式です。

geohash（ジオハッシュ）検索を行う。

[!\[\]\(//b.hatena.ne.jp/entry/image/http://ja.wikipedia.org/wiki/%E3%82%B8%E3%82%AA%E3%83%8F%E3%83%83%E3%82%B7%E3%83%A5\)](http://b.hatena.ne.jp/entry/http://ja.wikipedia.org/wiki/%E3%82%B8%E3%82%AA%E3%83%8F%E3%83%83%E3%82%B7%E3%83%A5)[ジオハッシュ - Wikipedia](http://ja.wikipedia.org/wiki/%E3%82%B8%E3%82%AA%E3%83%8F%E3%83%83%E3%82%B7%E3%83%A5)

ジオハッシュは、latitude、longitudeをbase32でハッシュ化して文字列に変換します。

文字列が短い程精度が下がります（地図が縮小される。スケールアウト。）

データストア側（DBやsolr）にはhash化した文字列をセットしておき、検索時にhash文字列で前方一致検索します。

メリットは、geohashは前方一致検索なので、前述のbetween検索より更に速い点。

hash化した文字列は文字数が少ないので、solrやmysqlにインデックス化しやすい為、検索効率は高くなりやすい。

デメリットは、base32という事は、1文字削ると32倍スケールアウトする点と、任意のボックスにできない点です。

大まかに2種類の方法がありますが、ボックスの範囲とスケールの要件を握れるならgeohash、

要件を握れないなら緯度経度をbetween検索、等と使い分けるといいかと思います。
