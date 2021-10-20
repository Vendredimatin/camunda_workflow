<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title">
                        <Icon type="ios-keypad"></Icon>
                         模块操作管理
                    </p>
                    <Row style="margin-bottom: 15px">
                        <span>模块操作列表</span>
                        <Button type="primary" style="float:right;" @click="createModule">新增模块</Button>
                        <Button v-show="hasData" type="primary" style="float:right;margin-right: 15px;" @click="createBindQuick">创建查询操作</Button>
                        <Button v-show="hasData" type="primary" :disabled="folderFobbiden" style="float:right;margin-right: 15px;" @click="createBindSystem">创建并绑定系统操作</Button>
                        <Button v-show="hasData" type="primary" :disabled="folderFobbiden" style="float:right;margin-right: 15px;" @click="bindSystem">绑定系统操作</Button>
                    </Row>
                    <tree-grid
                        v-if="hasData"
                        style="height: 609px; overflow-y: auto;"
                        :items='moduleData'
                        :columns='columns'
                        @on-row-click='rowClick'
                        @on-row-dblclick='dbRowClick'
                        @on-selection-change='selectionClick'
                    ></tree-grid>
                    <Row v-show="!hasData">
                        <p style="text-align: center;">暂无数据</p>
                    </Row>
                    <!-- 新增模块 -->
                    <Modal
                        v-model="newMoadl"
                        title="新增模块"
                        width="50%"
                        :mask-closable="false"
                        @on-ok="confirmNew('newModalForm')"
                        @on-cancel="cancel">

                        <Form ref="newModalForm" :model="newModalForm" :rules="ruleNewModal" :label-width="100">
                          <Row>
                            <Col span="12">
                              <FormItem label="英文名" prop="ename">
                                <Input v-model.trim="newModalForm.ename"></Input>
                              </FormItem>
                            </Col>
                            <Col span="12">
                              <FormItem label="显示名" prop="cname">
                                <Input v-model.trim="newModalForm.cname" placeholder="请输入显示名"></Input>
                              </FormItem>
                            </Col>
                          </Row>
                          <Row>
                            <Col span="12">
                              <FormItem label="图标" prop="icon">
                                  <Select v-model="newModalForm.icon" filterable clearable @on-change="chooseIcon">
                                      <Option v-for="item in moduleIconList" :value="item.value" :key="item.value" :label="item.label">
                                          <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                                          <span style="float:right;color:#ccc">{{ item.label }}</span>
                                      </Option>
                                  </Select>
                              </FormItem>
                            </Col>
                            <Col span="12">
                              <FormItem label="序号" prop="targetNumber" number>
                                <Input v-model="newModalForm.targetNumber"></Input>
                              </FormItem>
                            </Col>
                          </Row>
                        </Form>
                    </Modal>
                    <!-- 新增模块ending -->
                    <!-- 绑定操作 -->
                    <Modal
                        v-model="bindModal"
                        title="绑定系统操作"
                        :mask-closable="false"
                        @on-ok="confirmBind"
                        @on-cancel="cancelBindSysOpe">

                        <Form ref="bindForm" :model="bindForm" :rules="ruleBind" :label-width="100">
                            <!-- <FormItem label="中文名" prop="cname">
                                <Input v-model="bindForm.cname" placeholder="请输入显示名"></Input>
                            </FormItem> -->
                            <FormItem label="图标">
                                <Select v-model="bindForm.icon" filterable clearable @on-change="chooseModuleIcon">
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
                            <FormItem label="操作列表" prop="opeList">
                                <Select v-model="bindForm.opeList" filterable multiple>
                                    <Option v-for="item in operationList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                        </Form>
                    </Modal>
                   <!-- 绑定操作ending -->

                    <!-- 创建并绑定操作 -->
                    <Modal
                        v-model="createBindModal"
                        title="创建并绑定系统操作"
                        width="50%"
                        :mask-closable="false"
                        @on-ok="confirmCreateBind('createBindForm')"
                        @on-cancel="cancel">
                        <Form ref="createBindForm" :model="createBindForm" :rules="ruleBindCreate" :label-width="100">
                            <FormItem label="英文名" prop="ename">
                                <Input v-model.trim="createBindForm.ename" placeholder="请输入英文名" @on-blur="checkCname('createBindForm')"></Input>
                                <span v-show="cnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
                            </FormItem>
                            <FormItem label="显示名" prop="cname">
                                <Input v-model.trim="createBindForm.cname" placeholder="请输入显示名"></Input>
                            </FormItem>
                            <FormItem label="显示图标">
                                <Select v-model="createBindForm.icon" filterable clearable @on-change="chooseIcon">
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
                            <FormItem label="实现方式">
                                <RadioGroup v-model="createBindForm.radio" @on-change="chooseWay">
                                    <Radio label="插件调用" :disabled="nonePlug">插件调用</Radio>
                                    <Radio label="后端脚本">后端脚本</Radio>
                                    <Radio label="前端脚本">前端脚本</Radio>
                                    <Radio label="存储过程">存储过程</Radio>
                                    <Radio label="插件别名">插件别名</Radio>
                                </RadioGroup>
                            </FormItem>
                            <FormItem label="脚本内容" v-show="createBindForm.radio == '插件调用'">
                                <Select v-model="createBindForm.plugPath" filterable>
                                    <Option v-for="item in plugList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <Row v-show="createBindForm.radio != '插件调用'">
                              <Col span="20">
                                <FormItem label="脚本内容">
                                  <editor v-model="createBindForm.content" @init="editorInit" lang="javascript" theme="chrome" width="85%" height="200"></editor>
                                </FormItem>
                              </Col>
                              <Col span="2" offset="1">
                                <Button shape="circle" type="default" icon="ios-expand" @click="changeBigSize('createBindForm')"></Button>
                              </Col>
                            </Row>
                        </Form>
                    </Modal>
                    <!-- 创建并绑定操作ending -->

                    <!-- 编辑操作 -->
                    <Modal
                        v-model="editOperation"
                        title="信息编辑"
                        width="50%"
                        :mask-closable="false"
                        @on-ok="confirmFix"
                        @on-cancel="cancelEdit">
                        <!-- 模块 -->
                        <Form ref="editModel" :model="editModel" :rules="ruleModel" :label-width="100" v-show="editFlag == 2">
                          <Row>
                            <Col span="12">
                              <FormItem label="英文名" prop="ename">
                                <Input v-model.trim="editModel.ename" disabled></Input>
                              </FormItem>
                            </Col>
                            <Col span="12">
                              <FormItem label="显示名" prop="cname">
                                <Input v-model.trim="editModel.cname" placeholder="请输入显示名"></Input>
                              </FormItem>
                            </Col>
                          </Row>
                          <Row>
                            <Col span="12">
                              <FormItem label="图标" prop="icon">
                                  <Select v-model="editModel.icon" filterable clearable @on-change="chooseIcon">
                                      <Option v-for="item in moduleIconList" :value="item.value" :key="item.value" :label="item.label">
                                          <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                                          <span style="float:right;color:#ccc">{{ item.label }}</span>
                                      </Option>
                                  </Select>
                              </FormItem>
                            </Col>
                            <Col span="12">
                              <FormItem label="序号" prop="targetNumber" number>
                                <Input v-model="editModel.targetNumber"></Input>
                              </FormItem>
                            </Col>
                          </Row>
                        </Form>
                        <!-- 系统操作 -->
                        <Form ref="editForm" :model="editForm" :rules="ruleFix" :label-width="100" v-show="editFlag == 0">
                            <FormItem label="英文名" prop="ename">
                                <Input v-model.trim="editForm.ename" disabled></Input>
                            </FormItem>
                            <FormItem label="显示名" prop="cname">
                                <Input v-model.trim="editForm.cname" placeholder="请输入显示名"></Input>
                            </FormItem>
                            <FormItem label="实现方式" prop="path">
                                <Input v-model="editForm.path" type="textarea" disabled></Input>
                            </FormItem>
                        </Form>
                        <!-- 快速查询操作 -->
                        <Form ref="editQuickForm" :model="editQuickForm" :rules="ruleFixQuick" :label-width="100" v-show="editFlag == 1 || editFlag == 3">
                            <Card style="width:100%; margin-bottom: 15px;">
                                <p slot="title">
                                    <Icon type="ios-information-circle"></Icon>
                                    基本属性
                                </p>
                                <Row>
                                    <Col span="12">
                                        <FormItem label="英文名" prop="ename">
                                            <Input v-model.trim="editQuickForm.ename" :disabled="disEname" @on-focus="cnameExist = false" @on-blur="checkCname('editQuickForm')"></Input>
                                             <span v-show="cnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
                                        </FormItem>
                                    </Col>
                                     <Col span="12">
                                        <FormItem label="显示名" prop="cname">
                                            <Input v-model.trim="editQuickForm.cname" @on-focus="dnameExist = false"></Input>
                                            <span v-show="dnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
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
                                    </Col>
<!--                                  <Col span="12" v-show="editQuickForm.action === 'implement' && editQuickForm.style === 'modal'">-->
<!--                                    <FormItem label="提交后自动关闭" prop="autoclose">-->
<!--                                      <Select v-model="editQuickForm.autoclose" filterable>-->
<!--                                        <Option v-for="item in autocloseList" :value="item.value" :key="item.value" :label="item.value">-->
<!--                                          <span>{{ item.value }}</span>-->
<!--                                          <span style="float:right;color:#ccc">{{ item.label }}</span>-->
<!--                                        </Option>-->
<!--                                      </Select>-->
<!--                                    </FormItem>-->
<!--                                  </Col>-->
                                    <!-- <Col span="12">
                                        <FormItem label="视图标题" prop="viewTitle">
                                            <Input v-model.trim="editQuickForm.viewTitle"></Input>
                                        </FormItem>
                                    </Col> -->
                                </Row>
                            </Card>
                            <Card style="width:100%" v-show="editQuickForm.action != 'folder'">
                                <p slot="title">
                                    <Icon type="ios-film-outline"></Icon>
                                    动作
                                </p>
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
                                <Row v-show="editQuickForm.action == 'implement'">
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
                                        <FormItem label="目标类" prop="goal">
                                          <Select v-model="editQuickForm.goal" filterable @on-change="changeView">
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
                                              <!-- <OptionGroup label="资源类">
                                                  <Option v-for="item in resourcesList" :value="item.value" :key="item.value" :label="item.label">
                                                      <span>{{ item.label }}</span>
                                                      <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                                                  </Option>
                                              </OptionGroup> -->
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
                                        <Col v-show="editQuickForm.viewName != '' && editQuickForm.viewName != '*'" span="2" offset="1">
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
                                </Row>
                                <!-- <Row v-show="(editQuickForm.action == 'edit' || editQuickForm.action == 'visit')">
                                    <Col span="12">
                                        <FormItem label="目标对象" prop="goalObj">
                                            <Input v-model="editQuickForm.goalObj" placeholder="请在下面表格中选择需要的对象"></Input>
                                        </FormItem>
                                    </Col>
                                </Row> -->
                                <!-- <Row v-show="((editQuickForm.action == 'edit' || editQuickForm.action == 'visit') && editQuickForm.goal != '')">
                                    <Table height="200" highlight-row ref="currentRowTable" :loading="loadingObj" :columns="columns3" :data="data1" @on-current-change="chooseGoalObj"></Table>
                                </Row> -->
                                 <Row v-show="editQuickForm.action == 'url'">
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
                    </Modal>
                   <!-- 编辑操作ending -->
                   <Modal
                        v-model="delOpe"
                        title="重要提示"
                        @on-ok="okDel"
                        @on-cancel="cancel">
                        <p>您即将删除当前选中的行的数据, 是否确认删除?</p>
                    </Modal>
                </Card>
            </Col>

            <!-- 最大化编辑器 -->
            <Modal
              v-model="isFullScreen"
              title="脚本编辑"
              :mask-closable="false"
              width="80%"
              @on-ok="confirmScript"
              @on-cancel="cancelScript">
                <editor v-model="commonScript" @init="editorInit" lang="javascript" theme="chrome" width="100%" height="600"></editor>
            </Modal>
            <!-- 最大化编辑器ENDING -->
        </Row>
    </div>
</template>
<script>
import { mapMutations } from 'vuex';
import TreeGrid from "./components/TreeGrid";
import moduleIconData from "./components/moduleIcon.js";
import fontIconData from "./components/iFontIcon.js";
import { entries as opr_entries } from "@/ext_components/operation/config.js";

import {
  getModules,
  getModuleOperations,
  getSystemOperations,
  bindOperation,
  getPlugList,
  addNewOperation,
  getIconList,
  getAllEntities,
  // getAllResources,
  getAllRelations,
  getViews,
  // getEobj,
  // getRobj,
  // getObjName,
  fixQuickOpe,
  fixSystemOpe,
  delQuickOpe,
  delSystemOpe,
  checkCnameEvent,
  bindOperations,
  unbindOperation,
  delModule,
  fixModule,
  createQuickOpe
} from "../../api/others";
export default {
  props: ["store", "route", "router", "root"],
  data() {
    const validateEname = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('英文名不能为空'));
        } else {
            const reg = new RegExp("^[a-zA-Z][a-zA-Z0-9]*$");
            let flag = reg.test(value);
            if(!flag){
              callback(new Error('英文名要已字母开头, 并且只能包含字母和数字哦～'));
            } else {
              callback();
            }
        }
    };
    return {
      newMoadl: false,
      hasData: true,
      loadingObj: false,
      disEname: true,
      cnameExist: false,
      dnameExist: false,
      finalValue: false,
      isFullScreen: false,     // 脚本编辑器全屏
      commonScript: '',     // 公共最大化编辑器内容
      bigScriptForm: '',    // 当前是哪个弹窗表单脚本被最大化

      isInitPromise: true,      // 仅页面第一次初始化时 加载资源类等数据

      folderFobbiden: false,      // folder操作仅允许绑定快速查询操作
      // columns3: [],          // *****原有需求 目标类需要展示表格 暂不需要展示******
      // data1: [],
      bindModal: false, // 仅创建
      createBindModal: false, // 创建并绑定
      editOperation: false, // 编辑操作
      delOpe: false,
      columns: [
        {
          type: "selection",
          width: 50,
          align: "center"
        },
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
        {
          title: "类型",
          key: "isSystem",
          width: 150,
          align: "center"
        },
        {
          title: "操作",
          type: "action",
          align: "center",
          actions: [
            {
              type: "primary",
              text: "编辑"
            },
            {
              type: "error",
              text: "删除"
            }
          ],
          width: 150
        }
      ],
      moduleData: [],
      operationList: [],
      newModalForm: {
        ename: "",
        cname: "",
        icon: '',
        targetNumber: 0
      },
      bindForm: {
        cname: "",
        icon: "",
        opeList: []
      },
      editModel: {
        cname: '',
        ename: '',
        icon: '',
        targetNumber: 0
      },
      editForm: {
        ename: "",
        cname: "",
        path: "",
        zoneName: "",
        classCategory: "",
        id: "",
        parentClass: ""
      },
      editFlag: 0, // 当前编辑的是系统 & 快速查询操作 0:系统
      createBindForm: {
        cname: "",
        ename: "",
        icon: "",
        radio: "插件调用",
        plugPath: "",
        content: ""
      },
      nonePlug: false, // 是否禁止选择插件入口的方式
      plugData: [],
      plugList: [],
      editQuickForm: {
        ename: "",
        cname: "",
        moduleName: "",
        targetNumber: "",
        icon: "",
        style: "modal",
        action: "create",
        radio: "插件调用",
        plugPath: "",
        content: "",
        goal: "",
        params: "",
        viewTitle: "",
        viewName: "",
        // goalObj: "",
        linkUrl: "",
        queryCont: "",
        oid: ""
      },
      needDelId: "",
      needDelType: 0,
      needDelModule: "",
      needDelVname: "",
      actionList: [
        {
          value: "create",
          label: "单对象创建"
        },
        // {
        //   value: "list",
        //   label: "多对象浏览"
        // },
        {
          value: "url",
          label: "外部链接"
        },
        {
          value: "implement",
          label: "操作实现"
        },
        // {
        //   value: "folder",
        //   label: "树形节点"
        // },
        {
          value: "edit",
          label: "单对象编辑"
        },
        {
          value: "visit",
          label: "单对象浏览"
        },
        // {
        //   value: "creates",
        //   label: "多对象创建"
        // }
      ],
      autocloseList: [
        {
          value: true,
          label: "自动关闭"
        },
        {
          value: false,
          label: "手动关闭"
        }
      ],
      iconList: [], // icon列表
      iList: [],
      moduleIconList: [], // 模块小图标列表
      entitiesList: [], // 实体类列表
      // resourcesList: [], // 资源类列表
      relationsList: [], // 关联类列表
      viewList: [], // 视图列表
      objList: [], // 目标对象列表
      objColumns: [], // 目标对象列表表头信息
      quickStyle: [
        // {
        //   value: "button",
        //   label: "button | 独立按钮"
        // },
        // {
        //   value: "group",
        //   label: "group | 按钮点击后的下拉菜单"
        // },
        // {
        //   value: "icon",
        //   label: "icon | 带图标的按钮"
        // },
        {
          value: "modal",
          label: "modal | 弹框显示"
        },
        {
          value: "tab",
          label: "tab | 增加页签"
        }
      ],
      ruleNewModal: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" }
        ],
        icon: [
          { required: true, message: "请选择小图标", trigger: "blur" }
        ],
        ename: [
          { required: true, message: "英文名不能为空哦～", trigger: "blur" },
          { validator: validateEname, trigger: 'blur' }
        ],
        targetNumber: [
          {
            pattern: /^[0-9]*$/,
            message: "序号只能是数字哦～",
            trigger: "blur"
          }
        ]
      },
      ruleBind: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" }
        ]
      },
      ruleBindCreate: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" }
        ],
        ename: [
          { required: true, message: "英文名不能为空哦～", trigger: "blur" },
          { validator: validateEname, trigger: 'blur' }
        ],
        editJs: [
          { required: true, message: "脚本内容不能为空哦～", trigger: "blur" }
        ]
      },
      ruleFix: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" }
        ]
      },
      ruleModel: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" }
        ],
        icon: [
          { required: true, message: "请选择小图标", trigger: "blur" }
        ],
        targetNumber: [
          {
            pattern: /^[0-9]*$/,
            message: "序号只能是数字哦～",
            trigger: "blur"
          }
        ]
      },
      fixModel: {},
      ruleFixQuick: {
        ename: [
            { required: true, message: '英文名不能为空哦～', trigger: 'blur' },
            { validator: validateEname, trigger: 'blur' }
        ],
        cname: [
            { required: true, message: '显示名不能为空哦～', trigger: 'blur' }
        ],
        action: [
            { required: true, message: '请选择动作类型～', trigger: 'blur' }
        ],
        style: [
            { required: true, message: '请选择操作样式～', trigger: 'blur' }
        ],
        viewTitle: [
            { required: true, message: '表单标题不能为空哦～', trigger: 'blur' }
        ]
      },
      bindParams: {
        bindClassName: "",
        bindID: ""
      }
    };
  },
  components: {
    TreeGrid,
    editor: require("vue2-ace-editor")
  },
  methods: {
    ...mapMutations(["addRoute"]),

    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },
    // 数据初始化
    initData() {

      // loading动画
      this.$Spin.show();

      // 操作列表get
      this.operationList = [];

      // 表格数据
      this.isInitPromise = true;
      this.getModuleAndOpe();

      this.moduleIconList = moduleIconData;
      this.iconList = moduleIconData;
      this.iList = fontIconData;
      this.editModel.icon = this.moduleIconList[0].value;
      this.newModalForm.icon = this.moduleIconList[0].value;

    },

    initPromise() {
      let promise1 = new Promise((resolve, reject) => {
        this.operationList = [];
        getSystemOperations()
          .then(response => {
            let res = response.data;
            resolve(res);
            if (res.success) {
              if (res.data.length > 0) {
                res.data.forEach((val, index, val_arr) => {
                  let eachU = {
                    className: val.className,
                    displayName: val.displayName || '--',
                    packagePath: val.packagePath,
                    parentClass: val.parentClass,
                    classCategory: val.classCategory,
                    classType: val.classType,
                    id: val.id,
                    label: val.displayName + " (" + val.className + ")",
                    value: index,
                    searchItem: val.className + "" + val.displayName
                  };
                  this.operationList.push(eachU);
                });

              }
            } else {
              this.$Spin.hide();
              const title = "提示";
              const content = "<p>服务器繁忙, 请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            }
          })
          .catch(e => {
            console.log(e);
            reject(e);
          });
      })

      // let promise3 = new Promise((resolve, reject) => {
      //   this.resourcesList = [];
      //   getAllResources()
      //   .then(response => {
      //     let res = response.data;
      //     resolve(res);
      //     if (!res.success) {
      //       const title = "提示";
      //       const content = "<p>服务器繁忙, 资源类列表获取失败请稍后再试～</p>";
      //       this.$Modal.warning({
      //         title: title,
      //         content: content
      //       });
      //     } else {
      //       res.data.forEach((val, index, val_arr) => {
      //         let eachItem = {
      //           value: val.className + "&r",
      //           label: val.displayName
      //         };
      //         this.resourcesList.push(eachItem);
      //       });
      //     }
      //   })
      //   .catch(e => {
      //     console.log(e);
      //     reject(e);
      //   });
      // })

      let promise4 = new Promise((resolve, reject) => {
        this.entitiesList = [];
        getAllEntities()
        .then(response => {
          let res = response.data;
          resolve(res);
          if (!res.success) {
            const title = "提示";
            const content = "<p>服务器繁忙, 资源类列表获取失败请稍后再试～</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          } else {
            res.data.forEach((val, index, val_arr) => {
              let eachItem = {
                value: val.className + "&e",
                label: val.displayName
              };
              this.entitiesList.push(eachItem);
            });
          }
        })
        .catch(e => {
          console.log(e);
          reject(e);
        });
      })

      let promiseRelation = new Promise((resolve, reject) => {
        this.relationsList = [];
        getAllRelations()
        .then(response => {
            let res = response.data;
            resolve(res);
            console.log(res);
            if (!res.success) {
            const title = "提示";
            const content = "<p>服务器繁忙, 关联类列表获取失败请稍后再试～</p>";
            this.$Modal.warning({
                title: title,
                content: content
            });
            } else {
            res.data.forEach((val, index, val_arr) => {
                let eachItem = {
                value: val.className + "&re",
                label: val.displayName
                };
                this.relationsList.push(eachItem);
            });
            }
        })
        .catch(e => {
            console.log(e);
            reject(e);
        });
    })

      let promise5 = new Promise((resolve, reject) => {
        this.nonePlug = true;
        this.plugList = [];

        if(opr_entries.length != undefined && opr_entries.length == 0) {
          this.nonePlug = true;
          this.createBindForm.radio = "后端脚本";
          this.createBindForm.content = "serverScript:";

          this.editQuickForm.radio = "后端脚本";
          this.editQuickForm.content = "serverScript:";
        } else {
          opr_entries.forEach(x => {
            this.nonePlug = false;
            this.plugList.push({
              value: x.name,
              label: `${x.name}(${x.note})`
            });
          });
        }

        if (!this.nonePlug) {
          this.editQuickForm.radio = "后端脚本";
          this.editQuickForm.content = "serverScript:";
        }
        // this.plugList = [];
        // getPlugList()
        // .then(response => {
        //   let res = response.data;
        //   resolve(res);
        //   if (!res.success) {
        //     // 系统插件获取失败 禁止选择插件入口方式
        //     this.nonePlug = true;

        //     this.createBindForm.radio = "后端脚本";
        //     this.createBindForm.content = "serverScript:";

        //     this.editQuickForm.radio = "后端脚本";
        //     this.editQuickForm.content = "serverScript:";
        //   } else {
        //     if (res.data.length == 0) {
        //       // 系统插件数量为零 禁止选择插件入口方式
        //       this.nonePlug = true;
        //       this.createBindForm.radio = "后端脚本";
        //       this.createBindForm.content = "serverScript:";

        //       this.editQuickForm.radio = "后端脚本";
        //       this.editQuickForm.content = "serverScript:";
        //     } else {
        //       this.plugData = res.data;
        //       res.data.forEach((val, index) => {
        //         let eachPlug = {
        //           value: index,
        //           label: val.name
        //         };
        //         this.plugList.push(eachPlug);
        //       });
        //     }
        //   }
        // })
        // .catch(e => {
        //   console.log(e);
        //   reject(e);
        // });
      })
    },

    // 模块及操作数据获取
    getModuleAndOpe() {
      this.moduleData = [];
      let temModule = [];

      let _self = this;

      // 获取模块
      getModules()
        .then(response => {
          let res = response.data;
          let _self = this;
          if (!res.success) {
            _self.$Spin.hide();
            const title = "提示";
            const content = "<p>服务器繁忙, 模块获取失败请稍后再试～</p>";
            _self.$Modal.warning({
              title: title,
              content: content
            });
          } else {
            if (res.data.length == 0) {
              this.$Spin.hide();
              this.moduleData = [];
              this.hasData = false;
            } else {

              let moduleData = res.data;
              for (let i in moduleData) {

                moduleData[i].children = [];
                moduleData[i].isSystem = "--";
                moduleData[i].showCheck = false;
                moduleData[i].isModel = true;
                moduleData[i].showSelect = false;

              }
              temModule = moduleData;

            }
          }
        }).then(() => {

          let modulePromise = [];
          for (let i in temModule) {
            modulePromise.push(getModuleOperations(temModule[i].className).then(response => {
              let res = response.data;

              // 系统操作
              for (let x in res.data.metaOperationBOs) {
                let val = res.data.metaOperationBOs[x];
                if(val.className != 'CreateQueryOperation' && val.className != 'RefreshModule' && val.className != 'LoadQueryOperation') {

                    val.showCheck = false;
                    val.showSelect = true;
                    val.belongModule = temModule[i].className;
                    val.isSystem = "系统操作";
                    val.isModel = false;

                    temModule[i].children.push(val);
                }
              }

              // 快速查询操作
              for (let y in res.data.queryOprConfigs) {
                let val = res.data.queryOprConfigs[y];
                // action为folder的快速查询操作 需要有选择框 允许绑定快速查询操作
                let isFolder = val.action == 'folder' ? false : true;
                let eachQuery = null;

                if(!isFolder) {

                  let folderChildren = this.getFolderChildren(val.children);
                  val.id = val.oid;
                  val.className = val.authority;
                  val.showCheck = false;
                  val.showSelect = isFolder;
                  val.isModel = false;
                  val.belongModule = temModule[i].className;
                  val.isSystem = "快速查询操作";
                  val.children = folderChildren;

                } else {
                  val.id = val.oid;
                  val.className = val.authority;
                  val.showCheck = false;
                  val.showSelect = isFolder;
                  val.isModel = false;
                  val.belongModule = temModule[i].className;
                  val.isSystem = "快速查询操作";
                }

                temModule[i].children.push(val);
              }

            }))
          }

          Promise.all(modulePromise).then(() => {
            _self.moduleData = temModule;
            _self.$Spin.hide();

            if(_self.isInitPromise) {
              _self.initPromise();
            }
          });

        })
        .catch(e => {
          console.log(e);
          this.$Spin.hide();
        });
    },

    // 遍历folder动作的快速查询操作
    getFolderChildren(tree = []) {
      let arr = [];
      let _self = this;
      if (!!tree && tree.length !== 0) {
        tree.forEach(item => {
          let isFolder = item.action == 'folder' ? false : true;

          let obj = {
            id: item.oid,
            className: item.authority,
            displayName: item.displayName,
            showCheck: false,
            conType: item.conType,
            viewTitle: item.viewTitle,
            conditionExpre: item.conditionExpre,
            belongModule: item.moduleName,
            isModel: false,
            showSelect: isFolder,
            icon: item.icon,
            order: item.order,
            action: item.action,
            viewName: item.viewName,
            targetClass: item.targetClass,
            moduleName: item.moduleName,
            isSystem: "快速查询操作",
            children: _self.getFolderChildren(item.children)
          };
          arr.push(obj);
        });
      }
      return arr;
    },

    // 显示绑定操作弹窗
    bindSystem() {
      if (this.bindParams.bindID == "") {
        // 未选择模块 弹窗提示
        const title = "提示";
        const content = "<p>请先选择需要绑定的模块～</p>";
        this.$Modal.warning({
          title: title,
          content: content
        });
      } else {
        this.bindModal = true;
        this.bindForm.opeList = [];
        this.bindForm.icon = this.iconList[0].value;
      }
    },

    // 绑定操作
    confirmBind() {
      let bindOname = [];
      this.bindForm.opeList.forEach((val, index) => {
        let eachOname = this.operationList[val].className;
        bindOname.push(eachOname);
      });
      let bindObj = {
        classNames: [this.bindParams.bindClassName],
        icon: this.bindForm.icon,
        operationNames: bindOname,
        viewNames: ["*"]
      };

      if (this.bindForm.opeList.length == 0) {
        this.$Message.warning("请先选择需要绑定的操作列表");
      } else {
        bindOperations(bindObj)
          .then(res => {
            if (!res) {
              this.$Spin.hide();
              this.$Message.warning("服务器异常绑定失败, 请稍后再试～");
            } else {
              this.$Message.success("操作绑定成功～");
              this.bindForm.opeList = [];
              this.$Spin.show();

              this.isInitPromise = false;
              this.getModuleAndOpe();
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
        // let cacheData = this.$store.state.operationData;    // 拿到当前用户选择所需操作索引 去vuex匹配
        // // this.bindForm.opeList.forEach((val,index,val_arr)=>{
        // //     bindObj.classCategory = cacheData[val[0]].classCategory;
        // //     bindObj.className = cacheData[val[0]].className;
        // //     bindObj.classType = cacheData[val[0]].classType;
        // //     bindObj.displayName = cacheData[val[0]].displayName;
        // //     bindObj.id = cacheData[val[0]].id;
        // //     bindObj.packagePath = cacheData[val[0]].packagePath;
        // //     bindObj.parentClass = cacheData[val[0]].parentClass;
        // // })
        // let chooseIndex = this.bindForm.opeList[0];
        // bindObj.classCategory = cacheData[chooseIndex].classCategory;
        // bindObj.className = cacheData[chooseIndex].className;
        // bindObj.classType = cacheData[chooseIndex].classType;
        // bindObj.displayName = cacheData[chooseIndex].displayName;
        // bindObj.id = cacheData[chooseIndex].id;
        // bindObj.packagePath = cacheData[chooseIndex].packagePath;
        // bindObj.parentClass = cacheData[chooseIndex].parentClass;
      }

      // bindOperation(bindObj).then(res => {
      //     if(!res) {
      //         this.$Message.warning('服务器异常绑定失败, 请稍后再试～');
      //     } else {
      //         this.$Message.success('操作绑定成功～');
      //         this.bindForm.opeList = [];
      //     }
      // }).catch((e) => {
      //     console.log(e)
      // });
    },
    // 显示创建并绑定弹窗
    createBindSystem() {
      if (this.bindParams.bindID == "") {
        // 未选择模块 弹窗提示
        const title = "提示";
        const content = "<p>请先选择需要绑定的模块～</p>";
        this.$Modal.warning({
          title: title,
          content: content
        });
      } else {
        this.bindModal = false;
        this.createBindModal = true;
        this.createBindForm.icon = this.iconList[0].value;
      }
    },

    // 快速查询操作英文名查重
    checkCname(fname) {
      if (this.$refs[fname].model.ename != "") {
        checkCnameEvent(this.$refs[fname].model.ename)
          .then(response => {
            let res = response.data;
            if (res.success && res.data != undefined) {
              this.cnameExist = true;
            } else {
              this.cnameExist = false;
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
      }
    },

    // 脚本实现方式  系统操作
    chooseWay(value) {
      if (value == "后端脚本") {
        this.createBindForm.content = "serverScript:";
      } else if (value == "存储过程") {
        this.createBindForm.content = "procedure:";
      } else if (value == "前端脚本") {
        this.createBindForm.content = "clientScript:";
      } else {
        this.createBindForm.content = "";
      }
    },

    // 脚本实现方式  快速查询操作操作
    chooseWayQucik(value) {
      if (value == "后端脚本") {
        this.editQuickForm.content = "serverScript:";
      } else if (value == "存储过程") {
        this.editQuickForm.content = "procedure:";
      } else if (value == "前端脚本") {
        this.editQuickForm.content = "clientScript:";
      } else {
        this.editQuickForm.content = "";
      }
    },

    // 创建并绑定
    confirmCreateBind(name) {
      this.$refs[name].validate(valid => {
        let finalContent = "";
        if (valid && !this.cnameExist) {
          // 先创建
          if (this.nonePlug) {
            finalContent = this.createBindForm.content;
          } else {
            finalContent = this.createBindForm.plugPath;
          }
          let newOperationParams = [
            {
              classCategory: "OperationClass",
              className: this.createBindForm.ename,
              classType: "PersistentClass",
              displayName: this.createBindForm.cname,
              id: "",
              isSystem: false,
              packagePath: finalContent,
              parentClass: "Operation",
              state: 0,
              zoneName: "CUS"
            }
          ];
          addNewOperation(newOperationParams).then(res => {
              if (!res.success) {
                this.$Spin.hide();
                this.$Message.error("服务器异常, 请稍后再试");
              } else {
                // 再绑定
                // let bindObj = {
                //   bindClassName: this.bindParams.bindClassName,
                //   bindID: this.bindParams.bindID,
                //   classCategory: "OperationClass",
                //   className: this.createBindForm.ename,
                //   classType: "PersistentClass",
                //   displayName: this.createBindForm.cname,
                //   extend: "",
                //   icon: "",
                //   id: "",
                //   inherited: false,
                //   isSystem: false,
                //   note: "此操作是在关联编辑页上删除关联",
                //   packagePath: finalContent,
                //   parameter: "",
                //   parentClass: "",
                //   path: "",
                //   relName: "",
                //   state: 0,
                //   viewName: "*",
                //   zoneName: "CUS"
                // };

                // bindOperation(bindObj)
                //   .then(res => {
                //     if (!res) {
                //       this.$Message.warning("服务器异常绑定失败, 请稍后再试～");
                //     } else {
                //       this.$Message.success("操作创建并绑定成功～");
                //       // 刷新数据
                //       this.getModuleAndOpe();
                //     }
                //   })
                //   .catch(e => {
                //     console.log(e);
                //   });
                let bindObj = {
                  classNames: [this.bindParams.bindClassName],
                  icon: this.createBindForm.icon,
                  operationNames: [this.createBindForm.ename],
                  viewNames: ["*"]
                };

                bindOperations(bindObj).then(res => {
                  if (!res.success) {
                    this.$Spin.hide();
                    this.$Message.warning("服务器异常绑定失败, 请稍后再试～");
                  } else {
                    this.$Message.success("操作绑定成功～");
                    this.bindForm.opeList = [];
                    this.$Spin.show();

                    this.isInitPromise = false;
                    this.getModuleAndOpe();
                  }
                })
                .catch(e => {
                  console.log(e);
                  this.$Spin.hide();
                });
              }
            })
            .catch(e => {
              console.log(e);
              this.$Spin.hide();
            });
        } else {
          const _self = this;
          this.$Message.error({
            content: "操作信息格式有误",
            onClose: function() {
              _self.addOperationModal = true;
            }
          });
        }
      });
    },
    // 创建快速查询操纵
    createBindQuick() {
      if (this.bindParams.bindID == "") {
        // 未选择模块 弹窗提示
        const title = "提示";
        const content = "<p>请先选择需要绑定快速查询操作的模块～</p>";
        this.$Modal.warning({
          title: title,
          content: content
        });
      } else {
        this.bindModal = false;
        this.createBindModal = false;
        // this.$refs["editQuickForm"].resetFields();
        // this.editQuickForm.action = "create";
        // this.editQuickForm.icon = "";
        // this.editQuickForm.radio = "前端脚本";
        // this.editQuickForm.content = "clientScript:";
        this.editQuickForm.moduleName = this.bindParams.bindClassName;
        this.editOperation = true;
        this.editQuickForm.icon = this.iconList[0].value;
        this.editFlag = 3;
        this.disEname = false;
        this.cnameExist = false;
        this.dnameExist = false;
      }
    },
    cancel() {
      // 重置数据
      this.bindForm.opeList = [];
      // this.bindParams.bindID = '';
      // this.bindParams.bindClassName = '';
    },

    chooseIcon(value) {
      this.editQuickForm.icon = value;
      this.bindForm.icon = value;
      this.createBindForm.icon = value;
    },

    chooseModuleIcon(value) {
      this.editModel.icon = value;
    },

    // 视图 & 目标对象联动
    changeView(value) {
      if (value === undefined || value === '') return;
      this.loadingObj = true;
      // 视图数据获取
      let eachClass = value.split("&")[0];
      let whichClass = value.split("&")[1];
      if(eachClass != '') {
        getViews(eachClass, {needV3Content: false})
          .then(response => {
            let viewList = [];
            let res = response.data;
            if (!res.success) {
              this.$Spin.hide();
            } else {
              if (res.data.length == 0) {
                let eachItem = {
                  value: "*",
                  label: "*"
                };
                viewList.push(eachItem);
                this.editQuickForm.viewName = "*";
              } else {
                res.data.forEach((val, index, val_arr) => {
                  let eachVname = val.viewName;
                  let eachItem = {
                    value: eachVname,
                    label: eachVname
                  };
                  viewList.push(eachItem);
                });
                // this.editQuickForm.viewName = this.viewList[0].value;
              }
            }
            this.viewList = viewList;
            console.log("update:", this.viewList);
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
      }

      // 获取当前类需要展示对象得表格表头显示名  (这完美的api简直了)    ****------------目前不使用
      // getObjName(eachClass)
      //   .then(response => {
      //     this.columns3 = [];
      //     let res = response.data;
      //     if (!res.success) {
      //       const title = "提示";
      //       const content =
      //         "<p>服务器繁忙, 目标对象表格头内容获取失败请稍后再试～</p>";
      //       this.$Modal.warning({
      //         title: title,
      //         content: content
      //       });
      //     } else {
      //       res.data.forEach((val, index) => {
      //         let eachTh = {
      //           title: val.displayName,
      //           key: val.attributeName
      //         };
      //         this.columns3.push(eachTh);
      //       });
      //     }
      //   })
      //   .catch(e => {
      //     console.log(e);
      //     this.$Spin.hide();
      //     this.$router.push({ name: "error_500" });
      //   });

      // 目标对象获取
      // if (whichClass == "e") {
      //   getEobj(eachClass)
      //     .then(response => {
      //       this.loadingObj = false;
      //       let res = response.data;
      //       if (!res.success) {
      //         const title = "提示";
      //         const content = "<p>服务器繁忙, 目标对象获取失败请稍后再试～</p>";
      //         this.$Modal.warning({
      //           title: title,
      //           content: content
      //         });
      //       } else {
      //         this.data1 = res.data;
      //       }
      //     })
      //     .catch(e => {
      //       console.log(e);
      //       this.$Spin.hide();
      //       this.$router.push({ name: "error_500" });
      //     });
      // } else {
      //   getRobj(eachClass)
      //     .then(response => {
      //       this.loadingObj = false;
      //       let res = response.data;
      //       if (!res.success) {
      //         const title = "提示";
      //         const content = "<p>服务器繁忙, 目标对象获取失败请稍后再试～</p>";
      //         this.$Modal.warning({
      //           title: title,
      //           content: content
      //         });
      //       } else {
      //         this.data1 = res.data;
      //       }
      //     })
      //     .catch(e => {
      //       console.log(e);
      //       this.$Spin.hide();
      //       this.$router.push({ name: "error_500" });
      //     });
      // }
      //****------------------------------------------------------------目前不使用

    },
    // chooseGoalObj(cur, old) {
    //   this.editQuickForm.goalObj = cur.oid;
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

    // 行内Event
    rowClick(data, index, text) {
      let result = this.makeData(data);
      console.log(result);
      if (text == "编辑") {
        this.editOperation = true;
        if(result.isModel) {
          this.editFlag = 2;
          this.fixModel = result;
          this.editModel.cname = result.displayName;
          this.editModel.ename = result.className;
          this.editModel.icon = result.packagePath;
          this.editModel.targetNumber = result.state;
        } else {
          if (result.isSystem == "系统操作") {
            this.editFlag = 0;
            this.editForm.cname = result.displayName;
            this.editForm.ename = result.className;
            this.editForm.path = result.packagePath;
            this.editForm.parentClass = result.parentClass;
            this.editForm.zoneName = result.zoneName;
            this.editForm.id = result.id;
            this.editForm.classCategory = result.classCategory;
          } else {
            this.editFlag = 1;
            this.disEname = true;
            this.editQuickForm.ename = result.className;
            this.editQuickForm.cname = result.displayName;
            this.editQuickForm.moduleName = result.moduleName;
            this.editQuickForm.icon = result.icon;
            this.editQuickForm.goal = result.targetClass;
            this.editQuickForm.action = result.action == 'list' ? 'visit' : result.action;
            this.editQuickForm.oid = result.id;
            this.editQuickForm.targetNumber = result.order;
            this.editQuickForm.style = result.conType;
            this.editQuickForm.viewTitle = result.viewTitle;
            this.editQuickForm.viewName = result.viewName;
            this.editQuickForm.queryCont = result.conditionExpre;

            if(result.conditionExpre.indexOf('addin:') != -1) {
              this.editQuickForm.radio = '插件调用';
            } else if(result.conditionExpre.indexOf('serverScript:') != -1) {
              this.editQuickForm.radio = '后端脚本';
            } else if(result.conditionExpre.indexOf('clientScript:') != -1) {
              this.editQuickForm.radio = '前端脚本';
            } else if(result.conditionExpre.indexOf('procedure:') != -1) {
              this.editQuickForm.radio = '存储过程';
            } else {
              this.editQuickForm.radio = '插件别名';
            }

            this.editQuickForm.content = result.conditionExpre || '';
            this.editQuickForm.plugPath = result.conditionExpre.substring(5, result.conditionExpre.length) || '';

            let finalEclass = result.targetClass + "&e";
            let finalREclass = result.targetClass + "&re";

            let isEtype = this.entitiesList.findIndex((el, index, arr) => {
              return el.value == finalEclass;
            })
            let isREtype = this.relationsList.findIndex((el, index, arr) => {
              return el.value == finalREclass;
            })

            if(isEtype != -1) {
              this.editQuickForm.goal = result.targetClass  + "&e";
            } else if(isREtype != -1) {
              this.editQuickForm.goal = result.targetClass + "&re";
            }

            this.editQuickForm.linkUrl = result.conditionExpre;
            this.editQuickForm.params = result.params;
            this.editQuickForm.opePath = result.conditionExpre;
          }
        }
      } else {
        this.delOpe = true;
        this.needDelModule = result.belongModule;
        if(result.isModel) {
          this.needDelType = 2;
          this.needDelId = result.className;
        } else {
            if (result.isSystem == "系统操作") {
            this.needDelType = 0;
            this.needDelId = result.className;
            this.needDelVname = result.viewName;
          } else {
            this.needDelType = 1;
            this.needDelId = result.id;
          }
        }
      }
    },

    // 双击表格行事件
    dbRowClick(data, index) {
    },

    cancelEdit() {
      this.$refs['editQuickForm'].resetFields();

      this.editQuickForm.goal = '';
      this.editQuickForm.viewName = '';
    },

    // 确认删除
    okDel() {
      let _self = this;
      let lastNumber = this.moduleData.length;
      if (this.needDelType == 0) {
        // 删除系统操作
        unbindOperation(this.needDelModule, this.needDelVname, this.needDelId)
          .then(res => {
            if (!res.success) {
              this.$Spin.hide();
              this.$Message.warning({
                content: "服务器繁忙, 删除失败请稍后再试",
                duration: 3
              });
            } else {
              if(lastNumber == 1) {
                this.hasData = false;
              }
              this.$Message.info({
                content: "删除成功",
                duration: 1.5,
                onClose: function() {
                  this.$Spin.show();

                  _self.isInitPromise = false;
                  _self.getModuleAndOpe();
                }
              });
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
      } else if (this.needDelType == 1){
        delQuickOpe(this.needDelId).then(res => {
            if (!res.success) {
              this.$Spin.hide();
              this.$Message.warning({
                content: "服务器繁忙, 删除失败请稍后再试",
                duration: 3
              });
            } else {
              this.$Spin.show();

              this.isInitPromise = false;
              this.getModuleAndOpe();
              this.$Message.info({
                content: "删除成功",
                duration: 3
              });
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
      } else {
        delModule(this.needDelId).then(res => {
          if (!res.success) {
              this.$Spin.hide();
              this.$Message.warning({
                content: "服务器繁忙, 删除失败请稍后再试",
                duration: 3
              });
            } else {
              this.$Spin.show();

              this.isInitPromise = false;
              this.getModuleAndOpe();
              this.$Message.info({
                content: "删除成功",
                duration: 3
              });
          }
        }).catch(e => {
          console.log(e);
          this.$Spin.hide();
        });
      }
    },

    // 确认修改
    confirmFix() {
      if (this.editFlag == 0) {
        this.$refs['editForm'].validate(valid => {
          if (!valid) {
            let _self = this;
            this.$Message.warning({
              content: '格式有误, 绑定失败',
              duration: 2,
              onClose: function() {
                _self.editOperation = true;
              }
            });
          } else {
            // 修改系统操作
            let fixOperationParams = {
              classCategory: this.editForm.classCategory,
              className: this.editForm.ename.split(' ').join(''),
              classType: "PersistentClass",
              displayName: this.editForm.cname.split(' ').join(''),
              id: this.editForm.id,
              isSystem: false,
              packagePath: this.editForm.path,
              parentClass: this.editForm.parentClass,
              state: 0,
              zoneName: this.editForm.zoneName
            };
            fixSystemOpe(fixOperationParams)
              .then(res => {
                if (!res.success) {
                  this.$Spin.hide();
                  this.$Message.warning({
                    content: "服务器繁忙, 修改失败请稍后再试",
                    duration: 3
                  });
                } else {
                  this.$Spin.show();

                  this.isInitPromise = false;
                  this.getModuleAndOpe();
                  this.$Message.info({
                    content: "修改成功",
                    duration: 3
                  });
                }
              })
              .catch(e => {
                console.log(e);
                this.$Spin.hide();
              });
          }
        })
      } else if(this.editFlag == 1){
        this.$refs['editQuickForm'].validate(valid => {
          if (!valid) {
            let _self = this;
            this.$Message.warning({
              content: '格式有误, 绑定失败',
              duration: 2,
              onClose: function() {
                _self.editOperation = true;
              }
            });
          } else {
            // 修改快速查询操作
            let finalExpre = null;
            if(this.editQuickForm.action == 'url') {
              finalExpre = this.editQuickForm.linkUrl;
            } else if(this.editQuickForm.action == 'implement') {
              if (this.editQuickForm.radio != "插件调用") {
                finalExpre = this.editQuickForm.content;
              } else {
                finalExpre = "addin:" + this.editQuickForm.plugPath;
              }
            } else {
              finalExpre = this.editQuickForm.queryCont;
            }
            let fixQuickParams = {
              action: this.editQuickForm.action,
              authority: this.editQuickForm.ename.split(' ').join(''),
              conType: this.editQuickForm.style,
              conditionExpre: finalExpre,
              displayName: this.editQuickForm.cname.split(' ').join(''),
              icon: this.editQuickForm.icon,
              moduleName: this.editQuickForm.moduleName,
              oid: this.editQuickForm.oid,
              order: this.editQuickForm.targetNumber,
              params: this.editQuickForm.params,
              targetClass: this.editQuickForm.goal.split("&")[0] || '',
              viewName: this.editQuickForm.viewName,
              viewTitle: this.editQuickForm.viewTitle,
              viewType: ""
            };

            fixQuickOpe(fixQuickParams).then(res => {
                if (!res.success) {
                  this.$Spin.hide();
                  this.$Message.warning({
                    content: res.message,
                    duration: 3
                  });
                } else {
                  this.$Spin.show();

                  this.isInitPromise = false;
                  this.getModuleAndOpe();

                  // 数据重置
                  this.$refs['editQuickForm'].resetFields();
                  this.editQuickForm.action = "create";
                  this.editQuickForm.icon = "";
                  this.editQuickForm.radio = "前端脚本";
                  this.editQuickForm.content = "clientScript:";

                  this.$Message.info({
                    content: "修改成功",
                    duration: 3
                  });
                }
              }).catch(e => {
                console.log(e);
                this.$Spin.hide();
              });
          }
        })
      } else if(this.editFlag == 3){
        this.$refs['editQuickForm'].validate((valid) => {
          if (!valid || this.cnameExist) {
            let _self = this;
            this.$Message.warning({
              content: '格式有误, 绑定失败',
              duration: 2,
              onClose: function() {
                _self.editOperation = true;
              }
            });
          } else {
            if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'edit' || this.editQuickForm.action == 'visit' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'list') {
              if(this.editQuickForm.goal == '') {
                this.errorRexp("请选择目标类");
              } else if(this.editQuickForm.viewName == '') {
                this.errorRexp("请选择表单名称");
              } else { this.commonFixQope(); }
            }  else if (this.editQuickForm.action == 'url') {
              if(this.editQuickForm.linkUrl == '') {
                this.errorRexp("请填写合法url地址");
              } else {
                this.commonFixQope();
              }
            } else {
              this.commonFixQope();
            }
          }
        })
      } else {
        if(this.editModel.cname != "") {
          let fixModelParams = {
            id: this.fixModel.id,
            className: this.fixModel.className,
            displayName: this.editModel.cname.split(' ').join(''),
            classType: "DynamicClass",
            classCategory: "ModuleClass",
            parentClass: "Module",
            isSystem: false,
            state: this.editModel.targetNumber,
            packagePath: this.editModel.icon,
            zoneName: "CUS"
          };

          fixModule(fixModelParams).then(res => {
            if (!res.success) {
              this.$Spin.hide();
              this.$Message.warning({
                content: res.message,
                duration: 3
              });
            } else {
              this.$Spin.show();

              this.isInitPromise = false;
              this.getModuleAndOpe();
              this.$Message.info({
                content: "修改成功",
                duration: 3
              });
            }
          }).catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
        }
      }
    },

    // common不合法信息弹窗
    errorRexp(mes) {
      let _self = this;
      this.$Message.warning({
        content: mes,
        duration: 2,
        onClose: function() {
          _self.editOperation = true;
        }
      });
    },

    // 公共更新快速查询操作
    commonFixQope() {
      let finalExpre = null;
      if(this.editQuickForm.action == 'url') {
        finalExpre = this.editQuickForm.linkUrl;
      } else if(this.editQuickForm.action == 'implement') {
        if (this.editQuickForm.radio != "插件调用") {
          finalExpre = this.editQuickForm.content;
        } else {
          finalExpre = "addin:" + this.editQuickForm.plugPath;
        }
      } else {
        finalExpre = this.editQuickForm.queryCont;
      }

      let fixQuickParams = {
        action: this.editQuickForm.action,
        authority: this.editQuickForm.ename,
        conType: this.editQuickForm.style,
        conditionExpre: finalExpre,
        displayName: this.editQuickForm.cname,
        icon: this.editQuickForm.icon,
        moduleName: this.editQuickForm.moduleName,
        order: this.editQuickForm.targetNumber,
        params: this.editQuickForm.params,
        targetClass: this.editQuickForm.goal.split("&")[0] || '',
        viewName: this.editQuickForm.viewName,
        viewTitle: this.editQuickForm.viewTitle
      };

      createQuickOpe(fixQuickParams)
        .then(res => {
          if (!res.success) {
            const _self = this;
            this.$Spin.hide();
            this.$Message.warning({
              content: res.message,
              duration: 3,
              onClose: function() {
                _self.editOperation = true;
                if(res.code == 400) {
                  _self.dnameExist = true;
                }
              }
            });
          } else {
            this.$Spin.show();

            this.isInitPromise = false;
            this.getModuleAndOpe();
            this.$Message.info({
              content: "绑定成功",
              duration: 3
            });

            // 绑定成功 数据重置
            this.$refs['editQuickForm'].resetFields();
            this.editQuickForm.action = "create";
            this.editQuickForm.icon = "";
            this.editQuickForm.radio = "前端脚本";
            this.editQuickForm.content = "clientScript:";
          }
        })
        .catch(e => {
          console.log(e);
          this.$Spin.hide();
        });
    },

    // 新增模块
    createModule() {
      this.newMoadl = true;
    },
    confirmNew(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let newModalParams = [
            {
              classCategory: "ModuleClass",
              className: this.newModalForm.ename,
              classType: "DynamicClass",
              displayName: this.newModalForm.cname,
              id: "",
              isSystem: false,
              packagePath: this.newModalForm.icon,
              parentClass: "Module",
              state: this.newModalForm.targetNumber || 0,
              zoneName: "CUS"
            }
          ];

          addNewOperation(newModalParams)
            .then(res => {
              if (!res.success) {
                this.$Spin.hide();
                const title = "提示";
                this.$Modal.warning({
                  title: title,
                  content: res.message
                });
              } else {
                if(this.moduleData.length == 0) {
                  this.hasData = true;
                }
                this.$Message.success('新增成功');
                this.$Spin.show();

                this.isInitPromise = false;
                this.getModuleAndOpe();

                this.$refs[name].resetFields();
              }
            })
            .catch(e => {
              console.log(e);
              this.$Spin.hide();
              this.$Message.error('新增失败, 服务繁忙请稍后再试');
            });
        } else {
          return;
        }
      });
    },
    selectionClick(arr) {

      if (arr.length > 1 && typeof arr[arr.length - 1] == "string") {
        let isFolder = arr[arr.length - 1].split("&")[1].split("#")[1];

        // folder近允许绑定快速查询操作
        if(isFolder == 'false') {
          this.folderFobbiden = true;
        } else {
          this.folderFobbiden = false;
        }

        this.bindParams.bindClassName = arr[arr.length - 1].split("&")[1].split("#")[0];
        this.bindParams.bindID = arr[arr.length - 1].split("&")[0];
      } else {
        this.folderFobbiden = false;
        this.bindParams.bindClassName = '';
        this.bindParams.bindID = '';
      }
    },
    cancelBindSysOpe() {
      this.bindForm.opeList = [];
      this.cnameExist = false;
    },

    // 一键跳转到编辑表单
    toEditForm() {
      this.editOperation = false;

      const className = this.editQuickForm.goal.split("&")[0];
      const viewName = this.editQuickForm.viewName;

      var route = this.$store.state.app.newRoutes.filter(item => item.children
          && item.children.length > 0 && item.children[0].meta
          && item.children[0].meta.className == className
          && item.children[0].meta.formName == viewName);
          if (route.length > 0) {
            this.root.turnToPage(route[0].children[0].name);
            return;
          }
          route = {
            path: "/form-engine",
            name: "form-engine",
            meta: {
              icon: "md-help-buoy",
              title: "表单模型"
            },
            component: () => import("@/views/main/Main.vue"),
            children: [
              {
                path: `form-edit-${className}-${viewName}`,
                name: `form-edit-${className}-${viewName}`,
                meta: {
                  className: className,
                  formName: viewName,
                  title: `修改表单-${className}-${viewName}`,
                  path: 'form-engine/form-create.vue'
                },
              }
            ]
          }
          this.addRoute(route);
          this.router.options.routes.push(route);
          this.router.addRoutes([route]);
          this.root.turnToPage(`form-edit-${className}-${viewName}`);

    },

    // 显示最大化编辑器窗口
    changeBigSize(formName) {
      this.bigScriptForm = formName;

      if(formName == 'createBindForm') {

        this.createBindModal = false;
        this.commonScript = this.createBindForm.content;

      } else {

        this.editOperation = false;
        if(this.editQuickForm.action == 'implement') {
          this.commonScript = this.editQuickForm.content;
        } else {
          this.commonScript = this.editQuickForm.params;
        }

      }

      this.isFullScreen = true;
    },

    // 最大化脚本编辑确认
    confirmScript() {
      this.isFullScreen = false;
      if(this.bigScriptForm == 'createBindForm') {

        this.createBindForm.content = this.commonScript;
        this.createBindModal = true;

      } else {

        if(this.editQuickForm.action == 'implement') {
          this.editQuickForm.content = this.commonScript;
        } else {
          this.editQuickForm.params = this.commonScript;
        }

        this.editOperation = true;

      }
    },
    // 关闭最大化脚本编辑弹窗
    cancelScript() {
      this.isFullScreen = false;
      if(this.bigScriptForm == 'createBindForm') {

        this.createBindModal = true;

      } else {

        this.editOperation = true;

      }
      this.commonScript = '';
    }
  },
  created() {
    this.initData();
    this.$store = this.store;
  }
};
</script>
<style scoped>
  .editRedFlag {
    color: red;
    display: inline-block;
    height: 34px;
    line-height: 34px;
    width: 100%;
    text-align: right;
    position: relative;
    left: 100%;
  }
</style>

