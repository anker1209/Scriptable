// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
// Author: 脑瓜
// 电报群: https://t.me/Scriptable_JS @anker1209
// 采用了2Ya美女的京豆收支脚本及DMYY依赖 https://github.com/dompling/Scriptable/tree/master/Scripts
// version: 1.1.0  updata: 2021/01/27
let widgetParam = args.widgetParameter;
let cookie ='';
let userID = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
// #################设置###############
const size = {
  SC: 1.00, // 全局缩放比例，排版溢出、显示不全的请酌情调低此数值，建议递减0.05调整，如0.95、0.90，
  logo: 30, // Logo大小
  userImage: 65, // 用户头像大小
  userStack: 95, // 左侧用户信息栏整体宽度
  division: 18, // 左侧与右侧间距
  chartHeight: 110, //京豆K线图高度
};
const showBaitiao = true; // 是否显示白条还款信息
const showPackage = false; // 是否显示包裹信息
const chartTextColor = Color.dynamic(new Color('000000', 1),new Color('ffffff', 1),); // 京豆K线图深色和浅色模式对应的京豆数据字体颜色，注意切换模式以后颜色不会立即刷新，等它自动刷新就正常了
// ####################################
const w = new ListWidget();
w.setPadding(14 * size.SC, 14 * size.SC, 14 * size.SC, 14 * size.SC); //使用透明背景的可以将此处四个数全部修改为0

let packageData;
let packageNum;
let extraData;
let textColor;

const logo =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/e1902ff8-02e9-4dbf-99c7-cfc85ef3f1b7.png';
const JDImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/43300bf7-61a2-4bd1-94a1-bf2faa2ed9e8.png';
const jtImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/dacbd8f6-8115-4fd6-aedc-95cce83788a9.png';
const gbImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/3947a83b-7aa6-4a53-be34-8fed610ddb77.png';
const jdImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/7ea91cf8-6dea-477c-ae72-cb4d3f646c34.png';
const plusImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/11fbba4a-4f92-4f7c-8fb3-dcff653fe20c.png';
const baitiaoImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/30c40f5b-7428-46c3-a2c0-d81b2b95ec41.png';
const plusCircle =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/06f78540-a5a4-462e-b8c5-98cb8059efc1.png';

let beanCount = 0;
let incomeBean = 0;
let expenseBean = 0;
let todayIncomeBean = 0;
let todayExpenseBean = 0;
let maxDays = 6;
let rangeTimer = {};
let timerKeys = [];
let baitiaoData = {};
let baitiaoTitle;
let baitiaoAmount;
let baitiaoDesc;
let CACHE_KEY;
// Keychain.remove(CACHE_KEY)

const df = new DateFormatter()
let _date = new Date()
_date.setDate(_date.getDate()-1)
df.dateFormat = "YYYY-MM-DD"
const _yestoday = df.string(_date)
_date = new Date()
const _today = df.string(_date)
// #####################小组件###################
async function renderSmallWidget() {
  const bodyStack = w.addStack();
  bodyStack.layoutVertically();
  if (widgetParam == 2) {
    await setUserShow(bodyStack);
  } else {
    await setHeaderShow(bodyStack);
    bodyStack.addSpacer();
    if (widgetParam == 1) {
      await setChartShow(bodyStack);
    } else {
      await setBeanShow(bodyStack, 22 * size.SC, 40 * size.SC);
    }
    bodyStack.addSpacer();
    if (showBaitiao && baitiaoAmount > 0) {
      await setSmallBaitiaoShow(bodyStack);
    } else {
      await rowCell(bodyStack, jtImg, 16 * size.SC, extraData.jintie, 16 * size.SC, '金贴', 10 * size.SC);
      await rowCell(bodyStack, gbImg, 18 * size.SC, extraData['gangbeng'].toString(), 16 * size.SC, '钢镚', 10 * size.SC);
    }
  }
  return w;
}
// #####################中组件###################
async function renderMediumWidget() {
  const bodyStack = w.addStack();
  await setUserShow(bodyStack);
  bodyStack.addSpacer(size.division * size.SC);
  const mainStack = bodyStack.addStack();
  mainStack.layoutVertically();
  await setHeaderShow(mainStack, JDImg);
  mainStack.addSpacer();
  if (showPackage && packageNum > 0) {
    await setPackageShow(mainStack);
    mainStack.addSpacer();
    if (showBaitiao && baitiaoAmount > 0) {
      await setBaitiaoShow(mainStack);
    } else {
      await setCoinShow(mainStack);
    }
  } else {
    if (widgetParam == 1) {
      await setChartShow(mainStack);
    } else {
      await setBeanShow(mainStack, 30 * size.SC, 50 * size.SC);
    }
    mainStack.addSpacer();
    if (showBaitiao && baitiaoAmount > 0) {
      await setBaitiaoShow(mainStack);
    } else {
      await setCoinShow(mainStack);
    }
  }
  return w;
}
// #####################大组件###################
async function renderLargeWidget() {
  const bodyStack = w.addStack();
  bodyStack.size = new Size(0, 150);
  bodyStack.addSpacer();
  await setUserShow(bodyStack);
  bodyStack.addSpacer();
  w.addSpacer(20);
  const text = w.addText('\u6211\u600e\u4e48\u8fd9\u4e48\u597d\u770b');
  w.addSpacer(20);
  text.font = Font.thinSystemFont(30);
  text.centerAlignText();
  const emoji = w.addText('🤣🥰🤪');
  emoji.centerAlignText();
  w.addSpacer();
  return w;
}
// #####################用户信息###################
async function setUserShow(widget) {
  const userStack = widget.addStack();
  userStack.size = new Size(size.userStack * size.SC, 0);
  userStack.layoutVertically();
  // 头像
  const userImgStack = userStack.addStack();
  userImgStack.addSpacer();
  const imgStack = userImgStack.addStack();
  imgStack.size = new Size(size.userImage * size.SC, size.userImage * size.SC);
  imgStack.cornerRadius = size.userImage / 2 * size.SC;
  imgStack.backgroundImage = await getImage(userImage);
  if (plus) {
    const userImg = imgStack.addImage(await getImage(plusImg));
  }
  userImgStack.addSpacer();
  userStack.addSpacer();
  // 物流提示
  const tipStack = userStack.addStack();
  tipStack.addSpacer();
  let signIcon = SFSymbol.named('checkmark.circle.fill');
  const signItem = tipStack.addImage(signIcon.image);
  signItem.imageSize = new Size(14 * size.SC, 14 * size.SC);
  if (packageNum > 0) {
    tipStack.addSpacer(3 * size.SC);
    const packageIcon = SFSymbol.named(packageNum + '.circle.fill');
    const packageItem = tipStack.addImage(packageIcon.image);
    packageItem.imageSize = new Size(14 * size.SC, 14 * size.SC);
    packageItem.tintColor = new Color('FC8600'); // 物流提示图标颜色
  }
  tipStack.addSpacer();
  userStack.addSpacer();
  // 用户名
  const nameStack = userStack.addStack();
  nameStack.centerAlignContent();
  if (plus) {
    const nameImg = nameStack.addImage(await getImage(plusCircle));
    nameImg.imageSize = new Size(16 * size.SC, 16 * size.SC);
  } else {
    const person = SFSymbol.named('person.circle.fill');
    const nameIcon = nameStack.addImage(person.image);
    nameIcon.imageSize = new Size(16 * size.SC, 16 * size.SC);
    nameIcon.tintColor = new Color('007aff'); // 昵称前图标颜色，Plus用户改不了
  }
  nameStack.addSpacer(5 * size.SC);
  const name = nameStack.addText(userName);
  name.font = Font.regularSystemFont(14 * size.SC);
  userStack.addSpacer(5 * size.SC);
  // 京享值
  const valueStack = userStack.addStack();
  valueStack.centerAlignContent();
  const tagIcon = SFSymbol.named('tag.circle.fill');
  const lableIcon = valueStack.addImage(tagIcon.image);
  lableIcon.imageSize = new Size(16 * size.SC, 16 * size.SC);
  lableIcon.tintColor = new Color('fa2d19'); // 京享值前图标颜色
  valueStack.addSpacer(5 * size.SC);
  const value = valueStack.addText(jValue.toString());
  value.font = Font.mediumSystemFont(14 * size.SC);
  valueStack.addSpacer(3 * size.SC);
  const jStack = valueStack.addStack();
  jStack.backgroundColor = new Color('fa2d19'); // “京享”二字背景颜色
  jStack.cornerRadius = 5;
  jStack.setPadding(1 * size.SC, 4 * size.SC, 1 * size.SC, 4 * size.SC);
  const jLable = jStack.addText('京享');
  jLable.font = Font.systemFont(8 * size.SC);
  jLable.textColor = new Color('FFFFFF') // “京享”二字字体颜色
  ;[name, value].map(t => t.textColor = textColor);
  return widget;
}
// #####################顶部内容###################
async function setHeaderShow(widget, image) {
  const topStack = widget.addStack();
  topStack.centerAlignContent();
  const JDLogo = topStack.addImage(await getImage(logo));
  JDLogo.imageSize = new Size(size.logo * size.SC, size.logo * size.SC);
  if (image) {
    topStack.addSpacer(10 * size.SC);
    const JD = topStack.addImage(await getImage(image));
    JD.imageSize = new Size(194 * 0.2 * size.SC, 78 * 0.2 * size.SC);
  }
  topStack.addSpacer();
  const jdBean = topStack.addText(beanCount.toString());
  jdBean.font = Font.boldSystemFont(21 * size.SC);
  jdBean.textColor = new Color('fa2d19'); // 右上角京豆数颜色
  const desStack = topStack.addStack();
  desStack.layoutVertically();
  desStack.addSpacer(5.5 * size.SC);
  const desText = desStack.addText(' 京豆'); 
  desText.font = Font.mediumSystemFont(10 * size.SC);
  desText.textColor = jdBean.textColor;
  return widget;
}
// #####################京豆收支###################
async function setBeanShow(widget, textSize, imageSize) {
  const beanStack = widget.addStack();
  // 今日收支
  const todayStack = beanStack.addStack();
  todayStack.layoutVertically();
  await rowBeanCell(
    todayStack,
    todayExpenseBean.toString(),
    todayIncomeBean.toString(),
    textSize,
    '今日',
  );
  beanStack.addSpacer();
  // 京豆图片
  const ddStack = beanStack.addStack();
  ddStack.layoutVertically();
  const ddImg = ddStack.addImage(await getImage(jdImg));
  ddImg.imageSize = new Size(imageSize, imageSize);
  beanStack.addSpacer();
  // 昨日收支
  const yestodayStack = beanStack.addStack();
  yestodayStack.layoutVertically();
  await rowBeanCell(
    yestodayStack,
    expenseBean.toString(),
    incomeBean.toString(),
    textSize,
    '昨日',
  );
  return widget;
}
// #####################京豆图表###################
async function setChartShow(widget) {
  let beanNum = [],
    beanDate = [];
  Object.keys(rangeTimer).forEach(function (day) {
    const numValue = rangeTimer[day];
    const arrDay = day.split('-');
    beanDate.push(arrDay[2]);
    beanNum.push(numValue);
  });
  if (config.widgetFamily == 'small') {
    beanDate.splice(0, 2);
    beanNum.splice(0, 2);
  }
  const chartStack = widget.addStack();
  chartStack.addImage(await createChart());
  const beanDateStack = widget.addStack();
  let showDays = config.widgetFamily == 'small' ? 4 : 6;
  for (let i = 0; i < showDays; i++) {
    beanDateStack.addSpacer();
    let subStack = beanDateStack.addStack();
    let beanDay = beanDateStack.addText(beanDate[i]);
    beanDay.textColor = textColor;
    beanDay.font = new Font('ArialMT', 9 * size.SC);
    beanDay.textOpacity = 0.8;
    beanDateStack.addSpacer();
  }
}
// #####################物流信息###################
async function setPackageShow(widget) {
  const packageStack = widget.addStack();
  const detailStack = packageStack.addStack();
  detailStack.layoutVertically();
  const packageTitleStack = detailStack.addStack();
  packageTitleStack.centerAlignContent();
  const packageTitle = packageTitleStack.addText(packageData.dealLogList[0]['name']);
  packageTitle.lineLimit = 1;
  packageTitle.font = Font.mediumSystemFont(12 * size.SC);
  detailStack.addSpacer(2 * size.SC);
  const packageDesc = detailStack.addText(packageData.dealLogList[0]['wlStateDesc']);
  packageDesc.lineLimit = 3;
  packageDesc.font = Font.regularSystemFont(12 * size.SC);
  detailStack.addSpacer(2 * size.SC);
  const packageStateStack = detailStack.addStack();
  const packageTime = packageStateStack.addText(packageData.dealLogList[0]['createTime']);
  packageTime.font = Font.regularSystemFont(9 * size.SC);
  packageTime.textOpacity = 0.7;
  packageStateStack.addSpacer();
  const packageState = packageStateStack.addText(packageData.dealLogList[0]['stateName']);
  packageState.font = Font.regularSystemFont(9 * size.SC);
  packageTime.textOpacity = 0.7;
  ;[packageTitle, packageDesc, packageTime, packageState].map(t => t.textColor = textColor);
}
// #####################金贴&钢镚##################
async function setCoinShow(widget) {
  const extraDataStack = widget.addStack();
  await rowCell(extraDataStack, jtImg, 18 * size.SC, extraData.jintie, 16 * size.SC, '金贴', 13 * size.SC);
  extraDataStack.addSpacer();
  await rowCell(extraDataStack, gbImg, 18 * size.SC, extraData['gangbeng'].toString(), 16 * size.SC, '钢镚', 13 * size.SC,);
  return widget;
}
// #####################京东白条##################
async function setBaitiaoShow(widget) {
  const baitiaoStack = widget.addStack();
  baitiaoStack.centerAlignContent();
  const baitiaoImage = baitiaoStack.addImage(await getImage(baitiaoImg));
  baitiaoImage.imageSize = new Size(127 * 0.17 * size.SC, 75 * 0.17 * size.SC);
  baitiaoStack.addSpacer(5 * size.SC);
  const baitiaoText = baitiaoStack.addText(baitiaoTitle);
  baitiaoText.font = Font.regularSystemFont(13 * size.SC);
  baitiaoStack.addSpacer();
  const baitiaoValue = baitiaoStack.addText(baitiaoAmount);
  baitiaoValue.font = Font.mediumSystemFont(15 * size.SC);
  baitiaoStack.addSpacer();
  const baitiaoDate = baitiaoStack.addText(baitiaoDesc);
  baitiaoDate.font = Font.regularSystemFont(10 * size.SC);
  baitiaoDate.textOpacity = 0.7;
  ;[baitiaoText, baitiaoValue, baitiaoDate].map(t => t.textColor = textColor);
}
// ####################小组件白条##################
async function setSmallBaitiaoShow(widget) {
  const oneStack = widget.addStack();
  oneStack.centerAlignContent();
  const baitiaoImage = oneStack.addImage(await getImage(baitiaoImg));
  baitiaoImage.imageSize = new Size(127 * 0.17 * size.SC, 75 * 0.17 * size.SC);
  oneStack.addSpacer(5 * size.SC);
  const baitiaoText = oneStack.addText(baitiaoTitle);
  baitiaoText.font = Font.regularSystemFont(13 * size.SC);
  oneStack.addSpacer();
  widget.addSpacer(5 * size.SC);
  const twoStack = widget.addStack();
  twoStack.centerAlignContent();
  const baitiaoValue = twoStack.addText(baitiaoAmount);
  baitiaoValue.font = Font.mediumSystemFont(15 * size.SC);
  twoStack.addSpacer();
  const baitiaoDate = twoStack.addText(baitiaoDesc);
  baitiaoDate.font = Font.regularSystemFont(10 * size.SC);
  baitiaoDate.textOpacity = 0.7;
  ;[baitiaoText, baitiaoValue, baitiaoDate].map(t => t.textColor = textColor);
}

async function rowCell(widget, image, imageSize, text, textSize, label, lableSize) {
  const rowStack = widget.addStack();
  rowStack.centerAlignContent();
  const rowImg = rowStack.addImage(await getImage(image));
  rowImg.imageSize = new Size(imageSize, imageSize);
  rowStack.addSpacer();
  const rowNumber = rowStack.addText(text);
  rowNumber.font = Font.regularSystemFont(textSize);
  rowStack.addSpacer();
  const rowLabel = rowStack.addText(label);
  rowLabel.font = Font.systemFont(lableSize);
  ;[rowNumber, rowLabel].map(t => t.textColor = textColor);
}

async function rowBeanCell(widget, min, add, textSize, label) {
  const rowOne = widget.addStack();
  const labelText = rowOne.addText(label);
  labelText.font = Font.mediumSystemFont(10 * size.SC);
  labelText.textOpacity = 0.7;
  const rowTwo = widget.addStack();
  const rowNumber = rowTwo.addText(add);
  rowNumber.font = Font.lightSystemFont(textSize);
  if (min < 0) {
    const rowThree = widget.addStack();
    const minText = rowThree.addText(min);
    minText.font = Font.mediumSystemFont(10 * size.SC);
    minText.textColor = new Color('fa2d19');  // 支出京豆颜色
  }
  ;[labelText, rowNumber].map(t => t.textColor = textColor);
}

async function init() {
  try {
    if (!cookie) return;
    if (Keychain.contains(CACHE_KEY)) {
      rangeTimer = JSON.parse(Keychain.get(CACHE_KEY));
      timerKeys = Object.keys(rangeTimer);
      if (timerKeys.length >= maxDays) {
        for (let i = 0; i < timerKeys.length - maxDays; i++) {
          delete rangeTimer[timerKeys[i]];
        }
        Keychain.set(CACHE_KEY, JSON.stringify(rangeTimer));
      }
      rangeTimer[_yestoday] = 0;
      rangeTimer[_today] = 0;
      timerKeys = [_yestoday, _today];
    } else {
      rangeTimer = getDay(5);
      timerKeys = Object.keys(rangeTimer);
    }
    await TotalBean();
    await getAmountData();
  } catch (e) {
    console.log(e);
  }
};

async function getAmountData() {
  let i = 0,
  page = 1;
  do {
    const response = await getJingBeanBalanceDetail(page);
    const result = response.code === '0';
    console.log(`第${page}页：${result ? '请求成功' : '请求失败'}`);
    if (response.code === '3') {
      i = 1;
      console.log(response);
    }
    if (response && result) {
      page++;
      let detailList = response.jingDetailList;
      if (detailList && detailList.length > 0) {
        for (let item of detailList) {
          const dates = item.date.split(' ');
          if (timerKeys.indexOf(dates[0]) > -1) {
            const amount = Number(item.amount);
            rangeTimer[dates[0]] += amount;
            if (_yestoday === dates[0]) {
              const yestodayAmount = Number(item.amount);
              if (yestodayAmount > 0) incomeBean += yestodayAmount;
              if (yestodayAmount < 0) expenseBean += yestodayAmount;
            }
            if (_today === dates[0]) {
              const todayAmount = Number(item.amount);
              if (todayAmount > 0) todayIncomeBean += todayAmount;
              if (todayAmount < 0) todayExpenseBean += todayAmount;
            }
          } else {
            i = 1;
            Keychain.set(CACHE_KEY, JSON.stringify(rangeTimer));
            break;
          }
        }
      }
    }
  } while (i === 0);
}

function getDay(dayNumber) {
  let data = {};
  let i = dayNumber;
  do {
    const today = new Date();
    const year = today.getFullYear();
    const targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * i;
    today.setTime(targetday_milliseconds);
    let month = today.getMonth() + 1;
    month = month >= 10 ? month : `0${month}`;
    let day = today.getDate();
    day = day >= 10 ? day : `0${day}`;
    data[`${year}-${month}-${day}`] = 0;
    i--;
  } while (i >= 0);
  return data;
}

async function TotalBean() {
  const url = 'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2';
  const request = new Request(url);
  request.headers = {
    cookie: cookie,
    Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
  };
  const response = await request.loadJSON();
  if (response.retcode === 0) {
    beanCount = response.base.jdNum;
    userImage = response.base.headImageUrl || "https://img11.360buyimg.com/jdphoto/s120x120_jfs/t21160/90/706848746/2813/d1060df5/5b163ef9N4a3d7aa6.png";
    userName = response.base.nickname;
    jValue = response.base.jvalue;
    plus = response.isPlusVip;
  } else {
    console.log('京东服务器返回空数据');
  }
  return response;
}

async function getJingBeanBalanceDetail(page) {
  try {
    const options = {
      url: `https://bean.m.jd.com/beanDetail/detail.json`,
      body: `page=${page}`,
      headers: {
        'X-Requested-With': `XMLHttpRequest`,
        Connection: `keep-alive`,
        'Accept-Encoding': `gzip, deflate, br`,
        'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
        Origin: `https://bean.m.jd.com`,
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15`,
        Cookie: cookie,
        Host: `bean.m.jd.com`,
        Referer: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`,
        'Accept-Language': `zh-cn`,
        Accept: `application/json, text/javascript, */*; q=0.01`,
      },
    };
    let params = { ...options, method: 'POST' };
    let request = new Request(params.url);
    Object.keys(params).forEach((key) => {
      request[key] = params[key];
    });
    return await request.loadJSON();
  } catch (e) {
    console.log(e);
  }
}

async function chartConfig(labels = [], datas = [], chartTextSize, topPadding) {
  const chartStr = `
  {
    'type': 'bar',
    'data': {
      'labels': ${JSON.stringify(labels)}, // 替换
      'datasets': [
      {
        type: 'line',
        backgroundColor: '#ffffff', // 圆圈填充颜色
        borderColor: getGradientFillHelper('vertical', ['#fa2d19', '#fa2d19']),
        'borderWidth': 2,
        pointRadius: 6,
        'fill': false,
        'data': ${JSON.stringify(datas)}, // 数据
      },
      ],
    },
    'options': {
      plugins: {
        datalabels: {
          display: true,
          align: 'top',
          color: '#${chartTextColor.hex}', // 文字颜色
          font: {
            family: 'ArialMT',
            size: ${chartTextSize}
          }
        },
      },
      layout: {
        padding: {
          left: -20,
          right: 0,
          top: ${topPadding},
          bottom: 0
        }
      },
      responsive: true,
      maintainAspectRatio: true,
      'legend': {
        'display': false,
      },
      scales: {
        xAxes: [
        {
          gridLines: {
            display: false,
            color: '#000000',
          },
          ticks: {
            display: false,
            fontColor: '#000000', 
            fontSize: '20',
          },
        },
        ],
        yAxes: [
        {
          ticks: {
            display: false,
            beginAtZero: false,
            fontColor: '#000000',
          },
          gridLines: {
            display: false,
            color: '#000000',
          },
        },
        ],
      },
    },
  }`;
  return chartStr;
}

async function createChart() {
  let labels = [],
    data = [];
  Object.keys(rangeTimer).forEach(function (month) {
    const value = rangeTimer[month];
    const arrMonth = month.split('-');
    labels.push(`${arrMonth[1]}.${arrMonth[2]}`);
    data.push(value);
  });
  let chartTextSize = 18; // K线图文字大小
  let topPadding = 20; // K线图顶边距
  if (config.widgetFamily == 'small') {
    data.splice(0, 2);
    labels.splice(0, 2);
    chartTextSize = chartTextSize + 7;
    topPadding = topPadding + 10;
  }
  const chartStr = await chartConfig(labels, data, chartTextSize, topPadding);
  const url = `https://quickchart.io/chart?w=${400 * size.SC}&h=${size.chartHeight * size.SC}&f=png&c=${encodeURIComponent(chartStr)}`;
  return await getImage(url);
}

// 获取金贴和钢镚
async function getExtraData() {
  //津贴查询
  const JTUrl = 'https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance';
  const JTReq = new Request(JTUrl);
  JTReq.headers = {
    cookie: cookie,
    Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
  };
  const JTData = await JTReq.loadJSON();
  //钢镚查询
  const GBUrl = 'https://coin.jd.com/m/gb/getBaseInfo.html';
  const GBReq = new Request(GBUrl);
  GBReq.headers = {
    cookie: cookie,
    Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
  };
  const GBData = await GBReq.loadJSON();
  const data = {
    jintie: JTData.resultData.data['balance'],
    gangbeng: GBData.gbBalance,
  };
  return data;
}

async function getPackageData() {
  var url =
    'https://wq.jd.com/bases/wuliudetail/notify?sceneval=2&sceneval=2&g_login_type=1&callback';
  var req = new Request(url);
  req.headers = {
    cookie: cookie,
    Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
  };
  var data = await req.loadJSON();
  if (data.errCode == 0) {
    console.log('包裹获取正常');
  } else {
    console.log('包裹获取失败');
    var data = {
      dealLogList: [
        {
          stateName: 'Cookie失效了',
          name: 'Cookie失效了',
          img: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/',
          createTime: 'Cookie失效了',
          wlStateDesc: 'Cookie失效了',
        },
      ],
    };
  }
  return data;
}

async function getBaitiaoData() {
  const req = new Request(
    'https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew',
  );
  req.method = 'POST';
  req.body =
    'reqData={"clientType":"ios","clientVersion":"13.2.3","deviceId":"","environment":"3"}';
  req.headers = {
    cookie: cookie,
  };
  const res = await req.loadJSON();
  return res;
}

async function getImage(url) {
  const req = await new Request(url);
  return await req.loadImage();
}

if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '京东多合一';
    this.en = 'jd_all_one';
    this.run();
  }

    jdWebView = async () => {
    const webView = new WebView();
    const url =
      "https://mcr.jd.com/credit_home/pages/index.html?btPageType=BT&channelName=024";
    await webView.loadURL(url);
    await webView.present(false);
    const req = new Request(
      "https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew"
    );
    req.method = "POST";
    req.body =
      'reqData={"clientType":"ios","clientVersion":"13.2.3","deviceId":"","environment":"3"}';
    await req.loadJSON();
    const cookies = req.response.cookies;
    const account = { username: "", cookie: "" };
    const cookie = [];
    cookies.forEach((item) => {
      const value = `${item.name}=${item.value}`;
      if (item.name === "pt_key") cookie.push(value);
      if (item.name === "pt_pin") {
        account.username = item.value;
        cookie.push(value);
      }
    });
    account.cookie = cookie.join("; ");
    console.log(account);

    if (account.cookie) {
      this.settings = { ...this.settings, ...account };
      this.saveSettings(false);
      console.log(`${this.name}: cookie获取成功，请关闭窗口！`);
      this.notify(this.name, "cookie获取成功，请关闭窗口！");
    }
  };

  run = () => {
    if (config.runsInApp) {
      this.registerAction("账号设置", async () => {
        const index = await this.generateAlert("设置账号信息", [
          "网站登录",
          "手动输入",
        ]);
        if (index === 0) {
          await this.jdWebView();
        } else {
          await this.setAlertInput("账号设置", "京东账号 Ck", {
            username: "昵称",
            cookie: "Cookie",
          });
        }
      });
      this.registerAction('代理缓存', this.actionSettings);
      this.registerAction('基础设置', this.setWidgetConfig);
    }
    textColor = this.widgetColor
    cookie = this.settings.cookie ? `${this.settings.cookie};` : cookie;
    userID = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
  };

  CookiesData = [];

  // 加载京东 Ck 节点列表
  _loadJDCk = async () => {
    try {
      const CookiesData = await this.getCache('CookiesJD');
      if (CookiesData) {
        this.CookiesData = this.transforJSON(CookiesData);
      }
      const CookieJD = await this.getCache('CookieJD');
      if (CookieJD) {
        const userName = CookieJD.match(/pt_pin=(.+?);/)[1];
        const ck1 = {
          cookie: CookieJD,
          userName,
        };
        this.CookiesData.push(ck1);
      }
      const Cookie2JD = await this.getCache('CookieJD2');
      if (Cookie2JD) {
        const userName = Cookie2JD.match(/pt_pin=(.+?);/)[1];
        const ck2 = {
          cookie: Cookie2JD,
          userName,
        };
        this.CookiesData.push(ck2);
      }
      return true;
    } catch (e) {
      console.log(e);
      this.CookiesData = [];
      return false;
    }
  };

  async actionSettings() {
    try {
      const table = new UITable();
      if (!(await this._loadJDCk())) throw 'BoxJS 数据读取失败';
      // 如果是节点，则先远程获取
      this.settings.cookieData = this.CookiesData;
      this.saveSettings(false);
      this.CookiesData.map((t, index) => {
        const r = new UITableRow();
        r.addText(`parameter：${index}    ${t.userName}`);
        r.onSelect = (n) => {
          this.settings.username = t.userName;
          this.settings.cookie = t.cookie;
          this.saveSettings();
        };
        table.addRow(r);
      });
      let body = '京东 Ck 缓存成功，根据下标选择相应的 Ck';
      if (this.settings.cookie) {
        body += '，或者使用当前选中Ck：' + this.settings.username;
      }
      this.notify(this.name, body);
      table.present(false);
    } catch (e) {
      this.notify(
        this.name,
        '',
        'BoxJS 数据读取失败，请点击通知查看教程',
        'https://chavyleung.gitbook.io/boxjs/awesome/videos',
      );
    }
  }

  async render() {
    await this.getWidgetBackgroundImage(w);
    CACHE_KEY = 'cache_jd_' + userID;
    packageData = await getPackageData();
    packageNum = packageData.dealLogList.length;
    extraData = await getExtraData();
    await init();
    if (showBaitiao) {
      baitiaoData = await getBaitiaoData();
      baitiaoTitle = baitiaoData['resultData']['data']['bill']['title'];
      baitiaoAmount = baitiaoData['resultData']['data']['bill'][
        'amount'
      ].replace(/,/g, '');
      baitiaoDesc = baitiaoData['resultData']['data']['bill'][
        'buttonName'
      ].replace(/最近还款日/g, '');
    }

    if (config.widgetFamily == 'small') {
      return await renderSmallWidget();
    } else if (config.widgetFamily == 'large') {
      return await renderLargeWidget();
    } else {
      return await renderMediumWidget();
    }
  }
}

await Runing(Widget, '', false);