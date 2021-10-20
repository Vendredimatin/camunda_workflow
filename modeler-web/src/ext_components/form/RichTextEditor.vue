<template>
  <!--
        建模时的预览前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section v-if="t_preview" :addinName="name" :style="{'height': arg_height, 'width': colWidth}" ref="main">
    <!--
            标签, 一般的属性插件都有,如文本框
            对于不需要的插件,可以删去,如附件控件,图片控件,也可以将label设为空
    -->
    <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
                'text-align': labelXAlign, 'vertical-align': labelYAlign,
                'background-color': args.label_color}">
                    <span v-if="args.required" style="color: red">*</span>
                    <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>

    <div class="editor-mask"
         :style="{'height': arg_editorHeight, 'width': '100%', 'padding':'5px !important','z-index': '7', 'position': 'absolute'}">

    </div>
    <quill-editor v-model="args.content"
                  ref="myQuillEditor"
                  :disabled="disabled"
                  readOnly="true"
                  v-if="myQuillEditorReload"
                  :options="args.editorOption"
                  :style="{'height': arg_editorHeight, 'max-height': arg_editorHeight, 'width': '100%', 'display': 'inline-block'}"
                  @blur="onEditorBlur($event)"
                  @focus="onEditorFocus($event)"
                  @ready="onEditorReady($event)"
                  @change="onEditorChange($event)">
    </quill-editor>
    <!--
            属性编辑框区域
            需要该插件获取attributes, router, route, root, query_oprs, itemValue的prop
            对于不需要设置目标属性的插件,可以将attributes去掉
            对于不需要设置事件的插件,可以将router, route, root, query_oprs去掉diff
    -->
    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
               :itemValue="itemValue"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :query_oprs="query_oprs"
               :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
        <div slot="attribute">
          <!--
                        属性选项放置区域
                        一般一个控件的prop都属于属性选项
          -->
          <p class="margin1">占位文本</p>
          <Input class="margin1" type="text" v-model="args.editorOption.placeholder" @on-change="placeholderChange"/>

        </div>

        <div slot="layout">
          <!--
                        样式选项放置区域
                        仅有涉及到高度,宽度,对齐等样式的选项放在这里
          -->

          <p class="margin1">编辑区高度</p>
          <Input class="margin1" number v-model="args.editorHeight">
              <Select v-model="args.editorHeightType" slot="append" style="width: 70px;">
                  <Option value="px">px</Option>
                  <Option value="vw">vw</Option>
                  <Option value="rem">rem</Option>
              </Select>
          </Input>
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
        <i class="iconfont">&#xe68c;</i>
      </div>
      <!-- 设置插件的中文名,名字长度小于等于3时使用 -->
      <!-- <div class="form-addin-name">富文本编辑器</div> -->
      <!-- 设置插件的中文名,名字长度大于3时使用 -->

      <Tooltip class="form-addin-name" content="富文本编辑器" style="width: 100%;" :transfer="true">富文本</Tooltip>
    </span>
  </section>
</template>

<script>

  import "@/styles/component/iconfont.css";
  import EditBox from "./_EditBox.vue";

  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'

  import { quillEditor } from 'vue-quill-editor';
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
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", 'Message', "relation"],
    data() {
      return {
        times: 0,
        name: name,

        t_preview: true,
        t_edit: false,

        disabled: false,
        // 属性配置项,按需设置

      actEdit: false,
      args: {
          // dynamic: false,
          name: "", // 目标属性
          label: "", // 标签名称
          id: "", // 控件代号,一般为必须
          height: 310, // 整体高度
          editorHeight: 200, // 编辑器高度
          heightType: "px", // 整体宽度的单位
          width: 100,
          widthType: '%',
          editorHeightType: 'px', // 编辑器高度单位
          label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
          label_fontColor: "initial", // 标签字体颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          // main_align: 4, // 主区域对齐方式,默认为4居中对齐
          required: false, // 是否必填
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
            }
          },
          content: "",
          hided: false,
          readonly: false,
        },
        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ["String", "Clob"],
        // 需要设置目标属性时使用
        attrMap: {},
        // 需要动态设置高度时使用
        timer: null,
        myQuillEditorReload: true,
      };
    },
    components: {
      EditBox,
      quillEditor
    },
    inject: [
      'setBasicArgs'
    ],
    created() {
      //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
      if (this.t_preview){
        let that = this;
        if (this.attributes) {
          if (this.relation) {
            this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
            this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
            this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
          } else {
            this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
          }
        }
      }
    },
    mounted() {
    },
    watch: {
      // 需要设置目标属性时使用,不用可删去
      arg_name(val) {
        if (val in this.attrMap) {
          this.args.targetDataType = this.attrMap[val].valueType;
          if (this.relation) {
            if (val.startsWith("left_"))
              this.args.label =
                (this.relation.leftRole != ""
                  ? this.relation.leftRole
                  : this.relation.leftClass) +
                "的" +
                this.attrMap[val].displayName;
            if (val.startsWith("right_"))
              this.args.label =
                (this.relation.rightRole != ""
                  ? this.relation.rightRole
                  : this.relation.rightClass) +
                "的" +
                this.attrMap[val].displayName;
            if (val.startsWith("relation_"))
              this.args.label = this.attrMap[val].displayName;
          } else this.args.label = this.attrMap[val].displayName;
          let name = val;
          if (this.relation) {
            if (name.startsWith("left_")) name = name.substring(5);
            else if (name.startsWith("right_")) name = name.substring(6);
            else if (name.startsWith("relation_")) name = name.substring(9);
          }
          let attr = this.store.state.DWF_form.Attributes[name];
          if (attr && attr.defaultValue) this.value = attr.defaultValue;
        } else this.args.targetDataType = null;
      }
    },
    computed: {
      args_fsize(){
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      // 需要设置目标属性时使用,不用可删去
      arg_name() {
        return this.args.name;
      },
      // 需要设置目标属性时使用,不用可删去
      filter_attributes() {
        return this.attributes
          ? this.relation
            ? [
              "relation",
              this.attributes[1].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[2].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[3].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              )
            ]
            : this.attributes.filter(
              x => this.dataTypes.indexOf(x.valueType) > -1
            )
          : [];
      },
      arg_height() {
        return this.args.height < 2 ? this.args.height * 150 + "px" : this.args.height + this.args.heightType;
      },
      arg_editorHeight(){
        return this.args.editorHeight < 2 ? this.args.editorHeight * 200 + "px" : this.args.editorHeight + this.args.editorHeightType;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
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
      mainNXAlign() {
        let x = parseInt(this.args.main_align / 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      mainNYAlign() {
        let x = parseInt(this.args.main_align % 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
    },

    methods: {

      onEditorBlur(editor) {
        // console.log('editor blur!', editor)
      },
      onEditorFocus(editor) {
        // console.log('editor focus!', editor)
      },
      onEditorReady(editor) {
        // console.log('editor ready!', editor)
      },
      onEditorChange({ quill, html, text }) {
        quill.setText('');
        quill.enable(false)
      },
      getAllow() {
        return null;
      },

      getArgs() {
        return this.args;
      },

      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        delete this.args['dynamic'];
        delete this.args['height'];
        if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      // 获取可继承属性
      getInherit() {
        var res = {};
        let that = this;
        this.inherit.forEach(x => res[x] = that.args[x]);
        return res;
      },

      getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },

      getName() {
        return name;
      },

      setDisplayType(type) {
        this.t_preview = type == 0;
        return this;
      },

      setHtml(html) {
        if (this.editor) {
          this.editor.html.set(html);
        }
      },

      placeholderChange(val){
        this.myQuillEditorReload = false;
        this.$nextTick(() => {
          this.myQuillEditorReload = true;
        })
        // console.log(this.$refs.myQuillEditor)
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
