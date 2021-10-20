var MyPlugin  = {}
MyPlugin.install = function(Vue,options){
  Vue.mixin({
    created: function () {
     this.$nextTick(() => {
      document.querySelector('.ivu-modal-no-mask')?document.querySelector('.ivu-modal-no-mask').style.pointerEvents = 'auto':''
     })
    }
  })
}
export default MyPlugin