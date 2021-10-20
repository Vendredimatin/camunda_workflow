<template>
    <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <span :style="{'position': 'relative','top':'-2px', 'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <Cascader class="i-input" :data="args.treeList" :load-data="loadData" :change-on-select="args.labelSwitch" :transfer="true" :filterable="args.searchSwitch" :render-format="cascaderFormat" :style="{ 'width': '100%', 'height': arg_height, 'color': args.txt_fontColor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"></Cascader>
            </span>
        </span>

        <!-- 树型数据编辑弹窗 -->

        <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name"
                :widgetAnnotation="widgetAnnotation"
                ref="editbox"
                v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <p class="margin1">实体类</p>
                    <Select class="margin1 editbox-targetClass" v-model="args.targetClass" filterable clearable @on-change="changeClass" @on-clear="clearTargetClass">
                        <OptionGroup label="实体类">
                          <Option v-for="item in all_class" :key="item.id" :value="item.className" :label="item.displayName">
                              <span style="font-size: 12px;">{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc;font-size: 12px;">{{ item.className }}</span>
                          </Option>
                        </OptionGroup>
                        <OptionGroup label="外部实体类">
                          <Option v-for="item in allExternalEntities" :key="item.id" :value="item.className" :label="item.displayName">
                              <span style="font-size: 12px;">{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc;font-size: 12px;">{{ item.className }}</span>
                          </Option>
                        </OptionGroup>
                    </Select>
                    <p class="margin1">关联属性</p>
                    <Select ref="labelAttrSelect" class="margin1 editbox-join-cascader-tree" v-model="args.relationAttr" filterable clearable>
                        <OptionGroup label="系统属性">
                        <Option v-for="(attr, index) in targetClassAttributes.sysAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                        <OptionGroup label="类属性">
                        <Option v-for="(attr, index) in targetClassAttributes.selfAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                    </Select>
                    <p class="margin1">浏览字段</p>
                    <Select ref="labelAttrSelect" class="margin1 editbox-join-cascader-tree" v-model="args.labelData" filterable multiple clearable>
                        <OptionGroup label="系统属性">
                        <Option v-for="(attr, index) in targetClassAttributes.sysAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                        <OptionGroup label="类属性">
                        <Option v-for="(attr, index) in targetClassAttributes.selfAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                    </Select>
                    <p class="margin1">回填字段</p>
                    <Select ref="labelAttrSelect" class="margin1 editbox-join-cascader-tree" v-model="args.valueData" filterable :multiple="args.noNumber" clearable>
                        <OptionGroup label="系统属性">
                        <Option v-for="(attr, index) in numSysAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                        <OptionGroup label="类属性">
                        <Option v-for="(attr, index) in numSelfAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                    </Select>

                    <p class="margin1">根节点查询条件</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.rootQuery" @on-focus="setLable(3)" />
                    <p class="margin1">子节点查询条件</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.childrenQuery" @on-focus="setLable(4)" />

                    <div class="margin1" style="margin: 10px 0;">
                        懒加载
                        <i-switch style="float: right" v-model="args.lazySwitch" />
                    </div>
                    <div v-show="!args.lazySwitch" class="margin1" style="margin: 10px 0;">
                        搜索
                        <i-switch style="float: right" v-model="args.searchSwitch" />
                    </div>
                    <div class="margin1" style="margin: 10px 0;">
                        显示路径
                        <i-switch style="float: right" v-model="args.labelSwitch" :disabled="!args.noNumber" />
                    </div>
                    <div class="margin1" style="margin: 10px 0;">
                        回填路径
                        <i-switch style="float: right" v-model="args.pathSwitch" :disabled="!args.noNumber" />
                    </div>
                    <Row class="margin1">
                        <Col span="10">
                            <Button type="primary" @click="updateTree">更新预览</Button>
                        </Col>
                    </Row>
                    <!-- <p class="margin1">回填格式</p>
                    <RadioGroup v-model="args.rerurnPath">
                        <Radio label="节点路径"></Radio>
                        <Radio label="所选节点"></Radio>
                    </RadioGroup> -->
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>

        <!-- 根子节点过滤条件组件  -->
        <FilterQueryCommonModal
            v-if="actEdit" :addinName="name"
            :args="args"
            :itemValue="itemValue"
            :refClass="`${args.targetClass}&e`"
            :targetClass="itemValue.data.targetClass"
            ref="filterQuery_modal"
            :root="root"
            :store="store"
            @generatorFilterQuery="getFilterQuery">
        </FilterQueryCommonModal>
    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6c5;</i>
            </div>
            <div class="form-addin-name">
                目录点选
            </div>
        </span>
    </section>
</template>

<script>

import EditBox from "./_EditBox.vue"
import FilterQueryCommonModal from './subcomponent/FilterQueryCommonModal'
import { mapGetters } from "vuex";
import { getSelfJoinEobj, getAllEntities } from '@/api/others';
import { getAttributeBindClasses } from "@/api/data-model/AttributesLib";
import { getAttributes, getExternalEntities } from "@/api/data-model/EntityModeling";
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js'
const name = "JoinCascaderTree";

export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "query_oprs", "route", "router", "attributes", "edit", "store", "relation", "root"],
    data() {
        return {
	        times: 0,
            name: name,

            args_name: "",

            t_preview: true,
            t_edit: false,
            firstLoad: true,
            all_class: [],
          allExternalEntities: [],
            targetClassAttributes: {
                sysAttr: [],
                selfAttr: []
            },

            filterStatus: '3',   // 当前正在设置父或子的过滤条件


      actEdit: false,
      args: {
                dynamic: false,     // 动态响应
                label_fontColor: 'initial',       // 标签文字颜色
                txt_fontColor: 'initial',         // 内容文字颜色
                lfsize: 14,                       // 标签文字大小
                lfsizeType: 'px',                 // 标签文字大小单位
                fsize: 14,                        // 内容文字大小
                fsizeType: 'px',                  // 内容文字大小单位
                label_color: 'initial',
                main_fontColor: 'initial',
                main_color: 'initial',
                name: '',
                label: "",
                title: '级联点选',
                label_width: 2,
                main_width: 3,
                label_align: 4,
                main_align: 4,
                cascaderValue: [],

                targetClass: '',
                labelData: [],
                valueData: [],
        relationAttr: '',
                noNumber: true,
                lazySwitch: true,
                searchSwitch: false,
                labelSwitch: true,
                pathSwitch: false,
                rootQuery: '',
                childrenQuery: '',
                recursiveLevel: 1,

                readonly: false,
                width: 100,
                widthType: '%',
                height: 30,
                heightType: "px",           // 整体高度单位
                hided: false,
                required: false,
                col: true,
                rows: 3,
                cols: 3,
                targetDataType: null,
                placeholder: "",

                treeList: [],

                events: [],
                eventRange: ["值变化"],
            },

            // 支持的数据类型
            dataTypes: ['String', 'UUID', 'Clob', 'Double', 'Integer', 'Long'],

            // 对齐方式,布局插件使用
            alignList: [
                {value: 1, name: "靠左对齐"},
                {value: 4, name: "居中对齐"},
                {value: 7, name: "靠右对齐"},
                {value: 0, name: "左上对齐"},
                {value: 2, name: "左下对齐"},
                {value: 3, name: "顶部对齐"},
                {value: 5, name: "底部对齐"},
                {value: 6, name: "右上对齐"},
                {value: 8, name: "右下对齐"}
            ],

            attrMap: {},

            open: ["1","2"],

            timer: null
        }
    },
    components: {
        EditBox,
        FilterQueryCommonModal
    },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
        if (this.t_preview) {
            this.$store = this.store;
            let that = this;
            if (this.attributes) {
                if (this.relation) {
                    this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
                    this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
                    this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
                } else {
                    this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
                }
            }
        }
    },
    mounted() {
      this.$nextTick(() => {
        if (this.t_preview) {
          this.setInheritStyle();

          this.initData();

        }
      })

    },
    watch: {
        arg_name(val) {
          if (val in this.attrMap) {
                this.args.targetDataType = this.attrMap[val].valueType;
                const dType = this.args.targetDataType;
                if (this.t_edit) {
                    if (dType == 'Double' || dType == 'Integer' || dType == 'Long') {

                        this.args.noNumber = false;
                        this.args.valueData = '';
                        this.args.pathSwitch = false;

                    } else {

                        this.args.noNumber = true;
                        this.args.valueData = [];

                    }
                }

              if (this.relation) {
                  if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
                  if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
                  if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
              } else this.args.label = this.attrMap[val].displayName;
              let name = val;
              if (this.relation) {
                  if (name.startsWith("left_")) name = name.substring(5);
                  else if (name.startsWith("right_")) name = name.substring(6);
                  else if (name.startsWith("relation_")) name = name.substring(9);
              }
              let attr = this.store.state.DWF_form.Attributes[name];
              if (attr && attr.defaultValue) this.value = attr.defaultValue;
          } else this.args.targetDataType = null;
        },
        'args.height'(val) {
            this.setInheritStyle();
        },
        'args.heightType'(val) {
            this.setInheritStyle();
        }
    },
    computed: {
        ...mapGetters("DWF_form", [
            "EntityAttrList",
            "Entities"
        ]),
        numSysAttr() {
            return this.args.noNumber ? this.targetClassAttributes.sysAttr : this.targetClassAttributes.sysAttr.filter(s => ['Integer', 'Double', 'Long'].includes(s.valueType));
        },
        numSelfAttr() {
            return this.args.noNumber ? this.targetClassAttributes.selfAttr : this.targetClassAttributes.selfAttr.filter(s => ['Integer', 'Double', 'Long'].includes(s.valueType));
        },
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
        },
      labelWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return (!this.args.label || this.args.label == "") ? "10%" : this.args.label_widthByPx + 'px';
        }else{
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
      mainWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : `calc(100% - ${this.args.label_widthByPx}px)`;
        }else{
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
        labelXAlign() {
            let x = parseInt(this.args.label_align / 3);
            if (x == 0) return "left";
            else if (x == 1) return "center";
            else return "right";
        },
        labelYAlign() {
            let x = this.args.label_align % 3;
            if (x == 0) return "top";
            else if (x == 1) return "middle";
            else return "bottom";
        },
        mainXAlign() {
            let x = parseInt(this.args.main_align / 3);
            if (x == 0) return "left";
            else if (x == 1) return "center";
            else return "right";
        },
        // 文本内容字体大小
        args_fsize() {
            return this.args.fsize + this.args.fsizeType + ' !important';
        },
        // 标签文本内容字体大小
        args_lfsize() {
            return this.args.lfsize + this.args.lfsizeType + ' !important';
        },
        mainYAlign() {
            let x = this.args.main_align % 3;
            if (x == 0) return "top";
            else if (x == 1) return "middle";
            else return "bottom";
        },
        filter_attributes() {
            return this.attributes ? ( this.relation ?
                [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
        },
    },

    beforeDestroy() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; };
    },

    methods: {

        setInheritStyle() {
            try {
                this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length != 0
                ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
                    item.style.fontSize = 'inherit';
                    item.style.height = 'inherit';
                    item.style.color = 'inherit';
                    item.style.backgroundColor = 'inherit';
                    })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
                    item.style.fontSize = 'inherit';
                    item.style.color = 'inherit';
                    item.style.backgroundColor = 'inherit';
                    })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
                    item.style.fontSize = 'inherit';
                    item.style.color = 'inherit';
                    item.style.backgroundColor = 'inherit';
                    })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').forEach(item => {
                item.style.fontSize = 'inherit';
                item.style.height = this.arg_height;
                item.style.lineHeight = this.arg_height;
                item.style.textAlign = 'inherit';
                })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input').forEach(item => {
                item.style.fontSize = 'inherit';
                item.style.height = this.arg_height;
                item.style.lineHeight = this.arg_height;
                })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
                    item.style.fontSize = 'inherit';
                    item.style.color = 'inherit';
                    item.style.lineHeight = this.arg_height;
                    item.style.height = this.arg_height;
                    item.style.backgroundColor = 'inherit';
                    })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').forEach(item => {
                    item.style.textAlign = 'inherit';
                }): '';
                this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
                    item.style.textAlign = 'inherit';
                }): '';
                this.$refs.main.querySelectorAll('.i-input.ivu-cascader .ivu-input') && this.$refs.main.querySelectorAll('.i-input.ivu-cascader .ivu-input').length != 0
                ? this.$refs.main.querySelectorAll('.i-input.ivu-cascader .ivu-input').forEach(item => {
                    item.style.textAlign = 'inherit';
                    item.style.color = 'inherit';
                }): '';
                // if(this.args.appointGroup && this.args.txt_bgColor!="#fff"){
                //   this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
                //   ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
                //     item.style.backgroundColor = this.args.txt_bgColor;
                //   }): '';
                // }else{
                //   this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
                //   ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
                //     item.style.backgroundColor = this.args.txt_bgColor;
                //     item.style.overflow = 'hidden';
                //     item.style.fontSize = 'inherit';
                //   }): '';
                //   this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
                //   ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
                //     item.style.fontSize = 'inherit';
                //     item.style.lineHeight = this.arg_height;
                //     item.style.height = this.arg_height;
                //   })
                //   : '';
                // }
            } catch (e) {

            }
            },
        async initData() {
          //增加外部实体类
          //   let allExternalEntities = await getExternalEntities();
          //   this.allExternalEntities = allExternalEntities.data;
          //   let treeEn = await getAllEntities();
          //   if(treeEn && treeEn.data.success){
          //     this.all_class = treeEn.data.data;
          //   }
          let treeEn = await getAllEntities();
          if(treeEn && treeEn.data.success){
            this.all_class = treeEn.data.data.filter(en => en.classCategory !== 'ExternalItemClass');
            this.allExternalEntities = treeEn.data.data.filter(en => en.classCategory === 'ExternalItemClass');
          }
            if(!this.itemValue.data.isRelation && (!this.args.targetClass || this.args.targetClass == '')) {
                this.args.targetClass = this.itemValue.data.targetClass;
                this.firstLoad = false;
            }

            if(this.args.targetClass != '') this.changeClass(this.args.targetClass);

        },

        // 懒加载
        async loadData(item, callback) {

            if(!this.args.lazySwitch) {
                return false;
            }

            let treeParam = {
                childrenCondition: this.args.childrenQuery,
                leafCondition: '',
                recursiveLevel: 1,
                rootCondition: ''
            }

            let prefix = this.args.relationAttr ? this.args.relationAttr : 'parentOid';
          if(this.args.classCategory == 'ExternalItemClass'){
            prefix = `"${prefix}"`
          }
            treeParam.rootCondition = this.args.childrenQuery == '' ? `and obj.${prefix} = '${item.oid}'` : `and obj.${prefix} = '${item.oid}' ${this.args.childrenQuery}`;
            // this.args.relationAttr = this.args.relationAttr ? this.args.relationAttr.replace('plt_', '') : this.args.relationAttr;
            let nodeResult = await getSelfJoinEobj(this.args.targetClass, treeParam, false, true, this.args.relationAttr);
            let temChild = [];

            if(nodeResult.data.success) {

                temChild = nodeResult.data.data;

            } else {
                this.$Message.error(nodeResult.data.message);
            }

            if(temChild.length && temChild.length > 0) {

                temChild.forEach((val, index) => {

                    // 子节点过滤结果
                    let temCAttr = '';
                    let temCValueAttr = '';

                    this.args.labelData.forEach(i => {

                        if(val[i]) {
                            temCAttr = temCAttr + val[i] + '-'
                        }

                    })
                    if(this.args.noNumber) {

                        this.args.valueData.forEach(n => {

                            if(val[n]) {
                                temCValueAttr = temCValueAttr + val[n] + ','
                            }

                        })

                    } else {

                        temCValueAttr = val[this.args.valueData] || '';

                    }

                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }
                    if(temCValueAttr.length > 0) {
                        temCValueAttr = temCValueAttr.substr(0, temCValueAttr.length - 1);
                    }
                    val.label = temCAttr;
                    val.value = temCValueAttr;

                    if(val.childrenCount > 0) {

                        val.loading = false;
                        val.children = [];

                    } else {

                        val.children = [];

                    }

                })

            } else {
                temChild = [];
            }

            item.loading = true;
            setTimeout(() => {

                item.children = temChild;
                item.loading = false;
                callback();

            }, 1000);

        },

        clearTargetClass() {
            this.args.labelData = [];
            this.args.noNumber ? this.args.valueData = [] : this.args.valueData = '';
        },

        async changeClass(value) {

            if(!value || value == undefined) return;

            // 获取当前所选目标实体类的全部属性
            // let allEnAttr = this.EntityAttrList(value);
            let allEnAttr = await getAttributes(value);

            if(!this.firstLoad) {

                this.args.labelData = [];
                this.args.noNumber ? this.args.valueData = [] : this.args.valueData = '';
                this.firstLoad = false;

            } else {
                this.firstLoad = false;
            }

          if(this.allExternalEntities.filter(en => en.className === value).length !== 0){
            this.args.classCategory = 'ExternalItemClass';
          }else{
            this.args.classCategory = 'ItemClass';
          }
            this.targetClassAttributes.sysAttr = allEnAttr.data.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.targetClassAttributes.selfAttr = allEnAttr.data.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);

        },

        // 设置根、子节点过滤条件
        setLable(status) {

            if(status == '3') {

                if(this.args.targetClass == '') {
                    this.$Message.warning('请先选择实体类');
                } else {

                    this.filterStatus = '3';
                    let filterObj = {
                        refClassDisabled: true,
                        allowNative: false,
                        hideRelationClass: []
                    }

                    this.$refs.filterQuery_modal.initModal(this.args.rootQuery, this.args.targetClass.split('&')[0], filterObj, false);

                }

            } else {

                if(this.args.targetClass == '') {
                    this.$Message.warning('请先选择实体类');
                } else {

                    this.filterStatus = '4';
                    let filterObj = {
                        refClassDisabled: true,
                        allowNative: false,
                        hideRelationClass: []
                    }

                    this.$refs.filterQuery_modal.initModal(this.args.childrenQuery, this.args.targetClass.split('&')[0], filterObj, false);

                }

            }

        },

        getFilterQuery(transQuery){

            if(this.filterStatus == '3') {
                this.args.rootQuery = transQuery;
            } else {
                this.args.childrenQuery = transQuery;
            }

        },

        // 遍历子节点
        getEachTree(tree = [], targetItem) {
            let arr = [];
            let _self = this;
            if (!!tree && tree.length !== 0) {
                tree.forEach(item => {

                    // 子节点label/value拼接结果
                    let temCAttr = '';
                    let temCValueAttr = '';

                    this.args.labelData.forEach(i => {

                        if(item[i]) {
                            temCAttr = temCAttr + item[i] + '-'
                        }

                    })
                    if(this.args.noNumber) {

                        this.args.valueData.forEach(n => {

                            if(item[n]) {
                                temCValueAttr = temCValueAttr + item[n] + ','
                            }

                        })

                    } else {

                        temCValueAttr = item[this.args.valueData] || '';

                    }

                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }
                    if(temCValueAttr.length > 0) {
                        temCValueAttr = temCValueAttr.substr(0, temCValueAttr.length - 1);
                    }
                    item.label = temCAttr;
                    item.value = temCValueAttr;

                    let obj = item;
                    let isHasChild = _self.getEachTree(item.children, item);
                    if(item.childrenCount > 0) {
                        obj.loading = false;
                        obj.children = isHasChild || [];
                    }else{
                      obj.children = [];
                    }
                    arr.push(obj);
                });
            }
            return arr;
        },

        /**
         * @description 更新树数据
        */
        async updateTree() {

            if(this.args.labelData.length == 0) {

                this.$Message.warning('请先选择浏览字段');

            } else if((this.args.noNumber && this.args.valueData.length == 0) || (!this.args.noNumber && this.args.valueData == '')) {

                this.$Message.warning('请先选择回填字段');

            } else {

                this.args.treeList = [];

                // modeler端关闭懒加载 也最多只展示5层数据
                let treeParam = {
                    childrenCondition: this.args.childrenQuery,
                    leafCondition: '',
                    recursiveLevel: this.args.lazySwitch ? this.args.recursiveLevel : 5,
                    rootCondition: this.args.rootQuery
                }

              // this.args.relationAttr = this.args.relationAttr ? this.args.relationAttr.replace('plt_', '') : this.args.relationAttr;
                let treeRes = await getSelfJoinEobj(this.args.targetClass, treeParam, false, true, this.args.relationAttr);
                let temTree = [];
                if(treeRes.data.success) {

                    let treeData = treeRes.data.data;
                    if(treeData.length > 0) {

                        treeData.forEach(x => {

                            // 根节点过滤结果
                            let temAttr = '';
                            let temValueAttr = '';

                            // 显示字段label拼接
                            this.args.labelData.forEach(i => {

                                if(x[i]) {
                                    temAttr = temAttr + x[i] + '-'
                                }

                            })
                            // 回填字段value拼接
                            if(this.args.noNumber) {

                                this.args.valueData.forEach(n => {

                                    if(x[n]) {
                                        temValueAttr = temValueAttr + x[n] + ','
                                    }

                                })

                            } else {

                                temValueAttr = x[this.args.valueData] || '';

                            }

                            if(temAttr.length > 0) {
                                temAttr = temAttr.substr(0, temAttr.length - 1);
                            }
                            if(temValueAttr.length > 0) {
                                temValueAttr = temValueAttr.substr(0, temValueAttr.length - 1);
                            }

                            x.label = temAttr;
                            x.value = temValueAttr;
                            x.children = x.children || [];
                            if(this.args.lazySwitch && this.args.recursiveLevel == 0) {

                                if(x.childrenCount > 0) {

                                    x.children = [];
                                    x.loading = false;

                                }

                            } else {

                                let transChild = this.getEachTree(x.children, x);
                                if(transChild.length > 0) {
                                    x.children = transChild || [];
                                    x.loading = false;
                                }

                            }

                        })
                        temTree = treeData;

                    } else {
                        temTree = [];
                    }

                } else {

                    this.$Message.warning('服务繁忙查询失败');
                    temTree = [];

                }

                this.spinShow = true;

                let that = this;
                setTimeout(function() {
                    that.args.treeList = temTree;
                    that.spinShow = false;
                }, 1000);


            }

        },

        cascaderFormat(labels, selectedData) {

            if(!this.args.labelSwitch &&  labels.length !== 0) {
                const index = labels.length - 1;
                return labels[index];
            } else {
                return labels.join(' / ');
            }

        },

        setDisplayType(type) {
            if (type == 0) this.t_preview = true;
            else this.t_preview = false;
            return this;
        },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
            if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";

            return this;
        },
        getFormName() {
            return this.args.name;
        },
        getArgs() {
            return this.args;
        },
        getAllow() {
            return null;
        },
        getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
            this.t_edit = true;
            return this.$refs.edit;
        },

        getName() {
            return name;
        },

        getDataType(args) {
            return this.args.dataTypes;
        },

    }
}
</script>
<style>
.editbox-join-cascader-tree .ivu-select-dropdown{
  width: 100%!important;
  left: 0px!important;
}
</style>
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
