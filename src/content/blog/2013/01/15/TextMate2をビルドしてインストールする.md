---
title: "【mac】TextMate2をビルドしてインストールする"
publishedAt: "2013-01-15T00:38:22+09:00"
basename: "2013/01/15/TextMate2をビルドしてインストールする"
sourceUrl: "/entry/2013/01/15/TextMate2をビルドしてインストールする/"
legacyUrl: "/entry/2013/01/15/TextMate2をビルドしてインストールする/"
categories: ["mac", "ライブラリ"]
image: "/hatena-images/images/fotolife/t/treeapps/20170829/20170829002500.png"
---
ビルドしちゃいました〜

![f:id:treeapps:20170829002500p:plain](/hatena-images/images/fotolife/t/treeapps/20170829/20170829002500.png)

[TextMate &mdash; The Missing Editor for Mac OS X](http://macromates.com/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://macromates.com/\)](http://b.hatena.ne.jp/entry/http://macromates.com/) 去年オープンソース化されたTextMate2をインストールする手順を公開します。 TextMateはDMGやpkgなどのインストーラー形式では配布されていないので、自分でビルドする必要が有り、少々敷居が高いです。

### 環境

Mountain Lionをクリーンインストールした状態。

### javaのインストール

※ 既にjavaがインストール済みの場合は飛ばして下さい。

アプリケーション → ユーティリティー → ターミナル.appを起動します。 起動後、以下のコマンドを実行します。

```java
java --version
```

javaがインストールされていない場合、上記コマンド実行後に自動的にjavaをインストールするか聞かれるので、インストールしましょう。

### XCode

※ 最新版のXCodeが必要です。

#### XCodeのインストール

アプリケーション → App Store → XCodeで検索してインストールして下さい。 ![f:id:treeapps:20130115004216p:plain](/hatena-images/images/fotolife/t/treeapps/20130115/20130115004216.png)

#### Command Line Toolsのインストール

アプリケーション → XCodeでXCodeを起動します。 XCode起動後、メニューバー → XCode → Preferencesを選択します。 続いてDownloadsタブ → Componentsと選択します。 リストに「Command Line Tools」というものがあるので、右側にあるinstallボタンをクリックしてインストールします。 ![f:id:treeapps:20130115002210p:plain](/hatena-images/images/fotolife/t/treeapps/20130115/20130115002210.png)

### Homebrew

#### Homebrewのインストール

[Redirecting...](http://mxcl.github.com/homebrew/)[!\[\]\(//b.hatena.ne.jp/entry/image/http://mxcl.github.com/homebrew/\)](http://b.hatena.ne.jp/entry/http://mxcl.github.com/homebrew/) Homerbrewは、macにソフトウェアやライブラリを簡単にインストールするためのコマンドラインツールです。 前項でXcode Command Line Toolsをインストールしたので、ターミナルで以下のコマンドを実行すると、Homebrewがインストールできます。

```ruby
ruby <(curl -fsSk https://raw.github.com/mxcl/homebrew/go)
```

#### Homebrewの更新

ターミナルを起動し、以下のコマンドを実行してHomebrew本体とFormulaを最新版に更新します。

```
brew update
```

### TextMate2

#### ソースコードのダウンロード

```
git clone https://github.com/textmate/textmate.git
```

#### ビルドに必要なライブラリをインストール

```
brew install ragel boost multimarkdown hg ninja
```

#### TextMateのフォルダに移動する

git cloneしたフォルダに移動するだけです。

```
cd textmate
```

#### submoduleの初期化と更新を行う

```
git submodule update --init
```

#### ビルドを実行する

```
./configure && ninja
```

ビルドが成功すると、以下のようなメッセージと共に自動的にTextMateが起動します。

```
[1106/1106] Run ‘/Users/tree/build/TextMate/Applications/TextMate/TextMate.app’…
```

#### TextMate2をインストールする

自動的に起動したTextMateは一旦終了します。 ビルドしたTextMate.appは実は/Applications以下に無いので、コピーします。

```
cp -r ~/build/TextMate/Applications/TextMate/TextMate.app /Applications/
```

#### ビルドした再のゴミを削除する

```
rm -rf ~/build/TextMate/
```

#### 起動してみる

![f:id:treeapps:20130115004851p:plain](/hatena-images/images/fotolife/t/treeapps/20130115/20130115004851.png) お疲れ様でした！これでインストール完了です！！

### ビルド等でエラーが出る場合の確認事項

#### CLangが最新版を参照しているか

「xcrun clang --version」というコマンドでバージョンを確認します。

```
$ xcrun clang --version
Apple clang version 4.1 (tags/Apple/clang-421.11.66) (based on LLVM 3.1svn)
Target: x86_64-apple-darwin12.2.0
Thread model: posix
```

ここでclangのバージョンが4以上ならOKです。 もしバージョンが３系の場合、自力で最新版に参照を変更する必要があります。 詳細は以下のサイトに書いてあるので参考にして下さい。 [TaKUMA7's はてなblog](http://takuma7.hatenablog.jp/)
