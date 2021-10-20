<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
            <span :style="{'height': arg_height, 'min-height': arg_height,'width':'100%','display': 'inline-block', 
                'background-color': args.txt_bgColor,'color': args.main_fontColor}">
                <van-cell
                    :clickable="args.clickable"
                    :style="{'align-items': args.verticalCenter?'center':null,'height': arg_height,'background-color': 'inherit'}"
                >
                  <template slot='icon' v-if="args.prefixIcon != ''&&args.prefixIcon!=undefined">
                      <van-icon :name="args.prefixIcon" :size="this.args.lfsize + this.args.lfsizeType" :color="args.title_fontColor" :style="{'line-height': 'inherit','padding-right':'5px'}" />
                  </template>
                  <template slot='title'>
                      <div :style="{'color': args.title_fontColor, 'font-size': args_lfsize,
                          'overflow': 'hidden',
                          'white-space': 'nowrap',
                          'text-overflow': 'ellipsis',}">{{ arg_title }}</div>
                  </template>
                  <template slot='default'>
                      <div :style="{'color': args.content_fontColor, 'font-size': args_fsize,
                          'overflow': 'hidden',
                          'white-space': 'nowrap',
                          'text-overflow': 'clip',}">
                        {{ arg_content }}</div>
                  </template>
                  <template slot='right-icon' v-if="args.suffixIcon != ''&&args.suffixIcon!=undefined">
                    <van-icon :name="args.suffixIcon" :size="this.args.fsize + this.args.fsizeType"  :color="args.content_fontColor"  :style="{  'line-height': 'inherit','padding-left':'5px'}"/>
                  </template>
                  <template :style="{'padding':'0px','color': args.content_fontColor}" slot='label'>
                      <div :style="{
                        'font-size': args_fsize,
                          'overflow': 'hidden',
                          'white-space': 'nowrap',
                          'text-overflow': 'ellipsis',
                          'color': args.content_fontColor}" >{{ arg_description }}</div>
                  </template>
                </van-cell>
            </span>
          <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
                <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
                    <div slot="attribute">
                        <p class="margin1">标签属性</p>
                        <div style="display: inline-block;width: 100%;">
                          <Select v-model="args.titleAttr" class="editbox-name" filterable clearable >
                            <Option value="-1">自定义</Option>
                              <OptionGroup v-for="group in attrList" :label="group.groupName" :key="group.groupName">
                              <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                  <span>{{ item.displayName }}</span>
                                  <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                              </Option>
                              </OptionGroup>
                          </Select>
                        </div>
                        <Input class="margin1" v-show="args.titleAttr == '-1'" v-model="selfTitleContent" placeholder="自定义输入标签属性"/>

                        <p class="margin1">标签默认名称</p>
                        <Input class="margin1"  v-model="args.titleContent" />
                        <p class="margin1">内容属性</p>
                        <div style="display: inline-block;width: 100%;">
                          <Select v-model="args.contentAttr" class="editbox-name" filterable clearable>
                            <Option value="-1">自定义</Option>
                              <OptionGroup v-for="group in attrList" :label="group.groupName" :key="group.groupName">
                              <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                  <span>{{ item.displayName }}</span>
                                  <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                              </Option>
                              </OptionGroup>
                          </Select>
                        </div>
                        <Input class="margin1" v-show="args.contentAttr == '-1'" v-model="selfAttrName" placeholder="自定义输入内容属性"/>
                        <p class="margin1">内容默认内容</p>
                        <Input class="margin1"  v-model="args.valueContent" />
                        <p class="margin1">描述信息</p>
                        <div style="display: inline-block;width: 100%;">
                          <Select v-model="args.descriptionAttr" class="editbox-name" filterable clearable @on-change="desAction">
                              <OptionGroup v-for="group in attrList" :label="group.groupName" :key="group.groupName">
                              <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                  <span>{{ item.displayName }}</span>
                                  <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                              </Option>
                              </OptionGroup>
                          </Select>
                        </div>
                        <p class="margin1">日期格式</p>
                        <Input class="margin1" v-model="args.formatLabel" placeholder="Y-M-D h:m:s" style="width: auto"></Input>

                        <!-- <p class="margin1">默认描述信息</p>
                        <Input class="margin1" v-model="args.description" placeholder="单元格描述信息"/> -->
                        <p class="margin1">左侧图标</p>
                        <Select v-model="args.prefixIcon" filterable clearable @on-change="changepre">
                          <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                            <van-icon :name="`${item.value}`" size=20></van-icon>
                            <span style="float:right;color:#ccc">{{ item.label }}</span>
                          </Option>
                        </Select>
                        <p class="margin1">右侧图标</p>
                        <Select v-model="args.suffixIcon" filterable clearable @on-change="changesuff">
                          <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                            <van-icon :name="`${item.value}`" size=20></van-icon>
                            <span style="float:right;color:#ccc">{{ item.label }}</span>
                          </Option>
                        </Select>
                        <div class="margin1" style="margin: 10px 0 10px 0">
                          开启点击反馈
                          <i-switch style="float: right" v-model="args.clickable"/>
                        </div>
                    </div>
                    <div slot="layout">

                        <div class="margin1" style="margin: 10px 0 10px 0">
                          标签字体颜色
                          <ColorPicker v-model="args.title_fontColor"/>
                        </div>
                        <div class="margin1" style="margin: 10px 0 10px 0">
                          内容字体颜色
                          <ColorPicker v-model="args.content_fontColor"/>
                        </div>
                        <div class="margin1" style="margin: 10px 0 10px 0">
                          垂直居中
                          <i-switch style="float: right" v-model="args.verticalCenter"/>
                        </div>
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
                    单元格
                </div>
            </span>
        </section>
</template>

<script>
import EditBox from "@/ext_components/form/_EditBox.vue"
import "@/styles/component/iconfont.css";
import vantIconData from "@/views/functional-model/components/vantIcon.js";
import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';

import {mapActions} from "vuex";
const name = "Cell";
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

      iconList: [],
      isTime: false,
      args: {
        clickable: false,
        label_color: 'initial',
        main_fontColor: 'initial',
        main_color: 'initial',
        id: null,
        size: "default",
        hided: false,
        icon: "",
        value: "",
        // label_align: 1,
        // main_align: 4,
        maxAreaRow: 2,
        prefixIcon: '',   // 头部图标
        suffixIcon: 'arrow',   // 尾部图标
        // 属性插件所需属性
        height: 44,
        heightType: "px",
        width: 100,
        widthType: '%',
        // label_fontColor: '#323233',       // 标签文字颜色
        // txt_fontColor: "#969799", // 内容文字颜色
        txt_bgColor: '#fff',              // 输入框背景颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单位
        fsize: 14, // 内容文字大小
        fsizeType: "px", // 内容文字大小单位
        col: true,
        title: "单元格",
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ['点击'],
        titleContent: '单元格',
        valueContent: '内容',
        titleAttr: '',
        titleDataType: '',
        contentAttr: '',
        contentDataType: '',
        descriptionAttr: '',
        descriptionDataType: '',
        description:'',
        title_fontColor: "#323233",
        content_fontColor: "#969799",
        formatLabel: '',
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String',"Integer", "Long", "Double", "Date", "TimeStamp", "Time"],

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

      value: null,
      attrList: [],
      init_obj: {},
      selfTitleContent: '',
      selfAttrName: '',
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
          this.setAttrList();
        }
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  async mounted() {
    if (this.t_preview) {
      this.iconList = vantIconData;
      this.$nextTick(() => {
        this.setInheritStyle();
        this.setHeight();
      })
    }

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
        this.init_obj = objs? objs[0] : {}
        console.log(this.init_obj)
      }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
      arg_height(val) {
        this.setHeight();
      },
      // args_fcolor(val) {
      //   this.$refs.main.querySelector("i").style.color = val;
      // },
      // 需要用到实体类属性列表时使用
      // args_name(val) {
      //     if (val != "-1") {
      //         this.args.name = val;
      //     } else {
      //         // // // // this.args.name = "";
      //     }
      // },
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
              if (attr && attr.valueContent) this.value = attr.valueContent;
          } else this.args.targetDataType = null;
      },
      selfTitleContent(val, old) {
        if (this.args.titleAttr == '-1' && this.args.titleContent == old) this.args.titleContent = val;
      },
      selfAttrName(val, old) {
        if (this.args.contentAttr == '-1' && this.args.valueContent == old) this.args.valueContent = val;
      },
      // end
  },
  computed: {
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
        return this.args.txt_fontColor;
      },
      // 标签文本内容字体大小
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + ' !important';
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
      arg_title() {
        if (this.args.titleAttr && this.args.titleAttr != ''  && this.args.titleAttr != '-1'&& this.init_obj && this.init_obj.oid){
          if (this.args.titleAttr in this.attrMap) {
              this.args.titleDataType = this.attrMap[this.args.titleAttr].valueType;
          }
          return this.formatByType(this.args.titleDataType, this.init_obj[this.args.titleAttr]);
        }
        return this.args.titleContent;
      },
      arg_content() {
        if (this.args.contentAttr && this.args.contentAttr != ''&& this.args.contentAttr != '-1' && this.init_obj && this.init_obj.oid) {
          if (this.args.contentAttr in this.attrMap) {
              this.args.contentDataType = this.attrMap[this.args.contentAttr].valueType;
          }
          return this.formatByType(this.args.contentDataType, this.init_obj[this.args.contentAttr]);
        }
        return this.args.valueContent;
      },
      arg_description(){
        if (this.args.descriptionAttr && this.args.descriptionAttr != '' && this.init_obj && this.init_obj.oid){
          if (this.args.descriptionAttr in this.attrMap) {
              this.args.descriptionDataType = this.attrMap[this.args.descriptionAttr].valueType;
          }
          return this.formatByType(this.args.descriptionDataType,this.init_obj[this.args.descriptionAttr]);
        }
        return this.args.description;
      }
      // end
  },
  methods: {
    ...mapActions("DWF_form", [
        "handleQueryData",
    ]),

    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      return;
    },
    setInheritStyle() {
        // 字体 ／ 颜色 默认继承
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
      console.log('set args', args)
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("label" in args) setTimeout(() => { this.args.label = args.label; }, 300);
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
    desAction() {

      if ((this.args.descriptionAttr != '' && this.args.descriptionAttr) || this.args.description != ''){
        this.args.height = 70;
        this.args.heightType = 'px';
      }
      else {
        this.args.height = 44;
        this.args.heightType = 'px';

      }
    },
    setAttrList() {

          this.groupAttrList = [];

          if(!this.relation && this.attributes) {

            let enTypeAttr = this.attributes

            let sysAttr = {
              groupName: '系统属性',
              groupType: '',
              attrList: enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1 && this.dataTypes.indexOf(item.valueType) > -1),
            };
            let selfAttr = {
              groupName: '类属性',
              groupType: '',
              attrList: enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1 && this.dataTypes.indexOf(item.valueType) > -1),
            };

            this.attrList.push(sysAttr, selfAttr);

          } else if (this.attributes) {

            let reTypeAttr = this.attributes[1];
            let reTypeLAttr = this.attributes[2]
            let reTypeRAttr = this.attributes[3];

            let groupReItem = {
              groupName: '关联类',
              groupType: 'relation_',
              attrList: reTypeAttr.filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            }
            let groupLItem = {
              groupName: '左实体类',
              groupType: 'left_',
              attrList: reTypeLAttr.filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            }
            let groupRItem = {
              groupName: '右实体类',
              groupType: 'right_',
              attrList: reTypeRAttr.filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            }

            let sysReAttr = {
              groupName: '关联类系统属性',
              groupType: 'relation_',
              attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1 && this.dataTypes.indexOf(item.valueType) > -1)
            };
            let selfReAttr = {
              groupName: '关联类类属性',
              groupType: 'relation_',
              attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1 && this.dataTypes.indexOf(item.valueType) > -1)
            };

            this.attrList.push(sysReAttr, selfReAttr, groupLItem, groupRItem);

          }

          console.log(this.attrList)

    },
    changesuff(val) {
      if (!val) {
        this.args.suffixIcon = ''
      }
    },
    changepre(){
      if (!val) {
        this.args.prefixIcon = ''
      }
    },

    formatByType(type, val) {
      if (type == 'Date' || type == 'TimeStamp') {
        if (this.args.formatLabel == '') {
           return this.formatTime(val);
        } else {
            return this.formatTimes(val / 1000, this.args.formatLabel);
        }
      }
      return val;
    },
    addZero(m) {
      return m < 10 ? '0' + m : m
    },

    formatTime(tStamp) {
      var time;
      if (tStamp) {
        time = new Date(tStamp);
      } else {
        time = new Date();
      }
      var y = time.getFullYear();
      var m = time.getMonth() + 1;
      var d = time.getDate();
      var h = time.getHours();
      var mm = time.getMinutes();
      var s = time.getSeconds();
      return y + '-' + this.addZero(m) + '-' + this.addZero(d) + ' ' + this.addZero(h) + ':' + this.addZero(mm) + ':' + this.addZero(s);
    },

    formatTimes(number, format) {

      var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
      var returnArr = [];

      var date = new Date(number * 1000);
      returnArr.push(date.getFullYear());
      returnArr.push(this.formatNumber(date.getMonth() + 1));
      returnArr.push(this.formatNumber(date.getDate()));

      returnArr.push(this.formatNumber(date.getHours()));
      returnArr.push(this.formatNumber(date.getMinutes()));
      returnArr.push(this.formatNumber(date.getSeconds()));

      for (var i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i]);
      }
      return format;
    },

    formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    },
  }
};
</script>
<style>
.van-cell__title {
  width: 80%;
  min-width: 50%;
}
.editbox-name .ivu-select-dropdown,
.editbox-targetClass .ivu-select-dropdown {
  width: 100%!important;
}
</style>

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
