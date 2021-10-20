<template>
  <section v-if="t_preview" :addinName="name" dropTarget="0" ref="main" :style="{'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <!-- 对于非布局空间,基本都有label标签,有labelWidth, mainWidth属性,表示标签-主区域比例;有labelXAlign,labelYAlign,mainXAlign,mainYAlign属性,表示对齐方式 -->
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
      <span
              :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
    <span v-if="args.required" style="color: red">*</span>
    <label class="self-color" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
    </span>
    </span>
      <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
    'text-align': mainXAlign, 'color': args.main_fontColor}">
        <span
                :style="{'background-color': args.txt_bgColor, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
            <Select
                    class="i-input"
                    @on-change="handleValueChanged"
                    v-model="args.defaultValue"
                    :transfer="true" :multiple="args.selectMuti" :filterable="args.selectFilt" :disabled="args.readonly"
                    :style="{'position': 'relative', 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args.txt_fontColor, 'font-size': args_fsize}"
                    clearable>
            <Option v-for="item in args.selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
        </span>
    </span>
    </template>
    <template v-else>
      <!-- 对于非布局空间,基本都有label标签,有labelWidth, mainWidth属性,表示标签-主区域比例;有labelXAlign,labelYAlign,mainXAlign,mainYAlign属性,表示对齐方式 -->
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block','text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
      <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
      <span v-if="args.required" style="color: red">*</span>
      <label class="self-color" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
      </span>
      </span>
        <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
      'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span
                  :style="{'background-color': args.txt_bgColor, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
              <Select
                      class="i-input"
                      @on-change="handleValueChanged"
                      v-model="args.defaultValue"
                      :transfer="true" :multiple="args.selectMuti" :filterable="args.selectFilt" :disabled="args.readonly"
                      :style="{'position': 'relative', 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args.txt_fontColor, 'font-size': args_fsize}"
                      clearable>
              <Option v-for="item in args.selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
          </span>
      </span>
    </template>
    <!-- 预览模式时，有编辑框的显示；ref属性用于获取指定的dom元素，如ref="x",则在script中用this.$refs.x来选中该dom元素 -->
    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
    <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
             :attributes="filter_attributes"
             :router="router"
             :route="route"
             :root="root"
             :itemValue="itemValue"
             :store="store"
             :query_oprs="query_oprs"
             :dataTypes="dataTypes"
             :targetclass="itemValue.data.targetClass">
    <div slot="attribute">
    <div class="margin1">
      <span class="margin1">自定义选项组</span>
      <i-switch size="small" style="float: right; margin-left: 6px;" v-model="args.useDictionary" @on-change="switchDictionary" />
      <span style="float: right">数据字典</span>
    </div>
    <Input class="margin1" v-model="args.selfOptions" type="textarea" :disabled="args.useDictionary" style="margin-bottom: 6px;"
           placeholder="请输入自定义下拉内容..."/>
    <Button class="margin1" type="primary" :disabled="args.useDictionary" @click="createOptions" style="margin-right: 6px;">确认</Button>
    <Button class="margin1" :disabled="args.useDictionary" @click="resetList">重置</Button>
    <div class="margin1" style="margin: 10px 0 10px 0">
    开启多选
    <i-switch style="float: right" v-model="args.selectMuti" @on-change="changeMuti"/>
    </div>
    <div class="margin1" style="margin: 10px 0 10px 0">
    开启搜索
    <i-switch style="float: right" v-model="args.selectFilt" @on-change="changeSearch"/>
    </div>
</div>
<div slot="layout">
    </div>
    <div slot="operation">
    </div>
    </EditBox>
    </span>

  </section>
  <section v-else :addinName="name" style="text-align: center">
    <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe644;</i>
</div>
<div class="form-addin-name">
    选择框
    </div>
    </span>
  </section>
</template>

<script>
  /*
          插件的js部分
          如果有引用依赖等，在export default 之前进行引用
      */
  import EditBox from "./_EditBox.vue"
  import '@/styles/component/iconfont.css';
  import {getDistinctValues} from "@/api/others.js";

  const name = "SelectInput";
  export default {
    // 插件名
    name: name,
    // 属性值传入:
    //  itemValue: 表单对应的Json结构
    //  attributes: 实体类属性
    //  checkResult: 布局控件使用,用于检查行列变更结果
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],
    components: {
      EditBox
    },
    // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
    data() {
      return {
        times: 0,
        // 插件名
        name: name,

        args_name: "",

        dataTypes: ['String', 'UUID', 'Integer', 'Long', 'Double'],
        // 展示模式
        t_preview: true,
        t_edit: false,
        firstLoad: true,
        // 编辑框

      actEdit: false,
      args: {
          dynamic: false,
          // bindTargetClass: '',
          defaultValue: '',
          bindTargetClass: '',
          filterQuery: '',
          useDictionary: false,
          noNumber: true,
          labelAttr: [],
          valueAttr: [],
          label_fontColor: "initial", // 标签字体颜色
          txt_fontColor: "initial",   // 内容字体颜色
          txt_bgColor: '#fff',        // 输入框背景颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          fsize: 14,                  // 内容文字大小
          fsizeType: 'px',            // 内容文字大小单位
          width: 100,
          widthType: '%',
          label_color: 'initial',
          main_fontColor: 'initial',
          main_color: 'initial',
          title: '选择框',
          id: null,
          _id: "0",
          style: "",
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          _type: "attribute",
          required: false,
          readonly: false,
          hided: false,
          // 属性插件所需属性
          label: "",
          name: "",
          targetDataType: null,
          height: 30,
          heightType: "px",
          col: true,
          cols: 3,
          selfOptions: '',
          selectDis: false,
          selectMuti: false,
          selectFilt: false,
          selectList: [],
          events: [],
          eventRange: ["值变化", "鼠标悬停", "值校验"],
          structural_layout: 'horizontal'   //整体布局
          // 事件操作所需配置
          // oprs: {
          //     "ValueChanged":{
          //         "opr_path": "",
          //         "opr_type": "",
          //     },
          // },
        },
        iconList: [],
        // 继承属性
        inherit: [],

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

        // 属性map
        attrMap: {},

        allow: {},

        switchDisabled: false,

        switchMuti: false,

        switchFilt: false,

        // 事件操作所需属性
        // event_name: "ValueChanged",
        // event_list: ["ValueChanged"],

        timer: null,

        value: null,
      }
    },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
      if(this.t_preview) {
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
    // 生命周期函数，在dom元素生成之后调用
    mounted() {
      if(this.t_preview) {
        this.setHeight();
        setTimeout(() => {
          this.setInheritStyle();
        }, 100);
      }
    },
    watch: {
      args_fcolor(val) {
        this.$refs.main.querySelector("i").style.color = val;
      },
      'args.txt_bgColor'(val){
        this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
            item.style.backgroundColor = val || 'inherit';
          })
          : '';
      },
      arg_name(val) {
        if (val in this.attrMap) {
          this.args.targetDataType = this.attrMap[val].valueType;
          const dType = this.args.targetDataType;
            if (this.t_edit) {
              if (dType == 'Double' || dType == 'Integer' || dType == 'Long') {

                this.args.noNumber = false;
                if(!this.firstLoad) {
                  this.args.valueAttr = '';
                } else {
                  this.firstLoad = false;
                }

              } else {

                this.args.noNumber = true;
                if(!this.firstLoad) {
                  this.args.valueAttr = [];
                } else {
                  this.firstLoad = false;
                }

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
          if (attr && attr.defaultValue)this.value = attr.defaultValue;
        } else this.args.targetDataType = null;
      },
      arg_height(val) {
        this.setHeight();
        this.setInheritStyle();
      },
      'args.defaultValue'(val){
        if(this.timeout){
          clearTimeout(this.timeout);
          this.timeout = setTimeout( () => {
            this.setInheritStyle()
          }, 500);
        }else{
          this.timeout = setTimeout( () => {
            this.setInheritStyle()
            clearTimeout(this.timeout);
            this.timeout = null;
          }, 500);
        }
      }
    },
    computed: {
      // 需要用到属性插件时使用
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },

      args_fcolor() {
        return this.args.txt_fontColor;
      },
      arg_name() {
        return this.args.name;
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
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
      mainWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return !this.args.label || this.args.label == "" ? "100%": `calc(100% - ${this.args.label_widthByPx}px)`;
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
      mainYAlign() {
        let x = this.args.main_align % 3;
        if (x == 0) return "top";
        else if (x == 1) return "middle";
        else return "bottom";
      },
      // end
      // 需要用到实体类属性列表时使用
      filter_attributes() {
        return this.attributes ? (this.relation ?
          ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
      },
      // end
    },
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      ;
    },
    // 定义组件的函数接口
    methods: {
      setInheritStyle() {
        try {
          this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length != 0
            ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = this.args.txt_bgColor;
              item.style.height = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.height = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
              item.style.lineHeight = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close') && this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.top = this.args.height < 2 && this.args.heightType == 'px' ? "4px" : (this.args.height - 30) / 2 + (30 - this.args.fsize) / 4 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-input') && this.$refs.main.querySelectorAll('.i-input .ivu-select-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-input').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
              item.style.textAlign = this.mainXAlign;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = '#c5c8ce';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
              item.style.backgroundColor = this.args.txt_bgColor;
            })
            : '';
        } catch (e) {

        }
      },
      resetList() {
        this.args.selfOptions = '';
        this.args.selectList = [];
      },
      handleValueChanged() {
        // setTimeout(() => {
        //   this.setInheritStyle()
        // }, 100);
      },
      // 动态获取Options
      async initDOptions(className, attrName) {
        if(className.indexOf('left_') != -1 || className.indexOf('right_') != -1) {
          className = className.split('_')[1];
        }
        let res = await getDistinctValues(className, attrName);
        if (res && res.data && res.data.data) {
          this.args.selectList = [];
          res.data.data.forEach(x => {
            if(typeof x == 'object') {

              for(var k in x){
                this.args.selectList.push({
                  label: x[k],
                  value: k
                })
              }
            } else {
              this.args.selectList.push({
                label: x,
                value: x
              })
            }
          })
        }
      },

      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        if (!this.$refs.main) return;
        let that = this;
        if (this.timer == null) {
          this.timer = setInterval(() => {
            if (!that.$refs.main) {
              clearInterval(that.timer);
              that.timer = null;
              return;
            }
            // 改成你需要的样式
            var dom = that.$refs.main.querySelector(".ivu-select-selection");
            if (dom) {
              dom.style.height = that.arg_height;
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

      setDisplayType(type) {
        if (type == 0) this.t_preview = true;
        else this.t_preview = false;
        return this;
      },


      // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
      getAllow(dropTarget) {
        return null;
      },

      // 获取可继承属性
      getInherit(dropTarget) {
        var res = {};
        let that = this;
        this.inherit.forEach(x => res[x] = that.args.children[dropTarget][x]);
        return res;
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

        if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }

        if ("name" in args) this.args_name = this.args.name;

        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox(args) {
        this.t_edit = true;
        return this.$refs.edit;
      },

      getName() {
        return name;
      },

      getDataType(args) {
        return this.args.dataTypes;
      },

      switchDictionary(value) {

        if(!value) {
            if(this.args.selfOptions != '') {
              this.createOptions();
            } else {
               this.args.selectList = [];
            }
        }

    },

      // 确认创建Options
      createOptions() {
        if (this.args.selfOptions == '') {
          this.$Message.info('请先输入所需自定义下拉框内容');
        } else {

          this.args.selectList = [];
          if(this.args.selectMuti) {
            this.args.defaultValue = [];
          } else {
            this.args.defaultValue = '';
          }

          // 中英文逗号替换
          this.args.selfOptions = this.args.selfOptions.replace(/，/ig, ',');
          let optionAttr = this.args.selfOptions.split(',');
          optionAttr.forEach((item, index) => {
            if (item != '') {

              if (item.indexOf(':') == -1) {     // label 与 value相同时

                const dType = this.args.targetDataType;
                if(dType == 'Double' || dType == 'Integer' || dType == 'Long') {
                  item = parseFloat(item)
                }
                let eachOption = {
                  label: item,
                  value: item
                }
                this.args.selectList.splice(index, 0, eachOption);

              } else {                           // label 与 value不同

                const dType = this.args.targetDataType;
                let intValue = item.split(":")[1];
                if(dType == 'Double' || dType == 'Integer' || dType == 'Long') {
                  intValue = parseFloat(item.split(":")[1])
                }

                let eachOption = {
                  label: item.split(":")[0],
                  value: intValue
                }
                this.args.selectList.splice(index, 0, eachOption);
              }

            }
          })
        }
      },

      // 是否开启禁用
      changeDisabled(status) {

        this.args.selectDis = status;
      },

      changeSearch() {
        this.$nextTick(()=> {
          this.$refs.main.querySelectorAll('.i-input .ivu-select-input').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.lineHeight = this.arg_height;
            item.style.height = this.arg_height;
            item.style.textAlign = this.mainXAlign;
          })
        })
      },

      // 是否开启多选
      changeMuti(status) {
        if (status) {
          this.args.defaultValue = [];
        } else {
          this.args.defaultValue = '';
        }
        this.args.selectMuti = status;
      },


    }
  };
</script>
<style>
  .i-input .ivu-select-dropdown{
    width: 100% !important;
  }
  .i-input .ivu-select-selection div {
    overflow: hidden;
    white-space: nowrap;
  }
</style>
<style scoped>
  /*
      插件的css部分
      设置display为inline，默认不换行
      scoped表示样式仅在该vue文件内有效
  */
  section {
    display: inline-block;
    width: 100%;
    /* min-height: 48px; */
  }
</style>
