<template>
    <section :addinName="name" :style="{
        'width': colWidth,
        'backgroundImage': 'url(' + args.back_picture + ')',
        'backgroundSize': args.bgSize,
        'backgroundRepeat': args.bgRepeat,
        'backgroundColor': args.back_color
    }">
        <div v-show="!args.hided" :style="bindStyleShow" class="ori-group self-group clearfix" dropTarget="0" ref="root">
            <Dropdown style="float: right; right: 10px; top: 10px" trigger="hover">
                <Icon type="ios-more"></Icon>
                <DropdownMenu slot="list">
                <DropdownItem @click.native="deleteObj()">删除</DropdownItem>
                <DropdownItem @click.native="hide()">隐藏</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    </section>
</template>

<script>
    import '@/styles/component/iconfont.css';

    const name = "Panel";

    export default {
        name: name,
        props: ["itemValue", "Message", "parent"],
        data() {
            return {
                t_preview: false,
                t_show: false,
                t_icon: true,
                t_edit: false,
                name: name,

                // 图标地址
                icon_url: "http://192.168.10.81:6060/dwf/v1/icons/application.png",


                // 编辑框
                args: {
                    border: false,
                    padding: "6px",
                    style: "",
                    title: "面板",
                    id: "",
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

                jsonData: 0,
                parentJson: 0,
            }
        }, methods: {

            hide() {
                this.args.hided = true;
                this.$refs.root.style.display = "none";
            },

            async deleteObj() {
                if (this.parentJson == 0) {
                    this.parentJson = this.getParentJson(this.itemValue.data, this.args.id);
                }
                if (this.jsonData == 0) {
                    if (!this.parentJson) this.jsonData = null;
                    else {
                        this.jsonData = {
                            data: {
                                targetClass: this.itemValue.data.targetClass
                            }
                        };
                        let res = this.getJsonData(this.parentJson, this.args.id);
                        if (res) this.jsonData.data.elements = [res];
                    }
                }
                if (!this.jsonData) {
                    this.Message.error("删除失败");
                    return;
                }
                let obj = this.getObj(this.jsonData.data, false);
                let res = await this.invokeOperation("sys", "delete", this.jsonData, null, null, obj);
                if (res == "cancel") return;
                if (this.parentJson.elements.length == 1 && this.parent.getSelected) {
                    this.parent.deleteItem(this.args.id);
                    return;
                }
                let idx = this.parentJson.elements.findIndex(x => x.self.properties.id == this.args.id);
                if (idx > -1) {
                    this.parentJson.elements.splice(idx, 1);
                }
            },

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

            // 设置插件的显示类型
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
        }, computed: {
          arg_height() {
            return this.args.height + this.args.heightType;
          },
          colWidth() {
            return this.args.width + this.args.widthType;
            // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
          },
            bindStylePreview() {
                return {
                    "width": "100%",
                    "border": this.args.border ? "1px solid #233" : "1px dashed #bbb",
                    "padding": this.args.padding,
                    "min-height": "120px",
                    "background-color": "#fff"
                }
            },
            bindStyleShow() {
                return {
                    "width": "100%",
                    "border": this.args.border ? "1px solid #233" : "none",
                    "padding": this.args.padding,
                    "background-color": this.args.back_color,
                    'min-height': this.arg_height
                }
            }
        }
    }
</script>

<style scoped>
  .clearfix:after {
    visibility: hidden;
    display: block;
    font-size: 0;
    content: " ";
    clear: both;
    height: 0;
  }
</style>
