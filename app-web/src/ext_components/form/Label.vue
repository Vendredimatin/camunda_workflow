<template>
  <section :addinName="name" :style="{'width': colWidth}" v-show="!args.hided">
    <template v-if="args.align == 'Horizontal'">
      <span v-if="args.label" :style="{'height': arg_height, 'line-height': arg_height, 'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
          <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <label class="msize ori-color self-color"
                     :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
        <span ref="label" :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'line-height': arg_height, 'display': 'inline-block', 'vertical-align': mainYAlign}">

              <label v-if="!needPop" class="msize ori-color self-color" @mouseover="hoverEvent" :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'cursor': 'pointer'}">{{ parsedLabel }}</label>

              <Poptip v-else trigger="hover" transfer :placement="popHoverDirection" :width="popHoverObj.popWidth">
                <label class="msize ori-color self-color" @mouseover="hoverEvent" :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'cursor': 'pointer'}">{{ parsedLabel }}</label>
                <div v-show="popHoverObj.needPopTitle" slot="title"><span :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                <div slot="content">
                  <FormEngine
                    v-if="!this.isHoverMesPop && popHoverPath"
                    ref="form"
                    :to_path="popHoverPath"
                    :to_query="popHoverQuery"
                    :store="store">
                  </FormEngine>
                  <p v-else>{{ this.popHoverMes }}</p>
                </div>
              </Poptip>

            </span>
        </span>
    </template>
    <template v-else>
      <div v-if="args.label" :style="{'height': arg_height, 'display': 'flex',
      'text-align': labelXAlign, 'align-items': labelYAlignFlex}">
        <div :style="{'width': '100%', 'padding-right': '10px'}">
          <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
        </div>
      </div>
      <div ref="label" :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'line-height': arg_height, 'display': 'inline-block', 'vertical-align': mainYAlign}">

            <label v-if="!needPop" class="msize ori-color self-color" @mouseover="hoverEvent" :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'cursor': 'pointer'}">{{ parsedLabel }}</label>

            <Poptip v-else trigger="hover" transfer :placement="popHoverDirection" :width="popHoverObj.popWidth">
              <label v-if="!needPop" class="msize ori-color self-color" @mouseover="hoverEvent" :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'cursor': 'pointer'}">{{ parsedLabel }}</label>
              <div v-show="popHoverObj.needPopTitle" slot="title"><span :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
              <div slot="content">
                <FormEngine
                  v-if="!this.isHoverMesPop && popHoverPath"
                  ref="form"
                  :to_path="popHoverPath"
                  :to_query="popHoverQuery"
                  :store="store">
                </FormEngine>
                <p v-else>{{ this.popHoverMes }}</p>
              </div>
            </Poptip>

          </span>
      </div>
    </template>
    <span v-show="isWrong && !args.hided"
          :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
  import "@/styles/component/iconfont.css"
  import { getQueryOperation } from "@/api/others";
  import FormEngine from '@/views/form-engine/forms-engine.vue'
  import EntityModeling from "@/api/data-model/EntityModeling";
  import {
    getDate,
    parseEscapeString
  } from '@/libs/utils.js'
  import {mapGetters, mapActions} from 'vuex';

  const name = "Label";
  export default {
    // 插件名
    name: name,
    // 属性值传入:
    //  itemValue: 表单对应的Json结构
    //  attributes: 实体类属性
    //  relations:  关联类,带有属性列表
    //  relation_classes:   被关联的实体类,带有属性列表
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
    ],
    data() {
      return {
        // 插件名
        name: name,

        // 展示模式
        t_create: false,
        t_edit: false,
        t_visit: true,
        needPop: false,
        isHover: null,
        isHoverMesPop: false,      // 脚本定义的浮窗文字
        popHoverMes: '',
        actions: {
          '上边': 'top',
          '上左': 'top-start',
          '上右': 'top-end',
          '右边': 'right',
          '右上': 'right-start',
          '右下': 'right-end',
          '下边': 'bottom',
          '下左': 'bottom-start',
          '下右': 'bottom-end',
          '左边': 'left',
          '左上': 'left-start',
          '左下': 'left-end',
        },
        popHoverObj: {
          needPopTitle: false,
          popTitleTxt: '提示',
          popTitleFs: 14,
          popTitleColor: '#333',
          tipPlacement: 'right',
          popWidth: 400
        },
        popHoverDirection: 'right',
        popHoverPath: '',
        popHoverQuery: {
          query: ''
        },

        // 图标地址
        icon_url: "",
        dataTypes: ["String", "UUID", "Clob", "Boolean", "Date", "TimeStamp", "Integer", "Long", "Double"],
        // 编辑框
        args: {
          dynamic: false,
          title: '标签',
          id: null,
          layout: "horizontal",
          text: "",
          label: "",
          name: "",
          hided: false,
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          label_fontColor: 'initial',
          txt_fontColor: 'initial',
          label_color: 'initial',
          // 属性插件所需属性
          targetDataType: null,
          // 布局插件所需属性
          _id: "0",
          basic_height: 20,
          _type: "attribute",
          height: 30,
          heightType: "px",
          width: 100,
          widthType: '%',
          col: false,
          cols: 3,
          lfsize: 14,
          lfsizeType: 'px',
          fsize: 14,
          fsizeType: 'px',
        },

        queryData: {
          query: "", // 查询条件
          targetClass: "", // 目标类名
          formName: "", //
          uuid: ""
        },
        targetClassObjects: [],
        targetClassObject: null,

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
        attrMap: {},

        parsedLabel: "",
        attributes: [],
        errorMessage: '',
        isWrong: false,
      }
    },
    components: {
      FormEngine
    },
    inject:[
      'getEn',
      'getJsonData',
      'getParentJson',
      'getObj',
      'GetAddinById',
      'GetAddinByUUID',
      'GetAllAddin',
      'getParentAddin',
      '_getViewData',
      '_getViewDataByAttrs',
      'handleQueryData',
      'getClassObject',
      'getRClassObject',
      'invokeOperation',
      'parseEscapeString',
      'handleScript',
      'addExtraObj',
      'getEventOperation',
      'invokeEvent',
    ],
    // 生命周期函数，在获取数据和事件函数后调用，
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);

      this.$store = this.store;
      this.attributes = this.store.getters["DWF_form/Attributes"]();
      this.targetClassObject = this.itemValue.data.origin;
    },

    mounted() {

      if(this.args.events && this.args.events.length > 0) {


        // 鼠标悬停事件
        this.isHover = this.args.events.find((val) => {
          return val.name == '鼠标悬停'
        })

        if(this.isHover != null && this.isHover.opr_path != undefined && this.isHover.opr_path != '') {
          getQueryOperation(this.isHover.opr_path).then(response => {

            let res = response.data;
            if(res.success && res.data) {

              let oName = res.data.conType;

              if(oName == 'tip') {

                if(res.data.action == 'implement') {

                  if(res.data.conditionExpre) {

                    this.popHoverMes = res.data.conditionExpre.slice(20);
                    this.popHoverMes = this.popHoverMes.replace(/\'/g, '');
                    this.popHoverMes = this.popHoverMes.replace(/\"/g, '');
                    this.isHoverMesPop = true;
                  }

                } else {
                  this.isHoverMesPop = false;
                }

                this.popHoverObj = JSON.parse(res.data.viewType);
                this.popHoverDirection = this.actions[this.popHoverObj.tipPlacement];
                this.popHoverPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
                this.needPop = true;

              } else {

                this.needPop = false;

              }
            } else {
              console.log(res.message);
            }
            // this.$nextTick(() => {
            //   this.setInheritStyle();
            // })
          }).catch(e => {
            console.log(e);
          });


        }

      }

      if (!this.args.name || this.args.name == '') {
        this.parsedLabel = parseEscapeString(this.args.text, null, null, this.itemValue.data.origin, this.attributes, this.$store);
      }
      //this.$refs.main.querySelector(".i-input .ivu-input").style.fontsize = 'inherit';
      //this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';

    },

    watch: {
      // arg_text(val) {
      //   this.parsedLabel = val;
      // }
    },

    computed: {
      ...mapActions("DWF_form", ["EntityAttrList"]),

      arg_text() {
        return this.args.text;
      },

      // parsedLabel() {
      //   console.log('this.attributes', this.attributes);
      //   return parseEscapeString(this.args.text, null, null, this.targetClassObjects[this.targetClassObjects.length-1], this.attributes);
      // },
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
      },
      args_label_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? 'inherit' : this.args.label_fontColor + ' !important';
      },
      args_txt_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? 'inherit' : this.args.txt_fontColor + ' !important';
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
      labelYAlignFlex(){
        let x = this.args.label_align % 3;
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
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
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
    },
    methods: {
      onDynamic(value) {
        this.setValue(value);
      },
      getValue() {
        return this.parsedLabel;
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

      setValue(value) {
        console.log(value, this.args.text, this.args.targetDataType, this.args.label);
        if (value === null || value === '' || value === undefined) {

          if(this.t_create){
            this.args.text = "defaultValue" in this.args ? this.args.defaultValue : this.args.text;
            this.parsedLabel = this.args.text ? this.args.text : '';
          }else{
            this.parsedLabel = '';
          }
          return this;

        } else {

          if (this.args.targetDataType == 'Date' || this.args.targetDataType == 'TimeStamp') {

            if (this.args.formatLabel == '') {

              if (value == '当前时间') {
                this.parsedLabel = this.formatTime();
                return this;
              } else {
                this.parsedLabel = this.formatTime(value);
                return this;
              }

            } else {

              if (value == '当前时间') {
                let curTime = new Date().getTime();
                this.parsedLabel = this.formatTimes(curTime, this.args.formatLabel);
                return this;
              } else {

                this.parsedLabel = this.formatTimes(value / 1000, this.args.formatLabel);
                return this;
              }

            }
          } else {

            // this.args.text = value + "";
            this.parsedLabel = value + "";
            return this;

          }

        }

      },

      hoverEvent() {
        if(this.isHover && this.isHover != undefined) {
          this.invokeOperation(this.isHover.opr_type, this.isHover.opr_path, this.itemValue, this.store);
        }
      },

      /**
       * @description 手动设置浮窗
       * @param mes 浮窗显示的文字
       * @param type 浮窗触发的方式 默认鼠标经过触发
       * @param direction 浮窗的指定方向 不传默认top
       * @param width 浮窗的指定宽度 默认150px
      */
      setToolTip(mes, type, direction, width) {

        if(!type) type = 'hover';
        if(!direction) direction = 'top';
        if(!width) width = 150;
        this.popHoverDirection = direction;
        this.popHoverObj.popWidth = width;
        this.isHoverMesPop = true;
        this.popHoverMes = mes;

        this.needPop = true;

        // this.$nextTick(() => {
        //   this.setInheritStyle();
        // })

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
        if (this.args.label == '') this.parsedLabel = this.args.text;

        this.args.readonly = true;

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

      getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },

      getName() {
        return name;
      },

      setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
          this.t_create = true;
        } else if (type == "edit") {
          this.t_edit = true;
        } else if (type == "visit") {
          this.t_visit = true;
        }
        return this;
      },
      // 设置异常状态显示
      setError(error, message = '') {
        this.isWrong = error;
        var dom = this.$refs.label;
        if (dom) dom.style.border = error ? "1px solid red" : null;
        this.errorMessage = error ? message : '';
        return this;
      },

      // 设置校验逻辑,返回true/false
      validate() {
        return true;
      },

      setIcon(id) {
        this.icon_url = id;
        return this;
      },

      getDataType(args) {
        return ['String'];
      },

      // async updateObjects() {
      //   // this.targetClassObjects = [];
      //   // this.queryData.targetClass = this.itemValue.data.targetClass;
      //   // await this.handleQueryData(this.queryData);
      //   // let uidList = this.getEn(this.queryData.targetClass);
      //   // uidList.forEach(uid => {
      //   //   this.targetClassObjects.push(this.getClassObject(this.queryData.targetClass, uid));
      //   // })
      //   // if (this.targetClassObjects.length == 0) this.targetClassObjects = [null];
      //   // console.log("objs from getEn", this.targetClassObjects);
      //   let res = await EntityModeling.getEntity(this.itemValue.data.targetClass);
      //   this.attributes = res.data.attributes;
      // }
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

  .ori-color {
    color: initial;
  }

  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }
</style>
