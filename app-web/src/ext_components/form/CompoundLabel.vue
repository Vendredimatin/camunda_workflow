<template>
  <section :addinName="name" :style="{'width': colWidth, 'text-align': mainXAlign}" v-show="!args.hided" @click="labelClick">
    <div :style="{'height': arg_height,
      'lineHeight': arg_lineHeight,
      'backgroundImage': arg_bgPic,
      'backgroundSize': args.bgSize,
      'backgroundRepeat': args.bgRepeat,
      'backgroundColor': args.back_color,
      'width': mainWidth}">
      <Icon class="ori-color self-color" v-show="args.iconPosition == '上'" :type="args.iconType" :style="{'font-size': args_isize, 'color': args_icon_fontColor, 'margin-bottom': `${args.margin}px`}" />
      <p :style="{'width': mainWidth,
        'display': 'flex',
        'justify-content': mainFXAlign,
        'align-content': 'center',
        'color': args.main_fontColor}">
          <Icon class="ori-color self-color" v-show="args.iconPosition == '左'" :type="args.iconType" :style="{'height': arg_height,'lineHeight': arg_lineHeight,'font-size': args_isize, 'color': args_icon_fontColor, 'margin-right': `${args.margin}px`}" />
          <label class="msize ori-color self-color" :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ args.text }}</label>
          <Icon class="ori-color self-color" v-show="args.iconPosition == '右'" :type="args.iconType" :style="{'height': arg_height,'lineHeight': arg_lineHeight,'font-size': args_isize, 'color': args_icon_fontColor, 'margin-left': `${args.margin}px`}" />
        </p>
        <Icon class="ori-color self-color"   v-show="args.iconPosition == '下'" :type="args.iconType" :style="{'font-size': args_isize, 'color': args_icon_fontColor, 'margin-top': `${args.margin}px`}" />
    </div>
  </section>
</template>

<script>
  import _global from '@/views/global.vue'
  import { getFilesById } from "@/api/others";
  const name = "CompoundLabel";
  export default {
    // 插件名
    name: name,
    // 属性值传入:
    //  itemValue: 表单对应的Json结构
    //  attributes: 实体类属性
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
        baseUrl: '',
        noBgFlag: false,

        iconList: [], // icon列表

        // 编辑框
        args: {
          txt_fontColor: 'initial',//内容文字颜色
          label_color: 'initial',
          main_fontColor: 'initial',
          main_color: 'initial',
          title: '标签',
          iconType: '',
          iconPosition: '文字前',
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
          // 布局插件所需属性
          height: 30,
          heightType: "px",
          lineHeight: 30,
          lineHeightType: 'px',
          margin: 5,
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

        // 继承属性
        inherit: [],

        clickFlag: null,

        // 属性map
        attrMap: {}
      }
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

      this.baseUrl = _global.baseUrl;
    },

    mounted() {

        // 事件处理
        if(this.args.events && this.args.events.length > 0) {

            this.clickFlag = this.args.events.find((val) => {
                return val.name == '点击'
            })

        }

    },
    computed: {
      arg_bgPic() {

        let finalBg = '';
        if(this.args.imgOrigin == 'imgSelf') {
            finalBg = `url(${this.args.back_picture})`
        } else {
            finalBg = `url(${this.baseUrl}/files-download/${this.args.back_picture})`;
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
      args_txt_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? 'inherit' : this.args.txt_fontColor + ' !important';
      },
      args_icon_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.icon_fontColor == 'initial' ? 'inherit' : this.args.icon_fontColor + ' !important';
      },

      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
    },
    methods: {

      /**
       * @description 点击事件
      */
      labelClick() {

        if(this.clickFlag) this.invokeOperation(this.clickFlag.opr_type, this.clickFlag.opr_path, this.itemValue, this.store);

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
.ori-color {
  color: initial;
}
</style>
