<template>
    <section v-if="t_preview" :addinName="name">
        <Table :border="showBorder" :stripe="showStripe" :show-header="showHeader" :height="fixedHeader ? 250 : ''" :size="tableSize" :data="simpleData" :columns="simpleColumns"></Table>
        <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
            :attributes="filter_attributes"
            :router="router"
            :route="route"
            :root="root"
            :query_oprs="query_oprs"
            :targetclass="itemValue.data.targetclass">
                <div slot="attribute">
                    <p class="margin1">选择类</p>
                    <Select class="margin1" v-model="args.refClass" filterable @on-change="selectedTargetClass">
                        <Option v-for="entity in allEntityClasses" :value="entity.className" :key="entity.id" :label="entity.displayName">
                            <span>{{ entity.displayName }}</span>
                            <span style="float:right;color:#ccc">{{ entity.className }}</span>
                        </Option>
                    </Select>
                    <Row class="margin1">
                        <Col span="12" style="text-align: center">
                            <Button
                            type="primary"
                            style="text-align: center; width: 90%"
                            @click="showAttrModal"
                            >选择属性</Button>
                        </Col>
                        <!-- <Col span="12" style="text-align: center">
                            <Button
                            type="primary"
                            style="text-align: center; width: 90%"
                            @click="initColumnDefs"
                            >更新预览</Button>
                        </Col> -->
                    </Row>
                </div>
                <div slot="layout">
                    <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        显示边框
                        <i-switch v-model="showBorder" style="margin-right: 5px"></i-switch>
                    </div>
                    <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        显示斑马纹
                        <i-switch v-model="showStripe" style="margin-right: 5px"></i-switch>
                    </div>
                    <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        显示索引
                        <i-switch v-model="showIndex" style="margin-right: 5px"></i-switch>
                    </div>
                    <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        显示多选框
                        <i-switch v-model="showCheckbox" style="margin-right: 5px"></i-switch>
                    </div>
                    <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        显示表头
                        <i-switch v-model="showHeader" style="margin-right: 5px"></i-switch>
                    </div>
                    <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        是否滚动
                        <i-switch v-model="fixedHeader" style="margin-right: 5px"></i-switch>
                    </div>
                    <p class="margin1">表格大小</p>
                    <Radio-group v-model="tableSize" type="button">
                        <Radio label="large">大</Radio>
                        <Radio label="default">中(默认)</Radio>
                        <Radio label="small">小</Radio>
                    </Radio-group>
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>
        <Modal
            v-model="attrModal"
            title="选择表格展示所需属性"
            @on-ok="chooseAttr"
            @on-cancel="cancel">
            <Card>
                <p slot="title">
                    <Icon type="ios-film-outline"></Icon>
                    属性集合
                </p>
                <checkbox-group v-model="tableAttr">
                    <checkbox v-for="(item, index) in filter_attributes"
                    :key="index"
                    :label="item.attributeName"
                    style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                </checkbox-group>
            </Card>
        </Modal>
    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe612;</i>
            </div>
            <div class="form-addin-name">
                简单表格
            </div>
        </span>
    </section>
</template>

<script>

import EditBox from "./_EditBox.vue"
import EntityModeling from "@/api/data-model/EntityModeling";
import { getEobj } from '@/api/others';

const name = "LightTable";
export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "attributes", "itemValue", "query_oprs", "route", "router", "root"],
    data() {
        return {
	        times: 0,
            name: name,

            t_preview: true,
            t_edit: false,
            attrModal: false,


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
                refClass: null,
                targetDataType: null,
                placeholder: "",
                events: [],
            },

            queryData: {
                query: {query: "",}, // 查询条件
                targetClass: "",    // 目标类名
                formName: "",   //
                uuid: ""
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

            timer: null,

            simpleData: [
                {
                    name: 'John Brown',
                    age: 18,
                    address: 'New York No. 1 Lake Park',
                    date: '2016-10-03'
                },
                {
                    name: 'Jim Green',
                    age: 24,
                    address: 'London No. 1 Lake Park',
                    date: '2016-10-01'
                },
                {
                    name: 'Joe Black',
                    age: 30,
                    address: 'Sydney No. 1 Lake Park',
                    date: '2016-10-02'
                },
                {
                    name: 'Jon Snow',
                    age: 26,
                    address: 'Ottawa No. 2 Lake Park',
                    date: '2016-10-04'
                },
                {
                    name: 'John Brown',
                    age: 18,
                    address: 'New York No. 1 Lake Park',
                    date: '2016-10-03'
                },
                {
                    name: 'Jim Green',
                    age: 24,
                    address: 'London No. 1 Lake Park',
                    date: '2016-10-01'
                },
                {
                    name: 'Joe Black',
                    age: 30,
                    address: 'Sydney No. 1 Lake Park',
                    date: '2016-10-02'
                },
                {
                    name: 'Jon Snow',
                    age: 26,
                    address: 'Ottawa No. 2 Lake Park',
                    date: '2016-10-04'
                }
            ],

            showBorder: false,
            showStripe: false,
            showHeader: true,
            showIndex: true,
            showCheckbox: false,
            fixedHeader: false,
            tableSize: 'default',

            allEntityClasses: [],

            refClassAttributes: [],

            tableAttr: []
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
        this.initData();
    },
    watch: {
        arg_name(val) {
            if (val in this.attrMap) {
                this.args.label = this.attrMap[val].displayName;
                this.args.targetDataType = this.attrMap[val].valueType;
            }
        },
        "args.refClass": function(newRefClass, oldRefClass) {
            if(newRefClass === null || newRefClass === '') {
                return;
            }

            // 获取RefClass的属性数组refClassAttributes
            EntityModeling.getEntity(newRefClass)
            .then(res => {
                this.refClassAttributes = res.data.attributes;
            })
            .catch(error => {
                this.$Message.error(error.response.data.message);
            });

            this.queryData.targetClass = newRefClass;

        },
    },
    computed: {
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height * this.args.basic_height;
        },
        colWidth() {
            return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
        },
        labelWidth() {
            return parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        },
        mainWidth() {
            return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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
        filter_attributes() {
            return this.attributes ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) : [];
        },

        simpleColumns () {
            let columns = [];
            if (this.showCheckbox) {
                columns.push({
                    type: 'selection',
                    width: 60,
                    align: 'center'
                })
            }
            if (this.showIndex) {
                columns.push({
                    type: 'index',
                    width: 60,
                    align: 'center'
                })
            }
            columns.push({
                title: 'Date',
                key: 'date',
                sortable: true
            });
            columns.push({
                title: 'Name',
                key: 'name'
            });
            columns.push({
                title: 'Age',
                key: 'age',
                sortable: true,
                filters: [
                    {
                        label: 'Greater than 25',
                        value: 1
                    },
                    {
                        label: 'Less than 25',
                        value: 2
                    }
                ],
                filterMultiple: false,
                filterMethod (value, row) {
                    if (value === 1) {
                        return row.age > 25;
                    } else if (value === 2) {
                        return row.age < 25;
                    }
                }
            });
            columns.push({
                title: 'Address',
                key: 'address',
                filters: [
                    {
                        label: 'New York',
                        value: 'New York'
                    },
                    {
                        label: 'London',
                        value: 'London'
                    },
                    {
                        label: 'Sydney',
                        value: 'Sydney'
                    }
                ],
                filterMethod (value, row) {
                    return row.address.indexOf(value) > -1;
                }
            });
            return columns;
        },
        filter_refClassAttributes: function () {
            return (this.refClassAttributes.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes.filter(attr => attr.valueType === "String")) : []);
        }

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
        },

        // 选择目标类
        selectedTargetClass(value) {
            console.log(value);
            if(!value) return false;

            getEobj(value).then(response => {
                const res = response.data.data;
                console.log(res);
                // if(res.success) {
                //     this.args.exportTable = res.data;
                // }
            }).catch(e => {
                console.log(e);
            });
        },

        // 选择所需属性
        chooseAttr() {

        },

        cancel() {},

        showAttrModal() {
            this.attrModal = true;
        },

        initData() {
            EntityModeling.getAllEntities()
            .then(res => {
            this.allEntityClasses = res.data;
            })
            .catch(error => {
                this.$Message.error('获取实体类失败：' + error.response.data.message);
            });
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
