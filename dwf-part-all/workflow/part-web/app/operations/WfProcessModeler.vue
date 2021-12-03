<template>
    <div >
        <div style="margin:10px;">
            <div style="height:50px;" >
                <Button class="self-btn" type="primary" :disabled="currTemplate==-1" @click="openProcess" style="margin: 5px;float:left">
                    查看
                </Button>
                <Button class="self-btn" type="error" :disabled="currTemplate==-1" @click="deleteModal=true" style="margin: 5px;float:left">
                    删除
                </Button>
               
                <Button class="self-btn" type="primary" @click="createProcessModel" style="margin: 5px;float:left">
                    新建
                </Button>
                
                <div style="float:right; margin-top:10px;" class="self-tag">
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
                    <Input  search placeholder="搜索..." style="width:180px;margin-right: 11px;" @on-change="handleSearch" v-model="searchInput" />
                    <Button style="" size="small" type="primary" shape="circle" icon="ios-refresh" 
                        @click="loadProcessList"></Button>
                    
                </div>
                

                 <Modal
                    v-model="deleteModal"
                    title="删除流程模版"
                    :mask-closable="false"
                    @on-ok="deleteProcess"
                    @on-cancel="deleteModal = false">
                    <p v-if="currTemplate>-1">确定要删除流程模版：{{processList[currTemplate].name}}吗？</p>
                </Modal>
                 <Modal v-model="createModal" title="新建流程" :mask-closable="false">
                    <Form ref="createForm" :model="newProcessData" :rules="processRule">
                         <FormItem prop="name">
                            流程名称：&nbsp;&nbsp;&nbsp;&nbsp;<Input type="text" v-model="newProcessData.name" placeholder="请输入流程名" style="width:70%"></Input>
                        </FormItem>
                        <FormItem prop="className">
                            绑定实体类：
                                <Select ref="createFormClassSelect" v-model="newProcessData.className" filterable style="width:340px;">
                                    <OptionGroup label="实体类">
                                        <Option v-for="(value, key) in allEnClassName" :value="key" :key="key" :label="value" style="width:340px">
                                            <span>{{ value }}</span>
                                            <span style="float:right;color:#ccc;">{{ key }}</span>
                                        </Option>
                                    </OptionGroup>
                                </Select>
                        </FormItem>
                    </Form>
                     <div slot="footer">
                        <Button type="text" size="large" @click="closeCreateModal">取消</Button>
                        <Button type="primary" size="large" @click="onConfirmCreate">确认</Button>
                    </div>
                </Modal>
                <Button class="self-btn" type="primary" :disabled="currTemplate==-1" @click="releaseProcessModel" style="margin: 5px;float:left">
                    发布
                </Button>
                <Modal v-model="releaseModal" title="发布流程" :mask-closable="false">
                    <p v-if="currTemplate>-1">发布流程{{processList[currTemplate].name}}</p><br/>
                    <Form ref="releaseForm" :model="releaseData" :rules="releaseRule">
                        <FormItem prop="version">
                            发布版本：
                            <Input type="text" v-model="releaseData.version" placeholder="请输入版本号" style="width:70%"/>
                        </FormItem>
                        <FormItem prop="versionnote">
                            发布声明：
                            <Input type="textarea" v-model="releaseData.versionnote" placeholder="请输入发布说明" style="width:70%"/>
                        </FormItem>
                    </Form>
                     <div slot="footer">
                        <Button type="text" size="large" @click="releaseModal = false">取消</Button>
                        <Button type="primary" size="large" @click="onConfirmRelease">确认</Button>
                    </div>
                </Modal>
            </div>
            
            <div :style="{'height':getHeight,'overflow':'scroll'}">
                <span v-for="(pro,index) in processList" :key="index" @click="clickTempate(index)" @dblclick="dbClickTempate(index)" >
                    <Card  class="self-card" :class="{ active:currTemplate==index}" :id="'template_'+index" :bordered="false" style="width:250px;display:inline-block;margin:8px;">
                        <p slot="title" :title="pro.name">{{pro.name}}</p>
                        <div>创建人：{{pro.author}}</div>
                        <div :title="allEnClassName[pro.className]+'（'+pro.className+'）'" class="bind-class-name">
                            绑定类：{{showBindClassName(pro.className)}}
                        </div>
                        <div >更新时间：{{ new Date(pro.lastUpdate).format("yyyy-MM-dd hh:mm:ss") }}</div>
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
   </div>
</template>

<script>
const name = "WfModel";
import $ from 'jquery'
import {getAllEntities, getAllRelations} from "@/api/others"
// import {getTemplates, createTemplate, deleteTemplate, releaseTemplate} from "@/api/wfprocess"
import {getTemplates, createTemplate, deleteTemplate, releaseTemplate} from "./api/WfProcessApi"

export default {
    name: name,
    props: ["store", "root", "Message"],
    data() {
        return {
            currTemplate: -1,
            scrollHeight: 0,
            allEnClassName:[],
            allRelationName:[],
            deleteModal: false,
            createModal: false,

            processList: [],
            allProcessList: [],
            searchInput:"",
            sortOrder: 0,
            
            newProcessData:{
                name:"",
                className:"",
            },
            releaseModal: false,
            releaseData:{
                version:"",//发布版本
                versionnote:"",//发布声明
            },
            releaseRule: {
                version: [
                    { required: true, message: "版本不能为空", trigger: "blur" },
                    {
                        pattern: /^[a-zA-Z0-9_\-/.\u0391-\uFFE5]+$/,
                        message: "版本名只能包含汉字、字母、数字、_、-、/或.",
                        trigger: "blur"
                    },{
                        max:32,
                        message: "版本名不能超过32个字符",
                        trigger: "blur"
                    },

                ]
            },
           
            processRule: {
                name: [
                    { required: true, message: "流程名不能为空", trigger: "blur" },
                    {
                        pattern: /^[a-zA-Z0-9_\-/.\u0391-\uFFE5]+$/,
                        message: "流程名只能包含汉字、字母、数字、_、-、/或.",
                        trigger: "blur"
                    },{
                        max:32,
                        message: "流程名不能超过32个字符",
                        trigger: "blur"
                    },
                ],
                className: [
                    { required: true, message: "绑定实体类不能为空", trigger: "blur" }
                ],
            },
            
            totalNumber: 0,
            pageSizeOpts:[15, 25, 50, 100, 200, 500],
            currentPage: 1,
            pageSize: 15,
        };
    },
    created() {
        this.init();
        // let that = this;
        // startupProcess().then(res =>{
        //     if(res.success){
        //     }else{
        //         that.$Message.error("流程引擎未启动");
        //     }
        //     that.init();
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
            this.init();
            // let that = this;
            // startupProcess().then(res =>{
            //     if(res.success){
            //     }else{
            //         that.$Message.error("流程引擎未启动");
            //     }
            //     that.init();
            // });
        },
        async init(){
            this.allEnClassName = {};
            this.allRelationName = {};
            await getAllEntities().then(res=>{
                res.data.data.forEach(x => {
                    if(x.classCategory!="ExternalItemClass")
                        this.allEnClassName[x.className] = x.displayName;
                })
            });
            await getAllRelations().then(res=>{
                res.data.data.forEach(x => {
                    this.allRelationName[x.className] = x.displayName;
                })
            })
            console.log("async init()",this.allEnClassName);
            this.loadProcessList();
        },
        loadProcessList(){
            this.currTemplate = -1;
            this.allProcessList = [];
            var that = this;
            getTemplates(this.store.state.user.userId).then( res =>{
                console.log("loadProcessList res",res);
                that.allProcessList = res.data;
                that.allProcessList.sort((a,b) => b.lastUpdate - a.lastUpdate);
                that.allProcessList.forEach(pro=>{
                    pro.bindEnClassDisplayName = pro.className +'（'+this.allEnClassName[pro.className];+'）';
                });
                that.processList = that.allProcessList.concat();
                that.handleSearch();
            });
        },
      

        showBindClassName(className){
            var className = className;
            var displayName = this.allEnClassName[className];
            if(displayName==null){displayName="null";}
            if( displayName.length>5) {
                displayName = displayName.slice(0,4)+"..";
                className = className.slice(0,5);
            }
            var l = displayName.length + className.length;
            if( l > 9) {
                className = className.slice(0,l-6)+"..";
            }
            return displayName+'（'+className+'）';
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
       
        sortByTime(){
            if(this.sortOrder ==0 ){
                this.sortOrder = 1;
                this.allProcessList.sort((a,b) => a.lastUpdate - b.lastUpdate);
            }else{
                this.sortOrder = 0;
                this.allProcessList.sort((a,b) => b.lastUpdate - a.lastUpdate);
            }
            this.refresh();
           
        },
        sortByName(){
            console.log("this.processList",this.processList);
            if(this.sortOrder == 2 ){
                this.sortOrder = 3;
                this.allProcessList.sort((a,b) => b.name.localeCompare(a.name,'zh-CN'));
            }else{
                this.sortOrder = 2;
                this.allProcessList.sort((a,b) => a.name.localeCompare(b.name,'zh-CN'));
            }
            this.refresh();
        },
        
        deleteProcess(){
            var that = this;
            var proId = this.processList[this.currTemplate].id;
            var templateIds =[proId]; 
            deleteTemplate(templateIds).then(res=>{
                console.log("deleteProcess res",res);
                if(res.success){
                    that.$Message.success("删除成功");
                    that.processList.splice(that.currTemplate,1);
                    for(var i = 0;i<that.allProcessList.length;i++){
                        if(that.allProcessList[i].id==proId){
                            // console.log("that.allProcessList[i]",that.allProcessList[i]);
                            that.allProcessList.splice(i,1);
                            break;
                        }
                    }
                    document.getElementById("template_"+that.currTemplate).style.boxShadow="";
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
        },
      
        releaseProcessModel(){
            if(this.$refs["releaseForm"]){
                this.$refs["releaseForm"].resetFields();
            }
            this.releaseData = {
                version:"",//发布版本
                versionnote:"",//发布声明
            }
            this.releaseModal = true;
        },

        onConfirmRelease(){
            this.$refs["releaseForm"].validate(valid=>{
                if(valid){
                    this.releaseProcess();
                } else {
                    this.$Message.error("请检查输入是否正确");
                }
            });
        },
        releaseProcess(){
            var that = this;
            var processDefinitionId = that.processList[that.currTemplate].id;
            console.log(processDefinitionId);
            releaseTemplate(processDefinitionId).then(res => {
                console.log("res",res);
                if(res.success){
                    that.$Message.success("发布成功");
                    that.releaseModal = false;
                }else{
                    that.$Message.error(res.message || "发布失败，该版本已存在");
                }
            });
        },

        createProcessModel(){
            if(this.$refs["createForm"]){
                this.$refs["createForm"].resetFields();
            }
            this.$refs["createFormClassSelect"].query = "";
            this.createModal = true;
        },
        closeCreateModal(){
            this.createModal = false;
        },
        onConfirmCreate(){
            this.$refs["createForm"].validate(valid => {
                if (valid ) {
                    this.createProcess();
                } else {
                    this.$Message.error("请检查输入是否正确");
                }
            });
        },
        createProcess(){
            var that = this;
            var params = {
                name: this.newProcessData.name,
                author: this.store.state.user.username,
                authorId: this.store.state.user.userId,
                className: this.newProcessData.className,
                classDisplayName: this.allEnClassName[this.newProcessData.className],
                lastUpdate : new Date().getTime(),
            }
            console.log("template",params);
            createTemplate(params).then(res =>{
                console.log("res",res);
                if(res.success){
                    that.$Message.success("新建成功");
                    that.createModal = false;
                    
                    that.root.goToWfEdit(res.data, that.newProcessData.name);
                }else{
                    that.$Message.error(res.message || "新建失败");
                }
            });
        },

        // 打开一个流程
        openProcess(){
            var proId = this.processList[this.currTemplate].id;
            var proName = this.processList[this.currTemplate].name;
            this.root.goToWfEdit(proId,proName);
            // this.root.goToBpmnEdit(proId,proName);
            
        },
        dbClickTempate(index){
          
            this.clickTempate(index);
            this.openProcess();
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
