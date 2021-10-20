<template>
    <div>
        <Modal
            v-model="treeModal"
            title="树型控件"
            :mask-closable="false"
            width="1000px"
            >
            <h3>
                编写内容
                <span style="color: #666; font-size: 12px !important;">请编写树型控件内容与层级关系</span>
            </h3>
            <div v-show="viewState">
                <Button class="margin1" type="primary" @click="addNewNode">新增根节点</Button>
                <Card class="tree-wrap margin1">
                    <Tree v-for="item in treeList" :data="item" :render="renderWithButton"></Tree>
                </Card>
            </div>
            <div v-show="!viewState" style="height: 490px;">
                <Card class="tree-wrap margin1">
                    <Form ref="formInline" :model="formInline" :rules="ruleInline" inline :label-width="60">
                        <FormItem label="label" prop="nodeTitle">
                            <Input type="text" v-model.trim="formInline.nodeTitle"></Input>
                        </FormItem>
                        <FormItem label="id" prop="nodeId">
                            <Input v-model.trim="formInline.nodeId" :disabled="isNewRoot == 3"></Input>
                        </FormItem>
                        <FormItem v-show="isShowIcon" label="图标" prop="nodeIcon">
                            <Select v-model="formInline.nodeIcon" style="width:160px">
                                <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                                    <Icon :type="`${item.value}`"></Icon>
                                    <span class="node-icon">{{ item.label }}</span>
                                </Option>
                                <Option v-for="x in iList" :value="x.value" :key="x.value" :label="x.label">
                                    <i class="iconfont" :class="x.value"></i>
                                    <span class="node-icon">{{ x.label }}</span>
                                </Option>
                            </Select>
                        </FormItem>
                        <FormItem style="float: right;">
                            <Button type="primary" @click="handleSubmit('formInline')">保存</Button>
                            <Button type="text" @click="viewState = true">返回</Button>
                        </FormItem>
                    </Form>
                </Card>
            </div>

            <div slot="footer">
                <Button type="text" @click="treeModal = false">取消</Button>
                <Button type="primary" @click="confirmTree">确认</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import iconData from "@/views/functional-model/components/moduleIcon.js";
    import fontIconData from "@/views/functional-model/components/iFontIcon.js";
    export default {
        data() {
            return {
                treeModal: false,
                isShowIcon: true,      // 是否展示图标选项 结构树展示 点选树不显示
                viewState: true,       //显示 & 编辑 面板切换
                isNewRoot: 1,       // 1为新建根节点,  2为已有节点新增子节点, 3为编辑已有节点

                treeRowWrap: {
                    display: 'inline-block',
                    width: 'calc(100% - 20px)',
                    padding: '4px 0',
                    borderBottom: '1px solid #ddd',
                    lineHeight: '32px',
                    margin: '-4px 0'
                },
                treeList: [],
                editNode: {},     //当前正在编辑的节点
                
                // 节点定义
                formInline: {
                    nodeTitle: "",
                    nodeId: "",
                    nodeIcon: ""
                },
                ruleInline: {
                    nodeTitle: [
                        { required: true, message: '节点显示名不能为空哦~', trigger: 'blur' }
                    ],
                    nodeId: [
                        { required: true, message: '节点ID不能为空哦~', trigger: 'blur' },
                    ]
                },

                iconList: [],
                iList: [],
            }
        },

        created() {
            this.iconList = iconData;
            this.iList = fontIconData;
        },

        methods: {

            // 自定义树结构
            renderWithButton(h, {root, node, data}) {
                return <div style={[this.treeRowWrap]}>
                    <icon type={data.iconName} style="margin-right:8px;"/>
                    {data.label}
                    <span style="float:right;margin-right:8px">
                        <i-button icon={"md-add"} type={"primary"} size={"small"}
                                    onClick={this.addOperation.bind(this, data)}
                                    style={"margin-right:8px"}/>
                        <i-button icon={"md-remove"} size={"small"}
                                    onClick={this.delInfo.bind(this, data)}
                                    style={"margin-right:8px"}/>
                        <i-button icon={"md-create"} size={"small"}
                                    onClick={this.editInfo.bind(this, data)}
                                    style={"margin-right:8px"}/>
                        <i-button icon={"md-arrow-round-up"} size={"small"}
                                    onClick={this.upItems.bind(this, node, data)}
                                    style={"margin-right:8px"}/>
                        <i-button icon={"md-arrow-round-down"} size={"small"}
                                    onClick={this.downItems.bind(this, node, data)}
                                    style={"margin-right:8px"}/>
                    </span>
                </div>;
            },

            addNewNode() {
                this.isNewRoot = 1;

                this.$refs['formInline'].resetFields();

                this.viewState = false;
            },

            // 递归得到子节点
            getTargetNode(tree = []) {
                let arr = null;
                let _self = this;

                if (!!tree && tree.length !== 0) {

                    if(arr) return arr;
                    for (var i in tree) {
                        if(arr) break;
                        let targetId = _self.editNode.value;
                        if (tree[i].value == targetId) {
                            arr = tree[i];
                            break;
                        }
                        if(tree[i].children.length > 0) {
                            arr = _self.getTargetNode(tree[i].children);
                        } 
                    }

                }

                return arr;
            },
            
            /**  功能: 保存节点
             * @rootSelf 每组树的根节点才有的属性
             * @originRoot 每个节点的最外层父亲节点
             * @realRoot 每个节点最临近层父节点 */
            handleSubmit(name) {

                this.$refs[name].validate((valid) => {
                    if (valid) {
                        
                        // 新增根节点
                        if(this.isNewRoot == 1) {
                            let newNode = [{
                                label: this.formInline.nodeTitle,
                                value: this.formInline.nodeId,
                                rootSelf: true,
                                index: this.treeList.length,
                                iconName: this.formInline.nodeIcon,
                                children: []
                            }]

                            this.treeList.push(newNode);

                        } else if(this.isNewRoot == 2){         // 已有节点新增子节点

                            let targetNode = this.editNode;

                            // 某个根节点下 新增的二级节点
                            if(targetNode.rootSelf) {

                                // 定位根节点
                                let parentItem = this.treeList.filter(val => val[0].value == targetNode.value)[0];

                                let newNode = {
                                    label: this.formInline.nodeTitle,
                                    value: this.formInline.nodeId,
                                    index: parentItem[0].children.length,
                                    originRoot: parentItem[0].value,
                                    realRoot: parentItem[0].value,
                                    iconName: this.formInline.nodeIcon,
                                    children: []
                                }

                                parentItem[0].children.push(newNode);

                            } else {

                                let targetNode = this.editNode;

                                // 定位根节点
                                let parentItem = this.treeList.filter(val => val[0].value == targetNode.originRoot)[0];

                                let curentNode = this.getTargetNode(parentItem[0].children);

                                let newNode = {
                                    label: this.formInline.nodeTitle,
                                    value: this.formInline.nodeId,
                                    index: curentNode.children.length,
                                    originRoot: parentItem[0].value,
                                    realRoot: curentNode.value,
                                    iconName: this.formInline.nodeIcon,
                                    children: []
                                }

                                curentNode.children.push(newNode);
                            }

                        } else {                            // 编辑节点
                            
                            let targetNode = this.editNode;

                            //编辑某根节点
                            if(targetNode.rootSelf) {

                                // 定位根节点
                                let parentItem = this.treeList.filter(val => val[0].value == targetNode.value)[0];

                                parentItem[0].label = this.formInline.nodeTitle;
                                parentItem[0].iconName = this.formInline.nodeIcon;

                            } else {

                                let targetNode = this.editNode;

                                // 定位根节点
                                let parentItem = this.treeList.filter(val => val[0].value == targetNode.originRoot)[0];

                                let curentNode = this.getTargetNode(parentItem[0].children);

                                curentNode.label = this.formInline.nodeTitle;
                                curentNode.iconName = this.formInline.nodeIcon;

                            }

                        }

                        // 切换回展示面板
                        this.viewState = true;

                    } else {

                        this.$Message.error('请确认Label和Id不能为空, 且不与其他节点重复');

                    }
                })

            },

            // 增加子节点
            addOperation(el) {

                this.isNewRoot = 2;
                this.editNode = el;

                this.formInline.nodeTitle = '';
                this.formInline.nodeId = '';

                // this.$refs['formInline'].resetFields();

                this.viewState = false;

            },

            //删除子节点
            delInfo(el) {

                // 删除某个根节点
                if(el.rootSelf) {
                    
                    this.treeList.splice(this.treeList.findIndex(val => val[0].value == el.value), 1);

                } else if(el.originRoot == el.realRoot){       // 删除二级节点

                    // 定位根节点
                    let parentItem = this.treeList.filter(val => val[0].value == el.originRoot)[0];
                    parentItem[0].children.splice(parentItem[0].children.findIndex(val => val.value == el.value), 1);

                } else {      // 删除二级+节点
                    
                    // 定位根节点
                    let parentItem = this.treeList.filter(val => val[0].value == el.originRoot)[0];

                    this.editNode.value = el.realRoot;

                    let curentNode = this.getTargetNode(parentItem[0].children);

                    curentNode.children.splice(curentNode.children.findIndex(val => val.value == el.value), 1);

                }


            },

            // 编辑子节点
            editInfo(el) {
                console.log(el);

                this.isNewRoot = 3;
                this.editNode = el;

                this.viewState = false;

                this.formInline.nodeTitle = el.label;
                this.formInline.nodeId = el.value;
                this.formInline.nodeIcon = el.iconName;

            },

            // 公共移动操作
            moveItem(arr, oldIndex, newIndex, isRoot) {

                arr[oldIndex] = arr.splice(newIndex, 1, arr[oldIndex])[0];

                if(isRoot) {

                    // 更新index属性
                    arr[oldIndex][0].index = oldIndex;
                    arr[newIndex][0].index = newIndex;

                } else {

                    // 更新index属性
                    arr[oldIndex].index = oldIndex;
                    arr[newIndex].index = newIndex;

                }
                

                return arr;

            },

            // 上移子节点
            upItems(node, item) {
                console.log(node, item);

                let treeData = this.treeList;
                const itemIndex = parseInt(item.index);

                // 如果是某根节点
                if(item.rootSelf) {

                    if(itemIndex == 0) {
                        return;
                    }
                    this.moveItem(treeData, itemIndex, itemIndex - 1, true);

                } else {

                    // 定位根节点
                    let parentItem = this.treeList.filter(val => val[0].value == item.originRoot)[0];

                    // 二级节点
                    if(item.originRoot == item.realRoot) {

                        if(itemIndex == 0) {
                            return;
                        }
                        this.moveItem(parentItem[0].children, itemIndex, itemIndex - 1, false);

                    } else {              // 二+级节点

                        if(itemIndex == 0) {
                            return;
                        }

                        this.editNode.value = item.realRoot;

                        let curentNode = this.getTargetNode(parentItem[0].children);

                        this.moveItem(curentNode.children, itemIndex, itemIndex - 1, false);

                    }

                }
            },

            // 下移子节点
            downItems(node, item) {
                console.log(node, item);
                
                let treeData = this.treeList;
                const itemIndex = parseInt(item.index);

                // 如果是某根节点
                if(item.rootSelf) {

                    if(itemIndex == treeData.length - 1) {
                        return;
                    }
                    this.moveItem(treeData, itemIndex, itemIndex + 1, true);

                } else {

                    // 定位根节点
                    let parentItem = this.treeList.filter(val => val[0].value == item.originRoot)[0];

                    // 二级节点
                    if(item.originRoot == item.realRoot) {

                        if(itemIndex == parentItem[0].children.length - 1) {
                            return;
                        }
                        this.moveItem(parentItem[0].children, itemIndex, itemIndex + 1, false);

                    } else {              // 二+级节点

                        this.editNode.value = item.realRoot;

                        let curentNode = this.getTargetNode(parentItem[0].children);

                        if(itemIndex == curentNode.children.length - 1) {
                            return;
                        }

                        this.moveItem(curentNode.children, itemIndex, itemIndex + 1, false);

                    }

                }

            },

            // 编辑状态
            editModal(state, arr) {

                this.isShowIcon = state;

                if(arr.length > 0) this.treeList = arr;

                this.treeModal = true;
                this.viewState = true;

            },

            // 确认生成树
            confirmTree() {

                this.treeModal = false;
                this.viewState = false;

                this.$emit("transferTree", this.treeList);

            }
        }
    }
</script>

<style scoped>
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
.tree-wrap {
    height: 440px;
    overflow-y: auto;
}
.node-icon {
    width: 88px;
    float: right;
    color: rgb(204, 204, 204);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>