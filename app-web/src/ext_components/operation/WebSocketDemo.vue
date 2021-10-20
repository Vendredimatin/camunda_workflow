<template>
    <section>
        <Button :type="args.type" :shape="args.shape ? 'circle' : null" @click="handleClick">点击让服务器给自己发一条消息</Button> 
        <Button :type="args.type" :shape="args.shape ? 'circle' : null" @click="stopListen">停止监听</Button>
    </section>
</template>

<script>
import Axios from "axios";
import global_ from "@/views/global.vue"
import store from "@/store";
import { addListener, removeListener, createSocket, getSockId, closeSocket } from "@/util/webSocket.js"
const dwf_app_axios = Axios.create({
  baseURL: global_.baseObjOther,
  withCredentials: true
});
dwf_app_axios.interceptors.request.use(
  config => {
    config.headers.Authorization = store.state.user.token;
    // Spin.show()
    // 在发送请求之前做些什么
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
const name = "WebSocketDemo";

export default {
    name: name,
    importDataCommandListenerUID:"",
    wsBaseUrl:"",
    props: ['itemValue', 'store'],
    data() {
        return {
            name: name,
            args: {
                type: "default",
                shape: false,
                text: "新增"
            },
            addins: [],
        }
    },
    methods: {
        canShow() { return true },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            return this;
        },
        handleListener(data){
            console.log("webSocketDemo command: ", data);
            alert("webSocketDemo command: " + JSON.stringify(data));
        },
        stopListen(){
            removeListener("webSocketDemo command", this.importDataCommandListenerUID);
        },
        handleClick(){
            //让服务器给自己发一个消息
            dwf_app_axios.get(`importData/testWebsocket?sockID=`+getSockId()).then(res=>{
                console.log("res: ",res.data)
            });
        }
        
    },
    mounted(){
        this.wsBaseUrl = global_.wsBaseUrl
        //按理来说在用户登录时建立一个连接就好了
        if(getSockId()){
            //已经建立过连接就不再新建了
        }else{
            createSocket(this.wsBaseUrl+"/websocket?token="+store.state.user.token)
        }
        this.importDataCommandListenerUID = addListener("webSocketDemo command",this.handleListener)

    },
}

</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}
p {
  margin: 10px 0;
}
</style>