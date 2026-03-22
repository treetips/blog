---
title: "javaのロガーが多すぎて訳が解らないので整理してみました"
publishedAt: "2012-10-20T21:39:21+09:00"
basename: "2012/10/20/javaのロガーが多すぎて訳が解らないので整理して"
sourceUrl: "/entry/2012/10/20/javaのロガーが多すぎて訳が解らないので整理して/"
legacyUrl: "/entry/2012/10/20/javaのロガーが多すぎて訳が解らないので整理して/"
categories: ["java"]
image: "/hatena-images/images/fotolife/t/treeapps/20170104/20170104173704.png"
---
最初は誰しもがファッ！？となるんですよねロガーって。

![f:id:treeapps:20170104173704p:plain](/hatena-images/images/fotolife/t/treeapps/20170104/20170104173704.png)

いずれtree-tipsで公開しようと思っている、solrのプロジェクトを今作っています。mavenでjarを管理している訳ですが・・

なんだこのロガーの数は！！

commons-logging、log4j、slf4j-api、jcl-over-slf4j、logback-classic・・・・、こいつら一体何が違うんだ！どう使い分けるんだ！そもそも必要なのか！？となりました。

昔はcommons-logging＋log4jというのがトレンドだった訳ですが、今はslf4j＋logbackがトレンドになり、jdkも1.4から1.7になり、これらトレンドが推移する過程で、いろいろなjarが旧式に依存してしまい、旧式依存を解決するためにアダプタが登場し始め、mavenでjarを収集すると大抵両方入ってしまい、カオスになっているのです。

特にslf4jは種類が多すぎるので、ちゃんとそれぞれの役割を説明できる人なんていないでしょう。カオスにしている原因の7割くらいはslf4jです。このカオスな状況にイラッとしたので整理しました。主に3種類のjarに分別されます。

### １，インターフェース

- commons-logging
- slf4j

等があります。ログ出力をするための機能一覧、つまりインターフェースのみを提供します。実装ではありません。

↓このインターフェースの事です。

```java
public interface Hoge {
    public void hello();
}
```

インターフェースが古いと、機能自体が貧弱・少ないということになります。これらjar単独でログ出力する実装も含んでいますが、簡易的なものです。

slf4jはインターフェースのメソッド数が多いから、それだけ多機能って事だな。

### ２，アダプター又はブリッジ

- jcl-over-slf4j.XXX.jar（commons-logging => slf4jに処理を移譲）
- jul-to-slf4j.XXX.jar（java.util.logging => slf4jに処理を移譲）
- log4j-over-slf4j.XXX.jar（log4j => slf4jに処理を移譲）

等があります。

アダプタの役割は、各種インターフェースと実装のプロキシのような役割をしています。外から見ると全く同じメソッド等に見え、内部的にはそれぞれの実装に合わせた実装をしています。ログ実装の切り分け以外にも、「slf4j-jdk14」といった、jdkの違いを吸収するアダプタもあります。アダプタがあるおかげで、commons-logging・log4jの環境にslf4jを追加しても動くのです。

アダプタさんは設定ファイルまでアダプタできるので、log4j.jarが無くてもlog4j.xmlを読み込みます。アダプタさんマジイケメンです。しかしアダプタがあるせいで色々動いてしまって、jarが混在して複雑化する原因にもなっています。

ちなみに「jul」という単語は「java.util.logging」の略です。「jcl」という単語は「Jakarta Commons Logging」の略です。「Java Class Library」の略じゃないです。この略語も理解しにくくなる原因の一つになっていますね。

javaのロガーが解らなくなる原因はここなんだよな。アダプタが多すぎるだろ・・・jdk1.8が正式リリースされて、ますますアダプタが増えるな・・・

なんかlog4j2も出現して、ますます増えるかもしれないぞ。一体何が始まるんです・・・？

### ３，実装

- java.util.logging
- log4j
- logback

等があります。logbackはlog4jの開発者が作った後継的な実装です。インターフェースに対する実装で、ここがヘボいと処理が遅かったり、そもそもインターフェースに対する実装が未実装だったりします。

#### slf4jバインディング

- slf4j-log4j12-XXXX.jar（slf4j => log4j1.2に処理を移譲）
- slf4j-jdk14-XXX.jar（slf4jをjdk1.4で使い、java.util.loggingに処理を移譲）
- slf4j-nop-XXX.jar（全てのログ出力内容を破棄します）
- slf4j-simple-XXX.jar（ログレベルINFO以上をSystem.errに出力します）
- slf4j-log4j-XXX.jar（slf4j => log4jに処理を移譲）
- slf4j-jcl-XXX.jar（slf4j => commons.loggingに処理を移譲）

slf4jの場合は「バインディング」と呼ばれるjarが沢山あります。これらはslf4jの実装をどれにするかを選択するためのjarであり、複数クラスパスに含めてはいけません。複数バインディングがあると、slf4jがどのバインディングに出力を渡したらいいか解らなくなります。

slf4j + logbackの組み合わせの場合はこれらバインダーは不要です。slf4j-apiのみが必要です。 [!\[\]\(http://www.slf4j.org/images/concrete-bindings.png\)](http://www.slf4j.org/images/concrete-bindings.png) これはslf4jのオフィシャルサイトの図解ですが、 ( ´･ω･`)何が何だか解らない・・・

軽い気持ちで足を踏み入れたけど、これは・・・・

### slf4j + logbackに移行

では「commons-logging + log4j」から「slf4j + logback」に移行してみましょう。手動でjarを管理するのは大変なので、mavenを使う前提でまとめます。

#### slf4jとlogbakのdependencyを追加

以下の2つを追加すれば、依存するjarが勝手に追加されます。

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.2</version>
</dependency>
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.0.7</version>
</dependency>
```

#### commons-loggingとlog4jを依存から除外

これが実は面倒で、mavenで簡単に除外できません。各jar一つ一つに対して除外設定が必要です。この作業をすると解りますが、沢山のjarが両者に依存しています。jdk1.5以上の環境であればslf4j-jdk14は不要なので一緒に削除します。

```xml
<exclusions>
    <exclusion>
        <artifactId>commons-logging</artifactId>
        <groupId>commons-logging</groupId>
    </exclusion>
</exclusions>
<exclusions>
    <exclusion>
        <artifactId>log4j</artifactId>
        <groupId>log4j</groupId>
    </exclusion>
</exclusions>
<exclusions>
    <exclusion>
        <artifactId>slf4j-jdk14</artifactId>
        <groupId>org.slf4j</groupId>
    </exclusion>
</exclusions>
```

この除外設定はeclipseにm2eプラグインを使うと比較的用意に行えます。pom.xmlを開き、Dependency Hierarchyタブを開き、Filterに両者の名前を入れると、依存するjarが全て表示されます。それらjar一つ一つを右クリックし「Exclude Maven Artifact...」をクリックしていきます。手間がかかりますが頑張ります。

最終的に必要なjarは以下になります。

- slf4j-api-XXX.jar
- logback-classic-XXX.jar
- logback-core-XXX.jar
- jcl-over-slf4j.XXX.jar
- jul-to-slf4j.XXX.jar
- log4j-over-slf4j.XXX.jar

ちょっとアダプタがうざいですが、本質的に必要なjarは最初の3つだけです。

#### ログの設定ファイルを入れ替える

log4j.xml、log4j.dtd、log4j.propertiesは不要なので、全部削除します。代わりに「logback.xml」を作成します。以下は例なので、適宜修正して下さい。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <prudent>true</prudent>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>app.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>

        <encoder>
            <pattern>%date{yyyy/MM/dd HH:mm:ss:SSS} %.5level - %logger{0}.%.20method %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <target>System.out</target>
        <encoder>
            <pattern>%date{yyyy/MM/dd HH:mm:ss:SSS} %.5level - %logger{0}.%.20method %msg%n</pattern>
        </encoder>
    </appender>

    <root>
        <level value="info" />
        <appender-ref ref="FILE" />
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

logback.xmlも新旧記述方法があり、旧式の記述をすると、tomcat起動時に警告が出ます。警告に書いてあるように [Logback Error Codes](http://logback.qos.ch/codes.html) ここで最新の書き方に修正しましょう。

ネットの情報でよくみかける「ch.qos.logback.classic.PatternLayout」は既にDEPRECATED（非推奨でいずれ削除される）になっているので、修正しましょう。encoderとlayoutは実装をカスタマイズしないなら、両者ともclassは指定しなくて大丈夫です。大分面倒ですが、これで旧式から新式に移行できるかと思います。

### jarが旧式のロガーに依存している場合の対応

この手順でslf4j+logbackに移行しても、既存のjarが旧式に依存していて、 「Exception in thread "main" java.lang.NoClassDefFoundError: org/apache/commons/logging/LogFactory」となる場合があります。こんな時はイケメンのアダプタさんに活躍して貰いましょう。

旧式に処理が渡されるということは、前述のアダプタで「slf4jに処理を移譲してしまえばいい」のです。例えばcommons-loggingに依存してNoClassDefFoundErrorになるなら、jcl-over-slf4j.XXX.jarを入れましょう。

- jcl-over-slf4j.XXX.jar（commons-logging => slf4jに処理を移譲）
- jul-to-slf4j.XXX.jar（java.util.logging => slf4jに処理を移譲）
- log4j-over-slf4j.XXX.jar（log4j => slf4jに処理を移譲）

片っ端からslf4jに移譲してしまえば、後は slf4j => logback の流れになるので、完全に移行できるかと思います。

これさえやれば勝ち確定だな！！！

そうだな（・・・地獄の始まりはここからだ）

### 簡単な使い方

大体以下のような感じで使います。jclとほぼ同じです。

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Hoge {

    private static Logger LOGGER = LoggerFactory.getLogger(Hoge.class);

    // 「あいう」と出力されます
    public static void main(String[] args) {
        LOGGER.info("あ{}う", "い");
    }
}
```

{}がプレースホルダになっています。importを見るとslf4jしか無く、logback関連のimportは見当たりませんね。slf4jのインターフェースのみでコーディングし、内部的にslf4jがクラスパス上からlogbackを見つけ出して、実装として使ってくれています。表に現れなくても、しっかりlogbackは使われているので安心して下さい。

### ロガーの変遷

#### 実装

1. log4j v1系が流行る。
2. log4jの原作者がlogbackを新たに作る。
3. log4j v2系が登場する。←今ここ

こんな感じで一旦logbackで落ち着くのかとおもいきや、log4jのバージョン2系が登場し、どっちがデファクトスタンダードなのか解らん状態になっております。

#### インターフェース

1. commons.logging
2. SLF4J

インターフェースの方はこれしかありません。（もっとある？）とりあえずSLF4Jがデファクトスタンダードになったっぽいので、SLF4J使っておけば問題なさそうです。slf4jのアダプタ群ですが、もしかしたら今後JDK1.8のストリームやラムダを内部で使ったロガーが登場し、JDKの違いを吸収するアダプタが更に増えたりするかもしれませんね。

### 沢山のロガー達を見て思うこと

インターフェース・アダプタ・実装、という所がいかにもjavaな訳ですが、個人的に1個のjarに集約して、設定ファイルで動作を変えられるロガーがあればいいなと思っています。このままだと新ロガー登場の度にアダプタが増えてアダプタのjarが大量発生してしまいます。

各jarを分離して疎結合をするのは理屈的には正しいですが、現実問題として誰が見てもカオスな状態で、slf4jをよく理解せずに使い、

```
Multiple bindings were found on the class path
```

tomcat起動時にこんなエラーが出続け、誰もそれに気づかないようなプロジェクトを沢山見ます。（この場合slf4jは/dev/nullで出力を破棄して動かず、log4jが動いてしまっているケースが多い）

昔偉い人は「自由は不自由である」と言ってたし、自由よりシンプルさを重視して欲しいものです。もしパフォーマンスが重要なら、尚更1社が全部作った方がいい結果になるでしょうしね。

やるお「java屋さんがロガーに惑わされなくなる日ってくるのかな・・・」

やらないお「こないな・・・」
