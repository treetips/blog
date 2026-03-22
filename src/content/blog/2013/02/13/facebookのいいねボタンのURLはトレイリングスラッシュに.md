---
title: "facebookのいいねボタンのURLはトレイリングスラッシュに対応していない？"
publishedAt: "2013-02-13T00:25:54+09:00"
basename: "2013/02/13/facebookのいいねボタンのURLはトレイリングスラッシュに"
sourceUrl: "/entry/2013/02/13/facebookのいいねボタンのURLはトレイリングスラッシュに/"
legacyUrl: "/entry/2013/02/13/facebookのいいねボタンのURLはトレイリングスラッシュに/"
categories: ["sns"]
---
今更なトピックです。 [facebook](http://d.hatena.ne.jp/keyword/facebook)のいいねボタンをブログパーツとして貼り付ける際に、URLを設定する箇所があります。 しかしこのURL、スラッシュで終わるURLが判別できていないように見えます。 ![f:id:treeapps:20130213003032p:plain](/hatena-images/images/fotolife/t/treeapps/20130213/20130213003032.png)

例えば、 http://tree-tips.appspot.com/mac/ と、 http://tree-tips.appspot.com/ は同じとみなされているような挙動に見えます。 末尾のスラッシュ（トレイリングスラッシュ）を外すときちんと認識されます。 [facebook](http://d.hatena.ne.jp/keyword/facebook)側は↓このような末尾にスラッシュが無い前提で作られているのではないでしょうか。 http://tree-tips.appspot.com/mac

tree-tipsはトレイリングスラッシュ有りのURL形式なので、 今更無しの形式に変更できません・・・ さて、どうしたものか・・・
