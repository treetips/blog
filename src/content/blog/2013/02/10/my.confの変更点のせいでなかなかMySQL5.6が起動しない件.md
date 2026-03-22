---
title: "my.cnfの変更点のせいでMySQL5.6がなかなか起動しない件"
publishedAt: "2013-02-10T00:40:20+09:00"
basename: "2013/02/10/my.confの変更点のせいでなかなかMySQL5.6が起動しない件"
sourceUrl: "/entry/2013/02/10/my.confの変更点のせいでなかなかMySQL5.6が起動しない件/"
legacyUrl: "/entry/2013/02/10/my.confの変更点のせいでなかなかMySQL5.6が起動しない件/"
categories: ["mysql"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png"
---
いつのものやつですね。

![f:id:treeapps:20180418131549p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418131549.png)

つい先日MySQL 5.6 GAが公開されたので、早速macにインストールしてみました。 DMG形式インストールしたので、インストールで躓くことはありませんでした。 .bash_profileにmysql/binのパスも通しました。 さて、起動です。 ( #^^) 「今日も平常運転ですねMySQLさん」

まあお約束ですね。起動しません。my.cnfの設定が悪いわけです。 my.cnfはMySQL5.1で使っていたものをそのまま使ってみました。 名前が変わったり廃止された設定が混在しており、修正にかなり手間がかかりました。 以下は私の環境で動かしているmy.cnfの設定です。

```conf
[client]
port=3306
default-character-set = utf8mb4

[mysqld]
port=3306
# wrong
#default-character-set = utf8 # before MySQL5.5
character-set-server = utf8mb4
skip-character-set-client-handshake
skip-name-resolve
lower_case_table_names = 1
default-storage-engine = InnoDB

max_connection=100
key_buffer_size = 128M
max_allowed_packet = 16M
# wrong
#table_cache = 512 # before MySQL5.5
table_open_cache = 512
thread_cache_size = 8
query_cache_size = 0
thread_concurrency = 8
read_buffer_size = 1M
sort_buffer_size = 2M
read_rnd_buffer_size = 1M
myisam_sort_buffer_size = 1M
join_buffer_size = 512k
bulk_insert_buffer_size = 128M

innodb_data_file_path = ibdata1:1024M:autoextend
innodb_buffer_pool_size = 2G
#innodb_additional_mem_pool_size = 20M # abolition
innodb_log_file_size = 64M
innodb_log_buffer_size = 8M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_lock_wait_timeout = 50

#log=/usr/local/mysql/logs/general.log # before MySQL5.5
general_log=1
general_log_file=/usr/local/mysql/logs/general.log
log_error=/usr/local/mysql/logs/error.log
pid-file=/usr/local/mysql/logs/mysql.pid
slow_query_log=ON
# wrong
#log_slow_queries=/usr/local/mysql/logs/slow-query.log # before MySQL5.5
slow_query_log_file=/usr/local/mysql/logs/slow-query.log
long_query_time =1
```

コメントアウトしている部分が主に変更が必要な箇所でした。 MySQLのバージョンが上がるたびに思うんですが、 廃止・変更点を修正していく作業って、手間かかるし大変なんですよね・・・

環境設定のペインから起動する際の注意点

DMG形式でインストールする場合、macの環境設定からGUIでMySQLを起動できるようにする、 ペインも一緒にインストールできます。 ![f:id:treeapps:20130210003106p:plain](/hatena-images/images/fotolife/t/treeapps/20130210/20130210003106.png) しかしこのペイン、挙動不審なのです。 特に、エラーが起きた「後」の起動がおかしいのです。 エラーが起きた後は本当に注意が必要で、 プロセスが多重起動する事もあります。 多重起動するとkillするのが面倒なので、エラー後は一旦環境設定を終了してから再度開いて起動しましょう。
