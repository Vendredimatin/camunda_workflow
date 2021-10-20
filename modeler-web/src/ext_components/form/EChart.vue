<template>
  <!--
      建模时的预览前端,即插件的实际显示样式
      :addinName="name"和ref="main"一般情况不可去除
      dropTarget不可去除,用于区分拖拽的目标区域,默认根元素为"0"
   -->
  <section v-if="t_preview" :addinName="name" ref="main" :style="{'width': arg_width}">
    <!--
        不同的拖拽区域设置不同的dropTarget
    -->
    <!-- <Split v-show="arg_editing" v-model="split" style="width: 100%"
    :style="{'height': arg_height}" :min="arg_min">
        <div slot="left">
            <Row type="flex" justify="space-around">
                <Button @click="run">运行</Button>
                <Button @click="complete">完成</Button>
            </Row>
            <codemirror ref="cm" :options="cmOption" v-model="args.code">
            </codemirror>
        </div>
        <div slot="right">
            <div ref="echartO">
                <div ref="echart" :style="{'width': chart_width,'height': arg_height}"></div>
            </div>
        </div>
    </Split> -->
    <Modal v-model="editing" title="编辑" width="80%" :mask-closable="false" @on-cancel="cancel"  @on-ok="run" ok-text="运行">
      <MonacoEditor v-if="editing" v-model="args.code" ref="editor"  @init="editorInit" lang="javascript" theme="chrome" width="100%"
                    height="600"></MonacoEditor>
    </Modal>
    <div ref="echartE">
      <div class="self-echart" ref="echart" :style="{'width': '100%','height': arg_height}"></div>
    </div>
    <!--
        属性编辑框区域
        需要该插件获取attributes, router, route, root, query_oprs, itemValue的prop
        对于不需要设置目标属性的插件,可以将attributes去掉
        对于不需要设置事件的插件,可以将router, route, root, query_oprs去掉
     -->
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name"
                     :widgetAnnotation="widgetAnnotation"
                     :editExtendInfo="editExtendInfo"
                     ref="editbox"
                     v-model="args"
                     :itemValue="itemValue"
                     :router="router"
                     :route="route"
                     :root="root"
                     :query_oprs="query_oprs"
                     :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <!--
                        属性选项放置区域
                        一般一个控件的prop都属于属性选项
                     -->
                    <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        打开编辑
                        <i-switch style="float: right" v-model="editing"/>
                    </div>
                </div>
                <div slot="layout">
                    <!--
                        样式选项放置区域
                        仅有涉及到高度,宽度,对齐等样式的选项放在这里
                     -->
                </div>
                <div slot="operation">
                    <!--
                        事件选项放置区域
                     -->
                </div>
            </EditBox>
        </span>
  </section>
  <!--
      插件的拖拽图标样式
      :addinName="name"不可去除
   -->
  <section v-else :addinName="name">
        <span style="text-align:center">
      <div class="form-addin-icon">
                <i class="iconfont">&#xe69e;</i>
            </div>
          <!-- 设置插件的中文名,名字长度小于等于3时使用 -->
            <div class="form-addin-name">
                自定义
            </div>
          <!-- 设置插件的中文名,名字长度大于3时使用 -->
          <!--
              <Tooltip content="插件中文名" style="width: 100%;" :transfer="true">中文名前两个字...</Tooltip>
           -->
        </span>
  </section>
</template>

<script>
import '@/styles/component/iconfont.css';
import EditBox from "./_EditBox.vue"
import $ from 'jquery';
import {mapActions} from "vuex";
import axios from "@/libs/axios";
import Axios from 'axios';
import global_ from '@/views/global.vue';
import store from "@/store"
import MonacoEditor from "@/views/functional-model/components/MonacoEditor";

// 设置插件英文名, 该name需要与插件文件名一致
const name = "EChart";

// require('codemirror/mode/javascript/javascript')
// require('codemirror/mode/vue/vue')

// // 自动补全
// require('codemirror/addon/hint/show-hint.js')
// require('codemirror/addon/hint/show-hint.css')
// require('codemirror/addon/hint/javascript-hint.js')

// // 括号匹配
// require('codemirror/addon/edit/matchbrackets.js')

// // 代码折叠
// require('codemirror/addon/fold/foldgutter.css')
// require('codemirror/addon/fold/foldcode.js')
// require('codemirror/addon/fold/foldgutter.js')
// require('codemirror/addon/fold/brace-fold.js')
// require('codemirror/addon/fold/comment-fold.js')

// // 主题
// require("codemirror/theme/dracula.css")

const dwf_app_axios = Axios.create({
  baseURL: global_.baseObjOther,
  withCredentials: true
});

dwf_app_axios.interceptors.request.use(
  config => {
    config.headers.Authorization = store.state.user.token;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
)

export default {
  name: name,
  /*
   根据需要使用props
   一般情况下都需要itemValue,
   需要设置目标属性时需要attributes
   需要设置事件时需要query_oprs, route, router, root
   需要用到store时需要store
   */
  props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "query_oprs", "route", "router", "root", "store", "echarts"],
  data() {
    return {

      editing: false,

      times: 0,
      name: name,

      t_preview: true,
      t_edit: false,

      // 属性配置项,按需设置

      actEdit: false,
      args: {
        id: "",                     // 控件代号,一般为必须
        height: 400,                 // 整体高度
        width: 100,                // 整体宽度,单位为%或者px
        widthType: "%",             // 整体宽度的单位
        heightType: "px",             // 整体宽度的单位
        main_fontType: "",          // 元素缺省 主区域字体
        main_fontSize: 14,          // 元素缺省 主区域字号
        main_fontColor: "#000000",  // 元素缺省 主区域字体颜色
        main_color: "#ffffff",      // 主区域背景颜色
        align: "Vertical",          // 元素缺省 元素之间的对齐方式
        g_align: 0,                 // 元素之间的对齐方式
        // back_color: "#ffffff",      // 背景颜色
        back_picture: "",           // 背景图片,超链接
        back_pic_style: "",         // 背景图片样式, 拉伸,平铺,填充
        border: true,               // 是否显示开关边框
        border_color: "#000000",    // 边框颜色
        editing: true,
        hided: false,
        events: [],
        eventRange: ["单击系列", "双击系列"],

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        layout: true,               // 表示自己是布局空间(即不需要目标属性)
        title: "Echarts",               // 插件中文名,需要填入默认值
        // events: [],                 // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
        // eventRange: [],             // 支持的事件列表,元素为事件中文名
        code: "",
      },

      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ['String', 'UUID', 'Clob'],

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,

      // 继承属性,布局控件内的子空间会继承这些属性
      inherit: [],

      cmOption: {
        mode: "javascript",
        // theme: "dracula",
        lineNumbers: true,
        showCursorWhenSelecting: true,
        lineWrapping: true,
        foldGutter: true,
        matchBrackets: true,
        smartIndent: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      },

      domCM: null,

      split: 0.5,

      chart: null,

      chart_width: null,
    }
  },
  // components: {
  //     EditBox
  // },
  components: {
    EditBox,
    MonacoEditor
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.$store = this.store;
    this.setArgs(this.args);
    let that = this;
  },
  mounted() {

    if (this.t_preview) {
      let that = this;
      setTimeout(() => {
        that.chart = that.echarts.init(that.$refs.echart);
        if (that.args.code != "") {
          that.run();
        }
      }, 30);
    }

  },
  // 销毁函数,清除生成的内存占用
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    ;
  },
  computed: {
    arg_width() {
      return this.args.width + this.args.widthType;
    },
    arg_height() {
      return this.args.height + this.args.heightType;
    },
    arg_min() {
      return "40px";
    },
    arg_editing() {
      return this.args.editing;
    }
  },
  watch: {
    arg_width(val) {
      let that = this;
      setTimeout(() => {
        that.chartResize();
      }, 30);
      // this.chartResize();
    },
    arg_height(val) {
      // this.domCM.style.height = parseInt(val.substring(0, val.length-2)) - 40 + this.args.heightType;
      // this.chartResize();
      let that = this;
      setTimeout(() => {
        that.chartResize();
      }, 30);
    },
    split(val) {
      this.chartResize();
    },
    editing(val){
      if(val){
        this.codeCatch = this.args.code;
      }
    },
    arg_editing(val) {
      if (val) {
        this.$refs.echartO.appendChild(this.$refs.echart);
      } else {
        this.$refs.echartE.appendChild(this.$refs.echart);
      }
      this.chartResize();
    },
  },
  methods: {
    ...mapActions("DWF_form", ["handleQueryData"]),

    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },

    chartResize() {
      if (!this.chart) return;
      // let split = this.args.editing ? (1 - this.split) : 1;
      // this.chart_width = parseInt(this.$refs.main.offsetWidth * split) + "px";
      this.chart.resize();
    },

    resizeChart() {

      console.log(555)
      let self = this;
      setTimeout(function () {
        let eleW = document.getElementsByClassName('self-echart');
        for (var i = 0; i < eleW.length; i++) {
          const eachPW = eleW[i].parentNode.clientWidth;
          var myChart = self.echarts.getInstanceByDom(eleW[i]);
          if (myChart) {
            myChart.resize();
          }
        }
      }, 200)

    },
    cancel() {
      this.args.code = this.codeCatch;
      this.$refs.editor.setValue(this.args.code);
    },
    run() {
      let that = this;
      if(typeof this.chart.dispose === 'function') this.chart.dispose();
      this.chart = this.echarts.init(this.$refs.echart);
      
      let params = {
        echarts: this.echarts, myChart: this.chart, store: this.store, $: $,
        dwf_axios: dwf_app_axios, dwf_modeler_axios: axios, axios: Axios.create({baseURL: "", withCredentials: true}),
        GetAddinById: (id) => {
          return that.GetAddinById(this.itemValue.data, id);
        },
        handleQueryData: this.handleQueryData
      };
      params.getAddinById = params.GetAddinById;
      let code = "let option = null;let echarts=this.echarts;\nlet myChart=this.myChart;\nlet store=this.store;\nlet $=this.$;\n" + this.args.code + "\nreturn option;";
      let options = new Function(code).call(params);
      if (options) {

        if(typeof this.chart.dispose === 'function') this.chart.dispose();
        this.chart = this.echarts.init(this.$refs.echart);

        this.chart.clear();
        this.chart.setOption(options, true);
        
      }
      this.chartResize();
    },


    complete() {
      this.args.editing = false;
      let that = this;
      setTimeout(() => {
        that.chartResize()
      }, 100);
    },

    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      if (!this.$refs.main) return;
      let that = this;
      this.timer = setInterval(() => {
        if (!that.$refs.main) {
          clearInterval(that.timer);
          that.timer = null;
          return;
        }
        // 改成你需要的样式
        var dom = that.$refs.main.querySelector(".i-input .ivu-input");
        if (dom) {
          dom.style.height = that.arg_height;
          clearInterval(that.timer);
          that.timer = null;
        }
        that.times += 30;
        if (that.times > 60 * 1000) {
          clearInterval(that.timer);
          that.timer = null;
        }
      }, 30);
    },

    setDisplayType(type) {
      this.t_preview = type == 0;
      return this;
    },

    getFormName() {
      return this.args.name;
    },

    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("name" in args) this.args_name = this.args.name;
      return this;
    },

    getArgs() {
      return this.args;
    },

    // 是否允许往dropTarget区域添加元素,null为不允许，[]为允许全部，非空为允许部分, dropTarget可传空
    getAllow(dropTarget) {
      return null;
    },

    // 获取dropTarget区域可继承属性, dropTarget可传空
    getInherit(dropTarget) {
      var res = {};
      let that = this;
      this.inherit.forEach(x => res[x] = that.args[x]);
      return res;
    },

    getEditBoxComponent() {
      return this.$refs.editbox;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    }
  }
}
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
