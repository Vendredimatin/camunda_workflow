<template>
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}">
    <template v-if="args.align == 'Horizontal'">
      <span v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
          <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
      <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'line-height': arg_height,'display': 'inline-block', 'vertical-align': mainYAlign}">
          <label class="msize" :style="{'font-size': args_fsize, 'color': args.txt_fontColor}">{{ args.text }}</label>
          </span>
      </span>
    </template>
    <template v-else>
      <div v-if="args.label" :style="{'height': '50%', 'display': 'flex',
      'text-align': labelXAlign, 'align-items': labelYAlignFlex}">
        <div :style="{'width': '100%', 'padding-right': '10px'}">
          <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
        </div>
      </div>
      <div :style="{'height': '50%', 'width': '100%', 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'line-height': arg_height,'display': 'inline-block', 'vertical-align': mainYAlign}">
          <label class="msize" :style="{'font-size': args_fsize, 'color': args.txt_fontColor}">{{ args.text }}</label>
          </span>
      </div>
    </template>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
        <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args" :attributes="filter_attributes"
                 :root="root"
                 :itemValue="itemValue"
                 :dataTypes="dataTypes"
                 :targetclass="itemValue.data.targetClass">
            <div slot="attribute">
              <p class="margin1">标签文本</p>
              <Input class="margin1" v-model="args.text" placeholder="Enter something..." style="width: auto"></Input>
              <p class="margin1" v-show="isTime">标签格式</p>
              <Input class="margin1" v-model="args.formatLabel" v-show="isTime" placeholder="Y-M-D h:m:s" style="width: auto"></Input>
            </div>
            <div slot="layout">
              <p class="margin1">布局</p>
              <Select class="margin1" v-model="args.align">
                <Option value="Horizontal">水平</Option>
                <Option value="Vertical">竖直</Option>
              </Select>
            </div>
            <div slot="operation">
            </div>
        </EditBox>
    </span>
  </section>
  <section v-else :addinName="name" style="text-align: center">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe619;</i>
            </div>
            <div class="form-addin-name">
                标签
            </div>
        </span>
    </section>
</template>

<script>
  import EditBox from "./_EditBox.vue"
  import "@/styles/component/iconfont.css"
  const name = "Label";
  export default {
    // 插件名
    name: name,
    // 属性值传入:
    //  itemValue: 表单对应的Json结构
    //  attributes: 实体类属性
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", 'Message', "relation"],
    components: {
        EditBox
    },
    data() {
      return {
        // 插件名
        name: name,

        // 展示模式
        t_preview: true,
        t_edit: false,

        // 图标地址
        icon_url: "",
        dataTypes: ["String", "UUID", "Clob", "Boolean", "Date", "TimeStamp", "Integer", "Long", "Double", "LocalFile"],
        isTime: false,
        // 编辑框

      actEdit: false,
      args: {
          dynamic: false,
          label_fontColor: 'initial',//标签文字颜色
          txt_fontColor: 'initial',//内容文字颜色
          label_color: 'initial',
          main_fontColor: 'initial',
          main_color: 'initial',
          title: '标签',
          id: null,
          align: "Horizontal",
          text: "提示信息...",
          label: "",
          name: "",
          hided: false,
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          // 属性插件所需属性
          targetDataType: null,
          formatLabel: '',

          // 布局插件所需属性
          _type: "attribute",
          height: 30,
          heightType: "px",
          width: 100,
          widthType: '%',
          col: false,
          cols: 3,
          lfsize:14,//标签文字大小
          lfsizeType:'px',//标签文字大小单位
          fsize: 14,//内容文字大小
          fsizeType: 'px',//内容文字大小单位
          events: [],
          eventRange: ['点击', "鼠标悬停"]
        },

        queryData: {
          query: "", // 查询条件
          targetClass: "", // 目标类名
          formName: "", //
          uuid: ""
        },
        targetClassObjects: [],

        // 对齐方式,布局插件使用
        alignList: [{
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

        // 继承属性
        inherit: [],

        // 表单项名
        args_name: "",

        // 属性map
        attrMap: {}
      }
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
      //this.$refs.main.querySelector(".i-input .ivu-input").style.fontsize = 'inherit';
      //this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
    },
    watch: {
      // 需要用到实体类属性列表时使用
        arg_name(val) {

          if (val in this.attrMap) {
              this.args.targetDataType = this.attrMap[val].valueType;

              if(this.args.targetDataType == "Date" || this.args.targetDataType == "TimeStamp" || this.args.targetDataType == "Time") {
                this.isTime = true;
              } else {
                this.isTime = false;
              }

              if (this.relation) {
                  if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
                  if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
                  if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
              } else this.args.label = this.attrMap[val].displayName;
              let name = val;
              if (this.relation) {
                  if (name.startsWith("left_")) name = name.substring(5);
                  else if (name.startsWith("right_")) name = name.substring(6);
                  else if (name.startsWith("relation_")) name = name.substring(9);
              }
              let attr = this.store.state.DWF_form.Attributes[name];
              if (attr && attr.defaultValue) this.args.text = attr.defaultValue;
          } else this.args.targetDataType = null;
        },
    },
    computed: {
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      labelWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return this.args.label_widthByPx + 'px';
        }else{
          return parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
      mainWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return !this.args.label || this.args.label == "" ? "100%": `calc(100% - ${this.args.label_widthByPx}px)`;
        }else{
          return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
      },
      // 需要用到实体类属性列表时使用
      arg_name() {
        return this.args.name;
      },
        filter_attributes() {
            return this.attributes ? ( this.relation ?
                [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
        },
      // end

      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
    },
    methods: {

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

      setIcon(id) {
        this.icon_url = id;
        return this;
      },

      getDataType(args) {
        return ['String'];
      },
    }
  }

</script>

<style scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
section {
    display: inline-block;
    width: 100%
}
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
</style>
