<template>
  <section :addinName="name" id="inputDiv" ref="main" :style="{'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <section :style="{'display': 'flex', 'align-items': labelYAlignFlex}">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'padding-right': '10px'}">
          <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
            <span v-if="args.required" style="color: red">*</span>
            <label class="ori-color self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
        <span :style="{'min-height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                  'text-align': mainXAlign, 'vertical-align': mainYAlign,
                  'color': args.main_fontColor}">
        <template v-if="initTextArea">
          <Input
                  v-show="!args.hided"
                  class="i-input self-color initTextArea"
                  v-model="initvalue"
                  placeholder="还没有设定的参数"
                  @on-change="valueChange"
                  @on-blur="initBlur"
                  type="textarea"
                  :readonly="args.readonly || t_visit"
                  :disabled="args.readonly || t_visit"
                  :style="{'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
          ></Input>
        </template>
        <template v-else>
          <Row type="flex" justify="start"  v-show="!args.hided">
  <!--          :rules="args.formValue.formRules" -->
            <Form ref="formInline" class="dynamicParameterForm" :model="args.formValue.formModel" :style="{'width': '100%'}">
              <Col :span="computedCol" v-for="(item, index) in args.formValue.formModel.composeValue">
                <FormItem
                        :key="index"
                        :label="item.label || item.name"
                        :prop="item.name"
                        :title="item.name"
                        class="self-color"
                        :class="{'ivu-form-item-required': item.required, }"
                >
                  <!--                TODO-->
                  <!--                :rules="{required: item.required, message: item.label +'不能为空' || item.name +'不能为空', trigger: 'blur'}"-->
                  <Input
                          class="i-input self-color value-input-style"
                          v-if="item.type == null || item.type == '' || item.type == undefined || item.type == 'string' || item.type == 'clob'"
                          v-model="item.value"
                          :placeholder="item.tips"
                          :readonly="args.readonly || t_visit"
                          :disabled="args.readonly || t_visit"
                          :ref="item.name"
                          :index="index"
                          @on-change="valueChange"
                          @on-blur="checkValidator($event, item.required, item.name)"
                          :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                  ></Input>

                  <InputNumber
                          class="i-input self-color value-input-style"
                          v-model="item.value"
                          :placeholder="item.tips"
                          :readonly="args.readonly || t_visit"
                          :disabled="args.readonly || t_visit"
                          :ref="item.name"
                          :index="index"
                          v-if="item.type == 'int' || item.type == 'long' || item.type == 'float' || item.type == 'double'"
                          @on-change="valueChange"
                          @on-blur="checkValidator(item.model, item.required, item.name)"
                          :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                  ></InputNumber>

                  <DatePicker class="i-input self-color value-input-style"
                              v-model="item.value"
                              :type="item.type"
                              :ref="item.name"
                              :name="args.name"
                              :placeholder="item.tips"
                              :confirm="args.confirm"
                              :readonly="args.readonly || t_visit"
                              :disabled="args.readonly || t_visit"
                              :transfer="true"
                              :editable="false"
                              @on-change="dateValueChange"
                              @on-open-change="datepickerChange"
                              @on-clear="datepickerChange('clear')"
                              @on-ok="datepickerChange"
                              :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                              v-if="item.type == 'datetime' || item.type == 'date'">
                  </DatePicker>
                </FormItem>
                <!--            <span class="labelStyle" :style="{'width': '20%'}"><label class="ori-color self-color" :title="item.label || item.name">{{ item.label || item.name }}</label></span>-->
                <!--            <span class="labelStyle" :style="{'width': '80%'}">-->
                <!--              <Input-->
                <!--                class="i-input value-input-style"-->
                <!--                :value="item.value || item.default"-->
                <!--                :placeholder="item.tips"-->
                <!--                :readonly="t_visit"-->
                <!--                :ref="item.name"-->
                <!--              ></Input>-->
                <!--            </span>-->
              </Col>
            </Form>
          </Row>
        </template>
      </span>
      </section>
    </template>
    <template v-else>
      <section :style="{'display': args.structural_layout === 'horizontal' ? 'flex' : 'block', 'align-items': labelYAlignFlex}">
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
      'text-align': labelXAlign, 'padding-right': '10px'}">
          <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
            <span v-if="args.required" style="color: red">*</span>
            <label class="ori-color self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
        <span :style="{'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'display': 'inline-block',
                  'text-align': mainXAlign, 'vertical-align': mainYAlign,
                  'color': args.main_fontColor}">
        <template v-if="initTextArea">
          <Input
                  v-show="!args.hided"
                  class="i-input self-color initTextArea"
                  v-model="initvalue"
                  placeholder="还没有设定的参数"
                  @on-change="valueChange"
                  @on-blur="initBlur"
                  type="textarea"
                  :readonly="args.readonly || t_visit"
                  :disabled="args.readonly || t_visit"
                  :style="{'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
          ></Input>
        </template>
        <template v-else>
          <Row type="flex" justify="start"  v-show="!args.hided">
  <!--          :rules="args.formValue.formRules" -->
            <Form ref="formInline" class="dynamicParameterForm" :model="args.formValue.formModel" :style="{'width': '100%'}">
              <Col :span="computedCol" v-for="(item, index) in args.formValue.formModel.composeValue">
                <FormItem
                        :key="index"
                        :label="item.label || item.name"
                        :prop="item.name"
                        :title="item.name"
                        class="self-color"
                        :class="{'ivu-form-item-required': item.required, }"
                >
                  <!--                TODO-->
                  <!--                :rules="{required: item.required, message: item.label +'不能为空' || item.name +'不能为空', trigger: 'blur'}"-->
                  <Input
                          class="i-input self-color value-input-style"
                          v-if="item.type == null || item.type == '' || item.type == undefined || item.type == 'string' || item.type == 'clob'"
                          v-model="item.value"
                          :placeholder="item.tips"
                          :readonly="args.readonly || t_visit"
                          :disabled="args.readonly || t_visit"
                          :ref="item.name"
                          :index="index"
                          @on-change="valueChange"
                          @on-blur="checkValidator($event, item.required, item.name)"
                          :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                  ></Input>

                  <InputNumber
                          class="i-input self-color value-input-style"
                          v-model="item.value"
                          :placeholder="item.tips"
                          :readonly="args.readonly || t_visit"
                          :disabled="args.readonly || t_visit"
                          :ref="item.name"
                          :index="index"
                          v-if="item.type == 'int' || item.type == 'long' || item.type == 'float' || item.type == 'double'"
                          @on-change="valueChange"
                          @on-blur="checkValidator(item.model, item.required, item.name)"
                          :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                  ></InputNumber>

                  <DatePicker class="i-input self-color value-input-style"
                              v-model="item.value"
                              :type="item.type"
                              :ref="item.name"
                              :name="args.name"
                              :placeholder="item.tips"
                              :confirm="args.confirm"
                              :readonly="args.readonly || t_visit"
                              :disabled="args.readonly || t_visit"
                              :transfer="true"
                              :editable="false"
                              @on-change="dateValueChange"
                              @on-open-change="datepickerChange"
                              @on-clear="datepickerChange('clear')"
                              @on-ok="datepickerChange"
                              :style="{'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                              v-if="item.type == 'datetime' || item.type == 'date'">
                  </DatePicker>
                </FormItem>
                <!--            <span class="labelStyle" :style="{'width': '20%'}"><label class="ori-color self-color" :title="item.label || item.name">{{ item.label || item.name }}</label></span>-->
                <!--            <span class="labelStyle" :style="{'width': '80%'}">-->
                <!--              <Input-->
                <!--                class="i-input value-input-style"-->
                <!--                :value="item.value || item.default"-->
                <!--                :placeholder="item.tips"-->
                <!--                :readonly="t_visit"-->
                <!--                :ref="item.name"-->
                <!--              ></Input>-->
                <!--            </span>-->
              </Col>
            </Form>
          </Row>
        </template>
      </span>
      </section>
    </template>
    <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
        <span v-show="isRequired" class="wrongTips">该项不能为空</span>
          <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>
  </section>
</template>

<script>
  import "@/styles/component/iconfont.css";
  import FormEngine from '@/views/form-engine/forms-engine.vue'
  import _ from 'lodash';
  import $ from 'jquery';
  const name = "DynamicParameterFrame";
  export default {
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
        // 插件名
        name: name,
        // 展示模式
        t_create: false,
        t_edit: false,
        t_visit: true,

        isWrong: false,
        isRequired: false,
        times: 0,
        isRelation: false,
        // 属性配置项,按需设置
        initvalue: '',
        args: {
          dynamic: false,
          targetClass: "", // 目标类
          name: "", // 目标属性
          label: "", // 标签名称
          id: "", // 控件代号,一般为必须
          label_fontColor: "initial", // 标签字体颜色
          txt_fontColor: "initial",   // 内容字体颜色
          // txt_bgColor: '#fff',        // 输入框背景颜色
          height: 30,                  // 整体高度=
          heightType: "px",                  // 整体高度=
          width: 100,
          widthType: '%',
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          fsize: 14,                  // 内容文字大小
          fsizeType: 'px',            // 内容文字大小单位
          main_fontColor: "initial", // 主区域字体颜色
          main_color: "initial", // 主区域背景颜色
          align: "Vertical", // 标签与主区域的排列方式
          back_picture: "",
          // 以下为不在属性编辑框中设置,但默认要有的配置项
          ruleMessage: '',
          title: "动态参数框", // 插件中文名,需要填入默认值
          col: true, // 是否不占满全部
          cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null, // 目标数据类型
          events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: ["值变化"], // 支持的事件列表,元素为事件中文名

          //动态参数

          //test src
          // [{"name":"batch_size","value":3},{"name":"range"},{"name":"lr","value":0.121},{"name":"算法name1字符串","value":"字符串1"},{"name":"算法name2详细时间","value":""},{"name":"算法name3时间","value":"2019-07-29 16:00:00"},{"name":"算法name4长字符串","value":"长字符串好长好长好长好长好长好长好长好长好长好长好长"}]
          //test template
          // [{"name":"batch_size","value":3},{"name":"range"},{"name":"lr","value":0.121},{"name":"算法name1字符串","type":"string","default":"字符串1","value":"字符串1"},{"name":"算法name2详细时间","type":"datetime","default":"2019-07-31 00:00:00"},{"name":"算法name3时间","type":"date","default":"2019-07-31"},{"name":"算法name4长字符串","type":"clob","default":"长字符串好长好长好长好长好长好长好长好长好长好长好长","value":"测试会不会被覆盖"}]
          dataTemplate:'',
          formValue: {
            formModel: {
              composeValue: []
            },
            formRules: {},
            originValue: [],
            currentValue: [],
          },
          storageFormat: 'json',
          layoutType: 'vertical',
          model: [],
          layout: '',
          layoutData: [{
            value: 'vertical',
            label: '垂直布局'
          }, {
            value: 'table',
            label: '表格布局',
            children: [
              {
                value: '2',
                label: '两列'
              },
              {
                value: '3',
                label: '三列'
              },
              {
                value: '4',
                label: '四列'
              }
            ],
          }],
          hided: false,
          required: false,
          readonly: false,
        },
        attributesList: [],
        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ["String"],
        initTextArea: true,
        vChange: null,
        errorMessage: '',
        args_txt_fontColor: '',
      };
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
    },
    // 生命周期函数，在dom元素生成之后调用
    mounted() {
      // 需要动态设置高度时使用,不用可删去
      this.$nextTick(() => {
        this.setHeight();
        this.setInheritStyle();
      })
      this.vChange = this.args.events.find((val) => {
        return val.name == '值变化'
      })
    },
    watch: {
      'args.txt_fontColor'(val){
        this.args_txt_fontColor = sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? this.args.txt_fontColor : this.args.txt_fontColor + '!important';
      }
    },
    computed: {
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + ' !important';
      },
      args_label_fontColor(){
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + '!important'
      },
      // args_txt_fontColor(){
      //   return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? this.args.txt_fontColor : this.args.txt_fontColor + '!important';
      // },
      // 需要设置目标属性时使用,不用可删去
      arg_name() {
        return this.args.name;
      },
      arg_height() {
        return this.args.height < 2 ? this.args.height * 70 + "px" : this.args.height + this.args.heightType;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      labelWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.label_widthByPx + 'px';
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
      labelYAlignFlex(){
        let x = this.args.label_align % 3;
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
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
      computedCol(){
        switch (this.args.layoutType) {
          case 'vertical':
            return 24;
            break;
          case 'table2':
            return 12;
            break;
          case 'table3':
            return 8;
            break;
          case 'table4':
            return 6;
            break;
          default:
            return 24;
            break;
        }
      }
    },
    // 销毁函数,清除生成的内存占用
    beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },
    methods: {
      onDynamic(value){
        this.setValue(value);
      },
      setInheritStyle(){
        try {
          this.$refs.main.querySelectorAll('.i-input.initTextArea') && this.$refs.main.querySelectorAll('.i-input.initTextArea').length != 0
            ? this.$refs.main.querySelectorAll('.i-input.initTextArea').forEach(item => {
              item.style.fontSize = 'inherit';
              // item.style.color = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input.initTextArea .ivu-input') && this.$refs.main.querySelectorAll('.i-input.initTextArea .ivu-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input.initTextArea .ivu-input').forEach(item => {
              // item.style.height = this.arg_height;
              // item.style.color = 'inherit';
              // item.style.fontSize = 'inherit';
              // item.style.textAlign = 'inherit';
              // item.style.backgroundColor = 'inherit';
              item.style.lineHeight = parseInt(this.arg_height) - 14 + 'px';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input.initTextArea textarea') && this.$refs.main.querySelectorAll('.i-input.initTextArea textarea').length != 0
            ? this.$refs.main.querySelectorAll('.i-input.initTextArea textarea').forEach(item => {
              item.style.height = this.arg_height;
              item.style.textAlign = this.mainXAlign;
              item.style.minHeight = this.arg_height;
              // item.style.lineHeight = parseInt(this.arg_height) - 14 + 'px';
            })
            : '';

          this.$refs.main.querySelectorAll('.i-input .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-input').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
              item.style.height = 'inherit';
            })
            : '';

          this.$refs.main.querySelectorAll('.i-input .ivu-input-disabled') && this.$refs.main.querySelectorAll('.i-input .ivu-input-disabled').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-input-disabled').forEach(item => {
              sessionStorage.getItem('skinStyle') == 'dark' ? item.style.backgroundColor = 'inherit' : '';
            })
            : '';

          this.$refs.main.querySelectorAll('.i-input .ivu-input-number-input-wrap') && this.$refs.main.querySelectorAll('.i-input .ivu-input-number-input-wrap').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-input-number-input-wrap').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-input-number-input') && this.$refs.main.querySelectorAll('.i-input .ivu-input-number-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-input-number-input').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-date-picker-rel') && this.$refs.main.querySelectorAll('.i-input .ivu-date-picker-rel').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-date-picker-rel').forEach(item => {
              item.style.fontSize = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-date-picker-editor') && this.$refs.main.querySelectorAll('.i-input .ivu-date-picker-editor').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-date-picker-editor').forEach(item => {
              item.style.fontSize = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.ivu-form .ivu-form-item-label') && this.$refs.main.querySelectorAll('.ivu-form .ivu-form-item-label').length != 0
            ? this.$refs.main.querySelectorAll('.ivu-form .ivu-form-item-label').forEach(item => {
              item.style.fontSize = this.args.lfsize + this.args.lfsizeType;
              item.style.color = (sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial') ? 'inherit' : this.args.label_fontColor
              item.style.backgroundColor = 'inherit';
            })
            : '';
        } catch (e) {

        }
      },
      isJson(str) {
        if(/^\d*$/g.test(str)){
          return false;
        }
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      },
      // 设置异常状态显示
      setError(error, message = '') {
        this.isWrong = error;
        this.$refs.main.querySelector(".i-input .ivu-input").style.border = error ? "1px solid red" : '';
        this.errorMessage = error ? message : '';
        return this;
      },
      //手动清除iview表单验证效果
      checkValidator(e,required, name){
        this.$nextTick(() => {
          if(required && typeof e === 'object' && e !== null && this.args.formValue.formModel.composeValue.filter(item => item.name === name)[0].value != ''){
            this.$refs.main.querySelector(`[title=${name}]`) ? this.$refs.main.querySelector(`[title=${name}]`).classList.remove('ivu-form-item-error') : '';
            this.$refs.main.querySelector(`[title=${name}] .ivu-form-item-error-tip`) ? this.$refs.main.querySelector(`[title=${name}] .ivu-form-item-error-tip`).innerHTML = '' : '';
          }else if(required && typeof e === 'number' && e !== null){
            this.$refs.main.querySelector(`[title=${name}]`) ? this.$refs.main.querySelector(`[title=${name}]`).classList.remove('ivu-form-item-error') : '';
            this.$refs.main.querySelector(`[title=${name}] .ivu-form-item-error-tip`) ? this.$refs.main.querySelector(`[title=${name}] .ivu-form-item-error-tip`).innerHTML = '' : '';
          }
          if(e === null){
            this.$refs.main.querySelector(`[title=${name}]`) ? this.$refs.main.querySelector(`[title=${name}]`).classList.add('ivu-form-item-error') : '';
          }
        })
      },
      datepickerChange(value){
        //处理close情况
        if(value === false){

        }
        if(typeof value === "undefined"){
          value = false;
        }
        //获取必填项h
        let requireList = [];
        requireList = requireList.concat(this.args.formValue.formModel.composeValue.filter(item => {
          return item.required == true && (item.type == 'date' || item.type == 'datetime')
        }))
        if(!!requireList){
          requireList.forEach(item => {
            if(value === 'clear'){
              // setTimeout(() => {
              //   this.$refs.main.querySelector(`[title=${item.name}]`) ? this.$refs.main.querySelector(`[title=${item.name}]`).classList.add('ivu-form-item-error') : '';
              // },10)
            }else if(item && !item.value && !value){
              this.$refs.main.querySelector(`[title=${item.name}]`) ? this.$refs.main.querySelector(`[title=${item.name}]`).classList.add('ivu-form-item-error') : '';
            }else if(!item){

            }else{
              this.$refs.main.querySelector(`[title=${item.name}]`) ? this.$refs.main.querySelector(`[title=${item.name}]`).classList.remove('ivu-form-item-error') : '';
              this.$refs.main.querySelector(`[title=${item.name}] .ivu-form-item-error-tip`) ? this.$refs.main.querySelector(`[title=${item.name}] .ivu-form-item-error-tip`).innerHTML = '' : '';
            }
          })
        }
      },
      validate() {
        let expResult = true;
        // this.setError(expResult ? null : true);
        if(!this.initTextArea){
          //BUG6890 与BUG7101冲突
          // if(this.editFlag){
          //   this.editFlag = false;
          //   return expResult;
          // }
          let requireList = [];
          try {
            requireList = requireList.concat(this.args.formValue.formModel.composeValue.filter(item => {
              return item.required == true
            }))
          }catch (e) {

          }
          //iview表单验证有问题，目前采用遍历值判断是否为空
          // this.$refs['formInline'].validate((valid) => {
          //   if (valid) {
          //     expResult = true;
          //   } else {
          //
          //     expResult = false;
          //   }
          // })

          //手动清除iview表单验证效果
          if(requireList.length !== 0){
            requireList.forEach(item => {
              if(item && !item.value){
                this.$refs.main.querySelector(`[title=${item.name}]`) ? this.$refs.main.querySelector(`[title=${item.name}]`).classList.add('ivu-form-item-error') : '';
              }else if(!item){

              }else{
                this.$refs.main.querySelector(`[title=${item.name}]`) ? this.$refs.main.querySelector(`[title=${item.name}]`).classList.remove('ivu-form-item-error') : '';
                this.$refs.main.querySelector(`[title=${item.name}] .ivu-form-item-error-tip`) ? this.$refs.main.querySelector(`[title=${item.name}] .ivu-form-item-error-tip`).innerHTML = '' : '';
              }
            })
          }
          this.$refs.main.querySelector('.ivu-form-item-error') ? expResult = false : expResult = true;
        }else{
          if (this.args.required && (this.initvalue == null || this.initvalue == "")) {
            this.isRequired = true;
            expResult = false;
            this.setError(true);
          }else if (this.initvalue != null || this.initvalue == "") {
            this.isRequired = false;
            this.setError(false);
          }
          if(this.initvalue){
            expResult = this.isJson(this.initvalue);
            expResult = expResult && Object.prototype.toString.call(JSON.parse(this.initvalue)) === "[object Array]";
            !expResult && this.$Message.error('json格式有误');
          }
          this.isWrong = false;
        }
        return expResult;
      },

      // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
      getValue() {
        //fix bug 6890添加标识符
        this.editFlag = true;
        if(!this.initTextArea){
          let formInline = this.$refs.formInline;
          try {
            this.args.formValue.currentValue = this.args.formValue.originValue.map((item, index) => {
              if (this.args.formValue.formModel.composeValue[index].type == 'datetime' || this.args.formValue.formModel.composeValue[index].type == 'date') {
                return Object.assign(item, {
                  value: new Date(this.args.formValue.formModel.composeValue[index].value).format('yyyy-MM-dd hh:mm:ss')
                })
              } else {
                return Object.assign(item, {
                  value: _.cloneDeep(this.args.formValue.formModel.composeValue[index].value)
                })
              }
            })
            this.args.formValue.currentValue = JSON.stringify(this.args.formValue.currentValue);
            return this.args.formValue.currentValue;
          }catch (e) {
            console.log(`动态参数框getValue-${e}`);
            return this.initvalue;
          }
        }else{
          return this.initvalue;
        }
      },

      getKVValue(){
        return JSON.parse(this.getValue());
      },
      /*
          设置插件对应的值,
          items目前为对应值
          items将为目标对象列表
          特殊情况下需要进行格式转化再赋值
      */
      setValue(items) {
        var value = null;
        if (items == null) {
          // 初始化操作
          value = "defaultValue" in this.args ? this.args.defaultValue : null;
        } else if (typeof items == "object") {
          if (items && items.length > 0) value = items[0][this.args.name];
        } else value = items;
        //如果没有取值与默认值返回大文本框
        //else 保存初始对象，合成展示对象，创建验证规则
        /*
        * @params
        * formValue.originValue保存原始数据
        * formValue.formModel.composeValue保存与模板组合后数据
        * formValue.formRules验证
        * */
        if(!this.isJson(value) || value == null || value == '' || (this.isJson(value) && JSON.parse(value).length == 0)){
          this.initTextArea = true;
          this.initvalue = '';
        }else if(this.isJson(value)){
          this.initTextArea = false;
          value = JSON.parse(value);
          try{
            this.args.formValue.originValue = _.cloneDeep(value);
            if(this.args.dataTemplate){
              this.isJson(this.args.dataTemplate) ? this.args.dataTemplate = JSON.parse(this.args.dataTemplate) : '';
              this.args.formValue.originValue.forEach((item, index) => {
                this.args.dataTemplate.forEach(template => {
                  if(template.name == item.name){
                    value[index] = Object.assign(template, item);
                    return
                  }
                });
              })
            }
            if(Object.prototype.toString.call(value) === "[object Array]"){
              value.forEach((item, index) => {
                value[index].value = item.value = item.model = item.value || item.default;
              })
              this.args.formValue.formModel.composeValue = value;
              this.$nextTick(() => {
                this.args.formValue.formModel.composeValue.forEach((item, index) => {
                  this.args.formValue.formRules[item.name] = item.required ? [
                    {required: item.required, message: '必填', trigger: 'blur'}
                  ] : [
                    {required: false}
                  ]
                })
                this.setInheritStyle();
              })
            }else{
              this.initTextArea = true;
              this.initvalue = '';
            }
          }catch (e) {
            console.log(e)
          }
        }
        return this;
      },

      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        if (!this.$refs.main) return;
        let that = this;
        if (this.timer == null) {
          this.timer = setInterval(() => {
            if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
            // 改成你需要的样式
            var dom = that.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) {
              dom.style.height = that.arg_height + "px";
              clearInterval(that.timer);
              that.timer = null;
            } else {
              that.times += 30;
              if (that.times > 60 * 1000) {
                clearInterval(that.timer);
                that.timer = null;
              }
            }
          }, 30);
        }
      },

      /*
          type取值范围为 create, visit, edit
          需要根据三个状态修改具体前端和逻辑
          一般情况下:
              create创建态: 无数据,可编辑
              visit浏览态: 有数据,不可编辑
              edit编辑态: 有数据,可编辑
       */
      setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
          this.t_create = true;
        }
        else if (type == "edit") {
          this.t_edit = true;
        }
        else if (type == "visit") {
          this.t_visit = true;
        }
        return this;
      },

      getFormName() {
        return this.args.name;
      },

      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        if(this.args.txt_bgColor == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) {
          this.args.txt_bgColor = 'transparent';
        }
        return this;
      },

      getArgs() {
        return this.args;
      },

      getAllow() {
        return null;
      },

      getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },

      dateValueChange(e){
        // item.value = e;

        let requireList = [];
        requireList = requireList.concat(this.args.formValue.formModel.composeValue.filter(item => {
          return item.required == true && (item.type == 'date' || item.type == 'datetime')
        }));
        !!requireList && requireList.forEach(item => {
          if(e){
            this.$refs.main.querySelector(`[title=${item.name}]`) ? this.$refs.main.querySelector(`[title=${item.name}]`).classList.remove('ivu-form-item-error') : '';
            this.$refs.main.querySelector(`[title=${item.name}] .ivu-form-item-error-tip`) ? this.$refs.main.querySelector(`[title=${item.name}] .ivu-form-item-error-tip`).innerHTML = '' : '';
          }
        })
        if(this.vChange) {
          this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
        }
      },

      valueChange(e){
        /**
         * FIXME:有个深坑 表单FORM的v-model绑定的值setValue时有值,，但是被FORM初始化成空值
         * 然后获取值失去了双向绑定
         * TODO: 吧jquery去掉
         */
        // if(!this.initTextArea){
        //   let index = $(e.target).parent('.i-input').attr('index');
        //   this.args.formValue.formModel.composeValue[index].model = this.args.formValue.formModel.composeValue[index].value = e.target.value;
        // }
        if(this.vChange) {
          this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
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

      initBlur(){
        this.validate();
      },
      containerMouseUp(event){
      },
    }
  };
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
  .labelStyle{
    display: inline-block; text-align: center; vertical-align: middle; color: initial;
  }
  .value-input-style{
    width: 80%
  }
</style>
<style>
  textarea::-webkit-scrollbar {
    width: initial;
  }
  .ivu-form-item-required .ivu-form-item-label:before {
    content: '*';
    display: inline-block;
    margin-right: 4px;
    line-height: 1;
    font-family: SimSun;
    font-size: 12px;
    color: #ed4014;
  }
  .dynamicParameterForm label.ivu-form-item-label{
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
    overflow: hidden;
    width: 20%;
    display: block;
    color: inherit;
  }
  .dynamicParameterForm .ivu-form-item{
    margin-bottom: 0px;
  }
</style>
