<template>

    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': colWidth, 'align-items': labelNYAlign}">
      <section :style="{'display': args.structural_layout === 'horizontal' ? 'flex' : 'block' }">
        <template v-if="args.structural_layout === 'horizontal'">
        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block',}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
          <span :style="{'width': mainWidth, 'display': 'inline-block', 'color': args.main_fontColor}">
          <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block'}">
              <Table border :columns="table_columns" :data="data6"></Table>
              <div :style="{'text-align': 'right'}">
                <Button v-on:click.stop="function(){}" ghost icon="ios-cloud-upload-outline" type="success">添加新文件</Button>
              </div>
          </span>
        </span>
        </template>
        <template v-else>
        <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block',}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
          <span :style="{'width': '100%', 'display': 'inline-block', 'color': args.main_fontColor}">
          <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block'}">
              <Table border :columns="table_columns" :data="data6"></Table>
              <div :style="{'text-align': 'right'}">
                <Button v-on:click.stop="function(){}" ghost icon="ios-cloud-upload-outline" type="success">添加新文件</Button>
              </div>
          </span>
        </span>
        </template>
      </section>
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
                <!--<p class="margin1">日期格式</p>-->
                <!--<Select class="margin1" v-model="args.format" filterable>-->
                    <!--<Option v-for="item in formatList" :value="item.value" :key="item.value">{{item.name}}</Option>-->
                <!--</Select>-->
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
                <i class="iconfont">&#xe6c4;</i>
              </div>
              <div class="form-addin-name">
                  多文件
              </div>
          </span>
    </section>

</template>

<script>
import EditBox from "./_EditBox.vue";
import "@/styles/component/iconfont.css";
const name = "MultiFilesList";
export default {
	beforeDestroy() {
		if (this.timer) { clearInterval(this.timer); this.timer = null; };
	},
  name: name,
  // 属性值传入:
  //  itemValue: 表单对应的Json结构
  //  attributes: 实体类属性
  //  relations:  关联类,带有属性列表
  //  relation_classes:   被关联的实体类,带有属性列表
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],
  components: {
    EditBox
  },
  data() {
    return {
      timer: null,
      times: 0,
      name: name,
      // 展示模式
      t_preview: true,
      t_edit: false,
      actEdit: false,

      // 支持的数据类型
      // dataTypes: ["String", "Integer", "Long", "Date", "TimeStamp"],
      dataTypes: ["String", "Clob", "Json"],
      value: null,
      // 编辑框
      args: {
        title: '多文件上传',
        label_fontColor: 'initial',       // 标签文字颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单位
        label_color: "initial",
        main_fontColor: "initial",
        main_color: "initial",
        id: null,
        confirm: true,
        disabled: false,
        readonly: false,
        required: false,
        multiple: false,
        hided: false,

        label_width: 2,
        main_width: 3,
        label_align: 4,

        label: "",
        name: "",
        targetDataType: "_Date",
        // height: 30,
        // heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        cols: 3,
        structural_layout: 'horizontal'   //整体布局
      },

      alignList: [
          {value: 1, name: "靠左对齐"},
          {value: 4, name: "居中对齐"},
          {value: 7, name: "靠右对齐"},
          {value: 0, name: "左上对齐"},
          {value: 2, name: "左下对齐"},
          {value: 3, name: "顶部对齐"},
          {value: 5, name: "底部对齐"},
          {value: 6, name: "右上对齐"},
          {value: 8, name: "右下对齐"}
      ],

      // 继承属性
      inherit: [],

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},

      formatList: [
        {
          value: "yyyy-MM-dd",
          name: "年月日"
        },
        {
          value: "yyyy-MM-dd HH:mm:ss",
          name: "年月日时分秒"
        },
        {
          value: "yyyy",
          name: "年"
        },
        {
          value: "yyyy-MM",
          name: "年月"
        },
        {
          value: "HH:mm:ss",
          name: "时分秒",
        },
        {
          value: "HH:mm",
          name: "时分",
        }
      ],

      value: null,

      table_columns: [
        {
          title: '文件名',
          key: 'name',
          width: 400,
          ellipsis: true,
          tooltip: true,
          // render: (h, params) => {
          //   return h('div', [
          //     h('Icon', {
          //       props: {
          //         type: 'person'
          //       }
          //     }),
          //     h('strong', params.row.name)
          //   ]);
          // }
        },
        {
          title: '大小',
          key: 'size',
          // width: 100
        },
        {
          title: '操作',
          key: 'action',
          // width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                  }
                }
              }, '下载'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      data6: [
        {
          name: 'John Brown',
          size: 18,
        },
        {
          name: 'Jim Green',
          size: 24,
        },
        {
          name: 'Joe Black',
          size: 30,
        },
        {
          name: 'Jon Snow',
          size: 26,
        }
      ]
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
      this.value = new Date();
    }
  },
  mounted() {

    if (this.t_preview) {
      try {

        // 字体 ／ 颜色 默认继承
        this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.height = 'inherit';
        this.$refs.main.querySelector(".ivu-input-number-input").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".ivu-input-number-input").style.height = 'inherit';
        this.$refs.main.querySelector(".ivu-input-number-input").style.color = 'inherit';
        this.$refs.main.querySelector(".ivu-input-number-input").style.backgroundColor = 'inherit';
        this.$refs.main.querySelector(".ivu-input-number-handler").style.height = '50%';

      } catch (error) {
        console.log(error)
      }
    }

  },
  watch: {
    // arg_height(val) {
    //   this.$refs.main.querySelector(".ivu-input-icon").style.lineHeight = this.arg_height;
    //   this.setHeight();
    // },
    // 需要用到实体类属性列表时使用
        arg_name(val) {
            if (val in this.attrMap) {
                this.args.targetDataType = this.attrMap[val].valueType;
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
                if (attr && attr.defaultValue) this.value = attr.defaultValue;
                if (this.value == "now()") this.value = new Date();
            } else this.args.targetDataType = null;
        },
    attributes(val) {
      this.attrMap = {};
      if (val) val.forEach(x => (this.attrMap[x.attributeName] = x));
    }
  },
  computed: {
    // arg_height() {
    //   return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    // },
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
    labelNYAlign(){
      let x = parseInt(this.args.label_align % 3);
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
    },
    // 文本内容字体大小
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + ' !important';
    },
    // 标签文本内容字体大小
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + ' !important';
    },
    // 需要用到实体类属性列表时使用
    arg_name() {
      return this.args.name;
    },
    filter_attributes() {
      return this.attributes ? (this.relation ?
          ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
        // let _attributes = this.attributes ? ( this.relation ?
        //     [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
        //     this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
        //     this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
        // if(this.relation) {

        //   let concatAttr = _attributes[1].concat(_attributes[2], _attributes[3]);
        //   let finalAttr = concatAttr.filter(x => x.valueType === 'Json' || (x.valueType !== 'Json' && x.valueLength === 0));
        //   console.log(_attributes[0].concat(finalAttr));
        //   return _attributes[0].concat(finalAttr);

        // } else {
        //   return _attributes.filter(x => x.valueType === 'Json' || (x.valueType !== 'Json' && x.valueLength === 0))
        // }
    },

  },
  methods: {
    setHeight() {
			},

    getAllow() {
      return null;
    },
    // 获取编辑框内容
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
    getDataType(args) {
      return this.dataTypes;
    },

    // 获取可继承属性
    getInherit() {
      var res = {};
      let that = this;
      this.inherit.forEach(x => (res[x] = that.args[x]));
      return res;
    },

    show (index) {
      this.$Modal.info({
        title: 'User Info',
        content: `Name：${this.data6[index].name}<br>Age：${this.data6[index].age}<br>Address：${this.data6[index].address}`
      })
    },
    remove (index) {
      this.data6.splice(index, 1);
    }
  }
};
</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
}

.ivu-input {
  height: 30px !important;
}
</style>
