<template>
  <div class="process" style="height: 100%">
    <!-- 在流程中打开表单 -->
    <div class="process-Button" style="width: 100%; padding: 0px 20px">
      <Button
        class="self-btn"
        type="primary"
        @click="saveForm"
        :disabled="editAuthority != 2"
        >保存</Button
      >
      <Button
        class="self-btn"
        type="primary"
        @click="openSubmitModal"
        :disabled="editAuthority != 2"
        >提交</Button
      >
      <Button
        class="self-btn"
        type="primary"
        @click="openAssignModal"
        :disabled="editAuthority != 2"
        >移交</Button
      >
      <div style="float: right">
        <Button
          class="self-btn"
          type="error"
          @click="deleteInstMadel = true"
          :disabled="editAuthority != 2"
          >终止</Button
        >&nbsp;
        <Button
          class="self-btn"
          size="large"
          icon="ios-chatbubbles-outline"
          type="primary"
          shape="circle"
          :disabled="editAuthority == 1"
          @click="commentDrawer = true"
        ></Button>
        <!-- <Button style="float:right;" type="warning" @click="restartMadel = true" :disabled="editAuthority != 2">重新发起</Button> -->
      </div>
    </div>
    <Modal
      title="终止流程实例"
      v-model="deleteInstMadel"
      @on-ok="deleteInstance"
      @on-cancel="deleteInstMadel = false"
    >
      <p>确定要终止流程实例吗？</p>
    </Modal>
    <Modal
      title="终止流程实例"
      v-model="restartMadel"
      @on-ok="restartTask"
      @on-cancel="restartMadel = false"
    >
      <p>确定要重新发起流程实例吗？</p>
    </Modal>

    <h2 class="title">{{ title }}</h2>

    <FormEngine
      ref="form"
      :to_path="rpath"
      :to_query="rquery"
      :store="store"
      :root="root"
      :echarts="echarts"
    ></FormEngine>

    <wf-process-comments
      v-if="editAuthority != 1"
      :show="commentDrawer"
      @on-close="closeComments()"
      @withdraw="withdrawComments()"
      :pid="route.meta.wfProcessInstanceId"
      :tid="route.meta.taskId"
      :uid="store.state.user.userId"
      :uname="store.state.user.username"
      :editable="editAuthority == 1 || editAuthority == 4 ? false : true"
      :status="route.meta.wfAuthority == 'history' ? 7 : 5"
      :store="store"
    >
    </wf-process-comments>

    <Modal v-model="assignModal" :mask-closable="false" title="选择用户">
      <p>将任务移交给其他人</p>

      <user-selector ref="userselector"></user-selector>
      <p>备注</p>
      <Input
        v-model="assignComment"
        type="textarea"
        :rows="4"
        placeholder="请输入..."
      />
      <div slot="footer">
        <Button
          class="self-btn"
          type="text"
          size="large"
          @click="closeAssignMoal"
          >取消</Button
        >
        <Button
          class="self-btn"
          type="primary"
          size="large"
          @click="onConfirmAssign"
          >确认</Button
        >
      </div>
    </Modal>

    <Modal v-model="submitModal" :mask-closable="false" title="提交">
      <Checkbox v-model="wantAssignNext">指定下一步执行人</Checkbox>
      <div v-if="wantAssignNext">
        <p>指定下一步执行人</p>
        <user-selector ref="nextuserselector"></user-selector>
      </div>
      <p style="margin: 10px 0px">备注：</p>
      <Input
        v-model="submitComment"
        type="textarea"
        :rows="4"
        placeholder="请输入..."
      />
      <div slot="footer">
        <Button
          class="self-btn"
          type="text"
          size="large"
          @click="closeSubmitMoal"
          >取消</Button
        >
        <Button
          class="self-btn"
          type="primary"
          size="large"
          @click="onConfirmSubmit"
          >确认</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import FormEngine from "../form-engine/forms-engine.vue";
import $ from "jquery";
import global_ from "../global.vue";
import WfProcessComments from "../workflow/sub_components/WfProcessComments";
import UserSelector from "../workflow/sub_components/UserSelector";
import { getUser } from "@/api/others";
import {
  deleteProcessInstance,
  sendCommand,
  launchProcessByObjId,
  commitTask,
} from "@/api/wfprocess";
import { editEobj } from "@/api/others";

export default {
  name: "process",
  components: { FormEngine, WfProcessComments, UserSelector },
  props: ["route", "store", "root", "query", "echarts", "Message"],
  data() {
    return {
      title: "",
      rpath: "",
      rquery: { query: "" },
      urlName: "",
      userDisplayName: "",
      // surl: "http://localhost:6060",
      // surl: "http://192.168.1.81:6060",
      surl: global_.baseUrl.replace("/dwf/v1", ""),
      myname: "name1",
      commentDrawer: false,
      wantAssignNext: false,
      assignModal: false,
      assignComment: "",
      submitModal: false,
      submitComment: "",

      deleteInstMadel: false,
      restartMadel: false,
    };
  },
  created() {
    console.log("!!", this.route, this.Message);
    if (this.route.meta.targetClass && this.route.meta.viewName) {
      this.rpath = `/forms/${this.route.meta.targetClass}/${this.route.meta.viewName}`;
      this.rquery =
        this.route.meta.condition == ""
          ? this.route.query
          : { query: this.route.meta.condition };
    }

    if (this.query) this.rquery = this.query;
    if (!this.rquery.params) this.rquery.params = {};
    if (this.route.meta.params && this.route.meta.params.length > 0) {
      this.rquery.params.initScript = this.route.meta.params
        .split("APP_afterScript:")[0]
        .replace("APP_beforeScript:", "");
      this.rquery.params.initScriptNeed = true;
    }
    this.rquery.params.opr_type = "sys";
    this.rquery.params.opr_path = "save";
    if (this.editAuthority == 2) this.rquery.displayType = "edit";
    else this.rquery.displayType = "visit";
    console.log("this.editAuthority", this.editAuthority);
    console.log("this.route.meta.wfAuthority", this.route.meta.wfAuthority);
    // this.rquery.displayType = "edit";
    console.log("created:", this.rquery);

    this.init();
  },
  mounted() {},
  computed: {
    activeIntitations: function () {
      if (this.editAuthority == 2) this.rquery.displayType = "edit";
      else this.rquery.displayType = "visit";
      console.log("this.editAuthority", this.editAuthority);
      console.log("this.route.meta.wfAuthority", this.route.meta.wfAuthority);
    },
    editAuthority() {
      if (this.route.meta.wfAuthority == "submission") return 2;
      if (this.route.meta.wfAuthority == "assign") return 3;
      if (
        this.route.meta.wfAuthority == "history" ||
        this.route.meta.wfAuthority == "instance"
      )
        return 4;
      if (this.route.meta.wfAuthority == "check") return 1;
    },
  },
  methods: {
    async init() {
      await getUser(this.store.state.user.userId).then((res) => {
        this.userDisplayName = res.data.data.displayName;
      });
    },
    activate() {
      this.$refs.form.activate();
      // TODO 表单引擎刷新
      console.log("this.route.meta", this.route.meta);
    },
    collMenu() {
      this.$refs.form.collMenu();
    },
    saveForm() {
      let form = this.$refs.form;
      let obj = form.GetObj(form.rootJson.data, true);
      let that = this;
      console.log("saveForm obj", obj);
      if (obj[1]) {
        let res = form.edit();
        let that = this;
        let params = {
          cmd: "0",
          proInstanceId: that.route.meta.wfProcessInstanceId,
          taskInctanceId: that.route.meta.taskId,
          userId: that.store.state.user.userId,
          userDisplayName: that.userDisplayName,
          comment: that.submitComment,
          paramValues: JSON.stringify(obj[0]),
        };

        console.log("save params", params);

        let className = this.route.meta.targetClass;
        let paramValues = JSON.stringify(obj[0]);
        editEobj(className, paramValues).then((re) => {
          if (re.success) {
            that.Message.success("流程变量保存成功");
          } else {
            that.$Message.error("流程变量保存失败");
          }
        });
      }
    },
    openAssignModal() {
      this.assignModal = true;
      this.assignComment = "";
      this.$refs.userselector.recovery();
    },
    closeAssignMoal() {
      this.assignModal = false;
      this.$refs.userselector.recovery();
    },
    onConfirmAssign() {
      var user = this.$refs.userselector.getSelected();

      if (user.userId == "" || user.userId == null) {
        this.$refs.userselector.setTip("请选择用户");
      } else {
        let that = this;
        let data = {
          cmd: "4",
          proInstanceId: that.route.meta.wfProcessInstanceId,
          taskInctanceId: that.route.meta.taskId,
          userId: that.store.state.user.userId,
          userDisplayName: user.userName,
          newUserId: user.userId,
          comment: that.assignComment,
        };
        sendCommand(data).then((re) => {
          if (re.success) {
            that.$Message.success("移交成功");
            setTimeout(() => {
              that.root.onTabRemove(that.route.name);
            }, 500);
            that.closeAssignMoal();
          } else {
            that.$Message.error("提交失败");
          }
        });
      }
    },
    async openSubmitModal() {
      let form = this.$refs.form;
      let obj = this.getEnObj();
      if (obj[1]) {
        let res = await form.edit();
        if (res) {
          this.submitModal = true;
          this.submitComment = "";
          this.wantAssignNext = false;
          if (this.$refs.nextuserselector)
            this.$refs.nextuserselector.recovery();
        }
      }
    },
    closeSubmitMoal() {
      this.submitModal = false;
      if (this.$refs.nextuserselector) this.$refs.nextuserselector.recovery();
    },
    onConfirmSubmit() {
      if (!this.wantAssignNext) {
        this.submit(null); // 未指定下一步执行人
      } else {
        var user = this.$refs.nextuserselector.getSelected();
        if (user.userId == "" || user.userId == null) {
          this.$refs.nextuserselector.setTip("请选择用户");
        } else {
          this.submit(user); // 指定下一步执行人
        }
      }
    },

    getEnObj() {
      let form = this.$refs.form;
      let obj = form.GetObj(form.rootJson.data, true);
      return obj;
    },

    submit(nextUser) {
      var userip = "";
      let that = this;
      if (nextUser != null && nextUser.userId != "") {
        // cmd=2, userip="&&&1&&&被指派人id&&&被指派人名"
        userip = "&&&1&&&" + nextUser.userId + "&&&" + nextUser.userName;
      }
      let obj = this.getEnObj();

      let params = {
        cmd: "2",
        proInstanceId: that.route.meta.wfProcessInstanceId,
        taskInctanceId: that.route.meta.taskId,
        userId: that.store.state.user.userId,
        userDisplayName: that.userDisplayName,
        userIp: userip,
        comment: that.submitComment,
        paramValues: JSON.stringify(obj[0]),
      };

      console.log("paramValues", params.paramValues);
      commitTask(params).then((re) => {
        if (re.success) {
          that.Message.success("提交成功");
          that.onTabRemove();
        } else {
          that.$Message.error("提交失败");
        }
      });
    },
    onTabRemove() {
      let that = this;
      setTimeout(() => {
        that.root.onTabRemove(that.route.name);
      }, 500);
    },
    closeModal() {
      this.assignModal = false;
    },
    closeComments() {
      this.commentDrawer = false;
    },
    withdrawComments() {
      this.closeComments();
      this.onTabRemove();
    },

    deleteInstance() {
      let that = this;
      deleteProcessInstance(that.route.meta.wfProcessInstanceId).then((re) => {
        if (re.success) {
          that.Message.success("取消实例成功");
          setTimeout(() => {
            that.root.onTabRemove(that.route.name);
          }, 500);
        } else {
          that.$Message.error("取消实例失败");
        }
      });
    },

    restartTask() {
      let that = this;
      var enClassInstanceId = this.route.meta.condition.split('"')[1];
      let obj = this.getEnObj();
      if (obj[1]) {
        let param = {
          templateId: that.route.meta.wfProcessInstanceId,
          userId: that.store.state.user.userId,
          userDisplayName: that.userDisplayName,
          enClassInstanceId: that.route.meta.condition.split('"')[1],
          paramValues: JSON.stringify(obj[0]),
          bindEnClassName: that.route.meta.targetClass,
        };
        launchProcessByObjId(param).then((re) => {
          if (re.success) {
            that.$Message.success("重新发起成功");
            that.deleteInstance();
            setTimeout(() => {
              that.root.onTabRemove(that.route.name);
            }, 500);
          } else {
            that.$Message.error("重新发起失败");
          }
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.create {
  background-color: #fff;
  .title {
    margin: 10px 0px 20px 30px;
  }
}
.part-content {
  position: fix;
  padding-bottom: 5px;
  border-bottom: 1px solid #e8eaec;
}
.commentCard {
  // border: 1px solid #dcdee2;
  // border-color: #e8eaec;
  border-radius: 4px;
  font-size: 14px;
  position: relative;
  transition: all 0.2s ease-in-out;
  margin: 12px 30px 12px 0px;
  box-shadow: 0px 0px 3px #888888;
  // margin-right: 30px;
}
.commentCard .title {
  border-bottom: 1px solid #e8eaec;
  padding: 8px;
  line-height: 1;
}

.commentCard .content {
  padding: 5px;
}

.myComment {
  margin-right: 0px;
  margin-left: 30px;
}
.process-Button {
  width: 99%;
  margin: 10px;
}
.process-Button .ivu-btn {
  margin: 5px;
}
</style>
