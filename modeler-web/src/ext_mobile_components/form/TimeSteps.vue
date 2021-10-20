<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth, 'padding-bottom': 0 + ' !important'}" ref="main">
          <span :style="{'width': '100%', 'height': arg_height, 'display': 'inline-block', 'background-color': args.main_color,'color': args.main_fontColor, 'overflow-y': 'auto'}">
            <van-steps direction="vertical" :active="args.actStepIndex" :inactive-icon="args.inactStepIcon" :active-icon="args.actStepIcon" :active-color="actColor">
                <van-step class="self-step" v-for="(item, index) in args.stepList" :key="index">
                  <h3 :style="{'color': index == args.actStepIndex ? actColor : index < args.actStepIndex ? '#323233' : '#969799'}">{{ item.title }}</h3>
                  <p v-for="(noteItem, ind) in item.note" :key="ind">{{ noteItem }}</p>
                </van-step>
            </van-steps>
          </span>
          <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
                <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :store="store"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
                    <div slot="attribute">
                        <p class="margin1">标题</p>
                        <Select v-model="args.stepTitle" filterable clearable>
                            <OptionGroup v-for="group in groupAttrList" :label="group.groupName" :key="group.groupName">
                            <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                <span>{{ item.displayName }}</span>
                                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                            </Option>
                            </OptionGroup>
                        </Select>
                        <p class="margin1">描述</p>
                        <Select v-model="args.stepNote" filterable multiple clearable>
                            <OptionGroup v-for="group in groupAttrList" :label="group.groupName" :key="group.groupName">
                            <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                <span>{{ item.displayName }}</span>
                                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                            </Option>
                            </OptionGroup>
                        </Select>
                        <Button style="margin-top: 15px;" type="success" long @click="freshData(args.filterQuery)">刷新时间轴</Button>
                    </div>
                    <div slot="layout">
                        <!-- <Row class="margin1">
                            <Col span="6" class="grid-row">
                                <span style="font-size: 12px;">默认颜色</span>
                            </Col>
                            <Col span="18">
                                <ColorPicker v-model="args.inactStepColor" />
                            </Col>
                        </Row> -->
                        <Row class="margin1">
                              <Col span="6" class="grid-row">
                                  <span style="font-size: 12px;">默认图标</span>
                              </Col>
                              <Col span="18">
                                  <Select style="margin-bottom: 10px" v-model="args.inactStepIcon" filterable clearable>
                                      <Option v-for="item in vList" :value="item.value" :key="item.value" :label="item.label">
                                          <van-icon :name="item.value" size="20" />
                                      </Option>
                                  </Select>
                              </Col>
                          </Row>
                          <Row class="margin1">
                              <Col span="6" class="grid-row">
                                  <span style="font-size: 12px;">激活图标</span>
                              </Col>
                              <Col span="18">
                                  <Select style="margin-bottom: 10px" v-model="args.actStepIcon" filterable clearable>
                                      <Option v-for="item in vList" :value="item.value" :key="item.value" :label="item.label">
                                          <van-icon :name="item.value" size="20" />
                                      </Option>
                                  </Select>
                              </Col>
                          </Row>
                          <div class="margin1" style="margin: 10px 0 10px 0">
                            激活颜色
                            <ColorPicker v-model="args.actStepColor" alpha/>
                          </div>

                    </div>
                    <div slot="operation">
                    </div>
                    <!-- 图片库编辑弹窗 -->
                </EditBox>
            </span>
        </section>
        <section v-else :addinName="name" style="text-align: center">
            <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6d8;</i>
                </div>
                <div class="form-addin-name">
                    时间轴
                </div>
            </span>
        </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import EditBox from "@/ext_components/form/_EditBox.vue"
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js'
import "@/styles/component/iconfont.css";
import vantIconData from "@/views/functional-model/components/vantIcon.js";

const name = "TimeSteps";
export default {
  name: name,
  props: [
    'addin',
    'basicArgs',
    'argsProps',
    'activeUUID',
    'store',
    'itemValue',
    'attributes',
    'relation',
    'editExtendInfo',
    'widgetAnnotation',
    'checkResult',
    'query_oprs',
    'route',
    'router',
    'root',
    'Message',
    'echarts',
  ],
  components: {
    EditBox
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
      firstLoad: true,

      groupAttrList: [],
      vList: [],

      args: {
        // dynamic: false,     // 动态响应
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '时间轴',
        id: null,
        hided: false,
        value: "",
        bindTargetClass: '',
        lEnClass: '',
        rEnClass: '',
        stepList: [
          {
            title: '【城市】物流状态1',
            note: ['2016-07-12 12:40']
          }, {
            title: '【城市】物流状态2',
            note: ['2016-07-11 10:00']
          }, {
            title: '快件已发货',
            note: ['2016-07-10 09:30']
          }
        ],
        
        stepTitle: '',
        stepNote: [],

        actStepIndex: 0,
        inactStepIcon: '',
        actStepIcon: 'checked',
        inactStepColor: '#E7E6E6',
        actStepColor: '#07c160',

        // 属性插件所需属性
        // height: 61,
        // heightType: "px",
        width: 100,
        widthType: '%',
        height: 168,
        heightType: "px",
        col: true,
        filterQuery: '',
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ["初始化", "点击时间项"]
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String', 'UUID', 'Clob', 'LocalFile'],

      // 继承属性
      inherit: [],

      // 属性map
      attrMap: {},

      timer: null,

      value: null,
    };
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    this.$store = this.store;
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
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    if (this.t_preview) {

        this.vList = vantIconData;
        // 缺省绑定类为当前表单目标类
        if(this.args.bindTargetClass == '') {

        if(this.itemValue.data.isRelation) {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
        } else {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
        }

    }

    }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
      async arg_bindClass(val) {
      
      if(val != undefined && val != '' && val != 'undefined') {

        let curClass = val.split('&')[0];
        let curType = val.split('&')[1];
        this.groupAttrList = [];
        if(!this.firstLoad) {

          this.args.stepTitle = '';
          this.args.stepNote = [];

        } 

        if(curType == 'e') {

          await this.queryEntity(curClass);
          let enTypeAttr = this.EntityAttrList(curClass);

          let sysAttr = {
            groupName: '系统属性',
            groupType: '',
            attrList: enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1)
          };
          let selfAttr = {
            groupName: '类属性',
            groupType: '',
            attrList: enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1)
          };

          // 商品名称 描述 图片属性列表
          this.groupAttrList.push(sysAttr, selfAttr);

        } else {

          await this.queryRelation(curClass);
          let reTypeAttr = this.RelationAttrList(curClass);

          let reClass = this.Relations(curClass);
          if('leftClass' in reClass) {
            await this.queryEntity(reClass.leftClass);
          }
          if('rightClass' in reClass) {
            await this.queryEntity(reClass.rightClass);
          }

          this.args.lEnClass = reClass.leftClass;
          this.args.rEnClass = reClass.rightClass;
          let reTypeLAttr = this.EntityAttrList(reClass.leftClass);
          let reTypeRAttr = this.EntityAttrList(reClass.rightClass);

          let groupReItem = {
            groupName: '关联类',
            groupType: 'relation_',
            attrList: reTypeAttr
          }
          let groupLItem = {
            groupName: '左实体类',
            groupType: 'left_',
            attrList: reTypeLAttr
          }
          let groupRItem = {
            groupName: '右实体类',
            groupType: 'right_',
            attrList: reTypeRAttr
          }

          let sysReAttr = {
            groupName: '关联类系统属性',
            groupType: 'relation_',
            attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1)
          };
          let selfReAttr = {
            groupName: '关联类类属性',
            groupType: 'relation_',
            attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1)
          };

          this.groupAttrList.push(sysReAttr, selfReAttr, groupLItem, groupRItem);

        }

        if(this.firstLoad) this.firstLoad = false;

      } else {

        if(!this.firstLoad) {

          this.args.stepTitle = '';
          this.args.stepNote = [];

        } else {
          this.firstLoad = false;
        }

      }

    }
  },
  computed: {
    ...mapGetters("DWF_form", [
        "EntityAttrList",
        "Relations",
        "RelationAttrList"
    ]),
    actColor() {
      return this.args.actStepColor != '' ? this.args.actStepColor : '#07c160';
    },
    arg_height() {
      return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
    //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
    },
    arg_bindClass() {
      return this.args.bindTargetClass;
    },
    // 需要用到实体类属性列表时使用
    filter_attributes() {
        return this.attributes ? ( this.relation ?
            [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
    },
    // end
  },
  methods: {
    ...mapActions("DWF_form", [
        "handleQueryData",
        "queryEntity",
        "queryRelation"
    ]),
    setValue(value) {
      this.args.value = value;
      return this;
    },

    getEditBoxComponent(){
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
      if ("label" in args) setTimeout(() => { this.args.label = args.label; }, 300);
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

    transTS(value) {
      
      let date;
      let ts = value;
      if (ts.toString().length === 13 && (date = new Date(ts)) !== undefined && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        var y = date.getFullYear(),
            m = date.getMonth() + 1,
            d = date.getDate();
        ts = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + date.toTimeString().substr(0, 8);
      }
      return ts

    },

    // 刷新时间轴
    async freshData(queryStr) {
      
      console.log(queryStr)
      if(!this.args.bindTargetClass) {

        this.$Message.warning('请先选择目标类');
        return false

      } else if(!this.args.stepTitle && this.args.stepNote.length == 0) {

        this.$Message.warning('标题描述不能都为空哦~');
        return false

      } else {
        
        this.args.stepList = [];
        let className = this.args.bindTargetClass;
        if(className != undefined && className != '') {

          let curClass = className.split('&')[0];
          let curType = className.split('&')[1];

          let queryObj = {}
          if(curType == 'e') {

            queryObj['targetClass'] = curClass;
            queryObj['fresh'] = true;
            queryObj['query'] = {
              startIndex: 0,
              pageSize: 3,
              condition: queryStr,
              query: queryStr
            };

            await this.queryEntity(curClass);

          } else {

            queryObj = {
                query: {
                  condition: queryStr,
                  query: queryStr,
                  type: 'relation',
                  startIndex: 0,
                  pageSize: 3
                },
                relationClass: curClass,
                leftClass: this.args.lEnClass,
                rightClass: this.args.rEnClass,
                fresh: true
            };

          }
          console.log(queryObj)

          let objs = await this.handleQueryData(queryObj);
          console.log(objs);

          if(objs) {
            objs = objs.slice(0,3);
            this.args.stepList = objs.map(o => {

              o['title'] = this.args.stepTitle && o[this.args.stepTitle] ? o[this.args.stepTitle] : '';
              o['title'] = this.transTS(o['title']);
              o['note'] = [];
              if(this.args.stepNote.length > 0) {

                let self = this;
                o['note'] = this.args.stepNote.map(s => {
                  
                  let eachNote = o[s] ? o[s] : '';
                  eachNote = self.transTS(eachNote);
                  return eachNote

                })

              }
              console.log(o['note'])
              // o['note'] = this.args.stepNote && o[this.args.stepNote] ? o[this.args.stepNote] : '';
              // o['note'] = this.transTS(o['note']);
              return o

            })
          }

        }

      }

    }

  }
};
</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}
.self-step h3{
    font-weight: normal;
}
.self-step p{
    font-size: 12px;
}
.self-step>>>.van-step {
    color: #969799;
}
[class*=van-hairline]::after {
    border: 0 solid #ebedf0;
}
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
.grid-row {
    height: 32px;
    line-height: 32px;
}
</style>
