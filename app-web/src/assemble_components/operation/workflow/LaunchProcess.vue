<template>
    <section>
         <Modal
            v-model="launchModal"
            title="选择流程模版"
            width="740">
            <div style="color:red;">{{tip}}</div>
             <Table border highlight-row ref="currentRowTable" :columns="proTempsCol" 
             :data="proTemps" @on-current-change="changeCol" height="300"></Table>  
            
            <div slot="footer">
                <Button type="text" size="large" @click="launchModal = false">取消</Button>
                <Button type="primary" :disabled="enInstanceId==null" size="large" @click="onConfirmLuanch">确认</Button>
            </div>
        </Modal>
         <Button :type="args.type" :shape="args.shape ? 'circle' : null" :icon="args.icon" 
            :style="{'color': args.main_fontColor, 'width': arg_width, 'height': arg_height}" 
            :disabled="args.disabled" @click="clickLaunch">{{args.text}}</Button> 
    </section>
</template>

<script>
import { mapGetters} from "vuex";
import $ from 'jquery'
import {getEobjSingle, getUser} from "@/api/others";
// import {launchProcessByObjId, getRlProListToLuanch} from "@/api/wfprocess";
import {launchProcessByObjId, getRlProListToLuanch} from "./api/WfProcessApi";

const name = "LaunchProcess";
export default {
    name: name,
    props: ['itemValue','root', 'store', 'Message'],
    data() {
        return {
            userDisplayName:"",
            proTemps: [],
            name: name,
            launchModal: false,
            // itemValue: {},
            args: {
                type: "default",
                shape: false,
                text: "发起流程",
            },

            selected: null,
            
            addins: [],
            currentId:"",
            enInstanceId: null,

            selectedTemp: null,

            tip: '',
            proTempsCol:[
                    {
                        type: 'index',
                        width: 80,
                        align: 'center'
                    },
                    {
                        title: '模版名称',
                        key: 'name',
                        width: 150,
                        sortable: true
                    },
                   {
                        title: '版本',
                        key: 'version',
                        width: 120,
                        sortable: true
                    },
                    {
                        title: '发布人',
                        key: 'releaser',
                        width: 140,
                    },
                     {
                        title: '最近更新时间',
                        key: 'lastupdate',
                        sortable: true,
                        sortType: "desc",
                    }
                ],
        }
    },
    created() {
        this.$store = this.store;
        this.addins = this.GetAllAddin();
        this.init();
    },
    computed: {
      arg_width() {
        return this.args.width == "auto" ? 'auto' : this.args.width + this.args.widthType ;
      },
      arg_height() {
        return this.args.height + this.args.heightType;
      },
      
      // 使用对象展开运算符将此对象混入到外部对象中
      ...mapGetters("DWF_form", [
        "EntitySingle", "RelationSingle",
      ]),
      
    },
    //  watch: {
    //         itemValue: function(newVal,oldVal){
    //             this.itemValue = newVal;  //newVal即是chartData
    //         }
    //     },
    methods: {
        async init(){
            let that = this;
            await getUser(that.store.state.user.userId).then(res=>{ 
                that.userDisplayName =  res.data.data.displayName;
            });
        },
        canShow() { return true },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            return this;
        },

        changeCol (currentRow,oldCurrentRow) {
            if(this.tip==''||this.tip=="未选择模版"){
                this.currentId = currentRow.id;
                this.tip= '';
            }
            this.selectedTemp = currentRow;
            console.log("this.selectedTemp ",this.selectedTemp);
        },

     clickLaunch(){
        this.tip='';
        var that = this;
          // 搜去到表单中多对象（表格）选中的对象
        let addins = that.GetAllAddin();
        var selected = null;
        for (var i = 0;i < addins.length;i++) {
            if (addins[i].getSelected) {
                    let objs = addins[i].getSelected();
                    if (objs.length > 0) {
                        let _class = addins[i].getAttrMap();
                        if (_class.length == 1 && _class[0].className == this.itemValue.data.targetClass) {
                        selected = objs;
                        break;
                        }
                    }
                }
           }

            console.log("that.enInstanceId",that.enInstanceId);
            console.log("selected",selected);
            if(selected!=null && 'oid' in selected[0]){
                that.enInstanceId = selected[0].oid;
            }else{
                console.log("this.addins",this.addins);
                console.log("itemValue",this.itemValue);
                if(this.itemValue && this.itemValue.data.origin.oid){
                    this.enInstanceId = this.itemValue.data.origin.oid;
                }else{
                    that.tip = "未选择对象";
                }
                
            }
            that.launchModal = true;
            that.loadRlList();
                
      },
      loadRlList(){
        var that = this;
        getRlProListToLuanch(that.itemValue.data.targetClass,that.store.state.user.userId).then(re=>{
            if(re.success){
                re = re.data;
                that.proTemps = [];
                for(var i=0;i<re.length;i++){
                    that.proTemps.push(re[i]);
                    that.proTemps[i].lastupdate =  new Date(that.proTemps[i].lastupdate).format("yyyy-MM-dd hh:mm:ss");
                }
                that.proTemps.sort((a,b) => b.lastupdate -a.lastupdate);
                console.log("that.proTemps",that.proTemps);
                that.launchModal = true;  
            }else{
                that.$Message.error("加载失败");
            }
            
        });
       
      },

      
      async onConfirmLuanch(){
        if(this.currentId==null || !this.currentId ||this.currentId==''){
            this.tip= "未选择模版";
            return;
        }  
            console.log("that.currentId",this.currentId);
            let that = this;
            await getEobjSingle(that.itemValue.data.targetClass,that.enInstanceId).then(res=>{
                that.selected = res.data.data;
            }).catch(error => {
                this.$Message.error("获取用户失败：" + error.response.data.message);
            });;
            console.log("that.selected",that.selected);
           
            let param = {
                    templateId: that.currentId,
                    userId: that.store.state.user.userId,
                    userDisplayName: that.userDisplayName,
                    paramValues:JSON.stringify(that.selected),
                    enClassInstanceId :that.enInstanceId,
                    bindEnClassName: that.selectedTemp.bindEnClassName,
            };
            console.log("param",param);
            launchProcessByObjId(param).then(re=>{
                console.log("re",re);
                if(re.success){
                    that.$Message.success("发起成功");
                    that.launchModal = false;   
                }else{
                    that.$Message.error(re.message||"发起失败");
                  }
            });
           
      },

        async onHandle(params) {
            console.log("params",params);
            var that = this;
           
        }
    }
}
</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}
p {
  margin: 10px 0;
}
</style>