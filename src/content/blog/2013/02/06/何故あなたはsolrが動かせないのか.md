---
title: "何故あなたはsolrが動かせないのか"
publishedAt: "2013-02-06T02:26:52+09:00"
basename: "2013/02/06/何故あなたはsolrが動かせないのか"
sourceUrl: "/entry/2013/02/06/何故あなたはsolrが動かせないのか/"
legacyUrl: "/entry/2013/02/06/何故あなたはsolrが動かせないのか/"
categories: ["java", "solr", "seasar"]
---
solrが動かない！！ 手順通りやってみたけど大量にエラーがでる！ せっかくsolrに興味があってもエラー出まくりでやる気が削がれ、諦めた方も多いのではないでしょうか。

最近solrのバージョン1.3から1.4に上げる作業をしたんですが・・・ エラー出すぎて魂抜けました そこで何故エラーが出まくるのか考えたんですが、何度考え直しても以下の答えに行き着きます。

ドキュメントがゴミ。 サンプルがすぐ動くように作られていない。

はい。それはもう鬼畜です。 動かないのはあなたのせいではありません。 どう考えてもドキュメントがゴミなのと、初期の設定ファイルが良くないのです。 単にsolr.zipを解凍して、sampleからcoreをコピーして動かそうとしても動かないんです。 随所に散りばめられた細かい罠の数々が邪魔をします。 少し見渡しただけで以下の罠があります。 [solr3.6のpingのエラー：org.apache.solr.common.SolrException: undefined field text - treeのメモ帳](/entry/20120504/p2/)[!\[\]\(http://b.hatena.ne.jp/entry/image//entry/20120504/p2\)](http://b.hatena.ne.jp/entry//entry/20120504/p2/) [solr3.6の起動時のエラー：org.apache.solr.common.SolrException: undefined field text - treeのメモ帳](/entry/20120504/p1/)[!\[\]\(http://b.hatena.ne.jp/entry/image//entry/20120504/p1\)](http://b.hatena.ne.jp/entry//entry/20120504/p1/) [solr3.6：solrj3.6を使う時に不足しているjar - treeのメモ帳](/entry/20120511/p1/)[!\[\]\(http://b.hatena.ne.jp/entry/image//entry/20120511/p1\)](http://b.hatena.ne.jp/entry//entry/20120511/p1/) [solr4.0から導入された_version_フィールド - treeのメモ帳](/entry/2012/10/19/solr4.0から導入された_version_フィールド/)[!\[\]\(http://b.hatena.ne.jp/entry/image//entry/2012/10/19/solr4.0から導入された_version_フィールド\)](http://b.hatena.ne.jp/entry//entry/2012/10/19/solr4.0から導入された_version_フィールド/) [org.apache.lucene.index.CorruptIndexException: Unknown format version: -9 - treeのメモ帳](/entry/2013/01/23/org_apache_lucene_index_CorruptIndexException:_Unknown_format_version:_-9/)[!\[\]\(http://b.hatena.ne.jp/entry/image//entry/2013/01/23/org_apache_lucene_index_CorruptIndexException:_Unknown_format_version:_-9\)](http://b.hatena.ne.jp/entry//entry/2013/01/23/org_apache_lucene_index_CorruptIndexException:_Unknown_format_version:_-9/)

そして問題児であるsolrconfig.[xml](http://d.hatena.ne.jp/keyword/xml)君もあなたの邪魔をします。 超巨大なsolrconfig.[xml](http://d.hatena.ne.jp/keyword/xml)（1000行以上ある）はどこを直したらいいか、最初は絶対解りません。 不要な設定も多く「サンプル用にmaxで設定書いてみました〜」的な感じなので、行数が異常に多いのです。 schema.[xml](http://d.hatena.ne.jp/keyword/xml)も余計な定義が多いです。いらいないもの削ると100行〜200行くらいになるんです。 完全に嫌がらせです。solrconfig.[xml](http://d.hatena.ne.jp/keyword/xml)に至っては、未だに理解できていない設定が多いです。 solrconfig.[xml](http://d.hatena.ne.jp/keyword/xml)は正直ほとんど触らない設定ばかりなので、ファイルを分割するなりして改善してほしいものです。

流石にsolrの事は諦めてね（^^）なんて言えないので、 tree-tipsの方にsolrの環境構築をする手順を[スクリーンショット](http://d.hatena.ne.jp/keyword/%A5%B9%A5%AF%A5%EA%A1%BC%A5%F3%A5%B7%A5%E7%A5%C3%A5%C8)付きで解説していますので、 是非参考にしてみて下さい！！ ■ 環境構築（[java](http://d.hatena.ne.jp/keyword/java) + tomcat7 + [seasar](http://d.hatena.ne.jp/keyword/seasar) + solr3.6） [tree-tips: solrのインストール | Apache Solr](http://tree-tips.appspot.com/solr/install/)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://tree-tips.appspot.com/solr/install/\)](http://b.hatena.ne.jp/entry/http://tree-tips.appspot.com/solr/install/) ■ インデックス生成とインデックス検索 [tree-tips: solrjでインデックス生成・検索 | Apache Solr](http://tree-tips.appspot.com/solr/solrj/)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://tree-tips.appspot.com/solr/solrj/\)](http://b.hatena.ne.jp/entry/http://tree-tips.appspot.com/solr/solrj/) [Apache Solr入門 ―オープンソース全文検索エンジン](http://www.amazon.co.jp/exec/obidos/ASIN/4774141755/treeapps5-22/) ![Apache Solr入門 ―オープンソース全文検索エンジン](http://ecx.images-amazon.com/images/I/51ZSdRqg5WL._SL160_.jpg)
