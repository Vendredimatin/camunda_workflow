import Vue from "vue/dist/vue.min.js";
import iView from 'iview/dist/iview.min.js'; // 导入组件库
import 'iview/dist/styles/iview.css'; // 导入样式
import ICountUp from 'vue-countup-v2';
import _ from 'lodash';
Vue.use(iView);

let progressBarRender = Vue.extend({
  template: "<Progress :percent=progress() status='active'/>",
  props: ["config", "params"],
  data(){
    return {
    };
  },
  mounted(){

  },
  beforeDestroy() {

  },
  methods: {
    progress() {
      if (this.params.row[this.config.key] / this.config.cellParams.progressScale > 1) {
        return 100;
      } else {
        return parseInt((this.params.row[this.config.key] / this.config.cellParams.progressScale) * 100);
      }
    },
  }
});

let checkboxRender = Vue.extend({
  template:
    "<Checkbox disabled size='large' v-model='params.row[config.key]'></Checkbox>",
  props: ["config", "params"],
  methods: {},
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
  props: ["config", "params"],
  computed: {
    transferedTime() {
      if (!this.params.row[this.config.key]) {
        return "";
      }
      let renderTime = "";
      let timestamps = this.params.row[this.config.key].toString().split(",");
      timestamps.forEach((timestamp, index) => {
        if (/^\-?\d{1,16}$/g.test(timestamp)) {
          var realTime = new Date(parseInt(timestamp));
          let _month = realTime.getMonth() + 1; // fix bug 815
          let _hour = realTime.getHours();
          if (_hour < 10) _hour = "0" + _hour;
          let _minute = realTime.getMinutes();
          let _second = realTime.getSeconds();
          if (_minute < 10) _minute = "0" + _minute;
          if (_second < 10) _second = "0" + _second;
          switch (this.config.cellParams.timeTransferFormat) {
            case 'YYYYMMDDhhmmss':
              index === 0
                ? (renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}`)
                : (renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}`);
              break;
            case 'YYYYMMDD':
              index === 0
                ? (renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()}`)
                : (renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()}`);
              break;
            case 'hhmmss':
              index === 0
                ? (renderTime = `${_hour}:${_minute}:${_second}`)
                : (renderTime += `,${_hour}:${_minute}:${_second}`);
              break;
            default:
              index === 0
                ? (renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}`)
                : (renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}`);
              break;
          }
        } else {
          index === 0
            ? (renderTime = timestamp)
            : (renderTime += `,${timestamp}`);
        }
      });
      return renderTime;
    },
  },
});

let operationRender = Vue.extend({
  template: `
    <div>
      <ButtonGroup v-if="item.hasAuth" v-for="item in operationParams">
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
  props: ["config", "params"],
  data(){
    return {
      rowData: null,
      operationParams: []
    }
  },
  mounted() {
    this.operationParams = this.config.operationParams;
    // this.config.operationParams.forEach(x => {
    //   // console.log('x.style', x.style);
    //   x.style = x.style.color ? x.style.color : "white";
    // });
  },
  computed: {

  },
  methods: {
    shape(item) {
      if(Object.prototype.toString.call(item.shape) === '[object Function]'){
        return item.shape(this.params.row)
      }else{
        if (item.shape) return "circle";
        else return "true";
      }
    },
    color(item){
      if(Object.prototype.toString.call(item.color) === '[object Function]'){
        return item.color(this.params.row)
      } else{
        return item.color
      }
    },
    type(item){
      if(Object.prototype.toString.call(item.type) === '[object Function]'){
        return item.type(this.params.row)
      } else{
        return item.type
      }
    },
    show(item){
      if(Object.prototype.toString.call(item.show) === '[object Function]'){
        return item.show(this.params.row)
      } else {
        if (item.show === false ) return false;
        else return true;
      }
    },
    disabled(item){
      if(Object.prototype.toString.call(item.disabled) === '[object Function]'){
        return item.disabled(this.params.row)
      } else{
        return item.disabled
      }
    },
    uniLabel(item){
      if(Object.prototype.toString.call(item.uniLabel) === '[object Function]'){
        return item.uniLabel(this.params.row)
      } else{
        return item.uniLabel
      }
    },
    transferedStyle(item){
      return `margin-left: 3px; margin-right: 3px; color:${this.color(item)};`;
    },
    async oprClicked(event, opr_type, opr_path, disabled = false, eventObj) {
      if(this.config.notEditable) return ;
      if(disabled) return;
      event.stopPropagation();
      event.preventDefault();
      this.$emit('handleInvokeOperation', opr_type, opr_path, this.params.row, eventObj)
    },
  },
});

let escapeRender = Vue.extend({
  template: `
    <span>
    {{ escapedString }}
    </span>
  `,
  props: ["config", "params"],
  computed: {
    escapedString() {
      var json = JSON.parse(this.config.cellParams.escapeObjectStr);
      if (this.params.row[this.config.key] in json) {
        return json[this.params.row[this.config.key]];
      } else {
        return this.params.row[this.config.key];
      }
    },
  },
});

let customTransferRender = Vue.extend({
  template: `
    <span>
    {{ customTransfer }}
    </span>
  `,
  props: ["config", "params"],

  computed: {
    customTransfer() {
      if (this.config.cellParams.customTransferFunc) {
        try {
          let customTransferFunc = new Function(
            "value",
            this.config.cellParams.customTransferFunc
          );
          return customTransferFunc(this.params.row[this.config.key]);
        } catch (e) {
          console.log(e);
        }
      } else {
        return this.params.row[this.config.key];
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
