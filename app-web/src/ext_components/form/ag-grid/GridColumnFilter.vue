<template>
<!--  <Row type="flex" justify="end" align="middle" :gutter="16" style="text-align: center;">-->
<!--    <Col span="3">-->
<!--      <button type="button" @click="() => {handleOrderBy('asc')}">-->
<!--        <Icon class="sortArrow" type="ios-arrow-round-up" />-->
<!--      </button>-->
<!--    </Col>-->
<!--    <Col span="3">-->
<!--      <button type="button" @click="() => {handleOrderBy('desc')}">-->
<!--        <Icon class="sortArrow" type="ios-arrow-round-down" />-->
<!--      </button>-->
<!--    </Col>-->
<!--  </Row>-->
<!--  <div style="width: 100%;">-->
<!--    <div  @click="handleOrderBy($event)">-->
<!--      <div v-if="params.enableSorting" @click="onSortRequested('', $event)" :class="noSort" class="customSortRemoveLabel"><i class="fa fa-times"></i></div>-->
<!--    </div>-->
<!--    <div v-if="params.enableFilter" ref="menuButton" class="customHeaderMenuButton" @click="onMenuClicked($event)"><i class="ag-icon ag-icon-menu"></i></div>-->
<!--  </div>-->
  <div class="ag-cell-label-container ag-header-cell-sorted-none" role="presentation">
    <span
          v-if="params.enableFilter"
          ref="menuButton"
          class="ag-header-icon ag-header-cell-menu-button"
          @click="onMenuClicked($event)">
      <span class="ag-icon ag-icon-menu" unselectable="on"></span>
    </span>
    <div ref="eLabel" class="ag-header-cell-label" style="cursor: pointer;" role="presentation" unselectable="on" @click="onSortChanged(params)" >
      <div class="customHeaderLabel">{{params.displayName}}</div>
      <div v-if="params.enableSorting" :class="{'sort-active': sortType == 'asc'}"  class="customSortDownLabel"><Icon class="sortArrow" type="ios-arrow-round-up" /></div>
      <div v-if="params.enableSorting" :class="{'sort-active': sortType == 'desc'}" class="customSortUpLabel"><Icon class="sortArrow" type="ios-arrow-round-down" /></div>
    </div>
  </div>
<!--  <input style="height: 20px" :ref="'input'" v-model="text">-->
</template>


<script>
  import axios from "@/libs/axios";
  import global_ from "@/views/global.vue";
  let baseObjOther = global_.baseObjOther;
  import Vue from "vue/dist/vue.min.js";
  import iView from 'iview/dist/iview.min.js'; // 导入组件库
  import 'iview/dist/styles/iview.css'; // 导入样式
  Vue.use(iView);

  export default Vue.extend({
    data() {
      return {
        sortType: '',
        name: '',
        ascSort: null,
        descSort: null,
        noSort: null
      };
    },

    mounted() {
      this.name = this.params.colAttrName;
      // this.params.column.addEventListener('sortChanged', this.onSortChanged);
    },

    created() {

    },

    methods: {
      async onSortChanged(params){
        if(typeof this.params.getGridLoading === "undefined") return;
        if(this.params.getGridLoading()){
          return
        }
        let query;
        switch (this.sortType) {
          case "asc":
            if(this.params.classCategory === 'ExternalItemClass'){
              query = `order by ${this.params.colAttrName} desc`;
            }else{
              query = this.params.isRelation ? `order by \\"${this.params.colAttrName}\\" desc` : `order by plt_${this.params.colAttrName} desc`;
            }
            this.sortType = 'desc';
            this.params.changeColumnProperties(this.name, 'sortType', 'desc');
            break;
          case "desc":
            query = ``;
            this.sortType = '';
            this.params.changeColumnProperties(this.name, 'sortType', '');
            break;
          case "":
            if(this.params.classCategory === 'ExternalItemClass'){
              query = `order by ${this.params.colAttrName} asc`;
            }else{
              query = this.params.isRelation ? `order by \\"${this.params.colAttrName}\\" asc` : `order by plt_${this.params.colAttrName} asc`;
            }
            this.sortType = 'asc';
            this.params.changeColumnProperties(this.name, 'sortType', 'asc');
            break;
          default:
            if(this.params.classCategory === 'ExternalItemClass'){
              query = `order by ${this.params.colAttrName} asc`;
            }else{
              query = this.params.isRelation ? `order by \\"${this.params.colAttrName}\\" asc` : `order by plt_${this.params.colAttrName} asc`;
            }
            this.sortType = 'asc';
            this.params.changeColumnProperties(this.name, 'sortType', 'asc');
            break;
        }
        // let data = await axios.post(
        //   `${baseObjOther}/omf/entities/${this.params.targetClass}/objects`,
        //   {
        //     condition: query
        //   }
        // );
        // this.params.freshRowData(data.data.data);
        this.params.getQueryData().query.query = this.params.getQueryData().query.query ? this.params.getQueryData().query.query.split('order')[0] : '';
        query = `${this.params.getQueryData().query.query.trim()} ${query}`;
        if (query.replace(/(^\s*)/g, "").substring(0, 5)=="order"){
          query = "and 1=1 " + query.replace(/(^\s*)/g, "");
        }
        this.params.freshData(query, true, false);
      },

      onMenuClicked() {
        this.params.showColumnMenu(this.$refs.menuButton);
      },


      onSortRequested(order, event) {
        this.params.setSort(order, event.shiftKey);
      },
      isFilterActive() {
        // return this.text !== null && this.text !== undefined && this.text !== '';
      },

      doesFilterPass(params){
        // return !this.text || this.text.toLowerCase()
        //   .split(" ")
        //   .every((filterWord) => {
        //     return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0;
        //   });
      },

      getModel() {
        // return {value: this.text};
      },

      setModel(model) {
        if(model) {
          // this.text = model.value;
        }
      },

      componentMethod(message) {
        alert(`Alert from PartialMatchFilterComponent ${message}`);
      },
    },
    computed:{

    },
    watch: {
      'text': function(val, oldVal) {
        if (val !== oldVal) {
          this.params.filterChangedCallback();
        }
      }
    }

  });

</script>

<style scoped>
  button {
    appearance: none;
    background: transparent;
    border: 0;
    height: 20px;
    padding: 0;
    width: 20px;
    cursor: pointer;
    transition: ease-in 300ms;
  }
  button:hover{
    background: #eee;
  }
  .sortArrow{
    font-size: 18px;
  }

  .ag-header-cell-menu-button {
    opacity: 0;
    transition: opacity 0.2s ease 0s, border 0.2s ease 0s;
  }

  .ag-header-cell-menu-button:hover{
    opacity: 1;
  }

  .customHeaderLabel {
    float: left;
    margin: 0 0 0 3px;
  }

  .customSortDownLabel {
    float: left;
    margin: 0 0 0 3px;
    display: none;
  }

  .customSortDownLabel.sort-active{
    display: block;
  }

  .customSortUpLabel {
    float: left;
    margin: 0;
    display: none;
  }

  .customSortUpLabel.sort-active{
    display: block;
  }

  .customSortRemoveLabel {
    float: left;
    margin: 0 0 0 3px;
    font-size: 11px;
  }

  .active {
    color: cornflowerblue;
  }
</style>
