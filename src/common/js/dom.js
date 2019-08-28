/**
 * 判断dom是否有该 class
 */
export function hasClass (el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

/**
 * 添加 class
 */
export function addClass (el, className) {
  if (hasClass(el, className)) {
    return
  }
  if (el.className) {
    let newClass = el.className.split(' ')
    newClass.push(className)
    el.className = newClass.join(' ')
  } else {
    el.className += className
  }
}

/**
 * 移除 class
 */
export function removeClass (el, className) {
  if (!hasClass(el, className)) {
    return
  }

  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g')
  el.className = el.className.replace(reg, '')
}

/**
 * 获取/设置 自定义属性 data-${name}=val
 * 如果传入了 val 就设置自定义属性 `data-${name}` 的值为 val
 * 如果没有传入了 val 就获取自定义属性 `data-${name}` 的值
 */
export function getAttrData (el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  }
  return el.getAttribute(name)
}

export function getRect (el) {
  if (el instanceof window.SVGElement) {
    let rect = el.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight
    }
  }
}

let elementStyle = document.createElement('div').style

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false
})()

export function prefixStyle (style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
