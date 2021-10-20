<template>
  <div style="width:220px;margin-left:10px">
    <p>用户所属用户组</p>
    <Cascader
      :data="allGroupsList"
      change-on-select
      filterable
      transfer
      v-model="groupValue"
      @on-change="handleSelectGroup"
      clearable
    ></Cascader>
    <p style="margin-top:10px">选择用户</p>
    <Select
      filterable
      id="assgin-input"
      v-model="assginUserId"
      prefix="ios-home"
      transfer
      :style="{ 'width': '100%', 'display': 'inline-block'}"
    >
      <Option
        v-for="user in allUserList"
        @on-change="handleSelectUser"
        :value="user.oid"
        :key="user.oid"
        :label="user.displayName"
      >
        <span class="self-color">{{ user.displayName }}</span>
        <span class="self-color" style="float:right;color:#ccc">{{ user.name }}</span>
      </Option>
    </Select>
    <div style="color:red">{{assginTip}}</div>
  </div>
</template>

<script>
import $ from "jquery";
import { getAllUsers, getAllUserTree, getUserFromGroup } from "@/api/others";
export default {
  data() {
    return {
      assginUserId: "",
      allGroupsList: [],
      allUserList: [],
      assginTip: "",
      groupValue: [],
      groupId: []
    };
  },
  created() {
    this.initAssignData();
  },
  methods: {
    initAssignData() {
      getAllUserTree().then(res => {
        var allGroupsClasses = res.data.data;
        this.allGroupsList = JSON.parse(JSON.stringify(allGroupsClasses).replace(/name/g, "label"));
        this.allGroupsList = JSON.parse(JSON.stringify(this.allGroupsList).replace(/oid/g, "value"));
        this.allGroupsList = JSON.parse(JSON.stringify(this.allGroupsList).replace(/childrenGroups/g,"children"));
      });
      // 初始化：获取所有用户
      getAllUsers().then(res => {
          this.allUserList = res.data.data;
        }).catch(error => {
          this.$Message.error("获取用户失败：" + error.response.data.message);
        });
    },
    recovery() {
      console.log("recovery");
      this.assginTip = "";
      this.assginUserId = "";
      this.groupValue = "";
       // 初始化：获取所有用户
      getAllUsers().then(res => {
          this.allUserList = res.data.data;
        }).catch(error => {
          this.$Message.error("获取用户失败：" + error.response.data.message);
        });
    },
    getSelected() {
      console.log("this.assginUserId", this.assginUserId);
      var displayName;
      var that = this;
      for (var i = 0; i < this.allUserList.length; i++) {
        if (this.allUserList[i].oid == that.assginUserId) {
          displayName = that.allUserList[i].displayName;
          break;
        }
      }

      var user = {
        userId: this.assginUserId,
        userName: displayName,
        displayName: displayName,
        groupId: this.groupId,
      };

      return user;
    },
    handleSelectUser(value, selectedData) {
      this.assginTip = "";
    },
    handleSelectGroup(value, selectedData) {
      var index = value.length - 1;
      value = value[index];
      selectedData = selectedData[index];
      this.groupId = selectedData;
      if (index == -1) {
        getAllUsers().then(res => {
            this.allUserList = res.data.data;
          }).catch(error => {
            this.$Message.error("获取用户失败：" + error.response.data.message);
          });
      } else {
        this.allUserList = getUserFromGroup(value).then(res => {
          this.allUserList = res.data.data;
        });
      }
    },

    setTip(val) {
      this.assginTip = val;
    }
  }
};
</script>>
