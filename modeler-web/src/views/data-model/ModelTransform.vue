<template>
  <div>
    <Tabs style="margin: 10px;" v-model="currentTabPane" @on-click="handleTabClick">
      <TabPane label="实体类" name="entities" :disabled="isTransforming">
        <Spin fix v-show="isTransforming">
          <Icon type="ios-loading" size=72 class="transform-spin"></Icon>
          <div style="font-size: 24px;">模型转换中，请稍等……</div>
        </Spin>
        <div style="float: left; margin-bottom: 10px">
          <Button type="primary" style="margin: 5px" @click="transformAllEntities">
            转换所有实体类
          </Button>
          <Button type="primary" style="margin: 5px" @click="transformCurrentClass" :disabled="currentClassName === ''">
            转换选中实体类
          </Button>
        </div>
        <div style="float: right; margin-bottom: 10px">
          <Input
            v-model="keyword"
            icon="md-search"
            placeholder="输入关键词查询"
            style="width: 200px; margin: 5px"
            @on-change="searchKeyword"
          >
          </Input>
        </div>
        <div style="clear: both; margin-top: 10px; margin-bottom: 10px">
          <Table ref="entityTable"
                 style="margin: 5px"
                 :loading="entityLoading"
                 stripe
                 show-header
                 highlight-row
                 size="small"
                 :data="entityPage"
                 :columns="entityColumns"
                 @on-row-click="selectRow"
          >
          </Table>
        </div>
        <div style="margin-top: 10px; margin-bottom: 10px; overflow: hidden">
          <div style="float: right; margin: 5px">
            <Page
              style="margin-bottom: 20px"
              size="small"
              show-sizer
              show-elevator
              show-total
              placement="top"
              :page-size-opts="pageSizeOpts"
              :pageSize="pageSize"
              :total="filteredData.length"
              :current="currentPage"
              @on-change="changePage"
              @on-page-size-change="changePageSize"></Page>
          </div>
        </div>
      </TabPane>
      <TabPane label="关联类" name="relations" :disabled="isTransforming">
        <Spin fix v-show="isTransforming">
          <Icon type="ios-loading" size=72 class="transform-spin"></Icon>
          <div style="font-size: 24px;">模型转换中，请稍等……</div>
        </Spin>
        <div style="float: left; margin-bottom: 10px">
          <Button type="primary" style="margin: 5px" @click="transformAllRelations">
            转换所有关联类
          </Button>
          <Button type="primary" style="margin: 5px" @click="transformCurrentClass" :disabled="currentClassName === ''">
            转换选中关联类
          </Button>
        </div>
        <div style="float: right; margin-bottom: 10px">
          <Input
            v-model="keyword"
            icon="md-search"
            placeholder="输入关键词查询"
            style="width: 200px; margin: 5px"
            @on-change="searchKeyword"
          >
          </Input>
        </div>
        <div style="clear: both; margin-top: 10px; margin-bottom: 10px">
          <Table ref="relationTable"
                 style="margin: 5px"
                 :loading="relationLoading"
                 stripe
                 show-header
                 highlight-row
                 size="small"
                 :data="relationPage"
                 :columns="relationColumns"
                 @on-row-click="selectRow"
          >
          </Table>
        </div>
        <div style="margin-top: 10px; margin-bottom: 10px; overflow: hidden">
          <div style="float: right; margin: 5px">
            <Page
              style="margin-bottom: 20px"
              size="small"
              show-sizer
              show-elevator
              show-total
              placement="top"
              :page-size-opts="pageSizeOpts"
              :pageSize="pageSize"
              :total="filteredData.length"
              :current="currentPage"
              @on-change="changePage"
              @on-page-size-change="changePageSize"></Page>
          </div>
        </div>
      </TabPane>
      <TabPane label="资源类" name="resources" :disabled="isTransforming">
        <Spin fix v-show="isTransforming">
          <Icon type="ios-loading" size=72 class="transform-spin"></Icon>
          <div style="font-size: 24px;">模型转换中，请稍等……</div>
        </Spin>
        <div style="float: left; margin-bottom: 10px">
          <Button type="primary" style="margin: 5px" @click="transformAllResources">
            转换所有资源类
          </Button>
          <Button type="primary" style="margin: 5px" @click="transformCurrentClass" :disabled="currentClassName === ''">
            转换选中资源类
          </Button>
        </div>
        <div style="float: right; margin-bottom: 10px">
          <Input
            v-model="keyword"
            icon="md-search"
            placeholder="输入关键词查询"
            style="width: 200px; margin: 5px"
            @on-change="searchKeyword"
          >
          </Input>
        </div>
        <div style="clear: both; margin-top: 10px; margin-bottom: 10px">
          <Table ref="resourceTable"
                 style="margin: 5px"
                 :loading="resourceLoading"
                 stripe
                 show-header
                 highlight-row
                 size="small"
                 :data="resourcePage"
                 :columns="resourceColumns"
                 @on-row-click="selectRow"
          >
          </Table>
        </div>
        <div style="margin-top: 10px; margin-bottom: 10px; overflow: hidden">
          <div style="float: right; margin: 5px">
            <Page
              style="margin-bottom: 20px"
              size="small"
              show-sizer
              show-elevator
              show-total
              placement="top"
              :page-size-opts="pageSizeOpts"
              :pageSize="pageSize"
              :total="filteredData.length"
              :current="currentPage"
              @on-change="changePage"
              @on-page-size-change="changePageSize"></Page>
          </div>
        </div>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import ModelTransform from "../../api/data-model/ModelTransform";

export default {
  name: "model-transform",
  data() {
    return {
      isTransforming: false,
      previousTabPane: "",
      currentTabPane: "entities",
      currentClassName: "",
      currentPage: 1,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      keyword: "",
      entityData: [],
      entityLoading: false,
      entityColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "英文名",
          key: "className",
          sortable: true,
          tooltip: true
        },
        {
          title: "显示名",
          key: "displayName",
          sortable: true,
          tooltip: true
        },
        {
          title: "数据库表前缀",
          key: "zoneName",
          sortable: true,
          tooltip: true
        },
        {
          title: "包路径",
          key: "packagePath",
          sortable: true,
          tooltip: true
        }
      ],
      relationData: [],
      relationLoading: false,
      relationColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "英文名",
          key: "className",
          sortable: true,
          tooltip: true
        },
        {
          title: "显示名",
          key: "displayName",
          sortable: true,
          tooltip: true
        },
        {
          title: "数据库表前缀",
          key: "zoneName",
          sortable: true,
          tooltip: true
        },
        {
          title: "包路径",
          key: "packagePath",
          sortable: true,
          tooltip: true
        },
        {
          title: "左类名",
          key: "leftClass",
          sortable: true,
          tooltip: true
        },
        {
          title: "左类角色",
          key: "leftRole",
          sortable: true,
          tooltip: true
        },
        {
          title: "右类名",
          key: "rightClass",
          sortable: true,
          tooltip: true
        },
        {
          title: "右类角色",
          key: "rightRole",
          sortable: true,
          tooltip: true
        }
      ],
      resourceData: [],
      resourceLoading: false,
      resourceColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "英文名",
          key: "className",
          sortable: true,
          tooltip: true
        },
        {
          title: "显示名",
          key: "displayName",
          sortable: true,
          tooltip: true
        },
        {
          title: "数据库表",
          key: "tableName",
          sortable: true,
          tooltip: true
        }
      ]
    };
  },
  computed: {
    filteredData() {
      let keywordLower = this.keyword.toLowerCase();
      let res = [];
      let allData = [];
      switch (this.currentTabPane) {
        case "entities":
          allData = this.entityData;
          break;
        case "relations":
          allData = this.relationData;
          break;
        default:
          allData = this.resourceData;
          break;
      }
      for (let id in allData) {
        let data = allData[id];
        for (let key in data) {
          if (
            data[key]
              .toString()
              .toLowerCase()
              .match(keywordLower) !== null
          ) {
            res.push(data);
            break;
          }
        }
      }
      return res;
    },
    entityPage() {
      return this.filteredData.slice(
        this.currentPage * this.pageSize - this.pageSize,
        this.currentPage * this.pageSize
      );
    },
    relationPage() {
      return this.relationData.slice(
        this.currentPage * this.pageSize - this.pageSize,
        this.currentPage * this.pageSize
      );
    },
    resourcePage() {
      return this.resourceData.slice(
        this.currentPage * this.pageSize - this.pageSize,
        this.currentPage * this.pageSize
      );
    }
  },
  created() {
    this.getAllEntities();
    this.getAllRelations();
    this.getAllResources();
  },
  methods: {
    getAllEntities() {
      this.currentClassName = "";
      this.entityLoading = true;
      ModelTransform.getAllEntities()
        .then(res => {
          this.entityLoading = false;
          this.entityData = res.data;
        })
        .catch(error => {
          this.entityLoading = false;
          this.$Message.error(error.response.data.message);
        });
    },
    getAllRelations() {
      this.currentClassName = "";
      this.relationLoading = true;
      ModelTransform.getAllRelations()
        .then(res => {
          this.relationLoading = false;
          this.relationData = res.data;
        })
        .catch(error => {
          this.relationLoading = false;
          this.$Message.error(error.response.data.message);
        });
    },
    getAllResources() {
      this.currentClassName = "";
      this.resourceLoading = true;
      ModelTransform.getAllResources()
        .then(res => {
          this.resourceLoading = false;
          this.resourceData = res.data;
        })
        .catch(error => {
          this.resourceLoading = false;
          this.$Message.error(error.response.data.message);
        });
    },
    transformAllEntities() {
      this.isTransforming = true;
      ModelTransform.transformAllEntities()
        .then(res => {
          this.isTransforming = false;
          this.$Modal.success({
            title: "转换成功",
            content: "成功转换所有实体类"
          });
        })
        .catch(error => {
          this.isTransforming = false;
          this.$Modal.error({
            title: "转换失败",
            content: `<p>转换所有实体类失败，详细错误信息：</p><p>${
              error.response.data.message
            }</p>`
          });
        });
    },
    transformAllRelations() {
      this.isTransforming = true;
      ModelTransform.transformAllRelations()
        .then(res => {
          this.isTransforming = false;
          this.$Modal.success({
            title: "转换成功",
            content: "成功转换所有关联类"
          });
        })
        .catch(error => {
          this.isTransforming = false;
          this.$Modal.error({
            title: "转换失败",
            content: `<p>转换所有关联类失败，详细错误信息：</p><p>${
              error.response.data.message
            }</p>`
          });
        });
    },
    transformAllResources() {
      this.isTransforming = true;
      ModelTransform.transformAllResources()
        .then(res => {
          this.isTransforming = false;
          this.$Modal.success({
            title: "转换成功",
            content: "成功转换所有资源类"
          });
        })
        .catch(error => {
          this.isTransforming = false;
          this.$Modal.error({
            title: "转换失败",
            content: `<p>转换所有资源类失败，详细错误信息：</p><p>${
              error.response.data.message
            }</p>`
          });
        });
    },
    transformCurrentClass() {
      this.isTransforming = true;
      let categoryDisplayName = "";
      if (this.currentTabPane === "entities") {
        categoryDisplayName = "实体类";
      } else if (this.currentTabPane === "relations") {
        categoryDisplayName = "关联类";
      } else if (this.currentTabPane === "resources") {
        categoryDisplayName = "资源类";
      }
      ModelTransform.transformMulti([this.currentClassName])
        .then(res => {
          this.isTransforming = false;
          this.$Modal.success({
            title: "转换成功",
            content: `成功转换${categoryDisplayName}：${this.currentClassName}`
          });
        })
        .catch(error => {
          this.isTransforming = false;
          this.$Modal.error({
            title: "转换失败",
            content: `<p>转换${categoryDisplayName}：${
              this.currentClassName
            }失败，详细错误信息：</p><p>${error.response.data.message}</p>`
          });
        });
    },
    changePage(pageId) {
      this.currentClassName = "";
      this.currentPage = pageId;
    },
    changePageSize(pageSize) {
      this.currentClassName = "";
      this.pageSize = pageSize;
    },
    selectRow(rowData) {
      this.currentClassName = rowData.className;
    },
    handleTabClick(name) {
      if (this.previousTabPane === "entities") {
        this.getAllEntities();
      } else if (this.previousTabPane === "relations") {
        this.getAllRelations();
      } else if (this.previousTabPane === "resources") {
        this.getAllResources();
      }
      this.previousTabPane = name;
      this.changePage(1);
      this.keyword = "";
      this.$refs.entityTable.clearCurrentRow();
      this.$refs.relationTable.clearCurrentRow();
      this.$refs.resourceTable.clearCurrentRow();
    },
    searchKeyword() {
      this.currentClassName = "";
    }
  }
};
</script>

<style scoped>
.transform-spin {
  animation: ani-demo-spin 1s linear infinite;
}
</style>
