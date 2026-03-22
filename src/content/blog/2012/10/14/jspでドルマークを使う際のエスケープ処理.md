---
title: "jspでドルマークがel式と解釈されてエラーになる件について"
publishedAt: "2012-10-14T04:30:11+09:00"
basename: "2012/10/14/jspでドルマークを使う際のエスケープ処理"
sourceUrl: "/entry/2012/10/14/jspでドルマークを使う際のエスケープ処理/"
legacyUrl: "/entry/2012/10/14/jspでドルマークを使う際のエスケープ処理/"
categories: ["java"]
image: "/hatena-images/images/fotolife/t/treeapps/20180426/20180426142529.png"
---
たまにこれが起きて面倒なのですよね〜

![f:id:treeapps:20180426142529p:plain](/hatena-images/images/fotolife/t/treeapps/20180426/20180426142529.png)

[tree-tips: 主にsolr・MySQLのtipsを掲載しています](http://tree-tips.appspot.com/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://tree-tips.appspot.com/\)](http://b.hatena.ne.jp/entry/http://tree-tips.appspot.com/) シェルスクリプトの記事を書いていていて、シェルスクリプトの変数とel式の「${}」の記述が全く同じなのでエラーになりました。

具体的には以下のコードをjspで表示しようとして、パースエラーになりました。

```sh
for table in "${tables[@] views[@]}"
```

「${tables」がel式と判断されてしまったのです。

以下のように$をエスケープすることで解決できます。

el式の解釈の問題なので、レンダリングの時点でエスケープする必要があります。

```sh
for table in "${f:h("$")}{tables[@] views[@]}"
```

面倒くさいし冗長なのでもっと簡単な記述をしたいですが、HTML標準のエスケープ表記が用意されてないのです。

&を＆amp;とする感じでエスケープしたいですね。
