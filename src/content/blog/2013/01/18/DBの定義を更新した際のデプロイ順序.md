---
title: "DBの定義を更新した際のデプロイ順序"
publishedAt: "2013-01-18T00:44:05+09:00"
basename: "2013/01/18/DBの定義を更新した際のデプロイ順序"
sourceUrl: "/entry/2013/01/18/DBの定義を更新した際のデプロイ順序/"
legacyUrl: "/entry/2013/01/18/DBの定義を更新した際のデプロイ順序/"
categories: ["mysql"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png"
---
デプロイ担当者は注意しましょう〜

![f:id:treeapps:20180418131549p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png)

これは基本的ではありますが、非常に重要です。

サイトをグローバル公開し、アプリを止めずにデプロイする際のDB更新についてです。

3パターン考えてみましょう。（O/Rマッパー、s2jdbcを使っている前提の話となります）

※ 追加・・・テーブルの追加・カラムの追加の事を指します。 ※ 削除・・・テーブルの削除・カラムの削除の事を指します。

- [追加有り、削除無し](#追加有り削除無し)
  - [【正解】DBを更新してからアプリをデプロイする](#正解DBを更新してからアプリをデプロイする)
- [追加無し、削除有り](#追加無し削除有り)
  - [【正解】アプリをデプロイしてからDBを更新する](#正解アプリをデプロイしてからDBを更新する)
- [追加有り、削除有り](#追加有り削除有り)
  - [【正解】カラム追加→アプリデプロイ→カラム削除](#正解カラム追加アプリデプロイカラム削除)
- [カラム追加時の落とし穴](#カラム追加時の落とし穴)
- [対応策](#対応策)

<a id="追加有り削除無し"></a>

### 追加有り、削除無し

<a id="正解DBを更新してからアプリをデプロイする"></a>

#### 【正解】DBを更新してからアプリをデプロイする

例えば以下のテーブルに、c2カラムを追加するとします。

```mysql
create table hoge (
    c1 int,
    primary key (c1)
) engine=innodb charset=utf8mb4;
```

デプロイ対象のエンティティクラスは以下の通りです。

```java
public class Hoge {
    @id
    public Integer c1;
    public String c2;
}
```

この状態でDB更新の前にデプロイするとどうなるでしょう。

O/Rマッパーが発行するSQLは select c1, c2 from hoge です

つまり、存在しないc2カラムをselectしてエラーになるのです。

<a id="追加無し削除有り"></a>

### 追加無し、削除有り

<a id="正解アプリをデプロイしてからDBを更新する"></a>

#### 【正解】アプリをデプロイしてからDBを更新する

例えば以下のテーブルから、c2カラムを削除するとします。

```mysql
create table hoge (
    c1 int,
    c2 varchar(10),
    primary key (c1)
) engine=innodb charset=utf8mb4;
```

デプロイ対象のエンティティクラスは以下の通りです。

```java
public class Hoge {
    @id
    public Integer c1;
}
```

DBを先に更新した場合、DBからはc2は削除されましたが、デプロイ前のエンティティにc2がある状態なので、存在しないc2カラムをselectしてエラーになるのです。

<a id="追加有り削除有り"></a>

### 追加有り、削除有り

<a id="正解カラム追加アプリデプロイカラム削除"></a>

#### 【正解】カラム追加→アプリデプロイ→カラム削除

複合パターンですね。

<a id="カラム追加時の落とし穴"></a>

### カラム追加時の落とし穴

更新対象のテーブルがinsertされる場合は注意です。

デプロイ前なのでエンティティには当然c2がありません。

```java
public class Hoge {
    @id
    public Integer c1;
}
```

このエンティティからinsert文を発行する場合、O/Rマッパーは以下のinsert文を発行します。

```mysql
insert into hoge (c1) values (1);
```

c2カラムの指定無し、つまりc2には自動的にデフォルト値が入るのです。

```mysql
mysql> create table hoge (c1 int, c2 varchar(10) not null, primary key (c1))engine=innodb charset=utf8mb4;
Query OK, 0 rows affected (0.02 sec)

mysql> insert into hoge (c1) values (1);
Query OK, 1 row affected, 1 warning (0.00 sec)

mysql> select * from hoge;
+----+----+
| c1 | c2 |
+----+----+
|  1 |    |
+----+----+
1 row in set (0.00 sec)
```

カラムがNOT NULLの場合ですが、この例では文字列型なので「空文字」が初期値として自動的にセットされています。

もし数値型であれば「0」となります。カラムがNULLABLEの場合は、全てNULL値がセットされます。

このように、insert時に初期値が入るので、初期値が入った場合にアプリの挙動がおかしくなる可能性について、考慮する必要があります。

<a id="対応策"></a>

### 対応策

MySQLの場合の話ですが、ALTER TABLE文は暗黙の強制コミットが走る問題があります。

```mysql
begin;
alter table hoge add c2 varchar(10) after c1;
update hoge set c2 = 'a';
commit;
```

↑これは無駄です。alter文の時点で強制コミットされるので、update終了までの間に割り込まれます。

ではどうするか。

初期値を設定しておいて、後で外す方法があります。

```mysql
-- 事前に安全で害のない値をdefaultとして設定
mysql> create table hoge (c1 int, c2 int not null default 0, primary key (c1))engine=innodb charset=utf8mb4;
Query OK, 0 rows affected (0.02 sec)

-- 追加したカラムのデータを有効な値で更新（特定条件のデータのステータスを削除にするとか）
mysql> update hoge set c2 = 1 where 略;
Query OK, 0 rows affected (0.00 sec)
Rows matched: 0  Changed: 0  Warnings: 0

-- データ更新が終わったらdefaultを外してしまう
mysql> alter table hoge modify c2 int not null;
Query OK, 0 rows affected (0.02 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

こういう形で割り込みを回避することもできます。

ただし
