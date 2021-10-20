<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth, 'padding-bottom': 0 + ' !important'}" ref="main">
          <span :style="{'height': arg_height, 'min-height': arg_height, 'width': '100%', 'display': 'inline-block',
              'background-color': args.main_color,'color': args.main_fontColor, 'overflow-y': 'auto'}">
              <van-card
                v-for="card in temCardList"
                :key="card.oid"
                :num="card.count || 0"
                :tag="card.extTag || ''"
                :price="card.price|| ''"
                :desc="card.describe || ''"
                :title="card.name || ''"
                :thumb="card.imgStr || ''"
              >
                <template #tags>
                  <van-tag v-for="(tag, index) in card.cardTag" :key="index" plain type="danger">{{ tag }}</van-tag>
                </template>
              </van-card>
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
                      <p class="margin1">商品标题</p>
                      <Select ref="titleSelect" v-model="args.titleAttr" filterable clearable>
                        <OptionGroup v-for="group in groupAttrList" :label="group.groupName" :key="group.groupName">
                          <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                            <span>{{ item.displayName }}</span>
                            <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                          </Option>
                        </OptionGroup>
                        </Select>

                        <p class="margin1">商品描述</p>
                        <Select v-model="args.describeAttr" filterable clearable>
                          <OptionGroup v-for="group in groupAttrList" :label="group.groupName" :key="group.groupName">
                            <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                              <span>{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                            </Option>
                          </OptionGroup>
                        </Select>

                        <p class="margin1">商品图片</p>
                        <Select v-model="args.imgAttr" filterable clearable>
                          <OptionGroup v-for="group in groupAttrList" :label="group.groupName" :key="group.groupName">
                            <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                              <span>{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                            </Option>
                          </OptionGroup>
                        </Select>

                        <p class="margin1">商品价格</p>
                        <Select v-model="args.priceAttr" filterable clearable>
                          <OptionGroup v-for="group in groupNumberTypeList" :label="group.groupName" :key="group.groupName">
                            <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                              <span>{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                            </Option>
                          </OptionGroup>
                        </Select>

                        <p class="margin1">商品数量</p>
                        <Select v-model="args.numAttr" filterable clearable>
                          <OptionGroup v-for="group in groupNumberTypeList" :label="group.groupName" :key="group.groupName">
                            <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                              <span>{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                            </Option>
                          </OptionGroup>
                        </Select>

                        <p class="margin1">商品标签</p>
                        <Select v-model="args.tagAttr" filterable clearable>
                          <OptionGroup v-for="group in groupStringTypeList" :label="group.groupName" :key="group.groupName">
                            <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                              <span>{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                            </Option>
                          </OptionGroup>
                        </Select>

                        <p class="margin1">商品标识</p>
                        <Select v-model="args.extagAttr" filterable clearable>
                          <OptionGroup v-for="group in groupAttrList" :label="group.groupName" :key="group.groupName">
                            <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                              <span>{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                            </Option>
                          </OptionGroup>
                        </Select>

                        <Button style="margin-top: 15px;" type="success" long @click="freshData(args.filterQuery)">刷新卡片</Button>
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
                <i class="iconfont">&#xe6d6;</i>
                </div>
                <div class="form-addin-name">
                    商品卡片
                </div>
            </span>
        </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import EditBox from "@/ext_components/form/_EditBox.vue"
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js'
import "@/styles/component/iconfont.css";

const name = "Card";
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

      groupAttrList: [],
      groupNumberTypeList: [],
      groupStringTypeList: [],

      temCardList: [
        {
          oid: 'dwfcard123',
          count: 20,
          extTag: '热卖',
          price: 4099,
          describe: '商品描述',
          name: '标题',
          imgStr: 'https://img.yzcdn.cn/vant/ipad.jpeg',
          cardTag: ['标签1', '标签2']
        },  {
          oid: 'dwfcard1234',
          count: 20,
          extTag: '热卖',
          price: 4099,
          describe: '商品描述',
          name: '标题',
          imgStr: 'https://img.yzcdn.cn/vant/ipad.jpeg',
          cardTag: ['标签1', '标签2']
        },  {
          oid: 'dwfcard12345',
          count: 20,
          extTag: '热卖',
          price: 4099,
          describe: '商品描述',
          name: '标题',
          imgStr: 'https://img.yzcdn.cn/vant/ipad.jpeg',
          cardTag: ['标签1', '标签2']
        }
      ],

      args: {
        // dynamic: false,     // 动态响应
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '商品卡片',
        bindTargetClass: '',
        id: null,
        hided: false,
        value: "",
        main_width: 3,
        lEnClass: '',
        rEnClass: '',

        cardList: [],

        titleAttr: '',
        describeAttr: '',
        priceAttr: '',
        numAttr: '',
        imgAttr: '',
        tagAttr: '',
        extagAttr: '',

        // 属性插件所需属性
        height: 328,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        filterQuery: '',
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ["单击"],
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String', 'UUID', 'Clob', 'LocalFile'],

      // 继承属性
      inherit: [],
      firstLoad: true,

      // 属性map
      attrMap: {},
      classAttrMap: {},
      classMap: {},
      isRelation: false,
      _relation: null,

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

       // 缺省绑定类为当前表单目标类
      if(this.args.bindTargetClass == '') {

        if(this.itemValue.data.isRelation) {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
        } else {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
        }

      }

      if(this.args.cardList.length > 0) {
        this.freshData(this.args.filterQuery);
      }

    }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
    async arg_bindClass(val) {
      console.log('change bind class')

      if(val != undefined && val != '' && val != 'undefined') {

        if(!this.firstLoad) {
          this.resetData();
        } else {
          this.firstLoad = false;
        }

        let curClass = val.split('&')[0];
        let curType = val.split('&')[1];
        this.groupAttrList = [];
        this.groupNumberTypeList = [];
        this.groupStringTypeList = [];
        console.log(curType);

        if(curType == 'e') {
          this.isRelation = false;
          await this.queryEntity(curClass);
          let enTypeAttr = this.EntityAttrList(curClass);
          let numTypeAttr = enTypeAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })
          let strTypeAttr = enTypeAttr.filter(item => {
            return item.valueType == 'String'
          })

          let groupNumItem = {
            groupName: curClass,
            groupType: '',
            attrList: numTypeAttr
          }

          let groupStrItem = {
            groupName: curClass,
            groupType: '',
            attrList: strTypeAttr
          }

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

          // 商品价格 数量属性列表
          this.groupNumberTypeList.push(groupNumItem);

          // 商品标签 属性列表
          this.groupStringTypeList.push(groupStrItem);

          // console.log(curClass, this.classMap)

          if (!(curClass in this.classMap)) this.classMap[curClass] = this.Entities(curClass);
          if (!(curClass in this.classAttrMap)) {
            this.classAttrMap[curClass] = enTypeAttr
          }


        } else {
          this.isRelation = true;
          await this.queryRelation(curClass);
          let reTypeAttr = this.RelationAttrList(curClass);
          let numReTypeAttr = reTypeAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double') && item.className == curClass
          })
          let strReTypeAttr = reTypeAttr.filter(item => {
            return item.valueType == 'String'
          })

          let reClass = this.Relations(curClass);
          this._relation = reClass;
          if('leftClass' in reClass) {
            await this.queryEntity(reClass.leftClass);
          }
          if('rightClass' in reClass) {
            await this.queryEntity(reClass.rightClass);
          }

          this.args.lEnClass = reClass.leftClass;
          this.args.rEnClass = reClass.rightClass;
          let reTypeLAttr = this.EntityAttrList(reClass.leftClass);
          let numLTypeAttr = reTypeLAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })
          let strLTypeAttr = reTypeLAttr.filter(item => {
            return item.valueType == 'String'
          })

          let reTypeRAttr = this.EntityAttrList(reClass.rightClass);
          let numRTypeAttr = reTypeRAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })
          let strRTypeAttr = reTypeRAttr.filter(item => {
            return item.valueType == 'String'
          })

          if (!(curClass in this.classMap)) this.classMap[curClass] = reClass;
          if ('leftClass' in reClass && !(reClass.leftClass in this.classMap))
            this.classMap[reClass.leftClass] =  this.Entities(
              reClass.leftClass
            );
          if ('rightClass' in reClass && !(reClass.rightClass in this.classMap))
            this.classMap[reClass.rightClass] = this.Entities(
              reClass.rightClass
            );
          if (!(curClass in this.classAttrMap)) {
            this.classAttrMap[curClass] = reTypeAttr
          }
          if ('leftClass' in reClass && !(reClass.leftClass in this.classAttrMap))
            this.classAttrMap[reClass.leftClass] = reTypeLAttr;
          if ('rightClass' in reClass && !(reClass.rightClass in this.classAttrMap))
            this.classAttrMap[reClass.rightClass] = reTypeRAttr

          // let groupReItem = {
          //   groupName: '关联类',
          //   groupType: 'relation_',
          //   attrList: reTypeAttr
          // }
          let groupNumReItem = {
            groupName: '关联类',
            groupType: 'relation_',
            attrList: numReTypeAttr
          }
          let groupStrReItem = {
            groupName: '关联类',
            groupType: 'relation_',
            attrList: strReTypeAttr
          }

          let groupLItem = {
            groupName: '左实体类',
            groupType: 'left_',
            attrList: reTypeLAttr
          }
          let groupNumLItem = {
            groupName: '左实体类',
            groupType: 'left_',
            attrList: numLTypeAttr
          }
          let groupStrLItem = {
            groupName: '左实体类',
            groupType: 'left_',
            attrList: strLTypeAttr
          }
          
          let groupRItem = {
            groupName: '右实体类',
            groupType: 'right_',
            attrList: reTypeRAttr
          }
          let groupNumRItem = {
            groupName: '右实体类',
            groupType: 'right_',
            attrList: numRTypeAttr
          }
          let groupStrRItem = {
            groupName: '右实体类',
            groupType: 'right_',
            attrList: strRTypeAttr
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
          console.log(reTypeAttr, sysReAttr, selfReAttr)

          this.groupAttrList.push(sysReAttr, selfReAttr, groupLItem, groupRItem);
          this.groupNumberTypeList.push(groupNumReItem, groupNumLItem, groupNumRItem);
          this.groupStringTypeList.push(groupStrReItem, groupStrLItem, groupStrRItem);

        }

      } else {

        if(!this.firstLoad) {

          this.resetData();
          this.groupAttrList = [];
          this.groupNumberTypeList = [];
          this.groupStringTypeList = [];

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
        "RelationAttrList", 
        "Entities",
    ]),
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

    getSelected() {
      return []
    },
    getAttrMap() {
      var res = [];
      let curClass = this.args.bindTargetClass ? this.args.bindTargetClass.split('\&')[0] : '';
      console.log('get attr map', this.isRelation, this._relation, this.classMap, curClass)
      if (this.isRelation && this._relation) {
        var left = this.classMap[this._relation.leftClass];
        var right = this.classMap[this._relation.rightClass];
        res.push({
          ...left,
          attributes: this.classAttrMap[this._relation.leftClass]
        });
        res.push({
          ...right,
          attributes: this.classAttrMap[this._relation.rightClass]
        });
        res.push({
          ...this._relation,
          attributes: this.classAttrMap[this._relation.className]
        });
      } else {
        var obj = this.classMap[curClass];
        res.push({
          ...obj,
          attributes: this.classAttrMap[curClass]
        });
      }
      console.log('card attrmap', res)
      return res;
    },

    resetData() {

      this.$refs.titleSelect.clearSingleSelect();
      // this.args.titleAttr = '';
      this.args.describeAttr = '';
      this.args.imgAttr = '';
      this.args.priceAttr = '';
      this.args.numAttr = '';
      this.args.tagAttr = '';
      this.args.extagAttr = '';

    },

    // 刷新卡片
    async freshData(queryStr) {

      if(!this.args.bindTargetClass) {

        this.$Message.warning('请先选择目标类');
        return false

      } else {
        
        this.args.cardList = [];
        let className = this.args.bindTargetClass;
        if(className != undefined && className != '') {

          let curClass = className.split('&')[0];
          let curType = className.split('&')[1];

          let queryObj = {};
          if(curType == 'e') {

            queryObj['targetClass'] = curClass;
            queryObj['fresh'] = true;
            queryObj['query'] = {
              startIndex: 0,
              pageSize: 3,
              condition: queryStr
            };

            await this.queryEntity(curClass);

          } else {

            queryObj = {
                query: {
                  startIndex: 0,
                  pageSize: 3,
                  condition: queryStr,
                  type: 'relation'
                },
                relationClass: curClass,
                leftClass: this.args.lEnClass,
                rightClass: this.args.rEnClass,
                fresh: true
            };

          }

          let objs = await this.handleQueryData(queryObj);
          console.log(objs);
          if(objs) {

            this.temCardList = objs.map(o => {

              o['count'] = this.args.numAttr && o[this.args.numAttr] ? o[this.args.numAttr] : '';
              o['extTag'] = this.args.extagAttr && o[this.args.extagAttr] ? o[this.args.extagAttr].substring(0,6) : '';
              o['price'] = this.args.priceAttr && o[this.args.priceAttr] ? o[this.args.priceAttr] : '';
              o['describe'] = this.args.describeAttr && o[this.args.describeAttr] ? o[this.args.describeAttr] : '';
              o['name'] = this.args.titleAttr && o[this.args.titleAttr] ? o[this.args.titleAttr] : '';
              o['imgStr'] = this.args.imgAttr && o[this.args.imgAttr] ? o[this.args.imgAttr] : '';
              o['cardTag'] = this.args.tagAttr && o[this.args.tagAttr] ? o[this.args.tagAttr].split(',') : [];
              return o

            })
            this.args.cardList = this.temCardList;

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
p {
  margin: 10px 0;
}
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
</style>
