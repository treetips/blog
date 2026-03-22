---
title: "twitter bootstrap本体を触らずにカスタマイズする方法"
publishedAt: "2012-11-03T15:05:13+09:00"
basename: "2012/11/03/twitter_bootstrapをカスタマイズして使う"
sourceUrl: "/entry/2012/11/03/twitter_bootstrapをカスタマイズして使う/"
legacyUrl: "/entry/2012/11/03/twitter_bootstrapをカスタマイズして使う/"
categories: ["サイト作成", "bootstrap"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418115102.png"
---
直接本体をいじらず、別途カスタマイズする事ができます〜

![f:id:treeapps:20180418115102p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418115102.png)

[Bootstrap](http://twitter.github.com/bootstrap/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://twitter.github.com/bootstrap/\)](http://b.hatena.ne.jp/entry/http://twitter.github.com/bootstrap/) [tree-tips](http://tree-tips.appspot.com/)ではtwitter bootstrapを使ってデザインしています。

このbootstrap、簡単に綺麗なデザインができ、デザイナーでない私でも簡単綺麗なUIが実現できます。 しかしこのbootstrap、主にmargin・paddingに問題があると思っています。

### bootstrapをカスタマイズしたデザイン

![f:id:treeapps:20121103144948p:plain](/hatena-images/images/fotolife/t/treeapps/20121103/20121103144948.png)

### bootstrapをカスタマイズしないデザイン

![f:id:treeapps:20121103145007p:plain](/hatena-images/images/fotolife/t/treeapps/20121103/20121103145007.png)

色々いじってるので単純な比較ではありませんが、 カスタマイズしない場合はmargin・paddingが酷い事になっているように見えます。

これはtwitter流の黄金比？でしょうか。それとも日本人は小さいもの好きだからか。 それにbootstrapを知っている、使った事が有る方には、 ・bootstrapを使っている事が即バレして悲しい ・デザインはしない(ｷﾘｯ と公言しているようで悲しい ので、カスタマイズする事をおすすめします。

青いボタンとか、背景色とか、妙に大きめのマージンとか、見た瞬間解るレベルです。 [ウンコード・マニア](http://unkode-mania.net/)とか、[FESS](http://fess.sourceforge.jp/ja/)とか、 見た瞬間に「ああ、bootstrapか」と解ります。。

### bootstrapをカスタマイズする方法

カスタマイズ方法の一つですが、bootstrapのcssには全く手をつけず、別途作成したcssでbootstrapのセレクタを上書きする方法を、tree-tipsでは使っています。 具体的には以下の通りです。

```html
<link rel="stylesheet" href="/static/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="/static/bootstrap/css/bootstrap-responsive.min.css">
↓↓↓↓　これを追加　↓↓↓↓
<link rel="stylesheet" href="/static/bootstrap/css/bootstrap-custom.css" />
```

bootstrapのcss（カスタマイズしないのだから圧縮版のminでいい）を普通に読み込んだ後に、 新規に作成したbootstrap-custom.cssを読み込み、bootstrap.cssのセレクタを上書きします。

例えば<p>ですが、bootstrap.cssでは以下になっています。

```css
p {
  margin: 0 0 10px;
}
```

bootstrap-custom.cssに以下を記述してbootstrap.min.cssのセレクタを上書きします。

```css
p {
  margin: 5px 2px 5px 2px;
}
```

こうすることで、bootstrap.min.cssとbootstrap-responsive.min.cssは全くいじる必要無くなるので、bootstrapがバージョンアップした場合も簡単に対応できるかと思います。 バージョンアップ時はbootstrapフォルダを丸ごと上書きコピーするだけで、簡単にバージョンアップする事ができます。

### 以下の記事も合わせてどうぞ！！

[twitter bootstrapのテーマ5個、拡張コンポーネント8個を紹介 - 文系プログラマによるTIPSブログ](/entry/2013/02/20/twitter_bootstrapのテーマ5個、拡張コンポーネント8個を紹介/)[!\[\]\(//b.hatena.ne.jp/entry/image//entry/2013/02/20/twitter_bootstrapのテーマ5個、拡張コンポーネント8個を紹介\)](http://b.hatena.ne.jp/entry//entry/2013/02/20/twitter_bootstrapのテーマ5個、拡張コンポーネント8個を紹介/)

[jQueryプラグイン徹底活用 プロのデザインアイデアとテクニック](http://www.amazon.co.jp/exec/obidos/ASIN/4844362720/treeapps5-22/)

![jQueryプラグイン徹底活用 プロのデザインアイデアとテクニック](https://images-fe.ssl-images-amazon.com/images/I/51oAHICfxLL._SL160_.jpg)
