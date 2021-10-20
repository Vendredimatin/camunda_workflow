<template>
<div class="layout">    
	<div ref="form" v-show="!showCode"></div>
  <textarea v-show="showCode" v-model="jsonCode" style="width: 800px;height: 800px"></textarea>
  <Button size="small" style="position: absolute;right: 0;top: 0;opacity:0.9;margin-right: 20px;margin-top: 12px" @click="change">
    <Icon type="ios-copy-outline"></Icon>
    切换
  </Button>
</div>
</template>

<script>
import { getAddin, getAddinDom, getAddinFunc } from "@/util/addin.js";
export default {
  name: "form-engine",
  data() {
    return {
      showCode: true,
      jsonCode: '{}'
    };
  },
  components: {},
  methods: {
    change(){
      this.showCode = !this.showCode;
      if (!this.showCode) {
        this.createFormBase(this.jsonCode);
      }
    },
    //创建表单总体
    createFormBase(json) {
      try {
        console.log(this.jsonCode);
        json = JSON.parse(json);
        console.log("json:", json);
        json = json.data.elements;
        var root = this.$refs.form;
        json.forEach(e => {
          this.engine(root, e);
        });
      } catch (e) {
        console.log("创建失败");
        return;
      }
    },
    engine(parentDom, element) {
      try {
        var entry = getAddinFunc(element.self.elementType.replace("addin_", "")); //获取插件实例构建函数
        var treeDom = new entry(); //创建新实例
        var dom = treeDom.setDisplayType(1).setArgs(element.self.properties).$mount().$el; //设置显示模式为引擎显示模式
        dom.classList.add("addin");
        dom.classList.add("show");
        parentDom.appendChild(dom); //将插件Dom添加入父元素
        if (element.elements && element.elements.length) {
          element.elements.forEach(element => {
            this.engine(dom, element);
          });
        }
      } catch (e) {
        console.log(e);
        console.log("创建" + element.self.elementType + "中失败");
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .layout {
    padding-left: 20px;
    font-size: 18px;
    text-align: left;
  }
  .addin.show {
    border: 1px solid #333ae2;
    padding: 5px;
    margin-top: 10px;
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 5px;
  }
</style>
