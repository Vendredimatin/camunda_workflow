<template>
   <div style="">
       <div style="margin:10px">
                <div style="height:50px;margin-bottom:2px;">
                    <!-- <Button type="primary" :disabled=" taskStatus == 0"  @click="checkTask" style="margin: 5px;float:left">
                        查看
                    </Button> -->
                    <Button type="primary" class="self-btn" :disabled=" taskStatus == 0" @click="openTaskForm" style="margin: 5px;float:left">
                        打开
                    </Button>
                    <Button type="primary" class="self-btn" :disabled="taskStatus != 2 && taskStatus != 4" @click="openAssignModal" style="margin: 5px;float:left">
                        移交
                    </Button>
                    <Button type="primary" class="self-btn" :disabled="taskStatus != 2 && taskStatus != 4" @click="restartTask" style="margin: 5px;float:left">
                        重新发起
                    </Button>
                    <Button class="self-btn" style="float: right; margin-top: 11px;" size="small" type="primary" shape="circle" icon="ios-refresh" @click="activate"></Button>
                    <Input search placeholder="搜索" @on-change="handleSearch" v-model="searchInput" style="width: auto;margin: 5px;float:right;"/>
                    
                    <Button class="self-btn" type="error" :disabled="taskStatus != 2 && taskStatus != 4  && taskStatus != 3" @click="deleteInstMadel = true" style="margin: 5px;float:right">
                        终止
                    </Button>

                    <Button class="self-btn" type="primary" :disabled="taskStatus != 2 && taskStatus != 4" @click="openSubmitModal" style="margin: 5px;float:right">
                        提交
                    </Button>
                    
                    
                </div>
                    <Modal
                        v-model="deleteInstMadel"
                        title="终止流程实例"
                        @on-ok="deleteInstance"
                        @on-cancel="deleteInstMadel = false">
                        <p>确定要终止流程实例吗？</p>
                    </Modal>

                     <Modal v-model="submitModal" :mask-closable="false" title="提交">
                        <Checkbox v-model="wantAssignNext">指定下一步执行人</Checkbox>
                        <div v-if="wantAssignNext">
                        <p>指定下一步执行人</p>
                                <user-selector  ref="nextuserselector" ></user-selector>
                        </div>
                        <p style="margin:10px 0px;">备注：</p>
                        <Input  v-model="submitComment" type="textarea" :rows="4" placeholder="请输入..." />
                        <div slot="footer">
                            <Button class="self-btn" type="text" size="large"  @click="closeSubmitMoal">取消</Button>
                            <Button class="self-btn" type="primary" size="large" @click="onConfirmSubmit">确认</Button>
                        </div>
                    </Modal>

                     <Modal v-model="assignModal" :mask-closable="false" title="选择用户">
                        <p>将任务移交给其他人</p>
                    
                        <user-selector  ref="userselector" ></user-selector>
                        <p>备注</p>
                        <Input  v-model="assignComment" type="textarea" :rows="4" placeholder="请输入..." />
                        <div slot="footer">
                            <Button type="text" size="large"  @click="closeAssignMoal">取消</Button>
                            <Button type="primary" size="large" @click="onConfirmAssign">确认</Button>
                        </div> 
                    </Modal>
                <Table ref="taskTable"
                    borde
                    :loading="loading" highlight-row
                    :columns="taskColumns" :data="taskList"
                    @on-current-change="currentChange" 
                    @on-sort-change='changeSort' 
                    @on-row-dblclick='handleDbClick'
                ></Table>
                <div style="margin: 10px;">
                    <div style="float: right; margin: 5px">
                        <Page size="small" show-elevator show-sizer 
                            :page-size-opts="pageSizeOpts"
                            :pageSize="pageSize"
                            :total="totalNumber"
                            :current="currentPage"
                            @on-change="changePage"
                            @on-page-size-change="changePageSize"
                            />
                    </div>
                     <div class="self-tag" style="float: right;line-height: 34px;"> 总共{{totalNumber}}条 </div>
                </div>
       </div>
   </div>
</template>

<script>
import $ from 'jquery';
import { forEach } from '@/libs/utils';
import UserSelector from "@/views/workflow/sub_components/UserSelector";
import {getUser, getEobjSingle} from "@/api/others";
// import {getTaskInstCount, getManualTaskInstances,sendCommand,deleteProcessInstance,receiveTaskInstance,launchProcessByObjId ,restartProcessInstance} from "@/api/wfprocess"
import {getTaskInstCount, getManualTaskInstances,sendCommand,deleteProcessInstance,receiveTaskInstance,launchProcessByObjId ,restartProcessInstance} from "./api/WfProcessApi"

const name = "WfProcessTask";
export default {
    props: ["store", "root"],
    components:{ UserSelector},
    data() {
        return {
            userDisplayName: "",

            currTask:{},
            filerStatus:[1,2],
            condition:"order by taskInstanceEnabledDateTime desc",
            wantAssignNext :false,
            assignModal:false,
            assignComment :"",
            taskInfoModal:false,
            taskList:[],
            unSearchList:[],
            loading: true,
            deleteInstMadel: false,
            searchInput:"",
            totalNumber: 0,
            pageSizeOpts:[1,2, 5,10, 50, 100],
            currentPage: 1,
            pageSize: 10,
            submitModal: false,
            submitComment:"",

            taskColumns:[
                 {
                    type: 'index',
                    width: 80,
                    align: 'center'
                },{
                    title: '状态',
                    key: 'taskInstanceStatus',
                    // width: 90,
                    render: (h, params) => {
                        var s;
                        if(params.row.taskInstanceStatus == 1)
                            s = '待领取';
                        else if(params.row.taskInstanceStatus == 2)
                            s = '待提交';
                        else if(params.row.taskInstanceStatus == 3)
                            s = '我参与的';
                        else if(params.row.taskInstanceStatus == 4)
                            s = '移交给我的';
                        return h('div', s);
                    },
                   
                    filters: [{
                            label: '待领取',
                            value: 1
                        },{
                            label: '待提交',
                            value: 2
                        },{
                            label: '我参与的',
                            value: 3
                        }],
                        filterMultiple: true,
                        filterRemote: function (value, row) {
                            this.handleFilter(value,row);
                        }
                },{
                    title:'流程实例Id',
                    key:'wfProcessInstanceId',
                     render: (h, params) => {
                        return h('div',[
                            h('Tooltip',{props: {
                                content: params.row.wfProcessInstanceId,
                                "max-width":"300",
                                'placement':'top',
                            }},'0..'+params.row.wfProcessInstanceId.substr(-5))])
                    },
                },{
                    title: '活动名',
                    key: 'name',
                },{
                    title: '所在流程',
                    key: 'wfProcessInstanceName',
                    render: (h, params) => {
                        return h('div', params.row.wfProcessInstanceName + '（'+params.row.wfProcessVerison+'）');
                    },
                    sortable: true,
                },{
                    title: '绑定实体类',
                    key: 'bindEnClassName',
                    render: (h, params) => {
                        return h('div', params.row.bindEnClassName);
                    },
                    sortable: true,
                },{
                    title: '绑定表单',
                    key: 'formName',
                    // sortable: true,
                },
                // {
                //     title: '流程发起时间',
                //     key: 'launchDateTime',
                //     render: (h, params) => {
                //             return h('div', new Date(params.row.launchDateTime).format("yyyy-MM-dd hh:mm:ss"));
                //     },
                //     sortable: true
                // },
                {
                    title: '发起人',
                    key: 'launchUserName',
                    sortable: true
                },
                {
                    title: '任务激活时间',
                    key: 'taskInstanceEnabledDateTime',
                    render: (h, params) => {
                        return h('div', new Date(params.row.taskInstanceEnabledDateTime).format("yyyy-MM-dd hh:mm:ss"));
                    },
                    sortable: true,
                    sortType: "desc",
                },
                // {
                //     title: '任务领取时间',
                //     // width: 190,
                //     key: 'taskInstanceStartDateTime',
                //     render: (h, params) => {
                //         if(params.row.taskInstanceStartDateTime == -1)return h('div',"");
                //         else return h('div', new Date(params.row.taskInstanceStartDateTime).format("yyyy-MM-dd hh:mm:ss"));
                //     },
                //     sortable: true,
                // },
                {
                    title: '时限',
                    // width: 190,
                    key: 'taskInstanceDateTimeLimit',
                    render: (h, params) => {
                        if(params.row.taskInstanceDateTimeLimit!=-1){
                            var date = new Date(params.row.taskInstanceDateTimeLimit).format("yyyy-MM-dd hh:mm:ss");
                        }else{
                            date = "";
                        }
                        if(params.row.alertDeadline)return  h('div',{style: { color: 'red'}},date );
                        else return h('div',date);
                        
                        
                    },
                    sortable: true,
                },
                {
                    title: '领取人',
                    key: 'submitterName',
                    render: (h, params) => {
                        return h('div', params.row.taskInstanceStatus==1?"" : params.row.submitterName);
                    },
                    sortable: true
                }
            ]
        };
    },
    created() {
         for(var i = 1; i < this.taskColumns.length; i++){
            // this.taskColumns[i].minWidth = Math.max((this.taskColumns[i].title.length + 2) * 15, 100);
            this.taskColumns[i].tooltip = true;
            // this.taskColumns[i].ellipsis = true;
        }
        this.init();

        this.assignModal = false;
    },
    mounted() {
        let that = this;
        
    },
    computed:{
     
        taskStatus(){
            if(this.currTask != null && 'taskInstanceStatus' in this.currTask){
                return this.currTask.taskInstanceStatus;
            }else{
                return 0;
            }
        },
    },
    methods:{
        async init(){
            let that = this;
            await getUser(that.store.state.user.userId).then(res=>{ that.userDisplayName =  res.data.data.displayName;});
            that.activate();
        },
      activate(){
        this.currentPage = 1;
        // setTimeout(()=>{ this.loadTaskList();this.getTaskTotal(); }, 600);
        this.refreshTaskList();
      },
      getTaskTotal(){
        
            let that = this;
            console.log("getTaskTotal",that.store.state.user);
            let params = {
                userId : that.store.state.user.userId,
                userName : that.store.state.user.username,
                filerStatus : JSON.stringify(that.filerStatus),
                condition : "search "+that.searchInput,
            };
            console.log("params",params);
            getTaskInstCount(params).then(res=>{
                console.log("taskNumber", res.data);
                 if(res.success) that.totalNumber = res.data;
                 else that.$Message.error("加载失败");
            });
      },
        
        loadTaskList(){
            this.loading = true;
            this.clearCurrentRow();
            var that = this;
            let params = {
                userId : that.store.state.user.userId,
                userName : that.store.state.user.username,
                filerStatus : JSON.stringify(that.filerStatus),
                condition: that.condition+",search "+that.searchInput,
                pageSize : that.pageSize,
                pageIndex: that.currentPage-1,
            };
            console.log("params",params);
            getManualTaskInstances(params).then(res => {
                if(res.success){
                    let re = res.data; 
                    console.log(re);
                    /* for(var i=0;i<re.length;i++){
                        re[i].index = i;
                        re[i].taskInstanceStatus = re[i].taskInstanceStatus;
                        re[i].alertDeadline = false;
                        if(re[i].deadlineDays!=-1){
                            var dateTime = new Date(re[i].taskInstanceStartDateTime);
                            dateTime = dateTime.setDate(dateTime.getDate() + re[i].deadlineDays);
                            re[i].taskInstanceDateTimeLimit = dateTime;
                            re[i].alertDeadline = dateTime < Date.parse(new Date());
                        }
                      
                    } */
                    that.taskList = re;
                    that.loading = false;
                }    
            });
            
        },
        changePage(pageId){
            this.currentPage = pageId;
            this.refreshTaskList();
        },
        changePageSize(pageSize){
            this.pageSize = pageSize;
            this.currentPage = 1;
            this.refreshTaskList();
        },
        handleFilter(value, row){
            this.currentPage = 1;
            this.filerStatus = value;
            this.refreshTaskList();
        },
        changeSort({column, key,order}){
            // console.log('排序字段:' + key);
            // console.log('排序规则:' + order);
            // if(key == "startTime"|| key == "launchDateTime" || key == "taskInstanceEnabledDateTime"){
            //     if(order=="asc") this.allInstList.sort((a,b) => a[key] - b[key]);
            //     else this.allInstList.sort((a,b) => b[key] - a[key]);
            // }else{
            //     if(order=="asc") {
            //         this.allInstList.sort((a,b)=>{return a[key].localeCompare(b[key],"zh");});
            //     }else{
            //         this.allInstList.sort((a, b)=> {return b[key].localeCompare(a[key],"zh");});
            //     }
            // }
            // console.log("this.allInstList",this.allInstList);
            if(order=="normal"){ this.condition="";}
            else{ this.condition="order by "+key+" "+order;}
            this.currentPage = 1;
            this.refreshTaskList();
        },
        async refreshTaskList(){
            this.clearCurrentRow();
            await this.getTaskTotal();
            await this.loadTaskList();
        },
        currentChange(currentRow, oldCurrentRow){
            this.currTask = currentRow;
            console.log("this.currTask",this.currTask);
        },
        clearCurrentRow(){
            this.$refs.taskTable.clearCurrentRow();
            this.currTask = {};
        },
        
        handleSearch(){
            this.currentPage = 1;
            this.refreshTaskList();
        },
       handleDbClick(){
           this.openTaskForm();
       },
        // 领取
        async receiveTask(){
            let that = this;
            let item  = this.currTask;
            
            var proId = item.wfProcessInstanceId;
            var taskId = item.id;
            var userId = that.store.state.user.userId;
            var userDisplayName = that.userDisplayName;
            await receiveTaskInstance(proId,taskId,userId,userDisplayName).then( res=>{
                if(res.success){
                    // console.log("that.taskList.filter(x => x.id == item.id)[0]",that.taskList.filter(x => x.id == item.id)[0]);
                    that.taskList.filter(x => x.id == item.id)[0].taskInstanceStatus = 2;
                    that.taskList.filter(x => x.id == item.id)[0].taskInstanceStartDateTime = Date.parse(new Date());
                    that.$Message.success("领取成功");
                    return 1;
                }else{
                    that.$Message.success("领取失败");
                    return 0;
                }
                
            });
            
        },
        // 在流程中打开
        async openTaskForm(){
            var wfauthority = "submission";
            // 待提交
            if(this.currTask.taskInstanceStatus == 1){
                var status =  await this.receiveTask();
                if(status == 0){
                    that.$Message.success("自动领取失败");
                    return;
                }
            }
            if(this.currTask.taskInstanceStatus == 3){
                wfauthority = "assign"; //被抄送
            }

            let item = this.currTask;

            this.root.openTab({
                targetClass: item.bindEnClassName,
                authority: item.formName + "_" + item.id,
                conditionExpre: `and obj.oid='${item.enClassInstanceId}'`,
                displayName: item.name,
                viewName: item.formName,
                action: "wfprocess",
                params: "",
                wfProcessInstanceId: item.wfProcessInstanceId,
                taskId: item.id,
                wfAuthority: wfauthority,
            });
        },
        // 查看：在表单中打开但是不能编辑 priview
        // checkTask(){
        //     let item = this.currTask;

        //     this.root.openTab({
        //         targetClass: item.bindEnClassName,
        //         authority: item.formName + "_" + item.id,
        //         conditionExpre: `and obj.oid='${item.enClassInstanceId}'`,
        //         displayName: item.name,
        //         viewName: item.formName,
        //         action: "wfprocess",
        //         params: "",
        //         wfProcessInstanceId: item.wfProcessInstanceId,
        //         taskId: item.id,
        //         wfAuthority: "check",
        //     });
        // },
         openAssignModal(){
                this.assignModal = true;
                this.assignComment ="";
                this.$refs.userselector.recovery();
            },

            closeAssignMoal(){
                this.assignModal = false;
                this.$refs.userselector.recovery();
            },
            async getBindEnObjSingle(){
                let item = this.currTask;
                var obj = {};
                await getEobjSingle(item.bindEnClassName, item.enClassInstanceId).then(res=>{
                    console.log("getBindEnObjSingle ",res.data);
                    obj = res.data.data;
                });
                return obj;
            },
            onConfirmAssign(){
                var user = this.$refs.userselector.getSelected();
                 let item = this.currTask;
                console.log("onConfirmAssign user",user);
                 if(user.userId == ""){
                    this.$refs.userselector.setTip("请选择用户");
                }else{
                    let that = this;
                    
                    let param = {
                        cmd : '4',
                        proInstanceId :item.wfProcessInstanceId,
                        taskInctanceId : item.id,
                        userId : that.store.state.user.userId,
                        userDisplayName : user.displayName,
                        newUserId : user.userId,
                        comment : that.assignComment,

                    };
                    console.log("onConfirmAssign param",param);
                    sendCommand(param).then(res=>{
                        if(res.success){
                            var index = item.index;
                            that.refreshTaskList();
                            that.$Message.success("移交成功");
                            that.closeAssignMoal();
                        }else{
                            that.$Message.error("移交失败");
                        }
                    });
                   
                }
            },

        deleteInstance(){
            let item = this.currTask;
            let that = this;
            deleteProcessInstance(item.wfProcessInstanceId).then(re=>{
                if(re.success){
                    that.$Message.success("已终止实例");
                    var i=0;
                    for(;i<that.taskList.length;i++){
                        if(that.taskList[i].id == item.id){
                            that.taskList.splice(i, 1);
                            break;
                        }
                    }
                    if( that.taskList.length==0 &&  that.currentPage >1){
                        that.currentPage= that.currentPage-1 ;
                    }
                    that.refreshTaskList();
                    return 1;
                }else{
                    that.$Message.error("取消实例失败");
                    return 0;
                }
            });
           
        },
        restartTask(){
            let that = this;
            let item = this.currTask;
            let param = {
                userId: that.store.state.user.userId,
                userDisplayName: that.userDisplayName,
                proInstanceId: that.currTask.wfProcessInstanceId,
            };
            restartProcessInstance(param).then(res=>{
                if(res.success == 1){
                    for(var i=0;i<that.taskList.length;i++){
                        if(that.taskList[i].id == item.id){ 
                            that.taskList.splice(i, 1);
                            break;
                        }
                    }     
                    if( that.taskList.length==0 &&  that.currentPage >1){
                        that.currentPage= that.currentPage-1 ;
                    }
                    that.refreshTaskList();
                    that.$Message.success("已重新发起");
                    return 1;
                }else{
                    that.$Message.error("重新发起失败");
                }
            });
            // launchProcessByObjId(param).then(res=>{
            //     if(res.success == 1){
            //         deleteProcessInstance(item.wfProcessInstanceId).then(re=>{
            //             if(re.success == 1 ){
            //                 var i=0;
            //                 console.log("that.taskList",that.taskList);
            //                 for(;i<that.taskList.length;i++){
            //                     if(that.taskList[i].id == item.id){ 
            //                         that.taskList.splice(i, 1);
            //                         break;
            //                     }
            //                 }
                           
            //                 if( that.taskList.length==0 &&  that.currentPage >1){that.currentPage= that.currentPage-1 ;}
            //                 that.refreshTaskList();
            //                 that.$Message.success("已重新发起");
            //                 return 1;
            //             }else{
            //                 that.$Message.error("取消实例失败");
            //                 return 0;
            //             }
            //         });
            //     }else{
            //          that.$Message.error("发起失败");
            //     }
            // });
        },
        openSubmitModal(){
            this.submitModal = true;
            this.submitComment = "";
            this.wantAssignNext = false;
            if(this.$refs.nextuserselector) this.$refs.nextuserselector.recovery();
        },
        closeSubmitMoal(){
            this.submitModal = false;
            if(this.$refs.nextuserselector) this.$refs.nextuserselector.recovery();
        },
        onConfirmSubmit(){
            if(!this.wantAssignNext){
                this.submitTask(null); // 未指定下一步执行人
            }else{
                 var user = this.$refs.nextuserselector.getSelected();
                console.log("user",user);
                if(user.userId == "" || user.userId == null){
                    this.$refs.nextuserselector.setTip("请选择用户");
                }else{
                    this.submitTask(user); // 指定下一步执行人
                }
            }
           
        },
        async submitTask(nextUser){

            let that = this;
            let item = this.currTask;
            var userip="";
            if(nextUser!=null && nextUser.userId != ""){
                // cmd=2, userip="&&&1&&&被指派人id&&&被指派人名"
                userip = "&&&1&&&"+nextUser.userId+"&&&"+nextUser.displayName;
            }
            var obj = await this.getBindEnObjSingle();
             console.log("submitTask obj",obj);
             console.log(" that.submitComment", that.submitComment);
           let param = {
                cmd : '2',
                proInstanceId :item.wfProcessInstanceId,
                taskInctanceId : item.id,
                userId : that.store.state.user.userId,
                userDisplayName : that.userDisplayName,
                userIp : userip,
                comment : that.submitComment,
                paramValues: JSON.stringify(obj),
            };
            console.log("submitTask param",param);
            sendCommand(param).then(res=>{
                if(res.success){
                    setTimeout(()=>{
                        var i=0;
                        for(;i<that.taskList.length;i++){if(that.taskList[i].id == item.id){break;}}
                        that.taskList.splice(i, 1);
                        console.log("setTimeout");
                        that.$Message.success("提交成功");
                        that.refreshTaskList();
                    },1500);
                    that.closeSubmitMoal();
                }else{
                    that.$Message.error("移交失败");
                }
            });
            
        },

        
    },
}
</script>

<style scoped>
    .time{
        font-size: 14px;
        font-weight: bold;
    }
    .content{
        padding-left: 5px;
    }
     .ivu-card-body p{
        overflow: hidden !important;
        height: 20px !important;
    }
</style>