import {
  getEobj,getEJobj,getView,updateView,createView,createEobj,editEobj,delEobj,cudBatch,toBeNextCreate,
  relationsObjectsCreate,relationsCreate,relationsDelete,rightObjects,rightRelations,
  deleteView,createEJobj,editEJobj,delEJobj,delRJobj
} from "@/api/others";
import { getEntity } from "@/api/data-model/EntityModeling";
import { getRelation } from '@/api/data-model/RelationModeling';
import AttributesLib, { getAttribute as _getAttribute} from '@/api/data-model/AttributesLib';

function checkQuery(obj, query) {
  let flag = true;
  try {
    let i = query.substring(4);
    i = i.replace(/obj\./g, "plt_").replace(/plt_/g, "");
    if (i != "") {
      i = i.split("and");
      i.forEach(x => {
        if (!flag) return;
        x = x.split("=");
        let x1 = x[0];
        let x2 = x[1];
        while(x1[0] == " ") x1 = x1.substring(1);
        while(x1[x1.length-1] == " ") x1 = x1.substring(0, x1.length-1);
        while(x2[0] == " ") x2 = x2.substring(1);
        while(x2[x2.length-1] == " ") x2 = x2.substring(0, x2.length-1);
        if(x2[0] == "'" || x2[0] == '"') x2 = x2.substring(1, x2.length-1);
        if (obj[x1] + "" != x2) {
          flag = false;
        }
      })
    }
  } catch (e) {
    console.log(e);
    flag = false;
  }
  return flag;
}

// initial state
const state = {
  //   属性
  Attributes: {
    // version: {

    // }
  },
  // class-属性映射表
  AttributesClassMap: {
    // User: {

    // }
  },
  //单对象下拉框测试用store
  SingleClass: {

  },
  //   实体类
  Entities: {
    // Device: {
    //   //  <= 实体类的名称 Device
    //   basic: {
    //
    //    },
    //   // 以上是实体类拥有的基本属性
    //   attributes: [
    //     // 实体类上绑定的属性的列表
    //   ],
    //   objects: {
    //     // 查询到的实体类对象 具体的数据
    //   },
    //   forms: {},
    //   query: {},
    //   left_relations: [], // 以实体类为右类的关联类
    //   right_relations: [],
    //   resources: [],
    // }
  },

  // 关联类
  Relations: {
    // Class: {
    //   basic: {
    //   },
    //   attributes:[
    //   ],
    //   objects: {
    //   },
    //   left_objects: {},
    //   right_objects: {},
    // }
  },
  // 资源类
  Resources: {
    // Class: {
    //   basic: {
    //   },
    //   attributes: [
    //   ],
    //   objects: {
    //   }
    // }
  }
};

// getters
const getters = {
  Attributes: state => name => {
    if (name == null) {
      return Object.keys(state.Attributes).map(x => state.Attributes[x]);
    } else {
      return name in state.Attributes ? state.Attributes[name] : null;
    }
  },
  AttributesByClass: state => name => {
    if (name == null) {
      return Object.keys(state.AttributesClassMap).map(x => state.AttributesClassMap[x]);
    } else {
      return name in state.AttributesClassMap ? state.AttributesClassMap[name] : [];
    }
  },
  //FIXME 测试能否修复单对像下拉框崩溃问题
  singleObjectSelectByClass: state => name => {
    if (name == null) {
      return Object.keys(state.SingleClass).map(x => state.SingleClass[x]);
    } else {
      return name in state.SingleClass ? state.SingleClass[name] : [];
    }
  },
  //获取实体类
  Entities: state => targetClass => {
    if (targetClass == null) {
      return Object.keys(state.Entities).map(x => state.Entities[x].basic);
    } else {
      return targetClass in state.Entities ? state.Entities[targetClass].basic : null;
    }
  },
  // 实体类单个对象
  EntitySingle: state => (targetClass, id) =>
    targetClass in state.Entities && id in state.Entities[targetClass].objects ? state.Entities[targetClass].objects[id] : null,
  // 实体类对象列表
  EntityList: state => targetClass => targetClass in state.Entities ? Object.keys(state.Entities[targetClass].objects) : null,
  // 实体类的属性类列表
  EntityAttrList: state => targetClass => targetClass in state.Entities ? state.Entities[targetClass].attributes.map(x => state.Attributes[x]) : null,
  // 获取实体类对象的单个属性值
  EntityAttrSingle: state => (targetClass, id, attrName) =>
     targetClass in state.Entities
     && id in state.Entities[targetClass].objects
     && attrName in state.Entities[targetClass].objects[id] ?
     state.Entities[targetClass].objects[id][attrName] :
     null,
  // 获取实体类表单名列表
  EntityFormList: state => targetClass => targetClass in state.Entities ? Object.keys(state.Entities[targetClass].forms) : null,
  // 获取实体类表单json
  EntityForm: state => (targetClass, formName, deviceType) => {
    deviceType = deviceType || 'actPc';
    if (targetClass in state.Entities && formName in state.Entities[targetClass].forms) {
      let types = Object.keys(state.Entities[targetClass].forms[formName]);
      if (types.indexOf(deviceType) == -1) {
        deviceType = types[0];
      }
      return state.Entities[targetClass].forms[formName][deviceType];
    } else return null;
  },
  EntityFormS: state => (targetClass, formName, deviceType) => targetClass in state.Entities && formName in state.Entities[targetClass].forms ?
    state.Entities[targetClass].forms[formName][deviceType || 'actPc'] : null,

  // 获取实体类BasicInfo
  EntityFormBasicInfo: state => (targetClass, formName) => {
    return targetClass in state.Entities && formName in state.Entities[targetClass].forms ?
      state.Entities[targetClass].forms[formName]['basicInfo'] : null
  },
  // 获取实体类的右关联类列表
  RightRelations: state => targetClass => targetClass in state.Entities ?
    state.Entities[targetClass].right_relations.map(x => ({
      basic: state.Relations[x].basic,
      attributes: state.Relations[x].attributes.map(x => state.Attributes[x])
    })) : null,
  // 获取实体类的左关联类列表
  LeftRelations: state => targetClass => targetClass in state.Entities ?
    state.Entities[targetClass].left_relations.map(x => ({
      basic: state.Relations[x].basic,
      attributes: state.Relations[x].attributes.map(x => state.Attributes[x])
   })) : null,
  // 获取实体类的右关联实体类列表
  RightEntities: state => targetClass => targetClass in state.Entities ?
    state.Entities[targetClass].right_relations.map(x => state.Relations[x].basic.rightClass).map(x => ({
      basic: state.Entities[x].basic,
      attributes: state.Entities[x].attributes.map(x => state.Attributes[x])
    })) : null,
  // 获取实体类的左关联实体类列表
  LeftEntities: state => targetClass => targetClass in state.Entities ?
    state.Entities[targetClass].left_relations.map(x => state.Relations[x].basic.leftClass).map(x => ({
      basic: state.Entities[x].basic,
      attributes: state.Entities[x].attributes.map(x => state.Attributes[x])
   })) : null,
  // 获取关联类
  Relations: state => targetClass => {
    if (targetClass == null) {
      return Object.keys(state.Relations).map(x => state.Relations[x].basic);
    } else {
      return targetClass in state.Relations ? state.Relations[targetClass].basic : null;
    }
  },
  // 关联类单个对象
  RelationSingle: state => (targetClass, id) => targetClass in state.Relations && id in state.Relations[targetClass].objects ?
    state.Relations[targetClass].objects[id] : null,
  // 关联类带左右类对象
  RelationSingleA: state => (targetClass, id) => {
    if (targetClass in state.Relations && id in state.Relations[targetClass].objects) {
      let rel = id in state.Relations[targetClass].objects ? state.Relations[targetClass].objects[id] : null;
      if (rel) {
        let left = state.Entities[rel.leftClass].objects[rel.leftOid];
        let right = state.Entities[rel.rightClass].objects[rel.rightOid];
        let obj = {};
        for (var i in rel) obj["relation_" + i] = rel[i];
        for (var i in left) obj["left_" + i] = left[i];
        for (var i in right) obj["right_" + i] = right[i];
        return obj;
      }
    }
    return null;
  },
  // 关联类属性列表
  RelationAttrList: state => targetClass => targetClass in state.Relations ? state.Relations[targetClass].attributes.map(x => state.Attributes[x]) : null,
  // 关联类对象列表
  RelationList: state => targetClass => targetClass in state.Relations ? state.Relations[targetClass].objects : null,
  // 获取关联类表单名列表
  RelationFormList: state => targetClass => targetClass in state.Relations ? Object.keys(state.Relations[targetClass].forms) : null,
  // 获取关联类表单json
  RelationForm: state => (targetClass, formName, deviceType) => {
    deviceType = deviceType || 'actPc';
    if (targetClass in state.Relations && formName in state.Relations[targetClass].forms) {
      let types = Object.keys(state.Relations[targetClass].forms[formName]);
      if (types.indexOf(deviceType) == -1) {
        deviceType = types[0];
      }
      return state.Relations[targetClass].forms[formName][deviceType];
    } else return null;
  },
  RelationFormS: state => (targetClass, formName, deviceType) => targetClass in state.Relations && formName in state.Relations[targetClass].forms ?
    state.Relations[targetClass].forms[formName][deviceType || 'actPc'] : null,

  RelationFormBasicInfo: state => (targetClass, formName) => targetClass in state.Relations && formName in state.Relations[targetClass].forms ?
    state.Relations[targetClass].forms[formName]['basicInfo'] : null,
  // // 关联类对象的属性对象列表
  // RelationAttrList: state => targetClass => {
  //   return state.Relations[targetClass].attributes;
  // },
  // // 获取关联类对象的单个属性值
  // RelationAttrSingle: state => (targetClass, id, attrName) => {
  //   return state.Entities[targetClass].objects[id][attrName];
  // },
  // 获取实体对象的右实体对象
  RightObj: (state, getters) => (targetClass, id, relationClass) =>
    targetClass in state.Entities && relationClass in state.Relations &&
    id in state.Entities[targetClass].objects &&
    state.Entities[targetClass].right_relations.indexOf(relationClass) > -1 &&
    id in state.Relations[relationClass].left_objects ?
    state.Relations[relationClass].left_objects[id].map(x =>
      state.Entities[state.Relations[relationClass].basic.rightClass].objects[state.Relations[relationClass].objects[x].rightOid]) : null,
  // 获取实体对象的左实体对象
  LeftObj: (state, getters) => (targetClass, id, relationClass) =>
    targetClass in state.Entities && relationClass in state.Relations &&
    id in state.Entities[targetClass].objects &&
    state.Entities[targetClass].left_relations.indexOf(relationClass) > -1 &&
    id in state.Relations[relationClass].right_objects ?
    state.Relations[relationClass].right_objects[id].map(x =>
      state.Entities[state.Relations[relationClass].basic.leftClass].objects[state.Relations[relationClass].objects[x].leftOid]) : null,
  // // 根据一侧的实体类获取另一侧实体类以及关联的属性和对象，返回值包括实体对象和关联对象
  // AnotherClass: (state, getters) => classname => {
  //   for (let item in getters.RelationAttrList) {
  //     if (getters.RelationSingle[item].objects.leftClass == classname) {
  //       return {
  //         relation: getters.RelationSingle[item],
  //         leftClass: getters.EntitySingle[
  //           getters.RelationSingle[item].objects.rightClass
  //           ]
  //       };
  //     } else if (getters.RelationSingle[item].objects.rightClass == classname) {
  //       return {
  //         relation: getters.RelationSingle[item],
  //         leftClass: getters.EntitySingle[getters.RelationSingle[item].objects.leftClass]
  //       };
  //     } else {
  //       return;
  //     }
  //   }
  // },
  // // 资源类
  // // 资源类单个对象
  // ResourceSingle: state => state.Resources,
  // // 资源类对象列表
  // ResourceList: state => {
  //   let key = Object.keys(state.Resources);
  //   return Object.keys(state.Resources[key[0]].objects);
  // },
  // // 资源类对象的属性对象列表
  // ResourceAttrList: state => {
  //   let key = Object.keys(state.Resources);
  //   return state.Resources[key[0]].attributes;
  // },
  // // 获取资源类对象的单个属性值
  // ResourceAttrSingle: state => {
  //   let key = Object.keys(state.Resources);
  //   return state.Resources[key[0]].attributes;
  // },
  // 根据实体类的资源绑定信息 得到 资源的取值
  // ???
  QueryResult: state => queryData => {
    let _query = queryData.query;
    if (!_query) _query = {};
    if (typeof _query == "string") _query = {query: _query};
    let query = "query" in _query ? _query.query : "";
    // query = query.replace(/"/g,"'");
    var i = 0;
    while(i < query.length && query[i] == " ") i++;
    query = query.substring(i);
    if (query.length > 0 && query[0] == "'") query = query.substring(1, query.length-1);
    if (query.length > 0 && query.substring(0, 5) === "order") query = "and 1=1 " + query;
    // if (query.length > 0 && query.substring(0, 10) != "datasetID:" && query.substring(0, 12) != "nativequery:" && query.substring(0, 3) != "and") query = "and " + query;
    let flag = false;
    if (_query.type && _query.type == "relation") {
      query = "relation." + queryData.relationClass + "::" + query;
      flag = true;
    }
    query = "startIndex" in _query && "pageSize" in _query ? query + ":" + _query.startIndex + ":" + _query.pageSize : query;
    return flag ?
    ( queryData.relationClass in state.Relations && query in state.Relations[queryData.relationClass].query ?
      state.Relations[queryData.relationClass].query[query] : null )
    : ( queryData.targetClass in state.Entities && query in state.Entities[queryData.targetClass].query ?
    state.Entities[queryData.targetClass].query[query] : null );
  },
  QueryResultAll: state => queryData => {
    let _query = queryData.query;
    if (!_query) _query = {};
    if (typeof _query == "string") _query = {query: _query};
    let query = "query" in _query ? _query.query : "";
    // query = query.replace(/"/g,"'");
    var i = 0;
    while(i < query.length && query[i] == " ") i++;
    query = query.substring(i);
    if (query.length > 0 && query[0] == "'") query = query.substring(1, query.length-1);
    if (query.length > 0 && query.substring(0, 5) === "order") query = "and 1=1 " + query;
    // if (query.length > 0 && query.substring(0, 10) != "datasetID:" && query.substring(0, 12) != "nativequery:" && query.substring(0, 3) != "and") query = "and " + query;
    let flag = false;
    if (_query.type && _query.type == "relation") {
      query = "relation." + queryData.relationClass + "::" + query;
      flag = true;
    };
    query = "startIndex" in _query && "pageSize" in _query ? query + ":" + _query.startIndex + ":" + _query.pageSize : query;
    return flag ? ( queryData.relationClass in state.Relations && query in state.Relations[queryData.relationClass].query ?
    state.Relations[queryData.relationClass].query[query].map(x => {
        let rel = x in state.Relations[queryData.relationClass].objects ? state.Relations[queryData.relationClass].objects[x] : null;
        if (rel) {
          let left = state.Entities[queryData.leftClass].objects[rel.leftOid];
          let right = state.Entities[queryData.rightClass].objects[rel.rightOid];
          let obj = {};
          for (var i in rel) obj["relation_" + i] = rel[i];
          for (var i in left) obj["left_" + i] = left[i];
          for (var i in right) obj["right_" + i] = right[i];
          return obj;
        } else return null;
    }) : null ) :
    ( queryData.targetClass in state.Entities && query in state.Entities[queryData.targetClass].query ?
    state.Entities[queryData.targetClass].query[query].map(x => state.Entities[queryData.targetClass].objects[x]) : null );
    // return queryData.targetClass in state.Entities && query in state.Entities[queryData.targetClass].query ?
    // state.Entities[queryData.targetClass].query[query].map(x => {
    //   if (flag) {
    //     let rel = x in state.Relations[queryData.relationClass].objects ? state.Relations[queryData.relationClass].objects[x] : null;
    //     if (rel) {
    //       let left = state.Entities[queryData.leftClass].objects[rel.leftOid];
    //       let right = state.Entities[queryData.rightClass].objects[rel.rightOid];
    //       let obj = {};
    //       for (var i in rel) obj[queryData.relationClass + "__" + i] = rel[i];
    //       for (var i in left) obj[queryData.leftClass + "__" + i] = left[i];
    //       for (var i in right) obj[queryData.rightClass + "__" + i] = right[i];
    //       return obj;
    //     }
    //   } else {
    //     return state.Entities[queryData.targetClass].objects[x];
    //   }
    // }) : null;
  },
  QueryResultList: state => queryData => {
    let _query = queryData.query;
    if (!_query) _query = {};
    if (typeof _query == "string") _query = {query: _query};
    let query = "query" in _query ? _query.query : "";
    // query = query.replace(/"/g,"'");
    var i = 0;
    while(i < query.length && query[i] == " ") i++;
    query = query.substring(i);
    if (query.length > 0 && query[0] == "'") query = query.substring(1, query.length-1);
    // if (query.length > 0 && query.substring(0, 10) != "datasetID:" && query.substring(0, 12) != "nativequery:" && query.substring(0, 3) != "and") query = "and " + query;
    let flag = false;
    if (_query.type && _query.type == "relation") {
      query = "relation." + queryData.relationClass + "::" + query;
      flag = true;
    };
    return queryData.targetClass in state.Entities && query in state.Entities[queryData.targetClass].querys ?
      state.Entities[queryData.targetClass].querys[query] : null;
  },
  getViewData: state => (params) => {
    var objs = state.Entities[params.targetClass].objects;
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
  }
};

// mutations
const mutations = {
  /**
   *@description 新增||修改 实体类
   *@method addEntity
   *@param {*} state
   *@param {object} params = {className:'',obj:[]}
   */
  addEntity(state, params) {
    if (!(params.className in state.Entities))
      state.Entities[params.className] = {
        basic: {},
        objects: {},
        attributes: [],
        forms: {},
        query: {},
        querys: {},
        left_relations: [],
        right_relations: [],
        resources: [],
      };
    if ("basic" in params) state.Entities[params.className].basic = params.basic;
    // if ("obj" in params) {
    //   for (var i = 0;i < params.obj.length;i++) {
    //     state.Entities[params.className].objects[params.obj[i].oid] = params.obj[i];
    //   }
    // }
    if ("attr" in params) {
      state.Entities[params.className].attributes = []
      for (var i = 0; params.attr && i < params.attr.length;i++) {
        state.Entities[params.className].attributes.push(params.attr[i].attributeName);
        state.Attributes[params.attr[i].attributeName] = params.attr[i];
      }
    }
  },

  /**
   *@description 新增||修改 实体类 对象
   *@method addEntityObj
   *@param {*} state
   *@param {object} params = {className:'',obj:[]}
   */
  addEntityObj(state, params) {
    if (!(params.className in state.Entities))
      state.Entities[params.className] = {
        basic: {},
        objects: {},
        attributes: [],
        forms: {},
        query: {},
        querys: {},
        left_relations: [],
        right_relations: [],
        resources: [],
        test: [],
      };
    if (params.obj && params.obj.oid) {
      if (!params.query) {
        for (var j in state.Entities[params.className].query) {
          let flag = checkQuery(params.obj, j);
          let idx = state.Entities[params.className].query[j].indexOf(params.obj.oid);
          console.log("t:", j, flag, idx, state.Entities[params.className]);
          if (flag) {
            if (idx == -1) {
              state.Entities[params.className].query[j].push(params.obj.oid);
              idx = state.Entities[params.className].query[j].length - 1;
            }
            if (!(j in state.Entities[params.className].querys)) state.Entities[params.className].querys[j] = [];
            if (idx >= state.Entities[params.className].querys[j].length) {
              state.Entities[params.className].querys[j].push(params.obj);
            } else {
              for (var x in params.obj) {
                state.Entities[params.className].querys[j][idx][x] = params.obj[x];
              }
            }
          } else if (idx > -1) {
            state.Entities[params.className].query[j].splice(idx, 1, params.obj.oid);
            state.Entities[params.className].querys[j].splice(idx, 1, params.obj);
          }
          // else if (idx == -1) {
          //   state.Entities[params.className].query[j].push(params.obj.oid);
          //   idx = state.Entities[params.className].query[j].length - 1;
          //   if (!(j in state.Entities[params.className].querys)) state.Entities[params.className].querys[j] = [];
          //   if (idx >= state.Entities[params.className].querys[j].length) {
          //     state.Entities[params.className].querys[j].push(params.obj);
          //   } else {
          //     for (var x in params.obj) {
          //       state.Entities[params.className].querys[j][idx][x] = params.obj[x];
          //     }
          //   }
          // }
        }
      }
      state.Entities[params.className].objects[params.obj.oid] = params.obj;
    }
    // let objs = params.obj;
    // for(let i in objs){
    //   let obj = objs[i];
    //   let oid = obj['oid'];
    //   state.Entities[params.className].objects[oid] = obj;

    // }
  },

  /**
   *@description 新增||修改 类属性表 对象
   *@method addAttributeByClassObj
   *@param {*} state
   *@param {object} params = {className:'',attributeList:[]}
   */
  addAttributeByClassObj(state, params) {
    if (!(params.className in state.AttributesClassMap))
      state.AttributesClassMap[params.className] = [];
    if (params.attributeList && params.attributeList.length !== 0) {
      state.AttributesClassMap[params.className] = params.attributeList;
    }
  },

  /**
   *@description 新增||修改 单对象下拉框请求 对象
   *@method addAttributeByClassObj
   *@param {*} state
   *@param {object} params = {className:'',objList:[]}
   * FIXME 换为handleQueryData
   */
  addSingleObjectByClass(state, params) {
    if (!(params.className in state.SingleClass)){
      state.SingleClass[params.className] = [];
      state.SingleClass[params.className].push({
        query: params.query,
        objList: params.objList
      });
    }
    if (params.objList && params.objList.length !== 0 && !!params.query) {
      state.SingleClass[params.className].filter(item => item.query === params.query).length == 0
        ? state.SingleClass[params.className].push({
          query: params.query,
          objList: params.objList
        })
        : state.SingleClass[params.className].filter(item => item.query === params.query).objList = params.objList;
    }
  },

  // /**
  //  *@description 新增||修改 实体类 属性
  //  *@method updateEntityAttr
  //  *@param {*} state
  //  *@param {object}params = {
  //  *   classname:'', 实体类名
  //  *   attrName: '', 属性名
  //  *   attrVal;'' 属性值
  //  * }

  //  */
  // updateEntityAttr(state, params) {
  //   if (!(params.className in state.Entities))
  //     return alert("修改实体类属性失败!");
  //   state.Entities[params.className].objects[params.attrName] = params.attrVal;
  // },

  /**
   *@description 新增||修改 表单json
   *@method addEntityForm
   *@param {*} state
   *@param {object}params
   * params = {
   *   classname:'', 实体名
   *   formName: '', 表单名
   *   formData;'' 表单json字符串
   * }
   */
  addEntityForm(state, params) {
    if (params.isRelation) {
      if (!(params.className in state.Relations))
        state.Relations[params.className] = {
          basic: {},
          objects: {},
          attributes: [],
          forms: {},
          query: {},
          querys: {},
          left_objects: {},
          right_objects: {}
        };
      if (!(params.formName in state.Relations[params.className])) {
        state.Relations[params.className].forms[params.formName] = {};
      }
      state.Relations[params.className].forms[params.formName][params.deviceType || 'actPc'] = params.formData;
      state.Relations[params.className].forms[params.formName].basicInfo = params.basicInfo;
    } else {
      if (!(params.className in state.Entities))
        state.Entities[params.className] = {
          basic: {},
          objects: {},
          attributes: [],
          forms: {},
          query: {},
          querys: {},
          left_relations: [],
          right_relations: [],
          resources: [],
        };
        if (!(params.formName in state.Entities[params.className]) || (['basic', 'objects', 'attributes', 'forms', 'query', 'left_relations', 'right_relations', 'resources'].includes(params.formName) && params.formData == '')) {
          state.Entities[params.className].forms[params.formName] = {};
        }

        if(['basic', 'objects', 'attributes', 'forms', 'query', 'left_relations', 'right_relations', 'resources'].includes(params.formName) && params.formData != '' && state.Entities[params.className].forms[params.formName] == undefined) {
          state.Entities[params.className].forms[params.formName] = {}
          state.Entities[params.className].forms[params.formName][params.deviceType || 'actPc'] = params.formData;
          state.Entities[params.className].forms[params.formName].basicInfo = params.basicInfo;
        }
      state.Entities[params.className].forms[params.formName][params.deviceType || 'actPc'] = params.formData;
      state.Entities[params.className].forms[params.formName].basicInfo = params.basicInfo;
    }
  },


  /**
   *@description 新增||修改 表单 query 更新查询结果
   *@method updateQueryResult
   *@param {*} state
   *@param {object}params
   * params = {
   *   targetClass:'', 实体 类名称
   *   data:'', 查询结果,id列表
   *   query:'' 表单query
   */
  updateQueryResult(state, params) {
    if (params.isRelation) {
      if (!(params.targetClass in state.Relations))
      state.Relations[params.targetClass] = {
        basic: {},
        objects: {},
        attributes: [],
        forms: {},
        query: {},
        querys: {},
        left_objects: {},
        right_objects: {},
      };
      state.Relations[params.targetClass].query[params.query] = params.data;
    } else {
      if (!(params.targetClass in state.Entities))
        state.Entities[params.targetClass] = {
          basic: {},
          objects: {},
          attributes: [],
          forms: {},
          query: {},
          querys: {},
          left_relations: [],
          right_relations: [],
          resources: [],
        };
      state.Entities[params.targetClass].query[params.query] = params.data;
      if (!(params.query in state.Entities[params.targetClass].querys)) state.Entities[params.targetClass].querys[params.query] = [];
      else state.Entities[params.targetClass].querys[params.query].splice(0, state.Entities[params.targetClass].querys[params.query].length);
      params.data.forEach(x => {
        state.Entities[params.targetClass].querys[params.query].push(
          state.Entities[params.targetClass].objects[x]
        );
      })
    }
  },

  /**
   *@description 新增||修改 关联类
   *@method addRelation
   *@param {*} state
   *@param {object}params
   * params = {className:'', basic: {}}
   */
  addRelation(state, params) {
    if (!(params.className in state.Relations))
      state.Relations[params.className] = {
        basic: {},
        objects: {},
        attributes: [],
        forms: {},
        query: {},
        querys: {},
        left_objects: {},
        right_objects: {}
      };
    if ("basic" in params) {
      state.Relations[params.className].basic = params.basic;
      if (!(params.basic.leftClass in state.Entities)) {
        state.Entities[params.basic.leftClass] = {
          basic: {},
          objects: {},
          attributes: [],
          forms: {},
          query: {},
          querys: {},
          left_relations: [],
          right_relations: [],
          resources: [],
        };
      }
      if (state.Entities[params.basic.leftClass].right_relations.indexOf(params.className) == -1)
        state.Entities[params.basic.leftClass].right_relations.push(params.className);
      if (!(params.basic.rightClass in state.Entities)) {
        state.Entities[params.basic.rightClass] = {
          basic: {},
          objects: {},
          attributes: [],
          forms: {},
          query: {},
          querys: {},
          left_relations: [],
          right_relations: [],
          resources: [],
        };
      }
      if (state.Entities[params.basic.rightClass].left_relations.indexOf(params.className) == -1)
        state.Entities[params.basic.rightClass].left_relations.push(params.className);
    }
    if ("attr" in params) {
      state.Relations[params.className].attributes = []
      for (var i = 0;i < params.attr.length;i++) {
        state.Relations[params.className].attributes.push(params.attr[i].attributeName);
        state.Attributes[params.attr[i].attributeName] = params.attr[i];
      }
    }
  },

  /**
   *@description 新增 / 修改 关联类 对象
   *@method addRelationChild
   *@param {*} state
   *@param {object}params
   * params={
   *    newChildName  关联类名称
   *    newChild 关联对象 值 object类型
   *}
   * @return {返回值类型} 返回值说明
   */
  addRelationChild(state, params) {
    if (!(params.newChildName in state.Relations))
      state.Relations[params.newChildName] = {
        basic: {},
        objects: {},
        attributes: [],
        forms: {},
        query: {},
        left_objects: {},
        right_objects: {}
      };
    //if (!(params.newChildName in state.Relations)) return;
    state.Relations[params.newChildName].objects[params.newChild.oid] = params.newChild;
    if (!(params.newChild.leftOid in state.Relations[params.newChildName].left_objects))
      state.Relations[params.newChildName].left_objects[params.newChild.leftOid] = []
    state.Relations[params.newChildName].left_objects[params.newChild.leftOid].push(params.newChild.oid);
    if (!(params.newChild.rightOid in state.Relations[params.newChildName].right_objects))
      state.Relations[params.newChildName].right_objects[params.newChild.rightOid] = []
    state.Relations[params.newChildName].right_objects[params.newChild.rightOid].push(params.newChild.oid);
  },

  // // 新增 资源类 对象
  // addResourceChild(state, {
  //   newChildName,
  //   newChild
  // }) {
  //   state.Resource[newChildName] = newChild;
  // },

  // // 更新资源类 对象
  // updataResourceobj(state, objName, obj) {
  //   state.Resources[objName] = obj;
  // },

  /**
   *@description 删除 实体类
   *@method deletEntity
   *@param {*} state
   *@param {object} params
   *  className  实体类 名称
   * @return {返回值类型} 返回值说明
   */
  deletEntity(state, className) {
    delete state.Entities[className];
  },

  /**
   *@description 删除 实体类 对象
   *@method deletEntityobj
   *@param {*} state
   *@param {object} params
   *  params.className  实体类 名称
   *  params.objName  实体类对象 名称
   * @return {返回值类型} 返回值说明
   */
  // 删除实体类 对象
  deletEntityobj(state, params) {
    try {
      // 删除对象
      delete state.Entities[params.className].objects[params.oid];
      // 删除查询结果
      for (var i in state.Entities[params.className].query) {
        var idx = state.Entities[params.className].query[i].indexOf(params.oid);
        if (idx > -1) {
          state.Entities[params.className].query[i].splice(idx, 1);
          state.Entities[params.className].querys[i].splice(idx, 1);
          console.log("delete:", params.oid);
        }
      }
      // 删除关联对象
      state.Entities[params.className].left_relations.forEach(x => {
        if (params.oid in state.Relations[x].right_objects) {
          state.Relations[x].right_objects[params.oid].forEach(y => {
            if (y in state.Relations[x].objects) delete state.Relations[x].objects[y]
          })
          delete state.Relations[x].right_objects[params.oid];
        }
      })
      state.Entities[params.className].right_relations.forEach(x => {
        if (params.oid in state.Relations[x].left_objects) {
          state.Relations[x].left_objects[params.oid].forEach(y => {
            if (y in state.Relations[x].objects) delete state.Relations[x].objects[y]
          })
          delete state.Relation[x].left_objects[params.oid];
        }
      })
    } catch(_) {
      console.log("delete obj error");
    }
  },

  /**
   *@description 删除 关联类
   *@method deletRelation
   *@param {*} state
   *@param {object} className
   *  className  关联类 名称
   * @return {返回值类型} 返回值说明
   */
  deletRelation(state, className) {
    delete state.Relations[className];
  },

  /**
   *@description 删除 关联类 对象
   *@method deletRelationobj
   *@param {*} state
   *@param {object}params
   *  params.className  关联类 名称
   *  params.objName  关联类对象 名称
   * @return {返回值类型} 返回值说明
   */
  // 删除关联类 对象
  deletRelationobj(state, params) {
    if(state.Relations[params.className]){
      delete state.Relations[params.className].objects[params.oid];
      for (var i in state.Relations[params.className].left_objects) {
        var idx = state.Relations[params.className].left_objects[i].indexOf(params.oid);
        if (idx > -1) state.Relations[params.className].left_objects[i].splice(idx, 1);
      }
      for (var i in state.Relations[params.className].right_objects) {
        var idx = state.Relations[params.className].right_objects[i].indexOf(params.oid);
        if (idx > -1) state.Relations[params.className].right_objects[i].splice(idx, 1);
      }
    }
  },

  // 删除表单
  deleteForm(state, params) {
    if (params.className in state.Entities &&
      params.viewName in state.Entities[params.className].forms)
    delete state.Entities[params.className].forms[params.viewName];
  },

  addAttribute(state, obj) {
    state.Attributes[obj.attributeName] = obj;
  },

  resetState(state){
    state = {
      Attributes: {
      },
      AttributesClassMap: {
      },
      SingleClass: {

      },
      Entities: {
      },

      Relations: {
      },
      Resources: {
      }
    };
  }
};

// actions
const actions = {
  async getAttribute({state, commit}, name) {
    if (name in state.Attributes) return state.Attributes[name];
    let res = await _getAttribute(name);
    if (res.data) {
      commit('addAttribute', res.data);
      return res.data;
    }
    return null;
  },

  // 获取类-属性表
  async getAttributeClassMap({state, commit}, name) {
    if (name in state.AttributesClassMap) return state.AttributesClassMap[name];
    // console.log(AttributesLib.getAttributeByClass())
    if(name && name != undefined) {

      let res = await AttributesLib.getAttributeByClass(name);
      if (res.data) {
        commit('addAttributeByClassObj', {
          className: name,
          attributeList: res.data
        });
        return res.data;
      }
      return null;

    }

  },
  // 更新表单
  async updateFView({state, commit}, obj) {
    let res = await getView(obj.className, obj.viewName);
    let flag = 0;
    try {
      if (res.data.data) {
        obj.oid = res.data.data.oid;
        await updateView(obj);
        flag = 1;
      } else {
        await createView([obj]);
        flag = 2;
      }
      commit("addEntityForm", {
        className: obj.className,
        formName: obj.viewName,
        formData: obj.v3Content
      });
    } catch (e) {
      flag = 0;
    }
    return flag;
  },
  // 删除表单
  async deleteFView({state, commit}, obj) {
    let res = await deleteView(obj.oid);
    commit('deleteForm', obj);
  },
  // 查询实体类
  async queryEntity({state, commit, getters}, targetClass) {
    // let res = getters.Entities(targetClass);
    // if (res) return res;
    if (targetClass in state.Entities && state.Entities[targetClass].attributes.length > 0)
      return getters.Entities(targetClass);
    let res = await getEntity(targetClass);
    res = res.data;
    let attr = res.attributes;
    delete res.attributes;
    commit('addEntity', {
      className: targetClass,
      basic: res,
      attr: attr
    })
    return getters.Entities(targetClass);
  },
  // 查询关联类
  async queryRelation({state, commit, getters}, targetClass) {
    // let res = getters.Relations(targetClass);
    // if (res) return res;
    if (targetClass in state.Relations && state.Relations[targetClass].attributes.length > 0)
      return getters.Relations(targetClass);
    let res = await getRelation(targetClass);
    res = res.data;
    let attr = res.attributes;
    delete res.attributes;
    commit('addRelation', {
      className: targetClass,
      basic: res,
      attr: attr
    })
    return getters.Relations(targetClass);
  },
  // //更新实体类
  // addEntityChildAct(commit, targetClass) {
  //   var child = getEntity();
  //   commit("addEntityChild", {
  //     targetClass: targetClass,
  //     child: child
  //   });
  // },
  // 进行查询操作,获取数据
  async handleQueryData({
    state,
    commit,
    getters
  }, queryData) {
    if (!queryData.fresh) {
      let res = getters.QueryResultAll(queryData);
      if (res && res.length !== 0) return res;
    }
    let originalCode = true;  // Decide whether use new code for same funciton
    let _query;  // assigned stuctured query object
    let query;  // query command itself
    if (originalCode) {
      _query = queryData.query;
      if (!_query) _query = {};
      if (typeof _query == "string") _query = {query: _query};
      query = "query" in _query ? _query.query : "";
      // query = query.replace(/"/g,"'");
      var i = 0;
      while(i < query.length && query[i] == " ") i++;
      query = query.substring(i);
      if (query.length > 0 && query[0] == "'") query = query.substring(1, query.length-1);
      if (query.length > 0 && query.substring(0, 5) === "order") query = "and 1=1 " + query;
      // if (query.length > 0 && query.substring(0, 10) != "datasetID:" && query.substring(0, 12) != "nativequery:" && query.substring(0, 3) != "and") query = "and " + query;
      if (_query.type && _query.type == "relation") query = "relation." + queryData.relationClass + "::" + query;
    } else {
      if (queryData.query){
        if (typeof queryData.query == "string"){
          _query = {query: queryData.query};
        } else if (typeof queryData.query == "object"){
          _query = queryData.query;
        }
      } else _query = {};
      query = "query" in _query ? _query.query : "";
      // query = _query.query.replace(/"/g, "'").trim();
      query = _query.query.trim();
      let noQuoteWrap = /^'+|'+$/g;
      query = query.replace(noQuoteWrap, '');
      // if (query.length > 0
      //   && query.substring(0, 10) != "datasetID:"
      //   && query.substring(0, 12) != "nativequery:"
      //   && query.substring(0, 3) != "and")
      //   query = "and " + query;
      if (_query.type && _query.type == "relation") query = "relation." + queryData.relationClass + "::" + query;
    }
    // if (!queryData.fresh && queryData.targetClass in state.Entities && query in state.Entities[queryData.targetClass].query) return;
    // 外部实体类判断
    let nodeCounts = null;
    try {
    // 获取实体类数据
    // var sql = "";
    // if (queryData.query.length > 0) {
    //   sql = "and "
    //   sql = "and obj.oid = '" + targetClass.objs[0] + "'";
    //   for (var i = 1;i < targetClass.objs.length;i++) {
    //     sql += " or obj.oid = '" + targetClass.objs[i] + "'";
    //   }
    // }
    if (_query.type && _query.type == "relation") {
      let res = null;
      if("startIndex" in _query
      && "pageSize" in _query){
       res = await getEJobj(queryData.relationClass, {
        condition: query.substring(query.indexOf("::")+2),
        startIndex: _query.startIndex,
        pageSize: _query.pageSize
        }, queryData.recursiveLevel);
      } else {
        res = await getEJobj(queryData.relationClass, {
          condition: query.substring(query.indexOf("::")+2),
          }, queryData.recursiveLevel);
      }
      const result = res.data.data;
      if(!result && res.data.code === 400){
        return  res.data
      }
      if (result.length == 4) nodeCounts = result[3];
      var _result = [];
      for (var i = 0;i < result[0].length;i++) {
      commit('addEntityObj', {
      className: queryData.leftClass,
      obj: result[0][i],
      query: true,
      })
      }
      for (var i = 0;i < result[2].length;i++) {
      commit('addEntityObj', {
      className: queryData.rightClass,
      obj: result[2][i],
      query: true,
      })
      }
      for (var i = 0;i < result[1].length;i++) {
      commit('addRelationChild', {
      newChildName: queryData.relationClass,
      newChild: result[1][i]
      })
      _result.push(result[1][i].oid)
      }
      commit('updateQueryResult', {
      targetClass: queryData.relationClass,
      query: "startIndex" in _query && "pageSize" in _query ? query + ":" + _query.startIndex + ":" + _query.pageSize : query,
      data: _result,
      isRelation: true
      });
    } else {
      let res = null;
      if("startIndex" in _query
      && "pageSize" in _query){
        res = await getEobj(queryData.targetClass, {
          condition: query,
          startIndex: _query.startIndex,
          pageSize: _query.pageSize
        });
      }else{
        res = await getEobj(queryData.targetClass, {
          condition: query
        });
      }
      const result = res.data.data;
      // console.log("test:",res, query, result);
      if(!result && res.data.code === 400){
        return  res.data
      }
      var _result = [];
      // store添加实体类
      for (var i = 0;i < result.length;i++) {
      commit("addEntityObj", {
      className: queryData.targetClass,
      obj: {
        ...result[i],
        oid: result[i].oid === undefined ? result[i].plt_oid : result[i].oid
      },
      query: true,
      });
      _result.push(result[i].oid === undefined ? result[i].plt_oid : result[i].oid);
      }
      // 添加实体类的query查询筛选项
      commit("updateQueryResult", {
      targetClass: queryData.targetClass,
      query: "startIndex" in _query && "pageSize" in _query ? query + ":" + _query.startIndex + ":" + _query.pageSize : query,
      data: _result
      });
    }
    } catch (e) {
    console.log(e);
    }
    // FIXME: 如果在本方法中修改了查询语句 此处可能引发错误 或者要求query不在函数内进行调整
    let result = getters.QueryResultAll(queryData);
    if (nodeCounts && result) {
      let field1 = null;
      let field2 = null;
      if (query.indexOf("leftclass") > -1) {
        field1 = "right_oid";
        field2 = "right_node_count";
      } else {
        field1 = "left_oid";
        field2 = "left_node_count";
      }
      result.forEach(x => {
        if (x[field1] in nodeCounts) {
          x[field2] = nodeCounts[x[field1]];
        }
      })
    }
    return result;
    },

  async handleQueryForm({
              state,
              commit,
              getters
            }, queryData) {
    if (!queryData.fresh) {
      let res = queryData.isRelation ? getters.RelationFormS(queryData.targetClass, queryData.formName, queryData.deviceType || 'actPc') : getters.EntityFormS(queryData.targetClass, queryData.formName, queryData.deviceType || 'actPc');
      if (res) return res;
    }
    try {
      let res = await getView(queryData.targetClass, queryData.formName, queryData.deviceType);
      console.log(res)
      let json = (res.data.data && res.data.data.v3Content) ? res.data.data.v3Content : "";
      let basicInfo = (res.data.data && res.data.data.basicInfo) ? res.data.data.basicInfo : "";
      commit("addEntityForm", {
        className: queryData.targetClass,
        formName: queryData.formName,
        formData: json,
        isRelation: queryData.isRelation,
        deviceType: queryData.deviceType || 'actPc',
        basicInfo: basicInfo,
      });
    } catch (e) {
      console.log(e);
    }
    return queryData.isRelation ? getters.RelationFormS(queryData.targetClass, queryData.formName, queryData.deviceType || 'actPc') : getters.EntityFormS(queryData.targetClass, queryData.formName, queryData.deviceType || 'actPc');
  },
  //刷新某个实体类所有对象
  async refreshEObj({
                      dispatch,
                      commit,
                      getters
                    }, queryData) {
    try {
      await dispatch('handleQueryData', {...queryData, fresh: true});
      // alert('刷新成功');
      return getters.QueryResultAll(queryData);
      // console.log('qian----objects',state.Entities[targetClass.className].objects);
      // var sql = "";
      // if (targetClass.objs.length > 0) {
      //   sql = "and obj.oid = '" + targetClass.objs[0] + "'";
      //   for (var i = 1;i < targetClass.objs.length;i++) {
      //     sql += " or obj.oid = '" + targetClass.objs[i] + "'";
      //   }
      // }
      // let res = await getEobj(targetClass.className, { condition: sql});
      // var datas = res.data.data;
      // for (var i = 0;i < datas.length;i++) {
      //   commit('addEntityObj', {className: targetClass.className, obj: datas[i]});
      // }
      // let res = await getEobj(targetClass.className);
      // var datas=res.data.data;
      // var arr={};
      // for (var i = 0;i < datas.length;i++) {
      //   arr[datas[i].oid] =datas[i];
      // }
      // targetClass.obj=arr;
      // commit('addEntity',targetClass);
      // console.log('hou----objects',state.Entities[targetClass.className].objects);
    } catch (e) {
      console.log(e);
    }
    return null;
  },
  // 删除某个实体类单对象
  async deleteEObj({
                     dispatch,
                     commit
                   }, queryData) {
    try {
      console.log("del  test" + JSON.stringify(queryData));
      //调用删除对象API
      let res;
      if(queryData.obj.oid){
        res = await delEobj(queryData.className, [queryData.obj.oid]);
      }else if(queryData.obj.plt_oid){
        res = await delEobj(queryData.className, [queryData.obj.plt_oid]);
      }
      if(!res.data.success) throw {type: "api", data: res.data.message};

      if(queryData.obj.oid){
        //更新state
        commit('deletEntityobj', {className: queryData.className, oid: queryData.obj.oid});
      }else if(queryData.obj.plt_oid){
        //更新state
        commit('deletEntityobj', {className: queryData.className, oid: queryData.obj.plt_oid});
      }
      // alert('删除成功');
      return queryData.obj;
    } catch (e) {
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
      // alert(e);
    }
    return null;
  },

  //批量处理CUD事务
  async cudBatch({state, commit}, cudObj){
    try {
      console.log("cudBatch  test" + JSON.stringify(cudObj));
      let res = await cudBatch(cudObj);
      if(!res.data.success) throw {type: "api", data: res.data.message};
      //更新state
      // cudObj.obj=res.data.data[0];
      // commit('addEntityObj',cudObj);
      return cudObj;
    } catch (e) {
      console.log("cudBatch Error");
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
      // alert(e);
    }
    return null;
  },

  //批量处理级联CU操作
  async toBeNextCreate({state, commit}, nextCreateObj){
    try {
      // console.log("toBeNextCreate  test" + JSON.stringify(nextCreateObj));
      let res = await toBeNextCreate(nextCreateObj);
      if(!res.data.success) throw {type: "api", data: res.data.message};
      //更新state
      // nextCreateObj.obj=res.data.data[0];
      // commit('addEntityObj',nextCreateObj);
      return nextCreateObj;
    } catch (e) {
      console.log("toBeNextCreate Error");
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
      // alert(e);
    }
    return null;
  },

  // 增加某个实体类单对象
  async saveEObj({
                   state,
                   commit
                 }, newObj) {
    try {
      console.log("save  test" + JSON.stringify(newObj));
      //调用增加对象API
      let res = await createEobj(newObj.className, [newObj.obj]);
      if(!res.data.success) throw {type: "api", data: res.data.message};
        //更新state
        newObj.obj=res.data.data[0];
        commit('addEntityObj',newObj);
        // alert('新增成功');
        return newObj.obj;


    } catch (e) {
      console.log("save Error");
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
      // alert(e);
    }
    return null;
  },
  // 修改某个实体类单对象
  async editEObj({
                   state,
                   commit,
                 }, thisEObj) {
    try {
      console.log("update  test" + JSON.stringify(thisEObj));
      // 调用更新对象API
      // if(!('lastModifyTime' in thisEObj.obj)){
      //   thisEObj.obj.lastModifyTime = new Date().getTime();
      // }
      let res = await editEobj(thisEObj.className,[thisEObj.obj])
        if(!res.data.success) throw {type: "api", data: res.data.message};
        thisEObj.obj=res.data.data[0];
        //更新state
        commit('addEntityObj', thisEObj);
        return thisEObj.obj;
    } catch (e) {
      // alert(e);
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
    }
    return null;
  },

  // 删除某个关联类单对象
  async deleteEJObj({
                      dispatch,
                      commit
                    }, queryData) {
    try {
      console.log("del  test" + JSON.stringify(queryData));
      //调用删除对象API
      let res = await delRJobj(queryData.className, [queryData.obj.oid]);
      if(!res.data.success) throw {type: "api", data: res.data.message};
      //更新state
      commit('deletRelationobj', {className: queryData.className, oid: queryData.obj.oid});
      // alert('删除成功');
      console.log(queryData.obj)
      return queryData.obj;
    } catch (e) {
      // alert(e);
      console.log(e)
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
    }
    return null;
  },

  // 批量删除某个关联类单对象
  async deleteEJObjs({
                      dispatch,
                      commit
                    }, queryData) {
    try {
      console.log("del  test" + JSON.stringify(queryData));
      let params = [];
      for(let obj of queryData.obj){
        params = [...params, obj.oid];
      }
      let res = await delEJobj(queryData.className, params);
      if(!res.data.success) throw {type: "api", data: res.data.message};
      //更新state

      for(let obj of queryData.obj){
        commit('deletRelationobj', {className: queryData.className, oid: obj.oid});
      }
      return queryData.obj;
    } catch (e) {
      // alert(e);
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
    }
    return null;
  },
  // 增加某个实体类单对象
  async saveEJObj({
                   state,
                   commit
                 }, newObj) {
    try {
      console.log("save  test" + JSON.stringify(newObj));
      //调用增加对象API
      let res = await createEJobj(newObj.className, [newObj.obj]);
      if(!res.data.success) throw {type: "api", data: res.data.message};
      console.log("ss:", newObj, res.data);
        //更新state
        newObj.obj=res.data.data[0];
        commit('addRelationChild',{ newChildName: newObj.className, newChild: newObj.obj });
        // alert('新增成功');
        return newObj.obj;
    } catch (e) {
      console.log("saveEJ error");
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
      // alert(e);
    }
    return null;
  },
  // 修改某个实体类单对象
  async editEJObj({
                   state,
                   commit,
                 }, thisEObj) {
    try {
      console.log("update  test" + JSON.stringify(thisEObj));
      // 调用更新对象API
      // if(!('lastModifyTime' in thisEObj.obj)){
      //   thisEObj.obj.lastModifyTime = new Date().getTime();
      // }
      let res = await editEJobj(thisEObj.className,[thisEObj.obj]);
      if(!res.data.success) throw {type: "api", data: res.data.message};

        console.log("ss:", thisEObj, res);
        thisEObj.obj=res.data.data[0];
        //更新state
        commit('addRelationChild', { newChildName: thisEObj.className, newChild: thisEObj.obj });
        return thisEObj.obj;
        // alert('修改成功');
    } catch (e) {
      // throw "edit error";
      //alert(e);
      if (typeof e == "object" && "type" in e && e.type == "api") throw e.data;
    }
    return null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
