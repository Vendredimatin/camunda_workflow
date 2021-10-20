<template>
  <!-- 输入框 -->
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <span v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block',
    'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
        <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
            <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
        </span>
    </span>
      <span :style="{'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
        'text-align': mainXAlign, 'color': args.main_fontColor}">
        <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
        <span :href="parsedHref" :style="{'font-size': args_fsize, 'color': args.txt_fontColor}"
              target="_blank">{{args.text}}</span>
        </span>
    </span></template>
    <template v-else>
      <span v-if="args.label" :style="{'width': '100%', 'display': 'inline-block',
    'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
        <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
            <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
        </span>
    </span>
      <span :style="{'height': arg_height, 'line-height': arg_height, 'width': '100%', 'display': 'inline-block',
        'text-align': mainXAlign, 'color': args.main_fontColor}">
        <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
        <span :href="parsedHref" :style="{'font-size': args_fsize, 'color': args.txt_fontColor}"
              target="_blank">{{args.text}}</span>
        </span>
    </span>
    </template>
    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
            :attributes="filter_attributes"
            :router="router"
            :route="route"
            :root="root"
            :query_oprs="query_oprs"
                     :dataTypes="dataTypes"
            :targetclass="itemValue.data.targetClass">
            <div slot="attribute">
                <p class="margin1">超链接地址</p>
                <Input class="margin1" type="text" v-model="args.href">
                <Select v-model="args.hrefPrefix" slot="prepend" style="width: 80px">
                    <Option value="http://">http://</Option>
                    <Option value="https://">https://</Option>
                </Select>
                </Input>

                <p class="margin1">显示文本</p>
                <Input class="margin1" type="text" v-model="args.text"></Input>
            </div>
            <div slot="layout">

            </div>
            <div slot="operation">
            </div>
        </EditBox>
    </span>
  </section>
  <section v-else :addinName="name" style="text-align: center">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe62d;</i>
            </div>
            <div class="form-addin-name">
                超链接
            </div>
        </span>
    </section>

</template>

<script>
  import EditBox from "./_EditBox.vue"
  import "@/styles/component/iconfont.css";
  const name = "HyperLink";
  export default {
    name: name,
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
        dataTypes: ["String"],


      actEdit: false,
      args: {
          label_fontColor: 'initial',
          txt_fontColor: 'initial',
          label_color: 'initial',
          main_fontColor: 'initial',
          main_color: 'initial',
          title: '超链接',
          id: null,
          label: "",
          name: "",
          hrefPrefix: 'http://',
          href: "",
          text: "",
          hided: false,

          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,

          targetDataType: null,

          _id: "0",
          _type: "attribute",
          height: 30,
          heightType: "px",
          width: 100,
          widthType: '%',
          col: true,
          cols: 3,
          lfsize:14,//标签文字大小
          lfsizeType:'px',//标签文字大小单位
          fsize: 14,//内容文字大小
          fsizeType: 'px',//内容文字大小单位
          structural_layout: 'horizontal'   //整体布局
        },
        underline: "false",

        // 查询数据语句
        queryData: {
          query: "", // 查询条件
          targetClass: "", // 目标类名
          formName: "", //
          uuid: ""
        },
        // 目标类对象列表
        targetClassObjects: [],
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
      };
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
        arg_name(val) {
            if (val in this.attrMap) {
                this.args.targetDataType = this.attrMap[val].valueType;
                if (this.relation) {
                    if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
                    if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
                    if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
                } else this.args.label = this.attrMap[val].displayName;
            } else this.args.targetDataType = null;
        },
      // end
    },
    computed: {
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
      },
      parsedHref() {
        return this.fullHref;
      },

      fullHref() {
        return this.args.hrefPrefix + this.args.href;
      },

      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      labelWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.label_widthByPx + 'px';
        }else{
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
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
    },
    methods: {
      // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
      getAllow() {
        return null;
      },

      getName() {
        return name;
      },
      // 设置基本属性
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
      getArgs() {
        return this.args;
      },
      // 获取表单项名
      getFormName() {
        return this.args.name;
      },
      setDisplayType(type) {
        this.t_preview = type == 0;
        return this;
      },
      // 获取插件的属性编辑框的dom元素
      getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox(args) {
        this.t_edit = true;
        return this.$refs.edit;
      },
      getDataType(args) {
        return this.dataTypes;
      },
      getInherit() {
        var res = {};
        let that = this;
        this.inherit.forEach(x => (res[x] = that.args[x]));
        return res;
      },
    }
  };

</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
}

p {
  margin: 5px;
  text-align: left;
}

.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}

</style>
