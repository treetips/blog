---
title: "【java】Listのcontainsは要素と引数の型を合わせないと意味が無い"
publishedAt: "2013-01-30T00:59:15+09:00"
basename: "2013/01/30/【java】Listのcontainsは要素と引数の型を合わせないと意味"
sourceUrl: "/entry/2013/01/30/【java】Listのcontainsは要素と引数の型を合わせないと意味/"
legacyUrl: "/entry/2013/01/30/【java】Listのcontainsは要素と引数の型を合わせないと意味/"
categories: ["java"]
image: "/hatena-images/images/fotolife/t/treeapps/20170104/20170104173704.png"
---
誰しもがこのトラップに嵌まることでしょう。

![f:id:treeapps:20170104173704p:plain](/hatena-images/images/fotolife/t/treeapps/20170104/20170104173704.png)

物凄くつまらないというか、物凄く恥ずかしいトピックです。 Javaのjava.util.Listにはcontainsメソッドがあります。 リストの要素中に引数の値が含まれているかどうかを判定できるのですが、 これがしょうもない罠が潜んでいます。

↓こんなコードを書いてはいけません。

```java
public static void main(String[] args) {
    Integer i = new Integer(1);
    List<String> list = Lists.newArrayList("1", "2", "3");
    System.out.println(list.contains(i));
}
```

これは駄目です。これじゃ駄目なんです。falseが返ります。

containsメソッドがObject型を引数に取るが故、型の違う比較ができてしまいます。

```java
public static void main(String[] args) {
    Integer i = new Integer(1);
    List<String> list = Lists.newArrayList("1", "2", "3");
    System.out.println(list.contains(String.valueOf(i)));
}
```

このように、ちゃんと型を合わせてあげないとtrueが返らないので注意しましょう。

（´-`）.｡oO（気づくのに30分かかった自分はIT業界に向いてないな）
