

import auth from "../../api/auth-model/AuthRules"
import { Schema, normalize } from 'normalizr'

const state = {
  rules: {},

};
const getters = {
  /**
   * 根据授权项名获取规则
   * @param item:String 授权项名称
   * @param state
   * */
  getRulesByItem: state => item => {
    return state.rules.filter(rule => {
      return rule.authority === item && rule.conditionId==='AlwaysTrue';
    });
  },

  /**
   * 根据授权项名获取规则
   * @param participant:String 用户名
   * @param state
   * */
  getRulesByParticipant: state => participant => {
    return state.rules.filter(rule => {
      return rule.participant === participant && rule.conditionId==='AlwaysTrue';
    });
  }
};
const mutations = {
  setRules(state, rules) {
    state.rules = rules;
  }
};

/*const mutations = {
  setRules(state, rules) {

    /!*
    * 描述 rules的结构
    * *!/
    const rulezr = new schema.Entity('rule', {},{idAttribute: rule => rule.oid});
    const ruleSchema = [rulezr];

    state.rules = normalize(rules, ruleSchema);
    console.log(JSON.stringify(state.rules));
  },
  addRule(state, rule) {
    state.rules[rule.oid] = rule;
  }
};*/

const actions = {
  setAllRules({state,commit}){
    auth.getAllRules().then(data => {
      commit('setRules', data.data);
    })
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
