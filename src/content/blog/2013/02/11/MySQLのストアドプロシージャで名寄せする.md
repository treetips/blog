---
title: "MySQLのストアドプロシージャで名寄せする"
publishedAt: "2013-02-11T22:57:42+09:00"
basename: "2013/02/11/MySQLのストアドプロシージャで名寄せする"
sourceUrl: "/entry/2013/02/11/MySQLのストアドプロシージャで名寄せする/"
legacyUrl: "/entry/2013/02/11/MySQLのストアドプロシージャで名寄せする/"
categories: ["mysql"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png"
---
![f:id:treeapps:20180418131549p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png)最近「電話番号」または「メールアドレス」が同一の場合同一人物とみなす、 という処理が必要になったので、MySQLを使って名寄せする処理を書きました。

頭がいい人たちは非常に高度で少ない手順で名寄せする方式を組み上げているかと思います。 が、私のような凡人にそれは理解できないので、自分が理解できる、手の届く処理を書きました。

tree-tipsの方にそれなりに詳細に手順とソース一式を公開しました！！ [tree-tips: MySQLで名寄せする | MySQL](http://tree-tips.appspot.com/mysql/useful/nayose/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://tree-tips.appspot.com/mysql/useful/nayose/\)](http://b.hatena.ne.jp/entry/http://tree-tips.appspot.com/mysql/useful/nayose/)

今回ストアドプロシージャで実装したわけですが、 単にjava等で処理を書く事もできます。[エキスパートのためのMySQL\[運用+管理\]トラブルシューティングガイド](http://www.amazon.co.jp/exec/obidos/ASIN/4774142948/treeapps5-22/) ![エキスパートのためのMySQL\[運用+管理\]トラブルシューティングガイド](https://images-fe.ssl-images-amazon.com/images/I/41oqE-9dM2L._SL160_.jpg)
