<script src="../config.js"></script>
<template>
    <div v-if="appType == 'PC'" :style="{borderTop: showTabs ? '' : '1px solid #e8eaec'}">

        <Row class="app-head">
            <Col span="3" style="cursor: pointer;" @click.native="backList">
                <Icon type="md-apps" style="margin-right: 5px;"></Icon>
                <span>全部应用</span>
            </Col>
        </Row>
       <Row style="padding: 0 0 15px 30px">

        <div id="oprModuleList" class="tree-wrap">
          <Card class="appTitle">
            <Row>
                <Col span="3">
                    <img :src="appLogo" alt="" style="width: 50px; height: 50px;">
                </Col>
                <Col span="16" style="line-height: 50px;">
                    <span>{{ appName }}</span>
                </Col>
            </Row>
          </Card>
          <Row>
              <Button id="saveModuleChange" v-show="isMove" @click="saveMove" type="default" style="float: right; margin: 10px  10px 10px 0;">保存</Button>
              <Button id="createModuleButton" type="warning" style="float: right; margin: 10px;" @click="createModule">新增模块</Button>
          </Row>
          <Tree class="pc-tree" :data="moduleData" :render="renderWithButton"></Tree>
        </div>

      </Row>

      <!-- 新增模块 -->
        <Modal
            v-model="newMoadl"
            id="createModuleModal"
            title="新增模块"
            width="62%"
            :mask-closable="false">

            <Form ref="newModalForm" :model="newModalForm" :rules="ruleNewModal" :label-width="100">
                <Row>
                <Col span="12">
                    <FormItem label="英文名" prop="ename">
                    <Input id="newModalFormEname" v-model.trim="newModalForm.ename"></Input>
                    </FormItem>
                </Col>
                <Col span="12">
                    <FormItem label="显示名" prop="cname">
                    <Input id="newModalDisplayCname" v-model.trim="newModalForm.cname" placeholder="请输入显示名"></Input>
                    </FormItem>
                </Col>
                </Row>
                <Row>
                <Col span="12">
                    <FormItem label="图标" prop="icon">
                        <Select id="newModuleIcon" v-model="newModalForm.icon" filterable clearable @on-change="chooseIcon">
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
                    <FormItem label="序号" prop="targetNumber" number>
                      <Input id="newModuleOrder" v-model="newModalForm.targetNumber"></Input>
                    </FormItem>
                </Col>
                </Row>
            </Form>
            <div slot="footer">
                <Button id="cancelCreateModuleButton" type="text" @click="newMoadl = false">取消</Button>
                <Button id="confirmCreateModuleButton" :disabled="!SaveModules" type="primary" @click="confirmNew('newModalForm')">确认</Button>
            </div>
        </Modal>
        <!-- 新增模块ending -->

      <!-- 编辑 模块 & 操作 -->
        <Modal
            v-model="editOperation"
            id="commonForm"
            title="信息编辑"
            width="62%"
            :mask-closable="false"
            >
            <!-- 模块 -->
            <Form ref="editModel" :model="editModel" :rules="ruleModel" :label-width="100" v-show="editFlag == 2">
                <Row>
                <Col span="12">
                    <FormItem label="英文名" prop="ename">
                    <Input id="editModuleClassName" v-model.trim="editModel.ename" disabled></Input>
                    </FormItem>
                </Col>
                <Col span="12">
                    <FormItem label="显示名" prop="cname">
                    <Input id="editModuleDisplayName" v-model.trim="editModel.cname" placeholder="请输入显示名"></Input>
                    </FormItem>
                </Col>
                </Row>
                <Row>
                <Col span="12">
                    <FormItem label="图标" prop="icon">
                        <Select id="editModuleIcon" v-model="editModel.icon" filterable clearable @on-change="chooseModuleIcon">
                            <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                                <Icon :type="item.value" style="font-size: 20px !important;"></Icon>
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
                    <FormItem label="序号" prop="targetNumber" number>
                        <Input id="editModuleOrder" v-model="editModel.targetNumber"></Input>
                    </FormItem>
                </Col>
                </Row>
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
                                <Input id="oprClassNameInput" v-model.trim="editQuickForm.ename" :disabled="disEname" @on-focus="cnameExist = false" @on-blur="checkCname('editQuickForm')"></Input>
                                    <span v-show="cnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
                            </FormItem>
                        </Col>
                            <Col span="12">
                            <FormItem label="显示名" prop="cname">
                                <Input id="oprDisplayNameInput" v-model.trim="editQuickForm.cname" @on-blur="checkDname('editQuickForm')" @on-focus="dnameExist = false"></Input>
                                <span v-show="dnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem label="模块名" prop="moduleName">
                                <Input id="moduleName" v-model="editQuickForm.moduleName" disabled></Input>
                            </FormItem>
                        </Col>
                            <Col span="12">
                            <FormItem label="序号" prop="targetNumber" number>
                                <Input id="oprModuleOrder" v-model="editQuickForm.targetNumber"></Input>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem label="图标" prop="icon">
                                <Select id="oprModuleIcon" v-model="editQuickForm.icon" filterable clearable @on-change="chooseIcon">
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
                        <Col span="12">
                            <FormItem label="操作样式" prop="style">
                                <Select id="oprModuleStyle" v-model="editQuickForm.style" disabled>
                                    <Option v-for="item in quickStyle" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                            <FormItem label="动作" prop="action">
                                <Select id="oprModuleAction" v-model="editQuickForm.action" filterable>
                                    <Option v-for="item in actionList" :value="item.value" :key="item.value" :label="item.value" :disabled="item.value == 'folder' && noFolder">
                                        <span>{{ item.value }}</span>
                                        <span style="float:right;color:#ccc">{{ item.label }}</span>
                                    </Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                </Card>
                <Card style="width:100%" v-show="editQuickForm.action != 'folder'">
                    <p slot="title">
                        <Icon type="ios-film-outline"></Icon>
                        动作
                    </p>
                    <Row v-show="editQuickForm.action == 'implement'">
                        <FormItem label="实现方式">
                            <RadioGroup v-model="editQuickForm.radio">
                            <Radio id="plugInCall" label="插件调用" :disabled="nonePlug">插件调用</Radio>
                            <Radio id="backScript" label="后端脚本">后端脚本</Radio>
                            <Radio id="frontScript" label="前端脚本">前端脚本</Radio>
                            <Radio id="storedProcedure" label="存储过程">存储过程</Radio>
                            <Radio id="plugInAlias" label="插件别名">插件别名</Radio>
                            </RadioGroup>
                        </FormItem>
                    </Row>
                    <Row v-show="editQuickForm.action == 'implement' && editQuickForm.radio == '插件调用'">
                        <FormItem label="脚本内容">
                            <Select id="oprSelectScripts" v-model="editQuickForm.plugPath" filterable clearable>
                                <Option v-for="item in plugList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                            </Select>
                        </FormItem>
                    </Row>
                    <Row v-show="editQuickForm.action == 'implement' && editQuickForm.radio != '插件调用'">
                        <Col span="22">
                            <FormItem label="脚本内容">
                                <MonacoEditor id="oprScriptsEditor" v-if="resetContent && editOperation" v-model="editQuickForm.content" @init="editorInit" :lang="editorLang" theme="chrome" width="85%" height="200"></MonacoEditor>
                            </FormItem>
                        </Col>
                        <Col span="1" offset="1">
                            <Row>
                                <Col span="24">
                                    <div style="margin-bottom: 8px">
                                        <Button id="oprMagnifyButton" shape="circle" style="margin-right: 10px;" type="default" icon="ios-expand" @click="changeBigSize('editQuickForm')"></Button>
                                    </div>
                                    <div style="margin-bottom: 8px">
                                        <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                                        <Button id="oprScriptsHelpButton" shape="circle" type="default" icon="md-help" @click="openHelp"></Button>
                                        </Tooltip>
                                    </div>
                                </Col>
                                <!-- <Col span="10">
                                    <Button shape="circle" type="default" icon="ios-expand" @click="changeBigSize('editQuickForm')"></Button>
                                </Col>
                                <Col span="10">
                                    <Tooltip content="脚本在线帮助文档" style="width: 100%;">
                                    <Button shape="circle" type="default" icon="md-help" @click="openHelp"></Button>
                                    </Tooltip>
                                </Col> -->
                            </Row>
                        </Col>
                    </Row>
                    <Row v-show="(editQuickForm.action == 'create' || editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'creates' || editQuickForm.action == 'list')">
                        <Col span="12">
                            <FormItem label="目标类" prop="goal">
                                <Select id="oprGoalClassSelect" v-if="reloadGoal" ref="selectGoal" v-model="editQuickForm.goal" filterable clearable @on-change="changeView" @on-clear="clearView">
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
                                    <Select id="oprFormSelect" v-model="editQuickForm.viewName" filterable v-if="reloadView">
                                         <OptionGroup label="PC端">
                                            <Option v-for="(item, index) in viewList" :value="item.value" :key="index">{{ item.label }}</Option>
                                        </OptionGroup>
                                    </Select>
                                    </FormItem>
                                </Col>
                                <Col v-show="editQuickForm.viewName != '' && editQuickForm.viewName != '*'" span="2" offset="1">
                                    <Poptip trigger="hover" title="提示" content="点击跳转到对应表单页面">
                                    <Button id="toEditFormButton" shape="circle" type="default" icon="md-arrow-round-forward" @click="toEditForm"></Button>
                                    </Poptip>
                                </Col>
                            </Row>
                        </Col>
                        <Col span="24">
                            <Row>
                                <Col span="22">
                                    <FormItem label="脚本内容">
                                        <!-- <editor v-if="editQuickForm.action == 'implement' || editQuickForm.style != 'dialog'" v-model="editQuickForm.beforeParams" @init="editorInit" lang="javascript" theme="chrome" width="100%" height="200"></editor> -->
                                        <Tabs :value="editorType" :animated="false" style="overflow: visible">
                                            <TabPane label="前处理脚本" name="beforeScript">
                                                <MonacoEditor id="beforeScript1" v-if="editOperation" v-model="editQuickForm.beforeParams" @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="200"></MonacoEditor>
                                            </TabPane>
                                            <TabPane label="后处理脚本" name="afterScript">
                                                <MonacoEditor id="afterScript1" v-if="editOperation" v-model="editQuickForm.afterParams" @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="200"></MonacoEditor>
                                            </TabPane>
                                        </Tabs>
                                    </FormItem>
                                </Col>
                                <Col span="1" offset="1">
                                    <Row>
                                        <div style="margin-bottom: 8px">
                                            <Button id="oprMagnifyButton" shape="circle" style="margin-right: 10px;" type="default" icon="ios-expand" @click="changeBigSize"></Button>
                                        </div>
                                        <div style="margin-bottom: 8px">
                                            <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                                            <Button id="oprScriptsHelp" shape="circle" type="default" icon="md-help" @click="openHelp"></Button>
                                            </Tooltip>
                                        </div>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Spin size="large" fix v-if="spinShow"></Spin>
                    </Row>
                    <Row v-show="editQuickForm.action == 'url'">
                        <Col span="24">
                            <FormItem label="URL地址" prop="linkUrl">
                                <Input id="oprActionURL" v-model.trim="editQuickForm.linkUrl" :rows="4" :autosize="true" type="textarea" placeholder="可用$user等" @on-blur="hideUrlTips"></Input>
                                <span v-show="urlIsNull" class="errorTips">*URL不能为空哦</span>
                            </FormItem>
                        </Col>
                        <Col span="24" v-show="!modelerApp">
                            <Row>
                                <Col span="22">
                                    <FormItem label="脚本内容">
                                        <Tabs :value="editorType" :animated="false" style="overflow: visible">
                                            <TabPane label="前处理脚本" name="beforeScript">
                                                <MonacoEditor id="beforeScript2" v-if="editOperation" v-model="editQuickForm.beforeParams" @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="200"></MonacoEditor>
                                           </TabPane>
                                        </Tabs>
                                    </FormItem>
                                </Col>
                                <Col span="1" offset="1">
                                    <Row>
                                        <div style="margin-bottom: 8px">
                                            <Button id="oprMagnifyButton" shape="circle" style="margin-right: 10px;" type="default" icon="ios-expand" @click="changeBigSize('editQuickForm')"></Button>
                                        </div>
                                        <div style="margin-bottom: 8px">
                                            <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                                            <Button id="oprScriptsHelp" shape="circle" type="default" icon="md-help" @click="openHelp"></Button>
                                            </Tooltip>
                                        </div>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row v-show="(editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'list')">
                        <FormItem label="条件表达式" prop="queryCont">
                            <Input id="conditionalExpression" v-model="editQuickForm.queryCont" type="textarea" placeholder="请输入and开头的jpql表达式, 如and obj.state='下达', 可用$obj, $user等" @on-focus="inputQuery"></Input>
                        </FormItem>
                      <FilterQueryCommonModal
                              v-if="editQuickForm.goal"
                              :targetClass="editQuickForm.goal ? editQuickForm.goal.split('&')[0] : ''"
                              :refClass="editQuickForm.goal"
                              ref="filterQuery_modal"
                              :fromManagement="true"
                              :store="store"
                              :root="root"
                              @generatorFilterQuery="getFilterQuery"
                      >
                      </FilterQueryCommonModal>
                    </Row>
                </Card>
            </Form>
            <div slot="footer">
                <Button id="cancelModuleButton" type="text" @click="cancelEdit">取消</Button>
                <Button id="confirmEditButton" :disabled="!confirmAuth" type="primary" @click="confirmFix">确认</Button>
            </div>
        </Modal>
        <!-- 编辑操作ending -->

        <!-- 缓冲删除 -->
        <Modal
            v-model="delOpe"
            id="deleteModal"
            title="重要提示"
            @on-ok="okDel"
            @on-cancel="cancel">
            <p>您即将删除当前选中的数据, 是否确认删除?</p>
        </Modal>
        <!-- 缓冲删除Ending -->

        <!-- 最大化编辑器 -->
        <Modal
            id="scriptEditorWindow"
            v-model="isFullScreen"
            title="脚本编辑"
            :mask-closable="false"
            width="80%"
            @on-ok="confirmScript"
            @on-cancel="cancelScript">
            <MonacoEditor id="scriptEditorBig" v-if="this.editQuickForm.action == 'implement' && isFullScreen" v-model="commonScript" @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="600"></MonacoEditor>
            <Tabs v-else-if="editQuickForm.action == 'url'" :value="editorType" :animated="false" style="overflow: visible">
              <TabPane label="前处理脚本" name="beforeScript">
                <MonacoEditor  id="beforeScript3" v-if="isFullScreen" v-model="beforeParams" @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="600"></MonacoEditor>
              </TabPane>
            </Tabs>
            <Tabs v-else :value="editorType">
                <TabPane label="前处理脚本" name="beforeScript">
                    <MonacoEditor  id="beforeScript3" v-if="isFullScreen" v-model="beforeParams" @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="600"></MonacoEditor>
                </TabPane>
                <TabPane label="后处理脚本" name="afterScript">
                    <MonacoEditor  id="afterScript3" v-if="isFullScreen" v-model="afterParams" @init="editorInit" :lang="editorLang" theme="chrome" width="100%" height="600"></MonacoEditor>
                </TabPane>
            </Tabs>
        </Modal>
        <!-- 最大化编辑器ENDING -->
    </div>
    <div v-else>
        <Row class="app-head">
            <Col span="3" style="cursor: pointer;" @click.native="backList">
                <Icon type="md-apps" style="margin-right: 5px;"></Icon>
                <span>全部应用</span>
            </Col>
            <Col span="21">
                <Button style="float: right; margin-top: 14px;" type="primary" @click.native="saveSetting">保存设置</Button>
            </Col>
        </Row>
        <Row>
            <Col :lg="7" :xl="5" :xxl="10" class="phoneBg-wrap" >
                <div class="phoneBg-content">
                    <div v-show="needModule.indexOf('顶部') != -1" class="header-module" :style="{'height': `${topModuleHeight}px`, 'lineHeight': `${topModuleHeight}px`, 'backgroundColor': topModuleBgColor}">
                        <span v-show="topModule.indexOf('页面标题') != -1" :style="{'color': topModuleColor, 'fontSize': `${topModuleFsize}px !important`, 'fontWeight': `${topTextBold ? 'bold' : 'normal'}`}">{{ topModuleTitle }}</span>
                        <Icon v-show="topModule.indexOf('操作') != -1" class="top-icon" type="ios-menu" />
                    </div>

                    <div v-show="needModule.indexOf('底部') != -1" class="btm-module" :style="{'height': `${btmModuleHeight}px`, 'lineHeight': `${btmModuleHeight}px`, 'backgroundColor': btmModuleBgColor}">
                        <div v-for="(item, index) in temBtmOprList" :key="index" class="opr-item" :style="{'height': `${btmModuleHeight}px`}">
                            <div v-show="bottomModule != '文字'" style="margin-bottom: 4px;">
                                <van-icon v-show="item.extSettings.btmIconType == '系统图标'" :style="{'color': actOpr == item.oid ? item.extSettings.btmIconActColor : item.extSettings.btmIconDefColor, 'fontSize': `${btmModuleFsize * 1.8}px !important`, 'fontWeight': `${btmTextBold ? 'bold' : 'normal'}`}" :name="item.icon" />
                                <img :style="{'width': `${btmModuleFsize * 1.8}px`, 'height': `${btmModuleFsize * 1.8}px`}" v-show="item.extSettings.btmIconType == '自定义图标'" :src="actOpr == item.oid ? `${baseUrl}/files-download/${item.extSettings.actImg}` : `${baseUrl}/files-download/${item.extSettings.defImg}`" />
                            </div>
                            <div v-show="bottomModule != '图标'">
                                <span :style="{'color': actOpr == item.oid ? item.extSettings.btmIconActColor : btmModuleColor, 'fontSize': `${btmModuleFsize}px !important`, 'fontWeight': `${btmTextBold ? 'bold' : 'normal'}`}">{{ item.displayName.length > 3 ? item.displayName.slice(0,2) + '..' : item.displayName }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="phoneBg-content" :style="{'backgroundImage': `url(${phoneBg})`, 'backgroundSize': 'contain'}"></div>
            </Col>
            <Col :lg="14" :xl="16" :xxl="10">
                <Row class="set-content set-content-head">
                    <!-- <Col span="8">
                        <span class="set-head-label">设备:</span>
                        <RadioGroup v-model="deviceScreen" type="button">
                            <Radio label="手机"></Radio>
                            <Radio label="iPad"></Radio>
                        </RadioGroup>
                    </Col>
                    <Col span="8">
                        <span class="set-head-label">方向:</span>
                        <RadioGroup v-model="screenDirection" type="button">
                            <Radio label="竖屏"></Radio>
                            <Radio label="横屏"></Radio>
                        </RadioGroup>
                    </Col> -->
                    <Col span="8">
                        <span class="set-head-label">模块:</span>
                         <CheckboxGroup v-model="needModule" style="display: inline-block;">
                            <Checkbox label="顶部">顶部导航</Checkbox>
                            <Checkbox label="底部">底部菜单</Checkbox>
                        </CheckboxGroup>
                    </Col>
                </Row>
                <div class="set-content set-content-center">
                    <Row class="content-head">
                        <Col span="12">
                            <span class="set-head-label">顶部导航:</span>
                            <CheckboxGroup v-model="topModule" style="display: inline-block;">
                                <Checkbox label="页面标题"></Checkbox>
                                <Checkbox label="操作"></Checkbox>
                            </CheckboxGroup>
                        </Col>
                    </Row>
                    <div class="content-content">
                        <Row class="set-head-row">
                            <Col span="7">
                                <span class="set-head-label fl">顶部高度:</span>
                                <Input v-model="topModuleHeight" number style="float:left;width: 90px;">
                                    <span slot="append">px</span>
                                </Input>
                            </Col>
                            <Col span="5">
                                <span class="set-head-label">背景色:</span>
                                <ColorPicker v-model="topModuleBgColor" alpha />
                            </Col>
                            <Col span="10">
                                <span class="set-head-label fl">文字样式:</span>
                                <ColorPicker class="fl" v-model="topModuleColor" style="margin-right: 5px;" />
                                <Input v-model="topModuleFsize" number style="float:left;width: 90px;margin-right: 5px;">
                                    <span slot="append">px</span>
                                </Input>
                                <Button :type="topTextBold ? 'primary' : 'default'" @click="switchTopBold">B</Button>
                            </Col>
                        </Row>
                        <Row class="set-head-row">
                            <Col span="20">
                                <span class="set-head-label fl">页面标题:</span>
                                <Input v-model="topModuleTitle" placeholder="请输入页面标题" style="float:left;width: 300px;">
                                </Input>
                            </Col>
                        </Row>
                        <!-- <Row class="set-head-row">
                            <Col span="20">
                                <span class="set-head-label fl">操作事件:</span>
                                <BindOperationBar :index="0"
                                    :opr_path="topOpr.opr_path"
                                    :opr_type="topOpr.opr_type"
                                    :opr_name="topOpr.name"
                                    :form_targetclass="topModuleObj.className"
                                    :route="route"
                                    :router="router"
                                    :root="root"
                                    v-on:on-change="handleChangeOperationBar"
                                    style="width:354px">
                                </BindOperationBar>
                            </Col>
                        </Row> -->
                    </div>
                </div>
                <div class="set-content set-content-bottom">
                    <Row class="content-head">
                        <Col span="12">
                            <span class="set-head-label">底部菜单:</span>
                            <RadioGroup v-model="bottomModule">
                                <Radio label="图标文字"></Radio>
                                <Radio label="图标"></Radio>
                                <Radio label="文字"></Radio>
                            </RadioGroup>
                        </Col>
                    </Row>
                    <div class="content-content">
                        <Row class="set-head-row">
                            <Col span="7">
                                <span class="set-head-label fl">底部高度:</span>
                                <Input v-model="btmModuleHeight" number style="float:left;width: 90px;">
                                    <span slot="append">px</span>
                                </Input>
                            </Col>
                            <Col span="5">
                                <span class="set-head-label">背景色:</span>
                                <ColorPicker v-model="btmModuleBgColor" alpha />
                            </Col>
                            <Col span="10">
                                <span class="set-head-label fl">文字样式:</span>
                                <ColorPicker class="fl" v-model="btmModuleColor" style="margin-right: 5px;" />
                                <Input v-model="btmModuleFsize" number style="float:left;width: 90px;margin-right: 5px;">
                                    <span slot="append">px</span>
                                </Input>
                                <Button :type="btmTextBold ? 'primary' : 'default'" @click="switchBtmBold">B</Button>
                            </Col>
                        </Row>
                        <div class="drag-wrap" style="margin-top: 10px;">
                            <draggable :options="{animation:380}"
                                v-model="btmOprList"
                                @change="change"
                                @start="start"
                                @end="end"
                                :move="move">
                                <Row class="btm-opr-row btm-opr-row-width" v-for="(item, index) in btmOprList" :key="index">
                                    <Col span="2">
                                        <Icon class="btm-row-icon" type="md-move" />
                                    </Col>
                                    <Col span="18">
                                        <span class="set-head-label fl">标签</span>
                                        <Input class="btm-row-input btm-row-inputBtn" readonly v-model="item.displayName"></Input>
                                        <Button :type="actOpr == item.oid ? 'info' : 'default'" class="fl btm-row-inputBtn" @click.native="actBtmOpr(item)">设为默认</Button>
                                    </Col>
                                    <Col span="4" style="text-align: center;">
                                        <Icon class="btm-row-icon btm-row-icon-large" style="margin-right: 20px" @click.native="editBtmOpr(item)" type="ios-create-outline" />
                                        <Icon class="btm-row-icon btm-row-icon-large" @click.native="delBtmOpr(item)" type="md-close" />
                                    </Col>
                                </Row>
                            </draggable>
                        </div>
                        <Button class="btm-opr-row-width" icon="md-add" type="warning" @click="addBtmOpr">添加标签</Button>
                    </div>
                </div>
                <QueryOprDialog ref="opr_dialog"
                    :fromManagement="true"
                    :route="route"
                    :router="router"
                    :root="root"
                    :store="store"
                    @success-create-queryopr="onSuccessCreateQueryOpr">
                </QueryOprDialog>

                <!-- 缓冲删除 -->
                <Modal
                    v-model="delBtmOprModal"
                    id="deleteModal"
                    title="重要提示"
                    @on-ok="okBtmDel"
                    @on-cancel="cancelBtmModal">
                    <p>您即将删除当前选中的数据, 是否确认删除?</p>
                </Modal>
                <!-- 缓冲删除Ending -->

            </Col>
            <Col :lg="3" :xl="3" :xxl="4" style="padding-top: 15px;">
                <div class="QRcode">
                    <canvas id="qrcanvas"></canvas>
                </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    import {
        getAppModules,
        getModuleOperations,
        getPlugList,
        addNewOperation,
        getIconList,
        getAllEntities,
        // getAllResources,
        getAllRelations,
        getViews,
        fixQuickOpe,
        delQuickOpe,
        checkCnameEvent,
        checkDnameEvent,
        delModule,
        fixModule,
        createQuickOpe,
        updateAppTree,
        updateApp
    } from "@/api/others"

    import { mapMutations } from 'vuex';
    import "@/styles/component/iconfont.css";
    import { Icon } from 'vant';
    import draggable from "vuedraggable";
    import QueryOprDialog from './components/query-operation-edit-dialog.vue'
    import FilterQueryCommonModal from '@/ext_components/form/subcomponent/FilterQueryCommonModal';
    import BindOperationBar from "@/ext_components/form/subcomponent/BindOperationBar.vue"
    import moduleIconData from "./components/moduleIcon.js";
    import fontIconData from "./components/iFontIcon.js";
    import { entries as opr_entries } from "@/ext_components/operation/config.js";
    import {entries as opr_assemble_entries} from "@/assemble_components/operation/assemble_config.js";
    import {entries as views_entries} from "@/views/config.js";
    import {checkClasses, checkClassesArray} from "@/api/auth-model/AuthEngine";
    import AuthRules from "@/api/auth-model/AuthRules";
    import _global from '@/views/global.vue'
    import QRCode from 'qrcode'
    // import ipadH from "@/assets/images/ipadH.png";
    // import ipadV from "@/assets/images/ipadV.png";
    // import phoneH from "@/assets/images/phoneH.png";
    import phoneV from "@/assets/images/phoneV.png";
    import MonacoEditor from "@/views/functional-model/components/MonacoEditor";
    var canvas = '';

    export default {
        props: ["store", "route", "router", "root"],
        data() {
            const validateCname = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('显示名不能为空'));
                } else {
                    if(value.length > 32) {
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
                    const reg = new RegExp("^[a-zA-Z][a-zA-Z0-9]*$");
                    let flag = reg.test(value);
                    if(!flag){
                        callback(new Error('英文名要以字母开头, 并且只能包含字母和数字哦～'));
                    } else {

                        if(value.length > 32) {
                            callback(new Error('英文名不能超过32个字符哦～'));
                        } else {
                            callback();
                        }

                    }
                }
            };
            return {

                isInitPromise: true,      // 仅页面第一次初始化时 加载资源类等数据
                appType: 'PC',
                baseUrl: '',

                treeRowWrap: {
                    display: 'inline-block',
                    width: 'calc(100% - 20px)',
                    padding: '4px 0',
                    borderBottom: '1px solid #ddd',
                    lineHeight: '32px',
                    margin: '-4px 0'
                },
                phoneBg: '',
                deviceScreen: '手机',
                screenDirection: '竖屏',
                needModule: ['顶部', '底部'],
                topModuleObj: null,
                btmModuleObj: null,
                topModule: ['页面标题', '操作'],
                topModuleTitle: '首页',
                topModuleHeight: 50,
                topModuleFsize: 14,
                topTextBold: false,
                topModuleBgColor: 'rgba(255, 255, 255, 1)',
                topModuleColor: '#333',
                topOpr: {
                    opr_path: '',
                    opr_type: '',
                    name: '',
                    tmp: true,
                    extend: false,
                },
                delBtmOprModal: false,
                bottomModule: '图标文字',
                btmModuleHeight: 70,
                btmModuleFsize: 12,
                btmTextBold: false,
                btmModuleBgColor: 'rgba(255, 255, 255, 1)',
                btmModuleColor: '#646566',
                delBtmOprId: '',
                actOpr: '',

                oprOrder: [],

                currentId: '',
                spinShow: false,
                resetContent: true,
                reloadGoal: false,
                editorType: 'beforeScript',

                goalIsNull: false,
                viewIsNull: false,
                urlIsNull: false,

                moduleData: [],
                appLogo: null,
                appName: '',

                noFolder: false,
                editOperation: false,
                isMove: false,
                delOpe: false,
                isFullScreen: false,     // 脚本编辑器全屏
                commonScript: '',     // 公共最大化编辑器内容   implement
                beforeParams: '',     // 公共最大化编辑器内容   非implement
                afterParams: '',      // 公共最大化编辑器内容   非implement
                newMoadl: false,
                nonePlug: false, // 是否禁止选择插件入口的方式
                editFlag: 0,
                fixModel: {},
                iconList: [],
                iList: [],
                plugList: [],
                entitiesList: [], // 实体类列表
                // resourcesList: [], // 资源类列表
                relationsList: [], // 关联类列表
                viewList: [], // 视图列表

                btmOprList: [],

                // 编辑模块
                editModel: {
                    cname: '',
                    ename: '',
                    icon: '',
                    targetNumber: 0
                },
                ruleModel: {
                    cname: [
                        { required: true, message: "显示名不能为空哦～", trigger: "blur" },
                        { validator: validateCname, trigger: 'blur' }
                    ],
                    targetNumber: [
                        {
                            pattern: /^[0-9]*$/,
                            message: "序号只能是数字哦～",
                            trigger: "blur"
                        }
                    ]
                },

                // 新增模块
                newModalForm: {
                    ename: "",
                    cname: "",
                    icon: '',
                    targetNumber: 0
                },
                ruleNewModal: {
                    cname: [
                        { required: true, message: "显示名不能为空哦～", trigger: "blur" },
                        { validator: validateCname, trigger: 'blur' }
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

                // 删除系列
                needDelType: 0,
                needDelId: null,
                needDelName: '',
                reloadView: true,

                // 操作
                editQuickForm: {
                    ename: "",
                    cname: "",
                    moduleName: "",
                    targetNumber: 0,
                    icon: "",
                    style: "tab",
                    action: "create",
                    radio: "后端脚本",
                    plugPath: "",
                    content: "",
                    goal: "",
                    beforeParams: '',
                    afterParams: '',
                    params: "",
                    viewTitle: "",
                    viewName: "",
                    linkUrl: "",
                    queryCont: "",
                    oid: ""
                },
                ruleFixQuick: {
                    ename: [
                        { required: true, message: '英文名不能为空哦～', trigger: 'blur' },
                        { validator: validateEname, trigger: 'blur' }
                    ],
                    cname: [
                        { required: true, message: '显示名不能为空哦～', trigger: 'blur' },
                        { validator: validateCname, trigger: 'blur' }
                    ],
                    action: [
                        { required: true, message: '请选择动作类型～', trigger: 'blur' }
                    ],
                    targetNumber: [
                        {
                            pattern: /^[0-9]*$/,
                            message: "序号只能是数字哦～",
                            trigger: "blur"
                        }
                    ]
                    // style: [
                    //     { required: true, message: '请选择操作样式～', trigger: 'blur' }
                    // ]
                },
                disEname: true,
                cnameExist: false,
                dnameExist: false,
                quickStyle: [
                    {
                        value: "modal",
                        label: "modal | 弹框显示"
                    },
                    {
                        value: "tab",
                        label: "tab | 增加页签"
                    }
                ],
                actionList: [
                    {
                    value: "create",
                    label: "单对象创建"
                    },
                    // {
                    // value: "list",
                    // label: "多对象浏览"
                    // },
                    {
                    value: "url",
                    label: "外部链接"
                    },
                    {
                    value: "implement",
                    label: "操作实现"
                    },
                    {
                    value: "folder",
                    label: "树形节点"
                    },
                    {
                    value: "edit",
                    label: "单对象编辑"
                    },
                    {
                    value: "visit",
                    label: "单对象浏览"
                    },
                    // {
                    // value: "creates",
                    // label: "多对象创建"
                    // }
                ],
                contentCatch: {
                    serverScript: '',
                    clientScript: '',
                    procedure: ''
                },

              queryOprId: '',
              modelerApp: false,
              SaveModules: true,
              EditModules: true,
              DeleteModules: true,
              SaveOperations: true,
              EditOperations: true,
              DeleteOperations: true,
              confirmAuth: true,
              enAppName: '',
              disabledOpe: {},
              rootClassName: null,
              showTabs: true
            }
        },

        async created() {

            this.$store = this.store;
            this.baseUrl = _global.baseUrl;

            // 移动应用设备图
            this.phoneBg = phoneV;

            this.iconList = moduleIconData;
            this.iList = fontIconData;

            this.appLogo = localStorage.itemLogo;
            this.appName = localStorage.itemTitle;
            this.enAppName = localStorage.itemAppName;
            this.appType = localStorage.getItem('currentAPPType');
            console.log(this.appType)

            if(this.appType == 'Mobile') {

                try {
                
                    let currentConfig = JSON.parse(localStorage.getItem('mobileAppConfig'));
                    console.log(currentConfig);
                    this.needModule = currentConfig.needModule || ['顶部', '底部'];
                    this.topModule = currentConfig.topModule || ['页面标题', '操作'];
                    this.topModuleHeight = currentConfig.topModuleHeight || 50;
                    this.topModuleBgColor = currentConfig.topModuleBgColor || 'rgba(255, 255, 255, 1)';
                    this.topModuleColor = currentConfig.topModuleColor || '#333';
                    this.topModuleFsize = currentConfig.topModuleFsize || 14;
                    this.topTextBold = currentConfig.topTextBold || false;
                    this.topModuleTitle = currentConfig.topModuleTitle || '首页';
                    this.topOpr = currentConfig.topOpr;
                    this.bottomModule = currentConfig.bottomModule || '图标文字';
                    this.btmModuleHeight = currentConfig.btmModuleHeight || 50;
                    this.btmModuleBgColor = currentConfig.btmModuleBgColor || 'rgba(255, 255, 255, 1)';
                    this.btmModuleColor = currentConfig.btmModuleColor || '#646566';
                    this.btmModuleFsize = currentConfig.btmModuleFsize || 12;
                    this.btmTextBold = currentConfig.btmTextBold || false;

                    this.actOpr = localStorage.defaultOpr || '';

                } catch (error) {
                    
                }

            }
        },

        components: {
            MonacoEditor: MonacoEditor,
            FilterQueryCommonModal: FilterQueryCommonModal,
            BindOperationBar,
            draggable,
            QueryOprDialog
        },

        methods: {
            ...mapMutations(["addRoute"]),
            isDefaultFun(data) {
                // 默认模块
                let name = data.className ? data.className : ''
                return this.currentId.slice(0,-6) === name.slice(3,-3)
            },

            editorInit() {
                require("brace/ext/language_tools"); //language extension prerequsite...
                require("brace/mode/html");
                require("brace/mode/javascript"); //language
                require("brace/mode/less");
                require("brace/theme/chrome");
                require("brace/snippets/javascript"); //snippet
            },

            globalRefresh() {
                this.isInitPromise = true;
                this.initData();
            },

            backList() {
              this.root && this.root.turnToPage('FunctionalModel/ApplicationManagement');
            },

            // 编辑底部操作
            editBtmOpr(item) {
                this.$refs.opr_dialog.editBindQuick(item.oid, undefined, 'Mobile');
            },

            // 删除底部操作
            delBtmOpr(item) {

                this.delBtmOprId = item.oid;
                this.delBtmOprModal = true;

            },

            okBtmDel() {
                this.$refs.opr_dialog.okDel(this.delBtmOprId);
            },
            
            cancelBtmModal() {
                this.delBtmOprModal = false;
            },

            // 选中底部操作
            actBtmOpr(item) {

                if(this.actOpr != item.oid) {
                    this.actOpr = item.oid;
                } else {
                    this.actOpr = '';
                }

            },
            
            // 切换头部底部模块文字加粗样式
            switchTopBold() {
                this.topTextBold = !this.topTextBold;
            },

            switchBtmBold() {
                this.btmTextBold = !this.btmTextBold;
            },

            // 保存应用设置
            saveSetting() {
                
                this.$Spin.show();
                let name = localStorage.getItem('itemAppName') || '';
                let appTitle = localStorage.getItem('itemTitle') || '';
                let appLogo = localStorage.getItem('itemLogo') || '';
                let appId = localStorage.getItem('currentAPPID') || '';
                this.oprOrder = [];

                // 仅存储oprid 操作按照应用记录排序 无需更新五次操作信息
                this.oprOrder = this.btmOprList.map(b => { return b.oid });
                localStorage.setItem('btmOpr', JSON.stringify(this.oprOrder));

                let chooseDefId = !this.actOpr || this.actOpr == 'undefined' ? '' : this.actOpr;
                console.log(chooseDefId, this.actOpr);
                localStorage.setItem('defaultOpr', chooseDefId);
                let indexOprPath = '';
                if(chooseDefId) {

                    let actOprName = this.btmOprList.filter(a => { return a.oid == chooseDefId });
                    if(actOprName.length > 0) {
                        indexOprPath = `${this.btmModuleObj.className}/${actOprName[0].authority}`;
                    }

                }
                let appParams = {
                    id:appId,
                    appName: name,
                    title: appTitle,
                    type: 'Mobile',
                    defaultOpr: chooseDefId,
                    extConfig: {
                        logoImg: appLogo,
                        indexPageOpr: indexOprPath,
                        needModule: this.needModule,
                        topModule: this.topModule,
                        topModuleTitle: this.topModuleTitle,
                        topModuleHeight: this.topModuleHeight,
                        topModuleBgColor: this.topModuleBgColor,
                        topModuleColor: this.topModuleColor,
                        topModuleFsize: this.topModuleFsize,
                        topTextBold: this.topTextBold,
                        topOpr: this.topOpr,
                        bottomModule: this.bottomModule,
                        btmModuleHeight: this.btmModuleHeight,
                        btmModuleBgColor: this.btmModuleBgColor,
                        btmModuleColor: this.btmModuleColor,
                        btmModuleFsize: this.btmModuleFsize,
                        btmTextBold: this.btmTextBold,
                        btmOprOrder: this.oprOrder
                    }
                }

                let updateAppInfo = new Promise((resolve, reject) => {
                    
                    appParams.extConfig = JSON.stringify(appParams.extConfig);
                    updateApp(appParams).then(res => {

                        resolve(res);
                        this.$Spin.hide();
                        if(!res.success) {

                            this.$Message.error(res.message);

                        } else {

                            localStorage.setItem('mobileAppConfig', appParams.extConfig);
                            this.$Message.success('应用设置保存成功');
                        }

                    }).catch(e => {
                        console.log(e);
                        reject(e);
                        this.$Spin.hide();
                    });

                })

            },

            addRootClassName(target, rootClassName) {
                let _self = this;
                let children = target.children
                for (let i in children) {
                    let child = children[i];
                    child.index = i;
                    child.rootClassName = rootClassName;

                    if (child.children && child.children.length > 0) {
                        _self.addRootClassName(child, rootClassName);
                    }
                }

            },

            change (evt) {
                console.log(evt)
            },
            start (evt) { 
                console.log(evt)
            },
            end (evt) {
                console.log(evt)
                evt.item //可以知道拖动的本身
                evt.to    // 可以知道拖动的目标列表
                evt.from  // 可以知道之前的列表
                evt.oldIndex  // 可以知道拖动前的位置
                evt.newIndex  // 可以知道拖动后的位置
            },
            move (evt, originalEvent) {
                console.log(evt)
                console.log(originalEvent) //鼠标位置
            },

            // 根据ID获取应用树
            initData() {
                let _self = this;
                this.reloadGoal = false;
                _self.$Spin.show();
                this.moduleData = [];

                let appId = location.href.split('=')[1];
                if(!appId) {
                    appId = localStorage.getItem('currentAPPID');
                }
                this.currentId = appId;
                this.modelerApp = this.currentId === 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20';
                checkClassesArray([`APP_${this.enAppName}`], 'SaveModules,EditModules,DeleteModules', true).then(res => {
                    let data = res.data;
                    if (data.length < 1) {
                        this.$Message.error('权限检查出错');
                        return;
                    }
                    else data = data[0];
                    this.SaveModules = data[0] == true;
                    this.EditModules = data[1] == true;
                    this.DeleteModules = data[2] == true;
                }).catch(() => {
                    _self.$Spin.hide();
                })
                let withDefaultModule = true
                getAppModules(appId, withDefaultModule).then(res => {

                    let moduleData = res.data.data;
                    for (let i in moduleData) {
                        moduleData[i].appId = appId;
                        moduleData[i].children = [];
                    }
                    this.moduleData = [...this.moduleData, ...moduleData];

                    _self.$Spin.hide();

                }).then(() => {
                    let promises = [];
                    let classNames = [];
                    _self.moduleData.forEach(i => {
                      classNames.push(i.className);
                      promises.push(getModuleOperations(i.className, withDefaultModule).then(res => {

                        i.children = res.data.data.queryOprConfigs;

                      }))
                    })
                    if (classNames.length > 0) {
                        promises.push(checkClassesArray(classNames, 'EditOperations', true).then(res => {
                            for(let i in classNames) {
                                this.disabledOpe[classNames[i]] = res.data[i][0] == true;
                            }
                        }))
                    }

                    Promise.all(promises).then(() => {
                        _self.$Spin.hide();

                        for (let i in _self.moduleData) {
                            _self.moduleData[i].index = i;
                            let rootClassName = _self.moduleData[i].className;
                            _self.addRootClassName(_self.moduleData[i], rootClassName);
                        }

                        if(this.appType == 'Mobile') {

                            this.topModuleObj = this.moduleData.filter(m => { return m.displayName == '顶部模块'})[0];
                            this.btmModuleObj = this.moduleData.filter(m => { return m.displayName == '底部模块'})[0];

                            this.btmOprList = this.btmModuleObj.children.splice(0, 5);
                            console.log(this.btmOprList)
                            let cachOrder = localStorage.getItem('btmOpr');
                            if(cachOrder) {

                                if(cachOrder.indexOf('[') == -1) {
                                    cachOrder = cachOrder.split(',');
                                } else {
                                    cachOrder = JSON.parse(cachOrder);
                                }

                            }
                            
                            if(cachOrder.length > 0 && this.btmOprList.length > 0) {

                                this.btmOprList.sort((prev, next) => {
                                    return cachOrder.indexOf(prev.oid) - cachOrder.indexOf(next.oid)
                                })

                            }

                        } else {

                            this.topModuleObj = null;
                            this.btmModuleObj = null;
                            this.btmOprList = [];

                        }

                        if(_self.isInitPromise) {
                            _self.initPromise();
                        }
                    }).catch(() => {
                        _self.$Spin.hide();
                    });

                }).catch(() => {
                    _self.$Spin.hide();
                })

            },

            handleChangeOperationBar(event) {

                if (event.conf.opr_type == 'query') {

                    if (event.query_opr.action == "implement"
                    && !event.query_opr.conditionExpre.startsWith("procedure:")
                    && !event.query_opr.conditionExpre.startsWith("serverScript:")
                    && !event.query_opr.conditionExpre.startsWith("clientScript:")) {

                        try {
                            this.topOpr.extend = true;
                        } catch (e) {
                            console.log(e);
                        }

                    }
                }

                this.topOpr.opr_path = event.conf.opr_path;
                this.topOpr.opr_type = event.conf.opr_type;

            },

            // 基础选择数据获取
            initPromise() {
                // let promiseResource = new Promise((resolve, reject) => {
                //     this.resourcesList = [];
                //     getAllResources()
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
                //             value: val.className + "&r",
                //             label: val.displayName
                //         };
                //         this.resourcesList.push(eachItem);
                //         });
                //     }
                //     })
                //     .catch(e => {
                //     console.log(e);
                //     reject(e);
                //     });
                // })

                let promiseRe = new Promise((resolve, reject) => {
                    this.relationsList = [];
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

                let promiseEntities = new Promise((resolve, reject) => {
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

                let promise5 = new Promise((resolve, reject) => {
                    this.nonePlug = true;
                    this.plugList = [];
                    if(this.currentId === 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'){
                      this.nonePlug = false;
                      if(views_entries.length != undefined && views_entries.length > 0) {
                        views_entries.forEach(x => {
                            this.plugList.push({
                                value: x.name,
                                label: `${x.name}(${x.note})`
                            });
                            // checkClasses(x.className, x.name).then(res => {
                            //     if (res.data == true) {
                            //         this.plugList.push({
                            //             value: x.name,
                            //             label: `${x.name}(${x.note})`
                            //         });
                            //     }
                            // })
                        });
                      }
                      this.actionList = [
                        {
                          value: "url",
                          label: "外部链接"
                        },
                        {
                          value: "implement",
                          label: "操作实现"
                        },
                        {
                          value: "folder",
                          label: "树形节点"
                        },
                      ]
                      // if(opr_assemble_entries.length != undefined && opr_assemble_entries.length > 0) {
                      //   opr_assemble_entries.forEach(x => {
                      //     this.plugList.push({
                      //       value: x.name,
                      //       label: `${x.name}(${x.note})`
                      //     });
                      //   });
                      // }
                    }else{
                      opr_entries.forEach(x => {
                        this.nonePlug = false;
                        this.plugList.push({
                          value: x.name,
                          label: `${x.name}(${x.note})`
                        });
                      });

                      if(opr_assemble_entries.length != undefined && opr_assemble_entries.length > 0) {
                        opr_assemble_entries.forEach(x => {
                          this.plugList.push({
                            value: x.name,
                            label: `${x.name}(${x.note})`
                          });
                        });
                      }
                    }

                    if (!this.nonePlug) {
                        this.editQuickForm.radio = "";
                        this.editQuickForm.content = '';
                    }
                })
            },

            // 新增模块
            createModule() {
                this.$refs['newModalForm'].resetFields();
                this.newModalForm.icon = this.iconList[0].value;
                this.newMoadl = true;
            },
            async confirmNew(name) {
                let res = await checkClasses(`APP_${this.enAppName}`, 'SaveModules');
                this.SaveModules = res.data == true;
                if (!this.SaveModules) {
                    this.$Message.error('没有新增权限');
                    return;
                }

                this.$refs[name].validate(valid => {
                    if (valid) {
                    let newModalParams = [
                        {
                            appId: this.currentId,
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

                    addNewOperation(newModalParams).then(res => {
                        if (!res.success) {

                            this.$Spin.hide();
                            this.$Message.warning(res.message);

                        } else {
                            if (!sessionStorage.getItem("usernameM") || sessionStorage.getItem("usernameM") == 'admin') {
                              this.newMoadl = false;
                              this.$Message.success('新增成功');
                              this.$Spin.show();

                              this.isInitPromise = false;
                              this.initData();

                              this.$refs[name].resetFields();
                              return;
                            }
                            let addRules = [{
                                "attrName": "",
                                "authority": newModalParams[0].className,
                                "className": newModalParams[0].className,
                                "conditionId": "AlwaysTrue",
                                "isInheritant": true,
                                "level": 0,
                                "note": "",
                                "oid": "",
                                "participant": sessionStorage.getItem("usernameM")
                            }];
                            console.log(addRules)

                            AuthRules.createRules(addRules).then(res => {
                                this.newMoadl = false;
                                this.$Message.success('新增成功');
                                this.$Spin.show();

                                this.isInitPromise = false;
                                this.initData();

                                this.$refs[name].resetFields();
                            }).catch(err => {
                                console.log(err)
                                this.$Spin.hide();
                            });

                        }
                    })
                    .catch(e => {
                        console.log(e);
                        this.newMoadl = false;
                        this.$Spin.hide();
                    });
                    } else {

                        this.$Message.warning('请确认输入信息');

                    }
                });
            },

            cancelModule() {
                this.$refs['newModalForm'].resetFields();
            },

            // 跳转到脚本说明文档
            openHelp() {
                window.open(`http://ise.thss.tsinghua.edu.cn/confluence/pages/viewpage.action?pageId=22511673`);
            },

            cancel() {},

            // 保存移动结果
            saveMove() {

                updateAppTree(this.moduleData).then(res => {

                    if(!res.success) {
                        this.$Message.error(res.message);
                    } else {
                        this.initData();

                        let that = this;
                        let config = {
                            content: '应用更新成功',
                            onClose: () => {
                                that.isMove = false;
                            }
                        }
                        this.$Message.success(config);
                    }

                }).catch(e => {
                    console.log(e);
                    reject(e);
                    this.$Spin.hide();
                });
            },

            // 模块下创建快速查询操作
            async addOperation(result) {

                this.reloadGoal = true;
                this.contentCatch = {
                    serverScript: '',
                    clientScript: '',
                    procedure: ''
                }
                this.editQuickForm.radio = "";
                this.editQuickForm.content = "";
                this.editorType = 'beforeScript';
                this.editQuickForm.beforeParams = '';
                this.editQuickForm.afterParams = '';
                this.resetContent = false;
                let self = this;
                setTimeout(() => {
                    self.resetContent = true;
                }, 100)

                if('action' in result) {
                    this.noFolder = true;
                } else {
                    this.noFolder = false;
                }

                this.isMove = false;
                // this.$refs["selectGoal"].clearSingleSelect();
                if (this.$refs["editQuickForm"] !== undefined) {
                    this.$refs["editQuickForm"].resetFields();
                }
                // 快速查询操作的英文名 authority
                if(result.className) {
                    this.editQuickForm.moduleName = result.className;
                } else {
                    this.editQuickForm.moduleName = result.authority;
                }


                if(this.currentId === 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'){
                  this.editQuickForm.action = "implement";
                }else{
                  this.editQuickForm.action = "create";
                }
                this.editQuickForm.goal = '';
                this.editQuickForm.radio = "后端脚本";
                this.editQuickForm.content = '';
                this.editQuickForm.icon = this.iconList[0].value;
                this.editQuickForm.plugPath = '';
                this.editFlag = 3;

                this.editOperation = true;
                this.disEname = false;
                this.queryOprId = '',
                this.cnameExist = false;
                this.dnameExist = false;
                let res = null;
                if (result.action == 'folder') {
                    console.log(result.moduleName)
                    this.rootClassName = result.moduleName;
                    res = await checkClasses(result.moduleName, 'SaveOperations');
                }
                else {
                    this.rootClassName = this.editQuickForm.moduleName;
                    res = await checkClasses(this.editQuickForm.moduleName, 'SaveOperations');
                }
                this.SaveOperations = res.data == true;
                this.confirmAuth = this.SaveOperations;
            },

            // 编辑 *******模块 操作********* 信息
            async editInfo(orgResult) {
                this.$refs.editModel.resetFields()

                let result = {...orgResult};
                this.reloadGoal = true;
                this.contentCatch = {
                    serverScript: '',
                    clientScript: '',
                    procedure: ''
                }
                this.editQuickForm.radio = '';

                this.isMove = false;
                this.editOperation = true;
                // this.$refs["selectGoal"].clearSingleSelect();
                this.cnameExist = false;
                this.dnameExist = false;
                // console.log('result', result)

                // 编辑模块
                if(result.rootClassName === undefined) {

                    this.editFlag = 2;
                    this.fixModel = result;

                    this.editModel.ename = result.className;
                    this.editModel.cname = result.displayName;
                    this.editModel.icon = result.packagePath;
                    this.editModel.targetNumber = result.state;
                    let res = await checkClasses(`APP_${this.enAppName}`, 'EditModules');
                    this.EditModules = res.data == true;
                    this.confirmAuth = this.EditModules;

                } else {

                    this.$refs["editQuickForm"].resetFields();
                    // 编辑操作
                    this.editFlag = 1;
                    this.disEname = true;

                    this.editQuickForm.ename = result.authority;
                    this.editQuickForm.cname = result.displayName;
                    this.editQuickForm.moduleName = result.moduleName;
                    this.editQuickForm.icon = result.icon;

                    let finalEclass = result.targetClass + "&e";
                    let finalREclass = result.targetClass + "&re";

                    let isEtype = this.entitiesList.findIndex((el, index, arr) => {
                        return el.value == finalEclass;
                    })
                    let isREtype = this.relationsList.findIndex((el, index, arr) => {
                        return el.value == finalREclass;
                    })

                    if(isEtype != -1) {
                        this.editQuickForm.goal = finalEclass;
                    } else if(isREtype != -1) {
                        this.editQuickForm.goal = finalREclass;
                    }

                    await this.changeView(this.editQuickForm.goal, result.viewName == '*' ? result.viewName : result.viewOid);
                    // this.editQuickForm.goal = result.targetClass;
                    this.editQuickForm.action = result.action == 'list' ? 'visit' : result.action;
                    this.editQuickForm.oid = result.oid;
                    this.queryOprId = result.oid;
                    this.editQuickForm.targetNumber = result.order;
                    this.editQuickForm.style = result.conType;
                    this.editQuickForm.viewTitle = result.viewTitle;
                    // this.$nextTick(() => {
                    //     this.editQuickForm.viewName = result.viewName == '*' ? result.viewName : result.viewOid;
                    // })
                    // 脚本编辑内容、条件选择混乱问题
                    if(result.action !== 'implement'){
                        this.editQuickForm.queryCont = result.conditionExpre;
                    }

                    if(result.conditionExpre.indexOf('addin:') != -1) {
                        this.editQuickForm.radio = '插件调用';
                    } else if(result.conditionExpre.indexOf('serverScript:') != -1) {
                        this.editQuickForm.radio = '后端脚本';
                        result.conditionExpre = result.conditionExpre.slice(13);
                        this.contentCatch['serverScript'] = result.conditionExpre;
                    } else if(result.conditionExpre.indexOf('clientScript:') != -1) {
                        this.editQuickForm.radio = '前端脚本';
                        result.conditionExpre = result.conditionExpre.slice(13);
                        this.contentCatch['clientScript'] = result.conditionExpre;
                    } else if(result.conditionExpre.indexOf('procedure:') != -1) {
                        this.editQuickForm.radio = '存储过程';
                        result.conditionExpre = result.conditionExpre.slice(10);
                        this.contentCatch['procedure'] = result.conditionExpre;
                    } else {
                        this.editQuickForm.radio = '插件别名';
                    }
                    if(result.action == 'implement'){
                        this.editQuickForm.content = result.conditionExpre || '';
                    }
                    this.editQuickForm.plugPath = result.conditionExpre.substring(6, result.conditionExpre.length) || '';

                    this.editQuickForm.linkUrl = result.conditionExpre;

                    // 前后处理脚本
                    if(result.params){
                      this.editQuickForm.params = result.params;
                      this.editQuickForm.beforeParams = this.editQuickForm.params.split('APP_afterScript:')[0].slice(17) || '';
                      this.editQuickForm.afterParams = this.editQuickForm.params.split('APP_afterScript:')[1] || '';
                      if(this.editQuickForm.beforeParams != '') {
                        this.editorType = 'beforeScript';
                      } else if(this.editQuickForm.afterParams != '') {
                        this.editorType = 'afterScript';
                      } else {
                        console.log(this.editorType)
                      }
                    }
                    this.editQuickForm.opePath = result.conditionExpre;
                    let res = await checkClasses(result.rootClassName, 'EditOperations');
                    this.EditOperations = res.data == true;
                    this.confirmAuth = this.EditOperations;
                }

            },

            // 删除 模块 & 操作
            delInfo(result) {

                this.delOpe = true;
                this.isMove = false;

                if(result.rootClassName === undefined) {

                    this.needDelType = 2;
                    this.needDelId = result.className;

                } else {

                    this.needDelType = 1;
                    this.needDelId = result.oid;
                    this.needDelName = result.rootClassName;
                    console.log(result)

                }
            },

            // 确认删除
            async okDel() {
                let _self = this;

                if (this.needDelType == 1){
                    let res = await checkClasses(this.needDelName, 'DeleteOperations');
                    this.DeleteOperations = res.data == true;
                    if (!this.DeleteOperations) {
                        this.$Message.error('没有删除该操作的权限');
                        return;
                    }

                    delQuickOpe(this.needDelId).then(res => {

                        if (!res.success) {
                            this.$Spin.hide();
                            this.$Message.warning({
                                content: res.message || "服务器繁忙, 删除失败请稍后再试",
                                duration: 3
                            });
                        } else {
                            this.$Spin.show();

                            this.isInitPromise = false;
                            this.initData();
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
                    let res = await checkClasses(`APP_${this.enAppName}`, 'DeleteModules');
                    this.DeleteModules = res.data == true;
                    if (!this.DeleteModules) {
                        this.$Message.error('没有删除该模块的权限');
                        return;
                    }

                    delModule(this.needDelId).then(res => {

                        if (!res.success) {
                            this.$Spin.hide();
                            this.$Message.warning({
                                content: res.message || "服务器繁忙, 删除失败请稍后再试",
                                duration: 3
                            });
                            } else {
                            this.$Spin.show();

                            this.isInitPromise = false;
                            this.initData();
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
                if(this.disEname && this.queryOprId){
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
            // 脚本实现方式  快速查询操作操作
            // chooseWayQucik(value) {

            //     if (value == "后端脚本") {
            //         this.editQuickForm.content = "serverScript:";
            //     } else if (value == "存储过程") {
            //         this.editQuickForm.content = "procedure:";
            //     } else if (value == "前端脚本") {
            //         this.editQuickForm.content = "clientScript:";
            //     } else {
            //         this.editQuickForm.content = "";
            //     }

            // },
            async validateAddin() {
                if(this.currentId !== 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'){
                    return true;
                }
                if(views_entries.length != undefined && views_entries.length > 0) {
                    let addin = views_entries.filter(x => {
                        return x.name == this.editQuickForm.plugPath
                    });
                    console.log(addin, 'views')
                    if (addin.length > 0) {
                        let res = await checkClasses(addin[0].className, addin[0].name);
                        return (res.data == true)
                    }

                }
                return true;

            },
            // 确认修改
            async confirmFix() {
                if(this.editFlag == 1){
                    this.$refs['editQuickForm'].validate(async valid => {
                        if (!valid) {
                            this.$Message.warning('格式有误, 绑定失败');
                        } else {
                            // 修改快速查询操作
                            let finalExpre = null;
                            if(this.editQuickForm.action == 'url') {

                                finalExpre = this.editQuickForm.linkUrl;
                                this.editQuickForm.params = `APP_beforeScript:${this.editQuickForm.beforeParams}APP_afterScript:${this.editQuickForm.afterParams}`;

                            } else if(this.editQuickForm.action == 'implement') {

                                if (this.editQuickForm.radio == "插件调用") {
                                    console.log(this.editQuickForm.plugPath, !this.editQuickForm.plugPath, this.editQuickForm.plugPath == 'undefined')
                                    if(!this.editQuickForm.plugPath || this.editQuickForm.plugPath == 'undefined') {
                                        this.$Message.warning('请选择脚本内容');
                                        return false
                                    }
                                    finalExpre = "addin:" + this.editQuickForm.plugPath;
                                    // let res = await this.validateAddin();
                                    // if (!res) {
                                    //     this.$Message.warning('没有调用该插件权限');
                                    //     return;
                                    // }
                                } else if (this.editQuickForm.radio == "后端脚本") {
                                    finalExpre = "serverScript:" + this.editQuickForm.content;
                                } else if (this.editQuickForm.radio == "前端脚本") {
                                    finalExpre = "clientScript:" + this.editQuickForm.content;
                                } else if (this.editQuickForm.radio == "存储过程") {
                                    finalExpre = "procedure:" + this.editQuickForm.content;
                                } else {
                                    finalExpre = this.editQuickForm.content;
                                }

                            } else {

                                this.editQuickForm.params = `APP_beforeScript:${this.editQuickForm.beforeParams}APP_afterScript:${this.editQuickForm.afterParams}`;

                                if(this.editQuickForm.action == 'create' || this.editQuickForm.action == 'creates') {
                                    finalExpre = '';
                                } else if (this.editQuickForm.action == 'folder') {
                                    finalExpre = '';
                                    this.editQuickForm.params = '';
                                } else {
                                    finalExpre = this.editQuickForm.queryCont;
                                }

                            }
                          if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'next_create' || this.editQuickForm.action == 'edit' || this.editQuickForm.action == 'visit' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'list') {
                            if (!this.editQuickForm.goal || this.editQuickForm.goal == '' || this.editQuickForm.goal == undefined) {
                              this.$Message.warning("请选择目标类");
                              return;
                            } else if (this.editQuickForm.viewName == '' || this.editQuickForm.viewName == undefined) {
                              this.$Message.warning("请选择表单名称");
                              return;
                            }
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
                                viewOid: this.editQuickForm.viewName == '*' ? null : this.editQuickForm.viewName,
                                viewTitle: this.editQuickForm.viewTitle,
                                viewType: ""
                            };

                            // 兼容旧数据
                            if(this.editQuickForm.viewName == '*') {
                                fixQuickParams['viewName'] = '*';
                            }
                            if(this.editQuickForm.action == 'implement' || this.editQuickForm.action == 'url' || this.editQuickForm.action == 'folder') {
                                delete fixQuickParams.viewOid
                            }
                            fixQuickOpe(fixQuickParams).then(res => {
                                if (!res.success) {

                                    this.$Spin.hide();
                                    this.$Message.warning(res.message);

                                } else {
                                    this.editOperation = false;
                                    this.$Spin.show();

                                    this.isInitPromise = false;

                                    this.$refs['editQuickForm'].resetFields();
                                    this.editQuickForm.action = "create";
                                    this.editQuickForm.icon = "";
                                    this.editQuickForm.goal = "";
                                    this.editQuickForm.viewName = '';
                                    this.viewList = [];
                                    this.editQuickForm.radio = "";
                                    this.editQuickForm.content = '';
                                    this.editQuickForm.beforeParams = "";
                                    this.editQuickForm.afterParams = "";
                                    this.contentCatch = {
                                        serverScript: '',
                                        clientScript: '',
                                        procedure: ''
                                    }

                                    this.initData();
                                    this.$Message.info({
                                        content: "修改成功",
                                        duration: 3
                                    });
                                }
                            }).catch(e => {
                                console.log(e);
                                this.editOperation = false;
                                this.$Spin.hide();
                            });
                        }
                    })
                } else if(this.editFlag == 3){

                    this.$refs['editQuickForm'].validate(async (valid) => {

                        if (!valid || this.cnameExist) {

                            this.$Message.warning('格式有误, 绑定失败');

                        } else {
                          if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'next_create' || this.editQuickForm.action == 'edit' || this.editQuickForm.action == 'visit' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'list') {
                            if (!this.editQuickForm.goal || this.editQuickForm.goal == '' || this.editQuickForm.goal == undefined) {
                              this.$Message.warning("请选择目标类");
                            } else if (this.editQuickForm.viewName == '' || this.editQuickForm.viewName == undefined) {
                              this.$Message.warning("请选择表单名称");
                            } else { await this.commonFixQope(); }
                          }else {
                            await this.commonFixQope();
                          }
                        }
                    })

                } else {
                    this.$refs['editModel'].validate(async valid => {
                        if (!valid) {
                                this.$Message.warning('格式有误, 绑定失败');
                            } else {
                                if(this.editModel.cname != "") {
                                let fixModelParams = {
                                    appId: this.currentId,
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

                                        const _self = this;
                                        this.$Spin.hide();
                                        this.$Message.warning(res.message);
                                    } else {
                                    this.editOperation = false;
                                        this.$Spin.show();

                                        this.isInitPromise = false;
                                        this.initData();
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
                    })
                }

            },

            // 公共更新快速查询操作
            async commonFixQope() {

                let finalExpre = null;
                if(this.editQuickForm.action == 'url') {

                    finalExpre = this.editQuickForm.linkUrl;
                    this.editQuickForm.params = `APP_beforeScript:${this.editQuickForm.beforeParams}APP_afterScript:${this.editQuickForm.afterParams}`;

                } else if(this.editQuickForm.action == 'implement') {

                    if (this.editQuickForm.radio == "插件调用") {

                        if(!this.editQuickForm.plugPath || this.editQuickForm.plugPath == 'undefined') {
                            this.$Message.warning('请选择脚本内容');
                            return false
                        }
                        finalExpre = "addin:" + this.editQuickForm.plugPath;
                        // let res = await this.validateAddin();
                        // if (!res) {
                        //     this.$Message.warning('没有调用该插件权限');
                        //     return;
                        // }
                    } else if (this.editQuickForm.radio == "后端脚本") {
                        finalExpre = "serverScript:" + this.editQuickForm.content;
                    } else if (this.editQuickForm.radio == "前端脚本") {
                        finalExpre = "clientScript:" + this.editQuickForm.content;
                    } else if (this.editQuickForm.radio == "存储过程") {
                        finalExpre = "procedure:" + this.editQuickForm.content;
                    } else {
                        finalExpre = this.editQuickForm.content;
                    }

                } else {

                    finalExpre = this.editQuickForm.queryCont || '';
                    this.editQuickForm.action == 'folder' ? this.editQuickForm.params = '' : this.editQuickForm.params = `APP_beforeScript:${this.editQuickForm.beforeParams}APP_afterScript:${this.editQuickForm.afterParams}`;

                }

                let newParams = {
                    action: this.editQuickForm.action,
                    authority: this.editQuickForm.ename,
                    conType: this.editQuickForm.style,
                    conditionExpre: finalExpre,
                    displayName: this.editQuickForm.cname,
                    icon: this.editQuickForm.icon || '',
                    moduleName: this.editQuickForm.moduleName,
                    order: this.editQuickForm.targetNumber || 0,
                    params: this.editQuickForm.params,
                    targetClass: this.editQuickForm.goal != undefined ? this.editQuickForm.goal.split("&")[0] : '',
                    viewOid: this.editQuickForm.viewName == '*' ? null : this.editQuickForm.viewName,
                    viewTitle: this.editQuickForm.viewTitle || ''
                };
                // 兼容旧数据
                if(this.editQuickForm.viewName == '*') {
                    newParams['viewName'] = '*';
                }
                if(this.editQuickForm.action == 'implement' || this.editQuickForm.action == 'url' || this.editQuickForm.action == 'folder') {
                    delete newParams.viewOid
                }

                createQuickOpe(newParams).then(res => {
                    if (!res.success) {
                        this.$Spin.hide();
                        this.$Message.warning(res.message);
                    } else {
                      this.editOperation = false;
                        this.$Spin.show();

                        this.isInitPromise = false;
                        this.initData();
                        this.$Message.info({
                        content: "绑定成功",
                        duration: 3
                        });

                        // 绑定成功 数据重置
                        this.$refs['editQuickForm'].resetFields();
                        this.editQuickForm.action = "create";
                        this.editQuickForm.icon = "";
                        this.editQuickForm.radio = "";
                        this.editQuickForm.content = '';
                        this.contentCatch = {
                            serverScript: '',
                            clientScript: '',
                            procedure: ''
                        }
                        this.editQuickForm.beforeParams = "";
                        this.editQuickForm.afterParams = "";
                        let addRules = [{
                            "attrName": "",
                            "authority": newParams.authority,
                            "className": this.rootClassName,
                            "conditionId": "AlwaysTrue",
                            "isInheritant": true,
                            "level": 0,
                            "note": "",
                            "oid": "",
                            "participant": sessionStorage.getItem("usernameM")
                        }];
                        console.log(addRules)
                        if (sessionStorage.getItem("usernameM") && sessionStorage.getItem("usernameM") != 'admin') {
                          AuthRules.createRules(addRules).then(res => {
                              this.$Spin.hide();
                          }).catch(err => {
                              console.log(err)
                              this.$Spin.hide();
                          });
                        }

                    }
                })
                    .catch(e => {
                    console.log(e);
                    this.editOperation = false;
                    this.$Spin.hide();
                });

            },

            cancelEdit() {
                this.$refs['editQuickForm'].resetFields();

                // 选择型数据 & 编辑器置空
                this.editQuickForm.goal = '';
                this.editQuickForm.viewName = '';
                this.editQuickForm.beforeParams = '';
                this.editQuickForm.afterParams = '';
                this.editQuickForm.content = '';
                this.contentCatch = {
                    serverScript: '',
                    clientScript: '',
                    procedure: ''
                }
                this.editQuickForm.radio = '';

                this.reloadGoal = false;
                this.editOperation = false;

            },

            hideTips(value) {
                if(value != '') {
                    this.viewIsNull = false;
                }
            },

            hideUrlTips() {
                if(this.editQuickForm.linkUrl != '')  {
                    this.urlIsNull = false;
                }
            },

            // 视图 & 目标对象联动
            async changeView(value, viewValue) {

                if (value === undefined || value === '') {
                    this.editQuickForm.viewName = '';
                    this.viewList = [];
                    return
                }
                if(value != '' && value != '&r' && value != '&e' && value != "&re") {
                    this.spinShow = true;
                    this.goalIsNull = false;
                }

                // 视图数据获取
                let eachClass = value.split("&")[0];

                if(eachClass != '') {

                    let self = this;

                    try {
                        
                        let response = await getViews(eachClass, {formType: 'PC', needV3Content: false});
                        let res = response.data;
                        this.viewList = [];
                        this.reloadView = false;
                        let temList = [];
                        // 增加回调视图列表的等待动画遮罩
                        this.spinShow = false;

                        if (!res.success) {
                            this.$Spin.hide();
                            this.reloadView = true;
                            this.$Message.error('服务繁忙, 表单列表获取失败');
                        } else {

                            if (res.data.length == 0) {
                                let eachItem = {
                                    value: "*",
                                    label: "*"
                                };
                                this.viewList.push(eachItem);
                                this.$nextTick(() => {
                                    this.reloadView = true;
                                    this.editQuickForm.viewName = "*";
                                })

                            } else {

                                this.editQuickForm.viewName = "";
                                this.$nextTick(() => {

                                    res.data.forEach((val) => {
                                        let eachItem = {
                                            value: val.oid,
                                            label: val.viewName
                                        };
                                        temList.push(eachItem);
                                    });
                                    this.viewList = temList;
                                    this.reloadView = true;

                                    if(viewValue && viewValue != 'undefined') {
                                        this.editQuickForm.viewName = viewValue;
                                    }else{
                                      this.editQuickForm.viewName = '';
                                    }

                                })

                            }
                        }
                    } catch (error) {
                        self.reloadView = true;
                        self.viewList = [];
                        self.$Spin.hide();
                    }

                }

            },

            clearView() {

                this.editQuickForm.goal = "";
                this.editQuickForm.viewName = '';
                console.log(this.editQuickForm.goal, this.editQuickForm.viewName);

            },

            // 选择小图标
            chooseIcon(value) {
                this.editQuickForm.icon = value;
            },

            chooseModuleIcon(value) {
                this.editModel.icon = value;
            },

             // 公共移动操作
             moveItem(arr, oldIndex, newIndex) {

                arr[oldIndex] = arr.splice(newIndex, 1, arr[oldIndex])[0];

                // 更新index属性
                arr[oldIndex].index = oldIndex;
                arr[newIndex].index = newIndex;

                this.isMove = true;
                return arr;

             },

            // 上移操作
            upItems(node, item) {

                let temModuleData = this.moduleData;

                // 如果是模块
                if(node.parent === undefined) {

                    const itemIndex = parseInt(item.index);
                    if(itemIndex == 0) {
                        return;
                    }
                    this.moveItem(temModuleData, itemIndex, itemIndex - 1);

                } else {

                    // 如果是非folder操作
                    const notF = (item.moduleName === item.rootClassName);

                    // 并且非 *****folder下****** 的操作
                    if(notF) {

                        const itemIndex = parseInt(item.index);
                        if(itemIndex == 0) {
                            return;
                        }

                        // 找到所属模块
                        let parentItem = temModuleData.filter(val => val.className == item.moduleName);

                        this.moveItem(parentItem[0].children, itemIndex, itemIndex - 1);

                    } else {

                        const itemIndex = parseInt(item.index);
                        if(itemIndex == 0) {
                            return;
                        }

                        // 找到所属模块下的folder操作
                        let grandparentItem = temModuleData.filter(val => val.className == item.rootClassName);
                        let parentItem = grandparentItem[0].children.filter(val => val.authority == item.moduleName);

                        this.moveItem(parentItem[0].children, itemIndex, itemIndex - 1);

                    }

                }
            },

            // 下移操作
            downItems(node, item) {


                let temModuleData = this.moduleData;

                // 如果是模块
                if(node.parent === undefined) {
                    const itemIndex = parseInt(item.index);
                    if(itemIndex == temModuleData.length - 1) {
                        return;
                    }
                    this.moveItem(temModuleData, itemIndex, itemIndex + 1);

                } else {

                    const notF = (item.moduleName === item.rootClassName);

                    // 如果是 *****非folder下****** 的操作 或者 folder操作本身
                    if(notF) {

                        // 找到所属模块
                        let parentItem = temModuleData.filter(val => val.className == item.moduleName);

                        const itemIndex = parseInt(item.index);
                        if(itemIndex == parentItem[0].children.length - 1) {
                            return;
                        }

                        this.moveItem(parentItem[0].children, itemIndex, itemIndex + 1);

                    } else {

                        // 找到所属模块下的folder操作
                        let grandparentItem = temModuleData.filter(val => val.className == item.rootClassName);
                        let parentItem = grandparentItem[0].children.filter(val => val.authority == item.moduleName);

                        const itemIndex = parseInt(item.index);
                        if(itemIndex == parentItem[0].children.length - 1) {
                            return;
                        }

                        this.moveItem(parentItem[0].children, itemIndex, itemIndex + 1);

                    }

                }
            },

            // 添加底部模块操作
            addBtmOpr() {

                if(this.btmOprList.length > 4) {

                    this.$Message.warning('底部模块操作不能超过五个呦~');
                    return false;
                    
                } else {

                    this.$refs.opr_dialog.createBindQuick(this.btmModuleObj.className, undefined, 'Mobile');

                }

            },

            onSuccessCreateQueryOpr() {

                let btmModuleName = this.btmModuleObj.className;
                getModuleOperations(btmModuleName).then(response => {

                    let res = response.data;
                    if(!res.success) {
                        this.btmOprList = [];
                        this.$Message.warning('获取底部模块操作列表失败')
                    } else {
                        this.btmOprList = res.data.queryOprConfigs.splice(0, 5);

                        let cachOrder = localStorage.getItem('btmOpr');
                        if(cachOrder) {

                            if(cachOrder.indexOf('[') == -1) {
                                cachOrder = cachOrder.split(',');
                            } else {
                                cachOrder = JSON.parse(cachOrder);
                            }

                        }

                        if(cachOrder.length > 0 && this.btmOprList.length > 0) {

                            this.btmOprList.sort((prev, next) => {
                                return cachOrder.indexOf(prev.oid) - cachOrder.indexOf(next.oid)
                            })

                        }

                        this.oprOrder = this.btmOprList.map(b => { return b.oid });
                        localStorage.setItem('btmOpr', JSON.stringify(this.oprOrder));

                    }

                })
                
            },

            // 一键跳转到编辑表单
            toEditForm() {

                this.editOperation = false;

                const className = this.editQuickForm.goal.split("&")[0];
                const viewOid = this.editQuickForm.viewName;
                let viewName = '';

                let isPcView = this.viewList.findIndex((p) => {
                    return p.value == viewOid
                })
                viewName = this.viewList[isPcView].label;

                let cType = this.editQuickForm.goal.split('&')[1] == 'e' ? 'entity' : 'relation';
                let a = document.createElement('a');
                let url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/${className}/${viewName}?token=${sessionStorage.getItem('tokenM')}&formType=${this.appType}&classType=${cType}`;
                a.href = url;
                a.target="_blank";
                a.click();
                // var route = this.$store.state.app.newRoutes.filter(item => item.children
                // && item.children.length > 0 && item.children[0].meta
                // && item.children[0].meta.className == className
                // && item.children[0].meta.formName == viewName);
                // if (route.length > 0) {
                //     this.root.turnToPage(route[0].children[0].name);
                //     return;
                // }
                // route = {
                //     path: "/form-engine",
                //     name: "form-engine",
                //     meta: {
                //     icon: "md-help-buoy",
                //     title: "表单模型"
                //     },
                //     component: () => import("@/views/main/Main.vue"),
                //     children: [
                //     {
                //         path: `form-edit-${className}-${viewName}`,
                //         name: `form-edit-${className}-${viewName}`,
                //         meta: {
                //         className: className,
                //         formName: viewName,
                //         title: `修改表单-${className}-${viewName}`,
                //         path: 'form-engine/form-create.vue'
                //         },
                //     }
                //     ]
                // }
                // this.addRoute(route);
                // this.router.options.routes.push(route);
                // this.router.addRoutes([route]);
                // this.root.turnToPage(`form-edit-${className}-${viewName}`);

            },

            // 显示最大化编辑器窗口
            changeBigSize(formName) {
              this.isFullScreen = true;
              this.editOperation = false;


              this.$nextTick(() => {
                if(this.editQuickForm.action == 'implement') {

                  this.commonScript = this.editQuickForm.content;
                } else {

                  this.beforeParams = this.editQuickForm.beforeParams;
                  this.afterParams = this.editQuickForm.afterParams;

                }
              })

            },
            // 最大化脚本编辑确认
            confirmScript() {
                this.isFullScreen = false;

              this.$nextTick(() => {
                if(this.editQuickForm.action == 'implement') {

                  this.editQuickForm.content = this.commonScript;

                } else {

                  this.editQuickForm.beforeParams = this.beforeParams;
                  this.editQuickForm.afterParams = this.afterParams;

                }
              })

                this.editOperation = true;

            },
            // 关闭最大化脚本编辑弹窗
            cancelScript() {

                this.isFullScreen = false;
                this.editOperation = true;

                this.commonScript = '';
                this.beforeParams = '';
                this.afterParams = '';
            },
          inputQuery() {
            if(this.editQuickForm.goal){
              let options = {
                useStore: false,
                allowNative: false,
                refClassDisabled: true,
                hideRelationClass: ['left', 'right', 'relation']
              }
              let type = this.editQuickForm.goal.split('&')[1] === 're' ? 're' : 'en';
              this.$refs.filterQuery_modal.initModal(this.editQuickForm.queryCont, this.editQuickForm.goal.split('&')[0], options, false, type);
            }
          },
          getFilterQuery(finallyFilterQuery){
            this.editQuickForm.queryCont = finallyFilterQuery;
          },

            renderWithButton(h, {root, node, data}) {
                return <div style={[this.treeRowWrap]}>
                {data.displayName}
                <span style="float:right;margin-right:8px">
                        <i-button id="createOprButton" v-show={!data.rootClassName || data.action == 'folder'} icon={"md-add"} type={"primary"} size={"small"}
                                    onClick={this.addOperation.bind(this, data)}
                                    style={"margin-right:8px"}/>
                        <i-button id="deleteButton" icon={"md-remove"} size={"small"}
                                    onClick={this.delInfo.bind(this, data)}
                                    disabled={this.isDefaultFun(data)}
                                    style={"margin-right:8px"}/>
                        <i-button id="editButton" icon={"md-create"} size={"small"}
                                    onClick={this.editInfo.bind(this, data)}
                                    style={"margin-right:8px"}/>
                        <i-button icon={"md-arrow-round-up"} size={"small"}
                                    onClick={this.upItems.bind(this, node, data)}
                                    disabled={!data.rootClassName ? !this.EditModules : this.disabledOpe[data.rootClassName] != true}
                                    style={"margin-right:8px"}/>
                        <i-button icon={"md-arrow-round-down"} size={"small"}
                                    onClick={this.downItems.bind(this, node, data)}
                                    disabled={!data.rootClassName ? !this.EditModules : this.disabledOpe[data.rootClassName] != true}
                                    style={"margin-right:8px"}/>
                        </span>
                </div>;
            },
        },
        computed: {
            editorLang(){
                if((this.editQuickForm.action === 'implement' || this.editQuickForm.action === 'global_implement') && this.editQuickForm.radio === '后端脚本'){
                    return 'java';
                } else if(this.editQuickForm.radio === '存储过程'){
                    return 'pgsql'
                } else{
                    return 'javascript'
                }
            },
            temBtmOprList() {

                let finalArr = [];
                if(this.btmOprList.length > 0) {

                    finalArr = [...this.btmOprList];
                    finalArr = finalArr.map(f => {

                        let defObj = {
                            actImg: '',
                            defImg: '',
                            autoClose: 'auto',
                            btmIconActColor: "#1989fa",
                            btmIconDefColor: "#646566",
                            btmIconType: "系统图标",
                            needDefaultOpr: false,
                            needDialogDefaultOpr: true
                        }
                        if('extSettings' in f) {
                            
                            if(typeof f.extSettings == 'string') {

                                try {
                                    f.extSettings = JSON.parse(f.extSettings);
                                } catch (error) {

                                    console.log(error);
                                    f.extSettings = defObj;

                                }

                            }

                        } else {
                            f['extSettings'] = defObj;
                        }
                        
                        return f
                    })

                }
                console.log(finalArr)
                return finalArr;

            }
        },
        watch: {
            'editQuickForm.radio'(nval, oval) {
                if(oval == '后端脚本'){
                    this.contentCatch['serverScript'] = this.editQuickForm.content;
                }else if(oval == '存储过程'){
                    this.contentCatch['procedure'] = this.editQuickForm.content;
                }else if(oval == '前端脚本'){
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

            }
        },
        mounted() {

            this.isInitPromise = true;
            this.initData();
            this.$Spin.show();
            console.log(this.disabledOpe)
            this.showTabs = sessionStorage.getItem('showTabs') == 'hide' ? false : true
            let self = this;
            setTimeout(() => {

                try {
                    
                    canvas = document.getElementById('qrcanvas');

                    let proto = window.location.protocol;
                    let host = window.location.host;
                    host = host.replace("8080", "8081");
                    // let shareMobileValue = `${proto}//${host}/${Config.baseMobileRouteName}/login`;
                    let curAppName = localStorage.getItem('itemAppName') || 'default';
                    let shareMobileValue = `${proto}//${host}/${Config.baseMobileRouteName}/login?codeToAppName=${curAppName}`;

                    QRCode.toCanvas(canvas, shareMobileValue, (error) => {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log('success')
                        }
                    })


                } catch (error) {
                    console.log(error)
                }
                self.$Spin.hide();

            }, 2000)
            // if(this.appType == 'Mobile') {

            //     this.$nextTick(function () {

            //         // DOM操作
            //         canvas = document.getElementById('qrccode-canvas');
            //         let canv = this.$refs.qrCanvas;
            //         console.log(canv)

            //             console.log(canvas);
            //             let proto = window.location.protocol;
            //             let host = window.location.host;
            //             host = host.replace("8080", "8081");
            //             let shareMobileValue = `${proto}//${host}/${Config.baseAppRouteName}/login`;
            //             console.log(shareMobileValue);

            //             QRCode.toCanvas(canvas, 'https://segmentfault.com/', (error) => {
            //                 if (error) {
            //                     console.log(error)
            //                 } else {
            //                     console.log('success')
            //                 }
            //             })

                    

            //     })
                
            // }
        }
    }
</script>

<style scoped>
    .fl {
        float: left;
    }
    .pc-tree>>>.ivu-tree-title {
        width: calc(100% - 20px);
    }
    .app-head {
        height: 60px;
        line-height: 60px;
        background: #fff;
        padding: 0 20px 0 30px;
        color: #000;
    }
    .info-wrap {
        position: fixed;
        z-index: 1;
        right: 30px;
        top: 120px;
        display: inline-block;
        width: 40%;
        max-width: 600px;
        min-width: 266px;
        min-height: 300px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 1px 6px #ccc;
        background: #fff;
        padding: 0;
    }

    .tree-wrap {
        position: relative;
        z-index: 2;
        display: inline-block;
        min-width: 266px;
        width: 50%;
        padding: 4px;
        margin-top: 16px;
        border: 1px solid #ccc;
        box-shadow: 0 1px 6px #ccc;
        border-radius: 4px;
        background: #fff;
        max-height: 70vh;
        overflow-y: auto;
    }

    @media screen and (max-width: 1550px) {
        .tree-wrap {
            width: 60%;
        }
        .app-head {
            height: 50px;
            line-height: 50px;
        }
    }

    .tree-wrap:hover, .info-wrap:hover {
        box-shadow: 0 1px 6px #aaa;
    }

    .tree-row-wrap {
        display: inline-block;
        width: 85%;
        padding: 4px 0;
        border-bottom: 1px solid #ddd;
        line-height: 32px;
        margin: -4px 0
    }

    .phoneBg-wrap {
        position: relative;
        height: 779px;
        text-align: center;
    }

    .phoneBg-content {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 293px;
        height: 580px;
        background-repeat: no-repeat;
        background-position: center;
        margin-top: -290px;
        margin-left: -146.5px;
    }

    .header-module {
        position: relative;
        width: calc(100% - 3px);
        text-align: center;
        margin-top: 35px;
        border-bottom: 1px solid #ccc;
    }

    .btm-module {
        position: absolute;
        bottom: 10px;
        width: calc(100% - 23px);
        /* text-align: center; */
        margin-left: 10px;
        display: flex;
        box-sizing: content-box;
        border-top: 1px solid #ccc;
    }

    @media screen and (max-width: 1550px) {
        .phoneBg-content {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 210px;
            height: 480px;
            background-repeat: no-repeat;
            background-position: center;
            margin-top: -270px;
            margin-left: -105px;
        }

        .header-module {
            margin-top: 50px;
        }

        .btm-module {
            bottom: 40px;
        }
    }

    .opr-item {
        display: flex;
        -webkit-box-flex: 1;
        flex: 1;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        flex-direction: column;
        -webkit-box-align: center;
        align-items: center;
        -webkit-box-pack: center;
        justify-content: center;
        line-height: 1;
    }

    .top-icon {
        position: absolute; 
        right: 20px;
        font-size: 18px;
        top: 50%;
        margin-top: -6px;
        color: #666;
    }

    .set-content {

        background: #fff;
        margin-bottom: 15px;
        border-radius: 4px;
        border: 1px solid #ddd;
        padding-left: 20px;

    }

    .set-content-head {
        height: 50px;
        line-height: 50px;
        margin-top: 15px;
    }

    .set-content-center {
        height: 135px;
    }
    
    .set-content-bottom {
        height: 420px;
        margin-bottom: 0;
    }

    .set-head-label {
        margin-right: 10px;
        font-weight: 500;
        color: #212121;
    }

    .set-head-row {
        height: 32px;
        line-height: 32px;
        margin-top: 10px;
    }

    .content-head {
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #f1f2f3;
    }

    .content-content {
        padding-left: 30px;
    }

    .QRcode {
        width: 110px;
        height: 110px;
        margin: 0 auto;
    }
    .QRcode img {
        width: 100%;
        height: 100%;
    }
    #qrcanvas {
        width: 148px !important;
        height: 148px !important;
    }

    .btm-opr-row {
        height: 50px;
        line-height: 50px;
        border-radius: 4px;
        border: 1px solid #EEE;
        margin-bottom: 5px;
        padding-left: 10px;
    }

    .btm-opr-row-width {
        width: 90.8%;
    }

    .btm-row-icon {
        font-size: 16px;
        color: #999;
        cursor: pointer;
    }

    .btm-row-icon-large {
        font-size: 20px;
    }

    .btm-row-input {
       width: 280px;
       margin-right: 10px;
       float: left;
    }

    .btm-row-inputBtn {
        margin-top: 9px;
    }

    @media screen and (max-width: 1550px) {
        .phoneBg-wrap {
            height: 635px;
        }

        .set-content-bottom {
            height: 388px;
            margin-bottom: 0;
        }
        .drag-wrap {
            height: 228px;
            overflow-y: auto;
        }

        .btm-opr-row {
            height: 40px;
            line-height: 40px;
        }
        
        .btm-row-inputBtn {
            margin-top: 4px;
        }

        .btm-opr-row-width {
            width: 90.5%;
        }
        #qrcanvas {
            width: 106px !important;
            height: 106px !important;
        }
    }

    label {
        /* font-size: 15px !important;
        font-weight: 600; */
        margin-left: 4px;
    }

    .auth-card-enter-active, .auth-card-leave-active {
        transition: all .5s ease;
    }

    .auth-card-enter, .auth-card-leave-to {

        transform: translateX(600px);
        opacity: 0;

    }

    .appTitle {
        height: 80px;
    }

    .errorTips {
        color: red;
    }
</style>
