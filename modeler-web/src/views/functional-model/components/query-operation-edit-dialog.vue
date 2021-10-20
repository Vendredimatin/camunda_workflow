<template>
  <div>
    <Drawer ref="drawer" v-model="idTreeVis" id="idTreeVis" title="脚本辅助信息" class-name="ivu-select-dropdown-width100"
            :width="400" :mask="false" :scrollable="true" :transfer="false" style="zIndex: 9999">

      <Tabs :value="!fromManagement ? 'name1' : 'name2'" name="idTreeVis">
        <TabPane v-if="!fromManagement" label="控件树" name="name1" tab="idTreeVis">
          <div style="width: 100%; overflow-x: auto; white-space: nowrap">
            <span style="font-weight: bold; maring-right: 10px;">控件代号:</span>{{ selectedId }}
          </div>
          <p style="font-weight: bold">控件树:</p>
          <div style="height: 100%; width: 100%; overflow-x: hidden; overflow-y: auto">
            <Tree id="idTree" class="plugin-tree" :data="idTree" :render="renderContent"></Tree>
          </div>
        </TabPane>
        <TabPane label="属性集" name="name2" tab="idTreeVis">
          <div style="width: 100%; overflow-x: auto; white-space: nowrap">
            <span style="font-weight: bold; maring-right: 10px;">属性英文名:</span>{{ chooseTargetAttr }}
          </div>
          <div style="min-height: 360px; height: auto;">
            <p style="font-weight: bold">属性集:</p>
            <Row style="line-height: 32px; margin-bottom: 15px;">
              <Col span="4">
                <p>选择类</p>
              </Col>
              <Col span="18">
                <Select id="drawSelect" v-model="chooseTargetClass" class="drawSelect" ref="chooseTargetClass"
                        filterable clearable @on-change="targetClassChange">
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
              </Col>
            </Row>

            <div>
              <RadioGroup v-model="chooseTargetAttr" style="width: 100%;">

                <Collapse v-if="rePanel" simple v-model="toolAttr">
                  <Panel v-for="group in groupAttrList" :key="group.groupName">
                    {{ group.groupName }}
                    <div slot="content" style="padding-bottom: 40px;">
                      <Tooltip
                        v-for="item in group.attrList"
                        :key="item.id"
                        :content="item.displayName || item.attributeName"
                        placement="buttom" style="width: 30%;margin: 5px; ">
                        <Radio
                          :key="item.id"
                          :label="`${group.groupType}${item.attributeName}`"
                          style="width: 100%; white-space: nowrap; text-overflow: ellipsis;overflow: hidden;"
                        >{{ item.displayName || item.attributeName }}
                        </Radio>
                      </Tooltip>
                    </div>
                  </Panel>
                </Collapse>

              </RadioGroup>
            </div>
          </div>
        </TabPane>
      </Tabs>

    </Drawer>
    <Modal
      v-model="editOperation"
      id="queryOprModal"
      ref="queryModal"
      :title="editOperationTitle"
      width="62%"
      :mask-closable="false"
      class-name="ivu-select-dropdown-width100"
      @on-cancel="cancel"
    >

      <!-- 快速查询操作 -->
      <Form ref="editQuickForm" :model="editQuickForm" :rules="ruleFixQuick" :label-width="120">
        <Card style="width:100%; margin-bottom: 15px;">
          <p slot="title">
            <Icon type="ios-information-circle"></Icon>
            基本属性
          </p>
          <Row>
            <Col span="12" v-show="mobileFlag">
              <FormItem label="英文名" prop="ename">
                <Input
                  v-if="!sysBindOpr"
                  id="globalAuthorityIndex"
                  v-model.trim="editQuickForm.ename" :disabled="disEname" @on-focus="cnameExist = false"
                  @on-blur="checkCname('editQuickForm')"></Input>
                <Input
                  v-else
                  id="globalAuthorityIndex"
                  v-model.trim="editQuickForm.ename" :disabled="true" @on-focus="cnameExist = false"
                  @on-blur="checkCname('editQuickForm')"></Input>
                <span v-show="cnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
              </FormItem>
            </Col>
            <Col span="12" v-show="!mobileFlag">
              <FormItem label="模块名" prop="moduleName">
                <Input v-model="editQuickForm.moduleName" disabled></Input>
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="显示名" prop="cname">
                <Input id="globalDisplayIndex" v-model.trim="editQuickForm.cname" @on-blur="checkDname('editQuickForm')"
                       @on-focus="dnameExist = false"></Input>
                <span v-show="dnameExist" style="font-size: 12px;color: red;">* 显示名重复，为便于区分建议修改!</span>
              </FormItem>
            </Col>
          </Row>
          <Row v-if="!sysBindOpr && mobileFlag">
            <Col span="12">
              <FormItem label="模块名" prop="moduleName">
                <Input id="globalModuleName" v-model="editQuickForm.moduleName" disabled></Input>
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="序号" prop="targetNumber" number>
                <Input id="globalIndexEdit" v-model="editQuickForm.targetNumber"></Input>
              </FormItem>
            </Col>
          </Row>
          <Row v-show="!mobileFlag">
            <Col span="12">
              <FormItem label="动作" prop="action">
                <Select v-model="editQuickForm.action" filterable :disabled="editQuickForm.action == 'global_implement' || customAction !== ''">
                  <Option v-for="item in actionList" :value="item.value" :key="item.value" :label="item.value">
                    <span>{{ item.value }}</span>
                    <span style="float:right;color:#ccc">{{ item.label }}</span>
                  </Option>
                </Select>
              </FormItem>
            </Col>
            <Col span="12" v-show="editQuickForm.action != 'global_implement'">
              <FormItem label="操作样式" prop="style">
                <Select v-model="editQuickForm.style" filterable>
                  <Option v-for="item in quickStyle" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12" v-show="!sysBindOpr && mobileFlag">
              <FormItem label="图标" prop="icon">
                <Select id="globalOprIcon" v-model="editQuickForm.icon" filterable clearable @on-change="chooseIcon">
                  <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                    <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                    <span style="float:right;color:#ccc">{{ item.label }}</span>
                  </Option>
                  <Option v-for="x in iList" :value="x.value" :key="x.value" :label="x.label">
                    <i class="iconfont" :class="x.value" style="font-size: 20px !important;"></i>
                    <span style="float:right;color:#ccc">{{ x.label }}</span>
                  </Option>
                </Select>
              </FormItem>
            </Col>
            <Col span="12" v-show="!mobileFlag">
              <FormItem label="图标" prop="icon">
                <RadioGroup v-model="editQuickForm.btmIconType" style="margin-bottom: 5px;">
                  <Radio label="系统图标"></Radio>
                  <Radio label="自定义图标"></Radio>
                </RadioGroup>
                <div v-show="editQuickForm.btmIconType == '系统图标'">
                  <Row>
                    <Select v-model="editQuickForm.icon" filterable @on-change="chooseIcon" style="margin-bottom: 6px;">
                      <Option v-for="item in vList" :value="item.value" :key="item.value" :label="item.label">
                        <!-- <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon> -->
                        <van-icon :name="item.value" size="20" />
                        <span style="float:right;color:#ccc">{{ item.label }}</span>
                      </Option>
                    </Select>
                  </Row>
                  <Row>
                    <span style="margin-right: 10px;font-size: 12px !important;">默认颜色:</span>
                    <ColorPicker v-model="editQuickForm.btmIconDefColor" size="small" style="margin-right: 10px;" />
                    <span style="margin-right: 10px;font-size: 12px !important;">选中颜色:</span>
                    <ColorPicker v-model="editQuickForm.btmIconActColor" size="small" />
                  </Row>
                </div>
                <div v-show="editQuickForm.btmIconType != '系统图标'">
                  <div style="display: inline-block;">
                    <img v-if="showdefImg" :src="editQuickForm.defImg" class="avatarImg">
                    <Upload
                        ref="upload"
                        :show-upload-list="false"
                        :format="['jpg','jpeg','png']"
                        :max-size="2048"
                        :before-upload="handleBeforeUpload"
                        action=""
                        type="drag"
                        style="display: inline-block;width:50px;margin-right: 30px;">
                        <div style="width: 50px;height:50px;line-height: 50px;">
                            <Icon type="md-add" size="20"></Icon>
                        </div>
                    </Upload>
                    <p>默认图片</p>
                  </div>
                  <div style="display: inline-block;">
                    <img v-if="showActImg" :src="editQuickForm.actImg" class="avatarImg">
                    <Upload
                        ref="upload"
                        :show-upload-list="false"
                        :format="['jpg','jpeg','png']"
                        :max-size="2048"
                        :before-upload="handleBeforeUploadAct"
                        action=""
                        type="drag"
                        style="display: inline-block;width:50px;">
                        <div style="width: 50px;height:50px;line-height: 50px;">
                            <Icon type="md-add" size="20"></Icon>
                        </div>
                    </Upload>
                    <p>选中图片</p>
                  </div>
                </div>
              </FormItem>
            </Col>
            <Col span="12" v-show="!sysBindOpr && mobileFlag && editQuickForm.action != 'global_implement'">
              <FormItem label="操作样式" prop="style">
                <Select id="globalOprStyle" v-model="editQuickForm.style" filterable>
                  <Option v-for="item in quickStyle" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row v-if="!sysBindOpr && mobileFlag">
            <Col span="12">
              <FormItem label="动作" prop="action">
                <Select id="globalOprAction" v-model="editQuickForm.action" filterable
                        :disabled="editQuickForm.action == 'global_implement' || customAction !== ''">
                  <Option v-for="item in actionList" :value="item.value" :key="item.value" :label="item.value">
                    <span>{{ item.value }}</span>
                    <span style="float:right;color:#ccc">{{ item.label }}</span>
                  </Option>
                </Select>
              </FormItem>
            </Col>
            <Col span="12"
                 v-show="(editQuickForm.action == 'create' || editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'next_create') && editQuickForm.style == 'tab'">
              <FormItem label="默认操作" prop="needDefaultOpr">
                <i-switch v-model="editQuickForm.needDefaultOpr"/>
              </FormItem>
            </Col>
            <Col span="12"
                 v-show="(editQuickForm.action == 'create' || editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'url'  || editQuickForm.action == 'next_create') && editQuickForm.style == 'dialog'">
              <FormItem label="默认操作" prop="needDialogDefaultOpr">
                <i-switch id="defaultAction" v-model="editQuickForm.needDialogDefaultOpr"/>
              </FormItem>
            </Col>
            <Col span="12" v-if="editQuickForm.action === 'implement' && editQuickForm.style === 'dialog'">
              <FormItem label="关闭方式" prop="autoClose">
                <Select id="closeStyle" v-model="editQuickForm.autoClose" filterable>
                  <Option v-for="item in autoCloseList" :value="item.value" :key="item.value" :label="item.value">
                    <span>{{ item.value }}</span>
                    <span style="float:right;color:#ccc">{{ item.label }}</span>
                  </Option>
                </Select>
              </FormItem>
            </Col>
            <!-- <Col span="12">
              <FormItem label="视图标题" prop="viewTitle">
                <Input v-model.trim="editQuickForm.viewTitle"></Input>
              </FormItem>
            </Col> -->
          </Row>
        </Card>

        <Card style="width:100%;  margin-bottom: 15px;" v-show="editQuickForm.action != 'folder'">
          <p slot="title">
            <Icon type="ios-film-outline"></Icon>
            动作
          </p>
          <!--非系统操作部分-->
          <div v-if="!sysBindOpr">
            <Row v-show="editQuickForm.action == 'implement' || editQuickForm.action == 'global_implement'">
              <FormItem label="实现方式">
                <RadioGroup v-model="editQuickForm.radio">
                  <Radio label="插件调用" :disabled="nonePlug" v-show="editQuickForm.action != 'global_implement'">插件调用
                  </Radio>
                  <Radio label="后端脚本">后端脚本</Radio>
                  <Radio label="前端脚本">前端脚本</Radio>
                  <Radio label="存储过程" v-show="editQuickForm.action != 'global_implement'">存储过程</Radio>
                  <Radio label="插件别名" v-show="editQuickForm.action != 'global_implement'">插件别名</Radio>
                </RadioGroup>
              </FormItem>
            </Row>
            <Row v-show="editQuickForm.action == 'implement' && editQuickForm.radio == '插件调用'">
              <FormItem label="脚本内容">
                <Select id="globalScriptSelect" v-model="editQuickForm.plugPath" filterable clearable>
                  <Option v-for="item in plugList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
            </Row>
            <Row v-show="editQuickForm.action == 'implement' && editQuickForm.radio == '插件别名'">
              <FormItem label="插件别名">
                <Input v-model="editQuickForm.content"/>
              </FormItem>
            </Row>
            <!--create/next_create/edit/visit start-->
            <Row v-show="(editQuickForm.action == 'create' || editQuickForm.action == 'next_create' || editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'creates' || editQuickForm.action == 'list')">
              <Col span="12">
                <FormItem label="目标类" prop="goal">
                  <Select id="globalGoalClassSelect" v-if="reloadGoal" ref="selectGoal" v-model="editQuickForm.goal"
                          filterable clearable @on-change="changeView">
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
                      <Select id="viewName" v-model="editQuickForm.viewName" filterable ref="viewNameSelect" v-if="reloadView">
                        <OptionGroup v-show="mobileFlag && mobileViewList.length > 0" label="PC端">
                          <Option v-for="item in pcViewList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </OptionGroup>
                        <OptionGroup v-show="mobileViewList.length > 0" label="移动端">
                          <Option v-for="item in mobileViewList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </OptionGroup>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col v-show="editQuickForm.viewName && editQuickForm.viewName != '*'" span="2"
                       offset="1">
                    <Poptip trigger="hover" title="提示" content="点击跳转到对应表单页面">
                      <Button id="clickJump" shape="circle" type="default" icon="md-arrow-round-forward"
                              @click="toEditForm"></Button>
                    </Poptip>
                  </Col>
                </Row>
              </Col>
              <Col span="24">
                <div class="implement-plugin-box implement-plugin-css">
                  <div class="implement-plugin">
                    <Tooltip content="新建后端脚本" placement="left" style="width: 100%;">
                    <Button id="addServer" shape="circle" type="default"
                            icon="ios-add" @click="addServerScript('CURD')"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="编辑区最大化" placement="left" style="width: 100%;">
                    <Button id="globalOprMagnify" shape="circle" type="default"
                            icon="ios-expand" @click="changeBigSize"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                      <Button id="globalScriptHelp" shape="circle" type="default" icon="md-help"
                              @click="openHelp"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="类属性集" placement="left" style="width: 100%">
                      <Button id="classProperty" shape="circle" type="default" icon="md-list"
                              @click="openIdTree"></Button>
                    </Tooltip>
                  </div>
                </div>
                <FormItem label="脚本内容">
                  <!--前端脚本复合体-->
                  <OperationImplementEditor
                    v-if="editQuickForm.style != 'dialog' && editQuickForm.style != 'tab' && editOperation"
                    ref="CURDActionImplementEditor"
                    v-model="editQuickForm.oprScript.appBefore.client.default.script"
                    :lang="editorLang"
                    :field="'appBefore'"
                    :oprScript="editQuickForm.oprScript"
                    @handleCreateServer="handleCreateServer"
                    @handleEditServer="handleEditServer"
                    @editServerImplement="editServerImplement"
                    @deleteServerImplement="deleteServerImplement"
                    @confirmServerImplement="confirmServerImplement"
                    @serverImplementEditorChange="serverImplementEditorChange"
                    @serverImplementChange="serverImplementChange"
                  >

                  </OperationImplementEditor>
                  <!--前端脚本复合体end-->
                  <Tabs v-else v-model="editorType" name="operation-edit" :animated="false"
                        style="overflow: visible">
                    <TabPane label="前处理脚本" name="beforeScript" tab="operation-edit">
                      <!--前端脚本复合体-->
                      <OperationImplementEditor
                        v-if="editOperation"
                        ref="CURDActionBeforeImplementEditor"
                        v-model="editQuickForm.oprScript.appBefore.client.default.script"
                        :lang="editorLang"
                        :field="'appBefore'"
                        :oprScript="editQuickForm.oprScript"
                        @handleCreateServer="handleCreateServer"
                        @handleEditServer="handleEditServer"
                        @editServerImplement="editServerImplement"
                        @deleteServerImplement="deleteServerImplement"
                        @confirmServerImplement="confirmServerImplement"
                        @serverImplementEditorChange="serverImplementEditorChange"
                        @serverImplementChange="serverImplementChange"
                      >

                      </OperationImplementEditor>
                      <!--前端脚本复合体end-->
                    </TabPane>
                    <TabPane label="后处理脚本" name="afterScript" tab="operation-edit">
                      <!--前端脚本复合体-->
                      <OperationImplementEditor
                        v-if="editOperation"
                        ref="CURDActionAfterImplementEditor"
                        v-model="editQuickForm.oprScript.appAfter.client.default.script"
                        :lang="editorLang"
                        :field="'appAfter'"
                        :oprScript="editQuickForm.oprScript"
                        @handleCreateServer="handleCreateServer"
                        @handleEditServer="handleEditServer"
                        @editServerImplement="editServerImplement"
                        @deleteServerImplement="deleteServerImplement"
                        @confirmServerImplement="confirmServerImplement"
                        @serverImplementEditorChange="serverImplementEditorChange"
                        @serverImplementChange="serverImplementChange"
                      >

                      </OperationImplementEditor>
                      <!--前端脚本复合体end-->
                    </TabPane>
                  </Tabs>
                </FormItem>
              </Col>
              <Spin size="large" fix v-if="spinShow"></Spin>
            </Row>
            <!--create/next_create/edit/visit end-->
            <!--url start-->
            <Row v-show="editQuickForm.action == 'url'">
              <Col span="24">
                <FormItem label="URL地址" prop="linkUrl">
                  <Input id="globalOprUrl" v-model="editQuickForm.linkUrl" type="textarea" autosize
                         placeholder="可用$obj, $user等"></Input>
                </FormItem>
              </Col>
              <Col span="24">
                <div class="implement-plugin-box implement-plugin-css">
                  <div class="implement-plugin">
                    <Tooltip content="新建后端脚本" placement="left" style="width: 100%;">
                    <Button id="addServer" shape="circle" type="default"
                            icon="ios-add" @click="addServerScript('URL')"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="编辑区最大化" placement="left" style="width: 100%;">
                    <Button id="globalOprMagnify" shape="circle" type="default"
                            icon="ios-expand" @click="changeBigSize"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                      <Button id="globalScriptHelp" shape="circle" type="default" icon="md-help"
                              @click="openHelp"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="类属性集" placement="left" style="width: 100%">
                      <Button id="classProperty" shape="circle" type="default" icon="md-list"
                              @click="openIdTree"></Button>
                    </Tooltip>
                  </div>
                </div>
                <FormItem label="脚本内容">
                  <Tabs
                    value="beforeScript" name="operation-edit" :animated="false" style="overflow: visible">
                    <TabPane label="前处理脚本" name="beforeScript" tab="operation-edit">
                      <!--前端脚本复合体-->
                      <OperationImplementEditor
                        id="urlScriptEditor"
                        v-if="editQuickForm.action == 'url'"
                        ref="UrlActionEditor"
                        v-model="editQuickForm.oprScript.appBefore.client.default.script"
                        :lang="editorLang"
                        :field="'appBefore'"
                        :oprScript="editQuickForm.oprScript"
                        @handleCreateServer="handleCreateServer"
                        @handleEditServer="handleEditServer"
                        @editServerImplement="editServerImplement"
                        @deleteServerImplement="deleteServerImplement"
                        @confirmServerImplement="confirmServerImplement"
                        @serverImplementEditorChange="serverImplementEditorChange"
                        @serverImplementChange="serverImplementChange"
                      >

                      </OperationImplementEditor>
                      <!--前端脚本复合体end-->
                    </TabPane>
                  </Tabs>
                </FormItem>
              </Col>
            </Row>
            <!--url end-->
            <!--implement start-->
            <Row
              v-show="(editQuickForm.action == 'implement' || editQuickForm.action == 'global_implement') && editQuickForm.radio != '插件调用' && editQuickForm.radio != '插件别名'">
              <Col span="24">
                <div class="implement-plugin-box">
                  <div class="implement-plugin">
                    <Tooltip content="新建后端脚本" placement="left" style="width: 100%;">
                    <Button id="addServer" shape="circle" type="default"
                            v-show="(editQuickForm.action == 'implement' || editQuickForm.action == 'global_implement') && editQuickForm.radio == '前端脚本'"
                            icon="ios-add" @click="addServerScript('IMPLEMENT')"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="编辑区最大化" placement="left" style="width: 100%;">
                    <Button id="globalOprMagnify" shape="circle" type="default"
                            icon="ios-expand" @click="changeBigSize"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                      <Button id="globalScriptHelp" shape="circle" type="default" icon="md-help"
                              @click="openHelp"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="类属性集" placement="left" style="width: 100%">
                      <Button id="classProperty" shape="circle" type="default" icon="md-list"
                              @click="openIdTree"></Button>
                    </Tooltip>
                  </div>
                </div>
                <FormItem label="脚本内容">
                  <MonacoEditor
                    v-if="resetContent && editOperation && (editQuickForm.action === 'implement' || editQuickForm.action === 'global_implement') && editQuickForm.radio === '后端脚本'"
                    v-model="editQuickForm.oprScript.implement.server.default.script"
                    @init="editorInit"
                    :lang="editorLang"
                    theme="chrome"
                    width="100%"
                    height="250">

                  </MonacoEditor>
                  <!--前端脚本复合体-->
                  <OperationImplementEditor
                    v-if="resetContent && editOperation && (editQuickForm.action === 'implement' || editQuickForm.action === 'global_implement') && editQuickForm.radio === '前端脚本'"
                    ref="ImplementActionEditor"
                    v-model="editQuickForm.oprScript.implement.client.default.script"
                    :lang="editorLang"
                    :field="'implement'"
                    :oprScript="editQuickForm.oprScript"
                    @handleCreateServer="handleCreateServer"
                    @handleEditServer="handleEditServer"
                    @editServerImplement="editServerImplement"
                    @deleteServerImplement="deleteServerImplement"
                    @confirmServerImplement="confirmServerImplement"
                    @serverImplementEditorChange="serverImplementEditorChange"
                    @serverImplementChange="serverImplementChange"
                  >

                  </OperationImplementEditor>
                  <!--前端脚本复合体end-->
                  <MonacoEditor
                    id="globalScriptEditor1"
                    v-if="resetContent && editOperation && (editQuickForm.action === 'implement' || editQuickForm.action === 'global_implement') && editQuickForm.radio === '存储过程'"
                    v-model="editQuickForm.content"
                    @init="editorInit" :lang="editorLang"
                    theme="chrome" width="100%" height="250"></MonacoEditor>
                </FormItem>
              </Col>
            </Row>
            <!--implement end-->
            <Row
              v-show="(editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'list')">
              <FormItem label="条件表达式" prop="queryCont">
                <Input id="editQueryCont" v-model="editQuickForm.queryCont" type="textarea"
                       placeholder="请输入and开头的jpql表达式, 如and obj.state='下达', 可用$obj, $user等"
                       @on-focus="inputQuery"></Input>
              </FormItem>
              <FilterQueryCommonModal
                v-if="editQuickForm.goal"
                :targetClass="editQuickForm.goal ? editQuickForm.goal.split('&')[0] : ''"
                :refClass="editQuickForm.goal"
                ref="filterQuery_modal"
                :store="$store"
                :root="root"
                :fromManagement="true"
                @generatorFilterQuery="getFilterQuery"
              >
              </FilterQueryCommonModal>
            </Row>
          </div>
          <!--系统操作后处理脚本部分-->
          <div v-else>
            <Row>
              <Col span="24">
                <div class="implement-plugin-box implement-plugin-css">
                  <div class="implement-plugin">
                    <Tooltip content="新建后端脚本" placement="left" style="width: 100%;">
                    <Button id="addServer" shape="circle" type="default"
                            icon="ios-add" @click="addServerScript('IMPLEMENT')"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="编辑区最大化" placement="left" style="width: 100%;">
                    <Button id="globalOprMagnify" shape="circle" type="default"
                            icon="ios-expand" @click="changeBigSize"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                      <Button id="globalScriptHelp" shape="circle" type="default" icon="md-help"
                              @click="openHelp"></Button>
                    </Tooltip>
                  </div>
                  <div class="implement-plugin">
                    <Tooltip content="类属性集" placement="left" style="width: 100%">
                      <Button id="classProperty" shape="circle" type="default" icon="md-list"
                              @click="openIdTree"></Button>
                    </Tooltip>
                  </div>
                </div>
                <FormItem label="脚本内容">
                  <Tabs :value="'afterScript'" name="operation-edit" :animated="false" style="overflow: visible">
                    <TabPane label="后处理脚本" name="afterScript" tab="operation-edit">
                      <!--前端脚本复合体-->
                      <OperationImplementEditor
                        v-if="editOperation"
                        ref="ImplementActionEditor"
                        v-model="editQuickForm.oprScript.implement.client.default.script"
                        :lang="editorLang"
                        :field="'implement'"
                        :oprScript="editQuickForm.oprScript"
                        @handleCreateServer="handleCreateServer"
                        @handleEditServer="handleEditServer"
                        @editServerImplement="editServerImplement"
                        @deleteServerImplement="deleteServerImplement"
                        @confirmServerImplement="confirmServerImplement"
                        @serverImplementEditorChange="serverImplementEditorChange"
                        @serverImplementChange="serverImplementChange"
                      >

                      </OperationImplementEditor>
                      <!--前端脚本复合体end-->
                    </TabPane>
                  </Tabs>
                </FormItem>
              </Col>
              <Spin size="large" fix v-if="spinShow"></Spin>
            </Row>
          </div>
        </Card>
        <transition name="fade" v-if="!sysBindOpr">
          <!-- 弹窗 -->
          <Card style="width:100%;"
                v-show="editQuickForm.action != 'global_implement' && ((editQuickForm.style == 'dialog' && editQuickForm.action != 'implement') || editQuickForm.style == 'tip' || (editQuickForm.style == 'drawerR' || editQuickForm.style == 'drawerL') && editQuickForm.action != 'implement')">
            <p slot="title">
              <Icon type="ios-color-wand"></Icon>
              样式
            </p>

            <!-- 弹窗 -->
            <Row v-show="editQuickForm.style == 'dialog'">
              <Col span="12">
                <FormItem label="弹窗宽度" prop="dialogWidth">
                  <Input id="editDialogWidgh" v-model="editQuickForm.dialogWidth" type="number">
                    <Select id="selectDialogWidthType" class="dialogWtype" v-model="editQuickForm.dialogWidthType"
                            slot="append" style="width: 70px;">
                      <Option value="%">%</Option>
                      <Option value="px">px</Option>
                    </Select>
                  </Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem label="弹窗高度自适应" prop="dialogAutoHeight">
                  <i-switch id="dialogAutoHeight" v-model="editQuickForm.dialogAutoHeight"></i-switch>
                </FormItem>
              </Col>
              <Col span="12" v-show="!editQuickForm.dialogAutoHeight">
                <FormItem label="弹窗高度" prop="dialogHeight">
                  <Input id="editDialogHeight" v-model="editQuickForm.dialogHeight" type="number">
                    <Select id="selectDialogHeightType" class="dialogWtype" v-model="editQuickForm.dialogHeightType"
                            slot="append" style="width: 70px;">
                      <Option value="px">px</Option>
                      <Option value="vh">%</Option>
                    </Select>
                  </Input>
                </FormItem>
              </Col>
              <!-- <Col span="12">
                <FormItem label="可拖拽" prop="dragDialog">
                  <i-switch v-model="editQuickForm.dragDialog"></i-switch>
                </FormItem>
              </Col> -->
            </Row>

            <!-- 滑窗 -->
            <Row v-show="editQuickForm.style == 'drawerR' || editQuickForm.style == 'drawerL'">
              <Col span="12">
                <FormItem label="滑窗宽度" prop="drawerWidth">
                  <Input id="editDrawerWidth" v-model="editQuickForm.drawerWidth" type="number">
                    <Select id="selectDrawerWidthType" class="dialogWtype" v-model="editQuickForm.drawerWidthType"
                            slot="append" style="width: 70px;">
                      <Option value="%">%</Option>
                      <Option value="px">px</Option>
                    </Select>
                  </Input>
                </FormItem>
              </Col>
            </Row>

            <!-- 浮窗 -->
            <Row v-show="editQuickForm.style == 'tip'">
              <Col span="12">
                <div class="top">
                  <RadioGroup v-model="editQuickForm.tipPlacement" type="button">
                    <div class="top">
                      <Poptip trigger="hover" title="提示" content="content" placement="top-start">
                        <Radio label="上左" style="margin-right: 5px;"></Radio>
                      </Poptip>
                      <Poptip trigger="hover" title="提示" content="content" placement="top">
                        <Radio label="上边" style="margin-right: 5px;"></Radio>
                      </Poptip>
                      <Poptip trigger="hover" title="提示" content="content" placement="top-end">
                        <Radio label="上右"></Radio>
                      </Poptip>
                    </div>
                    <div class="center">
                      <div class="center-left">
                        <Poptip trigger="hover" title="提示" content="content" placement="left-start">
                          <Radio label="左上"></Radio>
                        </Poptip>
                        <br><br>
                        <Poptip trigger="hover" title="提示" content="content" placement="left">
                          <Radio label="左边"></Radio>
                        </Poptip>
                        <br><br>
                        <Poptip trigger="hover" title="提示" content="content" placement="left-end">
                          <Radio label="左下"></Radio>
                        </Poptip>
                      </div>
                      <div class="center-right">
                        <Poptip trigger="hover" title="提示" content="content" placement="right-start">
                          <Radio label="右上"></Radio>
                        </Poptip>
                        <br><br>
                        <Poptip trigger="hover" title="提示" content="content" placement="right">
                          <Radio label="右边"></Radio>
                        </Poptip>
                        <br><br>
                        <Poptip trigger="hover" title="提示" content="content" placement="right-end">
                          <Radio label="右下"></Radio>
                        </Poptip>
                      </div>
                    </div>
                    <div class="bottom">
                      <Poptip trigger="hover" title="提示" content="content" placement="bottom-start">
                        <Radio label="下左" style="margin-right: 5px;"></Radio>
                      </Poptip>
                      <Poptip trigger="hover" title="提示" content="content" placement="bottom">
                        <Radio label="下边" style="margin-right: 5px;"></Radio>
                      </Poptip>
                      <Poptip trigger="hover" title="提示" content="content" placement="bottom-end">
                        <Radio label="下右"></Radio>
                      </Poptip>
                    </div>
                  </RadioGroup>
                </div>
              </Col>
              <Col span="12">
                <FormItem label="浮窗宽度" prop="popWidth">
                  <InputNumber v-model="editQuickForm.popWidth" style="width:100%;"></InputNumber>
                </FormItem>
                <FormItem label="开启浮窗标题" prop="needPopTitle">
                  <i-switch v-model="editQuickForm.needPopTitle"></i-switch>
                </FormItem>
                <div v-show="editQuickForm.needPopTitle">
                  <FormItem label="标题文字" prop="popTitleTxt" number>
                    <Input v-model="editQuickForm.popTitleTxt"></Input>
                  </FormItem>
                  <Row>
                    <Col span="12">
                      <FormItem label="字号" prop="popTitleFs">
                        <InputNumber :min="12" v-model="editQuickForm.popTitleFs" style="width:100%;"></InputNumber>
                      </FormItem>
                    </Col>
                    <Col span="12">
                      <FormItem label="颜色" prop="popTitleColor">
                        <ColorPicker v-model="editQuickForm.popTitleColor"/>
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Card>
        </transition>
      </Form>
      <div slot="footer">
        <Button id="cancelOprButton" type="text" @click="cancel">取消</Button>
        <Button id="confirmOprButton" :loading="confirmOprLoading" type="primary" @click="confirmFix">确认</Button>
      </div>
    </Modal>

    <!-- 编辑操作ending -->
    <!-- 最大化编辑器 -->
    <Modal
      id="globalScriptEditorWindow"
      v-model="isFullScreen"
      title="脚本编辑"
      :mask-closable="false"
      :styles="fullStyle"
      @on-ok="confirmScript"
      @on-cancel="cancelScript">
      <Row>
        <Col span="22">
          <template v-if="serverImplementEditor">
            {{ serverImplementKey }}-{{ server.displayName }}
            <!--后端脚本列表编辑中-->
            <MonacoEditor
              id="globalScriptEditorBig"
              v-if="isFullScreen"
              v-model="beforeParams"
              @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="600"></MonacoEditor>
          </template>
          <template v-else>
            <!--系统后处理脚本-->
            <Tabs
              v-if="sysBindOpr" :value="'afterScript'" name="operation-edit" :animated="false"
              style="overflow: visible">
              <TabPane label="后处理脚本" name="afterScript" tab="operation-edit">
                <MonacoEditor id="globalScriptEditorBig"
                              v-if="isFullScreen" v-model="beforeParams" @init="editorInit"
                              :lang="'javascript'"
                              theme="chrome" width="100%"
                              height="600"></MonacoEditor>
              </TabPane>
            </Tabs>
            <!--事件脚本编辑中-->
            <MonacoEditor
              id="globalScriptEditorBig"
              v-else-if="!sysBindOpr && (editQuickForm.action == 'implement' || editQuickForm.action == 'global_implement' || editQuickForm.action == 'url' || (editQuickForm.style != 'dialog' && editQuickForm.style != 'tab')) && isFullScreen"
              v-model="beforeParams"
              @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="600"></MonacoEditor>
            <!--前后处理脚本编辑中-->
            <Tabs v-else :value="editorType" name="operation-edit" :animated="false" style="overflow: visible">
              <TabPane label="前处理脚本" name="beforeScript" tab="operation-edit">
                <MonacoEditor id="beforeScriptEditor1" v-if="isFullScreen" v-model="beforeParams" @init="editorInit"
                              :lang="editorLang" theme="chrome" width="100%"
                              height="600"></MonacoEditor>
              </TabPane>
              <TabPane label="后处理脚本" name="afterScript" tab="operation-edit">
                <MonacoEditor id="adterScriptEditor1" v-if="isFullScreen" v-model="afterParams" @init="editorInit"
                              :lang="editorLang" theme="chrome" width="100%"
                              height="600"></MonacoEditor>
              </TabPane>
            </Tabs>
          </template>
        </Col>
        <Col span="1" offset="1">
          <Row>
            <Col span="24">
              <!-- <div style="margin-bottom: 8px">
                <Button shape="circle" style="margin-right: 10px;" type="default" icon="ios-expand" @click="changeBigSize"></Button>
              </div> -->
              <div style="margin-bottom: 8px">
                <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                  <Button id="globalScriptHelp" shape="circle" type="default" icon="md-help" @click="openHelp"></Button>
                </Tooltip>
              </div>
              <div>
                <Tooltip content="类属性集" placement="left" style="width: 100%">
                  <Button id="classProperty" shape="circle" type="default" icon="md-list" @click="openIdTree"></Button>
                </Tooltip>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
    <!-- 最大化编辑器ENDING -->
  </div>
</template>

<script>
import {
  getPlugList,
  getIconList,
  getAllEntities,
  getAllRelations,
  // getAllResources,
  getViews,
  fixQuickOpe,
  delQuickOpe,
  checkCnameEvent,
  checkDnameEvent,
  createQuickOpe,
  getQuickOpeById,
  getKeyWordList,
  getObjName,
} from "@/api/others";
import RelationModeling from "@/api/data-model/RelationModeling";
import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
import FilterQueryCommonModal from '@/ext_components/form/subcomponent/FilterQueryCommonModal';
import {entries as opr_entries} from "@/ext_components/operation/config.js";
import {entries as opr_assemble_entries} from "@/assemble_components/operation/assemble_config.js";
import moduleIconData from "./moduleIcon.js";
import fontIconData from "./iFontIcon.js";
import vantIconData from "./vantIcon.js";
import { Icon } from 'vant';
import {mapMutations, mapGetters, mapActions} from "vuex";
import axios from "@/libs/anotherAxios";
import _global from '@/views/global.vue'
import _ from 'lodash';
import MonacoEditor from "@/views/functional-model/components/MonacoEditor";
import { uuid } from '@/util/assist'
import OperationImplementEditor from "@/views/functional-model/components/OperationImplementEditor";

export default {
  props: ['context', "route", "router", "root", "jsonData", "store", "fromManagement"],
  data() {
    const validateCname = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('显示名不能为空'));
      } else {
        if (value.length > 32) {
          callback(new Error('显示名不能超过32个字符哦～'));
        } else {
          callback();
        }
      }
    };
    const validateEname = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('英文名不能为空'));
      } else {
        const reg = new RegExp("^[A-Za-z][A-Za-z0-9]*$");
        let flag = reg.test(value);
        if (!flag) {
          callback(new Error('须英文字母开头, 只能包含字母和数字哦～'));
        } else {
          if (value.length > 32) {
            callback(new Error('英文名不能超过32个字符哦～'));
          } else {
            callback();
          }
        }
      }
    };
    return {
      idTree: [],
      selectedId: "",
      chooseTargetClass: '',
      chooseTargetAttr: '',
      current_event_is_triggered_by_init: false,
      editOperation: false,
      spinShow: false,
      newMoadl: false,
      hasData: true,
      loadingObj: false,
      reloadGoal: false,
      queryOprId: '',
      disEname: true,
      cnameExist: false,
      dnameExist: false,
      finalValue: false,
      rePanel: false,
      toolAttr: ['1', '3', '5'],
      isApp: location.href.indexOf('token') == -1,
      folderFobbiden: false,      // folder操作仅允许绑定快速查询操作
      bindModal: false, // 仅创建
      createBindModal: false, // 创建并绑定
      delOpe: false,
      operationList: [],
      editFlag: 3, // 当前编辑的是系统 & 快速查询操作 0:系统
      nonePlug: false, // 是否禁止选择插件入口的方式

      isFullScreen: false,     // 脚本编辑器全屏
      commonScript: '',     // 公共最大化编辑器内容
      defaultParams: '',     // 公共最大化编辑器内容   非implement
      beforeParams: '',     // 公共最大化编辑器内容   非implement
      afterParams: '',      // 公共最大化编辑器内容   非implement

      plugData: [],
      plugList: [],
      editorType: 'beforeScript',
      editorOprType: 'defaultScript',
      showdefImg: false,
      showActImg: false,
      defImgId: '',
      actImgId: '',
      mobileFlag: true,
      baseUrl: '',
      reloadView: true,

      editQuickForm: {
        ename: "",
        cname: "",
        moduleName: "",
        targetNumber: "",
        icon: "",
        btmIconType: '系统图标',
        btmIconDefColor: '#646566',
        btmIconActColor: '#1989fa',
        defImg: null,
        actImg: null,
        style: "dialog",
        action: "create",
        needDefaultOpr: false,
        needDialogDefaultOpr: true,
        autoClose: "auto",
        tipPlacement: '右边',
        dialogWidth: 86,
        dialogWidthType: '%',
        dialogAutoHeight: true,
        dialogHeight: 400,
        dialogHeightType: 'px',
        dragDialog: false,
        drawerWidth: 720,
        drawerWidthType: 'px',
        popWidth: 400,
        needPopTitle: false,
        popTitleTxt: '提示',
        popTitleFs: 14,
        popTitleColor: '#333',
        radio: "后端脚本",
        plugPath: "",
        content: "",
        goal: "",
        defaultParams: '',
        beforeParams: '',
        afterParams: '',
        params: "",
        viewTitle: "",
        viewName: "",
        // goalObj: "",
        linkUrl: "",
        queryCont: "",
        oid: "",
        oprScript: {
          implement: {
            entry: '',
            client: {
              default: {
                script: '',
                displayName: '',
              }
            },
            server: {
              default: {
                script: '',
                displayName: '默认脚本',
              }
            }
          },
          appBefore: {
            entry: '',
            client: {
              default: {
                script: '',
                displayName: '',
              }
            },
            server: {
              default: {
                script: '',
                displayName: '默认脚本',
              }
            }
          },
          appAfter: {
            entry: '',
            client: {
              default: {
                script: '',
                displayName: '',
              }
            },
            server: {
              default: {
                script: '',
                displayName: '默认脚本',
              }
            }
          },
        },
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
        {
          value: "next_create",
          label: "级联创建"
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
      autoCloseList: [
        {
          value: 'auto',
          label: '自动关闭'
        },
        {
          value: 'script',
          label: '手动关闭'
        }
      ],
      iconList: [], // icon列表
      iList: [], // icon列表
      vList: [], // icon列表
      entitiesList: [], // 实体类列表
      relationsList: [], // 关联类列表
      // resourcesList: [], // 资源类列表
      pcViewList: [],
      mobileViewList: [],

      isTip: true,
      editOperationTitle: '操作配置',
      quickStyle: [
        {
          value: "dialog",
          label: "dialog | 弹窗"
        },
        {
          value: "tab",
          label: "tab | 页签"
        },
        {
          value: "drawerR",
          label: "drawer | 右侧滑窗"
        },
        {
          value: "drawerL",
          label: "drawer | 左侧滑窗"
        },
      ],
      ruleNewModal: {
        cname: [
          {required: true, message: "显示名不能为空哦～", trigger: "blur"},
          {validator: validateCname, trigger: 'blur'}
        ],
        ename: [
          {required: true, message: "英文名不能为空哦～", trigger: "blur"},
          {validator: validateEname, trigger: 'blur'}
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
          {required: true, message: "显示名不能为空哦～", trigger: "blur"},
          {validator: validateCname, trigger: 'blur'}
        ]
      },
      ruleBindCreate: {
        cname: [
          {required: true, message: "显示名不能为空哦～", trigger: "blur"},
          {validator: validateCname, trigger: 'blur'}
        ],
        ename: [
          {required: true, message: "英文名不能为空哦～", trigger: "blur"},
          {validator: validateEname, trigger: 'blur'}
        ],
        editJs: [
          {required: true, message: "脚本内容不能为空哦～", trigger: "blur"}
        ]
      },
      ruleFix: {
        cname: [
          {required: true, message: "显示名不能为空哦～", trigger: "blur"},
          {validator: validateCname, trigger: 'blur'}
        ]
      },
      ruleModel: {
        cname: [
          {required: true, message: "显示名不能为空哦～", trigger: "blur"},
          {validator: validateCname, trigger: 'blur'}
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
          {required: true, message: '英文名不能为空哦～', trigger: 'blur'},
          {validator: validateEname, trigger: 'blur'}
        ],
        cname: [
          {required: true, message: '显示名不能为空哦～', trigger: 'blur'},
          {validator: validateCname, trigger: 'blur'}
        ],
        targetNumber: [
          {
            pattern: /^[0-9]*$/,
            message: "序号只能是数字哦～",
            trigger: "blur"
          }
        ],
        // icon: [
        //   { required: true, message: '请选择小图标～', trigger: 'blur' }
        // ],
        action: [
          {required: true, message: '请选择动作类型～', trigger: 'blur'}
        ],
        style: [
          {required: true, message: '请选择操作样式～', trigger: 'blur'}
        ]
      },
      bindParams: {
        bindClassName: "",
        bindID: ""
      },
      target: null,
      idTreeVis: false,
      groupAttrList: [],
      contentCatch: {
        serverScript: '',
        clientScript: '',
        procedure: ''
      },
      resetContent: true,
      isGlobalImplement: false,
      customAction: '',
      confirmOprLoading: false,
      // editorLang: 'javascript',
      sysBindOpr: false, //是否为系统操作绑定的后处理脚本操作
      serverImplementEditor: false,
    };
  },
  components: {
    OperationImplementEditor,
    MonacoEditor: MonacoEditor,
    FilterQueryCommonModal: FilterQueryCommonModal
  },
  created() {
    this.baseUrl = _global.baseUrl;
  },
  mounted() {

    this.initData();
    let drawer = this.$refs.drawer.$el.querySelector(".ivu-drawer-no-mask");
    if (drawer) {
      drawer.style.zIndex = "5000";
    }
  },
  beforeDestroy() {
  },
  computed: {
    ...mapGetters("DWF_form", [
      "EntityAttrList",
      "Entities",
      "Relations",
      "RelationAttrList"
    ]),
    fullStyle() {
      return this.idTreeVis ? {'margin-left': '5%', 'width': 'calc(90% - 400px)'} : {'width': '80%'};
    },
    btnSpan() {
      return this.jsonData ? 8 : 10;
    },
    editorLang() {
      if ((this.editQuickForm.action === 'implement' || this.editQuickForm.action === 'global_implement') && this.editQuickForm.radio === '后端脚本') {
        return 'java';
      } else if (this.serverImplementEditor) {
        return 'java';
      } else if (this.editQuickForm.radio === '存储过程') {
        return 'pgsql'
      } else {
        return 'javascript'
      }
    }
  },
  watch: {
    async editOperation(val) {
      // 全局操作无需此处操作
      if (!this.jsonData) return;
      if (!this.isFullScreen) {
        this.idTreeVis = false;
      }
    },
    'editQuickForm.radio'(nval, oval) {
      if (oval == '后端脚本') {
        this.contentCatch['serverScript'] = this.editQuickForm.content;
      } else if (oval == '存储过程') {
        this.contentCatch['procedure'] = this.editQuickForm.content;
      } else if (oval == '前端脚本') {
        this.contentCatch['clientScript'] = this.editQuickForm.content;
      } else {
        this.editQuickForm.content = '';
      }

      if (nval == "后端脚本") {
        this.editQuickForm.content = this.contentCatch['serverScript'];
      } else if (nval == "存储过程") {
        this.editQuickForm.content = this.contentCatch['procedure'];
      } else if (nval == "前端脚本") {
        this.editQuickForm.content = this.contentCatch['clientScript'];
      } else {
        this.editQuickForm.content = '';
      }
    },
    'editQuickForm.style'(val) {
      if (val === 'tab') {
        this.actionList = [
          {
            value: "create",
            label: "单对象创建"
          },
          {
            value: "url",
            label: "外部链接"
          },
          {
            value: "implement",
            label: "操作实现"
          },
          {
            value: "edit",
            label: "单对象编辑"
          },
          {
            value: "visit",
            label: "单对象浏览"
          },
        ]
        this.editQuickForm.action === 'next_create' ? this.editQuickForm.action = 'create' : '';
      } else {
        this.actionList = [
          {
            value: "create",
            label: "单对象创建"
          },
          {
            value: "next_create",
            label: "级联创建"
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
        ]
      }
    },
    'editQuickForm.action'(val) {
      if (val === 'url') {
        this.editorType = 'beforeScript';
      }
      if (val !== 'url') {
        this.editQuickForm.linkUrl = '';
      }
      if (val === 'implement' || val === 'global_implement') {
        //fix bug 5663
        this.editQuickForm.goal = '';
        this.editQuickForm.viewName = '';
      }
    },
  },
  methods: {
    ...mapMutations(["addRoute"]),
    ...mapActions("DWF_form", [
      "queryEntity",
      "queryRelation"
    ]),
    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/pgsql"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },

    // 上传自定义底部模块图标
    handleBeforeUpload (file) {

        const isJPG = (file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/jpeg');
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
        this.$Message.error('上传图片只能是 JPG/JPEG/PNG 格式!');
        }
        if (!isLt2M) {
        this.$Message.error('上传图片大小不能超过 2MB!');
        }

        if(isJPG && isLt2M) {

          // 默认图片上传到资料库
          let image = new FormData();
          image.append('file', file);
          axios.post('files-upload?libraryId=picture_management', image, { headers: { "Content-Type": "multipart/form-data"}}).then(response => {

            let res = response.data;
            console.log(res);
            if(!res.success) {
                this.$Message.warning(res.message);
                this.defImgId = '';
            } else {
              this.defImgId = res.data.oid;
            }

          }).catch(e => {
            this.defImgId = '';
            console.log(e);
          });

            var _self = this;
            if(window.FileReader) {

                var fr = new FileReader();
                fr.onloadend = function(e) {
                  _self.editQuickForm.defImg = e.target.result;
                  // _self.$refs.appForm.validateField('extConfig.logoImg');
                  _self.showdefImg = true;
                };
                fr.readAsDataURL(file);

            }

        }
        return !isJPG && isLt2M;

    },

    handleBeforeUploadAct (file) {

        const isJPG = (file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/jpeg');
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
        this.$Message.error('上传图片只能是 JPG/JPEG/PNG 格式!');
        }
        if (!isLt2M) {
        this.$Message.error('上传图片大小不能超过 2MB!');
        }

        if(isJPG && isLt2M) {

          // 图片上传到资料库
          let image = new FormData();
          image.append('file', file);
          axios.post('files-upload?libraryId=picture_management', image, { headers: { "Content-Type": "multipart/form-data"}}).then(response => {

            let res = response.data;
            if(!res.success) {
                this.$Message.warning(res.message);
                this.actImgId = '';
            } else {
              this.actImgId = res.data.oid;
            }

          }).catch(e => {
            this.actImgId = '';
            console.log(e);
          });

          var _self = this;
          if(window.FileReader) {

              var fr = new FileReader();
              fr.onloadend = function(e) {
                  _self.editQuickForm.actImg = e.target.result;
                  // _self.$refs.appForm.validateField('extConfig.logoImg');
                  _self.showActImg = true;
              };
              fr.readAsDataURL(file);

          }

        }
        return !isJPG && isLt2M;

    },
    async targetClassChange(val) {
      this.chooseTargetAttr = '';
      this.groupAttrList = [];
      this.rePanel = false;

      if (val != undefined && val != '') {

        let curClass = val.split('&')[0];

        if (val.split('&')[1] == 'e') {
          let enTypeAttr;
          try {
            enTypeAttr = await getObjName(curClass);
            enTypeAttr = enTypeAttr.data.data;
          } catch (e) {
            // await this.queryEntity(curClass);
            // enTypeAttr = this.EntityAttrList(curClass);
          }
          let enTypeSysAttr = enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          let enTypeDefAttr = enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
          let groupSysItem = {
            groupName: '系统属性',
            groupType: '',
            attrList: enTypeSysAttr
          };
          let groupDefItem = {
            groupName: '类属性',
            groupType: '',
            attrList: enTypeDefAttr
          };
          if (groupSysItem.attrList.length > 0) {
            this.groupAttrList.push(groupSysItem)
          }

          this.groupAttrList.push(groupDefItem);
          this.rePanel = true;

        } else {
          let reTypeAttr;
          let reTypeLAttr;
          let reTypeRAttr;
          try {
            reTypeAttr = await getObjName(curClass);
            reTypeAttr = reTypeAttr.data.data;
          } catch (e) {
            await this.queryRelation(curClass);
            reTypeAttr = this.RelationAttrList(curClass);
          }
          let reClass = {};
          try {
            let res = await RelationModeling.getRelation(curClass);
            reClass = res.data
          } catch (e) {
            reClass = this.Relations(curClass);
          }
          if ('leftClass' in reClass) {
            try {
              reTypeLAttr = await getObjName(reClass.leftClass);
              reTypeLAttr = reTypeLAttr.data.data;
            } catch (e) {
              await this.queryEntity(reClass.leftClass);
              reTypeLAttr = this.EntityAttrList(reClass.leftClass);
            }
          }
          if ('rightClass' in reClass) {
            try {
              reTypeRAttr = await getObjName(reClass.rightClass);
              reTypeRAttr = reTypeRAttr.data.data;
            } catch (e) {
              await this.queryEntity(reClass.rightClass);
              reTypeRAttr = this.EntityAttrList(reClass.rightClass);
            }
          }

          let groupLItem = {
            groupName: '左实体类',
            groupType: 'left_',
            attrList: reTypeLAttr
          };
          let reTypeLSysAttr = reTypeLAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          let reTypeLDefAttr = reTypeLAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
          let groupLSysItem = {
            groupName: `左实体类系统属性`,
            groupType: 'left_',
            attrList: reTypeLSysAttr
          };
          let groupLDefItem = {
            groupName: `左实体类属性`,
            groupType: 'left_',
            attrList: reTypeLDefAttr
          };

          let groupReItem = {
            groupName: '关联类',
            groupType: 'relation_',
            attrList: reTypeAttr
          };
          let reTypeSysAttr = reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
          let reTypeDefAttr = reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
          let groupReSysItem = {
            groupName: `关联类系统属性`,
            groupType: 'relation_',
            attrList: reTypeSysAttr
          };
          let groupReDefItem = {
            groupName: `关联类属性`,
            groupType: 'relation_',
            attrList: reTypeDefAttr
          };

          let groupRItem = {
            groupName: '右实体类',
            groupType: 'right_',
            attrList: reTypeRAttr
          };
          let reTypeRSysAttr = reTypeRAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          let reTypeRDefAttr = reTypeRAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
          let groupRSysItem = {
            groupName: `右实体类系统属性`,
            groupType: 'right_',
            attrList: reTypeRSysAttr
          };
          let groupRDefItem = {
            groupName: `右实体类属性`,
            groupType: 'right_',
            attrList: reTypeRDefAttr
          };

          this.groupAttrList.push(groupLSysItem, groupLDefItem, groupReSysItem, groupReDefItem, groupRSysItem, groupRDefItem);
          this.rePanel = true;

        }
      }

    },

    renderContent (h, { root, node, data }) {

      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%',
          cursor: 'pointer',
          background: this.selectedId == data.uuid ? '#d5e8fc' : '#fff',
          lineHeight: 1
        },
        on: {
          click: () => {
            this.selectedId = data.uuid;
          }
        }
      }, [
        h('span',
          [
            h('Tooltip', {
              props: {
                maxWidth: 220,
                placement: 'right',
                content: data.title
              }
            }, [
              h('span', {
                style: {
                  display: 'inline-block',
                  width: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                },
              }, data.title)
            ])
          ]),

        h('Tooltip', {
          props: {
            maxWidth: 220,
            placement: 'left',
            content: data.selfProp
          },
          style: {
            float: 'right',
            marginRight: '32px'
          }
        }, [
          h('span', {
            style: {
              display: 'inline-block',
              width: '180px',
              textAlign: 'right',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          }, data.selfProp)
        ])
        // h('span', {
        //     style: {
        //         display: 'inline-block',
        //         float: 'right',
        //         marginRight: '32px',
        //         width: '220px',
        //         textAlign: 'right',
        //         overflow: 'hidden',
        //         textOverflow: 'ellipsis',
        //         whiteSpace: 'nowrap'
        //     }
        // },data.selfProp)
      ]);
    },

    getErrorIDBEn() {

      this.entitiesList = [];
      let promiseE = new Promise((resolve, reject) => {

        getAllEntities({needOperationCount: false})
          .then(response => {
            let res = response.data;
            resolve(res);
            if (!res.success) {
              const title = "提示";
              const content = "<p>服务器繁忙, 实体类列表获取失败请稍后再试～</p>";
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

    },

    getErrorIDBRe() {

      this.relationsList = [];
      let promiseRe = new Promise((resolve, reject) => {

        getAllRelations()
          .then(response => {
            let res = response.data;
            resolve(res);
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

    },

    getTree(data) {

      let res = [];
      let commonClassType = ['addin_Grid', 'addin_MultiObjPicture', 'addin_EchartBar', 'addin_ScatterChart', 'addin_GaugeChart', 'addin_PieChart', 'addin_MapChart', 'addin_FormEngine', 'addin_DynamicMap'];
      data.elements.forEach(x => {

        let hasName = '';
        if (x.self.elementType == 'addin_Operation') {
          hasName = 'obj' in x ? x.obj.args.text : '';
        } else if (commonClassType.includes(x.self.elementType)) {
          hasName = 'obj' in x && x.obj.args.bindTargetClass ? x.obj.args.bindTargetClass.split('&')[0] : '';
        } else if (x.self.elementType == 'addin_SearchBox') {
          hasName = 'obj' in x && x.obj.args.chooseTable ? x.obj.args.chooseTable : '';
        } else if (x.self.elementType == 'addin_RelationTree') {
          hasName = 'obj' in x && x.obj.args.targetRelationClass ? x.obj.args.targetRelationClass.split('&')[0] : '';
        } else if (x.self.elementType == 'addin_GroupBox') {
          hasName = 'obj' in x ? x.obj.args._title || '' : '';
        } else if (x.self.elementType == 'addin_DragItem') {
          hasName = 'obj' in x ? x.obj.args.dragTitle || '' : '';
        } else if (x.self.elementType == 'addin_SelfCode' || x.self.elementType == 'addin_EChart') {
          hasName = 'obj' in x ? x.obj.args.title || '' : '';
        } else {
          hasName = 'name' in x.self.properties && x.self.properties.name ? `(${x.self.properties.name})` : '';
        }

        let node = {};
        node.title = `${x.self.properties.title}`;
        node.selfProp = `${x.self.properties.label || ''}${hasName}`;
        node.uuid = x.self.properties.id;
        if (x.elements && x.elements.length > 0) {
          node.expand = true;
          node.children = this.getTree(x);
        }
        res.push(node);
      });
      return res;
    },
    // onTreeSelect(val, node) {
    //   this.selectedId = node.uuid;
    // },
    // 数据初始化
    initData() {
      // 操作列表get
      this.operationList = [];
      this.reloadGoal = false;
      this.iconList = moduleIconData;
      this.iList = fontIconData;
      this.vList = vantIconData;
      let self = this;

      // 实体类
      this.entitiesList = [];
      this.relationsList = [];

      let allEn = this.Entities();
      let allRe = this.Relations();

      if(allEn && allEn.length > 0) {

        allEn.forEach((val) => {
          let eachItem = {
            value: val.className + "&e",
            label: val.displayName
          };
          this.entitiesList.push(eachItem);
        });

      } else {
        this.getErrorIDBEn();
      }

      if(allRe && allRe.length > 0) {

        allRe.forEach((val) => {
          let eachItem = {
            value: val.className + "&re",
            label: val.displayName
          };
          this.relationsList.push(eachItem);
        });

      } else {
        this.getErrorIDBRe();
      }


      // 插件列表
      let promiseI = new Promise((resolve, reject) => {
        this.nonePlug = true;
        this.plugList = [];

        if (opr_entries.length != undefined && opr_entries.length == 0) {
          this.nonePlug = true;

          this.editQuickForm.radio = "后端脚本";
          this.editQuickForm.content = "";
        } else {
          opr_entries.forEach(x => {
            this.nonePlug = false;
            this.plugList.push({
              value: x.name,
              label: `${x.name}(${x.note})`
            });
          });

          if (opr_assemble_entries.length != undefined && opr_assemble_entries.length > 0) {

            opr_assemble_entries.forEach(x => {
              this.plugList.push({
                value: x.name,
                label: `${x.name}(${x.note})`
              });
            });

          }
        }

        if (!this.nonePlug) {
          this.editQuickForm.radio = "后端脚本";
          this.editQuickForm.content = "";
        }
      })

    },

    // 跳转到脚本说明文档
    openHelp() {
      window.open(`http://ise.thss.tsinghua.edu.cn/confluence/pages/viewpage.action?pageId=22511673`);
    },

    openIdTree() {

      let drawer = this.$refs.drawer.$el.querySelector(".ivu-drawer-no-mask");
      let drawerRight = this.$refs.drawer.$el.querySelector(".ivu-drawer-right");
      let drawerContent = this.$refs.drawer.$el.querySelector(".ivu-drawer-content-no-mask");
      if (drawer) {
        drawer.style.zIndex = "9999";
        drawerRight.style.zIndex = "9999";
        drawerContent.style.zIndex = "9999";
      }
      let cName = this.editQuickForm.moduleName.split('-')[0];
      if (cName != '' && cName != 'Root') {
        let isEN = this.entitiesList.findIndex(e => {
          return e.value == (cName + '&e');
        })
        this.$refs.chooseTargetClass.reset();
        this.$nextTick(() => {
          if (isEN != -1) {
            this.chooseTargetClass = cName + '&e';
          } else {
            this.chooseTargetClass = cName + '&re'
          }
          this.targetClassChange(this.chooseTargetClass);
        })
      }
      this.idTreeVis = true;

    },

    // 快速查询操作英文名查重
    checkCname(fname) {
      const reg = new RegExp("^[A-Za-z][A-Za-z0-9]*$");
      if (this.$refs[fname].model.ename != "" && reg.test(this.$refs[fname].model.ename)) {
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

    // 快速查询操作中文名查重
    checkDname(fname) {
      if (this.$refs[fname].model.cname != "") {
        let params = {
          displayName: this.$refs[fname].model.cname,
          moduleName: this.editQuickForm.moduleName
        }
        if ((this.disEname || this.sysBindOpr) && this.queryOprId) {
          params.oid = this.queryOprId;
        }
        checkDnameEvent(params).then(response => {
          let res = response.data;
          if (!res.success && res.code == 400) {
            this.dnameExist = true;
          } else {
            this.dnameExist = false;
          }
        })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
      }
    },

    cancel() {
      this.editOperation = false;
      this.cnameExist = false;
      this.dnameExist = false;

      this.$refs['editQuickForm'].resetFields();

      this.editQuickForm.goal = '';
      this.editQuickForm.viewName = '';
      this.editQuickForm.content = '';
      this.contentCatch = {
        serverScript: '',
        clientScript: '',
        procedure: ''
      }
      this.editQuickForm.radio = '';
      this.reloadGoal = false;

    },
    chooseIcon(value) {
      this.editQuickForm.icon = value;
    },

    // 视图 & 目标对象联动
    async changeView(value) {
      if (value === undefined || value === '') {
        this.editQuickForm.viewName = '';
        this.pcViewList = [];
        this.mobileViewList = [];
        return;
      }
      if (value != '' && value != '&r' && value != '&e' && value != "&re") {
        this.spinShow = true;
      }

      this.loadingObj = true;
      // 视图数据获取
      let eachClass = value.split("&")[0];
      let whichClass = value.split("&")[1];
      if (eachClass != '') {
        try {

          let response;
          if(this.mobileFlag === true) {
            response = await getViews(eachClass, {needV3Content: false});
          } else {
            response = await getViews(eachClass, {formType: 'Mobile', needV3Content: false});
          }
          this.pcViewList = [];
          this.mobileViewList = [];
          let res = response.data;
          this.reloadView = false;

          // 增加回调视图列表的等待动画遮罩
          this.spinShow = false;

          if (!res.success) {
            this.$Spin.hide();
            this.reloadView = true;
            this.$Message.error('服务繁忙, 表单列表获取失败');
          } else {
            if (res.data.length == 0) {

              let viewTypeName = this.mobileFlag === true ? 'PC' : 'Mobile';
              let defViews = {
                value: "*",
                label: "*",
                formType: viewTypeName
              }
              if(this.mobileFlag === true) {
                this.pcViewList.push(defViews);
              } else {
                this.mobileViewList.push(defViews);
              }
              this.$nextTick(() => {
                this.reloadView = true;
                this.editQuickForm.viewName = "*";
              })

            } else {
              this.editQuickForm.viewName = "";
              this.$nextTick(() => {
                // this.$refs.viewNameSelect.clearSingleSelect();
                // this.$refs.viewNameSelect.setQuery('');
                if(this.mobileFlag === true) {

                  res.data.forEach((val) => {
                    let eachItem = {
                      value: val.oid,
                      label: val.viewName,
                      formType: val.formType
                    };

                    if(val.formType == 'PC') {
                      this.pcViewList.push(eachItem);
                    } else {
                      this.mobileViewList.push(eachItem);
                    }
                  });

                  let viewTypeName = this.mobileFlag === true ? 'PC' : 'Mobile';
                  let defViews = {
                    value: "*",
                    label: "*",
                    formType: viewTypeName
                  }

                  if(this.pcViewList.length == 0) {
                    this.pcViewList.push(defViews);
                  }

                  if(this.mobileViewList.length == 0) {
                    this.mobileViewList.push(defViews);
                  }


                } else {

                  res.data.forEach((val) => {
                    let eachItem = {
                      value: val.oid,
                      label: val.viewName,
                      formType: val.formType
                    };
                    this.mobileViewList.push(eachItem);
                  });

                }
                this.reloadView = true;
                // this.$refs.viewNameSelect.reset();
              })
            }
          }
        }catch (e){
          console.log(e);
          this.$Spin.hide();
        }
      }
    },

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

      // 确认修改
    async confirmFix() {
      this.confirmOprLoading = true;
      if (this.editFlag == 1) {
        try {
          //fix bug 6891
          // if (this.editQuickForm.action == 'global_implement' && this.editQuickForm.radio == "前端脚本") {
          //   if(/this/g.test(this.editQuickForm.content)){
          //     this.$Message.warning('全局前端脚本中不允许this关键字')
          //     setTimeout(() => {
          //       this.confirmOprLoading = false;
          //     }, 0)
          //     return
          //   }
          // }

          let keyWordMap = await this.getKeyWordList();
          if (this.editQuickForm.action == 'global_implement' && this.editQuickForm.radio == "后端脚本") {
            let scriptWithoutSpace = this.editQuickForm.oprScript.implement.server.default.script.replace(/\s/g, '');
            let functionExp = /^function{1}[\S]{1,}\({1}[\S]{0,}\){1}\{{1}[\s\S]{0,}\}{1}$/g;
            if (!(functionExp.test(scriptWithoutSpace))) {
              this.$Message.warning('全局后端脚本语法错误');
              setTimeout(() => {
                this.confirmOprLoading = false;
              }, 0)
              return;
            }
            let keyWordList = this.editQuickForm.oprScript.implement.server.default.script.match(/function{1}\s*\S+\({1}/g);
            keyWordList = keyWordList ? keyWordList.map(item => item.replace('function', '').replace('(', '').trim()) : [];
            if (_.intersection(keyWordList, keyWordMap).length !== 0) {
              this.$Message.warning('全局后端脚本中有后端关键字，请自查一下关键字');
              setTimeout(() => {
                this.confirmOprLoading = false;
              }, 0)
              return;
            }
          }

        } catch (e) {
          console.log(`筛选保留字错误${e}`)
          setTimeout(() => {
            this.confirmOprLoading = false;
          }, 0)
        }

        this.$refs['editQuickForm'].validate(valid => {
          if (!valid && this.mobileFlag) {
            this.$Message.warning('格式有误, 绑定失败');
            setTimeout(() => {
            this.confirmOprLoading = false;
          }, 0)
          } else {
            // 修改快速查询操作
            let finalExpre = null;
            let implementType = '';
            switch (this.editQuickForm.action) {
              case 'url':
                finalExpre = this.editQuickForm.linkUrl;
                break;
              case 'implement':
                finalExpre = this.editQuickForm.content || '';
                switch (this.editQuickForm.radio) {
                  case '插件调用':
                    if (!this.editQuickForm.plugPath || this.editQuickForm.plugPath == 'undefined') {
                      this.$Message.warning('请选择脚本内容');
                      setTimeout(() => {
                        this.confirmOprLoading = false;
                      }, 0)
                      return false;
                    }
                    finalExpre = "addin:" + this.editQuickForm.plugPath;
                    implementType = 'addin';
                    break;
                  case '存储过程':
                    finalExpre = "procedure:" + this.editQuickForm.content;
                    implementType = 'procedure';
                    break;
                  case '后端脚本':
                    this.editQuickForm.oprScript.implement.entry = 'server';
                    implementType = 'serverScript';
                    break;
                  case '前端脚本':
                    this.editQuickForm.oprScript.implement.entry = 'client';
                    implementType = 'clientScript';
                    break;
                  case '插件别名':
                    implementType = 'addinAlias';
                    break;
                  default:
                    break;
                }
                break;
              case 'global_implement':
                finalExpre = this.editQuickForm.content || '';
                switch (this.editQuickForm.radio) {
                  case '后端脚本':
                    this.editQuickForm.oprScript.implement.entry = 'server';
                    implementType = 'serverScript';
                    break;
                  case '前端脚本':
                    this.editQuickForm.oprScript.implement.entry = 'client';
                    implementType = 'clientScript';
                    break;
                  default:
                    break;
                }
                break;
              default:
                if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'next_create') {
                  finalExpre = '';
                } else if (this.editQuickForm.action == 'folder') {
                  finalExpre = '';
                  this.editQuickForm.params = '';
                } else {
                  finalExpre = this.editQuickForm.queryCont;
                }
                break;
            }


            let popParams = {
              needPopTitle: this.editQuickForm.needPopTitle,
              popTitleTxt: this.editQuickForm.popTitleTxt,
              popTitleFs: this.editQuickForm.popTitleFs,
              popTitleColor: this.editQuickForm.popTitleColor,
              tipPlacement: this.editQuickForm.tipPlacement,
              popWidth: this.editQuickForm.popWidth,
              dialogWidth: this.editQuickForm.dialogWidth || 86,
              dialogWidthType: this.editQuickForm.dialogWidthType || '%',
              dialogAutoHeight: this.editQuickForm.dialogAutoHeight,
              dialogHeight: this.editQuickForm.dialogHeight || 400,
              dialogHeightType: this.editQuickForm.dialogHeightType || 'px',
              dragDialog: this.editQuickForm.dragDialog,
              drawerWidth: this.editQuickForm.drawerWidth || 720,
              drawerWidthType: this.editQuickForm.drawerWidthType || 'px'
            };

            // 是否需要默认操作
            let oprObj = {
              needDefaultOpr: this.editQuickForm.needDefaultOpr,
              needDialogDefaultOpr: this.editQuickForm.needDialogDefaultOpr == undefined ? true : this.editQuickForm.needDialogDefaultOpr,
              autoClose: this.editQuickForm.autoClose,
              sysBindOpr: this.sysBindOpr,
              btmIconType: this.editQuickForm.btmIconType,
              btmIconDefColor: this.editQuickForm.btmIconDefColor,
              btmIconActColor: this.editQuickForm.btmIconActColor,
              defImg: this.defImgId,
              actImg: this.actImgId
            }
            switch (this.sysBindOpr){
              case true:
                //如果创建系统操作绑定后处理脚本事件

                break;
              case false:
                //其他事件
                if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'next_create' || this.editQuickForm.action == 'edit' || this.editQuickForm.action == 'visit' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'list') {
                  if (!this.editQuickForm.goal || this.editQuickForm.goal == '' || this.editQuickForm.goal == undefined) {
                    this.$Message.warning("请选择目标类");
                    setTimeout(() => {
                      this.confirmOprLoading = false;
                    }, 0)
                    return
                  } else if (this.editQuickForm.viewName == '' || this.editQuickForm.viewName == undefined) {
                    this.$Message.warning("请选择表单名称");
                    setTimeout(() => {
                      this.confirmOprLoading = false;
                    }, 0)
                    return
                  }
                }
                break;
              default:
                break;
            }
            let fixQuickParams = {
              action: this.editQuickForm.action,
              authority: this.editQuickForm.ename.split(' ').join(''),
              conType: this.editQuickForm.style,
              conditionExpre: finalExpre,
              oprScript: JSON.stringify(this.editQuickForm.oprScript),
              implementType: implementType,
              displayName: this.editQuickForm.cname.split(' ').join(''),
              extSettings: JSON.stringify(oprObj),
              icon: this.editQuickForm.icon || '',
              moduleName: this.editQuickForm.moduleName,
              oid: this.editQuickForm.oid,
              order: this.editQuickForm.targetNumber,
              params: this.editQuickForm.params,
              targetClass: this.editQuickForm.goal ? this.editQuickForm.goal.split("&")[0] || '' : '',
              viewOid: this.editQuickForm.viewName == '*' ? null : this.editQuickForm.viewName,
              viewTitle: this.editQuickForm.viewTitle,
              viewType: JSON.stringify(popParams)
            };
            // 兼容旧数据
            if(this.editQuickForm.viewName == '*') {
              fixQuickParams['viewName'] = '*';
            }
            if(this.editQuickForm.action == 'implement' || this.editQuickForm.action == 'url' || this.editQuickForm.action == 'global_implement') {
              delete fixQuickParams.viewOid
            }

            fixQuickOpe(fixQuickParams).then(res => {
              if (!res.success) {
                this.$Spin.hide();
                this.$Message.warning({
                  content: res.message,
                  duration: 3
                });
                setTimeout(() => {
                  this.confirmOprLoading = false;
                }, 0)
              } else {
                this.editOperation = false;

                this.$refs['editQuickForm'].resetFields();
                this.editQuickForm.action = "create";
                this.editQuickForm.icon = "";
                this.editQuickForm.goal = "";
                this.editQuickForm.viewName = '';
                this.pcViewList = [];
                this.mobileViewList = [];
                this.editQuickForm.radio = "";
                this.editQuickForm.content = '';
                this.editQuickForm.beforeParams = "";
                this.editQuickForm.afterParams = "";
                this.editQuickForm.oprScript = this.generateOprScript();
                this.contentCatch = {
                  serverScript: '',
                  clientScript: '',
                  procedure: ''
                }
                this.reloadGoal = false;
                this.$Message.info({
                  content: "修改成功",
                  duration: 3
                });
                switch (this.sysBindOpr) {
                  case true:
                    //如果创建系统操作绑定后处理脚本事件
                    this.target.onSysBindOprChange(res.data, fixQuickParams);
                    break;
                  case false:
                    if (this.target) this.target.loadQueryOprList().then(() => {
                      this.target.onChange(res.data, fixQuickParams);
                    })
                    let self = this;
                    setTimeout(function () {
                      self.$emit("success-create-queryopr");
                    }, 200)
                    break;
                  default:
                    break;
                }
                setTimeout(() => {
                  this.confirmOprLoading = false;
                }, 0)
              }
            }).catch(e => {
              console.log(e);
              this.$Spin.hide();
              setTimeout(() => {
                this.confirmOprLoading = false;
              }, 0)
            });
          }
        })
      } else if (this.editFlag == 3) {
        //新增
        try {
          let keyWordMap = await this.getKeyWordList();
          if (this.editQuickForm.action == 'global_implement' && this.editQuickForm.radio == "后端脚本") {
            let scriptWithoutSpace = this.editQuickForm.oprScript.implement.server.default.script.replace(/\s/g, '');
            let functionExp = /^function{1}[\S]{1,}\({1}[\S]{0,}\){1}\{{1}[\s\S]{0,}\}{1}$/g;
            if (!(functionExp.test(scriptWithoutSpace))) {
              this.$Message.warning('全局后端脚本语法错误');
              setTimeout(() => {
                this.confirmOprLoading = false;
              }, 0)
              return;
            }
            let keyWordList = this.editQuickForm.oprScript.implement.server.default.script.match(/function{1}\s*\S+\({1}/g);
            keyWordList = keyWordList ? keyWordList.map(item => item.replace('function', '').replace('(', '').trim()) : [];
            if (_.intersection(keyWordList, keyWordMap).length !== 0) {
              this.$Message.warning('全局后端脚本中有后端关键字，请自查一下关键字');
              setTimeout(() => {
                this.confirmOprLoading = false;
              }, 0)
              return;
            }
          }
        } catch (e) {
          console.log(`筛选保留字错误${e}`)
          setTimeout(() => {
            this.confirmOprLoading = false;
          }, 0)
        }
        this.$refs['editQuickForm'].validate((valid) => {
          if ((!valid || this.cnameExist) && this.mobileFlag) {
            this.$Message.warning('格式有误, 绑定失败');
            setTimeout(() => {
            this.confirmOprLoading = false;
          }, 0)
          } else {
            switch (this.sysBindOpr){
              case true:
              //如果创建系统操作绑定后处理脚本事件
                setTimeout(() => {
                  this.confirmOprLoading = false;
                }, 0)
                this.commonFixQope();
              break;
              case false:

              let autoNameFlag = false;
              if(!this.mobileFlag) {
                autoNameFlag = true;
                if(this.editQuickForm.cname == '') {
                  this.$Message.warning("显示名不能为空");
                  setTimeout(() => {
                    this.confirmOprLoading = false;
                  }, 0)
                  return false
                } else if(this.editQuickForm.btmIconType != '系统图标') {
                  if(this.defImgId == '') {
                    this.$Message.warning("请先选择默认图片");
                    setTimeout(() => {
                      this.confirmOprLoading = false;
                    }, 0)
                    return false
                  } else if(this.actImgId == '') {
                    this.$Message.warning("请先选择选中图片");
                    setTimeout(() => {
                      this.confirmOprLoading = false;
                    }, 0)
                    return false
                  }
                }
              }

                //其他事件
                if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'next_create' || this.editQuickForm.action == 'edit' || this.editQuickForm.action == 'visit' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'list') {
                  if (!this.editQuickForm.goal || this.editQuickForm.goal == '' || this.editQuickForm.goal == undefined) {
                    this.$Message.warning("请选择目标类");
                    setTimeout(() => {
                      this.confirmOprLoading = false;
                    }, 0)
                  } else if (this.editQuickForm.viewName == '' || this.editQuickForm.viewName == undefined) {
                    this.$Message.warning("请选择表单名称");
                    setTimeout(() => {
                      this.confirmOprLoading = false;
                    }, 0)
                  } else {
                    this.commonFixQope(autoNameFlag);
                  }
                } else {
                  this.commonFixQope(autoNameFlag);
                }
                break;
              default:
                break;
            }
          }
        })
      } else {
        console.log('fix');
        setTimeout(() => {
            this.confirmOprLoading = false;
          }, 0)
      }
    },

    // 公共更新快速查询操作
    commonFixQope(flag) {
      let finalExpre = null;
      let implementType = '';
      switch (this.editQuickForm.action) {
        case 'url':
          finalExpre = this.editQuickForm.linkUrl;
          break;
        case 'implement':
          finalExpre = this.editQuickForm.content || '';
          switch (this.editQuickForm.radio) {
            case '插件调用':
              if (!this.editQuickForm.plugPath || this.editQuickForm.plugPath == 'undefined') {
                this.$Message.warning('请选择脚本内容');
                setTimeout(() => {
                  this.confirmOprLoading = false;
                }, 0)
                return false;
              }
              finalExpre = "addin:" + this.editQuickForm.plugPath;
              implementType = 'addin';
              break;
            case '存储过程':
              finalExpre = "procedure:" + this.editQuickForm.content;
              implementType = 'procedure';
              break;
            case '后端脚本':
              this.editQuickForm.oprScript.implement.entry = 'server';
              implementType = 'serverScript';
              break;
            case '前端脚本':
              this.editQuickForm.oprScript.implement.entry = 'client';
              implementType = 'clientScript';
              break;
            case '插件别名':
              implementType = 'addinAlias';
              break;
            default:
              break;
          }
          break;
        case 'global_implement':
          finalExpre = this.editQuickForm.content || '';
          switch (this.editQuickForm.radio) {
            case '后端脚本':
              this.editQuickForm.oprScript.implement.entry = 'server';
              implementType = 'serverScript';
              break;
            case '前端脚本':
              this.editQuickForm.oprScript.implement.entry = 'client';
              implementType = 'clientScript';
              break;
            default:
              break;
          }
          break;
        default:
          if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'next_create') {
            finalExpre = '';
          } else if (this.editQuickForm.action == 'folder') {
            finalExpre = '';
            this.editQuickForm.params = '';
          } else {
            finalExpre = this.editQuickForm.queryCont;
          }
          break;
      }


      // 滑窗对象存储
      let popParams = {
        needPopTitle: this.editQuickForm.needPopTitle,
        popTitleTxt: this.editQuickForm.popTitleTxt,
        popTitleFs: this.editQuickForm.popTitleFs,
        popTitleColor: this.editQuickForm.popTitleColor,
        tipPlacement: this.editQuickForm.tipPlacement,
        popWidth: this.editQuickForm.popWidth,
        dialogWidth: this.editQuickForm.dialogWidth,
        dialogWidthType: this.editQuickForm.dialogWidthType,
        dialogAutoHeight: this.editQuickForm.dialogAutoHeight,
        dialogHeight: this.editQuickForm.dialogHeight || 400,
        dialogHeightType: this.editQuickForm.dialogHeightType || 'px',
        dragDialog: this.editQuickForm.dragDialog,
        drawerWidth: this.editQuickForm.drawerWidth || 720,
        drawerWidthType: this.editQuickForm.drawerWidthType || 'px'
      };

      // 扩展字段 *是否需要默认操作
      let oprObj = {
        needDefaultOpr: this.editQuickForm.needDefaultOpr,
        needDialogDefaultOpr: this.editQuickForm.needDialogDefaultOpr == undefined ? true : this.editQuickForm.needDialogDefaultOpr,
        autoClose: this.editQuickForm.autoClose,
        sysBindOpr: this.sysBindOpr,
        btmIconType: this.editQuickForm.btmIconType,
        btmIconDefColor: this.editQuickForm.btmIconDefColor,
        btmIconActColor: this.editQuickForm.btmIconActColor,
        defImg: this.defImgId,
        actImg: this.actImgId
      }

      let fixQuickParams = {
        action: this.editQuickForm.action,
        authority: this.editQuickForm.ename,
        conType: this.editQuickForm.style,
        conditionExpre: finalExpre,
        oprScript: JSON.stringify(this.editQuickForm.oprScript),
        implementType: implementType,
        displayName: this.editQuickForm.cname,
        extSettings: JSON.stringify(oprObj),
        icon: this.editQuickForm.icon || '',
        moduleName: this.editQuickForm.moduleName,
        order: this.editQuickForm.targetNumber,
        params: this.editQuickForm.params,
        targetClass: this.editQuickForm.goal != undefined ? this.editQuickForm.goal.split("&")[0] : '',
        viewOid: this.editQuickForm.viewName == '*' ? null : this.editQuickForm.viewName,
        viewTitle: this.editQuickForm.viewTitle,
        viewType: JSON.stringify(popParams)
      };
      // 兼容旧数据
      if(this.editQuickForm.viewName == '*') {
        fixQuickParams['viewName'] = '*';
      }
      if(this.editQuickForm.action == 'implement' || this.editQuickForm.action == 'url' || this.editQuickForm.action == 'global_implement') {
        delete fixQuickParams.viewOid
      }

      createQuickOpe(fixQuickParams, flag)
        .then(res => {
          if (!res.success) {
            this.$Message.error(res.message);
            setTimeout(() => {
              this.confirmOprLoading = false;
            }, 0)
          } else {
            this.editOperation = false;
            this.reloadGoal = false;
            this.$Message.info({
              content: "操作成功",
              duration: 3
            });

            switch (this.sysBindOpr) {
              case true:
                //如果创建系统操作绑定后处理脚本事件
                this.target.onSysBindOprChange(res.data, fixQuickParams);
                break;
              case false:
                if (this.target) this.target.loadQueryOprList().then(() => {
                  this.target.onChange(res.data, fixQuickParams);
                })
                let self = this;
                setTimeout(function () {
                  self.$emit("success-create-queryopr");
                }, 100)
                break;
              default:
                break;
            }
            this.$refs['editQuickForm'].resetFields();
            setTimeout(() => {
              this.confirmOprLoading = false;
            }, 0)
          }
        })
        .catch(e => {
          console.log(e);
          this.$Spin.hide();
          setTimeout(() => {
            this.confirmOprLoading = false;
          }, 0)
        });
    },

    //初始化actionList
    initActionList(action) {
      this.actionList = action == 'global_implement' ?
        [
          {
            value: "global_implement",
            label: "全局脚本"
          },
        ] : [
          {
            value: "create",
            label: "单对象创建"
          },
          {
            value: "next_create",
            label: "级联创建"
          },
          {
            value: "url",
            label: "外部链接"
          },
          {
            value: "implement",
            label: "操作实现"
          },
          {
            value: "edit",
            label: "单对象编辑"
          },
          {
            value: "visit",
            label: "单对象浏览"
          },
        ]
    },

    // 创建快速查询操纵
    createBindQuick(bindPoint, target, mFlag) {
      this.editOperationTitle = '操作配置';
      this.sysBindOpr = false;
      this.reloadGoal = true;
      // 只有当添加时间为 悬停 或者 失焦时，操作样式才可选择浮窗样式
      this.target = target;
      if (this.target != undefined) {
        if (target.form_json != undefined) {
          // try {
          //   this.idTree = this.getTree(target.form_json.data);
          // } catch (error) {
          //   this.idTree = [];
          // }
          this.idTree = this.getTree(target.form_json.data);
        }
        this.resetQuickStyle(this.target.opr_name);

      }

      if(mFlag && mFlag == 'Mobile') {

        this.mobileFlag = false;
        this.confirmOprLoading = false;
        this.showdefImg = false;
        this.showActImg = false;

        this.editQuickForm.btmIconDefColor = '#646566';
        this.editQuickForm.btmIconActColor = '#1989fa';
        this.editQuickForm.defImg = null;
        this.editQuickForm.actImg = null;

        this.editQuickForm.btmIconType = '系统图标';

      }

      this.isGlobalImplement = false;

      this.contentCatch = {
        serverScript: '',
        clientScript: '',
        procedure: ''
      }

      this.initActionList();
      this.editQuickForm.radio = "";
      this.editQuickForm.content = "";
      this.resetContent = false;
      let self = this;
      setTimeout(() => {
        self.resetContent = true;
      }, 100)

      this.bindModal = false;
      this.createBindModal = false;
      if (this.$refs["editQuickForm"] !== undefined) {
        this.$refs["editQuickForm"].resetFields();
      }
      // this.$refs["editQuickForm"].resetFields();
      // this.$refs["selectGoal"].clearSingleSelect();
      this.editQuickForm.action = "create";
      this.editorType = 'beforeScript';
      this.editorOprType = 'defaultScript';
      this.editQuickForm.beforeParams = "";
      this.editQuickForm.afterParams = "";
      this.editQuickForm.defaultParams = "";
      this.editQuickForm.needDefaultOpr = false;
      this.editQuickForm.needDialogDefaultOpr = true;
      this.editQuickForm.autoClose = 'auto';
      this.editQuickForm.goal = "";
      this.editQuickForm.radio = "后端脚本";
      this.editQuickForm.content = "";
      this.editQuickForm.plugPath = '';
      this.editQuickForm.needPopTitle = false;
      this.editQuickForm.popTitleTxt = '提示';
      this.editQuickForm.popTitleFs = 14;
      this.editQuickForm.popTitleColor = '#333';
      this.editQuickForm.tipPlacement = 'right';
      this.editQuickForm.popWidth = 400;
      this.editQuickForm.dialogWidth = 86;
      this.editQuickForm.dialogWidthType = '%';
      this.editQuickForm.dialogAutoHeight = true;
      this.editQuickForm.dialogHeight = 400;
      this.editQuickForm.dialogHeightType = 'px';
      this.editQuickForm.dragDialog = false;
      this.editQuickForm.drawerWidth = 720;
      this.editQuickForm.drawerWidthType = 'px';
      // this.editQuickForm.icon = "";
      this.editQuickForm.moduleName = bindPoint;
      this.editOperation = true;
      this.editFlag = 3;
      this.$nextTick(() => {

        if(this.mobileFlag) {
          this.editQuickForm.icon = this.iconList[0].value;
        } else {
          this.editQuickForm.icon = this.vList[0].value;
        }
        console.log(this.editQuickForm.icon)

      })
      this.editQuickForm.oprScript = this.generateOprScript();

      this.disEname = false;
      this.queryOprId = '';
      this.cnameExist = false;
      this.dnameExist = false;
      this.pcViewList = [];
      this.mobileViewList = [];
      if(target && target.customAction){
        this.editQuickForm.action = this.customAction = target.customAction
      }else{
        this.customAction = '';
      }
    },

    // 创建全局脚本
    createBindGlobalQuick(bindPoint, target) {
      this.editOperationTitle = '全局脚本';
      this.sysBindOpr = false;
      if (this.$refs["editQuickForm"] !== undefined) {
        this.$refs["editQuickForm"].resetFields();
      }
      this.reloadGoal = true;
      this.$nextTick(() => {
        this.isGlobalImplement = true;
        this.target = target;
        this.contentCatch = {
          serverScript: '',
          clientScript: '',
          procedure: ''
        }
        this.initActionList('global_implement');
        this.editQuickForm.radio = "";
        this.editQuickForm.content = "";
        this.resetContent = false;
        let self = this;
        setTimeout(() => {
          self.resetContent = true;
        }, 100)
        // 只有当添加时间为 悬停 或者 失焦时，操作样式才可选择浮窗样式
        if (this.target != undefined) this.resetQuickStyle(this.target.opr_name);

        this.bindModal = false;
        this.createBindModal = false;
        // this.$refs["editQuickForm"].resetFields();
        // this.$refs["selectGoal"].clearSingleSelect();
        this.editQuickForm.action = "global_implement";
        this.editQuickForm.needDefaultOpr = false;
        this.editQuickForm.needDialogDefaultOpr = true;
        this.editQuickForm.autoClose = 'auto';
        this.editQuickForm.goal = "";
        this.editQuickForm.radio = "后端脚本";
        this.editQuickForm.content = "";
        this.editQuickForm.needPopTitle = false;
        this.editQuickForm.popTitleTxt = '提示';
        this.editQuickForm.popTitleFs = 14;
        this.editQuickForm.popTitleColor = '#333';
        this.editQuickForm.tipPlacement = 'right';
        this.editQuickForm.popWidth = 400;
        this.editQuickForm.dialogWidth = 86;
        this.editQuickForm.dialogWidthType = '%';
        this.editQuickForm.dialogAutoHeight = true;
        this.editQuickForm.dialogHeight = 400;
        this.editQuickForm.dialogHeightType = 'px';
        this.editQuickForm.dragDialog = false;
        this.editQuickForm.drawerWidth = 720;
        this.editQuickForm.drawerWidthType = 'px';
        this.editQuickForm.icon = "";
        this.editQuickForm.moduleName = bindPoint;
        this.editFlag = 3;
        if(this.mobileFlag) {
          this.editQuickForm.icon = this.iconList[0].value;
        } else {
          this.editQuickForm.icon = this.vList[0].value;
        }
        this.editQuickForm.oprScript = this.generateOprScript();
        this.disEname = false;
        this.queryOprId = '';
        this.cnameExist = false;
        this.dnameExist = false;
      })
      this.editOperation = true;
    },

    //重设事件style
    resetQuickStyle(oName) {

      let tipList = [];

      if (oName == "tip" || oName == "鼠标悬停" || oName == "获得焦点") {
        tipList = [{
          value: "dialog",
          label: "dialog | 弹窗"
        },
          {
            value: "tab",
            label: "tab | 页签"
          },
          {
            value: "drawerR",
            label: "drawer | 右侧滑窗"
          },
          {
            value: "drawerL",
            label: "drawer | 左侧滑窗"
          },
          {
            value: "tip",
            label: "tip | 浮窗"
          }]

      } else {
        tipList = [{
          value: "dialog",
          label: "dialog | 弹窗"
        },
          {
            value: "tab",
            label: "tab | 页签"
          },
          {
            value: "drawerR",
            label: "drawer | 右侧滑窗"
          },
          {
            value: "drawerL",
            label: "drawer | 左侧滑窗"
          }]
      }

      this.quickStyle = tipList;
    },

    // 编辑快速查询操作
    editBindQuick(queryOprId, target, mFlag) {
      this.reloadGoal = true;
      this.sysBindOpr = false;
      this.editOperationTitle = '操作配置';
      // 只有当添加事件为 悬停 或者 失焦时，操作样式才可选择浮窗样式
      this.target = target;
      if (this.target != undefined) {
        if (target.form_json != undefined) {
          // this.idTree = this.getTree(target.form_json.data);
          try {
            this.idTree = this.getTree(target.form_json.data);
          } catch (error) {
            this.idTree = [];
          }
          this.resetQuickStyle(this.target.opr_name);
        }
      }

      if(mFlag && mFlag == 'Mobile') {
        console.log(mFlag)

        this.mobileFlag = false;
        this.showdefImg = false;
        this.showActImg = false;
        this.editQuickForm.defImg = null;
        this.editQuickForm.actImg = null;

      }

      this.contentCatch = {
        serverScript: '',
        clientScript: '',
        procedure: ''
      }
      this.editQuickForm.radio = '';

      if (this.$refs["editQuickForm"] !== undefined) {
        this.$refs["editQuickForm"].resetFields();
      }
      if (this.$refs["selectGoal"] !== undefined) {
        this.$refs["selectGoal"].clearSingleSelect();
      }

      // this.$refs["selectGoal"].clearSingleSelect();
      this.editOperation = true;
      getQuickOpeById(queryOprId).then(async result => {
        if(!result.data){
          this.$Message.error('操作有可能已被删除，请关闭弹窗重新绑定事件');
          return
        }
        result = result.data;
        await this.changeView(result.targetClass);
        this.editFlag = 1;
        this.disEname = true;
        this.queryOprId = queryOprId;
        this.editQuickForm.ename = result.authority;
        this.editQuickForm.cname = result.displayName;
        this.editQuickForm.moduleName = result.moduleName;
        this.editQuickForm.icon = result.icon;
        this.editQuickForm.goal = result.targetClass;
        this.initActionList(result.action);
        this.editQuickForm.action = result.action == 'list' ? 'visit' : result.action == 'creates' ? 'create' : result.action;
        this.editQuickForm.oid = result.oid;
        this.editQuickForm.targetNumber = result.order;
        this.editQuickForm.style = result.conType;
        this.editQuickForm.viewTitle = result.viewTitle;
        if(this.mobileFlag === true) {

          if((this.pcViewList && this.pcViewList[0] && this.pcViewList[0].value !== '*') && (this.mobileViewList && this.mobileViewList[0] && this.mobileViewList[0].value !== '*') && result.viewName === '*') {
            this.editQuickForm.viewName = '';
          } else {

            if(result.viewName === '*') {
              this.editQuickForm.viewName = '*';
            } else {
              this.editQuickForm.viewName = result.viewOid || '';
            }

          }

        } else {

          if(this.mobileViewList && this.mobileViewList[0] && this.mobileViewList[0].value !== '*' && result.viewName === '*') {
            this.editQuickForm.viewName = '';
          } else {

            if(result.viewName === '*') {
              this.editQuickForm.viewName = '*';
            } else {
              this.editQuickForm.viewName = result.viewOid || '';
            }

          }
        }
        this.editQuickForm.params = result.params;
        //fix bug 6149如果为implement类型设置条件表达式为''
        this.editQuickForm.queryCont = this.editQuickForm.action !== 'implement' ? result.conditionExpre : '';

        if (result.viewType != '' && result.viewType != undefined) {

          let parsePop = JSON.parse(result.viewType);

          this.editQuickForm.needPopTitle = parsePop.needPopTitle;
          this.editQuickForm.popTitleTxt = parsePop.popTitleTxt;
          this.editQuickForm.popTitleFs = parsePop.popTitleFs;
          this.editQuickForm.popTitleColor = parsePop.popTitleColor;
          this.editQuickForm.tipPlacement = parsePop.tipPlacement;
          this.editQuickForm.popWidth = parsePop.popWidth;
          this.editQuickForm.dialogWidth = parsePop.dialogWidth || 86;
          this.editQuickForm.dialogWidthType = parsePop.dialogWidthType || '%';
          this.editQuickForm.dialogAutoHeight = parsePop.dialogAutoHeight === undefined ? true : parsePop.dialogAutoHeight;
          this.editQuickForm.dialogHeight = parsePop.dialogHeight || 400;
          this.editQuickForm.dialogHeightType = parsePop.dialogHeightType || 'px';
          this.editQuickForm.dragDialog = parsePop.dragDialog || false;
          this.editQuickForm.drawerWidth = parsePop.drawerWidth || 720;
          this.editQuickForm.drawerWidthType = parsePop.drawerWidthType || '%';
        }

        if (result.extSettings != '' && result.extSettings != undefined) {

          let parsePop = JSON.parse(result.extSettings);
          this.editQuickForm.needDefaultOpr = parsePop.needDefaultOpr;
          this.editQuickForm.needDialogDefaultOpr = parsePop.needDialogDefaultOpr == undefined ? true : parsePop.needDialogDefaultOpr;
          this.editQuickForm.autoClose = parsePop.autoClose;
          if (mFlag && mFlag == 'Mobile') {

            this.editQuickForm.btmIconType = parsePop.btmIconType || '系统图标';
            this.editQuickForm.btmIconDefColor = parsePop.btmIconDefColor || '#aaa';
            this.editQuickForm.btmIconActColor = parsePop.btmIconActColor || '#2D8CF0';
            this.defImgId = parsePop.defImg;
            this.actImgId = parsePop.actImg;
            this.editQuickForm.defImg = `${this.baseUrl}/files-download/${parsePop.defImg}` || null;
            this.editQuickForm.actImg = `${this.baseUrl}/files-download/${parsePop.actImg}` || null;

            if(parsePop.defImg) {
              this.showdefImg = true;
            }
            if(parsePop.actImg) {
              this.showActImg = true;
            }

          } else {
            this.sysBindOpr = parsePop.sysBindOpr;
          }

        }

        let _style = this.quickStyle.filter(x => x.value == this.editQuickForm.style);
        if (_style.length == 0) this.editQuickForm.style = "dialog";
        this.editQuickForm.oprScript = result.oprScript ? JSON.parse(result.oprScript) : null;
        //兼容oprScript之前的写法
        if (!this.editQuickForm.oprScript) {
          this.editQuickForm.oprScript = this.generateOprScript();
          let _params = this.editQuickForm.params.split('APP_afterScript:');
          this.editQuickForm.oprScript.appBefore.client.default.script = _params[0].replace("APP_beforeScript:", "");
          this.editQuickForm.oprScript.appAfter.client.default.script = _params.length > 1 ? _params[1].replace('APP_defaultScript:', '') : '';
          if (this.editQuickForm.oprScript.appBefore.client.default.script != '') {
            this.editorType = 'beforeScript';
          } else if (this.editQuickForm.oprScript.appAfter.client.default.script != '') {
            this.editorType = 'afterScript';
          }
          if (result.conditionExpre.indexOf('addin:') != -1) {
            this.editQuickForm.radio = '插件调用';
          } else if (result.conditionExpre.indexOf('serverScript:') != -1) {
            this.editQuickForm.radio = '后端脚本';
            result.conditionExpre = result.conditionExpre.slice(13);
            this.contentCatch['serverScript'] = result.conditionExpre;
            this.editQuickForm.oprScript.implement.entry === 'server'
            this.editQuickForm.oprScript.implement.server.default.script = result.conditionExpre;
          } else if (result.conditionExpre.indexOf('clientScript:') != -1) {
            this.editQuickForm.radio = '前端脚本';
            result.conditionExpre = result.conditionExpre.slice(13);
            this.contentCatch['clientScript'] = result.conditionExpre;
            this.editQuickForm.oprScript.implement.entry === 'client'
            this.editQuickForm.oprScript.implement.client.default.script = result.conditionExpre;
          } else if (result.conditionExpre.indexOf('procedure:') != -1) {
            this.editQuickForm.radio = '存储过程';
            result.conditionExpre = result.conditionExpre.slice(10);
            this.contentCatch['procedure'] = result.conditionExpre;
          } else {
            this.editQuickForm.radio = '插件别名';
          }
        } else {
          switch (result.implementType){
            case 'addin':
              this.editQuickForm.radio = '插件调用';
              break;
            case 'addinAlias':
              this.editQuickForm.radio = '插件别名';
              break;
            case 'clientScript':
              this.editQuickForm.radio = '前端脚本';
              result.conditionExpre = result.conditionExpre.slice(13);
              this.contentCatch['clientScript'] = result.conditionExpre;
              break;
            case 'serverScript':
              this.editQuickForm.radio = '后端脚本';
              result.conditionExpre = result.conditionExpre.slice(13);
              this.contentCatch['serverScript'] = result.conditionExpre;
              break;
            case 'procedure':
              this.editQuickForm.radio = '存储过程';
              result.conditionExpre = result.conditionExpre.slice(10);
              this.contentCatch['procedure'] = result.conditionExpre;
              break;
            default:
              this.editQuickForm.radio = '插件别名';
              break;
          }
        }

        this.$nextTick(() => {
          this.editQuickForm.content = result.conditionExpre;
        })
        let temPath = result.conditionExpre.indexOf('addin:') != -1 ? result.conditionExpre.substring(6, result.conditionExpre.length) : '';
        let finalTemPath = this.plugList.findIndex(p => {
          return p.value == temPath
        })
        if(finalTemPath != -1) {
          this.editQuickForm.plugPath = temPath;
        } else {
          this.editQuickForm.plugPath = '';
        }

        let finalEclass = result.targetClass + "&e";
        // let finalRclass = result.targetClass + "&r";
        let finalREclass = result.targetClass + "&re";
        let isEtype = this.entitiesList.findIndex((el, index, arr) => {
          return el.value == finalEclass;
        })
        let isREtype = this.relationsList.findIndex((el, index, arr) => {
          return el.value == finalREclass;
        })
        if (isEtype != -1) {
          this.editQuickForm.goal = finalEclass;
        } else if (isREtype != -1) {
          this.editQuickForm.goal = finalREclass;
        }
        //fix bug 5353如果不为url类型设置条件表达式为''
        this.editQuickForm.linkUrl = this.editQuickForm.action === 'url' ? result.conditionExpre : '';
        this.editQuickForm.opePath = result.conditionExpre;
        if(target && target.customAction){
          this.customAction = target.customAction;
        }else{
          this.customAction = '';
        }

        this.$nextTick(() => {
          this.editOperation = true;
        })
      }).catch(e => {
        console.log(e);
      });
    },

    /**
    *@description
    *@params
    *@date 2021/2/22
    *@return
    */
    editBindGlobalQuick(queryOprId, target) {
      this.reloadGoal = true;
      this.sysBindOpr = false;
      this.editOperationTitle = '全局脚本';
      // 只有当添加事件为 悬停 或者 失焦时，操作样式才可选择浮窗样式
      this.target = target;
      if (this.target != undefined) {
        if (target.form_json != undefined) {
          // this.idTree = this.getTree(target.form_json.data);
          try {
            this.idTree = this.getTree(target.form_json.data);
          } catch (error) {
            this.idTree = [];
          }
          this.resetQuickStyle(this.target.opr_name);
        }
      }

      this.contentCatch = {
        serverScript: '',
        clientScript: '',
        procedure: ''
      }
      this.editQuickForm.radio = '';

      if (this.$refs["editQuickForm"] !== undefined) {
        this.$refs["editQuickForm"].resetFields();
      }

      // this.$refs["selectGoal"].clearSingleSelect();
      this.editOperation = true;
      getQuickOpeById(queryOprId).then(async result => {
        result = result.data;
        await this.changeView(result.targetClass);
        this.editFlag = 1;
        this.disEname = true;
        this.queryOprId = queryOprId;
        this.editQuickForm.ename = result.authority;
        this.editQuickForm.cname = result.displayName;
        this.editQuickForm.moduleName = result.moduleName;
        this.editQuickForm.icon = result.icon;
        this.editQuickForm.goal = result.targetClass;
        this.initActionList(result.action);
        this.editQuickForm.action = result.action == 'list' ? 'visit' : result.action == 'creates' ? 'create' : result.action;
        this.editQuickForm.oid = result.oid;
        this.editQuickForm.targetNumber = result.order;
        this.editQuickForm.style = result.conType;
        this.editQuickForm.viewTitle = result.viewTitle;
        if(this.mobileFlag === true) {

          if((this.pcViewList && this.pcViewList[0] && this.pcViewList[0].value !== '*') && (this.mobileViewList && this.mobileViewList[0] && this.mobileViewList[0].value !== '*') && result.viewName === '*') {
            this.editQuickForm.viewName = '';
          } else {

            if(result.viewName === '*') {
              this.editQuickForm.viewName = '*';
            } else {
              this.editQuickForm.viewName = result.viewOid || '';
            }

          }

        } else {

          if(this.mobileViewList && this.mobileViewList[0] && this.mobileViewList[0].value !== '*' && result.viewName === '*') {
            this.editQuickForm.viewName = '';
          } else {

            if(result.viewName === '*') {
              this.editQuickForm.viewName = '*';
            } else {
              this.editQuickForm.viewName = result.viewOid || '';
            }

          }

        }
        this.editQuickForm.params = result.params;
        //fix bug 6149如果为implement类型设置条件表达式为''
        this.editQuickForm.queryCont = this.editQuickForm.action !== 'implement' ? result.conditionExpre : '';

        if (result.viewType != '' && result.viewType != undefined) {

          let parsePop = JSON.parse(result.viewType);

          this.editQuickForm.needPopTitle = parsePop.needPopTitle;
          this.editQuickForm.popTitleTxt = parsePop.popTitleTxt;
          this.editQuickForm.popTitleFs = parsePop.popTitleFs;
          this.editQuickForm.popTitleColor = parsePop.popTitleColor;
          this.editQuickForm.tipPlacement = parsePop.tipPlacement;
          this.editQuickForm.popWidth = parsePop.popWidth;
          this.editQuickForm.dialogWidth = parsePop.dialogWidth || 80;
          this.editQuickForm.dialogWidthType = parsePop.dialogWidthType || '%';
          this.editQuickForm.dialogAutoHeight = parsePop.dialogAutoHeight === undefined ? true : parsePop.dialogAutoHeight;
          this.editQuickForm.dialogHeight = parsePop.dialogHeight || 400;
          this.editQuickForm.dialogHeightType = parsePop.dialogHeightType || 'px';
          this.editQuickForm.dragDialog = parsePop.dragDialog || false;
          this.editQuickForm.drawerWidth = parsePop.drawerWidth || 80;
          this.editQuickForm.drawerWidthType = parsePop.drawerWidthType || '%';
        }

        if (result.extSettings != '' && result.extSettings != undefined) {

          let parsePop = JSON.parse(result.extSettings);
          this.editQuickForm.needDefaultOpr = parsePop.needDefaultOpr;
          this.editQuickForm.needDialogDefaultOpr = parsePop.needDialogDefaultOpr == undefined ? true : parsePop.needDialogDefaultOpr;
          this.editQuickForm.autoClose = parsePop.autoClose;
          this.sysBindOpr = parsePop.sysBindOpr;
        }

        let _style = this.quickStyle.filter(x => x.value == this.editQuickForm.style);
        if (_style.length == 0) this.editQuickForm.style = "dialog";
        this.editQuickForm.oprScript = result.oprScript ? JSON.parse(result.oprScript) : null;

          //兼容oprScript之前的写法
        if (!this.editQuickForm.oprScript) {
          this.editQuickForm.oprScript = this.generateOprScript();
          let _params = this.editQuickForm.params.split('APP_afterScript:');
          this.editQuickForm.oprScript.appBefore.client.default.script = _params[0].replace("APP_beforeScript:", "");
          this.editQuickForm.oprScript.appAfter.client.default.script = _params.length > 1 ? _params[1].replace('APP_defaultScript:', '') : '';
          if (this.editQuickForm.oprScript.appBefore.client.default.script != '') {
            this.editorType = 'beforeScript';
          } else if (this.editQuickForm.oprScript.appAfter.client.default.script != '') {
            this.editorType = 'afterScript';
          }
          if (result.conditionExpre.indexOf('addin:') != -1) {
            this.editQuickForm.radio = '插件调用';
          } else if (result.conditionExpre.indexOf('serverScript:') != -1) {
            this.editQuickForm.radio = '后端脚本';
            result.conditionExpre = result.conditionExpre.slice(13);
            this.contentCatch['serverScript'] = result.conditionExpre;
            this.editQuickForm.oprScript.implement.entry === 'server'
            this.editQuickForm.oprScript.implement.server.default.script = result.conditionExpre;
          } else if (result.conditionExpre.indexOf('clientScript:') != -1) {
            this.editQuickForm.radio = '前端脚本';
            result.conditionExpre = result.conditionExpre.slice(13);
            this.contentCatch['clientScript'] = result.conditionExpre;
            this.editQuickForm.oprScript.implement.entry === 'client'
            this.editQuickForm.oprScript.implement.client.default.script = result.conditionExpre;
          } else if (result.conditionExpre.indexOf('procedure:') != -1) {
            this.editQuickForm.radio = '存储过程';
            result.conditionExpre = result.conditionExpre.slice(10);
            this.contentCatch['procedure'] = result.conditionExpre;
          } else {
            this.editQuickForm.radio = '插件别名';
          }
        } else {
          switch (result.implementType){
            case 'addin':
              this.editQuickForm.radio = '插件调用';
              break;
            case 'addinAlias':
              this.editQuickForm.radio = '插件别名';
              break;
            case 'clientScript':
              this.editQuickForm.radio = '前端脚本';
              result.conditionExpre = result.conditionExpre.slice(13);
              this.contentCatch['clientScript'] = result.conditionExpre;
              break;
            case 'serverScript':
              this.editQuickForm.radio = '后端脚本';
              result.conditionExpre = result.conditionExpre.slice(13);
              this.contentCatch['serverScript'] = result.conditionExpre;
              break;
            case 'procedure':
              this.editQuickForm.radio = '存储过程';
              result.conditionExpre = result.conditionExpre.slice(10);
              this.contentCatch['procedure'] = result.conditionExpre;
              break;
            default:
              break;
          }
        }

        this.$nextTick(() => {
          this.editQuickForm.content = result.conditionExpre;
        })
        let temPath = result.conditionExpre.indexOf('addin:') != -1 ? result.conditionExpre.substring(6, result.conditionExpre.length) : '';
        let finalTemPath = this.plugList.findIndex(p => {
          return p.value == temPath
        })
        if (finalTemPath != -1) {
          this.editQuickForm.plugPath = temPath;
        } else {
          this.editQuickForm.plugPath = '';
        }

        let finalEclass = result.targetClass + "&e";
        // let finalRclass = result.targetClass + "&r";
        let finalREclass = result.targetClass + "&re";
        let isEtype = this.entitiesList.findIndex((el, index, arr) => {
          return el.value == finalEclass;
        })
        // let isRtype = this.resourcesList.findIndex((el, index, arr) => {
        //   return el.value == finalRclass;
        // })
        let isREtype = this.relationsList.findIndex((el, index, arr) => {
          return el.value == finalREclass;
        })
        if (isEtype != -1) {
          this.editQuickForm.goal = finalEclass;
        } else if (isREtype != -1) {
          this.editQuickForm.goal = finalREclass;
        }
        //fix bug 5353如果不为url类型设置条件表达式为''
        this.editQuickForm.linkUrl = this.editQuickForm.action === 'url' ? result.conditionExpre : '';
        this.editQuickForm.opePath = result.conditionExpre;

        this.editOperation = true;
        if (target && target.customAction) {
          this.customAction = target.customAction;
        } else {
          this.customAction = '';
        }
      })
    },

    /**
     *@description编辑系统操作绑定的后处理脚本操作
     *@params
     *@date 2021/1/5
     *@return
     */
    editBindSys(bindOprId, bindPoint, target) {
      this.reloadGoal = true;
      this.sysBindOpr = true;
      this.target = target;
      if (this.target != undefined) {
        if (target.form_json != undefined) {
          try {
            this.idTree = this.getTree(target.form_json.data);
          } catch (error) {
            this.idTree = [];
          }
          this.resetQuickStyle(this.target.opr_name);
        }
      }

      this.contentCatch = {
        serverScript: '',
        clientScript: '',
        procedure: ''
      }
      this.editQuickForm.radio = '';

      if (this.$refs["editQuickForm"] !== undefined) {
        this.$refs["editQuickForm"].resetFields();
      }
      this.editOperation = true;
      if (bindOprId) {
        getQuickOpeById(bindOprId).then(async result => {
          if (result.data) {
            result = result.data;
            await this.changeView(result.targetClass);
            this.editFlag = 1;
            this.queryOprId = bindOprId;
            this.editQuickForm.ename = result.authority;
            this.editQuickForm.cname = result.displayName;
            this.editQuickForm.moduleName = result.moduleName;
            this.editQuickForm.icon = result.icon;
            this.editQuickForm.goal = result.targetClass;
            this.initActionList(result.action);
            this.editQuickForm.action = result.action == 'list' ? 'visit' : result.action == 'creates' ? 'create' : result.action;
            this.editQuickForm.oid = result.oid;
            this.editQuickForm.targetNumber = result.order;
            this.editQuickForm.style = result.conType;
            this.editQuickForm.viewTitle = result.viewTitle;
            if(this.mobileFlag === true) {

              if((this.pcViewList && this.pcViewList[0] && this.pcViewList[0].value !== '*') && (this.mobileViewList && this.mobileViewList[0] && this.mobileViewList[0].value !== '*') && result.viewName === '*') {
                this.editQuickForm.viewName = '';
              } else {

                if(result.viewName === '*') {
                  this.editQuickForm.viewName = '*';
                } else {
                  this.editQuickForm.viewName = result.viewOid || '';
                }

              }

            } else {

              if(this.mobileViewList && this.mobileViewList[0] && this.mobileViewList[0].value !== '*' && result.viewName === '*') {
                this.editQuickForm.viewName = '';
              } else {

                if(result.viewName === '*') {
                  this.editQuickForm.viewName = '*';
                } else {
                  this.editQuickForm.viewName = result.viewOid || '';
                }

              }

            }
            this.editQuickForm.params = result.params;
            //fix bug 6149如果为implement类型设置条件表达式为''
            this.editQuickForm.queryCont = this.editQuickForm.action !== 'implement' ? result.conditionExpre : '';

            if (result.viewType != '' && result.viewType != undefined) {

              let parsePop = JSON.parse(result.viewType);

              this.editQuickForm.needPopTitle = parsePop.needPopTitle;
              this.editQuickForm.popTitleTxt = parsePop.popTitleTxt;
              this.editQuickForm.popTitleFs = parsePop.popTitleFs;
              this.editQuickForm.popTitleColor = parsePop.popTitleColor;
              this.editQuickForm.tipPlacement = parsePop.tipPlacement;
              this.editQuickForm.popWidth = parsePop.popWidth;
              this.editQuickForm.dialogWidth = parsePop.dialogWidth || 80;
              this.editQuickForm.dialogWidthType = parsePop.dialogWidthType || '%';
              this.editQuickForm.dialogAutoHeight = parsePop.dialogAutoHeight === undefined ? true : parsePop.dialogAutoHeight;
              this.editQuickForm.dialogHeight = parsePop.dialogHeight || 400;
              this.editQuickForm.dialogHeightType = parsePop.dialogHeightType || 'px';
              this.editQuickForm.dragDialog = parsePop.dragDialog || false;
              this.editQuickForm.drawerWidth = parsePop.drawerWidth || 80;
              this.editQuickForm.drawerWidthType = parsePop.drawerWidthType || '%';
            }

            if (result.extSettings != '' && result.extSettings != undefined) {

              let parsePop = JSON.parse(result.extSettings);
              this.editQuickForm.needDefaultOpr = parsePop.needDefaultOpr;
              this.editQuickForm.needDialogDefaultOpr = parsePop.needDialogDefaultOpr == undefined ? true : parsePop.needDialogDefaultOpr;
              this.editQuickForm.autoClose = parsePop.autoClose;
            }

            let _style = this.quickStyle.filter(x => x.value == this.editQuickForm.style);
            if (_style.length == 0) this.editQuickForm.style = "dialog";

            this.editQuickForm.oprScript = result.oprScript ? JSON.parse(result.oprScript) : null;
            //兼容oprScript之前的写法
            if (!this.editQuickForm.oprScript) {
              this.editQuickForm.oprScript = this.generateOprScript();
              let _params = this.editQuickForm.params.split('APP_afterScript:');
              this.editQuickForm.oprScript.appBefore.client.default.script = _params[0].replace("APP_beforeScript:", "");
              this.editQuickForm.oprScript.appAfter.client.default.script = _params.length > 1 ? _params[1].replace('APP_defaultScript:', '') : '';
              if (this.editQuickForm.oprScript.appBefore.client.default.script != '') {
                this.editorType = 'beforeScript';
              } else if (this.editQuickForm.oprScript.appAfter.client.default.script != '') {
                this.editorType = 'afterScript';
              }
              if (result.conditionExpre.indexOf('addin:') != -1) {
                this.editQuickForm.radio = '插件调用';
              } else if (result.conditionExpre.indexOf('serverScript:') != -1) {
                this.editQuickForm.radio = '后端脚本';
                result.conditionExpre = result.conditionExpre.slice(13);
                this.contentCatch['serverScript'] = result.conditionExpre;
                this.editQuickForm.oprScript.implement.entry === 'server'
                this.editQuickForm.oprScript.implement.server.default.script = result.conditionExpre;
              } else if (result.conditionExpre.indexOf('clientScript:') != -1) {
                this.editQuickForm.radio = '前端脚本';
                result.conditionExpre = result.conditionExpre.slice(13);
                this.contentCatch['clientScript'] = result.conditionExpre;
                this.editQuickForm.oprScript.implement.entry === 'client'
                this.editQuickForm.oprScript.implement.client.default.script = result.conditionExpre;
              } else if (result.conditionExpre.indexOf('procedure:') != -1) {
                this.editQuickForm.radio = '存储过程';
                result.conditionExpre = result.conditionExpre.slice(10);
                this.contentCatch['procedure'] = result.conditionExpre;
              } else {
                this.editQuickForm.radio = '插件别名';
              }
            } else {
              switch (result.implementType){
                case 'addin':
                  this.editQuickForm.radio = '插件调用';
                  break;
                case 'addinAlias':
                  this.editQuickForm.radio = '插件别名';
                  break;
                case 'clientScript':
                  this.editQuickForm.radio = '前端脚本';
                  result.conditionExpre = result.conditionExpre.slice(13);
                  this.contentCatch['clientScript'] = result.conditionExpre;
                  break;
                case 'serverScript':
                  this.editQuickForm.radio = '后端脚本';
                  result.conditionExpre = result.conditionExpre.slice(13);
                  this.contentCatch['serverScript'] = result.conditionExpre;
                  break;
                case 'procedure':
                  this.editQuickForm.radio = '存储过程';
                  result.conditionExpre = result.conditionExpre.slice(10);
                  this.contentCatch['procedure'] = result.conditionExpre;
                  break;
                default:
                  break;
              }
            }

            this.$nextTick(() => {
              this.editQuickForm.content = result.conditionExpre;
            })
            let temPath = result.conditionExpre.indexOf('addin:') != -1 ? result.conditionExpre.substring(6, result.conditionExpre.length) : '';
            let finalTemPath = this.plugList.findIndex(p => {
              return p.value == temPath
            })
            if (finalTemPath != -1) {
              this.editQuickForm.plugPath = temPath;
            } else {
              this.editQuickForm.plugPath = '';
            }

            let finalEclass = result.targetClass + "&e";
            // let finalRclass = result.targetClass + "&r";
            let finalREclass = result.targetClass + "&re";
            let isEtype = this.entitiesList.findIndex((el, index, arr) => {
              return el.value == finalEclass;
            })
            // let isRtype = this.resourcesList.findIndex((el, index, arr) => {
            //   return el.value == finalRclass;
            // })
            let isREtype = this.relationsList.findIndex((el, index, arr) => {
              return el.value == finalREclass;
            })
            if (isEtype != -1) {
              this.editQuickForm.goal = finalEclass;
            } else if (isREtype != -1) {
              this.editQuickForm.goal = finalREclass;
            }
            //fix bug 5353如果不为url类型设置条件表达式为''
            this.editQuickForm.linkUrl = this.editQuickForm.action === 'url' ? result.conditionExpre : '';
            this.editQuickForm.opePath = result.conditionExpre;

            this.editOperation = true;
            if (target && target.customAction) {
              this.customAction = target.customAction;
            } else {
              this.customAction = '';
            }
          } else {
            this.generateSysBindOpr(bindOprId, bindPoint, target);
          }
        })
      } else {
        this.generateSysBindOpr(bindOprId, bindPoint, target);
      }
    },
    /**
    *@description生成系统操作绑定后处理操作
    *@params
    *@date 2021/1/11
    *@return
    */
    generateSysBindOpr(bindOprId, bindPoint, target){
      this.editOperationTitle = '操作配置'
      this.reloadGoal = true;
      // 只有当添加时间为 悬停 或者 失焦时，操作样式才可选择浮窗样式
      this.target = target;
      if (this.target != undefined) {
        if (target.form_json != undefined) {
          this.idTree = this.getTree(target.form_json.data);
        }
        this.resetQuickStyle(this.target.opr_name);
      }

      this.isGlobalImplement = false;

      this.contentCatch = {
        serverScript: '',
        clientScript: '',
        procedure: ''
      }

      this.initActionList();
      this.editQuickForm.radio = "";
      this.editQuickForm.content = "";
      this.resetContent = false;
      let self = this;
      setTimeout(() => {
        self.resetContent = true;
      }, 100)

      this.bindModal = false;
      this.createBindModal = false;
      if (this.$refs["editQuickForm"] !== undefined) {
        this.$refs["editQuickForm"].resetFields();
      }
      this.editQuickForm.ename = uuid();
      this.editQuickForm.ename = `DEF${this.editQuickForm.ename.substring(3)}`;
      // this.$refs["editQuickForm"].resetFields();
      // this.$refs["selectGoal"].clearSingleSelect();
      this.editQuickForm.action = "implement";
      this.editorType = 'beforeScript';
      this.editorOprType = 'defaultScript';
      this.editQuickForm.beforeParams = "";
      this.editQuickForm.afterParams = "";
      this.editQuickForm.defaultParams = "";
      this.editQuickForm.needDefaultOpr = false;
      this.editQuickForm.needDialogDefaultOpr = true;
      this.editQuickForm.autoClose = 'auto';
      this.editQuickForm.goal = "";
      this.editQuickForm.radio = "前端脚本";
      this.editQuickForm.content = "";
      this.editQuickForm.needPopTitle = false;
      this.editQuickForm.popTitleTxt = '提示';
      this.editQuickForm.popTitleFs = 14;
      this.editQuickForm.popTitleColor = '#333';
      this.editQuickForm.tipPlacement = 'right';
      this.editQuickForm.popWidth = 400;
      this.editQuickForm.dialogWidth = 80;
      this.editQuickForm.dialogWidthType = '%';
      this.editQuickForm.dialogAutoHeight = true;
      this.editQuickForm.dialogHeight = 400;
      this.editQuickForm.dialogHeightType = 'px';
      this.editQuickForm.dragDialog = false;
      this.editQuickForm.drawerWidth = 720;
      this.editQuickForm.drawerWidthType = 'px';
      this.editQuickForm.icon = "";
      this.editQuickForm.moduleName = bindPoint;
      this.editQuickForm.oprScript = this.generateOprScript();
      this.editOperation = true;
      this.editFlag = 3;
      this.editQuickForm.icon = this.iconList[0].value;
      this.disEname = false;
      this.queryOprId = '';
      this.cnameExist = false;
      this.dnameExist = false;
      this.pcViewList = [];
      this.mobileViewList = [];

      if(target && target.customAction){
        this.editQuickForm.action = this.customAction = target.customAction
      } else {
        this.customAction = '';
      }
    },

    // 删除快速查询操作
    okDel(queryOprId) {

      delQuickOpe(queryOprId).then(res => {

        if (!res.success) {
          this.$Spin.hide();
          this.$Message.warning({
            content: res.message,
            duration: 3
          });
        } else {
          localStorage.setItem('query_oprs', '');
          localStorage.setItem('class_oprs', '');
          this.$Message.info({
            content: "删除成功",
            duration: 3
          });

          let self = this;
          setTimeout(function () {
            self.$emit("success-create-queryopr");
          }, 100)

          if (this.target) this.target.loadQueryOprList().then(() => {
            this.target.onChange(res.data);
          })
        }

      })
      .catch(e => {
        console.log(e);
        this.$Spin.hide();
      });

    },

    // 一键跳转到编辑表单
    toEditForm() {
      // if (!this.root) {
      //   this.$Message.error("请回建模端编辑表单");
      //   return;
      // }
      //关闭表格操作弹窗
      if (this.root && this.root.gridFilterDialog) {
        this.root.gridFilterDialog.showPanel = false;
        delete this.root['gridFilterDialog'];
      }
      this.editOperation = false;

      const className = this.editQuickForm.goal.split("&")[0];
      const viewOid = this.editQuickForm.viewName;
      let viewName = '';

      let cType = this.editQuickForm.goal.split('&')[1] == 'e' ? 'entity' : 'relation';
      let fType = '';

      let isMobileView = -1;
      if(this.mobileViewList.length > 0 && this.mobileViewList[0].value != '*') {
        isMobileView = this.mobileViewList.findIndex((p) => {
          return p.value == viewOid
        })
      }

      if(this.mobileFlag === true) {

        if(isMobileView != -1) {

          fType = 'Mobile';
          viewName = this.mobileViewList[isMobileView].label;

        } else {

          fType = 'PC';
          let isPcView = this.pcViewList.findIndex((p) => {
            return p.value == viewOid
          })
          viewName = this.pcViewList[isPcView].label;

        }

      } else {

        fType = 'Mobile';
        viewName = this.mobileViewList[isMobileView].label;

      }
      let a = document.createElement('a');
      let url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/${className}/${viewName}?token=${sessionStorage.getItem('tokenM')}&formType=${fType}&classType=${cType}`;
      a.href = url;
      a.target = "_blank";
      a.click();
    },

    // 切换到最大化编辑窗口
    changeBigSize() {
      this.isFullScreen = true;
      this.editOperation = false;
      this.$nextTick(() => {
        if (this.editQuickForm.action == 'implement' || this.editQuickForm.action == 'global_implement') {
          this.beforeParams = this.editQuickForm.content;
        } else if (this.editQuickForm.style != 'dialog' && this.editQuickForm.style != 'tab') {
          this.beforeParams = this.editQuickForm.beforeParams;
        }
        else {
          this.beforeParams = this.editQuickForm.beforeParams;
          this.afterParams = this.editQuickForm.afterParams;
        }
        switch (this.serverImplementEditor) {
          case true:
            this.beforeParams = this.server.script;
            break;
          case false:
            if (this.editQuickForm.action == 'implement' || this.editQuickForm.action == 'global_implement') {
              if(this.editQuickForm.radio === '后端脚本'){
                this.beforeParams = this.editQuickForm.oprScript.implement.server.default.script;
              }else if(this.editQuickForm.radio === '存储过程'){
                this.beforeParams = this.editQuickForm.content;
              }else{
                this.beforeParams = this.editQuickForm.oprScript.implement.client.default.script;
              }
            } else if (this.editQuickForm.style != 'dialog' && this.editQuickForm.style != 'tab') {
              this.beforeParams = this.editQuickForm.oprScript.appBefore.client.default.script;
            } else {
              this.beforeParams = this.editQuickForm.oprScript.appBefore.client.default.script;
              this.afterParams = this.editQuickForm.oprScript.appAfter.client.default.script;
            }
            break;
        }
      })

    },

    // 最大化脚本编辑确认
    confirmScript() {
      this.isFullScreen = false;
      this.$nextTick(() => {

        if (this.editQuickForm.action == 'implement' || this.editQuickForm.action == 'global_implement') {
          this.editQuickForm.content = this.beforeParams;
        } else if (this.editQuickForm.style != 'dialog' && this.editQuickForm.style != 'tab') {
          this.editQuickForm.beforeParams = this.beforeParams;
        }
          // else if(this.editQuickForm.style == 'tab'){
          //   this.editQuickForm.defaultParams = this.defaultParams;
          //   this.editQuickForm.beforeParams = this.beforeParams;
        // }
        else {
          this.editQuickForm.beforeParams = this.beforeParams;
          this.editQuickForm.afterParams = this.afterParams;
        }
        switch (this.serverImplementEditor) {
          case true:
            this.server.script = this.beforeParams;
            switch (this.editQuickForm.action){
              case 'url':
                this.$refs.UrlActionEditor.editServerImplementNoEmit(this.server, this.serverImplementKey);
                break;
              case 'implement':
                this.$refs.ImplementActionEditor.editServerImplementNoEmit(this.server, this.serverImplementKey);
                break;
              case 'global_implement':
                this.$refs.ImplementActionEditor.editServerImplementNoEmit(this.server, this.serverImplementKey);
                break;
              default:
                if (this.editQuickForm.style != 'dialog' && this.editQuickForm.style != 'tab') {
                  this.$refs.CURDActionImplementEditor.editServerImplementNoEmit(this.server, this.serverImplementKey);
                } else if (this.editorType === 'beforeScript') {
                  this.$refs.CURDActionBeforeImplementEditor.editServerImplementNoEmit(this.server, this.serverImplementKey);
                } else if (this.editorType === 'afterScript') {
                  this.$refs.CURDActionAfterImplementEditor.editServerImplementNoEmit(this.server, this.serverImplementKey);
                }
                break
            }
            break;
          case false:
            if (this.editQuickForm.action == 'implement' || this.editQuickForm.action == 'global_implement') {
              if(this.editQuickForm.radio === '后端脚本'){
                this.editQuickForm.oprScript.implement.server.default.script = this.beforeParams;
              }else{
                this.editQuickForm.oprScript.implement.client.default.script = this.beforeParams;
              }
            } else if (this.editQuickForm.style != 'dialog' && this.editQuickForm.style != 'tab') {
              this.editQuickForm.oprScript.appBefore.client.default.script = this.beforeParams;
            } else {
              this.editQuickForm.oprScript.appBefore.client.default.script = this.beforeParams;
              this.editQuickForm.oprScript.appAfter.client.default.script = this.afterParams;
            }
            break;
        }
      })

      this.editOperation = true;
    },
    // 关闭最大化脚本编辑弹窗
    cancelScript() {
      this.isFullScreen = false;
      this.editOperation = true;

      this.$nextTick(() => {
        switch (this.serverImplementEditor) {
          case true:
            this.$refs.ImplementActionEditor.editServerImplementNoEmit(this.server, this.serverImplementKey);
            break;
          case false:
            this.commonScript = '';
            this.defaultParams = '';
            this.beforeParams = '';
            this.afterParams = '';
            break;
        }
      })
    },
    inputQuery() {
      if (this.editQuickForm.goal) {
        let options = {
          allowNative: false,
          refClassDisabled: true,
          hideRelationClass: ['left', 'right', 'relation']
        }
        let type = this.editQuickForm.goal.split('&')[1] === 're' ? 're' : 'en';
        this.$refs.filterQuery_modal.initModal(this.editQuickForm.queryCont, this.editQuickForm.goal.split('&')[0], options, false, type);
      } else {
        this.$Message.warning("请选择目标类");
      }
    },
    getFilterQuery(finallyFilterQuery) {
      this.editQuickForm.queryCont = finallyFilterQuery;
    },

    async getKeyWordList(){
      let keyWord;
      let keyWordFromApi;
      try {
        let res = await getKeyWordList();
        keyWordFromApi = res.data;
      } catch (e) {
        let keyWord = ['oldObj', 'oldObjs', 'obj', 'objs', 'env', 'className', 'em', 'ex', 'sh', 'user', 'generateUUID', 'logger', 'omf', 'objectMapper', 'restTemplate', 'partExt', 'websocket', 'subscription', 'selectedObj', 'selectedObjs', 'oprName', 'customData'];
        keyWord = keyWord.concat(['_oldObj', '_oldObjs', '_obj', '_objs', '_env', '_className', '_em', '_ex', '_sh', '_user', '_generateUUID', '_logger', '_omf', '_objectMapper', '_restTemplate', '_partExt', '_websocket', '_subscription', '_selectedObj', '_selectedObjs', '_oprName', '_customData']);
        keyWordFromApi = keyWord;
      }
      return keyWordFromApi;
      // ''.match(/function{1}\s*\S+\({1}/g);
    },

      /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 生成oprScript
     * @return {Object} oprscript
     */
    generateOprScript() {
      return {
        implement: {
          entry: '',
          client: {
            default: {
              script: '',
              displayName: '',
            }
          },
          server: {
            default: {
              script: '',
              displayName: '默认脚本',
            }
          }
        },
        appBefore: {
          entry: 'client',
          client: {
            default: {
              script: '',
              displayName: '',
            }
          },
          server: {
            default: {
              script: '',
              displayName: '默认脚本',
            }
          }
        },
        appAfter: {
          entry: 'client',
          client: {
            default: {
              script: '',
              displayName: '',
            }
          },
          server: {
            default: {
              script: '',
              displayName: '默认脚本',
            }
          }
        },
      }
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 增加一条后端脚本列表
     */
    addServerScript(type) {
      switch (type) {
        case 'CURD':
          if (this.editQuickForm.style != 'dialog' && this.editQuickForm.style != 'tab') {
            this.$refs.CURDActionImplementEditor.addServerScript();
          } else if (this.editorType === 'beforeScript') {
            this.$refs.CURDActionBeforeImplementEditor.addServerScript();
          } else if (this.editorType === 'afterScript') {
            this.$refs.CURDActionAfterImplementEditor.addServerScript();
          }
          break;
        case 'URL':
          this.$refs.UrlActionEditor.addServerScript();
          break;
        case 'IMPLEMENT':
          this.$refs.ImplementActionEditor.addServerScript();
          break;

      }
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 新增后端脚本列表
     */
    handleCreateServer(field, createServer) {
      this.editQuickForm.oprScript[field].server[createServer.key] = {
        script: '',
        displayName: createServer.displayName
      };
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 编辑后端脚本列表
     */
    handleEditServer(field, editServer) {
      this.$set(this.editQuickForm.oprScript[field].server[editServer.key], 'displayName', editServer.displayName)
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 删除后端脚本列表中的脚本
     * @param {Object} server后端脚本
     */
    deleteServerImplement(field, key) {
      this.$delete(this.editQuickForm.oprScript[field].server, key);
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 确认后端脚本列表中的脚本
     * @param {Object} server后端脚本
     */
    confirmServerImplement(field, key, implement) {
      this.editQuickForm.oprScript[field].server[key].script = implement;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 是否进入后端脚本列表编辑状态
     * @param {Boolean} val状态
     */
    serverImplementEditorChange(val) {
      this.serverImplementEditor = val
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 修改后端脚本列表中的脚本
     * @param {Object} server后端脚本
     */
    editServerImplement(field, key, server) {
      this.serverImplementKey = key;
      this.server = server;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 后端脚本列表中脚本发生变化
     * @param {String} val脚本
     */
    serverImplementChange(val) {
      this.$set(this.server, 'script', val);
    },
  }
};
</script>
<style>
.drawSelect .ivu-select-dropdown {
  width: 100%;
}
#idTreeVis .ivu-tooltip .ivu-tooltip-rel{
  width: 100%;
}
</style>

<style scoped>
.top, .bottom {
  text-align: center;
}

.avatarImg {
      width: 50px;
      height: 50px;
      display: inline-block;
      margin-right: 15px;
      vertical-align: baseline;
  }

.center {
  width: 300px;
  margin: 10px auto;
  overflow: hidden;
}

.center-left {
  float: left;
}

.center-right {
  float: right;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.plugin-tree>>>.ivu-tree-title {
  width: 350px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.implement-plugin-box {
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  /*float: right;*/
}

.implement-plugin {
  margin: 0px 2px 2px 2px;
}

.implement-plugin-css{
  position: absolute;
  right: 0;
  z-index: 99;
}
</style>
