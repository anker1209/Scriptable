// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: birthday-cake;
// Author: 2Ya UI: 脑瓜 https://t.me/Scriptable_JS
// 该脚本依赖DmYY及Calendar: https://github.com/dompling/Scriptable/tree/master/Scripts
// version:1.0.3
// update:2021/03/14

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");
const { Calendar } = require("./Calendar");
const $ = new Calendar();
// #####################设置#####################
const extraTextColor = "fc8ac3"; //环形进度条中心背景颜色及名字、meetDay颜色
const ringColor = "fc5ead"; //环形进度条颜色
const nameTextSize = 15; // 名字大小
const meetDayTextSize = 25; // meetDay文字大小
const ringSize = 60; // 环形进度条大小
const mainTextSize = 13; // 倒数、农历、生日文字大小
const lineHeight = 8; // 倒数、农历、生日文字行间距大小
const leftImageSize = 180; // 左侧图片宽度
//##############################################
let ringIcon = SFSymbol.named("heart").image;
let countIcon = SFSymbol.named("hourglass.bottomhalf.fill").image;
let lunarIcon = SFSymbol.named("25.square.fill").image; // 农历图标数字
let birthIcon = SFSymbol.named("app.gift.fill").image;
const now = new Date();
const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "破壳日";
    this.en = "birthday";
    this.logo = "";
    this.LEFT_IMG_KEY = `${this.cacheImage}/avatar`;

    if (config.runsInApp) {
      this.registerAction({
        icon: { name: "person.badge.plus", color: "#52c41a" },
        type: "img",
        title: "头像",
        name: "avatar",
        val: this.cacheImage,
      });

      this.registerAction({
        icon: {
          name: "rectangle.and.pencil.and.ellipsis",
          color: "#f5222d",
        },
        type: "input",
        title: "昵称",
        placeholder: "用户昵称",
        name: "nickname",
      });

      this.registerAction({
        icon: {
          name: "bubble.left",
          color: "#faf61c",
        },
        type: "input",
        title: "寄语",
        name: "bless",
      });

      this.registerAction({
        icon: {
          name: "25.square.fill",
          color: "#fa541c",
        },
        type: "switch",
        title: "农历",
        name: "nongli",
      });

      this.registerAction({
        icon: {
          name: "calendar",
          color: "#fa8c16",
        },
        type: "date",
        title: "破壳日",
        name: "birthday",
      });

      this.registerAction({
        icon: {
          name: "calendar.badge.clock",
          color: "#8016fa",
        },
        type: "date",
        title: "相识",
        name: "eday",
      });

      this.registerAction("基础设置", this.setWidgetConfig);
    }
  }

  defaultData = {
    username: "", // 姓名
    time: "", // 生日日期
    nongli: "", // 农历生日
    eday: "", //相识
    bless: "",
    isLeapMonth: false, //如果是农历闰月第四个参数赋值true即可
  };

  contentText = {};

  init = async () => {
    this.defaultData = {
      username: this.settings.nickname || "", // 姓名
      time: this.settings.birthday || today, // 生日日期
      nongli: this.settings.nongli === "true" || "", // 农历生日
      eday: this.settings.eday || today, //相识
      bless: this.settings.bless || "",
      isLeapMonth: false, //如果是农历闰月第四个参数赋值true即可
    };
    console.log(this.settings);
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

    if (beginStr == null || beginStr == "") {
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
    if (startYear == endYear && startMonth == endMonth) {
      tmpBirth.day = endDay - startDay;
      return tmpBirth;
    }
    //正常计算
    for (let i = startYear; i <= endYear; i++) {
      let currYear = 365;
      let yearMonth = 12;
      if ((i % 4 == 0 && i % 100 !== 0) || i % 400 == 0) {
        allDays += 366;
        currYear = 366;
      }
      let currMonth = 1;
      if (i == startYear) {
        currMonth = startMonth;
      }
      if (i == endYear) {
        yearMonth = endMonth;
      }
      //闰年计算
      for (let m = currMonth; m <= yearMonth; m++) {
        let fullDays = 30;

        if (m == 1 || m == 3 || m == 8 || m == 10 || m == 12) {
          fullDays = 31;
        } else if (m == 2) {
          if ((i % 4 == 0 && i % 100 !== 0) || i % 400 == 0) {
            fullDays = 29;
          } else {
            fullDays = 28;
          }
        }
        let dayObj = {
          fullDays: fullDays,
          currDays: fullDays,
        };
        if (m == startMonth && i == startYear) {
          dayObj = {
            fullDays: fullDays,
            currDays: fullDays - startDay,
          };
        } else if (m == endMonth && i == endYear) {
          dayObj = {
            fullDays: fullDays,
            currDays: endDay,
          };
        }
        allDayArr.push(dayObj);
      }
    }

    if (allDayArr.length == 1) {
      tmpBirth.day = allDayArr[0].currDays;
    } else if (allDayArr.length == 2) {
      var d1 = allDayArr[0].currDays;
      var d2 = allDayArr[1].currDays;
      //月份天数浮动因子决定准确性
      let cfDay =
        allDayArr[0].fullDays > allDayArr[allDayArr.length - 1].fullDays
          ? allDayArr[allDayArr.length - 1].fullDays
          : allDayArr[0].fullDays;
      if (d1 + d2 >= cfDay) {
        tmpBirth.day = d1 + d2 - cfDay;
        tmpBirth.month += 1;
      } else {
        tmpBirth.day = d1 + d2;
      }
    } else {
      let d1 = allDayArr[0].currDays;
      let d2 = allDayArr[allDayArr.length - 1].currDays;
      let sumFullDay = 0;
      for (let i = 0; i < allDayArr.length; i++) {
        sumFullDay += allDayArr[i].fullDays;
      }
      //月份天数浮动因子决定准确性
      let cfDay =
        allDayArr[0].fullDays > allDayArr[allDayArr.length - 1].fullDays
          ? allDayArr[allDayArr.length - 1].fullDays
          : allDayArr[0].fullDays;
      if (d1 + d2 >= cfDay) {
        tmpBirth.day = d1 + d2 - cfDay;
        tmpBirth.month += 1;
      } else {
        tmpBirth.day = d1 + d2;
      }
      tmpBirth.month += allDayArr.length - 2;

      if (tmpBirth.month >= 12) {
        tmpBirth.year += Math.floor(tmpBirth.month / 12);
        tmpBirth.month = tmpBirth.month - tmpBirth.year * 12;
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

    var solarData;
    if (nongli) {
      solarData = this.$.lunar2solar(opt.year, opt.month, opt.day, isLeapMonth);
    } else {
      solarData = this.$.solar2lunar(opt.year, opt.month, opt.day);
    }
    response.gregorian = solarData;
    response.animal = `${this.$.getAnimalZodiacToEmoji(solarData.Animal)}-${
      solarData.Animal
    }`;
    response.astro = `${this.$.getAstroToEmoji(solarData.astro)}-${
      solarData.astro
    }`;
    if (this.$.verifyTime(eday)) {
      response.meetDay = this.getEdayNumber(eday);
    }
    this.contentText = response;
  };

  setRightCell = (rowCell, icon, iconColor, title, value, dayImage = false) => {
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
    if (dayImage) {
      subWidget.addSpacer(2);
      let dayIcon = subWidget.addImage(dayImage.image);
      dayIcon.imageSize = new Size(mainTextSize + 1, mainTextSize + 1);
      dayIcon.tintColor = new Color("1ab6f8");
    }
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
    if (this.defaultData.bless) {
      leftAdd.size = new Size(leftImageSize, 26);
      leftAdd.backgroundColor = new Color(extraTextColor, 0.8);
      const bless = leftAdd.addText("✿ " + this.defaultData.bless + " ✿");
      bless.textColor = new Color("ffffff", 0.8);
      bless.font = Font.mediumSystemFont(mainTextSize);
    }
    return w;
  };

  setRightView = (right) => {
    const { time, nongli, isLeapMonth } = this.defaultData;
    const _data = time.split("-");
    const opt = {
      year: parseInt(_data[0]),
      month: parseInt(_data[1]),
      day: parseInt(_data[2]),
      nongli,
      isLeapMonth,
    };
    const { animal, astro, gregorian, nextBirthday, meetDay, birthdayText } =
      this.contentText;
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

    var preData;
    if (nongli) {
      preData = this.$.lunar2solar(
        `${nextBirthday.lYear}` - 1,
        opt.month,
        opt.day,
        isLeapMonth
      );
      log(preData);
    } else {
      preData = this.$.solar2lunar(
        `${nextBirthday.cYear}` - 1,
        opt.month,
        opt.day
      );
      log(preData);
    }
    const today = new Date();
    const thenDate = new Date(
      `${nextBirthday.cYear}`,
      `${nextBirthday.cMonth}` - 1,
      `${nextBirthday.cDay}`
    );
    log(thenDate);
    const passDate = new Date(preData.cYear, preData.cMonth - 1, preData.cDay);
    log(passDate);
    const canvSize = 172;
    const canvTextSize = 45;
    const canvas = new DrawContext();
    const canvWidth = 12;
    const canvRadius = 80;
    const cbgColor = new Color(ringColor, 0.2);
    const cfgColor = new Color(ringColor);
    const centerColor = new Color(extraTextColor);
    const cfontColor = new Color("ffffff");
    canvas.size = new Size(canvSize, canvSize);
    canvas.opaque = false;
    canvas.respectScreenScale = true;

    const gap = today.getTime() - passDate.getTime();
    const gap2 = thenDate.getTime() - passDate.getTime();
    const deg = Math.floor((gap / gap2) * 100 * 3.6);

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
      const rect_x =
        ctr.x + canvRadius * Math.sin((t * Math.PI) / 180) - canvWidth / 2;
      const rect_y =
        ctr.y - canvRadius * Math.cos((t * Math.PI) / 180) - canvWidth / 2;
      const rect_r = new Rect(rect_x, rect_y, canvWidth, canvWidth);
      canvas.fillEllipse(rect_r);
    }
    const ringBG = new Rect(
      bgx + canvWidth / 2 + 8,
      bgy + canvWidth / 2 + 8,
      canvRadius * 2 - canvWidth - 16,
      canvRadius * 2 - canvWidth - 16
    );
    canvas.setFillColor(centerColor);
    canvas.setLineWidth(0);
    canvas.fillEllipse(ringBG);
    canvas.drawImageInRect(ringIcon, ringBG);

    const canvTextRect = new Rect(
      0,
      100 - canvTextSize / 2 - 10,
      canvSize,
      canvTextSize
    );
    canvas.setTextAlignedCenter();
    canvas.setTextColor(cfontColor);
    canvas.setFont(Font.mediumRoundedSystemFont(canvTextSize));
    canvas.drawTextInRect(`${birthdayText[1]}`, canvTextRect);

    const imageContent = rightTop.addStack();
    imageContent.addSpacer();
    imageContent.size = new Size(0, ringSize);
    imageContent.addImage(canvas.getImage());

    const tmpBirth = this.getAge(this.defaultData.eday);
    let ageYear = tmpBirth.year > 0 ? `${tmpBirth.year}岁` : "";
    let ageMonth = tmpBirth.month > 0 ? `${tmpBirth.month}月` : "";
    let ageDay = tmpBirth.day > 0 ? `${tmpBirth.day}天` : "";
    const age = ageYear + ageMonth + ageDay;
    const dayIcon = SFSymbol.named(tmpBirth.day + ".circle.fill");

    if (tmpBirth.year > 0 && tmpBirth.month > 0 && tmpBirth.day > 0) {
      this.setRightCell(
        right,
        countIcon,
        "1ab6f8",
        "年龄",
        ageYear + ageMonth,
        dayIcon
      );
    } else {
      this.setRightCell(right, countIcon, "1ab6f8", "年龄", age);
    }
    right.addSpacer(lineHeight);
    this.setRightCell(
      right,
      lunarIcon,
      "30d15b",
      "农历",
      `${IMonthCn}${IDayCn}`
    );
    right.addSpacer(lineHeight);
    this.setRightCell(right, birthIcon, "fc6d6d", "生日", _birth);
    return right;
  };

  fetch = async () => {
    const response = await this.$request.get(
      "https://api.uomg.com/api/rand.qinghua?format=json"
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

  renderMedium = (w) => {
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
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === "medium") {
      await this.renderMedium(widget);
    } else if (this.widgetFamily === "large") {
      await this.renderLarge(widget);
    } else {
      await this.renderSmall(widget);
    }
    return widget;
  }
}

await Runing(Widget, "", false, { $ });
