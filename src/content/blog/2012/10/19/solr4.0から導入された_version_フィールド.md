---
title: "solr4.0から導入された_version_フィールド"
publishedAt: "2012-10-19T00:57:25+09:00"
basename: "2012/10/19/solr4.0から導入された_version_フィールド"
sourceUrl: "/entry/2012/10/19/solr4.0から導入された_version_フィールド/"
legacyUrl: "/entry/2012/10/19/solr4.0から導入された_version_フィールド/"
categories: ["solr"]
image: "/hatena-images/images/fotolife/t/treeapps/20180424/20180424102046.png"
---
見慣れないフィールドが増えましたね〜

![f:id:treeapps:20180424102046p:plain](/hatena-images/images/fotolife/t/treeapps/20180424/20180424102046.png)

solr4.0がリリースされたので、早速使ってみました。 早速起動時に躓きました。。

```java
致命的: Unable to use updateLog: _version_field must exist in schema, using indexed="true" stored="true" and multiValued="false" (_version_ does not exist)
org.apache.solr.common.SolrException: _version_field must exist in schema, using indexed="true" stored="true" and multiValued="false" (_version_ does not exist)
	at org.apache.solr.update.VersionInfo.getAndCheckVersionField(VersionInfo.java:57)
	at org.apache.solr.update.VersionInfo.<init>(VersionInfo.java:83)
	at org.apache.solr.update.UpdateLog.init(UpdateLog.java:233)
	at org.apache.solr.update.UpdateHandler.initLog(UpdateHandler.java:94)
	at org.apache.solr.update.UpdateHandler.<init>(UpdateHandler.java:123)
	at org.apache.solr.update.DirectUpdateHandler2.<init>(DirectUpdateHandler2.java:97)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:39)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:27)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:513)
	at org.apache.solr.core.SolrCore.createInstance(SolrCore.java:476)
	at org.apache.solr.core.SolrCore.createUpdateHandler(SolrCore.java:544)
	at org.apache.solr.core.SolrCore.<init>(SolrCore.java:705)
	at org.apache.solr.core.SolrCore.<init>(SolrCore.java:566)
	at org.apache.solr.core.CoreContainer.create(CoreContainer.java:850)
	at org.apache.solr.core.CoreContainer.load(CoreContainer.java:534)
	at org.apache.solr.core.CoreContainer.load(CoreContainer.java:356)
	at org.apache.solr.core.CoreContainer$Initializer.initialize(CoreContainer.java:308)
	at org.apache.solr.servlet.SolrDispatchFilter.init(SolrDispatchFilter.java:107)
	at org.apache.catalina.core.ApplicationFilterConfig.initFilter(ApplicationFilterConfig.java:277)
	at org.apache.catalina.core.ApplicationFilterConfig.getFilter(ApplicationFilterConfig.java:258)
	at org.apache.catalina.core.ApplicationFilterConfig.setFilterDef(ApplicationFilterConfig.java:382)
	at org.apache.catalina.core.ApplicationFilterConfig.<init>(ApplicationFilterConfig.java:103)
	at org.apache.catalina.core.StandardContext.filterStart(StandardContext.java:4650)
	at org.apache.catalina.core.StandardContext.startInternal(StandardContext.java:5306)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:150)
	at org.apache.catalina.core.ContainerBase.addChildInternal(ContainerBase.java:901)
	at org.apache.catalina.core.ContainerBase.addChild(ContainerBase.java:877)
	at org.apache.catalina.core.StandardHost.addChild(StandardHost.java:618)
	at org.apache.catalina.startup.HostConfig.deployDescriptor(HostConfig.java:650)
	at org.apache.catalina.startup.HostConfig$DeployDescriptor.run(HostConfig.java:1582)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:441)
	at java.util.concurrent.FutureTask$Sync.innerRun(FutureTask.java:303)
	at java.util.concurrent.FutureTask.run(FutureTask.java:138)
	at java.util.concurrent.ThreadPoolExecutor$Worker.runTask(ThreadPoolExecutor.java:886)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:908)
	at java.lang.Thread.run(Thread.java:680)
```

エラーメッセージの通り、solr4.0からは _version_ というフィールドが必須になったみたいです。 ということで↓こんな感じで追加する必要があります。

```xml
<field name="_version_" type="long" indexed="true" stored="true"/>
```

このバージョンとは一体何なのでしょうか。

> consistency: You are forced to (indirectly) state if your intent is to insert or update. If your intent is to insert, the "update-add-docs" operation will fail if a document with the same uniqueKey-value already exists. If your intent is to update, the "update-add-docs" opeartion will fail if the document (a document with the same uniqueKey-value) does not already exist, or if the value of the _version_-field does not match the value in the already existing document. You state your intent by setting the value of the _version_ field
>
>  http://wiki.apache.org/solr/Per%20Steffensen/Update%20semantics#Description

どうやらトランザクション的な一貫性を保証する動作の為に必要 とのこと。 値は何を設定すればいいのかな？と疑問に思いましたが、 値をセットしないでインデックス生成すると、以下のように自動で値が入りました。 "_version_":1416279540477460481
