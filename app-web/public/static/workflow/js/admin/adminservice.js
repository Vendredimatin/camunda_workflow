/**
 *
 */


function ADMINService(global_) {
 
  // this.buildtimeAPI = `${location.protocol}//${ip}:${6060 + offsetHost}/dwf/v1/workflow/buildtime`;
  // // this.pm1 = `${location.protocol}//${ip}:${6060 + offsetHost}/dwf/v1/workflow/runtime`;
  // this.runtimeAPI = `${location.protocol}//${ip}:${6060 + offsetHost}/dwf/v1/workflow/runtime`;
  // this.adminUrl = `${location.protocol}//${ip}:${6060 + offsetHost}/dwf/v1/workflow/administrate`;
  var baseUrl = global_.baseObjOther;
  this.buildtimeAPI = `${baseUrl}/workflow/buildtime`;
  // this.pm1 = `${location.protocol}//${ip}:${6060 + offsetHost}/dwf/v1/workflow/runtime`;
  this.runtimeAPI = `${baseUrl}/workflow/runtime`;
  this.adminUrl = `${baseUrl}/workflow/administrate`;


  this.init();
};

ADMINService.prototype = {
 
  init : function() {
  },

  // pmService
  buildAPI : function(s) {
    url = this.buildtimeAPI + s;
    return url;
  },
  runAPI : function(s) {
    return this.runtimeAPI + s;
  },
  adminAPI : function (n) {
    return this.adminUrl + n;
  }
};
