// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: mobile-alt;
// Script: 2Ya & 脑瓜
// 电报群：https://t.me/Scriptable_JS @anker1209
// 该脚本小尺寸组件支持两种模式，默认为圆环进度条模式，主屏幕长按小组件-->编辑小组件-->Parameter，输入1，使用文字模式
// 渐变进度条为试验性功能，默认关闭
// version:1.1.0
// update:2021/04/02

if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '中国电信';
    this.en = 'ChinaTelecom_2021';
    this.logo = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/fe69a7a3-a0e2-4bf4-bab2-f11fd4b91d7d.png';
    this.smallLogo = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/0b27cf6d-6b15-42bd-9f66-1b2c668ec5eb.png';
    this.Run();
  }
  cookie = ''; // 推荐使用Boxjs代理缓存，若无请自行手动抓包后在此输入中国电信cookie数据或运行脚本-->账号设置-->手动输入。
  widgetParam = args.widgetParameter;

  gradient = false;
  usedFlow = false;

  flowColorHex = 'FF6620';
  voiceColorHex = '78C100';

  ringStackSize = 61;
  ringTextSize = 14;
  feeTextSize = 21;
  textSize = 13;
  smallPadding = 16;
  padding = 10;
  logoScale = 0.24;

  canvSize = 178;
  canvWidth = 18;
  canvRadius = 80;

  format = (str) => {
    return parseInt(str) >= 10 ? str : `0${str}`;
  };

  date = new Date();
  arrUpdateTime = [
    this.format(this.date.getMonth() + 1),
    this.format(this.date.getDate()),
    this.format(this.date.getHours()),
    this.format(this.date.getMinutes()),
  ];

  fee = {
    title: '剩余话费',
    number: 0,
    unit: '元',
    en: '¥',
  };
  
  flow = {
    percent: 0,
    max: 40,
    title: '剩余流量',
    number: 0,
    unit: 'MB',
    en: 'MB',
    icon: 'antenna.radiowaves.left.and.right',
    iconColor: new Color('1ab6f8'),
    FGColor: new Color(this.flowColorHex),
    BGColor: new Color(this.flowColorHex, 0.2),
    colors: [],
  };

  voice = {
    percent: 0,
    title: '剩余语音',
    number: 0,
    unit: '分钟',
    en: 'MIN',
    icon: 'phone.fill',
    iconColor: new Color('30d15b'),
    FGColor: new Color(this.voiceColorHex),
    BGColor: new Color(this.voiceColorHex, 0.2),
    colors: [],
  };
  
  point = {
    title: '更新时间',
    number: `${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`,
    unit: '',
    icon: 'arrow.2.circlepath',
    iconColor: new Color('fc6d6d'),
  }

  options = {
    headers: {
      cookie: '',
    },
    method: 'POST',
  };

  fetchUrl = {
    detail: 'https://e.189.cn/store/user/package_detail.do',
    balance: 'https://e.189.cn/store/user/balance_new.do',
  };

  init = async () => {
    try {
      await this.getData();
    } catch (e) {
      console.log(e);
    }
  };

  formatFlow(number) {
    const n = number / 1024;
    if (n < 1024) {
      return {count: n.toFixed(2), unit: 'MB'};
    }
    return {count: (n / 1024).toFixed(2), unit: 'GB'};
  }

  unlimitUser(flow) {
    const usedFlow = this.formatFlow(flow);
    this.flow.title = '已用流量';
    this.flow.number = usedFlow.count;
    this.flow.unit = usedFlow.unit;
    this.flow.en = usedFlow.unit;
    if (this.flow.unit === 'GB') {
      this.flow.percent = (100 - (this.flow.number / (this.flow.max || 40)) * 100).toFixed(2);
    } else {
      this.flow.percent = (100 - (this.flow.number / ((this.flow.max || 40) * 1024)) * 100).toFixed(2);
    }
  }

  getData = async () => {
    const detail = await this.http({
      url: this.fetchUrl.detail,
      ...this.options,
    });
    console.log(detail);
    const balance = await this.http({
      url: this.fetchUrl.balance,
      ...this.options,
    });

    if (detail.result === 0) {
      // 套餐分钟数
      if (detail.voiceBalance && detail.voiceAmount) {
        this.voice.percent = ((Number(detail.voiceBalance) / Number(detail.voiceAmount)) * 100).toFixed(2);
        this.voice.number = detail.voiceBalance;
      } else {
        detail.items.forEach((data) => {
          if (data.offerType == 21) {
            data.items.forEach((item) => {
              if (item.unitTypeId === '1') {
                if (item.ratableAmount !== '0' && item.balanceAmount !== '0') {
                  this.voice.percent = ((Number(item.balanceAmount) / Number(item.ratableAmount)) * 100).toFixed(2);
                  this.voice.number = item.balanceAmount;
                }
              }
            });
          }
        });
      }
      if (!detail.number && !detail.total) {
        detail.items.forEach((data) => {
          if (data.offerType !== 19) {
            data.items.forEach((item) => {
              if (item.unitTypeId === '3') {
                if (item.usageAmount !== '0' && item.balanceAmount !== '0') {
                  this.flow.percent = ((item.balanceAmount / (item.ratableAmount || 1)) * 100).toFixed(2);
                  const flow = this.formatFlow(item.balanceAmount);
                  this.flow.number = flow.count;
                  this.flow.unit = flow.unit;
                  this.flow.en = flow.unit;
                }
                if (data.offerType == 21 && item.ratableAmount == '0') {
                  this.unlimitUser(item.usageAmount);
                }
              }
            });
          }
        });
      } else {
        if (this.usedFlow) {
          this.unlimitUser(detail.used);
        } else {
          this.flow.percent = ((detail.balance / (detail.total || 1)) * 100).toFixed(2);
          const flow = this.formatFlow(detail.balance);
          this.flow.number = flow.count;
          this.flow.unit = flow.unit;
          this.flow.en = flow.unit;
        }
      }

    }
    if (balance.result === 0) {
      // 余额
      this.fee.number = parseFloat(parseInt(balance.totalBalanceAvailable) / 100).toFixed(2)};
  };

  async smallHeader(stack) {
    const headerStack = stack.addStack();
    headerStack.addSpacer();
    const logo = headerStack.addImage(await this.$request.get(this.logo, 'IMG'));
    logo.imageSize = new Size(455 * this.logoScale, 125 * this.logoScale);
    headerStack.addSpacer();
    stack.addSpacer();

    const feeStack = stack.addStack();
    feeStack.centerAlignContent();
    feeStack.addSpacer();
    const feeValue = feeStack.addText(`${this.fee.number}`);
    feeValue.font = Font.mediumRoundedSystemFont(this.feeTextSize);
    feeValue.textColor = this.widgetColor;
    feeStack.addSpacer();
    stack.addSpacer();
  }

  textLayout(stack, data) {
    const rowStack = stack.addStack();
    rowStack.centerAlignContent();
    const icon = SFSymbol.named(data.icon);
    icon.applyHeavyWeight();
    let iconElement = rowStack.addImage(icon.image);
    iconElement.imageSize = new Size(this.textSize, this.textSize);
    iconElement.tintColor = data.iconColor;
    rowStack.addSpacer(4);
    let title = rowStack.addText(data.title);
    rowStack.addSpacer();
    let number = rowStack.addText(data.number + data.unit);
    ;[title, number].map(t => t.textColor = this.widgetColor);
    ;[title, number].map(t => t.font = Font.systemFont(this.textSize));
  }

  async mediumCell(canvas, stack, data, color, fee = false, percent) {
    const bg = new LinearGradient()
    bg.locations = [0, 1]
    bg.colors = [
    new Color(color, 0.03),
    new Color(color, 0.1)
    ]
    const dataStack = stack.addStack();
    dataStack.backgroundGradient = bg;
    dataStack.cornerRadius = 20;
    dataStack.layoutVertically();
    dataStack.addSpacer();

    const topStack = dataStack.addStack();
    topStack.addSpacer();
    await this.imageCell(canvas, topStack, data, fee, percent);
    topStack.addSpacer();

    if (fee) {
      dataStack.addSpacer(10);
      const updateStack = dataStack.addStack();
      updateStack.addSpacer();
      updateStack.centerAlignContent();
      const updataIcon = SFSymbol.named('arrow.2.circlepath');
      updataIcon.applyHeavyWeight();
      const updateImg = updateStack.addImage(updataIcon.image);
      updateImg.tintColor = new Color(color, 0.6);
      updateImg.imageSize = new Size(10, 10);
      updateStack.addSpacer(3);
      const updateText = updateStack.addText(`${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`)
      updateText.font = Font.mediumSystemFont(10);
      updateText.textColor = new Color(color, 0.6);
      updateStack.addSpacer();
    }
    
    dataStack.addSpacer();

    const numberStack = dataStack.addStack();
    numberStack.addSpacer();
    const number = numberStack.addText(`${data.number} ${data.en}`);
    number.font = Font.semiboldSystemFont(15);
    numberStack.addSpacer();

    dataStack.addSpacer(3);

    const titleStack = dataStack.addStack();
    titleStack.addSpacer();
    const title = titleStack.addText(data.title);
    title.font = Font.mediumSystemFont(11);
    title.textOpacity = 0.7;
    titleStack.addSpacer();

    dataStack.addSpacer(15);
    ;[title, number].map(t => t.textColor = new Color(color));
  }

  async imageCell(canvas, stack, data, fee, percent) {
    const canvaStack = stack.addStack();
    canvaStack.layoutVertically();
    if (!fee) {
      this.drawArc(canvas, data.percent * 3.6, data.FGColor, data.BGColor);
      canvaStack.size = new Size(this.ringStackSize, this.ringStackSize);
      canvaStack.backgroundImage = canvas.getImage();
      this.ringContent(canvaStack, data, percent);
    } else {
      canvaStack.addSpacer(10);
      const smallLogo = await this.$request.get(this.smallLogo, 'IMG');
      const logoStack = canvaStack.addStack();
      logoStack.size = new Size(30, 30);
      logoStack.backgroundImage = smallLogo;
    }
  }

  ringContent(stack, data, percent = false) {
    const rowIcon = stack.addStack();
    rowIcon.addSpacer();
    const icon = SFSymbol.named(data.icon);
    icon.applyHeavyWeight();
    const iconElement = rowIcon.addImage(icon.image);
    iconElement.tintColor = this.gradient ? new Color(data.colors[1]) : data.FGColor;
    iconElement.imageSize = new Size(12, 12);
    iconElement.imageOpacity = 0.7;
    rowIcon.addSpacer();

    stack.addSpacer(1);

    const rowNumber = stack.addStack();
    rowNumber.addSpacer();
    const number = rowNumber.addText(percent ? `${data.percent}` : `${data.number}`);
    number.font = percent ? Font.systemFont(this.ringTextSize - 2) : Font.mediumSystemFont(this.ringTextSize);
    rowNumber.addSpacer();

    const rowUnit = stack.addStack();
    rowUnit.addSpacer();
    const unit = rowUnit.addText(percent ? '%' : data.unit);
    unit.font = Font.boldSystemFont(8);
    unit.textOpacity = 0.5;
    rowUnit.addSpacer();

    if (percent) {
      if (this.gradient) {
        ;[unit, number].map(t => t.textColor = new Color(data.colors[1]));
      } else {
        ;[unit, number].map(t => t.textColor = data.FGColor);
      }
    } else {
      ;[unit, number].map(t => t.textColor = this.widgetColor);
    }
  }

  makeCanvas() {
    const canvas = new DrawContext();
    canvas.opaque = false;
    canvas.respectScreenScale = true;
    canvas.size = new Size(this.canvSize, this.canvSize);
    return canvas;
  }

  sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
  }

  cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
  }

  drawArc(canvas, deg, fillColor, strokeColor) {
    let ctr = new Point(this.canvSize / 2, this.canvSize / 2);
    let bgx = ctr.x - this.canvRadius;
    let bgy = ctr.y - this.canvRadius;
    let bgd = 2 * this.canvRadius;
    let bgr = new Rect(bgx, bgy, bgd, bgd)

    canvas.setStrokeColor(strokeColor);
    canvas.setLineWidth(this.canvWidth);
    canvas.strokeEllipse(bgr);

    for (let t = 0; t < deg; t++) {
      let rect_x = ctr.x + this.canvRadius * this.sinDeg(t) - this.canvWidth / 2;
      let rect_y = ctr.y - this.canvRadius * this.cosDeg(t) - this.canvWidth / 2;
      let rect_r = new Rect(rect_x, rect_y, this.canvWidth, this.canvWidth);

      canvas.setFillColor(this.gradient ? new Color(fillColor[t]) : fillColor);
      canvas.setStrokeColor(strokeColor)
      canvas.fillEllipse(rect_r);
    }
  }

  arrColor() {
    let colorArr = [['#FFF000', '#E62490'], ['#FDEB71', '#F8D800'], ['#ABDCFF', '#0396FF'], ['#FEB692', '#EA5455'], ['#FEB692', '#EA5455'], ['#CE9FFC', '#7367F0'], ['#90F7EC', '#32CCBC'], ['#FFF6B7', '#F6416C'], ['#E2B0FF', '#9F44D3'], ['#F97794', '#F072B6'], ['#FCCF31', '#F55555'], ['#5EFCE8', '#736EFE'], ['#FAD7A1', '#E96D71'], ['#FFFF1C', '#00C3FF'], ['#FEC163', '#DE4313'], ['#F6CEEC', '#D939CD'], ['#FDD819', '#E80505'], ['#FFF3B0', '#CA26FF'], ['#2AFADF', '#4C83FF'], ['#EECDA3', '#EF629F'], ['#C2E59C', '#64B3F4'], ['#FFF886', '#F072B6'], ['#F5CBFF', '#C346C2'], ['#FFF720', '#3CD500'], ['#EE9AE5', '#5961F9'], ['#FFC371', '#FF5F6D'], ['#FFD3A5', '#FD6585'], ['#C2FFD8', '#465EFB'], ['#FFC600', '#FD6E6A'], ['#FFC600', '#FD6E6A'], ['#92FE9D', '#00C9FF'], ['#FFDDE1', '#EE9CA7'], ['#F0FF00', '#58CFFB'], ['#FFE985', '#FA742B'], ['#72EDF2', '#5151E5'], ['#F6D242', '#FF52E5'], ['#F9D423', '#FF4E50'], ['#3C8CE7', '#00EAFF'], ['#FCFF00', '#FFA8A8'], ['#FF96F9', '#C32BAC'], ['#D0E6A5', '#FFDD94'], ['#FFDD94', '#FA897B'], ['#FFCC4B', '#FF7D58'], ['#D0E6A5', '#86E3CE'], ['#F0D5B6', '#F16238'], ['#F8EC70', '#F9C708'], ['#C4E86B', '#00BCB4'], ['#FFC446', '#FA0874'], ['#E1EE32', '#FFB547'], ['#FFD804', '#2ACCC8'], ['#E9A6D2', '#E9037B'], ['#F8EC70', '#49E2F6'], ['#A2F8CD', '#A2F852'], ['#49E2F6', '#A2F8CD'], ['#FDEFE2', '#FE214F'], ['#F8EC70', '#A2F8CD'], ['#F8EC70', '#49E2F6'], ['#B7FFE4', '#E4B7FF'], ['#FFB7D1', '#E4B7FF'], ['#D0E6A5', '#86E3CE'], ['#E8E965', '#64C5C7']];
    let colors = colorArr[Math.floor(Math.random() * colorArr.length)];
    return colors;
  }

  gradientColor(colors, step) {
    var startRGB = this.colorToRgb(colors[0]),
    startR = startRGB[0],
    startG = startRGB[1],
    startB = startRGB[2];

    var endRGB = this.colorToRgb(colors[1]),
    endR = endRGB[0],
    endG = endRGB[1],
    endB = endRGB[2];

    var sR = (endR - startR) / step,
    sG = (endG - startG) / step,
    sB = (endB - startB) / step;

    var colorArr = [];
    for (var i = 0;i < step; i++) {
     var hex = this.colorToHex('rgb(' + parseInt((sR * i + startR)) + ',' + parseInt((sG * i + startG)) + ',' + parseInt((sB * i + startB)) + ')');
     colorArr.push(hex);
   }
   return colorArr;
 }

 colorToRgb(sColor) {
   var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
   var sColor = sColor.toLowerCase();
   if (sColor && reg.test(sColor)) {
     if (sColor.length === 4) {
       var sColorNew = "#";
       for (var i = 1; i < 4; i += 1) {
         sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
       }
       sColor = sColorNew;
     }
     var sColorChange = [];
     for (var i = 1; i < 7; i += 2) {
       sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
     }
     return sColorChange;
   } else {
     return sColor;
   }
 };

 colorToHex(rgb) {
   var _this = rgb;
   var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
   if (/^(rgb|RGB)/.test(_this)) {
     var aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
     var strHex = "#";
     for (var i = 0; i < aColor.length; i++) {
       var hex = Number(aColor[i]).toString(16);
       hex = hex.length < 2 ? 0 + '' + hex : hex;
       if (hex === "0") {
         hex += hex;
       }
       strHex += hex;
     }
     if (strHex.length !== 7) {
       strHex = _this;
     }

     return strHex;
   } else if (reg.test(_this)) {
     var aNum = _this.replace(/#/,"").split("");
     if (aNum.length === 6) {
       return _this;
     } else if (aNum.length === 3) {
       var numHex = "#";
       for (var i = 0; i < aNum.length; i+=1) {
         numHex += (aNum[i] + aNum[i]);
       }
       return numHex;
     }
   } else {
     return _this;
   }
 }

  renderSmall = async (w) => {
    w.setPadding(this.smallPadding, this.smallPadding, this.smallPadding, this.smallPadding);
    await this.smallHeader(w);
    const bodyStack = w.addStack();
    bodyStack.layoutVertically();
    if (this.widgetParam == "1"){
      this.textLayout(bodyStack, this.flow);
      bodyStack.addSpacer(7);
      this.textLayout(bodyStack, this.voice);
      bodyStack.addSpacer(7);
      this.textLayout(bodyStack, this.point);
    } else {
      const canvas = this.makeCanvas();
      const ringStack = bodyStack.addStack();
      this.imageCell(canvas, ringStack, this.flow);
      ringStack.addSpacer();
      this.imageCell(canvas, ringStack, this.voice);
    }
    return w;
  };

  renderMedium = async (w) => {
    w.setPadding(this.padding, this.padding, this.padding, this.padding);
    const canvas = this.makeCanvas();
    const bodyStack = w.addStack();
    await this.mediumCell(canvas, bodyStack, this.fee, '0A4B9D', true);
    bodyStack.addSpacer(this.padding);
    await this.mediumCell(canvas, bodyStack, this.flow, this.flowColorHex, false, true);
    bodyStack.addSpacer(this.padding);
    await this.mediumCell(canvas, bodyStack, this.voice, this.voiceColorHex, false,true);
    return w;
  };

  renderLarge = async (w) => {
    w.addText('暂不支持')
    return w;
  };

  renderWebView = async () => {
    const webView = new WebView();
    const url = 'https://e.189.cn/index.do';
    await webView.loadURL(url);
    await webView.present(false);

    const request = new Request(this.fetchUrl.detail);
    request.method = 'POST';
    const response = await request.loadJSON();
    console.log(response);
    if (response.result === -10001) {
      const index = await this.generateAlert('未获取到用户信息', [
        '取消',
        '重试',
      ]);
      if (index === 0) return;
      await this.renderWebView();
    } else {
      const cookies = request.response.cookies;
      let cookie = [];
      cookie = cookies.map((item) => `${item.name}=${item.value}`);
      cookie = cookie.join('; ');
      this.settings.cookie = cookie;
      this.saveSettings();
    }
  };

  Run() {
    if (config.runsInApp) {
      const widgetInitConfig = {cookie: 'china_telecom_cookie'};
      this.registerAction('颜色配置', async () => {
        await this.setAlertInput(
          `${this.name}颜色配置`,
          '进度条颜色|底圈颜色\n底圈颜色留空将跟随进度条颜色并淡显',
          {
            gradient: '是否开启渐变进度条，缺省：false',
            step1: '流量进度条颜色',
            step2: '语音进度条颜色',
            inner1: '流量进度条底圈颜色',
            inner2: '语音进度条底圈颜色',
          },
          );
      }, 'https://gitee.com/anker1209/image/raw/master/jd/colorSet.png');
      this.registerAction('尺寸设置', async () => {
        await this.setAlertInput(
          `${this.name}尺寸设置`,
          '进度条大小|文字大小',
          {
            logoScale: '小组件logo缩放，缺省：0.24',
            ringStackSize: '圆环大小，缺省：61',
            ringTextSize: '圆环中心文字大小，缺省：14',
            feeTextSize: '话费文字大小，缺省：21',
            textSize: '文字模式下文字大小，缺省：13',
            smallPadding: '小尺寸组件边距，缺省：16',
            padding: '中尺寸组件边距，缺省：10',
          },
          );
      }, 'https://gitee.com/anker1209/image/raw/master/jd/resize.png');
      this.registerAction('流量设置', async () => {
        await this.setAlertInput(
          `${this.name}流量设置`,
          '是否显示已用流量\n不限量或伪不限量用户可将此值设为true',
          {
            usedFlow: '是否显示已用流量，缺省：false',
            maxFlow: '实际流量或超限流量(GB)，缺省：40',
          },
          );
      }, 'https://gitee.com/anker1209/image/raw/master/jd/flow.png');
      this.registerAction("账号设置", async () => {
        const index = await this.generateAlert("设置账号信息", [
          "网站登录",
          "手动输入",
        ]);
        if (index === 0) {
          await this.renderWebView();
        } else {
          await this.setAlertInput("账号设置", "中国电信 cookie", {
            cookie: 'cookie',
          });
        }
      }, 'https://gitee.com/anker1209/image/raw/master/jd/account.png');
      this.registerAction('代理缓存', async () => {
        await this.setCacheBoxJSData(widgetInitConfig);
      }, 'https://gitee.com/anker1209/image/raw/master/jd/boxjs.png');
      this.registerAction('基础设置', this.setWidgetConfig, 'https://gitee.com/anker1209/image/raw/master/jd/preferences.png');
    }

    try {
      const {
        cookie,
        step1,
        step2,
        inner1,
        inner2,
        logoScale,
        ringStackSize,
        ringTextSize,
        feeTextSize,
        textSize,
        smallPadding,
        padding,
        gradient,
        usedFlow,
        maxFlow,
      } = this.settings;
      this.cookie = cookie ? cookie : this.cookie;
      if (this.cookie) this.options.headers.cookie = this.cookie;
      this.gradient = gradient === 'true' ? true : this.gradient;
      this.usedFlow = usedFlow === 'true' ? true : this.usedFlow;
      this.flowColorHex = step1 ? step1 : this.flowColorHex;
      this.voiceColorHex = step2 ? step2 : this.voiceColorHex;
      this.flow.BGColor = inner1 ? new Color(inner1) : new Color(this.flowColorHex, 0.2);
      this.voice.BGColor = inner2 ? new Color(inner2) : new Color(this.voiceColorHex, 0.2);
      this.flow.FGColor = new Color(this.flowColorHex);
      this.voice.FGColor = new Color(this.voiceColorHex);

      this.flow.max = maxFlow ? parseFloat(maxFlow) : this.flow.max;
      this.logoScale = logoScale ? parseFloat(logoScale) : this.logoScale;
      this.ringStackSize = ringStackSize ? parseFloat(ringStackSize) : this.ringStackSize;
      this.ringTextSize = ringTextSize ? parseFloat(ringTextSize) : this.ringTextSize;
      this.feeTextSize = feeTextSize ? parseFloat(feeTextSize) : this.feeTextSize;
      this.textSize = textSize ? parseFloat(textSize) : this.textSize;
      this.smallPadding = smallPadding ? parseFloat(smallPadding) : this.smallPadding;
      this.padding = padding ? parseFloat(padding) : this.padding;

      if (this.gradient) {
        this.flow.colors = this.arrColor();
        this.voice.colors = this.arrColor();
        this.flow.BGColor = inner1 ? new Color(inner1) : new Color(this.flow.colors[1], 0.2);
        this.voice.BGColor = inner2 ? new Color(inner2) : new Color(this.voice.colors[1], 0.2);
        this.flow.FGColor = this.gradientColor(this.flow.colors, 360);
        this.voice.FGColor = this.gradientColor(this.voice.colors, 360);
        this.flowColorHex = this.flow.colors[1];
        this.voiceColorHex = this.voice.colors[1];
      }

    } catch (e) {
      console.log(e);
    }
  }

  async render() {
    await this.init();
    const widget = new ListWidget();
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === 'medium') {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

await Runing(Widget, args.widgetParameter, false);
