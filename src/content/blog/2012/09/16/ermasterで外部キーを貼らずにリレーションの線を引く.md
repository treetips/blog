---
title: "ermasterで外部キーを貼らずにリレーションの線を引く"
publishedAt: "2012-09-16T21:07:46+09:00"
basename: "2012/09/16/ermasterで外部キーを貼らずにリレーションの線を引く"
sourceUrl: "/entry/2012/09/16/ermasterで外部キーを貼らずにリレーションの線を引く/"
legacyUrl: "/entry/2012/09/16/ermasterで外部キーを貼らずにリレーションの線を引く/"
categories: ["ER図"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png"
---
トリッキーな事をすれば可能です〜

![f:id:treeapps:20180418131549p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png)

私の周りではER図と言えばermaster、という程に普及しました。（させました）

そこで、小技である「外部キーを貼らずにリレーションの線を引く」をやってみたいと思います。

- [ER図を書く](#ER図を書く)
- [DDLのオプションを確認する](#DDLのオプションを確認する)
- [DDLを出力する](#DDLを出力する)
- [雑感](#雑感)

<a id="ER図を書く"></a>

### ER図を書く

よくあるパターン。

![f:id:treeapps:20120916205613p:plain](/hatena-images/images/fotolife/t/treeapps/20120916/20120916205613.png)

子テーブルBは、親テーブルAの主キーと、B自身もPKをもっているパターン。

<a id="DDLのオプションを確認する"></a>

### DDLのオプションを確認する

現状だと線を引いてしまっているので、外部キーが貼られています。

ここでまず右クリックから、以下のように「エクスポート→DDL」と選択します。

![f:id:treeapps:20120916205847p:plain](/hatena-images/images/fotolife/t/treeapps/20120916/20120916205847.png)

次がポイントです。出力オプションをよく見て下さい。

![f:id:treeapps:20120916210059p:plain](/hatena-images/images/fotolife/t/treeapps/20120916/20120916210059.png)

「CREATE」の部分に「外部キー」があります。つまり、

外部キーを出力しない事ができるのです。

ではやってみましょう。

<a id="DDLを出力する"></a>

### DDLを出力する

出力されたDDLは以下の通りです。

```mysql
SET SESSION FOREIGN_KEY_CHECKS=0;

/* Drop Tables */

DROP TABLE B;
DROP TABLE A;

/* Create Tables */

CREATE TABLE A
(
	I1 INT NOT NULL,
	V1 VARCHAR(10),
	PRIMARY KEY (I1)
);

CREATE TABLE B
(
	I1 INT NOT NULL,
	I2 INT UNSIGNED NOT NULL,
	V1 VARCHAR(20),
	PRIMARY KEY (I1, I2)
);
```

外部キーを出力しないでDDLが出力できましたね！

<a id="雑感"></a>

### 雑感

特にMySQLでは外部キーを貼らないという選択をする事があるので、この技は非常に有用かと思います。是非使ってみてくださいね。

ermasterに関しては以下のトピックも参考にどうぞ。 [ERMasterの罠：その2：単語機能は怖い - 文系プログラマによるTIPSブログ](/entry/20110504/p3/) [ermasterを使ったDBの運用を考える。 - 文系プログラマによるTIPSブログ](/entry/20120313/p2/)
