---
title: "Google Geocoding APIの制約に関するよくある誤解"
publishedAt: "2013-02-27T00:06:49+09:00"
basename: "2013/02/27/Google_Geocoding_APIの制約に関するよくある誤解"
sourceUrl: "/entry/2013/02/27/Google_Geocoding_APIの制約に関するよくある誤解/"
legacyUrl: "/entry/2013/02/27/Google_Geocoding_APIの制約に関するよくある誤解/"
categories: ["WEB API"]
image: "/hatena-images/images/fotolife/t/treeapps/20180425/20180425200506.png"
---
結構制限って難しかったりするので要注意です〜

![f:id:treeapps:20180425200506p:plain](/hatena-images/images/fotolife/t/treeapps/20180425/20180425200506.png)

[緯度経度を一気にジオコーディング！ | tree-maps](https://www.tree-maps.com/geocoding/)

[スタートガイド | Google Maps Geocoding API | Google Developers](https://developers.google.com/maps/documentation/geocoding/?hl=ja)[!\[\]\(//b.hatena.ne.jp/entry/image/https://developers.google.com/maps/documentation/geocoding/?hl=ja\)](http://b.hatena.ne.jp/entry/https://developers.google.com/maps/documentation/geocoding/?hl=ja)

皆大好きgoogle geocoding apiに関するよくある誤解について。

ジオコーディングとは、住所を元に緯度・経度を取得する機能で、業務で緯度・経度を扱う方も多いかと思います。

そんなジオコーディングですが、1日の利用回数制限、ちゃんと理解していますか？というお題です。

> Google Geocoding API 使用時のクエリ制限として、1 日あたりの位置情報リクエストが 2,500 回に制限されています（Google Maps API for Business をご利用の場合は、1 日あたり 100,000 件までリクエストを実行できます）。
>
>  https://developers.google.com/maps/documentation/geocoding/?hl=ja#Limits

これです。

「1 日あたりの位置情報リクエストが 2,500 回」だそうです。これ、解りますか？

2500回！？ 少なっ！！ と思ったあなたは勘違いしてます。

1 IPにつき 2500回ですよ。

解りやすい例を挙げると以下になります。

- サーバサイド(java等)でジオコーディングした場合、1日に2500回しか実行できない。
- クライアントサイド(javascript)でジオコーディングした場合、1ユーザにつき2500回まで実行可能。

サーバサイドの場合、サーバは常に固定IPであるため、きっかり2500回しか実行できない。

しかしjsの場合はアクセスしたユーザ毎に2500回まで実行可能。つまりほぼ無制限ですね。jsの場合はサーバを介さないので、ユーザのGIP毎にカウントされるのです。

この違いを理解してないと「google geocoding api使えね〜！！」となりますが、使えないのはお前ｄ（略

業務でよくある落とし穴として、会社から外部のネットに接続する際に1個のグローバルIPになって外に出る場合、ユーザ毎に回数がカウントされる筈が、社員全員が同じGIPになってしまうため、

あっという間に回数制限オーバーし、403（利用制限オーバー）やstatic mapで以下の画像が表示される事があります。 ![f:id:treeapps:20130227000349p:plain](/hatena-images/images/fotolife/t/treeapps/20130227/20130227000349.png)

### サーバサイドでジオコーディングする必要がある場合

前述のように、google geocoding apiはサーバサイドで行うと1日に2500回しか実行できません。

時間かかってもいいから1日に数万件ジオコーディングしたい場合ってありますよね。

そんなあなたに「YAHOOジオコーダAPI」をおすすめします。 http://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/geocoder.html[!\[\]\(//b.hatena.ne.jp/entry/image/http://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/geocoder.html\)](http://b.hatena.ne.jp/entry/http://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/geocoder.html) はっきりと1日の利用制限について明記されてませんが、ネット上では1日に5万回程度OKと言われています。

実際私は業務で使っていて1日に3〜4万件実行していますが、エラーは起きていません。ただし1秒間に1アクセス、1リクエストで1住所、という制約は守る必要があるので、

ジオコーディングに10時間以上かかる事は覚悟しましょう。

それじゃ遅いんだよ！！という方には裏ワザがあります。1 IPにつき n回という制限なんですよね？だったら、

プロキシ挟んで10個のGIPを用意して全IP並列してジオコーディングする

馬鹿っぽいですが、これで10倍高速化！？

[Google Maps APIプログラミング入門 改訂2版](http://www.amazon.co.jp/exec/obidos/ASIN/4048865382/treeapps5-22/)

![Google Maps APIプログラミング入門 改訂2版](https://images-fe.ssl-images-amazon.com/images/I/51Ddis7mJ7L._SL160_.jpg)
