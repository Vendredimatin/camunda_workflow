var host = location.host;
var hostname = location.hostname;
var ip = location.host;
var protocol = location.protocol;
var port = location.port;
port = !port || port == '' ? 80 : port;
var idx = ip.indexOf(":");
ip = idx == -1 ? ip : ip.substring(0, idx);

Config={
  baseUrl:`${protocol}//${ip}:6060/dwf/v1`,
  baseUrlOther:`${protocol}//${ip}:7070/dwf/v1`,
  baseObjOther:`${protocol}//${ip}:9090/dwf/v1`,
  wsBaseUrl:`ws://${ip}:6060`,
  wsBaseUrlOther:`ws://${ip}:7070`,
  toolModelBase: `${protocol}//${ip}:6060`,
  toolObjectBase: `${protocol}//${ip}:9090`,
  tomcatUrl: `${protocol}//${ip}:${port}`,
  baseRouteName: 'modeler-web',
  baseAppRouteName: 'app-web',
  baseMobileRouteName: 'app-mobile',
  protocol: protocol,
  ip: ip,
  host: host,
  APPPort: '8080',
  ModelerPort: '8081'
  // baseUrl:`http://192.168.31.77:6060/dwf/v1`,
  // baseUrlOther:`http://192.168.31.77:7070/dwf/v1`,
  // baseObjOther:`http://192.168.31.77:9090/dwf/v1`,
  // wsBaseUrl:`ws://192.168.31.77:6060`,
  // toolModelBase: `http://192.168.31.77:6060`,
  // toolObjectBase: `http://192.168.31.77:9090`,
  // tomcatUrl: `http://192.168.31.77:8180`,
  // baseRouteName: 'modeler-web',
  // baseAppRouteName: 'app-web',
  // baseMobileRouteName: 'app-mobile',
  // protocol: protocol,
  // ip: ip,
  // host: host
}
