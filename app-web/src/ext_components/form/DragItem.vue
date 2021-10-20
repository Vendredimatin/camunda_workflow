<template>
  <!-- 输入框 -->
  <section :addinName="name"
           v-if="!doDestroy" :style="itemContainerStyle" ref="main" style="height: 100%;"
           dropTarget="dragItem">
    <div v-if="args.showTitle" class="item-header">
      <!-- {{item.x+","}}{{item.y}} -->
      <h2 class="item-header-text self-color" style="font-size: 1.5em; line-height: 2;" :style="itemTitleStyle">{{args.dragTitle}}</h2>
      <div class="item-btns">
        <!--
        <a class="item-opr-btn"></a>
        <a class="item-opr-btn" style="background: #ffc241;"></a>
        -->
        <a class="" style="" href="javascript:void(0)" @click="deleteItem">
          <Icon type="ios-close self-color" title="关闭"/>
        </a>
      </div>
    </div>
    <div ref="container" class="drag-item-container item-container no-padding" @resize="handleResize">
      <FormAddinList
        v-for="addinChildren in addin.elements"
        :key="addinChildren.self.uuid"
        :addin="addinChildren"
        v-bind="addinProps"
      >

      </FormAddinList>
    </div>
  </section>
</template>

<script>
  import _global from '@/views/global.vue'
  import '@/styles/component/iconfont.css'

  const name = "DragItem";
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
      // EditBox: EditBox,
    },
    data() {
      return {
        name: name,

        // 展示模式
        t_preview: false,
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
        args: {
          title: "",
          dragTitle: "标题一",
          id: "",
          _id: "0",
          type: "flex",
          hided: false,
          identical: '',
          parentLayout: '',
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          basic_height: 20,
          isDraggable: true,
          isResizable: true,
          isResponsive: false,
          static: false,
          showTitle: true,
          titleFontSize: 14,
          titleFontSizeType: 'px',
          titleFontColor: 'inherit',
          justify: "center",
          align: "middle",

          imgOrigin: 'imgSelf',
          back_color: "#fff",             // 背景颜色
          back_picture: "",           // 背景图片,超链接
          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,

          /**
           * relativeOffs:[
           *  { uuid:, addinname:, horizonOff:, verticalOff: }
           * ]
           */
          relativeOffs: [],
          style: "",
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
      }
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

      this.baseUrl = _global.baseUrl;
      // let that = this;
      // if (this.attributes) {
      //   if (this.relation) {
      //     this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
      //     this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
      //     this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
      //   } else {
      //     this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
      //   }
      // }
      // if (this.Message && !this.$Message) this.$Message = this.Message;
    },
    // 生命周期函数，在dom元素生成之后调用
    beforeDestroy() {
      document.removeEventListener('mousedown', this.mousedown);
      document.removeEventListener('mouseup', this.mouseup);
    },
    mounted() {
      this.$nextTick(() => {
        this.initItemTransform();
        this.applyRelativeOffsOnItem();
      });
      document.addEventListener('mousedown', this.mousedown);
      document.addEventListener('mouseup', this.mouseup);
      // for (let _addin_index = 0; _addin_index < item.children['container'].children.length; _addin_index++) {
      //   let addin = item.children['container'].children[_addin_index];
      //   if (layoutAddinNames.includes(addin.getAttribute("addinname"))) {
      //     addin.classList.add('contain-addin-stretch')
      //     addin.style.width = "auto";
      //   }
      // }
      //
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
      },
      'args.hided'(val){
        // let parentLayout = this.GetAddinById(this.itemValue.data, this.args.parentLayout);
        // if(!parentLayout){
        //   // parentLayout = document.querySelector(`[uuid='${this.args.parentUUID}']`);
        //   // debugger
        // }else{
        //   parentLayout.$data.args.layout.forEach(item => {
        //     if(item.i === this.args.identical){
        //       item.hided = val
        //     };
        //   })
        // }
        if(val){
          this.$el.parentNode.style.display = 'none'
        }else{
          this.$el.parentNode.style.display = 'block'
        }
      }
    },
    computed: {
      arg_bgPic() {
        let finalBg = '';
        if(this.args.imgOrigin == 'imgSelf') {
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
      itemContainerStyle(){
        return !this.args.isResponsive ? {
          'overflow': 'auto',
          'backgroundImage': this.arg_bgPic,
          'backgroundSize': this.args.bgSize,
          'backgroundRepeat': this.args.bgRepeat,
          'backgroundColor': this.args.back_color
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
    },
    methods: {
      /**
       *  *********************************************system methods***********************************************
       */
      mousedown(e){
        if(!this.$refs.main){
          return
        }
        this.offsetheight = this.$refs.main.offsetHeight;
      },
      mouseup(e){
        if(!this.$refs.main){
          return
        }
        if(this.$refs.main.offsetHeight !== this.offsetheight){
          let parentLayout = this.GetAddinById(this.itemValue.data, this.args.parentLayout);
          if(!parentLayout){
            // parentLayout = document.querySelector(`[uuid='${this.args.parentUUID}']`);
            // debugger
          }else{
            parentLayout.simulationLayoutRender(12, 0);
          }
        }
      },
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
        if(this.args.back_color == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.back_color = 'transparent';
        return this;
      },

      // 获取表单项名
      getFormName() {
        return null;
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
      fillAddin(event, el) {
        // TODO: 直接用event中path的最后一个元素加入是准确的 但这样意味着相对位置计算的方法有问题
        var path = event.path || (event.composedPath && event.composedPath());
        if (!path) throw 'Your borwser dont support for event.composedPath.';
        let dropItem = path[0];
        // if (dropItem.getAttribute('addinname') != "DragItem") {
        //   this.$Message.error("请拖拽到方块中");
        //   return false;
        // }
        //
        this.$refs['container'].appendChild(el);
        this.updateContainOffs('add', el);
        return dropItem;
      },

      updateContainOffs(type, el) {
        let exsisted_offs = [];
        let children = this.$refs['container'].children;
        this.contained_selected_uuid = "";
        switch (type) {
          case 'all':
            Array().forEach.call(children, child => {
              exsisted_offs.concat(this.args.contain_offs.filter(item => item.uuid === child.getAttribute("uuid")).length !== 0);
            });
            this.args.contain_offs = exsisted_offs;
            break;
          case 'add':
            Array().forEach.call(children, child => {
              exsisted_offs.concat(this.args.contain_offs.filter(item => item.uuid === child.getAttribute("uuid")).length !== 0);
            });
            exsisted_offs.push({
              "uuid": el.getAttribute("uuid"),
              "addinname": el.getAttribute("addinname"),
              "horizonOff": 0,
              "verticalOff": 0
            });
            this.args.contain_offs = exsisted_offs;
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

      initItemTransform() {
        setTimeout(() => {
          this.$refs.main && this.$refs.main.classList.add('transform-0');
        }, 100)
      },
      applyRelativeOffsOnItem() {
        if(this.args.contain_offs.length !== 0 ){
          // 把 this.args.contain_offs 配置应用到 itemDOM 中的控件里
          for (let offSet of this.args.contain_offs) {
            let targetAddins = this.addin.elements.filter(element => element.self.uuid === offSet.uuid)
            if (targetAddins.length < 1) continue;
            this.modifyItemOff(targetAddins[0].obj.$el, offSet);
          }
        }
      },

      modifyItemOff(itemDOM, offSet) {
        if (offSet.horizonOff == 0 && offSet.verticalOff == 0) return;
        itemDOM.style.position = "absolute";
        itemDOM.style.left = offSet.horizonOff + "%";
        itemDOM.style.top = offSet.verticalOff + "%";
        // 默认布局控件脱离布局后仍未100%宽度
        // if (layoutAddinNames.includes(itemDOM.getAttribute("addinname"))) itemDOM.style.minWidth = "100%";
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
        let selectedAddin = this.$refs.main.querySelector("[uuid='" + this.contained_selected_uuid + "']");
        if (this.contained_horizon_off == 0 && this.contained_vertical_off == 0) {
          //TODO: 还原偏移到0
          selectedAddin.style.position = "static";
          selectedAddin.style.left = "0%";
          selectedAddin.style.top = "0%";
          // if (layoutAddinNames.includes(selectedAddin.getAttribute("addinname"))) selectedAddin.style.minWidth = "";
          return;
        }
        selectedAddin.style.position = "absolute";
        selectedAddin.style.left = this.contained_horizon_off + "%";
        selectedAddin.style.top = this.contained_vertical_off + "%";
        // 默认布局控件脱离布局后仍未100%宽度
        // if (layoutAddinNames.includes(selectedAddin.getAttribute("addinname"))) selectedAddin.style.minWidth = "100%";
      },
      itemConfigChange() {
        this.$emit('LayoutItemConfigChange', this.args);
      },
      setItemDoDestroy(flag) {
        this.doDestroy = flag;
        return this.$el;
      },
      //删除拖拽块
      deleteItem(){
        // this.doDestroy = true;
        // this.$emit('DeleteItem', this.$el.getAttribute('uuid'));
        // this.$destroy();
        // document.querySelector(`[containeruuid="${this.$el.getAttribute('uuid')}"]`).style.display = 'none';
        this.$el.parentNode.style.display = 'none'

      },

      handleResize(event){
        console.log(event)
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

  .transform-0 {
    /*transform: translate3d(0, 0, 0);*/
  }

  .vue-resizable-handle {
    z-index: 9
  }
</style>
