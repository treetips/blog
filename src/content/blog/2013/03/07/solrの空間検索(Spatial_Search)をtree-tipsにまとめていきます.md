---
title: "solrの空間検索(Spatial Search)をtree-tipsにまとめていきます"
publishedAt: "2013-03-07T02:31:16+09:00"
basename: "2013/03/07/solrの空間検索(Spatial_Search)をtree-tipsにまとめていきます"
sourceUrl: "/entry/2013/03/07/solrの空間検索(Spatial_Search)をtree-tipsにまとめていきます/"
legacyUrl: "/entry/2013/03/07/solrの空間検索(Spatial_Search)をtree-tipsにまとめていきます/"
categories: ["java", "solr"]
image: "http://ecx.images-amazon.com/images/I/51P4fYHONZL._SL160_.jpg"
---
最近急激に空間検索の需要が伸びている気がします。

業務でもいくつか空間検索は既に導入していますが、 今のところ緯度と経度をbetweenで検索する実装しか経験がありません。 between検索は、以下の黑★の2点を抽出する事ができれば検索できます。 ☆ーー★ ｜ ｜ ★ーー☆ NorthEast、SouthWest、の2点が解れば、自動的に4点の緯度経度が求められるので、 2点の範囲をそれぞれbetweenでand検索し、検索対象の緯度経度点が四角形の範囲内かどうかが判定できます。 このbetween検索の弱点は以下の通りです。

- ボックス検索しかできない（円形・サークル検索はできない）
- 中心点からの距離によるソートができない

等があります。 従って、ボックス検索で距離のソートができなくていいなら、between検索が楽でしょう。

しかしサークル検索がしたい、距離のソートがしたい、 といった高度な検索が必要になると、もうsolrのSpatial Searchを利用するしかありません。

しかし、schema.[xml](http://d.hatena.ne.jp/keyword/xml)のフィールド定義とインデックス生成の仕方が解らん、 という方が多いのではないかと思っています。 solr wikiを見てもポツンとフィールド定義は書いてますが、 その定義をどう使えばいいか書いてないので、理解しにくくなっているのです。 （正直私もSpatial Searchに慣れておらず自信がありません） せっかく高度な空間検索（Spatial Search）ができるので、重点的にまとめていく予定です。

最近mac proに[SSD](http://d.hatena.ne.jp/keyword/SSD)を導入して、OSから入れ直したり、[SVN](http://d.hatena.ne.jp/keyword/SVN)サーバを立て直したり、[TextMate](http://d.hatena.ne.jp/keyword/TextMate)をビルドしたり、 色々環境周りが整ってなかったのですが、今日ようやくちょっとSpatial Searchできるところまでできました。 国交省の緯度経度の[CSV](http://d.hatena.ne.jp/keyword/CSV)を47都道府県分ちまちまダウンロード・結合、DBにload data、solrでインデックス生成、 というところが非常に面倒で大分時間かかりましたが、これから頑張っていきます。 [Apache Solr 4 Cookbook](http://www.amazon.co.jp/exec/obidos/ASIN/1782161325/treeapps5-22/) ![Apache Solr 4 Cookbook](http://ecx.images-amazon.com/images/I/51P4fYHONZL._SL160_.jpg)
