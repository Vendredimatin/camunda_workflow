<template>

    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': colWidth}">
      <template v-if="args.structural_layout === 'horizontal'">
        <!-- <span v-if="itemValue.data.deviceType == 'actPc'" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign}"> -->
        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'padding-left':'16px','text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor,'vertical-align': mainYAlign}">
          <span :style="{'background-color': args.main_color, 'width': '100%',
          'height': '100%', 'display': 'flex', 'vertical-align': mainYAlign}">
            <van-field
                    class="i-input"
                    v-model="arg_format_time"
                    :input-align="mainXAlign"
                    :placeholder="args.placeholder"
                    right-icon="calendar-o"
                    :size="args.size"
                    :readonly="args.readonly && !t_preview"
                    :style="{'padding-top':'0','padding-bottom':'0','height': arg_height, 'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'text-align': mainXAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
            ></van-field>
          <van-popup v-model="calendarShow"  position="bottom"
            :duration="0"
            get-container="#GlobalForm" >
              <van-datetime-picker
                :title="args.defaultTitle"
                v-model="arg_pop_time"
                :type="args.type"
                :formatter="formatter"
                :min-date="args.minDate"
                :max-date="args.maxDate"
                @confirm="confirmDate"
                @cancel="cancel"
              />

          </van-popup>
          </span>
        </span>
      </template>
      <template v-else>
        <!-- <span v-if="itemValue.data.deviceType == 'actPc'" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign}"> -->
        <span v-if="args.required || args.label" :style="{
          'align-items': labelYAlignFlex,
          'width': '100%', 'display': 'flex',
        'padding-left':'16px','text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor,}">
          <span :style="{'background-color': args.main_color, 'width': '100%',
          'height': '100%', 'display': 'flex', 'vertical-align': mainYAlign}">
            <van-field
                    class="i-input"
                    v-model="arg_format_time"
                    :input-align="mainXAlign"
                    :placeholder="args.placeholder"
                    right-icon="calendar-o"
                    :size="args.size"
                    :readonly="args.readonly && !t_preview"
                    :style="{'padding-top':'0','padding-bottom':'0','height': arg_height, 'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'text-align': mainXAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
            ></van-field>
          <van-popup v-model="calendarShow"  position="bottom"
            :duration="0"
            get-container="#GlobalForm" >
              <van-datetime-picker
                v-model="arg_pop_time"
                :title="args.defaultTitle"
                :type="args.type"
                :formatter="formatter"
                :min-date="args.minDate"
                :max-date="args.maxDate"
                @confirm="confirmDate"
                @cancel="cancel"
              />

          </van-popup>
          </span>
        </span>
    </template>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
          <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
          :attributes="filter_attributes"
          :router="router"
          :route="route"
          :root="root"
          :itemValue="itemValue"
          :addinName="name"
          :query_oprs="query_oprs"
                   :dataTypes="dataTypes"
          :targetclass="itemValue.data.targetClass">
            <div slot="attribute">
                <p class="margin1">日期格式</p>
                <Select class="margin1" v-model="args.format" filterable @on-change="changeDateFormat">
                  <Option v-for="item in formatList" :value="item.value" :key="item.value">{{item.name}}</Option>
                </Select>
                <p class="margin1">最小日期</p>
                <DatePicker class="margin1" transfer v-model="args.minDate" :clearable="false" type="date" style="width: 100%" @on-change="selectMinDate"></DatePicker>
                <p class="margin1">最大日期</p>
                <DatePicker class="margin1" :options="maxoption" transfer v-model="args.maxDate" type="date" style="width: 100%" :clearable="false"></DatePicker>

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
                  日期框
              </div>
          </span>
    </section>

</template>

<script>
import EditBox from "@/ext_components/form/_EditBox.vue";
import "@/styles/component/iconfont.css";
const name = "DateInput";
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
  props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],
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

      minHour: 10,
      maxHour: 20,
      currentDate: new Date(),

      // 支持的数据类型
      // dataTypes: ["String", "Integer", "Long", "Date", "TimeStamp"],
      dataTypes: ["Date", "TimeStamp"],
      minDate: new Date(2000, 0, 1),
      maxDate: new Date(2030, 11, 31),
      // 编辑框

      actEdit: false,
      args: {
        isMobile: true,
        dynamic: false,     // 动态响应
        needCheckDuplic: false,
        defaultValue: null,
        label_fontColor: 'initial',       // 标签文字颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单位
        txt_bgColor: '#fff',              // 输入框背景颜色
        lfsizeType: 'px',                 // 标签文字大小单位
        fsize: 14, // 内容文字大小
        fsizeType: "px", // 内容文字大小单位
        txt_fontColor: "initial", // 内容文字颜色
        label_color: "initial",
        main_fontColor: "initial",
        main_color: "initial",
        title: '日期框',
        id: null,
        type: "date",
        format: 'yyyy-MM-dd',
        placeholder: "请选择",
        confirm: true,
        disabled: false,
        readonly: false,
        required: false,
        multiple: false,
        hided: false,
        defaultDateType: 'date',
        defaultTitle: '选择年月日',

        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,

        label: "",
        name: "",
        targetDataType: "_Date",
        height: 44,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        cols: 3,
        events: [],
        eventRange: ["值变化", "值校验"],
        minDate: new Date(2000, 0, 1),
        maxDate:  new Date(2030, 11, 31),
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
          value: "yyyy-MM-dd HH:mm",
          name: "年月日时分"
        },
        {
          value: "yyyy-MM-dd HH",
          name: "年月日小时"
        },
        {
          value: "MM-dd",
          name: "月日"
        },
        {
          value: "yyyy-MM",
          name: "年月"
        },
        {
          value: "HH:mm",
          name: "时分",
        }
      ],
      value: null,
      calendarShow: false,
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
    // this.value = this.args.defaultValue = new Date();
  },
  mounted() {

    if (this.t_preview) {

      // 字体 ／ 颜色 默认继承
      this.$nextTick(() => {
        this.setInheritStyle();
      });
      // if(this.itemValue.data.deviceType == 'actPc') {
      // }
    }

  },
  watch: {
    arg_height(val) {
      this.$refs.main.querySelector(".i-input").style.lineHeight = this.arg_height;
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
    maxoption() {
      let self = this;
      return {
        disabledDate (date) {
            if (!self || !self.args) return false
            return date && date.valueOf() < new Date(self.args.minDate).getTime();
        }
      }
    },
    arg_format_time() {
      console.log(this.args.defaultValue)
      return this.format(this.args.defaultValue,this.args.format)
    },
    arg_pop_time: {
      set() { },
      get() {
        if (this.args.type == 'time') return this.format(this.args.defaultValue,this.args.format)
        return this.args.defaultValue
      }
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
    labelYAlignFlex(){
      let x = this.args.label_align % 3;
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
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
    showCalendar() {
      this.calendarShow = true;
    },
    selectMinDate(val) {
      console.log(val,new Date(val).getTime() >new Date(this.args.maxDate).getTime())
      if(new Date(val).getTime() > new Date(this.args.maxDate).getTime()){
        this.args.maxDate = new Date(val);
      }
    },
    confirmDate(e) {
      console.log(e)
      this.calendarShow = false;
      if(this.args.type == 'time') {
        console.log('2010-1-1 '+e, '----time')
        this.args.defaultValue = new Date('2010-1-1 '+e)

      }
      else {
        this.args.defaultValue = new Date(e);

      }
    },
    cancel() {
        this.calendarShow = false;
    },
    changeDateFormat(e) {
      if(e == 'HH:mm') {
          this.args.type = 'time';
          this.args.defaultTitle = '选择时分';
          this.args.defaultDateType = 'datetime'
      } else if(e == 'MM-dd') {
          this.args.type = 'month-day';
          this.args.defaultTitle = '选择月日';
          this.args.defaultDateType = 'date'
      } else if(e == 'yyyy-MM') {
          this.args.type = 'year-month';
          this.args.defaultTitle = '选择年月';
          this.args.defaultDateType = 'month'
      } else if(e == 'yyyy-MM-dd HH:mm') {
          this.args.type = 'datetime';
          this.args.defaultTitle = '选择年月日时分';
          this.args.defaultDateType = 'datetime'
      } else if (e == 'yyyy-MM-dd HH') {
          this.args.type = 'datehour';
          this.args.defaultTitle = '选择年月日小时';
          this.args.defaultDateType = 'datetime'
      }
      else {
          this.args.type = 'date';
          this.args.defaultTitle = '选择年月日';
          this.args.defaultDateType = 'date'

      }
    },
    formatter(type, val) {
      if (type === 'year') {
        return `${val}年`;
      } else if (type === 'month') {
        return `${val}月`;
      } else if (type === 'day') {
        return `${val}日`;
      }
      return val;
    },

    format(time, fmt) {
      console.log(time, time instanceof Date, !(time instanceof Date), time && isNaN(time.getTime()))
      if (!(time instanceof Date) || (time && isNaN(time.getTime()))) return '';
      var o = {
        "M+" : time.getMonth()+1,                 //月份 
        "d+" : time.getDate(),                    //日 
        "h+" : time.getHours(),                   //小时 
        "H+" : time.getHours(),                   //小时 
        "m+" : time.getMinutes(),                 //分 
        "s+" : time.getSeconds(),                 //秒 
        "q+" : Math.floor((time.getMonth()+3)/3), //季度 
        "S"  : time.getMilliseconds()             //毫秒 
      };
      console.log('0 ',fmt)
      if(/(y+)/.test(fmt)) {
              fmt=fmt.replace(RegExp.$1, (time.getFullYear()+"").substr(4 - RegExp.$1.length)); 
      }
      console.log('1 ',fmt)
      for(var k in o) {
          if(new RegExp("("+ k +")").test(fmt)){
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
          }
      }
      console.log('2 ',fmt)
      return fmt
    },
    setInheritStyle() {
        this.$refs.main.querySelector(".i-input").style.height = 'inherit';
        this.$refs.main.querySelector(".i-input").style.textAlign = 'inherit';
        // this.$refs.main.querySelector(".i-input").style.backgroundColor = 'inherit';
        this.$refs.main.querySelector(".i-input .van-cell__value").style.color = 'inherit';
        this.$refs.main.querySelector(".i-input .van-field__control").style.color = 'inherit';
        this.$refs.main.querySelector(".i-input .van-field__right-icon")? this.$refs.main.querySelector(".i-input .van-field__right-icon").style.color = 'inherit': '';
        this.$refs.main.querySelector(".i-input .van-field__value") ? this.$refs.main.querySelector(".i-input .van-field__value").style.height = 'inherit' : '';
        this.$refs.main.querySelector(".i-input .van-field__value") ? this.$refs.main.querySelector(".i-input .van-field__value").style.fontSize = 'inherit' : '';
        this.$refs.main.querySelector(".i-input .van-field__body") ? this.$refs.main.querySelector(".i-input .van-field__body").style.fontSize = 'inherit' : '';

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
      if ("maxDate" in args) {
        this.args.maxDate = new Date(args.maxDate)
      }
      if ("minDate" in args) {
        this.args.minDate = new Date(args.minDate);
      }
      if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      if (this.args.setNow && this.args.defaultValue) this.args.defaultValue = new Date();
      else if ("defaultValue" in args && this.args.defaultValue) this.args.defaultValue = new Date(this.args.defaultValue);
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
