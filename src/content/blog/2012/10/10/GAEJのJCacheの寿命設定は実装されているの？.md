---
title: "GAEJのJCacheの寿命設定は実装されているの？"
publishedAt: "2012-10-10T02:01:13+09:00"
basename: "2012/10/10/GAEJのJCacheの寿命設定は実装されているの？"
sourceUrl: "/entry/2012/10/10/GAEJのJCacheの寿命設定は実装されているの？/"
legacyUrl: "/entry/2012/10/10/GAEJのJCacheの寿命設定は実装されているの？/"
categories: ["java", "gae"]
image: "/hatena-images/images/fotolife/t/treeapps/20180426/20180426142529.png"
---
調べてみました〜

![f:id:treeapps:20180426142529p:plain](/hatena-images/images/fotolife/t/treeapps/20180426/20180426142529.png)

tree-tipsでmemcacheを試しに使ってみました。 挙動を見ていて気づいたのですが、JCacheの寿命設定って動く？と思いました。

```java
public static void put(String key, Object value, int expire) {
	if (Strings.isNullOrEmpty(key) || value == null)
		return;
	try {
		Map<Integer, Integer> map = Maps.newHashMap();
		// 有効期限を設定する
		map.put(Integer.valueOf(GCacheFactory.EXPIRATION_DELTA), Integer.valueOf(expire));
		CacheFactory cacheFactory = CacheManager.getInstance().getCacheFactory();
		Cache cache = cacheFactory.createCache(map);
		cache.put(key, value);
	} catch (CacheException e) {
		throw new RuntimeException(e);
	}
}

@SuppressWarnings("unchecked")
public static <T> T get(String key) {
	if (Strings.isNullOrEmpty(key))
		return null;
	try {
		Map<Integer, Integer> map = Maps.newHashMap();
		Cache cache = CacheManager.getInstance().getCacheFactory().createCache(map);
		CacheEntry entry = cache.getCacheEntry(key);
		if (entry == null)
			return null;
		return (T) entry.getValue();
	} catch (CacheException e) {
		throw new RuntimeException(e);
	}
}
```

こんな感じにCacheUtilを実装したのですが、 全く寿命設定が効いてません。1秒に設定しても、延々とキャッシュが残り続けます。 もしかしてJCacheだと未実装で、low lovel apiだと実装されてたりするのだろうか。
