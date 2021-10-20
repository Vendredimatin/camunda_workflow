<template>
  <section
    :addinName="name"
    v-if="t_preview"
    addin="layout"
    :style="{
      'width': arg_width,
      'margin-top': arg_mt,
      'margin-bottom': arg_mb,
      'margin-right': arg_mr,
        'left': args.push > 0 ?`${args.push * 100/24}%` : null,
        'right': `${args.pull * 100/24}%`,
      'margin-left': args.offset > 0 ? `${args.offset * 100/24}%` : arg_ml,
    }"
    :class="{'hidden': !args_radius}"
    class="addin actPc addin-layout">
  <van-col
    dropTarget="0"
    :addinName="name"
    :span="args.span"
    :style="{
        'width': '100%',
        'min-height': arg_height,
        'padding-top': arg_pt,
        'padding-bottom': arg_pb,
        'padding-left': arg_pl,
        'padding-right': arg_pr,
        'backgroundImage': arg_bgPic,
        'backgroundSize': args.bgSize,
        'backgroundRepeat': args.bgRepeat,
        'backgroundColor': args.back_color,
        'border-top': `${args.tbWidth == 0 && args.tbColor == '#bbb'? 1 : args.tbWidth}px ${args.tbStyle} ${args.tbColor}`,
        'border-right': `${args.rbWidth == 0 && args.rbColor == '#bbb' ? 1 : args.rbWidth}px ${args.rbStyle} ${args.rbColor}`,
        'border-bottom': `${args.bbWidth == 0 && args.bbColor == '#bbb' ? 1 : args.bbWidth}px ${args.bbStyle} ${args.bbColor}`,
        'border-left': `${args.lbWidth == 0 && args.lbColor == '#bbb' ? 1 : args.lbWidth}px ${args.lbStyle} ${args.lbColor}`,
        'borderRadius': `${arg_ltRadius} ${arg_rtRadius} ${arg_rbRadius} ${arg_lbRadius}`,
        'box-shadow': arg_shadow,
        'display': 'flex',
        'flex-wrap': 'wrap',
        'align-content': args.alignItems,
        'justify-content': args.justifyContent,
        'float': 'left',
        'overflow': args.ltRadius == 0 && args.rtRadius == 0 && args.lbRadius == 0 && args.rbRadius == 0 ? 'visible' : 'hidden'}"
       >
        <draggable
          class='dragArea'
          :style="{
            'display': 'flex',
            'flex-wrap': 'wrap',
            'align-content': args.alignItems,
            'justify-content': args.justifyContent,
            'min-height': arg_height,
          }"
          draggable=".vue-draggable-addin"
          group='addin'
          :list="formAddinList"
          ghost-class="vue-draggable-ghost"
          @change='jsonDataChange'
        >
          <MobileFormAddinList
            v-for="(childrenAddin, index) in addin.elements"
            :key="childrenAddin.self.uuid"
            :addin="childrenAddin"
            v-bind="addinProps"
            :ref="`FormAddinList${childrenAddin.self.uuid}`"
            @activeAddin="activeAddin"
            @copyAddin="copyAddin"
            @removeAddin="removeAddin"
            @deleteAddin="deleteAddin"
            @commentAddin="commentAddin"
            @layoutSelfDrag="() => { $emit('layoutSelfDrag') }"
          >

          </MobileFormAddinList>
        </draggable>
        <slot name="widget"></slot>
        <span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args">
                <div slot="attribute">
                    <p class="margin1">左侧间隔</p>
                    <InputNumber class="margin1" :min="0" v-model="args.offset"
                                 style="display: inline-block; width: 100%"/>
                    <p>向右移动格数</p>
                    <InputNumber class="margin1" :min="0" v-model="args.push"
                                 style="display: inline-block; width: 100%"/>
                    <p>向左移动格数</p>
                    <InputNumber class="margin1" :min="0" v-model="args.pull"
                                 style="display: inline-block; width: 100%"/>
                    <div class="margin1" style="height: 20px;">
                      <b>边距属性</b>
                      <RadioGroup v-model="marginRadio" style="margin-left: 10px;">
                        <Radio label="外边距"></Radio>
                        <Radio label="内边距"></Radio>
                      </RadioGroup>
                      <Tooltip content="同步边距" placement="left" style="float: right;">
                        <Button size="small" icon="ios-attach" shape="circle" @click.native="attachMargin"></Button>
                      </Tooltip>
                    </div>

                    <div class="margin1" v-show="marginRadio == '外边距'">

                      <Row type="flex" align="middle">
                        <Col span="6">
                          <span>上外边距</span>
                        </Col>
                        <Col span="18">
                          <Input class="margin1" v-model="args.marginTop" type="number">
                            <Select v-model="args.marginTopType" slot="append" style="width: 70px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                              <Option value="vw">vw</Option>
                              <Option value="vh">vh</Option>
                              <Option value="rem">rem</Option>
                            </Select>
                          </Input>
                        </Col>
                      </Row>
                      <Row type="flex" align="middle">
                        <Col span="6">
                          <span>下外边距</span>
                        </Col>
                        <Col span="18">
                          <Input class="margin1" v-model="args.marginBottom" type="number">
                            <Select v-model="args.marginBottomType" slot="append" style="width: 70px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                              <Option value="vw">vw</Option>
                              <Option value="vh">vh</Option>
                              <Option value="rem">rem</Option>
                            </Select>
                          </Input>
                        </Col>
                      </Row>
                      <Row type="flex" align="middle">
                        <Col span="6">
                          <span>左外边距</span>
                        </Col>
                        <Col span="18">
                          <Input class="margin1" v-model="args.marginLeft" type="number">
                            <Select v-model="args.marginLeftType" slot="append" style="width: 70px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                              <Option value="vw">vw</Option>
                              <Option value="vh">vh</Option>
                              <Option value="rem">rem</Option>
                            </Select>
                          </Input>
                        </Col>
                      </Row>
                      <Row type="flex" align="middle">
                        <Col span="6">
                          <span>右外边距</span>
                        </Col>
                        <Col span="18">
                          <Input class="margin1" v-model="args.marginRight" type="number">
                            <Select v-model="args.marginRightType" slot="append" style="width: 70px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                              <Option value="vw">vw</Option>
                              <Option value="vh">vh</Option>
                              <Option value="rem">rem</Option>
                            </Select>
                          </Input>
                        </Col>
                      </Row>

                    </div>

                    <div class="margin1" v-show="marginRadio == '内边距'">

                      <Row type="flex" align="middle">
                        <Col span="6">
                          <span>上内边距</span>
                        </Col>
                        <Col span="18">
                          <Input class="margin1" v-model="args.paddingTop" type="number">
                            <Select v-model="args.paddingTopType" slot="append" style="width: 70px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                              <Option value="vw">vw</Option>
                              <Option value="vh">vh</Option>
                              <Option value="rem">rem</Option>
                            </Select>
                          </Input>
                        </Col>
                      </Row>
                      <Row type="flex" align="middle">
                        <Col span="6">
                          <span>下内边距</span>
                        </Col>
                        <Col span="18">
                          <Input class="margin1" v-model="args.paddingBottom" type="number">
                            <Select v-model="args.paddingBottomType" slot="append" style="width: 70px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                              <Option value="vw">vw</Option>
                              <Option value="vh">vh</Option>
                              <Option value="rem">rem</Option>
                            </Select>
                          </Input>
                        </Col>
                      </Row>
                      <Row type="flex" align="middle">
                        <Col span="6">
                          <span>左内边距</span>
                        </Col>
                        <Col span="18">
                          <Input class="margin1" v-model="args.paddingLeft" type="number">
                            <Select v-model="args.paddingLeftType" slot="append" style="width: 70px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                              <Option value="vw">vw</Option>
                              <Option value="vh">vh</Option>
                              <Option value="rem">rem</Option>
                            </Select>
                          </Input>
                        </Col>
                      </Row>
                      <Row type="flex" align="middle">
                        <Col span="6">
                          <span>右内边距</span>
                        </Col>
                        <Col span="18">
                          <Input class="margin1" v-model="args.paddingRight" type="number">
                            <Select v-model="args.paddingRightType" slot="append" style="width: 70px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                              <Option value="vw">vw</Option>
                              <Option value="vh">vh</Option>
                              <Option value="rem">rem</Option>
                            </Select>
                          </Input>
                        </Col>
                      </Row>

                    </div>
                    <p class="margin1" style="height: 20px;">
                      <b>圆角属性</b>
                      <Tooltip content="同步圆角" placement="left" style="float: right;">
                        <Button size="small" icon="ios-attach" shape="circle" @click.native="attachRadius"></Button>
                      </Tooltip>
                    </p>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>左上</span>
                      </Col>
                      <Col span="18">
                        <Input class="margin1" type="number" v-model="args.ltRadius">
                          <Select v-model="args.ltRadiusType" slot="append" style="width: 50px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                          </Select>
                        </Input>
                      </Col>
                    </Row>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>右上</span>
                      </Col>
                      <Col span="18">
                        <Input class="margin1" type="number" v-model="args.rtRadius" @on-change="radiusChange(args.rtRadius, 'rt')">
                          <Select v-model="args.rtRadiusType" slot="append" style="width: 50px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                          </Select>
                        </Input>
                      </Col>
                    </Row>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>左下</span>
                      </Col>
                      <Col span="18">
                        <Input class="margin1" type="number" v-model="args.lbRadius" @on-change="radiusChange(args.lbRadius, 'lb')">
                          <Select v-model="args.lbRadiusType" slot="append" style="width: 50px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                          </Select>
                        </Input>
                      </Col>
                    </Row>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>右下</span>
                      </Col>
                      <Col span="18">
                        <Input class="margin1" type="number" v-model="args.rbRadius" @on-change="radiusChange(args.rbRadius, 'rb')">
                          <Select v-model="args.rbRadiusType" slot="append" style="width: 50px;">
                              <Option value="px">px</Option>
                              <Option value="%">%</Option>
                          </Select>
                        </Input>
                      </Col>
                    </Row>
                    <p class="margin1"><b>阴影属性</b></p>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>阴影类型</span>
                      </Col>
                      <Col span="18">
                        <RadioGroup v-model="args.shadowType">
                          <Radio label="外阴影"></Radio>
                          <Radio label="内阴影"></Radio>
                        </RadioGroup>
                      </Col>
                    </Row>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>水平位置</span>
                      </Col>
                      <Col span="18">
                        <Input class="margin1" v-model="args.xShadow" type="number">
                          <span slot="append">px</span>
                        </Input>
                      </Col>
                    </Row>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>垂直位置</span>
                      </Col>
                      <Col span="18">
                        <Input class="margin1" v-model="args.yShadow" type="number">
                          <span slot="append">px</span>
                        </Input>
                      </Col>
                    </Row>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>模糊距离</span>
                      </Col>
                      <Col span="18">
                        <Input class="margin1" v-model="args.blurShadow" type="number">
                          <span slot="append">px</span>
                        </Input>
                      </Col>
                    </Row>
                    <Row type="flex" align="middle">
                      <Col span="6">
                        <span>阴影尺寸</span>
                      </Col>
                      <Col span="18">
                        <Input class="margin1" v-model="args.spreadShadow" type="number">
                          <span slot="append">px</span>
                        </Input>
                      </Col>
                    </Row>
                    <div class="margin1" style="margin: 10px 0 10px 0">
                      阴影颜色
                      <ColorPicker v-model="args.shadowColor" alpha/>
                    </div>
                </div>
              <div slot="layout">
                <p class="margin1">垂直对齐方式</p>
                <RadioGroup v-model="args.alignItems" type="button">
                  <Radio label="flex-start" title="顶部对齐">
                    <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6ba;</i>
                  </Radio>
                  <Radio label="center" title="上下居中">
                    <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6c0;</i>
                  </Radio>
                  <Radio label="flex-end" title="底部对齐">
                    <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6bb;</i>
                  </Radio>
                  <!--            <Button label= title="垂直分布">-->
                  <!--              <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6bc;</i>-->
                  <!--            </Button>-->
                </RadioGroup>
                <!--          @on-change="(type) => justifyContentChange(args, type)"-->
                <p class="margin1">水平对齐方式</p>
                <RadioGroup v-model="args.justifyContent" type="button">
                  <Radio label="flex-start" title="左侧对齐">
                    <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6bd;</i>
                  </Radio>
                  <Radio label="center" title="左右居中">
                    <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6be;</i>
                  </Radio>
                  <Radio label="flex-end" title="右侧对齐">
                    <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6c1;</i>
                  </Radio>
                  <!--            <Button type="" title="水平分布">-->
                  <!--              <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe6ba;</i>-->
                  <!--            </Button>-->
                </RadioGroup>
                <div class="margin1" style="margin: 10px 0 10px 0">
                  <p class="margin1" style="height: 20px;">
                    <span>上边框</span>
                    <Tooltip content="同步边框" placement="left" style="float: right;">
                      <Button size="small" icon="ios-attach" shape="circle" @click.native="attachBorder"></Button>
                    </Tooltip>
                  </p>
                  <Row type="flex" align="middle">
                    <Col span="6">
                      <ColorPicker v-model="args.tbColor"/>
                    </Col>
                    <Col span="8">
                      <Input class="margin1" v-model="args.tbWidth" type="number">
                        <span slot="append">px</span>
                      </Input>
                    </Col>
                    <Col span="10">
                      <Select class="margin1" v-model="args.tbStyle">
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
                          <ColorPicker v-model="args.bbColor"/>
                        </Col>
                        <Col span="8">
                          <Input class="margin1" v-model="args.bbWidth" type="number">
                            <span slot="append">px</span>
                          </Input>
                        </Col>
                        <Col span="10">
                          <Select class="margin1" v-model="args.bbStyle">
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
                          <ColorPicker v-model="args.lbColor"/>
                        </Col>
                        <Col span="8">
                          <Input class="margin1" v-model="args.lbWidth" type="number">
                            <span slot="append">px</span>
                          </Input>
                        </Col>
                        <Col span="10">
                          <Select class="margin1" v-model="args.lbStyle">
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
                          <ColorPicker v-model="args.rbColor"/>
                        </Col>
                        <Col span="8">
                          <Input class="margin1" v-model="args.rbWidth" type="number">
                            <span slot="append">px</span>
                          </Input>
                        </Col>
                        <Col span="10">
                          <Select class="margin1" v-model="args.rbStyle">
                            <Option value="solid">实线</Option>
                            <Option value="dashed">虚线</Option>
                            <Option value="dotted">点线</Option>
                          </Select>
                        </Col>
                      </Row>
                    </div>
              </div>
            </EditBox>
        </span>

  </van-col>
  </section>
  <section v-else-if="t_icon" :addinName="name" style="text-align: center">
    <div class="form-addin-icon">
      <i class="iconfont">&#xe6a7;</i>
    </div>
    <div class="form-addin-name" style="width: 100%">单列</div>
  </section>
</template>

<script>
  import _global from '@/views/global.vue'
  import EditBox from "@/ext_components/form/_EditBox.vue";
  import '@/styles/component/iconfont.css';
  import draggable from "vuedraggable";
  import {uuid} from '@/util/assist'
  import { DWFADDINARGSVERSION } from "@/util/DWFVariable";

  const name = 'col';
  export default {
    name: name,
    props: [
      'addin',
      'activeUUID',
      'basicArgs',
      'relation',
      'argsProps',
      'widgetAnnotation',
      'editExtendInfo',
      'itemValue',
      'attributes',
      'query_oprs',
      'route',
      'router',
      'root',
      'store',
      'formCanvas',
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

        // 支持的数据类型
        dataTypes: [],
        marginRadio: '外边距',

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

          align: "Vertical",          // 元素缺省 元素之间的对齐方式

          g_align: 0,                 // 元素之间的对齐方式
          imgOrigin: 'imgSelf',
          back_color: "",             // 背景颜色
          back_picture: "",           // 背景图片,超链接
          bgStyle: 'cover',           // 背景图片显示方式
          bgSize: 'cover',
          bgRepeat: 'no-repeat',
          bgPercent: 100,
          border: true,               // 是否显示开关边框

          marginTop: 0,
          marginTopType: 'px',
          marginBottom: 0,
          marginBottomType: 'px',
          marginLeft: 0,
          marginLeftType: 'px',
          marginRight: 0,
          marginRightType: 'px',

          paddingTop: 5,
          paddingTopType: 'px',
          paddingBottom: 5,
          paddingBottomType: 'px',
          paddingLeft: 5,
          paddingLeftType: 'px',
          paddingRight: 5,
          paddingRightType: 'px',

          tbColor: '#bbb',
          tbWidth: 0,
          tbStyle: 'dashed',

          bbColor: '#bbb',
          bbWidth: 0,
          bbStyle: 'dashed',

          lbColor: '#bbb',
          lbWidth: 0,
          lbStyle: 'dashed',

          rbColor: '#bbb',
          rbWidth: 0,
          rbStyle: 'dashed',

          ltRadius: 0,
          ltRadiusType: 'px',

          rtRadius: 0,
          rtRadiusType: 'px',

          lbRadius: 0,
          lbRadiusType: 'px',

          rbRadius: 0,
          rbRadiusType: 'px',

          shadowType: '外阴影',
          xShadow: 0,
          yShadow: 0,
          blurShadow: 0,
          spreadShadow: 0,
          shadowColor: '',

          // 以下为不在属性编辑框中设置,但默认要有的配置项
          layout: true,               // 表示自己是布局空间(即不需要目标属性)
          title: "单列",               // 插件中文名,需要填入默认值

          span: 8,
          offset: 0,
          push: 0,
          pull: 0,
          // 布局插件所需属性
          type: "flex",
          // align: "middle",
          justify: "start",

          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          picActIndex: -1,
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        },

        node: null,
        timer: null,

      // 继承属性
      // inherit: ["label_width", "main_width", "main_align", "label_align", "basic_height", "col"],
      inherit: [],
      // formAddinList: [],
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
    // this.formAddinList =
  },
  mounted() {
    if (this.t_preview) {
      let that = this;
      this.timer = setInterval(() => {
        that.node = that.GetJsonById(that.itemValue.data, that.args.id);
        if (that.node) {
          // console.log("node:", that.node);
          clearInterval(that.timer);
          that.timer = null;
        }
      }, 100);
    }
  },
  computed: {

    arg_width() {
      return this.args.width + this.args.widthType;
    },

    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },

      arg_mt() {
        return this.args.marginTop + this.args.marginTopType;
      },

      arg_mb() {
        return this.args.marginBottom + this.args.marginBottomType;
      },

      arg_ml() {
        return this.args.marginLeft + this.args.marginLeftType;
      },

      arg_mr() {
        return this.args.marginRight + this.args.marginRightType;
      },

      arg_pt() {
        return this.args.paddingTop + this.args.paddingTopType + ' !important';
      },

      arg_pb() {
        return this.args.paddingBottom + this.args.paddingBottomType  + ' !important';
      },

      arg_pl() {
        return this.args.paddingLeft + this.args.paddingLeftType  + ' !important';
      },

      arg_pr() {
        return this.args.paddingRight + this.args.paddingRightType  + ' !important';
      },

      arg_ltRadius() {
        return this.args.ltRadius + this.args.ltRadiusType;
      },

      arg_rtRadius() {
        return this.args.rtRadius + this.args.rtRadiusType;
      },

      arg_lbRadius() {
        return this.args.lbRadius + this.args.lbRadiusType;
      },

      arg_rbRadius() {
        return this.args.rbRadius + this.args.rbRadiusType;
      },

      arg_shadow() {
        return this.args.shadowType == '外阴影' ? `${this.args.xShadow}px ${this.args.yShadow}px ${this.args.blurShadow}px ${this.args.spreadShadow}px ${this.args.shadowColor}`: `${this.args.xShadow}px ${this.args.yShadow}px ${this.args.blurShadow}px ${this.args.spreadShadow}px ${this.args.shadowColor} inset`;
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
          // if (this.args.back_picture != '') {

          //   getFilesById(this.args.back_picture).then(response => {

          //     this.noBgFlag = !response.success;

          //   }).catch(e => {
          //     this.noBgFlag = true;
          //     console.log(e);
          //   });

          // }

          if (this.args.back_picture == '') {
            finalBg = '';
          } else {
            // if (this.noBgFlag) {
            //   finalBg = `url(${noBg})`
            // } else {
              finalBg = `url(${this.baseUrl}/files-download/${this.args.back_picture})`
            // }
          }
        }
        return finalBg;

    },
    args_label_width() {
      return this.args.label_width;
    },
    args_label_widthByPx(){
      return this.args.label_widthByPx;
    },
    args_labelWidthUnit(){
      return this.args.labelWidthUnit;
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
    args_radius(){
      return this.args.ltRadius == 0 && this.args.rtRadius == 0 && this.args.lbRadius == 0 && this.args.rbRadius == 0
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
    // refreshFormAddinList(){
    //   this.formAddinList = this.addin.length !== 0 ? this.addin.map(addin => {
    //     return {
    //       name: addin.self.elementType.replace('addin_', ''),
    //       uuid: addin.self.uuid,
    //       addin: addin,
    //     }
    //   }) : [];
    // },
   radiusChange(value, type) {
     if(value > -1) return
     this.$nextTick(() => {
       switch(type){
         case 'lt':
           this.args.ltRadius = 0
           break
         case 'rt':
           this.args.rtRadius = 0
           break
         case 'lb':
           this.args.lbRadius = 0
           break
         case 'rb':
           this.args.rbRadius = 0
           break
       }
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
        if ("radius" in args && this.args.radius != '') {


          if(this.args.ltRadius == 0 && this.args.rtRadius == 0 && this.args.lbRadius == 0 && this.args.rbRadius == 0) {

            this.args.rtRadius = this.args.lbRadius = this.args.rbRadius = this.args.ltRadius = this.args.radius;
            this.args.rtRadiusType = this.args.lbRadiusType = this.args.rbRadiusType = this.args.ltRadiusType = this.args.radiusType;

          }

        }

        if(!('alignItems' in args)){
          this.args.alignItems = 'flex-start';
          this.args.justifyContent = 'flex-start';
        }
        return this;
      },

      // 设置背景图片
      drawBg() {

      },

      // 同步设置边距值
      attachMargin() {

        if(this.marginRadio == '外边距') {

          this.args.marginBottom = this.args.marginLeft = this.args.marginRight = this.args.marginTop;
          this.args.marginBottomType = this.args.marginLeftType = this.args.marginRightType = this.args.marginTopType;

        } else {

          this.args.paddingBottom = this.args.paddingLeft = this.args.paddingRight = this.args.paddingTop;
          this.args.paddingBottomType = this.args.paddingLeftType = this.args.paddingRightType = this.args.paddingTopType;

        }

      },

      // 同步设置radius
      attachRadius() {

        this.args.rtRadius = this.args.lbRadius = this.args.rbRadius = this.args.ltRadius;
        this.args.rtRadiusType = this.args.lbRadiusType = this.args.rbRadiusType = this.args.ltRadiusType;

      },

      // 同步边框
      attachBorder() {

        this.args.bbColor = this.args.lbColor = this.args.rbColor = this.args.tbColor;
        this.args.bbWidth = this.args.lbWidth = this.args.rbWidth = this.args.tbWidth;
        this.args.bbStyle = this.args.lbStyle = this.args.rbStyle = this.args.tbStyle;

      },

    // 获取表单项名
    getFormName() {
      return this.args.name;
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
      this.t_icon = false;
      if (type == 0) this.t_preview = true;
      else this.t_icon = true;
      return this;
    },

      getDataType(args) {
        return this.dataTypes;
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
                  properties: {

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
      if(parentUUID === this.addin.self.uuid){
        //点击复制按钮联动更新draggable的list
        let element = {
          name: addin.self.elementType.replace('addin_', ''),
          uuid: addin.self.uuid,
          addin: addin,
        }
        // this.formAddinList.push(element);
      }
      this.$emit('copyAddin', addin, parentUUID);
    },

    removeAddin(uuid, parentUUID = this.addin.self.uuid, deleteButton){
      if(parentUUID === this.addin.self.uuid){
        //点击删除按钮联动删除draggable的list
        // let index = this.formAddinList.findIndex(addin => addin.uuid === uuid);
        // this.formAddinList.splice(index, 1);
      }
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
      args_label_widthByPx(val){
        if (!this.node) return;
        this.node.elements.forEach(x => {
          if ("label_widthByPx" in x.self.properties) {
            x.self.properties.label_widthByPx = this.args.label_widthByPx;
          }
        })
      },
      args_labelWidthUnit(){
        if (!this.node) return;
        this.node.elements.forEach(x => {
          if ("labelWidthUnit" in x.self.properties) {
            x.self.properties.labelWidthUnit = this.args.labelWidthUnit;
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
      'args.blurShadow'(val){
        if(val < 0){
          this.$nextTick(() => {
            this.args.blurShadow = 0;
          })
        }
      }
    }
  }
</script>

<style scoped>
section {
  height: auto;
  display: inline-block;
}

</style>