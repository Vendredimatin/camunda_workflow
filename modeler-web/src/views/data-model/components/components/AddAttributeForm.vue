<template>
    <div>
        <Form ref="addRowForm" :model="addRowData" :rules="rowValidate">
          <FormItem :style="styleStrOne" @blur.native.capture="validateAttributeName" prop="attributeName"> <!--style="margin:0px;"-->
            <Input v-model="addRowData.attributeName" placeholder="输入属性名" @on-change="changeValue" id="createAttrModalAttributeName"></Input>
          </FormItem>
          <FormItem :style="styleStrTwo" @blur.native.capture="validateDisplayName" prop="displayName"><!--style="margin:0px;"-->
            <Input v-model="addRowData.displayName" placeholder="输入属性显示名" @on-change="changeValue" id="createAttrModalDisplayName"></Input>
          </FormItem>
          <FormItem :style="styleStrThree" @blur.native.capture="validateValueType" prop="valueType"><!--style="margin:0px;"-->
            <Select v-model="addRowData.valueType" placeholder="选择数据类型" @on-change="changeValue" filterable id="createAttrModalValueType">
              <Option v-for="key in dataTypeList" :value="key" :key="key" :label="key">
                <span>{{ key }}</span>
              </Option>
            </Select>
          </FormItem>
        </Form>
    </div>
</template>
<script>
const name = "AddAttributeForm"
import {checkAttributeTypeValid} from "@/api/quickstart.js"
export default {
    name: name,
    props: ['value', 'dataTypeList', 'useFirstRowAsClassName', 'useSecondRowAsDisplayName','sheetIndex', 'columnIndex', 'styleStrOne','styleStrTwo', 'styleStrThree',],
    data() {
        const valueTypeValidator = async (rule, value, callback) => {
            if(!this.addRowData.attributeName){
                callback()
                return
            }
            let res = await checkAttributeTypeValid(this.addRowData.attributeName, this.addRowData.valueType)
            if(!res.data.data.valid){
                callback(new Error(res.data.data.cause))
            } else {
                callback()
            }
        };
        return {
            name : name,
            addRowData: {
                attributeName:"",//需要在后端为ExcelColumn加上这两个字段
                displayName: "",//需要在后端为ExcelColumn加上这两个字段
                valueType: "",
            },
            oneErr:false,
            twoErr:false,
            threeErr:false,
            rowValidate: {
                attributeName: [
                    { required: true, message: "属性名不能为空", trigger: "blur" },
                    {
                        pattern: /^[a-zA-Z0-9]{1,32}$/,
                        message: "属性名只能包含字母、数字，长度不超过32个字符",
                        trigger: "blur"
                    },
                    { pattern: /^[a-zA-Z]/, message: "属性名首字母应为字母", trigger: "blur" }
                ],
                displayName: [
                { required: true, message: "属性显示名不能为空", trigger: "blur" },
                    {
                        pattern: /^\S{1,32}$/,
                        message: "属性显示名只能包含汉字、字母、数字，长度不超过32个字符",
                        trigger: "blur"
                    }
                ],
                valueType: [
                    { required: true, message: "数据类型不能为空", trigger: "blur" },
                    {
                        validator: valueTypeValidator, trigger: 'blur'
                    },
                ],
            },
        }
    },
    methods:{
        changeValue(){
            this.value.attributeName = this.addRowData.attributeName
            this.value.displayName = this.addRowData.displayName
            this.value.dataType = this.addRowData.valueType
            //this.$refs.addRowForm.validate()
            this.validateAll()
        },
        isValidate(){
            return this.$refs["addRowForm"].validate(valid => {
                return valid
            })
        },
        getIndexInfo() {
            return [this.sheetIndex,this.columnIndex]
        },
        getErrStatus(){
            return [this.oneErr, this.twoErr, this.threeErr]
        },
        validateAttributeName(){
            this.$refs.addRowForm.validateField("attributeName", err =>{
                if(err){
                    this.oneErr=true
                }else {
                    this.oneErr=false
                }
                this.$emit("checkErrStatus")
            })
        },
        validateDisplayName(){
            this.$refs.addRowForm.validateField("displayName", err =>{
                if(err){
                    this.twoErr=true
                }else {
                    this.twoErr=false
                }
                this.$emit("checkErrStatus")
            })
        },
        validateValueType(){
            this.$refs.addRowForm.validateField("valueType", err =>{
                if(err){
                    this.threeErr=true
                }else {
                    this.threeErr=false
                }
                this.$emit("checkErrStatus")
            })
        },
        validateAll(){
            this.validateAttributeName()
            this.validateDisplayName()
            this.validateValueType()
        }
    },
    mounted(){
        this.addRowData.attributeName = this.useFirstRowAsClassName ? this.value.firstRowData : this.value.firstRowDataPinyin
        this.addRowData.displayName = this.useSecondRowAsDisplayName ? this.value.secondRowData : (this.useFirstRowAsClassName? this.value.firstRowData : this.value.firstRowDataPinyin)
        this.addRowData.valueType = this.value.dataType
        //this.$refs.addRowForm.validate()
        this.validateAll()
        this.value.attributeName = this.addRowData.attributeName
        this.value.displayName = this.addRowData.displayName
        this.value.dataType = this.addRowData.valueType
    },
    computed: {
    },
    watch:{
        useFirstRowAsClassName(newVal, oldVal){
            this.addRowData.attributeName = this.useFirstRowAsClassName ? this.value.firstRowData : this.value.firstRowDataPinyin
            //this.addRowData.displayName = this.useSecondRowAsDisplayName ? this.value.secondRowData : (this.useFirstRowAsClassName? this.value.firstRowData : this.value.firstRowDataPinyin)
            //this.$refs.addRowForm.validate()
            this.validateAll()
            this.value.attributeName = this.addRowData.attributeName
            //this.value.displayName = this.addRowData.displayName
            this.value.dataType = this.addRowData.valueType
        },
        useSecondRowAsDisplayName(newVal, oldVal){
            //this.addRowData.attributeName = this.useFirstRowAsClassName ? this.value.firstRowData : this.value.firstRowDataPinyin
            this.addRowData.displayName = this.useSecondRowAsDisplayName ? this.value.secondRowData : this.addRowData.attributeName//(this.useFirstRowAsClassName? this.value.firstRowData : this.value.firstRowDataPinyin)
            //this.$refs.addRowForm.validate()
            this.validateAll()
            //this.value.attributeName = this.addRowData.attributeName
            this.value.displayName = this.addRowData.displayName
            this.value.dataType = this.addRowData.valueType
        }
    }
}
</script>
