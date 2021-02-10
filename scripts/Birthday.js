// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: birthday-cake;
// Author: 2Ya UI: 脑瓜 https://t.me/Scriptable_JS
// 该脚本依赖DmYY及Calendar: https://github.com/dompling/Scriptable/tree/master/Scripts
// version:1.0.2
// update:2021/02/10

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");
const { Calendar } = require("./Calendar");
const $ = new Calendar();
// #####################设置#####################
const extraTextColor = "fc8ac3" //环形进度条中心背景颜色及名字、meetDay颜色
const ringColor = "fc5ead" //环形进度条颜色
const nameTextSize = 15 // 名字大小
const meetDayTextSize = 25 // meetDay文字大小
const ringSize = 60 // 环形进度条大小
const mainTextSize = 13 // 倒数、农历、生日文字大小
const lineHeight = 8 // 倒数、农历、生日文字行间距大小
const leftImageSize = 180 // 左侧图片宽度
//##############################################
let candle = new Request("https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/ff304168-6cd3-4b5c-bb26-05ae2538f147.png")
let ringIcon = await candle.loadImage()
let countIcon = SFSymbol.named("hourglass.bottomhalf.fill").image;
let lunarIcon = SFSymbol.named("25.square.fill").image; // 农历图标数字
let birthIcon = SFSymbol.named("app.gift.fill").image;

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "破壳日";
    this.en = "birthday";
    this.logo ="";
    this.LEFT_IMG_KEY = this.FILE_MGR_LOCAL.joinPath(
      this.FILE_MGR_LOCAL.documentsDirectory(),
      `left_image_${this.SETTING_KEY}.jpg`,
      );
    this.defaultData = { ...this.defaultData, ...this.settings[this.en] };
    if (config.runsInApp) {
      this.registerAction("基础设置",this.setWidgetConfig);
      this.registerAction("生日配置", this.setWidgetInitConfig);
      this.registerAction("头像设置", this.setLeftWidgetImage);
      this.registerAction("代理缓存", this.setWidgetBoxJSConfig);
    }
  }

  defaultData = {
    username: "", // 姓名
    time: "", // 生日日期
    nongli: "", // 农历生日
    eday: "", //相识
    isLeapMonth: false, //如果是农历闰月第四个参数赋值true即可
  };

  contentText = {};

  init = async () => {
    try {
      this.getCalendarData();
    } catch (e) {
      console.log(e);
    }
  };
  
  getAge = (beginStr) => {
  let tmpBirth = {};
  tmpBirth.year = 0;
  tmpBirth.month = 0;
  tmpBirth.day = 0;

  if(beginStr == null || beginStr == '') {
    return;
  }
  let startDate = new Date(beginStr.replace(/-/g, "/"));
  let today = new Date();

  let startYear = startDate.getFullYear();
  let endYear = today.getFullYear();
  let startMonth = startDate.getMonth() + 1;
  let endMonth = today.getMonth() + 1;
  let startDay = startDate.getDate();
  let endDay = today.getDate();
  let allDays = 0;
  //准确的每个月天数数组，判断闰年平年。
  let allDayArr = [];
  //当月计算
  if(startYear == endYear && startMonth == endMonth) {
    tmpBirth.day = endDay - startDay;
    return tmpBirth;
  }
  //正常计算
  for(let i = startYear; i <= endYear; i++) {
    let currYear = 365
    let yearMonth = 12;
    if(((i % 4 == 0 && i % 100 !== 0) || i % 400 == 0)) {
      allDays += 366;
      currYear = 366;
    } 
    let currMonth = 1;
    if(i == startYear){
      currMonth = startMonth;
    }
    if(i == endYear){
      yearMonth = endMonth;
    }
    //闰年计算
    for(let m = currMonth; m <= yearMonth; m++) {
      let fullDays = 30;

      if(m == 1 || m == 3 || m == 8 || m == 10 || m == 12) {
        fullDays = 31
      } else if(m == 2) {
        if(((i % 4 == 0 && i % 100 !== 0) || i % 400 == 0)){
          fullDays = 29;
        } else {
          fullDays = 28;
        }
      }
      let dayObj = {
        fullDays:fullDays,
        currDays:fullDays
      };
      if(m == startMonth && i == startYear){
        dayObj = {
          fullDays:fullDays,
          currDays:fullDays-startDay
        };
      }else
      if(m == endMonth && i == endYear){
        dayObj = {
          fullDays:fullDays,
          currDays:endDay
        };
      }
      allDayArr.push(dayObj);
    }
  }

  if(allDayArr.length == 1) {
    tmpBirth.day = allDayArr[0].currDays;
  } else if(allDayArr.length == 2) {
    var d1 = allDayArr[0].currDays;
    var d2 = allDayArr[1].currDays;
    //月份天数浮动因子决定准确性
    let cfDay = allDayArr[0].fullDays > allDayArr[allDayArr.length - 1].fullDays ? allDayArr[allDayArr.length - 1].fullDays : allDayArr[0].fullDays;
    if((d1 + d2) >= cfDay) {
      tmpBirth.day = (d1 + d2) - cfDay;
      tmpBirth.month += 1;
    } else {
      tmpBirth.day = d1 + d2;
    }
  } else {
    let d1 = allDayArr[0].currDays;
    let d2 = allDayArr[allDayArr.length - 1].currDays;
    let sumFullDay = 0;
    for(let i = 0; i < allDayArr.length; i++){
      sumFullDay += allDayArr[i].fullDays;
    }
    //月份天数浮动因子决定准确性
    let cfDay = allDayArr[0].fullDays > allDayArr[allDayArr.length - 1].fullDays ? allDayArr[allDayArr.length - 1].fullDays : allDayArr[0].fullDays;
    if((d1 + d2) >= cfDay){
      tmpBirth.day = (d1 + d2) - cfDay;
      tmpBirth.month += 1;
    } else {
      tmpBirth.day = d1 + d2;
    }
    tmpBirth.month += allDayArr.length - 2;

    if(tmpBirth.month >= 12){
      tmpBirth.year += Math.floor(tmpBirth.month / 12);
      tmpBirth.month = tmpBirth.month - (tmpBirth.year * 12);
    }
  }
  return tmpBirth;
};

  getEdayNumber = (date) => {
    var initDay = date.split("-");
    var obj = {
      cYear: parseInt(initDay[0]),
      cMonth: parseInt(initDay[1]),
      cDay: parseInt(initDay[2]),
    };
    return Math.abs(this.$.daysBetween(obj));
  };

  getCalendarData = () => {
    const { time, nongli, isLeapMonth, eday } = this.defaultData;
    const _data = time.split("-");
    const opt = {
      year: parseInt(_data[0]),
      month: parseInt(_data[1]),
      day: parseInt(_data[2]),
      nongli,
      isLeapMonth,
    };

    const response = {};
    response.birthdayText = this.$.birthday(opt);
    response.nextBirthday = response.birthdayText[0];

    var solarData
    if (nongli) {
      solarData = this.$.lunar2solar(opt.year, opt.month, opt.day, isLeapMonth)
    } else {
      solarData = this.$.solar2lunar(opt.year, opt.month, opt.day);
    }
    response.gregorian = solarData;
    response.animal = `${this.$.getAnimalZodiacToEmoji(solarData.Animal)}-${
      solarData.Animal
    }`;
    response.astro = `${this.$.getAstroToEmoji(solarData.astro)}-${solarData.astro}`;
    if (this.$.verifyTime(eday)) {
      response.meetDay = this.getEdayNumber(eday);
    }
    this.contentText = response;
  };

  setRightCell = (rowCell, icon, iconColor, title, value) => {
    const subWidget = rowCell.addStack();
    subWidget.centerAlignContent();
    const subImg = subWidget.addImage(icon);
    subImg.tintColor = new Color(iconColor);
    subImg.imageSize = new Size(mainTextSize, mainTextSize);
    subWidget.addSpacer(4);
    const subTitle = subWidget.addText(title);
    subTitle.font = Font.systemFont(mainTextSize);
    subTitle.textColor = this.widgetColor;
    subWidget.addSpacer();
    const subValue = subWidget.addText(value);
    subValue.font = Font.systemFont(mainTextSize);
    subValue.textColor = this.widgetColor;
    subValue.lineLimit = 1;
  };

  setLeftView = (w) => {
    const leftImg = this.getLeftImage();
    const left = w.addStack();
    left.size = new Size(leftImageSize, 0);
    left.cornerRadius = 10;
    if (leftImg) {
      left.backgroundImage = leftImg;
    }
    left.addSpacer();
    left.layoutVertically();
    const leftAdd = left.addStack();
    leftAdd.centerAlignContent();
    if(this.defaultData.bless) {
      leftAdd.size = new Size(leftImageSize, 26);
      leftAdd.backgroundColor = new Color(extraTextColor, 0.8);
      const bless = leftAdd.addText("✿ "+this.defaultData.bless+" ✿");
      bless.textColor = new Color("ffffff", 0.8);
      bless.font = Font.mediumSystemFont(mainTextSize);
    }
    return w;
  };

  setRightView = (right) => {
    const { time, nongli, isLeapMonth} = this.defaultData;
    const _data = time.split("-");
    const opt = {
      year: parseInt(_data[0]),
      month: parseInt(_data[1]),
      day: parseInt(_data[2]),
      nongli,
      isLeapMonth
    };
    const {
      animal,
      astro,
      gregorian,
      nextBirthday,
      meetDay,
      birthdayText,
    } = this.contentText;
    const { IMonthCn, IDayCn } = gregorian;
    const _birth = `${nextBirthday.cYear}-${nextBirthday.cMonth}-${nextBirthday.cDay}`;
    right.layoutVertically();

    const rightTop = right.addStack();
    const textContent = rightTop.addStack();
    textContent.layoutVertically();
    const babyName = textContent.addText(this.defaultData.username);
    babyName.font = Font.boldSystemFont(nameTextSize);
    babyName.textColor = new Color(extraTextColor);
    babyName.lineLimit = 1;
    textContent.addSpacer();
    if (meetDay) {
      const babyDays = textContent.addText(`${meetDay}`);
      babyDays.font = Font.boldRoundedSystemFont(meetDayTextSize);
      babyDays.textColor = new Color(extraTextColor);
      textContent.addSpacer(8);
    }

    var preData
    if (nongli) {
      preData =  this.$.lunar2solar(`${nextBirthday.lYear}`-1, opt.month, opt.day, isLeapMonth)
      log(preData)
    } else {
      preData =  this.$.solar2lunar(`${nextBirthday.cYear}`-1, opt.month, opt.day)
      log(preData)
    }
    const today = new Date();
    const thenDate = new Date(`${nextBirthday.cYear}`, `${nextBirthday.cMonth}`-1, `${nextBirthday.cDay}`);
    log(thenDate)
    const passDate = new Date(preData.cYear, preData.cMonth-1, preData.cDay);
    log(passDate)
    const canvSize = 172;
    const canvTextSize = 55;
    const canvas = new DrawContext(); 
    const canvWidth = 12; 
    const canvRadius = 80; 
    const cbgColor = new Color(ringColor, 0.2);
    const cfgColor = new Color(ringColor);
    const centerColor = new Color(extraTextColor)
    const cfontColor = new Color("ffffff");
    canvas.size = new Size(canvSize, canvSize);
    canvas.opaque = false;
    canvas.respectScreenScale = true;

    const gap = today.getTime() - passDate.getTime();
    const gap2 = thenDate.getTime() - passDate.getTime();
    const deg = Math.floor(gap/gap2 * 100 * 3.6);

    let ctr = new Point(canvSize / 2, canvSize / 2);
    const bgx = ctr.x - canvRadius;
    const bgy = ctr.y - canvRadius;
    const bgd = 2 * canvRadius;
    const bgr = new Rect(bgx, bgy, bgd, bgd);

    canvas.setFillColor(cfgColor);
    canvas.setStrokeColor(cbgColor);
    canvas.setLineWidth(canvWidth);
    canvas.strokeEllipse(bgr);

    for (let t = 0; t < deg; t++) {
      const rect_x = ctr.x + canvRadius * Math.sin((t * Math.PI) / 180) - canvWidth / 2;
      const rect_y = ctr.y - canvRadius * Math.cos((t * Math.PI) / 180) - canvWidth / 2;
      const rect_r = new Rect(rect_x, rect_y, canvWidth, canvWidth);
      canvas.fillEllipse(rect_r);
    };

    const ringBG = new Rect(bgx + canvWidth / 2 + 8, bgy + canvWidth / 2 + 8, canvRadius * 2 - canvWidth -16, canvRadius * 2 - canvWidth - 16);
    canvas.setFillColor(centerColor);
    canvas.setLineWidth(0);
    canvas.fillEllipse(ringBG);
    canvas.drawImageInRect(ringIcon, ringBG);

    const canvTextRect = new Rect(0, 100 - canvTextSize / 2 + 5, canvSize, canvTextSize);
    canvas.setTextAlignedCenter();
    canvas.setTextColor(cfontColor);
    canvas.setFont(new Font("AvenirNextCondensed-DemiBold", canvTextSize))
    canvas.drawTextInRect(`${birthdayText[1]}`, canvTextRect);

    const imageContent = rightTop.addStack();
    imageContent.addSpacer();
    imageContent.size = new Size(0, ringSize);
    imageContent.addImage(canvas.getImage());
    
    const tmpBirth = this.getAge(this.defaultData.eday);
    let ageYear = tmpBirth.year > 0 ? `${tmpBirth.year}岁` : '';
    let ageMonth = tmpBirth.month > 0 ? `${tmpBirth.month}个月` : '';
    let ageDay = tmpBirth.day > 0 ? `${tmpBirth.day}天` : '';
    const age = ageYear + ageMonth + ageDay;

    this.setRightCell(right, countIcon, "1ab6f8", `年龄`, age);
    right.addSpacer(lineHeight);
    this.setRightCell(right, lunarIcon, "30d15b", "农历", `${IMonthCn}${IDayCn}`);
    right.addSpacer(lineHeight);
    this.setRightCell(right, birthIcon, "fc6d6d", "生日", _birth);
    return right;
  };

  fetch = async () => {
    const response = await this.$request.get(
      "https://api.uomg.com/api/rand.qinghua?format=json",
      );
    return response.content;
  };

  renderSmall = async (w) => {
    this.setRightView(w.addStack());
    return w;
  };

  renderLarge = async (w) => {
    w.addSpacer(20);
    const body = w.addStack();
    const left = body.addStack();
    this.setLeftView(left);
    body.addSpacer(10);
    const right = body.addStack();
    this.setRightView(right);

    w.addSpacer();
    const footer = w.addStack();
    const text = await this.fetch();
    const subContent = footer.addText(text);
    subContent.font = Font.lightSystemFont(16);
    subContent.textColor = this.widgetColor;
    w.addSpacer();
    return w;
  };

  renderMedium = async (w) => {
    const body = w.addStack();
    const left = body.addStack();
    w.setPadding(16, 16, 16, 16);
    this.setLeftView(left);
    body.addSpacer(10);
    const right = body.addStack();
    this.setRightView(right);
    return w;
  };

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
  	await this.init();
  	const widget = new ListWidget();
  	// await this.getWidgetBackgroundImage(widget);
  	const header = widget.addStack();
  	if (this.widgetFamily === "medium") {
  		await this.renderMedium(widget);
  	} else if (this.widgetFamily === "large") {
  		await this.renderLarge(widget);
  	} else {
  		await this.renderSmall(widget);
  	}
  	return widget;
  }

  renderMoreHeader = async (header) => {
  header.centerAlignContent();
  await this.renderHeader(header, this.logo, this.name, this.widgetColor);
  header.addSpacer();
  const headerMore = header.addStack();
  headerMore.setPadding(1, 10, 1, 10);
  headerMore.cornerRadius = 10;
  const textItem = headerMore.addText(this.defaultData.username);
  textItem.font = Font.boldSystemFont(12);
  textItem.textColor = this.widgetColor;
  textItem.lineLimit = 1;
  textItem.rightAlignText();
  return header;
};

  /**
   * 获取当前插件是否有自定义背景图片
   * @reutrn img | false
   */
  getLeftImage() {
  	let result = null;
  	if (this.FILE_MGR_LOCAL.fileExists(this.LEFT_IMG_KEY)) {
  		result = Image.fromFile(this.LEFT_IMG_KEY);
  	}
  	return result;
  }

  /**
   * 设置当前组件的背景图片
   * @param {image} img
   */
  setLeftImage(img, notify = true) {
  	if (!img) {
  		// 移除背景
  		if (this.FILE_MGR_LOCAL.fileExists(this.LEFT_IMG_KEY)) {
        this.FILE_MGR_LOCAL.remove(this.LEFT_IMG_KEY);
      }
      if (notify) this.notify("移除成功", "小组件图片已移除，稍后刷新生效");
    } else {
      // 设置背景
      // 全部设置一遍，
      this.FILE_MGR_LOCAL.writeImage(this.LEFT_IMG_KEY, img);
      if (notify) this.notify("设置成功", "小组件图片已设置！稍后刷新生效");
    }
  }

  setLeftWidgetImage = async () => {
    const alert = new Alert();
    alert.title = "设置左侧图";
    alert.message = "显示左侧图片";
    alert.addAction("设置新图");
    alert.addAction("清空图片");
    alert.addCancelAction("取消");
    const actions = [
    async () => {
      const backImage = await this.chooseImg();
      if (!await this.verifyImage(backImage)) return;
      await this.setLeftImage(backImage, true);
    },
    () => {
      this.setLeftImage(false, true);
    },
    ];
    const id = await alert.presentAlert();
    if (id === -1) return;
    actions[id] && actions[id].call(this);
  };

  setWidgetInitConfig = async () => {
    const a = new Alert();
    a.title = "🐣破壳日配置";
    a.message = "配置破壳日的基础信息";
    a.addTextField("昵称", this.defaultData.username);
    a.addTextField("生日/ 年-月-日", this.defaultData.time);
    a.addTextField("农历/ true | false", `${this.defaultData.nongli || ""}`);
    a.addTextField("相识/ 年-月-日", this.defaultData.eday);
    a.addTextField("寄语", this.defaultData.bless);
    a.addAction("确定");
    a.addCancelAction("取消");
    const id = await a.presentAlert();
    if (id === -1) return;
    this.defaultData.username = a.textFieldValue(0);
    this.defaultData.time = a.textFieldValue(1);
    this.defaultData.nongli = a.textFieldValue(2) === "true";
    this.defaultData.eday = a.textFieldValue(3);
    this.defaultData.bless = a.textFieldValue(4);
    // 保存到本地
    this.settings[this.en] = this.defaultData;
    this.saveSettings();
  };

  setWidgetBoxJSConfig = async () => {
    try {
      const datas = await this.getCache();
      Object.keys(this.defaultData).forEach((key) => {
        this.defaultData[key] = datas[`@${this.en}.${key}`];
      });
      this.settings[this.en] = this.defaultData;
      this.saveSettings();
    } catch (e) {
      this.notify(this.name, "", "BoxJS 数据读取失败，请点击通知查看教程", "https://chavyleung.gitbook.io/boxjs/awesome/videos");
    }
  };
}

Runing(Widget, "", false, { $ });
