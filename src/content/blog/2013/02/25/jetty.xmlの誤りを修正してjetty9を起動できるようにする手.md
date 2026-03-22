---
title: "jetty.xmlの誤りを修正してjetty9を起動できるようにする手順"
publishedAt: "2013-02-25T02:06:35+09:00"
basename: "2013/02/25/jetty.xmlの誤りを修正してjetty9を起動できるようにする手"
sourceUrl: "/entry/2013/02/25/jetty.xmlの誤りを修正してjetty9を起動できるようにする手/"
legacyUrl: "/entry/2013/02/25/jetty.xmlの誤りを修正してjetty9を起動できるようにする手/"
categories: ["java", "tomcat", "mac", "jetty"]
image: "/hatena-images/images/fotolife/t/treeapps/20130225/20130225015053.png"
---
[Jetty - Servlet Engine and Http Server](http://jetty.codehaus.org/jetty/)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://jetty.codehaus.org/jetty/\)](http://b.hatena.ne.jp/entry/http://jetty.codehaus.org/jetty/) jettyは[java](http://d.hatena.ne.jp/keyword/java)の[サーブレット](http://d.hatena.ne.jp/keyword/%A5%B5%A1%BC%A5%D6%A5%EC%A5%C3%A5%C8)コンテナであり、[tomcat](http://d.hatena.ne.jp/keyword/tomcat)やJBossと競合するミドルウェアです。 [google app engine](http://d.hatena.ne.jp/keyword/google%20app%20engine)もjettyが使われており、実績も十分です。 仕事では[tomcat](http://d.hatena.ne.jp/keyword/tomcat)ばかりで、そろそろ新しいものを使いたかったので、jetty9を試すことにしました。 環境はmac（mountain lion）です。

jettyをダウンロードする[Eclipse Jetty Downloads](http://download.eclipse.org/jetty/)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://download.eclipse.org/jetty/\)](http://b.hatena.ne.jp/entry/http://download.eclipse.org/jetty/) [eclipse](http://d.hatena.ne.jp/keyword/eclipse)のサイトからダウンロードし、/usr/local 直下に配置します。 今回試すのはjetty9ですが、jetty9はJDK1.7以降に対応なので注意です。 JDK1.6では起動できません。 jettyが対応している[JDK](http://d.hatena.ne.jp/keyword/JDK)のバージョンは以下を参照して下さい。 [What Version Do I Use?](http://www.eclipse.org/jetty/documentation/current/what-jetty-version.html)[!\[\]\(http://b.hatena.ne.jp/entry/image/http://www.eclipse.org/jetty/documentation/current/what-jetty-version.html\)](http://b.hatena.ne.jp/entry/http://www.eclipse.org/jetty/documentation/current/what-jetty-version.html)

jettyを起動する起動スクリプトが用意されているので、それを利用して起動します。

```
tree-macpro:bin tree$ /usr/local/jetty/bin/jetty.sh start
```

よし、これで起動っと・・・・ん？

```
tree-macpro:jetty tree$ java -jar ./start.jar
2013-02-25 00:19:28.819:WARN:oejx.XmlConfiguration:main: Config error at <Call name="addBean"><Arg>|        <New class="org.eclipse.jetty.util.thread.TimerScheduler.TimerScheduler"/>|      </Arg></Call> java.lang.ClassNotFoundException: org.eclipse.jetty.util.thread.TimerScheduler.TimerScheduler in file:/usr/local/jetty-distribution-9.0.0.RC1/etc/jetty.xml
java.lang.reflect.InvocationTargetException
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:57)
    at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    at java.lang.reflect.Method.invoke(Method.java:601)
    at org.eclipse.jetty.start.Main.invokeMain(Main.java:453)
    at org.eclipse.jetty.start.Main.start(Main.java:595)
    at org.eclipse.jetty.start.Main.main(Main.java:96)
Caused by: java.lang.ClassNotFoundException: org.eclipse.jetty.util.thread.TimerScheduler.TimerScheduler
    at java.net.URLClassLoader$1.run(URLClassLoader.java:366)
    at java.net.URLClassLoader$1.run(URLClassLoader.java:355)
    at java.security.AccessController.doPrivileged(Native Method)
    at java.net.URLClassLoader.findClass(URLClassLoader.java:354)
    at java.lang.ClassLoader.loadClass(ClassLoader.java:423)
    at java.lang.ClassLoader.loadClass(ClassLoader.java:356)
    at org.eclipse.jetty.util.Loader.loadClass(Loader.java:100)
    at org.eclipse.jetty.xml.XmlConfiguration$JettyXmlConfiguration.nodeClass(XmlConfiguration.java:354)
    at org.eclipse.jetty.xml.XmlConfiguration$JettyXmlConfiguration.newObj(XmlConfiguration.java:743)
    at org.eclipse.jetty.xml.XmlConfiguration$JettyXmlConfiguration.itemValue(XmlConfiguration.java:1111)
    at org.eclipse.jetty.xml.XmlConfiguration$JettyXmlConfiguration.value(XmlConfiguration.java:1016)
    at org.eclipse.jetty.xml.XmlConfiguration$JettyXmlConfiguration.call(XmlConfiguration.java:710)
    at org.eclipse.jetty.xml.XmlConfiguration$JettyXmlConfiguration.configure(XmlConfiguration.java:407)
    at org.eclipse.jetty.xml.XmlConfiguration$JettyXmlConfiguration.configure(XmlConfiguration.java:344)
    at org.eclipse.jetty.xml.XmlConfiguration.configure(XmlConfiguration.java:262)
    at org.eclipse.jetty.xml.XmlConfiguration$1.run(XmlConfiguration.java:1221)
    at java.security.AccessController.doPrivileged(Native Method)
    at org.eclipse.jetty.xml.XmlConfiguration.main(XmlConfiguration.java:1160)
    ... 7 more
```

ほほぅ、[java](http://d.hatena.ne.jp/keyword/java).lang.ClassNotFoundException と。 jetty.[xml](http://d.hatena.ne.jp/keyword/xml) がおかしいとstack traceに出ているので、見てみます。

```
    <!-- =========================================================== -->
    <!-- Add shared Scheduler instance                               -->
    <!-- =========================================================== -->
    <Call name="addBean">
      <Arg>
        <New class="org.eclipse.jetty.util.thread.TimerScheduler.TimerScheduler"/>
      </Arg>
    </Call>
```

これですね。 TimerScheduler.TimerScheduler って非常に怪しい・・ [eclipse](http://d.hatena.ne.jp/keyword/eclipse)でこのjarをクラスパスに追加して、このクラスのパスが合っているか確認します。 ![f:id:treeapps:20130225015053p:plain](/hatena-images/images/fotolife/t/treeapps/20130225/20130225015053.png) ( #^^) パス間違ってるじゃん おいおい初期設定ファイルだぞこれ・・・ 正しくは以下ですね。

```
    <!-- =========================================================== -->
    <!-- Add shared Scheduler instance                               -->
    <!-- =========================================================== -->
    <Call name="addBean">
      <Arg>
<!--
        <New class="org.eclipse.jetty.util.thread.TimerScheduler.TimerScheduler"/>
-->
        <New class="org.eclipse.jetty.util.thread.TimerScheduler"/>
      </Arg>
    </Call>
```

これでOK。

改めてjettyを起動する

```
tree-macpro:bin tree$ ./jetty.sh start
Starting Jetty: STARTED Jetty 2013年 2月25日 月曜日 01時53分11秒 JST
tree-macpro:bin tree$ WARNING: System properties and/or JVM args set.  Consider using --dry-run or --exec
2013-02-25 01:53:12.027:WARN::main: test-realm is deployed. DO NOT USE IN PRODUCTION!
2013-02-25 01:53:12.264:INFO:oejs.Server:main: jetty-9.0.0.RC1
2013-02-25 01:53:12.318:INFO:oejs.NCSARequestLog:main: Opened /usr/local/jetty-distribution-9.0.0.RC1/logs/2013_02_24.request.log
2013-02-25 01:53:12.343:WARN:oejj.ObjectMBean:main: Type conflict for mbean attr configurationClasses in class org.eclipse.jetty.deploy.providers.WebAppProvider
2013-02-25 01:53:12.347:INFO:oejdp.ScanningAppProvider:main: Deployment monitor [file:/usr/local/jetty-distribution-9.0.0.RC1/webapps/] at interval 1
2013-02-25 01:53:12.353:INFO:oejd.DeploymentManager:main: Deployable added: /usr/local/jetty-distribution-9.0.0.RC1/webapps/example-moved.xml
・・・中略・・・
2013-02-25 01:53:13.744:INFO:JavadocTransparentProxy:main: JavadocTransparentProxy @ /proxy to http://download.eclipse.org/jetty/stable-9
2013-02-25 01:53:13.744:INFO:oejsh.ContextHandler:main: started o.e.j.w.WebAppContext@2d227d01{/proxy,file:/private/var/folders/tm/vrbvlk7s67b0przw2_mdqd440000gn/T/jetty-0.0.0.0-8080-xref-proxy.war-_xref-proxy-any-/webapp/,AVAILABLE}{/xref-proxy.war}
2013-02-25 01:53:13.760:INFO:oejs.ServerConnector:main: Started ServerConnector@3cb5922e{HTTP/1.1}{0.0.0.0:8080}
```

よし、起動OK。 ではブラウザで画面を開いてみましょう。 http://localhost:8080/test/ ![f:id:treeapps:20130225015520p:plain](/hatena-images/images/fotolife/t/treeapps/20130225/20130225015520.png) やっと動いた。 それにしても初期設定ファイルが間違ってるとか・・・ 1回でも起動すれば1発で解るレベルのエラーなんですけどね。

フォルダ構成とか大体以下の感じの構成です。[tomcat](http://d.hatena.ne.jp/keyword/tomcat)とほぼ変わりませんね。 [tomcat](http://d.hatena.ne.jp/keyword/tomcat)でおなじみの webapps/ROOT もあり、解りやすいです。

```
jetty
├── bin
│   └── jetty.sh
├── etc
│   ├── jetty.conf
│   └── jetty.xml
├── jetty.pid
├── lib
├── logs
├── resources
│   ├── jetty-logging.properties
│   └── log4j.properties
├── start.d
├── start.ini
├── start.jar
└── webapps
    ├── ROOT
    │   ├── images
    │   │   ├── jetty-header.jpg
    │   │   └── webtide_logo.jpg
    │   ├── index.html
    │   └── jetty.css
    └── xref-proxy.war
```

[なぜ、あなたはJavaでオブジェクト指向開発ができないのか―Javaの壁を克服する実践トレーニング](http://www.amazon.co.jp/exec/obidos/ASIN/477412222X/treeapps5-22/)

![なぜ、あなたはJavaでオブジェクト指向開発ができないのか―Javaの壁を克服する実践トレーニング](http://ecx.images-amazon.com/images/I/51ZTTTREX0L._SL160_.jpg)
