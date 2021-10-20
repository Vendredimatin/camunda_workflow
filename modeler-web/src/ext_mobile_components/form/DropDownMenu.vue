<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
          <!-- <span :style="{'width': '100%', 'display': 'inline-block','background-color': args.main_color,'color': args.main_fontColor}"> -->
            <!-- <van-dropdown-menu class="self-menu" :active-color="args.actMenuColor" :direction="args.menuDirection">
                <van-dropdown-item v-for="(item, index) in args.menuList" :key="index" v-model="item.defValue" :options="item.option" />
            </van-dropdown-menu> -->
            <van-dropdown-menu class="self-menu" :active-color="args.actMenuColor" :direction="args.menuDirection">
              <van-dropdown-item v-for="(item, index) in args.menuList" :key="index" :title="item.defValue" ref='menu'>
                <van-cell v-for="(menu, ind) in item.option" :key="ind" center :title="menu.text" @click="onConfirm(menu.text, index)">
                  <template v-if="item.defValue == menu.text" #right-icon>
                    <van-icon name="success" color="#ee0a24" />
                  </template>
                </van-cell>
              </van-dropdown-item>
            </van-dropdown-menu>
          <!-- </span> -->
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
                        <Row class="margin1">
                            <Col span="10">
                                <span style="font-weight: 500;">目录设置</span>
                            </Col>
                            <Col span="14" style="text-align: right;">
                                <Button type="text" size="small" @click="addMenu" style="font-weight: 500;">
                                <span>添加组</span>
                                <Icon type="md-add"></Icon>
                                </Button>
                            </Col>
                        </Row>
                        <draggable :options="{animation:380}" v-model="args.menuList">
                          <div class="margin1" v-for="(item, index) in args.menuList" :key="index">
                            <Row class="item-head margin1">
                              <Col span="10">
                                <div class="van-ellipsis" style="font-size: 12px;">{{ item.menuValue }}</div>
                              </Col>
                              <Col span="14" style="text-align: right;">
                                <Button type="text" size="small" @click="setMenu(item, index)">
                                  <Icon type="md-settings"></Icon>
                                </Button>
                                <Button type="text" size="small" @click="delMenu(index)">
                                  <Icon type="md-close"></Icon>
                                </Button>
                                <Button type="text" size="small">
                                  <Icon type="md-move"></Icon>
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        </draggable>

                        <!-- <Row class="margin1">
                          <Col span="6" class="grid-row">
                              <span style="font-size: 12px;">选中颜色</span>
                          </Col>
                          <Col span="18">
                              <ColorPicker v-model="args.actMenuColor" />
                          </Col>
                        </Row> -->
                        <p class="margin1">选中颜色</p>
                        <ColorPicker size="small" v-model="args.actMenuColor" />
                        <Row class="margin1">
                            <Col span="6" class="grid-row">
                                <span style="font-size: 12px;">菜单方向</span>
                            </Col>
                            <Col span="18" class="grid-row">
                                <RadioGroup v-model="args.menuDirection">
                                    <Radio label="down">向下</Radio>
                                    <Radio label="up">向上</Radio>
                                </RadioGroup>
                            </Col>
                        </Row>

                    </div>
                    <div slot="layout">
                    </div>
                    <div slot="operation">
                    </div>
                    <!-- 图片库编辑弹窗 -->
                </EditBox>
            </span>
            <Modal
              v-model="setModal"
              :mask-closable="false"
              title="编辑目录项">
              <Row class="margin1">
                <Col span="10">
                    <span style="font-weight: 500;">目录项设置</span>
                </Col>
                <Col span="14" style="text-align: right;">
                    <Button type="text" size="small" @click="addMenuItem" style="font-weight: 500;">
                    <span>添加项</span>
                    <Icon type="md-add"></Icon>
                    </Button>
                </Col>
              </Row>
              <Row class="margin1">
                <Col span="3" class="grid-row">组名: </Col>
                <Col span="20">
                  <Input v-model="editMenu.menuValue" />
                </Col>
              </Row>
              <draggable :options="{animation:380}" v-model="editMenu.option">
                <Row v-for="(menu, index) in editMenu.option" :key="index" class="margin1">
                  <Col span="3" class="grid-row">
                    <span>目录{{ index+1 }}</span>
                  </Col>
                  <Col span="13">
                    <Input v-model="menu.text" />
                  </Col>
                  <!-- <Col span="4" class="grid-row" style="text-align: center;">
                    <Button size="small" @click="defItem(menu)">设为默认</Button>
                  </Col> -->
                  <Col span="2" class="grid-row">
                    <Button type="text" size="small">
                      <Icon type="md-move"></Icon>
                    </Button>
                  </Col>
                  <Col span="2" class="grid-row" style="text-align: center;">
                    <Button type="text" size="small" @click="delMenuItem(index)">
                      <Icon type="md-close"></Icon>
                    </Button>
                  </Col>
                </Row>
              </draggable>
              <div slot="footer">
                <Button type="text" @click="cancelOption">取消</Button>
                <Button type="primary" @click="confirmOption">确认</Button>
              </div>
            </Modal>
        </section>
        <section v-else :addinName="name" style="text-align: center">
            <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6d5;</i>
                </div>
                <div class="form-addin-name">
                    下拉菜单
                </div>
            </span>
        </section>
</template>

<script>
import _global from '@/views/global.vue'
import draggable from "vuedraggable";
import { mapGetters, mapActions } from "vuex";
import EditBox from "@/ext_components/form/_EditBox.vue"
import "@/styles/component/iconfont.css";

const name = "DropDownMenu";
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
    EditBox,
    draggable
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
      setIndex: -1,

      setModal: false,
      editMenu: {
        menuValue: '',
        defValue: '',
        option: []
      },

      args: {
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '下拉菜单',
        id: null,
        hided: false,
        value: "",

        actMenuColor: '#ee0a24',
        menuDirection: 'down',

        menuList:[
            {
                menuValue: '全部商品',
                defValue: '全部商品',
                option: [
                    { text: '新款商品', value: '新款商品' },
                    { text: '活动商品', value: '活动商品' },
                ]
            }, {
                menuValue: '默认排序',
                defValue: '默认排序',
                option: [
                    { text: '好评排序', value: '好评排序' },
                    { text: '销量排序', value: '销量排序' },
                ]
            }
        ],

        // 属性插件所需属性
        // height: 48,
        // heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ["切换菜单"],
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String', 'UUID'],

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

      this.baseImgUrl = _global.baseUrl;

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

      console.log(this.args.menuList)

    }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
  },
  computed: {
    ...mapGetters("DWF_form", [
        "EntityAttrList",
        "Relations",
        "RelationAttrList"
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
      if ("menuList" in args) {
        this.args.menuList.forEach(m => {
          m.defValue = m.menuValue;
        })
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
    setIcon(id) {
      this.icon_url = id;
      return this;
    },
    getDataType(args) {
      return this.dataTypes;
    },

    // getContainer() {
    //   return document.querySelector('.middle-iphone');
    //   // return this.$refs.main
    // },

    onConfirm(text, ind) {
      
      this.args.menuList[ind].defValue = text;
      this.$refs.menu[ind].toggle();

    },

    // 添加目录组
    addMenu() {
      
      if(this.args.menuList.length > 5) {
        this.$Message.warning('最多添加6组目录哦~');
      } else {

        let newMenu = {
          defValue: '全部商品',
          menuValue: '全部商品',
          option: [
              { text: '新款商品', value: '新款商品' },
              { text: '活动商品', value: '活动商品' },
          ]
        }
        this.args.menuList.push(newMenu);

      }

    },

    // 设置目录项
    setMenu(menu, ind) {

      this.setIndex = ind;
      this.setModal = true;
      this.editMenu = menu;
      console.log(this.editMenu);

    },

    // 添加目录组项
    addMenuItem() {

      let newItem = {
        text: '标题',
        value: '标题'
      }
      this.editMenu.option.push(newItem);

    },

    // 设为组默认项
    defItem(item) {
      this.editMenu.defValue = item.text;
    },

    delMenuItem(ind) {
      this.editMenu.option.splice(ind, 1);
    },

    // 删除目录项
    delMenu(ind) {
      
      this.args.menuList.splice(ind, 1);

    },

    // 目录组确认项
    confirmOption() {
      
      this.editMenu.option.forEach(o => {

        o.value = o.text;
        
      })
      this.editMenu.defValue = this.editMenu.menuValue;
      this.args.menuList[this.setIndex] = this.editMenu;
      this.setModal = false;

    },
    
    cancelOption() {

      this.setModal = false;

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
.self-menu>>>.van-dropdown-item {
  width: 365px;
  margin: 0px auto;
  left: -58px;
}
@media screen and (max-width: 1281px) {
  .self-menu>>>.van-dropdown-item {
    width: 325.69px;
    margin: 0px auto;
    left: -97px;
  }
}
.item-head {
  height: 28px;
  line-height: 28px;
  border-bottom: 1px solid #ccc;
}
.grid-row {
  height: 32px;
  line-height: 32px;
}
</style>