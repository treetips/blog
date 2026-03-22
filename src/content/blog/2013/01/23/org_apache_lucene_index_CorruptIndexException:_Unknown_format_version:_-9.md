---
title: "org.apache.lucene.index.CorruptIndexException: Unknown format version: -9"
publishedAt: "2013-01-23T21:49:20+09:00"
basename: "2013/01/23/org_apache_lucene_index_CorruptIndexException:_Unknown_format_version:_-9"
sourceUrl: "/entry/2013/01/23/org_apache_lucene_index_CorruptIndexException:_Unknown_format_version:_-9/"
legacyUrl: "/entry/2013/01/23/org_apache_lucene_index_CorruptIndexException:_Unknown_format_version:_-9/"
categories: ["solr"]
image: "/hatena-images/images/fotolife/t/treeapps/20180424/20180424102046.png"
---
solrの例外エラーについてです〜

![f:id:treeapps:20180424102046p:plain](/hatena-images/images/fotolife/t/treeapps/20180424/20180424102046.png)

```java
致命的: java.lang.RuntimeException: org.apache.lucene.index.CorruptIndexException: Unknown format version: -9
```

このエラーですが、solrのバージョンアップをする時に起きる場合があります。 エラーの内容は、インデックスを生成した時のsolrのバージョンと、現在のsolrのjarのバージョンの不一致？ かと思われます。 通常はインデックスを再生成すれば直ります。

今回バージョンの相違ではないバージョンエラーが発生したのでまとめます。

- solrをバージョンアップした
- 実は依存jarが不足していた
- tomcat起動時にjar不足によるClassNotFoundExceptionが発生した
- 続いて Unknown format version: -9 が発生した

jar不足でちゃんとクラスをロードできておらず、 solrを更新する前のソースコード（*.class）を読み込んでしまい、 実はsolrバージョンアップ前のインデクサをロードしており、 そのclassファイルでインデックスを生成していたためunknown format versionが起きた。 そのため、何回インデックスを再生成してもunknown format versionが起きた。 憶測ですが、多分そういう事が起きていました。

大分解りにくいエラーなので苦戦しました。。
