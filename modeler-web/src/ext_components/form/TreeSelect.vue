<template>
    <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'height': arg_height, 'width': colWidth}" ref="main">

        <!-- 骨架屏效果展示, 实例化后隐藏 -->
        <div class="skeleton" v-show="!isHasTree">
            <div style="height: 20px;">
                <span class="square"></span>
                <span class="rectangle"></span>
            </div>
            <div>
                <div class="left-line"></div>
                <div class="right-content">
                    <ul>
                        <li>
                            <span class="gray-line"></span>
                            <span class="square"></span>
                            <span class="rectangle"></span>
                        </li>
                        <li>
                            <span class="gray-line"></span>
                            <span class="square"></span>
                            <span class="rectangle"></span>
                        </li>
                        <li>
                            <span class="gray-line"></span>
                            <span class="square"></span>
                            <span class="rectangle"></span>
                        </li>
                    </ul>

                    <div>
                        <div class="left-line" style="height: 51px; margin-left: 29px;"></div>
                        <div class="right-content">

                            <ul>
                                <li>
                                    <span class="gray-line"></span>
                                    <span class="square"></span>
                                    <span class="rectangle"></span>
                                </li>
                                <li>
                                    <span class="gray-line"></span>
                                    <span class="square"></span>
                                    <span class="rectangle"></span>
                                </li>
                            </ul>

                            <div>
                                <div class="left-line" style="height: 21px; margin-left: 29px;"></div>
                                <div class="right-content">
                                    <ul>
                                        <li>
                                            <span class="gray-line"></span>
                                            <span class="square"></span>
                                            <span class="rectangle"></span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>

                    <ul style="position: relative; top: 10px;">
                        <li>
                            <span class="gray-line"></span>
                            <span class="square"></span>
                            <span class="rectangle"></span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 骨架屏效果展示 -->

        <div v-show="isHasTree" :style="{'width': '100%', 'height': '100%', 'background': '#fff', 'padding': '10px', 'overflow': 'auto'}">
            <Tree v-for="item in args.treeList" :data="item" :render="renderWithButton"></Tree>
        </div>

        <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args" :attributes="filter_attributes">
                <div slot="attribute">
                    <p class="margin1">构成</p>
                    <Button class="margin1" type="primary" @click="editTreeData">编辑</Button>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
            </Collapse>
        </span>

        <!-- 树型数据编辑弹窗 -->
        <TreeEditModal ref="tree_modal" @transferTree="getTreeList"></TreeEditModal>

    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe653;</i>
            </div>
            <div class="form-addin-name">
                结构树
            </div>
        </span>
    </section>
</template>

<script>

import EditBox from "./_EditBox.vue"
import TreeEditModal from './subcomponent/TreeCommonModal'
const name = "TreeSelect";

export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "attributes"],
    data() {
        return {
	times: 0,
            name: name,

            t_preview: true,
            t_edit: false,
            isHasTree: false,


      actEdit: false,
      args: {
                width: 100,
                widthType: '%',
                title: '自定义结构树',
                height: 300,
                heightType: "px",
                col: true,
                rows: 3,
                cols: 3,
                targetDataType: null,
                placeholder: "",
                hided: false,

                treeList: [],
            },

            treeRowWrap: {
                display: 'inline-block',
                width: 'calc(100% - 20px)',
                padding: '4px 0',
                borderBottom: '1px solid #ddd',
                lineHeight: '32px'
            },

            // 支持的数据类型
            dataTypes: ['String', 'UUID', 'Clob'],

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

            attrMap: {},

            open: ["1","2"],

            timer: null
        }
    },
    components: {
        EditBox,
        TreeEditModal
    },
    created() {
        if(this.t_preview) {
            let that = this;
            if(this.attributes) this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
        }
    },
    mounted() {
        if(this.t_preview) {
            this.setHeight();

            if(this.args.treeList.length > 0) {
                this.isHasTree = true;
            }
        }
    },
    watch: {
        arg_name(val) {
            if (val in this.attrMap) {
                this.args.label = this.attrMap[val].displayName;
                this.args.targetDataType = this.attrMap[val].valueType;
            }
        }
    },
    computed: {
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
            // return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
        },
        filter_attributes() {
            return this.attributes ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) : [];
        },
    },
        beforeDestroy() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; };
        },
    methods: {

            // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
            setHeight() {
                return;
				// if (!this.$refs.main) return;
				// let that = this;
				// this.timer = setInterval(() => {
				// 	if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
				// 	// 改成你需要的样式
				// 	var dom = that.$refs.main.querySelector(".i-input .ivu-input");
				// 	if (dom) {
				// 		dom.style.height = that.arg_height + "px";
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// 	that.times += 30;
				// 	if (that.times > 60 * 1000) {
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// }, 30);
			},
        setDisplayType(type) {
            if (type == 0) this.t_preview = true;
            else this.t_preview = false;
            return this;
        },
        getFormName() {
            return this.args.name;
        },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            if ("name" in args) this.args_name = this.args.name;
            return this;
        },
        getArgs() {
            return this.args;
        },
        getAllow() {
            return null;
        },
        getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
            this.t_edit = true;
            return this.$refs.edit;
        },

        // 自定义树结构
        renderWithButton(h, {root, node, data}) {
            return <div style={[this.treeRowWrap]}>
                <icon type={data.iconName} style="margin-right:8px;"/>
                {data.label}
            </div>;
        },

        // 编辑显示弹窗
        editTreeData() {
            this.$refs.tree_modal.editModal(true, this.args.treeList);
        },

        // 得到树列表
        getTreeList(data) {

            this.args.treeList = data;

            this.isHasTree = true;
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

.skeleton {
    height: 300px;
}

.square {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: #e2dfdf;
    margin-right: 10px;
}

.rectangle {
    display: inline-block;
    width: 80px;
    height: 20px;
    background: #e2dfdf;
}
.left-line {
    float: left;
    width: 2px;
    height: 280px;
    background: #e2dfdf;
    margin-left: 9px;
}
.right-content {
    float: left;
}
.right-content ul li {
    margin-top: 10px;
    height: 20px;
}
.gray-line {
    display: inline-block;
    position: relative;
    top: -9px;
    width: 20px;
    height: 2px;
    background: #e2dfdf;
}
</style>
