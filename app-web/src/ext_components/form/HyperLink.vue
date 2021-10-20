<template>
  <section :addinName="name" :style="{'min-height': arg_height, 'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <section style="">
      <span v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
          <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%'}">
              <label class="self-color" :style="{'color': args_label_fontColor , 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
        <span v-show="!args.hided" ref="link" :style="{'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
        'text-align': mainXAlign, 'color': args.main_fontColor}">
        <span :style="{'background-color': args.main_color, 'width': '100%', 'vertical-align': mainYAlign}">
        <a class="self-color" :href="parsedHref" :style="{'font-size': args_fsize, 'color': args_txt_fontColor}"
           target="_blank">{{args.text}}</a>
        </span>
      </span>
      </section>
    </template>
    <template v-else>
      <section style="">
        <span v-if="args.label" :style="{'width': '100%', 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%'}">
                <label class="self-color" :style="{'color': args_label_fontColor , 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <span v-show="!args.hided" ref="link" :style="{'height': arg_height, 'line-height': arg_height, 'width': '100%', 'display': 'inline-block',
        'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{'background-color': args.main_color, 'width': '100%', 'vertical-align': mainYAlign}">
          <a class="self-color" :href="parsedHref" :style="{'font-size': args_fsize, 'color': args_txt_fontColor}"
             target="_blank">{{args.text}}</a>
          </span>
        </span>
      </section>
    </template>
    <span v-show="isWrong && !args.hided"
          :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import "@/styles/component/iconfont.css";
  import { getEobj } from "@/api/others";
  import {
    parseEscapeString
  } from '@/libs/utils.js'
  const name = "HyperLink";
  export default {
    name: name,
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
      'attributes',
    ],
    data() {
      return {
        // 插件名
        name: name,
        // 展示模式
        t_create: false,
        t_edit: false,
        t_visit: true,
        dataTypes: ["String"],

        args: {
          title: '超链接',
          id: null,
          label: "",
          name: "",
          hrefPrefix: 'http://',
          href: "",
          text: "超链接",
          hided: false,

          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,

          targetDataType: null,

          _id: "0",
          _type: "attribute",
          height: 30,
          heightType: "px",
          width: 100,
          widthType: '%',
          col: true,
          cols: 3,
          label_fontColor: 'initial',
          txt_fontColor: 'initial',
          lfsize:14,//标签文字大小
          lfsizeType:'px',//标签文字大小单位
          fsize: 14,//内容文字大小
          fsizeType: 'px',//内容文字大小单位
        },
        underline: "false",

        // 查询数据语句
        queryData: {
          query: "", // 查询条件
          targetClass: "", // 目标类名
          formName: "", //
          uuid: ""
        },
        // 目标类对象列表
        targetClassObjects: [],
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

        value: null,

        parsedHref: null,

        isWrong: false,
        errorMessage: '',
      };
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

      this._attributes = this.attributes;
      this.$store = this.store;
      this.$Spin.show();
    },
    mounted() {
      console.log(this.args.href, this.args.hrefPrefix);
      this.updateObjects();
    },

    computed: {
      ...mapGetters("DWF_form", ["RelationAttrList", "EntityAttrList", "EntityList"]),
      // parsedHref() {
      //   let _res =  parseEscapeString(this.fullHref, null, null, this.targetClassObjects[this.targetClassObjects.length-1], this._attributes);
      //   return _res;
      // },
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
      },
      args_label_fontColor(){
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + '!important'
      },
      args_txt_fontColor(){
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? this.args.txt_fontColor : this.args.txt_fontColor + '!important';
      },
      fullHref() {
        return this.args.hrefPrefix + this.args.href;
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
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
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
      }
    },
    methods: {
      ...mapActions("DWF_form", ["queryEntity", "queryRelation"]),
      // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
      getAllow() {
        return null;
      },
      // 获取控件属性值
      getValue() {
        return this.parsedHref;
        // return this.args.href;
      },

      // 设置控件属性值,item是查询到的对象数组
      setValue(item) {
        console.log(item);
        if (this.args.text == "") {
          this.args.text = item
        }
        if (this.args.href == "") {
          this.parsedHref = item;
        }
        // this.updateObjects();
        return this;
      },

      getName() {
        return name;
      },
      // 设置基本属性
      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }

        return this;
      },
      getArgs() {
        return this.args;
      },
      // 获取表单项名
      getFormName() {
        return this.args.name;
      },
      setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
            this.t_create = true;
        }
        else if (type == "edit") {
            this.t_edit = true;
        }
        else if (type == "visit") {
            this.t_visit = true;
        }
        return this;
    },
    setError(error, message = '') {
      this.isWrong = error;
      var dom = this.$refs.link;
      if (dom) dom.style.border = error ? "1px solid red" : null;
      this.errorMessage = error ? message : '';
      return this;
    },
    validate() {
        return true;
    },
      // 获取插件的属性编辑框的dom元素
      getEditBox(args) {
        this.t_edit = true;
        return this.$refs.edit;
      },
      getDataType(args) {
        return this.dataTypes;
      },
      getInherit() {
        var res = {};
        let that = this;
        this.inherit.forEach(x => (res[x] = that.args[x]));
        return res;
      },

      async updateObjects() {
        let obj = {};
        if (this.itemValue.data.isRelation) {
          for (var i in this.itemValue.data.origin) {
            if (i.substring(0,9) == "relation_") {
              obj[i.substring(9)] = this.itemValue.data.origin[i];
            }
          }
        } else obj = this.itemValue.data.origin;
        // this.targetClassObjects = [obj];

        if (!this._attributes) {
          if (this.itemValue.data.isRelation) {
            await this.queryRelation(this.itemValue.data.targetClass);
            this._attributes = this.RelationAttrList(this.itemValue.data.targetClass);
          } else {
            let entity = await this.EntityAttrList(this.itemValue.data.targetClass);
            this._attributes = entity;
          }
        }

        if(this.args.CommonOpAuth){
          this.parsedHref = 'javascript:void(0);';
          this.$Spin.hide();
        }else{
          // getEobj(this.itemValue.data.targetClass).then(response => {
          //   let res = response.data;
          //   if(res.success) {
          //     if(res.data && res.data.length) {
          //       this.targetClassObjects = res.data[res.data.length - 1];
          //     }
          //     this.parsedHref = parseEscapeString(this.fullHref, {}, {}, this.targetClassObjects, this._attributes);
          //   }
          //   this.$Spin.hide();
          // }).catch(e => {
          //   this.$Spin.hide();
          // });
          if(this.args.href){
            this.parsedHref = this.parseEscapeString(this.fullHref, null, null, this.itemValue.data.origin ,this._attributes, this.$store);
          }
          this.$Spin.hide();
        }
      },
    }
  };

</script>

<style scoped>
  section {
    display: inline-block;
    width: 100%;
  }

  p {
    margin: 5px;
    text-align: left;
  }

  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }
</style>
