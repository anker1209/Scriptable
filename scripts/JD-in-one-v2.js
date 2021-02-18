// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: shopping-cart;
// Author: 脑瓜
// 电报群: https://t.me/Scriptable_JS @anker1209
// 采用了2Ya美女的京豆收支脚本及DmYY依赖 https://github.com/dompling/Scriptable/tree/master/Scripts
// version:2.0.0
// update:2021/02/15
let fmLocal = FileManager.local();
let cookie ='';
let userID = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
// #################设置###############
const size = {
  SC: 1.00, // 01.全局缩放比例。排版溢出、显示不全的请优先调低此数值，建议递减0.05调整，如0.95、0.90……
  logo: 30, // 02.logo大小
  userImage: 70, // 03.用户头像大小
  userStack: 103, // 04.左侧用户信息栏整体宽度
  division: 25, // 05.左侧与右侧间距
  chartHeight: 130, // 06.京豆图表高度。京豆数据未与日期对齐的，请调低此数值
  chartText: 18, // 07.京豆图表数据文字大小
  chartDay: 9, // 08.京豆图表日期文字大小
  lineChartTopPadding: 25, // 09.京豆K线图顶边距。京豆数据在顶部被剪切显示不全的请调高此数值
  barChartTopPadding: 5 // 10.京豆柱状图和曲线面积图顶边距。京豆数据在顶部被剪切显示不全的请调高此数值
};
const chartTextColor = Color.dynamic(new Color('999999'),new Color('999999'),); // 11.京豆K线图浅色和深色模式对应的京豆数据文字颜色。注意切换模式以后颜色不会立即刷新，手动刷新或自动刷新
const showBaitiao = true; // 12.是否显示白条还款信息，关闭或者打开无待还会显示下面选择的钱包内容
const showPackage = false; // 13.是否显示包裹信息
const smallShowType = 1; // 14.小组件显示形式。1：京豆、钱包数据；2：个人信息
const beanShowType = 1; // 15.中组件京豆显示类型。1：双日视图；2：K线图；3：柱状图；4：曲线面积图
const smallBeanShowType = 1; // 16.小组件京豆显示类型。1：双日视图；2：K线图；3：柱状图；4：曲线面积图
const walletShowType = 2; // 17.钱包内容显示。1：红包；2：钢镚和金贴。若要显示钱包内容，白条需关闭或者白条打开无待还
const interval = 10; // 18.数据请求间隔时间。请设置合适时间，避免频繁访问接口数据以及加载缓慢。单位：分钟
const removeAllCaches = false; // 19.是否清除所有缓存数据
const resetBeanCache = false; // 20.是否重置京豆缓存
const alwaysRefreshChart = true; // 21.是否保持刷新京豆图表。设置为true，每次刷新组件都会随机刷新图表颜色，设置为false则只有在京豆数据有变化的情况下刷新颜色。 建议在排版调整没有问题后，将该项设置为false，此项设置为true会大幅加长预览载入速度
// ####################################

const logo = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/f09e7977-b161-4361-ac78-e64729192ee6.png';
const JDImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/43300bf7-61a2-4bd1-94a1-bf2faa2ed9e8.png';
const beanImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/7ea91cf8-6dea-477c-ae72-cb4d3f646c34.png';
const plusFG = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/ebc4a205-8ed5-4950-a0c6-82f8a274dace.png';
const baitiaoImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/30c40f5b-7428-46c3-a2c0-d81b2b95ec41.png';
const plusIcon = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/06f78540-a5a4-462e-b8c5-98cb8059efc1.png';
const walletImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/cd89ceec-7895-41ee-a1a3-3d3e7223035f.png';
const jingtieImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/16a7038e-6082-4ad8-b17f-fdd08266fb22.png';
const gangbengImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/9704e332-9e7f-47e8-b09a-1f1991d4aa84.png';

let packageData, packageNum;
let baitiaoData, baitiaoTitle, baitiaoAmount, baitiaoDesc;
let cacheChart = false;
let beanCount = 0;
let maxDays = 6;
let rangeTimer = {};
let timerKeys = [];
let textColor;
let CACHE_KEY;

let colorArr = [['#FFF000', '#E62490'], ['#FDEB71', '#F8D800'], ['#ABDCFF', '#0396FF'], ['#FEB692', '#EA5455'], ['#FEB692', '#EA5455'], ['#CE9FFC', '#7367F0'], ['#90F7EC', '#32CCBC'], ['#FFF6B7', '#F6416C'], ['#81FBB8', '#28C76F'], ['#E2B0FF', '#9F44D3'], ['#F97794', '#623AA2'], ['#FCCF31', '#F55555'], ['#F761A1', '#8C1BAB'], ['#43CBFF', '#9708CC'], ['#5EFCE8', '#736EFE'], ['#FAD7A1', '#E96D71'], ['#00C3FF', '#FFFF1C'], ['#FEC163', '#DE4313'], ['#F6CEEC', '#D939CD'], ['#FDD819', '#E80505'], ['#FFF3B0', '#CA26FF'], ['#2AFADF', '#4C83FF'], ['#EECDA3', '#EF629F'], ['#C2E59C', '#64B3F4'], ['#00DBDE', '#FC00FF'], ['#FFF886', '#F072B6'], ['#F5CBFF', '#C346C2'], ['#FFF720', '#3CD500'], ['#FF6FD8', '#3813C2'], ['#EE9AE5', '#5961F9'], ['#FF5F6D', '#FFC371'], ['#FFD3A5', '#FD6585'], ['#C2FFD8', '#465EFB'], ['#FD6E6A', '#FFC600'], ['#FFC600', '#FD6E6A'], ['#00C9FF', '#92FE9D'], ['#EE9CA7', '#FFDDE1'], ['#F0FF00', '#58CFFB'], ['#FFE985', '#FA742B'], ['#FFAA85', '#B3315F'], ['#72EDF2', '#5151E5'], ['#F6D242', '#FF52E5'], ['#FF4E50', '#F9D423'], ['#3C8CE7', '#00EAFF'], ['#FFA8A8', '#FCFF00'], ['#FF96F9', '#C32BAC']];
let chartColor = colorArr[Math.floor(Math.random() * colorArr.length)];
//chartColor = ['#DB36A4', '#F7FF00']; // 固定京豆图表渐变填充颜色

let caches = [];
Array.prototype.pushCache = function() {
  for (var i = 0; i < arguments.length; i++) {
    var ele = arguments[i];
    if (this.indexOf(ele) == -1) {
      this.push(ele);
    }
  }
};

let smallSign = '';
if (config.widgetFamily == 'small') {
  smallSign = '_small';
}

let doubleDay = [];
const doubleDate = getDay(1);
doubleDay = Object.keys(doubleDate);
const _yestoday = doubleDay[0];
const _today = doubleDay[1];

const w = new ListWidget();
w.url = "openApp.jdMobile://"
w.setPadding(14 * size.SC, 14 * size.SC, 14 * size.SC, 14 * size.SC);
// #####################小组件###################
async function renderSmallWidget() {
  const bodyStack = w.addStack();
  bodyStack.layoutVertically();
  if (smallShowType == 2) {
    await setUserShow(bodyStack);
  } else {
    await setHeaderShow(bodyStack);
    bodyStack.addSpacer();
    switch (smallBeanShowType) {
      case 2:
        await setChartShow(bodyStack, 2);
        break;
      case 3:
        await setChartShow(bodyStack, 3);
        break;
      case 4:
        await setChartShow(bodyStack, 4);
        break;
      default:
        await setBeanShow(bodyStack, 22 * size.SC, 40 * size.SC);
    }
    bodyStack.addSpacer();
    if (showBaitiao && baitiaoAmount > 0) {
      await setSmallBaitiaoShow(bodyStack);
    } else if (walletShowType == 1) {
      await setSmallRedPackageShow(bodyStack);
    } else {
      await setCoinShow(bodyStack, true);
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
  } else {
    switch (beanShowType) {
      case 2:
        await setChartShow(mainStack, 2);
        break;
      case 3:
        await setChartShow(mainStack, 3);
        break;
      case 4:
        await setChartShow(mainStack, 4);
        break;
      default:
        await setBeanShow(mainStack, 30 * size.SC, 50 * size.SC);
    }
    mainStack.addSpacer();
  }
  if (showBaitiao && baitiaoAmount > 0) {
    await setBaitiaoShow(mainStack);
  } else if (walletShowType == 1) {
    await setRedPackageShow(mainStack);
  } else {
    await setCoinShow(mainStack);
  }
  //log(caches)
  if (removeAllCaches) {
    removeCaches(caches);
    console.log('所有缓存数据已清空')
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
  const subStack = imgStack.addStack();
  subStack.size = new Size(size.userImage * size.SC, size.userImage * size.SC);
  subStack.cornerRadius = size.userImage / 2 * size.SC;
  subStack.backgroundImage = await getImageByUrl(userImage, `userImage_${userID}`);
  if (plus) {
    const userImg = subStack.addImage(await getImageByUrl(plusFG, 'plusFGImage'));
  }
  userImgStack.addSpacer();
  userStack.addSpacer();
  // 物流提示
  const tipStack = userStack.addStack();
  tipStack.addSpacer();
  let signIcon = SFSymbol.named('checkmark.circle.fill');
  const signItem = tipStack.addImage(signIcon.image);
  signItem.tintColor = new Color('007aff'); // 签到提示图标颜色
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
    const nameImg = nameStack.addImage(await getImageByUrl(plusIcon, 'plusIcon'));
    nameImg.imageSize = new Size(15 * size.SC, 15 * size.SC);
  } else {
    const person = SFSymbol.named('person.circle.fill');
    const nameIcon = nameStack.addImage(person.image);
    nameIcon.imageSize = new Size(15 * size.SC, 15 * size.SC);
    nameIcon.tintColor = new Color('007aff'); // 昵称前图标颜色，Plus用户改不了
  }
  nameStack.addSpacer(5 * size.SC);
  const name = nameStack.addText(nickName);
  name.lineLimit = 1;
  name.font = Font.regularSystemFont(14 * size.SC);
  userStack.addSpacer(5 * size.SC);
  // 京享值
  const valueStack = userStack.addStack();
  valueStack.centerAlignContent();
  const tagIcon = SFSymbol.named('tag.circle.fill');
  const lableIcon = valueStack.addImage(tagIcon.image);
  lableIcon.imageSize = new Size(15 * size.SC, 15 * size.SC);
  lableIcon.tintColor = new Color('fa2d19'); // 京享值前图标颜色
  valueStack.addSpacer(5 * size.SC);
  const value = valueStack.addText(jValue.toString());
  value.font = Font.mediumSystemFont(14 * size.SC);
  
  valueStack.addSpacer(5 * size.SC);
  const jStack = valueStack.addStack();
  jStack.backgroundColor = new Color('fa2d19'); // “京享”二字背景颜色
  jStack.cornerRadius = 5;
  jStack.setPadding(1 * size.SC, 4 * size.SC, 1 * size.SC, 4 * size.SC);
  const jLable = jStack.addText('京享');
  jLable.font = Font.systemFont(8 * size.SC);
  jLable.textColor = new Color('FFFFFF') // “京享”二字字体颜色
  
  ;[name, value].map(t => t.textColor = textColor);
}
// #####################顶部内容###################
async function setHeaderShow(widget, image) {
  const topStack = widget.addStack();
  topStack.centerAlignContent();
  const JDLogo = topStack.addImage(await getImageByUrl(logo, 'logoImage'));
  JDLogo.imageSize = new Size(size.logo * size.SC, size.logo * size.SC);
  if (image) {
    topStack.addSpacer(10 * size.SC);
    const JD = topStack.addImage(await getImageByUrl(image, 'jingdongImage'));
    JD.imageSize = new Size(194 * 0.2 * size.SC, 78 * 0.2 * size.SC);
  }
  topStack.addSpacer();
  const jdBean = topStack.addText(beanCount.toString());
  jdBean.font = Font.mediumSystemFont(20 * size.SC);
  jdBean.textColor = new Color('fa2d19'); // 右上角京豆数颜色
  const desStack = topStack.addStack();
  desStack.layoutVertically();
  desStack.addSpacer(5.5 * size.SC);
  const desText = desStack.addText(' 京豆'); 
  desText.font = Font.mediumSystemFont(10 * size.SC);
  desText.textColor = new Color('fa2d19', 0.7);
}
// #####################京豆收支###################
async function setBeanShow(widget, textSize, imageSize) {
  const beanStack = widget.addStack();
  // 今日收支
  const yestodayStack = beanStack.addStack();
  yestodayStack.layoutVertically();
  rowBeanCell(
    yestodayStack,
    rangeTimer[_yestoday][1].toString(),
    rangeTimer[_yestoday][0].toString(),
    textSize,
    '昨日',
  );
  beanStack.addSpacer();
  // 京豆图片
  const ddStack = beanStack.addStack();
  ddStack.layoutVertically();
  const ddImg = ddStack.addImage(await getImageByUrl(beanImg, 'beanImage'));
  ddImg.imageSize = new Size(imageSize, imageSize);
  beanStack.addSpacer();
  // 昨日收支
  const todayStack = beanStack.addStack();
  todayStack.layoutVertically();
  rowBeanCell(
    todayStack,
    rangeTimer[_today][1].toString(),
    rangeTimer[_today][0].toString(),
    textSize,
    '今日',
  );
}
// #####################京豆图表###################
async function setChartShow(widget, type) {
  let beanNum = [], beanDate = [];
  Object.keys(rangeTimer).forEach(function (day) {
    const numValue = rangeTimer[day];
    const arrDay = day.split('-');
    beanDate.push(arrDay[2]);
    beanNum.push(numValue[0]);
  });
  if (config.widgetFamily == 'small') {
    beanDate.splice(0, 2);
    beanNum.splice(0, 2);
  }
  const chartStack = widget.addStack();
  const chartImage = chartStack.addImage(await createChart(type));
  const beanDateStack = widget.addStack();
  let showDays = beanDate.length;
  for (let i = 0; i < showDays; i++) {
    beanDateStack.addSpacer();
    let subStack = beanDateStack.addStack();
    let beanDay = beanDateStack.addText(beanDate[i]);
    beanDay.textColor = textColor;
    beanDay.font = new Font('ArialMT', size.chartDay * size.SC);
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
async function setCoinShow(widget, vertical = false) {
  const extraData = await getExtraData();
  const extraDataStack = widget.addStack();
  const imageStack = extraDataStack.addStack();
  const jingtieImage = await getImageByUrl(jingtieImg, 'jingtieImage');
  const gangbengImage = await getImageByUrl(gangbengImg, 'gangbengImage');
  const jingtieValue = extraData.jintie;
  const gangbengValue = extraData['gangbeng'].toString();
  const dataStack = extraDataStack.addStack();
  if (vertical) dataStack.layoutVertically();
  rowCell(dataStack, jingtieImage, jingtieValue, '金贴');
  if (vertical) extraDataStack.addSpacer(5 * size.SC);
  if (!vertical) dataStack.addSpacer(20 * size.SC);
  rowCell(dataStack, gangbengImage, gangbengValue, '钢镚');
}
// #####################京东红包##################
async function setRedPackageShow(widget) {
  const redPackageData = await getRedPackageData();
  const redPackageImage = await getImageByUrl(walletImg, 'walletImage')
  const redPackage = redPackageData.data.balance;
  const expiredBalance = redPackageData.data.expiredBalance;
  let expiredDesc = `今日过期${expiredBalance}`
  if (expiredBalance == '') expiredDesc = `今日无过期`
  rowWalletCell(widget, redPackageImage, `通用红包`, redPackage, expiredDesc);
}
// #####################小组件红包##################
async function setSmallRedPackageShow(widget) {
  const redPackageData = await getRedPackageData();
  const redPackageImage = await getImageByUrl(walletImg, 'walletImage')
  const redPackage = redPackageData.data.balance;
  const expiredBalance = redPackageData.data.expiredBalance;
  let expiredDesc = `今日过期${expiredBalance}`
  if (expiredBalance == '') expiredDesc = `今日无过期`
  rowSmallWalletCell(widget, redPackageImage, `通用红包`, redPackage, expiredDesc);
}
// #####################京东白条##################
async function setBaitiaoShow(widget) {
  const baitiaoImage = await getImageByUrl(baitiaoImg, 'baitiaoImage');
  rowWalletCell(widget, baitiaoImage, baitiaoTitle, baitiaoAmount, baitiaoDesc);
}
// ####################小组件白条##################
async function setSmallBaitiaoShow(widget) {
  const baitiaoImage = await getImageByUrl(baitiaoImg, 'baitiaoImage');
  rowSmallWalletCell(widget, baitiaoImage, baitiaoTitle, baitiaoAmount, baitiaoDesc);
}

function rowCell(widget, image, value, title) {
  const rowStack = widget.addStack();
  rowStack.centerAlignContent();
  const rowImage = rowStack.addImage(image);
  rowImage.imageSize = new Size(13 * size.SC, 13 * size.SC);
  rowStack.addSpacer();
  const rowValue = rowStack.addText(value);
  rowValue.font = Font.mediumSystemFont(15 * size.SC);
  rowStack.addSpacer();
  const rowTitle = rowStack.addText(title);
  rowTitle.font = Font.regularSystemFont(13 * size.SC);
  ;[rowValue, rowTitle].map(t => t.textColor = textColor);
}

function rowBeanCell(widget, min, add, textSize, label) {
  const rowOne = widget.addStack();
  const labelText = rowOne.addText(label);
  labelText.font = Font.regularSystemFont(10 * size.SC);
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

function rowWalletCell(widget, image, title, value, desc) {
  const stackOne = widget.addStack();
  stackOne.centerAlignContent();
  const stackOneImage = stackOne.addImage(image);
  stackOneImage.imageSize = new Size(127 * 0.17 * size.SC, 75 * 0.17 * size.SC);
  stackOne.addSpacer(5 * size.SC);
  const stackOneTitle = stackOne.addText(title);
  stackOneTitle.font = Font.regularSystemFont(13 * size.SC);
  stackOne.addSpacer();
  const stackOneValue = stackOne.addText(value);
  stackOneValue.font = Font.mediumSystemFont(15 * size.SC);
  stackOne.addSpacer();
  const stackOneDesc = stackOne.addText(desc);
  stackOneDesc.font = Font.regularSystemFont(10 * size.SC);
  stackOneDesc.textOpacity = 0.7;
  ;[stackOneTitle, stackOneValue, stackOneDesc].map(t => t.textColor = textColor);
}

function rowSmallWalletCell(widget, image, title, value, desc) {
  const stackOne = widget.addStack();
  stackOne.centerAlignContent();
  const stackOneImage = stackOne.addImage(image);
  stackOneImage.imageSize = new Size(127 * 0.17 * size.SC, 75 * 0.17 * size.SC);
  stackOne.addSpacer();
  const stackOneValue = stackOne.addText(value);
  stackOneValue.font = Font.mediumSystemFont(15 * size.SC);
  widget.addSpacer(5 * size.SC);
  const stackTwo = widget.addStack();
  stackTwo.centerAlignContent();
  const stackTwoTitle = stackTwo.addText(title);
  stackTwoTitle.font = Font.regularSystemFont(13 * size.SC);
  stackTwo.addSpacer();
  const stackTwoDesc = stackTwo.addText(desc);
  stackTwoDesc.font = Font.regularSystemFont(10 * size.SC);
  stackTwoDesc.textOpacity = 0.7;
  ;[stackOneValue, stackTwoTitle, stackTwoDesc].map(t => t.textColor = textColor);
}

async function init() {
  let beanCacheKey = `userData${smallSign}_${userID}`;
  let beanCache;
  if (loadStringCache(beanCacheKey).length > 0) {
    let beanCacheData = JSON.parse(loadStringCache(beanCacheKey));
    beanCache = beanCacheData.base.jdNum;
  }
  await TotalBean();
  console.log(`【京豆数据】${beanCache}`)
  console.log(`【京豆数据】${beanCount}`)
  try {
    if (!cookie) return;
    if (Keychain.contains(CACHE_KEY) && !resetBeanCache) {
      rangeTimer = JSON.parse(Keychain.get(CACHE_KEY));
      timerKeys = Object.keys(rangeTimer);
      if (rangeTimer.hasOwnProperty(_today) && beanCache != 0 && beanCache == beanCount) {
        if (!alwaysRefreshChart) cacheChart = true;
        console.log('【京豆数据】无变化，使用缓存数据')
        return;
      }
      if (timerKeys.length >= maxDays) {
        for (let i = 0; i < timerKeys.length - maxDays; i++) {
          delete rangeTimer[timerKeys[i]];
        }
        cacheChart = false;
        Keychain.set(CACHE_KEY, JSON.stringify(rangeTimer));
      }
      rangeTimer[_today] = [0, 0];
      timerKeys = [_today];
    } else {
      rangeTimer = getDay(5);
      timerKeys = Object.keys(rangeTimer);
    }
    await getAmountData();
    console.log(rangeTimer)
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
            rangeTimer[dates[0]][0] += amount;
            if (amount < 0) 
            rangeTimer[dates[0]][1] += amount;
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
    data[`${year}-${month}-${day}`] = [0, 0];
    i--;
  } while (i >= 0);
  return data;
}

async function TotalBean() {
  const dataName = "【京豆数据】";
  let userCache = 'userData';
  if (config.widgetFamily == 'small') {
    userCache = 'userData_small';
  }
  const url = 'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2';
  const options = {
    headers: {
      cookie: cookie,
      Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
    }
  };
  const response = await httpRequest(dataName, url, true, options, userCache);
  if (response.retcode === 0) {
    beanCount = response.base.jdNum;
    userImage = response.base.headImageUrl || "https://img11.360buyimg.com/jdphoto/s120x120_jfs/t21160/90/706848746/2813/d1060df5/5b163ef9N4a3d7aa6.png";
    nickName = response.base.nickname;
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

function lineChartConfig(labels = [], datas = [], chartTextSize, topPadding) {
  const chartStr = `
  {
    'type': 'bar',
    'data': {
      'labels': ${JSON.stringify(labels)}, // 替换
      'datasets': [
      {
        type: 'line',
        backgroundColor: '#ffffff', // 圆圈填充颜色
        borderColor: getGradientFillHelper('horizontal', ['#FA2D19', '#FA2D19']),
        'borderWidth': 2,
        pointRadius: 6,
        'fill': false,
        showLine: true,
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

function barChartConfig(labels = [], datas = [], chartTextSize, topPadding, showType) {
  const chartStr = `
  {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(labels)},
    datasets: [
      {
        type: '${showType}',
        borderWidth: 0,
        pointRadius: 0,
        barPercentage: 0.5,
        backgroundColor: getGradientFillHelper('vertical', ${JSON.stringify(chartColor)}),
        borderColor: false,
        data: ${JSON.stringify(datas)},
      },
    ],
  },
  options: {
    plugins: {
      datalabels: {
        display: true,
        align: 'top',
        offset: -4,
        anchor:'end',
        color: '#${chartTextColor.hex}',
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
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    scales: {
      xAxes: [ // X 轴线
        {
          gridLines: {
            offsetGridLines: true,
            display: false,
          },
          ticks: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            display: false,
            beginAtZero: true,
          },
          gridLines: {
            offsetGridLines: true,
            display: false,
          },
        },
      ],
    },
  },
  }`;
  return chartStr;
}

async function createChart(type) {
  let labels = [], data = [];
  Object.keys(rangeTimer).forEach(function (month) {
    const value = rangeTimer[month];
    const arrMonth = month.split('-');
    labels.push(`${arrMonth[1]}.${arrMonth[2]}`);
    data.push(value[0]);
  });
  let chartCacheKey = `chart${type}Image${smallSign}_${userID}`;
  let chartTextSize = size.chartText;
  let lineTopPadding = size.lineChartTopPadding;
  let barTopPadding = size.barChartTopPadding;
  if (config.widgetFamily == 'small') {
    data.splice(0, 2);
    labels.splice(0, 2);
    chartTextSize = chartTextSize + 7;
    lineTopPadding = lineTopPadding + 10;
    barTopPadding = barTopPadding + 5;
  }
  let chartStr;
  switch (type) {
    case 3:
    chartStr = barChartConfig(labels, data, chartTextSize, barTopPadding, 'bar');
    break;
    case 4:
    chartStr = barChartConfig(labels, data, chartTextSize, barTopPadding, 'line');
    break;
    default:
    chartStr = lineChartConfig(labels, data, chartTextSize, lineTopPadding);
  }
  const url = `https://quickchart.io/chart?w=${400 * size.SC}&h=${size.chartHeight * size.SC}&f=png&c=${encodeURIComponent(chartStr)}`;
  return await getImageByUrl(url, chartCacheKey, cacheChart);
}

// 获取金贴和钢镚
async function getExtraData() {
  //津贴查询
  const JTDataName = "【金贴数据】";
  const JTUrl = 'https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance';
  const options = {
    headers: {
      cookie: cookie,
      Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
    }
  };
  const JTData = await httpRequest(JTDataName, JTUrl, true, options, 'jintieData');
  //钢镚查询
  const GBDataName = "【钢镚数据】";
  const GBUrl = 'https://coin.jd.com/m/gb/getBaseInfo.html';
  const GBData = await httpRequest(GBDataName, GBUrl, true, options, 'gangbengData');
  const data = {
    jintie: JTData.resultData.data['balance'],
    gangbeng: GBData.gbBalance,
  };
  return data;
}

async function getPackageData() {
  const dataName = "【包裹数据】";
  const url =
    'https://wq.jd.com/bases/wuliudetail/notify?sceneval=2&sceneval=2&g_login_type=1&callback';
  const options = {
    headers: {
      cookie: cookie,
      Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
    }
  };
  const data = await httpRequest(dataName, url, true, options, 'packageData');
  if (data.errCode == 0) {
    console.log('【包裹数据】获取正常');
  } else {
    console.log('【包裹数据】获取失败，cookie错误或未能正确获取到');
  };
  return data;
}

async function getRedPackageData() {
  const dataName = "【红包数据】";
  const url =
    'https://wq.jd.com/user/info/QueryUserRedEnvelopes?channel=1&type=0&page=0&pageSize=0&expiredRedFlag=1&sceneval=2&g_login_type=1';
  const options = {
    headers: {
      cookie: cookie,
      Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
    }
  };
  const data = await httpRequest(dataName, url, true, options, 'redPackageData');
  return data;
}

async function getBaitiaoData() {
  const dataName = "【白条数据】";
  const url = 'https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew';
  const options = {
    body: 'reqData={"clientType":"ios","clientVersion":"13.2.3","deviceId":"","environment":"3"}',
    headers: {
      cookie: cookie,
    }
  };
  const res = await httpRequest(dataName, url, true, options, 'baitiaoData', 'POST');
  return res;
}
// #############################################
async function getImageByUrl(url, pointCacheKey, useCache = true, logable = true) {
  let cacheKey = pointCacheKey;
  caches.pushCache(cacheKey);
  if (useCache) {
    const cacheImg = loadImgCache(cacheKey)
    if (cacheImg != undefined && cacheImg != null) {
      if (logable) console.log(`使用缓存图片：${pointCacheKey}`)
      return loadImgCache(cacheKey);
    }
  }

  try {
    if (logable) console.log(`在线请求图片：${pointCacheKey}`)
    const req = new Request(url)
    const img = await req.loadImage()
    saveImgCache(cacheKey, img)
    return img
  } catch (e) {
    console.error(`图片加载失败：${e}`)
    let cacheImg = loadImgCache(cacheKey)
    if (cacheImg != undefined) {
      console.log(`使用缓存图片：${pointCacheKey}`)
      return cacheImg
    }
    console.log(`使用预设图片`)
    let ctx = new DrawContext()
    ctx.size = new Size(80, 80)
    ctx.setFillColor(Color.darkGray())
    ctx.fillRect(new Rect(0, 0, 80, 80))
    return await ctx.getImage()
  }
}

function saveImgCache(cacheKey, img) {
  const cacheFile = fmLocal.joinPath(FileManager.local().documentsDirectory(), cacheKey)
  fmLocal.writeImage(cacheFile, img)
}

function loadImgCache(cacheKey) {
  const cacheFile = fmLocal.joinPath(FileManager.local().documentsDirectory(), cacheKey)
  const fileExists = fmLocal.fileExists(cacheFile)
  let img = undefined
  if (fileExists) {
    img = fmLocal.readImage(cacheFile)
  }
  return img
}

async function httpRequest(dataName, url, json = true, options, pointCacheKey, type = 'GET', logable = false) {
  let cacheKey = `${pointCacheKey}_${userID}`
  caches.pushCache(cacheKey);
  // 读取本地缓存
  const localCache = loadStringCache(cacheKey) ;
  // 判断是否需要刷新
  const lastCacheTime = getCacheModificationDate(cacheKey) ;
  const timeInterval = Math.floor((getCurrentTimeStamp() - lastCacheTime) / 60);
  // 过时且有本地缓存则直接返回本地缓存数据
  console.log('');
  console.log(`${dataName}缓存${timeInterval}分钟前，有效期${interval}分钟，${localCache.length}`);
  if (timeInterval < interval && localCache != null && localCache.length > 0) {
    console.log(`${dataName}读取缓存`);
    return json ? JSON.parse(localCache) : localCache;
  }

  let data = null
  try {
    console.log(`${dataName}在线请求`);
    let req = new Request(url);
    req.method = type;
    Object.keys(options).forEach((key) => {
      req[key] = options[key];
    });
    data = await (json ? req.loadJSON() : req.loadString());
  } catch (e) {
    console.error(`${dataName}请求失败：${e}`);
  }

  // 判断数据是否为空（加载失败）
  if (!data && localCache != null && localCache.length > 0) {
    console.log(`${dataName}获取失败，读取缓存`);
    return json ? JSON.parse(localCache) : localCache;
  }
  // 存储缓存
  saveStringCache(cacheKey, json ? JSON.stringify(data) : data);
  // 是否打印响应数据
  if (logable) {
    console.log(`${dataName}在线请求响应数据：${JSON.stringify(data)}`);
  }
  return data
}

function loadStringCache(cacheKey) {
  const cacheFile = fmLocal.joinPath(FileManager.local().documentsDirectory(), cacheKey);
  const fileExists = fmLocal.fileExists(cacheFile);
  let cacheString = '';
  if (fileExists) {
    cacheString = fmLocal.readString(cacheFile);
  }
  return cacheString;
}

function saveStringCache(cacheKey, content) {
  const cacheFile = fmLocal.joinPath(FileManager.local().documentsDirectory(), cacheKey);
  fmLocal.writeString(cacheFile, content);
}

function getCacheModificationDate(cacheKey) {
  const cacheFile = fmLocal.joinPath(FileManager.local().documentsDirectory(), cacheKey);
  const fileExists = fmLocal.fileExists(cacheFile);
  if (fileExists) {
    return fmLocal.modificationDate(cacheFile).getTime() / 1000;
  } else {
    return 0;
  }
}

function getCurrentTimeStamp() {
  return new Date().getTime() / 1000;
}

function removeCache(cacheKey) {
  const cacheFile = fmLocal.joinPath(FileManager.local().documentsDirectory(), cacheKey)
  const fileExists = fmLocal.fileExists(cacheFile);
  if (fileExists) {
    fmLocal.remove(cacheFile);
    console.log(`清除缓存${cacheKey}`)
  }
  return;
}

function removeCaches(cacheKeyList) {
for (const cacheKey of cacheKeyList) {
removeCache(cacheKey)
}
}

async function renderFail (msg) {
  const w = new ListWidget()
  w.addText("⚠️")
  w.addSpacer(10)
  const t = w.addText(msg)
  t.textColor = Color.red()
  t.font = Font.boldSystemFont(14)
  return w
  }
// #############################################
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '京东多合一';
    this.en = 'jd_in_one';
    this.run();
  }

CookiesData = [];

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

    textColor = this.widgetColor;

    this.JDindex =
      typeof args.widgetParameter === "string"
        ? parseInt(args.widgetParameter)
        : false;
    try {
      const cookieData = this.settings.cookieData;
      if (this.JDindex !== false && cookieData[this.JDindex]) {
        cookie = cookieData[this.JDindex]["cookie"];
      } else {
        cookie = this.settings.cookie ? `${this.settings.cookie};` : cookie;
      }
      userID = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
      if (!cookie) throw "京东 CK 获取失败";
      return true;
    } catch (e) {
      this.notify("错误提示", e);
      return false;
    }
  };

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
    CACHE_KEY = `cache_${Script.name()}_${userID}`;
    packageData = await getPackageData();
    packageNum = packageData.dealLogList.length;
    await init();
    if (showBaitiao) {
      baitiaoData = await getBaitiaoData();
      try {
        if (!baitiaoData.resultData.data['quota'] || !baitiaoData.resultData.data['bill']) {
          return await renderFail("数据获取失败，请在脚本内将白条显示设置为false后重试！")
        }
      } catch (e) {
        return await renderFail("数据解析失败")
      }
      baitiaoTitle = baitiaoData['resultData']['data']['bill']['title'];
      baitiaoAmount = baitiaoData['resultData']['data']['bill']['amount'].replace(/,/g, '');
      baitiaoDesc = baitiaoData['resultData']['data']['bill']['buttonName'].replace(/最近还款日/g, '');
    }
//     Keychain.remove(CACHE_KEY)
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
