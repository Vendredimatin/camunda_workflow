<template>

  <div style="width:220px;">
    <Cascader
          class="i-input"
          :render-format="cascaderFormat"
          :data ="orgUserList"
          :change-on-select="true"
          filterable
          transfer
          v-model="selectedItems"
          @on-change="handleChange"
        ></Cascader>
  </div>
</template>

<script>
import { getAllUserGroupTree } from "@/api/others";
export default {
  props:['havelauncher'],
  data() {
    return {
      selectedGroups:[],
      orgUserList:[],
      selectedItem: null,
      selectedItems:[],
    };
  },
  created() {
    
  },
  mounted(){
    this.loadData();
  },
  watch:{
    
  },

  methods: {
    cascaderFormat(labels, selectedData) {
      const index = labels.length - 1;
      return labels[index];
    },
    loadData(){
        getAllUserGroupTree().then(res =>{
              this.allGroupsUsersList = res.data.data;
              this.handleGroupUserList(this.allGroupsUsersList.childrenGroups );
              this.orgUserList = this.allGroupsUsersList.childrenGroups;
              this.allGroupsUsersList.users = this.allGroupsUsersList.users.map(user=>{
                 return {'type':'user','label':user.displayName,'value':user.oid,'name':user.name};
              });
              if(this.allGroupsUsersList.users.length>0){
                this.orgUserList.push({'children':[...this.allGroupsUsersList.users], 'type':'group','label':"无组织用户",'value':"000"});
              }
              if(this.havelauncher) {
                this.orgUserList.unshift({'type':'launcher','label':"流程发起人",'value':'000000000'});
              }
              console.log("this.orgUserList",this.orgUserList);
          });
    },
  
    handleGroupUserList(groups){
        groups.forEach( group =>{
          // group.label = group.name;
          group.label = group.displayName;
          group.value = group.oid;
          group.type = 'group';
          // delete group.name; 
          delete group.oid;
          if('childrenGroups' in group && group.childrenGroups.length>0){
            this.handleGroupUserList(group.childrenGroups);
            group.children = group.childrenGroups;
            delete group.childrenGroups;
          }else {
            group.children = [];
            if(group.users.length==0) group.disabled = true;
          }
          group.users.forEach(user=>{
            user.label = user.displayName; 
            user.value = user.oid;
            user.type = 'user';
            delete user.displayName; 
            delete user.oid;
          });
          group.children = group.children.concat(group.users);
          delete group.users;
        });
    },

    handleChange(value,selectedData){
      var index = value.length-1;
      this.selectedItem = selectedData[index];
    },

    recovery() {
      this.selectedGroups = [];
      this.selectedItem = null;
      this.selectedItems = [];
    },
    disabledLuancher(){

    },
    abledLuancher(){

    },

    getSelectedItem(){
      return this.selectedItem;
    },
   
  }
};
</script>
