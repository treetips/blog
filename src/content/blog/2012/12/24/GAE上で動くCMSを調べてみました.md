---
title: "GAE上で動くCMSを調べてみました"
publishedAt: "2012-12-24T03:34:41+09:00"
basename: "2012/12/24/GAE上で動くCMSを調べてみました"
sourceUrl: "/entry/2012/12/24/GAE上で動くCMSを調べてみました/"
legacyUrl: "/entry/2012/12/24/GAE上で動くCMSを調べてみました/"
categories: ["サイト作成", "gae", "slim3"]
image: "/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png"
---
そんなに沢山は無いですが、一応有るんですよ〜

![f:id:treeapps:20170917230836p:plain](/hatena-images/images/fotolife/t/treeapps/20170917/20170917230836.png)

gaeで新サイトが作りたいと思い、CMS使えないか？と思ったので探してみました。 かなり少ないです。

### micolog

#### URL

http://code.google.com/p/micolog/

#### 言語・フレームワーク

gae/p、django

#### micologを使ったサイト

公式サイト自体がmicologで作られているようです。 http://micolog.appspot.com/en-us

#### その他

定番のcmsのようです。見た感じパフォーマンスも悪くないし、テーマも沢山あります。

### cpedialog

#### URL

http://code.google.com/p/cpedialog/

#### 言語・フレームワーク

gae/p、web.py

#### cpedialogを使ったサイト

http://ringio-blog.appspot.com

#### その他

定番のcmsのようです。中国製。

### vosao

#### URL

http://www.vosao.org http://code.google.com/p/vosao/

#### 言語・フレームワーク

gae/j、velocity

#### vosaoを使ったサイト

http://www.velor.biz http://www.portalteam.net http://www.vosao.org http://www.androidsoft.org http://www.ebstrada.com http://www.formreturn.com http://www.rarejava.com/ http://blog.nexoft.ru http://www.vinceprep.com http://www.achean.com/ http://www.netrat.eu/ http://www.designinarts.nl/ http://www.veltema.jp http://www.meachenandshorey.com http://www.answeb.org/ http://www.javatips.net

#### その他

結構パフォーマンス出ています。結構いい感じに見えます。

### pypress4gae

#### URL

http://code.google.com/p/pypress4gae/

#### 言語・フレームワーク

gae/p、web.py

#### pypress4gaeを使ったサイト

http://hikaruworld.appspot.com

#### その他

wordpressクローンであるPyPressのGAE版だそうです。

### 官兵衛

#### URL

http://code.google.com/p/kanbe/

#### 言語・フレームワーク

gae/j、slim3、velocity

#### 官兵衛を使ったサイト

見つかりませんでした。

#### その他

公式サイトが404という・・

ここまで調べておいてなんですが、 GAEのCMSは機能が少な過ぎる 当然です。 datastoreがRDBの代わりにならないから です。 勿論代わりとして使う事はできますが、主に以下の理由で実用に耐えないと思います。

- パフォーマンスが悪すぎる
- datastoreのGQLはwhere句が1個しか使えない

もう、datastoreのやつは・・・
