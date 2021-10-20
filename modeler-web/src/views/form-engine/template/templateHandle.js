import { mapGetters, mapActions, mapMutations } from 'vuex';
import { uuid } from '@/util/assist'
import _ from 'lodash';
import { DWFADDINARGSVERSION } from "@/util/DWFVariable";
import { getAttributes } from "@/api/data-model/EntityModeling";
import { getRelation, getRelationAttributes } from "@/api/data-model/RelationModeling";
import singleColImg from "@/assets/images/view-template/single_col.png"
import doubleColImg from "@/assets/images/view-template/double_col.png"
import multiCardImg from "@/assets/images/view-template/multi_card.png"
import multiListImg from "@/assets/images/view-template/multi_list.png"
import {getClass, getView, getEobj} from "@/api/others"
import {cssArgs} from "./cssData.js"
// import templateData from "./json6.js"
// import mouldData1 from "./json1.js"
import mouldData from "./json3.js"
import {
  createViewTemplate,
  getViewTemplateAll
} from "@/api/view.js"
const borderConfig = {
    topBorder: {
      width: '0',
      color: '#000',
      style: 'dashed'
    },
    rightBorder: {
      width: '0',
      color: '#000',
      style: 'dashed'
    },
    bottomBorder: {
      width: '0',
      color: '#000',
      style: 'dashed'
    },
    leftBorder: {
      width: '0',
      color: '#000',
      style: 'dashed'
    },
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
};
export const templateHandle = {
    data() {
        return {
            generateId: {},
            // basicArgs: {},
            deviceType: 'actPc',
            deviceList: [
              {
                type: 'actPc',
                name: 'PC端'
              },
              {
                type: 'actPhone',
                name: '移动端'
              },
            ],
            views: [],//当前类下的表单
            jsonDataSingle: {},//单对象单列模板
            attrMap: {},//关联类：左类 右类 本类
            currentItem: {},//当前类信息
            originTemplateList: [],
            templateJsonData: {},
            bindAttributes: [],
            isRelation: false,
            targetClassName: '',
            displayName: '',
            note: '',
            viewName: '',
            formType: 'PC',
            childViewName: '',//子表单名称
            templateRelation: [],//关联类属性
            imgList: {
                'singleCol': singleColImg,
                'doubleCol': doubleColImg,
                'multiCard': multiCardImg,
                'multiList': multiListImg
            },
            templateViewData: {templateName: 'Blank'},//当前模板的信息
            dataAttr: [],
            selectAttr: [],
            leftClass: [],
            rightClass: [],
            fixedName: false,//按规则生成的表单
            addTemplateModal: false,
            addTemplateData: {},
            showIcon: false,
            iconnFile: {},
            formFinish: false,
            DefaultModuleBranch: false//是否开放新建模板按钮
        }
    },
    watch: {
        createModal(val) {
            if(val){
                this.templateViewData = {templateName: 'Blank'}
            } 
        },
        targetFormType(val) {
            // 建模工具链接formType
            val == 'Mobile' ? this.deviceType = 'actPhone' : ''
        }
    },
    created() {
        // 获取表单模板列表
      this.getTemplateAll()
    //   this.addTemplate()
    },
    computed: {
        templateList() {
            return this.originTemplateList.filter(item => {return item.deviceType == this.deviceType})
        }
    },
    methods: {
        ...mapActions("DWF_form", {
            UpdateFView: "updateFView"
        }),
        handleBeforeUpload (file) {

            const isJPG = (file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/jpeg');
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
            this.$Message.error('上传LOGO图片只能是 JPG/JPEG/PNG 格式!');
            }
            if (!isLt2M) {
            this.$Message.error('上传LOGO图片大小不能超过 2MB!');
            }

            if(isJPG && isLt2M) {

                var _self = this;
                if(window.FileReader) {

                    var fr = new FileReader();
                    fr.onloadend = function(e) {
                        _self.addTemplateData.icon = e.target.result;
                        // _self.$refs.appForm.validateField('extConfig.logoImg');
                        _self.showIcon = true;
                    };
                    fr.readAsDataURL(file);

                }
                this.iocnFile = file;

            }
            return !isJPG && isLt2M;

        },
        addTemplate() {
            let params = [
                // {
                //   deviceType: "actPc",
                //   displayName: "单对象单列表单",
                //   templateName: 'singleCol',
                //   icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACgCAMAAAB+IdObAAAAPFBMVEUAAADv7+/u7u7u7u7z8/P////v7+/u7u7////39/fd3d0tjPD5+fnv7+/9/f3n5+fy8vJlq/Tf39/n8v5W3ZWVAAAAB3RSTlMAkvPVKwa9zEb/gAAAAgpJREFUeNrtnVFugzAQRCHQOGlsEpL737WlldVUAsk/tnaf530D8mjFjndkycPGPE6n4JTTNM7DLx9jcM748aPjHNxz3pS4r8fGOAxzQDAzCrKVZAoIpsFt3/3PaQgQkEJSXC6OWGLaF5JcydhY0q6QeHFH3BXiriDfJdkVcnGIhFijgpAlXpsQl7pCrik0Il1rComhIbFYSLx/FnB/++AjNORRLGTTUaLk740UGpKKhTzLhDzfPtiU/iqC+UcwXatjH+E4e320aXRBXjtzQsTM7JgUBZNr+UZCrCEh1iB2LYyPYJzdXUGUxhtEQo7gzOyUFMVorvVabwWsr/y82aRxvRWx5ufNZr+3QvLzZtN4TEUw/wima3XsIxxnr482jS7Ia2dOiJiZHZOiYHIt30iINSTEGsSuhfERjLO7K4jSeINIyBGcmZ2SohjNtTDnfjEnsXU2vgU6G++5a3XsIxxnr482jS7Ia2dOiJiZHZOiYHIt30iINSTEGsSuhfERjLO7K4jSeINIyBGcmZ2SohjNtTBJIyb7VRrfAqXxnrtWxz7Ccfb6aNPogrx25oSImdkxKQom1/KNhFhDQqxB7FoYH8E4u7uCKI03iIQcwZnZKSmK0VwLkzRisl+l8S1QGu+5a3XsIxxnr0+Hm0bfcIRgLnbEXLWJufwUcx0toyQj6cpmzCXakGvNvwAT1r3q1p3BogAAAABJRU5ErkJggg==',
                //   v3Content: JSON.stringify(mouldData1)
                // },
                // {
                //   deviceType: "actPc",
                //   displayName: "单对象双列表单",
                //   templateName: 'doubleCol',
                //   icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACgCAMAAAB+IdObAAAAOVBMVEUAAADv7+/u7u7u7u7z8/P////v7+/////u7u739/fd3d35+fn9/f3n5+ctjPHy8vLf399lq/Tn8v5oFFnZAAAAB3RSTlMAkvPVKwa9zEb/gAAAAiZJREFUeNrtnUuOgzAQRCGQ2Ikhv/sfdoRnYScsiBR65HrTb4voqGK5q11Ccrcw9sMhinIY+rH75dhHcfpj1nGK8pwWJfLrsdB33RgRjIwFWZZkiAiGTrbvvnLoIgSmkDSFPZlSzBiXXwuZwt5M0b78WkgK+5P+rHxn8Y8VJvvyayHBAuPyLoQjZErnDV6brE3574Wc4wecQ8Gk/PdCUtxg1Wkty28LSfOlMFfv3eJH3MobluW3hcyXmnn13iblDcvy20Lul5r7N79kUv7/rQhmj2C6Ft9HOM7OmbVciE159gkRc2bHpCicXEsaF9IaLqQ1kF2L4iMYZ8fMWqFCevrNT1yImhDKmZ2SoqjlWpikEZP9ehrf2opg9gima/F9hOPsnFnLhXga72m8forCybWkcSGt4UJaA9m1KD6CcXbMrBUqpKff/MSFqAmhnNkpKYparmWcND4f18LjqZvGZx1FiW4af31FN41/WxHdNP5tj3ga7z5CcnbOrOVCPI33NF4/ReHkWtK4kNZwIa2B7FoUH8E4O2bWChXS029+4kLUhFDO7JQURS3Xwnz3i/kS27+Nb21FMHsE07X4PsJxds6s5UI8jfc0Xj9F4eRa0riQ1nAhrYHsWhQfwTg7ZtYKFdLTb37iQtSEUM7slBRFLdfCJI2Y7NfT+NZWBLNHMF2L7yMcZ+fMWgpCtOEIwVzsiLlqE3P5KeY6WsaS9KQrmzGXaEOuNf8BZc+7rAoo6psAAAAASUVORK5CYII=',
                //   v3Content: JSON.stringify(mouldData1)
                // },
                // {
                //   deviceType: "actPc",
                //   displayName: "多对象卡片",
                //   templateName: 'multiCard',
                //   icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACgCAMAAAB+IdObAAAAQlBMVEUAAADv7+/u7u7u7u7z8/P////v7+/////u7u7MzMz9/f36+vrz8/MtjPDa2trx8fHPz8/39/f19fXC3vtYpPQzkPES1xneAAAAB3RSTlMAkvPVKwa9zEb/gAAAAnlJREFUeNrtnd1uozAUhPlJe1ybYtIm7/+qK++iUGuJMULpsYf5rhIpc/FhYhvmwk3g0vadqZSuby/NP95aUznt21+Pd1M978Gk+vEItE1zMRBcMAYkDElvIOibaufdmK4xIGCKOCsVYd0zkao0AnZdxEl1uB8iFQ+IiF0VkQqhSGlQpDS2RJw3m3gnCyrZbRFnsnBLQiW7LeJNFn5JqGS3RUwGceJ3s+cbEZj/CMysVQ8UKQ2KlAZFSuM0IgcWtUN83+6fM/fbtzzw4/QxM43+5dv44x6fEQ8T/xHhX7xpPM4tFrnJzBiLjC/exh/nHovcZWaKRabzjQjMfwRm1qoHipQGRUoDu+iBqd7qGxKLXk9XDUVKgyKlQZHSoEhpAIs4u2eXUEZ2TcTKLmwJ2TURJztx+tlVESs7sfrZVRHZjX6WIhShCEVWcOP0eB8eTfr62X0iY9y0LOhns0QGc/2//prkB/rZHBEXFt30ldHPZouk71X9bI6IfPmrpNHPpkXcYCUL/WxSxGa3z/rZlIgNte4QPsgW+tmUyGACV3HmSzbQzyZE3Pztujy72cGYmPlm1s8+F7HeLHi7XKuYQQL62eciQzoX/1g/m73XSl8Z/WyuyMa9qp896fMIRShCESwRmHe/MG/jYfoRnMaqVihSGhQpDdxZC2UdgVnZYfZaMLtfilCEImcXYc/Onp09O3t2w56dPTt7dvbs7NnZs7Nn18+e9HmEIhShCJYIzLtfmLfxMP0ITmNVKxQpDYqUBu6shbKOwKzsMHstmN0vRShCkbOLsGf/rZ69w+jZu6bH6Nn7psXo2Vuc42gxzqNtkY5shjlEG+RY8z/eSrXKgpKA5wAAAABJRU5ErkJggg==',
                //   v3Content: JSON.stringify(mouldData)
                // },
                {
                  deviceType: "actPc",
                  displayName: "多对象列表",
                  templateName: 'multiList',
                  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACgCAMAAAB+IdObAAAANlBMVEUAAADv7+/u7u7u7u7z8/P////v7+/u7u7////z8/MtjPDMzMz6+vrC3vtYpPTX19czkPHPz8/rHSA0AAAAB3RSTlMAkvPVKwa9zEb/gAAAAedJREFUeNrs2duKAyEQRVH7klSZmL78/88OTkRahiGCdPpUWevdh80hRmgXzcM0klDjNMzu7TaQcMPtt+NO4t1jifg9osG5mVSYdQwSJ5lIhcmJvXdLoyMldIYEFiX8F8LiHEPE7hGFQ4jkQZgtBI2FoOkmJHj6yAc+uOBsRUigKoGzC87WhHiq4jm74GxNCFXi7Ltn+1tEzW9Eza0lh4WgsRA0FoKmm5CGP7Umr2V7JNvy4ozW/ZnsK3F20hOlveNRyCX0LJz9aGy3lCELJ2sZsnJy0jO+3VaGbJzsZcjObx0touY3oubWksNC0FgIGt0haj69CZxE++dp0SwEjYWgsRA0FoJGcYiId0r4FCLn5fgnROIeUaCSEzoIs4WgsRA0FoKmPsQTHF8fAt1xLKkPIUg9L4JY4vu+tcBZCJoOQ37au2MbhoEYCIJwxP47dsoSRvydDhYC/jLxyqsFdrTsnpYdVoimEM1sT7xaYEfL7mnZYYVoCtHM9sSrBXa07J6WHVaIphDNbE+8WmBHy+5p2WGFaArRzPbEqwV2tOyelh1WiKYQzWxPvFpgR8vuadlhhWgK0cz2xKsFdrTsnpYdVoimEM1sp3+581F3DjueObV55vjpmXO0Nz7J79LJ5jNHtI+cNf8DcJyp2PMtfp0AAAAASUVORK5CYII=',
                  v3Content: JSON.stringify(mouldData)
                },
            ]
            createViewTemplate(params).then(res => {
      
            })
          },
      
        // 点击空白处，取消模板选择
        wrapperClick(e) {
            if(e.target.parentElement.className.indexOf('template-list') == -1 && e.target.className.indexOf('template-list') == -1){
              this.templateViewData = {}
            }
        },
            // 生成模板表单
        async createTemplate(isRelation) {
            this.currentItem = this.currentData
            let targetClass = this.currentData.className
            let viewNameS = `${this.currentData.className}Single`
            let viewNameM = `${this.currentData.className}Multi`
            let displayNameS = '单对象表单'
            let displayNameM = '多对象表单'
            this.fixedName = true
            await this.handleTemplate(targetClass, viewNameS, displayNameS, isRelation, 'singleCol', '', 'PC')
            await this.handleTemplate(targetClass, viewNameM, displayNameM, isRelation, 'multiList', '', 'PC')
        },
        chooseDeviceType(ind) {

            if(ind == 0) {
                this.deviceType = 'actPc';
            } else {
                this.deviceType = 'actPhone';
            }
        },
        // 表单名称重复判断
        async viewNameCheck() {
            // 多对象卡片，父表单名称长度
            if(this.templateViewData.templateName && this.templateViewData.templateName === "multiCard"){
                if(this.createForm.viewName.length > 28){
                    this.$Message.error("卡片子表单名长度不能超过32位");
                    throw new Error('卡片子表单名长度不能超过32位');
                }
                let childViewName = `${this.viewName}Card`
                let res = await getView(this.targetClassName, childViewName, this.deviceType, 'PC');
                if(res.data.data){
                    this.$Message.error("表单名不能重复");
                    throw new Error('表单名不能重复');
                }
            }
            let res = await getView(this.targetClassName, this.viewName, this.deviceType, 'PC');
            if(res.data.data){
                this.$Message.error("表单名不能重复");
                throw new Error('表单名不能重复');
            }
        },
        createFormBaseMould (view) {
            this.templateViewData = view
        },
        getTemplateAll() {
            getViewTemplateAll().then(res => {
                let templateNameList = [
                    'Blank',
                    'singleCol',
                    'doubleCol',
                    'multiList',
                    'multiCard'
                ]
                let originTemplateList = []
                // 模板列表排序
                templateNameList.forEach(p => {
                    res.data.forEach(item => {
                        if(item.templateName === p){
                            originTemplateList.push(item)
                        }
                    })
                })
                this.originTemplateList = originTemplateList
                // res.data.forEach(item => {
                //     //   为卡片子表单保存模板
                //         if(item.templateName == 'singleCol'){
                //             this.jsonDataSingle = JSON.parse(item.v3Content)
                //         }
                // })
            }).catch(error => {
              this.$Message.error(error.response.data.message);
            });
        },
        async getAttributesFun(className, flag) {
            await getAttributes(className)
            .then(res => {
                if(flag == 'left'){
                    this.leftClass = res.data
                }else if(flag == 'right'){
                    this.rightClass = res.data
                }else{
                    this.bindAttributes = res.data;
                }
            })
            .catch(error => {
                this.$Message.error(error.response.data.message);
            });
        },
        async getRelAttributesFun(className) {
            await getRelationAttributes(className)
            .then(res => {
                this.bindAttributes = res.data;
            })
            .catch(error => {
                this.$Message.error(error.response.data.message);
            });
        },
        replaceTag(sign, content, isCardSingle, other) {
            let singleName =  `${this.targetClassName}Single`
            let btnBindList = ['新增', '编辑']
            function deepFunc(data) {
                for (let key in data) {
                    if (typeof data[key] == 'string' && data[key] == sign) {
                        data[key] = content
                    } else {
                        if (data[key] && data[key] !== null){
                            if (data[key].constructor === Object) {
                                // 多列表按钮绑定单对象表单
                                // if(other == 'addin_Operation' && data[key]['elementType'] == other){
                                //     let text = data[key]['properties']['text']
                                //     if(btnBindList.indexOf(text) > -1)data[key]['properties']['chooseTable'] = [singleName]
                                // }
                                deepFunc(data[key])
                            }
                            if (data[key].constructor === Array) {

                                let columnIndex = data[key].indexOf('${columnDefs}')
                                if(sign == '${columnDefs}' && columnIndex > -1){
                                    data[key].pop()
                                    data[key].push(...content)
                                }
                                
                                data[key].forEach(item => { deepFunc(item) })
                            }
                        }
                    }
                }
            }
            if(isCardSingle){
                deepFunc(this.jsonDataSingle)
            }else{
                deepFunc(this.templateJsonData)
            }
        },
        async insertAttributeComponent(attribute, target, type) {
            let prefixDict = {
                0: "",
                1: "relation_",
                2: "left_",
                3: "right_",
            }

            let displayName = (type == 2 ? this.templateRelation.leftRole + "的" : (type == 3 ? this.templateRelation.rightRole + "的" : "")) + attribute.displayName;
            let attributeName = prefixDict[type] + attribute.attributeName;
            // 默认布局属性
            let defaultArgs = {
                "label": displayName,
                "name": attributeName,
                "targetDataType": attribute.valueType,
                "dataDict": attribute.attrDict || ''
            };

            // 默认布局插件选择
            let transformDict = {
                "Integer": "NumberInput",
                "Long": "NumberInput",
                "Double": "NumberInput",
                "Boolean": "Switch",
                "String": "TextInput",
                "Clob": "TextInput",
                "UUID": "TextInput",
                "GUID": "TextInput",
                "Date": "DateInput",
                "TimeStamp": "DateInput",
                "LocalFile": "Attachments",
                "Timeseries": "TimeSeriesSelect",
                "Json": "MultiFilesList",
            };
            let attrComponent = ''
            if (attribute.defaultComponent) {
                attrComponent = attribute.defaultComponent
            } else {
                attrComponent = transformDict[attribute.valueType]
            }
            // 样式调整
            let args = cssArgs[attrComponent] ? cssArgs[attrComponent] : {}
            if(attrComponent == 'Switch')cssArgs['basicArgs']['txt_fontColor'] = ''
            // 绑定数据字典属性的数据字典editbox回填
            let hasDictList = ['RadioButton', 'CheckBox', 'SelectInput']
            if (hasDictList.indexOf(attrComponent) > -1 && attribute.attrDict) {
                defaultArgs.useDictionary = true
                defaultArgs.bindTargetClass = "DataDict&e"
                defaultArgs.labelAttr = ["label"]
                defaultArgs.valueAttr = ["key"]
                defaultArgs.filterQuery = `and obj.type = '${attribute.attrDict}'  and obj.key is not null order by  obj.order asc`
                let temList = await getEobj('DataDict', {
                    condition: defaultArgs.filterQuery,
                    startIndex: 0,
                    pageSize: 3
                });
                defaultArgs.list = temList.data.data;
            }

            if (attrComponent) {
                return {
                    self: {
                        elementType: `addin_${attrComponent}`,
                        properties: {
                            ...args,
                            ...cssArgs['basicArgs'],
                            ...defaultArgs,
                            id: this.generateID(attrComponent)
                        },
                        dropTarget: target,
                        uuid: uuid(),
                        DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                    },
                    elements: [],
                }
            }

        },
        generateID(type) {
            if (this.generateId[type]) {
              this.generateId[type] = parseInt(this.generateId[type]) + 1;
            } else {
              this.generateId[type] = 1
            }
            return `${type}${this.generateId[type].toString()}`;
        },
        async baseMouldCreate(mouldId, card) {
            let attributes = []
            // 表单显示勾选的
            if(this.isRelation){
                // let leftClass = _.clone(this.leftClass)
                // let rightClass = _.clone(this.rightClass)
                // let relation = _.clone(this.bindAttributes)
                let leftClass = JSON.parse(JSON.stringify(this.leftClass))
                let rightClass = JSON.parse(JSON.stringify(this.rightClass))
                let relation = JSON.parse(JSON.stringify(this.bindAttributes))
                // 关联类绑定属性的jsondata格式处理
                leftClass.forEach(item => {
                    item.displayName = `${this.templateRelation.leftClassDisplayName}的${item.displayName}`
                    item.attributeName = `left_${item.attributeName}`
                })
                rightClass.forEach(item => {
                    item.displayName = `${this.templateRelation.rightClassDisplayName}的${item.displayName}`
                    item.attributeName = `right_${item.attributeName}`
                })
                relation.forEach(item => {
                    item.attributeName = `relation_${item.attributeName}`
                })

                attributes = [...leftClass, ...relation, ...rightClass].filter(item => {return item.isInForm})
            }else{
                attributes = this.bindAttributes.filter(item => {return item.isInForm})
            }
            let cols = parseInt(mouldId)
            // 获取选择的属性对象列表
            let selected_attributes = [];
            // 快速创建允许的类型
            let allowType = ['Integer', 'Long', 'Double', 'Boolean', 'String', 'Clob', 'UUID', 'GUID', 'Date', 'TimeStamp', 'LocalFile', 'Timeseries', 'Json'];
            attributes.forEach(attr => {
                if (allowType.includes(attr.valueType)) {
                    selected_attributes.push(attr)
                }
            });

            //生成dropTarget列表
            let dropTargetList = [];
            let selectedAttributesAddin = [];
            let count = 0;
            for (let i = 0; i < Math.ceil(selected_attributes.length / cols); i++) {
                for (let index = 1; index <= cols && count < selected_attributes.length; index++) {
                    count++;
                    dropTargetList.push(`1,${index}`);
                }
            };
            
            // 插入属性控件
            for(var j = 0,len = selected_attributes.length; j < len; j++){
                selectedAttributesAddin.push(await this.insertAttributeComponent(selected_attributes[j], dropTargetList[j], 0))
            }
            let rowList = []
            let currentargs = {}
            if(mouldId == 1) {
                currentargs = {
                    ...cssArgs['Col'],
                    rows: 1,
                    cols: 1
                }
            }else{
                currentargs = {
                    ...cssArgs['Row'],
                    rows: 1,
                    cols: 2
                }
                currentargs = _.clone(this.rowRefresh(currentargs))
            }
            //生成所有行控件
            // if (mouldId == 1 || mouldId == 2) {
                for (let i = 0; i < Math.ceil(selected_attributes.length / cols); i++) {
                    let row = {
                        self: {
                            elementType: cols == 1 ? `addin_col` : `addin_row`,
                            properties: {
                                ...currentargs
                            },
                            dropTarget: 0,
                            uuid: uuid(),
                            DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                        },
                        elements: selectedAttributesAddin.splice(0, cols),
                    };
                    rowList.push(row);
                    //修改jsonData
                    // if (activeUUID !== 'root') {
                    //   this.insertJsonDataByUUID(this.jsonData.data, activeUUID, rowList);
                    // } else {
                    // this.jsonData.data.elements = rowList;
                    // }
                };
                if(card){
                    this.replaceTag("${elements}", rowList, true);
                    // 子表单,单对象单列表单
                    this.childViewName = `${this.viewName}Card`
                    
                    await this.saveTemplateForm(this.childViewName, 'child')
                }else{
                    this.replaceTag("${elements}", rowList);
                }
            // }
            // this.basicArgs.cols = mouldId
            // this.updateMargin()
        },
        rowRefresh(args) {
            args.iRows = []
            var id = null;
            var _id = null;
            for (var i = 0; i < args.rows; i++) {
              id = "" + (i + 1);
              args.iRows.push({id: id});
              args.children[id] = {
                id: id,
                type: args.type,
                align: args.align,
                justify: args.justify,
                cols: args.cols,
              }
              args.iCols[id] = []
              for (var i = 0; i < args.children[id].cols; i++) {
                _id = id + "," + (i + 1);
                args.iCols[id].push({id: _id});
                args.children[_id] = {
                  id: _id,
                  hideWidgetAnnotation: true,
                  span: parseInt(24 / args.children[id].cols),
                  offset: 0,
                  push: 0,
                  pull: 0,
                  col: false,
                  ...borderConfig
                }
              }
            }
          return args
          },
        async multiMouldCreate(templateId){
            
            let [className, belongClass, attrName, label] = ['', '', '']
            if(this.isRelation){
                // let attrMap = await this.getAttrMap()
                let attrMap = this.attrMap
                for(let key in attrMap){
                    switch(key) {
                        // case 'repeat':
                        //     attrMap[key].forEach((z,index) => {
                        //         belongClass = `重复属性(${z.repeatList.join(',')})`
                        //         attrName = `${z.attributeName}&${z.displayName}`
                        //         label = `${z.displayName}`
                        //         this.dataAttrHandle(z, index, belongClass, attrName, label, true)
                        //     })
                        //     break
                        case 'left':
                            attrMap[key].forEach((z,index) => {
                                className = `left_${this.templateRelation.leftClass}`
                                belongClass = `left_${this.templateRelation.leftClass}(左${this.templateRelation.leftClassDisplayName})`
                                attrName = `${z.attributeName}&${z.displayName}`
                                label = `左${this.templateRelation.leftClassDisplayName}.${z.displayName}`
                                this.dataAttrHandle(z, index, z.order, className, belongClass, attrName, label, false)
                            })
                            break
                        case 'right':
                            attrMap[key].forEach((z,index) => {
                                className =  `right_${this.templateRelation.rightClass}`
                                belongClass = `right_${this.templateRelation.rightClass}(右${this.templateRelation.rightClassDisplayName})`
                                attrName = `${z.attributeName}&${z.displayName}`
                                label = `右${this.templateRelation.rightClassDisplayName}.${z.displayName}`
                                this.dataAttrHandle(z, index, z.order, className, belongClass, attrName, label, false)
                            })
                            break
                        case 'relation':
                            attrMap[key].forEach((z,index) => {
                                className = this.targetClassName
                                belongClass = `${this.targetClassName}(${this.currentItem.displayName})`
                                attrName = `${z.attributeName}&${z.displayName}`
                                label = `${this.currentItem.displayName}.${z.displayName}`
                                // label = `关联类.${z.displayName}`
                                this.dataAttrHandle(z, index, z.order, className, belongClass, attrName, label, false)
                            })
                            break
                    }
                }
            }else{
                
                this.bindAttributes.forEach((z, index) => {
                    belongClass = `${this.targetClassName}(${this.currentItem.displayName})`
                    attrName = `${z.attributeName}&${z.displayName}`
                    label = `${this.currentItem.displayName}.${z.displayName}`
                    this.dataAttrHandle(z, index, z.order, this.targetClassName, belongClass, attrName, label, false)
    
                })

            }
            
            this.replaceTag('${selectAttr}', this.selectAttr)
            this.replaceTag('${dataAttr}', this.dataAttr)
            if(templateId == 3){
                this.gridHandle()
            }else if(templateId == 4){
                this.formEngineHandle()
            }

        },
        formEngineHandle() {
            this.replaceTag('${viewName}', this.childViewName)
        },

        gridHandle() {
            // 表格属性绑定
            let selected_attributes = {
                'left': [],
                'right': [],
                'relation': []
            }
            let defs = []
            let attrMap = this.attrMap
            if(this.isRelation){
                let prefix_relation = {
                    "left": "left_",
                    "relation": "relation_",
                    "right": "right_"
                };
                let headerName_prefix = {
                    "left": this.templateRelation.leftRole ? `${this.templateRelation.leftRole}的` : '',
                    "relation": this.templateRelation.relationRole ? `${this.templateRelation.relationRole}的` : '',
                    "right": this.templateRelation.rightRole ? `${this.templateRelation.rightRole}的` : ''
                };
                for(let key in attrMap){
                    if(key !== 'repeat'){
                        attrMap[key].filter(item => {return item.isInTable}).forEach(attr => {
                            selected_attributes[key].push(attr.attributeName)
                            defs = this.defsFun('relation', defs, attr, prefix_relation, key, headerName_prefix)
                        })
                    }
                }
            }else{
                selected_attributes = []
                this.bindAttributes.filter(item => {return item.isInTable}).forEach(attr => {
                    defs = this.defsFun('obj', defs, attr)
                    selected_attributes.push(attr.attributeName)
                })
            }
            this.replaceTag('${columnDefs}', defs)
            // this.replaceTag(null, null, null, 'addin_Operation')
            this.replaceTag('${selected_attributes}', selected_attributes)
        },
        dataAttrHandle(z, index, order, className, belongClass, attrName, label, isRepeat) {
            let AttTemplate = {
                belongClass: belongClass,
                attrName: attrName,
                attrType: z.queryBoxDisplayType || 'TextInput',
                valueType: z.valueType,
                defaultValue: '',
                index: index,
                attrNum: order,
                className: className,
                label: label,
                _checked: z.isInQueryBox || false
            }
            this.dataAttr.push(AttTemplate)
            if(z.isInQueryBox){
                this.selectAttr.push(AttTemplate)           
            }
        },
        async getAttrMap() {
            let res = {};
            // await this.getAttributesFun(this.currentItem.leftClass, 'left');
            // await this.getAttributesFun(this.currentItem.rightClass, 'right');
            res['left'] = this.leftClass
            res['right'] = this.rightClass
            res['relation'] = this.bindAttributes
            // res['repeat'] = []
            // let keyObj = {}
            // let repeatKeyName = ''
            // for(let key in res){
            //     key == 'relation' ? 
            //     repeatKeyName = `${res[key].attributeName}` : 
            //     repeatKeyName = `${key}_${res[key].attributeName}`

            //     // 如果属性名称的key存在
            //     if(keyObj[res[key].attributeName]){

            //         keyObj[res[key].attributeName].push(repeatKeyName)

            //         res['repeat'].push({
            //             ...res[key], 
            //             repeatList: keyObj[res[key].attributeName]
            //         })
            //     }else{
            //         keyObj[res[key].attributeName] = [repeatKeyName]
            //     }
                
            // }
            return res;
        },
        defsFun(select_type, defs, attr, prefix_relation, direc, headerName_prefix) {
            let [field, headerName, colId] = 
            [attr.attributeName, attr.displayName, attr.attributeName + "_id"]
            if(select_type == 'relation'){
                field = prefix_relation[direc] + attr.attributeName
                headerName = headerName_prefix[direc] + attr.displayName
                colId = prefix_relation[direc] + attr.displayName + "_id"
            }
            let defsMould = {
                field: (attr.attrDict ? 'label%ref%' : '') + field,//label%ref%area
                attrCategory: attr.attributeCategory,
                attrName: attr.attributeName,
                attrValueType: attr.valueType,
                headerName: headerName,
                editable: false,
                suppressMovable: false,
                width: 200,
                widthPercent: 0,
                widthType: 'px',
                uuid: attr.id,
                colId: colId,
                // TODO: 在这里将GridFilter添加到表格中
                // filterFramework: GridFilter,
                // filterParams: this.getFilterParams(),
                headerClass: "grid-header-left",
                alignCode: 1,
                enableFilter: true,
                resizable: true,
                compactMode: false,
                menuTabs: ['filterMenuTab'],
                cellStyle: {
                    "text-align": "left",
                    "line-height": "40px;"
                },
                _cellRendererFramework: (attr.valueType == "Date" || attr.valueType == "TimeStamp") ? "timeTransferRender" : null
            }
            // 表格列定制面板数据字典
            if(attr.attrDict){
                defsMould.refClass = "DataDict"
                defsMould.attrDict = attr.attrDict
                defsMould.refClassType = "obj"
                defsMould.browseAttr = "key"
                defsMould.returnAttr =  ["label"]
                defsMould.oriField = field
                defsMould.targetCondition = `and obj.type = '${attr.attrDict}'  and obj.key is not null order by  obj.order asc`
                defsMould.filterQuery = `and obj.type = '${attr.attrDict}'  and obj.key is not null order by  obj.order asc`
            }
            defs.push(defsMould);
            return defs
          },
        // 模板属性绑定
        async handleTemplate(targetClassName, viewName, displayName, isRelation, templateName, note, fType) {
            this.targetClassName = targetClassName;
            this.isRelation = isRelation;
            this.formType = fType;
            this.viewName = viewName;
            this.note = note;
            this.displayName = displayName;
            await this.viewNameCheck()
            // 实体类上生成表单按钮
            // if(templateName){
            if(this.fixedName){
                this.templateViewData = this.templateList.filter(item => {return item.templateName == templateName})[0]
            }
            if(!this.templateViewData.templateName || this.templateViewData.templateName == 'Blank')return
            // 重置子表单模板
            this.originTemplateList.forEach(item => {
                //   为卡片子表单保存模板
                    if(item.templateName == 'singleCol'){
                        this.jsonDataSingle = JSON.parse(item.v3Content)
                    }
            })
            this.dataAttr = [];
            this.selectAttr = [];
            this.templateJsonData = JSON.parse(this.templateViewData.v3Content)
            // this.jsonData = templateData
            this.replaceTag('${targetClass}', targetClassName)

            let treeListLen = 0
            if(isRelation){
                this.replaceTag('${bindTargetClass}', `${targetClassName}&r`)
                this.replaceTag('${select_type}', 'relation')
                this.templateRelation = this.currentItem
                await getClass(this.currentItem.leftClass).then(res => {
                    this.currentItem.leftClassDisplayName = res.data.data.displayName
                })
                await getClass(this.currentItem.rightClass).then(res => {
                    this.currentItem.rightClassDisplayName = res.data.data.displayName
                })
                await this.getRelAttributesFun(targetClassName)
                await this.getAttributesFun(this.currentItem.leftClass, 'left');
                await this.getAttributesFun(this.currentItem.rightClass, 'right');

                this.attrMap = await this.getAttrMap()
                // 关联目录树，实体类class替换
                this.replaceTag('${leftClass}', this.currentItem.leftClass)
                treeListLen = 1
            }else{
                this.replaceTag('${bindTargetClass}', `${targetClassName}&e`)
                this.replaceTag('${select_type}', 'obj')
                await this.getAttributesFun(targetClassName)
                //实体类的目录树构建，需要存在parentOid属性（开启是否树）
                this.bindAttributes.forEach(item => {
                    if(item.attributeName == "parentOid"){
                        treeListLen = 1
                    }
                })
            }

            // 左树右表，表格属性替换
            // this.gridHandle()
            // //目录树treeList长度不为0，可自动渲染
            // treeListLen ? this.replaceTag('${treeList}', [{a: 1}]) : this.replaceTag('${treeList}', [])

            let templateId = ''
            switch (this.templateViewData.templateName) {
                case 'singleCol':
                    templateId = 1
                    break
                case 'doubleCol':
                    templateId = 2
                    break
                case 'multiList':
                    templateId = 3
                    break
                case 'multiCard':
                    templateId = 4
                    break
            }
            this.templateJsonData.data.targetClass = targetClassName
            this.templateJsonData.data.isRelation = isRelation
            this.templateJsonData.data.deviceType = 'actPc';
            if (templateId == 1 || templateId == 2) {
                await this.baseMouldCreate(templateId)
            } else if(templateId == 3) {
                await this.multiMouldCreate(templateId)
            } else if(templateId == 4) {
                
                this.jsonDataSingle.data.targetClass = targetClassName
                this.jsonDataSingle.data.isRelation = isRelation
                this.jsonDataSingle.data.deviceType = 'actPc';
                await this.baseMouldCreate(1, 'Card')
                
                await this.multiMouldCreate(templateId)
            }
            await this.saveTemplateForm(viewName)
        },
        async saveTemplateForm(viewName, isChild) {
            let res = await getView(this.targetClassName, viewName, 'actPc', 'PC');
            if (res.data.data) {
                this.$Message.warning(`${viewName}表单已创建`)
                return
            }
            var params = {
                className: this.targetClassName,
                hasThumbnail: false,
                v3Content: isChild ? JSON.stringify(this.jsonDataSingle) : JSON.stringify(this.templateJsonData),
                viewName: viewName,
                displayName: this.displayName,
                note: this.note,
                isRelation: this.isRelation,
                deviceType: 'actPc',
                formType: this.formType,
                basicInfo: '',
                widgetAnnotation: '',//控件批注
            };
            // 先创建模板
            let flag = await this.UpdateFView(params);
            if (flag == 0) {
                this.$Message.error("保存表单失败");
              } else if (flag == 2) {
                this.$Message.success("创建表单成功");
                this.formFinish = true
              } else if (typeof flag === 'string'){
                this.$Message.error(flag);
              }
        }
    }
}