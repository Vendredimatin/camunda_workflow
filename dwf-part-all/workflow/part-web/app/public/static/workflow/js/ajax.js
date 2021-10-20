
function ajax(option) {
  option.crossDomain = true;
  option.xhrFields = { withCredentials: true };
  $.ajax(option);
}

function getJSON(url, data,func) {
let option = {
    url: url,
    dataType: "json",
    data: data,
    crossDomain: true,
    xhrFields: {
    withCredentials: true
  }
}
  if (func) {
    option.success = func;
  }
  return $.ajax(option);
}

function ajaxGet(url, data,func) {

if (typeof data == "object"){ data = JSON.stringify(data);}
let option = {
  url: url,
  type: "get",
  data: data,
  contentType:"application/json;charset=utf-8",
  crossDomain: true,
  headers:{
    "Content-Type" : "application/json;charset=utf-8",
    "Authorization" : token
  },
  xhrFields: {
    withCredentials: true,
  }
}
if (func) {
  option.success = func;
}
  return $.ajax(option);
}

function ajaxPost(url, data, func) {
  if (typeof data == "object"){ data = JSON.stringify(data);}
  let option = {
      url: url,
      type: "post",
      data: data,
      headers:{
        "Content-Type" : "application/json;charset=utf-8",
        "Authorization" : token
      },

      crossDomain: true,
      xhrFields: {
          withCredentials: true,
      }
  };
  if (func) {
    option.success = func;
  }
  return $.ajax(option);
}
