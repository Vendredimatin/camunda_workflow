<template>
  <!-- 输入框 -->
  <section
    v-if="t_preview"
    :addinName="name"
    :style="{ 'font-size': args.fontSize + 'px', width: colWidth }"
    ref="main"
  >
    <span
      :style="{
        height: arg_height,
        'min-height': arg_height,
        width: '100%',
        display: 'inline-block',
        'background-color': args.main_color,
        color: args.main_fontColor,
      }"
    >
      <form action="/">
        <van-search
          v-model="defaultValue"
          :placeholder="args.placeholder"
          @focus="showAction = true"
          @blur="showAction = false"
          :input-align="mainXAlign"
          :disabled="args.readonly"
          :show-action="showAction"
          :shape="args.round ? 'round' : 'square'"
          :style="{
            width: '100%',
            height: arg_height,
            'font-size': args_fsize,
            color: args.txt_fontColor,
          }"
        >
          <template slot="label" >
            <div
              :style="{ color: args.label_fontColor, 'font-size': args_lfsize }"
            >
              {{ args.label }}
            </div>
          </template>
          <template slot="left-icon">
            <van-icon
              :name="args.prefixIcon"
              :size="this.args.lfsize + this.args.lfsizeType"
              :color="args.label_fontColor"
              :style="{ 'line-height': 'inherit', 'padding-right': '5px' }"
            />
          </template>
          <template slot="right-icon">
            <van-icon
              :name="args.suffixIcon"
              :size="this.args.fsize + this.args.fsizeType"
              :color="args.txt_fontColor"
              :style="{ 'line-height': 'inherit', 'padding-left': '5px' }"
            />
          </template>
          <template slot='action'>
            <div @click="onCancel" :style="{'font-size': args_fsize}">搜索</div>
          </template>
        </van-search>
      </form>
    </span>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox
        v-if="actEdit"
        :widgetAnnotation="widgetAnnotation"
        :editExtendInfo="editExtendInfo"
        ref="editbox"
        v-model="args"
        :attributes="filter_attributes"
        :router="router"
        :route="route"
        :root="root"
        :itemValue="itemValue"
        :query_oprs="query_oprs"
        :dataTypes="dataTypes"
        :targetclass="itemValue.data.targetClass"
      >
        <div slot="attribute">
          <p class="margin1">占位文本</p>
          <Input class="margin1" type="text" v-model="args.placeholder" />

          <div class="margin1">
            选择绑定的多对象控件:
            <Button
              type="default"
              size="small"
              shape="circle"
              icon="md-sync"
              @click="freshTable"
            ></Button>
          </div>
          <Select class="margin1" v-model="args.chooseTable" multiple>
            <Option
              v-for="item in tableList"
              :value="item.value"
              :key="item.value"
              >{{ item.label }}</Option
            >
          </Select>

          <Button class="margin1" type="primary" @click="queryModal" long
            >查询条件配置</Button
          >
          <p class="margin1">左侧图标</p>
          <Select v-model="args.prefixIcon" filterable clearable>
            <Option
              v-for="item in iconList"
              :value="item.value"
              :key="item.value"
              :label="item.label"
            >
              <van-icon :name="`${item.value}`" size="20"></van-icon>
              <span style="float: right; color: #ccc">{{ item.label }}</span>
            </Option>
          </Select>
          <p class="margin1">右侧图标</p>
          <Select v-model="args.suffixIcon" filterable clearable>
            <Option
              v-for="item in iconList"
              :value="item.value"
              :key="item.value"
              :label="item.label"
            >
              <van-icon :name="`${item.value}`" size="20"></van-icon>
              <span style="float: right; color: #ccc">{{ item.label }}</span>
            </Option>
          </Select>
          <!-- <div class="margin1" style="margin: 10px 0 10px 0">
                          显示取消按钮
                          <i-switch style="float: right" v-model="args.showAction"/>
                        </div> -->

          <div class="margin1">
            触发搜索事件
          </div>
          <Select class="margin1" v-model="args.searchAction" multiple>
            <Option
              v-for="item in allSearchAction"
              :value="item"
              :key="item"
              >{{ item }}</Option
            >
          </Select>
          <div class="margin1" style="margin: 10px 0 10px 0">
            自定义搜索
            <i-switch style="float: right" v-model="args.customSearch"/>
          </div>

        </div>
        <div slot="layout">
          <div class="margin1" style="margin: 10px 0 10px 0">
            圆角模式
            <i-switch style="float: right" v-model="args.round" />
          </div>
        </div>
        <div slot="operation"></div>
      </EditBox>
    </span>

    <!-- 属性弹窗 -->
    <Modal
      v-model="showQuery"
      title="查询属性绑定"
      width="500px"
      class="query-modal"
    >
      <div
        style="
          border-bottom: 1px solid #e9e9e9;
          padding-bottom: 6px;
          margin-bottom: 6px;
        "
      >
        选择属性:
        <CheckboxGroup
          v-model="checkClassGroup"
          @on-change="checkAllGroupChange"
        >
          <Checkbox v-for="item in classGroup" :label="item.label"></Checkbox>
        </CheckboxGroup>
      </div>
      <Table
        border
        height="450"
        :columns="columnsAttr"
        :data="args.dataAttr"
        @on-select-all-cancel="cancelChooseAttrAll"
        @on-selection-change="changeAttr"
        @on-select="chooseAttr"
        @on-select-cancel="cancelAttr"
        @on-row-dblclick="checkSelect"
        @on-select-all="chooseAttrAll"
      ></Table>
      <!-- <Spin size="large" fix v-if="spinShow"></Spin> -->
      <div slot="footer">
        <Button type="text" @click="cancelQuery">取消</Button>
        <Button type="primary" @click="confirmQuery">确认</Button>
        <!-- <Poptip
                v-show="showPop"
                confirm
                title="您已取消选择任何属性, 该操作即将清空条件框原有配置, 是否确定?"
                style="text-align: left;"
                @on-ok="confirmEmpty"
                @on-cancel="cancelEmpty">
                    <Button type="primary" @click="confirmQuery">确认</Button>
                </Poptip> -->
      </div>
    </Modal>
  </section>
  <section v-else :addinName="name" style="text-align: center">
    <span style="text-align: center">
      <div class="form-addin-icon">
        <i class="iconfont">&#xe624;</i>
      </div>
      <div class="form-addin-name">搜索框</div>
    </span>
  </section>
</template>

<script>
import EditBox from "@/ext_components/form/_EditBox.vue";
import "@/styles/component/iconfont.css";
import vantIconData from "@/views/functional-model/components/vantIcon.js";

const name = "SearchCell";
export default {
  name: name,
  props: [
    "addin",
    "basicArgs",
    "argsProps",
    "activeUUID",
    "store",
    "itemValue",
    "attributes",
    "relation",
    "editExtendInfo",
    "widgetAnnotation",
    "checkResult",
    "query_oprs",
    "route",
    "router",
    "root",
    "Message",
    "echarts",
  ],
  components: {
    EditBox,
  },
  data() {
    return {
      // 插件名
      name: name,
      // 展示模式
      t_preview: true,
      t_edit: false,
      addIcon: true,
      actEdit: false,

      defaultValue: "",
      iconList: [],
      args: {
        label_color: "initial",
        main_fontColor: "initial",
        main_color: "initial",
        title: "搜索框",
        id: null,
        size: "default",
        hided: false,
        icon: "",
        value: "",
        // label_align: 1,
        main_align: 4,
        prefixIcon: "search", // 头部图标
        suffixIcon: "", // 尾部图标
        // 属性插件所需属性
        label: "",
        targetDataType: null,
        height: 44,
        heightType: "px",
        width: 100,
        widthType: "%",
        label_fontColor: "#323233", // 标签文字颜色
        txt_fontColor: "#969799", // 内容文字颜色
        txt_bgColor: "#fff", // 输入框背景颜色
        lfsize: 14, // 标签文字大小
        lfsizeType: "px", // 标签文字大小单位
        fsize: 14, // 内容文字大小
        fsizeType: "px", // 内容文字大小单位
        col: true,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        readonly: false,
        eventRange: [
          "值变化",
          "失去焦点",
          "获得焦点",
          "确认搜索",
          "左侧图标点击",
          "右侧图标点击",
          "自定义",
        ],
        searchAction: ["确认搜索"],
        placeholder: "请输入搜索关键词",
        round: true,
        oldChooseTable: [],
        chooseTable: [],
        selectAttr: [],
        customSearch: false,
        dataAttr: [],
      },
      showAction: false,

      times: 0,

      // 支持的数据类型
      dataTypes: ["UUID", "String"],

      // 对齐方式,布局插件使用
      alignList: [
        { value: 1, name: "靠左对齐" },
        { value: 4, name: "居中对齐" },
        { value: 7, name: "靠右对齐" },
        { value: 0, name: "左上对齐" },
        { value: 2, name: "左下对齐" },
        { value: 3, name: "顶部对齐" },
        { value: 5, name: "底部对齐" },
        { value: 6, name: "右上对齐" },
        { value: 8, name: "右下对齐" },
      ],
      allSearchAction: [
        "值变化",
        "失去焦点",
        "获得焦点",
        "确认搜索",
        "左侧图标点击",
        "右侧图标点击",],

      // 继承属性
      inherit: [],

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},

      timer: null,

      value: null,

      columnsAttr: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "所属类",
          key: "belongClass",
          width: 200,
          tooltip: true,
          align: "center",
        },
        {
          title: "属性名",
          key: "attrName",
          width: 200,
          tooltip: true,
          align: "center",
        },
      ],


      tableList: [],
      tableMap: {},
      showQuery: false,
      spinShow: false,
      checkClassGroup: [],
      classGroup: [],
      classIndex: {},
      classAttr: {},
    };
  },
  inject: ["setBasicArgs"],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {
      let that = this;
      if (this.attributes) {
        if (this.relation) {
          this.attributes[1].forEach(
            (x) => (that.attrMap["relation_" + x.attributeName] = x)
          );
          this.attributes[2].forEach(
            (x) => (that.attrMap["left_" + x.attributeName] = x)
          );
          this.attributes[3].forEach(
            (x) => (that.attrMap["right_" + x.attributeName] = x)
          );
        } else {
          this.attributes.forEach((x) => (that.attrMap[x.attributeName] = x));
        }
      }
      if (this.Message && !this.$Message) this.$Message = this.Message;
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    if (this.t_preview) {
      this.iconList = vantIconData;
      this.$nextTick(() => {
        this.setInheritStyle();
        this.setHeight();
      });
      let that = this;
      if (this.args.chooseTable.length > 0) {
        setTimeout(() => {
          that.freshTable();
          that.freshInterval();
        }, 300);
      } else that.freshTable();
    }
    this.$nextTick(() => {
      this.$refs.main.querySelector(".van-search__content")?this.$refs.main.querySelector(".van-search__content").style.backgroundColor=this.args.txt_bgColor:''
    })
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  watch: {
    'args.height'(val) {
      this.setHeight();
    },
    'args.heightType'() {
      this.setHeight();
    },
    // args_fcolor(val) {
    //   this.$refs.main.querySelector("i").style.color = val;
    // },
    // 需要用到实体类属性列表时使用
    // args_name(val) {
    //     if (val != "-1") {
    //         this.args.name = val;
    //     } else {
    //         // // // // this.args.name = "";
    //     }
    // },
    arg_name(val) {
      if (val in this.attrMap) {
        this.args.targetDataType = this.attrMap[val].valueType;
        if (this.relation) {
          if (val.startsWith("left_"))
            this.args.label =
              (this.relation.leftRole != ""
                ? this.relation.leftRole
                : this.relation.leftClass) +
              "的" +
              this.attrMap[val].displayName;
          if (val.startsWith("right_"))
            this.args.label =
              (this.relation.rightRole != ""
                ? this.relation.rightRole
                : this.relation.rightClass) +
              "的" +
              this.attrMap[val].displayName;
          if (val.startsWith("relation_"))
            this.args.label = this.attrMap[val].displayName;
        } else this.args.label = this.attrMap[val].displayName;
        let name = val;
        if (this.relation) {
          if (name.startsWith("left_")) name = name.substring(5);
          else if (name.startsWith("right_")) name = name.substring(6);
          else if (name.startsWith("relation_")) name = name.substring(9);
        }
        let attr = this.store.state.DWF_form.Attributes[name];
      } else this.args.targetDataType = null;
    },
    arg_txtbgcolor(val) {
      this.$nextTick(() => {
        this.$refs.main.querySelector(".van-search__content")?this.$refs.main.querySelector(".van-search__content").style.backgroundColor=val:''
      })
    },
    // args_fcolor(val) {
    //   this.$refs.main.querySelector("i").style.color = val;
    // },
    // end
  },
  computed: {
    arg_txtbgcolor() {
      return this.args.txt_bgColor
    },
    arg_height() {
      return this.args.height < 3 && this.args.heightType == "px"
        ? this.args.height * 30 + "px"
        : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
    },
    labelWidth() {
      return (!this.args.label || this.args.label == "") && this.args.required
        ? "10%"
        : parseInt(
            (100 * this.args.label_width) /
              (this.args.label_width + this.args.main_width)
          ) + "%";
    },
    mainWidth() {
      return !this.args.label || this.args.label == ""
        ? this.args.required
          ? "90%"
          : "100%"
        : parseInt(
            (100 * this.args.main_width) /
              (this.args.label_width + this.args.main_width)
          ) + "%";
    },
    labelYAlignFlex() {
      let x = this.args.label_align % 3;
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
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
    // 文本内容字体大小
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + " !important";
    },
    args_fcolor() {
      return this.args.txt_fontColor;
    },
    // 标签文本内容字体大小
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + " !important";
    },
    // 需要用到实体类属性列表时使用
    arg_name() {
      return this.args.name;
    },
    filter_attributes() {
      return this.attributes
        ? this.relation
          ? [
              "relation",
              this.attributes[1].filter(
                (x) => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[2].filter(
                (x) => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[3].filter(
                (x) => this.dataTypes.indexOf(x.valueType) > -1
              ),
            ]
          : this.attributes.filter(
              (x) => this.dataTypes.indexOf(x.valueType) > -1
            )
        : [];
    },
    // end
  },
  methods: {
    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      let that = this;
      setTimeout(() => {
        if (that.args.heightType == 'px') {
          that.$refs.main.querySelector(".van-search__content")
            ? (that.$refs.main.querySelector(
                ".van-search__content"
              ).style.height = (that.args.height - 6 > 2?that.args.height - 6: 2) + that.args.heightType)
            : "";
        }
        else {
          console.log((that.args.height - 0.2)+ that.args.heightType)
          that.$refs.main.querySelector(".van-search__content")
            ? (that.$refs.main.querySelector(
                ".van-search__content"
              ).style.height = (that.args.height - 0.5)+ that.args.heightType)
            : "";
        }
      }, 0);
    },
    setInheritStyle() {
      // 字体 ／ 颜色 默认继承
    },
    setValue(value) {
      this.args.value = value;
      return this;
    },

    getEditBoxComponent() {
      return this.$refs.editbox;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },
    getAllow() {
      return null;
    },
    getName() {
      return name;
    },
    getArgs() {
      return this.args;
    },
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("label" in args)
        setTimeout(() => {
          this.args.label = args.label;
        }, 300);
      return this;
    },
    getFormName() {
      return this.args.name;
    },
    setDisplayType(type) {
      this.t_preview = false;
      this.t_show = false;
      this.t_icon = false;
      if (type == 0) this.t_preview = true;
      else if (type == 1) this.t_show = true;
      else if (type == 2) this.t_icon = true;
      return this;
    },
    setIcon(id) {
      this.icon_url = id;
      return this;
    },
    getDataType(args) {
      return this.dataTypes;
    },
    onCancel() {
      console.log('cancel')
      this.defaultValue = "";
      this.showAction = false;
    },
    // 刷新表格列表
    freshTable() {
      this.tableList = this.getTables(this.itemValue.data);
      this.tableMap = {};
      let that = this;
      this.tableList.forEach((x) => {
        that.tableMap[x.value] = x.obj;
      });
      this.args.chooseTable = this.args.chooseTable.filter(x => {
        return that.tableMap[x]
      })
      // this.freshClassAttr();
    },

    getTables(node) {
      var res = [];
      let controlAddin = ['addin_Card', 'addin_FormEngine', 'addin_Table'];
      if (node.obj && (node.obj.getSelected && controlAddin.includes(node.self.elementType)|| node.self.elementType == 'addin_FormEngine')) {
        res.push({
          obj: node.obj,
          label: node.self.properties.id,
          value: node.self.properties.id,
        });
      }
      if (node.elements) {
        for (var i = 0; i < node.elements.length; i++) {
          res = res.concat(this.getTables(node.elements[i]));
        }
      }
      return res;
    },
    // 条件配置弹窗
    queryModal() {
      let that = this;

      // 定制弹窗前 需先选择需要控制的表格
      if (this.args.chooseTable.length == 0) {
        this.$Notice.warning({
          title: "提示",
          desc: "请先选择需要控制的表格名称",
        });
      } else {
        console.log('xxxx',this.args.dataAttr);
        this.showQuery = true;
        this.spinShow = true;

        var flag = false;
        console.log(
          that.args.chooseTable.length != that.args.oldChooseTable.length,
          that.args.chooseTable.length,
          that.args.oldChooseTable.length
        );
        if (that.args.chooseTable.length != that.args.oldChooseTable.length) {
          flag = true;
        } else {
          for (var i = 0; i < that.args.chooseTable.length; i++) {
            if (that.args.oldChooseTable[i] != that.args.chooseTable[i]) {
              flag = true;
              break;
            }
          }
        }
        console.log(flag);
        if (flag) that.freshClassAttr();

        this.spinShow = false;
      }
    },

    freshClassAttr() {
      let that = this;
      if (that.classAttr._all) delete that.classAttr._all;
      that.attrMap = {};
      that.classGroup = [];
      var classMap = {};
      that.args.oldChooseTable = [];
      that.args.chooseTable.forEach(x => {
        that.args.oldChooseTable.push(x);
        var attrMap = that.tableMap[x].getAttrMap();
        console.log("test:", attrMap);
        attrMap.forEach((y, ind) => {
          // if (y.className in classMap) return;
          if (!y.className) return;
          if (attrMap.length > 1) {
            if (ind == 0) {
              y.className = `left_${y.className}`;
              y.displayName = `左${y.displayName}`;
            } else if (ind == 1) {
              y.className = `right_${y.className}`;
              y.displayName = `右${y.displayName}`;
            }
          }
          that.classGroup.push({
            className: y.className,
            displayName: y.displayName,
            label: `${y.className}(${y.displayName})`
          });
          classMap[y.className] = 1;
          var flag = true;
          // if (y.className in that.classAttr) flag = false;
          if (flag) that.classAttr[y.className] = [];
          console.log(y.className);
          if (y.attributes != undefined) {
            let attributes = y.attributes.filter(
              (x) => this.dataTypes.indexOf(x.valueType) > -1
            );
            attributes.forEach((z, index) => {
              if (flag)
                that.classAttr[y.className].push({
                  belongClass: `${y.className}(${y.displayName})`,
                  attrName: `${z.attributeName}&${z.displayName}`,
                  valueType: z.valueType,
                  index: index,
                  className: y.className,
                  queryType: 'or',
                });
              if (!(z.attributeName in that.attrMap)) {
                that.attrMap[z.attributeName] = []
              } else if (that.attrMap[z.attributeName].length == 1) {
                if (!("_all" in that.classAttr)) {
                  that.classAttr._all = [];
                }
                that.classAttr._all.push({
                  belongClass: "",
                  attrName: `${z.attributeName}&${z.displayName}`,
                  valueType: z.valueType,
                  index: index,
                  className: "_all",
                  queryType: 'or',
                });
              }
              that.attrMap[z.attributeName].push({className: y.className, index: index});
            });
          }
        });
      });
      if (that.classAttr._all) {
        that.classAttr._all.forEach(x => {
          var belongClass = "重复属性(";
          that.attrMap[x.attrName.substring(0, x.attrName.indexOf("&"))].forEach(y => {
            belongClass += y.className + ",";
          })
          belongClass = belongClass.substring(0, belongClass.length - 1) + ")";
          x.belongClass = belongClass;
        });
        that.classGroup.splice(0, 0, {
          className: "_all", displayName: "重复属性", label: "重复属性"
        });
      }
      that.checkClassGroup = [];
      that.args.dataAttr = [];
      that.classGroup.forEach(x => {
        that.classIndex[x.className] = that.args.dataAttr.length;
        that.checkClassGroup.push(x.label);
        that.args.dataAttr = that.args.dataAttr.concat(that.classAttr[x.className]);
      });
      console.log(that.classAttr, 'class attr')
    },

    // 取消全选
    changeAttr(data) {
      if (data.length == 0) {
        let that = this;
        that.checkClassGroup.forEach(x => {
          var className = "_all";
          if (x.substring(0, 4) != "重复属性") className = x.substring(0, x.indexOf("("));
          that.classAttr[className].forEach(y => {
            y._checked = false;
          })
          if (className == "_all") {
            that.classAttr[className].forEach(y => {
              that.updateAttrConflict(y);
            });
          }
        })
      }
    },
    // 全选属性
    chooseAttrAll(data) {
      let that = this;
      data.forEach((x, index) => {
        // try {
          that.classAttr[x.className].filter(attr => attr.attrName === x.attrName)[0]._checked = true;
          if (that.className == "_all") that.updateAttrConflict(that.classAttr[x.className].filter(attr => attr.attrName === x.attrName)[0]);
        // }catch (e) {
        //   console.error(e);
        //   console.error(index);
        // }
      });
    },
    // 取消全选属性
    cancelChooseAttrAll() {
      this.checkClassGroup.forEach(x => {
        var className = "_all";
        if (x.substring(0, 4) != "重复属性") className = x.substring(0, x.indexOf("("));
        this.classAttr[className].forEach(y => y._checked = false)
      });
    },

    // 选择属性
    chooseAttr(data, row) {
      if (row.className == "_all") {
        let temAttr = this.classAttr[row.className];
        for (let i = 0; i < temAttr.length; i++) {
          // if(temAttr[i].index == row.index) {
          if ((temAttr[i].index == row.index) && (temAttr[i].label == row.label)) {
            temAttr[i]._checked = true;
            console.log(temAttr[i])
            this.updateAttrConflict(temAttr[i]);
            break;
          }
        }
      } else {
        this.classAttr[row.className][row.index]['_checked'] = true;
      }
      // if (row.className == "_all") this.updateAttrConflict(this.classAttr[row.className][row.index]);
      // this.selectAttr = data;
      this.showPop = false;
    },
    // 取消选择属性
    cancelAttr(data, row) {
      console.log("cancel", row);
      if (data.length == 0) this.showPop = true;
      // this.selectAttr = data;
      if (row.className == "_all") {
        let temAttr = this.classAttr[row.className];
        for (let i = 0; i < temAttr.length; i++) {
          if ((temAttr[i].index == row.index) && (temAttr[i].label == row.label)) {
            temAttr[i]._checked = false;
            this.updateAttrConflict(temAttr[i]);
            break;
          }
        }
      } else {
        this.classAttr[row.className][row.index]._checked = false;
      }
    },
    updateAttrConflict(row) {
      // console.log("conflict:",row, row.attrName, row._checked, this.classIndex, this.attrMap[row.attrName.substring(0, row.attrName.indexOf("&"))], this.args.dataAttr);
      // let that = this;
      // this.attrMap[row.attrName.substring(0, row.attrName.indexOf("&"))].forEach(x => {
      //   that.args.dataAttr[that.classIndex[x.className] + x.index]._disabled = row._checked;
      // });
    },
    freshInterval() {
      let that = this;
      setTimeout(() => {
        let flag = false;
        that.args.chooseTable.forEach((x) => {
          var attrMap = that.tableMap[x].getAttrMap();
          attrMap.forEach((y) => {
            if (y.attributes == undefined) flag = true;
          });
        });
        console.log(flag);
        if (flag) that.freshInterval();
        else {
          that.freshClassAttr();
          that.args.selectAttr.forEach((x) => {
            
            let temData = that.args.dataAttr;
            for (let i = 0; i < temData.length; i++) {
              if ((temData[i].className == x.className) && (temData[i].attrName == x.attrName)) {
                temData[i].label = x.label;
                temData[i].attrType = x.attrType;
                temData[i].attrNum = x.attrNum == undefined ? 99 : x.attrNum;
                temData[i].defaultValue = x.defaultValue;
                if (x._checked) {
                  temData[i]._checked = true;
                  if (x.className == "_all") {
                    that.updateAttrConflict(x);
                  }
                }
                break;
              }
            }
            
          });
        }
      }, 300);
    },
    // 单击行勾选当前行
    checkSelect(data, index) {
      this.$refs.attrTable.toggleSelect(index);
    },
    // 选择类过滤属性
    checkAllGroupChange(data) {
      let that = this;
      this.args.dataAttr = [];
      data.forEach((x) => {
        var className = "_all";
        if (x.substring(0, 4) != "重复属性")
          className = x.substring(0, x.indexOf("("));
        that.args.dataAttr = that.args.dataAttr.concat(
          that.classAttr[className]
        );
      });
    },
    // 确认生成
    confirmQuery() {
      let that = this;
      that.args.selectAttr = [];
      console.log(this.checkClassGroup, that.classAttr)
      this.checkClassGroup.forEach((x) => {
        // if (!x) return;
        var className = "_all";
        if (x.substring(0, 4) != "重复属性")
          className = x.substring(0, x.indexOf("("));
        that.classAttr[className]
          .filter((y) => y._checked)
          .forEach((y) => that.args.selectAttr.push(y));
      });
      console.log(this.args.selectAttr);
      this.showQuery = false;
    },
    // 取消生产
    cancelQuery() {
      this.showQuery = false;
    },
  },
};
</script>
<style>
.van-search__content, .van-search__content .van-field, .van-search__content .van-cell__value,.van-search__content .van-field__body, .van-search__content input{
  font-size: inherit;
  color: inherit;
  width: 100%;
}
.van-search__content {
  align-items: center;
}
.van-search__label {
    max-width: 30%;
    overflow: hidden;
    text-overflow: clip;
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
.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
