<template>
  <!--
        建模时的预览前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
<!-- bug 5955疑似冲突？ -->
  <section v-if="t_preview" :addinName="name"
           :style="{'width': colWidth,'height': arg_height}"
           ref="main">
    <section
      style="display: flex;"
      :style="{'width': '100%','height': arg_height}"
    >
      <section :style="{'display': 'flex', 'align-items': 'center', 'justify-content': 'center'}">
        <template v-if="args.label_block_align == 'up'">
          <div v-show="args.useIcon" :style="{'height': arg_icon_height, 'width': arg_icon_width, 'float': 'left'}">
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
            'text-align': labelXAlign}"
         >
          <span :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': labelYAlignFlex, 'justify-content': labelXAlign}">
            <span v-if="args.required" style="color: red">*</span>
            <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
        </span>
            </div>
            <div :style="{'height': '30px', 'width': '100%', 'display': 'inline-block'}">
          <span
            :style="{'height': '30px', 'width': mainWidth, 'display': 'inline-block',
              'text-align': mainXAlign, 'color': args.main_fontColor}"
          >
        <span :style="{'background-color': args.main_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
          <div class="iCountUp" :style="{'font-size': args_fsize}">
            <span :style="{'color': args.signFontColor, 'font-size': args_signSize}">{{ args.sign }}</span>
            <ICountUp
              :style="{'color': args.txt_fontColor, 'font-size': args_fsize}"
              v-if="args.countUpAnimate"
              :delay="args.delay"
              :endVal="args.endVal"
              :options="args.options"
              @ready="onReady"
            />
            <span
              :style="{'color': args.txt_fontColor, 'font-size': args_fsize}"
              v-if="!args.countUpAnimate">
              {{ args.endVal }}
            </span>
            <span :style="{'color': args.unitFontColor, 'font-size': args_unitSize}">{{ args.unit }}</span>
          </div>
        </span>
    </span>
            </div>
          </div>
        </template>
        <template v-if="args.label_block_align == 'down'">
          <div v-show="args.useIcon" :style="{'height': arg_icon_height, 'width': arg_icon_width, 'float': 'left'}">
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
            :style="{'height': '30px', 'width': mainWidth, 'display': 'inline-block',
              'text-align': mainXAlign, 'color': args.main_fontColor}"
          >
        <span :style="{'background-color': args.main_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
          <div class="iCountUp" :style="{'background-color': args.txt_bgColor}">
            <span :style="{'color': args.signFontColor, 'font-size': args_signSize}">{{ args.sign }}</span>
            <ICountUp
              :style="{'color': args.txt_fontColor, 'font-size': args_fsize}"
              v-if="args.countUpAnimate"
              :delay="args.delay"
              :endVal="args.endVal"
              :options="args.options"
              @ready="onReady"
            />
            <span
              :style="{'color': args.txt_fontColor, 'font-size': args_fsize}"
              v-if="!args.countUpAnimate">
              {{ args.endVal }}
            </span>
            <span :style="{'color': args.unitFontColor, 'font-size': args_unitSize}">{{ args.unit }}</span>
          </div>
        </span>
    </span>
            </div>
            <div :style="{'height': '30px', 'width': '100%', 'display': 'inline-block'}">
         <span
           v-if="args.required || args.label"
           :style="{'height': '30px', 'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign}"
         >
          <span :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': labelYAlignFlex, 'justify-content': labelXAlign}">
            <span v-if="args.required" style="color: red">*</span>
            <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
        </span>
            </div>
          </div>
        </template>
        <template v-if="args.label_block_align == 'left'">
          <div v-show="args.useIcon" :style="{'height': arg_icon_height, 'width': arg_icon_width, 'float': 'left'}">
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
          'text-align': labelXAlign}"
          >
        <span :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': labelYAlignFlex, 'justify-content': labelXAlign}">
          <span v-if="args.required" style="color: red">*</span>
          <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
        </span>
      </span>
          <span
            :style="{'height': '30px', 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
          >
      <span :style="{'background-color': args.main_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
        <div class="iCountUp" :style="{'background-color': args.txt_bgColor}">
          <span :style="{'color': args.signFontColor, 'font-size': args_signSize}">{{ args.sign }}</span>
          <ICountUp
            :style="{'color': args.txt_fontColor, 'font-size': args_fsize}"
            v-if="args.countUpAnimate"
            :delay="args.delay"
            :endVal="args.endVal"
            :options="args.options"
            @ready="onReady"
          />
          <span
            :style="{'color': args.txt_fontColor, 'font-size': args_fsize}"
            v-if="!args.countUpAnimate">
            {{ args.endVal }}
          </span>
          <span :style="{'color': args.unitFontColor, 'font-size': args_unitSize}">{{ args.unit }}</span>
        </div>
      </span>
  </span>
        </template>
        <template v-if="args.label_block_align == 'right'">
          <div v-show="args.useIcon" :style="{'height': arg_icon_height, 'width': arg_icon_width, 'float': 'left'}">
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
     <span :style="{'background-color': args.main_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
        <div class="iCountUp" :style="{'background-color': args.txt_bgColor}">
          <span :style="{'color': args.signFontColor, 'font-size': args_signSize}">{{ args.sign }}</span>
          <ICountUp
            :style="{'color': args.txt_fontColor, 'font-size': args_fsize}"
            v-if="args.countUpAnimate"
            :delay="args.delay"
            :endVal="args.endVal"
            :options="args.options"
            @ready="onReady"
          />
          <span
            :style="{'color': args.txt_fontColor, 'font-size': args_fsize}"
            v-if="!args.countUpAnimate">
            {{ args.endVal }}
          </span>
          <span :style="{'color': args.unitFontColor, 'font-size': args_unitSize}">{{ args.unit }}</span>
        </div>
      </span>
  </span>
          <span
            v-if="args.required || args.label"
            :style="{'height': '30px', 'width': labelWidth, 'display': 'inline-block',
          'text-align': labelXAlign}"
          >
        <span :style="{'background-color': args.label_color, 'width': '100%', 'height': '30px', 'display': 'flex', 'align-items': labelYAlignFlex, 'justify-content': labelXAlign}">
          <span v-if="args.required" style="color: red">*</span>
          <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
        </span>
      </span>
        </template>
      </section>
    </section>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
               :itemValue="itemValue"
               :attributes="filter_attributes"
               :router="router"
               :route="route"
               :root="root"
               :store="store"
               :query_oprs="query_oprs"
               :dataTypes="dataTypes"
               @handleBindTargetClassChange="handleBindTargetClassChange"
               :targetclass="itemValue.data.targetClass">
        <div slot="attribute">
          <!--
                        属性选项放置区域
                        一般一个控件的prop都属于属性选项
          -->
          <p class="margin1">展示属性</p>
              <Select class="margin1 dynamic-digital" v-model="args.displayFormat" filterable clearable>
                <OptionGroup label="系统属性" v-if="refClassAttributes_sys">
                  <Option v-for="(attr, index) in refClassAttributes_sys" :value="attr.attributeName"
                          :key="index || ''" :label="attr.displayName"></Option>
                </OptionGroup>
                <OptionGroup label="类属性" v-if="refClassAttributes_def">
                  <Option v-for="(attr, index) in refClassAttributes_def" :value="attr.attributeName"
                          :key="index || ''" :label="attr.displayName"></Option>
                </OptionGroup>
                <OptionGroup label="关联类系统属性" v-if="refClassAttributes_relationSys">
                  <Option v-for="(attr, index) in refClassAttributes_relationSys" :value="attr.attributeName"
                          :key="index || ''" :label="attr.displayName"></Option>
                </OptionGroup>
                <OptionGroup label="关联类属性" v-if="refClassAttributes_relationDef">
                  <Option v-for="(attr, index) in refClassAttributes_relationDef" :value="attr.attributeName"
                          :key="index || ''" :label="attr.displayName"></Option>
                </OptionGroup>
                <OptionGroup label="左类属性" v-if="refClassAttributes_leftDef">
                  <Option v-for="(attr, index) in refClassAttributes_leftDef" :value="attr.attributeName"
                          :key="index || ''" :label="attr.displayName"></Option>
                </OptionGroup>
                <OptionGroup label="右类属性" v-if="refClassAttributes_rightDef">
                  <Option v-for="(attr, index) in refClassAttributes_rightDef" :value="attr.attributeName"
                          :key="index || ''" :label="attr.displayName"></Option>
                </OptionGroup>
              </Select>
          <p class="margin1">符号设置</p>
              <Input class="margin1" v-model="args.sign" placeholder="请输入..." style="width: 100%;"></Input>
          <p class="margin1">单位设置</p>
              <Input class="margin1" v-model="args.unit" placeholder="请输入..." style="width: 100%;"></Input>
          <p class="margin1">小数点后位数</p>
              <InputNumber class="margin1" v-model="args.options.decimalPlaces" :max="6" :min="0" placeholder="请输入..." style="width: 100%;"></InputNumber>
          <p class="margin1">图标地址</p>
          <Input class="margin1" type="textarea" v-model="args.back_picture"/>
          <!--          <p class="margin1">图标属性</p>-->
          <!--            <Select v-if="!isRelation" class="margin1" filterable clearable v-model="args.displayAttribute">-->
          <!--                <Option v-for="item in attributesList" :key="item.id" :value="item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName }}</Option>-->
          <!--                <Option value="-1">自定义</Option>-->
          <!--            </Select>-->
          <!--            <Select v-else class="margin1" filterable clearable v-model="args.back_picture">-->
          <!--                <OptionGroup label="关联类属性">-->
          <!--                    <Option v-for="item in attributes[1]" :key="item.id" :value="'relation_' + item.attributeName">{{ item.displayName }}</Option>-->
          <!--                </OptionGroup>-->
          <!--                <OptionGroup label="左类属性">-->
          <!--                    <Option v-for="item in attributes[2]" :key="item.id" :value="'left_' + item.attributeName">{{ item.displayName }}</Option>-->
          <!--                </OptionGroup>-->
          <!--                <OptionGroup label="右类属性">-->
          <!--                    <Option v-for="item in attributes[3]" :key="item.id" :value="'right_' + item.attributeName">{{ item.displayName }}</Option>-->
          <!--                </OptionGroup>-->
          <!--                <Option value="-1">自定义</Option>-->
          <!--            </Select>-->
          <!--            <Input class="margin1" v-show="args_name == '-1'" v-model="args.name" placeholder="自定义输入目标属性" />-->
          <p class="margin1">布局</p>
          <Select class="margin1" v-model="args.label_block_align">
            <Option value="up">文字在上</Option>
            <Option value="down">文字在下</Option>
            <Option value="left">文字在左</Option>
            <Option value="right">文字在右</Option>
          </Select>
          <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
            开启千位符
            <i-switch style="float: right" v-model="args.options.useGrouping"/>
          </div>
          <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
            开启图标
            <i-switch style="float: right" v-model="args.useIcon"/>
          </div>
          <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
            开启动效
            <i-switch style="float: right" v-model="args.countUpAnimate"/>
          </div>
        </div>

        <div slot="layout">
          <!--
                        样式选项放置区域
                        仅有涉及到高度,宽度,对齐等样式的选项放在这里
          -->
          <p class="margin1">图标高度</p>
          <Input class="margin1" type="number" v-model="args.icon_height">
              <Select v-model="args.iconheightType" slot="append" style="width: 100%；">
                  <Option value="px">px</Option>
                  <Option value="vw">vw</Option>
                  <Option value="rem">rem</Option>
              </Select>
          </Input>
          <p class="margin1">图标宽度</p>
          <Input class="margin1" type="number" v-model="args.icon_width">
              <Select v-model="args.iconwidthType" slot="append" style="width: 100%；">
                  <Option value="px">px</Option>
                  <Option value="vw">vw</Option>
                  <Option value="rem">rem</Option>
              </Select>
          </Input>

          <div class="margin1" style="margin: 10px 0 10px 0">
              符号字体颜色
              <ColorPicker v-model="args.signFontColor"/>
          </div>
          <p class="margin1">符号字体大小</p>
          <Input class="margin1" type="number" v-model="args.signSize">
            <Select v-model="args.signSizeType" slot="append" style="width: 100%；">
                <Option value="px">px</Option>
                <Option value="rem">rem</Option>
            </Select>
          </Input>

          <div class="margin1" style="margin: 10px 0 10px 0">
              单位字体颜色
              <ColorPicker v-model="args.unitFontColor"/>
          </div>
          <p class="margin1">单位字体大小</p>
            <Input class="margin1" type="number" v-model="args.unitSize">
              <Select v-model="args.unitSizeType" slot="append" style="width: 70px;">
                  <Option value="px">px</Option>
                  <Option value="rem">rem</Option>
              </Select>
            </Input>
        </div>
        <div slot="operation">
          <!--
                        事件选项放置区域
          -->
        </div>
      </EditBox>
    </span>
  </section>
  <!--
        插件的拖拽图标样式
        :addinName="name"不可去除
  -->
  <section v-else :addinName="name">
    <span style="text-align:center">
      <div class="form-addin-icon">
        <i class="iconfont">&#xe68d;</i>
      </div>
      <!-- 设置插件的中文名,名字长度小于等于3时使用 -->
      <!-- <div class="form-addin-name">动态数字标签</div> -->
      <!-- 设置插件的中文名,名字长度大于3时使用 -->

      <Tooltip class="form-addin-name" content="动态数字标签" style="width: 100%;" :transfer="true">动态数字</Tooltip>
    </span>
  </section>
</template>

<script>
  import "@/styles/component/iconfont.css";
  import ICountUp from 'vue-countup-v2';
  import EditBox from "./_EditBox.vue";
  import iconlist from "@/views/functional-model/components/moduleIcon.js";
  import ilist from "@/views/functional-model/components/iFontIcon.js";
  import { getEntity, getAttributes} from "@/api/data-model/EntityModeling";
  import { getRelation } from '@/api/data-model/RelationModeling';
  import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js';

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
    props: ["argsProps", "widgetAnnotation", "editExtendInfo",
      "itemValue",
      "attributes",
      "query_oprs",
      "route",
      "router",
      "root",
      "store",
      "Message",
      "relation"
    ],
    data() {
      return {
        times: 0,
        name: name,
        isRelation: false,
        t_preview: true,
        t_edit: false,
        actEdit: false,

        // 属性配置项,按需设置
        args: {
          dynamic: true,
          iotdb: false,
          targetClass: "", // 目标类
          name: "", // 目标属性
          label: "", // 标签名称
          id: "", // 控件代号,一般为必须
          height: 70, // 整体高度
          heightType: "px", // 整体宽度的单位
          iconheightType: 'px',
          iconwidthType: "px",
          label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
          label_fontColor: "initial", // 标签字体颜色
          txt_fontColor: "initial",   // 内容字体颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          // txt_bgColor: '#fff',        // 输入框背景颜色
          width: 100,
          widthType: '%',
          main_align: 4, // 主区域对齐方式,默认为4居中对齐
          align: "Vertical", // 标签与主区域的排列方式
          label_width: 2,
          main_width: 3, // 标签与主区域的占比为 label_width : main_width
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
          icon_height: 30,
          icon_width: 30,
          fsize: 14,
          fsizeType: 'px',
          numberfsize: 14,
          numberfsizeType: 'px',
          signFontColor: 'initial',
          signSize: 14,
          signSizeType: 'px',
          unitFontColor: 'initial',
          unitSize: 14,
          unitSizeType: 'px',
          label_numberColor: "initial", // 字体颜色
          label_block_align: 'up',
          dataSourceType: false,
          useIcon: true,
          countUpAnimate: false,    //显示方式
          unit: '',               //单位
          sign: '',
          icon: '',
          delay: 0,             //延迟执行时间
          endVal: 'NaN',          //最终值
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
          displayFormat: '',
          bindTargetClass: '',
          filterQuery: '',
          clearClass: false,
        },
        attributesList: [],

        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ["Integer", "Double", "Long", "INT32_TS", "INT64_TS", "FLOAT_TS", "DOUBLE_TS"],
        attrMap: {},
        queryData: {
          query: {query: "",}, // 查询条件
          targetClass: "",    // 目标类名
          formName: "",   //
          uuid: ""
        },
        refClassAttributes_sys: null,
        refClassAttributes_def: null,
        refClassAttributes_relationSys: null,
        refClassAttributes_relationDef: null,
        refClassAttributes_leftSys: null,
        refClassAttributes_leftDef: null,
        refClassAttributes_rightSys: null,
        refClassAttributes_rightDef: null,
      };
    },
    components: {
      EditBox,
      ICountUp
    },
    inject: [
      'setBasicArgs'
    ],
    created() {
      //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
      if (this.t_preview) {
        let that = this;
        if (this.attributes && this.attributes.length == 4 && this.attributes[0] == "relation") this.isRelation = true;
        if (this.attributes) {
          if (this.relation) {
            this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
            this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
            this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
          } else {
            this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
          }
        }

      }
    },
    mounted() {

      if(this.t_preview) {

        // 缺省绑定类为当前表单目标类
        if(!this.args.clearClass && this.args.bindTargetClass == '') {
          if(this.itemValue.data.isRelation) {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
          } else {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
          }
        }
        this.args.targetClass = this.itemValue.data.targetClass;

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
      },

      arg_class(val) {
        if (val) {
          console.log('动态标签获取属性啦啦啦啦', val)
          let self = this;
          getAttributes(val).then(res => {
            let attrs = res.data;
            this.attributesList = attrs.filter(
              x => x.valueType == "String" || x.valueType == "LocalFile"
            );
            this.strAttributesList = this.attributesList.filter(
              x => x.valueType == "String"
            );
          });
        }
      },

      filter_attributes() {
        return this.attributes ? (this.relation ?
          ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
      },

      async "args.bindTargetClass"(newRefClass, oldRefClass) {
        if (!newRefClass) {
          return;
        }
        let type = newRefClass.split('\&')[1];
        newRefClass = newRefClass.split('\&')[0];
        if (type == 'r') {
          let temReAttr = [];
          let temLAttr = [];
          let temRAttr = [];
          this.resetAttribute();
          getRelation(newRefClass).then(response => {
            if (response.success) {
              let res = response.data;
              this.refClassAttributes_relationSys = res.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1).filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
              this.refClassAttributes_relationDef = res.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1).filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
              temReAttr = res.attributes.map(val => {
                val.attributeName = `relation_${val.attributeName}`;
                val.displayName = `relation_${val.displayName}`;
                return val
              });
              if ('leftClass' in res) {
                getEntity(res.leftClass).then(mes => {
                  if (mes.success) {
                    let resL = mes.data;
                    this.refClassAttributes_leftSys = resL.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1).filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                    this.refClassAttributes_leftDef = resL.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1).filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                    temLAttr = resL.attributes.map(val => {
                      val.attributeName = `left_${val.attributeName}`;
                      val.displayName = `left_${val.displayName}`;
                      return val
                    });
                  }
                }).catch(error => {
                  this.$Message.error(error.response.data.message);
                });
              }
              // 判断左右关联实体类不是同一个类
              if ('rightClass' in res) {
                getEntity(res.rightClass).then(mes => {
                  if (mes.success) {
                    let resR = mes.data;
                    this.refClassAttributes_rightSys = resR.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1).filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                    this.refClassAttributes_rightDef = resR.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1).filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                    temRAttr = resR.attributes.map(val => {
                      val.attributeName = `right_${val.attributeName}`;
                      val.displayName = `right_${val.displayName}`;
                      return val
                    });
                  }
                });
                setTimeout(() => {
                  this.refClassAttributes = temReAttr.concat(temLAttr, temRAttr);
                  if(!this.firstload){
                    this.args.displayFormat = '';
                    this.firstload = false;
                  }
                  if(this.firstload){
                    this.args.displayFormat = this.displayFormatCache;
                    this.firstload = false;
                  }
                }, 500)
              } else {
                this.$Message.warning(response.message);
              }
            }
          })
          this.queryData.relationClass = newRefClass;
          this.queryData.query.type = "relation";
        } else {
          // 获取RefClass的属性数组refClassAttributes
          getEntity(newRefClass)
          .then(res => {
            this.resetAttribute();
            this.refClassAttributes = res.data.attributes;
            this.refClassAttributes_sys = this.refClassAttributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1).filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.refClassAttributes_def = this.refClassAttributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1).filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            if(!this.firstload){
              this.args.displayFormat = '';
              this.firstload = false;
            }
            if(this.firstload){
              this.args.displayFormat = this.displayFormatCache;
              this.firstload = false;
            }
          })
          .catch(error => {
            this.$Message.error(error.response.data.message);
          });
          this.queryData.targetClass = newRefClass;
          delete this.queryData.relationClass;
          delete this.queryData.leftClass;
          delete this.queryData.rightClass;
          delete this.queryData.query.type;
        }
      },
      'args.options.decimalPlaces'(val){
        if(val > 6){
          this.$nextTick(() => {this.args.options.decimalPlaces = 6})
        }else if(val < 0){
          this.$nextTick(() => {this.args.options.decimalPlaces = 0})
        }
      }
    },
    computed: {
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
      // 需要设置目标属性时使用,不用可删去
      arg_name() {
        return this.args.name;
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
      labelYAlignFlex() {
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

      arg_class() {
        return this.args.targetClass;
      },
    },

    methods: {
      resetAttribute() {
        this.refClassAttributes_sys = null;
        this.refClassAttributes_def = null;
        this.refClassAttributes_relationSys = null;
        this.refClassAttributes_relationDef = null;
        this.refClassAttributes_leftSys = null;
        this.refClassAttributes_leftDef = null;
        this.refClassAttributes_rightSys = null;
        this.refClassAttributes_rightDef = null;
      },

      getAllow() {
        return null;
      },

      getArgs() {
        return this.args;
      },

      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
        if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
        this.firstload = true;
        this.displayFormatCache = this.args.displayFormat;
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      // 获取可继承属性
      getInherit() {
        var res = {};
        let that = this;
        this.inherit.forEach(x => res[x] = that.args[x]);
        return res;
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
        this.t_preview = type == 0;
        return this;
      },

      onReady(instance, CountUp) {
        instance.update(this.args.endVal);
      },

      clearBindTargetClass(val){
        this.args.clearClass = true;
      },

      handleBindTargetClassChange(val){
        if(!val){
          this.args.clearClass = true;
          this.args.bindTargetClass = '';
          this.resetAttribute();
          this.args.displayFormat = '';
        } else this.args.clearClass = false;
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
</style>
<style>
  .ivu-color-picker-confirm-color-editable {
    width: 57%;
    float: left;
  }

  .dynamic-digital .ivu-select-dropdown {
    width: 100%!important;
  }
</style>
