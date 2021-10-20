<template>
  <section :addinName="name" id="inputDiv" ref="main" :style="{'width': colWidth,'min-height': arg_height}">
    <span v-if="args.required || args.label" v-show="!args.hided" :style="{'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color}">
        <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
    </span>
    <span v-show="!args.hided" :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor, 'overflow-y': 'scroll'}">
      <div :id="mapId"
           ref="map"
           class="BMapContainer"
           :style="{'height': arg_map_height, 'width': '100%'}">
      </div>
    </span>
    <span v-show="isWrong && !args.hided" :style="{'width': '100%', 'display': 'inline-block'}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>

    <div style="display: none;" id="hoverTipsWrapper">
      <div
        v-if="popHoverPath != ''"
        :id="`hoverTips${item}`"
        trigger="hover"
        :placement="popFocusDirection"
        v-for="item in tipsCount"
        style="width: 730px">
        <div v-show="popHoverObj.needPopTitle" slot="title"><span
          :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span>
        </div>
        <FormEngine
          ref="form"
          :to_path="popHoverPath"
          :to_query="popHoverQuery"
          :store="store">
        </FormEngine>
      </div>
    </div>

    <div style="display: none" id="focusTipsWrapper">
      <div
        v-if="popFocusPath != ''"
        :id="`focusTips${item}`"
        trigger="focus"
        v-for="item in tipsCount"
        :placement="popFocusDirection" :width="popFocusObj.popWidth">
        <div v-show="popFocusObj.needPopTitle" slot="title"><span :style="{'color': popFocusObj.popTitleColor, 'font-size': `${popFocusObj.popTitleFs}px`}">{{ popFocusObj.popTitleTxt }}</span></div>
        <div slot="content">
          <FormEngine
            ref="form"
            :to_path="popFocusPath"
            :to_query="popFocusQuery"
            :store="store">
          </FormEngine>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from "vuex";
  import "@/styles/component/iconfont.css";
  import _global from '@/views/global.vue'
  import { getEobj, getQueryOperation } from '@/api/others';
  import { addListener, removeListener, getSockId} from "@/util/webSocket";
  import MarkerClusterer from "@/util/MarkerClusterer";
  import { postSub, deleteSub } from '@/api/others';
  import { uuid } from '@/util/assist'
  import FormEngine from '@/views/form-engine/forms-engine.vue'

  const name = "DynamicMap";
  export default {
    beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
      if (this.wsId) {
        removeListener(this.wsCommand, this.wsId);
      }
    },
    name: name,
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
        wsCommand:  '',
        wsId: '',
        subId: '',
        oids: [],
        times: 0,
        name: name,
        isRelation: false,
        t_preview: true,
        t_edit: false,
        baseUrl: '',
        isWrong: false,
        errorMessage: '',
        //tips浮窗配置
        //利用数组复制组件
        tipsCount: [1],
        hoverAction: '',
        focusAction: '',
        needPop: false,
        hoverPop: false,
        popHoverObj: {
          needPopTitle: false,
          popTitleTxt: '提示',
          popTitleFs: 14,
          popTitleColor: '#333',
          tipPlacement: 'right',
          popWidth: 400
        },
        popFocusObj: {
          needPopTitle: false,
          popTitleTxt: '提示',
          popTitleFs: 14,
          popTitleColor: '#333',
          tipPlacement: 'right',
          popWidth: 400
        },
        popHoverDirection: 'right',
        popFocusDirection: 'right',
        pWidth: 0,
        popHoverPath: '',
        popHoverQuery: {
          query: ''
        },
        popFocusPath: '',
        popFocusQuery: {
          query: ''
        },
        actions: {
          '上边': 'top',
          '上左': 'top-start',
          '上右': 'top-end',
          '右边': 'right',
          '右上': 'right-start',
          '右下': 'right-end',
          '下边': 'bottom',
          '下左': 'bottom-start',
          '下右': 'bottom-end',
          '左边': 'left',
          '左上': 'left-start',
          '左下': 'left-end',
        },
        // 属性配置项,按需设置
        args: {
          id: "", // 控件代号,一般为必须
          // name: '',
          dynamic: true,
          height: 500, // 整体高度
          map_height: 490,
          heightType: "px",
          map_heightType: "px",
          iconheightType: 'px',
          iconwidthType: "px",
          label: '',
          hided: false,
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

          imgSource: 'imgSelf',
          back_color: "#fff",             // 背景颜色
          pointIcon: "",           // 背景图片,超链接
          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,
          // 以下为不在属性编辑框中设置,但默认要有的配置项
          title: "动态地图", // 插件中文名,需要填入默认值
          col: false, // 是否不占满全部
          cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null, // 目标数据类型
          events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: ["鼠标悬停", "获得焦点"],
          lnglatMapType: '单独映射',

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
            mapRefresh: false
          },
          point: {},

          iconLabel: '',
          iconArr: [],
          iconObj: {},
        },
        eventFocus: false,
        eventHover: true,
        attrMap: {},
        // 需要动态设置高度时使用
        timer: null,
        mapId: `mapId_${uuid()}`,
        //renderMapData渲染地图用数据,存放地图相关类
        renderMapData: {
          renderIcon: [],
          renderMarker: [],
          renderLabel: [],
        },
        form: {
          modal: false,
          modalTitle: '',
          modalPath: '',
          modalQuery: '',
          onText: '',
        },
        longitudeExp : /^[\-\+]?(0(\.\d{1,10})?|([1-9](\d)?)(\.\d{1,10})?|1[0-7]\d{1}(\.\d{1,10})?|180\.0{1,10})$/,
        latitudeExp : /^[\-\+]?((0|([1-8]\d?))(\.\d{1,10})?|90(\.0{1,10})?)$/,
        lnglatExp : /^[\-\+]?(0(\.\d{1,10})?|([1-9](\d)?)(\.\d{1,10})?|1[0-7]\d{1}(\.\d{1,10})?|180\.0{1,10}),{1}[\-\+]?((0|([1-8]\d?))(\.\d{1,10})?|90(\.0{1,10})?)$/,
        oprMap: {

        },
        queryData: {
          query: {query: "",}, // 查询条件
          targetClass: "",    // 目标类名
          formName: "",   //
          uuid: ""
        },
        metaMapData: null,
        selectedObj: null,
        classAttrMap: {},
        classMap: {},
        rootQuery: '',
        dynamicOids: null,
      };
    },
    components: {
      FormEngine
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

      this.$store = this.store;
      this.rootQuery = _.cloneDeep(this.query);
      this.baseUrl = _global.baseUrl;
    },
    beforeMount(){
      this.eventFocus = this.args.events.find((val) => {
        return val.name == '获得焦点'
      });

      this.eventHover = this.args.events.find((val) => {
        return val.name == '鼠标悬停'
      });

      if(this.eventHover != null && this.eventHover.opr_path != undefined && this.eventHover.opr_path != '') {
        getQueryOperation(this.eventHover.opr_path).then(response => {
          let res = response.data;
          if(res.success && res.data) {
             this.hoverAction = res.data.conType;
          } else {
            console.log(res.message);
          }
        }).catch(e => {
          console.log(e);
        });
      }

      if(this.eventFocus != null && this.eventFocus.opr_path != undefined && this.eventFocus.opr_path != '') {
        getQueryOperation(this.eventFocus.opr_path).then(response => {
          let res = response.data;
          if(res.success && res.data) {
            this.focusAction = res.data.conType;
          } else {
            console.log(res.message);
          }
        }).catch(e => {
          console.log(e);
        });
      }
    },
    // 生命周期函数，在dom元素生成之后调用
    async mounted() {
      this.$nextTick(async () => {
        this.map = new BMap.Map(this.mapId);
        this.map.enableScrollWheelZoom();
        this.setHeight();
        this.map.centerAndZoom('北京', 5);
        await this.freshData(this.args.filterQuery);
        this.createSocketLink();
        // if(this.args.dynamic){
        //   this.createSub(this.oids, this.args.bindTargetClass.split('\&')[0]);
        //   this.wsCommand = "objects command " + this.args.bindTargetClass.split('\&')[0];
        //   this.wsId = addListener(this.wsCommand, (data) => {
        //     this.reFreshMap(data.data);
        //   });
        // }
        // this.point = new BMap.Point(116.404, 39.915);
        this.map.centerAndZoom('北京', 5);
        setTimeout(() => {
          this.map.reset();
        }, 10)
      });
    },
    computed: {
      ...mapGetters("DWF_form", ["QueryResultAll", "Relations"]),
      arg_bgPic() {
        let finalBg = '';
        if(this.args.imgSource == 'imgSelf') {
          finalBg = this.args.pointIcon
        } else {
          finalBg = this.args.pointIcon == '' ? this.args.pointIcon : `${this.baseUrl}/files-download/${this.args.pointIcon}`;
        }
        return finalBg;
      },
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + ' !important';
      },

      // 需要设置目标属性时使用,不用可删去
      arg_name() {
        return this.args.name;
      },
      arg_height() {
        return this.args.height < 2 ? this.args.height * 500 + "px" : this.args.height + this.args.heightType;
      },
      arg_map_height(){
        return this.args.map_height < 2 ? this.args.map_height * 500 + "px" : this.args.map_height + this.args.map_heightType;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
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
    },
    watch: {
    },
    methods: {
      ...mapActions("DWF_form", ["handleQueryData", "queryRelation"]),
      ...mapMutations("DWF_form", ["addEntityObj", "addRelationChild"]),
      async freshData(query, fresh = false){
        if(!this.args.bindTargetClass) return;
        this.queryData.targetClass = this.args.bindTargetClass.split('\&')[0];
        this.isRelation = this.args.bindTargetClass.split('\&')[1] === 'r';
        if(this.args.bindTargetClass.split('\&')[1] === 'r'){
          await this.queryRelation(this.queryData.targetClass);
          let relation = this.Relations(this.queryData.targetClass);
          this.queryData.leftClass = relation.leftClass;
          this.queryData.rightClass = relation.rightClass;
          this.queryData.relationClass = relation.className;
          this.queryData.query.type = "relation";
        }
        this.queryData.query.query = this.parseEscapeString(query, null, null, this.itemValue.data.origin ,this.attributes, this.$store);
        if(!this.queryData.query.query && this.rootQuery.query) this.queryData.query.query = this.rootQuery.query;
        // this.queryData.query.startIndex = 0;
        // this.queryData.query.pageSize = 100;
        this.queryData.fresh = fresh;
        await this.handleQueryData(this.queryData);
        this.metaMapData = this.QueryResultAll(this.queryData);
        this.args.map.data = this.metaMapData;
        if (this.args.map.data || (this.args.map.data && this.args.map.data.length != 0)) {
          this.assemblyMapData();
        }
      },
      getAll(){
        return this.metaMapData;
      },

      getAttrMap() {
        return [{
          className: this.args.bindTargetClass.split('\&')[0]
        }]
      },

      getSelected(){
        return [this.selectedObj];
      },
      //装配数据
      assemblyMapData(){
        this.assemblyLngLat();
        this.renderMap();
        // this.demoRender();
      },
      demoRender(){
        let length = 2000;
        let lng =[];
        let lat = [];
        let i = 0, j = 0;
        let labelContent;
        let label;
        while (i < length){
          lng.push(parseInt(116000000 + Math.random() * 1000000)/1000000);
          lat.push(parseInt(39000000 + Math.random() * 1000000)/1000000);
          i++;
        }
        let marker;
        let markers = [];
        while (j < length){
          marker = new BMap.Marker(new BMap.Point(lng[j], lat[j]), {
            icon: new BMap.Icon('http://lbsyun.baidu.com/jsdemo/img/car.png', new BMap.Size(52, 26))
          });
          // this.map.addOverlay(marker);
          markers.push(marker);
          j++;
          labelContent = `<i class="ivu-icon ivu-icon-md-analytics">`;
          label = new BMap.Label(labelContent, {
            position: new BMap.Point(lng[j], lat[j])
          });
          // label.setStyle({
          //   border: "none",
          //   backgroundColor:"rgba(0,0,0,0)"
          // });

          this.map.addOverlay(label);
        }
        // new MarkerClusterer(this.map, {
        //   markers: markers
        // })
      },
      assemblyLngLat(){
        //缓存数据
        let map = this.args.map;
        let iconObj = this.args.iconObj;
        let label;
        let labelContent;
        this.renderMapData.renderMarker = [];
        this.renderMapData.renderLabel = [];
        this.oids = [];
        if(this.args.bindTargetClass.split('\&')[1] !== 'r'){
          this.dynamicOids = map.data.map(point => point.oid);
        }else{
          this.dynamicOids = {};
          this.dynamicOids[this.queryData.leftClass] = map.data.map(point => point.relation_leftOid);
          this.dynamicOids[this.queryData.rightClass] = map.data.map(point => point.relation_rightOid);
          this.dynamicOids[this.queryData.relationClass] = map.data.map(point => point.relation_oid);
        }
        //分别对应对象的属性
        let iconType = map.icon.type;
        let iconAttribute = map.icon.attribute;
        for(let [index, value] of map.data.entries()){
          switch (this.args.lnglatMapType) {
            case "单独映射":
              let longitudeType = map.longitude.type;
              let latitudeType = map.latitude.type;
              if(this.longitudeExp.test(value[longitudeType]) && this.latitudeExp.test(value[latitudeType])){
                this.oids = [
                  ...this.oids,
                  value.oid || value.relation_oid
                ];
                map.longitude.data = [...map.longitude.data, value[longitudeType]];
                map.latitude.data = [...map.latitude.data, value[latitudeType]];
                map.point = [...map.point, new BMap.Point(value[longitudeType], value[latitudeType])];
                //初始化图片图标marker
                this.renderMapData.renderMarker = [
                  ...this.renderMapData.renderMarker,
                  new BMap.Marker(new BMap.Point(value[longitudeType], value[latitudeType]), {
                    icon: new BMap.Icon(value[iconType] || this.arg_bgPic || 'http://lbsyun.baidu.com/jsdemo/img/car.png', new BMap.Size(map.icon.icon_width, map.icon.icon_height))
                  })
                ];
                //初始化标签图标label
                if(iconObj[value[iconAttribute]] && iconObj[value[iconAttribute]].indexOf('icon-') === -1) {
                  labelContent = `<i class="ivu-icon ivu-icon-${iconObj[value[iconAttribute]]}">`;
                }else if(iconObj[value[iconAttribute]] && iconObj[value[iconAttribute]].indexOf('icon-') !== -1){
                  labelContent = `<i class="iconfont ${iconObj[value[iconAttribute]]}">`;
                }else{
                  labelContent = ``;
                }
                label = new BMap.Label(labelContent, {
                  position: new BMap.Point(value[longitudeType], value[latitudeType])
                });
                label.setStyle({
                  border: "none",
                  backgroundColor:"rgba(0,0,0,0)"
                });
                this.renderMapData.renderLabel = [
                  ...this.renderMapData.renderLabel,
                  label
                ]
              }
              break;
            case '字符串映射':
              let lnglatType = map.lnglat.type;
              if(this.lnglatExp.test(value[lnglatType])){
                this.oids = [
                  ...this.oids,
                  value.oid || value.relation_oid
                ];
                let longitude = value[lnglatType].split(',')[0];
                let latitude = value[lnglatType].split(',')[1];
                map.longitude.data = [...map.longitude.data, longitude];
                map.latitude.data = [...map.latitude.data, latitude];
                map.point = [...map.point, new BMap.Point(longitude, latitude)];
                //初始化图片图标marker
                this.renderMapData.renderMarker = [
                  ...this.renderMapData.renderMarker,
                  new BMap.Marker(new BMap.Point(longitude, latitude), {
                    icon: new BMap.Icon(value[iconType] || this.arg_bgPic || 'http://lbsyun.baidu.com/jsdemo/img/car.png', new BMap.Size(map.icon.icon_width, map.icon.icon_height))
                  })
                ];
                //初始化标签图标label
                if(iconObj[value[iconAttribute]] && iconObj[value[iconAttribute]].indexOf('icon-') === -1) {
                  labelContent = `<i class="ivu-icon ivu-icon-${iconObj[value[iconAttribute]]}">`;
                }else if(iconObj[value[iconAttribute]] && iconObj[value[iconAttribute]].indexOf('icon-') !== -1){
                  labelContent = `<i class="iconfont ${iconObj[value[iconAttribute]]}">`;
                }else{
                  labelContent = ``;
                }
                label = new BMap.Label(labelContent, {
                  position: new BMap.Point(longitude, latitude)
                });
                label.setStyle({
                  border: "none",
                  backgroundColor:"rgba(0,0,0,0)"
                });
                this.renderMapData.renderLabel = [
                  ...this.renderMapData.renderLabel,
                  label
                ]
              }
              break;
          }

        }
      },
      renderMap(){
        //自定义覆盖物
        this.map.clearOverlays();
        for(let [index, value] of this.renderMapData.renderMarker.entries()){
            if(this.isRelation){
              value.addEventListener('click', () => {this.handleClick(this.args.map.data.filter(item => item.relation_oid === this.oids[index])[0], this.args.map.point[index])});
            }else{
              value.addEventListener('click', () => {this.handleClick(this.args.map.data.filter(item => item.oid === this.oids[index])[0], this.args.map.point[index])});
            }
          if(this.eventHover){
            if(this.isRelation){
              value.addEventListener('mouseover', () => {this.handleHover(this.args.map.data.filter(item => item.relation_oid === this.oids[index])[0], this.args.map.point[index])})
            }else{
              value.addEventListener('mouseover', () => {this.handleHover(this.args.map.data.filter(item => item.oid === this.oids[index])[0], this.args.map.point[index])})
            }
          }
          //判断点数是否进行聚合打点
          if(!(this.args.map.data.length > 500)){
            this.map.addOverlay(value);
          }
        }
        if(this.args.map.data.length > 500){
          new MarkerClusterer(this.map, {
            markers: this.renderMapData.renderMarker
          })
        }
        //自定义label
        for(let [index, value] of this.renderMapData.renderLabel.entries()){
          // if(this.eventFocus){
          //   value.addEventListener('click', () => {this.handleClick(this.args.map.data[index])})
          // }
          // if(this.eventHover){
          //   value.addEventListener('mouseover', () => {this.handleHover(this.args.map.data[index])})
          // }
          this.map.addOverlay(value);
        }
      },
      /**
       * 建立双向通讯监听
       *
       */
      createSocketLink(){
        this.targetClass = this.args.bindTargetClass.split('\&')[0];
        if(this.args.dynamic){
          if(this.args.bindTargetClass.split('\&')[1] !== 'r'){
            this.createSub(this.dynamicOids, this.targetClass);
            this.wsCommand = "objects command " + this.targetClass;
            this.wsId = addListener(this.wsCommand, async (data) => {
              this.freshData('', true);
            })
          }else{
            this.wsId = {};
            this.wsCommand = {};
            this.wsData = {};
            this.createSubRelation(this.dynamicOids);
            Object.keys(this.dynamicOids).forEach((item, index) => {
              this.wsCommand[item] = "objects command " + item;
              this.wsId[item] = addListener(this.wsCommand[item], async (data) => {
                let that = this;
                if (this.dynamicTimer != null) {
                  clearTimeout(this.dynamicTimer);
                  this.dynamicTimer = null;
                  this.dynamicTimer = setTimeout(() => {
                    that.freshData('', true);
                    clearTimeout(that.dynamicTimer);
                    that.dynamicTimer = null;
                  }, 500)
                } else {
                  this.dynamicTimer = setTimeout(() => {
                    that.freshData('', true);
                    clearTimeout(that.dynamicTimer);
                    that.dynamicTimer = null;
                  }, 500)
                }
              })
            });
          }
        }

        //阻止分页enter提交表单
        setTimeout(() => {
          document.querySelector('.ivu-page .ivu-page-options-elevator input').addEventListener('keydown', (e) => {
            let key =  e.which || e.keyCode
            if(key == 13){
              e.stopPropagation();
              e.preventDefault();
            }
          })
        }, 1000)
      },
      createSub(oids, targetClass) {
        if (this.subId) {
          deleteSub([this.subId]);
          this.subId = null;
        }
        let sockId = getSockId();
        if (sockId) {
          this.subId = uuid();
          postSub([
            {
              className: targetClass,
              eventType: "OBJ_UPDATE",
              oids,
              subscribers: [{
                subScriberType: "SPECIFIC_CONNECTION",
                connectId: getSockId(),
              }],
              subscriptionId: this.subId
            }
          ]);
        }
      },
      /**
       * 关联类建立双向通讯
       * 分别建立左类右类关联类本身的socket链接
       */
      createSubRelation(data) {
        if (this.subIds) {
          deleteSub([...this.subIds]);
          this.subId = null;
          this.subIds = [];
        }
        this.subIds = [];
        Object.keys(data).forEach((item, index) => {
          let sockId = getSockId();
          if (sockId) {
            this.subId = uuid();
            this.subIds.push(this.subId);
            postSub([
              {
                className: item,
                eventType: "OBJ_UPDATE",
                oids: data[item],
                subscribers: [{
                  subScriberType: "SPECIFIC_CONNECTION",
                  connectId: getSockId(),
                }],
                subscriptionId: this.subId
              }
            ]);
          }
        });
      },

      destroySub() {
        if (this.subId) {
          deleteSub([this.subId]);
          this.subId = null;
        }
      },

      reFreshMap(data) {
        //缓存经纬度属性
        let map = this.args.map;
        //TODO: 默认当前websocket返回一条数据
        let metaIndex = map.data.findIndex((item, index) => {
          if(this.isRelation){
            return item.relation_oid === data.relation_oid
          }else{
            return item.oid === data.oid
          }
        });
        let oidIndex = this.oids.findIndex((item, index) => {
          if(this.isRelation){
            return item === data.relation_oid
          }else{
            return item === data.oid
          }
        });

        switch (this.args.lnglatMapType) {
          case "单独映射":
            let longitudeType = map.longitude.type;
            let latitudeType = map.latitude.type;
            let newLongitude = data[longitudeType];
            let newLatitude = data[latitudeType];
            //获取更改数据
            map.data[metaIndex] = data;
            if(oidIndex !== -1){
              map.longitude.data[oidIndex] = newLongitude;
              map.latitude.data[oidIndex] = newLatitude;
              let point = new BMap.Point(newLongitude, newLatitude);
              map.point[oidIndex] = point;
              this.renderMapData.renderMarker[oidIndex].setPosition(point);
              this.renderMapData.renderLabel[oidIndex].setPosition(point);
            }
            break;
          case '字符串映射':
            let lnglatType = map.lnglat.type;
            let newLngLat = data[lnglatType];
            map.data[metaIndex] = data;
            if(oidIndex !== -1){
              newLongitude = newLngLat.split(',')[0];
              newLatitude = newLngLat.split(',')[1];
              map.longitude.data[oidIndex] = newLongitude;
              map.latitude.data[oidIndex] = newLatitude;
              let point = new BMap.Point(newLongitude, newLatitude);
              map.point[oidIndex] = point;
              this.renderMapData.renderMarker[oidIndex].setPosition(point);
              this.renderMapData.renderLabel[oidIndex].setPosition(point);
            }
            break;
        }

        //TODO: 返回多条数据或者更改除经纬度以外属性
      },
      //处理点击
      handleClick(target, point){
        this.selectedObj = _.cloneDeep(target);
        if(!this.eventFocus) return;
        if(this.focusAction == 'tip'){
          this.popFocusPath = '';
          getQueryOperation.call(this, this.eventFocus.opr_path).then(response => {
            let res = response.data;
            if(res.success && res.data) {
              let oName = res.data.conType;
              this.FocusAction = oName;
              if(oName == 'tip') {
                if(this.tipsCount.length == 1){
                  this.tipsCount.push(2);
                }
                this.popFocusObj = JSON.parse(res.data.viewType);
                this.popFocusDirection = this.actions[this.popFocusObj.tipPlacement];
                this.needPop = true;
                this.focusPop = true;
                if(this.isRelation){
                  this.popFocusQuery.query = `and relationclass.plt_oid='${target.relation_oid}'`;
                }else{
                  this.popFocusQuery.query = `and plt_oid='${target.oid}'`;
                }
                // this.popFocusQuery = {
                //   query: '',
                //   obj: target
                // };
                this.popFocusPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
                this.$nextTick(() => {
                  let formDOM = document.getElementById('focusTips2');
                  if(formDOM) {
                    let info = new BMap.InfoWindow(formDOM, {
                      width: 730,
                      height: 1500,
                    });
                    this.map.openInfoWindow(info, point);
                    setTimeout(() => {
                      if(document.getElementsByClassName('BMap_bubble_title') && document.getElementsByClassName('BMap_bubble_title').length !==0){
                        for(let i = 0; i < document.getElementsByClassName('BMap_bubble_title').length; i++){
                          document.getElementsByClassName('BMap_bubble_title')[i].parentNode.classList.add('scroll')
                        }
                      }
                    }, 3000)
                  }
                });
              } else {
                this.needPop = false;
              }
            } else {
            }
          });
        }else{
          this.invokeOperation(this.eventFocus.opr_type, this.eventFocus.opr_path, this.itemValue, this.store, null, target, null,
            {
              className: this.queryData.targetClass,
              isRelation: this.isRelation,
              oidList: [this.args.id]
            });
        }
      },
      //处理悬浮
      //infoWindow关闭时会将组件删掉导致没法二次初始化，所以用数组复制出一个进行操作
      handleHover(target, point){
        this.selectedObj = _.cloneDeep(target);
        if(this.hoverAction == 'tip'){
          this.popHoverPath = '';
          getQueryOperation.call(this, this.eventHover.opr_path).then(response => {
            let res = response.data;
            if(res.success && res.data) {
              let oName = res.data.conType;
              this.hoverAction = oName;
              if(oName == 'tip') {
                if(this.tipsCount.length == 1){
                  this.tipsCount.push(2);
                }
                this.popHoverObj = JSON.parse(res.data.viewType);
                this.popHoverDirection = this.actions[this.popHoverObj.tipPlacement];
                this.needPop = true;
                this.hoverPop = true;
                if(this.isRelation){
                  this.popHoverQuery.query = `and relationclass.plt_oid='${target.relation_oid}'`;
                }else{
                  this.popHoverQuery.query = `and plt_oid='${target.oid}'`;
                }
                // this.popHoverQuery = {
                //   query: '',
                //   obj: target
                // };
                this.popHoverPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
                // this.$nextTick(() => {
                //   let info = new BMap.InfoWindow(document.getElementById('focusTips2'), {
                //     width: 730,
                //     height: 0,
                //   });
                //   setTimeout(() => {
                //     this.map.openInfoWindow(info,point);
                //   },500)
                // });
                let time = new Date().getTime();
                let timer = setInterval(() => {
                  let formDOM = document.getElementById('hoverTips2');
                  if(formDOM){
                    let info = new BMap.InfoWindow(formDOM, {
                      width: 730,
                      height: 1500,
                    });
                    this.map.openInfoWindow(info,point);
                    setTimeout(() => {
                      if(document.getElementsByClassName('BMap_bubble_title') && document.getElementsByClassName('BMap_bubble_title').length !==0){
                        for(let i = 0; i < document.getElementsByClassName('BMap_bubble_title').length; i++){
                          document.getElementsByClassName('BMap_bubble_title')[i].parentNode.classList.add('scroll')
                        }
                      }
                    }, 3000)
                    clearInterval(timer)
                  }else{
                    time + 10000 < new Date().getTime() ? clearInterval(timer) : '';
                  }
                }, 100);
              } else {
                this.needPop = false;
              }
            } else {
            }
          });
        }else{
          this.invokeOperation(this.eventHover.opr_type, this.eventHover.opr_path, this.itemValue, this.store, null, target, null,
            {
              className: this.queryData.targetClass,
              isRelation: this.isRelation,
              oidList: [this.args.id]
            });
        }
      },

      // 设置异常状态显示
      setError(error, message = '') {
        this.isWrong = error;
        var dom = this.$refs.map;
        if (dom) dom.style.border = error ? "1px solid red" : null;
        this.errorMessage = error ? message : '';
        return this;
      },

      // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
      getValue() {

      },

      /*
          设置插件对应的值,
          items目前为对应值
          items将为目标对象列表
          特殊情况下需要进行格式转化再赋值
      */
      setValue(items) {
        var value = null;
        if (items == null) {
          // 初始化操作
          value = "defaultValue" in this.args ? this.args.defaultValue : null;
        } else if (typeof items == "object") {
          if (items && items.length > 0) value = items[0][this.args.name];
        } else value = items;
        return this;
      },

      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        if (!this.$refs.main) return;
        let that = this;
        if (this.timer == null) {
          this.timer = setInterval(() => {
            if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
            // 改成你需要的样式
            var dom = that.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) {
              dom.style.height = that.arg_height + "px";
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

      /*
          type取值范围为 create, visit, edit
          需要根据三个状态修改具体前端和逻辑
          一般情况下:
              create创建态: 无数据,可编辑
              visit浏览态: 有数据,不可编辑
              edit编辑态: 有数据,可编辑
       */
      setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
          this.t_create = true;
        }
        else if (type == "edit") {
          this.t_edit = true;
        }
        else if (type == "visit") {
          this.t_visit = true;
        }
        return this;
      },

      getFormName() {
        return this.args.name;
      },


      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }

        return this;
      },
      getArgs() {
        return this.args;
      },

      getAllow() {
        return null;
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
  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }
</style>
<style>
  .BMap_bubble_content{
    overflow: auto;
  }
  .BMap_pop .scroll{
    overflow: scroll!important;
  }
</style>
