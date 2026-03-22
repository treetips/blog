---
title: "audirvana plusがiTunesでflacを再生できる理由"
publishedAt: "2013-01-19T22:52:01+09:00"
basename: "2013/01/19/【mac】audirvanaは_proはどうやってiTunesと連携してflacを再生する"
sourceUrl: "/entry/2013/01/19/【mac】audirvanaは_proはどうやってiTunesと連携してflacを再生する/"
legacyUrl: "/entry/2013/01/19/【mac】audirvanaは_proはどうやってiTunesと連携してflacを再生する/"
categories: ["mac"]
image: "/hatena-images/images/fotolife/t/treeapps/20170829/20170829002500.png"
---
実体を直接参照しているわけではないのです〜

![f:id:treeapps:20170829002500p:plain](/hatena-images/images/fotolife/t/treeapps/20170829/20170829002500.png)

[Audirvana Plus &ndash; The Sound of your Dreams](http://audirvana.com/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://audirvana.com/\)](http://b.hatena.ne.jp/entry/http://audirvana.com/) macでお馴染みのaudirvanaですが、iTunesをプレイリストとして使用・連携する事ができます。 ここまでは他のソフトウェアもやっている事なのですが、audirvanaはiTunesを使ってflacを再生できるのです。

iTunes自体にはflacを再生する機能はありません。プレイリストに追加すらできません。 ではどうやっているのか、順を追って説明します。

### itunes integrated modeを有効にする

チェックをつけます。 ![f:id:treeapps:20130119223812p:plain](/hatena-images/images/fotolife/t/treeapps/20130119/20130119223812.png) すると、iTunesが自動的に起動します。

### iTunesに曲を追加する

add files to itunesをクリックします。 ![f:id:treeapps:20130119224043p:plain](/hatena-images/images/fotolife/t/treeapps/20130119/20130119224043.png) リストにflacファイル（フォルダでもOK）を追加し、startボタンを押下するとitunesに曲が追加されます。

なぜiTunesにファイルが追加できたのでしょう。 答えはflacからaifを作ってiTunesに読み込ませたからです。 ここでポイントなのが、proxy onlyで取り込んだ事です。

プロキシというは中継という意味で、実体を持たないのです。 実体を持たないということは、aifファイル単体では曲の再生はできないということです。 実体を持たない代わりに、実体（flac）のパス（flacが置いてある場所）等の情報を持っています。

### どういうフローで再生できているのか

aifが実体を持たない事で、以下が可能になっているのです。

- iTunesはflacを扱えないからaifを代わりに読み込ませる。
- aif自体は音声ファイルではなく、flacの実体のパス等の「音声ファイルの情報のみ」を持つ。
- iTunesには*.flacと表示されるが、これはaifが持つ「実体のファイル名」を表示しているだけ。
- iTunesで曲を再生をすると、iTunesのスクリプトが起動してaifに登録されている曲データをaudirvanaに渡す。
- audirvanaはiTunesから渡されたflacの実体パスを元に、flacファイルを再生。

おおまかにこんな感じかと思われます。 どこかに書いてあった訳ではありませんが、両ソフトウェアを連携させるにはこの方法しかないので、大体あっているかと思います。

### iTunesはaudirvana以外も操れる

両ソフトウェアは中々よく連携していますね。 audirvanaを単独で起動すると、iTunesも起動します。 iTunes起動以降は、操作は基本的にiTunesから行い、iTunesがaudirvanaを操っています。 起動時はaudirvanaが主体、起動後はiTunesが主体、という感じで主導権が入れ替わっていますね。

操れる件に関して考えると、実はaudirvana以外も操れるのです。 flacのパスを渡せばその曲を再生できるソフトウェアであればiTunesがそのソフトを操れるので、 全く同じ事が可能になりそうです。 ただ残念なことに比較的安定して連携できているのがaudirvanaしかないのが現状なのです。[アップル APPLE iTunes Card\(5000円\) アイチューンカード App](http://www.amazon.co.jp/exec/obidos/ASIN/B004OVG6N6/treeapps5-22/) ![アップル APPLE iTunes Card\(5000円\) アイチューンカード App](https://images-fe.ssl-images-amazon.com/images/I/11sIERTgcKL._SL160_.jpg)[iTunes完全ガイド 2013 \(マイナビムック\)](http://www.amazon.co.jp/exec/obidos/ASIN/4839946760/treeapps5-22/) ![iTunes完全ガイド 2013 \(マイナビムック\)](https://images-fe.ssl-images-amazon.com/images/I/517O510yE3L._SL160_.jpg)[iTunes徹底活用ガイド2013 \(三才ムックvol.556\)](http://www.amazon.co.jp/exec/obidos/ASIN/4861995345/treeapps5-22/) ![iTunes徹底活用ガイド2013 \(三才ムックvol.556\)](https://images-fe.ssl-images-amazon.com/images/I/51Im2VG5b-L._SL160_.jpg)
