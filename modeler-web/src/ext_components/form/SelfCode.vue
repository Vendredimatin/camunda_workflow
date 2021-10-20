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
    <Modal v-model="editing" title="编辑" width="80%" :mask-closable="false" @on-cancel="cancel" @on-ok="run"
           ok-text="运行">
      <Tabs v-model="args.type" name="selfCode-tab">
        <TabPane label="HTML" name="html" tab="selfCode-tab">
          <MonacoEditor v-if="editing" ref="htmlEditor" v-model="args.htmlCode" @init="editorInit" lang="html"
                        theme="chrome" width="100%" height="600"></MonacoEditor>
        </TabPane>
        <TabPane label="Vue" name="vue" tab="selfCode-tab">
          <MonacoEditor v-if="editing" ref="vueEditor" v-model="args.vueCode" @init="editorInit" lang="html"
                        theme="chrome" width="100%" height="600"></MonacoEditor>
        </TabPane>
      </Tabs>
    </Modal>
    <Modal v-model="collectVis" title="添加收藏" width="40%" :mask-closable="false" :loading="true">
      <Form ref='collectForm' :model="form" :rules="rule" :label-width="100">
        <div>
          <FormItem label="名称" prop="name">
            <Input v-model.trim="form.name"></Input>
          </FormItem>
        </div>
        <div>
          <FormItem label="显示图标" prop="icon">
            <Select v-model="form.icon" filterable clearable>
              <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                <span style="float:right;color:#ccc">{{ item.label }}</span>
              </Option>
              <Option v-for="x in iList" :value="x.value" :key="x.value" :label="x.label">
                <i class="iconfont" :class="x.value" style="font-size: 20px !important;"></i>
                <span style="float:right;color:#ccc">{{ x.label }}</span>
              </Option>
            </Select>
          </FormItem>
        </div>
      </Form>
      <div slot="footer">
        <Button type="text" @click="collectVis = false">取消</Button>
        <Button type="primary" @click="addCollect">确认</Button>
      </div>
    </Modal>
    <Modal v-model="hint" :title="hintTitle" width="40%" :mask-closable="false" @on-cancel="cancelHint" @on-ok="onHint">
      <p style='font-size: 16px; font-weight: bold'>{{ hintStrong }}</p>
      <p>{{ hintContent }}</p>
    </Modal>
    <div ref="resultDiv" class="result-wrap" :style="{'height': arg_height}">
      <!-- <p>result</p> -->
      <div v-show="args.url.indexOf('.html') == -1" :src="codeImg" alt=""
           :style="{
                'background-image': 'url(' + codeImg + ')',
                'height': '100%',
                'width': '100%',
                'background-size': 'auto',
                'background-repeat': 'no-repeat',
                'background-position': 'center',
               }"
      >

      </div>
      <div class="iframe-mask"
           :style="{'height': arg_height, 'width': '100%', 'padding':'5px !important','z-index': '7', 'position': 'absolute', 'top': '0px'}">

      </div>
      <iframe v-if="args.url.indexOf('.html') != -1 && urlReload" ref="iframe" id="selfCodeIframe" width="100%" height="100%"
              :src="args_url"></iframe>
      <Spin fix v-if="loading"></Spin>
    </div>
    <!--
        属性编辑框区域
        需要该插件获取attributes, router, route, root, query_oprs, itemValue的prop
        对于不需要设置目标属性的插件,可以将attributes去掉
        对于不需要设置事件的插件,可以将router, route, root, query_oprs去掉
     -->
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation"
                     :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
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
                    <div>
                        <Button type='primary' :disabled="editDis" @click="onClick"
                                style='display: inline-block; width:45%; margin-left: 2.5%; margin-right: 2.5%'>
                            编辑代码
                        </Button>
                        <Button type='primary' :disabled="origin" @click="showCollectModal"
                                style='display: inline-block; width:45%; margin-left: 2.5%; margin-right: 2.5%'>
                            添加收藏
                        </Button>
                    </div>
                    <div v-if="args.collected" class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        是否与收藏同步
                        <i-switch style="float: right" v-model="args.collectSync" @on-change="syncChange"/>
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
                <i class="iconfont">&#xe69d;</i>
            </div>
          <!-- 设置插件的中文名,名字长度小于等于3时使用 -->
          <!-- <div class="form-addin-name">
              在线编辑
          </div> -->
          <!-- 设置插件的中文名,名字长度大于3时使用 -->

                <Tooltip class="form-addin-name" content="超级控件" style="width: 100%;" :transfer="true">超级控件</Tooltip>

        </span>
  </section>
</template>

<script>

import {uuid} from '@/util/assist'
import '@/styles/component/iconfont.css';
import EditBox from "./_EditBox.vue"
import store from "@/store";
import {sendCode} from '@/api/others';
import axios from 'axios';
import moduleIconData from "@/views/functional-model/components/moduleIcon.js";
import fontIconData from "@/views/functional-model/components/iFontIcon.js";
import {createView} from "@/api/others";
import codeImg from '@/assets/images/selfCode.png';
import MonacoEditor from "@/views/functional-model/components/MonacoEditor";

// 设置插件英文名, 该name需要与插件文件名一致
const name = "SelfCode";

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

export default {
  name: name,
  /*
   根据需要使用props
   一般情况下都需要itemValue,
   需要设置目标属性时需要attributes
   需要设置事件时需要query_oprs, route, router, root
   需要用到store时需要store
   */
  props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "query_oprs", "route", "router", "root", "store", "echarts", "Message"],
  data() {
    return {
      origin: false,
      codeImg: codeImg,

      hint: false,
      hintType: '',
      hintTitle: '',
      hintStrong: '',
      hintContent: '',

      editing: false,
      loading: false,

      editDis: false,
      collectDis: false,
      editTab: 'html',

      collectVis: false,

      form: {
        name: '',
        icon: '',
      },

      rule: {
        name: [
          {required: true, message: '名称不能为空哦～', trigger: 'blur'},
          {
            pattern: /^\S{1,32}$/,
            message: "名称只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ],
        icon: [
          {required: true, message: '请选择小图标～', trigger: 'change'}
        ],
      },

      iconList: [],
      iList: [],
      iconType: {},

      times: 0,
      name: name,

      $: null,

      t_preview: true,
      t_edit: false,

      // 属性配置项,按需设置

      actEdit: false,
      args: {
        iconType: -1,
        uname: "",
        old_type: "",
        old_uuid: "",
        old_htmlCode: "",
        old_vueCode: "",
        collected: false,
        collectSync: false,
        hided: false,
        url_uuid: "",
        type: "html",
        htmlCode: "",
        cssCode: "",
        jsCode: "",
        vueCode: "",
        url: "",

        id: "",                     // 控件代号,一般为必须
        height: 400,                 // 整体高度
        width: 100,                // 整体宽度,单位为%或者px
        widthType: "%",             // 整体宽度的单位
        heightType: "px",             // 整体宽度的单位
        main_fontType: "",          // 元素缺省 主区域字体
        main_fontSize: 14,          // 元素缺省 主区域字号
        main_fontColor: "#000000",  // 元素缺省 主区域字体颜色
        // main_color: "#ffffff",      // 主区域背景颜色
        align: "Vertical",          // 元素缺省 元素之间的对齐方式
        g_align: 0,                 // 元素之间的对齐方式
        // back_color: "#ffffff",      // 背景颜色
        back_picture: "",           // 背景图片,超链接
        back_pic_style: "",         // 背景图片样式, 拉伸,平铺,填充
        border: true,               // 是否显示开关边框
        border_color: "#000000",    // 边框颜色
        editing: true,

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        layout: true,               // 表示自己是布局空间(即不需要目标属性)
        title: "Html扩展",               // 插件中文名,需要填入默认值
        // events: [],                 // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
        // eventRange: [],             // 支持的事件列表,元素为事件中文名
        collectId: '',
      },

      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ['String', 'UUID', 'Clob'],

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,

      // 继承属性,布局控件内的子空间会继承这些属性
      inherit: [],

      cmOption: {
        mode: "code",
        theme: "dracula",
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

      panelVis_html: true,
      panelVis_css: true,
      panelVis_js: true,
      panelVis_vue: false,

      bt_html: "primary",
      bt_css: "primary",
      bt_js: "primary",
      bt_vue: "default",

      span: 8,
      urlReload: true,
    }
  },
  components: {
    EditBox,
    MonacoEditor,
  },
  // components: {
  //     EditBox
  // },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
  },
  mounted() {
    if (this.t_preview) {

      var IframeOnClick = {
        resolution: 200,
        iframes: [],
        interval: null,
        Iframe: function () {
          this.element = arguments[0];
          this.cb = arguments[1];
          this.hasTracked = false;
        },
        track: function (element, cb) {
          this.iframes.push(new this.Iframe(element, cb));
          if (!this.interval) {
            var _this = this;
            this.interval = setInterval(function () {
              _this.checkClick();
            }, this.resolution);
          }
        },
        checkClick: function () {
          if (document.activeElement) {
            var activeElement = document.activeElement;
            for (var i in this.iframes) {
              if (activeElement === this.iframes[i].element) {
                if (this.iframes[i].hasTracked == false) {
                  this.iframes[i].cb.apply(window, []);
                  this.iframes[i].hasTracked = true;
                }
              } else {
                this.iframes[i].hasTracked = false;
              }
            }
          }
        }
      };

      let _this = this;
      setTimeout(() => {
        let iframe = _this.$refs.iframe;
        let main = _this.$refs.main;
        if(iframe){
          iframe.onload = () => {
            IframeOnClick.track(document.getElementById("selfCodeIframe"), function () {
              main.click();
            });
          }
        }
      }, 100)
      this.initFresh();
      if (this.args.collected) this.origin = true;
      if (this.args.htmlCode == "") {
        this.args.htmlCode = "<html>\n" +
          "<head>\n" +
          '\t<meta charset="utf-8">\n' +
          '\t<!-- <link rel="stylesheet" type="text/css" href="http://unpkg.com/iview/dist/styles/iview.css">\n' +
          '\t<script type="text/javascript" src="http://v1.vuejs.org/js/vue.min.js"><\/script>\n' +
          '\t<script type="text/javascript" src="http://unpkg.com/iview@1.0.1/dist/iview.min.js"><\/script> -->\n' +
          '<\/head>\n' +
          '<body>\n' +
          '<!-- \n' +
          '<div id="app">\n' +
          '\t<i-button @click="show">Hello world!<\/i-button>\n' +
          '\t<Modal :visible.sync="visible" title="Welcome">Hello World<\/Modal>\n' +
          '<\/div>\n' +
          '--> \n' +
          '<script>\n' +
          '\/*\n' +
          '\tnew Vue({\n' +
          '\t\tel: "#app",\n' +
          '\t\tdata: {\n' +
          '\t\t\tvisible: false\n' +
          '\t\t},\n' +
          '\t\tmethods: {\n' +
          '\t\t\tshow: function() {\n' +
          '\t\t\t\tthis.visible = true;\n' +
          '\t\t\t}\n' +
          '\t\t}\n' +
          '\t})\n' +
          '*\/\n' +
          '<\/script>\n' +
          '<\/body>\n' +
          '<\/html>';
      }
      if (this.args.vueCode == "") {
        this.args.vueCode = "<template>\n" +
          "\t<div>\n" +
          "\t\t<!-- <Button>Hello World<\/Button> -->\n" +
          "\t<\/div>\n" +
          "<\/template>\n" +
          "<script>\n" +
          "// import { Button } from 'iview';\n" +
          "export default {\n" +
          "\t//components: { Button },\n" +
          "\tdata() {\n" +
          "\t\treturn {\n" +
          "\t\t}\n" +
          "\t},\n" +
          "}\n" +
          "<\/script>\n" +
          "<style>\n" +
          "/*\n" +
          '@import "../../node_modules/iview/dist/styles/iview.css";\n' +
          "*/\n" +
          "<\/style>"
      }
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
    args_url() {
      if (this.args.url.indexOf('://') != -1) {
        return `${this.args.url}?v=${new Date().getTime()}`;
      } else {
        return `${Config.tomcatUrl}${this.args.url}?v=${new Date().getTime()}`;
      }
    }
  },
  methods: {

    syncChange(flag) {
      if (flag) {
        this.hintType = "sync";
        this.hintTitle = "打开同步";
        this.hintStrong = `您确定要打开与 ${this.args.uname} 控件的同步吗?`;
        this.hintContent = "如果打开同步控件将自动为您同步到最新状态,您自行修改的部分将会失效,请注意保存";
        this.hint = true;
      } else {
        this.hintType = "sync";
        this.hintTitle = "关闭同步";
        this.hintStrong = `您确定要关闭与 ${this.args.uname} 控件的同步吗?`;
        this.hintContent = "如果断开同步将无法自动同步,您也可以稍后自行打开同步开关进行同步";
        this.hint = true;
      }
    },

    initFresh() {
      if (this.args.collected && this.args.collectSync){
        var  collectAddin;
        collectAddin = this.root.superControl.find(addin => addin.oidProps === this.args.collectId);
        if (collectAddin) {
          this.args.old_type = _.cloneDeep(collectAddin.argsProps.type);
          this.args.old_htmlCode = _.cloneDeep(collectAddin.argsProps.htmlCode);
          this.args.old_vueCode = _.cloneDeep(collectAddin.argsProps.vueCode);
        }
        this.args.htmlCode = this.args.old_htmlCode;
        this.args.vueCode = this.args.old_vueCode;
        this.args.type = this.args.old_type;
        if (this.args.collectId) {
          this.args.url = `/code/${this.args.collectId}_${this.args.type}.html`;
        }
        this.$nextTick(() => {
          if (this.$refs.iframe && this.$refs.iframe.contentWindow && this.$refs.iframe.contentWindow.location) {
            try {
              this.$refs.iframe.contentWindow.location.reload();
            } catch (e) {

            }
          }
        })
      }
    },

    syncFresh(type, html, vue, oid) {
      if (this.args.collected && this.args.collectSync && oid === this.args.collectId){
        var  collectAddin;
        collectAddin = this.root.superControl.find(addin => addin.oidProps === this.args.collectId);
        if (collectAddin) {
          this.args.old_type = _.cloneDeep(collectAddin.argsProps.type);
          this.args.old_htmlCode = _.cloneDeep(collectAddin.argsProps.htmlCode);
          this.args.old_vueCode = _.cloneDeep(collectAddin.argsProps.vueCode);
        }
        this.args.old_htmlCode = this.args.htmlCode = html;
        this.args.old_vueCode = this.args.vueCode = vue;
        this.args.old_type = this.args.type = type;
        this.urlReload = false;
        if (this.args.collectId) {
          this.args.url = `/code/${this.args.collectId}_${this.args.type}.html`;
        }
        this.$nextTick(() => {
          this.urlReload = true;
          this.$nextTick(() => {
            if (this.$refs.iframe && this.$refs.iframe.contentWindow && this.$refs.iframe.contentWindow.location) {
              try {
                this.$refs.iframe.contentWindow.location.reload();
              } catch (e) {

              }
            }
          })
        })
      }
    },

    onHint() {
      if (this.hintType == "run" || (this.hintType == "sync" && !this.args.collectSync)) {
        // let tmp = this.args.old_uuid;
        // this.args.old_uuid = this.args.url_uuid;
        // this.args.url_uuid = tmp;
        this.args.collectSync = false;
        this.run();
      } else if (this.hintType == "sync" && this.args.collectSync) {
        this.origin = true;
        let collectAddin = this.root.superControl.find(addin => addin.oidProps === this.args.collectId);
        if (this.root.superControl && collectAddin) {
          this.args.old_type = _.cloneDeep(collectAddin.argsProps.type);
          this.args.old_htmlCode = _.cloneDeep(collectAddin.argsProps.htmlCode);
          this.args.old_vueCode = _.cloneDeep(collectAddin.argsProps.vueCode);
        }
        this.args.htmlCode = this.args.old_htmlCode;
        this.args.vueCode = this.args.old_vueCode;
        this.args.type = this.args.old_type;
        // let tmp = this.args.old_uuid;
        // this.args.old_uuid = this.args.url_uuid;
        this.args.url_uuid = this.args.collectId;
        //${Config.tomcatUrl}
        this.urlReload = false;
        this.args.url = `/code/${this.args.url_uuid + '_' + this.args.type}.html`;
        this.$nextTick(() => {
          this.urlReload = true;
        })
      }
      this.hint = false;
    },

    cancelHint() {
      if (this.hintType == "sync") this.args.collectSync = !this.args.collectSync;
      this.hint = false;
    },

    cancel() {
      this.args.htmlCode = this.htmlCatch;
      this.args.vueCode = this.vueCatch;
      this.$nextTick(() => {
        if (this.args.type == "html") {
          this.$refs.htmlEditor.setValue(this.args.htmlCode);
        } else {
          this.$refs.vueEditor.setValue(this.args.vueCode);
        }
      })
    },

    showCollectModal() {

      if (this.iconList.length == 0) {
        this.iconList = moduleIconData;
        this.iconList.forEach(x => {
          this.iconType[x.value] = 0;
        })
      }
      if (this.iList.length == 0) {
        this.iList = fontIconData;
        this.iList.forEach(x => {
          this.iconType[x.value] = 1;
        })
      }
      this.$refs.collectForm.resetFields();
      this.collectVis = true
    },

    addCollect() {
      this.$refs.collectForm.validate(async (valid) => {
        if (!valid) {
          this.Message.warning('格式有误,添加失败');
        } else {
          if (this.args.url_uuid == "") this.args.url_uuid = uuid();
          let args = {
            ...this.args,
            title: this.form.name ? "超级控件 / " + this.form.name : "超级控件",
            collected: true,
            collectSync: true,
            old_uuid: "",
            old_htmlCode: this.args.htmlCode,
            old_vueCode: this.args.vueCode,
            old_type: this.args.type,
            uname: this.form.name,
            icon: this.form.icon,
            iconType: this.form.icon in this.iconType ? this.iconType[this.form.icon] : -1,
          };
          // args.url = `/code/${args.url_uuid + '_' + args.type}.html`;
          //收藏先调用createView
          let item = {
            className: '*',
            hasThumbnail: false,
            v3Content: JSON.stringify(args),
            viewName: '@SuperControl',
            displayName: this.form.name,
            formType: 'PC'
          };
          let res = await createView([item]);
          if (res.data.success && res.data.code == 200) {
            item.oid = res.data.data[0];

            let params = {
              type: args.type,
              uuid: this.args.url_uuid + '_' + args.type,
              new_uuid: item.oid + '_' + args.type,
            };

            let collect = await axios({
              method: "post",
              url: `${Config.baseUrl}/code-collect`,
              data: JSON.stringify(params),
              headers: {"Content-Type": "application/json"},
            });
            if (!collect.data.success) {
              this.Message.error("添加收藏失败");
              this.collectVis = false;
              return;
            }else{
              if (this.root.addSuperControl) {
                item.v3Content = args;
                this.root.addSuperControl(item);
              }
              this.Message.success('添加收藏成功');
              this.collectVis = false;
            }
          } else {
            let message = "添加失败";
            if (res.data.message) message = res.data.message;
            this.Message.error(message);
          }
        }
      })
    },

    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },

    onClick() {
      this.editing = true;
      this.htmlCatch = this.args.htmlCode;
      this.vueCatch = this.args.vueCode;
    },

    async run() {
      if (this.loading) return;
      this.origin = false;
      if (this.args.collected && this.args.collectSync) {
        this.hintTitle = "关闭同步";
        this.hintType = "run";
        this.hintStrong = `您确定要断开与 ${this.args.uname} 控件的同步?`;
        this.hintContent = "执行代码需要断开同步.您也可以稍后自行打开同步开关进行同步";
        this.hint = true;
        return;
      }
      this.loading = true;
      if (this.args.url_uuid == "") this.args.url_uuid = uuid();
      if (this.args.collectId === this.args.url_uuid) this.args.url_uuid = uuid();//如果断开同步使用新的uuid
      this.args.htmlCode = this.args.htmlCode.replace("&quot;", '"');
      let params = {
        type: this.args.type,
        html: this.args.htmlCode,
        css: this.args.cssCode,
        js: this.args.jsCode,
        vue: this.args.vueCode,
        uuid: this.args.url_uuid
      };
      params.uuid = this.args.url_uuid + '_' + params.type;

      let res = await axios({
        method: "post",
        url: `${Config.baseUrl}/code-upload`,
        data: JSON.stringify(params),
        headers: {"Content-Type": "application/json"},
      });
      let url = `/code/${params.uuid}.html`;
      this.args.url = url;
      this.urlReload = false;
      this.$nextTick(() => {
        this.urlReload = true;
        try {
          this.$nextTick(() => {
            this.$refs.iframe.contentWindow.location.reload();
          })
        } catch (e) {
        }
      })
      this.loading = false;
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
          dom.style.height = that.arg_height + "px";
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
  if ("uname" in args) this.args.title = this.args.uname ? "超级控件 / " + this.args.uname : "超级控件";
      if ("uuid" in args && !("url_uuid" in args)) this.args.url_uuid = this.args.uuid;
      //如果控件是收藏控件 && 同步状态
      if ("collectId" in args && args.collectId && this.args.collectSync) this.args.url = `/code/${this.args.collectId + '_' + this.args.type}.html`;
      try {
        if (this.args.url.match(/\/[a-z0-9A-Z]*\_/g).length > 0) {
          this.args.url_uuid = this.args.url.match(/\/[a-z0-9A-Z]*\_/g)[0].replace('/', '').replace('_', '')
        }
      } catch (e) {
        console.error(`转换url_uuid${e}`)
      }
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

<style>
.result-wrap {
  display: block;
  width: 100%;
  position: relative;
  text-align: center;
}
</style>

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
