<template>
    <div>
        <Form ref="addRowForm" 
            :model="addRowData" 
            :rules="rowValidate" 
            style="margin: 10px 15px 5px;" 
            label-position="top"
            >
            <FormItem :style="styleStr1" @blur.native.capture="validateClassName" label="英文名" prop="className">
                <Input v-model="addRowData.className" placeholder="输入英文名" id="createEntityModalClassName" ></Input>
            </FormItem>
            <FormItem :style="styleStr2" @blur.native.capture="validateDisplayName"  label="显示名" prop="displayName">
                <Input v-model="addRowData.displayName" placeholder="输入显示名" id="createEntityModalDisplayName"></Input>
            </FormItem>
            <FormItem :style="styleStr3" @blur.native.capture="validateZoneName"  label="数据库表前缀" prop="zoneName">
                <Input v-model="addRowData.zoneName" placeholder="输入数据库表前缀" id="createEntityModalZoneName"></Input>
            </FormItem>
            <FormItem label="是否树" prop="isTree">
                <i-switch v-model="addRowData.isTree" />
            </FormItem>
        </Form>
    </div>
</template>

<script>

const name = "AddIntityItemClassForm";
import {checkClassNameValid} from "@/api/quickstart.js"
export default {
    name: name,
    props: ['value', 'sheetIndex'],
    data() {
        const classNameValidator =  async (rule, value, callback) => {
            let res = await checkClassNameValid(value)
            if(!res.data.data.valid) {
                callback(new Error(res.data.data.cause))
            } else {
                callback()
            }
        };
        return {
            name : name,
            styleStr1:"",//"height:75px;" when has error
            styleStr2:"",
            styleStr3:"",
            addRowData: {
                className: "",
                displayName: "",
                zoneName: "CUS",
                isTree: false
            },
            rowValidate: {
                className: [
                    { required: true, message: "英文名不能为空", trigger: "blur" },
                    {
                        pattern: /^[A-Za-z][A-Za-z0-9]{0,31}$/,
                        message: "英文名只能包含字母和数字，并以字母开头，长度不超过32个字符",
                        trigger: "blur"
                    },
                    {
                        validator: classNameValidator, trigger: 'blur'
                    },
                ],
                displayName: [
                    { required: true, message: "显示名不能为空", trigger: "blur" },
                    {
                        // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
                        // message: "显示名只能包含汉字、字母、数字或下划线",
                        pattern: /^\S{1,32}$/,
                        message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
                        trigger: "blur"
                    }
                ],
                zoneName: [
                    { required: true, message: "数据库表前缀不能为空", trigger: "blur" },
                    {
                        pattern: /^[a-zA-Z]{1,20}$/,
                        message: "数据库表前缀只能包含字母,长度不超过20个字符",
                        trigger: "blur"
                    }
                ]
            },
        }
    },
    computed:{
    },
    mounted(){
        this.addRowData = this.value
        //this.$refs.addRowForm.validate()
        this.validateClassName()
        this.validateDisplayName()
        this.validateZoneName()
    },

    methods:{
        isValidate(){
            return this.$refs["addRowForm"].validate(valid => {
                return valid
            })
        },
        getIndexInfo(){
            return this.sheetIndex
        },
        validateClassName(){
            this.$refs.addRowForm.validateField("className", err =>{
                if(err){
                    this.styleStr1="height:90px;"
                }else {
                    this.styleStr1=""
                }
            })

        },
        validateDisplayName(){
            this.$refs.addRowForm.validateField("displayName", err =>{
                if(err){
                    this.styleStr1="height:90px;"
                }else {
                    this.styleStr1=""
                }
            })
        },
        validateZoneName(){
            this.$refs.addRowForm.validateField("zoneName", err =>{
                if(err){
                    this.styleStr1="height:90px;"
                }else {
                    this.styleStr1=""
                }
            })
        }
    }
}
</script>