/**
 * @authors chq (296260486@qq.com)
 * @date    2019/5/21 17:37
 * connectApp.js
 * js调用java
 */

function connectWebViewJavascriptBridge (callback) {
  if (window.WebViewJavascriptBridge) {
    callback(WebViewJavascriptBridge) // eslint-disable-line
  } else {
    document.addEventListener(
      'WebViewJavascriptBridgeReady'
      , function () {
        callback(WebViewJavascriptBridge) // eslint-disable-line
      },
      false
    )
  }
}

connectWebViewJavascriptBridge(function (bridge) {
  bridge.init(function (message, responseCallback) {
    // console.log('JS got a message', message)
    let data = {
      'Javascript Responds': '测试中文!'
    }
    if (responseCallback) {
      // console.log('JS responding with', data)
      responseCallback(data)
    }
  })
  bridge.registerHandler('functionInJs', function (data, responseCallback) {
    document.getElementById('show').innerHTML = ('data from Java: = ' + data);
    if (responseCallback) {
      let responseData = 'Javascript Says Right back aka!'
      responseCallback(responseData)
    }
  })
})
