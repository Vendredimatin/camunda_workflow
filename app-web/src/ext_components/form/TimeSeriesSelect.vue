<template>
  <section :addinName="name" id="inputDiv" dropTarget="0" ref="main" :style="{'width': colWidth}"  v-show="!args.hided">
    <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
    'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
      <span v-show="!args.hided"
        :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
          <span v-if="args.required" style="color: red">*</span>
          <label class="self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
      </span>
    </span>
    <span :style="{'width': mainWidth, 'display': 'inline-block',
      'text-align': mainXAlign, 'color': args.main_fontColor}">
      <span v-show="!args.hided"
        :style="{'background-color': args.main_color, 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
        <div style="display: inline-block;width: calc(100% - 70px);background-color: inherit;">
          <Cascader
            class="i-input  self-color"
            :disabled="args.readonly || t_visit"
            filterable
            transfer
            :style="{'font-size':args_fsize,'color': args_fcolor,'border': border, 'text-align': mainXAlign}"
            :data="allTimeseries"
            :load-data="loadTimeseries"
            v-model="selectedTimeseries"
            @on-change="bindTimeseries"
          ></Cascader>
        </div>
        <div style="display: inline-block;width: 70px;text-align:right">
          <Button
            type="primary"
            size="small"
            icon="ios-search"
            title="预览"
            style=" margin: 3px; display: inline-block;"
            :disabled="!isTimeseriesValid"
            @click="previewTimeseries"
          ></Button>

<!--          <Button-->
<!--            type="primary"-->
<!--            size="small"-->
<!--            icon="md-checkmark"-->
<!--            title="绑定"-->
<!--            style="display: inline-block;"-->
<!--            :disabled="!isTimeseriesValid"-->
<!--            @click="bindTimeseries"-->
<!--            :loading="bindTimeseriesLoading"-->
<!--          ></Button>-->
        </div>
        <Modal
          v-model="previewTsDataModal"
          title="预览时间序列"
          :mask-closable="false"
        >
          <div style="clear: both; margin: 10px">
            <Table
              style="margin: 5px"
              :loading="previewTsDataLoading"
              show-header
              size="small"
              :data="previewTsData"
              :columns="previewTsDataColumns"
            >
            </Table>
          </div>
          <div slot="footer">
            <i-button type="primary" size="large" @click="previewTsDataModal = false">确认</i-button>
          </div>
        </Modal>
      </span>

    </span>

    <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
        <span v-show="isRequired" class="wrongTips">该项不能为空</span>
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>
  </section>
</template>

<script>
import { getAllIotdbs, getAllDevices, getTimeSeriesByDevice, previewTimeseries} from "@/api/others.js";
import "@/styles/component/iconfont.css"

const name = "TimeSeriesSelect";
const isEmpty = str => {
  return str === undefined || str === null || str.trim() === '';
};

export default {
  name: name,
  // itemValue: 从表单建模/表单引擎传入的当前表单对象
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
      name: name,
      // 展示模式
      t_create: false,
      t_edit: false,
      t_visit: true,
      border: null,
      isWrong: false,
      isRequired: false,
      errorMessage: '',

      // 失去焦点 and 值变化
      isBlur: null,
      vChange: null,
      isHover: null,
      hoverAction: '',
      isFocus: null,

      // 支持的数据类型
      dataTypes: ['Timeseries'],

      // 编辑框
      args: {
        label_fontColor: "initial", // 标签字体颜色
        label_color: "initial", // 标签字体颜色
        txt_fontColor: "initial",   // 内容字体颜色
        txt_bgColor: '#fff',        // 输入框背景颜色
        lfsize: 14,                 // 标签文字大小
        lfsizeType: 'px',           // 标签文字大小单位
        fsize: 14,                  // 内容文字大小
        fsizeType: 'px',            // 内容文字大小单位
        width: 100,
        widthType: '%',
        id: "",
        title: "时序点选器",
        label: "",
        name: "",
        required: false,
        readonly: false,
        hided: false,
        // label所需属性
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        _id: "0",
        _type: "attribute",
        height: 30,
        heightType: "px",
        col: true,
        cols: 3,
        // 属性插件所需属性
        targetDataType: null,
        // 弹窗所需属性
        modalQuery: {query: ''},
        events: [],
        eventRange: [],

        // 事件操作所需配置
        // oprs: {
        //     "ValueChanged":{
        //         "opr_path": "",
        //         "opr_type": "",
        //     },
        // },

      },

      // 选择时间序列对话框flag
      showEditModal: false,
      // 输入过滤关键词
      searchKeyword: "",

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
      allow: {},

      timer: null,

      // 该控件特有属性
      allTimeseries: [],
      selectedTimeseries: [],
      previewTsDataModal: false,
      previewTsData: [],
      previewTsDataLoading: false,
      previewTsDataColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "时间戳",
          key: "timestamp",
          tooltip: true
        },
        {
          title: "值",
          key: "value",
          tooltip: true
        },
      ],
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

    this.getAllIotdbs();
  },
  computed: {
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    args_fcolor() {
      return this.args.txt_fontColor == 'initial' ? 'initial' : this.args.txt_fontColor + ' !important';
    },
    args_lfcolor() {
      return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
    },
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + '!important';
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
    // 需要用到引用类属性列表时使用
    arg_name() {
      return this.args.name;
    },

    isTimeseriesValid() {
      let el = this.selectedTimeseries;
      if (!el || el.length !== 3) return false;
      return !(isEmpty(el[0]) || isEmpty(el[1]) || isEmpty(el[2]));
    },
  },
  watch: {
    arg_height(val) {
      this.setHeight();
      this.setInheritStyle();
    },
    'args.enSelect'(val) {
      if(val) {
        let self = this;
        setTimeout(function() {
          self.setInheritStyle();
        }, 500);
      }
    },
  },
  mounted() {
    // 初始化
    this.$nextTick(() => {
      this.setHeight();
      this.setInheritStyle();
    })
    // 字体/颜色/ 默认继承
    if(this.$refs.main.querySelector(".ivu-select-item")){
      this.$refs.main.querySelector(".ivu-select-item").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".ivu-select-item").style.color = 'inherit';
    }
    if(this.$refs.main.querySelector(".ivu-cascader-menu-item")){
      this.$refs.main.querySelector(".ivu-cascader-menu-item").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".ivu-cascader-menu-item").style.color = 'inherit';
    }
    if(this.$refs.main.querySelector(".ivu-input")){
      this.$refs.main.querySelector(".ivu-input").style.textAlign = this.mainXAlign;
    }

    if(this.args.events && this.args.events.length > 0) {

      // 鼠标悬停事件
      this.isHover = this.args.events.find((val) => {
        return val.name == '鼠标悬停'
      })

      // 获得焦点事件
      this.isFocus = this.args.events.find((val) => {
        return val.name == '获得焦点'
      })

      if(this.isHover != null && this.isHover.opr_path != undefined && this.isHover.opr_path != '') {
        getQueryOperation(this.isHover.opr_path).then(response => {

          let res = response.data;
          if(res.success && res.data) {

            let oName = res.data.conType;
            this.hoverAction = oName;

            if(oName == 'tip') {

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

        }).catch(e => {
          console.log(e);
        });
      }

      this.vChange = this.args.events.find((val) => {
        return val.name == '值变化'
      })

      this.isBlur = this.args.events.find((val) => {
        return val.name == '失去焦点'
      })

    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    setInheritStyle() {
      try {
        this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.height = 'inherit';
            item.style.color = 'inherit';
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.height = this.arg_height;
            item.style.lineHeight = this.arg_height;
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.height = this.arg_height;
            item.style.lineHeight = this.arg_height;
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.lineHeight = this.arg_height;
            item.style.height = this.arg_height;
            item.style.backgroundColor = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length !== 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
            if(this.args.txt_bgColor == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.txt_bgColor = 'transparent';
            item.style.backgroundColor = this.args.txt_bgColor;
          }): '';

      } catch (e) {

      }
    },

    // 设置异常状态显示
    setError(error, message = '') {
      this.isWrong = error;
      this.border = error ? '1px solid red' : null;
      this.errorMessage = error ? message : '';
      return this;
    },

    // 设置校验逻辑,返回true/false
    validate() {
      let expResult = true;
      if (this.args.required && (this.selectedTimeseries && this.selectedTimeseries.length === 0)) {
        this.isRequired = true;
        expResult = false;
      }else if(this.selectedTimeseries.length !== 0){
        this.isRequired = false;
      }
      this.setError(expResult ? null : true);
      return expResult;
    },


    // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
    getValue() {
      console.log('getValue', this.selectedTimeseries);
      return this.selectedTimeseries;
    },

    /*
      设置插件对应的值,
      items目前为对应值
      items将为目标对象列表
      特殊情况下需要进行格式转化再赋值
    */
    setValue(val) {
      if (val === null || val === undefined || val.length === 0) this.selectedTimeseries = "defaultValue" in this.args ? this.args.defaultValue : [];
      else if (typeof(val) == 'string' && val.slice(0, 8) === 'iotdb://') {
        let dataSourceName = val.split('//')[1].split('?')[0];
        let queryParams = new URLSearchParams(val.split('?')[1]);
        let devicePath = queryParams.get('devicepath');
        let timeseries = queryParams.get('timeseries');
        this.selectedTimeseries = [dataSourceName, devicePath, timeseries];
      } else if (val && val.length === 3 && val[0] === 'iotdb:') {
        let dataSourceName = val[2].split('?')[0];
        let queryParams = new URLSearchParams(val[2].split('?')[1]);
        let devicePath = queryParams.get('devicepath');
        let timeseries = queryParams.get('timeseries');
        this.selectedTimeseries = [dataSourceName, devicePath, timeseries];
      } else if (val && val.length === 3) {
        this.selectedTimeseries = [...val];
      } else {
        this.selectedTimeseries = [];
      }
      return this;
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
          var dom = that.$refs.main.querySelector(".ivu-input-wrapper input");
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
      if ("name" in args) this.args_name = this.args.name;
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
      this.displayType = type;
      this.t_create = false;
      this.t_edit = false;
      this.t_visit = false;
      if (type == "create") {
        this.t_create = true;
      }
      else if (type == "edit") {
        this.t_edit = true;
      }
      else if (type == "visit" ||type == "list") {
        this.t_visit = true;
      }
      return this;
    },
    getDataType(args) {
      return this.dataTypes;
    },
    async updateObjects() {
      await this.handleQueryData(this.queryData); // vuex做好缓存准备
      let uidList = this.getEn(this.queryData.targetClass);
      uidList.forEach(uid => {
        this.objectList.push(this.getClassObject(this.queryData.targetClass, uid));
      })
    },

    // 获取所有IoTDB数据源列表（不包含其中设备及时间序列信息）
    getAllIotdbs() {
      this.$Spin.show();
      getAllIotdbs().then(response => {
        let res = response.data;
        if (!res.success) {
          this.$Message.error(res.message);
        } else {
          this.allTimeseries = res.data.map(val => {
            if(val.dataSourceName){
              val.value = val.dataSourceName;
              //:${val.password}
              val.label = `${val.dataSourceName} - ${val.userName}@${val.serverIp}:${val.serverPort}`;
              val.children = [];
              val.loading = false;
              val.isIotdb = true;
              val.isDevice = false;
              return val;
            }
          });
          document.querySelector('.ivu-cascader-not-found-tip').style.display = this.allTimeseries.length === 0 ?  'block' : 'none';
        }
        this.$Spin.hide();
      }).catch(e => {
        this.$Spin.hide();
        console.log(e);
      });
    },

    // 异步加载设备/时间序列数据
    loadTimeseries(item, callback) {
      item.loading = true;
      if (item.isIotdb) {
        getAllDevices(item.value).then(response => {
          let res = response.data;
          if (!res.success) {
            this.$Message.error('IoTDB数据库连接失效，请检查！');
          } else {
            item.children = res.data.map(val => {
              return {
                dataSourceName: item.value,
                value: val,
                label: val,
                children: [],
                loading: false,
                isIotdb: false,
                isDevice: true
              };
            })
          }
          item.loading = false;
          callback();
        }).catch(e => {
          item.loading = false;
          callback();
          console.log(e);
        });
      } else if (item.isDevice) {
        getTimeSeriesByDevice(item.dataSourceName, item.value).then(response => {
          let res = response.data;
          if (!res.success) {
            this.$Message.error(res.message);
          } else {
            item.children = res.data.map(val => {
              let valList = val.split('.');
              let tsName = valList.length > 0 ? valList[valList.length - 1] : '';
              return {
                value: tsName,
                label: tsName,
              };
            })
          }
          item.loading = false;
          callback();
        }).catch(e => {
          item.loading = false;
          callback();
          console.log(e);
        });
      } else {
        item.loading = false;
        callback();
      }
    },

    // 预览所选时间序列的前5行
    previewTimeseries() {
      this.previewTsDataModal = true;
      this.previewTsData = [];
      this.previewTsDataLoading = true;
      let dataSourceName = this.selectedTimeseries[0];
      let deviceName = this.selectedTimeseries[1];
      let timeSeriesName = this.selectedTimeseries[2];
      previewTimeseries(dataSourceName, deviceName, timeSeriesName).then(response => {
        let res = response.data;
        if (!res.success) {
          this.$Message.error(res.message);
        } else {
          this.previewTsData = res.data.map(item => {
            return {
              timestamp: item[0] + '',
              value: item[1] + ''
            };
          });
        }
        this.previewTsDataLoading = false;
      }).catch(e => {
        this.previewTsDataLoading = false;
        console.log(e);
      });
    },

    // 绑定时间序列到当前对象、属性
    bindTimeseries(val, selectedData) {
      // val为值列表，selectedData为包含value、label等属性的object列表
      if (val.length !== 0) {
        this.$nextTick(() => {
          this.validate();
        })
      }else{
        if (this.args.required) {
          this.isRequired = true;
          this.setError(true);
        }
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
.wrongTips {
  display: inline-block;
  width: 100%;
  color: red;
  text-align: left;
  margin-top: 5px;
}
section {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}

p {
  margin: 10px 0;
}

.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
