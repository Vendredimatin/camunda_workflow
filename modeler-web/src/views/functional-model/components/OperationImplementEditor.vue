<template>
  <div class="implement-plugin-client">
    <MonacoEditor
      v-model="clientImplement"
      :lang="lang"
      theme="chrome"
      width="70%"
      height="250">

    </MonacoEditor>

    <div v-if="serverImplementEditor" class="implement-plugin-server-editor">
      <div class="implement-plugin-server-editor-header">
        <div class="implement-plugin-server-editor-headerName">
          <Tooltip :content="serverImplementKey + ' - ' + serverImplementDisplayName" placement="right" :transfer="true" :max-width="200">
            {{ serverImplementKey.substring(0, 20) }} - {{ serverImplementDisplayName.substring(0, 20) }}
          </Tooltip>
        </div>
        <div>
          <Tooltip content="确定" placement="left">
            <Button class="margin-right-5" icon="md-checkmark" type="text"
                    style="color: green"
                    @click="confirmServerImplement()"></Button>
          </Tooltip>
          <Tooltip content="取消" placement="left">
            <Button class="margin-right-5" icon="md-close" type="text"
                    style="color: red"
                    @click="cancelServerImplement()"></Button>
          </Tooltip>
        </div>
      </div>
      <MonacoEditor
        v-model="serverImplement"
        :lang="lang"
        theme="chrome"
        width="100%"
        height="210">

      </MonacoEditor>
    </div>
    <ul class="implement-plugin-server-pool">
      <li v-for="( server, key ) in oprScript[this.field].server"
          :key="key"
          class="implement-plugin-server-list">
        <div class="implement-plugin-server-list-displayName">
          <Tooltip :content="key + ' - ' + server.displayName" placement="right" :transfer="true" :max-width="200">
            {{ key.length > 20 ? `${key.substring(0, 20)}...` : key }} - {{ server.displayName.length > 5 ? `${server.displayName.substring(0, 5)}...` : server.displayName }}
          </Tooltip>
        </div>
        <div class="implement-plugin-server-list-action">
          <Button
            class="margin-right-5"
            icon="md-create"
            :disabled="serverImplementEditor"
            type="text"
            @click="editServerImplement(server, key)"></Button>
          <Button
            icon="md-close"
            :disabled="serverImplementEditor || key === 'default'"
            type="text"
            @click="deleteServerImplement(server, key)"></Button>
        </div>
      </li>
      <div class="implement-plugin-server-create" v-show="addServerListShow">
        <Form ref="addServerList" :model="createServer" :rules="serverValidate" :label-width="70">
          <FormItem label="英文名" prop="key" style="margin: 0px 5px 25px 5px;">
            <Input v-model="createServer.key" placeholder="英文名" id="createServerName"
                   @on-focus="serverKeyExist = false"
                   @on-blur="checkCreateServerName(createServer.key)"></Input>
            <span v-show="serverKeyExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
          </FormItem>
          <FormItem label="显示名" prop="displayName" style="margin: 0px 5px 25px 5px;">
            <Input v-model="createServer.displayName" placeholder="显示名"
                   id="createServerDisplayName"></Input>
          </FormItem>
        </Form>
        <div class="implement-plugin-server-create-action">
          <Button class="margin-right-5" type="default" @click="handleCloseCreateServer">
            关闭
          </Button>
          <Button type="primary" @click="handleCreateServer">
            保存
          </Button>
        </div>
      </div>
      <div class="implement-plugin-server-edit" v-show="editServerListShow">
        <Form ref="editServerList" :model="editServer" :rules="serverValidate" :label-width="70">
          <FormItem label="英文名" prop="key" style="margin: 0px 5px 25px 5px;">
            <Input v-model="editServer.key" placeholder="英文名" id="editServerName"
                   :disabled="true"
                   @on-focus="serverKeyExist = false"
                   @on-blur="checkCreateServerName(editServer.key)"></Input>
            <span v-show="serverKeyExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
          </FormItem>
          <FormItem label="显示名" prop="displayName" style="margin: 0px 5px 25px 5px;">
            <Input v-model="editServer.displayName" placeholder="显示名"
                   id="editServerDisplayName"></Input>
          </FormItem>
        </Form>
        <div class="implement-plugin-server-edit-action">
          <Button class="margin-right-5" type="default" @click="handleCloseEditServer">
            关闭
          </Button>
          <Button type="primary" @click="handleEditServer">
            保存
          </Button>
        </div>
      </div>
    </ul>
  </div>
</template>

<script>
import _ from "lodash";
import MonacoEditor from "@/views/functional-model/components/MonacoEditor";
export default {
  name: "OperationImplementEditor",
  props: [
    'value',
    'lang',
    'oprScript',
    'field'
  ],
  components: {
    MonacoEditor
  },
  data() {
    return {
      serverImplementEditor: false,
      clientImplement: '',
      serverImplement: '',
      serverImplementKey: '',
      serverImplementDisplayName: '',
      addServerListShow: false,
      editServerListShow: false,
      serverKeyExist: false,
      createServer: {
        key: '',
        displayName: ''
      },
      editServer: {
        key: '',
        displayName: ''
      },
      serverValidate: {
        key: [
          {required: true, message: "英文名不能为空", trigger: "blur"},
          {
            pattern: /^[a-zA-Z0-9]{1,32}$/,
            message: "英文名只能包含字母、数字，长度不超过32个字符",
            trigger: "blur"
          },
          {pattern: /^[a-zA-Z]/, message: "英文名首字母应为字母", trigger: "blur"}
        ],
        displayName: [
          {
            pattern: /^\S{1,32}$/,
            message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ],
      },
    }
  },
  watch: {
    value(val){
      this.clientImplement = val;
    },

    clientImplement(val){
      this.$emit('input', val);
    },

    serverImplement(val){
      this.$emit('serverImplementChange', val);
    },

    serverImplementEditor(val){
      this.$emit('serverImplementEditorChange', val)
    }
  },
  computed: {
  },
  created() {
    this.clientImplement = this.value;
  },
  methods: {
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 增加一条后端脚本列表
     */
    addServerScript() {
      if(this.editServerListShow || this.serverImplementEditor){
        this.$Message.error('请先保存当前脚本')
        return
      }else{
        this.addServerListShow = true;
      }
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 编辑后端脚本列表
     */
    editServerScript(server, key) {
      this.editServer.key = key;
      this.editServer.displayName = server.displayName;
      this.editServerListShow = true;
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 取消新增后端脚本列表
     */
    handleCloseCreateServer() {
      this.addServerListShow = false;
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 取消编辑后端脚本列表
     */
    handleCloseEditServer() {
      this.editServerListShow = false;
      // this.$refs.editServerList.resetFields();
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 新增后端脚本列表
     */
    handleCreateServer() {
      this.$refs['addServerList'].validate((valid) => {
        if(valid){
          this.$emit('handleCreateServer', this.field, this.createServer)
          this.addServerListShow = false;
          this.$refs.addServerList.resetFields();
        }
      })
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 编辑后端脚本列表
     */
    handleEditServer() {
      this.$refs['editServerList'].validate((valid) => {
        if(valid){
          this.$emit('handleEditServer', this.field, this.editServer)
          this.editServerListShow = false;
          this.serverImplementDisplayName = this.editServer.displayName;
          // this.$refs.editServerList.resetFields();
        }
      })
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 判断重名
     */
    checkCreateServerName(key) {
      if (key in this.oprScript[this.field].server) {
        this.serverKeyExist = true;
      } else {
        this.serverKeyExist = false;
      }
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 修改后端脚本列表中的脚本
     * @param {Object} server后端脚本
     */
    editServerImplement(server, key) {
      this.serverImplementCatch = _.cloneDeep(server);
      this.serverImplementKey = key;
      this.serverImplement = server.script;
      this.serverImplementDisplayName = server.displayName;
      this.serverImplementEditor = true;
      this.editServerScript(server, key);
      this.$emit('editServerImplement', this.field, key, server);
    },
    editServerImplementNoEmit(server, key) {
      this.serverImplementKey = key;
      this.serverImplement = server.script;
      this.serverImplementDisplayName = server.displayName;
      this.serverImplementEditor = true;
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 删除后端脚本列表中的脚本
     * @param {Object} server后端脚本
     */
    deleteServerImplement(server, key) {
      this.$emit('deleteServerImplement', this.field, key);
      // this.$delete(this.editQuickForm.oprScript.implement.server, key)
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 确认后端脚本列表中的脚本
     * @param {Object} server后端脚本
     */
    confirmServerImplement() {
      this.$emit('confirmServerImplement', this.field, this.serverImplementKey, this.serverImplement)
      this.serverImplementEditor = false;
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 取消后端脚本列表中的脚本
     */
    cancelServerImplement() {
      this.serverImplementEditor = false;
      // this.serverImplement = '';
    },
    /**
    * @author LiuBo
    * @method
    * @name
    * @private
    * @description 设置后端脚本列表中的脚本
    */
    setServerImplement(imp){
      this.serverImplement = imp;
    }
  }
}
</script>

<style scoped>

.margin-right-5 {
  margin-right: 5px;
}

.implement-plugin-client {
  width: 100%;
  display: flex;
  position: relative;
}
.implement-plugin-server-pool {
  width: 30%;
  border-top: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  position: relative;
  height: 250px;
  overflow-y: auto;
}
.implement-plugin-server-editor {
  width: 70%;
  background: #fff;
  position: absolute;
}
.implement-plugin-server-list {
  list-style: none;
  display: flex;
  border-bottom: 1px solid #ddd;
  padding: 6px;
  cursor: pointer;
}

.implement-plugin-server-list:hover {
  background: #ddd;
}

.implement-plugin-server-list-displayName {
  width: 65%;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
  overflow: hidden;
}
.implement-plugin-server-editor-header {
  height: 40px;
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.implement-plugin-server-editor-headerName{
  width: 70%;
  margin-left: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
  overflow: hidden;
}

.implement-plugin-server-list-action {
  width: 35%;
}

.implement-plugin-server-create {
  position: absolute;
  top: 0px;
  background: #fff;
  width: 100%;
  height: 250px;
}
.implement-plugin-server-create-action {
  float: right;
  margin-right: 5px;
}
.implement-plugin-server-edit {
  position: absolute;
  top: 0px;
  background: #fff;
  width: 100%;
  height: 250px;
}
.implement-plugin-server-edit-action {
  float: right;
  margin-right: 5px;
}
</style>
