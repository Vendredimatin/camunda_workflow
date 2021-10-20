<template>
   <div >
       <div style="margin:10px">
           <div style="height:50px;margin-right:25px;">
                <!-- <Button type="primary" :disabled="currTemplate==-1" @click="checkProcess" style="margin: 5px;float:left">
                    查看流程实例
                </Button> -->
                <Button class="self-btn" type="primary" :disabled="currTemplate==-1" @click="getLaunchForm" style="margin: 5px;float:left">
                    发起流程
                </Button>

                <Button class="self-btn" style="float: right; margin-top: 11px;" size="small" type="primary" shape="circle" icon="ios-refresh" 
                        @click="loadProcessList"></Button>

                <Input search placeholder="搜索" @on-change="handleSearch" v-model="searchInput" style="width: auto;margin: 6px 6px 0px 0px;float:right;"/>

                <span style="float:right;margin-top:13px;" class="self-tag">
                    排序：
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
                
            </div>
            <div :style="{'height':getHeight,'overflow':'scroll'}">
                <span v-for="(temp,index) in processList" :key="index" @click="clickTempate(index)" >
                    <Card class="self-card" :class="{ active:currTemplate==index}" :id="'template_'+index" @click="clickTempate(index)" :bordered="false" style="width:280px;display:inline-block;margin:8px;">
                        <p slot="title" :title="temp.name+'（'+temp.version+'）'">{{temp.name}}（{{temp.version}}）</p>
                        <div>发布人：{{temp.releaser}}</div>
                        <div :title="allEnClassName[temp.bindEnClassName]+'（'+temp.bindEnClassName+'）'" class="bind-class-name">绑定实体类：{{showbindClassName(temp.bindEnClassName)}}</div>
                        <div >更新时间：{{ new Date(temp.lastupdate).format("yyyy-MM-dd hh:mm:ss") }}</div>
                        <Button @click="checkProInfo(index)" style="margin-top:5px;" class="self-btn">查看详情</Button>
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
            :mask-closable="false">
                <p>流程名：{{currPro.name}}（{{currPro.version}}）</p>
                <p>id：{{currPro.id}}</p>
                <p>创建人：{{currPro.author}}</p>
                <p>发布人：{{currPro.releaser}}</p>
                <p>绑定实体类：{{allEnClassName[currPro.bindEnClassName]+'（'+currPro.bindEnClassName+'）'}}</p>
                <p>更新时间：{{ new Date(currPro.lastupdate).format("yyyy-MM-dd hh:mm:ss") }}</p>
                <p>关键字：{{currPro.keywords}}</p>
                <p>简介：</p>
                <Input type="textarea" readonly v-model="currPro.description"></Input>
                <div slot="footer">
                    <Button class="self-btn" type="primary" size="large" @click="proInfoModal = false">确认</Button>
                </div>

        </Modal>
   </div>
</template>

<script>
const name = "wf-admin";
import $ from 'jquery';
import {getAllClassNamesMin} from "@/api/data-model/EntityModeling"
import {getUser,getAllEntities} from "@/api/others";
// import {getRlTemplates,getLaunchForm,launchProcessByNewObj} from "@/api/wfprocess";
import {getRlTemplates,getLaunchForm,launchProcessByNewObj} from "./api/WfProcessApi";

export default {
    props: ["store","root"],
    data() {
        return {
            allEnClassName:[],
            currTemplate: -1,
            processList: [],
            allProcessList: [],
            searchInput:"",
            sortOrder: 0,
            proInfoModal:false,
            currPro:"",
            scrollHeight: 0,

            totalNumber: 0,
            pageSizeOpts:[10, 15, 25],
            currentPage: 1,
            pageSize: 15,
           
        };
    },
    created() {
        console.log("store:", this.store);
        this.init();
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
            return this.scrollHeight-200+'px';
        }
    },
    methods:{
        
        async init(){
            var that = this;
            // console.log("user",this.store.state.user);
            await getUser(this.store.state.user.userId).then(
                res=>{ that.userDisplayName =  res.data.data.displayName;
            });
           await getAllEntities().then(res=>{
                res.data.data.forEach(x => {
                    if(x.classCategory!="ExternalItemClass") 
                    this.allEnClassName[x.className] = x.displayName;
                })
            });
            this.loadProcessList();
        },
        loadProcessList(){
            this.currTemplate = -1;
            this.allProcessList = [];
            var that = this;
            getRlTemplates().then( res =>{
                console.log("loadProcessList", res);
                if(res.success){
                    that.allProcessList = res.data;
                    that.allProcessList.sort((a,b) => b.releaseDate - a.releaseDate);
                    that.processList = that.allProcessList.concat();
                    // console.log("that.processList",that.processList);
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
                this.processList =  this.allProcessList.filter(d => {
                    return (d.name.indexOf(this.searchInput) > -1) 
                            || (d.version.indexOf(this.searchInput) > -1);
                });
            }else{
                this.processList = this.allProcessList.concat();
            }
            
            this.totalNumber = this.processList.length;
            this.processList = this.pagedProcessList(this.processList);
            // console.log("this.processList",this.processList);
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
            if(displayName==null){displayName="null";}
            if( displayName.length>5) {
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
                this.processList.sort((a,b) => a.lastupdate - b.lastupdate);
            }else{
                this.sortOrder = 0;
                this.processList.sort((a,b) => b.lastupdate - a.lastupdate);
            }
           
        },
        sortByName(){
            if(this.sortOrder == 2 ){
                this.sortOrder = 3;
                this.processList.sort((a,b) => b.name.localeCompare(a.name,'zh-CN'));
                // this.processList.sort(function(a,b){b.localeCompare(a,'zh-CN')});
            }else{
                this.sortOrder = 2;
                this.processList.sort((a,b) => a.name.localeCompare(b.name,'zh-CN'));
                // this.processList.sort(function(a,b){a.localeCompare(b,'zh-CN')});
            }
        },
        
       
        checkProInfo(currTemplate){
            this.currPro = this.processList[currTemplate];
            this.proInfoModal = true;
        },
        checkProcess(){
            var proId = this.processList[this.currTemplate].id;
            var proName = this.processList[this.currTemplate].name;
            var bindEnClassName = this.processList[this.currTemplate].bindEnClassName;
            this.root.goToWfAdminEdit(proId, proName, bindEnClassName);
        },
        clickTempate(index){

            if(this.currTemplate>=0){
                // document.getElementById("template_"+this.currTemplate).style.boxShadow="";
                // document.getElementById("template_"+this.currTemplate).style.border="";
            }
            if(this.currTemplate != index){
                this.currTemplate = index;
            }else{
                this.currTemplate = -1;
            }
        },
        getLaunchForm(){
            var that = this;
            var item = that.processList[that.currTemplate];
            console.log(item.id);
            that.launchProcess();
            /* getLaunchForm(item.id).then(res =>{
                console.log(res);
                if(res.success){
                    let re = JSON.parse(res.data);
                    if(re.formName!=null && re.formName!=""){
                       // 绑定了初始表单，先打开初始表单
                        that.root.openTab({
                            targetClass: item.bindEnClassName,
                            authority: "launch_" + "_" + item.id,
                            conditionExpre: `and obj.oid=""`,
                            displayName: item.name,
                            viewName: re.formName,
                            action: "launchForm",
                            params: "",
                            wfProcessInstanceId: item.id,// 流程模版id
                        });
                   }else{
                        that.launchProcess();
                   }
                }else{
                    that.$Message.error("发起失败");
                }
                   
            }); */
        },

        launchProcess(){
            var that = this;
            var templateId= that.processList[that.currTemplate].id;
            var userId = that.store.state.user.userId;
            var userDisplayName = that.userDisplayName;
        
           const config = {headers: {'Authorization': this.store.state.user.token}};
           let param = {
                templateId:that.processList[that.currTemplate].id,
                userId: that.store.state.user.userId,
                userDisplayName: that.userDisplayName,
                bindEnClassName: that.processList[that.currTemplate].bindEnClassName,
            };
            launchProcessByNewObj(param,config).then(res=>{
                   if(res.success == 1){
                        that.$Message.success("发起成功");
                   }else if(res.message){
                        that.$Message.error(res.message);
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
