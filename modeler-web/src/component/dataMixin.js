import AttributesLib from "../api/data-model/AttributesLib";
import {entries as form_entries} from "@/ext_components/form/config.js";
export const dataMixin = {
    data() {
        return {
            // 控件和数据类型的对应关系
            controlByTypeList: {
                'Default': [
                  '文本框', '数字框', '日期框', '单选框', '复选框', '选择框',
                  '富文本', '文本标签', '对象标签', '上传文件', '多文件上传', '进度条',
                  '超链接', '开关', '评分', '点赞', '图标', '动态参数',
                  '级联点选', '组织用户', '类属性点选器', '表单模型', '时序点选'
                ],
                'UUID': [
                  '文本框', '选择框', '文本标签', '对象标签', '图标', '级联点选', '组织用户'
                ],
                'String': [
                  '文本框', '单选框', '复选框', '选择框', '富文本', '文本标签',
                  '对象标签', '上传文件', '多文件上传', '超链接', '图标', '动态参数', '级联点选',
                  '组织用户', '类属性点选器', '表单模型'
                ],
                'Integer': [
                  '数字框', '单选框', '选择框', '文本标签',
                  '对象标签', '进度条', '评分', '级联点选', '动态数字'
                ],
                'Long': [
                  '数字框', '单选框', '选择框', '文本标签',
                  '对象标签', '进度条', '级联点选', '动态数字'
                ],
                'Double': [
                  '数字框', '单选框', '选择框', '文本标签',
                  '对象标签', '进度条', '评分', '级联点选', '动态数字'
                ],
                'Date': [
                  '日期框', '文本标签'
                ],
                'Time': [],
                'TimeStamp': [
                  '日期框', '文本标签'
                ],
                'Boolean': [
                  '单选框', '文本标签', '对象标签', '开关', '点赞'
                ],
                'LocalFile': [
                  '文本框', '文本标签', '上传文件'
                ],
                'Clob': [
                  '文本框', '富文本', '文本标签',
                  '多文件上传', '图标', '级联点选',
                  '类属性点选器', '表单模型'
                ],
                'Json': [
                  '多文件上传', '动态参数'
                ],
                'Timeseries': [
                  '时序点选'
                ]
            },
            singleControl: [],//单对象控件
            attrDict: [],//数据字典
            // 查询方式
            attrItems: [
                {
                    value: 'TextInput',
                    label: '文本模糊查询'
                },
                {
                    value: 'NumberInput',
                    label: '数值查询'
                },
                {
                    value: 'NumbersInput',
                    label: '数值范围查询',
                },
                {
                    value: 'DateInput',
                    label: '日期查询'
                },
                {
                    value: 'DateSInput',
                    label: '日期范围查询'
                },
                {
                    value: 'SelectInput',
                    label: '下拉框'
                },
                {
                    value: 'SelectMutiInput',
                    label: '多选下拉框'
                },
                {
                    value: 'DSelectInput',
                    label: '动态选择框',
                },
                // {
                //     value: 'SingleObjectSelectors',
                //     label: '对象选择框'
                // },
                {
                    value: 'Switch',
                    label: '开关选择框'
                }
            ],
            addAttributeData: {
                attributeName: "",
                displayName: "",
                valueType: "String",
                valueLength: 50,
                nullable: true,
                defaultValue: '',
                order: 100,
                defaultComponent: null,
                attrDict: null,
                queryBoxDisplayType: null,
                isInTable:true,
                isInQueryBox: true,
                isInForm: true
            },
            defaultAddAttributes: {
                attributeName: "",
                displayName: "",
                valueType: "String",
                valueLength: 50,
                nullable: true,
                defaultValue: null,
                order: 100,
                defaultComponent: null,
                attrDict: null,
                queryBoxDisplayType: '',
                isInTable:true,
                isInQueryBox: true,
                isInForm: true
            },
            isSysType: false,
            SYSENTITYATTRIBUTES: ['currentProcess', 'oid', 'owner', 'id', 'lastModifyTime', 'lastModifier',
             'createTime', 'creator', 'parentOid'
            ],
            SYSRELATIONATTRIBUTES: ['oid', 'lastModifier', 'rightRev', 'leftClass', 'order', 'rightClass', 'leftOid',
             'rightOid', 'lastModifyTime', 'version', 'createTime', 'creator', 'parentOid'
            ],
            dictDisabled: false//数据字典是否禁用
        }
    },
    watch: {
        //监听数据类型的变化，过滤控件
        changeAddCheckbox: {
            handler(val) {
                let threeObj = {
                    isInTable: true,
                    isInQueryBox: true,
                    isInForm: true
                }
                if(this.$options.name.indexOf('entity') > -1) {
                    // 系统属性，不显示后三个选项
                    if(this.SYSENTITYATTRIBUTES.indexOf(val.attributeName) > -1){
                        this.isSysType = true
                    } else {
                        this.isSysType = false
                    }
                }else if(this.$options.name.indexOf('relation') > -1){
                      // 系统属性，不显示后三个选项
                    if(this.SYSRELATIONATTRIBUTES.indexOf(val.attributeName) > -1){
                        this.isSysType = true
                    } else {
                        this.isSysType = false
                    }
                }
                // 选择属性库已有属性的兼容处理
                if(this.isSysType){
                  !this.addAttributeData.isInTable ? this.addAttributeData.isInTable = false : ''
                  !this.addAttributeData.isInQueryBox ? this.addAttributeData.isInQueryBox = false : ''
                  !this.addAttributeData.isInForm ? this.addAttributeData.isInForm = false : ''
                }else{
                  !this.addAttributeData.isInTable ? this.addAttributeData.isInTable = true : ''
                  !this.addAttributeData.isInQueryBox ? this.addAttributeData.isInQueryBox = true : ''
                  !this.addAttributeData.isInForm ? this.addAttributeData.isInForm = true : ''
                }
            },
            immediate: true
        },
        'currentAttribute.attributeName': {
            handler(val) {
                if(this.$options.name.indexOf('entity') > -1) {
                    // 系统属性，不显示后三个选项
                    if(this.SYSENTITYATTRIBUTES.indexOf(val) > -1){
                        this.isSysType = true
                    } else {
                        this.isSysType = false
                    }
                }else if(this.$options.name.indexOf('relation') > -1){
                  // 系统属性，不显示后三个选项
                if(this.SYSRELATIONATTRIBUTES.indexOf(val) > -1){
                    this.isSysType = true
                } else {
                    this.isSysType = false
                }
            }
            },
            immediate: true
        },
        //监听数据类型的变化，过滤控件
        changeAddType: {
            handler(val) {
              this.getControl(val.valueType)
              this.hasDataDict(val.valueType)
            },
            immediate: true
        },
        'currentAttribute.valueType': {
            handler(val) {
              if(val) {
                this.getControl(val)
                this.hasDataDict(val)
              }
            },
            immediate: true
        },
        editAttribute(val) {
          (val && this.currentAttribute) ? this.hasDataDict(this.currentAttribute.valueType) : ''
        },
        'addRowData.valueType': {
            handler(val) {
              if(val) {
                this.getControl(val)
                this.hasDataDict(val)
              }
            },
            immediate: true
        }
    },
    computed: {
      changeAddType() {
          const {addAttributeData, addAttribute} = this
          return {
            valueType: addAttributeData.valueType, addAttribute
          }
      },
      changeAddCheckbox() {
          const {addAttributeData, addAttribute} = this
          return {
            attributeName: addAttributeData.attributeName, addAttribute
          }
      },
    },
    mounted() {
      // 数据字典
      AttributesLib.getDicts().then(res => {
        this.attrDict = res.data;
      });
      this.$nextTick(() => {
        let list = document.querySelectorAll('.attrDict .ivu-select-dropdown')
        list.forEach((item) => {
          item.style.width = '100%'
        })
      })
    },
    methods: {
        addAttrBlur(flag) {
            if(flag === 'addAttributeData')this.addAttributeData.displayName ? '' :this.addAttributeData.displayName  = this.addAttributeData.attributeName
            if(flag === 'addRowData')this.addRowData.displayName ? '' :this.addRowData.displayName  = this.addRowData.attributeName
        },
        // 根据数据类型过滤控件
        getControl(type) {
            this.singleControl = []
            form_entries.forEach(x => {
                if(this.controlByTypeList[type].indexOf(x.note) > -1)this.singleControl.push(x)
            });
        },
        hasDataDict(type) {
          // 可以设置数据字典的数据类型
          let hasDataDictList = ['Integer', 'String', 'Long', 'UUID', 'Boolean']
          if(hasDataDictList.indexOf(type) > -1){
            this.dictDisabled = false
          }else{
            debugger
            this.dictDisabled = true
            this.addAttributeData ? this.addAttributeData.attrDict = null : ''
            this.currentAttribute ? this.currentAttribute.attrDict = null : ''
            this.addRowData ? this.addRowData.attrDict = null : ''
          }
        }
    }
}