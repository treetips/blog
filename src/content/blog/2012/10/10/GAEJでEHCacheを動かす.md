---
title: "GAEJでEHCacheを動かす"
publishedAt: "2012-10-10T03:04:14+09:00"
basename: "2012/10/10/GAEJでEHCacheを動かす"
sourceUrl: "/entry/2012/10/10/GAEJでEHCacheを動かす/"
legacyUrl: "/entry/2012/10/10/GAEJでEHCacheを動かす/"
categories: ["java", "gae"]
image: "/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png"
---
ちゃんと動きますよ〜

![f:id:treeapps:20170917230836p:plain](/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png)

[GAEJのJCacheの寿命設定は実装されているの？ - 文系プログラマによるTIPSブログ](/entry/2012/10/10/GAEJのJCacheの寿命設定は実装されているの？/)

前回のトピックで、GAEJでJCacheによるmemcacheの寿命設定が効かない点について話しました。 そこでふと思い出したのが EHCache です。 [Java API、使ってますか?\(30\) Javaアプリケーションにオブジェクトのキャッシュ機構を提供するJCache API | マイナビニュース](http://news.mynavi.jp/column/jsr/030/index.html)[!\[\]\(//b.hatena.ne.jp/entry/image/http://news.mynavi.jp/column/jsr/030/index.html\)](http://b.hatena.ne.jp/entry/http://news.mynavi.jp/column/jsr/030/index.html) そうです。実はEHCacheはJCacheの参照実装なのです。つまり、基本的に同じ事ができるものです。 gae先生が用意するJCacheが信用できないので、実績のあるEHCacheをGAEJで動かすことにしました。

で、適当に実装。お、ローカルでは問題無いや。では本番環境にデプロイっと。

```java
net.sf.ehcache.CacheException: java.security.AccessControlException: access denied (java.lang.RuntimePermission modifyThreadGroup)
	at net.sf.ehcache.CacheManager.init(CacheManager.java:393)
	at net.sf.ehcache.CacheManager.<init>(CacheManager.java:259)
	at net.sf.ehcache.CacheManager.newInstance(CacheManager.java:1029)

Caused by: java.security.AccessControlException: access denied (java.lang.RuntimePermission modifyThreadGroup)
	at java.security.AccessControlContext.checkPermission(AccessControlContext.java:355)
	at java.security.AccessController.checkPermission(AccessController.java:567)
	at java.lang.SecurityManager.checkPermission(SecurityManager.java:549)

net.sf.ehcache.CacheException: java.security.AccessControlException: access denied (java.lang.RuntimePermission modifyThreadGroup)
	at net.sf.ehcache.CacheManager.init(CacheManager.java:393)
	at net.sf.ehcache.CacheManager.<init>(CacheManager.java:259)
	at net.sf.ehcache.CacheManager.newInstance(CacheManager.java:1029)

Caused by: java.security.AccessControlException: access denied (java.lang.RuntimePermission modifyThreadGroup)
	at java.security.AccessControlContext.checkPermission(AccessControlContext.java:355)
	at java.security.AccessController.checkPermission(AccessController.java:567)
	at java.lang.SecurityManager.checkPermission(SecurityManager.java:549)
```

ですよね〜 AmazonRDSのようにファイルシステムにアクセスさせて貰えないですよね〜

・・・面倒くさい。 ならオンメモリでどうだ。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="ehcache.xsd" >

    <cacheManagerEventListenerFactory class="" properties="" />

    <defaultCache
        eternal="false"
        maxElementsInMemory="10000"
        memoryStoreEvictionPolicy="LRU"
        overflowToDisk="false"
        timeToIdleSeconds="120"
        timeToLiveSeconds="120" >
    </defaultCache>

    <cache
        name="10minitue"
        eternal="false"
        maxElementsInMemory="100"
        memoryStoreEvictionPolicy="LFU"
        timeToIdleSeconds="600"
        timeToLiveSeconds="600" />
</ehcache>
```

うむ。どうやらディスクキャッシュしなければEHCacheもGAEJで動きますね。 ちゃんと寿命設定も効いてます！！！

途中経過は飛ばしましたが、実はEHCacheは2.4.7までしかGAEに対応していないようです。

> Resolved Issues EHC-887 - ehcache-core-2.4.6 failed to run in GAE
>
>  http://www.terracotta.org/confluence/display/release/Release+Notes+Ehcache+Core+2.4

2.4.6でGAEJで動かないのが、2.4.7で治ったとのこと。 しかし注意なのが、現在の最新版である2.6.0ではGAE上で動かないこと。

ということでEHCacheをGAEJで動かす時のまとめ。

・EHCache ver2.4.7を使うべし ・ディスクキャッシュは使わない
