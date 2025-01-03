/*
 * @author: 脑瓜
 * @feedback: https://t.me/Scriptable_CN
 * telegram: @anker1209
 * version: 2.3.2
 * update: 2025/01/03
 * 原创UI，修改套用请注明来源
 * 使用该脚本需DmYY依赖及添加重写，重写修改自作者@Yuheng0101
 * 重写: https://raw.githubusercontent.com/dompling/Script/master/wsgw/index.js
 * 依赖: https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/DmYY.js
*/

if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '国家电网';
    this.en = 'wsgw_ng';
    this.index = 0;
    this.data = null;
    this.Run();
  };

  version = '2.3.2';

  fm = FileManager.local();
  CACHE_FOLDER = Script.name();
  cachePath = null;

  isOverdue = false;
  isPostPaid = false;
  remainFee = 0;
  balance = 0;
  monthUsage = 0;
  monthFee = 0;
  yearUsage = 0;
  yearFee = 0;
  dayFee = 0;
  stepEle = 0;
  currentMonthEle = 0;
  SCALE = 1;
  barHeight = 12;
  update = this.formatDate();
  smallStackColor = '#3A9690';
  endColor = '#3A9690';
  lastColor = '#00CC99'
  widgetStyle = '1';
  
  dayElePq = [];
  monthElePq = [];
  
  size = {
    logo : 48 * 0.95,
    leftStack : 130 * 0.95,
    smallFont : 12 * 0.95,
    bigFont : 18 * 0.95,
    balance : 20 * 0.95,
    subSpacer : 6.5 * 0.95,
  };
  
  wsgw = {
    step_2 : 2520,
    step_3 : 4800,
    interval : 360,
  };

  setRow(stack, key) {
    const itemStack = stack.addStack();
    switch (key) {
      case '组合一' :
      this.rowUnit(itemStack, this.settings.group1Left || '上期电费');
      itemStack.addSpacer();
      this.rowUnit(itemStack, this.settings.group1Right || '上期电量', true);
      break;
      case '组合二' :
      this.rowUnit(itemStack, this.settings.group2Left || '年度电费');
      itemStack.addSpacer();
      this.rowUnit(itemStack, this.settings.group2Right || '年度电量', true);
      break;
      case '组合三' :
      this.rowUnit(itemStack, this.settings.group3Left || '近日用电');
      itemStack.addSpacer();
      this.rowUnit(itemStack, this.settings.group3Right || '本月电量', true);
      break;
      case '阶梯电量':
      this.stepEleStack(itemStack);
      default:
      return;
    }
  };

  getWidgetData(key) {
    switch (key) {
      case '上期电费' :
      return [key, `${this.monthFee}`, '元'];
      case '上期电量' :
      return [key, `${this.monthUsage}`, '度'];
      case '年度电费':
      return [key, `${this.yearFee}`, '元'];
      case '年度电量':
      return [key, `${this.yearUsage}`, '度'];
      case '本月电量':
      return [key, `${this.currentMonthEle}`, '度'];
      case '近日用电':
      const arr = this.dayElePq.map((item) => item.elePq).reverse();
      this.dayFee = arr[arr.length - 1] || 0;
      return [key, `${this.dayFee}`, '度'];
      case '电费余额':
      return [key, `${this.remainFee}`, '元'];
      case '阶梯电量':
      return key;
      case '自定户名':
      return key;
      default:
      return null;
    }
  };
  
  rowUnit(stack, key, right = false){
    const bodyStack = stack.addStack();
    bodyStack.layoutVertically();
    const h = this.size.smallFont + this.size.bigFont + 3;
    const scale = h / 50;
    switch (key) {
      case '上期电费' :
      this.unitContent(bodyStack, '上期电费', `${this.monthFee}`, true, right);
      break;
      case '上期电量' :
      this.unitContent(bodyStack, '上期电量', `${this.monthUsage}`,false, right);
      break;
      case '年度电费':
      this.unitContent(bodyStack, '年度电费', `${this.yearFee}`, true, right);
      break;
      case '年度电量':
      this.unitContent(bodyStack, '年度电量', `${this.yearUsage}`, false, right);
      break;
      case '本月电量':
      this.unitContent(bodyStack, '本月电量', `${this.currentMonthEle}`, false, right);
      break;
      case '近日用电':
      const arr = this.dayElePq.map((item) => item.elePq).reverse();
      this.dayFee = arr[arr.length - 1] || 0;
      this.unitContent(bodyStack, '近日用电', `${this.dayFee}`, false, right);
      break;
      case '电费余额':
      this.unitContent(bodyStack, '电费余额', `${this.remainFee}`, true, right);
      break;
      case '日用电图表':
      if (!this.data[this.index]) return;
      const dayAmount = parseFloat(this.settings.dayAmount) || 5;
      const dayOpt = this.dayElePq.map((item) => item.elePq).reverse();
      if (dayOpt.every(num => num === 0)) return;
      const dayChart = bodyStack.addImage(this.chartBar(dayOpt, dayAmount));
      dayChart.imageSize = new Size((dayAmount * 18 - 10) * scale, 50 * scale);
      break;
      case '月用电图表':
      if (!this.data[this.index]) return;
      const monthAmount = parseFloat(this.settings.monthAmount) || 5;
      const monthOpt = this.monthElePq.map((item) => item.cost);
      if (monthOpt.every(num => num === 0)) return;
      const monthChart = bodyStack.addImage(this.chartBar(monthOpt, monthAmount));
      monthChart.imageSize = new Size((monthAmount * 18 - 10) * scale, 50 * scale);
      break;
      case '不显示':
      return;
      default:
      return;
    }
  };
  
  unitContent(stack, upText, downText, fee = false, right = false) {
    const titleStack = stack.addStack();
    if (right) titleStack.addSpacer();
    const smallText = titleStack.addText(upText);
    const valueStack = stack.addStack();
    if (right) valueStack.addSpacer();
    const bigText = valueStack.addText(downText);
    fee ? this.unit(valueStack, '元', this.size.subSpacer) : this.unit(valueStack, '度', this.size.subSpacer);
    smallText.textColor = this.widgetColor;
    smallText.font = Font.semiboldSystemFont(this.size.smallFont);
    smallText.textOpacity = 0.5;
    bigText.textColor = this.widgetColor;
    bigText.font = Font.mediumRoundedSystemFont(this.size.bigFont)
  };

  // 阶梯电量Stack
  stepEleStack(stack) {
    stack.layoutVertically();
    const textStack = stack.addStack();
    const leftTitle = textStack.addText('阶梯电量');
    textStack.addSpacer();
    const step = this.stepEleText();
    const rightTitle = textStack.addText(step.text);
    stack.addSpacer(4);
    stack.addImage(this.progressBar());

    leftTitle.textColor = this.widgetColor;
    rightTitle.textColor = step.color;
    [leftTitle, rightTitle].map(t => {
      t.font = Font.semiboldSystemFont(this.size.smallFont);
      t.textOpacity = 0.5
    });
  };

  // 阶梯电量状态文本
  stepEleText() {
    let step = {
      text: '一档·0%',
      color: this.widgetColor,
      progress: 0,
      icon: '1.square',
      level: 1
    };
    
    const isMonthly = this.settings.stepMode === '月';

    const currentUsage = parseFloat(this.currentMonthEle);
    const totalUsage = parseFloat(this.stepEle);

    const per_step_1 = isMonthly
      ? ((currentUsage / this.wsgw.step_2) * 100).toFixed(2)
      : ((totalUsage / this.wsgw.step_2) * 100).toFixed(2);

    const per_step_2 = isMonthly
      ? ((currentUsage / this.wsgw.step_3) * 100).toFixed(2)
      : ((totalUsage / this.wsgw.step_3) * 100).toFixed(2);

    if ((isMonthly && currentUsage < this.wsgw.step_2) || (!isMonthly && totalUsage < this.wsgw.step_2)) {
      step = {
        text: `第一阶梯·${per_step_1}%`,
        color: this.widgetColor,
        progress: `${per_step_1}%`,
        icon: '1.square',
        level: 1
      };
    } else if ((isMonthly && currentUsage > this.wsgw.step_3) || (!isMonthly && totalUsage > this.wsgw.step_3)) {
      const per_step_3 = (per_step_2 - 100).toFixed(2);
      step = {
        text: `第三阶梯·${per_step_3}%`,
        color: new Color('#DE2A18'),
        progress: `${per_step_3}%`,
        icon: '3.square',
        level: 3
      };
    } else {
      step = {
        text: `第二阶梯·${per_step_2}%`,
        color: this.widgetColor,
        progress: `${per_step_2}%`,
        icon: '2.square',
        level: 2
      };
    }

    return step;
  };

  // 单位
  unit(stack, text, spacer, corlor = this.widgetColor, overDue = false) {
    stack.addSpacer(1);
    const unitStack = stack.addStack();
    unitStack.layoutVertically();
    unitStack.addSpacer(spacer);
    const unitTitle = unitStack.addText(text);
    unitTitle.font = Font.semiboldRoundedSystemFont(10 * this.SCALE);
    unitTitle.textColor = overDue ? new Color('DE2A18') : corlor;
  };

  addChineseUnit(stack, text, color, size) {
    let textElement = stack.addText(text);
    textElement.textColor = color;
    textElement.font = Font.mediumSystemFont(size);
    return textElement;
  };

  // 分栏
  split(stack, width, height, ver = false) {
    const splitStack = stack.addStack();
    splitStack.size = new Size(width, height);
    if (ver) splitStack.layoutVertically();
    splitStack.addSpacer();
    splitStack.backgroundColor = Color.dynamic(new Color('#B6B5BA'), new Color('#414144'));
  };
  // 标题
  setTitle (stack, iconColor, nameColor) {
    const nameStack = stack.addStack();
    const iconSFS = SFSymbol.named('house.fill');
    iconSFS.applyHeavyWeight();
    let icon = nameStack.addImage(iconSFS.image);
    icon.imageSize = new Size(20 * this.SCALE, 20 * this.SCALE);
    icon.tintColor = iconColor;
    nameStack.addSpacer(2);
    let name = nameStack.addText(this.name || '国家电网');
    name.font = Font.mediumSystemFont(16.5 * this.SCALE);
    name.textColor = nameColor;
  };
  
  setList(stack, data, color) {
    const rowStack = stack.addStack();
    rowStack.centerAlignContent();
    const lineStack = rowStack.addStack();
    lineStack.size = new Size(8 * this.SCALE, 30 * this.SCALE); 
    lineStack.cornerRadius = 4 * this.SCALE;
    
    lineStack.backgroundColor = new Color(color);

    rowStack.addSpacer(10 * this.SCALE);

    const leftStack = rowStack.addStack();
    leftStack.layoutVertically();
    leftStack.addSpacer(2 * this.SCALE);

    const titleStack = leftStack.addStack();
    const title = titleStack.addText(data[0]);
    title.font = Font.systemFont(10 * this.SCALE); 
    title.textColor = this.widgetColor;
    title.textOpacity = 0.5;

    const valueStack = leftStack.addStack();
    valueStack.centerAlignContent();
    const value = valueStack.addText(data[1]);
    value.font = Font.semiboldRoundedSystemFont(16 * this.SCALE);
    value.textColor = this.widgetColor;
    valueStack.addSpacer();

    const unitStack = valueStack.addStack();
    unitStack.cornerRadius = 4 * this.SCALE;
    unitStack.borderWidth = 1;
    unitStack.borderColor = new Color(color);
    unitStack.setPadding(1, 3 * this.SCALE, 1, 3 * this.SCALE);
    unitStack.size = new Size(30 * this.SCALE, 0)
    unitStack.backgroundColor = Color.dynamic(new Color(color), new Color(color, 0.3));
    const unit = unitStack.addText(data[2]);
    unit.font = Font.mediumRoundedSystemFont(10 * this.SCALE);
    unit.textColor = Color.dynamic(Color.white(), new Color(color));
  };
  
  // 更新时间
  setUpdateStack (stack, color) {
    const updateStack = stack.addStack();
    updateStack.addSpacer();
    updateStack.centerAlignContent();
    const updataIcon = SFSymbol.named('arrow.2.circlepath');
    updataIcon.applyHeavyWeight();
    const updateImg = updateStack.addImage(updataIcon.image);
    updateImg.tintColor = color;
    updateImg.imageOpacity = 0.5;
    updateImg.imageSize = new Size(10, 10);
    updateStack.addSpacer(3);
    const updateText = updateStack.addText(this.getTime());
    updateText.font = Font.mediumSystemFont(10);
    updateText.textColor = color;
    updateText.textOpacity = 0.5;
    updateStack.addSpacer();
  };
  
  // 余额
  setBalanceStack (stack, color, padding, balanceSize, titleSize, spacer) {
    let balance = this.balance;
    let balanceTitle = this.isOverdue ? '电费欠费' : '电费余额';
    if (!this.isOverdue && this.isPostPaid) {
      balance = this.settings.showBalance === 'true' ? this.remainFee : this.monthFee;
      balanceTitle = this.settings.showBalance === 'true' ? '电费余额' : '上期电费';
    };
    
    const bodyStack = stack.addStack();
    bodyStack.layoutVertically();
    bodyStack.cornerRadius = 10;
    bodyStack.backgroundColor = color;
    bodyStack.addSpacer(padding * this.SCALE);
    //  余额Stack
    const balanceStack = bodyStack.addStack();
    balanceStack.centerAlignContent();
    balanceStack.addSpacer();
    const balanceText = balanceStack.addText(`${balance}`);
    balanceText.font = Font.semiboldRoundedSystemFont(balanceSize);
    balanceText.lineLimit = 1;
    balanceText.minimumScaleFactor = 0.5;
    balanceText.textColor = this.isOverdue ? new Color('DE2A18') : this.widgetColor;
    this.unit(balanceStack, "元", spacer * this.SCALE, this.widgetColor, this.isOverdue);
    balanceStack.addSpacer();
    bodyStack.addSpacer(3 * this.SCALE);
    //  余额标题Stack
    const balanceTitleStack = bodyStack.addStack();
    balanceStack.url = "com.wsgw.e.zsdl://platformapi/";
    balanceTitleStack.addSpacer();
    const balanceTitleText = balanceTitleStack.addText(balanceTitle);
    balanceTitleStack.addSpacer();
    bodyStack.addSpacer(padding * this.SCALE);

    balanceTitleText.textColor =  this.isOverdue ? new Color('DE2A18') : this.widgetColor;
    balanceTitleText.font =  Font.semiboldSystemFont(titleSize);
    balanceTitleText.textOpacity = 0.5;
  };

  getLogo = async () => {
    var logo;
    if (this.settings.logoImg ==='铁塔') {
      logo = await this.getImageByUrl('https://raw.githubusercontent.com/anker1209/icon/main/gjdw2.png', 'tower.png');
    } else if (this.settings.logoImg ==='不显示') {
      let context = new DrawContext();
      context.size = new Size(1, 1);
      context.opaque = false; context.setFillColor(new Color('#FFFFFF', 0));
      context.fillRect(new Rect(0, 0, 1, 1)); 
      logo = context.getImage();
    } else if (this.settings.logoImg ==='国家电网' || !this.settings.logoImg || !this.settings.customizeUrl) {
      logo = await this.getImageByUrl('https://raw.githubusercontent.com/anker1209/icon/main/gjdw.png', 'wsgw.png');
    } else {
      logo = await this.getImageByUrl(this.settings.customizeUrl, 'customize.png');
    };
    return logo
  };
  // ######################################
  // ######################################
  // 画画的BABY
  makeCanvas(w, h) {
    const drawing = new DrawContext();
    drawing.opaque = false;
    drawing.respectScreenScale = true;
    drawing.size = new Size(w, h);
    return drawing;
  };
  
  fillRect(drawing, x, y, width, height, cornerradio, color) {
    let path = new Path();
    let rect = new Rect(x, y, width, height);
    path.addRoundedRect(rect, cornerradio, cornerradio);
    drawing.addPath(path);
    drawing.setFillColor(color);
    drawing.fillPath();
  };
  
  drawLine(drawing, x1, y1, x2, y2, color, width) {
    const path = new Path();
    path.move(new Point(Math.round(x1),Math.round(y1)));
    path.addLine(new Point(Math.round(x2),Math.round(y2)));
    drawing.addPath(path);
    drawing.setStrokeColor(color);
    drawing.setLineWidth(width);
    drawing.strokePath();
  };
  
  drawArc(context, center, radius, startAngle, endAngle, segments, fillColor, lineWidth, dir = 1) {
    const path = new Path();
    const startX = center.x + radius * Math.cos(startAngle);
    const startY = center.y + radius * Math.sin(startAngle);
    path.move(new Point(startX, startY));

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const angle = startAngle + (endAngle - startAngle) * t;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      path.addLine(new Point(x, y));
    }

    context.setStrokeColor(fillColor);
    context.setLineWidth(lineWidth);
    context.addPath(path);
    context.strokePath();
  };

  drawHalfCircle(centerX, centerY, startAngle, circleRadius, context, fillColor, direction = 1) {
    const halfCirclePath = new Path();
    const startX = centerX + circleRadius * Math.cos(startAngle);
    const startY = centerY + circleRadius * Math.sin(startAngle);
    halfCirclePath.move(new Point(startX, startY));

    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const angle = startAngle + direction * Math.PI * t;
        const x = centerX + circleRadius * Math.cos(angle);
        const y = centerY + circleRadius * Math.sin(angle);
        halfCirclePath.addLine(new Point(x, y));
    }

    context.setFillColor(fillColor);
    context.addPath(halfCirclePath);
    context.fillPath();
  };

  drawTickMarks(radius, color, startBgAngle, totalBgAngle, center, context) {
    const tickRadius = radius - 8;
    const tickLength = 4;

    const totalTicks = 20;
    for (let i = 0; i <= totalTicks; i++) {
      const t = i / totalTicks;
      const angle = startBgAngle + totalBgAngle * t;
      const x1 = center.x + tickRadius * Math.cos(angle);
      const y1 = center.y + tickRadius * Math.sin(angle);
      const x2 = center.x + (tickRadius - tickLength) * Math.cos(angle);
      const y2 = center.y + (tickRadius - tickLength) * Math.sin(angle);

      const tickPath = new Path();
      tickPath.move(new Point(x1, y1));
      tickPath.addLine(new Point(x2, y2));

      context.setStrokeColor(color);
      context.setLineWidth(1);
      context.addPath(tickPath);
      context.strokePath();
    }
  };

  progressBar() {
    const W = 200, H = this.barHeight , r = 6, h = 6;
    const drawing = this.makeCanvas(W, H);
    const progress = this.settings.stepMode === '月' ? this.currentMonthEle / this.wsgw.step_3 * W : parseFloat(this.stepEle) / this.wsgw.step_3 * W;
    const circle = progress - 2 * r;
    const fgColor = new Color(this.settings.barColor || '#0db38e', 1);
    const bgColor = new Color(this.settings.barColor || '#0db38e', 0.3);
    const pointerColor = new Color(this.settings.pointerColor || '#0db38e', 1);
    this.drawLine(drawing, r, H, r, 0, bgColor, 2);
    this.drawLine(drawing, W - r, H, W - r, 0, bgColor, 2);
    this.drawLine(drawing, this.wsgw.step_2 / this.wsgw.step_3 * W, H, this.wsgw.step_2 / this.wsgw.step_3 * W, 0, bgColor, 2);
    this.fillRect(drawing, 0, (H - h) / 2, W, h, h / 2, bgColor);
    this.fillRect(drawing, 0, (H - h) / 2, progress > W ? W : progress < r * 2 ? r * 2 : progress, h, h / 2, fgColor);
    this.fillRect(drawing, circle > W - r * 2 ? W - r * 2 : circle < 0 ? 0 : circle, H / 2 - r, r * 2, r * 2, r, pointerColor);
    return drawing.getImage();
  };
  
  wideProgressBar() {
    const width = 200;
    const height = 42;
    const progress = this.settings.stepMode === '月' ? this.currentMonthEle / this.wsgw.step_3 * width : parseFloat(this.stepEle) / this.wsgw.step_3 * width;
    const drawing = this.makeCanvas(width, height);
    this.drawLine(drawing, this.wsgw.step_2 / this.wsgw.step_3 * width, height, this.wsgw.step_2 / this.wsgw.step_3 * width, 0, new Color(this.smallStackColor, 0.3), 2);
    this.fillRect(drawing, 0, 0, width, height, 6, new Color(this.smallStackColor, 0.3));
    this.fillRect(drawing, 0, 0, progress > width? width : progress, height, 6, new Color(this.smallStackColor, 1));
    return drawing.getImage();
  };

  chartBar (opt, n) {
    let chartColor = new Color(this.settings.chartColor || '#0db38e', 1);
    const drawing = this.makeCanvas(n * 18 - 10, 50);
    let data = opt;
    if (data.length > n) {
      data = data.slice(data.length - n);
    }
    const max = Math.max(...data);
    const min = max / 2;
    if (data.length < n) {
      const gap = n - data.length;
      const newArr = [];
      for (let i = 0; i < gap; i++) {
        newArr.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      data = [...data, ...newArr]
    };
    const deltaY = 50 / max;
    for (let i = 0; i < n; i++) {
      let	temp = data[i] * deltaY;
      if (i + 1  > opt.length) {
        chartColor = new Color(this.settings.chartColor || '#0db38e', 0.3);
      };
      this.fillRect(drawing, i * 18, 50 - temp, 8, temp, 4, chartColor)
    }
    return drawing.getImage();
  };

  gaugeChart() {
    const w = 150, h = 150;
    const drawing = this.makeCanvas(w, h);
    const center = new Point(w / 2, h / 2);
    const radius = w / 2 - 10;
    const circleRadius = 6;
    const startBgAngle = (11 * Math.PI) / 12;
    const endBgAngle = (25 * Math.PI) / 12;
    const totalBgAngle = endBgAngle - startBgAngle;
    const gapAngle = Math.PI / 15;
    const lineWidth = circleRadius * 2;
    
    const colors = [
    { base: new Color("#00CC99", 0.1), progress: new Color("#00CC99") },
    { base: new Color("#FFD700", 0.1), progress: new Color("#FFD700") },
    { base: new Color("#FF4500", 0.1), progress: new Color("#FF4500") },
    { base: new Color("#800020", 0.1), progress: new Color("#800020") }
    ];

    const segmentAngle = (totalBgAngle - 2 * gapAngle) / 3;
    
    const step = this.stepEleText();

    const level = step.level;
    let progress = parseFloat(step.progress.slice(0, -1)) / 100;
    progress = progress > 1 ? 1 : progress;
    
    for (let i = 0; i < 3; i++) {
      const segmentStartAngle = startBgAngle + i * (segmentAngle + gapAngle);
      const segmentEndAngle = segmentStartAngle + segmentAngle;

      this.drawArc(
        drawing,
        center,
        radius,
        segmentStartAngle,
        segmentEndAngle,
        100,
        colors[i].base,
        lineWidth
      );

      this.drawHalfCircle(
        center.x + radius * Math.cos(segmentStartAngle),
        center.y + radius * Math.sin(segmentStartAngle),
        segmentStartAngle,
        circleRadius,
        drawing,
        colors[i].base,
        -1
      );
      this.drawHalfCircle(
        center.x + radius * Math.cos(segmentEndAngle),
        center.y + radius * Math.sin(segmentEndAngle),
        segmentEndAngle,
        circleRadius,
        drawing,
        colors[i].base,
        1
      );

      if (level > i) {
        const stepColors = this.gradientColor([`#${colors[i].progress.hex}`, `#${colors[i+1].progress.hex}`], 51);
        const isCurrentLevel = level === i + 1;
        const progressEndAngle = isCurrentLevel
          ? segmentStartAngle + progress * segmentAngle
          : segmentEndAngle;
        const p = isCurrentLevel ? progress * 50 : 50; // 插值因子
        this.lastColor = this.gradientColor([`#${colors[level - 1].progress.hex}`, `#${colors[level].progress.hex}`], 51)[Math.round(p)];

        for (let j = 0; j <= p; j++) {
          const t = j / p;
          const angle = segmentStartAngle + t * (progressEndAngle - segmentStartAngle);
          const x = center.x + radius * Math.cos(angle);
          const y = center.y + radius * Math.sin(angle);

          const circleRect = new Rect(
            x - circleRadius,
            y - circleRadius,
            circleRadius * 2,
            circleRadius * 2
          );
          drawing.setFillColor(new Color(stepColors[j]));
          drawing.fillEllipse(circleRect);
        }
      }
    }

    return drawing.getImage();
  }
  // ######################################
  // ######################################
  formatDate() {
    let theDate = Date.now();
    let dF = new DateFormatter();
    dF.dateFormat = 'yyyy-MM-dd HH:mm:ss';
    theDate = new Date(theDate);
    return dF.string(theDate);
  };

  getTime = () => {
    const dateTime = this.update;
    const parts = dateTime.split(' ');
    const datePart = parts[0].split('-');
    const timePart = parts[1].split(':');
    return `${datePart[1]}-${datePart[2]} ${timePart[0]}:${timePart[1]}`;
  };
  // 获取缩放比例
  getWidgetScaleFactor() {
    const referenceScreenSize = { width: 430, height: 932, widgetSize: 170 };
    const screenData = [
      { width: 440, height: 956, widgetSize: 170 }, // 16 Pro Max
      { width: 430, height: 932, widgetSize: 170 }, // 16 Plus, 15 Plus, 15 Pro Max, 14 Pro Max
      { width: 428, height: 926, widgetSize: 170 }, // 14 Plus, 13 Pro Max, 12 Pro Max
      { width: 414, height: 896, widgetSize: 169 }, // 11 Pro Max, XS Max, 11, XR
      { width: 402, height: 874, widgetSize: 162 }, // 16 Pro
      { width: 414, height: 736, widgetSize: 159 }, // Home button Plus phones
      { width: 393, height: 852, widgetSize: 158 }, // 16, 15, 15 Pro, 14 Pro
      { width: 390, height: 844, widgetSize: 158 }, // 14, 13, 13 Pro, 12, 12 Pro
      { width: 375, height: 812, widgetSize: 155 }, // 13 mini, 12 mini / 11 Pro, XS, X
      { width: 375, height: 667, widgetSize: 148 }, // SE3, SE2, Home button Plus in Display Zoom mode
      { width: 360, height: 780, widgetSize: 155 }, // 11 and XR in Display Zoom mode
      { width: 320, height: 568, widgetSize: 141 } // SE1
    ];

    const deviceScreenWidth = Device.screenSize().width;
    const deviceScreenHeight = Device.screenSize().height;

    const matchingScreen = screenData.find(screen => 
      (screen.width === deviceScreenWidth && screen.height === deviceScreenHeight) ||
      (screen.width === deviceScreenHeight && screen.height === deviceScreenWidth)
    );

    if (!matchingScreen) {
      return 1;
    };

    const scaleFactor = (matchingScreen.widgetSize - 30 ) / (referenceScreenSize.widgetSize - 30);

    return Math.floor(scaleFactor * 100) / 100;
  };

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

  createCenteredText(stack, content, unit, fontIndex, fontSize, color, opacity = 1, icon) {
    const systemFonts = [
      // 0, Default
      Font.systemFont(fontSize),
      // 1, Light
      Font.lightSystemFont(fontSize),
      // 2, Medium
      Font.mediumSystemFont(fontSize),
      // 3, Bold
      Font.boldSystemFont(fontSize),
      // 4, Medium Rounded
      Font.mediumRoundedSystemFont(fontSize),
      // 5, Semibold Rounded
      Font.semiboldRoundedSystemFont(fontSize),
      // 6, Bold Rounded
      Font.boldRoundedSystemFont(fontSize)
    ];
    const rowStack = stack.addStack();
    rowStack.centerAlignContent();
    rowStack.addSpacer();

    if(icon) {
      const sfs = SFSymbol.named(icon);
      const sfsImg = rowStack.addImage(sfs.image);
      sfsImg.tintColor = color;
      sfsImg.imageSize = new Size(15 * this.SCALE, 15 * this.SCALE);
      rowStack.addSpacer(3);
    }

    let textElement = rowStack.addText(content);
    textElement.font = systemFonts[fontIndex] || Font.systemFont(fontSize);
    textElement.textColor = color;
    textElement.textOpacity = opacity;
    this.addChineseUnit(rowStack, unit, color, 13 * this.SCALE);
    rowStack.addSpacer();
    return rowStack;
  };

  createCenteredStack(stack, text, bgColor) {
    const outStack = stack.addStack();
    outStack.addSpacer();
    const innerStack = outStack.addStack();
    innerStack.setPadding(1, 1, 1, 1);
    innerStack.backgroundColor = bgColor;
    innerStack.cornerRadius = 3;
    const textElement = innerStack.addText(text);
    textElement.textColor = Color.white();
    textElement.font = Font.mediumSystemFont(10 * this.SCALE);
    outStack.addSpacer();
    return outStack;
  };
  // ######################################
  // ######################################
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
  };

  loadStringCache(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    let cacheString = '';
    if (fileExists) {
      cacheString = this.fm.readString(cacheFile);
    }
    return cacheString;
  };

  saveStringCache(cacheKey, content) {
    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath, true);
    };
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    this.fm.writeString(cacheFile, content);
  };

  getCacheModificationDate(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    if (fileExists) {
      return this.fm.modificationDate(cacheFile).getTime() / 1000;
    } else {
      return 0;
    }
  };

  getCurrentTimeStamp() {
    return new Date().getTime() / 1000;
  };

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
  };

  loadImgCache(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    let img = undefined;
    if (fileExists) {
      if (this.settings.useICloud ==='true') this.fm.downloadFileFromiCloud(this.cachePath);
      img = Image.fromFile(cacheFile);
    }
    return img;
  };

  saveImgCache(cacheKey, img) {
    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath, true);
    };
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    this.fm.writeImage(cacheFile, img);
  };

  async checkAndUpdateScript() {
    const updateUrl = "https://raw.githubusercontent.com/anker1209/Scriptable/main/upcoming.json";
    const scriptName = Script.name() + '.js'
    
    const request = new Request(updateUrl);
    const response = await request.loadJSON();
    const latestVersion = response.find(i => i.name === "sgcc").version;
    const downloadUrl = response.find(i => i.name === "sgcc").downloadUrl;
    const isUpdateAvailable = this.version !== latestVersion;

    if (isUpdateAvailable) {
      const alert = new Alert();
      alert.title = "检测到新版本";
      alert.message = `新版本：${latestVersion}，是否更新？`;
      alert.addAction("更新");
      alert.addCancelAction("取消");

      const response = await alert.presentAlert();
      if (response === 0) {
        const updateRequest = new Request(downloadUrl);
        const newScriptContent = await updateRequest.loadString();

        const fm = FileManager[
          module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local'
        ]();
        const scriptPath = fm.documentsDirectory() + `/${scriptName}`;
        fm.writeString(scriptPath, newScriptContent);

        const successAlert = new Alert();
        successAlert.title = "更新成功";
        successAlert.message = "脚本已更新，请关闭本脚本后重新打开!";
        successAlert.addAction("确定");
        await successAlert.present();
        this.reopenScript();
      }
    } else {
      const noUpdateAlert = new Alert();
      noUpdateAlert.title = "无需更新";
      noUpdateAlert.message = "当前已是最新版本。";
      noUpdateAlert.addAction("确定");
      await noUpdateAlert.present();
    }
  }
  // ######################################
  // ######################################
  getBimonthlyStepEle() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const data = this.monthElePq

    // 工具函数：根据年份和月份生成标签
    function getLabel(year, month) {
      return `${year}${month.toString().padStart(2, '0')}`;
    }

    // 工具函数：查找数据
    function findData(label) {
      return data.find(item => item.label === label);
    }

    // 定义 stepEle 的初始值
    let stepEle = 0;

    if (currentMonth % 2 === 1) { // 奇数月
      // 获取上个月的标签
      let previousYear = currentYear;
      let previousMonth = currentMonth - 1;

      if (previousMonth === 0) { // 处理跨年
        previousYear -= 1;
        previousMonth = 12;
      }

      const previousLabel = getLabel(previousYear, previousMonth);
      const previousData = findData(previousLabel);

      if (previousData) {
        // 如果上个月的数据存在，返回 currentMonthEle
        stepEle = Number(this.currentMonthEle);
      } else {
        // 如果上个月的数据不存在，检查上上个月的数据
        let twoMonthsAgoYear = previousYear;
        let twoMonthsAgoMonth = previousMonth - 1;

        if (twoMonthsAgoMonth === 0) { // 处理跨年
          twoMonthsAgoYear -= 1;
          twoMonthsAgoMonth = 12;
        }

        const twoMonthsAgoLabel = getLabel(twoMonthsAgoYear, twoMonthsAgoMonth);
        const twoMonthsAgoData = findData(twoMonthsAgoLabel);

        if (twoMonthsAgoData) {
          // 如果上上个月的数据存在，返回上上个月的 elePq + currentMonthEle
          stepEle = twoMonthsAgoData.elePq + Number(this.currentMonthEle);
        } else {
          console.log("未找到足够的数据！");
        }
      }
    } else { // 偶数月
      // 获取上个月的标签
      const previousYear = currentYear;
      const previousMonth = currentMonth - 1;

      const previousLabel = getLabel(previousYear, previousMonth);
      const previousData = findData(previousLabel);

      if (previousData) {
        // 如果上个月的数据存在，返回上个月 elePq + currentMonthEle
        stepEle = previousData.elePq + Number(this.currentMonthEle);
      } else {
        // 如果上个月的数据不存在，返回 currentMonthEle
        stepEle = Number(this.currentMonthEle);
      }
    }

    return stepEle
  }
  // 获取当月电量
  getSumForCurrentMonth(data) {
    function sumValuesForMonth(data, year, month) {
      return data
        .filter(item => item.label.startsWith(`${year}${month.toString().padStart(2, '0')}`))
        .reduce((sum, item) => sum + item.elePq, 0);
    }

    // 获取当前年月
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; 

    // 计算当月电费总和
    let sum = sumValuesForMonth(data, currentYear, currentMonth);
    
    if (sum === 0) {
      // 如果本月没有数据，计算上月的数据
      const previousYear = currentMonth === 1? currentYear - 1 : currentYear;
      const previousMonth = currentMonth === 1? 12 : currentMonth - 1;
      // 检查 data 中是否有上个月的数据
      const hasPreviousMonthData = this.monthElePq.some(item => item.label === `${previousYear}${previousMonth.toString().padStart(2, '0')}`);
      if (hasPreviousMonthData) {
        sum = 0;
      } else {
        sum = sumValuesForMonth(data, previousYear, previousMonth);
      }
    }

    return sum.toFixed(2);
  };

  getBillData = async () => {
    const dataName = '国网数据';
    const url = 'http://api.wsgw-rewrite.com/electricity/bill/all';
    const options = {};
    try {
      this.data = await this.httpRequest(dataName, url, true, options, 'BillData.json');
      if (!this.data)  throw new Error("请求失败,请安装模块 检查boxjs配置");
      this.getUserInfo();
      const billData = await this.getData();
      
      this.dayElePq = billData.dayElecQuantity31.sevenEleList
        .filter((item) => item.dayElePq !== '-')
        .map((item) => ({
          label: item.day,
          elePq: parseFloat(item.dayElePq),
        }));
        
      this.monthElePq = (billData.monthElecQuantity?.mothEleList?? [])
      .map((item) => ({
        label: item.month,
        elePq: parseFloat(item.monthEleNum),
        cost: parseFloat(item.monthEleCost),
      }));

      this.isOverdue = billData.arrearsOfFees;
      this.isPostPaid = billData.eleBill.hasOwnProperty('accountBalance') ? true : false;
      this.update = billData.eleBill.date;
      const consNo = billData.eleBill.consNo;
      const sumMoney = Number(billData.eleBill.sumMoney).toFixed(2);
      const accountBalance = Number(billData.eleBill.accountBalance).toFixed(2);
      
      this.balance = this.isOverdue ? '-' + Math.abs(sumMoney) : sumMoney; // 左栏显示
      this.remainFee = this.isPostPaid ? accountBalance : sumMoney; // 自定义显示
      
      this.currentMonthEle = this.getSumForCurrentMonth(this.dayElePq);
      this.monthUsage = parseFloat(this.last(billData.monthElecQuantity.mothEleList)?.monthEleNum??0);
      this.monthFee = parseFloat(this.last(billData.monthElecQuantity.mothEleList)?.monthEleCost??0).toFixed(2);
      this.yearUsage = parseFloat(billData.monthElecQuantity.dataInfo?.totalEleNum??0) + Math.round(this.currentMonthEle);
      this.yearFee = parseFloat(billData.monthElecQuantity.dataInfo?.totalEleCost??0).toFixed(2);
      
      this.stepEle = parseFloat(billData.stepElecQuantity?.[0].electricParticulars.totalYearPq || billData.monthElecQuantity.dataInfo?.totalEleNum || 0) + Math.round(this.currentMonthEle);
      if (this.settings.stepMode === '双月') this.stepEle = this.getBimonthlyStepEle();
    } catch (e) {
      console.log(e);
    }
  };

  async getData() {
    this.updateIndex();
    return this.data?.[this.index];
  };
  
  getUserInfo() {
    const userArray = this.data.map((item, index) => {
      const conNo_dst = item.userInfo.consNo_dst;
      const consName_dst = item.userInfo.consName_dst;
      console.log(`用户${index + 1}下标: ${index}, 户名: ${consName_dst}, 户号: ${conNo_dst}`);
      return {
        conNo_dst,
        consName_dst
      };
    });
    console.log(`多户显示：桌面小组件长按 —> 编辑小组件 —> Parameter 输入对应户号的下标数字`);
  };
  
  getEleLevel() {
    let dayElePq = [];
    if (this.settings.stepMode === '月') {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      dayElePq = this.dayElePq.filter(item => item.label.startsWith(currentMonth));
    };
    
    let bimonthElePq = [];
    if (this.settings.stepMode === '双月') {
      const data = this.monthElePq;
      if (data.length % 2 !== 0) {
        data.pop();
      }
      
      for (let i = 0; i < data.length; i += 2) {
        const mergedItem = {
          label: `${data[i].label}-${data[i+1].label}`,
          elePq: data[i].elePq + data[i+1].elePq,
          cost: data[i].cost + data[i+1].cost
        };
        bimonthElePq.push(mergedItem);
      }
    }

    let eleList = [];
    let total = 0;
    for (const { elePq } of this.settings.stepMode === '月' ? dayElePq : this.settings.stepMode === '双月' ? bimonthElePq : this.monthElePq) {
      const n = Number(elePq);
      total += n;
      if (this.settings.stepMode === '双月') total = n;
      const level = total > Number(this.wsgw.step_3) ? 3 : total > Number(this.wsgw.step_2) ? 2 : 1;
      eleList.push({ value: n, level });
    }

    return eleList
  };

  updateIndex() {
    const i = args.widgetParameter;
    if (i == 0 || !i || i == null) {
        this.name = this.settings.name;
        this.smallStackColor = this.settings.smallStackColor || this.smallStackColor;
        this.widgetStyle = this.settings.widgetStyle || this.widgetStyle;
        this.endColor = this.settings.endColor || this.endColor;
        return;
    }

    if (!this.data[i]) throw new Error("户号不存在");

    if (i == 1) {
        this.name = this.settings.name_1;
        this.smallStackColor = this.settings.smallStackColor_1 || this.smallStackColor;
        this.widgetStyle = this.settings.widgetStyle_1 || this.widgetStyle;
        this.endColor = this.settings.endColor_1 || this.endColor;
    } else if (i == 2) {
        this.name = this.settings.name_2;
        this.smallStackColor = this.settings.smallStackColor_2 || this.smallStackColor;
        this.widgetStyle = this.settings.widgetStyle_2 || this.widgetStyle;
        this.endColor = this.settings.endColor_2 || this.endColor;
    } 
    this.index = i;
  };

  last = (data = [], index = 1) => {
    return data[data.length - index];
  };
  // ######################################
  // ######################################
  async setWidgetStyle_1 (stack) {
    //  余额
    const headerStack = stack.addStack();
    const hlStack = headerStack.addStack();
    hlStack.layoutVertically();
    let balance = this.balance;
    let balanceTitle = this.isOverdue ? '电费欠费' : '电费余额';
    if (!this.isOverdue && this.isPostPaid) {
      balance = this.settings.showBalance === 'true' ? this.remainFee : this.monthFee;
      balanceTitle = this.settings.showBalance === 'true' ? '电费余额' : '上期电费';
    };
    const titleStack = hlStack.addStack();
    titleStack.layoutVertically();
    const title = titleStack.addText(balanceTitle);
    const balanceStack = hlStack.addStack();
    const balanceText = balanceStack.addText(`${balance}`);
    this.unit(balanceStack, '元', 11.5 * this.SCALE, this.widgetColor);
    title.font = Font.systemFont(12 * this.SCALE);
    title.textOpacity = 0.7;
    balanceText.font = Font.boldRoundedSystemFont(23 * this.SCALE);
    balanceText.minimumScaleFactor = 0.5;
    [title, balanceText].map(t => {
      t.textColor = this.widgetColor;
    });
    headerStack.addSpacer();
    let wsgw = headerStack.addImage(await this.getLogo());
    wsgw.imageSize = new Size(26 * this.SCALE, 26 * this.SCALE);
    if (this.smallStackColor !== '#3A9690') wsgw.tintColor = new Color(this.smallStackColor);
    stack.addSpacer();
    //  进度条
    const stepByMonth = this.settings.stepMode === '月';
    const stepByBimonth = this.settings.stepMode === '双月';
    const circlesPerRow = stepByMonth ? 10 : stepByBimonth ? 3 : 4; // 每排的圆圈数量
    const totalCircles = stepByMonth ? 30 : stepByBimonth ? 6 : 12; // 总圆圈数量
    const circleWidth = stepByMonth ? 10 * this.SCALE : stepByBimonth ? 44.07 * this.SCALE : 31.9 * this.SCALE;; // 每个圆圈的宽度
    const circleHeight = stepByMonth ? 10 * this.SCALE : 8 * this.SCALE; // 每个圆圈的高度
    const circleCornerRadius = stepByMonth ? 5 * this.SCALE : 4 * this.SCALE; // 圆角半径
    const circleGap = 4.6 * this.SCALE; // 圆圈之间的间距

    const eleList = this.getEleLevel();

    const levelGradients = [
      [new Color("#D6F2E1"), new Color("#98D2BC")], 
      [new Color("#FFC777"), new Color("#FFB043")], 
      [new Color("#F1939C"), new Color("#F07C82")], 
    ];
    const defaultColor = new Color("#81CDC7", 0.2);

    function gradientColors(startColor, endColor, steps) {
      const colors = [];
      if (steps === 1) {
        colors.push(startColor);
        return colors;
      }
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1); // 计算插值比例
        const r = Math.round(startColor.red * 255 + t * (endColor.red * 255 - startColor.red * 255));
        const g = Math.round(startColor.green * 255 + t * (endColor.green * 255 - startColor.green * 255));
        const b = Math.round(startColor.blue * 255 + t * (endColor.blue * 255 - startColor.blue * 255));
        const a = startColor.alpha + t * (endColor.alpha - startColor.alpha);

        const hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        colors.push(new Color(hexColor, a));
      }
      return colors;
    }

    const levelGradientColors = levelGradients.map(([start, end], i) => {
      const levelCount = eleList.filter(item => item.level === i + 1).length;
      return gradientColors(start, end, levelCount);
    });

    let levelIndex = { 1: 0, 2: 0, 3: 0 };

    for (let row = 0; row < Math.ceil(totalCircles / circlesPerRow); row++) {
      const rowStack = stack.addStack();
      rowStack.layoutHorizontally();
      rowStack.centerAlignContent();

      for (let col = 0; col < circlesPerRow; col++) {
        const index = row * circlesPerRow + col;
        if (index >= totalCircles) break;

        const circle = rowStack.addStack();
        circle.size = new Size(circleWidth, circleHeight);
        circle.cornerRadius = circleCornerRadius;

        const data = eleList[index]; 
        let fillColor = defaultColor;
        if (data && data.level >= 1 && data.level <= 3) {
          fillColor = levelGradientColors[data.level - 1][levelIndex[data.level]];
          levelIndex[data.level]++;
        }

        circle.backgroundColor = fillColor;

        if (col < circlesPerRow - 1) rowStack.addSpacer(circleGap);
      }

      if (row < Math.ceil(totalCircles / circlesPerRow) - 1) stack.addSpacer(circleGap);
    }
    // 底部数据
    const extraData = this.getWidgetData(this.settings.smallStyle_1 || '本月电量');
    stack.addSpacer();
    
    this.setList(stack, extraData, this.smallStackColor)
  };
  
  async setWidgetStyle_2 (stack) {
    const bodyStack = stack.addStack();
    //bodyStack.backgroundColor = Color.dynamic(new Color("#E2E2E7", 0), new Color("#2C2C2F"));
    bodyStack.cornerRadius = 14 * this.SCALE;
    bodyStack.layoutVertically();
    const headerStack = bodyStack.addStack();
    headerStack.setPadding(8 * this.SCALE, 12 * this.SCALE, 0, 12 * this.SCALE);
    headerStack.layoutVertically();

    let balance = this.balance;
    let balanceTitle = this.isOverdue ? '电费欠费' : '电费余额';
    if (!this.isOverdue && this.isPostPaid) {
      balance = this.settings.showBalance === 'true' ? this.remainFee : this.monthFee;
      balanceTitle = this.settings.showBalance === 'true' ? '电费余额' : '上期电费';
    };

    const title = headerStack.addText(balanceTitle);
    title.font = Font.systemFont(12 * this.SCALE);
    title.textColor = this.widgetColor;
    title.textOpacity = 0.7;
    const balanceStack = headerStack.addStack();
    const balanceText = balanceStack.addText(balance);
    balanceText.minimumScaleFactor = 0.5;
    balanceText.font = Font.boldRoundedSystemFont(22 * this.SCALE);
    balanceText.minimumScaleFactor = 0.5;
    const color = this.widgetColor;
    balanceText.textColor = color;
    this.unit(balanceStack, '元', 6 * this.SCALE, color);
    balanceStack.addSpacer();
    balanceStack.centerAlignContent();

    const logoImage = balanceStack.addImage(await this.getLogo());
    logoImage.imageSize = new Size(24 * this.SCALE, 24 * this.SCALE);

    bodyStack.addSpacer();
    const mainStack = bodyStack.addStack();
    mainStack.setPadding(8 * this.SCALE, 12 * this.SCALE, 8 * this.SCALE, 12 * this.SCALE);
    mainStack.cornerRadius = 14 * this.SCALE;
    mainStack.backgroundColor = Color.dynamic(new Color("#E2E2E7", 0.3), new Color("#2C2C2F", 1));
    mainStack.layoutVertically();

    this.setList(
      mainStack,
      this.getWidgetData(this.settings.smallStyle_2_up || '本月电量'),
      this.smallStackColor
    );

    mainStack.addSpacer();

    this.setList(
      mainStack,
      this.getWidgetData(this.settings.smallStyle_2_down || '近日用电'),
      this.endColor
    );
  };
  
  async setWidgetStyle_3 (stack, color) {
    //  标题
    this.setTitle(stack, new Color(color), new Color(color));
    stack.addSpacer();
    //  进度条
    stack.addImage(this.wideProgressBar());

    const extraData = this.getWidgetData(this.settings.smallStyle_1 || `年度电量`)
    if (extraData) {
      const extraDataStack = stack.addStack();
      extraDataStack.centerAlignContent();
      const extraTitle = extraDataStack.addText(extraData[0]);
      extraDataStack.addSpacer();
      const extraValue = extraDataStack.addText(extraData[1]);
      const extraUnit = extraDataStack.addText(extraData[2]);
      extraTitle.font = Font.regularRoundedSystemFont(12 * this.SCALE);
      extraUnit.font = Font.regularRoundedSystemFont(12 * this.SCALE);
      extraValue.font = Font.regularRoundedSystemFont(14 * this.SCALE);
      [extraTitle, extraValue, extraUnit].map(t => {
        t.textColor = new Color(color);
      });
    }

    stack.addSpacer();
    //  余额
    let balance = this.balance;
    let balanceTitle = this.isOverdue ? '电费欠费' : '电费余额';
    if (!this.isOverdue && this.isPostPaid) {
      balance = this.settings.showBalance === 'true' ? this.remainFee : this.monthFee;
      balanceTitle = this.settings.showBalance === 'true' ? '电费余额' : '上期电费';
    };
    const downStack = stack.addStack();
    const titleStack = downStack.addStack();
    titleStack.layoutVertically();
    const balanceTitleText = titleStack.addText(balanceTitle);
    const balanceStack = titleStack.addStack();
    const balanceText = balanceStack.addText(`${balance}`);
    balanceStack.addSpacer(1);
    this.unit(balanceStack, '元', 8.5 * this.SCALE, new Color(color))
    balanceTitleText.font = Font.systemFont(12 * this.SCALE);
    balanceTitleText.textOpacity = 0.7;
    balanceText.font = Font.semiboldRoundedSystemFont(20 * this.SCALE);
    [balanceTitleText, balanceText].map(t => {
      t.textColor = new Color(color);
    });
    downStack.addSpacer();
    let wsgw = downStack.addImage(await this.getLogo());
    wsgw.tintColor = new Color(color);
    wsgw.imageSize = new Size(36 * this.SCALE, 36 * this.SCALE);
  };
  
  setWidgetStyle_4 (stack, color) {

    const step = this.stepEleText();

    const gaugeImage = this.gaugeChart();
    const bodyStack = stack.addStack();
    const mainColor = new Color(this.lastColor);
    bodyStack.layoutVertically();
    bodyStack.backgroundImage = gaugeImage;
    bodyStack.addSpacer();

    const arr = this.getWidgetData(this.settings.smallStyle_4 || '本月电量');
    if (arr === '自定户名') {
      const iconStack = bodyStack.addStack();
      iconStack.addSpacer();
      const iconSFS = SFSymbol.named('house.fill');
      iconSFS.applyHeavyWeight();
      let icon = iconStack.addImage(iconSFS.image);
      icon.tintColor = mainColor;
      icon.imageSize = new Size(24 * this.SCALE, 24 * this.SCALE);
      iconStack.addSpacer();
      bodyStack.addSpacer(3 * this.SCALE);
      const nameStack = bodyStack.addStack();
      nameStack.addSpacer();
      const name = nameStack.addText(this.name || '国家电网');
      nameStack.addSpacer();
      name.font = Font.mediumSystemFont(16 * this.SCALE);
      name.textColor = mainColor;
    } else if(arr === '阶梯电量') {
      const progress = step.progress;
      const icon = step.icon;
      this.createCenteredStack(bodyStack, '阶梯电量', mainColor);
      bodyStack.addSpacer(5 * this.SCALE);
      this.createCenteredText(bodyStack, progress, '', 4, 16 * this.SCALE, mainColor, 1, icon);
    } else {
      this.createCenteredStack(bodyStack, arr[0], mainColor);
      bodyStack.addSpacer(5 * this.SCALE);
      this.createCenteredText(bodyStack, arr[1], arr[2], 5, 16 * this.SCALE, mainColor, 1);
    };

    bodyStack.addSpacer(10 * this.SCALE);

    this.setUpdateStack(bodyStack, mainColor);

    bodyStack.addSpacer(6 * this.SCALE);

    const downStack = bodyStack.addStack();
    downStack.setPadding(0, 15 * this.SCALE, 5 * this.SCALE, 15 * this.SCALE)
    const gradient = new LinearGradient();
    gradient.locations = [0, 1];
    gradient.colors = [
      new Color('#00706C', 0),
      new Color('#00706C', 0.05)
    ];
    gradient.startPoint = new Point(0, 0);
    gradient.endPoint = new Point(0, 1);
    downStack.cornerRadius = 12 * this.SCALE;
    downStack.backgroundGradient = gradient;
    downStack.layoutVertically();
    downStack.centerAlignContent();
    let balance = this.balance;
    let balanceTitle = this.isOverdue ? '电费欠费' : '电费余额';
    if (!this.isOverdue && this.isPostPaid) {
      balance = this.settings.showBalance === 'true' ? this.remainFee : this.monthFee;
      balanceTitle = this.settings.showBalance === 'true' ? '电费余额' : '上期电费';
    };
    const titleStack = downStack.addStack();
    titleStack.addSpacer();
    const balanceTitleText = titleStack.addText(balanceTitle);
    titleStack.addSpacer();
    const balanceStack = downStack.addStack();
    balanceStack.addSpacer();
    const balanceText = balanceStack.addText(`${balance}`);
    this.unit(balanceStack, '元', 8 * this.SCALE, this.widgetColor)
    balanceStack.addSpacer();
    balanceTitleText.font = Font.systemFont(12 * this.SCALE);
    balanceTitleText.textOpacity = 0.7;
    balanceText.font = Font.semiboldRoundedSystemFont(20 * this.SCALE);
    [balanceTitleText, balanceText].map(t => {
      t.textColor = this.widgetColor;
    });
  };

  renderSmall = async (w) => {
    const padding = 12 * this.SCALE;
    w.setPadding(padding, padding, padding, padding);
    const bodyStack = w.addStack();
    const smallColor = this.smallStackColor;
    bodyStack.layoutVertically();
    if (this.widgetStyle ==='1') {
      bodyStack.setPadding(3 * this.SCALE, 3 * this.SCALE, 3 * this.SCALE, 3 * this.SCALE);
      await this.setWidgetStyle_1(bodyStack);
    } else if (this.widgetStyle ==='2') {
      await this.setWidgetStyle_2(bodyStack);
    } else if (this.widgetStyle ==='3') {
      bodyStack.setPadding(3 * this.SCALE, 3 * this.SCALE, 3 * this.SCALE, 3 * this.SCALE);
      await this.setWidgetStyle_3(bodyStack, smallColor);
    } else {
      this.setWidgetStyle_4(bodyStack, smallColor);
    };
    return w;
  };

  renderMedium = async (w) => {
    w.setPadding(0, 0, 0, 0);
    w.backgroundColor = Color.dynamic(new Color(this.settings.rightDayColor || "#E2E2E7"), new Color(this.settings.rightNightColor || "#2C2C2F"));
    const updateColor = new Color('#2F6E6B');
    const bodyStack = w.addStack();
    //  左侧stack
    const leftStack = bodyStack.addStack();
    leftStack.layoutVertically();
    leftStack.setPadding(0, 15, 0, 15);
    leftStack.size = new Size(this.size.leftStack / this.SCALE, 0);
    leftStack.backgroundColor = Color.dynamic(new Color(this.settings.leftDayColor || "#F2F2F7"), new Color(this.settings.leftNightColor || "#1C1C1E"));
    //  标题及LOGO
    if (this.settings.enableName === 'true')  {
      leftStack.addSpacer(15);
      this.setTitle(leftStack, new Color('#0db38e'), this.widgetColor);
    } else {
      leftStack.addSpacer();
      const logoStack = leftStack.addStack();
      logoStack.addSpacer();
      let wsgw = logoStack.addImage(await this.getLogo());
      wsgw.imageSize = new Size(this.size.logo, this.size.logo);
      logoStack.addSpacer();
    };
    leftStack.addSpacer();
    this.setUpdateStack(leftStack, updateColor);
    leftStack.addSpacer(2);
    const balanceStackBgcolor = Color.dynamic(new Color(this.settings.rightDayColor || "#E2E2E7"), new Color(this.settings.rightNightColor || "#2C2C2F"));
    this.setBalanceStack(leftStack, balanceStackBgcolor, 8 * this.SCALE, this.size.balance, this.size.smallFont, 4.5);
    leftStack.addSpacer(15);
    this.split(bodyStack, 0.5, 0, true);
    //  右侧Stack
    const rightStack = bodyStack.addStack();
    rightStack.setPadding(15, 15, 15, 15);
    rightStack.layoutVertically();
    //  Row
    this.setRow(rightStack, this.settings.firstRow || '组合一');
    rightStack.addSpacer();
    this.split(rightStack, 0, 0.5 * this.SCALE);
    rightStack.addSpacer();
    this.setRow(rightStack, this.settings.secondRow || '组合二');
    rightStack.addSpacer();
    this.split(rightStack, 0, 0.5 * this.SCALE);
    rightStack.addSpacer();
    this.setRow(rightStack, this.settings.thirdRow || '阶梯电量');

    return w;
  };
  // ######################################
  // ######################################
  init = async () => {
    try {
      if (this.settings.useICloud === 'true') this.fm = FileManager.iCloud();
      this.cachePath = this.fm.joinPath(this.fm.documentsDirectory(), this.CACHE_FOLDER);
      const scale = this.getWidgetScaleFactor();
      this.barHeight = scale >= 0.95 ? 20 : scale >= 0.90 ? 17.5 : scale >= 0.85 ? 15 : scale > 0.80 ? 12 : 12;
      this.SCALE = this.settings.SCALE || scale;
      Object.keys(this.wsgw).forEach(key => {
        this.wsgw[key] = this.settings[key] ? this.settings[key] : this.wsgw[key]
      })
      //  湖南地区
      /*
      const step = this.getStepsByCurrentMonth();
      this.wsgw.step_2 = step.step_2;
      this.wsgw.step_3 = step.step_3;
      */
      
      Object.keys(this.size).forEach(key => {
        this.size[key] = this.settings[key] ? this.settings[key] : this.size[key]
        this.size[key] = this.size[key] * this.SCALE;
      })
      
      //console.log(this.settings);

    } catch (e) {
      console.log(e);
    }
    await this.getBillData();
  };
  
  getStepsByCurrentMonth() {
    const currentMonth = new Date().getMonth() + 1;
    const springAutumnMonths = [3, 4, 5, 9, 10, 11];
    if (springAutumnMonths.includes(currentMonth)) {
      return {
        step_2: 200,
        step_3: 350
      };
    } else {
      return {
        step_2: 200,
        step_3: 450
      };
    }
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/barColor.png',
            type: 'color',
            title: '进度条颜色',
            defaultValue : '#0db38e',
            val: 'barColor',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/pointerColor.png',
            type: 'color',
            title: '指针颜色',
            defaultValue : '#0db38e',
            val: 'pointerColor',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/chartColor.png',
            type: 'color',
            title: '图表颜色',
            defaultValue : '#0db38e',
            val: 'chartColor',
          },
        ],
      },
      {
        title: '背景颜色',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/leftDayColor.png',
            type: 'color',
            title: '左栏白天颜色',
            defaultValue : '#F2F2F7',
            val: 'leftDayColor',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/leftNightColor.png',
            type: 'color',
            title: '左栏晚上颜色',
            defaultValue : '#1C1C1E',
            val: 'leftNightColor',
          },
        ],
      },
      {
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/rightDayColor.png',
            type: 'color',
            title: '右栏白天颜色',
            defaultValue : '#E2E2E7',
            val: 'rightDayColor',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/rightNightColor.png',
            type: 'color',
            title: '右栏晚上颜色',
            defaultValue : '#2C2C2F',
            val: 'rightNightColor',
          },
        ],
      },
      {
        title: '重置颜色',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/clear.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/SCALE.png',
            type: 'input',
            title: '全局缩放比例',
            placeholder : '1',
            desc: '不同机型会造成组件显示问题，适当调整该参数，如0.95、0.9，视小组件显示效果自行调整',
            val: 'SCALE',
          },
        ],
      },
      {
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/logo.png',
            type: 'input',
            title: 'LOGO大小',
            placeholder : '48',
            desc: '左栏LOGO尺寸，默认48',
            val: 'logo',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/leftStack.png',
            type: 'input',
            title: '左栏尺寸',
            placeholder : '130',
            desc: '默认130',
            val: 'leftStack',
          },
        ],
      },
      {
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/bigFont.png',
            type: 'input',
            title: '大号文字',
            placeholder : '18',
            desc: '默认18',
            val: 'bigFont',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallFont.png',
            type: 'input',
            title: '小号文字',
            placeholder : '12',
            desc: '默认12',
            val: 'smallFont',
          },
        ],
      },
      {
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/balance.png',
            type: 'input',
            title: '余额尺寸',
            placeholder : '20',
            desc: '默认20',
            val: 'balance',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/subSpacer.png',
            type: 'input',
            title: '下标偏移',
            placeholder : '6.5',
            desc: '默认6.5',
            val: 'subSpacer',
          },
        ],
      },
      {
        title: '重置尺寸',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/clear.png',
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
        title: '中组件显示设置',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/firstRow.png',
            type: 'select',
            title: '第一栏显示内容',
            options: ['组合一', '组合二', '组合三', '阶梯电量'],
            val: 'firstRow',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/secondRow.png',
            type: 'select',
            title: '第二栏显示内容',
            options: ['组合二', '组合一', '组合三', '阶梯电量'],
            val: 'secondRow',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/thirdRow.png',
            type: 'select',
            title: '第三栏显示内容',
            options: ['阶梯电量', '组合一', '组合二', '组合三'],
            val: 'thirdRow',
          },
        ],
      },
      {
        title: '组合一显示内容',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/group1Left.png',
            type: 'select',
            title: '组合一左侧显示内容',
            options: ['上期电费', '上期电量', '年度电费', '年度电量', '日用电图表', '月用电图表', '近日用电', '本月电量', '电费余额', '不显示'],
            val: 'group1Left',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/group1Right.png',
            type: 'select',
            title: '组合一右侧显示内容',
            options: ['上期电量', '上期电费', '年度电费', '年度电量', '日用电图表', '月用电图表', '近日用电', '本月电量', '电费余额', '不显示'],
            val: 'group1Right',
          },
        ],
      },
      {
        title: '组合二显示内容',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/group2Left.png',
            type: 'select',
            title: '组合二左侧显示内容',
            options: ['年度电费', '年度电量', '上期电费', '上期电量', '日用电图表', '月用电图表', '近日用电', '本月电量', '电费余额', '不显示'],
            val: 'group2Left',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/group2Right.png',
            type: 'select',
            title: '组合二右侧显示内容',
            options: ['年度电量', '年度电费', '上期电费', '上期电量', '日用电图表', '月用电图表', '近日用电', '本月电量', '电费余额', '不显示'],
            val: 'group2Right',
          },
        ],
      },
      {
        title: '组合三显示内容',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/group3Left.png',
            type: 'select',
            title: '组合三左侧显示内容',
            options: ['年度电费', '年度电量', '上期电费', '上期电量', '日用电图表', '月用电图表', '近日用电', '本月电量', '电费余额', '不显示'],
            val: 'group3Left',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/group3Right.png',
            type: 'select',
            title: '组合三右侧显示内容',
            options: ['年度电量', '年度电费', '上期电费', '上期电量', '日用电图表', '月用电图表', '近日用电', '本月电量', '电费余额', '不显示'],
            val: 'group3Right',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/dayAmount.png',
            type: 'select',
            title: '日用电图表显示天数',
            options: ['5', '6', '7', '8', '9', '10', '11', '12'],
            val: 'dayAmount',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/monthAmount.png',
            type: 'select',
            title: '月用电图表显示月数',
            options: ['5', '6', '7', '8', '9', '10', '11', '12'],
            val: 'monthAmount',
          },
        ],
      },
      {
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/balance.png',
            type: 'switch',
            title: '后付费用户左栏显示余额',
            desc: '',
            val: 'showBalance',
          },
        ],
      },
      {
        title: '小组件显示设置',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallLeft.png',
            type: 'select',
            title: '小组件1、3显示内容',
            options: ['年度电量', '年度电费', '上期电费', '上期电量', '近日用电', '本月电量', '电费余额'],
            val: 'smallStyle_1',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallLeft.png',
            type: 'select',
            title: '小组件4显示内容',
            options: ['年度电量', '年度电费', '上期电费', '上期电量', '近日用电', '本月电量', '电费余额', '阶梯电量', '自定户名'],
            val: 'smallStyle_4',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallStyle_2_up.png',
            type: 'select',
            title: '小组件2显示内容1',
            options: ['年度电费', '年度电量', '上期电费', '上期电量', '近日用电', '本月电量', '电费余额'],
            val: 'smallStyle_2_up',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallStyle_2_down.png',
            type: 'select',
            title: '小组件2显示内容2',
            options: ['年度电费', '年度电量', '上期电费', '上期电量', '近日用电', '本月电量', '电费余额'],
            val: 'smallStyle_2_down',
          },
        ],
      },
      {
        title: '图片设置',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/logoImg.png',
            type: 'select',
            title: 'LOGO显示',
            options: ['国家电网', '铁塔', '自定义', '不显示'],
            val: 'logoImg',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/customizeUrl.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/stepMode.png',
            type: 'select',
            title: '阶梯电量计算方式',
            options: ['年', '月', '双月'],
            desc: '',
            val: 'stepMode',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/step_2.png',
            type: 'input',
            title: '二档电量',
            placeholder : '2520',
            desc: '第二档阶梯电量，默认为2520，各地数据以国网app为准',
            val: 'step_2',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/step_3_month.png',
            type: 'input',
            title: '三档电量',
            placeholder : '4800',
            desc: '第三档阶梯电量，默认为4800，各地数据以国网app为准',
            val: 'step_3',
          },
        ],
      },
    ]).catch((e) => {
      console.log(e);
    });
  };

  setUserConfig = async () => {
    return this.renderAppView([
      {
        title: '',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/enableName.png',
            title: '中组件开启户名显示',
            type: 'switch',
            val: 'enableName',
          },
        ],
      },
      {
        title: '多户配置',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/name.png',
            type: 'input',
            title: '户名一',
            desc: '自定义小尺寸组件标题，替代默认“国家电网”',
            val: 'name',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/widgetStyle.png',
            type: 'select',
            title: '小组件样式',
            options: ['1', '2', '3', '4'],
            val: 'widgetStyle',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallStackColor.png',
            type: 'color',
            defaultValue : '#3A9690',
            title: '小组件颜色1',
            val: 'smallStackColor',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallStackColor.png',
            type: 'color',
            defaultValue : '#3A9690',
            title: '小组件颜色2',
            val: 'endColor',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/name_1.png',
            type: 'input',
            title: '户名二',
            desc: '自定义小尺寸组件标题，替代默认“国家电网”',
            val: 'name_1',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/widgetStyle_1.png',
            type: 'select',
            title: '小组件样式',
            options: ['1', '2', '3', '4'],
            val: 'widgetStyle_1',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallStackColor_1.png',
            type: 'color',
            defaultValue : '#3A9690',
            title: '小组件颜色1',
            val: 'smallStackColor_1',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallStackColor_1.png',
            type: 'color',
            defaultValue : '#3A9690',
            title: '小组件颜色2',
            val: 'endColor_1',
          },
        ],
      },
      {
        title: '',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/name_2.png',
            type: 'input',
            title: '户名三',
            desc: '自定义小尺寸组件标题，替代默认“国家电网”',
            val: 'name_2',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/widgetStyle_2.png',
            type: 'select',
            title: '小组件样式',
            options: ['1', '2', '3', '4'],
            val: 'widgetStyle_2',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallStackColor_2.png',
            type: 'color',
            defaultValue : '#3A9690',
            title: '小组件颜色1',
            val: 'smallStackColor_2',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallStackColor_2.png',
            type: 'color',
            defaultValue : '#3A9690',
            title: '小组件颜色2',
            val: 'endColor_2',
          },
        ],
      },
      {
        title: '重置颜色',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/clear.png',
            title: '重置颜色',
            desc: '重置当前颜色配置',
            name: 'reset',
            val: 'reset',
            onClick: () => {
              const propertiesToDelete = ['smallStackColor', 'endColor', 'smallStackColor_1', 'endColor_1', 'smallStackColor_2', 'endColor_2'];
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
      this.registerAction({
        title: '组件配置',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/useICloud.png',
            type: 'switch',
            title: 'iCloud',
            val: 'useICloud',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/update.png',
            type: 'input',
            title: '脚本更新',
            name: 'update',
            onClick: async () => {
              await this.checkAndUpdateScript();
            },
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/interval.png',
            type: 'input',
            placeholder : '360',
            title: '刷新时间',
            desc: '电费数据刷新时间，单位：分钟，默认360分钟',
            val: 'interval',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/reset.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/size.png',
            title: '尺寸配置',
            type: 'input',
            onClick: () => {
              return this.setSizeConfig();
            },
          },
          {
            name: 'show',
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/show.png',
            title: '显示配置',
            type: 'input',
            onClick: () => {
              return this.setShowConfig();
            },
          },
          {
            name: 'user',
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/user.png',
            title: '多户配置',
            type: 'input',
            onClick: () => {
              return this.setUserConfig();
            },
          },
        ],
      });

      this.registerAction({
        title: '',
        menu: [
          {
            name: 'basic',
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/basic.png',
            title: '基础设置',
            type: 'input',
            onClick: () => {
              return this.setWidgetConfig();
            },
          },
          {
            name: 'reload',
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/reload.png',
            title: '重载组件',
            type: 'input',
            onClick: () => {
              this.reopenScript();
            },
          },
        ],
      });
     }
  };
};

await Runing(Widget, args.widgetParameter, false);
