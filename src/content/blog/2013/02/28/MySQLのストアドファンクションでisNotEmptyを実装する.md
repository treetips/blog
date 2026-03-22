---
title: "MySQLのストアドファンクションでisNotEmptyを実装する"
publishedAt: "2013-02-28T01:02:10+09:00"
basename: "2013/02/28/MySQLのストアドファンクションでisNotEmptyを実装する"
sourceUrl: "/entry/2013/02/28/MySQLのストアドファンクションでisNotEmptyを実装する/"
legacyUrl: "/entry/2013/02/28/MySQLのストアドファンクションでisNotEmptyを実装する/"
categories: ["mysql"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png"
---
結構簡単で有用なので、是非ストアドファンクションつかいましょう〜

![f:id:treeapps:20180418131549p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png)

MySQLで「空文字またはnullではない」という判定をしたいけど、hoge != null and hoge != '' と書くと冗長になってしまって嫌なので、ストアドファンクションで実装してみる事にしました。

javaのcommons-langのStringUtils.isNotEmptyと同じ使い方ができるよう実装してみます。

MySQLにはboolean型は内部的には存在しませんが、trueと入力すると1、falseと入力すると0が返ります。

つまりBOOLEANはTINYINT(1)のエイリアスなのです。内部的には1と0で処理されています。今回はこれを利用します。

```mysql
mysql> select true, false;
+------+-------+
| TRUE | FALSE |
+------+-------+
|    1 |     0 |
+------+-------+
```

まずはファンクションを作成します。

```mysql
DELIMITER //

-- --------------------------------------------
-- nullか空文字かを判定する
-- --------------------------------------------
DROP FUNCTION IF EXISTS isNotEmpty;
CREATE FUNCTION isNotEmpty(
    TARGET TEXT
) RETURNS BOOLEAN
BEGIN
IF TARGET IS NULL OR TARGET='' THEN
    RETURN FALSE;
END IF;
RETURN TRUE;
END//

DELIMITER ;
```

このストアドファンクションはそれぞれ以下のような挙動になります。引数はTEXT型ですが、数値も正しく判定されます。

```mysql
mysql> select isNotEmpty(null);
+------------------+
| isNotEmpty(null) |
+------------------+
|                0 |
+------------------+

mysql> select isNotEmpty('');
+----------------+
| isNotEmpty('') |
+----------------+
|              0 |
+----------------+

mysql> select isNotEmpty('a');
+-----------------+
| isNotEmpty('a') |
+-----------------+
|               1 |
+-----------------+

mysql> select isNotEmpty(1);
+---------------+
| isNotEmpty(1) |
+---------------+
|             1 |
+---------------+
```

このisNotEmptyをjavaっぽく使うと以下のようになります。

```mysql
-- これは検証用データです
mysql> select * from t2;
+----+--------+
| id | name   |
+----+--------+
|  1 | 鈴木   |
|  2 |        |
|  3 | NULL   |
+----+--------+

mysql> select if(isNotEmpty(name), name, '名無し') from t2;
+------------------------------------------+
| if(isNotEmpty(name), name, '名無し')      |
+------------------------------------------+
| 鈴木                                      |
| 名無し                                    |
| 名無し                                    |
+------------------------------------------+
```

ファンクションの返り値はBOOLEAN(0 or 1)ですが、isNotEmpty(name)と書くと、isNotEmpty(name) = 1 又は isNotEmpty(name) = true と同じ挙動になるのです。

これを利用するとちょっとjavaみたいな書き方ができるのです。

なお、isEmpty という名前でファンクションを作っても何故か動作せずにnullが返ります。

予約語？UDFにisEmptyがある？のか解りませんが、isNullとかisNullOrEmpty等の名前なら使えます。
