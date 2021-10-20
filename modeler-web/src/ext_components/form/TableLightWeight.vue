<template>
    <section v-if="t_preview" :addinName="name">
        <zk-table
            ref="table"
            sum-text="sum"
            index-text="#"
            :data="treeTableData"
            :columns="columns"
            :stripe="props.stripe"
            :border="props.border"
            :show-header="props.showHeader"
            :show-summary="props.showSummary"
            :show-row-hover="props.showRowHover"
            :show-index="props.showIndex"
            :tree-type="props.treeType"
            :is-fold="props.isFold"
            :expand-type="props.expandType"
            :selection-type="props.selectionType">
            <!-- 原文中 scope="scope" 会警告， 2.5版本后应为slot-scope="scope"-->
            <template slot="active" slot-scope="scope">
                <Icon type="md-heart" style="color: red;"></Icon>
            </template>

            <template slot="empower" slot-scope="scope">
                <Icon type="ios-star" style="color: yellow;"></Icon>
            </template>
        </zk-table>
        <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :query_oprs="query_oprs"
                :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>
    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe636;</i>
            </div>
            <div class="form-addin-name">
                树状表格
            </div>
        </span>
    </section>
</template>

<script>

import EditBox from "./_EditBox.vue"

const name = "TableLightWeight";
export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "attributes", "itemValue", "query_oprs", "route", "router", "root"],
    data() {
        return {
            props: {
                stripe: false,         //是否显示间隔斑马纹
                border: false,         //是否显示纵向边框
                showHeader: true,      //是否显示表头
                showSummary: false,    //是否显示表尾合计行
                showRowHover: true,    //鼠标悬停时，是否高亮当前行
                showIndex: false,      //是否显示数据索引
                treeType: true,        //是否为树形表格
                isFold: true,          //树形表格中父级是否默认折叠
                expandType: false,     //是否为展开行类型表格（为 True 时，需要添加作用域插槽, 它可以获取到 row, rowIndex)
                selectionType: false,  //是否显示间隔斑马纹
            },

            treeTableData: [
            {
                name: '根组织',
                description: '111',
                owner:'admin',
                active: true,
                children: [
                {
                    name: '大中华区',
                    description: '',
                    owner: '',
                    active: true,
                    children: [
                    {
                        name: '浙江省',
                        description: '',
                        owner: '',
                        active: true,
                        children: [
                        {
                            name: '杭州市',
                            description: '',
                            owner: '',
                            active: true
                        }
                        ]
                    }
                    ]
                }
                ],
            },
            {
                name: 'Tom',
                sex: 'male',
                likes: ['football', 'basketball'],
                score: 20,
            },
            ],
            //表格标题数据
            columns: [
                {
                    label: "用户组名",
                    prop: "name"
                },
                {
                    label: "描述",
                    prop: "description",
                    minWidth: 50
                },
                {
                    label: "所有者",
                    prop: "owner"
                },
                {
                    label: "状态",
                    prop: "active",
                    type: "template",
                    template: "active"
                },
                {
                    label: "授权",
                    type: "template",
                    template: "empower"
                }
            ],

	        times: 0,
            name: name,

            t_preview: true,
            t_edit: false,


      actEdit: false,
      args: {
                label_width: 2,
                main_width: 3,
                label_align: 4,
                main_align: 4,
                basic_height: 30,
                label: "",
                name: "",
                height: 1,
                col: true,
                rows: 3,
                cols: 3,
                targetDataType: null,
                events: [],
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
        EditBox
    },
    created() {
        let that = this;
        if(this.attributes) this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
    },
    mounted() {
        this.setHeight();
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
            return this.args.height * this.args.basic_height;
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
            //     if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
            //     // 改成你需要的样式
            //     var dom = that.$refs.main.querySelector(".i-input .ivu-input");
            //     if (dom) {
            //         dom.style.height = that.arg_height + "px";
            //         clearInterval(that.timer);
            //         that.timer = null;
            //     }
            //     that.times += 30;
            //     if (that.times > 60 * 1000) {
            //         clearInterval(that.timer);
            //         that.timer = null;
            //     }
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
</style>
