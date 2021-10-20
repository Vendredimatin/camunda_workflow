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
      width="1000px"
      height="500px"
      :mask-closable="false"
    >

      <Row>
        <Col span="8">

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
              <Input :disabled="viewDisabled" placeholder="表单名" style="width: 300px" v-model="createForm.viewName"/>
            </FormItem>

            <FormItem prop="viewDisplayName" label="显示名(中文名)">
              <br>
              <Input placeholder="显示名" style="width: 300px" v-model="createForm.viewDisplayName"/>
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

          <label>备注</label><br>
          <Input v-model="createForm.remark" type="textarea" placeholder="Enter something..."
                 style="width: 300px"></Input>

        </Col>
        <Col span="16">
          <div style="height: 400px;width: 100%;background-color: #EEE;overflow-y: scroll">
            <Row type="flex">
              <InnerIconWrapper v-for="view in chosenViews"
                                :target-id="view.oid"
                                :class-name="createForm.chosenClass"
                                :title="view.viewName" :span="4"
                                :displayName="view.displayName"
                                :has-click-menu="false"
                                :has-hover="false"
                                :img-url="icon1"
                                :chosen="chosenViewId===view.oid"
                                @changeChosenView="changeChosenView"/>

              <InnerIconWrapper target-id="0"
                                :class-name="createForm.chosenClass"
                                :has-click-menu="false"
                                :has-hover="false"
                                :title="'创建表单'"
                                :displayName=null
                                :span="4"
                                :chosen="chosenViewId==='0'"
                                :img-url="icon2"
                                @changeChosenView="changeChosenView"/>
            </Row>
          </div>
        </Col>
      </Row>
      <div slot="footer">
        <Button type="text" size="large" @click="createModal=false">取消</Button>
        <Button type="primary" size="large"
                @click="goToFormCreate('create',createForm.chosenClass,chosenViewId,createForm.viewName,createForm.viewDisplayName)">
          确认
        </Button>
      </div>
    </Modal>
    <div style="width: calc(100% - 20px);margin: 20px auto">
      <!--搜索框 start-->
      <Input v-model="searchKey" icon="md-search" placeholder="搜索" style="width: 300px"></Input>
      <Button shape="circle" icon="md-refresh" style="float: right;" @click="initData"></Button>
      <!--搜索框 end-->
      <br>
      <br>
      <div>
        <Table
          ref="viewsTable"
          :columns="columns"
          :data="pagedData"
          @model-open="handlePreviewModal"
          :size="'small'"
          :border="true"
          @on-sort-change="handleSortChange"
          height="435"
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

  import {mapGetters, mapActions, mapMutations} from 'vuex';
//   import {deleteView, getAllEntities, getRelationNameF, getViews} from '../../api/others'
  import {deleteView, getAllRelations, getRelationNameF, getViews} from '../../api/others'
  import FormEngine from "@/component/form_engine.vue";
  import FormTableExpand from "./components/form-table-expand";
  import InnerIconWrapper from "./components/inner-icon-wrapper";
  import formIcon1 from "../../assets/images/form-management/表单-1.png"
  import formIcon2 from "../../assets/images/form-management/表单-2.png"

  export default {
    name: "form-management",
    components: {FormTableExpand, InnerIconWrapper, FormEngine},
    props: ["store", "router", "root"],
    data() {
      return {
        previewUrl: "",
        n_previewUrl: "",
        clipboardModal: false,
        previewModal: false,
        createModal: false,
        deleteModal: false,
        tableSpin: false,


        deleteClassName: "",
        deleteViewId: "",
        deleteViewName: "",

        searchKey: null,
        formData: [],
        jsonCode: "",

        chosenViews: [],
        chosenRelatedClass: null,
        relatedClasses: [],
        normalizedClass: {},
        hasRelatedClass: false,
        chosenViewId: "0",
        viewDisabled: false,
        icon1: formIcon1,
        icon2: formIcon2,

        createForm: {
          chosenClass: null,
          viewName: null,
          viewDisplayName: null,
          remark: null,
        },
        rowValidate: {
          viewName: [
            {required: true, message: "表单名不能为空", trigger: "blur"},
            {
              pattern: /^[a-zA-Z0-9_]{1,32}$/,
              message: "表单名只能包含字母、数字或下划线，长度不超过32个字符",
              trigger: "change"
            },
            { pattern: /^[a-zA-Z_]/, message: "表单名首字母应为字母或下划线", trigger: "change" }
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
              /*return h('Icon', {
                props: {type: "plus"},
                style: {cursor: "pointer"},
                on: {
                  click: () => {
                    this.handleCreateModal(params.row.className, params.row.views)
                  }
                }
              })*/
              // jsx 渲染 iview自带控件 小写
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
                        hasClickMenu={true}
                        title={view.viewName}
                        span={2}
                        img-url={formIcon1}
                        class-name={view.className}
                        json-code={view.v3Content}
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
        let sk = this.searchKey && this.searchKey.toLowerCase();
        let data = this.formData;
        let newData = [];
        if (sk) {
          data.forEach(function (obj) {
            if (String(obj['className']).toLowerCase().indexOf(sk) > -1 || String(obj['className']).toLowerCase().indexOf(sk) > -1 || String(obj['displayName']).toLowerCase().indexOf(sk) > -1 || String(obj['displayName']).toLowerCase().indexOf(sk) > -1) {
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
      tableHeight() {
        return this.pagedData.length * 40 + 165;
      },
    }
    ,
    methods: {
      ...mapActions("DWF_form", {
        HandleQueryForm: "handleQueryForm",
        DeleteView: "deleteFView"
      }),

      ...mapMutations(["addRoute"]),

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
                let vmap = {};
                res.data.data.forEach(x => {
                  if (x.viewName in vmap) return;
                  vmap[x.viewName] = 1;
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
                let vmap = {};
                res.data.data.forEach(x => {
                  if (x.viewName in vmap) return;
                  vmap[x.viewName] = 1;
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
      goToNewFormCreate(flag, className, viewName) {
        this.root.goToNewFormCreate(flag, className, viewName);
      },

      goToFormCreate(operation, className, formOid, formName, formDisplayName) {
        console.log({operation, className, formOid, formDisplayName});
        this.$refs['createForm'].validate(valid => {
          if (valid) {
            this.createModal = false;
            let flag = false;
            if (operation == 'create') {
              flag = this.chosenViews.findIndex(x => x.viewName.trim() == formName.trim()) == -1;
            }
            this.goToNewFormCreate(flag, className, formName);
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
        console.log(className);
        this.createModal = true;
        this.chosenViews = views;
        this.createForm.chosenClass = className;
      },
      async onCreateModal(row) {
        let views = row.views;
        if (views.length < 1) views = await this.getViewsByClass(row, null);
        this.handleCreateModal(row.className, views);
      },

      modalDeleteView(obj) {
        console.log(obj);

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
      changeChosenView(id, name, displayName) {
        if (id != "0") {
          this.createForm.viewName = name;
          console.log(displayName)
          this.createForm.viewDisplayName = displayName;
          this.viewDisabled = true;
        } else {
          this.viewDisabled = false;
          if (this.chosenViewId != id) {
            this.createForm.viewName = "";
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
      //console.log(this.$options.components);
      this.$store = this.store;
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
