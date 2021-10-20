<template>
  <div ref="main" style="height: 100%;">
  </div>
</template>

<script>
  import {getAddinFunc} from "@/util/addin.js";
  import {Message} from "iview";
  import axios from "@/libs/axios";
  import Axios from 'axios';
  import global_ from '@/views/global.vue';
  import store from "@/store"

  const dwf_app_axios = Axios.create({
    baseURL: global_.baseObjOther,
    withCredentials: true
  });

  const serverConfig = global_;

  dwf_app_axios.interceptors.request.use(
    config => {
      config.headers.Authorization = store.state.user.token;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  var ip = location.host;
  var idx = ip.indexOf(":");
  ip = idx == -1 ? ip : ip.substring(0, idx);

  export default {
    name: 'implement',
    props: ['route', 'store', 'root', 'query'],
    data() {
      return {
        addin: null,
      }
    },
    created() {
    },
    mounted() {
      let _this = this;
      let mixins = {
        data(){
          return {
            dwf_ctx: {
              dwf_axios: dwf_app_axios,
              dwf_modeler_axios: axios,
              env: _this.store && _this.store.state && _this.store.state.DWF_global ? {
                serverURL: `${_this.store.state.DWF_global.serverIp}:${_this.store.state.DWF_global.serverHost}`,
                serverIp: _this.store.state.DWF_global.serverIp,
                serverPort: _this.store.state.DWF_global.serverHost,
                metaServicePort: new URL(serverConfig.baseUrl).port,
                objServicePort: new URL(serverConfig.baseObjOther).port,
                appConfig: _this.store.state.DWF_global.appConfig,
              } : {
                serverIp: ip,
                serverURL: `${ip}:${location.port}`,
                serverPort: location.port,
                metaServicePort: new URL(serverConfig.baseUrl).port,
                objServicePort: new URL(serverConfig.baseObjOther).port,
                serverHost: location.port,
                appConfig: '',
              },
              user: {
                userName: sessionStorage.getItem('username') || '',
                displayName: sessionStorage.getItem('displayName') || '',
                oid: sessionStorage.getItem('oid') || '',
                userId: sessionStorage.getItem('userId') || '',
                token: sessionStorage.getItem('token') || '',
                userGroups: JSON.parse(sessionStorage.getItem('userGroups')) || '',
              }
            }
          }
        },
      }
      console.log("mounted");
      if (this.route.meta.condition) {
        let name = this.route.meta.condition;
        if (name.startsWith("addin:")) name = name.substring(6);
        try {
          let _addin = getAddinFunc(name, "operation");
          let addin = new _addin({
            mixins: [mixins],
            propsData: {
              store: this.store,
              root: this.root,
              query: this.query,
            },
          });
          this.addin = addin;
          for (var i = this.$refs.main.children.length; i > 0; i--) {
            this.$refs.main.removeChild(this.$refs.main.children[i - 1]);
          }
          this.$refs.main.appendChild(addin.$mount().$el);
        } catch (e) {
          console.log(e);
        }
      }
    },
    methods: {
      activate() {
        if (this.addin && this.addin.activate) {
          this.addin.activate();
        }

      },
    }
  }
</script>

<style lang="less" scoped>
  .create {
    background-color: #fff;
  }
</style>
