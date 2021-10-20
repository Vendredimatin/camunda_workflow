<template>
  <!--
        应用前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section v-show="!args.hided" :addinName="name" :style="{'width': colWidth}" ref="main">
    <!--
            插件前端实现区域
    -->
    <span
      :style="{'height': args.basic_height * args.height + 'px', 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
    >
      <span
        class="multi-object-preview"
        :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'text-align': 'left','overflow':'hidden'}"
      >
        <!-- v-if="displayAttribute.valueType=='LocalFile'" -->

        <div class="multi-object-preview" ref="preview">
          <!-- 以媒体形式展示 -->
          <div>
            <Card
              v-for="(item,index) in pagedData"
              class="self-card"
              :class="{'selected': pagedDataStyle[index].selected, 'darkcss': darkcss}"
              :style="{'display': 'inline-block','margin':args.unitMargin+'px','padding':arg_unitPadding,
                    'width':arg_unitWidthType?'':arg_unitWidth()}"
              :bordered="args.unitBordered"
              :dis-hover="!args.unitHovered"
              @click.native="handleObjClick(item, index)"
            >
              <!-- 对象展示区 -->
              <div
                :style="{'text-align':'center','height':arg_unitHeight,
            'width':arg_unitWidthType?arg_unitWidth():'100%',
            'overflow': 'hidden'}"
              >
                <div class="img_div"
                  v-if="item.objType == 'image'"
                  :style="{'height':arg_unitHeight}"
                >
                  <div
                    :style="{'width':arg_selectedScalingType,'height':'100%',
                    backgroundImage: 'url('+item.displayValue+')',
                'background-repeat': 'no-repeat',
                  'background-size': imageBackgroundSize,}"
                  ></div>
                  <div>
                    <!-- 遮罩部分 -->
                    <div class="mask">
                      <div style="text-align: right;">
                        <a href="#" class="unit-predict"
                          v-if="args.unitPredictable"
                          @click="showGallery($event, index)"
                        >
                          <Icon type="ios-eye-outline" title="预览"/>
                        </a>
                        <a
                          class="unit-download"  target="_blank"
                          v-if="args.unitDownloadable"
                          :href="item.displayValue"
                          :download="item.fileName"
                          @click="download($event)"
                        >
                          <Icon type="ios-download" title="下载"/>
                        </a>
                      </div>
                      <div style="height: 100%;" @click="handleObjClick(item, index)">
                        <h3 :style="{'text-align':'center','padding-top':(args.unitHeight-40)/3 +'px'}"
                        >{{item.tipValue}}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  v-if="item.objType == 'file'"
                  :href="item.displayValue"
                  @mouseover="overImg = true"
                  @mouseleave="overImg = false"
                  :style="{'width':arg_selectedScalingType}"
                >{{ value }}</a>
                <video
                  v-if="item.objType == 'video'"
                  controls="controls"
                  :src="item.displayValue"
                  @mouseover="overImg = true"
                  @mouseleave="overImg = false"
                  :style="{'width':arg_selectedScalingType,'controls':'true','controlslist':'nodownload'}"
                ></video>
                <audio
                  v-if="item.objType == 'audio'"
                  controls="controls"
                  :src="item.displayValue"
                  @mouseover="overImg = true"
                  @mouseleave="overImg = false"
                  :style="{'width':arg_selectedScalingType}"
                ></audio>
                <iframe
                  v-if="item.objType == 'docu'"
                  controls="controls"
                  :src="item.displayValue"
                  @mouseover="overImg = true"
                  @mouseleave="overImg = false"
                  :style="{'width':arg_selectedScalingType,'frameborder':'1'}"
                ></iframe>
              </div>
              <!-- 标签内置 -->
              <div class="display-label">
                <div v-if="args.unitLabelEmbed"
                  :style="{'width':arg_unitWidthType?arg_unitWidth():'100%',
                  'height':args.unitLabelEnbedHeight+'px',
                  'text-align':'center',
                  'position':'absolute','bottom':arg_unitPadding,
                  'background-color':'rgba(0,0,0,0.6)','color':'white'}"
                >
                  <div class="display-label-content" :style="{'width':'100%','font-size': args_lablesize,'line-height':args.unitLabelEnbedHeight+'px'}">
                    <Tooltip max-width="250" :content="item.labelValue">
                        {{ item.labelValue.length > 12 ? item.labelValue.substr(0, 12) + '...' : item.labelValue }}
                    </Tooltip>
                  </div>
                </div>
                <!-- 标签未内置 -->
                <div v-else style="text-align:center;height:30px">
                  <h3 :style="{'margin':'0 auto','font-size': args_lablesize}">{{item.labelValue}}</h3>
                </div>
              </div>
            </Card>
          </div>

          <div v-if="args.unitPageable" style="margin-top: 10px; float: right;">
            <Page
              show-sizer
              show-elevator
              show-total
              placement="top"
              :page-size-opts="args.pageSizeOpts"
              :pageSize="args.pageSize"
              :total="totalCount"
              :current="pageIndex"
              @on-change="changePage"
              @on-page-size-change="changePageSize"
            ></Page>
          </div>

          <!-- 画廊 -->
          <div v-if="isShowing" class="gallery mask" style="background:black; padding: 30px;z-index:999;">
            <div style="position: absolute;text-align: right;top: -3px;right: 1px;">
              <a
                class="unit-download"
                v-if="args.unitDownloadable"
                target="_blank"
                :href="imageObjList[cpIdx].displayValue"
                :download="imageObjList[cpIdx].tipValue"
              >
                <Icon type="ios-download" title="下载"/>
              </a>
              <a @click="isShowing = false" href="javascript:void(0)">
                <Icon type="ios-close-circle" title="关闭"/>
              </a>
            </div>
            <div class="o-sldie-container">
              <div
                class="only-slide"
                @mouseover="hoverPrevNextVisible"
                @mouseleave="hoverPrevNextHide"
              >
                <div class="o-slide-wapper">
                  <transition :name="slideAnimate" tag="div">
                    <div :key="isShowing" class="o-slide-item"
                      :style="{ backgroundRepeat: 'no-repeat',backgroundImage: 'url(' + imageObjList[cpIdx].displayValue + ')' }"
                    >
                      <div v-if="!imageObjList" class="no-pic" :style="{ lineHeight: slideViewHeight + 'px' }"
                      >暂无图片</div>
                      <span v-if="prevNextVisible && imageObjList[cpIdx].labelValue"
                      >{{imageObjList[cpIdx].labelValue}}</span>
                    </div>
                  </transition>
                </div>
                <div class="o-prev" @click="cutPage('prev');" v-if="prevNextVisible">
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCODNERjI0OTc4RTkxMUU3QjlEQkU0NDIyMTVBRTlCRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCODNERjI0QTc4RTkxMUU3QjlEQkU0NDIyMTVBRTlCRiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkI4M0RGMjQ3NzhFOTExRTdCOURCRTQ0MjIxNUFFOUJGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkI4M0RGMjQ4NzhFOTExRTdCOURCRTQ0MjIxNUFFOUJGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/fXlQgAAAZlJREFUeNrs2+GtgkAMB3DOCRjBDXQERmCEcwJXcQNwAzZgBNzEEbCXwCeDHHetaXttcnnJi3m5/y96Qulz8zxXJdepKrwMwAAMwAAMwAAMwACSyzmHuqDusCZYb1gdrHr5PU2FS+GchbyXbv6uCWOfm/vnArARfi1PBcDiDAjh4Yf/8ZKz2kMwInyoQSVAZPgnHIIvdYfgzmd+rR5rn6wOwaPhVQGkhFcDkBpeBUBOePEAueFFA2CEFwuAFV4kAGZ4cQDY4UUBUIQXA0AVXgQAZXj2ANThWQPAaqnDUwJg9AOaiPt5XzGtfzRELiBdawbYe3tfYY1cETCeC4R21U0sAuLXoI84DKdUBCkXQmQIki6FSRCk3QyhI0i8HUZFkNoQQUOQ3BJDQZDeFM1G0NAWz0LQ8mAkGUHTo7EkBG0PRw8jqBuROYqgckYoEmFUPSQViXBVOyTlnOsj+gmt2iGpSASyISlug5J+q6NM9RFwuSGwx1hhP80yORZmAwf4+48VgOTdZ/81VngZgAEYgAEYgAEYQLn1EWAAQFrgEZNBEzkAAAAASUVORK5CYII="
                    alt
                  >
                </div>
                <div class="o-next" @click="cutPage('next');" v-if="prevNextVisible">
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBMzA5Mzc1Njc4RTkxMUU3OUM5RUJCQUI2ODQ1RDNERiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBMzA5Mzc1Nzc4RTkxMUU3OUM5RUJCQUI2ODQ1RDNERiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkEzMDkzNzU0NzhFOTExRTc5QzlFQkJBQjY4NDVEM0RGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkEzMDkzNzU1NzhFOTExRTc5QzlFQkJBQjY4NDVEM0RGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+bVSsJwAAAaFJREFUeNrsmoFtwkAMRXOoAzAKHYEN2KDpBO1GMEI3aDYANmCDdoOrUwWpagWBO//K32dLlqUkSu4/InOxnXLOXcu26Bq3ABAAAkAACAABIAC0aw+oG6eUvqPsNF8lbMRP4js5Pmg+p3onO94A4dO9d/mv9doAqtaJAiC+ypettwIAmQM2V85ttd8Ei0nwbea8CQgLYBI8SBjMQwAnwaX4Ps9b7y4J/lggFIJ5AGgIFACQEGgAoCBQAUBAoAOgDYESgCYEWgBaEKgBaECgB1ALwQWAGghuAJRCcAWgBELtOhOqO3yuCZZCkPAuvpq59FH84K4qLPA+JaxvEFddSzBbFp8gHJvtC4wVZQlPM5cNGg8ylQSvlNN/29brv8DN4j3uA+4S720neLd4T98CReK9fA0Wi/dQD6gSz14RqhbPXBNUEc9aFVYTz9gXUBXP1hlSF8/UG4SIZ+kOw8SbB4AWzzwkpSKeeUiqm2YGnz0PSZ2si/+PGaE94rVnSoJjjX+cBPuYYLxY+wFhfQEWi3H5ABAAAkAACAABIAA0a18CDAB6UWSzZ1MpswAAAABJRU5ErkJggg=="
                    alt
                  >
                </div>
                <div class="pagination">{{ cpIdx + 1 }}/{{ imageObjList.length }}</div>
              </div>
              <div class="o-preview">
                <div class="o-preview-wapper">
                  <ul :style="{ left: previewLeft + 'px'}" ref="hidebox">
                    <li
                      v-for="(item, index) in imageObjList"
                      :key="index"
                      @click="clickPreview(index);"
                      :style="{ opacity: cpIdx == index ? 1 : 0.4 ,'border':cpIdx == index ?'red solid 2px':'white solid 2px'}"
                    >
                      <div
                        class="preview-img"
                        :style="{ backgroundImage: 'url(' + item.displayValue + ')' }"
                      ></div>
                    </li>
                    <li class="preview-no-pic" v-if="!imageObjList.length">暂无图片</li>
                  </ul>
                </div>
                <div class="o-preview-prev" @click="cutPreview('prev');">《</div>
                <div class="o-preview-next" @click="cutPreview('next');">》</div>
              </div>
            </div>
          </div>
        </div>
      </span>

      <span v-show="isWrong" :style="{'width': '100%', 'display': 'inline-block'}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>
    </span>
  </section>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { uuid } from '@/util/assist'
import {getEobjCount, getRobjCount} from "@/api/others";
import global from '@/views/global.vue';
import _ from "lodash";
// 设置插件英文名, 该name需要与插件文件名一致
const name = "MultiObjPicture";

export default {
  name: name,
  /*
     根据需要使用props
     一般情况下都需要itemValue,
     需要用到store时需要store
     */
  props: [
    'argsProps',
    'store',
    'itemValue',
    'formEngine',
    'dwf_ctx',
    'attributes',
    'query',
  ],
  data() {
    return {
      name: name,
      mainXAlign: '',

      // 属性配置项,按需设置
      args: {
        name: "", // 目标属性
        label: "", // 标签名称
        id: "", // 控件代号,一般为必须
        rule: "", // 验证规则
        height: 1, // 整体高度
        width: 100, // 整体宽度,单位为%或者px
        widthType: "%", // 整体宽度的单位
        label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
        label_fontType: "", // 标签字体
        label_fontSize: 14, // 标签字号
        label_fontColor: "#000000", // 标签字体颜色
        label_color: "#ffffff", // 标签背景颜色
        main_fontType: "", // 主区域字体
        main_fontSize: 14, // 主区域字号
        main_fontColor: "#000000", // 主区域字体颜色
        main_color: "initial", // 主区域背景颜色
        align: "Vertical", // 标签与主区域的排列方式
        hided: false, // 是否隐藏
        defaultValue: "", // 默认值

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        title: "样例", // 插件中文名,需要填入默认值
        basic_height: 30, // 基础高度,会从全局继承
        col: true, // 是否不占满全部
        cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
        targetDataType: null, // 目标数据类型
        events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
        eventRange: [] // 支持的事件列表,元素为事件中文名
      },


      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ["String", "UUID", "Clob"],

      // 需要设置目标属性时使用
      attrMap: {},

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,
      times: 0,

      // 一般插件的实际值用this.value存储
      value: "",

      objList: [],
      imageObjList: [],
      isShowing: false,
      slideAnimate: "",
      cpIdx: "",
      previewLeft: 0,
      currWidth: 0,
      prevNextVisible: false,
      slideViewWidth: 700,
      slideViewHeight: 300,
      clickedObj: [],
      allObj: [],
      pagedData: [],
      pagedDataStyle: [],
      totalCount: 0,
      pageIndex:1,
      queryData: {
        query: {query: "",}, // 查询条件
        targetClass: "",    // 目标类名
        formName: "",   //
        uuid: ""
      },
      rootQuery: '',
      isWrong: false,
      errorMessage: '',
      darkcss: false,
    };
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
    // 'handleQueryData',
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

    this.rootQuery = _.cloneDeep(this.query);
  },
  mounted() {
    this.$store = this.store;
    // 需要动态设置高度时使用,不用可删去
    this.setHeight();
    this.freshData();
    // this.loadData();

     if(this.args.events && this.args.events.length > 0) {
        this.objClick = this.args.events.find((val) => {
              return val.name == '单对象点击'
        })
      }
  },
  watch: {
    imageObjList: {
      handler(val, oldVal) {
        this.cpIdx = 0;
        // this.currUrl = val.displayValue;
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters("DWF_form", ["QueryResultAll", "Relations"]),

    arg_unitPadding() {
      return this.args.unitPadding + "px";
    },
    arg_unitLabelEmbedHeight() {
      return this.args.unitWidth * 0.2 + "px";
    },
    imageBackgroundSize() {
      if (this.args.selectedScalingType === 1) return "100% 100%";
      if (this.args.selectedScalingType === 2) return "contain";
      if (this.args.selectedScalingType === 3) return "";
    },
    arg_selectedScalingType() {
      if (this.args.selectedScalingType === 1) return "100%";
      if (this.args.selectedScalingType === 2) return "100%";
      if (this.args.selectedScalingType === 3) return "";
    },
    arg_unitWidthType() {
      if (this.args.unitWidthType === "percentage") return false;
      else return true;
    },
    args_lablesize(){
      return this.args.lableSize + this.args.lableSizeType + '!important';
    },
    arg_unitHeight() {
      return this.args.unitHeight + "px";
    },
    // 需要设置目标属性时使用,不用可删去
    arg_name() {
      return this.args.name;
    },
    arg_height() {
      return this.args.height * this.args.basic_height;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
    },
  },
  // 销毁函数,清除生成的内存占用
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    ...mapActions("DWF_form", ["handleQueryData", "queryRelation"]),

    async freshData(query){
      this.queryData.targetClass = this.args.bindTargetClass.split('\&')[0];
      if(!this.args.bindTargetClass) return;
      if(this.args.bindTargetClass.split('\&')[1] === 'r'){
        await this.queryRelation(this.queryData.targetClass);
        let relation = this.Relations(this.queryData.targetClass);
        this.queryData.leftClass = relation.leftClass;
        this.queryData.rightClass = relation.rightClass;
        this.queryData.relationClass = relation.className;
        this.queryData.query.type = "relation";
      }
      //fix bug 6644
      this.pageIndex = 1;
      query = query ? query : this.args.filterQuery;
      this.queryData.query.query = this.parseEscapeString(query, null, null, this.itemValue.data.origin ,this.attributes, this.$store);
      if(!this.queryData.query.query && this.rootQuery.query) this.queryData.query.query = this.rootQuery.query;
      // this.queryData.fresh = true;
      await this.entryCounts(this.queryData.query.query);
      await this.loadData();
    },

    async entryCounts(query) {
      if (!this.args.bindTargetClass) return;
      let allObjCnt;
      if (this.args.bindTargetClass.split('\&')[1] === 'r'){
        allObjCnt = await getRobjCount(this.args.bindTargetClass.split('\&')[0], {
          condition: query
        });
      } else {
        allObjCnt = await getEobjCount(this.args.bindTargetClass.split('\&')[0], {
          condition: query
        });
      }
      this.totalCount = allObjCnt.data.data;
      if(!this.args.unitPageable && this.totalCount >= 100){
        this.args.unitPageable = true;
      }
    },

    getAttrMap() {
      return [{
        className: this.args.bindTargetClass.split('\&')[0]
      }]
    },

    getSelected() {
      let index = this.pagedDataStyle.findIndex(item => item.selected === true);
      return [this.pagedData[index]];
    },

    getAll(){
      return this.allObj;
    },

    async loadData() {
      if (this.args.unitPageable) {
        this.queryData.query.startIndex = this.pageIndex ? (this.pageIndex - 1) * this.args.pageSize : 0;
        this.queryData.query.pageSize = this.args.pageSize;
        this.queryData.fresh = true;
      } else{
        // this.queryData.query.startIndex = 0;
        // this.queryData.query.pageSize = 1;
      }
      try {
        await this.handleQueryData(this.queryData);
        this.allObj = this.QueryResultAll(this.queryData) || [];
        this.generateData(this.allObj);
      } catch (e) {

      }
    },

    generateData(res) {
      this.pagedData = this.objList = [];
      this.pagedDataStyle = [];
      this.imageObjList = [];
      let attr = this.args.displayAttribute.split("|");
      // console.log("attr:", attr);
      let type = attr[1];
      attr = attr[0];
      let className;
      let relationExg = /^relation_|left_|right_/g;

      res.forEach(x => {
        let value = x[attr];
        if (type == "LocalFile") {
          let oid;
          let attributeName;
          if (this.args.bindTargetClass.split('\&')[1] === 'r') {
            switch (attr.match(relationExg)[0]) {
              case 'left_':
                className = this.queryData.leftClass;
                oid = x.left_oid;
                break;
              case 'right_':
                className = this.queryData.rightClass;
                oid = x.right_oid;
                break;
              case 'relation_':
                className = this.queryData.relationClass;
                oid = x.relation_oid;
                break;
              default:
                className = this.args.bindTargetClass.split('\&')[0];
                oid = x.oid;
                break;
            }
            attributeName = attr.replace(relationExg, '');
          } else {
            attributeName = attr;
            className = this.args.bindTargetClass.split('\&')[0];
            oid = x.oid;
          }
          value = `${global.baseObjOther}/omf/classes/${className}/objects/${oid}/attributes/${attributeName}/bytes?attachment=true&0&v=${uuid()}`;
        }
        // let da = this.args.displayAttribute.split("|")[0];
        let fileType = x[attr];
        if (fileType) {
          fileType = fileType.split(".");
          fileType = fileType[fileType.length - 1].toLowerCase();
          switch (fileType) {
            case "jpg":
            case "png":
            case "jpeg":
            case "jfif":
            case "gif":
            case "bmp":
              fileType = "image";
              break;
            case "mp4":
            case "webm":
            case "ogg":
            case "ogv":
            case "mkv":
              fileType = "video";
              break;
            case "mp3":
            case "wav":
            case "ogg":
              fileType = "audio";
              break;
            case "pdf":
            case "ppt":
            case "pptx":
            case "xlsx":
            case "doc":
            case "docx":
              fileType = "";
              // if(type !== 'LocalFile'){
              //   fileType = "docu"; //iframe自动下载问题
              // }
              break;
            default:
              fileType = "";
              break;
          }
        }
        let item = {
          ...x,
          objType: fileType,
          displayValue: value,
          labelValue: x[this.args.labelAttribute],
          tipValue: x[this.args.tipAttribute]
        };
        if (item.labelValue == null) item.labelValue = "";
        // if (fileType)
        this.objList.push(item);
        this.pagedDataStyle.push({selected: false})
        if (fileType == "image") {
          this.imageObjList.push(item);
        }
        if (this.imageObjList.length > 0) {
          this.cpIdx = 0;
        }
      });
      this.$nextTick(() => {
        this.pagedData = this.objList;
      })
    },

    changeUnitWidth() {
      if (this.args.unitWidthType === "percentage") {
        this.args.unitWidth = this.args.colWidth / (100 / this.args.unitWidth);
      }
    },
    changePage(pageId) {
      this.pageIndex = pageId;
      this.loadData();
    },
    changePageSize(pageSize) {
      this.pageIndex = 1;
      this.args.pageSize = pageSize;
      this.loadData();
    },

    // 设置异常状态显示
    setError(error, message = '') {
      this.isWrong = error;
      var dom = this.$refs.preview;
      if (dom) dom.style.border = error ? "1px solid red" : null;
      this.errorMessage = error ? message : '';
      return this;
    },

    // 设置校验逻辑,返回true/false
    // validate() {
    //   let expResult = true;

    //   if (this.args.required && this.value == null) expResult = false;
    //   else if (this.value != null && this.args.rule)
    //     expResult = new RegExp(this.args.rule).test(this.value);

    //   this.setError(expResult ? null : true);

    //   return expResult;
    // },

    // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
    getValue() {
      return this.value;
    },

    /*
            设置插件对应的值,
            items目前为对应值
            items将为目标对象列表
            特殊情况下需要进行格式转化再赋值
        */
    setValue(items) {
      var value = null;
      if (typeof items == "object") {
        if (items && items.length > 0) value = items[0][this.args.name];
      } else value = items;
      this.value = value;
      return this;
    },

    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      if (!this.$refs.main) return;
      let that = this;
      this.timer = setInterval(() => {
        if (!that.$refs.main) {
          clearInterval(that.timer);
          that.timer = null;
          return;
        }
        // 改成你需要的样式
        var dom = that.$refs.main.querySelector(".i-input .ivu-input");
        if (dom) {
          dom.style.height = that.arg_height + "px";
          clearInterval(that.timer);
          that.timer = null;
        }
        that.times += 30;
        if (that.times > 60 * 1000) {
          clearInterval(that.timer);
          that.timer = null;
        }
      }, 30);
    },

    /*
            type取值范围为 create, visit, edit
            需要根据三个状态修改具体前端和逻辑
            一般情况下:
                create创建态: 无数据,可编辑
                visit浏览态: 有数据,不可编辑
                edit编辑态: 有数据,可编辑
         */
    setDisplayType(type) {
      return this;
    },

    getFormName() {
      return this.args.name;
    },

    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("name" in args) this.args_name = this.args.name;
      if(this.args.main_color == 'initial' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')){
        this.args.main_color = 'transparent !important';
        this.darkcss = true;
      }
      if('targetClass' in args && this.args.targetClass) this.args.bindTargetClass = this.args.targetClass;
      return this;
    },

    getArgs() {
      return this.args;
    },

    getAllow() {
      return null;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },

    arg_unitWidth() {
      if (this.args.unitWidthType === "percentage") {
        return this.args.unitWidth + "%";
      } else {
        return this.args.unitWidth + "px";
      }
    },


    showGallery(event, index){
      this.cpIdx = 0;
      for(var i = 0 ;i < this.imageObjList.length; i++){
          if(this.imageObjList[i].displayValue == this.pagedData[index].displayValue){
            this.cpIdx = i;
            break;
          }
      }
      this.isShowing=true;
      event.stopPropagation();
    },

    download(event){
      event.stopPropagation();
    },

    // 画廊
    cutPage(type) {
      switch (type) {
        case "prev":
          if (this.cpIdx == 0) {
            this.cpIdx = this.imageObjList.length == 0 ? 0 : this.imageObjList.length - 1;
            this.moveablePreviewResetWidth();
          } else {
            this.cpIdx--;
          }
          this.slideAnimate = "slideright";
          break;
        case "next":
          if (this.cpIdx == this.imageObjList.length - 1) {
            this.cpIdx = 0;
            this.moveablePreviewResetWidth();
          } else {
            this.cpIdx++;
          }
          this.slideAnimate = "slideleft";
          break;
      }
    },
    cutPreview(type) {
      if (this.imageObjList.length == 0) return;
      let pvw = this.slideViewWidth - 70;
      let sw = 85;
      let hideBoxWidth;
      try {
        hideBoxWidth = this.$refs.hidebox.getBoundingClientRect().width;
      } catch (error) {
        console.log(error)
      }
      switch (type) {
        case "prev":
          if (this.previewLeft == 0) return;
          this.previewLeft += sw;
          this.currWidth += sw;
          break;
        case "next":
          if (hideBoxWidth - pvw <= 5) return;
          this.previewLeft -= sw;
          this.currWidth -= sw;
          break;
      }
    },
    clickPreview(index) {
      if (this.cpIdx == index) return;
      if (this.cpIdx < index) {
        this.slideAnimate = "slideleft";
      } else {
        this.slideAnimate = "slideright";
      }
      // this.isShowing = !this.isShowing;
      this.cpIdx = index;
    },

    // reset width
    moveablePreviewResetWidth() {
      let self = this;
      self.previewLeft = 0;
      self.$nextTick(() => {
        try {
          self.currWidth = self.$refs.hidebox.getBoundingClientRect().width;
        } catch (error) {
          console.log(error)
        }
      });
    },
    // prevNextBtn vieible
    hoverPrevNextVisible() {
      if (this.imageObjList.length == 0) return;
      this.prevNextVisible = true;
    },
    hoverPrevNextHide() {
      if (this.imageObjList.length == 0) return;
      this.prevNextVisible = false;
    },

    handleObjClick(clickedObj, index){
      console.log("clickedObj",clickedObj);
      this.pagedDataStyle.forEach((item, i) => {
        item.selected = index !== i ? false : !item.selected;
      })
      this.clickedObj = [clickedObj];
      if(this.objClick){
        this.invokeOperation(this.objClick.opr_type, this.objClick.opr_path, this.itemValue, this.store, null, clickedObj,
        null,
        {
          className: this.args.bindTargetClass.split('\&')[0],
          isRelation: this.args.bindTargetClass.split('\&')[1] === 'r',
          oidList: [this.args.id]
        });
      }
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
.wrongTips {
  display: inline-block;
  width: 100%;
  color: red;
  text-align: left;
  margin-top: 5px;
}
.mask {
  position: absolute;
  top: 0;
  /*left: 0;*/
  vertical-align: middle;
  background: rgba(101, 101, 101, 0.6);
  color: #ffffff;
  opacity: 0;
  width: 100%;
  height: 100%;
}
.gallery.mask {
  opacity: 1;
}
.img_div {
  position: relative;
}
.img_div div:hover .mask {
  opacity: 1;
}
a:link {
  color: white;
}
a:visited {
  color: white;
}
a:hover {
  color: rgb(101, 156, 201);
}
a:active {
  color: white;
}
</style>
<style scoped>
ul {
  list-style: none;
}

.clear:after {
  content: "";
  height: 0;
  display: block;
  clear: both;
}

.no-album {
  background: #f5f5f5;
  color: #969696 !important;
}

.no-pic {
  background: #eee;
  font-size: 14px;
  height: 100%;
  text-align: center;
  color: #969696;
  line-height: 100%;
  vertical-align: middle;
}

.preview-img {
  width: 100%;
  height: 100%;
  background-size: 100% auto;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: #eee;
}

.preview-no-pic {
  text-align: center;
  font-size: 14px;
  color: #969696;
  background: #eee;
}

.o-slide-item {
  position: relative;
  width: 100%;
  height: 100%;
}
.o-slide-item {
  background-size: auto 100%;
  background-repeat: no-repeat no-repeat;
}

.o-sldie-container {
  margin-bottom: 100px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  /* background: white; */
}

.only-slide {
  position: relative;
  width: 100%;
  height: 80%;
  overflow: hidden;
}

.o-slide-wapper {
  width: auto;
  height: 100%;
  white-space: nowrap;
}

.o-slide-item {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  vertical-align: top;
  background-size: 100% auto;
  background-position: center center;
  background-repeat: no-repeat;
}
.o-slide-item span {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: inline-block;
  padding: 3px 10px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border-radius: 3px;
  max-width: 50%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.o-prev,
.o-next {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  width: 55px;
  height: 55px;
  font-size: 20px;
  line-height: 55px;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.4);
  text-align: center;
  border-radius: 50%;
  transition: all 0.2s;
}
.o-prev img,
.o-next img {
  vertical-align: middle;
  display: inline-block;
  width: 32px;
  height: 32px;
}

.o-prev {
  left: 10px;
}

.o-next {
  right: 10px;
}

.pagination {
  position: absolute;
  right: 6px;
  bottom: 6px;
  font-size: 12px;
  color: #fff;
  text-shadow: 0 0 7px rgba(0, 0, 0, 0.9);
}

.o-preview {
  margin-top: 15px;
  width: 100%;
  height: 60px;
  padding: 0 35px;
  line-height: 60px;
  position: relative;
  box-sizing: border-box;
}
.o-preview-wapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.o-preview-wapper ul {
  position: absolute;
  top: 0;
  left: 0;
  width: auto;
  height: 100%;
  padding: 0;
  margin: 0;
  white-space: nowrap;
  text-align: left;
  transition: all 0.3s;
}
.o-preview-wapper ul li {
  vertical-align: top;
  display: inline-block;
  width: 80px;
  height: 100%;
  margin-right: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.o-preview-wapper ul li:hover {
  opacity: 1 !important;
}
.o-preview-wapper ul li img {
  width: 100%;
  height: 100%;
}
.o-preview-prev,
.o-preview-next {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  width: 35px;
  height: 100%;
  font-size: 28px;
  line-height: 60px;
  /* color: #454545; */
  color:white;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s;
}
.o-preview-prev:hover,
.o-preview-next:hover {
  opacity: 1;
}

.o-preview-prev {
  left: 0;
  text-align: left;
}

.o-preview-next {
  right: 0;
  text-align: right;
}

.slideleft-enter-active {
  animation: slideLeftEnter 0.5s;
}

.slideleft-leave-active {
  animation: slideLeftLeave 0.5s;
}
.o-preview-close {
  position: absolute;
  top: 10px;
  right: 10px;
}

@keyframes slideLeftEnter {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideLeftLeave {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.slideright-enter-active {
  animation: slideRightEnter 0.5s;
}

.slideright-leave-active {
  animation: slideRightLeave 0.5s;
}

@keyframes slideRightEnter {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideRightLeave {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
<style>
.display-label-content .ivu-tooltip {
  font-size: inherit;
}
.display-label-content .ivu-tooltip .ivu-tooltip-rel{
  font-size: inherit;
}
.multi-object-preview .ivu-card-body {
  padding: 0px !important;
}
.multi-object-preview .mask .ivu-icon {
  padding: 5px 10px;
  font-size: 30px !important;
}
.self-card.selected{
  border: 1px solid #1C304D!important;
}
.darkcss.self-card.selected{
  border: 1px solid #dcdee2!important;
}
</style>
