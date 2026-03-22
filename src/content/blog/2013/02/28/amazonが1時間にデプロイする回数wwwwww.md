---
title: "amazonが1時間にデプロイする回数wwwwww"
publishedAt: "2013-02-28T22:11:01+09:00"
basename: "2013/02/28/amazonが1時間にデプロイする回数wwwwww"
sourceUrl: "/entry/2013/02/28/amazonが1時間にデプロイする回数wwwwww/"
legacyUrl: "/entry/2013/02/28/amazonが1時間にデプロイする回数wwwwww/"
categories: ["java", "雑談"]
---
[プログラマ](http://d.hatena.ne.jp/keyword/%A5%D7%A5%ED%A5%B0%A5%E9%A5%DE)なら誰もが思っていること、 「本番環境デプロイは辛い怖いやりたくない」 ですが、我らがamazon様は恐ろしいことをやっておられました。

なんと、

1時間に最大1000回デプロイしているそうです

なんだそれwwwwwwwwwwwwww [Amazonは1時間に最大1000回もデプロイする。クラウドネイティブなデプロイとはどういうものか？ AWS re:Invent基調講演（Day2 AM） － Publickey](http://www.publickey1.jp/blog/12/amazon11000_aws_reinventday2_am.html)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://www.publickey1.jp/blog/12/amazon11000_aws_reinventday2_am.html\)](http://b.hatena.ne.jp/entry/http://www.publickey1.jp/blog/12/amazon11000_aws_reinventday2_am.html) なんかもうハードが壊れる事前提で大量に使い捨てられる[インスタンス](http://d.hatena.ne.jp/keyword/%A5%A4%A5%F3%A5%B9%A5%BF%A5%F3%A5%B9)を作って、 デプロイ完了したらバランサーで一気に切り替えてるそうです。 差し戻しもバランサー切り替えで一発wwwww ヘタしたらデータセンターごとバランサーで切り替えてそうwwww 1バージョンにつき1データセンター使ってそうwwwww

こんな事ができるということは、 ・仮想環境作成の自動化 ・環境構築の自動化 ・ビルドの自動化 ・テストの自動化 ・デプロイの自動化 など、ありとあらゆる作業が自動化されていると思われます。 データセンター構築まで自動化されてそうで怖いですね。 amazonには実は人間はほとんどいなくて、社内にロボットがいっぱいいそうですw

われわれ技術者が「あんなこといいな♪できたらいいな♪」と歌っている間に amazon様は実現してまい、安定稼働していたとは・・・

githubも1日に175回デプロイしているそうで、やはりとんでもない事ですね。 なんかもう完全に自分たちが[旧石器時代](http://d.hatena.ne.jp/keyword/%B5%EC%C0%D0%B4%EF%BB%FE%C2%E5)の原始人状態で、怖くなりました・・ 現実的に実践できそうなのは、ビルドの自動化・テストの自動化、あたりですね。 デプロイの自動化が一番やりたいですが、できるかな。どれくらい勉強して経験積めばできるだろうか。 [Jenkins実践入門 ?ビルド・テスト・デプロイを自動化する技術 \(WEB+DB PRESS plus\)](http://www.amazon.co.jp/exec/obidos/ASIN/4774148911/treeapps5-22/) ![Jenkins実践入門 ?ビルド・テスト・デプロイを自動化する技術 \(WEB+DB PRESS plus\)](http://ecx.images-amazon.com/images/I/51bR%2Bvw-EvL._SL160_.jpg)
