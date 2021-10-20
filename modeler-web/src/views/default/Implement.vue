<template>
  <div ref="main" style="height: 100%;">
  </div>
</template>

<script>
  import {getAddinFunc} from "@/util/addin.js";

  export default {
    name: 'implement',
    props: ['route', 'store', 'root', 'Message', 'echarts', 'router'],
    data() {
      return {
        addin: null,
      }
    },
    created() {
    },
    mounted() {
      console.log("mounted");
      if (this.route.meta.condition) {
        let name = this.route.meta.condition;
        if (name.startsWith("addin:")) name = name.substring(6);
        try {
          let _addin = getAddinFunc(name, "views");
          let addin = new _addin({
            propsData: {
              store: this.store,
              root: this.root,
              Message: this.Message,
              router: this.router,
              route: this.route,
              echarts: this.echarts
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
      globalRefresh() {
        if (this.addin && this.addin.globalRefresh) {
          this.addin.globalRefresh();
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .create {
    background-color: #fff;
  }
</style>
