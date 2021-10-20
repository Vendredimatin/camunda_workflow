<template>
<div>
   <Card ref="main" :padding="0" class="self-card">
       <p slot="title">属性编辑框</p>
        <div style="padding: 15px">
            <div>
                <div v-if="'id' in propertyObj">  
                    <p class="margin1">名称</p>
                    <Input ref="nameInput" id="nameInput" class="margin1" :maxlength="20" v-model="propertyObj.name" placeholder="名称" 
                    :readonly="propertyObjType == 'WfProcess' || !editable" @on-blur="changeName" @on-enter="changeName"/>
                </div>
                <div class="margin1">系统标示：{{propertyObj.id}}</div>
                 
                 <!-- WfProcess -->
                 <div v-show="propertyObjType == 'WfProcess' || propertyObjType == 'WfProcessInstance'">
                    <div v-if="!editable" class="margin1" >版本名：{{propertyObj.version}}</div>
                    <div v-if="!editable">当前状态：{{propertyObj.statusTypy}}</div>
                    <div class="margin1" >绑定实体类：{{propertyObj.bindEnClassName}}</div>
                    <div class="margin1" >创建人：{{propertyObj.author}}</div>
                    <!-- <div v-if="!editable">流程状态：:{{propertyObj.status}}<div> -->
                    <div v-if="!editable">
                        <div class="margin1" >开始时间：{{new Date(propertyObj.startTime).format("yyyy-MM-dd hh:mm:ss")}}</div>
                        <div class="margin1" >最后更新：{{new Date(propertyObj.lastupdate).format("yyyy-MM-dd hh:mm:ss")}}</div>
                    </div>
                    <div v-else class="margin1" >最后更新：{{new Date(propertyObj.lastupdate).format("yyyy-MM-dd hh:mm:ss")}}</div>
                
                 </div>
                <!-- StartPoint -->
                 <div v-show="propertyObjType == 'StartPoint' ">
                    <div v-if="!editable">
                         <div>当前状态：{{propertyObj.statusTypy}}</div>
                        <div v-show="propertyObj.status == 3">
                            <div>开始时间：{{new Date(propertyObj.startTime).format("yyyy-MM-dd hh:mm:ss")}}</div>
                        </div>
                    </div>
                   
                    <div class="margin1" >起始表单：
                        <Select :disabled="!editable" v-model="propertyObj.launchFormName" @on-change="changeFormView" clearable filterable >
                            <Option v-for="item in views" :value="item.viewName" :key="item.viewName">{{ item.viewName }}</Option>
                        </Select>
                    </div>
                     <div class="margin1" >起始操作：
                        <Select :disabled="!editable" v-model="propertyObj.startOperation" @on-change="changeOperation" clearable filterable>
                            <Option v-for="item in operations" :value="item.authority" :key="item.authority">{{ item.displayName }}</Option>
                        </Select>
                    </div>
                    <div class="margin1" >并行输出：<i-switch :disabled="!editable" :value="propertyObj.isParallelOutput==1" @on-change="changeParallelOutput"/></div>
                    <p class="margin1">连接执行顺序</p>
                    <ul>
                        <li v-for="o in propertyObj.outputs" :key="o.name" class="list-content-item">{{o.name}}</li>
                    </ul>
                </div>
                <!-- ManualTask -->
                <div v-show="propertyObjType == 'ManualTask' ">
                     <div v-if="!editable">
                        <div> 当前状态：{{propertyObj.statusTypy}}</div>
                        <div v-if="propertyObj.status != 4 ">
                            <div>开始时间：{{new Date(propertyObj.startTime).format("yyyy-MM-dd hh:mm:ss")}}</div>
                        </div>
                        <div v-if="propertyObj.status == 2 ">
                            <div>提交人：{{propertyObj.submitter}}</div>
                        </div>
                        <div v-if="propertyObj.status == 7 ||propertyObj.status == 3 ">
                            <div>结束时间：{{new Date(propertyObj.endTime).format("yyyy-MM-dd hh:mm:ss")}}</div>
                        </div>
                    </div>
                    <div class="margin1" >绑定表单：
                        <Select :disabled="!editable" v-model="propertyObj.formName"  @on-change="changeFormView" clearable filterable>
                            <Option v-for="item in views" :value="item.viewName" :key="item.viewName">{{item.viewName}}</Option>
                        </Select>
                        <!-- <span v-else>{{propertyObj.formName}}</span> -->
                    </div>
                    <div class="margin1" >前处理操作：
                        <Select :disabled="!editable" v-model="propertyObj.beforeOperation" @on-change="changeOperation('before')" clearable filterable>
                            <Option v-for="item in operations" :value="item.authority" :key="item.authority">{{ item.displayName }}</Option>
                        </Select>
                        <!-- <span v-else>{{propertyObj.beforeOperation}}</span> -->
                    </div>
                    <div class="margin1" >后处理操作：
                        <Select :disabled="!editable" v-model="propertyObj.afterOperation" @on-change="changeOperation('after')" clearable filterable>
                            <Option v-for="item in operations" :value="item.authority" :key="item.authority">{{ item.displayName }}</Option>
                        </Select>
                        <!-- <span v-else>{{propertyObj.afterOperation}}</span> -->
                    </div>
                    
                    <div v-if="editable">
                        <div class="margin1" >办理期限：</div>
                            <RadioGroup :disabled="!editable" :value="propertyObj.deadlineDays==-1?'false':'true'" @on-change="changeHasDeadlineDays">
                                <Radio label="false"  class="margin1">无</Radio>
                                <Radio label="true" class="margin1"> 有</Radio>
                            </RadioGroup>
                            <div v-show="propertyObj.deadlineDays!=-1">
                                <InputNumber  v-model="propertyObj.deadlineDays" :max="366" :min="1"></InputNumber>天
                            </div>
                        </div>
                        <div v-else>
                            <div>办理期限：{{propertyObj.deadlineDays==-1?propertyObj.deadlineDays+'天':'无'}}</div>
                        </div>
                        <!-- <Select :disabled="!editable" v-model="propertyObj.deadlineDays" @on-change="changeDeadlineDays()">
                            <Option v-for="item in deadlines" :value="item.value" :key="item.label">{{ item.label }}</Option>
                        </Select> -->
                    
                    <div class="margin1" >并行输入：<i-switch :disabled="!editable" :value="propertyObj.isParallelInput==1" @on-change="changeParallelInput"/></div>
                    <div class="margin1" >并行输出：<i-switch :disabled="!editable" :value="propertyObj.isParallelOutput==1" @on-change="changeParallelOutput"/></div>
                    <p class="margin1">连接执行顺序</p>
                    <ul>
                        <li v-for="o in propertyObj.outputs" :key="o.name" class="list-content-item">{{o.name}}</li>
                    </ul>
                </div>
                <!-- WaitingTask -->
                <div v-show="propertyObjType == 'WaitingTask'">
                    <div class="margin1" v-if="!editable">当前状态：{{propertyObj.statusTypy}}</div>
                    <div class="margin1" >并行输入：<i-switch :disabled="!editable" :value="propertyObj.isParallelInput==1" @on-change="changeParallelInput"/></div>
                    <div class="margin1" >并行输出：<i-switch :disabled="!editable" :value="propertyObj.isParallelOutput==1" @on-change="changeParallelOutput"/></div>
                </div>
                <!-- EndPoint -->
                <div v-show="propertyObjType == 'EndPoint' ">
                    <div v-if="!editable">当前状态：{{propertyObj.statusTypy}}</div>
                    <div class="margin1" >结束表单：
                        <Select :disabled="!editable" v-model="propertyObj.endFormName" @on-change="changeFormView" clearable filterable>
                            <Option v-for="item in views" :value="item.viewName" :key="item.viewName">{{ item.viewName }}</Option>
                        </Select>
                    </div>
                     <div class="margin1" >结束操作：
                        <Select :disabled="!editable" v-model="propertyObj.endOperation" @on-change="changeOperation" clearable filterable>
                            <Option v-for="item in operations" :value="item.authority" :key="item.authority">{{ item.displayName }}</Option>
                        </Select>
                    </div>
                    <div class="margin1" >并行输入：<i-switch :disabled="!editable" :value="propertyObj.isParallelInput==1" @on-change="changeParallelInput"/></div>
                </div>
                <!-- Transition -->
                 <div v-show="propertyObjType == 'Transition' ">
                    
                    <div class="margin1" >连接执行顺序号：{{propertyObj.orderNumber}}</div>
                    <div class="margin1" v-if="!editable">当前状态：{{propertyObj.statusTypy}}</div>
                        <div v-if="!editable">
                            <div v-if="propertyObj.alwaysTrue">无条件</div>
                            <div v-else>有条件
                                <Input type="textarea" v-model="navigationRule" :readonly="true"></Input>
                            </div>
                        </div>
                        <div v-else>
                            <RadioGroup :disabled="!editable" :value="propertyObj.alwaysTrue?'true':'false'" @on-change="changeAlwaysTrue">
                                <Radio label="true"  class="margin1">无条件</Radio>
                                <Radio label="false" class="margin1"> 有条件</Radio>
                                <Input type="textarea" :readonly="true" 
                                v-if="propertyObj.alwaysTrue==false" :autosize="{minRows: 2,maxRows: 5}"
                                v-model="navigationRule" @on-focus="showNavigationRuleModal"/>
                                <!-- <Button :disabled="!editable" v-if="propertyObj.alwaysTrue==false" @click="showNavigationRuleModal">编辑</Button> -->
                            </RadioGroup> 
                        </div>
                     
                </div>
            </div>
            <!-- </Panel> -->
            <Button class="self-btn" @click="showProcessEditPanel" v-if="haveAdvancedProperties">编辑高级属性</Button>
        <!-- </Collapse> -->
        </div>
        </Card>
        <Modal v-model="processEditPanel" :mask-closable="false" title="高级属性" width="1200" height="500" >
            
            <Tabs v-show="isWfProcess" value="name1">
                <TabPane label="对象属性" name="name1">
                    <Table :columns="processVariableCol" :data="processVariable" :height="scrollHeight*0.5"></Table>
                </TabPane>
                <TabPane label="拥有者" name="name2">
                    <div style="margin:8px 0;" v-if="editable">
                        <org-user-selector :havelauncher="false" ref="proprietorSelector" style="display: inline-block;margin-right:10px"/> 
                        <Button @click="addProprietor">添加</Button>
                    </div>
                    <Table :columns="proprietorCol" :data="propertyObj.proprietors" :height="scrollHeight*0.5"></Table>
                </TabPane>
            </Tabs>

            <Tabs v-show="propertyObjType == 'ManualTask'" value="name1">
                <TabPane label="对象属性" name="name1">
                    <Table :columns="taskVariableCol" :data="taskVariable" :height="scrollHeight*0.5"></Table>
                </TabPane>
                <TabPane v-show="propertyObjType == 'ManualTask'" label="办理人" name="name2">
                    <div style="margin:8px 0;" v-if="editable">
                        <org-user-selector :havelauncher="true" ref="participantSelector" style="display: inline-block;margin-right:10px"/> 
                        <Button @click="addParticipant">添加</Button>
                    </div>
                    <Table :columns="participantCol" :data="propertyObj.participants" :height="scrollHeight*0.5"></Table>
                </TabPane>
            </Tabs>
        </Modal>
        
        <rule-edit-panel ref="ruleEditPanel" :property-obj="propertyObj" :show='navigationRuleModal' 
        :process-variable="processVariable" :wfprocess="wfprocess"
        @on-close='closeRuleEditPanel' @save='saveNavigationRule'></rule-edit-panel>
            
    </div>

</template>
<script>
import $ from 'jquery';
import OrgUserSelector from "./orgUserSelector";
import RuleEditPanel from "./ruleEditPanel";
import {getViews,getEntitiesOperations} from "@/api/others.js";
export default {
     props: ['obj','wfprocess','editable'],
     components: {OrgUserSelector,RuleEditPanel},
     data () {
        return {
            that:this,
            loading: true,
            scrollHeight: 1000,
            open: ["1","3"],
            propertyObjType: '',//WfProcess,Transition,ManualTask
            propertyObj: null,
            processEditPanel: false,
            processVariable: [],
            processVariableCol:[
                {
                        title: '变量名',
                        key: 'name',
                        sortable: true
                },{
                        title: '变量中文名',
                        key: 'description',
                        sortable: true
                },{
                        title: '变量类型',
                        key: 'datatype',
                        sortable: true
                }
            ],
            participantCol:[
                {
                        title: '类型',
                        key: 'participantType',
                        render:(h, params) =>{
                            var parType;
                            if(params.row.participantType == "user") parType ='用户';
                            else if(params.row.participantType == "group") parType ='用户组';
                            else if(params.row.participantType == "launcher") parType ='发起人';
                            return h('span', parType);
                        }
                },{
                        title: '显示名',
                        key: 'displayName',
                },{
                        title: '英文名',
                        key: 'name',
                },{
                        title: 'id',
                        key: 'oid',
                },
                 {
                        title: '操作',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: !this.editable,
                                    },
                                    on: {
                                        click: () => {
                                            this.removeParticipant(params.index)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
            ],
            proprietorCol:[
                {
                        title: '类型',
                        key: 'proprietorType',
                        render:(h, params) =>{
                            var proType;
                            if(params.row.proprietorType == "user") proType ='用户';
                            else if(params.row.proprietorType == "group") proType ='用户组';
                            return h('span', proType);
                        }
                },{
                        title: '显示名',
                        key: 'displayName',
                },{
                        title: '英文名',
                        key: 'name',
                },{
                        title: 'id',
                        key: 'oid',
                },
                {
                        title: '操作',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: this.propertyObjType =='WfProcessInstance',
                                    },
                                    on: {
                                        click: () => {
                                            this.removeProprietors(params.index)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
            ],
            proprietorModal: false,
            proprietorRadio: 'group',
            views: [],
            operations: null,
            taskVariableCol:[
                {
                        title: '变量名',
                        key: 'name',
                },{
                        title: '变量中文名',
                        key: 'description',
                },{
                        title: '变量类型',
                        key: 'datatype',
                },{
                        title: '访问控制',
                        key: 'accessControl',
                        render:(h,params)=>{
                            return h('div',[ h('span', {}, params.row.accessControl ===1?'可写':'只读'),
                                h('i-switch',{
                                    props: {
                                        value: params.row.accessControl === 1,
                                        disabled: !this.editable,
                                    },
                                    on: {
                                        'on-change': (value) => {
                                            this.switchAccessControl(params.index);
                                        }
                                    }
                                })])
                        }
                }
                // ,{
                //         title: '访问控制',
                //         key: 'accessControl',
                //         render: (h,params) =>{
                //             var s;
                //             if(params.row.accessControl == 1) s ="可写";
                //             else if(params.row.accessControl == 0) s ="只读";
                //             return h('div', s);
                //         }
                // }
            ],
            taskVariable: [],
            
            navigationRuleModal: false,

            ruleVariable: {'name':''},
            taskStatusTypy:{
                2:'运行中',
                3:'已完成',
                4:'未激活',
                7:'已终止',
            },
            proStatusTypy:{
                5:'运行中',
                8:'已完成',
                7:'已终止',
            },
            transitionStatusTypy: {
                0: "默认",
                1: "激活",
                2: "完成",
                3: "未用",
                4: "异常",
            },
        };
     },
     watch: {
        obj(obj){
            this.propertyObj = obj;
            console.log("this.propertyObj",this.propertyObj);
           if(obj instanceof Transition){
                this.propertyObjType = "Transition";
                this.propertyObj.statusTypy = this.transitionStatusTypy[this.propertyObj.status];
            }else if(obj instanceof WfProcess || obj instanceof WfProcessInstance){
                this.propertyObjType = obj instanceof WfProcess?"WfProcess":"WfProcessInstance";
                this.propertyObj.statusTypy = this.proStatusTypy[this.propertyObj.status];
           }else{
                if(obj instanceof ManualTask){
                    this.propertyObjType = "ManualTask";
                }else if(obj instanceof StartPoint){
                    this.propertyObjType = "StartPoint";
                }else if(obj instanceof EndPoint){
                    this.propertyObjType = "EndPoint";
                }else if(obj instanceof WaitingTask){
                    this.propertyObjType = "WaitingTask";
                }
                this.propertyObj.statusTypy = this.taskStatusTypy[this.propertyObj.status];
           }
        },
        wfprocess(wfprocess){
            // console.log("set wfprocess",wfprocess);
            if(wfprocess.proprietors==null) this.wfprocess.proprietors=[];
            this.getProcessVariable();
            this.loadViews();
            this.wfprocess.statusTypy = this.proStatusTypy[this.wfprocess.status];
            if(wfprocess instanceof WfProcessInstance){ 
            }
        },
     },
     created(){
         if(!this.editable){
            this.processVariableCol.push({
                title: '变量值',
                key: 'valueStr',
            });
            this.taskVariableCol.pop();
            this.taskVariableCol.push({
                title: '变量值',
                key: 'valueStr',
            });
         }
     },
    mounted(){
       let that = this;
        this.loadOperations();
        window.onresize = () => {
            that.scrollHeight = document.documentElement.scrollHeight;
        }
    },
    computed:{
        isWfProcess(){
            return this.propertyObjType=='WfProcess' ||this.propertyObjType=='WfProcessInstance';
        },
        haveAdvancedProperties(){
            return this.propertyObjType=='ManualTask' || this.propertyObjType=='WfProcess' ||this.propertyObjType=='WfProcessInstance';
        },
       navigationRule(){
           if('navigationRule' in this.propertyObj && this.propertyObj.navigationRule !=null){
                return this.propertyObj.navigationRule.toString();
           }
       }
    },
    methods:{
        getAccessControl(){
            let accessControl = [];
            this.taskVariable.forEach(v=>{
                accessControl[v.name] = v.accessControl;
            });
            // console.log(accessControl);
        },
        switchAccessControl(index){
            let cmd = new PMAccessibleVarListChangedCmd( this.propertyObj, this.wfprocess);
            let newobjs = this.propertyObj.cloneAccessibleVarList();
            newobjs[index].accessControl =  newobjs[index].accessControl==1?0:1;
            cmd.update(newobjs);
            map[this.wfprocess.id].stack.execute(cmd);
            this.taskVariable[index].accessControl = newobjs[index].accessControl;
            this.getAccessControl();
        },
        load(){
            this.loadOperations();
            if(this.views.length==0){this.loadViews();}
            this.$refs.participantSelector.loadData();
            this.$refs.proprietorSelector.loadData();
        },
        loadViews(){
            let that = this;
            getViews(this.wfprocess.bindEnClassName).then(res=>{
                if(res.data.success){
                    that.views = res.data.data;
                }
            });
        },
        loadOperations(){
            let that = this;
            that.operations = [];
            getEntitiesOperations("Root").then(res=>{
                if(res.data.success){
                    let opr = res.data.data.queryOprConfigs;
                    for(var i=0; i< opr.length; i++){
                        var condition = opr[i].conditionExpre;
                        if(condition!=null && condition!="" && condition.startsWith("serverScript:") ){
                            that.operations.push(opr[i]);

                            // that.operations[val["authority"]+""] = val["displayName"];
                        }
                    }
                }
            })
        },
        changeOperation(operationType){
            let that = this;
             if (that.propertyObj instanceof StartPoint) {
                map[that.wfprocess.id].stack.execute(new PMValueChangedCmd(
                    that.propertyObj, "startOperation",that.propertyObj.startOperation, that.wfprocess));
            } else if (that.propertyObj instanceof EndPoint) {
                map[that.wfprocess.id].stack.execute(new PMValueChangedCmd(
                that.propertyObj, "endOperation", that.propertyObj.endOperation, that.wfprocess));

            } else if (that.propertyObj instanceof ManualTask) {
            if(operationType=="before"){
                map[that.wfprocess.id].stack.execute(new PMValueChangedCmd(
                that.propertyObj, "beforeOperation", that.propertyObj.beforeOperation, that.wfprocess));
            }else if (operationType == "after"){
                map[that.wfprocess.id].stack.execute(new PMValueChangedCmd(
                that.propertyObj, "afterOperation", that.propertyObj.afterOperation, that.wfprocess));
            }
            }
        },
        showProcessEditPanel(){
           
            if(this.propertyObj instanceof AbstractTask){
                this.getTaskVariable();
            }

            this.processEditPanel = true;
        },
        // 获取任务关联属性
        getTaskVariable(){
            this.taskVariable = [];
            var objs = this.propertyObj.accessibleVars;
            if (objs != null && objs.length > 0) {
                for (var i = 0; i < objs.length; i++) {
                    var v = this.wfprocess.seekChildByID(objs[i].varId);
                    v.accessControl = objs[i].accessControl;
                    v.valueStr = v.toValueString();
                    if(v!=null) this.taskVariable.push(v);
                }
            }
            // console.log("this.taskVariable",this.taskVariable);
        },
        // 获取流程属性
        getProcessVariable(){
            this.processVariable = [];
            for(var i=0; i<this.propertyObj.children.length ;i++){
                if(this.propertyObj.children[i] instanceof DataVariable){
                    this.propertyObj.children[i].valueStr =  this.propertyObj.children[i].toValueString();
                    this.processVariable.push(this.propertyObj.children[i]);
                }
            }
         },

        onclose(){
            this.$emit('on-close');
        },
        changeParallelInput(status){
            let val = status? 1:0;
            this.propertyObj.isParallelInput = val;
            map[this.wfprocess.id].stack.execute(new PMValueChangedCmd(this.propertyObj,
                "isParallelInput", val, this.wfprocess));
        },
        changeParallelOutput(status){
            let val = status? 1:0;
            this.propertyObj.isParallelOutput = val;
            map[this.wfprocess.id].stack.execute(new PMValueChangedCmd(this.propertyObj,
                "isParallelOutput", val, this.wfprocess));
            if( this.propertyObj.isParallelOutput){
                this.propertyObj.outputs.forEach(output=>{
                    this.changeTransAlwaysTrue(output,true);
                })
            }
        },
        changeName(){
            var val = this.propertyObj.name;
            if(val.length==20){
                this.$Message.info("名称不能超过20个字符");
                return ;
            }
            if(val==null || val==""){
                this.$Message.info("此属性不能为空");
                return ;
            } else {
                // this.propertyObj.name = val;
                map[this.wfprocess.id].stack.execute(new PMValueChangedCmd(this.propertyObj,
				"name", val, this.wfprocess));
            }
        },
       changeFormView(){
           let that = this;
            if (that.propertyObj instanceof StartPoint) {
            map[that.wfprocess.id].stack.execute(new PMValueChangedCmd(
                that.propertyObj, "launchFormName",that.propertyObj.launchFormName, that.wfprocess));
        } else if (that.propertyObj instanceof EndPoint) {
            map[that.wfprocess.id].stack.execute(new PMValueChangedCmd(
                that.propertyObj, "endFormName", that.propertyObj.endFormName, that.wfprocess));
        } else if (that.propertyObj instanceof ManualTask) {
            map[that.wfprocess.id].stack.execute(new PMValueChangedCmd(
                that.propertyObj, "formName", that.propertyObj.formName, that.wfprocess));
        }
       },
        editProcessVariables(){

        },
   
        addProprietor(){
            var selectedItem = this.$refs.proprietorSelector.getSelectedItem();
            //  console.log("selectedItem",selectedItem);
            if(selectedItem==null) {
              this.$Message.info("未选择用户/用户组");
              return;
            }
            var par;
            //流程模版添加拥有者
            // if(this.propertyObj instanceof WfProcess){
                if(selectedItem.value == '000'){
                    this.$Message.info("无法添加‘无组织用户’组");
                    this.$refs.proprietorSelector.recovery();
                    return;
                }else{ 
                    for(var i = 0; i < this.propertyObj.proprietors.length; i++){
                        if(this.propertyObj.proprietors[i].oid == selectedItem.value){
                            this.$Message.info("请勿重复添加该用户/用户组");
                            this.$refs.proprietorSelector.recovery();
                            return;
                        }
                    }
                    par = {'proprietorType': selectedItem.type,'name':selectedItem.name,'displayName': selectedItem.label,'oid':selectedItem.value};
                }
               
                // console.log("par",par);
                this.propertyObj.proprietors.push(par);
                map[this.wfprocess.id].stack.execute(new PMValueChangedCmd(this.propertyObj,
                    "proprietors", this.propertyObj.proprietors, this.propertyObj));
                this.$refs.proprietorSelector.recovery();
               
        },
        addParticipant(){
            var par;
            //任务添加办理人
                var selectedItem = this.$refs.participantSelector.getSelectedItem();
                // console.log(" addParticipant selectedItem",selectedItem);
                if(selectedItem==null) {
                  this.$Message.info("未选择用户/用户组");
                  return;
                }

                if(selectedItem.type == 'launcher'){
                    for(let i = 0; i < this.propertyObj.participants.length; i++){
                        if(this.propertyObj.participants[i].participantType == 'launcher'){
                            this.$Message.info("请勿重复添加发起人");
                            this.$refs.participantSelector.recovery();return;
                        }
                    }
                    par = {'participantType': 'launcher', 'name': '','oid':''};
                }else if(selectedItem.value == '000'){
                    this.$Message.info("无法添加‘无组织用户’组");
                    this.$refs.proprietorSelector.recovery();
                    return;
                }else{ 
                    for(let i = 0; i < this.propertyObj.participants.length; i++){
                        if(this.propertyObj.participants[i].oid == selectedItem.value){
                            this.$Message.info("请勿重复添加该用户/用户组");
                            this.$refs.participantSelector.recovery();return;
                        }
                    }
                    par = {'participantType': selectedItem.type, 'name':selectedItem.name,'displayName': selectedItem.label,'oid':selectedItem.value};
                }
                // console.log("par",par);
                var cmd = new PMParticipantListChangedCmd(this.propertyObj, this.wfprocess);
                var newobj = this.propertyObj.participants;newobj.push(par);
                cmd.update(newobj);
                map[this.wfprocess.id].stack.execute(cmd);
                this.$refs.participantSelector.recovery();
         
        },
            
        removeParticipant(index){
            var newvalue = this.propertyObj.participants;
            newvalue.splice(index,1);
            map[this.wfprocess.id].stack.execute(new PMValueChangedCmd(
                this.propertyObj, "participants",newvalue, this.wfprocess));
            this.propertyObj.participants = newvalue;
        },
        removeProprietors(index){
            var newvalue = this.propertyObj.proprietors;
            newvalue.splice(index,1);
            map[this.propertyObj.id].stack.execute(new PMValueChangedCmd(
                    this.propertyObj, "proprietors",newvalue, this.propertyObj));
            this.propertyObj.proprietors = newvalue;
            this.wfprocess.proprietors = newvalue;
        },

        changeAlwaysTrue(val){
            val = val == "true"?true:false;
            this.changeTransAlwaysTrue(this.propertyObj,val);
            // this.propertyObj.alwaysTrue =  val == "true"?true:false;
            // map[this.wfprocess.id].stack.execute(new PMNavigationChangeCmd(
            //     this.propertyObj, this,  this.propertyObj.alwaysTrue, this.wfprocess));
            // if(this.propertyObj.alwaysTrue){
            //     this.$set(this.propertyObj,'navigationRule',null);
            //     map[this.wfprocess.id].stack.execute(new PMNavigationRuleEditCmd(
            //         this.propertyObj, null, this.wfprocess));
            // }
        },
        changeTransAlwaysTrue(transition,val){
            transition.alwaysTrue = val;
             map[this.wfprocess.id].stack.execute(new PMNavigationChangeCmd(
                transition, this,  transition.alwaysTrue, this.wfprocess));
            if(val){
                this.$set(transition,'navigationRule',null);
                map[this.wfprocess.id].stack.execute(new PMNavigationRuleEditCmd(
                    transition, null, this.wfprocess));
            }
        },
        showNavigationRuleModal(){
            this.navigationRuleModal = true;
        },
       
        closeRuleEditPanel(){
            this.navigationRuleModal = false;
        },
        saveNavigationRule(){
            let expressionEntity = this.$refs['ruleEditPanel'].expressionEntity;
            this.$set(this.propertyObj,'navigationRule',expressionEntity);
            map[this.wfprocess.id].stack.execute(new PMNavigationRuleEditCmd(
                this.propertyObj, expressionEntity, this.wfprocess));
            this.closeRuleEditPanel();
        },
        changeHasDeadlineDays(val){
            if(val=='true'){
                this.propertyObj.deadlineDays = 1;
                map[this.wfprocess.id].stack.execute(new PMValueChangedCmd(
				this.propertyObj, "deadlineDays", this.propertyObj.deadlineDays,
				this.wfprocess));
            }else{
                this.propertyObj.deadlineDays = -1;
                map[this.wfprocess.id].stack.execute(new PMValueChangedCmd(
				this.propertyObj, "deadlineDays", this.propertyObj.deadlineDays,
				this.wfprocess));
            }
        },
        changeDeadlineDays(){
            // console.log(this.propertyObj.deadlineDays);
            map[this.wfprocess.id].stack.execute(new PMValueChangedCmd(
				this.propertyObj, "deadlineDays", this.propertyObj.deadlineDays,
				this.wfprocess));
        }
       
     }
     
}
</script>

<style scoped>
 .active{
    background-color: rgb(237,247,254) !important;
}
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
  }
.ivu-divider-horizontal {
    margin: 10px 0 !important;
  }
.ivu-card-bordered .ivu-card-body{
    padding:0px !important;
}
.list-content-item {
    margin: 0;
    line-height: normal;
    padding: 7px 16px;
    clear: both;
    color: #515a6e;
    font-size: 12px!important;
    white-space: nowrap;
    list-style: none;
    cursor: pointer;
}
</style>

