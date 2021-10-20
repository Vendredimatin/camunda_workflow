<template>
    <div>
        <Modal 
            v-model="toShowModal" 
            width="1200" 
            title="从excel创建实体类" 
            id="createEntityClassFromExcelModal"
            :mask-closable="false"
            :closable="false"
            @on-cancel="cancel"
        >
            <Tabs  ref="tabs" :animated="false">
                <TabPane v-for="(sheetname, sheetIndex) in sheetnameList" :key="sheetname" :name="sheetname" :label="renderTabsHeader(sheetname)">
                    <div style="clear: both; margin: 10px; height:630px">
                        <div  class="content" style="display:inline-block; margin: 0px; overflow:auto;background-color:#F4F5F6;">
                            <div style="height:610px; width:900px;background-color:#F4F5F6;">
                                <div style="height:475px;background-color:#F4F5F6;">
                                    <Table style="margin: 10px 0px 0px 5px"
                                            ref="objectsTable"
                                            border
                                            stripe
                                            show-header
                                            highlight-row
                                            size="small"
                                            :data="storeTabsData[sheetname].objectsData"
                                            :columns="storeTabsData[sheetname].objectsDataColumns" 
                                            :width="2 + 200*storeTabsData[sheetname].objectsDataColumns.length"
                                    >
                                    </Table>
                                </div>
                                <div :style="'width:'+(2 + 200*storeTabsData[sheetname].objectsDataColumns.length)+'px; margin: 0px 5px 5px;background-color:#F4F5F6;'">
                                    <AddAttributeFormRow 
                                        ref="addAttrFormRow"
                                        v-model="storeTabsData"
                                        :sheetname="sheetname"
                                        :dataTypeList="dataTypeList"
                                        :useFirstRowAsClassName="useFirstRowAsClassName"
                                        :useSecondRowAsDisplayName="useSecondRowAsDisplayName"
                                        :sheetIndex="sheetIndex"
                                    >
                                    </AddAttributeFormRow>
                                    
                                </div>
                            </div>
                        </div>
                        <div style="display:inline-block; margin: 5px;position:absolute;top:50px;border-left:1px solid #ddd; height:710px;">
                            <AddIntityItemClassForm 
                                ref="addClassForm" 
                                v-model="storeTabsData[sheetname].addRowData"
                                :sheetIndex="sheetIndex"
                            > </AddIntityItemClassForm>
                        </div>
                    </div>
                </TabPane>
            </Tabs>
            <div slot="footer">
                <Row>
                    <Col span="3">
                        <Checkbox :value="this.useFirstRowAsClassName" @on-change="checkUseFisrtRowAsClassName">第一行为属性英文名</Checkbox>
                    </Col>
                    <Col span="8">
                        <Checkbox :value="this.useSecondRowAsDisplayName" @on-change="checkUseSecondRowAsDisplayName">第二行为属性显示名（如果不勾选则默认英文名为显示名）</Checkbox>
                    </Col>
                    <!--Col span="6">
                        <Checkbox >自动生成页面</Checkbox->
                    </Col-->
                    <Col span="13">
                        <Button type="text" size="large" :loading="false" @click="cancel">取消</Button>
                        <Button  type="primary" size="large" :loading="confirmLoading" @click="ok">确认</Button>
                    </Col>
                </Row>
            </div>
        </Modal>
        
        <Modal
            v-model="toShowErrDataModal"
            title="导入失败"
            @on-cancel="cancelDownloadModal"
        >
            <div style="margin: 15px;">
            <p>导入中出现错误数据，请下载错误数据更新后重新上传</p>
            </div>
            <div style="margin:0px 15px;height:40px;">
                <img :src="excelImg" style="margin:5px;display:inline-block;width:30px;height:30px;">
                <p style="display:inline-block;margin:5px;position:relative;top:-15px;">错误数据</p>
                <Button @click="downloadErrData" type="primary" size="small" style="display:inline-block;margin:5px;position:relative;top:-15px;">
                    <Icon type="md-download" />下载
                </Button>
            </div>
            <div slot="footer">
                <Button type="text" size="large" :loading="false" @click="cancelDownloadModal">关闭</Button>
            </div>
        </Modal>
        <Button type="primary" style="display:inline-block; margin: 5px;" @click="clickFirstButtom" id="createEntityClassFromExcelButton">从excel创建</Button>
        <input type="file" accept=".xlsx" id="createEntityClassFromExcelfile" @change="getUpLoadFile" style="display:none"/>
    </div>
</template>

<script>

const name = "CreateEntityClassFromExcel";

import {uploadExcelThenGetInfo, confirmClassInfo, getFailureData, deleteTempExcelFile} from "@/api/quickstart.js"
import AddIntityItemClassForm from "./components/AddIntityItemClassForm.vue"
import AddAttributeFormRow from "./components/AddAttributeFormRow.vue"
export default {
    name: name,
    props: [],
    data() {
        return {
            name: name,
            filename:"",
            toShowModal:false,
            confirmLoading:false,
            toShowErrDataModal:false,

            uuid:"",
            useFirstRowAsClassName:true,
            useSecondRowAsDisplayName:true,
            dataTypeList:[],
            sheetnameList:[],
            storeTabsData : {}, //sheetName为key，TabPane所需数据为value
            
            excelImg:require("@/assets/images/excel.png"),
            
            renderTabsHeader: (sheetName) => {
                    return (h)=>{
                        return h('div', [
                            h('Checkbox', 
                            {
                                props:{
                                    value:true,
                                },
                                on: {
                                    'on-change':(val)=>{
                                        this.storeTabsData[sheetName].useThisSheet = val
                                    }
                                }
                            }),
                            h('Span', sheetName)
                        ])
                    }
                },
            renderTableHeader:(h, data) => {
                    return h('div',
                    [
                        h('Checkbox', 
                            {
                                props:{
                                    value:true,
                                },
                                on: {
                                    'on-change':(val)=>{
                                        this.storeTabsData[data.column.sheetName].attrList[data.index].useThisColumn = val
                                    }
                                }
                            }),
                        h('Span', data.column.title)
                    ])
                },
        }
    },
    components:{
        AddIntityItemClassForm,
        AddAttributeFormRow,
    },
    methods: {
        initProp(){
            this.uuid="",
            this.filename=""
            this.confirmLoading = false
            this.toShowErrDataModal = false
            this.useFirstRowAsClassName=true
            this.useSecondRowAsDisplayName=true
            this.dataTypeList=[]
            this.sheetnameList=[]
            this.storeTabsData = {}
        },

        clickFirstButtom(){ 
            this.initProp() 
            document.querySelector('#createEntityClassFromExcelfile').click();
        },

        async getUpLoadFile(e){
            if(e.target.value != "" && e.target.files[0]){
                //debugger
                let tempLength = e.target.value.split("\\").length
                let fullfilename = e.target.value.split("\\")[tempLength-1]
                let pointIndex = fullfilename.lastIndexOf("\.")
                this.filename = fullfilename.substr(0, pointIndex)
                //console.log(e.target.value)
                let formData = new FormData();
                formData.append("excelFile", e.target.files[0]);

                uploadExcelThenGetInfo(formData).then( res => {
                    let excelData = res.data.data

                    this.uuid = excelData.uuid
                    this.useFirstRowAsClassName = excelData.useFirstRowAsClassName
                    this.useSecondRowAsDisplayName = excelData.useSecondRowAsDisplayName
                    this.dataTypeList = excelData.allSupportTypes

                    this.sheetnameList = excelData.allSheetInfo.map(x => {return x.sheetName})

                    this.$refs.tabs.activeKey = this.sheetnameList[0]

                    for(let i = 0; i < excelData.allSheetInfo.length; i++) {
                        let key = excelData.allSheetInfo[i].sheetName

                        let tabPaneData = {}
                        tabPaneData.objectsDataColumns = excelData.allSheetInfo[i].infoFromColumnList.map(x => {return {title:x.firstRowData, key:x.firstRowData, width: 200, ellipsis:true, sheetName:key, renderHeader:this.renderTableHeader}})
                        tabPaneData.objectsData = excelData.allSheetInfo[i].objectsData

                        let addRowData  = {}
                        addRowData.className = excelData.allSheetInfo[i].className
                        addRowData.displayName = excelData.allSheetInfo[i].displayName
                        addRowData.zoneName = excelData.allSheetInfo[i].zoneName
                        addRowData.isTree = excelData.allSheetInfo[i].isTree
                        tabPaneData.addRowData = addRowData

                        tabPaneData.attrList = excelData.allSheetInfo[i].infoFromColumnList;

                        tabPaneData.useThisSheet = excelData.allSheetInfo[i].useThisSheet

                        this.storeTabsData[key] = tabPaneData
                    }

                    this.toShowModal = true
                }).catch(err => {
                    console.error(err)
                })
            }
            e.target.value = "";
        },
        
        checkUseFisrtRowAsClassName(val) {
            this.useFirstRowAsClassName = val
        },

        checkUseSecondRowAsDisplayName(val) {
            this.useSecondRowAsDisplayName = val
        },

        async ok(){
            if(this.confirmLoading == true){
                return ;
            }
            this.confirmLoading = true
            for (let i = 0; i < this.$refs.addClassForm.length; i++) {
                let valid = await this.$refs.addClassForm[i].isValidate()
                if(! valid) {
                    let sheetIndex = this.$refs.addClassForm[i].getIndexInfo()
                    if( this.storeTabsData[this.sheetnameList[sheetIndex]].useThisSheet) {
                        this.$Message.error("请仔细查验第"+(sheetIndex+1)+"页的输入信息")
                        this.confirmLoading=false
                        return;
                    }
                }
            }
            for(let i = 0; i < this.$refs.addAttrFormRow.length; i++){
                let valid = await this.$refs.addAttrFormRow[i].isValidate()
                if(! valid) {
                    let [sheetIndex,columnIndex] = this.$refs.addAttrFormRow[i].getIndexInfo()
                    if(this.storeTabsData[this.sheetnameList[sheetIndex]].useThisSheet &&
                        this.storeTabsData[this.sheetnameList[sheetIndex]].attrList[columnIndex].useThisColumn
                    ) {
                        this.$Message.error("请仔细查验第"+(sheetIndex+1)+"页第"+(columnIndex+1)+"列的输入信息")
                        this.confirmLoading=false
                        return;
                    }
                }
            }

            let reqData = {}

            reqData.uuid = this.uuid
            reqData.useFirstRowAsClassName = this.useFirstRowAsClassName
            reqData.useSecondRowAsDisplayName = this.useSecondRowAsDisplayName

            let allSheetInfo = []
            for (let i = 0; i < this.sheetnameList.length; i++) {
                let sheetname = this.sheetnameList[i]
                
                let classInfo = {}
                classInfo.sheetName = sheetname
                
                classInfo.className = this.storeTabsData[sheetname].addRowData.className
                classInfo.displayName = this.storeTabsData[sheetname].addRowData.displayName
                classInfo.zoneName = this.storeTabsData[sheetname].addRowData.zoneName
                classInfo.isTree = this.storeTabsData[sheetname].addRowData.isTree
                
                classInfo.useThisSheet = this.storeTabsData[sheetname].useThisSheet
                
                classInfo.infoFromColumnList = this.storeTabsData[sheetname].attrList
                
                allSheetInfo.push(classInfo)
            }
            reqData.allSheetInfo = allSheetInfo

            confirmClassInfo(reqData).then(res => {
                this.confirmLoading = false
                this.toShowModal = false

                let resSuccess = res.data.data
                this.$emit("globalRefresh")
                if(resSuccess) {
                    deleteTempExcelFile(this.uuid)
                    console.log("从excel创建实体类", resSuccess)
                    this.$Message.success("从excel创建实体类成功")
                } else {
                    this.toShowErrDataModal=true
                    // this.$Modal.confirm({
                    // title: "导入失败",
                    // content: "<p>导入中出现错误数据，请下载错误数据更新后重新上传</p>",
                    // okText: "下载",
                    // cancelText: "关闭",
                    // onOk: () => {
                    //     getFailureData(this.uuid).then(res=>{
                    //         console.log("下载失败数据：", res)
                    //         deleteTempExcelFile(this.uuid)
                    //     })
                    // },
                    // onCancel:() => {
                    //     deleteTempExcelFile(this.uuid)
                    // }
                    //});
                }
            }).catch(err => {
                deleteTempExcelFile(this.uuid)
                this.confirmLoading = false
                this.toShowModal = false

                console.error("从excel创建实体类","发生致命错误，请联系开发人员")
                console.error("从excel创建实体类", err)
                this.$Message.error("从excel创建实体类功能，发生致命错误，请联系开发人员")
                this.$emit("globalRefresh")
            })
        },
        downloadErrData(){
            getFailureData(this.uuid, this.filename+"_failure.xlsx").then(res=>{
                //console.log("下载失败数据：", res)
            })
        },
        cancelDownloadModal(){
            deleteTempExcelFile(this.uuid)
            this.toShowErrDataModal=false
        },
        cancel(){
            if(this.confirmLoading == true){
                return ;
            }
            deleteTempExcelFile(this.uuid)
            this.toShowModal = false
        },
    },
}
</script>
<!--style>
.content::-webkit-scrollbar {
	display: none;/*隐藏滚动条*/ 
}
</style-->


