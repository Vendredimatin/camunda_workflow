<template>
	<div ref="form" dropTarget="0" style="background-color: #fff">
  </div>
</template>

<script>
import { getAddin, getAddinDom, getAddinFunc } from "@/util/addin.js";
export default {
  name: "FormEngine",
  data() {
    return {
      rootJson: null,
    };
  },
  props: ['jsonCode'],
  components: {},
  created() {
      this.createFormBase(this.jsonCode);
  },
  methods: {
    //创建表单总体
    createFormBase(json) {
      try {
        console.log("json:", json);
        json = JSON.parse(json);
        this.rootJson = json;
        console.log("json:", json);
        json = json.data.elements;
        var root = this.$refs.form;
        for (var i = root.children.length;i > 0;i--) {
          root.removeChild(root.children[i-1]);
        }
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
        var entry = getAddinFunc(element.self.elementType, "form"); //获取插件实例构建函数
        var treeDom = new entry({
          propsData: {
              store: this.$store,
              itemValue: this.rootJson,
          },
          methods: {
            getAttrFunc(name) {
                          return getAddinFunc(name, "form");
                      },
          }
        }); //创建新实例
        // var inherit = addin && addin.getInherit ? addin.getInherit(element.self.dropTarget) : {};
        var dom = treeDom.setDisplayType(1).setArgs(element.self.properties).$mount().$el; //设置显示模式为引擎显示模式
        dom.classList.add("addin");
        dom.classList.add("show");
        dom.setAttribute("UUID", element.self.uuid);
        var parent = parentDom.getAttribute("dropTarget") == element.self.dropTarget ? parentDom : parentDom.querySelector('[dropTarget="' + element.self.dropTarget + '"]')
        console.log("parent", element.self.dropTarget, parentDom, parent, parentDom.querySelector('[dropTarget="0"]'));
        if (!parent) parent = parentDom.querySelector('[dropTarget="0"]');
        if (!parent) parent = parentDom;        
        parent.appendChild(dom);
        element.obj = treeDom;
        // parentDom.appendChild(dom); //将插件Dom添加入父元素
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
    border: 1px solid #000;
    padding: 5px;
    /* margin-top: 10px;
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 5px; */
  }
</style>
