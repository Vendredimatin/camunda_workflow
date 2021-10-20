<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
          <span v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block',
            'padding-left':'16px','text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color, 'padding-right': '10px'}">
              <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
          <span :style="{'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'background-color': args.main_color,'color': args.main_fontColor}">
            <van-icon name="location" :color="args.txt_fontColor" :size="args_fsize" />
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
                      <div class="margin1" >
                        默认显示地图
                        <i-switch style="float: right" v-model="args.mapFlag" />
                      </div>
                      <p class="margin1">视野级别</p>
                      <InputNumber :max="20" :min="1" v-model="args.viewZoom" style="width: 100%"></InputNumber>
                      <p class="margin1">回填内容</p>
                      <RadioGroup class="margin1" v-model="args.returnType">
                        <Radio label="坐标"></Radio>
                        <Radio label="地址"></Radio>
                      </RadioGroup>
                      <p class="margin1">自定义图标</p>
                      <Select class="margin1" v-model="args.selfPointOrigin" @on-change="switchSelfOrigin">
                        <Option value="imgBase">图片库</Option>
                        <Option value="imgSelf">自定义</Option>
                      </Select>
                      <Input class="margin1" type="textarea" :autosize="true" v-model="args.selfPointUrl" @on-focus="chooseOrigin"/>
                      <p class="margin1">自定义图标宽度</p>
                      <InputNumber :max="100" :min="1" v-model="args.selfPointWidth" style="width: 100%"></InputNumber>
                      <p class="margin1">自定义图标高度</p>
                      <InputNumber :max="100" :min="1" v-model="args.selfPointHeight" style="width: 100%"></InputNumber>
                      <!-- 图片库编辑弹窗 -->
                      <ImgEditModal ref="img_modal" @transferImg="getImgUrl"></ImgEditModal>
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
                <i class="iconfont">&#xe649;</i>
                </div>
                <div class="form-addin-name">
                    位置标记
                </div>
            </span>
        </section>
</template>

<script>
import _global from '@/views/global.vue'
import { mapGetters, mapActions } from "vuex";
import ImgEditModal from '@/ext_components/form/subcomponent/ImgCommonModal'
import EditBox from "@/ext_components/form/_EditBox.vue"
import "@/styles/component/iconfont.css";

const name = "MapPoint";
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
    EditBox,
    ImgEditModal
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

      args: {
        main_fontColor: 'initial',
        main_color: 'initial',
        dynamic: false,     // 动态响应
        title: '位置标记',
        id: null,
        hided: false,
        label: "",
        name: "",
        label_width: 2,
        main_width: 3,
        label_align: 1,
        main_align: 4,
        targetDataType: null,
        value: "",
        label_fontColor: 'initial',       // 标签文字颜色
        txt_fontColor: "initial", // 内容文字颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单位
        fsize: 14, // 内容文字大小
        fsizeType: "px", // 内容文字大小单位

        // 属性插件所需属性
        height: 44,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        mapFlag: false,

        selfPointOrigin: 'imgSelf',
        selfPointUrl: '',
        selfPointWidth: 50,
        selfPointHeight: 50,
        viewZoom: 15,
        returnType: '坐标',
        picActIndex: -1,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ['初始化', '单击'],
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String'],

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
      } else this.args.targetDataType = null;
    },
  },
  computed: {
    ...mapGetters("DWF_form", [
        "EntityAttrList",
        "Relations",
        "RelationAttrList"
    ]),
    arg_height() {
      return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
    //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
    },
    // 需要用到实体类属性列表时使用
    arg_name() {
        return this.args.name;
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
    filter_attributes() {
        return this.attributes ? ( this.relation ?
            [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
    },
    labelWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return (!this.args.label || this.args.label == "") ? "10%" : this.args.label_widthByPx + 'px';
      }else{
        return (!this.args.label || this.args.label == "") ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      }
    },
    mainWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return !this.args.label || this.args.label == "" ? "100%" : `calc(100% - ${this.args.label_widthByPx}px)`;
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
    switchSelfOrigin() {
      this.args.selfPointUrl = '';
    },
    // 选择自定义图标来源
    chooseOrigin() {

      if (this.args.selfPointOrigin == 'imgBase') {
        this.$refs.img_modal.editModal(this.args.selfPointUrl, '图片');
      }

    },
    // 选择图标
    getImgUrl(data, index) {

      if (data == null) {
        this.args.selfPointUrl = '';
      } else {

        this.args.selfPointUrl = data.oid;
      }

      this.args.picActIndex = index;

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
</style>