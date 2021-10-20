<template>
  <div
          :addinName="name"
          class="addin drag-layout"
          :style="layoutWarpperStyle(col_width, arg_height)"
          ref="main"
          v-show="!args.hided"
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
            :style="layoutStyle(arg_height, col_width)"
    >
      <grid-item
              v-if="refreshDOM"
              v-for="(item, index) in args.layout"
              v-show="dragAddinList[index] && !dragAddinList[index].self.properties.hided"
              :class="computed_style(item.style)"
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
              @click.native="onClick($event, item.i, 'item')"
              @mousemove.native="handleItemMouseMove($event)"
              @mousedown.native="handleItemMousedown($event, item.i)"
              @mouseup.native="handleItemMouseup($event, item.i)"
              @mouseleave.native="handleItemMouseleave($event, item.i)"
              :style="itemStyle(item.isResponsive, 'item')"
      >
        <FormAddinList
          v-if="dragAddinList[index]"
          :addin="dragAddinList[index]"
          v-bind="addinProps"
        >

        </FormAddinList>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
  import "@/styles/component/iconfont.css";
  import _ from 'lodash';
  import VueGridLayout from "vue-grid-layout";
  // import DragItem from "./DragItem";
  import Vue from 'vue';

  const name = "DragLayout";
  const layoutAddinNames = ['row', 'col', 'Tab', 'GroupBox', 'Panel', 'Grid', 'FormEngine', 'BarChart', 'Iframe'];
  export default {
    name: name,
    props: [
      'argsProps',
      'addin',
      'query',
      'store',
      'itemValue',
      'attributes',
      'relation',
      'route',
      'root',
      'Message',
      'echarts',
      'formEngine',
      'dwf_ctx',
    ],
    components: {
      GridLayout: VueGridLayout.GridLayout,
      GridItem: VueGridLayout.GridItem,
    },
    data() {
      return {
        name: name,

        // 展示模式
        t_preview: false,
        t_show: false,
        t_icon: true,
        t_edit: false,
        t_edit_item: false,
        t_edit_layout: false,

        dataTypes: [],
        // 编辑框rows
        args: {
          name: "",
          title: "拖拽池",
          id: "",
          _id: "0",
          hided: false,
          type: "flex",
          align: "middle",
          justify: "start",
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          basic_height: 20,
          height: 30,
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
          item_default_width: 16,
          item_default_height: 3
        },
        refreshDOM: true,
        itemSettings: {},

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
          "basic_height",
          "col"
        ],
        isMounted: false,
        timer: null,
        timeDone: false,
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
      'handleQueryData',
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
    },
    beforeDestroy(){
      // document.removeEventListener('mousemove', _.debounce(this.simulationLayoutRender, 1000));
      // document.removeEventListener('mouseup',  () => {
      //   this.simulationLayoutRender();
      // });
    },
    mounted() {
      this.$nextTick(() => {
        // this.updateAppendChild();
        // this.updateItemDragStart();
        setTimeout(() => {
          this.isMounted = true;
          for(let item of this.args.layout){
            this.resetGridItem(item.i)
          }
          this.simulationLayoutRender();
          // document.addEventListener('mousemove', _.debounce(this.simulationLayoutRender, 1000));
        },1000);

        // document.addEventListener('mouseup', () => {
        //   this.simulationLayoutRender();
        // });
      });
    },
    watch: {
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
      arg_basic_height() {
        return this.args.basic_height;
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
      //初始化控件props
      addinProps() {
        return {
          addin: this.addin,
          store: this.store,
          itemValue: this.itemValue,
          query: this.query,
          attributes: this.attributes,
          relation: this.relation,
          route: this.route,
          root: this.root,
          Message: this.Message,
          echarts: this.echarts,
          formEngine: this.formEngine,
          dwf_ctx: this.dwf_ctx
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
        let item = this.getRelativeCoordinate(event.clientX, event.clientY);
        item = {
          ...item,
          h: this.item_default_height,
          w: this.item_default_width,
          i: Math.max(...this.args.layout.map(x => parseInt(x.i))) + 1,
          isResizable: true,
          isResponsive: false,
          // containerUUID: addin.$el.getAttribute('UUID'),
          showTitle: true,
          computedStyle: {
            'item': true
          },
          setItemDoDestroy: addin.setItemDoDestroy,
          static: false,
        };
        item.i = item.i < 0 ? 0 : item.i;
        this.args.layout.push(item);
        this.$nextTick(() => {
          Array().forEach.call(this.$refs[`item${item.i}`][0].$el.childNodes, item =>{
            if(item.tagName === "SECTION"){
              item.remove()
            }
          });
          this.$refs[`item${item.i}`][0].$el.appendChild(addin.$el);
          addin.$data.args.identical = item.i;
          addin.$on('LayoutItemConfigChange', this.LayoutItemConfigChange);
        })
      },

      getRelativeCoordinate(clientX, clientY) {
        /**
         * FIXME:
         * 位置不准确
         */
        var formBoudingClientRect = document.querySelector("[addinname='GlobalForm']").getBoundingClientRect();
        var boundingClientRect = this.$refs.layout.$el.getBoundingClientRect();
        let relaX = clientX - boundingClientRect.left;
        let relaY = clientY - boundingClientRect.top;
        let totalWidth = boundingClientRect.right - boundingClientRect.left;
        relaX = Math.floor((relaX * this.args.col_nums) / totalWidth);
        relaY = Math.floor(relaY / this.args.row_height);
        relaY = relaY > 2 ? relaY - 2 : relaY;
        return {x: relaX, y: relaY};
      },

      getAddinFillItem(event) {
        let relativeCoordiantion = this.getRelativeCoordinate(event.clientX, event.clientY);
        let dropItemIndex = this.getDropItem(relativeCoordiantion.x, relativeCoordiantion.y);
        return dropItemIndex;
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

      closeItem(event, index) {
        event.stopPropagation();
        event.preventDefault();
        this.onClick(event, index, 'item');
        this.t_edit_item = false;
        this.$Modal.confirm({
          title: "删除确认拖拽块",
          content: "<p>是否确认删除拖拽块</p>",
          okText: "确认",
          cancelText: "取消",
          onOk: async () => {
            console.log("identical@closeItem", index);
            this.$emit("hideEditBox");
            /**
             * index: 需要删除的item的identical的值
             * toDeleteIndex: 需要删除的item在args中的序号
             */
              // console.log("this.args.layout@closeItem", this.args.layout);
              // console.log("this.$refs.layout.$children@closeItem", this.$refs.layout.$children);
            let toDeleteIndex = this.args.layout.map(x => parseInt(x.i)).indexOf(parseInt(index));
            let deleteDOM = this.getItemDOM(index);
            // TODO: app端不关心数据层的变化 所以可以直接在DOM层面做删除 但是Layout所用库本身必须处理'隐藏块'的问题
            // if (deleteDOM.children['container'].children.length>0){
            //   this.$Message.error("请先移出框内控件");
            //   return;
            // }
            deleteDOM.parentElement.removeChild(deleteDOM);
            this.args.layout[toDeleteIndex].deleted = true;
            // TODO: 删除form_render中的相关配置
            console.log("this.args.layout@closeItem", this.args.layout);
            console.log("this.$refs.layout.$children@closeItem", this.$refs.layout.$children);
            this.selected_item_index = -1;
            this.doRefreshDOM();
            return;
          },
          onCancel: () => {
            return;
          }
        });
      },
      rowRefresh(id, args, flag) {
      },

      refresh(args) {
      },

      onClick(e, id, tp) {
      },

      clickOnEdit() {
        console.log("clickOnEdit");
        this.refreshItemConfig();
      },

      refreshItemConfig() {
        /**
         * FIXME:
         * 现有的同步过程比较繁琐
         * 每增加一个新的控制变量
         * 要增加 onClick\this.data 2个地方
         */
          // this.data 中的变量名与 layout 中的不同 需要根据ref_dic转换
        let ref_dic = {
            "item_draggable": "isDraggable",
            "item_resizable": "isResizable",
            "item_static": "static",
            "item_show_title": "showTitle",
            "item_responsive": "isResponsive",
            "item_title": "title"
          }
        let selected_item = this.args.layout[this.selected_item_index];
        for (let attr of this.controller_attributes) {
          selected_item[ref_dic[attr]] = this.$data[attr];
        }
        this.$set(this.args.layout, this.selected_item_index, selected_item);
        console.log("layout[index]@refreshItemConfig", this.args.layout[this.selected_item_index]);
        this.doRefreshDOM();
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

      // 获取表单项名
      getFormName() {
        return this.args.name;
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

      getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },

      getName() {
        return name;
      },

      setDisplayType(type) {
        return this;
      },

      getDataType(args) {
        return this.args.dataTypes;
      },

      updateAppendChild() {
        // 更新每个Item.children['container']的appendChild 使得布局控件可以伸展而普通控件不变
        let items = this.$refs.main.querySelectorAll(".item, .item-naive, .item-transparent");
        for (let i = 0; i < items.length; i++) {
          let _appendChild = items[i].children['container'].__proto__.appendChild;
          items[i].children['container'].appendChild = function () {
            console.log('newAppendChild');
            let addinName = arguments[0].getAttribute("addinname");
            if (['row', 'col', 'Tab', 'GroupBox', 'Panel'].includes(addinName)) {
              arguments[0].classList.add('contain-addin-stretch');
            }
            return _appendChild.apply(this, arguments);
          }
        }
      },
      /**
       * reset layout height按照高度与位置和最大item计算
       */
      resetLayoutHeight(){
        let that = this;
        setTimeout(() => {
          if(this.args.layout.length !== 0){
            let height = (_.max(this.args.layout.map(item => parseInt(item.h + item.y))) * 40) + 60 + 'px';
            this.$refs['layout'].$el.style.height = height;
          }
        }, 0)
      },
      layoutWarpperStyle(width, height) {
        switch (height) {
          case 'initial':
            return {
              'height': 'initial',
              'width': width,
              'padding': '15px',
              'font-size': '14px',
              'display': 'inline-block',
              // 'overflow-x': 'auto'
            };
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
      layoutStyle(height, width) {
        switch (height) {
          case 'initial':
            return {
              'width': '100%',
              'min-height': '30px',
              'display':' inline-block',
            }
            break;
          default:
            return {
              'width': '100%',
              'min-height': '30px',
            }
            break;
        }
      },
      /**
       * item-class
       */
      computed_style(set_style) {
        // 根据对iten设置的style来确定具体class内容
        let standard_class = [
          "no-padding",
          "flex-col-direction"
        ]
        sessionStorage.getItem('skinStyle') === 'dark' && sessionStorage.getItem('appMenu') ? standard_class.push("item-dark") : '';

        switch (set_style) {
          case "classic":
            standard_class.push("item");
            break;
          case "naive":
            standard_class.push("item-naive");
            break;
          case "transparent":
            standard_class.push("item-transparent");
            break;
          default:
            standard_class.push("item");
            break;
        }
        return standard_class.join(" ");
      },
      itemHeader() {
        return sessionStorage.getItem('skinStyle') === 'dark' && sessionStorage.getItem('appMenu') ? 'item-header-border-dark' : '';
      },
      itemStyle(response, type) {
        let style = {};
        switch (type) {
          case "item":
            style = response ? {
              'height': 'auto',
              'width': 'auto'
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
       */
      resetGridItem(itemIndex) {
        if(this.args.layout.length === 0 || itemIndex == null){
          return false;
        }
        if(this.args.layout.filter(item => item.i == itemIndex).length !== 0 && this.args.layout.filter(item => item.i == itemIndex)[0].isResponsive){
          this.hasResponsiveItem = true;
          let layoutWidth = this.$refs.layout.$el.offsetWidth - 12;
          let w = Math.ceil(this.$refs[`item${itemIndex}`][0].$el.offsetWidth * this.args.col_nums / layoutWidth) + 1;
          let h = Math.floor((this.$refs[`item${itemIndex}`][0].$el.offsetHeight) / this.args.row_height);
          !isNaN(w)
            ? this.args.layout.filter(item => item.i == itemIndex)[0].w = w : '';
          !isNaN(h)
            ? this.args.layout.filter(item => item.i == itemIndex)[0].h = h : '';
        }
      },

      resetAllGridItem(){
        for(let item of this.args.layout){
          this.resetGridItem(item.i)
        }
        if(this.hasResponsiveItem){
          this.resetLayoutHeight();
        }
      },

      handleItemResize(i, newH, newW, newHPx, newWPx) {
        // this.resetGridItem(i)
      },
      handleItemResized(i, newH, newW, newHPx, newWPx) {
        this.isMounted && this.resetGridItem(i);
      },
      handleItemMousedown(event, itemIndex) {
        let item = this.args.layout.filter(item => item.i === itemIndex)[0];
        let staticTag = ['INPUT', 'TEXTAREA', 'SELECT'];
        if ((Array().indexOf.call(event.target.classList, 'ql-editor') !== -1 || Array().indexOf.call(event.target.parentNode.classList, 'ql-editor') !== -1 || staticTag.indexOf(event.target.tagName) !== -1) && !item.static) {
          // event.stopPropagation();
          // event.preventDefault();
          this.args.layout.filter(item => item.i === itemIndex)[0].prevStatic = item.static;
          this.args.layout.filter(item => item.i === itemIndex)[0].static = true;
        }
        // else{
        //   this.resetGridItem(itemIndex)
        // }
      },
      handleItemMouseup(event, itemIndex) {
        let item = this.args.layout.filter(item => item.i === itemIndex)[0];
        if ('prevStatic' in item) {
          item.static = item.prevStatic;
          delete item.prevStatic;
        }
        setTimeout(() => {
          this.resetGridItem(itemIndex)
        }, 10)
      },
      handleItemMouseMove(event){

        // timer: null,
        //   timeDone: false,
        try {

        }catch (e) {

        }
      },
      handleItemMouseleave(event, itemIndex){
        try {
        }catch (e) {

        }
      },
      deleteItem: function (uuid) {
        // this.args.layout.splice(this.args.layout.findIndex(item => item.containerUUID === uuid), 1);
      },
      simulationLayoutRender(h = 0, w = 0){
        // this.args.layout.push({
        //   x: 0,
        //   y: 0,
        //   h: h,
        //   w: w,
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
        // this.$nextTick(() => {
        //   setTimeout(() => {
        //     this.args.layout.pop();
        //   }, 30)
        // })

        this.$nextTick(() => {
          this.$refs.layout.layoutUpdate();
        })
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
    height:calc(100% - 50px);
    position: relative;
  }

  .item {
    padding: 0;
    border: 1px solid rgba(0, 0, 0, .09);
    border-radius: 4px;
    transition: border .5s ease-out;
    box-shadow: 0 0 13px 0 rgba(62, 44, 90, .08)
  }

  .item-dark.item {
    background: inherit;
  }

  .item-naive {
    padding: 0;
    border: 1px solid rgba(0, 0, 0, .09);
    border-radius: 4px;
  }

  .item-transparent {
    padding: 0;
    border: 0px dashed rgba(0, 0, 0, .09);
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

  .item-transparent .item-header {
    background: transparent;
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

  .item-dark div.item-header {
    background: inherit;
    border-bottom: 1px solid rgba(63, 100, 139, 0.7);
  }

  .item-header-text {
    flex: 1;
    position: relative;
  }

  .item-dark .item-header-text {
    color: #fff
  }

  .item-dark {
    border: 1px solid rgba(63, 100, 139, 1);
  }

  div.item-header.item-header-border-dark {
    border-bottom: 1px solid rgba(63, 100, 139, 1);
  }

  div.item-header.item-header-border-dark i {
    color: #fff;
  }

  .item-btns {
    display: flex;
    align-items: center;
    margin-right: .6em;
  }

  .item-btns a {
    color: #515a6e;
  }

  .item-btns a .ivu-icon {
    font-size: 18px;
  }

  .contain-addin-stretch {
    flex-grow: 1;
    height: 100% !important;
  }

  .drag-layout::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0);
  }
  .drag-layout::-webkit-scrollbar-track-piece{
    background-color:rgba(255, 255, 255, 0) ;
    -webkit-border-radius:0;
  }
  .drag-layout::-webkit-scrollbar{
    width:8px;
    height:8px;
  }
  .drag-layout::-webkit-scrollbar-thumb{
    height:50px;
    background-color:rgba(255, 255, 255, 1);
    -webkit-border-radius:4px;
    outline:2px solid rgba(255, 255, 255, 0) ;
    outline-offset:-2px;
    border: 2px solid rgba(255, 255, 255, 0) ;
  }
  .drag-layout::-webkit-scrollbar-thumb:hover{
    height:50px;
    background-color:rgba(255, 255, 255, 0);
    -webkit-border-radius:4px;
  }
  .vue-grid-item>.vue-resizable-handle{
    z-index: 9;
  }
</style>
