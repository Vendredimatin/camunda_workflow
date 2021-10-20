<template>
    <div>
        <Row class="app-head">
            <Col span="14">
                <Button id="upGradeSDK" style="margin-right: 16px;" type="primary" :disabled="disUpgrade || disAssemble" @click.native="updateSdk">升级SDK</Button>
                <input type="file" accept=".zip" id="sdkfile" @change="showSdkname" style="display:none"/>
                <Button id="downloadSDK" style="margin-right: 16px;" type="primary" @click.native="confirmLoad">下载SDK</Button>
                <span v-show="hasState" class="panel-info">状态: {{ sdkList.transSdkStatus || '--' }}</span>
                <span v-show="hasState" class="panel-info">升级时间: {{ getdate(sdkList.sdkLastAssembleTime || '') }}</span>
            </Col>

            <Col span="10" style="text-align: right;float: right;">

                <Button id="uploadPlugPackage" class="mr10" type="primary" icon="md-add" :disabled="disUpgrade" @click="uploadPacEvent">上传插件包</Button>
                <input type="file" accept=".yml,.zip" id="file" @change="showPname" style="display:none"/>
                <Button id="assembleButton" class="mr10" :disabled="disUpgrade || disAssemble || disableAssemble" @click.native="assembleEvent">装配</Button>
                <Button id="restartButton" class="mr10" :disabled="disUpgrade || disAssemble" @click.native="restartModal = true">重启</Button>

                <!-- <i-switch v-model="historySwitch" @on-change="viewHistory" /> 查看历史版本 --> 

                <!-- <Dropdown class="mr10" @on-click="choosLogtype">
                    <Button>
                        下载日志
                        <Icon type="ios-arrow-down"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                        <DropdownItem name="pluginMove">装配日志</DropdownItem>
                        <DropdownItem name="pluginCompile">编译日志</DropdownItem>
                        <DropdownItem name="pluginAssemble">重启日志</DropdownItem>
                        <DropdownItem name="pluginUninstall">卸载日志</DropdownItem>
                        <DropdownItem name="dwf-modeler">Modeler-Service</DropdownItem>
                        <DropdownItem name="dwf-app">App-Service</DropdownItem>
                    </DropdownMenu>
                </Dropdown> -->

                <Button id="checkLog" class="mr10" @click="checkLog">查看日志</Button>

            </Col>
        </Row>
        <div class="sdk-wrap">
            <Collapse simple class="sdk-panel" v-model="sdkValue" :style="{'height': codeHeights, 'position':'relative'}" ref="codeAssenble">
                <!-- <Panel v-for="item in sdkList" :key="item.id"> -->
                <Panel name="sdk" style="height: 100%;">
                    <span class="panel-info">核心代码 {{sdkList.sdk}}</span>
                    <!-- <span class="panel-info">插件总数: {{sdkList.pluginCount || 41}}</span> -->
                    <span class="panel-info">
                        状态: <Badge :status="sdkList.dotStatus" :text="sdkList.transStatus" />
                        <!-- <span v-if="sdkList.assembled "> -->

                        <!-- </span> -->
                        <!-- <span v-else>
                            <Badge status="error" text="未装配" />
                        </span> -->
                    </span>
                    <span class="panel-info">更新时间: {{getdate(sdkList.lastModifyTime || '')}}</span>
                    <span>装配时间: {{getdate(sdkList.lastAssembleTime || '')}}</span>
                    <span style="float:right;margin-right:15px;">
                        <Input v-model="searchKey" icon="md-search" @click.native="stopPropagation($event)" id="entityFormSearchInput" placeholder="搜索" style="position:absolute;top:15px;right:15px;width:200px;"></Input>
                        <!-- <Poptip
                            trigger="hover"
                            confirm
                            transfer
                            title="重启过程会断开服务一段时间, 是否确定重启服务器?"
                            @on-ok="confirmRestart"
                            @on-cancel="cancelRestart">
                            <Button class="mr10" type="success">重启</Button>
                        </Poptip> -->
                        <!-- <Button class="mr10" type="success" @click.stop.prevent="restartModal = true">重启</Button>
                        <Button style="margin-right: 16px;" type="primary" @click.stop.prevent="assembleEvent">装配</Button>
                        <Button style="margin-right: 16px;" type="primary" @click.stop.prevent="confirmLoad">下载</Button> -->
                        <!-- <Button class="mr10" type="primary" @click="viewLog">查看日志</Button> -->
                    </span>
                    <div slot="content">
                        <Table class="plugin-table" :columns="pluginColumns" :data="pagedData" border ref="viewTable" :height="tableHeight">
                            <template slot-scope="{ row, index }" slot="action">
                                <Tooltip content="下载" placement="top">
                                    <Button id="downloadPlugButton" type="text" icon="md-download" @click="downPart(row)"></Button>
                                </Tooltip>
                                <Tooltip :content="row.enabled === true ? '禁用' : '启用'" placement="top">
                                    <Button id="forbiddenPlugButton" icon="ios-power" @click="swichForbbiden(row, index)" :type="row.enabled === true ? 'warning' : 'text'"></Button>
                                </Tooltip>
                                <Tooltip content="删除" placement="top">
                                    <Button id="deletePlugButton" type="text" icon="ios-trash" @click="delPart(row)"></Button>
                                </Tooltip>
                            </template>
                        </Table>
                    </div>
                </Panel>
            </Collapse>
            <div style="margin-top: 10px; float: right;">
                <Page
                size="small"
                show-sizer
                show-elevator
                show-total
                placement="top"
                :page-size-opts="pageSizeOpts"
                :pageSize="pageSize"
                :total="searchData.length"
                :current="pageIndex"
                @on-change="changePage"
                @on-page-size-change="changePageSize"></Page>
            </div>

            <!-- <Dropdown class="mr10" @on-click="choosLogtype" style="position: absolute; right: 17px;top: 127px;">
                <Button type="primary" @click.stop.prevent="() => {}">
                    下载日志
                    <Icon type="ios-arrow-down"></Icon>
                </Button>
                <DropdownMenu slot="list">
                    <DropdownItem name="pluginMove">装配日志</DropdownItem>
                    <DropdownItem name="pluginCompile">编译日志</DropdownItem>
                    <DropdownItem name="pluginAssemble">重启日志</DropdownItem>
                    <DropdownItem name="dwf-modeler">Modeler-Service</DropdownItem>
                    <DropdownItem name="dwf-app">App-Service</DropdownItem>
                </DropdownMenu>
            </Dropdown> -->

            <!-- 插件包上传弹窗 -->
            <Modal
                id="uploadPlugWindow"
                v-model="uploadModal"
                :mask-closable="false"
                title="上传插件包">
                <Form ref="packageForm" :model="packageForm" :rules="ruleValidate" :label-width="60">
                    <FormItem label="中文名" prop="cname">
                        <Input id="pluginName" v-model="packageForm.cname"></Input>
                    </FormItem>
                    <FormItem label="备注" prop="note">
                        <Input id="pluginRemark" v-model="packageForm.note" type="textarea" :autosize="{minRows: 2,maxRows: 5}" style="font-size: 12px;"></Input>
                    </FormItem>
                    <FormItem label="插件包">
                        <div id="uploadPlugPackage" class="ivu-upload ivu-upload-drag" style="padding: 20px 0;" @click="uploadModelPackages">
                            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                            <p>单击此处上传插件包</p>
                        </div>
                        <span  v-show="pacName != ''" style="color: #f09d43;">
                            <Icon type="ios-document-outline" />
                            {{ pacName }}
                        </span>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button id="cancelUploadPlugPackage" type="text" @click="cancelPac">取消</Button>
                    <Button id="confirmUploadPlugPackage" type="primary" @click="getUpLoadModelPackageFile">确认</Button>
                </div>
            </Modal>
            <!-- 插件包上传弹窗Ending -->

            <!-- 升级SDK上传弹窗 -->
            <Modal v-model="updateModal" :mask-closable="false" title="上传SDK">
                <div class="ivu-upload ivu-upload-drag" style="padding: 20px 0;" @click="uploadSdk">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>单击此处上传SDK</p>
                </div>
                <span v-show="sdkName != ''" style="color: #f09d43;">
                    <Icon type="ios-document-outline" />
                    {{ sdkName }}
                </span>
                <div slot="footer">
                    <Button type="text" @click="cancelSdk">取消</Button>
                    <Poptip
                        v-if="sdkName != ''"
                        confirm
                        :width="300"
                        style="text-align: left"
                        title="升级SDK会暂停系统的服务，点击“确定”开始升级，点击“取消”放弃升级。"
                        @on-ok="confirmUpdateSdk"
                        @on-cancel="cancelSdk">
                        <Button type="primary">确定</Button>
                    </Poptip>
                    <Button v-else type="primary" @click="confirmUpdateSdk">确定</Button>
                </div>
            </Modal>
            <!-- 升级SDK上传弹窗Ending -->

            <!-- 下载SDK弹窗 -->
            <!-- <Modal
                v-model="loadModal"
                :mask-closable="false"
                title="下载SDK">
                <Tree ref="loadTree" :data="sdkTree" show-checkbox></Tree>
                <div slot="footer">
                    <Button type="text" @click="loadModal = false">取消</Button>
                    <Button type="primary" @click="confirmLoad">确认</Button>
                </div>
            </Modal> -->
            <!-- 下载SDK弹窗Ending -->

            <!-- 装配是否分步装配 -->
            <Modal id="assembleModalWindow" v-model="assembleModal" :mask-closable="false" title="装配SDK">
                <div v-show="!lastUnfinished">
                    请选择装配方式:
                    <RadioGroup v-model="assembleType">
                        <Radio label="否">装配后自动重启</Radio>
                        <Radio label="是">装配后手动重启</Radio>
                    </RadioGroup>
                </div>
                <div v-show="lastUnfinished">
                    <p>
                        <Icon type="ios-information-circle" style="color: #f60;"></Icon>
                        上次装配还未完成, 是否再次执行装配?
                    </p>
                </div>
                <div slot="footer">
                    <Button type="text" @click="assembleModal = false">取消</Button>
                    <Button id="assembleConfirm" type="primary" @click="assembledSdk()">确认</Button>
                </div>
            </Modal>

            <!-- 装配是否分步装配 -->
            <Modal id="restartWindow" v-model="restartModal" :mask-closable="false" title="提示">
                <p>
                    <Icon type="ios-information-circle" style="color: #f60;"></Icon>
                    重启过程会断开服务一段时间, 是否确定重启服务器?
                </p>
                <div slot="footer">
                    <Button type="text" @click="restartModal = false">取消</Button>
                    <Button id="restartConfirm" type="primary" @click="confirmRestart">确认</Button>
                </div>
            </Modal>

            <!-- 删除装配中的插件包缓冲提示 -->
            <Modal id="deleteWindow" v-model="confirmModal" :mask-closable="false" title="提示">
                <p>
                    <Icon type="ios-information-circle" style="color: #f60;"></Icon>
                    该插件包删除后无法恢复, 是否确定删除?
                </p>
                <div slot="footer">
                    <Button type="text" @click="confirmModal = false">取消</Button>
                    <Button id="deleteConfirm" type="primary" @click="confirmDel">确认</Button>
                </div>
            </Modal>

            <!-- 查看日志类型选择 -->
            <!-- <Modal v-model="checkLogModal" :mask-closable="false" title="选择查看的日志">

                <CheckboxGroup v-model="logType">
                    <Checkbox class="commonLabel" v-for="item in logTypeList" :key="item.label" :label="item.label">{{ item.displayName }}</Checkbox>
                </CheckboxGroup>
                <div slot="footer">
                    <Button type="text" @click="checkLogModal = false">取消</Button>
                    <Button type="primary" @click="confirmType">确认</Button>
                </div>

            </Modal> -->

        </div>
        <Spin v-if="spinShow" fix>SDK升级中...</Spin>
    </div>
</template>
<script>
import {tableMixin} from "@/component/tableMixin"
import { getAllParts, assemblePart, delPluginPac, loadLog, uploadPart, loadPart, uploadSDK, upgradeSDK, loadSDK, restartServer } from "@/api/partpack";
import { conflictDetectionBetweenModelPackageAndThisSystemAndThenRelease, uploadModelPackage } from "@/api/modelpackage";
// import { loadPlugin } from "@/api/partdown";
import expandRow from './components/table-expand.vue';
import global_ from "@/views/global.vue";
import { encode64 } from "@/libs/utils.js";
// import { forEach } from '../../../../app-mobile/src/libs/utils';
    export default {
        name: 'code-assembly',
        mixins: [tableMixin],
        components: { expandRow },
        data() {
            const validateCname = (rule, value, callback) => {
                if(value != '') {
                    const reg = new RegExp("^[A-Za-z0-9\u4e00-\u9fa5]+$");
                    let flag = reg.test(value);
                    if(!flag){
                        callback(new Error('中文名只能包含中文、字母和数字哦～'));
                    } else {
                        if(value.length > 32) {
                            callback(new Error('中文名不能超过32个字符哦～'));
                        } else {
                            callback();
                        }
                    }
                } else {
                    callback();
                }
            };
            const validateNote = (rule, value, callback) => {
                if(value != '') {
                    const reg = new RegExp("^[A-Za-z0-9\u4e00-\u9fa5]+$");
                    let flag = reg.test(value);
                    // if(!flag){
                    //     callback(new Error('备注只能包含中文、字母和数字哦～'));
                    // } else {
                        if(value.length > 200) {
                            callback(new Error('备注不能超过200个字符哦～'));
                        } else {
                            callback();
                        }
                    // }
                } else {
                    callback();
                }
            };
            return {
                historySwitch: false,     // 查看历史版本
                updateModal: false,       // 上传弹窗
                loadModal: false,         // 下载弹窗
                confirmModal: false,      // 删除装配中插件包提示弹窗
                choosePart: null,

                spinShow: false,
                hasState: false,
                sdkName: '',              // 上传sdk文件名称
                disUpgrade: false,        // 升级中sdk禁止重复上传升级
                disAssemble: false,       // 装配中禁止升级sdk

                uploadModal: false,       // 上传插件包弹窗
                packageForm: {
                    cname: '',
                    note: ''
                },
                pacName: '',
                ruleValidate: {
                    cname: [
                        { validator: validateCname, trigger: 'blur' }
                    ],
                    note: [
                        { validator: validateNote, trigger: 'blur' }
                    ]
                },
                assembleModal: false,       // 装配方式选择弹窗
                lastUnfinished: false,      // 上次装配是否完成
                restartModal: false,        // 重启服务器弹窗
                assembleType: '否',
                columnsWidth: 170,

                // checkLogModal: false,       // 查看日志弹窗
                // logTypeList: [
                //     {
                //         label: 'pluginCompile',
                //         displayName: '编译日志'
                //     }, {
                //         label: 'pluginAssemble',
                //         displayName: '重启日志'
                //     }, {
                //         label: 'pluginUninstall',
                //         displayName: '卸载日志'
                //     }, {
                //         label: 'server',
                //         displayName: 'server.py日志'
                //     }, {
                //         label: 'codeAssembly',
                //         displayName: '代码装配日志'
                //     }, {
                //         label: 'error-codeAssembly',
                //         displayName: '代码装配错误日志'
                //     }, {
                //         label: 'npm-app-web',
                //         displayName: 'app-web编译日志'
                //     }, {
                //         label: 'npm-modeler-web',
                //         displayName: 'modeler-web编译日志'
                //     }, {
                //         label: 'mvn-dwf-app',
                //         displayName: 'dwf-app编译日志'
                //     }, {
                //         label: 'mvn-dwf-modeler',
                //         displayName: 'dwf-modeler编译日志'
                //     }, {
                //         label: 'mvn-dwf-common',
                //         displayName: 'dwf-common编译日志'
                //     }
                // ],
                // logType: ['codeAssembly'],

                statusMap: {
                    0: '待装配',
                    1: '待装配',
                    9: '装配中',
                    3: '装配成功',
                    2: '装配成功 (待重启)',
                    '-1': '装配失败',
                    '-2': '装配失败',
                    '-3': '装配失败'
                },
                sdkStatusMap: {
                    0: '待升级',
                    1: '成功',
                    9: '升级中',
                    '-1': '失败'
                },
                sdkValue: 'sdk',

                sdkTree: [],
                sdkList: {},
                pluginColumns: [
                    // {
                    //     type: 'expand',
                    //     width: 50,
                    //     render: (h, params) => {
                    //         return h(expandRow, {
                    //             props: {
                    //                 row: params.row.children
                    //             },
                    //             on: {
                    //                 // 监听子插件的禁用操作 更新父数据
                    //                 swichPluginForb: value => {
                    //                     this.$nextTick(() => {

                    //                         let pacIndex = this.pluginData.findIndex(pac => {
                    //                             return pac.name == value.orginPackage
                    //                         })

                    //                         let prePath = value.orginPath.split('/')[0];

                    //                         if(prePath == 'part-web') {

                    //                             this.pluginData[pacIndex].children[0].children.forEach(p => {
                    //                                 if(p.name == value.name) {
                    //                                     p.enabled = value.enabled;
                    //                                 }
                    //                             })

                    //                         } else {

                    //                             this.pluginData[pacIndex].children[1].children.forEach(p => {
                    //                                 if(p.name == value.name) {
                    //                                     p.enabled = value.enabled;
                    //                                 }
                    //                             })

                    //                         }

                    //                     })
                    //                 }
                    //             }
                    //         })
                    //     }
                    // },
                    {
                        title: '英文名',
                        key: 'name',
                        align: 'center'
                    },
                    {
                        title: '中文名',
                        key: 'cname',
                        align: 'center',
                        // tooltip: true
                    },
                    {
                        title: '状态',
                        key: 'assembled',
                        width: 170,
                        // width: 1204,
                        align: 'center',
                        render: (h, params) => {

                            const row = params.row;
                            let color = '';
                            let text = '';
                            if(row.assembled == true) {
                                color = 'success';
                                text = '已装配';
                            } else {
                                color = 'warning';
                                text = '未装配';
                            }

                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: color
                                }
                            }, text);

                        }
                    },
                    // {
                    //     title: '状态',
                    //     key: 'transStatus',
                    //     align: 'center',
                    //     minWidth: 250,
                    //     render: (h, params) => {

                    //         const row = params.row;
                    //         let color = '';
                    //         if(row.status === 0 || row.status === 1) {
                    //             color = 'primary';
                    //         } else if(row.status === 9) {
                    //             color = 'warning';
                    //         } else if(row.status === 2 || row.status === 3) {
                    //             color = 'success';
                    //         } else if(row.status === -1 || row.status === -2 || row.status === -3) {
                    //             color = 'error';
                    //         }
                    //         const text = row.transStatus;

                    //         return h('Tag', {
                    //             props: {
                    //                 type: 'dot',
                    //                 color: color
                    //             }
                    //         }, text);

                    //     }
                    // },
                    // {
                    //     title: '插件数',
                    //     key: 'counts',
                    //     align: 'center'
                    // },
                    // {
                    //     title: '来源',
                    //     key: 'path',
                    //     align: 'center'
                    // },
                    {
                        title: '备注',
                        key: 'note',
                        align: 'center',
                        // tooltip: true
                    },
                    {
                        title: '操作',
                        slot: 'action',
                        width: 170,
                        align: 'center'
                    }
                ],
                pluginData: [],
                disableAssemble: false,//禁用装配按钮
                searchKey: null,
                pageIndex: 1,
                pageSize: 10,
                pageSizeOpts: [10, 25, 50, 100, 200, 500],
            }
        },
        watch: {
            searchKey(val) {
                this.pageIndex = 1;
            }
        },
        computed: {
            searchData() {
                let sk = '';
                if(this.searchKey) {
                    sk = this.searchKey.toLowerCase().trimStart().trimEnd();
                }
                let data = this.pluginData;
                let newData = [];
                if (sk) {
                    data.forEach(function (obj) {
                        // 关键字搜索
                        if (String(obj['name']).toLowerCase().indexOf(sk) > -1 || String(obj['cname']).toLowerCase().indexOf(sk) > -1) {
                            newData.push(obj);
                        }
                    });
                    data = newData;
                }
                // 是否禁用装配按钮
                this.disableAssembleFun(data)
                console.log(data)
                return data;

            },
            pagedData() {
                let k = this.searchData.slice((this.pageIndex - 1) * this.pageSize, this.pageIndex * this.pageSize);
                return k;
            },
        },
        created() {

            this.resetColumnsWidth();
            this.initAssemble();
            this.$nextTick(() => {
                document.querySelector('.ivu-table-tip table').style.width = 'initial';
            })
        },
        methods: {
            // 是否禁用装配按钮
            disableAssembleFun(val){
                let assembledCount = 0
                let disabledCount = 0
                console.log(val)
                val.forEach((item) => {
                    if(item.assembled){
                        assembledCount++
                    }else{
                        if(!item.enabled)disabledCount++
                    }
                })
                // 全部都未装配并且都被禁用的；已装配点击装配是卸载
                if(assembledCount == 0 && disabledCount == val.length){
                    this.disableAssemble = true
                }else{
                    this.disableAssemble = false
                }
            },
            stopPropagation(event) {
                // 禁止点击搜索框触发折叠面板收起事件
                event.stopPropagation();
            },
            changePage(pageId) {
                console.log(pageId)
                this.pageIndex = pageId;
            },
            changePageSize(pageSize) {
                this.pageSize = pageSize;
            },
            activate() {
                this.resetColumnsWidth();
            },
            resetColumnsWidth() {

                let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
                let finalWidth = parseInt(sideWidth) + 460;
                this.columnsWidth = (document.body.clientWidth - finalWidth) / 3;
                console.log('resetColumnsWidth', this.columnsWidth)
                // this.$nextTick(() => {
                //     let width = `${document.body.clientWidth - parseInt(sideWidth) - 20}px`
                //     console.log(width)
                //     document.querySelector('.sdk-panel').style.width = width
                // })
                this.pluginColumns = [
                    {
                        title: '英文名',
                        key: 'name',
                        minWidth: this.columnsWidth,
                        align: 'center'
                    },
                    {
                        title: '中文名',
                        key: 'cname',
                        minWidth: this.columnsWidth,
                        align: 'center',
                        // tooltip: true
                    },
                    {
                        title: '状态',
                        key: 'assembled',
                        width: 170,
                        align: 'center',
                        render: (h, params) => {

                            const row = params.row;
                            let color = '';
                            let text = '';
                            if(row.assembled == true) {
                                color = 'success';
                                text = '已装配';
                            } else {
                                color = 'warning';
                                text = '未装配';
                            }

                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: color
                                }
                            }, text);

                        }
                    },
                    {
                        title: '备注',
                        key: 'note',
                        minWidth: this.columnsWidth,
                        align: 'center',
                        // tooltip: true
                    },
                    {
                        title: '操作',
                        slot: 'action',
                        width: 170,
                        align: 'center'
                    }
                ]

            },
            globalRefresh() {
                this.initAssemble();
            },
            /**
             * @description 获取全部装配数据结构
            */
            initAssemble() {
                // 遮罩动画
                this.$Spin.show();
                this.pluginData = [];
                this.pageIndex = 1
                getAllParts().then(response => {

                    this.$Spin.hide();
                    let res = response.data;
                    if(response.status == 200) {

                        this.sdkList = res;
                        if(res.parts.length == 0 && res.lastAssembleTime === 0) {
                            this.sdkList['transStatus'] = '--';
                        } else {
                            this.sdkList['transStatus'] = this.statusMap[res.status];
                        }

                        if(res.sdkLastAssembleTime === 0 && res.sdkStatus == 1) {

                            this.sdkList['transSdkStatus'] = '--';
                            this.hasState = false;

                        } else {

                            this.hasState = true;
                            this.sdkList['transSdkStatus'] = this.sdkStatusMap[res.sdkStatus];

                        }

                        this.disUpgrade = res.sdkStatus == 9 ? true : false;
                        this.disAssemble = res.status == 9 ? true : false;

                        let color = '';
                        if(res.status === 0 || res.status === 1) {
                            color = 'default';
                            this.lastUnfinished = false;
                        } else if(res.status === 9) {
                            color = 'warning';
                            this.lastUnfinished = true;
                        } else if(res.status === 2 || res.status === 3) {
                            color = 'success';
                            this.lastUnfinished = false;
                        } else if(res.status === -1 || res.status === -2 || res.status === -3) {
                            color = 'error';
                            this.lastUnfinished = false;
                        }
                        this.sdkList['dotStatus'] = color;
                        // let temres = res.parts.map(item => {

                        //     item['title'] = item.name;
                        //     item['transStatus'] = this.statusMap[item.status];
                        //     return item;

                        // })
                        let temres = res.parts.map(item => {

                            item['title'] = item.name;
                            item['transStatus'] = this.statusMap[item.status];
                            item['expand'] = true;
                            let pluginList = [];
                            // 判断是否存在前端插件
                            if('part-web' in item) {
                                let webPlugin = {
                                    name: '前端插件',
                                    title: '前端插件',
                                    expand: true,
                                    children: []
                                }

                                // 应用端控件
                                if('app' in item['part-web']) {

                                    item['part-web'].app['orginPath'] = 'part-web/app';
                                    item['part-web'].app['orginSdk'] = res.sdk;
                                    item['part-web'].app['orginPackage'] = item.name;
                                    item['part-web'].app['title'] =  item['part-web'].app.name;

                                    webPlugin.children.push(item['part-web'].app);

                                }

                                // common控件
                                if('common' in item['part-web']) {

                                    item['part-web'].common['orginPath'] = 'part-web/common';
                                    item['part-web'].common['orginSdk'] = res.sdk;
                                    item['part-web'].common['orginPackage'] = item.name;
                                    item['part-web'].common['title'] =  item['part-web'].common.name;

                                    webPlugin.children.push(item['part-web'].common);

                                }


                                // 建模端控件
                                if('modeler' in item['part-web']) {

                                    item['part-web'].modeler['orginPath'] = 'part-web/modeler';
                                    item['part-web'].modeler['orginSdk'] = res.sdk;
                                    item['part-web'].modeler['orginPackage'] = item.name;
                                    item['part-web'].modeler['title'] =  item['part-web'].modeler.name;

                                    webPlugin.children.push(item['part-web'].modeler);

                                }

                                pluginList.push(webPlugin);
                            }

                            // 判断是否存在后端插件
                            if('part-svc' in item) {
                                let svcPlugin = {
                                    name: '后端插件',
                                    title: '后端插件',
                                    expand: true,
                                    children: []
                                }

                                // 应用端控件
                                if('app' in item['part-svc']) {

                                    item['part-svc'].app['orginPath'] = 'part-svc/app';
                                    item['part-svc'].app['orginSdk'] = res.sdk;
                                    item['part-svc'].app['orginPackage'] = item.name;
                                    item['part-svc'].app['title'] =  item['part-svc'].app.name;

                                    svcPlugin.children.push(item['part-svc'].app);

                                }

                                // common控件
                                if('common' in item['part-svc']) {

                                    item['part-svc'].common['orginPath'] = 'part-svc/common';
                                    item['part-svc'].common['orginSdk'] = res.sdk;
                                    item['part-svc'].common['orginPackage'] = item.name;
                                    item['part-svc'].common['title'] =  item['part-svc'].common.name;

                                    svcPlugin.children.push(item['part-svc'].common);

                                }

                                // 建模端控件
                                if('modeler' in item['part-svc']) {

                                    item['part-svc'].modeler['orginPath'] = 'part-svc/modeler';
                                    item['part-svc'].modeler['orginSdk'] = res.sdk;
                                    item['part-svc'].modeler['orginPackage'] = item.name;
                                    item['part-svc'].modeler['title'] =  item['part-svc'].modeler.name;

                                    svcPlugin.children.push(item['part-svc'].modeler);

                                }

                                pluginList.push(svcPlugin);
                            }

                            item['children'] = pluginList;
                            return item;
                        });
                        // 页面数面板展示数据
                        this.pluginData = temres;


                        // 弹窗树数据
                        this.sdkTree = [];
                        let sdkObj = {
                            title: `核心代码 (${res.sdk})`,
                            name: res.sdk,
                            isSdk: true,
                            checked: true
                        };
                        this.sdkTree = [sdkObj, ...temres];

                    } else {
                        this.sdkList = [];
                    }

                }).catch(e => {
                    this.$Spin.hide();
                    console.log(e);
                });

            },

            //timestep 转为时间
            getdate(ts) {
                if(ts == '') return '--';
                var now = new Date(ts),
                    y = now.getFullYear(),
                    m = now.getMonth() + 1,
                    d = now.getDate();
                return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
            },

            // 装配调用
            assembleEvent() {

                // 当前没有插件包 或者 禁用了所有插件包 不可装配
                if(this.pluginData.length == 0) {
                    this.$Message.warning('您当前没有可装配的插件包');
                } else {

                    let assemblyParams = [...this.pluginData].filter(item => {
                        return item.enabled === true;
                    })

                    if(assemblyParams.length > 0) {
                        this.assembleModal = true;
                    } else {
                        // this.$Message.warning('您已禁用了所有插件包, 暂无可装配内容');
                        this.assembleType = '否';
                        this.assembledSdk();
                    }

                }
            },

            uploadPacEvent() {

                this.$refs['packageForm'].resetFields();
                this.packageForm.note = '';
                this.pacName = '';
                this.uploadModal = true;

            },

            /**
             * @description 下载插件包
            */
            downPart(part) {

                // let loadParams = {
                //     parts: [
                //         {
                //             name: part.name
                //         }
                //     ]
                // }

                // if('part-web' in part) {
                //     loadParams.parts[0]['part-web'] = part['part-web']
                // }
                // if('part-svc' in part) {
                //     loadParams.parts[0]['part-svc'] = part['part-svc']
                // }
                var elementA = document.createElement('a');
                elementA.setAttribute('href', `${global_.baseUrlOther}/part/downloadPart/${part.name}`);
                elementA.style.display = 'none';
                document.body.appendChild(elementA);
                elementA.click();
                document.body.removeChild(elementA);

                // loadPart(part.name).then(response => {

                //     console.log(response)
                //     // var elementA = document.createElement('a');
                //     // elementA.setAttribute('href', window.URL.createObjectURL(response));
                //     // elementA.setAttribute('download', "plugin.zip");
                //     // elementA.style.display = 'none';
                //     // document.body.appendChild(elementA);
                //     // elementA.click();
                //     // document.body.removeChild(elementA);

                // }).catch(e => {
                //     console.log(e);
                // });

            },

            // 模型包禁用状态
            swichForbbiden(row, index) {

                row.enabled = !row.enabled;
                this.pagedData[index].enabled = row.enabled;
                // this.pluginData[index].enabled = row.enabled;

            },

            /**
             * @description 删除插件包
            */
            delPart(part) {

                // 插件包缓冲删除提示
                // if(part.transStatus == '装配中') {
                this.choosePart = part;
                this.confirmModal = true;
                // } else {
                //     this.commonDelPart(part, false);
                // }

            },

            // 删除插件包
            commonDelPart(part, flag) {

                delPluginPac(part.name, flag).then(response => {

                    this.confirmModal = false;
                    let res = response.data;
                    if(res.success) {

                        this.initAssemble();
                        this.$Message.success(res.message);

                    } else {
                        this.$Message.error(res.message)
                    }

                }).catch(e => {
                    this.confirmModal = false;
                    console.log(e);
                });

            },

            /**
             * @description 查看日志
            */
            checkLog() {
                // this.logType = ['codeAssembly'];
                // this.checkLogModal = true;
                window.open(`${Config.tomcatUrl}/log/assembly-log.html?type=codeAssembly`);
            },

            // confirmType() {

            //     if(this.logType.length == 0) {
            //         this.$Message.warning('您还未选择任何日志');
            //     } else {

            //         for(var i in this.logType){

            //             let checkObj = new Object();
            //             checkObj = window.open(`${Config.tomcatUrl}/log/assembly-log.html?type=${this.logType[i]}`,'_blank');

            //         }

            //     }

            // },

            /**
             * @description 下载日志到本地
             * @param type all全部 modeler/app-ext 前端 dwf-modeler/app 后端
            */
            choosLogtype(type) {

                loadLog(type).then(response => {

                    let res = response.data;
                    if(typeof res == 'object') {

                        if(!res.success) {
                            this.$Message.warning(res.message);
                        }

                    } else {

                        var elementA = document.createElement('a');
                        elementA.setAttribute('href', `${global_.baseUrlOther}/part/log/${type}`);
                        elementA.setAttribute('download', + type + ".log");
                        elementA.style.display = 'none';
                        document.body.appendChild(elementA);
                        elementA.click();
                        document.body.removeChild(elementA);

                    }

                }).catch(e => {
                    console.log(e);
                });

            },

            /** 
             * @description 升级SDK
            */
            updateSdk() {

                this.sdkName = '';
                this.updateModal = true;

            },

            // 模拟上传sdk
            uploadSdk(){
                document.querySelector('#sdkfile').click();
            },

            /**
             * @description 确认上传新的SDK
            */
            confirmUpdateSdk() {
                
                let e = document.getElementById('sdkfile');
                if(e.value != "" && e.files[0] && this.sdkName != '') {

                    let formData = new FormData();
                    formData.append("sdkPackage", e.files[0]);
                    this.updateModal = false;
                    this.spinShow = true;

                    // 上传sdk => 升级sdk
                    uploadSDK(formData).then(res=>{

                        if(!res.success) {

                            this.spinShow = false;
                            this.$Message.error(res.message);

                        } else {

                            upgradeSDK().then(res=>{

                                this.spinShow = false;
                                if(!res.success) {
                                    this.$Message.error(res.message);
                                } else {

                                    this.$Message.success(res.message);
                                    this.initAssemble();

                                }

                            }).catch(e => {
                                this.spinShow = false;
                                console.log(e);
                            });

                        }

                    }).catch(e => {
                        this.spinShow = false;
                        console.log(e);
                    });

                    document.getElementById('file').value = null;
                    this.pacName = '';

                } else {
                    this.$Message.warning('请先上传SDK');
                }

            },

            // 重置上传sdk state
            cancelSdk() {

                document.getElementById('sdkfile').value = '';
                this.sdkName = '';
                this.updateModal = false;

            },

            /**
             * @description 下载SDK树
            */
            confirmLoad() {

                var elementA = document.createElement('a');
                elementA.setAttribute('href', `${global_.baseUrlOther}/part/downloadSdk`);
                elementA.setAttribute('download', "sdk.zip");
                elementA.style.display = 'none';
                document.body.appendChild(elementA);
                elementA.click();
                document.body.removeChild(elementA);

                // loadSDK().then(response => {

                //     var elementA = document.createElement('a');
                //     elementA.setAttribute('href', window.URL.createObjectURL(response));
                //     elementA.setAttribute('download', "sdk".zip);
                //     elementA.style.display = 'none';
                //     document.body.appendChild(elementA);
                //     elementA.click();
                //     document.body.removeChild(elementA);


                // }).catch(e => {
                //     console.log(e);
                // });


                // let targetCheck = this.$refs.loadTree.getCheckedNodes();

                // if(targetCheck.length > 0) {

                //     let finalParams = {
                //         parts: []
                //     };
                //     targetCheck.forEach(item => {

                //         // 是否勾选了根节点
                //         if(item.isSdk) {
                //             finalParams['sdk'] = item.name;
                //         }

                //         if(item.orginPath) {

                //             let packIndex = finalParams.parts.findIndex(val => {
                //                 return val.name == item.orginPackage
                //             })

                //             // 判断该插件包是否已存入数组
                //             if(packIndex == -1) {

                //                 let pacItem = {
                //                     name: item.orginPackage
                //                 }

                //                 let prePath = item.orginPath.split('/')[0];

                //                 pacItem[prePath] = [item.name];

                //                 finalParams.parts.push(pacItem)

                //             } else {

                //                 let prePath = item.orginPath.split('/')[0];
                //                 let aftPath = item.orginPath.split('/')[1];

                //                 if(prePath in finalParams.parts[packIndex]) {

                //                     finalParams.parts[packIndex][prePath].push(item.name);

                //                 } else {

                //                     finalParams.parts[packIndex][prePath] = [item.name];

                //                 }


                //             }

                //         }

                //     })

                //     loadPlugin(finalParams).then(response => {

                //         this.loadModal = false;

                //         var elementA = document.createElement('a');
                //         elementA.setAttribute('href', window.URL.createObjectURL(response));
                //         elementA.setAttribute('download', "part.zip");
                //         elementA.style.display = 'none';
                //         document.body.appendChild(elementA);
                //         elementA.click();
                //         document.body.removeChild(elementA);


                //     }).catch(e => {
                //         console.log(e);
                //     });

                // } else {
                //     this.$Message.warning('您还未选择任何需要下载的文件');
                // }


            },

            /**
             * @description 装配SDK
            */
            assembledSdk() {

                let assemblyParams = [...this.pluginData].filter(item => {
                    return item.enabled === true;
                })
                let finalParams = [];

                this.lastUnfinished = true;
                this.assembleModal = false;

                if(assemblyParams.length > 0) {

                    assemblyParams.forEach((val, valIndex) => {

                        let assembleObj = {};
                        if(val.enabled !== false) {

                            assembleObj['name'] = val.name;
                            // 过滤插件是否被禁用
                            if('part-web' in val) {

                                assembleObj['part-web'] = [];

                                val.children[0].children.forEach((e, index) => {
                                    if(e.enabled !== false) {
                                        assembleObj['part-web'].push(e.name);
                                    }
                                })

                            }

                            if('part-svc' in val) {

                                assembleObj['part-svc'] = [];
                                
                                let curPart = 'part-web' in val ? val.children[1] : val.children[0];
                                curPart.children.forEach((e, index) => {
                                    if(e.enabled !== false) {
                                        assembleObj['part-svc'].push(e.name);
                                    }
                                })

                            }

                            finalParams.push(assembleObj)

                        }

                    })

                }

                let assembleFlag = this.assembleType == '是' ? true : false;
                assemblePart(finalParams, assembleFlag).then(response => {

                    if(response.success) {

                        // 分布装配 需要再依次调用 编译 => 重启
                        if(assembleFlag === true) {

                            this.initAssemble();
                            // separatedAssemble('compile').then(response => {

                            //     if(response.success) {

                            //         separatedAssemble('install').then(response => {

                            //             this.lastUnfinished = false;
                            //             if(response.success) {

                            //                 this.$Spin.hide();
                            //                 this.$Message.success(response.message);
                            //                 this.initAssemble();

                            //             } else {

                            //                 this.$Spin.hide();
                            //                 this.$Message.error(response.message);

                            //             }

                            //         }).catch(e => {
                            //             this.$Spin.hide();
                            //             console.log(e);
                            //         });

                            //     } else {

                            //         this.$Spin.hide();
                            //         this.lastUnfinished = false;
                            //         this.$Message.error(response.message);

                            //     }

                            // }).catch(e => {
                            //     this.$Spin.hide();
                            //     console.log(e);
                            // });

                            // restartServer().then(response => {

                            //     this.lastUnfinished = false;
                            //     if(response.success) {

                            //         this.$Spin.hide();
                            //         this.$Message.success(response.message);
                            //         this.initAssemble();

                            //     } else {

                            //         this.$Spin.hide();
                            //         this.$Message.error(response.message);

                            //     }

                            // }).catch(e => {

                            //     this.$Spin.hide();
                            //     console.log(e);

                            // });

                        } else {

                            this.$Spin.hide();
                            this.lastUnfinished = false;
                            this.initAssemble();
                            this.$Message.success(response.message);

                        }

                    } else {

                        this.$Message.error(response.message);
                        this.$Spin.hide();

                    }

                }).catch(e => {
                    this.$Spin.hide();
                    this.lastUnfinished = false;
                    this.assembleModal = false;
                    console.log(e);
                });

                let self = this;
                setTimeout(() => {
                    self.initAssemble();
                }, 1000)


            },

            // SDK文件名
            showSdkname(e) {
                if(e.target.value != "" && e.target.files[0]){
                    this.sdkName = e.target.files[0].name;
                } else {
                    this.sdkName = '';
                }
            },

            // 覆盖sdk
            changeSdk(e) {

                if(e.target.value != "" && e.target.files[0]) {

                    let formData = new FormData();
                    formData.append("sdkPackage", e.target.files[0]);
                    this.$Spin.show();

                    uploadSDK(formData, false).then(res=>{

                        this.$Spin.hide();
                        if(!res.success) {
                            this.$Message.error('上传的SDK包有误');
                        } else {

                            // 覆盖sdk装配
                            this.assembleType = '否';
                            this.assembledSdk();

                        }

                    }).catch(e => {
                        this.$Spin.hide();
                        this.$Message.error('上传的SDK包有误');
                        console.log(e);
                    });

                }

                e.target.value = '';
            },

            /**
             * @description 上传插件包选择zip/yml文件
             */
            uploadModelPackages(){
                document.querySelector('#file').click();
            },

            showPname(e) {
                if(e.target.value != "" && e.target.files[0]){
                    this.pacName = e.target.files[0].name;
                } else {
                    this.pacName = '';
                }
            },

            // 上传插件包 并默认释放
            async getUpLoadModelPackageFile(){

                this.$refs['packageForm'].validate(valid => {

                    if(!valid) {
                        this.$Message.warning('格式有误, 请确认');
                    } else {

                        let e = document.getElementById('file');
                        if(e.value != "" && e.files[0] && this.pacName != ''){

                            let formData = new FormData();
                            formData.append("partPackage", e.files[0]);
                            formData.append("cname", this.packageForm.cname + '');
                            formData.append("note", this.packageForm.note ? encode64(`${this.packageForm.note}`) : '');
                            this.uploadModal = false;
                            this.$Spin.show();

                            uploadPart(formData).then(res=>{

                                this.$Spin.hide();
                                if(!res.success) {
                                    this.$Message.error(res.message);
                                } else {

                                    this.$Message.success("上传插件包释放成功");
                                    this.initAssemble();

                                }

                            }).catch(e => {
                                this.$Spin.hide();
                                console.log(e);
                            });

                            document.getElementById('file').value = null;
                            this.pacName = '';

                            // uploadModelPackage(formData).then(res=>{

                            //     if(res.data.data!== "failed"){
                            //         if(res.data.data === "name exist" ){
                            //             this.$Message.error("模型包重名，请修改后重新上传")
                            //         }else{

                            //             let packData = JSON.parse(res.data.data);

                            //             let formData = new FormData();
                            //             formData.append("UUID", packData.UUID)
                            //             formData.append("tomcatUrl", global_.tomcatUrl)
                            //             formData.append("baseUrl", global_.baseUrl)
                            //             formData.append("cover", true)

                            //             conflictDetectionBetweenModelPackageAndThisSystemAndThenRelease(formData).then(res=>{
                            //                 if(res.data.data !== "failed"){

                            //                     this.$Message.success("上传模型包释放成功");
                            //                     this.initAssemble();

                            //                 }else{

                            //                     this.$Message.error("上传模型包释放失败")
                            //                 }

                            //             }).catch(e => {
                            //                 this.$Spin.hide();
                            //                 console.log(e);
                            //             });
                            //         }

                            //     }else{
                            //         this.$Message.error("上传模型包失败");
                            //         this.$Spin.hide();
                            //     }

                            // }).catch(e => {
                            //     this.$Spin.hide();
                            //     console.log(e);
                            // });
                        } else {
                            this.$Message.warning('请先上传您的插件包');
                        }

                    }
                })

            },

            // 重置上传的插件包为空
            cancelPac() {

                document.getElementById('file').value = '';
                this.pacName = '';
                this.uploadModal = false;

            },

            // 重启服务器
            confirmRestart() {

                this.$Spin.show();
                this.restartModal = false;

                restartServer().then(response => {

                    this.$Spin.hide();
                    if(response.success) {
                        this.$Message.success(response.message);
                        this.initAssemble();
                    } else {
                        this.$Message.warning(response.message);
                    }

                }).catch(e => {
                    this.$Spin.hide();
                    console.log(e);

                });

            },

            // 删除装配中插件包
            confirmDel() {
                this.commonDelPart(this.choosePart, false);
            },

            // 查看历史版本
            viewHistory() {

            }
        },
    }
</script>
<style scoped>
    .sdk-panel {
        position: relative;
        border: none;
        /* height: 60vh; */
        /* overflow-y: auto; */
    }
    .sdk-panel>>>.ivu-collapse-item {
        border: 1px solid #dcdee2;
        /* margin-bottom: 15px; */
    }
    .sdk-panel>>>.ivu-collapse-item>.ivu-collapse-header {
        height: 60px;
        line-height: 60px;
        color: #000;
    }
    .plugin-table>>>.ivu-table th {
        background-color: transparent;
    }
    .plugin-table>>> i {
        font-size: 14px;
    }
    .plugin-table>>>.ivu-table-cell span {
        font-size: 12px;
    }
    .app-head {
        height: 60px;
        line-height: 60px;
        background: #fff;
        padding: 0 20px 0 30px;
        color: #000;
    }
    .sdk-wrap {
        overflow-x: auto;
        width: 100%;
        padding: 10px 10px 50px;
    }
    .panel-info {
        margin-right: 2%;
    }
    .mr10 {
        margin-right: 10px;
    }
    .commonLabel {
        width: 30%;
        margin: 5px;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
</style>
<style>
    textarea.ivu-input {
        font-size: 12px !important;
    }
</style>
