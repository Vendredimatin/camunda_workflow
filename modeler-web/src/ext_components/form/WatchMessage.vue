<template>
  <!-- 输入框 -->
  <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}"
           ref="main">
    <div style="width: 100%; height: 15px; display: inline-block; text-align: center;">消息订阅控件</div>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
               :attributes="filter_attributes"
               :router="router"
               :route="route"
               :store="store"
               :root="root"
               :itemValue="itemValue"
               :query_oprs="query_oprs"
               :dataTypes="dataTypes"
               :targetclass="itemValue.data.targetClass">
          <div slot="attribute">
            <p class="margin1">订阅类型</p>
            <RadioGroup v-model="args.watchType">
              <Radio label="classEvent">
                  <span>类事件</span>
              </Radio>
              <Radio label="scriptEvent">
                  <span>脚本事件</span>
              </Radio>
            </RadioGroup>
            <p class="margin1" v-if="args.watchType === 'classEvent'">触发类型</p>
            <p class="margin1" v-else>脚本</p>
            <Select v-model="args.listenerType" v-if="args.watchType === 'classEvent'" clearable style="width:100%;">
              <Option v-for="item in listenerTypeClassList" :value="item.value" :key="item.value">{{
                  item.label
                }}</Option>
            </Select>
            <BindOperationBar v-else
                              ref="bindOperationBar"
                              :opr_path="args.scriptListener.path"
                              :opr_type="args.scriptListener.type"
                              :opr_name="args.scriptListener.name"
                              :customAction="operationCustomAction"
                              :customRadio="operationCustomRadio"
                              :form_targetclass="bindTargetClass"
                              :form_json="itemValue"
                              :load_query_oprs="$query_oprs"
                              :route="route"
                              :router="router"
                              :root="root"
                              @on-change="handleChangeEventOfOperationBar"
                              style="width:100%"></BindOperationBar>
            <!--            <p class="margin1">消息类型</p>-->
            <!--            <Select v-model="args.messageType" style="width:100%;">-->
            <!--              <Option v-for="item in messageTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>-->
            <!--            </Select>-->
            <div class="margin1" style="margin: 10px 0 10px 0">
              自动启动
              <i-switch style="float: right" v-model="args.auto"/>
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
        <i class="iconfont">&#xe6c2;</i>
      </div>
      <div class="form-addin-name">
          消息订阅
      </div>
    </span>
  </section>
</template>

<script>
import EditBox from "./_EditBox.vue"
import "@/styles/component/iconfont.css";
import BindOperationBar from "./subcomponent/BindOperationBar";
import {getEntryOperations} from '@/api/others.js';

const name = "WatchMessage";
export default {
  name: name,
  props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", 'Message', "relation"],
  components: {
    EditBox,
    BindOperationBar
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
      args: {
        title: '消息订阅',
        id: null,
        watchType: 'classEvent',
        listenerType: '',
        bindTargetClass: '',
        messageType: 'SPECIFIC_CONNECTION',
        scriptListener: {
          path: '',
          type: '',
          name: ''
        },
        auto: true,
        events: [],
        eventRange: ['结束消息到达', '阶段消息到达'],
      },
      listenerTypeClassList: [
        {
          value: 'OBJ_CREATE',
          label: 'OBJ_CREATE新增'
        },
        {
          value: 'OBJ_UPDATE',
          label: 'OBJ_UPDATE修改'
        },
        {
          value: 'OBJ_DELETE',
          label: 'OBJ_DELETE删除',
        }
      ],
      messageTypeList: [
        // {
        //   value: 'ALL_CONNECTION',
        //   label: 'ALL_CONNECTION所有'
        // },
        // {
        //   value: 'SPECIFIC_USER',
        //   label: 'SPECIFIC_USER按用户'
        // },
        {
          value: 'SPECIFIC_CONNECTION',
          label: 'SPECIFIC_CONNECTION按连接ID',
        }
      ],
      listenerTypeScriptList: [''],
      operationCustomAction: 'implement',
      operationCustomRadio: '后端脚本',
      // 支持的数据类型
      dataTypes: [],
      // 继承属性
      inherit: [],
      // 表单项名
      args_name: "",
      // 属性map
      attrMap: {},
      timer: null,
      value: null,
      $query_oprs: [],
    };
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {
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
      if (this.Message && !this.$Message) this.$Message = this.Message;
      this.$query_oprs = this.query_oprs;
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    if (this.t_preview) {
      // 缺省绑定类为当前表单目标类
      if (this.args.bindTargetClass == '') {
        if (this.itemValue.data.isRelation) {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
        } else {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
        }
      }
    }
  },
  beforeDestroy() {

  },
  watch: {
    arg_height(val) {
      this.setHeight();
    },
    arg_name(val) {
      if (val in this.attrMap) {
        this.args.targetDataType = this.attrMap[val].valueType;
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
    bindTargetClass(val) {
      this.$refs.bindOperationBar ? this.$refs.bindOperationBar.loadQueryOprList() : '';
    },
    // end
  },
  computed: {
    arg_height() {
      return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
    },
    labelWidth() {
      return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
    },
    mainWidth() {
      return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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
      return this.args.fsize + this.args.fsizeType + ' !important';
    },
    args_fcolor() {
      return this.args.txt_fontColor;
    },
    // 标签文本内容字体大小
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + ' !important';
    },
    // 需要用到实体类属性列表时使用
    arg_name() {
      return this.args.name;
    },
    filter_attributes() {
      return this.attributes ? (this.relation ?
        ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
          this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
          this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
    },
    bindTargetClass() {
      return this.args.bindTargetClass ? this.args.bindTargetClass.split('&')[0] : '';
    }
    // end
  },

  methods: {

    setHeight() {
      return;
    },
    getValue() {
      return this.args.value;
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
    loadQueryOprList() {
      getEntryOperations('Root').then(globalOprRes => {
        getEntryOperations(this.itemValue.data.targetClass).then(localOprRes => {
          try {
            this.$query_oprs = globalOprRes.data.data.queryOprConfigs.concat(localOprRes.data.data.queryOprConfigs);
          } catch (e) {
            console.log(`loadQueryOprList失败${e}`)
          }
        })
      });
    },
    handleChangeEventOfOperationBar(event) {
      this.args.scriptListener.path = event.conf.opr_path;
      this.args.scriptListener.type = event.conf.opr_type;
      event.query_opr ? this.args.scriptListener.name = event.query_opr.authority : '';
      this.loadQueryOprList();
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

.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
