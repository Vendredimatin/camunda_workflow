<template>
  <div class="form_create" style="min-height: 600px">

    <QueryOprDialog ref="opr_dialog"
                    :route="route"
                    :router="router"
                    :root="root"
                    :store="qrStore"
                    :json-data="jsonData">
    </QueryOprDialog>

    <!--
      数据模型弹框
      -->
    <Modal
      v-model="addRowModal"
      title="新增属性"
      :mask-closable="false"
      width="70%"
    >
      <Form ref="addRowForm" :model="addRowData" :rules="rowValidate2" :label-width="80">
        <Row>
          <Col span="12">
            <FormItem label="属性名称" prop="attributeName" style="width: 100%">
              <Input
                v-model="addRowData.attributeName"
                placeholder="输入属性名"
                @on-blur="addAttrBlur('addRowData')"
              >
              </Input>
            </FormItem>
          </Col>
          <Col span="12" style="padding-left: 2%">
            <FormItem label="显示名称" prop="displayName" style="width: 100%">
              <Input v-model="addRowData.displayName" placeholder="输入属性显示名"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="数据类型" prop="valueType" style="width: 100%">
              <Select v-model="addRowData.valueType" placeholder="选择数据类型" filterable @on-change="getValueLength">
                <Option v-for="(value, key) in filterValueTypes" :value="key" :key="key" :label="key">
                  <span>{{ key }}</span>
                  <span style="float:right; color:#ccc">{{ value }}</span>
                </Option>
              </Select>
            </FormItem>
          </Col>

          <Col span="9" style="padding-left: 2%">
            <FormItem label="数据长度" prop="valueLength" style="width: 100%">
              <InputNumber v-if="noTime" style="width: 100%;" v-model="addRowData.valueLength"
                           :disabled="(addRowData.valueType !== 'String' && addRowData.valueType !== 'Clob') || (addRowData.valueType == 'String' && limitLength)"
                           :min="0" :max="65535" id="createAttrModalValueLength"></InputNumber>
              <Select v-else v-model="addRowData.valueLength" filterable
                      :disabled="limitLength && !['Date', 'Time', 'TimeStamp'].includes(addRowData.valueType)">
                <Option :value="0">秒</Option>
                <Option :value="3">毫秒</Option>
                <Option :value="6">微秒</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="3" v-show="addRowData.valueType === 'String'" style="padding: 8px 0 0 0;text-align: right;">
            <!-- <div style="padding-right: 30%"> -->
            <span style="margin-right: 10px;font-size: 12px !important;">不限长度</span>
            <i-switch size="small" v-model="limitLength" @on-change="changeLimit"/>
            <!-- </div> -->
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="默认控件" prop="defaultComponent" style="width: 100%">
              <Select v-model="addRowData.defaultComponent" clearable filterable>
                <Option v-for="(value, key) in singleControl" :value="value.name" :key="key" :label="value.note">
                  <span>{{ value.note }}</span>
                  <span style="float:right; color:#ccc">{{ value.name }}</span>
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12" style="padding-left: 2%">
            <FormItem label="数据字典" prop="attrDict" style="width: 100%">
              <Select v-model="addRowData.attrDict" :disabled="isSysType || dictDisabled" class="attrDict" clearable filterable>
                <Option v-for="(value, key) in attrDict" :value="value.type" :key="key" :label="value.desc">
                  <span>{{ value.desc }}</span>
                  <span style="float:right; color:#ccc">{{ value.type }}</span>
                </Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="查询方式" prop="queryBoxDisplayType" style="width: 100%">
              <Select v-model="addRowData.queryBoxDisplayType" clearable filterable transfer>
                <Option v-for="(value, key) in attrItems" :value="value.value" :key="key" :label="value.label">
                  <span>{{ value.label }}</span>
                  <span style="float:right; color:#ccc">{{ value.value }}</span>
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12" style="padding-left: 2%">
            <FormItem label="排序" prop="order" style="width: 100%">
              <InputNumber v-model="addRowData.order" :min="0" :max="65535" style="width: 100%"></InputNumber>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem label="默认值" prop="defaultValue" style="width: 100%">
              <Input v-model="addRowData.defaultValue" placeholder="输入默认值"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12" style="padding-left: 80px; display: flex">
            <FormItem label="允许空值" prop="nullable" label-position="left" :label-width="70" style="margin-right: 10px">
              <Checkbox v-model="addRowData.nullable"></Checkbox>
            </FormItem>
            <FormItem label="查询属性" prop="isInQueryBox" label-position="left" :label-width="70"
                      style="margin-right: 10px">
              <Checkbox v-model="addRowData.isInQueryBox"></Checkbox>
            </FormItem>
            <FormItem label="表格显示" prop="isInTable" label-position="left" :label-width="70" style="margin-right: 10px">
              <Checkbox v-model="addRowData.isInTable"></Checkbox>
            </FormItem>
            <FormItem label="表单显示" prop="isInForm" label-position="left" :label-width="70" style="margin-right: 10px">
              <Checkbox v-model="addRowData.isInForm"></Checkbox>
            </FormItem>
          </Col>
        </Row>

      </Form>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="addRowModal = false">取消</Button>
        <Button type="primary" size="large" :loading="addRowModalLoading" @click="addRow">确认</Button>
      </div>
    </Modal>

    <!--
      基础配置弹框,用于整体表单的基础属性配置
      -->
    <Modal
      v-model="configModal"
      title="基础配置"
      @on-ok=""
      class="basicConfig"
      id="basicConfigModal"
    >
      <Form :model="basicConfigForm" :rules="configValidate" ref="basicConfigForm">
        <FormItem prop="viewName">
          <p>表单名(英文名)</p>
          <Input disabled placeholder="表单名" v-model="basicConfigForm.viewName"/>
        </FormItem>

        <FormItem prop="viewDisplayName">
          <p>显示名(中文名)</p>
          <Input placeholder="显示名" v-model="basicConfigForm.viewDisplayName" id="basicConfigModalViewDisplayName"/>
        </FormItem>
        <FormItem prop="note">
          <p>备注</p>
          <Input v-model="basicConfigForm.note" type="textarea" placeholder="Enter something..."
                 id="basicConfigModalNote"></Input>
        </FormItem>
        <!--      </Form>-->
        <!--        <p>默认列数</p>-->
        <!--        <InputNumber :min="1" v-model="basicArgs.cols" style="display: inline-block; width: 100%"/>-->
        <!--        <p>标签区域对齐方式</p>-->
        <!--        <Select v-model="basicArgs.label_align">-->
        <!--          <Option v-for="item in labelAlignList" :key="item.value" :value="item.value">{{ item.name }}</Option>-->
        <!--        </Select>-->
        <!--        <p>主区域对齐方式</p>-->
        <!--        <Select v-model="basicArgs.main_align">-->
        <!--          <Option v-for="item in mainAlignList" :key="item.value" :value="item.value">{{ item.name }}</Option>-->
        <!--        </Select>-->
        <!--        <p>标签-主区域比例</p>-->
        <!--        <div>-->
        <!--          <InputNumber :min="1" v-model="basicArgs.label_width"/>-->
        <!--          :-->
        <!--          <InputNumber :min="1" v-model="basicArgs.main_width"/>-->
        <!--        </div>-->
        <!--        <p>单位行高</p>-->
        <!--        <InputNumber :min="20" v-model="basicArgs.basic_height" style="display: inline-block; width: 100%"/>-->
        <p>初始化操作</p>
        <BindOperationBar
          v-if="eventOfOperationBarInit"
          index="1"
          :opr_path="init_opr_path"
          :opr_type="init_opr_type"
          :opr_sys_path="init_opr_sys_path"
          :opr_showMessage="init_opr_showMessage"
          :form_targetclass="createForm.chosenClass"
          v-on:on-change="handleChangeEventOfOperationBar_init"
          :load_query_oprs="query_oprs"
          :form_json="jsonData"
          :route="route"
          :router="router"
          :root="_root"
          style="width:100%"></BindOperationBar>
        <p>默认操作</p>
        <BindOperationBar
          v-if="eventOfOperationBar"
          index="1"
          :opr_path="default_opr_path"
          :opr_type="default_opr_type"
          :opr_sys_path="default_opr_sys_path"
          :opr_showMessage="default_opr_showMessage"
          :form_targetclass="createForm.chosenClass"
          v-on:on-change="handleChangeEventOfOperationBar"
          :load_query_oprs="query_oprs"
          :form_json="jsonData"
          :route="route"
          :router="router"
          :root="_root"
          style="width:100%"></BindOperationBar>

        <div>
          <p style="float: left">默认多对象控件:</p>
          <Button style="float: left;" type="default" size="small" shape="circle" icon="md-sync"
                  @click="freshMultiAddins"></Button>
          <Select v-model="basicArgs.defaultMultiAddin" clearable>
            <Option v-for="item in multiAddins" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </div>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="configModal = false">取消</Button>
        <Button type="primary" size="large" @click="configOk">确认</Button>
      </div>
    </Modal>

    <!--
      快速创建弹窗,用于使用默认配置快速生成一个表单
      -->
    <Modal
      v-if="!isRelation"
      v-model="quickCreateModal"
      id="quickCreateEntityModal"
      title="快速创建"
      @on-ok="quickCreateOk"
    >
      <Form :models="quickCreateArgs" :label-width="80">

        <Button type="primary" style="margin: 5px" @click="addQuickCreateGroup" id="quickCreateEntityModalAddGroup">
          新增分组
        </Button>

        <Collapse v-model="currentGroup" accordion>
          <Panel v-for="(group, index) in quickCreateArgs" :key="index" :name="index.toString()">
            <Input v-model="group.groupName" placeholder="分组名称" style="display: inline-block; width: 25%"
                   @click.native.stop></Input>
            <p style="width: 20%; display: inline-block; text-align: center">创建列数</p>
            <InputNumber :min="1" v-model="group.cols" style="display: inline-block; width: 25%" @click.native.stop/>
            <Button type="primary" icon="md-arrow-round-up" size="small"
                    style="display: inline-block; margin: 0px 2px; text-align: center"
                    @click.stop="moveupQuickCreateGroup(index)"></Button>
            <Button type="primary" icon="md-arrow-round-down" size="small"
                    style="display: inline-block; margin: 0px 2px; text-align: center"
                    @click.stop="movedownQuickCreateGroup(index)"></Button>
            <Button type="error" icon="md-close" size="small"
                    style="display: inline-block; margin: 0px 2px; text-align: center"
                    @click.stop="deleteQuickCreateGroup(index)"></Button>

            <!-- <p slot="content">创建属性选择</p> -->
            <Tag slot="content" v-for="(attr, i) in group.selectedAttributes" :name="attr" closable
                 @on-close="handleCloseTag(index, i)"> {{ attributesDict[attr] }}
            </Tag>
            <CheckboxGroup slot="content" v-model="group.selectedAttributes">
              <p>类属性</p>
              <Checkbox class="quickCheck"
                        v-for="(item, i) in attrGroup[1]"
                        :key="i"
                        :label="item.attributeName"
              >{{ item.displayName || item.attributeName }} {{
                  selectedAttributesCounter[item.attributeName] ? "×" +
                    selectedAttributesCounter[item.attributeName] : ""
                }}
              </Checkbox>
              <p>系统属性</p>
              <Checkbox class="quickCheck"
                        v-for="(item, i) in attrGroup[0]"
                        :key="item.attributeName"
                        :label="item.attributeName"
              >{{ item.displayName }} {{
                  selectedAttributesCounter[item.attributeName] ? "×" +
                    selectedAttributesCounter[item.attributeName] : ""
                }}
              </Checkbox>
            </CheckboxGroup>
            <Button slot="content" type="primary" style="margin: 5px" @click="quickSelectAll(index)"
                    id="quickCreateEntityModalAllSelect">全部选择
            </Button>
            <Button slot="content" type="error" style="margin: 5px" @click="quickCancelAll(index)"
                    id="quickCreateEntityModalAllCancel">全部取消
            </Button>
          </Panel>
        </Collapse>
      </Form>
    </Modal>

    <Modal
      v-if="isRelation"
      v-model="quickCreateModal"
      id="quickCreateRelationModal"
      title="快速创建"
      @on-ok="quickCreateRelation"
    >
      <Form :models="quickCreateArgs" :label-width="80">

        <Button type="primary" style="margin: 5px" @click="addQuickCreateGroup" id="quickCreateRelationModalAddGroup">
          新增分组
        </Button>

        <Collapse v-model="currentGroup" accordion>
          <Panel v-for="(group, index) in quickCreateArgs" :key="index" :name="index.toString()">
            <Input v-model="group.groupName" placeholder="分组名称" style="display: inline-block; width: 25%"
                   @click.native.stop></Input>
            <p style="width: 20%; display: inline-block; text-align: center">创建列数</p>
            <InputNumber :min="1" v-model="group.cols" style="display: inline-block; width: 25%" @click.native.stop/>
            <Button type="primary" icon="md-arrow-round-up" size="small"
                    style="display: inline-block; margin: 0px 2px; text-align: center"
                    @click.stop="moveupQuickCreateGroup(index)"></Button>
            <Button type="primary" icon="md-arrow-round-down" size="small"
                    style="display: inline-block; margin: 0px 2px; text-align: center"
                    @click.stop="movedownQuickCreateGroup(index)"></Button>
            <Button type="error" icon="md-close" size="small"
                    style="display: inline-block; margin: 0px 2px; text-align: center"
                    @click.stop="deleteQuickCreateGroup(index)"></Button>

            <!-- <p slot="content">关联类属性选择</p> -->
            <Tag slot="content" v-for="(attr, i) in group.relationAttributes" :name="attr" closable
                 @on-close="handleRelationCloseTag(index, i)"> {{ relationAttributesDict[attr] }}
            </Tag>
            <CheckboxGroup slot="content" v-model="group.relationAttributes">
              <p>关联类类属性</p>
              <Checkbox class="quickCheck"
                        v-for="item in attrGroup[1]"
                        :key="item.attributeName"
                        :label="item.attributeName"
              >{{ item.displayName || item.attributeName }} {{
                  selectedAttributesCounter[item.attributeName] ? "×" +
                    selectedAttributesCounter[item.attributeName] : ""
                }}
              </Checkbox>
              <p>关联类系统属性</p>
              <Checkbox class="quickCheck"
                        v-for="item in attrGroup[0]"
                        :key="item.attributeName"
                        :label="item.attributeName"
              >{{ item.displayName }} {{
                  selectedAttributesCounter[item.attributeName] ? "×" +
                    selectedAttributesCounter[item.attributeName] : ""
                }}
              </Checkbox>
            </CheckboxGroup>
            <!-- <p slot="content">左类属性选择</p> -->
            <Tag slot="content" v-for="(attr, i) in group.leftAttributes" :name="attr" closable
                 @on-close="handleLeftCloseTag(index, i)"> {{ relationAttributesDict[attr] }}
            </Tag>
            <CheckboxGroup slot="content" v-model="group.leftAttributes">
              <p>左类类属性</p>
              <Checkbox class="quickCheck"
                        v-for="item in attrGroup[3]"
                        :key="item.attributeName"
                        :label="item.attributeName"
              >{{ item.displayName || item.attributeName }} {{
                  selectedAttributesCounter[item.attributeName] ? "×" +
                    selectedAttributesCounter[item.attributeName] : ""
                }}
              </Checkbox>
              <p>左类系统属性</p>
              <Checkbox class="quickCheck"
                        v-for="item in attrGroup[2]"
                        :key="item.attributeName"
                        :label="item.attributeName"
              >{{ item.displayName }} {{
                  selectedAttributesCounter[item.attributeName] ? "×" +
                    selectedAttributesCounter[item.attributeName] : ""
                }}
              </Checkbox>
            </CheckboxGroup>
            <!-- <p slot="content">右类属性选择</p> -->
            <Tag slot="content" v-for="(attr, i) in group.rightAttributes" :name="attr" closable
                 @on-close="handleRightCloseTag(index, i)"> {{ relationAttributesDict[attr] }}
            </Tag>
            <CheckboxGroup slot="content" v-model="group.rightAttributes">
              <p>右类类属性</p>
              <Checkbox class="quickCheck"
                        v-for="item in attrGroup[5]"
                        :key="item.attributeName"
                        :label="item.attributeName"
              >{{ item.displayName || item.attributeName }} {{
                  selectedAttributesCounter[item.attributeName] ? "×" +
                    selectedAttributesCounter[item.attributeName] : ""
                }}
              </Checkbox>
              <p>右类系统属性</p>
              <Checkbox class="quickCheck"
                        v-for="item in attrGroup[4]"
                        :key="item.attributeName"
                        :label="item.attributeName"
              >{{ item.displayName }} {{
                  selectedAttributesCounter[item.attributeName] ? "×" +
                    selectedAttributesCounter[item.attributeName] : ""
                }}
              </Checkbox>
            </CheckboxGroup>
            <Button slot="content" type="primary" style="margin: 5px" @click="quickSelectRelationAll(index)"
                    id="quickCreateRelationModalAllSelect">全部选择
            </Button>
            <Button slot="content" type="error" style="margin: 5px" @click="quickCancelRelationAll(index)"
                    id="quickCreateRelationModalAllCancel">全部取消
            </Button>
          </Panel>
        </Collapse>
      </Form>
    </Modal>

    <!--
      批注弹窗
      -->
    <Modal
      v-model="commentModal"
      title="批注信息"
      @on-ok="confirmComment"
    >
      <div>
        <Input v-model="addin_comment" type="textarea" :rows="4" placeholder="批注"/>
      </div>
    </Modal>
    <!--
      预览表单弹窗,用于表单在应用端页面的预览显示
      -->
    <Modal
      v-model="previewModal"
      title="预览表单"
      width="1000px">
      <iframe v-if="previewUrl" :src="previewUrl" style="width: 100%;height:600px"></iframe>
    </Modal>

    <!--
      创建表单弹窗,用于指定实体类和表单名
      -->
    <Modal
      v-model="createModal"
      :title="createModalTitle"
      width="1000px"
      height="500px"
      class="createModal"
      @on-cancel="cancel"
      :mask-closable="false"
    >

      <Row>
        <Col span="8">
          <Row class="deviceBtn-wrap">
            <Col v-for="(item, index) in deviceTypeList" span="12" @click.native="actDev(index)" class="deviceBtn" :style="{'background': actDevice == index ? '#2D8CF0' : '#eee', 'color': actDevice == index ? '#fff' : '#666'}">
              <span>{{ item }}</span>
            </Col>
          </Row>
          <Form :model="createForm" :rules="rowValidate" ref="createForm">
            <FormItem prop="chosenClass" label="目标类">
              <br>
              <Select v-model="createForm.chosenClass" filterable clearable ref="chosenClass"
                      style="width:300px" @on-change="handleClassChange">
                <OptionGroup label="实体类" v-if="isEN">
                  <Option v-for="item in entitiesList" :value="item.className" :key="item.id" :label="item.className">
                    <span>{{ item.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ item.className }}</span>
                  </Option>
                </OptionGroup>
                <OptionGroup label="关联类" v-if="!isEN">
                  <Option v-for="item in relationsList" :value="item.className" :key="item.id" :label="item.className">
                    <span>{{ item.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ item.className }}</span>
                  </Option>
                </OptionGroup>
              </Select>
            </FormItem>
            <FormItem prop="viewName" label="表单名(英文名)">
              <br>
              <Input :disabled="viewDisabled" placeholder="表单名" style="width: 300px" v-model="createForm.viewName"/>
            </FormItem>

            <FormItem prop="viewDisplayName" label="显示名(中文名)">
              <br>
              <Input placeholder="显示名" style="width: 300px" v-model="createForm.viewDisplayName"/>
            </FormItem>
            <FormItem prop="note" label="备注">
              <br>
              <Input v-model="createForm.note" type="textarea" :autosize="true" placeholder="Enter something..."
                     style="width: 300px"></Input>
            </FormItem>

          </Form>
          <!-- <br>
          <Checkbox v-model="hasRelatedClass" @on-change="handleRelatedClass">关联类</Checkbox>
          <br>
          <br>
          <div v-show="hasRelatedClass">
            <label>选择关联类</label>
            <Select v-model="chosenRelatedClass" filterable style="width: 300px">
              <Option v-for="item in relatedClasses" :value="item.className" :label="item.className" :key="item.oid">
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.className }}</span>
              </Option>
            </Select>
          </div> -->
          <!-- <label>备注</label><br>
          <Input v-model="createForm.note" type="textarea" placeholder="Enter something..."
                 style="width: 300px"></Input> -->
        </Col>
        <Col span="16">
          <!-- <div style="height: 400px;width: 100%;background-color: #EEE;overflow-y: scroll">
            <Row type="flex"> -->
              <div style="height: 400px;width: 100%;overflow-y: auto;border-radius: 4px;border: 1px solid #E0E0E0;">
              <Row type="flex" id="innerIconWrapperTable" style="padding: 20px 20px 0;">
                <div v-for="(view, i) in templateList" @click="createFormBaseMould(view)" class="template-list" :class="{'template-margin': i % 3 == 1}" style="width: 31%; text-align: center;margin-bottom: 20px;">
                  <img :src="view.icon" :class="{'template-border': templateViewData.templateName == view.templateName}" style="width: 100%;margin-bottom: 5px;"/>
                  {{view.displayName}}
              </div>
            </Row>
            <!-- <Row type="flex" v-else>
              <InnerIconWrapper v-for="view in chosenViews"
                                :target-id="view.oid"
                                :form-type="createForm.chosenType"
                                :class-name="createForm.chosenClass"
                                :title="view.viewName"
                                :displayName="view.displayName || '--'"
                                :createTime="getdate(view.createTime || '')"
                                :lastModifyTime="getdate(view.lastModifyTime || '')"
                                :note="view.note"
                                style="width: 50%"
                                :has-click-menu="false"
                                :has-hover="false"
                                :chosen="chosenViewId===view.oid"
                                @changeChosenView="changeChosenView"/>

              <InnerIconWrapper target-id="0"
                                :form-type="createForm.chosenType"
                                :class-name="createForm.chosenClass"
                                :has-click-menu="false"
                                :has-hover="false"
                                :title="'createForm'"
                                style="width: 50%"
                                :chosen="chosenViewId==='0'"
                                @changeChosenView="changeChosenView"/>
            </Row> -->
          </div>
        </Col>
      </Row>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large"
                @click="ok">
          确认
        </Button>
      </div>
    </Modal>

    <!--
      工具栏
      -->
    <Layout ref="header" class="headTool-wrapper">
      <Header style="display: flex;">
        <aside style="text-align: center; width: 215px; min-width: 215px;">
          <ul class="headTool-l headTool-btn headTool-opr">
            <li>
              <Button type="text" title="创建表单" icon="ios-paper" class="noBorder" @click="onCreateForm">
                <span style="font-size: 12px;">创建</span>
              </Button>
            </li>
            <li>
              <Button type="text" title="复制表单" icon="ios-copy" class="noBorder" @click="onCopyForm">
                <span style="font-size: 12px;">复制</span>
              </Button>
            </li>
            <li>
              <Button type="text" title="删除表单" icon="ios-trash" class="noBorder" @click="onDeleteForm">
                <span style="font-size: 12px;">删除</span>
              </Button>
            </li>
            <li>
              <Button type="text" title="清空表单" icon="ios-backspace" class="noBorder" @click="onInitalForm">
                <span style="font-size: 12px;">清空</span>
              </Button>
            </li>
            <!-- <li>
                <Button type="default" icon="md-settings" class="noBorder">表单配置</Button>
            </li> -->
          </ul>
          <!--          <div v-else>&nbsp</div>-->
          <Divider style="float: right; margin: 5px 0px;" type="vertical" class="headTool-divider"/>
        </aside>
        <Row class="top-tool">
          <Col :md="24" :lg="24" :xl="24" :xxl="24">
            <Menu class="action_bar" @on-select="action" mode="horizontal" theme="dark" active-name="1">
              <div class="index-layout-nav">
                <MenuItem name="1" class="minMenu">
                  <Button type="text" icon="ios-undo" :loading="undoing" :disabled="undoDisabled" class="noBorder"
                          style="padding: 0px;">
                  </Button>
                </MenuItem>
                <MenuItem name="2" class="minMenu">
                  <Button type="text" icon="ios-redo" :loading="redoing" :disabled="redoDisabled" class="noBorder"
                          style="padding: 0px;">
                  </Button>
                </MenuItem>
                <!--                <MenuItem name="3" class="minMenu">-->
                <!--                  <Icon type="ios-color-fill"></Icon>-->
                <!--                </MenuItem>-->
                <!--                <MenuItem name="3" class="minMenu">-->
                <!--                  <Icon type="ios-color-fill"></Icon>-->
                <!--                </MenuItem>-->
                <!--                <MenuItem name="4" class="minMenu">-->
                <!--                  <Icon type="md-code-working"/>-->
                <!--                  Json-->
                <!--                </MenuItem>-->
                <!--                <MenuItem name="5" class="minMenu">-->
                <!--                  <Icon type="ios-browsers"/>-->
                <!--                  布局-->
                <!--                </MenuItem>-->
                <!-- <MenuItem name="5">
                  <Icon type="ios-eye"></Icon>
                  边框
                </MenuItem> -->
                <!--                <MenuItem name="6" class="minMenu">-->
                <!--                  <Icon type="md-close"></Icon>-->
                <!--                  删除-->
                <!--                </MenuItem>-->
                <!--                <MenuItem name="7" class="minMenu">-->
                <!--                  <Icon type="ios-color-palette"/>-->
                <!--                  快速创建-->
                <!--                </MenuItem>-->
                <!--                <MenuItem name="8" class="minMenu">-->
                <!--                  <Icon type="ios-build"></Icon>-->
                <!--                  基础配置-->
                <!--                </MenuItem>-->
              </div>
            </Menu>
            <ul class="headTool-form-margin">
              <!--              <li class="headTool-li"><span class="number">表单：</span></li>-->
              <li class="headTool-li">
                <ColorPicker @on-change="() => {setBasicArgs('form_bgColor')}" v-model="basicArgs.form_bgColor"/>
              </li>
              <!--              <li class="headTool-li">-->
              <!--                <InputNumber class="headTool-form-margin-input" @on-change="setBasicArgs"-->
              <!--                             v-model="basicArgs.form_fsize"/>-->
              <!--              </li>-->
            </ul>
            <ul class="headTool-form-margin headTool-ul">
              <li class="headTool-li"><span class="number">行间距</span></li>
              <li class="headTool-li">
                <InputNumber class="headTool-form-margin-input" @on-change="() => {setBasicArgs('row_space')}"
                             v-model="basicArgs.row_space"/>
              </li>
            </ul>
            <!-- <ul class="headTool-form-margin">
              <li class="headTool-li"><span class="number">列间距</span></li>
              <li class="headTool-li">
                <InputNumber class="headTool-form-margin-input" @on-change="() => {setBasicArgs('col_space')}"
                             v-model="basicArgs.col_space"/>
              </li>
            </ul> -->
            <Divider type="vertical" class="headTool-divider"/>
            <div class="headTool-label-addin-proportion">
              <ul class="headTool-ul">
                <li v-show="basicArgs.labelWidthUnit === '%'" class="headTool-li"><span class="number">标签与主区域</span>
                </li>
                <li v-show="basicArgs.labelWidthUnit === 'px'" class="headTool-li"><span class="number">标签宽度</span></li>
                <li v-show="basicArgs.labelWidthUnit === '%'" class="headTool-li" style="margin-left: 10px;">
                  <InputNumber style="width: 50px;text-align: center" :min="0"
                               @on-change="() => {setBasicArgs('label_width')}"
                               v-model="basicArgs.label_width"/>
                  :
                  <div
                    style="display: inline-block;height: 32px;line-height: 32px;vertical-align: middle;margin: 0px;padding: 0px;width: 115px;">
                    <InputNumber class="margin1" v-model="basicArgs.main_width" :min="1"
                                 style="width: calc(100% - 65px);height: 32px;margin: 0px;top: 0px;border-radius: 4px 0 0 4px;top:-2px;"
                                 @on-change="() => {setBasicArgs('main_width')}">
                    </InputNumber>
                    <Select class="labelWidthUnit" v-model="basicArgs.labelWidthUnit"
                            style="width: 65px;background-color: #f8f8f9;position: relative;top:-2px;"
                            @on-change="() => {setBasicArgs('labelWidthUnit')}">
                      <Option value="%">比例</Option>
                      <Option value="px">px</Option>
                    </Select>
                  </div>
                  <!--                  <div style="display: inline-block;height: 32px;line-height: 32px;vertical-align: middle;margin: 0px;padding: 0px;">-->
                  <!--                    <Input class="margin1" v-model="basicArgs.main_width" type="number" style="width: 120px;height: 32px;margin: 0px;top: 0px;" @on-change="() => {setBasicArgs('main_width')}">-->
                  <!--                      <Select v-model="basicArgs.labelWidthUnit" slot="append" style="width: 60px;" @on-change="() => {setBasicArgs('labelWidthUnit')}">-->
                  <!--                        <Option value="%">比例</Option>-->
                  <!--                        <Option value="px">px</Option>-->
                  <!--                      </Select>-->
                  <!--                    </Input>-->
                  <!--                  </div>-->
                </li>
                <li v-show="basicArgs.labelWidthUnit === 'px'" class="headTool-li">
                  <InputNumber class="margin1" v-model="basicArgs.label_widthByPx" :min="1"

                               style="width: 60px;height: 32px;margin: 0px;top: 0px;border-radius: 4px 0 0 4px;"
                               @on-change="() => {setBasicArgs('label_widthByPx')}">
                  </InputNumber>
                  <Select class="labelWidthUnit" v-model="basicArgs.labelWidthUnit"
                          style="width: 60px;background-color: #f8f8f9;"
                          @on-change="() => {setBasicArgs('labelWidthUnit')}">
                    <Option value="%">比例</Option>
                    <Option value="px">px</Option>
                  </Select>
                  <!--                  <Input class="margin1" v-model="basicArgs.label_widthByPx" type="number" style="width: 120px;height: 32px;margin: 9px;" @on-change="() => {setBasicArgs('label_widthByPx')}">-->
                  <!--                    <Select v-model="basicArgs.labelWidthUnit" slot="append" style="width: 60px;" @on-change="() => {setBasicArgs('labelWidthUnit')}">-->
                  <!--                      <Option value="%">比例</Option>-->
                  <!--                      <Option value="px">px</Option>-->
                  <!--                    </Select>-->
                  </Input>
                </li>
              </ul>
            </div>
            <Divider type="vertical" class="headTool-divider"/>
            <div>
              <ul class="headTool-ul">
                <li class="headTool-li">
                  <RadioGroup type="button" size="small" v-model="formDisplayType" @on-change="displayTypeChange">
                    <Radio label="JSON"></Radio>
                    <Radio label="布局"></Radio>
                  </RadioGroup>
                </li>
                <li v-show='targetFormType == "PC"' class="headTool-li">
                  <Button size="small" type="default"
                          title="快速创建"
                          @click="quickCreateModal = true">
                    <i class="iconfont" style="font-size: 13px;font-style: normal;font-weight: 400;line-height: 1.5;">&#xe650;</i>
                  </Button>
                </li>
                <li class="headTool-li">
                  <Button icon="ios-build"
                          title="基础配置"
                          size="small" type="default" @click="openBasicConfigForm"></Button>
                </li>
                <li class="headTool-li" v-if="DefaultModuleBranch">
                  <Button icon="ios-create"
                          title="新增表单模板"
                          size="small" type="default" @click="addTemplateModal = true"></Button>
                </li>
              </ul>
            </div>
            <!--            <Divider type="vertical" class="headTool-divider"/>-->
            <ul class="headTool-l headTool-submit screen-headTool-submit-full">
              <!--              <li>-->
              <!--                <Button type="default" icon="ios-eye" class="noBorder" @click="previewForm">-->
              <!--                  <span style="font-size: 12px;">预览</span>-->
              <!--                </Button>-->
              <!--              </li>-->
              <li>
                <Button type="text" icon="ios-folder" class="noBorder" @click="saveForm">
                  <span style="font-size: 12px;">保存</span>
                </Button>
              </li>
              <li>
                <Button type="text" icon="md-share" class="noBorder" @click="shareForm">
                  <span style="font-size: 12px;">分享</span>
                </Button>
              </li>
              <li style="width: 75px;" v-show='targetFormType == "PC"'>
                <Button type="text" icon="md-filing" class="noBorder" @click="openAddComponentModal">
                  <span style="font-size: 12px;">存为组件</span>
                </Button>
              </li>
              <li>
                <Button type="text" icon="md-close" class="noBorder" @click="close">
                  <span style="font-size: 12px;">关闭</span>
                </Button>
              </li>
              <!--              <li class="headTool-li">-->
              <!--                <Button class="mr15" @click="saveForm">浏览</Button>-->
              <!--              </li>-->
              <!--              <li class="headTool-li">-->
              <!--                <Button class="mr15" @click="saveForm">保存</Button>-->
              <!--              </li>-->
              <!-- <Button class="mr15" type="primary" @click="previewForm">预览</Button> -->
              <!--              <li class="headTool-li">-->
              <!--                <Button type="primary" @click="shareForm">分享</Button>-->
              <!--              </li>-->
              <!--              <li class="headTool-li">-->
              <!--                <Button class="mr15" @click="close">关闭</Button>-->
              <!--              </li>-->
            </ul>
            <ul class="headTool-l headTool-submit screen-headTool-submit-narrow">
              <!--              <li class="headTool-li">-->
              <!--                <Button icon="ios-eye"-->
              <!--                        title="预览"-->
              <!--                        size="small" type="text" @click="previewForm"></Button>-->
              <!--              </li>-->
              <li class="headTool-li">
                <Button icon="ios-folder"
                        title="保存"
                        size="small" type="text" @click="saveForm"></Button>
              </li>
              <li class="headTool-li">
                <Button icon="md-share"
                        title="分享"
                        size="small" type="text" @click="shareForm"></Button>
              </li>
              <li v-show='targetFormType == "PC"' class="headTool-li">
                <Button icon="md-filing"
                        title="存为组件"
                        size="small" type="text" @click="openAddComponentModal"></Button>
              </li>
              <li class="headTool-li">
                <Button icon="md-close"
                        title="关闭"
                        size="small" type="text" @click="close"></Button>
              </li>
              <!--              <li class="headTool-li">-->
              <!--                <Button class="mr15" @click="saveForm">浏览</Button>-->
              <!--              </li>-->
              <!--              <li class="headTool-li">-->
              <!--                <Button class="mr15" @click="saveForm">保存</Button>-->
              <!--              </li>-->
              <!-- <Button class="mr15" type="primary" @click="previewForm">预览</Button> -->
              <!--              <li class="headTool-li">-->
              <!--                <Button type="primary" @click="shareForm">分享</Button>-->
              <!--              </li>-->
              <!--              <li class="headTool-li">-->
              <!--                <Button class="mr15" @click="close">关闭</Button>-->
              <!--              </li>-->
            </ul>
          </Col>

          <!--          <Col :md="5" :lg="6" :xl="5" :xxl="{ span: 4, offset: 1 }">-->
          <!--          </Col>-->
        </Row>
      </Header>
    </Layout>

    <!--
      工作区,由 控件点选区,表单渲染区,属性配置区 三个区域组成
      -->
    <div class="index-layout-content">
      <aside ref="sideBar"
             @dragenter="onDragEnter($event)"
             :style="{'display': sideDisplay, 'width': '215px', 'min-width': '215px', 'height': clientHeight + 'px', 'overflow-y': 'auto'}">
        <!--          <div style="height:40px">-->
        <!--            <sider-trigger :collapsed="collapsed" icon="md-menu" @on-change="handleCollpasedChange"-->
        <!--                           style="float: right"></sider-trigger>-->
        <!--          </div>-->
        <Collapse v-show="!collapsed" :value="open" class="noPadding addin-pools">
          <!-- <Panel name="1">
            类属性
            <p slot="content">
            <ul>
              <li class="selectItem" v-for="item in targetClassAttribute" :class="{ 'selected': item.attributeName === targetAttribute.attributeName }" style="margin: 5px" @click="changeChosenAttribute(item)">
                <div style="padding: 0 0 0 30px">
                  <img src="http://192.168.10.81:6060/dwf/v1/icons/application.png" />{{ item.displayName }}
                </div>
              </li>
            </ul>
            </p>
          </Panel>
          <Panel name="5">
            关联
          </Panel>
          <Panel name="6">
            操作
            <Row slot="content" ref="addins_opr">
              <Col v-for="item in col_opr" span="8" style="box-shadow: 0 1px 6px rgba(0, 0, 0, .117647), 0 1px 4px rgba(0, 0, 0, .117647)"></Col>
            </Row>
          </Panel> -->
          <Panel name="layout" class="self-collapse">
            布局
            <Row slot="content" ref="addins_layout" style="text-align: center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="layoutAddinIconList"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <div v-for="(item, index) in layoutAddinIconList" @dblclick="() => onDbClick(item)" span="11"
                     class="addin-pool" :key="index">
                  <FormAddinIconList v-bind="item"></FormAddinIconList>
                </div>
              </draggable>

              <Col ref="addins_layout_dragitem" span="11" class="addin-pool" v-if="targetFormType=='PC'">
                <section
                  addinName="DragItem"
                  style="text-align: center;height: 30px;display: block;font-size: 12px !important"
                  draggable="true"
                  @dragstart="(evt) => { onDragStart(evt, 'DragItem') }"
                  @dragend="onDragEnd"
                  @dblclick="() => onDbClick('DragItem')"
                >
                  <span style="text-align:center">
                      <div class="form-addin-icon">
                          <i class="iconfont">&#xe69f;</i>
                      </div>
                      <div class="form-addin-name">
                          拖拽块
                      </div>
                  </span>
                </section>
              </Col>
            </Row>
          </Panel>
          <Panel name="single" class="self-collapse">
            单对象控件
            <!--            <Row slot="content" ref="addins_single" style="text-align:center" v-show="false">-->
            <!--              <Col v-for="item in col_single" span="11" class="addin-pool"></Col>-->
            <!--            </Row>-->

            <Row slot="content" style="text-align:center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="singleAddinIconList"
                @start="onDragStart"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <div v-for="(item, index) in singleAddinIconList" @dblclick="() => onDbClick(item)" class="addin-pool"
                     :key="index">
                  <FormAddinIconList v-bind="item"></FormAddinIconList>
                </div>
              </draggable>
            </Row>
          </Panel>
          <Panel name="multi" class="self-collapse">
            多对象控件
            <Row slot="content" ref="addins_multi" style="text-align:center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="multiAddinIconList"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <div v-for="(item, index) in multiAddinIconList" @dblclick="() => onDbClick(item)" span="11"
                     class="addin-pool" :key="index">
                  <FormAddinIconList v-bind="item"></FormAddinIconList>
                </div>
              </draggable>
            </Row>
          </Panel>
          <Panel name="visual" class="self-collapse">
            可视化控件
            <Row slot="content" ref="addins_visual" style="text-align:center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="visualAddinIconList"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <div v-for="(item, index) in visualAddinIconList" @dblclick="() => onDbClick(item)" span="11"
                     class="addin-pool" :key="index">
                  <FormAddinIconList v-bind="item"></FormAddinIconList>
                </div>
              </draggable>
            </Row>
          </Panel>
          <Panel name="model" class="self-collapse">
            模型点选控件
            <Row slot="content" ref="addins_model" style="text-align:center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="modelAddinIconList"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <div v-for="(item, index) in modelAddinIconList" @dblclick="() => onDbClick(item)" span="11"
                     class="addin-pool" :key="index">
                  <FormAddinIconList v-bind="item"></FormAddinIconList>
                </div>
              </draggable>
            </Row>
          </Panel>
          <Panel name="code" class="self-collapse">
            编码扩展
            <Row slot="content" ref="addins_code" style="text-align:center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="codeAddinIconList"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <div v-for="(item, index) in codeAddinIconList" @dblclick="() => onDbClick(item)" span="11"
                     class="addin-pool" :key="index">
                  <FormAddinIconList v-bind="item"></FormAddinIconList>
                </div>
              </draggable>
            </Row>
          </Panel>
          <Panel name="timeseries" class="self-collapse">
            IoTDB专用控件
            <Row slot="content" ref="addins_timeseries" style="text-align:center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="timeSeriesAddinIconList"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <div v-for="(item, index) in timeSeriesAddinIconList" @dblclick="() => onDbClick(item)" span="11"
                     class="addin-pool" :key="index">
                  <FormAddinIconList v-bind="item"></FormAddinIconList>
                </div>
              </draggable>
            </Row>
          </Panel>
          <Panel name="collect" class="self-collapse">
            HTML/VUE收藏控件
            <Row slot="content" ref="addins_collect" style="text-align: center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="superAddinIconList"
                @start="onDragStart"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <Col v-for="(item, index) in superAddinIconList" span="11" class="addin-pool"
                     :key="item.argsProps.oidProps">
                  <IconUnit
                    v-bind="item"
                    @dblclick.native="() => onDbClick(item)"
                  ></IconUnit>
                </Col>
              </draggable>
            </Row>
          </Panel>

          <Panel
            v-if="targetFormType === 'PC'"
            :name="group.name" v-for="(group, groupIndex) in componentGroupAddin" class="self-collapse"
                 :key="groupIndex">
            <span v-if="group.displayName.length < 9">{{ group.displayName }}</span>
            <Tooltip v-if="group.displayName.length >= 9" max-width="200" :content="group.displayName" style=""
                     :transfer="true">
              {{ group.displayName.substr(0, 8) + '...' }}
            </Tooltip>
            <Row slot="content" :ref="`addins_componentGroup${groupIndex}`" style="text-align: center">
              <draggable
                class="dragArea list-group"
                ghost-class="vue-draggable-ghost"
                :sort="false"
                :list="componentGroupAddinIconList[groupIndex]"
                :group="{ name: 'addin', pull: 'clone', put: false }"
              >
                <Col v-for="(component, index) in componentGroupAddinIconList[groupIndex]" span="11" class="addin-pool"
                     :key="index">
                  <ComponentUnit
                    v-bind="component"
                    :componentGroupOid="group.oid"
                    :componentOid="component.oid"
                    :relationOid="component.relationOid"
                    @deleteComponentAddin="deleteComponentAddin"
                    @editComponentAddin="openEditComponentModal"
                    @dblclick.native="() => onDbClick(component)"
                  ></ComponentUnit>
                </Col>
              </draggable>
            </Row>
          </Panel>
          <div style="height: 100px"/>
        </Collapse>
      </aside>

      <Row class="form-container" :class="{
        'form-container-both': editVisible && !collapsed,
        'form-container-without-sidebar': editVisible && collapsed,
        'form-container-without-editbox': !editVisible && !collapsed,
        'form-container-without-both': !editVisible && collapsed,
      }">
        <i-col ref="formBar" span="24">
          <div class="headTool-form-wrapper"
               @dragenter="onDragEnter($event)">
            <div ref="formBarContainer" class="headTool-form-container">
              <div style="height:50px; float: left;">
                <sider-trigger :collapsed="collapsed"
                               :iconfont="true"
                               @on-change="handleCollpasedChange"
                               style="float: right;margin: 0px;line-height: 52px;height: 52px;padding: 0px;"></sider-trigger>
              </div>
              <!--            <Col span="6" style="height: 42px;line-height: 42px;">-->
              <!--              <Breadcrumb style="font-weight: 700; margin-left: 20px; float:left;">-->
              <!--                <BreadcrumbItem> {{ targetClassName }}</BreadcrumbItem>-->
              <!--                <BreadcrumbItem> {{ viewName }}</BreadcrumbItem>-->
              <!--              </Breadcrumb>-->
              <!--            </Col>-->

              <div class="headTool-form">
                  <ul class="device-wrap" v-show="targetFormType == 'Mobile'">
                    <li v-for="(item, index) in deviceList" :key="item.name" @click="actItem(index)">
                      <div :class="[activeIndex == index ? actIcon : '', activeClass]"></div>
                    </li>
                    <Spin size="large" fix v-if="loading" style="z-index: 3100"></Spin>
                  </ul>

                <div class="headTool-label-style">
                  <ul class="headTool-ul">
                    <li class="headTool-li"><span class="number">标签：</span></li>
                    <li class="headTool-li trans-color">
                      <ColorPicker transfer @on-change="() => {setBasicArgs('label_fontColor')}" v-model="basicArgs.label_fontColor"/>
                    </li>
                    <li class="headTool-li">
                      <InputNumber class="headTool-form-margin-input" @on-change="() => {setBasicArgs('lfsize')}"
                                   v-model="basicArgs.lfsize"/>
                    </li>
                    <li class="headTool-li">
                      <span class="number">水平：</span>
                      <RadioGroup type="button" size="small" style="" @on-change="() => {setBasicArgs('label_align')}"
                                  v-model="basicArgs.label_align_horizontal">
                        <Radio label="0"><span>左</span></Radio>
                        <Radio label="1"><span>中</span></Radio>
                        <Radio label="2"><span>右</span></Radio>
                      </RadioGroup>
                    </li>
                    <li class="headTool-li">
                      <span class="number">垂直：</span>
                      <RadioGroup type="button" size="small" style="" @on-change="() => {setBasicArgs('label_align')}"
                                  v-model="basicArgs.label_align_vertical">
                        <Radio label="0"><span>上</span></Radio>
                        <Radio label="1"><span>中</span></Radio>
                        <Radio label="2"><span>下</span></Radio>
                      </RadioGroup>
                    </li>
                  </ul>
                </div>
                <Divider type="vertical" class="headTool-divider"/>
                <div class="headTool-addin-style">
                  <ul class="headTool-ul">
                    <li class="headTool-li"><span class="number">控件：</span></li>
                    <li class="headTool-li">
                      <ColorPicker transfer @on-change="() => {setBasicArgs('txt_fontColor')}"
                                   v-model="basicArgs.txt_fontColor"/>
                    </li>
                    <li class="headTool-li">
                      <InputNumber class="headTool-form-margin-input" @on-change="() => {setBasicArgs('fsize')}"
                                   v-model="basicArgs.fsize"/>
                    </li>
                    <li class="headTool-li">
                      <span class="number">水平：</span>
                      <RadioGroup type="button" size="small" style="" @on-change="() => {setBasicArgs('main_align')}"
                                  v-model="basicArgs.main_align_horizontal">
                        <Radio label="1"><span>左</span></Radio>
                        <Radio label="4"><span>中</span></Radio>
                        <Radio label="7"><span>右</span></Radio>
                      </RadioGroup>
                    </li>
                  </ul>
                </div>
              </div>
              <!--            <Col span="4" style="height: 42px;line-height: 42px;">-->
              <!--              <span style="margin-right: 10px;">表单同步</span>-->
              <!--              <i-switch v-model="syncForm"/>-->
              <!--            </Col>-->

              <div style="height:50px; float: right;">
                <sider-trigger :collapsed="editBoxDisplay"
                               :iconfont="true"
                               @on-change="handleEditBoxDisplayChange"
                               style="float: right;margin: 0px;line-height: 52px;height: 52px;padding: 0px;"></sider-trigger>
              </div>
            </div>
          </div>

          <div class="middle" :class="deviceClass" :style="{'height': clientHeight - 57 + 'px', 'overflow-y': targetFormType=='Mobile'? 'hidden':'auto','background-size': classBackgroundSize, 'padding': classPadding}">
            <FormRender ref="form" v-show="!showCode"
                        :basic-args="basicArgs"
                        :edit-box="editBox"
                        :route="route"
                        :router="router"
                        :root="_root"
                        :target-class="targetClassName_"
                        :editExtendInfo="editExtendInfo"
                        :target-attributes="targetClassAttribute"
                        :query_oprs="query_oprs"
                        :relation="relation"
                        :widget-annotation="widgetAnnotation"
                        @saveForm="saveForm"
                        @on-json-change="onJsonChange"
                        @snapShot="snapShotChange"
                        @commentAddin="commentAddin"
                        @showEditBox="showEditBox"
                        @hideEditBox="hideEditBox">
            </FormRender>
            <Spin size="large" fix v-if="loading" style="z-index: 3100"></Spin>
            <!--            <div v-show="!showCode" style="height: 50px"></div>-->
            <pre contenteditable="false" v-if="showCode" v-highlightjs="jsonCode" class="code" :class="codeClass" id="code"><code></code>
          </pre>
            <Button v-if="showCode" type="default" size="small"
                    v-clipboard:copy="jsonCode"
                    v-clipboard:success="copySuccess"
                    v-clipboard:error="copyError"
                    style="position: absolute;right: 0;top: 0;opacity:0.9;margin-right: 20px;margin-top: 12px">
              <Icon type="ios-copy-outline"></Icon>
              复制
            </Button>
          </div>
        </i-col>
      </Row>
      <aside v-show="editVisible"
             :style="{'width': '270px', 'min-width': '270px', 'height': clientHeight + 'px', 'overflow-y': 'auto'}">
        <Card :padding="10">
          <Breadcrumb style="font-weight: 700; margin-bottom: 10px;">
            <BreadcrumbItem class="form-targetClass-name"> {{ targetClassName }}</BreadcrumbItem>
            <BreadcrumbItem v-if="viewName.length < 19" class="form-view-name"> {{ viewName }}</BreadcrumbItem>
            <Tooltip v-if="viewName.length >= 19" max-width="200" :content="viewName" style="" :transfer="true">
              <BreadcrumbItem class="form-view-name" style="font-weight: 700;color: #515a6e;">
                {{ viewName.substr(0, 19) + '...' }}
              </BreadcrumbItem>
            </Tooltip>
          </Breadcrumb>
          <!--            <p slot="title">属性编辑框</p>-->
          <div ref="edit" id="editBoxWrapper"></div>
        </Card>
      </aside>
    </div>
      <Modal
        v-model="addTemplateModal"
        title="新增模板"
        :mask-closable="false"
      >
      <Form ref="addTemplateForm" :model="addTemplateData" :label-width="80">
          <FormItem label="iocn" prop="iocn">
              <img v-if="showIcon" :src="addTemplateData.icon" class="avatarImg">
              <Upload
                  id="appLOGO"
                  ref="upload"
                  :show-upload-list="false"
                  :format="['jpg','jpeg','png']"
                  :max-size="2048"
                  :before-upload="handleBeforeUpload"
                  action=""
                  type="drag"
                  style="display: inline-block;width:58px;">
                  <div style="width: 58px;height:58px;line-height: 58px;">
                      <Icon type="ios-camera" size="20"></Icon>
                  </div>
              </Upload>
          </FormItem>
          <FormItem label="deviceType" prop="deviceType" style="width: 100%">
            <Input
              v-model="addTemplateData.deviceType"
            >
            </Input>
          </FormItem>
          <FormItem label="显示名称" prop="displayName" style="width: 100%">
            <Input v-model="addTemplateData.displayName" placeholder="输入属性显示名"></Input>
          </FormItem>
          <FormItem label="表单名（英文）" prop="templateName" style="width: 100%">
              <Input v-model="addTemplateData.templateName"></Input>
          </FormItem>
          <FormItem label="jsondata" prop="v3Content" style="width: 100%">
            <Input v-model="addTemplateData.v3Content" type="textarea"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="addTemplateModal = false">取消</Button>
          <Button type="primary" size="large" @click="addTemplate">确认</Button>
        </div>
      </Modal>
    <!-- 分享弹窗 -->
    <Modal v-model="shareModal" draggable scrollable title="分享信息">
      <div>
        <Tabs>
          <TabPane label="分享到网页" icon="ios-desktop">
            <div style="margin: 10px 0;">
              <span style="margin-right: 10px;">分享表单</span>
              <span>{{ `${this.targetClassName} / ${this.viewName}` }}</span>
            </div>
            <div style="margin: 10px 0;">
              <span>表单分享状态: </span>
              <RadioGroup v-model="shareFormState" @on-change="formStateChange">
                <Radio v-for="item in formStateList" :label="item.label">
                  <span>{{ item.label }}</span>
                </Radio>
              </RadioGroup>
            </div>
            <!-- <div style="margin: 10px 0;">
              <span>表单分享指定的应用: </span>
              <Select v-model="shareApp" style="width:200px" clearable @on-change="shareAppChange">
                <Option v-for="item in appList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </div> -->
            <div style="margin-bottom: 15px;">
              <span>表单分享过滤条件: </span>
              <Input v-model="shareQuery" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                    style="width: 99%"
                     @on-change="shareQueryChange"/>
            </div>
            <Row style="margin-bottom: 15px;">
              <Col span="24">
                <Input v-model="shareValue" style="width: 99%" readonly autosize type="textarea" class="textareaInput"/>
              </Col>
            </Row>
            <Row>
              <Col span="24" style="text-align: center">
                <Button type="primary" @click="toShareTab('app-web')">前往预览</Button>
              </Col>
            </Row>
            <div  v-show="targetFormType== 'Mobile'">
              <div class="QRcode">
                <canvas id="qrccode-canvas"></canvas>
              </div>
              <p style="text-align: center;">手机扫码预览</p>
            </div>
          </TabPane>
          <!-- <TabPane label="分享到手机" icon="ios-phone-portrait">
            <div style="margin-bottom: 10px;">
              <span style="margin-right: 10px;">分享表单</span>
              <span>{{ `${this.targetClassName} / ${this.viewName}` }}</span>
            </div>
            <Row style="margin-bottom: 30px;">
              <Col span="18">
                <Input v-model="shareMobileValue" />
              </Col>
              <Col span="4" offset="2">
                <Button type="primary" @click="toShareTab('app-mobile')">前往预览</Button>
              </Col>
            </Row>
            <div>
              <div class="QRcode">
                <canvas id="qrccode-canvas"></canvas>
              </div>
              <p style="text-align: center;">手机扫码预览</p>
            </div>
          </TabPane> -->
        </Tabs>
      </div>
      <div slot="footer">
        <Button type="text" @click="shareModal = false">关闭</Button>
      </div>
    </Modal>

    <!-- 存为组件弹窗 -->
    <Modal v-model="addComponentModal" title="存为组件" :mask-closable="false">
      <Form ref="addComponentForm" :model="addComponentData" :rules="componentValidate" :label-width="120">
        <FormItem label="选择组" prop="owner">
          <Row>
            <Col span="22">
              <Select
                v-model="addComponentData.owner"
                placeholder="请选择组件分组"
                id="createComGroupModalOwner"
                filterable
                clearable
                style=""
                class="ComGroup"
                @on-change=""
              >
                <Option v-for="group in componentGroup" :value="group.oid" :key="group.oid" :label="group.displayName">
                  <span>{{ group.displayName }}</span>
                </Option>
              </Select>
            </Col>
            <Col span="2">
              <div style="display: inline-block;width: 35px">
                <Button
                  icon="md-add"
                  size="small"
                  type="primary"
                  @click="openAddGroupModal"
                  style=" margin-left: 3px ;margin-right: 3px;"
                >
                </Button>
              </div>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="组件名(英文名)" prop="viewName">
          <Input v-model="addComponentData.viewName" placeholder="请填写英文名" id="createComModalViewName"></Input>
        </FormItem>
        <FormItem label="显示名(中文名)" prop="displayName">
          <Input v-model="addComponentData.displayName" placeholder="请填写中文名" id="createComModalDisplayName"></Input>
        </FormItem>
        <FormItem label="显示图标" prop="icon">
          <Select v-model="addComponentData.icon" placeholder="请选择显示图标" filterable clearable>
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
        <FormItem label="备注" prop="note">
          <Input type="textarea" :rows="3" v-model="addComponentData.note" placeholder="输入备注"
                 id="createComModalNote"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="addComponentModal = false">取消</Button>
        <Button type="primary" size="large" :loading="addComponentModalLoading" @click="saveAsComponent">确认</Button>
      </div>
    </Modal>

    <!-- 编辑组件弹窗 -->
    <Modal v-model="editComponentModal" title="编辑组件" :mask-closable="false">
      <Form ref="editComponentForm" :model="editComponentData" :rules="componentValidate" :label-width="120">
        <FormItem label="选择组" prop="owner">
          <Row>
            <Col span="22">
              <Select
                v-model="editComponentData.owner"
                placeholder="请选择组件分组"
                id="editComGroupModalOwner"
                filterable
                clearable
                style=""
                @on-change=""
                class="ComGroup"
              >
                <Option v-for="group in componentGroup" :value="group.oid" :key="group.oid" :label="group.displayName">
                  <span>{{ group.displayName }}</span>
                </Option>
              </Select>
            </Col>
            <Col span="2">
              <div style="display: inline-block;width: 35px">
                <Button
                  icon="md-add"
                  size="small"
                  type="primary"
                  @click="openAddGroupModal"
                  style=" margin-left: 3px ;margin-right: 3px;"
                >
                </Button>
              </div>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="组件名(英文名)" prop="viewName">
          <Input v-model="editComponentData.viewName" disabled placeholder="请填写英文名" id="editComModalViewName"></Input>
        </FormItem>
        <FormItem label="显示名(中文名)" prop="displayName">
          <Input v-model="editComponentData.displayName" placeholder="请填写中文名" id="editComModalDisplayName"></Input>
        </FormItem>
        <FormItem label="显示图标" prop="componentIcon">
          <Select v-model="editComponentData.componentIcon" placeholder="请选择显示图标" filterable clearable>
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
        <FormItem label="备注" prop="note">
          <Input type="textarea" :rows="3" v-model="editComponentData.note" placeholder="输入备注"
                 id="editComModalNote"></Input>
        </FormItem>
        <FormItem label="" prop="">
          <Button type="primary" size="large" @click="goToEditComponentForm">修改表单</Button>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="editComponentModal = false">取消</Button>
        <Button type="primary" size="large" :loading="editComponentModalLoading" @click="editComponentAddin">确认</Button>
      </div>
    </Modal>

    <!-- 新增组件分组 -->
    <Modal
      v-model="addGroupModal"
      title="新增组件分组"
      :mask-closable="false"
      id="createComGroupModal"
    >
      <Form ref="addGroupForm" :model="addGroupData" :rules="groupValidate" :label-width="80">
        <FormItem label="英文名" prop="name">
          <Input v-model="addGroupData.name" placeholder="输入英文名" id="createComGroupModalName"></Input>
        </FormItem>
        <FormItem label="显示名" prop="displayName">
          <Input v-model="addGroupData.displayName" placeholder="输入显示名" id="createComGroupModalDisplayName"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="addGroupModal = false">取消</Button>
        <Button type="primary" size="large" :loading="addGroupModalLoading" @click="addGroup"
                id="confirmCreateComGroupButton">确认
        </Button>
      </div>
    </Modal>
    <Spin size="large" fix v-if="spinShow" style="z-index: 3100;"></Spin>
  </div>
</template>

<script>
  import {templateHandle} from "@/views/form-engine/template/templateHandle"
  import QueryOprDialog from '@/views/functional-model/components/query-operation-edit-dialog.vue'
  import axios from "@/libs/axios";
  // import flexible from 'amfe-flexible/index.js';
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import {getAddin, getAddinDom, getAddinFunc} from "@/util/addin.js";
  import {entries as form_entries} from "@/ext_components/form/config.js";
  import {entries as ext_form_entries} from "@/assemble_components/form/assemble_config.js";
  import {entries as ext_mobile_entries} from "@/ext_mobile_components/form/config.js";
  import {dataMixin} from '@/component/dataMixin.js'
  import {
    getAllEntities,
    getAllRelations,
    getViews,
    getRelationNameB,
    getRelationNameF,
    deleteView,
    createView,
    updateView,
    getView,
    copyView,
    getEntryOperations,
    getClass,
    getSuperControl
  } from "@/api/others";
  import {
    getComponentGroups,
    createComponentGroups,
    updateComponentGroups,
    createComponent,
    deleteComponent,
    updateComponent,
    getComponentByGroupId,
    comp2compgroupUpdate,
    getComp2compgroupTree,
  } from "@/api/data-model/ComponentGroupLib";
  import {getAttributes, getEntity} from "@/api/data-model/EntityModeling";
  import {getRelation} from '@/api/data-model/RelationModeling';
  import EntityModeling from "@/api/data-model/EntityModeling";
  import AttributesLib from "@/api/data-model/AttributesLib";
  import FormRender from "@/component/form_render.vue";
  import FormEngine from "@/component/form_engine.vue";
  import CodeEditor from "@/component/code_editor.vue";
  import BindOperationBar from "@/ext_components/form/subcomponent/BindOperationBar.vue"
  import siderTrigger from '@/views/main/components/header-bar/sider-trigger.vue'
  import InnerIconWrapper from "@/views/form-engine/components/inner-icon-wrapper";
  import deviceIcon from "@/assets/images/dev-spr.png";
  import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
  import store from "../../store";

  import draggable from 'vuedraggable';
  import FormAddinIconList from '@/ext_components/form/FormAddinIconList';
  import IconUnit from "@/ext_components/form/IconUnit";
  import ComponentUnit from "@/ext_components/form/ComponentUnit";
  import moduleIconData from "../functional-model/components/moduleIcon";
  import fontIconData from "../functional-model/components/iFontIcon";
  import QRCode from 'qrcode'
var canvas = '';

export default {
  name: "app",
  props: ["store", "route", "router", "root", "Message", "echarts"],
  mixins: [dataMixin, templateHandle],
  components: {
    IconUnit,
    ComponentUnit,
    FormRender,
    FormEngine,
    CodeEditor,
    InnerIconWrapper,
    siderTrigger,
    BindOperationBar,
    QueryOprDialog,
    draggable,
    FormAddinIconList,
  },
  data() {
    const validateLength = (rule, value, callback) => {
      console.log(value, this.addRowData.valueLength, this.addRowData.valueType)
      if (value === undefined) {

        if (this.addRowData.valueType == 'String') {
          this.addRowData.valueLength = 50;
        }

        }

        if (value === null) {
          callback(new Error('长度不能为空'));
        } else {
          callback();
        }
      };
      return {
        classType: '',
        // targetSlot: null,
        // loadInterval: null,
        // loadTime: 0,
        addinArgs: {},
        spinShow: false,
        addRowModal: false,
        addRowModalLoading: false,
        addRowTargetClass: '',
        syncForm: true,
        shareModal: false,
        limitLength: false,
        noTime: true,
        qrStore: null,
        isEN: false,
        preDbClick: false,      // 快速创建防止连续点击多次
        targetClassType: '',
        targetFormType: 'PC',
        formStateList: [
          {
            value: 'create',
            label: 'create'
          }, {
            value: 'visit',
            label: 'visit'
          }, {
            value: 'edit',
            label: 'edit'
          }
        ],
        shareFormState: 'create',
        shareValue: '',
        shareMobileValue: '',
        // appList: [],
        shareApp: '',
        shareQuery: '',
        addRowData: {
          attributeName: "",
          displayName: "",
          valueType: "String",
          valueLength: 50,
          nullable: true,
          defaultValue: null,
          order: 100,
          defaultComponent: null,
          attrDict: null,
          queryBoxDisplayType: '',
          isInTable: true,
          isInQueryBox: true,
          isInForm: true
        },
        rowValidate2: {
          attributeName: [
            {required: true, message: "属性名不能为空", trigger: "blur"},
            {
              pattern: /^[a-zA-Z0-9]{1,32}$/,
              message: "属性名只能包含字母、数字，长度不超过32个字符",
              trigger: "blur"
            },
            {pattern: /^[a-zA-Z]/, message: "属性名首字母应为字母", trigger: "blur" }
          ],
          displayName: [
            {required: true, message: "属性显示名不能为空", trigger: "blur"},
            {
              // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
              pattern: /^\S{1,32}$/,
              message: "属性显示名只能包含汉字、字母、数字，长度不超过32个字符",
              // trigger: "blur"
            }
          ],
          valueType: [
            {required: true, message: "数据类型不能为空", trigger: "blur"}
          ],
          valueLength: [
            {validator: validateLength, trigger: 'blur'}
          ]
        },
        allValueTypes: {},
        filterValueTypes: {},
        // userMapList: [],

        // clientHeight: 800,
        activeIndex: 0,   // 默认设备为PC

        actIcon: 'actIcon',     // 切换设备
        activeClass: 'actPc',
        deviceClass: '',        // 切换设备样式
        deviceType: 'actPc',
        codeClass: null,
        classPadding: null,
        classBackgroundSize: null,
        deviceList: [
          {
            name: 'pc'
          }, {
            name: 'ipad'
          }, {
            name: 'ipadH'
          }, {
            name: 'iphone'
          }, {
            name: 'iphoneH'
          },
        ],

        collapsed: false,
        editBoxDisplay: false,

        actDevice: 0,
        deviceTypeList:['PC端', '移动端'],

        createForm: {
          chosenClass: null,
          chosenType: 'PC',
          viewName: null,
          viewDisplayName: null,
          note: '',
        },
        basicConfigForm: {
          chosenClass: null,
          viewName: null,
          viewDisplayName: null,
          note: '',
        },
        configValidate: {
          viewDisplayName: [
            {
              // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
              // message: "显示名只能包含汉字、字母、数字或下划线",
              pattern: /^\S{1,32}$/,
              message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
              trigger: "change"
            }
          ],
          chosenClass: [
            {required: true, message: "必须选择一个目标类", trigger: "change"}
          ],
          note: [
            {
              pattern: /^[\S\s]{1,500}$/,
              message: "长度不超过500个字符",
              trigger: "change"
            },
            {pattern: /^[\S\s]{1,500}$/, message: "长度不超过500个字符", trigger: "blur"}
          ]
        },
        rowValidate: {
          viewName: [
            {required: true, message: "表单名不能为空", trigger: "blur"},
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/,
              message: "只能包含英文字母,数字和下划线,开头必须是英文字母,长度不能超过32个字符",
              trigger: "change"
            },
            {pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/, message: "只能包含英文字母,数字和下划线,开头必须是英文字母,长度不能超过32个字符", trigger: "blur" }
          ],
          viewDisplayName: [
            {
              // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
              // message: "显示名只能包含汉字、字母、数字或下划线",
              pattern: /^\S{1,32}$/,
              message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
              trigger: "change"
            }
          ],
          chosenClass: [
            {required: true, message: "必须选择一个目标类", trigger: "blur"}
          ],
          note: [
            {
              pattern: /^[\S\s]{1,500}$/,
              message: "长度不超过500个字符",
              trigger: "change"
            },
            { pattern: /^[\S\s]{1,500}$/, message: "长度不超过500个字符", trigger: "blur"}
          ]
        },

        previewUrl: "",
        previewModal: false,
        createModal: true,
        createModalTitle: "创建表单",
        createModalChosenClassDisabled: false,
        editModalChosenClassDisabled: false,
        viewDisabled: false,
        viewName: null,
        viewDispalyName: null,
        note: null,
        chosenType: 'PC',
        entitiesList: [],
        relationsList: [],
        hasRelatedClass: null,
        chosenRelatedClass: null,
        relatedClasses: [],
        chosenViewId: null,
        chosenViews: [],
        pcViews: [],
        mobileViews: [],
        typeAddinMap: {},

        editVisible: false,
        formSpan: 20,
        sideSpan: 4,
        sideDisplay: 'block',
        open: ["single", "multi", "timeseries", "model", "visual", "layout", "collect", "code"],
        targetClassName: null,
        targetClassName_: {},
        editExtendInfo: {},
        targetClassAttribute: [],
        attrGroup: [],

        targetAttribute: {attributeName: "", displayName: ""},
        searchName: "",
        addins: {
          single: {},
          multi: {},
          timeseries: {},
          model: {},
          code: {},
          layout: {},
          visual: {},
          iconunit: null,
        },
        showCode: false,
        editBox: null,
        border: true,
        col_single: [],
        col_multi: [],
        col_timeseries: [],
        col_model: [],
        col_layout: [],
        col_visual: [],
        col_collect: [],
        refUpdate: false,

        configModal: false,
        quickCreateModal: false,
        selectedAttributes: [],
        quickCreateArgs: [
          {
            groupName: "新分组1",
            cols: 2,
            selectedAttributes: [],
            relationAttributes: [],
            leftAttributes: [],
            rightAttributes: [],
          },
          {
            groupName: "新分组2",
            cols: 2,
            selectedAttributes: [],
            relationAttributes: [],
            leftAttributes: [],
            rightAttributes: [],
          }
        ],
        currentGroup: "",


        basicArgs: {
          label_width: 1,
          main_width: 4,
          label_align: 7,
          main_align: 1,
          // basic_height: 30,
          row_space: 0,
          col_space: 0,
          label_fontColor: 'initial',
          txt_fontColor: 'initial',
          // txt_bgColor: '#fff',
          form_bgColor: '#fff',
          form_fsize: 14,
          form_font_size: '14px',
          // cols: 3
          lfsize: 14,
          fsize: 14,
          label_align_horizontal: "2",
          label_align_vertical: "1",
          main_align_horizontal: "1",
          defaultMultiAddin: '',
          labelWidthUnit: 'px',
          label_widthByPx: 200,
        },
        mobileBasicArgs: {
          label_width: 2,
          main_width: 5,
          label_align: 1,
          main_align: 1,
          // basic_height: 30,
          row_space: 0,
          col_space: 0,
          label_fontColor: '#646566',
          txt_fontColor: '#323233',
          // txt_bgColor: '#fff',
          form_bgColor: '#fff',
          form_fsize: 14,
          form_font_size: '14px',
          // cols: 3
          lfsize: 14,
          fsize: 14,
          label_align_horizontal: "2",
          label_align_vertical: "1",
          main_align_horizontal: "1",
          defaultMultiAddin: '',
          labelWidthUnit: 'px',
          label_widthByPx: 102,
        },
        // 对齐方式,布局插件使用
        labelAlignList: [
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
        mainAlignList: [
          {value: 1, name: "靠左对齐"},
          {value: 4, name: "居中对齐"},
          {value: 7, name: "靠右对齐"},
          // {value: 0, name: "左上对齐"},
          // {value: 2, name: "左下对齐"},
          // {value: 3, name: "顶部对齐"},
          // {value: 5, name: "底部对齐"},
          // {value: 6, name: "右上对齐"},
          // {value: 8, name: "右下对齐"}
        ],

        oprs: [
          {
            id: 0,
            path: "save",
            displayName: "新增"
          },
          {
            id: 1,
            path: "edit",
            displayName: "编辑"
          },
          {
            id: 2,
            path: "delete",
            displayName: "删除"
          },
          {
            id: 3,
            path: "refresh",
            displayName: "刷新"
          }
        ],

        query_oprs: [],


        default_opr_path: "",
        default_opr_type: "",
        default_opr_sys_path: '',
        default_opr_showMessage: '',

        init_opr_path: "",
        init_opr_type: "",
        init_opr_sys_path: '',
        init_opr_showMessage: '',
        eventOfOperationBarInit: true,
        eventOfOperationBar: true,

        isRelation: false,
        relation: null,

        _root: null,

        jsonData: null,

        editbox: null,

        firstLoad: true,

        jsonCode: null,

        loading: false,

      superControlId: {},
      superControl: {},
      real_collect: [],
      addin_collect: {},
      addin_background_color: '',
      formDisplayType: '布局',
      // basicArgs: {
      //   label_width: 2,
      //   main_width: 3,
      //   lfsize: 14,
      //   fsize: 14,
      //   label_align_horizontal: "1",
      //   label_align_vertical: "1",
      //   main_align_horizontal: "4",
      // },
      commentModal: false,
      widgetAnnotation: {},
      addin_comment: '',
      multiAddins: [],
      saveFormDebounce: false,
      viewData: {},
      createFormState: false,
      singleAddinIconList: [],
      multiAddinIconList: [],
      timeSeriesAddinIconList: [],
      modelAddinIconList: [],
      codeAddinIconList: [],
      visualAddinIconList: [],
      layoutAddinIconList: [],
      superAddinIconList: [],
      componentGroupAddinIconList: [],
      undoing: false,
      redoing: false,
      snapShotCount: 0,
      snapShotLength: 0,
      componentGroupAddin: [],
      addComponentModal: false,
      editComponentModal: false,
      addComponentModalLoading: false,
      editComponentModalLoading: false,
      addGroupModal: false,
      addGroupModalLoading: false,
      addComponentData: {
        owner: '',
        viewName: '',
        displayName: '',
        icon: '',
        note: '',
      },
      editComponentData: {
        owner: '',
        viewName: '',
        displayName: '',
        icon: '',
        note: '',
      },
      componentValidate: {
        owner: [
          {required: true, message: "选择组不能为空", trigger: "change"},
        ],
        viewName: [
          {required: true, message: "组件名不能为空", trigger: "blur"},
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/,
            message: "只包含英文字母,数字和下划线,开头是英文字母,长度不超过32个字符",
            trigger: "change"
          },
          {pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/, message: "只包含英文字母,数字和下划线,开头是英文字母,长度不超过32个字符", trigger: "blur"}
        ],
        displayName: [
          {required: true, message: "显示名不能为空", trigger: "blur"},
          {
            pattern: /^\S{1,32}$/,
            message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "change"
          },
          {pattern: /^\S{1,32}$/, message: "显示名只能包含汉字、字母、数字，长度不超过32个字符", trigger: "blur"}
        ],
        icon: [
          {required: true, message: "显示图标不能为空", trigger: "change"},
        ],
        componentIcon: [
          {required: true, message: "显示图标不能为空", trigger: "change"},
        ],
        note: [
          {
            pattern: /^[\S\s]{1,200}$/,
            message: "长度不超过200个字符",
            trigger: "change"
          },
          {pattern: /^[\S\s]{1,200}$/, message: "长度不超过200个字符", trigger: "blur"}
        ]
      },
      componentGroup: [],
      iconList: [],
      iList: [],

      addGroupData: {
        name: "",
        displayName: "",
      },
      groupValidate: {
        name: [
          {required: true, message: "英文名不能为空", trigger: "blur"},
          {
            pattern: /^[a-zA-Z0-9]{1,32}$/,
            message: "英文名只能包含字母、数字，长度不超过32个字符",
            trigger: "blur"
          },
          {pattern: /^[a-zA-Z]/, message: "英文名首字母应为字母", trigger: "blur"}
        ],
        displayName: [
          {required: true, message: "显示名不能为空", trigger: "blur"},
          {
            pattern: /^\S{1,32}$/,
            message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ],
      },
    };
  },

  // 销毁函数,销毁控件点选区的控件
  beforeDestroy() {
    // for (var i in this.addins.single) {
    //   this.addins.single[i].$destroy();
    //   delete this.addins.single[i];
    // }
    // for (var i in this.addins.multi) {
    //   this.addins.multi[i].$destroy();
    //   delete this.addins.multi[i];
    // }
    // for (var i in this.addins.timeseries) {
    //   this.addins.timeseries[i].$destroy();
    //   delete this.addins.timeseries[i];
    // }
    // for (var i in this.addins.model) {
    //   this.addins.model[i].$destroy();
    //   delete this.addins.model[i];
    // }
    // for (var i in this.addins.visual) {
    //   this.addins.visual[i].$destroy();
    //   delete this.addins.visual[i];
    // }
    // for (var i in this.addins.layout) {
    //   this.addins.layout[i].$destroy();
    //   delete this.addins.layout[i];
    // }
  },

    created() {
      this.spinShow = true;
      let self = this;
      let designClass = '';

      // this.loadInterval = setInterval(() => {
      //   self.loadTime+=1;
      //   console.log(self.loadTime)
      // }, 1000)

      this.viewData = {};
      this.qrStore = store;
      let params = location.search.substring(1).split('&')
      if (params && params.length !== 0) {
        params.forEach(param => {
          if (param.match('copyViewName')) {
            this.copyViewName = param.split('=')[1];
          }
          if (param.match('displayName')) {
            this.viewData.displayName = this.viewDisplayName = this.createForm.viewDisplayName = decodeURI(param.split('=')[1]);
          }
          if (param.match('note')) {
            this.viewData.note = this.note = this.createForm.note = decodeURI(param.split('=')[1]);
          }
          if (param.match('createForm')) {
            this.createFormState = param.split('=')[1];
          }
          if (param.match('designClass')) {
            designClass = param.split('=')[1];
          }

          if(param.match('formType')){

            let formType = param.split('=')[1];
            this.targetFormType = formType ? formType : '';
            if(this.targetFormType != '') {
              sessionStorage.setItem('targetFormType', this.targetFormType);
            }

          }

          if(param.match('classType')){

            this.classType = param.split('=')[1];
            this.targetClassType = this.classType ? this.classType : '';
            if (this.targetClassType != '') {
              sessionStorage.setItem('targetClassType', this.targetClassType);
            }

          }
        })

        if(this.targetFormType == "PC") {
          this.targetFormType = sessionStorage.getItem('targetFormType');
        }

        if (!this.targetClassType) {
          this.targetClassType = sessionStorage.getItem('targetClassType') || '';
        }
        if (this.targetClassType == 'entity') {
          this.isEN = true;
        } else {
          this.isEN = false;
        }
        this.viewData.viewName = this.viewName = this.createForm.viewName = this.$route.params.formName;
      }
      this.setRemUnit(1024);

      // 获取全部实体类 action到store中
      this.entitiesList = [];
      this.relationsList = [];
      let getEnList = new Promise((resolve, reject) => {

        getAllEntities({needOperationCount: false}).then(res => {

          resolve(res);
          if (!res.data.success) {
            self.$Message.error("服务器繁忙, 实体类列表获取失败请稍后再试");
          } else {

            let entities = res.data.data;

            entities.forEach(entity => {
              this.AddEntity({
                className: entity.className,
                basic: entity
              })
              entity.views = [];
            });

            self.entitiesList = entities;

            if(this.classType == '' && designClass != '') {

              let classIndex = entities.findIndex(d => {
                return d.className == designClass
              });
              if (classIndex != -1) {

                this.targetClassType = this.classType = 'entity';
                this.isEN = true;

              } else {

                this.targetClassType = this.classType = 'relation';
                this.isEN = false;

              }

            }

          }

        }).catch(e => {
            console.log(e);
            reject(e);
        });

      })

      // 获取全部关联类 action到store中
      let getReList = new Promise((resolve, reject) => {

        getAllRelations().then(res => {

          console.log('全部关联类', 1123364457889);
          resolve(res);
          if (!res.data.success) {
            self.$Message.error("服务器繁忙, 关联类列表获取失败请稍后再试");
            return;
          }

          // 将关联类信息写入IDB
          let relations = res.data.data;
            relations.forEach(relation => {
              this.AddRelation({
                className: relation.className,
                basic: relation
              });
              relation.views = [];
            });

            self.relationsList = relations;
          }).catch(e => {
              console.log(e);
              reject(e);
          });

      })

      // 获取全部属性可能的数据类型
      let getAllDataType = new Promise((resolve, reject) => {

        AttributesLib.getAllValueTypes().then(res => {

          resolve(res);
          this.allValueTypes = res.data;
          this.filterValueTypes = _.cloneDeep(this.allValueTypes);

        }).catch(e => {
            console.log(e);
            reject(e);
        });

      })

      if (this.store && !this.$store) this.$store = this.store;

      if (this.Message && !this.$Message) this.$Message = this.Message;

      if (this.echarts && !this.$echarts) this.$echarts = this.echarts;

      if (!this.root) {
        this._root = {};
        this._root._formcreate = true;
      } else this._root = this.root;

      // 区分是创建表单还是编辑表单act
      if (this.route && this.route.meta) {
        this.createForm.chosenClass = this.route.meta.className;
        this.createForm.viewName = this.route.meta.formName;
      } else if (this.$route) {
        let path = this.$route.path;
        path = path.split("/");
        this.createForm.chosenClass = path[2]; // 实体类名称
        this.createForm.viewName = path[3]; // 表单名称
      }
      console.log(this.createForm)
      if (this.createForm.chosenClass) {
        this.createModal = false;
        this.ok();
      }

      if (this.route && !this.route.meta.className) return;
      let entries = [];
      if (this.targetFormType == 'Mobile') {
        ext_mobile_entries.forEach(x => entries.push(x));
      }
      else {
        form_entries.forEach(x => entries.push(x));
        ext_form_entries.forEach(x => {
          x.ISASSEMBLE = true;
          entries.push(x)
        });
      }
    entries.forEach(x => {
      let module = x.module.split("/");
      if (module.length == 1 || module[1] == "single") this.addins.single[x.name] = x;
      else if (module[1] == "multi") this.addins.multi[x.name] = x;
      else if (module[1] == "timeseries") this.addins.timeseries[x.name] = x;
      else if (module[1] == "model") this.addins.model[x.name] = x;
      else if (module[1] == "code") this.addins.code[x.name] = x;
      else if (module[1] == "layout") this.addins.layout[x.name] = x;
      else if (module[1] == "visual") this.addins.visual[x.name] = x;
      else if (module[1] == 'iconunit') this.addins.iconunit = getAddinFunc(x.name, "form");
    });

    for (var i in this.addins.single) {
      if (i !== 'SingleObjectModal' && i !== 'SingleObjectSelector') {
        this.singleAddinIconList.push(this.addins.single[i]);
      }
    }

      for (var i in this.addins.multi) {
        this.multiAddinIconList.push(this.addins.multi[i]);
      }

      for (var i in this.addins.timeseries) {
        this.timeSeriesAddinIconList.push(this.addins.timeseries[i]);
      }

      for (var i in this.addins.model) {
        this.modelAddinIconList.push(this.addins.model[i]);
      }

    for (var i in this.addins.code) {
      this.codeAddinIconList.push(this.addins.code[i]);
    }

    for (var i in this.addins.visual) {
      this.visualAddinIconList.push(this.addins.visual[i]);
    }

    for (var i in this.addins.layout) {
      if (i !== 'DragItem') {
        this.layoutAddinIconList.push(this.addins.layout[i]);
      } else {
        //特殊处理拖拽块
        // let NeedDragItem = true;
        // if (NeedDragItem) {
        //   let DragItemAddinFunc = getAddinFunc('DragItem', "form");
        //   let DragItemAddin = new DragItemAddinFunc();
        //   DragItemAddin.setDisplayType(2);
        //   let DragItemEl = DragItemAddin.$mount().$el;
        //   DragItemEl.setAttribute("draggable", "true");
        //   let DragItemDom = DragItemEl.children[0].children[0];
        //   if (DragItemDom.children.length > 0) DragItemDom = DragItemDom.children[0];
        //   DragItemDom.style = "font-size: 12px !important";
        //   DragItemDom.setAttribute("draggable", "true");
        //   DragItemEl.style = "height: 30px;display: block;";
        //   DragItemEl.ondragstart = this.onDragStart;
        //   DragItemEl.ondragend = this.onDragEnd;
        //   DragItemEl.ondblclick = this.onDbClick;
        //   this.col_layout.push(DragItemEl);
        // }
      }
    }

    // 获取全部超级控件
    let getSurList = new Promise((resolve, reject) => {
      getSuperControl().then(res => {

          resolve(res);

          if (!res.data.success) {
            self.$Message.error("服务器繁忙,超级控件列表获取失败请稍后再试");
            return;
          }
          let idx = 0;
          res.data.data.forEach(x => {
            // self.superControlId[x.displayName] = {oid: x.oid, viewName: x.viewName};

            if(x.formType == this.targetFormType) {

              x.v3Content = JSON.parse(x.v3Content);
              let superAddin = {
                oidProps: x.oid,
                nameProps: 'SelfCode',
                viewNameProps: x.viewName,
                displayNameProps: x.displayName,
                indexProps: idx,
                typeProps: 'SuperControl',
                iconProps: x.v3Content.icon,
                iconTypeProps: x.v3Content.iconType || 0,
                argsProps: x.v3Content,
                rootProps: this,
              }
              idx++;
              this.superAddinIconList.push(superAddin);

            }

            // self.superControl[x.displayName] = x.v3Content;
            // var addin = new self.addins.iconunit();
            // addin.setName(x.displayName);
            // addin.setIcon(x.v3Content.icon, x.v3Content.iconType ? x.v3Content.iconType : 0);
            // addin.setIndex(idx);
            // idx++;
            // addin.setType('SuperControl');
            // addin.setArgs(self.superControl[x.displayName]);
            // addin.setRoot(self);
            // self.addin_collect[x.displayName] = addin;
            // var el = addin.$mount().$el;
            // el.setAttribute("draggable", "true");
            // var dom = el.children[0].children[0];
            // if (dom.children.length > 0) dom = dom.children[0];
            // dom.style = "font-size: 12px !important";
            // dom.setAttribute("draggable", "true");
            // el.style = "height: 30px;display: block;";
            // el.ondragstart = self.onDragStart;
            // el.ondragend = self.onDragEnd;
            // el.ondblclick = self.onDbClick;
            // self.col_collect.push(1);
            // self.real_collect.push(el);

          });
          // self.addCollect();
        }).catch(e => {
            console.log(e);
            reject(e);
        });

      })

      //获取组件分组
      this.iconList = moduleIconData;
      this.iList = fontIconData;
      this.initComponentGroup();
      if (this.targetFormType == 'Mobile') {
        this.basicArgs = this.mobileBasicArgs;
      }
    },

  updated() {
    // if (!this.refUpdate) {
    //   if (this.$refs.addins_single) {
    //     this.refUpdate = true;
    //   }
    // }
    // this.$refs.addins_layout_dragitem.$el.appendChild(this.col_layout[0]);
  },

  mounted() {
    this.initDWFAppConfig();
    this.editBox = this.$refs.edit;
    this.$nextTick(function () {
      // DOM操作
      canvas = document.getElementById('qrccode-canvas');
    })

      if (this.route) {
        this.viewDisplayName = this.route.meta.viewDisplayName;
        this.note = this.route.meta.note;
        // if(this.route.meta.copyViewConfig){
        //   this.basicArgs = this.route.meta.copyViewConfig.basicArgs;
        //   this.widgetAnnotation = this.route.meta.copyViewConfig.widgetAnnotation;
        // }
      }
      if (this._root) {
        this._root.addAttr = this.openAddRow;
        this._root.addSuperControl = this.addSuperControl;
        this._root.superControl = this.superAddinIconList;
      }

      if (this.root) this.root.$el.children[1].scrollTo(0, 0);

      this._root.opr_dialog = this.$refs.opr_dialog;

      if (this.route && !this.route.meta.className) return;

    // 用于修正工作区高度
    let that = this;
    if (this.root) {
      setTimeout(() => {
        var dom = that.root.$el.children[1];
        console.log("dom:", dom);
        // var dom = that.$refs.view.parentNode.parentNode.parentNode.parentNode;
        dom.style.overflowY = "hidden";
        var height = dom.offsetHeight;
        height -= dom.children[0].offsetHeight;
        height -= dom.children[1].children[0].children[0].children[0].offsetHeight;
        console.log("dom:", dom.children[1].children[0].children[0].children[0].offsetHeight);
        dom = that.$refs.header.$el;
        height -= dom.offsetHeight;
        // console.log("dom:", height);
        // that.clientHeight = height;

        }, 400);
      } else {
        // this.$Spin.hide();
      }
    },

    computed: {
      ...mapGetters("DWF_form", ["EntityForm", "Entities", "EntityAttrList", "RelationForm", "EntityFormS", "RelationFormS", "EntityFormBasicArgs", "RelationFormBasicArgs", "EntityFormWidgetAnnotation", "RelationFormWidgetAnnotation", "EntityFormData", "RelationFormData"]),

      selectedAttributesCounter() {
        let result = {};
        this.targetClassAttribute.forEach(item => result[item.attributeName] = 0);
        this.quickCreateArgs.forEach(group => {
          group.selectedAttributes.forEach(attr => result[attr] += 1);
        })
        return result;
      },

      attributesDict() {
        let result = {};
        this.targetClassAttribute.forEach(item => result[item.attributeName] = item.displayName);
        return result;
      },

      relationAttributesDict() {
        let result = {};
        this.targetClassAttribute[1].forEach(item => result[item.attributeName] = item.displayName);
        this.targetClassAttribute[2].forEach(item => result[item.attributeName] = item.displayName);
        this.targetClassAttribute[3].forEach(item => result[item.attributeName] = item.displayName);
        return result;
      },

    clientHeight() {
      return window.innerHeight - 52;
    },

    undoDisabled() {
      return this.undoing || this.snapShotCount <= 1 || this.snapShotLength <= 1;
    },

    redoDisabled() {
      return this.redoing || this.snapShotLength <= 1 || (this.snapShotCount >= this.snapShotLength);
    }
  },

    methods: {
      ...mapActions("DWF_form", {
        HandleQueryForm: "handleQueryForm",
        UpdateFView: "updateFView",
        deleteFView: "deleteFView",
      }),
      ...mapActions('DWF_global', ["getDWFAppConfig"]),

      initDWFAppConfig() {
        this.getDWFAppConfig();
      },

      ...mapMutations("DWF_form", {
        AddEntity: "addEntity",
        AddRelation: "addRelation",
        AddEntityForm: 'addEntityForm',
      }),

      ...mapMutations(["addRoute"]),

      globalRefresh() {

        this.$Modal.confirm({
          title: '提示',
          content: '<p>确认刷新重新载入表单么?</p>',
          onOk: () => {
              this.$Spin.show();
              location.reload();
          },
          onCancel: () => {
          }
        });

      },

      changeLimit(value) {

        if (value) {
          this.addRowData.valueLength = 0;
        } else {
          this.addRowData.valueLength = 50;
        }
        this.$refs.addRowForm.validateField('valueLength');

      },

      copySuccess() {
        this.$Message.success("复制成功");
      },

      actDev(ind) {
        if(this.editModalChosenClassDisabled) return false;
        this.actDevice = ind;
        this.chooseDeviceType(ind);
        this.chosenViews = [];
        this.viewDisabled = false;
        this.createForm.viewName = '';
        this.createForm.viewDisplayName = '';
        this.createForm.note = '';

        if(ind == 0) {
          this.createForm.chosenType = 'PC';
          this.chosenViews = this.pcViews;
        } else {
          this.createForm.chosenType = 'Mobile';
          this.chosenViews = this.mobileViews;
        }
      },

      copyError() {
        this.$Message.error("复制失败");
      },

      onJsonChange(val) {
        this.jsonData = val;
      },

      //timestep 转为时间
      getdate(ts) {
        if (ts == '') return '--';
        var now = new Date(ts),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate();
        return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
      },

      // userID 转为name
      // getUserName(uid) {
      //   let finalName = '';
      //   let userIndex = this.userMapList.filter(val => {
      //     return val.creator == uid;
      //   })
      //   finalName = userIndex.length > 0 ? userIndex[0].displayName : '--';
      //   return finalName;
      // },

      // 转至其他tab页前调用
      beforeLeave() {
        this.configModal = false;
        this.$refs.form.removeListeners();
        if (this.root) {
          try {
            var dom = this.root.$el.children[1];
            // var dom = this.$refs.view.parentNode.parentNode.parentNode.parentNode;
            // dom.style.overflowY = "auto";
            console.log("dom", dom, dom.style);
          } catch (e) {
            console.log(e);
          }
        }
      },

    updateSuperControl(oid, type, html, vue) {
      let superControl = this.superAddinIconList.find(superControl => superControl.oidProps === oid);
      superControl.argsProps.old_type = type;
      superControl.argsProps.old_htmlCode = html;
      superControl.argsProps.old_vueCode = vue;
      // let item = {
      //   className: '*',
      //   hasThumbnail: false,
      //   v3Content: JSON.stringify(superControl.argsProps),
      //   viewName: superControl.viewNameProps,
      //   oid: superControl.oidProps,
      //   displayName: superControl.displayNameProps
      // }
      // // console.log("test:", this.superControl[name]);
      // updateView(item).then(res => {
      //   if (res.data.success) this.$Message.success("更新成功");
      //   else this.$Message.error("更新失败");
      // })
    },

    deleteSuperControl(oid) {
      let that = this
      let index = this.superAddinIconList.findIndex(superControl => superControl.oidProps === oid);
      deleteView(this.superAddinIconList[index].oidProps).then(res => {
        if (res.success) {
          that.$Message.success("删除成功");
          // let idx = -1;
          // for (var i = 0; i < that.real_collect.length; i++) {
          //   let nm = that.real_collect[i].getAttribute("addinName");
          //   nm = nm.replace("SuperControl_", "")
          //   if (idx == -1) {
          //     if (nm == name) {
          //       idx = i;
          //     }
          //   } else {
          //     that.addin_collect[nm].decIndex();
          //   }
          // }
          // var node = that.$refs.addins_collect.$el.children[idx];
          // that.$refs.addins_collect.$el.removeChild(node);
          // that.real_collect.splice(idx, 1);
          this.superAddinIconList.splice(index, 1);
        } else this.$Message.error("删除失败");
      })
    },

    addSuperControl(x) {
      // this.superControlId[x.displayName] = {oid: x.oid, viewName: x.viewName};
      // this.superControl[x.displayName] = x.v3Content;
      // var addin = new this.addins.iconunit();
      // addin.setName(x.displayName);
      // addin.setIcon(x.v3Content.icon, x.v3Content.iconType ? x.v3Content.iconType : 0);
      // addin.setType('SuperControl');
      // addin.setIndex(this.real_collect.length);
      // addin.setArgs(this.superControl[x.displayName]);
      // addin.setRoot(this);
      // this.addin_collect[x.displayName] = addin;
      // var el = addin.$mount().$el;
      // el.setAttribute("draggable", "true");
      // var dom = el.children[0].children[0];
      // if (dom.children.length > 0) dom = dom.children[0];
      // dom.style = "font-size: 12px !important";
      // dom.setAttribute("draggable", "true");
      // el.style = "height: 30px;display: block;";
      // el.ondragstart = this.onDragStart;
      // el.ondragend = this.onDragEnd;
      // el.ondblclick = this.onDbClick;
      // this.col_collect.push(1);
      // this.real_collect.push(el);
      // this.addCollect();
      let superAddin = {
        oidProps: x.oid,
        nameProps: 'SelfCode',
        viewNameProps: x.viewName,
        displayNameProps: x.displayName,
        indexProps: this.superAddinIconList.length,
        typeProps: 'SuperControl',
        iconProps: x.v3Content.icon,
        iconTypeProps: x.v3Content.iconType || 0,
        argsProps: x.v3Content,
        rootProps: this,
      }
      this.superAddinIconList.push(superAddin);
    },

    addCollect() {
      if (this.real_collect.length > 0 && this.$refs.addins_collect && this.$refs.addins_collect.$el.children.length == this.real_collect.length) {
        for (var i = 0; i < this.real_collect.length; i++) {
          if (this.$refs.addins_collect.$el.children[i].children.length > 0) continue;
          this.$refs.addins_collect.$el.children[i].appendChild(this.real_collect[i]);
        }
      } else {
        let that = this;
        setTimeout(() => {
          that.addCollect();
        }, 100);
      }
    },

    openAddRow(editbox) {
      this.limitLength = false;
      this.noTime = true;
      this.addRowModal = true;
      this.$refs["addRowForm"].resetFields()
      if (editbox.dataTypes && editbox.dataTypes.length !== 0) {
        this.filterValueTypes = {};
        editbox.dataTypes.forEach((dataType, index) => {
          if (['Date', 'Time', 'TimeStamp'].includes(dataType) && (this.addRowData.valueType === "Date" || this.addRowData.valueType === "TimeStamp" || this.addRowData.valueType === "Time")) {
            this.noTime = false;
          } else {
            this.noTime = true;
          }
          dataType in this.allValueTypes ? this.filterValueTypes[dataType] = this.allValueTypes[dataType] : '';
          if (index === 0) {
            this.addRowData.valueType = dataType;
          }
        })
      }
      this.addRowTargetClass = editbox.targetclass;
      this.editbox = editbox;
      this.getValueLength()
    },

    addRow() {
      let that = this;
      this.$refs["addRowForm"].validate(valid => {
        if (valid) {

          // 默认值 用户写入再清空 需重新复制null
          if (this.addRowData.defaultValue == "") {
            this.addRowData.defaultValue = null;
          }
          if (this.addRowData.order == null) {
            this.addRowData.order = 100;
          }
          if (this.addRowData.valueType == 'Boolean' && (this.addRowData.defaultValue != '' && this.addRowData.defaultValue != undefined)) {
            let judeDef = parseInt(this.addRowData.defaultValue);
            if (judeDef != 0 && judeDef != 1) {
              this.$Message.warning('默认值不合法, 只能为0或1')
              return
            }
          }

          let numberListObj = {'Double': 15, 'Integer': 9, 'Long': 18}
          let currTypeLimit = numberListObj[this.addRowData.valueType]
          if (this.addRowData.defaultValue && currTypeLimit && this.addRowData.defaultValue.length > currTypeLimit) {
            this.$Message.warning(`数值型属性缺省值位数不能超过${currTypeLimit}位`);
            return
          }
          this.addRowModalLoading = true;
          // AttributesLib.createAttributes(mergedData)
          //   .then(res => {
          EntityModeling.bindCustomAttributes(that.addRowTargetClass, [
            {...that.addRowData}
          ])
            .then(async (res) => {

              if (that.isRelation) {
                let _res = await getRelation(that.addRowTargetClass);
                that.AddRelation({
                  className: that.addRowTargetClass,
                  attr: _res.data.attributes
                })
                // that.targetClassAttribute[1] = _res.data.attributes;
                that.$set(that.targetClassAttribute, 1, _res.data.attributes);
              } else {
                let _res = await getAttributes(that.addRowTargetClass);
                that.$set(that, 'targetClassAttribute', _res.data);
                that.targetClassAttribute = _res.data;
                that.AddEntity({
                  className: that.addRowTargetClass,
                  attr: _res.data
                })
              }
              that.editbox.freshAttr(that.targetClassAttribute, that.addRowData.attributeName, that.addRowData.displayName);

              that.addRowModal = false;
              that.addRowModalLoading = false;
              that.addRowData = that.defaultAddAttributes;
              // this.$refs["addAttributeForm"].resetFields();

              that.$Message.success("新建并绑定属性成功");
            })
            .catch(error => {
              that.addRowModalLoading = false;
              // that.$Message.error("绑定属性失败");
            });
          // })
          // .catch(error => {
          //   that.addRowModalLoading = false;
          //   // that.$Message.error("新增属性失败");
          // });
        } else {
          that.addRowModalLoading = false;
          that.$Message.error("请检查输入是否正确");
        }
      });
    },

    getValueLength() {
      this.addRowData.defaultComponent = ''
      if (this.addRowData.valueType === "Boolean" || this.addRowData.valueType === "Json") {
        this.noTime = true;
        this.addRowData.valueLength = 0;
      } else if (this.addRowData.valueType === "Clob" || this.addRowData.valueType === "LocalFile" || this.addRowData.valueType === "Timeseries") {
        this.noTime = true;
        this.addRowData.valueLength = 1024;
      } else if (this.addRowData.valueType === "Date" || this.addRowData.valueType === "TimeStamp" || this.addRowData.valueType === "Time") {
        this.noTime = false;
        this.addRowData.valueLength = 6;
      } else if (this.addRowData.valueType === "Double") {
        this.noTime = true;
        this.addRowData.valueLength = 15;
      } else if (this.addRowData.valueType === "Integer") {
        this.noTime = true;
        this.addRowData.valueLength = 9;
      } else if (this.addRowData.valueType === "Long") {
        this.noTime = true;
        this.addRowData.valueLength = 18;
      } else if (this.addRowData.valueType === "String") {
        this.noTime = true;
        this.addRowData.valueLength = 50;
        this.limitLength = false
      } else if (this.addRowData.valueType === "UUID") {
        this.noTime = true;
        this.addRowData.valueLength = 32;
      }
    },

    // 切换设备
    async actItem(index) {

      console.log(this.syncForm, this.firstLoad);

      if (!this.syncForm && !this.firstLoad) await this.saveForm();

      if (index == 0) {

        this.activeClass = 'actPc';
        this.deviceClass = 'middle-full';
        this.codeClass = 'code';
        this.classPadding = null;
        this.classBackgroundSize = null;

        this.setRemUnit(1024);

      } else if (index == 1) {

        this.activeClass = 'actIpad';
        this.deviceClass = 'middle-ipad';
        this.codeClass = 'code-ipad';

        this.codeClass = 'code-ipad-h';
        if (this.clientHeight< 785) {
          this.classBackgroundSize = '55%'
          let bottom = this.clientHeight-55- (1171 - 90) * 0.55
          this.classPadding = `60px 475px ${bottom}px 75px`
        }
        else {

          this.classBackgroundSize = '70%'
          let bottom = this.clientHeight-55- (1171 - 90) * 0.7
          this.classPadding = `60px 334.2px ${bottom}px 75px`

        }

        this.setRemUnit(768);

      } else if (index == 2) {

        this.activeClass = 'actIpadH';
        this.deviceClass = 'middle-ipad-h';
        this.codeClass = 'code-ipad-h';
        if (this.clientHeight< 785) {
          this.classBackgroundSize = '80%'
          let bottom = this.clientHeight-55- (785 - 41) * 0.8
          this.classPadding = `41px 334.2px ${bottom}px 75px`
        }
        else {
          let bottom = this.clientHeight-55- (785 - 41)
          this.classBackgroundSize = null;
          this.classPadding = `41px 115px ${bottom}px 75px`
        }
        this.setRemUnit(1021);

      } else if (index == 3) {

        this.activeClass = 'actPhone';
        this.deviceClass = 'middle-iphone';
        this.codeClass = 'code-iphone';
        console.log(this.clientHeight)

        if (this.clientHeight< 700) {
          let bottom = this.clientHeight-55- 586.8
          this.classPadding = `35px 52.8px ${bottom}px 10px`
          this.classBackgroundSize = '90%'
        }
        else {
          let bottom = this.clientHeight -55- 652
          this.classPadding = `35px 13px ${bottom}px 10px`
        }
        // ******** 移动端追加 meta约束规则 && flexible-rem  **********

        // var oMeta = document.createElement('meta');
        // oMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0,minimum-scale=1.0, user-scalable=0';
        // oMeta.name = 'viewport';
        // document.getElementsByTagName('head')[0].appendChild(oMeta);

        // import('amfe-flexible/index.js');

        this.setRemUnit(375);

      } else {

        this.activeClass = 'actPhoneH';
        this.deviceClass = 'middle-iphone-h';
        this.codeClass = 'code-iphone-h';

        this.classBackgroundSize = null;
        let bottom = this.clientHeight-55- 373
        this.classPadding = `35px 10px ${bottom}px 10px`
        this.setRemUnit(667);

      }

      // if(!this.syncForm) {
      if (!this.syncForm) this.firstLoad = true;
      if (this.activeIndex != index && this.firstLoad) {
        let jsonData = "";
        let _jsonData = "";
        let basicArgs = "";
        let widgetAnnotation = "";

        if (this.firstLoad && this.createFormState) {
          await this.HandleQueryForm({
            targetClass: this.targetClassName,
            formName: this.viewName,
            isRelation: this.isRelation,
            deviceType: 'actPc',
            formType: this.targetFormType,
            viewDispalyName: this.viewDispalyName,
            note: this.note
          });
          jsonData = this.isRelation ? this.RelationForm(this.targetClassName, this.viewName, this.activeClass) : this.EntityForm(this.targetClassName, this.viewName, this.activeClass);
          _jsonData = this.isRelation ? this.RelationFormS(this.targetClassName, this.viewName, this.activeClass) : this.EntityFormS(this.targetClassName, this.viewName, this.activeClass);
          basicArgs = this.isRelation ? this.RelationFormBasicArgs(this.targetClassName, this.viewName) : this.EntityFormBasicArgs(this.targetClassName, this.viewName);
          widgetAnnotation = this.isRelation ? this.RelationFormWidgetAnnotation(this.targetClassName, this.viewName) : this.EntityFormWidgetAnnotation(this.targetClassName, this.viewName);
          // this.viewData = this.isRelation ? this.RelationFormWidgetAnnotation(this.targetClassName, this.route.meta.copyViewName) : this.EntityFormWidgetAnnotation(this.targetClassName, this.route.meta.copyViewName);
        } else if (this.firstLoad && this.copyViewName) {
          await this.HandleQueryForm({
            targetClass: this.targetClassName,
            formName: this.copyViewName,
            isRelation: this.isRelation,
            deviceType: 'actPc',
            formType: this.targetFormType
            // viewDispalyName: this.viewDispalyName,
            // note: this.note
          });
          let copyDispalyName = this.viewData.displayName;
          let copyNote = this.viewData.note;
          jsonData = this.isRelation ? this.RelationForm(this.targetClassName, this.copyViewName, this.activeClass) : this.EntityForm(this.targetClassName, this.copyViewName, this.activeClass);
          _jsonData = this.isRelation ? this.RelationFormS(this.targetClassName, this.copyViewName, this.activeClass) : this.EntityFormS(this.targetClassName, this.copyViewName, this.activeClass);
          basicArgs = this.isRelation ? this.RelationFormBasicArgs(this.targetClassName, this.copyViewName) : this.EntityFormBasicArgs(this.targetClassName, this.copyViewName);
          widgetAnnotation = this.isRelation ? this.RelationFormWidgetAnnotation(this.targetClassName, this.copyViewName) : this.EntityFormWidgetAnnotation(this.targetClassName, this.copyViewName);
          this.viewData = this.isRelation ? this.RelationFormData(this.targetClassName, this.copyViewName) : this.EntityFormData(this.targetClassName, this.copyViewName);
          this.viewData = this.viewData ? this.viewData : {};
          this.viewData.displayName = copyDispalyName;
          this.viewData.note = copyNote;
        } else {
          await this.HandleQueryForm({
            targetClass: this.targetClassName,
            formName: this.viewName,
            isRelation: this.isRelation,
            formType: this.targetFormType,
            note: this.activeClass
          });
          jsonData = this.isRelation ? this.RelationForm(this.targetClassName, this.viewName, this.activeClass) : this.EntityForm(this.targetClassName, this.viewName, this.activeClass);
          _jsonData = this.isRelation ? this.RelationFormS(this.targetClassName, this.viewName, this.activeClass) : this.EntityFormS(this.targetClassName, this.viewName, this.activeClass);
          basicArgs = this.isRelation ? this.RelationFormBasicArgs(this.targetClassName, this.viewName) : this.EntityFormBasicArgs(this.targetClassName, this.viewName);
          widgetAnnotation = this.isRelation ? this.RelationFormWidgetAnnotation(this.targetClassName, this.viewName) : this.EntityFormWidgetAnnotation(this.targetClassName, this.viewName);
          this.viewData = this.isRelation ? this.RelationFormData(this.targetClassName, this.viewName) : this.EntityFormData(this.targetClassName, this.viewName);
          this.viewData = this.viewData ? this.viewData : {};
        }
        if (basicArgs) {
          Object.assign(this.basicArgs, JSON.parse(basicArgs));
          this.isJson(widgetAnnotation) ? Object.assign(this.widgetAnnotation, JSON.parse(widgetAnnotation)) : '';
        }
        let title = this.viewData.displayName ? `${this.classDisplayName}-${this.viewData.displayName}` : `${this.classDisplayName}`;
        //req 5655
        document.title = title || '清华数为';
        this.firstLoad = false;
        let flag = false;
        if (this.jsonCode) {
          let code1 = this.jsonCode.indexOf("deviceType");
          if (code1 == -1) code1 = this.jsonCode.length;
          let code2 = jsonData.indexOf("deviceType");
          if (code2 == -1) code2 = jsonData.length;
          if (this.jsonCode.substring(0, code1) == jsonData.substring(0, code2)) flag = true;
        }
        console.log("flag:", flag);
        if (jsonData && jsonData != "" && !flag) {
          this.jsonCode = jsonData;
          try {
            this.loading = true;
            console.log("flag:loading");
			      jsonData = JSON.parse(jsonData);
            if (jsonData.opr_path) {
              this.default_opr_path = jsonData.opr_path;
              this.default_opr_type = jsonData.opr_type;
              this.default_opr_sys_path = jsonData.opr_sys_path;
              this.default_opr_showMessage = jsonData.opr_showMessage;
            }
            if (jsonData.init_opr_path) {
              this.init_opr_path = jsonData.init_opr_path;
              this.init_opr_type = jsonData.init_opr_type;
              this.init_opr_sys_path = jsonData.init_opr_sys_path;
              this.init_opr_showMessage = jsonData.init_opr_showMessage;
            }
            let that = this;
            if (this.$refs && this.$refs.form) {
              this.$refs.form.fitDevice(this.activeClass);
              this.$refs.form.targetAttributes = this.targetClassAttribute;
              this.$refs.form.init(jsonData);
              // this.$refs.form.updateConfig();
              this.$refs.form.updateMargin();
              this.loading = false;
              console.log("flag:loading");
              that.spinShow = false;

            } else setTimeout(() => {
              that.$refs.form.fitDevice(this.activeClass);
              that.$refs.form.targetAttributes = that.targetClassAttribute;
              that.$refs.form.init(jsonData);
              // this.$refs.form.updateConfig();
              this.$refs.form.updateMargin();
              console.log("flag:loading");
              that.loading = false;
              that.spinShow = false;
            }, 400);
          } catch (e) {
            this.loading = false;
            this.spinShow = false;
            console.log("form json parse err", e);
          }
        } else {
          this.$refs.form.fitDevice(this.activeClass);
          this.spinShow = false;
        }
      } else {
        this.$refs.form.fitDevice(this.activeClass);
        this.spinShow = false;
      }
      // }

      this.activeIndex = index;
      this.$nextTick(() => {
        this.freshMultiAddins();
      });
    },

      isJson(str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      },

      // REM
      setRemUnit(pWidth) {

        var docEl = document.documentElement;
        var rem = parseInt(pWidth) / 3.75;// ? 为什么要这么算
        // var rem = 14;
        console.log(rem, pWidth, '-rem-')
        docEl.style.fontSize = rem + 'px';

      },

      splitViews(arr, flag) {

        this.pcViews = [];
        this.mobileViews = [];
        if(arr.length == 0) {

          this.chosenViews = [];
          return false

        }

        arr.forEach(v => {

          if(!('formType' in v) || v.formType == 'PC') {
            this.pcViews.push(v)
          }
          if('formType' in v && v.formType == 'Mobile') {
            this.mobileViews.push(v)
          }

        })

        if(flag && flag == 'Mobile') {
          this.chosenViews = this.mobileViews;
        } else {
          this.chosenViews = this.pcViews;
        }

      },

      // 回到该tab页时调用
      activate() {
        this.$refs.form.addListeners();
        if (this.root) this.root.$el.children[1].scrollTo(0, 0);
        if (this.route && this.route.meta) {
          this.route.meta.className ? this.targetClassName = this.route.meta.className : '';
          this.route.meta.formName ? this.viewName = this.route.meta.formName : '';
        }
        if (this.route && !this.route.meta.className) this.createModal = true;
        if (this.root) this.root.$el.children[1].style.overflowY = 'hidden';
        if (this.createForm.chosenClass) {
          getViews(this.createForm.chosenClass, {needV3Content: false}).then(res => {

            if(res.data.success) {

              let fType = sessionStorage.getItem('targetFormType') || 'PC';
              let views = res.data.data;
              this.splitViews(views, 'PC');

            }

          });
        }
      },

      onCreateForm() {
        this.createForm.chosenClass = this.createForm.chosenClass ? this.createForm.chosenClass : this.targetClassName;
        if (this.chosenViews.length == 0) this.handleClassChange();
        this.viewDisabled = false;
        this.editModalChosenClassDisabled = false;
        this.createModalTitle = "创建表单";
        this.createModalChosenClassDisabled = true;
        this.chosenViewId = 0;
        this.$nextTick(() => {
          if(this.createForm.chosenClass !== this.targetClassName){
            this.$refs["chosenClass"].reset();
            this.createForm.chosenClass = this.targetClassName;
          }

          this.createForm.viewName = '';
          this.createForm.viewDisplayName = '';
          this.createForm.note = '';

        })
        this.$refs["createForm"].resetFields();
        this.createForm.chosenType = this.targetFormType;
        this.createModal = true;
      },

      async onCopyForm() {
        await this.saveForm(false);
        this.createForm.chosenClass = this.createForm.chosenClass ? this.createForm.chosenClass : this.targetClassName;
        if (this.chosenViews.length == 0) this.handleClassChange();
        this.viewDisabled = false;

        this.editModalChosenClassDisabled = true;
        this.createModalTitle = "复制表单";
        this.createModalChosenClassDisabled = true;
        this.chosenViewId = 0;

        //fix bug 6507
        this.$nextTick(() => {
          if(this.createForm.chosenClass !== this.targetClassName){
            this.$refs["chosenClass"].reset();
            this.createForm.chosenClass = this.targetClassName;
          }

          this.createForm.viewName = '';
          this.createForm.viewDisplayName = '';
          this.createForm.note = '';

        })
        this.$refs["createForm"].resetFields();
        this.createForm.chosenType = this.targetFormType;
        this.createModal = true;
      },

      onDeleteForm() {
        let viewDisplayName = this.createForm.viewDisplayName || '';
        if (this.route && this.route.meta && !viewDisplayName) {
          viewDisplayName = this.route.meta.viewDisplayName || '';
        }
        this.$Modal.confirm({
          title: "删除确认",
          content: `<p style="word-break: break-all;">确实要把本表单删除吗，删除后无法恢复？——表单名称：${viewDisplayName}(${this.viewName})</p>`,
          okText: "确认",
          cancelText: "取消",
          onOk: async () => {
            let curFormType = this.targetFormType == 'Mobile' ? 'Mobile' : 'PC';
            let res = await getView(this.targetClassName, this.viewName, 'actPc', curFormType);
            let oid = null;
            if (res.data.data) oid = res.data.data.oid;
            if (oid) {
              let res = await deleteView(oid)
              if (!res.success) {
                this.$Message.error(res.message);
              } else {
                this.$Message.success("删除表单成功");
                this.root.onTabRemove(this.route.name);
              }
            } else this.$Message.error("表单不存在");
          }
        })
      },

    onInitalForm() {
      this.basicArgs = {
        label_width: 1,
        main_width: 4,
        label_align: 7,
        main_align: 1,
        // basic_height: 30,
        row_space: 0,
        col_space: 0,
        label_fontColor: 'initial',
        txt_fontColor: 'initial',
        // txt_bgColor: '#fff',
        form_bgColor: '#fff',
        form_fsize: 14,
        form_font_size: '14px',
        // cols: 3
        lfsize: 14,
        fsize: 14,
        label_align_horizontal: "2",
        label_align_vertical: "1",
        main_align_horizontal: "1",
        defaultMultiAddin: '',
        labelWidthUnit: 'px',
        label_widthByPx: 200,
      };
      this.$refs.form.initalForm();
    },

      close() {
        window.close();
        // this.root.onTabRemove(this.route.name);
      },

    // 设置默认操作
    async handleChangeEventOfOperationBar(event, type = null) {
      // 处理基本操作
      if (event.conf.opr_type == 'sys') {
        this.default_opr_path = event.conf.opr_path;
        this.default_opr_type = "sys";
        this.default_opr_showMessage = event.conf.opr_showMessage;
        this.default_opr_sys_path = event.conf.opr_sys_path ? event.conf.opr_sys_path : '';
      } else if (event.conf.opr_type == 'none') {
        this.default_opr_path = '';
        this.default_opr_type = 'none';
      } else {
        // 快速查询操作
        this.default_opr_path = event.conf.opr_path;
        this.default_opr_type = "query";
        let _id = this.query_oprs.findIndex(x => x.oid == event.conf.opr_path);
        if (_id == -1) {
          this.query_oprs.splice(0, 0, event.query_opr);

        } else {
          this.query_oprs[_id] = event.query_opr;
        }
      }
      this.eventOfOperationBarInit = false;
      this.$nextTick(async () => {
        this.eventOfOperationBarInit = true;
      })
    },

    // 设置初始化操作
    handleChangeEventOfOperationBar_init(event, type = null) {
      // 处理基本操作
      if (event.conf.opr_type == 'sys') {
        this.init_opr_path = event.conf.opr_path;
        this.init_opr_type = "sys";
        this.init_opr_showMessage = event.conf.opr_showMessage;
        this.init_opr_sys_path = event.conf.opr_sys_path ? event.conf.opr_sys_path : '';
      } else if (event.conf.opr_type == 'none') {
        this.init_opr_path = '';
        this.init_opr_type = 'none';
      } else {
        // 快速查询操作
        this.init_opr_path = event.conf.opr_path;
        this.init_opr_type = "query";
        let _id = this.query_oprs.findIndex(x => x.oid == event.conf.opr_path);
        if (_id == -1) {
          this.query_oprs.splice(0, 0, event.query_opr);
        } else {
          this.query_oprs[_id] = event.query_opr;
        }
        this.eventOfOperationBar = false;
        this.$nextTick(async () => {
          this.eventOfOperationBar = true;
        })
      }
      this.eventOfOperationBar = false;
      this.$nextTick(async () => {
        this.eventOfOperationBar = true;
      })
    },

      // 加载操作列表
      loadQueryOprList() {
        let that = this;
        // getEntryOperations('Root').then(globalOprRes => {
        //   console.log("opr:", that.targetClassName);
        //   getEntryOperations(that.targetClassName).then(localOprRes => {
        //     that.query_oprs = globalOprRes.data.data.queryOprConfigs.concat(localOprRes.data.data.queryOprConfigs);
        //   })
        // });
      },

      // 更新基础配置
      async configOk() {

      this.$refs["basicConfigForm"].validate(async valid => {
        if (valid) {
          //fix bug 6630
          this.viewData.note = this.note = this.basicConfigForm.note;
          this.viewData.displayName = this.viewDisplayName = this.basicConfigForm.viewDisplayName;
          await this.saveForm();
          this.configModal = false;
        } else {
          return false;
        }
      })
    },

      quickCreateOk() {

        if (this.preDbClick) {
          return false;
        } else {

          this.preDbClick = true;
          this.$refs.form.quickCreate(this.quickCreateArgs);
          setTimeout(() => {
            this.preDbClick = false;
          }, 3000)

        }
      },

      quickCreateRelation() {
        this.$refs.form.quickCreateRelation(this.quickCreateArgs);
      },

      quickSelectAll(index) {
        this.quickCreateArgs[index].selectedAttributes = this.targetClassAttribute.map(attr => {
          return attr.attributeName;
        });
      },

      quickSelectRelationAll(index) {
        this.quickCreateArgs[index].relationAttributes = this.targetClassAttribute[1].map(attr => {
          return attr.attributeName;
        });
        this.quickCreateArgs[index].leftAttributes = this.targetClassAttribute[2].map(attr => {
          return attr.attributeName;
        });
        this.quickCreateArgs[index].rightAttributes = this.targetClassAttribute[3].map(attr => {
          return attr.attributeName;
        });
      },

      quickCancelAll(index) {
        this.quickCreateArgs[index].selectedAttributes = []
      },

      quickCancelRelationAll(index) {
        this.quickCreateArgs[index].relationAttributes = [];
        this.quickCreateArgs[index].leftAttributes = [];
        this.quickCreateArgs[index].rightAttributes = [];
      },

    addQuickCreateGroup() {
      this.quickCreateArgs.push({
        groupName: "新分组" + (this.quickCreateArgs.length + 1),
        cols: 2,
        selectedAttributes: [],
        relationAttributes: [],
        leftAttributes: [],
        rightAttributes: [],
      })
    },

      deleteQuickCreateGroup(index) {
        this.quickCreateArgs.splice(index, 1);
      },

      moveupQuickCreateGroup(index) {
        if (index < 1) return;
        // this.currentGroup = index - 1;
        let arr = this.quickCreateArgs;
        arr.splice(index - 1, 1, ...arr.splice(index, 1, arr[index - 1]));
      },

      movedownQuickCreateGroup(index) {
        if (this.quickCreateArgs.length == index + 1) return;
        // this.currentGroup = index + 1;
        let arr = this.quickCreateArgs;
        arr.splice(index + 1, 1, ...arr.splice(index, 1, arr[index + 1]));
      },

      handleCloseTag(index, i) {
        this.quickCreateArgs[index].selectedAttributes.splice(i, 1);
      },

      handleRelationCloseTag(index, i) {
        this.quickCreateArgs[index].relationAttributes.splice(i, 1);
      },

      handleLeftCloseTag(index, i) {
        this.quickCreateArgs[index].leftAttributes.splice(i, 1);
      },

      handleRightCloseTag(index, i) {
        this.quickCreateArgs[index].rightAttributes.splice(i, 1);
      },

      handleCollpasedChange(state) {
        this.collapsed = state;
        if (this.sideSpan == 4) {
          this.sideSpan = 1;
          this.sideDisplay = 'none';
          this.formSpan += 3;
        } else {
          this.sideSpan = 4;
          this.sideDisplay = 'block';
          this.formSpan -= 3;
        }
        this.scrollHeadTool();
      },

      handleEditBoxDisplayChange(state) {
        this.editBoxDisplay = state;
        if (!this.editBoxDisplay) {
          this.hideEditBox();
        } else {
          this.showEditBox();
        }
        this.scrollHeadTool();
      },

      changeChosenView(id, name, displayName, note, formType) {
        if (id == null) id = "0";
        if (name == null) name = "";
        if (displayName == null) displayName = '';
        if (note == null) note = '';
        if (id != "0") {
          this.createForm.viewName = name;
          this.createForm.viewDisplayName = displayName;
          this.createForm.note = note;
          this.createForm.chosenType = formType;
          this.viewDisabled = true;
        } else {
          this.viewDisabled = false;
          if (this.chosenViewId != id) {
            this.createForm.viewName = "";
            this.createForm.viewDisplayName = '';
            this.createForm.note = '';
            this.createForm.chosenType = formType;
          }
        }
        this.createForm.viewName = this.createForm.viewName.trim();
        this.chosenViewId = id;
        // this.$refs.createForm.validate();
      },

      handleClassChange() {
        let _self = this;

        this.hasRelatedClass = false;

        let curType = this.actDevice === 0 ? 'PC' : 'Mobile';
        this.changeChosenView(null, null, null, null, curType);

        if (_self.createForm.chosenClass) {
          getViews(_self.createForm.chosenClass, {needV3Content: false}).then(res => {

            if(res.data.success) {

              let views = res.data.data;
              _self.actDevice = _self.targetFormType == 'Mobile' ? 1 : 0;

              _self.splitViews(views, _self.targetFormType);

            }
          });
        }

        //fix bug 6597
        this.$set(this.createForm, 'viewName', '');

      },
      // 端口设置
      portFormat() {
        let APPPort = '8080'
        let ModelerPort = '8081'
        let portM = Config.ModelerPort ? Config.ModelerPort : ModelerPort;
        let portA= Config.APPPort ? Config.APPPort : APPPort;
        let host = Config.host.replace(portM, portA)
        return host
      },
      formStateChange(ev) {
        let proto = window.location.protocol;
        let host = this.portFormat();
        let routeName = this.targetFormType == 'Mobile'? Config.baseMobileRouteName : Config.baseAppRouteName
        let temValue = `${proto}//${host}/${routeName}/forms/${this.targetClassName}/${this.viewName}?displayType=${ev}&token=${this.$store.state.user.token}`;

        if(this.shareApp != undefined && this.shareApp != '') {
          let appId = this.shareApp.split('/')[0];
          let appName = this.shareApp.split('/')[1];
          temValue = `${temValue}&appName=${appName}&appId=${appId}`
        }
        if(this.shareQuery != undefined && this.shareQuery != '') {
          temValue = `${temValue}&query=${this.shareQuery}`
        }

        this.shareValue = temValue;

        if (this.targetFormType== 'Mobile') {
          QRCode.toCanvas(canvas, this.shareValue, (error) => {
            if (error) {
              console.log(error)
            } else {
              console.log('success')
            }
          })
        }
      },

      shareAppChange(ev) {
        if(ev == undefined) {

          let proto = window.location.protocol;
          let host = this.portFormat();
          this.shareValue = `${proto}//${host}/${Config.baseAppRouteName}/forms/${this.targetClassName}/${this.viewName}?displayType=${this.shareFormState}&token=${this.$store.state.user.token}`;

        } else {

          let appId = ev.split('/')[0];
          let appName = ev.split('/')[1];
          let proto = window.location.protocol;
          let host = this.portFormat();
          this.shareValue = `${proto}//${host}/${Config.baseAppRouteName}/forms/${this.targetClassName}/${this.viewName}?displayType=${this.shareFormState}&appName=${appName}&appId=${appId}&token=${this.$store.state.user.token}`;

        }

        if(this.shareQuery != undefined && this.shareQuery != '') {
          this.shareValue = `${this.shareValue}&query=${this.shareQuery}`
        }
      },

      shareQueryChange(ev) {
        let value = ev.target.value;
        if(value != '') {

            let proto = window.location.protocol;
            let host = this.portFormat();
            let routeName = this.targetFormType == 'Mobile'? Config.baseMobileRouteName : Config.baseAppRouteName
            this.shareValue = `${proto}//${host}/${routeName}/forms/${this.targetClassName}/${this.viewName}?displayType=${this.shareFormState}&query=${value}&token=${this.$store.state.user.token}`;

        } else {

            let proto = window.location.protocol;
            let host = this.portFormat();
            let routeName = this.targetFormType == 'Mobile'? Config.baseMobileRouteName : Config.baseAppRouteName
            this.shareValue = `${proto}//${host}/${routeName}/forms/${this.targetClassName}/${this.viewName}?displayType=${this.shareFormState}&token=${this.$store.state.user.token}`;

        }

        if(this.shareApp != undefined && this.shareApp != '') {
          let appId = this.shareApp.split('/')[0];
          let appName = this.shareApp.split('/')[1];
          this.shareValue = `${this.shareValue}&appName=${appName}&appId=${appId}`
        }

        if (this.targetFormType== 'Mobile') {
          QRCode.toCanvas(canvas, this.shareValue, (error) => {
            if (error) {
              console.log(error)
            } else {
              console.log('success')
            }
          })
        }
      },

      // 分享表单: 拼出app端链接并带上token,并通过超链接打开
      shareForm() {
        // this.$Spin.show();
        this.shareModal = true;
        this.shareQuery = '';
        this.shareFormState = 'create';
        let proto = window.location.protocol;
        let host = this.portFormat();
        this.shareFormState = 'create';
        let routeName = this.targetFormType == 'Mobile'? Config.baseMobileRouteName : Config.baseAppRouteName

        this.shareValue = `${proto}//${host}/${routeName}/forms/${this.targetClassName}/${this.viewName}?displayType=${this.shareFormState}&token=${this.$store.state.user.token}`;


        if (this.targetFormType== 'Mobile') {
          QRCode.toCanvas(canvas, this.shareValue, (error) => {
            this.$Spin.hide();
            if (error) {
              console.log(error)
            } else {
              console.log('success')
            }
        })

        }

      },
      toShareTab(name) {
        let proto = window.location.protocol;
        let host = this.portFormat();
        let url = '';
        if(this.shareValue == '') {
          let routeName = this.targetFormType == 'Mobile'? Config.baseMobileRouteName : Config.baseAppRouteName

          url = `${proto}//${host}/${routeName}/forms/${this.targetClassName}/${this.viewName}?displayType=${this.shareFormState}&token=${this.$store.state.user.token}`;
        } else {
          url = this.shareValue;
        }

        let a = document.createElement('a');
        a.href = url;
        a.target = "_blank";
        a.click();

        this.shareModal = false;
      },

      //保存批注
      confirmComment() {
        this.widgetAnnotation[this.addin_self] = this.addin_comment;
      },

      // 保存表单
      async saveForm(tips = true) {
        if(this.saveFormDebounce) return;
        this.saveFormDebounce = true;
        const self = this;
        history.replaceState ? history.replaceState(null, null, window.location.href.split('&copyViewName')[0]) : '';
        history.replaceState ? history.replaceState(null, null, window.location.href.split('&displayName')[0]) : '';
        this.jsonCode = this.$refs.form.getJsonCode();
        if (this.default_opr_type != "" || this.init_opr_type != "") {
          let jsonData = JSON.parse(this.jsonCode);
          if (this.default_opr_type == "sys") {
            if (this.default_opr_path == "save") jsonData.opr_name = "新增";
            else if (this.default_opr_path == "edit") jsonData.opr_name = "编辑";
            else if (this.default_opr_path == "delete") jsonData.opr_name = "删除";
            else if (this.default_opr_path == "refresh") jsonData.opr_name == "刷新";
          } else if (this.default_opr_type == "query") {
            let query_opr = await axios.get(`meta/queryoperations/${this.default_opr_path}`);
            query_opr = query_opr.data.data;
            jsonData.opr_name = query_opr.displayName;
          }
          if (this.default_opr_type == 'none') this.default_opr_type = '';
          if (this.init_opr_type == 'none') this.init_opr_type = '';
          jsonData.opr_path = this.default_opr_path;
          jsonData.opr_type = this.default_opr_type;
          jsonData.opr_sys_path = this.default_opr_sys_path;
          jsonData.opr_showMessage = this.default_opr_showMessage;
          jsonData.init_opr_path = this.init_opr_path;
          jsonData.init_opr_type = this.init_opr_type;
          jsonData.init_opr_sys_path = this.init_opr_sys_path;
          jsonData.init_opr_showMessage = this.init_opr_showMessage;
          this.jsonCode = JSON.stringify(jsonData, null, 4);
        }
        this.basicArgs.label_align_horizontal = this.basicArgs.label_align > 5 ? 2 + '' : this.basicArgs.label_align > 2 ? 1 + '' : 0 + '';
        this.basicArgs.label_align_vertical = this.basicArgs.label_align % 3 + '';
        this.basicArgs.main_align_horizontal = this.basicArgs.main_align + '';

        var params = {
          className: this.targetClassName,
          hasThumbnail: false,
          v3Content: this.jsonCode,
          viewName: this.viewName,
          displayName: this.viewData ? this.viewDisplayName || this.basicConfigForm.viewDisplayName || this.viewData.displayName : this.viewDisplayName || this.basicConfigForm.viewDisplayName,
          note: this.viewData ? this.note || this.basicConfigForm.note || this.viewData.note : this.note || this.basicConfigForm.note,
          isRelation: this.isRelation,
          deviceType: 'actPc',
          formType: this.targetFormType,
          basicInfo: JSON.stringify(this.basicArgs),
          widgetAnnotation: JSON.stringify(this.widgetAnnotation),
        };
        let flag = await this.UpdateFView(params);
        if (flag == 0 && tips) {
          self.$Message.error("保存表单失败");
        } else if (flag == 1 && tips) {
          self.$Message.success("更新表单成功");
          let title = params.displayName ? `${this.classDisplayName}-${params.displayName}` : `${this.classDisplayName}`;
          document.title = title || '清华数为';
        } else if (flag == 2 && tips) {
          self.$Message.success("创建表单成功");
        } else if (typeof flag === 'string'){
          self.$Message.error(flag);
        }
        this.saveFormDebounce = false;
        if (typeof flag !== 'string' && flag > 0 && this.root) {
          this.root.updateFormRoute(this.targetClassName, this.viewName, params);
        }
        this.$refs.form._reloadGridFilter();
      },

      initComponentGroup(){
        try{
          getComp2compgroupTree().then(res => {
            if(res.success){
              res.data.forEach((group, index) => {
                if(group.oid){
                  group.children.forEach(component => {
                    component.groupOid = group.oid;
                    component.groupDisplayName = group.displayName;
                  })
                  this.editExtendInfo.componentGroup = this.componentGroup.push(group);
                  this.componentGroupAddin.push(group);
                  this.componentGroupAddinIconList[index] = group.children;

                }
              })
              this.editExtendInfo.componentGroup = this.componentGroup = res.data.filter(group => group.oid);
              this.componentGroupAddin = res.data.filter(group => group.oid);

            } else{
              this.editExtendInfo.componentGroup = this.componentGroup = [];
              this.componentGroupAddin = [];
            }
          })
        } catch (e) {
          console.error(e);
          this.editExtendInfo.componentGroup = this.componentGroup = [];
          this.componentGroupAddin = [];
        }
      },

      openAddComponentModal() {
        // if(this.$refs.form.includeComponentAddin()){
        //   this.saveFormDebounce = false;
        //   this.$refs.form._reloadGridFilter();
        //   this.$Message.error('组件不可再次保存为组件');
        //   return;
        // }else{
        //   this.openAddComponentModal = true;
        // }
        this.$refs["addComponentForm"].resetFields();
        this.addComponentModal = true;
      },

      openAddGroupModal(){
        this.$refs["addGroupForm"].resetFields();
        this.addGroupModal = true;
      },

      //存为组件
      async saveAsComponent() {
        if (this.addComponentModalLoading) return;
        this.addComponentModalLoading = true;
        this.$refs["addComponentForm"].validate(async valid => {
          if (valid) {
            const self = this;
            history.replaceState ? history.replaceState(null, null, window.location.href.split('&copyViewName')[0]) : '';
            history.replaceState ? history.replaceState(null, null, window.location.href.split('&displayName')[0]) : '';
            this.jsonCode = this.$refs.form.getJsonCode();
            if (this.default_opr_type != "" || this.init_opr_type != "") {
              let jsonData = JSON.parse(this.jsonCode);
              if (this.default_opr_type == "sys") {
                if (this.default_opr_path == "save") jsonData.opr_name = "新增";
                else if (this.default_opr_path == "edit") jsonData.opr_name = "编辑";
                else if (this.default_opr_path == "delete") jsonData.opr_name = "删除";
                else if (this.default_opr_path == "refresh") jsonData.opr_name == "刷新";
              } else if (this.default_opr_type == "query") {
                let query_opr = await axios.get(`meta/queryoperations/${this.default_opr_path}`);
                query_opr = query_opr.data.data;
                jsonData.opr_name = query_opr.displayName;
              }
              if (this.default_opr_type == 'none') this.default_opr_type = '';
              if (this.init_opr_type == 'none') this.init_opr_type = '';
              jsonData.opr_path = this.default_opr_path;
              jsonData.opr_type = this.default_opr_type;
              jsonData.opr_sys_path = this.default_opr_sys_path;
              jsonData.opr_showMessage = this.default_opr_showMessage;
              jsonData.init_opr_path = this.init_opr_path;
              jsonData.init_opr_type = this.init_opr_type;
              jsonData.init_opr_sys_path = this.init_opr_sys_path;
              jsonData.init_opr_showMessage = this.init_opr_showMessage;
              this.jsonCode = JSON.stringify(jsonData, null, 4);
            }
            this.basicArgs.label_align_horizontal = this.basicArgs.label_align > 5 ? 2 + '' : this.basicArgs.label_align > 2 ? 1 + '' : 0 + '';
            this.basicArgs.label_align_vertical = this.basicArgs.label_align % 3 + '';
            this.basicArgs.main_align_horizontal = this.basicArgs.main_align + '';

            var params = [{
              v3Content: this.jsonCode,
              viewName: this.addComponentData.viewName,
              displayName: this.addComponentData.displayName,
              note: this.addComponentData.note,
              icon: this.addComponentData.icon,
              owner: this.addComponentData.owner,
              basicInfo: JSON.stringify(this.basicArgs),
              widgetAnnotation: JSON.stringify(this.widgetAnnotation),
            }];
            try {
              let res = await createComponent(params);
              if (res.success) {
                this.addComponentModalLoading = false;
                if (this.root) {
                  this.root.updateFormRoute(this.targetClassName, this.viewName, params);
                }
                this.$refs.form._reloadGridFilter();
                this.$Message.success("存为组件成功");
                this.initComponentGroup();
                this.addComponentModal = false;
              } else {
                this.addComponentModalLoading = false;
              }
            } catch (e) {
              this.addComponentModalLoading = false;
            }

            // let obj = {
            //   className: this.targetClassName,
            //   hasThumbnail: false,
            //   v3Content: this.jsonCode,
            //   viewName: this.viewName,
            //   displayName: this.viewData ? this.viewDisplayName || this.basicConfigForm.viewDisplayName || this.viewData.displayName : this.viewDisplayName || this.basicConfigForm.viewDisplayName,
            //   note: this.viewData ? this.note || this.basicConfigForm.note || this.viewData.note : this.note || this.basicConfigForm.note,
            //   isRelation: this.isRelation,
            //   deviceType: this.activeClass,
            //   basicInfo: JSON.stringify(this.basicArgs),
            //   widgetAnnotation: JSON.stringify(this.widgetAnnotation),
            // }
            // this.AddEntityForm(obj);
          } else {
            this.addComponentModalLoading = false;
          }
        })
      },

      openEditComponentModal(component) {
        this.$refs["editComponentForm"].resetFields();
        this.editComponentModal = true;
        this.editComponentData = {...component};
      },

      //删除组件
      deleteComponentAddin(oid) {
        this.$Modal.confirm({
          title: "删除确认",
          content: `<p style="word-break: break-all;">确实要把组件删除吗，删除后无法恢复？</p>`,
          okText: "确认",
          cancelText: "取消",
          onOk: async () => {
            let res = await deleteComponent(oid);
            if (!res.success) {
              this.$Message.error(res.message);
            } else {
              this.$Message.success("删除表单成功");
              this.initComponentGroup();
            }
          }
        })
      },

      //编辑组件
      async editComponentAddin() {
        this.$refs["editComponentForm"].validate(async valid => {
          if (valid) {
            this.editComponentModalLoading = true;
            var params = {
              componentDisplayName: this.editComponentData.displayName,
              componentGroupOid: this.editComponentData.owner,
              componentOid: this.editComponentData.componentOid,
              componentIcon: this.editComponentData.componentIcon,
              oid: this.editComponentData.relationOid,
              componentNote: this.editComponentData.note,
            };
            try {
              let res = await comp2compgroupUpdate(params);
              if (res.success) {
                // this.$refs.form._reloadGridFilter();
                this.editComponentModalLoading = false;
                this.$Message.success("编辑组件成功");
                this.initComponentGroup();
                this.editComponentModal = false;
              } else {
                this.$Message.error(res.message);
              }
            } catch (e) {
              console.error(e);
              this.editComponentModalLoading = false;
            }
            // let obj = {
            //   className: this.targetClassName,
            //   hasThumbnail: false,
            //   v3Content: this.jsonCode,
            //   viewName: this.viewName,
            //   displayName: this.viewData ? this.viewDisplayName || this.basicConfigForm.viewDisplayName || this.viewData.displayName : this.viewDisplayName || this.basicConfigForm.viewDisplayName,
            //   note: this.viewData ? this.note || this.basicConfigForm.note || this.viewData.note : this.note || this.basicConfigForm.note,
            //   isRelation: this.isRelation,
            //   deviceType: this.activeClass,
            //   basicInfo: JSON.stringify(this.basicArgs),
            //   widgetAnnotation: JSON.stringify(this.widgetAnnotation),
            // }
            // this.AddEntityForm(obj);
          }
        })

      },

      //修改组件所在表单
      goToEditComponentForm() {
        let url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/Component/${this.editComponentData.viewName}?token=${this.$store.state.user.token}&classType=entity`;
        let a = document.createElement('a');
        a.href = url;
        a.target = "_blank";
        a.click();
      },

      async addGroup() {
        this.$refs["addGroupForm"].validate(async valid => {
          if (valid) {
            this.addGroupModalLoading = true;
            try {
              // if(this.componentGroup.filter(group => group.name === this.addGroupData.name).length !== 0){
              //   var editGroupData = this.componentGroup.find(group => group.name === this.addGroupData.name);
              //   editGroupData.displayName = this.addGroupData.displayName
              //   await updateComponentGroups(editGroupData);
              //   this.$Message.success("修改分组成功");
              // }else{
              let newGroup = await createComponentGroups(this.addGroupData);
              this.$Message.success("新增分组成功");
              // }
              this.addGroupModalLoading = false;
              this.addGroupModal = false;
              this.addGroupData = {
                name: "",
                displayName: "",
              };
              this.initComponentGroup();
              this.$nextTick(() => {
              setTimeout(() => {
                if (this.addComponentModal) {
                  this.$set(this.addComponentData, 'owner', newGroup.data.oid);
                } else {
                  this.$set(this.editComponentData, 'owner', newGroup.data.oid);
                }
              }, 200)
            })
            } catch (e) {
              console.error(e)
              this.addGroupModalLoading = false;
            }
          } else {
            this.addGroupModalLoading = false;
            this.$Message.error("请检查输入是否正确");
          }
        });
      },
      // 预览表单: 拼出app端链接通过iframe打开
      async previewForm() {
        await this.saveForm(false);
        this.previewUrl = '';
        let proto = window.location.protocol;
        let host = this.portFormat();
        console.log(host, this.$store.state.user.token);
        let params = {initScript: " ", _obj: {}};
        params = JSON.stringify(params);
        let routeName = this.targetFormType == 'Mobile'? Config.baseMobileRouteName : Config.baseAppRouteName
        let url = `${proto}//${host}/${routeName}/forms/${this.targetClassName}/${this.viewName}?displayType=“create”&token=${this.$store.state.user.token}`;
        //&paramsStr=${params}
        this.$nextTick(() => {
          this.previewUrl = url;
          this.previewModal = true;
        })
      },

      openBasicConfigForm() {
        this.configModal = true;
        if (this.viewData) {
          this.basicConfigForm.viewName = this.viewData.viewName;
          this.basicConfigForm.viewDisplayName = this.viewData.displayName || this.viewDisplayName;
          this.basicConfigForm.note = this.viewData.note || this.note;
        }
      },

      hideEditBox() {
        this.formSpan = 24 - this.sideSpan;
        this.$nextTick(() => {
          this.editVisible = false;
          this.editBoxDisplay = false;
        })
        this.scrollHeadTool();
      },

      showEditBox(addin) {
        this.formSpan = 20 - this.sideSpan;
        this.editVisible = true;
        this.editBoxDisplay = true;
        // this.addin = addin;
        // let targetAddin = addin;
        // if(!targetAddin.actEdit) {
        //   targetAddin.actEdit = true;
        // }
        // this.addinArgs = addin.getArgs();
        // this.initialbasicArgs(this.addinArgs);
        this.scrollHeadTool();
        console.log("tst:");
      },

      scrollHeadTool() {
        this.$nextTick(() => {
          if (this.$refs.formBar.$el.clientWidth < 800) {
            this.$refs.formBarContainer.classList.add('container-scroll');
          } else {
            this.$refs.formBarContainer.classList.remove('container-scroll');
          };
        })
      },

      initialbasicArgs(args) {
        this.basicArgs.label_width = args.label_width;
        this.basicArgs.main_width = args.main_width;
        this.basicArgs.lfsize = args.lfsize;
        this.basicArgs.fsize = args.fsize;
        this.basicArgs.label_align_horizontal = args.label_align > 5 ? 2 + '' : args.label_align > 2 ? 1 + '' : 0 + '';
        this.basicArgs.label_align_vertical = args.label_align % 3 + '';
        this.basicArgs.main_align_horizontal = args.main_align + '';
      },

    setBasicArgs(arg) {
      if (this.basicArgs.label_align_horizontal === '0' && this.basicArgs.label_align_vertical === '0') {
        this.basicArgs.label_align = 0;
      } else if (this.basicArgs.label_align_horizontal === '0' && this.basicArgs.label_align_vertical === '1') {
        this.basicArgs.label_align = 1;
      } else if (this.basicArgs.label_align_horizontal === '0' && this.basicArgs.label_align_vertical === '2') {
        this.basicArgs.label_align = 2;
      } else if (this.basicArgs.label_align_horizontal === '1' && this.basicArgs.label_align_vertical === '0') {
        this.basicArgs.label_align = 3;
      } else if (this.basicArgs.label_align_horizontal === '1' && this.basicArgs.label_align_vertical === '1') {
        this.basicArgs.label_align = 4;
      } else if (this.basicArgs.label_align_horizontal === '1' && this.basicArgs.label_align_vertical === '2') {
        this.basicArgs.label_align = 5;
      } else if (this.basicArgs.label_align_horizontal === '2' && this.basicArgs.label_align_vertical === '0') {
        this.basicArgs.label_align = 6;
      } else if (this.basicArgs.label_align_horizontal === '2' && this.basicArgs.label_align_vertical === '1') {
        this.basicArgs.label_align = 7;
      } else if (this.basicArgs.label_align_horizontal === '2' && this.basicArgs.label_align_vertical === '2') {
        this.basicArgs.label_align = 8;
      }
      this.basicArgs.main_align = parseInt(this.basicArgs.main_align_horizontal);
      this.basicArgs.label_width = this.basicArgs.label_width ? parseInt(this.basicArgs.label_width) : 1;
      this.basicArgs.main_width = this.basicArgs.main_width ? parseInt(this.basicArgs.main_width) : 1;
      this.basicArgs.label_widthByPx = this.basicArgs.label_widthByPx ? parseInt(this.basicArgs.label_widthByPx) : 1;
      this.basicArgs.form_font_size = this.basicArgs.form_fsize + 'px';
      this.basicArgs.txt_fontColor = this.basicArgs.txt_fontColor ? this.basicArgs.txt_fontColor : 'initial';
      this.basicArgs.label_fontColor = this.basicArgs.label_fontColor ? this.basicArgs.label_fontColor : 'initial';
      if (arg === 'label_width') {
        this.$refs.form.updateConfig('main_width');
      }
      if (arg === 'main_width') {
        this.$refs.form.updateConfig('label_width');
      }
      this.$refs.form.updateConfig(arg);
    },

    commentAddin(uuid) {
      this.commentModal = true;
      this.addin_self = uuid;
      this.addin_comment = this.widgetAnnotation[uuid];
    },

    async checkRelation(relation) {
      if (!this.EntityAttrList(relation.leftClass) || this.EntityAttrList(relation.leftClass).length == 0) {
        var entity = await getEntity(relation.leftClass);
        if (entity.data) {
          entity = entity.data;
          var attr = entity.attributes;
          delete entity.attributes;
          this.AddEntity({
            className: entity.className,
            basic: entity,
            attr: attr
          })
        }
      }
      if (!this.EntityAttrList(relation.rightClass) || this.EntityAttrList(relation.rightClass).length == 0) {
        var entity = await getEntity(relation.rightClass);
        if (entity.data) {
          entity = entity.data;
          var attr = entity.attributes;
          delete entity.attributes;
          this.AddEntity({
            className: entity.className,
            basic: entity,
            attr: attr
          })
        }
      }
    },

    // 指定好表格后,获取json并渲染工作区
    async ok() {

      let flag = this.createModal;
      let flag2 = true;

      if (this.createModalTitle == "复制表单") {
        try {
          let view = this.chosenViews.filter(item => item.viewName === this.createForm.viewName);
          if (view.length > 0) {
            this.$Message.error('复制表单名不可以与已有表单重名');
            return
          }
        } catch (e) {
          console.log('判断表单重名失败')
        }
      }
      if (this.createModal) {
        await this.$refs.createForm.validate(valid => {
          if (valid) {
            this.createModal = false;
          } else {
            this.$Message.error('请输入正确的信息');
            return;
          }
        })
        if (this.createModal) return;
        if (this.chosenViews.findIndex(x => x.viewName.trim() == this.createForm.viewName.trim()) > -1) flag2 = false;
      }
      let a = document.createElement('a');
      a.target = "_blank";
      let url = null;
      if (flag) {
        let copyViewName = null;
        // let copyViewConfig = null;
        // let a = document.createElement('a');
        let targetClass = this.createForm.chosenClass;
        let viewName = this.route ? this.route.meta.formName : this.createForm.viewName;
        // let url = null;
        if (this.createModalTitle == "复制表单") {
          copyViewName = this.$route.params.formName;
          // copyViewConfig = {
          //   basicArgs: this.basicArgs,
          //   widgetAnnotation: this.widgetAnnotation
          // };
          //modify by yyj 2020-09-07 第一步 通过getView 获取view的oid
          let curFormType = this.actDevice == 0 ? 'PC' : 'Mobile';
          let res = await getView(this.targetClassName, this.viewName, 'actPc', curFormType);
          let toid = null;
          if (res.data.data) toid = res.data.data.oid;
          //第二步 调用copy接口 根据oid 和 目标类名、表单名称、显示名、备注复制表单
          var createObj = {};
          createObj["newClassName"] = this.createForm.chosenClass;
          createObj["newDeviceType"] = "actPc";
          createObj["newDisplayName"] = this.createForm.viewDisplayName;
          createObj["newFormType"] = curFormType;
          createObj["newNote"] = this.createForm.note;
          createObj["newViewName"] = this.createForm.viewName;
          let viewcp = await copyView(toid,createObj);
          if (viewcp.data.code == 200) {
            console.log("视图跨类复制成功，打开复制表单");
            if (this.createForm.chosenClass !== this.targetClassName) {
              this.$refs["chosenClass"].reset();
              this.createForm.chosenClass = this.targetClassName;
            }
            let tClass = createObj.newClassName;
            let tViewName = createObj.newViewName;
            console.log(createObj);
            //第三步 直接打开复制好的表单

            let url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/${tClass}/${tViewName}?token=${this.$store.state.user.token}&formType=${this.createForm.chosenType || 'PC'}&classType=${this.targetClassType}`;
            a.href = url;
            a.click();
            return;
          } else {
            this.$Message.error("复制表单失败!" + viewcp.data.message);
            return;
          }
        }

        if (copyViewName) {
          url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/${targetClass}/${viewName}?token=${this.$store.state.user.token}&copyViewName=${copyViewName}&displayName=${this.createForm.viewDisplayName || ''}&note=${this.createForm.note || ''}&createForm=true&formType=${this.createForm.chosenType || 'PC'}&classType=${this.targetClassType}`;
          a.href = url;
          a.click();
          return;
        } else {
          url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/${targetClass}/${viewName}?token=${this.$store.state.user.token}&displayName=${this.createForm.viewDisplayName || ''}&note=${this.createForm.note || ''}&createForm=true&formType=${this.createForm.chosenType || 'PC'}&createForm=true&classType=${this.targetClassType}`;
          a.href = url;
        }
        // this.root.goToNewFormCreate(flag2, this.createForm.chosenClass, this.createForm.viewName, copyViewName, this.activeClass, this.viewDisplayName, this.note);
        // return;
      }

      if (this.classType == 'entity') {

        // this.editExtendInfo.classCategory = 'ItemClass';
        this.isRelation = false;

      } else if (this.classType == 'relation') {

        // this.editExtendInfo.classCategory = 'RelationClass';
        this.isRelation = true;

      } else {

        // let _class = await getClass(this.targetClassName);
        // _class = _class.data.data;
        // if (_class.classCategory == "RelationClass") this.isRelation = true;
        // this.editExtendInfo.classCategory = _class.classCategory;

      }
      this.targetClassName = this.createForm.chosenClass;
      this.targetClassName_ = {className: this.targetClassName};
      let _class;
      try {
        let _class = await getClass(this.targetClassName);
        _class = _class.data.data;

        if (_class) {
          this.editExtendInfo.classCategory = _class ? _class.classCategory : '';
          if (this.editExtendInfo.classCategory == "RelationClass") this.isRelation = true;
          if(!this.isRelation){
            // 模板
            this.currentItem = _class
            if(flag){
              await this.handleTemplate(this.createForm.chosenClass, this.createForm.viewName, this.createForm.viewDisplayName || '', this.isRelation, '', this.createForm.note || '', this.createForm.chosenType || 'PC')
              a.click();
              return;
            }
          }
          this.classDisplayName = _class.displayName;
        }
      } catch (e) {
        console.error(e);
        this.editExtendInfo.classCategory = 'ItemClass';
        this.classDisplayName = '';
        this.isRelation = false;
      }
      this.viewName = this.createForm.viewName;
      this.viewDisplayName = this.createForm.viewDisplayName || '';
      this.note = this.createForm.note;
      this.chosenType = this.createForm.chosenType;
      try {
        if (this.isRelation) {
          let res = await getRelation(this.targetClassName);
          let relation = res.data;
          // 模板
          this.currentItem = relation
          if(flag){
            await this.handleTemplate(this.createForm.chosenClass, this.createForm.viewName, this.createForm.viewDisplayName || '', this.isRelation, '', this.createForm.note || '', this.createForm.chosenType || 'PC')
            a.click();
            return;
          }

          let basic = {};
          for (var j in relation) {
            if (j != "id" && j != "attributes") basic[j] = relation[j];
          }
          this.relation = basic;
          this.AddRelation({
            className: this.targetClassName,
            basic: basic,
            attr: relation.attributes
          });
          await this.checkRelation(basic);
          let attr = ['relation'];
          attr.push(relation.attributes);
          let left = await getAttributes(relation.leftClass);
          attr.push(left.data);
          let right = await getAttributes(relation.rightClass);
          attr.push(right.data);
          // attr.push(this.EntityAttrList(relation.leftClass));
          // attr.push(this.EntityAttrList(relation.rightClass));
          this.targetClassAttribute = attr;

          this.attrGroup = [];
          let reTypeSysAttr = this.targetClassAttribute[1].filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
          let reTypeDefAttr = this.targetClassAttribute[1].filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);

          let lEnTypeSysAttr = this.targetClassAttribute[2].filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          let lEnTypeDefAttr = this.targetClassAttribute[2].filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);

          let rEnTypeSysAttr = this.targetClassAttribute[3].filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          let rEnTypeDefAttr = this.targetClassAttribute[3].filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
          this.attrGroup.push(reTypeSysAttr, reTypeDefAttr, lEnTypeSysAttr, lEnTypeDefAttr, rEnTypeSysAttr, rEnTypeDefAttr);

        } else {
          // 获取实体类属性
          var res = await getAttributes(this.targetClassName);
          this.targetClassAttribute = res.data;
          this.attrGroup = [];
          let enTypeSysAttr = this.targetClassAttribute.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          let enTypeDefAttr = this.targetClassAttribute.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
          this.attrGroup.push(enTypeSysAttr, enTypeDefAttr);

          this.AddEntity({
            className: this.targetClassName,
            attr: res.data
          })
          // // 获取关联类信息
          var res = await getRelationNameB(this.targetClassName);
          if (res.data && res.data.data) res = res.data.data;
          else res = [];
          for (var i = 0; i < res.length; i++) {
            var basic = await getRelation(res[i].className);
            basic = basic.data;
            for (var j in basic) {
              if (j != "id" && j != "attributes") res[i][j] = basic[j];
            }
            this.AddRelation({
              className: res[i].className,
              basic: res[i],
              attr: basic.attributes
            })
            this.checkRelation(res[i]);
          }
          var res = await getRelationNameF(this.targetClassName);
          if (res.data && res.data.data) res = res.data.data;
          else res = [];
          for (var i = 0; i < res.length; i++) {
            var basic = await getRelation(res[i].className);
            basic = basic.data;
            for (var j in basic) {
              if (j != "id" && j != "attributes") res[i][j] = basic[j];
            }
            this.AddRelation({
              className: res[i].className,
              basic: res[i],
              attr: basic.attributes
            })
            this.checkRelation(res[i]);
          }
        }
      } catch (e) {
        // this.$Message.error(e);
        this.spinShow = false;
        return
      }
      if (this.route && this.route.meta) {
        this.activeClass = this.route.meta.deviceType || 'actPc';
      }
      let acs = ['actPc', 'actIpad', 'actIpadH', 'actPhone', 'actPhoneH'];
      let index = acs.indexOf(this.activeClass);
      this.activeIndex = -1;
      if (this.targetFormType == 'Mobile') index = 3
      this.actItem(index);
    },

    cancel() {
      this.createModal = false;
      this.chosenViews = [];
      // this.router.replace({ name: "form-management" });
      return;
    },

    handleRelatedClass() {
    },

    onDragStart(event, elementType) {
      // event.dataTransfer.setData("fixDrag", null);
      event.stopPropagation();
      // this.$refs.form.addCount();
      // let name = event.currentTarget.getAttribute("addinName");
      // let args = null;
      // if (name.split('_')[0] == 'SuperControl') {
      //   args = this.superControl[name.replace('SuperControl_', '')];
      //   name = 'SelfCode';
      // } else {
      //   delete this.basicArgs['id'];
      //   delete this.basicArgs['txt_bgColor'];
      // }
      // this.$refs.form.setDragArgs(args);
      this.$refs.form.setDragItem(elementType);
    },

    onDragEnd(event) {
      event.stopPropagation();
      this.$refs.form.setDragItem(null);
      this.$refs.form.setDragArgs(null);
    },

    onDbClick(item) {
      this.$refs.form.doubleClickInsertJsonData(item);
      //   event.stopPropagation();
      //   var target = event.currentTarget;
      //   var name = target.getAttribute("addinName");
      //   while (!name) {
      //     target = target.parentNode;
      //     name = target.getAttribute("addinName");
      //   }
      //   let args = null;
      //   if (name.split('_')[0] == 'SuperControl') {
      //     args = this.superControl[name.replace('SuperControl_', '')];
      //     name = 'SelfCode';
      //   }
      //   this.$refs.form.setDragArgs(args);
      //   this.$refs.form.onDbClick(name);

    },

    displayTypeChange(type) {
      if (this.formDisplayType === 'JSON') {
        this.showCode = true;
        this.jsonCode = this.$refs.form.getJsonCode();
        if (this.deviceClass=='middle-iphone-h') {
          this.codeClass = 'code-iphone-h';
        }
        else if (this.deviceClass=='middle-iphone') {
          this.codeClass = 'code-iphone';

        }
        else if (this.deviceClass=='middle-ipad') {
          this.codeClass = 'code-ipad';
        }
        else if (this.deviceClass=='middle-ipad-h') {
          this.codeClass = 'code-ipad-h';
        }
        else {
          this.codeClass = 'code';
        }
      } else {
        this.showCode = false;
      }
    },

    snapShotChange(snapShotCount, snapShotLength) {
      this.snapShotCount = snapShotCount;
      this.snapShotLength = snapShotLength;
    },

    //TODO
    action(menuItem) {
      if (menuItem == "1") {
        this.undoing = true;
        this.undoing = this.$refs.form.undo();
      } else if (menuItem == "2") {
        this.redoing = true;
        this.redoing = this.$refs.form.redo();
      } else if (menuItem == "3") {
        this.$refs.form.colorFill();
      } else if (menuItem == "4") {
        this.showCode = true;
        this.jsonCode = this.$refs.form.getJsonCode();
      } else if (menuItem == "5") {
        this.showCode = false;
      } else if (menuItem == "6") {
        this.border = !this.border;
        document.querySelectorAll(".addin").forEach(x => {
          if (this.border) {
            if (x.classList.contains("noBorder")) {
              x.classList.remove("noBorder");
            }
          } else {
            if (!x.classList.contains("noBorder")) {
              x.classList.add("noBorder");
            }
          }
        });
      } else if (menuItem == "7") {
        this.$refs.form.delete();
      } else if (menuItem == "8") {
        this.quickCreateModal = true;
      } else if (menuItem == "9") {
        this.configModal = true;
      }
    },

    addinBackgroundColorChange(color) {
      this.$refs.form.colorFill(color);
    },
    //控件选择区拖拽开始
    onDragEnter(event) {
      this.$refs.form.removeGhostBox();
    },

    // 刷新多对象控件列表
    freshMultiAddins() {
      this.multiAddins = this.getMultiAddins(this.$refs.form.getJsonData().data);
    },

    getMultiAddins(node) {
      var res = [];
      if (node.obj && node.obj.getSelected) {
        res.push({
          obj: node.obj,
          label: node.self.properties.id,
          value: node.self.properties.id
        });
      }
      if (node.elements) {
        for (var i = 0; i < node.elements.length; i++) {
          res = res.concat(this.getMultiAddins(node.elements[i]));
        }
      }
      return res;
    },

  },

};
</script>

<style>
.avatarImg {
    width: 60px;
    height: 60px;
    display: inline-block;
    margin-right: 15px;
    vertical-align: baseline;
}
.ivu-select-dropdown.ivu-transfer-no-max-height {
  width: 256px !important;
}
.self-collapse .ivu-collapse-content > .ivu-collapse-content-box {
  padding: 0;
}

.ivu-btn-icon-only.ivu-btn-small {
  padding: 0 !important;
}

.headTool-form-container.container-scroll {
  width: 135% !important;
}

.ivu-btn-small > span {
  font-size: 12px !important;
}

@media screen and (min-width: 1531px) {
  .headTool-form-container {
    /*width: 130%;*/
  }

  .screen-headTool-submit-full {
    display: inline-block;
  }

  .screen-headTool-submit-narrow {
    display: none;
  }
}

@media screen and (max-width: 1530px) {
  .minMenu {
    padding: 0 5px !important;
  }

  .headTool-form-container {
    /*width: 130%;*/
  }

  .screen-headTool-submit-full {
    display: inline-block;
  }

  .screen-headTool-submit-narrow {
    display: none;
  }
}

@media screen and (max-width: 1400px) {
  .minMenu {
    padding: 0 6px !important;
  }

  .headTool-form-container {
    width: 100%;
  }

  .screen-headTool-submit-full {
    display: none;
  }

  .screen-headTool-submit-narrow {
    display: inline-block;
  }

  .screen-headTool-submit-narrow.headTool-submit {
    margin-right: 0px !important;
  }
}

@media screen and (max-width: 1100px) {
  .minMenu {
    padding: 0 3px !important;
  }

  .headTool-form-container {

  }

  .screen-headTool-submit-full {
    display: none;
  }

  .screen-headTool-submit-narrow {
    display: inline-block;
  }
}

.addin.actPc {
  padding: 5px !important;
}

.addin {
  /*border: 1px dashed #000;*/
  background: #F7FBFF;
  padding: 0px !important;
  position: relative;
}

.addin.selected {
  border: 0px solid #2D8CF0;
  background: #ABD1F9;
}

.addin:hover {
  background: #DDECFC;
}

.addin.selected:hover {
  background: #ABD1F9;
}

.addin.addin-layout {
  background: #F7FFFD;
}

.addin.addin-layout.selected {
  border: 1px solid #1AB395 !important;
  background: #A3E1D5;
}

.addin.addin-layout:hover {
  background: #E2F4EF;
}

.addin.addin-layout.selected:hover {
  background: #A3E1D5;
}

.noBorder {
  border: none;
}

.noPadding .ivu-collapse-content {
  padding: 0 0 0 0 !important;
}

.minMenu .ivu-select-dropdown {
  top: 0px !important;
}

.headTool-li .ivu-color-picker .ivu-select-dropdown {
  top: 0px !important;
}
.headTool-li .ivu-select-dropdown {
  top: 0px !important;
}

.editBox .ivu-color-picker .ivu-select-dropdown {
  left: 0px !important;
}

.editBox .bindOperationBar .ivu-select-dropdown {
  width: 100%;
}

.createModal .ivu-select-dropdown {
  width: 100%;
}

.form-addin-icon {
  float: left;
  line-height: 30px;
  margin: -1px 6px;
}

.form-addin-name {
  float: left;
  line-height: 30px;
  font-size: 12px;
  width: initial !important;
}

.form-addin-name.ivu-tooltip .ivu-tooltip-rel {
  font-size: 12px;
}

.headTool-l li .noBorder.ivu-btn {
  padding: 0px;
}

.addin-pools .ivu-collapse-item .ivu-collapse-header {
  height: 30px;
  line-height: 30px;
}

.form-targetClass-name span {
  font-size: 12px;
}

.form-view-name span {
  font-size: 12px;
}

.form-targetClass-name .ivu-breadcrumb-item-separator {
  margin: 0 2px;
}

.margin1 .ivu-btn > span {
  font-size: 12px;
}

.margin1.ivu-btn > span {
  font-size: 12px;
}

.margin1 textarea.ivu-input {
  font-size: 12px !important;
}

.headTool-opr.headTool-l li {
  width: 50px !important;
}

.headTool-opr.headTool-l li .ivu-btn > .ivu-icon + span, .headTool-opr.headTool-l li .ivu-btn > span + .ivu-icon {
  margin-left: 0px;
}

.basicConfig .ivu-form-item {
  margin-bottom: 0px;
}

.headTool-form-wrapper::-webkit-scrollbar {
  width: 0;
  color: transparent;
  height: 8px;
}

.headTool-form-wrapper::-webkit-scrollbar-track {
  background-color: transparent;
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}

.headTool-form-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, .3);
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}

.addin.ivu-col-offset-24 {
  margin-left: 100% !important;
}

.addin.ivu-col-offset-23 {
  margin-left: 95.83333333% !important;
}

.addin.ivu-col-offset-22 {
  margin-left: 91.66666667% !important;
}

.addin.ivu-col-offset-21 {
  margin-left: 87.5% !important;
}

.addin.ivu-col-offset-20 {
  margin-left: 83.33333333% !important;
}

.addin.ivu-col-offset-19 {
  margin-left: 79.16666667% !important;
}

.addin.ivu-col-offset-18 {
  margin-left: 75% !important;
}

.addin.ivu-col-offset-17 {
  margin-left: 70.83333333% !important;
}

.addin.ivu-col-offset-16 {
  margin-left: 66.66666667% !important;
}

.addin.ivu-col-offset-15 {
  margin-left: 62.5% !important;
}

.addin.ivu-col-offset-14 {
  margin-left: 58.33333333% !important;
}

.addin.ivu-col-offset-13 {
  margin-left: 54.16666667% !important;
}

.addin.ivu-col-offset-12 {
  margin-left: 50% !important;
}

.addin.ivu-col-offset-11 {
  margin-left: 45.83333333% !important;
}

.addin.ivu-col-offset-10 {
  margin-left: 41.66666667% !important;
}

.addin.ivu-col-offset-9 {
  margin-left: 37.5% !important;
}

.addin.ivu-col-offset-8 {
  margin-left: 33.33333333% !important;
}

.addin.ivu-col-offset-7 {
  margin-left: 29.16666667% !important;
}

.addin.ivu-col-offset-6 {
  margin-left: 25% !important;
}

.addin.ivu-col-offset-5 {
  margin-left: 20.83333333% !important;
}

.addin.ivu-col-offset-4 {
  margin-left: 16.66666667% !important;
}

.addin.ivu-col-offset-3 {
  margin-left: 12.5% !important;
}

.addin.ivu-col-offset-2 {
  margin-left: 8.33333333% !important;
}

.addin.ivu-col-offset-1 {
  margin-left: 4.16666667% !important;
}

.dragArea {
  width: 100%;
  min-height: 30px;
  height: 100%;
}

.ivu-checkbox-default {
  font-size: 12px !important;
}

.ivu-tooltip-inner-with-width {
  word-break: break-all;
}
.ComGroup .ivu-select-dropdown {
  width: 100%;
}
#basicConfigModal .ivu-form-item-error-tip {
  position: relative;
}
#basicConfigModal .limitSel {
  position: relative;
}

.labelWidthUnit .ivu-select-selection {
  background: inherit;
  border-radius: 0px 4px 4px 0;
}

.labelWidthUnit .ivu-select-selection {
  border-left: none;
}

.labelWidthUnit .ivu-select-selection:hover {
  border-color: #dcdee2;
}
.labelWidthUnit .ivu-select-selection.ivu-select-selection-focused {
  border-color: #dcdee2;
  box-shadow: none;
}
.labelWidthUnit.ivu-select-visible .ivu-select-selection {
  border-color: #dcdee2;
  box-shadow: none;
}
</style>

<style scoped>
.top-tool {
  position: relative;
  width: 100%;
  z-index: 50;
  background: #fff;
}

.deviceBtn-wrap {
  width: 300px;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
  cursor: pointer;
}
.deviceBtn {
  height: 30px;
  line-height: 30px;
  text-align: center;
  color: #666;
  background: #eee;
}
.device-wrap {
  float: left;
}
.device-wrap li {
  display: inline-block;
}

.device-wrap li div {
  width: 17px;
  height: 16px;
  margin-right: 15px;
  margin-top: 14px;
  background-image: url("../../assets/images/dev-spr.png");
  background-repeat: no-repeat;
}

.device-wrap li div:hover {
  cursor: pointer;
}

.device-wrap li:nth-child(1) div {
  margin-left: 10px;
  background-position: 0 0;
}

.device-wrap li:nth-child(2) div {
  background-position: -24px 0;
}

.device-wrap li:nth-child(3) div {
  background-position: -49px 0;
}

.device-wrap li:nth-child(4) div {
  background-position: -71px 0;
}

.device-wrap li:nth-child(5) div {
  background-position: -94px 0;
}

.actIcon.actPc {
  background-position: 0 -16px !important;
}

.actIcon.actIpad {
  background-position: -24px -16px !important;
}

.actIcon.actIpadH {
  background-position: -49px -16px !important;
}

.actIcon.actPhone {
  background-position: -71px -16px !important;
}

.actIcon.actPhoneH {
  background-position: -94px -16px !important;
}

.ivu-menu-dark {
  background: #fff;
}

.index-layout-nav li {
  color: #495060 !important;
}

.ivu-layout-header {
  height: 50px;
  background: #fff;
  padding: 0 0px;
  line-height: 50px;
}

@media screen and (max-width: 1400px) {
  .ivu-layout-header {
    padding: 0;
  }

}


.ivu-layout-sider {
  background: #fff !important;
}

.headTool-l li {
  height: 50px;
  width: 55px;
  list-style: none;
  float: left;
  /* margin-right: 15px; */
}

.screen-headTool-submit-narrow li.headTool-li {
  width: inherit;
}

.headTool-wrapper {
  position: relative;
  z-index: 51;
  border-bottom: 1px solid #cccccc;
  overflow: initial !important;
}

li.headTool-divider-wrapper {
  width: 1px;
  margin: 0 15px;
  float: left;
}

.headTool-divider {
  height: 3em;
  float: left;
  margin: 5px 5px;
}

.headTool-opr {
  display: inline-block;
}

.headTool-submit {
  float: right;
  margin-right: 20px;
}

.headTool-form-margin {
  float: left;
}

.headTool-form-margin li {
  list-style: none;
}

.headTool-form-margin-input {
  width: 50px;
}

.headTool-label-addin-proportion {
  float: left;
}

.headTool-label-style {
  float: left;
}

.headTool-addin-style {
  float: left;
}

.headTool-ul {
  float: left;
  text-align: center;
}

.headTool-li {
  float: left;
  list-style: none;
  margin-right: 5px;
}

.headTool-li .ivu-radio-group-button.ivu-radio-group-small .ivu-radio-wrapper {
  padding: 0 6px;
}

.headTool-li span {
  font-size: 12px;
}

.headTool-form-wrapper {
  /*text-align: center;*/
  height: 57px;
  width: 100%;
  overflow: auto;
  position: relative;
  z-index: 50;
  background: #fff;
}

.headTool-form {
  height: 50px;
  line-height: 50px;
  display: inline-block;
}

.addin-pool {
  background: #F4F6FC;
  border: 1px dotted #F4F6FC;
  cursor: move;
  float: left;
  height: 30px;
  line-height: 30px;
  width: 45.83333333%;
  margin: 2.5px 0 2.5px 6px;
}

.addin-pool:hover {
  color: #2D8CF0;
  border: 1px dotted #2D8CF0;
}

#qrccode-canvas {
  width: 110px !important;
  height: 110px !important;
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

.mr15 {
  margin-right: 15px;
}

.middle {
  /* box-shadow: 0 1px 6px rgba(0, 0, 0, 0.117647),
    0 1px 4px rgba(0, 0, 0, 0.117647); */
  /*min-height: 800px;*/
  position: relative;
  z-index: 0;
  /* padding: 20px 20px 20px 20px; */
}

.middle-full {
  width: 100%;
  height: auto;
  /*min-height: 800px;*/
  padding: 0;
  background: none;
}

.middle-ipad {
  height: 1171px;
  margin: 0 auto;
  padding: 96px 49px 115px;
  width: 885px;
  background: url("../../assets/images/bgipad.png") no-repeat 0 0;
  transition: all 0.5s ease 0s;
}

.middle-ipad-h {
  height: 784px;
  margin: 0 auto;
  padding: 41px 115px 41px 75px;
  width: 1211px;
  background: url("../../assets/images/bgipadh.png") no-repeat 0 0;
  transition: all 0.5s ease 0s;
}

.middle-iphone {
  width: 398px;
  height: 782px;
  margin: 0 auto;
  padding: 35px 13px 180px 10px;
  background: url("../../assets/images/bigPhoneV.png") no-repeat 0 0;
  transition: all 0.5s ease 0s;
}

.middle-iphone-h {
  width: 687px;
  height: 385px;
  margin: 0 auto;
  padding: 38px 10px 437px 10px;
  background: url("../../assets/images/bigPhoneH.png") no-repeat 0 0;
  transition: all 0.5s ease 0s;
}

.code {
  height: 1000px;
  margin: 20px 20px 100px 20px;
}

.code-iphone-h {
  height: 318px;
}
.code-iphone {
  height: 612px;
}
.code-ipad {
  height: 667px;
}
.code-ipad-h {
  height: 630px;
}

.edit_layer {
  display: none;
  opacity: 0.5;
  background: #eee;
  border: 1px dashed #999;
  pointer-events: none;
  z-index: 10000;
  position: fixed;
}

.rightClickMenu {
  display: none;
  z-index: 10001;
  position: fixed;
}

.index-layout-logo {
  width: 100px;
  height: 30px;
  background: #5b6270;
  border-radius: 3px;
  float: left;
  position: relative;
  top: 15px;
  left: 20px;
}

.index-layout-nav {
  margin: 0 auto;
}

.index-layout-content {
  min-height: 200px;
  overflow: hidden;
  background: #fff;
  display: flex;
}

.action_bar {
  position: sticky;
  line-height: 3.5;
  top: 0;
  height: 50px;
  float: left;
}

.index-soul-control-class-fade-enter,
.soul-control-class-fade-leave-active {
  opacity: 0;
}

.selectItem:hover {
  background-color: #2e91e438;
  color: #5555c1;
}

.selectItem.selected {
  background-color: #56585a38;
}

.form-container {
  display: flex;
  width: 100%;
}

.form-container-both {
  width: calc(100% - 485px) !important;
}

.form-container-without-sidebar {
  width: calc(100% - 270px) !important;
}

.form-container-without-editbox {
  width: calc(100% - 215px) !important;
}

.form-container-without-both {
  width: 100%;
}

.quickCheck {
  width: 30%;
  margin: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ivu-modal-no-mask {

  pointer-events: auto;

}

.attrDict .ivu-select-dropdown {
  width: 100%;
}
.template-border {
  border: 2px solid #2d8cf0;
  border-radius: 8px;
}
.template-margin{
  margin: 0 15px;
}
</style>
