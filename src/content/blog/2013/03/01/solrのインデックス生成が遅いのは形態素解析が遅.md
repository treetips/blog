---
title: "solrのインデックス生成が遅いのは形態素解析が遅いのが原因？"
publishedAt: "2013-03-01T01:33:15+09:00"
basename: "2013/03/01/solrのインデックス生成が遅いのは形態素解析が遅"
sourceUrl: "/entry/2013/03/01/solrのインデックス生成が遅いのは形態素解析が遅/"
legacyUrl: "/entry/2013/03/01/solrのインデックス生成が遅いのは形態素解析が遅/"
categories: ["solr"]
image: "http://ecx.images-amazon.com/images/I/51P4fYHONZL._SL160_.jpg"
---
[全文検索エンジン](http://d.hatena.ne.jp/keyword/%C1%B4%CA%B8%B8%A1%BA%F7%A5%A8%A5%F3%A5%B8%A5%F3)のインデックス生成が遅いのはもはや常識ですね。 しかし具体的にどこが遅いんだろうと考えていたんですが、 今まではただ漠然と以下を怪しんでいました。

- インデックス生成時に発行する [SQL](http://d.hatena.ne.jp/keyword/SQL)
- storedフィールドの数
- indexedフィールドの数
- [形態素解析](http://d.hatena.ne.jp/keyword/%B7%C1%C2%D6%C1%C7%B2%F2%C0%CF) フィールドに詰め込むデータの量

しかしどうでしょう。 [SQL](http://d.hatena.ne.jp/keyword/SQL)がヘボいから遅いというのは論外。 ORMを使っていてEntityへのマッピングが遅いのも論外。 [s2jdbcはjoinが多い場合はentityへのマッピング処理が急激に遅くなる - treeのメモ帳](/entry/20120211/p2/)[!\[\]\(http://b.hatena.ne.jp/entry/image//entry/20120211/p2\)](http://b.hatena.ne.jp/entry//entry/20120211/p2/)

この辺がクリアできているとして、じゃあstored/indexedのフィールド数？[形態素](http://d.hatena.ne.jp/keyword/%B7%C1%C2%D6%C1%C7)のデータ量？ 以前indexedフィールドを0個にして試しましたが、全く速度は向上しませんでした。 ではstoredのデータ量？これは多少効果がありました。 storedはindexedと違って人間が読める形、つまりマルチバイトになるのでindexedより重いのでしょう。 しかし劇的な改善は見込めず。

となると[形態素解析](http://d.hatena.ne.jp/keyword/%B7%C1%C2%D6%C1%C7%B2%F2%C0%CF)のフィールドが怪しいわけです。 [形態素](http://d.hatena.ne.jp/keyword/%B7%C1%C2%D6%C1%C7)フィールドにindexedするデータ量はインデックス生成の時間に大きな影響を与えます。 しかし、具体的にどの処理が遅いのか解らないのです。 [形態素](http://d.hatena.ne.jp/keyword/%B7%C1%C2%D6%C1%C7)で分割された単語単位のデータの格納が重い？それは考えにくい。 それなら単にmultivalueフィールドに沢山データ詰め込んでも同様に遅くなるはず。

という訳で消去法で[形態素解析](http://d.hatena.ne.jp/keyword/%B7%C1%C2%D6%C1%C7%B2%F2%C0%CF)の処理自体が遅いという点に行き着きましたが、 更に探りを入れる必要があります。 schema.[xml](http://d.hatena.ne.jp/keyword/xml)では[形態素解析](http://d.hatena.ne.jp/keyword/%B7%C1%C2%D6%C1%C7%B2%F2%C0%CF)のフィールドは以下のような感じで定義します。

```xml
<fieldType name="text_ja" class="solr.TextField" positionIncrementGap="100" autoGeneratePhraseQueries="false">
    <analyzer>
        <tokenizer class="solr.JapaneseTokenizerFactory" mode="search" userDictionary="lang/userdict_ja.txt"/>
        <filter class="solr.SynonymFilterFactory" synonyms="synonyms.txt" ignoreCase="true" expand="true"/>
        <filter class="solr.JapaneseBaseFormFilterFactory"/>
        <filter class="solr.JapanesePartOfSpeechStopFilterFactory" tags="lang/stoptags_ja.txt" enablePositionIncrements="true"/>
        <filter class="solr.CJKWidthFilterFactory"/>
        <filter class="solr.StopFilterFactory" ignoreCase="true" words="lang/stopwords_ja.txt" enablePositionIncrements="true" />
        <filter class="solr.JapaneseKatakanaStemFilterFactory" minimumLength="4"/>
        <filter class="solr.LowerCaseFilterFactory"/>
        <filter class="solr.TrimFilterFactory" />
        <filter class="solr.RemoveDuplicatesTokenFilterFactory"/>
    </analyzer>
</fieldType>
```

さて、トークナイズ（単語分割）が遅いのか、その後の各種フィルタが遅いのか、辞書を引くのが遅いのか。 仮にトークナイズが遅いなら、単語をキーに分割後の単語をEHCacheでキャッシュしてしまえば劇的な高速化ができそう？ とも考えています。 /entry/20110908/p1:title:bookmak

残念ながらここまでしか検証できていないので、今日はここまでです。 [Apache Solr 4 Cookbook](http://www.amazon.co.jp/exec/obidos/ASIN/1782161325/treeapps5-22/) ![Apache Solr 4 Cookbook](http://ecx.images-amazon.com/images/I/51P4fYHONZL._SL160_.jpg)
