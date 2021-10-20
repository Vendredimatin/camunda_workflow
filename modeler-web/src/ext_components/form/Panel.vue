<template>
    <section :addinName="name" :style="{
        'width': colWidth,
        'backgroundImage': arg_bgPic,
        'backgroundSize': args.bgSize,
        'backgroundRepeat': args.bgRepeat,
        'backgroundColor': args.back_color
    }">
        <div v-if="t_preview">
            <div :style="[bindStylePreview]" dropTarget="0" class="clearfix">
                <Dropdown style="float: right; right: 10px; top: 10px" trigger="hover">

                    <Icon type="ios-more"></Icon>
                    <DropdownMenu slot="list">
                    <DropdownItem>删除</DropdownItem>
                    <DropdownItem>隐藏</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <!--编辑框-->
            <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">

            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args">
                <div slot="attribute">
                  <p class="margin1">内边距</p>
                  <Input class="margin1" v-model="args.padding"></Input>
                  <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                      边框
                      <i-switch style="float: right" v-model="args.border" />
                  </div>
                </div>
                <div slot="layout">

                </div>
                <div slot="operation">
                </div>
            </EditBox>
    </span>
        </div>

        <span v-else>
      <div>
                <i class="icon iconfont icon-mianban"></i>
            </div>
            <Tooltip content="面板" style="width: 100%" :transfer="true">面板</Tooltip>
    </span>
    </section>
</template>

<script>
    import _global from '@/views/global.vue'
    import '@/styles/component/iconfont.css';
    import EditBox from "./_EditBox.vue"
    const name = "Panel";

    export default {
        name: name,
        props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue"],
        components: { EditBox },
        data() {
            return {
                t_preview: true,
                t_show: false,
                t_icon: true,
                t_edit: false,
                name: name,

                // 图标地址
                icon_url: "http://192.168.10.81:6060/dwf/v1/icons/application.png",
                baseUrl: '',

                // 编辑框

      actEdit: false,
      args: {
                    layout: true,
                    border: false,
                    padding: "6px",
                    style: "",
                    title: "面板",
                    id: "",
                    hided: false,
                    // label_fontColor: 'initial',
                    // txt_fontColor: 'initial',
                    // lfsize: 14,
                    // lfsizeType: 'px',
                    // fsize: 14,
                    // fsizeType: 'px',
                    label_width: 2,
                    main_width: 3,
                    label_align: 4,
                    main_align: 4,
                    height: 200,                  // 整体高度=
                    heightType: "px",                  // 整体高度=
                    width: 100,
                    widthType: '%',

                    imgOrigin: 'imgSelf',
                    back_color: "#fff",      // 背景颜色
                    back_picture: "",           // 背景图片,超链接
                    bgStyle: 'cover',           // 背景图片显示方式
                    bgSize: 'cover',
                    bgRepeat: 'no-repeat',
                    bgPercent: 100,
                },

                node: null,
                timer: null,
              // inherit: ["label_width", "main_width", "main_align", "label_align", "lfsize", "lfsizeType", "fsize", "fsizeType", "label_fontColor", "txt_fontColor"],
                inherit: [],
            }
        },
        beforeDestroy() {
            if (this.timer) clearInterval(this.timer);
        },
        created() {
            if (this.t_preview) {
                this.baseUrl = _global.baseUrl;
            }
        },
        mounted() {
            if (this.t_preview) {
                let that = this;
                this.timer = setInterval(() => {
                    that.node = that.GetJsonById(that.itemValue.data, that.args.id);
                    if (that.node) {
                        console.log("node:", that.node);
                        clearInterval(that.timer);
                        that.timer = null;
                    }
                }, 100);
            }
        },
        methods: {

            getInherit() {
                let res = {};
                this.inherit.forEach(x => {
                res[x] = this.args[x];
                })
                return res;
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
                return null;
            }
        }, computed: {
            arg_height() {
              return this.args.height + this.args.heightType;
            },
            colWidth() {
              return this.args.width + this.args.widthType;
              // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
            },
            arg_bgPic() {
                return this.args.back_picture == '' ? this.args.back_picture : `url(${this.baseUrl}/files-download/${this.args.back_picture})`;
            },
            bindStylePreview() {
                return {
                    "width": "100%",
                    "border": this.args.border ? "1px solid #233" : "1px dashed #bbb",
                    "padding": this.args.padding,
                    "background-color": this.args.back_color,
                    'min-height': this.arg_height
                }
            },
            bindStyleShow() {
                return {
                    "width": "100%",
                    "border": this.args.border ? "1px solid #233" : "none",
                    "padding": this.args.padding,
                    "background-color": "#fff",
                }
            },
            args_lfsize() {
                return this.args.lfsize + this.args.lfsizeType + " !important";
            },
            args_lfcolor() {
                return this.args.label_fontColor;
            },
            args_fsize() {
                return this.args.fsize + this.args.fsizeType + " !important";
            },
            args_fcolor() {
                return this.args.txt_fontColor;
            },
            args_label_width() {
                return this.args.label_width;
            },
            args_main_width() {
                return this.args.main_width;
            },
            args_label_align() {
                return this.args.label_align;
            },
            args_main_align() {
                return this.args.main_align;
            }
        },
        watch: {
            args_lfsize(val) {
                if (!this.node) return;
                this.node.elements.forEach(x => {
                    if ("lfsize" in x.self.properties) {
                        x.self.properties.lfsize = this.args.lfsize;
                        x.self.properties.lfsizeType = this.args.lfsizeType;
                    }
                })
            },
            args_lfcolor(val) {
                if (!this.node) return;
                this.node.elements.forEach(x => {
                    if ("label_fontColor" in x.self.properties) {
                        x.self.properties.label_fontColor = this.args.label_fontColor;
                    }
                })
            },
            args_fsize(val) {
                if (!this.node) return;
                this.node.elements.forEach(x => {
                    if ("fsize" in x.self.properties) {
                        x.self.properties.fsize = this.args.fsize;
                        x.self.properties.fsizeType = this.args.fsizeType;
                    }
                })
            },
            args_fcolor(val) {
                if (!this.node) return;
                this.node.elements.forEach(x => {
                    if ("txt_fontColor" in x.self.properties) {
                        x.self.properties.txt_fontColor = this.args.txt_fontColor;
                    }
                })
            },
            args_label_width(val) {
                if (!this.node) return;
                this.node.elements.forEach(x => {
                    if ("label_width" in x.self.properties) {
                        x.self.properties.label_width = this.args.label_width;
                    }
                })
            },
            args_main_width(val) {
                if (!this.node) return;
                this.node.elements.forEach(x => {
                    if ("main_width" in x.self.properties) {
                        x.self.properties.main_width = this.args.main_width;
                    }
                })
            },
            args_label_align(val) {
                if (!this.node) return;
                this.node.elements.forEach(x => {
                    if ("label_align" in x.self.properties) {
                        x.self.properties.label_align = this.args.label_align;
                    }
                })
            },
            args_main_align(val) {
                if (!this.node) return;
                this.node.elements.forEach(x => {
                    if ("main_align" in x.self.properties) {
                        x.self.properties.main_align = this.args.main_align;
                    }
                })
            },
            'args.back_picture'(val) {
                console.log(val);
                if(val != '') {
                    this.args.back_color = 'transparent';
                }
            }
        }
    }
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
.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}
</style>
