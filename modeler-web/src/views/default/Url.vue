<template>
  <div style="width: 100%;height: 100%;">
    <iframe id="urlFrame" ref="iframe" :src="urlSrc" frameborder="0" width="100%" :height="iHeight"></iframe>
  </div>
</template>

<script>
  import {parseEscapeString} from '@/libs/utils.js';
  export default {
    props: ['route', 'store', 'root', 'Message', 'echarts', 'router'],
    name: '',
    data() {
      return {
        urlSrc: "",
        iHeight: document.body.clientHeight - 104
      }
    },
    created() {
      this.$store = this.store;
      this.init();
      console.log("urlSrc:", this.urlSrc);
    },
    computed: {
    },
    methods: {
      async init() {
        let that = this;
        let params = {};
        if (this.route.meta.params.length > 0) {
          let _params = this.route.meta.params.split('APP_afterScript:');
          params.initScript = _params[0].replace("APP_beforeScript:", "");
          params.endScript = _params.length > 0 ? _params[1] : '';
        }
        params.data = null;
        if (this.route.meta.condition.length > 0) {
          params.condition = this.route.meta.condition;
          params.condition = parseEscapeString(params.condition, null, null, null, null, this.$store);
        }
        console.log("params", params, this.route.meta);
        let show = true;
        // if (params.initScript && params.initScript.length > 0) {
        //   let obj = await this.handleScript(params.initScript, params, store, null);
        //   console.log("obj:", obj);
        //   if (obj) {
        //     if ("show" in obj) show = obj.show;
        //     if (obj.query) params.query = obj.query;
        //     if (obj.obj) params._obj = obj.obj;
        //     if (obj.data) params.data = obj.data;
        //     if (obj.url) params.condition = obj.url;
        //   }
        // }

        this.urlSrc = params.condition;
        if (!this.urlSrc) this.urlSrc = this.route.meta.targetUrl;
      },

      globalRefresh() {
        this.$refs.iframe.contentWindow.location.reload();
      }
      // async handleScript(code, params, store, jsonData) {
      //   if (!jsonData) jsonData = {data: null};
      //   let that = this;
      //   let _params = {
      //     dwf_axios: dwf_app_axios, dwf_modeler_axios: axios, axios: Axios.create({baseURL: "", withCredentials: true}),
      //     msgbox: Message, data: null,
      //     generateUUID: () => uuid(),
      //     store: store
      //   };
      //   console.log("store", this.Entities);
      //   let storeFunc = ["Entities", "EntitySingle", "Relations", "RelationSingle", "QueryResult", "QueryResultAll", "updateFView",
      //     "deleteFView", "queryEntity", "queryRelation", "handleQueryData", "handleQueryForm", "deleteEObj", "saveEObj", "editEObj",
      //     "deleteEJObj", "saveEJObj", "editEJObj"];
      //   storeFunc.forEach(x => _params[x] = that[x]);
      //   let _obj = await new Function(code).call(_params);
      //   return _obj;
      // },
    }
  }
</script>

<style lang="" scoped>
</style>
