<template>
  <div class="username-dropdown">
    <Dropdown @on-click="handleClick">
      <a href="javascript:void(0)">
        <Button type="default">
          {{ username }}
          <Icon type="md-arrow-dropdown"></Icon>
        </Button>
      </a>
      <DropdownMenu slot="list">
        <DropdownItem name="version">当前版本</DropdownItem>
        <DropdownItem name="help">在线帮助</DropdownItem>
        <DropdownItem name="log">查看日志</DropdownItem>
        <Dropdown placement="left-start">
          <DropdownItem>
            <Icon type="ios-arrow-back"></Icon>
            API说明
          </DropdownItem>
          <DropdownMenu slot="list">
            <DropdownItem name="modelApi">模型类</DropdownItem>
            <DropdownItem name="objectApi">对象类</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal
        class="versionModal"
        v-model="versionModal"
        title="当前版本">
        <p style="padding-left: 16px;" :class="{'verTime': versionList.length > 0 }">当前数为平台版本为: {{ vTime }}</p>
        <Timeline class="time-wrap" v-if="versionList.length > 0">
          <TimelineItem v-for="time in versionList" :key="time.oid">
              <p>
                <span class="verTag">{{ time.dwfStartTag }}</span>
                <Divider type="vertical" />
                <span class="verTxt">{{ getdate(time.updateTime || '') }}</span>
              </p >
              <p>
                <span class="verTxt">数据库版本: V{{ time.dbLatestVer || '--' }}</span>
                <Divider type="vertical" />
                <span class="verTxt">{{ time.dbScriptVer }}</span>
              </p >
          </TimelineItem>
        </Timeline>
    </Modal>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import global_ from "@/views/global.vue";
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
      versionModal: false,
      vTime: '',
      versionList: []
    }
  },
  created() {

    this.vTime = global_.versionTime;
    let sessionVersion = sessionStorage.getItem('dbVersionList') || '[]';
    if(sessionVersion) {
      this.versionList = JSON.parse(sessionVersion);
    }

  },
  methods: {
    ...mapActions(["handleLogOut"]),
    handleClick(name) {
      if(name == 'logout') {
        this.handleLogOut({}).then(() => {
            this.$store.state.user.token = '';
            this.$router.push({
              name: "login"
            });
          });
      } else if(name == 'help') {
        // window.open(`${Config.protocol}//${Config.host}/helps/dwf_script_guide.html`);
        window.open(`http://ise.thss.tsinghua.edu.cn/confluence/pages/viewpage.action?pageId=22511673`);
      } else if(name == 'log') {
        // window.open(`${Config.protocol}//${Config.host}/log/modeler-log.html`);
        window.open(`${Config.tomcatUrl}/log/modeler-log.html`);
      } else if(name == 'modelApi') {
        window.open(`${Config.toolModelBase}/swagger-ui.html#/`);
      } else if(name == 'objectApi') {
        window.open(`${Config.toolObjectBase}/swagger-ui.html#/`);
      } else if(name == 'version') {
        this.versionModal = true;
      } else {
        return;
      }
    },

    //timestep 转为时间
    getdate(ts) {
      if(ts == '') return '--';
      var now = new Date(ts),
          y = now.getFullYear(),
          m = now.getMonth() + 1,
          d = now.getDate();
      return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
    }
  }
};
</script>

<style scoped>
.versionModal>>>.ivu-modal-body {
  padding: 16px 0;
}
.verTime {
  border-bottom: 1px solid #e8eaec;
  margin-bottom: 10px;
  padding-bottom: 10px;
}
.time-wrap{
  width: 350px;
  max-height: 300px;
  overflow-y: auto;
  margin-left: 98px;
  padding-top: 25px;
}
.verTag {
  font-weight: bold;
}
.verTxt {
  color: #8d8b8b;
}
.username-dropdown {
  display: inline-block;
  height: 32px;
  vertical-align: middle;
  line-height: 10px;
}
</style>
