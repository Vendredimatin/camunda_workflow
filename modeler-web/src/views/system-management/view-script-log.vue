<template>
  <div class="view-script-log">
    <Row style="padding: 10px;">
      <span>按日期下载: </span>
      <DatePicker id="dateInput" type="date" format="yyyy-MM-dd" :options="logOption" placeholder="请选择日期" style="width: 216px;margin-right: 10px;" @on-change="changeDate"></DatePicker>
      <Button id="downloadScriptButton" type="primary" @click.native="downLoadLog">下载</Button>
      <Button id="magnifyButton" style="float: right;margin-right: 10px;" icon="ios-move" shape="circle" @click.native="fullViewLog"></Button>
    </Row>
    <Row style="padding: 10px; width:100%" class="log-row">
      <p v-html="message"></p>
    </Row>
  </div>
</template>
<script>
import global_ from "@/views/global.vue"
import { getScriptLogByDate, getScriptLogByMonth } from "@/api/others";
  export default {
    name : 'view-script-log',
    data() {
      return {
        message: '',
        websock: null,
        freshFlag: true,
        logDate: null,
        logOption: {
          disabledDate (date) {
            return date && date.valueOf() >= new Date();
          }
        }
      }
    },
    created() {
      this.initWebSocket();
    },
    destroyed() {
      this.websock.close(); // 离开路由之后断开websocket连接
    },
    methods: {
      initWebSocket(){ // 初始化websocket
        this.websock = new WebSocket(`${Config.wsBaseUrl}/script-log`);
        // this.websock = new WebSocket(global_.wsBaseUrl + "/script-log");
        this.websock.onmessage = this.wsOnMessage;
        this.websock.onopen = this.wsOpen;
        this.websock.onerror = this.wsOnError;
        this.websock.onclose = this.wsClose;
      },
      wsOpen(){ // 连接建立之后执行send方法发送数据
        console.log(`onpen ${Config.wsBaseUrl}/script-log`);
        // console.log("onpen " + global_.wsBaseUrl + "/script-log");
        // this.wsSend();
      },
      // wsOnError(){ // 连接建立失败重连
      //   this.initWebSocket();
      // },
      wsOnMessage(msg){ // 数据接收
        // console.log(msg.data);
        this.message += msg.data;
        this.message += '</br>';
      },
      wsSend(Data){ // 数据发送
        // this.websock.send(Data);
      },
      wsClose(e){  // 关闭
          console.log("onclose");
      },
      globalRefresh() {
        this.message = '';
        this.freshEvent();
      },
      downLoadLog() {
        if(!this.logDate || this.logDate == '') {
          this.$Message.warning('请先选择日期')
        } else {
          getScriptLogByDate(this.logDate).then(response => {
            let res = response.data;
            if(typeof res == 'object') {
              if(!res.success) {
                this.$Message.warning(res.message);
              }
            } else {
              var elementA = document.createElement('a');
              elementA.setAttribute('href', `${Config.baseUrlOther}/log/script-log?date=${this.logDate}`);
              elementA.setAttribute('download', + this.logDate + ".log");
              elementA.style.display = 'none';
              document.body.appendChild(elementA);
              elementA.click();
              document.body.removeChild(elementA);
            }
          }).catch(e => {
            console.log(e);
          });
        }
      },
      freshEvent() {
        this.websock.close();
        this.initWebSocket();
      },
      fullViewLog() {
        window.open(`${Config.tomcatUrl}/log/script-log.html`);
      },
      changeDate(date, type) {
        this.logDate = date;
      }
    },
  }
</script>
<style scoped>
.log-row {
    height: 500px;
    overflow-x: hidden;
    overflow-y: auto;
}
@media screen and (max-width: 1400px) {
    .log-row {
        height: 450px;
    }
}
</style>
