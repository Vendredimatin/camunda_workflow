<template>
  <!-- 附件 -->
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
    <template v-if="args.structural_layout === 'horizontal'">
      <!--
        标签, 一般的属性插件都有,如文本框
        对于不需要的插件,可以删去,如附件控件,图片控件,也可以将label设为空
      -->
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
        <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
            <span v-if="args.required" style="color: red">*</span>
            <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
        </span>
    </span>
      <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
        'text-align': mainXAlign, 'color': args.main_fontColor}">
        <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
          <div v-if="!args.readonly"
               :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block'}">
              <!-- 如果允许上传显示上传控件 -->
              <div :style="{'line-height': arg_height, 'display': 'inline'}">
                <Button v-on:click.stop="function(){}" icon="ios-cloud-upload-outline">上传</Button>
              </div>
          </div>    <!-- 如果不允许上传显示默认图片 -->
          <span v-else
                :style="{'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}">
                <span :style="{'width': '100%', 'display': 'inline-block'}">
                  暂无
                </span>
          </span>
        </span>
      </span>
    </template>
    <template v-else>
      <!--
        标签, 一般的属性插件都有,如文本框
        对于不需要的插件,可以删去,如附件控件,图片控件,也可以将label设为空
      -->
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
        <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
            <span v-if="args.required" style="color: red">*</span>
            <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
        </span>
    </span>
      <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
        'text-align': mainXAlign, 'color': args.main_fontColor}">
        <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
          <div v-if="!args.readonly"
               :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block'}">
              <!-- 如果允许上传显示上传控件 -->
              <div :style="{'line-height': arg_height, 'display': 'inline'}">
                <Button v-on:click.stop="function(){}" icon="ios-cloud-upload-outline">上传</Button>
              </div>
          </div>    <!-- 如果不允许上传显示默认图片 -->
          <span v-else
                :style="{'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}">
                <span :style="{'width': '100%', 'display': 'inline-block'}">
                  暂无
                </span>
          </span>
        </span>
      </span>
    </template>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                     :attributes="filter_attributes"
                     :router="router"
                     :route="route"
                     :root="root"
                     :query_oprs="query_oprs"
                     :dataTypes="dataTypes"
                     :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                  <p class="margin1">显示方式</p>
                  <Select class="margin1" v-model="args.type" @on-change="typeChange">
                        <Option v-for="item in candidate_types" :key="item.type" :value="item.type">{{ item.displayName }}</Option>
                  </Select>
                  <p class="margin1">后缀名</p>
                  <Input class="margin1" v-model="args.allowType"></Input>
                  <div v-show="args.targetDataType == 'String'">
                    <p class="margin1">资源前缀</p>
                    <Input class="margin1" v-model="args.sourceHost"></Input>
                  </div>
                  <div v-if="args.type == 'image'">
                  <p class="margin1">拉伸选项</p>
                  <Select class="margin1" v-model="args.picture.resize">
                        <Option v-for="item in pic_resize_types" :key="item.type" :value="item.type">{{ item.displayName }}</Option>
                  </Select>
                  </div>
                </div>
                <div slot="layout">

                </div>
                <div slot="operation">
                </div>
            </EditBox>
    </span>
  </section>
  <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe656;</i>
            </div>
                <div class="form-addin-name">
                    附件
                </div>
          <!--            <Tooltip class="form-addin-name" content="附件" style="width:100%;" :transfer="true">附件</Tooltip>-->
        </span>
  </section>
</template>

<script>
  import "@/styles/component/iconfont.css";
  import {delObjAttr} from "@/api/others.js";
  import EditBox from "./_EditBox.vue"

  const name = "Attachments";

  export default {
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      ;
    },
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],

    components: {
      EditBox
    },

    data() {
      return {
        times: 0,
        timer: null,
        // 插件名
        name: name,
        // 展示模式
        t_preview: true,
        t_icon: true,
        t_edit: false,

      actEdit: false,
      args: {
          name: "",                   // 目标属性
          label: "",                  // 标签名称
          id: "",                     // 控件代号,一般为必须
          height: 30,                 // 整体高度
          heightType: "px",           // 整体高度单位
          label_align: 4,             // 标签区域对齐方式,0-8,默认为4居中对齐
          label_fontType: "",         // 标签字体
          label_fontSize: 14,         // 标签字号
          label_fontColor: "initial", // 标签字体颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          width: 100,
          widthType: '%',
          main_align: 4,              // 主区域对齐方式,默认为4居中对齐
          main_fontType: "",          // 主区域字体
          main_fontSize: 14,          // 主区域字号
          main_fontColor: "#000000",  // 主区域字体颜色
          main_color: "#ffffff",      // 主区域背景颜色
          label_width: 2,
          main_width: 3,              // 标签与主区域的占比为 label_width : main_width
          required: false,            // 是否必填
          readonly: false,            // 是否只读
          hided: false,               // 是否隐藏
          allowType: '',
          sourceHost: '',             // 资源前缀

          // 以下为不在属性编辑框中设置,但默认要有的配置项
          title: "上传文件",               // 插件中文名,需要填入默认值
          col: true,                  // 是否不占满全部
          cols: 3,                    // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null,       // 目标数据类型
          // events: [],                 // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: [],             // 支持的事件列表,元素为事件中文名
          // 自定义
          type: "file",

          picture: {
            resize: "fill"
          },
          events: [],
          eventRange: ["值变化"],
          structural_layout: 'horizontal'   //整体布局
        },

        // 支持的数据类型
        dataTypes: ['String', 'LocalFile'],

        // 继承属性
        inherit: [],

        // 表单项名
        args_name: "",

        // 属性map
        attrMap: {},
        image_exists: false,
        uploadUrl: null,
        randomValue: 0,
        thisObj: null,
        overImg: false,
        overDelButton: false,

        candidate_types: [
          {
            type: "image",
            displayName: "图片"
          },
          {
            type: "file",
            displayName: "文件"
          },
          {
            type: "video",
            displayName: "视频"
          },
          {
            type: "audio",
            displayName: "音频"
          }
        ],

        pic_resize_types: [
          {
            type: "fill",
            displayName: "拉伸"
          },
          {
            type: "scale",
            displayName: "保留比例"
          }
        ]
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
    },
    // 生命周期函数，在dom元素生成之后调用
    mounted() {
      if (this.t_preview) {
        if (!this.args.label) {
          setTimeout(() => {
            this.args.label = '';
          }, 0)
        }
      }
      // this.setHeight();
    },
    watch: {
      arg_name(val) {
        if (this.attributes) {
          if (this.relation) {
            this.attributes[1].forEach(x => this.attrMap['relation_' + x.attributeName] = x);
            this.attributes[2].forEach(x => this.attrMap['left_' + x.attributeName] = x);
            this.attributes[3].forEach(x => this.attrMap['right_' + x.attributeName] = x);
          } else {
            this.attributes.forEach(x => this.attrMap[x.attributeName] = x)
          }
        }
        if (val in this.attrMap) {
          this.args.targetDataType = this.attrMap[val].valueType;
          if (this.relation) {
            if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
            if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
            if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
          } else this.args.label = this.attrMap[val].displayName;
        } else this.args.targetDataType = null;
      },
    },
    computed: {
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      arg_height() {
        return this.args.height == '0' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
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
      // 需要用到实体类属性列表时使用
      arg_name() {
        return this.args.name;
      },
      filter_attributes() {
        return this.attributes ? (this.relation ?
          ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
      },
      // end
    },
    methods: {
      setHeight() {
        return;
        // if (!this.$refs.main) return;
        // let that = this;
        // this.timer = setInterval(() => {
        //   if (!that.$refs.main) {
        //     clearInterval(that.timer);
        //     that.timer = null;
        //     return;
        //   }
        //   // 改成你需要的样式
        //   var dom = that.$refs.main.querySelector(".i-input .ivu-input");
        //   if (dom) {
        //     dom.style.height = that.arg_height + "px";
        //     clearInterval(that.timer);
        //     that.timer = null;
        //   }
        //   that.times += 30;
        //   if (that.times > 60 * 1000) {
        //     clearInterval(that.timer);
        //     that.timer = null;
        //   }
        // }, 30);
      },
      getEditBoxComponent() {
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
        delete this.args['txt_bgColor'];
        delete this.args['txt_fontColor'];
        delete this.args['fsize'];
        delete this.args['dynamic'];
        if(!'eventRange' in this.args || this.args.eventRange.length == 0) {
          this.args['events'] = [];
          this.args['eventRange'] = ["值变化"];
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
        this.t_preview = type == 0;
        return this;
      },
      getDataType(args) {
        return this.dataTypes;
      },
      typeChange(type){
        // switch (type){
        //   case 'video':
        //     this.args.allowType = 'mp4,webm,ogg,ogv,mkv';
        //   break;
        //   default:
        //     this.args.allowType = '';
        //   break;
        // }
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
</style>
