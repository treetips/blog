---
title: "solr4.0のsolr adminが使いにくい件"
publishedAt: "2012-11-01T00:53:20+09:00"
basename: "2012/11/01/solr4.0のsolr_adminが使いにくい件"
sourceUrl: "/entry/2012/11/01/solr4.0のsolr_adminが使いにくい件/"
legacyUrl: "/entry/2012/11/01/solr4.0のsolr_adminが使いにくい件/"
categories: []
image: "/hatena-images/images/fotolife/t/treeapps/20180424/20180424102046.png"
---
最初ビックリしました。

![f:id:treeapps:20180424102046p:plain](/hatena-images/images/fotolife/t/treeapps/20180424/20180424102046.png) solr4.0でsolr adminがガラっと変わった訳ですが、使いにくいです。

まずはよく使うクエリ実行画面です。 ![f:id:treeapps:20121101004435p:plain](/hatena-images/images/fotolife/t/treeapps/20121101/20121101004435.png) この画面、xmlが初期選択、インデントがオフ、なのです。 インデントをデフォルトでonにするパラメータがあるのでしょうか？？？ 無いと激しく使いにくいです。毎回チェックする作業が嫌です。

続いてクエリ実行結果をXMLでインデントした例です ![f:id:treeapps:20121101004450p:plain](/hatena-images/images/fotolife/t/treeapps/20121101/20121101004450.png) おわかり頂けるでしょうか・・・ なんとXMLのタグが表示されないという・・インデントの意味無いです。

solr3.6まではブラウザがxmlを自動でインデントしてくれていたから、綺麗に表示されていました。 xmlのインデントができないので、代わりにjsonを使えばインデント表示できます。

![f:id:treeapps:20121101004835p:plain](/hatena-images/images/fotolife/t/treeapps/20121101/20121101004835.png) これですよこれ。インデント表示。

これらの結果を踏まえると、 インデント表示するためには、 １，クエリを入力。 ２，wtコンボボックスでjsonを選択。 ３，indentチェックボックスをチェック。 という手順を踏んで、ようやく綺麗な実行結果が得られます。

どこかにデフォルトの入力状態を制御する方法があるかもしれないので、 探しています。激しく不便なので、知っている方がいらっしゃったら是非教えて下さい。 コメントで情報を頂き、xml整形アドオンを入れたらXMLを綺麗に整形してくれました。 以下のchromeのアドオンは、indentにチェックを入れなくてもインデントしてくれました。 [XML Tree - Chrome Web Store](https://chrome.google.com/webstore/detail/xml-tree/gbammbheopgpmaagmckhpjbfgdfkpadb) ![f:id:treeapps:20121101233456p:plain](/hatena-images/images/fotolife/t/treeapps/20121101/20121101233456.png)
