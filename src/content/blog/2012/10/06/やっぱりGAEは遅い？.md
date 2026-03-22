---
title: "やっぱりGAEは遅い？"
publishedAt: "2012-10-06T21:02:36+09:00"
basename: "2012/10/06/やっぱりGAEは遅い？"
sourceUrl: "/entry/2012/10/06/やっぱりGAEは遅い？/"
legacyUrl: "/entry/2012/10/06/やっぱりGAEは遅い？/"
categories: ["gae", "slim3", "java"]
image: "/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png"
---
さあ、どうでしょう〜？

![f:id:treeapps:20170917230836p:plain](/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png)

tree-tipsを作成した当初は、パフォーマンスをほとんど考えてませんでした。 コンテンツも少しづつ増えてきて、ちょっと遅いと感じたので対策しました。

### 画像の遅延ロード

[Vanilla JavaScript Lazy Load Plugin](http://www.appelsiini.net/projects/lazyload)[!\[\]\(//b.hatena.ne.jp/entry/image/http://www.appelsiini.net/projects/lazyload\)](http://b.hatena.ne.jp/entry/http://www.appelsiini.net/projects/lazyload) お馴染みのjquery lazyloadです。 このpluginは使うにあたって、imgタグを全部書きなおす必要があるのが手間かかりますね。 &ltimg src="/static/img/xxx.jpg"> ↓ &ltimg class="lazy" src="/static/img/loading.gif" data-original="/static/img/xxx.jpg">

GAEの無料版は静的ファイルのパフォーマンスが悪いので、画像の遅延ロードは必須と言えるでしょう。

### memcache

個人的にはmemcacheは嫌いなのですが、導入しました。 導入箇所は、datastoreの検索部分です。 slim3を導入しているとはいえ、異常ともいえるdatastoreの検索の遅さ。 GAEの処理時間の大半はdatastoreが占めているので、memcacheは必須ですね。

### javascripはbody終了タグの直前に書く

超初歩的ですが、jquery以外は全部body終了タグ直前に書きました。 しかし、jsのロードを遅延させた影響で、treeのメモ帳blogのRSSの読み込み部分の表示がガクガクになりました。 jspのレンダリング時はliタグが10個、vtickerで3行に書き換え、としています。

jsをheadで読み込んでいれば、jspレンダリングから3行化は一瞬で行われますが、jsの読み込みを遅延させた事で、10行→3行への表示の切り替えがはっきり見えるようになりました。 これの対策は、RSS部分のdivを丁度3行分になるようheightを固定値で設定し、更にoverflow: hiddenで4行目以降のはみ出した部分は非表示、とする事で対応できました。

こんな感じで少し対策してみましたが、対策しても尚遅いGAE。遅い。遅い。遅い。。。

他の対策としては、jsを並列読み込みする対応もありますが、最近のブラウザはjsの読み込みが他の部分の読み込みをブロックする事を知っており、 ブロックせずに読み込んでくれます。 並列読み込みしても無駄ではありませんが、最近のブラウザに限定すれば、そこまで効果は無いかと思われます。

次の課題としては、PCで表示する際は気にならなかったgoogleのadsenseですが、ipadで見ると確実にhtmlの描画をブロックしている様子が見えました。 adsenseの遅延ロードをした方がよさそうですね。
