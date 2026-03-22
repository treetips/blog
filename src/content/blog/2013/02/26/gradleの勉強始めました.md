---
title: "gradleの勉強始めました"
publishedAt: "2013-02-26T23:11:32+09:00"
basename: "2013/02/26/gradleの勉強始めました"
sourceUrl: "/entry/2013/02/26/gradleの勉強始めました/"
legacyUrl: "/entry/2013/02/26/gradleの勉強始めました/"
categories: ["java"]
---
[java](http://d.hatena.ne.jp/keyword/java)のビルドツールといえば定番の[Apache](http://d.hatena.ne.jp/keyword/Apache) Antですが、 非常に冗長で解りにくく、簡単な処理も沢山処理をかかなければなりません。

[Apache](http://d.hatena.ne.jp/keyword/Apache) [Maven](http://d.hatena.ne.jp/keyword/Maven)も定番ではありますが、 [XML](http://d.hatena.ne.jp/keyword/XML)で処理を書くという部分は変わりなく、 依存性を解決する部分以外にメリットがほとんどないように見えます。

他にビルドツールは無いか？と探してみると、以下が見つかります。 [sbt &mdash; sbt Documentation](http://www.scala-sbt.org/)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://www.scala-sbt.org/\)](http://b.hatena.ne.jp/entry/http://www.scala-sbt.org/) [Gradle - Build Automation Evolved](http://www.gradle.org/)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://www.gradle.org/\)](http://b.hatena.ne.jp/entry/http://www.gradle.org/)

SBTは[scala](http://d.hatena.ne.jp/keyword/scala)で実装し、gradleはgroovyベースの独自言語で実装します。 両者がant・[maven](http://d.hatena.ne.jp/keyword/maven)と大きく違うのは コーディングによってビルドする点です。 普通のプログラムを書いてビルドができるのです。

で、どちらを触ってみるか迷ったわけですが・・・ ( ^^) gradleには日本語ドキュメントあるし[scala](http://d.hatena.ne.jp/keyword/scala)覚えなくていいからgradleにしよう なんという単純な理由でしょう。 [Java](http://d.hatena.ne.jp/keyword/Java)の[JVM](http://d.hatena.ne.jp/keyword/JVM)上で動作する[scala](http://d.hatena.ne.jp/keyword/scala)ですが、もはや[java](http://d.hatena.ne.jp/keyword/java)とはかけ離れた文法なので、 これから覚えるにはちょっと時間かかるかな、という懸念があるので却下となりました。

で、gradleを勉強し始めた訳ですが・・・ 覚えることが沢山あって結構しんどい です。 GradleはCOC（設定より規約）を重要視しており、 規約を覚えない事には何もできない のです（違うのかも）。

これを乗り越えてこれからのプロジェクトは全部Gradleにしたいですね。 早くant・[maven](http://d.hatena.ne.jp/keyword/maven)とさよならしたいです。 [プログラミングGROOVY](http://www.amazon.co.jp/exec/obidos/ASIN/4774147273/treeapps5-22/) ![プログラミングGROOVY](http://ecx.images-amazon.com/images/I/41GxM8yHw4L._SL160_.jpg)
