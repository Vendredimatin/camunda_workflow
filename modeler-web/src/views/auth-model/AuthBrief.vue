<template>
  <Layout style="background: #FFF"  :style="{borderTop: showTabs ? '' : '1px solid #e8eaec'}">
    <Layout class="mylayout">
      <!--<Row style="height: 40px;line-height: 40px;border-bottom: 1px solid #ccc">
        <h2 style="font-weight: bold;font-size: 16px !important;">
          <Icon type="logo-tux"/>
          快速授权
        </h2>
      </Row>-->
      <Row style="padding-bottom: 15px;">

        <transition name="auth-card">
          <div id="rightRuleDetails" class="info-wrap" :style = "{top: showTabs ? '112px' : '80px'}" v-show="authCardShow">
            <div
              style="height: 42px;line-height: 18px;padding: 12px;border-bottom: 1px solid #696969;vertical-align: middle;width: 100%">
              <Icon type="ios-information-circle"></Icon>
              <Tooltip :content="`授权项:${chosenAuthItem.displayName}`" max-width="300" style="word-break: break-all;">
                <p style="font-size: 18px !important;font-weight: bold;width: 100%; overflow: hidden; word-break: break-all;text-overflow: ellipsis; display: inline-block; white-space: nowrap;">
                  授权项:{{chosenAuthItem.displayName}}
                </p>
              </Tooltip>
              <Button id="closeAuthCardButton" shape="circle" icon="md-close" :size="'small'" style="float: right; cursor: pointer"
                      @click="closeAuthCard"></Button>
            </div>
            <div style="padding: 10px">
              <div v-if="chosenAuthItem.appName">
                应用:<label>{{chosenAuthItem.title}}</label>
              </div>
              <div v-else-if="chosenAuthItem.targetClass">
                <Row>
                  <Col span="24">
                    实体类:<label>{{chosenAuthItem.targetClass}}</label>
                  </Col>
                </Row>
                <Row>
                  <Col span="24" v-if="chosenAuthItem.viewName">
                    表单:<label>{{chosenAuthItem.viewName}}</label>
                  </Col>
                </Row>
                <Row>
                  <Col span="24">
                    操作:<label>{{chosenAuthItem.action}}</label>
                  </Col>
                </Row>
              </div>
              <div v-else>

                模块:<label>{{chosenAuthItem.displayName}}</label>
              </div>

              <div style="padding: 10px 0" v-if="usersPresent.length===0">暂无授权用户</div>
              <div v-else>
                <div style="padding: 4px 0">授权用户:</div>
                <div ref="authUserRight" :style="{height: cardHeights, 'overflowY': 'auto'}">
                  <div :style='usersPresentWrap' v-for="(rule,index) in usersPresent" :key="rule.oid">
                    <!-- <Icon type="ios-person" style="margin-right:8px"></Icon> -->
                    <Icon :type="oidToGroup[rule.participant] === undefined ? 'md-person' : 'md-people'" style="margin-right:8px"></Icon>
                    {{userNametoDisaplayName[rule.participant]}}
                    <span style="float:right;margin-right:8px">
                    <Button :disabled="allDisabled" v-bind:id="step(index)" icon="md-remove" size="small" style="margin-left:8px" @click="removeRule(rule.oid,index)"/>
                  </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <div id="leftAppList" class="tree-wrap">
          <Input
            v-model="keyword"
            id="searchAuthWordInput"
            icon="md-search"
            placeholder="输入关键词查询"
            style="margin-bottom: 16px"
          >
          </Input>
          <Tree ref="treeTable" :data="filteredTreeData" :render="renderContent" :style="{height: tableHeights, overflowY: 'auto'}"></Tree>
        </div>

      </Row>


      <Modal
        v-model="addRuleModal"
        id="createRuleModal"
        title="添加规则"
        width="650px"
      >
        <Form :label-width="120">
          <FormItem label="授权项">
            <Input id="AuthorizationItem" style="width:450px" disabled v-model="chosenAuthItem.displayName"></Input>
          </FormItem>

          <FormItem label="选择用户(组)">
            <Select ref="selectUser"
              id="selectUserInput"
              v-model="chosenUser"
              style="width:450px"
              filterable
              clearable
              multiple
              remote
              @on-query-change="changeRemote"
              :remote-method="remoteUser"
              :loading="remoteLoadingUser"
              @on-open-change="resetUserGroup">
              <OptionGroup label="用户组" style="width:450px">
                <Option v-for="item in groups" :value="item.name" :key="`${item.oid}_${item.name}`">{{ `${item.name}(${item.displayName})` }}
                </Option>
              </OptionGroup>
              <OptionGroup label="用户" style="width:450px">
                <Option v-for="item in remoteUserArr" :value="item.name" :key="`${item.oid}_${item.name}`">
                  {{ item.label }}
                </Option>
              </OptionGroup>
            </Select>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button id="cancelCreateRuleButton" type="text" size="large" @click="addRuleModal=false">取消</Button>
          <Button id="confirmCreateRuleButton" type="primary" size="large" :disabled="allDisabled"
                  @click="createRule()">
            确认
          </Button>
        </div>
      </Modal>


    </Layout>
  </Layout>

</template>

<script>
  import {tableMixin} from "@/component/tableMixin"
  import {getApps, getModules, getAllEntities, getAppModulesAndOperation,  getAppModules, getModuleOperations} from "@/api/others";
  import {mapActions, mapGetters} from "vuex";
  import AuthRules from "@/api/auth-model/AuthRules";
  import _ from 'lodash';
  export default {
    name: "auth-brief",
    props: ["store"],
    mixins: [tableMixin],
    data() {
      return {
        alwaysTrue: true,
        chosenAuthItem: {},
        rootClassName: "",
        authCardShow: false,
        usersPresent: [],
        chosenUser: [],
        users: [],
        remoteUserArr: [],    // 用户最多显示100条 远程支持
        temRemoteUserArr: [],    // 用户最多显示100条 远程支持
        groups: [],
        remoteLoadingUser: false,
        addRuleModal: false,
        treeRowWrap: {
          display: 'inline-block',
          width: 'calc(100% - 20px)',
          padding: '4px 0',
          borderBottom: '1px solid #ddd',
          lineHeight: '32px',
          margin: '-4px 0'
        },
        usersPresentWrap: {
          display: 'inline-block',
          width: 'calc(100% - 10px)',
          padding: '4px 0',
          borderBottom: '1px solid #ddd',
          lineHeight: '32px',
          fontSize: "16px !important",
        },
        treeData: [],
        keyword: '',
        allDisabled: false,
        userNametoDisaplayName: {},
        showTabs: true
      }
    },
    created() {
      this.$store = this.store ? this.store : this.$store;
      this.setAllRules();
      this.getUserAndGroups();
      this.initData();
      this.allDisabled = sessionStorage.getItem("usernameM") != 'admin';
    },
    mounted() {
      this.showTabs = sessionStorage.getItem('showTabs') == 'hide' ? false : true
    },
    methods: {
      step(i){
        return "deleteUserRuleButton"+i;
      },

      globalRefresh() {
        this.setAllRules();
        this.getUserAndGroups();
        this.initData(true);
      },
      addRootClassName(target, rootClassName) {
        let _self = this;
        let children = target.children;
        for (let i = 0; i < children.length; ++i) {
          let child = children[i];
          child.rootClassName = rootClassName;
          if (child.children && child.children.length > 0) {
            _self.addRootClassName(child, rootClassName);
          }
        }
      },
      changeRemote(v) {
        if(v == '') {
          setTimeout(() => {
              this.remoteUserArr = this.temRemoteUserArr;
          }, 200)
        }
      },
      remoteUser(query) {
        if (query !== '') {
          this.remoteLoadingUser = true;
          let self = this;
          setTimeout(() => {
              self.remoteLoadingUser = false;
              self.remoteUserArr = self.users.filter(item => item.label.toLowerCase().indexOf(query.toLowerCase()) > -1);
          }, 200);
        } else {
            this.remoteUserArr = this.temRemoteUserArr;
        }
      },
      initData(rFlag) {
        this.$Spin.show();
        let appIndex = {};  // order in all roots
        let moduleIndex = {};  // order in app's children
        let moduleData = [];  // 计算一级菜单（模块）所需原始数据
        let operationIndex = {};  // order in module's children
        let authToOperation = {};  // operation's authority -> operation (只存了二级菜单)
        let operationData = [];  // 计算二、三级菜单（操作）所需原始数据
        let promises = [];
        let withDefaultModule = true
        getAppModulesAndOperation(withDefaultModule).then(res => {
          this.treeData = res.data.data.map(row => {
            return {
              ...row,
              displayName: row.title,
              render: (h, {root, node, data}) => {
                return h('span', {
                  style: this.treeRowWrap
                }, [
                  h('span', [
                    h('Icon', {
                      props: {
                        type: 'logo-dropbox'
                      },
                      style: {
                        marginRight: '8px'
                      }
                    }),
                    h('Tooltip',
                    {
                      props: { placement: 'bottom', maxWidth: 300, transfer: true}
                    }, [
                      h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },data.title),
                      h('span', {
                        style: {                        
                          display: 'inline-block',
                          width: '300px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          lineHeight: '1',
                          verticalAlign: 'middle'
                        }
                      }, data.title
                      )
                    ])
                  ]),
                  h('span', {
                    style: {
                      display: 'inline-block',
                      float: 'right',
                      marginRight: '8px'
                    }
                  }, [
                    h('Button', {
                      props: Object.assign({}, this.buttonProps, {
                        icon: 'md-add',
                        type: 'primary',
                        size: 'small'
                      }),
                      attrs: {
                        id: 'createRuleButton'
                      },
                      on: {
                        click: () => {
                          this.showModal(data)
                        }
                      }
                    }),
                    h('Button', {
                      props: Object.assign({}, this.buttonProps, {
                        icon: 'ios-eye',
                        size: 'small'
                      }),
                      attrs: {
                        id: 'viewRuleButton'
                      },
                      style: {
                        marginLeft: '8px'
                      },
                      on: {
                        click: () => {
                          this.showAuthCard(data)
                        }
                      }
                    })
                  ])
                ]);
              }
            };
          })
        }).then(() => {
          for (let i = 0; i < this.treeData.length; ++i) {
            let moduleDataTmp = this.treeData[i].children;
            if (this.treeData[i].appName == 'modeler' && moduleDataTmp.length > 0) {
              moduleDataTmp = moduleDataTmp.filter(x => {
                return x.className != 'ModelPackage'
              })
            }
            this.treeData[i].children = moduleDataTmp.length > 0? moduleDataTmp : undefined;
            for (let j = 0; moduleDataTmp && j < moduleDataTmp.length; j++) {
                let operationDataTmp = moduleDataTmp[j].children;
                if (
                  this.treeData[i].appName == 'modeler' && operationDataTmp.length > 0) {
                  operationDataTmp = operationDataTmp.filter(x => {
                    return x.conditionExpre != 'addin:AuthBlock'
                    && x.conditionExpre != 'addin:AttrAccessRule'
                    && x.conditionExpre != 'addin:ObjAccessRule'
                    && x.conditionExpre != 'addin:OnlineManagement'
                    && x.conditionExpre != 'addin:ModelPackageManage'
                    && x.conditionExpre != 'addin:CodeAssembly'
                  })
                }
                for (let k = 0; operationDataTmp && k < operationDataTmp.length; k++) {
                  if (operationDataTmp[k].action == 'folder') {
                    for (let p = 0;operationDataTmp[k].children&& p < operationDataTmp[k].children.length; p++) {
                      operationDataTmp[k].children[p].children = undefined;
                      operationDataTmp[k].children[p].rootModuleName = operationDataTmp[k].moduleName;
                    }
                    operationData = operationData.concat(operationDataTmp[k].children)
                  }
                  else {
                    operationDataTmp[k].children = undefined;
                  }
                  
                }
                moduleDataTmp[j].children = operationDataTmp.length > 0 ? operationDataTmp: undefined;
                operationData = operationData.concat(operationDataTmp)
                // console.log('operationData', j, this.operationData, operationData)
            }
            moduleData = moduleData.concat(moduleDataTmp)
          }
        })
        .then(() => {
          this.filteredTreeData = this.treeData.slice(0);
          console.log('filteredTreeData',this.filteredTreeData)
          if(rFlag == true) {
            this.authCardShow = false;
          }
          this.$Spin.hide();
        })
        .catch(error => {
          this.$Spin.hide();
        });
      },
      ...mapActions('authRules', ['setAllRules']),
      showModal(authItem) {
        this.chosenAuthItem = authItem;
        this.authCardShow = true;
        this.addRuleModal = true;
        this.$refs["selectUser"].clearSingleSelect();
        this.remoteUserArr = this.temRemoteUserArr;
        this.usersPresent = this.getRulesByItem(authItem.authority || authItem.className || `APP_${authItem.appName}`);
        let tempNameList = this.users.map(user => {
          return user.name;
        }).concat(this.groups.map(group => {
          return group.name;
        }));
        this.usersPresent = this.usersPresent.filter(rule => {
          return tempNameList.indexOf(rule.participant) > -1;
        })
      },
      showAuthCard(authItem) {
        //todo:: change users
        this.chosenAuthItem = authItem;
        this.authCardShow = true;
        this.usersPresent = this.getRulesByItem(authItem.authority || authItem.className || `APP_${authItem.appName}`);
        let tempNameList = this.users.map(user => {
          return user.name;
        }).concat(this.groups.map(group => {
          return group.name;
        }));
        this.usersPresent = this.usersPresent.filter(rule => {
          return tempNameList.indexOf(rule.participant) > -1;
        })
      },
      closeAuthCard() {
        this.authCardShow = false;
      },
      renderContent(h, {root, node, data}) {
        return h('span', {
          style: this.treeRowWrap
        }, [
          h('span', [
            h('Icon', {
              props: {
                type: 'logo-tux'
              },
              style: {
                marginRight: '8px'
              }
            }),
            h('Tooltip',
              { 
                props: { placement: 'bottom', maxWidth: 300, transfer: true},
              }, [
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },data.displayName),
                h('span', {
                style: {                        
                  display: 'inline-block',
                  width: '300px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  lineHeight: '1',
                  verticalAlign: 'middle'
                }
              }, data.displayName
              )
            ])
          ]),
          h('span', {
            style: {
              display: 'inline-block',
              float: 'right',
              marginRight: '8px'
            }
          }, [
            h('Button', {
              props: Object.assign({}, this.buttonProps, {
                icon: 'md-add',
                type: 'primary',
                size: 'small'
              }),
              attrs: {
                id: 'createRuleButton'
              },
              on: {
                click: () => {
                  this.showModal(data)
                }
              }
            }),
            h('Button', {
              props: Object.assign({}, this.buttonProps, {
                icon: 'ios-eye',
                size: 'small'
              }),
              attrs: {
                id: 'viewRuleButton'
              },
              style: {
                marginLeft: '8px'
              },
              on: {
                click: () => {
                  this.showAuthCard(data)
                }
              }
            })
          ])
        ]);
      },
      /*renderWithNoButton(h, {root, node, data}) {
        return <div
          style={[this.treeRowWrap]}>
          <icon type={"logo-tux"} style="margin-right:8px;"/>
          {data.displayName}&&
          {data.className}
        </div>;
      },*/
      // renderCardTitle(h, {root, node, data}) {
      //
      //   return <h3 style="display:inline-block">
      //     <icon type="logo-tux"/>
      //     {data.displayName}
      //   </h3>
      //
      // },
      getUserAndGroups() {
        AuthRules.getAllGroups().then(res => {
          this.groups = res.data;
          res.data.forEach((val, index) => {
            this.userNametoDisaplayName[val.name] = val.displayName;
          })
        });
        AuthRules.getAllUsers().then(res => {
          res.data.forEach((val, index) => {
            let eachU = {
              ...val,
              value: val.name,
              label: `${val.name}(${val.displayName})`
            };
            this.userNametoDisaplayName[val.name] = val.displayName;
            this.users.push(eachU);
            if(index < 100) {
              this.remoteUserArr.push(eachU);
              this.temRemoteUserArr.push(eachU);
            }
          });
          this.users = _.uniqBy(this.users, 'oid');
          this.remoteUserArr = _.uniqBy(this.remoteUserArr, 'oid');
          this.temRemoteUserArr = _.uniqBy(this.temRemoteUserArr, 'oid');
        });
      },
      removeRule(oid, index) {
        let _self = this;
        AuthRules.deleteRule(oid).then(res => {
          _self.usersPresent.splice(index, 1);
          _self.getUserAndGroups();
          _self.setAllRules();
          _self.$Message.success("删除成功");
        });
        // .catch(err => _self.$Message.info('网络错误'));
      },
      resetUserGroup(status) {
        if(status) {
          this.remoteUserArr = this.temRemoteUserArr;
        }
      },
      createRule() {
        let _self = this;
        let rule = [];
        rule = this.chosenUser.map(item => {
          return {
            "attrName": "",
            "authority": _self.chosenAuthItem.authority || _self.chosenAuthItem.className || `APP_${_self.chosenAuthItem.appName}`,
            "className": _self.chosenAuthItem.rootModuleName ||_self.chosenAuthItem.moduleName || _self.chosenAuthItem.className || `APP_${_self.chosenAuthItem.appName}`,
            "conditionId": "AlwaysTrue",
            "isInheritant": true,
            "level": 0,
            "note": "",
            "oid": "",
            "participant": item
          }
        });
        console.log(rule)
        if (rule && rule.length > 0) {
          AuthRules.createRules(rule).then(res => {
            if (res.data.length > 0) {
              _self.usersPresent.unshift(...res.data);
              this.addRuleModal = false;
              _self.getUserAndGroups();
              _self.setAllRules();
              _self.$Message.success("添加成功");
            } else {
              this.addRuleModal = false;
              _self.$Message.info("规则重复，未添加任何规则。");
            }
          }).catch(err => {
            // _self.$Message.error('网络错误');
            this.addRuleModal = false;
          });

        }
        else {
          this.addRuleModal = false;
          _self.$Message.info("未选择用户（组）");
        }
      }
    },
    computed: {
      ...mapGetters('authRules', ['getRulesByItem']),
      oidToGroup() {
        let res = {};
        for (let id in this.groups) {
          res[this.groups[id].name] = {...this.groups[id]};
        }
        return res;
      },
      filteredTreeData: {
        get() {
          let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
          let tempdata = [];
          for (let i =0; i < this.treeData.length; i ++) {
            let app = this.treeData[i];
            if (app['title'].toString().toLowerCase().match(keywordLower) !== null) tempdata.push(app);
            else {
              let appCopy = {
                ...app,
                children: []
              };
              for (let j = 0;  app.children && j <  app.children.length; j++) {
                let module = app.children[j];
                if (module['displayName'].toString().toLowerCase().match(keywordLower) !== null) appCopy.children.push(module);
                else {
                  let moduleCopy = {
                    ...module,
                    children: []
                  };
                  for (let k =0;module.children&& k < module.children.length; k ++) {
                    let opr1 = module.children[k];
                    if (opr1['displayName'].toString().toLowerCase().match(keywordLower) !== null) moduleCopy.children.push(opr1);
                    else {
                      let oprCopy = {
                        ...opr1,
                        children: []
                      };
                      for (let l = 0; opr1.children&&l< opr1.children.length; l ++) {
                        let opr2 = opr1.children[l];
                        if (opr2['displayName'].toString().toLowerCase().match(keywordLower) !== null) oprCopy.children.push(opr2);
                      }
                      if (oprCopy.children.length > 0) moduleCopy.children.push(oprCopy);
                    }
                  }
                  if (moduleCopy.children.length > 0) appCopy.children.push(moduleCopy);
                }
              }
              if (appCopy.children.length > 0) tempdata.push(appCopy);
            }
          }
          return tempdata
        },
        set() {
        }
        
      }
    }
  }
</script>

<style scoped>
  .mylayout {
    width: 100%;
    padding: 0 20px;
    background: #fff;
    min-height: 600px;
    margin: 0 auto;
  }
  .info-wrap {
    position: fixed;
    z-index: 1;
    right: 30px;
    top: 80px;
    display: inline-block;
    width: 40%;
    max-width: 600px;
    min-width: 266px;
    min-height: 300px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 1px 6px #ccc;
    background: #fff;
    padding: 0;
    /* height: 690px;
    overflow-y: auto; */
  }
  .tree-wrap {
    position: relative;
    z-index: 2;
    display: inline-block;
    max-width: 600px;
    min-width: 266px;
    width: 40%;
    padding: 4px;
    margin-top: 16px;
    border: 1px solid #ccc;
    box-shadow: 0 1px 6px #ccc;
    border-radius: 4px;
    background: #fff;
    /* height: 690px; */
    /* overflow-y: auto; */
  }
  @media screen and (max-width: 1400px) {
    .tree-wrap {
      /* height: 420px; */
    }
    .info-wrap{
      /* height: 420px; */
    }
  }
  @media screen and (min-width: 1401px) and (max-width: 1699px) {
    .tree-wrap {
      /* height: 550px; */
    }
    .info-wrap{
      /* height: 550px; */
    }
  }
  .tree-wrap:hover, .info-wrap:hover {
    box-shadow: 0 1px 6px #aaa;
  }
  .tree-row-wrap {
    display: inline-block;
    width: 85%;
    padding: 4px 0;
    border-bottom: 1px solid #ddd;
    line-height: 32px;
    margin: -4px 0
  }
  label {
    font-size: 15px !important;
    font-weight: 600;
    margin-left: 4px;
  }
  .auth-card-enter-active, .auth-card-leave-active {
    transition: all .5s ease;
  }
  .auth-card-enter, .auth-card-leave-to {
    transform: translateX(600px);
    opacity: 0;
  }
</style>
