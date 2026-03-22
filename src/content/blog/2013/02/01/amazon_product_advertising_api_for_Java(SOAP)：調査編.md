---
title: "amazon product advertising api for Java(SOAP)：調査編"
publishedAt: "2013-02-01T02:43:02+09:00"
basename: "2013/02/01/amazon_product_advertising_api_for_Java(SOAP)：調査編"
sourceUrl: "/entry/2013/02/01/amazon_product_advertising_api_for_Java(SOAP)：調査編/"
legacyUrl: "/entry/2013/02/01/amazon_product_advertising_api_for_Java(SOAP)：調査編/"
categories: ["java", "サイト作成", "アフィリエイト"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418112745.png"
---
![f:id:treeapps:20180418112745p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418112745.png) [Amazonログイン](https://affiliate.amazon.co.jp/gp/advertising/api/detail/main.html)[!\[\]\(//b.hatena.ne.jp/entry/image/https://affiliate.amazon.co.jp/gp/advertising/api/detail/main.html\)](http://b.hatena.ne.jp/entry/https://affiliate.amazon.co.jp/gp/advertising/api/detail/main.html) amazonの商品検索等のAPI、「amazon product advertising api」についてのトピックです。 tree-shopではREST形式でAPIを実行しており、一連の処理は全て自力で実装していました。

何故tree-shopではREST形式でフルスクラッチ実装したかというと、 SOAP版のドキュメントがボロボロで気が狂いそうになったからです 次のサイトを開発しようと色々調査する中で、ちょっとでも楽がしたいので今回SOAP版を改めて調査しました。 結論から言うと、 2011-08-11版でSOAPで商品検索できた！ しかし、例によってドキュメントがボロボロなので、REST形式に逃げる人が続出しそうだと思いました。 それは勿体無いので、wsimportから検索まで、tree-tipsにまとめようと思います。 先にまとめておくと、以下が注意点となります。完全におにちくです。

- wsimportコマンドを動作させるための手順が、マニュアルに載っていない点がある。
- 2008年に認証方式が変更され、マニュアル通りに実装してもhttp status 400 Bad Requestになる鬼畜仕様。
- wsimportで自動生成したファイルでは新認証方式に対応できない鬼畜仕様。
- ついでにREST形式で新認証方式に対応するクラスがあるが、フォーラムの片隅に配置されてる鬼畜仕様。
- 日本語の検索に対応するためにはマニュアルに無いコードを書く必要があるという鬼畜仕様。

実装編の記事もどうぞ！！ [amazon product advertising api for Java\(SOAP\)：実装編 - 文系プログラマによるTIPSブログ](/entry/2013/02/02/amazon_product_advertising_api_for_Java(SOAP)：実装編/)
