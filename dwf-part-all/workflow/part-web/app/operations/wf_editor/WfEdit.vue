<template>
   <div id="wfEdit" ref="main">
       <Row style="height:100%">
            <Col :span="20">
                <div :id="'managerbody'+pid" class="managerbody" style="margin: 10px;width:100%;" ref="managerbody">
                </div>
            </Col>
            <Col :span="4" :style="{height:'643px'}">
                <property-sheet
                    ref="editPropertySheet"
                    @on-close="closeSetDrawer()" 
                    :obj="propertyObj"
                    :wfprocess="propertyWfprocess"
                    :editable="true"
                ></property-sheet>
            </Col>
        </Row>
        
        <Modal v-model="releaseModal" title="发布流程" :mask-closable="false">
            <p v-if="propertyWfprocess!=null">发布流程：{{propertyWfprocess.name}}</p><br/>
            <Form ref="releaseForm" :model="releaseData" :rules="releaseRule">
                <FormItem prop="version">
                    发布版本：
                    <Input type="text" v-model="releaseData.version" placeholder="请输入版本号" style="width:70%"></Input>
                </FormItem>
                <FormItem prop="versionnote">
                   发布声明：
                   <Input type="textarea" v-model="releaseData.versionnote" placeholder="请输入发布说明" style="width:70%"></Input>
                <!-- <Input type="textarea" v-model="releaseData.versionnote"  :autosize="true" placeholder="请输入发布说明" style="width:70%"></Input> -->
                </FormItem>
            </Form>
             <div slot="footer">
                <Button type="text" size="large" @click="releaseModal = false">取消</Button>
                <Button type="primary" size="large" @click="onConfirmRelease">确认</Button>
            </div>
        </Modal>
        <Modal
            v-model="saveModal"
            title="该模型已修改，是否保存？"
            @on-ok="saveWfProcess"
            @on-cancel="saveModal = false">
        </Modal>

        <div class = "wf-edit-remote-JS">
        </div>

        <div ref="remoteCSS" v-if="cssShow">
            
            <link href="/app-web/static/workflow/plugins/bootstrap-3.3.5/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
            <link href="/app-web/static/workflow/plugins/font-awesome-4.7.0/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        </div>
   </div>
</template>

<script>
import $ from "jquery";
import global_ from "@/views/global.vue";
// import mdmain from "../../../public/static/workflow/js/mdmain.js";
import propertySheet from "../sub_components/setPropertySheet";
import {releaseTemplate, saveTemplate} from "../api/WfProcessApi";
const name = "wf-edit";

export default {
    props: ["store", "route","root"],
    components:{propertySheet},
    data() {
        return {
            pid: "",
            mdmain: null,
            showSetDrawer: true,
            propertyObj:null,
            propertyWfprocess: null,
            madminInst : null,
            // surl: global_.baseObjOther.replace("/dwf/v1", ""),

            js1: [

                "/plugins/jquery-2.1.1.min.js", 
                "/js/common/basic.js",
                "/js/common/utils.js", 

            ],
            js2: [
                "/js/ajax.js",
                "/plugins/bootstrap-3.3.5/js/bootstrap.min.js",
                "/js/common/data/data_zh.js",
                "/js/pm/tasks/abstracttask.js",
            ],
            js3: [
               
                "/js/pm/tasks/releasedwfprocess.js",
                
                "/js/pm/tasks/startpoint.js",
                "/js/pm/tasks/endpoint.js",
                "/js/pm/tasks/manualtask.js",
                "/js/pm/tasks/waitingtask.js",
                "/js/pm/tasks/subprocesspoint.js",
                "/js/pm/tasks/transition.js",
                "/js/pm/tasks/assignment.js",
                "/js/pm/data/constant.js",
                "/js/pm/data/datavariable.js",
                "/js/pm/data/parameter.js",
                
                
                "/js/pm/data/boolconstant.js",
                "/js/pm/data/intconstant.js",
                "/js/pm/data/doubleconstant.js",
                "/js/pm/data/strconstant.js",
                "/js/pm/data/datetimeconstant.js",
                "/js/pm/data/jsonconstant.js",
            ],
            js4: [
                "/js/pm/tasks/wfprocess.js",
                "/js/common/ui/buildtimeutils.js",
                "/js/common/ui/runtimeutils.js",
                "/js/pm/tasks/tasktextlabel.js",
                "/js/pm/tasks/accessiblevariable.js",
                "/js/pm/data/expression.js",

                "/js/admin/models/wfprocessinstance.js",


                "/js/pm/data/function.js",

                "/js/pm/pmservice.js",
                "/js/pm/pmundoredo.js",
                "/js/pm/pmprocessditor.js",
                "/js/pm/pmrlprocessditor.js",
                "/plugins/bootstrap-3.3.5/js/bootstrap.min.js",
                "/plugins/jqueryui/jquery-ui.min.js",
                "/js/dwf/mdmaincontent.js",
                "/js/dwf/mcplugin.js",
                "/js/dwf/getUrlaram.js",

            ],

            mdmainjs:"/js/mdmain.js",
            cssShow: false,

            releaseModal: false,
            releaseData:{
                version:"",//发布版本
                versionnote:"",//发布声明
            },
            releaseRule: {
                version: [
                    { required: true, message: "版本不能为空", trigger: "blur" },
                    {
                        pattern: /^[a-zA-Z0-9_\-/.\u0391-\uFFE5]+$/,
                        message: "版本名只能包含汉字、字母、数字、_、-、/或.",
                        trigger: "blur"
                    },{
                        max:32,
                        message: "版本名不能超过32个字符",
                        trigger: "blur"
                    },
                ]
            },
            saveModal: false,

        };

    },
    created() {
        console.log("store:", this.store);
        this.pid = this.route.meta.id;
        // this.root.wfTabCount = this.root.wfTabCount+1;
         
        this.activate();
        this.loadMadmin();
    },
    mounted(){
       try {
            this.mdmain = require('../../../../../public/static/workflow/js/mdmain.js').default;
        } catch (error) {
            console.error(error,"未装配流程代码");
        }
      //  this.loadMadmin();
    },
    methods:{
        activate() {
            this.cssShow = true;
        },
        globalRefresh(){
            this.$refs.editPropertySheet.load();
            if(this.madminInst){
                this.madminInst.refresh();
            }
        },
        loadMadmin(){
            var that = this;
            var dom = this.root.$refs.remoteJS;        
            let process= {
                'pid':that.route.meta.id
            };         
                 
            let user={
                'uid':that.store.state.user.userId,
                'uname':that.store.state.user.username,
                'tk':that.store.state.user.token, 
            }
            if(document.getElementsByClassName("wf-edit-remote-JS").length==0){
                this.jsLoaderPa(dom, this.js1, () => {
                    that.jsLoaderPa(dom, that.js2, () => {
                        if(document.getElementsByClassName("wf-admin-edit-remote-JS").length==0){
                           //
                            that.jsLoaderPa(dom, that.js3, () => {
                                that.jsLoader(dom, that.js4, () => {
                                  that.madminInst = this.mdmain(process, user, global_, that);
                                  // that.madminInst = this.mdmain(that.route.meta.id, that.surl, that.store.state.user.userId, that.store.state.user.username, that.store.state.user.token, that);
                                });
                            });
                        }else{
                            that.jsLoader(dom, that.js4, () => {
                              that.madminInst = this.mdmain(process, user, global_, that);
                              // that.madminInst = this.mdmain(that.route.meta.id, that.surl, that.store.state.user.userId, that.store.state.user.username, that.store.state.user.token,that);
                            });
                        }
                    });
                });
            
            }else{
                that.jsLoader(dom, that.js4, () => {
                    that.madminInst = this.mdmain(process, user, global_, that);
                    // that.madminInst = this.mdmain(that.route.meta.id, that.surl, that.store.state.user.userId, that.store.state.user.username, that.store.state.user.token,that);
                });              
            }
        },
        getWfprocess(){
            return this.wfprocess;
        },
       
        closeSetDrawer(){
            // this.showSetDrawer = false;
        },
        beforeLeave() {
            this.cssShow = false;
        },
        setWfProcess(wfprocess){
            console.log("setWfProcess",wfprocess);
            this.propertyWfprocess = wfprocess;
            // this.setPropertySheet(this.propertyWfprocess);
        },
        
        setPropertySheet(obj){
            console.log("setPropertySheet obj",obj);
            this.propertyObj = obj;
            // this.showSetDrawer = true;
        },
        
        releaseWfProcess(){
             if(this.$refs["releaseForm"]){
                this.$refs["releaseForm"].resetFields();
            }
            if (map[this.propertyWfprocess.id] != null) {
                var dirty = map[this.propertyWfprocess.id].getDirty();
                if (dirty) {
                    this.saveModal = true;
                }
            }
            this.releaseModal = true;
            
        },
         saveWfProcess(){
            let that = this;
             var processStr = map[this.propertyWfprocess.id].wfprocess.stringifyforJSON();
            saveTemplate(processStr).then(res =>{
                if(res.success){
                    map[that.propertyWfprocess.id].stack.save();
                    that.$Message.success("保存成功");
                }else{
                    that.$Message.error("保存失败");
                }
            });
        },
         onConfirmRelease(){
            this.$refs["releaseForm"].validate(valid=>{
                if(valid){
                    this.releaseProcess();
                } else {
                    this.$Message.error("请检查输入是否正确");
                }
            });
        },
       
        releaseProcess(){
            var that = this;
            var template = {
                templateId: that.propertyWfprocess.id,
                version: that.releaseData.version,
                description: that.releaseData.versionnote,
                releaser:that.store.state.user.username,
                releaserId: that.store.state.user.userId,
            };
            releaseTemplate(template).then(res => {
                console.log("res",res);
                if(res.success){
                    that.$Message.success("发布成功");
                    that.releaseModal = false;
                }else{
                    that.$Message.error("发布失败，该版本已存在");
                }
            });
        },
        jsLoaderPa(head, arr, cb) {

            var _load_index = 0;

            function onScriptLoad(node, e, url) {
                var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
                if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
                    head.removeChild(node);
                    onCallback();
                }
            }

            function onCallback() {
                _load_index++;
                if (_load_index == arr.length) {
                    cb();
                } 
            }

            var isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

            function load(url) {
                var node = document.createElement('script');
                // node.type = "module"; 
                node.async = true;
                node.charset = 'utf-8';
                node.src = url[0] == '/' ? "/app-web/static/workflow" + url : url;

                head.appendChild(node);
                if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera) {
                    node.attachEvent('onreadystatechange', function (e) {
                        onScriptLoad(node, e, url);
                    });
                } else {
                    node.addEventListener('load', function (e) {
                        onScriptLoad(node, e, url);
                    }, false);
                }
            }

            arr.forEach(url => { load(url) });
            // load(arr[_load_index]);
        },

        jsLoader(head, arr, cb) {

            var _load_index = 0;

            function onScriptLoad(node, e, url) {
                var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
                if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
                    // head.removeChild(node);
                    onCallback();
                }
            }

            function onCallback() {
                _load_index++;
                if (_load_index == arr.length) {
                    cb();
                } else {
                    load(arr[_load_index]);
                }
            }

            var isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

            function load(url) {
              // alert(url);
                var node = document.createElement('script');

                node.async = true;
                node.charset = 'utf-8';
                node.src = url[0] == '/' ? "/app-web/static/workflow" + url : url;

                head.appendChild(node);
                if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera) {
                    node.attachEvent('onreadystatechange', function (e) {
                        onScriptLoad(node, e, url);
                    });
                } else {
                    node.addEventListener('load', function (e) {
                        onScriptLoad(node, e, url);
                    }, false);
                }
            }

            load(arr[_load_index]);

        }
    },
}
</script>

<style >
    .time{
        font-size: 14px;
        font-weight: bold;
    }
    .content{
        padding-left: 5px;
    }
   .managerbody .col {
        float: left !important;
        position: relative;
        min-height: 1px;
    }
    .managerbody #maincontentFrm{
        margin: 0px; padding: 0px; 
        /* width: calc(100% - 240px) !important; */
        width: 100% !important;
        float: left;
        position: relative;
        /* display: inline; */
    }
    .managerbody #basicPropertyFrm{
        margin: 0px; padding: 0px; width: 200px !important;
        float: left;
        position: relative;
    }

</style>
