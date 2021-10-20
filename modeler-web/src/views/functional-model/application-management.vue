<template>
    <div :style="{borderTop: appForm.extConfig.showTabs == 'hide' ? '' : '1px solid #e8eaec'}">
        <Row class="app-head">
            <Col span="3">
                <Dropdown @on-click="createNewApp">
                    <a href="javascript:void(0)">
                        <Button type="primary">新建应用<Icon type="md-arrow-dropdown"></Icon></Button>
                    </a>
                    <DropdownMenu slot="list">
                        <DropdownItem name="pc" :disabled="!createApp">PC应用</DropdownItem>
                        <DropdownItem name="mobile" :disabled="!createApp">移动应用</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </Col>
            <Col style="float: right;">
                <Input v-model="searchKey" icon="md-search" placeholder="输入关键词查询" style="width: 200px;float: right;margin-top: 15px;"></Input>
            </Col>
        </Row>
        <div class="sdk-wrap">
            <div class="card-wrap">
                <Collapse simple class="sdk-panel">
                    <Panel name="1">
                        <span class="panel-icon">
                            <i class="iconfont">&#xe6ce;</i>
                        </span>
                        <span class="panel-info">PC端应用</span>
                        <div slot="content" class="card-content">
                            <p v-show="noPCApp" class="noAppTips">暂无PC端应用</p>
                            <Row v-show="!noPCApp">
                                <Col class="app-card" v-for="(item, index) in searchAppList.newPCData" :key="item.id" :xl="{ span: 5, offset: (index+1)%4 == 1 ? 0 : 1 }" :xxl="{ span: 3, offset: (index+1)%6 == 1 ? 0 : 1 }">
                                    <div class="app-card-logo" @click="getAppTree(item)">
                                        <img v-show="item.extConfig.logoImg" :src="item.extConfig.logoImg" alt="item.title">
                                    </div>
                                    <div class="app-card-info">
                                        <p class="app-title">{{ item.title }}</p>
                                        <p class="app-id">ID: {{ item.id }}</p>
                                        <Row class="hover-card-info">
                                            <Col span="10">
                                                <span v-show="item.appName != 'modeler'">路由: </span><a :href="quickToLoad" target="_blank" v-show="item.appName != 'modeler'" @click.stop.prevent="joinUrl(item)">{{ item.startPageURL }}</a>
                                            </Col>
                                            <Col span="14" class="fr">
                                                <!-- 默认应用不可删除 -->
                                                <Tooltip class="fr" v-show="item.appName == 'default'" content="默认应用不可删除" placement="top">
                                                    <span>
                                                        <Icon class="setIcon" style="color: #999;" type="ios-trash"></Icon>
                                                    </span>
                                                </Tooltip>
                                                <Poptip
                                                    v-bind:id="step3(index)"
                                                    confirm
                                                    v-show="item.appName != 'default' && item.appName != 'modeler'"
                                                    transfer
                                                    placement="left"
                                                    class="fr"
                                                    style="text-align: left;"
                                                    width="300"
                                                    @on-ok="toDelete(item.id)"
                                                    @on-cancel="cancelDel">
                                                    <span>
                                                        <Icon class="setIcon" type="ios-trash"></Icon>
                                                    </span>
                                                    <div slot="title">
                                                        <h4>确定要删除选中的应用么?</h4>
                                                        <p>如果删除应用，会影响到相关模块的浏览及操作。</p>
                                                    </div>
                                                </Poptip>
                                                <!-- 默认应用不可删除Ending -->
                                                <Tooltip class="fr" transfer content="应用配置">
                                                    <span @click="appSetting(1, item)" class="fr" v-bind:id="step2(index)">
                                                        <Icon class="setIcon" type="md-settings"></Icon>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip class="fr" transfer content="模块配置">
                                                    <span v-bind:id="step(index)" @click="getAppTree(item)" class="fr">
                                                        <Icon class="setIcon" type="logo-buffer"></Icon>
                                                    </span>
                                                </Tooltip>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Panel>
                </Collapse>
            </div>
        </div>
        <div class="sdk-wrap">
            <div class="card-wrap">
                <Collapse simple class="sdk-panel">
                    <Panel name="1">
                        <span class="panel-icon">
                            <i style="color: #1AB395" class="iconfont">&#xe6cc;</i>
                        </span>
                        <span class="panel-info">移动端应用</span>
                        <div slot="content" class="card-content">
                            <p v-show="noMobileApp" class="noAppTips">暂无移动端应用</p>
                            <Row v-show="!noMobileApp">
                                <Col class="app-card" v-for="(item, index) in searchAppList.newMobileData" :key="item.id" :xl="{ span: 5, offset: (index+1)%4 == 1 ? 0 : 1 }" :xxl="{ span: 3, offset: (index+1)%6 == 1 ? 0 : 1 }">
                                    <div class="app-card-logo" @click="getAppTree(item, 'Mobile')">
                                        <img v-show="item.extConfig.logoImg" :src="item.extConfig.logoImg" alt="item.title">
                                    </div>
                                    <div class="app-card-info">
                                        <p class="app-title">{{ item.title }}</p>
                                        <p class="app-id">ID: {{ item.id }}</p>
                                        <Row class="hover-card-info">
                                            <Col span="10">
                                                <span v-show="item.appName != 'modeler'">路由: </span><a :href="quickToLoad" target="_blank" v-show="item.appName != 'modeler'" @click.stop.prevent="joinMobileUrl(item)">login</a>
                                            </Col>
                                            <Col span="14" class="fr">
                                                <!-- 默认应用不可删除 -->
                                                <Tooltip class="fr" v-show="item.appName == 'default'" content="默认应用不可删除" placement="top">
                                                    <span>
                                                        <Icon class="setIcon" style="color: #999;" type="ios-trash"></Icon>
                                                    </span>
                                                </Tooltip>
                                                <Poptip
                                                    confirm
                                                    v-show="item.appName != 'default' && item.appName != 'modeler'"
                                                    transfer
                                                    placement="left"
                                                    class="fr"
                                                    style="text-align: left;"
                                                    width="300"
                                                    @on-ok="toDelete(item.id)"
                                                    @on-cancel="cancelDel">
                                                    <span>
                                                        <Icon class="setIcon" type="ios-trash"></Icon>
                                                    </span>
                                                    <div slot="title">
                                                        <h4>确定要删除选中的应用么?</h4>
                                                        <p>如果删除应用，会影响到相关模块的浏览及操作。</p>
                                                    </div>
                                                </Poptip>
                                                <!-- 默认应用不可删除Ending -->
                                                <Tooltip class="fr" transfer content="应用配置">
                                                    <span @click="appSetting(3, item)" class="fr">
                                                        <Icon class="setIcon" type="md-settings"></Icon>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip class="fr" transfer content="模块配置">
                                                    <span @click="getAppTree(item, 'Mobile')" class="fr">
                                                        <Icon class="setIcon" type="logo-buffer"></Icon>
                                                    </span>
                                                </Tooltip>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Panel>
                </Collapse>
            </div>
        </div>

        <!-- 应用信息弹窗 -->
        <Modal
            id="createAppModal"
            v-model="appModal"
            :mask-closable="false"
            width="45%"
            @on-visible-change="cancelAppModal"
            :title="modalTitle">
            <Form ref="appForm" :model="appForm" :rules="appRules" :label-width="120">
                <FormItem label="英文名称" prop="appName">
                    <Input id="appClassNameinput" v-model.trim="appForm.appName" :disabled="isDefalut || modelerApp"></Input>
                    <span class="formTip">该名称会作为app端进入应用的基础路由名称</span>
                    <span v-show="isExist">* 该名称已存在!</span>
                </FormItem>
                <FormItem label="中文名称" prop="title">
                    <Input id="appDisplayNameinput" v-model="appForm.title"></Input>
                    <span class="formTip">显示在应用中的名称</span>
                </FormItem>
                <!-- <FormItem label="登陆页路由" prop="startPageURL">
                    <Input v-model.trim="appForm.startPageURL"></Input>
                    <span class="formTip">登陆应用,URL最后斜杠后面的自定义字符串,例如：如果登录页路由为toLogin，那么入口路由为localhost:8081/app-web/toLogin</span>
                </FormItem> -->
                <FormItem v-show="noMobile" label="首页地址" prop="extConfig.indexPageUrl">
                    <Input id="homeURL" v-model="appForm.extConfig.indexPageUrl" type="textarea" :rows="1"></Input>
                    <span class="formTip">当进入应用以后，首页内容的URL完整地址</span>
                </FormItem>
                <FormItem v-show="noMobile" label="起始操作" prop="extConfig.indexPageOpr">
                    <Input id="startOperation" v-model="appForm.extConfig.indexPageOpr"></Input>
                    <span class="formTip">当进入应用以后，默认直接打开的操作表单</span>
                </FormItem>
                <FormItem label="LOGO" prop="extConfig.logoImg">
                    <img v-if="showLogo" :src="appForm.extConfig.logoImg" class="avatarImg">
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
                    <span class="formTip">应用LOGO图标</span>
                </FormItem>
                <FormItem v-show="noMobile" label="图标" prop="extConfig.icoImg">
                    <img v-show="showIco" :src="appForm.extConfig.icoImg" class="avatarImg">
                    <Upload
                        id="appIcon"
                        ref="uploads"
                        :show-upload-list="false"
                        :format="['jpg','jpeg','png']"
                        :max-size="2048"
                        :before-upload="handleBeforeUploadIco"
                        action=""
                        type="drag"
                        style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="ios-camera" size="20"></Icon>
                        </div>
                    </Upload>
                    <span class="formTip">应用在标签页上显示的icon</span>
                </FormItem>
                <FormItem label="皮肤" v-show="!modelerApp && noMobile" prop="extConfig.skinStyle">
                    <Select id="selectThemeColor" v-model="appForm.extConfig.skinStyle">
                        <Option v-for="item in appSkin" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                    <span class="formTip">应用皮肤色系暂时提供两种：明亮，暗黑</span>
                </FormItem>
                <FormItem label="布局" v-show="!modelerApp && noMobile" prop="extConfig.flexDeriction">
                    <Select id="selectLayout" v-model="appForm.extConfig.flexDeriction">
                        <Option v-for="item in appFlex" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                    <span class="formTip">应用展示在用户面前的主要路由布局，分为两种：左右布局，上下布局</span>
                </FormItem>
                <FormItem v-show="noMobile" label="多页签" prop="extConfig.showTabs">
                    <RadioGroup v-model="appForm.extConfig.showTabs">
                        <Radio label="show">开启</Radio>
                        <Radio label="hide">关闭</Radio>
                    </RadioGroup>
                    <!-- <Switch v-model="appForm.extConfig.showTabs">
                        <span slot="open">开</span>
                        <span slot="close">关</span>
                    </Switch> -->
                </FormItem>
                <!-- <FormItem label="主色调" prop="extConfig.appColor">
                    <div>
                        <ColorPicker v-model="appForm.extConfig.appColor" style="margin-right: 10px;" />
                        <span>{{ appForm.appColor }}</span>
                    </div>
                    <span class="formTip">选择应用的主色调配色，应用在任务栏背景色位置</span>
                </FormItem> -->
                <FormItem label="自定义样式文件" v-show="!modelerApp && noMobile" prop="extConfig.extendCss">
                    <Upload
                        id="customStyle"
                        multiple
                        type="drag"
                        :before-upload="handleBeforeUploadCss"
                        action="">
                        <div style="padding: 20px 0">
                            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                            <p>点击或拖拽上传文件</p>
                        </div>
                    </Upload>
                    <p v-if="showCss" style="color: #ecbe48;">
                        <Icon type="ios-document" style="position: relative; top: -2px;margin-right: 5px;"></Icon>
                        <span style="margin-right: 5px;">{{ appForm.extConfig.cssName }}</span>
                        <Icon type="md-arrow-down" style="position: relative; top: -2px;cursor: pointer;" @click.native="downloadCss"></Icon>
                    </p>
                    <span class="formTip">用于满足应用需要展示特殊样式, 非必须上传项</span>
                </FormItem>
                <FormItem label="自定义脚本文件" v-show="!modelerApp && noMobile" prop="extConfig.extendJs">
                    <Row>
                        <Col span="21">
<!--                            <editor id="customScript" v-model="appForm.extConfig.extendJs" @init="editorInit" ></editor>-->
                          <MonacoEditor id="customScript" v-model="appForm.extConfig.extendJs" @init="editorInit" :lang="'javascript'" theme="chrome" width="100%" height="200"></MonacoEditor>
                        </Col>
                        <Col span="2" offset="1">
                            <Row>
                                <Col span="10">
                                    <Button id="magnifyButton" shape="circle" type="default" icon="ios-expand" @click="changeBigSize"></Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <span class="formTip">支持应用外部脚本, 非必须填写项</span>
                </FormItem>
                <FormItem v-show="noMobile" label="描述" prop="note">
                    <Input d="appDescription" v-model="appForm.note" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入应用描述..."></Input>
                    <span class="formTip">关于应用的简单说明</span>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button id="cancelAppButton" type="text" @click="cancelModal">取消</Button>
                <Button id="confirmAppButton" type="primary" :loading="appSetLoading" @click="confirmAppInfo">确认</Button>
            </div>
        </Modal>
        <!-- 应用信息弹窗ENDing -->

        <!-- 最大化编辑器 -->
        <Modal
            v-model="isFullScreen"
            title="脚本编辑"
            :mask-closable="false"
            width="80%"
            @on-ok="confirmScript"
            @on-cancel="cancelScript">
          <MonacoEditor v-model="commonScript" @init="editorInit" :lang="'javascript'" theme="chrome" width="100%" height="600"></MonacoEditor>
        </Modal>
        <!-- 最大化编辑器ENDING -->
    </div>
</template>

<script>
    import { getApps, getAppCssById, uploadLogo, uploadIco, updateApp, addApp, delApp } from "@/api/others";
    import defaultLogo from "@/assets/images/dLogo.jpg";
    import MonacoEditor from "@/views/functional-model/components/MonacoEditor";

    export default {
        props: ["store", "route", "router", "root"],
        data() {
            const validateCname = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('中文名不能为空'));
                } else {
                    if(value.length > 32) {
                        callback(new Error('中文名不能超过32个字符哦～'));
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
                modalTitle: "新建应用",
                isDefalut: false,
                appModal: false,
                isFullScreen: false,
                commonScript: "",
                noPCApp: false,
                noMobileApp: false,
                appSetLoading: false,
                isExist: false,
                reloadForm: true,
                appList: [],
                appMobileList: [],
                currentApp: {},
                quickToLoad: '',
                noMobile: true,

                appForm: {
                    appName: '',
                    title: '',
                    startPageURL: 'login',
                    note: '',
                    type: 'PC',
                    extConfig: {
                        indexPageUrl: 'home',
                        indexPageOpr: '',
                        // appColor: '#495060',
                        logoImg: '',
                        skinStyle: 'light',
                        flexDeriction: '左右任务栏布局',
                        icoImg: '',
                        cssName: '',
                        extendCss: '',
                        extendJs: '',
                        showTabs: 'show'
                    }
                },

                logoFile: null,
                showLogo: false,
                icoFile: null,
                showIco: false,
                cssFile: null,
                showCss: false,

                appRules: {
                    appName: [
                        { required: true, message: "英文名不能为空哦～", trigger: "blur" },
                        { validator: validateEname, trigger: 'blur' }
                    ],
                    title: [
                        { required: true, message: "中文名不能为空哦～", trigger: "blur" },
                        { validator: validateCname, trigger: 'blur' }
                    ],
                    // 'extConfig.logoImg': [{ required: true,
                    //     message: "LOGO图标不能为空哦～",
                    //     trigger: "change",
                    //     validator:(rule, value, callback) => {
                    //         if(!value) {
                    //             return callback(new Error('LOGO图标不能为空哦～'))
                    //         } else {
                    //             callback()
                    //         }
                    //     }
                    // }],
                    // 'extConfig.icoImg': [{ required: true,
                    //     message: "页签图标不能为空哦～",
                    //     trigger: "change",
                    //     validator:(rule, value, callback) => {
                    //         if(!value) {
                    //             return callback(new Error('LOGO图标不能为空哦～'))
                    //         } else {
                    //             callback()
                    //         }
                    //     }
                    // }]
                },
                appSkin: [
                    {
                        value: 'light',
                        label: '简约白'
                    },
                    {
                        value: 'dark',
                        label: '深沉黑'
                    }
                ],
                appFlex: [
                    {
                        value: '左右任务栏布局',
                        label: '左右任务栏布局'
                    },
                    {
                        value: '上下任务栏布局',
                        label: '上下任务栏布局'
                    }
                ],

                imgName: '',
                visible: false,
                uploadList: [],
              modelerApp: false, //modeler应用
              createApp: true,
              searchKey: ''
            }
        },
        components: {
          MonacoEditor,
            // editor: require("vue2-ace-editor")
        },
        async created(){

            this.createApp = sessionStorage.getItem("usernameM") == 'admin'
            console.log(this.createApp)
        },
        watch: {
            searchAppList: {
                handler(val, oldVal) {
                    this.noPCApp = val.newPCData.length > 0 ? false : true;
                    this.noMobileApp = val.newMobileData.length > 0 ? false : true;
                },
                immediate: true,
                deep: true
            }
        },
        computed: {
            searchAppList() {
                let sk = this.searchKey.toLowerCase().trimStart().trimEnd();
                let newResult = {
                    newPCData: [],
                    newMobileData: []
                }
                if (sk) {
                    this.appList.forEach(function (obj) {
                        // 关键字搜索
                        if (String(obj['title']).toLowerCase().indexOf(sk) > -1) {
                            newResult.newPCData.push(obj);
                        }
                    });
                    this.appMobileList.forEach(function (mobj) {
                        // 关键字搜索
                        if (String(mobj['title']).toLowerCase().indexOf(sk) > -1) {
                            newResult.newMobileData.push(mobj);
                        }
                    });
                    return newResult
                }else{

                    newResult.newPCData = this.appList;
                    newResult.newMobileData = this.appMobileList;
                    return newResult
                }

            }
        },
        methods: {
            editorInit() {
                require("brace/ext/language_tools"); //language extension prerequsite...
                require("brace/mode/html");
                require("brace/mode/javascript"); //language
                require("brace/mode/less");
                require("brace/theme/chrome");
                require("brace/snippets/javascript"); //snippet
            },

            globalRefresh() {
                this.getAppList();
            },

            createNewApp(name) {

                if(name == 'pc') {
                    this.appSetting(0);
                } else {
                    this.appSetting(2);
                }

            },

            // 获取所有应用
            getAppList() {

                this.$Spin.show();
                this.appList = [];
                this.appMobileList = [];
                this.logoFile = null;
                this.icoFile = null;
                this.cssFile = null;
                this.appModal = false;
                this.showLogo = false;
                this.showIco = false;
                this.showCss = false;
                // this.$refs['appForm'].resetFields();
                this.appForm.note = '';

                getApps({withModelerApp: true}).then(response => {

                    this.$Spin.hide();
                    let res = response.data;

                    if(!res.success) {
                        this.$Message.error(res.message);
                    } else {
                        if(res.data.length == 0 || res.data == undefined) {

                            this.noPCApp = true;
                            this.noMobileApp = true;

                        } else {

                            // 如果仅有一个默认应用 并且默认应用没有修改过LOGO 添加默认LOGO
                            if(res.data.length == 1) {

                                if(res.data[0].extConfig == '') {

                                    res.data[0].extConfig = {
                                        indexPageUrl: 'home',
                                        indexPageOpr: '',
                                        // appColor: '#495060',
                                        logoImg: defaultLogo,
                                        skinStyle: 'light',
                                        flexDeriction: '左右任务栏布局',
                                        icoImg: defaultLogo,
                                        cssName: '',
                                        extendCss: '',
                                        extendJs: ''
                                    }
                                    res.data[0].startPageURL = 'login';

                                } else {

                                    try {

                                        res.data[0].extConfig = JSON.parse(res.data[0].extConfig);

                                        // 兼容性增加外部脚本功能
                                        if(!res.data[0].extConfig.extendJs || res.data[0].extConfig.extendJs == undefined) {
                                            res.data[0].extConfig.extendJs = '';
                                        }

                                        if(res.data[0].extConfig.logoImg == '' || res.data[0].extConfig.logoImg.indexOf('modeler-web') != -1) {
                                            res.data[0].extConfig.logoImg = defaultLogo;
                                        }

                                        if(res.data[0].extConfig.icoImg == '' || res.data[0].extConfig.icoImg.indexOf('modeler-web') != -1) {
                                            res.data[0].extConfig.icoImg = defaultLogo;
                                        }

                                    } catch(e) {

                                        res.data[i].extConfig = {
                                            indexPageUrl: 'home',
                                            indexPageOpr: '',
                                            // appColor: '#495060',
                                            logoImg: defaultLogo,
                                            skinStyle: 'light',
                                            flexDeriction: '左右任务栏布局',
                                            icoImg: defaultLogo,
                                            cssName: '',
                                            extendCss: '',
                                            extendJs: ''
                                        }

                                        res.data[i].startPageURL = 'login';

                                    }

                                }

                                this.appList = res.data;

                            } else {

                                // 需要处理一下后台返回回来的extConfig 默认返回字符串类型
                                for (var i in res.data) {

                                    if(!res.data[i].extConfig || res.data[i].extConfig == '') {
                                        res.data[i].extConfig = {
                                            indexPageUrl: 'home',
                                            indexPageOpr: '',
                                            // appColor: '#495060',
                                            logoImg: defaultLogo,
                                            skinStyle: 'light',
                                            flexDeriction: '左右任务栏布局',
                                            icoImg: defaultLogo,
                                            cssName: '',
                                            extendCss: '',
                                            extendJs: ''
                                        }

                                        res.data[i].startPageURL = 'login';
                                    } else {

                                        try {

                                            res.data[i].extConfig = JSON.parse(res.data[i].extConfig);
                                            if(res.data[i].extConfig.logoImg.indexOf('modeler-web') != -1 || res.data[i].extConfig.logoImg == '') {
                                                res.data[i].extConfig.logoImg = defaultLogo;
                                            }

                                        } catch(e) {

                                            res.data[i].extConfig = {
                                                indexPageUrl: 'home',
                                                indexPageOpr: '',
                                                // appColor: '#495060',
                                                logoImg: defaultLogo,
                                                skinStyle: 'light',
                                                flexDeriction: '左右任务栏布局',
                                                icoImg: defaultLogo,
                                                cssName: '',
                                                extendCss: '',
                                                extendJs: ''
                                            }

                                            res.data[i].startPageURL = 'login';

                                        }

                                    }

                                    if(res.data[i].type == 'PC') {
                                        this.appList.push(res.data[i]);
                                    } else if(res.data[i].type == 'Mobile'){
                                        this.appMobileList.push(res.data[i]);
                                    }
                                }

                            }

                            // this.appList = res.data;
                        }
                    }

                }).catch(e => {
                    this.$Spin.hide();
                    console.log(e);
                });
            },
            //应用模块管理按钮编号
            step:function(i){
            return "appModuleManager" +i
            },
            step2:function(i){
            return "editApp" +i
            },
            step3:function(i){
            return "deleteApp" +i
            },

            // 跳转到应用树
            getAppTree(item, mFlag) {
                localStorage.setItem('itemTitle', item.title);
                localStorage.setItem('itemLogo', item.extConfig.logoImg);
                localStorage.setItem('currentAPPID', item.id);
                localStorage.setItem('currentAPPType', item.type);
                localStorage.setItem('itemAppName', item.appName);
                localStorage.setItem('defaultOpr', item.defaultOpr);
                localStorage.setItem('btmOpr', item.extConfig.btmOprOrder);

                if(mFlag && mFlag == 'Mobile') {
                    localStorage.setItem('mobileAppConfig', JSON.stringify(item.extConfig));
                }

                this.router.push({
                    name: 'applicationTree-management',
                    query: {
                        appId: item.id,
                    }
                })

            },

            cancelModal() {

                this.$refs.appForm.resetFields();
                this.appModal = false;

            },

            /**
             * @description 新增/编辑应用
             * @param status 0:新建pc应用 1：编辑PC应用 2: 新建移动应用  3：编辑移动端应用
            */
            appSetting(status, item) {

                this.modelerApp = false;
                this.appModal = true;
                if(status == 0 || status == 2) {

                    this.modalTitle = "新建应用";
                    this.isDefalut = false;
                    this.showCss = false;
                    this.appForm.id = '';
                    this.showLogo = false;
                    this.showIco = false;
                    this.appForm.type = status === 0 ? 'PC' : 'Mobile';

                    // this.$refs['appForm'].resetFields();

                    this.showLogo = true;
                    this.showIco = true;
                    this.appForm.extConfig.icoImg = defaultLogo;
                    this.appForm.extConfig.logoImg = defaultLogo;
                    this.appForm.extConfig.showTabs = 'show';

                    this.cssFile = null;
                    this.logoFile = null;
                    this.icoFile = null;

                    this.noMobile = status == 2 ? false : true;

                } else {

                    this.noMobile = status == 3 ? false : true;

                    if(item.id === 'C9C2F20D1EBA4A4FA4B6FA47C0F04D20'){
                        this.modelerApp = true;
                    }

                    this.modalTitle = "编辑应用";
                    // this.reloadForm = false;
                    // setTimeout(() => {
                    //     this.reloadForm = true;
                    //     this.appForm = JSON.parse(JSON.stringify(item));
                    // }, 50)
                    // this.$refs['appForm'].resetFields();
                    this.appForm = JSON.parse(JSON.stringify(item));     // 避免弹窗内容实时更改对应应用

                    this.appForm.extConfig.showTabs = item.extConfig.showTabs ? item.extConfig.showTabs : 'show';
                    if(this.noMobile) {

                        if(item.extConfig.icoImg == '' || item.extConfig.icoImg.indexOf('modeler-web/') != -1) {
                            this.appForm.extConfig.icoImg = defaultLogo;
                        }

                        // 默认应用不允许修改英文名
                        item.appName == 'default' ? this.isDefalut = true : this.isDefalut = false;
                        item.extConfig.cssName ? this.showCss = true : this.showCss = false;

                    }
                    // if(item.extConfig.icoImg == '' || item.extConfig.icoImg.indexOf('modeler-web/') != -1) {
                    //     this.appForm.extConfig.icoImg = defaultLogo;
                    // }

                    if(item.extConfig.logoImg == '' || item.extConfig.logoImg.indexOf('modeler-web/') != -1) {
                        this.appForm.extConfig.logoImg = defaultLogo;
                    }
                    this.showLogo = true;
                    this.showIco = true;

                    // 当前应用是否已设置LOGO .ICO
                    // item.extConfig.logoImg ? this.showLogo = true : this.showLogo = false;
                    // item.extConfig.icoImg ? this.showIco = true : this.showIco = false;
                    // item.extConfig.cssName ? this.showCss = true : this.showCss = false;

                }
            },

            // 上传LOGO
            uploadLogoEvent() {

                var formData = new FormData();
                formData.append("logo", this.logoFile);

                let logoPromise = new Promise((resolve, reject) => {
                    uploadLogo(this.appForm.id, formData).then(res => {
                        resolve(res);

                        if(!res.success) {
                            this.$Message.error('服务繁忙上传失败, 请稍后再试')
                        }
                    }).catch(e => {
                        console.log(e);
                        reject(e);
                        this.$Spin.hide();
                    });
                })

            },

            // 上传.ico
            uploadIcoEvent() {

                var formData = new FormData();
                formData.append("icon", this.icoFile);

                let icoPromise = new Promise((resolve, reject) => {
                    uploadIco(this.appForm.id, formData).then(res => {
                        resolve(res);

                        if(!res.success) {
                            this.$Message.error('服务繁忙上传失败, 请稍后再试')
                        }
                    }).catch(e => {
                        reject(e);
                        console.log(e);
                        this.$Spin.hide();
                    });
                })

            },

            // 点击叉号关闭应用弹窗
            cancelAppModal(state) {

                if(!state && !this.isFullScreen) {

                    this.$refs.appForm.resetFields();
                    this.appForm = {
                        appName: '',
                        title: '',
                        startPageURL: 'login',
                        note: '',
                        extConfig: {
                            indexPageUrl: 'home',
                            indexPageOpr: '',
                            // appColor: '#495060',
                            logoImg: defaultLogo,
                            skinStyle: 'light',
                            flexDeriction: '左右任务栏布局',
                            icoImg: defaultLogo,
                            cssName: '',
                            extendCss: '',
                            extendJs: ''
                        }
                    }

                }

            },

            // 下载应用的CSS
            downloadCss() {

                getAppCssById(this.appForm.id).then(res => {

                    if(res.data) {

                        let cssContent = res.data;

                        let eleLink = document.createElement('a');
                        eleLink.download = this.appForm.extConfig.cssName;
                        eleLink.style.display = 'none';
                        let blob = new Blob([cssContent]);
                        eleLink.href = URL.createObjectURL(blob);
                        document.body.appendChild(eleLink);
                        eleLink.click();
                        document.body.removeChild(eleLink);

                    }

                    // var elementA = document.createElement('a');
                    // elementA.setAttribute('href', `${Config.baseUrl}/apps/${this.appForm.id}/css`);
                    // elementA.setAttribute('download', "app.css");
                    // elementA.style.display = 'none';
                    // document.body.appendChild(elementA);
                    // elementA.click();
                    // document.body.removeChild(elementA);

                }).catch(e => {
                    console.log(e);
                });

            },

            // 新增或修改应用info
            confirmAppInfo() {

                // *******目前应用只控制中英文姓名 & LOGO .ico不能为空********
                this.$refs['appForm'].validate(valid => {

                    if(!valid) {
                        this.$Message.warning('请确认中英文名和图标不能为空以及格式哦～');
                    } else {

                        if(this.modalTitle == "编辑应用") {
                            let updatePromise = new Promise((resolve, reject) => {

                                let temAppForm = {...this.appForm};
                                temAppForm.extConfig = JSON.stringify(temAppForm.extConfig);

                                updateApp(temAppForm).then(res => {
                                    resolve(res);
                                    if(!res.success) {

                                        this.$Message.error(res.message);
                                        // this.appForm.extConfig = JSON.parse(this.appForm.extConfig);
                                        if(this.logoFile != null) {
                                            const fileList = this.$refs.upload.fileList;
                                            this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
                                        }

                                        if(this.icoFile != null) {
                                            const fileLists = this.$refs.uploads.fileList;
                                            this.$refs.uploads.fileList.splice(fileLists.indexOf(file), 1);
                                        }

                                    } else {
                                        this.getAppList();

                                        // 如果上传了新的LOGO & .ico图片 更新
                                        if(this.logoFile != null) {
                                            this.uploadLogoEvent();
                                        }
                                        if(this.icoFile != null) {
                                            this.uploadIcoEvent();
                                        }

                                        this.appModal = false;

                                        this.showLogo = false;
                                        this.showIco = false;
                                        this.appForm = {
                                            appName: '',
                                            title: '',
                                            startPageURL: 'login',
                                            note: '',
                                            extConfig: {
                                                indexPageUrl: 'home',
                                                indexPageOpr: '',
                                                // appColor: '#495060',
                                                logoImg: defaultLogo,
                                                skinStyle: 'light',
                                                flexDeriction: '左右任务栏布局',
                                                icoImg: defaultLogo,
                                                cssName: '',
                                                extendCss: '',
                                                extendJs: ''
                                            }
                                        }

                                        this.$Message.success('更新应用成功');
                                    }

                                }).catch(e => {
                                    console.log(e);
                                    reject(e);
                                    this.$Spin.hide();
                                });

                            })


                        } else {

                            // LOGO & ico 防空上传
                            // if (this.logoFile == null) {

                            //     this.$Message.warning('您还未选择LOGO图片');

                            // } else if (this.icoFile == null) {

                            //     this.$Message.warning('您还未选择.ico图片');

                            // } else {

                                let addPromise = new Promise((resolve, reject) => {

                                    let finalConfig = this.appForm;
                                    finalConfig.extConfig = JSON.stringify(finalConfig.extConfig);

                                    addApp(finalConfig).then(res => {
                                        resolve(res);

                                        if(!res.success) {

                                            this.$Message.error(res.message);

                                            this.appForm.extConfig = JSON.parse(this.appForm.extConfig);
                                            if(this.logoFile != null) {

                                                const fileList = this.$refs.upload.fileList;
                                                this.$refs.upload.fileList.splice(fileList.indexOf(fileList[0]), 1);

                                            }

                                            if (this.icoFile != null) {

                                                const fileLists = this.$refs.uploads.fileList;
                                                this.$refs.uploads.fileList.splice(fileLists.indexOf(fileLists[0]), 1);

                                            }

                                        } else {
                                            this.appModal = false;

                                            this.appForm.id = res.data;

                                            if(this.logoFile != null) {
                                                this.uploadLogoEvent();
                                            }

                                            if (this.icoFile != null) {
                                                this.uploadIcoEvent();
                                            }

                                            this.getAppList();

                                            this.showLogo = false;
                                            this.showIco = false;
                                            this.appForm = {
                                                appName: '',
                                                title: '',
                                                startPageURL: 'login',
                                                note: '',
                                                extConfig: {
                                                    indexPageUrl: 'home',
                                                    indexPageOpr: '',
                                                    // appColor: '#495060',
                                                    logoImg: defaultLogo,
                                                    skinStyle: 'light',
                                                    flexDeriction: '左右任务栏布局',
                                                    icoImg: defaultLogo,
                                                    cssName: '',
                                                    extendCss: '',
                                                    extendJs: ''
                                                }
                                            }

                                            this.$Message.success('应用创建成功');

                                        }
                                    }).catch(e => {
                                        console.log(e);
                                        reject(e);
                                        this.$Spin.hide();
                                    });

                                })

                            // }

                        }

                    }

                })

            },

            // 删除应用
            toDelete(dId) {
                delApp(dId).then(res => {
                   if(!res.success) {
                       this.$Message.error(res.message);
                   } else {
                       this.getAppList();
                       this.$Message.success('删除应用成功');
                   }
                }).catch(e => {
                    console.log(e);
                    this.$Spin.hide();
                });
            },

            // 显示最大化编辑器窗口
            changeBigSize() {

                this.appModal = false;
                this.commonScript = this.appForm.extConfig.extendJs;
                this.isFullScreen = true;

            },

            // 最大化脚本编辑确认
            confirmScript() {

                this.isFullScreen = false;
                this.appForm.extConfig.extendJs = this.commonScript;
                this.appModal = true;

            },
            // 关闭最大化脚本编辑弹窗
            cancelScript() {

                this.isFullScreen = false;
                this.appModal = true;

                this.commonScript = '';
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
            // 拼接跳转到app端url
            joinUrl(item) {

                let appSelf = item.appName;
                let host = this.portFormat()
                localStorage.setItem('refshFlag', 6);
                this.quickToLoad = `${Config.protocol}//${host}/${Config.baseAppRouteName}/login?openAppName=${appSelf}`;
                // this.quickToLoad = `http://192.168.10.81:8180/app-web/${appSelf}${item.startPageURL}`;
                window.open(this.quickToLoad);

            },

            // 拼接跳转到app端url
            joinMobileUrl(item) {

                let appSelf = item.appName;
                let host = this.portFormat()
                localStorage.setItem('refshFlag', 6);
                this.quickToLoad = `${Config.protocol}//${host}/${Config.baseMobileRouteName}/login?openAppName=${appSelf}`;
                // this.quickToLoad = `http://192.168.10.81:8180/app-web/${appSelf}${item.startPageURL}`;
                window.open(this.quickToLoad);

            },

            // 取消删除
            cancelDel() {

            },

            handleFormatError (file) {
                this.$Notice.warning({
                    title: 'The file format is incorrect',
                    desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: 'Exceeding file size limit',
                    desc: 'File  ' + file.name + ' is too large, no more than 2M.'
                });
            },

            // 上传LOGO
            handleBeforeUpload (file) {

                const isJPG = (file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/jpeg');
                const isLt2M = file.size / 1024 / 1024 < 2;

                if (!isJPG) {
                this.$Message.error('上传LOGO图片只能是 JPG/JPEG/PNG 格式!');
                }
                if (!isLt2M) {
                this.$Message.error('上传LOGO图片大小不能超过 2MB!');
                }

                if(isJPG && isLt2M) {

                    var _self = this;
                    if(window.FileReader) {

                        var fr = new FileReader();
                        fr.onloadend = function(e) {
                            _self.appForm.extConfig.logoImg = e.target.result;
                            console.log(_self.appForm.extConfig.logoImg, _self.appList[1])
                            _self.$refs.appForm.validateField('extConfig.logoImg');
                            _self.showLogo = true;
                        };
                        fr.readAsDataURL(file);

                    }
                    this.logoFile = file;

                }
                return !isJPG && isLt2M;

            },

            // 上传.ico文件
            handleBeforeUploadIco (file) {

                const isJPG = (file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/jpeg');
                const isLt2M = file.size / 1024 / 1024 < 2;

                if (!isJPG) {
                    this.$Message.error('上传LOGO图片只能是 JPG/JPEG/PNG 格式!');
                }
                if (!isLt2M) {
                    this.$Message.error('上传LOGO图片大小不能超过 2MB!');
                }

                if(isJPG && isLt2M) {

                    var _self = this;
                    if(window.FileReader) {

                        var fr = new FileReader();
                        fr.onloadend = function(e) {
                            _self.appForm.extConfig.icoImg = e.target.result;
                            _self.$refs.appForm.validateField('extConfig.icoImg');
                            _self.showIco = true;
                        };
                        fr.readAsDataURL(file);

                    }
                    this.icoFile = file;

                }
                return !isJPG && isLt2M;

            },

            // 上传CSS文件
            handleBeforeUploadCss(file) {

                const isCSS = (file.type === 'text/css');

                if (!isCSS) {

                    this.$Message.error('上传样式表只能是 CSS 文件!');

                } else {

                    var _self = this;
                    if(window.FileReader) {

                        var fr = new FileReader();
                        fr.onloadend = function(e) {
                            _self.appForm.extConfig.extendCss = e.target.result;
                            _self.appForm.extConfig.cssName = file.name;
                            _self.showCss = true;
                        };
                        fr.readAsBinaryString(file);

                    }
                    this.cssFile = file;

                }
                return !isCSS;
            }
        },
        mounted () {

            this.uploadList = this.$refs.upload.fileList;
            this.getAppList();
        }
    }
</script>

<style scoped>
    .fr {
        float: right;
    }
    .ivu-collapse>.ivu-collapse-item>.ivu-collapse-header {
        height: auto;
    }

    .noAppTips {
        text-align: center;
        margin-bottom: 20px;
    }

    .sdk-wrap {
        width: 100%;
        padding: 10px 15px 0;
    }

    .card-wrap {
        max-height: 600px;
        overflow-y: auto;
        background: #fff;
    }

    .sdk-panel {
        position: relative;
        border: none;
    }

    .sdk-panel>>>.ivu-collapse-item {
        border-radius: 8px;
    }

    .sdk-panel>>>.ivu-collapse-item>.ivu-collapse-header {
        height: 60px;
        line-height: 60px;
        color: #000;
    }

    .sdk-panel>>>.ivu-collapse>.ivu-collapse-item>.ivu-collapse-header>i {
        position: relative;
        top: -6px;
    }

    .panel-icon {
        margin-right: 10px;
    }

    .panel-icon i {
        font-size: 20px;
        color: #2D8CF0;
        position: relative;
        top: 2px;
    }

    .app-card {
        /* width: 15%; */
        height: 280px;
        border-radius: 8px;
        /* margin-right: 2%; */
        /* float: left; */
        overflow: hidden;
        margin-bottom: 15px;
    }

    .app-card:hover {
        cursor: pointer;
        box-shadow: 0px 5px 13px 8px rgba(204, 204, 204, 0.3);
    }
    .hover-card-info {
        display: none;
    }
    .app-card:hover .hover-card-info {
        display: block;
    }

    .app-card-logo {
        width: 100%;
        height: 60%;
    }
    .app-card-logo img {
        width: 100%;
        height: 100%;
    }

    .app-card-info {
        padding: 10px;
    }

    .app-head {
        height: 60px;
        line-height: 60px;
        background: #fff;
        padding: 0 20px 0 30px;
        color: #000;
    }

    .appLogo {
        width: 100px;
        height: 100px;
        background: #eee;
        float: left;
        margin-right: 20px;
    }

    .appLogo img {
        width: 100%;
        height: 100%;
    }

    .app-setting {
        float: right;
        margin-top: 30px;
        height: 40px;
        line-height: 40px;
        text-align: right;
    }

    .setIcon {
        font-size: 18px !important;
        color: #000;
        margin-right: 10px;
        cursor: pointer;
        vertical-align: middle;
    }

    .vertical-line {
        display: inline-block;
        width: 1px;
        height: 20px;
        background: #ddd;
        vertical-align: middle;
        margin: 0 10px;
    }

    .app-info {
        height: 50px;
        line-height: 50px;
    }

    .app-title {
        font-size: 16px !important;
        color: #333;
        margin-bottom: 10px;
        font-weight: 700;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }

    .app-id {
        color: #505A6E;
        font-size: 12px !important;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }

    .formTip {
        color: #666;
        font-size: 12px !important;
        display: block;
        height: 25px;
        line-height: 25px;
        margin-top: 5px;
    }

    .avatarImg {
        width: 60px;
        height: 60px;
        display: inline-block;
        margin-right: 15px;
        vertical-align: baseline;
    }

    .app-box {
        height: 730px;
        overflow-y: auto;
        padding: 15px;
    }
    @media screen and (min-width: 1800px) {
      .app-box {
        height: 730px;
      }
    }
    @media screen and (min-width: 1401px) and (max-width: 1699px) {
      .app-box {
        height: 560px;
      }
    }
    @media screen and (min-width: 1600px) and (max-width: 1799px){
      .app-box {
        height: 650px;
      }
    }
    @media screen and (max-width: 1400px) {
        .app-box {
            height: 420px;
        }
    }

</style>
