<template>
    <div ref="WfProcessComments">
        <Modal v-model="addPartModal" :mask-closable="false" title="选择用户">
            <p v-if="addPartType == 1">添加参与成员</p>    
            <p v-if="addPartType == 0">添加抄送人员</p>      
            <!-- <user-selector  ref="userselector" ></user-selector> -->
            <org-user-selector  :havelauncher="false" ref="orgUserSelector"></org-user-selector>
            <div slot="footer">
                <Button class="self-btn" type="text" size="large"  @click="closeAddPartMoal">取消</Button>
                <Button class="self-btn" type="primary" size="large" @click="onConfirmAddPart">确认</Button>
            </div>
        </Modal>

    <Drawer 
        title="讨论区" 
        @on-close = "onclose"
        @withdraw = "withdraw"
        v-model="commentDrawer" 
        :mask="false" 
        :scrollable = "true"
        width="420"
        transfer
        > 
        <div v-if="loading">loading...</div>
        <div v-else class="coment-drawer">
            <div :class="pid" style="position: fix;padding-bottom: 5px;">
                <Button class="self-btn" size="small" icon="ios-add" type="primary" shape="circle" :disabled="!editable"
                    @click="showPartModal(0)" style="float:right;">
                </Button>
                <div>
                    抄送成员: 
                    <Tag class="self-tag" v-for="(i,index) in copiers" :closable="editable" @on-close="removeCopier(index)">{{i.displayName}}</Tag>
                </div>
            </div>
             <div class="part-content" :class="pid">
                <Button class="self-btn" size="small" icon="ios-add" type="primary" shape="circle" :disabled="!editable"
                    @click="showPartModal(1)" style="float:right;">
                </Button>
                <div>
                    参与成员: 
                    <Tag class="self-tag" v-for="(i,index) in invitations" :closable="editable" @on-close="removeInvitation(index)">{{i.displayName}}</Tag>
                </div>
            </div>

            <div class="comment-content" :style="{'height':getHeight,'overflow':'scroll'}">
                <div v-for="(tc,index) in taskComments" class="commentCard" >
                    <Row style="width:100%">
                        <Col span="2"><Icon type="ios-contact" size="22"/></Col>
                        <Col span="20">
                        
                            <div style="font-size: 15px;font-weight:600; margin:5px 0;">
                                {{tc.taskName}}
                                <span>({{taskStatusTypy[tc.taskStatus]}})</span>
                            </div>
                            <!-- <p style="margin:5px 0px;">参与人员：{{tc.invitations}}</p> -->
                            <div v-if="tc.taskStatus == 3" class = "mainComment">
                                <div class="content" >{{tc.mainComment.content}}</div>
                                <div class="sender">执行人：{{tc.mainComment.senderName+' '}}
                                    <span style="sendtime">{{new Date(tc.mainComment.sendTime).format("yyyy-MM-dd hh:mm:ss")}}</span>
                                    <span @click="openCommentArea(index)" style="float:right">讨论区
                                        <Icon :id="'arrow_'+pid+'_'+tid+'_'+index" type="ios-arrow-down" />
                                    </span>

                                </div>
                            </div>
                            <div v-if="tc.taskStatus == 2" class = "mainComment">
                                <div class="content" style="color:rgba(204,204,204,1);">待提交</div>
                                <div class="sender">执行人：{{tc.taskSubmitter}}
                                    <span @click="openCommentArea(index)" style="float:right">讨论区
                                        <Icon :id="'arrow_'+pid+'_'+tid+'_'+index" type="ios-arrow-down" />
                                    </span>

                                </div>
                            </div>

                            <div class="comments" :style="{'display':index==taskComments.length?'none':''}" style="margin:10px 0;" :id="'comment_'+pid+'_'+tid+'_'+index">
                                <div  class= "comment" v-for="(c,index2) in tc.comments" v-on:mouseenter="showIndex(index2)" @mouseleave="replyButtonIndex=-1" style="position: relative;">
                                    <div class="sender" >
                                        <Icon type="ios-contact" size="20"/>
                                        <span style="font-size: 15px;font-weight:600;">{{c.senderName+' '}}</span>
                                        <span class="sendtime" style="float:right;">{{new Date(c.sendTime).format("yyyy-MM-dd hh:mm:ss")}}</span>
                                    </div>
                                    <div v-if="c.messageType==0" >
                                        <img style="width:100%;" :src="`${baseUrl}/files-download/${c.content}`">
                                    </div>
                                    <div v-else style="margin-left:15px" >
                                        <div v-if="c.contentType == '评论'||c.contentType == '移交'">
                                            <div class="content" >{{c.content}}</div>
                                        </div>
                                        <div v-else>
                                            <div class="content" style="font-weight:600;">{{c.contentType}}</div>
                                            <div class="content" >{{c.content}}</div>
                                        </div>
                                        <Button  class="self-btn reply-button" v-show="editable && replyButtonIndex==index2 " @click="replyComment(c.senderName, c.content)" type="primary" size='small'>
                                        回复
                                    </Button>
                                    </div>
                                    
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
             <div v-if="editable" style="position:fixed;bottom:20px;width:360px" >
                <div style="height: 35px;">
                    <Button class="self-btn" v-for="(i,index) in keywords" @click="clickKeywords(index)" 
                        style="border-radius:2px; font-size:12px !important;border:1px solid rgba(151,151,151,1); padding:2px 3px; margin-right:3px;">{{i}}</Button>
                    <Button class="self-btn" :disabled="inputEmpty" style="float:right;" size="small" @click="sendComment(commentInput, 1)">发送</Button>
                    <div class="send-picture-button" style="float:right;position:relative;margin-right: 10px;">
                        <Button class="self-btn" type="primary" style="" size="small" icon="ios-image-outline"></Button>
                        <input type="file" ref="inputFile" class="file-img-input" multiple accept="image/*" @change="addImg">
                    </div>
                </div>
                <Input :autosize="{minRows: 5,maxRows: 5}"
                v-model="commentInput" type="textarea" placeholder="请输入..." />
            </div>
        </div>
    </Drawer>
    </div>
</template>

<script>
import $ from 'jquery';
import global_ from "@/views/global.vue";
import UserSelector from "./UserSelector";
import OrgUserSelector from "./orgUserSelector";
import axios from "@/libs/anotherAxios";
import {getWfCommentArea,getWfComments,addTaskComment,getProInvitations,addProInvitation,removeProInvitation,addProCopier,removeProCopier} from "@/api/wfprocess";
  export default {
    components:{UserSelector, OrgUserSelector},
    props: ['show','pid','tid','uid','editable','uname','status',"store"],
      data () {
        return {
            baseUrl: '',
            loading: true,
            commentDrawer : this.show,
            addPartType: 0,
            addPartModal: false,
            displayNameMap:{},
            keywords:["同意","不同意"],
            commentInput:"",
            invitations: [],
            copiers: [],
            scrollHeight: 0,
            taskComments:[],
            inputEmpty: true,
            // editable: false,
            replyButtonIndex:-1, 

            picMaxSize: 50 * 1024,  // 50 MB
            taskStatusTypy:{
                2:'运行中',
                3:'已完成',
                4:'未激活',
                7:'已终止',
            },
        }
      },
      created(){
           this.baseUrl = global_.baseUrl;
        // this.loadWfCommentArea();
        this.$store = this.store;
        console.log("meow", this.$store.state.DWF_global.appConfig);
        if (this.$store.state.DWF_global.appConfig && this.$store.state.DWF_global.appConfig.maxFileSizeKb) {
            let tmp = parseInt(this.$store.state.DWF_global.appConfig.maxFileSizeKb);
            if (!isNaN(tmp)) this.picMaxSize = tmp;
        }
      },
      watch: {
            show (val) {
                let that = this;
                this.commentDrawer = val;
                if(val){
                    if(this.pid!=null && this.pid!=''&& this.pid!=-1){
                        this.loadWfCommentArea();
                    }
                }
            },
            commentInput(val){
                val=val.replace(/\s*/g,"");
                if(val=="") this.inputEmpty= true;
                else this.inputEmpty = false;
            },
            pid(val){
                if(this.pid!=null && this.pid!=''&& this.pid!=-1){
                    this.loadWfCommentArea();
                }
            }
           
        },
      mounted(){
          let that = this;
          this.scrollHeight = document.documentElement.scrollHeight;
            window.onresize = () => {
                return (() => {
                    that.scrollHeight = document.documentElement.scrollHeight;
                })()
            }
           
      },
      computed:{
        getHeight(){
            return this.scrollHeight-300+'px';
        }
    
      },
      methods:{
          replyComment(sender,content){
              this.commentInput="["+sender+"："+content+"]\n----------------------\n"
          },
          showIndex(index2){
              this.replyButtonIndex = index2;
          },
          loadWfCommentArea(){
              this.loading = true;
              console.log("this.pid",this.pid);
              console.log("this.status",this.status);
              let that = this;
                        
              getWfCommentArea(that.pid,that.status).then(re=>{
                if(re.success){
                    re = re.data;
                    var taskComments = [];
                    if(re.comments.length !=0 || re.comments!=null){
                        taskComments = re.comments;
                    }
                    for(var i = 0; i < taskComments.length; i++){
                            if(taskComments[i].taskStatus == 3){
                                var l = taskComments[i].comments.length;
                                taskComments[i].mainComment = taskComments[i].comments[l-1];
                                taskComments[i].comments.splice(l-1,1);
                            }
                        }
                        that.taskComments = taskComments;

                        that.copiers = [];
                        for(var i = 0; i < re.copiers.length; i++){
                            // that.copiers.push(JSON.parse(re.copiers[i]));
                            var u = JSON.parse(re.copiers[i]);
                            if('uname' in u) u.displayName = u.uname;
                            that.copiers.push(u);
                        }

                        that.invitations = [];
                        for(var i = 0; i < re.invitations.length; i++){
                            // that.invitations.push(JSON.parse(re.copiers[i]));
                            var u = JSON.parse(re.invitations[i]);
                            if('uname' in u) u.displayName = u.uname;
                            that.invitations.push(u);
                        }
                        that.loading = false;
                }
              });          
                
           
          },

         
          loadComments(){
              console.log("this.pid",this.pid);
              let that = this;
              getWfComments(that.pid).then(re=>{
                if(re.success){
                    re = re.data;
                    var taskComments = [];
                    if(re.length ==0 || re==null){return;}
                    taskComments = re;
                    for(var i = 0; i < taskComments.length; i++){
                        if(taskComments[i].taskStatus == 3){

                            var l = taskComments[i].comments.length;
                            taskComments[i].mainComment = taskComments[i].comments[l-1];
                            taskComments[i].comments.splice(l-1,1);
                        }
                    }
                    that.taskComments = taskComments;
                }
              });
                
          },
          sendComment(commentInput, messageType){
                 // 评论类型 0 图片 ,1 文本
                var copyto = {
                    "senderId":this.uid,
                    "senderName":this.uname,
                    "content":commentInput,
                    "messageType": messageType,
                    "contentType":"评论",
                    "sendTime":(new Date()).getTime()
                };
                console.log("copyto",JSON.stringify(copyto));
                var that = this;
                addTaskComment(that.pid,that.tid,copyto).then(re=>{
                    if(re.success){
                        if(messageType==1 )that.commentInput="";
                            that.$Message.success("发送成功");
                            that.loadComments();
                    }else{
                        that.$Message.error("发送失败");
                    }
                    that.addPartModal = false;
                })
               
          },
          openCommentArea(index){
              var dom = document.querySelector('#comment_'+this.pid+'_'+this.tid+'_'+index);
              if(dom){
                if(dom.style.display =="") dom.style.display ="none";
                else  dom.style.display ="";
              }
              dom = $('#arrow_'+this.pid+'_'+this.tid+'_'+index);
              if(dom && dom.hasClass('ivu-icon-ios-arrow-down')){
                dom.removeClass('ivu-icon-ios-arrow-down');
                dom.addClass('ivu-icon-ios-arrow-up');
              }
            else{
                dom.removeClass('ivu-icon-ios-arrow-up');
                dom.addClass('ivu-icon-ios-arrow-down');
            }
                
          },
          clickKeywords(index){
            this.commentInput+=this.keywords[index];
          },
           
            showPartModal(val){
                // this.$refs.userselector.recovery();
                this.$refs.orgUserSelector.recovery();
                this.addPartType = val;
                this.addPartModal = true;
            },
            closeAddPartMoal(){
                this.addPartModal = false;
            },
            // 
            addInvitation(selectedItem){
                if(this.invitations && this.invitations.some( item => {return item.oid == selectedItem.value})){
                    this.$Message.info("已添加该用户/用户组");
                    this.$refs.orgUserSelector.recovery();
                    return;
                }
                var copyto = {'type':selectedItem.type,'name':selectedItem.name,'displayName': selectedItem.label,'oid':selectedItem.value};

                var that = this;
                addProInvitation(that.pid,JSON.stringify(copyto)).then(re=>{
                    if(re.success){
                        that.invitations.push(copyto);
                        that.$Message.success("添加成功");
                    }else{
                        that.$Message.error("添加失败");
                    }
                    that.addPartModal = false;
                    this.$refs.orgUserSelector.recovery();
                });
            },

            addCopier(selectedItem){
                if(this.copiers && this.copiers.some( item => {return item.oid == selectedItem.value})){
                    this.$Message.info("已添加该用户/用户组");
                    this.$refs.orgUserSelector.recovery();
                    return;
                }
                var copyto = {'type':selectedItem.type,'name':selectedItem.name,'displayName': selectedItem.label,'oid':selectedItem.value};
                var that = this;
                addProCopier(that.pid,JSON.stringify(copyto)).then(re=>{
                    if(re.success){
                        that.copiers.push(copyto);
                        that.$Message.success("添加成功");
                    }else{
                        that.$Message.error("添加失败");
                    }
                    that.addPartModal = false;
                    this.$refs.orgUserSelector.recovery();
                });
            },
  
            onConfirmAddPart(){
                var selectedItem = this.$refs.orgUserSelector.getSelectedItem();
                if(selectedItem == null){
                    this.$Message("未选择用户/用户组");
                }else if(selectedItem.value == '000'){
                    this.$Message.info("无法添加‘无组织用户’组");
                    this.$refs.orgUserSelector.recovery();
                }else{
                    if(this.addPartType == 1) this.addInvitation(selectedItem);
                    else this.addCopier(selectedItem);
                }
            },
        
            removeInvitation(index){
                var copyto = this.invitations[index];
                var that = this;
                removeProInvitation(that.pid,JSON.stringify(copyto)).then(re=>{
                    if(re.success == "1"){
                        that.$Message.success("移除成功");
                        that.invitations.splice(index, 1);
                        if(copyto.oid == that.uid){
                            that.withdraw();
                        }
                    }else{
                        that.$Message.error("移除失败");
                    }
                });
            },
            removeCopier(index){
                var copyto = this.copiers[index];
                var that = this;
                removeProCopier(that.pid,JSON.stringify(copyto) ).then(re=>{
                     if(re.success){
                        that.$Message.success("移除成功");
                        that.copiers.splice(index, 1);
                    }else{
                        that.$Message.error("移除失败");
                    }
                });
            },
            withdraw(){
                this.$emit('withdraw');
            },
            onclose(){
                this.$emit('on-close');
            },
            addImg(event){     
                let image = new FormData();
                let imageFile = this.$refs.inputFile.files[0];
                
                // console.log("this.$refs.inputFile.files[0]",this.$refs.inputFile.files[0]);
                var fileType = imageFile.name.split('.'); fileType = fileType[fileType.length-1].toLowerCase();
                var newFimeName = imageFile.name +"_"+new Date().getTime()+"."+ fileType;
                //创建新文件对象
                var newfile = new File([imageFile], newFimeName,{type:"image/"+fileType});

                image.append('file', newfile);
                if(image && image != undefined) {
                    let fileList = event.target.files;
                    let fileLength = fileList.length;
                    if(fileLength > 1) {
                        this.$Message.warning('一次只能发送一张图片');
                    } else {
                        let file = fileList[0];
                        let isJPG = (file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/jpeg');
                        let isLt2M = file.size / 1024  < this.picMaxSize;
                        if (!isJPG) {
                            this.$Message.error('上传图片只能是 JPG/JPEG/PNG 格式!');
                        }
                        if (!isLt2M) {
                            this.$Message.error(`上传图片每张大小不能超过 ${this.picMaxSize / 1024} MB`);
                        }
                        if(isJPG && isLt2M) {
                            let that = this;
                            axios.post('files-upload?libraryId=wf_picture_management', image, 
                                    { headers: { "Content-Type": "multipart/form-data"}}).then(response => {
                                        let res = response.data;
                                        if(!res.success) {
                                            this.$Message.warning(res.message)
                                        } else {
                                            // console.log("res",res);
                                            // var _self = this;
                                            // if(window.FileReader) {
                                            //     var fr = new FileReader();
                                            //     fr.onloadend = function(e) {
                                                    that.sendComment(res.data.oid,0);
                                            //     };
                                            //     fr.readAsDataURL(file);
                                            // }
                                        }
                                    }).catch(e => {
                                        console.log(e);
                                    });
                            event.target.value="";
                        }
                    }
                }
            },


           
      }
  }
</script>

<style lang="less" scoped>

.content {
    white-space: pre-line;
}
.part-content{
    position: fix;
    padding-bottom: 5px;
    border-bottom: 1px solid #e8eaec;
}
.commentCard{
    font-size: 14px;
    border-radius: 4px;
    position: relative;
    margin: 10px 5px;

    // transition: all .2s ease-in-out;
    // margin: 12px 30px 12px 0px; 
    // box-shadow: 0px 0px 3px #888888;
}
.commentCard .title{
    // border-bottom: 1px solid #e8eaec;
    padding: 8px;
    line-height: 1;
}

.commentCard .content{
    padding: 5px;
}

// .comment-content {
//     background-color: rgba(243,243,243,1);
// }
.sendtime{
    font-size:12px; color:rgba(153,153,153,1); 
}

.ivu-drawer-wrap .ivu-drawer-content .ivu-drawer-body{
    padding :0px !important;
}

.reply-button{
    position: absolute;
    right: 10px;
    bottom: 0px;
}

.file-img-input {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    width: 30px;
    height: 29px;
}
.file-img-input:hover {
    cursor: pointer;
}
</style>
