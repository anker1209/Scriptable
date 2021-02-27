# Scriptable
[电报群](https://t.me/Scriptable_JS)：https://t.me/Scriptable_JS

# 中国联通小组件
<img src="https://raw.githubusercontent.com/anker1209/Scriptable/main/image/screenzy-1614423603123-lt.png"  width="200" height="200" align="bottom" />
推荐使用Boxjs代理缓存，cookie获取方法（以QuanX为例）：
> QuanX添加复写规则：
```ini
[rewrite_local]
^https?:\/\/act.10010.com\/SigninApp\/signin\/querySigninActivity.htm url script-request-header https://raw.githubusercontent.com/yxgsir/chavyleung/master/10010/10010.cookie.js
^https?:\/\/act.10010.com\/SigninApp(.*?)\/signin\/daySign url script-request-header https://raw.githubusercontent.com/yxgsir/chavyleung/master/10010/10010.cookie.js

[mitm]
hostname = act.10010.com, m.client.10010.com
```
> Boxjs添加chavy大佬订阅链接：https://raw.githubusercontent.com/chavyleung/scripts/master/box/chavy.boxjs.json
> 打开中国联通APP，进入签到页面并进行签到，获取cookie
> 运行脚本，点击代理缓存，获取缓存cookie
> 无代理缓存的，请使用Stream类抓包APP进行手动抓包，获取cookie后填入脚本内注释位置

# 中国移动小组件
<img src="https://raw.githubusercontent.com/anker1209/Scriptable/main/image/screenzy-1614423457282-yd.png"  width="200" height="200" align="bottom" />
推荐使用Boxjs代理缓存，cookie获取方法（以QuanX为例）：
> QuanX添加复写规则：
```ini
[rewrite_local]
^https:\/\/clientaccess.10086.cn\/biz-orange\/LN\/uamrandcodelogin\/autoLogin url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/10086/10086.fee.cookie.js
^https:\/\/clientaccess.10086.cn\/biz-orange\/BN\/realFeeQuery\/getRealFee url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/10086/10086.fee.cookie.js

[mitm]
hostname = clientaccess.10086.cn
```
> Boxjs添加chavy大佬订阅链接：https://raw.githubusercontent.com/chavyleung/scripts/master/box/chavy.boxjs.json
> 打开中国移动APP（非10086），获取一次cookie，点击话费余额再获取一次cookie，若打开app时没有提示获取会话，请在“我的”-“设置”-“登陆设置”中关闭指纹登陆，打开自动登录，登陆以后关闭后台打开app
> 运行脚本，点击代理缓存，获取缓存cookie

# 中国电信小组件
<img src="https://raw.githubusercontent.com/anker1209/Scriptable/main/image/screenzy-1614423524222-dx.png"  width="200" height="200" align="bottom" />
推荐使用Boxjs代理缓存，cookie获取方法（以QuanX为例）：
> QuanX添加复写规则：
```ini
[rewrite_local]
^https?:\/\/e.189.cn\/store\/user\/package_detail.do url script-request-body https://raw.githubusercontent.com/Sunert/Scripts/master/Task/telecomInfinity.js

[mitm]
hostname = e.189.cn
```
> Boxjs添加Sunert大佬订阅链接：https://raw.githubusercontent.com/Sunert/Scripts/master/Task/sunert.boxjs.json
> 打开天翼账号中心，获取cookie
> 运行脚本，点击代理缓存，获取缓存cookie
> 脚本内提供网站登录获取cookie，无代理缓存的可尝试网站登录获取cookie

# 赞赏码
<img src="https://raw.githubusercontent.com/anker1209/Scriptable/main/image/anker.JPG"  width="200" height="200" align="bottom" />
