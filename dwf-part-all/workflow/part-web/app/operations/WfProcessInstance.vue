<template>
   <div>
       <div style="margin:10px">
           <div style="height:50px">
                <Button class="self-btn" type="primary" :disabled="disableButton" @click="checkInstance" style="margin: 5px;float:left">
                    查看
                </Button>
                <Button class="self-btn" type="primary" :disabled="openFormButton" @click="openForm" style="margin: 5px;float:left">
                    打开表单
                </Button>
                <Button class="self-btn" type="primary" :disabled="disableButton" @click="commentDrawer = !commentDrawer" style="margin: 5px;float:left">
                    审批历史
                </Button>

                <Button class="self-btn" style="float: right; margin-top: 11px;" size="small" type="primary" shape="circle" icon="ios-refresh" 
                        @click="activate"></Button>
                <Input search placeholder="搜索" @on-change="handleSearch" v-model="searchInput" style="width: auto;margin: 5px;float:right;"/>
                <Button class="self-btn" type="error" :disabled="deleteButton " @click="deleteInstMadel = true" style="margin: 5px;float:right">
                    终止
                </Button>
            </div>
             <Modal
                v-model="deleteInstMadel"
                title="终止流程实例"
                @on-ok="deleteInstance"
                @on-cancel="deleteInstMadel = false">
                <p>确定要终止流程实例吗？</p>
                <div slot="footer">
                    <Button class="self-btn" type="text" @click="deleteInstMadel = false">取消</Button>
                    <Button class="self-btn" type="primary" @click="deleteInstance">确定</Button>
                </div>
            </Modal>
            <Table 
                ref="instTable" borde highlight-row
                :loading="loading" 
                :columns="proInstColumns" 
                :data="proInstList"
                @on-current-change="currentChange"  
                @on-sort-change='changeSort'
                @on-filter-change='changeFilter'
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
        <wf-process-comments 
            @on-close="closeComments()" :show="commentDrawer"
            :pid="currInstId" tid=""
            :editable = "false"
            :status="currInstStatus"
            :uid="store.state.user.userId" :uname="store.state.user.username"
        >
        </wf-process-comments>

   </div>
</template>

<script>
const name = "wf-admin";
import $ from 'jquery';
import {getAllClassNamesMin} from "@/api/data-model/EntityModeling"
// import {getProcessInstances,getProInstCount, deleteProcessInstance} from "@/api/wfprocess"
import {getProcessInstances,getProInstCount, deleteProcessInstance} from "./api/WfProcessApi"
import WfProcessComments from "@/views/workflow/sub_components/WfProcessComments"
export default {
    props: ["store","root"],
    components:{ WfProcessComments},
    data() {
        let that = this;
        return {
            allEnClassName:[],
            currTemplate: -1,
            currInst: {},
            currInstId: -1,
            currInstStatus: -1,
            commentDrawer: false,

            allInstList: [],
            proInstList: [],
            histProInstList:[],
            unSearchList:[],
            searchInput:"",
            currPro:"",
            deleteInstMadel: false,
            loading: true,
            pageSizeOpts:[1, 2, 5, 10, 50, 100, 500],
            currentPage: 1,
            pageSize: 10,
            filterStatus: 0,
            totalNumber: 0,
            condition:"order by startTime desc",
            proInstColumns:[{
                type: 'index',
                width: 80,
                align: 'center'
            },{
                title: '流程名',
                key: 'processName',
                sortable: true,
                sortMethod:function(a,b,type){}
            },{
                title: '版本号',
                key: 'processVersion',
                sortable: true,
                sortMethod:function(a,b,type){}
            },{
                title: '流程状态',
                key: 'status',
                filters: [{
                        label: '运行中',
                        value: 5
                    },{
                        label: '已结束',
                        value: 8
                    }
                ],
                filterMultiple: false,
                filterRemote (value) {
                    this.filterStatus = value;
                },
            
                render: (h, params) => {
                    return h('div', this.processStatusType[params.row.status]);
                    // if(params.row.status==4)return h('div', "已发起");
                    // if(params.row.status==5)return h('div', "运行中");
                    // if(params.row.status==7)return h('div', "已终止");
                    // if(params.row.status==8)return h('div', "已完成");
                },
            },{
                title:'流程实例Id',
                key:'instanceId',
                 render: (h, params) => {
                        return h('div',[
                            h('Tooltip',{props: {
                                content: params.row.instanceId,
                                "max-width":"300",
                                'placement':'top',
                            }},'0..'+params.row.instanceId.substr(-5))])
                    },
            },{
                title: '绑定实体类id',
                key: 'enClassInstanceId',
            },{
                title: '发起人',
                key: 'launcher',
                sortable: true,
            },{
                title: '开始时间',
                key: 'startTime',
                render: (h, params) => {
                    if(params.row.startTime != -1)
                        return h('div', new Date(params.row.startTime).format("yyyy-MM-dd hh:mm:ss"));
                    else return h('div', "");
                },
                sortable: true,
                sortType: "desc",
            },{
                title: '结束时间',
                key: 'startTime',
                render: (h, params) => {
                    if(params.row.status != 5 && params.row.suspensionTime != -1){ 
                        return h('div', new Date(params.row.suspensionTime).format("yyyy-MM-dd hh:mm:ss"));
                    }else{
                        return h('div', "");
                    }
                },
                sortable: true,
            },
            ],
            processStatusType: {
                0: "默认",
                1: "未锁定",
                2: "锁定",
                3: "版本",
                4: "已发起",
                5: "运行中",
                6: "暂停",
                7: "已终止",
                8: "已完成",
            }
        };
    },
    created() {
       
        this.init();
        // let that = this;
        // startupProcess().then(res =>{
        //     if(res.success){
        //         that.init();
        //     }else{
        //     }
        // });
       
    },
    mounted() {
        
    },
    computed:{
        currPid(){
            return this.currInst!=null && 'id' in this.currInst?this.currInst.id:'';
        },
        disableButton(){
            if( this.currInst!=null && 'instanceId' in this.currInst &&this.currInst.instanceId!=-1){
                return false;
            }else {
                return true;
            }
        },
        deleteButton(){
            if( this.currInst!=null && 'status' in this.currInst && this.currInst.status==5){
                return false;
            }else {
                return true;
            }
        },
        openFormButton(){
            if( this.currInst!=null && 'endFormName' in this.currInst &&this.currInst.endFormName!=""){
                return false;
            }else {
                return true;
            }
        },
        getStatusType(){
            if(this.filterStatus==5){
                return "running";
            }else if(this.filterStatus==8){
                return "completed";
            }else if(this.filterStatus==0){
                return "all";
            }
        }
    },
    methods:{

        activate(){
            setTimeout(()=>{this.loadProInstList();this.getProTotal();},600);
        },

        async init(){
            var that = this;
            await getAllClassNamesMin().then(res=>{
                that.allEnClassName = res.data;
            });
            this.loadProInstList();
            this.getProTotal();
        },

        loadProInstList(){
            this.loading = true;
            this.proInstList = [];
            this.clearCurrentRow();
            var that = this;
            let params = {
                userId : that.store.state.user.userId, 
                statusType : that.getStatusType,
                pageSize : that.pageSize,
                pageIndex:that.currentPage-1,
                condition : that.condition+",search "+that.searchInput,
            };
            getProcessInstances(params).then(res => {
                if(res.success){
                    that.proInstList = res.data; 
                    that.proInstList.forEach(pro => {
                        pro.statusType = this.processStatusType[pro.status];
                    });
                    that.loading = false;
                }else{
                    that.$Message.error("加载失败");
                } 
            });
        },

        getProTotal(){
            let that = this;
             let params = {
                userId : that.store.state.user.userId, 
                statusType : that.getStatusType,
                condition : "search "+that.searchInput,
            };
            getProInstCount(params).then(res => {
                if(res.success){
                    that.totalNumber = res.data;
                }else{
                    that.$Message.error("加载失败");
                }
            });
           
        },
        changePage(pageId){
            console.log("pageId",pageId);
            this.currentPage = pageId;
            console.log("changePage this.currentPage",this.currentPage);
            this.refreshInstList();
        },
        changePageSize(pageSize){
            this.pageSize = pageSize;
            this.currentPage = 1;
            this.refreshInstList();
        },
        changeSort({column, key,order}){
            // console.log('排序字段:' + key);
            // console.log('排序规则:' + order);
            // if(key == "startTime"){
            //     if(order=="asc") this.allInstList.sort((a,b) => a[key] - b[key]);
            //     else this.allInstList.sort((a,b) => b[key] - a[key]);
            // }else{
            //     if(order=="asc") {
            //         this.allInstList.sort((a,b)=>{
            //             return a[key].localeCompare(b[key],"zh");
            //         });
            //     }else{
            //         this.allInstList.sort((a, b)=> {
            //             return b[key].localeCompare(a[key],"zh");
            //         });
            //     }
            // }
            if(order=="normal") this.condition="";
            else{
                this.condition="order by "+key+" "+order;
                console.log("condition",this.condition);
            }
            this.refreshInstList();
        },
       
        

        changeFilter(){
            console.log("this.filterStatus",this.filterStatus);
            this.currentPage = 1;
            this.searchInput = "";
            this.clearCurrentRow();
            this.loadProInstList();
            this.getProTotal();
        },
       
        async refreshInstList(){
            this.clearCurrentRow();
            // if(this.currentPage>Math.ceil(this.allInstList.length/this.pageSize) && this.currentPage>1){this.currentPage=this.currentPage-1;}

            await this.loadProInstList();
            await this.getProTotal();
            // this.proInstList = this.allInstList.slice(this.pageSize*(this.currentPage-1),this.pageSize*(this.currentPage-1)+this.pageSize);

            // console.log("this.currentPage",this.currentPage);
        },
        clearCurrentRow(){
            this.currTask = {};
            this.$refs.instTable.clearCurrentRow();
        },
        currentChange(currentRow, oldCurrentRow){
            this.currInst = currentRow;
            this.currInstId =  this.currInst!=null && 'instanceId' in this.currInst?this.currInst.instanceId:-1;
            this.currInstStatus = this.currInst!=null && 'status' in this.currInst?this.currInst.status:-1;
        },
        handleSearch(){
            this.currentPage = 1;
            this.refreshInstList();
        },
        handleDbClick(row,index){
            if( this.currInst!=null && 'endFormName' in this.currInst &&this.currInst.endFormName!=""){
                this.openForm();
            }
        },
        openForm(){
            let item = this.currInst;
            this.root.openTab({
                targetClass: item.bindEnClassName,
                authority: item.endFormName + "_" + item.definitionId,
                conditionExpre: `and obj.oid='${item.enClassInstanceId}'`,
                displayName: item.endFormName+ "_" + item.definitionId,
                viewName: item.endFormName,
                action: "wfprocess",
                params: "",
                wfProcessInstanceId: item.instanceId,
                taskId: "",
                wfAuthority: item.status==5?"instance":"history",
            });
        },
        checkInstance(){
            var instId = this.currInst.instanceId;
            // var proId = this.currInst.definitionId;

            var proName = this.currInst.processName;
            var bindEnClassName = this.currInst.bindEnClassName;
            var params = {
              'id':this.currInst.instanceId, 
                'definitionId':this.currInst.definitionId,
                'pname':this.currInst.processName, 
                'proName':this.currInst.processName, 
                'enClassName':this.currInst.bindEnClassName
            };
            this.root.goToWfAdminEdit(params);
        },

        // checkProcess(){
        //     var inst=this.currInst;
        //     this.instanceModal = false;
        //     //id,definitionId,pname,proName,enClassName
        //     console.log('checkProcess inst',inst);
        //     var domJq = $('.wf-admin-edit-remote-JS');
        //       console.log('domJq',domJq);
        //     var params = {'id':inst.instanceId, 
        //         'definitionId':inst.definitionId,
        //         'pname':inst.processName, 
        //         'proName':inst.processName, 
        //         'enClassName':inst.bindEnClassName}

        //     this.root.goToWfAdminEdit(params);

        // },
        deleteInstance(){
            let item = this.currInst;
            console.log("item",item);
            let that = this;

            deleteProcessInstance(item.instanceId).then(re=>{
                if(re.success == 1 ){
                    that.$Message.success("已取消实例");

                    if(that.proInstList.length==1 && that.currentPage>1){ that.currentPage = that.currentPage-1;}
                    that.refreshInstList();
                }else{
                    that.$Message.error("取消实例失败");
                }
                that.deleteInstMadel = false;
            });
           
        },
         closeComments(){
                this.commentDrawer = false ;
        }
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
