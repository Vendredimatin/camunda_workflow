<template>
  <Col
    :addinName="name"
    dropTarget="0"
    v-show="!args.hided"
    :span="args.span"
    :offset="args.offset"
    :push="args.push"
    :pull="args.pull"
    :style="colStyle"
  >
    <FormAddinList
      v-for="addin in addin.elements"
      :key="addin.self.uuid"
      :addin="addin"
      v-bind="addinProps"
    >

    </FormAddinList>
  </Col>
</template>

<script>
  import _global from '@/views/global.vue'
  import {getFilesById} from "@/api/others";
  import '@/styles/component/iconfont.css';
  import noBg from '@/assets/images/nobg.png';
  import FormAddinList from "@/ext_components/form/FormAddinList";

  const name = 'col';
  export default {
    name: name,
    components: {
    },
    props: [
      'argsProps',
      'addin',
      'query',
      'store',
      'itemValue',
      'attributes',
      'relation',
      'route',
      'root',
      'Message',
      'echarts',
      'formEngine',
      'dwf_ctx',
    ],
    data() {
      return {
        name: name,

        // 展示模式
        t_preview: false,
        t_show: false,
        t_icon: true,
        t_edit: false,

        noBgFlag: false,      // 用来判断当前背景图片是否在资料库被删除

        // 支持的数据类型
        dataTypes: [],

        // 编辑框
        args: {
          id: "",
          title: "列",
          span: 8,
          offset: 0,
          push: 0,
          pull: 0,
          // style: "padding: 10px",
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          // 属性插件所需属性
          label: "",
          hided: false,
          targetDataType: null,
          relation: "",
          relation_attr: "",
          relation_class: "",
          relation_class_attr: "",
          height: 30,                 // 整体高度
          width: 100,                // 整体宽度,单位为%或者px
          widthType: "%",             // 整体宽度的单位
          heightType: "px",           // 整体高度的单位
          back_color: "",      // 背景颜色
          back_picture: "",

          marginTop: 0,
          marginTopType: 'px',
          marginBottom: 0,
          marginBottomType: 'px',
          marginLeft: 0,
          marginLeftType: 'px',
          marginRight: 0,
          marginRightType: 'px',

          paddingTop: 5,
          paddingTopType: 'px',
          paddingBottom: 5,
          paddingBottomType: 'px',
          paddingLeft: 5,
          paddingLeftType: 'px',
          paddingRight: 5,
          paddingRightType: 'px',

          tbColor: '#bbb',
          tbWidth: 0,
          tbStyle: 'dashed',

          bbColor: '#bbb',
          bbWidth: 0,
          bbStyle: 'dashed',

          lbColor: '#bbb',
          lbWidth: 0,
          lbStyle: 'dashed',

          rbColor: '#bbb',
          rbWidth: 0,
          rbStyle: 'dashed',

          ltRadius: 0,
          ltRadiusType: 'px',

          rtRadius: 0,
          rtRadiusType: 'px',

          lbRadius: 0,
          lbRadiusType: 'px',

          rbRadius: 0,
          rbRadiusType: 'px',

          shadowType: '外阴影',
          xShadow: 0,
          yShadow: 0,
          blurShadow: 0,
          spreadShadow: 0,
          shadowColor: '',

          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,
          // 布局插件所需属性
          type: "flex",
          align: "middle",
          justify: "start",
          rows: 3,
          cols: 3,
          col: false,
        },

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
        inherit: ["label_width", "main_width", "main_align", "label_align", "basic_height", "col"],
      }
    },
    computed: {

      arg_width() {
        return this.args.width + this.args.widthType;
      },

      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },

      arg_mt() {
        return this.args.marginTop + this.args.marginTopType;
      },

      arg_mb() {
        return this.args.marginBottom + this.args.marginBottomType;
      },

      arg_ml() {
        return this.args.marginLeft + this.args.marginLeftType;
      },

      arg_mr() {
        return this.args.marginRight + this.args.marginRightType;
      },

      arg_pt() {
        return this.args.paddingTop + this.args.paddingTopType + ' !important';
      },

      arg_pb() {
        return this.args.paddingBottom + this.args.paddingBottomType  + ' !important';
      },

      arg_pl() {
        return this.args.paddingLeft + this.args.paddingLeftType  + ' !important';
      },

      arg_pr() {
        return this.args.paddingRight + this.args.paddingRightType  + ' !important';
      },

      arg_ltRadius() {
        return this.args.ltRadius + this.args.ltRadiusType;
      },

      arg_rtRadius() {
        return this.args.rtRadius + this.args.rtRadiusType;
      },

      arg_lbRadius() {
        return this.args.lbRadius + this.args.lbRadiusType;
      },

      arg_rbRadius() {
        return this.args.rbRadius + this.args.rbRadiusType;
      },

      arg_shadow() {
        return this.args.shadowType == '外阴影' ? `${this.args.xShadow}px ${this.args.yShadow}px ${this.args.blurShadow}px ${this.args.spreadShadow}px ${this.args.shadowColor}` : `${this.args.xShadow}px ${this.args.yShadow}px ${this.args.blurShadow}px ${this.args.spreadShadow}px ${this.args.shadowColor} inset`;
      },

      arg_bgPic() {

        let finalBg = '';
        if (this.args.imgOrigin == 'imgSelf') {
          finalBg = `url(${this.args.back_picture})`
        } else {

          // 判断原有背景图片是否已被删除
          // if (this.args.back_picture != '') {

          //   getFilesById(this.args.back_picture).then(response => {

          //     this.noBgFlag = !response.success;

          //   }).catch(e => {
          //     this.noBgFlag = true;
          //     console.log(e);
          //   });

          // }

          if (this.args.back_picture == '') {
            finalBg = '';
          } else {
            // if (this.noBgFlag) {
            //   finalBg = `url(${noBg})`
            // } else {
              finalBg = `url(${this.baseUrl}/files-download/${this.args.back_picture})`
            // }
          }

        }
        return finalBg;

      },

      args_radius() {
        return this.args.radius + this.args.radiusType;
      },

      colStyle() {
        return {
          'width': this.arg_width,
          'min-height': this.arg_height,
          'float': 'left',
          'margin': `${this.arg_mt} ${this.arg_mr} ${this.arg_mb} ${this.arg_ml}`,
          'padding-top': this.arg_pt,
          'padding-bottom': this.arg_pb,
          'padding-left': this.arg_pl,
          'padding-right': this.arg_pr,
          'backgroundImage': this.arg_bgPic,
          'backgroundSize': this.args.bgSize,
          'backgroundRepeat': this.args.bgRepeat,
          'backgroundColor': this.args.back_color,
          'border-top': `${this.args.tbWidth}px ${this.args.tbStyle} ${this.args.tbColor}`,
          'border-right': `${this.args.rbWidth}px ${this.args.rbStyle} ${this.args.rbColor}`,
          'border-bottom': `${this.args.bbWidth}px ${this.args.bbStyle} ${this.args.bbColor}`,
          'border-left': `${this.args.lbWidth}px ${this.args.lbStyle} ${this.args.lbColor}`,
          'borderRadius': `${this.arg_ltRadius} ${this.arg_rtRadius} ${this.arg_rbRadius} ${this.arg_lbRadius}`,
          'box-shadow': this.arg_shadow,
          'flex-wrap': 'wrap',
          'align-content': this.args.alignItems,
          'justify-content': this.args.justifyContent,
          'overflow': 'hidden',
          'position': 'relative',
          'z-index': 0,

      }
      },

      //初始化控件props
      addinProps() {
        return {
          addin: this.addin,
          store: this.store,
          itemValue: this.itemValue,
          query: this.query,
          attributes: this.attributes,
          relation: this.relation,
          route: this.route,
          root: this.root,
          Message: this.Message,
          echarts: this.echarts,
          formEngine: this.formEngine,
          dwf_ctx: this.dwf_ctx
        }
      },
    },
    // 生命周期函数，在获取数据和事件函数后调用，
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);

      this.baseUrl = _global.baseUrl;
    },
    mounted() {
    },
    watch: {
      'args.hided'(val){
        // debugger
      }
    },
    methods: {
      setError(error) {
        return this;
      },

      validate() {
        return true;
      },

      getValue() {
        return null;
      },

      setValue(items) {
        return this;
      },

      getAllow(dropTarget) {
        return [];
      },

      getInherit(dropTarget) {
        var res = {};
        let that = this;
        this.inherit.forEach(x => res[x] = that.args[x]);
        return res;
      },

      // 获取编辑框内容
      getArgs() {
        return this.args;
      },

      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        if ("name" in args) this.args_name = this.args.name;
        if ("radius" in args && this.args.radius != '') {

          if(this.args.ltRadius == 0 && this.args.rtRadius == 0 && this.args.lbRadius == 0 && this.args.rbRadius == 0) {

            this.args.rtRadius = this.args.lbRadius = this.args.rbRadius = this.args.ltRadius = this.args.radius;
            this.args.rtRadiusType = this.args.lbRadiusType = this.args.rbRadiusType = this.args.ltRadiusType = this.args.radiusType;

          }

        }
        sessionStorage.getItem('skinStyle') === 'dark' && sessionStorage.getItem('appMenu') && (typeof this.args.back_color === 'undefined' || this.args.back_color === '#fff' || this.args.back_color === '#FFF' || this.args.back_color === '#ffffff' || this.args.back_color === '#FFFFFF') ?
          this.args.back_color = 'rgba(0, 0, 0, 0)' : '';
        if (!('layoutBorder' in args)) {
          this.args.layoutBorder = {
            color: '#000',
            type: 'solid',
            width: '1px',
            show: false,
          }
        }
        if (!('alignItems' in args)) {
          this.args.alignItems = 'flex-start';
          this.args.justifyContent = 'flex-start';
        }
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },

      getName() {
        return name;
      },

      setDisplayType(type) {
        return this;
      },

      getDataType(args) {
        return this.dataTypes;
      },
    }
  }
</script>
<style>
.addin[addinname='col']{
  display: flex;
}
</style>
<style scoped>
  section {
    height: auto;
    display: inline-block;
  }

</style>