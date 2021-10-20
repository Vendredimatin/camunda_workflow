<template>
  <div class="username-dropdown">
    <Dropdown @on-click="handleClick">
      <a href="javascript:void(0)">
        <Tooltip placement="left">
          <Button type="default" class="user-name">
            {{ username }}
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <div slot="content" style="max-width: 200px;word-break: break-all;white-space: normal">{{username}}</div>
        </Tooltip>
      </a>
      <DropdownMenu slot="list" class="self-userDrop" id="self-userDrop">
        <DropdownItem name="version">当前版本</DropdownItem>
        <DropdownItem name="modeler">后台管理</DropdownItem>
        <!-- <DropdownItem name="log">查看日志</DropdownItem> -->
        <!-- <Dropdown placement="left-start">
          <DropdownItem>
            <Icon type="ios-arrow-back"></Icon>
            API说明
          </DropdownItem>
          <DropdownMenu slot="list">
            <DropdownItem name="modelApi">模型类</DropdownItem>
            <DropdownItem name="objectApi">对象类</DropdownItem>
          </DropdownMenu>
        </Dropdown> -->
        <DropdownItem name="default">切换应用</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal
        v-model="versionModal"
        title="当前版本">
        <p>当前数为平台版本为: {{ vTime }}</p>
    </Modal>
  </div>
</template>

<script>
import { getApps, getAppInfo } from "@/api/others";
import { mapActions, mapMutations } from "vuex";
import global_ from "@/views/global.vue";
import { closeSocket } from '@/util/webSocket';
export default {
  name: "user",
  props: {
    username: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      appList: [],
      versionModal: false,
      vTime: global_.versionTime
    }
  },
  mounted() {
    // 账号名称过长的处理
    this.$nextTick(() => {
      let el = document.querySelector('.user-name span')
      el.style.maxWidth = '100px'
      el.style.whiteSpace = 'nowrap'
      el.style.textOverflow = 'ellipsis'
      el.style.overflow = 'hidden'
      el.style.display = 'inline-block'
    })
  },
  methods: {
    ...mapActions(["handleLogOut"]),
    ...mapMutations('DWF_form', ["resetState"]),
    handleClick(name) {
      if(name == 'logout') {
        this.handleLogOut({}).then(() => {
          this.resetState();
          this.$router.push({name: 'logout'});
          closeSocket();
        });
      } else if(name == 'modeler') {
        sessionStorage.setItem("userIdM", '');
        sessionStorage.setItem("oidM", '');
        sessionStorage.setItem("displayNameM", '');
        sessionStorage.setItem("userGroupsM", '');
        sessionStorage.setItem("usernameM", '');
        sessionStorage.setItem("accessM", '');
        sessionStorage.setItem("tokenM", '');
        sessionStorage.setItem('appTitleM', '');
        sessionStorage.setItem('appNameM', '');
        sessionStorage.setItem('indexPageUrlM', '');
        sessionStorage.setItem('indexPageOprM', '');
        sessionStorage.setItem('logoImgM', '');
        window.open(`${Config.protocol}//${Config.ip}:${location.port}/${Config.baseModelerRouteName}/login`);
      } else if(name == 'default'){
        localStorage.setItem('changeAppName', 'app-web');
        localStorage.setItem('changeAppId', '');
        sessionStorage.setItem('selfLoginName', 'login');
        localStorage.setItem('refshFlag', 6);

        this.$router.push({ name: "chooseApp" });

      } else if(name == 'version'){

        this.versionModal = true;

      } else { return }
    }
  }
};
</script>

<style lang="less" scoped>
.user {
  &name-dropdown {
    display: inline-block;
    height: 32px;
    vertical-align: middle;
    line-height: 10px;
  }
}
</style>
