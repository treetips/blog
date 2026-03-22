---
title: "solrのNGramTokenizerFactoryの罠"
publishedAt: "2013-03-06T23:38:40+09:00"
basename: "2013/03/06/solrのNGramTokenizerFactoryの罠"
sourceUrl: "/entry/2013/03/06/solrのNGramTokenizerFactoryの罠/"
legacyUrl: "/entry/2013/03/06/solrのNGramTokenizerFactoryの罠/"
categories: ["solr"]
---
solr1.4で[N-Gram](http://d.hatena.ne.jp/keyword/N-Gram)で検索したいと思い、以下をschema.[xml](http://d.hatena.ne.jp/keyword/xml)に追加しました。

```xml
<!-- N-gram -->
<fieldtype name="ngram" class="solr.TextField" omitNorms="false">
    <analyzer>
        <tokenizer class="solr.NGramTokenizerFactory" maxGramSize="3" minGramSize="2" />
        <filter class="solr.StopFilterFactory" ignoreCase="true" words="stopwords.txt"/>
        <filter class="solr.WordDelimiterFilterFactory" generateWordParts="0" generateNumberParts="0" catenateWords="1" catenateNumbers="1" catenateAll="0"/>
        <filter class="solr.LowerCaseFilterFactory"/>
        <filter class="solr.EnglishPorterFilterFactory" protected="protwords.txt"/>
        <filter class="solr.RemoveDuplicatesTokenFilterFactory"/>
    </analyzer>
</fieldtype>
```

起動OK。エラー無し。 インデックス生成OK。

なんだ、簡単に終わったな。 ・・・・ん？

あれ、 なんか3文字以上の単語がindexedされてるぞ？？？ maxGramSize="3" minGramSize="2"なので、2文字で分割＋3文字分割した単語だけがindexedされるはず。 solr adminでindexedデータを見ると、2文字、3文字の単語があり、一見すると[N-Gram](http://d.hatena.ne.jp/keyword/N-Gram)っぽいんですが、 なにやら3文字以上の単語も混じってます。

はて、これはなんだろう。 ちょっと試したらすぐ解り、以下のように定義を変更しました。

```xml
<!-- N-gram -->
<fieldtype name="ngram" class="solr.TextField" omitNorms="false">
    <analyzer>
        <tokenizer class="solr.NGramTokenizerFactory" maxGramSize="3" minGramSize="2" />
        <filter class="solr.StopFilterFactory" ignoreCase="true" words="stopwords.txt"/>
        <filter class="solr.WordDelimiterFilterFactory" generateWordParts="0" generateNumberParts="0" catenateWords="1" catenateNumbers="1" catenateAll="0"/>
        <filter class="solr.LowerCaseFilterFactory"/>
        <filter class="solr.EnglishPorterFilterFactory" protected="protwords.txt"/>
        <!-- これがあるとN-Gramが効かなくなる
        <filter class="solr.RemoveDuplicatesTokenFilterFactory"/>
        -->
    </analyzer>
</fieldtype>
```

どうもRemoveDuplicatesTokenFilterFactoryがあると[N-Gram](http://d.hatena.ne.jp/keyword/N-Gram)の結果がおかしくなる事が解りました。

RemoveDuplicatesTokenFilterFactoryとは何でしょうか。

> Filters out any tokens which are at the same logical position in the tokenstream as a previous token with the same text. This situation can arise from a number of situations depending on what the "up stream" token filters are -- notably when stemming synonyms with similar roots. It is usefull to remove the duplicates to prevent idf inflation at index time, or tf inflation (in a MultiPhraseQuery) at query time.
>
>  http://wiki.apache.org/solr/AnalyzersTokenizersTokenFilters#solr.RemoveDuplicatesTokenFilterFactory

トークンの重複を除去するフィルタだそうです。 しかしどうしてRemoveDuplicatesTokenFilterFactoryをフィルタに追加すると NGramTokenizerFactoryの結果がおかしくなるか解りませんでした。 [Apache Solr 4 Cookbook](http://www.amazon.co.jp/exec/obidos/ASIN/1782161325/treeapps5-22/) ![Apache Solr 4 Cookbook](http://ecx.images-amazon.com/images/I/51P4fYHONZL._SL160_.jpg)
