<template>
  <section ref="assemble" style="width: 100%; float: left;">
    <slot name="widget"></slot>
  </section>
</template>

<script>
import {getAddin} from '@/util/addin.js'
export default {
  name: "AssembleAddin",
  data(){
    return{
      actEdit: false,
    }
  },
  props: [
    'addin',
    'basicArgs',
    'activeUUID',
    'argsProps',
    'store',
    'itemValue',
    'attributes',
    'relation',
    'editExtendInfo',
    'widgetAnnotation',
    'checkResult',
    'query_oprs',
    'route',
    'router',
    'root',
    'Message',
    'echarts',
    'formCanvas',
    'dwf_ctx',
  ],
  components: {

  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    this.addinName = this.addin.self.properties._ASSEMBLECONFIG.name;
    this.vDom = this.getAddin(this.addinName);
    //通用方法给args赋值
    let args = this.vDom.getArgs();
    this.addin.self.properties = this.setBasicArgs(args);
    this.vDom.setArgs(this.addin.self.properties);
    this.dom = this.vDom.$mount().$el;
    this.addin.self.properties = this.vDom.getArgs();
  },
  mounted() {
    this.$refs.assemble.appendChild(this.dom);
  },
  watch: {
    actEdit(val){
      this.vDom.actEdit = val;
    }
  },
  computed: {

  },
  methods: {
    addinMixin() {
      let _this = this;
      return {
        data() {
          return {
            dwf_ctx: _this.dwf_ctx,
          }
        }
      }
    },
    // 生成插件实例
    getAddin(name) {
      var addin = getAddin(name, "form", {
        mixins: [this.addinMixin()],
        propsData: {
          store: this.store,
          itemValue: this.itemValue,
          attributes: this.attributes,
          relation: this.relation,
          editExtendInfo: this.editExtendInfo,
          widgetAnnotation: this.widgetAnnotation,
          checkResult: this.checkResult,
          query_oprs: this.query_oprs,
          route: this.route,
          router: this.router,
          root: this.root,
          Message: this.Message,
          echarts: this.echarts,
        },
        methods: {
          setBasicArgs(args){
            return this.setBasicArgs(args);
          }
        },
      });
      return addin;
    },
    getArgs(){
      return this.addin.self.properties;
    },
    getEditBox(){
      return this.vDom.getEditBox();
    },
    getEditBoxComponent(){
      return this.vDom.$refs.editbox;
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
