<template>
  <!--
      应用前端,即插件的实际显示样式
      :addinName="name"和ref="main"一般情况不可去除
-->
  <section :addinName="name" :style="{'width': colWidth}" ref="main">
    <!--
            插件前端实现区域
    -->
    <template v-if="args.label_block_align == 'up'">
      <div v-show="!args.hided" ref="label" :style="{'width': '100%', 'height': arg_height, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center'}">
        <div v-show="args.useIcon && !args.hided" :style="{'height': arg_icon_height, 'width': arg_icon_width, 'float': 'left'}">
          <div
                  :style="{'width':'100%','height':'100%',
                backgroundImage: 'url('+args.back_picture+')',
                'background-repeat': 'no-repeat',
                        'background-size': 'cover'}"
          ></div>
        </div>
        <div :style="{'width': contentWidth, 'display': 'inline-block', 'float': 'left'}">
          <div :style="{'height': '30px', 'width': '100%', 'display': 'inline-block'}">
         <span
                 v-if="args.required || args.label"
                 :style="{'height': '30px', 'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'padding-right': '10px'}"
         >
          <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': labelYAlignFlex, 'justify-content': labelXAlign}">
            <span v-if="args.required" style="color: red">*</span>
            <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
        </span>
          </div>
          <div :style="{'height': '30px', 'width': '100%', 'display': 'inline-block'}">
          <span
                  :style="{'height': '30px', 'width': mainWidth, 'display': 'inline-block',
              'text-align': mainXAlign, 'color': args.main_fontColor}"
          >
        <span v-show="!args.hided" :style="{'background-color': args.main_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
          <div class="iCountUp">
            <span class="self-color"
                  :style="{'color': args_sign_fontColor, 'font-size': args_signSize}">{{ args.sign }}</span>
            <Poptip v-if="needPop && !args.CommonOpAuth" :placement="popClickDirection" :width="popClickObj.popWidth">
              <div style="display: inline-block;" @click="handleClick">
                <ICountUp
                        ref="countup"
                        class="self-color"
                        :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                        v-if="args.countUpAnimate"
                        :delay="args.delay"
                        :endVal="args.endVal"
                        :options="args.options"
                        @ready="onReady"
                        @update="onUpdate"
                />
                <span
                        class="self-color"
                        :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                        v-if="!args.countUpAnimate">
                  {{ args.endVal }}
                </span>
              </div>
              <div v-show="popClickObj.needPopTitle" slot="title"><span
                      :style="{'color': popClickObj.popTitleColor, 'font-size': `${popClickObj.popTitleFs}px`}">{{ popClickObj.popTitleTxt }}</span></div>
              <div slot="content">
                <FormEngine
                        ref="form"
                        :to_path="popClickPath"
                        :to_query="popClickQuery"
                        :store="store">
                </FormEngine>
              </div>
            </Poptip>
            <div v-show="!needPop && !args.CommonOpAuth" style="display: inline-block;" @click="handleClick">
              <ICountUp
                      ref="countup"
                      class="self-color"
                      :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                      v-if="args.countUpAnimate"
                      :delay="args.delay"
                      :endVal="args.endVal"
                      :options="args.options"
                      @ready="onReady"
                      @update="onUpdate"
              />
              <span
                      class="self-color"
                      :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                      v-if="!args.countUpAnimate">
                {{ args.endVal }}
              </span>
            </div>
            <span class="self-color"
                  :style="{'color': args_unit_fontColor, 'font-size': args_unitSize}">{{ args.unit }}</span>
            <Icon type="md-arrow-round-up" v-if="increase" class="increase animated infinite fadeInUp"/>
            <Icon type="md-arrow-round-down" v-if="decrease" class="decrease animated infinite fadeInDown"/>
          </div>
        </span>
    </span>
          </div>
        </div>
      </div>
      <span v-show="isWrong && !args.hided" :style="{'width': '100%', 'display': 'inline-block'}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>
    </template>
    <template v-if="args.label_block_align == 'down'">
      <div v-show="!args.hided" ref="label" :style="{'width': '100%', 'height': arg_height, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center'}">
        <div v-show="args.useIcon && !args.hided" :style="{'height': arg_icon_height, 'width': arg_icon_width, 'float': 'left'}">
          <div
                  :style="{'width':'100%','height':'100%',
                  backgroundImage: 'url('+args.back_picture+')',
                  'background-repeat': 'no-repeat',
                          'background-size': 'cover'}"
          ></div>
        </div>
        <div :style="{'width': contentWidth, 'display': 'inline-block', 'float': 'left'}">
          <div :style="{'height': '30px', 'width': '100%', 'display': 'inline-block'}">
          <span
                  :style="{'height': '30px', 'width': mainWidth, 'height': '30px', 'display': 'inline-block',
              'text-align': mainXAlign, 'color': args.main_fontColor}"
          >
        <span v-show="!args.hided"  :style="{'background-color': args.main_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
          <div class="iCountUp">
            <span class="self-color"
                  :style="{'color': args_sign_fontColor, 'font-size': args_signSize}">{{ args.sign }}</span>
            <Poptip v-if="needPop && !args.CommonOpAuth" :placement="popClickDirection" :width="popClickObj.popWidth">
              <div style="display: inline-block;" @click="handleClick">
                <ICountUp
                        ref="countup"
                        class="self-color"
                        :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                        v-if="args.countUpAnimate"
                        :delay="args.delay"
                        :endVal="args.endVal"
                        :options="args.options"
                        @ready="onReady"
                        @update="onUpdate"
                />
                <span
                        class="self-color"
                        :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                        v-if="!args.countUpAnimate">
                  {{ args.endVal }}
                </span>
              </div>
              <div v-show="popClickObj.needPopTitle" slot="title"><span
                      :style="{'color': popClickObj.popTitleColor, 'font-size': `${popClickObj.popTitleFs}px`}">{{ popClickObj.popTitleTxt }}</span></div>
              <div slot="content">
                <FormEngine
                        ref="form"
                        :to_path="popClickPath"
                        :to_query="popClickQuery"
                        :store="store">
                </FormEngine>
              </div>
            </Poptip>
            <div v-show="!needPop && !args.CommonOpAuth" style="display: inline-block;" @click="handleClick">
              <ICountUp
                      ref="countup"
                      class="self-color"
                      :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                      v-if="args.countUpAnimate"
                      :delay="args.delay"
                      :endVal="args.endVal"
                      :options="args.options"
                      @ready="onReady"
                      @update="onUpdate"
              />
              <span
                      class="self-color"
                      :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                      v-if="!args.countUpAnimate">
                {{ args.endVal }}
              </span>
            </div>
            <span class="self-color"
                  :style="{'color': args_unit_fontColor, 'font-size': args_unitSize}">{{ args.unit }}</span>
            <Icon type="md-arrow-round-up" v-if="increase" class="increase animated infinite fadeInUp"/>
            <Icon type="md-arrow-round-down" v-if="decrease" class="decrease animated infinite fadeInDown"/>
          </div>
        </span>
    </span>
          </div>
          <div :style="{'height': '30px', 'width': '100%', 'display': 'inline-block'}">
         <span
                 v-if="args.required || args.label"
                 :style="{'height': '30px', 'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'padding-right': '10px'}"
         >
          <span v-show="!args.hided"  :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': labelYAlignFlex, 'justify-content': labelXAlign}">
            <span v-if="args.required" style="color: red">*</span>
            <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
        </span>
          </div>
        </div>
      </div>
      <span v-show="isWrong && !args.hided" :style="{'width': '100%', 'display': 'inline-block'}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>
    </template>
    <template v-if="args.label_block_align == 'left'">
      <div v-show="!args.hided" ref="label" :style="{'width': '100%', 'height': arg_height, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center'}">
        <div v-show="args.useIcon && !args.hided" :style="{'height': arg_icon_height, 'width': arg_icon_width, 'float': 'left'}">
          <div
                  :style="{'width':'100%','height':'100%',
                  backgroundImage: 'url('+args.back_picture+')',
                  'background-repeat': 'no-repeat',
                          'background-size': 'cover'}"
          ></div>
        </div>
        <span
                v-if="args.required || args.label"
                :style="{'height': '30px', 'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'padding-right': '10px'}"
        >
          <span v-show="!args.hided"  :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': labelYAlignFlex, 'justify-content': labelXAlign}">
            <span v-if="args.required" style="color: red">*</span>
            <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
        </span>
        <span
                :style="{'height': '30px', 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
        >
      <span v-show="!args.hided"  :style="{'background-color': args.main_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
        <div class="iCountUp">
          <span class="self-color"
                :style="{'color': args_sign_fontColor, 'font-size': args_signSize}">{{ args.sign }}</span>
            <Poptip v-if="needPop && !args.CommonOpAuth" :placement="popClickDirection" :width="popClickObj.popWidth">
              <div style="display: inline-block;" @click="handleClick">
                <ICountUp
                        class="self-color"
                        :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                        v-if="args.countUpAnimate"
                        :delay="args.delay"
                        :endVal="args.endVal"
                        :options="args.options"
                        @ready="onReady"
                        @update="onUpdate"
                />
                <span
                        class="self-color"
                        :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                        v-if="!args.countUpAnimate">
                  {{ args.endVal }}
                </span>
              </div>
              <div v-show="popClickObj.needPopTitle" slot="title"><span
                      :style="{'color': popClickObj.popTitleColor, 'font-size': `${popClickObj.popTitleFs}px`}">{{ popClickObj.popTitleTxt }}</span></div>
              <div slot="content">
                <FormEngine
                        ref="form"
                        :to_path="popClickPath"
                        :to_query="popClickQuery"
                        :store="store">
                </FormEngine>
              </div>
            </Poptip>
            <div v-show="!needPop && !args.CommonOpAuth" style="display: inline-block;" @click="handleClick">
              <ICountUp
                      class="self-color"
                      :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                      v-if="args.countUpAnimate"
                      :delay="args.delay"
                      :endVal="args.endVal"
                      :options="args.options"
                      @ready="onReady"
                      @update="onUpdate"
              />
              <span
                      class="self-color"
                      :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                      v-if="!args.countUpAnimate">
                {{ args.endVal }}
              </span>
            </div>
          <span class="self-color"
                :style="{'color': args_unit_fontColor, 'font-size': args_unitSize}">{{ args.unit }}</span>

            <Icon type="md-arrow-round-up" v-if="increase" class="increase animated infinite fadeInUp"/>
            <Icon type="md-arrow-round-down" v-if="decrease" class="decrease animated infinite fadeInDown"/>
        </div>
      </span>
  </span>
      </div>
      <span v-show="isWrong && !args.hided" :style="{'width': '100%', 'display': 'inline-block'}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>
    </template>
    <template v-if="args.label_block_align == 'right'">
      <div v-show="!args.hided" ref="label" :style="{'width': '100%', 'height': arg_height, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center'}">
        <div v-show="args.useIcon && !args.hided" :style="{'height': arg_icon_height, 'width': arg_icon_width, 'float': 'left'}">
          <div
                  :style="{'width':'100%','height':'100%',
                  backgroundImage: 'url('+args.back_picture+')',
                  'background-repeat': 'no-repeat',
                          'background-size': 'cover'}"
          ></div>
        </div>
        <span
                :style="{'height': '30px', 'width': mainWidth, 'display': 'inline-block',
              'text-align': mainXAlign, 'color': args.main_fontColor}"
        >
        <span v-show="!args.hided" :style="{'background-color': args.main_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
          <div class="iCountUp">
            <span class="self-color"
                  :style="{'color': args_sign_fontColor, 'font-size': args_signSize}">{{ args.sign }}</span>
            <Poptip v-if="needPop && !args.CommonOpAuth" :placement="popClickDirection" :width="popClickObj.popWidth">
              <div style="display: inline-block;" @click="handleClick">
                <ICountUp
                        class="self-color"
                        :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                        v-if="args.countUpAnimate"
                        :delay="args.delay"
                        :endVal="args.endVal"
                        :options="args.options"
                        @ready="onReady"
                        @update="onUpdate"
                />
                <span
                        class="self-color"
                        :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                        v-if="!args.countUpAnimate">
                  {{ args.endVal }}
                </span>
              </div>
              <div v-show="popClickObj.needPopTitle" slot="title"><span
                      :style="{'color': popClickObj.popTitleColor, 'font-size': `${popClickObj.popTitleFs}px`}">{{ popClickObj.popTitleTxt }}</span></div>
              <div slot="content">
                <FormEngine
                        ref="form"
                        :to_path="popClickPath"
                        :to_query="popClickQuery"
                        :store="store">
                </FormEngine>
              </div>
            </Poptip>
            <div v-show="!needPop && !args.CommonOpAuth" style="display: inline-block;" @click="handleClick">
              <ICountUp
                      class="self-color"
                      :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                      v-if="args.countUpAnimate"
                      :delay="args.delay"
                      :endVal="args.endVal"
                      :options="args.options"
                      @ready="onReady"
                      @update="onUpdate"
              />
              <span
                      class="self-color"
                      :style="{'color': args_txt_fontColor, 'font-size': args_fsize}"
                      v-if="!args.countUpAnimate">
                {{ args.endVal }}
              </span>
            </div>
            <span class="self-color"
                  :style="{'color': args_unit_fontColor, 'font-size': args_unitSize}">{{ args.unit }}</span>
            <Icon type="md-arrow-round-up" v-if="increase" class="increase animated infinite fadeInUp"/>
            <Icon type="md-arrow-round-down" v-if="decrease" class="decrease animated infinite fadeInDown"/>
          </div>
        </span>
    </span>
        <span
                v-if="args.required || args.label"
                :style="{'height': '30px', 'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'padding-right': '10px'}"
        >
          <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': labelYAlignFlex, 'justify-content': labelXAlign}">
            <span v-if="args.required" style="color: red">*</span>
            <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
        </span>
      </div>
      <span v-show="isWrong && !args.hided" :style="{'width': '100%', 'display': 'inline-block'}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
      </span>
    </template>

  </section>
</template>

<script>
  import {getEobjSingle, getRobjSingle, getQueryOperation, postResultSub, deleteResultSub} from "@/api/others";
  import "@/styles/component/iconfont.css";
  import ICountUp from 'vue-countup-v2';
  import { uuid } from '@/util/assist'
  import {addListener, removeListener, getSockId} from '@/util/webSocket';
  import FormEngine from '@/views/form-engine/forms-engine.vue'
  import {mapActions, mapGetters} from "vuex";

  // 设置插件英文名, 该name需要与插件文件名一致
  const name = "DynamicDigitalLabel";

  export default {
    name: name,
    /*
       根据需要使用props
       一般情况下都需要itemValue,
       需要设置目标属性时需要attributes, relation
       需要设置事件时需要query_oprs, route, router, root, Message
       需要用到store时需要store
       */
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
      'attributes',
    ],
    data() {
      return {
        wsCommand: '',
        wsId: {},
        times: 0,
        name: name,
        needPop: false,
        popClickObj: {
          needPopTitle: false,
          popTitleTxt: '提示',
          popTitleFs: 14,
          popTitleColor: '#333',
          tipPlacement: 'right',
          popWidth: 400
        },
        popClickDirection: 'right',
        pWidth: 0,
        popClickPath: '',
        popClickQuery: {
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
        increase: false,
        decrease: false,
        optionsChange: true,
        // 属性配置项,按需设置
        args: {
          dynamic: true,
          iotdb: true,
          name: "", // 目标属性
          label: "", // 标签名称
          id: "", // 控件代号,一般为必须
          height: 70, // 整体高度
          heightType: "px", // 整体宽度的单位
          iconheightType: 'px',
          iconwidthType: "px",
          label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
          main_align: 4, // 主区域对齐方式,默认为4居中对齐
          align: "Vertical", // 标签与主区域的排列方式
          label_width: 2,
          main_width: 3, // 标签与主区域的占比为 label_width : main_width
          required: false, // 是否必填
          back_picture: "",
          // 以下为不在属性编辑框中设置,但默认要有的配置项
          title: "动态数字标签", // 插件中文名,需要填入默认值
          col: true, // 是否不占满全部
          cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null, // 目标数据类型
          events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: ["获得焦点"], // 支持的事件列表,元素为事件中文名

          //countUp动态数字

          displayAttribute: '',
          icon_height: 1,
          icon_width: 1,
          label_fontColor: "initial", // 标签字体颜色
          txt_fontColor: "initial",   // 内容字体颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          fsize: 14,                  // 内容文字大小
          fsizeType: 'px',            // 内容文字大小单位
          label_numberColor: "initial", // 字体颜色
          txt_bgColor: '#fff',        // 输入框背景颜色
          signFontColor: 'initial',
          signSize: 14,
          signSizeType: 'px',
          unitFontColor: 'initial',
          unitSize: 14,
          unitSizeType: 'px',
          width: 100,
          widthType: '%',
          label_block_align: 'up',
          useIcon: true,
          countUpAnimate: false,    //显示方式
          countUpRefresh: false,
          unit: '元',               //单位
          sign: '',
          icon: '',
          delay: 0,             //延迟执行时间
          endVal: 0,          //最终值
          options: {
            useEasing: false,
            useGrouping: false,
            decimalPlaces: 0,
            separator: ',',
            decimal: '.',
            prefix: '',
            suffix: ''
          },
          hided: false,
        },

        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ["String", "Integer", "Double", "Long"],

        // 需要设置目标属性时使用
        attrMap: {},
        open: ["1", "2"],
        // 需要动态设置高度时使用
        timer: null,
        value: "",
        isFocus: null,
        isWrong: false,
        errorMessage: '',
        queryData: {
          query: {query: "",}, // 查询条件
          targetClass: "",    // 目标类名
          formName: "",   //
          uuid: ""
        },
      };
    },
    components: {
      ICountUp,
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
      this.targetClass = this.itemValue.data.targetClass;
      this.isRelation = this.itemValue.data.isRelation;
    },
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      if (this.wsId) {
        removeListener(this.wsCommand, this.wsId);
      }
    },
    async mounted() {
      // 需要动态设置高度时使用,不用可删去
      this.setHeight();
      if (this.args.events && this.args.events.length > 0) {
        this.isFocus = this.args.events.find((val) => {
          return val.name == '获得焦点'
        })
        if (this.isFocus != null && this.isFocus.opr_path != undefined && this.isFocus.opr_path != '') {
          getQueryOperation(this.isFocus.opr_path).then(response => {
            let res = response.data;
            if (res.success && res.data) {

              let oName = res.data.conType;

              if (oName != 'tip') {
                this.needPop = false;
              }

              if (oName == 'tip') {

                this.popClickObj = JSON.parse(res.data.viewType);
                this.popClickDirection = this.actions[this.popClickObj.tipPlacement];

                this.popClickPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
                this.needPop = true;
                // this.pWidth = document.getElementById("inputDiv").offsetWidth;

              }

            } else {
              console.log(res.message);
            }
          }).catch(e => {
            console.log(e);
          });
        }
      }

      if(Array.isArray(this.attributes) && this.attributes.filter(item => item.attributeName === this.args.name).length !== 0 && this.attributes.find(item => item.attributeName === this.args.name).valueType === 'Timeseries'){
        if(this.args.dynamic){
          let queryObjReq = {
            seriesInfos: [{
              attrName: this.args.name,
              count: 1,
              type: "latest"
            }]
          };
          this.createResultSub(queryObjReq);
          this.wsCommand = "objects command " + this.targetClass;
          this.wsId = addListener(this.wsCommand, (data) => {
            // this.setValue(data);
            //TODO:时序动态响应
            console.log(data)
          });
        }
      }


      if(this.args.bindTargetClass && this.args.displayFormat){
        //判断显示字段是否有权限
        this.auth = false;
        try{
          let className = this.args.bindTargetClass.split('\&')[0];
          this.targetMeta = this.AttributesByClass(className).length === 0 ? await this.getAttributeClassMap(className) : this.AttributesByClass(className);
          let unionDisplayFormat = this.targetMeta.filter(item => this.args.displayFormat.indexOf(item.attributeName) !== -1);
          unionDisplayFormat.forEach(item => {
            if(item.restrictedAccess.length !== 0){
              this.auth = this.auth || item.restrictedAccess.indexOf('CommonOpAuth') !== -1
            }
          })
        }catch (e) {
          console.log(`权限错误${e}`)
        }
        this.freshData(this.args.filterQuery);
      }
    },
    watch: {
      // 需要设置目标属性时使用,不用可删去
      arg_name(val) {
        if (val in this.attrMap) {
          this.args.targetDataType = this.attrMap[val].valueType;
          if (this.relation) {
            if (val.startsWith("left_"))
              this.args.label =
                (this.relation.leftRole != ""
                  ? this.relation.leftRole
                  : this.relation.leftClass) +
                "的" +
                this.attrMap[val].displayName;
            if (val.startsWith("right_"))
              this.args.label =
                (this.relation.rightRole != ""
                  ? this.relation.rightRole
                  : this.relation.rightClass) +
                "的" +
                this.attrMap[val].displayName;
            if (val.startsWith("relation_"))
              this.args.label = this.attrMap[val].displayName;
          } else this.args.label = this.attrMap[val].displayName;
          let name = val;
          if (this.relation) {
            if (name.startsWith("left_")) name = name.substring(5);
            else if (name.startsWith("right_")) name = name.substring(6);
            else if (name.startsWith("relation_")) name = name.substring(9);
          }
          let attr = this.store.state.DWF_form.Attributes[name];
          if (attr && attr.defaultValue) this.value = attr.defaultValue;
        } else this.args.targetDataType = null;
      }

    },
    computed: {
      ...mapGetters("DWF_form", [
        "singleObjectSelectByClass",
        "AttributesByClass",
        "Entities",
        "getEntity",
        "QueryResultAll",
        "QueryResult",
        "Relations",
        "RelationAttrList",]
      ),
      // 需要设置目标属性时使用,不用可删去
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },

      args_signSize() {
        return this.args.signSize + this.args.signSizeType + '!important';
      },
      args_unitSize() {
        return this.args.unitSize + this.args.unitSizeType + '!important';
      },
      args_label_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + ' !important'
      },
      args_txt_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? this.args.txt_fontColor : this.args.txt_fontColor + ' !important';
      },
      args_sign_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.signFontColor == 'initial' ? this.args.signFontColor : this.args.signFontColor + ' !important'
      },
      args_unit_fontColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.unitFontColor == 'initial' ? this.args.unitFontColor : this.args.unitFontColor + ' !important';
      },
      arg_name() {
        return this.args.name;
      },

      arg_width() {
        return this.args.width + this.args.widthType;
      },

      // 需要设置目标属性时使用,不用可删去
      filter_attributes() {
        return this.attributes
          ? this.relation
            ? [
              "relation",
              this.attributes[1].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[2].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[3].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              )
            ]
            : this.attributes.filter(
              x => this.dataTypes.indexOf(x.valueType) > -1
            )
          : [];
      },
      arg_height() {
        return this.args.height < 2 ? this.args.height * 70 + "px" : this.args.height + this.args.heightType;
      },

      arg_icon_width() {
        return this.args.icon_width < 2
          ? this.args.icon_width * 30 + "px"
          : this.args.icon_width > 15 && this.args.iconwidthType !== 'px'
            ? 10 + this.args.iconwidthType
            : this.args.icon_width > 150 && this.args.iconwidthType == 'px'
              ? '150px'
              : this.args.icon_width + this.args.iconwidthType;
      },
      arg_icon_height() {
        return this.args.icon_height < 2
          ? this.args.icon_height * 30 + "px"
          : this.args.icon_height > 15 && this.args.iconheightType !== 'px'
            ? 10 + this.args.iconheightType
            : this.args.icon_height > 150 && this.args.iconheightType == 'px'
              ? '150px'
              : this.args.icon_height + this.args.iconheightType;
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
      //如果上下格式宽都为100%
      labelWidth() {
        if(this.args.label_block_align == 'up' || this.args.label_block_align == 'down'){
          return '100%';
        }else{
          if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
            return (!this.args.label || this.args.label == "") ? "10%" : this.args.label_widthByPx + 'px';
          }else{
            return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.useIcon ?
              parseInt((80 * this.args.label_width) / (this.args.label_width + this.args.main_width)) + "%" : parseInt((100 * this.args.label_width) / (this.args.label_width + this.args.main_width)) + "%";
          }
        }
      },
      //如果上下格式宽都为100%
      mainWidth() {
        if(this.args.label_block_align == 'up' || this.args.label_block_align == 'down'){
          return '100%';
        }else{
          if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
            return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : `calc(100% - ${this.args.label_widthByPx}px)`;
          }else{
            return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : this.args.useIcon
              ? parseInt((80 * this.args.main_width) / (this.args.label_width + this.args.main_width)) + "%" : parseInt((100 * this.args.main_width) / (this.args.label_width + this.args.main_width)) + "%";
          }
        }
      },
      labelXAlign() {
        let x = parseInt(this.args.label_align / 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      labelYAlign() {
        let x = this.args.label_align % 3;
        if (x == 0) return "top";
        else if (x == 1) return "middle";
        else return "bottom";
      },
      labelYAlignFlex(){
        let x = this.args.label_align % 3;
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
      },
      mainXAlign() {
        let x = parseInt(this.args.main_align / 3);
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
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
    },
    // 销毁函数,清除生成的内存占用
    methods: {
      ...mapActions("DWF_form", ["handleQueryData", "queryRelation", "getAttributeClassMap"]),

      async freshData(query){
        if(this.auth) return;
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
        this.queryData.query.query = this.parsedQuery = this.parseEscapeString(query, null, null, this.itemValue.data.origin ,this.attributes, this.$store);
        this.queryData.fresh = true;
        this.queryData.query.startIndex = 0;
        this.queryData.query.pageSize = 1;
        this.resultList = await this.handleQueryData(this.queryData);
        this.result = this.QueryResultAll(this.queryData) || [];
        if(this.result.length !== 0 && this.args.displayFormat){
          let value = this.result[0][this.args.displayFormat] === 0 || this.result[0][this.args.displayFormat]  ? this.result[0][this.args.displayFormat]  : null;
          this._setValue(value)
        }else{
          this._setValue(null)
        }
      },

      createResultSub(query) {
        this.destroyResultSub();
        let sockId = getSockId();
        if (sockId) {
          this.resultSubId = uuid();
          postResultSub([
            {
              className: this.targetClass,
              connId: getSockId(),
              queryObjReq: query,
              refreshInterval: 1000,
              subscriptionId: this.resultSubId
            }
          ]);
        }
      },

      destroyResultSub() {
        if (this.resultSubId) {
          deleteResultSub([this.resultSubId]);
          this.resultSubId = null;
        }
      },

      onDynamic(value) {
        let valueCatch = this.args.endVal;
        if (this.args.dynamic) {
          if (value == null || value == '') {
            if(this.args.bindTargetClass && this.args.bindTargetClass.split('\&')[0] === this.targetClass && this.args.displayFormat){
              // this._setValue(value);
            }else if(!this.args.bindTargetClass){
              this.setValue(value);
            }
          } else {
            if(this.args.bindTargetClass && this.args.bindTargetClass.split('\&')[0] === this.targetClass && this.args.displayFormat){
              // this._setValue(value || 0);
              // if(this.args.endVal < parseFloat(value)){
              //   this.increase = true, this.decrease = false
              // }else if(this.args.endVal > parseFloat(value)){
              //   this.increase = false, this.decrease = true
              // }else{
              //   this.increase = false, this.decrease = false
              // }
            }else if(!this.args.bindTargetClass){
              this.setValue(value || 0);
              if(valueCatch < parseFloat(value)){
                this.increase = true, this.decrease = false
              }else if(valueCatch > parseFloat(value)){
                this.increase = false, this.decrease = true
              }else{
                this.increase = false, this.decrease = false
              }
            }
          }
        }
      },
      setInheritStyle() {
        if (sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_bgColor == '#fff') {
          this.args.txt_bgColor = 'initial';
        }
      },
      handleClick() {
        if (this.isFocus && this.isFocus != undefined) {
          this.invokeOperation(this.isFocus.opr_type, this.isFocus.opr_path, this.itemValue, this.store);
        }
      },
      setError(error, message = '') {
        this.isWrong = error;
        var dom = this.$refs.label;
        if (dom) dom.style.border = error ? "1px solid red" : null;
        this.errorMessage = error ? message : '';
        return this;
      },

      validate() {
        return true;
      },
      getValue() {
        return this.args.text;
      },
      /**
       * 目标类数字标签用setValue实现
       */
      _setValue(value){
        if (value === null || value === '') {
          this.args.text = "defaultValue" in this.args ? this.args.defaultValue : value;
          if(isNaN(parseFloat(this.args.text))){
            this.args.countUpAnimate = false;
            this.args.text = 'NaN';
            this.args.endVal = 'NaN';
          }else{
            this.args.endVal = parseFloat(this.args.text);
          }
        } else {
          // if(value && value.toString().split('\.')[1]){
          //   this.optionsChange = this.args.options.decimalPlaces >= value.toString().split('\.')[1].length;
          //   this.args.options.decimalPlaces = value.toString().split('\.')[1].length
          // }
          //减少位数之后的value
          let shortValue;
          let length = value.toString().length;
          let double = value.toString().match(/^\d{0,}\.{1}\d{0,6}/g);
          if(double && double.length !== 0){
            length = double[0].length
            if(length > 16){
              // shortValue = double[0].toString().substr(length - 16, length)
              this.args.countUpAnimate = false;
              this.args.text = 'Err';
              this.args.endVal = 'Err';
            }else{
              shortValue = double[0]
              this.args.countUpAnimate = true;
              this.args.text = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
              this.args.endVal = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
            }
          }else if(!/^\d{0,}\.{1}\d{0,}$/g.test(value) && length > 15){
            // shortValue = value.toString().substr(length - 15,length)
            this.args.countUpAnimate = false;
            this.args.text = 'Err';
            this.args.endVal = 'Err';
          }else{
            shortValue = value;
            this.args.countUpAnimate = true;
            this.args.text = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
            this.args.endVal = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
          }

          // this.args.countUpAnimate = true;
          // this.args.text = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
          // this.args.endVal = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
          if(this.$refs.countup){
            this.$refs.countup.update(this.args.endVal);
          }
        }
        this.$nextTick(() => {
          this.optionsChange = true;
        })
      },

      /**
       * 普通数字标签用setValue实现
       */
      async setValue(value) {
        console.log(value)
        if(this.args.bindTargetClass && this.args.displayFormat) {
          this._setValue(value);
          return
        };
        try {
          if(this.attributes.filter(item => item.attributeName === this.args.name).length !== 0 && this.attributes.find(item => item.attributeName === this.args.name).valueType === 'Timeseries'){
            let res;
            if(this.isRelation){
              res = await getRobjSingle(this.targetClass, this.itemValue.data.origin.oid, [
                {
                  attrName: this.args.name,
                  count: 1,
                  type: "latest"
                }
              ]);
            }else{
              res = await getEobjSingle(this.targetClass, this.itemValue.data.origin.oid, [
                {
                  attrName: this.args.name,
                  count: 1,
                  type: "latest"
                }
              ]);
            }
            if(res.data.data && res.data.data[this.args.name].series.length !== 0){
              value = res.data.data[this.args.name].series[0][1];
            }
          }
        }catch (e) {
          console.error('时许属性请求失败');
        }
        if (value === null || value === '') {
          this.args.text = "defaultValue" in this.args ? this.args.defaultValue : value;
          if(isNaN(parseFloat(this.args.text))){
            this.args.countUpAnimate = false;
            this.args.text = 'NaN';
            this.args.endVal = 'NaN';
          }else{
            this.args.endVal = parseFloat(this.args.text);
          }
        } else {
          // if(value && value.toString().split('\.')[1]){
          //   this.optionsChange = this.args.options.decimalPlaces >= value.toString().split('\.')[1].length;
          //   this.args.options.decimalPlaces = value.toString().split('\.')[1].length
          // }
          let shortValue;
          let length = value.toString().length;
          let double = value.toString().match(/^\d{0,}\.{1}\d{0,6}/g);
          if(double && double.length !== 0){
            length = double[0].length
            if(length > 16){
              // shortValue = double[0].toString().substr(length - 16, length)
              this.args.countUpAnimate = false;
              this.args.text = 'Err';
              this.args.endVal = 'Err';
            }else{
              shortValue = double[0]
              this.args.countUpAnimate = true;
              this.args.text = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
              this.args.endVal = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
            }
          }else if(!/^\d{0,}\.{1}\d{0,}$/g.test(value) && length > 15){
            // shortValue = value.toString().substr(length - 15,length)
            this.args.countUpAnimate = false;
            this.args.text = 'Err';
            this.args.endVal = 'Err';
          }else{
            shortValue = value;
            this.args.countUpAnimate = true;
            this.args.text = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
            this.args.endVal = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
          }
          if(this.$refs.countup){
            this.$refs.countup.start();
          }
        }
        this.$nextTick(() => {
          this.optionsChange = true;
        })
        return this;
      },

      async setEngineValue(value) {
        console.log(value)
        if(this.args.bindTargetClass && this.args.displayFormat) {
          // this._setValue(null);
          return
        };
        try {
          if(this.attributes.filter(item => item.attributeName === this.args.name).length !== 0 && this.attributes.find(item => item.attributeName === this.args.name).valueType === 'Timeseries'){
            let res;
            if(this.isRelation){
              res = await getRobjSingle(this.targetClass, this.itemValue.data.origin.oid, [
                {
                  attrName: this.args.name,
                  count: 1,
                  type: "latest"
                }
              ]);
            }else{
              res = await getEobjSingle(this.targetClass, this.itemValue.data.origin.oid, [
                {
                  attrName: this.args.name,
                  count: 1,
                  type: "latest"
                }
              ]);
            }
            if(res.data.data && res.data.data[this.args.name].series.length !== 0){
              value = res.data.data[this.args.name].series[0][1];
            }
          }
        }catch (e) {
          console.error('时许属性请求失败');
        }
        if (value === null || value === '') {
          this.args.text = "defaultValue" in this.args ? this.args.defaultValue : value;
          if(isNaN(parseFloat(this.args.text))){
            this.args.countUpAnimate = false;
            this.args.text = 'NaN';
            this.args.endVal = 'NaN';
          }else{
            this.args.endVal = parseFloat(this.args.text);
          }
        } else {
          // if(value && value.toString().split('\.')[1]){
          //   this.optionsChange = this.args.options.decimalPlaces >= value.toString().split('\.')[1].length;
          //   this.args.options.decimalPlaces = value.toString().split('\.')[1].length
          // }
          let shortValue;
          let length = value.toString().length;
          let double = value.toString().match(/^\d{0,}\.{1}\d{0,6}/g);
          if(double && double.length !== 0){
            length = double[0].length
            if(length > 16){
              // shortValue = double[0].toString().substr(length - 16, length)
              this.args.countUpAnimate = false;
              this.args.text = 'Err';
              this.args.endVal = 'Err';
            }else{
              shortValue = double[0]
              this.args.countUpAnimate = true;
              this.args.text = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
              this.args.endVal = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
            }
          }else if(!/^\d{0,}\.{1}\d{0,}$/g.test(value) && length > 15){
            // shortValue = value.toString().substr(length - 15,length)
            this.args.countUpAnimate = false;
            this.args.text = 'Err';
            this.args.endVal = 'Err';
          }else{
            shortValue = value;
            this.args.countUpAnimate = true;
            this.args.text = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
            this.args.endVal = parseFloat(shortValue) === 0 || parseFloat(shortValue) ? parseFloat(shortValue) : null;
          }
          if(this.$refs.countup){
            this.$refs.countup.start();
          }
        }
        this.$nextTick(() => {
          this.optionsChange = true;
        })
        return this;
      },

      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        if (!this.$refs.main) return;
        let that = this;
        if (this.timer == null) {
          this.timer = setInterval(() => {
            if (!that.$refs.main) {
              clearInterval(that.timer);
              that.timer = null;
              return;
            }
            // 改成你需要的样式
            var dom = that.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) {
              dom.style.height = that.arg_height;
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

      setDisplayType(type) {
        this.t_preview = type == 0;
        return this;
      },

      getFormName() {
        return this.args.name;
      },

      setArgs(args) {
        for (var i in args) {
          if(i === 'endVal' && args[i] === 'NaN'){
            this.args[i] = 0;
          }else{
            this.args[i] = args[i];
          }
        }

        return this;
      },

      getArgs() {
        return this.args;
      },

      getAllow() {
        return null;
      },

      onReady(instance, CountUp) {
        const that = this;
        this.args.instance = instance;
        this.args.instance.update(that.args.endVal);
      },

      onUpdate(instance, CountUp) {
        const that = this;
        this.args.instance ? this.args.instance.update(this.args.endVal) : '';
      },

      // isTimeSeries(){
      //   if(this.args.bindTargetClass.split('\&')[1] === 'r'){
      //     this.attributes.filter(item => item.attributeName === this.args.name).length !== 0 && this.attributes.find(item => item.attributeName === this.args.name).valueType === 'Timeseries'
      //   }
      // }
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

  .increase {
    color: red;
    font-size: 16px;
  }

  .decrease {
    color: green;
    font-size: 16px;
  }

  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }

  @-webkit-keyframes fadeInUp {
    from {
      opacity: 0;
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
    }
    20%,
    30%,
    40% {
      opacity: 1;
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    70%,
    80%,
    to {
      opacity: 0;
      -webkit-transform: translate3d(0, -100%, 0);
      transform: translate3d(0, -100%, 0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
    }
    20%,
    30%,
    40% {
      opacity: 1;
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    70%,
    80%,
    to {
      opacity: 0;
      -webkit-transform: translate3d(0, -100%, 0);
      transform: translate3d(0, -100%, 0);
    }
  }

  .fadeInUp {
    -webkit-animation-name: fadeInUp;
    animation-name: fadeInUp;
  }


  @-webkit-keyframes fadeInDown {
    from {
      opacity: 0;
      -webkit-transform: translate3d(0, -100%, 0);
      transform: translate3d(0, -100%, 0);
    }

    20%,
    30%,
    40% {
      opacity: 1;
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    70%,
    80%,
    to {
      opacity: 0;
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      -webkit-transform: translate3d(0, -100%, 0);
      transform: translate3d(0, -100%, 0);
    }

    20%,
    30%,
    40% {
      opacity: 1;
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    70%,
    80%,
    to {
      opacity: 0;
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
    }
  }

  .fadeInDown {
    -webkit-animation-name: fadeInDown;
    animation-name: fadeInDown;
  }

  .animated {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
  }

  .animated.infinite {
    -webkit-animation-iteration-count: infinite;
    animation-iteration-count: infinite;
  }
</style>
