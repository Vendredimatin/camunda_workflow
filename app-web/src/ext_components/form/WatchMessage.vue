<template>
  <!-- 输入框 -->
  <section style="display: none" :addinName="name" ref="main">
    <div style="width: 100%; height: 30px; display: inline-block"></div>
  </section>
</template>

<script>
  import "@/styles/component/iconfont.css";
  import { postSub, deleteSub, sendMsgToOneSock} from "@/api/others.js";
  import { addListener, removeListener, getSockId, getWs, getListenerData, getLastData } from "@/util/webSocket";
  import { uuid } from '@/util/assist'

  const name = "WatchMessage";
  export default {
    name: name,
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
      'attributes',
    ],
    data() {
      return {
        // 插件名
        name: name,
        // 展示模式
        t_preview: true,
        t_edit: false,
        addIcon: true,
        args: {
          title: '消息订阅',
          id: null,
          events: [],
          eventRange: [],
        },
        vCallback: null,
        vCustom: null,
        times: 0,
        // 支持的数据类型
        dataTypes: [],
        // 继承属性
        inherit: [],
        // 表单项名
        args_name: "",
        // 属性map
        attrMap: {},
        timer: null,
        value: null,
        scriptListenerType: 'OPERATION_EVENT',
        startTimer: null,
        instanceId: '',
      };
    },
    inject:[
      'getEn',
      'getJsonData',
      'getParentJson',
      'getObj',
      'GetAddinById',
      'GetAddinByUUID',
      'GetAllAddin',
      'getParentAddin',
      '_getViewData',
      '_getViewDataByAttrs',
      'handleQueryData',
      'getClassObject',
      'getRClassObject',
      'invokeOperation',
      'parseEscapeString',
      'handleScript',
      'addExtraObj',
      'getEventOperation',
      'invokeEvent',
    ],
    // 生命周期函数，在获取数据和事件函数后调用，
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);
    },
    // 生命周期函数，在dom元素生成之后调用
    mounted() {
      this.instanceId = uuid();
      this.vCallback = this.args.events.find((val) => {
        return val.name == '结束消息到达'
      })
      this.vCustom = this.args.events.find((val) => {
        return val.name == '阶段消息到达'
      })
      try {
        if(this.args.auto){
          this.start();
        }
      }catch (e) {
        console.log(`创建订阅${e}`)
      }
    },
    beforeDestroy() {
      this.destroySub();
      this.destroyListener();
    },
    watch: {

    },
    computed: {

    },
    methods: {
      setHeight() {
        return;
      },
      getValue() {
        return this.args.value;
      },
      setValue(value) {
        this.args.value = value;
        return this;
      },

      getEditBoxComponent() {
        return this.$refs.editbox;
      },

      getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },
      getAllow() {
        return null;
      },
      getName() {
        return name;
      },
      getArgs() {
        return this.args;
      },
      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        return this;
      },
      getFormName() {
        return this.args.name;
      },
      setDisplayType(type) {
        this.t_preview = false;
        this.t_show = false;
        this.t_icon = false;
        if (type == 0) this.t_preview = true;
        else if (type == 1) this.t_show = true;
        else if (type == 2) this.t_icon = true;
        return this;
      },
      //建立订阅监听
      createListener() {
        this.destroyListener();
        if(this.args.watchType === 'classEvent'){
          this.wsCommand = `objects command ${this.args.bindTargetClass.split('&')[0]} ${this.args.listenerType}`;
        }else{
          this.wsCommand = `operation executed ${this.args.scriptListener.name} ${this.scriptListenerType} ${this.instanceId}`;
        }

        this.wsId = addListener(this.wsCommand, async (data) => {
          if(this.vCallback) {
            await this.invokeOperation(this.vCallback.opr_type, this.vCallback.opr_path, this.itemValue, this.store, null, data);
            if(this.args.watchType === 'scriptEvent'){
              this.destroySub();
              this.destroyListener();
            }
          }
        });

        if(this.args.watchType === 'scriptEvent') {
          this.wsCustomCommand = `from user script ${this.args.bindTargetClass.split('&')[0]} ${this.args.scriptListener.name} ${this.instanceId}`;
          this.wsCustomId = addListener(this.wsCustomCommand, (data) => {
            if(this.vCustom) {
              this.invokeOperation(this.vCustom.opr_type, this.vCustom.opr_path, this.itemValue, this.store, null, data);
            }
          });
        }
      },
      //销毁订阅监听
      destroyListener() {
        if (this.wsId) {
          removeListener(this.wsCommand, this.wsId);
          this.wsId = null;
        }
        if (this.wsCustomId) {
          removeListener(this.wsCustomCommand, this.wsCustomId);
          this.wsCustomId = null;
        }
      },
      //创建订阅
      createSub() {
        this.destroySub();
        let sockId = getSockId();
        let subscribers = [{
          subScriberType: 'SPECIFIC_CONNECTION', //this.args.messageType
          connectId: sockId,
        }];
        // if(this.args.messageType === 'SPECIFIC_USER') subscribers[0].userName = this.store.state.user.username;
        if(this.args.watchType === 'classEvent'){
          this.subId = `${this.args.bindTargetClass.split('&')[0]}${this.args.listenerType}${sockId}`;
          postSub([
            {
              className: this.args.bindTargetClass.split('&')[0],
              eventType: this.args.listenerType,
              subscribers: subscribers,
              subscriptionId: this.subId,
              // instanceId: this.instanceId,
            }
          ]);
        }else{
          this.subId = `${this.args.bindTargetClass.split('&')[0]}${this.args.scriptListener.name}${sockId}`;
          postSub([
            {
              operationName: this.args.scriptListener.name,
              eventType: this.scriptListenerType,
              subscribers: subscribers,
              subscriptionId: this.subId,
              instanceId: this.instanceId,
            }
          ]);
        }
      },

      //销毁订阅
      destroySub() {
        if (this.subId) {
          deleteSub([this.subId]);
          this.subId = null;
        }
      },
      //手动建立链接
      start(customData){
        let sockId = getSockId();
        if (sockId) {
          try {
            if(!this.subId){
              this.createSub();
              this.createListener();
              if(this.args.watchType === 'scriptEvent' && this.args.scriptListener.type && this.args.scriptListener.path){
                this.invokeOperation(this.args.scriptListener.type, this.args.scriptListener.path, this.itemValue, this.store, null, null, null, {
                  customData: customData,
                  instanceId: this.instanceId,
                });
              }
              this.sendMsg(`{"event":"start","step":"","msg":"启动订阅"}`);
            }else{
              this.$Message.info(`订阅已启动`)
            }
          }catch (e) {
            console.log(`开启订阅${e}`)
          }
          clearInterval(this.startTimer);
          this.startTimer = null;
        }else{
          if(!this.startTimer){
            this.startTimer = setInterval(() => {
              this.start();
            }, 1000)
          }
        }
      },
      //暂停
      pause(){
        if(this.subId){
          this.sendMsg(`{"event":"pause","step":"","msg":"暂停订阅"}`);
        }else{
          this.$Message.info(`订阅未启动`)
        }
      },
      //继续
      resume(){
        if(this.subId){
          this.sendMsg(`{"event":"resume","step":"","msg":"继续订阅"}`);
        }else{
          this.$Message.info(`订阅未启动`)
        }
      },
      //手动关闭链接
      stop(){
        if(this.subId){
          this.sendMsg(`{"event":"stop","step":"","msg":"停止订阅"}`);
          this.destroySub();
          this.destroyListener();
        }else{
          this.$Message.info(`订阅未启动`)
        }
      },

      sendMsg(msg){
        if(this.args.scriptListener.name){
          let params = {
            command: 'from user script',
            className: this.args.bindTargetClass.split('&')[0],
            oprName: this.args.scriptListener.name,
            data: msg,
            instanceId: this.instanceId,
          };
          getWs().send(JSON.stringify(params));
        }
      },

      getMsg(){
        if(this.args.watchType === 'scriptEvent'){
          return getListenerData(this.wsCustomCommand) ? getListenerData(this.wsCustomCommand) : getListenerData(this.wsCommand);
        }else{
          return getListenerData(this.wsCommand);
        }
      },

      getLastMsg(){
        return getLastData(this.wsCommand);
      }
    }
  };
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

  .margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
  }
</style>
