<template>
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
    <template v-if="args.align == 'Horizontal'">
      <span v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
          <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize, 'font-weight': 'normal'}">{{ args.label }}</label>
          </span>
      </span>
        <span :style="{'width': mainWidth, 'display': 'inline-block',
            'height': arg_height,  
            'background-color': args.back_color, 
            'backgroundImage': arg_bgPic,
            'backgroundSize': args.bgSize,
            'backgroundRepeat': args.bgRepeat,
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{
            'line-height': arg_lineHeight,}">
                <van-badge :dot="args.showBadge && args.badge_type=='dot'" :content="arg_content" :max="args.badge_max" :color="args.badge_color" :style="{'vertical-align': 'middle'}">
                    <template slot='content' v-if="args.badge_type=='icon'" >
                      <van-icon :name="args.badge_icon" class="badge-icon" />
                    </template>
                  <van-icon v-show="args.iconPosition == '上'" :name="args.iconType" :size="args_isize" :color="args.icon_fontColor" :style="{'margin-bottom': `${args.margin}px`}" />
                  <p :style="{
                    'display': 'flex',
                    'justify-content': mainFXAlign,
                    'align-content': 'center',
                    'color': args.main_fontColor}">
                      <!-- <p :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'line-height': arg_height,'display': 'inline-block'}"> -->
                        <van-icon v-show="args.iconPosition == '左' && args.iconType !='' &&args.iconType !=undefined" :name="args.iconType" :size="args_isize" :color="args.icon_fontColor" :style="{'height': arg_height,'lineHeight': arg_lineHeight,'margin-right': `${args.margin}px`}" />
                        <label class="msize" :style="{'font-size': args_fsize, 
                        'color': args.txt_fontColor,
                        'font-style': args.italic?'italic':'normal',
                        'font-weight': args.bold?'bold': 'normal'
                        }">{{ args.text }}</label>
                        <van-icon v-show="args.iconPosition == '右'" :name="args.iconType" :size="args_isize" :color="args.icon_fontColor" :style="{'height': arg_height,'lineHeight': arg_lineHeight,'margin-left': `${args.margin}px`}" />
                      <!-- </p> -->
                    </p>
                    <van-icon v-show="args.iconPosition == '下'" :name="args.iconType" :size="args_isize" :color="args.icon_fontColor" :style="{'margin-top': `${args.margin}px`}" />
                </van-badge>
              </span>
        </span>
    </template>
    <template v-else>
      <div v-if="args.label" :style="{ 'display': 'flex',
      'text-align': labelXAlign, 'align-items': labelYAlignFlex}">
        <div :style="{'width': '100%'}">
          <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize, 'font-weight': 'normal'}">{{ args.label }}</label>
          </span>
        </div>
      </div>
      <span :style="{'width': '100%', 'display': 'inline-block','vertical-align': 'middle',
          'background-color': args.back_color, 
          'backgroundImage': arg_bgPic,
          'backgroundSize': args.bgSize,
          'backgroundRepeat': args.bgRepeat,
          'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{
          'width': '100%', 
          'line-height': arg_lineHeight,
          'display': 'inline-block', 
          'vertical-align': 'middle'}">
          <van-badge :dot="args.showBadge && args.badge_type=='dot'" :content="arg_content" :max="args.badge_max" :color="args.badge_color" :style="{'vertical-align': 'middle'}">
              <template slot='content' v-if="args.badge_type=='icon'">
                <van-icon :name="args.badge_icon" class="badge-icon" />
              </template>
                <van-icon v-show="args.iconPosition == '上'" :name="args.iconType" :size="args_isize" :color="args.icon_fontColor" :style="{'margin-bottom': `${args.margin}px`, 'font-weight': args.bold?'bold': 'normal'}" />
                <p :style="{
                  'display': 'flex',
                  'justify-content': mainFXAlign,
                  'align-content': 'center',
                  'color': args.main_fontColor}">
                    <!-- <p :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'line-height': arg_height,'display': 'inline-block'}"> -->
                      <van-icon v-show="args.iconPosition == '左' && args.iconType !=''&&args.iconType !=undefined" :name="args.iconType" :size="args_isize" :color="args.icon_fontColor" :style="{'height': arg_height,'lineHeight': arg_lineHeight,'margin-right': `${args.margin}px`}" />
                      <label class="msize" :style="{'font-size': args_fsize, 
                        'font-style': args.italic?'italic':'normal',
                        'font-weight': args.bold?'bold': 'normal','color': args.txt_fontColor}">{{ args.text }}</label>
                      <van-icon v-show="args.iconPosition == '右'" :name="args.iconType" :size="args_isize" :color="args.icon_fontColor" :style="{'height': arg_height,'lineHeight': arg_lineHeight,'margin-left': `${args.margin}px`}" />
                    <!-- </p> -->
                  </p>
                  <van-icon v-show="args.iconPosition == '下'" :name="args.iconType" :size="args_isize" :color="args.icon_fontColor" :style="{'margin-top': `${args.margin}px`}" />
          </van-badge>
          </span>
      </span>
    </template>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
        <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args" :attributes="filter_attributes"
                 :root="root"
                 :itemValue="itemValue"
                 :dataTypes="dataTypes"
                 :targetclass="itemValue.data.targetClass">
            <div slot="attribute">
              <p class="margin1">标签文本</p>
              <Input class="margin1" v-model="args.text" placeholder="Enter something..." type="textarea" :autosize="true" ></Input>
              <p class="margin1" v-show="isTime">标签格式</p>
              <Input class="margin1" v-model="args.formatLabel" v-show="isTime" placeholder="Y-M-D h:m:s" style="width: auto"></Input>
              <div >
                <p class="margin1" v-if="args.showIcon" >默认图标</p>
                <p class="margin1" v-else>图标</p>
                <Select v-model="args.iconType" filterable clearable>
                  <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                    <van-icon :name="`${item.value}`" size=20></van-icon>
                    <span style="float:right;color:#ccc">{{ item.label }}</span>
                  </Option>
                </Select>
              </div>
              <div v-show="args.showIcon">
                <p class="margin1">图标属性映射表</p>
                  <Input
                    class="margin1"
                    type="textarea"
                    :autosize="true"
                    v-model="args.selfOptions"
                    @on-focus="chooseIcon"
                  />
              </div>
              <div class="margin1" style="margin: 10px 0 10px 0">
                图标映射
                <i-switch style="float: right" v-model="args.showIcon"/>
              </div>
            </div>
            <div slot="layout">
              <div class="margin1" style="margin: 10px 0 10px 0">
                粗体
                <i-switch style="float: right" v-model="args.bold"/>
              </div>
              <div class="margin1" style="margin: 10px 0 10px 0">
                斜体
                <i-switch style="float: right" v-model="args.italic"/>
              </div>
              <p class="margin1">文本行高</p>
              <Input class="margin1" v-model="args.lineHeight" type="number">
              <Select v-model="args.lineHeightType" slot="append" style="width: 70px;">
                <Option value="px">px</Option>
                <Option value="vw">vw</Option>
                <Option value="vh">vh</Option>
                <Option value="rem">rem</Option>
              </Select>
            </Input>
              <div class="margin1" style="margin: 10px 0 10px 0">
                图标颜色
                <ColorPicker v-model="args.icon_fontColor"/>
              </div>
              <p class="margin1">图标大小</p>
              <Input class="margin1" v-model="args.isize" type="number">
                <Select v-model="args.isizeType" slot="append" style="width: 70px;">
                  <Option value="px">px</Option>
                  <Option value="rem">rem</Option>
                </Select>
              </Input>
              <p class="margin1">图标位置</p>
               <Select v-model="args.iconPosition">
                  <Option value="上">文字上</Option>
                  <Option value="下">文字下</Option>
                  <Option value="左">文字左</Option>
                  <Option value="右">文字右</Option>
                </Select>
              <p class="margin1">图标与文字间隔</p>
              <InputNumber class="margin1" style="width: 100%" v-model="args.margin" :min="0"/>
              <p class="margin1">布局</p>
              <Select class="margin1" v-model="args.align">
                <Option value="Horizontal">水平</Option>
                <Option value="Vertical">竖直</Option>
              </Select>
            </div>
            <div slot="operation">
            </div>
        </EditBox>
    </span>
    <!-- 自定义图标映射关系弹窗组件 -->
    <IconEditModal v-if="needIcon" ref="icon_modal" @transferIcon="getIconLabel"></IconEditModal>

  </section>
  <section v-else :addinName="name" style="text-align: center">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe619;</i>
            </div>
            <div class="form-addin-name">
                标签
            </div>
        </span>
    </section>
</template>

<script>
  import EditBox from "@/ext_components/form/_EditBox.vue"
  import "@/styles/component/iconfont.css"
  import vantIconData from "@/views/functional-model/components/vantIcon.js";
  import { getFilesById } from "@/api/others";
  import _global from '@/views/global.vue'
  import {mapActions} from "vuex";
  import IconEditModal from "./subcomponents/IconCommonPanel";
  const name = "Label";
  export default {
    // 插件名
    name: name,
    // 属性值传入:
    //  itemValue: 表单对应的Json结构
    //  attributes: 实体类属性
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", 'Message', "relation"],
    components: {
        EditBox,
        IconEditModal
    },
    data() {
      return {
        // 插件名
        name: name,

        // 展示模式
        t_preview: true,
        t_edit: false,

        // 图标地址
        icon_url: "",
        baseUrl: '',
        dataTypes: ["String", "UUID", "Clob", "Boolean", "Date", "TimeStamp", "Integer", "Long", "Double", "LocalFile", "Time"],
        isTime: false,
        // 编辑框

      actEdit: false,
      iconList: [],
      args: {
          dynamic: false,
          label_fontColor: 'initial',//标签文字颜色
          txt_fontColor: 'initial',//内容文字颜色
          label_color: 'initial',
          main_fontColor: 'initial',
          main_color: 'initial',
          title: '标签',
          id: null,
          align: "Horizontal",
          text: "提示信息...",
          label: "",
          name: "",
          hided: false,
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          // 属性插件所需属性
          targetDataType: null,
          formatLabel: '',

          // 布局插件所需属性
          _type: "attribute",
          height: 21,
          heightType: "px",
          width: 100,
          widthType: '%',
          col: false,
          cols: 3,
          lfsize:14,//标签文字大小
          lfsizeType:'px',//标签文字大小单位
          fsize: 14,//内容文字大小
          fsizeType: 'px',//内容文字大小单位
          isizeType: 'px',//内容文字大小单位
          events: [],
          eventRange: ['点击'],
          iconType: '',
          iconPosition: '左',
          lineHeight: 1,
          lineHeightType: 'px',
          imgOrigin: 'imgSelf',
          back_color: "",             // 背景颜色
          back_picture: "",           // 背景图片,超链接
          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,
          margin: 5,
          icon_fontColor: 'initial',//图标颜色
          showBadge: false,
          badge_type: 'dot',
          badge_color: "red",             // 徽标颜色
          badge_max: null,
          badge_content: null,
          badge_icon: '',
          badge_size: '',
          badge_stype: 'px',
          italic: false,
          bold: false,
          badge_atrr:'',
          showIcon: false,
          selfOptions:'',
        },

        queryData: {
          query: "", // 查询条件
          targetClass: "", // 目标类名
          formName: "", //
          uuid: ""
        },
        targetClassObjects: [],

        // 对齐方式,布局插件使用
        alignList: [{
            value: 0,
            name: "左上对齐"
          },
          {
            value: 1,
            name: "靠左对齐"
          },
          {
            value: 2,
            name: "左下对齐"
          },
          {
            value: 3,
            name: "顶部对齐"
          },
          {
            value: 4,
            name: "居中对齐"
          },
          {
            value: 5,
            name: "底部对齐"
          },
          {
            value: 6,
            name: "右上对齐"
          },
          {
            value: 7,
            name: "靠右对齐"
          },
          {
            value: 8,
            name: "右下对齐"
          }
        ],

        badgeTypes: [{
            value: 'dot',
            label: "点"
          },
          {
            value: 'icon',
            label: "图标"
          },
          {
            value: 'number',
            label: "数字"
          },
          {
            value: 'text',
            label: "文本"
          },
        ],
        // 继承属性
        inherit: [],

        // 表单项名
        args_name: "",

        noBgFlag: false,
        // 属性map
        attrMap: {},
        badge_obj: {},
        needIcon: false,
        iconArr: [],
        show_badge_content: '',
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
        this.baseUrl = _global.baseUrl;
        this.iconList = vantIconData;
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

    async mounted() {
      if (this.itemValue.data.targetClass) {
        let queryObj = {}
        if (!this.relation) {
            queryObj['targetClass'] = this.itemValue.data.targetClass;
            queryObj['fresh'] = true;
            queryObj['query'] = {
              startIndex: 0,
              pageSize: 1,
            };
        }
        else {
            queryObj = {
                query: {
                  type: 'relation',
                  startIndex: 0,
                  pageSize: 1
                },
                relationClass: this.itemValue.data.targetClass,
                fresh: true
            };
        }
        let objs = await this.handleQueryData(queryObj);
        this.badge_obj = objs? objs[0] : {}
        console.log(this.badge_obj)
        if (this.badge_obj && this.args.badge_atrr) {
          if((this.args.badge_type=='number'||this.args.badge_type=='text') &&this.args.badge_atrr != '') {
            this.show_badge_content = this.badge_obj[this.args.badge_atrr]
          }
        }
      }
      //this.$refs.main.querySelector(".i-input .ivu-input").style.fontsize = 'inherit';
      //this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
    },
    watch: {
      // 需要用到实体类属性列表时使用
        arg_name(val) {

          if (val in this.attrMap) {
              this.args.targetDataType = this.attrMap[val].valueType;

              if(this.args.targetDataType == "Date" || this.args.targetDataType == "TimeStamp" || this.args.targetDataType == "Time") {
                this.isTime = true;
              } else {
                this.isTime = false;
              }

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
              console.log(attr)
              if (attr && attr.defaultValue) this.args.text = attr.defaultValue;
          } else this.args.targetDataType = null;
        },
        'args.badge_type'(){
          this.changeBadgeSize();
        },
        'args.badge_size'(){
          this.changeBadgeSize();
        },
        'args.badge_stype'() {
          this.changeBadgeSize();
        },
        'args.badge_content'(){
          this.changeBadgeSize();
        },
        'args.badge_atrr'() {
          if (this.badge_obj && this.args.badge_atrr) {
            if((this.args.badge_type=='number'||this.args.badge_type=='text') &&this.args.badge_atrr != '') {
              this.show_badge_content = this.badge_obj[this.args.badge_atrr]
            }
          }
        },
    },
    computed: {
      arg_content() {
        if(this.badge_obj && this.args.badge_atrr) {
          if (this.show_badge_content && this.show_badge_content.length && this.show_badge_content.length > 5) {
            return this.show_badge_content.substring(0,5) +'...'
          }

          return this.show_badge_content;
        }
        if (this.args.badge_content && this.args.badge_content.length && this.args.badge_content.length > 5) {
          return this.args.badge_content.substring(0,5) +'...'
        }
        return this.args.badge_content
      },
        arg_bgPic() {
          let finalBg = '';
          if(this.args.imgOrigin == 'imgSelf') {
              finalBg = `url(${this.args.back_picture})`
          } else {

              // 判断原有背景图片是否已被删除
              if(this.args.back_picture != '') {

                  getFilesById(this.args.back_picture).then(response => {

                      this.noBgFlag = !response.success;

                  }).catch(e => {
                      this.noBgFlag = true;
                      console.log(e);
                  });

              }

              if(this.args.back_picture == '') {
                  finalBg = '';
              } else {
                  if(this.noBgFlag) {
                      finalBg = `url(${noBg})`
                  } else {
                      finalBg = `url(${this.baseUrl}/files-download/${this.args.back_picture})`
                  }
              }
          }
          return finalBg;

      },
      args_isize() {
        return this.args.isize + this.args.isizeType;
      },
      arg_lineHeight() {
        return this.args.lineHeight < 2 && this.args.lineHeightType == 'px' ? 'normal' : this.args.lineHeight + this.args.lineHeightType;
      },
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
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
      labelYAlignFlex(){
        let x = this.args.label_align % 3;
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
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
      mainFXAlign() {
        let x = parseInt(this.args.main_align / 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
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
      // end

      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
    },
    methods: {
    ...mapActions("DWF_form", [
        "handleQueryData",
    ]),

    chooseIcon() {
      console.log(this.needIcon);
      let that = this;
      if (!this.needIcon) {
        this.needIcon = true;

        this.$Spin.show();

        setTimeout(function() {
          that.$Spin.hide();
          that.$refs.icon_modal.editModal(that.iconArr,that.args.selfOptions);
        }, 500);
      } else {
        that.$refs.icon_modal.editModal(that.iconArr,that.args.selfOptions);
      }
    },
   
    /**
     * @description 设置图标映射表
     */
    getIconLabel(data) {
      console.log("getIconLabel",data);
      this.args.selfOptions = data;
      this.args.selfOptions = this.args.selfOptions.replace(/，/gi, ",");
      this.args.selfOptions = this.args.selfOptions.replace(/：/gi, ":");
      if (data.length != 0) {
        let temArr = data.split(",");
        // 映射表
        temArr.forEach(val => {
          let _key = val.split(":")[0];
          let _value = val.split(":")[1];
        });
        // 整理传回图标组件的图标合集
        temArr = temArr.map(x => {
          return x.split(":")[1];
        });
        this.iconArr = temArr;
      } else {
        this.iconArr = [];
      }
      console.log()
    },

    mappingIcon() {
      if (this.args.selfOptions != "") {
        // 中英文逗号替换
        this.args.selfOptions = this.args.selfOptions.replace(/，/gi, ",");
        let optionAttr = this.args.selfOptions.split(",");
        optionAttr.forEach((item, index) => {
          if (item != "") {
            // 中英文冒号替换
            this.args.selfOptions = this.args.selfOptions.replace(/：/gi, ",");
            let optionAttrValue = item.split(":");
            if (optionAttrValue[0] == this.args.text) {
              this.args.iconType = optionAttrValue[1];
            }
          }
        });
      }
      console.log("mappingIcon, value replace:", this.args.text, this.args.iconType);
    },
      changeBadgeSize(){
        console.log('chagne size')
        let that = this;
        setTimeout(function(){
          that.$refs.main.querySelector(".van-badge")? that.$refs.main.querySelector(".van-badge").style.fontSize = that.args.badge_size+that.args.badge_stype:'';
        },0)
      },
      getAllow() {
        return null;
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
        if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      // 获取可继承属性
      getInherit() {
        var res = {};
        let that = this;
        this.inherit.forEach(x => res[x] = that.args[x]);
        return res;
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

      setIcon(id) {
        this.icon_url = id;
        return this;
      },

      getDataType(args) {
        return ['String'];
      },
    }
  }

</script>
<style>
.badge-icon{

  display: block;
}
.van-badge{
  padding: 2px;
}
</style>
<style scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
section {
    display: inline-block;
    width: 100%
}
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
</style>
