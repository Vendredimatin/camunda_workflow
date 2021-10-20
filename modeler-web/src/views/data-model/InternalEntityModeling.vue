<template>
  <div>
    <!-- 属性提示侧边滑窗 -->
    <!-- <Drawer ref="drawer" v-model="idTreeVis" title="脚本辅助信息" class-name="ivu-select-dropdown-width100" width="400" :mask="false" :scrollable="true" :transfer="false">

        <Tabs value="name2">
          <TabPane label="属性集" name="name2">
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
                  <Select v-model="chooseTargetClass" filterable clearable @on-change="targetClassChange">
                    <OptionGroup label="实体类">
                        <Option v-for="item in entitiesList" :value="item.value" :key="item.value" :label="item.label">
                        <span>{{ item.label }}</span>
                        <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                        </Option>
                    </OptionGroup>
                    <OptionGroup label="外部实体类">
                        <Option v-for="item in externalEntitiesList" :value="item.value" :key="item.value" :label="item.label">
                        <span>{{ item.label }}</span>
                        <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                        </Option>
                    </OptionGroup>
                    <OptionGroup label="关联类">
                        <Option v-for="item in relationsList" :value="item.value" :key="item.value" :label="item.label">
                        <span>{{ item.label }}</span>
                        <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                  wa      </Option>
                    </OptionGroup>
                  </Select>
                </Col>
              </Row>

              <div>
                <RadioGroup v-model="chooseTargetAttr" style="width: 100%">
                  <Collapse v-if="rePanel" simple v-model="toolAttr">
                    <Panel v-for="group in groupAttrList" :key="group.groupName">
                        {{group.groupName}}
                        <div slot="content">
                          <Radio
                            v-for="item in group.attrList"
                            :key="item.id"
                            :label="`${group.groupType}${item.attributeName}`"
                            style="width: 30%; margin: 5px; white-space: nowrap; text-overflow: ellipsis;overflow: hidden;"
                            >{{ item.displayName }}
                          </Radio>
                        </div>
                    </Panel>
                  </Collapse>
                </RadioGroup>
              </div>
            </div>
          </TabPane>
      </Tabs>
    </Drawer>
    <Spin size="large" fix v-if="spinShow"></Spin> -->

    <div style="float: left; margin: 10px 10px 0">
      <Button type="primary" style="margin: 5px" @click="showAddRowModal" id="createEntityButton">
        新增实体类
      </Button>
      <Modal
        v-model="addRowModal"
        title="新增实体类"
        :z-index="999"
        class-name="vertical-center-modal"
        :mask-closable="false"
        id="createEntityModal"
      >
        <Form ref="addRowForm" :model="addRowData" :rules="rowValidate" :label-width="120">
          <FormItem label="英文名" prop="className">
            <Input v-model="addRowData.className" placeholder="输入英文名" id="createEntityModalClassName" ></Input>
          </FormItem>
          <FormItem label="显示名" prop="displayName">
            <Input v-model="addRowData.displayName" placeholder="输入显示名" id="createEntityModalDisplayName"></Input>
          </FormItem>
          <FormItem label="数据库表前缀" prop="zoneName">
            <Input v-model="addRowData.zoneName" placeholder="输入数据库表前缀" id="createEntityModalZoneName"></Input>
          </FormItem>
          <FormItem label="是否树" prop="isTree">
            <i-switch v-model="addRowData.isTree" />
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="addRowModal = false">取消</Button>
          <Button type="primary" size="large" :loading="addRowModalLoading" @click="addRow" id="confirmCreateEntityButton">确认</Button>
        </div>
      </Modal>
      <Button type="error" style="margin: 5px" :disabled="currentData.id === undefined" @click="onClickDeleteButton" id="deleteEntityButton">
        删除实体类
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="onClickEditButton" id="editEntityButton">
        编辑实体类
      </Button>
      <Modal
        v-model="editRowModal"
        title="编辑实体类"
        width="70%"
        class-name="vertical-center-modal ivu-select-dropdown-width100"
        :mask-closable="false"
        id="editEntityModal"
      >

        <!-- 属性提示侧边滑窗 -->
        <Drawer ref="drawer" v-model="idTreeVis" id="idTreeVis" title="脚本辅助信息" class-name="ivu-select-dropdown-width100" width="400" :mask="false" :scrollable="true" style="zIndex: 9999">

            <Tabs value="name2">
              <TabPane label="属性集" name="name2">
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
                      <Select v-model="chooseTargetClass" class="drawSelect" filterable clearable @on-change="targetClassChange">
                        <OptionGroup label="实体类">
                            <Option v-for="item in entitiesList" :value="item.value" :key="item.value" :label="item.label">
                            <span>{{ item.label }}</span>
                            <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                            </Option>
                        </OptionGroup>
                        <OptionGroup label="外部实体类">
                            <Option v-for="item in externalEntitiesList" :value="item.value" :key="item.value" :label="item.label">
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
                    <RadioGroup v-model="chooseTargetAttr" style="width: 100%">
                      <Collapse v-if="rePanel" simple v-model="toolAttr">
                        <Panel v-for="group in groupAttrList" :key="group.groupName">
                            {{group.groupName}}
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
        <Spin size="large" fix v-if="spinShow"></Spin>

        <Form style="margin-left: 5px; margin-right: 5px;" ref="editRowForm" :model="editRowData" :rules="rowValidateEdit" inline :label-width="120">
          <FormItem label="英文名" prop="className" style="width: 23%;" id="editEntityModalClassName">
            <Input v-model="editRowData.className" disabled></Input>
          </FormItem>
          <FormItem label="显示名" prop="displayName" style="width: 23%;">
            <Input v-model="editRowData.displayName" placeholder="输入显示名" id="editEntityModalDisplayName"></Input>
          </FormItem>
          <FormItem label="数据库表前缀" prop="zoneName" style="width: 23%;">
            <Input v-model="editRowData.zoneName" disabled id="editEntityModalZoneName"></Input>
          </FormItem>
          <FormItem label="是否树" prop="isTree" style="width: 23%;">
            <i-switch v-model="editRowData.isTree" :disabled="hadTree"/>
          </FormItem>
        </Form>
        <Tabs v-model="modalTab"
              :animated="false" style="overflow: visible">
          <TabPane label="属性" name="attributes">
            <div v-show="!addAttribute && !editAttribute">
              <div style="float: left; margin-bottom: 5px;">
                <Button type="primary" style="margin: 5px" @click="addAttrModal" id="editEntityModalCreateAttrButton">
                  新增属性绑定
                </Button>
                <Button type="primary" style="margin: 5px" @click="editAttr" :disabled="currentAttribute.attributeName === undefined" id="editEntityModalEditAttrButton">
                  编辑属性绑定
                </Button>
                <Button type="error" style="margin: 5px" @click="untieAttribute" :disabled="currentAttribute.attributeName === undefined" id="editEntityModalDeleteAttrButton">
                  删除属性绑定
                </Button>
              </div>
              <div style="float: right; margin-bottom: 5px;">
                <Input
                  v-model="attributeKeyword"
                  icon="md-search"
                  placeholder="输入关键词查询"
                  style="width: 200px; margin: 5px"
                  @on-change="searchAttributeKeyword"
                >
                </Input>
              </div>
              <div style="clear: both; margin: 5px;">
                <Table v-if="beautyFlag" height="275"
                       id="editEntityModalAttrTable"
                       :loading="attributesLoading"
                       stripe
                       border
                       show-header
                       highlight-row
                       size="small"
                       :data="filteredAttributes"
                       :columns="attributeColumns"
                       @on-row-click="selectAttributeRow"
                >
                </Table>
              </div>
            </div>
            <div v-show="addAttribute" style="padding-top: 10px">
              <Form ref="addAttributeForm" :model="addAttributeData" :rules="attributeValidate" :label-width="80" inline>
                <Row>
                  <Col span="12">
                    <FormItem label="属性名称" prop="attributeName"  style="width: 100%">
                      <Input
                        v-model="addAttributeData.attributeName"
                        placeholder="输入/从右侧选择属性名"
                        @on-blur="addAttrBlur('addAttributeData')"
                        id="addEntityAttributeName"
                      >
                        <Select
                          class="drawSelect"
                          slot="append"
                          style="width: 200px;position: relative;"
                          v-model="candidateAttributeName"
                          placeholder="选择属性名"
                          clearable
                          filterable
                          @on-change="checkAttributeExist"
                          @on-clear="handleClearAttribute"
                          id="addEntityAttributeNameSelect"
                        >
                          <Option v-for="(item, index) in allAttributes" :value="item.attributeName" :key="index" :label="item.attributeName">
                            {{ item.attributeName || item.displayName }}
                          </Option>
                        </Select>
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="12" style="padding-left: 2%">
                    <FormItem label="显示名称" prop="displayName"  style="width: 100%">
                      <Input v-model="addAttributeData.displayName" placeholder="输入属性显示名" id="addEntityDisplayName"></Input>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span="12">
                    <FormItem label="数据类型" prop="valueType" style="width: 100%">
                      <Select :disabled="isSysType" v-model="addAttributeData.valueType" placeholder="选择数据类型" @on-change="getValueLength" transfer id="addEntityValueType">
                        <Option v-for="(value, key) in allValueTypes" :value="key" :key="key" :label="key">
                          <span>{{ key }}</span>
                          <span style="float:right; color:#ccc">{{ value }}</span>
                        </Option>
                      </Select>
                    </FormItem>
                  </Col>

                  <Col span="9" style="padding-left: 2%">
                    <FormItem label="数据长度" prop="valueLength"  style="width: 100%">
                      <!-- <InputNumber v-if="noTime" style="width: 100px;" v-model="addAttributeData.valueLength" :disabled="(addAttributeData.valueType !== 'String' && addAttributeData.valueType !== 'Clob') || (addAttributeData.valueType == 'String' && limitLength)" :min="0" :max="65535" id="createAttrModalValueLength"></InputNumber> -->
                      <InputNumber :disabled="(addAttributeData.valueType !== 'String' && addAttributeData.valueType !== 'Clob') || (addAttributeData.valueType == 'String' && limitLength) || isSysType" v-if="noTime" style="width: 100%;" v-model="addAttributeData.valueLength"  :min="0" :max="65535" id="createAttrModalValueLength"></InputNumber>
                      <Select v-else v-model="addAttributeData.valueLength" filterable :disabled="isSysType">
                        <Option :value="0" >秒</Option>
                        <Option :value="3">毫秒</Option>
                        <Option :value="6">微秒</Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span="3" v-show="addAttributeData.valueType === 'String'" style="padding: 8px 0 0 0;text-align: right;">
                  <!-- <div style="padding-right: 30%"> -->
                    <span style="margin-right: 10px;font-size: 12px !important;">不限长度</span>
                    <i-switch size="small" v-model="limitLength" @on-change="changeLimit" :disabled="isSysType"/>
                  <!-- </div> -->
                  </Col>
                </Row>
                 <Row>
                  <Col span="12">
                    <FormItem label="默认控件" prop="defaultComponent" style="width: 100%">
                      <Select v-model="addAttributeData.defaultComponent" :disabled="isSysType" clearable filterable>
                        <Option v-for="(value, key) in singleControl" :value="value.name" :key="key" :label="value.note">
                          <span>{{ value.note }}</span>
                          <span style="float:right; color:#ccc">{{ value.name }}</span>
                        </Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span="12" style="padding-left: 2%">
                    <FormItem label="数据字典" prop="attrDict" style="width: 100%">
                      <Select v-model="addAttributeData.attrDict" clearable filterable class="attrDict" :disabled="isSysType || dictDisabled">
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
                      <Select v-model="addAttributeData.queryBoxDisplayType" clearable filterable transfer :disabled="isSysType">
                        <Option v-for="(value, key) in attrItems" :value="value.value" :key="key" :label="value.label">
                          <span>{{ value.label}}</span>
                          <span style="float:right; color:#ccc">{{ value.value }}</span>
                        </Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span="12" style="padding-left: 2%">
                    <FormItem label="排序" prop="order" style="width: 100%">
                      <InputNumber  v-model="addAttributeData.order" :min="0" :max="65535" style="width: 100%" :disabled="isSysType"></InputNumber>
                    </FormItem>
                  </Col>
                  </Row>
                <!-- <FormItem label="长度" prop="valueLength" style="width: 45%">
                  <InputNumber v-model="addAttributeData.valueLength" :disabled="this.attributeExist || (addAttributeData.valueType !== 'String' && addAttributeData.valueType !== 'Clob')" id="addEntityValueLength"></InputNumber>
                </FormItem> -->
                <Row>
                  <Col span="12">
                    <FormItem label="默认值" prop="defaultValue" style="width: 100%">
                      <Input v-model="addAttributeData.defaultValue" placeholder="输入默认值" id="addEntityDefaultValue" :disabled="isSysType"></Input>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span="24" style="padding-left: 80px">
                    <FormItem label="允许空值" prop="nullable" label-position="left" :label-width="70">
                      <Checkbox v-model="addAttributeData.nullable" :disabled="isSysType"></Checkbox>
                    </FormItem>
                    <FormItem label="查询属性" prop="isInQueryBox" label-position="left" :label-width="70">
                      <Checkbox v-model="addAttributeData.isInQueryBox" :disabled="isSysType"></Checkbox>
                    </FormItem>
                    <FormItem label="表格显示" prop="isInTable" label-position="left" :label-width="70">
                      <Checkbox v-model="addAttributeData.isInTable" :disabled="isSysType"></Checkbox>
                    </FormItem>
                    <FormItem label="表单显示" prop="isInForm" label-position="left" :label-width="70">
                      <Checkbox v-model="addAttributeData.isInForm" :disabled="isSysType"></Checkbox>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
              <div style="text-align: center">
                <Button type="text" style="margin: 5px" @click="addAttribute = false">取消</Button>
                <Button
                        id="editEntityModalConfirmAttrButton"
                  :type="attributeExist ? 'primary' : 'success'"
                  style="margin: 5px"
                  @click="bindAttribute"
                  :loading="addAttributeLoading"
                >
                  {{ attributeExist ? "绑定现有属性" : "新建并绑定属性" }}
                </Button>
              </div>
            </div>
            <div v-show="editAttribute" style="padding-top: 10px">
              <Form ref="editAttributeForm" :model="currentAttribute" :rules="editAttributeValidate" :label-width="80" inline>
                <Row>
                  <Col span="12">
                    <FormItem label="属性名称" prop="attributeName"  style="width: 100%">
                      <Input
                        v-model="currentAttribute.attributeName"
                        disabled
                        id="editEntityAttributeName"
                      >
                      </Input>
                    </FormItem>
                  </Col>
                  <Col span="12" style="padding-left: 2%">
                    <FormItem label="显示名称" prop="displayName"  style="width: 100%">
                      <Input v-model="currentAttribute.displayName" placeholder="输入属性显示名" id="editEntityDisplayName"></Input>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span="12">
                    <FormItem label="数据类型" prop="valueType" style="width: 100%">
                      <Select v-model="currentAttribute.valueType" disabled id="editEntityValueType" filterable>
                        <Option v-for="(value, key) in allValueTypes" :value="key" :key="key" :label="key">
                          <span>{{ key }}</span>
                          <span style="float:right; color:#ccc">{{ value }}</span>
                        </Option>
                      </Select>
                    </FormItem>
                  </Col>

                  <Col span="9" style="padding-left: 2%">
                    <FormItem label="数据长度" prop="valueLength"  style="width: 100%">
                      <InputNumber v-if="noTime" style="width: 100%;" v-model="currentAttribute.valueLength" disabled id="editEntityValueLength"></InputNumber>
                      <Select v-else v-model="currentAttribute.valueLength" disabled>
                        <Option :value="0" >秒</Option>
                        <Option :value="3">毫秒</Option>
                        <Option :value="6">微秒</Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <!-- <Col span="3" offset="1" v-show="addAttributeData.valueType === 'String'" style="padding-top: 8px;">
                    <span style="margin-right: 10px;font-size: 12px !important;">不限长度</span>
                    <i-switch size="small" v-model="limitLength" :disabled="this.attributeExist" @on-change="changeLimit"/>
                  </Col> -->
                </Row>
                 <Row>
                  <Col span="12">
                    <FormItem label="默认控件" prop="defaultComponent" style="width: 100%">
                      <Select v-model="currentAttribute.defaultComponent" :disabled="isSysType" clearable filterable>
                        <Option v-for="(value, key) in singleControl" :value="value.name" :key="key" :label="value.note">
                          <span>{{ value.note }}</span>
                          <span style="float:right; color:#ccc">{{ value.name }}</span>
                        </Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span="12" style="padding-left: 2%">
                    <FormItem label="数据字典" prop="attrDict" style="width: 100%">
                      <Select v-model="currentAttribute.attrDict" class="attrDict" :disabled="isSysType || dictDisabled" clearable filterable>
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
                      <Select v-model="currentAttribute.queryBoxDisplayType" clearable filterable transfer :disabled="isSysType">
                        <Option v-for="(value, key) in attrItems" :value="value.value" :key="key" :label="value.label">
                          <span>{{ value.label}}</span>
                          <span style="float:right; color:#ccc">{{ value.value }}</span>
                        </Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span="12" style="padding-left: 2%">
                    <FormItem label="排序" prop="order" style="width: 100%">
                      <InputNumber v-model="currentAttribute.order" :min="0" :max="65535" style="width: 100%" :disabled="isSysType"></InputNumber>
                    </FormItem>
                  </Col>
                  </Row>
                <!-- <FormItem label="长度" prop="valueLength" style="width: 45%">
                  <InputNumber v-model="addAttributeData.valueLength" :disabled="this.attributeExist || (addAttributeData.valueType !== 'String' && addAttributeData.valueType !== 'Clob')" id="addEntityValueLength"></InputNumber>
                </FormItem> -->
                <Row>
                  <Col span="12">
                    <FormItem label="默认值" prop="defaultValue" style="width: 100%">
                      <Input v-model="currentAttribute.defaultValue" placeholder="输入默认值" id="addEntityDefaultValue" :disabled="isSysType"></Input>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span="24" style="padding-left: 80px;">
                    <FormItem label="允许空值" prop="nullable" label-position="left" :label-width="70">
                      <Checkbox v-model="currentAttribute.nullable" :disabled="isSysType"  id="editEntityNullable"></Checkbox>
                    </FormItem>
                    <FormItem label="查询属性" prop="isInQueryBox" label-position="left" :label-width="70">
                      <Checkbox v-model="currentAttribute.isInQueryBox" :disabled="isSysType"></Checkbox>
                    </FormItem>
                    <FormItem label="表格显示" prop="isInTable" label-position="left" :label-width="70">
                      <Checkbox v-model="currentAttribute.isInTable" :disabled="isSysType"></Checkbox>
                    </FormItem>
                    <FormItem label="表单显示" prop="isInForm" label-position="left" :label-width="70">
                      <Checkbox v-model="currentAttribute.isInForm" :disabled="isSysType"></Checkbox>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
              <div style="text-align: center">
                <Button type="text" style="margin: 5px" @click="cancelEditAttr">取消</Button>
                <Button
                  type="primary"
                  style="margin: 5px"
                  @click="confirmEditAttribute"
                  :loading="editAttributeLoading"
                >
                  确认属性更改
                </Button>
              </div>
            </div>
          </TabPane>
          <TabPane label="事件" name="events">
            <div style="text-align: center">
              <RadioGroup v-model="currentEventDisplayName" type="button" style="margin: 5px;" @on-change="onChangeEvent">
                <Radio label="创建前">
                  <Icon
                    type="ios-radio-button-on"
                    color="red"
                    v-if="editRowData.scripts !== undefined && editRowData.scripts['BeforeCreate'] !== undefined && editRowData.scripts['BeforeCreate'].trim() !== ''">
                  </Icon>
                  <span>创建前</span>
                </Radio>
                <Radio label="创建后">
                  <Icon
                    type="ios-radio-button-on"
                    color="red"
                    v-if="editRowData.scripts !== undefined && editRowData.scripts['AfterCreate'] !== undefined && editRowData.scripts['AfterCreate'].trim() !== ''">
                  </Icon>
                  <span>创建后</span>
                </Radio>
                <Radio label="更新前">
                  <Icon
                    type="ios-radio-button-on"
                    color="red"
                    v-if="editRowData.scripts !== undefined && editRowData.scripts['BeforeUpdate'] !== undefined && editRowData.scripts['BeforeUpdate'].trim() !== ''">
                  </Icon>
                  <span>更新前</span>
                </Radio>
                <Radio label="更新后">
                  <Icon
                    type="ios-radio-button-on"
                    color="red"
                    v-if="editRowData.scripts !== undefined && editRowData.scripts['AfterUpdate'] !== undefined && editRowData.scripts['AfterUpdate'].trim() !== ''">
                  </Icon>
                  <span>更新后</span>
                </Radio>
                <Radio label="删除前">
                  <Icon
                    type="ios-radio-button-on"
                    color="red"
                    v-if="editRowData.scripts !== undefined && editRowData.scripts['BeforeDelete'] !== undefined && editRowData.scripts['BeforeDelete'].trim() !== ''">
                  </Icon>
                  <span>删除前</span>
                </Radio>
                <Radio label="删除后">
                  <Icon
                    type="ios-radio-button-on"
                    color="red"
                    v-if="editRowData.scripts !== undefined && editRowData.scripts['AfterDelete'] !== undefined && editRowData.scripts['AfterDelete'].trim() !== ''">
                  </Icon>
                  <span>删除后</span>
                </Radio>
              </RadioGroup>
              <Button type="primary" @click="beautifyCode" style="margin: 5px;" id="beautifyCodeButton">美化格式</Button>
              <Button type="primary" @click="confirmEvent" style="margin: 5px;" id="confirmEventButton">保存当前事件</Button>
            </div>
            <Row>
              <Col span="22">
                 <MonacoEditor
                   v-if="editRowModal"
                  style="margin: 5px;"
                  ref="editor"
                  v-model="scriptContent"
                  @init="editorInit"
                  lang="java"
                  theme="chrome"
                   height="320"
                   width="100%"
                >
                </MonacoEditor>
              </Col>
              <Col span="1" offset="1">
                <Row>
                  <Col span="24">
                    <div style="margin-bottom: 8px">
                      <Button shape="circle" style="margin-right: 10px;" type="default" icon="ios-expand" @click="changeBigSize" id="changeBigSizeButton"></Button>
                    </div>
                    <div style="margin-bottom: 8px">
                      <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                        <Button shape="circle" type="default" icon="md-help" @click="openHelp" id="openHelpButton"></Button>
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip content="类属性集" placement="left" style="width: 100%">
                        <Button shape="circle" type="default" icon="md-list" @click="openIdTree" id="openIdTreeButton"></Button>
                      </Tooltip>
                    </div>
                  </Col>
                  <!-- <Col span="7">

                  </Col>
                  <Col span="8">

                  </Col> -->
                </Row>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="cancel">取消</Button>
          <Button type="primary" size="large" :loading="editRowModalLoading" @click="updateRow" id="confirmEditEntityButton">确认</Button>
        </div>
      </Modal>
        <Button type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="onClickViewObjectsButton" id="viewObjectsButton">
        查看对象
      </Button>
      <Modal
        width="80%"
        v-model="viewObjectsModal"
        title="查看对象"
        :mask-closable="false"
        id="viewEntityModal"
      >
        <div style="clear: both; margin: 10px">
          <Row>
            <Input v-model="filterQuery" type="textarea" style="width: 83%;margin-left: 5px;" placeholder="输入过滤条件" :autosize="true" @on-focus="inputQuery" id="searchObjectInput"></Input>
            <div style="float: right;">
              <Button type="primary" @click="searchObj" style="margin-left: 15px;">查询</Button>
              <Button type="error" @click="deleteObj" :disabled="deleteDisabled" style="margin-left: 15px;">删除</Button>
            </div>
          </Row>
          <Table style="margin: 10px 5px 5px"
                   width="100%"
                   height="450"
                   ref="objectsTable"
                   :loading="objectsDataloading"
                   stripe
                   border
                   show-header
                   highlight-row
                   size="small"
                   :data="objectsData"
                   :columns="objectsDataColumns"
          >
          </Table>
        </div>
        <div style="margin: 10px; overflow: hidden">
          <div style="float: right; margin: 5px">
            <Page
              style="margin-bottom: 20px"
              size="small"
              show-sizer
              show-elevator
              show-total
              placement="top"
              :page-size-opts="pageSizeOpts"
              :pageSize="objectsPageSize"
              :total="objectsDataCount"
              :current.sync="objectsCurrentPage"
              @on-change="objectsChangePage"
              @on-page-size-change="objectsChangePageSize"></Page>
          </div>
        </div>
        <div slot="footer">
          <i-button type="primary" size="large" @click="viewObjectsModal = false" id="confirmEntityModalButton">确认</i-button>
        </div>
      </Modal>
      <DataImport style="display:inline-block;" :hasClass="this.tableDataAll.length>0" :targetClass="currentData.className"></DataImport>
      <InternalEntityDataExport style="display:inline-block;" :hasClass="this.tableDataAll.length > 0" :targetClass="currentData.className"></InternalEntityDataExport>
      <CreateEntityClassFromExcel  @globalRefresh="globalRefresh" style="display:inline-block;" ></CreateEntityClassFromExcel>
      <Button type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="createTemplate(false)">生成表单</Button>
    </div>
    <div style="float: right; margin: 10px 10px 0">
      <Input
        v-model="keyword"
        icon="md-search"
        placeholder="输入关键词查询"
        style="width: 200px; margin: 5px"
        @on-change="searchKeyword"
        id="searchEntityInput"
      >
      </Input>
    </div>
    <div id="tableBox" style="clear: both; margin: 10px; ">
      <Table ref="viewTable"
             id="entityTable"
             border
             style="margin: 5px;"
             :loading="loading"
             stripe
             :height="tableHeight"
             highlight-row
             size="small"
             :data="tableDataPage"
             :columns="tableColumns"
             @on-row-click="selectRow"
             @on-row-dblclick="handleDoubleClick"
             @on-sort-change="handleSortChange"
      >
      </Table>
    </div>
    <div style="margin: 10px; overflow: hidden">
      <div style="float: right; margin: 5px">
        <Page
          style="margin-bottom: 20px"
          size="small"
          show-sizer
          show-elevator
          show-total
          placement="top"
          :page-size-opts="pageSizeOpts"
          :pageSize="pageSize"
          :total="filteredTableData.length"
          :current.sync="currentPage"
          @on-change="changePage"
          @on-page-size-change="changePageSize"></Page>
      </div>
    </div>

    <Modal
      v-model="deleteConfirm"
      title="实体类删除"
      id="deleteEntityModal"
    >
      <p>确定要删除这个实体类吗?</p>
      <br>
      <Checkbox v-model="cascade" id="cascadeDeleteEntity">级联删除与此实体类关联的关联类、表单、授权项、流程(<span style="color: orangered">请谨慎选择</span>)</Checkbox>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="deleteConfirm = false">取消</Button>
        <Button type="primary" size="large" :loading="deleteModalLoading" @click="deleteRowOnOk">确认</Button>
      </div>
    </Modal>

    <!-- 最大化编辑器 -->
    <Modal
      v-model="isFullScreen"
      title="脚本编辑"
      :styles="fullStyle"
      :mask-closable="false"
      @on-cancel="cancelScript"
      @on-ok="confirmScript">
      <Row>
        <Col span="22">
          <MonacoEditor v-if="isFullScreen"
                        ref="editorFullScreen"
                        v-model="scriptContent" @init="editorInit" lang="java" theme="chrome" width="100%" height="400"></MonacoEditor>
        </Col>
        <Col span="1" offset="1">
          <Row>
            <Col span="24">
              <!-- <div style="margin-bottom: 8px">
                <Button shape="circle" style="margin-right: 10px;" type="default" icon="ios-expand" @click="changeBigSize"></Button>
              </div> -->
              <div style="margin-bottom: 8px">
                <Tooltip content="脚本在线帮助文档" placement="left" style="width: 100%;">
                  <Button shape="circle" type="default" icon="md-help" @click="openHelp" id="openHelpButtonFullScreen"></Button>
                </Tooltip>
              </div>
              <div>
                <Tooltip content="类属性集" placement="left" style="width: 100%">
                  <Button shape="circle" type="default" icon="md-list" @click="openIdTree" id="openIdTreeButtonFullScreen"></Button>
                </Tooltip>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
    <!-- 最大化编辑器ENDING -->

    <!-- <FilterQueryCommonModal
      :refClass="currentData.className"
      :targetClass="currentData.className"
      ref="filterQuery_modal"
      :store="store"
      @filterQueryTypeChange="setNativeQuery"
      @generatorFilterQuery="getFilterQuery">
    </FilterQueryCommonModal> -->
    <FilterQueryCommonModal
      :refClass="currentData.className"
      :targetClass="currentData.className"
      ref="filterQuery_modal"
      :store="store"
      @generatorFilterQuery="getFilterQuery">
    </FilterQueryCommonModal>

  </div>

</template>
<script>
import {templateHandle} from "@/views/form-engine/template/templateHandle"
import {tableMixin} from "@/component/tableMixin"
import { mapGetters, mapActions } from "vuex";
import EntityModeling from "../../api/data-model/EntityModeling";
import AttributesLib from "../../api/data-model/AttributesLib";
import ScriptUtils from "../../api/data-model/ScriptUtils";
import ResourceModeling from "../../api/data-model/ResourceModeling";
import { getEobj, getEntityObjCount, getAllEntities, getAllRelations, objectsSeleteByCondition } from "../../api/others";
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js';
import FilterQueryCommonModal from '@/ext_components/form/subcomponent/FilterQueryCommonModal'
import DataImport from "./components/DataImport.vue";
import InternalEntityDataExport from "./components/InternalEntityDataExport.vue";
import CreateEntityClassFromExcel from "./components/CreateEntityClassFromExcel.vue"
import {clone} from "@/util/assist";
import _ from "lodash";
import MonacoEditor from "@/views/functional-model/components/MonacoEditor";
import {dataMixin} from '@/component/dataMixin.js'
import {entries as form_entries} from "@/ext_components/form/config.js";
const isEmpty = str => {
  return str === undefined || str === null || str.trim() === '';
};

export default {
  name: "internal-entity-modeling",
  mixins: [tableMixin, dataMixin, templateHandle],
  props: ["store"],
  data() {
    const validateLength = (rule, value, callback) => {
      if(value === undefined) {

        if(this.addRowData.valueType == 'String') {
          this.addAttributeData.valueLength = 50;
        }

      }

      if (value === null) {
          callback(new Error('长度不能为空'));
      } else {
          callback();
      }
    };
    return {
      tableDataAll: [],
      tableDataAllUnsorted: [],
      queryAttrList: [],
      loading: true,
      noTime: true,
      showTreeFlag: false,
      hadTree: false,
      currentPage: 1,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      keyword: "",
      modalTab: "attributes",
      limitLength: false,
      chooseAddAttr: false,

      chooseTargetClass: '',
      chooseTargetAttr: '',
      groupAttrList: [],
      idTreeVis: false,
      spinShow: false,
      isFullScreen: false,            // 脚本编辑器全屏
      entitiesList: [],              // 实体类列表
      externalEntitiesList: [],      // 外部实体类列表
      relationsList: [],             // 关联类列表
      rePanel: false,
      toolAttr: ['1','3','5'],

      columnsWidth: 319,
      beautyFlag: true,

      tableColumns :[
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        }, {
        title: "英文名",
        key: "className",
        sortable: "custom",
        tooltip: true
      }, {
        title: "显示名",
        key: "displayName",
        sortable: "custom",
        tooltip: true
      }, {
        title: "数据库表前缀",
        key: "zoneName",
        sortable: "custom",
        tooltip: true
      }
      ],

      currentData: {
        id: undefined,
        className: undefined,
        displayName: undefined,
        classType: undefined,
        classCategory: undefined,
        parentClass: undefined,
        isSystem: false,
        state: 0,
        attributes: [],
        zoneName: undefined
      },
      editRowData: {},
      addRowModal: false,
      addRowModalLoading: false,
      addRowData: {
        className: "",
        displayName: "",
        zoneName: "CUS",
        isTree: false
      },
      editRowModal: false,
      editRowModalLoading: false,
      rowValidate: {
        className: [
          { required: true, message: "英文名不能为空", trigger: "blur" },
          {
            pattern: /^[A-Za-z][A-Za-z0-9]{0,31}$/,
            message: "英文名只能包含字母和数字，并以字母开头，长度不超过32个字符",
            trigger: "blur"
          }
        ],
        displayName: [
          { required: true, message: "显示名不能为空", trigger: "blur" },
          {
            // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
            // message: "显示名只能包含汉字、字母、数字或下划线",
            pattern: /^\S{1,32}$/,
            message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ],
        zoneName: [
          { required: true, message: "数据库表前缀不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z]{1,20}$/,
            message: "数据库表前缀只能包含字母,长度不超过20个字符",
            trigger: "blur"
          }
        ]
      },
      rowValidateEdit: {
        displayName: [
          { required: true, message: "显示名不能为空", trigger: "blur" },
          {
            // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
            // message: "显示名只能包含汉字、字母、数字或下划线",
            pattern: /^\S{1,32}$/,
            message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ],
      },

      attributeKeyword: "",
      allAttributes: [],
      allValueTypes: {},
      attributesLoading: false,
      attributeExist: false,
      candidateAttributeName: "",
      addAttribute: false,
      addAttributeLoading: false,
      editAttribute: false,
      editAttributeLoading: false,
      attributes: [], // for computing filteredAttributes
      currentAttribute: {},
      filterQuery: '',
      attributeValidate: {
        attributeName: [
          { required: true, message: "属性名不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9]{1,32}$/,
            message: "属性名只能包含字母、数字，长度不超过32个字符",
            trigger: "blur"
          },
          { pattern: /^[a-zA-Z]/, message: "属性名首字母应为字母", trigger: "blur" }
        ],
        displayName: [
          { required: true, message: "属性显示名不能为空", trigger: "blur" },
          {
            pattern: /^\S{1,32}$/,
            message: "属性显示名只能包含汉字、字母、数字，长度不超过32个字符",
            // trigger: "blur"
          }
        ],
        valueType: [
          { required: true, message: "数据类型不能为空", trigger: "blur" }
        ],
        valueLength: [
          { validator: validateLength, trigger: 'blur' }
        ]
      },
      editAttributeValidate: {
        displayName: [
          { required: true, message: "属性显示名不能为空", trigger: "change" },
          {
            pattern: /^\S{1,32}$/,
            message: "属性显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "change"
          }
        ]
      },
      attributeColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "属性名",
          key: "attributeName",
          minWidth: 128,
          sortable: true,
          render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.attributeName.length > 16 ? params.row.attributeName.slice(0, 16) + "..." : params.row.attributeName,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.attributeName)
              ])
          }
        },
        {
          title: "显示名",
          key: "displayName",
          minWidth: 128,
          sortable: true,
          render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.displayName.length > 16 ? params.row.displayName.slice(0, 16) + "..." : params.row.displayName,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.displayName)
              ])
          }
        },
        {
          title: "数据类型",
          key: "valueType",
          minWidth: 128,
          sortable: true,
          tooltip: true
        },
        {
          title: "长度",
          key: "valueLength",
          minWidth: 128,
          sortable: true,
          tooltip: true
        },
        {
          title: "默认控件",
          key: "defaultComponent",
          minWidth: 128,
          sortable: true,
          render: (h, params) => {
            let defaultComponent = ''
            for(let key in form_entries) {
              if(form_entries[key].name === params.row['defaultComponent']){
                defaultComponent = form_entries[key].note
              }
            }
            return h('span',{},[
              defaultComponent
            ])
          }
        },
        {
          title: "数据字典",
          key: "attrDict",
          minWidth: 128,
          sortable: true,
          render: (h, params) => {
            let attrDict = ''
            for(let key in this.attrDict) {
              if(this.attrDict[key].type === params.row['attrDict']){
                attrDict = this.attrDict[key].desc
              }
            }
            return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 400, transfer: true }
            }, [
              attrDict ? attrDict.length > 16 ? attrDict.slice(0, 16) + "..." : attrDict : '',
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
              attrDict)
            ])
          }
        },
        {
          title: "是否为空",
          key: "nullable",
          minWidth: 128,
          sortable: true
        },
        {
          title: "缺省值",
          key: "defaultValue",
          minWidth: 128,
          sortable: true,
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 1100, transfer: true }
            }, [
                this.maxSlice(params.row['defaultValue']),
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row['defaultValue'])
              ])
          }
        },
        {
          title: "排序",
          key: "order",
          minWidth: 128,
          sortable: true,
          tooltip: true
        }
      ],
      allEvents: [
        {
          displayName: "创建前",
          event: "BeforeCreate"
        },
        {
          displayName: "创建后",
          event: "AfterCreate"
        },
        {
          displayName: "更新前",
          event: "BeforeUpdate"
        },
        {
          displayName: "更新后",
          event: "AfterUpdate"
        },
        {
          displayName: "删除前",
          event: "BeforeDelete"
        },
        {
          displayName: "删除后",
          event: "AfterDelete"
        }
      ],
      currentEventDisplayName: "创建前",
      scriptContent: "",

      viewObjectsModal: false,
      objectsDataloading: false,
      objectsData: [],
      objectsDataCount: 0,
      objectsDataColumns: [],
      objectsCurrentPage: 1,
      objectsPageSize: 10,

      deleteConfirm: false,
      cascade : false,
      sortParams: undefined,
      deleteModalLoading: false,
    };
  },

  computed: {
    ...mapGetters("DWF_form", [
      "EntityAttrList",
      "Relations",
      "RelationAttrList"
    ]),
    fullStyle() {
      return this.idTreeVis ? {'margin-left': '5%', 'width': 'calc(90% - 400px)'} : {'width': '80%'};
    },
    currentEvent() {
      return this.allEvents.filter(item => {
        return item.displayName === this.currentEventDisplayName;
      })[0].event;
    },
    filteredAttributes() {
      let keywordLower = this.attributeKeyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      for (let id in this.attributes) {
        let data = this.attributes[id];
        for (let key in data) {
          if(key == 'attributeName' || key == 'displayName' || key == 'valueType' || key == 'valueLength' || key == 'nullable' || key == 'defaultValue') {
            if (data[key]
                .toString()
                .toLowerCase()
                .match(keywordLower) !== null
            ) {
              res.push(data);
              break;
            }
          }
        }
      }
      return res;
    },
    filteredTableData() {
      let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      for (let id in this.tableDataAll) {
        let data = this.tableDataAll[id];
        for (let key in data) {

          if(key == 'className' || key == 'displayName' || key == 'zoneName') {

            if (
              data[key]
                .toString()
                .toLowerCase()
                .match(keywordLower) !== null
            ) {
              res.push(data);
              break;
            }

          }

        }
      }
      return res;
    },
    tableDataPage() {
      return this.filteredTableData.slice(
        this.currentPage * this.pageSize - this.pageSize,
        this.currentPage * this.pageSize
      );
    },
    deleteDisabled(){
      return this.filterQuery && this.filterQuery.substring(0, 12) === 'nativequery:'
    }
  },
  components: {
    DataImport,
    InternalEntityDataExport,
    CreateEntityClassFromExcel,
    FilterQueryCommonModal,
    MonacoEditor
  },
  created() {
    this.resetColumnsWidth();
    this.$store = this.store;
    this.initData();

  },
  mounted() {

    // Customize gutter cell tooltip
    // let editorSession = this.$refs["editor"].editor.getSession();
    // editorSession.on("changeAnnotation", () => {
    //   let annotations = editorSession.getAnnotations();
    //   let gutterCells = document.getElementsByClassName("ace_gutter-cell");
    //   Array.prototype.forEach.call(gutterCells, function(el) {
    //     el.removeAttribute("title");
    //   });
    //   annotations.forEach((item, index) => {
    //     let oldTitle = gutterCells[item.row].getAttribute("title");
    //     gutterCells[item.row].setAttribute(
    //       "title",
    //       (oldTitle === null ? "" : oldTitle) +
    //         `${item.type.toUpperCase()} ${
    //           isNaN(item.row) ? "" : item.row + 1 + "行"
    //         } ${isNaN(item.column) ? "" : item.column + 1 + "列"}: ${
    //           item.text
    //         }\n`
    //     );
    //   });
    // });
  },
  methods: {
    ...mapActions("DWF_form", ["queryEntity","queryRelation"]),
    activate() {
      this.resetColumnsWidth();
    },
    initData() {

      this.getAllRows();
      AttributesLib.getAllAttributes().then(res => {
        this.allAttributes = res.data;
      });
      AttributesLib.getAllValueTypes().then(res => {
        this.allValueTypes = res.data;
      });

      this.initClassData();
    },
    initClassData(){

      let promiseE = new Promise((resolve, reject) => {
        this.entitiesList = [];
        this.externalEntitiesList = [];
        getAllEntities()
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
                if(val.classCategory == 'ItemClass') {
                  this.entitiesList.push(eachItem);
                } else {
                  this.externalEntitiesList.push(eachItem);
                }

              });
            }
          })
          .catch(e => {
            console.log(e);
            reject(e);
          });
      })

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
    },
    globalRefresh() {
      this.currentPage = 1;
      this.initData();
    },
    resetColumnsWidth() {

      console.log('resetColumnsWidth');
      let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
      let finalWidth = parseInt(sideWidth) + 250;
      this.columnsWidth = (document.body.clientWidth - finalWidth) / 3;

      this.tableColumns = [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        }, {
        title: "英文名",
        key: "className",
        sortable: "custom",
        minWidth: this.columnsWidth,
        render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.className.length > 32 ? params.row.className.slice(0, 32) + "..." : params.row.className,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.className)
            ])
        }
      }, {
        title: "显示名",
        key: "displayName",
        minWidth: this.columnsWidth,
        sortable: "custom",
        render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.displayName.length > 32 ? params.row.displayName.slice(0, 32) + "..." : params.row.displayName,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.displayName)
            ])
        }
      }, {
        title: "数据库表前缀",
        key: "zoneName",
        minWidth: this.columnsWidth,
        sortable: "custom",
        tooltip: true
      }]

    },
    changeLimit(value) {

      if(value) {
        this.addAttributeData.valueLength = 0;
      } else {
        this.addAttributeData.valueLength = 50;
      }
      this.$refs.addAttributeForm.validateField('valueLength');

    },
    addAttrModal() {
      //重置数据
      this.addAttributeData = this.defaultAddAttributes
      this.candidateAttributeName = "";
      this.attributeExist = false;
      AttributesLib.getAllAttributes().then(res => {
        this.allAttributes = res.data;
      });
      this.limitLength = false;

      this.addAttribute = true;
      this.noTime = true;
      this.$refs["addAttributeForm"].resetFields();
    },
    inputQuery() {
      let option = {
        allowNative: true
      }
      if (this.currentData.className) {
        this.$refs.filterQuery_modal.initModal(this.filterQuery, this.currentData.className, option, true, 'en');
      } else {
        this.$refs.filterQuery_modal.initModal(this.filterQuery, '', option, true, 'en');
      }
    },
    getFilterQuery(finallyFilterQuery) {
      this.filterQuery = finallyFilterQuery;
    },

    editAttr() {

      if(['Date', 'TimeStamp', 'Time'].includes(this.currentAttribute.valueType)) {
        this.noTime = false;
      } else {
        this.noTime = true;
      }
      this.editAttribute = true;

    },

    // 设置原生查询默认值
    // setNativeQuery(type, query) {


    //   let str = 'nativequery: SELECT ';
    //   this.queryAttrList.forEach(s => {
    //     str = str + `plt_${s.attributeName} as "${s.attributeName}",`;
    //   })
    //   str = str.substr(0, str.length - 1) + ` FROM plt_${this.currentData.zoneName}_${this.currentData.className} as ${this.currentData.className} WHERE 1=1`;
    //   if(type == 'native' && query == '') {
    //     // this.$refs.filterQuery_modal.setFilterQuery('nativeQuery:select plt_oid as oid,plt_createtime as createtime [,...] frome plt_part where 1=1');
    //     this.$refs.filterQuery_modal.setFilterQuery(str);
    //   }

    // },

    searchObj() {
      this.refreshObjects(this.filterQuery, true);
    },

    /**
    *@descriptionhttp://166.111.7.145:10080/zentao/bug-view-6399.html
    *@params
    *@date 2020/12/23
    *@return
    */
    deleteObj(){
      this.objectsDataloading = true;
      let _this = this;
      this.$Modal.confirm({
        title: "删除对象",
        content: `是否删除数据，删除后无法恢复!`,
        onOk: () => {
          objectsSeleteByCondition(_this.currentData.className, {condition: _this.filterQuery ? _this.filterQuery : ''})
          .then(res => {
            if(res.data.success){
              this.objectsData = [];
              this.$Message.success('删除成功');
              this.refreshObjects(this.filterQuery, true);
              _this.objectsDataloading = false;
            }else{
              this.$Message.error({
                content: `${JSON.stringify(res.data.message).replace(/\\n/g, "<br>").replace(/^\"{1}/g, "").replace(/\"{1}$/g, "")}`,
                duration: 0,
                closable: true
              });
              this.refreshObjects(this.filterQuery, true);
              _this.objectsDataloading = false;
            }
          })
          .catch(e => {
            this.$Message.error({
              content: `${e}`,
              duration: 0,
              closable: true
            });
            _this.objectsDataloading = false;
          });
        },
        onCancel: () => {
          _this.objectsDataloading = false;
          return;
        }
      });
    },

    getAllRows() {
      this.currentData = {
        id: undefined,
        className: undefined,
        displayName: undefined,
        classType: undefined,
        classCategory: undefined,
        parentClass: undefined,
        isSystem: false,
        state: 0,
        attributes: [],
        zoneName: undefined
      };
      this.loading = true;
      EntityModeling.getInternalEntities()
        .then(res => {
          this.loading = false;
          this.tableDataAll = res.data.filter(item => !item.isSystem);
          this.tableDataAllUnsorted = clone(this.tableDataAll);
          this.handleSortChange(this.sortParams);
        })
        .catch(error => {
          this.loading = false;
          this.$Message.error(error.response.data.message);
        });
    },

    // 跳转到脚本说明文档
    openHelp() {
      window.open(`http://ise.thss.tsinghua.edu.cn/confluence/pages/viewpage.action?pageId=22511673`);
    },

    // 切换到最大化编辑窗口
    changeBigSize() {
      this.scriptContentCatch = this.scriptContent;
      this.isFullScreen = true;

    },

    // 最大化脚本编辑确认
    confirmScript() {
      this.isFullScreen = false;
      this.$nextTick(() => {
        this.$refs.editor.setValue(this.scriptContent);
      })
    },

    cancelScript(){
      this.scriptContent = this.scriptContentCatch;
    },

    changePage(pageId) {
      this.currentData = {
        id: undefined,
        className: undefined,
        displayName: undefined,
        classType: undefined,
        classCategory: undefined,
        parentClass: undefined,
        isSystem: false,
        state: 0,
        attributes: [],
        zoneName: undefined
      };
      this.currentPage = pageId;
    },
    changePageSize(pageSize) {
      this.currentData = {
        id: undefined,
        className: undefined,
        displayName: undefined,
        classType: undefined,
        classCategory: undefined,
        parentClass: undefined,
        isSystem: false,
        state: 0,
        attributes: [],
        zoneName: undefined
      };
      this.pageSize = pageSize;
    },
    objectsChangePage(pageId) {
      this.objectsCurrentPage = pageId;
      this.refreshObjects(this.filterQuery);
    },
    objectsChangePageSize(pageSize) {
      this.objectsPageSize = pageSize;
      this.refreshObjects(this.filterQuery);
    },
    maxSlice(v) {
      if (v !== null && v !== '' && v != undefined) {
        if(v === false || v === true) v = v + '';
        return v.length > 32 ? v.slice(0, 32) + "..." : v
      }
    },
    onClickViewObjectsButton() {
      this.viewObjectsModal = true;
      this.filterQuery = '';
      this.objectsData = [];
      this.objectsCurrentPage = 1;
      this.objectsDataColumns = [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        }
      ];
      EntityModeling.getAttributes(this.currentData.className).then(res => {

        this.queryAttrList = res.data;

        res.data.forEach(item => {

          this.objectsDataColumns.push({
            title: item.attributeName,
            key: item.attributeName,
            minWidth: Math.max((item.attributeName.length + 2) * 15, 150),
            render: (h, params) => {
              return h('Tooltip', {
                props: { placement: 'bottom', maxWidth: 1100, transfer: true }
              }, [
                  this.maxSlice(params.row[item.attributeName]),
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                    params.row[item.attributeName])
                ])
            }
          });
          // this.objectsDataColumns.push({
          //   title: item.attributeName,
          //   key: item.attributeName,
          //   tooltip: true,
          //   minWidth: Math.max((item.attributeName.length + 2) * 15, 150)
          // });
        });
        this.refreshObjects();
      });
    },
    refreshObjects(str, resetFlag) {
      this.objectsDataloading = true;
      this.objectsData = [];
      getEntityObjCount(this.currentData.className, {condition: str ? str : ''})
        .then(res => {
          if(!res.data.success){
            this.$Message.error(res.data.message);
            this.objectsDataloading = false;
            this.objectsDataCount = 0;
            this.objectsCurrentPage = 1;
            return;
          }
          this.objectsDataCount = res.data.data;
          if(resetFlag) {
            this.objectsCurrentPage = 1;
          }
          getEobj(this.currentData.className, {
            condition: str ? str : '',
            startIndex:
              this.objectsCurrentPage * this.objectsPageSize -
              this.objectsPageSize,
            pageSize: this.objectsPageSize
          })
            .then(res => {
              if(!res.data.success){
                this.$Message.error(res.data.message);
                this.objectsDataloading = false;
                return;
              }
              this.objectsData = res.data.data;
              let len = this.objectsData.length;
              // for (let i = 0; i < len; ++i) {
              //   let obj = this.objectsData[i];
              //   Object.keys(obj).forEach(function(key){
              //     let date;
              //     if (obj[key].toString().length === 13 && (date = new Date(obj[key])) !== undefined && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
              //       var y = date.getFullYear(),
              //           m = date.getMonth() + 1,
              //           d = date.getDate();
              //       // obj[key] = (new Date(date.getTime() - date.getTimezoneOffset() * 60000)).toISOString();
              //       obj[key] = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + date.toTimeString().substr(0, 8);
              //     }
              //   });
              // }
              this.objectsDataloading = false;
            })
            .catch(e => {
              this.objectsDataloading = false;
            });
        })
        .catch(e => {
          this.objectsDataloading = false;
        });
    },
    searchKeyword() {
      this.currentData = {};
      this.changePage(1);
      this.handleSortChange(this.sortParams);
    },
    selectRow(rowData) {
      this.currentData = rowData;
    },
    addRow() {
      this.$refs["addRowForm"].validate(valid => {
        if (valid) {
          this.addRowModalLoading = true;
          let mergedData = [
            {
              classType: "PersistentClass",
              classCategory: "ItemClass",
              parentClass: "IdItem",
              isSystem: false,
              state: 0,
              attributes: [],
              className: this.addRowData.className,
              displayName: this.addRowData.displayName,
              zoneName: this.addRowData.zoneName
            }
          ];
          EntityModeling.createEntities(mergedData, this.addRowData.isTree)
            .then(res => {
              this.currentPage = 1;
              this.getAllRows();
              this.addRowModalLoading = false;
              this.addRowModal = false;
              this.$refs["addRowForm"].resetFields();
              this.$Message.success("新增实体类成功");
            })
            .catch(error => {
              this.addRowModalLoading = false;
              this.$Message.error(error.response.data.message);
            });
        } else {
          this.addRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
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

      let cName = this.editRowData.className;
      this.chooseTargetClass = cName + '&e';

      this.idTreeVis = true;
      this.targetClassChange(this.chooseTargetClass);
    },
    async targetClassChange(val) {

        this.chooseTargetAttr = '';
        this.groupAttrList = [];
        this.rePanel = false;

        if(val != undefined && val != '') {
        //  fix bug 6659
        // this.spinShow = true;

        let curClass = val.split('&')[0];

        if(val.split('&')[1] == 'e') {

          await this.queryEntity(curClass);
          let enTypeAttr = this.EntityAttrList(curClass);

          let groupItem = {
            groupName: curClass,
            groupType: '',
            attrList: enTypeAttr
          };
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

          // 外部实体类不显示空的系统属性
          if(groupSysItem.attrList.length > 0) {
            this.groupAttrList.push(groupSysItem)
          }
          this.groupAttrList.push(groupDefItem);
          //  fix bug 6659
          // this.spinShow = false;
          this.rePanel = true;

        } else {

          await this.queryRelation(curClass);
          let reTypeAttr = this.RelationAttrList(curClass);

          let reClass = this.Relations(curClass);
          if('leftClass' in reClass) {
            await this.queryEntity(reClass.leftClass);
          }
          if('rightClass' in reClass) {
            await this.queryEntity(reClass.rightClass);
          }

          let reTypeLAttr = this.EntityAttrList(reClass.leftClass);
          let reTypeRAttr = this.EntityAttrList(reClass.rightClass);

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
          this.spinShow = false;
          this.rePanel = true;
        }
      }

    },
    onClickDeleteButton() {
      this.cascade = false;
      this.deleteConfirm = true;
    },
    deleteRowOnOk(){
      this.deleteModalLoading = true;
      let className = this.currentData.className;
      let backwardCount = 0;
      let forwardCount = 0;
      let promises = [];
      if (!this.cascade) {
        promises.push(EntityModeling.getBackwardRelations(className).then(res => {
          backwardCount = res.data.length;
        }));
        promises.push(EntityModeling.getForwardRelations(className).then(res => {
          forwardCount = res.data.length;
        }));
      }
      Promise.all(promises).then(res => {
        if (backwardCount > 0 || forwardCount > 0) {
          this.$Message.error(`实体类${className}的（被）关联类数量不为零，无法删除：关联数 ${backwardCount} 被关联数 ${forwardCount}`);
          this.deleteModalLoading = false;
          this.deleteConfirm = false;
        } else {
          let promises = [];
          if (this.cascade) {
            promises.push(EntityModeling.deleteProcess(className));
          }
          promises.push(EntityModeling.deleteEntity(className, this.cascade));
          Promise.all(promises)
            .then(res => {
              this.getAllRows();
              if (
                this.tableDataAll.length - 1 ===
                this.pageSize * (this.currentPage - 1) &&
                this.tableDataAll.length !== 1
              )
                this.changePage(this.currentPage - 1);
              this.deleteModalLoading = false;
              this.deleteConfirm = false;
              this.$Message.success("删除实体类成功");
            })
            .catch(error => {
              this.deleteModalLoading = false;
              this.deleteConfirm = false;
            });
        }
      });
    },
    handleDoubleClick(rowData, index) {
      this.selectRow(rowData);
      this.onClickEditButton();
    },
    handleSortChange(params) {
      this.sortParams = params;
      if (params === undefined) return;
      if (params.order === "asc") {
        this.tableDataAll.sort(function(a, b) {
          if (a[params.key] === undefined) return -1;
          if (b[params.key] === undefined) return 1;
          return a[params.key].toString().toLowerCase() > b[params.key].toString().toLowerCase() ? 1 : -1;
        });
      } else if (params.order === "desc") {
        this.tableDataAll.sort(function(a, b) {
          if (a[params.key] === undefined) return 1;
          if (b[params.key] === undefined) return -1;
          return a[params.key].toString().toLowerCase() > b[params.key].toString().toLowerCase() ? -1 : 1;
        });
      } else {
        this.tableDataAll = clone(this.tableDataAllUnsorted);
      }
    },
    getAttributes() {
      this.attributesLoading = true;
      EntityModeling.getAttributes(this.editRowData.className)
        .then(res => {
          this.editRowData.attributes = res.data;
          this.attributes = res.data;
          this.attributesLoading = false;

          if(this.showTreeFlag) {
            this.editRowData.isTree = res.data.some(item => item.attributeName == 'parentOid');
            this.hadTree = this.editRowData.isTree;
            this.showTreeFlag = false;
          }
        })
        .catch(error => {
          this.attributesLoading = false;
          this.$Message.error(error.response.data.message);
        });
    },
    getAllScripts() {
      ScriptUtils.getAllScripts(this.editRowData.className)
        .then(res => {
          this.editRowData.scripts = res.data;
          if(Object.keys(res.data).length == 0) {
            this.scriptContent = '';
          } else if (this.editRowData.scripts[this.currentEvent] !== undefined) {
            this.scriptContent = this.editRowData.scripts[this.currentEvent];
          }
        })
        .catch(error => {
          this.$Message.error(error.response.data.message);
        });
    },
    onChangeEvent(value) {
      this.currentEventDisplayName = value;
      if (this.editRowData.scripts[this.currentEvent] !== undefined) {
        this.scriptContent = this.editRowData.scripts[this.currentEvent];
      } else {
        this.scriptContent = "";
      }
      this.$refs.editor.setValue(this.scriptContent);
    },
    showAddRowModal() {
      this.$refs.addRowForm.resetFields();
      this.addRowModal = true;
    },
    onClickEditButton() {
      this.scriptContent = '';
      this.attributeKeyword = '';
      this.$refs.editRowForm.resetFields();
      this.editRowData = {...this.currentData};
      this.addAttribute = false;
      this.editAttribute = false;
      this.editRowModal = true;
      this.showTreeFlag = true;
      this.getAttributes();
      this.currentEventDisplayName = '创建前';
      this.getAllScripts();
      this.currentAttribute = {};
      this.initClassData();
    },
    updateRow() {
      // 编辑实体类确认按钮
      if(this.addAttribute){
        this.bindAttribute()
        return
      }
      if(this.editAttribute){
        this.confirmEditAttribute()
        return
      }
      if ((this.editRowData.displayName === this.currentData.displayName) && (!this.editRowData.isTree || this.hadTree)) {
        if(this.modalTab == "attributes") {
          this.editRowModal = false;
          return;
        }
      }

      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;

          if(this.modalTab == "events") {
            if (isEmpty(this.scriptContent)) {
              ScriptUtils.deleteScript(
                this.editRowData.className,
                this.currentEvent
              )
                .then(res => {
                  this.getAllScripts();
                })
                .catch(error => {
                  this.$Message.error(error.response.data.message);
                });
            } else {
              ScriptUtils.updateScript(
                this.editRowData.className,
                this.currentEvent,
                this.scriptContent
              )
                .then(res => {
                  this.getAllScripts();
                })
                .catch(error => {
                  this.$Message.error(error.response.data.message);
                });
            }
          }

          if(this.editRowData.isTree && !this.hadTree) {

            EntityModeling.bindAttributes(this.currentData.className, [
              {
                attributeName: 'parentOid',
                displayName: '父对象标识'
              }
            ]).then(res => {
              this.editChangeTreeEn();
            })

          } else {
            this.editChangeTreeEn();
          }

        } else {
          this.editRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },

    editChangeTreeEn() {

      let mergedData = {
        classType: "PersistentClass",
        classCategory: "ItemClass",
        parentClass: "IdItem",
        isSystem: false,
        state: 0,
        attributes: [],
        ...this.editRowData
      };
      delete mergedData.isTree;
      EntityModeling.updateEntity(mergedData).then(res => {
        this.currentPage = 1;
        this.getAllRows();
        this.editRowModalLoading = false;
        this.editRowModal = false;
        this.$Message.success("更新实体类成功");
      })
      .catch(error => {
        this.editRowModalLoading = false;
        this.$Message.error(error.response.data.message);
      });

    },

    searchAttributeKeyword() {
      this.currentAttribute = {};
    },
    selectAttributeRow(rowData) {
      this.$refs.editAttributeForm.resetFields();
      this.currentAttribute = rowData;
    },
    cancelEditAttr() {
      this.$refs.editAttributeForm.resetFields();
      this.editAttribute = false;
    },
    checkAttributeExist(value) {
      
      this.$refs['addAttributeForm'].resetFields();
      // if(value === undefined) {
      //   this.limitLength = false;
      //   this.chooseAddAttr = false;
      //   this.noTime = true;
      // } else {
      //   this.limitLength = true;
      //   this.chooseAddAttr = true;
      // }
      this.attributeExist = this.allAttributes
        .map(item => {
          return item.attributeName;
        })
        .includes(this.candidateAttributeName);
        if (this.attributeExist) {
        this.addAttributeData = _.cloneDeep(this.allAttributes.filter(item => {
          return item.attributeName === this.candidateAttributeName;
        })[0])
        !this.addAttributeData.order ? this.addAttributeData.order = 100 : ''
        if(['Date', 'TimeStamp', 'Time'].includes(this.addAttributeData.valueType)) {
          this.noTime = false;
        } else {
          this.noTime = true;
        }
        if(this.addAttributeData.valueLength === 0){
          this.limitLength = true;
        }else{
          this.limitLength = false;
        }
      }
    },
    handleClearInputAttribute() {
      this.candidateAttributeName = "";
      this.attributeExist = false;

    },
    handleClearAttribute() {
      this.$refs['addAttributeForm'].resetFields();
      this.candidateAttributeName = "";
      this.attributeExist = false;
      this.limitLength = false
      AttributesLib.getAllAttributes().then(res => {
        this.allAttributes = res.data;
      });
      // this.allAttributesCatch = _.cloneDeep(this.allAttributes);
      // this.$nextTick(() => {
      //   this.allAttributes = this.allAttributesCatch
      // })
    },
    getValueLength() {
      this.addAttributeData.defaultComponent = ''
      if (this.addAttributeData.valueType === "Boolean" || this.addAttributeData.valueType === "Json") {
        this.noTime = true;
        this.addAttributeData.valueLength = 0;
      } else if (this.addAttributeData.valueType === "Clob" || this.addAttributeData.valueType === "LocalFile" || this.addAttributeData.valueType === "Timeseries") {
        this.noTime = true;
        this.addAttributeData.valueLength = 1024;
      } else if (this.addAttributeData.valueType === "Date" || this.addAttributeData.valueType === "TimeStamp" || this.addAttributeData.valueType === "Time") {
        this.noTime = false;
        this.addAttributeData.valueLength = 6;
      } else if (this.addAttributeData.valueType === "Double") {
        this.noTime = true;
        this.addAttributeData.valueLength = 15;
      } else if (this.addAttributeData.valueType === "Integer") {
        this.noTime = true;
        this.addAttributeData.valueLength = 9;
      } else if (this.addAttributeData.valueType === "Long") {
        this.noTime = true;
        this.addAttributeData.valueLength = 18;
      } else if (this.addAttributeData.valueType === "String") {
        this.noTime = true;
        this.addAttributeData.valueLength = 50;
        this.limitLength = false
      } else if (this.addAttributeData.valueType === "UUID") {
        this.noTime = true;
        this.addAttributeData.valueLength = 32;
      }
    },
    bindAttribute() {
        this.$refs["addAttributeForm"].validate(valid => {
          if (valid) {
            if (this.addAttributeData.valueType !== "String" && isEmpty(this.addAttributeData.defaultValue)) {
              this.addAttributeData.defaultValue = null;
            }
            // 默认值 用户写入再清空 需重新复制null
            if (this.addAttributeData.defaultValue == "") {
              this.addAttributeData.defaultValue = null;
            }
            if (this.addAttributeData.order == null) {
              this.addAttributeData.order = 100;
            }
            if(this.addAttributeData.valueType == 'Boolean' && (this.addAttributeData.defaultValue != '' && this.addAttributeData.defaultValue != undefined)) {
              let judeDef = parseInt(this.addAttributeData.defaultValue);
              if(judeDef != 0 && judeDef != 1) {
                this.$Message.warning('默认值不合法, 只能为0或1')
                return
              }
            }
            let numberListObj = {'Double': 15, 'Integer': 9, 'Long': 18}
            let currTypeLimit = numberListObj[this.addAttributeData.valueType]
            if(this.addAttributeData.defaultValue && currTypeLimit && this.addAttributeData.defaultValue.length > currTypeLimit) {
              this.$Message.warning(`数值型属性缺省值位数不能超过${currTypeLimit}位`);
              return
            }
            this.addAttributeLoading = true;

            this.addAttrJoggle()

          } else {
            this.addAttributeLoading = false;
            this.$Message.error("请检查输入是否正确");
          }
        });
    },
    addAttrJoggle() {
      let msg = this.attributeExist ? '绑定现有属性成功' : '新建并绑定属性成功'
      EntityModeling.bindCustomAttributes(this.currentData.className, [{
        attributeCategory: "Variable",
        id: "",
        ...this.addAttributeData
      }])
      .then(res => {
        this.getAttributes()
        this.addAttribute = false;
        this.addAttributeLoading = false;
        this.addAttributeData = this.defaultAddAttributes
        this.candidateAttributeName = "";
        this.$Message.success(msg);
      })
      .catch(error => {
        this.addAttributeLoading = false;
      });
    },
    editAttrJoggle() {
      EntityModeling.updateAttribute(this.currentData.className, this.currentAttribute)
        .then(res => {
          this.getAttributes();
          this.editAttribute = false;
          this.editAttributeLoading = false;
          this.currentAttribute = {};
          this.candidateAttributeName = "";
          this.$Message.success("修改属性成功");
        })
        .catch(error => {
          this.editAttributeLoading = false;
        });
    },
    confirmEditAttribute() {
      this.$refs["editAttributeForm"].validate(valid => {
        if (valid) {
          // 默认值 用户写入再清空 需重新复制null
          if (this.currentAttribute.defaultValue == "") {
            this.currentAttribute.defaultValue = null;
          }
          if (this.currentAttribute.order == null) {
            this.currentAttribute.order = 100;
          }
          if (this.currentAttribute.valueType !== "String" && isEmpty(this.currentAttribute.defaultValue)) {
            this.currentAttribute.defaultValue = null;
          }
          if(this.currentAttribute.valueType == 'Boolean' && (this.currentAttribute.defaultValue != '' && this.currentAttribute.defaultValue != undefined)) {
            let judeDef = parseInt(this.currentAttribute.defaultValue);
            if(judeDef != 0 && judeDef != 1) {
              this.$Message.warning('默认值不合法, 只能为0或1')
              return
            }

          }
          let numberListObj = {'Double': 15, 'Integer': 9, 'Long': 18}
          let currTypeLimit = numberListObj[this.currentAttribute.valueType]
          if(this.currentAttribute.defaultValue && currTypeLimit && this.currentAttribute.defaultValue.length > currTypeLimit) {
            this.$Message.warning(`数值型属性缺省值位数不能超过${currTypeLimit}位`);
            return
          }
          this.editAttributeLoading = true;

          this.editAttrJoggle()

        } else {
          this.editAttributeLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    cancel() {
      this.editRowModal = false;
      this.candidateAttributeName = "";
      // this.$refs["addAttributeForm"].resetFields();
    },
    untieAttribute() {
      console.log(this.currentAttribute, this.currentData)
      if (this.currentAttribute.className !== this.currentData.className && this.currentAttribute.attributeName != 'parentOid') {
        this.$Message.error(
          `属性${this.currentAttribute.attributeName}继承自类${
            this.currentAttribute.className
            }，不可解除绑定`
        );
        return;
      }
      EntityModeling.untieAttribute(
        this.currentData.className,
        this.currentAttribute.attributeName
      )
        .then(res => {
          this.getAttributes();
          this.$Message.success("删除属性绑定成功");
          this.currentAttribute.attributeName = undefined;
        })
        .catch(error => {
          this.currentAttribute.attributeName = undefined;
          this.$Message.error(error.response.data.message);
        });
    },
    editorInit() {
      require("brace/ext/language_tools");
      require("brace/mode/javascript");
      require("brace/theme/chrome");
      require("brace/snippets/javascript");
    },
    beautifyCode() {
      // let editorSession = this.$refs["editor"].editor.getSession();
      // let beautify = require("js-beautify").js_beautify;
      // editorSession.setValue(
      //   beautify(editorSession.getValue(), {
      //     indent_size: 4,
      //     end_with_newline: true
      //   })
      // );
      //
      // this.beautyFlag = false;
      // setTimeout(() => {
      //   this.beautyFlag = true;
      // }, 100)

      this.$refs.editor.format();
    },
    confirmEvent() {
      // let hints = this.$refs["editor"].editor.getSession().getAnnotations();
      let content = [];
      let errorList = this.$refs.editor.getError();
      if (errorList.length === 0) {
        content = ["<p>事件未检查出语法问题，是否确认保存当前事件？</p>"];
      } else {
        content = ["<p>事件检查出以下语法问题，是否确认保存当前事件？</p>"];
        errorList.forEach((item, index) => {
          content.push(
            `<p>${item.message.toUpperCase()} ${item.startLineNumber} 行 ${item.startColumn} 列</p>`
          );
        });
      }
      this.$Modal.confirm({
        title: "保存当前事件",
        content: content.join(""),
        onOk: () => {
          if (isEmpty(this.scriptContent)) {
            ScriptUtils.deleteScript(
              this.editRowData.className,
              this.currentEvent
            )
              .then(res => {
                this.getAllScripts();
                this.$Message.success("保存当前事件成功");
              })
              .catch(error => {
                this.$Message.error(error.response.data.message);
              });
          } else {
            ScriptUtils.updateScript(
              this.editRowData.className,
              this.currentEvent,
              this.scriptContent
            )
              .then(res => {
                this.getAllScripts();
                this.$Message.success("保存当前事件成功");
              })
              .catch(error => {
                this.$Message.error(error.response.data.message);
              });
          }
        }
      });
    }
  }
};
</script>
<style lang="less">
.ace_editor {
  border: 1px solid #eee;
}
</style>
<style>
  .drawSelect .ivu-select-dropdown {
    width: 100%;
  }
  .attrDict .ivu-select-dropdown {
    width: 100%;
  }
  #idTreeVis .ivu-tooltip .ivu-tooltip-rel{
    width: 100%;
  }
</style>
