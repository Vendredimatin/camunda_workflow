import {uuid} from "@/util/assist";
// let ws = new WebSocket("ws://0.0.0.0:8082");
// let ws = new WebSocket("ws://192.168.1.81:9090/websocket?token=Bearer eyJhbGcUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTU1OTgwMTYxMH0.jPZQUjGYW6tn0jvAzIjnP_x5vDMsZn-41s0fjF9mJC-7qusH16Id-za8KbFXefQvMU4a44wgGso23hFLR5xeXw");
let ws = {};
let wsListeners = {};
let wsListenersData = {};
let wsLastData = {};
let sockId = null;
const wsResCommands = [];

console.log("webSocket global");

const addListener = (command, func, nCheck) => {
  // if (sockId == null) return null;
  //debugger
  if (!nCheck) {
    if (wsResCommands.findIndex(x => x == command) > -1) return null;
  }
  console.log("test2");
  if (!(command in wsListeners)){
    wsListeners[command] = [];
    wsListenersData[command] = [];
  }
  let uid = uuid();
  while (wsListeners[command].filter(listener => listener.uid === uid).length !== 0) {
    uid = uuid();
  }
  wsListeners[command].push({
    uid: uid,
    func: func
  });
  wsListenersData[command].push({
    uid: uid,
    data: {}
  });
  console.log("addListener:", wsListeners);
  return uid;
};

const removeListener = (command, id) => {
  if (command in wsListeners && wsListeners[command].filter(listener => listener.uid === id).length !== 0) {
    let index = wsListeners[command].findIndex(listener => listener.uid === id);
    wsListeners[command].splice(index, 1);
    // delete wsListeners[command][id];
  }
  console.log("removeListner:", wsListeners);
}

const getListenerData = (command) => {
  console.log("handle:", wsListenersData, command);
  let getListenerData = {};
  if (command in wsListenersData) {
    let listenersData = wsListenersData[command];
    for (var listenerData of listenersData) {
      getListenerData = listenerData.data
    }
  }
  return getListenerData;
};

const getLastData = () => {
  return wsLastData;
};

const handleCommand = (command, data) => {
  console.log("handle:", wsListeners, command);
  if(command == 'quit') {
    window.location.reload()
  }
  if (command in wsListeners) {
    let listeners = wsListeners[command];
    let listenersData = wsListenersData[command];
    for (var listener of listeners) {
      listener.func(data);
    }
    for (var listenerData of listenersData) {
      listenerData.data = data;
    }
  }
};

const createSocket = (url) => {
  try {
    ws = new WebSocket(url);
    ws.onopen = () => {
      console.log("ws open", new Date().getTime());
      ws.send(JSON.stringify({"type": "login", "user": "admin"}));
    };
    
    ws.onclose = (e) => {
      console.log("ws close", e, new Date().getTime());
    };
    
    ws.onmessage = (e) => {
      console.log("ws msg", e);
      let data = e.data;
      try {
        data = JSON.parse(data);
        if (data.msg) {
          if (typeof data.msg == "string") {
            data = JSON.parse(data.msg);
          } else if (typeof data.msg == 'object') {
            data = data.msg;
          }
        }
        // data = JSON.parse(data.msg);
        console.log("data:", data);
        wsLastData = data;
        handleCommand(data.command, data.data);
        if (data.command == "objects command" && data.oid) {
          let cmd1 = "objects command " + data.data.className;
          handleCommand(cmd1, {userId: data.eventSourceUser.userOid, data: data.data.obj});
          if(data.data.obj){
            let cmd2 = "objects command " + data.data.className + " " + data.data.obj.oid;
            handleCommand(cmd2, {userId: data.eventSourceUser.userOid, data: data.data.obj});
          }
          //   data.data.data.forEach(x => {
          //     let cmd1 = "objects command " + x.className;
          //     handleCommand(cmd1, { userId: data.data.userId, data: x.objects });
          //     x.objects.forEach(y => {
          //       let cmd2 = "objects command " + x.className + " " + y.oid;
          //       handleCommand(cmd2, { userId: data.data.userId, data: y});
          //     });
          //   });
        }else if(data.command == "objects command" && !data.oid){
          let cmd3 = `objects command ${data.data.className} ${data.data.omfEventType}`;
          handleCommand(cmd3, {userId: data.eventSourceUser.userOid, data: data.data.obj});
        }else if(data.command == "operation executed") {
          let cmd1 = `operation executed ${data.data.operationName} ${data.data.omfEventType} ${data.instanceId}`;
          handleCommand(cmd1, {userId: data.eventSourceUser.userOid, data: data.data});
        }else if(data.command == "from user script") {
          let cmd1 = `from user script ${data.className} ${data.operationName} ${data.instanceId}`;
          handleCommand(cmd1, {userId: data.eventSourceUser.userOid, data: data.data});
        }
      } catch (e) {
        console.log(e);
        if (typeof data == 'string' && data.startsWith("sock id")) {
          sockId = data.replace("sock id ", "");
        }
      }
    };
    
    ws.onerror = (e) => {
      console.log("ws err", e);
    };
  } catch (e) {
    console.log("create socket error", e);
  }
};

const getSockId = () => {
  return sockId
};

const closeSocket = () => {
  ws.close();
  wsListeners = {};
  sockId = null;
};

const getWs = () => {
  return ws
};

export {addListener, removeListener, createSocket, getSockId, closeSocket, getWs, getListenerData, getLastData};
