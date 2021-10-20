<template>

    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': colWidth}">
        <label v-if="datePicker.label" :style="{
            'width': labelWidth,
            'display': 'inline-block',
            'text-align': labelXAlign,
            'color': 'initial',
            'vertical-align': labelYAlign}">{{datePicker.label}}    </label>
        <DatePicker
                type="datetimerange"
                split-panels
                v-model="value"
                :name="datePicker.name"
                :format="datePicker.format"
                :placeholder="datePicker.placeholder"
                :confirm="datePicker.confirm"
                :disabled="datePicker.disabled"
                :readonly="datePicker.readonly"
                :multiple="datePicker.multiple"
                :transfer="true"
                :style="{
                  'height': arg_height,
                  'width': mainWidth,
                  'display': 'inline-block',
                  'text-align': mainXAlign,
                  'vertical-align': mainYAlign}"
                >
        </DatePicker>
        <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <p>日期范围选择框</p>
            <Form :model="datePicker" :label-width="80">
                  <p>表单项标签</p>
                    <Input v-model="datePicker.label" style="width: auto"></Input>
                  <p>表单项名</p>
                    <Select v-model="args_name" filterable>
                        <Option v-for="item in filter_attributes" :key="item.id" :value="item.attributeName">{{ item.displayName }}</Option>
                        <Option value="-1">自定义</Option>
                        <Option value="">无</Option>
                    </Select>
                    <Input v-show="args_name == '-1'" v-model="datePicker.name" placeholder="自定义输入表单项名" />

                <p>关联类</p>
                <Select v-model="datePicker.relation" filterable>
                  <Option v-for="item in filter_relations" :key="item.id" :value="item.className">{{ item.className }}</Option>
                </Select>

                <p>关联类属性</p>
                <Select v-model="datePicker.relation_attr" filterable>
                  <Option v-for="item in filter_relation_attr" :key="item.id" :value="item.attributeName">{{ item.displayName }}</Option>
                </Select>

                <p>关联的实体类</p>
                <Select v-model="datePicker.relation_class" filterable>
                  <Option v-for="item in filter_relation_class" :key="item.id" :value="item.className">{{ item.displayName }}</Option>
                </Select>

                <p>关联实体类属性</p>
                <Select v-model="datePicker.relation_class_attr" filterable>
                  <Option v-for="item in filter_relation_class_attr" :key="item.id" :value="item.attributeName">{{ item.displayName }}</Option>
                </Select>

                  <p>日期格式</p>
                      <Select v-model="datePicker.format" filterable>
                        <Option v-for="item in formatList" :value="item.value" :key="item.value">{{item.name}}</Option>
                    </Select>

                  <p>占位文本</p>
                    <Input v-model="datePicker.placeholder"  style="width: auto"></Input>

                    <p>禁用选择器</p>
                    <i-switch  v-model="datePicker.disabled" >
                    </i-switch>


                  <p>只读</p>
                    <i-switch  v-model="datePicker.readonly" >
                    </i-switch>

                    <p>高度</p>
                    <InputNumber :min="1" v-model="datePicker.height" style="display: inline-block; width: 100%" />
                    <p>标签区域对齐方式</p>
                    <Select v-model="datePicker.label_align" filterable>
                      <Option v-for="item in alignList" :key="item.value" :value="item.value">{{ item.name }}</Option>
                    </Select>
                    <p>主区域对齐方式</p>
                    <Select v-model="datePicker.main_align" filterable>
                      <Option v-for="item in alignList" :key="item.value" :value="item.value">{{ item.name }}</Option>
                    </Select>
                    <p>标签-主区域比例</p>
                    <div>
                      <InputNumber :min="1" v-model="datePicker.label_width" /> :
                      <InputNumber :min="1" v-model="datePicker.main_width" />
                    </div>

            </Form>
        </span>
    </section>
    <section v-else-if="t_show" :addinName="name" ref="main" :style="{'width': colWidth}">
          <label v-if="datePicker.label" :style="{
                      'width': labelWidth,
                      'display': 'inline-block',
                      'text-align': labelXAlign,
                      'vertical-align': labelYAlign}">{{datePicker.label}}
          </label>
          <DatePicker type="datetime" v-model="value" :name="datePicker.name" :format="datePicker.format" :placeholder="datePicker.placeholder"
            :confirm="datePicker.confirm" :disabled="datePicker.disabled" :readonly="datePicker.readonly" :multiple="datePicker.multiple"
            :transfer="true"
            :style="{
                            'height': arg_height,
                            'width': mainWidth,
                            'display': 'inline-block',
                            'text-align': mainXAlign,
                            'vertical-align': mainYAlign}">
          </DatePicker>
    </section>
    <section v-else-if="t_icon" :addinName="name" style="text-align: center">
      <span style="text-align: center">
        <div class="form-addin-icon">
                <i class="iconfont">&#xe62b;</i>
        </div>
        <Tooltip content="日期选择框" style="width:100%;"  :transfer="true">日期...</Tooltip>
      </span>
    </section>

</template>

<script>
import "@/styles/component/iconfont.css";
const name = "DateSInput";
export default {
  name: name,
  // 属性值传入:
  //  itemValue: 表单对应的Json结构
  //  attributes: 实体类属性
  //  relations:  关联类,带有属性列表
  //  relation_classes:   被关联的实体类,带有属性列表
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "relations", "relation_classes"],
  data() {
    return {
	times: 0,
      name: name,
      // 展示模式
      t_preview: true,
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
        width: 100,
        widthType: '%',
        height: 30,
        heightType: "px",
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
      ],

      timer: null
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
      }
    // this.value = new Date();
  },
  mounted() {
    if (this.t_preview) {
      this.setHeight();
    }

  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
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
      return this.datePicker.height < 2 ? this.datePicker.height * 30 + "px" : this.datePicker.height + this.datePicker.heightType;
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
    }
    // end
  },
  methods: {

      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        return;
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
      if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      return this;
    },
    // 获取表单项名
    getFormName() {
      return this.datePicker.name;
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
</style>
