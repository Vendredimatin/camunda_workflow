<template>
  <Col
    v-if="t_preview" :addinName="name"
    ref="main"
    :span="args.span"
    :offset="args.offset"
    :push="args.push"
    :pull="args.pull"
    :style="{'width': arg_width,
        'backgroundImage': arg_bgPic,
        'backgroundSize': args.bgSize,
        'backgroundRepeat': args.bgRepeat,
        'backgroundColor': args.back_color,
        'border': '1px dashed #bbb',
        'borderRadius': args_radius,
        'float': 'left'}"
    class="addin addin-col actPc addin-layout">
    <div>
      <Row
        v-for="(row, index) in args.children"
        :type="row.type"
        :align="row.align"
        :justify="row.justify"
        :key="index"
        :dropTarget="row.id"
        class="addin-col-row"
        :class="[index === 0 ? `marginTop0` : '', activeRow === row.id && activeUUID === args.uuid ? 'selected' : '']"
        addin="layout"
        :style="{ 'margin-top': args.rowMargin + 'px' }"
        @click.native.stop="onClick(row.id)"
      >
        <RowPaneComponent
          :row="row"
          :addinProps="addinProps"
          :basicArgs="basicArgs"
          :addin="rowAddinList[index]"
          :originAddin="addin"
          :ref="`Pane${index}`"
          :style="{'min-height': arg_height}"
          @activeAddin="activeAddin"
          @copyAddin="copyAddin"
          @removeAddin="removeAddin"
          @deleteAddin="deleteAddin"
          @commentAddin="commentAddin"
          @layoutSelfDrag="() => { $emit('layoutSelfDrag') }"
          @snapShotHistory="() => { $emit('snapShotHistory') }"
        >

        </RowPaneComponent>
      </Row>
    </div>

    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args">
        <div slot="attribute">
          <p class="margin1">默认行数</p>
          <InputNumber class="margin1" ref="g_col" :min="1" v-model="args.rows"
                       style="display: inline-block; width: 100%"/>
          <p class="margin1">行间距</p>
          <InputNumber class="margin1" :min="0" v-model="args.rowMargin"
                       style="display: inline-block; width: 100%"/>
          <p class="margin1">左侧间隔</p>
          <InputNumber class="margin1" :min="0" v-model="args.offset"
                       style="display: inline-block; width: 100%"/>
          <p>向右移动格数</p>
          <InputNumber class="margin1" :min="0" v-model="args.push"
                       style="display: inline-block; width: 100%"/>
          <p>向左移动格数</p>
          <InputNumber class="margin1" :min="0" v-model="args.pull"
                       style="display: inline-block; width: 100%"/>
          <p class="margin1">圆角属性</p>
          <Input class="margin1" number v-model="args.radius">
              <Select v-model="args.radiusType" slot="append" style="width: 50px;">
                  <Option value="%">%</Option>
                  <Option value="px">px</Option>
              </Select>
          </Input>
        </div>
        <div slot="layout">
          <div class="margin1">
            边框
            <i-switch style="float: right" v-model="args.layoutBorder.show"/>
          </div>
        </div>
      </EditBox>
    </span>

    <span v-show="t_edit_row" ref="edit_row">
      <EditBox v-if="actEdit" :addinName="name" v-model="c_row">
        <div slot="attribute">
          <p class="margin1">布局模式</p>
          <Select class="margin1" v-model="c_row.type">
<!--              <Option value="">无</Option>-->
              <Option value="flex">flex</Option>
          </Select>
          <p class="margin1">垂直对齐模式</p>
          <Select class="margin1" v-model="c_row.align">
              <Option value="top">顶部对齐</Option>
              <Option value="middle">居中对齐</Option>
              <Option value="bottom">底部对齐</Option>
          </Select>
          <p class="margin1">水平排列方式</p>
          <Select class="margin1" v-model="c_row.justify">
              <Option value="start">向左排列</Option>
              <Option value="end">向右排列</Option>
              <Option value="center">居中排列</Option>
              <Option value="space-around">等宽排列</Option>
              <Option value="space-between">分散排列</Option>
          </Select>
        </div>
    </EditBox>
    </span>

  </Col>
  <section v-else-if="t_icon" :addinName="name" style="text-align: center">
    <div class="form-addin-icon">
      <i class="iconfont">&#xe6a9;</i>
    </div>
    <div class="form-addin-name" style="width: 100%">多行</div>
  </section>
</template>

<script>
import _global from '@/views/global.vue'
import EditBox from './_EditBox.vue';
import {getFilesById} from "@/api/others";
import '@/styles/component/iconfont.css';
import noBg from '@/assets/images/nobg.png';
import {uuid} from "@/util/assist";
import RowPaneComponent from "@/ext_components/form/RowPaneComponent";

const name = 'colRows';
export default {
  name: name,
  props: [
    'addin',
    'argsProps',
    'basicArgs',
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
    'formCanvas',
  ],
  components: {
    EditBox,
    RowPaneComponent,
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

      // 支持的数据类型
      dataTypes: [],

      baseUrl: '',
      noBgFlag: false,              // 背景图片源是否在资料库已被删除

      // 属性配置项,按需设置

      actEdit: false,
      args: {
        id: "",                     // 控件代号,一般为必须
        height: 30,                 // 整体高度
        width: 100,                // 整体宽度,单位为%或者px
        widthType: "%",             // 整体宽度的单位
        heightType: "px",           // 整体高度的单位
        hided: false,

        g_align: 0,                 // 元素之间的对齐方式
        imgOrigin: 'imgSelf',
        back_color: "",             // 背景颜色
        back_picture: "",           // 背景图片,超链接
        bgStyle: 'cover',           // 背景图片显示方式
        bgSize: 'cover',
        bgRepeat: 'no-repeat',
        bgPercent: 100,
        border: true,               // 是否显示开关边框
        radius: '',                  // 圆角值
        radiusType: '%',

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        layout: true,               // 表示自己是布局空间(即不需要目标属性)
        title: "多行",               // 插件中文名,需要填入默认值

          span: 8,
          rowMargin: 10,
          offset: 0,
          push: 0,
          pull: 0,

        type: "flex",
        align: "middle",
        justify: "start",
        layoutBorder: {
          color: '#000',
          type: 'solid',
          width: '1px',
          show: false,
        },
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        picActIndex: -1,
        children: [{
          title: "行",
          id: "1,1",
          type: "flex",
          align: "middle",
          justify: "start",
          hideWidgetAnnotation: true,
        }, {
          title: "行",
          id: "1,2",
          type: "flex",
          align: "middle",
          justify: "start",
          hideWidgetAnnotation: true,
        }, {
          title: "行",
          id: "1,3",
          type: "flex",
          align: "middle",
          justify: "start",
          hideWidgetAnnotation: true,
        }
        ],
        rows: 3,
      },
      node: null,
      timer: null,
      // 继承属性
      // inherit: ["label_width", "main_width", "main_align", "label_align", "basic_height", "col"],
      inherit: [],
      c_row: {
        title: "行",
        id: "",
        type: "flex",
        align: "middle",
        justify: "start",
        hideWidgetAnnotation: true,
      },
      activeRow: '',
    }
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
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
  mounted() {
    this.$nextTick(() => {
      let that = this;
      this.timer = setInterval(() => {
        that.node = that.GetJsonById(that.itemValue.data, that.args.id);
        if (that.node) {
          console.log("node:", that.node);
          clearInterval(that.timer);
          that.timer = null;
        }
      }, 100);
      if (this.$refs.main && this.$refs.main.$el && this.$refs.main.$el.getAttribute("UUID")) {
        this.uuid = this.$refs.main.$el.getAttribute("UUID");
      }
    })
  },
  computed: {

    arg_width() {
      return this.args.width + this.args.widthType;
    },

    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },

    args_radius() {
      return this.args.radius + this.args.radiusType;
    },

    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + " !important";
    },
    args_lfcolor() {
      return this.args.label_fontColor;
    },
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + " !important";
    },
    args_fcolor() {
      return this.args.txt_fontColor;
    },
    arg_bgPic() {

      let finalBg = '';
      if (this.args.imgOrigin == 'imgSelf') {
        finalBg = `url(${this.args.back_picture})`
      } else {

        // 判断原有背景图片是否已被删除
        if (this.args.back_picture != '') {

          getFilesById(this.args.back_picture).then(response => {

            this.noBgFlag = !response.success;

          }).catch(e => {
            this.noBgFlag = true;
            console.log(e);
          });

        }

        if (this.args.back_picture == '') {
          finalBg = '';
        } else {
          if (this.noBgFlag) {
            finalBg = `url(${noBg})`
          } else {
            finalBg = `url(${this.baseUrl}/files-download/${this.args.back_picture})`
          }
        }
      }
      return finalBg;

    },
    args_label_width() {
      return this.args.label_width;
    },
    args_main_width() {
      return this.args.main_width;
    },
    args_label_align() {
      return this.args.label_align;
    },
    args_main_align() {
      return this.args.main_align;
    },
    showPercentNumber() {
      return this.args.bgStyle == 'percentage' ? true : false;
    },
    rowMargin(){
      return `marginTop0`;
    },
    //初始化控件props
    addinProps() {
      return {
        store: this.store,
        activeUUID: this.activeUUID,
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
    rowAddinList(){
      let rowAddinList = [];
      this.args.children.forEach((row, index) => {
        rowAddinList[index] = this.addin.elements.filter(addin => addin.self.dropTarget === row.id)
      })
      return rowAddinList;
    },
  },
  methods: {
    refreshFormAddinList(){
      this.args.children.forEach((tab, index) => {
        this.$refs[`Pane${index}`][0].refreshFormAddinList();
      })
    },

    getAllow(dropTarget) {
      return [];
    },

    getInherit(dropTarget) {
      var res = {};
      let that = this;
      this.inherit.forEach(x => res[x] = that.args[x]);
      return res;
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("name" in args) this.args_name = this.args.name;
      if (!('layoutBorder' in args)) {
        this.args.layoutBorder = {
          color: '#000',
          type: 'solid',
          width: '1px',
          show: false,
        }
      }
      return this;
    },

    // 设置背景图片
    drawBg() {

    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    getEditBoxComponent() {
      return this.$refs.editbox;
    },

    getEditBox(args) {
      if (!args) {
        this.t_edit = true;
        return this.$refs.edit;
      } else if (args == "row") {
        this.t_edit_row = true;
        return this.$refs.edit_row;
      }
    },

    getName() {
      return name;
    },

    setDisplayType(type) {
      this.t_preview = false;
      this.t_icon = false;
      if (type == 0) this.t_preview = true;
      else this.t_icon = true;
      return this;
    },

    getDataType(args) {
      return this.dataTypes;
    },

    /**
     * @description点击行逻辑
     */
    onClick(id) {
      this.activeRow = id;
      this.c_row = {};
      this.$nextTick(() => {
        this.c_row = this.args.children.find(row => row.id === id);
      })
      this.$emit('activeAddin', 'row');
      this.$emit("showEditBox", 'row', this);
    },

    activeAddin(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },

    copyAddin(addin, parentUUID = this.addin.self.uuid) {
      this.$emit('copyAddin', addin, parentUUID);
    },

    removeAddin(uuid, parentUUID = this.addin.self.uuid, deleteButton){
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },

    deleteAddin() {
      this.$emit('deleteAddin');
    },

    commentAddin(addin) {
      this.$emit('commentAddin', addin);
    },
  },
  watch: {
    args_lfsize(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("lfsize" in x.self.properties) {
          x.self.properties.lfsize = this.args.lfsize;
          x.self.properties.lfsizeType = this.args.lfsizeType;
        }
      })
    },
    args_lfcolor(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("label_fontColor" in x.self.properties) {
          x.self.properties.label_fontColor = this.args.label_fontColor;
        }
      })
    },
    args_fsize(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("fsize" in x.self.properties) {
          x.self.properties.fsize = this.args.fsize;
          x.self.properties.fsizeType = this.args.fsizeType;
        }
      })
    },
    args_fcolor(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("txt_fontColor" in x.self.properties) {
          x.self.properties.txt_fontColor = this.args.txt_fontColor;
        }
      })
    },
    args_label_width(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("label_width" in x.self.properties) {
          x.self.properties.label_width = this.args.label_width;
        }
      })
    },
    args_main_width(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("main_width" in x.self.properties) {
          x.self.properties.main_width = this.args.main_width;
        }
      })
    },
    args_label_align(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("label_align" in x.self.properties) {
          x.self.properties.label_align = this.args.label_align;
        }
      })
    },
    args_main_align(val) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if ("main_align" in x.self.properties) {
          x.self.properties.main_align = this.args.main_align;
        }
      })
    },
    /**
     * @description增加删除行逻辑
     */
    'args.rows': {
      handler(newVal, oldVal) {
        if (this.args.children && newVal < this.args.children.length) {
          // let update = [];
          // this.$el.querySelectorAll('.addin-col-row').forEach((row, index) => {
          //   row.children.length !== 0 ? update.push(`1,${index + 1}`) : '';
          // });
          // let length = this.args.children.length;
          // let popActive = true;
          //
          //
          // for (let rowIndex = newVal + 1; rowIndex <= length; rowIndex++) {
          //   let removeCol = `1,${rowIndex}`;
          //   if (update.indexOf(removeCol) !== -1) {
          //     this.$Message.error("请先移除溢出单元格中的控件");
          //     this.$nextTick(() => {
          //       this.args.rows = length
          //     })
          //     popActive = false;
          //     return;
          //   }
          // }
          // if (popActive) {
          //   // this.args.children.splice(newVal - 1, length - newVal );
          //   this.args.children.splice(newVal, length - newVal);
          // }

          //列中是否有元素，有为true
          let checkRow = false;
          for(let i = oldVal; i > newVal; i--){
            checkRow = this.rowAddinList[i - 1].length !== 0 || checkRow;
          }
          if(checkRow){
            this.$Message.error("请先移除溢出单元格中的控件");
            this.$nextTick(() => {
              this.args.rows = oldVal;
            })
          }else{
            this.args.children.splice(newVal, oldVal - newVal);
          }
        } else if (newVal > this.args.children.length) {
          for (let rowIndex = this.args.children.length + 1; rowIndex <= newVal; rowIndex++) {
            let row = `1,${rowIndex}`;
            this.args.children.push({
              title: "行",
              id: row,
              type: "flex",
              align: "middle",
              justify: "start",
              hideWidgetAnnotation: true,
            })
          }
        }
      },
      deep: true,
    }
  }
}
</script>

<style>
.addin-col-row {
  border: 1px dashed #000;
}

.addin-col-row.selected {
  border: 2px dashed red;
}

  .addin-col-row.marginTop0{
    margin-top: 0px!important;
  }

</style>
<style scoped>
section {
  width: 100%;
  height: auto;
  display: inline-block;
}

</style>
