# Scriptable

[电报群](https://t.me/Scriptable_JS)：https://t.me/Scriptable_JS

## 中国联通

![中国联通 图片](https://raw.githubusercontent.com/anker1209/Scriptable/main/image/screenzy-1614423603123-lt.png "联通小组件")

推荐使用Boxjs代理缓存：

- [BoxJs 使用教程](https://chavyleung.gitbook.io/boxjs/)

- [BoxJs 教程视频](https://youtu.be/eIpBrRxiy0w)

cookie获取方法：

#### QuanX：

```ini
[mitm]
hostname = act.10010.com, m.client.10010.com

[rewrite_local]
# 获取联通cookie
^https:\/\/m\.client\.10010\.com\/serviceimportantbusiness\/smart\/smartwisdomCommonNew  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/10010/index.js
```

#### Surge：

- 手动添加:
```ini
[MITM]
hostname = act.10010.com, m.client.10010.com

[Script]
Rewrite: 获取联通cookie = type=http-request,pattern=^https:\/\/m\.client\.10010\.com\/serviceimportantbusiness\/smart\/smartwisdomCommonNew,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/10010/index.js,script-update-interval=0
```

- 引入模块
https://github.com/anker1209/Scriptable/tree/main/module/10010.sgmodule?raw=true

> Boxjs添加YaYa美女订阅链接（感谢YaYa辛苦付出~）：
https://raw.githubusercontent.com/dompling/Script/master/dompling.boxjs.json

> 打开中国联通app --> 首页的流量查询获取Cookie；

> 运行脚本，点击基础设置-->BoxJS域名，设置为你自己的BoxJS域名，再次运行脚本，选择代理缓存，获取缓存cookie；

## 中国移动（暂时不可用）

![中国移动 图片](https://raw.githubusercontent.com/anker1209/Scriptable/main/image/screenzy-1614423457282-yd.png "移动小组件")

推荐使用Boxjs代理缓存：

- [BoxJs 使用教程](https://chavyleung.gitbook.io/boxjs/)

- [BoxJs 教程视频](https://youtu.be/eIpBrRxiy0w)

cookie获取方法：

#### QuanX：

```ini
[mitm]
hostname = clientaccess.10086.cn

[rewrite_local]
^https:\/\/clientaccess.10086.cn\/biz-orange\/LN\/uamrandcodelogin\/autoLogin url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/10086/10086.fee.cookie.js
^https:\/\/clientaccess.10086.cn\/biz-orange\/BN\/realFeeQuery\/getRealFee url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/10086/10086.fee.cookie.js
```

#### Surge：

```ini
[mitm]
hostname = clientaccess.10086.cn

[Script]
Rewrite: CMCC = type=http-request,pattern=^https:\/\/clientaccess.10086.cn\/biz-orange\/LN\/uamrandcodelogin\/autoLogin,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/10086/10086.fee.cookie.js,requires-body=true,debug=true
Rewrite: CMCC = type=http-request,pattern=^https:\/\/clientaccess.10086.cn\/biz-orange\/BN\/realFeeQuery\/getRealFee,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/10086/10086.fee.cookie.js,requires-body=true,debug=true
```

> Boxjs添加chavy大佬订阅链接：
https://raw.githubusercontent.com/chavyleung/scripts/master/box/chavy.boxjs.json

> 打开中国移动APP（非10086），获取一次cookie，点击话费余额再获取一次cookie，若打开app时没有提示获取会话，请在 “我的” --> “设置” --> “登陆设置” 中关闭指纹/faceID登陆，打开自动登录，登陆以后关闭后台，重新打开app获取cookie（注：中国移动app以短信验证码方式登录，本机一键登录可能获取不到cookie）；

> 运行脚本，点击基础设置-->BoxJS域名，设置为你自己的BoxJS域名，再次运行脚本，选择代理缓存，获取缓存cookie

## 中国电信

![中国电信 图片](https://raw.githubusercontent.com/anker1209/Scriptable/main/image/screenzy-1614423524222-dx.png "电信小组件")

推荐使用Boxjs代理缓存：

- [BoxJs 使用教程](https://chavyleung.gitbook.io/boxjs/)

- [BoxJs 教程视频](https://youtu.be/eIpBrRxiy0w)

cookie获取方法（也可以参考[作者Sunert的教程](https://github.com/Sunert/Script/tree/master/TaskConf/dianxin)）：

> 登录功能脚本修改自 [@95du丶茅台]特别在此感谢

#### QuanX：

```ini
[mitm]
hostname = e.dlife.cn

[rewrite_local]
^https:\/\/e\.dlife\.cn\/user\/loginMiddle  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/10000/index.js
```

#### Surge：

```ini
[MITM]
hostname = e.dlife.cn

[Script]
电信登录地址 = type=http-request,pattern=^https:\/\/e\.dlife\.cn\/user\/loginMiddle,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/10000/index.js,script-update-interval=0

```

#### Loon:
```ini
[mitm]
hostname = e.dlife.cn

[Script]
http-request ^https:\/\/e\.dlife\.cn\/user\/loginMiddle tag=电信登录地址, script-path=https://raw.githubusercontent.com/dompling/Script/master/10000/index.js

```

> Boxjs添加Sunert大佬订阅链接：
https://raw.githubusercontent.com/Sunert/Script/master/Task/sunert.boxjs.json

> 打开天翼账号中心，获取cookie；

> 运行脚本，点击基础设置-->BoxJS域名，设置为你自己的BoxJS域名，再次运行脚本，选择代理缓存，获取缓存cookie；

> 无代理缓存的，请使用Stream类抓包APP进行手动抓包，获取cookie后填入脚本内注释位置或运行脚本——>账户设置——>手动输入；

> 脚本内提供网站登录获取cookie，无代理缓存的可尝试网站登录获取cookie
