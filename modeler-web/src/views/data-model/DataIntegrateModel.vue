<template>
  <div>
    <div style="width: 70%;  margin: 16px auto;">
      <Steps :current="stepStatus" >
        <Step title="数据连接"></Step>
        <Step title="模式探测"></Step>
        <Step title="映射实体类"></Step>
      </Steps>
    </div>

    <Row :gutter="10">

      <Spin fix v-show="globalLoading"></Spin>
      <!-- 数据连接 -->
      <Col  span="8" style="margin-left:10px;" class="tree-wrap">
        <Card class="data-self-card" :bordered="false" dis-hover style="height: 100%;">
          <Row>
            <div style="float: left;">
              <Button type="primary" style="margin: 5px" @click="onClickAddRow" id="createDataLinkButton">
                新增连接
              </Button>
              <Button type="primary" style="margin: 5px" @click="onClickTestAllConnection" id="testAllDataLinkButton">
                测试连接
              </Button>
            </div>
            <div style="float: right;">
              <Input
                v-model="dataLinkKeyword"
                icon="md-search"
                placeholder="输入关键词查询"
                style="width: 150px; margin: 5px"
                @on-change="searchDataLinkKeyword"
                id="searchDataLinkInput"
              >
              </Input>
            </div>
          </Row>
          <Row>
            <Tree :data="filteredLinkData" 
            :render="renderContent"></Tree>
          </Row>
        </Card>
      </Col>

      <!-- 模式探测 -->
      <Col span="8" class="tree-wrap">
        <Card class="data-self-card" :bordered="false" dis-hover v-show="showTablePanel" style="height: 100%;">
          <Row>
            
              <div style="float: left; height: 42px; line-height: 42px;">
                <Tooltip  transfer max-width="200" :content = "selectLink.ipname+'/'+selectLink.servername">
                  {{this.maxSlice(selectLink.ipname+'/'+selectLink.servername, 10)}}下所有数据表
                  <div slot="content"> 
                    <p style="white-space: normal; word-break: break-all;">{{selectLink.ipname+'/'+selectLink.servername}}</p>
                  </div>
                  </Tooltip>
              </div>

            <div style="float: right;">
              <Input
                v-model="tableKeyWord"
                icon="md-search"
                placeholder="输入关键词查询"
                style="width: 150px; margin: 5px"
                @on-change="searchTable"
                id="searchDataLinkInput"
              >
              </Input>
            </div>
          </Row>
          <Row>
            <Table 
                   border 
                   :columns="tableColumn" 
                   highlight-row
                   :height="tableHeight"
                   stripe
                   :data="tableDataPage" 
                   :loading="tableloading"
                   @on-row-click="showExtClass"
            >
              <template slot-scope="{row, index }" slot="action">
                   <!-- 查看列 -->
                  <Tooltip content = "查看列" transfer>
                  <i-button id="getTable" icon="ios-eye" size="small"
                    @click="showTableDetail(row, index, $event)"
                    style="margin-right:8px"/></Tooltip>
                    <!-- 打开创建的外部实体类的对话框 -->
                    <Tooltip content = "生成外部实体类" transfer>
                  <i-button id="addExtClass" icon="ios-cog" size="small"
                    @click="onClickImportExtButton(row, $event)"
                    /></Tooltip>
              </template>
            </Table>
          </Row>
          <!-- position: absolute bottom : 0px right:10px -->
          <div style="margin: 10px; overflow: hidden">
            <div style="float: right; margin: 5px">
              <Page
                style="margin-bottom: 10px"
                size="small"
                show-total
                placement="top"
                :page-size-opts="pageSizeOpts"
                :pageSize="tablePageSize"
                :total="filteredTableData.length"
                :current="currentTablePage"
                @on-change="changeTablePage"
                @on-page-size-change="changeTablePageSize"></Page>
            </div>
         </div>
        </Card>
      </Col>

      <!-- 映射实体类 -->
      <Col span="7" class="tree-wrap">
        <Card class="data-self-card" :bordered="false" dis-hover v-show="showClassPanel" style="height: 100%;" >
          <Row>
            <div style="float: left; height: 42px; line-height: 42px;">
              <!-- :content = "' '+ selectTable.tableName"  -->
                <Tooltip transfer max-width="200">
                  {{this.maxSlice(selectTable.tableName, 4)}}下外部实体类
                  <div slot="content"> 
                    <p style="white-space: normal; word-break: break-all;">{{selectTable.tableName}}</p>
                  </div>
                </Tooltip>
            </div>
            <div style="float: right;">
              <Input
                v-model="classKeyword"
                icon="md-search"
                placeholder="输入关键词查询"
                style="width: 150px; margin: 5px"
                @on-change="searchExtClass"
                id="searchDataLinkInput"
              >
              </Input>
            </div>
          </Row>
          <Row>
            <Table border :columns="classColumn" highlight-row :data="extClassDataPage" :height="tableHeight"
            stripe
            :loading="extClassTableLoding">

              <template slot-scope="{row, index }" slot="action">
                  <!-- 查看对象 -->
                  <Tooltip content = "查看对象" transfer>
                  <i-button id="getTable" icon="ios-eye" size="small"
                    @click="showExtClassDetail(row, index)"
                    style="margin-right:8px"/></Tooltip>
                    <!-- 编辑外部实体类 -->
                  <Tooltip content = "编辑" transfer>
                  <i-button id="editLink" icon="md-create" size="small"
                    @click="editExtClass(row, index)"
                    style="margin-right:8px"/></Tooltip>

                    <!-- 删除外部实体类 -->
                  <Tooltip content = "删除" transfer>
                  <i-button id="deleteLink" icon="md-remove" size="small"
                    @click="removeExtClass(row, index)"
                    /></Tooltip>
              </template>
            </Table></Row>
            <div style="margin: 10px; overflow: hidden">
              <div style="float: right; margin: 5px">
                <Page
                  style="margin-bottom: 10px"
                  size="small"
                  show-total
                  placement="top"
                  :page-size-opts="extPageSizeOpts"
                  :pageSize="extPageSize"
                  :total="filteredExtClassData.length"
                  :current="currentExtPage"
                  @on-change="changeExtPage"
                  @on-page-size-change="changeExtPageSize"></Page>
              </div>
            </div>          
        </Card>
      </Col>
    </Row>

      <!-- 删除数据连接 -->
      <Modal
        v-model="deleteConfirm"
        title="删除数据连接"
        id="deleteDataLinkModal"
      >
        <p>确定要删除这个数据连接吗?</p>
        <br>
        <Checkbox v-model="cascade">级联删除由此数据连接引入的所有外部实体类，及其关联的关联类、属性、表单、授权项(<span style="color: orangered">请谨慎选择</span>)</Checkbox>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="deleteConfirm = false">取消</Button>
          <Button type="primary" size="large" :loading="deleteModalLoading" @click="deleteRowOnOk">确认</Button>
        </div>
      </Modal>

      <!-- 新增和修改数据连接 -->
      <Modal
        v-model="editRowModal"
        :title="editRowModalTitle"
        id="dataLinkModal"
        :mask-closable="false"
        style="width: 700px;"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" :label-width="140">
          <FormItem label="数据连接英文名" prop="dataSourceName">
            <Input v-model="editRowData.dataSourceName" placeholder="输入数据连接名" :disabled="editRowStatus==='edit'" id="dataLinkModalDataSourceName"></Input>
          </FormItem>
          <FormItem label="数据连接显示名" prop="displayName">
            <Input v-model="editRowData.displayName" placeholder="输入数据连接显示名" id="dataLinkModalDisplayName"></Input>
          </FormItem>
          <FormItem label="数据连接类型" prop="dataSourceType">
            <Select v-model="editRowData.dataSourceType" placeholder="选择数据连接类型" filterable :disabled="editRowStatus==='edit'" id="dataLinkModalDataSourceType">
              <Option v-for="item in allDataSourceTypes" :value="item" :key="item" :label="item">
                <span>{{ item }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="服务器地址" prop="serverIp">
            <Input v-model="editRowData.serverIp" placeholder="输入服务器地址" id="dataLinkModalServerIp"></Input>
          </FormItem>
          <FormItem label="服务器端口" prop="serverPort">
            <InputNumber :min="0" :max="65535" v-model="editRowData.serverPort" placeholder="输入服务器端口" id="dataLinkModalServerPort"></InputNumber>
          </FormItem>
          <FormItem label="登录用户名" prop="userName">
            <Input v-model="editRowData.userName" placeholder="输入登录用户名" id="dataLinkModalUserName"></Input>
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input v-model="editRowData.password" placeholder="输入密码" type="password" id="dataLinkModalPassword"></Input>
          </FormItem>
          <FormItem label="数据库名称" prop="dataBaseName" v-if="!databaseNotRequire">
            <Input v-model="editRowData.dataBaseName" placeholder="输入数据库名称" id="dataLinkModalDataBaseName"></Input>
          </FormItem>
          <FormItem label="服务名称" prop="dataBaseName" v-if="serviceNameRequire">
            <Input v-model="editRowData.dataBaseName" placeholder="输入ORACLE服务名称" id="dataLinkModalDataBaseName"></Input>
          </FormItem>
          <FormItem label="数据库版本" prop="dataBaseVersion" v-if="versionRequire">
            <Select v-model="editRowData.dataBaseVersion" placeholder="输入数据库版本" id="dataLinkModalDataBaseVersion">
              <Option v-for="item in dataVersions[editRowData.dataSourceType]" :value="item" :key="item" :label="item">
                <span>{{ item }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="描述" prop="description">
            <Input v-model="editRowData.description" placeholder="输入描述" id="dataLinkModalDescription"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="cancelModal">取消</Button>
          <Button type="primary" size="large" :loading="editRowModalLoading" @click="onConfirmEditRow" id="confirmDataLinkButton">确认</Button>
        </div>
      </Modal>

      <!-- 查看数据表下的列 -->
      <Modal
        v-model="showTableColumn"
        title="查看数据"
        width="850"
        scrollable
        >
        <Table :columns="columnColumns" :data="tableColumnDataPage">
        </Table>
        <div style="margin: 10px; overflow: hidden">
          <div style="float: right; margin: 5px">
            <Page
              style="margin-bottom: 20px"
              size="small"
              show-sizer
              show-elevator
              show-total
              placement="top"
              :page-size-opts="columnPageSizeOpts"
              :pageSize="columnPageSize"
              :total="detectTableColumn.length"
              :current="currentColumnPage"
              @on-change="changeColumnPage"
              @on-page-size-change="changeColumnPageSize"></Page>
          </div>
        </div>

      </Modal>

    <!-- 删除实体类 -->
    <Modal
      v-model="deleteExtConfirm"
      title="实体类删除"
      >
      <p>确定要删除这个实体类吗?</p>
      <br>
      <Checkbox v-model="extcascade">级联删除与此实体类关联的关联类、属性、表单、授权项(<span style="color: orangered">请谨慎选择</span>)</Checkbox>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="deleteExtConfirm = false">取消</Button>
        <Button type="primary" size="large" :loading="deleteExtLoading" @click="deleteExtOnOk">确认</Button>
      </div>
    </Modal>

    <!-- 引入实体类 和 编辑实体类 -->
    <!-- 通过 importModalState 区分创建和编辑 -->
    <Modal
            v-model="importModal"
            :title="importModalState === 'importing' ? '引入外部实体类' : '编辑实体类'"
            id="createExternalEntityModal"
            width="75%"
            :mask-closable="false"
            @on-cancel="cancelImport"
    >
      <Spin fix v-show="importModalLoading"></Spin>
      <Form ref="importExternalEntityForm" :model="externalEntityData" :rules="externalEntityValidate" inline>
        <FormItem label="数据源" prop="dataSourceOid" style="width: 23%;">
          <Input v-model="externalEntityData.dataSourceName" disabled></Input>
        </FormItem>
        <FormItem label="Schema" prop="schema" style="width: 23%;">
          <Input v-model="externalEntityData.schema" disabled></Input>
        </FormItem>
        <FormItem label="数据库表" prop="zoneName" style="width: 23%;">
          <Input v-model="externalEntityData.zoneName" disabled></Input>
          
        </FormItem>
        <FormItem label="英文名" prop="className" style="width: 23%;">
          <Input v-model="externalEntityData.className" placeholder="输入英文名" :disabled="importModalState==='editing'" id="createExternalEntityModalClassName"></Input>
        </FormItem>
        <FormItem label="显示名" prop="displayName" style="width: 23%;">
          <Input v-model="externalEntityData.displayName" placeholder="输入显示名" id="createExternalEntityModalDisplayName"></Input>
        </FormItem>
        <FormItem label="主键" prop="primaryKey" style="width: 23%;">
          <Select v-model="externalEntityData.primaryKey" placeholder="选择主键列" filterable clearable :disabled="importModalState==='editing'" id="createExternalEntityModalPrimaryKey">
            <Option v-for="item in externalEntityKeyCols" :value="item.attributeName" :key="item.attributeName">{{ item.attributeName }}</Option>
          </Select>
        </FormItem>
      </Form>
      <Form>
        <FormItem label="导入属性列">
          <Select v-model="selectedAttributes" filterable multiple :disabled="externalEntityData.zoneName === '' || externalEntityData.zoneName === undefined" @on-change="changeAttr" id="createExternalEntityModalSelectedAttributes">
            <Option v-for="item in externalEntityColsData" :value="item.attributeName" :key="item.attributeName" :label="item.attributeName">{{ item.attributeName }}</Option>
          </Select>
        </FormItem>
      </Form>
      <Table
              id="createExternalEntityModalSelectedAttributesTable"
              border
              :columns="attrColumns"
              :data="externalEntityColsDataFiltered"
              size="small"></Table>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="cancelImport">取消</Button>
        <Button type="primary" size="large" @click="confirmImport" id="confirmCreateExternalEntityButton">确认</Button>
      </div>
    </Modal>

    <!-- 查看对象 -->

    <Modal
      width="1200"
      v-model="viewObjectsModal"
      title="查看对象"
      scrollable
      :mask-closable="false"
      id="viewObjectsModal"
    >
      <div style="clear: both; margin: 10px">
        <Row>
          <Input v-model="filterQuery" type="textarea" style="width: 90%;margin-left: 5px;" placeholder="输入过滤条件" :autosize="true" @on-focus="inputQuery" id="searchObjectInput"></Input>
          <Button type="primary" @click="searchObj" style="margin-left: 15px;">查询</Button>
        </Row>
        <Table style="margin: 5px;"
                width="1100"
                height="450"
                :loading="objectsDataloading"
                stripe
                border
                show-header
                highlight-row
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
            :current="objectsCurrentPage"
            @on-change="objectsChangePage"
            @on-page-size-change="objectsChangePageSize"></Page>
        </div>
      </div>
      <div slot="footer">
        <i-button type="primary" size="large" @click="viewObjectsModal = false" id="confirmViewObjectsModalButton">确认</i-button>
      </div>
    </Modal>

    <!-- 查询语句 -->
    <FilterQueryCommonModal
      :refClass="currentExtClass.className"
      :targetClass="currentExtClass.className"
      ref="filterQuery_modal"
      :store="store"
      @generatorFilterQuery="getFilterQuery">
    </FilterQueryCommonModal>
  </div>
</template>

<script>
import { tableMixin } from "@/component/tableMixin";
import EntityModeling from "@/api/data-model/EntityModeling";
import RelationModeling from "@/api/data-model/RelationModeling";
import ResourceModeling from "../../api/data-model/ResourceModeling";
import { uuid, clone } from "@/util/assist";
import {encode64, randomStr} from "../../libs/utils";
import {
  getAllDataSources, 
  getAllDataSourcesByIp, 
  createDataSource,
  updateDataSource,
  getDataSource,
  deleteDataSource,
  getDataSourceConnectionState,
  getTables,
  getColumns,
  getExtClass, 
  checkExtClass,
} from "@/api/data-model/DataService";
import { getEobj, getEntityObjCount } from "../../api/others";
import FilterQueryCommonModal from '@/ext_components/form/subcomponent/FilterQueryCommonModal'
import { Tooltip } from 'iview';

const isEmpty = (str) => {
  return str === undefined || str === null || str.trim() === "";
};

export default {
  name: "data-intergate",
  props: ["store"],
  components: {
    FilterQueryCommonModal
  },
  data() {
    const validateServerPort = (rule, value, callback) => {
      if (value === undefined || value === null || value === '') {
        callback(new Error('服务器端口不能为空'));
      } else {
        callback();
      }
    };
    const defaultDataSource = "默认PG数据源";
    return {
      stepStatus: 0,
      showTablePanel: false,
      showClassPanel: false,
      dataLinkKeyword: '',
      tableKeyWord: '',
      classKeyword: '',
      allStatuses: {},
      editRowStatus: 'add',
      editRowModal: false,
      editRowData: {},
      editRowModalLoading: false,
      deleteConfirm: false,
      cascade: false,
      deleteModalLoading: false,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      currentTablePage: 1,
      tablePageSize: 10,
      linkAllData: [
      ],
      buttonProps: {
        type: 'default',
        size: 'small',
      },
      allTables: [
      ],
      tableColumn: [
        {
          title: '序号',
          type: 'index',
          width: 65,
          algin: 'center',
        },
        {
          title: '数据表',
          key: 'tableName',
        },
        {
          title: '数据模式',
          key: 'schemaName',
        }, {
          title: '操作',
          slot: 'action',
          algin: 'center',
        }
      ],
      classColumn: [
        {
          title: '序号',
          type: 'index',
          width: 65,
          algin: 'center',
        },
        {
          title: '英文名',
          key: "className",
        },
        {
          title: '显示名',
          key: 'displayName',
        }, {
          title: '操作',
          slot: 'action',
          algin: 'center',
        }
      ],
      allExtClass: [],
      rowValidate: {
        dataSourceName: [
          { required: true, message: "数据连接名不能为空", trigger: "blur" },
          {
            pattern: /^[A-Za-z][A-Za-z0-9]{0,31}$/,
            message: "只能包含字母和数字，并以字母开头，长度不超过32个字符",
            trigger: "blur"
          }
        ],
        displayName: [
          { required: true, message: "数据连接显示名不能为空", trigger: "blur" },
          {
            // pattern: /^[a-zA-Z0-9_\-/.\u0391-\uFFE5]+$/,
            // message: "数据连接名称只能包含汉字、字母、数字、_、-、/或.",
            pattern: /^\S{1,32}$/,
            message: "显示名长度不超过32个字符",
            trigger: "blur"
          }
        ],
        dataSourceType: [
          { required: true, message: "数据连接类型不能为空"}
        ],
        serverIp: [
          { required: true, message: "服务器地址不能为空", trigger: "blur" }
          // {
          //   pattern: /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/,
          //   message: "服务器IP应形为xxx.xxx.xxx.xxx，且每段为0~255间的整数",
          //   trigger: "blur"
          // }
        ],
        serverPort: [
          { required: true, validator: validateServerPort, trigger: "blur" }
          // { required: true, message: "服务器端口不能为空", trigger: "blur" },
          // {
          //   pattern: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
          //   message: "服务器端口应为0-65535之间的整数",
          //   trigger: "blur"
          // }
        ],
        userName: [
          { required: true, message: "登录用户名不能为空", trigger: "blur" },
          {
            pattern: /^[A-Za-z][a-zA-Z0-9_\-\#]+$/,
            message: "登录用户名只能包含字母、数字_、-或#，并以字母开头",
            trigger: "blur"
          }
        ],
        // password: [
        //   { required: true, message: "密码不能为空"}
        // ],
        dataBaseName: [
          { required: true, message: "数据库名称不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9_\-/.\#\u0391-\uFFE5]+$/,
            message: "数据库名称只能包含汉字、字母、数字、_、-、/、.或#",
            trigger: "blur"
          }
        ],
        dataBaseVersion: [
          {required: true, message: "数据库版本不能为空", trigger: "blur" },
        ],
        paramOne: [
          {
            pattern: /^\d+$/,
            message: "参数One应为非负整数",
            trigger: "blur"
          }
        ]
      },
      allDataSourceTypes: [
        // "HDFS_FS",
        // "LOCAL_FS",
        // "HDFS",
        // "LOCAL_FILE",
        // "HDFS_FOLDER_FILE",
        // "LOCAL_FOLDER_FILE",
        // "HDFS_CSV_DIR",
        "MYSQL",
        "POSTGRESQL",
        "SQLSERVER",
        // "DB2",
        "ORACLE",
        // "HIVE",
        // "HBASE",
        // "KAFKA",
        // "REDIS",
        // "PARATSDB",
        "IOTDB"
      ],
      dataVersions: {
        SQLSERVER: ['2012'],
        IOTDB: ['0.9', '0.11']
      },
      tableloading: false,
      showTableColumn: false,
      columnLoading: false,
      columnColumns: [
          {
              title: '序号',
              type: 'index'
          },
          {
              title: '列名',
              key: 'columnName'
          },
          {
              title: '数据类型',
              key: 'dataType'
          },
          // {
          //     title: '长度',
          //     key: 'length'
          // }
      ],
      detectTableColumn: [],
      columnPageSizeOpts: [10, 25, 50, 100, 200, 500],
      currentColumnPage: 1,
      columnPageSize: 10,
      extPageSizeOpts: [10, 25, 50, 100, 200, 500],
      extPageSize: 10,
      currentExtPage: 1,
      deleteExtConfirm: false,
      extcascade: false,
      deleteExtLoading: false,
      externalEntityData:{
        className : '',
        zoneName : '',
        displayName : '',
        primaryKey: '',
        packagePath : {}   // 存储的是列英文名到中文名的字典，及需要引入的属性列表
      },
      importModalState: '',
      importModal: false,
      externalEntityColsDataFiltered: [],
      externalEntityColsData: [],
      externalEntityKeyCols: [],
      selectedAttributes: [],
      // reFitem: false,
      defaultDataSource: defaultDataSource,
      importModalLoading: false,
      externalEntityValidate: {
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
            message: "显示名长度不超过32个字符",
            trigger: "blur"
          }
        ],
        primaryKey: [
          { required: true, message: "主键不能为空"}
        ]
      },
      attrColumns:[
        {
          title: "序号",
          type: "index",
          width: 100,
          align: "center"
        },
        {
          title: "列名",
          key: "attributeName",
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
          render: (h, params) => {
            return h("div", [
              h("Input", {
                props: {
                  type: "text",
                  value: this.externalEntityData.packagePath[
                    params.row.attributeName
                    ]
                },
                on: {
                  "on-change": event => {
                    if(event.target.value.length > 32) {
                      this.$Message.error('显示名不能超过32个字符');
                      this.$nextTick(() => {
                        event.target.value = event.target.value.substr(0, 32);
                        this.externalEntityData.packagePath[params.row.attributeName] = event.target.value.substr(0, 32);
                      })
                    }else{
                      this.$nextTick(() => {
                        this.externalEntityData.packagePath[params.row.attributeName] = event.target.value.substr(0, 32);
                      })
                    }
                  }
                }
              })
            ]);
          }
        },
        {
          title: "数据类型",
          key: "valueType",
          tooltip: true
        },
      ],

      // 查看对象
      viewObjectsModal: false,
      filterQuery: '',
      objectsDataloading: false,
      objectsData: [],
      objectsDataCount: 0,
      objectsDataColumns: [],
      objectsCurrentPage: 1,
      objectsPageSize: 10,
      extClassTableLoding: false,


      // 当前选择外部实体类
      currentExtClass: {},
      // 当前选择连接
      deleteLink: {},
      selectLink:{
        ipname: '',
        servername: ''
      },
      // 当前选择表
      selectTable: {
        name: ''
      },
      globalLoading: false,
      
    };
  },
  created() {
    this.getAllRows();
  },
  computed: {
    editRowModalTitle() {
      return this.editRowStatus === "add" ? "新增数据连接" : "编辑数据连接";
    },
    versionRequire() {
      return this.editRowData && (this.editRowData.dataSourceType=='SQLSERVER' || this.editRowData.dataSourceType== 'IOTDB')
    },
    serviceNameRequire(){
      return this.editRowData && (this.editRowData.dataSourceType=='ORACLE')
    },
    databaseNotRequire(){
      return this.editRowData && (this.editRowData.dataSourceType=='ORACLE' || this.editRowData.dataSourceType=='IOTDB')
    },
    // 查询连接
    filteredLinkData() {
      let keywordLower = this.dataLinkKeyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      let l = this.linkAllData.length;
      for (let i = 0; i < l; ++i) {
        let children = [];
        for (let j = 0; j < this.linkAllData[i].children.length; j++) {
          let data = this.linkAllData[i].children[j];
          for (let key in data) {
            if(key == 'serverIp' || key == 'dataSourceName' || key == 'displayName')
              if (
                data[key]
                  .toString()
                  .toLowerCase()
                  .match(keywordLower) !== null
              ) {
                children.push(data);
                break;
              }
          }
        }
        if (children.length > 0) {
          res.push({
            name: this.linkAllData[i].name,
            ip: true,
            expand: true,
            children: children
          })
        }
      }
      return res;
    },
    // 查询数据表
    filteredTableData() {
      let keywordLower = this.tableKeyWord.toLowerCase().trimStart().trimEnd();
      let res = [];
      this.allTables.forEach((data) => {
        for (let key in data) {
          if(key == 'schemaName' || key == 'tableName')
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
      })
      return res;
    },
    // 查询实体类
    filteredExtClassData() {
      let keywordLower = this.classKeyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      this.allExtClass.forEach((data) => {
        for (let key in data) {
          if(key == 'className' || key == 'displayName')
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
      })
      return res;
    },
    tableDataPage() {
      return this.filteredTableData.slice(
        this.currentTablePage * this.tablePageSize - this.tablePageSize,
        this.currentTablePage * this.tablePageSize
      );
    },
    extClassDataPage() {
      return this.filteredExtClassData.slice(
        this.currentExtPage * this.extPageSize - this.extPageSize,
        this.currentExtPage * this.extPageSize
      )
    },
    tableColumnDataPage() {
      return this.detectTableColumn.slice(
        this.currentColumnPage * this.columnPageSize - this.columnPageSize,
        this.currentColumnPage * this.columnPageSize
      );
    },
  },
  watch: {
    'editRowData.dataSourceType'() {
      if (this.editRowStatus === "add") {
        if (this.editRowData.dataSourceType=='SQLSERVER') {
          this.editRowData.dataBaseVersion= '2012'
        }
        else if (this.editRowData.dataSourceType== 'IOTDB')
        this.editRowData.dataBaseVersion ='0.9';
      }
    }
  },
  methods: {
    
    globalRefresh() {
      this.getAllRows(true);
    },
    renderContent (h, { root, node, data }) {
      return <div style="display: inline-block; width: 100%;">
      <Badge v-show={!data.ip} status={data.status === 0 ? 'default' : data.status === 1 ? 'processing' : data.status === 2 ? 'success' : 'error'} />
      {data.name}
        <span style="float:right;margin-right:8px">
        <Tooltip content = "编辑" transfer>
          <i-button id="editLink" v-show={!data.ip} icon={"md-create"} size={"small"}
                      onClick={this.editLink.bind(this, data)}
                      style={"margin-right:8px"}/>
        </Tooltip>
        <Tooltip content = "探测" transfer>
          <i-button id="getTable" v-show={!data.ip} icon={"ios-locate-outline"} size={"small"}
                      onClick={this.getAllTables.bind(this, data, node, root)}
                      style={"margin-right:8px"}/>        
        </Tooltip>
        <Tooltip content = "删除" transfer>
          <i-button id="deleteLink" v-show={!data.ip} icon={"md-remove"} size={"small"}
                      onClick={this.removeDataLink.bind(this, data)}
                      style={"margin-right:8px"}/>
        </Tooltip>
        <Tooltip content = "测试连接" transfer>
          <i-button id="testSingleDataLinkButton" v-show={!data.ip} icon={"ios-link"} size={"small"}
                      onClick={this.onClickTestSingleConnection.bind(this, data)}
                      style={"margin-right:8px"}/>
        </Tooltip>
        </span>
      </div>

    },
    getAllRows(flag) {
      console.log('get all rows')
      if (!flag) {
        this.selectLink = {};
      }
      this.deleteLink = {};
      this.globalLoading = true;
      getAllDataSourcesByIp().then(res => {
        console.log(res)
        this.globalLoading = false;
        let ipnames = Object.keys(res.data);
        let alldata = [];
        console.log(" datasource by ip res.data",res.data)
        for (let i = 0; i < ipnames.length; i ++) {
          if (!ipnames[i]) continue;
          alldata.push({
            name: ipnames[i],
            ip: true,
            expand: true,
            children: res.data[ipnames[i]].filter(row => {
                  return row.dataSourceType != "IOTDB" && row.dataSourceName != "异构数据源";
              }).map( row => {
              return {
                ...row,
                name: row.displayName,
                status: 0,
                statusTxt: '未测试'
              };
            })
          })
        }
        this.linkAllData = alldata;
        console.log(alldata)
        this.allStatuses = {};  // clear connection status list
      })
      .catch(err => {
        this.globalLoading = false;
      });
    },
    // 新增连接窗口
    onClickAddRow() {
      this.stepStatus = 0;
      this.editRowStatus = "add";
      this.editRowData = { serverPort: 1234 };
      this.$refs.editRowForm.resetFields();
      this.editRowModal = true;

    },
    // 编辑连接
    onConfirmEditRow() {
      if (this.editRowStatus === "add") {
        this.addRow();
      } else {
        this.editRow();
      }
    },
    // 确定新增连接
    addRow() {
      console.log('add rows', createDataSource)
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;
          if(this.editRowData.password){
            this.editRowData.password = `${randomStr(3)}${encode64(this.editRowData.password)}${randomStr(5)}`
          }else{
            delete this.editRowData.password
          }
          console.log(valid)
          createDataSource(this.editRowData)
            .then(res => {
              this.getAllRows(true);
              this.editRowModalLoading = false;
              this.editRowModal = false;
              this.$Message.success("新增数据连接成功");
            })
            .catch(error => {
              //没安装fdw成功的错误可以允许返回
              if(error.indexOf("类型的数据连接适配器") != -1){
                this.getAllRows(true);
                this.editRowModal = false;
                this.editRowModalLoading = false;
              }
              else{
                this.editRowModalLoading = false;
              }
            });
        } else {
          this.editRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    // 确定编辑连接
    editRow() {
      console.log('edit', this.editRowData)
      this.$refs["editRowForm"].validate(valid => {
      console.log(valid)
        if (valid) {
          this.editRowModalLoading = true;
          console.log(this.editRowData.password)
          if(this.editRowData.password){
            this.editRowData.password = `${randomStr(3)}${encode64(this.editRowData.password)}${randomStr(5)}`
          }else{
            delete this.editRowData.password
          }
          console.log(this.editRowData.password)
          getDataSource(this.editRowData.oid)
            .then(res => {
              console.log(res)
              updateDataSource(this.editRowData)
                .then(res => {
                console.log(res)
                  this.getAllRows(true);
                  this.editRowModalLoading = false;
                  this.editRowModal = false;
                  this.$refs["editRowForm"].resetFields();
                  this.$Message.success("更新数据连接成功");
                })
                .catch(error => {
                  //没安装fdw成功的错误可以允许返回
                  if(error.indexOf("类型的数据连接适配器") != -1){
                    this.getAllRows(true);
                    this.editRowModal = false;
                    this.editRowModalLoading = false;
                    this.$refs["editRowForm"].resetFields();
                  }
                  else{
                    this.editRowModalLoading = false;
                  }
                });
            })
            .catch(error => {
              console.log(err, 'get source')
              this.editRowModalLoading = false;
            });
        } else {
          this.editRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    // 取消置空
    cancelModal() {
      this.deleteLink = {};
      this.$refs.editRowForm.resetFields();
      this.editRowModal = false;
    },
    // 确定删除连接
    deleteRowOnOk() {
      this.deleteModalLoading = true;
      var flagDeleteOid = this.deleteLink.oid;
      console.log("this.cascade",this.cascade)
      deleteDataSource(this.deleteLink.oid, this.cascade)
        .then(res => {
          this.getAllRows(true);
          this.deleteModalLoading = false;
          this.deleteConfirm = false;
          this.$Message.success("删除数据连接成功");
          //如果删除的是当前选择的数据连接，则更新页面 
          if(flagDeleteOid== this.selectLink.oid){
            this.showTablePanel = false;
            this.showClassPanel = false;
          }
        })
        .catch(error => {
          //没安装fdw成功的错误可以允许返回
          this.deleteModalLoading = false;
          this.deleteConfirm = false;
        });
    },
    // 测试所有连接
    onClickTestAllConnection() {
      this.stepStatus = 0;
      let l = this.linkAllData.length;
      for (let i = 0; i < l; ++i) {
        for (let j = 0; j < this.linkAllData[i].children.length; j++) {
          this.linkAllData[i].children[j].status = 1;
          this.linkAllData[i].children[j].statusTxt = '连接中';
          this.allStatuses[this.linkAllData[i].children[j].oid] = 1;
        }
      }
      for (let i = 0; i < l; ++i) {
        // 0: default, 1: processing, 2: success, 3: error
        for (let j = 0; j < this.linkAllData[i].children.length; j++) {
          getDataSourceConnectionState(this.linkAllData[i].children[j].oid)
            .then(res => {
              this.linkAllData[i].children[j].status = 2;
              this.linkAllData[i].children[j].statusTxt = '成功';
              this.allStatuses[this.linkAllData[i].children[j].oid] = 2;
            })
            .catch(error => {
              this.linkAllData[i].children[j].status = 3;
              this.linkAllData[i].children[j].statusTxt = '失败';
              this.allStatuses[this.linkAllData[i].children[j].oid] = 3;
            });
        }
      }

    },
    // 测试单个连接
    onClickTestSingleConnection(row) {
      console.log("row:",row)
      row.status = 1;
      row.statusTxt = '连接中';
      this.allStatuses[row.oid] = 1;
      getDataSourceConnectionState(row.oid)
        .then(res => {
          row.status = 2;
          row.statusTxt = '成功';
          this.allStatuses[row.oid] = 2;
          this.$Message.success("数据源连接成功");
        })
        .catch(error => {
          row.status = 3;
          row.statusTxt = '失败';
          this.allStatuses[row.oid] = 3;
        });

    },
    // 删除连接弹框
    removeDataLink(row) {
      this.stepStatus = 0;
      this.cascade = false;
      this.deleteConfirm = true;
      this.deleteLink = {...row};
    },
    // 编辑连接弹框
    editLink(row) {
      this.stepStatus = 0;
      this.editRowStatus = "edit";
      this.$refs.editRowForm.resetFields();
      console.log("edit row list",row);
      if((row.displayName === undefined || row.displayName === '') 
          && row.dataSourceName != undefined && row.dataSourceName != ''){
        row.displayName = row.dataSourceName;
        row.dataSourceName = "undefined";
      }
      this.editRowData = {...row};
      this.editRowModal = true;

    },
    // 搜索连接
    searchDataLinkKeyword() {
      this.stepStatus  = 0;
      this.deleteLink = {};

    },
    changeTablePage(pageId) {
      this.currentTablePage = pageId;
    },
    changeTablePageSize(pageSize) {
      this.tablePageSize = pageSize;
    },
    changeExtPage(pageId) {
      this.currentExtPage = pageId;
    },
    changeExtPageSize(pageSize) {
      this.extPageSize = pageSize;
    },
    changeColumnPage(pageId) {
      this.currentColumnPage = pageId;
    },
    changeColumnPageSize(pageSize) {
      this.columnPageSize = pageSize;
    },
    // 输入搜索数据表关键词
    searchTable(row) {
      this.stepStatus  = 1;
      this.currentTablePage = 1;
    },
    // 输入搜索实体类的关键词
    searchExtClass() {
      this.stepStatus  = 2;
      this.currentExtPage = 1;
    },
    // 获取所有数据表
    getAllTables(row, node, root) {
      // console.log(row, node, root)
      this.showTablePanel = true;
      this.showClassPanel = false;
      this.stepStatus = 1;
      this.currentTablePage = 1;
      this.selectLink = {...row};
      this.selectLink.ipname = root[node.parent].node.name;
      this.selectLink.servername = row.name;
      this.allTables = [];
      this.freshAllTables(row);
    },
    // 刷新数据表
    freshAllTables(row) {
      console.log('refresh tables')
      this.tableloading = true;
      getTables(row.oid).then(res => {
        this.tableloading = false;
        this.allTables = res.data;
        // console.log(res.data)
      })
      .catch(error => {
        this.tableloading = false;
      });

    },
    // 展示数据表下的列
    showTableDetail(row, index, e) {
      e.stopPropagation();
      this.showTableColumn = true;
      this.currentColumnPage = 1;
      console.log(this.selectTable.tableName)
      if (!this.selectTable.tableName || this.selectTable.tableName != row.tableName) {
        this.showExtClass(row);
      }
      getColumns(this.selectLink.oid, row.schemaName, row.tableName)
        .then(res => {
          console.log(res.data);
          this.detectTableColumn = res.data;
        })
        .catch(err => {
          console.log(err)
        })
        this.stepStatus  = 1;

    },
    // 获取所有实体类
    showExtClass(row, index) {
      console.log('show ext class', row)
      this.showClassPanel = true;                        
      this.currentExtPage = 1;
      this.stepStatus = 2;
      this.selectTable = {... row};
      this.freshExtClass();
    },
    // 刷新实体类
    freshExtClass() {
      // TODO: 获取所有外部实体类
      // 跟新 allExtClass
      this.extClassTableLoding = true;
      getExtClass(this.selectLink.oid, this.selectTable.schemaName, this.selectTable.tableName)
        .then( res => {
          this.allExtClass = res.data;
          this.extClassTableLoding = false;
        })
        .catch(err => {
          console.log(err)
          this.extClassTableLoding = false;
        })
    },
    // 打开引入外部实体类弹框
    onClickImportExtButton(row, e) {
      e.stopPropagation();
      this.$refs["importExternalEntityForm"].resetFields();
      // this.reFitem = true;
      this.externalEntityColsDataFiltered = [];
      if (!this.selectTable.tableName || this.selectTable.tableName != row.tableName) {
        this.showExtClass(row);
      }
      this.stepStatus  = 1;
      this.importModalState = "importing";
      this.importModal = true;
      this.externalEntityColsData = [];
      this.externalEntityKeyCols = [];
      this.selectedAttributes = [];
      checkExtClass(this.selectLink.oid, this.selectTable.schemaName, this.selectTable.tableName )
        .then(res => {
          console.log("show return res data",res.data);
          this.externalEntityData = {...res.data};
          this.externalEntityData.schemaName = this.selectTable.schemaName;
          var primaryKeyTmp = res.data.primaryKey;
          if(primaryKeyTmp != undefined && primaryKeyTmp != ''){
            primaryKeyTmp = primaryKeyTmp.toLowerCase();//统一成小写
          }
          console.log("primaryKeyTmp",primaryKeyTmp);
          this.externalEntityData.primaryKey = primaryKeyTmp;
          if (res.data.dataSourceOid === undefined || res.data.dataSourceOid === "") {
            this.externalEntityData.dataSourceOid = this.defaultDataSource;
            this.externalEntityData.dataSourceName = this.defaultDataSource;
          }
          else {
            this.externalEntityData.dataSourceName = '异构数据源';
          }
          this.externalEntityData.packagePath = {};
          this.externalEntityColsData = [];
          let zoneName = '';
          let zoneNameDisplay = '';
          if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {

            this.externalEntityData.schema = 'public';
            zoneName = this.externalEntityData.zoneName;
            zoneNameDisplay = this.externalEntityData.zoneName;

          } else {

            let dbPreSchema = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName.split('.')[0] : 'public';
            zoneNameDisplay = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName.split('.')[1] : this.externalEntityData.zoneName;
            zoneName = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName : `public.${this.externalEntityData.zoneName}`;
            this.externalEntityData.schema = dbPreSchema;
          }
          if (zoneName === undefined || zoneName === '') return;
          this.externalEntityData.zoneName = zoneNameDisplay;
          let ps = [];
          this.selectedAttributes = [];
          if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {
            ps.push(EntityModeling.getColumnsDetailsOfDbTable(zoneName).then(res => {
              this.externalEntityColsData = res.data;
              if (importAttrKey in this.externalEntityData.packagePath) {
                this.selectedAttributes = this.externalEntityData.packagePath[importAttrKey];
              } else {
                this.selectedAttributes = [];
              }
              this.externalEntityColsDataFiltered = this.externalEntityColsData.filter(item => {
                return this.selectedAttributes.indexOf(item.attributeName) != -1;
              })
              if('primaryKey' in this.externalEntityData) {
                this.externalEntityKeyCols = [...this.externalEntityColsData];
              } else {
                this.externalEntityKeyCols = [...res.data].filter(i => {
                  return i.isPrimaryKey == true || (primaryKeyTmp != undefined && primaryKeyTmp != '' && i.attributeName.toLowerCase() == primaryKeyTmp);
                })
                this.externalEntityKeyCols = [...res.data].filter(i => {
                  return (i.valueType == 'String' || i.valueType == 'Integer'|| i.valueType == 'UUID' || i.valueType == 'GUID');
                })
              }
              this.externalEntityKeyCols.forEach(val => {
                if(val.isPrimaryKey === true && (this.externalEntityData.primaryKey == '' || this.externalEntityData.primaryKey == undefined)) {
                  this.externalEntityData.primaryKey = val.attributeName;
                }
              })
            }));
          } else {
            let preSchema = `${this.externalEntityData.schema}.${event}`;
            EntityModeling.getColumnsDetailsOfExtTable(this.externalEntityData.dataSourceOid, zoneName).then(res => {
              this.externalEntityColsData = res.data;
              this.selectedAttributes = [];
              this.externalEntityColsDataFiltered = this.externalEntityColsData.filter(item => {
                return this.selectedAttributes.indexOf(item.attributeName) != -1;
              })
              this.externalEntityKeyCols = res.data.filter(i => {
                return i.isPrimaryKey == true || (primaryKeyTmp != undefined && primaryKeyTmp != '' && i.attributeName.toLowerCase() == primaryKeyTmp);
              })
              //增加筛选可成为主键的属性
              this.externalEntityKeyCols = this.externalEntityColsData.filter(i => {
                return (i.attributeName.toLowerCase() == primaryKeyTmp || i.valueType == 'String' || i.valueType == 'Integer'|| i.valueType == 'UUID' || i.valueType == 'GUID');
              })
              this.externalEntityKeyCols.forEach(val => {
                //原来的表的key为空，则把查出来的key是真的赋值给主键
                if((val.isPrimaryKey === true )&& (this.externalEntityData.primaryKey == '' || this.externalEntityData.primaryKey == undefined)) {
                  this.externalEntityData.primaryKey = val.attributeName;
                }
              })
            });
          }
          Promise.all(ps).then(res => {
            this.importModalLoading = false;
          }).catch(error => {
            this.importModalLoading = false;
          });
        })
        .catch(err => {
          console.log(err);
          this.$Message.error(err);
        })

    },
    // 确认引入
    confirmImport() {
        let form;
        this.preDbClick = true;
        form = this.$refs["importExternalEntityForm"];
        form.validate(valid => {
          if (valid) {
            let importAttrKey = `${this.externalEntityData.dataSourceOid}__attributes`;
            let isHasKey = this.externalEntityData.primaryKey;
            if(this.selectedAttributes.indexOf(isHasKey) == -1) {
              this.selectedAttributes.push(this.externalEntityData.primaryKey)
            }
            this.externalEntityData.packagePath[importAttrKey] = this.selectedAttributes;
            let entityData = {
              ...this.externalEntityData
            };
            entityData.packagePath = JSON.stringify(
              this.externalEntityData.packagePath
            );
            entityData.classCategory = "ExternalItemClass";
            entityData.classType = "PersistentClass";
            entityData.parentClass = "IdItem";
            if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {
              entityData.dataSourceOid = "";
            } else {
              if(entityData.zoneName.indexOf('.') == -1) {
                entityData.zoneName = `${entityData.schema}.${entityData.zoneName}`;
              }
            }
            if (this.importModalState === "importing") {
              EntityModeling.createEntities([entityData])
                .then(res => {
                  this.$Message.success("引入成功");
                  this.currentExtPage = 1;
                  this.freshExtClass();
                  this.importModal = false;
                  this.$refs["importExternalEntityForm"].resetFields();
                })
                .catch(error => {
                  this.$Message.error(error.response.data.message);
                });
            } else if (this.importModalState === "editing") {
              EntityModeling.updateEntity(entityData)
                .then(res => {
                  this.$Message.success("更新成功");
                  this.freshExtClass();
                  this.importModal = false;
                  this.$refs["importExternalEntityForm"].resetFields();
                })
                .catch(error => {
                  this.$Message.error(error.response.data.message);
                });
            }
          } else {
            this.$Message.error("请检查输入是否正确");
          }
        });
    },
    // 取消引入
    cancelImport() {
      this.importModal = false;
      // this.reFitem = false;
      this.$refs["importExternalEntityForm"].resetFields();
      this.externalEntityColsDataFiltered = [];
    },
    // 修改属性
    changeAttr(v) {
      this.externalEntityColsDataFiltered = this.externalEntityColsData.filter(item => {
        return this.selectedAttributes.indexOf(item.attributeName) != -1;
      })
    },
    // 删除外部实体类
    removeExtClass(row, index) {
      this.stepStatus  = 2;
      this.currentExtClass = {... row};
      this.extcascade = false;
      this.deleteExtConfirm = true;

    },
    // 确认删除
    deleteExtOnOk() {
      this.deleteExtLoading = true;
      let className = this.currentExtClass.className;
      let backwardCount = 0;
      let forwardCount = 0;
      let promises = [];
      if (!this.extcascade) {
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
          this.deleteExtLoading = false;
          this.deleteExtConfirm = false;
        } else {
          let ps = [];
          if (this.extcascade) {
            ps.push(EntityModeling.deleteProcess(className));
          }
          ps.push(EntityModeling.deleteEntity(className, this.extcascade));
          Promise.all(ps)
            .then(res => {
              this.freshExtClass();
              if (
                this.allExtClass.length - 1 ===
                this.extPageSize * (this.currentExtPage - 1) &&
                this.allExtClass.length !== 1
              )
              this.changeExtPage(this.currentExtPage - 1);
              this.deleteExtLoading = false;
              this.deleteExtConfirm = false;
              this.$Message.success("删除实体类成功");
            })
            .catch(error => {
              this.deleteExtLoading = false;
              this.deleteExtConfirm = false;
            });
        }
      });

    },
    // 编辑实体类
    editExtClass(row, index) {
        this.stepStatus  = 2;
        this.importModalState = "editing";
        this.importModal = true;
        this.externalEntityData = {...row};
        if (row.dataSourceOid === undefined || row.dataSourceOid === "") {
          this.externalEntityData.dataSourceOid = this.defaultDataSource;
          this.externalEntityData.dataSourceName = this.defaultDataSource;
        }
        else {
          this.externalEntityData.dataSourceName = this.selectTable.serverIp;
        }
        this.externalEntityData.packagePath = JSON.parse(row.packagePath);
        let importAttrKey = `${this.externalEntityData.dataSourceOid}__attributes`;

        this.importModalLoading = true;
        this.externalEntityColsData = [];
        let promises = [];
        let zoneName = '';
        let zoneNameDisplay = '';
        if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {

          this.externalEntityData.schema = 'public';
          zoneName = this.externalEntityData.zoneName;
          zoneNameDisplay = this.externalEntityData.zoneName;

        } else {

          let dbPreSchema = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName.split('.')[0] : 'public';
          zoneNameDisplay = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName.split('.')[1] : this.externalEntityData.zoneName;
          zoneName = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName : `public.${this.externalEntityData.zoneName}`;
          this.externalEntityData.schema = dbPreSchema;
        }
        Promise.all(promises).then(res => {
          this.externalEntityData.zoneName = zoneNameDisplay;
          // if (this.allTables.indexOf(zoneName) < 0) {
          //   this.$Message.error('非法数据库表名');
          //   this.importModalLoading = false;
          //   return;
          // }
          if (zoneName === undefined || zoneName === '') return;
          let ps = [];
          this.selectedAttributes = [];
          if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {
            ps.push(EntityModeling.getColumnsDetailsOfDbTable(zoneName).then(res => {
              this.externalEntityColsData = res.data;
              if (importAttrKey in this.externalEntityData.packagePath) {
                this.selectedAttributes = this.externalEntityData.packagePath[importAttrKey];
              } else {
                this.selectedAttributes = [];
              }
              this.externalEntityColsDataFiltered = this.externalEntityColsData.filter(item => {
                return this.selectedAttributes.indexOf(item.attributeName) != -1;
              })
              if('primaryKey' in this.externalEntityData) {
                this.externalEntityKeyCols = [...this.externalEntityColsData];
              } else {
                this.externalEntityKeyCols = [...res.data].filter(i => {
                  return i.isPrimaryKey == true;
                })
                if(!this.externalEntityKeyCols || this.externalEntityKeyCols.length == 0) {
                  this.externalEntityKeyCols = [...res.data].filter(i => {
                    return (i.valueType == 'String' || i.valueType == 'Integer'|| i.valueType == 'UUID' || i.valueType == 'GUID');
                  })
                }
              }
              this.externalEntityKeyCols.forEach(val => {
                if(val.isPrimaryKey === true && (this.externalEntityData.primaryKey == '' || this.externalEntityData.primaryKey == undefined)) {
                  this.externalEntityData.primaryKey = val.attributeName;
                }
              })
            }));
          } else {
            ps.push(EntityModeling.getColumnsDetailsOfExtTable(this.externalEntityData.dataSourceOid, zoneName).then(res => {
              this.externalEntityColsData = res.data;
              if (importAttrKey in this.externalEntityData.packagePath) {
                this.selectedAttributes = this.externalEntityData.packagePath[importAttrKey];
              } else {
                this.selectedAttributes = [];
              }
              this.externalEntityColsDataFiltered = this.externalEntityColsData.filter(item => {
                return this.selectedAttributes.indexOf(item.attributeName) != -1;
              })
              if('primaryKey' in this.externalEntityData) {
                this.externalEntityKeyCols = [...this.externalEntityColsData];
              } else {
                this.externalEntityKeyCols = [...res.data].filter(i => {
                  return i.isPrimaryKey == true;
                })
                if(!this.externalEntityKeyCols || this.externalEntityKeyCols.length == 0) {
                  this.externalEntityKeyCols = [...res.data].filter(i => {
                    return (i.valueType == 'String' || i.valueType == 'Integer'|| i.valueType == 'UUID' || i.valueType == 'GUID');
                  })
                }
              }
              this.externalEntityKeyCols.forEach(val => {
                if(val.isPrimaryKey === true && (this.externalEntityData.primaryKey == '' || this.externalEntityData.primaryKey == undefined)) {
                  this.externalEntityData.primaryKey = val.attributeName;
                }
              })
            }));
          }
          Promise.all(ps).then(res => {
            this.importModalLoading = false;
          }).catch(error => {
            this.importModalLoading = false;
          });
        }).catch(error => {
          this.importModalLoading = false;
        });

    },
    // 查看对象
    showExtClassDetail(row, index) {
      this.stepStatus  = 2;
      this.viewObjectsModal = true;
      this.filterQuery = '';
      this.objectsData = [];
      this.objectsCurrentPage = 1;
      this.currentExtClass = {... row};
      this.objectsDataColumns = [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        }
      ];
      EntityModeling.getAttributes(row.className).then(res => {
        this.queryAttrList = res.data;
        console.log(this.queryAttrList,'show attribute');
                
        res.data.forEach(item => {
          this.objectsDataColumns.push({
            title: item.attributeName,
            key: item.attributeName,
            minWidth: Math.max((item.attributeName.length + 2) * 15, 150),
            render: (h, params) => {
              return h('Tooltip', {
                props: { placement: 'bottom', maxWidth: 1100, transfer: true }
              }, [
                  this.maxSlice(params.row[item.attributeName],32),
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                    params.row[item.attributeName])
                ])
            }
          });
        });
        this.refreshObjects();
      });
    },
    maxSlice(v,len) {
      if (v !== null && v !== '' && v != undefined) {
        if(v === false || v === true) v = v + '';
        return v.length > len ? v.slice(0, len) + "..." : v
      }
    },
    // 刷新对象
    refreshObjects(str, resetFlag) {
      this.objectsDataloading = true;
      this.objectsData = [];
      console.log(this.currentExtClass, 'refresh objects')
      getEntityObjCount(this.currentExtClass.className, {condition: str ? str : ''})
        .then(res => {
          if (!res.data.success) {
            this.$Message.error(res.data.message);
            this.objectsDataCount = 0;
            this.objectsCurrentPage = 1;
            this.objectsDataloading = false;
            return;
          }
          this.objectsDataCount = res.data.data;
          if(resetFlag) {
            this.objectsCurrentPage = 1;
          }
          getEobj(this.currentExtClass.className, {
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
              for (let i = 0; i < len; ++i) {
                let obj = this.objectsData[i];
                Object.keys(obj).forEach(function(key){
                  let date;
                  if (obj[key].toString().length === 13 && (date = new Date(obj[key])) !== undefined && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                    var y = date.getFullYear(),
                      m = date.getMonth() + 1,
                      d = date.getDate();
                    obj[key] = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + date.toTimeString().substr(0, 8);
                  }
                });
              }
              this.objectsDataloading = false;
              console.log(this.objectsData, 'objectsData');
            })
            .catch(e => {
              this.objectsDataloading = false;
            });
        })
        .catch(e => {
          this.objectsDataloading = false;
        });
    },
    // 对象过滤
    inputQuery() {
      let option = {
        allowNative: true
      }
      if (this.currentExtClass.className) {
        this.$refs.filterQuery_modal.initModal(this.filterQuery, this.currentExtClass.className, option, true, 'ex_en');
      } else {
        this.$refs.filterQuery_modal.initModal(this.filterQuery, '', option, true, 'ex_en');
      }
    },
    // 搜索对象
    searchObj() {
      this.refreshObjects(this.filterQuery, true);
    },
    getFilterQuery(finallyFilterQuery) {
      this.filterQuery = finallyFilterQuery;
    },
    objectsChangePage(pageId) {
      this.objectsCurrentPage = pageId;
      this.refreshObjects(this.filterQuery);
    },
    objectsChangePageSize(pageSize) {
      this.objectsPageSize = pageSize;
      this.refreshObjects(this.filterQuery);
    },

  },
};
</script>
<style>
.ivu-steps-head {
  background-color: inherit !important;
}
.ivu-steps-title {
  background-color: inherit !important;
}
</style>
<style scoped>
  .data-self-card>>>.ivu-card-body {
      background-color: inherit;
  }
  .tree-wrap {
      position: relative;
      z-index: 2;
      display: inline-block;
      /* min-width: 266px; */
      /* width: 50%; */
      padding: 4px;
      max-height: 75vh;
      height: 715px;
      /* 715 */
      overflow-y: auto;
  }

  @media screen and (max-width: 1331px) {
      .tree-wrap {
          /* width: 60%; */
          height: 600px;
          min-height: 600px;
      }
  }
  .my-tooltip{
    word-break:break-all;
  }
</style>