<style lang="less">
@import "./editable-table.less";
</style>

<template>
    <div>
      <Table height="435" size="small" :ref="refs" :columns="columnsList" :data="thisTableCurrentPageData" border disabled-hover></Table>
      <div style="margin: 10px; overflow: hidden">
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
                  :total="total"
                  :current="currentPage"
                  @on-change="changePage"
                  @on-page-size-change="changePageSize"></Page>
        </div>
      </div>
    </div>
</template>

<script>
import { delUser } from "@/api/others";
import _ from "lodash";
const editButton = (vm, h, currentRow, index) => {
  return h(
    "Button",
    {
      props: {
        type: currentRow.editting ? "success" : "primary",
        loading: currentRow.saving
      },
      style: {
        margin: "0 5px"
      },
      on: {
        click: () => {
          let target;
          if (!currentRow.editting) {
            let edittingRow = vm.edittingStore[index];
            sessionStorage.setItem("uEname", edittingRow.eName.split(' ').join(''));
            sessionStorage.setItem("uCname", edittingRow.cName.split(' ').join(''));
            sessionStorage.setItem("uEmail", edittingRow.email.split(' ').join(''));
            sessionStorage.setItem("uPwd", edittingRow.password.split(' ').join(''));
            sessionStorage.setItem("uNote", edittingRow.note);
            if (currentRow.edittingCell) {
              for (let name in currentRow.edittingCell) {
                currentRow.edittingCell[name] = false;
                vm.edittingStore[index].edittingCell[name] = false;
              }
            }
            vm.edittingStore[index].editting = true;
            // vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
            target = vm.freshData(vm.edittingStore, index);
          } else {
            vm.edittingStore[index].saving = true;
            // vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
            target = vm.freshData(vm.edittingStore, index);
            let edittingRow = vm.edittingStore[index];
            edittingRow.editting = false;
            edittingRow.saving = false;
            // vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
            target = vm.freshData(vm.edittingStore, index);
            vm.$emit("input", vm.handleBackdata(vm.thisTableData));
            vm.$emit("on-change", vm.handleBackdata(vm.thisTableData), target);
          }
        }
      }
    },
    currentRow.editting ? "保存" : "编辑"
  );
};
const deleteButton = (vm, h, currentRow, index) => {
  return h(
    "Poptip",
    {
      props: {
        confirm: true,
        title: "您确定要删除这条数据吗?",
        transfer: true
      },
      on: {
        "on-ok": () => {
          // let delUid = vm.thisTableData[index].oid;
          let delUid = vm.thisTableCurrentPageData[index].oid;

          delUser(delUid).then(res => {
              if (res.success) {
                vm.thisTableCurrentPageData.splice(index, 1);
                let target = vm.thisTableData.findIndex(item => item.oid === delUid);
                vm.thisTableData.splice(target, 1);
                vm.$emit("input", vm.handleBackdata(vm.thisTableData));
                vm.$emit(
                  "on-delete",
                  vm.handleBackdata(vm.thisTableData),
                  // index
                  target
                );
                vm.$Message.success("删除成功");
              } else {
                vm.$Message.error("服务器异常, 请稍后再试");
              }
            })
            .catch(e => {
              console.log(e);
            });
        }
      }
    },
    [
      h(
        "Button",
        {
          style: {
            margin: "0 5px"
          },
          props: {
            type: "error",
            placement: "top"
          }
        },
        "删除"
      )
    ]
  );
};
const incellEditBtn = (vm, h, param) => {
  if (vm.hoverShow) {
    return h(
      "div",
      {
        class: {
          "show-edit-btn": vm.hoverShow
        }
      },
      [
        h("Button", {
          props: {
            type: "text",
            icon: "md-create"
          },
          on: {
            click: event => {
              vm.edittingStore[param.index].edittingCell[
                param.column.key
              ] = true;
              // vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
              vm.freshData(vm.edittingStore, param.index)
            }
          }
        })
      ]
    );
  } else {
    return h("Button", {
      props: {
        type: "text",
        icon: "md-create"
      },
      on: {
        click: event => {
          vm.edittingStore[param.index].edittingCell[param.column.key] = true;
          // vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
          vm.freshData(vm.edittingStore, param.index)
        }
      }
    });
  }
};
const saveIncellEditBtn = (vm, h, param) => {
  return h("Button", {
    props: {
      type: "text",
      icon: "md-checkmark"
    },
    on: {
      click: event => {
        vm.edittingStore[param.index].edittingCell[param.column.key] = false;
        // vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
        vm.freshData(vm.edittingStore, param.index)
        vm.$emit("input", vm.handleBackdata(vm.thisTableData));
        vm.$emit(
          "on-cell-change",
          vm.handleBackdata(vm.thisTableData),
          param.index,
          param.column.key
        );
      }
    }
  });
};
const cellInput = (vm, h, param, item) => {
  return h("Input", {
    props: {
      type: "text",
      value: vm.edittingStore[param.index][item.key]
    },
    on: {
      "on-change"(event) {
        let key = item.key;
        vm.edittingStore[param.index][key] = event.target.value;
        vm.freshData(vm.edittingStore, param.index);
      }
    }
  });
};
export default {
  name: "canEditTable",
  props: {
    refs: String,
    columnsList: Array,
    value: Array,
    url: String,
    editIncell: {
      type: Boolean,
      default: false
    },
    hoverShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      columns: [],
      thisTableData: [],
      thisTableCurrentPageData: [],
      edittingStore: [],
      total: 0,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      currentPage: 1,
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      let vm = this;
      let editableCell = this.columnsList.filter(item => {
        if (item.editable) {
          if (item.editable === true) {
            return item;
          }
        }
      });
      let cloneData = JSON.parse(JSON.stringify(this.value));
      let res = [];
      res = cloneData.map((item, index) => {
        let isEditting = false;
        if (this.thisTableData[index]) {
          if (this.thisTableData[index].editting) {
            isEditting = true;
          } else {
            for (const cell in this.thisTableData[index].edittingCell) {
              if (this.thisTableData[index].edittingCell[cell] === true) {
                isEditting = true;
              }
            }
          }
        }
        if (isEditting) {
          return this.thisTableData[index];
        } else {
          this.$set(item, "editting", false);
          let edittingCell = {};
          editableCell.forEach(item => {
            edittingCell[item.key] = false;
          });
          this.$set(item, "edittingCell", edittingCell);
          return item;
        }
      });
      this.thisTableData = res;
      this.total = this.thisTableData.length || 0;
      this.changePage();
      // this.edittingStore = JSON.parse(JSON.stringify(this.thisTableData));
      this.edittingStore = _.cloneDeep(this.thisTableCurrentPageData);
      this.columnsList.forEach(item => {
        if (item.editable) {
          item.render = (h, param) => {
            let currentRow = this.thisTableCurrentPageData[param.index];
            if (!currentRow.editting) {
              if (this.editIncell) {
                return h(
                  "Row",
                  {
                    props: {
                      type: "flex",
                      align: "middle",
                      justify: "center"
                    }
                  },
                  [
                    h(
                      "Col",
                      {
                        props: {
                          span: "22"
                        }
                      },
                      [
                        !currentRow.edittingCell[param.column.key]
                          ? h("span", currentRow[item.key])
                          : cellInput(this, h, param, item)
                      ]
                    ),
                    h(
                      "Col",
                      {
                        props: {
                          span: "2"
                        }
                      },
                      [
                        currentRow.edittingCell[param.column.key]
                          ? saveIncellEditBtn(this, h, param)
                          : incellEditBtn(this, h, param)
                      ]
                    )
                  ]
                );
              } else {
                return h("span", currentRow[item.key]);
              }
            } else {
              return h("Input", {
                props: {
                  type: "text",
                  maxlength: (item.key == 'eName' || item.key == 'cName') ? 32 : -1,
                  value: currentRow[item.key]
                },
                on: {
                  "on-change"(event) {
                    let key = param.column.key;
                    vm.edittingStore[param.index][key] = event.target.value.split(' ').join('');
                    // vm.freshData(vm.edittingStore, param.index);

                  }
                }
              });
            }
          };
        }
        if (item.handle) {
          item.render = (h, param) => {
            let currentRowData = this.thisTableCurrentPageData[param.index];
            let children = [];
            item.handle.forEach(item => {
              if (item === "edit") {
                children.push(editButton(this, h, currentRowData, param.index));
              } else if (item === "delete") {
                children.push(
                  deleteButton(this, h, currentRowData, param.index)
                );
              }
            });
            return h("div", children);
          };
        }
      });
    },
    changePage(page = 1){
      this.currentPage = page;
      this.thisTableCurrentPageData = this.thisTableData.slice((page - 1) * this.pageSize, page * this.pageSize);
      this.edittingStore = _.cloneDeep(this.thisTableCurrentPageData);
    },
    changePageSize(pageSize){
      this.pageSize = pageSize;
      this.changePage();
    },
    freshData(newData, index){
      let target = 0;
      this.thisTableCurrentPageData = _.cloneDeep(newData);
      this.thisTableData.forEach((item, i) => {
        if(item.oid === newData[index].oid){
          this.thisTableData[i] = _.cloneDeep(newData[index]);
          target = i;
        }
      })
      return target;
    },
    // currentPage() {
    //   let lastCount = this.thisTableData.length;
    //   let lastPage = Math.ceil(lastCount / this.pageSize);
    //   this.total = this.thisTableData.length;
    //    /**
    //    * 总数发生变化时定位当前页
    //    * case1 总数%分页数 == 0
    //    *
    //    * case2 总数%分页数 != 0
    //    *
    //    */
    //   switch (this.total % this.pageSize) {
    //     case 0:
    //       switch (this.currentPage) {
    //         case 1:
    //           this.currentPage = 1;
    //           break;
    //         default:
    //           this.total == this.pageSize
    //             ? this.currentPage = 1
    //             : lastCount > this.total && this.currentPage !== lastPage
    //             ? ''
    //             : this.currentPage = parseInt(this.total / this.pageSize);
    //           break;
    //       }
    //       break;
    //     default:
    //
    //       break;
    //   }
    // },
    handleBackdata(data) {
      let clonedData = JSON.parse(JSON.stringify(data));
      clonedData.forEach(item => {
        delete item.editting;
        delete item.edittingCell;
        delete item.saving;
      });
      return clonedData;
    }
  },
  watch: {
    value(data) {
      this.init();
    }
  }
};
</script>
