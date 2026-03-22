---
title: "GAEのデータストアのモデルの項目変更は反映まで少し時間がかかる"
publishedAt: "2012-09-28T04:36:57+09:00"
basename: "2012/09/28/GAEのデータストアのモデルの項目変更は反映まで少"
sourceUrl: "/entry/2012/09/28/GAEのデータストアのモデルの項目変更は反映まで少/"
legacyUrl: "/entry/2012/09/28/GAEのデータストアのモデルの項目変更は反映まで少/"
categories: ["java", "gae", "slim3"]
image: "/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png"
---
少しタイムラグあるんですよね〜

![f:id:treeapps:20170917230836p:plain](/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png)

モデルに項目を増やしてデプロイしたところ、以下のようなエラーが発生しました。

```java
Uncaught exception from servlet
com.google.appengine.api.datastore.DatastoreNeedIndexException: The index for this query is not ready to serve. See the Datastore Indexes page in the Admin Console.
```

要は、 このクエリを投げる対象のインデックスの準備（項目変更）ができてないよ、ということです。 数十秒程まてばエラーが解消しますので、安心して下さい。
