import Vue from "vue/dist/vue.min.js";
import iView from "iview/dist/iview.min.js"; // 导入组件库
import "iview/dist/styles/iview.css"; // 导入样式
import ICountUp from "vue-countup-v2";
import _ from "lodash";

Vue.use(iView);

let progressBarRender = Vue.extend({
  template: "<Progress :percent=progress() status='active'/>",
  props: ["config", "params"],
  data() {
    return {

    };
  },
  mounted() {

  },
  beforeDestroy() {},
  methods: {
    progress() {
      if (this.params.row[this.config.key] / this.config.cellParams.progressScale > 1) {
        return 100;
      } else {
        return parseInt((this.params.row[this.config.key] / this.config.cellParams.progressScale) * 100);
      }
    },
  },
});

let checkboxRender = Vue.extend({
  template:
    "<Checkbox disabled size='large' v-model='params.row[config.key]'></Checkbox>",
  props: ["config", "params"],
  methods: {},
});

let userGroupRender = Vue.extend({
  template: "<span>{{userGroup}}</span>",
  data() {
    return {
      sourceGroup: null,
      attrMap: {
        displayName: "comment",
        name: "label",
        oid: "value",
      },
      findDone: false,
    };
  },
  computed: {
    userGroup() {
      if (!this.params.value) {
        return "";
      }
      if (this.params.getUserGroupMap()) {
        if (
          this.params.getUserGroupMap()[this.params.userGroupType][
            this.params.value
          ]
        ) {
          return this.params.getUserGroupMap()[this.params.userGroupType][
            this.params.value
          ][this.params.userGroupAttr];
        } else if (this.params.value === "9C92E891E9AE534DB685737DE467A9D0") {
          return this.params.getUserGroupMap()[
            "9C92E891E9AE534DB685737DE467A9D0"
          ][this.params.userGroupAttr];
        } else {
          return this.params.value;
        }
      } else {
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
  },
});

let dynamicDigitalRender = Vue.extend({
  template: '<ICountUp :delay="delay" :endVal="endVal" :options="options"/>',
  components: {
    ICountUp,
  },
  data() {
    return {
      delay: 1000, //延迟执行时间
      endVal: "", //最终值
      options: {
        useEasing: false,
        useGrouping: false,
        separator: ",",
        decimal: ".",
        prefix: "",
        suffix: "",
      },
    };
  },
  mounted() {
    this.endVal = this.params.value;
  },
  watch: {
    "params.value"() {
      this.endVal = this.params.value;
    },
  },
});

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
    <ButtonGroup v-for="item in operationParams">
      <Button :style="transferedStyle(item)"
              :disabled="item.disabled"
              :icon="item.icon"
              :shape="shape(item)"
              :type="item.type"
              size="small">{{ item.uniLabel }}
      </Button>
    </ButtonGroup>
    </div>
  `,
  props: ["config"],
  data() {
    return {
      operationParams: [],
    };
  },
  mounted() {
    this.operationParams = this.config.operationParams;
  },
  computed: {},
  methods: {
    shape(item) {
      if (item.shape) {
        return "circle";
      } else {
        return "true";
      }
    },
    disabled(item) {
      return item.disabled;
    },
    transferedStyle(item) {
      return `margin-left: 3px; margin-right: 3px; color:${item.color};`;
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
