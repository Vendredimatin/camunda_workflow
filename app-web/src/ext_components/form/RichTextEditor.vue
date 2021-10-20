<template>
  <section :addinName="name" ref="main" :style="{'width': colWidth}" :class="{'dark': arg_dark}">
    <span v-if="args.required || args.label"
          v-show="!args.hided" :style="{'width': labelWidth, 'display': 'inline-block',
                'text-align': labelXAlign, 'vertical-align': labelYAlign,
                'background-color': args.label_color}">
                    <span v-if="args.required" style="color: red">*</span>
                    <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
      <quill-editor
        v-show="!args.hided"
        v-model="args.content"
        ref="myQuillEditor"
        :disabled="readOnly"
        :class="{'readonlyCursor': readOnly || args.readonly}"
        :style="{'height': arg_editorHeight, 'max-height': arg_editorHeight, 'width': '100%', 'display': 'inline-block'}"
        :options="args.editorOption"
        @blur="onEditorBlur($event)"
        @focus="onEditorFocus($event)"
        @ready="onEditorReady($event)"
        @change="onEditorChange($event)">
      </quill-editor>
    <span v-show="isRequired && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'color': 'red'}">
        <span v-show="isRequired && !args.hided" class="wrongTips">该项不能为空</span>
      </span>
    <span v-show="isWrong && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'color': 'red'}">
            <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>
  </section>
</template>

<script>

  import "@/styles/component/iconfont.css";

  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'

  import { quillEditor } from 'vue-quill-editor'

  import Quill from 'quill'
  import ImageResize from 'quill-image-resize-module';
  Quill.register('modules/imageResize', ImageResize);
  // 设置插件英文名, 该name需要与插件文件名一致
  const name = "RichTextEditor";

  export default {
    name: name,
    /*
       根据需要使用props
       一般情况下都需要itemValue,
       需要设置目标属性时需要attributes, relation
       需要设置事件时需要query_oprs, route, router, root, Message
       需要用到store时需要store
       */
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
      'attributes',
    ],
    data() {
      return {
        times: 0,
        name: name,

        t_preview: true,
        t_edit: false,
        t_visit: true,
        isRequired: false,
        // 属性配置项,按需设置
        readOnly: false,
        args: {
          dynamic: false,
          name: "", // 目标属性
          label: "", // 标签名称
          id: "", // 控件代号,一般为必须
          height: 310, // 整体高度
          editorHeight: 200, // 编辑器高度
          heightType: "px", // 整体宽度的单位
          editorHeightType: 'px', // 编辑器高度单位
          width: 100,
          readonly: false,
          widthType: '%',
          label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
          label_fontColor: "initial", // 标签字体颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          main_align: 4, // 主区域对齐方式,默认为4居中对齐
          label_width: 1,
          main_width: 0, // 标签与主区域的占比为 label_width : main_width
          required: false, // 是否必填
          validate: true,
          // 以下为不在属性编辑框中设置,但默认要有的配置项
          title: "富文本编辑器", // 插件中文名,需要填入默认值
          col: true, // 是否不占满全部
          cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null, // 目标数据类型
          events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: ["值变化"], // 支持的事件列表,元素为事件中文名
          //富文本编辑器
          editorOption: {
            placeholder: '请输入',
            modules: {
              imageResize: {
                displayStyles: {
                  backgroundColor: 'black',
                  border: 'none',
                  color: 'white'
                },
                modules: [ 'Resize', 'DisplaySize' ]
              },
              // keyboard: {
              //   bindings: {
              //     custom: {
              //       key: '1',
              //       handler: function(range, context) {
              //         console.log(33333333333333333333333)
              //         this.$refs.myQuillEditorq.quill.insertText(range.index, '<br> ');
              //         setTimeout(() => {
              //           let nowRange = this.$refs.myQuillEditorq.quill.getSelection().index - 1
              //           this.$refs.myQuillEditorq.quill.setSelection(nowRange)
              //         }, 0)
              //       }
              //     }
              //   }
              // },
              toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                [{'script': 'sub'}, {'script': 'super'}],
                [{'indent': '-1'}, {'indent': '+1'}],
                [{'direction': 'rtl'}],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{'font': []}],
                [{'color': []}, {'background': []}],
                [{'align': []}],
                ['clean'],
                ['link', 'image', 'video']
              ],
            },
          },
          content: "",
          hided: false,
        },
        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ["String",  "Clob"],
        // 需要设置目标属性时使用
        attrMap: {},
        vChange: null,
        // 需要动态设置高度时使用
        timer: null,
        value: "",
        isWrong: false,
        errorMessage: '',
      };
    },
    components: {
      quillEditor
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
    },

    mounted() {
      // this.addQuillTitle();
      // 需要动态设置高度时使用,不用可删去
      this.setHeight();
      this.vChange = this.args.events.find((val) => {
        return val.name == '值变化'
      })
    },
    watch: {
      'args.readonly'(val){
        if(val){
          this.readOnly = 'disabled';
        }else{
          this.readOnly = false;
        }
      }
    },
    computed: {
      args_fsize(){
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      arg_dark(){
        //分享session里是dark但是没有颜色。先用url地址区分是否是分享
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && !location.search.match('token') && !location.search.match('displayType')
      },
      args_label_fontColor(){
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + '!important'
      },
      // 需要设置目标属性时使用,不用可删去
      arg_name() {
        return this.args.name;
      },
      arg_height() {
        return this.args.height + this.args.heightType;
      },
      arg_editorHeight(){
        return this.args.editorHeight < 2 ? this.args.editorHeight * 200 + "px" : this.args.editorHeight + this.args.editorHeightType;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%buy" : "100%";
      },
      labelWidth() {
        return (!this.args.label || this.args.label == "") && this.args.required
          ? "10%"
          : "100%";
      },
      mainWidth() {
        return '100%';
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
      },
    },
    // 销毁函数,清除生成的内存占用
    beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },
    methods: {
      //TODO增加中文提示
      // addQuillTitle () {
      //   const oToolBar = document.querySelector('.ql-toolbar'),
      //     aButton = oToolBar.querySelectorAll('button'),
      //     aSelect =  oToolBar.querySelectorAll('select');
      //   aButton.forEach((item) => {
      //     if(item.className === 'ql-script'){
      //       item.value === 'sub' ? item.title = '下标': item.title = '上标';
      //     }else if(item.className === 'ql-indent'){
      //       item.value === '+1' ? item.title ='向右缩进': item.title ='向左缩进';
      //     }else{
      //       item.title = this.titleConfig[item.classList[0]];
      //     }
      //   });
      //   aSelect.forEach((item) => {
      //     item.parentNode.title = this.titleConfig[item.classList[0]];
      //   });
      // },

      // onDynamic(value){
      //   if(this.args.dynamic) {
      //     this.setValue(value);
      //   }
      // },
      onEditorBlur({ quill, html, text }) {
        this.validate();
      },
      onEditorFocus(editor) {
        // console.log('editor focus!', editor)
      },
      onEditorReady(editor) {
        // editor.setText(this.args.html);
        this.args.content = this.args.html
      },
      // 设置异常状态显示
      setError(error, message = '') {
        this.isWrong = error;
        this.errorMessage = error ? message : '';
        var dom = this.$refs.myQuillEditor.$el.querySelector('.ql-container.ql-snow');
        if (dom) dom.style.border = error ? "1px solid red" : null;
        this.args.validate = error;
        return this;
      },

      // 设置校验逻辑,返回true/false
      validate() {
        let expResult = true;
        this.isRequired = false;

        if (this.args.required && (this.args.html == null || this.args.html == '')){
          expResult = false;
          this.isRequired = true;
        }
        this.setError(!expResult);
        return expResult;
      },

      // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
      getValue() {
        return this.args.html;
      },
      onEditorChange({ quill, html, text }) {
        if(this.args.readonly){
          this.args.html = this.args.html;
          return
        }
        this.args.html = html;
        if(quill.getLength() != 1){
          this.args.validate = true
        }else{
          this.args.validate = false
        }

        if(this.vChange){
          this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
        }
      },

      async triggerEvent(type){
        switch (type) {
          case 'valueChanged':
            if(this.vChange) {
              this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
            }
            break;
          default:
            if(this.vChange) {
              this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
            }
            break;
        }
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
        this.args.html = value;
        this.$nextTick(() => {
          this.args.content = value;
        })
        if(value == null){
          this.args.content = null
        }
        return this;
      },

      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        if (!this.$refs.main) return;
        let that = this;
        if (this.timer == null) {
          this.timer = setInterval(() => {
            if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
            // 改成你需要的样式
            var dom = that.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) {
              dom.style.height = that.arg_height + "px";
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
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;

        if (type == "create") {
          this.readOnly = false;
          delete this.args.editorOption.theme
          if(!this.args.editorOption.modules['imageResize']){
            Object.assign(this.args.editorOption.modules, {
              imageResize: {
                displayStyles: {
                  backgroundColor: 'black',
                  border: 'none',
                  color: 'white'
                }
              }
            });
          }
        }
        else if (type == "edit") {
          this.readOnly = false;
          delete this.args.editorOption.theme
          if(!this.args.editorOption.modules['imageResize']){
            Object.assign(this.args.editorOption.modules, {
              imageResize: {
                displayStyles: {
                  backgroundColor: 'black',
                  border: 'none',
                  color: 'white'
                }
              }
            });
          }
        }
        else if (type == "visit") {
          this.readOnly = 'disabled';
        }
        return this;
      },

      getFormName() {
        return this.args.name;
      },

      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        if(this.args.readonly){
          this.readOnly = 'disabled';
        }
        if(this.readOnly){
          Object.assign(this.args.editorOption, {
            theme: 'bubble',
          });
          if(this.args.editorOption.modules.imageResize){
            delete this.args.editorOption.modules['imageResize'];
          }
        }else{
          Object.assign(this.args.editorOption.modules, {
            imageResize: {
              displayStyles: {
                backgroundColor: 'black',
                border: 'none',
                color: 'white'
              }
            }
          });
        }
        delete this.args['dynamic'];
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
  };
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
  .quill-editor:not(.bubble) .ql-container, .quill-editor:not(.bubble) .ql-container .ql-editor{
    height: 300px;
    max-height: 300px;
  }
</style>
<style>
  .ql-editor { white-space: pre-wrap!important; }
  .ql-container {white-space: pre-wrap!important; }
  .dark .ql-snow .ql-fill,
  .dark .ql-snow .ql-stroke{
    stroke: #fff;
  }
  .dark .ql-snow .ql-picker,
  .dark .ql-snow .ql-editor{
    color: #fff
  }
  .dark .ql-editor.ql-blank::before{
    color: #ffffff
  }
  .dark .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options{
    background: #122035;
  }
  .readonlyCursor .ql-editor{
    cursor: not-allowed;
  }
  .readonlyCursor .ql-editor p{
    cursor: not-allowed;
  }
</style>
