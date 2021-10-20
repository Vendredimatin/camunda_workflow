<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">

          <span v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block',
            'padding-left':'16px','text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color, 'padding-right': '10px'}">
                <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>

          <span :style="{'min-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign}">

            <div class="QRcode" :style="{'width': '100%', 'height': arg_height}">
                <canvas ref="qrCanvas" :id="`selfCanvas${args.id}`"></canvas>
            </div>
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
                        自定义字符串
                        <i-switch style="float: right" v-model="args.selfFLag"/>
                      </div>
                      <Input v-show="args.selfFLag" class="margin1" v-model="args.shareUrl" placeholder="自定义字符串"/>
                      <div class="margin1" style="margin: 10px 0 10px 0">
                        自定义字符串前缀
                        <i-switch style="float: right" v-model="args.selfHostFLag" @on-change="switchHost" />
                      </div>
                      <Input v-show="args.selfHostFLag" class="margin1" v-model="args.shareUrlHost" placeholder="自定义字符串前缀"/>
                      <div class="margin1" style="margin: 10px 0 10px 0">
                        显示LOGO
                        <i-switch style="float: right" v-model="args.needLogo"/>
                      </div>
                      <div class="margin1" v-show="args.needLogo">
                        <p class="margin1">LOGO地址源</p>
                        <Select class="margin1" v-model="args.logoOrigin" @on-change="switchOrigin">
                          <Option value="imgBase">图片库</Option>
                          <Option value="imgSelf">自定义</Option>
                        </Select>
                        <Input class="margin1" type="textarea" :autosize="true" v-model="args.logoUrl" @on-focus="chooseOrigin"/>
                        <ImgEditModal ref="img_modal" @transferImg="getImgUrl"></ImgEditModal>
                        <p class="margin1">LOGO比例</p>
                        <InputNumber :max="0.2" :min="0.1" :step="0.01" v-model="args.logoSize" style="width: 100%"></InputNumber>
                        <p class="margin1">LOGO圆角大小</p>
                        <InputNumber :min="1" v-model="args.logoRadius" style="width: 100%"></InputNumber>
                        <div class="margin1">
                          <p class="margin1" style="float: left; margin-right: 15px;">LOGO背景颜色</p>
                          <ColorPicker v-model="args.logoBackColor" />
                        </div>
                      </div>
                      <Button v-show="args.selfFLag" style="margin-top: 15px;" type="success" long @click="freshCode">刷新二维码</Button>
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
                <i class="iconfont">&#xe6f3;</i>
                </div>
                <div class="form-addin-name">
                    二维码
                </div>
            </span>
        </section>
</template>

<script>
import _global from '@/views/global.vue'
import { mapGetters, mapActions } from "vuex";
import EditBox from "@/ext_components/form/_EditBox.vue"
import "@/styles/component/iconfont.css";
import ImgEditModal from '@/ext_components/form/subcomponent/ImgCommonModal'
// import QRCode from 'qrcode'
import QrCodeWithLogo from 'qr-code-with-logo'

const name = "QRcode";
var canvas = '';
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
        title: '二维码',
        id: null,
        hided: false,
        value: "",
        targetDataType: null,
        name: null,
        label: '',
        label_width: 2,
        main_width: 3,
        label_align: 1,
        label_fontColor: "initial", // 标签文字颜色
        main_align: 4,
        lfsize: 14, // 标签文字大小
        lfsizeType: "px", // 标签文字大小单位
        label_color: "initial",
        selfFLag: false,
        selfHostFLag: false,
        shareUrl: '',
        shareUrlHost: '',

        needLogo: false,
        logoOrigin: 'imgSelf',
        logoUrl: '',
        logoSize: 0.2,
        logoRadius: 4,
        logoBackColor: '#fff',

        // 属性插件所需属性
        height: 164,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String', 'UUID', "Integer", "Long", "Double", "Date", "TimeStamp"],

      // 继承属性
      inherit: [],

      // 属性map
      attrMap: {},

      timer: null,

      value: null,
      baseImgUrl: ''
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

        this.drawCode();

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
        if (isNaN(this.value)) this.value = null;
      } else this.args.targetDataType = null;

      console.log(this.value)
    },
  },
  computed: {
    ...mapGetters("DWF_form", [
        "EntityAttrList",
        "Relations",
        "RelationAttrList"
    ]),
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
    arg_height() {
      return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
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

    // 选择背景图片来源
    chooseOrigin() {
      if (this.args.logoOrigin == 'imgBase') {
        this.$refs.img_modal.editModal(this.args.logoUrl, '图片');
      }

    },

    switchOrigin() {
      this.args.logoUrl = '';
    },

    getImgUrl(data) {

        if (data == null) {

            this.args.logoUrl = '';

        } else {

            this.args.logoUrl = data.oid;
        }

    },

    drawCode() {

        let temValue = '';
        let urlStr = this.args.selfFLag ? this.args.shareUrl : this.args.value && this.args.value != null ? this.args.value : '';
        let urlStrPre = this.args.selfHostFLag ? this.args.shareUrlHost : '';
        temValue = `${urlStrPre}${urlStr}`;

        if(this.args.shareUrl) {

            try {

                let canvasID = `selfCanvas${this.args.id}`;
                canvas = document.getElementById(canvasID);
                let self = this;

                if(this.args.needLogo) {

                  let finalLogo = '';
                  if (this.args.logoOrigin == 'imgSelf') {
                    finalLogo = this.args.logoUrl;
                  } else {
                    
                    if(this.args.logoUrl != '') {
                      finalLogo = `${this.baseImgUrl}/files-download/${this.args.logoUrl}`;
                    }

                  }

                  QrCodeWithLogo.toCanvas({
                    canvas: canvas,
                    content: temValue,
                    logo: {
                      src: finalLogo,
                      logoRadius: self.args.logoRadius,
                      logoSize: self.args.logoSize,
                      bgColor: self.args.logoBackColor || 'transparent'
                    }
                  })

                } else {

                  QrCodeWithLogo.toCanvas({
                    canvas: canvas,
                    content: temValue
                  })

                }

                // QRCode.toCanvas(canvas, temValue, (error) => {
                //   console.log(arguments)
                //     if (error) {
                //         console.log(error)
                //     } else {
                //         console.log('success')
                //     }
                // })


            } catch (error) {
                
            }

        }

    },

    switchHost(status) {

      console.log(status, this.args.shareUrlHost == '')
      if(status) {

        if(this.args.shareUrlHost == '') {
          this.args.shareUrlHost = `${Config.protocol}//${host}/${Config.baseMobileRouteName}`;
        }

      }

    },

    freshCode() {

      if(this.args.shareUrl == '' && this.args.label == '') {
        this.$Message.warning('请先设定字符串');
      } else {
        this.drawCode();
      }

    }

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
.QRcode {
    margin: 0 auto;
}
.QRcode canvas {
    width: 100% !important;
    height: 100% !important;
}
.QRcode img {
    width: 100%;
    height: 100%;
}
</style>
