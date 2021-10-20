<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth, 'padding': 0 + ' !important'}" ref="main">
          <span :style="{'width': '100%', 'display': 'inline-block',
              'background-color': args.main_color,'color': args.main_fontColor}">
            <van-grid ref="myGrid" class="self-grid" :column-num="args.colNum" :direction="args.contentGrid" :border="args.needBorder" :icon-size="args_iconsize">
                <van-grid-item :style="{'height': arg_height, 'font-size': args_fsize}" v-for="(grid, index) in args.gridList" :key="index" :icon="grid.iconType == 'icon' ? grid.icon : grid.imgOri == 'imgSelf' ? grid.imgUrl : `${baseImgUrl}/files-download/${grid.imgUrl}`" :text="grid.text" />
            </van-grid>
          </span>
          <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
                <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :store="store"
                :bindGlobalOpr="bindGlobalOpr"
                :bindLocalOpr="bindLocalOpr"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
                    <div slot="attribute">
                        <Row class="margin1">
                            <Col span="4" class="grid-row">
                                <span style="font-size: 12px;">列数</span>
                            </Col>
                            <Col span="20">
                                <InputNumber :max="5" :min="1" v-model="args.colNum" @on-change="changeCol"></InputNumber>
                            </Col>
                        </Row>
                        <Row class="margin1">
                            <Col span="6" class="grid-row">
                                <span style="font-size: 12px;">内容排列</span>
                            </Col>
                            <Col span="18" class="grid-row">
                                <RadioGroup v-model="args.contentGrid" @on-change="nextStyle">
                                    <Radio label="vertical">纵向</Radio>
                                    <Radio label="horizontal">横向</Radio>
                                </RadioGroup>
                            </Col>
                        </Row>
                        <div class="margin1" style="margin: 10px 0 10px 0">
                            边框
                            <i-switch style="float: right" v-model="args.needBorder" @on-change="nextStyle" />
                        </div>
                        <Row class="margin1">
                            <Col span="10">
                              <span style="font-size: 12px;font-weight: 500;">宫格项设置</span>
                            </Col>
                            <Col span="14" style="text-align: right;">
                                <Button type="text" size="small" @click="addGrid" style="font-weight: 500;">
                                <span style="font-size: 12px;">添加项</span>
                                <Icon type="md-add"></Icon>
                                </Button>
                            </Col>
                        </Row>
                        <div class="margin1 gridItem" v-for="(item, index) in args.gridList" :key="index">

                          <Row class="item-head">
                            <Col span="4" class="grid-row" style="padding-top: 5px;">
                                <span style="font-size: 12px;">宫格{{ index+1 }}</span>
                            </Col>
                            <Col span="20" style="text-align: right;">
                              <Button type="text" size="small" @click="editGrid(index)">
                                <Icon type="md-settings"></Icon>
                              </Button>
                              <Button type="text" size="small" @click="delGrid(index)">
                                <Icon type="md-close"></Icon>
                              </Button>
                            </Col>
                          </Row>

                        </div>
                        <!-- <Button style="margin-top: 15px;" type="success" long @click="addGrid">新增宫格</Button> -->
                    </div>
                    <div slot="layout">
                      <div class="margin1" style="margin: 10px 0 10px 0">
                        图标颜色
                        <ColorPicker v-model="args.iconColor"/>
                      </div>
                      <p class="margin1">图标大小</p>
                      <Input class="margin1" v-model="args.iconSize" type="number">
                        <Select v-model="args.iconSizeType" slot="append" style="width: 70px;">
                          <Option value="px">px</Option>
                          <Option value="rem">rem</Option>
                        </Select>
                      </Input>
                      <p class="margin1">图片大小</p>
                      <Input class="margin1" v-model="args.imgSize" type="number">
                        <Select v-model="args.imgSizeType" slot="append" style="width: 70px;">
                          <Option value="px">px</Option>
                          <Option value="rem">rem</Option>
                        </Select>
                      </Input>
                    </div>
                    </div>
                    <div slot="operation">
                    </div>
                    <!-- 图片库编辑弹窗 -->
                </EditBox>
            </span>
            <Modal
              v-model="setModal"
              title="编辑宫格项">
                <Row class="margin1">
                  <Col span="2" class="grid-row" style="padding-top: 5px;">
                        <span>类型</span>
                    </Col>
                  <Col span="22" class="grid-row">
                      <RadioGroup v-model="editItem.iconType" @on-change="changeIconType">
                        <Radio label="icon">图标</Radio>
                        <Radio label="image">图片</Radio>
                      </RadioGroup>
                  </Col>
                </Row>
                <Row>
                    <Col span="2" class="grid-row" style="padding-top: 5px;">
                        <span>文本</span>
                    </Col>
                    <Col span="22">
                        <span> <Input class="margin1" type="text" v-model="editItem.text" /></span>
                    </Col>
                </Row>
                <Row v-show="editItem.iconType == 'icon'">
                    <Col span="2" class="grid-row">
                        <span>图标</span>
                    </Col>
                    <Col span="22">
                        <Select style="margin-bottom: 10px" v-model="editItem.icon" filterable clearable>
                            <Option v-for="item in vList" :value="item.value" :key="item.value" :label="item.label">
                                <van-icon :name="item.value" size="20" />
                            </Option>
                        </Select>
                    </Col>
                </Row>
                <Row v-show="editItem.iconType == 'image'">
                    <Col span="2" class="grid-row">
                        <span>图片</span>
                    </Col>
                    <Col span="22">
                        <Select class="margin1" v-model="editItem.imgOri" @on-change="clearImgUrl">
                          <Option value="imgBase">图片库</Option>
                          <Option value="imgSelf">自定义</Option>
                        </Select>
                        <Input class="margin1" type="textarea" :autosize="true" v-model="editItem.imgUrl" @on-focus="chooseOrigin(editItem)"/>
                    </Col>
                </Row>
                <Row>
                  <Col span="2" class="grid-row">
                    <span>事件</span>
                  </Col>
                  <Col span="22">
                    <BindOperationBar :index="actIndex"
                        :opr_path="editItem.opr_path"
                        :opr_type="editItem.opr_type"
                        :opr_name="editItem.name"
                        :opr_sys_path="editItem.opr_sys_path"
                        :opr_showMessage="editItem.opr_showMessage"
                        ref="BindOperationBar"
                        :form_targetclass="itemValue.data.targetClass"
                        :form_json="itemValue"
                        :load_query_oprs="query_oprs"
                        :bindGlobalOpr="bindGlobalOpr"
                        :bindLocalOpr="bindLocalOpr"
                        :route="route"
                        :router="router"
                        :root="root"
                        v-on:on-change="handleChangeEventOfOperationBar"
                        style="width:100%">
                    </BindOperationBar>
                  </Col>
                </Row>
              <div slot="footer">
                <Button type="text" @click="cancelOption">取消</Button>
                <Button type="primary" @click="confirmOption">确认</Button>
              </div>
            </Modal>
            <ImgEditModal ref="img_modal" @transferImg="getImgUrl"></ImgEditModal>
        </section>
        <section v-else :addinName="name" style="text-align: center">
            <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6d0;</i>
                </div>
                <div class="form-addin-name">
                    宫格
                </div>
            </span>
        </section>
</template>

<script>
import _global from '@/views/global.vue'
import { mapGetters, mapActions } from "vuex";
import EditBox from "@/ext_components/form/_EditBox.vue"
import BindOperationBar from "@/ext_components/form/subcomponent/BindOperationBar.vue"
import ImgEditModal from '@/ext_components/form/subcomponent/ImgCommonModal'
import "@/styles/component/iconfont.css";
import vantIconData from "@/views/functional-model/components/vantIcon.js";

const name = "Grid";
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
    "bindGlobalOpr",
    "bindLocalOpr",
    'route',
    'router',
    'root',
    'Message',
    'echarts',
  ],
  components: {
    EditBox,
    ImgEditModal,
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
      setModal: false,
      editItem: {
        iconType: 'icon',
        text: '',
        icon: '',
        imgOri: 'imgSelf',
        imgUrl: '',
        opr_path: '',
        opr_type: '',
        name: '',
        tmp: true,
        extend: false,
        opr_showMessage: true,
        opr_sys_path: ''
      },
      baseImgUrl: '',

      vList: [],
      actIndex: -1,

      args: {
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '宫格',
        id: null,
        hided: false,
        value: "",

        colNum: 3,
        needBorder: true,

        gridList: [
          {
            iconType: 'icon',
            icon: 'photo-o',
            text: '文字',
            imgOri: 'imgSelf',
            imgUrl: '',
            opr_path: '',
            opr_type: '',
            name: '',
            tmp: true,
            extend: false,
            opr_showMessage: true,
            opr_sys_path: ''
          }, {
            iconType: 'icon',
            icon: 'photo-o',
            text: '文字',
            imgOri: 'imgSelf',
            imgUrl: '',
            opr_path: '',
            opr_type: '',
            name: '',
            tmp: true,
            extend: false,
            opr_showMessage: true,
            opr_sys_path: ''
          }, {
            iconType: 'icon',
            icon: 'photo-o',
            text: '文字',
            imgOri: 'imgSelf',
            imgUrl: '',
            opr_path: '',
            opr_type: '',
            name: '',
            tmp: true,
            extend: false,
            opr_showMessage: true,
            opr_sys_path: ''
          }
        ],

        contentGrid: 'vertical',

        // 属性插件所需属性
        height: 86,
        heightType: "px",
        width: 100,
        widthType: '%',
        fsize: 28, // 内容文字大小
        fsizeType: "px", // 内容文字大小单位
        txt_fontColor: "initial", // 内容文字颜色
        iconColor: 'initial',
        iconSize: 28,
        iconSizeType: 'px',
        imgSize: 28,
        imgSizeType: 'px',
        col: true,
        // filterQuery: '',
        // 布局插件所需属性
        rows: 3,
        cols: 3,
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
    this.baseImgUrl = _global.baseUrl;
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
        if(this.args.gridList.length > 0) {
          this.nextStyle();
        }
        
    }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
    'args.iconColor'() {
      if(this.args.gridList.length > 0) {
        try {
          this.$refs.main.querySelectorAll('.self-grid .van-icon').forEach(item => {
            item.style.color = this.args.iconColor;
          })
        } catch (error) {
          console.log(error)
        }
      }
    },
    'args.txt_fontColor'() {
      if(this.args.gridList.length > 0) {
        try {
          this.$refs.main.querySelectorAll('.self-grid .van-grid-item__text').forEach(item => {
            item.style.color = this.args.txt_fontColor;
          })
        } catch (error) {
          console.log(error)
        }
      }
    },
    args_imgsize() {
      this.nextStyle();
    }
  },
  computed: {
    ...mapGetters("DWF_form", [
        "EntityAttrList",
        "Relations",
        "RelationAttrList"
    ]),
    arg_height() {
      return this.args.height < 10 && this.args.heightType == 'px' ? this.args.height * 5 + "px" : this.args.height + this.args.heightType;
    },
    // 文本内容字体大小
    args_fsize() {
      return this.args.fsize + this.args.fsizeType;
    },
    // 图标大小
    args_iconsize() {
      return this.args.iconSize + this.args.iconSizeType;
    },
    // 图片大小
    args_imgsize() {
      return this.args.imgSize + this.args.imgSizeType;
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

    nextStyle() {
      this.$nextTick(() => {
        this.setImgHeight();
      })
    },

    changeCol(val) {

      if(this.args.gridList) {
        this.args.gridList = this.args.gridList.splice(0, 5);
      }

      this.nextStyle();

    },

    setImgHeight() {
      
      try {

        this.$refs.main.querySelectorAll('.self-grid .van-grid-item__content--center').forEach(item => {
          item.style.fontSize = 'inherit';
        })
        this.$refs.main.querySelectorAll('.self-grid .van-icon').forEach(item => {
          item.style.color = this.args.iconColor;
        })
        this.$refs.main.querySelectorAll('.self-grid .van-grid-item__text').forEach(item => {
          item.style.color = this.args.txt_fontColor;
          item.style.fontSize = 'inherit';
        })

        this.$refs.main.querySelectorAll('.self-grid .van-icon__image').forEach(item => {
          item.style.height = this.args_imgsize;
          item.style.width = this.args_imgsize;
        })
        
        // let imgDom = this.$refs.myGrid.$children;
        // console.log(imgDom);
        // if(imgDom) {

        //   imgDom.forEach(img => {
            
        //     img.$el.children[0].children[0].children[0].style.height = this.args_imgsize;
        //     img.$el.children[0].children[0].children[0].style.width = this.args_imgsize;

        //   })

        // }

      } catch (error) {
        console.log(error)
      }

    },

    // 切换图标图片
    changeIconType(type) {

      if(type == 'image') {
        this.nextStyle();
      }

    },

    // 选择背景图片来源
    chooseOrigin(img) {

      if (img.imgOri == 'imgBase') {
          this.$refs.img_modal.editModal(img.imgUrl, '图片');
      }

    },
    clearImgUrl() {
      this.editItem.imgUrl = '';
    },

    getImgUrl(data) {
      
      console.log(data)
      if (data == null) {

          this.editItem.imgUrl = '';

      } else {

          this.editItem.imgUrl = data.oid;
      }

    },

    // 添加宫格
    addGrid() {

        if(this.args.gridList.length > (this.args.colNum * 5) - 1) {
            this.$Message.warning('最多添加5行宫格哦~');
        } else {

            let newGrid = {
              iconType: 'icon',
              icon: 'photo-o',
              text: '文字',
              imgOri: 'imgSelf',
              imgUrl: '',
              opr_path: '',
              opr_type: '',
              name: '',
              tmp: true,
              extend: false,
              opr_showMessage: true,
              opr_sys_path: ''
            }
            this.args.gridList.push(newGrid);

            this.nextStyle();

        }

    },

    // 编辑宫格
    editGrid(ind) {
      
      this.actIndex = ind;
      this.editItem = {...this.args.gridList[ind]};
      this.setModal = true;

    },

    // 宫格事件
    handleChangeEventOfOperationBar(event) {

      console.log(event);
      if (event.conf.opr_type == 'query') {


          if (event.query_opr.action == "implement"
          && !event.query_opr.conditionExpre.startsWith("procedure:")
          && !event.query_opr.conditionExpre.startsWith("serverScript:")
          && !event.query_opr.conditionExpre.startsWith("clientScript:")) {

              try {
                  this.args.gridList[event.index].extend = true;
              } catch (e) {
                  console.log(e);
              }

          }
      }

      this.$nextTick(() => {

        if(event.conf.opr_type === 'sys'){
          this.editItem.opr_showMessage = event.conf.opr_showMessage;
          this.editItem.opr_sys_path = event.conf.opr_sys_path ? event.conf.opr_sys_path : '';
        }

        this.editItem.opr_path = event.conf.opr_path;
        this.editItem.opr_type = event.conf.opr_type;
        console.log(this.editItem)

      })
      
  },

    confirmOption() {

      this.args.gridList[this.actIndex] = {...this.editItem};
      this.setModal = false;

      this.nextStyle();

    },

    cancelOption() {

      this.editItem.iconType = 'icon';
      this.editItem.text = '';
      this.editItem.icon = '';
      this.editItem.imgOri = 'imgSelf';
      this.editItem.imgUrl = '';
      this.setModal = false;

    },


    // 删除宫格
    delGrid(ind) {
      
      this.args.gridList.splice(ind, 1);

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
.grid-row {
    height: 32px;
    line-height: 32px;
}
.gridItem {
    border-bottom: 1px solid #efecec;
}
.item-head {
  height: 32px;
  line-height: 32px;
}
/* .self-grid>>>.van-icon__image {
  width: 28px;
  height: 28px;
} */
</style>
