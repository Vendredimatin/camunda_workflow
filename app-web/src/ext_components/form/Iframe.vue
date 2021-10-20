<template>
    <section :addinName="name" v-show="!args.hided" :style="{'width': colWidth}">
        <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'position': 'relative'}">
            <span :style="{'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
              <iframe :src="url"
                      v-if="iframeReload"
                      :sandbox="args.sandbox"
                      style="width: 100%; border: none;" :style="{
                    'height': arg_height,
                    'display': 'inline-block'}">

              </iframe>
            </span>
        </span>
    </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import "@/styles/component/iconfont.css";
import EntityModeling from "@/api/data-model/EntityModeling";
const name = "Iframe";
export default {
  // 插件名
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
  // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
  data() {
    return {
      // 插件名
      name: name,

      // 展示模式
      t_create: false,
      t_edit: false,
      t_visit: true,

      // 图标地址
      icon_url: "",
      icon_name: "",

      value: "",
      dataTypes: ["String"],
      // 编辑框
      args: {
        title: '网页',
        id: null,
        label: "",
        name: "",
        sandbox: 'allow-modals allow-forms allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation',
        url: "http://www.nelbds.org.cn/",

        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,

        targetDataType: null,
        height: 100,
        heightType: "px",
        width: 100,
        widthType: '%',
        cols: true,
        col: 3,
        hided: false,
      },
      minHeight: 3,
      alignList: [
        {
          value: 0,
          name: "左上对齐"
        },
        {
          value: 1,
          name: "靠左对齐"
        },
        {
          value: 2,
          name: "左下对齐"
        },
        {
          value: 3,
          name: "顶部对齐"
        },
        {
          value: 4,
          name: "居中对齐"
        },
        {
          value: 5,
          name: "底部对齐"
        },
        {
          value: 6,
          name: "右上对齐"
        },
        {
          value: 7,
          name: "靠右对齐"
        },
        {
          value: 8,
          name: "右下对齐"
        }
      ],
      inherit: [],
      url: "http://www.nelbds.org.cn/",

      // 对象队列
      targetClassObjects: [],
      queryData: {
          query: "", // 查询条件
          targetClass: "", // 目标类名
          formName: "", //
          uuid: ""
        },

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},
      iframeReload: true,
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

    this.$store = this.store;
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    this.iframeReload = false;
    this.url = this.parseEscapeString(this.args.url, null, null, this.itemValue.data.origin, this.attributes, this.$store);
    this.$nextTick(() => {
      this.iframeReload = true;
    })
    // setTimeout(() => {
    //   console.log('ori url of iframe', that.args.url);
    //   that.url = parseEscapeString(that.args.url, null, null, that.getObj(that.itemValue.data), that.attributes);
    //   console.log('url of iframe parsed', that.url, that.getObj(that.itemValue.data));
    // }, 300);
  },
  // 定义组件的函数接口
  methods: {
    ...mapActions("DWF_form", ["queryEntity", "queryRelation"]),

    // 获取控件属性值
    getValue() {
      return this.value;
    },

    // 设置控件属性值
    setValue(item) {
      if (typeof item == "object"){
        if (item && item.length > 0) value = item[0][this.args.name];
      }
      else{
        this.value = item[0][this.args.name];
      }
      return this;
    },

    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow() {
      return null;
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    // 设置基本属性
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      delete this.args['name'];
      delete this.args['dynamic'];
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    // 获取插件的属性编辑框的dom元素
    getEditBox(args) {
      this.t_edit = true;
      return this.$refs.edit;
    },

    // 获取插件名
    getName() {
      return name;
    },

    setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
            this.t_create = true;
        }
        else if (type == "edit") {
            this.t_edit = true;
        }
        else if (type == "visit") {
            this.t_visit = true;
        }
        return this;
    },

    setError(error) {
      return this;
    },
    validate() {
      return true;
    },

    // 设置插件的图标
    setIcon(id) {
      this.icon_url = id;
      return this;
    },

    getIcon() {
      return this.icon_url;
    },

    // 设置插件支持的数据类型，返回类型为数据类型的列表
    getDataType(args) {
      return this.dataTypes;
    },

  },
  watch: {
  },
  computed: {
    ...mapGetters("DWF_form", ["EntityAttrList", "RelationAttrList"]),

    arg_height() {
      return this.args.height < 4 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
    },
    labelWidth() {
      return (
        parseInt(
          (100 * this.args.label_width) /
            (this.args.label_width + this.args.main_width)
        ) + "%"
      );
    },
    mainWidth() {
      return !this.args.label || this.args.label == ""
        ? "100%"
        : parseInt(
            (100 * this.args.main_width) /
              (this.args.label_width + this.args.main_width)
          ) + "%";
    },
    labelXAlign() {
      let x = parseInt(this.args.label_align / 3);
      if (x == 0) return "left";
      else if (x == 1) return "center";
      else return "right";
    },
    labelYAlign() {
      let x = this.args.label_align % 3;
      if (x == 0) return "top";
      else if (x == 1) return "middle";
      else return "bottom";
    },
    mainXAlign() {
      let x = parseInt(this.args.main_align / 3);
      if (x == 0) return "left";
      else if (x == 1) return "center";
      else return "right";
    },
    mainYAlign() {
      let x = this.args.main_align % 3;
      if (x == 0) return "top";
      else if (x == 1) return "middle";
      else return "bottom";
    }
  }
};
</script>

<style scoped>
/*
        插件的css部分
        设置display为inline，默认不换行
        scoped表示样式仅在该vue文件内有效
    */
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
