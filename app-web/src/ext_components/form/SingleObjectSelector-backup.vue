<template>
  <section v-show="!args.hided" id="inputDiv" :addinName="name"  dropTarget="0" ref="main" :style="{'width': colWidth}">
        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'padding-right': '10px'}">
            <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': labelYAlign}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
    <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
    <span :style="{'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">

            <span v-show="!args.hided" :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <div v-if="!remoted">
                    <Select ref="sos"
                            class="i-input self-color"
                            v-if="!needPop"
                            v-model="selectedObject"
                            :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                            clearable
                            :transfer="true"
                            :disabled="args.readonly || t_visit"
                            @mouseenter.native="hoverEvent"
                            @on-open-change="handleDropDown"
                            @on-change="handleSelectedObjectChange">
                        <Option v-for="(item, index) in browseList" :value="item.value" :key="index" :label="item.label">
                            <span class="self-color">{{ item.slotLabel }}</span>
                        </Option>
                        <Option value=""></Option>
                    </Select>

                    <Poptip v-else trigger="hover" :placement="popHoverDirection" :width="popHoverObj.popWidth">
                        <Select ref="sos"
                                v-model="selectedObject"
                                class="i-input self-color"
                                :style="{'height': arg_height, 'width': relWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                                clearable
                                :transfer="true"
                                :disabled="args.readonly || t_visit"
                                @mouseenter.native="hoverEvent"
                                @on-open-change="handleDropDown"
                                @on-change="handleSelectedObjectChange">
                            <Option v-for="(item, index) in browseList" :value="item.value" :key="index" :label="item.label">
                                <span class="self-color">{{ item.slotLabel }}</span>
                            </Option>
                            <Option value=""></Option>
                        </Select>
                        <div v-show="popHoverObj.needPopTitle" slot="title"><span :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    ref="form"
                                    :to_path="popHoverPath"
                                    :to_query="popHoverQuery"
                                    :store="store">
                            </FormEngine>
                        </div>
                    </Poptip>

                </div>
                <div v-else>
<!--                    <Select ref="sos"-->
                  <!--                    v-if="!needPop"-->
                  <!--                            class="i-input self-color"-->
                  <!--                    v-model="selectedObject"-->
                  <!--                    :style="{'border': border, 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize}"-->
                  <!--                    clearable-->
                  <!--                    :disabled="args.readonly || t_visit"-->
                  <!--                    :transfer="true"-->
                  <!--                    :placeholder="'远程模式，输入后开始搜索'"-->
                  <!--                    filterable-->
                  <!--                    remote-->
                  <!--                    :remote-method="remoteMethod"-->
                  <!--                    :loading="loadSelect"-->
                  <!--                    @on-open-change="handleDropDown"-->
                  <!--                    @mouseenter.native="hoverEvent"-->
                  <!--                    @on-change="handleSelectedObjectChange">-->
                  <!--                        <Option v-for="(item, index) in remoteOption" :value="item.value" :key="item.value" :label="item.label">-->
                  <!--                            <span class="self-color">{{ item.slotLabel }}</span>-->
                  <!--                        </Option>-->
                  <!--                    </Select>-->
                        <Select
                                ref="sos"
                                v-model="selectedObject"
                                class="i-input self-color"
                                v-if="!needPop"
                                filterable
                                remote
                                :transfer="true"
                                clearable
                                :disabled="args.readonly || t_visit"
                                :style="{'border': border, 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                                :placeholder="'远程模式，输入后开始搜索'"
                                :remote-method="remoteMethod"
                                :loading="loadSelect"
                                @on-open-change="handleDropDown"
                                @mouseenter.native="hoverEvent"
                                @on-change="handleSelectedObjectChange">
                        <Option v-for="(option, index) in remoteOption" :value="option.value" :key="index" :label="option.label">{{option.slotLabel}}</Option>
                        <Option value=""></Option>
                      </Select>
                    <Poptip v-else trigger="hover" :placement="popHoverDirection" :width="popHoverObj.popWidth">
                        <Select
                                ref="sos"
                                v-model="selectedObject"
                                class="i-input self-color"
                                v-if="!needPop"
                                filterable
                                remote
                                :transfer="true"
                                clearable
                                :disabled="args.readonly || t_visit"
                                :style="{'border': border, 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                                :placeholder="'s，输入后开始搜索'"
                                :remote-method="remoteMethod"
                                :loading="loadSelect"
                                @on-open-change="handleDropDown"
                                @mouseenter.native="hoverEvent"
                                @on-change="handleSelectedObjectChange">
                        <Option v-for="(option, index) in remoteOption" :value="option.value" :key="index" :label="option.label">{{option.slotLabel}}</Option>
                        <Option value=""></Option>
                      </Select>
                        <div v-show="popHoverObj.needPopTitle" slot="title"><span :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    ref="form"
                                    :to_path="popHoverPath"
                                    :to_query="popHoverQuery"
                                    :store="store">
                            </FormEngine>
                        </div>
                    </Poptip>
                    <Spin fix v-if="spinShow">远程搜索中...</Spin>
                </div>
            </span>
        </span>
    <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
            <span v-show="isRequired" class="wrongTips">该项不能为空</span>
            <span v-show="isWrong" class="wrongTips">{{ args.ruleMessage }}</span>
        </span>
  </section>

</template>

<script>

  import EntityModeling from "@/api/data-model/EntityModeling";
  import "@/styles/component/iconfont.css"
  import { getQueryOperation, getEobj } from "@/api/others";
  import FormEngine from '@/views/form-engine/forms-engine.vue'

  const name = "SingleObjectSelector-backup";

  export default {
    beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
    },
    name: name,

    // itemValue: 从表单建模/表单引擎传入的当前表单对象
    props: ['itemValue', 'store'],

    data() {
      return {
        timer: null,
        times: 0,
        name: name,

        // 展示模式
        t_create: false,
        t_edit: false,
        t_visit: true,
        loadSelect: false,
        spinShow: false,
        loadTime: 1,
        dynamicValue: '',
        isDynamicValue: false,
        isWrong: false,
        isRequired: false,

        needPop: false,
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
        popHoverObj: {
          needPopTitle: false,
          popTitleTxt: '提示',
          popTitleFs: 14,
          popTitleColor: '#333',
          tipPlacement: 'right',
          popWidth: 400
        },
        popHoverDirection: 'right',
        popHoverPath: '',
        popHoverQuery: {
          query: ''
        },
        isHover: null,
        pWidth: 0,

        // 图标地址
        icon_url: "",

        // 支持的数据类型
        dataTypes: ['String', 'Integer', 'Boolean', 'Long', 'UUID', 'Double'],

        // 编辑框
        args: {
          id:"",
          title:"单对象下拉框",
          label: "",
          name: "",
          refClass: null,
          returnFormat: [],
          returnSelectFormat: [],
          displayFormat: [],
          browseAttributes: [],
          filterAttributes: [],
          remoted: false,
          groupName: null,
          required: false,
          readonly: false,
          disabled: false,
          hided: false,
          // label所需属性
          dynamic: false,
          label_fontColor: "initial", // 标签字体颜色
          txt_fontColor: "initial",   // 内容字体颜色
          txt_bgColor: '#fff',        // 输入框背景颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          fsize: 12,                  // 内容文字大小
          fsizeType: 'px',            // 内容文字大小单位
          width: 100,
          widthType: '%',
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          _id: "0",
          basic_height: 20,
          _type: "attribute",
          height: 30,
          heightType: "px",
          col: true,
          cols: 3,
          // 属性插件所需属性
          targetDataType: null,
          relation: "",
          relation_attr: "",
          relation_class: "",
          relation_class_attr: "",
        },

        remoteOption: [],

        // VALUECHANGE
        vChange: null,

        // 插件的字符串返回值，由回填格式定义
        selectedObject: null,
        selectedObjectCache: null,
        remoted: true,//默认全为远程
        // 所有的实体类数组，用于选择refClass
        allEntityClasses: [],
        // 所选的实体类的属性数组，用于选择browseAttribute，returnFormat，displayFormat
        refClassAttributes: [],
        // 所选的实体类的对象数组
        objectList: [],
        // editFilterAttributes对话框flag
        showEditModal: false,
        // 用于辅助删除FilterAttributes
        filterAttributesIndex: 0,
        // 当前表单编辑对象
        formObject: {},

        // 用于从VUEX中查询数据
        queryData: {
          query: {query: "",}, // 查询条件
          targetClass: "",    // 目标类名
          formName: "",   //
          uuid: ""
        },

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
        relationAttrMap: {},
        relationClassAttrMap: {},

        allow: {},

        border: null,
      }
    },
    components: {
      FormEngine
    },
    created() {
      let that = this;
    },
    computed: {

      args_fsize(){
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      args_label_fontColor(){
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + '!important'
      },
      args_txt_fontColor(){
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? this.args.txt_fontColor : this.args.txt_fontColor + '!important';
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      labelWidth() {
        return parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      },
      mainWidth() {
        return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
      },
      relWidth() {
        return this.pWidth * 0.6 + 'px';
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


      // 用于展示当前过滤字段
      filterJSON: function () {
        return this.args.filterAttributes.map(item => {return item.refClassAttribute + ": " + item.targetClassAttribute;}).join("\n");
      },

      // 根据filterAttributes生成，过滤objectList中属性值与filterObject相同的Object
      filterObject: function () {
        let result = {};
        this.args.filterAttributes.forEach(f => {
          if(this.formObject.hasOwnProperty(f.targetClassAttribute)) {
            result[f.refClassAttribute] = this.formObject[f.targetClassAttribute];
          }
        });
        return result;
      },

      // 使用filterObject过滤objectList
      filteredList: function () {
        return this.objectList.filter(object => {
          for (const attr in this.filterObject) {
            if(this.filterObject[attr] != object[attr]) {
              return false;
            }
          }
          return true;
        });
      },

      // 用于下拉框插件实际展示的对象数组，经过浏览字段与回填字段的格式转换
      browseList: function () {
        return this.filteredList.map(object => {
          return {
            // label:下拉框显示项
            slotLabel: this.args.browseAttributes.length !== 0 ?
              (this.args.browseAttributes.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // label:下拉框回填显示项
            label: this.args.returnSelectFormat.length !== 0 ?
              (this.args.returnSelectFormat.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // value:点选器返回值
            value: this.args.returnFormat.length !== 0 ?
              (this.args.returnFormat.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // object:被点选的对象，用于联动
            object: object,
          }
        });
      },

      groupInfo: function () {
        let groupSize = this.getGroupElements().length;
        return groupSize > 0 ?
          `该联动组有${groupSize}个组件` : `该组件未设置联动组`;
      },

      filter_refClassAttributes: function () {
        return this.refClassAttributes.filter(attr => attr.valueType === this.args.targetDataType);
      }
    },
    beforeMount(){

    },
    mounted () {
      this.setHeight();
      // 定制值变化事件
      if(this.args.events && this.args.events.length > 0) {

        // 鼠标悬停事件
        this.isHover = this.args.events.find((val) => {
          return val.name == '鼠标悬停'
        })

        if(this.isHover != null && this.isHover.opr_path != undefined && this.isHover.opr_path != '') {
          getQueryOperation(this.isHover.opr_path).then(response => {

            let res = response.data;
            if(res.success && res.data) {

              let oName = res.data.conType;

              if(oName == 'tip') {

                this.popHoverObj = JSON.parse(res.data.viewType);
                this.popHoverDirection = this.actions[this.popHoverObj.tipPlacement];
                this.popHoverPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
                this.needPop = true;
                this.pWidth = document.getElementById("inputDiv").offsetWidth;

              } else {

                this.needPop = false;

              }
            } else {
              console.log(res.message);
            }

          }).catch(e => {
            console.log(e);
          });
        }

        this.vChange = this.args.events.find((val) => {
          return val.name == '值变化'
        })

      }

      // 初始化：获取所有实体类allEntityClasses以备选择
      EntityModeling.getAllEntities()
      .then(res => {
        this.allEntityClasses = res.data;
        EntityModeling.getAllResources()
        .then(res => {
          this.allEntityClasses = this.allEntityClasses.concat(res.data);
        })
        .catch(error => {
          this.$Message.error('获取资源类失败：' + error.response.data.message);
        });
      })
      .catch(error => {
        this.$Message.error('获取实体类失败：' + error.response.data.message);
      });

      this.queryData.targetClass = this.args.refClass;
      this.updateObjects();
    },
    watch: {

    },
    methods: {
      async onDynamic(value){
        // this.isDynamicValue = true;
        // this.dynamicValue = value;
        await this.updateObjects();
        this.setValue(value);
      },
      setInheritStyle() {
        if(sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_bgColor == '#fff'){
          this.args.txt_bgColor = 'initial';
        }
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
          this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = '#c5c8ce';
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
              item.style.webkitTextFillColor = 'inherit';
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
      setHeight() {
        if (!this.$refs.main) return;
        let that = this;
        if (this.timer == null) {
          this.timer = setInterval(() => {
            if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
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

      getValue() {
        // return this.selectedObject;
        if (this.args.targetDataType === "String") {
          return this.selectedObject;
        }
        else if(this.args.targetDataType === "Integer") {
          return parseInt(this.selectedObject);
        }
        else if(this.args.targetDataType === "Boolean") {
          return this.selectedObject === "true";
        }
        else if(this.args.targetDataType === "Long") {
          // TODO:
          return parseInt(this.selectedObject);
        }
        else if(this.args.targetDataType === "UUID") {
          return this.selectedObject;
        }
        else if(this.args.targetDataType === "Date") {
          return this.selectedObject;
        }
        else if(this.args.targetDataType === "Double") {
          return parseFloat(this.selectedObject);
        }
        else if(this.args.targetDataType === "Clob") {
          // TODO:
          return this.selectedObject;
        }
        else if(this.args.targetDataType === "TimeStamp") {
          // TODO:
          return this.selectedObject;
        }
        else {
          // TODO:
          return this.selectedObject;
        }
      },

      async setValue(value) {

        if (value == null) {
          this.selectedObject = '';
          return this;
        }
        this.selectedObject = value + '';
        // this.selectedObjectCache = value + '';
        if (this.t_create) {
          this.loadTime = 1;
        }
        setTimeout(() => {
          this.setInheritStyle()
        }, 200);
        return this;

        // this.selectedObject = this.objectList[0][this.args.returnSelectFormat];

      },

      getAllow() {
        return null;
      },

      // 获取可继承属性
      getInherit() {
        var res = {};
        let that = this;
        this.inherit.forEach(x => res[x] = that.args[x]);
        return res;
      },

      // 获取编辑框内容
      getArgs() {
        return this.args;
      },

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

      getEditBox(args) {
        if (!args) {
          this.t_edit = true;
          return this.$refs.edit;
        } else if (args == "col") {
          this.t_edit_col = true;
          return this.$refs.edit_col;
        } else if (args == "row") {
          this.t_edit_row = true;
          return this.$refs.edit_row;
        }
      },

      getName() {
        return name;
      },

      setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
          this.t_create = true;
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

      // 设置异常状态显示
      setError(error) {
        this.border = error ? '1px solid red' : null;
        return this;
      },

      // 设置校验逻辑,返回true/false
      validate() {
        let expResult = true;
        let _value = this.selectedObject;

        if (this.args.required && (_value == null || _value == 'null' || _value == '')) {
          this.isWrong = false;
          this.isRequired = true;
          expResult = false;
        } else if ((_value != '' || _value != null) && this.args.rule) {

          this.isRequired = false;
          expResult = new RegExp(this.args.rule).test(_value);

        } else {
          console.log(_value);
        }

        this.setError(expResult ? null : true);

        this.isWrong = !expResult;

        return expResult;
      },

      setIcon(id) {
        this.icon_url = id;
        return this;
      },

      getDataType(args) {
        return this.dataTypes;
      },

      handleRefClassChange() {
        if(this.t_preview) {
          this.args.returnFormat = [];
          this.args.displayFormat = [];
          this.args.browseAttributes = [];
          this.args.filterAttributes = [];
          this.args.groupName = null;
        };
      },

      addFilterAttribute() {
        let len = this.args.filterAttributes.length;
        let index = len === 0 ? 1 : this.args.filterAttributes[len-1].index + 1;
        this.args.filterAttributes.push({
          // 为了执行删除操作，filterAttributes需要一个递增的index
          index: index,
          refClassAttribute: 'oid',
          targetClassAttribute: 'oid'
        });
      },

      removeFilterAttribute(index) {
        this.args.filterAttributes = this.args.filterAttributes.filter(item => {return item.index !== index});
      },

      // 找出当前itemValue中所有组件对象
      getAllElements(json) {
        let result = [];
        for (var element of json) {
          result.push(element.obj);
          result = result.concat(this.getAllElements(element.elements));
        }
        return result;
      },

      hoverEvent() {
        if(this.isHover && this.isHover != undefined) {
          this.invokeOperation(this.isHover.opr_type, this.isHover.opr_path, this.itemValue, this.store);
        }
      },

      // 选择表单项名时，同步修改表单项标签
      handleNameChange(value) {
        this.args.label = value.label;

      },

      async updateObjects() {

        // let handelEvent = await this.handleQueryData(this.queryData); // vuex做好缓存准备
        // let uidList = this.getEn(this.queryData.targetClass);
        // uidList.forEach( uid => {
        //   this.objectList.push(this.getClassObject(this.queryData.targetClass, uid));
        // })
        let data = await getEobj(this.queryData.targetClass);
        this.objectList = data.data.data;
        setTimeout(() => {
          this.setInheritStyle()
        }, 100);
        // let that = this;
        // setTimeout(() => {
        //     console.log(that.browseList, that.remoteOption);
        //     that.selectedObject = that.objectList[0][that.args.returnSelectFormat];
        // }, 100);

        // 如果对象数据超过100条 并且用户没开启远程模式 app端自动开启远程模式 防止页面卡顿崩溃(当然不是说100条就会卡顿..防止上万的下拉数据DOM渲染)
        if(this.browseList.length <= 100 && !this.args.remoted) this.remoted = false;

        if(!this.remoted) {
          // this.selectedObject = this.objectList[0][this.args.returnFormat[0]];
        }else{
          // this.initRemoteOptions();
          if(this.t_create){

          }else{
            // this.selectedObject = this.selectedObjectCache || this.objectList[0][this.args.returnFormat[0]];
            this.handleSelectedObjectChange(this.selectedObject);
          }
        }
      },
      // 当点击下拉框时，更新formObject，更新过滤属性
      handleDropDown(value) {
        // 弹出下拉框时，设置formObject，应用过滤效果
        if(value) {
          let result = {};
          this.getAllElements(this.itemValue.data.elements).forEach(element => {
            element.getFormName ? result[element.getFormName()] = element.getValue() : '';
          });
          this.formObject = result;
        }
        // 收起下拉框时，清空formObject，取消过滤效果
        else {
          // 为了显示效果需要延迟清空
          setTimeout(() => {
            this.formObject = {};
          }, 250);
          setTimeout(() => {
            this.$refs.main.querySelectorAll('.ivu-select-selection .ivu-select-input') ? this.$refs.main.querySelectorAll('.ivu-select-selection .ivu-select-input').length !== 0 ? this.$refs.main.querySelectorAll('.ivu-select-selection .ivu-select-input')[0].value = this.selectedObject : '' : '';
          },0)
        }
      },

      // 找出当前itemValue中所有groupName相同的组件对象
      // 前提要求：引用类名也相同
      traversalJson(json) {
        let result = [];
        for (var element of json) {
          (element.self.properties.groupName === this.args.groupName) &&
          (element.self.properties.refClass === this.args.refClass) ?
            result.push(element.obj) : null;
          result = result.concat(this.traversalJson(element.elements));
        }
        return result;
      },

      getGroupElements() {
        // 如果groupName为空字符或者null，则不计入任何联动组
        return this.args.groupName ? this.traversalJson(this.itemValue.data.elements) : [];
      },

      handleGroupNameChange() {

      },

      // TODO: 在过滤属性编辑框，根据引用类属性过滤目标类属性
      // TODO: 或者将两个类属性转化为字符串后比较

      // 当组件返回值变化时，进行联动
      handleSelectedObjectChange(value) {
        setTimeout(() => {
          this.setInheritStyle()
        }, 100);
        this.isWrong = false;
        this.isRequired = false;
        this.setError(false);
        // 清空操作
        if(!value) {
          console.log("value == undefined");
          return;
        }
        // 筛选出当前联动对象groupObject
        // TODO: 筛选的有点粗糙，感觉不太对劲儿
        let groupObject = this.browseList.filter(item => {return item.value === value}).length != 0 ? this.browseList.filter(item => {return item.value === value})[0].object : {};
        // 联动同组元素
        // this.setGroupObject()
        this.getGroupElements().forEach(item => {
          item.setGroupObject(groupObject);
        });
        let groupEle = this.getGroupElements();
        if(groupEle.length == 0) {
          this.setGroupObject(groupObject);
        }

        if(this.vChange) {
          this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
        }
      },

      // 接受同联动组组件传来联动对象，根据自身情况修改组件返回值
      setGroupObject(object) {
        if(this.remoted) {
          let finalObj = this.args.returnSelectFormat.length !== 0 ?
            (this.args.returnSelectFormat.map(attr => {
              return object[attr];
            }).join("-"))
            : object.oid;

          this.remoteMethod(finalObj);
        }
        this.selectedObject = this.args.returnFormat.length !== 0 ?
          (this.args.returnFormat.map(attr => {
            return object[attr];
          }).join("-"))
          : object.oid;

      },

      remoteMethod(query) {
        if(this.loadTime != 0){
          this.loadTime--;
          return
        }
        this.spinShow = true;
        if (query !== '') {
          this.loadSelect = true;
          setTimeout(() => {
            this.loadSelect = false;
            this.remoteOption = this.browseList.filter(item => item.slotLabel.toLowerCase().indexOf(query.toLowerCase()) != -1);
          }, 100);
          setTimeout(() => {
            this.spinShow = false;
          }, 1000)
        } else {
          //不能清空remoteOption,会造成二次handleSelectedObjectChange触发，导致回填值为undefined，可能是iview内部机制问题
          // this.remoteOption = [];
          setTimeout(() => {
            this.spinShow = false;
            //iview插件文档问题label失效，手动设置输入框值
            this.$refs.main.querySelectorAll('.i-input .ivu-select-input') && this.$refs.main.querySelectorAll('.i-input .ivu-select-input').length != 0
              ? this.$refs.main.querySelectorAll('.i-input .ivu-select-input').forEach(item => {
                item.value = this.selectedObject;
              })
              : '';
          }, 200)

        }
      },

      initRemoteOptions(){
        this.remoteOption = this.browseList;
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
</style>
