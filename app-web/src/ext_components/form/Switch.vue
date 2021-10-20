<template>
  <section :addinName="name" ref="main" :style="{'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <section :style="{'display': 'flex', 'align-items': labelXAlignFlex, 'justify-content': labelXAlign}">

        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': labelXAlign}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="ori-color self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
        <span v-show="!args.hided" :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'height': arg_height,'background-color': args.main_color, 'width': '100%', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
            <i-switch
                    :style="{'border': border, 'background-color':background_color}"
                    v-model="value"
                    :disabled="args.readonly || t_visit"
                    @on-change="handleValueChanged"
            ></i-switch>
            </span>
        </span>
      </section>
    </template>
    <template v-else>
      <section :style="{'align-items': labelXAlignFlex, 'justify-content': labelXAlign}">

        <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': labelXAlign}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="ori-color self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
        <span v-show="!args.hided" :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'height': arg_height,'background-color': args.main_color, 'width': '100%', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
            <i-switch
                    :style="{'border': border, 'background-color':background_color}"
                    v-model="value"
                    :disabled="args.readonly || t_visit"
                    @on-change="handleValueChanged"
            ></i-switch>
            </span>
        </span>
      </section>
    </template>
    <span v-show="isWrong && !args.hided"
          :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
  /*
      插件的js部分
      如果有引用依赖等，在export default 之前进行引用
  */
  import "@/styles/component/iconfont.css"

  const name = "Switch";
  export default {
    // 插件名
    name: name,
    props: [
        'argsProps',
        'query',
        'itemValue',
        'formEngine',
        'dwf_ctx',
      ],
    // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
    data() {
      return {
        // 插件名
        name: name,
        // 展示模式
        t_create: false,
        t_edit: false,
        t_visit: false,
        readonly: false,
        dataTypes: ["Boolean"],
        // 图标地址
        icon_url: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=170167733,3877240552&fm=27&gp=0.jpg",
        // 编辑框
        args: {
          dynamic: false,
          defaultValue: null,
          id: "",
          title: "",
          label: "",
          name: "",
          value: false,
          required: false,
          readonly: false,
          disabled: false,
          hided: false,
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          // 属性插件所需属性
          targetDataType: null,
          // 布局插件所需属性
          height: 30,
          heightType: "px",
          width: 100,
          widthType: '%',
          col: true,
          cols: 3,
          label_fontColor: 'initial',
          lfsize: 14,//标签文字大小
          lfsizeType: 'px',//标签文字大小单位
        },
        // VALUECHANGE
        vChange: null,
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
        // 属性map
        attrMap: {},
        value: false,
        border: null,
        isWrong: false,
        errorMessage: '',
      }
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

      let that = this;
      this.value = this.args.defaultValue || false;
    },
    // 生命周期函数，在dom元素生成之后调用
    mounted() {
      if (this.args.events && this.args.events.length > 0) {
        this.vChange = this.args.events.find((val) => {
          return val.name == '值变化'
        })
      }
      // this.$refs.main.querySelector(".span .ivu-switch .ivu-switch-checked").style.borderColor = 'inherit';
      //this.$refs.main.querySelector(".span .ivu-switch .ivu-switch-checked").style.backgroundColor = 'inherit';
    },
    computed: {
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },
      background_color() {
        if (this.value === true) {
          return this.args.txt_fontColor
        } else {
          return '#ccc'
        }
      },
      args_label_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + ' !important'
      },
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
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
      //使用flex
      labelXAlign() {
        let x = parseInt(this.args.label_align / 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      labelXAlignFlex(){
        let x = this.args.label_align % 3;
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      labelYAlign() {
        let x = this.args.label_align % 3;
        if (x == 0) return "top";
        else if (x == 1) return "middle";
        else return "bottom";
      },
      mainXAlign() {
        let x = parseInt(this.args.main_align / 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      mainYAlign() {
        let x = this.args.main_align % 3;
        if (x == 0) return "top";
        else if (x == 1) return "middle";
        else return "bottom";
      },
    },
    // 定义组件的函数接口
    methods: {
      onDynamic(value) {
        this.setValue(value);
      },
      getValue() {
        if(this.value === ''){
          this.value = false
        }
        return this.value;
      },
      setValue(value) {
        console.log('switch settvalue');
        console.log(value);
        if (value == null) this.value = this.args.defaultValue;
        else this.value = !!value;
        return this;
      },
      // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
      getAllow() {
        return null;
      },
      // 获取编辑框内容
      getArgs() {
        return this.args;
      },
      // 设置基本属性
      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }

        return this;
      },
      // 获取表单项名
      getFormName() {
        return this.args.name;
      },
      // 获取插件的属性编辑框的dom元素
      getEditBox(args) {
        this.t_edit = true;
        return this.$refs.edit;
      },
      // 获取插件名
      getName() {
        return name;
      },
      setError(error, message = '') {
        this.isWrong = error;
        this.border = error ? '1px solid red' : null;
        this.errorMessage = error ? message : '';
        return this;
      },
      validate() {
        let expResult = true;
        // if (this.args.required && this.value == null) expResult = false;
        this.setError(expResult ? null : true);

        return expResult;
      },
      // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
      setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
          this.t_create = true;
          this.readonly = false;
        } else if (type == "edit") {
          this.t_edit = true;
          this.readonly = false;
        } else if (type == "visit") {
          this.t_visit = true;
          this.readonly = true;
        }
        return this;
      },
      // 设置插件的图标
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
      // 设置插件支持的数据类型，返回类型为数据类型的列表
      getDataType(args) {
        return this.dataTypes;
      },
      async handleValueChanged() {
        if (this.vChange) {
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

  .ivu-switch-disabled {
    background-color: #989191 !important;
  }

  .ori-color {
    color: initial;
  }

  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }
</style>
