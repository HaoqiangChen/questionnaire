// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  "plugins": {
    "postcss-import": {},
    "postcss-url": {},
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {},
    "postcss-plugin-px2rem": {
      rootValue: {px: 54.6},
      // mediaQuery: true,
      exclude: "/(node_modules)/",
      // 在rem.js全局作用下   排除指定的文件的影响
      selectorBlackList: ['html', 'weui-', 'iiw-', 'mint-', 'mt-', 'mpvue-', 'calendar', 'iconfont'],
      propBlackList: ['border']
    }
  }
}

