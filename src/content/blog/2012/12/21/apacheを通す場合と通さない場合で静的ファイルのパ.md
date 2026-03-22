---
title: "apacheを通す場合と通さない場合で静的ファイルのパスが変わるのを防ぐ方法"
publishedAt: "2012-12-21T14:23:04+09:00"
basename: "2012/12/21/apacheを通す場合と通さない場合で静的ファイルのパ"
sourceUrl: "/entry/2012/12/21/apacheを通す場合と通さない場合で静的ファイルのパ/"
legacyUrl: "/entry/2012/12/21/apacheを通す場合と通さない場合で静的ファイルのパ/"
categories: ["サイト作成", "tomcat"]
image: "/hatena-images/images/fotolife/t/treeapps/20180429/20180429004752.png"
---
DocumentRootは常に意識しましょう〜

![f:id:treeapps:20180429004752p:plain](/hatena-images/images/fotolife/t/treeapps/20180429/20180429004752.png)

言葉遊びのような標題ですが、簡単に言うとtomcatで8080アクセスした場合（http://localhost:8080/hoge/）と、apacheを通した場合（http://localhost/hoge/）の場合で、以下の書き方でNotFoundにならないか、という事です。

```html
<script src="/static/lib/jquery/jquery-1.8.3.min.js"></script>
```

何も対策しないと、http://localhost:8080/hoge/ の場合はNotFoundになります。 なぜならhogeの部分(ContextPath)が足りていないからです。

この場合、以下のパスが正解になります。

```html
<script src="/hoge/static/lib/jquery/jquery-1.8.3.min.js"></script>
```

しかしapacheを通す場合はDocumentRoot直下の状態によりますが、大抵以下のようになるでしょう。

```html
<script src="/static/lib/jquery/jquery-1.8.3.min.js"></script>
```

静的ファイルのパスにContextPathが含まれるのはパス的に最悪ですよね。 ContextPathが含まれるとプロジェクト名を変えたい時に全ファイル修正が必要になってしまいます。 だとするとやはりこうしたいです。

```html
<script src="/static/lib/jquery/jquery-1.8.3.min.js"></script>
```

これに対処する方法は色々あると思いますが、 今回は小規模な場合に限定した簡単な解決策を挙げてみます。 その方法とは、ContextPathを/にするというものです。 http://localhost:8080/hoge/ ↓ http://localhost:8080/ こうします。 eclipseでWTPを使っている場合、以下のようにします。 ↓これを ![f:id:treeapps:20121221011220p:plain](/hatena-images/images/fotolife/t/treeapps/20121221/20121221011220.png) ↓このようにPathを/に変更します。 ![f:id:treeapps:20121221011231p:plain](/hatena-images/images/fotolife/t/treeapps/20121221/20121221011231.png) これで http://localhost:8080/ http://localhost/ のどちらでアクセスしても、

```html
<script src="/static/lib/jquery/jquery-1.8.3.min.js"></script>
```

でOKになります。

デメリットは、ContextPathで/を設定できるのは1つだけという単純な制約がつくだけです。 例えばフロントのプロジェクトと管理画面のプロジェクトを分ける場合、この方法はつかえませんね。
