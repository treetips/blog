---
title: "MySQLでauto_incrementを使わず自力で採番する"
publishedAt: "2013-01-24T22:29:59+09:00"
basename: "2013/01/24/MySQLでauto_incrementを使わず自力で採番する"
sourceUrl: "/entry/2013/01/24/MySQLでauto_incrementを使わず自力で採番する/"
legacyUrl: "/entry/2013/01/24/MySQLでauto_incrementを使わず自力で採番する/"
categories: ["mysql"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png"
---
できますよ〜

![f:id:treeapps:20180418131549p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png)

MySQLにはauto-increment-incrementとauto-increment-offsetという設定があって、auto_incrementの値を偶数・奇数に固定する事ができます。

```
[server01]
auto-increment-increment = 2
auto-increment-offset = 1
[server02]
auto-increment-increment = 2
auto-increment-offset = 2
```

server01は1始まりで+2づつされるので、奇数になる。1,3,5,7.... server02は2始まりで+2づつされるので、偶数になる。2,4,6,8....

この環境だとauto_incrementの値が歯抜けになってしまうし、insertする際にDBサーバによって採番値が偶数か奇数か不定なので、自力で採番する方法を考えてみました。

単純にmaxを取って、インクリメントするだけです。

```mysql
set names utf8mb4;
use test;

-- 採番対象テーブル
drop table if exists auto_num;
create table auto_num (
    id bigint unsigned
    ,schema_name varchar(100)
    ,table_name varchar(100)
    ,primary key (id)
) engine=innodb charset=utf8mb4;

-- DDLは暗黙のコミットが走るので、トランザクションはここから開始
set autocommit=0;

-- for updateしてファントムリード・ファジーリードを回避（where句が無いのでテーブルロックになる）
-- レコードが0件の場合max関数はnullを返すので0をセット
select @rownum := ifnull(max(id), 0) from auto_num for update;

insert into auto_num
    select
        @rownum := @rownum + 1 -- インクリメント
        ,t.table_schema
        ,t.table_name
    from
        information_schema.tables t
    order by
        table_schema
        ,table_name
;

commit;
```

こうすると、以下のようなデータが挿入されます。

```mysql
mysql> select * from auto_num;
+-----+--------------------+----------------------------------------------+
| id  | schema_name        | table_name                                   |
+-----+--------------------+----------------------------------------------+
|   1 | address            | address                                      |
|   2 | hoge               | group_sort                                   |
|   3 | hoge               | hoge                                         |
|   4 | hoge               | inserts                                      |
|   5 | hoge               | inserts2                                     |
|   6 | info               | t1                                           |
|   7 | info               | t2                                           |
|   8 | info               | t3                                           |
・・・略・・・
```
