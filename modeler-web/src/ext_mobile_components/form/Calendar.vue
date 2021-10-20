<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
          <span :style="{'height': arg_height, 'min-height': arg_height, 'width': '100%', 'display': 'inline-block',
              'background-color': args.main_color,'color': args.main_fontColor}">
              <van-calendar
                v-if="reloadCalendar"
                :title="args.titleText"
                :show-title="args.needTitle"
                :show-subtitle="args.needSubtitle"
                :color="args.actColor"
                :type="args.type"
                :show-confirm="false"
                :show-mark="args.needMark"
                :poppable="false"
                :readonly="args.readonly"
                :min-date="selfMinDate"
                :max-date="selfMaxDate"
                :row-height="args.calRowHeight"
                :style="{ height: arg_height }"
                />
          </span>
          <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
                <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :store="store"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
                    <div slot="attribute">
                        <div class="margin1" style="margin: 10px 0 10px 0">
                            标题
                            <i-switch style="float: right" v-model="args.needTitle"/>
                        </div>
                        <p v-show="args.needTitle" class="margin1">标题文本</p>
                        <Input v-show="args.needTitle" class="margin1" v-model="args.titleText" maxlength="16"></Input>
                        <div class="margin1" style="margin: 10px 0 10px 0">
                            副标题
                            <i-switch style="float: right" v-model="args.needSubtitle"/>
                        </div>
                        <div class="margin1" style="margin: 10px 0 10px 0">
                            背景水印
                            <i-switch style="float: right" v-model="args.needMark"/>
                        </div>
                        <Row class="margin1">
                            <Col span="6" class="grid-row">
                                <span style="font-size: 12px;">日期类型</span>
                            </Col>
                            <Col span="18" class="grid-row">
                                <RadioGroup v-model="args.type">
                                    <Radio label="single">单个</Radio>
                                    <Radio label="range">区间</Radio>
                                </RadioGroup>
                            </Col>
                        </Row>
                        <!-- <p class="margin1">最小日期</p>
                        <DatePicker class="margin1" v-model="args.minDate" type="date" style="width: 216px"></DatePicker>
                        <p class="margin1">最大日期</p>
                        <DatePicker class="margin1" v-model="args.maxDate" :options="maxOptions" type="date" style="width: 216px"></DatePicker> -->
                        <p class="margin1">日期范围</p>
                        <DatePicker type="daterange" v-model="args.selfCalendarDate" split-panels transfer placeholder="Select date" style="width: 216px"></DatePicker>
                    </div>
                    <div slot="layout">
                      <Row class="margin1">
                        <Col span="4" class="grid-row">
                            <span style="font-size: 12px;">行高</span>
                        </Col>
                        <Col span="20">
                            <InputNumber v-model="args.calRowHeight" :min="1"></InputNumber>
                        </Col>
                      </Row>
                      <div class="margin1" style="margin: 10px 0 10px 0">
                        主题色
                        <ColorPicker v-model="args.actColor" alpha/>
                      </div>
                    </div>
                    <div slot="operation">
                    </div>
                    <!-- 图片库编辑弹窗 -->
                </EditBox>
            </span>
        </section>
        <section v-else :addinName="name" style="text-align: center">
            <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6cf;</i>
                </div>
                <div class="form-addin-name">
                    日历
                </div>
            </span>
        </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import EditBox from "@/ext_components/form/_EditBox.vue"
import "@/styles/component/iconfont.css";

const name = "Calendar";
export default {
  name: name,
  props: [
    'addin',
    'basicArgs',
    'argsProps',
    'activeUUID',
    'store',
    'itemValue',
    'attributes',
    'relation',
    'editExtendInfo',
    'widgetAnnotation',
    'checkResult',
    'query_oprs',
    'route',
    'router',
    'root',
    'Message',
    'echarts',
  ],
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
      addIcon: true,
      actEdit: false,
      reloadCalendar: true,
      maxOptions: {
        disabledDate (date) {
            return date && date.valueOf() < Date.now() - 86400000;
        }
      },

      args: {
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '日历',
        id: null,
        hided: false,
        readonly: false,
        value: "",

        titleText: '日历',
        needTitle: false,
        needSubtitle: true,
        needMark: true,
        type: 'single',
        actColor: '#ee0a24',
        calRowHeight: 64,
        selfCalendarDate: [new Date(2021, 0, 1), new Date(2021, 11, 31)],

        // 属性插件所需属性
        height: 380,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ['初始化', "选择日期"],
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String', 'UUID', 'Clob', 'LocalFile'],

      // 继承属性
      inherit: [],

      // 属性map
      attrMap: {},

      timer: null,

      value: null,
    };
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    this.$store = this.store;
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
      if (this.Message && !this.$Message) this.$Message = this.Message;
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    if (this.t_preview) {

       // 缺省绑定类为当前表单目标类
      // if(this.args.bindTargetClass == '') {

      //   if(this.itemValue.data.isRelation) {
      //     this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
      //   } else {
      //     this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
      //   }

      // }

    }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
  },
  computed: {
    ...mapGetters("DWF_form", [
        "EntityAttrList",
        "Relations",
        "RelationAttrList"
    ]),
    selfMinDate() {
      return this.args.selfCalendarDate[0] ? this.args.selfCalendarDate[0] : new Date(2021, 0, 1);
    },
    selfMaxDate() {
      return this.args.selfCalendarDate[1] ? this.args.selfCalendarDate[1] : new Date(2021, 11, 31);
    },
    arg_height() {
      this.reloadCalendar = false;
      this.$nextTick(() => {
        this.reloadCalendar = true;
      })
      return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
    //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
    },
    arg_bindClass() {
      return this.args.bindTargetClass;
    },
    // 需要用到实体类属性列表时使用
    filter_attributes() {
        return this.attributes ? ( this.relation ?
            [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
    },
    // end
  },
  methods: {
    ...mapActions("DWF_form", [
        "handleQueryData",
        "queryEntity",
        "queryRelation"
    ]),
    setValue(value) {
      this.args.value = value;
      return this;
    },

    getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },
    getAllow() {
      return null;
    },
    getName() {
      return name;
    },
    getArgs() {
      return this.args;
    },
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }

      if('selfCalendarDate' in args) {

        // 判断定义日期范围值的有效性 空改为默认值:今年
        let minDate = args.selfCalendarDate[0];
        if(minDate) {
          minDate = new Date(Date.parse(minDate));
        }
        if(minDate instanceof Date && !isNaN(minDate.getTime())) {
          this.args.selfCalendarDate = [new Date(Date.parse(args.selfCalendarDate[0])), new Date(Date.parse(args.selfCalendarDate[1]))]
        }

      }

      return this;
    },
    getFormName() {
      return this.args.name;
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
    setIcon(id) {
      this.icon_url = id;
      return this;
    },
    getDataType(args) {
      return this.dataTypes;
    },
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
.grid-row {
    height: 32px;
    line-height: 32px;
}
</style>