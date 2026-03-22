---
title: "自作ホームページでもXML-RPCのping送信でインデックス速度の高速化が可能"
publishedAt: "2013-03-07T02:03:24+09:00"
basename: "2013/03/07/自作ホームページでもXML-RPCのping送信でインデックス速"
sourceUrl: "/entry/2013/03/07/自作ホームページでもXML-RPCのping送信でインデックス速/"
legacyUrl: "/entry/2013/03/07/自作ホームページでもXML-RPCのping送信でインデックス速/"
categories: ["java", "サイト作成"]
image: "http://ecx.images-amazon.com/images/I/51AxAe7zDCL._SL160_.jpg"
---
レンタルブログ等でお馴染みのping送信、これは自作のホームページでも有効です。 やり方は簡単、[XML-RPC](http://d.hatena.ne.jp/keyword/XML-RPC)で値を4つ指定するだけです。

1. url= http://blogsearch.google.com/ping/RPC2
2. methodName=weblogUpdates.ping（固定）
3. value1=サイト名（固定）
4. value2=サイトURL（固定）

たったこれだけです。URLはグーグルブログ検索のping先URLになっていますが、 沢山pingサーバがあるので、URLのリストを作って、ループして[XML-RPC](http://d.hatena.ne.jp/keyword/XML-RPC)でpingしまくりましょう。 url以外は全て定数なので、本当に簡単です。

最近触りだした[XML-RPC](http://d.hatena.ne.jp/keyword/XML-RPC)ですが、最初はS2XML-RPCを使おうかと思いましたが、 ちょっと設定が面倒なので、素のxmlrpc-clientを使いました。 20行程度のコードで実行できるので、素の方がむしろ簡単な気がします。

以下は実際に各URLをpingした際にpingサーバから返る値です。

```
http://api.my.yahoo.co.jp/RPC2
{message=OK, flerror=false}

http://blogsearch.google.co.jp/ping/RPC2
{message=Thanks for the ping., flerror=false}

http://blog.goo.ne.jp/XMLRPC
{message=Thanks for the ping., flerror=true}

http://rpc.reader.livedoor.com/ping
{message=Thanks for the ping, flerror={_type=boolean, _value=[Ljava.lang.Object;@63a6b16f, _signature=[Ljava.lang.Object;@54cb2185, _attr={}}}

http://ping.fc2.com
{message=Thanks for your ping., flerror=false}

http://ping.rss.drecom.jp/
{message=Thanks for the Ping!! But this ping server no longer exists., flerror=false}

http://ranking.kuruten.jp/ping
{message=error, flerror=true}

http://www.blogpeople.net/servlet/weblogUpdates
{message=Thanks for the ping., flerror=false}
```

[本気で稼ぐための「アフィリエイト」の真実とノウハウ](http://www.amazon.co.jp/exec/obidos/ASIN/4798026182/treeapps5-22/)

![本気で稼ぐための「アフィリエイト」の真実とノウハウ](http://ecx.images-amazon.com/images/I/51AxAe7zDCL._SL160_.jpg)
