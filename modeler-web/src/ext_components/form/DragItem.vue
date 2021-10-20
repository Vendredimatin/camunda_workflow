<template>
  <!-- 输入框 -->
  <section
    v-if="t_preview"
    v-show="!doDestroy"
    class="addin-dragItem vue-drag-item"
    :addinName="name"
    ref="main"
    style="height: 100%;"
    :style="itemContainerStyle"
    dropTarget="dragItem"
  >
    <div v-if="args.showTitle" class="item-header">
      <!-- {{item.x+","}}{{item.y}} -->
      <h2 class="item-header-text vue-drag-item" style="font-size: 1.5em; line-height: 2;" :style="itemTitleStyle">
        {{ args.dragTitle }}</h2>
      <div class="item-btns">
        <!--
        <a class="item-opr-btn"></a>
        <a class="item-opr-btn" style="background: #ffc241;"></a>
        -->
        <!--        <a class="" style="" href="javascript:void(0)" @click="deleteItem">-->
        <!--          <Icon type="ios-close" title="关闭"/>-->
        <!--        </a>-->
      </div>
    </div>
    <div class="drag-item-container item-container no-padding" addin="layout">
      <draggable
        class='dragArea dragItem-dragArea vue-drag-item'
        draggable=".vue-draggable-addin"
        ref="container"
        group='addin'
        :list="formAddinList"
        ghost-class="vue-draggable-ghost"
        @change='jsonDataChange'
      >
        <FormAddinList
          v-for="addin in addin.elements"
          :key="addin.self.uuid"
          :addin="addin"
          v-bind="addinProps"
          :ref="`FormAddinList${addin.self.uuid}`"
          @activeAddin="activeAddin"
          @copyAddin="copyAddin"
          @removeAddin="removeAddin"
          @deleteAddin="deleteAddin"
          @commentAddin="commentAddin"
          @layoutSelfDrag="() => { $emit('layoutSelfDrag') }"
        >

        </FormAddinList>
      </draggable>
    </div>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <!-- <h1 style="font-size: 14px;">拖拽块</h1>
      <hr/> -->
      <EditBox v-if="actEdit" :addinName="name"
        :widgetAnnotation="widgetAnnotation"
        :editExtendInfo="editExtendInfo"
        ref="editbox"
        v-model="args"
        :router="router"
        :route="route"
        :root="root"
        :query_oprs="query_oprs"
        :targetclass="itemValue.data.targetclass">
        <div slot="attribute">
          <Row class="margin1">
              <Col span="12" class="margin1">
                <Checkbox v-model="args.isResizable" @on-change="itemConfigChange">可伸缩</Checkbox>
              </Col>
              <Col span="12" class="margin1">
                <Checkbox v-model="args.static" @on-change="itemConfigChange">冻结</Checkbox>
              </Col>
              <Col span="12" class="margin1">
                <Checkbox v-model="args.showTitle">带标题</Checkbox>
              </Col>
              <Col span="12" class="margin1">
                <Checkbox v-model="args.isResponsive" @on-change="isResponsiveChange" >适应内容</Checkbox>
              </Col>
              <Col span="24" v-if="args.showTitle">
                <p class="margin1">标题内容</p>
                <Input v-model="args.dragTitle"/>
              </Col>
          </Row>
        </div>
        <div slot="layout">
          <Row class="margin1" v-if="refreshDOM">
              <Col span="24">
                <p class="margin1">标题文本大小</p>
                <Input class="margin1" v-model="args.titleFontSize" type="number">
                  <Select v-model="args.titleFontSizeType" slot="append" style="width: 70px;">
                      <Option value="px">px</Option>
                      <Option value="rem">rem</Option>
                  </Select>
                </Input>
              </Col>
              <Col span="24">
                <p class="margin1">标题字体颜色</p>
                <ColorPicker v-model="args.titleFontColor"/>
              </Col>
              <Col span="24">
                <p class="margin1">选择子元素</p>
                <Select @on-change="selectChildAddin"
                        clearable
                        @on-open-change="openSelectChildAddin" v-model="contained_selected_uuid">
                  <Option v-for="elem in args.contain_offs" :value="elem.uuid" :key="elem.uuid">{{ elem.id }}</Option>
                </Select>
                <p class="margin1">水平偏移</p>
                <Slider :max="100" :min="0" v-model="contained_horizon_off" show-input>
                </Slider>
                <p class="margin1">竖直偏移</p>
                <Slider :max="100" :min="0" v-model="contained_vertical_off" show-input></Slider>
                <p class="margin1">偏移均为0时不偏移</p>
              </Col>
            <!--              <Col span="24" class="margin1">-->
            <!--                <span>内容水平对齐</span>-->
            <!--                <Select>-->
            <!--                  <Option v-for="style in args.contain_justify_label" :value="style.value" v-model="args.contain_justify">-->
            <!--                    {{style.label}}-->
            <!--                  </Option>-->
            <!--                </Select>-->
            <!--              </Col>-->
            <!--              <Col span="24" class="margin1">-->
            <!--                <span>内容竖直对齐</span>-->
            <!--                <Select>-->
            <!--                  <Option v-for="style in args.contain_align_label" :value="style.value" v-model="args.contain_align">-->
            <!--                    {{style.label}}-->
            <!--                  </Option>-->
            <!--                </Select>-->
            <!--              </Col>-->
          </Row>
          <!--          <p class="margin1">边框样式</p>-->
          <!--          <Select @on-change="itemConfigChange" v-model="args.style">-->
          <!--            <Option v-for="style in args.style_label" :value="style.value">-->
          <!--              {{style.label}}-->
          <!--            </Option>-->
          <!--          </Select>-->
        </div>
    </EditBox>
    </span>
  </section>
  <section v-else-if="!t_preview && !doDestroy" :addinName="name" style="text-align: center">
    <span style="text-align:center">
        <div class="form-addin-icon">
            <i class="iconfont">&#xe69f;</i>
        </div>
        <div class="form-addin-name">
            拖拽块
        </div>
    </span>
  </section>
</template>

<script>
import EditBox from './_EditBox.vue';
import _global from '@/views/global.vue'
import '@/styles/component/iconfont.css'
import {uuid} from "@/util/assist";
import draggable from "vuedraggable";
import { DWFADDINARGSVERSION } from "@/util/DWFVariable";

const name = "DragItem";
const layoutAddinNames = ['row', 'col', 'Tab', 'GroupBox', 'Panel', 'Grid', 'FormEngine', 'BarChart', 'Iframe'];
export default {
  name: name,
  props: [
    'addin',
    'uuid',
    'activeUUID',
    'basicArgs',
    'relation',
    "argsProps",
    "widgetAnnotation",
    "editExtendInfo",
    'checkResult',
    "itemValue",
    "attributes",
    "query_oprs",
    "route",
    "router",
    "root",
    "store",
    "formCanvas",
  ],
  components: {
    EditBox,
    draggable,
  },
  data() {
    return {
      name: name,

      // 展示模式
      t_preview: true,
      t_show: false,
      t_icon: true,
      t_edit: false,
      t_edit_row: false,
      t_edit_col: false,
      doDestroy: false,
      dataTypes: [],
      refreshDOM: true,

      baseUrl: '',
      // 编辑框rows

      actEdit: false,
      args: {
        title: "拖拽块",
        dragTitle: "标题",
        identical: null,
        id: "",
        _id: "0",
        type: "flex",
        hided: false,
        parentLayout: '',
        parentUUID: '',
        // label_width: 2,
        // main_width: 3,
        // label_align: 4,
        // main_align: 4,

        imgOrigin: 'imgSelf',
        back_color: "#fff",             // 背景颜色
        back_picture: "",           // 背景图片,超链接
        bgStyle: 'cover',           // 背景图片显示方式
        bgSize: 'cover',
        bgRepeat: 'no-repeat',
        bgPercent: 100,

        isDraggable: true,
        isResizable: true,
        isResponsive: false,
        static: false,
        showTitle: true,
        titleFontSize: 14,
        titleFontSizeType: 'px',
        titleFontColor: 'inherit',
        style: "classic",
        justify: "center",
        align: "middle",
        /**
         * relativeOffs:[
         *  { uuid:, addinname:, horizonOff:, verticalOff: }
         * ]
         */
        relativeOffs: [],
        style_label: [
          {"value": "naive", "label": "简单"},
          {"value": "classic", "label": "经典"},
          {"value": "transparent", "label": "透明"}
        ],
        contain_justify: "",
        contain_justify_label: [
          {"value": "left", "label": "左对齐"},
          {"value": "center", "label": "中对齐"},
          {"value": "right", "label": "右对齐"}
        ],
        contain_align: "",
        contain_align_label: [
          {"value": "top", "label": "顶对齐"},
          {"value": "middle", "label": "中对齐"},
          {"value": "bottom", "label": "底对齐"}
        ],
        contain_offs: [],
      },
      contained_selected_uuid: "",  // 即将进行偏移的控件的UUID
      contained_horizon_off: 0,
      contained_vertical_off: 0,
      inherit: [],
      contain_addin_idMap: {},
      // formAddinList: [],
    }
  },
  inject: [
    'GetJsonById',
    'GenerateID',
    'setBasicArgs',
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {
      this.baseUrl = _global.baseUrl;
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    if (this.t_preview) {
      this.$nextTick(() => {
        this.initItemTransform();
        this.applyRelativeOffsOnItem();
        if(!this.contained_selected_uuid && this.args.contain_offs.length > 0){
          this.contained_selected_uuid = this.args.contain_offs[0].uuid;
          this.selectChildAddin(this.contained_selected_uuid)
        };
      });
    }
    // for (let _addin_index = 0; _addin_index < item.children['container'].children.length; _addin_index++) {
    //   let addin = item.children['container'].children[_addin_index];
    //   if (layoutAddinNames.includes(addin.getAttribute("addinname"))) {
    //     addin.classList.add('contain-addin-stretch')
    //     addin.style.width = "auto";
    //   }
    // }
    //
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    ;
  },
  watch: {
    arg_height(val) {
      this.setHeight();
    },
    args_name(val) {
      if (val != "-1") {
        this.args.name = val;
      } else {
        // // // // this.args.name = "";
      }
    },
    contained_horizon_off(val) {
      this.modifyOffs();
    },
    contained_vertical_off(val) {
      this.modifyOffs();
    }
  },
  computed: {
    arg_bgPic() {
      let finalBg = '';
      if (this.args.imgOrigin == 'imgSelf') {
        finalBg = `url(${this.args.back_picture})`
      } else {
        finalBg = this.args.back_picture == '' ? this.args.back_picture : `url(${this.baseUrl}/files-download/${this.args.back_picture})`;
      }
      return finalBg;
    },
    itemTitleStyle() {
      return {
        'font-size': this.args.titleFontSize + this.args.titleFontSizeType,
        'color': this.args.titleFontColor
      }
    },
    itemContainerStyle() {
      return !this.args.isResponsive ? {
        'overflow': 'auto',
        'backgroundImage': this.arg_bgPic,
        'backgroundSize': this.args.bgSize,
        'backgroundRepeat': this.args.bgRepeat,
        'backgroundColor': this.args.back_color,
      } : {
        'backgroundImage': this.arg_bgPic,
        'backgroundSize': this.args.bgSize,
        'backgroundRepeat': this.args.bgRepeat,
        'backgroundColor': this.args.back_color,
        'min-height': '30px',
        'min-width': '50px',
      };
    },

    //初始化控件props
    addinProps() {
      return {
        store: this.store,
        activeUUID: this.activeUUID,
        basicArgs: this.basicArgs,
        itemValue: this.itemValue,
        attributes: this.attributes,
        relation: this.relation,
        editExtendInfo: this.editExtendInfo,
        widgetAnnotation: this.widgetAnnotation,
        checkResult: this.checkResult,
        query_oprs: this.query_oprs,
        route: this.route,
        router: this.router,
        root: this.root,
        Message: this.$Message,
        echarts: this.$echarts,
        formCanvas: this.formCanvas,
      }
    },

    formAddinList(){
      return this.addin.elements.map(addin => {
        return {
          name: addin.self.elementType.replace('addin_', ''),
          uuid: addin.self.uuid,
          addin: addin,
        }
      })
    }
  },

  methods: {
    /**
     *  *********************************************system methods***********************************************
     */
    // refreshFormAddinList(){
    //   this.formAddinList = this.addin.length !== 0 ? this.addin.map(addin => {
    //     return {
    //       name: addin.self.elementType.replace('addin_', ''),
    //       uuid: addin.self.uuid,
    //       addin: addin,
    //     }
    //   }) : [];
    // },

    getValue() {
      return null;
    },

    setValue(items) {
      return this;
    },

    getAllow() {
      return [];
    },

    getInherit(dropTarget) {
      var res = {};
      let that = this;
      this.inherit.forEach(x => {
        if (x in that.args)
          res[x] = that.args[x];
      });
      return res;
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
        if (i == "layout") {
          this.args.layout = this.args.layout.filter(x => !x.deleted);
        }
      }
      if ("name" in args) this.args_name = this.args.name;
      delete this.args.basic_height;
      delete this.args.label_width;
      delete this.args.label_align;
      delete this.args.label_align;
      return this;
    },

    // 获取表单项名
    getFormName() {
      return null;
    },

    getEditBoxComponent() {
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
      this.t_preview = false;
      this.t_show = false;
      this.t_icon = false;
      if (type == 0) this.t_preview = true;
      else if (type == 1) this.t_show = true;
      else if (type == 2) this.t_icon = true;
      return this;
    },
    /**
     *  *********************************************costom methods***********************************************
     */
    fillAddin(event, addin, ghostBox) {
      // TODO: 直接用event中path的最后一个元素加入是准确的 但这样意味着相对位置计算的方法有问题
      var path, dropItem;
      if (event) {
        path = event.path || (event.composedPath && event.composedPath());
        if (!path) throw 'Your borwser dont support for event.composedPath.';
        dropItem = path[0];
      }
      // if (dropItem.getAttribute('addinname') != "DragItem") {
      //   this.$Message.error("请拖拽到方块中");
      //   return false;
      // }
      //
      if (ghostBox) {
        addin.$el ? this.$refs['container'].replaceChild(addin.$el, ghostBox) : this.$refs['container'].replaceChild(addin, ghostBox)
      } else {
        addin.$el ? this.$refs['container'].appendChild(addin.$el) : this.$refs['container'].appendChild(addin)
      }
      this.updateContainOffs('add', addin);
      return dropItem;
    },

    updateContainOffs(type, addin) {
      let exsisted_off;
      let exsisted_offs = [];
      let allElement;
      let children = this.$refs['container'].$el.children;
      switch (type) {
        case 'all':
          let exsisted_offs = [];
          this.addin.elements.forEach(element => {
            let exsisted_off;
            exsisted_off = this.args.contain_offs.filter(item => item.uuid === element.self.uuid);
            if(exsisted_off.length !== 0){
              // exsisted_off[0].id = this.args.contain_offs.filter(item => item.uuid === element.self.uuid)[0].self.properties.id;
              exsisted_offs = exsisted_offs.concat(exsisted_off);
            }else{
              exsisted_off = {
                "uuid": element.self.uuid,
                "addinname": element.self.elementType.replace('addin_', ''),
                "id": element.self.properties.id,
                "horizonOff": 0,
                "verticalOff": 0
              }
              exsisted_offs.push(exsisted_off);
            }
          })
          this.args.contain_offs = exsisted_offs;
          break;
        case 'add':
          // this.contained_selected_uuid = "";
          // Array().forEach.call(children, child => {
          //   exsisted_offs = exsisted_offs.concat(this.args.contain_offs.filter(item => item.uuid === child.getAttribute("uuid")));
          // });
          // if (addin.$el && this.args.contain_offs.map(item => item.uuid).indexOf(addin.$el.getAttribute("uuid")) === -1) {
          //   exsisted_offs.push({
          //     "uuid": addin.$el.getAttribute("uuid"),
          //     "addinname": addin.$el.getAttribute("addinname"),
          //     "id": addin.$data.args.id,
          //     "horizonOff": 0,
          //     "verticalOff": 0
          //   });
          // } else if (this.args.contain_offs.map(item => item.uuid).indexOf(addin.getAttribute("uuid")) === -1) {
          //   allElement = this.getAllElements(this.itemValue.data.elements);
          //   exsisted_offs.push({
          //     "uuid": addin.getAttribute("uuid"),
          //     "addinname": addin.getAttribute("addinname"),
          //     "id": allElement.filter(item => item && item.$el.getAttribute('uuid') === addin.getAttribute("uuid"))[0].args.id,
          //     "horizonOff": 0,
          //     "verticalOff": 0
          //   });
          // } else if (addin.$el && this.args.contain_offs.map(item => item.uuid).indexOf(addin.$el.getAttribute("uuid")) !== -1) {
          //   this.modifyItemOff(addin.$el, this.args.contain_offs.filter(item => item.uuid === addin.$el.getAttribute("uuid"))[0]);
          // } else if (this.args.contain_offs.map(item => item.uuid).indexOf(addin.getAttribute("uuid")) !== -1) {
          //   this.modifyItemOff(addin, this.args.contain_offs.filter(item => item.uuid === addin.getAttribute("uuid"))[0]);
          // }
          //
          // this.args.contain_offs = exsisted_offs;
          break;
        case 'update':
          let index = this.args.contain_offs.map(item => item.uuid).indexOf(this.contained_selected_uuid);
          if (index !== -1) {
            this.args.contain_offs[index].horizonOff = this.contained_horizon_off;
            this.args.contain_offs[index].verticalOff = this.contained_vertical_off;
          }
          break;
        default:
          break;
      }
      // else{
      //   // 如果本身存储了偏移配置 this.$data[attr] === this.item_contain_offs
      //   let exsistedUUIDs = [];
      //   let recordedUUIDs = this.args.contain_offs.map(x => x.uuid);
      //   // 当前所有控件的uuid存储到 exsistedUUIDs
      //   for (let _index = 0; _index < containedChildren.length; _index++) {
      //     let theUUID = containedChildren[_index].getAttribute("uuid");
      //     exsistedUUIDs.push(theUUID);
      //     // 如果本身Cfg中没有 则补上
      //     if (!(recordedUUIDs.includes(theUUID))) this.item_contain_offs.push({
      //       "uuid": theUUID,
      //       "addinname": containedChildren[_index].getAttribute("addinname"),
      //       "horizonOff": 0,
      //       "verticalOff": 0
      //     })
      //   }
      //   // 删除不存在的偏移配置
      //   for (let _index = this.item_contain_offs.length - 1; _index >= 0; _index--) {
      //     // TODO: Not tested still
      //     if (!(exsistedUUIDs.includes(this.item_contain_offs[_index].uuid))) this.item_contain_offs.splice(_index, 1);
      //   }
      // }
    },
    getAllElements(json) {
      let result = [];
      for (var element of json) {
        result.push(element.obj);
        result = result.concat(this.getAllElements(element.elements));
      }
      return result;
    },
    initItemTransform() {
      setTimeout(() => {
        this.$refs.main && this.$refs.main.classList.add('transform-0');
      }, 100)
    },
    applyRelativeOffsOnItem() {
      if (this.args.contain_offs.length !== 0) {
        // let exsisted_offs = [];
        // this.addin.elements.forEach(element => {
        //   let exsisted_off;
        //     exsisted_off = this.args.contain_offs.filter(item => item.uuid === element.self.uuid);
        //     exsisted_off[0].id = this.args.contain_offs.filter(item => item.uuid === element.self.uuid)[0].self.properties.id;
        //     exsisted_off = exsisted_offs.concat(exsisted_off);
        // })
        // this.args.contain_offs = exsisted_offs;
        // 把 this.args.contain_offs 配置应用到 itemDOM 中的控件里
        for (let offSet of this.args.contain_offs) {
          let targetAddins = this.addin.elements.filter(element => element.self.uuid === offSet.uuid)
          if (targetAddins.length < 1) continue;
          this.modifyItemOff(targetAddins[0].obj.$el, offSet);
        }
      }else{
        this.addin.elements.forEach(element => {
          let contain_off = {
            "uuid": element.self.uuid,
            "addinname": element.self.elementType.replace('addin_', ''),
            "id": element.self.properties.id,
            "horizonOff": 0,
            "verticalOff": 0
          }
          this.args.contain_offs.push(contain_off);
        })

      }
    },

    modifyOffs() {
      /**
       * 本方法是偏移选择控件的钩子 立刻将偏移配置应用到所选 item 中
       * TODO:
       * modeler和app端渲染表单时要对所有的偏移配置进行设置
       * 优化选择控件时的序号提示
       * 进一步地 能否让偏移过程对齐标记为边框?
       */
      if (this.contained_selected_uuid == "") return;
      let selectedAddin = this.addin.elements.find(element => element.self.uuid === this.contained_selected_uuid).obj.$el;
      if (this.contained_horizon_off == 0 && this.contained_vertical_off == 0) {
        //TODO: 还原偏移到0
        selectedAddin.style.position = "relative";
        selectedAddin.style.left = "0%";
        selectedAddin.style.top = "0%";
        this.updateContainOffs('update');
        return;
      }
      selectedAddin.style.position = "absolute";
      selectedAddin.style.left = this.contained_horizon_off + "%";
      selectedAddin.style.top = this.contained_vertical_off + "%";
      this.updateContainOffs('update');
    },

    modifyItemOff(itemDOM, offSet) {
      if (offSet.horizonOff == 0 && offSet.verticalOff == 0) return;
      itemDOM.style.position = "absolute";
      itemDOM.style.left = offSet.horizonOff + "%";
      itemDOM.style.top = offSet.verticalOff + "%";
      // 默认布局控件脱离布局后仍未100%宽度
      // if (layoutAddinNames.includes(itemDOM.getAttribute("addinname"))) itemDOM.style.minWidth = "100%";
    },
    isResponsiveChange(val){
      if(val){
        this.$Message.info('该选项适合内部元素有固定的非百分比的宽高');
      }
      this.$emit('LayoutItemConfigChange', this.args);
    },
    itemConfigChange() {
      this.$emit('LayoutItemConfigChange', this.args);
    },
    selectChildAddin(uuid) {
      // 如果偏移均为0 应当计算目前状态的偏移
      if (!uuid) return

      this.addin.elements.forEach(element => {
        element.obj.$el.classList.remove('animated', 'flash');
      })
      this.addin.elements.find(element => element.self.uuid === uuid).obj.$el.classList.add('animated', 'flash');
      this.contained_horizon_off = this.args.contain_offs.filter(item => item.uuid === uuid)[0].horizonOff;
      this.contained_vertical_off = this.args.contain_offs.filter(item => item.uuid === uuid)[0].verticalOff;
      setTimeout(() => {
        this.addin.elements.forEach(element => {
          element.obj.$el.classList.remove('animated', 'flash');
        })
      }, 1000)
    },
    //打开下拉选时触发，刷新内部元素数组
    openSelectChildAddin(status) {
      status && this.updateContainOffs('all');
    },
    setItemDoDestroy(flag) {
      this.doDestroy = flag;
      return this.$el;
    },
    //删除拖拽块
    deleteItem(type) {
      this.doDestroy = true;
      this.$emit('showEditBox');
      this.$nextTick(() => {
        this.$emit('DeleteItem', this.$el.getAttribute('uuid'));
      });
      // if(type == 'form'){
      // }else{
      //   //FIXME 点击叉号与后退前进删除的区别没有分开
      //   //TODO:有不同的分类种类吗？
      //   this.$emit('DeleteItem', this.args);
      // }
      // this.$destroy();
    },

    onClick(){
      this.$emit('activeAddinFormLayout', null, this.addin, this.addin.self.uuid);
      // this.$emit("showEditBox", null, this);
    },

    jsonDataChange(evt) {
      for (let type in evt) {
        switch (type) {
          case 'added':
            if (evt.added.element.addin) {
              //非收藏控件拖入
              this.addin.elements.splice(evt.added.newIndex, 0, evt.added.element.addin);
            } else if (evt.added.element.nameProps){
              //超级控件
              let addin = {
                self: {
                  elementType: `addin_${evt.added.element.nameProps}`,
                  properties: {
                    ...evt.added.element.argsProps,
                    id: this.GenerateID(evt.added.element.nameProps),
                    collectId: evt.added.element.oidProps,
                  },
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.addin.elements.splice(evt.added.newIndex, 0, addin);
            } else if(evt.added.element.groupOid){
              //小组件控件
              try {
                let addin = {
                  self: {
                    elementType: `addin_FormEngine`,
                    properties: {
                      bindTargetClass: "Component&e",
                      viewName: evt.added.element.viewName,
                      groupDisplayName: evt.added.element.groupDisplayName,
                      groupOid: evt.added.element.groupOid,
                      componentOid: evt.added.element.oid,
                      componentDisplayName: evt.added.element.displayName,
                    },
                    dropTarget: 0,
                    uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                  },
                  elements: [],
                }
                this.addin.elements.splice(evt.added.newIndex, 0, addin);
              }catch (e){
                console.error(`小组件控件${e}`)
              }
            } else if (evt.added.element.ISASSEMBLE) {
              //sdk控件
              let addin = {
                self: {
                  elementType: `addin_AssembleAddin`,
                  properties: {
                    _ASSEMBLECONFIG: evt.added.element
                  },
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              this.addin.elements.splice(evt.added.newIndex, 0, addin);
            } else {
              let addin = {
                self: {
                  elementType: `addin_${evt.added.element.name}`,
                  properties: {},
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.addin.elements.splice(evt.added.newIndex, 0, addin);
            }
            this.$emit('snapShotHistory');
            break;
          case 'moved':
            this.addin.elements.move(evt.moved.oldIndex, evt.moved.newIndex)
            this.$emit('snapShotHistory');
            break;
          case 'removed':
            this.$emit('removeAddin', evt.removed.element.uuid, this.addin.self.uuid)
            break;
          default:
            break;
        }
      }
    },

    activeAddin(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },

    copyAddin(addin, parentUUID = this.addin.self.uuid) {
      // if(parentUUID === this.addin.self.uuid){
      //   //点击复制按钮联动更新draggable的list
      //   let element = {
      //     name: addin.self.elementType.replace('addin_', ''),
      //     uuid: addin.self.uuid,
      //     addin: addin,
      //   }
      //   this.formAddinList.push(element);
      // }
      this.$emit('copyAddin', addin, parentUUID);
    },

    removeAddin(uuid, parentUUID = this.addin.self.uuid, deleteButton){
      // if(parentUUID === this.addin.self.uuid){
      //   //点击删除按钮联动删除draggable的list
      //   let index = this.formAddinList.findIndex(addin => addin.uuid === uuid);
      //   this.formAddinList.splice(index, 1);
      // }
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },

    deleteAddin() {
      this.$emit('deleteAddin');
    },

    commentAddin(addin) {
      this.$emit('commentAddin', addin);
    },
  }
};
</script>

<style scoped>
section {
  display: inline-block;
  /*width: 100%;*/
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
<style>
@-webkit-keyframes flash {
  from,
  50%,
  to {
    opacity: 1;
  }

  25%,
  75% {
    opacity: 0;
  }
}

@keyframes flash {
  from,
  50%,
  to {
    opacity: 1;
  }

  25%,
  75% {
    opacity: 0;
  }
}

.flash {
  -webkit-animation-name: flash;
  animation-name: flash;
}

.animated {
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}

.transform-0 {
  /*transform: translate3d(0, 0, 0);*/
}

.vue-resizable-handle {
  z-index: 9
}
</style>
