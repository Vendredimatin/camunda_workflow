<template>
    <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
        <van-tree-select
            class="vant-tree"
            :height="arg_height"
            :items="temTreeList"
            :active-id.sync="args.activeIds"
            :main-active-index.sync="args.activeIndex"
        />
        <Spin fix v-if="spinShow"></Spin>

        <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :itemValue="itemValue"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :query_oprs="query_oprs"
                :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <p class="margin1">实体类</p>
                    <Select class="margin1 editbox-targetClass editbox-self-joins-tree" v-model="args.targetClass" filterable clearable @on-change="changeClass">
                        <OptionGroup label="实体类">
                          <Option v-for="item in all_class" :key="item.id" :value="item.className" :label="item.displayName">
                              <span style="font-size: 12px;">{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc;font-size: 12px;">{{ item.className }}</span>
                          </Option>
                        </OptionGroup>
                        <OptionGroup label="外部实体类">
                          <Option v-for="item in allExternalEntities" :key="item.id" :value="item.className" :label="item.displayName">
                              <span style="font-size: 12px;">{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc;font-size: 12px;">{{ item.className }}</span>
                          </Option>
                        </OptionGroup>
                    </Select>
                    <p class="margin1">关联属性</p>
                    <Select ref="labelAttrSelect" class="margin1 editbox-self-joins-tree" v-model="args.relationAttr" filterable clearable>
                        <OptionGroup label="系统属性">
                        <Option v-for="(attr, index) in targetClassAttributes.sysAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                        <OptionGroup label="类属性">
                        <Option v-for="(attr, index) in targetClassAttributes.selfAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                    </Select>
                    <p class="margin1">根节点标签</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.rootLabel" @on-focus="setLable(1)" />
                    <p class="margin1">子孙节点标签</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.childrenLabel" @on-focus="setLable(2)" />
                    <p class="margin1">根节点为空时标签</p>
                    <Input class="margin1" v-model="args.rootEmptyLabel" />
                    <p class="margin1">子节点为空时标签</p>
                    <Input class="margin1" v-model="args.childrenEmptyLabel" />
                    <p class="margin1">根节点查询条件</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.rootQuery" @on-focus="setLable(3)" />
                    <p class="margin1">子孙节点查询条件</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.childrenQuery" @on-focus="setLable(4)"/>

                    <div class="margin1" style="margin: 10px 0 10px 0">
                        多选
                        <i-switch style="float: right" v-model="args.multiSwitch" @on-change="changeMulti" />
                    </div>

                    <Row class="margin1">
                        <Col span="10">
                            <Button type="primary" @click="updateTree">更新预览</Button>
                        </Col>
                    </Row>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>

        <!-- 设置节点标签弹窗 -->
        <Modal
            v-model="lableModal"
            width="700"
            title="设置标签"
            >
            <Row class="lableTxt">
                <Col span="4">
                    <span>{{ editLabelSpan }}</span>
                </Col>
                <Col span="18" offset="1">
                    <Input v-model="selfRootLable" type="textarea" :autosize="true" @on-change="mapAttr"/>
                </Col>
            </Row>
            <p class="attrTitle" v-show="!isChildLable">实体类属性:</p>
            <div class="attrBox" v-show="!isChildLable">
                <CheckboxGroup v-model="args.selected_entities_attributes" @on-change="clickAttr">
                    <Collapse simple v-model="selfGroup">
                        <Panel name="1">
                            系统属性
                            <div slot="content">
                                <Checkbox
                                    v-for="item in targetClassAttributes.sysAttr"
                                    :key="item.id"
                                    :label="`obj.${item.attributeName}`"
                                    class="commonLabel"
                                    >{{ item.displayName }}
                                </Checkbox>
                            </div>
                        </Panel>
                        <Panel name="2">
                            类属性
                            <div slot="content">
                                <Checkbox
                                    v-for="item in targetClassAttributes.selfAttr"
                                    :key="item.id"
                                    :label="`obj.${item.attributeName}`"
                                    class="commonLabel"
                                    >{{ item.displayName }}
                                </Checkbox>
                            </div>
                        </Panel>
                    </Collapse>
                </CheckboxGroup>
            </div>
            <p class="attrTitle" v-show="isChildLable">关联实体类属性:</p>
            <div class="attrBox" v-show="isChildLable">
                <CheckboxGroup v-model="args.selected_relation_entities_attributes" @on-change="clickRelationEntitiesAttr">
                    <Collapse simple v-model="selfENGroup">
                        <Panel name="1">
                            关联实体类系统属性
                            <div slot="content">
                                <Checkbox
                                    v-for="item in targetClassAttributes.sysAttr"
                                    :key="item.id"
                                    :label="`obj.${item.attributeName}`"
                                    class="commonLabel"
                                    >{{ item.displayName }}
                                </Checkbox>
                            </div>
                        </Panel>
                        <Panel name="2">
                            关联实体类类属性
                            <div slot="content">
                                <Checkbox
                                    v-for="item in targetClassAttributes.selfAttr"
                                    :key="item.id"
                                    :label="`obj.${item.attributeName}`"
                                    class="commonLabel"
                                    >{{ item.displayName }}
                                </Checkbox>
                            </div>
                        </Panel>
                    </Collapse>
                </CheckboxGroup>
            </div>
            <div slot="footer">
                <Button type="text" @click="lableModal = false">取消</Button>
                <Button type="primary" @click="confirmLable">确认</Button>
            </div>
        </Modal>
        <!-- 设置节点标签弹窗ending -->

        <!-- 根子节点过滤条件组件  -->
        <FilterQueryCommonModal
            v-if="actEdit" :addinName="name"
            :args="args"
            :itemValue="itemValue"
            :refClass="`${args.targetClass}&e`"
            :targetClass="itemValue.data.targetClass"
            ref="filterQuery_modal"
            :root="root"
            :store="store"
            @generatorFilterQuery="getFilterQuery">
        </FilterQueryCommonModal>

    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6c8;</i>
            </div>
            <div class="form-addin-name">
                树选择
            </div>
        </span>
    </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { getSelfJoinEobj, getAllEntities } from '@/api/others';
import { getAttributeBindClasses } from "@/api/data-model/AttributesLib";
import FilterQueryCommonModal from '@/ext_components/form/subcomponent/FilterQueryCommonModal'
import EditBox from "@/ext_components/form/_EditBox.vue"
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js'
import moduleIconData from "@/views/functional-model/components/moduleIcon.js";
import {getAttributes, getExternalEntities} from "@/api/data-model/EntityModeling";

const name = "TreeSelect";

export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" ,
        "itemValue",
        "attributes",
        "store",
        "query_oprs",
        "route",
        "router",
        "root",
        "Message"
    ],
    data() {
        return {

            iconList: [],

            lableModal: false,
            isChildLable: false,
            spinShow: false,
            actEdit: false,
            needIcon: false,
            operationModal: false,     //节点操作弹窗
            firstLoad: true,
            selfGroup: '2',
            selfENGroup: '2',
            selfREGroup: '2',

            editLabelSpan: '编辑节点标签:',

            targetClassAttributes: {
                sysAttr: [],
                selfAttr: []
            },
            clickData: [],
            treePageIndex: 1,
            treeTotal: 0,
            pageSizeOpts: [10, 25, 50, 100, 200],

            all_class: [],
            allExternalEntities: [],
            // relations: [],
            transRootQuerys: '',
            transRootLabel: '',
            l_relation: [],
            r_relation: [],
            classAttrMap: {},
            relationMap: {},

            selected_attributes: [],
            selfRootLable: '',

            lastAttr: [],
            lastRelationAttr: [],
            lastRelationEntitiesAttr: [],

            lastQueryAttr: [],
            lastQueryRelationAttr: [],
            lastQueryRelationEntitiesAttr: [],

            isRootLable: 0,
            searchKey: '',

	        times: 0,
            name: name,

            t_preview: true,
            t_edit: false,
            temTreeList: [],

            args: {

                multiSwitch: false,    //多选
                activeIds: 1,
                activeIndex: 0,

                title: '树选择',
                width: 100,
                widthType: "%",
                height: 300,
                heightType: 'px',
                col: true,
                hided: false,
                rows: 3,
                cols: 3,
                targetDataType: null,

                treeList: [],

                targetClass: '',            // 目标类
                rootLabel: '',
                relationAttr: '',
                childrenLabel: '',
                rootQuery: '',
                childrenQuery: '',
                rootEmptyLabel: '',
                childrenEmptyLabel: '',

                selected_entities_attributes: [],                // 左实体 关联类 右实体的属性
                selected_relations_attributes: [],
                selected_relation_entities_attributes: [],

                transCLabel: '',

                events: [],
                eventRange: ["点击导航", "点击项"]
            },

            filterStatus: '3',   // 当前正在设置父或子的过滤条件

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
        FilterQueryCommonModal
    },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);

        if(this.t_preview){
            this.$store = this.store;
            let that = this;
            if(this.attributes) this.attributes.forEach(x => that.attrMap[x.attributeName] = x)

        }
    },
    async mounted() {

        if(this.t_preview) {

            this.initData();
            if(this.args.treeList.length > 0 || this.args.relationAttr) {
                this.updateTree(1);
            } else {

                this.$nextTick(() => {

                    this.temTreeList = [
                        { 
                            text: '浙江', 
                            children: [
                                {
                                    text: '杭州',
                                    id: 1
                                }, {
                                    text: '温州',
                                    id: 2
                                }, {
                                    text: '宁波',
                                    id: 3
                                }
                            ] 
                        }, { 
                            text: '江苏', 
                            children: [
                                {
                                    text: '南京',
                                    id: 4
                                }, {
                                    text: '无锡',
                                    id: 5
                                }, {
                                    text: '徐州',
                                    id: 6
                                }
                            ] 
                        }
                    ]

                    this.args.activeIds = 1;
                    this.args.activeIndex = 0;

                })

            }
        }

    },

    computed: {
        ...mapGetters("DWF_form", [
            "EntityAttrList",
            "Entities"
        ]),
        arg_width() {
            return this.args.width + this.args.widthType;
        },
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
        },
        filter_attributes() {
            return this.attributes ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) : [];
        },
    },
    watch: {
    },
    beforeDestroy() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; };
    },
    methods: {
        ...mapActions("DWF_form", [
            "queryEntity"
        ]),
        async initData() {

            let treeEn = await getAllEntities();
            if(treeEn && treeEn.data.success){
                this.all_class = treeEn.data.data.filter(en => en.classCategory !== 'ExternalItemClass');
                this.allExternalEntities = treeEn.data.data.filter(en => en.classCategory === 'ExternalItemClass');
            }

            if(!this.itemValue.data.isRelation && (!this.args.targetClass || this.args.targetClass == '')) {
                this.args.targetClass = this.itemValue.data.targetClass;
            }
            this.changeClass(this.args.targetClass);

        },

        changeMulti(value) {

            if(value) {
                this.args.activeIds = [];
            } else {
                this.args.activeIds = 1;
            }

        },

        // 自定义 根lable 1: 标签 3: 条件
        clickAttr(value) {

            if(this.isRootLable == '1') {

                if(value.length > this.lastAttr.length) {
                    this.selfRootLable = this.selfRootLable + value[value.length - 1] + '/';
                } else {
                    let delAttr = this.lastAttr.concat(value).filter(v => this.lastAttr.includes(v) && !value.includes(v));
                    this.selfRootLable = this.selfRootLable.replace(`${delAttr[0]}/`,'');
                }

                this.lastAttr = value;

            } else {

                if(value.length > this.lastQueryAttr.length) {
                    this.selfRootLable = this.selfRootLable + value[value.length - 1] + ' ';
                } else {
                    let delAttr = this.lastQueryAttr.concat(value).filter(v => this.lastQueryAttr.includes(v) && !value.includes(v));
                    this.selfRootLable = this.selfRootLable.replace(`${delAttr[0]} `,'');
                }

                this.lastQueryAttr = value;

            }
        },

        // (关联实体类) 2: 标签 4: 条件
        clickRelationEntitiesAttr(value) {

            if(this.isRootLable == '2') {

                if(value.length > this.lastRelationEntitiesAttr.length) {
                    this.selfRootLable = this.selfRootLable + value[value.length - 1] + '/';
                } else {
                    let delAttr = this.lastRelationEntitiesAttr.concat(value).filter(v => this.lastRelationEntitiesAttr.includes(v) && !value.includes(v));
                    this.selfRootLable = this.selfRootLable.replace(`${delAttr[0]}/`,'');
                }

                this.lastRelationEntitiesAttr = value;

            } else {

                if(value.length > this.lastQueryRelationEntitiesAttr.length) {
                    this.selfRootLable = this.selfRootLable + value[value.length - 1] + ' ';
                } else {
                    let delAttr = this.lastQueryRelationEntitiesAttr.concat(value).filter(v => this.lastQueryRelationEntitiesAttr.includes(v) && !value.includes(v));
                    this.selfRootLable = this.selfRootLable.replace(`${delAttr[0]} `,'');
                }

                this.lastQueryRelationEntitiesAttr = value;
            }

        },

        /**
         * @description 更改实体类 reset标签条件
        */
        async changeClass(value) {

            // reset节点标签条件等
            if(!this.firstLoad) {

                this.temTreeList = [];
                this.args.treeList = [];

                this.args.rootLabel = '';
                this.args.childrenLabel = '';

                this.selfRootLable = '';
                this.lastAttr = [];
                this.lastRelationAttr = [];
                this.lastRelationEntitiesAttr = [];
                this.lastQueryAttr = [];
                this.lastQueryRelationAttr = [];
                this.lastQueryRelationEntitiesAttr = [];
                this.args.selected_entities_attributes = [];
                this.args.selected_relations_attributes = [];
                this.args.selected_relation_entities_attributes = [];

                this.args.rootEmptyLabel = '';
                this.args.childrenEmptyLabel = '';
                this.args.rootQuery = '';
                this.args.childrenQuery = '';

            } else {
                this.firstLoad = false;
            }


          if(!value || value == undefined) return false;

          if(this.allExternalEntities.filter(en => en.className === value).length !== 0){
            this.args.classCategory = 'ExternalItemClass';
          }else{
            this.args.classCategory = 'ItemClass';
          }
          // 获取当前所选目标实体类的全部属性
          // let allEnAttr = this.EntityAttrList(value);
          let allEnAttr = await getAttributes(value);

          this.targetClassAttributes.sysAttr = allEnAttr.data.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          this.targetClassAttributes.selfAttr = allEnAttr.data.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
        },

        /**
         * @description 设置节点标签 及 过滤条件
         * @status 1:设置根节点标签； 2: 设置子节点标签；3: 设置根节点过滤条件；4: 设置子节点过滤条件；
        */
       async setLable(status) {

            // 确认当前编辑 根 或 子 节点状态
            this.isRootLable = status;

            // 获取当前所选目标实体类的全部属性
            await this.queryEntity(this.args.targetClass);
            let allEnAttr = this.EntityAttrList(this.args.targetClass);
            this.targetClassAttributes.sysAttr = allEnAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.targetClassAttributes.selfAttr = allEnAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);

            if(status == '1') {

               this.editLabelSpan = '编辑节点标签:'
               this.selfRootLable = this.args.rootLabel;

                // 回填checkBox数据
               if(this.args.rootLabel != '') {

                    let eCheckObj = this.args.rootLabel.split('/');
                    eCheckObj.pop();
                    this.args.selected_entities_attributes = eCheckObj;
                    if(this.lastAttr.length == 0) {
                        this.lastAttr = eCheckObj;
                    }

               } else {

                   this.args.selected_entities_attributes = [];
               }

               this.lableModal = true;

               // 设置根节点标签 隐藏关联类的属性展示板
               this.isChildLable = false;

            } else if(status == '2') {

               this.editLabelSpan = '编辑节点标签:'
               if(this.args.targetClass == '') {

                   this.$Message.warning('请先选择实体类');

               } else {

                   this.selfRootLable = this.args.childrenLabel;

                   // 回填checkBox数据
                   if(this.args.childrenLabel != '') {

                       let allCheckObj = this.args.childrenLabel.split('/');

                        this.args.selected_relation_entities_attributes = allCheckObj;

                        if(this.lastRelationEntitiesAttr.length == 0) {
                            this.lastRelationEntitiesAttr = allCheckObj;
                        }

                   } else {
                       this.args.selected_relation_entities_attributes = [];
                   }

                   this.lableModal = true;

                    // 显示子节点checkBox
                    this.isChildLable = true;
               }

            } else if(status == '3') {

                // this.editLabelSpan = '编辑节点条件:'
                // this.args.selected_entities_attributes = [];

                // // 隐藏关联类属性面板
                // this.isChildLable = false;

                // this.selfRootLable = this.args.rootQuery;

                // this.lableModal = true;

                if(this.args.targetClass == '') {
                    this.$Message.warning('请先选择实体类');
                } else {

                    this.filterStatus = '3';
                    let filterObj = {
                        refClassDisabled: true,
                        allowNative: false,
                        hideRelationClass: []
                    }

                    this.$refs.filterQuery_modal.initModal(this.args.rootQuery, this.args.targetClass.split('&')[0], filterObj, false);

                }

            } else {

                // this.editLabelSpan = '编辑节点条件:'
                // this.args.selected_relation_entities_attributes = [];
                // this.args.selected_relations_attributes = [];

                // // 显示关联类属性面板
                // this.isChildLable = true;

                // this.selfRootLable = this.args.childrenQuery;

                // this.lableModal = true;
                if(this.args.targetClass == '') {
                    this.$Message.warning('请先选择实体类');
                } else {

                    this.filterStatus = '4';
                    let filterObj = {
                        refClassDisabled: true,
                        allowNative: false,
                        hideRelationClass: []
                    }

                    this.$refs.filterQuery_modal.initModal(this.args.childrenQuery, this.args.targetClass.split('&')[0], filterObj, false);

                }

            }

       },

       getFilterQuery(transQuery){

            if(this.filterStatus == '3') {
                this.args.rootQuery = transQuery;
            } else {
                this.args.childrenQuery = transQuery;
            }

        },

       /**
         * @description 确认生成回填配置项
         * @isRootLable 1:回填根节点标签； 2: 回填子节点标签；3: 回填根节点过滤条件；4: 回填子节点过滤条件；
        */
       confirmLable() {

           if((this.isRootLabel == '1' || this.isRootLabel == '2') && this.selfRootLable == '') {

               this.$Message.warning('请先选择所需展示属性');

           } else {

               // 确认生成根节点标签
               if(this.isRootLable == '1') {

                   this.args.rootLabel = this.selfRootLable;

                } else if(this.isRootLable == '2') {

                    this.args.childrenLabel = this.selfRootLable;

                } else if(this.isRootLable == '3') {

                    this.args.rootQuery = this.selfRootLable;

                } else {

                    this.args.childrenQuery = this.selfRootLable;
                }

                this.lableModal = false;
           }

       },

       /**
        * @description 清空输入框map属性
       */
       mapAttr(event) {

        if(!event.data) {

            this.args.selected_entities_attributes = [];
            this.args.selected_relation_entities_attributes = [];
            this.args.selected_relation_entities_attributes = [];

            this.lastAttr = [];
            this.lastRelationAttr = [];
            this.lastRelationEntitiesAttr = [];

            this.lastQueryAttr = [];
            this.lastQueryRelationAttr = [];
            this.lastQueryRelationEntitiesAttr = [];

        }

       },

        // 遍历子节点
        getEachTree(tree = [], targetItem) {
            let arr = [];
            let _self = this;
            if (!!tree && tree.length !== 0) {
                tree.forEach(item => {

                    // 子节点label拼接结果
                    let temCAttr = '';
                    this.args.transCLabel.forEach(i => {

                        if(item[i]) {
                            temCAttr = temCAttr + item[i] + '/'
                        }

                    })
                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }

                    let obj = item;
                    obj.text = temCAttr;
                    if(obj.text == '') {

                        obj.text = this.args.childrenEmptyLabel;
                    }

                    obj.rootFlag = false;
                    let isHasChild = _self.getEachTree(item.children, item);
                    if(isHasChild.length > 0) {
                        obj.expand = true;
                    }
                    if(item.childrenCount > 0) {
                        obj.loading = false;
                        obj.children = isHasChild;
                    }
                    arr.push(obj);
                });
            }
            return arr;
        },

        /**
         * @description 更新树数据
        */
        async updateTree(startPNum) {

            if(this.args.rootLabel == '') {

                this.$Message.warning('请先选择根节点标签');

            } else if(this.args.childrenLabel == '') {

                this.$Message.warning('请先选择子节点标签');

            } else {

                this.args.treeList = [];
                this.temTreeList = [];

                // 如果关闭懒加载开关 层数参数提供10000
                let treeParam = {
                    childrenCondition: this.args.childrenQuery,
                    leafCondition: '',
                    recursiveLevel: 2,
                    rootCondition: this.args.rootQuery,
                    startIndex: 0,
                    pageSize: 3
                }
                console.log(this.args.rootQuery)

                // *********** 转换根节点标签内容
                let temTransRootLabel = this.args.rootLabel.replace(/obj\./g, '');

                this.transRootLabel = temTransRootLabel.split('/');
                if(this.transRootLabel[this.transRootLabel.length - 1] == '') {
                    this.transRootLabel.pop();
                }

                // ************ 转换子节点标签内容
                let transChildrenLabel = this.args.childrenLabel.replace(/obj\./g, '');

                // get关联实体类选择的属性 & 关联类选择的属性的数组 例["relationClass_rcfd", "rightClass_version"]
                this.args.transCLabel = transChildrenLabel.split('/');
                if(this.args.transCLabel[this.args.transCLabel.length - 1] == '') {
                    this.args.transCLabel.pop();
                }

                // 整理label distinct属性集合
                // let searchStr = '';
                // if(this.searchKey != '') {

                //     let s = this.searchKey;
                //     let temAllData = this.transRootLabel.concat(this.args.transCLabel);
                //     let distinctAttr = [...new Set(temAllData)];

                //     distinctAttr.forEach(attr => {
                //         searchStr = `${searchStr} obj.${attr} like '%${s}%' or`
                //     })
                //     if(searchStr != '') {
                //         searchStr = searchStr.substring(0, searchStr.length - 3);
                //     }
                //     treeParam.leafCondition = ` and (${searchStr})`;

                //     let s = this.searchKey;
                //     let temAllData = this.transRootLabel.concat(this.args.transCLabel);
                //     let distinctAttr = [...new Set(temAllData)];

                //     distinctAttr.forEach(attr => {
                //         searchStr = `${searchStr} cast(obj.${attr} as varchar) like '%${s}%' or`
                //     })
                //     if(searchStr != '') {
                //         searchStr = searchStr.substring(0, searchStr.length - 3);
                //     }
                //     treeParam.leafCondition = ` and (${searchStr})`;

                // }

                this.spinShow = true;
                let treeRes = await getSelfJoinEobj(this.args.targetClass, treeParam, false, true, this.args.relationAttr);
                let temTree = [];
                console.log(treeRes)
                if(treeRes.data.success) {

                    let treeData = treeRes.data.data;
                    this.treeTotal = treeRes.data.data.length;
                    if(treeData.length > 0) {

                        treeData.forEach(x => {

                            // 根节点过滤结果
                            let temAttr = '';
                            this.transRootLabel.forEach(i => {

                                if(x[i]) {
                                    temAttr = temAttr + x[i] + '/'
                                }

                            })

                            if(temAttr.length > 0) {
                                temAttr = temAttr.substr(0, temAttr.length - 1);
                            }
                            x.text = temAttr;
                            //  如果对象所选显示的属性 一个都不具有 则显示定义信息
                            if(x.text == '') {
                                x.text = this.args.rootEmptyLabel;
                            }

                            x.rootFlag = true;

                            let transChild = this.getEachTree(x.children, x);
                            if(transChild.length > 0) {
                                x.children = transChild;
                            }


                        })
                        temTree = treeData;

                    } else {
                        temTree = [];
                    }

                } else {
                    this.$Message.warning('服务繁忙查询失败');
                    temTree = [];
                    this.treeTotal = 0;
                    this.spinShow = false;
                }

                let that = this;
                setTimeout(function() {
                    that.args.treeList = temTree;
                    that.temTreeList = temTree;
                    that.spinShow = false;
                }, 1000);


            }

        },

        /**
         * @description 查询条件转换
         * @targetStr 目标字符串
         * @str 需要被替换的字符串
         * @_str 替换为的字符串
        */
        // transStr(targetStr, str, _str) {
        //     console.log(targetStr, typeof targetStr, str , _str);

        //     targetStr.replace(/[[\]{}()|^$?*+]/g, '');
        //     if(typeof targetStr != 'string') return false;
        //     targetStr = targetStr.replace(new RegExp(str,'g'), _str);

        //     return targetStr;

        // },

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
        getSelected() {

            return this.clickData;

        }
    }
}
</script>
<style>
.editbox-self-joins-tree .ivu-select-dropdown{
  width: 100%!important;
  left: 0px!important;
}
</style>

<style scoped>
.vant-tree>>>.van-tree-select__selected{
    position:absolute;
}
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

.commonLabel {
    width: 30%;
    margin: 5px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}

.freshBtn {
    float: right;
    margin: 8px  10px 0 0;
    font-size: 24px;
}

.lableTxt {
    padding-bottom: 14px;
    margin-bottom: 5px;
}

.attrBox {
    padding: 10px;
    overflow-y: auto;
    /* border: 1px solid #d7d8da; */
    margin-bottom: 10px;
}
.attrTitle {
    color: #000;
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
.page-wrap {
    height: 30px;
}
</style>
