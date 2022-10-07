// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: mobile-alt; share-sheet-inputs: file-url, url;
// Author: 脑瓜
// 电报群：https://t.me/Scriptable_JS @anker1209
// version:1.0.0
// update:2022/10/05

if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '中国联通';
    this.en = 'ChinaUnicom_LS';
    this.logo = 'https://pic.imgdb.cn/item/630ecac516f2c2beb1766cd4.png';
    this.Run();
  }
  
  cookie = ''; // 推荐使用Boxjs代理缓存，若无请自行手动抓包后在此输入中国联通cookie数据。

  mainColor = 'FFFFFF';

  fee = {
    title: '话费剩余',
    number: 0,
    unit: '元',
    en: '¥',
  };
  
  flow = {
    percent: 0,
    title: '已用流量',
    number: 0,
    unit: 'MB',
    en: 'MB',
    icon: 'antenna.radiowaves.left.and.right',
    iconColor: new Color('1ab6f8'),
    FGColor: new Color(this.mainColor),
    BGColor: new Color(this.mainColor, 0.2),
    colors: [],
  };

  voice = {
    percent: 0,
    title: '语音剩余',
    number: 0,
    unit: '分钟',
    en: 'MIN',
    icon: 'phone.fill',
    iconColor: new Color('30d15b'),
    FGColor: new Color(this.mainColor),
    BGColor: new Color(this.mainColor, 0.2),
    colors: [],
  };
  
  point = {
    title: '剩余积分',
    number: 0,
    unit: '',
    icon: 'tag.fill',
    iconColor: new Color('fc6d6d'),
  }

  init = async () => {
    try {
      await this.getData();
    } catch (e) {
      console.log(e);
    }
  };
  
  async login() {
    const url = 'https://m.client.10010.com/dailylottery/static/textdl/userLogin?version=iphone_c@8.0200&desmobile=';
    try {
      const sign = new Request(url);
      sign.headers = {'cookie': this.cookie};
      const signInfo = await sign.loadString();

      if (signInfo.indexOf('天天抽奖') >= 0 && signInfo.indexOf('请稍后重试') < 0) {
        console.log('用户登录成功');
      } else {
        console.log('用户登录失败');
      }
    } catch (e) {
      console.log('用户登录失败' + e);
    }
  }

  async getData() {
    await this.login();
    const url= 'https://m.client.10010.com/mobileserviceimportant/home/queryUserInfoSeven?version=iphone_c@8.0200&desmobiel=&showType=0';

    try {
      const req = new Request(url);
      req.headers = {'cookie': this.cookie};
      const userInfo = await req.loadJSON();

      if (userInfo.code === 'Y') {
        console.log('获取信息成功');
        console.log(userInfo.data);
        userInfo.data.dataList.forEach((item) => {
          if (item.type === 'fee') {
            if (item.unit ==='万元') {
              this.fee.number = item.number * 10000;
            } else {
              this.fee.number = item.number;
              this.fee.unit = item.unit;
            }
            this.fee.title = item.remainTitle;
          }
          if (item.type === 'flow') {
            this.flow.number = item.number;
            this.flow.unit = item.unit;
            this.flow.en = item.unit;
            this.flow.percent = (100 - item.persent).toFixed(2);
            this.flow.title = item.remainTitle;
          }
          if (item.type === 'voice') {
            this.voice.number = item.number;
            this.voice.unit = item.unit;
            this.voice.percent = (100 - item.persent).toFixed(2);
            this.voice.title = item.remainTitle;
          }
          if (item.type === 'point') {
            this.point.number = item.number;
            this.point.title = item.remainTitle;
          }
        });
      } else {
        throw 'cookie错误/服务器维护';
      }
    } catch (e) {
      console.log('获取信息失败：' + e);
    }
  }

  async smallHeader(stack) {
    const headerStack = stack.addStack();
    headerStack.centerAlignContent();
    const logo = headerStack.addImage(await this.$request.get(this.logo, 'IMG'));
    logo.imageSize = new Size(16, 16);
    logo.tintColor = new Color('FFFFFF');
    headerStack.addSpacer(3);
    const name = headerStack.addText(this.name);
    name.font = Font.mediumSystemFont(12.5);
    headerStack.addSpacer();
    const feeValue = headerStack.addText('¥ ' + `${this.fee.number}`);
    feeValue.font = Font.mediumSystemFont(13);
    feeValue.textColor = new Color(this.mainColor, 0.5);
  }

  addProgress(stack, data) {
    const item = stack.addStack();
    item.size = new Size(70, 0)
    item.layoutVertically();
    item.addSpacer(12);

    const barStack = item.addStack();
    const barImage = barStack.addImage(this.provideBar(data));
    barImage.imageSize = new Size(70, 15);
    
    item.addSpacer(4);

    const labelName = item.addStack();
    labelName.addSpacer();
    const value = labelName.addText(`${data.number} `);
    value.font = Font.mediumSystemFont(13);
    const unitStack = labelName.addStack();
    unitStack.layoutVertically();
    unitStack.addSpacer(2.5)
    const unit = unitStack.addText(`${data.en}`)
    unit.font = Font.mediumSystemFont(10);
    unit.textColor = new Color(this.mainColor, 0.6)
    labelName.addSpacer();
  }

  provideBar(data) {

    const lineBarWidth = 180;
    const lineBarHeight = 30;

    const draw = new DrawContext();
    draw.opaque = false;
    draw.respectScreenScale = true;
    draw.size = new Size(lineBarWidth, lineBarHeight);

    const barPath = new Path();
    const barHeight = lineBarHeight - 20;
    barPath.addRoundedRect(new Rect(0, 10, lineBarWidth, barHeight), barHeight / 2, barHeight / 2);
    draw.addPath(barPath);
    draw.setFillColor(new Color(this.mainColor, 0.2));
    draw.fillPath();

    const barPathNow = new Path();
    barPathNow.addRoundedRect(new Rect(0, 10, lineBarWidth * data.percent / 100, barHeight), barHeight / 2, barHeight / 2);
    draw.addPath(barPathNow);
    draw.setFillColor(new Color(this.mainColor, 0.7));
    draw.fillPath();

    const currPath = new Path();
    currPath.addEllipse(new Rect((lineBarWidth - lineBarHeight) * data.percent / 100, 0, lineBarHeight, lineBarHeight));
    draw.addPath(currPath);
    draw.setFillColor(new Color(this.mainColor, 1));
    draw.fillPath();
    
    const icon = SFSymbol.named(data.icon);
    icon.applyHeavyWeight();
    const image = icon.image;
    draw.drawImageInRect(image, new Rect((lineBarWidth - lineBarHeight) * data.percent / 100 + 6, 6, lineBarHeight - 12, lineBarHeight - 12));

    return draw.getImage()
    }

  renderSmall = async (w) => {
    w.addText('暂不支持')
    return w;
  };

  renderMedium = async (w) => {
    await this.smallHeader(w);
    const bodyStack = w.addStack();
    this.addProgress(bodyStack, this.flow);
    bodyStack.addSpacer();
    this.addProgress(bodyStack, this.voice);
    w.presentAccessoryRectangular();
    return w;
  };

  renderLarge = async (w) => {
    w.addText('暂不支持')
    return w;
  };

  Run() {
    if (config.runsInApp) {
      const widgetInitConfig = {
        cookie: '@YaYa_10010.cookie',
      };
      this.registerAction('账号设置', async () => {
        await this.setAlertInput(
          `${this.name}账号`,
          '读取 BoxJS 缓存信息',
            {cookie: 'cookie'},
          );
      }, 'https://pic1.imgdb.cn/item/63315c0816f2c2beb1a25252.png');
      this.registerAction('代理缓存', async () => {
        await this.setCacheBoxJSData(widgetInitConfig);
      }, 'https://pic1.imgdb.cn/item/63315c0816f2c2beb1a25272.png');
    }

    try {
      const {
        cookie
      } = this.settings;
      this.cookie = cookie ? cookie : this.cookie;
    } catch (e) {
      console.log(e);
    }
  }

  async render() {
    await this.init();
    const widget = new ListWidget();
    if (this.widgetFamily === 'small') {
      return await this.renderSmall(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderMedium(widget);
    }
  }
}

await Runing(Widget, args.widgetParameter, false);