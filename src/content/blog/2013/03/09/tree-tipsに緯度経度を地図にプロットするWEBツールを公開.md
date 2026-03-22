---
title: "tree-tipsに緯度経度を地図にプロットするWEBツールを公開しました"
publishedAt: "2013-03-09T03:45:54+09:00"
basename: "2013/03/09/tree-tipsに緯度経度を地図にプロットするWEBツールを公開"
sourceUrl: "/entry/2013/03/09/tree-tipsに緯度経度を地図にプロットするWEBツールを公開/"
legacyUrl: "/entry/2013/03/09/tree-tipsに緯度経度を地図にプロットするWEBツールを公開/"
categories: ["java", "サイト更新"]
image: "/hatena-images/images/fotolife/t/treeapps/20130309/20130309034456.png"
---
[tree-tips: 複数の緯度経度を地図にプロットする | WEB TOOL](http://hatenablog.com/embed?url=http%3A%2F%2Ftree-tips.appspot.com%2Fwebtool%2Fprot_by_coordinate%2F) ちなみに現在は以下にもっと豪華な専用サイトを用意しています！ [tree-maps: 地図のWEB TOOLの事ならtree-mapsにお任せ！](http://hatenablog.com/embed?url=http%3A%2F%2Ftree-maps.appspot.com%2F) tree-tipsに、沢山の緯度経度を一気にgooglemapにプロットするWEB[ツール](http://d.hatena.ne.jp/keyword/%A5%C4%A1%BC%A5%EB)を公開しました！！ 今回の[ツール](http://d.hatena.ne.jp/keyword/%A5%C4%A1%BC%A5%EB)は「座標をプロットして地図で確認するためだけの[ツール](http://d.hatena.ne.jp/keyword/%A5%C4%A1%BC%A5%EB)」なのです。 主に開発者向けの[ツール](http://d.hatena.ne.jp/keyword/%A5%C4%A1%BC%A5%EB)で、solr等の空間検索をした時ボックス内の物件が検索できているか等、 手軽に地図上で確認する事ができるようになっています。 なお、中心点と各座標はマーカーの種類を変えているので、解りやすいかと思います。 ![f:id:treeapps:20130309034456p:plain](/hatena-images/images/fotolife/t/treeapps/20130309/20130309034456.png)

プロットする座標が必ず画面上に収まるように表示するようにしたので、 いちいち画面をスクロールしたりスケールを変更しなくても、一発でマーカーを見渡せます。 技術的には簡単で、全座標の緯度のmin/max、経度のmin/maxを取得し、 座標4点を取得して境界（bounds）を生成し、表示位置を自動的に画面に収まるようにしています。

```javascript
var ne = new google.maps.LatLng(minLat,maxLng);
var sw = new google.maps.LatLng(maxLat,minLng);
var bounds = new google.maps.LatLngBounds(sw, ne);
map.fitBounds(bounds);
```

入力できる座[標数](http://d.hatena.ne.jp/keyword/%C9%B8%BF%F4)に上限値を設けてないので、大量の座標をプロットした時は遅くなります。

そもそもこの機能を作ろうと思った理由は、 テストするのを楽にしたかった というよくある理由です。業務で座標を目視確認してテストできると安心できるんですよね。[Google Maps APIプログラミング入門 改訂2版](http://www.amazon.co.jp/exec/obidos/ASIN/4048865382/treeapps5-22/) ![Google Maps APIプログラミング入門 改訂2版](http://ecx.images-amazon.com/images/I/51Ddis7mJ7L._SL160_.jpg)
