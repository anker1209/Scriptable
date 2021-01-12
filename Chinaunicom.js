// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: mobile-alt;
// Author:anker
// 该组件支持两种模式，默认为圆环进度条模式，主屏幕长按小组件-->编辑小组件-->Parameter，输入1，使用文字模式

// #############设置##############
const files = FileManager.local()
const Tel = '' // 输入联通手机号码，，在两个引号之间输入
const Cookie = '' // 输入联通cookie，在两个引号之间输入
const ringStackSize = 61 // 圆环大小
const ringTextSize = 14 // 圆环中心文字大小
const creditTextSize = 21 // 话费文本大小
const textSize = 13 // 文字模式下文字大小
const databgColor = new Color("12A6E4", 0.2) // 流量环背景颜色
const datafgColor = new Color("12A6E4") // 流量环前景颜色
const voicebgColor = new Color("F86527", 0.2) // 语音环背景颜色
const voicefgColor = new Color("F86527") // 语音环前景颜色
const newBG = false  //是否设置或者使用新的背景图片，若要设置背景图片，请勿将下一行值设为true
const removeBG = false //是否需要清空背景图片，如果设置过背景图片，想再使用纯色背景，需将此设置为true清除背景图片缓存
const setbgColor = false //是否设置固定纯色背景，如要设置，请在下行指定背景颜色
const bgColor = "ffffff" // 背景颜色
const widgetParam = args.widgetParameter
let data = await getData()

const title = "中国联通"
const cuIconUrl = "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/f77d3cdc-b757-4acd-9766-a64421bf0c6d.png"
const dataSfs = SFSymbol.named("antenna.radiowaves.left.and.right")
dataSfs.applyHeavyWeight()
const dataIcon = dataSfs.image
const voiceIcon = SFSymbol.named("phone.fill").image
const scoreIcon = SFSymbol.named("tag.fill").image
const iconColor = new Color("FE8900")
const phoneData = data.data.dataList[0]
const credit = data.data.dataList[1]
const voice = data.data.dataList[2]
const score = data.data.dataList[3]
const canvSize = 178
const canvTextSize = 45
const canvas = new DrawContext()
const canvWidth = 18
const canvRadius = 80
const widget = new ListWidget()
widget.setPadding(16, 16, 16, 16) // widget边距（上，下，左，右）

// ############背景设置############
const path = files.joinPath(files.documentsDirectory(), "testPath")
if (newBG && config.runsInApp){
  const img = await Photos.fromLibrary()
  widget.backgroundImage = img
  files.writeImage(path, img)
} else {
  if (files.fileExists(path)) { 
    try {
      widget.backgroundImage = files.readImage(path)
      log("读取图片成功")
    } catch (e){
      log(e.message)
      }  
    }
  }
if (removeBG && files.fileExists(path)) {
  try {
    files.remove(path)
    log("背景图片清理成功")
  } catch (e) {
    log(e.message)
  }
}
if (setbgColor) {
  widget.backgroundColor = new Color(bgColor)
}

// ############LOGO###############
let headerStack = widget.addStack()
headerStack.layoutVertically
headerStack.addSpacer()
let logo = headerStack.addImage(await getImg(cuIconUrl))
logo.imageSize = new Size(98, 30)
headerStack.addSpacer()
widget.addSpacer()

let creditStack = widget.addStack()
creditStack.centerAlignContent()
creditStack.addSpacer()
let creditElement = creditStack.addText(credit.number)
creditElement.font = Font.mediumRoundedSystemFont(creditTextSize)
creditStack.addSpacer()
widget.addSpacer()

// ###############################
let bodyStack = widget.addStack()
bodyStack.layoutVertically()

if (widgetParam == "1"){
  await textLayout(dataIcon, phoneData.remainTitle, phoneData.number, phoneData.unit)
  bodyStack.addSpacer(8)
  await textLayout(voiceIcon, voice.remainTitle, voice.number, voice.unit)
  bodyStack.addSpacer(8)
  await textLayout(scoreIcon, score.remainTitle, score.number, score.unit)
} else {
canvas.size = new Size(canvSize, canvSize)
canvas.opaque = false
canvas.respectScreenScale = true

const dataGap = (100-phoneData.persent)*3.6
const voiceGap = (100-voice.persent)*3.6

drawArc(dataGap, datafgColor, databgColor)
let ringStack = bodyStack.addStack()
let ringLeft = ringStack.addStack()
ringLeft.layoutVertically()
ringLeft.size = new Size(ringStackSize, ringStackSize)
ringLeft.backgroundImage = canvas.getImage()
await ringContent(ringLeft, dataIcon, datafgColor, phoneData.number, phoneData.unit)
ringStack.addSpacer()

drawArc(voiceGap, voicefgColor, voicebgColor)
let ringRight = ringStack.addStack()
ringRight.layoutVertically()
ringRight.size = new Size(ringStackSize, ringStackSize)
ringRight.backgroundImage = canvas.getImage()
await ringContent(ringRight, voiceIcon, voicefgColor, voice.number, voice.unit)
}
// ###############################
if (!config.runsInWidget) {
  await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

async function getImg(url) {
  const req = new Request(url)
  const img = await req.loadImage()
  return img
}

function sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180)
  }

function cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180)
  }

function ringContent(widget, icon, iconColor, text, unit){
  const rowIcon = widget.addStack()
  rowIcon.addSpacer()
  const iconElement = rowIcon.addImage(icon)
  iconElement.tintColor = iconColor
  iconElement.imageSize = new Size(12, 12)
  iconElement.imageOpacity = 0.7
  rowIcon.addSpacer()
  
  widget.addSpacer(1)
  
  const rowText = widget.addStack()
  rowText.addSpacer()
  const textElement = rowText.addText(text)
  textElement.font = Font.mediumSystemFont(ringTextSize)
  rowText.addSpacer()
  
  const rowUnit = widget.addStack()
  rowUnit.addSpacer()
  const unitElement = rowUnit.addText(unit)
  unitElement.font = Font.boldSystemFont(8)
  unitElement.textOpacity = 0.5
  rowUnit.addSpacer()
 }

function textLayout(icon, title, number, unit){
  const rowItem = bodyStack.addStack()
  rowItem.centerAlignContent()
  let iconElement = rowItem.addImage(icon)
  iconElement.imageSize = new Size(textSize, textSize)
  iconElement.tintColor = iconColor
  rowItem.addSpacer(4)
  let titleElement = rowItem.addText(title)
  titleElement.font = Font.systemFont(textSize)
  rowItem.addSpacer()
  let numberElement = rowItem.addText(number+unit)
  numberElement.font = Font.systemFont(textSize)
}

function drawArc(deg, fillColor, strokeColor, centerColor) {
  let ctr = new Point(canvSize / 2, canvSize / 2),
  bgx = ctr.x - canvRadius;
  bgy = ctr.y - canvRadius;
  bgd = 2 * canvRadius;
  bgr = new Rect(bgx, bgy, bgd, bgd)

  canvas.setFillColor(fillColor)
  canvas.setStrokeColor(strokeColor)
  canvas.setLineWidth(canvWidth)
  canvas.strokeEllipse(bgr)

  for (let t = 0; t < deg; t++) {
    rect_x = ctr.x + canvRadius * sinDeg(t) - canvWidth / 2
    rect_y = ctr.y - canvRadius * cosDeg(t) - canvWidth / 2
    rect_r = new Rect(rect_x, rect_y, canvWidth, canvWidth)
    canvas.fillEllipse(rect_r)
  }
}

async function getData() {
  const cachePath = files.joinPath(files.documentsDirectory(), "Chinaunicom-anker")
  var url= 'https://m.client.10010.com/mobileService/home/queryUserInfoSeven.htm?showType=3&version=iphone_c@7.0600&desmobiel='+Tel;
  var url1 = 'https://act.10010.com/SigninApp/signin/daySign'
  try {
    var req = new Request(url)
    req.headers = {'cookie': Cookie }
    console.log(req)
    var data = await req.loadJSON()
    console.log(data)
    var req1 = new Request(url1);
    req1.headers = {'cookie': Cookie }
    var data1 = await req1.loadJSON();
    if (data.signinState === '0'){
      files.writeString(cachePath, JSON.stringify(data))
      log("==>数据请求成功")
    } 
  }
  catch (e) {
    data = JSON.parse(files.readString(cachePath))
    log("==>数据请求失败，使用缓存数据/"+ e)
  }
  return data
}