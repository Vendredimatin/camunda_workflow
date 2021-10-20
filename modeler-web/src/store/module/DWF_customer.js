
// initial state
const state = {
    exampleData:''
}

// getters
const getters = {

}

// mutations
const mutations = {
    setExampleData(state, exampleData) {
        state.exampleData = exampleData;
    }
}

// actions
const actions = {}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}