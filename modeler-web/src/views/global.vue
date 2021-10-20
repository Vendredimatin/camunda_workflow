<script>
import global from "../../global";
var ip = location.host;
var idx = ip.indexOf(":");
ip = idx == -1 ? ip : ip.substring(0, idx);
let offsetHost = parseInt(location.port) - 8180;

let username = global.username;
let password = global.password;
let versionTime = '20210423-f647837a0'
let developMode = global.developMode;

// offsetHost = 0;

// let baseUrl = `http://220.249.52.58:6060/dwf/v1`;
// let baseUrlOther = `http://220.249.52.58:7070/dwf/v1`;
// let baseObjOther = `http://220.249.52.58:9090/dwf/v1`;
// let tomcatUrl = `http://220.249.52.58:8180`;

// let baseUrl = "http://192.168.1.51:6060/dwf/v1";
// let baseUrlOther = "http://192.168.1.51:7070/dwf/v1";
// let baseObjOther = "http://192.168.1.51:9090/dwf/v1";

// let baseUrl = `http://location:6060/dwf/v1`;
// let baseUrlOther = `http://location:7070/dwf/v1`;
// let baseObjOther = `http://location:9090/dwf/v1`;
// let tomcatUrl =  `http://location:8180`;
// let wsBaseUrl = `ws://location:9090`;

// let baseUrl = `http://192.168.31.81:6060/dwf/v1`;
// let baseUrlOther = `http://192.168.31.81:7070/dwf/v1`;
// let baseObjOther = `http://192.168.31.81:9090/dwf/v1`;
// let tomcatUrl =  `http://192.168.31.81:8180`;
// let wsBaseUrl = `ws://192.168.31.81:9090`;

// let baseUrl = `http://192.168.31.81:6060/dwf/v1`;
// let baseUrlOther = `http://192.168.31.81:7070/dwf/v1`;
// let baseObjOther = `http://192.168.31.81:9090/dwf/v1`;
// let tomcatUrl =  `http://192.168.31.81:8180`;
// let wsBaseUrl = `ws://192.168.31.81:9090`;

// let baseUrl = "http://192.168.1.85:6060/dwf/v1";
// let baseUrlOther = "http://192.168.1.85:7070/dwf/v1";
// let baseObjOther = "http://192.168.1.85:9090/dwf/v1";

// let baseUrl = "http://192.168.10.81:6060/dwf/v1";
// let baseUrlOther = "http://192.168.10.81:7070/dwf/v1";
// let baseObjOther = "http://192.168.10.81:9090/dwf/v1";

 let baseUrl = global.baseUrl || Config.baseUrl || `${location.protocol}//${ip}:${6060 + offsetHost}/dwf/v1`
 let baseUrlOther = global.baseUrlOther || Config.baseUrlOther || `${location.protocol}//${ip}:${7070 + offsetHost}/dwf/v1`
 let baseObjOther = global.baseObjOther || Config.baseObjOther || `${location.protocol}//${ip}:${9090 + offsetHost}/dwf/v1`
 let tomcatUrl = global.tomcatUrl || Config.tomcatUrl || `${location.protocol}//${ip}:${8180 + offsetHost}`
 let wsBaseUrl = global.wsBaseUrl || Config.wsBaseUrl || `ws://${ip}:${9090 + offsetHost}`
console.log(baseUrl, baseObjOther, baseUrlOther, versionTime, tomcatUrl, wsBaseUrl, developMode)

//let baseUrl = `http://localhost:6060/dwf/v1`;
//let baseUrlOther = `http://127.0.0.1:7070/dwf/v1`
//let baseObjOther = `http://127.0.0.1:9090/dwf/v1`
//let tomcatUrl = `http://localhost:8180`;
//let wsBaseUrl = `ws://127.0.0.1:9090`;

export default {
  baseUrl, baseObjOther, baseUrlOther, versionTime, tomcatUrl, wsBaseUrl, developMode, username, password
};
</script>
