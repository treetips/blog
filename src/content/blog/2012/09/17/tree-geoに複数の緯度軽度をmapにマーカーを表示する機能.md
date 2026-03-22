---
title: "tree-geoに複数の緯度軽度をmapにマーカーを表示する機能を追加しました！"
publishedAt: "2012-09-17T17:10:15+09:00"
basename: "2012/09/17/tree-geoに複数の緯度軽度をmapにマーカーを表示する機能"
sourceUrl: "/entry/2012/09/17/tree-geoに複数の緯度軽度をmapにマーカーを表示する機能/"
legacyUrl: "/entry/2012/09/17/tree-geoに複数の緯度軽度をmapにマーカーを表示する機能/"
categories: []
---
[tree-geo: 住所から緯度経度を取得 | TOP](http://tree-geo.appspot.com/)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://tree-geo.appspot.com/\)](http://b.hatena.ne.jp/entry/http://tree-geo.appspot.com/) tree-geoですが、住所から緯度経度を取得し、その緯度経度をmapのマーカー表示する機能を追加しました。

解り難いので画像で解説。 まずは適当に住所（というか単語でもOKみたいです）を複数入力する。 ![f:id:treeapps:20120917170242p:plain](/hatena-images/images/fotolife/t/treeapps/20120917/20120917170242.png) 続いて「ジオコーディングボタン」を押下し、緯度・経度を一気に取得する。 ![f:id:treeapps:20120917170407p:plain](/hatena-images/images/fotolife/t/treeapps/20120917/20120917170407.png) 続いて「地図にプロット」を押下する。 ![f:id:treeapps:20120917170533p:plain](/hatena-images/images/fotolife/t/treeapps/20120917/20120917170533.png) マーカーにオンマウスすると、入力した住所の[ツールチップ](http://d.hatena.ne.jp/keyword/%A5%C4%A1%BC%A5%EB%A5%C1%A5%C3%A5%D7)が表示されます。

1件の住所から緯度経度を取得するサイトは沢山ありますが、 一気に取得できるサイトって見ないので、tree-geoを作りました。 取得した緯度経度から更にgooglemapにプロットする機能も付けたので、 結構他のサイトには無い付加価値が提供できているかと思います。

geocoding [api](http://d.hatena.ne.jp/keyword/api)の制限上、最大1病患感覚でしかリクエストできないので、 余裕をもって住所1件につき1.5秒感覚でサーバでsleepするようにしています。
