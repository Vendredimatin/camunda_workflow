<template>
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth, 'text-align': mainXAlign}">

    <div :style="{'height': arg_height,
      'lineHeight': arg_lineHeight,
      'backgroundImage': arg_bgPic,
      'backgroundSize': args.bgSize,
      'backgroundRepeat': args.bgRepeat,
      'backgroundColor': args.back_color,
      'width': mainWidth}">

      <Icon v-show="args.iconPosition == '上'" :type="args.iconType" :style="{'font-size': args_isize, 'color': args.icon_fontColor, 'margin-bottom': `${args.margin}px`}" />
      <p :style="{'width': mainWidth,
        'display': 'flex',
        'justify-content': mainFXAlign,
        'align-content': 'center',
        'color': args.main_fontColor}">
          <!-- <p :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'line-height': arg_height,'display': 'inline-block'}"> -->
            <Icon v-show="args.iconPosition == '左'" :type="args.iconType" :style="{'height': arg_height,'lineHeight': arg_lineHeight,'font-size': args_isize, 'color': args.icon_fontColor, 'margin-right': `${args.margin}px`}" />
            <label class="msize" :style="{'font-size': args_fsize, 'color': args.txt_fontColor}">{{ args.text }}</label>
            <Icon v-show="args.iconPosition == '右'" :type="args.iconType" :style="{'height': arg_height,'lineHeight': arg_lineHeight,'font-size': args_isize, 'color': args.icon_fontColor, 'margin-left': `${args.margin}px`}" />
          <!-- </p> -->
        </p>
        <Icon v-show="args.iconPosition == '下'" :type="args.iconType" :style="{'font-size': args_isize, 'color': args.icon_fontColor, 'margin-top': `${args.margin}px`}" />
    </div>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
        <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :root="root"
                :router="router"
                :route="route"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :targetclass="itemValue.data.targetClass">
            <div slot="attribute">
              <p class="margin1">标签文本</p>
              <Input v-model="args.text" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." />
              <p class="margin1">图标</p>
              <Select v-model="args.iconType" filterable clearable>
                <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                  <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                  <span style="float:right;color:#ccc">{{ item.label }}</span>
                </Option>
              </Select>
            </div>
            <div slot="layout">
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
              <Input class="margin1" v-model="args.margin" type="number"></Input>
            </div>
            <div slot="operation">
            </div>
        </EditBox>
    </span>
  </section>
  <section v-else :addinName="name" style="text-align: center">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6c9;</i>
            </div>
            <div class="form-addin-name">
                静态标签
            </div>
        </span>
    </section>
</template>

<script>
  import EditBox from "./_EditBox.vue"
  import _global from '@/views/global.vue'
  import "@/styles/component/iconfont.css"
  import moduleIconData from "@/views/functional-model/components/moduleIcon.js";
  import { getFilesById } from "@/api/others";
  const name = "CompoundLabel";
  export default {
    // 插件名
    name: name,
    // 属性值传入:
    //  itemValue: 表单对应的Json结构
    //  attributes: 实体类属性
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", 'Message', "relation"],
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
        baseUrl: '',
        noBgFlag: false,

        iconList: [], // icon列表

        // 图标地址
        icon_url: "",
        // dataTypes: ["String", "UUID", "Clob", "Boolean", "Date", "TimeStamp", "Integer", "Long", "Double", "LocalFile", "Time"],
        isTime: false,
        // 编辑框

      actEdit: false,
      args: {
          txt_fontColor: 'initial',//内容文字颜色
          icon_fontColor: 'initial',//图标颜色
          label_color: 'initial',
          main_fontColor: 'initial',
          main_color: 'initial',
          title: '静态标签',
          iconType: '',
          iconPosition: '左',
          id: null,
          align: "Horizontal",
          text: "提示信息...",
          hided: false,
          imgOrigin: 'imgSelf',
          back_color: "",             // 背景颜色
          back_picture: "",           // 背景图片,超链接
          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,
        //   label_width: 2,
          main_width: 3,
        //   label_align: 4,
          main_align: 4,
          // 属性插件所需属性
          targetDataType: null,
          formatLabel: '',
          margin: 5,
          // 布局插件所需属性
          _type: "attribute",
          height: 30,
          heightType: "px",
          lineHeight: 30,
          lineHeightType: 'px',
          width: 100,
          widthType: '%',
          col: false,
          cols: 3,
          events: [],
          eventRange: ['点击'],
          fsize: 14,//内容文字大小
          isize: 14,//图标文字大小
          fsizeType: 'px',//内容文字大小单位
          isizeType: 'px',//图标大小单位
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

        // 继承属性
        inherit: [],

        // 表单项名
        args_name: "",

        // 属性map
        attrMap: {}
      }
    },
    inject: [
      'setBasicArgs'
    ],
    created() {
      //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
      this.baseUrl = _global.baseUrl;
      this.iconList = moduleIconData;
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
    },

    mounted() {
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
              if (attr && attr.defaultValue) this.args.text = attr.defaultValue;
          } else this.args.targetDataType = null;
        },
    },
    computed: {
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
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      arg_lineHeight() {
        return this.args.lineHeight < 2 && this.args.lineHeightType == 'px' ? this.args.lineHeight * 30 + "px" : this.args.lineHeight + this.args.lineHeightType;
      },
      mainWidth() {
        return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width +
          this.args.main_width)) + "%";
      },
      mainXAlign() {
        let x = parseInt(this.args.main_align / 3);
        if (x == 0) return "left";
        else if (x == 1) return "center";
        else return "right";
      },
      mainFXAlign() {
        let x = parseInt(this.args.main_align / 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
      },
      args_isize() {
        return this.args.isize + this.args.isizeType + ' !important';
      },

      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
    },
    methods: {

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
        return this;
      },

      // 获取表单项名
      getFormName() {
        return '';
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
