---
title: "macでrarを解凍してもフォルダが見えない時の対処法"
publishedAt: "2013-02-16T20:39:35+09:00"
basename: "2013/02/16/macでrarを解凍してもフォルダが見えない時の対処法"
sourceUrl: "/entry/2013/02/16/macでrarを解凍してもフォルダが見えない時の対処法/"
legacyUrl: "/entry/2013/02/16/macでrarを解凍してもフォルダが見えない時の対処法/"
categories: ["mac"]
image: "/hatena-images/images/fotolife/t/treeapps/20170829/20170829002500.png"
---
何故かこうやるとフォルダが見えるようになるんですよね〜

![f:id:treeapps:20170829002500p:plain](/hatena-images/images/fotolife/t/treeapps/20170829/20170829002500.png)

macでrarを解凍したのに、フォルダが見えない事ありませんか？ 原因は解っていませんが、私の場合は以下で解凍した際にたまに起きます。 [The Unarchiver | Top Free Unarchiving Software for macOS](http://unarchiver.c3.cx)[!\[\]\(//b.hatena.ne.jp/entry/image/http://unarchiver.c3.cx\)](http://b.hatena.ne.jp/entry/http://unarchiver.c3.cx)

フォルダを切り替えて再度フォルダを開き直しても現れません。 色々ためした結果、偶然解決法を見つけました。それは・・・ ・新規フォルダを作成する ・それでも駄目ならフォルダをリネームする すると、一斉に見えないフォルダ・ファイルが見えるようになる事があります！！

推測ですが、何らかの理由で解凍した際のバッファをflushする事ができず、 メモリ内に解凍結果が溜め込まれ続け、新規フォルダ生成時にflushされて一気に実体化したのでしょう。 アクティビティモニタを見た時に、青い部分「現在非使用中」の部分が多い時、 この現象が起きていると思われます。 ![f:id:treeapps:20130216203513p:plain](/hatena-images/images/fotolife/t/treeapps/20130216/20130216203513.png)

ちなみにこの「現在非使用中」の確保されたメモリですが、通常開放されません。 これを強制的に開放（無害です）する事ができるスクリプトをtree-tipsに用意したので、 是非試してみて下さい！ [tree-tips: メモリの自動開放 | mac](http://tree-tips.appspot.com/mac/memory_saving/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://tree-tips.appspot.com/mac/memory_saving/\)](http://b.hatena.ne.jp/entry/http://tree-tips.appspot.com/mac/memory_saving/) [Mac OS 10凄技マスター―LeopardからLionまでを確実にフォローする \(英和MOOK らくらく講座 125\)](http://www.amazon.co.jp/exec/obidos/ASIN/4899868472/treeapps5-22/) ![Mac OS 10凄技マスター―LeopardからLionまでを確実にフォローする \(英和MOOK らくらく講座 125\)](https://images-fe.ssl-images-amazon.com/images/I/61-ixu4n5RL._SL160_.jpg)
