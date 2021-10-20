<template>
    <div>
        <div style="width:200px;display:inline-block;background-color:#F4F5F6;" v-for="(attr, columnIndex) in storeTabsData[sheetname].attrList" :key="attr.firstRowData">
            <AddAttributeForm 
                ref="addAttrForm"
                v-model="storeTabsData[sheetname].attrList[columnIndex]"
                :dataTypeList="dataTypeList"
                :useFirstRowAsClassName="useFirstRowAsClassName"
                :useSecondRowAsDisplayName="useSecondRowAsDisplayName"
                :sheetIndex="sheetIndex"
                :columnIndex="columnIndex"
                :styleStrOne="styleStr1"
                :styleStrTwo="styleStr2"
                :styleStrThree="styleStr3"
                @checkErrStatus="checkErrStatus"
            ></AddAttributeForm>
        </div>
    </div>
</template>
<script>
const name = "AddAttributeFormRow"
import AddAttributeForm from "./AddAttributeForm.vue"

export default {
    name: name,
    props: ['value', 'sheetname', 'dataTypeList', 'useFirstRowAsClassName', 'useSecondRowAsDisplayName','sheetIndex', 'columnIndex'],
    data() {
        return{
            name:name,
            errorAttrIndex:-1,
            storeTabsData:{},
            styleStr1:"margin:0px;",//"height:70px;" when has error
            styleStr2:"margin:0px;",
            styleStr3:"margin:0px;",
        }
    },
    components:{
        AddAttributeForm,
    },
    created(){
        this.storeTabsData = this.value
    },
    methods:{
        async isValidate(){
            for(let i = 0; i < this.$refs.addAttrForm.length; i++){

                let valid = await this.$refs.addAttrForm[i].isValidate()
                if(! valid) {
                    this.errorAttrIndex = i
                    return false
                }
            }
            return true
        },
        getIndexInfo() {
            return this.$refs.addAttrForm[this.errorAttrIndex].getIndexInfo()
        },
        checkErrStatus(){
           let status = [false, false,false]
            for(let i = 0; i < this.$refs.addAttrForm.length; i++){
                let thisStatus = this.$refs.addAttrForm[i].getErrStatus()
                status[0] = status[0] || thisStatus[0]
                status[1] = status[1] || thisStatus[1]
                status[2] = status[2] || thisStatus[2]
            }
            this.styleStr1 = status[0] ? "height:50px;" : "margin:0px;"
            this.styleStr2 = status[1] ? "height:50px;" : "margin:0px;"
            this.styleStr3 = status[2] ? "height:50px;" : "margin:0px;"
        },
    }
}
</script>