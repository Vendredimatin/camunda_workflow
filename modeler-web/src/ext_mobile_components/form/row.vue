<template>
  <div
    v-if="t_preview"
    :addinName="name"
    class="addin addin-row"
    style="padding: 5px; clear: left;"
    :style="{'width': colWidth}"
    ref="main"
  >
    <van-row
      v-for="rs in args.iRows"
      :key="rs.id"
      class="addinR"
      ref="row"
      :type="args.children[rs.id].type"
      :align="args.children[rs.id].align"
      :justify="args.children[rs.id].justify"
      :style="{
        'width': '100%',
        'backgroundImage': arg_bgPic,
        'backgroundSize': args.bgSize,
        'backgroundRepeat': args.bgRepeat,
        'backgroundColor': args.back_color,
      }"
    >
      <van-col
        v-for="(cs, index) in args.iCols[rs.id]"
        :key="cs.id"
        addin="layout"
        :class="[activeCol === cs.id && activeUUID === args.uuid ? 'selected' : '', colClass(rs.id, index)]"
        :dropTarget="cs.id" class="addinC"
        :span="args.children[cs.id].span"
        :offset="args.children[cs.id].offset"
        :ref="'col' + cs.id"
        @click.native.stop="onClick(cs.id)"
        :style="{
                'left': args.children[cs.id].push > 0 ?`${args.children[cs.id].push * 100/24}%` : null,
                'right': `${args.children[cs.id].pull * 100/24}%`,
                'width': `calc(${args.children[cs.id].span * 100/24}-3px)`,
                'min-width': `calc(${args.children[cs.id].span * 100/24}-3px)`,
                'min-height': arg_height,
                'padding': args.padding ? parseInt(args.cpadding / 2) + 'px !important' : '0px !important',
                'display': 'flex',
                'flex-wrap': 'wrap',
                'align-items': args.children[cs.id].alignItems,
                'justify-content': args.children[cs.id].justifyContent,
                'border-top': args.children[cs.id].topBorder ?
                                args.children[cs.id].topBorder.width == 0 ?
                                  '1px ' + args.children[cs.id].topBorder.style + ' ' + args.children[cs.id].topBorder.color :
                                  args.children[cs.id].topBorder.width + 'px ' + args.children[cs.id].topBorder.style + ' ' + args.children[cs.id].topBorder.color :
                                '1px dashed #000',
                'border-right': args.children[cs.id].rightBorder ?
                                  args.children[cs.id].rightBorder.width == 0 ?
                                   '1px ' + args.children[cs.id].rightBorder.style + ' ' + args.children[cs.id].rightBorder.color :
                                   args.children[cs.id].rightBorder.width + 'px ' + args.children[cs.id].rightBorder.style + ' ' + args.children[cs.id].rightBorder.color :
                                 '1px dashed #000',
                'border-bottom': args.children[cs.id].bottomBorder?
                                  args.children[cs.id].bottomBorder.width == 0 ?
                                    '1px ' + args.children[cs.id].bottomBorder.style + ' ' + args.children[cs.id].bottomBorder.color :
                                    args.children[cs.id].bottomBorder.width + 'px ' + args.children[cs.id].bottomBorder.style + ' ' + args.children[cs.id].bottomBorder.color :
                                  '1px dashed #000',
                'border-left': args.children[cs.id].leftBorder ?
                                args.children[cs.id].leftBorder.width == 0 ?
                                  '1px ' + args.children[cs.id].leftBorder.style + ' ' + args.children[cs.id].leftBorder.color :
                                  args.children[cs.id].leftBorder.width + 'px ' + args.children[cs.id].leftBorder.style + ' ' + args.children[cs.id].leftBorder.color :
                                '1px dashed #000',
              }"
      >
        <ColPaneComponent
          :col="cs"
          :addinProps="addinProps"
          :addin="colAddinList[rs.id][index]"
          :basicArgs="basicArgs"
          :originAddin="addin"
          :ref="`Pane${rs.id}${index}`"
          :style="{'min-height': arg_height}"
          @activeAddin="activeAddin"
          @copyAddin="copyAddin"
          @removeAddin="removeAddin"
          @deleteAddin="deleteAddin"
          @commentAddin="commentAddin"
          @layoutSelfDrag="() => { $emit('layoutSelfDrag') }"
          @snapShotHistory="() => { $emit('snapShotHistory') }"
        >

        </ColPaneComponent>
      </van-col>
      <!--      <span class="row1-ex" style="display: none;"></span>-->
    </van-row>

    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox"
               v-model="args">
        <div slot="attribute">
<!--                    <p class="margin1">默认行数</p>-->
          <!--                    <InputNumber class="margin1" ref="g_row" :min="1" v-model="args.rows"-->
          <!--                                 style="display: inline-block; width: 100%"/>-->
            <p class="margin1">默认列数</p>
            <InputNumber class="margin1" ref="g_col" :min="1" v-model="args.cols"
                         style="display: inline-block; width: 100%"/>
            <p class="margin1">布局模式</p>
            <Select class="margin1" v-model="args.type">
                <Option value="flex">flex</Option>
            </Select>
            <p class="margin1">垂直对齐模式</p>
            <Select class="margin1" v-model="args.align">
              <template v-show="args.type == 'flex'">
                <Option value="top">顶部对齐</Option>
                <Option value="center">居中对齐</Option>
                <Option value="bottom">底部对齐</Option>
              </template>
            </Select>
            <!-- <p class="margin1">水平排列方式</p>
            <Select class="margin1" v-model="args.justify">
                <template v-show="args.type == 'flex'">
                <Option value="start">向左排列</Option>
                <Option value="end">向右排列</Option>
                <Option value="center">居中排列</Option>
                <Option value="space-around">等宽排列</Option>
                <Option value="space-between">分散排列</Option>
                </template>
            </Select> -->
            <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                带间距预览
                <i-switch style="float: right" v-model="args.padding"/>
            </div>
        </div>
        <div slot="layout">
          <p class="margin1">列间距</p>
          <InputNumber class="margin1" :min="0" v-model="args.cpadding" style="display: inline-block; width: 100%"/>
          <div class="margin1">
            边框
            <i-switch style="float: right" v-model="args.layoutBorder.show"/>
          </div>
        </div>
      </EditBox>
    </span>

    <span v-show="t_edit_col" ref="edit_col">
      <h1 style="font-size: 12px;">列</h1>
      <EditBox v-if="actEdit" :addinName="name" v-model="c_col">
        <div slot="attribute">
          <p class="margin1">占位格数</p>
          <InputNumber class="margin1" :min="1" v-model="c_col.span"
                       @on-change="(val) => { CColSpanChange(c_col, val) }"
                       style="display: inline-block; width: 100%"/>
          <p class="margin1">左侧间隔</p>
          <InputNumber class="margin1" :min="0" v-model="c_col.offset"
                       style="display: inline-block; width: 100%"/>
          <p class="margin1">向右移动格数</p>
          <InputNumber class="margin1" :min="0" v-model="c_col.push"
                       style="display: inline-block; width: 100%"/>
          <p class="margin1">向左移动格数</p>
          <InputNumber class="margin1" :min="0" v-model="c_col.pull"
                       style="display: inline-block; width: 100%"/>
          <!--          @on-change="(type) => alignItemsChange(c_col, type)"-->
        </div>
        <div slot="layout">
          <div class="margin1" style="margin: 10px 0 10px 0">
            <p class="margin1" style="height: 20px;">
              <span>上边框</span>
              <Tooltip content="同步边框" placement="left" style="float: right;">
                <Button size="small" icon="ios-attach" shape="circle" @click.native="attachBorder(c_col)"></Button>
              </Tooltip>
            </p>
            <Row type="flex" align="middle">
              <Col span="6">
                <ColorPicker v-model="c_col.topBorder.color"/>
              </Col>
              <Col span="8">
                <Input class="margin1" v-model="c_col.topBorder.width" type="number">
                  <span slot="append">px</span>
                </Input>
              </Col>
              <Col span="10">
                <Select class="margin1" v-model="c_col.topBorder.style">
                  <Option value="solid">实线</Option>
                  <Option value="dashed">虚线</Option>
                  <Option value="dotted">点线</Option>
                </Select>
              </Col>
            </Row>
          </div>
          <div class="margin1" style="margin: 10px 0 10px 0">
            右边框
            <Row type="flex" align="middle">
              <Col span="6">
                <ColorPicker v-model="c_col.rightBorder.color"/>
              </Col>
              <Col span="8">
                <Input class="margin1" v-model="c_col.rightBorder.width" type="number">
                  <span slot="append">px</span>
                </Input>
              </Col>
              <Col span="10">
                <Select class="margin1" v-model="c_col.rightBorder.style">
                  <Option value="solid">实线</Option>
                  <Option value="dashed">虚线</Option>
                  <Option value="dotted">点线</Option>
                </Select>
              </Col>
            </Row>
          </div>
          <div class="margin1" style="margin: 10px 0 10px 0">
            下边框
            <Row type="flex" align="middle">
              <Col span="6">
                <ColorPicker v-model="c_col.bottomBorder.color"/>
              </Col>
              <Col span="8">
                <Input class="margin1" v-model="c_col.bottomBorder.width" type="number">
                  <span slot="append">px</span>
                </Input>
              </Col>
              <Col span="10">
                <Select class="margin1" v-model="c_col.bottomBorder.style">
                  <Option value="solid">实线</Option>
                  <Option value="dashed">虚线</Option>
                  <Option value="dotted">点线</Option>
                </Select>
              </Col>
            </Row>
          </div>
          <div class="margin1" style="margin: 10px 0 10px 0">
            左边框
            <Row type="flex" align="middle">
              <Col span="6">
                <ColorPicker v-model="c_col.leftBorder.color"/>
              </Col>
              <Col span="8">
                <Input class="margin1" v-model="c_col.leftBorder.width" type="number">
                  <span slot="append">px</span>
                </Input>
              </Col>
              <Col span="10">
                <Select class="margin1" v-model="c_col.leftBorder.style">
                  <Option value="solid">实线</Option>
                  <Option value="dashed">虚线</Option>
                  <Option value="dotted">点线</Option>
                </Select>
              </Col>
            </Row>
          </div>
          <p class="margin1">垂直对齐方式</p>
          <RadioGroup v-model="c_col.alignItems" type="button">
            <Radio label="flex-start" title="顶部对齐">
              <i class="iconfont"
                 style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6ba;</i>
            </Radio>
            <Radio label="center" title="上下居中">
              <i class="iconfont"
                 style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6c0;</i>
            </Radio>
            <Radio label="flex-end" title="底部对齐">
              <i class="iconfont"
                 style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6bb;</i>
            </Radio>
            <!--            <Button label= title="垂直分布">-->
            <!--              <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6bc;</i>-->
            <!--            </Button>-->
          </RadioGroup>
          <!--          @on-change="(type) => justifyContentChange(c_col, type)"-->
          <p class="margin1">水平对齐方式</p>
          <RadioGroup v-model="c_col.justifyContent" type="button">
            <Radio label="flex-start" title="左侧对齐">
              <i class="iconfont"
                 style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6bd;</i>
            </Radio>
            <Radio label="center" title="左右居中">
              <i class="iconfont"
                 style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6be;</i>
            </Radio>
            <Radio label="flex-end" title="右侧对齐">
              <i class="iconfont"
                 style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6c1;</i>
            </Radio>
            <!--            <Button type="" title="水平分布">-->
            <!--              <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6ba;</i>-->
            <!--            </Button>-->
          </RadioGroup>
        </div>
      </EditBox>
    </span>
  </div>
  <section v-else-if="t_icon" :addinName="name" style="text-align: center">
    <div class="form-addin-icon">
      <i class="iconfont">&#xe6b9;</i>
    </div>
    <div class="form-addin-name" style="width: 100%">多列</div>
  </section>
</template>

<script>
import _global from '@/views/global.vue'
import {getFilesById} from "@/api/others";
import '@/styles/component/iconfont.css'
import EditBox from '@/ext_components/form/_EditBox.vue'
import noBg from '@/assets/images/nobg.png';
import {uuid} from '@/util/assist'
import Split from 'split.js';
import draggable from "vuedraggable";
import ColPaneComponent from "./ColPaneComponent";

const name = 'row';
const borderConfig = {
  topBorder: {
    width: '0',
    color: '#000',
    style: 'dashed'
  },
  rightBorder: {
    width: '0',
    color: '#000',
    style: 'dashed'
  },
  bottomBorder: {
    width: '0',
    color: '#000',
    style: 'dashed'
  },
  leftBorder: {
    width: '0',
    color: '#000',
    style: 'dashed'
  },
  alignItems: 'flex-start',
  justifyContent: 'flex-start'
};
export default {
  name: name,
  components: {
    EditBox,
    draggable,
    ColPaneComponent,
  },
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

      dataTypes: [],

      baseUrl: '',
      noBgFlag: false,     // 背景图片源是否在资料库已被删除

      // 编辑框rows

      actEdit: false,
      args: {
        padding: true,
        rpadding: 10,
        cpadding: 0,

        title: "多列",
        id: "",
        _id: "0",
        type: "flex",
        align: "center",
        justify: "start",
        layoutBorder: {
          color: '#000',
          type: 'solid',
          width: '1px',
          show: false,
        },
        hided: false,
        // 布局插件所需属性
        rows: 1,
        cols: 2,
        span: 8,
        offset: 0,
        push: 0,
        pull: 0,
        children: {},
        iCols: {},
        iRows: [],
        // label_fontColor: 'initial',
        // txt_fontColor: 'initial',
        // lfsize: 14,
        // lfsizeType: 'px',
        // fsize: 14,
        // fsizeType: 'px',
        // label_width: 2,
        // main_width: 3,
        label_align: 4,
        main_align: 4,
        imgOrigin: 'imgSelf',
        back_color: "",      // 背景颜色
        back_picture: "",           // 背景图片,超链接
        bgStyle: 'cover',           // 背景图片显示方式
        bgSize: 'cover',
        bgRepeat: 'no-repeat',
        bgPercent: 100,

        height: 30,                  // 整体高度=
        heightType: "px",                  // 整体高度=
        width: 100,
        widthType: '%',
      },

      click_children: '1,1',

      // 对齐方式,布局插件使用
      alignList: [
        {value: 1, name: "靠左对齐"},
        {value: 4, name: "居中对齐"},
        {value: 7, name: "靠右对齐"},
        {value: 0, name: "左上对齐"},
        {value: 2, name: "左下对齐"},
        {value: 3, name: "顶部对齐"},
        {value: 5, name: "底部对齐"},
        {value: 6, name: "右上对齐"},
        {value: 8, name: "右下对齐"}
      ],

      // 继承属性
      // inherit: ["label_width", "main_width", "main_align", "label_align", "basic_height", "col", "lfsize", "lfsizeType", "fsize", "fsizeType", "label_fontColor", "txt_fontColor"],
      inherit: ["justify"],

      c_row: {
        title: "行",
        id: "",
        type: "flex",
        align: "middle",
        justify: "start",
        // 布局插件所需属性
        rows: 1,
        cols: 2,
        // label_fontColor: 'initial',
        // txt_fontColor: 'initial',
        // lfsize: 14,
        // lfsizeType: 'px',
        // fsize: 14,
        // fsizeType: 'px',
        // label_width: 2,
        // main_width: 3,
        // label_align: 4,
        // main_align: 4,
        height: 30,                  // 整体高度=
        heightType: "px",                  // 整体高度=
        width: 100,
        widthType: '%',
      },

      c_col: {
        _idx: "",
        title: "列",
        id: "",
        type: "flex",
        align: "middle",
        justify: "start",
        hideWidgetAnnotation: true,
        // 布局插件所需属性
        rows: 1,
        cols: 2,
        span: 8,
        offset: 0,
        push: 0,
        pull: 0,
        // label_fontColor: 'initial',
        // txt_fontColor: 'initial',
        // lfsize: 14,
        // lfsizeType: 'px',
        // fsize: 14,
        // fsizeType: 'px',
        // label_width: 2,
        // main_width: 3,
        // label_align: 4,
        // main_align: 4,
        height: 30,                  // 整体高度=
        heightType: "px",                  // 整体高度=
        width: 100,
        widthType: '%',
        event: [],
        ...borderConfig,
      },

      allow: {},

      back: false,
      fresh: false,
      init: false,

      timer: null,
      node: null,
      defaultSplitOptions: {
        cursor: 'ew-resize',
        gutterSize: 6,
        dragInterval: 1,
        onDragEnd: (sizes) => {
          let spans = sizes.map(size => Math.round(size / 4.16666));
          spans.forEach((span, index) => {
            let col = `1,${index + 1}`;
            this.args.children[col].span = span;
          });
        },
        // gutterStyle: (dimension, gutterSize) => {
        //   return {
        //     'flex-basis': gutterSize + 'px',
        //   }
        // }
      },
      splitUUID: '',
      split: {},
      activeCol: '',
    }
  },
  inject: [
    'GetJsonById',
    'GenerateID',
    'setBasicArgs',
  ],
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if ("1" in this.args.children) {
      this.init = true;
    }
    if (this.t_preview) {
      this.baseUrl = _global.baseUrl;
      // this.refresh();
    }
  },
  mounted() {
    this.splitUUID = uuid();
    if (this.t_preview) {
      let that = this;
      this.timer = setInterval(() => {
        that.node = that.GetJsonById(that.itemValue.data, that.args.id);
        if (that.node) {
          console.log("node:", that.node);
          clearInterval(that.timer);
          that.timer = null;
        }
      }, 100);
      this.initSplit();
      setTimeout(() => {
        this.init = false;
      }, 1000)
    }
  },
  watch: {
    c_col: {
      handler(newVal, oldVal) {
        if (this.fresh) return;
        if (oldVal == newVal) {
          this.updateChildren([newVal._idx], "all");
        }
        this.args.children[newVal._idx] = _.cloneDeep(newVal);
      },
      deep: true,
    },
    c_row: {
      handler(newVal, oldVal) {
        if (this.fresh) return;
        if (oldVal == newVal) {
          this.rowRefresh(newVal.id, "cols");
        }
      },
      deep: true
    },
    arg_cols: {
      handler(newVal, oldVal) {
        if(newVal < oldVal){
          //列中是否有元素，有为true
          let checkRow = false;
          for(let i = oldVal; i > newVal; i--){
            checkRow = this.colAddinList.length === 0 ? false : this.colAddinList[1][i - 1].length !== 0 || checkRow;
          }
          if(checkRow){
            this.$Message.error("请先移除溢出单元格中的控件");
            this.$nextTick(() => {
              this.args.cols = oldVal;
            })
          }else{
            this.refresh("cols");
          }
        }else{
          this.refresh("cols");
        }
      },
      deep: true
      // if (!this.init) {
      //   this.initSplit();
      // }
    },
    arg_rows(val) {
      this.refresh("rows");
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
    args_label_width(val) {
      this.refresh("label_width");
    },
    args_main_width(val) {
      this.refresh("main_width");
    },
    args_lfsize(val) {
      this.refresh("lfsize");
      this.refresh("lfsizeType");
    },
    args_fsize(val) {
      this.refresh("fsize");
      this.refresh("fsizeType");
    },
    args_lfcolor(val) {
      this.refresh("label_fontColor");
    },
    args_fcolor(val) {
      this.refresh("txt_fontColor");
    },
    // arg_basic_height(val) {
    //     this.refresh("basic_height");
    // },
    arg_type(val) {
      // this.refresh("type");
    },
    arg_align(val) {
      this.refresh("align");
    },
    arg_justify(val) {
      this.refresh("justify");
    },
  },
  computed: {

    arg_height() {
      return this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
    },
    arg_cols() {
      return this.args.cols;
    },
    arg_rows() {
      return this.args.rows;
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
    // arg_basic_height() {
    //     return this.args.basic_height;
    // },
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
    colAddinList() {
      let colAddinList = [];
      this.args.iRows.forEach(row => {
        if (!colAddinList[row.id]) {
          colAddinList[row.id] = {};
        }
        this.args.iCols[row.id].forEach((col, index) => {
          colAddinList[row.id][index] = this.addin.elements.filter(addin => addin.self.dropTarget === col.id)
        })
      })
      return colAddinList;
    },
  },

  methods: {
    refreshFormAddinList() {
      this.args.iRows.forEach(row => {
        this.args.iCols[row.id].forEach((col, index) => {
          this.$refs[`Pane${row.id}${index}`][0].refreshFormAddinList();
        })
      })
    },
    updateChildren(updates, args) {
      if (!this.node) return;
      this.node.elements.forEach(x => {
        if (updates.indexOf(x.self.dropTarget) == -1) return;
        if (args == "all") {
          this.inherit.forEach(y => {
            if (y in x.self.properties) x.self.properties[y] = this.args.children[x.self.dropTarget][y];
          })
        } else {
          if (args in x.self.properties) x.self.properties[args] = this.args.children[x.self.dropTarget][args];
        }
      });
    },

    rowRefresh(id, args, flag) {
      // if (!this.init || this.back) return;
      this.fresh = true;
      if (args == "cols") {
        if (!flag && id in this.args.iCols && this.args.children[id].cols < this.args.iCols[id].length && this.$refs.main && this.$refs.main.getAttribute("UUID")) {
          var update = [];
          for (var i = this.args.children[id].cols + 1; i <= this.args.iCols[id].length; i++) {
            update.push(id + "," + i);
          }
          this.$emit("checkRow", update, this.$refs.main.getAttribute("UUID"));
          if (!this.checkResult.result) {
            this.back = true;
            this.args.children[id].cols = this.args.iCols[id].length;
            this.$refs.c_col.currentValue = this.$refs.c_col.value;
            this.fresh = false;
            let that = this;
            setTimeout(() => {
              that.back = false;
            }, 30);
            return;
          }
        }
        this.args.iCols[id] = [];
        var _id = null;
        var updates = [];
        for (var i = 0; i < this.args.children[id].cols; i++) {
          _id = id + "," + (i + 1);
          updates.push(_id);
          this.args.iCols[id].push({id: _id});
          this.args.children[_id] = {
            id: _id,
            hideWidgetAnnotation: true,
            span: parseInt(24 / this.args.children[id].cols),
            offset: 0,
            push: 0,
            pull: 0,
            col: false,
            ...borderConfig,
          }
        }
        this.updateChildren(updates, "all");
        this.initSplit();
        // if (!flag) this.$emit("rowRefresh", this.args.iCols, this.$refs.main ? this.$refs.main.getAttribute("UUID") : null);
      } else {
        var updates = [];
        var _id = null;
        for (var i = 0; i < this.args.children[id].cols; i++) {
          _id = id + "," + (i + 1);
          updates.push(_id);
          if (args == 'justify') {
            this.args.children[_id][args] = this.args.children[id][args] == 'start' || this.args.children[id][args] == 'end'
              ? `flex-${this.args.children[id][args]}`
              : this.args.children[id][args]
          } else {
            this.args.children[_id][args] = this.args.children[id][args];
          }
        }
        this.updateChildren(updates, args);
      }
      this.fresh = false;
    },

    refresh(args) {
      console.log("back:", this.back);
      if (this.init) return;
      this.fresh = true;
      if (!args || args == "rows" || args == "cols") {
        if (this.$refs.main && this.$refs.main.getAttribute("UUID")) {
          console.log(this.args.rows, this.args.cols, this.args.iRows, this.args.iCols);
          var update = [];
          if (this.args.iRows.length > this.args.rows) {
            for (var i = this.args.rows + 1; i <= this.args.iRows.length; i++) {
              for (var j = 1; j <= this.args.iCols["" + i].length; j++) {
                update.push(i + "," + j);
              }
            }
            for (var i = 1; i <= this.args.iRows.length; i++) {
              for (var j = this.args.cols + 1; j <= this.args.iCols["" + i].length; j++) {
                update.push(i + "," + j);
              }
            }
          } else {
            for (var i = 1; i <= this.args.iRows.length; i++) {
              for (var j = this.args.cols + 1; j <= this.args.iCols["" + i].length; j++) {
                update.push(i + "," + j);
              }
            }
          }
          if (update.length > 0) {
            this.$emit("checkRow", update, this.$refs.main.getAttribute("UUID"));
            if (!this.checkResult.result) {
              this.back = true;
              this.args.rows = this.args.iRows.length;
              // this.$refs.g_row.currentValue = this.$refs.g_row.value;
              var cols = this.args.iCols['1'].length;
              for (var i = 2; i <= this.args.iRows.length; i++) {
                if (this.args.iCols["" + i].length < cols) cols = this.args.iCols["" + i].length;
              }
              this.args.cols = cols;
              this.$refs.g_col.currentValue = this.$refs.g_col.value;
              for (var i = 1; i <= this.args.iRows.length; i++) {
                this.args.children["" + i].cols = this.args.iCols["" + i].length;
              }
              // this.$refs.c_col.currentValue = this.$refs.c_col.value;
              this.fresh = false;
              let that = this;
              setTimeout(() => {
                console.log("asd:", that.back);
                that.back = false;
              }, 30);
              return;
            }
          }
        }
        this.args.iRows = [];
        this.args.children = {};
        this.args.iCols = {};
        var _id = null;
        for (var i = 0; i < this.args.rows; i++) {
          _id = "" + (i + 1);
          this.args.iRows.push({id: _id});
          this.args.children[_id] = {
            id: _id,
            type: this.args.type,
            align: this.args.align,
            justify: this.args.justify,
            // label_align: this.args.label_align,
            // main_align: this.args.main_align,
            // label_width: this.args.label_width,
            // main_width: this.args.main_width,
            // height: this.args.height,
            // heightType: this.args.heightType,
            // width: this.args.width,
            // widthType: this.args.widthType,
            // 布局插件所需属性
            // cols: args != "cols" && _id in this.args.iCols ? this.args.iCols[_id].length : this.args.cols,
            cols: this.args.cols,
          }
          this.rowRefresh(_id, "cols", true);
        }
      } else {
        var _id = null;
        for (var i = 0; i < this.args.rows; i++) {
          _id = "" + (i + 1);
          if (args == 'justify') {
            this.args.children[_id][args] = this.args[args] == 'start' || this.args[args] == 'end'
              ? `flex-${this.args[args]}`
              : this.args[args]
          } else {
            this.args.children[_id][args] = this.args[args];
          }
          this.rowRefresh(_id, args);
        }
      }
      this.fresh = false;
    },

    onClick(id) {
      this.activeCol = id;
      this.click_children = id;
      this.c_col = _.cloneDeep(this.args.children[id]);
      this.c_col._idx = id;

      this.$emit('activeAddin', 'col');
      this.$emit("showEditBox", 'col', this);
    },

    CColSpanChange(col, value) {
      this.$nextTick(() => {
        this.c_col.span = Math.round(value);
        let sizes = [];
        let row = col.id.split(',')[0];
        this.args.iCols[row].forEach(col => {
          if (this.args.children[col.id].span) {
            sizes.push(this.args.children[col.id].span / 24 * 100);
          }
        })
        this.split[row].setSizes(sizes);
      })
    },

    getValue() {
      return null;
    },

    setValue(items) {
      return this;
    },

    getAllow(dropTarget) {
      return [];
      //return allow[dropTarget];
    },

    getInherit(dropTarget) {
      var res = {};
      let that = this;
      this.inherit.forEach(x => {
        if (x in that.args.children[dropTarget]) res[x] = that.args.children[dropTarget][x]
      });
      return res;
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    setArgs(args) {
      // if ("iRows" in args) this.init = true;
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
      let borderConfigArgs = _.cloneDeep(borderConfig);
      switch (this.args.align) {
        case 'top':
          borderConfigArgs.alignItems = 'flex-start';
          break;
        case 'middle':
          borderConfigArgs.alignItems = 'center';
          break;
        case 'bottom':
          borderConfigArgs.alignItems = 'flex-end';
          break;
      }
      ;
      switch (this.args.justify) {
        case 'start':
          borderConfigArgs.justifyContent = 'flex-start';
          break;
        case 'center':
          borderConfigArgs.justifyContent = 'center';
          break;
        case 'end':
          borderConfigArgs.justifyContent = 'flex-end';
          break;
        default:
          borderConfigArgs.justifyContent = 'center';
          break;
      }
      ;
      for (let col in this.args.children) {
        if (col.split(',').length === 2) {
          this.args.children[col] = this.args.children[col].topBorder ? this.args.children[col] : Object.assign(this.args.children[col], borderConfigArgs);
        }
      }
      return this;
    },

    // 获取表单项名
    getFormName() {
      return null;
    },

    getEditBoxComponent() {
      return this.$refs.editbox;
    },

    getEditBox(args) {
      if (!args) {
        this.t_edit = true;
        return this.$refs.edit;
      } else if (args == "col") {
        this.t_edit_col = true;
        return this.$refs.edit_col;
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

    colClass(rowId, index) {
      return `col-${this.args.id}${rowId}${index}${this.splitUUID}`;
    },

    //创建分割工具
    initSplit() {
      setTimeout(() => {
        if (!this.$refs.row) return;
        this.args.iRows.forEach((row, rowIndex) => {
          try {
            this.split[row.id] ? this.split[row.id].destroy() : void 0;
          } catch (e) {
            console.log(`split${e}`)
          }
          //dragInterval = 总长 - 两侧边距  - (gutter个数 - 1) * gutter块宽度

          var defaultSplitOptions = {
            cursor: 'ew-resize',
            gutterSize: 6,
            dragInterval: 1,
            onDragEnd: (sizes) => {
              let spans = sizes.map(size => Math.round(size / 4.16666));
              spans.forEach((span, index) => {
                let col = `1,${index + 1}`;
                this.args.children[col].span = span;
              });
            },
          };
          defaultSplitOptions.dragInterval = (this.$refs.row[rowIndex].$el.offsetWidth - 6 - (this.args.iCols[row.id].length - 1) * 6) / 24;
          defaultSplitOptions.minSize = defaultSplitOptions.dragInterval;
          let selector = this.args.iCols[row.id].map((col, index) => `.col-${this.args.id}${row.id}${index}${this.splitUUID}`);
          // selector.push('.row1-ex');
          let sizes = [];
          this.args.iCols[row.id].forEach(col => {
            if (this.args.children[col.id].span) {
              sizes.push(this.args.children[col.id].span / 24 * 100);
            }
          })
          // sizes.push(0)
          defaultSplitOptions.sizes = sizes;
          // let splitOption = this.args.splitOptions ? this.args.splitOptions : defaultSplitOptions;
          this.split[row.id] = Split(selector, defaultSplitOptions);
        })
      }, 0);
    },

    /**
     * @description列布局切换
     */
    // alignItemsChange(col, type){
    //   col.alignItems = type;
    // },
    //
    // justifyContentChange(col, type){
    //   col.justifyContent = type;
    // },

    activeAddin(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },

    copyAddin(addin, parentUUID = this.addin.self.uuid) {
      this.$emit('copyAddin', addin, parentUUID);
    },

    removeAddin(uuid, parentUUID = this.addin.self.uuid, deleteButton) {
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },

    deleteAddin() {
      this.$emit('deleteAddin');
    },

    commentAddin(addin) {
      this.$emit('commentAddin', addin);
    },
    // 同步边框
    attachBorder() {

      this.c_col.rightBorder.color = this.c_col.bottomBorder.color = this.c_col.leftBorder.color = this.c_col.topBorder.color;
      this.c_col.rightBorder.width = this.c_col.bottomBorder.width = this.c_col.leftBorder.width = this.c_col.topBorder.width;
      this.c_col.rightBorder.style = this.c_col.bottomBorder.style = this.c_col.leftBorder.style = this.c_col.topBorder.style;

    },
  }
}
</script>

<style>
.addinC {
  padding: 0px !important;
  border: 1px dashed #000;
}

.addinC .addin {
  padding: 0px !important;
}

.addinC.selected {
  border: 2px dashed red !important;
}

/*.addinC .addin[addinname=Operation] {*/
/*  margin-right: 10px;*/
/*}*/

.gutter {
  background-color: #eee;
  background-repeat: no-repeat;
  background-position: 50%;
  background-color: #fff;
  cursor: ew-resize;
  height: 30px;
  /*margin-left: -10px;*/
  width: 6px !important;
  border: 3px solid #1AB395;
  z-index: 5;
}

.gutter.show {
  display: block;
}

.gutter.gutter-horizontal {
  /*background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');*/
}
.van-row--flex {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.van-col {
  position: relative;
}
.van-row--align-top {
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    align-items: flex-start;
}
</style>

<style scoped>
section {
  width: 100%;
  height: auto;
  display: inline-block
}

.addin.addinR {
  background-image: url();
  background-size: cover;
  background-repeat: no-repeat;
  padding: 0px !important;
  border: 0px;
}
</style>
