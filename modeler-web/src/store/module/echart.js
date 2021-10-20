import axios from "axios";
// initial state
const state = {
  Entities: {
    "住友": {
      objects: {
        1: {

        }

      }
    }
  }
};

// getters
const getters = {
  getViewData: state => (params) => {
    console.log('进来啊',params);
    var objs = state.Entities[params.targetClass].objects;
    console.log("objs",objs);
    var arr = [];
    var attrs = [];
    for (let oid in objs) {
      for (let attr in objs[oid]) {
        attrs.push(attr);
      }
      break;
    }
    arr.push(attrs);
    for (let oid in objs) {
      var values = [];
      for (let attr of attrs) {
        values.push(objs[oid][attr]);
      }
      arr.push(values);
    }

    return arr
  },
  getViewDataByAttrs: state => (params) => {
    var objs = state.Entities[params.targetClass].objects;
    var arr = [];
    if (params.attrs.length < 1) {
      return arr;
    }
    arr.push(params.attrs);
    for (let oid in objs) {
      var values = [];
      for (let attr of params.attrs) {
        values.push(objs[oid][attr]);
      }
      arr.push(values);
    }

    var hash = [];
    var hashdata = [];
    for (var i = 0; i < arr.length; i++) {
      var arrstr = JSON.stringify(arr[i]);
      if (hash.indexOf(arrstr) == -1) {
        hash.push(arrstr);
        hashdata.push(arr[i]);
      }

    }
    return hashdata
  },
}

// mutations
const mutations = {
  /**
   *@description 新增||修改 实体类 对象
   *@method addEntityObj
   *@param {*} state
   *@param {object} params = {className:'',obj:[]}
   */
  addEntityObj(state, params) {
    console.log('mutation',params);
    if (!(params.targetClass in state.Entities)){
      state.Entities[params.targetClass] = {
        basic: {},
        objects: {},
        attributes: {},
        forms: {},
        query: {},
        left_relations: [],
        right_relations: [],
        resources: [],
      };
    }

    let objs = params.obj;
	var myobjs={};
    for (let i in objs) {
      let obj = objs[i];
      let oid = obj['oid'];
      myobjs[oid]=obj;
    }
	state.Entities[params.targetClass].objects=myobjs;
    console.log("state.Entities[params.targetClass] ",state.Entities[params.targetClass] );
  },
}

// actions
const actions = {
  getViewDataAction({
    commit
  }, param) {
    axios.get('http://192.168.1.114:8888/test/getall').then(function (res) {
      param.obj = res.data;
      console.log("action getView",param.obj);
      commit('addEntityObj', param);
    }).catch(function (err) {
        console.warn(err)
      alert("出错了3");
    });
  },
  getViewDataActionCondition({
    commit
  }, param) {
    axios.get('http://192.168.1.114:8888/test/getall').then(function (res) {
      param.obj = res.data;
      commit('addEntityObj', param);
    }).catch(function () {
      alert("出错了4");
    });
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
