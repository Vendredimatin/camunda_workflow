<template>
  <section :addinName="name" :style="{'width': colWidth}">
    <div v-show="!args.hided">
      <div :style="bindStyleShow" style="padding: 10px"  class="clearfix ori-group self-group" dropTarget="0">
        <h3 class="self-color" style="font-size: 14px;" :style="{'color': args_title_fontColor}">{{args._title}}</h3>
        <hr style="margin-bottom: 10px" v-show="args._title">
        <FormAddinList
          v-for="addinChild in addin.elements"
          :key="addinChild.self.uuid"
          :addin="addinChild"
          v-bind="addinProps"
        >

        </FormAddinList>
      </div>
    </div>
  </section>
</template>

<script>
  import _global from '@/views/global.vue'
  import '@/styles/component/iconfont.css';

  const name = "GroupBox";

  export default {
    name: name,
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
        t_preview: false,
        t_show: false,
        t_icon: true,
        t_edit: false,
        name: name,

        // 图标地址
        icon_url: "http://192.168.10.81:6060/dwf/v1/icons/application.png",
        baseUrl: '',


        // 编辑框
        args: {
          border: false,
          padding: "6px",
          style: "",
          _title: "默认标题",
          title_fontColor: 'initial',
          title: "分组框",
          id: "",
          hided: false,
          height: 200,                  // 整体高度=
          heightType: "px",                  // 整体高度=
          width: 100,
          widthType: '%',

          imgOrigin: 'imgSelf',
          back_color: "#fff",
          back_picture: "",           // 背景图片,超链接
          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,
        },


      }
    },
    created() {
      //通过prop给控件初始化
      this.setDisplayType(this.query.displayType);
      this.setArgs(this.argsProps);

      this.baseUrl = _global.baseUrl;
    },
    methods: {

      setError(error) {
        return this;
      },

      validate() {
        return true;
      },

      // 获取控件属性值
      getValue() {
        return null;
      },

      // 设置控件属性值
      setValue(item) {
        return this;
      },

      // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
      getAllow() {
        return [];
      },

      // 获取编辑框内容
      getArgs() {
        return this.args;
      },

      // 设置基本属性
      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        if ("name" in args) this.args_name = this.args.name;
        if(this.args.back_color == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.back_color = 'transparent';
        delete this.args['label_fontColor'];
        delete this.args['txt_fontColor'];
        delete this.args['lfsize'];
        delete this.args['lfsizeType'];
        delete this.args['fsize'];
        delete this.args['fsizeType'];
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      // 获取插件的属性编辑框的dom元素
      getEditBox(args) {
        this.t_edit = true;
        return this.$refs.edit;
      },

      // 获取插件名
      getName() {
        return name;
      },

      // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
      setDisplayType(type) {
        return this;
      },

      // 设置插件的图标
      setIcon(id) {
        this.icon_url = id;
        return this;
      },

      getIcon() {
        return this.icon_url;
      },

      // 设置插件支持的数据类型，返回类型为数据类型的列表
      getDataType(args) {
        return null;
      }
    },
    computed: {
      arg_height() {
        switch (this.args.heightType) {
          case 'px':
            return this.args.height + this.args.heightType;
            break;
          case 'vw':
            return this.args.height + this.args.heightType;
            break;
          case 'vh':
            return this.args.height + this.args.heightType;
            break;
          case 'rem':
            return this.args.height + this.args.heightType;
            break;
        }
      },
      args_title_fontColor(){
        return this.args.title_fontColor == 'initial' ? 'inherit' :  this.args.title_fontColor + ' !important'
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      arg_bgPic() {
        let finalBg = '';
        if(this.args.imgOrigin == 'imgSelf') {
            finalBg = `url(${this.args.back_picture})`
        } else {
            finalBg = this.args.back_picture == '' ? this.args.back_picture : `url(${this.baseUrl}/files-download/${this.args.back_picture})`;
        }
        return finalBg;
      },
      bindStylePreview() {
        return {
          "width": "100%",
          "border": this.args.border ? "1px solid #233" : "1px dashed #bbb",
          "padding": this.args.padding,
          "min-height": "180px",
          "background-color": "#fff",
        }
      },
      bindStyleShow() {
        return {
          "width": "100%",
          "border": this.args.border ? "1px solid #233" : "none",
          "padding": this.args.padding,
          'backgroundImage': this.arg_bgPic,
          'backgroundSize': this.args.bgSize,
          'backgroundRepeat': this.args.bgRepeat,
          "background-color": `${this.args.back_color}!important` || 'rgba(0,0,0,0)',
          'min-height': this.arg_height,
          "clear": 'both'
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
    }
  }
</script>

<style scoped>
  .ori-group {
    background: #fff;
  }
</style>
