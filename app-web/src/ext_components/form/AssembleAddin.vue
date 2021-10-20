<template>
  <section ref="assemble" style="width: 100%;"></section>
</template>

<script>
import { getAddinFunc } from '@/util/addin.js'
export default {
  name: "AssembleAddin",
  data(){
    return{

    }
  },
  props: [
    'argsProps',
    'attributes',
    'Message',
    'addin',
    'query',
    'store',
    'root',
    'itemValue',
    'formEngine',
    'dwf_ctx',
  ],
  components: {

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
    // this.setDisplayType(this.query.displayType);
    let that = this;
    let constructorFunc = getAddinFunc(this.addin.self.properties._ASSEMBLECONFIG.name, "form"); //获取插件实例构建函数
    this.vDom = new constructorFunc({
      // 加载prop数据
      propsData: {
        itemValue: that.itemValue,
        store: that.store,
        Message: that.Message,
        echarts: that.echarts,
        attributes: that.attributes,
        query: that.query,
        root: that.root,
        dwf_ctx: that.dwf_ctx,
      },
    });
    this.addin.obj = this.vDom;
    this.vDom.setDisplayType(this.query.displayType);
    this.vDom.setArgs(this.argsProps);
    this.dom = this.vDom.$mount().$el; //设置显示模式为引擎显示模式
  },
  mounted() {
    this.$refs.assemble.appendChild(this.dom);
  },
  computed: {

  },
  methods: {
    setDisplayType(type){
      this.vDom.setDisplayType(type);
    },
    getFormName(){
      return this.vDom.getFormName();
    },
    getValue(){
      return this.vDom.getValue();
    },
    setValue(val){
      this.vDom.setValue(val);
    },
    setArgs(args){
      this.vDom.setArgs(args);
    },
    getArgs(){
      return this.addin.self.properties;
    },
    activeAddin(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },

    copyAddin(addin, parentUUID) {
      this.$emit('copyAddin', addin, parentUUID);
    },

    removeAddin(uuid, parentUUID, deleteButton){
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },

    deleteAddin() {
      this.$emit('deleteAddin');
    },

    commentAddin(addin) {
      this.$emit('commentAddin', addin);
    },
  }
}
</script>

<style scoped>

</style>
