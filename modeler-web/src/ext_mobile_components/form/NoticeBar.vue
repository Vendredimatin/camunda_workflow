<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
          <template v-if="!args.multi">
            <span :style="{'min-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                }">
                <van-notice-bar 
                :color="args.ctxt_fontColor" 
                :background="args.ctxt_bgColor"
                :scrollable="args.scrollable && reScoll"
                :wrapable="args.wrapable"
                :speed="args.speed"
                :style="{'min-height': arg_height}"
                > 
                  <template slot="default">
                      <div :class="args.wrapable?'':'van-ellipsis'" 
                      :style="{
                        'width': '100%',
                        'word-break': 'break-all',
                        'word-wrap': 'break-word',
                        'color': args.ctxt_fontColor, 
                        'line-height': args_fsize,
                        'font-size': args_fsize,}">
                        {{ value }}</div>
                  </template>
                  <template slot='left-icon' >
                      <van-icon v-show="args.prefixIcon != ''&&args.prefixIcon!=undefined" :name="args.prefixIcon" :size="this.args.fsize + this.args.fsizeType" :color="args.ctxt_fontColor" :style="{'line-height': 'inherit','padding-right':'5px'}" />
                  </template>
                  <template slot="right-icon">
                    <van-icon v-show="args.mode=='closeable'" name='cross'/>
                    <van-icon v-show="args.mode=='link' " name='arrow' />
                  </template>
                </van-notice-bar>
            </span>
          </template>
          <template v-else>
            <span :style="{'min-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                }">
                <van-notice-bar 
                :color="args.ctxt_fontColor" 
                :background="args.ctxt_bgColor"
                :scrollable="false"
                :wrapable="false"
                :style="{'min-height': arg_height}"
                >
                  <template slot="default">
                    <van-swipe
                      ref="swipe"
                      v-if="args.static && reloadSwipe"
                      vertical
                      :autoplay="args.verticalSpeed*1000"
                      :show-indicators="false"
                      :style="{'height': arg_height,'line-height': arg_height,'color': args.ctxt_fontColor, 'font-size': args_fsize,}"
                    >
                      <van-swipe-item  class="van-ellipsis" :style="{'font-size': args_fsize,}"
                       v-for="(item, index) in args.messageList" :key="index">
                        {{item.message}}</van-swipe-item>
                    </van-swipe>
                    <van-swipe
                      v-else-if="reloadSwipe"
                      ref="swipe"
                      vertical
                      :autoplay="args.verticalSpeed*1000"
                      :show-indicators="false"
                      :style="{'height': arg_height,'line-height': arg_height,'color': args.ctxt_fontColor, 'font-size': args_fsize,}"
                    >
                      <van-swipe-item  class="van-ellipsis" :style="{'font-size': args_fsize,}"
                       v-for="(item, index) in tmpMessageList" :key="index">
                        {{item.message}}</van-swipe-item>
                    </van-swipe>
                  </template>
                  <template slot='left-icon' >
                      <van-icon v-show="args.prefixIcon != ''&&args.prefixIcon!=undefined" :name="args.prefixIcon" :size="this.args.fsize + this.args.fsizeType" :color="args.ctxt_fontColor" :style="{'line-height': 'inherit','padding-right':'5px'}" />
                  </template>
                  <template slot="right-icon">
                    <van-icon v-show="args.mode=='closeable'" name='cross'/>
                    <van-icon v-show="args.mode=='link' " name='arrow' />
                  </template>
                </van-notice-bar>
            </span>
          </template>
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
                          <!-- <Row class="margin1">
                            <Col span="10">
                                <span style="font-size: 12px;font-weight: 500;">消息内容</span>
                            </Col>
                            <Col span="14" style="text-align: right;">
                                <Button type="text" size="small" @click="addBindAttr" style="font-weight: 500;">
                                  <span style="font-size: 12px;">添加属性</span>
                                  <Icon type="md-add"></Icon>
                                </Button>
                            </Col>
                          </Row>
                            <div class="margin1" v-for="(item, index) in args.bindAttrList" :key="index">
                                <Row class="item-head margin1">
                                  <Col span="10">
                                      <span style="font-size: 12px;">属性 {{ index+1 }}</span>
                                  </Col>
                                  <Col span="14" style="text-align: right;">
                                      <Button type="text" size="small" @click="delBindAttr(index)">
                                        <Icon type="md-close"></Icon>
                                      </Button>
                                  </Col>
                                </Row>
                                <Select v-model="item.attr" filterable clearable>
                                    <OptionGroup v-for="group in groupAttrList" :label="group.groupName" :key="group.groupName">
                                    <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                        <span>{{ item.displayName }}</span>
                                        <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                                    </Option>
                                    </OptionGroup>
                                </Select>
                            </div> -->
                            <p class="margin1">消息内容</p>

                            <Input class="margin1" 
                            @on-focus="showAttrFormat"
                            v-model="args.formatMessage"/>
                            <AttrFormat
                                    :args="args"
                                    :itemValue="itemValue"
                                    :refClass="args.bindTargetClass"
                                    :targetClass="args.targetClass"
                                    ref="attrformat_modal"
                                    :root="root"
                                    :store="store"
                                    @generatorFinallAttrFormat="getFinallFormat"
                                    >
                            </AttrFormat>
                        <p class="margin1">头部图标</p>
                        <Select v-model="args.prefixIcon" filterable clearable>
                          <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                            <van-icon :name="`${item.value}`" size=20></van-icon>
                            <span style="float:right;color:#ccc">{{ item.label }}</span>
                          </Option>
                        </Select>
                        <p class="margin1">通知栏模式</p>
                        <Select v-model="args.mode" filterable clearable>
                          <Option v-for="item in modeList" :value="item.value" :key="item.value" :label="item.value">
                            <van-icon :name="`${item.label}`" size=20></van-icon>
                            <span style="float:right;color:#ccc">{{ item.value }}</span>
                          </Option>
                        </Select>
                        <div v-if="!args.multi">
                          <p class="margin1">滚动速率</p>
                          <Input class="margin1" @on-change="checkMaxValue" v-model="args.speed" type="number">
                            <span slot="append">px/s</span>
                          </Input>

                          <div class="margin1" style="margin: 10px 0 10px 0">
                            换行展示
                            <i-switch style="float: right" :disabled="args.scrollable" v-model="args.wrapable"/>
                          </div>
                          
                          <div class="margin1" style="margin: 10px 0 10px 0">
                            滚动模式
                            <i-switch style="float: right" v-model="args.scrollable"/>
                          </div>
                        </div>
                        <div v-else>
                          <p class="margin1">滚动间隔</p>
                          <Input class="margin1" @on-change="checkVerticalSpeed" v-model="args.verticalSpeed" type="number">
                            <span slot="append">s</span>
                          </Input>
                          <div v-if="args.static">
                            <Row class="margin1">
                              <Col span="10">
                                  <span style="font-size: 12px;font-weight: 500;">消息设置</span>
                              </Col>
                              <Col span="14" style="text-align: right;">
                                  <Button type="text" size="small" @click="addMessage" style="font-weight: 500;">
                                    <span style="font-size: 12px;">添加项</span>
                                    <Icon type="md-add"></Icon>
                                  </Button>
                              </Col>
                            </Row>
                            <div class="margin1" v-for="(item, index) in args.messageList" :key="index">
                                <Row class="item-head margin1">
                                  <Col span="10">
                                      <span style="font-size: 12px;">通知{{ index+1 }}</span>
                                  </Col>
                                  <Col span="14" style="text-align: right;">
                                      <Button type="text" size="small" @click="delMessage(index)">
                                        <Icon type="md-close"></Icon>
                                      </Button>
                                  </Col>
                                </Row>
                                <Input class="margin1" v-model="item.message" maxlength="100" type="textarea" :rows="1" show-word-limit />
                            </div>
                          </div>

                          <div class="margin1" style="margin: 10px 0 10px 0">
                            静态消息展示
                            <i-switch style="float: right" v-model="args.static"/>
                          </div>
                        </div>
                        <Button type="primary" @click="freshData">更新预览</Button>
                        <div class="margin1" style="margin: 10px 0 10px 0">
                          多消息展示
                          <i-switch style="float: right" v-model="args.multi" />
                        </div>

                    </div>
                    <div slot="layout">
                      <div class="margin1" style="margin: 10px 0 10px 0">
                        内容字体颜色
                        <ColorPicker v-model="args.ctxt_fontColor"/>
                      </div>
                      <div class="margin1" style="margin: 10px 0 10px 0">
                        背景颜色
                        <ColorPicker v-model="args.ctxt_bgColor" alpha/>
                      </div>
                        <!-- <div class="margin1" style="margin: 10px 0 10px 0">
                          固定顶部
                          <i-switch style="float: right" v-model="args.topfix"/>
                        </div> -->
                    </div>
                    <div slot="operation">
                    </div>
                </EditBox>
            </span>
        </section>
        <section v-else :addinName="name" style="text-align: center">
            <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe624;</i>
                </div>
                <div class="form-addin-name">
                    通知栏
                </div>
            </span>
        </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import EditBox from "@/ext_components/form/_EditBox.vue"
import "@/styles/component/iconfont.css";
import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
import vantIconData from "@/views/functional-model/components/vantIcon.js";
import AttrFormat from "./subcomponents/AttrFormat.vue";

const name = "NoticeBar";
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
    AttrFormat
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
      reloadSwipe: true,

      iconList: [],
      modeList: [{
        label:'cross',
        value: 'closeable'
      },{
        label:'arrow',
        value: 'link'
      }],
      args: {
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '通知栏',
        id: null,
        size: "default",
        type: "text",
        hided: false,
        icon: "",
        value: "",
        prefixIcon: 'volume-o',   // 头部图标
        // 属性插件所需属性
        // name: "",
        // targetDataType: null,
        // defaultMessage: '通知',
        height: 44,
        heightType: "px",
        width: 100,
        widthType: '%',
        ctxt_fontColor: "#ed6a0c", // 内容文字颜色
        ctxt_bgColor: '#fffbe8',              // 输入框背景颜色
        fsize: 14, // 内容文字大小
        fsizeType: "px", // 内容文字大小单位
        col: true,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ["点击"],
        mode:'',
        wrapable:false,
        scrollable: true,
        speed: 50,
        verticalSpeed: 3,
        multi: false,
        messageList: [
          {
            message: '通知1'
          }, {
            message: '通知2'
          }],
        topfix: true,
        bindTargetClass:'',
        static: false,
        bindAttrList:[],
        formatMessage: '通知',
        targetClass:'',
        singleMode: true,
        // filterQuery: '',
      },
      groupAttrList: [],
      times: 0,

      // 支持的数据类型
      dataTypes: ['String',"UUID",],

      // 对齐方式,布局插件使用
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

      timer: null,

      value:'通知',
      reScoll: true,
      tmpMessageList:[
        {
          message: '通知1'
        }, {
          message: '通知2'
        }],
    };
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    console.log('color', this.args.ctxt_fontColor )
    this.args = this.setBasicArgs(this.args);
    // this.args.ctxt_fontColor = '#ed6a0c'
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

        // 缺省绑定类为当前表单目标类
        if(!this.args.clearClass && this.args.bindTargetClass == '') {
          if(this.itemValue.data.isRelation) {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
          } else {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
          }
        }
        this.args.targetClass = this.itemValue.data.targetClass;
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    if (this.t_preview) {
      this.iconList = vantIconData;
      this.$nextTick(() => {
        this.setInheritStyle();
        this.setHeight();

        if(this.args.bindAttrList.length > 0) {
          this.freshData();
        }
      })
    }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
      arg_height(val) {
        this.setHeight();
      },
      async arg_bindClass(val) {
        
        if(val != undefined && val != '' && val != 'undefined') {
          
          let curClass = val.split('&')[0];
          let curType = val.split('&')[1];
          console.log(curClass, this.args.targetClass, '..')
          if (curClass != this.args.targetClass) {
            // this.args.multi = true
            this.args.singleMode = false
          }
          else this.args.singleMode = true;

          this.groupAttrList = [];

          if(curType == 'e') {

            await this.queryEntity(curClass);
            let enTypeAttr = this.EntityAttrList(curClass);

            let sysAttr = {
              groupName: '系统属性',
              groupType: '',
              attrList: enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1)
            };
            let selfAttr = {
              groupName: '类属性',
              groupType: '',
              attrList: enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1)
            };

            this.groupAttrList.push(sysAttr, selfAttr);

          } else {

            await this.queryRelation(curClass);
            let reTypeAttr = this.RelationAttrList(curClass);

            let reClass = this.Relations(curClass);
            if('leftClass' in reClass) {
              await this.queryEntity(reClass.leftClass);
            }
            if('rightClass' in reClass) {
              await this.queryEntity(reClass.rightClass);
            }

            this.args.lEnClass = reClass.leftClass;
            this.args.rEnClass = reClass.rightClass;
            let reTypeLAttr = this.EntityAttrList(reClass.leftClass);
            let reTypeRAttr = this.EntityAttrList(reClass.rightClass);

            let groupReItem = {
              groupName: '关联类',
              groupType: 'relation_',
              attrList: reTypeAttr
            }
            let groupLItem = {
              groupName: '左实体类',
              groupType: 'left_',
              attrList: reTypeLAttr
            }
            let groupRItem = {
              groupName: '右实体类',
              groupType: 'right_',
              attrList: reTypeRAttr
            }

            let sysReAttr = {
              groupName: '关联类系统属性',
              groupType: 'relation_',
              attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1)
            };
            let selfReAttr = {
              groupName: '关联类类属性',
              groupType: 'relation_',
              attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1)
            };

            this.groupAttrList.push(sysReAttr, selfReAttr, groupLItem, groupRItem);

          }


          // console.log(this.groupAttrList)
        }

      }
      // end
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
      labelWidth() {
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      },
      mainWidth() {
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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
      mainYAlign() {
          let x = this.args.main_align % 3;
          if (x == 0) return "top";
          else if (x == 1) return "middle";
          else return "bottom";
      },
      // 文本内容字体大小
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
      },
      args_fcolor() {
        return this.args.ctxt_fontColor;
      },
      // 标签文本内容字体大小
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      filter_attributes() {
          return this.attributes ? ( this.relation ?
              [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
              this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
              this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
      },
      // end
      arg_bindClass() {
        return this.args.bindTargetClass;
      },
  },
  methods: {
    ...mapActions("DWF_form", [
        "handleQueryData",
        "queryEntity",
        "queryRelation"
    ]),
    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      if (this.args.multi) {
        this.reloadSwipe = false;
        setTimeout(() => {
          
          this.reloadSwipe = true;
        },10);

      }
      return;
    },
    getValue() {
      return this.args.value;
    },
    setInheritStyle() {
      
    },
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
      console.log('set args',args.ctxt_fontColor)
      for (var i in args) {
        this.args[i] = args[i];
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
    sortMesList() {
      this.args.messageList = this.args.messageList.map((m, ind) => {
        return m = {message: `通知${ind + 1}`}
      })
    },
    addMessage() {
      if (this.args.messageList && this.args.messageList.length >= 10) {
        this.$Message.warning("最多添加10条消息哦");
        return
      }
      this.args.messageList.push({
            message: `通知${this.args.messageList.length + 1}`
      });
    },
    // 删除步骤项
    delMessage(ind) {
      
      this.args.messageList.splice(ind, 1);
      // this.sortMesList();
      console.log(this.args.messageList)

    },
    addBindAttr() {
      if (this.args.bindAttrList && this.args.bindAttrList.length >= 5) {
        this.$Message.warning("最多添加5个属性哦");
        return
      }
      this.args.bindAttrList.push({
        attr: '',
      })
      console.log(this.args.bindAttrList)
    },
    delBindAttr(ind) {
      this.args.bindAttrList.splice(ind, 1);
    },
    showAttrFormat() {
      console.log('show attr fomrt', this.args.bindTargetClass)
        if (this.args.bindTargetClass) {
          if(this.args.bindTargetClass.split('&')[1] == 'e') {

            let finClass = this.isExEn === true ? 'ex_en' : 'en';
            this.$refs.attrformat_modal.initModal(this.args.formatMessage,this.args.bindAttrList, this.args.bindTargetClass.split('&')[0], '', finClass);
          } else {
            this.$refs.attrformat_modal.initModal(this.args.formatMessage,this.args.bindAttrList, this.args.bindTargetClass.split('&')[0], '', 're');
          }

        } else {
          this.$refs.attrformat_modal.initModal(this.args.formatMessage,this.args.bindAttrList, '');
        }

    },
    getFinallFormat(formatMessage,bindAttrList) {
      this.args.formatMessage = formatMessage;
      this.args.bindAttrList = bindAttrList;
      console.log('finall format',this.args.formatMessage, this.args.bindAttrList)
      
    },
    checkMaxValue(e) {
      if (this.args.speed > 1000) {
        this.$nextTick(() => {
          this.args.speed = 1000
        })
      }
    },
    checkVerticalSpeed(e) {
      if (this.args.verticalSpeed > 100000) {
        this.$nextTick(() => {
          this.args.verticalSpeed = 100000
        })

      }
    },
    // 刷新
    async freshData(queryStr) {
      if (this.args.multi && this.args.static) return
      console.log('fresh')
      this.reScoll = false;
      
      let className = this.args.bindTargetClass;
      if(className != undefined && className != '') {
        
          let curClass = className.split('&')[0];
          let curType = className.split('&')[1];

          let queryObj = {}
          if(curType == 'e') {

              queryObj['targetClass'] = curClass;
              queryObj['query'] = {
                startIndex: 0,
                pageSize: 3,
                condition: queryStr
              };

              // await this.queryEntity(curClass);

          } else {

              queryObj = {
                  query: {
                    startIndex: 0,
                    pageSize: 3,
                    condition: queryStr,
                    type: 'relation'
                  },
                  relationClass: curClass,
                  leftClass: this.args.lEnClass,
                  rightClass: this.args.rEnClass,
                  fresh: true
              };

          }

          let objs = await this.handleQueryData(queryObj);
          let that = this;
          if(objs) {
            if (that.args.bindAttrList && that.args.bindAttrList.length > 0 ) {
              console.log(that.args.bindAttrList, objs)
              if (this.args.multi) {
                that.tmpMessageList = objs.map(o => {
                  
                  // if (!that.args.formatMessage) that.args.formatMessage = '';
                  let valuestr = that.args.formatMessage;
                  // console.log(o, that.args.bindAttrList)
                  for (let i = 0; i < that.args.bindAttrList.length;  i ++) {
                    let att = that.args.bindAttrList[i]
                    if (!att || !att.attr) continue;
                    let id = att.id;
                    att = att.attr
                    // console.log(att)
                    valuestr = valuestr.replace(new RegExp(`<${id}>`,'g'), o && att && att!=''?o[att]?o[att]:'':'')
                  }
                  // console.log(valuestr)
                  o['message'] = valuestr;
                  return o
  
                })
                console.log(this.tmpMessageList)
              }
              else {
                let o = objs[0];
                // if (!that.args.formatMessage) that.args.formatMessage = '';
                let valuestr = that.args.formatMessage;
                // console.log(o, that.args.bindAttrList)
                for (let i = 0; i < that.args.bindAttrList.length;  i ++) {
                  let att = that.args.bindAttrList[i]
                  if (!att || !att.attr) continue;
                  let id = att.id;
                  att = att.attr
                  // console.log(att)
                  valuestr = valuestr.replace(new RegExp(`<${id}>`,'g'), o && att && att!=''?o[att]?o[att]:'':'')
                }
                console.log(valuestr)
                this.value = valuestr
              }
            }
            else {
              if (this.args.multi) {
                this.tmpMessageList = [{
                  message: that.args.formatMessage
                },{
                  message: that.args.formatMessage
                }]
              }
              else {
                this.value = that.args.formatMessage
              }
            }
            setTimeout(() => {
              this.reScoll = true;
            }, 10)
          }

      }

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
