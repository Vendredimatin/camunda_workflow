<template>

    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': colWidth}">
        
        <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor,}">
          <span :style="{'background-color': args.main_color, 'width': '100%',
          'height': '100%', 'display': 'flex', 'vertical-align': mainYAlign}">
            <Calendars
                ref="Calendar"
                :markDateMore="arr"
                :markDate="arr2"
                :textTop="args_titleTxt"
                v-on:isToday="clickToday"
                agoDayHide="1530115221"
                v-on:choseDay="clickDay"
                v-on:changeMonth="changeDate"
            ></Calendars>
          </span>
        </span>
      
        <span v-show="t_edit" ref="edit">
          <EditBox v-model="args"
          :attributes="filter_attributes"
          :router="router"
          :route="route"
          :root="root"
          :query_oprs="query_oprs"
          :targetclass="itemValue.data.targetClass">
            <div slot="attribute">
                <div class="margin1" style="padding: 0 8px;margin: 10px 0;">
                自定义表头文字
                <Input class="margin1" type="textarea" :autosize="true" v-model="args.titleTxt" />
                </div>
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
                <i class="iconfont">&#xe62b;</i>
              </div>
              <div class="form-addin-name">
                  我的日历
              </div>
          </span>
    </section>

</template>

<script>
import EditBox from "@/ext_components/form/_EditBox.vue";
import "@/styles/component/iconfont.css";
import Calendars from 'vue-calendar-component';
const name = "Calendar";
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
  props: ["itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],
  components: {
    Calendars,
    EditBox,
  },
  data() {
    return {
      arr2: [],
      arr: [
        {
          date: "2018/8/1",
          className: "mark1"
        },
        {
          date: "2018/8/13",
          className: "mark2"
        }
      ],
      timer: null,
      times: 0,
      name: name,
      // 展示模式
      t_preview: true,
      t_edit: false,

      minHour: 10,
      maxHour: 20,
      minDate: new Date(),
      maxDate: new Date(2019, 10, 1),
      currentDate: new Date(),

      // 支持的数据类型
      // dataTypes: ["String", "Integer", "Long", "Date", "TimeStamp"],
      dataTypes: ["Date", "TimeStamp"],
      // 编辑框
      args: {
        dynamic: false,     // 动态响应
        defaultValue: '',
        label_fontColor: 'initial',       // 标签文字颜色
        txt_fontColor: 'initial',         // 内容文字颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单位
        fsize: 14,                        // 内容文字大小
        fsizeType: 'px',                  // 内容文字大小单位
        txt_bgColor: '#fff',              // 输入框背景颜色
        label_color: "initial",
        main_fontColor: "initial",
        main_color: "initial",
        title: '我的日历',
        id: null,
        type: "date",
        // format: "yyyy-MM-dd",

        titleTxt: "日,一, 二, 三, 四, 五, 六",
        // placeholder: "空",
        confirm: true,
        disabled: false,
        readonly: false,
        required: false,
        multiple: false,
        hided: false,

        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,

        label: "",
        name: "",
        targetDataType: "_Date",
        height: 340,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        cols: 3,
        events: [],
        eventRange: ["值变化", "鼠标悬停"]
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
    };
  },
  created() {

    function format(date, index) {
      date = new Date(date);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${index}`;
    }
    setTimeout(() => {
      this.arr = [
        {
          date: format(new Date(), 3),
          className: "mark1"
        },
        {
          date: format(new Date(), 12),
          className: "mark2"
        }
      ];
      this.arr.push({
        date: format(new Date(), 15),
        className: "mark1"
      });
    }, 300);

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
    // this.value = this.args.defaultValue = new Date();
  },
  mounted() {

    if (this.t_preview) {
        console.log(Calendar)
    }

  },
  watch: {
    arg_height(val) {
      this.$refs.main.querySelector(".ivu-input-icon").style.lineHeight = this.arg_height;
      this.setHeight();
    },
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
    args_titleTxt() {
        return this.args.titleTxt.split(',');
    },
    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
    },
    labelWidth() {
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
    },
    mainWidth() {
        return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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
    // 文本内容字体大小
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + ' !important';
    },
    // 标签文本内容字体大小
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + ' !important';
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

  },
  methods: {
    clickDay(data) {
      console.log("选中了", data); //选中某天
      this.$toast("选中了" + data);
    },
    clickToday(data) {
      console.log("跳到了本月今天", data); //跳到了本月
    },
    changeDate(data) {
      this.$toast("切换到的月份为" + data);
      console.log("左右点击切换月份", data); //左右点击切换月份
    },
    demo() {
      this.$refs.Calendar.ChoseMonth("2018-12-13"); //跳到12月12日选中12月12日
    },
    setInheritStyle() {
      this.$refs.main.querySelector(".ivu-date-picker-rel").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".ivu-date-picker-rel").style.height = 'inherit';
      this.$refs.main.querySelector(".ivu-input-wrapper").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".ivu-input-wrapper").style.height = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.backgroundColor = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';
      this.$refs.main.querySelector(".ivu-input-icon").style.lineHeight = this.arg_height;
      this.$refs.main.querySelector(".i-input .ivu-input").style.height = 'inherit';
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
      if ("label" in args) setTimeout(() => { this.args.label = args.label; }, 300);
      if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      return this;
    },
    // 获取表单项名
    getFormName() {
      return this.args.name;
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
    defaultValueChange(value){
      if(value && this.args.name){
        setTimeout(() => {
          this.args.defaultValue = value;
        }, 10)
      }
    },
    openValueChange(status){
      if(status) {
        this.setInheritStyle();
      }
    },
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