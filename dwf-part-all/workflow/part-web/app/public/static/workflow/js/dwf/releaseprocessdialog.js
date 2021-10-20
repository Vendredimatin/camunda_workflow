// /**
//  *
//  */
// // /pm/dlg
// ;
// (function($, window, document, undefined) {
//   var pluginName = "releaseWfProcessDialog";
//   var defaults = {
//     id : "",
//     title : "",
//     topparent : "",
//     owner : "",// organization ID
//     uid: "",
//     uname: "",
//   };
//
//   var ReleaseProcessDialog = function(element, options) {
//     this.element = element;
//     this.options = $.extend({
//       id : "",
//       title : "",
//       topparent : "",
//       owner : "",// organization ID
//       uid: "",
//       uname: "",
//     }, defaults, options);
//     this._defaults = defaults;
//     this._name = pluginName;
//     this.init(options);
//   };
//
//   ReleaseProcessDialog.prototype.init = function(options) {
//     this.modalframe = document.createElement("div");
//     this.element.appendChild(this.modalframe);
//
//     this.modalframe.className = "modal fade";
//     this.modalframe.id = "avEditorModal" + options.id;
//     this.modalframe.setAttribute("role", "dialog");
//     this.modalframe.setAttribute("aria-labelledby", "ruleEditModalLabel");
//
//     var modaldialogDIV = document.createElement("div");
//     modaldialogDIV.className = "modal-dialog";
//     modaldialogDIV.setAttribute("role", "document");
//     modaldialogDIV.style.width = "650px"
//     this.modalframe.appendChild(modaldialogDIV);
//
//     var dialogContentDIV = document.createElement("div");
//     dialogContentDIV.className = "modal-content";
//     modaldialogDIV.appendChild(dialogContentDIV);
//
//     // dialog heading
//     var dialogHeaderDIV = document.createElement("div");
//     dialogHeaderDIV.className = "modal-header";
//     dialogContentDIV.appendChild(dialogHeaderDIV);
//
//     var closeButton = document.createElement("button");
//     closeButton.type = "button";
//     closeButton.className = "close";
//     closeButton.setAttribute("data-dismiss", "modal");
//     closeButton.setAttribute("aria-label", "Close");
//
//     var closeSpan = document.createElement("span");
//     closeSpan.setAttribute("aria-hidden", "true");
//     closeSpan.innerHTML = "&times;";
//     closeButton.appendChild(closeSpan);
//     dialogHeaderDIV.appendChild(closeButton);
//
//     var titleH4 = document.createElement("h4");
//     titleH4.className = "modal-title";
//     dialogHeaderDIV.appendChild(titleH4);
//
//     var infoIcon = document.createElement("i");
//     infoIcon.className = "fa fa-pencil-square fa-lg";
//     infoIcon.style.color = "green";
//     titleH4.appendChild(infoIcon);
//
//     var info = document.createElement("label");
//     info.innerHTML = options.title;
//     titleH4.appendChild(info);
//
//     // dialog body
//     var dialogForm = document.createElement("form");
//     dialogContentDIV.appendChild(dialogForm);
//
//     var dialogBodyDIV = document.createElement("div");
//     dialogBodyDIV.className = "modal-body";
//     dialogForm.appendChild(dialogBodyDIV);
//
//     var dialogBodyFrameDIV = document.createElement("div");
//     dialogBodyFrameDIV.className = "container-fluid";
//     dialogBodyDIV.appendChild(dialogBodyFrameDIV);
//
//     var bodyRow = document.createElement("div");
//     dialogBodyFrameDIV.appendChild(bodyRow);
//     bodyRow.className = "row";
//
//     this.loadDialogBody(options, bodyRow);
//
//     // dialog footer
//     var dialogFooterDIV = document.createElement("div");
//     dialogFooterDIV.className = "modal-footer";
//     dialogForm.appendChild(dialogFooterDIV);
//
//     var saveButton = document.createElement("button");
//     saveButton.type = "button";
//     saveButton.id = "OK" + options.id;
//     saveButton.name = "OK" + options.id;
//     saveButton.className = "btn btn-primary";
//     saveButton.innerHTML = "确定";
//     saveButton.addEventListener("click", this, false);
//     dialogFooterDIV.appendChild(saveButton);
//
//     var cancelButton = document.createElement("button");
//     cancelButton.type = "button";
//     cancelButton.className = "btn btn-default";
//     cancelButton.innerHTML = "取消";
//     cancelButton.setAttribute("data-dismiss", "modal");
//     dialogFooterDIV.appendChild(cancelButton);
//
//     var dialog = $(bodyRow).alertBox({
//       id : "releaseAlert" + options.id,
//     });
//     this.messageBox = dialog.data("alertBox");
//
//   };
//
//   ReleaseProcessDialog.prototype.loadDialogBody = function(options, parent) {
//     var rlform = document.createElement("form");
//     parent.appendChild(rlform);
//     rlform.className = "form-horizontal";
//     rlform.setAttribute("role", "form");
//     // released process name
//     var groupDiv1 = document.createElement("DIV");
//     rlform.appendChild(groupDiv1);
//     groupDiv1.className = "form-group";
//     var nameLabel = document.createElement("label");
//     groupDiv1.appendChild(nameLabel);
//     nameLabel.className = "col-sm-3 control-label";
//     nameLabel.innerHTML = "流程名称";
//
//     var nameDiv1 = document.createElement("DIV");
//     groupDiv1.appendChild(nameDiv1);
//     nameDiv1.className = "col-sm-9";
//     this.procName = document.createElement("input");
//     nameDiv1.appendChild(this.procName);
//     this.procName.className = "form-control";
//     this.procName.readOnly = true;
//
//     var groupDiv2 = document.createElement("DIV");
//     rlform.appendChild(groupDiv2);
//     groupDiv2.className = "form-group";
//     var verLabel = document.createElement("label");
//     groupDiv2.appendChild(verLabel);
//     verLabel.className = "col-sm-3 control-label";
//     verLabel.innerHTML = "发布版本";
//
//
//     var verDiv1 = document.createElement("DIV");
//     groupDiv2.appendChild(verDiv1);
//     verDiv1.className = "col-sm-9";
//     this.verNo = document.createElement("input");
//     verDiv1.appendChild(this.verNo);
//     this.verNo.className = "form-control";
//     this.verTip = $("<div></div>");
//     this.verTip.css("color","red");
//     this.verTip.appendTo(verDiv1);
//
//     // release note
//     var groupDiv3 = document.createElement("DIV");
//     rlform.appendChild(groupDiv3);
//     groupDiv3.className = "form-group";
//     var descLabel = document.createElement("label");
//     groupDiv3.appendChild(descLabel);
//     descLabel.className = "col-sm-3 control-label";
//     descLabel.innerHTML = "发布声明";
//
//     var noteDiv = document.createElement("DIV");
//     groupDiv3.appendChild(noteDiv);
//     noteDiv.className = "col-sm-9";
//     this.verNote = document.createElement("textarea");
//     this.verNote.setAttribute("rows", "8");
//     noteDiv.appendChild(this.verNote);
//     this.verNote.className = "form-control";
//
//
//   };
//
//   ReleaseProcessDialog.prototype.handleEvent = function(e) {
//     switch (e.type) {
//       case "click":
//         this.doClick(e);
//         break;
//     }
//   };
//
//   ReleaseProcessDialog.prototype.setWfProcess = function(process) {
//     this.wfprocess = process;
//     // this.folderContentDiv1.id = "publishingtree" + this.wfprocess.id;
//     this.procName.value = this.wfprocess.name;
//     // this.releaser.value = this.options.uname;
//   };
//
//   ReleaseProcessDialog.prototype.show = function() {
//     $(this.modalframe).modal({
//       backdrop : 'static',
//       keyboard : true,
//     });
//     this.verTip.text("");
//
//     var pp = this.getAttribute("data");
//     console.log("pp",pp);
//     if (map[pp] != null) {
//       console.log("map[pp]",map[pp]);
//       var dirty = map[pp].getDirty();
//       if (dirty) {
//         // parent.confirmInfoDialog.show("当前模型已经修改，是否保存修改？")
//         alert("当前模型已经修改，是否保存修改？");
//       } else {
//
//       }
//     }
//
//   };
//
//   ReleaseProcessDialog.prototype.doClick = function(evt) {
//     if (evt.target.id == "OK" + this.options.id) {
//       if (this.verNo.value == "") {
//         this.verTip.text("版本号不能为空");
//         return;
//       }
//       var arg1 =  /^[a-zA-Z0-9_\-/.\u0391-\uFFE5]+$/;
//       if (this.verNo.value.match(arg1) == null || this.verNo.value.match(arg1) == false) {
//         this.verTip.text("版本名只能包含汉字、字母、数字、_、-、/或.");
//         return;
//       }
//
//       var that = this;
//       var template = {
//         templateId: this.wfprocess.id,
//         version: this.verNo.value,
//         description: this.verNote.value,
//         releaser: this.options.uname,
//         releaserId:  this.options.uid,
//       };
//
//       ajaxPost(service.buildAPI("/release-process-template"),
//         template
//         , function(data) {
//           console.log("data",data);
//           console.log("data.status",data.status);
//           if(data.success){
//             that.hide();
//             alert("发布成功");
//           }else {
//             alert("发布失败，该版本已存在");
//
//           }
//           $("#progressbar").hide();
//
//         });
//     }
//   };
//
//   ReleaseProcessDialog.prototype.hide = function() {
//     $(this.modalframe).modal('hide');
//   };
//
//   $.fn[pluginName] = function(options) {
//     return this.each(function() {
//       if (!$.data(this, pluginName)) {
//         $.data(this, pluginName,
//           new ReleaseProcessDialog(this, options));
//       } else if ($.isFunction(Plugin.prototype[options])) {
//         $.data(this, pluginName)[options]();
//       }
//     });
//   };
//
// })(jQuery, window, document);
