<template>
  <Col :addinName="name" dropTarget="0"
       v-show="!args.hided"
       :span="args.span"
       :offset="args.offset"
       :push="args.push"
       :pull="args.pull"
       :style="colRowsStyle">

    <div>
      <Row v-for="(row, index) in args.children"
           :type="row.type"
           :align="row.align"
           :justify="row.justify"
           :key="index"
           :dropTarget="row.id"
           class="addin-col-row"
           :class="[index === 0 ? `marginTop0` : '']"
           addin="layout"
           :style="{ 'min-height': arg_height, 'margin-top': args.rowMargin + 'px'  }"
      >
        <RowPaneComponent
          :row="row"
          :addinProps="addinProps"
          :addin="rowAddinList[index]"
        >

        </RowPaneComponent>
      </Row>
    </div>
  </Col>
</template>

<script>
  import _global from '@/views/global.vue'
  import {getFilesById} from "@/api/others";
  import '@/styles/component/iconfont.css';
  import noBg from '@/assets/images/nobg.png';
  import RowPaneComponent from "@/ext_components/form/RowPaneComponent";

  const name = 'colRows';
  export default {
    name: name,
    components: {
      RowPaneComponent
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
          title: "多行",
          span: 8,
          rowMargin: 0,
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
          radius: '',                 // 圆角值
          radiusType: '%',
          back_color: "",      // 背景颜色
          back_picture: "",

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
          children:[{
            title: "行",
            id: "1,1",
            type: "flex",
            align: "middle",
            justify: "start",
            hideWidgetAnnotation: true,
          }],
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

      arg_bgPic() {

        let finalBg = '';
        if (this.args.imgOrigin == 'imgSelf') {
          finalBg = `url(${this.args.back_picture})`
        } else {

          // 判断原有背景图片是否已被删除
          if (this.args.back_picture != '') {

            getFilesById(this.args.back_picture).then(response => {

              this.noBgFlag = !response.success;

            }).catch(e => {
              this.noBgFlag = true;
              console.log(e);
            });

          }

          if (this.args.back_picture == '') {
            finalBg = '';
          } else {
            if (this.noBgFlag) {
              finalBg = `url(${noBg})`
            } else {
              finalBg = `url(${this.baseUrl}/files-download/${this.args.back_picture})`
            }
          }

        }
        return finalBg;

      },

      args_radius() {
        return this.args.radius + this.args.radiusType;
      },

      colRowsStyle(){
        if(this.args.layoutBorder.show){
          return {
            'width': this.arg_width,
            'min-height': this.arg_height,
            'float': 'left',
            'backgroundImage': this.arg_bgPic,
            'backgroundSize': this.args.bgSize,
            'backgroundRepeat': this.args.bgRepeat,
            'backgroundColor': this.args.back_color,
            'borderRadius': this.args_radius,
            'border': this.args.layoutBorder.width + ' ' + this.args.layoutBorder.type + ' ' + this.args.layoutBorder.color
          }
        }else{
          return {
            'width': this.arg_width,
            'min-height': this.arg_height,
            'float': 'left',
            'backgroundImage': this.arg_bgPic,
            'backgroundSize': this.args.bgSize,
            'backgroundRepeat': this.args.bgRepeat,
            'backgroundColor': this.args.back_color,
            'borderRadius': this.args_radius,
          }
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

      rowAddinList(){
        let rowAddinList = [];
        this.args.children.forEach((row, index) => {
          rowAddinList[index] = this.addin.elements.filter(addin => addin.self.dropTarget === row.id)
        })
        return rowAddinList;
      },
    },
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);

      this.baseUrl = _global.baseUrl;
    },
    mounted() {
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
        sessionStorage.getItem('skinStyle') === 'dark' && sessionStorage.getItem('appMenu') && (typeof this.args.back_color === 'undefined' || this.args.back_color === '#fff' || this.args.back_color === '#FFF' || this.args.back_color === '#ffffff' || this.args.back_color === '#FFFFFF') ?
          this.args.back_color = 'rgba(0, 0, 0, 0)' : '';
        if(!('layoutBorder' in args)){
          this.args.layoutBorder = {
            color: '#000',
            type: 'solid',
            width: '1px',
            show: false,
          }
        };
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
.addin-col-row.marginTop0{
  margin-top: 0px!important;
}
</style>
<style scoped>
  section {
    height: auto;
    display: inline-block;
  }

</style>
