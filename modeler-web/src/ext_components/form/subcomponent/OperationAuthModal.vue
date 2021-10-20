<template>
  <div>
    <Modal v-model="show_auth_dialog" title="管理授权" @on-ok="onUpdateAuth" width="700">
      <Transfer
              :data="tem_users_and_groups"
              :target-keys="authed"
              :render-format="transferRender"
              @on-change="handleChangeOfTransfer"
              :list-style="listStyle"
              :titles="transferTitles">
        <div class="selfTransInput">
          <Input v-model="searchQuery" search placeholder="Enter text" style="width: 92%; margin-left: 4%;"
                 @on-enter="selfFilter" @on-change="changeQuery" @on-search="selfFilter"/>
        </div>
      </Transfer>
    </Modal>
  </div>
</template>

<script>
  import {getAllUsers, getGroups} from '@/api/others.js';
  import AuthRules from "@/api/auth-model/AuthRules";
  import axios from "@/libs/anotherAxios";
  import _ from 'lodash';

  export default {
    props: ['auth_item', 'listStyle', 'transferTitles', 'targetClass'],
    data() {
      return {
        searchQuery: '',
        show_auth_dialog: false,
        users_and_groups: [],
        tem_users_and_groups: [],
        authed: [],
      }
    },

    created() {

    },
    mounted() {

    },
    watch: {},
    methods: {
      async initAuthModal() {
        this.searchQuery = '';
        this.show_auth_dialog = true;
        // 下载用户和用户组列表
        let users = (await getAllUsers()).data.data;
        let groups = (await getGroups()).data.data;
        let authItem = this.auth_item;
        let condition = `and r.className='${this.targetClass}' and r.authority='${authItem}'`;
        // 获取当前的已授权用户
        console.log('getAllRulesByCondition',condition)
        let authedRules = (await AuthRules.getAllRulesByCondition(condition)).data.data;
        // let authedRules = (await axios.get(`auth/rules?condition=${condition}`)).data.data;
        this.authed = [];
        this.users_and_groups = [];
        this.tem_users_and_groups = [];

        if (authedRules.length > 0) {

          for (let i = 0; i < authedRules.length; i++) {
            this.authed.push(authedRules[i].participant);

            let isGroups = groups.filter(val => {
              return val.name == authedRules[i].participant
            })
            if (isGroups && isGroups.length > 0) {

              this.tem_users_and_groups.push({
                key: authedRules[i].participant,
                displayName: authedRules[i].participant,
                filterName: authedRules[i].participant,
                type: "group"
              })

            } else {

              let isUsers = users.filter(item => {
                return item.name == authedRules[i].participant
              })
              if(isUsers[0]){
                this.tem_users_and_groups.push({
                  key: isUsers[0].name,
                  displayName: isUsers[0].displayName,
                  filterName: `${isUsers[0].name}-${isUsers[0].displayName}`,
                  type: "user"
                })
              }
            }
          }

        }
        for (let i = 0; i < users.length; i++) {
          let user = users[i];
          this.users_and_groups.push({
            key: user.name,
            displayName: user.displayName,
            filterName: `${user.name}-${user.displayName}`,
            type: "user"
          })
        }

        for (let i = 0; i < groups.length; i++) {
          let group = groups[i];
          this.users_and_groups.push({
            key: group.name,
            displayName: group.name,
            filterName: group.name,
            type: "group"
          })
        }
        this.tem_users_and_groups = this.tem_users_and_groups.concat(this.users_and_groups.slice(0, 100));
        this.tem_users_and_groups = _.uniqWith(this.tem_users_and_groups, _.isEqual);
      },

      transferRender(item) {
        return item.displayName + " - " + (item.type == "user" ? "用户" : "用户组");
      },

      closeAuthModal() {
        this.show_auth_dialog = false;
      },

      handleChangeOfTransfer(newTargetKeys) {
        this.$emit('handleChangeOfTransfer', newTargetKeys)
        this.authed = newTargetKeys;
      },

      selfFilter() {
        this.tem_users_and_groups = [];
        if (this.searchQuery == '') {
          this.tem_users_and_groups = this.users_and_groups.slice(0, 100);
        } else {
          this.tem_users_and_groups = this.users_and_groups.filter(val => {
            return val.filterName.indexOf(this.searchQuery) != -1;
          })
        }
      },

      changeQuery(e) {
        if (this.searchQuery == '') {
          this.tem_users_and_groups = this.users_and_groups.slice(0, 100);
        }
      },

      async onUpdateAuth() {
        this.$emit('onUpdateAuth');
        let className = this.targetClass;
        let authItem = this.auth_item;
        // 删除已有规则
        console.log('deleteRuleByClassOrAuthItem',className)
        await AuthRules.deleteRuleByClassOrAuthItem(className, authItem);
        // await axios.post(`auth/rules-delete?className=${className}&authItem=${authItem}`);
        // 新增现有规则
        let newRules = [];
        for(let i=0; i<this.authed.length; i++){
          newRules.push({
            authority : authItem,
            className : className,
            participant : this.authed[i],
            conditionId : "AlwaysTrue"
          })
        }
        let res = await AuthRules.createRules(newRules);
        if(res.data.code == 200){
          this.$Message.info("授权成功");
        }else{
          this.$Message.error(res.data.message);
        }
      },
    }
  }
</script>

<style scoped>
  .ivu-transfer-list:nth-of-type(3) .selfTransInput {
    opacity: 0
  }
</style>
