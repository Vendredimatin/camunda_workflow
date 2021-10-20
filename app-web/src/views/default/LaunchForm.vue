<template>
    <div class="process" style="height: 100%;">
        <!-- 初始表单 LaunchForm -->
        <div style="width: 100%;height:50px;padding:5px 20px;">
            <Button class="self-btn" type="primary" @click="saveAndSubmit">提交</Button>&nbsp;
            <div style="float:right; ">
                <Button class="self-btn" type="error" @click="deleteInstMadel = true" :disabled="editAuthority != 2">终止</Button>&nbsp;
                <Button class="self-btn" size="large" icon="ios-chatbubbles-outline" type="primary" shape="circle" :disabled="editAuthority == 1"
                    @click="commentDrawer = true"  ></Button>&nbsp;&nbsp;
            </div>
        </div>

        <h2 class="title">{{title}}</h2>

        <FormEngine ref="form" :to_path='rpath' :to_query="rquery" :store="store" :root="root" :echarts="echarts"></FormEngine>

        <Drawer
                title="讨论区"
                @on-close = "onclose"
                v-model="commentDrawer"
                :mask="false"
                :scrollable = "true"
                width="420"
                transfer
                >
                <div style="position: fix;padding-bottom: 5px;">
                    <Button class="self-btn" size="small" icon="ios-add" type="primary" shape="circle"
                        @click="showPartModal()" style="float:right;">
                    </Button>
                    <div> 抄送成员:
                        <Tag v-for="(i,index) in copiers" closable @on-close="removeCopier(index)">{{i.displayName}}</Tag>
                    </div>
                </div>
                <div class="part-content" >
                    <Button class="self-btn" size="small" icon="ios-add" type="primary" shape="circle" disabled style="float:right;">
                    </Button>
                    <div> 参与成员: </div>
                </div>
        </Drawer>
        <Modal v-model="addPartModal" :mask-closable="false" title="选择用户">
            <p>添加抄送成员</p>
            <org-user-selector  ref="copierselector" :havelauncher="false" ></org-user-selector>
            <div slot="footer">
                <Button class="self-btn" type="text" size="large"  @click="closeAddPartMoal">取消</Button>
                <Button class="self-btn" type="primary" size="large" @click="onConfirmAddPart">确认</Button>
            </div>
        </Modal>

        <Modal v-model="submitModal" :mask-closable="false" title="提交">
           <Checkbox v-model="wantAssignNext">指定下一步执行人</Checkbox>
            <div v-if="wantAssignNext">
            <p>指定下一步执行人</p>
                    <org-user-selector  ref="nextuserselector" ></org-user-selector>
            </div>
            <!-- <p style="margin:10px 0px;">备注：</p>
            <Input  v-model="submitComment" type="textarea" :rows="4" placeholder="请输入..." />-->
            <div slot="footer">
                <Button class="self-btn" type="text" size="large"  @click="closeSubmitMoal">取消</Button>
                <Button class="self-btn" type="primary" size="large" @click="onConfirmSubmit">确认</Button>
            </div>
        </Modal>

    </div>
</template>

<script>

    import FormEngine from '../form-engine/forms-engine.vue';
    import $ from 'jquery';
    import global_ from "../global.vue";
    import { getUser } from "@/api/others";
    import {launchProcessByObjId} from "@/api/wfprocess"
    import WfProcessComments from "../workflow/sub_components/WfProcessComments";
    import OrgUserSelector from "../workflow/sub_components/orgUserSelector";

    export default {
        name: 'process',
        components:{ FormEngine, WfProcessComments,OrgUserSelector},
        props: ['route', 'store', 'root', 'query', 'echarts', "Message"],
        data() {
            return {

                title:'',
                rpath:'',
                rquery:{query: ''},
                urlName:'',
                enInstanceId: null,

                commentDrawer: false,
                copiers: [],
                addPartModal: false,

                assignModal:false,
                assignComment :"",
                submitModal: false,
                submitComment:"",
                wantAssignNext:false,
            }
        },
        created () {
            console.log("!!", this.route, this.Message);
            if (this.route.meta.targetClass && this.route.meta.viewName) {
                this.rpath = `/forms/${this.route.meta.targetClass}/${this.route.meta.viewName}`;
                // console.log("this.route.meta.condition",this.route.meta.condition);
                this.rquery = this.route.meta.condition == '' ? this.route.query : {query: "and obj.oid=''"};
            }
            if (this.query) this.rquery = this.query;
            if (!this.rquery.params) this.rquery.params = {};
            if (this.route.meta.params && this.route.meta.params.length > 0) {
                this.rquery.params.initScript = this.route.meta.params.split("APP_afterScript:")[0].replace("APP_beforeScript:", '');
                this.rquery.params.initScriptNeed = true;
            }
            this.rquery.params.opr_type = 'sys';
            this.rquery.params.opr_path = 'save';

            console.log("this.editAuthority",this.editAuthority);
            this.rquery.displayType = "create";
            console.log("created:", this.rquery);
            this.assignModal = false;

            this.init();
        },
        mounted() {

        },
        computed: {
            activeIntitations: function () {
                return this.addInvitations.filter(u =>u.show);
            },
            editAuthority(){
                console.log("this.route.meta",this.route.meta);
                if(this.route.meta.wfAuthority == "submission") return 2;
                if(this.route.meta.wfAuthority == "assign") return 3;
                if(this.route.meta.wfAuthority == "check") return 1;
            }
        },
        methods: {
            async init(){
                let that = this;
                await getUser(this.store.state.user.userId).then(res=>{ that.userDisplayName =  res.data.data.displayName;});
            },
            activate() {
                this.$refs.form.activate();
            },
            collMenu() {
                this.$refs.form.collMenu();
            },
            saveForm(){
                let form = this.$refs.form;
                let obj = form.GetObj(form.rootJson.data, true);
                let that = this;
                if (obj[1]) {
                    let res = form.edit();
                }
            },
            closeSubmitMoal(){
                this.submitModal = false;
                if(this.$refs.nextuserselector) this.$refs.nextuserselector.recovery();
            },
            openSubmitModal(){
                this.submitModal = true;
                // this.submitComment = "";
                this.wantAssignNext = false;
                if(this.$refs.nextuserselector) this.$refs.nextuserselector.recovery();
            },

            onConfirmSubmit(){
                if(!this.wantAssignNext){
                    this.saveAndSubmit(null); // 未指定下一步执行人
                }else{
                    var user = this.$refs.nextuserselector.getSelected();
                    console.log("user",user);
                    if(user.userId == "" || user.userId == null){
                        this.$refs.nextuserselector.setTip("请选择用户");
                    }else{
                        this.saveAndSubmit(user); // 指定下一步执行人
                    }
                }
            },

            async saveAndSubmit() {
                // var userip="";
                let that = this;
                let form = this.$refs.form;
                let obj = form.GetObj(form.rootJson.data, true);
                console.log("obj",obj);
                if (obj[1]) {
                    let res = await form.save(obj[0]);
                    if (res){
                        let param = {
                            templateId: that.route.meta.wfProcessInstanceId,
                            userId: that.store.state.user.userId,
                            userDisplayName: that.userDisplayName,
                            paramValues :JSON.stringify(res),
                            copiers :JSON.stringify(that.copiers),
                            enClassInstanceId :res.oid,
                            bindEnClassName : that.route.meta.targetClass,
                        };
                        launchProcessByObjId(param).then(re=>{
                            if(re.success){
                                that.Message.success("提交成功");
                                setTimeout(() => {
                                    that.root.onTabRemove(that.route.name);
                                }, 500);
                            }else{
                                that.$Message.error("提交失败");
                            }
                        });
                    }else{
                       that.$Message.error("提交失败");
                    }
                }
            },
            closeModal(){
                this.assignModal = false;
            },
            onclose(){
                this.commentDrawer = false;
            },
            closeAddPartMoal(){
                this.addPartModal = false;
            },
            showPartModal(val){
                this.$refs.copierselector.recovery();
                this.addPartModal = true;
            },
            onConfirmAddPart(){
                var selectedItem = this.$refs.copierselector.getSelectedItem();
                // console.log("selectedItem",selectedItem);
                if(selectedItem == ""){
                    this.$Message("未选择用户/用户组");
                }else if(selectedItem.value == '000'){
                    this.$Message.info("无法添加‘无组织用户’组");
                    this.$refs.copierselector.recovery();
                }else{
                    if(this.copiers.findIndex( c => {
                        return c.oid == selectedItem.value;
                    }) != -1){
                        this.$Message.info("已添加该用户/用户组");
                        this.$refs.copierselector.recovery();
                        return;
                    }
                    var copyto = {'type':selectedItem.type,'name':selectedItem.name,'displayName': selectedItem.label,'oid':selectedItem.value};
                    this.copiers.push(copyto);
                    this.addPartModal = false;
                }
            },

            removeCopier(index){
                this.copiers.splice(index, 1);
            }
        },
    }
</script>

<style lang="less" scoped>

.create{
    background-color: #fff;
    .title{
        margin: 10px 0px 20px 30px;
    }
}
.part-content{
    position:fix;
    padding-bottom: 5px;
    border-bottom: 1px solid #e8eaec;
}
.commentCard{
    // border: 1px solid #dcdee2;
    // border-color: #e8eaec;
    border-radius: 4px;
    font-size: 14px;
    position: relative;
    transition: all .2s ease-in-out;
    margin: 12px 30px 12px 0px;
    box-shadow: 0px 0px 3px #888888;
    // margin-right: 30px;
}
.commentCard .title{
    border-bottom: 1px solid #e8eaec;
    padding: 8px;
    line-height: 1;
}

.commentCard .content{
    padding: 5px;
}

.myComment{
    margin-right: 0px;
    margin-left: 30px;
}
</style>
