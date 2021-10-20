<template>
  <!--
      建模时的预览前端,即插件的实际显示样式
      :addinName="name"和ref="main"一般情况不可去除
      dropTarget不可去除,用于区分拖拽的目标区域,默认根元素为"0"
   -->
  <section v-show="!args.hided" :addinName="name" ref="main" :style="{'width': arg_width}">
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
    <div ref="echartE">
      <div ref="echart" class="echart-bar selfChart" :style="{'width': chart_width,'height': arg_height}"></div>
    </div>
  </section>
</template>

<script>

  import $ from 'jquery';
  import {mapActions} from "vuex";
  import axios from "@/libs/axios";
  import Axios from 'axios';
  import global_ from '@/views/global.vue';
  import store from "@/store"
  import {Message} from "iview";

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
    props: [
      'argsProps',
      'query',
      'store',
      'echarts',
      'itemValue',
      'formEngine',
      'dwf_ctx',
    ],
    data() {
      return {

        name: name,

        // 属性配置项,按需设置
        args: {
          height: 400,
          heightType: "px",
          editing: true,
          hided: false
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

        editing: true,
        options: {},

        clickFlag: null,
        dbClickFlag: null,

        clickData: {}

      }
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
      'getClassObject',
      'getRClassObject',
      'invokeOperation',
      'parseEscapeString',
      'handleScript',
      'addExtraObj',
      'getEventOperation',
      'invokeEvent',
    ],
    // 插件挂载顺序为: created -> setDisplayType -> setArgs -> setValue -> mounted
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);
      let that = this;
    },
    mounted() {
      // 需要动态设置高度时使用,不用可删去
      // this.setHeight();
      // this.domCM = this.$refs.cm.$el.querySelector(".CodeMirror");
      // let val = this.args.height + "px";
      // this.domCM.style.height = parseInt(val.substring(0, val.length-2)) - 40 + "px";
      let that = this;

      // 事件处理
      if (this.args.events && this.args.events.length > 0) {

        this.clickFlag = this.args.events.find((val) => {
          return val.name == '单击系列'
        })

        this.dbClickFlag = this.args.events.find((val) => {
          return val.name == '双击系列'
        })
      }

      setTimeout(() => {
        // that.chart_width = parseInt(that.$refs.main.offsetWidth * (1 - that.split)) + "px";
        that.chart = that.echarts.init(that.$refs.echart);
        if (that.args.code != "") {
          // that.args.code += " ";
          that.run();
        }
      }, 30);
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
      // arg_height(val) {
      //     this.domCM.style.height = parseInt(val.substring(0, val.length-2)) - 40  + this.args.heightType;
      //     this.chartResize();
      // },
      // split(val) {
      //     this.chartResize();
      // },
      // arg_editing(val) {
      //     if (val) {
      //         this.$refs.echartO.appendChild(this.$refs.echart);
      //     } else {
      //         this.$refs.echartE.appendChild(this.$refs.echart);
      //     }
      //     this.chartResize();
      // },
    },
    methods: {
      ...mapActions("DWF_form", ["handleQueryData"]),

      chartResize() {
        if (!this.chart) return;
        // let split = this.args.editing ? (1 - this.split) : 1;
        // this.chart_width = parseInt(this.$refs.main.offsetWidth * split) + "px";
        this.chart.resize();
      },

      // 返回选择系列
      getSelected(e) {

        let clickResult = [];

        if (!e || e == undefined) {
          clickResult.push(this.clickData);
        } else {
          clickResult.push(e);
        }

        return clickResult;

      },

      run() {
        let that = this;
        if(typeof this.chart.dispose === 'function') this.chart.dispose();
        this.chart = this.echarts.init(this.$refs.echart);

        let params = {
          echarts: this.echarts,
          myChart: this.chart,
          query: this.query,
          store: this.store,
          $: $,
          dwf_axios: dwf_app_axios,
          dwf_modeler_axios: axios,
          axios: Axios.create({baseURL: "", withCredentials: true}),
          handleQueryData: this.handleQueryData,
          msgbox: this.dwf_ctx.msgbox,
          msgboxDialog: this.dwf_ctx.msgboxDialog,
          getRootAddin: this.dwf_ctx.getRootAddin,
          getAddinById: this.dwf_ctx.getAddinById,
          getAllAddin: this.dwf_ctx.getAllAddin,
          obj: this.dwf_ctx.obj(),
          displayType: this.dwf_ctx.displayType(),
          className: this.dwf_ctx.className(),
          validateForm: this.dwf_ctx.validateForm,
          create: this.dwf_ctx.create,
          delete: this.dwf_ctx.delete,
          edit: this.dwf_ctx.edit,
          createObj: this.dwf_ctx.createObj,
          spinShow: this.dwf_ctx.spinShow,
          spinHide: this.dwf_ctx.spinHide,
          closeDialog: this.dwf_ctx.closeDialog,
          closeTab: this.dwf_ctx.closeTab,
          closeTabById: this.dwf_ctx.closeTabById,
          getSocketId: this.dwf_ctx.getSocketId,
          sendMsg: this.dwf_ctx.sendMsg,
          getOperation: this.dwf_ctx.getOperation,
          executeOperation: this.dwf_ctx.executeOperation,
          env: this.dwf_ctx.env,
          user: this.dwf_ctx.user,
          selectedObjs: this.dwf_ctx.selectedObjs,
          defaultObjsAddin: this.dwf_ctx.defaultObjsAddin,
          openForm: this.dwf_ctx.openForm,
          openTab: this.dwf_ctx.openTab,
          openDrawer: this.dwf_ctx.openDrawer,
        };
        // params.getAddinById = params.GetAddinById;
        let code = "let option = null;let echarts=this.echarts;\nlet myChart=this.myChart;\nlet store=this.store;\nlet $=this.$;\n" + this.args.code + "\nreturn option;";
        this.options = new Function(code).call(params);

        // if(typeof this.chart.dispose === 'function') this.chart.dispose();
        // this.chart = this.echarts.init(this.$refs.echart);
        if (this.options) {
          this.chart.clear();

          if (that.clickFlag) {

            that.chart.on('click', function (params) {

              that.commonChartEvent(that.clickFlag, params);

            })

          }

          if (that.dbClickFlag) {

            that.chart.on('dblclick', function (params) {

              that.commonChartEvent(that.dbClickFlag, params);

            })

          }
          this.chart.setOption(this.options);
        }
        this.chartResize();
      },

      freshData() {
        this.run();
      },

      commonChartEvent(eventObj, params) {

        let that = this;
        that.clickData = params.data;
        that.invokeOperation(eventObj.opr_type, eventObj.opr_path, that.itemValue, that.store);

      },

      complete() {
        this.args.editing = false;
        let that = this;
        setTimeout(() => {
          that.chartResize()
        }, 100);
      },

      // 设置异常状态显示
      setError(error) {
        var dom = this.$refs.main.querySelector(".i-input .ivu-input");
        if (dom) dom.style.borderColor = error ? "red" : null;
        return this;
      },

      // 设置校验逻辑,返回true/false
      validate() {
        let expResult = true;

        if (this.args.required && this.value == null) expResult = false;
        else if (this.value != null && this.args.rule) expResult = new RegExp(this.args.rule).test(this.value);

        this.setError(expResult ? null : true);

        return expResult;
      },

      // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
      getValue() {
        return this.value;
      },

      /*
          设置插件对应的值,
          items目前为对应值
          items将为目标对象列表
          特殊情况下需要进行格式转化再赋值
      */
      setValue(items) {
        var value = null;
        if (items == null) {
          // 初始化操作
          value = "defaultValue" in this.args ? this.args.defaultValue : null;
        } else if (typeof items == "object") {
          if (items && items.length > 0) value = items[0][this.args.name];
        } else value = items;
        this.value = value;
        return this;
      },

      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        if (!this.$refs.main) return;
        let that = this;
        if (this.timer == null) {
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
            } else {
              that.times += 30;
              if (that.times > 60 * 1000) {
                clearInterval(that.timer);
                that.timer = null;
              }
            }
          }, 30);
        }
      },

      /*
          type取值范围为 create, visit, edit
          需要根据三个状态修改具体前端和逻辑
          一般情况下:
              create创建态: 无数据,可编辑
              visit浏览态: 有数据,不可编辑
              edit编辑态: 有数据,可编辑
       */
      setDisplayType(type) {
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

      getAllow() {
        return null;
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
