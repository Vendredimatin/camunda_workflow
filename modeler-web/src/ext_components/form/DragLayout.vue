<template>
  <div
    v-if="t_preview"
    :addinName="name"
    class="addin drag-layout"
    :style="layoutWarpperStyle(col_width, arg_height)"
    ref="main"
    @dragover.prevent="onDragOver($event)"
    @drop.prevent.stop="onDrop($event)"
  >
    <grid-layout
      ref="layout"
      dropTarget="dragLayout"
      v-if="refreshDOM"
      :layout.sync="args.layout"
      :col-num="args.col_nums"
      :row-height="args.row_height"
      :margin="[10, 10]"
      :isResizable="args.layoutDraggable"
      :is-mirrored="false"
      :autoSize="true"
      :verticalCompact="args.verticalCompact"
      :use-css-transforms="false"
      @click.native="onClick($event, 0, 'layout')"
      :style="layoutStyle(col_width, arg_height)"
    >
      <grid-item
        v-if="refreshDOM"
        v-for="(item, index) in args.layout"
        :key="dragAddinList[index].self.uuid"
        class="no-padding flex-col-direction"
        :class="item.computedStyle"
        :i="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :ref="'item'+item.i"
        :identical="item.i"
        :isDraggbale="item.isDraggable"
        :isResizable="item.isResizable"
        :static="item.static"
        @resize="handleItemResize"
        @resized="handleItemResized"
        @move="moveEvent"
        @moved="movedEvent"
        @mousedown.native="handleItemMousedown(item.i)"
        @mouseup.native="handleItemMouseup(item.i)"
        @click.native="onClick($event, item.i, 'item')"
        :style="itemStyle(item.isResponsive, 'item')"
      >
        <FormAddinList
          v-if="dragAddinList[index]"
          :addin="dragAddinList[index]"
          v-bind="addinProps"
          @getArgs="getArgsFormLayout"
          @showEditBox="showEditBox"
          :ref="`FormAddinList${dragAddinList[index].self.uuid}`"
          @activeAddin="activeAddin"
          @copyAddin="copyAddin"
          @removeAddin="(uuid, parentUUID, deleteButton) => { removeAddin(uuid, parentUUID, index, deleteButton) }"
          @deleteAddin="deleteAddin"
          @commentAddin="commentAddin"
          @LayoutItemConfigChange="LayoutItemConfigChange"
          @layoutSelfDrag="() => { $emit('layoutSelfDrag') }"
          @snapShotHistory="() => { $emit('snapShotHistory') }"
          @dragstart.native.stop="onDragStart"
        >

        </FormAddinList>
      </grid-item>
    </grid-layout>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <!-- <h1 style="font-size: 14px;">拖拽块</h1>
      <hr/> -->
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
               :router="router"
               :route="route"
               :root="root"
               :query_oprs="query_oprs"
               :targetclass="itemValue.data.targetclass">
        <div slot="attribute">
            <Row class="margin1" v-if="refreshDOM">
              <Col span="12" class="margin1">
                <Checkbox v-model="args.verticalCompact">密竖排</Checkbox>
              </Col>
              <Col span="12" class="margin1">
                <Checkbox v-model="args.layoutDraggable">可拖拽</Checkbox>
              </Col>
            </Row>
        </div>
    </EditBox>
    </span>
  </div>
  <section v-else-if="t_icon" :addinName="name" style="text-align: center">
    <div class="form-addin-icon">
      <i class="iconfont">&#xe6a0;</i>
    </div>
    <div class="form-addin-name" style="width: 100%">拖拽池</div>
  </section>
</template>

<script>
import "@/styles/component/iconfont.css";
import VueGridLayout from "vue-grid-layout";
import EditBox from "./_EditBox";
import {uuid} from "@/util/assist";
import { DWFADDINARGSVERSION } from "@/util/DWFVariable";

const name = "DragLayout";
const layoutAddinNames = ['row', 'col', 'Tab', 'GroupBox', 'Panel', 'Grid', 'FormEngine', 'BarChart', 'Iframe'];
export default {
  name: name,
  props: [
    'addin',
    'activeUUID',
    'basicArgs',
    'formCanvas',
    'relation',
    "argsProps",
    "widgetAnnotation",
    "editExtendInfo",
    "itemValue",
    "checkResult",
    "attributes",
    "query_oprs",
    "route",
    "router",
    "root",
    "store",
  ],
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    EditBox,
  },
  data() {
    return {
      name: name,

      // 展示模式
      t_preview: true,
      t_show: false,
      t_icon: true,
      t_edit: false,
      t_edit_item: false,
      t_edit_layout: false,

      dataTypes: [],
      // 编辑框rows

      actEdit: false,
      args: {
        title: "拖拽池",
        id: "",
        _id: "0",
        hided: false,
        type: "flex",
        align: "middle",
        justify: "start",
        // label_width: 2,
        // main_width: 3,
        // label_align: 4,
        // main_align: 4,
        height: 0,
        heightType: "px",
        width: 100,
        widthType: '%',
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        span: 8,
        offset: 0,
        push: 0,
        pull: 0,
        children: {},
        iCols: {},
        iRows: [],
        // drag-layout properties
        verticalCompact: false,
        layoutDraggable: true,
        layout: [],
        col_nums: 48,
        row_height: 30,
      },
      refreshDOM: true,
      itemSettings: {},

      item_default_width: 16,
      item_default_height: 3,
      item_draggable: true,
      item_resizable: true,
      item_static: false,
      item_show_title: true,
      item_responsive: false,
      item_title: "",
      item_title_fsize: 14,
      item_title_fsizeType: 'px',
      item_title_fontColor: 'initial',
      item_style: "",
      item_style_label: [
        {"value": "naive", "label": "简单"},
        {"value": "classic", "label": "经典"},
        {"value": "transparent", "label": "透明"}
      ],
      selected_item_identical: 0,
      // 继承属性
      inherit: [
        "label_width",
        "main_width",
        "main_align",
        "label_align",
        "col"
      ],
      layoutRedoList: [],
      isMounted: false,
      childrenItems: [],
    };
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
  },
  mounted() {
    if (this.t_preview) {
      this.$nextTick(() => {
        this.resetLayoutHeight();
        this.isMounted = true;
      });
    }
  },
  watch: {
    'args.layoutDraggable'(val) {
      if (val) {
        // var parN = this.$el.parentNode;
        this.$el.classList.add("vue-draggable-addin");
        // while (parN && parN.setAttribute) {
        //   if (Array.prototype.indexOf.call(parN.classList, 'addin') !== -1){
        //     parN.classList.add("vue-draggable-addin");
        //     break;
        //   }
        //   parN = parN.parentNode;
        // }
      } else {
        // var parN = this.$el.parentNode;
        this.$el.classList.remove("vue-draggable-addin");
        // while (parN && parN.setAttribute) {
        //   if (Array.prototype.indexOf.call(parN.classList, 'vue-draggable-addin') !== -1) {
        //     parN.classList.remove("vue-draggable-addin");
        //     break;
        //   }
        //   parN = parN.parentNode;
        // }
      }
    },

    'args.verticalCompact'() {
      this.simulationLayoutRender();
    },

    // 'args.id'(val) {
    //   if (val && this.childrenItems.length !== 0) {
    //     this.childrenItems.forEach(item => {
    //       if (typeof item == 'string') {
    //         this.GetAddinByUUID(item).obj.$data.args.parentLayout = val;
    //       } else {
    //         item.$data.args.parentLayout = val;
    //       }
    //     })
    //   }
    // }
  },
  computed: {
    max_rows() {
      if (this.args.heightType == "px") {
        return Math.floor(this.args.height / this.args.row_height);
      }
    },
    arg_height() {
      return this.args.height === 0 ? 'initial' : this.args.height + this.args.heightType;
    },
    col_width() {
      return this.args.width + this.args.widthType;
    },
    arg_cols() {
      return this.args.cols;
    },
    arg_rows() {
      return this.args.rows;
    },
    arg_label_align() {
      return this.args.label_align;
    },
    arg_main_align() {
      return this.args.main_align;
    },
    arg_label_width() {
      return this.args.label_width;
    },
    arg_main_width() {
      return this.args.main_width;
    },
    arg_type() {
      return this.args.type;
    },
    arg_align() {
      return this.args.align;
    },
    arg_justify() {
      return this.args.justify;
    },
    item_defaultWidth() {
      return (this.$refs.layout.$el.offsetWidth / 3) - 30 + 'px';
    },
    item_defaultHeight() {
      return this.args.row_height * 3 + 15 + 'px';
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

    dragAddinList(){
      let dragAddinList = [];
      if(this.args.layout.length !==0 && ('containerUUID' in this.args.layout[0])){
        //兼容之前的uuid
        this.args.layout.forEach((item, index) => {
          dragAddinList[index] = this.addin.elements.find(addin => addin.self.uuid === item.containerUUID)
        })
      }else{
        this.args.layout.forEach((item, index) => {
          dragAddinList[index] = this.addin.elements[index]
        })
      }
      return dragAddinList;
    },
  },

  methods: {
    addItem(event, addin) {
      if (typeof addin !== 'string') {
        //拖拽入池
        let item = this.getRelativeCoordinate(event.clientX, event.clientY);
        item = {
          ...item,
          h: this.item_default_height,
          w: this.item_default_width,
          i: Math.max(...this.args.layout.map(x => parseInt(x.i))) + 1,
          isResizable: true,
          isResponsive: false,
          // containerUUID: addin.self.uuid,
          showTitle: true,
          hided: false,
          computedStyle: {
            'item': true
          },
          static: false,
        };
        item.i = item.i < 0 ? 0 : item.i;
        this.args.layout.push(item);
        // this.childrenItems.push(addin)
        // this.$nextTick(() => {
        //   Array().forEach.call(this.$refs[`item${item.i}`][0].$el.childNodes, item => {
        //     if (item.tagName === "SECTION") {
        //       item.remove()
        //     }
        //   });
        //   this.$refs[`item${item.i}`][0].$el.appendChild(addin.$el);
        //   addin.$data.args.identical = item.i;
        //   addin.$data.args.parentLayout = this.args.id;
        //   addin.$data.args.parentUUID = this.$el.getAttribute('UUID');
        //   addin.$on('LayoutItemConfigChange', this.LayoutItemConfigChange);
          // addin.$on('DeleteItem', this.deleteItem);
        // })
      } else {
        //复制入池
        let item = {
          x: 0,
          y: 0,
          h: this.item_default_height,
          w: this.item_default_width,
          i: Math.max(...this.args.layout.map(x => parseInt(x.i))) + 1,
          isResizable: true,
          isResponsive: false,
          // containerUUID: addin,
          showTitle: true,
          hided: false,
          computedStyle: {
            'item': true
          },
          static: false,
        };
        item.i = item.i < 0 ? 0 : item.i;
        this.args.layout.push(item);
        // this.childrenItems.push(addin)
        // this.$nextTick(() => {
        //   Array().forEach.call(this.$refs[`item${item.i}`][0].$el.childNodes, item => {
        //     if (item.tagName === "SECTION") {
        //       item.remove()
        //     }
        //   });
          // this.$refs[`item${item.i}`][0].$el.appendChild(addin.$el);
          // addin.$data.args.identical = item.i;
          // addin.$data.args.parentLayout = this.args.id;
          // addin.$data.args.parentUUID = this.$el.getAttribute('UUID');
          // addin.$on('LayoutItemConfigChange', this.LayoutItemConfigChange);
          // addin.$on('DeleteItem', this.deleteItem);
        // })
      }
    },

    getRelativeCoordinate(clientX = 0, clientY = 0) {
      /**
       * FIXME:
       * 位置不准确
       */
      var boundingClientRect = this.$refs.layout.$el.getBoundingClientRect();
      let relaX = clientX - boundingClientRect.left;
      let relaY = clientY - boundingClientRect.top;
      let totalWidth = boundingClientRect.right - boundingClientRect.left;
      relaX = Math.floor((relaX * this.args.col_nums) / totalWidth);
      relaX = relaX > this.args.col_nums - this.item_default_width ? this.args.col_nums - this.item_default_width : relaX;
      relaY = Math.floor(relaY / this.args.row_height);
      relaY = relaY > 2 ? relaY - 2 : relaY;
      return {x: relaX, y: relaY};
    },

    getAddinFillItem(event) {
      // 根据事件的坐标返回对应Item的id
      // FIXME: 相对坐标计算不准确 暂时弃用该判断 path 的方法不安全
      if (false) {
        let relativeCoordiantion = this.getRelativeCoordinate(event.clientX, event.clientY);
        let dropItemId = this.getDropItem(relativeCoordiantion.x, relativeCoordiantion.y);
        if (dropItemId < 0) this.$Message.error("请拖拽到方块中");
        return dropItemId;
      }
      var path = event.path || (event.composedPath && event.composedPath());
      if (!path) throw 'Your borwser dont support for event.composedPath.';
      let dropItemContainer = path[0];
      if (dropItemContainer != dropItemContainer.parentElement.children['container']) {
        this.$Message.error("请拖拽到方块中");
        return -1;
      }
      return dropItemContainer.parentElement.getAttribute("identical");
    },


    getItemDOM(index) {
      // 根据Item的id或说identical属性获取相应DOM
      for (let child of this.$refs.layout.$children) {
        if (parseInt(child.$attrs.identical) == index) {
          console.log("child@getItemDOM", child);
          return child.$el;
        }
      }
      return null;
    },

    getDropItem(x, y) {
      /**
       * 根据相对坐标x y获得对应的Item
       * Params: Relative coordination x and y
       * Process: Calculate which item mouse drop on
       * Return: Item Id
       */
      for (let item of this.args.layout) {
        if (item.x > x || item.y > y) continue;
        if (item.x + item.w > x && item.y + item.h > y) return item.i;
      }
      return -1;
    },

    onClick(e, id, tp) {
      // 把 args.layout 中的配置放到 EditBox 中
      // e.stopPropagation();
      // e.preventDefault();
      // for (let _index = 0; _index < this.$refs.layout.$el.children.length; _index++) {
      //   this.$refs.layout.$el.children[_index].classList.remove('selected');
      // }
      // if (tp == "layout") {
      //   this.$emit("hideEditBox");
      //   console.log("layout@onClick", this.args.layout);
      //   console.log("$refs.layout@onClick", this.$refs.layout);
      //   this.selected_item_identical = -1;
      //
      //   // 准备出现在 EditBox 中的参数
      // this.args.layoutDraggable = this.$refs.main.getAttribute("draggable");
      //   this.$emit("showEditBox", this.$refs.main, tp, this);
      //   return;
      // }
      // this.itemSettings = {};
      // this.selected_item_identical = this.args.layout.map(x => parseInt(x.i)).indexOf(parseInt(id));
      // console.log("selected_item_identical@onClick", this.selected_item_identical);
      // let itemDOM = this.getItemDOM(id);
      // // if (itemDOM && itemDOM.classList) itemDOM.classList.add('selected');
      // let selected_item = this.args.layout[this.selected_item_identical];
      // // 将该item属性赋值到editBox绑定的变量中
      // for (let attr of this.controller_attributes) {
      //   if (attr == "item_contain_offs") {
      //     this.refreshOffsetsOnEditBox(selected_item, itemDOM);
      //     continue;
      //   };
      //   // 其他情况的配置
      //   this.$data[attr] = (this.ref_dic[attr] in selected_item) ? selected_item[this.ref_dic[attr]] : this.itemDefaultValue[this.ref_dic[attr]];
      // }
      // this.getAllElements(this.itemValue.data.elements) && this.getAllElements(this.itemValue.data.elements).forEach(element => {
      //   if(element.name === 'DragLayout'){
      //     element.$data.args.layout.forEach(item => {
      //       item.active = false;
      //     });
      //   }
      // });
      // this.args.layout.forEach(item => {
      //   item.active = item.i === id ? true : false;
      // });
      // console.log("selected_item@onClick", selected_item);
      // console.log("this.args.layout[index]@onClick", this.args.layout[this.selected_item_identical]);
      // this.$emit("showEditBox", e.currentTarget, tp, this);
    },

    //刷新所有拖拽块
    refreshAllItem(){
      setTimeout(() => {
        this.args.layout.forEach(item => {
          for (let attr in item) {
            if (attr === 'isResponsive' && item[attr]) {
              this.$nextTick(() => {
                this.resetGridItem(item.i);
              })
            }
          }
        })
        this.simulationLayoutRender();
      }, 0)
    },

    refreshItemConfig(itemArgs, type = null) {
      // let selected_item = this.args.layout.filter(item => item.i === this.selected_item_identical)[0];
      // if (!selected_item) {
      //   console.error('No match item setting at index:', this.selected_item_identical);
      //   return;
      // }
      setTimeout(() => {
        this.args.layout.forEach((item, index) => {
          if(type === 'copy'){
            if (index === this.args.layout.length - 1) {
              for (let attr in itemArgs) {
                attr === 'style'
                  ? item['computedStyle'] = this.computed_style(itemArgs[attr])
                  : attr !== 'computedStyle'
                  ? item[attr] = itemArgs[attr]
                  : ''
                //如果为自适应重新计算w和h
                if (attr === 'isResponsive' && itemArgs[attr]) {
                  this.$nextTick(() => {
                    this.resetGridItem(this.selected_item_identical);
                    this.simulationLayoutRender();
                  })
                }
              }
            }
          }else{
            if (item.i === this.selected_item_identical) {
              for (let attr in itemArgs) {
                attr === 'style'
                  ? item['computedStyle'] = this.computed_style(itemArgs[attr])
                  : attr !== 'computedStyle'
                  ? item[attr] = itemArgs[attr]
                  : ''
                //如果为自适应重新计算w和h
                if (attr === 'isResponsive' && itemArgs[attr]) {
                  this.$nextTick(() => {
                    this.resetGridItem(this.selected_item_identical);
                    this.simulationLayoutRender();
                  })
                }
              }
            }
          }
        })
      }, 0)
      // this.$set(this.args.layout, this.selected_item_identical, selected_item);
    },

    getValue() {
      return null;
    },

    setValue(items) {
      return this;
    },

    getAllow() {
      return [];
      //return allow[dropTarget];
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

    getDataType(args) {
      return this.args.dataTypes;
    },

    getAllElements(json) {
      let result = [];
      for (var element of json) {
        result.push(element.obj);
        result = result.concat(this.getAllElements(element.elements));
      }
      return result;
    },
    updateAppendChild() {
      // 更新每个Item.children['container']的appendChild 使得布局控件可以伸展而普通控件不变
      let items = this.$refs.main.querySelectorAll(".item, .item-naive, .item-transparent");
      let _appendChild = items[0].children['container'].__proto__.appendChild;
      for (let i = 0; i < items.length; i++) {
        items[i].children['container'].appendChild = function () {
          console.log('newAppendChild');
          let addinName = arguments[0].getAttribute("addinname");
          if (layoutAddinNames.includes(addinName)) {
            arguments[0].classList.add('contain-addin-stretch');
            arguments[0].style.width = "auto";
          }
          return _appendChild.apply(this, arguments);
        }
      }
    },
    updateItemDragStart() {
      // TODO: 避免item内部的控件拖拽行为被认为是对拖拽块的拖拽
      // FIXME: cant work yet
      let items = this.$refs.main.querySelectorAll(".item, .item-naive, .item-transparent");
      for (let i = 0; i < items.length; i++) {
        let _onDrag = items[i].ondragstart;
        items[i].ondragstart = function () {
          console.log("newDragStart");
          console.log("arguments@newDragStart:", arguments);
          return _onDrag.apply(this, arguments);
        }
      }
    },
    /**
     * 最外层容器style
     */
    layoutWarpperStyle(width, height) {
      switch (height) {
        case 'initial':
          return {
            'height': 'initial',
            'width': width,
            'padding': '15px',
            'font-size': '14px',
            'display': 'inline-block',
            // 'overflow-x': 'auto',
            // 'background': '#f3f3f3'
          };
          break;
        case '0px':
          return {
            'height': 'initial',
            'width': width,
            'padding': '15px',
            'font-size': '14px',
            'display': 'inline-block',
          }
          break;
        default:
          return {
            'height': height,
            'width': width,
            'padding': '15px',
            'font-size': '14px',
            'overflow-x': 'scroll',
            'overflow-y': 'scroll',
            'display': 'inline-block'
          };
          break;
      }
    },
    layoutStyle(width, height) {
      switch (height) {
        case 'initial':
          return {
            'width': '100%',
            'min-height': '50px',
            'border': '1px dashed #bbb',
          };
          break;
        case '0px':
          return {
            'width': '100%',
            'min-height': '50px',
            'border': '1px dashed #bbb',
          }
          break;
        default:
          return {
            'width': '100%',
            'min-height': height,
            'border': '1px dashed #bbb',
          };
          break;
      }
    },
    /**
     * item-class
     */
    computed_style(set_style) {
      let style = {};
      switch (set_style) {
        case "classic":
          style = {
            'item': true,
          };
          break;
        case "naive":
          style = {
            'item-naive': true,
          };
          break;
        case "transparent":
          style = {
            'item-transparent': true,
          };
          break;
        default:
          style = {
            'item': true,
          };
          break;
      }

      return style;
    },
    /**
     * item-style
     */
    itemStyle(response, type) {
      let style = {};

      switch (type) {
        case "item":
          style = response ? {
            'height': 'auto',
            'width': 'auto',
          } : '';
          break;
        case "container":
          style = !response ? {
            'overflow': 'auto'
          } : '';
          break;
        default:
          break;
      }
      return style;
    },
    /**
     * 当自适应时重设layout w,h属性
     * @itemIndex layout i属性
     *
     */
    resetGridItem(itemIndex) {
      if (this.args.layout.length === 0 || itemIndex == null) {
        return false;
      }
      if (this.args.layout.filter(item => item.i == itemIndex).length !== 0 && this.args.layout.filter(item => item.i == itemIndex)[0].isResponsive) {
        let layoutWidth = this.$refs.layout.$el.offsetWidth - 12;
        let w = Math.ceil(this.$refs[`item${itemIndex}`][0].$el.offsetWidth * this.args.col_nums / layoutWidth) + 1;
        let h = Math.floor((this.$refs[`item${itemIndex}`][0].$el.offsetHeight) / this.args.row_height);
        !isNaN(w)
          ? this.args.layout.filter(item => item.i == itemIndex)[0].w = w : '';
        !isNaN(h)
          ? this.args.layout.filter(item => item.i == itemIndex)[0].h = h : '';
      }
    },
    /**
     * reset layout height按照高度与位置和最大item计算
     */
    resetLayoutHeight() {
      if (this.args.layout.length !== 0) {
        this.$refs['layout'].$el.style.height = (_.max(this.args.layout.map(item => parseInt(item.h + item.y))) * 40) + 60 + 'px';
      }
    },
    /**
     * 拖拽块元素改变
     */
    LayoutItemConfigChange(args) {
      this.refreshItemConfig(args);
    },
    handleItemResize(i, newH, newW, newHPx, newWPx) {
    },
    handleItemResized(i, newH, newW, newHPx, newWPx) {
      // this.isMounted && this.resetGridItem(i);
    },
    handleItemMousedown(itemIndex) {
      this.resetGridItem(itemIndex)
    },
    handleItemMouseup(itemIndex) {
      this.selected_item_identical = itemIndex;
      this.getAllElements(this.itemValue.data.elements) && this.getAllElements(this.itemValue.data.elements).forEach(element => {
        if (element && element.name === 'DragLayout') {
          element.$data.args.layout.forEach(item => {
            item.active = false;
          });
        }
      });
      for (let item of this.args.layout) {
        item.active = item.i === this.selected_item_identical;
      }
      //?
      this.t_edit_item = true;
      setTimeout(() => {
        this.resetGridItem(itemIndex)
      }, 10)
    },
    moveEvent: function (i, newX, newY) {
      console.log("MOVE i=" + i + ", X=" + newX + ", Y=" + newY);
    },
    movedEvent: function (i, newX, newY) {
      this.resetLayoutHeight();
    },
    deleteItem: function (uuid) {
      uuid = typeof uuid === "string" ? uuid : uuid.getAttribute('uuid');
      // this.layoutRedoList.push(this.args.layout.filter(item => item.containerUUID === uuid)[0]);
      let addin = this.GetAddinByUUID(uuid);
      if (addin && addin.obj.setItemDoDestroy) {
        addin.obj.setItemDoDestroy(true);
      }
      // this.args.layout.filter(item => item.containerUUID === uuid)[0].setItemDoDestroy && this.args.layout.filter(item => item.containerUUID === uuid)[0].setItemDoDestroy(true);
      // this.args.layout.splice(this.args.layout.findIndex(item => item.containerUUID === uuid), 1);
      // this.childrenItems.splice(this.args.layout.findIndex(item => item.containerUUID === uuid), 1);
      // this.itemDomContainerReset();
      //FIXME: 改变layout数组会让item内部位置错乱，这里匹配UUID与ContainerUUID重新填入
      // this.FormRenderDelete();
      // this.$emit('deleteItemFromLayout')
    },
    //重设item与layout样式
    fillContainerResetLayout(identical) {
      this.$nextTick(() => {
        this.resetGridItem(identical);
        setTimeout(() => {
          this.resetLayoutHeight()
        }, 10)
      })
    },
    //重设item dom位置
    itemDomContainerReset() {
      this.$nextTick(() => {
        for (let item of this.args.layout) {
          let itemDom = this.$refs.layout.$el.querySelector(`[uuid='${item.containerUUID}']`);
          itemDom.style.display = 'initial';
          let itemDomContainer = this.$refs.layout.$el.querySelector(`[containeruuid='${item.containerUUID}']`);
          itemDomContainer.appendChild(itemDom);
        }
      })
    },
    simulationLayoutRender() {
      // this.args.layout.push({
      //   x: 0,
      //   y: 0,
      //   h: 0,
      //   w: 0,
      //   i: Math.max(...this.args.layout.map(x => parseInt(x.i))) + 1,
      //   isResizable: true,
      //   isResponsive: false,
      //   // containerUUID: '',
      //   showTitle: true,
      //   computedStyle: {
      //     'item': true
      //   },
      //   static: false,
      // });
      // this.refreshDOM = false;
      this.$nextTick(() => {
        this.$refs.layout.layoutUpdate();
      })
      // this.$refs.layout.responsiveGridLayout();
    },

    jsonDataChange(evt) {
      // this.$emit()
      for (let type in evt) {
        switch (type) {
          case 'added':
            if (evt.added.element.addin) {
              this.addin.elements.splice(evt.added.newIndex, 0, evt.added.element.addin);
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
              this.addin.elements.splice(evt.added.newIndex, 0, addin);
            }
            break;
          case 'removed':
            this.$emit('removeAddin', this.addin.self.uuid, evt.removed.element.uuid)
            break;
          default:
            break;
        }
      }
    },

    getArgsFormLayout(args){
      this.$emit('getArgsFormLayout', args);
    },

    activeAddinFormLayout(type, addin, uuid) {
      this.$emit('activeAddinFormLayout', type, addin, uuid);
    },

    showEditBox(type, addin){
      this.$emit("showEditBox", type, addin);
    },

    activeAddin(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },

    copyAddin(addin, parentUUID = this.addin.self.uuid) {
      if(parentUUID === this.addin.self.uuid){
        this.$emit('copyAddin', addin, parentUUID);
        this.$nextTick(() => {
          this.addItem(null, addin.self.uuid);
          this.$forceUpdate();
          this.refreshItemConfig(addin.self.properties, 'copy')
        })
      }else{
        this.$emit('copyAddin', addin, parentUUID);
      }
    },

    removeAddin(uuid, parentUUID = this.addin.self.uuid, index, deleteButton){
      if(parentUUID === this.addin.self.uuid){
        this.args.layout.splice(index, 1);
      }
      console.log(uuid, parentUUID, deleteButton)
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },

    deleteAddin() {
      this.$emit('deleteAddin');
    },

    commentAddin(addin) {
      this.$emit('commentAddin', addin);
    },

    onDragOver(event){
    },

    onDrop(event){
      if(this.formCanvas.dragItem === 'DragItem'){
        let addin = {
          self: {
            elementType: `addin_DragItem`,
            properties: {},
            dropTarget: 'dragLayout',
            uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
          },
          elements: [],
        }
        this.addin.elements.push(addin);
        this.addItem(event, addin);
        this.$emit('snapShotHistory');
      }
    },

    onDragStart(){

    }
  }
};
</script>

<style scoped>
section {
  width: 100%;
  height: auto;
  display: inline-block;
}

/* basic style for close button*/
.close {
  /* still bad on picking color */
  background: #00000033;
  color: #000000d1;
  /* make a round button */
  border-radius: 12px;
  /* center text */
  line-height: 20px;
  text-align: center;
  height: 20px;
  width: 20px;
  font-size: 18px;
  padding: 1px;
  cursor: pointer !important;
}

/* use cross as close button */
.close::before {
  content: "\2716";
}

/* place the button on top-right */
.close {
  top: -10px;
  right: -10px;
  position: absolute;
}
</style>

<style>
* {
  font-size: 14px;
}

/* basic style for close button*/
.drag_layout_close {
  /* still bad on picking color */
  background: #00000033;
  color: #000000d1;
  /* make a round button */
  border-radius: 12px;
  /* center text */
  line-height: 20px;
  text-align: center;
  height: 20px;
  width: 20px;
  font-size: 18px;
  padding: 1px;
  cursor: pointer !important;
}

/* use cross as close button */
.drag_layout_close::before {
  content: "\2716";
}

/* place the button on top-right */
.drag_layout_close {
  top: -10px;
  right: -10px;
  position: absolute;
}

.no-padding {
  padding: 0;
}

.flex-col-direction {
  display: flex;
  flex-direction: column;
}

.item-container {
  /*former name: flex-center*/
  display: inline-block;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
  height: calc(100% - 50px);
  position: relative;
}

.item {
  padding: 0;
  border: 1px solid rgba(0, 0, 0, .09);
  border-radius: 4px;
  transition: border .5s ease-out;
  box-shadow: 0 0 13px 0 rgba(62, 44, 90, .08)
}

.item-naive {
  padding: 0;
  border: 1px solid rgba(0, 0, 0, .09);
  border-radius: 4px;
}

.item-transparent {
  padding: 0;
  border: .5px dashed rgba(0, 0, 0, .09);
  border-radius: 0px;
  background: transparent;
}

.selected {
  padding: 0;
  border: 2px dashed red;
}

.item-opr-btn {
  background: #1dc9b7;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  margin-left: .3em;
  box-sizing: border-box;
  opacity: .8;
  position: relative;
}


.item-opr-btn:before {
  content: "";
  background: rgba(255, 255, 255, .2);
  width: 0%;
  height: 0%;
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 100%;
  transition: all .1s ease-in;
}

.item-opr-btn:hover:before {
  content: "";
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
}

.item-opr-btn:hover::after {
  content: "\2716";
  color: #ffffff;
  width: 70%;
  height: 70%;
  top: -80%;
  left: 15%;
  position: absolute;
}

div.item-header {
  flex: 0 0 3em;
  padding-left: 1em;
  font-size: .875em;
  color: #333;
  font-weight: 500;
  line-height: 3em;
  text-align: left;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, .07);
  border-radius: 4px 4px 0 0;
  top: 0px;
  width: 100%;
  display: flex;
}

.item-header-text {
  flex: 1;
  position: relative;
}

.item-btns {
  display: flex;
  align-items: center;
  margin-right: .6em;
}

.item-btns a {
  color: #515a6e;
}

.contain-addin-stretch {
  flex-grow: 1;
  height: 100% !important;
}

.drag-layout::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0);
}

.drag-layout::-webkit-scrollbar-track-piece {
  background-color: rgba(255, 255, 255, 0);
  -webkit-border-radius: 0;
}

.drag-layout::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.drag-layout::-webkit-scrollbar-thumb {
  height: 50px;
  background-color: rgba(255, 255, 255, 1);
  -webkit-border-radius: 4px;
  outline: 2px solid rgba(255, 255, 255, 0);
  outline-offset: -2px;
  border: 2px solid rgba(255, 255, 255, 0);
}

.drag-layout::-webkit-scrollbar-thumb:hover {
  height: 50px;
  background-color: rgba(255, 255, 255, 0);
  -webkit-border-radius: 4px;
}
</style>
