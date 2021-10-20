import Main from "./views/main/Main.vue";

const singleRouters = [
  {
    path: "/organizational-model",
    name: "organizational-model",
    meta: {
      icon: "ios-ionic",
      title: "组织模型",
      hideInMenu: true,
    },
    component: Main,
    children: [
      {
        path: "user-management/single",
        name: "user-management-single",
        meta: {
          icon: "ios-person",
          title: "用户管理",
          hideInMenu: true,
          // notCache: true,
          path: "organizational-model/user-management.vue"
        },
        component: () =>
          import("./views/organizational-model/user-management.vue")
      },
      {
        path: "users-management/single",
        name: "users-management-single",
        meta: {
          icon: "ios-people",
          title: "用户组管理",
          hideInMenu: true,
          // notCache: true,
          path: "organizational-model/users-management.vue"
        },
        component: () =>
          import("./views/organizational-model/users-management.vue")
      },
      {
        path: "online-management/single",
        name: "online-management-single",
        meta: {
          icon: "md-cloud-upload",
          title: "在线管理",
          hideInMenu: true,
          // notCache: true,
          path: "organizational-model/online-management.vue",
        },
        component: () => import("./views/organizational-model/online-management.vue")
      }
    ]
  },
  {
    path: "/data-model",
    name: "data-model",
    meta: {
      icon: "ios-cube",
      hideInMenu: true,
      title: "数据模型"
    },
    component: Main,
    children: [
      {
        path: "attributes-lib/single",
        name: "attributes-lib-single",
        meta: {
          icon: "md-podium",
          hideInMenu: true,
          title: "属性库管理",
          // notCache: true,
          path: "data-model/AttributesLib.vue",
        },
        component: () => import("./views/data-model/AttributesLib.vue")
      },
      {
        path: "internal-entity-modeling/single",
        name: "internal-entity-modeling-single",
        meta: {
          icon: "ios-color-wand",
          hideInMenu: true,
          title: "实体类管理",
          // notCache: true,
          path: "data-model/InternalEntityModeling.vue"
        },
        component: () => import("./views/data-model/InternalEntityModeling.vue")
      },
      {
        path: "relation-modeling/single",
        name: "relation-modeling-single",
        meta: {
          icon: "md-swap",
          hideInMenu: true,
          title: "关联类管理",
          // notCache: true,
          path: "data-model/RelationModeling.vue",
        },
        component: () => import("./views/data-model/RelationModeling.vue")
      },
      {
        path: "data-source-mgr/single",
        name: "data-source-mgr-single",
        meta: {
          icon: "ios-cube",
          hideInMenu: true,
          title: "外部数据连接",
          // notCache: true,
          path: "data-model/DataSourceMgr.vue"
        },
        component: () => import("./views/data-model/DataSourceMgr.vue")
      },
      {
        path: "external-entity-modeling/single",
        name: "external-entity-modeling-single",
        meta: {
          icon: "ios-color-wand",
          hideInMenu: true,
          title: "外部实体类",
          // notCache: true,
          path: "data-model/ExternalEntityModeling.vue"
        },
        component: () => import("./views/data-model/ExternalEntityModeling.vue")
      },
      // {
      //   path: "model-transform",
      //   name: "模型转换",
      //   meta: {
      //     icon: "md-sync",
      //     title: "模型转换"
      //   },
      //   component: () => import("./views/data-model/ModelTransform.vue")
      // }
    ]
  },
  {
    path: "/form-engine",
    name: "form-engine",
    meta: {
      icon: "ios-folder",
      hideInMenu: true,
      title: "表单模型"
    },
    component: Main,
    children: [
      {
        path: "form-management/single",
        name: "form-management-single",
        meta: {
          icon: "ios-list",
          hideInMenu: true,
          title: "实体类表单管理",
          // notCache: true,
          path: "form-engine/form-management.vue"
        },
        component: () =>
          import("./views/form-engine/form-management.vue")
      },
      {
        path: "relationForm-management/single",
        name: "relationForm-management-single",
        meta: {
          icon: "ios-paper-outline",
          hideInMenu: true,
          title: "关联类表单管理",
          // notCache: true,
          path: "form-engine/relationForm-management.vue"
        },
        component: () =>
          import("./views/form-engine/relationForm-management.vue")
      }
    ]
  },
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
      {
        path: "application-management",
        name: "application-management",
        meta: {
          icon: "logo-dropbox",
          title: "应用管理",
          // notCache: true,
          hideInMenu: true,
          path: "functional-model/application-management.vue"
        },
        component: () =>
          import("./views/functional-model/application-management.vue")
      },
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
      {
        path: "application-management/single",
        name: "application-management-single",
        meta: {
          icon: "logo-dropbox",
          title: "应用管理",
          // notCache: true,
          hideInMenu: true,
          path: "functional-model/application-management.vue"
        },
        component: () =>
          import("./views/functional-model/application-management.vue")
      },
      {
        path: "applicationTree-management/single",
        name: "applicationTree-management-single",
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
      {
        path: "globalOperation-management/single",
        name: "globalOperation-management-single",
        meta: {
          icon: "ios-medical-outline",
          hideInMenu: true,
          title: "全局操作",
          // notCache: true,
          path: "functional-model/globalOperation-management.vue",
        },
        component: () =>
          import("./views/functional-model/globalOperation-management.vue")
      },
      {
        path: "entity-class-operation/single",
        name: "entity-class-operation-single",
        meta: {
          icon: "md-locate",
          hideInMenu: true,
          title: "实体类操作",
          // notCache: true,
          path: "functional-model/entity-class-operation.vue"
        },
        component: () =>
          import("./views/functional-model/entity-class-operation.vue")
      },
      {
        path: "relation-class-operation/single",
        name: "relation-class-operation-single",
        meta: {
          icon: "md-git-commit",
          hideInMenu: true,
          title: "关联类操作",
          // notCache: true,
          path: "functional-model/relation-class-operation.vue"
        },
        component: () =>
          import("./views/functional-model/relation-class-operation.vue")
      },
    ]
  },
  {
    path: "/auth-model",
    name: "auth-model",
    meta: {
      icon: "md-unlock",
      hideInMenu: true,
      title: "授权模型"
    },
    component: Main,
    children: [
      {
        path: "auth-brief/single",
        name: "快速授权-single",
        meta: {
          icon: "ios-funnel",
          hideInMenu: true,
          title: "快速授权",
          // notCache: true,
          path: "auth-model/AuthBrief.vue",
        },
        component: () => import("./views/auth-model/AuthBrief.vue")
      },
      {
        path: "auth-brief-enhance/single",
        name: "快速授权增强-single",
        meta: {
          icon: "ios-funnel",
          hideInMenu: true,
          title: "快速授权增强",
          // notCache: true,
          path: "auth-model/AuthBriefEnhance.vue",
        },
        component: () => import("./views/auth-model/AuthBriefEnhance.vue")
      },
      {
        path: "auth-block/single",
        name: "auth-block-single",
        meta: {
          icon: "ios-funnel",
          hideInMenu: true,
          title: "访问控制",
          // notCache: true,
          path: "auth-model/AuthBlock.vue",
        },
        component: () => import("./views/auth-model/AuthBlock.vue")
      },
      {
        path: "attr-access-rule/single",
        name: "attr-access-rule-single",
        meta: {
          icon: "ios-funnel",
          hideInMenu: true,
          title: "属性授权规则",
          // notCache: true,
          path: "auth-model/AttrAccessRule.vue",
        },
        component: () => import("./views/auth-model/AttrAccessRule.vue")
      },
      {
        path: "obj-access-rule/single",
        name: "obj-access-rule-single",
        meta: {
          icon: "ios-funnel",
          hideInMenu: true,
          title: "对象授权规则",
          // notCache: true,
          path: "auth-model/ObjAccessRule.vue",
        },
        component: () => import("./views/auth-model/ObjAccessRule.vue")
      },
    ]
  },
  // {
  //   path: "/workflow",
  //   name: "workflow",
  //   meta: {
  //     icon: "ios-archive",
  //     hideInMenu: true,
  //     title: "流程模型"
  //   },
  //   component: Main,
  //   children: [
  //     {
  //       path: "wf-modeler/single",
  //       name: "wf-modeler-single",
  //       meta: {
  //         icon: "md-cloud-upload",
  //         hideInMenu: true,
  //         title: "流程建模",
  //         // notCache: true,
  //         path: "workflow/wf-modeler",
  //       },
  //       component: () => import("./views/workflow/wf-modeler.vue")
  //     },
  //     {
  //       path: "wf-admin/single",
  //       name: "wf-admin-single",
  //       meta: {
  //         icon: "md-cloud-upload",
  //         hideInMenu: true,
  //         title: "流程监控",
  //         // notCache: true,
  //         path: "workflow/wf-admin",
  //       },
  //       component: () => import("./views/workflow/wf-admin.vue")
  //     },
  //   ]
  // },
  {
    path: "/model-package",
    name: "model-package",
    meta: {
      icon: "ios-cloud",
      hideInMenu: true,
      title: "模型管理"
    },
    component: Main,
    children: [
      {
        path: "/model-package-manage/single",
        name: "model-package-manage-single",
        meta: {
          icon: "md-cloud-upload",
          hideInMenu: true,
          title: "模型包管理",
          // notCache: true,
          path: "model-package/model-package-manage",
        },
        component: () => import("./views/model-package/model-package-manage.vue")
      },
      {
        path: "/code-assembly/single",
        name: "code-assembly-single",
        meta: {
          icon: "ios-construct",
          hideInMenu: true,
          title: "代码装配",
          // notCache: true,
          path: "model-package/code-assembly",
        },
        component: () => import("./views/model-package/code-assembly.vue")
      }
    ]
  },
  {
    path: "/system-management",
    name: "system-management",
    meta: {
      icon: "md-cog",
      hideInMenu: true,
      title: "系统管理"
    },
    component: Main,
    children: [
      {
        path: "/view-script-log/single",
        name: "view-script-log-single",
        meta: {
          icon: "ios-analytics",
          hideInMenu: true,
          title: "脚本日志",
          notCache: true,
          path: "system-management/view-script-log.vue",
        },
        component: () => import("./views/system-management/view-script-log.vue")
      }
    ]
  },
  // {
  //   path: "/organizational-model/user-management/single",
  //   name: "user-management-single",
  //   component: () => import("./views/organizational-model/user-management.vue")
  // },
  // {
  //   path: "/organizational-model/users-management/single",
  //   name: "users-management-single",
  //   component: () => import("./views/organizational-model/users-management.vue")
  // },
  // {
  //   path: "/organizational-model/online-management/single",
  //   name: "online-management-single",
  //   component: () => import("./views/organizational-model/online-management.vue")
  // },
  //
  // {
  //   path: "/data-model/attributes-lib/single",
  //   name: "attributes-lib-single",
  //   component: () => import("./views/data-model/AttributesLib.vue")
  // },
  // {
  //   path: "/data-model/internal-entity-modeling/single",
  //   name: "internal-entity-modeling-single",
  //   component: () => import("./views/data-model/InternalEntityModeling.vue")
  // },
  // {
  //   path: "/data-model/relation-modeling/single",
  //   name: "relation-modeling-single",
  //   component: () => import("./views/data-model/RelationModeling.vue")
  // },
  // {
  //   path: "/data-model/data-source-mgr/single",
  //   name: "data-source-mgr-single",
  //   component: () => import("./views/data-model/DataSourceMgr.vue")
  // },
  // {
  //   path: "/data-model/external-entity-modeling/single",
  //   name: "external-entity-modeling-single",
  //   component: () => import("./views/data-model/ExternalEntityModeling.vue")
  // },
  //
  // {
  //   path: "/form-engine/form-management/single",
  //   name: "form-management-single",
  //   component: () => import("./views/form-engine/form-management.vue")
  // },
  // {
  //   path: "/form-engine/relationForm-management/single",
  //   name: "relationForm-management-single",
  //   component: () => import("./views/form-engine/relationForm-management.vue")
  // },
  //
  // {
  //   path: "/functional-model/application-management/single",
  //   name: "application-management-single",
  //   component: () => import("./views/functional-model/application-management.vue")
  // },
  // {
  //   path: "/functional-model/applicationTree-management/single",
  //   name: "applicationTree-management-single",
  //   component: () => import("./views/functional-model/applicationTree-management.vue")
  // },
  // {
  //   path: "/functional-model/globalOperation-management/single",
  //   name: "globalOperation-management-single",
  //   component: () => import("./views/functional-model/globalOperation-management.vue")
  // },
  // {
  //   path: "/functional-model/entity-class-operation/single",
  //   name: "entity-class-operation-single",
  //   component: () => import("./views/functional-model/entity-class-operation.vue")
  // },
  // {
  //   path: "/functional-model/relation-class-operation/single",
  //   name: "relation-class-operation-single",
  //   component: () => import("./views/functional-model/relation-class-operation.vue")
  // },
  //
  // {
  //   path: "/auth-model/auth-brief/single",
  //   name: "AuthBrief-single",
  //   component: () => import("./views/auth-model/AuthBrief.vue")
  // },
  // {
  //   path: "/auth-model/auth-block/single",
  //   name: "auth-bloc-single",
  //   component: () => import("./views/auth-model/AuthBlock.vue")
  // },
  // {
  //   path: "/auth-model/attr-access-rule/single",
  //   name: "attr-access-rule-single",
  //   component: () => import("./views/auth-model/AttrAccessRule.vue")
  // },
  // {
  //   path: "/auth-model/obj-access-rule/single",
  //   name: "obj-access-rule-single",
  //   component: () => import("./views/auth-model/ObjAccessRule.vue")
  // },
  //
  // {
  //   path: "/workflow/wf-modeler/single",
  //   name: "wf-modeler-single",
  //   component: () => import("./views/workflow/wf-modeler.vue")
  // },
  // {
  //   path: "/workflow/wf-admin/single",
  //   name: "wf-admin-single",
  //   component: () => import("./views/workflow/wf-admin.vue")
  // },
  //
  // {
  //   path: "/model-package/model-package-manage/single",
  //   name: "model-package-manage-single",
  //   component: () => import("./views/model-package/model-package-manage.vue")
  // },
];

const singleRoutes = [
  {
    path: "/organizational-model/user-management/single",
    name: "user-management-single",
  },
  {
    path: "/organizational-model/users-management/single",
    name: "users-management-single",
  },
  {
    path: "/organizational-model/online-management/single",
    name: "online-management-single",
  },
  
  {
    path: "/data-model/attributes-lib/single",
    name: "attributes-lib-single",
  },
  {
    path: "/data-model/internal-entity-modeling/single",
    name: "internal-entity-modeling-single",
  },
  {
    path: "/data-model/relation-modeling/single",
    name: "relation-modeling-single",
  },
  {
    path: "/data-model/data-source-mgr/single",
    name: "data-source-mgr-single",
  },
  {
    path: "/data-model/external-entity-modeling/single",
    name: "external-entity-modeling-single",
  },
  
  {
    path: "/form-engine/form-management/single",
    name: "form-management-single",
  },
  {
    path: "/form-engine/relationForm-management/single",
    name: "relationForm-management-single",
  },
  
  {
    path: "/functional-model/application-management/single",
    name: "application-management-single",
  },
  {
    path: "/functional-model/applicationTree-management/single",
    name: "applicationTree-management-single",
  },
  {
    path: "/functional-model/globalOperation-management/single",
    name: "globalOperation-management-single",
  },
  {
    path: "/functional-model/entity-class-operation/single",
    name: "entity-class-operation-single",
  },
  {
    path: "/functional-model/relation-class-operation/single",
    name: "relation-class-operation-single",
  },
  
  {
    path: "/auth-model/auth-brief/single",
    name: "AuthBrief-single",
  },
  {
    path: "/auth-model/auth-block/single",
    name: "auth-bloc-single",
  },
  {
    path: "/auth-model/attr-access-rule/single",
    name: "attr-access-rule-single",
  },
  {
    path: "/auth-model/obj-access-rule/single",
    name: "obj-access-rule-single",
  },
  
  {
    path: "/workflow/wf-modeler/single",
    name: "wf-modeler-single",
  },
  {
    path: "/workflow/wf-admin/single",
    name: "wf-admin-single",
  },
  
  {
    path: "/model-package/model-package-manage/single",
    name: "model-package-manage-single",
  },
];

export {singleRouters, singleRoutes};
