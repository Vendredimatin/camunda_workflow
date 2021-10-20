<template>
    <div>
        <Modal v-model="chooseCols" title="导出模板" id="exportEntityModal">
            <h3>选择目标类</h3>
            <Select @on-change="getClassNameValue" v-model="AllChosedTargetClassName"  filterable>
                <Option :value="item.className" v-for="item in AllTargetClassesName" v-bind:key="item.id">{{item.className+" : "+item.displayName}}</Option>
            </Select>
            <h3>系统属性</h3>
            <div v-if="AllTargetClassSystemAttributes.length > 0" style="border: 1px solid #88AAE1;" id="exportModalSys">
                <CheckboxGroup v-model="AllChosedSystemAttributes" @on-change="getChosedSystemAttributesValue">
                    <Checkbox
                    v-for="item in AllTargetClassSystemAttributes"
                    :key="item.id"
                    :label="item.attributeName"
                    style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom;"
                    >{{ item.displayName }}</Checkbox>
                </CheckboxGroup>
            </div>
            <div v-else >
                暂无
            </div>
            <h3>类属性</h3>
            <div v-if="AllTargetClassCustomAttributes.length > 0" style="border: 1px solid #88AAE1;" id="exportModalDef">
                <CheckboxGroup v-model="AllChosedCustomAttributes" @on-change="getChosedCustomAttributesValue">
                    <Checkbox
                    v-for="item in AllTargetClassCustomAttributes"
                    :key="item.id"
                    :label="item.attributeName"
                    style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom;"
                    >{{ item.displayName }}</Checkbox>
                </CheckboxGroup>
            </div>
            <div v-else>
                暂无
            </div>
            <div class="margin1">
                <Checkbox
                :indeterminate="indeterminate"
                :value="checkAll"
                @click.prevent.native="($event) => {handleCheckAll($event)}">全选</Checkbox>
            </div>
            <div slot="footer">
                <Button   @click="cancelExportModel">取消</Button>
                <Button type="primary" :disabled="(AllChosedSystemAttributes.length + AllChosedCustomAttributes.length) == 0" @click="exportModel">确定</Button>
            </div>
        </Modal>
        <Modal @on-cancel="quitImportDataModal" v-model="importCols" title="导入数据" id="importDataModal">
            <h3>正在导入</h3>
            <div >
                <div style=" display: flex;" >
                    <Progress ref="progress" :percent="percent" status='active' style="float:right"/>
                    <Button :type="args.type" size="small" @click="shopImportData" :disabled="btnDisabled" style="float:right">{{stopButtonTxt}}</Button>
                </div>
                    <span>文件名：{{this.fileName}}</span>
            </div>
            <h3>导入结果</h3>
            <div style=" display: flex;" >
                <div style="margin: auto; flex-grow:1;">总条数:{{AllNum}}</div>
                <div style="margin: auto; flex-grow:1;">成功条数:{{SuccessNum}}</div>
                <div style="margin: auto; flex-grow:1;">失败条数:{{FailureNum}}</div>
            </div>
            <div slot="footer">
                <a  id="failedFile"  style="margin-right: 10px;display:none;">下载失败数据</a>
                <Button :type="args.type" @click="importDataOkBtn">{{hideOrOk}}</Button>
            </div>
            <Modal v-model="confirmStopImportData" title="提示">
                <h3>你确定要停止导入数据吗？</h3>
                <div>如果停止导入，默认以往注入的数据将继续存在，后续数据则不进行导入，您确定停止导入吗？</div>
                <Checkbox v-model="booleanClearImportedData" >清空已导入数据</Checkbox>
                <div slot="footer">
                    <Button :type="args.type" @click="stopImportDataOk">停止导入</Button>
                    <Button :type="args.type" @click="stopImportDataCancel">继续导入</Button>
                </div>
            </Modal>
        </Modal>
        <Button :disabled="!hasClass" type="success" style="display:inline-block; margin: 5px;" :shape="args.shape ? 'circle' : null" @click="exportModal" id="exportTemplateButton">导出模板</Button>
        <Button :disabled="!hasClass" type="primary" style="display:inline-block; margin: 5px;" @click="selectFile" id="importDataButton">导入数据</Button>
        <input type="file" accept=".xls,.xlsx" id="dataimportfile" @change="getUpLoadFile" style="display:none"/>
    </div>
</template>

<script>
import XLSX from "xlsx";
import store from "@/store";
import global_ from "@/views/global.vue"
import {getEntities, getRelations, getAttributesOfClass, getImportDataUUID, importData, stopImportData, getFailedDataUrl, deleteTempXlsxFile} from "@/api/dataimport.js"
import { addListener, removeListener, createSocket, getSockId, closeSocket } from "@/util/webSocket.js"
//两个importdata的区别是
//modeler是使用的targetclass参数传递的类作为默认类， app是使用的store中记录的类作为默认类，
//modeler使用hasClass参数判断是否有类， app端不用判断
const name = "DataImport";
export default {
    name: name,
    props: ['hasClass', 'itemValue',  'targetClass'],
    data() {
        return {
            name: name,
            importDataUUID:"",
            chooseCols: false,
            importCols: false,
            t_edit: false,
            fileName: "",
            percent:0.0,
            AllNum:0,
            SuccessNum:0,
            FailureNum:0,
            websocket:null,
            failedFile:null,
            stopButtonTxt:"停止",
            hideOrOk:"收起",
            btnDisabled: false,
            visible:true,
            confirmStopImportData:false,
            booleanClearImportedData:true,
            booleanUpdateIfExist:true,
            AllChosedSystemAttributes:[],
            AllChosedCustomAttributes:[],
            AllChosedTargetClassName:null,
            AllTargetClassSystemAttributes: [],
            AllTargetClassCustomAttributes:[],
            AllTargetClassesName:[],
            AllTargetClassesNameDic:{},
            AllTargetClassAttributesDic:{},
            wsBaseUrl:"",
            importDataCommandListenerUID:"",
            indeterminate : false,
            checkAll : false,
            //sockID:"",
            args: {
                type: "default",
                shape: false,
                text: "数据导入"
            }

        }
    },
    methods: {
        canShow() { return true },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            return this;
        },

        async exportModal(){
            console.log("this: ", this)
            this.AllTargetClassSystemAttributes = []
            this.AllTargetClassCustomAttributes = []
            this.AllChosedTargetClassName = null;
            this.AllChosedSystemAttributes = [];
            this.AllChosedCustomAttributes = [];
            this.AllTargetClassesName = [];
            this.AllTargetClassesNameDic = {};
            this.indeterminate = false;
            this.checkAll = false;
            if(this.targetClass){
                this.AllChosedTargetClassName = this.targetClass
                this.getClassNameValue();
            }
            this.chooseCols = true;
            this.AllTargetClassesName=[]
            this.AllTargetClassesNameDic={}
            getEntities().then(res=>{
                for(let i = 0; i < res.data.data.length; i++){
                    if(res.data.data[i].classCategory === "ItemClass"){
                        this.AllTargetClassesName.push(res.data.data[i]);
                        this.AllTargetClassesNameDic[res.data.data[i].className] = res.data.data[i];
                    }
                }
            })

            getRelations().then(res => {
                for(let i = 0; i < res.data.data.length; i++){
                    this.AllTargetClassesName.push(res.data.data[i]);
                    this.AllTargetClassesNameDic[res.data.data[i].className] = res.data.data[i];
                }
            })
        },
        async getClassNameValue(){
            if(!this.AllChosedTargetClassName){
                return;
            }
            //console.log("AllChosedTargetClassName", this.AllChosedTargetClassName)

            getAttributesOfClass(this.AllChosedTargetClassName).then(res => {
                this.AllTargetClassSystemAttributes = []
                this.AllTargetClassCustomAttributes = []
                let sysAttributesName = [
                    "currentProcess",
                    "oid",
                    "creator",
                    "owner",
                    "id",
                    "lastModifyTime",
                    "lastModifier",
                    "createTime",
                    "rightOid",
                    "rightClass",
                    "rightRev",
                    "leftOid",
                    "leftClass",
                    "order",
                    "version",
                    ]
                for(let i = 0; i <  res.data.data.length; i++){
                    if(res.data.data[i].valueType != "LocalFile"){
                        if(sysAttributesName.indexOf(res.data.data[i].attributeName) > -1){
                            this.AllTargetClassSystemAttributes.push(res.data.data[i]);
                        }else{
                            this.AllTargetClassCustomAttributes.push(res.data.data[i]);
                        }
                        this.AllTargetClassAttributesDic[res.data.data[i].attributeName] = res.data.data[i];
                    }
                }
                console.log("res: ", res);
                console.log("this.AllTargetClassSystemAttributes", this.AllTargetClassSystemAttributes)
            })

        },
        getChosedSystemAttributesValue(){
            if(this.AllChosedSystemAttributes.length == this.AllTargetClassSystemAttributes.length &&  this.AllChosedCustomAttributes.length == this.AllTargetClassCustomAttributes.length && this.AllTargetClassSystemAttributes.length > 0) {
                this.indeterminate = false;
                this.checkAll = true;
            } else if(this.AllChosedSystemAttributes.length > 0 || this.AllChosedCustomAttributes.length > 0){
                this.indeterminate = true;
                this.checkAll = false;
            } else {
                this.indeterminate = false;
                this.checkAll = false;
            }
        },
        getChosedCustomAttributesValue(){
            if(this.AllChosedSystemAttributes.length == this.AllTargetClassSystemAttributes.length &&  this.AllChosedCustomAttributes.length == this.AllTargetClassCustomAttributes.length && this.AllTargetClassSystemAttributes.length > 0) {
                this.indeterminate = false;
                this.checkAll = true;
            } else if(this.AllChosedSystemAttributes.length > 0 || this.AllChosedCustomAttributes.length > 0){
                this.indeterminate = true;
                this.checkAll = false;
            } else {
                this.indeterminate = false;
                this.checkAll = false;
            }
        },
        handleCheckAll(event){
            if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    let tempList = []
                    for(let i = 0; i < this.AllTargetClassCustomAttributes.length; i++) {
                        tempList.push(this.AllTargetClassCustomAttributes[i].attributeName)
                    }
                    this.AllChosedCustomAttributes = tempList;

                    let tempList2 = []
                    for(let i = 0; i < this.AllTargetClassSystemAttributes.length; i++) {
                        tempList2.push(this.AllTargetClassSystemAttributes[i].attributeName)
                    }
                    this.AllChosedSystemAttributes = tempList2;
                } else {
                    this.AllChosedSystemAttributes = []
                    this.AllChosedCustomAttributes = []
                }
        },
        async exportModel(){
            this.chooseCols = false;
            if(this.AllChosedSystemAttributes.length + this.AllChosedCustomAttributes.length == 0){
                this.AllTargetClassSystemAttributes = []
                this.AllTargetClassCustomAttributes = []
                this.AllChosedTargetClassName = null;
                this.AllChosedSystemAttributes = [];
                this.AllChosedCustomAttributes = [];
                this.AllTargetClassesName = [];
                this.AllTargetClassesNameDic = {};

                return ;
            }
            if(this.AllTargetClassesNameDic[this.AllChosedTargetClassName].classCategory==="ItemClass"){
                let sheetAttrs = {}
                for(let i = 0; i < this.AllChosedSystemAttributes.length; i++){
                    sheetAttrs[this.AllTargetClassAttributesDic[this.AllChosedSystemAttributes[i]].attributeName] = this.AllTargetClassAttributesDic[this.AllChosedSystemAttributes[i]].displayName;
                }
                for(let i = 0; i < this.AllChosedCustomAttributes.length; i++){
                    sheetAttrs[this.AllTargetClassAttributesDic[this.AllChosedCustomAttributes[i]].attributeName] = this.AllTargetClassAttributesDic[this.AllChosedCustomAttributes[i]].displayName;
                }
                let ws = XLSX.utils.json_to_sheet([sheetAttrs]);
                let wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, this.AllTargetClassesNameDic[this.AllChosedTargetClassName].className);
                XLSX.writeFile(wb, this.AllChosedTargetClassName+".xlsx")
            }else if(this.AllTargetClassesNameDic[this.AllChosedTargetClassName].classCategory==="RelationClass"){
                let leftClass = this.AllTargetClassesNameDic[this.AllChosedTargetClassName].leftClass;
                let rightClass = this.AllTargetClassesNameDic[this.AllChosedTargetClassName].rightClass;
                let leftClassAttrs = await getAttributesOfClass(leftClass)
                let rightClassAttrs = await getAttributesOfClass(rightClass)
                console.log("leftClassAttrs", leftClassAttrs)
                console.log("leftClassAttrs", rightClassAttrs)

                let wb = XLSX.utils.book_new();
                sheetAttrs = {}
                if(this.AllChosedSystemAttributes.indexOf("leftClass") < 0){
                    this.AllChosedSystemAttributes.push("leftClass")
                }
                if(this.AllChosedSystemAttributes.indexOf("rightClass") < 0){
                    this.AllChosedSystemAttributes.push("rightClass")
                }
                if(this.AllChosedSystemAttributes.indexOf("leftOid") < 0){
                    this.AllChosedSystemAttributes.push("leftOid")
                }
                if(this.AllChosedSystemAttributes.indexOf("rightOid") < 0){
                    this.AllChosedSystemAttributes.push("rightOid")
                }
                for(let i = 0; i < this.AllChosedSystemAttributes.length; i++){
                    sheetAttrs[this.AllTargetClassAttributesDic[this.AllChosedSystemAttributes[i]].attributeName] = this.AllTargetClassAttributesDic[this.AllChosedSystemAttributes[i]].displayName;
                }
                for(let i = 0; i < this.AllChosedCustomAttributes.length; i++){
                    sheetAttrs[this.AllTargetClassAttributesDic[this.AllChosedCustomAttributes[i]].attributeName] = this.AllTargetClassAttributesDic[this.AllChosedCustomAttributes[i]].displayName;
                }
                ws = XLSX.utils.json_to_sheet([sheetAttrs]);
                XLSX.utils.book_append_sheet(wb, ws, this.AllTargetClassesNameDic[this.AllChosedTargetClassName].className);

                let sheetAttrs = {}
                for(let i = 0; i < leftClassAttrs.data.data.length; i++){
                    if(leftClassAttrs.data.data[i].valueType != "LocalFile"){
                        sheetAttrs[leftClassAttrs.data.data[i].attributeName] = leftClassAttrs.data.data[i].displayName
                    }
                }
                let ws = XLSX.utils.json_to_sheet([sheetAttrs]);
                XLSX.utils.book_append_sheet(wb, ws, leftClass);

                if(rightClass != leftClass){
                    sheetAttrs = {}
                    for(let i = 0; i < rightClassAttrs.data.data.length; i++){
                        if(rightClassAttrs.data.data[i].valueType != "LocalFile"){
                            sheetAttrs[rightClassAttrs.data.data[i].attributeName] = rightClassAttrs.data.data[i].displayName
                        }
                    }
                    ws = XLSX.utils.json_to_sheet([sheetAttrs]);
                    XLSX.utils.book_append_sheet(wb, ws, rightClass);
                }

                XLSX.writeFile(wb, this.AllChosedTargetClassName+".xlsx")
            }
            this.AllTargetClassSystemAttributes = []
            this.AllTargetClassCustomAttributes = []
            this.AllChosedTargetClassName = null;
            this.AllChosedSystemAttributes = [];
            this.AllChosedCustomAttributes = [];
            this.AllTargetClassesName = [];
            this.AllTargetClassesNameDic = {};
        },
        cancelExportModel(){
            this.chooseCols = false
            this.AllTargetClassSystemAttributes = []
            this.AllTargetClassCustomAttributes = []
            this.AllChosedTargetClassName = null;
            this.AllChosedSystemAttributes = [];
            this.AllChosedCustomAttributes = [];
            this.AllTargetClassesName = [];
            this.AllTargetClassesNameDic = {};
        },
        selectFile(){

            //触发 文件选择的click事件
            if(this.percent != 0.0){
                this.importCols = true;
            }else{
                this.$Modal.confirm({
                    title: "是否覆盖",
                    content: "<p>oid相同时，如果进行更新选择“是”，如果丢弃选择“否”</p>",
                    okText: "是",
                    cancelText: "否",
                    onOk: () => {
                        this.booleanUpdateIfExist = true
                        document.querySelector('#dataimportfile').click();
                    },
                    onCancel:() => {
                        this.booleanUpdateIfExist = false
                        document.querySelector('#dataimportfile').click();
                    }
                });

            }
        }  ,

        async getUpLoadFile(e){
            if(e.target.value != "" && e.target.files[0]){

                let res = await getImportDataUUID(this.booleanUpdateIfExist);
                this.importDataUUID = res.data.data;

                console.log("File Name: ",e);
                console.log("File Name: ",e.target.files);
                this.importCols = true;
                this.percent = 0.0;
                this.fileName = e.target.files[0].name

                let formData = new FormData();
                formData.append("uuid",this.importDataUUID);
                if(getSockId()){
                    //说明已经建立过websocket连接了
                }else{
                    await createSocket(global_.wsBaseUrl + "/websocket?token=" + store.state.user.token)
                }
                formData.append("sockID", getSockId());
                formData.append("file", e.target.files[0]);
                importData(formData).then(res=>{
                    console.log("data import reponse: ", res);
                    this.stopButtonTxt="已完成";
                    this.btnDisabled = true;
                    this.AllNum = res.data.data.allNum;
                    this.SuccessNum = res.data.data.succeedNum;
                    this.FailureNum = res.data.data.failedNum;
                    this.hideOrOk = "确定"
                    if(res.data.data.failedNum > 0 && !res.data.data.beStopped){
                        document.querySelector("#failedFile").style.display = "inline-block"
                        document.querySelector("#failedFile").href = getFailedDataUrl(this.importDataUUID)
                        document.querySelector("#failedFile").download = "failedFile_"+this.fileName
                    } else {
                        setTimeout(() => {
                            this.importDataOkBtn()
                        }, 1000)
                    }
                }).catch((err) => {
                    this.importDataUUID=""
                    this.stopButtonTxt="停止";
                    this.btnDisabled = false;
                    this.importCols = false;
                    this.fileName = ""
                    this.percent = 0.0
                    this.AllNum = 0;
                    this.SuccessNum = 0;
                    this.FailureNum = 0;
                    this.hideOrOk = "收起"
                    document.querySelector("#failedFile").style.display = "none"
                    this.$Message.error("数据导入失败或被用户中止")
                    console.error("data import error: ", err)
                })
            }
            e.target.value = "";
        }  ,
        quitImportDataModal(){
            //退出那个“导入数据”的modal界面
        },
        processbarFunc(res){
            console.log("processbarFunc",res);
        },
        shopImportData(){
            this.confirmStopImportData = true;
        },
        async stopImportDataOk(){
            this.confirmStopImportData = false;
            console.log("this.booleanClearImportedData",this.booleanClearImportedData)
            this.stopButtonTxt = "停止中";
            this.btnDisabled = true;
            if(this.booleanClearImportedData){
                //然后告诉服务器停止导入数据并删除以往数据
                let formData = new FormData();
                formData.append("uuidString",this.importDataUUID)
                formData.append("clearDataBoolean", true);
                await stopImportData(formData);
            }else{
                //然后告诉服务器停止导入
                this.booleanClearImportedData = true;
                let formData = new FormData();
                formData.append("uuidString",this.importDataUUID)
                formData.append("clearDataBoolean", false);
                await stopImportData(formData);
            }
        },
        stopImportDataCancel(){
            this.confirmStopImportData = false;
            this.booleanClearImportedData = true;
        },

        importDataOkBtn(){
            if(this.hideOrOk === "确定"){
                //clearInterval(this.timer);
                this.stopButtonTxt="停止";
                this.btnDisabled = false;
                this.importCols = false;
                this.fileName = ""
                this.percent = 0.0
                this.AllNum = 0;
                this.SuccessNum = 0;
                this.FailureNum = 0;
                this.hideOrOk = "收起"
                document.querySelector("#failedFile").style.display = "none"
                let formData = new FormData();
                formData.append("fileName",this.importDataUUID+".xlsx")
                deleteTempXlsxFile(formData)
                this.importDataUUID=""
            }else{
                this.importCols = false;
            }
        },
        handleListener(data){

            console.log("importData command: ", data);
            //alert("importData command: " + JSON.stringify(data));
            //this.msg = data;
            if(data.importDataUUID === this.importDataUUID){
                this.percent = parseInt(data.percent)
            }
        },
    },
    computed:{

    },
    mounted(){
        this.wsBaseUrl = global_.wsBaseUrl
        //按理来说在用户登录时建立一个连接就好了
        //debugger
        if(getSockId()){
            //说明已经建立过websocket连接了
        }else{
            createSocket(global_.wsBaseUrl + "/websocket?token=" + store.state.user.token)
        }

        //debugger
        this.importDataCommandListenerUID = addListener("importData command", this.handleListener, true)
    },
    beforeDestroy(){
        removeListener("importData command", this.importDataCommandListenerUID);
        //按理来说在用户登陆的时候连接一下，那也就应该是在用户登出的时候关闭一下连接。
        //closeSocket();
    },
    watch:{
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
