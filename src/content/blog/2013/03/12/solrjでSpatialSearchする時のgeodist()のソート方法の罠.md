---
title: "solrjでSpatialSearchする時のgeodist()のソート方法の罠"
publishedAt: "2013-03-12T00:47:25+09:00"
basename: "2013/03/12/solrjでSpatialSearchする時のgeodist()のソート方法の罠"
sourceUrl: "/entry/2013/03/12/solrjでSpatialSearchする時のgeodist()のソート方法の罠/"
legacyUrl: "/entry/2013/03/12/solrjでSpatialSearchする時のgeodist()のソート方法の罠/"
categories: ["java", "solr"]
image: "http://ecx.images-amazon.com/images/I/51ZSdRqg5WL._SL160_.jpg"
---
先日tree-tipsでsolrのSpatial Searchによる空間検索についての記事をアップしました。 [tree-tips: solrでSpatialSearchするためのschema.xml設定\(LatLonType\) | Apache Solr](http://hatenablog.com/embed?url=http%3A%2F%2Ftree-tips.appspot.com%2Fsolr%2Fspatialsearch%2Fschemaxml%2F) 今回はsolrjからSpatial Searchをしようと色々試したのですが、

geodist()による距離のソートができない！

という感じで激しく悩みました。 （最終的に解決方法は解りました）

solrQuery.setSortFieldで指定

```java
public SolrSearchResult<AddressDocument> getSpatialCircle() {
    SolrQuery solrQuery = new SolrQuery();
    solrQuery.setQuery("*:*");
    solrQuery.setFilterQueries("{!geofilt sfield=latlng}");
    solrQuery.setParam("pt", "35.698683,139.774219");
    solrQuery.setParam("d", "2");
    solrQuery.setSortField("geodist()", SolrQuery.ORDER.asc);
    return getResultList(solrQuery, AddressDocument.class);
```

結果↓

```java
2013/03/12 12:08:38:018 ERROR - SolrCore.log org.apache.solr.common.SolrException: sort param could not be parsed as a query, and is not a field that exists in the index: geodist()
    at org.apache.solr.search.QueryParsing.parseSort(QueryParsing.java:343)
    at org.apache.solr.search.QParser.getSort(QParser.java:282)
    at org.apache.solr.handler.component.QueryComponent.prepare(QueryComponent.java:124)
    at org.apache.solr.handler.component.SearchHandler.handleRequestBody(SearchHandler.java:185)
    at org.apache.solr.handler.RequestHandlerBase.handleRequest(RequestHandlerBase.java:129)
    at org.apache.solr.core.SolrCore.execute(SolrCore.java:1699)
    at org.apache.solr.servlet.SolrDispatchFilter.execute(SolrDispatchFilter.java:455)
    at org.apache.solr.servlet.SolrDispatchFilter.doFilter(SolrDispatchFilter.java:276)
    at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:243)
    at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:210)
    at org.seasar.extension.filter.EncodingFilter.doFilter(EncodingFilter.java:69)
    at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:243)
    at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:210)
    at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:222)
    at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:123)
    at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:171)
    at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:99)
    at org.apache.catalina.valves.AccessLogValve.invoke(AccessLogValve.java:936)
    at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:118)
    at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:407)
    at org.apache.coyote.http11.AbstractHttp11Processor.process(AbstractHttp11Processor.java:1004)
    at org.apache.coyote.AbstractProtocol$AbstractConnectionHandler.process(AbstractProtocol.java:589)
    at org.apache.tomcat.util.net.JIoEndpoint$SocketProcessor.run(JIoEndpoint.java:310)
    at java.util.concurrent.ThreadPoolExecutor$Worker.runTask(ThreadPoolExecutor.java:895)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:918)
    at java.lang.Thread.run(Thread.java:680)
Caused by: org.apache.lucene.queryparser.classic.ParseException: geodist - not enough parameters:[]
    at org.apache.solr.search.function.distance.HaversineConstFunction$1.parse(HaversineConstFunction.java:112)
    at org.apache.solr.search.FunctionQParser.parseValueSource(FunctionQParser.java:354)
    at org.apache.solr.search.FunctionQParser.parse(FunctionQParser.java:70)
    at org.apache.solr.search.QParser.getQuery(QParser.java:143)
    at org.apache.solr.search.QueryParsing.parseSort(QueryParsing.java:272)
    ... 25 more
```

パラメータが足りないそうです。

solrQuery.setParamで指定

```java
public SolrSearchResult<AddressDocument> getSpatialCircle() {
    SolrQuery solrQuery = new SolrQuery();
    solrQuery.setQuery("*:*");
    solrQuery.setFilterQueries("{!geofilt sfield=latlng}");
    solrQuery.setParam("pt", "35.698683,139.774219");
    solrQuery.setParam("d", "2");
    solrQuery.setParam("sort", "geodist() desc");
    return getResultList(solrQuery, AddressDocument.class);
```

結果↓

```java
2013/03/12 12:10:46:472 ERROR - SolrCore.log org.apache.solr.common.SolrException: sort param could not be parsed as a query, and is not a field that exists in the index: geodist()
    at org.apache.solr.search.QueryParsing.parseSort(QueryParsing.java:343)
    at org.apache.solr.search.QParser.getSort(QParser.java:282)
    at org.apache.solr.handler.component.QueryComponent.prepare(QueryComponent.java:124)
    at org.apache.solr.handler.component.SearchHandler.handleRequestBody(SearchHandler.java:185)
    at org.apache.solr.handler.RequestHandlerBase.handleRequest(RequestHandlerBase.java:129)
    at org.apache.solr.core.SolrCore.execute(SolrCore.java:1699)
    at org.apache.solr.servlet.SolrDispatchFilter.execute(SolrDispatchFilter.java:455)
    at org.apache.solr.servlet.SolrDispatchFilter.doFilter(SolrDispatchFilter.java:276)
    at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:243)
    at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:210)
    at org.seasar.extension.filter.EncodingFilter.doFilter(EncodingFilter.java:69)
    at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:243)
    at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:210)
    at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:222)
    at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:123)
    at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:171)
    at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:99)
    at org.apache.catalina.valves.AccessLogValve.invoke(AccessLogValve.java:936)
    at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:118)
    at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:407)
    at org.apache.coyote.http11.AbstractHttp11Processor.process(AbstractHttp11Processor.java:1004)
    at org.apache.coyote.AbstractProtocol$AbstractConnectionHandler.process(AbstractProtocol.java:589)
    at org.apache.tomcat.util.net.JIoEndpoint$SocketProcessor.run(JIoEndpoint.java:310)
    at java.util.concurrent.ThreadPoolExecutor$Worker.runTask(ThreadPoolExecutor.java:895)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:918)
    at java.lang.Thread.run(Thread.java:680)
Caused by: org.apache.lucene.queryparser.classic.ParseException: geodist - not enough parameters:[]
    at org.apache.solr.search.function.distance.HaversineConstFunction$1.parse(HaversineConstFunction.java:112)
    at org.apache.solr.search.FunctionQParser.parseValueSource(FunctionQParser.java:354)
    at org.apache.solr.search.FunctionQParser.parse(FunctionQParser.java:70)
    at org.apache.solr.search.QParser.getQuery(QParser.java:143)
    at org.apache.solr.search.QueryParsing.parseSort(QueryParsing.java:272)
    ... 25 more
```

同じですね。

ふりだしに戻る

一体何がいけないのか解りません。 完全に解らなくなったので、solr [wiki](http://d.hatena.ne.jp/keyword/wiki)を見直します。 うーん、geofiltの書き方が何パターンかあるようだけど、これは違うよなぁ・・・・ ・・ ・・・ ・・・・ ・・・・・まさか・・・

変更前のクエリ現在のクエリは以下のように、function内でフィールドを指定しています。

```
http://localhost:8080/solr-server/address/select?q=*:*&fq={!geofilt sfield=latlng}&pt=35.649451,139.912386&d=2&sort=geodist() asc
```

変更後のクエリsfieldの指定をfunctionの外でも定義できるので試してみます。

```
http://localhost:8080/solr-server/address/select?q=*:*&fq={!geofilt}&sfield=latlng&pt=35.649451,139.912386&d=2&sort=geodist() asc
```

solrjでコーディングすると以下の通りです。sfieldをfunction外に出してみました。

```java
public SolrSearchResult<AddressDocument> getSpatialCircle() {
    SolrQuery solrQuery = new SolrQuery();
    solrQuery.setQuery("*:*");
    solrQuery.setFilterQueries("{!geofilt}"); // sfield指定を除去
    solrQuery.setParam("sfield", "latlng"); // function外でsfieldを指定
    solrQuery.setParam("pt", "35.698683,139.774219");
    solrQuery.setParam("d", "2");
    solrQuery.setParam("sort", "geodist() asc");
    return getResultList(solrQuery, AddressDocument.class);
}
```

さて、これでどうなるか・・・

```java
2013/03/12 12:35:33:090 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.699092,139.77448
2013/03/12 12:35:33:090 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.699659,139.773818
2013/03/12 12:35:33:091 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.697321,139.774085
2013/03/12 12:35:33:091 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.698071,139.776265
2013/03/12 12:35:33:091 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.697735,139.776175
2013/03/12 12:35:33:091 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.700873,139.774364
2013/03/12 12:35:33:091 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.700764,139.772721
2013/03/12 12:35:33:091 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.697103,139.776492
2013/03/12 12:35:33:092 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.701011,139.77517
2013/03/12 12:35:33:092 INFO - AddressSearcherTest.getSpatialCircle 東京都 / 35.696159,139.773758
```

できた・・・

(；＾ω＾)これは酷い

マニュアルに何も書いてないから、こんな動きをする事は解らないよなぁ・・ これは多分solrj側のクエリのパース処理がfunction内では正常に行われないからなんでしょうね。 これ実はバグなんじゃないかと思ってます。 「これが仕様です！」とか言われたら「そうですか」で終わっちゃうんですけどね。

という事で、後日tree-tipsにこれらをまとめます。 こうしてtree-tipsが充実していく訳ですが、同時にsolrの情報の少なさが露呈されてちょっと悲しいですね。

早速記事をアップしました！ [tree-tips: solrjでSpatialSearchの実装をする | Apache Solr](http://hatenablog.com/embed?url=http%3A%2F%2Ftree-tips.appspot.com%2Fsolr%2Fsolrj%2Fspatial_search%2F) [Apache Solr入門 ―オープンソース全文検索エンジン](http://www.amazon.co.jp/exec/obidos/ASIN/4774141755/treeapps5-22/) ![Apache Solr入門 ―オープンソース全文検索エンジン](http://ecx.images-amazon.com/images/I/51ZSdRqg5WL._SL160_.jpg)
