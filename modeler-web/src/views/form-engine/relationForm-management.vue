<template>

  <div>

    <Modal
      v-model="previewModal"
      title="预览表单"
      width="1000px">
      <iframe :src="previewUrl" style="width: 100%;height:600px"></iframe>
    </Modal>

    <Modal
      v-model="clipboardModal"
      title="超链接"
      width="800px">
      <p slot="header" style="text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>超链接</span>
      </p>
      <a :href="previewUrl" target="_blank">{{ n_previewUrl }}</a>
      <div slot="footer">
        <Button type="primary" v-clipboard:copy="previewUrl" v-clipboard:success="onCopy"
                v-clipboard:error="onCopyError">复制
        </Button>

      </div>
    </Modal>

    <Modal
      v-model="deleteModal"
      title="删除表单"
      @on-ok="handleDeleteView"
      id="relationViewDeleteModal"
    >
      <p>
        确认删除
        <label style="font-weight: bold;color: #ed3f14">{{deleteClassName}}</label>
        类的
        <label style="font-weight: bold;color: #ed3f14">{{deleteViewName}}</label>
        表单吗？
      </p>

    </Modal>


    <Modal
      v-model="createModal"
      title="创建表单"
      id="createFormModal"
      width="1000px"
      height="500px"
      :mask-closable="false"
    >

      <Row>
        <Col span="8">
          <Row class="deviceBtn-wrap">
            <Col v-for="(item, index) in deviceTypeList" span="12" @click.native="actDev(index)" class="deviceBtn" :style="{'background': actDevice == index ? '#2D8CF0' : '#eee', 'color': actDevice == index ? '#fff' : '#666'}">
              <span>{{ item }}</span>
            </Col>
          </Row>
          <!-- <div style="display: flex;background: #EEEEEE;border-radius:4px 0px 0px 4px;width: 300px;margin-bottom: 20px;height: 30px;line-height: 30px;">
            <div :class="{'active': deviceType == item.type}" style="width: 50%;text-align: center;" v-for="item in deviceList" @click="chooseDeviceType(item)">{{item.name}}</div>
          </div> -->
          <label>关联类</label><br>
          <!-- <Select v-model="createForm.chosenClass" filterable style="width:300px" @on-change="handleClassChange">
            <Option v-for="item in formData" :value="item.className" :label="item.className" :key="item.id">
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.className }}</span>
            </Option>
          </Select> -->
          <Input v-model="createForm.chosenClass" disabled style="width: 300px"/>
          <br>
          <br>
          <Form :model="createForm" :rules="rowValidate" ref="createForm">
            <FormItem prop="viewName" label="表单名(英文名)">
              <br>
              <Input :disabled="viewDisabled" placeholder="表单名" style="width: 300px" v-model="createForm.viewName" id="relationFormCreateViewName"/>
            </FormItem>

            <FormItem prop="viewDisplayName" label="显示名(中文名)">
              <br>
              <Input placeholder="显示名" style="width: 300px" v-model="createForm.viewDisplayName" id="relationFormCreateViewDisplayName"/>
            </FormItem>

            <FormItem prop="note" label="备注">
              <br>
              <Input v-model="createForm.note" type="textarea" placeholder="Enter something..."
                     id="relationFormCreateNote"
                     style="width: 300px"></Input>
            </FormItem>

          </Form>
          <!-- <Checkbox v-model="hasRelatedClass" @on-change="handleRelatedClass">关联类</Checkbox>
          <br>
          <br>
          <div v-show="hasRelatedClass">
            <label>选择关联类</label>
            <Select v-model="chosenRelatedClass" filterable style="width: 300px">
              <Option v-for="item in relatedClasses" :value="item.className" :label="item.className" :key="item.oid">
                <span>{{ item.displayName }}</span>
                <span style="float:right;color:#ccc">{{ item.className }}</span>
              </Option>
            </Select>
          </div>
          <br> -->


        </Col>
        <Col span="16">
          <div style="height: 400px;width: 100%;overflow-y: auto;border-radius: 4px;border: 1px solid #E0E0E0;">
            <Row type="flex" id="innerIconWrapperTable" style="padding: 20px 20px 0;">
              <div v-for="(view, i) in templateList" @click="createFormBaseMould(view)"  class="template-list" :class="{'margin': i % 3 == 1}" style="width: 31%; text-align: center;margin-bottom: 20px;">
                <img :src="view.icon" :class="{'border': templateViewData.templateName == view.templateName}" style="width: 100%;margin-bottom: 5px;"/>
                {{view.displayName}}
              </div>
              <!-- <InnerIconWrapper v-for="view in chosenViews"
                                :target-id="view.oid"
                                :class-name="createForm.chosenClass"
                                :form-type="createForm.chosenType"
                                :title="view.viewName"
                                style="width: 50%"
                                :displayName="view.displayName || '--'"
                                :createTime="getdate(view.createTime || '')"
                                :lastModifyTime="getdate(view.lastModifyTime || '')"
                                :note="view.note"
                                :classType="'relation'"
                                :has-click-menu="false"
                                :has-hover="false"
                                :chosen="chosenViewId===view.oid"
                                @changeChosenView="changeChosenView"/>

              <InnerIconWrapper target-id="0"
                                :class-name="createForm.chosenClass"
                                :form-type="createForm.chosenType"
                                :has-click-menu="false"
                                :has-hover="false"
                                :title="'createForms'"
                                :displayName="''"
                                :classType="'relation'"
                                style="width: 50%"
                                :chosen="chosenViewId==='0'"
                                @changeChosenView="changeChosenView"/> -->
            </Row>
          </div>
        </Col>
      </Row>
      <div slot="footer">
        <Button type="text" size="large" @click="createModal=false">取消</Button>
        <Button type="primary" size="large"
                id="confirmCreateFormModal"
                @click="goToFormCreate('create',createForm.chosenClass,chosenViewId,createForm.viewName,createForm.viewDisplayName,createForm.note,createForm.chosenType,'relation')">
          确认
        </Button>
      </div>
    </Modal>
    <div style="width: calc(100% - 20px);margin: 20px auto">
      <!--搜索框 start-->
      <Input v-model="searchKey" icon="md-search" placeholder="输入关键词查询" style="width: 200px;float: right;" id="relationFormSearchInput"></Input>
      <!-- <Button shape="circle" icon="md-refresh" style="float: right;" @click="initData"></Button> -->
      <!--搜索框 end-->
      <br>
      <br>
      <div>
        <Table
          ref="viewTable"
          id="formTable"
          :columns="columns"
          :data="pagedData"
          @model-open="handlePreviewModal"
          :size="'small'"
          border
          @on-sort-change="handleSortChange"
          :height="tableHeight"
          @on-expand="getViewsByClass"
        >

        </Table>
        <Spin fix v-if="tableSpin"></Spin>
      </div>
      <div style="margin-top: 10px; float: right;">
        <Page
          size="small"
          show-sizer
          show-elevator
          show-total
          placement="top"
          :page-size-opts="pageSizeOpts"
          :pageSize="pageSize"
          :total="searchData.length"
          :current="pageIndex"
          @on-change="changePage"
          @on-page-size-change="changePageSize"></Page>
      </div>
    </div>
  </div>

</template>
<script>
  import {templateHandle} from "./template/templateHandle"
  import {tableMixin} from "@/component/tableMixin"
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import {deleteView, getAllRelations, getRelationNameF, getViews } from '../../api/others'
  import FormEngine from "@/component/form_engine.vue";
  import FormTableExpand from "./components/form-table-expand";
  import InnerIconWrapper from "./components/inner-icon-wrapper";

  export default {
    name: "form-management",
    components: {FormTableExpand, InnerIconWrapper, FormEngine},
    props: ["store", "router", "root"],
    mixins: [tableMixin, templateHandle],
    data() {
      return {
        innerWidth: '31.5%',
        previewUrl: "",
        n_previewUrl: "",
        clipboardModal: false,
        previewModal: false,
        createModal: false,
        deleteModal: false,
        tableSpin: false,
        columnsWidth: 274,

        actDevice: 0,
        deviceTypeList:['PC端', '移动端'],

        deleteClassName: "",
        deleteViewId: "",
        deleteViewName: "",

        searchKey: null,
        formData: [],
        jsonCode: "",

        // userMapList: [],
        chosenViews: [],
        pcViews: [],
        mobileViews: [],
        chosenRelatedClass: null,
        relatedClasses: [],
        normalizedClass: {},
        hasRelatedClass: false,
        chosenViewId: "0",
        viewDisabled: false,

        createForm: {
          chosenClass: null,
          chosenType: 'PC',
          viewName: null,
          viewDisplayName: null,
          note: null,
        },
        rowValidate: {
          viewName: [
            {required: true, message: "表单名不能为空", trigger: "blur"},
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/,
              message: "表单名只能包含英文字母,数字和下划线,开头必须是英文字母,长度不能超过32个字符",
              trigger: "change"
            },
            { pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/, message: "表单名只能包含英文字母,数字和下划线,开头必须是英文字母,长度不能超过32个字符", trigger: "blur" }
          ],
          viewDisplayName: [
            // {required: true, message: "属性显示名不能为空", trigger: "blur"},
            {
              pattern: /^\S{1,32}$/,
              message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
              trigger: "change"
            }
          ],
          chosenClass: [
            {required: true, message: "必须选择一个关联类", trigger: "blur"}
          ],
          note: [
            {
              pattern: /^[\S\s]{1,500}$/,
              message: "长度不超过500个字符",
              trigger: "change"
            },
            { pattern: /^[\S\s]{1,500}$/, message: "长度不超过500个字符", trigger: "blur" }
          ]
        },

        pageIndex: 1,
        pageSize: 10,
        pageSizeOpts: [10, 25, 50, 100, 200, 500],

        viewMap: {},

        columns: [
          {
            type: 'index',
            title: '序号', align: 'center', width: 66
          },
          {title: "英文名", key: "className", sortable: true},
          {title: "显示名", key: "displayName", sortable: true},
          {title: "前缀", key: "zoneName"},
          {
            title: "创建",
            width: 80,

            render: (h, params) => {
              return (
                <div
                  onClick={this.onCreateModal.bind(this, params.row)}
                  style={"cursor:pointer;font-weight:bold;text-align:center;font-size:18px !important;line-height:30px"}
                >+</div>
              )

            }
          },
          {
            type: "expand",
            width: 80,
            title: "查看",
            render: (h, params) => {

              return (
                <row gutter={16} type="flex" justify="start">
                  {
                    params.row.views.map((view, index) => {
                      return <InnerIconWrapper
                        target-id={view.oid}
                        form-type={view.formType || 'PC'}
                        hasClickMenu={true}
                        title={view.viewName}
                        displayName={view.displayName || '--'}
                        createTime={this.getdate(view.createTime || '')}
                        lastModifyTime={this.getdate(view.lastModifyTime || '')}
                        note={view.note}
                        classType='relation'
                        style={[{"width": this.innerWidth, "margin": '5px 1.8% 10px 0', "background" : '#fff', "border": '1px solid #e0e0e0'}]}
                        deviceType={this.deviceType}
                        class-name={view.className}
                        json-code={view.v3Content || ''}
                        onGoToFormCreate={this.goToNewFormCreate}
                        onHandlePreviewModal={this.handlePreviewModal}
                        onDeleteView={this.modalDeleteView}
                        onClipboardModal={this.copyUrlModal}
                      />
                    })
                  }

                </row>)


            }
          }
        ]
      }
    },
    watch: {
      searchKey(val) {
        this.pageIndex = 1;
      },
      formFinish(val) {
        if(val) {
          this.initData()
          this.formFinish = false
        }
      }
    },
    computed: {
      /*
      * todo::0921搜索bug
      * 这里其实是参照官方样例实现的，但是渲染不出来
      * */
      ...mapGetters("DWF_form", [
        "RelationForm"
      ]),

      searchData() {
        // let sk = this.searchKey && this.searchKey.toLowerCase();
        let sk = '';
        if(this.searchKey) {
          sk = this.searchKey.toLowerCase().trimStart().trimEnd();
        }
        let data = this.formData;
        let newData = [];
        if (sk) {
          data.forEach(function (obj) {
            if (String(obj['className']).toLowerCase().indexOf(sk) > -1 || String(obj['className']).toLowerCase().indexOf(sk) > -1 || String(obj['displayName']).toLowerCase().indexOf(sk) > -1 || String(obj['displayName']).toLowerCase().indexOf(sk) > -1 || String(obj['zoneName']).toLowerCase().indexOf(sk) > -1) {
              newData.push(obj);
            }
          });
          data = newData;
        }
        return data;

      },
      pagedData() {
        let k = this.searchData.slice((this.pageIndex - 1) * this.pageSize, this.pageIndex * this.pageSize);
        return k;
      },
      // tableHeight() {
      //   return this.pagedData.length * 40 + 165;
      // },
    }
    ,
    methods: {
      ...mapActions("DWF_form", {
        HandleQueryForm: "handleQueryForm",
        DeleteView: "deleteFView"
      }),

      ...mapMutations(["addRoute"]),

      activate() {
        this.resetColumnsWidth();
      },
      globalRefresh() {
        this.pageIndex = 1;
        this.initData();
      },
      resetColumnsWidth() {

        let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
        let finalWidth = parseInt(sideWidth) + 256;
        this.columnsWidth = (document.body.clientWidth - finalWidth) / 3;
        console.log(this.columnsWidth)

        this.columns = [
          {
            type: 'index',
            title: '序号', align: 'center', width: 66
          },
          {title: "英文名", key: "className", minWidth: this.columnsWidth, sortable: true},
          {title: "显示名", key: "displayName", minWidth: this.columnsWidth, sortable: true},
          {title: "前缀", key: "zoneName", minWidth: this.columnsWidth},
          {
            title: "创建",
            width: 80,

            render: (h, params) => {
              return (
                <div
                  id={`createFormButton${params.index}`}
                  onClick={this.onCreateModal.bind(this, params.row)}
                  style={"cursor:pointer;font-weight:bold;text-align:center;font-size:18px !important;line-height:30px"}
                >+</div>
              )

            }
          },
          {
            type: "expand",
            width: 80,
            title: "查看",
            render: (h, params) => {

              return (
                <row gutter={16} type="flex" justify="start">
                  {
                    params.row.views.map((view, index) => {
                      return <InnerIconWrapper
                        target-id={view.oid}
                        form-type={view.formType || 'PC'}
                        hasClickMenu={true}
                        title={view.viewName}
                        displayName={view.displayName || '--'}
                        createTime={this.getdate(view.createTime || '')}
                        lastModifyTime={this.getdate(view.lastModifyTime || '')}
                        note={view.note}
                        classType='relation'
                        style={[{"width": this.innerWidth, "margin": '5px 1.8% 10px 0', "background" : '#fff', "border": '1px solid #e0e0e0'}]}
                        deviceType={this.deviceType}
                        class-name={view.className}
                        json-code={view.v3Content || ''}
                        onGoToFormCreate={this.goToNewFormCreate}
                        onHandlePreviewModal={this.handlePreviewModal}
                        onDeleteView={this.modalDeleteView}
                        onClipboardModal={this.copyUrlModal}
                      />
                    })
                  }

                </row>)


            }
          }
        ]

      },
      actDev(ind) {

        this.actDevice = ind;
        this.chooseDeviceType(ind);
        this.chosenViews = [];

        if(ind == 0) {
          this.createForm.chosenType = 'PC';
          this.chosenViews = this.pcViews;
        } else {
          this.createForm.chosenType = 'Mobile';
          this.chosenViews = this.mobileViews;
        }

        this.changeChosenView('0', '', '', '', this.createForm.chosenType);

      },
      onCopy() {
        this.clipboardModal = false;
        this.$Message.info("复制成功");
      },
      onCopyError() {
        this.clipboardModal = false;
      },
      copyUrlModal(url) {
        console.log("cpy");
        this.previewUrl = url;
        this.n_previewUrl = url.split("?")[0] + "?...";
        this.clipboardModal = true;
      },

      //timestep 转为时间
      getdate(ts) {
        if(ts == '') return '--';
        var now = new Date(ts),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate();
        return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
      },

      // userID 转为name
      // getUserName(uid) {
      //   if(uid == '') return '--';
      //   let finalName = '';
      //   let userIndex = this.userMapList.filter(val => {
      //     return val.creator == uid;
      //   })
      //   finalName = userIndex.length > 0 ? userIndex[0].displayName : '--';
      //   return finalName;
      // },

      handleSortChange(params) {

        if (params.order === 'asc') {
          this.searchData.sort(function (a, b) {
            return a[params.key] < b[params.key] ? -1 : 1;
          });
        }
        else if (params.order === 'desc') {
          this.searchData.sort(function (a, b) {

            return a[params.key] < b[params.key] ? 1 : -1;
          });
        }
        else if (params.order === 'normal') {
          // 啥也不做
        }
      },
      changePage(pageId) {
        this.pageIndex = pageId;
      },
      changePageSize(pageSize) {
        this.pageSize = pageSize;
      },
      async getViewsByClass(row, status) {
        let _self = this;
        let target = _self.formData.find(clazz => {
          return clazz.className === row.className;
        });
        let index = this.formData.indexOf(this.formData.filter(item => item.id === row.id)[0]);
        console.log(status + "" + "Expand", target, index);
        if (status == null) {
          if (target.views.length < 1) {
            await getViews(row.className, {needV3Content: false}).then(res => {
              if (res.data.data) {
                target.views = [];
                // let vmap = {};
                res.data.data.forEach(x => {
                  // if (x.viewName in vmap) return;
                  // vmap[x.viewName] = 1;
                  target.views.push(x);
                });
              }
            })
            return target.views;
          }
        } else if (status) {
          if (target.views.length < 1) {
            await getViews(row.className, {needV3Content: false}).then(res => {
              if (res.data.data) {
                target.views = [];
                // let vmap = {};
                res.data.data.forEach(x => {
                  // if (x.viewName in vmap) return;
                  // vmap[x.viewName] = 1;
                  target.views.push(x);
                });
              }
              this.formData[index]._expanded = true;
            });
          }
        } else {
          this.formData[index]._expanded = false;
        }
      },
      goToNewFormCreate(flag, className, viewName, displayName, note, type) {
        this.root.goToNewFormCreate(flag, className, viewName, '', '', displayName, note, type, 'relation');
      },

      goToFormCreate(operation, className, formOid, formName, formDisplayName, formNote, formType) {
        this.$refs['createForm'].validate(async valid => {
          if (valid) {
            this.createModal = false;
            // let flag = false;
            // if (operation == 'create') {
            //   flag = this.chosenViews.findIndex(x => x.viewName.trim() == formName.trim()) == -1;
            // }
            // this.goToNewFormCreate(flag, className, formName, formDisplayName, formNote);
            let a = document.createElement('a');
            let targetClass = className;
            let viewName = formName;
            await this.handleTemplate(targetClass, viewName, formDisplayName || '', true, '', formNote || '', formType || 'PC')
            let url = `${Config.protocol}//${Config.host}/${Config.baseRouteName}/forms/${targetClass}/${viewName}?token=${this.$store.state.user.token}&formType=${formType || 'PC'}&classType=relation&displayName=${formDisplayName || ''}&note=${formNote || ''}&createForm=true`;
            a.href = url;
            a.target="_blank";
            a.click();
            // this.router.replace({name: "form-create", params: {operation, className, formOid, formName, formDisplayName}})
          } else {
            this.$Message.error('请输入正确的信息');
          }
        })
      }
      ,
      // handleClassChange() {

      //   let _self = this;

      //   this.hasRelatedClass = false;

      //   getViews(_self.createForm.chosenClass).then(res => {
      //     _self.chosenViews = res.data.data
      //   });
      //   this.changeChosenView(null, null);
      // }
      // ,
      // handleRelatedClass() {
      //   if (this.hasRelatedClass) {
      //     let _self = this;
      //     getRelationNameF(this.createForm.chosenClass).then(res => {
      //       _self.relatedClasses = res.data.data;
      //       console.log(res.data.data)
      //     })
      //   }
      // }
      // ,
      // async handlePreviewModal(className, formName) {
      //   await this.HandleQueryForm({
      //     targetClass: className,
      //     formName: formName
      //   });
      //   const jsonData = this.EntityForm(className, formName);
      //   this.$refs.preview.createFormBase(jsonData);
      //   this.previewModal = true;

      // }
      // ,
      handlePreviewModal(url) {
        this.previewUrl = url;
        this.previewModal = true;
      },
      handleCreateModal(className, views) {
        this.viewDisabled = false;
        this.createForm.note = '';
        this.actDevice = 0;
        this.createForm.chosenType = 'PC';
        this.$refs['createForm'].resetFields();
        this.createModal = true;
        this.chosenViews = views;
        this.createForm.chosenClass = className;
      },
      async onCreateModal(row) {

        this.pcViews = [];
        this.mobileViews = [];
        this.chooseDeviceType(0);

        let views = row.views;
        if (views.length < 1) views = await this.getViewsByClass(row, null);
        views.forEach(v => {

          if(!('formType' in v) || v.formType == 'PC') {
            this.pcViews.push(v)
          }
          if('formType' in v && v.formType == 'Mobile') {
            this.mobileViews.push(v)
          }

        })
        this.createForm.chosenType = 'PC';
        this.actDevice = 0;

        this.handleCreateModal(row.className, this.pcViews);
        this.currentItem = row
      },

      modalDeleteView(obj) {

        this.deleteClassName = obj.className;
        this.deleteViewName = obj.viewName;
        this.deleteViewId = obj.viewId;

        this.deleteModal = true;

      }
      ,
      async handleDeleteView() {
        // await this.DeleteView({
        //   oid: this.deleteViewId,
        //   className: this.deleteClassName,
        //   viewName: this.deleteViewName
        // })
        // for (var i = 0; i < this.formData.length; i++) {
        //   if (this.formData[i].className == this.deleteClassName) {
        //     var idx = -1;
        //     for (var j = 0; j < this.formData[i].views.length; j++) {
        //       if (this.formData[i].views[j].oid == this.deleteViewId) {
        //         idx = j;
        //         break;
        //       }
        //     }
        //     if (idx > -1) this.formData[i].views.splice(idx, 1);
        //     break;
        //   }
        // }
        // this.$Message.info("删除表单成功");
        deleteView(this.deleteViewId).then(res => {
          if(!res.success) {
            this.$Message.error(res.message);
          } else {
            this.$Message.success('删除成功');
            this.initData();
          }
        })
      },

      initData() {
        this.tableSpin = true;

        const _self = this;

        //0.lazy load
        /* getAllEntities({"needOperationCount": false}).then((res) => {
           let entities = res.data.data;
           _self.formData = entities.map(entity => {
             entity.views = [];
             return entity;
           })
         });*/

        // 1.promise all with nomalizr
        getAllRelations({"needOperationCount": false}).then((res) => {
          let entities = res.data.data;
          for (let i in entities) {
            let entity = entities[i];
            entity.views = [];
          }
          _self.formData = entities;
          this.tableSpin = false;

          /* const view = new schema.Entity('views', undefined, {idAttribute: 'oid'});
                      const classInfo = new schema.Entity('classes', {views: [view]}, {idAttribute: 'className'});

                      const mySchema = [classInfo]

                      _self.normalizedClass = normalize(_self.formData, mySchema);*/

        })


        // 2.Async/Await
        /*getAllEntities({"needOperationCount": false}).then(async (res) => {
          let entities = res.data.data;

          for (let i in entities) {
            let entity = entities[i];
            let className = 'ItemClass';
            await getViews(className).then(res => {
              entity.views = res.data.data;
            })
          }
          _self.formData = entities;

        })*/


      }
      ,
      changeChosenView(id, name, displayName, note, formType) {
        if (id != "0") {
          this.createForm.viewName = name;
          this.createForm.viewDisplayName = displayName;
          this.createForm.note = note;
          this.createForm.chosenType = formType;
          this.viewDisabled = true;
        } else {
          this.viewDisabled = false;
          if (this.chosenViewId != id) {
            this.createForm.viewName = "";
            this.createForm.viewDisplayName = '';
            this.createForm.note = '';
            this.createForm.chosenType = formType;
          }
        }
        this.chosenViewId = id;
      }
    }
    ,
    beforeCreate() {


    }
    ,
    created() {
      this.resetColumnsWidth();
      if(document.body.clientWidth > 1330) {
        this.innerWidth = '23%'
      } else {
        this.innerWidth = '31.5%'
      }
      //console.log(this.$options.components);
      this.$store = this.store;
      // getAllUsers()
      //   .then(response => {

      //     let res = response.data;
      //     if (res.code == 200) {
      //       this.userMapList = res.data;
      //     } else {
      //       const title = "提示";
      //       const content = res.message;
      //       this.$Modal.warning({
      //         title: title,
      //         content: content
      //       });
      //     }
      //   })
      //   .catch(e => {
      //     this.$Spin.hide();
      //     console.log(e);
      //   });
    }
    ,
    mounted() {
      this.initData();
      //this.$options.components.extPanel = Vue.extend(require('./components/ext-panel').default);

    }
  }

</script>
<style scoped>

  /*这是iview card控件渲染完成后的class*/
  .ivu-card:before {
    content: '';
    display: block;
    margin-top: 15px;
  }
  .border {
    border: 2px solid #2d8cf0;
    border-radius: 8px;
  }
  .margin{
    margin: 0 15px;
  }
  .active{
    background: #2D8CF0;
    color: #fff;
  }

  .deviceBtn-wrap {
    width: 300px;
    border-radius: 4px;
    margin-bottom: 15px;
    overflow: hidden;
    cursor: pointer;
  }
  .deviceBtn {
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #666;
    background: #eee;
  }

</style>

<style>

  /*
   * todo::响应式解决办法
   * iView里面有没有类似于bootstrap中 class=container 那种响应式的解决办法
   * 不然拖动窗口大小时会造成元素跟着比例缩小
   *
   *  ！！！这里其实是污染全局的做法！！！
   */

  /*在超出范围的时候 加一个滚动显示*/
  .main.ivu-layout.ivu-layout-has-sider .ivu-layout {

    overflow: hidden;

  }

  td.ivu-table-expanded-cell {
    padding: 0 15px !important;
  }

  /*设定显示区最小宽度，不至于太丑*/
  .main.ivu-layout.ivu-layout-has-sider .ivu-layout .ivu-layout-content {
    width: 100%;
    min-width: 1000px;
  }

</style>
