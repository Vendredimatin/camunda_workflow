<template>

  <Modal
    v-model="editOperation"
    title="操作配置"
    width="50%"
    :mask-closable="false"
    @on-ok="confirmFix"
    @on-cancel="cancel">
    <!-- 快速查询操作 -->
  <Form ref="editQuickForm" :model="editQuickForm" :rules="ruleFixQuick" :label-width="80">
    <Card style="width:100%; margin-bottom: 15px;">
      <p slot="title">
        <Icon type="ios-information-circle"></Icon>
        基本属性
      </p>
      <Row>
        <Col span="12">
          <FormItem label="英文名" prop="ename">
            <Input v-model.trim="editQuickForm.ename" :disabled="disEname" @on-focus="cnameExist = false" @on-blur="checkCname('editQuickForm')"></Input>
            <span v-show="cnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="显示名" prop="cname">
            <Input v-model.trim="editQuickForm.cname" @on-focus="dnameExist = false"></Input>
            <span v-show="dnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="模块名" prop="moduleName">
            <Input v-model="editQuickForm.moduleName" disabled></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="序号" prop="targetNumber" number>
            <Input v-model="editQuickForm.targetNumber"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="图标" prop="icon">
            <Select v-model="editQuickForm.icon" filterable @on-change="chooseIcon">
              <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                <img :src="GLOBAL.baseUrl + '/icons/' + item.label" alt="">
                <span style="float:right;color:#ccc">{{ item.label }}</span>
              </Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="操作样式" prop="style">
            <Select v-model="editQuickForm.style" filterable>
              <Option v-for="item in quickStyle" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="动作" prop="action">
            <Select v-model="editQuickForm.action" filterable>
              <Option v-for="item in actionList" :value="item.value" :key="item.value" :label="item.value">
                <span>{{ item.value }}</span>
                <span style="float:right;color:#ccc">{{ item.label }}</span>
              </Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="视图标题" prop="viewTitle">
            <Input v-model.trim="editQuickForm.viewTitle"></Input>
          </FormItem>
        </Col>
      </Row>
    </Card>
    <Card style="width:100%" v-show="editQuickForm.action != 'folder'">
      <p slot="title">
        <Icon type="ios-film-outline"></Icon>
        动作
      </p>
      <Row v-show="editQuickForm.action == 'implement'">
        <FormItem label="实现方式">
          <RadioGroup v-model="editQuickForm.radio" @on-change="chooseWayQucik">
            <Radio label="插件调用" :disabled="nonePlug">插件调用</Radio>
            <Radio label="后端脚本">后端脚本</Radio>
            <Radio label="前端脚本">前端脚本</Radio>
            <Radio label="存储过程">存储过程</Radio>
            <Radio label="插件别名">插件别名</Radio>
          </RadioGroup>
        </FormItem>
      </Row>
      <Row v-show="editQuickForm.action == 'implement' && editQuickForm.radio == '插件调用'">
        <FormItem label="脚本内容">
          <Select v-model="editQuickForm.plugPath" filterable>
            <Option v-for="item in plugList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Row>
      <Row v-show="editQuickForm.action == 'implement' && editQuickForm.radio != '插件调用'">
        <FormItem label="脚本内容">
          <editor v-model="editQuickForm.content" @init="editorInit" lang="javascript" theme="chrome" width="85%" height="200"></editor>
        </FormItem>
      </Row>
      <Row v-show="(editQuickForm.action == 'create' || editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'creates' || editQuickForm.action == 'list')">
        <Col span="12">
          <Row>
            <Col span="1">
              <span class="editRedFlag">*</span>
            </Col>
            <Col span="23">
              <FormItem label="目标类" prop="goal">
                <Select v-model="editQuickForm.goal" filterable @on-change="changeView">
                  <OptionGroup label="实体类">
                    <Option v-for="item in entitiesList" :value="item.value" :key="item.value" :label="item.label">
                      <span>{{ item.label }}</span>
                      <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                    </Option>
                  </OptionGroup>
                  <OptionGroup label="资源类">
                    <Option v-for="item in resourcesList" :value="item.value" :key="item.value" :label="item.label">
                      <span>{{ item.label }}</span>
                      <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                    </Option>
                  </OptionGroup>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Col>
        <Col span="12">
          <Row>
            <Col span="1">
              <span class="editRedFlag" style="left: 20%;">*</span>
            </Col>
            <Col span="23">
              <FormItem label="视图名称" prop="viewName">
                <Select v-model="editQuickForm.viewName" filterable>
                  <Option v-for="item in viewList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row v-show="editQuickForm.action == 'url'">
        <Col span="12">
          <FormItem label="URL地址" prop="linkUrl">
            <Input v-model="editQuickForm.linkUrl" placeholder="可用$obj, $user等"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row v-show="(editQuickForm.action == 'edit' || editQuickForm.action == 'visit' || editQuickForm.action == 'list')">
        <FormItem label="条件表达式" prop="queryCont">
          <Input v-model="editQuickForm.queryCont" type="textarea" placeholder="请输入and开头的jpql表达式, 如and obj.state='下达', 可用$obj, $user等"></Input>
        </FormItem>
      </Row>
    </Card>
  </Form>
  </Modal>
  <!-- 编辑操作ending -->
</template>

<script>
  import {
    getPlugList,
    getIconList,
    getAllEntities,
    getAllResources,
    getViews,
    fixQuickOpe,
    checkCnameEvent,
    createQuickOpe,
    getQuickOpeById
  } from "@/api/others";
  export default {
    props: ['context'],

    data() {
      const validateEname = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('英文名不能为空'));
        } else {
          const reg = new RegExp("^[A-Za-z0-9]*$");
          let flag = reg.test(value);
          if(!flag){
            callback(new Error('英文名只能包含字母和数字哦～'));
          } else {
            callback();
          }
        }
      };
      return {
        editOperation: false,
        newMoadl: false,
        hasData: true,
        loadingObj: false,
        disEname: true,
        cnameExist: false,
        dnameExist: false,
        finalValue: false,
        folderFobbiden: false,      // folder操作仅允许绑定快速查询操作
        bindModal: false, // 仅创建
        createBindModal: false, // 创建并绑定
        delOpe: false,
        operationList: [],
        editFlag: 3, // 当前编辑的是系统 & 快速查询操作 0:系统
        nonePlug: false, // 是否禁止选择插件入口的方式
        plugData: [],
        plugList: [],
        editQuickForm: {
          ename: "",
          cname: "",
          moduleName: "",
          targetNumber: "",
          icon: "",
          style: "",
          action: "create",
          radio: "插件调用",
          plugPath: "",
          content: "",
          goal: "",
          params: "",
          viewTitle: "",
          viewName: "",
          // goalObj: "",
          linkUrl: "",
          queryCont: "",
          oid: ""
        },
        needDelId: "",
        needDelType: 0,
        needDelModule: "",
        needDelVname: "",
        actionList: [
          {
            value: "create",
            label: "单对象创建"
          },
          {
            value: "list",
            label: "多对象浏览"
          },
          {
            value: "url",
            label: "外部链接"
          },
          {
            value: "implement",
            label: "操作实现"
          },
          {
            value: "folder",
            label: "树形节点"
          },
          {
            value: "edit",
            label: "单对象编辑"
          },
          {
            value: "visit",
            label: "单对象浏览"
          },
          {
            value: "creates",
            label: "多对象创建"
          }
        ],
        iconList: [], // icon列表
        entitiesList: [], // 实体类列表
        resourcesList: [], // 资源类列表
        viewList: [], // 视图列表
        quickStyle: [
          {
            value: "button",
            label: "button | 独立按钮"
          },
          {
            value: "group",
            label: "group | 按钮点击后的下拉菜单"
          },
          {
            value: "icon",
            label: "icon | 带图标的按钮"
          }
        ],
        ruleNewModal: {
          cname: [
            { required: true, message: "显示名不能为空哦～", trigger: "blur" }
          ],
          ename: [
            { required: true, message: "英文名不能为空哦～", trigger: "blur" },
            { validator: validateEname, trigger: 'blur' }
          ],
          targetNumber: [
            {
              pattern: /^[0-9]*$/,
              message: "序号只能是数字哦～",
              trigger: "blur"
            }
          ]
        },
        ruleBind: {
          cname: [
            { required: true, message: "显示名不能为空哦～", trigger: "blur" }
          ]
        },
        ruleBindCreate: {
          cname: [
            { required: true, message: "显示名不能为空哦～", trigger: "blur" }
          ],
          ename: [
            { required: true, message: "英文名不能为空哦～", trigger: "blur" },
            { validator: validateEname, trigger: 'blur' }
          ],
          editJs: [
            { required: true, message: "脚本内容不能为空哦～", trigger: "blur" }
          ]
        },
        ruleFix: {
          cname: [
            { required: true, message: "显示名不能为空哦～", trigger: "blur" }
          ]
        },
        ruleModel: {
          cname: [
            { required: true, message: "显示名不能为空哦～", trigger: "blur" }
          ],
          targetNumber: [
            {
              pattern: /^[0-9]*$/,
              message: "序号只能是数字哦～",
              trigger: "blur"
            }
          ]
        },
        fixModel: {},
        ruleFixQuick: {
          ename: [
            { required: true, message: '英文名不能为空哦～', trigger: 'blur' },
            { validator: validateEname, trigger: 'blur' }
          ],
          cname: [
            { required: true, message: '显示名不能为空哦～', trigger: 'blur' }
          ],
          icon: [
            { required: true, message: '请选择小图标～', trigger: 'blur' }
          ],
          action: [
            { required: true, message: '请选择动作类型～', trigger: 'blur' }
          ],
          style: [
            { required: true, message: '请选择操作样式～', trigger: 'blur' }
          ],
          viewTitle: [
            { required: true, message: '视图标题不能为空哦～', trigger: 'blur' }
          ]
        },
        bindParams: {
          bindClassName: "",
          bindID: ""
        }
      };
    },
    components: {
      editor: require("vue2-ace-editor")
    },
    methods: {
      editorInit() {
        require("brace/ext/language_tools"); //language extension prerequsite...
        require("brace/mode/html");
        require("brace/mode/javascript"); //language
        require("brace/mode/less");
        require("brace/theme/chrome");
        require("brace/snippets/javascript"); //snippet
      },
      // 数据初始化
      initData() {
        // 操作列表get
        this.operationList = [];

        // Icon列表获取
        getIconList()
          .then(response => {
            let res = response.data;
            if (!res.success) {
              this.$Spin.hide();
              const title = "提示";
              const content = "<p>服务器繁忙, 图标获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val) => {
                let eachIcon = {
                  value: val.name,
                  label: val.name
                };
                this.iconList.push(eachIcon);
              });
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
        // 目标类获取（即实体类资源类总和）
        getAllEntities()
          .then(response => {
            let res = response.data;
            if (!res.success) {
              this.$Spin.hide();
              const title = "提示";
              const content = "<p>服务器繁忙, 实体类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val, index, val_arr) => {
                let eachItem = {
                  value: val.className + "&e",
                  label: val.displayName
                };
                this.entitiesList.push(eachItem);
              });
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });

        getAllResources()
          .then(response => {
            let res = response.data;
            if (!res.success) {
              this.$Spin.hide();
              const title = "提示";
              const content = "<p>服务器繁忙, 资源类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val) => {
                let eachItem = {
                  value: val.className + "&r",
                  label: val.displayName
                };
                this.resourcesList.push(eachItem);
              });
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
        // 获取插件列表
        getPlugList()
          .then(response => {
            let res = response.data;
            if (!res.success) {
              // 系统插件获取失败 禁止选择插件入口方式
              this.nonePlug = true;

              this.editQuickForm.radio = "后端脚本";
              this.editQuickForm.content = "serverScript:";
            } else {
              if (res.data.length == 0) {
                // 系统插件数量为零 禁止选择插件入口方式
                this.nonePlug = true;

                this.editQuickForm.radio = "后端脚本";
                this.editQuickForm.content = "serverScript:";
              } else {
                this.plugData = res.data;
                res.data.forEach((val, index) => {
                  let eachPlug = {
                    value: index,
                    label: val.name
                  };
                  this.plugList.push(eachPlug);
                });
              }
            }
          })
          .catch(e => {
            console.log(e);
          });
      },

      // 快速查询操作英文名查重
      checkCname(fname) {
        if (this.$refs[fname].model.ename != "") {
          checkCnameEvent(this.$refs[fname].model.ename)
            .then(response => {
              let res = response.data;
              if (res.success && res.data != undefined) {
                this.cnameExist = true;
              } else {
                this.cnameExist = false;
              }
            })
            .catch(e => {
              console.log(e);
              this.$Spin.hide();
            });
        }
      },

      // 脚本实现方式  快速查询操作操作
      chooseWayQucik(value) {
        if (value == "后端脚本") {
          this.editQuickForm.content = "serverScript:";
        } else if (value == "存储过程") {
          this.editQuickForm.content = "procedure:";
        } else if (value == "前端脚本") {
          this.editQuickForm.content = "clientScript:";
        } else {
          this.editQuickForm.content = "";
        }
      },

      cancel() {},
      chooseIcon(value) {
        this.editQuickForm.icon = value;
      },
      // 视图 & 目标对象联动
      changeView(value) {
        this.viewList = [];
        this.loadingObj = true;
        // 视图数据获取
        let eachClass = value.split("&")[0];
        let whichClass = value.split("&")[1];
        if(eachClass != '') {
          getViews(eachClass)
            .then(response => {
              let res = response.data;
              if (!res.success) {
                this.$Spin.hide();
              } else {
                if (res.data.length == 0) {
                  let eachItem = {
                    value: "*",
                    label: "*"
                  };
                  this.viewList.push(eachItem);
                  this.editQuickForm.viewName = "*";
                } else {
                  res.data.forEach((val, index, val_arr) => {
                    let eachVname = val.viewName;
                    let eachItem = {
                      value: eachVname,
                      label: eachVname
                    };
                    this.viewList.push(eachItem);
                  });
                  this.editQuickForm.viewName = this.viewList[0].value;
                }
              }
            })
            .catch(e => {
              console.log(e);
              this.$Spin.hide();
            });
        }
      },
      // 点击事件 返回数据处理
      makeData(data) {
        const t = this.type(data);
        let o;
        if (t === "array") {
          o = [];
        } else if (t === "object") {
          o = {};
        } else {
          return data;
        }
        if (t === "array") {
          for (let i = 0; i < data.length; i++) {
            o.push(this.makeData(data[i]));
          }
        } else if (t === "object") {
          for (let i in data) {
            if (
              i != "spaceHtml" &&
              i != "parent" &&
              i != "level" &&
              i != "expanded" &&
              i != "isShow" &&
              i != "load"
            ) {
              o[i] = this.makeData(data[i]);
            }
          }
        }
        return o;
      },

      type(obj) {
        var toString = Object.prototype.toString;
        var map = {
          "[object Boolean]": "boolean",
          "[object Number]": "number",
          "[object String]": "string",
          "[object Function]": "function",
          "[object Array]": "array",
          "[object Date]": "date",
          "[object RegExp]": "regExp",
          "[object Undefined]": "undefined",
          "[object Null]": "null",
          "[object Object]": "object"
        };
        return map[toString.call(obj)];
      },

      // 确认修改
      confirmFix() {
        if(this.editFlag == 1){
          console.log(this.editQuickForm);
          this.$refs['editQuickForm'].validate(valid => {
            if (!valid) {
              this.$Message.error('格式有误, 修改失败');
            } else {
              // 修改快速查询操作
              let finalExpre = null;
              if(this.editQuickForm.action == 'url') {
                finalExpre = this.editQuickForm.linkUrl;
              } else if(this.editQuickForm.action == 'implement') {
                if (this.nonePlug) {
                  finalExpre = this.editQuickForm.content;
                } else {
                  finalExpre = this.editQuickForm.plugPath;
                }
              } else {
                finalExpre = this.editQuickForm.queryCont;
              }
              let fixQuickParams = {
                action: this.editQuickForm.action,
                authority: this.editQuickForm.ename.split(' ').join(''),
                conType: this.editQuickForm.style,
                conditionExpre: finalExpre,
                displayName: this.editQuickForm.cname.split(' ').join(''),
                icon: this.editQuickForm.icon,
                moduleName: this.editQuickForm.moduleName,
                oid: this.editQuickForm.oid,
                order: this.editQuickForm.targetNumber,
                params: this.editQuickForm.params,
                targetClass: this.editQuickForm.goal.split("&")[0] || '',
                viewName: this.editQuickForm.viewName,
                viewTitle: this.editQuickForm.viewTitle,
                viewType: ""
              };

              fixQuickOpe(fixQuickParams).then(res => {
                if (!res.success) {
                  this.$Spin.hide();
                  this.$Message.warning({
                    content: "服务器繁忙, 修改失败请稍后再试",
                    duration: 3
                  });
                } else {
                  this.$Message.info({
                    content: "修改成功",
                    duration: 3
                  });
                }
              }).catch(e => {
                console.log(e);
                this.$Spin.hide();
              });
            }
          })
        } else if(this.editFlag == 3){
          this.$refs['editQuickForm'].validate((valid) => {
            if (!valid || this.cnameExist) {
              this.$Message.error('格式有误, 绑定失败');
            } else {
              if (this.editQuickForm.action == 'create' || this.editQuickForm.action == 'edit' || this.editQuickForm.action == 'visit' || this.editQuickForm.action == 'creates' || this.editQuickForm.action == 'list') {
                if(this.editQuickForm.goal == '') {
                  this.errorRexp("请选择目标类");
                } else if(this.editQuickForm.viewName == '') {
                  this.errorRexp("请选择视图名称");
                } else { this.commonFixQope(); }
              }  else if (this.editQuickForm.action == 'url') {
                if(this.editQuickForm.linkUrl == '') {
                  this.errorRexp("请填写合法url地址");
                } else {
                  this.commonFixQope();
                }
              } else {
                this.commonFixQope();
              }
            }
          })
        }
      },

      // common不合法信息弹窗
      errorRexp(mes) {
        let _self = this;
        this.$Message.warning({
          content: mes,
          duration: 2,
          onClose: function() {
            _self.context.show = true;
          }
        });
      },

      // 公共更新快速查询操作
      commonFixQope() {
        let finalExpre = null;
        if(this.editQuickForm.action == 'url') {
          finalExpre = this.editQuickForm.linkUrl;
        } else if(this.editQuickForm.action == 'implement') {
          if (this.nonePlug) {
            finalExpre = this.editQuickForm.content;
          } else {
            finalExpre = this.editQuickForm.plugPath;
          }
        } else {
          finalExpre = this.editQuickForm.queryCont;
        }

        let fixQuickParams = {
          action: this.editQuickForm.action,
          authority: this.editQuickForm.ename,
          conType: this.editQuickForm.style,
          conditionExpre: finalExpre,
          displayName: this.editQuickForm.cname,
          icon: this.editQuickForm.icon,
          moduleName: this.editQuickForm.moduleName,
          order: this.editQuickForm.targetNumber,
          params: this.editQuickForm.params,
          targetClass: this.editQuickForm.goal.split("&")[0] || '',
          viewName: this.editQuickForm.viewName,
          viewTitle: this.editQuickForm.viewTitle
        };

        createQuickOpe(fixQuickParams)
          .then(res => {
            if (!res.success) {
              const _self = this;
              this.$Spin.hide();
              this.$Message.warning({
                content: res.message,
                duration: 3,
                onClose: function() {
                  _self.context.show = true;
                  if(res.code == 400) {
                    _self.dnameExist = true;
                  }
                }
              });
            } else {
              this.$Message.info({
                content: "绑定成功",
                duration: 3
              });
              this.$emit("success-create-queryopr", res.data);
              this.$refs['editQuickForm'].resetFields();
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
      },

      // 创建快速查询操纵
      createBindQuick(bindPoint) {
        this.bindModal = false;
        this.createBindModal = false;
        this.$refs["editQuickForm"].resetFields();
        this.editQuickForm.action = "create";
        this.editQuickForm.icon = "";
        this.editQuickForm.moduleName = bindPoint;
        this.editOperation = true;
        this.editFlag = 3;
        this.disEname = false;
        this.cnameExist = false;
        this.dnameExist = false;
      },

      editBindQuick(queryOprId){
        getQuickOpeById(queryOprId).then(result => {
          result = result.data;

          this.editFlag = 1;
          this.disEname = true;
          this.editQuickForm.ename = result.authority;
          this.editQuickForm.cname = result.displayName;
          this.editQuickForm.moduleName = result.moduleName;
          this.editQuickForm.icon = result.icon;
          this.editQuickForm.goal = result.targetClass;
          this.editQuickForm.action = result.action == 'list' ? 'visit' : result.action;
          this.editQuickForm.oid = result.oid;
          this.editQuickForm.targetNumber = result.order;
          this.editQuickForm.style = result.conType;
          this.editQuickForm.viewTitle = result.viewTitle;
          this.editQuickForm.viewName = result.viewName;

          console.log(result.conditionExpre);

          if(result.conditionExpre.indexOf('addin:') != -1) {
            this.editQuickForm.radio = '插件调用';
          } else if(result.conditionExpre.indexOf('serverScript:') != -1) {
            console.log(666)
            this.editQuickForm.radio = '后端脚本';
          } else if(result.conditionExpre.indexOf('clientScript:') != -1) {
            this.editQuickForm.radio = '前端脚本';
          } else if(result.conditionExpre.indexOf('procedure:') != -1) {
            this.editQuickForm.radio = '存储过程';
          } else {
            this.editQuickForm.radio = '插件别名';
          }

          this.editQuickForm.content = result.conditionExpre;
          this.editQuickForm.plugPath = result.conditionExpre.substring(5, result.conditionExpre.length) || '';

          let finalEclass = result.targetClass + "&e";
          let finalRclass = result.targetClass + "&r";
          let isEtype = this.entitiesList.findIndex((el, index, arr) => {
            return el.value == finalEclass;
          })
          if(isEtype != -1) {
            this.editQuickForm.goal = result.targetClass  + "&e";
          } else {
            this.resourcesList.findIndex((el, index, arr) => {
              return el.value == finalRclass;
            });
            this.editQuickForm.goal = result.targetClass + "&r";
          }
          this.editQuickForm.linkUrl = result.conditionExpre;
          this.editQuickForm.params = result.conditionExpre;
          this.editQuickForm.opePath = result.conditionExpre;

          this.editOperation = true;
        })
      }
    },


    created() {
      this.initData();
    }
  };
</script>

<style scoped>

</style>
