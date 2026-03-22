---
title: "プログラミングの技術動向調査スレ"
publishedAt: "2015-05-30T12:58:07+09:00"
basename: "programming-info"
sourceUrl: "/entry/programming-info/"
legacyUrl: "/entry/programming-info/"
categories: ["IT業界", "ライブラリ"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418115102.png"
---
この記事では私が日頃から調査している技術の動向を追い続ける記事です。ずっと追記してメモっていきます。（この記事のリンクはブログタイトル下のメニューにもあります）

![f:id:treeapps:20180418115102p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418115102.png)

#### 2015/07/08

##### Sencha Ext JS 6

[Ext JS: JavaScript Framework for Web Apps - Sencha | Sencha.com](https://www.sencha.com/products/extjs/) Sencha Ext JSがメジャーバージョンアップしました。モバイル対応が強化されており、スマホ・タブレット・PCで動き、レガシーブラウザにも対応しているそうです。どんな感じかは実際に以下のexampleを触ってみるといいと思います。 [Sencha | Ext JS 6.0 Examples](http://examples.sencha.com/extjs/6.0.0/examples/) [Sencha Pivot Grid](https://cdn.sencha.com/pivot-grid/3.6.0/) Bootstrapのadmin templateのような画面が綺麗に実装できるようですね。Bootstrapで頑張るよりずっといいかもしれません。

#### 2015/06/16

##### プログラミング用のフォントの決定版！？

[Ricty Diminished と Source Code Pro と Source Han Code JPのフォントを比較する - 文系プログラマによるTIPSブログ](/entry/2015/06/13/143831/) 既に記事にしましたが、Source Han Code JPというフォントが先日リリースされました。これは日本語の全角記号も綺麗に等幅表示する事ができ、もう決定版と言ってもいいかもしれません。

##### Ember.js がvirtual domを搭載

[最初の「Ember.js 2.0」ベータ版が登場、ReactのようなVirtual DOMを採用した高速レンダリングエンジンGlimmerを搭載。1.x系は1.13で終了へ － Publickey](http://www.publickey1.jp/blog/15/emberjs_20_virtual_dom_glimmer.html) Ember.js v2.0系からvirtual domを実装するそうです。Reactはviewのみなので、こういうフルスタックなFWにvirtual domを搭載してくれると、色々組み合わせたりしなくて面倒が無くてよさそうです。

#### 2015/06/02

javaのテンプレートエンジン探してみました。

[Jtwig - Modern Template Engine for Java](http://jtwig.org) [Trimou - Trim Your Moustache Templates!](http://trimou.org) [spullara/mustache.java](https://github.com/spullara/mustache.java) [neuland/jade4j](https://github.com/neuland/jade4j)

mustacheとかjadeとか、どっかで聞いたことあるものばっかりですね。

#### 2015/05/30

##### elixirとかいう言語が流行る可能性がある

もうscala終わっちゃうの！？早すぎぃ！

##### RxJs、RsJava、bacon.jsでリアクティブファンクショナルプログラミング

特にRxJavaは環境の問題で古いjavaしか使えなくともFRP可能なので、使いたい。

RxJs・bacon.jsは既存のjQueryや他のFWとも共存できるので、これも取り込みたい。bacon.js（ベーコンジェイエス）はRxJsの後発で、RxJsのホット・コールドの違いによる挙動の解りにくさを解決している模様。bacon.jsを使いたいところだが、RxJavaを使う事を考えると、ほぼ同じように使えるRxJsの方がいいかもしれない。

##### yumの終焉とdnfの始動

yumの開発者は既に他界されており、メンテは不可能な状態とのこと。既存のyumはpython2.4系で作られているらしく、RHE・CentOS・Fedora等のデフォルトpythonのバージョンがずっと2.4系なのはそのせいみたい。なら既存のyumを3系に対応させよう！という事になるのだが、もうメンテも不可能な状態だし、作りなおした方がよくない？という議論がされ、実際その方向で進んでいる。その結果、yumからフォークしたDNFというパッケージマネージャに移行する事がほぼ規定路線となり、既にFefora22ではyumではなくdnfに変更された。

yumとdnfでコマンド自体はほぼ同じみたい。挙動は少し違うみたいだが、yumが使える人なら移行できると思う。

##### macのエディタ最新動向

   atom 開発スピードが速く、結構な頻度でマイナーバージョンアップしてる。だが非常に低速で重い。エディタをまともな使い方をしている人にとってはまだまだ実用的ではない印象   SublimeText 業務で使うならこれが安牌。高速で機能も申し分無い。   Brackets エディタというよりIDE。日本語が最初から完備されてていい感じ。VisualStudioCodeの登場で、両者が競合するかも。

##### io.jsのバージョンアップ速度が速すぎる

この前1.6.4にアップしたのに昨日確認したら2.1になってた・・・

あまりにもバージョンアップが速いので、これはもう日頃から「ノード！ノード！」する勇気がある人じゃないとついていけいない感が強い。

##### HashiCorp

もうね、HashiCorpを追いかけてるだけで最新動向についていけちゃうように見える。逆にHashiCorpを追いかけてない人は時代に取り残されるかもしれない。
