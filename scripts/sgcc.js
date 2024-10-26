// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: bolt;
/*
 * Author: 脑瓜
 * Telegram: @anker1209
 * Telegram group: https://t.me/+ViT7uEUrIUV0B_iy 
 * version: 1.0.0
 * update: 2024/10/26
 * 使用该脚本需DmYY依赖及添加重写: https://raw.githubusercontent.com/dompling/Script/master/wsgw/index.js
*/

if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '网上国网';
    this.en = 'wsgw_ng';
    this.index = 0;
    this.data = null;
    this.Run();
  };

  fm = FileManager.local();
  CACHE_FOLDER = Script.name();
  cachePath = null;

  isOverdue = false;
  balance = 0;
  monthUsage = 0;
  monthFee = 0;
  yearUsage = 0;
  yearFee = 0;
  dayFee = 0;
  SCALE = 1;
  update = Date.now();
  
  Billdata = {};
  dayElePq = [];
  monthElePq = [];
  
  size = {
    logo : 48,
    leftStack : 130,
    smallFont : 12,
    bigFont : 18,
    balance : 20,
    subSpacer : 6.5,
  }
  
  wsgw = {
    step_2 : 2520,
    step_3 : 4800,
    interval : 360,
  }

  makeCanvas(w, h) {
    const drawing = new DrawContext();
    drawing.opaque = false;
    drawing.respectScreenScale = true;
    drawing.size = new Size(w, h);
    return drawing;
  };

  formatDate() {
    let date = new Date(this.update);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    let hours = ("0" + date.getHours()).slice(-2);
    let minutes = ("0" + date.getMinutes()).slice(-2);
    let formatDate = month + "-" + day + " " + hours  + ":" + minutes;
    return formatDate;
  };
  //  显示单元
  setRow(stack, key) {
    const itemStack = stack.addStack();
    switch (key) {
      case '组合一' :
      this.stackModule(itemStack, this.settings.group1Left || '上期电费');
      itemStack.addSpacer();
      this.stackModule(itemStack, this.settings.group1Right || '上期电量', true);
      break;
      case '组合二' :
      this.stackModule(itemStack, this.settings.group2Left || '年度电费');
      itemStack.addSpacer();
      this.stackModule(itemStack, this.settings.group2Right || '年度电量', true);
      break;
      case '阶梯电量':
      this.addStack(itemStack, "阶梯电量", this.step());
      default:
      return;
    }
  }
  //  
  stackModule(stack, key, right = false){
    const bodyStack = stack.addStack();
    bodyStack.layoutVertically();
    const h = this.size.smallFont + this.size.bigFont + 3;
    const scale = h / 50;
    switch (key) {
      case '上期电费' :
      this.stackContent(bodyStack, '上期电费', `${this.monthFee}`, true, right);
      break;
      case '上期电量' :
      this.stackContent(bodyStack, '上期电量', `${this.monthUsage}`,false, right);
      break;
      case '年度电费':
      this.stackContent(bodyStack, '年度电费', `${this.yearFee}`, true, right);
      break;
      case '年度电量':
      this.stackContent(bodyStack, '年度电量', `${this.yearUsage}`, false, right);
      break;
      case '近日电费':
      const arr = this.dayElePq.map((item) => item.value).reverse();
      this.dayFee = arr[arr.length - 1];
      this.stackContent(bodyStack, '近日电费', `${this.dayFee}`, true, right);
      break;
      case '日用电图表':
      const dayOpt = this.dayElePq.map((item) => item.value).reverse();
      const dayChart = bodyStack.addImage(this.chart(dayOpt, 5));
      dayChart.imageSize = new Size(80 * scale, 50 * scale);
      break;
      case '月用电图表':
      const monthAmount = parseFloat(this.settings.monthAmount);
      const monthOpt = this.monthElePq.map((item) => item.cost);
      const monthChart = bodyStack.addImage(this.chart(monthOpt, monthAmount));
      monthChart.imageSize = new Size((monthAmount * 18 - 10) * scale, 50 * scale);
      break;
      case '不显示':
      return;
      default:
      return;
    }

  }
  //  
  addStack(stack, leftText, rightText) {
    stack.layoutVertically();
    const textStack = stack.addStack();
    const leftTitle = textStack.addText(leftText);
    textStack.addSpacer();
    const rightTitle = textStack.addText(rightText);

    stack.addSpacer(4);
    stack.addImage(this.bar());

    ;[leftTitle, rightTitle].map(t => {
      t.textColor = this.widgetColor;
      t.font = Font.semiboldSystemFont(this.size.smallFont);
      t.textOpacity = 0.5
      });
  };
  
  //  
  stackContent(stack, upText, downText, fee = false, right = false) {
    const titleStack = stack.addStack();
    if (right) titleStack.addSpacer();
    const smallText = titleStack.addText(upText);
    const valueStack = stack.addStack();
    if (right) valueStack.addSpacer();
    const bigText = valueStack.addText(downText);
    fee ? this.unit(valueStack, "元", this.size.subSpacer) : this.unit(valueStack, "度", this.size.subSpacer);
    smallText.textColor = this.widgetColor;
    smallText.font = Font.semiboldSystemFont(this.size.smallFont);
    smallText.textOpacity = 0.5;
    bigText.textColor = this.widgetColor;
    bigText.font = Font.mediumRoundedSystemFont(this.size.bigFont)
  }
  //  单位
  unit(stack, text, spacer) {
    stack.addSpacer(1);
    const unitStack = stack.addStack();
    unitStack.layoutVertically();
    unitStack.addSpacer(this.size.subSpacer);
    const unitTitle = unitStack.addText(text);
    unitTitle.font = Font.semiboldRoundedSystemFont(10 * this.SCALE);
    unitTitle.textColor = this.widgetColor;
  };
  //  分栏
  split(stack, width, height, ver = false) {
    const splitStack = stack.addStack();
    splitStack.size = new Size(width, height);
    if (ver) splitStack.layoutVertically();
    splitStack.addSpacer();
    splitStack.backgroundColor = Color.dynamic(new Color("#B6B5BA"), new Color("#414144"));
  };
  // 阶梯电价
  step() {
    let step = "";
    if (this.yearUsage < (this.wsgw.step_2 && this.wsgw.step_3)) {
      step = "1档·" + (this.yearUsage / this.wsgw.step_2 * 100).toFixed(2) + "%"
    } else if (this.yearUsage > this.wsgw.step_3) {
      step = "3档·抢钱了"
    } else {
      step = "2档·" + (this.yearUsage / this.wsgw.step_3 * 100).toFixed(2) + "%"
    }
    return step;
  }
  //
  fillRect(drawing, x, y, width, height, cornerradio, color) {
    let path = new Path();
    let rect = new Rect(x, y, width, height);
    path.addRoundedRect(rect, cornerradio, cornerradio);
    drawing.addPath(path);
    drawing.setFillColor(color);
    drawing.fillPath();
  };
  //
  drawLine(drawing, x1, y1, x2, y2, color, width) {
    const path = new Path();
    path.move(new Point(Math.round(x1),Math.round(y1)));
    path.addLine(new Point(Math.round(x2),Math.round(y2)));
    
    drawing.addPath(path);
    drawing.setStrokeColor(color);
    drawing.setLineWidth(width);
    drawing.strokePath();
  };
  //  进度条
  bar() {
    const drawing = this.makeCanvas(200, 20);
    const progress = this.yearUsage / this.wsgw.step_3 * 200;
    const circle = this.yearUsage / this.wsgw.step_3 * 200 - 12;
    this.drawLine(drawing, 3, 20, 3, 0, new Color(this.settings.barColor || '#0db38e', 0.3), 2);
    this.drawLine(drawing, 197, 20, 197, 0, new Color(this.settings.barColor || '#0db38e', 0.3), 2);
    this.drawLine(drawing, this.wsgw.step_2 / this.wsgw.step_3 * 200, 20, this.wsgw.step_2 / this.wsgw.step_3 * 200, 0, new Color(this.settings.barColor || '#0db38e', 0.3), 2);
    this.fillRect(drawing, 0, 7, 200, 6, 3, new Color(this.settings.barColor || '#0db38e', 0.3));
    this.fillRect(drawing, 0, 7, progress > 200? 200 : progress, 6, 3, new Color(this.settings.barColor || '#0db38e', 1));
    this.fillRect(drawing, circle > 188? 188 : circle, 4, 12, 12, 6, new Color(this.settings.pointerColor || '#0db38e', 1));
    return drawing.getImage();
  }
  //
  smallStackBar() {
    const width = 200;
    const height = 42;
    const progress = this.yearUsage / this.wsgw.step_3 * width;
    const drawing = this.makeCanvas(width, height);
    this.drawLine(drawing, this.wsgw.step_2 / this.wsgw.step_3 * width, height, this.wsgw.step_2 / this.wsgw.step_3 * width, 0, new Color(this.settings.smallStackColor || '#0db38e', 0.3), 2);
    this.fillRect(drawing, 0, 0, width, height, 6, new Color(this.settings.smallStackColor || '#0db38e', 0.3));
    this.fillRect(drawing, 0, 0, progress > width? width : progress, height, 6, new Color(this.settings.smallStackColor || '#0db38e', 1));
    return drawing.getImage();
  }
  //  图表
  chart (opt, n) {
    let chartColor = new Color(this.settings.chartColor || '#0db38e', 1);
    const drawing = this.makeCanvas(n * 18 - 10, 50);
    let data = opt;
    console.log(data)
    if (data.length > n) {
      let arr = data.splice(0, data.length - n);
      console.log(data)
    }
    var max;
	  for (i = 0; i < n; i++) {
      let	temp = data[i];
		  max = (temp > max || max == undefined ? temp : max);
	  }
    if (data.length < n) {
      let newArr = new Array(n - data.length).fill(max);
      data = [...data, ...newArr]
    };
    const deltaY = 50 / max;
    for (var i = 0; i < n; i++) {
      let	temp = data[i] * deltaY;
      if (i + 1  > opt.length) {
        chartColor = new Color(this.settings.chartColor || '#0db38e', 0.3);
      };
      this.fillRect(drawing, i * 18, 50 - temp, 8, temp, 4, chartColor)
    }
    return drawing.getImage();
  }
  //  小组件
  renderSmall = async (w) => {
    w.setPadding(15, 15, 15, 15);
    const bodyStack = w.addStack();
    const smallColor = new      Color(this.settings.smallStackColor || '#0db38e');
    bodyStack.layoutVertically();
    const nameStack = bodyStack.addStack();
    const iconSFS = SFSymbol.named('house.fill');
    iconSFS.applyHeavyWeight();
    let icon = nameStack.addImage(iconSFS.image);
    icon.imageSize = new Size(20, 20);
    icon.tintColor = smallColor;
    nameStack.addSpacer(2);
    let name = nameStack.addText(this.settings.name || '国家电网');
    name.font = Font.mediumSystemFont(16.5);
    name.textColor = smallColor;
    nameStack.addSpacer();
    
    bodyStack.addSpacer();
    
    bodyStack.addImage(this.smallStackBar());
    const yearStack = bodyStack.addStack();
    const yearFee = yearStack.addText(`${this.yearUsage}`);
    
    yearStack.addSpacer();
    const yearUsage = yearStack.addText(`¥ ${this.yearFee}`);
    ;[yearFee, yearUsage].map(t => {
      t.textColor = smallColor;
      t.font = Font.regularRoundedSystemFont(15 * this.SCALE);
    });
    
    bodyStack.addSpacer();
    
    const lastRow = bodyStack.addStack();
    const titleStack = lastRow.addStack();
    titleStack.layoutVertically();
    
    const smallText = titleStack.addText(this.isOverdue ? "欠费" : "余额");
    const valueStack = titleStack.addStack();
    const bigText = valueStack.addText(this.balance);
    valueStack.addSpacer(1);
    const unitStack = valueStack.addStack();
    unitStack.layoutVertically();
    unitStack.addSpacer(8.5);
    const unitTitle = unitStack.addText('元');
    unitTitle.font = Font.semiboldRoundedSystemFont(10);
    unitTitle.textColor = smallColor;
    unitTitle.textOpacity = 0.5;
    smallText.textColor = smallColor;
    smallText.font = Font.semiboldSystemFont(14 * this.SCALE);
    smallText.textOpacity = 0.5;
    bigText.textColor = smallColor;
    bigText.font = Font.semiboldRoundedSystemFont(20 * this.SCALE);
    
    lastRow.addSpacer();
    var logo;
    if (this.settings.logoImg ==='铁塔' || !this.settings.logoImg || !this.settings.customizeUrl) {
      logo = await this.getImageByUrl('https://raw.githubusercontent.com/anker1209/icon/main/gjdw2.png', 'tower.png');
    } else {
      logo = await this.getImageByUrl(this.settings.customizeUrl, 'customize.png');
    };
    let wsgw = lastRow.addImage(logo);
    wsgw.tintColor = smallColor;
    wsgw.imageSize = new Size(36 * this.SCALE, 36 * this.SCALE);
    return w;
  }
  //  中组件
  renderMedium = async (w) => {
    w.setPadding(0, 0, 0, 0);
    w.backgroundColor = Color.dynamic(new Color(this.settings.rightDayColor || "#E2E2E7"), new Color(this.settings.rightNightColor || "#2C2C2F"));
    const bodyStack = w.addStack();
    bodyStack.layoutHorizontally();
    //  左侧stack
    const leftStack = bodyStack.addStack();
    leftStack.layoutVertically();
    leftStack.setPadding(0, 15, 0, 15);
    leftStack.size = new Size(this.size.leftStack, 0);
    leftStack.backgroundColor = Color.dynamic(new Color(this.settings.leftDayColor || "#F2F2F7"), new Color(this.settings.leftNightColor || "#1C1C1E"));
    leftStack.addSpacer();
    //  LOGO
    const logoStack = leftStack.addStack();
    logoStack.addSpacer();
    var logo;
    if (this.settings.logoImg ==='铁塔') {
      logo = await this.getImageByUrl('https://raw.githubusercontent.com/anker1209/icon/main/gjdw2.png', 'tower.png');
    } else if (this.settings.logoImg ==='国家电网' || !this.settings.logoImg || !this.settings.customizeUrl) {
      logo = await this.getImageByUrl('https://raw.githubusercontent.com/anker1209/icon/main/gjdw.png', 'wsgw.png');
    } else {
      logo = await this.getImageByUrl(this.settings.customizeUrl, 'customize.png');
    };
    let wsgw = logoStack.addImage(logo);
    wsgw.imageSize = new Size(this.size.logo, this.size.logo);
    logoStack.addSpacer();
    
    leftStack.addSpacer();
    //  更新时间
    const updateStack = leftStack.addStack();
    updateStack.addSpacer();
    updateStack.centerAlignContent();
    const updataIcon = SFSymbol.named('arrow.2.circlepath');
    updataIcon.applyHeavyWeight();
    const updateImg = updateStack.addImage(updataIcon.image);
    updateImg.tintColor = new Color("#2F6E6B", 0.5);
    updateImg.imageSize = new Size(10, 10);
    updateStack.addSpacer(3);
    const updateText = updateStack.addText(this.formatDate());
    updateText.font = Font.mediumSystemFont(10);
    updateText.textColor = new Color("#2F6E6B", 0.5);
    updateStack.addSpacer();
    
    leftStack.addSpacer(2);
    //  左侧底部Stack
    const lbStack = leftStack.addStack();
    lbStack.layoutVertically();
    lbStack.cornerRadius = 10;
    lbStack.backgroundColor = Color.dynamic(new Color(this.settings.rightDayColor || "#E2E2E7"), new Color(this.settings.rightNightColor || "#2C2C2F"));
    
    lbStack.addSpacer(8 * this.SCALE);
    //  余额Stack
    const balanceStack = lbStack.addStack();
    balanceStack.centerAlignContent();
    balanceStack.addSpacer();
    const balance = balanceStack.addText((+this.balance).toFixed(2));
    balance.font = Font.semiboldRoundedSystemFont(this.size.balance);
    balance.lineLimit = 1;
    balance.textColor = this.widgetColor;
    this.unit(balanceStack, "元", 5 * this.SCALE);
    balanceStack.addSpacer();

    lbStack.addSpacer(3 * this.SCALE);
    //  余额标题Stack
    const balanceTitleStack = lbStack.addStack();
    balanceStack.url = "com.wsgw.e.zsdl://platformapi/";
    balanceTitleStack.addSpacer();
    const balanceTitle = balanceTitleStack.addText(this.isOverdue ? "电费欠费" : "电费余额");
    balanceTitleStack.addSpacer();
    
    lbStack.addSpacer(8 * this.SCALE);

    leftStack.addSpacer(15);
    this.split(bodyStack, 0.2, 0, true);
    
    // 右侧widget
    const rightStack = bodyStack.addStack();
    rightStack.setPadding(15, 15, 15, 15);
    rightStack.layoutVertically();
    
    // 右侧子widget
    this.settings.firstRow ? this.setRow(rightStack, this.settings.firstRow) : this.setRow(rightStack, '组合一')
    
    rightStack.addSpacer();
    this.split(rightStack, 0, 0.5);
    rightStack.addSpacer();
    
    this.settings.secondRow ? this.setRow(rightStack, this.settings.secondRow) : this.setRow(rightStack, '组合二')
    
    rightStack.addSpacer();
    this.split(rightStack, 0, 0.5);
    rightStack.addSpacer();
    
    this.settings.thirdRow ? this.setRow(rightStack, this.settings.thirdRow) : this.setRow(rightStack, '阶梯电量')
    
    // 字体样式
    balanceTitle.textColor = this.widgetColor;
    balanceTitle.font = Font.semiboldSystemFont(this.size.smallFont);
    balanceTitle.textOpacity = 0.5;

    return w;
  };

  httpRequest = async(dataName, url, json = true, options, key, method = 'GET') => {
    let cacheKey = key;
    let localCache = this.loadStringCache(cacheKey);
    const lastCacheTime = this.getCacheModificationDate(cacheKey);
    const timeInterval = Math.floor((this.getCurrentTimeStamp() - lastCacheTime) / 60);
    
    console.log(`${dataName}：缓存${timeInterval}分钟前，有效期${this.wsgw.interval}分钟，${localCache.length}`);

    if (timeInterval < this.wsgw.interval && localCache != null && localCache.length > 0) {
      console.log(`${dataName}：读取缓存`);
      return json ? JSON.parse(localCache) : localCache;
    }

    let data = null;
    try {
      console.log(`${dataName}：在线请求`);
      let req = new Request(url);
      req.method = method;
      Object.keys(options).forEach((key) => {
        req[key] = options[key];
      });
      data = await (json ? req.loadJSON() : req.loadString());
      this.saveStringCache(cacheKey, json ? JSON.stringify(data) : data)
    } catch (e) {
      console.error(`${dataName}：请求失败：${e}`);
    }

    localCache = this.loadStringCache(cacheKey);

    if (!data && localCache != null && localCache.length > 0) {
      console.log(`${dataName}：获取失败，读取缓存`);
      return json ? JSON.parse(localCache) : localCache;
    }

      console.log(`${dataName}：在线请求响应数据：${JSON.stringify(data)}`);
    
    return data;
  }

  loadStringCache(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    let cacheString = '';
    if (fileExists) {
      cacheString = this.fm.readString(cacheFile);
    }
    return cacheString;
  }

  saveStringCache(cacheKey, content) {
    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath, true);
    };
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    this.fm.writeString(cacheFile, content);
  }

  getCacheModificationDate(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    if (fileExists) {
      return this.fm.modificationDate(cacheFile).getTime() / 1000;
    } else {
      return 0;
    }
  }

  getCurrentTimeStamp() {
    return new Date().getTime() / 1000;
  }

  getImageByUrl = async(url, cacheKey) => {
    const cacheImg = this.loadImgCache(cacheKey);
    if (cacheImg != undefined && cacheImg != null) {
      console.log(`使用缓存：${cacheKey}`);
      return this.loadImgCache(cacheKey);
    }

    try {
      console.log(`在线请求：${cacheKey}`);
      const req = new Request(url);
      const imgData = await req.load();
      const img = Image.fromData(imgData);
      this.saveImgCache(cacheKey, img);
      return img;
    } catch (e) {
      console.error(`图片加载失败：${e}`);
      let cacheImg = this.loadImgCache(cacheKey);
      if (cacheImg != undefined) {
        console.log(`使用缓存图片：${cacheKey}`);
        return cacheImg;
      }
      console.log(`使用预设图片`);
      let ctx = new DrawContext();
      ctx.size = new Size(80, 80);
      ctx.setFillColor(Color.darkGray());
      ctx.fillRect(new Rect(0, 0, 80, 80));
      return await ctx.getImage();
    }
  }

  saveImgCache(cacheKey, img) {
    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath, true);
    };
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    this.fm.writeImage(cacheFile, img);
  }

  loadImgCache(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    let img = undefined;
    if (fileExists) {
      if (this.settings.useICloud ==='true') this.fm.downloadFileFromiCloud(this.cachePath);
      img = Image.fromFile(cacheFile);
    }
    return img;
  }

  async getData() {
    this.updateIndex();
    
    return this.data?.[this.index];
  }

  updateIndex() {
    const i = args.widgetParameter;
    if (!i) return;
    if (!this.data[i]) throw new Error("户号不存在");
    this.index = i;
  }

  last = (data = [], index = 1) => {
    return data[data.length - index];
  };

  getBillData = async () => {
    const dataName = '国网数据';
    const url = 'http://api.wsgw-rewrite.com/electricity/bill/all';
    const options = {};
    try {
      this.data = await this.httpRequest(dataName, url, true, options, 'BillData.json');
      if (!this.data)  throw new Error("请求失败,请安装模块 检查boxjs配置");
      const billData = await this.getData();
      this.isOverdue = billData.arrearsOfFees;
      this.balance = billData.eleBill.sumMoney;
      this.monthUsage = parseFloat(this.last(billData.monthElecQuantity.mothEleList).monthEleNum);
      this.monthFee = parseFloat(this.last(billData.monthElecQuantity.mothEleList).monthEleCost).toFixed(2);
      this.yearUsage = parseFloat(billData.monthElecQuantity.dataInfo.totalEleNum);
      this.yearFee = parseFloat(billData.monthElecQuantity.dataInfo.totalEleCost).toFixed(2);
      this.update = billData.eleBill.date;
      
      this.dayElePq = billData.dayElecQuantity.sevenEleList
        .filter((item) => item.dayElePq !== '-')
        .map((item) => ({
          label: item.day,
          value: parseFloat(item.dayElePq),
        }));
      this.monthElePq = billData.monthElecQuantity.mothEleList
        .map((item) => ({
          label: item.month,
          elePq: parseFloat(item.monthEleNum),
          cost: parseFloat(item.monthEleCost),
        }));
      console.log(this.monthElePq)
    } catch (e) {
      console.log(e);
    }
  }

  init = async () => {
    await this.getBillData();
  };

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
  };

  setColorConfig = async () => {
    return this.renderAppView([
      {
        title: '进度条颜色',
        menu: [
          {
            icon: { name: 'rectangle.portrait.bottomhalf.inset.filled', color: '#52c41a' },
            type: 'color',
            title: '进度条颜色',
            val: 'barColor',
          },
          {
            icon: { name: 'circlebadge.2.fill', color: '#0099DD' },
            type: 'color',
            title: '指针颜色',
            val: 'pointerColor',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            icon: { name: 'chart.bar.fill', color: '#FF4015' },
            type: 'color',
            title: '图表颜色',
            val: 'chartColor',
          },
        ],
      },
      {
        title: '背景颜色',
        menu: [
          {
            icon: { name: 'circle.lefthalf.striped.horizontal', color: '#13c2c2' },
            type: 'color',
            title: '左栏白天颜色',
            val: 'leftDayColor',
          },
          {
            icon: { name: 'circle.lefthalf.filled', color: '#ff8021' },
            type: 'color',
            title: '左栏晚上颜色',
            val: 'leftNightColor',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'circle.lefthalf.filled.righthalf.striped.horizontal.inverse', color: '#FC8DCA' },
            type: 'color',
            title: '右栏白天颜色',
            val: 'rightDayColor',
          },
          {
            icon: { name: 'circle.righthalf.filled', color: '#5186E8' },
            type: 'color',
            title: '右栏晚上颜色',
            val: 'rightNightColor',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            icon: { name: 'eye.square.fill', color: '#7BCD81' },
            type: 'color',
            title: '小尺寸组件主色',
            val: 'smallStackColor',
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
              const propertiesToDelete = ['barColor', 'pointerColor', 'chartColor', 'leftDayColor', 'leftNightColor', 'rightDayColor', 'rightNightColor',];
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
            title: '全局缩放比例',
            desc: '不同机型会造成组件显示问题，适当调整该参数，如0.95、0.9，视小组件显示效果自行调整',
            val: 'SCALE',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'apple.logo', color: '#448EF7' },
            type: 'input',
            title: 'LOGO大小',
            desc: '左栏LOGO尺寸，默认48',
            val: 'logo',
          },
          {
            icon: { name: 'rectangle.lefthalf.inset.filled.arrow.left', color: '#5ABFC1' },
            type: 'input',
            title: '左栏尺寸',
            desc: '默认130',
            val: 'leftStack',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'textformat.size.larger.zh', color: '#ff8021' },
            type: 'input',
            title: '大号文字',
            desc: '默认18',
            val: 'bigFont',
          },
          {
            icon: { name: 'textformat.size.smaller.zh', color: '#7BCD81' },
            type: 'input',
            title: '小号文字',
            desc: '默认12',
            val: 'smallFont',
          },
        ],
      },
      {
        menu: [
          {
            icon: { name: 'chineseyuanrenminbisign', color: '#4676EE' },
            type: 'input',
            title: '余额尺寸',
            desc: '默认20',
            val: 'balance',
          },
          {
            icon: { name: 'dock.arrow.down.rectangle', color: '#7DD35F' },
            type: 'input',
            title: '下标偏移',
            desc: '默认6.5',
            val: 'subSpacer',
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
              const propertiesToDelete = ['SCALE', 'logo', 'leftStack', 'bigFont', 'smallFont', 'balance', 'subSpacer', ];
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

  setShowConfig = async () => {
    return this.renderAppView([
      {
        title: '显示设置',
        menu: [
          {
            icon: { name: '1.square', color: '#5186E8' },
            type: 'select',
            title: '第一栏显示内容',
            options: ['组合一', '组合二', '阶梯电量'],
            val: 'firstRow',
          },
          {
            icon: { name: '2.square', color: '#FF8021' },
            type: 'select',
            title: '第二栏显示内容',
            options: ['组合二', '组合一', '阶梯电量'],
            val: 'secondRow',
          },
          {
            icon: { name: '3.square', color: '#7BCD81' },
            type: 'select',
            title: '第三栏显示内容',
            options: ['阶梯电量', '组合一', '组合二'],
            val: 'thirdRow',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            icon: { name: 'rectangle.inset.topleft.filled', color: '#13c2c2' },
            type: 'select',
            title: '组合一左侧显示内容',
            options: ['上期电费', '上期电量', '年度电费', '年度电量', '日用电图表', '月用电图表', '近日电费', '不显示'],
            val: 'group1Left',
          },
          {
            icon: { name: 'rectangle.inset.topright.filled', color: '#ff8021' },
            type: 'select',
            title: '组合一右侧显示内容',
            options: ['上期电量', '上期电费', '年度电费', '年度电量', '日用电图表', '月用电图表', '近日电费', '不显示'],
            val: 'group1Right',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            icon: { name: 'rectangle.inset.bottomleft.filled', color: '#64C466' },
            type: 'select',
            title: '组合二左侧显示内容',
            options: ['年度电费', '年度电量', '上期电费', '上期电量', '日用电图表', '月用电图表', '近日电费', '不显示'],
            val: 'group2Left',
          },
          {
            icon: { name: 'rectangle.inset.bottomright.filled', color: '#5186E8' },
            type: 'select',
            title: '组合二右侧显示内容',
            options: ['年度电量', '年度电费', '上期电费', '上期电量', '日用电图表', '月用电图表', '近日电费', '不显示'],
            val: 'group2Right',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            icon: { name: 'chart.bar.fill', color: '#FF4015' },
            type: 'select',
            title: '月用电图表显示月数',
            options: ['5', '6', '7', '8', '9', '10', '11', '12'],
            val: 'monthAmount',
          },
          {
            icon: { name: 'chart.line.uptrend.xyaxis', color: '#FF699B' },
            type: 'switch',
            title: '月/年用电显示增减幅度',
            val: 'openRange',
          },
        ],
      },
      {
        title: '图片设置',
        menu: [
          {
            icon: { name: 'apple.logo', color: '#448EF7' },
            type: 'select',
            title: 'logo显示',
            options: ['国家电网', '铁塔', '自定义'],
            val: 'logoImg',
          },
          {
            icon: { name: 'photo.badge.plus', color: '#ff8021' },
            type: 'input',
            title: '自定义',
            desc: '自定义显示图片URL地址，建议透明PNG图片，更改自定图片前需清除缓存',
            val: 'customizeUrl',
          },
        ],
      },
      {
        title: '阶梯电量',
        menu: [
          {
            icon: { name: 'gauge.medium', color: '#A0CD60' },
            type: 'input',
            title: '二档电量',
            desc: '第二档阶梯电量，默认为2520，各地数据以国网app为准',
            val: 'step_2',
          },
          {
            icon: { name: 'gauge.high', color: '#FF5A33' },
            type: 'input',
            title: '三档电量',
            desc: '第三档阶梯电量，默认为4800，各地数据以国网app为准',
            val: 'step_3',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            icon: { name: 'rectangle.inset.topright.filled', color: '#ff8021' },
            type: 'input',
            title: '小尺寸组件标题',
            desc: '自定义小尺寸组件标题，替代默认“国家电网”',
            val: 'name',
          },
        ],
      },
    ]).catch((e) => {
      console.log(e);
    });
  };

  Run() {
    if (config.runsInApp) {
      this.registerAction({
        title: '组件配置',
        menu: [
          {
            icon: { name: 'icloud.fill', color: '#5186E8' },
            type: 'switch',
            title: 'iCloud',
            val: 'useICloud',
          },
          {
            icon: { name: 'arrow.triangle.2.circlepath', color: '#FF8021' },
            type: 'input',
            title: '刷新时间',
            desc: '电费数据刷新时间，单位：分钟，默认360分钟',
            val: 'interval',
          },
          {
            icon: { name: 'paintbrush.fill', color: '#FF5F5D' },
            title: '清除缓存',
            desc: '',
            val: 'reset',
            onClick: async () => {
              const options = ['取消', '确认清除'];
              const message = '所有在线请求的数据缓存将会被清空';
              const index = await this.generateAlert(message, options);
              if (index === 0) return;
              this.fm.remove(this.cachePath);
            },
          },
        ],
      });
      this.registerAction({
        title: '',
        menu: [
          {
            name: 'color',
            title: '颜色配置',
            url: 'https://pic1.imgdb.cn/item/63315c1e16f2c2beb1a27363.png',
            type: 'input',
            onClick: () => {
              return this.setColorConfig();
            },
          },
          {
            name: 'size',
            icon: { name: 'arrow.down.backward.and.arrow.up.forward.square', color: '#7BCD81' },
            title: '尺寸配置',
            type: 'input',
            onClick: () => {
              return this.setSizeConfig();
            },
          },
          {
            name: 'show',
            icon: { name: 'rectangle.3.group.fill', color: '#FF9933' },
            title: '显示配置',
            type: 'input',
            onClick: () => {
              return this.setShowConfig();
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

     }

    try {
      if (this.settings.useICloud === 'true') this.fm = FileManager.iCloud();
      this.cachePath = this.fm.joinPath(this.fm.documentsDirectory(), this.CACHE_FOLDER);
      
      this.SCALE = this.settings.SCALE ? this.settings.SCALE : this.SCALE;
      
      Object.keys(this.wsgw).forEach(key => {
        this.wsgw[key] = this.settings[key] ? this.settings[key] : this.wsgw[key];
      })
      
      Object.keys(this.size).forEach(key => {
        this.size[key] = this.settings[key] ? this.settings[key] : this.size[key]
        this.size[key] = this.size[key] * this.SCALE;
      })
      
    console.log(this.settings)
    console.log(this.size.logo)

    } catch (e) {
      console.log(e);
    }
  };
};

await Runing(Widget, args.widgetParameter, false);