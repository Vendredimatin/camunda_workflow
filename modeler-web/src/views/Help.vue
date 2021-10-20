<template>
  <div style="position:relative;top: 0px;" :style="{'height': height, 'overflow-y': 'auto'}">
    <div  class="home">
      <div class="home-banner" :class="[oversize ? 'hidden': '']">
        <img :src="homePage" alt="">
      </div>
      <div class="home-content">
        <div class="home-card" v-for="(module, index) in homeData">
          <div class="home-card-index">
            <img :src="module.indexPic" alt="">
          </div>
          <p class="home-card-title">{{ module.title }}</p>
          <p class="home-card-description">{{ module.description }}</p>
          <Button class="home-card-button" :disabled="module.disabled" @click="goToModule(module.type)">
            <span>{{ module.name === 'help' ? '开始学习' : '开始使用' }}</span>
          </Button>
        </div>
      </div>
    </div>
    <!--    <iframe sandbox="allow-scripts allow-same-origin allow-popups" v-show="showIframe" :src="indexUrl" style="width: 100%;position: absolute;top: 0px" :style="{'height': height}">-->
    <!--    </iframe>-->
  </div>
</template>

<script>
import homePage from '@/assets/images/main.png';
import main01 from '@/assets/images/main01.png';
import main02 from '@/assets/images/main02.png';
import main03 from '@/assets/images/main03.png';
import main04 from '@/assets/images/main04.png';
import main05 from '@/assets/images/main05.png';
import main06 from '@/assets/images/main06.png';
import main07 from '@/assets/images/main07.png';

export default {
  props:[
    'router',
    'route',
    'root'
  ],
  data() {
    return {
      showIframe: true,
      indexUrl: '',
      height: document.body.clientHeight - 97 + 'px',
      homePage: homePage,
      homeData: [
        {
          indexPic: main01,
          title: '数据模型',
          description: '通过创建实体类/关联类，自动在数据库中创建数据表，并生成增删改查相关接口；通过外部实体类可用映射已有表结构数据，自动生成增删改查相关接口。',
          type: 'DataModel/AttributesLib',
          name: 'DataModel',
          disabled: false,
        },
        {
          indexPic: main02,
          title: '表单模型',
          description: '通过拖拽所见即所得的方式快速创建页面，DWF提供7大类，51种控件；仅需要将控件拖拽到工作区，并绑定实体类/关联类的属性即可实现数据的展示。',
          type: 'FormEngine/FormManagement',
          name: 'FormEngine',
          disabled: false,
        },
        {
          indexPic: main03,
          title: '功能模型',
          description: '通过功能模型中的应用管理设置，可以为用户生成独立运行的应用界面；一个DWF可以搭建出多个应用，通过授权模型实现不同用户查看不同的功能。',
          type: 'FunctionalModel/ApplicationManagement',
          name: 'FunctionalModel',
          disabled: false,
        },
        {
          indexPic: main04,
          title: '组织模型',
          description: 'DWF的用户体系，可以在组织模型中创建用户，创建用户组；通过用户组可以完成企业的组织结构的维护；利用授权模型和组织模型可以实现权限管理。',
          type: 'OrganizationalModel/UserManagement',
          name: 'OrganizationalModel',
          disabled: false,
        },
        {
          indexPic: main05,
          title: '授权模型',
          description: 'DWF提供了基于组织的授权、基于功能的授权、数据访问控制和对象访问控制；利用这四种授权方式可以最小粒度控制到数据层面的访问权限。',
          type: 'AuthModel/AuthBrief',
          name: 'AuthModel',
          disabled: false,
        },
        {
          indexPic: main06,
          title: '模型管理',
          description: '模型包主要用于在不同的DWF实例迁移模型数据，允许建模用户在DWF实例设置快照，将快照导出成模型包，在另外的DWF实例导入，实现模型数据的迁移。',
          type: 'ModelPackage/ModelPackageManage',
          name: 'ModelPackage',
          disabled: false,
        },
        {
          indexPic: main07,
          title: '在线帮助',
          description: 'DWF提供了完备的在线培训手册，可以通过快速入门体验DWF功能，对于脚本的编写可以通过查看手册进行学习。',
          type: 'help',
          name: 'help',
          disabled: false,
        },
      ],
    }
  },
  created() {
    let modules = this.router.options.routes.map(route => route.name);
    try {
      this.homeData.forEach(page => {
        page.disabled = !modules.includes(page.name) && page.name !== 'help';
        if(modules.includes(page.name) && page.name !== 'help'){
          let route = this.router.options.routes.find(route => route.name === page.name);
          if(route && route.children.length === 0){
            page.disabled = true;
          }else if(route && route.children.length !== 0){
            page.type = route ? route.children[0].name : page.type;
          }
        }
      })
    }catch (e){
      console.error(e)
    }
  },
  mounted() {
  },
  computed:{
    oversize(){
      return document.body.clientWidth < 1400
    }
  },
  watch: {},
  methods: {
    goToModule(module){
      if(module === 'help'){
        window.open(`http://ise.thss.tsinghua.edu.cn/confluence/display/DWF`);
      }else{
        this.root.turnToPage(module)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.hidden{
  display: none;
}
.home{
  align-items: center;
  height: 100%;
  text-align: center;
  width: 100%;

  .home-banner{
    width: 100%;
    text-align: center;

    img{
      width: 50%;
    }
  }

  .home-content{
    display: flex;
    flex-direction: row;
    width: 90%;
    margin: 0 5%;
    flex-wrap: wrap;

    .home-card{
      width: 23%;
      //height: 31%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 1% 1%;
      border: 1px solid #eeeeee;
      position: relative;

      .home-card-index{
        margin-top: 5%;
      }

      .home-card-title{
        font-size: 24px;
        color: #535C70;
        margin: 4% 0 2% 0;
      }

      .home-card-description{
        text-align: start;
        font-size: 12px;
        color: #6E788E;
        width: 90%;
        min-height: 57px;
        margin-bottom: 50px;
      }

      .home-card-button{
        width: 170px;
        height: 40px;
        border-radius: 20px;
        border: 1px solid #DDDDDD;
        background: transparent;
        position: absolute;
        bottom: 1%;

        span{
          font-size: 16px;
          font-weight: 600;
          color: #535C70;
        }
      }

      .home-card-button:hover{
        background: #2D8CF0;
        border: 1px solid #DDDDDD;

        span{
          color: #FFFFFF;
        }
      }
    }

    .home-card:hover{
      background: #FFFFFF;
      box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(45, 140, 240, 0.5);

      .home-card-title{
        color: #2D8CF0;
      }
    }
  }
}
</style>
