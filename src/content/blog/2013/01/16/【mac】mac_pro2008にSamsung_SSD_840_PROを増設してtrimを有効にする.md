---
title: "mac pro2008にSamsung SSD 840 PROを増設してtrimを有効にする手順"
publishedAt: "2013-01-16T00:39:18+09:00"
basename: "2013/01/16/【mac】mac_pro2008にSamsung_SSD_840_PROを増設してtrimを有効にする"
sourceUrl: "/entry/2013/01/16/【mac】mac_pro2008にSamsung_SSD_840_PROを増設してtrimを有効にする/"
legacyUrl: "/entry/2013/01/16/【mac】mac_pro2008にSamsung_SSD_840_PROを増設してtrimを有効にする/"
categories: ["mac"]
image: "/hatena-images/images/fotolife/t/treeapps/20180418/20180418114029.png"
---
増設できました〜

![f:id:treeapps:20180418114029p:plain](/hatena-images/images/fotolife/t/treeapps/20180418/20180418114029.png)

[Samsung SSD Online | ITGマーケティング](http://www.itgm.co.jp/product/ssd840/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://www.itgm.co.jp/product/ssd840/\)](http://b.hatena.ne.jp/entry/http://www.itgm.co.jp/product/ssd840/) Mac Pro Early 2008にSamsung SSD 840 PRO 256Gを増設してみました。 最近SSD安くなりましたね。256Gで2万円くらいで買えました。

Mac Proは元々拡張しやすい内部構造になっているので、10分くらいで増設できました。 SSDの増設からtrim機能の有効化まで、順を追って解説してみます。

- [SSDを購入する](#SSDを購入する)
- [SSDのマウンタを購入する](#SSDのマウンタを購入する)
- [Mac Proのサイドパネルを開く](#Mac-Proのサイドパネルを開く)
- [マウンタにSSDを装着する](#マウンタにSSDを装着する)
- [HDDの空きスロットを探してSSDを挿入](#HDDの空きスロットを探してSSDを挿入)
- [SSDにOSをインストール](#SSDにOSをインストール)
- [trimを有効にする](#trimを有効にする)
  - [trimの状態を確認する](#trimの状態を確認する)
  - [Trim Enablerをインストールする](#Trim-Enablerをインストールする)
  - [Trimをオンにする](#Trimをオンにする)

<a id="SSDを購入する"></a>

### SSDを購入する

Mac Pro2008はSATA3.0Gbpsなので、最近の6.0GbpsのSSDの能力は最大限には発揮できません。 かといって性能が2分の1になる訳ではないので、6.0Gbpsでも問題ありません。 ↓まずはこれを購入します。[Samsung SSD840PROベーシックキット 256GB 2.5インチ 日本サムスン正規品 5年保証 MZ-7PD256B/IT](http://www.amazon.co.jp/exec/obidos/ASIN/B009VSOJ0O/treeapps5-22/) ![Samsung SSD840PROベーシックキット 256GB 2.5インチ 日本サムスン正規品 5年保証 MZ-7PD256B/IT](https://images-fe.ssl-images-amazon.com/images/I/41oiBVprWCL._SL160_.jpg)

<a id="SSDのマウンタを購入する"></a>

### SSDのマウンタを購入する

大抵のSSDは2.5インチなので、SSDマウンタを購入します。[2.5to3.5 SATA SSD&HDD Converter蓋スライド式](http://www.amazon.co.jp/exec/obidos/ASIN/B003CUVQ3U/treeapps5-22/) ![2.5to3.5 SATA SSD&HDD Converter蓋スライド式](http://ecx.images-amazon.com/images/I/21WxrXcwdyL._SL160_.jpg)私が購入したのは↑ですが、どれでもいいです。

<a id="Mac-Proのサイドパネルを開く"></a>

### Mac Proのサイドパネルを開く

Mac Proはネジ式ではなレバー式なので、非常に簡単にサイドパネルが開きます。 ドライバー無しで開けられるのは本当に嬉しい。

<a id="マウンタにSSDを装着する"></a>

### マウンタにSSDを装着する

前述のマウンタは特にネジ止め等はせず、コネクタを接続するだけのタイプです。 SSDとマウンタをネジ止めしないと不安な方は別途探しましょう。 SSDをマウンタに接続したら、銀色のスロットのカバー？とマウンタを4箇所ネジ止めします。

<a id="HDDの空きスロットを探してSSDを挿入"></a>

### HDDの空きスロットを探してSSDを挿入

Mac Proの空きスロットは全てSATA3.0Gbpsなので、どのスロットに挿入しても同じです。 余談ですが、macは既にOSをインストールしたHDDを別スロットに挿入しても問題無くマウントできます。 WindowsXPくらいまでは固定スロットでないと認識しなかったりしてうざかったのですが、macは抜き差してスロット位置を変更しても認識するのでありがたいです。 手順という程のものではないですが、これだけでSSDが増設できました。

<a id="SSDにOSをインストール"></a>

### SSDにOSをインストール

以前Mountain LionをApp Storeで購入したんですが、 これってフルインストールできるんですよね。 App StoreのOSはてっきりアップグレード版なのかと思ってました。 おかげでMountain Lionをクリーンインストールする事ができました。 クリーンインストール後、IDEのHDDにインストールされたOSは邪魔なので、ディスクユーティリティで完全の初期化してしまいましょう。

<a id="trimを有効にする"></a>

### trimを有効にする

<a id="trimの状態を確認する"></a>

#### trimの状態を確認する

![f:id:treeapps:20130116002314p:plain](/hatena-images/images/fotolife/t/treeapps/20130116/20130116002314.png) あれ！？SSD自体にはtrim機能があるのにオフになってる！！ という事でオンにします。

<a id="Trim-Enablerをインストールする"></a>

#### Trim Enablerをインストールする

macの標準機能ではtrimをオンにできませんが、フリーソフトでオンにすることができます。 http://www.groths.org/?page_id=322[!\[\]\(//b.hatena.ne.jp/entry/image/http://www.groths.org/?page_id=322\)](http://b.hatena.ne.jp/entry/http://www.groths.org/?page_id=322) インストールして実行すると、環境によっては↓こんな風にアラートが発生して実行できません。 ![f:id:treeapps:20130116002556p:plain](/hatena-images/images/fotolife/t/treeapps/20130116/20130116002556.png) 環境設定 → セキュリティとプライバシー → 一般タブを開き、↓のように全て許可してしまいます。 変更時は左下の鍵マークをクリックしておく必要があります。 ![f:id:treeapps:20130116002704p:plain](/hatena-images/images/fotolife/t/treeapps/20130116/20130116002704.png)

<a id="Trimをオンにする"></a>

#### Trimをオンにする

これでTrim Enablerが起動できるようになったので起動します。 起動したらtrimを早速オンにします。 ![f:id:treeapps:20130116002826p:plain](/hatena-images/images/fotolife/t/treeapps/20130116/20130116002826.png) 再起動後にtrimのオンが反映されるので、OSを再起動します。 再起動後、再びtrimの状態を確認します。 ![f:id:treeapps:20130116002956p:plain](/hatena-images/images/fotolife/t/treeapps/20130116/20130116002956.png) お疲れ様でした！これでmacのSSDのtrimは有効になりました！
