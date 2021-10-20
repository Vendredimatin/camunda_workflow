<template>
  <div class="wsBaseUrlTest">
    <Row style="padding: 10px;">
      <span>按日期下载: </span>
      <DatePicker type="date" format="yyyy-MM-dd" :options="logOption" placeholder="请选择日期" style="width: 216px;margin-right: 10px;" @on-change="changeDate"></DatePicker>
      <Button type="primary" @click.native="downLoadLog">下载</Button>
    </Row>
    <p>{{message}}</p>
  </div>
</template>
<script>
import global_ from "@/views/global.vue"
import { getScriptLogByDate, getScriptLogByMonth } from "@/api/others";
  export default {
    name : 'wsBaseUrlTest',
    data() {
      return {
        message: '',
        websock: null,
        freshFlag: true,
        logDate: null,
        logUrl: '',
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
      this.websock.close() // 离开路由之后断开websocket连接
    },
    methods: {
      initWebSocket(){ // 初始化websocket
        this.websock = new WebSocket(global_.wsBaseUrl + "/script-log");
        this.websock.onmessage = this.wsOnMessage;
        this.websock.onopen = this.wsOpen;
        this.websock.onerror = this.wsOnError;
        this.websock.onclose = this.wsClose;
      },
      wsOpen(){ // 连接建立之后执行send方法发送数据
        console.log("onpen " + global_.wsBaseUrl + "/script-log");
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
    },
    changeDate(date, type) {
      this.logDate = date;
    }
  }
</script>
<style lang='less'>
</style>
