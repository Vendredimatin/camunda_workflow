<template>

        <!-- 使用v-if,v-else-if语句来设置插件的显示样式 -->
        <section ref="iframBox" v-if="t_preview" :addinName="name" :style="{'width': colWidth}">
          <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
              'text-align': mainXAlign}">
              <span :style="{'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign, 'position': 'relative'}">
                <div class="iframe-overlay"></div>
                <iframe id="selfIframe" ref="iframe"
                        :sandbox="args.sandbox"
                        :src="parsedUrl" style="width: 100%; border: none;" :style="{
                      'height': arg_height,
                      'display': 'inline-block'}">

                </iframe>
              </span>
          </span>

            <!-- 预览模式时，有编辑框的显示；ref属性用于获取指定的dom元素，如ref="x",则在script中用this.$refs.x来选中该dom元素 -->
            <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
              <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
              :attributes="filter_attributes"
                       :dataTypes="dataTypes"
              :targetclass="itemValue.data.targetClass">
                  <div slot="attribute">
                      <!--
                          属性选项放置区域
                          一般一个控件的prop都属于属性选项
                      -->
                    <p class="margin1">链接地址</p>
                    <Input class="margin1" v-model="args.url" placeholder="链接url"/>
                  </div>
                  <div slot="layout">
                      <!--
                          样式选项放置区域
                          仅有涉及到高度,宽度,对齐等样式的选项放在这里
                      -->
                  </div>
                  <div slot="operation">
                      <!--
                          事件选项放置区域
                      -->
                  </div>
              </EditBox>
            </span>
        </section>
        <section v-else style="text-align: center" :addinName="name">
            <div class="form-addin-icon">
                <i class="icon iconfont icon-shitupeizhi"></i>
            </div>

          <div class="form-addin-name">
            网页
          </div>
            <!-- 名字长度小于等于3时，用span标签，大于3时，使用Tooltip标签加省略号 -->
<!--            <Tooltip class="form-addin-name" content="网页" style="width: 100%" :transfer="true">网页</Tooltip>-->
        </section>
</template>

<script>
import "@/styles/component/iconfont.css";
import EditBox from "@/ext_components/form/_EditBox.vue"
/*
        插件的js部分
        如果有引用依赖等，在export default 之前进行引用
    */
const name = "Iframe";
export default {
  // 插件名
  name: name,
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "store", "relation"],
  components: {
      EditBox
  },
  // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
  data() {
    return {
      // 插件名
      name: name,

      // 展示模式
      t_preview: true,
      t_show: false,
      t_icon: true,
      t_edit: false,

      // 图标地址
      icon_url: "",
      icon_name: "",

      value: "",
      dataTypes: ["String"],
      // 编辑框

      actEdit: false,
      args: {
        sandbox: 'allow-modals allow-forms allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation',
        url: "",
        id: "",

        title: "嵌入网页",
        name: "",
        targetDataType: null,
        height: 100,
        heightType: "px",
        width: 100,
        widthType: '%',
        cols: true,
        col: 3,
        readonly: false,
        hided: false,
      },
      parsedUrl: "http://www.nelbds.org.cn/",
      minHeight: 3,
      alignList: [
        {
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
      inherit: [],

      // 对象队列
      targetClassObjects: [],
      queryData: {
          query: "", // 查询条件
          targetClass: "", // 目标类名
          formName: "", //
          uuid: ""
        },

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},
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

      var IframeOnClick = {
        resolution: 200,
        iframes: [],
        interval: null,
        Iframe: function() {
            this.element = arguments[0];
            this.cb = arguments[1];
            this.hasTracked = false;
        },
        track: function(element, cb) {
            this.iframes.push(new this.Iframe(element, cb));
            if (!this.interval) {
                var _this = this;
                this.interval = setInterval(function() { _this.checkClick(); }, this.resolution);
            }
        },
        checkClick: function() {
            if (document.activeElement) {
                var activeElement = document.activeElement;
                for (var i in this.iframes) {
                    if (activeElement === this.iframes[i].element) {
                        if (this.iframes[i].hasTracked == false) {
                            this.iframes[i].cb.apply(window, []);
                            this.iframes[i].hasTracked = true;
                        }
                    } else {
                        this.iframes[i].hasTracked = false;
                    }
                }
            }
        }
      };

      let iframe = this.$refs.iframe;
      let main = this.$refs.iframBox;
      iframe.onload = () => {
        IframeOnClick.track(document.getElementById("selfIframe"), function() {
          main.click();
        });
      }

    }

  },
  // 定义组件的函数接口
  methods: {
    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow() {
      return null;
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
      if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
      delete this.args['name'];
      delete this.args['dynamic'];
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    // 获取插件的属性编辑框的dom元素
    getEditBoxComponent(){
      return this.$refs.editbox;
    },

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
      this.t_preview = type == 0;
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
      return this.dataTypes;
    },

  },
  watch: {
    arg_url(val){
      this.parsedUrl = val.replace(/\$user\.userGroups\[\d\]\.[a-zA-Z]+/g, '');
      this.args.sendbox = val === 'http://www.baidu.com' ? 'allow-scripts' : 'allow-modals allow-forms allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation';
    },
    arg_name(val) {
        if (val in this.attrMap) {
            this.args.targetDataType = this.attrMap[val].valueType;
        } else this.args.targetDataType = null;
    }
    // end
  },
  computed: {
    arg_url() {
      return this.args.url;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
    },
    arg_height() {
      return this.args.height < 4 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    labelWidth() {
      return (
        parseInt(
          (100 * this.args.label_width) /
            (this.args.label_width + this.args.main_width)
        ) + "%"
      );
    },
    mainWidth() {
      return !this.args.label || this.args.label == ""
        ? "100%"
        : parseInt(
            (100 * this.args.main_width) /
              (this.args.label_width + this.args.main_width)
          ) + "%";
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
        return this.attributes ? ( this.relation ?
            [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
    },
    // end
  }
};
</script>

<style scoped>
/*
        插件的css部分
        设置display为inline，默认不换行
        scoped表示样式仅在该vue文件内有效
    */
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
.iframe-overlay{
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 8;
  background: transparent;
}
</style>