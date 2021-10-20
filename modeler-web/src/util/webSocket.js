import { uuid } from "@/util/assist";
// let ws = new WebSocket("ws://0.0.0.0:8082");
// let ws = new WebSocket("ws://192.168.1.81:9090/websocket?token=Bearer eyJhbGcUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTU1OTgwMTYxMH0.jPZQUjGYW6tn0jvAzIjnP_x5vDMsZn-41s0fjF9mJC-7qusH16Id-za8KbFXefQvMU4a44wgGso23hFLR5xeXw");
let ws = {};
let wsListeners = {};
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
    if (!(command in wsListeners)) wsListeners[command] = {};
    let uid = uuid();
    while (uid in wsListeners[command]) { uid = uuid(); }
    wsListeners[command][uid] = func;
    console.log("addListener:", wsListeners);
    return uid;
};

const removeListener = (command, id) => {
    if (command in wsListeners && id in wsListeners[command]) {
        delete wsListeners[command][id];
    }
    console.log("removeListner:", wsListeners);
}

const handleCommand = (command, data) => {
    console.log("handle:", wsListeners, command);
    if (command in wsListeners) {
        let listeners = wsListeners[command];
        for (var id in listeners) {
            listeners[id](data);
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
                handleCommand(data.command, data.data);
                if (data.command == "objects command") {
                    let cmd1 = "objects command " + data.data.className;
                    handleCommand(cmd1, { userId: data.eventSourceUser.userOid, data: data.data.obj });
                    let cmd2 = "objects command " + data.data.className + " " + data.data.obj.oid;
                    handleCommand(cmd2, { userId: data.eventSourceUser.userOid, data: data.data.obj });
                //   data.data.data.forEach(x => {
                //     let cmd1 = "objects command " + x.className;
                //     handleCommand(cmd1, { userId: data.data.userId, data: x.objects });
                //     x.objects.forEach(y => {
                //       let cmd2 = "objects command " + x.className + " " + y.oid;
                //       handleCommand(cmd2, { userId: data.data.userId, data: y});
                //     });
                //   });
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
        console.log("create socket error",e);
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

export { addListener, removeListener, createSocket, getSockId, closeSocket };
