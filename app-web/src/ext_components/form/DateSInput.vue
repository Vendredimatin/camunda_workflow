<template>

    <section :addinName="name" ref="main" :style="{'width': colWidth}">
          <label v-if="datePicker.label" class="ori-color self-color" :style="{
                      'width': labelWidth,
                      'display': 'inline-block',
                      'text-align': labelXAlign,
                      'vertical-align': labelYAlign}">{{datePicker.label}}
          </label>
          <DatePicker class="i-input self-color"  type="datetimerange" split-panels v-model="value" :name="datePicker.name" :format="datePicker.format" :placeholder="datePicker.placeholder"
            :confirm="datePicker.confirm" :disabled="datePicker.disabled" :readonly="datePicker.readonly" :multiple="datePicker.multiple"
            :transfer="true"
            :style="{
                            'height': arg_height,
                            'width': mainWidth,
                            'color': 'initial',
                            'display': 'inline-block',
                            'background-color': main_color,
                            'text-align': mainXAlign,
                            'vertical-align': mainYAlign}">
          </DatePicker>
    </section>

</template>

<script>
import "@/styles/component/iconfont.css";
const name = "DateSInput";
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
  props: ["itemValue", "attributes", "relations", "relation_classes"],
  data() {
    return {
	timer: null,
	times: 0,
      name: name,
      // 展示模式
      t_preview: false,
      t_show: false,
      t_icon: true,
      t_edit: false,

      // 支持的数据类型
      // dataTypes: ["String", "Integer", "Long", "Date", "TimeStamp"],
      dataTypes: ["Date", "TimeStamp"],
      value: null,
      // 编辑框
      datePicker: {
        type: "date",
        format: "yyyy-MM-dd HH:mm:ss",
        placeholder: "",
        confirm: true,
        disabled: false,
        readonly: false,
        multiple: false,

        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,

        label: "",
        name: "",
        targetDataType: "_Date",
        relation: "",
        relation_attr: "",
        relation_class: "",
        relation_class_attr: "",
        height: 30,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        cols: 3,
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
      relationAttrMap: {},
      relationClassAttrMap: {},

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
      ]
    };
  },
  created() {
    let that = this;
    if (this.attributes)
      this.attributes.forEach(x => (that.attrMap[x.attributeName] = x));
    if (this.relations)
      this.relations.forEach(x => {
        that.relationAttrMap[x.basic.className] = x.attributes;
        x.attributes.forEach(y => (that.attrMap[y.attributeName] = y));
      });
    if (this.relation_classes)
      this.relation_classes.forEach(x => {
        that.relationClassAttrMap[x.basic.className] = x.attributes;
        x.attributes.forEach(y => (that.attrMap[y.attributeName] = y));
      });
    // this.value = new Date();
  },
  mounted() {
    this.$nextTick(() => {
      this.setInheritStyle();
    })
    this.setHeight();
  },
  watch: {
    value(val) {
      console.log(val);
    },
    arg_height(val) {
      this.setHeight();
    },
    // 需要用到实体类属性列表时使用
    args_name(val) {
      if (val != "-1") {
        this.datePicker.name = val;
        this.datePicker.relation = "";
        this.datePicker.relation_class = "";
      } else {
        this.datePicker.name = "";
      }
    },
    arg_name(val) {
      if (!this.attributes) return;
      if (val in this.attrMap) {
        this.datePicker.label = this.attrMap[val].displayName;
        this.datePicker.targetDataType = this.attrMap[val].valueType;
      } else if (
        this.arg_relation_attr == "" &&
        this.arg_relation_class_attr == ""
      ) {
        this.datePicker.targetDataType = null;
      }
      // %s
    },
    attributes(val) {
      this.attrMap = {};
      if (val) val.forEach(x => (this.attrMap[x.attributeName] = x));
    },
    // end
    // 需要用到关联类属性列表时使用
    arg_relation(val) {
      if (val == "") return;
      if (!this.relations) return;
      this.datePicker.relation_attr = "";
      this.args_name = "-1";
      this.datePicker.name = "";
      this.datePicker.relation_class = "";
    },
    arg_relation_attr(val) {
      if (!this.relations) return;
      if (val != "") {
        this.datePicker.label = this.attrMap[val].displayName;
        this.datePicker.targetDataType = this.attrMap[val].valueType;
      }
    },
    // end
    // 需要用到关联实体类属性列表时使用
    arg_relation_class(val) {
      if (val == "") return;
      if (!this.relation_classes) return;
      this.datePicker.relation_class_attr = "";
      this.datePicker.relation = "";
      this.args_name = "-1";
      this.datePicker.name = "";
    },
    arg_relation_class_attr(val) {
      if (!this.relation_classes) return;
      if (val != "") {
        this.datePicker.label = this.attrMap[val].displayName;
        this.datePicker.targetDataType = this.attrMap[val].valueType;
      }
    }
  },
  computed: {
    arg_height() {
      return this.datePicker.height < 2 && this.datePicker.heightType == 'px' ? this.datePicker.height * 30 + "px" : this.datePicker.height + this.datePicker.heightType;
    },
    colWidth() {
      return this.datePicker.width + this.datePicker.widthType;
    },
    labelWidth() {
      return (
        parseInt(
          (100 * this.datePicker.label_width) /
            (this.datePicker.label_width + this.datePicker.main_width)
        ) + "%"
      );
    },
    mainWidth() {
      return !this.datePicker.label || this.datePicker.label == ""
        ? "100%"
        : parseInt(
            (100 * this.datePicker.main_width) /
              (this.datePicker.label_width + this.datePicker.main_width)
          ) + "%";
    },
    labelXAlign() {
      let x = parseInt(this.datePicker.label_align / 3);
      if (x == 0) return "left";
      else if (x == 1) return "center";
      else return "right";
    },
    labelYAlign() {
      let x = this.datePicker.label_align % 3;
      if (x == 0) return "top";
      else if (x == 1) return "middle";
      else return "bottom";
    },
    mainXAlign() {
      let x = parseInt(this.datePicker.main_align / 3);
      if (x == 0) return "left";
      else if (x == 1) return "center";
      else return "right";
    },
    mainYAlign() {
      let x = this.datePicker.main_align % 3;
      if (x == 0) return "top";
      else if (x == 1) return "middle";
      else return "bottom";
    },
    // 需要用到实体类属性列表时使用
    arg_name() {
      return this.datePicker.name;
    },
    filter_attributes() {
      return this.attributes
        ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)
        : [];
    },
    // end
    // 需要用到关联类属性列表时使用
    filter_relations() {
      return this.relations ? this.relations.map(x => x.basic) : [];
    },
    filter_relation_attr() {
      return this.datePicker.relation in this.relationAttrMap
        ? this.relationAttrMap[this.datePicker.relation]
        : [];
    },
    arg_relation() {
      return this.datePicker.relation;
    },
    arg_relation_attr() {
      return this.datePicker.relation_attr;
    },
    // end
    // 需要用到关联的实体类属性列表时使用
    filter_relation_class() {
      return this.relation_classes
        ? this.relation_classes.map(x => x.basic)
        : [];
    },
    filter_relation_class_attr() {
      return this.datePicker.relation_class in this.relationClassAttrMap
        ? this.relationClassAttrMap[this.datePicker.relation_class]
        : [];
    },
    arg_relation_class() {
      return this.datePicker.relation_class;
    },
    arg_relation_class_attr() {
      return this.datePicker.relation_class_attr;
    },
    main_color(){
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu') ? 'transparent' : '#fff'
    }
    // end
  },
  methods: {
    setHeight() {
				// if (!this.$refs.main) return;
				// let that = this;
				// this.timer = setInterval(() => {
				// 	if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
				// 	// 改成你需要的样式
				// 	var dom = that.$refs.main.querySelector(".i-input .ivu-input");
				// 	if (dom) {
				// 		dom.style.height = that.arg_height + "px";
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// 	that.times += 30;
				// 	if (that.times > 60 * 1000) {
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// }, 30);
			},

    setInheritStyle() {

      this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
        ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
          item.style.width = '100%';
          item.parentNode.style.width = '100%';
        })
        : '';
      this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
        ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
          item.style.width = 'inherit';
        })
        : '';
      // 字体 ／ 颜色 默认继承
      this.$refs.main.querySelector(".ivu-date-picker-rel").style.color = 'inherit';
      this.$refs.main.querySelector(".ivu-date-picker-rel").style.height = 'inherit';
      this.$refs.main.querySelector(".ivu-input-wrapper").style.color = 'inherit';
      this.$refs.main.querySelector(".ivu-input-wrapper").style.height = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
      this.$refs.main.querySelector(".ivu-date-picker-rel").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".ivu-input-wrapper").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.backgroundColor = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.height = 'inherit';
      this.$refs.main.querySelector(".ivu-input-icon").style.lineHeight = this.arg_height;

    },

    getValue() {
      var date = this.value;
      if (!this.value) return null;
      if (date[0] == "" && date[1] == "") return null;
      if (this.datePicker.targetDataType == "_Date") {
        return [date[0].format("yyyy-MM-dd hh:mm:ss.S"), date[1].format("yyyy-MM-dd hh:mm:ss.S")];
      } else {
        return [date[0].getTime(), date[1].getTime()];
      }
    },
    setValue(items) {
      if (items == "" || items == null) { this.value = null; return this; }
      try {
        var value = null;
        if (typeof items == "object") {
          if (items && items.length > 0) value = items[0][this.datePicker.name];
        } else value = items;
        let values = value.replace(/，/ig,',').split(',');
        if (values.length == 1) {
          let value1 = new Date(values[0]);
          let value2 = value1;
          this.value = [value1, value2];
        } else {
          let value1 = new Date(values[0]);
          let value2 = new Date(values[1]);
          this.value = [value1, value2];
        }
      } catch (e) {
        this.value = null;
        console.log("setValue error", e);
      }
      return this;
    },
    getAllow() {
      return null;
    },
    // 获取编辑框内容
    getArgs() {
      return this.datePicker;
    },
    setArgs(args) {
      for (var i in args) {
        this.datePicker[i] = args[i];
      }

      return this;
    },
    // 获取表单项名
    getFormName() {
      return this.datePicker.name;
    },
    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },
    getName() {
      return name;
    },
    setDisplayType(type) {
      this.t_preview = false;
      this.t_show = false;
      this.t_icon = false;
      if (type == 0) this.t_preview = true;
      else if (type == 1) this.t_show = true;
      else if (type == 2) this.t_icon = true;
      return this;
    },
    getDataType(args) {
      return this.dataTypes;
    },

    // 获取可继承属性
    getInherit() {
      var res = {};
      let that = this;
      this.inherit.forEach(x => (res[x] = that.datePicker[x]));
      return res;
    }
  }
};
</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
}
.ori-color {
  color: initial;
}
</style>
