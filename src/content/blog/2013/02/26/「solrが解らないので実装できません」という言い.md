---
title: "「solrが解らないので実装できません」という言い訳が多い件"
publishedAt: "2013-02-26T21:50:32+09:00"
basename: "2013/02/26/「solrが解らないので実装できません」という言い"
sourceUrl: "/entry/2013/02/26/「solrが解らないので実装できません」という言い/"
legacyUrl: "/entry/2013/02/26/「solrが解らないので実装できません」という言い/"
categories: ["solr", "mysql", "雑談"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418122452.png"
---
ちょっと、アレですね・・・

![f:id:treeapps:20180418122452p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418122452.png)

solrに限った話ではありませんが、最近「solrが解らないので実装できない・見積もりできない」という言い訳を沢山耳にします。

このセリフを吐く人は大抵solr以外の事もほとんど解ってないです。

solrが解らないから他も解らない事にしたいのか、と思ってしまう程に理解していない。

こんなセリフを言ってしまわないように、情報を整理し、思考停止状態に陥らないようにしましょう。

- [以外の部分が理解できているか確認する](#以外の部分が理解できているか確認する)
- [solrの何が解らないのかを明確にする](#solrの何が解らないのかを明確にする)
- [インデクサが解らないのかサーチャーが解らないのか](#インデクサが解らないのかサーチャーが解らないのか)
- [solrの制約について](#solrの制約について)

<a id="以外の部分が理解できているか確認する"></a>

### 以外の部分が理解できているか確認する

そもそもsolr以外は理解できており、問題無いのか。

例えば「solrの事は全く考えなくていいから、他の部分を説明して」と言われた時、説明できるか。説明できなかったらそもそもsolr以外の事を理解する必要があります。

<a id="solrの何が解らないのかを明確にする"></a>

### solrの何が解らないのかを明確にする

前述のセリフを吐く人のほとんどはそもそも何が解らないのかを説明できません。

概念的にはMySQLとsolrは似通っているので、まずMySQLだったらどうか、を考えます。

solrには stored indexed という概念がありますが、MySQLにもありますよ。solrのstored = MySQLのselect句、 solrのindexed = MySQLのB-TreeIndex、です。

solrはMongoDBのようにスキーマレスではないので、MySQLに似ています。MySQLが理解できているなら（一般常識レベルの知識でOK）、solrも対して変わりません。

検索ロジックは隠蔽され、検索条件DTOを引数に渡すとDTOのリスト返るという実装が多いかと思うので検索で悩む事はほとんど無いはず。（隠蔽された内部処理を理解する必要はありません）

<a id="インデクサが解らないのかサーチャーが解らないのか"></a>

### インデクサが解らないのかサーチャーが解らないのか

solrはインデックスの生成とインデックスの検索は大分世界が違う（ロジック的に）ので、どちらが解らないのかを明確にします。

サーチャーの場合は大抵隠蔽されているので、何も解らない状況にはなり難いでしょう。インデクサはサーチャーより複雑（アプリの仕様的に仕方なく変な実装してるとか）なので、インデクサは素直に解る人に聞きに行きます。

<a id="solrの制約について"></a>

### solrの制約について

制約については経験者に聞いた方がいいです。MySQLと比べるとsolrは制約が多いので、把握しておかないと酷い目に合うかもしれません。

その辺りはtree-tipsにまとめているので、良かったら見てあげて下さい。 [tree-tips: solrを使う前に知っておくべき事 | Apache Solr](http://tree-tips.appspot.com/solr/use/notes/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://tree-tips.appspot.com/solr/use/notes/\)](http://b.hatena.ne.jp/entry/http://tree-tips.appspot.com/solr/use/notes/) [Apache Solr入門 ―オープンソース全文検索エンジン](http://www.amazon.co.jp/exec/obidos/ASIN/4774141755/treeapps5-22/) ![Apache Solr入門 ―オープンソース全文検索エンジン](https://images-fe.ssl-images-amazon.com/images/I/51ZSdRqg5WL._SL160_.jpg)
