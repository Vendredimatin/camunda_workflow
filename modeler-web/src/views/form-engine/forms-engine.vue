<template>
<div class="layout">
	<layout>
        <div>{{rootJson.id}}</div>
        <form ref='root'></form>
	</layout>
</div>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";
import { getAddin, getAddinDom, getAddinFunc } from "@/util/addin.js";
export default {
  name: "forms-engine",
  data() {
    return {
      queryData: {
        query: "", //查询条件
        targetClass: "",
        formName: "",
        uuid: ""
      },
      formBody: {
        align: "left",
        type: "flex",
        justify: "start"
      },
      rootJson: {},
      previewJson: {},
      treeName: "tree",
    };
  },
  components: {},
  created() {
  },
  async mounted() {
    await this.initFormDate();
    this.initPreviewJson();
    this.createFormBase(this.previewJson);
  },
  methods: {
    //加载 表单依赖数据
    async initFormDate() {
      console.log("getter", this.EntitySingle("Device", "uuid1234"));

      console.log("path:", this.$route.path, this.$route.query);
      var _path = this.$route.path;
      var _query = this.$route.query;
      //上为url 转为 path 和 query   下为 模拟数据
      // var _path = "/forms/Device/Device-form";
      // var _query = {
      //   condition: "",
      //   enriched: "",
      //   pageSize: ""
      // };
      this.queryData.query = _query;
      this.queryData.targetClass = _path.split("/")[2]; // 实体类名称
      this.queryData.formName = _path.split("/")[3]; // 表单名称
      //加载实体类关联类资源类数据
      //加载实体类数据

      await this.HandleQuery(this.queryData);
      console.log("end")
      this.queryData.uuid = this.QueryResult(this.queryData);
      console.log("uuid:",this.queryData.uuid);
    },
    // 加载格式json，准备解释
    initPreviewJson() {
      //加载表单结构 json
      // this.UpdataFormJson({
      //   targetClass: this.queryData.targetClass,
      //   formName: this.queryData.formName
      // });
      this.previewJson = this.EntityForm(
        this.queryData.targetClass,
        this.queryData.formName
      );
      console.log("this.previewJson", this.previewJson);
    },
    // 创建表单总体
    createFormBase(json) {
      // 判断表单json是否有
      console.log("json", json);

      try {
        json = JSON.parse(json);
      } catch(e) {
        console.log("加载表单内容错误，表单内容为空！");
        return;
      }
      //表单引擎开始工作
      var rootDom = this.$refs.root;
      json.data.elements.forEach(element => {
        this.engine(rootDom, element);
      });
      //执行js
      this.loadScriptString(this.rootJson.extensions);
    },
    engine(parentDom, element) {
      // 表单引擎函数
      var entry = getAddinFunc(element.self.elementType); //获取插件实例构建函数
      var treeDom = new entry(); //创建新实例
      console.log(element.self.elementType, treeDom);
      treeDom.setDisplayType(1).setArgs(element.self.properties)
      var dom = treeDom.setDisplayType(1).setArgs(element.self.properties); //设置显示模式为引擎显示模式
      var name = treeDom.getFormName();
      console.log("name:", name);
      if (name) {
        var value = this.EntityAttrSingle(
          this.queryData.targetClass,
          this.queryData.uuid,
          treeDom.getFormName()
        );
        console.log("value:", value);
        treeDom.setValue(value);
      }
      var dom = treeDom.$mount().$el; //设置显示模式为引擎显示模式
      parentDom.appendChild(dom); //将插件Dom添加入父元素
      if (element.elements && element.elements.length) {
        element.elements.forEach(element => {
          this.engine(dom, element);
        });
      }
    },
    loadScriptUrl(url) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url; //添加地址
      document.body.appendChild(script);
    },
    loadScriptString(code) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      try {
        script.appendChild(document.createTextNode(code));
      } catch (ex) {
        script.text = code;
      }
      document.body.appendChild(script);
    },
    ...mapActions("DWF_form", {
      UpdataFormJson: "updateFormJsonAct",
      updataEntityobj: "updataEntityobjAct",
      HandleQuery: "handleQuery"
    })
  },
  computed: {
    // 使用对象展开运算符将此对象混入到外部对象中
    ...mapGetters("DWF_form", [
      "EntitySingle",
      "EntityList",
      "EntityAttrList",
      "EntityAttrSingle",
      "EntityFormList",
      "EntityForm",
      "RelationSingle",
      "RelationList",
      "RelationAttrList",
      "RelationAttrSingle",
      "RelationFormList",
      "RelationForm",
      "AnotherClass",
      "ResourceSingle",
      "ResourceList",
      "ResourceAttrList",
      "ResourceAttrSingle",
      "QueryResult",
    ])
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.layout {
  padding-left: 20px;
  font-size: 18px;
  text-align: left;
}
b {
  margin: 10px;
  background-color: rgba(247, 16, 16, 0.616);
  color: #fff;
  border-radius: 50%;
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  box-shadow: 3px 5px 5px 2px #ccc;
}
.win {
  margin: 10px 30px;
  text-align: center;
}
.win :last-child {
  background-color: #00f;
}
</style>
