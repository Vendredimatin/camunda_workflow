<template>
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
    <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color}">
        <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
    </span>
    <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor, 'overflow-y': 'scroll', 'position': 'relative'}">
      <div class="map-mask" :style="{'height': arg_map_height, 'width': '100%', 'position': 'absolute','z-index': '999', 'left': '0', 'top': '0'}">
      </div>
      <div :id="mapId"
           class="BMapContainer"
           :style="{'height': arg_map_height, 'width': '100%'}">
      </div>
    </span>
    <slot name="widget"></slot>
      <span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox"
        v-model="args"
        :itemValue="itemValue"
        :attributes="filter_attributes"
        :router="router"
        :route="route"
        :root="root"
        :store="store"
        :targetclass="itemValue.data.targetClass"
        @handleBindTargetClassChange="handleBindTargetClassChange"
      >
        <div slot="attribute">
          <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
              经纬度映射类型
            <RadioGroup v-model="args.lnglatMapType" type="button" size="small">
              <Radio label="单独映射"></Radio>
              <Radio label="字符串映射"></Radio>
            </RadioGroup>
          </div>
          <div class="editbox-dynamic-map" v-show="args.lnglatMapType === '字符串映射'">
            <p class="margin1">经纬度</p>
            <Select class="margin1" ref="lnglat" filterable clearable v-model="args.map.lnglat.type">
              <OptionGroup label="系统属性" v-if="lnglatMapDataTypesAttributes_Sys">
              <Option
                      v-for="item in lnglatMapDataTypesAttributes_Sys"
                      :value="item.attributeName"
                      :key="item.attributeName"
                      :label="item.displayName"
              >
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
              </Option>
              </OptionGroup>
              <OptionGroup label="类属性" v-if="lnglatMapDataTypesAttributes_Def">
              <Option
                      v-for="item in lnglatMapDataTypesAttributes_Def"
                      :value="item.attributeName"
                      :key="item.attributeName"
                      :label="item.displayName"
              >
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
              </Option>
              </OptionGroup>
              <OptionGroup label="关联类系统属性" v-if="lnglatMapDataTypesAttributes_relationSys">
              <Option
                      v-for="item in lnglatMapDataTypesAttributes_relationSys"
                      :value="item.attributeName"
                      :key="item.attributeName"
                      :label="item.displayName"
              >
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
              </Option>
              </OptionGroup>
              <OptionGroup label="关联类属性" v-if="lnglatMapDataTypesAttributes_relationDef">
              <Option
                      v-for="item in lnglatMapDataTypesAttributes_relationDef"
                      :value="item.attributeName"
                      :key="item.attributeName"
                      :label="item.displayName"
              >
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
              </Option>
              </OptionGroup>
              <OptionGroup label="左类系统属性" v-if="lnglatMapDataTypesAttributes_leftSys">
              <Option
                      v-for="item in lnglatMapDataTypesAttributes_leftSys"
                      :value="item.attributeName"
                      :key="item.attributeName"
                      :label="item.displayName"
              >
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
              </Option>
              </OptionGroup>
              <OptionGroup label="左类属性" v-if="lnglatMapDataTypesAttributes_leftDef">
              <Option
                      v-for="item in lnglatMapDataTypesAttributes_leftDef"
                      :value="item.attributeName"
                      :key="item.attributeName"
                      :label="item.displayName"
              >
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
              </Option>
              </OptionGroup>
              <OptionGroup label="右类系统属性" v-if="lnglatMapDataTypesAttributes_rightSys">
              <Option
                      v-for="item in lnglatMapDataTypesAttributes_rightSys"
                      :value="item.attributeName"
                      :key="item.attributeName"
                      :label="item.displayName"
              >
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
              </Option>
              </OptionGroup>
              <OptionGroup label="右类属性" v-if="lnglatMapDataTypesAttributes_rightDef">
              <Option
                      v-for="item in lnglatMapDataTypesAttributes_rightDef"
                      :value="item.attributeName"
                      :key="item.attributeName"
                      :label="item.displayName"
              >
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
              </Option>
              </OptionGroup>
            </Select>
          </div>
          <div class="editbox-dynamic-map" v-show="args.lnglatMapType === '单独映射'">
            <p class="margin1">经度</p>
            <Select class="margin1" ref="longitude" filterable clearable v-model="args.map.longitude.type">

              <OptionGroup label="系统属性" v-if="lnglatDataTypesAttributes_Sys">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_Sys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="类属性" v-if="lnglatDataTypesAttributes_Def">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_Def" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>

              <OptionGroup label="关联类系统属性" v-if="lnglatDataTypesAttributes_relationSys">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_relationSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="关联类属性" v-if="lnglatDataTypesAttributes_relationDef">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_relationDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="左类系统属性" v-if="lnglatDataTypesAttributes_leftSys">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_leftSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="左类属性" v-if="lnglatDataTypesAttributes_leftDef">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_leftDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="右类系统属性" v-if="lnglatDataTypesAttributes_rightSys">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_rightSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="右类属性" v-if="lnglatDataTypesAttributes_rightDef">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_rightDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
            </Select>
            <p class="margin1">纬度</p>
            <Select class="margin1" ref="latitude" filterable clearable v-model="args.map.latitude.type">
              <OptionGroup label="系统属性" v-if="lnglatDataTypesAttributes_Sys">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_Sys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="类属性" v-if="lnglatDataTypesAttributes_Def">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_Def" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>

              <OptionGroup label="关联类系统属性" v-if="lnglatDataTypesAttributes_relationSys">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_relationSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="关联类属性" v-if="lnglatDataTypesAttributes_relationDef">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_relationDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="左类系统属性" v-if="lnglatDataTypesAttributes_leftSys">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_leftSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="左类属性" v-if="lnglatDataTypesAttributes_leftDef">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_leftDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="右类系统属性" v-if="lnglatDataTypesAttributes_rightSys">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_rightSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="右类属性" v-if="lnglatDataTypesAttributes_rightDef">
                <Option v-for="(item, index) in lnglatDataTypesAttributes_rightDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
              </OptionGroup>
            </Select>
          </div>
          <Collapse v-model="mapIconOpen" class="editbox-dynamic-map">
            <Panel name="icon">
              坐标点展示图标
              <div slot="content">
                <p class="margin1">图标</p>
                <Select class="margin1" ref="iconType" filterable clearable v-model="args.map.icon.type">
                    <OptionGroup label="系统属性" v-if="dataTypesAttributes_Sys">
                      <Option v-for="(item, index) in dataTypesAttributes_Sys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="类属性" v-if="dataTypesAttributes_Def">
                      <Option v-for="(item, index) in dataTypesAttributes_Def" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>

                    <OptionGroup label="关联类系统属性" v-if="dataTypesAttributes_relationSys">
                      <Option v-for="(item, index) in dataTypesAttributes_relationSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="关联类属性" v-if="dataTypesAttributes_relationDef">
                      <Option v-for="(item, index) in dataTypesAttributes_relationDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="左类系统属性" v-if="dataTypesAttributes_leftSys">
                      <Option v-for="(item, index) in dataTypesAttributes_leftSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="左类属性" v-if="dataTypesAttributes_leftDef">
                      <Option v-for="(item, index) in dataTypesAttributes_leftDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="右类系统属性" v-if="dataTypesAttributes_rightSys">
                      <Option v-for="(item, index) in dataTypesAttributes_rightSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="右类属性" v-if="dataTypesAttributes_rightDef">
                      <Option v-for="(item, index) in dataTypesAttributes_rightDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                  </Select>
                <p class="margin1">默认图标地址源</p>
                <Select class="margin1" v-model="args.imgSource" @on-change="switchOrigin">
                    <Option value="imgBase">图片库</Option>
                    <Option value="imgSelf">自定义</Option>
                </Select>
                <Input class="margin1" type="textarea" :autosize="true" v-model="args.pointIcon" @on-focus="chooseOrigin" />
                    <!-- 图片库编辑弹窗 -->
                <ImgEditModal ref="img_modal" @transferImg="getImgUrl"></ImgEditModal>
              </div>
            </Panel>
            <Panel name="mark">
              坐标点展示角标
              <div slot="content">
                <p class="margin1">角标</p>
                <Select class="margin1" ref="iconAttr" filterable clearable v-model="args.map.icon.attribute">
                    <OptionGroup label="系统属性" v-if="dataTypesAttributes_Sys">
                      <Option v-for="(item, index) in dataTypesAttributes_Sys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="类属性" v-if="dataTypesAttributes_Def">
                      <Option v-for="(item, index) in dataTypesAttributes_Def" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>

                    <OptionGroup label="关联类系统属性" v-if="dataTypesAttributes_relationSys">
                      <Option v-for="(item, index) in dataTypesAttributes_relationSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="关联类属性" v-if="dataTypesAttributes_relationDef">
                      <Option v-for="(item, index) in dataTypesAttributes_relationDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="左类系统属性" v-if="dataTypesAttributes_leftSys">
                      <Option v-for="(item, index) in dataTypesAttributes_leftSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="左类属性" v-if="dataTypesAttributes_leftDef">
                      <Option v-for="(item, index) in dataTypesAttributes_leftDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="右类系统属性" v-if="dataTypesAttributes_rightSys">
                      <Option v-for="(item, index) in dataTypesAttributes_rightSys" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                    <OptionGroup label="右类属性" v-if="dataTypesAttributes_rightDef">
                      <Option v-for="(item, index) in dataTypesAttributes_rightDef" :key="index" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>
                    </OptionGroup>
                </Select>
                <p class="margin1">角标属性映射表</p>
                <Input class="margin1" type="textarea" :autosize="true" v-model="args.map.icon.iconAttributeMap" @on-focus="chooseIcon" />
              </div>
            </Panel>
          </Collapse>
        </div>

        <div slot="layout">
        <div v-if="'height' in args">
          <p class="margin1">地图区高度</p>
          <Input class="margin1" number v-model="args.map_height" type="number">
              <Select v-model="args.map_heightType" slot="append" style="width: 70px;">
                  <Option value="px">px</Option>
                  <Option value="vw">vw</Option>
                  <Option value="rem">rem</Option>
              </Select>
          </Input>
        </div>
          <p class="margin1">图标高度</p>
          <Input class="margin1" number v-model="args.map.icon.icon_height" type="number">
              <Select v-model="args.iconheightType" slot="append" style="width: 70px;">
                  <Option value="px">px</Option>
                  <Option value="vw">vw</Option>
                  <Option value="rem">rem</Option>
              </Select>
          </Input>
          <p class="margin1">图标宽度</p>
          <Input class="margin1" number v-model="args.map.icon.icon_width" type="number">
              <Select v-model="args.iconwidthType" slot="append" style="width: 70px;">
                  <Option value="px">px</Option>
                  <Option value="vw">vw</Option>
                  <Option value="rem">rem</Option>
              </Select>
          </Input>
        </div>
        <div slot="operation">
        </div>
      </EditBox>
    </span>
    <IconEditModal v-if="needIcon" ref="icon_modal" @transferIcon="getIconLabel"></IconEditModal>

  </section>
  <section v-else :addinName="name">
    <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe69b;</i>
      </div>
       <div class="form-addin-name">
            动态地图
          </div>
<!--      <Tooltip class="form-addin-name" content="动态地图" style="width: 100%;" :transfer="true">动态地图</Tooltip>-->
    </span>
  </section>
</template>

<script>
  import { getEntity } from "@/api/data-model/EntityModeling";
  import { getRelation } from '@/api/data-model/RelationModeling';
  import "@/styles/component/iconfont.css";
  import _global from '@/views/global.vue'
  import ImgEditModal from './subcomponent/ImgCommonModal'
  import EditBox from "./_EditBox.vue";
  import IconEditModal from './subcomponent/IconCommonPanel'
  import { mapGetters, mapActions, mapMutations } from "vuex";
  import { Message } from "iview";
  import { uuid } from '@/util/assist'
  import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from "../../libs/utils";

  // 设置插件英文名, 该name需要与插件文件名一致
  const name = "DynamicMap";

  export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" ,
      "itemValue",
      "attributes",
      "query_oprs",
      "route",
      "router",
      "root",
      "store",
      "Message",
      "relation"
    ],
    data() {
      return {
        times: 0,
        name: name,
        actEdit: false,
        isRelation: false,
        t_preview: true,
        t_edit: false,
        spinShow: false,
        needIcon: false,
        mapIconOpen: 'icon',
        dataTypesAttributes_Sys: null,
        dataTypesAttributes_Def: null,
        lnglatMapDataTypesAttributes_Sys: null,
        lnglatMapDataTypesAttributes_Def: null,
        lnglatDataTypesAttributes_Sys: null,
        lnglatDataTypesAttributes_Def: null,
        dataTypesAttributes_relationSys: null,
        dataTypesAttributes_relationDef: null,
        lnglatMapDataTypesAttributes_relationSys: null,
        lnglatMapDataTypesAttributes_relationDef: null,
        lnglatDataTypesAttributes_relationSys: null,
        lnglatDataTypesAttributes_relationDef: null,
        dataTypesAttributes_leftSys: null,
        dataTypesAttributes_leftDef: null,
        lnglatMapDataTypesAttributes_leftSys: null,
        lnglatMapDataTypesAttributes_leftDef: null,
        lnglatDataTypesAttributes_leftSys: null,
        lnglatDataTypesAttributes_leftDef: null,
        dataTypesAttributes_rightSys: null,
        dataTypesAttributes_rightDef: null,
        lnglatMapDataTypesAttributes_rightSys: null,
        lnglatMapDataTypesAttributes_rightDef: null,
        lnglatDataTypesAttributes_rightSys: null,
        lnglatDataTypesAttributes_rightDef: null,
        // 属性配置项,按需设置
        args: {
          id: "", // 控件代号,一般为必须
          // name: '',
          dynamic: true,
          height: 500, // 整体高度
          hided: false,
          map_height: 490,
          heightType: "px",
          map_heightType: "px",
          iconheightType: 'px',
          iconwidthType: "px",
          label: '',
          label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
          label_fontColor: "initial", // 标签字体颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          width: 100,
          widthType: '%',
          label_color: "initial", // 标签背景颜色
          main_align: 4, // 主区域对齐方式,默认为4居中对齐
          main_fontType: "", // 主区域字体
          main_fontSize: 14, // 主区域字号
          main_fontColor: "initial", // 主区域字体颜色
          main_color: "initial", // 主区域背景颜色
          align: "Vertical", // 标签与主区域的排列方式
          label_width: 2,
          main_width: 3, // 标签与主区域的占比为 label_width : main_width
          // 以下为不在属性编辑框中设置,但默认要有的配置项

          imgSource: 'imgSelf',
          pointIcon: "",           // 背景图片,超链接

          title: "百度地图", // 插件中文名,需要填入默认值
          col: false, // 是否不占满全部
          cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null, // 目标数据类型
          events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: ["鼠标悬停", "获得焦点"],
          lnglatMapType: '单独映射',
          bindTargetClass: '',
          refClass: '',
          filterQuery: '',
          //动态地图相关项
          map: {
            data: {},
            point: [],
            longitude: {
              type: '',
              data: []
            },
            latitude: {
              type: '',
              data: []
            },
            lnglat: {
              type: '',
              data: []
            },
            icon: {
              attribute: '',
              iconAttributeMap: '',
              type: '',
              icon_url: [],
              icon_width: 30,
              icon_height: 30,
            },
            path: [],
          },
          point: {},

          iconLabel: '',
          iconArr: [],
          iconObj: {},
        },
        refClassAttributes: [],
        selectAttributesMap: false,
        attributesList: [],
        entitiesList: [],
        relationsList: [],

        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ["String"],
        lnglatDataTypes: ['Integer', 'Double'],
        lnglatMapDataTypes: ["String"],
        // 需要设置目标属性时使用
        attrMap: {},
        // 需要动态设置高度时使用
        timer: null,
        mapId: `mapId_${uuid()}`,
        first: true,
      };
    },
    components: {
      EditBox,
      IconEditModal,
      ImgEditModal
    },
    // 插件挂载顺序为: created -> setDisplayType -> setArgs -> setValue -> mounted

    beforeMount() {
      // delete this.args["label_align"];
      // delete this.args["label_width"];
      // delete this.args["main_align"];
      // delete this.args["main_width"];
      delete this.args["basic_height"];
    },
    inject: [
      'setBasicArgs'
    ],
    created() {
      //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
      if (this.t_preview) {

        this.$store = this.store;
        this.baseUrl = _global.baseUrl;
        let that = this;
        if (this.attributes && this.attributes.length == 4 && this.attributes[0] == "relation") this.isRelation = true;
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

      // this.initData();
    },
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
        this.args.targetClass = this.itemValue.data.targetClass;

        this.allEntityClasses = this.Entities().filter(x=> typeof x.className == "string");
        this.allRelationClasses = this.Relations();
        if(this.args.bindTargetClass === ''){
          this.args.bindTargetClass = this.allRelationClasses.filter(item => item.className === this.args.bindTargetClass).length === 0 ? this.args.bindTargetClass + '&e' : this.args.bindTargetClass + '&r'
        }
        this.$nextTick(() => {
          this.map = new BMap.Map(this.mapId, {
            enableMapClick: false
          });
          this.point = new BMap.Point(116.404, 39.915);
          this.map.centerAndZoom(this.point, 15);
          this.map.disableDragging();
          this.map.disableDoubleClickZoom();
          this.map.disableKeyboard();
        })
      }
    },
    computed: {
      ...mapGetters("DWF_form", [
        "Entities",
        "getEntity",
        "Relations",
        "RelationAttrList",]
      ),
      arg_bgPic() {
        let finalBg = '';
        if (this.args.imgSource == 'imgSelf') {
          finalBg = `url(${this.args.pointIcon})`
        } else {
          finalBg = this.args.pointIcon == '' ? this.args.pointIcon : `url(${this.baseUrl}/files-download/${this.args.pointIcon})`;
        }
        return finalBg;
      },
      // 需要设置目标属性时使用,不用可删去
      arg_name() {
        return this.args.name;
      },

      labelWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return (!this.args.label || this.args.label == "") ? "10%" : this.args.label_widthByPx + 'px';
        }else{
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
      mainWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : `calc(100% - ${this.args.label_widthByPx}px)`;
        }else{
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
      // 需要设置目标属性时使用,不用可删去
      filter_attributes() {
        return  this.refClassAttributes ? this.refClassAttributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) : []
      },
      filter_lnglatMapAttributes() {
        return this.refClassAttributes ? this.refClassAttributes.filter(x => this.lnglatMapDataTypes.indexOf(x.valueType) > -1) : []
      },
      filter_lnglatAttributes() {
        return this.refClassAttributes ? this.refClassAttributes.filter(x => this.lnglatDataTypes.indexOf(x.valueType) > -1) : []
      },

      arg_height() {
        return this.args.height < 2 ? this.args.height * 500 + "px" : this.args.height + this.args.heightType;
      },
      arg_map_height(){
        return this.args.map_height < 2 ? this.args.map_height * 500 + "px" : this.args.map_height + this.args.map_heightType;
      },
      arg_icon_width(){
        return this.args.icon_width < 2
          ? this.args.icon_width * 30 + "px"
          : this.args.icon_width > 15 && this.args.iconwidthType !== 'px'
            ? 10 + this.args.iconwidthType
            : this.args.icon_width > 150 && this.args.iconwidthType == 'px'
              ? '150px'
              : this.args.icon_width + this.args.iconwidthType;
      },
      arg_icon_height(){
        return this.args.icon_height < 2
          ? this.args.icon_height * 30 + "px"
          : this.args.icon_height > 15 && this.args.iconheightType !== 'px'
            ? 10 + this.args.iconheightType
            : this.args.icon_height > 150 && this.args.iconheightType == 'px'
              ? '150px'
              : this.args.icon_height + this.args.iconheightType;
      },

      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },

      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      contentWidth() {
        return this.args.useIcon
          ? '80%'
          : '100%'
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
      mainNXAlign() {
        let x = parseInt(this.args.main_align / 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      mainNYAlign() {
        let x = parseInt(this.args.main_align % 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },

      arg_targetClass() {
        return this.args.targetClass;
      },
    },

    watch: {
      // 监听refClass的变化，调用API
      "args.bindTargetClass": function (newRefClass, oldRefClass) {
        if (newRefClass) {
          if(!this.first){
            let _this = this;
            setTimeout(() => {
              _this.$refs.longitude ? _this.$refs.longitude.clearSingleSelect() : '';
              _this.$refs.latitude ? _this.$refs.latitude.clearSingleSelect() : '';
              _this.$refs.lnglat ? _this.$refs.lnglat.clearSingleSelect() : '';
              _this.$refs.iconType ? _this.$refs.iconType.clearSingleSelect() : '';
              _this.$refs.iconAttr ? _this.$refs.iconAttr.clearSingleSelect() : '';
            }, 0)
          }else{
            this.first = false;
          }
          let type = newRefClass.split('\&')[1];
          newRefClass = newRefClass.split('\&')[0];
          if(type == 'r'){
            let temReAttr = [];
            let temLAttr = [];
            let temRAttr = [];
            this.resetAttribute();
            getRelation(newRefClass).then(response => {
              if(response.success) {
                let res = response.data;
                let dataTypesREAttributes = res.attributes
                .filter(
                  x => this.dataTypes.indexOf(x.valueType) > -1
                )
                let lnglatMapDataTypesREAttributes = res.attributes
                .filter(
                  x => this.lnglatMapDataTypes.indexOf(x.valueType) > -1
                )
                let lnglatDataTypesREAttributes = res.attributes
                .filter(
                  x => this.lnglatDataTypes.indexOf(x.valueType) > -1
                )
                this.dataTypesAttributes_relationSys = dataTypesREAttributes.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
                this.dataTypesAttributes_relationDef = dataTypesREAttributes.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
                this.lnglatMapDataTypesAttributes_relationSys = lnglatMapDataTypesREAttributes.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
                this.lnglatMapDataTypesAttributes_relationDef = lnglatMapDataTypesREAttributes.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
                this.lnglatDataTypesAttributes_relationSys = lnglatDataTypesREAttributes.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
                this.lnglatDataTypesAttributes_relationDef = lnglatDataTypesREAttributes.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
                temReAttr = res.attributes.map(val => {
                  val.attributeName = `relation_${val.attributeName}`;
                  val.displayName = `relation_${val.displayName}`;
                  return val
                });
                if ('leftClass' in res) {
                  getEntity(res.leftClass).then(mes => {
                    if (mes.success) {
                      let resL = mes.data;
                      let dataTypesLAttributes = resL.attributes
                      .filter(
                        x => this.dataTypes.indexOf(x.valueType) > -1
                      )
                      let lnglatMapDataTypesLAttributes = resL.attributes
                      .filter(
                        x => this.lnglatMapDataTypes.indexOf(x.valueType) > -1
                      )
                      let lnglatDataTypesLAttributes = resL.attributes
                      .filter(
                        x => this.lnglatDataTypes.indexOf(x.valueType) > -1
                      )
                      this.dataTypesAttributes_leftSys = dataTypesLAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.dataTypesAttributes_leftDef = dataTypesLAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      this.lnglatMapDataTypesAttributes_leftSys = lnglatMapDataTypesLAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.lnglatMapDataTypesAttributes_leftDef = lnglatMapDataTypesLAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      this.lnglatDataTypesAttributes_leftSys = lnglatDataTypesLAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.lnglatDataTypesAttributes_leftDef = lnglatDataTypesLAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      temLAttr = resL.attributes.map(val => {
                        val.attributeName = `left_${val.attributeName}`;
                        val.displayName = `left_${val.displayName}`;
                        return val
                      });
                    }
                  }).catch(error => {
                    this.$Message.error(error.response.data.message);
                  });
                }
                // 判断左右关联实体类不是同一个类
                if('rightClass' in res) {
                  getEntity(res.rightClass).then(mes => {
                    if(mes.success) {
                      let resR = mes.data;

                      let dataTypesRAttributes = resR.attributes
                      .filter(
                        x => this.dataTypes.indexOf(x.valueType) > -1
                      )
                      let lnglatMapDataTypesRAttributes = resR.attributes
                      .filter(
                        x => this.lnglatMapDataTypes.indexOf(x.valueType) > -1
                      )
                      let lnglatDataTypesRAttributes = resR.attributes
                      .filter(
                        x => this.lnglatDataTypes.indexOf(x.valueType) > -1
                      )
                      this.dataTypesAttributes_rightSys = dataTypesRAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.dataTypesAttributes_rightDef = dataTypesRAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      this.lnglatMapDataTypesAttributes_rightSys = lnglatMapDataTypesRAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.lnglatMapDataTypesAttributes_rightDef = lnglatMapDataTypesRAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      this.lnglatDataTypesAttributes_rightSys = lnglatDataTypesRAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.lnglatDataTypesAttributes_rightDef = lnglatDataTypesRAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      temRAttr = resR.attributes.map(val => {
                        val.attributeName = `right_${val.attributeName}`;
                        val.displayName = `right_${val.displayName}`;
                        return val
                      });
                    }
                  });
                  setTimeout(() => {
                    this.refClassAttributes = temReAttr.concat(temLAttr, temRAttr);
                  }, 500)
                } else {
                  this.$Message.warning(response.message);
                }
              }
            })
          }else{
            // 获取RefClass的属性数组refClassAttributes
            getEntity(newRefClass)
            .then(res => {
              this.resetAttribute();
              this.refClassAttributes = res.data.attributes
              let dataTypesAttributes = this.refClassAttributes
              .filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              )
              let lnglatMapDataTypesAttributes = this.refClassAttributes
              .filter(
                x => this.lnglatMapDataTypes.indexOf(x.valueType) > -1
              )
              let lnglatDataTypesAttributes = this.refClassAttributes
              .filter(
                x => this.lnglatDataTypes.indexOf(x.valueType) > -1
              )
              this.dataTypesAttributes_Sys = dataTypesAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.dataTypesAttributes_Def = dataTypesAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
              this.lnglatMapDataTypesAttributes_Sys = lnglatMapDataTypesAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.lnglatMapDataTypesAttributes_Def = lnglatMapDataTypesAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
              this.lnglatDataTypesAttributes_Sys = lnglatDataTypesAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.lnglatDataTypesAttributes_Def = lnglatDataTypesAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            })
            .catch(error => {
              this.$Message.error(error.response.data.message);
            });
          }
        }
      },
    },
    methods: {
      ...mapActions("DWF_form", [
        "handleQueryData",
        "queryRelation",
        "queryEntity",
        "editEObj",
        "deleteEObj",
        "saveEObj"
      ]),

      ...mapMutations("DWF_form", ["addEntity"]),

      // async initData() {
      //   getAllEntities({ needOperationCount: false }).then(res => {
      //     let entities = res.data.data;
      //     this.entitiesList = [];
      //     entities.forEach(x => {
      //       this.entitiesList.push({
      //         className: x.className,
      //         displayName: x.displayName
      //       })
      //     });
      //   });
      //   getAllRelations({ needOperationCount: false }).then(res => {
      //     let relations = res.data.data;
      //     this.relationsList = [];
      //     relations.forEach(x => {
      //       this.relationsList.push({
      //         className: x.className,
      //         displayName: x.displayName
      //       })
      //     });
      //   });
      // },
      resetAttribute(){
        this.dataTypesAttributes_Sys = null;
        this.dataTypesAttributes_Def = null;
        this.lnglatMapDataTypesAttributes_Sys = null;
        this.lnglatMapDataTypesAttributes_Def = null;
        this.lnglatDataTypesAttributes_Sys = null;
        this.lnglatDataTypesAttributes_Def = null;
        this.dataTypesAttributes_relationSys = null;
        this.dataTypesAttributes_relationDef = null;
        this.lnglatMapDataTypesAttributes_relationSys = null;
        this.lnglatMapDataTypesAttributes_relationDef = null;
        this.lnglatDataTypesAttributes_relationSys = null;
        this.lnglatDataTypesAttributes_relationDef = null;
        this.dataTypesAttributes_leftSys = null;
        this.dataTypesAttributes_leftDef = null;
        this.lnglatMapDataTypesAttributes_leftSys = null;
        this.lnglatMapDataTypesAttributes_leftDef = null;
        this.lnglatDataTypesAttributes_leftSys = null;
        this.lnglatDataTypesAttributes_leftDef = null;
        this.dataTypesAttributes_rightSys = null;
        this.dataTypesAttributes_rightDef = null;
        this.lnglatMapDataTypesAttributes_rightSys = null;
        this.lnglatMapDataTypesAttributes_rightDef = null;
        this.lnglatDataTypesAttributes_rightSys = null;
        this.lnglatDataTypesAttributes_rightDef = null;
      },

      switchOrigin(value) {
        this.args.pointIcon = '';
      },

      // 选择背景图片来源
      chooseOrigin() {
        if(this.args.imgSource == 'imgBase') {
          this.$refs.img_modal.editModal(this.args.pointIcon, '图片');
        }

      },
      // 选择背景图片
      getImgUrl(data, index) {
        if(data == null) {
          this.args.pointIcon = '';
        } else {
          this.args.pointIcon = data.oid;
        }
        this.args.picActIndex = index;
      },
      chooseIcon() {
        if(!this.needIcon) {
          this.needIcon = true;
          this.$Spin.show();
          setTimeout(() => {
            this.$Spin.hide();
            this.$refs.icon_modal.editModal(this.args.iconArr, this.args.map.icon.iconAttributeMap);
          }, 500);

        } else {
          this.$refs.icon_modal.editModal(this.args.iconArr, this.args.map.icon.iconAttributeMap);
        }

      },

      getIconLabel(data) {

        this.args.map.icon.iconAttributeMap= data;

        this.args.iconObj = {};
        if(data.length != 0) {

          let temArr = data.split(',');
          // 映射表
          temArr.forEach(val => {

            // 数字特殊处理
            const _k = val.split(':')[0];
            const _kl = _k.length;
            const _pk = parseInt(_k);
            let _pkl;
            if(!isNaN(_pk)) _pkl = _pk.toString().length;

            let _key;
            if(_kl == _pk) {

              _key = _pk;

            } else {
              _key = _k;
            }

            let _value = val.split(':')[1];

            this.args.iconObj[_key] = _value;
          })

          // 整理传回图标组件的图标合集
          temArr = temArr.map(x => { return x.split(':')[1] });

          this.args.iconArr = temArr;

        } else {
          this.args.iconObj = {};
          this.args.iconArr = [];
        }

      },

      getAllow() {
        return null;
      },

      getArgs() {
        return this.args;
      },

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
        if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      // 获取可继承属性
      getInherit() {
        var res = {};
        let that = this;
        this.inherit.forEach(x => res[x] = that.args[x]);
        return res;
      },

      getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },

      getName() {
        return name;
      },

      setDisplayType(type) {
        this.t_preview = type == 0;
        return this;
      },

      handleBindTargetClassChange(val){
        if(!val){
          this.args.map.longitude.type = '';
          this.args.map.latitude.type = '';
          this.args.map.lnglat.type = '';
          this.args.map.icon.type = '';
          this.args.map.icon.attribute = '';
          this.resetAttribute();
        }
      },
    }
  };
</script>

<style>
  .editbox-dynamic-map .ivu-select-dropdown{
    width: 100%!important;
    left: 0px!important;
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
  .BMapContainer {
    height: 500px;
    width: 100%;
  }
</style>
