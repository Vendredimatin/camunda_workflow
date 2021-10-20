<template>
    <section v-show="!args.hided" :addinName="name" :style="{'width': colWidth, 'overflow-x': 'auto', 'height': arg_height, 'overflow-y': 'auto', 'background': appTreeBg}" ref="main">
        <div class="ori-tree self-tree" :style="{'width': '100%', 'min-height': '350px', 'height': 'calc(100% - 30px)', 'padding': '10px'}">

            <!-- 树头部的搜索框 以及 刷新按钮定制 -->
            <div v-show="args.showRefresh || args.showSearchInput" style="height: 40px; border-bottom: 1px solid #ddd;">
                <Row>
                    <Col span="20">
                        <Input v-show="args.showSearchInput" v-model="searchNode" icon="ios-search" @on-click="handleSearch" @on-change="changeSearch" />
                    </Col>
                    <Col span="1" style="float: right">
                        <Icon v-show="args.showRefresh" class="freshBtn" type="ios-refresh" @click.native="freshData('', true, levelIndex)"/>
                    </Col>
                </Row>
            </div>
            <!-- 树头部的搜索框 以及 刷新按钮定制 ending -->

            <Tree ref="relationTree" :load-data="loadData" :data="args.treeList" :render="renderWithButton" style="min-height: calc(100% - 30px);"></Tree>
            <Page class="page-wrap"
                v-show="args.pageSwitch"
                :total="treeTotal"
                size="small"
                style="float: right;"
                placement="top"
                :current.sync="treePageIndex"
                @on-change="changeTreePage"
                show-total
                show-sizer
                :page-size-opts="pageSizeOpts"
                :pageSize="args.selfSize"
                @on-page-size-change="changeTreePageSize"/>
            <Spin fix v-if="spinShow"></Spin>
        </div>
        <Modal v-model="clickModal" draggable scrollable title="提示">
            <div v-show="selfFlag">{{ this.selfContent }}</div>
            <div v-show="defalutFlag">
                <div v-for="item in transNode" :key="item.label">
                    <Row>
                        <Col span="6" class="labelClass modalLabel self-color">
                            <span>{{ item.label }}: </span>
                        </Col>
                        <Col span="8" offset="2" class="labelClass modalValue self-color">
                            <span>{{ item.value }}</span>
                        </Col>
                    </Row>
                </div>
            </div>
        </Modal>
    </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { getEntity } from "@/api/data-model/EntityModeling";
import { getRelation } from '@/api/data-model/RelationModeling';
import { getSelfJoinEobj } from '@/api/others';
const name = "SelfJoinsTree";
export default {
	beforeDestroy() {
		if (this.timer) { clearInterval(this.timer); this.timer = null; };
	},
    name: name,
  props: [
    'argsProps',
    'store',
    'itemValue',
    'formEngine',
    'dwf_ctx',
    'attributes',
    'query',
  ],
    data() {
        return {
            timer: null,
            times: 0,
            name: name,

            t_create: false,
            t_edit: false,
            t_visit: true,

            clickModal: false,
            selfFlag: false,         // 自定义弹窗内容
            defalutFlag: false,     // 默认弹窗展示内容
            selfContent: '',        // 自定义弹窗内容
            transNode: [],          // 默认弹窗显示节点的基础信息
            searchNode: '',         // 需要搜素时搜素框的值
            temTree: [],            // 搜索结果临时tree
            treeTotal: 0,           // 开启分页后的总条数
            treePageIndex: 1,       // 开启分页后的当前页
            transRootQuerys: '',
            transRootLabel: '',
            pageSizeOpts: [10, 25, 50, 100, 200],

            classMap: [],

            error: null,

            readonly: true,
            spinShow: true,
            appTreeBg: '#fff',

            levelIndex: 0,

            args: {
                lazySwitch: true,
                showRefresh: false,         // 是否显示刷新按钮
                showSearchInput: false,     // 是否显示搜索框
                defaultLevel: 1,            // 初始默认加载层数
                expandSwitch: false,
                pageSwitch: false,          // 是否显示分页

                rootOperation: [],          // 根节点操作
                childOperation: [],         // 子节点操作
                selfSize: 10,

                label: "",
                width: 100,
                widthType: '%',
                height: 400,
                heightType: "px",
                col: true,
                hided: false,
                rows: 3,
                cols: 3,
                targetDataType: null,
                reEnName: '',
                id: '',

                treeList: [],

                targetClass: '',
                targetRelationClass: '',
                reDirection: '',
                rootLabel: [],
                childrenLabel: '',
                rootQuery: '',
                childrenQuery: '',
                rootEmptyLabel: '该对象暂无所选属性信息',
                childrenEmptyLabel: '该对象暂无所选属性信息',
                iconName: '',

                relationName: '',         // 用于懒加载的全局变量
                str_re: '',
                transChildrenQuery: '',
                transCLabel: '',

                iconLabel: '',
                iconArr: [],
                iconObj: {},
            },

            // 单击事件
            vClick: null,

            clickData: {},     // 单击选择的节点
            editData: {},     //  单击操作的节点

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
            classAttrMap: {},

            open: ["1","2"],

            value: "",
          sysEventPath: ['save', 'edit', 'delete'], //可绑定后处理操作的系统事件
        }
    },
  inject:[
    'getEn',
    'getJsonData',
    'getParentJson',
    'getObj',
    'GetAddinById',
    'GetAddinByUUID',
    'GetAllAddin',
    'getParentAddin',
    '_getViewData',
    '_getViewDataByAttrs',
    'getClassObject',
    'getRClassObject',
    'invokeOperation',
    'parseEscapeString',
    'handleScript',
    'addExtraObj',
    'getEventOperation',
    'invokeEvent',
  ],
  // 生命周期函数，在获取数据和事件函数后调用，
  created() {
    //通过prop给控件初始化
    this.setDisplayType(this.query.displayType);
    this.setArgs(this.argsProps);

    this.$store = this.store;

    if(location.href.indexOf('displayType=') != -1) {
        sessionStorage.setItem('skinStyle', 'light');
    }
    },
    async mounted() {

        this.setHeight();

        // 数据刷新
        this.freshData();

        if(this.args.events && this.args.events.length > 0) {

            this.vClick = this.args.events.find((val) => {
                return val.name == '单击节点'
            })

        }
    },
    computed: {
        ...mapGetters("DWF_form", [
            "AttributesByClass"
        ]),
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
        },
        arg_targetClass() {
            return this.args.targetClass;
        },
    },
    watch: {
        arg_targetClass(val) {
            getEntity(val).then(response => {

                this.classMap[val] = response.data;

            })
            getEntity(this.args.reEnName).then(response => {

                this.classMap[this.args.reEnName] = response.data;

            })

        }
    },
    methods: {
         ...mapActions("DWF_form", [
            "handleQueryData",
            "getAttributeClassMap",
            "editEObj"
        ]),
        onDynamic(value) {
            // 数据刷新
            this.updateTree();
        },
        // 自定义树结构
        renderWithButton(h, {root, node, data}) {

            const objL = Object.keys(this.args.iconObj);
            const objCL = Object.keys(this.args.iconCObj);

            // 操作
            let rootOpr = this.args.rootOperation;
            let childOpr = this.args.childOperation;

            let self = this;
            let rootDom = rootOpr.map(function(item, index){

                // 根节点操作图标渲染
                if(!item.oprShowType) {
                    item['oprShowType'] = '文字图标';
                }

                // 显示文字图标
                if(item.oprShowType == '文字图标' || !item.oprShowType) {

                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} icon={item.iconName} size={'small'} onClick={self.rootHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>
                    } else {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} size={'small'} onClick={self.rootHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>
                    }

                } else if(item.oprShowType == '文字') {

                    // 只显示文字
                    return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} size={'small'} onClick={self.rootHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>

                } else if(item.oprShowType == '图标') {

                    // 只显示图标
                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} icon={item.iconName} size={'small'} onClick={self.rootHandle.bind(self, data, item)} style={'margin-right:8px'}></i-button>
                    } else {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} size={'small'} onClick={self.rootHandle.bind(self, data, item)} style={'margin-right:8px'}></i-button>
                    }
                } else {

                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} icon={item.iconName} size={'small'} onClick={self.rootHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>
                    } else {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} size={'small'} onClick={self.rootHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>
                    }

                }

            })

            let childDom = childOpr.map(function(item, index){

                // 子节点操作图标渲染
                if(!item.oprShowType) {
                    item['oprShowType'] = '文字图标';
                }

                // 显示文字图标
                if(item.oprShowType == '文字图标' || !item.oprShowType) {

                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={!data.rootFlag} icon={item.iconName} size={'small'} onClick={self.childHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>
                    } else {
                        return <i-button v-show={!data.rootFlag} size={'small'} onClick={self.childHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>
                    }

                } else if(item.oprShowType == '文字') {

                    // 只显示文字
                    return <i-button v-show={!data.rootFlag} size={'small'} onClick={self.childHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>

                } else if(item.oprShowType == '图标') {

                    // 只显示图标
                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={!data.rootFlag} icon={item.iconName} size={'small'} onClick={self.childHandle.bind(self, data, item)} style={'margin-right:8px'}></i-button>
                    } else {
                        return <i-button v-show={!data.rootFlag} size={'small'} onClick={self.childHandle.bind(self, data, item)} style={'margin-right:8px'}></i-button>
                    }

                } else {

                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={!data.rootFlag} icon={item.iconName} size={'small'} onClick={self.childHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>
                    } else {
                        return <i-button v-show={!data.rootFlag} size={'small'} onClick={self.childHandle.bind(self, data, item)} style={'margin-right:8px'}>{item.name}</i-button>
                    }

                }

            })

            // 适应当前应用的皮肤
            const curSkin = sessionStorage.getItem('skinStyle');
            let oriNodeBg = '#fff';
            let actNodeBg = '#d5e8fc'

            if(curSkin == 'dark') {

                oriNodeBg = 'transparent';
                actNodeBg = '#254065';

            }

            if((this.args.iconName == '' || !this.args.iconName || objL.length == 0) && (this.args.iconCName == '' || !this.args.iconCName || objCL.length == 0)) {

                return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer", "line-height": '26px', "background": node.node.selected ? actNodeBg : oriNodeBg}]} onClick={this.clickNode.bind(this, data, node)}>
                    <span class="self-treeNode" style={[{"display": "inline-block", "cursor": "pointer"}]}>{data.selfTreeAttr}</span>
                    <span style="float:right;margin-right:8px">
                        {rootDom}
                        {childDom}
                    </span>
                </div>;

            } else {

                let rootIconName = this.args.iconName;
                let childIconName = this.args.iconCName;
                // if(this.args.str_re == 'l') {
                //     rootIconName = `left_${this.args.iconName}`;
                //     if(this.args.iconCName.indexOf('&') == -1) {
                //         childIconName = `left_${this.args.iconCName}`;
                //     } else {
                //         childIconName = `relation_${this.args.iconCName.split('&')[0]}`;
                //     }
                // } else {
                //     rootIconName = `right_${this.args.iconName}`;
                //     if(this.args.iconCName.indexOf('&') == -1) {
                //         childIconName = `right_${this.args.iconCName}`;
                //     } else {
                //         childIconName = `relation_${this.args.iconCName.split('&')[0]}`;
                //     }
                // }
                // 当该对象不存在选定的图标属性 或者 具有该属性 但是在属性映射表中未定义对应的图标值 不显示图标
                if(!data[rootIconName] && !data[childIconName]) {
                    return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer", "line-height": '26px', "background": node.node.selected ? actNodeBg : oriNodeBg}]} onClick={this.clickNode.bind(this, data, node)}>
                        <span class="self-treeNode" style={[{"display": "inline-block", "cursor": "pointer"}]}>{data.selfTreeAttr}</span>
                        <span style="float:right;margin-right:8px">
                            {rootDom}
                            {childDom}
                        </span>
                    </div>;

                } else {

                    // 判断当前是根节点 还是子节点 (根节点的属性是不带有left_/right_前缀的)
                    let finalIconName = '';
                    if(this.args.iconObj[data[rootIconName]]) {
                        finalIconName = this.args.iconObj[data[rootIconName]];
                    }

                    if(this.args.iconCObj[data[childIconName]]) {
                        finalIconName = this.args.iconCObj[data[childIconName]]
                    }

                    if(finalIconName.indexOf('icon-') == -1) {
                        return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer", "line-height": '26px', "background": node.node.selected ? actNodeBg : oriNodeBg}]} onClick={this.clickNode.bind(this, data, node)}>
                            <icon type={finalIconName} style="margin-right: 4px;" />
                            <span class="self-treeNode" style={[{"display": "inline-block", "cursor": "pointer"}]}>{data.selfTreeAttr}</span>
                            <span style="float:right;margin-right:8px">
                                {rootDom}
                                {childDom}
                            </span>
                        </div>;
                    } else {
                        finalIconName = `iconfont ${finalIconName}`;
                        return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer", "line-height": '26px', "background": node.node.selected ? actNodeBg : oriNodeBg}]} onClick={this.clickNode.bind(this, data, node)}>
                            <i class={finalIconName} style="margin-right: 6px;"></i>
                            <span class="self-treeNode" style={[{"display": "inline-block", "cursor": "pointer"}]}>{data.selfTreeAttr}</span>
                            <span style="float:right;margin-right:8px">
                                {rootDom}
                                {childDom}
                            </span>
                        </div>;
                    }

                }

            }

        },

        /**
         * @description 删除非对象自有属性的自定义属性
        */
        commonDelAttr(selfNode) {

            let delSelfObj = {};
            let selfAttr = ['children', 'selfTreeAttr', 'selected', 'loading', 'nodeKey', 'expand', 'index', 'rootFlag', 'childrenCount'];

            for(let i in selfNode) {
                if(selfAttr.includes(i) === false) {

                    delSelfObj[i] = selfNode[i];
                }
            }
            console.log(delSelfObj)
            return delSelfObj;

        },

        updateEachIndex(tree = [], targetItem) {
            let self = this;
            if (!!tree && tree.length !== 0) {
                tree.forEach((item, index) => {
                    item.index = `${targetItem.index}-${index}`;
                    self.updateEachIndex(item.chilren, item);
                })
            } else {
                return
            }
        },

        // 遍历子节点
        getEachTree(tree = [], targetItem, oidArr) {
            let arr = [];
            let _self = this;
            if (!!tree && tree.length !== 0) {
                tree.forEach((item, index) => {

                    // 记忆刷新节点默认展开
                    let preOid = this.args.reDirection + '_oid';
                    if(oidArr && oidArr.length > 0) {
                        let expandIndex = oidArr.findIndex(n => {
                            return n == item[preOid]
                        })
                        if(expandIndex > -1 && 'children' in item) {

                            if(item.children.length > 0) {
                                item.expand = true;
                            }

                        }
                    }

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
                    obj.selfTreeAttr = temCAttr;
                    obj.index = `${targetItem.index}-${index}`;

                    if(this.clickData && Object.keys(this.clickData).length > 0) {
                        if((obj[preOid] === this.clickData[preOid]) && (obj.index === this.clickData.index)) {
                            obj.selected = true;
                        }
                    }

                    if(obj.selfTreeAttr == '') {

                        obj.selfTreeAttr = this.args.childrenEmptyLabel;
                    }

                    let preStr = this.args.reDirection + '_';
                    for(let n in targetItem){

                        if(n.indexOf(preStr) != -1) {
                            let getPKey = this.args.reDirection == 'left' ? 'right_' + n.split('_')[1] :'left_' + n.split('_')[1];
                            obj[getPKey] = targetItem[n];
                        }

                    }

                    obj.rootFlag = false;
                    // if(this.args.lazySwitch) {
                    //     obj.loading = false;
                    // }
                    let isHasChild = _self.getEachTree(item.children, item, oidArr);
                    if(isHasChild.length > 0) {
                        obj.expand = true;
                    }
                    if(item.childrenCount > 0) {
                        obj.loading = false;
                        obj.children = isHasChild;
                    } else {
                        obj.children = [];
                    }
                    arr.push(obj);
                });
            }
            return arr;
        },


        /**
         * @description 树翻页
        */
        async changeTreePage(pageId, searchStr) {

            this.spinShow = true;
            this.args.treeList = [];

            let treeParam = {
                childrenCondition: this.args.transChildrenQuery,
                leafCondition: '',
                fuzzySearch: {
                    attributes: [],
                    keyword: this.searchNode ? this.searchNode.trimStart().trimEnd() : ''
                },
                pageSize: this.args.selfSize,
                recursiveLevel: this.args.lazySwitch ? parseInt(this.args.recursiveLevel) : 50,
                rootCondition: this.transRootQuerys,
                startIndex: this.args.selfSize * (pageId - 1)
            }

            // 搜索框值不为空 层数为最大层数
            let s = this.searchNode.trimStart().trimEnd();
            if(s != '') {

                let temRootLabel = [];
                let temLeafLabel = [];
                this.transRootLabel.forEach(r => {
                    temRootLabel.push(`root_${r}`)
                })
                this.args.transCLabel.forEach(l => {
                    temLeafLabel.push(`leaf_${l}`)
                })
                let temAllData = temRootLabel.concat(temLeafLabel);

                treeParam.fuzzySearch.attributes = temAllData;
                treeParam.recursiveLevel = 50;

            }

            let treeRes = await getSelfJoinEobj(this.args.targetClass, treeParam, true, this.args.pageSwitch, this.args.relationAttr);
            let temTree = [];
            if(treeRes.data.success) {

                let treeData = treeRes.data.data.data;
                this.treeTotal = treeRes.data.data.totalCount;
                if(treeData.length > 0) {

                    treeData.forEach((x, index) => {

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
                        x.selfTreeAttr = temAttr;
                        //  如果对象所选显示的属性 一个都不具有 则显示定义信息
                        if(x.selfTreeAttr == '') {
                            x.selfTreeAttr = this.args.rootEmptyLabel;
                        }

                        x.index = index;
                        x.rootFlag = true;
                        if(this.args.lazySwitch && this.args.recursiveLevel == 0) {
                            if(x.childrenCount > 0) {

                                x.children = [];
                                x.loading = false;

                            }
                        } else {

                            let transChild = this.getEachTree(x.children, x);
                            if(transChild.length > 0) {
                                x.children = transChild;
                                x.loading = false;
                                x.expand = true;
                            } else {
                                x.children = [];
                            }

                        }

                    })
                    temTree = treeData;

                } else {
                    temTree = [];
                }

            } else {
                this.$Message.error('服务繁忙查询失败');
                temTree = [];
                this.treeTotal = 0;
            }

            let that = this;
            setTimeout(function() {
                that.args.treeList = temTree;
                that.isHasTree = true;
                that.spinShow = false;
            }, 1000);

        },

        /**
         * @description 修改每页条数
        */
        changeTreePageSize(size) {

            this.treePageIndex = 1;
            this.args.selfSize = parseInt(size);

            // 在搜索框有内容时 翻页层数为最大层数
            let s = this.searchNode.trimStart().trimEnd();
            if(s != '') {
                this.updateTree(null, 50);
            } else {
                this.updateTree(null, this.levelIndex);
            }

        },

        /**
         * @description 获取当前树节点所有展开节点的位置
         * @param tree 目标数组
         * @param nodeArr 返回符合遍历要求的节点oid数组
         * 按需求可扩展成 获取某属性为指定值的全部节点(位置)
        */
        getExpandArr(tree, nodeArr) {

            let _self = this;

            if(!!tree && tree.length !== 0) {
                for (var i in tree) {

                    if (tree[i].selected == true) {

                        nodeArr.push(tree[i].oid);

                    }
                    if(tree[i].children && tree[i].children.length > 0) {
                        nodeArr = nodeArr.concat(_self.getExpandArr(tree[i].children, []));
                    }

                }
            }
            return nodeArr;

        },

        /**
         * @description 编辑节点对象信息
         * @newObj 修改后的对象
         * @oldNode 修改前的node对象
         * @freshFlag 是否缓存节点展开刷新
         * @param oldExpandArr 原树的展开节点位置信息
        */
        async editNodeObj(newObj, freshFlag) {

            let selfItemValue = this.itemValue;
            console.log(newObj, this.clickData)

            let curObj = this.clickData;
            // 根 \ 子节点判断 oid参数辅助添加
            let mutilObj = {
                className: this.args.targetClass,
                isRelation: false,
                oidList: [this.args.id],
                showMessage: true
            };

            selfItemValue.data.targetClass = this.args.targetClass;
            selfItemValue.data.isRelation = false;
            newObj['oid'] = curObj.oid;

            if(freshFlag) {
                selfItemValue.data['oldExpandArr'] = this.getExpandArr(this.args.treeList, []);
            } else {
                selfItemValue.data['oldExpandArr'] = [];
            }

            await this.invokeOperation('sys', 'edit', selfItemValue, this.store, null, newObj, null, mutilObj);

        },

        setError(error) {
            var dom = this.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) dom.style.borderColor = error ? "red" : null;
        },
        // validate() {
        //     if (!this.value) {
        //         this.setError();
        //         return false;
        //     }
        //     return true;
        // },
        getValue() {
            return this.value;
        },
        setValue(items) {
            var value = null;
            if (typeof items == "object") {
                if (items && items.length > 0) value = items[0][this.args.name];
            } else value = items;
            this.value = value;
            return this;
        },
        setHeight() {
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
            this.t_create = false;
            this.t_edit = false;
            this.t_visit = false;
            if (type == "create") {
                this.t_create = true;
            }
            else if (type == "edit") {
                this.t_edit = true;
            }
            else if (type == "visit") {
                this.t_visit = true;
            }
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
            if(sessionStorage.getItem('skinStyle') == 'dark') this.appTreeBg = 'transparent';
            return this;
        },
        getArgs() {
            return this.args;
        },

        getAttrMap() {

            let res = [];
            res.push(this.classMap[this.args.targetClass])

            return res;

        },
        /**
         * @description 返回点击选择的对象
        */
        getSelected() {

            let clickResult = [];
            if(this.clickData && Object.keys(this.clickData).length > 0) {
                let delAttrObj = this.commonDelAttr(this.clickData);
                clickResult.push(delAttrObj);
            }
            return clickResult;

        },

        /**
         * @description 节点点击事件
        */
        async clickNode(el, node) {

            console.log(el);
            this.clickData = el;
            this.levelIndex = el.rootFlag === true ? 0 : el.index.split('-').length - 1;

            // 表单引擎所需参数对象
            let mutilObj = {
                className: this.args.targetClass,
                isRelation: false,
                oidList: [this.args.id],
                showMessage: true
            };
            if(!node.node.selected) {

                this.$refs.relationTree.handleSelect(node.nodeKey);  //手动选择树节点

            }
            //  else {
            //     node.node.selected = false;
            //     this.clickData = {};
            // }

            // 删除自定义属性
            let delSelfAttr = this.commonDelAttr(el);
            if(this.vClick != null) {
                await this.invokeOperation(this.vClick.opr_type, this.vClick.opr_path, this.itemValue, this.store, null, delSelfAttr, null, mutilObj);
            }
        },

        /**
         * @description 根节点自定义操作 className为 当前定制实体类
        */
        async rootHandle(result, item) {

            console.log(result, item);
            this.clickData = result;

            let delSelfResult = this.commonDelAttr(result);

            let selfItemValue = this.itemValue;
            selfItemValue.data.targetClass = this.args.targetClass;
            selfItemValue.data.isRelation = false;
            selfItemValue.data['oldExpandArr'] = this.getExpandArr(this.args.treeList, []);
          let sysEventObj = this.sysEventPath.includes(item.opr_path) ? {
            opr_sys_path: item.opr_sys_path,
            opr_showMessage: item.opr_showMessage,
          }: null
            let mutilObj = {
                className: this.args.targetClass,
                isRelation: false,
                oidList: [this.args.id],
                showMessage: true,
              sysEventObj: sysEventObj
            };

            let res = await this.invokeOperation(item.opr_type, item.opr_path, selfItemValue, this.store, null, delSelfResult, null, mutilObj);
            // if(res) {
            //     let oldNode = this.getExpandArr(this.args.treeList, true, []);
            //     this.updateTree(oldNode);
            // }
            // if (item.extend) {
            //     let params = {
            //         originObj: this.itemValue.data.origin,
            //         obj: this.getObj(this.itemValue.data),
            //         className: this.itemValue.data.targetClass
            //     }
            //     this.addin.onHandle(params);
            // } else {
            //     this.invokeOperation(item.opr_type, item.opr_path, this.itemValue, this.store);
            // }

        },

        /**
         * @description 子节点自定义操作 className为 当前定制实体类的关联方向实体类
        */
        async childHandle(result, item) {

            console.log(result, item);

            this.clickData = result;
            let delAttrObj = this.commonDelAttr(result);

            let selfItemValue = this.itemValue;
            // if(item.opr_path == 'delete') {
            //     selfItemValue.data.targetClass = this.args.relationName;
            // } else {
            //     selfItemValue.data.targetClass = this.args.reEnName;
            // }
            selfItemValue.data.targetClass = this.args.targetClass;
            selfItemValue.data.isRelation = false;
            selfItemValue.data['oldExpandArr'] = this.getExpandArr(this.args.treeList, []);

          let sysEventObj = this.sysEventPath.includes(item.opr_path) ? {
            opr_sys_path: item.opr_sys_path,
            opr_showMessage: item.opr_showMessage,
          }: null
            let mutilObj = {
                className: this.args.targetClass,
                isRelation: false,
                oidList: [this.args.id],
                showMessage: true,
              sysEventObj: sysEventObj
            }
            let res = await this.invokeOperation(item.opr_type, item.opr_path, selfItemValue, this.store, null, delAttrObj, null, mutilObj);
            // if(res) {
            //     let oldNode = this.getExpandArr(this.args.treeList, true, []);
            //     this.updateTree(oldNode);
            // }

            // if (item.extend) {
            //     let params = {
            //         originObj: this.itemValue.data.origin,
            //         obj: this.getObj(this.itemValue.data),
            //         className: this.itemValue.data.targetClass
            //     }
            //     this.addin.onHandle(params);
            // } else {
            //     this.invokeOperation(item.opr_type, item.opr_path, this.itemValue, this.store);
            // }

        },

        /**
         * @description 更新树数据
         * @str_re 当前目标类的关联方向 l:左 r:右
         * @relationName 所选关联类className
         * @param expandArr 记忆节点刷新数组
         * @param level 记忆节点刷新层数 高于默认配置层数
        */
        async updateTree(expandArr, level) {

            this.spinShow = true;

            this.args.treeList = [];

            this.transRootQuerys = '';
            if(this.args.rootQuery != '') {

                this.transRootQuerys = this.parseEscapeString(this.args.rootQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store);

            } else {
                this.transRootQuerys = '';
            }

            // 如果是点击刷新按钮的刷新 默认加载到点击刷新前选中节点的层数 层数有可能大于配置层数
            let finalLevel = parseInt(this.args.recursiveLevel);
            if(level !== undefined) {

                let lIndex = parseInt(level);
                // if(this.clickData && Object.keys(this.clickData).length > 0) {
                if(lIndex > finalLevel) {
                    finalLevel = lIndex;
                }
                // } else {
                //     finalLevel = level;
                // }
            }

            finalLevel = parseInt(finalLevel);

            // 判断当前是否为翻页刷新
            let curPageIndex = this.args.pageSwitch === true ? (this.treePageIndex - 1) * this.args.selfSize: 0;
            // 如果关闭懒加载开关 层数参数提供10000
            let treeParam = {
                childrenCondition: '',
                leafCondition: '',
                fuzzySearch: {
                    attributes: [],
                    keyword: this.searchNode ? this.searchNode.trimStart().trimEnd() : ''
                },
                recursiveLevel: this.args.lazySwitch ? finalLevel : 50,
                rootCondition: this.transRootQuerys,
                startIndex: curPageIndex
            }

            // 开启分页默认加载10条 否则加载全部
            if(this.args.pageSwitch) {
                treeParam['pageSize'] = this.args.selfSize;
            }

            if(this.args.childrenQuery != '') {

                this.args.transChildrenQuery = this.parseEscapeString(this.args.childrenQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store);
                treeParam.childrenCondition = this.args.transChildrenQuery;

            } else {
                this.args.transChildrenQuery = '';
            }

            // 转换根节点标签内容
            let temTransRootLabel = this.args.rootLabel.replace(/obj\./g, '');

            this.transRootLabel = temTransRootLabel.split('/');
            if(this.transRootLabel[this.transRootLabel.length - 1] == '') {
                this.transRootLabel.pop();
            }

            // 转换子节点标签内容
            let transChildrenLabel = this.args.childrenLabel.replace(/obj\./g, '');

            // get关联实体类选择的属性 & 关联类选择的属性的数组 例["relationClass_rcfd", "rightClass_version"]
            this.args.transCLabel = transChildrenLabel.split('/');
            if(this.args.transCLabel[this.args.transCLabel.length - 1] == '') {
                this.args.transCLabel.pop();
            }

            let s = this.searchNode.trimStart().trimEnd();
            if(s != '') {

                let temRootLabel = [];
                let temLeafLabel = [];
                this.transRootLabel.forEach(r => {
                    temRootLabel.push(`root_${r}`)
                })
                this.args.transCLabel.forEach(l => {
                    temLeafLabel.push(`leaf_${l}`)
                })
                let temAllData = temRootLabel.concat(temLeafLabel);

                treeParam.fuzzySearch.attributes = temAllData;

            }

            let treeRes = await getSelfJoinEobj(this.args.targetClass, treeParam, this.args.pageSwitch, true, this.args.relationAttr);
                let temTree = [];
                if(treeRes.data.success) {

                    let treeData = this.args.pageSwitch ? treeRes.data.data.data : treeRes.data.data;
                    this.treeTotal = this.args.pageSwitch ? treeRes.data.data.totalCount : treeRes.data.data.length;
                    if(treeData.length > 0) {

                        treeData.forEach((x, index) => {

                            // 记忆刷新节点默认展开
                            let preOid = 'oid';
                            if(expandArr && expandArr.length > 0) {
                                let expandIndex = expandArr.findIndex(n => {
                                    return (n == x[preOid] && x.index == this.clickData.index)
                                })
                                if(expandIndex > -1) {

                                    if('children' in x) {
                                        if(x.children.length > 0) {
                                            x.expand = true;
                                        }
                                    }

                                    x.selected = true;

                                }
                            }

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
                            x.selfTreeAttr = temAttr;
                            x.index = index;

                            // 记忆刷新将之前节点仍置为选中状态
                            if(level !== undefined) {
                                if(this.clickData && Object.keys(this.clickData).length > 0) {
                                    if((x[preOid] === this.clickData[preOid]) && (x.index === this.clickData.index)) {
                                        x.selected = true;
                                    }
                                }
                            }

                            //  如果对象所选显示的属性 一个都不具有 则显示定义信息
                            if(x.selfTreeAttr == '') {
                                x.selfTreeAttr = this.args.rootEmptyLabel;
                            }

                            x.rootFlag = true;
                            if(this.args.lazySwitch && treeParam.recursiveLevel == 0) {
                                if(x.childrenCount > 0) {

                                    x.children = [];
                                    x.loading = false;

                                } else {
                                    x.children = [];
                                }
                            } else {

                                let transChild = this.getEachTree(x.children, x, expandArr);
                                if(transChild.length > 0) {
                                    x.children = transChild;
                                    x.loading = false;
                                    x.expand = true;
                                } else {
                                    x.children = [];
                                }

                            }

                        })
                        temTree = treeData;

                    } else {
                        temTree = [];
                    }

                } else {
                    this.$Message.error('服务繁忙查询失败');
                    temTree = [];
                    this.treeTotal = 0;
                }

                this.spinShow = true;

                let that = this;
                setTimeout(function() {
                    that.args.treeList = temTree;
                    that.temTree = temTree;
                    that.spinShow = false;
                }, 1000);

        },

        /**
         * @description 带有展开节点缓存的刷新树
         * @param query 外部过滤条件
         * @param flag  是否需要记忆刷新 只有主动传入false时关闭记忆节点刷新
         * @param level 记忆刷新展到选中节点的层数
         * @param asyncObj 局部子节点对象
         * @param oprType 局部操作子节点对象的操作类型 (新增 / 编辑)
        */
        freshData(query, flag, level, asyncObj, oprType) {

            console.log('freshData', query, flag, asyncObj);
            if (flag == undefined) flag = true;

            // 判断是否是局部刷新对象行为 还是树的大刷新
            if(asyncObj && Object.keys(asyncObj).length > 0) {

                // 局部新增操作 根/子节点
                if(oprType == 'create') {

                    // 新增根节点
                    if(asyncObj[this.args.relationAttr] == null || asyncObj[[this.args.relationAttr]] == '') {

                        let newRootNode = {};
                        for(let i in asyncObj) {

                            newRootNode[i] = asyncObj[i];

                        }

                        newRootNode['rootFlag'] = true;
                        // 新增根节点的标签显示属性
                        let temAttr = '';
                        this.transRootLabel.forEach(i => {

                            if(newRootNode[i]) {
                                temAttr = temAttr + newRootNode[i] + '/'
                            }

                        })

                        if(temAttr.length > 0) {
                            temAttr = temAttr.substr(0, temAttr.length - 1);
                        }
                        newRootNode['selfTreeAttr'] = temAttr;
                        newRootNode['index'] = 0;
                        newRootNode['children'] = [];

                        //如果当前开启了分页 考虑当前页的条数是否为10条 如果是就UI上删掉最后一条把新增的放在最前面 否则直接追加在最前面
                        if(this.args.pageSwitch == true && this.args.treeList.length > 9) {
                            this.args.treeList.pop();
                        }

                        this.args.treeList.unshift(newRootNode);

                        this.args.treeList.forEach((val, index) => {
                            val.index = index;
                            this.updateEachIndex(val.children, val);
                        })

                        this.treeTotal++;

                    } else {

                        // 新增子节点label
                        let temCAttr = '';
                        this.args.transCLabel.forEach(i => {

                            if(asyncObj[i]) {
                                temCAttr = temCAttr + asyncObj[i] + '/'
                            }

                        })
                        if(temCAttr.length > 0) {
                            temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                        }
                        asyncObj['selfTreeAttr'] = temCAttr;
                        asyncObj['rootFlag'] = false;
                        asyncObj['children'] = [];

                        let obj = {};

                        // 根节点下新增子节点
                        if(this.clickData.rootFlag === true) {

                            obj = this.args.treeList[this.clickData.index];  // 目标父节点

                        } else {                                             // 子节点新增子节点

                            let childNodeIndex = this.clickData.index.split('-');
                            let pIndex = parseInt(childNodeIndex[0]);
                            obj = this.args.treeList[pIndex];        //目标父节点

                            for(let i = 1; i < childNodeIndex.length; i++) {
                                let iNum = parseInt(childNodeIndex[i]);
                                obj = obj.children[iNum];
                            }

                        }

                        if(obj.children && obj.children.length > 0) {           // 是否已经是懒加载过该节点

                            asyncObj['index'] = `${this.clickData.index}-${obj.children.length}`;
                            obj.children.push(asyncObj);
                            obj.childrenCount++;

                        } else {

                            obj['children'] = [];

                            if(obj.childrenCount > 0) {

                                this.loadSelfData(obj);

                            } else {

                                asyncObj['index'] = `${this.clickData.index}-0`;
                                obj.childrenCount++;
                                obj.children.push(asyncObj);
                                this.$set(obj, 'expand', true );

                            }

                        }

                    }

                } else if(oprType == 'edit') {           // 局部编辑操作 根/子节点

                    // 编辑根节点
                    if(asyncObj.parentOid == null || asyncObj.parentOid == '') {

                        let rootNodeIndex = this.clickData.index;
                        for(let i in asyncObj) {

                            this.args.treeList[rootNodeIndex][i] = asyncObj[i];

                        }

                        // 更新根节点的标签显示属性
                        let temAttr = '';
                        this.transRootLabel.forEach(i => {

                            if(this.args.treeList[rootNodeIndex][i]) {
                                temAttr = temAttr + this.args.treeList[rootNodeIndex][i] + '/'
                            }

                        })

                        if(temAttr.length > 0) {
                            temAttr = temAttr.substr(0, temAttr.length - 1);
                        }
                        this.args.treeList[rootNodeIndex].selfTreeAttr = temAttr;

                    } else {              // 编辑子节点

                        let childNodeIndex = this.clickData.index.split('-');
                        let pIndex = parseInt(childNodeIndex[0]);
                        let obj = this.args.treeList[pIndex];        //目标子节点

                        for(let i = 1; i < childNodeIndex.length; i++) {
                            let iNum = parseInt(childNodeIndex[i]);
                            obj = obj.children[iNum];
                        }

                        for(let i in asyncObj) {

                            obj[i] = asyncObj[i];

                        }

                        // 子节点label更新
                        let temCAttr = '';
                        this.args.transCLabel.forEach(i => {

                            if(obj[i]) {
                                temCAttr = temCAttr + obj[i] + '/'
                            }

                        })
                        if(temCAttr.length > 0) {
                            temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                        }
                        obj.selfTreeAttr = temCAttr;

                    }

                } else {

                }

            } else {

                this.searchNode = '';
                let expandOid = [];

                if(flag) expandOid = this.getExpandArr(this.args.treeList, []);
                if(query && query != '') {
                    this.args.rootQuery = query;
                } else {
                    this.args.rootQuery = this.args.rootQuery != '' ? this.args.rootQuery : this.query.query;
                }

                this.updateTree(expandOid, level);

            }

        },

        //$obj || $user || $env转换
        commonTransLabel(str, originObj) {

            // *****$user 转换
            str = str.replace(/\$user\.userId/g, this.store.state.user.userId);
            str = str.replace(/\$user\.userName/g, this.store.state.user.username);
            str = str.replace(/\$user\.token/g, this.store.state.user.token);

            // *****$env  转换
            str = str.replace(/\$env\.serverIp/g, this.store.state.DWF_global.serverIp);

            // $obj转换
            if(typeof originObj == "object" && originObj != null) {

                // let temPre = str.split('{');
                // let temAft = temPre[1].split('}');

                let $obj = originObj;
                str = eval(str);
            }
            return str;

        },

        // 懒加载事件
        async loadData(item, callback) {

            let treeParam = {
                childrenCondition: this.args.transChildrenQuery,
                leafCondition: '',
                recursiveLevel: 1,
                rootCondition: '',
                startIndex: 0
            }
          let prefix = this.args.relationAttr ? this.args.relationAttr : 'parentOid';
          if(this.args.classCategory == 'ExternalItemClass'){
            prefix = `"${prefix}"`
          }
          treeParam.rootCondition = this.args.rootQuery == '' ? `and obj.${prefix} = '${item.oid}'` : `and obj.${prefix} = '${item.oid}' ${this.args.transChildrenQuery}`;

            let nodeResult = await getSelfJoinEobj(this.args.targetClass, treeParam, false, true, this.args.relationAttr);
            let temChild = [];

            if(nodeResult.data.success) {

                temChild = nodeResult.data.data;

            } else {
                this.$Message.error(nodeResult.data.message);
            }

            if(temChild.length && temChild.length > 0) {

                temChild.forEach((val, index) => {

                    // 子节点过滤结果
                    let temCAttr = '';
                    this.args.transCLabel.forEach(i => {

                        if(val[i]) {

                            temCAttr = temCAttr + val[i] + '/'
                        }

                    })

                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }

                    val.selfTreeAttr = temCAttr;
                    val.rootFlag = false;
                    val.index = `${item.index}-${index}`;
                    //  如果对象所选显示的属性 一个都不具有 则隐藏该对象
                    if(val.selfTreeAttr == '') {
                        val.selfTreeAttr = this.args.childrenEmptyLabel;
                    }

                    if(val.childrenCount > 0) {

                        val.loading = false;
                        val.children = [];

                    } else {

                        val.children = [];

                    }

                })

            } else {
                temChild = [];
            }

            setTimeout(() => {

                callback(temChild);
                if(temChild.length == 0) {
                    delete item.loading
                    delete item.children
                }

            },800);

        },

        async loadSelfData(item) {

            let treeParam = {
                childrenCondition: this.args.transChildrenQuery,
                leafCondition: '',
                recursiveLevel: 1,
                rootCondition: '',
                startIndex: 0
            }
          let prefix = this.args.relationAttr ? this.args.relationAttr : 'parentOid';
          if(this.args.classCategory == 'ExternalItemClass'){
            prefix = `"${prefix}"`
          }
            treeParam.rootCondition = this.args.rootQuery == '' ? `and obj.${prefix} = '${item.oid}'` : `and obj.${prefix} = '${item.oid}' ${this.args.transChildrenQuery}`;

            let nodeResult = await getSelfJoinEobj(this.args.targetClass, treeParam, false, true, this.args.relationAttr);
            let temChild = [];

            if(nodeResult.data.success) {

                temChild = nodeResult.data.data;

            } else {
                this.$Message.error(nodeResult.data.message);
            }

            if(temChild.length && temChild.length > 0) {

                temChild.forEach((val, index) => {

                    // 子节点过滤结果
                    let temCAttr = '';
                    this.args.transCLabel.forEach(i => {

                        if(val[i]) {

                            temCAttr = temCAttr + val[i] + '/'
                        }

                    })

                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }

                    val.selfTreeAttr = temCAttr;
                    val.rootFlag = false;
                    val.index = `${item.index}-${index}`;
                    //  如果对象所选显示的属性 一个都不具有 则隐藏该对象
                    if(val.selfTreeAttr == '') {
                        val.selfTreeAttr = this.args.childrenEmptyLabel;
                    }

                    if(val.childrenCount > 0) {

                        val.loading = false;
                        val.children = [];

                    }

                })

            } else {
                temChild = [];
            }

            let self = this;
            setTimeout(() => {

                if(temChild.length == 0) {
                    delete item.loading
                    delete item.children
                } else {
                    delete item.loading
                    item.children = temChild;
                    if(temChild.length > 0) {
                        self.$set(item, 'expand', true );
                    }
                }

            },800);

        },

        /**
         * @description 节点label模糊搜索
         * @param value 当前搜索的关键字
         * @param arr 被过滤的树
        */
        rebuildData(value, arr){

            let newarr = [];
            let self = this;
            arr.forEach(element => {
                if (element.children && element.children.length) {
                    const ab = this.rebuildData(value,element.children);
                    element.expand = true;
                    const obj = {
                        ...element,
                        children: ab
                    };
                    if (ab && ab.length) {
                        newarr.push(obj);
                    }
                } else {
                    if (element.selfTreeAttr.indexOf(value) > -1) {
                        newarr.push(element);
                    }
                }
            });
            return newarr;

        },

        // 搜索值为空时 回置树
        changeSearch(e) {

            if(e.target.value == '') {

                this.treePageIndex = 1;
                this.updateTree([], this.levelIndex);

            }

        },

        // 节点label模糊搜索
        handleSearch() {

            this.treePageIndex = 1;
            this.updateTree([], 50);

        },

        getAll() {
            return this.args.treeList;
        }

    }
}
</script>

<style scoped>
section {
  display: inline-block;
  vertical-align: top;
}
p {
  margin: 10px 0;
}

.ivu-tree-children li span+div {
    display: inline-block;
}

.freshBtn {
    float: right;
    margin: 8px  10px 0 0;
    font-size: 24px;
    cursor: pointer;
}

.labelClass {
    height: 30px;
    line-height: 30px;
}

.modalLabel {
    text-align: right;
}

.modalValue {
    color: #929090;
}

.ori-tree {
    position: relative;
    background: #fff;
}
.page-wrap {
    height: 30px;
}
</style>
