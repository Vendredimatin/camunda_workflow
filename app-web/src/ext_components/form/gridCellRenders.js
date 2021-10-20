import Vue from "vue/dist/vue.min.js";
import iView from 'iview/dist/iview.min.js'; // 导入组件库
import 'iview/dist/styles/iview.css'; // 导入样式
import ICountUp from 'vue-countup-v2';
import _ from 'lodash';
Vue.use(iView);

let progressBarRender = Vue.extend({
  template: "<Progress :percent=progress() status='active'/>",
  data(){
    return {
      timer: null,
    };
  },
  mounted(){
    // if (this.params.rowIndex==0) {
    //   this.timer = setInterval(()=>{
    //   }, this.params.refreshPeriodByMs);
    // }
  },
  beforeDestroy() {
    // if (this.timer) {
    //   clearInterval(this.timer);
    //   this.timer = null;
    // }
  },
  methods: {
    progress() {
      if ((this.params.value / this.params.progressScale) > 1) return 100;
      else return parseInt((this.params.value / this.params.progressScale) * 100);
    }
  }
});

let checkboxRender = Vue.extend({
  template: "<Checkbox disabled size='large' v-model='params.value'></Checkbox>",
  methods: {

  }
});

let userGroupRender = Vue.extend({
  template: "<span>{{userGroup}}</span>",
  data(){
    return{
      sourceGroup: null,
      attrMap: {
        displayName: 'comment',
        name: 'label',
        oid: 'value'
      },
      findDone: false,
    }
  },
  computed: {
    userGroup() {
      if(!this.params.value){
        return ''
      }
      if(this.params.getUserGroupMap()){
        if(this.params.getUserGroupMap()[this.params.userGroupType][this.params.value]){
          return this.params.getUserGroupMap()[this.params.userGroupType][this.params.value][this.params.userGroupAttr]
        }else if(this.params.value === '9C92E891E9AE534DB685737DE467A9D0'){
          return this.params.getUserGroupMap()['9C92E891E9AE534DB685737DE467A9D0'][this.params.userGroupAttr];
        }else{
          return this.params.value;
        }
      }else{
        return this.params.value;
      }
    },
  },
  methods: {
    // getUserGroup(oid, group = this.params.allOrgUsers){
    //   for(let i = 0; i < group.length && !this.findDone; i++){
    //     if(group[i].children && group[i].children.map(item => item.oid).indexOf(oid) !== -1){
    //       this.sourceGroup = group[i];
    //       this.findDone = true;
    //     }else if(group[i].children){
    //       this.getUserGroup(oid, group[i])
    //     }
    //   }
    // }
  }
});

let dynamicDigitalRender = Vue.extend({
  template: '<ICountUp :delay="delay" :endVal="endVal" :options="options" />',
  components: {
    ICountUp
  },
  data() {
    return {
      delay: 1000,             //延迟执行时间
      endVal: '',          //最终值
      options: {
        useEasing: false,
        useGrouping: false,
        separator: ',',
        decimal: '.',
        prefix: '',
        suffix: ''
      }
    }
  },
  mounted() {
    this.endVal = this.params.value;
  },
  watch: {
    'params.value'(val) {
      this.endVal = val;
    }
  }
})

let timeTransferRender = Vue.extend({
  template: "<span>{{transferedTime}}</span>",
  computed: {
    transferedTime() {
      if(!this.params.value){
        return ''
      }
      let renderTime = '';
      let timestamps = this.params.value.toString().split(',');
      timestamps.forEach((timestamp, index) => {
        if(/^\-?\d{1,16}$/g.test(timestamp)){
          var realTime = new Date(parseInt(timestamp));
          let _month = realTime.getMonth() + 1; // fix bug 815
          let _hour = realTime.getHours();
          if (_hour < 10) _hour = "0" + _hour;
          let _minute = realTime.getMinutes();
          let _second = realTime.getSeconds();
          if (_minute < 10) _minute = "0" + _minute;
          if (_second < 10) _second = "0" + _second;
          if (this.params.timeTransferFormat == "YYYYMMDDhhmmss")
            index === 0 ? renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}` : renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}`;
          else if (this.params.timeTransferFormat == "YYYYMMDD")
            index === 0 ? renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()}` : renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()}`;
          else if (this.params.timeTransferFormat == "hhmmss")
            index === 0 ? renderTime = `${_hour}:${_minute}:${_second}` : renderTime += `,${_hour}:${_minute}:${_second}`;
          else
            index === 0 ? renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}` : renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}`;
        }else{
          index === 0 ? renderTime = timestamp : renderTime += `,${timestamp}`;
        }
      })
      return renderTime;
    },
  }
});

let operationRender = Vue.extend({
  template: `
  <div>
    <a    v-if="compactMode && item.hasAuth"
          href="javascript:void(0);"
          v-for="item in operationParams"
          :class="{'disabled': disabled(item)}"
          @click="oprClicked(event, item.opr_type, item.opr_path, disabled(item), item)"
          :style="'margin-left: 3px; margin-right: 3px;' + 'color:' + color(item) + ';'">{{uniLabel(item)}}</a>
    <ButtonGroup v-if="!compactMode && item.hasAuth" v-for="item in operationParams">
      <Button :style="transferedStyle(item)"
              v-show="show(item)"
              :disabled="disabled(item)"
              :icon="item.icon"
              :shape="shape(item)"
              :type="type(item)"
              size="small"
              @click="oprClicked(event, item.opr_type, item.opr_path, null, item)">{{uniLabel(item)}}
      </Button>
    </ButtonGroup>
  </div>

  `,
  data(){
    return {
      compactMode: false,
      rowData: null,
      operationParams: []
    }
  },
  mounted() {
    this.compactMode = this.params.compactMode || this.params.args.compactMode || false;
    this.rowData = this.params.data;
    this.operationParams = _.cloneDeep(this.params.colDef.operationParams);
    let oprPs = this.params.colDef.operationParams;
    oprPs.forEach(x => {
      // console.log('x.style', x.style);
      x.style = x.style.color ? x.style.color : "white";
    });
  },
  computed: {

  },
  methods: {
    shape(item) {
      if(Object.prototype.toString.call(item.shape) === '[object Function]'){
        return item.shape(this.rowData)
      }else{
        if (item.shape) return "circle";
        else return "true";
      }
    },
    color(item){
      if(Object.prototype.toString.call(item.color) === '[object Function]'){
        return item.color(this.rowData)
      } else{
        return item.color
      }
    },
    type(item){
      if(Object.prototype.toString.call(item.type) === '[object Function]'){
        return item.type(this.rowData)
      } else{
        return item.type
      }
    },
    show(item){
      if(Object.prototype.toString.call(item.show) === '[object Function]'){
        return item.show(this.rowData)
      } else {
        if (item.show === false ) return false;
        else return true;
      }
    },
    disabled(item){
      if(Object.prototype.toString.call(item.disabled) === '[object Function]'){
        return item.disabled(this.rowData)
      } else{
        return item.disabled
      }
    },
    uniLabel(item){
      if(Object.prototype.toString.call(item.uniLabel) === '[object Function]'){
        return item.uniLabel(this.rowData)
      } else{
        return item.uniLabel
      }
    },
    transferedStyle(item){
      return `margin-left: 3px; margin-right: 3px; color:${this.color(item)};`;
    },
    async oprClicked(event, opr_type, opr_path, disabled = false, eventObj) {
      if(this.params.args.notEditable) return ;
      console.log(1);
      if(disabled) return;
      // console.log('oprClicked@', this.params.getAll());
      // console.log("this.params.getAll@oprCellRenderer", this.params.getAll()[this.params.rowIndex]);
      // console.log('this.params@oprClicked', this.params);
      // console.log('event@oprClicked', event);
      event.stopPropagation();
      event.preventDefault();
      console.log("debug@oprClicked", this.params.args.columnDefs);
      this.params.node.setSelected(true, true);
      await this.params.invokeOperation(opr_type, opr_path, this.params.getAll()[this.params.rowIndex], eventObj);
      console.log("debug@oprClicked, after invoke", this.params.args.columnDefs);
    },
  },
});

let escapeRender = Vue.extend({
  template: `
  <span>
    {{escapedString}}
  </span>

  `,

  computed: {
    escapedString() {
      var values;
      // console.log('---------------escapeObjectStr----------',this.params.value)
      switch (typeof this.params.value) {
        case 'string':
          values = this.params.value.split(",");
          break;
        case 'boolean':
          values = `${this.params.value}`;
          break;
        case 'number':
          values =  this.params.value.toString();
          break;
        default:
          values = `${this.params.value}`;
          break;
      }
      var json = JSON.parse(this.params.escapeObjectStr);
      // if (values){
      //   var resStrs = [];
      //   for (var item of values){
      //     if (item in json) resStrs.push(json[item]);
      //   }
      //   return resStrs.join(",");
      // }
      if (this.params.value in json) return json[this.params.value];
      else return this.params.value;
    },
    operationParams() {
      return this.params.colDef.operationParams;
    },
  },
});

let customTransferRender = Vue.extend({
  template: `
  <span>
    {{customTransfer}}
  </span>
  `,

  computed: {
    customTransfer(){
      if(this.params.customTransferFunc){
        try {
          let customTransferFunc = new Function('value', this.params.customTransferFunc);
          return customTransferFunc(this.params.value)
        }catch (e){
          console.log(e)
        }
      }else{
        return this.params.value
      }
    },
  },
});

export {
  progressBarRender,
  checkboxRender,
  userGroupRender,
  dynamicDigitalRender,
  timeTransferRender,
  operationRender,
  escapeRender,
  customTransferRender,
};
