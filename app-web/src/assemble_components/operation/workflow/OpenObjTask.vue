<template>
    <section>
         <Modal
            v-model="taskModal"
            title="选择要打开的任务"
            width="1040">
             <Table ref="currentRowTable" 
             border
             height="300"
             :columns="proTempsCol" 
             :data="proTemps" 
             @on-current-change="changeCol" 
             @on-row-dblclick='openTaskForm'
             ></Table>  
           
            <div slot="footer">
                <Button class="self-btn" type="text" size="large" @click="taskModal = false">取消</Button>
                <Button class="self-btn" type="primary" :disabled="openDisabled" size="large" @click="openTaskForm">打开</Button>
            </div>
        </Modal>
         <Button class="self-btn" :type="args.type" :shape="args.shape ? 'circle' : null" :icon="args.icon" 
            :style="{'color': args.main_fontColor, 'width': arg_width, 'height': arg_height}" 
            :disabled="args.disabled" @click="clickButton">{{args.text}}</Button> 
    </section>
</template>

<script>
import { mapGetters} from "vuex";
import $ from 'jquery'
import {getEobjSingle, getUser} from "@/api/others";
// import {getRunningManualTaskByObj,receiveTaskInstance} from "@/api/wfprocess";
import {getRunningManualTaskByObj,receiveTaskInstance} from "./api/WfProcessApi";
const name = "OpenObjTask";
export default {
    name: name,
    props: ['itemValue','root', 'store', 'Message'],
    data() {
        return {
            userDisplayName:"",
            proTemps: [],
            name: name,
            taskModal: false,
            // itemValue: {},
            args: {
                type: "default",
                shape: false,
                text: "打开流程",
            },
            currTask: {},

            selected: null,
            targetClass: null,
            currentId:"",
            enInstanceId: null,
            currenProcess: null,
            selectedTemp: null,

            proTempsCol:[
                    {
                        type: 'index',
                        width: 60,
                        align: 'center'
                    },{
                    title: '状态',
                    key: 'taskInstanceStatus',
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
                },{
                    title:'实例Id',
                    key:'wfProcessInstanceId',
                    width: '150',
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
                    title: '绑定表单',
                    key: 'formName',
                },{
                    title: '发起人',
                    // width: 130,
                    key: 'launchUserName',
                    sortable: true
                },{
                    title: '任务激活时间',
                    // width: 190,
                    key: 'taskInstanceEnabledDateTime',
                    render: (h, params) => {
                            return h('div', new Date(params.row.taskInstanceEnabledDateTime).format("yyyy-MM-dd hh:mm:ss"));
                    },
                    sortable: true,
                    sortType: "desc",
                },{
                    title: '任务领取时间',
                    // width: 190,
                    key: 'taskInstanceStartDateTime',
                    render: (h, params) => {
                        if(params.row.taskInstanceStartDateTime == -1)return h('div',"");
                        else return h('div', new Date(params.row.taskInstanceStartDateTime).format("yyyy-MM-dd hh:mm:ss"));
                    },
                    sortable: true,
                },{
                    title: '领取人',
                    // width: 100,
                    key: 'submitterName',
                    render: (h, params) => {
                        return h('div', params.row.taskInstanceStatus==1?"":params.row.submitterName);
                    },
                    sortable: true
                }
            ],
        }
    },
    created() {
        this.$store = this.store;
        this.init();
    },
    computed: {
      arg_width() {
        return this.args.width == "auto" ? 'auto' : this.args.width + this.args.widthType ;
      },
      arg_height() {
        return this.args.height + this.args.heightType;
      },
      openDisabled(){
          if(this.enInstanceId == null || this.proTemps.length == 0)
          return true;
      },
      
      // 使用对象展开运算符将此对象混入到外部对象中
      ...mapGetters("DWF_form", [
        "EntitySingle", "RelationSingle",
      ]),
    },
    methods: {
        async init(){
            let that = this;
            await getUser(that.store.state.user.userId).then(res=>{ 
                that.userDisplayName =  res.data.data.displayName;
            });
        },
        canShow() { return true },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            return this;
        },

        changeCol (currentRow,oldCurrentRow) {
            this.currTask = currentRow;
            this.currentId = currentRow.id;
            this.selectedTemp = currentRow;
            console.log("this.selectedTemp ",this.selectedTemp);
        },

     async clickButton(){
        this.proTemps = [];
        var that = this;
          // 搜去到表单中多对象（表格）选中的对象
        let addins = null;
        var selected = null;
        this.targetClass = null;
        console.log("this.args.chooseTable",this.args.chooseTable);
        if(this.args.chooseTable!=null &&this.args.chooseTable.length>0){
            addins = [];
            for(var i = 0; i< that.args.chooseTable.length; i++){
                 addins.push(that.GetAddinById(that.args.chooseTable[i]));
            }
        }else{
            addins = that.GetAllAddin();
        }
        console.log("addins",addins);
        for (var i = 0;i < addins.length;i++) {
            if (addins[i].getSelected) {
                let objs = addins[i].getSelected();
                console.log("objs",objs);
                if (objs.length > 0) {
                    let _class = addins[i].getAttrMap();
                    if(_class.length == 1){
                        selected = objs; 
                        that.targetClass = _class[0].className;
                        break;
                    }
                }
            }
        }
        console.log("that.targetClass",that.targetClass);
        console.log("selected",selected);
            
            // 多对象选择器
            if(selected!=null && 'oid' in selected[0] && selected[0].oid!=null){
                this.enInstanceId = selected[0].oid;
                if('currenProcess' in selected[0]){
                    this.currenProcess = selected[0].currenProcess;
                }else{
                    this.currenProcess = await this.loadCurrenProcess();
                }
                console.log("this.enInstanceId",this.enInstanceId);
            // 该表单对象
            }else if(this.itemValue && this.itemValue.data.origin.oid!=null){
                    this.enInstanceId = this.itemValue.data.origin.oid;
                    this.targetClass = this.this.itemValue.data.targetClass;
                    if('currenProcess' in this.itemValue.data.origin){
                        this.currenProcess = this.itemValue.data.origin.currenProcess;
                    }else{
                        this.currenProcess = await this.loadCurrenProcess();
                    }
            }else{
                this.$Message.info("未选择对象");
                return;
            }
           
            if(this.currenProcess == null || this.currenProcess==""){
                this.$Message.info("该对象未绑定在流程实例中"); 
            }else{
                that.taskModal = true;
                that.loadTaskList();
            }
      },
      async loadCurrenProcess(){
          var currentProcess = "";
          await getEobjSingle(this.targetClass,this.enInstanceId).then(res=>{
            if(res.data.success){
                if("currentProcess" in res.data.data && res.data.data.currentProcess!=null){
                    currentProcess =res.data.data.currentProcess;
                }
            }
        })
        return currentProcess;
      },
      loadTaskList(){
        let that = this;
        this.proTemps = {};
        this.taskModal = false;  
        var params = {
            userId: that.store.state.user.userId,
            enClassInstanceId :that.enInstanceId,
            bindEnClassName: that.targetClass,
        }

        console.log("params",params);
        getRunningManualTaskByObj(params).then(re=>{
            console.log(re);
            if(re.success){
                re = re.data;
                for(var i=0;i<re.length;i++){
                    re[i].index = i;
                    if(re[i].taskInstanceStatus ==1 ){ 
                        //待领取
                    }else if(re[i].submitterId != that.store.state.user.userId){
                        //我参与的
                        re[i].taskInstanceStatus = 3;
                        // }else if(re[i].submitterIp =="&&&0"){
                    }else if(re[i].submitterId == that.store.state.user.userId){
                        //待提交 && 领取人是本人 
                        if(re[i].submitterIp!="&&&0") re[i].taskInstanceStatus = 2;
                        else re[i].taskInstanceStatus = 4; 
                    }
                }
                that.proTemps = re;
                // console.log("that.proTemps",that.proTemps);
                if(that.proTemps.length == 1){
                    that.currTask = that.proTemps[0];
                    that.openTaskForm();
                }else if(that.proTemps.length == 0){
                    that.$Message.info("该对象无正在运行的任务");
                }else{
                    that.proTemps.sort((a,b) => b.lastupdate -a.lastupdate);
                    that.taskModal = true;  
                }
               
            }else{
                that.$Message.error("加载失败");
            }
        });

      },

       // 在流程中打开
        async openTaskForm(){
            this.taskModal = false;
            console.log("this.currTask",this.currTask);
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
            console.log("this.root",this.root);
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
        // 领取
        async receiveTask(){
            let that = this;
            let item  = this.currTask;
            console.log("that.userDisplayName,",that.userDisplayName);
            
            var proId = item.wfProcessInstanceId;
            var taskId = item.id;
            var userId = that.store.state.user.userId;
            var userDisplayName = that.userDisplayName;
            await receiveTaskInstance(proId,taskId,userId,userDisplayName).then( res=>{
                console.log("res",res);
                if(res.success){
                    console.log("proTemps",that.proTemps);
                    // console.log("that.proTemps.filter(x => x.id == item.id)[0]",that.proTemps.filter(x => x.id == item.id)[0]);
                    that.proTemps.filter(x => x.id == item.id)[0].taskInstanceStatus = 2;
                    that.proTemps.filter(x => x.id == item.id)[0].taskInstanceStartDateTime = Date.parse(new Date());
                    that.$Message.success("领取成功");
                    return 1;
                }else{
                    that.$Message.success("领取失败");
                    return 0;
                }
                
            });
            
        },
      
        async onHandle(params) {
            console.log("params",params);
            var that = this;
           
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