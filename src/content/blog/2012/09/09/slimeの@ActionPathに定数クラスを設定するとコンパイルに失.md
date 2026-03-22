---
title: "slim3の@Pageと@ActionPathに定数クラスを設定するとコンパイルに失敗する？"
publishedAt: "2012-09-09T20:14:00+09:00"
basename: "2012/09/09/slimeの@ActionPathに定数クラスを設定するとコンパイルに失"
sourceUrl: "/entry/2012/09/09/slimeの@ActionPathに定数クラスを設定するとコンパイルに失/"
legacyUrl: "/entry/2012/09/09/slimeの@ActionPathに定数クラスを設定するとコンパイルに失/"
categories: ["java", "gae", "slim3"]
---
tree-tipsはGAE/Jでslim3とscenic3を組み合わせて作っているのですが、 標題の通り、どうも自動コンパイルがおかしな挙動をします。 @Pageと@ActionPathに文字列でなくクラスを設定した際に起きやすいです。

コンパイルに成功する例

```java
@Page("/guava/")
public class GuavaPage extends BasePage {
	@ActionPath("strings/")
	public Navigation strings() {
		setTitle("com.google.common.base.Strings");
		setUrl(GuavaPage.class);
		return setForard(getFilePath(BASE_PATH, "strings.jsp"));
	}
```

コンパイルに失敗する例1

```java
@Page(Url.GUAVA.BASE)
public class GuavaPage extends BasePage {
	@ActionPath("strings/")
	public Navigation strings() {
		setTitle("com.google.common.base.Strings");
		setUrl(GuavaPage.class);
		return setForard(getFilePath(BASE_PATH, "strings.jsp"));
	}
```

コンパイルに失敗する例2

```java
@Page("/guava/")
public class GuavaPage extends BasePage {
	@ActionPath(Url.GUAVA.STRINGS)
	public Navigation strings() {
		setTitle("com.google.common.base.Strings");
		setUrl(GuavaPage.class);
		return setForard(getFilePath(BASE_PATH, "strings.jsp"));
	}
```

コンパイルに失敗する例3

```java
@Page(Url.GUAVA.BASE)
public class GuavaPage extends BasePage {
	@ActionPath(Url.GUAVA.STRINGS)
	public Navigation strings() {
		setTitle("com.google.common.base.Strings");
		setUrl(GuavaPage.class);
		return setForard(getFilePath(BASE_PATH, "strings.jsp"));
	}
```

正確には、失敗するというか、失敗する事がある・中途半端なコンパイルになる、という状態です。 ローカルでは何故か動いても、デプロイした後に画面を見ると、以下のエラーが起きていました。

```java
scenic3.UncompleteAnnotationException: Controller class creation error.
	at scenic3.UrlMatcherImpl.match(UrlMatcherImpl.java:57)
	at scenic3.UrlsImpl.createController(UrlsImpl.java:47)
```

URLを定数化してメニュー部分等で利用してたのですが、 こんな現象が起きた為、仕方なく[アノテーション](http://d.hatena.ne.jp/keyword/%A5%A2%A5%CE%A5%C6%A1%BC%A5%B7%A5%E7%A5%F3)部分は文字列ベタ書きするようにしました。 何とかならないのかこれ・・・
