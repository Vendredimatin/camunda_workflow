<template>
    <div>
        <Row type="flex" justify="center" align="middle">
            <Col span="12">
                <div class="app-wrap">
                    <h2 v-show="hadAppAuth">请选择启动应用</h2>
                    <ul class="app-content">
                        <Row v-show="hadAppAuth">
                            <Col span="7" v-for="item in allApp" :key="item.id" offset="1" style="margin-bottom: 20px;" @click.native="createModule(item)">
                                <li>
                                    <Card>
                                        <div style="width: 100px; height: 100px; margin: 0 auto;">
                                            <img :src="item.extConfig.logoImg == ''? noLogo : item.extConfig.logoImg" alt="">
                                        </div>
                                        <Tooltip :content="item.title" class="item-title-tip">
                                            <p class="item-title">{{ item.title.length > 12 ? item.title.substring(0, 10) + '...' : item.title }}</p>
                                        </Tooltip>
                                    </Card>
                                </li>
                            </Col>
                        </Row>
                        <Row v-show="!hadAppAuth" style="text-align: center;">
                            <span style="font-size: 18px;margin-right: 10px;">当前用户对所有应用均没有访问权限，请联系管理员</span>
                            <Button type="text" @click="switchUser" style="color: #2db7f5">切换用户, 重新登录</Button>
                        </Row>
                    </ul>
                </div>
            </Col>
        </Row>
    </div>
</template>
<script>
    import { getApps, getAppInfo } from "@/api/others";
    import appLogo from "@/assets/images/dLogo.jpg";
    import { mapActions } from "vuex";
    export default {
        data() {
            return {
                allApp: [],
                noLogo: appLogo,
                hadAppAuth: true
            }
        },

        created() {
            this.$Spin.show();
            getApps('PC').then(response => {
                this.$Spin.hide();
                let res = response.data;

                if(!res.success) {

                    this.hadAppAuth = false;
                    this.$Message.error(res.message);

                } else {
                    if(res.data && res.data.length > 0) {

                        for (var i in res.data) {
                            if(!res.data[i].extConfig || res.data[i].extConfig == '') {
                                res.data[i].extConfig = {
                                    indexPageUrl: '',
                                    // appColor: '#495060',
                                    skinStyle: 'light',
                                    logoImg: appLogo,
                                    flexDeriction: '左右任务栏布局',
                                    icoImg: appLogo,
                                    cssName: '',
                                    extendCss: ''
                                }
                            } else {

                                try {

                                    res.data[i].extConfig = JSON.parse(res.data[i].extConfig);
                                    if(res.data[i].extConfig.logoImg.indexOf('modeler-web') != -1) {
                                        res.data[i].extConfig.logoImg = appLogo;
                                    }

                                } catch(e) {

                                    res.data[i].extConfig = {
                                        indexPageUrl: '',
                                        // appColor: '#495060',
                                        skinStyle: 'light',
                                        logoImg: appLogo,
                                        flexDeriction: '左右任务栏布局',
                                        icoImg: appLogo,
                                        cssName: '',
                                        extendCss: ''
                                    }

                                }

                            }
                        }

                        this.allApp = res.data;
                    } else {
                        this.allApp = [];
                    }
                }
            }).catch(e => {
                this.$Spin.hide();
                console.log(e);
            });
        },

        methods: {
            ...mapActions(["handleLogOut"]),

            createModule(appItem) {

                sessionStorage.setItem('selfJs', '');
                localStorage.setItem('changeAppId', appItem.id);

                // if(appItem.appName == 'default') {
                //     localStorage.setItem('changeAppName', 'app-web');
                //     sessionStorage.setItem('appName', 'app-web');
                // } else {
                    localStorage.setItem('changeAppName', appItem.appName);
                    sessionStorage.setItem('appName', appItem.appName);
                // }

                sessionStorage.setItem("shareAboutName", appItem.appName);
                sessionStorage.setItem('shareFullPath', null);
                sessionStorage.setItem('indexPageUrl', null);
                sessionStorage.setItem('indexPageOpr', null);

                getAppInfo(appItem.appName).then(response => {

                    let res = response.data;

                    if(!res.data.extConfig) {
                        sessionStorage.setItem('logoImg', null);
                        // sessionStorage.setItem('appColor', null);
                        sessionStorage.setItem('appTitle', '清华数为');
                        sessionStorage.setItem('skinStyle', 'light');
                        sessionStorage.setItem('appDirection', '左右任务栏布局');
                    }
                    sessionStorage.setItem('selfLoginName', res.data.startPageURL);
                    this.$store.state.targetRouter = [];
                    window.sessionStorage.job = '[]';
                    sessionStorage.tagNaveList = '[]';
                    window.localStorage.job = '[]';
                    this.$router.options.routes = [];
                    console.log(this.$router)
                    sessionStorage.setItem('chooseToAbout', 'chooseApp');
                    this.$router.push({name: 'about'});
                    // this.handleLogOut({}).then(() => {
                    //     this.$router.push({name: 'logout'});
                    //     localStorage.setItem('refshFlag', 6);
                    // });
                }).catch(error => {
                    console.log(error);
                    this.$Message.error(error);
                });

            },

            /**
             * @description 切换用户重新登录
            */
            switchUser() {

                this.$router.push({name: 'logout'});

            }
        }
    }
</script>
<style scoped>
.item-title-tip>>>.ivu-tooltip-inner {
    white-space: normal;
    word-break: break-all;
}
</style>
<style scoped lang="less">
    .app-wrap {
        padding-top: 50px;
        h2 {
            height: 28px;
            line-height: 28px;
            font-size: 20px !important;
            color: #000;
            margin-bottom: 28px;
            text-align: center;
        }

        .app-content li{
            list-style: none;
            text-align: center;

            img {
                width: 100px;
                height: 100px;
            }
        }
    }

    .item-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #333;
    }

</style>
