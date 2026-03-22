---
title: "solrのElevationコンポーネントのelevatedの取得方法が残念な件"
publishedAt: "2013-03-11T01:24:28+09:00"
basename: "2013/03/11/solrのElevationコンポーネントのelevatedの取得方法が残念な件"
sourceUrl: "/entry/2013/03/11/solrのElevationコンポーネントのelevatedの取得方法が残念な件/"
legacyUrl: "/entry/2013/03/11/solrのElevationコンポーネントのelevatedの取得方法が残念な件/"
categories: ["java", "solr"]
image: "http://ecx.images-amazon.com/images/I/51ZSdRqg5WL._SL160_.jpg"
---
先日Spatial Searchを勉強したので、 今回は息抜きにElevation Componentを勉強中です。

elevationを使った最初の感想は・・・ 「solrjでどうやってelevateを扱うのかが解らない」 elevationに限った話じゃないんですが、solrjと絡めると途端に「あれ？どうやってパラメータ変えるんだ？」 となりがちです。

とりあえず色々解って動いたので後日tree-tipsにまとめるのですが、 ちょっと仕様的にあれ？と思った事がありました。 それは・・・

elevateされたかどうかの値はfl=[elevated]を追加しないと取得できない

という仕様です。 なぜflでフィールドを指定しないと取得できないのか。謎です。 というか[wiki](http://d.hatena.ne.jp/keyword/wiki)にそんな事書いてないので、この動きに気づくのにちょっと時間かかりました。

早速tree-tipsにまとめました！！ [tree-tips: solrのElevation機能で意図的なランクアップをする | Apache Solr](http://hatenablog.com/embed?url=http%3A%2F%2Ftree-tips.appspot.com%2Fsolr%2Felevation%2F) [Apache Solr入門 ―オープンソース全文検索エンジン](http://www.amazon.co.jp/exec/obidos/ASIN/4774141755/treeapps5-22/) ![Apache Solr入門 ―オープンソース全文検索エンジン](http://ecx.images-amazon.com/images/I/51ZSdRqg5WL._SL160_.jpg)
