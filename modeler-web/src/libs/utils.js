export const TOKEN_KEY = "Authorization";

export const hasChild = item => {
  return item.children && item.children.length !== 0;
};

const showThisMenuEle = (item, access) => {
  if (item.meta && item.meta.access && item.meta.access.length) {
    return !!hasOneOf(item.meta.access, access);
  } else return true;
};
/**
 * @param {Array} list 通过路由列表得到菜单列表
 * @param access
 * @returns {Array}
 */
export const getMenuByRouter = (list, access) => {
  let res = [];
  forEach(list, item => {
    if (item.meta && !item.meta.hideInMenu) {
      let obj = {
        icon: (item.meta && item.meta.icon) || "",
        name: item.name,
        meta: item.meta
      };
      if (hasChild(item) && showThisMenuEle(item, access)) {
        obj.children = getMenuByRouter(item.children, access);
      }
      if (showThisMenuEle(item, access)) res.push(obj);
    }
  });
  return res;
};

/**
 * @param {Array} routeMatched 当前路由matched
 * @returns {Array}
 */
export const getBreadCrumbList = routeMatched => {
  let res = routeMatched.map(item => {
    return {
      icon: (item.meta && item.meta.icon) || "",
      name: item.name,
      meta: item.meta
    };
  });
  res = res.filter(item => {
    return !item.meta.hideInMenu;
  });
  return [{
      name: "首页",
      to: "/home"
    },
    ...res
  ];
};

/**
 * @description 本地存储和获取标签导航列表
 */
export const setTagNavListInLocalstorage = list => {
  sessionStorage.tagNaveListM = JSON.stringify(list);
};
/**
 * @returns {Array} 其中的每个元素只包含路由原信息中的name, path, meta三项
 */
export const getTagNavListFromLocalstorage = () => {
  const list = sessionStorage.tagNaveListM;
  return list ? JSON.parse(list) : [];
};

/**
 * @param {Array} routers 路由列表数组
 * @description 用于找到路由列表中name为home的对象
 */
export const getHomeRoute = routers => {
  let i = -1;
  let len = routers.length;
  let homeRoute = {};
  while (++i < len) {
    let item = routers[i];
    if (item.children && item.children.length) {
      let res = getHomeRoute(item.children);
      if (res.name) return res;
    } else {
      if (item.name === "home") homeRoute = item;
    }
  }
  return homeRoute;
};

/**
 * @param {*} list 现有标签导航列表
 * @param {*} newRoute 新添加的路由原信息对象
 * @description 如果该newRoute已经存在则不再添加
 */
export const getNewTagList = (list, newRoute) => {
  const {
    name,
    path,
    meta
  } = newRoute;
  let newList = [...list];
  if (newList.findIndex(item => item.name === name) >= 0) return newList;
  else
    newList.push({
      name,
      path,
      meta
    });
  return newList;
};

/**
 * @param {Boolean} status 状态 1 => locked  0 => unlocked
 * @description 这里只是为了演示，实际应该将锁定状态的设置和获取用接口来实现
 */
export const setLockStatus = status => {
  localStorage.isLocked = status;
};
export const getLockStatus = () => {
  return parseInt(localStorage.isLocked);
};

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
const hasAccess = (access, route) => {
  if (route.meta && route.meta.access)
    return hasOneOf(access, route.meta.access);
  else return true;
};

/**
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
  const getHasAccessRouteNames = list => {
    let res = [];
    list.forEach(item => {
      if (item.children && item.children.length) {
        res = [].concat(res, getHasAccessRouteNames(item.children));
      } else {
        if (item.meta && item.meta.access) {
          if (hasAccess(access, item)) res.push(item.name);
        } else {
          res.push(item.name);
        }
      }
    });
    return res;
  };
  const canTurnToNames = getHasAccessRouteNames(routes);
  return canTurnToNames.indexOf(name) > -1;
};

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
  const keyValueArr = url.split("?")[1].split("&");
  let paramObj = {};
  keyValueArr.forEach(item => {
    const keyValue = item.split("=");
    paramObj[keyValue[0]] = keyValue[1];
  });
  return paramObj;
};

/**
 * @param {Array} list 标签列表
 * @param {String} name 当前关闭的标签的name
 */
export const getNextName = (list, name) => {
  let res = "";
  if (list.length === 2) {
    res = "home";
  } else {
    if (list.findIndex(item => item.name === name) === list.length - 1)
      res = list[list.length - 2].name;
    else res = list[list.findIndex(item => item.name === name) + 1].name;
  }
  return res;
};

export const forEach = (arr, fn) => {
  if (!arr.length || !fn) return;
  let i = -1;
  let len = arr.length;
  while (++i < len) {
    let item = arr[i];
    fn(item, i, arr);
  }
};

export const getCommonString = (arr1, arr2) => {
  let len = Math.min(arr1.length, arr2.length);
  let i = -1;
  let res = [];
  while (++i < len) {
    const item = arr2[i];
    if (arr1.indexOf() > -1) res.push(item);
  }
  return res;
};

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @description 得到两个数组的交集, 两个数组的元素为数值或字符串
 */
export const getIntersection = (arr1, arr2) => {
  return Array.from(new Set([...arr1, ...arr2]));
};

/**
 * @param {Array} target 目标数组
 * @param {Array} arr 需要查询的数组
 * @description 判断要查询的数组是否至少有一个元素包含在目标数组中
 */
export const hasOneOf = (target, arr) => {
  return target.some(_ => arr.indexOf(_) > -1);
};

/**
 * @param {Number} timeStamp 判断时间戳格式是否是毫秒
 * @returns {Boolean}
 */
const isMillisecond = timeStamp => {
  const timeStr = String(timeStamp);
  return timeStr.length > 10;
};

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {Number} currentTime 当前时间时间戳
 * @returns {Boolean} 传入的时间戳是否早于当前时间戳
 */
const isEarly = (timeStamp, currentTime) => {
  return timeStamp < currentTime;
};

/**
 * @param {Number} num 数值
 * @returns {String} 处理后的字符串
 * @description 如果传入的数值小于10，即位数只有1位，则在前面补充0
 */
const getHandledValue = num => {
  return num < 10 ? "0" + num : num;
};

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {Number} startType 要返回的时间字符串的格式类型，传入'year'则返回年开头的完整时间
 */
const getDate = (timeStamp, startType) => {
  const d = new Date(timeStamp * 1000);
  const year = d.getFullYear();
  const month = getHandledValue(d.getMonth() + 1);
  const date = getHandledValue(d.getDate());
  const hours = getHandledValue(d.getHours());
  const minutes = getHandledValue(d.getMinutes());
  const second = getHandledValue(d.getSeconds());
  let resStr = "";
  if (startType === "year")
    resStr =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    second;
  else if (startType === "YYYY-MM-DD") resStr = year + "-" + month + "-" + date;
  else if (startType === "YYYY-MM-DD HH:MM:SS") resStr = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + second;
  else resStr = month + "-" + date + " " + hours + ":" + minutes;
  return resStr;
};

/**
 * @param {String|Number} timeStamp 时间戳
 * @returns {String} 相对时间字符串
 */
export const getRelativeTime = timeStamp => {
  // 判断当前传入的时间戳是秒格式还是毫秒
  const IS_MILLISECOND = isMillisecond(timeStamp);
  // 如果是毫秒格式则转为秒格式
  if (IS_MILLISECOND) Math.floor((timeStamp /= 1000));
  // 传入的时间戳可以是数值或字符串类型，这里统一转为数值类型
  timeStamp = Number(timeStamp);
  // 获取当前时间时间戳
  const currentTime = Math.floor(Date.parse(new Date()) / 1000);
  // 判断传入时间戳是否早于当前时间戳
  const IS_EARLY = isEarly(timeStamp, currentTime);
  // 获取两个时间戳差值
  let diff = currentTime - timeStamp;
  // 如果IS_EARLY为false则差值取反
  if (!IS_EARLY) diff = -diff;
  let resStr = "";
  const dirStr = IS_EARLY ? "前" : "后";
  // 少于等于59秒
  if (diff <= 59) resStr = diff + "秒" + dirStr;
  // 多于59秒，少于等于59分钟59秒
  else if (diff > 59 && diff <= 3599)
    resStr = Math.floor(diff / 60) + "分钟" + dirStr;
  // 多于59分钟59秒，少于等于23小时59分钟59秒
  else if (diff > 3599 && diff <= 86399)
    resStr = Math.floor(diff / 3600) + "小时" + dirStr;
  // 多于23小时59分钟59秒，少于等于29天59分钟59秒
  else if (diff > 86399 && diff <= 2623859)
    resStr = Math.floor(diff / 86400) + "天" + dirStr;
  // 多于29天59分钟59秒，少于364天23小时59分钟59秒，且传入的时间戳早于当前
  else if (diff > 2623859 && diff <= 31567859 && IS_EARLY)
    resStr = getDate(timeStamp);
  else resStr = getDate(timeStamp, "year");
  return resStr;
};

/**
 * @param {String} oriString 原字符串
 * @param env 环境变量
 * @param user 当前用户
 * @param objs 驱动类对象列表
 * @param param 传入参数
 * @returns {String} 解析后的字符串
 * @author ZhaoXin
 */
export const parseEscapeString = (oriString, env, user, obj, attributes, param, form) => {
  // console.log('args in parse', oriString, env, user, obj, attributes, param, form);
  // if(oriString && oriString.trim().startsWith("nativequery:")) return oriString;
  if (typeof oriString == "number") oriString = oriString + '';
  if (
    typeof oriString !== "string" ||
    typeof env !== "object" ||
    typeof user !== "object" ||
    typeof obj !== "object"
  ) {
    return '';
  }
  let allAttrs = {};

  if (attributes != null && Object.prototype.toString.call(attributes) === '[object Array]'){
    attributes.forEach(x=>{
      allAttrs[x.attributeName] = x;
    });
  } else if(attributes != null && Object.prototype.toString.call(attributes) === '[object Object]'){
    for(let key in attributes){
      attributes[key].forEach(x => {
        allAttrs[`${x.attributeName}`] = x;
      });
    }
  }
  let _newStr = oriString.concat();
  let model = /(\$form[\"[A-Za-z0-9]+\"])|(\$\w+(\.\w+){1})/g;
  let _matches = _newStr.match(model);
  let sqlList = [];
  if (_matches == null) {
    return oriString;
  }
  _matches.forEach(async (x) => {
    sqlList = x.indexOf('.') === -1 ? x.split("[") : x.split(".");
    var _replaceMat = null;
    var _tmpModel = x;
    let attr;
    switch (sqlList[0]) {
      case "$user":
        // 关于时间戳的替换规则，暂定结尾._ts时转义成时间戳
        // 尚不能处理多层转义 like: $obj.a.b.c._ts
        sqlList[1] = sqlList[1] === 'userName' ? sqlList[1].toLowerCase() : sqlList[1];
        attr = sqlList[1] === 'userGroups' ? JSON.parse(sessionStorage.getItem(`${sqlList[1]}M`)) : sessionStorage.getItem(`${sqlList[1]}M`);
        if (attr == null) {
          _replaceMat = "";
        } else {
          _replaceMat = attr;
        }
        //userGroup的情况
        if(sqlList[1] === 'userGroups'){
          let indexAndPro = _newStr.match(/\[\d\]\.[a-zA-Z]+/g); //["[0].oid", "[0].oid"];
          if(indexAndPro != null && indexAndPro.length !== 0){
            let index = indexAndPro[0].match(/\[\d\]/g)[0].replace(/\[|\]/g, '') - 0 || 0;
            let prop = indexAndPro[0].match(/[a-zA-Z]+$/g)[0] || 'oid';
            let value = attr && attr[index] ? attr[index][prop] : '';
            _newStr = _newStr.replace(/\$user\.userGroups\[\d\]\.[a-zA-Z]+/, value);
          }else{
            _newStr = _newStr.replace(_tmpModel, _replaceMat);
          }
        }else{
          _newStr = _newStr.replace(_tmpModel, _replaceMat);
        }
        break;
      case "$env":
        // let idx = location.host.indexOf(":");
        // let ip = idx == -1 ? location.host : location.host.substring(0, idx);
        attr = param ? param.state.DWF_global[sqlList[1]] : '';
        if (attr == null) {
          _replaceMat = "";
        } else {
          _replaceMat = attr;
        }
        _newStr = _newStr.replace(_tmpModel, _replaceMat);
        break;
      case "$obj":
      {
        _replaceMat = null;
        _tmpModel = sqlList.join(".");
        // 关于时间戳的替换规则，暂定结尾._ts时转义成时间戳
        // 尚不能处理多层转义 like: $obj.a.b.c._ts
        if (obj == null || sqlList.length == 1 || obj[sqlList[1]] == null) {
          _replaceMat = "";
        } else {
          let relationExg = /^relation_|left_|right_/g;
          let removePrefixAttr = relationExg.test(sqlList[1]) ? sqlList[1].replace(relationExg, '') : sqlList[1]; //去除关联类前缀之后的属性key
          // let removePrefixAttr = sqlList[1];
          let attr = allAttrs[removePrefixAttr];
          if (attr == null) {
            _replaceMat = "";
          } else {
            if (attr.valueType == "Date") {
              _replaceMat = getDate(obj[sqlList[1]]/1000, "YYYY-MM-DD");
            } else if (x.valueType == "TimeStamp") {
              _replaceMat = getDate(obj[sqlList[1]]/1000, "YYYY-MM-DD HH:MM:SS");
            } else {
              _replaceMat = obj[sqlList[1]] + "";
            }
          }
        }
        _newStr = _newStr.replace(_tmpModel, _replaceMat);
        break;
      }
      case "$form":
        _replaceMat = null;
        let id = sqlList[1].replace(/\"|\]/g, '');
        let formData = form.GetAddinById(form.rootJson.data, id);
        if (formData == null  || !(formData.getValue && formData.getValue())) {
          _replaceMat = "";
        } else {
          let attr = allAttrs[formData.args.name];
          if (attr == null) {
            _replaceMat = formData.getValue() + "";
          } else {
            if (attr.valueType == "Date") {
              _replaceMat = getDate(formData.getValue()/1000, "YYYY-MM-DD");
            } else if (x.valueType == "TimeStamp") {
              _replaceMat = getDate(formData.getValue()/1000, "YYYY-MM-DD HH:MM:SS");
            } else {
              _replaceMat = formData.getValue() + "";
            }
          }
        }
        _newStr = _newStr.replace(_tmpModel, _replaceMat);
        break;
      case "$param":
      {
        _replaceMat = null;
        _tmpModel = sqlList.join(".");
        if (param == null || (sqlList.length > 1 && (!(sqlList[1] in param) || param[sqlList[1]] == null))) _replaceMat == null;
        else if (sqlList.length > 1) _replaceMat = param[sqlList[1]];
        else _replaceMat = param;
        _newStr = _newStr.replace(_tmpModel, _replaceMat);
        break;
      }
      default:
        console.log("Expected $env, $user, $obj or $objs, got " + sqlList[0]);
    }
  });

  console.log("parse result:", _newStr);
  return _newStr;
};

export const encode64 = (input) => {
  // var input = encodeURIComponent(JSON.stringify(input));
  var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv"
    + "wxyz0123456789+/" + "=";
  input = escape(input);
  var output = "";
  var chr1, chr2, chr3 = "";
  var enc1, enc2, enc3, enc4 = "";
  var i = 0;
  do
  {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2))
    {
      enc3 = enc4 = 64;
    }
    else if (isNaN(chr3))
    {
      enc4 = 64;
    }
    output = output +
      keyStr.charAt(enc1) +
      keyStr.charAt(enc2) +
      keyStr.charAt(enc3) +
      keyStr.charAt(enc4);
    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";
  } while (i < input.length);
  return output;
}

export const decode64 = (input) => {
  var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv"
  + "wxyz0123456789+/" + "=";
  var output = "";
  var chr1, chr2, chr3 = "";
  var enc1, enc2, enc3, enc4 = "";
  var i = 0;
// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  var base64test = /[^A-Za-z0-9\+\/\=]/g;
  if (base64test.exec(input))
  {
    alert("There were invalid base64 characters in the input text.\n" +
      "Valid base64 characters are A-Z, a-z, 0-9, '+', '/', and '='\n" +
      "Expect errors in decoding.");
  }
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  do
  {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output = output + String.fromCharCode(chr1);
    if (enc3 != 64)
    {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64)
    {
      output = output + String.fromCharCode(chr3);
    }
    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";
  } while (i < input.length);
  return unescape(output);
}

// export const SYS_ENTITY_ATTRIBUTES = ['currentProcess', 'oid', 'owner', 'id', 'lastModifyTime', 'lastModifier', 'createTime', 'creator', 'plt_currentprocess', 'plt_oid', 'plt_owner', 'plt_id', 'plt_lastmodifytime', 'plt_lastmodifier', 'plt_createtime', 'plt_creator'];

export const SYS_ENTITY_ATTRIBUTES = (attribute) => {
  let sys = ['currentProcess', 'oid', 'owner', 'id', 'lastModifyTime', 'lastModifier', 'createTime', 'creator', 'plt_currentprocess', 'plt_oid', 'plt_owner', 'plt_id', 'plt_lastmodifytime', 'plt_lastmodifier', 'plt_createtime', 'plt_creator'];
  if(attribute && attribute.isPrimaryKey){
    return 1
  }else{
    return sys.indexOf(attribute.attributeName)
  }
}

// export const SYS_RELATION_ATTRIBUTES = ['oid', 'lastModifier', 'rightRev', 'leftClass', 'order', 'rightClass', 'leftOid', 'rightOid', 'lastModifyTime', 'version', 'createTime', 'creator', 'plt_oid', 'plt_lastModifier', 'plt_rightRev', 'plt_leftClass', 'plt_order', 'plt_rightClass', 'plt_leftOid', 'plt_rightOid', 'plt_lastModifyTime', 'plt_version', 'plt_createTime', 'plt_creator'];

export const SYS_RELATION_ATTRIBUTES = (attribute) => {
  let sys = ['oid', 'lastModifier', 'rightRev', 'leftClass', 'order', 'rightClass', 'leftOid', 'rightOid', 'lastModifyTime', 'version', 'createTime', 'creator', 'plt_oid', 'plt_lastModifier', 'plt_rightRev', 'plt_leftClass', 'plt_order', 'plt_rightClass', 'plt_leftOid', 'plt_rightOid', 'plt_lastModifyTime', 'plt_version', 'plt_createTime', 'plt_creator'];
  if(attribute && attribute.isPrimaryKey){
    return 1
  }else{
    return sys.indexOf(attribute.attributeName)
  }
}

function random(a, b) {
  var n = Math.round(Math.random() * (a - b) + b);
  return n;
}

// 生成随机数
export const randomStr = (length) => {
  var strData = "";
  //如果觉得12个数太少也可以多放点，将i<4修改即可
  for(var i=0;i<4;i++){
    var num = random(0,9);                              //数字
    var upper = String.fromCharCode(random(65,90));     //大写字母
    var lower = String.fromCharCode(random(97,122));    //小写字母
    strData = strData+num+upper+lower;                  //将所有结果放进strData中

  }
  var str = "";
  for (var i = 0; i < length; i++) {
    str += strData[random(0,strData.length-1)];         //在strData里面随机抽取四个数
  }
  return str;
}


