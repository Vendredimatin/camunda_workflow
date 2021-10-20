<template>
  <section v-show="!args.hided" id="inputDiv" :addinName="name" class="single-object-selector-addin" dropTarget="0" ref="main" :style="{'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
          'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
              <span v-show="!args.hided"
                    :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                  <span v-if="args.required" style="color: red">*</span>
                  <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
              </span>
          </span>
      <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
      <span :style="{'width': mainWidth, 'display': 'inline-block',
             'text-align': mainXAlign, 'color': args.main_fontColor}">

            <span v-show="!args.hided"
                  :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign, 'border': border}">
                <div v-if="!remoted">
                    <Select ref="sos"
                            :transfer-class-name="darkMode ? 'dark' : ''"
                            class="i-input self-color"
                            v-if="!needPop"
                            v-model="selectedObject"
                            :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'height': arg_height, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                            :title="selectedObjectTitle"
                            filterable
                            clearable
                            :multiple="args.selectMulti"
                            :transfer="true"
                            :disabled="args.readonly || t_visit"
                            @mouseenter.native="hoverEvent"
                            @on-open-change="handleDropDown"
                            @on-clear="handleClear"
                            @on-change="handleSelectedObjectChange">
                        <Option v-for="(item, index) in browseList" :value="item.value" :key="index" :label="item.label"
                                @click.native="handleSelectedClick(item.object)">
                            <span class="self-color">{{ item.slotLabel }}</span>
                        </Option>
                    </Select>

                    <Poptip v-else trigger="hover" :placement="popHoverDirection" :width="popHoverObj.popWidth">
                        <Select ref="sos"
                                :transfer-class-name="darkMode ? 'dark' : ''"
                                v-model="selectedObject"
                                class="i-input self-color"
                                :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'height': arg_height, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                                :title="selectedObjectTitle"
                                filterable
                                clearable
                                :multiple="args.selectMulti"
                                :transfer="true"
                                :disabled="args.readonly || t_visit"
                                @mouseenter.native="hoverEvent"
                                @on-open-change="handleDropDown"
                                @on-clear="handleClear"
                                @on-change="handleSelectedObjectChange">
                            <Option v-for="(item, index) in browseList" :value="item.value" :key="index"
                                    :label="item.label" @click.native="handleSelectedClick(item.object)">
                                <span class="self-color">{{ item.slotLabel }}</span>
                            </Option>
                        </Select>
                        <div v-show="popHoverObj.needPopTitle" slot="title"><span
                                :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    v-if="!this.isHoverMesPop && popHoverPath"
                                    ref="form"
                                    :to_path="popHoverPath"
                                    :to_query="popHoverQuery"
                                    :store="store">
                            </FormEngine>
                            <p v-else>{{ this.popHoverMes }}</p>
                        </div>
                    </Poptip>

                </div>
                <div v-else>
                    <div v-if="!needPop">
                      <Dropdown
                              trigger="custom"
                              :stop-propagation="dropdownStopPropagation"
                              :transfer="dropdownTransfer"
                              :visible="dropdownVisible"
                              :transfer-class-name="dropdownClass"
                              :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'position': 'relative'}"
                              @on-click="handleSelectedObjectChange">
                        <Input
                                ref="sos"
                                v-model="selectedObjectRemote"
                                :class="`uuid_${dropdownUUID}`"
                                class="i-input self-color single-object-selector-remote"
                                suffix="ios-arrow-down"
                                placeholder="请选择"
                                clearable
                                :style="{'height': arg_height, 'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args_txt_bgColor}"
                                :disabled="args.readonly || t_visit"
                                @mouseenter.native="hoverEvent"
                                @click.native="handleClear($event)"
                                @on-click="handleOpen"
                                @on-focus="handleOpen"
                                @on-change="remoteMethod($event.target.value)"
                        ></Input>
                        <Spin fix v-if="spinShow">loading...</Spin>
                          <DropdownMenu slot="list">
                            <div class="section-dropdownItem">
                              <DropdownItem v-for="(option, index) in remoteOption" :key="index" :name="option.value"
                                            @click.native="handleSelectedClick(option.object)"
                                            :selected="selectedObjectRemoteLabel === option.slotLabel">{{option.slotLabel}}</DropdownItem>
                            </div>
                            <div class="section-dropdownItemPage">
                              <Page :total="searchTotal"
                                    :show-total="searchShowTotal"
                                    :page-size="searchPageSize"
                                    size="small"
                                    style="padding: 15px;"
                                    show-elevator
                                    @on-change="handleSearchPageChange"/>
                              <span class="pageTotal">共{{ searchPage }}页</span>
                            </div>
                          </DropdownMenu>
                      </Dropdown>
                    </div>
                    <Poptip v-else trigger="hover" :placement="popHoverDirection" :width="popHoverObj.popWidth">
                      <Dropdown
                              trigger="custom"
                              :transfer="dropdownTransfer"
                              :stop-propagation="dropdownStopPropagation"
                              :visible="dropdownVisible"
                              :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'position': 'relative'}"
                              :transfer-class-name="dropdownClass"
                              @on-click="handleSelectedObjectChange">
                        <Input
                                ref="sos"
                                v-model="selectedObjectRemote"
                                class="i-input self-color single-object-selector-remote"
                                suffix="ios-arrow-down"
                                placeholder="请选择"
                                clearable
                                :style="{'height': arg_height, 'width': relWidth, 'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args_txt_bgColor}"
                                :disabled="args.readonly || t_visit"
                                @mouseenter.native="hoverEvent"
                                @click.native="handleClear($event)"
                                @on-click="handleOpen"
                                @on-focus="handleOpen"
                                @on-change="remoteMethod($event.target.value)"
                        />
                        <Spin fix v-if="spinShow">loading...</Spin>
                          <DropdownMenu slot="list">
                            <DropdownItem v-for="(option, index) in remoteOption" :key="index" :name="option.value"
                                          @click.native="handleSelectedClick(option.object)"
                                          :selected="selectedObjectRemoteLabel === option.slotLabel">{{option.slotLabel}}</DropdownItem>
                            <Page :total="searchTotal"
                                  :show-total="searchShowTotal"
                                  :page-size="searchPageSize"
                                  style="padding: 15px;"
                                  size="small"
                                  show-elevator
                                  @on-change="handleSearchPageChange"/>
                          </DropdownMenu>
                      </Dropdown>
                        <div v-show="popHoverObj.needPopTitle" slot="title"><span
                                :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    ref="form"
                                    :to_path="popHoverPath"
                                    :to_query="popHoverQuery"
                                    :store="store">
                            </FormEngine>
                        </div>
                    </Poptip>
                </div>
            </span>
        </span>
    </template>
    <template v-else>
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
          'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
              <span v-show="!args.hided"
                    :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                  <span v-if="args.required" style="color: red">*</span>
                  <label class="self-color" :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
              </span>
          </span>
      <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
      <span :style="{'width': '100%', 'display': 'inline-block',
             'text-align': mainXAlign, 'color': args.main_fontColor}">

            <span v-show="!args.hided"
                  :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign, 'border': border}">
                <div v-if="!remoted">
                    <Select ref="sos"
                            :transfer-class-name="darkMode ? 'dark' : ''"
                            class="i-input self-color"
                            v-if="!needPop"
                            v-model="selectedObject"
                            :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'height': arg_height, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                            :title="selectedObjectTitle"
                            filterable
                            clearable
                            :multiple="args.selectMulti"
                            :transfer="true"
                            :disabled="args.readonly || t_visit"
                            @mouseenter.native="hoverEvent"
                            @on-open-change="handleDropDown"
                            @on-clear="handleClear"
                            @on-change="handleSelectedObjectChange">
                        <Option v-for="(item, index) in browseList" :value="item.value" :key="index" :label="item.label"
                                @click.native="handleSelectedClick(item.object)">
                            <span class="self-color">{{ item.slotLabel }}</span>
                        </Option>
                    </Select>

                    <Poptip v-else trigger="hover" :placement="popHoverDirection" :width="popHoverObj.popWidth">
                        <Select ref="sos"
                                :transfer-class-name="darkMode ? 'dark' : ''"
                                v-model="selectedObject"
                                class="i-input self-color"
                                :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'height': arg_height, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                                :title="selectedObjectTitle"
                                filterable
                                clearable
                                :multiple="args.selectMulti"
                                :transfer="true"
                                :disabled="args.readonly || t_visit"
                                @mouseenter.native="hoverEvent"
                                @on-open-change="handleDropDown"
                                @on-clear="handleClear"
                                @on-change="handleSelectedObjectChange">
                            <Option v-for="(item, index) in browseList" :value="item.value" :key="index"
                                    :label="item.label" @click.native="handleSelectedClick(item.object)">
                                <span class="self-color">{{ item.slotLabel }}</span>
                            </Option>
                        </Select>
                        <div v-show="popHoverObj.needPopTitle" slot="title"><span
                                :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    v-if="!this.isHoverMesPop && popHoverPath"
                                    ref="form"
                                    :to_path="popHoverPath"
                                    :to_query="popHoverQuery"
                                    :store="store">
                            </FormEngine>
                            <p v-else>{{ this.popHoverMes }}</p>
                        </div>
                    </Poptip>

                </div>
                <div v-else>
                    <div v-if="!needPop">
                      <Dropdown
                              trigger="custom"
                              :stop-propagation="dropdownStopPropagation"
                              :transfer="dropdownTransfer"
                              :visible="dropdownVisible"
                              :transfer-class-name="dropdownClass"
                              :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'position': 'relative'}"
                              @on-click="handleSelectedObjectChange">
                        <Input
                                ref="sos"
                                v-model="selectedObjectRemote"
                                :class="`uuid_${dropdownUUID}`"
                                class="i-input self-color single-object-selector-remote"
                                suffix="ios-arrow-down"
                                placeholder="请选择"
                                clearable
                                :style="{'height': arg_height, 'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args_txt_bgColor}"
                                :disabled="args.readonly || t_visit"
                                @mouseenter.native="hoverEvent"
                                @click.native="handleClear($event)"
                                @on-click="handleOpen"
                                @on-focus="handleOpen"
                                @on-change="remoteMethod($event.target.value)"
                        ></Input>
                        <Spin fix v-if="spinShow">loading...</Spin>
                          <DropdownMenu slot="list">
                            <div class="section-dropdownItem">
                              <DropdownItem v-for="(option, index) in remoteOption" :key="index" :name="option.value"
                                            @click.native="handleSelectedClick(option.object)"
                                            :selected="selectedObjectRemoteLabel === option.slotLabel">{{option.slotLabel}}</DropdownItem>
                            </div>
                            <div class="section-dropdownItemPage">
                              <Page :total="searchTotal"
                                    :show-total="searchShowTotal"
                                    :page-size="searchPageSize"
                                    size="small"
                                    style="padding: 15px;"
                                    show-elevator
                                    @on-change="handleSearchPageChange"/>
                              <span class="pageTotal">共{{ searchPage }}页</span>
                            </div>
                          </DropdownMenu>
                      </Dropdown>
                    </div>
                    <Poptip v-else trigger="hover" :placement="popHoverDirection" :width="popHoverObj.popWidth">
                      <Dropdown
                              trigger="custom"
                              :transfer="dropdownTransfer"
                              :stop-propagation="dropdownStopPropagation"
                              :visible="dropdownVisible"
                              :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'position': 'relative'}"
                              :transfer-class-name="dropdownClass"
                              @on-click="handleSelectedObjectChange">
                        <Input
                                ref="sos"
                                v-model="selectedObjectRemote"
                                class="i-input self-color single-object-selector-remote"
                                suffix="ios-arrow-down"
                                placeholder="请选择"
                                clearable
                                :style="{'height': arg_height, 'width': relWidth, 'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args_txt_bgColor}"
                                :disabled="args.readonly || t_visit"
                                @mouseenter.native="hoverEvent"
                                @click.native="handleClear($event)"
                                @on-click="handleOpen"
                                @on-focus="handleOpen"
                                @on-change="remoteMethod($event.target.value)"
                        />
                        <Spin fix v-if="spinShow">loading...</Spin>
                          <DropdownMenu slot="list">
                            <DropdownItem v-for="(option, index) in remoteOption" :key="index" :name="option.value"
                                          @click.native="handleSelectedClick(option.object)"
                                          :selected="selectedObjectRemoteLabel === option.slotLabel">{{option.slotLabel}}</DropdownItem>
                            <Page :total="searchTotal"
                                  :show-total="searchShowTotal"
                                  :page-size="searchPageSize"
                                  style="padding: 15px;"
                                  size="small"
                                  show-elevator
                                  @on-change="handleSearchPageChange"/>
                          </DropdownMenu>
                      </Dropdown>
                        <div v-show="popHoverObj.needPopTitle" slot="title"><span
                                :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{ popHoverObj.popTitleTxt }}</span></div>
                        <div slot="content">
                            <FormEngine
                                    ref="form"
                                    :to_path="popHoverPath"
                                    :to_query="popHoverQuery"
                                    :store="store">
                            </FormEngine>
                        </div>
                    </Poptip>
                </div>
            </span>
        </span>
    </template>

    <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
            <span v-show="isRequired" class="wrongTips">该项不能为空</span>
            <span v-show="isWrong" class="wrongTips">{{ errorMessage || args.ruleMessage }}</span>
        </span>
  </section>

</template>

<script>

  import { mapGetters, mapActions  } from "vuex";
  import "@/styles/component/iconfont.css"
  import { getQueryOperation, getEobj,
    getEobjCount,
    getRobjCount } from "@/api/others";
  import FormEngine from '@/views/form-engine/forms-engine.vue'
  import { uuid } from '@/util/assist'
  import axios from "@/libs/axios";
  import global_ from '@/views/global.vue';
  let baseObjOther = global_.baseObjOther;

  const name = "SingleObjectSelector";

  export default {
    destroyed(){
    },
    beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
      this.objectList = null;
      this.filterObject = null;
      this.browseList = null;
      this.filteredList = null;
      delete this.objectList;
      delete this.filterObject;
      delete this.browseList;
      delete this.filteredList;
    },
    name: name,

    // itemValue: 从表单建模/表单引擎传入的当前表单对象
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
        timer: null,
        times: 0,
        name: name,

        // 展示模式
        t_create: false,
        t_edit: false,
        t_visit: true,
        mountend: false,
        firstInit: true,
        //触发分组
        setGroupAction: false,
        loadSelect: false,
        spinShow: false,
        dynamicValue: '',
        isDynamicValue: false,
        isWrong: false,
        isRequired: false,
        isHoverMesPop: false,      // 脚本定义的浮窗文字
        popHoverMes: '',

        darkMode: false,
        needPop: false,
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
        popHoverObj: {
          needPopTitle: false,
          popTitleTxt: '提示',
          popTitleFs: 14,
          popTitleColor: '#333',
          tipPlacement: 'right',
          popWidth: 400
        },
        popHoverDirection: 'right',
        popHoverPath: '',
        popHoverQuery: {
          query: ''
        },
        isHover: null,
        pWidth: 0,

        // 图标地址
        icon_url: "",

        // 支持的数据类型
        dataTypes: ['String', 'Integer', 'Boolean', 'Long', 'UUID', 'Double'],

        // 编辑框
        args: {
          id:"",
          title:"单对象下拉框",
          label: "",
          name: "",
          bindTargetClass: '',
          filterQuery: '',
          returnFormat: [],
          returnSelectFormat: [],
          displayFormat: [],
          browseAttributes: [],
          filterAttributes: [],
          remoted: false,
          selectMulti: false,
          groupName: null,
          required: false,
          readonly: false,
          disabled: false,
          hided: false,
          // label所需属性
          dynamic: false,
          label_fontColor: "initial", // 标签字体颜色
          txt_fontColor: "initial",   // 内容字体颜色
          txt_bgColor: '#fff',        // 输入框背景颜色
          lfsize: 14,                 // 标签文字大小
          lfsizeType: 'px',           // 标签文字大小单位
          fsize: 14,                  // 内容文字大小
          fsizeType: 'px',            // 内容文字大小单位
          width: 100,
          widthType: '%',
          label_width: 2,
          main_width: 3,
          label_align: 4,
          main_align: 4,
          _id: "0",
          basic_height: 20,
          _type: "attribute",
          height: 30,
          heightType: "px",
          col: true,
          cols: 3,
          // 属性插件所需属性
          targetDataType: null,
          relation: "",
          relation_attr: "",
          relation_class: "",
          relation_class_attr: "",
        },

        remoteOption: [],

        // VALUECHANGE
        vChange: null,

        // 插件的字符串返回值，由回填格式定义
        browseList: [],
        currentSelectedObject: [],
        selectedObject: null,
        selectedObjectRemote: null,
        selectedObjectRemoteLabel: null,
        selectedMultiObject: [], //多选用返回值
        remoted: true,//默认全为远程
        dropdownUUID: uuid(),
        dropdownVisible: false,
        dropdownTransfer: true,
        dropdownStopPropagation: true,
        initTotal: 0,
        initQuery: '',
        searchShowTotal: true,
        searchPageSize: 20,
        searchTotal: 20,
        filterObject: {},
        // 所有的实体类数组，用于选择bindTargetClass
        allEntityClasses: [],
        // 所选的实体类的属性数组，用于选择browseAttribute，returnFormat，displayFormat
        refClassAttributes: [],
        // 所选的实体类的对象数组
        objectList: [],
        // editFilterAttributes对话框flag
        showEditModal: false,
        // 用于辅助删除FilterAttributes
        filterAttributesIndex: 0,
        // 当前表单编辑对象
        formObject: {},

        // 用于从VUEX中查询数据
        queryData: {
          query: {query: "",}, // 查询条件
          targetClass: "",    // 目标类名
          formName: "",   //
          uuid: ""
        },

        // 对齐方式,布局插件使用
        alignList: [
          {value: 0, name: "左上对齐"},
          {value: 1, name: "靠左对齐"},
          {value: 2, name: "左下对齐"},
          {value: 3, name: "顶部对齐"},
          {value: 4, name: "居中对齐"},
          {value: 5, name: "底部对齐"},
          {value: 6, name: "右上对齐"},
          {value: 7, name: "靠右对齐"},
          {value: 8, name: "右下对齐"}
        ],

        // 继承属性
        inherit: [],

        // 表单项名
        args_name: "",

        // 属性map
        targetMeta: null,
        allow: {},
        border: null,
        parsedQuery: '',
        errorMessage: '',
        editTrigger: false,
        groupActionTrigger: false,
        handleOpenAction: false,
        auth: false,
      }
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
      this.darkMode = !!(sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu'));
      this.$store = this.store;
    },
    async mounted () {
      this.setHeight();
      // 定制值变化事件
      if(this.args.events && this.args.events.length > 0) {
        // 鼠标悬停事件
        this.isHover = this.args.events.find((val) => {
          return val.name == '鼠标悬停'
        })
        if(this.isHover != null && this.isHover.opr_path != undefined && this.isHover.opr_path != '') {
          getQueryOperation(this.isHover.opr_path).then(response => {

            let res = response.data;
            if(res.success && res.data) {

              let oName = res.data.conType;

              if(oName == 'tip') {

                if(res.data.action == 'implement') {

                  if(res.data.conditionExpre) {

                    this.popHoverMes = res.data.conditionExpre.slice(20);
                    this.popHoverMes = this.popHoverMes.replace(/\'/g, '');
                    this.popHoverMes = this.popHoverMes.replace(/\"/g, '');
                    this.isHoverMesPop = true;
                  }

                } else {
                  this.isHoverMesPop = false;
                }

                this.popHoverObj = JSON.parse(res.data.viewType);
                this.popHoverDirection = this.actions[this.popHoverObj.tipPlacement];
                this.popHoverPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
                this.needPop = true;
                this.pWidth = document.getElementById("inputDiv").offsetWidth;
              } else {
                this.needPop = false;
              }
            } else {
              console.log(res.message);
            }

          }).catch(e => {
            console.log(e);
          });
        }

        this.vChange = this.args.events.find((val) => {
          return val.name == '值变化'
        })

      }
      //判断浏览或者显示字段是否有权限
      this.auth = false;
      try{
        let className = this.args.bindTargetClass.split('\&')[0];
        this.targetMeta = this.AttributesByClass(className).length === 0 ? await this.getAttributeClassMap(className) : this.AttributesByClass(className);
        let unionReturnSelectFormat = this.targetMeta.filter(item => this.args.returnSelectFormat.indexOf(item.attributeName) !== -1);
        let unionBrowseAttributes = this.targetMeta.filter(item => this.args.browseAttributes.indexOf(item.attributeName) !== -1);
        unionReturnSelectFormat.forEach(item => {
          if(item.restrictedAccess.length !== 0){
              this.auth = this.auth || item.restrictedAccess.indexOf('CommonOpAuth') !== -1
          }
        })
        unionBrowseAttributes.forEach(item => {
          if(item.restrictedAccess.length !== 0){
            this.auth = this.auth || item.restrictedAccess.indexOf('CommonOpAuth') !== -1
          }
        })
        if(this.auth){
          this.selectedObjectRemote = ''
        }
      }catch (e) {
        console.log(`权限错误${e}`)
      }
      this.freshData(this.args.filterQuery);
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
      args_fsize(){
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize(){
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      args_label_fontColor(){
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + '!important'
      },
      args_txt_fontColor(){
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu') && this.args.txt_fontColor == 'initial' ? this.args.txt_fontColor : this.args.txt_fontColor + '!important';
      },
      args_txt_bgColor() {
        return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu') && this.args.txt_bgColor == '#fff' ? 'initial' : this.args.txt_bgColor;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      labelWidth() {
        return parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      },
      mainWidth() {
        return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
      },
      relWidth() {
        return 'inherit';
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
      searchPage(){
        return Math.ceil(this.searchTotal/this.searchPageSize) === 0 ? 1 : Math.ceil(this.searchTotal/this.searchPageSize);
      },
      dropdownClass(){
        return sessionStorage.getItem('skinStyle') === 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu')  ? `self-color dark single-object-selector uuid_${this.dropdownUUID}` : `single-object-selector uuid_${this.dropdownUUID}`;
      },
      selectedObjectTitle(){
        if(this.args.selectMulti && this.currentSelectedObject.length !== 0){
          return this.currentSelectedObject.map(item => {
            return this.args.returnSelectFormat.length !== 0 ?
              (this.args.returnSelectFormat.map(attr => {
                return item[attr];
              }).join("-"))
              : item.oid;
          }).toString();
        }else{
          return null;
        }
      }
    },
    watch: {
    },
    methods: {
      ...mapActions("DWF_form", ["handleQueryData", "queryRelation", "getAttributeClassMap"]),

      async onDynamic(value){
        if(!this.itemValue.data.isRelation){
          let that = this;
          if (this.dynamicTimer != null) {
            clearInterval(this.dynamicTimer);
            this.dynamicTimer = null;
            this.dynamicTimer = setTimeout(async () => {
              await that.updateObjects();
              that.setValue(value);
            }, 500)
          } else {
            this.dynamicTimer = setTimeout(async () => {
              await that.updateObjects();
              that.setValue(value);
            }, 500)
          }
        }
      },

       /**
     * @description 手动设置浮窗
     * @param mes 浮窗显示的文字
     * @param type 浮窗触发的方式 默认鼠标经过触发
     * @param direction 浮窗的指定方向 不传默认top
     * @param width 浮窗的指定宽度 默认150px
    */
    setToolTip(mes, type, direction, width) {

        if(!type) type = 'hover';
        if(!direction) direction = 'top';
        if(!width) width = 150;
        this.popHoverDirection = direction;
        this.popHoverObj.popWidth = width;
        this.isHoverMesPop = true;
        this.popHoverMes = mes;


        this.pWidth = document.getElementById("inputDiv").offsetWidth;
        this.needPop = true;

        this.$nextTick(() => {
          this.setInheritStyle();
        })

      },

      initQueryData(page, pageSize){
        this.queryData.query.startIndex = page ? (page - 1) * this.searchPageSize : 0;
        this.queryData.query.pageSize = pageSize ? pageSize : this.searchPageSize;
      },

      async freshData(query){
        if(this.auth){
          this.spinShow = false;
          return
        }
        this.queryData.targetClass = this.args.bindTargetClass.split('\&')[0];
        this.targetMeta = this.AttributesByClass(this.queryData.targetClass).length === 0 ? await this.getAttributeClassMap(this.queryData.targetClass) : this.AttributesByClass(this.queryData.targetClass);
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
        await this.entryCounts(this.queryData.query.query);
        this.updateObjects();
      },

      getAll(){
        return this.objectList;
      },

      getSelected(){
        if(this.selectedObject && this.currentSelectedObject.length == 0){
          try {
            if(typeof this.selectedObject === 'string'){
              this.selectedObject.split(',').forEach(obj => {
                this.currentSelectedObject = this.currentSelectedObject.concat(this.objectList.filter(item => obj === item.oid));
              })
            }else{
              this.selectedObject.forEach(obj => {
                this.currentSelectedObject = this.currentSelectedObject.concat(this.objectList.filter(item => obj === item.oid));
              })
            }
            return this.currentSelectedObject;
          }catch (e) {
            console.log(e)
            return this.currentSelectedObject;
          }
        }else{
          return this.currentSelectedObject;
        }
      },

      getAttrMap() {
        return [{
          className: this.args.bindTargetClass.split('\&')[0]
        }]
      },

      async entryCounts(query) {
        if (!this.args.bindTargetClass) return;
        let allObjCnt;

        if (this.args.bindTargetClass.split('\&')[1] === 'r'){
          allObjCnt = await getRobjCount(this.args.bindTargetClass.split('\&')[0], {
            condition: query
          })
        } else {
          allObjCnt = await getEobjCount(this.args.bindTargetClass.split('\&')[0], {
            condition: query
          })
        }
        this.searchTotal = allObjCnt.data.data;
        this.queryData.targetClass = this.args.bindTargetClass.split('\&')[0];
        if(this.args.selectMulti){
          this.remoted = false;
          this.firstInit = false;
          this.initQueryData(0, 1000);
        }else if (this.firstInit || this.setGroupAction){
          this.initTotal = this.searchTotal;
          this.initQuery = this.queryData.query.query;
          if(this.initTotal <= 100 && !this.args.remoted){
            this.remoted = false;
            this.initQueryData(0, 100);
          }else{
            this.initQueryData();
          }
          this.firstInit = false;
        }
      },

      async initBrowseListData(queryData) {
        if(this.auth) return;
        if(this.firstInit) return ;
        // 用于下拉框插件实际展示的对象数组，经过浏览字段与回填字段的格式转换
        if(queryData){
          await this.handleQueryData(queryData);
          this.objectList = this.QueryResultAll(queryData) || [];
        }else{
          await this.handleQueryData(this.queryData);
          this.objectList = this.QueryResultAll(this.queryData) || [];
        }
        if(this.callback){
          this.callback();
          this.callback = '';
        }
        this.browseList = this.objectList.map(object => {
          return {
            // label:下拉框显示项
            slotLabel: this.args.browseAttributes.length !== 0 ?
              (this.args.browseAttributes.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // label:下拉框回填显示项
            label: this.args.returnSelectFormat.length !== 0 ?
              (this.args.returnSelectFormat.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // value:点选器返回值
            value: this.args.returnFormat.length !== 0 ?
              (this.args.returnFormat.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // object:被点选的对象，用于联动
            object: object,
          }
        }) || [];
      },

      async updateObjects() {
        this.setInheritStyleColor();
        this.t_create && this.setInheritStyle();
        await this.initBrowseListData();
        // 如果对象数据超过100条 并且用户没开启远程模式 app端自动开启远程模式 防止页面卡顿崩溃(当然不是说100条就会卡顿..防止上万的下拉数据DOM渲染)
        if(this.remoted && this.t_create && this.selectedObjectRemote == '') {
          this.spinShow = false;
          this.remoteMethod();
        }else if(this.remoted && this.t_create && this.selectedObjectRemote != ''){
          await this.handleDropDown(true);
          this.handleSelectedObjectChange(this.selectedObjectRemote);
        }else if(this.remoted && !this.t_create){
          await this.handleDropDown(true);
          // await this.remoteMethod(this.selectedObjectRemote);
          // this.spinShow = false;
          // this.mountend = true;
          // setTimeout(() => {this.setInheritStyle()}, 200);
          this.handleSelectedObjectChange(this.selectedObjectRemote);
        }else{
          setTimeout(() => {
            this.setInheritStyle()
          }, 200);
        }
        this.setDropDownWidth();
      },

      handleSelectedClick(selectedObject){
        this.groupActionTrigger = true;
        if(!this.args.selectMulti){
          this.currentSelectedObject = [];
          this.currentSelectedObject.push(selectedObject);
        }
      },

      // 找出当前itemValue中所有组件对象
      getAllElements(json) {
        let result = [];
        for (var element of json) {
          result.push(element.obj);
          result = result.concat(this.getAllElements(element.elements));
        }
        return result;
      },

      hoverEvent() {
        if(this.isHover && this.isHover != undefined) {
          this.invokeOperation(this.isHover.opr_type, this.isHover.opr_path, this.itemValue, this.store);
        }
      },

      async handleDropDown(value) {
        if(this.firstInit) return ;
        if(value) {
          await this.initBrowseListData();
        } else {
          // 为了显示效果需要延迟清空
          setTimeout(async () => {
            await this.initBrowseListData();
          }, 250);
          // if(!this.args.selectMulti){
            // setTimeout(() => {
            //   this.$refs.main.querySelectorAll('.ivu-select-selection .ivu-select-input') ? this.$refs.main.querySelectorAll('.ivu-select-selection .ivu-select-input').length !== 0 ? this.$refs.main.querySelectorAll('.ivu-select-selection .ivu-select-input')[0].value = this.selectedObject : '' : '';
            // },0)
          // }
        }
      },

      // 找出当前itemValue中所有groupName相同的组件对象
      // 前提要求：引用类名也相同
      traversalJson(json) {
        let result = [];
        for (var element of json) {
          element.self.properties.groupName === this.args.groupName ? result.push(element.obj) : null;
          result = result.concat(this.traversalJson(element.elements));
        }
        return result;
      },

      getGroupElements() {
        // 如果groupName为空字符或者null，则不计入任何联动组
        return this.args.groupName ? this.traversalJson(this.itemValue.data.elements) : [];
      },

      handleGroupNameChange() {

      },

      // TODO: 在过滤属性编辑框，根据引用类属性过滤目标类属性
      // TODO: 或者将两个类属性转化为字符串后比较

      // 当组件返回值变化时，进行联动
      async handleSelectedObjectChange(value) {
        if(this.firstInit) return ;
        // if(this.auth) return;
        if(this.setGroupAction){
          this.setGroupAction = false;
          return;
        }
        this.dropdownVisible = false;
        document.removeEventListener('mousedown', this.handleClose);
        // this.isWrong = false;
        this.isRequired = false;
        if(!this.errorMessage){
          this.setError(false);
        }
        // 清空操作
        if(!value) {
          this.spinShow = false;
          this.setInheritStyle();
          this.clearLastModifyTime();
          if(!this.remoted && this.vChange){
            this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
          }
          return;
        }
        if(this.remoted && this.editTriggerOnce){
          return;
        }
        let selectedObject = this.browseList.filter(item => {return item.value === value}).length != 0 ? this.browseList.filter(item => {return item.value === value})[0].object : {};
        //满足4个条件再查一次，1value不在当前查出的结果中、2value有值、3远程模式被打开、4编辑触发开关打开状态
        if(!selectedObject.hasOwnProperty('value') && value && this.remoted && this.editTrigger){
          this.editTriggerOnce = true; //已经执行过一次编辑之后的回调，针对iview控件的黑盒参数
          let cloneQuery = _.cloneDeep(this.queryData);
          this.args.returnFormat.forEach((returnFormat, index) => {
            if(index === 0) {
              cloneQuery.query.query = `${this.initQuery} and obj.${returnFormat} = '${value.split('-')[index]}'`
            }
          });
          await this.initBrowseListData(cloneQuery);
          selectedObject = this.browseList.filter(item => {return item.value === value}).length != 0 ? this.browseList.filter(item => {return item.value === value})[0].object : {};
        }
        if(this.remoted) {
          let finalSlotLabel = this.args.browseAttributes.length !== 0 ?
            (this.args.browseAttributes.map(attr => {
              return selectedObject[attr];
            }).join("-"))
            : selectedObject.oid;
          let finalObj = this.args.returnSelectFormat.length !== 0 ?
            (this.args.returnSelectFormat.map(attr => {
              return selectedObject[attr];
            }).join("-"))
            : selectedObject.oid;
          if(finalSlotLabel){
            this.selectedObjectRemoteLabel = finalSlotLabel;
          }
          if(finalObj){
            this.selectedObjectRemote = finalObj;
            await this.remoteMethod(this.selectedObjectRemoteLabel);
          }else{
            await this.remoteMethod(this.selectedObjectRemoteLabel);
          }
          this.spinShow = false;
        }
        if(!this.args.selectMulti){
          this.selectedObject = this.args.returnFormat.length !== 0 ?
            (this.args.returnFormat.map(attr => {
              return selectedObject[attr];
            }).join("-"))
            : selectedObject.oid;
        }else{
          this.currentSelectedObject = [];
          this.browseList.forEach(item => {
            if(this.selectedObject.indexOf(item.value) !== -1){
              this.currentSelectedObject.push(item.object);
            }
          })
          this.selectedMultiObject = _.cloneDeep(this.selectedObject) || [];
          if(this.callback){
            this.callback();
            this.callback = '';
          }
          // this.selectedObject = '';
        }
        setTimeout(() => {this.setInheritStyle()}, 200);
        this.clearLastModifyTime();
        if(this.vChange) {
          this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
        }
        /**
         * @description联动同组元素逻辑修改，不再要求groupObject，只要求触发freshData()
         * 只有选择的发起者可以调用其他联动元素的方法
         */
        if(this.groupActionTrigger){
          this.getGroupElements().forEach(item => {
            item.setGroupObject(this.currentSelectedObject, this.args.id);
          });
        }
        if(!this.args.selectMulti){
          this.setAttrChainObject(selectedObject);
        }else{
          this.setAttrChainObject(this.currentSelectedObject[0]);
        }
        this.mountend = true;
        this.editTrigger = false;
        console.log(this.selectedObject)
      },

      async triggerEvent(type){
        switch (type) {
          case 'valueChanged':
            if(this.vChange) {
              this.clearLastModifyTime();
              this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
            }
            break;
          case 'setGroupValue':
            this.getGroupElements().forEach(item => {
              let that = this;
              item.setGroupObject(this.currentSelectedObject, this.args.id);
            });
            break;
          default:
            if(this.vChange) {
              this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
            }
            break;
        }
      },

      // 接受同联动组组件传来联动对象，根据自身情况修改组件返回值
      async setGroupObject(objects, id) {
        if(this.args.multi) return;
        if(Object.prototype.toString.call(objects) !== '[object Array]'){
          objects = [objects];
        }
        this.editTriggerOnce = false;
        var that = this;
        if(id !== this.args.id){
          this.setGroupAction = true;
          await this.freshData(this.args.filterQuery);
          for(let object of objects){
            if(this.remoted && (this.args.returnFormat[0] in object)) {
              let finalSlotLabel = this.args.browseAttributes.length !== 0 ?
                (this.args.browseAttributes.map(attr => {
                  return object[attr];
                }).join("-"))
                : object.oid;
              let finalObj = this.args.returnSelectFormat.length !== 0 ?
                (this.args.returnSelectFormat.map(attr => {
                  return object[attr];
                }).join("-"))
                : object.oid;
              if(finalSlotLabel){
                this.selectedObjectRemoteLabel = finalSlotLabel;
              }
              if(finalObj){
                this.selectedObjectRemote = finalObj;
                await this.remoteMethod(this.selectedObjectRemoteLabel);
              }else{
                await this.remoteMethod(this.selectedObjectRemoteLabel);
              }
            }
            if(objects.length > 1){
              if(this.args.returnFormat.length !== 0){
                this.selectedObject.indexOf((this.args.returnFormat.map(attr => {
                  return object[attr];
                }).join("-"))) === -1 ? this.selectedObject.push((this.args.returnFormat.map(attr => {
                  return object[attr];
                }).join("-"))) : ''
              }else{
                this.selectedObject.indexOf(object.oid || object.relation_oid) === -1 ? this.selectedObject.push(object.oid || object.relation_oid) : '';
              }
            }else{
              if(object && this.args.returnFormat[0] in object){
                this.selectedObject = this.args.returnFormat.length !== 0 ?
                  (this.args.returnFormat.map(attr => {
                    return object[attr];
                  }).join("-"))
                  : object.oid || object.relation_oid;
              }
            }
          }
          this.groupActionTrigger = false;
        }

      },

      async remoteMethod(query, page) {
        if(this.firstInit) return ;
        if(this.setGroupAction) {
          this.remoteOption = this.browseList;
          return;
        }
        this.selectedObjectRemoteLabel = query;
        page = page ? page : 1;
        if (query && query.trim() !== '') {
          let queryPart = ``;//最终query前半部
          let queryContent = ``;//最终query后半部
          let queryContentArray = query.split('-');
          if(queryContentArray.length === 1){
            for(let [index, returnSelectFormat] of this.args.returnSelectFormat.entries()){
              let returnSelectFormatCache = /^(left_|right_|relation_)/g.test(returnSelectFormat) ? returnSelectFormat.replace(/^(left_|right_|relation_)/g, '') : returnSelectFormat;
              let valueType = this.targetMeta.find(item => item.attributeName === returnSelectFormatCache).valueType;
              if(index === 0){
                queryContent = `cast(obj.${returnSelectFormat} as text) like '%${queryContentArray[0] || ''}%'`;
              }else{
                queryContent += ` or cast(obj.${returnSelectFormat} as text) like '%${queryContentArray[0] || ''}%'`;
              }
            }
            this.queryData.query.query = `${this.initQuery} and (${queryContent})`;
          }else{
            for(let [index, returnSelectFormat] of this.args.returnSelectFormat.entries()){
              let returnSelectFormatCache = /^(left_|right_|relation_)/g.test(returnSelectFormat) ? returnSelectFormat.replace(/^(left_|right_|relation_)/g, '') : returnSelectFormat;
              let valueType = this.targetMeta.find(item => item.attributeName === returnSelectFormatCache).valueType;
              if(index === 0){
                queryPart = `(cast(obj.${returnSelectFormat} as text)`;
                queryContent = `'%${queryContentArray[0] || ''}%`;
              }else{
                queryPart += ` || '-' || cast(obj.${returnSelectFormat} as text)`;
                queryContent += `-%${queryContentArray[index] || ''}%`;
              }
              if (index == this.args.returnSelectFormat.length -1){
                queryPart += `)`;
                queryContent += `'`;
              }
            }
            this.queryData.query.query = `${this.initQuery} and ${queryPart} like ${queryContent}`;
          }
          this.initQueryData(page);
          await this.entryCounts(this.queryData.query.query);
          await this.initBrowseListData();
        } else if(typeof query !== 'undefined' && query === ''){
          this.queryData.query.query = this.initQuery;
          this.initQueryData();
          await this.entryCounts(this.queryData.query.query);
          await this.initBrowseListData();
        }
        this.remoteOption = this.browseList;
        !this.mountend ? this.mountend = true : '';
        console.log(this.selectedObject)
      },

      async handleSearchPageChange(page){
        if(this.firstInit) return ;
        this.queryData.query.startIndex = (page - 1) * this.searchPageSize;
        this.queryData.query.pageSize = this.searchPageSize;
        await this.initBrowseListData();
        this.remoteOption = this.browseList;
        document.querySelector(`.single-object-selector.uuid_${this.dropdownUUID} .ivu-dropdown-menu .section-dropdownItem`).scrollTo(0, 0);
      },

      handleOpen(){
        if(this.remoted){this.editTriggerOnce = false; this.remoteMethod(this.selectedObjectRemote);}
        this.dropdownVisible = true;

        /**
         * 捕获window click
         */
        document.addEventListener('mousedown', this.handleClose);
      },
      handleClear($event){
        if(this.args.readonly){return }
        if($event && $event.target.tagName === 'I'){
          this.selectedObject = '';
          this.selectedObjectRemote = '';
          /**
           * @description联动同组元素逻辑修改，不再要求groupObject，只要求触发freshData()
           * 只有选择的发起者可以调用其他联动元素的方法
           */
          this.$nextTick(() => {
            if(this.groupActionTrigger){
              this.getGroupElements().forEach(item => {
                item.setGroupObject([], this.args.id);
              });
            }
          })
          if(!this.args.selectMulti){
            this.currentSelectedObject = [];
            this.clearLastModifyTime();
            if(this.remoted && this.vChange){
              this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
            }
          }
        }else{
          setTimeout(() => {this.setInheritStyle()}, 200);
          if(!this.remoted){
            this.selectedObject = '';
            this.currentSelectedObject = [];
            this.setAttrChainObject(null);
          }
          //fix bug 6049
          let self = this;
          setTimeout(() => {
            this.$nextTick(() => {
              if (self.args.required && !self.selectedObjectRemote) {
                self.isRequired = true;
                self.setError(true);
              }
            })
          }, 0)
        }
        // console.log(this.selectedObject)
      },
      handleClose(event){
        this.dropdownVisible = this.getParents(event.target, document.querySelector(`.ivu-dropdown-transfer.ivu-select-dropdown.single-object-selector.uuid_${this.dropdownUUID}`)).length !== 0
          || this.getParents(event.target, document.querySelector(`.i-input.self-color.single-object-selector-remote.uuid_${this.dropdownUUID}`)).length !== 0 ? true : false;
        if(!this.dropdownVisible){
          document.removeEventListener('mousedown', this.handleClose);
        }
      },
      /**
       * @description获取父节点工具方法
       */
      getParents(el, parentSelector) {
        if (parentSelector === undefined) {
          parentSelector = document;
        }

        let parents = [];
        let p = el.parentNode;

        while (p !== null) {
          let o = p;
          p === parentSelector ? parents.push(o) : '';
          p = o.parentNode;
        }
        return parents;
      },

      setInheritStyle() {
        if(sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu') && this.args.txt_bgColor == '#fff'){
          this.args.txt_bgColor = 'initial';
        }
        try {
          this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
            ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
              item.style.width = '100%';
              item.parentNode.style.width = '100%';
            })
            : '';
          this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
            ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
              item.style.width = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input') && this.$refs.main.querySelectorAll('.i-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input').forEach(item => {
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length != 0
            ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = this.args.txt_bgColor;
              item.style.height = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.height = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
              item.style.lineHeight = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close') && this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.top = this.args.height < 2 && this.args.heightType == 'px' ? "4px" : (this.args.height - 30) / 2 + (30 - this.args.fsize) / 4 + this.args.heightType;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = '#c5c8ce';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-input') && this.$refs.main.querySelectorAll('.i-input .ivu-select-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-input').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
              item.style.webkitTextFillColor = 'inherit';
              item.style.textAlign = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
              item.style.backgroundColor = this.args.txt_bgColor;
              item.style.height = this.arg_height;
              this.args.selectMulti ? item.style.overflow = 'hidden' : '';
            })
            : '';
          if(this.remoted){
            this.$refs.main.querySelector(".i-input .ivu-input").style.height = 'inherit';
            this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
            this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit';
            this.$refs.main.querySelector(".i-input .ivu-input").style.backgroundColor = 'inherit';
            this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';
            this.$refs.main.querySelector('.i-input .ivu-icon').style.lineHeight = this.arg_height;
          }else{
            this.$refs.main.querySelector(".i-input .ivu-select-input").style.textAlign = 'inherit';
          }
        } catch (e) {

        }
      },
      //先给背景上色
      setInheritStyleColor(){
        if(this.remoted){
          this.$refs.main.querySelector(".i-input .ivu-input").style.backgroundColor = 'inherit';
        }
      },

      setDropDownWidth(){
        this.$nextTick(() => {
          let selector = document.querySelector(`.single-object-selector.uuid_${this.dropdownUUID}`);
          if(selector){
            selector.style.width = document.querySelector(`.single-object-selector-remote.uuid_${this.dropdownUUID}`).offsetWidth > 300 ? document.querySelector(`.single-object-selector-remote.uuid_${this.dropdownUUID}`).offsetWidth + 'px' : '300px';
          }
        });
        // console.log('------------------------------',document.querySelector(`.single-object-selector-remote.uuid_${this.dropdownUUID}`))
      },

      setHeight() {
        if (!this.$refs.main) return;
        let that = this;
        if (this.timer == null) {
          this.timer = setInterval(() => {
            if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
            // 改成你需要的样式
            var dom = that.$refs.main.querySelector(".ivu-select-selection");
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

      getValue() {
        // if(this.remoted){
        //   this.selectedObject = this.selectedObjectRemote
        // }
        if(this.args.selectMulti){
          return JSON.stringify(this.selectedMultiObject).replace(/\[|\]|\"/g, '');
        }
        if (this.args.targetDataType === "String") {
          return this.selectedObject;
        }
        else if(this.args.targetDataType === "Integer") {
          return parseInt(this.selectedObject);
        }
        else if(this.args.targetDataType === "Boolean") {
          return this.selectedObject === "true";
        }
        else if(this.args.targetDataType === "Long") {
          // TODO:
          return parseInt(this.selectedObject);
        }
        else if(this.args.targetDataType === "UUID") {
          return this.selectedObject;
        }
        else if(this.args.targetDataType === "Date") {
          return this.selectedObject;
        }
        else if(this.args.targetDataType === "Double") {
          return parseFloat(this.selectedObject);
        }
        else if(this.args.targetDataType === "Clob") {
          // TODO:
          return this.selectedObject;
        }
        else if(this.args.targetDataType === "TimeStamp") {
          // TODO:
          return this.selectedObject;
        }
        else {
          // TODO:
          return this.selectedObject;
        }
      },

      setValue(value, callback) {
        // callback && setTimeout(() => {callback()}, 200);
        this.callback = callback ? callback : '';
        this.selectedObject = null;
        this.selectedObjectRemote = null;
        this.selectedObjectRemoteLabel = null;
        this.selectedMultiObject = [];//多选用返回值
        if(this.args.selectMulti && !this.t_create){
          this.selectedObject = value.split(',');
          this.selectedMultiObject = _.cloneDeep(this.selectedObject) || [];
          return this;
        }
        if (value == null) {
          this.selectedObject = '';
          this.selectedObjectRemote = '';
          this.selectedObjectRemoteLabel = '';
          setTimeout(() => {
            this.setInheritStyle();
          },200);
          return this;
        }
        this.editTrigger = true;
        if(this.remoted){
          this.browseList = [];
          this.objectList = [];
          this.currentSelectedObject = [];
          this.editTriggerOnce = false;
          if(this.args.selectMulti){
            this.selectedObject = value.split(',');
            this.selectedMultiObject = _.cloneDeep(this.selectedObject) || [];
          }else{
            this.selectedObject = value + '';
          }
          this.selectedObjectRemote = value + '';
          //编辑之后需要执行一次计算回填&&初始化时不需要因为在逻辑里之后会执行
          if(this.editTrigger && this.mountend){
            this.handleSelectedObjectChange(this.selectedObjectRemote);
          }
        }else{
          if(this.args.selectMulti){
            this.selectedObject = value.split(',');
            this.selectedMultiObject = _.cloneDeep(this.selectedObject) || [];
          }else{
            this.selectedObject = value + '';
          }
          this.callback ? (this.callback(), this.callback = '') : '';
        }
        this.validate();
        return this;
      },

      isJson(str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      },

      getAllow() {
        return null;
      },

      // 获取可继承属性
      getInherit() {
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
        //对以前refClass做兼容
        if(!this.args.noNumber && !Array.isArray(this.args.returnFormat)){this.args.returnFormat = [this.args.returnFormat]};
        if(args.refClass){this.args.bindTargetClass = args.refClass};
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
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
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
          this.t_create = true;
          this.readonly = false;
          this.spinShow = false;
        }
        else if (type == "edit") {
          this.t_edit = true;
          this.readonly = false;
          this.spinShow = true;
        }
        else if (type == "visit") {
          this.t_visit = true;
          this.readonly = true;
          this.spinShow = true;
        }
        return this;
      },

      // 设置异常状态显示
      setError(error, message = '') {
        this.isWrong = error;
        try{
          var dom = this.$refs.sos.$el.querySelector(".i-input .ivu-input") ? this.$refs.sos.$el.querySelector(".i-input .ivu-input") : null;
          if (dom) {
            dom.style.borderColor = error ? "red" : null;
          }else{
            this.border = error ? '1px solid red' : null;
          }
        }catch (e) {

        }
        this.errorMessage = error ? message : '';
        return this;
      },

      // 设置校验逻辑,返回true/false
      validate() {
        let expResult = true;
        let _value = this.selectedObject;

        if (this.args.required && (_value == null || _value == 'null' || _value == '')) {
          this.isWrong = false;
          this.isRequired = true;
          expResult = false;
        } else if ((_value != '' || _value != null) && this.args.rule) {

          this.isRequired = false;
          expResult = new RegExp(this.args.rule).test(_value);

        } else {
          console.log(_value);
        }

        this.setError(expResult ? null : true);

        this.isWrong = !expResult;

        return expResult;
      },

      setIcon(id) {
        this.icon_url = id;
        return this;
      },

      getDataType(args) {
        return this.dataTypes;
      },

      setAttrChainObject(currentObject){
        if(!this.args.attrChainMode) return;
        if(!this.args.attrChain) return;
        for(let key in this.args.attrChain){
          if(key){
            let addin = this.GetAddinById(this.itemValue.data, key);
            if (addin) {
              currentObject ? addin.setValue(currentObject[this.args.attrChain[key]]) : addin.setValue(null)
            }
          }
        }
      },

      clearLastModifyTime(){
        try{
          if(this.args.name === 'relation_leftOid'){
            this.itemValue.data.origin.left_lastModifyTime = null;
          }
          if(this.args.name === 'relation_rightOid'){
            this.itemValue.data.origin.right_lastModifyTime = null;
          }
        }catch (e) {
          console.log(`清除lastModifyTime${e}`)
        }
      }
    }
  }
</script>


<style scoped>
  section {
    display: inline-block;
    width: 100%
  }

  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }
  .ivu-dropdown-menu {
    min-width: 100px;
    min-height: 100px;
    color: inherit;
  }
  .ivu-dropdown-menu .ivu-dropdown-item{
    color: inherit;
  }
  .dark .ivu-dropdown-menu .ivu-dropdown-item:hover{
    background: #1C304D !important;
  }
  .dark .ivu-dropdown-menu .ivu-dropdown-item.ivu-dropdown-item-selected{
    background: #1C304D !important;
  }
  .section-dropdownItem{
    display: inline-block;
    max-height: 129px;
    width: 100%;
    overflow-y: scroll;
  }
  .section-dropdownItemPage{
    display: block;
  }
</style>

<style>
  .dark .ivu-select-item-focus{
    background: transparent!important;
  }
  .ivu-select-dropdown.single-object-selector{
    overflow-y: hidden;
    min-width: 300px;
  }
  .ivu-select-dropdown.single-object-selector .ivu-page-item{
    display: none;
  }
  .ivu-select-dropdown.single-object-selector .ivu-page-item-jump-prev{
    display: none;
  }
  .ivu-select-dropdown.single-object-selector .ivu-page-item-jump-next{
    display: none;
  }
  .ivu-select-dropdown.single-object-selector .ivu-page.mini .ivu-page-options{
    margin-left: 20px;
  }
  .ivu-select-dropdown.single-object-selector .ivu-page-options .ivu-page-options-elevator{
    font-size: 0px;
  }
  .ivu-select-dropdown.single-object-selector .ivu-page-options .ivu-page-options-elevator input{
    font-size: 12px;
  }
  .ivu-select-dropdown.single-object-selector .ivu-page-prev{
    position: absolute;
    margin-left: 0px;
  }
  .ivu-select-dropdown.single-object-selector .ivu-page-next{
    position: absolute;
    margin-left: 77px;
  }
  .ivu-select-dropdown.single-object-selector .pageTotal{
    float: right;
    margin: -39px 36px 0 0;
  }
</style>
