---
title: "はてなブログの縦長なカテゴリをすっきりスクロール表示する"
publishedAt: "2013-01-26T23:26:30+09:00"
basename: "2013/01/26/はてなblogの縦長なカテゴリをすっきりスクロール"
sourceUrl: "/entry/2013/01/26/はてなblogの縦長なカテゴリをすっきりスクロール/"
legacyUrl: "/entry/2013/01/26/はてなblogの縦長なカテゴリをすっきりスクロール/"
categories: ["サイト作成", "はてなブログ"]
image: "/hatena-images/images/fotolife/t/treeapps/20170818/20170818174241.png"
---
ちょっとCSSいじってやっちゃいましょう〜

![f:id:treeapps:20170818174241p:plain](/hatena-images/images/fotolife/t/treeapps/20170818/20170818174241.png)

はてなブログに限った話ではありませんが、 大抵のブログで見られる傾向、それは・・・・

縦になが〜〜〜〜〜〜いカテゴリ

です。当ブログの場合はフル表示でこんな感じになります。 ![f:id:treeapps:20130126231114p:plain](/hatena-images/images/fotolife/t/treeapps/20130126/20130126231114.png) ほとんど更新の無いカテゴリも多く、全て見えている必要も無いので、スペース縮小を目指して対応してみようと思います。

- [カテゴリ周りのhtmlとcssを確認](#カテゴリ周りのhtmlとcssを確認)
- [管理画面でcssを追加](#管理画面でcssを追加)
- [cssを追加](#cssを追加)
- [修正後の画面を確認](#修正後の画面を確認)
- [表示されるカテゴリを調整](#表示されるカテゴリを調整)

<a id="カテゴリ周りのhtmlとcssを確認"></a>

### カテゴリ周りのhtmlとcssを確認

ソースを表示してhtmlを確認します。（一部抜粋）

```html
<div class="hatena-module hatena-module-category">
  <div class="hatena-module-title">
    カテゴリー
  </div>
  <div class="hatena-module-body">
    <ul>
        <li>
          <a href="/archive/category/%E9%9B%91%E8%AB%87">
            雑談 (7)
          </a>
        </li>
    </ul>
  </div>
</div>
```

こうなっています。 はてなブログの場合、直接html内部をカスタマイズする事はできないので、 cssを使ってカスタマイズする事になります。

<a id="管理画面でcssを追加"></a>

### 管理画面でcssを追加

css編集ウインドウは以下にあります。 ![f:id:treeapps:20130126231320p:plain](/hatena-images/images/fotolife/t/treeapps/20130126/20130126231320.png)

<a id="cssを追加"></a>

### cssを追加

html構造を確認し、

```
hatena-module hatena-module-category
　└　hatena-module-body
```

という構造になっている事が解っています。 追加するcssは以下の通りです。

```css
/* カテゴリ */
.hatena-module.hatena-module-category > .hatena-module-body {
    height: 355px;
    overflow: auto;
}
```

heightで高さを固定し、はみ出した部分をスクロール表示 とする事で対応します。heightは適宜調整しましょう。

<a id="修正後の画面を確認"></a>

### 修正後の画面を確認

修正後の画面は以下の通りです。 ![f:id:treeapps:20130126231909p:plain](/hatena-images/images/fotolife/t/treeapps/20130126/20130126231909.png) macなのでスクロールバーが見えなくなってますが、windowsだとスクロールバーが見えているかと思います。

<a id="表示されるカテゴリを調整"></a>

### 表示されるカテゴリを調整

はてなブログの場合、カテゴリの表示順序を調整する事ができます。 ![f:id:treeapps:20130126232420p:plain](/hatena-images/images/fotolife/t/treeapps/20130126/20130126232420.png) 並び替え順を「記事が追加された順」にすることで、更新された記事が属するカテゴリを常に上位表示させる事ができます。 隠れてしまう（スクロールしないと見えない）カテゴリは更新が少ない事になるので、ファーストビューで表示されていなくても大きな問題にはならないでしょう。

「月刊アーカイブ」でも同様に縦に長くなりがちなので、同様の手法でスッキリ表示させる事ができます。
