<template>
    <div>
    <Modal v-model="chooseClassAndAttributes" title="导出数据">
        <h3>选择目标类</h3>
        <Select @on-change="getClassNameValue" v-model="AllChosedTargetClassName"  filterable>
            <Option :value="item.className" v-for="item in AllTargetClassesName" v-bind:key="item.id">{{item.className+" : "+item.displayName}}</Option>
        </Select>
        <h3>系统属性</h3>
        <div v-if="AllTargetClassSystemAttributes.length > 0" style="border: 1px solid #88AAE1;" >
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
        <div v-if="AllTargetClassCustomAttributes.length > 0" style="border: 1px solid #88AAE1;">
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
        <h3>Excel结构</h3>
        <div style="border: 1px solid #88AAE1;">
            <i-switch style="margin: 3px;" v-model="independentSheet"/> 
            <label  style="margin: 3px;">使用独立sheet页</label>
            <!--label v-else style="margin: 5px;">合并成一个sheet页</label-->
        </div>
        <div class="margin1">
            <Checkbox
            :indeterminate="indeterminate"
            :value="checkAll"
            @click.prevent.native="($event) => {handleCheckAll($event)}">全选</Checkbox>
        </div>
        <div slot="footer">
                <Button   @click="cancelExportData">取消</Button>
                <Button type="primary" :disabled="(AllChosedSystemAttributes.length + AllChosedCustomAttributes.length) == 0" @click="exportData">确定</Button>
        </div>
    </Modal>
    <Button :disabled="!hasClass" type="primary" style="display:inline-block; margin: 5px;" @click="onClickExportDataButton">导出数据</Button>
    </div>
</template>

<script>
import axios from "@/libs/axios.js"
import Axios from "axios";
import XLSX from "xlsx";
import store from "@/store";
import global_ from "@/views/global.vue"
import {dataExportFunc} from "@/api/dataexport.js"
import { addListener, removeListener, createSocket, getSockId, closeSocket } from "@/util/webSocket.js"
const name = "RelationClassDataExport";

export default {
    name: name,
    props: ['hasClass','itemValue', 'targetClass'],
    data() {
        return {
            name: name,
            chooseClassAndAttributes:false,
            AllTargetClassesName:[],
            AllTargetClassesNameDic:{},
            AllChosedTargetClassName:null,
            AllTargetClassSystemAttributes:[],
            AllTargetClassCustomAttributes:[],
            AllTargetClassAttributesDic:{},
            AllChosedSystemAttributes:[],
            AllChosedCustomAttributes:[],
            independentSheet:true,
            indeterminate : false,
            checkAll : false,
        }
    },
    methods: {
        exportData(){
            console.log("???")
            console.log(this.AllChosedTargetClassName)
            //console.log(this.AllChosedSystemAttributes)
            //console.log(this.AllChosedCustomAttributes)
            if(!this.AllChosedTargetClassName){
                return;
            }
            let AllTargetAttributes = []
            for(let i = 0; i < this.AllChosedSystemAttributes.length; i++){
                AllTargetAttributes.push(this.AllChosedSystemAttributes[i])
            }
            for(let i = 0; i < this.AllChosedCustomAttributes.length; i++){
                AllTargetAttributes.push(this.AllChosedCustomAttributes[i])
            }
            console.log(AllTargetAttributes)

            if(AllTargetAttributes.length == 0){
                this.AllTargetClassSystemAttributes = []
                this.AllTargetClassCustomAttributes = []
                this.AllChosedTargetClassName = null;
                this.AllChosedSystemAttributes = [];
                this.AllChosedCustomAttributes = [];
                this.AllTargetClassAttributesDic = {}
                this.AllTargetClassesName = [];
                this.AllTargetClassesNameDic = {};
                this.chooseClassAndAttributes = false
                this.independentSheet = true
                return;
            }
            
            dataExportFunc(this.AllChosedTargetClassName, AllTargetAttributes, !this.independentSheet)

            this.AllTargetClassSystemAttributes = []
            this.AllTargetClassCustomAttributes = []
            this.AllChosedTargetClassName = null;
            this.AllChosedSystemAttributes = [];
            this.AllChosedCustomAttributes = [];
            this.AllTargetClassAttributesDic = {}
            this.AllTargetClassesName = [];
            this.AllTargetClassesNameDic = {};
            this.chooseClassAndAttributes = false
            this.independentSheet = true
        },
        cancelExportData(){
            console.log("???")
            this.AllTargetClassSystemAttributes = []
            this.AllTargetClassCustomAttributes = []
            this.AllChosedTargetClassName = null;
            this.AllChosedSystemAttributes = [];
            this.AllChosedCustomAttributes = [];
            this.AllTargetClassAttributesDic = {}
            this.AllTargetClassesName = [];
            this.AllTargetClassesNameDic = {};
            this.chooseClassAndAttributes = false
            this.independentSheet = true
        },
        async onClickExportDataButton(){
            this.AllTargetClassSystemAttributes = []
            this.AllTargetClassCustomAttributes = []
            this.AllChosedTargetClassName = null;
            this.AllChosedSystemAttributes = [];
            this.AllChosedCustomAttributes = [];
            this.AllTargetClassAttributesDic = {}
            this.independentSheet = true
            this.indeterminate = false;
            this.checkAll = false;
            if(this.targetClass){
                this.AllChosedTargetClassName = this.targetClass
                this.getClassNameValue();
            }

            this.AllTargetClassesName = [];
            this.AllTargetClassesNameDic = {};
            this.chooseClassAndAttributes = true

            console.log("???")
            axios.get(
                `meta/relations`
            ).then(res=>{
                for(let i = 0; i < res.data.data.length; i++){
                console.log(res.data.data[i].classCategory);
                    if(res.data.data[i].classCategory === "RelationClass"){
                    
                        this.AllTargetClassesName.push(res.data.data[i]);
                        this.AllTargetClassesNameDic[res.data.data[i].className] = res.data.data[i];
                    }
                }
            })
        },
        async getClassNameValue(){
            if(!this.AllChosedTargetClassName){
                return;
            }
            console.log("AllChosedTargetClassName", this.AllChosedTargetClassName)
            //this.exportData.class = [];
            //this.exportData.class.push({
            //    className : this.AllChosedTargetClassName
            //})
            axios.get(`meta/entities/${this.AllChosedTargetClassName}/attributes`).then(res => {
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
     }
}
</script>
