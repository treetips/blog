---
title: "adsenseのサイズと配置場所による収益の違い"
publishedAt: "2012-11-17T17:47:20+09:00"
basename: "2012/11/17/adsenseのサイズと配置場所による収益の違い"
sourceUrl: "/entry/2012/11/17/adsenseのサイズと配置場所による収益の違い/"
legacyUrl: "/entry/2012/11/17/adsenseのサイズと配置場所による収益の違い/"
categories: ["SEO", "サイト作成"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418112745.png"
---
最適解は無いので、皆で頑張って試行錯誤していきましょう〜

![f:id:treeapps:20180418112745p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418112745.png)

[tree-tips: 主にsolr・MySQLのtipsを掲載しています](http://tree-tips.appspot.com)[!\[\]\(//b.hatena.ne.jp/entry/image/http://tree-tips.appspot.com\)](http://b.hatena.ne.jp/entry/http://tree-tips.appspot.com) tree-tipsにはadsenseを主に3個表示しています。 tree-tipsを運用していて、広告がテキストか画像か、広告が縦長か横長か、で収益が違うという興味深い結果がでました。

期間はそれぞれ1ヶ月と短いサンプルデータです。

### パターン１

1. 左サイド：160x600（縦長）：リッチメディア（スクロールに追随して常に左サイドに表示）
2. 右上：720x90（横長）：テキスト
3. 右下：720x90（横長）：テキスト

収益の高い順は、１＞２＞３でした。 １の縦長固定表示は常に見える位置にあるせいか、一番収益が高いです。 ２，３はテキスト広告でしたが、これはほとんどクリックされません。

### パターン２

1. 左サイド：160x600（縦長）：リッチメディア（スクロールに追随して常に左サイドに表示）
2. 右上：720x90（横長）：リッチメディア
3. 右下：720x90（横長）：リッチメディア

収益の高い順は、２＞１＞３でした。 ２の右上横長リッチメディアが急浮上しました。 サイトのテーマにもよると思いますが、やっぱりテキスト広告はダメっぽいですね。

tree-tipsはテキストがコンテンツなのでリッチメディアが一番目立ってしまうのですが、以外にも一番クリックして貰えました。 広告の位置ですが、右下はクリック率は非常に低いです。

現在のtree-tipsはパターン２の構成です。 まだテスト期間は1ヶ月なので、もう少し経過をみたいと思います。

google adsense blog（公式）に、どんな広告設計をしたらいいか、 googleの膨大な検証結果を元にポイントを書いてくれているので、是非参考にしてみて下さい。 [Inside AdSense : ユーザー エクスペリエンスの 5 原則 パート 1](http://adsense-ja.blogspot.jp/2012/11/5-1.html) [Inside AdSense : ユーザー エクスペリエンスの 5 原則 パート 2](http://adsense-ja.blogspot.jp/2012/11/5-2.html) [Inside AdSense : ユーザー エクスペリエンスの 5 原則 パート 3](http://adsense-ja.blogspot.jp/2012/11/5-3.html)
