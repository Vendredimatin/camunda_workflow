<template>
  <div :style="{width:tableWidth}" class='autoTbale'>
    <Row>
      <Input id="searchClassKeyWord" v-model="searchConName" icon="md-search" @on-change="handleSearch" placeholder="请输入操作名搜索..."
             style="width: 200px;float: right;"/>
    </Row>
    <div :style="{height: tableHeights,overflow: 'auto'}" ref="selfTable">
    <table class="table table-bordered margin-top-10" id='hl-tree-table'>
      <thead>
      <tr style="height: 40px;">
        <th v-for="(column,index) in cloneColumns" :key="column.type" style="text-align: center;">
<!--          <label v-if="column.type === 'selection'">-->
            <!-- <input type="checkbox" v-model="checks" @click="handleCheckAll"> -->
            <!-- <input type="radio" v-model="checks" @click="handleCheckAll"> -->
<!--          </label>-->
          <label>
            {{ renderHeader(column, index) }}
            <span class="ivu-table-sort" v-if="column.sortable">
                                <Icon type="ios-arrow-up" :class="{on: column._sortType === 'asc'}"
                                      @click.native="handleSort(index, 'asc')"/>
                                <Icon type="ios-arrow-down" :class="{on: column._sortType === 'desc'}"
                                      @click.native="handleSort(index, 'desc')"/>
                            </span>
          </label>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-bind:id="step(index)" v-for="(item,index) in initItems" :key="item.id" v-show="show(item)"
          style="height: 40px;"
          :class="{'child-tr':item.parent, 'unInherit':item.isSelf}" @click="trClick(item, index)">
        <td v-for="(column,snum) in columns" :key="column.key" :style=tdStyle(column)>
<!--          <label v-if="column.type === 'selection' && !item.showSelect">-->
<!--            <input type="checkbox" :value="item.id + '&' + item.className + '#' + item.isModel" v-model="checkGroup"-->
<!--                   :size="bigCheck" @click="handleCheckClick(item,$event,index)">-->
<!--             <input type="radio" :value="item.id" v-model="checkGroup" @click="handleCheckClick(item,$event,index)"> -->
<!--          </label>-->
          <!-- <div v-if="column.type === 'action' && item.showCheck">
              <i-button :type="action.type" size="small" @click="RowClick(item,index,action.text)" v-for='action in (column.pAction)' :key="action.text" style="margin-right: 10px;">{{action.text}}</i-button>
          </div> -->
          <div v-if="column.type === 'action' && !item.showCheck">
            <i-button id="createEntityOpr"  type="primary" size="small" v-if="item.isInherit"
                      @click="RowClickAdd(item, index)"
                      style="margin-right: 10px;">
              新增
            </i-button>
            <i-button id="editEntityOpr"  type="primary" size="small" v-if="!item.isInherit"
                      @click="RowClickEdit(item, index)"
                      style="margin-right: 10px;">
              编辑
            </i-button>
            <i-button id="deleteEntityOpr"  :type="action.type" size="small" v-if="!item.isInherit"
                      @click="RowClick(item,index,action.text)" v-for='action in (column.actions)' :key="action.text"
                      style="margin-right: 10px;">{{action.text}}
            </i-button>
          </div>
          <label id="extendArrow" @click="toggle(index,item)" v-if="!column.type">
                            <span v-if='snum==iconRow()'>
                                <i v-html='item.spaceHtml'></i>
                                <i v-if="item.children&&item.children.length>0" class="ivu-icon"
                                   :class="{'ivu-icon-ios-arrow-forward':!item.expanded,'ivu-icon-ios-arrow-down':item.expanded }"></i>
                                <i v-else class="ms-tree-space"></i>
                            </span>
<!--            <Tooltip :placement="'bottom'" :maxWidth="1100" :transfer="true"  style="">-->
<!--            <span>-->
<!--                <div style="{word-break: break-all; max-width: 400px;white-space: nowrap; text-overflow: ellipsis;overflow: hidden; position: relative; top: 5px;}" :title="renderBody(item,column)">-->
<!--                  {{renderBody(item,column) }}-->
<!--                </div>-->
<!--              </span>-->
<!--            </Tooltip>-->

              <span style="display: inline-block;">
                <div style="{word-break: break-all; max-width: 400px;white-space: nowrap; text-overflow: ellipsis;overflow: hidden; position: relative; top: 5px;}" :title="renderBody(item,column)">
                  {{renderBody(item,column) }}
                </div>
              </span>
            </label>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <QueryOprDialog
      ref="opr_dialog"
      :fromManagement="true"
      @success-create-queryopr="onSuccessCreateQueryOpr"
    >
    </QueryOprDialog>
  </div>
</template>
<script>
  import {tableMixin} from "@/component/tableMixin"
  import _ from 'lodash';
  import QueryOprDialog from '@/views/functional-model/components/query-operation-edit-dialog.vue'

  var OprF=-1;
  var OprC=-1;

  export default {
    name: "treeGrid",
    mixins: [tableMixin],
    props: {
      columns: Array,
      items: {
        type: Array,
        default: function () {
          return [];
        }
      }
    },
    components: {
      QueryOprDialog
    },
    data() {
      return {
        bigCheck: 'large',
        searchConName: '',
        initItems: [], //处理后数据数组
        originInitItems: [], //处理后数据数组原始拷贝
        cloneColumns: [], //处理后的表头数据
        checkGroup: [], //复选框数组
        checks: false, //全选
        screenWidth: document.body.clientWidth, //自适应宽
        tdsWidth: 0, //td总宽
        timer: false, //控制监听时长
        dataLength: 0, //树形数据长度
        timeout: null, //防抖
      };
    },
    created() {
      this._ = _;
    },
    computed: {
      tableWidth() {
        return this.tdsWidth > this.screenWidth && this.screenWidth > 0
          ? this.screenWidth + "px"
          : "100%";
      }
    },
    watch: {
      screenWidth(val) {
        if (!this.timer) {
          this.screenWidth = val;
          this.timer = true;
          setTimeout(() => {
            this.timer = false;
          }, 400);
        }
      },
      items() {
        if (this.items) {
          this.dataLength = this.Length(this.items);
          this.initData(this.deepCopy(this.items), 1, null);
          this.originInitItems = _.cloneDeep(this.initItems);
          this.checkGroup = this.renderCheck(this.items);
          if (this.checkGroup.length == this.dataLength) {
            this.checks = true;
          } else {
            this.checks = false;
          }
        }
      },
      columns: {
        handler() {
          this.cloneColumns = this.makeColumns();
        },
        deep: true
      },
      checkGroup(data) {
        this.checkAllGroupChange(data);
      }
    },
    mounted() {
      if (this.items) {
        this.dataLength = this.Length(this.items);
        this.initData(this.deepCopy(this.items), 1, null);
        this.cloneColumns = this.makeColumns();
        this.checkGroup = this.renderCheck(this.items);
        if (this.checkGroup.length == this.dataLength) {
          this.checks = true;
        } else {
          this.checks = false;
        }
      }
      // 绑定onresize事件 监听屏幕变化设置宽
      this.$nextTick(() => {
        this.screenWidth = document.body.clientWidth;
      });
      window.onresize = () => {
        return (() => {
          window.screenWidth = document.body.clientWidth;
          this.screenWidth = window.screenWidth;
        })();
      };
    },
    methods: {

      step:function(i){
            return "tableEntityrow" +i
            },

      

      // 有无多选框折叠位置优化
      iconRow() {
        for (var i = 0, len = this.columns.length; i < len; i++) {
          if (this.columns[i].type == "selection") {
            return 1;
          }
        }
        return 0;
      },
      // 设置td宽度,td的align
      tdStyle(column) {
        var style = {};
        if (column.align) {
          style["text-align"] = column.align;
        }
        if (column.width) {
          style["min-width"] = column.width + "px";
        }
        return style;
      },
      // 排序事件
      handleSort(index, type) {
        this.cloneColumns.forEach(col => (col._sortType = "normal"));
        if (this.cloneColumns[index]._sortType === type) {
          this.cloneColumns[index]._sortType = "normal";
        } else {
          this.cloneColumns[index]._sortType = type;
        }
        this.$emit(
          "on-sort-change",
          this.cloneColumns[index]["key"],
          this.cloneColumns[index]["_sortType"]
        );
      },
      // 点击某一行事件
      RowClick(data, index, text) {
        let result = this.makeData(data);
        this.$emit("on-row-click", result, index, text);
      },
      /**
       *@description点击新增事件
       *@params
       *@date 2020/9/28
       *@return
       */
      RowClickAdd(data, index){
        this.$refs.opr_dialog.createBindQuick(data.className + "-*");
      },

      /**
       *@description点击编辑事件
       *@params
       *@date 2020/9/28
       *@return
       */
      RowClickEdit(data, index){
        if(data.extSettings && JSON.parse(data.extSettings).sysBindOpr){
          this.$refs.opr_dialog.editBindSys(data.id);
        }else{
          this.$refs.opr_dialog.editBindQuick(data.id);
        }
      },

      //双击事件
      trClick(data, index) {
        // this.checkGroup = [];
        // this.checkGroup.push(data.id);
        // data.isChecked = !data.isChecked;
        this.$emit("on-row-dblclick", data, index);
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
      // 处理表头数据
      makeColumns() {
        let columns = this.deepCopy(this.columns);
        this.tdsWidth = 0;
        columns.forEach((column, index) => {
          column._index = index;
          column._width = column.width ? column.width : "";
          column._sortType = "normal";
          this.tdsWidth += column.width ? parseFloat(column.width) : 0;
        });
        return columns;
      },
      // 数据处理 增加自定义属性监听
      initData(items, level, parent) {
        this.initItems = [];
        let spaceHtml = "";
        for (var i = 1; i < level; i++) {
          spaceHtml += "<i class='ms-tree-space'></i>";
        }
        items.forEach((item, index) => {
          item = Object.assign({}, item, {
            parent: parent,
            level: level,
            spaceHtml: spaceHtml
          });
          if (typeof item.expanded == "undefined") {
            item = Object.assign({}, item, {
              expanded: false
            });
          }
          if (typeof item.show == "undefined") {
            item = Object.assign({}, item, {
              isShow: false
            });
          }
          if (typeof item.isChecked == "undefined") {
            item = Object.assign({}, item, {
              isChecked: false
            });
          }
          item = Object.assign({}, item, {
            load: item.expanded ? true : false
          });
          if (item.children && item.children.length !==0){
            this.initItems.push(item);
          }
          if (item.children && item.expanded) {
            this.initData(item.children, level + 1, item);
          }
        });
      },
      //  隐藏显示
      show(item) {
        return (
          item.level == 1 || (item.parent && item.parent.expanded && item.isShow)
        );
      },
      toggle(index, item) {
        let level = item.level + 1;
        let spaceHtml = "";
        for (var i = 1; i < level; i++) {
          spaceHtml += "<i class='ms-tree-space'></i>";
        }
        if (item.children) {
          if (item.expanded) {
            item.expanded = !item.expanded;
            this.close(index, item);
          } else {
            item.expanded = !item.expanded;
            if (item.load) {
              this.open(index, item);
            } else {
              item.load = true;
              item.children.forEach((child, childIndex) => {
                this.initItems.splice(index + childIndex + 1, 0, child);
                //设置监听属性
                this.$set(this.initItems[index + childIndex + 1], "parent", item);
                this.$set(this.initItems[index + childIndex + 1], "level", level);
                this.$set(
                  this.initItems[index + childIndex + 1],
                  "spaceHtml",
                  spaceHtml
                );
                this.$set(this.initItems[index + childIndex + 1], "isShow", true);
                this.$set(
                  this.initItems[index + childIndex + 1],
                  "expanded",
                  false
                );
              });
            }
          }
        }
      },
      open(index, item) {
        if (item.children) {
          item.children.forEach((child, childIndex) => {
            child.isShow = true;
            if (child.children && child.expanded) {
              this.open(index + childIndex + 1, child);
            }
          });
        }
      },
      close(index, item) {
        if (item.children) {
          item.children.forEach((child, childIndex) => {
            child.isShow = false;
            child.expanded = false;
            if (child.children) {
              this.close(index + childIndex + 1, child);
            }
          });
        }
      },
      //点击check勾选框,判断是否有children节点 如果有就一并勾选
      handleCheckClick(data, event, index) {
        this.checkGroup = [];
        this.checkGroup.push(data.id);
        data.isChecked = !data.isChecked;
        // var arr = data.children;
        // if(arr){
        //     if(data.isChecked){
        //         this.checkGroup.push(data.id);
        //         for (let i=0; i<arr.length; i++){
        //             this.checkGroup.push(arr[i].id)
        //         }
        //     }else {
        //         for (var i=0; i<this.checkGroup.length; i++){
        //             if(this.checkGroup[i] == data.id){
        //                 this.checkGroup.splice(i,1)
        //             }
        //             for (var j=0; j<arr.length; j++){
        //                 if(this.checkGroup[i] == arr[j].id){
        //                     this.checkGroup.splice(i,1);
        //                 }
        //             }
        //         }
        //     }
        // }
      },
      //checkbox 全选 选择事件
      handleCheckAll() {
        this.checks = !this.checks;
        if (this.checks) {
          this.checkGroup = this.getArray(
            this.checkGroup.concat(this.All(this.items))
          );
        } else {
          this.checkGroup = [];
        }
        // this.$emit('on-selection-change', this.checkGroup)
      },
      // 数组去重
      getArray(a) {
        var hash = {},
          len = a.length,
          result = [];
        for (var i = 0; i < len; i++) {
          if (!hash[a[i]]) {
            hash[a[i]] = true;
            result.push(a[i]);
          }
        }
        return result;
      },
      checkAllGroupChange(data) {
        if (this.dataLength > 0 && data.length === this.dataLength) {
          this.checks = true;
        } else {
          this.checks = false;
        }
        this.$emit("on-selection-change", this.checkGroup);
      },
      All(data) {
        let arr = [];
        data.forEach(item => {
          arr.push(item.id);
          if (item.children && item.children.length > 0) {
            arr = arr.concat(this.All(item.children));
          }
        });
        return arr;
      },
      // 返回树形数据长度
      Length(data) {
        let length = data.length;
        data.forEach(child => {
          if (child.children) {
            length += this.Length(child.children);
          }
        });
        return length;
      },
      // 返回表头
      renderHeader(column, $index) {
        if ("renderHeader" in this.columns[$index]) {
          return this.columns[$index].renderHeader(column, $index);
        } else {
          return column.title || "#";
        }
      },
      // 返回内容
      renderBody(row, column, index) {
        return row[column.key];
      },

      maxSlice(v) {
        if (v !== null && v !== '' && v != undefined) {
          if(v === false || v === true) v = v + '';
          return v.length > 32 ? v.slice(0, 32) + "..." : v
        }
      },
      // 默认选中
      renderCheck(data) {
        let arr = [];
        data.forEach(item => {
          if (item._checked) {
            arr.push(item.id);
          }
          if (item.children && item.children.length > 0) {
            arr = arr.concat(this.renderCheck(item.children));
          }
        });
        return arr;
      },
      // 深度拷贝函数
      deepCopy(data) {
        var t = this.type(data),
          o,
          i,
          ni;
        if (t === "array") {
          o = [];
        } else if (t === "object") {
          o = {};
        } else {
          return data;
        }
        if (t === "array") {
          for (i = 0, ni = data.length; i < ni; i++) {
            o.push(this.deepCopy(data[i]));
          }
          return o;
        } else if (t === "object") {
          for (i in data) {
            o[i] = this.deepCopy(data[i]);
          }
          return o;
        }
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

      handleSearch(){
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.$emit('handleSearch', this.searchConName);
        }, 500);
        // let cloneData = _.cloneDeep(this.originInitItems);
        // let keywordLower = this.searchConName.toLowerCase().trimStart().trimEnd();
        // if (this.searchConName.trimStart().trimEnd().length > 0) {
        //   this.initItems = [];
        //   cloneData.forEach(item => {
        //     let getResult = false;
        //     // let addFlag = false;
        //     if(item){
        //       for(let itemKey in item){
        //         if(typeof item[itemKey] === 'string'){
        //           if (
        //             item[itemKey]
        //             .toString()
        //             .toLowerCase()
        //             .match(keywordLower) !== null
        //           ) {
        //             // this.initItems.push(item);
        //             getResult = true;
        //             break;
        //           }
        //         }
        //       }
        //
        //       let resultChildren = [];
        //       if(!getResult){
        //         item.children.forEach(child => {
        //           if(child){
        //             for (let childKey in child) {
        //               if(childKey === 'displayName' || childKey === 'className'){
        //                 if (
        //                   child[childKey]
        //                   .toString()
        //                   .toLowerCase()
        //                   .match(keywordLower) !== null
        //                 ) {
        //                   // this.initItems.push(item);
        //                   getResult = true;
        //                   resultChildren.push(child);
        //                   break;
        //                 }
        //               }
        //             }
        //           }
        //         });
        //       }
        //       if(getResult){
        //         this.initItems.push(item);
        //         if(resultChildren.length !== 0){
        //           item.children = resultChildren;
        //         }
        //       }
        //     }
        //     // return getResult || childcon.length > 0;
        //   });
        // }else{
        //   this.initItems = _.cloneDeep(this.originInitItems);
        // }
      },
      onSuccessCreateQueryOpr(){
        this.$emit('onSuccessCreateQueryOpr')
      },
    },
    beforeDestroy() {
      window.onresize = null;
    }
  };
</script>
<style scoped>
  .autoTbale {
    overflow: auto;
  }

  table {
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
  }

  .table-bordered {
    border: 1px solid #ebebeb;
  }

  .table > tbody > tr > td,
  .table > tbody > tr > th,
  .table > thead > tr > td,
  .table > thead > tr > th {
    border-top: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 4px;
    vertical-align: middle;
  }

  .table-bordered > tbody > tr > td,
  .table-bordered > tbody > tr > th,
  .table-bordered > tfoot > tr > td,
  .table-bordered > tfoot > tr > th,
  .table-bordered > thead > tr > td,
  .table-bordered > thead > tr > th {
    border: 1px solid #e7e7e7;
  }

  .table > thead > tr > th {
    border-bottom: 1px solid #ddd;
  }

  .table-bordered > thead > tr > td,
  .table-bordered > thead > tr > th {
    background-color: #f5f5f6;
  }

  #hl-tree-table > tbody > tr {
    background-color: #fff;
  }

  #hl-tree-table > tbody > .child-tr {
    background-color: #fff;
  }

  #hl-tree-table > tbody > .unInherit {
    display: none;
  }

  label {
    margin: 0 8px;
  }

  .ms-tree-space {
    position: relative;
    top: 1px;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    width: 20px;
    height: 20px;
  }

  .ms-tree-space::before {
    content: "";
  }

  #hl-tree-table th > label {
    margin: 0;
  }
</style>
