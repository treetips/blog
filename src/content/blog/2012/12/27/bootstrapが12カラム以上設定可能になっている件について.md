---
title: "bootstrapが12カラム以上設定可能になっている件について"
publishedAt: "2012-12-27T18:25:44+09:00"
basename: "2012/12/27/bootstrapが12カラム以上設定可能になっている件について"
sourceUrl: "/entry/2012/12/27/bootstrapが12カラム以上設定可能になっている件について/"
legacyUrl: "/entry/2012/12/27/bootstrapが12カラム以上設定可能になっている件について/"
categories: ["サイト作成", "bootstrap"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418115102.png"
---
ひっそりと改善したようです〜

![f:id:treeapps:20180418115102p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418115102.png)

bootstrap2.0の時は確かにできなかったはずのカラム数を12個以上に設定する件ですが、現在できるようになっている事が解りました。 これはありがたい！！

↓この画面で、 ![f:id:treeapps:20121227181604p:plain](/hatena-images/images/fotolife/t/treeapps/20121227/20121227181604.png) ↓こう設定すると、 ![f:id:treeapps:20121227181613p:plain](/hatena-images/images/fotolife/t/treeapps/20121227/20121227181613.png) ↓こんな風に今までの12カラムの上限値を突破することができます。

```css
.span16 {
  width: 924px;
}
.span15 {
  width: 865px;
}
.span14 {
  width: 806px;
}
.span13 {
  width: 747px;
}
.span12 {
  width: 688px;
}
```

但しcontainerのwidthを設定できないのでカラム数に比例して横幅が伸びてしまうのです。 それに、他のセレクタとうまく連動できないかもしれないようにも見えます。（見えているだけでできているのかもしれません）

http://www.gridsystemgenerator.com/gs03.php[!\[\]\(//b.hatena.ne.jp/entry/image/http://www.gridsystemgenerator.com/gs03.php\)](http://b.hatena.ne.jp/entry/http://www.gridsystemgenerator.com/gs03.php) のように、widthとカラム数とマージンを元に生成するのではなく、カラム数とマージンからwidthが算出されるイメージです。これは非常に痛い。 1024pxにピッタリ合わせる事が非常に難しい（できるのかな？？）のです。 最適ではないにせよ、カラム数が増やせるので、今まで大きすぎた列幅を少し縮める事ができるようになった訳です。

[Bootstrap](http://twitter.github.com/bootstrap/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://twitter.github.com/bootstrap/\)](http://b.hatena.ne.jp/entry/http://twitter.github.com/bootstrap/)http://twitter.github.com/bootstrap/
