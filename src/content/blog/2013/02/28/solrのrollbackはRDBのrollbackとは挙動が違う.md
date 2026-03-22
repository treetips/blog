---
title: "solrのrollbackはRDBのrollbackとは挙動が違う"
publishedAt: "2013-02-28T02:03:16+09:00"
basename: "2013/02/28/solrのrollbackはRDBのrollbackとは挙動が違う"
sourceUrl: "/entry/2013/02/28/solrのrollbackはRDBのrollbackとは挙動が違う/"
legacyUrl: "/entry/2013/02/28/solrのrollbackはRDBのrollbackとは挙動が違う/"
categories: ["solr"]
image: "http://ecx.images-amazon.com/images/I/51fQfVOQElL._SL160_.jpg"
---
solrにはrollbackの機能があります。 ところが[RDB](http://d.hatena.ne.jp/keyword/RDB)と全く同じrollbackではありません。

例えばインデックス全件生成を例に上げてみます。

１，インデックス全件削除。 ２，インデックス全件生成。 ３，全件生成中にエラー発生。 ４，catch節でrollbackを実行。

こういう場合、２は反映されず、１以前の状態に戻ります。 ただしそれは メモリ上の話です。 インデックスの物理ファイルはカッチリ削除されています。 つまりrollbackした後に[tomcat](http://d.hatena.ne.jp/keyword/tomcat)等の[servlet](http://d.hatena.ne.jp/keyword/servlet)コンテナを再起動すると、 全件削除された状態でインデックスがロードされてインデックスが0件になります。 [RDB](http://d.hatena.ne.jp/keyword/RDB)のように物理的にrollbackされる訳ではないのです。

これを意識していないと、以下のような事が起こりえます。

１，インデックス全件削除。 ２，インデックス全件生成。 ３，全件生成中にエラー発生。 ４，catch節でrollbackを実行。全件生成は失敗に終わり、rollbackされる。 ５，インデックス差分更新が走る。

この場合、４でインデックスが0件になり、５のインデックス差分更新が成功した場合、 差分更新の件数が1件だとすると、1件の状態でcommitが走りインデックスは1件になります。 こういった事故を防ぐ手段として、全件更新か差分更新が失敗した場合にロックファイル等を作り、 ロックファイルが有る場合は処理をせずメールでアラート通知する、等が必要になるかと思います。

他の手段としては、コアを2個用意してswapで入れ替える手法があります。 インデックス生成は core1_tmp に実行、core1_tmpの状態が正常である事を確認して、 core1 と core1_tmp をswapして入れ替える、[MySQL](http://d.hatena.ne.jp/keyword/MySQL)で言うところのrename tableと同じ事をします。 [CoreAdmin - Solr Wiki](http://wiki.apache.org/solr/CoreAdmin#SWAP)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://wiki.apache.org/solr/CoreAdmin%23SWAP\)](http://b.hatena.ne.jp/entry/http://wiki.apache.org/solr/CoreAdmin%23SWAP) 手間はかかりますが、これで安全にインデックスの更新ができるのではないでしょうか。 [Mapion・日本一の地図システムの作り方 \(Software Design plus\)](http://www.amazon.co.jp/exec/obidos/ASIN/4774153257/treeapps5-22/) ![Mapion・日本一の地図システムの作り方 \(Software Design plus\)](http://ecx.images-amazon.com/images/I/51fQfVOQElL._SL160_.jpg)
