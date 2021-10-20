<template>
  <section v-if="t_preview" :addinName="name" dropTarget="0" ref="main" :style="{'width': colWidth}">
    <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
    'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
      <span
        :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
          <span v-if="args.required" style="color: red">*</span>
          <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
      </span>
    </span>
    <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
      'text-align': mainXAlign, 'color': args.main_fontColor}">
      <span
        :style="{'background-color': args.main_color, 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
        <div style="display: inline-block;width: calc(100% - 70px)">
          <Cascader
            class="i-input"
            :disabled="args.readonly"
            filterable
            transfer
            :style="{'font-size':args_fsize,'color':args.txt_fontColor,'text-align': mainXAlign}"
          ></Cascader>
        </div>
        <div style="display: inline-block;width: 70px;text-align:right">
          <Button type="primary" size="small" icon="ios-search" title="预览" style="margin: 3px; display: inline-block;"></Button>
<!--          <Button type="primary" size="small" icon="md-checkmark" title="绑定" style="display: inline-block;"></Button>-->
        </div>
      </span>
    </span>
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
        </div>
        <div slot="layout">
        </div>
        <div slot="operation">
        </div>
      </EditBox>
  </span>
  </section>
  <section v-else :addinName="name">
    <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe655;</i>
      </div>
      <Tooltip class="form-addin-name" content="时序点选器" style="width: 100%;" :transfer="true">时序点选</Tooltip>
    </span>
  </section>

</template>

<script>
import EditBox from "./_EditBox.vue"
import "@/styles/component/iconfont.css"

const name = "TimeSeriesSelect";

export default {
  name: name,

  // itemValue: 从表单建模/表单引擎传入的当前表单对象
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

  components: {
    EditBox
  },

  data() {
    return {
      times: 0,
      name: name,

      // 展示模式
      t_preview: true,
      t_edit: false,

      // 失去焦点 and 值变化
      isBlur: null,
      vChange: null,
      isHover: null,
      hoverAction: '',
      isFocus: null,

      // 支持的数据类型
      dataTypes: ['Timeseries'],

      // 编辑框

      actEdit: false,
      args: {
        label_fontColor: "initial", // 标签字体颜色
        label_color: "initial", // 标签字体颜色
        txt_fontColor: "initial",   // 内容字体颜色
        txt_bgColor: '#fff',        // 输入框背景颜色
        lfsize: 14,                 // 标签文字大小
        lfsizeType: 'px',           // 标签文字大小单位
        fsize: 14,                  // 内容文字大小
        fsizeType: 'px',            // 内容文字大小单位
        width: 100,
        widthType: '%',
        id: "",
        title: "时序点选器",
        label: "",
        name: "",
        required: false,
        readonly: false,
        hided: false,
        // label所需属性
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        _id: "0",
        _type: "attribute",
        height: 30,
        heightType: "px",
        col: true,
        cols: 3,
        // 属性插件所需属性
        targetDataType: null,
        // 弹窗所需属性
        modalQuery: {query: ''},
        // events: [],
        eventRange: [],

        // 事件操作所需配置
        // oprs: {
        //     "ValueChanged":{
        //         "opr_path": "",
        //         "opr_type": "",
        //     },
        // },

      },

      // 选择时间序列对话框flag
      showEditModal: false,
      // 输入过滤关键词
      searchKeyword: "",

      // 用于从VUEX中查询数据
      queryData: {
        query: {query: "",}, // 查询条件
        targetClass: "",    // 目标类名
        formName: "",   //
        uuid: ""
      },

      // 对齐方式,布局插件使用
      alignList: [
        {value: 0, name: "左上对齐"},
        {value: 1, name: "靠左对齐"},
        {value: 2, name: "左下对齐"},
        {value: 3, name: "顶部对齐"},
        {value: 4, name: "居中对齐"},
        {value: 5, name: "底部对齐"},
        {value: 6, name: "右上对齐"},
        {value: 7, name: "靠右对齐"},
        {value: 8, name: "右下对齐"}
      ],

      // 继承属性
      inherit: [],

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},
      allow: {},

      timer: null,
    }
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if(this.t_preview) {
      if (!this.$Message) this.$Message = this.Message;
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
  computed: {
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
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
    // 需要用到引用类属性列表时使用
    arg_name() {
      return this.args.name;
    },
    filter_attributes() {
      return this.attributes ? (this.relation ?
          ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
    },
  },
  watch: {

    arg_height(val) {
      this.setHeight();
      this.setInheritStyle();
    },

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
    'args.txt_bgColor'(val){
      this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
            item.style.backgroundColor = val;
          }): '';
    },
    'args.height'(val) {
      this.setHeight();
      this.setInheritStyle();
    },
    'args.enSelect'(val) {
      if(val) {
        let self = this;
        setTimeout(function() {
          self.setInheritStyle();
        }, 500);
      }
    },
  },
  mounted() {
    if(this.t_preview) {
      this.$nextTick(() => {
        if(this.$refs.main && this.$refs.main.querySelector(".ivu-input")){
          this.$refs.main.querySelector(".ivu-input").style.textAlign = this.mainXAlign;
        }
        // 初始化
        if (this.t_preview) {
          this.setHeight();
          this.setInheritStyle();
        }
      })
    }
  },

  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  methods: {
    setInheritStyle() {
      try {
        this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.height = 'inherit';
            item.style.color = 'inherit';
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.height = this.arg_height;
            item.style.lineHeight = this.arg_height;
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.height = this.arg_height;
            item.style.lineHeight = this.arg_height;
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.lineHeight = this.arg_height;
            item.style.height = this.arg_height;
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
            item.style.backgroundColor = this.args.txt_bgColor;
          }): '';

      } catch (e) {

      }
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
          var dom = that.$refs.main.querySelector(".ivu-input-wrapper input");
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

    getAllow() {
      return null;
    },

    // 获取可继承属性
    getInherit() {
      var res = {};
      let that = this;
      this.inherit.forEach(x => res[x] = that.args[x]);
      return res;
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("name" in args) this.args_name = this.args.name
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

    getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox(args) {
      if (!args) {
        this.t_edit = true;
        return this.$refs.edit;
      } else if (args == "col") {
        this.t_edit_col = true;
        return this.$refs.edit_col;
      } else if (args == "row") {
        this.t_edit_row = true;
        return this.$refs.edit_row;
      }
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

    async updateObjects() {
      console.log(this.queryData.targetClass);

      await this.handleQueryData(this.queryData); // vuex做好缓存准备
      let uidList = this.getEn(this.queryData.targetClass);
      console.log("!!", uidList);
      uidList.forEach(uid => {
        this.objectList.push(this.getClassObject(this.queryData.targetClass, uid));
      })
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
