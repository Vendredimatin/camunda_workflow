<template>
  <!--
        建模时的预览前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
    <section :style="{'display': args.structural_layout === 'horizontal' ? 'flex' : 'block', 'align-items': labelYAlignFlex}">
      <template v-if="args.structural_layout === 'horizontal'">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'padding-right': '10px'}">
          <span  :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label class="ori-color self-color" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
        <span :style="{'min-height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor}">
        <Row type="flex" justify="start">
          <Col :span="computedCol" v-for="item in col_count">
            <span class="labelStyle" :style="{'width': '20%'}"><label class="ori-color self-color" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">key</label></span>
            <span class="labelStyle" :style="{'width': '80%'}">
              <Input
                class="i-input"
                value="value"
                :readonly="args.readonly"

                :style="{'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
              ></Input>
            </span>
          </Col>
        </Row>
      </span>
      </template>
      <template v-else>
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
      'text-align': labelXAlign, 'padding-right': '10px'}">
          <span  :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label class="ori-color self-color" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
        <span :style="{'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor}">
        <Row type="flex" justify="start">
          <Col :span="computedCol" v-for="item in col_count">
            <span class="labelStyle" :style="{'width': '20%'}"><label class="ori-color self-color" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">key</label></span>
            <span class="labelStyle" :style="{'width': '80%'}">
              <Input
                class="i-input"
                value="value"
                :readonly="args.readonly"

                :style="{'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
              ></Input>
            </span>
          </Col>
        </Row>
      </span>
      </template>
    </section>
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
          <p>取值模板</p>
          <Input v-model="args.dataTemplate" type="textarea" placeholder="输入取值模板"></Input>
          <p class="margin1">存储格式</p>
          <Select class="margin1" v-model="args.storageFormat">
            <Option value="json">JSON数组</Option>
<!--            <Option value="xml">XML</Option>-->
<!--            <Option value="yaml">YAML</Option>-->
          </Select>
          <p class="margin1">布局</p>
          <Cascader v-model="args.layout" :data="args.layoutData" trigger="hover" @on-change="handleChange"></Cascader>
        </div>

        <div slot="layout">

        </div>
        <div slot="operation">

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
                <i class="iconfont">&#xe699;</i>
      </div>
      <Tooltip class="form-addin-name" content="动态参数框" style="width: 100%;" :transfer="true">动态参数</Tooltip>
    </span>
  </section>
</template>

<script>
  import "@/styles/component/iconfont.css";
  import EditBox from "./_EditBox.vue";

  // 设置插件英文名, 该name需要与插件文件名一致
  const name = "DynamicParameterFrame";

  export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" ,
      "itemValue",
      "attributes",
      "query_oprs",
      "route",
      "router",
      "root",
      "store",
      "Message",
      "relation"
    ],
    data() {
      return {
        times: 0,
        name: name,
        isRelation: false,
        t_preview: true,
        t_edit: false,
        actEdit: false,
        col_count: [1, 1],
        // 属性配置项,按需设置
        args: {
          dynamic: false,
          targetClass: "",    // 目标类
          name: "",           // 目标属性
          label: "", // 标签名称
          id: "", // 控件代号,一般为必须
          label_fontColor: 'initial',       // 标签文字颜色
          txt_fontColor: 'initial',         // 内容文字颜色
          lfsize: 14,                       // 标签文字大小
          lfsizeType: 'px',                 // 标签文字大小单位
          fsize: 14,                        // 内容文字大小
          fsizeType: 'px',                  // 内容文字大小单位
          txt_bgColor: '#fff',        // 输入框背景颜色
          height: 30,                  // 整体高度=
          heightType: "px",                  // 整体高度=
          width: 100,
          widthType: '%',
          main_fontType: "", // 主区域字体
          main_fontSize: 14, // 主区域字号
          main_fontColor: "initial", // 主区域字体颜色
          main_color: "initial", // 主区域背景颜色
          align: "Vertical", // 标签与主区域的排列方式
          back_picture: "",
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          // 以下为不在属性编辑框中设置,但默认要有的配置项
          title: "动态参数框", // 插件中文名,需要填入默认值
          col: true, // 是否不占满全部
          cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null, // 目标数据类型
          events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: ["值变化"], // 支持的事件列表,元素为事件中文名

          //动态参数
          dataTemplate:'',
          formValue: {
            formModel: {
              composeValue: []
            },
            formRules: {},
            originValue: [],
            currentValue: [],
          },
          storageFormat: 'json',
          layoutType: 'vertical',
          layout: ['vertical'],
          layoutData: [{
            value: 'vertical',
            label: '垂直布局'
          }, {
            value: 'table',
            label: '表格布局',
            children: [
              {
                value: '2',
                label: '两列'
              },
              {
                value: '3',
                label: '三列'
              },
              {
                value: '4',
                label: '四列'
              }
            ],
          }],
          hided: false,
          required: false,
          readonly: false,
          structural_layout: 'horizontal'   //整体布局
        },
        attributesList: [],
        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ["String", "Json"],
        // 需要设置目标属性时使用
        attrMap: {},
        // 需要动态设置高度时使用
        timer: null,
        // 表单项名
        args_name: "",

      };
    },
    components: {
      EditBox
    },
    inject: [
      'setBasicArgs'
    ],
    created() {
      //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
      if (this.t_preview) {
        let that = this;
        if (this.attributes && this.attributes.length == 4 && this.attributes[0] == "relation") this.isRelation = true;
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
      if (this.t_preview) {
        this.args.targetClass = this.itemValue.data.targetClass;
        setTimeout( () => {this.setInheritStyle();}, 20);
      }
    },
    watch: {
      args_name(val) {
          if (val != "-1") {
              this.args.name = val;
          } else {
              // // // // this.args.name = "";
          }
      },
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
      },
      'args.layoutType'(val){
        switch (val) {
          case 'vertical':
            this.col_count = [1, 1];
            setTimeout( () => {this.setInheritStyle();}, 20);
            return 24;
            break;
          case 'table2':
            this.col_count = [1, 1];
            setTimeout( () => {this.setInheritStyle();}, 20);
            return 12;
            break;
          case 'table3':
            this.col_count = [1, 1, 1];
            setTimeout( () => {this.setInheritStyle();}, 20);
            return 8;
            break;
          case 'table4':
            this.col_count = [1, 1, 1, 1];
            setTimeout( () => {this.setInheritStyle();}, 20);
            return 6;
            break;
          default:
            this.col_count = [1, 1];
            setTimeout( () => {this.setInheritStyle();}, 20);
            return 24;
            break;
        }
      }
    },
    computed: {
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
        return this.args.height < 2 ? this.args.height * 70 + "px" : this.args.height + this.args.heightType;
      },

      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
      },

      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },

      contentWidth() {
        return this.args.useIcon
          ? '80%'
          : '100%'
      },
      //如果上下格式宽都为100%
      labelWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.label_widthByPx + 'px';
        }else{
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
      //如果上下格式宽都为100%
      mainWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : `calc(100% - ${this.args.label_widthByPx}px)`;
        }else{
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
        }
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
      labelYAlignFlex(){
        let x = this.args.label_align % 3;
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      // mainXAlign() {
      //   let x = parseInt(this.args.main_align / 3);
      //   if (x == 0) return "left";
      //   else if (x == 1) return "center";
      //   else return "right";
      // },
      // mainYAlign() {
      //   let x = this.args.main_align % 3;
      //   if (x == 0) return "top";
      //   else if (x == 1) return "middle";
      //   else return "bottom";
      // },
      // mainNXAlign() {
      //   let x = parseInt(this.args.main_align / 3);
      //   if (x == 0) return "flex-start";
      //   else if (x == 1) return "center";
      //   else return "flex-end";
      // },
      // mainNYAlign() {
      //   let x = parseInt(this.args.main_align % 3);
      //   if (x == 0) return "flex-start";
      //   else if (x == 1) return "center";
      //   else return "flex-end";
      // },

      arg_class() {
        return this.args.targetClass;
      },

      computedCol(){
        switch (this.args.layoutType) {
          case 'vertical':
            return 24;
            break;
          case 'table2':
            return 12;
            break;
          case 'table3':
            return 8;
            break;
          case 'table4':
            return 6;
            break;
          default:
            return 24;
            break;
        }
      }
    },

    methods: {
      setInheritStyle(){
        try {
          this.$refs.main.querySelectorAll('.i-input .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-input').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
              item.style.height = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-input-inner-container') && this.$refs.main.querySelectorAll('.i-input .ivu-input-inner-container').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-input-inner-container').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
            : '';

        } catch (e) {

        }
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
        if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
        if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
        delete this.args["basic_height"];
        // delete this.args["txt_bgColor"];
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

      handleChange(value, selectedData){
        value.length > 0 ? value.length > 1
          ? this.args.layoutType = `${value[0]}${value[1]}`
          : this.args.layoutType = value[0]
          : this.args.layoutType = 'vertical'
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
  .labelStyle{
    display: inline-block; text-align: center; vertical-align: middle; color: initial;
  }
</style>
<style>
  textarea::-webkit-scrollbar{
    width: initial;
  }
</style>
