<template>
        <section :addinName="name" id="inputDiv" :style="{'width': colWidth}" ref="main">
          <template v-if="args.structural_layout === 'horizontal'">
            <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
                <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                    <span v-if="args.required" style="color: red">*</span>
                    <label class="ori-color self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
                </span>
            </span>
            <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
            <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
                <span v-show="!args.hided" :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                    <InputNumber ref="number"
                                 class="i-input self-color"
                                 v-if="!needPop"
                                 :placeholder="args.placeholder"
                                 :max="parseFloat(args.max)"
                                 :min="parseFloat(args.min)"
                                 :step="parseFloat(args.step)"
                                 v-model="value"
                                 :disabled="args.readonly || t_visit"
                                 :editable="args.editable"
                                 :style="{'height': arg_height, 'width': '100%', 'color': args_fcolor, 'background-color': args.txt_bgColor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
                                 @on-blur="handleNumberInput"
                                 @on-focus="hideWrongMes"
                                 @mouseenter.native="hoverEvent"
                                 @on-change="valueChange"
                                 @keyup.native="regInt"
                    />

                    <div v-else>
                        <Poptip v-show="hoverPop" trigger="hover" transfer :placement="popHoverDirection" :width="popHoverObj.popWidth">
                        <InputNumber ref="number"
                                     class="i-input self-color"
                                     :placeholder="args.placeholder"
                                     :max="parseFloat(args.max)"
                                     :min="parseFloat(args.min)"
                                     :step="parseFloat(args.step)"
                                     v-model="value"
                                     :disabled="args.readonly || t_visit"
                                     :editable="args.editable"
                                     :style="{'height': arg_height, 'width': relWidth, 'color': args_fcolor, 'background-color': args.txt_bgColor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
                                     @on-blur="handleNumberInput"
                                     @on-focus="hideWrongMes"
                                     @mouseenter.native="hoverEvent"
                                     @on-change="valueChange"
                                     @keyup.native="regInt"
                        />
                        <div v-show="popHoverObj.needPopTitle" slot="title"><span :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    v-if="!this.isHoverMesPop && popHoverPath"
                                    ref="form"
                                    :to_path="popHoverPath"
                                    :to_query="popHoverQuery"
                                    :store="store">
                            </FormEngine>
                            <p v-else>{{ this.popHoverMes }}</p>
                        </div>
                        </Poptip>

                        <Poptip v-show="!hoverPop" trigger="focus" transfer :placement="popFocusDirection" :width="popFocusObj.popWidth">
                        <InputNumber ref="number"
                                     class="i-input self-color"
                                     :placeholder="args.placeholder"
                                     :max="parseFloat(args.max)"
                                     :min="parseFloat(args.min)"
                                     :step="parseFloat(args.step)"
                                     v-model="value"
                                     :disabled="args.readonly || t_visit"
                                     :editable="args.editable"
                                     :style="{'height': arg_height, 'width': relWidth, 'color': args_fcolor, 'background-color': args.txt_bgColor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
                                     @on-blur="handleNumberInput"
                                     @on-focus="hideWrongMes"
                                     @mouseenter.native="hoverEvent"
                                     @on-change="valueChange"
                                     @keyup.native="regInt"
                        />
                        <div v-show="popFocusObj.needPopTitle" slot="title"><span :style="{'color': popFocusObj.popTitleColor, 'font-size': `${popFocusObj.popTitleFs}px`}">{{ popFocusObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    v-if="!this.isFocusMesPop && popFocusPath"
                                    ref="form"
                                    :to_path="popFocusPath"
                                    :to_query="popFocusQuery"
                                    :store="store">
                            </FormEngine>
                            <p v-else>{{ this.popFocusMes }}</p>
                        </div>
                        </Poptip>
                    </div>

                </span>
            </span>
          </template>
          <template v-else>
            <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
            'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
                <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                    <span v-if="args.required" style="color: red">*</span>
                    <label class="ori-color self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
                </span>
            </span>
            <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
            <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
                <span v-show="!args.hided" :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                    <InputNumber ref="number"
                                 class="i-input self-color"
                                 v-if="!needPop"
                                 :placeholder="args.placeholder"
                                 :max="parseFloat(args.max)"
                                 :min="parseFloat(args.min)"
                                 :step="parseFloat(args.step)"
                                 v-model="value"
                                 :disabled="args.readonly || t_visit"
                                 :editable="args.editable"
                                 :style="{'height': arg_height, 'width': '100%', 'color': args_fcolor, 'background-color': args.txt_bgColor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
                                 @on-blur="handleNumberInput"
                                 @on-focus="hideWrongMes"
                                 @mouseenter.native="hoverEvent"
                                 @on-change="valueChange"
                                 @keyup.native="regInt"
                    />

                    <div v-else>
                        <Poptip v-show="hoverPop" trigger="hover" transfer :placement="popHoverDirection" :width="popHoverObj.popWidth">
                        <InputNumber ref="number"
                                     class="i-input self-color"
                                     :placeholder="args.placeholder"
                                     :max="parseFloat(args.max)"
                                     :min="parseFloat(args.min)"
                                     :step="parseFloat(args.step)"
                                     v-model="value"
                                     :disabled="args.readonly || t_visit"
                                     :editable="args.editable"
                                     :style="{'height': arg_height, 'width': relWidth, 'color': args_fcolor, 'background-color': args.txt_bgColor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
                                     @on-blur="handleNumberInput"
                                     @on-focus="hideWrongMes"
                                     @mouseenter.native="hoverEvent"
                                     @on-change="valueChange"
                                     @keyup.native="regInt"
                        />
                        <div v-show="popHoverObj.needPopTitle" slot="title"><span :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    v-if="!this.isHoverMesPop && popHoverPath"
                                    ref="form"
                                    :to_path="popHoverPath"
                                    :to_query="popHoverQuery"
                                    :store="store">
                            </FormEngine>
                            <p v-else>{{ this.popHoverMes }}</p>
                        </div>
                        </Poptip>

                        <Poptip v-show="!hoverPop" trigger="focus" transfer :placement="popFocusDirection" :width="popFocusObj.popWidth">
                        <InputNumber ref="number"
                                     class="i-input self-color"
                                     :placeholder="args.placeholder"
                                     :max="parseFloat(args.max)"
                                     :min="parseFloat(args.min)"
                                     :step="parseFloat(args.step)"
                                     v-model="value"
                                     :disabled="args.readonly || t_visit"
                                     :editable="args.editable"
                                     :style="{'height': arg_height, 'width': relWidth, 'color': args_fcolor, 'background-color': args.txt_bgColor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
                                     @on-blur="handleNumberInput"
                                     @on-focus="hideWrongMes"
                                     @mouseenter.native="hoverEvent"
                                     @on-change="valueChange"
                                     @keyup.native="regInt"
                        />
                        <div v-show="popFocusObj.needPopTitle" slot="title"><span :style="{'color': popFocusObj.popTitleColor, 'font-size': `${popFocusObj.popTitleFs}px`}">{{ popFocusObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    v-if="!this.isFocusMesPop && popFocusPath"
                                    ref="form"
                                    :to_path="popFocusPath"
                                    :to_query="popFocusQuery"
                                    :store="store">
                            </FormEngine>
                            <p v-else>{{ this.popFocusMes }}</p>
                        </div>
                        </Poptip>
                    </div>

                </span>
            </span>
          </template>
            <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
                <span v-show="isRequired" class="wrongTips">该项不能为空</span>
                <span v-show="isWrong" class="wrongTips">{{ errorMessage || args.ruleMessage }}</span>
            </span>
        </section>
</template>

<script>
    import "@/styles/component/iconfont.css"
    import { getQueryOperation, checkDuplicate } from "@/api/others";
    import FormEngine from '@/views/form-engine/forms-engine.vue';
    import { getRelation } from '@/api/data-model/RelationModeling';
    const name = "NumberInput";
    export default {
	beforeDestroy() {
		if (this.timer) { clearInterval(this.timer); this.timer = null; };
	},
        name: name,
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
    ],
        data() {
            return {
                timer: null,
                times: 0,
                name: name,
                // 展示模式
                t_create:false,
                t_edit:false,
                t_visit:false,
                readonly:false,
                isWrong: false,
                isRequired: false,
                needPop: false,
                errorMessage: '',
                isDupliced: false,

                leftClass: '',
                rightClass: '',

                // 图标地址
                icon_url: "",

                // 编辑框
                args: {
                    id:"",
                    title:"数字输入框",
                    max: Number.MAX_VALUE,
                    min: -Number.MAX_VALUE,
                    step: 1,
                    placeholder: "数字输入框",
                    editable: true,
                    label: null,
                    name: null,
                    required: false,
                    readonly: false,
                    rule: '',
                    ruleMessage: '',
                    hided: false,
                    label_width: 2,
                    main_width: 3,
                    label_align: 4,
                    main_align: 4,
                    defaultValue: '',
                    // 属性插件所需属性
                    targetDataType: null,
                    width: 100,
                    widthType: '%',
                    height: 30,
                    heightType: "px",
                    col: true,
                    label_fontColor: 'initial',       // 标签文字颜色
                    txt_fontColor: 'initial',         // 内容文字颜色
                    lfsize: 14,                       // 标签文字大小
                    lfsizeType: 'px',                 // 标签文字大小单位
                    fsize: 14,                        // 内容文字大小
                    fsizeType: 'px',                  // 内容文字大小单位
                    txt_bgColor: '#fff',
                    // 布局插件所需属性
                    rows: 3,
                    cols: 3
                },

                hoverPop: false,
                isHoverMesPop: false,      // 脚本定义的浮窗文字
                popHoverMes: '',
                isFocusMesPop: false,      // 脚本定义的浮窗文字
                popFocusMes: '',
                popHoverObj: {
                    needPopTitle: false,
                    popTitleTxt: '提示',
                    popTitleFs: 14,
                    popTitleColor: '#333',
                    tipPlacement: 'right',
                    popWidth: 400
                },
                popFocusObj: {
                    needPopTitle: false,
                    popTitleTxt: '提示',
                    popTitleFs: 14,
                    popTitleColor: '#333',
                    tipPlacement: 'right',
                    popWidth: 400
                },
                popHoverDirection: 'right',
                popFocusDirection: 'right',
                pWidth: 0,
                popHoverPath: '',
                popHoverQuery: {
                    query: ''
                },
                popFocusPath: '',
                popFocusQuery: {
                    query: ''
                },

                actions: {
                    '上边': 'top',
                    '上左': 'top-start',
                    '上右': 'top-end',
                    '右边': 'right',
                    '右上': 'right-start',
                    '右下': 'right-end',
                    '下边': 'bottom',
                    '下左': 'bottom-start',
                    '下右': 'bottom-end',
                    '左边': 'left',
                    '左上': 'left-start',
                    '左下': 'left-end',
                },

                isBlur: null,
                vChange: null,
                isHover: null,
                hoverAction: '',
                isFocus: null,
                isValidate: null,
                selfValiContent: '',

                dataTypes: ['Integer', 'Long', 'Double'],

                value: null,

                // 对齐方式,布局插件使用
                alignList: [
                    {value: 0, name: "左上对齐"},
                    {value: 1, name: "靠左对齐"},
                    {value: 2, name: "左下对齐"},
                    {value: 3, name: "顶部对齐"},
                    {value: 4, name: "居中对齐"},
                    {value: 5, name: "底部对齐"},
                    {value: 6, name: "右上对齐"},
                    {value: 7, name: "靠右对齐"},
                    {value: 8, name: "右下对齐"}
                ],

                // 继承属性
                inherit: [],

                // 表单项名
                args_name: "",

                // 属性map
                attrMap: {},

            }
        },
        components: {
          FormEngine
        },
      inject:[
        'getEn',
        'getJsonData',
        'getParentJson',
        'getObj',
        'GetAddinById',
        'GetAddinByUUID',
        'GetAllAddin',
        'getParentAddin',
        '_getViewData',
        '_getViewDataByAttrs',
        'handleQueryData',
        'getClassObject',
        'getRClassObject',
        'invokeOperation',
        'parseEscapeString',
        'handleScript',
        'addExtraObj',
        'getEventOperation',
        'invokeEvent',
      ],
        // 生命周期函数，在获取数据和事件函数后调用，
        created() {
          //通过prop给控件初始化
          this.setDisplayType(this.query.displayType);
          this.setArgs(this.argsProps);

            if(this.itemValue.data.isRelation && this.itemValue.data.displayType == 'create') {

                getRelation(this.itemValue.data.targetClass).then(response => {

                    let res = response.data;
                    if(response.success) {

                        this.leftClass = res.leftClass;
                        this.rightClass = res.rightClass;

                    }
                }).catch(e => {
                    console.log(e);
                });

            }

        },
        // 生命周期函数，在dom元素生成之后调用
        mounted() {
            // 字体 ／ 颜色 默认继承
          this.$nextTick(() => {
            this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
              ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
                item.style.width = '100%';
                item.parentNode.style.width = 'inherit';
              })
              : '';
            this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
              ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
                item.style.width = 'inherit';
              })
              : '';
            this.$refs.main.querySelector(".ivu-input-number-input").style.color = 'inherit';
            this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.fontSize = 'inherit';
            this.$refs.main.querySelector(".ivu-input-number-input").style.fontSize = 'inherit';
            this.$refs.main.querySelector(".ivu-input-number-input").style.textAlign = 'inherit';
            this.$refs.main.querySelector(".ivu-input-number-input").style.backgroundColor = 'inherit';
            this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.height = 'inherit';
            this.$refs.main.querySelector(".ivu-input-number-input").style.height = 'inherit';
            this.$refs.main.querySelector(".ivu-input-number-handler").style.height = '50%';
          })

            // this.setHeight();

            // 鼠标悬停事件
            this.isHover = this.args.events.find((val) => {
             return val.name == '鼠标悬停'
            })

            // 获得焦点事件
            this.isFocus = this.args.events.find((val) => {
             return val.name == '获得焦点'
            })

            this.isValidate = this.args.events.find((val) => {
             return val.name == '值校验'
            })
            if(this.isValidate != null && this.isValidate.opr_path != undefined && this.isValidate.opr_path != '') {
              getQueryOperation(this.isValidate.opr_path).then(response => {
          let res = response.data;
          if(res.data.oprScript){
            this.selfValiContent = JSON.parse(res.data.oprScript).implement.client.default.script
          }else{
            this.selfValiContent = res.data.conditionExpre ? res.data.conditionExpre.slice(13) : '';
          }
                console.log(res);
              }).catch(e => {
                console.log(e);
              });
            }


            if(this.isHover != null && this.isHover.opr_path != undefined && this.isHover.opr_path != '') {
              getQueryOperation(this.isHover.opr_path).then(response => {

                let res = response.data;
                if(res.success && res.data) {

                  let oName = res.data.conType;
                  this.hoverAction = oName;

                  if(oName == 'tip') {

                    if(res.data.action == 'implement') {

                      if(res.data.conditionExpre) {

                        this.popHoverMes = res.data.conditionExpre.slice(20);
                        this.popHoverMes = this.popHoverMes.replace(/\'/g, '');
                        this.popHoverMes = this.popHoverMes.replace(/\"/g, '');
                        this.isHoverMesPop = true;
                      }

                    } else {
                      this.isHoverMesPop = false;
                    }

                    this.popHoverObj = JSON.parse(res.data.viewType);
                    this.popHoverDirection = this.actions[this.popHoverObj.tipPlacement];
                    this.popHoverPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
                    this.needPop = true;
                    this.hoverPop = true;
                    this.pWidth = document.getElementById("inputDiv").offsetWidth;

                  } else {

                    this.needPop = false;

                  }
                } else {
                  console.log(res.message);
                }

                // 字体 ／ 颜色 默认继承
                this.$nextTick(() => {
                  this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
                    ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
                      item.style.width = '100%';
                      item.parentNode.style.width = 'inherit';
                    })
                    : '';
                  this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
                    ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
                      item.style.width = 'inherit';
                    })
                    : '';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.color = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.fontSize = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.fontSize = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.textAlign = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.backgroundColor = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.height = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.height = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-handler").style.height = '50%';
                })
              }).catch(e => {
                console.log(e);
              });
            }

            // 聚焦事件 当悬停事件样式也为浮窗时 聚焦事件失效
            if(this.isFocus != null && this.isFocus.opr_path != undefined && this.isFocus.opr_path != '') {

              getQueryOperation(this.isFocus.opr_path).then(response => {
                let res = response.data;
                if(res.success && res.data) {

                  let oName = res.data.conType;

                  if(oName != 'tip' && this.hoverAction != 'tip') {
                    this.needPop = false;
                  }

                  if(oName == 'tip' && this.hoverAction != 'tip') {

                    if(res.data.action == 'implement') {

                      if(res.data.conditionExpre) {

                        this.popFocusMes = res.data.conditionExpre.slice(20);
                        this.popFocusMes = this.popFocusMes.replace(/\'/g, '');
                        this.popFocusMes = this.popFocusMes.replace(/\"/g, '');
                        this.isFocusMesPop = true;
                      }

                    } else {
                      this.isFocusMesPop = false;
                    }

                    this.popFocusObj = JSON.parse(res.data.viewType);
                    this.popFocusDirection = this.actions[this.popFocusObj.tipPlacement];

                    this.popFocusPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
                    this.needPop = true;
                    this.hoverPop = false;
                    this.pWidth = document.getElementById("inputDiv").offsetWidth;

                  }

                } else {
                  console.log(res.message);
                }

                // 字体 ／ 颜色 默认继承
                this.$nextTick(() => {
                this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
                ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
                    item.style.width = '100%';
                    item.parentNode.style.width = '100%';
                })
                : '';
                this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
                ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
                    item.style.width = 'inherit';
                })
                : '';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.color = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.fontSize = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.fontSize = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.textAlign = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.backgroundColor = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.height = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.height = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-handler").style.height = '50%';
                })
              }).catch(e => {
                console.log(e);
              });
            }

            if(this.args.events && this.args.events.length > 0) {

            this.vChange = this.args.events.find((val) => {
             return val.name == '值变化'
            })

            this.isBlur = this.args.events.find((val) => {
             return val.name == '失去焦点'
            })

          }
          // 默认非空时 自动校验
          // if(this.value != null) {
          //   this.validate();
          // }

        },
        computed: {
            arg_height() {
                return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
            },
            colWidth() {
                return this.args.width + this.args.widthType;
            },
            labelWidth() {
              if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
                return this.args.label_widthByPx + 'px';
              }else{
                return parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
              }
            },
            mainWidth() {
              if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
                return !this.args.label || this.args.label == "" ? "100%": `calc(100% - ${this.args.label_widthByPx}px)`;
              }else{
                return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
              }
            },
            relWidth() {
                return 'inherit';
            //   let allWidth = this.args.label_width + this.args.main_width;
            //   return !this.args.label || this.args.label == "" ? (this.args.required ? (this.pWidth * 0.9 - 6) + 'px' : (this.pWidth - 6) + 'px') : (this.pWidth * (this.args.main_width / allWidth) - 6) + 'px';
            },
            labelXAlign() {
                let x = parseInt(this.args.label_align / 3);
                if (x == 0) return "left";
                else if (x == 1) return "center";
                else return "right";
            },
             // 文本内容字体大小
            args_fsize() {
                return this.args.fsize + this.args.fsizeType + ' !important';
            },
            args_fcolor() {
                return this.args.txt_fontColor == 'initial' ? 'initial' : this.args.txt_fontColor + ' !important';
            },
            // 标签文本内容字体大小
            args_lfsize() {
                return this.args.lfsize + this.args.lfsizeType + ' !important';
            },
            args_lfcolor() {
                return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
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
            mainYAlign() {
                let x = this.args.main_align % 3;
                if (x == 0) return "top";
                else if (x == 1) return "middle";
                else return "bottom";
            },
        },
        methods: {
            onDynamic(value) {
                this.setValue(value);
            },
            setHeight() {
				// if (!this.$refs.main) return;
				// let that = this;
				// this.timer = setInterval(() => {
				// 	if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
				// 	// 改成你需要的样式
				// 	var dom = that.$refs.main.querySelector(".i-input .ivu-input");
				// 	if (dom) {
				// 		dom.style.height = that.arg_height + "px";
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// 	that.times += 30;
				// 	if (that.times > 60 * 1000) {
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// }, 30);
			},

            getValue() {
                let temValue = null;
                if(this.value !== null) {
                    temValue  = parseFloat(this.value);
                }
                return temValue;
            },

            setValue(items) {
                var value = null;
                if (items == null) {
                    value = "defaultValue" in this.args ? this.args.defaultValue : null;
                }
                if (typeof items == "object") {
                    if (items && items.length > 0) value = items[0][this.args.name];
                } else value = items;
                try {
                    this.value = parseFloat(value);
                } catch (e) {
                    this.value = null;
                }
                if (isNaN(this.value)) this.value = null;
                if(this.args.needCheckDuplic == true) {

                    if(this.itemValue.data.displayType == 'create') {

                        if(this.itemValue.data.isRelation) {
                            if(this.leftClass != '') {
                                this.commonCheck();
                            }
                        } else {
                            this.commonCheck();
                        }

                    } else {
                        this.commonCheck();
                    }
                }
                return this;
            },

            getAllow() {
                return null;
            },

            // 获取编辑框内容
            getArgs() {
                return this.args;
            },

            setArgs(args) {
                for (var i in args) {
                    this.args[i] = args[i];
                }
                if(this.args.txt_bgColor == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.txt_bgColor = 'transparent';
                if ("name" in args) {
                    if(this.args.name == '' || this.args.name == null) {
                    this.value = "defaultValue" in args ? this.args.defaultValue : '';
                    }
                }

                return this;
            },

            // 获取表单项名
            getFormName() {
                return this.args.name;
            },


            getEditBox() {
                this.t_edit = true;
                return this.$refs.edit;
            },

            getName() {
                return name;
            },

            // 设置异常状态显示
            setError(error, mes, reFlag) {

                if(reFlag) {
                    this.isWrong = false;
                } else {
                    this.isWrong = error;
                }
                var dom = this.$refs.main.querySelector(".i-input");
                if (dom) dom.style.borderColor = error ? "red" : null;
                if(!reFlag) {
                    if(mes) {
                        this.errorMessage = mes;
                    } else {
                        this.errorMessage = '';
                    }
                }
                return this;

            },

            commonCheck(needVali) {

                let checkClass = this.itemValue.data.targetClass;

                let checkObj = {
                    attrNames: [],
                    obj: {}
                };

                if(this.itemValue.data.isRelation) {

                    let attrName = this.args.name.split('_')[1];
                    checkObj.attrNames.push(attrName);
                    checkObj.obj[attrName] = this.value;

                    let attrType = this.args.name.split('_')[0];

                    if(attrType == 'left') {

                        if(this.itemValue.data.displayType == 'create') {
                            checkClass = this.leftClass;
                        } else {
                            checkClass = 'relation_leftClass' in this.itemValue.data.origin ? this.itemValue.data.origin.relation_leftClass : this.leftClass;
                        }

                    } else if(attrType == 'right') {

                        if(this.itemValue.data.displayType == 'create') {
                            checkClass = this.rightClass;
                        } else {
                            checkClass = 'relation_rightClass' in this.itemValue.data.origin ? this.itemValue.data.origin.relation_rightClass : this.rightClass;
                        }

                    } else {
                    console.log(attrType)
                    }

                } else {

                    let attrName = this.args.name;
                    checkObj.attrNames.push(attrName);
                    checkObj.obj[attrName] = this.value;

                }

                if(this.itemValue.data.displayType == 'edit') {

                    if(this.itemValue.data.isRelation) {

                    let attrType = this.args.name.split('_')[0];

                    if(attrType == 'relation') {
                        checkObj.obj['oid'] = 'relation_oid' in this.itemValue.data.origin ? this.itemValue.data.origin.relation_oid : '';
                    } else if(attrType == 'left') {
                        checkObj.obj['oid'] = 'left_oid' in this.itemValue.data.origin ? this.itemValue.data.origin.left_oid : '';
                    } else if(attrType == 'right') {
                        checkObj.obj['oid'] = 'right_oid' in this.itemValue.data.origin ? this.itemValue.data.origin.right_oid : '';
                    } else {
                        console.log(attrType)
                    }

                    } else {
                        checkObj.obj['oid'] = 'oid' in this.itemValue.data.origin ? this.itemValue.data.origin.oid : '';
                    }

                }

                checkDuplicate(checkClass, checkObj).then(response => {

                    let res = response.data;

                    if(res.success) {

                        if(res.data && res.data.length == 0) {
                            this.isDupliced = false;
                        } else {
                            this.isDupliced = true;
                        }

                    } else {
                        this.isDupliced = false;
                    }

                    if(needVali) {
                    this.validate();
                    }

                }).catch(e => {
                    console.log(e);
                });

            },

            /**
             * @isWrong : 自定义正则错误
             * @isRequired : modeler端配置的必填项
            */
            // 设置校验逻辑,返回true/false
            validate() {
                let expResult = true;
                let selfValidateMes = '';

                if (this.args.required) {

                    if(this.value === null || this.value === "" || isNaN(this.value)) {

                        this.isWrong = false;
                        this.isRequired = true;
                        expResult = false;

                    } else {

                        this.isWrong = false;
                        this.isRequired = false;
                        expResult = true;

                    }
                    this.setError(expResult ? null : true, '', true);

                }

                if (this.args.rule) {

                    if(expResult) {

                        if(this.value != null) {

                        this.isRequired = false;
                        expResult = new RegExp(this.args.rule).test(this.value);

                        }
                        this.setError(expResult ? null : true);
                    }

                }

                if(this.args.needCheckDuplic) {

                    if(expResult) {

                        if(this.isDupliced == true) {

                        expResult = false;
                        selfValidateMes = '当前属性值已存在';

                        } else {
                        expResult = true;
                        }

                        this.setError(expResult ? null : true, selfValidateMes);
                    }


                }

                if(this.isValidate && this.isValidate.opr_path != '') {

                    if(expResult) {

                        if(this.selfValiContent != '') {
                        try{
                            let isPass = new Function(this.selfValiContent).call(this);
                            console.log(isPass)

                            if(isPass === true) {
                            expResult = true;
                            } else {
                            expResult = false;
                            selfValidateMes = isPass || '该项填写有误';
                            }

                        } catch(e) {

                            console.log(e);

                        }
                        } else {
                        expResult = true;
                        }
                        this.setError(expResult ? null : true, selfValidateMes);

                    }

                }

                if(expResult) {
                    if(isNaN(this.value)) this.value = null;
                }

                return expResult;
            },

            regInt() {
                if (this.args.targetDataType === "Integer" || this.args.targetDataType === "Long" || this.args.targetDataType === "TimeStamp") {
                    if(/\./.test(this.value)) {
                        this.$Message.warning('当前绑定属性，只能输入整数哦~');
                        this.value = parseInt(this.value);
                    }
                }
            },

            /**
             * @description 手动设置浮窗
             * @param mes 浮窗显示的文字
             * @param type 浮窗触发的方式 默认鼠标经过触发
             * @param direction 浮窗的指定方向 不传默认top
             * @param width 浮窗的指定宽度 默认150px
            */
            setToolTip(mes, type, direction, width) {

                if(!type) type = 'hover';
                if(!direction) direction = 'top';
                if(!width) width = 150;
                if(type == 'hover') {
                    this.hoverPop = true;
                    this.popHoverDirection = direction;
                    this.popHoverObj.popWidth = width;
                    this.isHoverMesPop = true;
                    this.popHoverMes = mes;
                } else {
                    this.hoverPop = false;
                    this.popFocusDirection = direction;
                    this.popFocusObj.popWidth = width;
                    this.isFocusMesPop = true;
                    this.popFocusMes = mes;
                }

                this.pWidth = document.getElementById("inputDiv").offsetWidth;
                this.needPop = true;

                this.$nextTick(() => {
                this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
                ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
                    item.style.width = '100%';
                    item.parentNode.style.width = '100%';
                })
                : '';
                this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
                ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
                    item.style.width = 'inherit';
                })
                : '';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.color = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.fontSize = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.fontSize = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.textAlign = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.backgroundColor = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input-wrap").style.height = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-input").style.height = 'inherit';
                  this.$refs.main.querySelector(".ivu-input-number-handler").style.height = '50%';
                })

            },

            setDisplayType(type) {
                this.t_create = false;
                this.t_edit = false;
                this.t_visit = false;
                if (type == "create") {
                    this.t_create = true;
                    this.value = "";
                    this.readonly = false;
                }
                else if (type == "edit") {
                    this.t_edit = true;
                    this.readonly = false;
                }
                else if (type == "visit") {
                    this.t_visit = true;
                    this.readonly = true;
                }
                return this;
            },

            setIcon(id) {
                this.icon_url = id;
                return this;
            },

            // 获取可继承属性
            getInherit() {
                var res = {};
                let that = this;
                this.inherit.forEach(x => res[x] = that.args[x]);
                return res;
            },

            getDataType(args) {
                return this.dataTypes;
            },

            // VALUE_CHANGE
            async valueChange(value) {

                // if(this.args.needCheckDuplic == true) {

                //     let checkClass = this.itemValue.data.targetClass;

                //     if(value !== '' && value != null) {

                //         let checkObj = {
                //             attrNames: [],
                //             obj: {}
                //         };

                //         if(this.itemValue.data.isRelation) {

                //             let attrName = this.args.name.split('_')[1];
                //             checkObj.attrNames.push(attrName);
                //             checkObj.obj[attrName] = this.value;

                //             let attrType = this.args.name.split('_')[0];

                //             if(attrType == 'left') {
                //             checkClass = this.itemValue.data.origin.relation_leftClass;
                //             } else if(attrType == 'right') {
                //             checkObj.obj['oid'] = this.itemValue.data.origin.relation_rightClass;
                //             } else {
                //             console.log(attrType)
                //             }

                //         } else {

                //             let attrName = this.args.name;
                //             checkObj.attrNames.push(attrName);
                //             checkObj.obj[attrName] = this.value;

                //         }


                //         if(this.itemValue.data.displayType == 'edit') {

                //             if(this.itemValue.data.isRelation) {

                //             let attrType = this.args.name.split('_')[0];

                //             if(attrType == 'relation') {
                //                 checkObj.obj['oid'] = this.itemValue.data.origin.relation_oid;
                //             } else if(attrType == 'left') {
                //                 checkObj.obj['oid'] = this.itemValue.data.origin.left_oid;
                //             } else if(attrType == 'right') {
                //                 checkObj.obj['oid'] = this.itemValue.data.origin.right_oid;
                //             } else {
                //                 console.log(attrType)
                //             }

                //             } else {
                //             checkObj.obj['oid'] = this.itemValue.data.origin.oid;
                //             }

                //         }

                //         // let res = await checkDuplicate(checkClass, checkObj);
                //         // console.log(res);
                //         // if(res) {

                //         //     if(res.data.success) {
                //         //         if(res.data.data && res.data.data.length == 0) {
                //         //             this.isDupliced = false;
                //         //         } else {
                //         //             this.isDupliced = true;
                //         //         }
                //         //     }

                //         // }
                //         checkDuplicate(checkClass, checkObj).then(response => {

                //             let res = response.data;

                //             if(res.data && res.data.length == 0) {
                //             this.isDupliced = false;
                //             } else {
                //             this.isDupliced = true;
                //             }

                //         }).catch(e => {
                //             console.log(e);
                //         });

                //     } else {

                //         this.isDupliced = true

                //     }

                // }
                if(this.vChange && this.vChange != undefined) {
                    this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
                }

            },

            hoverEvent() {
                if(this.isHover && this.isHover != undefined) {
                    this.invokeOperation(this.isHover.opr_type, this.isHover.opr_path, this.itemValue, this.store);
                }
            },

          async triggerEvent(type){
            switch (type) {
              case 'valueChanged':
                if(this.vChange) {
                  this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
                }
                break;
              default:
                if(this.vChange) {
                  this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
                }
                break;
            }
          },


          handleNumberInput() {
                // 只读状态不做处理
                if(this.args.readonly) {
                    return;
                }
                let res = this.value;
                if (this.args.targetDataType === "Integer" || this.args.targetDataType === "Long" || this.args.targetDataType === "TimeStamp") {
                    res = parseInt(this.value);
                } else if (this.args.targetDataType === "Double") {
                    res = parseFloat(this.value);
                }
                if (res !== this.value && !isNaN(res)) {
                    this.value = res;
                }

                // 失焦事件
                if(this.isBlur && this.isBlur != undefined) {
                    this.invokeOperation(this.isBlur.opr_type, this.isBlur.opr_path, this.itemValue, this.store);
                }

                // 失焦校验
                // 脚本触发的错误状态 失焦不取消
                if(this.args.needCheckDuplic == true) {

                    this.commonCheck(true);
                    // if(this.value == '' || this.value == null) {
                    //     this.isDupliced = true
                    // }

                } else {

                    if(this.errorMessage == '' || (this.isValidate != undefined && this.isValidate != null)) {
                        this.validate();
                    }

                }

            },

            // 获取焦点隐藏错误tips
            hideWrongMes() {
                // 脚本触发的错误状态 获得焦点不取消
                if(this.errorMessage == '' || (this.isValidate != undefined && this.isValidate != null)) {
                    this.isWrong = false;
                }
                this.isRequired = false;

                if(this.isFocus && this.isFocus != undefined) {
                    this.invokeOperation(this.isFocus.opr_type, this.isFocus.opr_path, this.itemValue, this.store);
                }
            }
        }
    }
</script>

<style scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
section {
    display: inline-block;
    width: 100%
}
.wrongTips {
  display: inline-block;
  width: 100%;
  color: red;
  text-align: left;
  margin-top: 5px;
}
.ori-color {
  color: initial;
}
</style>
