<template>
  <div class="about self-about">
    {{ aboutTxt }}
  </div>
</template>
<script>
  import { getMenuByRouter } from "../libs/utils";
  import { getAppInfo, getAllModules, getModuleOperations } from "@/api/others";
  import defaultLogo from "@/assets/images/dLogo.jpg";
  export default {
    data() {
      return {
        aboutTxt: ''
      }
    },
    async created() {
        this.$Spin.show();
        // window.sessionStorage.job = null;
        window.sessionStorage.job = '[]';
        sessionStorage.tagNaveList = '[]';
        let searchStr = sessionStorage.getItem("shareAboutName");
        let curUrl = 'default';
        if(searchStr) {
          curUrl = searchStr;
        }
        console.log(curUrl);

        try {
          let list = await getAppInfo(curUrl);
          if('data' in list.data) {

            let appInfo = list.data.data;

            sessionStorage.setItem("shareAppName", appInfo.appName);

            // 修改网页title
            if(appInfo.title != '' && appInfo.title != null) {
              document.title = appInfo.title || '清华数为';
            } else {
              document.title = '清华数为';
              sessionStorage.setItem('appDirection', '左右任务栏布局');
            }

            try {
              if(!appInfo.extConfig || appInfo.extConfig == '') {

                sessionStorage.setItem('appTitle', '清华数为');
                sessionStorage.setItem('skinStyle', 'light');
                sessionStorage.setItem('appDirection', '左右任务栏布局');

                if(appInfo.startPageURL != '' && appInfo.startPageURL == 'about:blank') {

                  sessionStorage.setItem('selfLoginName', 'login');

                }

              } else {

                appInfo.extConfig = JSON.parse(appInfo.extConfig);
                sessionStorage.setItem('appTitle', appInfo.title);
                sessionStorage.setItem('appName', appInfo.appName);
                sessionStorage.setItem('indexPageUrl', appInfo.extConfig.indexPageUrl || 'home');
                sessionStorage.setItem('indexPageOpr', appInfo.extConfig.indexPageOpr || '');
                sessionStorage.setItem('appShowTabs', appInfo.extConfig.showTabs || 'show');
                if(appInfo.startPageURL != '' && appInfo.startPageURL == 'about:blank') {

                  sessionStorage.setItem('selfLoginName', 'login');

                } else {

                  sessionStorage.setItem('selfLoginName', appInfo.startPageURL || 'login');

                }

                // Dark / Light皮肤切换
                if(appInfo.extConfig.skinStyle == 'dark') {
                  import('@/assets/selfCss/testApp.css')
                }

                // 额外的样式表引入 延迟执行 样式渲染级别 高于默认(明亮)样式高于暗黑样式
                if(appInfo.extConfig.extendCss) {
                  sessionStorage.setItem('selfStyle', appInfo.extConfig.extendCss);
                  setTimeout(() => {
                    var style = document.createElement('style');
                    style.type = 'text/css';
                    style.id = 'selfExtendCss';
                    style.innerHTML = appInfo.extConfig.extendCss;
                    document.getElementsByTagName('head')[0].appendChild(style);
                  }, 10);
                } else {
                  sessionStorage.setItem('selfStyle', '');
                  // setTimeout(() => {
                  //   console.log('删除样式哇')
                  //   try {
                  //     document.getElementsByTagName('head').item(0).removeChild(document.getElementById('selfExtendCss'));
                  //   } catch (error) {
                  //     console.log(error)
                  //   }
                  // }, 0);
                }

                // 外部脚本引入 默认追加在body末尾
                if(appInfo.extConfig.extendJs && appInfo.extConfig.extendJs != '') {
                  sessionStorage.setItem('selfJs', appInfo.extConfig.extendJs);
                  setTimeout(() => {
                    var new_js = document.createElement("script");
                    new_js.setAttribute("type", "text/javascript");
                    new_js.innerHTML = appInfo.extConfig.extendJs;
                    document.body.appendChild(new_js);
                  }, 0);
                }

                // ico文件追加
                let finalIcon = defaultLogo;
                if(appInfo.extConfig.icoImg != '' && appInfo.extConfig.icoImg.indexOf('modeler-web') == -1) {
                  finalIcon = appInfo.extConfig.icoImg;
                }
                var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = finalIcon;
                document.getElementsByTagName('head')[0].appendChild(link);

              }


            } catch (error) {

              sessionStorage.setItem('appTitle', '清华数为');
              sessionStorage.setItem('skinStyle', 'light');
              sessionStorage.setItem('appDirection', '左右任务栏布局');

            }

            if(appInfo.extConfig.logoImg.indexOf('modeler-web') != -1 || appInfo.extConfig.logoImg == '') {
              sessionStorage.setItem('logoImg', '');
            } else {
              sessionStorage.setItem('logoImg', appInfo.extConfig.logoImg);
            }

            if(appInfo.extConfig.icoImg.indexOf('modeler-web') != -1 || appInfo.extConfig.icoImg == '') {
              sessionStorage.setItem('icoImg', defaultLogo);
            } else {
              sessionStorage.setItem('icoImg', appInfo.extConfig.icoImg);
            }

            sessionStorage.setItem('appDirection', appInfo.extConfig.flexDeriction || '左右任务栏布局');
            sessionStorage.setItem('skinStyle', appInfo.extConfig.skinStyle || 'light');

            let appId = `?appId=${list.data.data.id}`;
            // 显示默认模块
            let withDefaultModule = true
            let res = await getAllModules(appId, withDefaultModule);

            let newRoutes = [];
            let promises = [];
            let actionToView = {
              list: "Multi",
              implement: "Implement",
              create: "Create",
              creates: "Creates",
              visit: "Single",
              edit: "SingleEdit",
              url: "Url",
              folder: "Folder"
            }

            if(res.data && res.data.length > 0) {
              let defaultAppId = res.data[0].appId
              res.data.forEach((item, index) => {

                let eachIndex = index;
                // 是否是默认模块
                let isDefault = defaultAppId.slice(0,-6) === item.className.slice(3,-3)
                let defaultObj = {}
                if(isDefault){
                  defaultObj = {
                    className: item.className,
                    pIndex: eachIndex
                  }
                }

                let currentRoute = {
                  path: "/" + item.className,
                  name: item.className,
                  pIndex: eachIndex,
                  meta: {
                    condition: item.conditionExpre ? item.conditionExpre : "",
                    icon: item.packagePath ? item.packagePath.indexOf('icon-') == -1 ? item.packagePath : `iconfont ${item.packagePath}` : '',
                    title: item.displayName,
                    hideInMenu: false,
                  },
                  component: () => import("@/views/main/Main.vue"),
                  children: []
                };

                let _promise = getModuleOperations(item.className, withDefaultModule).then(res => {

                  if(!res.success || !res.data) {
                    return;
                  } else {
                    // 快速查询操作
                    let queryOperations = res.data.queryOprConfigs;
                    queryOperations.forEach(item => {
                      // folder动作类型 增加菜单下拉面板
                      if (item.action == "folder") {
                        if (item.children.length > 0) {
                          let folderArr = [];

                          item.children.forEach(val => {

                            let finalIcon = '';
                            if('icon' in val) {
                              if(val.icon != '' && val.icon != undefined) {
                                if(val.icon.indexOf('icon-') == -1) {
                                  finalIcon = val.icon;
                                } else {
                                  finalIcon = `iconfont ${val.icon}`;
                                }
                              }
                            }

                            let eachFolder = {
                              path: val.authority,
                              name: val.moduleName + "/" + val.authority,
                              meta: {
                                targetClass: val.targetClass,
                                viewName: val.viewName || '',
                                condition: val.conditionExpre ? val.conditionExpre : "",
                                action: val.action,
                                icon: finalIcon,
                                title: val.displayName,
                                hideInMenu: false,
                                path: `default/${actionToView[val.action]}.vue`,
                                params: val.params,
                              },
                              component: null
                            };
                            folderArr.push(eachFolder);
                          });

                          let finalMIcon = '';
                          if('icon' in item) {
                            if(item.icon != '' && item.icon != undefined) {
                              if(item.icon.indexOf('icon-') == -1) {
                                finalMIcon = item.icon;
                              } else {
                                finalMIcon = `iconfont ${item.icon}`;
                              }
                            }
                          }

                          currentRoute.children.push({
                            path: item.authority,
                            name: item.moduleName + "/" + item.authority,
                            meta: {
                              targetClass: item.targetClass,
                              viewName: item.viewName || '',
                              condition: item.conditionExpre ? item.conditionExpre : "",
                              action: item.action,
                              icon: finalMIcon,
                              title: item.displayName,
                              hideInMenu: false,
                              path: `default/${actionToView[item.action]}.vue`,
                              params: item.params,
                            },
                            children: folderArr,
                            component: null
                          });
                        }
                      } else {
                        let finalIcon = '';
                        if('icon' in item) {
                          if(item.icon != '' && item.icon != undefined) {
                            if(item.icon.indexOf('icon-') == -1) {
                              finalIcon = item.icon;
                            } else {
                              finalIcon = `iconfont ${item.icon}`;
                            }
                          }
                        }

                        currentRoute.children.push({
                          path: item.authority,
                          name: item.moduleName + "/" + item.authority,
                          meta: {
                            targetClass: item.targetClass,
                            viewName: item.viewName || '',
                            condition: item.conditionExpre ? item.conditionExpre : "",
                            action: item.action,
                            icon: finalIcon,
                            title: item.displayName,
                            hideInMenu: false,
                            targetUrl: item.conditionExpre || "",
                            path: `default/${actionToView[item.action]}.vue`,
                            params: item.params,
                          },
                          component: null
                        });
                      }
                    })

                    if(isDefault){
                      let defaultArr = currentRoute.children
                      defaultArr.map((p, i, array) => {
                        p.path = '/' + p.path
                        p.pIndex = defaultObj.pIndex
                        p.name = p.name.replace(`${defaultObj.className}/`, '')
                        if(!p.children){
                          p.children = []
                        }
                        p.meta.isDefault = isDefault
                        p.component = () => import("@/views/main/Main.vue")
                        return p
                      })
                      newRoutes = newRoutes.concat(defaultArr)
                    } else {
                      newRoutes.push(currentRoute);
                    } 
                  }


                })
                .catch(error => {
                  this.$Spin.hide();
                  console.log(error);
                });
                promises.push(_promise);
              })

              let that = this;
              Promise.all(promises).then(res => {
                var compare = function (prop) {
                  return function (obj1, obj2) {
                      var val1 = obj1[prop];
                      var val2 = obj2[prop];
                      if (val1 < val2) {
                          return -1;
                      } else if (val1 >  val2) {
                          return 1;
                      } else {
                          return 0;
                      }
                  }
                }
                newRoutes.forEach(x => that.$router.options.routes.push(x));
                if(that.$router.options.routes.length == 8) {
                  that.$router.addRoutes(newRoutes);
                }
                that.$router.options.routes.sort(compare('pIndex'));
                that.$store.state.targetRouter = [];
                that.$store.state.targetRouter = getMenuByRouter(that.$router.options.routes);
                newRoutes.forEach(x => {
                  x.component = null;
                  if(x.children && x.children.length > 0){
                    x.children.forEach(y => y.component = null)
                  }
                })
                window.sessionStorage.job = JSON.stringify(newRoutes);

                let hadFullPath = sessionStorage.getItem('shareFullPath');
                console.log(that.$router, hadFullPath);
                sessionStorage.setItem('shareReFlag', 6)
                that.$Spin.hide();
                that.$router.push({ name: 'home' });
                // if(hadFullPath) {

                //   sessionStorage.setItem('shareReFlag', 6)
                //   that.$Spin.hide();
                //   that.$router.push({ name: hadFullPath });

                // } else {

                //   sessionStorage.setItem('shareReFlag', 6)
                //   this.$Spin.hide();
                //   that.$router.push({ name: 'home' });
                // }

              })

            } else {
              this.$Spin.hide();
              this.$store.state.targetRouter = [];
              this.$router.push({ name: "home" });
            }

          } else {
            this.$Spin.hide();
            sessionStorage.setItem("shareAppName", null);
            this.aboutTxt = '无效的分享信息';
          }

        } catch (error) {
          this.$Spin.hide();
          this.$store.state.targetRouter = [];
          this.$store.state.user.token = null;
          window.sessionStorage.job = '[]';
          sessionStorage.tagNaveList = '[]';
          window.localStorage.job = '[]';
          this.$router.options.routes = [];
          sessionStorage.setItem('shareReFlag', 6)
          sessionStorage.setItem("shareAboutToken", '');
          sessionStorage.setItem('chooseToAbout', null);
          this.$router.push({ name: "login" });
          // sessionStorage.setItem("shareAppName", null);
          // this.aboutTxt = '无效的分享信息';
        }

    },

  }
  </script>
