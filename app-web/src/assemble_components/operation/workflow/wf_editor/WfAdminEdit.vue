<template>
    <div id="wf-edit" ref="main">
       <Row>
            <Col span="20">
                <div :id="'managerbody'+pid" class="managerbody" style="margin: 10px;width:100% !important" ref="managerbody">
                </div>
            </Col>
            <Col span="4" :style="{height:'643px'}">
                <property-sheet
                    @on-close="closeSetDrawer()" 
                    :obj="propertyObj"
                    :wfprocess="propertyWfprocess"
                    :editable="false"
                ></property-sheet>
            </Col>
        </Row>
        

        <div class = "wf-admin-edit-remote-JS">
        </div>

        <div ref="remoteCSS" v-if="cssShow">
            <link href="/app-web/static/workflow/plugins/bootstrap-3.3.5/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
            <link href="/app-web/static/workflow/plugins/font-awesome-4.7.0/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
            <link href="/app-web/static/workflow/plugins/jqueryui/jquery-ui.min.css" rel="stylesheet" type="text/css" />
             <!-- <link href="/app-web/workflow2/plugins/jstree/themes/default/style.min.css" rel="stylesheet" type="text/css" /> -->
            <!-- <link href="/app-web/workflow2/plugins/timepicker/timepicker.css" rel="stylesheet" type="text/css" /> -->
        </div>
   </div>
</template>

<script>
import $ from "jquery";
// import admain from "../../../public/static/workflow/js/admain.js";
import global_ from "@/views/global.vue";
import {getUser} from "@/api/others";
import propertySheet from "../sub_components/setPropertySheet";
const name = "wf-admin-edit-template";
export default {
    props: ["store", "route", "root"],
    components:{propertySheet},
    data() {
        return {
            admain: null,
            id: "",
            // surl: global_.baseObjOther.replace("/dwf/v1", ""),
            js1:[
                "/plugins/jquery-2.1.1.min.js", 
                "/plugins/moment.min.js",
                "/js/common/basic.js",
                "/js/common/utils.js",

            ],
            js2:[
                "/js/ajax.js",
                "/plugins/bootstrap-3.3.5/js/bootstrap.min.js",
                // "/plugins/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js",
                "/plugins/jqueryui/jquery-ui.min.js",
                // "/plugins/ckeditor_4.10.0_full/ckeditor/ckeditor.js",
                // "/plugins/jstree/jstree.js",
                "/js/common/data/data_zh.js",
            ],
            js3:[
                // "/plugins/timepicker/jquery-ui-timepicker-addon.js",
                // "/plugins/timepicker/jquery-ui-timepicker-zh-CN.js",
                "/js/pm/tasks/abstracttask.js",
                "/js/pm/tasks/wfprocess.js",
                "/js/pm/tasks/releasedwfprocess.js",
                "/js/pm/tasks/startpoint.js",
                "/js/pm/tasks/endpoint.js",
                "/js/pm/tasks/assigntask.js",
                "/js/pm/tasks/manualtask.js",
                "/js/pm/tasks/subprocesspoint.js",
                // "/js/pm/tasks/systemtask.js",
                "/js/pm/tasks/waitingtask.js",
                "/js/pm/tasks/transition.js",
                "/js/pm/tasks/assignment.js",
                "/js/pm/data/constant.js",
                "/js/pm/data/datavariable.js",

                "/js/pm/data/boolconstant.js",
                "/js/pm/data/intconstant.js",
                "/js/pm/data/doubleconstant.js",
                "/js/pm/data/strconstant.js",
                "/js/pm/data/datetimeconstant.js",
                // "/js/pm/data/fileconstant.js",
                "/js/pm/data/handwritingconstant.js",
                "/js/pm/data/jsonconstant.js",
                "/js/pm/data/timdurationconstant.js",
            ],
            js4:[

                "/js/common/ui/runtimeutils.js",

                "/js/admin/adminundoredo.js",
                "/js/admin/runtimeprocessditor.js",
                "/js/admin/adminalleditor.js",
                "/js/admin/adminappeditor.js",
                "/js/admin/adminservice.js",
                // "/js/admin/basicpropertysheet.js",
                // "/js/admin/propertysheet.js",
                // "/js/admin/adminrlwfprocesseditor.js",

                "/js/pm/pmundoredo.js",
                "/js/pm/tasks/tasktextlabel.js",
                // "/js/pm/tasks/emailreceiving.js",
                // "/js/pm/tasks/emailsending.js",
                // "/js/pm/tasks/smsreceiving.js",
                // "/js/pm/tasks/smssending.js",
                "/js/pm/tasks/accessiblevariable.js",
                // "/js/pm/tasks/messagereceiver.js",
                "/js/pm/data/arrayvariable.js",
                "/js/pm/data/expression.js",
                "/js/pm/data/parameter.js",

                "/js/pm/data/function.js",
                "/js/admin/models/wfprocessinstance.js",
                // "/js/admin/models/assigntaskinstance.js",
                // "/js/admin/models/emailreceivinginstance.js",
                // "/js/admin/models/emailsendinginstance.js",
                "/js/admin/models/endpointinstance.js",
                "/js/admin/models/manualtaskinstance.js",
                // "/js/admin/models/smsreceivinginstance.js",
                // "/js/admin/models/smssendinginstance.js",
                "/js/admin/models/startpointinstance.js",
                // "/js/admin/models/subprocesspointinstance.js",
                // "/js/admin/models/systemtaskinstance.js",
                "/js/admin/models/transitioninstance.js",
                // "/js/admin/models/waitingtaskinstance.js",
                "/js/dwf/admincontent.js",
                "/js/dwf/getUrlaram.js",
                "/js/dwf/mcplugin.js",
                "/js/dwf/mdmaincontent.js",
            ],
            cssShow: false,
            propertyWfprocess: null,
            propertyObj: null,
        };
            
    },
    created() {
        console.log("store:", this.store);
        this.pid = this.route.meta.id;
        console.log("this.pid",this.pid);
        this.activate();
        this.init();
    },
    mounted(){
        try {
            this.admain = require('../../../../../public/static/workflow/js/admain.js').default;
        } catch (error) {
            console.error("未装配流程代码");
        }
    },
    methods:{
        async init(){
            let that = this;
            await getUser(that.store.state.user.userId).then(res=>{ 
                that.userDisplayName =  res.data.data.displayName;
            });
           
            var dom = this.root.$refs.remoteJS;
            let proInst= {
                'pid':that.route.meta.id,
                'pname':that.route.meta.pname,
                'enClassName': that.route.meta.enClassName
            };
            let user={
                'uid':that.store.state.user.userId,
                'uname':that.userDisplayName,
                'tk':that.store.state.user.token, 
            }
            if(document.getElementsByClassName("wf-admin-edit-remote-JS").length<2){
                this.jsLoaderPa(dom, this.js1, () => {
                    that.jsLoaderPa(dom, that.js2, () => {
                        that.jsLoaderPa(dom, that.js3, () => {
                            that.jsLoaderPa(dom, that.js4, () => {
                                 that.admain(proInst,user, global_, that);
                            });
                        });
                    });
                });
            }else{
                that.jsLoaderPa(dom, that.js4, () => {
                  that.admain(proInst, user, global_, that);
                });
                // that.admain(proInst,user, that.surl, that);
                
            }
        },
        activate() {
            this.cssShow = true;
        },

        beforeLeave() {
            this.cssShow = false;
        },

        jsLoaderPa(head, arr, cb) {

            var _load_index = 0;

            function onScriptLoad(node, e, url) {
                var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
                if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
                    //head.removeChild(node);
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
        setWfProcess(wfprocess){
            // console.log("setWfProcess",wfprocess);
            this.propertyWfprocess = wfprocess;
            this.setPropertySheet(this.propertyWfprocess);
        },
        
        setPropertySheet(obj){
            // console.log("setPropertySheet obj",obj);
            this.propertyObj = obj;
        },
    },
}
</script>


<style>
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
        margin: 0px; 
        padding: 0px; 
        /* width: calc(100% - 240px) !important; */
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

</style>