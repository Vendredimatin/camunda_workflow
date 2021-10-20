<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
          <span v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block',
            'padding-left':'16px','text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color, 'padding-right': '10px'}">
            <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
          <span :style="{'min-height': '63px', 'width': mainWidth, 'display': 'inline-block', 'vertical-align': 'middle',
            'background-color': args.main_color,'color': args.main_fontColor}">
            <van-steps :active="args.actStepIndex" :inactive-icon="args.inactStepIcon" :active-icon="args.actStepIcon" :active-color="args.actStepColor">
                <van-step class="self-step" v-for="(item, index) in args.stepList" :key="index">{{ item.title }}</van-step>
            </van-steps>
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
                      <Row class="margin1">
                        <Col span="10">
                            <span style="font-size: 12px;font-weight: 500;">步骤项设置</span>
                        </Col>
                        <Col span="14" style="text-align: right;">
                            <Button type="text" size="small" @click="addStep" style="font-weight: 500;">
                              <span style="font-size: 12px;">添加项</span>
                              <Icon type="md-add"></Icon>
                            </Button>
                        </Col>
                      </Row>
                      <div class="margin1" v-for="(item, index) in args.stepList" :key="index">
                          <Row class="item-head margin1">
                            <Col span="10">
                                <span style="font-size: 12px;">步骤项{{ index+1 }}</span>
                            </Col>
                            <Col span="14" style="text-align: right;">
                                <Button type="text" size="small" @click="delStep(index)">
                                  <Icon type="md-close"></Icon>
                                </Button>
                            </Col>
                          </Row>
                          <Input class="margin1" v-model="item.title" />
                      </div>
                    </div>
                    <div slot="layout">
                        <!-- <Row class="margin1">
                            <Col span="6" class="grid-row">
                                <span style="font-size: 12px;">显示方向</span>
                            </Col>
                            <Col span="18" class="grid-row">
                                <RadioGroup v-model="args.stepDirection">
                                    <Radio label="horizontal">横向</Radio>
                                    <Radio label="vertical">纵向</Radio>
                                </RadioGroup>
                            </Col>
                        </Row> -->
                        <!-- <Row class="margin1">
                            <Col span="6" class="grid-row">
                                <span style="font-size: 12px;">默认颜色</span>
                            </Col>
                            <Col span="18">
                                <ColorPicker v-model="args.inactStepColor" />
                            </Col>
                        </Row> -->
                        <Row class="margin1">
                              <Col span="6" class="grid-row">
                                  <span style="font-size: 12px;">默认图标</span>
                              </Col>
                              <Col span="18">
                                  <Select style="margin-bottom: 10px" v-model="args.inactStepIcon" filterable clearable>
                                      <Option v-for="item in vList" :value="item.value" :key="item.value" :label="item.label">
                                          <van-icon :name="item.value" size="20" />
                                      </Option>
                                  </Select>
                              </Col>
                          </Row>
                          <Row class="margin1">
                              <Col span="6" class="grid-row">
                                  <span style="font-size: 12px;">激活图标</span>
                              </Col>
                              <Col span="18">
                                  <Select style="margin-bottom: 10px" v-model="args.actStepIcon" filterable clearable>
                                      <Option v-for="item in vList" :value="item.value" :key="item.value" :label="item.label">
                                          <van-icon :name="item.value" size="20" />
                                      </Option>
                                  </Select>
                              </Col>
                          </Row>
                          <div class="margin1" style="margin: 10px 0 10px 0">
                            激活颜色
                            <ColorPicker v-model="args.actStepColor" alpha/>
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
                <i class="iconfont">&#xe6d3;</i>
                </div>
                <div class="form-addin-name">
                    步骤条
                </div>
            </span>
        </section>
</template>

<script>
import _global from '@/views/global.vue'
import EditBox from "@/ext_components/form/_EditBox.vue"
import "@/styles/component/iconfont.css";
import vantIconData from "@/views/functional-model/components/vantIcon.js";

const name = "Steps";
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

      groupAttrList: [],
      vList: [],

      args: {
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '步骤条',
        id: null,
        hided: false,
        name: null,
        label: '',
        label_width: 2,
        main_width: 3,
        label_align: 4,
        label_fontColor: "initial", // 标签文字颜色
        main_align: 4,
        lfsize: 14, // 标签文字大小
        lfsizeType: "px", // 标签文字大小单位
        label_color: "initial",
        value: "",
        targetDataType: null,
        stepList: [
          {
            title: '买家下单'
          }, {
            title: '商家接单'
          }, {
            title: '买家提货'
          }, {
            title: '交易完成'
          }
        ],
        
        stepTitle: '',
        stepNote: '',

        actStepIndex: 1,
        inactStepIcon: '',
        actStepIcon: 'checked',
        inactStepColor: '#E7E6E6',
        actStepColor: '#07c160',

        // 属性插件所需属性
        width: 100,
        widthType: '%',
        col: true,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ["点击步骤"],
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String', 'UUID', 'Integer'],

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
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {

      this.baseImgUrl = _global.baseUrl;

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

        this.vList = vantIconData;
        // 缺省绑定类为当前表单目标类
        if(this.args.bindTargetClass == '') {

        if(this.itemValue.data.isRelation) {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
        } else {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
        }

    }

    }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
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
        if (this.args.targetDataType == "Integer") {
          try {
            this.value = parseInt(this.value);
          } catch (e) {
            this.value = null;
          }
        }
        if (isNaN(this.value)) this.value = null;
      } else this.args.targetDataType = null;

      console.log(this.value)
    },
  },
  computed: {
    labelWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.label_widthByPx + 'px';
      }else{
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      }
    },
    mainWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return !this.args.label || this.args.label == "" ? "100%": `calc(100% - ${this.args.label_widthByPx}px)`;
      }else{
        return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
      }
    },
    arg_name() {
      return this.args.name;
    },
    // 标签文本内容字体大小
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + " !important";
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
    colWidth() {
      return this.args.width + this.args.widthType;
    //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
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
      if ("label" in args){
        let label = args.label;
        setTimeout(() => {
          this.args.label = label;
        }, 0);
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

    // 添加步骤项
    addStep() {
      
      if(this.args.stepList.length > 4) {
        this.$Message.warning('最多添加五项哦~');
        return;
      }

      let newStep = {
        title: '标题'
      }
      this.args.stepList.push(newStep);

    },

    // 删除步骤项
    delStep(ind) {
      
      this.args.stepList.splice(ind, 1);

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
.self-step p{
    font-size: 12px;
}
.self-step>>>.van-step {
    color: #969799;
}
[class*=van-hairline]::after {
    border: 0 solid #ebedf0;
}
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
.grid-row {
    height: 32px;
    line-height: 32px;
}
.item-head {
  height: 24px;
  line-height: 24px;
}
</style>
