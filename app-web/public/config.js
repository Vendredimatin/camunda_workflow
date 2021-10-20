var host = location.host;
var hostname = location.hostname;
var ip = location.host;
var protocol = location.protocol;
var port = location.port;
var idx = ip.indexOf(":");
ip = idx == -1 ? ip : ip.substring(0, idx);

Config={
  baseUrl:`${protocol}//${ip}:6060/dwf/v1`,
  // baseUrlOther:`${protocol}//${ip}:7070/dwf/v1`,
  baseObjOther:`${protocol}//${ip}:9090/dwf/v1`,
  wsBaseUrl:`ws://${ip}:9090`,
  // toolModelBase: `${protocol}//${ip}:6060`,
  toolObjectBase: `${protocol}//${ip}:9090`,
  tomcatUrl: `${protocol}//${ip}:${port}`,
  baseRouteName: 'app-web',
  baseModelerRouteName: 'modeler-web',
  protocol: protocol,
  ip: ip,
  host: host,
  registerAddinName: 'userReg',
  APPPort: '8080',
  ModelerPort: '8081'
  // baseUrl:`http://192.168.31.81:6060/dwf/v1`,
  // baseUrlOther:`http://192.168.31.81:7070/dwf/v1`,
  // baseObjOther:`http://192.168.31.81:9090/dwf/v1`,
  // wsBaseUrl:`ws://192.168.31.81:9090`,
  // toolModelBase: `http://192.168.31.81:6060`,
  // toolObjectBase: `http://192.168.31.81:9090`,
  // tomcatUrl: `http://192.168.31.81:8180`,
  // baseRouteName: 'app-web',
  // baseModelerRouteName: 'modeler-web',
  // protocol: protocol,
  // ip: ip,
  // host: host
}
