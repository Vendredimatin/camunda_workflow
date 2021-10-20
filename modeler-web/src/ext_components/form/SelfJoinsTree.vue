<template>
    <section v-if="t_preview" :addinName="name" :style="{'width': colWidth, 'height': arg_height}" ref="main">
        <!-- 骨架屏效果展示, 实例化后隐藏 -->
        <div class="skeleton" v-show="!isHasTree" :style="{'height': 'calc(100% - 30px)', 'overflow': 'hidden'}">
            <div style="height: 20px;">
                <span class="square"></span>
                <span class="rectangle"></span>
            </div>
            <div>
                <div class="left-line"></div>
                <div class="right-content">
                    <ul>
                        <li>
                            <span class="gray-line"></span>
                            <span class="square"></span>
                            <span class="rectangle"></span>
                        </li>
                        <li>
                            <span class="gray-line"></span>
                            <span class="square"></span>
                            <span class="rectangle"></span>
                        </li>
                        <li>
                            <span class="gray-line"></span>
                            <span class="square"></span>
                            <span class="rectangle"></span>
                        </li>
                    </ul>

                    <div>
                        <div class="left-line" style="height: 51px; margin-left: 29px;"></div>
                        <div class="right-content">

                            <ul>
                                <li>
                                    <span class="gray-line"></span>
                                    <span class="square"></span>
                                    <span class="rectangle"></span>
                                </li>
                                <li>
                                    <span class="gray-line"></span>
                                    <span class="square"></span>
                                    <span class="rectangle"></span>
                                </li>
                            </ul>

                            <div>
                                <div class="left-line" style="height: 21px; margin-left: 29px;"></div>
                                <div class="right-content">
                                    <ul>
                                        <li>
                                            <span class="gray-line"></span>
                                            <span class="square"></span>
                                            <span class="rectangle"></span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>

                    <ul style="position: relative; top: 10px;">
                        <li>
                            <span class="gray-line"></span>
                            <span class="square"></span>
                            <span class="rectangle"></span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 骨架屏效果展示 -->

        <div v-show="isHasTree" :style="{'position': 'relative', 'width': '100%', 'height': 'calc(100% - 30px)', 'overflow-y': 'auto',  'background': '#fff', 'padding': '10px'}">
            <div v-show="args.showRefresh || args.showSearchInput" style="height: 40px; border-bottom: 1px solid #ddd;">
                <Row>
                    <Col span="21">
                        <Input v-show="args.showSearchInput" v-model="searchKey" icon="ios-search" @on-click="searchEvent"/>
                    </Col>
                    <Col span="1" offset="2">
                        <Icon v-show="args.showRefresh" class="freshBtn" type="ios-refresh"/>
                    </Col>
                </Row>

            </div>
            <Tree ref="myTree" :data="args.treeList" :load-data="loadData" :render="renderWithButton" style="min-height: calc(100% - 30px);"></Tree>
            <Page class="page-wrap"
                v-show="args.pageSwitch"
                :total="treeTotal"
                style="float: right;"
                size="small"
                placement="top"
                :current.sync="treePageIndex"
                @on-change="changeTreePage"
                show-total
                show-sizer
                :page-size-opts="pageSizeOpts"
                :pageSize="args.selfSize"
                @on-page-size-change="changeTreePageSize" />
            <Spin fix v-if="spinShow"></Spin>
        </div>

        <slot name="widget"></slot>
        <span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                     :itemValue="itemValue"
            :attributes="filter_attributes"
            :router="router"
            :route="route"
            :root="root"
            :query_oprs="query_oprs"
            :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <p class="margin1">实体类</p>
                    <Select class="margin1 editbox-targetClass editbox-self-joins-tree" v-model="args.targetClass" filterable clearable @on-change="changeClass">
                        <OptionGroup label="实体类">
                          <Option v-for="item in all_class" :key="item.id" :value="item.className" :label="item.displayName">
                              <span style="font-size: 12px;">{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc;font-size: 12px;">{{ item.className }}</span>
                          </Option>
                        </OptionGroup>
                        <OptionGroup label="外部实体类">
                          <Option v-for="item in allExternalEntities" :key="item.id" :value="item.className" :label="item.displayName">
                              <span style="font-size: 12px;">{{ item.displayName }}</span>
                              <span style="float:right;color:#ccc;font-size: 12px;">{{ item.className }}</span>
                          </Option>
                        </OptionGroup>
                    </Select>
                    <p class="margin1">关联属性</p>
                    <Select ref="labelAttrSelect" class="margin1 editbox-self-joins-tree" v-model="args.relationAttr" filterable clearable>
                        <OptionGroup label="系统属性">
                        <Option v-for="(attr, index) in targetClassAttributes.sysAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                        <OptionGroup label="类属性">
                        <Option v-for="(attr, index) in targetClassAttributes.selfAttr" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                        </OptionGroup>
                    </Select>
                    <!-- <Select class="margin1 editbox-targetClass" v-model="args.targetRelationClass" filterable @on-change="changeRelationClass">
                        <OptionGroup label="右关联类(从左到右)">
                            <Option
                                v-for="item in r_relation"
                                :key="item.id"
                                :value="`${item.className}&r`"
                                :label="item.displayName"
                            >
                                <span style="font-size: 12px;">{{ item.displayName }}</span>
                                <span style="float:right;color:#ccc;font-size: 12px;">{{ item.className }}</span>
                            </Option>
                        </OptionGroup>
                        <OptionGroup label="左关联类(从右到左)">
                            <Option
                                v-for="item in l_relation"
                                :key="item.id"
                                :value="`${item.className}&l`"
                                :label="item.displayName"
                            >
                                <span style="font-size: 12px;">{{ item.displayName }}</span>
                                <span style="float:right;color:#ccc;font-size: 12px;">{{ item.className }}</span>
                            </Option>
                        </OptionGroup>
                    </Select> -->
                    <p class="margin1">根节点标签</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.rootLabel" @on-focus="setLable(1)" />
                    <p class="margin1">子孙节点标签</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.childrenLabel" @on-focus="setLable(2)" />
                    <p class="margin1">根节点为空时标签</p>
                    <Input class="margin1" v-model="args.rootEmptyLabel" />
                    <p class="margin1">子节点为空时标签</p>
                    <Input class="margin1" v-model="args.childrenEmptyLabel" />
                    <p class="margin1">根节点查询条件</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.rootQuery" @on-focus="setLable(3)" />
                    <p class="margin1">子孙节点查询条件</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.childrenQuery" @on-focus="setLable(4)"/>
                    <p class="margin1">根节点图标属性</p>
                    <Select class="margin1 editbox-self-joins-tree" v-model="args.iconName" filterable clearable>
                        <OptionGroup label="类属性">
                            <Option v-for="item in targetClassAttributes.selfAttr" :key="item.id" :value="item.attributeName">{{ item.displayName }} {{ item.attributeName }}</Option>
                        </OptionGroup>
                        <OptionGroup label="系统属性">
                            <Option v-for="item in targetClassAttributes.sysAttr" :key="item.id" :value="item.attributeName">{{ item.displayName }} {{ item.attributeName }}</Option>
                        </OptionGroup>
                    </Select>
                    <p class="margin1">根节点图标属性映射表</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.iconLabel" @on-focus="chooseIcon('parent')" />
                    <p class="margin1">子节点图标属性</p>
                    <Select class="margin1 editbox-self-joins-tree" v-model="args.iconCName" filterable clearable>

                        <OptionGroup label="实体类类属性">
                            <Option v-for="item in targetClassAttributes.selfAttr" :key="item.id" :value="item.attributeName">{{ item.displayName }} {{ item.attributeName }}</Option>
                        </OptionGroup>
                        <OptionGroup label="实体类系统属性">
                            <Option v-for="item in targetClassAttributes.sysAttr" :key="item.id" :value="item.attributeName">{{ item.displayName }} {{ item.attributeName }}</Option>
                        </OptionGroup>

                    </Select>
                    <p class="margin1">子节点图标属性映射表</p>
                    <Input class="margin1" type="textarea" :autosize="true" v-model="args.iconCLabel" @on-focus="chooseIcon('child')" />
                    <p class="margin1">默认加载层数</p>
                    <Input class="margin1" type="number" v-model="args.recursiveLevel" />
                    <!-- <p class="margin1">是否显示子节点个数</p>
                    <Switch class="margin1" v-model="countSwitch" @on-change="needCount" /> -->


                    <div class="margin1" style="padding: 0 8px;margin: 10px 0;">
                        懒加载
                        <i-switch style="float: right" v-model="args.lazySwitch" @on-change="lazySwitchEvent"/>
                    </div>
                    <div class="margin1" style="padding: 0 8px;margin: 10px 0;">
                        搜索框
                        <i-switch style="float: right" v-model="args.showSearchInput" />
                    </div>
                     <!-- <div v-show="!args.lazySwitch" class="margin1" style="padding: 0 20px;margin: 10px 0;">
                        展开全部节点
                        <i-switch style="float: right" v-model="args.expandSwitch" />
                    </div> -->
                    <div class="margin1" style="padding: 0 8px;margin: 10px 0;">
                        开启分页
                        <i-switch style="float: right" v-model="args.pageSwitch" />
                    </div>
                    <!-- <div v-show="args.pageSwitch" class="margin1" style="padding: 0 20px;margin: 10px 0;">
                       <Input type="number" v-model="args.pageSize">
                            <span slot="prepend">每页数量</span>
                        </Input>
                    </div> -->
                    <div class="margin1" style="padding: 0 8px;margin: 10px 0;">
                        刷新按钮
                        <i-switch style="float: right" v-model="args.showRefresh" />
                    </div>

                    <Row class="margin1">
                        <Col span="10">
                            <Button type="primary" @click="updateTree">更新预览</Button>
                        </Col>
                    </Row>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                    <div class="margin1" style="margin: 10px 0 10px 0; font-weight: bold;">
                        <span>根节点操作配置</span>
                        <Button size="small" type="text" icon="md-add" @click="createRootOpr" style="position: relative; top: -2px; float: right;">添加</Button>
                    </div>

                  <!-- 根节点操作配置 -->
                    <div class="margin1">
                        <div v-for="(item, index) in args.rootOperation" :key="index" class="margin1">

                            <Row class="margin1">
                                <Col span="18" style="line-height: 28px;">
                                    <Row v-if="item.tmp" type="flex" align="middle">
                                        <Col span="18">
                                            <Input v-model="item.name" style="font-size: 12px;" />
                                        </Col>
                                        <Col span="6"><span>操作</span></Col>
                                    </Row>
                                    <span v-else style="font-size: 12px;">{{ item.name }}操作</span>
                                </Col>
                                <Col span="6" style="padding-top: 4px;">
                                    <Button v-if="item.tmp" style="margin-left: 5px" size="small" type="primary" icon="md-checkmark" @click="confirmEvent(index)"></Button>
                                    <Button v-else style="margin-left: 5px" size="small" type="primary" icon="md-create" @click="editOpr(item, index, 'root')"></Button>
                                    <Button style="margin-left: 5px" size="small" type="gohst" icon="md-close" @click="cancelEvent(index)"></Button>
                                </Col>
                            </Row>

                            <!-- <BindOperationBar :index="index"
                                              :opr_path="item.opr_path"
                                              :opr_type="item.opr_type"
                                              :opr_name="item.name"
                                              :form_targetclass="itemValue.data.targetClass"
                                              :form_json="itemValue"
                                              :load_query_oprs="query_oprs"
                                              :route="route"
                                              :router="router"
                                              :root="root"
                                              v-on:on-change="handleChangeEventOfOperationBar"
                                              style="width:100%"></BindOperationBar>
                            <hr /> -->
                        </div>

                    </div>
                  <!-- 根节点操作配置ending.... -->

                  <!-- 子节点操作配置 -->
                    <div class="margin1" style="margin: 10px 0 10px 0; font-weight: bold;">
                        <span>子节点操作配置</span>
                        <Button size="small" type="text" icon="md-add" style="position: relative; top: -2px; float: right;" @click="createChildOpr">添加</Button>
                    </div>

                    <div class="margin1">
                        <div v-for="(item, index) in args.childOperation" :key="index" class="margin1">

                             <Row class="margin1">
                                <Col span="18" style="line-height: 28px;">
                                    <Row v-if="item.tmp" type="flex" align="middle">
                                        <Col span="18">
                                            <Input v-model="item.name" style="font-size: 12px;"/>
                                        </Col>
                                        <Col span="6"><span>操作</span></Col>
                                    </Row>
                                    <span v-else style="font-size: 12px;">{{ item.name }}操作</span>
                                </Col>
                                <Col span="6" style="padding-top: 4px;">
                                    <Button v-if="item.tmp" style="margin-left: 5px" size="small" type="primary" icon="md-checkmark" @click="confirmChildEvent(index)"></Button>
                                    <Button v-else style="margin-left: 5px" size="small" type="primary" icon="md-create" @click="editOpr(item, index, 'child')"></Button>
                                    <Button style="margin-left: 5px" size="small" type="gohst" icon="md-close" @click="cancelChildEvent(index)"></Button>
                                </Col>
                            </Row>

                            <!-- <BindOperationBar class="margin1" :index="index"
                                              :opr_path="item.opr_path"
                                              :opr_type="item.opr_type"
                                              :opr_name="item.name"
                                              :form_targetclass="itemValue.data.targetClass"
                                              :form_json="itemValue"
                                              :load_query_oprs="query_oprs"
                                              :route="route"
                                              :router="router"
                                              :root="root"
                                              v-on:on-change="handleChangeChildEventOfOperationBar"
                                              style="width:100%"></BindOperationBar>
                            <hr /> -->
                        </div>

                    </div>
                  <!-- 子节点操作配置ending.... -->
                </div>
            </EditBox>
        </span>

        <!-- 操作设置弹窗 -->
        <Modal
            title="操作设置"
            v-model="setOprModal"
            @on-visible-change="oprVisibleModal"
            :mask-closable="false">
            <Form ref="oprForm" :model="oprForm" :label-width="80">
                <FormItem label="显示" prop="oprShowType">
                    <RadioGroup v-model="oprForm.oprShowType" type="button">
                        <Radio label="文字"></Radio>
                        <Radio label="图标"></Radio>
                        <Radio label="文字图标"></Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="操作" prop="name">
                    <Input v-model="oprForm.name"></Input>
                </FormItem>
                <FormItem label="图标" prop="iconName">
                    <Select v-model="oprForm.iconName" clearable filterable>
                        <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                            <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                            <span style="float:right;color:#ccc">{{ item.label }}</span>
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="事件" v-if="editRootOprInd !== -1">
                    <BindOperationBar v-if="reloadBindBar" :index="editRootOprInd !== -1 ? editRootOprInd : editChildOprInd"
                        :opr_path="oprForm.opr_path"
                        :opr_type="oprForm.opr_type"
                        :opr_name="oprForm.name"
                        :opr_sys_path="oprForm.opr_sys_path"
                        :opr_showMessage="oprForm.opr_showMessage"
                        ref="BindOperationBar"
                        :form_targetclass="itemValue.data.targetClass"
                        :form_json="itemValue"
                        :load_query_oprs="query_oprs"
                        :route="route"
                        :router="router"
                        :root="root"
                        v-on:on-change="handleChangeEventOfOperationBar"
                        style="width:100%">
                    </BindOperationBar>
                </FormItem>
                <FormItem label="事件" v-else>
                    <BindOperationBar v-if="reloadBindBar" class="margin1" :index="editRootOprInd !== -1 ? editRootOprInd : editChildOprInd"
                        :opr_path="oprForm.opr_path"
                        :opr_type="oprForm.opr_type"
                        :opr_name="oprForm.name"
                        :opr_sys_path="oprForm.opr_sys_path"
                        :opr_showMessage="oprForm.opr_showMessage"
                        ref="BindOperationBar"
                        :form_targetclass="itemValue.data.targetClass"
                        :form_json="itemValue"
                        :load_query_oprs="query_oprs"
                        :route="route"
                        :router="router"
                        :root="root"
                        v-on:on-change="handleChangeChildEventOfOperationBar"
                        style="width:100%"></BindOperationBar>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelSetOpr">取消</Button>
                <Button type="primary" @click="confirmSetOpr">确认</Button>
            </div>
        </Modal>

        <!-- 设置节点标签弹窗 -->
        <Modal
            v-model="lableModal"
            width="700"
            title="设置标签"
            >
            <Row class="lableTxt">
                <Col span="4">
                    <span>{{ editLabelSpan }}</span>
                </Col>
                <Col span="18" offset="1">
                    <Input v-model="selfRootLable" type="textarea" :autosize="true" @on-change="mapAttr"/>
                </Col>
            </Row>
            <p class="attrTitle" v-show="!isChildLable">实体类属性:</p>
            <div class="attrBox" v-show="!isChildLable">
                <CheckboxGroup v-model="args.selected_entities_attributes" @on-change="clickAttr">
                    <Collapse simple v-model="selfGroup">
                        <Panel name="1">
                            系统属性
                            <div slot="content">
                                <Checkbox
                                    v-for="item in targetClassAttributes.sysAttr"
                                    :key="item.id"
                                    :label="`obj.${item.attributeName}`"
                                    class="commonLabel"
                                    >{{ item.displayName }}
                                </Checkbox>
                            </div>
                        </Panel>
                        <Panel name="2">
                            类属性
                            <div slot="content">
                                <Checkbox
                                    v-for="item in targetClassAttributes.selfAttr"
                                    :key="item.id"
                                    :label="`obj.${item.attributeName}`"
                                    class="commonLabel"
                                    >{{ item.displayName }}
                                </Checkbox>
                            </div>
                        </Panel>
                    </Collapse>
                </CheckboxGroup>
            </div>
            <p class="attrTitle" v-show="isChildLable">关联实体类属性:</p>
            <div class="attrBox" v-show="isChildLable">
                <CheckboxGroup v-model="args.selected_relation_entities_attributes" @on-change="clickRelationEntitiesAttr">
                    <Collapse simple v-model="selfENGroup">
                        <Panel name="1">
                            关联实体类系统属性
                            <div slot="content">
                                <Checkbox
                                    v-for="item in targetClassAttributes.sysAttr"
                                    :key="item.id"
                                    :label="`obj.${item.attributeName}`"
                                    class="commonLabel"
                                    >{{ item.displayName }}
                                </Checkbox>
                            </div>
                        </Panel>
                        <Panel name="2">
                            关联实体类类属性
                            <div slot="content">
                                <Checkbox
                                    v-for="item in targetClassAttributes.selfAttr"
                                    :key="item.id"
                                    :label="`obj.${item.attributeName}`"
                                    class="commonLabel"
                                    >{{ item.displayName }}
                                </Checkbox>
                            </div>
                        </Panel>
                    </Collapse>
                </CheckboxGroup>
            </div>
            <div slot="footer">
                <Button type="text" @click="lableModal = false">取消</Button>
                <Button type="primary" @click="confirmLable">确认</Button>
            </div>
        </Modal>
        <!-- 设置节点标签弹窗ending -->

        <!-- 设置节点操作弹窗 -->
        <!-- <Modal
            v-model="operationModal"
            width="700"
            title="设置操作"
            >
            <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                根节点
                <CheckboxGroup style="float: right" v-model="args.rootOperation">
                    <Checkbox label="新增"></Checkbox>
                    <Checkbox label="删除"></Checkbox>
                </CheckboxGroup>
            </div>
            <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                子节点
                <CheckboxGroup style="float: right" v-model="args.childrenOperation">
                    <Checkbox label="新增"></Checkbox>
                    <Checkbox label="删除"></Checkbox>
                </CheckboxGroup>
            </div>
            <div slot="footer">
                <Button type="text" @click="lableModal = false">取消</Button>
                <Button type="primary" @click="confirmLable">确认</Button>
            </div>
        </Modal> -->
        <!-- 设置节点操作弹窗ending -->

        <!-- 自定义图标映射关系弹窗组件 -->
        <IconEditModal v-if="needIcon" ref="icon_modal" @transferIcon="getIconLabel"></IconEditModal>

        <!-- 根子节点过滤条件组件  -->
        <FilterQueryCommonModal
            v-if="actEdit" :addinName="name"
            :args="args"
            :itemValue="itemValue"
            :refClass="`${args.targetClass}&e`"
            :targetClass="itemValue.data.targetClass"
            ref="filterQuery_modal"
            :root="root"
            :store="store"
            @generatorFilterQuery="getFilterQuery">
        </FilterQueryCommonModal>

    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6c8;</i>
            </div>
            <div class="form-addin-name">
                目录树
            </div>
        </span>
    </section>
</template>

<script>
import BindOperationBar from "./subcomponent/BindOperationBar.vue"
import { mapGetters, mapActions } from "vuex";
import { getSelfJoinEobj, getAllEntities } from '@/api/others';
import { getAttributeBindClasses } from "@/api/data-model/AttributesLib";
import IconEditModal from './subcomponent/IconCommonPanel'
import FilterQueryCommonModal from './subcomponent/FilterQueryCommonModal'
import EditBox from "./_EditBox.vue"
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js'
import moduleIconData from "@/views/functional-model/components/moduleIcon.js";
import {getAttributes, getExternalEntities} from "@/api/data-model/EntityModeling";

const name = "SelfJoinsTree";

export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" ,
        "itemValue",
        "attributes",
        "store",
        "query_oprs",
        "route",
        "router",
        "root",
        "Message"
    ],
    data() {
        return {

            setOprModal: false,
            reloadBindBar: true,
            oprModalType: '',
            editRootOprInd: -1,
            editChildOprInd: -1,
            oprForm: {
               oprShowType: '文字图标',
               name: '',
               iconName: '',
               opr_path: '',
               opr_type: '',
              opr_showMessage: true,
              opr_sys_path: '',
            },
            iconList: [],

            lableModal: false,
            isChildLable: false,
            isHasTree: false,
            spinShow: false,
            actEdit: false,
            needIcon: false,
            operationModal: false,     //节点操作弹窗
            selfGroup: '2',
            selfENGroup: '2',
            selfREGroup: '2',

            editLabelSpan: '编辑节点标签:',

            targetClassAttributes: {
                sysAttr: [],
                selfAttr: []
            },
            clickData: [],
            treePageIndex: 1,
            treeTotal: 0,
            pageSizeOpts: [10, 25, 50, 100, 200, 500],

            all_class: [],
          allExternalEntities: [],
            // relations: [],
            transRootQuerys: '',
            transRootLabel: '',
            l_relation: [],
            r_relation: [],
            classAttrMap: {},
            relationMap: {},

            selected_attributes: [],
            selfRootLable: '',

            lastAttr: [],
            lastRelationAttr: [],
            lastRelationEntitiesAttr: [],

            lastQueryAttr: [],
            lastQueryRelationAttr: [],
            lastQueryRelationEntitiesAttr: [],

            isRootLable: 0,
            searchKey: '',

	        times: 0,
            name: name,

            t_preview: true,
            t_edit: false,

            args: {
                lazySwitch: true,       // 是否开启懒加载
                pageSwitch: false,      // 是否开启分页
                pageSize: 25,           // 每页数量
                showRefresh: false,     // 是否显示刷新按钮
                rootOperation: [],      // 根节点操作
                childOperation: [],     // 子节点操作
                recursiveLevel: 1,        // 初始化树 默认加载层数
                selfSize: 10,           // 自定义每页条数
                classCategory: '',

                expandSwitch: false,
                title: '目录树',
                width: 100,
                widthType: "%",
                height: 400,
                heightType: 'px',
                col: true,
                hided: false,
                rows: 3,
                cols: 3,
                targetDataType: null,
                reEnName: '',               //关联实体类的className
                placeholder: "",
                countSwitch: false,          // 是否显示节点个数
                showSearchInput: false,      // 是否显示搜索框

                treeList: [],

                targetClass: '',            // 目标类
                targetRelationClass: '',    // 关联类
                reDirection: '',
                targetRelationEntitiesAttributes: {
                    sysAttr: [],
                    selfAttr: []
                },
                targetRelationClassAttributes: {
                    sysAttr: [],
                    selfAttr: []
                },
                rootLabel: [],
              relationAttr: 'parentOid',
                childrenLabel: '',
                rootQuery: '',
                childrenQuery: '',
                rootEmptyLabel: '该对象暂无所选属性信息',
                childrenEmptyLabel: '该对象暂无所选属性信息',
                iconName: '',       // 父节点的图标对应属性
                iconCName: '',      // 子节点的图标对应属性

                selected_entities_attributes: [],                // 左实体 关联类 右实体的属性
                selected_relations_attributes: [],
                selected_relation_entities_attributes: [],

                relationName: '',         // 用于懒加载的全局变量
                str_re: '',
                transChildrenQuery: '',
                transCLabel: '',

                iconLabel: '',
                iconCLabel: '',
                iconArr: [],
                iconCArr: [],
                iconObj: {},
                iconCObj: {},

                events: [],
                eventRange: ["单击节点"]
            },

            iconStatus: 'parent',   // 当前正在设置父或子的图标
            filterStatus: '3',   // 当前正在设置父或子的过滤条件

            // 支持的数据类型
            dataTypes: ['String', 'UUID', 'Clob'],

            // 对齐方式,布局插件使用
            alignList: [
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

            attrMap: {},

            open: ["1","2"],

            timer: null
        }
    },
    components: {
        EditBox,
        BindOperationBar,
        IconEditModal,
        FilterQueryCommonModal
    },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);

        if(this.t_preview){
            this.$store = this.store;
            let that = this;
            if(this.attributes) this.attributes.forEach(x => that.attrMap[x.attributeName] = x)

        }
    },
    async mounted() {

        if(this.t_preview) {
            this.setHeight();

            // if(this.itemValue.data.isRelation) {
            //     if(this.args.str_re == 'l') {
            //         this.attributes = this.attributes[2];
            //     } else {
            //         this.attributes = this.attributes[3];
            //     }
            // }
            this.initData();
            if(this.args.treeList.length > 0) {
                this.updateTree(1);
            }
        }

    },

    computed: {
        ...mapGetters("DWF_form", [
            "EntityAttrList",
            "Entities"
        ]),
        arg_width() {
            return this.args.width + this.args.widthType;
        },
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
        },
        filter_attributes() {
            return this.attributes ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) : [];
        },
    },
    watch: {
    },
    beforeDestroy() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; };
    },
    methods: {
        ...mapActions("DWF_form", [
            "queryEntity"
        ]),
        async initData() {

          //增加外部实体类
          // let allExternalEntities = await getExternalEntities();
            // this.all_class = this.Entities();
          let treeEn = await getAllEntities();
          if(treeEn && treeEn.data.success){
            this.all_class = treeEn.data.data.filter(en => en.classCategory !== 'ExternalItemClass');
            this.allExternalEntities = treeEn.data.data.filter(en => en.classCategory === 'ExternalItemClass');
          }

            if(!this.itemValue.data.isRelation && (!this.args.targetClass || this.args.targetClass == '')) {
                this.args.targetClass = this.itemValue.data.targetClass;
            }
            // this.changeClass(this.args.targetClass);

            if(this.args.treeList.length > 0) {
                this.isHasTree = true;
            }

            let allEnAttr = this.EntityAttrList(this.args.targetClass);
            this.targetClassAttributes.sysAttr = allEnAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.targetClassAttributes.selfAttr = allEnAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            console.log(this.targetClassAttributes)

        },

        // 设置操作
        editOpr(opr, ind, nodeType) {

            this.oprModalType = 'edit';

            // 图标列表加载
            if(this.iconList.length == 0) {
                this.iconList = moduleIconData;
            }
            if(!opr.oprShowType) {
                opr['oprShowType'] = '文字图标';
            }

            // this.$refs.BindOperationBar.reset();
            this.reloadBindBar = false;
            this.$nextTick(() => {

                let temOpr = {...opr};
                this.oprForm.oprShowType = temOpr.oprShowType;
                this.oprForm.name = temOpr.name;
                this.oprForm.iconName = temOpr.iconName;
                this.oprForm.opr_type = temOpr.opr_type;
                this.oprForm.opr_path = temOpr.opr_path;
                this.oprForm.opr_sys_path = temOpr.opr_sys_path;
                this.oprForm.opr_showMessage = temOpr.opr_showMessage;

                if(nodeType == 'root') {

                    this.editChildOprInd = -1;
                    this.editRootOprInd = ind;

                } else {

                    this.editRootOprInd = -1;
                    this.editChildOprInd = ind;

                }
                this.reloadBindBar = true;
                this.setOprModal = true;

            })

        },

        // 确认操作设置
        confirmSetOpr() {

            if(this.oprForm.name == '') {
                this.$Message.warning('操作不能为空');
            } else if(this.oprForm.iconName == undefined || this.oprForm.iconName == 'undefined' || !this.oprForm.iconName) {
                this.$Message.warning('图标不能为空');
            } else {

                let temOpr = {...this.oprForm};
                if(this.editRootOprInd !== -1) {

                    this.args.rootOperation[this.editRootOprInd].name = temOpr.name;
                    this.args.rootOperation[this.editRootOprInd].oprShowType = temOpr.oprShowType;
                    this.args.rootOperation[this.editRootOprInd].iconName = temOpr.iconName;
                    this.args.rootOperation[this.editRootOprInd].opr_type = temOpr.opr_type;
                    this.args.rootOperation[this.editRootOprInd].opr_path = temOpr.opr_path;
                  this.args.rootOperation[this.editRootOprInd].opr_sys_path = temOpr.opr_sys_path;
                  this.args.rootOperation[this.editRootOprInd].opr_showMessage = temOpr.opr_showMessage;
                    this.args.rootOperation[this.editRootOprInd].tmp = false;

                } else {

                    this.args.childOperation[this.editChildOprInd].name = temOpr.name;
                    this.args.childOperation[this.editChildOprInd].oprShowType = temOpr.oprShowType;
                    this.args.childOperation[this.editChildOprInd].iconName = temOpr.iconName;
                    this.args.childOperation[this.editChildOprInd].opr_type = temOpr.opr_type;
                    this.args.childOperation[this.editChildOprInd].opr_path = temOpr.opr_path;
                  this.args.childOperation[this.editChildOprInd].opr_sys_path = temOpr.opr_sys_path;
                  this.args.childOperation[this.editChildOprInd].opr_showMessage = temOpr.opr_showMessage;
                    this.args.childOperation[this.editChildOprInd].tmp = false;

                }

                if(this.args.rootLabel != '' && this.args.childrenLabel != '') {
                    this.updateTree();
                }

                this.setOprModal = false;

            }

        },

        // 取消操作设置
        cancelSetOpr() {

            console.log(this.oprModalType)
            if(this.oprModalType == 'create') {

                if(this.editRootOprInd !== -1) {
                    this.args.rootOperation.splice(this.editRootOprInd, 1);
                } else {
                    this.args.childOperation.splice(this.editChildOprInd, 1);
                }

            }

            this.setOprModal = false;

        },

        // 点击右上角关闭操作设置弹窗
        oprVisibleModal(state) {

            if(!state && (this.oprForm.name == '' || this.oprForm.iconName == undefined || this.oprForm.iconName == 'undefined' || !this.oprForm.iconName)) {
                this.cancelSetOpr();
            }

        },

        // 自定义树结构
        renderWithButton(h, {root, node, data}) {

            // 图标
            const objL = Object.keys(this.args.iconObj);
            const objCL = Object.keys(this.args.iconCObj);

            // 操作
            let rootOpr = this.args.rootOperation;
            let childOpr = this.args.childOperation;

            let rootDom = rootOpr.map(function(item, index){

                // 操作图标渲染
                if(!item.oprShowType) {
                    item['oprShowType'] = '文字图标';
                }

                // 显示文字图标
                if(item.oprShowType == '文字图标' || !item.oprShowType) {

                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} icon={item.iconName} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>
                    } else {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>
                    }

                } else if(item.oprShowType == '文字') {

                    // 只显示文字
                    return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>

                } else if(item.oprShowType == '图标') {

                    // 只显示图标
                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} icon={item.iconName} size={'small'} style={'margin-right:8px'}></i-button>
                    } else {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} size={'small'} style={'margin-right:8px'}></i-button>
                    }

                } else {

                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} icon={item.iconName} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>
                    } else {
                        return <i-button v-show={data.rootFlag} type={index == 0 ? "primary" : "default"} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>
                    }

                }

            })

            let childDom = childOpr.map(function(item, index){

                // 操作图标渲染
                if(!item.oprShowType) {
                    item['oprShowType'] = '文字图标';
                }

                // 显示文字图标
                if(item.oprShowType == '文字图标' || !item.oprShowType) {

                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={!data.rootFlag} icon={item.iconName} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>
                    } else {
                        return <i-button v-show={!data.rootFlag} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>
                    }

                } else if(item.oprShowType == '文字') {

                    // 只显示文字
                    return <i-button v-show={!data.rootFlag} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>

                } else if(item.oprShowType == '图标') {

                    // 只显示图标
                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={!data.rootFlag} icon={item.iconName} size={'small'} style={'margin-right:8px'}></i-button>
                    } else {
                        return <i-button v-show={!data.rootFlag} size={'small'} style={'margin-right:8px'}></i-button>
                    }

                } else {

                    if(item.iconName && item.iconName != '' && item.iconName.indexOf('icon-') == -1) {
                        return <i-button v-show={!data.rootFlag} icon={item.iconName} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>
                    } else {
                        return <i-button v-show={!data.rootFlag} size={'small'} style={'margin-right:8px'}>{item.name}</i-button>
                    }

                }

            })

            // 未设置任何节点图标
            if((this.args.iconName == '' || !this.args.iconName || objL.length == 0) && (this.args.iconCName == '' || !this.args.iconCName || objCL.length == 0)) {

                return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer"}]}>
                    <span style={[{"display": "inline-block", "cursor": "pointer", "background": node.node.selected ? "#d5e8fc" : "#fff"}]} onClick={this.clickNode.bind(this, data, node)}>{data.selfTreeAttr}</span>
                    <span style="float:right;margin-right:8px">
                        {rootDom}
                        {childDom}
                    </span>
                </div>;

            } else {
                let rootIconName = this.args.iconName;
                let childIconName = this.args.iconCName;
                // if(this.args.str_re == 'l') {

                //     rootIconName = this.args.iconName ? `left_${this.args.iconName}` : '';
                //     if(this.args.iconCName) {

                //         if(this.args.iconCName.indexOf('&') == -1) {
                //             childIconName = `left_${this.args.iconCName}`;
                //         } else {
                //             childIconName = `relation_${this.args.iconCName.split('&')[0]}`;
                //         }

                //     }

                // } else {

                //     rootIconName = this.args.iconName ? `right_${this.args.iconName}` : '';
                //     if(this.args.iconCName) {
                //         if(this.args.iconCName.indexOf('&') == -1) {
                //             childIconName = `right_${this.args.iconCName}`;
                //         } else {
                //             childIconName = `relation_${this.args.iconCName.split('&')[0]}`;
                //         }
                //     }

                // }
                // 当该对象不存在选定的图标属性 或者 具有该属性 但是在属性映射表中未定义对应的图标值 不显示图标
                if((!data[rootIconName] && !data[childIconName]) || (rootIconName == '' && childIconName == '')) {

                    return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer"}]}>
                        <span style={[{"display": "inline-block", "cursor": "pointer", "background": node.node.selected ? "#d5e8fc" : "#fff"}]} onClick={this.clickNode.bind(this, data, node)}>{data.selfTreeAttr}</span>
                        <span style="float:right;margin-right:8px">
                            {rootDom}
                            {childDom}
                        </span>
                    </div>;

                } else {

                    // 判断当前是根节点 还是子节点 (根节点的属性是不带有left_/right_前缀的)
                    let finalIconName = '';
                    if(rootIconName && this.args.iconObj[data[rootIconName]]) {
                        finalIconName = this.args.iconObj[data[rootIconName]];
                    }

                    if(childIconName && this.args.iconCObj[data[childIconName]]) {
                        finalIconName = this.args.iconCObj[data[childIconName]]
                    }

                    if(finalIconName == '') {
                        return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer"}]}>
                            <span style={[{"display": "inline-block", "cursor": "pointer", "background": node.node.selected ? "#d5e8fc" : "#fff"}]} onClick={this.clickNode.bind(this, data, node)}>{data.selfTreeAttr}</span>
                            <span style="float:right;margin-right:8px">
                                {rootDom}
                                {childDom}
                            </span>
                        </div>;
                    } else {

                        if(finalIconName.indexOf('icon-') == -1) {
                            return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer"}]}>
                                <icon type={finalIconName} style="margin-right: 4px;" />
                                <span style={[{"display": "inline-block", "cursor": "pointer", "background": node.node.selected ? "#d5e8fc" : "#fff"}]} onClick={this.clickNode.bind(this, data, node)}>{data.selfTreeAttr}</span>
                                <span style="float:right;margin-right:8px">
                                    {rootDom}
                                    {childDom}
                                </span>
                            </div>;

                        } else {
                            finalIconName = `iconfont ${finalIconName}`;
                            return <div style={[{"display": "inline-block", "width": 'calc(100% - 20px)', "cursor": "pointer"}]}>
                                <i class={finalIconName} style="margin-right: 6px;"></i>
                                <span style={[{"display": "inline-block", "cursor": "pointer", "background": node.node.selected ? "#d5e8fc" : "#fff"}]} onClick={this.clickNode.bind(this, data, node)}>{data.selfTreeAttr}</span>
                                <span style="float:right;margin-right:8px">
                                    {rootDom}
                                    {childDom}
                                </span>
                            </div>;
                        }

                    }

                }

            }

        },

        // 树翻页
        async changeTreePage(pageId) {

            this.updateTree(pageId);

        },

        /**
         * @description 修改每页条数
        */
        changeTreePageSize(size) {

            this.args.selfSize = parseInt(size);
            this.updateTree(1);

        },

        /**
         * @description 新增根节点操作   *******
        */
        createRootOpr() {

            // 图标列表加载
            if(this.iconList.length == 0) {
                this.iconList = moduleIconData;
            }

            this.oprModalType = 'create';

            this.oprForm.oprShowType = '文字图标';
            this.oprForm.name = '';
            this.oprForm.iconName = 'ios-add';
            this.oprForm.opr_path = '';
            this.oprForm.opr_type = '';
            this.oprForm.opr_sys_path = '';
            this.oprForm.opr_showMessage = true;

            let idx = this.args.rootOperation.length;
            if (idx > 0 && this.args.rootOperation[idx-1].tmp) {
                this.$Message.warning("请先完成当前根节点操作的添加");
                return;
            }

            this.editChildOprInd = -1;
            this.editRootOprInd = this.args.rootOperation.length;
            this.args.rootOperation.push({ opr_path: '', opr_type: '', name: '', iconName: '', oprShowType: '文字图标', tmp: true, extend: false, opr_sys_path: '', opr_showMessage: true });

            this.reloadBindBar = false;
            this.$nextTick(async () => {
                this.reloadBindBar = true;
                this.setOprModal = true;
            })

        },

        confirmEvent(index) {

            if (this.args.rootOperation[index].name == '') {
                if (this.$Message) this.$Message.warning("请选择目标操作");
                return;
            }
            this.args.rootOperation[index].tmp = false;

        },

        cancelEvent(index) {
            this.args.rootOperation.splice(index, 1);
        },

        // 懒加载
        lazySwitchEvent(status) {
            if(status) {
                this.args.expandSwitch = false;
            }
        },

        handleChangeEventOfOperationBar(event) {

            console.log(event);
            if (event.conf.opr_type == 'query') {

                // this.args.rootOperation[event.index].iconName = event.query_opr.icon;

              try {
                if (event.query_opr.oprScript) {
                  //如果是前后端脚本统一之后的情况
                  if (event.query_opr.action == "implement" && ['addin', 'addinAlias'].includes(event.query_opr.implementType)) {
                    this.args.rootOperation[event.index].extend = true;
                  }
                }else{
                  if (event.query_opr.action == "implement"
                    && !event.query_opr.conditionExpre.startsWith("procedure:")
                    && !event.query_opr.conditionExpre.startsWith("serverScript:")
                    && !event.query_opr.conditionExpre.startsWith("clientScript:")) {

                      this.args.rootOperation[event.index].extend = true;

                  }
                }
              }catch (e) {
                console.error(e)
              }
            }

        //   /**
        //    *@description增加系统操作时提示信息开关和后处理脚本，通过创建一个新uuid事件绑定到系统操作上
        //    *@params
        //    *@date 2021/1/5
        //    *@return
        //    */
        //   if(event.conf.opr_type === 'sys'){
        //     this.oprForm.opr_showMessage = event.conf.opr_showMessage;
        //     this.oprForm.opr_sys_path = event.conf.opr_sys_path ? event.conf.opr_sys_path : '';
        //   }
            this.oprForm.opr_path = event.conf.opr_path;
            this.oprForm.opr_type = event.conf.opr_type;
            // this.args.rootOperation[event.index].opr_path = event.conf.opr_path;
            // this.args.rootOperation[event.index].opr_type = event.conf.opr_type;
        },

        searchEvent(e) {

            if(e.target.value != '') {
                this.updateTree(1, 'search');
            } else {
                this.updateTree(1);
            }


        },

        /**
         * @description 新增子节点操作      ************
        */
        createChildOpr() {

            this.oprModalType = 'create';
            // 图标列表加载
            if(this.iconList.length == 0) {
                this.iconList = moduleIconData;
            }

            this.oprForm.oprShowType = '文字图标';
            this.oprForm.name = '';
            this.oprForm.iconName = 'ios-add';
            this.oprForm.opr_path = '';
            this.oprForm.opr_type = '';
            this.oprForm.opr_sys_path = '';
            this.oprForm.opr_showMessage = true;

            let idx = this.args.childOperation.length;
            if (idx > 0 && this.args.childOperation[idx-1].tmp) {
                this.$Message.warning("请先完成当前子节点操作的添加");
                return;
            }

            this.editRootOprInd = -1;
            this.editChildOprInd = this.args.childOperation.length;
            this.args.childOperation.push({ opr_path: '', opr_type: '', name: '', iconName: '', oprShowType: '文字图标', tmp: true, extend: false, opr_sys_path: '', opr_showMessage: true });

            this.reloadBindBar = false;
            this.$nextTick(async () => {
                this.reloadBindBar = true;
                this.setOprModal = true;
            })

        },

        confirmChildEvent(index) {

            if (this.args.childOperation[index].name == '') {
                if (this.$Message) this.$Message.warning("请选择目标操作");
                return;
            }
            this.args.childOperation[index].tmp = false;

        },

        cancelChildEvent(index) {
            this.args.childOperation.splice(index, 1);
        },

        handleChangeChildEventOfOperationBar(event) {

            if (event.conf.opr_type == 'query') {

                // this.args.childOperation[event.index].iconName = event.query_opr.icon;
              try {
                if (event.query_opr.oprScript) {
                  //如果是前后端脚本统一之后的情况
                  if (event.query_opr.action == "implement" && ['addin', 'addinAlias'].includes(event.query_opr.implementType)) {
                    this.args.childOperation[event.index].extend = true;
                  }
                }else{
                  if (event.query_opr.action == "implement"
                    && !event.query_opr.conditionExpre.startsWith("procedure:")
                    && !event.query_opr.conditionExpre.startsWith("serverScript:")
                    && !event.query_opr.conditionExpre.startsWith("clientScript:")) {

                    this.args.childOperation[event.index].extend = true;

                  }
                }
              }catch (e) {
                console.error(e)
              }
            }

          /**
           *@description增加系统操作时提示信息开关和后处理脚本，通过创建一个新uuid事件绑定到系统操作上
           *@params
           *@date 2021/1/5
           *@return
           */
          if(event.conf.opr_type === 'sys'){
            this.oprForm.opr_showMessage = event.conf.opr_showMessage;
            this.oprForm.opr_sys_path = event.conf.opr_sys_path ? event.conf.opr_sys_path : '';
          }
            this.oprForm.opr_path = event.conf.opr_path;
            this.oprForm.opr_type = event.conf.opr_type;
            // this.args.childOperation[event.index].opr_path = event.conf.opr_path;
            // this.args.childOperation[event.index].opr_type = event.conf.opr_type;
        },

        clickNode(el, node) {

            if(!node.node.selected) {
                this.$refs.myTree.handleSelect(node.nodeKey);  //手动选择树节点
            } else {
                node.node.selected = false;
            }

        },

        needCount(status) {
            this.args.countSwitch = status;
        },

        // 自定义 根lable 1: 标签 3: 条件
        clickAttr(value) {

            if(this.isRootLable == '1') {

                if(value.length > this.lastAttr.length) {
                    this.selfRootLable = this.selfRootLable + value[value.length - 1] + '/';
                } else {
                    let delAttr = this.lastAttr.concat(value).filter(v => this.lastAttr.includes(v) && !value.includes(v));
                    this.selfRootLable = this.selfRootLable.replace(`${delAttr[0]}/`,'');
                }

                this.lastAttr = value;

            } else {

                if(value.length > this.lastQueryAttr.length) {
                    this.selfRootLable = this.selfRootLable + value[value.length - 1] + ' ';
                } else {
                    let delAttr = this.lastQueryAttr.concat(value).filter(v => this.lastQueryAttr.includes(v) && !value.includes(v));
                    this.selfRootLable = this.selfRootLable.replace(`${delAttr[0]} `,'');
                }

                this.lastQueryAttr = value;

            }
        },

        // (关联实体类) 2: 标签 4: 条件
        clickRelationEntitiesAttr(value) {

            if(this.isRootLable == '2') {

                if(value.length > this.lastRelationEntitiesAttr.length) {
                    this.selfRootLable = this.selfRootLable + value[value.length - 1] + '/';
                } else {
                    let delAttr = this.lastRelationEntitiesAttr.concat(value).filter(v => this.lastRelationEntitiesAttr.includes(v) && !value.includes(v));
                    this.selfRootLable = this.selfRootLable.replace(`${delAttr[0]}/`,'');
                }

                this.lastRelationEntitiesAttr = value;

            } else {

                if(value.length > this.lastQueryRelationEntitiesAttr.length) {
                    this.selfRootLable = this.selfRootLable + value[value.length - 1] + ' ';
                } else {
                    let delAttr = this.lastQueryRelationEntitiesAttr.concat(value).filter(v => this.lastQueryRelationEntitiesAttr.includes(v) && !value.includes(v));
                    this.selfRootLable = this.selfRootLable.replace(`${delAttr[0]} `,'');
                }

                this.lastQueryRelationEntitiesAttr = value;
            }

        },

        /**
         * @description 更改实体类 reset标签条件
        */
        async changeClass(value) {

            this.args.treeList = [];

            this.args.rootLabel = '';
            this.args.childrenLabel = '';

            this.selfRootLable = '';
            this.lastAttr = [];
            this.lastRelationAttr = [];
            this.lastRelationEntitiesAttr = [];
            this.lastQueryAttr = [];
            this.lastQueryRelationAttr = [];
            this.lastQueryRelationEntitiesAttr = [];
            this.args.selected_entities_attributes = [];
            this.args.selected_relations_attributes = [];
            this.args.selected_relation_entities_attributes = [];

            this.args.rootEmptyLabel = '该对象暂无所选属性信息';
            this.args.childrenEmptyLabel = '该对象暂无所选属性信息';
            this.args.rootQuery = '';
            this.args.childrenQuery = '';
            this.args.iconName = '';
            this.args.iconLabel = '';
            this.args.iconCName = '';
            this.args.iconCLabel = '';
            this.args.recursiveLevel = 1;
            this.args.lazySwitch = true;
            this.args.showSearchInput = false;
            this.args.pageSwitch = false;
            this.args.showRefresh = false;

          if(!value || value == undefined || value == 'undefined') return;

          if(this.allExternalEntities.filter(en => en.className === value).length !== 0){
            this.args.classCategory = 'ExternalItemClass';
          }else{
            this.args.classCategory = 'ItemClass';
          }
          // 获取当前所选目标实体类的全部属性
          // let allEnAttr = this.EntityAttrList(value);
          let allEnAttr = await getAttributes(value);

          this.targetClassAttributes.sysAttr = allEnAttr.data.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          this.targetClassAttributes.selfAttr = allEnAttr.data.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
        },

        /**
         * @description 设置节点标签 及 过滤条件
         * @status 1:设置根节点标签； 2: 设置子节点标签；3: 设置根节点过滤条件；4: 设置子节点过滤条件；
        */
       async setLable(status) {

            // 确认当前编辑 根 或 子 节点状态
            this.isRootLable = status;

            // 获取当前所选目标实体类的全部属性
            await this.queryEntity(this.args.targetClass);
            let allEnAttr = this.EntityAttrList(this.args.targetClass);
            this.targetClassAttributes.sysAttr = allEnAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.targetClassAttributes.selfAttr = allEnAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);

            if(status == '1') {

               this.editLabelSpan = '编辑节点标签:'
               this.selfRootLable = this.args.rootLabel;

                // 回填checkBox数据
               if(this.args.rootLabel != '') {

                    let eCheckObj = this.args.rootLabel.split('/');
                    eCheckObj.pop();
                    this.args.selected_entities_attributes = eCheckObj;
                    if(this.lastAttr.length == 0) {
                        this.lastAttr = eCheckObj;
                    }

               } else {

                   this.args.selected_entities_attributes = [];
               }

               this.lableModal = true;

               // 设置根节点标签 隐藏关联类的属性展示板
               this.isChildLable = false;

            } else if(status == '2') {

               this.editLabelSpan = '编辑节点标签:'
               if(this.args.targetClass == '') {

                   this.$Message.warning('请先选择实体类');

               } else {

                   this.selfRootLable = this.args.childrenLabel;

                   // 回填checkBox数据
                   if(this.args.childrenLabel != '') {

                       let allCheckObj = this.args.childrenLabel.split('/');

                        this.args.selected_relation_entities_attributes = allCheckObj;

                        if(this.lastRelationEntitiesAttr.length == 0) {
                            this.lastRelationEntitiesAttr = allCheckObj;
                        }

                   } else {
                       this.args.selected_relation_entities_attributes = [];
                   }

                   this.lableModal = true;

                    // 显示子节点checkBox
                    this.isChildLable = true;
               }

            } else if(status == '3') {

                // this.editLabelSpan = '编辑节点条件:'
                // this.args.selected_entities_attributes = [];

                // // 隐藏关联类属性面板
                // this.isChildLable = false;

                // this.selfRootLable = this.args.rootQuery;

                // this.lableModal = true;

                if(this.args.targetClass == '') {
                    this.$Message.warning('请先选择实体类');
                } else {

                    this.filterStatus = '3';
                    let filterObj = {
                        refClassDisabled: true,
                        allowNative: false,
                        hideRelationClass: []
                    }

                    this.$refs.filterQuery_modal.initModal(this.args.rootQuery, this.args.targetClass.split('&')[0], filterObj, false);

                }

            } else {

                // this.editLabelSpan = '编辑节点条件:'
                // this.args.selected_relation_entities_attributes = [];
                // this.args.selected_relations_attributes = [];

                // // 显示关联类属性面板
                // this.isChildLable = true;

                // this.selfRootLable = this.args.childrenQuery;

                // this.lableModal = true;
                if(this.args.targetClass == '') {
                    this.$Message.warning('请先选择实体类');
                } else {

                    this.filterStatus = '4';
                    let filterObj = {
                        refClassDisabled: true,
                        allowNative: false,
                        hideRelationClass: []
                    }

                    this.$refs.filterQuery_modal.initModal(this.args.childrenQuery, this.args.targetClass.split('&')[0], filterObj, false);

                }

            }

       },

       getFilterQuery(transQuery){

            if(this.filterStatus == '3') {
                this.args.rootQuery = transQuery;
            } else {
                this.args.childrenQuery = transQuery;
            }

        },

       /**
         * @description 确认生成回填配置项
         * @isRootLable 1:回填根节点标签； 2: 回填子节点标签；3: 回填根节点过滤条件；4: 回填子节点过滤条件；
        */
       confirmLable() {

           if((this.isRootLabel == '1' || this.isRootLabel == '2') && this.selfRootLable == '') {

               this.$Message.warning('请先选择所需展示属性');

           } else {

               // 确认生成根节点标签
               if(this.isRootLable == '1') {

                   this.args.rootLabel = this.selfRootLable;

                } else if(this.isRootLable == '2') {

                    this.args.childrenLabel = this.selfRootLable;

                } else if(this.isRootLable == '3') {

                    this.args.rootQuery = this.selfRootLable;

                } else {

                    this.args.childrenQuery = this.selfRootLable;
                }

                this.lableModal = false;
           }

       },

       chooseIcon(status) {

           let that = this;
           that.iconStatus = status;

           if(!this.needIcon) {
               this.needIcon = true;

               this.$Spin.show();

               setTimeout(function() {

                that.$Spin.hide();
                if(status == 'parent') {

                    that.$refs.icon_modal.editModal(that.args.iconArr, that.args.iconLabel);

                } else {

                    that.$refs.icon_modal.editModal(that.args.iconCArr, that.args.iconCLabel);

                }


              }, 500);

            } else {
                if(status == 'parent') {
                    that.$refs.icon_modal.editModal(that.args.iconArr, that.args.iconLabel);
                } else {
                    that.$refs.icon_modal.editModal(that.args.iconCArr, that.args.iconCLabel);
                }
            }

       },

       /**
        * @description 设置图标映射表
       */
       getIconLabel(data) {
           console.log(data)

           if(this.iconStatus == 'parent') {
               this.args.iconLabel = data;
           } else {
               this.args.iconCLabel = data;
           }



           if(data.length != 0) {

               let temArr = data.split(',');
               console.log(temArr);
               // 映射表
               temArr.forEach(val => {

                   // 数字特殊处理
                   const _k = val.split(':')[0];
                   const _kl = _k.length;
                   const _pk = parseInt(_k);
                   let _pkl;
                   if(!isNaN(_pk)) _pkl = _pk.toString().length;

                   let _key;
                   if(_kl == _pkl) {

                       _key = _pk;

                   } else {
                       _key = _k;
                   }

                    let _value = val.split(':')[1];

                    if(this.iconStatus == 'parent') {
                        this.args.iconObj[_key] = _value;
                    } else {
                        this.args.iconCObj[_key] = _value;
                    }
                    console.log(this.args.iconObj)


               })

                // 整理传回图标组件的图标合集
                temArr = temArr.map(x => { return x.split(':')[1] });

                if(this.iconStatus == 'parent') {
                    this.args.iconArr = temArr;
                } else {
                    this.args.iconCArr = temArr;
                }


           } else {
               if(this.iconStatus == 'parent') {
                   this.args.iconObj = {};
                   this.args.iconArr = [];
               } else {
                   this.args.iconCObj = {};
                   this.args.iconCArr = [];
               }

           }

       },

       /**
        * @description 清空输入框map属性
       */
       mapAttr(event) {

        if(!event.data) {

            this.args.selected_entities_attributes = [];
            this.args.selected_relation_entities_attributes = [];
            this.args.selected_relation_entities_attributes = [];

            this.lastAttr = [];
            this.lastRelationAttr = [];
            this.lastRelationEntitiesAttr = [];

            this.lastQueryAttr = [];
            this.lastQueryRelationAttr = [];
            this.lastQueryRelationEntitiesAttr = [];

        }

       },

        // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
        setHeight() {
            return;
        },

        // 遍历子节点
        getEachTree(tree = [], targetItem) {
            let arr = [];
            let _self = this;
            if (!!tree && tree.length !== 0) {
                tree.forEach(item => {

                    // 子节点label拼接结果
                    let temCAttr = '';
                    this.args.transCLabel.forEach(i => {

                        if(item[i]) {
                            temCAttr = temCAttr + item[i] + '/'
                        }

                    })
                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }

                    let obj = item;
                    obj.selfTreeAttr = temCAttr;
                    if(obj.selfTreeAttr == '') {

                        obj.selfTreeAttr = this.args.childrenEmptyLabel;
                    }

                    // let preStr = this.args.reDirection + '_';
                    // for(let n in targetItem){

                    //     if(n.indexOf(preStr) != -1) {
                    //         let getPKey = this.args.reDirection == 'left' ? 'right_' + n.split('_')[1] :'left_' + n.split('_')[1];
                    //         obj[getPKey] = targetItem[n];
                    //     }

                    // }

                    obj.rootFlag = false;
                    // if(this.args.lazySwitch) {
                    //     obj.loading = false;
                    // }
                    let isHasChild = _self.getEachTree(item.children, item);
                    if(isHasChild.length > 0) {
                        obj.expand = true;
                    }
                    if(item.childrenCount > 0) {
                        obj.loading = false;
                        obj.children = isHasChild;
                    }
                    arr.push(obj);
                });
            }
            return arr;
        },

        /**
         * @description 更新树数据
        */
        async updateTree(startPNum, searchFlag) {

            const objL = Object.keys(this.args.iconObj);
            const objCL = Object.keys(this.args.iconCObj);

            if(this.args.rootLabel == '') {

                this.$Message.warning('请先选择根节点标签');

            } else if(this.args.childrenLabel == '') {

                this.$Message.warning('请先选择子节点标签');

            } else if(objL.length > 0 && this.args.iconName == '') {

                this.$Message.warning('请选择父节点图标属性');

            } else if((this.args.iconName && this.args.iconName != '') && (!objL.length || objL.length == 0)) {

                this.$Message.warning('请填写父节点图标属性映射表');

            } else if(objCL.length > 0 && this.args.iconCName == '') {

                this.$Message.warning('请选择子节点图标属性');

            } else if((this.args.iconCName && this.args.iconCName != '') && (!objCL.length || objCL.length == 0)) {

                this.$Message.warning('请填写子节点图标属性映射表');

            } else {

                // this.treePageIndex = 1;
                // this.args.selfSize = 10;
                this.args.treeList = [];

                // 如果关闭懒加载开关 层数参数提供10000
                let treeParam = {
                    childrenCondition: this.args.childrenQuery,
                    leafCondition: '',
                    recursiveLevel: this.args.lazySwitch ? this.args.recursiveLevel : 10000,
                    rootCondition: this.args.rootQuery,
                    startIndex: this.args.selfSize * (startPNum - 1)
                }

                if(searchFlag && searchFlag == 'search') treeParam.recursiveLevel = 10000;

                // 开启分页默认加载10条 否则加载全部
                if(this.args.pageSwitch) {
                    treeParam['pageSize'] = this.args.selfSize;
                }

                // *********** 转换根节点标签内容
                let temTransRootLabel = this.args.rootLabel.replace(/obj\./g, '');

                this.transRootLabel = temTransRootLabel.split('/');
                if(this.transRootLabel[this.transRootLabel.length - 1] == '') {
                    this.transRootLabel.pop();
                }

                // ************ 转换子节点标签内容
                let transChildrenLabel = this.args.childrenLabel.replace(/obj\./g, '');

                // get关联实体类选择的属性 & 关联类选择的属性的数组 例["relationClass_rcfd", "rightClass_version"]
                this.args.transCLabel = transChildrenLabel.split('/');
                if(this.args.transCLabel[this.args.transCLabel.length - 1] == '') {
                    this.args.transCLabel.pop();
                }

                // 整理label distinct属性集合
                // let searchStr = '';
                // if(this.searchKey != '') {

                //     let s = this.searchKey;
                //     let temAllData = this.transRootLabel.concat(this.args.transCLabel);
                //     let distinctAttr = [...new Set(temAllData)];

                //     distinctAttr.forEach(attr => {
                //         searchStr = `${searchStr} obj.${attr} like '%${s}%' or`
                //     })
                //     if(searchStr != '') {
                //         searchStr = searchStr.substring(0, searchStr.length - 3);
                //     }
                //     treeParam.leafCondition = ` and (${searchStr})`;

                //     let s = this.searchKey;
                //     let temAllData = this.transRootLabel.concat(this.args.transCLabel);
                //     let distinctAttr = [...new Set(temAllData)];

                //     distinctAttr.forEach(attr => {
                //         searchStr = `${searchStr} cast(obj.${attr} as varchar) like '%${s}%' or`
                //     })
                //     if(searchStr != '') {
                //         searchStr = searchStr.substring(0, searchStr.length - 3);
                //     }
                //     treeParam.leafCondition = ` and (${searchStr})`;

                // }

                this.spinShow = true;
                let treeRes = await getSelfJoinEobj(this.args.targetClass, treeParam, this.args.pageSwitch, true, this.args.relationAttr);
                let temTree = [];
                if(treeRes.data.success) {

                    let treeData = this.args.pageSwitch ? treeRes.data.data.data : treeRes.data.data;
                    this.treeTotal = this.args.pageSwitch ? treeRes.data.data.totalCount : treeRes.data.data.length;
                    if(treeData.length > 0) {

                        treeData.forEach(x => {

                            // 根节点过滤结果
                            let temAttr = '';
                            this.transRootLabel.forEach(i => {

                                if(x[i]) {
                                    temAttr = temAttr + x[i] + '/'
                                }

                            })

                            if(temAttr.length > 0) {
                                temAttr = temAttr.substr(0, temAttr.length - 1);
                            }
                            x.selfTreeAttr = temAttr;
                            //  如果对象所选显示的属性 一个都不具有 则显示定义信息
                            if(x.selfTreeAttr == '') {
                                x.selfTreeAttr = this.args.rootEmptyLabel;
                            }

                            x.rootFlag = true;
                            if(this.args.lazySwitch && this.args.recursiveLevel == 0 && !searchFlag && searchFlag != 'search') {
                                if(x.childrenCount > 0) {

                                    x.children = [];
                                    x.loading = false;

                                }
                            } else {

                                let transChild = this.getEachTree(x.children, x);
                                if(transChild.length > 0) {
                                    x.children = transChild;
                                    x.loading = false;
                                    x.expand = true;
                                }

                            }

                        })
                        temTree = treeData;

                    } else {
                        temTree = [];
                    }

                } else {
                    this.$Message.warning('服务繁忙查询失败');
                    temTree = [];
                    this.treeTotal = 0;
                    this.spinShow = false;
                }

                let that = this;
                setTimeout(function() {
                    that.args.treeList = temTree;
                    that.isHasTree = true;
                    that.spinShow = false;
                }, 1000);


            }

        },

        //$obj || $user || $env转换
        commonTransLabel(str, originObj) {

            // *****$user 转换
            str = str.replace(/\$user\.userId/g, this.store.state.user.userId);
            str = str.replace(/\$user\.userName/g, this.store.state.user.username);
            str = str.replace(/\$user\.token/g, this.store.state.user.token);

            // *****$env  转换
            str = str.replace(/\$env\.serverIp/g, this.store.state.DWF_global.serverIp);

            // $obj转换
            // if(str.indexOf('{') != -1 && str.indexOf('}') != -1 && typeof originObj == "object" && originObj != null) {

            //     let temPre = str.split('{');
            //     let temAft = temPre[1].split('}');

            //     let $obj = originObj;
            //     let parseAttr = eval(temAft[0]) || '';
            //     str = `${temPre[0]}'${parseAttr}'${temAft[1]}`;

            // }
            return str;

        },

        // 懒加载事件
        async loadData(item, callback) {

            if(!this.args.lazySwitch) {
                return false;
            }

            let treeParam = {
                childrenCondition: this.args.childrenQuery,
                leafCondition: '',
                recursiveLevel: 1,
                rootCondition: '',
                startIndex: 0
            }

          let prefix = this.args.relationAttr ? this.args.relationAttr : 'parentOid';
          if(this.args.classCategory == 'undefined' || !this.args.classCategory){
            let isExter = this.allExternalEntities.filter(en => {
                return en.className == this.args.targetClass
            })
            if(isExter.length > 0){
                this.args.classCategory = 'ExternalItemClass';
            }else{
                this.args.classCategory = 'ItemClass';
            }
          }
          if(this.args.classCategory == 'ExternalItemClass'){
            prefix = `"${prefix}"`
          }
          treeParam.rootCondition = this.args.childrenQuery == '' ? `and obj.${prefix} = '${item.oid}'` : `and obj.${prefix} = '${item.oid}' ${this.args.childrenQuery}`;
            // queryChildrenData.query.query = `and rightclass.plt_oid = '${item.left_oid}' ${this.args.transChildrenQuery}`;
            // queryChildrenData.rightClass = item.relation_rightClass;
            // queryChildrenData.leftClass = item.relation_leftClass;


            // queryChildrenData.query.type = 'relation';
            // queryChildrenData.query.needInfo = true;
            // queryChildrenData.fresh = true;

            // let temChild = await this.handleQueryData(queryChildrenData);
            let nodeResult = await getSelfJoinEobj(this.args.targetClass, treeParam, false, true, this.args.relationAttr);
            let temChild = [];

            if(nodeResult.data.success) {

                temChild = nodeResult.data.data;

            } else {
                this.$Message.error(nodeResult.data.message);
            }

            if(temChild.length && temChild.length > 0) {

                temChild.forEach((val, index) => {

                    // 子节点过滤结果
                    let temCAttr = '';
                    this.args.transCLabel.forEach(i => {

                        if(val[i]) {
                            temCAttr = temCAttr + val[i] + '/'
                        }

                    })

                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }

                    val.selfTreeAttr = temCAttr;
                    val.rootFlag = false;
                    //  如果对象所选显示的属性 一个都不具有 则隐藏该对象
                    if(val.selfTreeAttr == '') {

                        val.selfTreeAttr = this.args.childrenEmptyLabel;
                        // temChild.splice(index, 1);
                    }

                    if(val.childrenCount > 0) {

                        val.loading = false;
                        val.children = [];

                    } else {

                        val.children = [];

                    }

                })

            } else {
                temChild = [];
            }
            setTimeout(() => {

                callback(temChild);
                if(temChild.length == 0) {
                    delete item.loading
                    delete item.children
                }

            },800);

        },

        /**
         * @description 查询条件转换
         * @targetStr 目标字符串
         * @str 需要被替换的字符串
         * @_str 替换为的字符串
        */
        // transStr(targetStr, str, _str) {
        //     console.log(targetStr, typeof targetStr, str , _str);

        //     targetStr.replace(/[[\]{}()|^$?*+]/g, '');
        //     if(typeof targetStr != 'string') return false;
        //     targetStr = targetStr.replace(new RegExp(str,'g'), _str);

        //     return targetStr;

        // },

        setDisplayType(type) {
            if (type == 0) this.t_preview = true;
            else this.t_preview = false;
            return this;
        },
        getFormName() {
            return this.args.name;
        },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            if ("name" in args) this.args_name = this.args.name;
            return this;
        },
        getArgs() {
            return this.args;
        },
        getAllow() {
            return null;
        },
        getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
            this.t_edit = true;
            return this.$refs.edit;
        },
        getSelected() {

            return this.clickData;

        }
    }
}
</script>
<style>
.editbox-self-joins-tree .ivu-select-dropdown{
  width: 100%!important;
  left: 0px!important;
}
</style>

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

.commonLabel {
    width: 30%;
    margin: 5px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}

.freshBtn {
    float: right;
    margin: 8px  10px 0 0;
    font-size: 24px;
}

.lableTxt {
    padding-bottom: 14px;
    margin-bottom: 5px;
}

.attrBox {
    padding: 10px;
    overflow-y: auto;
    /* border: 1px solid #d7d8da; */
    margin-bottom: 10px;
}
.attrTitle {
    color: #000;
}

.skeleton {
    height: 300px;
}

.square {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: #e2dfdf;
    margin-right: 10px;
}

.rectangle {
    display: inline-block;
    width: 80px;
    height: 20px;
    background: #e2dfdf;
}
.left-line {
    float: left;
    width: 2px;
    height: 280px;
    background: #e2dfdf;
    margin-left: 9px;
}
.right-content {
    float: left;
}
.right-content ul li {
    margin-top: 10px;
    height: 20px;
}
.gray-line {
    display: inline-block;
    position: relative;
    top: -9px;
    width: 20px;
    height: 2px;
    background: #e2dfdf;
}
.page-wrap {
    height: 30px;
}
</style>
