// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: mobile-alt;
/*
 * @author: 脑瓜
 * @feedback https://t.me/Scriptable_CN
 * telegram: @anker1209
 * version: 2.0
 * update: 2024/11/18
 * 原创UI，修改套用请注明来源
 * 使用该脚本需DmYY依赖及添加重写，参数获取及重写作者@Yuheng0101
 * 参数获取及boxjs订阅: https://github.com/ChinaTelecomOperators/ChinaMobile/releases/tag/Prerelease-Alpha
 * 重写: https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/ChinaMobile/scripable.qx.conf
 * 依赖: https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/DmYY.js
 * boxjs填写手机号码
 * 打开移动app获取参数（手机验证码登录，人脸登录无效）
*/

if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '中国移动';
    this.en = 'ChinaUnicom_2024';
    this.logo = 'https://raw.githubusercontent.com/anker1209/icon/main/zgyd-big.png';
    this.verticalLogo = 'https://raw.githubusercontent.com/anker1209/icon/main/zgyd.png';
    this.Run();
  }

  fm = FileManager.local();
  CACHE_FOLDER = Script.name();
  cachePath = null;

  gradient = false;

  flowColorHex = '#32CD32';
  voiceColorHex = '#F86527';

  ringStackSize = 65;
  ringTextSize = 14;
  feeTextSize = 21;
  textSize = 13;
  smallPadding = 13;
  padding = 10;
  logoScale = 0.24;
  SCALE = 1;
  interval = 360;
  data = {};

  canvSize = 178;
  canvWidth = 18;
  canvRadius = 80;
  
  widgetStyle = '1';

  fee = {
    title: '话费剩余',
    icon: 'antenna.radiowaves.left.and.right',
    number: 0,
    iconColor: new Color('#0080CB'),
    unit: '元',
    en: '¥',
  };
  
  flow = {
    percent: 0,
    title: '流量剩余',
    number: 0,
    unit: 'MB',
    en: 'MB',
    icon: 'antenna.radiowaves.left.and.right',
    iconColor: new Color('#32CD32'),
    FGColor: new Color(this.flowColorHex),
    BGColor: new Color(this.flowColorHex, 0.2),
    colors: [],
  };

  voice = {
    percent: 0,
    title: '语音剩余',
    number: 0,
    unit: '分钟',
    en: 'MIN',
    icon: 'phone.badge.waveform.fill',
    iconColor: new Color('#F86527'),
    FGColor: new Color(this.voiceColorHex),
    BGColor: new Color(this.voiceColorHex, 0.2),
    colors: [],
  };
  
  point = {
    title: '更新时间',
    number: '',
    unit: '',
    icon: 'arrow.2.circlepath',
    iconColor: new Color('fc6d6d'),
  };

  init = async () => {
    try {
      if (this.settings.useICloud === 'true') this.fm = FileManager.iCloud();
      this.cachePath = this.fm.joinPath(this.fm.documentsDirectory(), this.CACHE_FOLDER);
      const scale = this.getWidgetScaleFactor();
      this.SCALE = this.settings.SCALE || scale;

      const {
        step1,
        step2,
        logoColor,
        flowIconColor,
        voiceIconColor,
        gradient,
        widgetStyle,
        builtInColor,
      } = this.settings;
      
      this.gradient = gradient === 'true';

      // 设置图标颜色
      if (builtInColor === 'true') {
        const [feeColor, flowColor, voiceColor] = this.getIconColorSet();
        this.fee.iconColor = new Color(feeColor);
        this.flow.iconColor = new Color(flowColor);
        this.voice.iconColor = new Color(voiceColor);
      } else {
        this.fee.iconColor = logoColor ? new Color(logoColor) : this.fee.iconColor;
        this.flow.iconColor = flowIconColor ? new Color(flowIconColor) : this.flow.iconColor;
        this.voice.iconColor = voiceIconColor ? new Color(voiceIconColor) : this.voice.iconColor;
      }

      // 设置流量与语音圆环的颜色
      this.flowColorHex = step1 || this.flowColorHex;
      this.voiceColorHex = step2 || this.voiceColorHex;
      this.flow.BGColor = new Color(this.flowColorHex, 0.2);
      this.voice.BGColor = new Color(this.voiceColorHex, 0.2);
      this.flow.FGColor = new Color(this.flowColorHex);
      this.voice.FGColor = new Color(this.voiceColorHex);

      // 设置小组件的样式与刷新时间
      this.widgetStyle = widgetStyle || this.widgetStyle;
      this.interval = this.settings.interval || this.interval;

      // 尺寸与缩放
      const sizeSettings = [
        'ringStackSize',
        'ringTextSize',
        'feeTextSize',
        'textSize',
        'smallPadding',
        'padding',
      ];

      for (const key of sizeSettings) {
        this[key] = this.settings[key] ? parseFloat(this.settings[key]) : this[key];
        this[key] = this[key] * this.SCALE;
      }

      // 圆环渐变效果颜色属性
      if (this.gradient) {
        this.flow.colors = this.arrColor();
        this.voice.colors = this.arrColor();
        this.flow.BGColor = new Color(this.flow.colors[1], 0.2);
        this.voice.BGColor = new Color(this.voice.colors[1], 0.2);
        this.flow.FGColor = this.gradientColor(this.flow.colors, 360);
        this.voice.FGColor = this.gradientColor(this.voice.colors, 360);
        this.flowColorHex = this.flow.colors[1];
        this.voiceColorHex = this.voice.colors[1];
      }

      console.log(this.settings);
    } catch (e) {
      console.error(e);
    }
    await this.getData();
    this.point.number = this.getUpdataTime('balanceData.json');
  };

  async getData() {
    const dataName = '移动数据';
    const url = 'https://api.example.com/10086/query';

    try {
      this.data = await this.httpRequest(dataName, url, true, {}, 'balanceData.json');
      if (!this.data)  throw new Error("请求失败,请安装模块,检查boxjs配置");

      this.fee.number = this.data.fee.curFeeTotal;
      const flow = this.handleFlow(this.data.plan.planRemianFlowListRes);
      const voice = this.handleVoice(this.data.plan.planRemianVoiceListRes);

      console.log(flow);
      console.log(voice);

      this.flow.number = flow.remain;
      this.flow.unit = flow.unit;
      this.flow.en = flow.unit;
      this.flow.percent = flow.percent;
      this.flow.title = flow.title;

      this.voice.number = voice.number;
      this.voice.percent = voice.percent;
      this.voice.title = voice.title;

    } catch (e) {
      console.log(`接口数据异常：请检查 BoxJS 重写`);
      console.log(e);
    }
  };
  
  handleVoice(inputData = {}) {
    let result = {
      voiceData: [
        {
          title: '通话剩余',
          number: '--',
          voiceSumNum: '',
          unit: '分钟',
          percent: 0,
        }
      ]
    };

    const remainingVoiceInfo = inputData['planRemianVoiceInfoRes'];

    const filteredVoiceInfo = remainingVoiceInfo
        ? remainingVoiceInfo.filter(item => item['voicetype'] === '0')
        : [];

    let number = result.voiceData[0].number;
    let voiceSumNum = '';
    let percent = 0;
    let title = result.voiceData[0].title;
    const unit = result.voiceData[0].unit;

    if (filteredVoiceInfo.length > 0) {
      if (Number(filteredVoiceInfo[0]['voiceRemainNum']) === 0 && inputData['outPlanInfoRes']) {
        if (inputData['outPlanInfoRes'].length > 0 && Number(inputData['outPlanInfoRes'][0]['usageAmount']) > 0) {
          number = inputData['outPlanInfoRes'][0]['usageAmount'];
        } else {
          number = 0;
        }
      title = '套外已用';
      } else if (Number(filteredVoiceInfo[0]['voiceRemainNum']) >= 9999 || filteredVoiceInfo[0]['voiceRemainNum'] === 'N') {
        title = '通话已用';
        number = filteredVoiceInfo[0]['voiceUsdNum'];
        percent = 100;
      } else {
        number = filteredVoiceInfo[0]['voiceRemainNum'];
        voiceSumNum = filteredVoiceInfo[0]['voiceSumNum'];
        percent = ((Number(number) / Number(voiceSumNum)) * 100).toFixed(2);
      }
    } else {
      number = 0;
    }

    result.voiceData[0].number = String(number);
    result.voiceData[0].title = title;
    result.voiceData[0].voiceSumNum = String(voiceSumNum);
    result.voiceData[0].percent = percent;

    return result.voiceData[0];
  };

  handleFlow(inputData = {}) {
    let result = {
      flowDetails: {
        title: '流量剩余',
        color: 'black',
        remain: '--',
        total: '',
        unit: 'GB',
        percent: 0
      }
    };

    let flowTitle = '流量剩余';
    let flowColor = 'black';
    let flowRemainNum = '';
    let flowSumNum = '';
    let flowPercent = 0;

    const inPlanFlowInfo = inputData['planRemianFlowRes']
      ? inputData['planRemianFlowRes'].filter(item => item['flowtype'] === '0')
      : [];
    const outPlanInfo = inputData['outPlanInfoRes'] || [];

    if (inputData['limitType'] === '01' && inPlanFlowInfo.length > 0) {
      if (
        (inputData['state'] === '00' && parseFloat(inPlanFlowInfo[0]['flowRemainNum']) > 0 && inPlanFlowInfo[0]['unit'] === '03') || 
        (Number(inPlanFlowInfo[0]['flowRemainNum']) < 9999 && inPlanFlowInfo[0]['unit'] === '04' && parseFloat(inPlanFlowInfo[0]['flowRemainNum']) > 0)
        ) {
        flowRemainNum = inPlanFlowInfo[0]['flowRemainNum'];
        flowSumNum = inPlanFlowInfo[0]['flowSumNum'];
        flowPercent = ((Number(flowRemainNum) / Number(flowSumNum)) * 100).toFixed(2);
      } else if (inputData['state'] === '00' && parseFloat(inPlanFlowInfo[0]['flowRemainNum']) === '0') {
        if (inputData['outPlanInfoRes'] && parseFloat(inputData['outPlanInfoRes'][0]['usageAmount']) > 0) {
          flowRemainNum = inputData['outPlanInfoRes'][0]['usageAmount'];
          inPlanFlowInfo[0]['unit'] = inputData['outPlanInfoRes'][0]['unit'];
        } else {
          flowRemainNum = 0;
        }
        flowTitle = '套外已用';
        flowColor = 'RED';
      } else if (['05', '07'].includes(inputData['state'])) {
        flowTitle = '国内已用';
        flowColor = 'RED';
        flowRemainNum = inputData['usedtotal'];
        flowPercent = 100;
        inPlanFlowInfo[0]['unit'] = inputData['unit'];
      } else if (['04', '06'].includes(inputData['state'])) {
        flowTitle = '套外已用';
        flowColor = 'RED';
        if (inputData['outPlanInfoRes'] && parseFloat(inputData['outPlanInfoRes'][0]['usageAmount']) > 0) {
          flowRemainNum = inputData['outPlanInfoRes'][0]['usageAmount'];
          inPlanFlowInfo[0]['unit'] = inputData['outPlanInfoRes'][0]['unit'];
        } else {
          flowRemainNum = 0;
        }
      } else if ((Number(inPlanFlowInfo[0]['flowRemainNum']) >= 9999 && inPlanFlowInfo[0]['unit'] === '04') || inPlanFlowInfo[0]['flowRemainNum'] === 'N') {
        flowTitle = '通用已用';
        flowPercent = 100;
        flowRemainNum = inPlanFlowInfo[0]['flowUsdNum'];
      }
    } else if (inputData['limitType'] === '02' && inPlanFlowInfo.length > 0) {
      if (inputData['state'] === '00') {
        flowTitle = '通用已用';
        flowRemainNum = inPlanFlowInfo[0]['flowUsdNum'];
        flowPercent = 100;
      } else if (inputData['state'] === '01') {
        flowTitle = '通用已用';
        flowColor = 'RED';
        flowRemainNum = inPlanFlowInfo[0]['flowUsdNum'];
        flowPercent = 100;
      } else if (inputData['state'] === '03') {
        flowTitle = '国内已用';
        flowColor = 'RED';
        flowRemainNum = inPlanFlowInfo[0]['flowUsdNum'];
        flowPercent = 100;
      } else if (['05', '07'].includes(inputData['state'])) {
        flowTitle = '国内已用';
        flowColor = 'RED';
        flowRemainNum = inputData['usedtotal'];
        inPlanFlowInfo[0]['unit'] = inputData['unit'];
        flowPercent = 100;
      } else if (['04', '06'].includes(inputData['state'])) {
        flowTitle = '套外已用';
        flowColor = 'RED';
        flowPercent = 100;
        if (inputData['outPlanInfoRes'] && parseFloat(inputData['outPlanInfoRes'][0]['usageAmount']) > 0) {
          flowRemainNum = inputData['outPlanInfoRes'][0]['usageAmount'];
          inPlanFlowInfo[0]['unit'] = inputData['outPlanInfoRes'][0]['unit'];
        } else {
          flowRemainNum = 0;
          flowPercent = 0;
        }
      }
    } else if (inputData['limitType'] === '03' && inPlanFlowInfo.length > 0) {
      flowTitle = '通用已用';
      flowPercent = 100;
      flowRemainNum = inPlanFlowInfo[0]['flowUsdNum'];
    }

    if (inPlanFlowInfo.length === 0 && outPlanInfo.length !== 0) {
      flowTitle = '套外已用';
      flowRemainNum = outPlanInfo[0]['usageAmount'];
      inPlanFlowInfo[0] = { unit: outPlanInfo[0]['unit'] };
      flowColor = 'RED';
      flowPercent = 0;
    }

    const formattedRemain = inPlanFlowInfo.length !== 0 ? this.formatItemUnit(flowRemainNum, inPlanFlowInfo[0]['unit']) : { flowNum: '', flowUnit: '' };
    const formattedTotal = inPlanFlowInfo.length !== 0 ? this.formatItemUnit(flowSumNum, inPlanFlowInfo[0]['unit']) : { flowNum: '', flowUnit: '' };
    result.flowDetails.color = flowColor;
    result.flowDetails.title = flowTitle;
    result.flowDetails.percent = flowPercent;
    result.flowDetails.remain = formattedRemain.flowNum !== '' ? formattedRemain.flowNum : '--';
    result.flowDetails.total = formattedTotal.flowNum !== '' ? formattedTotal.flowNum : '--';
    result.flowDetails.unit = formattedRemain.flowUnit !== '' ? formattedRemain.flowUnit : 'GB';

    return result.flowDetails;
  };

  formatItemUnit(value, unit) {
    let flowNum = '';
    let flowUnit = '';

    if (unit === '03') { // Assuming '03' represents MB
      if (value >= 1024) {
        flowNum = Number((parseFloat(value) / 1024).toFixed(2));
        flowUnit = 'GB';
      } else {
        flowNum = Number(value.toFixed(2));
        flowUnit = 'MB';
      }
    } else if (unit === '04') { // Assuming '04' represents GB
      flowNum = Number(value);
      flowUnit = 'GB';
    }

    return { flowNum, flowUnit };
  };

  httpRequest = async(dataName, url, json = true, options, key, method = 'GET') => {
    let cacheKey = key;
    let localCache = this.loadStringCache(cacheKey);
    const lastCacheTime = this.getCacheModificationDate(cacheKey);
    const timeInterval = Math.floor((this.getCurrentTimeStamp() - lastCacheTime) / 60000);
    
    console.log(`${dataName}：缓存${timeInterval}分钟前，有效期${this.interval}分钟，${localCache.length}`);

    if (timeInterval < this.interval && localCache != null && localCache.length > 0) {
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
      return this.fm.modificationDate(cacheFile).getTime();
    } else {
      return 0;
    }
  };

  getCurrentTimeStamp() {
    return new Date().getTime();
  };

  getUpdataTime(cacheKey) {
    const modificationDate = this.getCacheModificationDate(cacheKey)
    let date = new Date(modificationDate);
    if (modificationDate == 0) date = new Date();

    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
  };

  async header(stack) {
    const headerStack = stack.addStack();
    headerStack.addSpacer();
    const logo = headerStack.addImage(await this.$request.get(this.logo, 'IMG'));
    logo.imageSize = new Size(415 * this.logoScale * this.SCALE, 129 * this.logoScale * this.SCALE);
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
  };

  textLayout(stack, data) {
    const rowStack = stack.addStack();
    rowStack.centerAlignContent();
    const icon = SFSymbol.named(data.icon) || SFSymbol.named('phone.fill');
    icon.applyHeavyWeight();
    let iconElement = rowStack.addImage(icon.image);
    iconElement.imageSize = new Size(this.textSize, this.textSize);
    iconElement.tintColor = data.iconColor;
    rowStack.addSpacer(4 * this.SCALE);
    let title = rowStack.addText(data.title);
    rowStack.addSpacer();
    let number = rowStack.addText(data.number + data.unit);
    [title, number].map(t => t.textColor = this.widgetColor);
    [title, number].map(t => t.font = Font.systemFont(this.textSize));
  };
  
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
    [title, balance].map(t => t.textColor = data.iconColor);
    rowStack.addSpacer();
    let iconImage;
    if (logo) {
      const icon = await this.$request.get(this.verticalLogo, 'IMG');
      iconImage = rowStack.addImage(icon);
    } else {
      const icon = SFSymbol.named(data.icon) || SFSymbol.named('phone.fill');
      icon.applyHeavyWeight();
      iconImage = rowStack.addImage(icon.image);
    };
    iconImage.imageSize = new Size(22 * this.SCALE, 22 * this.SCALE);
    iconImage.tintColor = data.iconColor;
  };

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
      const icon = await this.$request.get(this.verticalLogo, 'IMG');
      iconImage = iconStack.addImage(icon);
    } else {
      const icon = SFSymbol.named(data.icon) || SFSymbol.named('phone.fill');
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
    [title, balance].map(t => t.textColor = data.iconColor);
  };
  
  async mediumCell(canvas, stack, data, color, fee = false, percent) {
    const bg = new LinearGradient();
    bg.locations = [0, 1];
    bg.colors = [
    new Color(color, 0.03),
    new Color(color, 0.1)
    ];
    const dataStack = stack.addStack();
    dataStack.backgroundGradient = bg;
    dataStack.cornerRadius = 15;
    dataStack.layoutVertically();
    dataStack.addSpacer();

    const topStack = dataStack.addStack();
    topStack.addSpacer();
    await this.imageCell(canvas, topStack, data, fee, percent);
    topStack.addSpacer();

    if (fee) {
      dataStack.addSpacer(5 * this.SCALE);
      const updateStack = dataStack.addStack();
      updateStack.addSpacer();
      updateStack.centerAlignContent();
      const updataIcon = SFSymbol.named('arrow.2.circlepath');
      updataIcon.applyHeavyWeight();
      const updateImg = updateStack.addImage(updataIcon.image);
      updateImg.tintColor = new Color(color, 0.6);
      updateImg.imageSize = new Size(10 * this.SCALE, 10 * this.SCALE);
      updateStack.addSpacer(3);
      const updateText = updateStack.addText(this.getUpdataTime('balanceData.json'))
      updateText.font = Font.mediumSystemFont(10 * this.SCALE);
      updateText.textColor = new Color(color, 0.6);
      updateStack.addSpacer();
    }
    
    dataStack.addSpacer();

    const numberStack = dataStack.addStack();
    numberStack.addSpacer();
    const number = numberStack.addText(`${data.number} ${data.en}`);
    number.font = Font.semiboldSystemFont(15 * this.SCALE);
    numberStack.addSpacer();

    dataStack.addSpacer(3);

    const titleStack = dataStack.addStack();
    titleStack.addSpacer();
    const title = titleStack.addText(data.title);
    title.font = Font.mediumSystemFont(11 * this.SCALE);
    title.textOpacity = 0.7;
    titleStack.addSpacer();

    dataStack.addSpacer(15 * this.SCALE);
    [title, number].map(t => t.textColor = new Color(color));
  };

  async imageCell(canvas, stack, data, fee, percent) {
    const canvaStack = stack.addStack();
    canvaStack.layoutVertically();
    if (!fee) {
      this.drawArc(canvas, data.percent * 3.6, data.FGColor, data.BGColor);
      canvaStack.size = new Size(this.ringStackSize, this.ringStackSize);
      canvaStack.backgroundImage = canvas.getImage();
      this.ringContent(canvaStack, data, percent);
    } else {
      canvaStack.addSpacer(10 * this.SCALE);
      const smallLogo = await this.$request.get(this.verticalLogo, 'IMG');
      const logoStack = canvaStack.addStack();
      logoStack.size = new Size(40 * this.SCALE, 40 * this.SCALE);
      logoStack.backgroundImage = smallLogo;
    }
  };

  ringContent(stack, data, percent = false) {
    const rowIcon = stack.addStack();
    rowIcon.addSpacer();
    const icon = SFSymbol.named(data.icon) || SFSymbol.named('phone.fill');
    icon.applyHeavyWeight();
    const iconElement = rowIcon.addImage(icon.image);
    iconElement.tintColor = this.gradient ? new Color(data.colors[1]) : data.FGColor;
    iconElement.imageSize = new Size(12 * this.SCALE, 12 * this.SCALE);
    iconElement.imageOpacity = 0.7;
    rowIcon.addSpacer();

    stack.addSpacer(1);

    const rowNumber = stack.addStack();
    rowNumber.addSpacer();
    const number = rowNumber.addText(percent ? `${data.percent}` : `${data.number}`);
    number.font = percent ? Font.systemFont(this.ringTextSize - 2) : Font.mediumSystemFont(this.ringTextSize);
    number.lineLimit = 1;
    number.minimumScaleFactor = 0.5;
    rowNumber.addSpacer();

    const rowUnit = stack.addStack();
    rowUnit.addSpacer();
    const unit = rowUnit.addText(percent ? '%' : data.unit);
    unit.font = Font.boldSystemFont(8 * this.SCALE);
    unit.textOpacity = 0.5;
    rowUnit.addSpacer();

    if (percent) {
      if (this.gradient) {
        [unit, number].map(t => t.textColor = new Color(data.colors[1]));
      } else {
        [unit, number].map(t => t.textColor = data.FGColor);
      }
    } else {
      [unit, number].map(t => t.textColor = this.widgetColor);
    }
  };

  makeCanvas() {
    const canvas = new DrawContext();
    canvas.opaque = false;
    canvas.respectScreenScale = true;
    canvas.size = new Size(this.canvSize, this.canvSize);
    return canvas;
  };

  sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
  };

  cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
  };

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
  };

  arrColor() {
    let colorArr = [
      ["#FFF000", "#E62490"],  // 0. 亮黄色 → 粉红色
      ["#ABDCFF", "#0396FF"],  // 1. 浅蓝色 → 靛蓝
      ["#FEB692", "#EA5455"],  // 2. 桃橙色 → 红宝石
      ["#FEB692", "#EA5455"],  // 3. 桃橙色 → 红宝石
      ["#CE9FFC", "#7367F0"],  // 4. 淡紫色 → 紫蓝色
      ["#90F7EC", "#32CCBC"],  // 5. 淡青色 → 青绿色
      ["#FFF6B7", "#F6416C"],  // 6. 柔黄色 → 樱桃红
      ["#E2B0FF", "#9F44D3"],  // 7. 淡紫色 → 深紫色
      ["#F97794", "#F072B6"],  // 8. 玫瑰粉 → 紫粉色
      ["#FCCF31", "#F55555"],  // 9. 金黄色 → 红橙色
      ["#5EFCE8", "#736EFE"],  // 10. 薄荷绿 → 深紫蓝
      ["#FAD7A1", "#E96D71"],  // 11. 浅杏色 → 粉红色
      ["#FFFF1C", "#00C3FF"],  // 12. 亮黄色 → 电蓝色
      ["#FEC163", "#DE4313"],  // 13. 浅橙色 → 深橙红
      ["#F6CEEC", "#D939CD"],  // 14. 粉紫色 → 深紫粉
      ["#FDD819", "#E80505"],  // 15. 柠檬黄 → 鲜红色
      ["#FFF3B0", "#CA26FF"],  // 16. 米黄色 → 亮紫色
      ["#EECDA3", "#EF629F"],  // 17. 杏仁色 → 粉红色
      ["#C2E59C", "#64B3F4"],  // 18. 青柠绿 → 天蓝色
      ["#FFF886", "#F072B6"],  // 19. 浅黄绿 → 紫粉色
      ["#F5CBFF", "#C346C2"],  // 20. 浅紫粉 → 深紫粉
      ["#FFF720", "#3CD500"],  // 21. 荧光黄 → 亮绿色
      ["#FFC371", "#FF5F6D"],  // 22. 浅橙色 → 樱桃红
      ["#FFD3A5", "#FD6585"],  // 23. 柔橙色 → 浅玫瑰红
      ["#C2FFD8", "#465EFB"],  // 24. 淡薄荷绿 → 电蓝色
      ["#FFC600", "#FD6E6A"],  // 25. 橙黄色 → 珊瑚粉
      ["#FFC600", "#FD6E6A"],  // 26. 橙黄色 → 珊瑚粉
      ["#92FE9D", "#00C9FF"],  // 27. 荧光绿 → 浅蓝色
      ["#FFDDE1", "#EE9CA7"],  // 28. 淡粉红 → 珊瑚粉
      ["#F0FF00", "#58CFFB"],  // 29. 亮黄绿 → 天蓝色
      ["#FFE985", "#FA742B"],  // 30. 柔黄橙 → 深橙色
      ["#72EDF2", "#5151E5"],  // 31. 浅蓝绿 → 紫蓝色
      ["#F6D242", "#FF52E5"],  // 32. 金黄 → 粉紫色
      ["#F9D423", "#FF4E50"],  // 33. 柠檬黄 → 亮红色
      ["#00EAFF", "#3C8CE7"],  // 34. 电青色 → 海蓝色
      ["#FCFF00", "#FFA8A8"],  // 35. 亮黄绿 → 浅粉红
      ["#FF96F9", "#C32BAC"],  // 36. 亮粉紫 → 紫红色
      ["#FFDD94", "#FA897B"],  // 37. 柔黄色 → 鲑鱼色
      ["#FFCC4B", "#FF7D58"],  // 38. 柔金色 → 橙红色
      ["#D0E6A5", "#86E3CE"],  // 39. 淡青绿 → 青绿色
      ["#F0D5B6", "#F16238"],  // 40. 浅米色 → 红橙色
      ["#C4E86B", "#00BCB4"],  // 41. 青柠绿 → 青蓝色
      ["#FFC446", "#FA0874"],  // 42. 柔金色 → 深玫红
      ["#E1EE32", "#FFB547"],  // 43. 亮绿黄 → 橙黄色
      ["#E9A6D2", "#E9037B"],  // 44. 粉紫色 → 樱桃红
      ["#F8EC70", "#49E2F6"],  // 45. 柠檬黄 → 浅蓝色
      ["#A2F8CD", "#00C3FF"],  // 46. 薄荷绿 → 电蓝色
      ["#FDEFE2", "#FE214F"],  // 47. 柔粉色 → 鲜红色
      ["#FFB7D1", "#E4B7FF"],  // 48. 淡粉色 → 浅紫色
      ["#D0E6A5", "#86E3CE"],  // 49. 淡青绿 → 青绿色
      ["#E8E965", "#64C5C7"]   // 50. 亮黄绿 → 浅青色
    ];
    let colors = colorArr[Math.floor(Math.random() * colorArr.length)];
    return colors;
  };
  
  getIconColorSet() {
    const colors = [
      ["#1E81B0", "#FF5714", "#FF6347"],  // 0. 深蓝色，亮橙色，番茄红
      ["#FF6347", "#32CD32", "#3CB371"],  // 1. 番茄红，鲜绿色，海洋绿
      ["#FF8C00", "#4682B4", "#20B2AA"],  // 2. 暗橙色，钢蓝色，浅海蓝
      ["#FF4500", "#00CED1", "#00BFFF"],  // 3. 橙红色，深青色，深天蓝
      ["#DB7093", "#3CB371", "#FFA07A"],  // 4. 草莓红，海洋绿，浅橙红
      ["#FF8C00", "#4682B4", "#20B2AA"],  // 5. 暗橙色，钢蓝色，浅海蓝
      ["#FF7F50", "#4CAF50", "#1E90FF"],  // 6. 珊瑚橙，鲜绿色，亮天蓝
      ["#FF4500", "#00CED1", "#1E90FF"],  // 7. 橙红色，深青色，亮天蓝
      ["#FF4500", "#3CB371", "#FFA07A"],  // 8. 橙红色，海洋绿，浅橙红
      ["#FF7F50", "#00A9A5", "#C41E3A"],  // 9. 珊瑚橙，深青绿，红宝石红
      ["#2E8B57", "#FF6347", "#00BFFF"],  // 10. 海绿色，番茄红，深天蓝
      ["#FF4500", "#008B8B", "#3CB371"],  // 11. 橙红色，深青色，海洋绿
      ["#DC143C", "#00BFFF", "#F08080"],  // 12. 猩红色，深天蓝，淡珊瑚红
      ["#20B2AA", "#FF8C00", "#32CD32"],  // 13. 浅海蓝，暗橙色，鲜绿色
      ["#FF4500", "#66E579", "#00CED1"],  // 14. 橙红色，萤光绿，深青色
      ["#DA70D6", "#5DB8E8", "#FF6347"],  // 15. 兰花紫，天蓝色，番茄红
      ["#32CD32", "#F86527", "#00CED1"],  // 16. 鲜绿色，夕阳橙，深青色
      ["#FF6347", "#00FA9A", "#20B2AA"],  // 17. 番茄红，适中春绿，浅海蓝
      ["#FA8072", "#4682B4", "#3CB371"],  // 18. 鲑鱼色，钢蓝色，海洋绿
      ["#5856CF", "#FF4500", "#00BFFF"],  // 19. 淡紫蓝，橙红色，深天蓝
      ["#FF8C00", "#20B2AA", "#5856CF"],  // 20. 暗橙色，浅海蓝，淡紫蓝
      ["#704CE4", "#20B2AA", "#FF8F8F"],  // 21. 紫罗兰，浅海蓝，玫瑰粉
      ["#73DE00", "#48D1CC", "#FF6347"],  // 22. 新生绿，松石绿，番茄红
      ["#DB7093", "#6495ED", "#FA8072"],  // 23. 草莓红，矢车菊蓝，鲑鱼色
      ["#FFA07A", "#32CD32", "#1E90FF"],  // 24. 浅橙红，鲜绿色，亮天蓝
      ["#00A9A5", "#FF4500", "#4682B4"],  // 25. 深青绿，橙红色，钢蓝色
      ["#13C07E", "#00BCD4", "#FF6347"],  // 26. 薄荷绿，青蓝色，番茄红
      ["#8BC34A", "#FF5722", "#3F51B5"],  // 27. 黄绿色，烈焰橙，靛蓝
      ["#4CAF50", "#00BCD4", "#F44336"],  // 28. 鲜绿色，青蓝色，火烈鸟红
      ["#3F51B5", "#009688", "#FF5722"],  // 29. 靛蓝，青色，烈焰橙
      ["#B170FF", "#03A9F4", "#3CB371"],  // 30. 丁香紫，亮天蓝，海洋绿
      ["#009688", "#8BC34A", "#FF6347"],  // 31. 青色，黄绿色，番茄红
      ["#F44336", "#00BCD4", "#3CB371"],  // 32. 火烈鸟红，青蓝色，海洋绿
      ["#FF4500", "#32CD32", "#3CB371"],  // 33. 橙红色，鲜绿色，海洋绿
      ["#3CB371", "#FF9800", "#009688"],  // 34. 海洋绿，橙色，青色
      ["#4CAF50", "#00BCD4", "#F44336"],  // 35. 鲜绿色，青蓝色，火烈鸟红
      ["#FF5722", "#8BC34A", "#38B1B7"],  // 36. 烈焰橙，黄绿色，猩红色
      ["#03A9F4", "#3CB371", "#FF788B"],  // 37. 亮天蓝，海洋绿，珊瑚粉
      ["#FF5722", "#03A9F4", "#DB7093"],  // 38. 烈焰橙，亮天蓝，草莓红
      ["#1E90FF", "#38B1B7", "#CD5C5C"],  // 39. 亮天蓝，海洋蓝，印度红
      ["#FF6347", "#48D1CC", "#32CD32"],  // 40. 番茄红，松石绿，鲜绿色
      ["#FF4500", "#73DE00", "#4682B4"],  // 41. 橙红色，新生绿，钢蓝色
      ["#FF5722", "#8BC34A", "#00CED1"],  // 42. 烈焰橙，黄绿色，深青色
      ["#FF4500", "#32CD32", "#4682B4"],  // 43. 橙红色，鲜绿色，钢蓝色
      ["#8BC34A", "#F08080", "#00BFFF"],  // 44. 黄绿色，淡珊瑚红，深天蓝
      ["#FF6F61", "#40E0D0", "#1E90FF"],  // 45. 珊瑚红，松石绿，亮天蓝
      ["#00CED1", "#FF6347", "#4682B4"],  // 46. 深青色，番茄红，钢蓝色
      ["#E57373", "#4DD0E1", "#81C784"],  // 47. 浅红色，青绿，黄绿色
      ["#FF5722", "#8BC34A", "#FFD700"],  // 48. 烈焰橙，黄绿色，金色
      ["#F08080", "#48D1CC", "#32CD32"],  // 49. 珊瑚红，松石绿，鲜绿色
    ];
      const randomIndex = Math.floor(Math.random() * colors.length);
      return colors[randomIndex];
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
  };

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
  };

  getWidgetScaleFactor() {
    const referenceScreenSize = { width: 430, height: 932, widgetSize: 170 };
    const screenData = [
      { width: 440, height: 956, widgetSize: 170 }, 
      { width: 430, height: 932, widgetSize: 170 }, 
      { width: 428, height: 926, widgetSize: 170 },
      { width: 414, height: 896, widgetSize: 169 },
      { width: 414, height: 736, widgetSize: 159 },
      { width: 393, height: 852, widgetSize: 158 },
      { width: 390, height: 844, widgetSize: 158 },
      { width: 375, height: 812, widgetSize: 155 },
      { width: 375, height: 667, widgetSize: 148 },
      { width: 360, height: 780, widgetSize: 155 },
      { width: 320, height: 568, widgetSize: 141 }
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

    const scaleFactor = matchingScreen.widgetSize / referenceScreenSize.widgetSize;

    return Math.floor(scaleFactor * 100) / 100;
  };

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
      const bodyStack = w.addStack();
      bodyStack.setPadding(1, 1, 1, 1);
      bodyStack.layoutVertically();
      await this.header(bodyStack);
      const canvas = this.makeCanvas();
      const ringStack = bodyStack.addStack();
      this.imageCell(canvas, ringStack, this.flow);
      ringStack.addSpacer();
      this.imageCell(canvas, ringStack, this.voice);
    } else {
      const bodyStack = w.addStack();
      bodyStack.layoutVertically();
      await this.header(bodyStack);
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
    await this.mediumCell(canvas, bodyStack, this.fee, '0080CB', true);
    bodyStack.addSpacer(this.padding);
    await this.mediumCell(canvas, bodyStack, this.flow, this.flowColorHex, false, true);
    bodyStack.addSpacer(this.padding);
    await this.mediumCell(canvas, bodyStack, this.voice, this.voiceColorHex, false,true);
    return w;
  };
  
  setColorConfig = async () => {
    return this.renderAppView([
      {
        title: '颜色设置',
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/gradient.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/step1.png',
            type: 'color',
            title: '流量进度条',
            defaultValue: '#32CD32',
            desc: '',
            val: 'step1',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/step2.png',
            type: 'color',
            title: '语音进度条',
            defaultValue: '#F86527',
            desc: '',
            val: 'step2',
          },
        ],
      },
      {
        title: '颜色设置',
        menu: [
          {
            url: 'https://pic1.imgdb.cn/item/63315c1e16f2c2beb1a27363.png',
            type: 'switch',
            title: '内置图标颜色',
            desc: '',
            val: 'builtInColor',
          },
        ],
      },
      {
        menu: [
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/logoColor.png',
            type: 'color',
            title: 'LOGO图标颜色',
            defaultValue: '#0080CB',
            desc: '',
            val: 'logoColor',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/flowIconColor.png',
            type: 'color',
            title: '流量图标颜色',
            defaultValue: '#32CD32',
            desc: '',
            val: 'flowIconColor',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/voiceIconColor.png',
            type: 'color',
            title: '语音图标颜色',
            defaultValue: '#F86527',
            desc: '',
            val: 'voiceIconColor',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/SCALE.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/ringStackSize.png',
            title: '圆环大小',
            placeholder : '61',
            desc: '',
            val: 'ringStackSize',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/ringTextSize.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/feeTextSize.png',
            type: 'input',
            title: '话费文字大小',
            placeholder : '21',
            desc: '',
            val: 'feeTextSize',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/textSize.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/smallPadding.png',
            type: 'input',
            title: '小尺寸组件边距',
            placeholder : '15',
            desc: '',
            val: 'smallPadding',
          },
          {
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/padding.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/clear.png',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/interval.png',
            type: 'input',
            placeholder : '360',
            title: '刷新时间',
            desc: '数据刷新时间，单位：分钟，默认360分钟\n⚠谨慎设置刷新时间，以免被风控',
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/widgetStyle.png',
            type: 'select',
            title: '组件样式',
            options: ['1', '2', '3', '4'],
            val: 'widgetStyle',
          },
        ],
      });
      
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
            url: 'https://raw.githubusercontent.com/anker1209/Scriptable/main/icon/size.png',
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
}

await Runing(Widget, args.widgetParameter, false);