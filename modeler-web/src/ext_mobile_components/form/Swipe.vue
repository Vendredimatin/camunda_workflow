<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth, 'padding-bottom': 0 + ' !important'}" ref="main">
          <span :style="{'height': arg_height, 'min-height': arg_height, 'width': '100%', 'display': 'inline-block',
              'background-color': args.main_color,'color': args.main_fontColor}">
            <van-swipe class="my-swipe" :style="{'height': arg_height, 'min-height': arg_height, 'width': '100%'}" :autoplay="args.autoPlayTimer" :loop="args.needLoop" indicator-color="white">
                <van-swipe-item v-for="(image, index) in args.swipeList" :key="index">
                  <img v-if="image.imgOri == 'imgBase' && image.imgUrl" :src="`${baseImgUrl}/files-download/${image.imgUrl}`" />
                  <img v-else-if="image.imgOri == 'imgSelf' && image.imgUrl" :src="image.imgUrl" />
                  <span v-else>{{ index+1 }}</span>
                </van-swipe-item>
            </van-swipe>
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
                      <p class="margin1">轮播间隔</p>
                      <Input class="margin1" v-model="args.autoPlayTimer" type="number">
                          <span slot="append">ms</span>
                      </Input>
                      <div class="margin1" style="margin: 10px 0 10px 0">
                        循环播放
                        <i-switch style="float: right" v-model="args.needLoop"/>
                      </div>
                      <Row class="margin1">
                        <Col span="10">
                            <span style="font-size: 12px;font-weight: 500;">轮播项设置</span>
                        </Col>
                        <Col span="14" style="text-align: right;">
                            <Button type="text" size="small" @click="addSwipe" style="font-weight: 500;">
                              <span style="font-size: 12px;">添加项</span>
                              <Icon type="md-add"></Icon>
                            </Button>
                        </Col>
                      </Row>
                      <div class="margin1" v-for="(item, index) in args.swipeList" :key="index">
                          <Row class="item-head margin1">
                            <Col span="10">
                                <span style="font-size: 12px;">轮播项{{ index+1 }}</span>
                            </Col>
                            <Col span="14" style="text-align: right;">
                                <Button type="text" size="small" @click="delSwipe(index)">
                                  <Icon type="md-close"></Icon>
                                </Button>
                            </Col>
                          </Row>
                          <Select class="margin1" v-model="item.imgOri" @on-change="switchOrigin(value, index)">
                              <Option value="imgBase">图片库</Option>
                              <Option value="imgSelf">自定义</Option>
                          </Select>
                          <Input class="margin1" type="textarea" :autosize="true" v-model="item.imgUrl" @on-focus="chooseOrigin(item, index)"/>
                      </div>

                    </div>
                    <div slot="layout">
                    </div>
                    <div slot="operation">
                    </div>
                    <!-- 图片库编辑弹窗 -->
                </EditBox>
            </span>
            <ImgEditModal ref="img_modal" @transferImg="getImgUrl"></ImgEditModal>
        </section>
        <section v-else :addinName="name" style="text-align: center">
            <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6cf;</i>
                </div>
                <div class="form-addin-name">
                    轮播
                </div>
            </span>
        </section>
</template>

<script>
import _global from '@/views/global.vue'
import { mapGetters, mapActions } from "vuex";
import EditBox from "@/ext_components/form/_EditBox.vue"
import ImgEditModal from '@/ext_components/form/subcomponent/ImgCommonModal'
import "@/styles/component/iconfont.css";

const name = "Swipe";
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
    ImgEditModal
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
      actIndex: -1,
      baseImgUrl: '',

      lEnClass: '',
      rEnClass: '',

      args: {
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '轮播',
        id: null,
        hided: false,
        value: "",

        picActIndex: -1,

        swipeList: [
            {
                imgOri: 'imgSelf',
                imgUrl: ''
            }, {
                imgOri: 'imgSelf',
                imgUrl: ''
            }, {
                imgOri: 'imgSelf',
                imgUrl: ''
            }, {
                imgOri: 'imgSelf',
                imgUrl: ''
            }
        ],

        titleAttr: '',
        describeAttr: '',
        priceAttr: '',
        numAttr: '',
        imgAttr: '',
        tagAttr: '',
        extagAttr: '',
        autoPlayTimer: 3000,
        needLoop: true,

        // 属性插件所需属性
        height: 150,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ["轮播切换", '点击轮播项'],
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

       // 缺省绑定类为当前表单目标类
      // if(this.args.bindTargetClass == '') {

      //   if(this.itemValue.data.isRelation) {
      //     this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
      //   } else {
      //     this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
      //   }

      // }

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

    // 添加轮播项
    addSwipe() {

      console.log(this.args.swipeList);
      if(this.args.swipeList.length > 5) {
        this.$Message.warning('最多添加6个轮播项哦~');
      } else {

        let newSwipe = {
          imgOri: 'imgSelf',
          imgUrl: ''
        }
        this.args.swipeList.push(newSwipe);

      }

    },

    // 删除轮播项
    delSwipe(ind) {
      
      console.log(ind);
      this.args.swipeList.splice(ind, 1);

    },

    // 选择背景图片来源
    chooseOrigin(img, index) {

        this.actIndex = index;
        if (img.imgOri == 'imgBase') {
            this.$refs.img_modal.editModal(img.imgUrl, '图片');
        }

    },

    switchOrigin(val, ind) {

      console.log(val, ind);
      this.args.swipeList[ind].imgUrl = '';

    },

    getImgUrl(data, index) {

        let imgIndex = this.actIndex;

        if (data == null) {

            this.args.swipeList[imgIndex].imgUrl = '';

        } else {

            this.args.swipeList[imgIndex].imgUrl = data.oid;
        }

        this.args.picActIndex = index;

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
.my-swipe .van-swipe-item {
    color: #fff;
    font-size: 20px;
    /* line-height: 150px; */
    text-align: center;
    background-color: #39a9ed;
}
.my-swipe img {
  width: 100%;
  height: 100%;
}
.item-head {
  height: 24px;
  line-height: 24px;
}
</style>
