<template>
   <div >
       <div style="margin:10px">
           <div style="height:50px">
                <!-- <Button class="self-btn" type="primary" :disabled="currTemplate==-1" @click="checkProcess" style="margin: 5px;float:left">
                    查看
                </Button> -->
                 <Button class="self-btn" type="primary" :disabled="currTemplate==-1" @click="showInstanceModal()" style="margin: 5px;float:left">
                    查看实例
                </Button>
                <!-- <Button class="self-btn" type="primary" :disabled="currTemplate==-1" @click="launchProcess" style="margin: 5px;float:left">
                    发起流程
                </Button> -->
                <Button class="self-btn" type="error" :disabled="currTemplate==-1" @click="deleteModal=true" style="margin: 5px;float:left">
                    删除
                </Button>
                <div style="float:right;margin-top:10px;" class="self-tag">
                    排序：
                    <span style="">
                        <span style="margin-right:15px;" @click="sortByTime">
                            创建时间
                            <Icon v-show="sortOrder == 0" type="md-arrow-dropdown" />
                            <Icon v-show="sortOrder == 1" type="md-arrow-dropup" />
                            </span>
                        <span style="margin-right:15px;" @click="sortByName">
                            名称
                            <Icon v-show="sortOrder == 2" type="md-arrow-dropdown"  />
                            <Icon v-show="sortOrder == 3" type="md-arrow-dropup"  />
                        </span>
                    </span>
                    <Input  search placeholder="搜索..." @on-change="handleSearch" v-model="searchInput" style="width:180px;margin-right: 11px;"/>
                    <Button size="small" type="primary" shape="circle" icon="ios-refresh"
                        @click="loadProcessList"></Button>

                </div>


                <Modal
                    v-model="deleteModal"
                    title="删除流程模版"
                    :mask-closable="false"
                    @on-ok="deleteProcess"
                    @on-cancel="deleteModal = false">
                    <p v-if="currTemplate>-1">确定要删除流程模版：{{processList[currTemplate].name}}（{{processList[currTemplate].version}}）吗？</p>
                </Modal>
            </div>
            <div :style="{'height':getHeight,'overflow':'scroll'}">
                <span v-for="(temp,index) in processList" :key="index"  @click="clickTempate(index)">
                    <Card class="self-card" :class="{ active:currTemplate==index}" :id="'template_'+index" :bordered="false" style="width:250px;display:inline-block;margin:8px;">
                        <p slot="title" :title="temp.name+'('+temp.version+')'">{{temp.name}}（{{temp.version}}）</p>
                        <div :title="temp.releaser">创建人：{{temp.releaser}}</div>
                        <div :title="allEnClassName[temp.bindEnClassName]+'（'+temp.bindEnClassName+'）'" class="bind-class-name">
                            绑定类：{{showbindClassName(temp.bindEnClassName)}}
                        </div>
                        <div >发布时间：{{ new Date(temp.releaseDate).format("yyyy-MM-dd hh:mm:ss") }}</div>
                        <div style="margin-top: 5px">
                            <Button @click="checkProInfo(index)"  style="margin-right: 3px;" >查看详情</Button>
                            <!-- <Button @click="showInstanceModal(index)" style="margin-right: 3px;" size="small" >查看实例</Button> -->
                        <!-- <Button type="error" @click="deleteProcessModal(index)" size="small">删除</Button> -->
                        </div>

                    </Card>
                </span>
            </div>
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
                <div style="float: right;line-height: 34px;" class="self-tag"> 总共{{totalNumber}}条 </div>
            </div>
       </div>
        <Modal
            v-model="proInfoModal"
            title="流程详情"
            :mask-closable="false"
            @on-ok="proInfoModal = false"
            @on-cancel="proInfoModal = false">
            <p>流程名：{{currPro.name}}（{{currPro.version}}）</p>
            <p>id：{{currPro.id}}</p>
            <p>创建人：{{currPro.author}}</p>
            <p>发布人：{{currPro.releaser}}</p>
            <p>绑定实体类：{{allEnClassName[currPro.bindEnClassName]+'（'+currPro.bindEnClassName+'）'}}</p>
            <p>更新时间：{{ new Date(currPro.lastupdate).format("yyyy-MM-dd hh:mm:ss") }}</p>
            <p>关键字：{{currPro.keywords}}</p>
            <p>简介：</p>
            <Input type="textarea" readonly v-model="currPro.description"></Input>
        </Modal>
        <Modal v-model="instanceModal" title="流程实例" width="1200">
            <Table :columns="wfprocessInstanceCol" :data="wfprocessInstance" @on-row-click="checkProcess"  height="500" ></Table>
        </Modal>

   </div>
</template>

<script>
const name = "WfAdmin";
import $ from 'jquery';
import {getAllEntities} from "@/api/others";
// import {getRlTemplates, deleteRlTemplate,searchApplicationProcService} from "@/api/wfprocess.js"
import {getRlTemplates, deleteRlTemplate,searchApplicationProcService} from "./api/WfProcessApi"
export default {
    name: name,
    props: ["store", "root","Message"],
    data() {
        return {
            currTemplate: -1,
            processList: [],
            allProcessList: [],

            searchInput:"",
            sortOrder: 0,
            proInfoModal:false,
            currPro:"",
            allEnClassName: {},
            deleteModal: false,
            scrollHeight: 0,

            totalNumber: 0,
            pageSizeOpts:[10, 15, 25, 50],
            currentPage: 1,
            pageSize: 15,

            wfprocessInstance:[],
            instanceModal: false,
            wfprocessInstanceCol:[{
                type: 'index',
                width: 50,
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
                // filters: [{
                //         label: '运行中',
                //         value: 5
                //     },
                //     {
                //         label: '已结束',
                //         value: 8
                //     }
                // ],
                // filterMultiple: false,
                // filterRemote (value) {
                //     this.filterStatus = value;
                // },

                render: (h, params) => {
                    if(params.row.status==5)return h('div', "运行中");
                    if(params.row.status==7)return h('div', "已终止");
                    if(params.row.status==8)return h('div', "已完成");
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
        };
    },
    created() {
        this.init()
        // console.log("store:", this.store);
        // let that = this;

        // startupProcess().then(res =>{
        //     if(res.success){
        //     }else{
        //         that.$Message.error("流程引擎未启动");
        //     }
        //     that.init()
        // });
    },
    mounted() {
        this.scrollHeight = document.documentElement.scrollHeight;
        var that = this;
        window.onresize = () => {
          return (() => {
            that.scrollHeight = document.documentElement.scrollHeight;
          })()
        }
    },
    computed:{
        getHeight(){
            return this.scrollHeight-230+'px';
        },
    },

    methods:{
        globalRefresh() {
            this.init()
            // let that = this;
            // startupProcess().then(res =>{
            //     if(res.success){
            //     }else{
            //         that.$Message.error("流程引擎未启动");
            //     }
            //     that.init()
            // });
        },
        showInstanceModal(index = this.currTemplate){
            let that = this;
            var pro = this.processList[index];
            var params = {"pid":pro.id,"pn":1,"psz":30,"cond1":"","cond2":"-1","cond3":"","cond4":""};
            searchApplicationProcService(params).then(res=>{
                if(res.success){
                   that.wfprocessInstance = res.data.pageEntities;
                }
            });
            this.instanceModal = true;
        },
        async init(){
            await getAllEntities().then(res=>{
                this.allEnClassName = {};
                res.data.data.forEach(x => {
                    this.allEnClassName[x.className] = x.displayName;
                })
            });
            this.loadProcessList();
        },

        loadProcessList(){
            this.currTemplate = -1;
            this.allProcessList = [];
            var that = this;
            getRlTemplates(this.store.state.user.userId).then(res=>{
                if(res.success){
                    that.allProcessList = res.data;
                    that.allProcessList.sort((a,b) => b.releaseDate - a.releaseDate);
                    that.allProcessList.forEach(pro=>{
                        pro.bindEnClassDisplayName = pro.bindEnClassName +'（'+this.allEnClassName[pro.bindEnClassName]+'）';
                    });
                    console.log("that.allProcessList",that.allProcessList);
                    that.processList = that.allProcessList.concat();
                    console.log("that.processList",that.processList);
                    that.handleSearch();
                }
            });
        },
        handleSearch(){
            this.currentPage = 1;
            this.refresh();
        },
        refresh(){
            this.clickTempate(-1);
            if(this.searchInput!=""){
                let searchKeyword = this.searchInput.toLowerCase().trimStart().trimEnd();
                this.processList =  this.allProcessList.filter(d => {
                    return d.name.toLowerCase().indexOf(searchKeyword) > -1
                            || d.version.toLowerCase().indexOf(searchKeyword) > -1
                            || d.bindEnClassDisplayName.toLowerCase().indexOf(searchKeyword) > -1 ;
                });
            }else{
                this.processList = this.allProcessList.concat();
            }
            this.totalNumber = this.processList.length;
            this.processList = this.pagedProcessList(this.processList);
            console.log("this.processList",this.processList);
        },
        changePage(pageId){
            this.currentPage = pageId;
            this.refresh();
        },
        changePageSize(pageSize){
            this.pageSize = pageSize;
            this.currentPage = 1;
            this.handleSearch();
        },
        pagedProcessList(unpagedProcessList){
            var paged = unpagedProcessList.slice((this.currentPage-1)*this.pageSize,(this.currentPage-1)*this.pageSize+this.pageSize);
            return paged;
        },
        showbindClassName(bindEnClassName){
            var bindEnClassName = bindEnClassName;
            var displayName = this.allEnClassName[bindEnClassName];
            if(displayName == null){displayName="null";}
                if(displayName.length>5) {
                    displayName = displayName.slice(0,4)+"..";
                    bindEnClassName = bindEnClassName.slice(0,5);
                }
                var l = displayName.length + bindEnClassName.length;
                if( l > 9) {
                    bindEnClassName = bindEnClassName.slice(0,l-6)+"..";
                }
                return displayName+'（'+bindEnClassName+'）';
        },
        sortByTime(){
            if(this.sortOrder ==0 ){
                this.sortOrder = 1;
                this.allProcessList.sort((a,b) => a.releaseDate - b.releaseDate);
            }else{
                this.sortOrder = 0;
                this.allProcessList.sort((a,b) => b.releaseDate - a.releaseDate);
            }
            this.refresh();

        },
        sortByName(){
            if(this.sortOrder == 2 ){
                this.sortOrder = 3;
                this.allProcessList.sort((a,b) => b.name.localeCompare(a.name,'zh-CN'));
            }else{
                this.sortOrder = 2;
                this.allProcessList.sort((a,b) => a.name.localeCompare(b.name,'zh-CN'));
                // this.processList.sort(function(a,b){a.localeCompare(b,'zh-CN')});
            }
            this.refresh();
        },

        checkProInfo(currTemplate){
            this.currPro = this.processList[currTemplate];
            this.proInfoModal = true;
        },
        // checkProcess(){
        //     this.root.goToWfAdminEdit(this.processList[this.currTemplate].id,
        //                         this.processList[this.currTemplate].name, this.processList[this.currTemplate].bindEnClassName);
        // },
        // dbClickTempate(index){
        //     this.clickTempate(index);
        //     this.checkProcess();
        // },

        checkProcess(inst){
            this.instanceModal = false;
            //id,definitionId,pname,proName,enClassName
            let proInst  = {
                'id': inst.instanceId,
                'definitionId':inst.definitionId,
                'pname':inst.processName,
                'proName': inst.processName,
                'enClassName':inst.bindEnClassName
            }
            this.root.goToWfAdminEdit(proInst);

        },

         clickTempate(index){
            if(this.currTemplate>=0){
                // document.getElementById("template_"+this.currTemplate).style.boxShadow="";
                // document.getElementById("template_"+this.currTemplate).style.border="";
            }
            if(this.currTemplate != index && index>=0){
                this.currTemplate = index;
                // var dom = document.getElementById("template_"+this.currTemplate);
                // dom.style.boxShadow="0px 1px 6px rgba(0,0,0,.2)";
                // dom.style.border="1px solid #ababab";
            }else{
                this.currTemplate = -1;
            }

        },
        deleteProcessModal(index){
                this.$Modal.confirm({
                    title: '删除流程模版',
                    content: '<p>确定删除该流程模版吗？</p>',
                    onOk: () => {
                        this.deleteProcess(index);
                    },
                });
        },
        deleteProcess(currTemplate = this.currTemplate){
            // 删除流程模版
            var that = this;
            var pid= this.processList[currTemplate].id;
            deleteRlTemplate(pid).then(res=>{
                if(res.success){
                    that.$Message.success("删除成功");
                    that.processList.splice(that.currTemplate,1);
                    for(var i=0;i<that.allProcessList.length;i++){
                        if(that.allProcessList[i].id == pid){
                            that.allProcessList.splice(i,1);
                            break;
                        }
                    }
                    that.clickTempate(-1);
                    that.currTemplate = -1;
                    if(that.processList.length == 0 && that.currentPage > 1){
                        that.currentPage = that.currentPage-1;
                    }
                    that.refresh();
                }else{
                    that.$Message.error(res.message || "删除失败");
                }
            });
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
    .self-card.active{
        box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 6px;
        border: 1px solid rgb(171, 171, 171);
    }
    .bind-class-name{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
</style>
