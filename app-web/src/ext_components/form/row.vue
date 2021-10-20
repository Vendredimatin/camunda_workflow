<template>
  <div :addinName="name" class="addin" style="padding: 0px; clear: left;" :style="{'width': colWidth}">
    <div v-show="!args.hided">
      <Row v-for="rs in args.iRows" :key="rs.id"
           :type="args.children[rs.id].type"
           :align="args.children[rs.id].align"
           :justify="args.children[rs.id].justify"
           style="width: 100%;" :style="rowStyle">
        <Col v-for="(cs, index) in args.iCols[rs.id]" :key="cs.id" :dropTarget="cs.id" class="addinC"
             :style="{
            'padding': parseInt(args.cpadding / 2) + 'px !important', 'min-height': arg_height,
            'display': 'flex',
            'flex-wrap': 'wrap',
            'align-items': args.children[cs.id].alignItems,
            'justify-content': args.children[cs.id].justifyContent,
            'border-top': args.children[cs.id].topBorder.width + 'px ' + args.children[cs.id].topBorder.style + ' ' + args.children[cs.id].topBorder.color,
            'border-right': args.children[cs.id].rightBorder.width + 'px ' + args.children[cs.id].rightBorder.style + ' ' + args.children[cs.id].rightBorder.color,
            'border-bottom': args.children[cs.id].bottomBorder.width + 'px ' + args.children[cs.id].bottomBorder.style + ' ' + args.children[cs.id].bottomBorder.color,
            'border-left': args.children[cs.id].leftBorder.width + 'px ' + args.children[cs.id].leftBorder.style + ' ' + args.children[cs.id].leftBorder.color,
          }"
             :span="args.children[cs.id].span"
             :offset="args.children[cs.id].offset"
             :push="args.children[cs.id].push"
             :pull="args.children[cs.id].pull">

          <ColPaneComponent
            :col="cs"
            v-bind="addinProps"
            :addin="colAddinList[rs.id][index]"
          >

          </ColPaneComponent>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
  import _global from '@/views/global.vue'
  import {getFilesById} from "@/api/others";
  import noBg from '@/assets/images/nobg.png';
  import '@/styles/component/iconfont.css'
  import ColPaneComponent from "@/ext_components/form/ColPaneComponent";

  const name = 'row';
  const borderConfig = {
    topBorder: {
      width: '0',
      color: '#000',
      style: 'dashed'
    },
    rightBorder: {
      width: '0',
      color: '#000',
      style: 'dashed'
    },
    bottomBorder: {
      width: '0',
      color: '#000',
      style: 'dashed'
    },
    leftBorder: {
      width: '0',
      color: '#000',
      style: 'dashed'
    },
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  };
  export default {
    name: name,
    components: {
      ColPaneComponent
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
        t_edit_row: false,
        t_edit_col: false,

        dataTypes: [],
        baseUrl: '',
        noBgFlag: false,      // 用来判断当前背景图片是否在资料库被删除

        // 编辑框rows
        args: {
          rpadding: 10,
          cpadding: 10,
          title: "行",
          id: "",
          _id: "0",
          type: "flex",
          align: "middle",
          justify: "start",
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          imgOrigin: 'imgSelf',
          back_color: "",      // 背景颜色
          back_picture: "",           // 背景图片,超链接
          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,
          hided: false,
          // 布局插件所需属性
          rows: 3,
          cols: 3,
          span: 8,
          offset: 0,
          push: 0,
          pull: 0,
          children: {},
          iCols: {},
          iRows: [],
          height: 200,                  // 整体高度=
          heightType: "px",                  // 整体高度=
          width: 100,
          widthType: '%',
          ...borderConfig,
        },

        click_children: '1,1',

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
        inherit: ["label_width", "main_width", "main_align", "label_align", "col"],

        allow: {},

        back: false,
        fresh: false,
        init: false,
      }
    },
    // 生命周期函数，在获取数据和事件函数后调用，
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);

      for(let col in this.args.children){
        if(col.split(',').length === 2){
          this.args.children[col] = this.args.children[col].topBorder ? this.args.children[col] : Object.assign(this.args.children[col], borderConfig);
        }
      }
      this.baseUrl = _global.baseUrl;
    },
    mounted() {
      console.log("mounted");
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
        //return allow[dropTarget];
      },

      getInherit(dropTarget) {
        var res = {};
        let that = this;
        this.inherit.forEach(x => {
          if (x in that.args.children[dropTarget]) res[x] = that.args.children[dropTarget][x]
        });
        return res;
      },

      // 获取编辑框内容
      getArgs() {
        return this.args;
      },

      setArgs(args) {
        if ("iRows" in args) this.init = true;
        for (var i in args) {
          this.args[i] = args[i];
        }
        if ("iRows" in args) {
          this.args.iRows = [];
          args.iRows.forEach(x => this.args.iRows.push(x));
        }
        if ("iCols" in args) {
          console.log("cols:", args.iCols, this.args.iRows);
          this.args.iCols = {};
          this.args.iRows.forEach(x => {
            this.args.iCols[x.id] = [];
            args.iCols[x.id].forEach(y => this.args.iCols[x.id].push(y));
          });
        }
        if (!('layoutBorder' in args)) {
          this.args.layoutBorder = {
            color: '#000',
            type: 'solid',
            width: '1px',
            show: false,
          }
        }
        for(let col in this.args.children){
          if(col.split(',').length === 2){
            this.args.children[col] = this.args.children[col].topBorder ? this.args.children[col] : Object.assign(this.args.children[col], borderConfig);
          }
        }
        return this;
      },

      // 获取表单项名
      getFormName() {
        return null;
      },

      getEditBox(args) {
        if (!args) {
          this.t_edit = true;
          return this.$refs.edit;
        } else if (args == "col") {
          this.t_edit_col = true;
          return this.$refs.edit_col;
        } else if (args == "row") {
          this.t_edit_row = true;
          return this.$refs.edit_row;
        }
      },

      getName() {
        return name;
      },

      setDisplayType(type) {
        return this;
      },

      getDataType(args) {
        return this.args.dataTypes;
      },
    },
    computed: {
      arg_height() {
        return this.args.height + this.args.heightType;
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
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      rowStyle() {
        if (this.args.layoutBorder.show) {
          return {
            'backgroundImage': this.arg_bgPic,
            'backgroundSize': this.args.bgSize,
            'backgroundRepeat': this.args.bgRepeat,
            'backgroundColor': this.args.back_color,
            'padding': parseInt(this.args.rpadding / 2) + 'px !important',
            'border': this.args.layoutBorder.width + ' ' + this.args.layoutBorder.type + ' ' + this.args.layoutBorder.color
          }
        } else {
          return {
            'backgroundImage': this.arg_bgPic,
            'backgroundSize': this.args.bgSize,
            'backgroundRepeat': this.args.bgRepeat,
            'backgroundColor': this.args.back_color,
            'padding': parseInt(this.args.rpadding / 2) + 'px !important',
          }
        }
      },

      //初始化控件props
      addinProps() {
        return {
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

      colAddinList(){
        let colAddinList = [];
        this.args.iRows.forEach(row => {
          if(!colAddinList[row.id]){
            colAddinList[row.id] = {};
          }
          this.args.iCols[row.id].forEach((col, index) => {
            colAddinList[row.id][index] = this.addin.elements.filter(addin => addin.self.dropTarget === col.id)
          })
        })
        return colAddinList;
      },
    }
  }
</script>

<style>
  .addinC .addin {
    padding: 0px !important;
  }

  .addinC .addin[addinname=Operation] {
    margin-right: 10px;
  }
</style>
<style scoped>
  section {
    width: 100%;
    height: auto;
    display: inline-block
  }
</style>
