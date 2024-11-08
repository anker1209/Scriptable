/*
* Author: 2Ya&脑瓜
* Telegram: @anker1209
* Telegram group：https://t.me/Scriptable_CN
* Version: 1.2
* Update: 2024/11/08
* 电信cookie重写：https://raw.githubusercontent.com/dompling/Script/master/10000/index.js
*/

if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "中国电信";
    this.en = "ChinaTelecom_2021";
    this.logo =
      "https://raw.githubusercontent.com/anker1209/icon/main/zgdx-big.png";
    this.smallLogo =
      "https://raw.githubusercontent.com/anker1209/icon/main/zgdx.png";
    this.Run();
  }

  gradient = false;
  usedFlow = false;

  flowColorHex = "FF6620";
  voiceColorHex = "78C100";

  ringStackSize = 61;
  ringTextSize = 14;
  feeTextSize = 21;
  textSize = 13;
  smallPadding = 16;
  padding = 10;
  logoScale = 0.24;
  SCALE = 1;

  canvSize = 178;
  canvWidth = 18;
  canvRadius = 80;
  
  widgetStyle = '1';

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
    title: "剩余话费",
    icon: 'antenna.radiowaves.left.and.right',
    number: 0,
    iconColor: new Color('0C54D9'),
    unit: "元",
    en: "¥",
  };

  flow = {
    percent: 0,
    max: 40,
    title: "剩余流量",
    number: 0,
    unit: "MB",
    en: "MB",
    icon: "antenna.radiowaves.left.and.right",
    iconColor: new Color("00B86A"),
    FGColor: new Color(this.flowColorHex),
    BGColor: new Color(this.flowColorHex, 0.2),
    colors: [],
  };

  voice = {
    percent: 0,
    title: "剩余语音",
    number: 0,
    unit: "分钟",
    en: "MIN",
    icon: 'phone.badge.waveform.fill',
    iconColor: new Color("FE366D"),
    FGColor: new Color(this.voiceColorHex),
    BGColor: new Color(this.voiceColorHex, 0.2),
    colors: [],
  };

  point = {
    title: "更新时间",
    number: `${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`,
    unit: "",
    icon: "arrow.2.circlepath",
    iconColor: new Color("fc6d6d"),
  };

  fetchUrl = {
    login: "https://e.dlife.cn/index.do",
    detail: "https://e.dlife.cn/user/package_detail.do",
    balance: "https://e.dlife.cn/user/balance.do",
    bill: "https://e.dlife.cn/user/bill.do",
  };

  init = async () => {
    if (!this.settings.dataSource) {
      await this.getData();
    } else {
      Object.keys(this.settings.dataSource).forEach((key) => {
        this[key] = { ...this[key], ...this.settings.dataSource[key] };
      });
      this.getData();
    }
  };

  formatFlow(number) {
    const n = number / 1024;
    if (n < 1024) {
      return { count: n.toFixed(2), unit: "MB" };
    }
    return { count: (n / 1024).toFixed(2), unit: "GB" };
  }

  unlimitUser(flow) {
    const usedFlow = this.formatFlow(flow);
    this.flow.title = "已用流量";
    this.flow.number = usedFlow.count;
    this.flow.unit = usedFlow.unit;
    this.flow.en = usedFlow.unit;
    if (this.flow.unit === "GB") {
      this.flow.percent = (
        100 -
        (this.flow.number / (this.flow.max || 40)) * 100
      ).toFixed(2);
    } else {
      this.flow.percent = (
        100 -
        (this.flow.number / ((this.flow.max || 40) * 1024)) * 100
      ).toFixed(2);
    }
  }

  updateCookie = async (loginUrl) => {
    if (loginUrl) {
      const url = loginUrl.match(/(http.+)&sign/)?.[1] || loginUrl;
      const req = await new Request(url);
      await req.load();
      const cookie = req.response.headers["Set-Cookie"];
      if (cookie) {
        this.settings.cookie = cookie;
        this.saveSettings(false);
      }
    }
  };

  getData = async () => {
    if (!this.settings.china_telecom_url) {
      return this.notify(this.name, "请配置登录地址");
    }
    await this.updateCookie(this.settings.china_telecom_url);
    const detail = await this.http({
      url: this.fetchUrl.detail,
      headers: {
        Cookie: this.settings.cookie,
      },
    });

    let flows = {
        balanceAmount: 0,
        usageAmount: 0,
        ratableAmount: 0,
      },
      voice = {
        balanceAmount: 0,
        usageAmount: 0,
        ratableAmount: 0,
      };

    detail.items?.forEach((data) => {
      data.items.forEach((item) => {
        if (item.balanceAmount != "999999999999" && item.unitTypeId === "3") {
          Object.keys(flows).forEach((key) => {
            flows[key] += Number(item[key]);
          });
        }
        if (item.unitTypeId === "1") {
          Object.keys(voice).forEach((key) => {
            voice[key] += Number(item[key]);
          });
        }
      });
    });

    this.flow.percent = (
      (flows.balanceAmount / flows.ratableAmount) *
      100
    ).toFixed(2);
    const flow = this.formatFlow(flows.balanceAmount);
    this.flow.number = flow.count;
    this.flow.unit = flow.unit;
    this.flow.en = flow.unit;

    if (voice) {
      this.voice.percent = (
        (Number(voice.balanceAmount) / Number(voice.ratableAmount)) *
        100
      ).toFixed(2);

      this.voice.number = voice.balanceAmount;
    }

    const balance = await this.http({
      url: this.fetchUrl.balance,
      headers: {
        Cookie: this.settings.cookie,
      },
    });
    
    balance.totalBalanceAvailable = Number(balance.totalBalanceAvailable);

    this.fee.number = balance.totalBalanceAvailable / 100;

    this.settings.dataSource = {
      fee: {
        number: this.fee.number,
      },
      voice: {
        number: this.voice.number,
        percent: this.voice.percent,
      },
      flow: {
        en: this.flow.en,
        number: this.flow.number,
        unit: this.flow.unit,
        percent: this.flow.percent,
      },
    };
    this.saveSettings(false);
  };

  async header(stack) {
    const headerStack = stack.addStack();
    headerStack.addSpacer();
    const logo = headerStack.addImage(
      await this.$request.get(this.logo, "IMG")
    );
    logo.imageSize = new Size(455 * this.logoScale, 125 * this.logoScale);
    headerStack.addSpacer();
    stack.addSpacer();

    const feeStack = stack.addStack();
    feeStack.centerAlignContent();
    feeStack.addSpacer();
    const feeValue = feeStack.addText("¥" + `${this.fee.number}`);
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
    [title, number].map((t) => (t.textColor = this.widgetColor));
    [title, number].map((t) => (t.font = Font.systemFont(this.textSize)));
  }
  
  async small(stack, data, logo = false) {
    const bg = new LinearGradient();
    bg.locations = [0, 1];
    bg.endPoint = new Point(1, 0)
    bg.colors = [
    new Color(data.iconColor.hex, 0.1),
    new Color(data.iconColor.hex, 0.03)
    ];
    const rowStack = stack.addStack();
    rowStack.centerAlignContent();
    rowStack.setPadding(5, 8, 5, 8)
    rowStack.backgroundGradient = bg;
    rowStack.cornerRadius = 12;
    const leftStack = rowStack.addStack();
    leftStack.layoutVertically();
    const titleStack = leftStack.addStack();
    const title = titleStack.addText(data.title);
    const balanceStack = leftStack.addStack();
    const balance = balanceStack.addText(`${data.number} ${data.en}`);
    balance.font = Font.semiboldRoundedSystemFont(16 * this.SCALE);
    title.textOpacity = 0.5;
    title.font = Font.mediumSystemFont(11 * this.SCALE);
     ;[title, balance].map(t => t.textColor = data.iconColor);
    rowStack.addSpacer();
    let iconImage;
    if (logo) {
      const icon = await this.$request.get(this.smallLogo, 'IMG');
      iconImage = rowStack.addImage(icon);
    } else {
      const icon = SFSymbol.named(data.icon);
      icon.applyHeavyWeight();
      iconImage = rowStack.addImage(icon.image);
    };
    iconImage.imageSize = new Size(22 * this.SCALE, 22 * this.SCALE);
    iconImage.tintColor = data.iconColor;
  }

  async smallCell(stack, data, logo = false) {
    const bg = new LinearGradient();
    const padding = 6 * this.SCALE; 
    bg.locations = [0, 1];
    bg.endPoint = new Point(1, 0)
    bg.colors = [
    new Color(data.iconColor.hex, 0.03),
    new Color(data.iconColor.hex, 0.1)
    ];
    const rowStack = stack.addStack();
    rowStack.setPadding(4, 4, 4, 4)
    rowStack.backgroundGradient = bg;
    rowStack.cornerRadius = 12;
    const iconStack = rowStack.addStack();
    iconStack.backgroundColor = data.iconColor;
    iconStack.setPadding(padding, padding, padding, padding);
    iconStack.cornerRadius = 17 * this.SCALE;
    let iconImage;
    if (logo) {
      const icon = await this.$request.get(this.smallLogo, 'IMG');
      iconImage = iconStack.addImage(icon);
    } else {
      const icon = SFSymbol.named(data.icon);
      icon.applyHeavyWeight();
      iconImage = iconStack.addImage(icon.image);
    };
    iconImage.imageSize = new Size(22 * this.SCALE, 22 * this.SCALE);
    iconImage.tintColor = new Color('FFFFFF');
    rowStack.addSpacer(15);
    const rightStack = rowStack.addStack();
    rightStack.layoutVertically();
    const balanceStack = rightStack.addStack();
    const balance = balanceStack.addText(`${data.number} ${data.en}`);
    balance.centerAlignText();
    balance.font = Font.semiboldRoundedSystemFont(16 * this.SCALE);
    const titleStack = rightStack.addStack();
    const title = titleStack.addText(data.title);
    title.centerAlignText();
    rowStack.addSpacer();
    title.textOpacity = 0.5;
    title.font = Font.mediumSystemFont(11 * this.SCALE);
     ;[title, balance].map(t => t.textColor = data.iconColor);
  }

  async mediumCell(canvas, stack, data, color, fee = false, percent) {
    const bg = new LinearGradient();
    bg.locations = [0, 1];
    bg.colors = [new Color(color, 0.03), new Color(color, 0.1)];
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
      const updataIcon = SFSymbol.named("arrow.2.circlepath");
      updataIcon.applyHeavyWeight();
      const updateImg = updateStack.addImage(updataIcon.image);
      updateImg.tintColor = new Color(color, 0.6);
      updateImg.imageSize = new Size(10, 10);
      updateStack.addSpacer(3);
      const updateText = updateStack.addText(
        `${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`
      );
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
    [title, number].map((t) => (t.textColor = new Color(color)));
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
      const smallLogo = await this.$request.get(this.smallLogo, "IMG");
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
    iconElement.tintColor = this.gradient
      ? new Color(data.colors[1])
      : data.FGColor;
    iconElement.imageSize = new Size(12, 12);
    iconElement.imageOpacity = 0.7;
    rowIcon.addSpacer();

    stack.addSpacer(1);

    const rowNumber = stack.addStack();
    rowNumber.addSpacer();
    const number = rowNumber.addText(
      percent ? `${data.percent}` : `${data.number}`
    );
    number.font = percent
      ? Font.systemFont(this.ringTextSize - 2)
      : Font.mediumSystemFont(this.ringTextSize);
    rowNumber.addSpacer();

    const rowUnit = stack.addStack();
    rowUnit.addSpacer();
    const unit = rowUnit.addText(percent ? "%" : data.unit);
    unit.font = Font.boldSystemFont(8);
    unit.textOpacity = 0.5;
    rowUnit.addSpacer();

    if (percent) {
      if (this.gradient) {
        [unit, number].map((t) => (t.textColor = new Color(data.colors[1])));
      } else {
        [unit, number].map((t) => (t.textColor = data.FGColor));
      }
    } else {
      [unit, number].map((t) => (t.textColor = this.widgetColor));
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
    let bgr = new Rect(bgx, bgy, bgd, bgd);

    canvas.setStrokeColor(strokeColor);
    canvas.setLineWidth(this.canvWidth);
    canvas.strokeEllipse(bgr);

    for (let t = 0; t < deg; t++) {
      let rect_x =
        ctr.x + this.canvRadius * this.sinDeg(t) - this.canvWidth / 2;
      let rect_y =
        ctr.y - this.canvRadius * this.cosDeg(t) - this.canvWidth / 2;
      let rect_r = new Rect(rect_x, rect_y, this.canvWidth, this.canvWidth);

      canvas.setFillColor(this.gradient ? new Color(fillColor[t]) : fillColor);
      canvas.setStrokeColor(strokeColor);
      canvas.fillEllipse(rect_r);
    }
  }

  arrColor() {
    let colorArr = [
      ["#FFF000", "#E62490"],
      ["#FDEB71", "#F8D800"],
      ["#ABDCFF", "#0396FF"],
      ["#FEB692", "#EA5455"],
      ["#FEB692", "#EA5455"],
      ["#CE9FFC", "#7367F0"],
      ["#90F7EC", "#32CCBC"],
      ["#FFF6B7", "#F6416C"],
      ["#E2B0FF", "#9F44D3"],
      ["#F97794", "#F072B6"],
      ["#FCCF31", "#F55555"],
      ["#5EFCE8", "#736EFE"],
      ["#FAD7A1", "#E96D71"],
      ["#FFFF1C", "#00C3FF"],
      ["#FEC163", "#DE4313"],
      ["#F6CEEC", "#D939CD"],
      ["#FDD819", "#E80505"],
      ["#FFF3B0", "#CA26FF"],
      ["#2AFADF", "#4C83FF"],
      ["#EECDA3", "#EF629F"],
      ["#C2E59C", "#64B3F4"],
      ["#FFF886", "#F072B6"],
      ["#F5CBFF", "#C346C2"],
      ["#FFF720", "#3CD500"],
      ["#EE9AE5", "#5961F9"],
      ["#FFC371", "#FF5F6D"],
      ["#FFD3A5", "#FD6585"],
      ["#C2FFD8", "#465EFB"],
      ["#FFC600", "#FD6E6A"],
      ["#FFC600", "#FD6E6A"],
      ["#92FE9D", "#00C9FF"],
      ["#FFDDE1", "#EE9CA7"],
      ["#F0FF00", "#58CFFB"],
      ["#FFE985", "#FA742B"],
      ["#72EDF2", "#5151E5"],
      ["#F6D242", "#FF52E5"],
      ["#F9D423", "#FF4E50"],
      ["#3C8CE7", "#00EAFF"],
      ["#FCFF00", "#FFA8A8"],
      ["#FF96F9", "#C32BAC"],
      ["#D0E6A5", "#FFDD94"],
      ["#FFDD94", "#FA897B"],
      ["#FFCC4B", "#FF7D58"],
      ["#D0E6A5", "#86E3CE"],
      ["#F0D5B6", "#F16238"],
      ["#F8EC70", "#F9C708"],
      ["#C4E86B", "#00BCB4"],
      ["#FFC446", "#FA0874"],
      ["#E1EE32", "#FFB547"],
      ["#FFD804", "#2ACCC8"],
      ["#E9A6D2", "#E9037B"],
      ["#F8EC70", "#49E2F6"],
      ["#A2F8CD", "#A2F852"],
      ["#49E2F6", "#A2F8CD"],
      ["#FDEFE2", "#FE214F"],
      ["#F8EC70", "#A2F8CD"],
      ["#F8EC70", "#49E2F6"],
      ["#B7FFE4", "#E4B7FF"],
      ["#FFB7D1", "#E4B7FF"],
      ["#D0E6A5", "#86E3CE"],
      ["#E8E965", "#64C5C7"],
    ];
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
    for (var i = 0; i < step; i++) {
      var hex = this.colorToHex(
        "rgb(" +
          parseInt(sR * i + startR) +
          "," +
          parseInt(sG * i + startG) +
          "," +
          parseInt(sB * i + startB) +
          ")"
      );
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
  }

  colorToHex(rgb) {
    var _this = rgb;
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(_this)) {
      var aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      var strHex = "#";
      for (var i = 0; i < aColor.length; i++) {
        var hex = Number(aColor[i]).toString(16);
        hex = hex.length < 2 ? 0 + "" + hex : hex;
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
      var aNum = _this.replace(/#/, "").split("");
      if (aNum.length === 6) {
        return _this;
      } else if (aNum.length === 3) {
        var numHex = "#";
        for (var i = 0; i < aNum.length; i += 1) {
          numHex += aNum[i] + aNum[i];
        }
        return numHex;
      }
    } else {
      return _this;
    }
  }

  renderSmall = async (w) => {
    w.setPadding(this.smallPadding, this.smallPadding, this.smallPadding, this.smallPadding);
    if (this.widgetStyle == "1"){
      const bodyStack = w.addStack();
      bodyStack.layoutVertically();
      await this.small(bodyStack, this.fee, true);
      bodyStack.addSpacer();
      await this.small(bodyStack, this.flow);
      bodyStack.addSpacer();
      await this.small(bodyStack, this.voice);
    } else if (this.widgetStyle == "2"){
      const bodyStack = w.addStack();
      bodyStack.layoutVertically();
      await this.smallCell(bodyStack, this.fee, true);
      bodyStack.addSpacer();
      await this.smallCell(bodyStack, this.flow);
      bodyStack.addSpacer();
      await this.smallCell(bodyStack, this.voice);
    } else if (this.widgetStyle == "3"){
      await this.header(w);
      const bodyStack = w.addStack();
      bodyStack.layoutVertically();
      const canvas = this.makeCanvas();
      const ringStack = bodyStack.addStack();
      this.imageCell(canvas, ringStack, this.flow);
      ringStack.addSpacer();
      this.imageCell(canvas, ringStack, this.voice);
    } else {
      await this.header(w);
      const bodyStack = w.addStack();
      bodyStack.layoutVertically();
      this.textLayout(bodyStack, this.flow);
      bodyStack.addSpacer(7);
      this.textLayout(bodyStack, this.voice);
      bodyStack.addSpacer(7);
      this.textLayout(bodyStack, this.point);
    }
    return w;
  };

  renderMedium = async (w) => {
    w.setPadding(this.padding, this.padding, this.padding, this.padding);
    const canvas = this.makeCanvas();
    const bodyStack = w.addStack();
    await this.mediumCell(canvas, bodyStack, this.fee, "0A4B9D", true);
    bodyStack.addSpacer(this.padding);
    await this.mediumCell(
      canvas,
      bodyStack,
      this.flow,
      this.flowColorHex,
      false,
      true
    );
    bodyStack.addSpacer(this.padding);
    await this.mediumCell(
      canvas,
      bodyStack,
      this.voice,
      this.voiceColorHex,
      false,
      true
    );
    return w;
  };

  renderWebView = async () => {
    const webView = new WebView();
    const url = this.fetchUrl.login;
    await webView.loadURL(url);
    await webView.present(false);
  };
  
  setColorConfig = async () => {
    return this.renderAppView([
      {
        title: '颜色设置',
        menu: [
          {
            icon: { name: 'circle.dotted', color: '#FF6428' },
            type: 'switch',
            title: '渐变进度条',
            desc: '',
            val: 'gradient',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'antenna.radiowaves.left.and.right.circle', color: '#448EF7' },
            type: 'color',
            title: '流量进度条',
            desc: '',
            val: 'step1',
          },
          {
            icon: { name: 'phone.circle', color: '#ff8021' },
            type: 'color',
            title: '语音进度条',
            desc: '',
            val: 'step2',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'circle.dashed', color: '#1ab6f8' },
            type: 'color',
            title: '流量进度条底圈颜色',
            desc: '',
            val: 'inner1',
          },
          {
            icon: { name: 'pencil.tip.crop.circle', color: '#30d15b' },
            type: 'color',
            title: '语音进度条底圈颜色',
            desc: '',
            val: 'inner2',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'apple.logo', color: '#F86527' },
            type: 'color',
            title: 'LOGO图标颜色',
            desc: '',
            val: 'logoColor',
          },
          {
            icon: { name: 'antenna.radiowaves.left.and.right', color: '#1ab6f8' },
            type: 'color',
            title: '流量图标颜色',
            desc: '',
            val: 'flowIconColor',
          },
          {
            icon: { name: 'phone.fill', color: '#30d15b' },
            type: 'color',
            title: '语音图标颜色',
            desc: '',
            val: 'voiceIconColor',
          },
        ],
      },
      {
        title: '重置颜色',
        menu: [
          {
            icon: { name: 'arrow.circlepath', color: '#FF6250' },
            title: '重置颜色',
            desc: '重置当前颜色配置',
            name: 'reset',
            val: 'reset',
            onClick: () => {
              const propertiesToDelete = ['gradient', 'step1', 'step2', 'inner1', 'inner2', 'logoColor', 'flowIconColor', 'voiceIconColor'];
              propertiesToDelete.forEach(prop => {
                delete this.settings[prop];
              });
              this.saveSettings();
              this.reopenScript();
            },
          },
        ],
      },
    ]).catch((e) => {
      console.log(e);
    });
  };
  
  setSizeConfig = async () => {
    return this.renderAppView([
      {
        title: '尺寸设置',
        menu: [
          {
            icon: { name: 'square.resize.down', color: '#FF6428' },
            type: 'input',
            title: '小组件缩放比例',
            desc: '',
            placeholder : '1',
            val: 'SCALE',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'circle', color: '#448EF7' },
            type: 'input',
            title: '圆环大小',
            placeholder : '61',
            desc: '',
            val: 'ringStackSize',
          },
          {
            icon: { name: 'textformat.size', color: '#5ABFC1' },
            type: 'input',
            title: '圆环中心文字大小',
            placeholder : '14',
            desc: '',
            val: 'ringTextSize',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'textformat.size.larger.zh', color: '#ff8021' },
            type: 'input',
            title: '话费文字大小',
            placeholder : '21',
            desc: '',
            val: 'feeTextSize',
          },
          {
            icon: { name: 'textformat.size.smaller.zh', color: '#7BCD81' },
            type: 'input',
            title: '文字模式下文字大小',
            placeholder : '13',
            desc: '',
            val: 'textSize',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'dock.arrow.down.rectangle', color: '#4676EE' },
            type: 'input',
            title: '小尺寸组件边距',
            placeholder : '15',
            desc: '',
            val: 'smallPadding',
          },
          {
            icon: { name: 'rectangle.lefthalf.inset.fill.arrow.left', color: '#7DD35F' },
            type: 'input',
            title: '中尺寸组件边距',
            placeholder : '10',
            desc: '',
            val: 'padding',
          },
        ],
      },
      {
        title: '重置尺寸',
        menu: [
          {
            icon: { name: 'arrow.circlepath', color: '#FF6250' },
            title: '重置尺寸',
            desc: '重置当前尺寸配置',
            name: 'reset',
            val: 'reset',
            onClick: () => {
              const propertiesToDelete = ['SCALE', 'ringStackSize', 'ringTextSize', 'feeTextSize', 'textSize', 'smallPadding', 'padding', ];
              propertiesToDelete.forEach(prop => {
                delete this.settings[prop];
              });
              this.saveSettings();
              this.reopenScript();
            },
          },
        ],
      },
    ]).catch((e) => {
      console.log(e);
    });
  };

  Run() {
    if (config.runsInApp) {
      const widgetInitConfig = {
        china_telecom_url: "@yy_10000.china_telecom_loginUrl",
      };
      this.registerAction({
        title: '组件配置',
        menu: [
          {
            icon: { name: 'square.text.square', color: '#FF5D29' },
            type: 'select',
            title: '组件样式',
            options: ['1', '2', '3', '4'],
            val: 'widgetStyle',
          },
        ],
      });
      /*
      this.registerAction({
        menu: [
          {
            icon: { name: 'antenna.radiowaves.left.and.right', color: '#1ab6f8' },
            type: 'switch',
            title: '已用流量',
            desc: '',
            val: 'usedFlow',
          },
          {
            icon: { name: 'phone.fill', color: '#30d15b' },
            type: 'input',
            title: '实际流量',
            placeholder: '40',
            desc: '单位GB\n此项及已用流量开关适用于不限量用户及伪不限量用户',
            val: 'maxFlow',
          },
        ],
      })
      */
      this.registerAction({
        title: '',
        menu: [
          {
            name: 'color',
            url: 'https://pic1.imgdb.cn/item/63315c1e16f2c2beb1a27363.png',
            title: '颜色配置',
            type: 'input',
            onClick: () => {
              return this.setColorConfig();
            },
          },
          {
            name: 'size',
            icon: { name: 'arrow.down.backward.and.arrow.up.forward.square', color: '#F77F29' },
            title: '尺寸设置',
            type: 'input',
            onClick: () => {
              return this.setSizeConfig();
            },
          },
        ],
      });
      this.registerAction({
        title: '',
        menu: [
          {
            name: 'login',
            icon: { name: 'link.badge.plus', color: '#6CCA16' },
            title: '网站登录',
            type: 'input',
            onClick: async () => {
                return this.renderWebView();
            },
          },
          {
            name: 'boxjs',
            url: 'https://raw.githubusercontent.com/githubdulong/Script/master/Images/boxjs.png',
            title: '登录地址',
            type: 'input',
            onClick: async () => {
              const index = await this.generateAlert("设置账号信息", [
                "BoxJS",
                "手动输入",
              ]);
              if (index === 0) {
                await this.setCacheBoxJSData(widgetInitConfig);
              } else {
                await this.setAlertInput("登录地址", "中国电信", widgetInitConfig);
              }
            },
          },
        ],
      });
      this.registerAction({
        title: '',
        menu: [
          {
            name: 'basic',
            icon: { name: 'gearshape.fill', color: '#FF5656' },
            title: '基础设置',
            type: 'input',
            onClick: () => {
              return this.setWidgetConfig();
            },
          },
          {
            name: 'reload',
            icon: { name: 'goforward', color: '#45C4B0' },
            title: '重载组件',
            type: 'input',
            onClick: () => {
              this.reopenScript();
            },
          },
        ],
      });
    };

    try {
      const {
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
        widgetStyle,
        SCALE,
      } = this.settings;

      this.gradient = gradient === "true" ? true : this.gradient;
      this.usedFlow = usedFlow === "true" ? true : this.usedFlow;
      this.flowColorHex = step1 ? step1 : this.flowColorHex;
      this.voiceColorHex = step2 ? step2 : this.voiceColorHex;
      this.flow.BGColor = inner1 ? new Color(inner1) : new Color(this.flowColorHex, 0.2);
      this.voice.BGColor = inner2 ? new Color(inner2) : new Color(this.voiceColorHex, 0.2);
      this.flow.FGColor = new Color(this.flowColorHex);
      this.voice.FGColor = new Color(this.voiceColorHex);
      this.widgetStyle = widgetStyle || this.widgetStyle;

      this.flow.max = maxFlow ? parseFloat(maxFlow) : this.flow.max;
      this.SCALE = SCALE ? parseFloat(SCALE) : this.SCALE;
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
    if (this.widgetFamily === "medium") {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === "large") {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

await Runing(Widget, args.widgetParameter, false);
