<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <!-- <p slot="title">
                        <Icon type="ios-keypad"></Icon>
                         关联类操作
                    </p> -->
<!--                    <Row style="margin-bottom: 15px">-->
                        <!-- <span>实体类列表</span> -->
                        <!-- <Button v-show="hasData" type="primary" style="float:right;margin-right: 15px;" @click="toggleShow">{{ toggleText }}继承操作</Button> -->
                        <!-- <Button v-show="hasData" type="primary" style="float:right;margin-right: 15px;" @click="bindQuick">绑定快速查询操作</Button> -->
                        <!-- <Button v-show="hasData" type="primary" :disabled="folderFobbiden" style="float:right;margin-right: 15px;" @click="bindSystem">绑定系统操作</Button> -->
<!--                    </Row>-->
                    <tree-grid
                        ref="commonGrid"
                        v-show="hasData"
                        v-if="globalRefreshFlag"
                        :style="{height: gridHeights}"
                        :class="{'showInherit':toggleText == '查看'}"
                        :items='edittingStore'
                        :columns='columns'
                        @on-row-click='rowClick'
                        @handleSearch="handleSearch"
                        @onSuccessCreateQueryOpr="onSuccessCreateQueryOpr"
                    ></tree-grid>

                    <div style="margin: 10px;overflow: hidden"
                         v-show="hasData">
                      <div style="float: right;">
                        <Page
                          size="small"
                          show-sizer
                          show-elevator
                          show-total
                          placement="top"
                          :page-size-opts="pageSizeOpts"
                          :pageSize="pageSize"
                          :total="total"
                          :current="currentPage"
                          @on-change="changePage"
                          @on-page-size-change="changePageSize"></Page>
                      </div>
                    </div>
                    <Row v-show="!hasData">
                        <p style="text-align: center;">暂无数据</p>
                    </Row>
                    <!-- 绑定快速查询 -->
                    <!-- <Modal
                        v-model="editOperation"
                        title="编辑操作"
                        width="50%"
                        :mask-closable="false"
                        @on-ok="bindQuickEvent"
                        @on-cancel="cancelQuick">
                        <Form ref="editQuickForm" :model="editQuickForm" :rules="ruleFixQuick" :label-width="100">
                            <Card style="width:100%; margin-bottom: 15px;">
                                <p slot="title">
                                    <Icon type="ios-information-circle"></Icon>
                                    基本属性
                                </p>
                                <Row>
                                    <Col span="12">
                                        <FormItem label="英文名" prop="ename">
                                            <Input v-model.trim="editQuickForm.ename" @on-blur="checkCname"></Input>
                                            <span v-show="cnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
                                        </FormItem>
                                    </Col>
                                     <Col span="12">
                                        <FormItem label="显示名" prop="cname">
                                            <Input v-model.trim="editQuickForm.cname"></Input>
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="12">
                                        <FormItem label="模块名" prop="moduleName">
                                            <Input v-model="editQuickForm.moduleName" disabled></Input>
                                        </FormItem>
                                    </Col>
                                     <Col span="12">
                                        <FormItem label="序号" prop="targetNumber" number>
                                            <Input v-model="editQuickForm.targetNumber"></Input>
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="12">
                                        <FormItem label="图标" prop="icon">
                                            <Select v-model="editQuickForm.icon" filterable clearable @on-change="chooseIcon">
                                                <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                                                    <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                                                    <span style="float:right;color:#ccc">{{ item.label }}</span>
                                                </Option>
                                                <Option v-for="x in iList" :value="x.value" :key="x.value" :label="x.label">
                                                    <i class="iconfont" :class="x.value"  style="font-size: 20px !important;"></i>
                                                    <span style="float:right;color:#ccc">{{ x.label }}</span>
                                                </Option>
                                            </Select>
                                        </FormItem>
                                    </Col>
                                     <Col span="12">
                                        <FormItem label="操作样式" prop="style">
                                            <Select v-model="editQuickForm.style" filterable>
                                                <Option v-for="item in quickStyle" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                            </Select>
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                     <Col span="12">
                                        <FormItem label="动作" prop="action">
                                            <Select v-model="editQuickForm.action" filterable>
                                                <Option v-for="item in actionList" :value="item.value" :key="item.value" :label="item.value">
                                                  <span>{{ item.value }}</span>
                                                  <span style="float:right;color:#ccc">{{ item.label }}</span>
                                                </Option>
                                            </Select>
                                        </FormItem>
                                    </Col> -->
                                    <!-- <Col span="12">
                                        <FormItem label="视图标题" prop="viewTitle">
                                            <Input v-model.trim="editQuickForm.viewTitle"></Input>
                                        </FormItem>
                                    </Col> -->
                                <!-- </Row>
                            </Card>
                            <Card style="width:100%" v-show="editQuickForm.action != 'folder'">
                                <p slot="title">
                                    <Icon type="ios-film-outline"></Icon>
                                    动作
                                </p> -->
                                <!-- <Row v-show="editQuickForm.action == 'implement'">
                                     <Col span="12">
                                        <FormItem label="操作路径" prop="opePath">
                                            <Input v-model="editQuickForm.opePath" placeholder="请输入操作的全路径, 包括包名和类名"></Input>
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row v-show="editQuickForm.action == 'implement'">
                                    <FormItem label="参数" prop="params">
                                        <Input v-model="editQuickForm.params" type="textarea" placeholder="请输入提供给实现的参数, 以[参数名]:[参数值]格式填写, 回车分隔"></Input>
                                    </FormItem>
                                </Row> -->
                                <!-- <Row v-show="editQuickForm.action == 'implement'">
                                  <FormItem label="实现方式">
                                      <RadioGroup v-model="editQuickForm.radio" @on-change="chooseWayQucik">
                                        <Radio label="插件调用" :disabled="nonePlug">插件调用</Radio>
                                        <Radio label="后端脚本">后端脚本</Radio>
                                        <Radio label="前端脚本">前端脚本</Radio>
                                        <Radio label="存储过程">存储过程</Radio>
                                        <Radio label="插件别名">插件别名</Radio>
                                      </RadioGroup>
                                  </FormItem>
                                </Row>
                                <Row v-show="editQuickForm.action == 'implement' && editQuickForm.radio == '插件调用'">
                                  <FormItem label="脚本内容">
                                      <Select v-model="editQuickForm.plugPath" filterable>
                                          <Option v-for="item in plugList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                      </Select>
                                  </FormItem>
                                </Row>
                                <Row v-show="editQuickForm.action == 'implement' && editQuickForm.radio != '插件调用'">
                                  <Col span="20">
                                    <FormItem label="脚本内容">
                                      <editor v-model="editQuickForm.content" @init="editorInit" lang="javascript" theme="chrome" width="85%" height="200"></editor>
                                    </FormItem>
                                  </Col>
                                  <Col span="2" offset="1">
                                    <Button shape="circle" type="default" icon="ios-expand" @click="changeBigSize('editQuickForm')"></Button>
                                  </Col>
                                </Row>
                                <Row v-show="(editQuickForm.action == 'create' || editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'creates' || editQuickForm.action == 'list')">
                                    <Col span="12">
                                        <FormItem label="目标类">
                                            <Select ref="selectGoal" v-model="editQuickForm.goal" filterable clearable @on-change="changeView">
                                                <OptionGroup label="实体类">
                                                    <Option v-for="item in entitiesList" :value="item.value" :key="item.value" :label="item.label">
                                                        <span>{{ item.label }}</span>
                                                        <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                                                    </Option>
                                                </OptionGroup>
                                                <OptionGroup label="关联类">
                                                  <Option v-for="item in relationsList" :value="item.value" :key="item.value" :label="item.label">
                                                      <span>{{ item.label }}</span>
                                                      <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                                                  </Option>
                                                  </OptionGroup>
                                            </Select>
                                        </FormItem>
                                    </Col>
                                    <Col span="12">
                                        <Row>
                                          <Col span="21">
                                            <FormItem label="表单名称" prop="viewName">
                                              <Select v-model="editQuickForm.viewName" filterable>
                                                  <Option v-for="item in viewList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                              </Select>
                                            </FormItem>
                                          </Col>
                                          <Col v-show="editQuickForm.viewName != '' && editQuickForm.viewName != '*' && isApp" span="2" offset="1">
                                            <Poptip trigger="hover" title="提示" content="点击跳转到对应表单页面">
                                              <Button shape="circle" type="default" icon="md-arrow-round-forward" @click="toEditForm"></Button>
                                            </Poptip>
                                          </Col>
                                        </Row>
                                    </Col>
                                    <Col span="24">
                                      <Row>
                                        <Col span="20">
                                          <FormItem label="脚本内容">
                                            <editor v-model="editQuickForm.params" @init="editorInit" lang="javascript" theme="chrome" width="100%" height="200"></editor>
                                          </FormItem>
                                        </Col>
                                        <Col span="2" offset="1">
                                          <Button shape="circle" type="default" icon="ios-expand" @click="changeBigSize('editQuickForm')"></Button>
                                        </Col>
                                      </Row>
                                    </Col>
                                    <Spin size="large" fix v-if="spinShow"></Spin>
                                </Row> -->
                                <!-- <Row v-show="(editQuickForm.action == 'edit' || editQuickForm.action == 'visit')">
                                    <Col span="12">
                                        <FormItem label="目标对象" prop="goalObj">
                                            <Input v-model="editQuickForm.goalObj" placeholder="请在下面表格中选择需要的对象"></Input>
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row v-show="((editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'create') && editQuickForm.goal != '')">
                                    <Table height="200" highlight-row ref="currentRowTable" :loading="loadingObj" :columns="goalColumns" :data="goalTable" @on-current-change="chooseGoalObj"></Table>
                                </Row> -->
                                 <!-- <Row v-show="editQuickForm.action == 'url'">
                                    <Col span="12">
                                        <FormItem label="URL地址" prop="linkUrl">
                                            <Input v-model="editQuickForm.linkUrl" placeholder="可用$obj, $user等"></Input>
                                        </FormItem>
                                    </Col>
                                    <Col span="24">
                                      <Row>
                                        <Col span="20">
                                          <FormItem label="脚本内容">
                                            <editor v-model="editQuickForm.params" @init="editorInit" lang="javascript" theme="chrome" width="86%" height="200"></editor>
                                          </FormItem>
                                        </Col>
                                        <Col span="2" offset="1">
                                          <Button shape="circle" type="default" icon="ios-expand" @click="changeBigSize('editQuickForm')"></Button>
                                        </Col>
                                      </Row>
                                    </Col>
                                </Row>
                                <Row v-show="(editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'list')">
                                    <FormItem style="width: 85%;" label="条件表达式" prop="queryCont">
                                        <Input v-model="editQuickForm.queryCont" type="textarea" placeholder="请输入and开头的jpql表达式, 如and obj.state='下达', 可用$obj, $user等"></Input>
                                    </FormItem>
                                </Row>
                            </Card>
                        </Form>
                    </Modal> -->
                   <!-- 编辑操作ending -->
                   <!-- 删除Moal -->
                   <Modal
                        v-model="delOpe"
                        title="重要提示"
                        @on-ok="okDel"
                        @on-cancel="cancel">
                        <p>您即将删除当前选中的操作, 是否确认删除?</p>
                    </Modal>
                    <!-- 删除MoalEnding -->
                </Card>
            </Col>
            <!-- 最大化编辑器 -->
            <!-- <Modal
              v-model="isFullScreen"
              title="脚本编辑"
              :mask-closable="false"
              width="80%"
              @on-ok="confirmScript"
              @on-cancel="cancelScript">
                <editor v-model="commonScript" @init="editorInit" lang="javascript" theme="chrome" width="100%" height="600"></editor>
            </Modal> -->
            <!-- 最大化编辑器ENDING -->
        </Row>
    </div>
</template>
<script>
import {tableMixin} from "@/component/tableMixin"
// import { mapMutations } from 'vuex';
import TreeGrid from "./components/TreeGrid";
// import moduleIconData from "./components/moduleIcon.js";
// import fontIconData from "./components/iFontIcon.js";

import {
  // getEntryOperations,
  // getSystemOperations,
  // bindOperation,
  // getPlugList,
  // addNewOperation,
  // getIconList,
  // getAllEntities,
  // getViews,
  getAllRelations,
  getRelationOperations,
  getAllRelationOperations,
  // getEobj,
  // getRobj,
  // getObjName,
  // fixQuickOpe,
  // fixSystemOpe,
  delQuickOpe,
  delSystemOpe,
  // getRelationNameB,
  // getRelationNameF,
  // checkCnameEvent,
  // bindOperations,
  // createQuickOpe
} from "../../api/others";
import { getAllClassNamesMin } from "@/api/data-model/EntityModeling";
import _ from "lodash";
export default {
  props: ["store", "route", "router", "root"],
  mixins: [tableMixin],
  data() {
    // const validateEname = (rule, value, callback) => {
    //     if (value === '') {
    //         callback(new Error('英文名不能为空'));
    //     } else {
    //         const reg = new RegExp("^[a-zA-Z][a-zA-Z0-9]*$");
    //         let flag = reg.test(value);
    //         if(!flag){
    //           callback(new Error('英文名要已字母开头, 并且只能包含字母和数字哦～'));
    //         } else {
    //           callback();
    //         }
    //     }
    // };
    return {
      hasData: true,
      // loadingObj: false,
      // isHasR: true,
      // cnameExist: false,
      toggleText: '查看',     // 查看 & 关闭继承操作
      // spinShow: false,
      // isApp: location.href.indexOf('token') == -1,
      // goalColumns: [],
      // goalTable: [],
      // bindModal: false, // 仅创建
      // createBindModal: false, // 创建并绑定
      // editOperation: false, // 编辑操作
      delOpe: false,
      // folderFobbiden: false,      // folder操作仅允许绑定快速查询操作

      // isFullScreen: false,     // 脚本编辑器全屏
      // commonScript: '',     // 公共最大化编辑器内容
      // bigScriptForm: '',    // 当前是哪个弹窗表单脚本被最大化

      isInitPromise: true,

      columns: [
        // {
        //   type: "selection",
        //   width: 50,
        //   align: "center"
        // },
        {
          title: "英文名",
          key: "className",
          width: 150
        },
        {
          title: "显示名",
          key: "displayName",
          width: 150,
          align: "center"
        },
        // {
        //   title: "表单名称",
        //   key: "viewName",
        //   width: 150,
        //   align: "center"
        // },
        // {
        //   title: "类型",
        //   key: "isSystem",
        //   width: 150,
        //   align: "center"
        // },
        {
          title: "动作",
          key: "action",
          width: 150,
          align: "center"
        },
        {
          title: "操作样式",
          key: "conType",
          width: 150,
          align: "center"
        },
        {
          title: "操作",
          type: "action",
          align: "center",
          pAction: [
            {
              type: "warning",
              text: "查看操作"
            }
          ],
          actions: [
            {
              type: "error",
              text: "删除"
            }
          ],
          width: 150
        }
      ],
      moduleData: [],
      // operationList: [],
      // editForm: {
      //   ename: "",
      //   cname: "",
      //   path: "",
      //   zoneName: "",
      //   classCategory: "",
      //   id: "",
      //   parentClass: ""
      // },
      // editFlag: 0, // 当前编辑的是系统 & 快速查询操作 0:系统
      // nonePlug: false, // 是否禁止选择插件入口的方式
      // plugData: [],
      // plugList: [],
      // editQuickForm: {
      //   ename: "",
      //   cname: "",
      //   moduleName: "",
      //   targetNumber: "",
      //   icon: "",
      //   style: "button",
      //   action: "create",
      //   radio: "插件调用",
      //   plugPath: "",
      //   content: "",
      //   goal: "",
      //   params: "",
      //   viewTitle: "",
      //   viewName: "",
      //   // goalObj: "",
      //   linkUrl: "",
      //   queryCont: "",
      //   oid: ""
      // },
      needDelId: "",
      // needDelType: 0,
      needDelModule: "",
      // needDelVname: "",
      // actionList: [
      //   {
      //     value: "create",
      //     label: "单对象创建"
      //   },
      //   {
      //     value: "list",
      //     label: "多对象浏览"
      //   },
      //   {
      //     value: "url",
      //     label: "外部链接"
      //   },
      //   {
      //     value: "implement",
      //     label: "操作实现"
      //   },
      //   {
      //     value: "folder",
      //     label: "树形节点"
      //   },
      //   {
      //     value: "edit",
      //     label: "单对象编辑"
      //   },
      //   {
      //     value: "visit",
      //     label: "单对象浏览"
      //   },
      //   {
      //     value: "creates",
      //     label: "多对象创建"
      //   }
      // ],
      // iconList: [], // icon列表
      // iList: [],
      // entitiesList: [], // 实体类列表
      relationsList: [], // 关联类列表
      // viewList: [], // 视图列表
      // objList: [], // 目标对象列表
      // objColumns: [], // 目标对象列表表头信息
      // relationList: [], // 关联名称
      // targetTab: "oldOpe", // Tab状态
      // quickStyle: [
      //   {
      //     value: "button",
      //     label: "button | 独立按钮"
      //   },
      //   {
      //     value: "group",
      //     label: "group | 按钮点击后的下拉菜单"
      //   },
      //   {
      //     value: "icon",
      //     label: "icon | 带图标的按钮"
      //   },
      //   {
      //     value: "modal",
      //     label: "modal | 弹框显示"
      //   },
      //   {
      //     value: "tab",
      //     label: "tab | 增加页签"
      //   }
      // ],
      // ruleBindCreate: {
      //   cname: [
      //     { required: true, message: "显示名不能为空哦～", trigger: "blur" }
      //   ],
      //   ename: [
      //     { required: true, message: "英文名不能为空哦～", trigger: "blur" },
      //     { validator: validateEname, trigger: 'blur' }
      //   ],
      //   editJs: [
      //     { required: true, message: "脚本内容不能为空哦～", trigger: "blur" }
      //   ]
      // },
      // ruleFix: {
      //   cname: [
      //     { required: true, message: "显示名不能为空哦～", trigger: "blur" }
      //   ]
      // },
      // ruleFixQuick: {
      //   cname: [
      //       { required: true, message: '显示名不能为空哦～', trigger: 'blur' }
      //   ],
      //   ename: [
      //       { required: true, message: '英文名不能为空哦～', trigger: 'blur' },
      //       { validator: validateEname, trigger: 'blur' }
      //   ],
      //   // icon: [
      //   //     { required: true, message: '请选择小图标～', trigger: 'blur' }
      //   // ],
      //   action: [
      //       { required: true, message: '请选择动作类型～', trigger: 'blur' }
      //   ],
      //   style: [
      //       { required: true, message: '请选择操作样式～', trigger: 'blur' }
      //   ],
      //   // targetNumber: [
      //   //     { required: true, message: '序号不能为空哦～', trigger: 'blur' }
      //   // ],
      //   viewTitle: [
      //       { required: true, message: '表单标题不能为空哦～', trigger: 'blur' }
      //   ]
      // },
      // bindParams: {
      //   bindClassName: "",
      //   bindID: ""
      // }
      total: 0,
      pageSize: 10,
      currentPage: 1,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      thisTableCurrentPageData: [],
      edittingStore: [],
      classList: {},
      globalRefreshFlag: true,
    };
  },

  components: {
    TreeGrid,
    // editor: require("vue2-ace-editor")
  },

  methods: {
    // editorInit() {
    //   require("brace/ext/language_tools"); //language extension prerequsite...
    //   require("brace/mode/html");
    //   require("brace/mode/javascript"); //language
    //   require("brace/mode/less");
    //   require("brace/theme/chrome");
    //   require("brace/snippets/javascript"); //snippet
    // },
    async globalRefresh() {
      let searchConName = this.$refs.commonGrid.searchConName.trim();
      this.globalRefreshFlag = false;
      this.$Spin.show();
      try {
        let data = await getAllClassNamesMin();
        if(data.success){
          data.data.forEach(item => {
            this.classList[item.className] = item.displayName;
          });
        }
      }catch (e) {
        this.$Spin.hide();
        console.log('获取全部类失败')
      }
      // this.initData(true);
      setTimeout(() => {
        this.$refs.commonGrid.searchConName = searchConName;
        this.changePage(1);
        this.$Spin.hide();
      }, 800)
      this.$nextTick(() => {
        this.globalRefreshFlag = true;
      })
    },

    // 数据初始化
    async initData(autoFlag) {

      // loading动画
      // 操作列表get
      // this.operationList = [];
      // 表格数据
      this.moduleData = [];
      this.thisTableCurrentPageData = [];
      this.edittingStore = [];
      try {
        let data = await getAllClassNamesMin();
        if(data.success){
          data.data.forEach(item => {
            this.classList[item.className] = item.displayName;
          });

        }
      }catch (e) {
        this.$Spin.hide();
        console.log('获取全部类失败')
      }

      this.changePage(1, autoFlag);
      // this.iconList = moduleIconData;
      // this.iList = fontIconData;

    },

    initPromise() {

      // 获取实体类
      // let promiseEntities = new Promise((resolve, reject) => {
      //   this.entitiesList = [];
      //   getAllEntities()
      //     .then(response => {
      //     let res = response.data;
      //     resolve(res);
      //     if (!res.success) {
      //         const title = "提示";
      //         const content = "<p>服务器繁忙, 资源类列表获取失败请稍后再试～</p>";
      //         this.$Modal.warning({
      //         title: title,
      //         content: content
      //         });
      //     } else {
      //         res.data.forEach((val, index, val_arr) => {
      //         let eachItem = {
      //             value: val.className + "&e",
      //             label: val.displayName
      //         };
      //         this.entitiesList.push(eachItem);
      //         });
      //     }
      //     })
      //     .catch(e => {
      //         console.log(e);
      //         reject(e);
      //     });
      // })

      // let promise4 = new Promise((resolve, reject) => {
      //   getPlugList()
      //   .then(response => {
      //     let res = response.data;
      //     resolve(res);
      //     if (!res.success) {
      //       // 系统插件获取失败 禁止选择插件入口方式
      //       this.nonePlug = true;


      //       this.editQuickForm.radio = "后端脚本";
      //       this.editQuickForm.content = "serverScript:";
      //     } else {
      //       if (res.data.length == 0) {
      //         // 系统插件数量为零 禁止选择插件入口方式
      //         this.nonePlug = true;

      //         this.editQuickForm.radio = "后端脚本";
      //         this.editQuickForm.content = "serverScript:";
      //       } else {
      //         this.plugData = res.data;
      //         res.data.forEach((val, index) => {
      //           let eachPlug = {
      //             value: index,
      //             label: val.name
      //           };
      //           this.plugList.push(eachPlug);
      //         });
      //       }
      //     }
      //   })
      //   .catch(e => {
      //     console.log(e);
      //     reject(e);
      //   });
      // })
    },

    // 关体类及操作数据获取
    async getRelationAndOpe(pageIndex = 0, pageSize = 25, flag, fuzzySearch = '') {
      this.moduleData = [];
      this.thisTableCurrentPageData = [];
      this.edittingStore = [];
      let temEntry = [];
      // this.entitiesList = [];

      // 获取全部实体类
      let needCount = {
        needOperationCount: false
      };
      let _self = this;
      try {
        let res = await getAllRelationOperations(pageIndex, this.pageSize, true, fuzzySearch);
        if (!res.data.success) {
          this.$Spin.hide();
          const title = "提示";
          const content = "<p>服务器繁忙, 关联类操作获取失败请稍后再试～</p>";
          this.$Modal.warning({
            title: title,
            content: content
          });
        }else{
          if(res.data.data.data){
            let data = res.data.data.data;
            let totalCount;
            if(res.data.data.pageInfo){
              totalCount = res.data.data.pageInfo.totalCount;
            }else{
              totalCount = data.length;
            }

            let entryData = [];
            res.data.data.data.forEach((opr, i) => {
              let keys = Object.keys(opr);
              entryData[i] = {};
              entryData[i].className = keys[0];
              entryData[i].displayName = this.classList[keys[0]];
              entryData[i].children = [];
              entryData[i].action = "--";
              entryData[i].conType = "--";
              entryData[i].isInherit = true;
              entryData[i].isSelf = false;
              entryData[i].showCheck = false;
              entryData[i].showSelect = false;
              let eachItem = {
                value: `${keys[0]}&e`,
                label: `${keys[0]}`
              }
              this.relationsList.push(eachItem);
              if(opr[keys].length > 0) {
                opr[keys].forEach((y) => {
                  let val = y;
                  // action为folder的快速查询操作 需要有选择框 允许绑定快速查询操作
                  let isFolder = val.action == 'folder' ? false : true;

                  val.id = val.oid;
                  val.className = val.authority;
                  val.showCheck = false;
                  val.showSelect = isFolder;
                  val.isSelf = false;
                  val.isModel = false;
                  val.belongModule = keys[0];
                  val.isSystem = "快速查询操作";
                  entryData[i].children.push(val);
                });
              }
            })

            this.moduleData = entryData;
            this.total = totalCount;
            if(!flag) {
              this.$Spin.hide();
            }
          }else{
            let totalCount = 0;
            let entryData = [];
            this.$Spin.hide();
            this.moduleData = entryData;
            this.total = totalCount;
          }
        }
      }catch(e){
        this.$Spin.hide();
        this.$Message.error('服务繁忙稍后再试');
        console.log(e);
      }

      // getAllRelations(needCount)
      //   .then(response => {
      //     let res = response.data;
      //     if (!res.success) {
      //       _self.$Spin.hide();
      //       const title = "提示";
      //       const content = "<p>服务器繁忙, 实体类获取失败请稍后再试～</p>";
      //       _self.$Modal.warning({
      //         title: title,
      //         content: content
      //       });
      //     } else {
      //       if (res.data.length == 0) {
      //         this.moduleData = [];
      //         this.hasData = false;
      //         this.$Spin.hide();
      //       } else {
      //
      //         let entryData = res.data;
      //         for (let i in entryData) {
      //
      //           entryData[i].children = [];
      //           entryData[i].viewName = "--";
      //           entryData[i].isSystem = "--";
      //           entryData[i].isInherit = true;
      //           entryData[i].isSelf = false;
      //           entryData[i].showCheck = false;
      //           entryData[i].showSelect = false;
      //
      //           let eachItem = {
      //             value: `${entryData[i].className}&re`,
      //             label: entryData[i].displayName
      //           }
      //           this.relationsList.push(eachItem);
      //         }
      //         temEntry = entryData;
      //
      //       }
      //     }
      //   }).then(() => {
      //
      //     let entryPromise = [];
      //     for (let i in temEntry) {
      //       entryPromise.push(getRelationOperations(temEntry[i].className).then(response => {
      //         let res = response.data;
      //
      //         // 系统操作
      //         // if(res.data.metaOperationBOs.length > 0) {
      //
      //         //     for (let x in res.data.metaOperationBOs) {
      //         //       let val = res.data.metaOperationBOs[x];
      //         //       if(val.className != 'CreateQueryOperation' && val.className != 'RefreshModule' && val.className != 'LoadQueryOperation') {
      //         //       let inheritFlag = val.bindClassName == temEntry[i].className ? false : true;
      //         //       if(!inheritFlag) {
      //
      //         //           val.id = val.bindID;
      //         //           val.showCheck = false;
      //         //           val.showSelect = true;
      //         //           val.isSelf = false;
      //         //           val.isInherit = inheritFlag;
      //         //           val.belongModule = val.bindClassName;
      //         //           val.isSystem = "系统操作";
      //
      //         //           temEntry[i].children.push(val);
      //         //       }
      //         //       }
      //         //   }
      //
      //         // }
      //
      //         // 快速查询操作
      //         if(res.data.queryOprConfigs.length > 0) {
      //             for (let y in res.data.queryOprConfigs) {
      //               let val = res.data.queryOprConfigs[y];
      //               // action为folder的快速查询操作 需要有选择框 允许绑定快速查询操作
      //               let isFolder = val.action == 'folder' ? false : true;
      //
      //               val.id = val.oid;
      //               val.className = val.authority;
      //               val.showCheck = false;
      //               val.showSelect = isFolder;
      //               val.isSelf = false;
      //               val.isModel = false;
      //               val.belongModule = temEntry[i].className;
      //               val.isSystem = "快速查询操作";
      //               temEntry[i].children.push(val);
      //           }
      //         }
      //
      //       }))
      //     }
      //
      //     Promise.all(entryPromise).then(() => {
      //       _self.moduleData = temEntry;
      //       this.total = _self.moduleData.length;
      //       this.changePage();
      //       _self.$Spin.hide();
      //       debugger
      //
      //       if(_self.isInitPromise) {
      //         _self.initPromise();
      //       }
      //     });

        // }).catch(e => {
        //   _self.$Spin.hide();
        //   this.$Message.error('服务繁忙稍后再试');
        //   console.log(e);
        // });
    },

    async changePage(page, flag){
      this.currentPage = page;
      await this.getRelationAndOpe(page-1, this.pageSize, flag, this.$refs.commonGrid.searchConName);
      this.thisTableCurrentPageData = this.moduleData;
      this.edittingStore = _.cloneDeep(this.thisTableCurrentPageData);
    },

    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.changePage(1);
    },
    // 操作选择联动
    // selectChange(val) {
    //   if(this.operationList[val]) {
    //     this.bindForm.cname = this.operationList[val].displayName;
    //     this.bindForm.opePath = this.operationList[val].packagePath;
    //   }

    //   // 视图名称联动
    //   // let eachClass = this.operationList[val].className;
    //   // getViews(eachClass).then(response => {
    //   //     let res = response.data;
    //   //     if(!res.success) {
    //   //         const title = '提示';
    //   //         const content = '<p>服务器繁忙, 视图获取失败请稍后再试～</p>';
    //   //         this.$Modal.warning({
    //   //             title: title,
    //   //             content: content
    //   //         });
    //   //     } else {
    //   //         if(res.data.length == 0) {
    //   //             let eachItem = {
    //   //                 value: '*',
    //   //                 label: '*'
    //   //             }
    //   //             this.viewList.push(eachItem);
    //   //             this.bindForm.viewName = '*';
    //   //             this.bindForm.relationName = '*';
    //   //         } else {
    //   //             res.data.forEach((val,index,val_arr)=>{
    //   //                 let eachItem = {
    //   //                     value: val.viewName,
    //   //                     label: val.viewName
    //   //                 }
    //   //                 this.viewList.push(eachItem);
    //   //             })
    //   //         }
    //   //     }
    //   // }).catch((e) => {
    //   //     console.log(e);
    //   // });
    // },

    // 当前绑定是否为新系统操作
    // getName(name) {
    //   this.targetTab = name;
    // },

    // common不合法信息弹窗
    // errorRexp(mes) {
    //   let _self = this;
    //   this.$Message.warning({
    //     content: mes,
    //     duration: 2,
    //     onClose: function() {
    //       _self.bindModal = true;
    //     }
    //   });
    // },

    // 显示创建并绑定弹窗
    // bindQuick() {
    //   if (this.bindParams.bindID == "") {
    //     // 未选择模块 弹窗提示
    //     const title = "提示";
    //     const content = "<p>请先选择需要绑定的模块～</p>";
    //     this.$Modal.warning({
    //       title: title,
    //       content: content
    //     });
    //   } else {
    //     this.bindModal = false;
    //     this.editOperation = true;
    //     this.editQuickForm.icon = this.iconList[0].value;
    //   }
    // },


    // 脚本实现方式  快速查询操作操作
    // chooseWayQucik(value) {
    //   if (value == "后端脚本") {
    //     this.editQuickForm.content = "serverScript:";
    //   } else if (value == "存储过程") {
    //     this.editQuickForm.content = "procedure:";
    //   } else if (value == "前端脚本") {
    //     this.editQuickForm.content = "clientScript:";
    //   } else {
    //     this.editQuickForm.content = "";
    //   }
    // },

    // cancelQuick() {
    //   this.$refs['editQuickForm'].resetFields();

    //   this.editQuickForm.goal = '';
    //   this.editQuickForm.viewName = '';
    //   this.editQuickForm.moduleName = this.bindParams.bindClassName;
    // },

    cancel() {},

    // chooseIcon(value) {
    //   this.editQuickForm.icon = value;
    // },

    // 视图改变 关联名称改变
    // chooseView(value) {
    //   let cname = this.operationList[this.bindForm.opeList].className;
    //   if (value == "forwardrelation") {
    //     getRelationNameF(cname)
    //       .then(response => {
    //         let res = response.data;
    //         if (!res.success) {
    //           const title = "提示";
    //           const content = "<p>服务器繁忙, 关联名称获取失败请稍后再试～</p>";
    //           this.$Modal.warning({
    //             title: title,
    //             content: content
    //           });
    //         } else {
    //           if (res.data.length == 0) {
    //             this.bindForm.relationName = "*";
    //             this.isHasR = true;
    //           } else {
    //             this.relationList = [];
    //             this.isHasR = false;
    //             res.data.forEach((val, index) => {
    //               let defaultV = {
    //                 value: val.className,
    //                 label: val.leftRole
    //               };
    //               this.relationList.push(defaultV);
    //             });
    //           }
    //         }
    //       })
    //       .catch(e => {
    //         console.log(e);
    //       });
    //   } else if (value == "backwardrelation") {
    //     getRelationNameB(cname)
    //       .then(response => {
    //         let res = response.data;
    //         if (!res.success) {
    //           const title = "提示";
    //           const content = "<p>服务器繁忙, 关联名称获取失败请稍后再试～</p>";
    //           this.$Modal.warning({
    //             title: title,
    //             content: content
    //           });
    //         } else {
    //           if (res.data.length == 0) {
    //             this.bindForm.relationName = "*";
    //             this.isHasR = true;
    //           } else {
    //             this.relationList = [];
    //             this.isHasR = false;
    //             res.data.forEach((val, index) => {
    //               let defaultV = {
    //                 value: val.className,
    //                 label: val.rightRole
    //               };
    //               this.relationList.push(defaultV);
    //             });
    //           }
    //         }
    //       })
    //       .catch(e => {
    //         console.log(e);
    //       });
    //   } else {
    //     return;
    //   }
    // },

    // 视图 & 目标对象联动
      // changeView(value) {
      //   if (value === undefined || value === '') return;
      //   if(value != ''  && value != '&r' && value != '&e') {
      //       this.spinShow = true;
      //   }

      //   this.loadingObj = true;
      //   // 视图数据获取
      //   let eachClass = value.split("&")[0];
      //   let whichClass = value.split("&")[1];
      //   if(eachClass != '') {
      //     getViews(eachClass)
      //       .then(response => {
      //         this.viewList = [];
      //         let res = response.data;

      //         // 增加回调视图列表的等待动画遮罩
      //         this.spinShow = false;

      //         if (!res.success) {
      //           this.$Spin.hide();
      //           this.$Message.error('服务繁忙, 表单列表获取失败');
      //         } else {
      //           if (res.data.length == 0) {
      //             let eachItem = {
      //               value: "*",
      //               label: "*"
      //             };
      //             this.viewList.push(eachItem);
      //             this.editQuickForm.viewName = "*";
      //           } else {
      //             res.data.forEach((val, index, val_arr) => {
      //               let eachVname = val.viewName;
      //               let eachItem = {
      //                 value: eachVname,
      //                 label: eachVname
      //               };
      //               this.viewList.push(eachItem);
      //             });
      //           }
      //         }
      //       })
      //       .catch(e => {
      //         console.log(e);
      //         this.$Spin.hide();
      //       });
      //   }
      // },

    // 快速查询操作英文名查重
    // checkCname() {
    //   if (this.editQuickForm.ename != "") {
    //     const reg = /^[\u4e00-\u9fa5]/;
    //     let flag = reg.test(this.editQuickForm.ename);
    //     if(flag){
    //       this.$Message.error("英文名不能包含中文哦～");
    //     } else {
    //       checkCnameEvent(this.editQuickForm.ename).then(response => {
    //         let res = response.data;
    //         if (res.success && res.data != undefined) {
    //           this.cnameExist = true;
    //         } else {
    //           this.cnameExist = false;
    //         }
    //       })
    //       .catch(e => {
    //         console.log(e);
    //       });
    //     }
    //   }
    // },

    // 点击事件 返回数据处理
    makeData(data) {
      const t = this.type(data);
      let o;
      if (t === "array") {
        o = [];
      } else if (t === "object") {
        o = {};
      } else {
        return data;
      }
      if (t === "array") {
        for (let i = 0; i < data.length; i++) {
          o.push(this.makeData(data[i]));
        }
      } else if (t === "object") {
        for (let i in data) {
          if (
            i != "spaceHtml" &&
            i != "parent" &&
            i != "level" &&
            i != "expanded" &&
            i != "isShow" &&
            i != "load"
          ) {
            o[i] = this.makeData(data[i]);
          }
        }
      }
      return o;
    },

    type(obj) {
      var toString = Object.prototype.toString;
      var map = {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regExp",
        "[object Undefined]": "undefined",
        "[object Null]": "null",
        "[object Object]": "object"
      };
      return map[toString.call(obj)];
    },

    rowClick(data, index, text) {
      let result = this.makeData(data);
      if (text == "查看操作") {

      } else if (text == "删除") {
        this.delOpe = true;
        this.needDelModule = result.belongModule;
        // if (result.isSystem == "系统操作") {
        //   this.needDelType = 0;
        //   this.needDelId = result.className;
        //   this.needDelVname = result.viewName;
        // } else {
        //   this.needDelType = 1;
          this.needDelId = result.id;
        // }
      } else {
        return;
      }
    },

    // 确认删除
    okDel() {
      let _self = this;
      // if (this.needDelType == 0) {

      // } else {
        delQuickOpe(this.needDelId)
          .then(async res => {
            if (!res.success) {
              this.$Message.warning({
                content: "服务器繁忙, 删除失败请稍后再试",
                duration: 3
              });
            } else {
              this.$Spin.show();
              localStorage.setItem('query_oprs', '');
              localStorage.setItem('class_oprs', '');
              this.isInitPromise = false;
              await this.changePage(this.currentPage);
              this.$nextTick(() => {
                this.$refs.commonGrid.handleSearch();
              })
              this.$Message.info({
                content: "删除成功",
                duration: 3
              });
            }
          })
          .catch(e => {
            console.log(e);
          });
      // }
    },

    // 确认绑定快速查询操作
    // bindQuickEvent() {
    //   let _self = this;
    //   if (this.editQuickForm.icon == '') {
    //       this.$Message.warning({
    //         content: "请选择图标",
    //         duration: 2,
    //         onClose: function() {
    //           _self.editOperation = true;
    //         }
    //       });
    //     } else if (this.editQuickForm.style == '') {
    //       this.$Message.warning({
    //         content: "请选择操作样式",
    //         duration: 2,
    //         onClose: function() {
    //           _self.editOperation = true;
    //         }
    //       });
    //     } else if (this.editQuickForm.action == '') {
    //       this.$Message.warning({
    //         content: "请选择实现方式",
    //         duration: 2,
    //         onClose: function() {
    //           _self.editOperation = true;
    //         }
    //       });
    //     } else if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'edit' || this.editQuickForm.action == 'visit' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'list') {
    //       if(this.editQuickForm.goal == '') {
    //         this.$Message.warning({
    //           content: "请选择目标类",
    //           duration: 2,
    //           onClose: function() {
    //             _self.editOperation = true;
    //           }
    //         });
    //       } else if(this.editQuickForm.viewName == '') {
    //         this.$Message.warning({
    //           content: "请选择表单名称",
    //           duration: 2,
    //           onClose: function() {
    //             _self.editOperation = true;
    //           }
    //         });
    //       } else {
    //         this.$refs['editQuickForm'].validate(valid => {
    //           if (valid) {
    //             _self.commonFixQope();
    //           } else {
    //             this.$Message.warning({
    //               content: "信息填写有误, 请重新填写",
    //               duration: 2,
    //               onClose: function() {
    //                 _self.editOperation = true;
    //               }
    //             });
    //           }
    //        })
    //       }
    //     }  else if (this.editQuickForm.action == 'url') {
    //       if(this.editQuickForm.linkUrl == '') {
    //         this.$Message.warning({
    //           content: "请填写合法url地址",
    //           duration: 2,
    //           onClose: function() {
    //             _self.editOperation = true;
    //           }
    //         });
    //       } else {
    //         this.$refs['editQuickForm'].validate(valid => {
    //           if (valid) {
    //             _self.commonFixQope();
    //           } else {
    //             this.$Message.warning({
    //               content: "信息填写有误, 请重新填写",
    //               duration: 2,
    //               onClose: function() {
    //                 _self.editOperation = true;
    //               }
    //             });
    //           }
    //         })
    //       }
    //     } else {
    //        this.$refs['editQuickForm'].validate(valid => {
    //         if (valid) {
    //           _self.commonFixQope();
    //         } else {
    //             this.$Message.warning({
    //               content: "信息填写有误, 请重新填写",
    //               duration: 2,
    //               onClose: function() {
    //                 _self.editOperation = true;
    //               }
    //             });
    //           }
    //        })
    //     }
    // },
    // commonFixQope() {
    //   this.$Spin.show();
    //   let finalExpre = null;
    //   if(this.editQuickForm.action == 'url') {
    //     finalExpre = this.editQuickForm.linkUrl;
    //   } else if(this.editQuickForm.action == 'implement') {
    //     if (this.nonePlug) {
    //       finalExpre = this.editQuickForm.content;
    //     } else {
    //       finalExpre = this.editQuickForm.plugPath;
    //     }
    //   } else {
    //     finalExpre = this.editQuickForm.queryCont;
    //   }

    //   let fixQuickParams = {
    //     action: this.editQuickForm.action,
    //     authority: this.editQuickForm.ename,
    //     conType: this.editQuickForm.style,
    //     conditionExpre: finalExpre,
    //     displayName: this.editQuickForm.cname,
    //     icon: this.editQuickForm.icon,
    //     moduleName: this.editQuickForm.moduleName + '-' + this.editQuickForm.viewName,
    //     order: this.editQuickForm.targetNumber,
    //     params: this.editQuickForm.params || '',
    //     targetClass: this.editQuickForm.goal.split("&")[0] || '',
    //     viewName: this.editQuickForm.viewName,
    //     viewTitle: this.editQuickForm.viewTitle
    //   };

    //   createQuickOpe(fixQuickParams)
    //     .then(res => {
    //       if (!res.success) {
    //         this.$Spin.hide();
    //         this.$Message.warning({
    //           content: "服务器繁忙, 修改失败请稍后再试",
    //           duration: 3
    //         });
    //       } else {
    //         this.isInitPromise = false;
    //         this.getRelationAndOpe();
    //         this.$Message.info({
    //           content: "绑定成功",
    //           duration: 3
    //         });
    //         this.$refs['editQuickForm'].resetFields();
    //         this.$refs["selectGoal"].clearSingleSelect();
    //       }
    //     })
    //     .catch(e => {
    //       console.log(e);
    //       this.$Spin.hide();
    //       this.$Message.error('服务繁忙稍后再试');
    //     });
    // },
    // selectionClick(arr) {

    //   if (arr.length > 1 && typeof arr[arr.length - 1] == "string") {
    //     let isFolder = arr[arr.length - 1].split("&")[1].split("#")[1];

    //     // folder近允许绑定快速查询操作
    //     if(isFolder == 'false') {
    //       this.folderFobbiden = true;
    //     } else {
    //       this.folderFobbiden = false;
    //     }

    //     this.bindParams.bindClassName = arr[arr.length - 1].split("&")[1].split("#")[0];
    //     this.bindParams.bindID = arr[arr.length - 1].split("&")[0];
    //     this.editQuickForm.moduleName = this.bindParams.bindClassName;

    //   } else {
    //     this.folderFobbiden = false;
    //     this.bindParams.bindClassName = '';
    //     this.bindParams.bindID = '';
    //   }

    // },

    // 一键跳转到编辑表单
    // toEditForm() {
    //   this.editOperation = false;

    //   const className = this.editQuickForm.goal.split("&")[0];
    //   const viewName = this.editQuickForm.viewName;

    //   var route = this.$store.state.app.newRoutes.filter(item => item.children
    //       && item.children.length > 0 && item.children[0].meta
    //       && item.children[0].meta.className == className
    //       && item.children[0].meta.formName == viewName);
    //       if (route.length > 0) {
    //         this.root.turnToPage(route[0].children[0].name);
    //         return;
    //       }
    //       route = {
    //         path: "/form-engine",
    //         name: "form-engine",
    //         meta: {
    //           icon: "md-help-buoy",
    //           title: "表单模型"
    //         },
    //         component: () => import("@/views/main/Main.vue"),
    //         children: [
    //           {
    //             path: `form-edit-${className}-${viewName}`,
    //             name: `form-edit-${className}-${viewName}`,
    //             meta: {
    //               className: className,
    //               formName: viewName,
    //               title: `修改表单-${className}-${viewName}`,
    //               path: 'form-engine/form-create.vue'
    //             },
    //           }
    //         ]
    //       }
    //       this.addRoute(route);
    //       this.router.options.routes.push(route);
    //       this.router.addRoutes([route]);
    //       this.root.turnToPage(`form-edit-${className}-${viewName}`);

    // },

    // 显示最大化编辑器窗口
    // changeBigSize(formName) {
    //   this.bigScriptForm = formName;

    //   if(formName == 'bindForm2') {


    //   } else {

    //     this.editOperation = false;
    //     if(this.editQuickForm.action == 'implement') {
    //       this.commonScript = this.editQuickForm.content;
    //     } else {
    //       this.commonScript = this.editQuickForm.params;
    //     }

    //   }

    //   this.isFullScreen = true;
    // },

    // 最大化脚本编辑确认
    // confirmScript() {
    //   this.isFullScreen = false;
    //   if(this.bigScriptForm == 'bindForm2') {

    //   } else {

    //     if(this.editQuickForm.action == 'implement') {
    //       this.editQuickForm.content = this.commonScript;
    //     } else {
    //       this.editQuickForm.params = this.commonScript;
    //     }

    //     this.editOperation = true;

    //   }
    // },
    // 关闭最大化脚本编辑弹窗
    // cancelScript() {
    //   this.isFullScreen = false;
    //   if(this.bigScriptForm == 'bindForm2') {

    //   } else {

    //     this.editOperation = true;

    //   }
    //   this.commonScript = '';
    // },

    // toggleShow() {
    //   // console.log(this.toggleText);
    //   // console.log(document.getElementsByClassName('child-tr unInherit'));
    // }

    async onSuccessCreateQueryOpr(){
      // this.$Spin.show();
      // await this.changePage(this.currentPage);
      this.$nextTick(() => {
        this.$refs.commonGrid.handleSearch();
        // this.$Spin.hide();
      })
    },

    async handleSearch(searchConName){
      if(searchConName.trim()) {
        await this.getRelationAndOpe(0, this.pageSize, true, searchConName.trim());
        this.thisTableCurrentPageData = this.moduleData;
        this.edittingStore = _.cloneDeep(this.thisTableCurrentPageData);
      }else{
        this.changePage(1);
      }
    },

    maxSlice(v) {
      if (v !== null && v !== '' && v != undefined) {
        if(v === false || v === true) v = v + '';
        return v.length > 32 ? v.slice(0, 32) + "..." : v
      }
    },
  },
  created() {
    this.$store = this.store;
    this.$Spin.show();
    this.initData();
  }
};
</script>
<style>
  .showInherit > #hl-tree-table > tbody > .unInherit[data-v-faf56f32] {
    display: none !important;
  }
</style>

