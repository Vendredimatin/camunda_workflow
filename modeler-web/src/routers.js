// Two main components do not need lazy loading
import Main from "./views/main/Main.vue";
// import ViewLog from "./views/ViewLog.vue";
import {singleRouters} from "./single-routers";
// 代码装配支持主页定制
// let homePath = 'organizational-model/user-management';
let homePath = 'Help';

let routes = [
  {
    path: "/login",
    name: "login",
    meta: {
      title: "Login - 登录",
      hideInMenu: true,
      staticRoute: true,
    },
    component: () => import("./views/Login.vue")
  },
  {
    path: "/forms/:className/:formName",
    name: "form-create-single",
    meta: {
      hideInMenu: true,
      staticRoute: true,
    },
    component: () => import("./views/form-engine/form-create.vue")
  },
  // {
  //       path: "/wf-edit/:id",
  //       name: "wf-edit",
  //       meta: {
  //         icon: "md-cloud-upload",
  //         title: "流程编辑",
  //         notCache: true,
  //         path: "workflow/wf-edit",
  //       },
  //       component: () => import("./views/workflow/wf-edit.vue")
  // },
  {
    path: "/",
    name: "index",
    redirect: "/home",
    component: Main,
    meta: {
      title: "首页",
      hideInMenu: true,
      staticRoute: true,
      // notCache: true
    },
    children: [
      {
        path: "/home",
        name: "home",
        meta: {
          title: "首页",
          hideInMenu: true,
          // notCache: true,
          path: homePath,
        },
        component: () =>
          import(`./views/${homePath}.vue`)
      }
    ]
  },
  // {
  //   path: "/organizational-model",
  //   name: "organizational-model",
  //   meta: {
  //     icon: "ios-ionic",
  //     title: "组织模型"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "user-management",
  //       name: "user-management",
  //       meta: {
  //         icon: "ios-person",
  //         title: "用户管理",
  //         // notCache: true,
  //         path: "organizational-model/user-management.vue"
  //       },
  //       component: () =>
  //         import("./views/organizational-model/user-management.vue")
  //     },
  //     {
  //       path: "users-management",
  //       name: "users-management",
  //       meta: {
  //         icon: "ios-people",
  //         title: "用户组管理",
  //         // notCache: true,
  //         path: "organizational-model/users-management.vue"
  //       },
  //       component: () =>
  //         import("./views/organizational-model/users-management.vue")
  //     },
  //     {
  //       path: "online-management",
  //       name: "online-management",
  //       meta: {
  //         icon: "md-cloud-upload",
  //         title: "在线管理",
  //         // notCache: true,
  //         path: "organizational-model/online-management.vue",
  //       },
  //       component: () => import("./views/organizational-model/online-management.vue")
  //     }
  //   ]
  // },
  // {
  //   path: "/data-model",
  //   name: "data-model",
  //   meta: {
  //     icon: "ios-cube",
  //     title: "数据模型"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "attributes-lib",
  //       name: "attributes-lib",
  //       meta: {
  //         icon: "md-podium",
  //         title: "属性库管理",
  //         // notCache: true,
  //         path: "data-model/AttributesLib.vue",
  //       },
  //       component: () => import("./views/data-model/AttributesLib.vue")
  //     },
  //     {
  //       path: "internal-entity-modeling",
  //       name: "internal-entity-modeling",
  //       meta: {
  //         icon: "ios-color-wand",
  //         title: "实体类管理",
  //         // notCache: true,
  //         path: "data-model/InternalEntityModeling.vue"
  //       },
  //       component: () => import("./views/data-model/InternalEntityModeling.vue")
  //     },
  //     {
  //       path: "relation-modeling",
  //       name: "relation-modeling",
  //       meta: {
  //         icon: "md-swap",
  //         title: "关联类管理",
  //         // notCache: true,
  //         path: "data-model/RelationModeling.vue",
  //       },
  //       component: () => import("./views/data-model/RelationModeling.vue")
  //     },
  //     {
  //       path: "data-source-mgr",
  //       name: "data-source-mgr",
  //       meta: {
  //         icon: "ios-cube",
  //         title: "外部数据连接",
  //         // notCache: true,
  //         path: "data-model/DataSourceMgr.vue"
  //       },
  //       component: () => import("./views/data-model/DataSourceMgr.vue")
  //     },
  //     {
  //       path: "external-entity-modeling",
  //       name: "external-entity-modeling",
  //       meta: {
  //         icon: "ios-color-wand",
  //         title: "外部实体类",
  //         // notCache: true,
  //         path: "data-model/ExternalEntityModeling.vue"
  //       },
  //       component: () => import("./views/data-model/ExternalEntityModeling.vue")
  //     },
  //     // {
  //     //   path: "model-transform",
  //     //   name: "模型转换",
  //     //   meta: {
  //     //     icon: "md-sync",
  //     //     title: "模型转换"
  //     //   },
  //     //   component: () => import("./views/data-model/ModelTransform.vue")
  //     // }
  //   ]
  // },
  // {
  //   path: "/form-engine",
  //   name: "form-engine",
  //   meta: {
  //     icon: "ios-folder",
  //     title: "表单模型"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "form-create",
  //       name: "form-create",
  //       meta: {
  //         icon: "ios-document",
  //         title: "创建表单",
  //         hideInMenu: true,
  //         path: "form-engine/form-create.vue"
  //       },
  //       component: () =>
  //         import("./views/form-engine/form-create.vue")
  //     },
  //     {
  //       path: "form-management",
  //       name: "form-management",
  //       meta: {
  //         icon: "ios-list",
  //         title: "实体类表单管理",
  //         // notCache: true,
  //         path: "form-engine/form-management.vue"
  //       },
  //       component: () =>
  //         import("./views/form-engine/form-management.vue")
  //     },
  //     {
  //       path: "relationForm-management",
  //       name: "relationForm-management",
  //       meta: {
  //         icon: "ios-paper-outline",
  //         title: "关联类表单管理",
  //         // notCache: true,
  //         path: "form-engine/relationForm-management.vue"
  //       },
  //       component: () =>
  //         import("./views/form-engine/relationForm-management.vue")
  //     }
  //   ]
  // },
  {
    path: "/functional-model",
    name: "functional-model",
    meta: {
      icon: "md-help-buoy",
      title: "功能模型",
      hideInMenu: true,
      staticRoute: true,
    },
    component: Main,
    children: [
      // {
      //   path: "application-management",
      //   name: "application-management",
      //   meta: {
      //     icon: "logo-dropbox",
      //     title: "应用管理",
      //     // notCache: true,
      //     hideInMenu: true,
      //     path: "functional-model/application-management.vue"
      //   },
      //   component: () =>
      //     import("./views/functional-model/application-management.vue")
      // },
      {
        path: "applicationTree-management",
        name: "applicationTree-management",
        meta: {
          icon: "ios-folder-open",
          title: "应用详情",
          notCache: true,
          hideInMenu: true,
          path: "functional-model/applicationTree-management.vue",
        },
        component: () =>
          import("./views/functional-model/applicationTree-management.vue")
      },
      // {
      //   path: "globalOperation-management",
      //   name: "globalOperation-management",
      //   meta: {
      //     icon: "ios-medical-outline",
      //     title: "全局操作",
      //     // notCache: true,
      //     path: "functional-model/globalOperation-management.vue",
      //   },
      //   component: () =>
      //     import("./views/functional-model/globalOperation-management.vue")
      // },
      // {
      //   path: "system-operation-list",
      //   name: "system-operation-list",
      //   meta: {
      //     icon: "ios-list-box-outline",
      //     title: "系统操作清单",
      //     notCache: true,
      //     path: "functional-model/system-operation-list.vue",
      //   },
      //   component: () =>
      //     import("./views/functional-model/system-operation-list.vue")
      // },
      // {
      //   path: "module-operation-management",
      //   name: "module-operation-management",
      //   meta: {
      //     notCache: true,
      //     icon: "md-options",
      //     title: "模块操作管理",
      //     notCache: true,
      //     path: "functional-model/module-operation-management.vue",
      //   },
      //   component: () =>
      //     import("./views/functional-model/module-operation-management.vue")
      // },
      // {
      //   path: "entity-class-operation",
      //   name: "entity-class-operation",
      //   meta: {
      //     icon: "md-locate",
      //     title: "实体类操作",
      //     // notCache: true,
      //     path: "functional-model/entity-class-operation.vue"
      //   },
      //   component: () =>
      //     import("./views/functional-model/related-class-operation.vue")
      // }
    ]
  },
  // {
  //   path: "/auth-model",
  //   name: "auth-model",
  //   meta: {
  //     icon: "md-unlock",
  //     title: "授权模型"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "auth-brief",
  //       name: "快速授权",
  //       meta: {
  //         icon: "ios-funnel",
  //         title: "快速授权",
  //         // notCache: true,
  //         path: "auth-model/AuthBrief.vue",
  //       },
  //       component: () => import("./views/auth-model/AuthBrief.vue")
  //     },
  //     {
  //       path: "auth-brief-enhance",
  //       name: "快速授权增强",
  //       meta: {
  //         icon: "ios-funnel",
  //         title: "快速授权增强",
  //         // notCache: true,
  //         path: "auth-model/AuthBriefEnhance.vue",
  //       },
  //       component: () => import("./views/auth-model/AuthBriefEnhance.vue")
  //     },
  //     {
  //       path: "auth-block",
  //       name: "auth-block",
  //       meta: {
  //         icon: "ios-funnel",
  //         title: "访问控制",
  //         // notCache: true,
  //         path: "auth-model/AuthBlock.vue",
  //       },
  //       component: () => import("./views/auth-model/AuthBlock.vue")
  //     },
  //     {
  //       path: "attr-access-rule",
  //       name: "attr-access-rule",
  //       meta: {
  //         icon: "ios-funnel",
  //         title: "属性授权规则",
  //         // notCache: true,
  //         path: "auth-model/AttrAccessRule.vue",
  //       },
  //       component: () => import("./views/auth-model/AttrAccessRule.vue")
  //     },
  //     {
  //       path: "obj-access-rule",
  //       name: "obj-access-rule",
  //       meta: {
  //         icon: "ios-funnel",
  //         title: "对象授权规则",
  //         // notCache: true,
  //         path: "auth-model/ObjAccessRule.vue",
  //       },
  //       component: () => import("./views/auth-model/ObjAccessRule.vue")
  //     },
  //     // {
  //     //   path: "auth-conditions",
  //     //   name: "条件管理",
  //     //   meta: {
  //     //     icon: "ios-funnel",
  //     //     title: "条件管理",
  //     //     notCache: true,
  //     //     path: "auth-model/AuthConditions.vue"
  //     //   },
  //     //   component: () => import("./views/auth-model/AuthConditions.vue")
  //     //     import("./views/functional-model/entity-class-operation.vue")
  //     // },
  //     // {
  //     //   path: "relation-class-operation",
  //     //   name: "relation-class-operation",
  //     //   meta: {
  //     //     icon: "md-git-commit",
  //     //     title: "关联类操作",
  //     //     // notCache: true,
  //     //     path: "functional-model/relation-class-operation.vue"
  //     //   },
  //     //   component: () =>
  //     //     import("./views/functional-model/relation-class-operation.vue")
  //     // },
  //     // {
  //     //   path: "related-class-operation",
  //     //   name: "related-class-operation",
  //     //   meta: {
  //     //     icon: "network",
  //     //     title: "关联类操作"
  //     //   },
  //     //   component: () =>
  //     //     import("./views/functional-model/related-class-operation.vue")
  //     // }
  //   ]
  // },
  {
    path: "/401",
    name: "error_401",
    component: () => import("./views/error-page/401.vue")
  },
  {
    path: "/500",
    name: "error_500",
    component: () => import("./views/error-page/500.vue")
  },
  {
    path: "*",
    name: "error_404",
    component: Main
  },
  // {
  //   path: "/about",
  //   name: "about",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import("./views/About.vue")
  // },
  // {
  //   path: "/tenant-management",
  //   name: "tenant-management",
  //   meta: {
  //     icon: "md-people",
  //     title: "租户管理"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "/tenant-list",
  //       name: "tenant-list",
  //       meta: {
  //         icon: "ios-person-add",
  //         title: "租户管理",
  //         notCache: true,
  //         path: "tenant/tenant-management.vue",
  //       },
  //       component: () => import("./views/tenant/tenant-management.vue")
  //     }
  //   ]
  // },
  // {
  //   path: "/snapshot-management",
  //   name: "snapshot-management",
  //   meta: {
  //     icon: "ios-archive",
  //     title: "快照管理"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "/snapshot-export",
  //       name: "snapshot-export",
  //       meta: {
  //         icon: "md-cloud-upload",
  //         title: "快照导出",
  //         notCache: true,
  //         path: "snapshot/snapshot-export",
  //       },
  //       component: () => import("./views/snapshot/snapshot-export.vue")
  //     },
  //     {
  //       path: "/snapshot-import",
  //       name: "snapshot-import",
  //       meta: {
  //         icon: "md-cloud-download",
  //         title: "快照导入",
  //         notCache: true,
  //         path: "snapshot/snapshot-import",
  //       },
  //       component: () => import("./views/snapshot/snapshot-import.vue")
  //     }
  //   ]
  // },
  // {
  //   path: "/workflow",
  //   name: "workflow",
  //   meta: {
  //     icon: "ios-archive",
  //     title: "流程模型"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "wf-modeler",
  //       name: "wf-modeler",
  //       meta: {
  //         icon: "md-cloud-upload",
  //         title: "流程建模",
  //         // notCache: true,
  //         path: "workflow/wf-modeler",
  //       },
  //       component: () => import("./views/workflow/wf-modeler.vue")
  //     },
  //     {
  //       path: "wf-admin",
  //       name: "wf-admin",
  //       meta: {
  //         icon: "md-cloud-upload",
  //         title: "流程监控",
  //         // notCache: true,
  //         path: "workflow/wf-admin",
  //       },
  //       component: () => import("./views/workflow/wf-admin.vue")
  //     },
  //     // {
  //     //   path: "/wf-edit/:id",
  //     //   name: "wf-edit",
  //     //   meta: {
  //     //     icon: "md-cloud-upload",
  //     //     title: "流程编辑",
  //     //     notCache: true,
  //     //     path: "workflow/wf-edit",
  //     //   },
  //     //   component: () => import("./views/workflow/wf-edit.vue")
  //     // }
  //   ]
  // },
  //
  // {
  //   path: "/model-package",
  //   name: "model-package",
  //   meta: {
  //     icon: "ios-cloud",
  //     title: "模型管理"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "/model-package-manage",
  //       name: "model-package-manage",
  //       meta: {
  //         icon: "md-cloud-upload",
  //         title: "模型包管理",
  //         // notCache: true,
  //         path: "model-package/model-package-manage",
  //       },
  //       component: () => import("./views/model-package/model-package-manage.vue")
  //     },
  //     {
  //       path: "/code-assembly",
  //       name: "code-assembly",
  //       meta: {
  //         icon: "ios-construct",
  //         title: "代码装配",
  //         // notCache: true,
  //         path: "model-package/code-assembly",
  //       },
  //       component: () => import("./views/model-package/code-assembly.vue")
  //     }
  //   ]
  // },
  //
  // {
  //   path: "/system-management",
  //   name: "system-management",
  //   meta: {
  //     icon: "md-cog",
  //     title: "系统管理"
  //   },
  //   component: Main,
  //   children: [
  //     // {
  //     //   path: "/view-log",
  //     //   name: "view-log",
  //     //   meta: {
  //     //     icon: "ios-analytics",
  //     //     title: "脚本日志",
  //     //     // hideInMenu: true,
  //     //     notCache: true,
  //     //     path: "system-management/view-log.vue",
  //     //   },
  //     //   component: () => import("./views/system-management/view-log.vue")
  //     // },
  //     {
  //       path: "/view-script-log",
  //       name: "view-script-log",
  //       meta: {
  //         icon: "ios-analytics",
  //         title: "脚本日志",
  //         notCache: true,
  //         path: "system-management/view-script-log.vue",
  //       },
  //       component: () => import("./views/system-management/view-script-log.vue")
  //     }
  //   ]
  // },
];
// routes = routes.concat(singleRouters);
export default routes;
