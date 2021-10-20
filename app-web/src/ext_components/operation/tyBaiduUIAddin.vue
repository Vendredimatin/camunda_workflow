<template>
  <div style="" ref="main" class="tuanyuan-search">
    <section v-show="isHome">
      <Row type="flex" justify="center" align="middle">
        <Col span="20" style="text-align: center;">
        </Col>
        <Col span="4" style="text-align: center;">
          <span class="searchOptions" @click="openOptions = !openOptions" style="cursor: pointer">&lt;&lt;高级选项</span>
        </Col>
        <Col span="24" style="text-align: center;">
          <img :src="logo1" alt="">
        </Col>
        <Col span="24">

          <Row type="flex" justify="center" align="middle">
            <Col span="12" style="text-align: center">
              <ul class="main-search-type">
                <li @click="selectMainSearchType('1')" :class="{'active': mainSearchType === '1'}"><span>关键词搜索</span></li>
                <li @click="selectMainSearchType('2')" :class="{'active': mainSearchType === '2'}"><span>语义搜索</span></li>
                <li @click="selectMainSearchType('3')" :class="{'active': mainSearchType === '3'}"><span>知识问答</span></li>
                <li @click="selectMainSearchType('4')" :class="{'active': mainSearchType === '4'}"><span>图表可视化</span></li>
              </ul>
            </Col>
          </Row>
          <Row type="flex" justify="center" align="middle" style="margin: -2px 0 0 0;">
            <Col span="12" style="text-align: center">
              <Input type="text" v-model="keyword" class="keyword"></Input>
              <Button icon="ios-search" class="searchButton" :loading="searchLoading"
                      @click="handleSearch(keyword)"></Button>
<!--              <Button class="searchOptions" @click="openOptions = !openOptions">高级选项</Button>-->
            </Col>
          </Row>
        </Col>

        <Col span="24">
          <div class="hotKeyWord center">
            <ul>
              <li v-for="(item, index) in hotKeyWord" :key="index"><span @click="handleSearch(item)">{{ item }}</span>
              </li>
            </ul>
          </div>
        </Col>

        <!--Col span="24" class="margin-top-10">
          <Row type="flex" justify="start" align="middle" style="" class="center">
            <Col span="6"><h5 class="margin-left-10">搜索数据</h5></Col>
            <Col span="18"><span>{{ searchParams.dataType || '无' }}</span><span>（知识域）</span></Col>
          </Row>
        </Col>
        <Col span="24" class="margin-top-10">
          <Row type="flex" justify="start" align="middle" class="center">
            <Col span="6"></Col>
            <Col span="3" v-for="(item, index) in searchParams.dataTypeList" :key="index"><span>{{ item || '无' }}</span>
            </Col>
          </Row>
        </Col>
        <Col span="24" class="margin-top-10">
          <Row type="flex" justify="start" align="middle" class="center">
            <Col span="6"><h5 class="margin-left-10">图形检索条件</h5></Col>
            <Col span="8"><span>搜索层级</span><span class="margin-left-10">{{ searchParams.graph.level }}</span></Col>
            <Col span="8"><span>最大节点数</span><span class="margin-left-10">{{ searchParams.graph.maxNode }}</span></Col>
          </Row>
        </Col>
        <Col span="24" class="margin-top-10">
          <Row type="flex" justify="start" align="middle" class="center">
            <Col span="6"><h5 class="margin-left-10">文字检索条件</h5></Col>
            <Col span="8"><span>每页节点数</span><span class="margin-left-10">{{ searchParams.text.nodeCount }}</span></Col>
            <Col span="8"><span>最大根节点数</span><span class="margin-left-10">{{ searchParams.text.maxNode }}</span></Col>
          </Row>
        </Col>
        <Col span="24" class="margin-top-10">
          <Row type="flex" justify="start" align="middle" class="center">
            <Col span="6"><h5 class="margin-left-10">显示模型</h5></Col>
            <Col span="3"><span>{{ searchParams.displayType }}</span></Col>
          </Row>
        </Col-->
      </Row>
    </section>
    <section v-show="!isHome">
      <Row type="flex" justify="center" align="middle">
        <Col span="24" style="border-bottom: 1px solid #eee; padding-bottom: 8px;">
          <div :style="logo2Style" class="logo" style="width: 40px;" @click="isHome = true"></div>

          <Input type="text" v-model="keyword" class="second-keyword">
            <Button slot="append" class="second-searchButton" :loading="searchLoading" @click="handleSearch(keyword)">
              <Icon type="ios-search" size="28" color="#fff" style="display: block;line-height: 33px;"></Icon>
            </Button>
          </Input>

          <RadioGroup class="displayType"
                      @on-change="selectMainSearchType"
                      v-model="mainSearchTypeSecond" type="button">
            <Radio label="1" style="border-radius: 0; height: 33px;">关键词搜索</Radio>
            <Radio label="2" style="border-radius: 0; height: 33px;">语义搜索</Radio>
            <Radio label="3" style="border-radius: 0; height: 33px;">知识问答</Radio>
            <Radio label="4" style="border-radius: 0; height: 33px;">图表可视化</Radio>
          </RadioGroup>

<!--          <Button class="second-searchOptions" @click="openOptions = !openOptions">高级选项</Button>-->
        </Col>
        <br/>
      </Row>
      <Row type="flex" justify="center">
        <Col :span="mainSpan">
          <Row type="flex" justify="center" align="middle" v-show="searchParamsOptions.displayType === '文字'">
            <Col span="24">
              <span style="float: left;margin: 5px 15px;">查询：</span>
              <Breadcrumb style="margin: 5px 0px;">
                <BreadcrumbItem v-for="(item, index) in breadcrumbItem" :key="index"
                                :class="{'link': index !== breadcrumbItem.length -1 }"
                                @click.native="handleBreadcrumb(index, index !== breadcrumbItem.length -1)">{{
                  item.value }}
                </BreadcrumbItem>
              </Breadcrumb>
            </Col>
            <Col span="24">
              <Tabs v-show="!searchLoading" :value="currentTab" class="optionsTypes" @on-click="handleChangeType">
                <TabPane v-for="(item, index) in optionsTypes" :key="index" :label="item.label" :name="item.name"
                         v-if="item.status === 'active'">
                  <ul v-if="item.name !== 'detail'">
                    <li class="result-list" v-for="(obj, objIndex) in item.objs" :key="objIndex">
                      <p class="result-list-title"
                         :title="obj.displayName"
                         v-html="highLightKeyword(obj.displayName, obj.highLightInfo, obj.dataTypeName)"
                         @click="handleBasicInfo(obj.uuid, index)"></p>
                      <div class="result-list-tags">
                        <Tag v-for="(tag, tagIndex) in obj.linkNode"
                             :class="{'active': tag.linkStatus === 'active'}"
                             @click.native="handleTagInfo(obj.uuid, tag.name, index, tag.linkStatus)"
                             :key="tagIndex" type="border">{{ tag.name }}
                        </Tag>
                      </div>
                    </li>
                  </ul>
                  <section v-if="item.name === 'detail'">
                    <h3>{{ item.objs.displayName }}</h3>
                    <div class="detailWrapper">
                      <ul class="detail">
                        <li v-for="(key, keyIndex) in Object.keys(item.objs.dataDetail)" :key="keyIndex">
                          <span class="detail-key">{{ key + ':' }}</span><span class="detail-value">{{ item.objs.dataDetail[key] }}</span>
                        </li>
                      </ul>
                    </div>
                  </section>
                  <!--              <ul v-if="item.name === 2">-->
                  <!--                <li class="result-list" v-for="(obj, objIndex) in item.objs" :key="objIndex">-->
                  <!--                  <p class="result-list-title" v-html="highLightKeyword(obj.title)"></p>-->
                  <!--                  <div class="result-list-tags">-->
                  <!--                    <Tag v-for="(tag, tagIndex) in obj.tags" :key="tagIndex" type="border">{{ tag.name }}</Tag>-->
                  <!--                  </div>-->
                  <!--                </li>-->
                  <!--              </ul>-->

                  <Page
                          v-if="item.name !== 'detail' && searchTotal !== 0"
                          :total="searchTotal"
                          :show-total="searchShowTotal"
                          :page-size="searchPageSize"
                          style="padding: 15px;"
                          size="small"
                          show-elevator
                          @on-change="handleSearchPageChange"/>
                </TabPane>
              </Tabs>
            </Col>
          </Row>
          <div v-show="searchParamsOptions.displayType === '图形'" style="width: 100%;height: 600px;">
            <iframe :src="graphUrl" frameborder="0" width="100%" height="600px"></iframe>
          </div>
        </Col>
        <Col span="12" style="margin-top: 66px;" v-show="this.mainSearchType === '2' || this.mainSearchType === '3'">
          <iframe :src="relatedGraphUrl" frameborder="0" width="100%" height="600px"></iframe>
        </Col>
      </Row>
    </section>
    <!--    title="高级选项"-->
    <Drawer

            :closable="false"
            v-model="openOptions"
            width="420"
            :transfer="optionsDrawerTransfer"
            :inner="optionsDrawerInner">
      <div slot="header">
        <span class="ivu-drawer-header-inner" style="float: left;margin: 0 0 0 -26%;padding: 19px 13px;width: auto;" @click="openOptions = false">>> 高级选项</span>
      </div>
      <Form :label-width="100" :model="searchParamsOptions" ref="searchForm">
        <section class="form-section" v-show="this.mainSearchType === '1'">
          <div class="clearfix">
            <h5 class="form-section-title" style="float: left;">知识域</h5>
          </div>
          <RadioGroup v-model="searchParamsOptions.dataType" @on-change="dataTypeCheckAllGroupChange">
            <Radio :label="item" v-for="(item, index) in Object.keys(options)" :key="index" :name="item">
              <span>{{ item }}</span>
            </Radio>
          </RadioGroup>
        </section>
        <section class="form-section"
                 v-show="this.mainSearchType === '1'"
                 style="max-height: 200px;overflow-y: scroll;">
          <div class="clearfix">
            <h5 class="form-section-title" style="float: left;">数据类型</h5>
<!--            <Dropdown-->
<!--                    style="float: right;"-->
<!--                    trigger="click" @on-click="handleChangeOptionsType">-->
<!--              <h5>-->
<!--                {{ searchParamsOptions.dataType }}-->
<!--                <Icon type="ios-arrow-down"></Icon>-->
<!--              </h5>-->
<!--              <DropdownMenu slot="list">-->
<!--                <DropdownItem v-for="(item, index) in Object.keys(options)" :key="index" :name="item">{{ item }}-->
<!--                </DropdownItem>-->
<!--              </DropdownMenu>-->
<!--            </Dropdown>-->
          </div>
          <div style="padding-bottom:6px;margin-bottom:6px;">
            <Checkbox
                    :indeterminate="indeterminate"
                    :value="checkAll"
                    @click.prevent.native="handleCheckAll">全选</Checkbox>
          </div>
          <CheckboxGroup v-model="searchParamsOptions.dataTypeList" @on-change="dataTypeListCheckAllGroupChange">
            <Checkbox class="data-type-item" v-for="(item, index) in options[searchParamsOptions.dataType]" :key="item"
                      :label="item">
              <span :title="item">{{ item }}</span>
            </Checkbox>
          </CheckboxGroup>
        </section>
        <section class="form-section" v-show="this.mainSearchType === '4'">
          <h5 class="form-section-title">图检索条件</h5>
          <!--FormItem label="层级">
            <Input type="number" v-model="searchParamsOptions.graph.level"></Input>
          </FormItem-->
          <FormItem label="最大节点数">
            <Input type="number" v-model="searchParamsOptions.graph.maxNode"></Input>
          </FormItem>
        </section>
        <section class="form-section" v-show="this.mainSearchType !== '4'">
          <h5 class="form-section-title">文字检索条件</h5>
          <FormItem label="每页节点数">
            <Input type="number" v-model="searchParamsOptions.text.nodeCount"></Input>
          </FormItem>
          <FormItem label="最大根节点数">
            <Input type="number" v-model="searchParamsOptions.text.maxNode"></Input>
          </FormItem>
        </section>
        <!--section class="form-section">
          <h5 class="form-section-title">显示模型</h5>
          <FormItem>
            <RadioGroup v-model="searchParamsOptions.displayType">
              <Radio label="文字">
                <span>文字</span>
              </Radio>
              <Radio label="图形">
                <span>图形</span>
              </Radio>
            </RadioGroup>
          </FormItem>
        </section-->
      </Form>
      <div class="drawer-footer">
        <Button style="float: left;margin-right: 8px" @click="handleReset">清空</Button>
<!--        <Button style="margin-right: 8px" @click="openOptions = !openOptions">取消</Button>-->
<!--        <Button type="primary" @click="handleSubmit">确定</Button>-->
      </div>
    </Drawer>
  </div>
</template>
http://101.6.240.89:19393/dashboards/knowledgeGraphQA?datasourceID=4&userQuery="个体户王丽"&nodeNum=30
http://101.6.240.89:19393/dashboards/knowledgeGraph?datasourceID=4&userQuery=%22%E4%B8%AA%E4%BD%93%E6%88%B7%E7%8E%8B%E4%B8%BD%22&nodeNum=30
<script>
  import Axios from "axios";
  import logo1 from "@/assets/images/tySearch/tySearchLogo-1.svg";
  import logo2 from "@/assets/images/tySearch/tySearchLogo-2.svg";
  import _ from 'lodash';
  import {uuid} from '@/util/assist'
  import store from "@/store";
  import {createEobj, editEobj, getEobj} from "@/api/others.js";
  // export const createEobj = (name,params)=>{
  //   // const config={headers: {'Content-Type': 'application/json'}};
  //   return axios.post(`${baseObjOther}/omf/entities/${name}/objects-create`,params);
  // };
  // // 修改实体类的单个对象
  // export const editEobj = (name,params)=>{
  //   return  axios.post(`${baseObjOther}/omf/entities/${name}/objects-update`,params);
  // };export const getEobj = async function(name, params) {
  //   return await axios.post(
  //     `${baseObjOther}/omf/entities/${name}/objects`,
  //     params ? params: {}
  //   );
  // };

  const baseUrl = 'http://101.6.240.89:8080';
  const baseTextUrl = '101.6.240.89:38080';
  const baseGraphUrl = '101.6.240.89:19393';
  const ty_axios = Axios.create({
    baseURL: baseUrl,
    withCredentials: false
  });
  ty_axios.interceptors.request.use(
    config => {
      config.headers.Authorization = store.state.user.token;
      // Spin.show()
      // 在发送请求之前做些什么
      return config;
    },
    error => {
      // 对请求错误做些什么
      return Promise.reject(error);
    }
  );
  const name = "tySearchUIAddin";
  export default {
    props: ["store", "root"],
    data() {
      return {
        ty_axios: null,
        logo1: logo1,
        logo2: logo2,
        isHome: true,
        isRootSearch: true,
        keyword: '',
        relatedGraphUrl: '',
        graphUrl: '',
        searchLoading: false,
        options: {},
        openOptions: false,
        optionsDrawerTransfer: false,
        optionsDrawerInner: true,
        metaData: {},
        mainSearchType: '1',
        //TODO:之后能不能和mainSearchType合并？
        mainSearchTypeSecond: '1',
        hotKeyWord: [
          // {value: 9527},
        ],
        indeterminate: true,
        checkAll: false,
        optionsTypes: [
          {
            label: '全部',
            name: 'all',
            objs: []
          },
        ],
        optionsTypesOrigin: [],
        breadcrumbItem: [
          // {value: '挖掘机'},
        ],
        searchParamsOptionsOid: null,
        searchParamsOptions: {
          textDomain: baseTextUrl,
          graphDomain: baseGraphUrl,
          dataType: '全部',
          dataTypeList: [],
          graph: {
            level: 2,
            maxNode: 200
          },
          text: {
            nodeCount: 8,
            maxNode: 200
          },
          displayType: '文字',
        },

        searchParamsOptionsCreate: false,
        currentTab: '',
        searchParams: {},
        queryResults: {},
        nodes: null,
        nodeUUID: '',
        searchTotal: 0,
        searchShowTotal: true,
        searchPageSize: 0,
        // surl: "http://localhost:6060",
        // surl: "http://192.168.1.81:6060",

        logo2Style:{
          'width': '78px',
          'height': '40px',
          'margin': '0 10px',
          'cursor': 'pointer',
          'float': 'left',
          'background-size': 'cover',
          'background-position': 'left 7px',
          'background-image': `url(${logo2})`,
        }
      };
    },
    created() {

    },
    beforeMount() {
      this.searchParams = _.cloneDeep(this.searchParamsOptions);
    },
    mounted() {
      this.setInheritStyle();
      if (sessionStorage.getItem('ty-hotKeyWord')) {
        this.hotKeyWord = JSON.parse(sessionStorage.getItem('ty-hotKeyWord')).slice(0, 5);
      } else {
        this.hotKeyWord = [];
      }
      this.initSearchParamsOptions();
    },
    computed: {
      mainSpan(){
        return this.mainSearchType === '1' || this.mainSearchType === '4' ? 24 : 12;
      }
    },
    methods: {
      setInheritStyle() {
        this.$refs.main.querySelector(".keyword .ivu-input").style.height = 'inherit';
        this.$refs.main.querySelector(".keyword .ivu-input").style.border = '1px solid #E00223';
        this.$refs.main.querySelector(".keyword .ivu-input").style.borderRadius = '0';
        this.$refs.main.querySelector(".second-keyword .ivu-input").style.height = 'inherit';
        this.$refs.main.querySelector(".second-keyword .ivu-input").style.border = '1px solid #3C2786';
        this.$refs.main.querySelector(".second-keyword .ivu-input").style.borderRadius = '0';
      },
      /**
       * 初始化元数据
       * @metaData元数据
       * 获取用户配置项
       */
      async initSearchParamsOptions() {
        let data;
        if (sessionStorage.getItem("tySchemachartinfos")) {
          data = sessionStorage.getItem("tySchemachartinfos");
          this.metaData = JSON.parse(data);
        } else {
          this.searchParamsOptions.textDomain = this.searchParamsOptions.textDomain || baseTextUrl;
          data = await Axios.get(
            `http://${this.searchParamsOptions.textDomain}/dw/knowledgemap/meta/schemaChartInfos?jsonName=tySchemachartinfosJson`,
          );
          this.metaData = data.data;
          sessionStorage.setItem("tySchemachartinfos", JSON.stringify(this.metaData));
        }
        // JSON.parse('{"nodes":[{"domainName":"故障诊断","name":"挖掘机"},{"domainName":"故障诊断","name":"客户"},{"domainName":"数据血缘","name":"任务"}],"links":[{"sourceNode":"挖掘机","linkType":"属于","targetNode":"客户"},{"sourceNode":"概念1","linkType":"关系1","targetNode":"概念2"},{"sourceNode":"概念1","linkType":"关系2","targetNode":"概念3"}]}').nodes;

        //通过元数据初始化知识域
        this.resetOptionsTypes();
        //获取用户设置
        let res = await getEobj('ApplicationOptions', {
          condition: `and plt_userID='${sessionStorage.getItem("userId")}'`
        });
        res = res.data.data;
        if (res.length !== 0) {
          this.searchParamsOptionsOid = res[0].oid;
          this.searchParamsOptions = JSON.parse(res[0].optionValue);
          this.searchParams = _.cloneDeep(this.searchParamsOptions);
          this.dataTypeListCheckAllGroupChange(this.searchParamsOptions.dataTypeList);
        } else {
          this.handleReset();
        }
      },
      selectMainSearchType(type) {
        if(this.isHome){
          this.mainSearchType = type;
          this.searchParamsOptions.displayType = type === '4' ? '图形' : '文字';
        }else{
          // TODO 和首页搜索分开this.handleSearch();
          this.mainSearchTypeSecond = type;
        }
      },
      /**
       * 搜索主方法
       * @keyword:关键词
       * @searchType:array知识域列表或string搜全部
       * @page页数
       */
      async handleSearch(keyword = this.keyword, searchType = this.searchParams.dataTypeList, page = 1) {
        //FIXME:先用来解决数据库，没存domain的情况
        this.searchParamsOptions.textDomain = this.searchParamsOptions.textDomain || baseTextUrl;
        this.searchParamsOptions.graphDomain = this.searchParamsOptions.graphDomain || baseGraphUrl;
        await this.handleSubmit();
        //设置根搜索标记为true
        this.isRootSearch = true;
        let dataTypeList = searchType;
        if (typeof searchType === 'string') {
          dataTypeList = searchType === 'all' ? this.searchParams.dataTypeList : [dataTypeList];
        } else {
          //1首次搜索，2重新设置搜索条件搜索
          //通过元数据初始化知识域
          this.resetOptionsTypes();
          this.searchLoading = true;
          dataTypeList = this.searchParams.dataTypeList
        }
        this.keyword = keyword;
        let url = '';
        let params = {};
        !this.isHome
          ? this.mainSearchType = this.mainSearchTypeSecond
          : this.mainSearchTypeSecond = this.mainSearchType,
            this.searchParamsOptions.displayType = this.mainSearchType === '4' ? '图形' : '文字';
        switch (this.mainSearchType) {
          case '1':
            url = `http://${this.searchParamsOptions.textDomain}/dw/knowledgemap/app/queryByCondition?jsonName=tySearchConditionJson`;
            params = {
              maxNodesNum: this.searchParams.text.maxNode,
              eachPageNodeNum: this.searchParams.text.nodeCount,
              curPageNum: page,
              dataTypeList: dataTypeList,
              userQuery: keyword,
              displayMode: '文字'
            };
            break;
          case '2':
            url = `http://${this.searchParamsOptions.textDomain}/dw/knowledgemap/app/queryByConditionSchema?jsonName=tySearchConditionJson`;
            params = {
              maxNodesNum: this.searchParams.text.maxNode,
              eachPageNodeNum: this.searchParams.text.nodeCount,
              curPageNum: page,
              userQuery: keyword,
            };
            this.relatedGraphUrl = `http://${this.searchParamsOptions.graphDomain}/dashboards/knowledgeGraphSchema?datasourceID=14&userQuery=${keyword}&nodeNum=${this.searchParams.graph.maxNode}`;
            break;
          case '3':
            url = `http://${this.searchParamsOptions.textDomain}/dw/knowledgemap/app/queryByConditionQA?jsonName=tySearchConditionJson`;
            params = {
              maxNodesNum: this.searchParams.text.maxNode,
              eachPageNodeNum: this.searchParams.text.nodeCount,
              curPageNum: page,
              userQuery: keyword,
            };
            this.relatedGraphUrl = `http://${this.searchParamsOptions.graphDomain}/dashboards/knowledgeGraphQA?datasourceID=15&userQuery=${keyword}&nodeNum=${this.searchParams.graph.maxNode}`;
            break;
          case '4':
            url = `http://${this.searchParamsOptions.textDomain}/dw/knowledgemap/app/queryByCondition?jsonName=tySearchConditionJson`;
            params = {
              maxNodesNum: this.searchParams.text.maxNode,
              eachPageNodeNum: this.searchParams.text.nodeCount,
              curPageNum: page,
              dataTypeList: dataTypeList,
              userQuery: keyword,
              displayMode: '文字'
            };
            this.graphUrl = `http://${this.searchParamsOptions.graphDomain}/dashboards/knowledgeGraph?datasourceID=13&userQuery=${keyword}&nodeNum=${this.searchParams.graph.maxNode}`;
            break;
          default:
            break;
        }
        try {
          let data = await Axios.post(url, params);
          // this.graphUrl = `http://101.6.240.89:19393/dashboards/knowledgeGraph?datasourceID=1&userQuery=${keyword}&nodeNum=${this.searchParams.graph.maxNode}`;
          // this.graphUrl = `http://101.6.240.89:19393/dashboards/knowledgeGraph?datasourceID=1&userQuery="石家庄"&nodeNum=20&`;
          // this.graphUrl = `/dw/knowledgemap/app/queryByCondition?jsonName=tySearchConditionJson&maxNodesNum=${this.searchParams.text.maxNode}&eachPageNodeNum=${this.searchParams.text.nodeCount}&curPageNum=${page}&dataTypeList=${JSON.stringify(dataTypeList)}&userQuery=${keyword}&displayMode=图片`
          // console.log(`/dw/knowledgemap/app/queryByCondition?jsonName=tySearchConditionJson&maxNodesNum=${this.searchParams.text.maxNode}&eachPageNodeNum=${this.searchParams.text.nodeCount}&curPageNum=${page}&dataTypeList=${JSON.stringify(dataTypeList)}&userQuery=${keyword}&displayMode=图片`)
          this.hotKeyWord.indexOf(this.keyword) !== -1 ? this.hotKeyWord.splice(this.hotKeyWord.indexOf(this.keyword), 1) : '';
          this.hotKeyWord.unshift(this.keyword);
          sessionStorage.setItem('ty-hotKeyWord', JSON.stringify(this.hotKeyWord));
          //处理搜索结果
          this.nodes = data.data.nodes;
          this.searchTotal = data.data.totalNodeNum;
          this.searchPageSize = data.data.eachPageNodeNum;
          // if(this.nodes){
          //   this.nodes.forEach(item => {
          //     this.optionsTypes.filter(tab => tab.name === item.dataTypeName)[0] ? this.optionsTypes.filter(tab => tab.name === item.dataTypeName)[0].objs.push(item) : '';
          //   });
          // }else{
          //
          // }
          //切换第一tab为全部
          this.optionsTypes[0].label === '全部' ? '' : (this.optionsTypes[0].label = '全部', this.optionsTypes[0].name = 'all');
          //处理元数据
          this.metaData.links.forEach(item => {
            this.nodes.forEach((obj, index) => {
              this.nodes[index].linkNode ? '' : this.nodes[index].linkNode = [];
              if (obj.dataTypeName === item.sourceNode && this.nodes[index].linkNode.map(item => item.name).indexOf(item.targetNode) === -1) {
                //关系有值/无值
                obj.conn = obj.conn || '';
                let linkStatus = obj.conn.split(',').indexOf(item.targetNode) !== -1 ? 'active' : '';
                this.nodes[index].linkType = item.linkType;
                linkStatus === 'active'
                  ? this.nodes[index].linkNode.unshift({
                    name: item.targetNode,
                    linkStatus: linkStatus
                  })
                  : this.nodes[index].linkNode.push({
                    name: item.targetNode,
                    linkStatus: linkStatus
                  })
              } else if (obj.dataTypeName === item.targetNode && this.nodes[index].linkNode.map(item => item.name).indexOf(item.sourceNode) === -1) {
                obj.conn = obj.conn || '';
                let linkStatus = obj.conn.split(',').indexOf(item.sourceNode) !== -1 ? 'active' : '';
                this.nodes[index].linkType = item.linkType;
                linkStatus === 'active'
                  ? this.nodes[index].linkNode.unshift({
                    name: item.sourceNode,
                    linkStatus: linkStatus
                  })
                  : this.nodes[index].linkNode.push({
                    name: item.sourceNode,
                    linkStatus: linkStatus
                  })
              }
            });
          });
          if (typeof searchType === 'string') {
            this.optionsTypes.filter(item => item.name === searchType)[0].objs = this.nodes || [];
            // this.optionsTypes = this.optionsTypes.filter(item => item.name === 'all' || typeof item.linkType !== 'undefined' || this.searchParamsOptions.dataTypeList.indexOf(item.name) !== -1);
            // this.breadcrumbItemChange(this.keyword);
            // this.isHome = false;
            this.currentTab = searchType;
          } else {
            data.data.rootType = data.data.rootType || '';
            let intersection = _.intersection(data.data.rootType.split(','), this.searchParamsOptions.dataTypeList);
            this.optionsTypes.filter(item => item.name === 'all')[0].objs = this.nodes || [];
            this.optionsTypes = this.optionsTypes.filter(item => item.name === 'all' || typeof item.linkType !== 'undefined' || intersection.indexOf(item.name) !== -1);
            this.breadcrumbItemChange(this.keyword);
            this.isHome = false;
            this.currentTab = 'all';
          }
        } catch (e) {
          console.log(e)
          this.$Message.error('搜索出错');
          this.optionsTypes = [];
          this.searchTotal = 0;
        }
        this.searchLoading = false;
      },
      resetOptionsTypes() {
        //如果重新设定选项初始化知识域
        this.optionsTypes = [];
        this.metaData.nodes.forEach(item => {
          let node = {
            label: item.name,
            name: item.name,
            status: 'active',
            objs: []
          };
          if (this.options[item.domainName]) {
            this.options[item.domainName].indexOf(item.name) !== -1 ? '' : this.options[item.domainName].push(item.name);
            this.options['全部'].indexOf(item.name) !== -1 ? '' : this.options['全部'].push(item.name);
          } else {
            this.options['全部'] ? '' : this.options['全部'] = [];
            this.options[item.domainName] = [];
            this.options[item.domainName].push(item.name);
            this.options['全部'].push(item.name);
          }
          this.optionsTypes.push(node);
        });
      },
      handleCheckAll () {
        if (this.indeterminate) {
          this.checkAll = false;
        } else {
          this.checkAll = !this.checkAll;
        }
        this.indeterminate = false;

        if (this.checkAll) {
          this.searchParamsOptions.dataTypeList = this.options[this.searchParamsOptions.dataType];
        } else {
          this.searchParamsOptions.dataTypeList = [];
        }
      },
      //更换知识域
      dataTypeCheckAllGroupChange(){
        this.$nextTick(() => {
          let data = _.intersection(this.options[this.searchParamsOptions.dataType], this.searchParamsOptions.dataTypeList);
          this.dataTypeListCheckAllGroupChange(data);
        });
      },
      //更换知识域数据类型
      dataTypeListCheckAllGroupChange(data){
        if (data.length === this.options[this.searchParamsOptions.dataType].length) {
          this.indeterminate = false;
          this.checkAll = true;
        } else if (data.length > 0) {
          this.indeterminate = true;
          this.checkAll = false;
        } else {
          this.indeterminate = false;
          this.checkAll = false;
        }
      },
      handleChangeType(name) {
        //
        if (name === this.currentTab) {
          //重复点击不请求
        } else if (this.isRootSearch && name !== this.currentTab) {
          //根级搜索之后直接点dataTypeList
          this.handleSearch(this.keyword, name)
        } else if (!this.isRootSearch && name !== 'detail' && name !== 'all' && name !== this.currentTab) {
          //非根级搜索之后直接点dataTypeList
          this.handleTagInfo(this.nodeUUID, name, 0, 'active', false);
          this.currentTab = name;
        }
        this.searchTotal = this.optionsTypes.filter(item => item.name === name)[0].objs.length;
      },
      handleReset() {
        this.searchParamsOptions = {
          textDomain: baseTextUrl,
          graphDomain: baseGraphUrl,
          dataType: '全部',
          dataTypeList: [],
          graph: {
            level: 2,
            maxNode: 200
          },
          text: {
            nodeCount: 8,
            maxNode: 200
          },
          displayType: '文字',
        };
      },
      async handleSubmit() {
        this.openOptions = false;
        this.searchParams = _.cloneDeep(this.searchParamsOptions);
        if (!this.searchParamsOptionsOid) {
          //创建设置
          try {
            let res = await createEobj('ApplicationOptions', [
              {
                optionType: '0',
                userID: sessionStorage.getItem("userId"),
                optionKey: 'tyBaiduPriOptionJson',
                optionValue: JSON.stringify(this.searchParamsOptions)
              }
            ]);
          } catch (e) {
            this.$Message.error('创建设置失败');
          }
        } else {
          //更新设置
          try {
            let res = await editEobj('ApplicationOptions', [
              {
                oid: this.searchParamsOptionsOid,
                optionType: '0',
                userID: sessionStorage.getItem("userId"),
                optionKey: 'tyBaiduPriOptionJson',
                optionValue: JSON.stringify(this.searchParamsOptions),
                lastModifyTime: new Date().getTime(),
              }
            ]);
          } catch (e) {
            this.$Message.error('更新设置失败');
          }
        }
        // let data = await axios.post(
        //   `${baseObjOther}/`,
        //   {
        //     pageSize: queryData.query.pageSize,
        //     startIndex: queryData.query.startIndex,
        //     condition: queryData.query.query
        //   }
        // );
      },
      handleBreadcrumb(index) {
        this.breadcrumbItem = this.breadcrumbItem.slice(0, index + 1);
        this.optionsTypes = _.cloneDeep(this.breadcrumbItem[index].optionsTypes);
        this.currentTab = this.optionsTypes[0].name;
        //重置根搜索标记
        this.nodeUUID = this.currentTab === 'detail' ? this.optionsTypes[0].objs.uuid : this.nodeUUID;
        this.isRootSearch = this.currentTab === 'all' ? true : false;
      },
      handleBasicInfo(uuid = this.nodeUUID, index, page = 1) {
        this.isRootSearch = false;
        this.nodeUUID = uuid;
        this.optionsTypesOrigin = _.cloneDeep(this.optionsTypes);
        this.optionsTypes[0].label = '基本信息';
        this.currentTab = this.optionsTypes[0].name = 'detail';
        this.optionsTypes[0].objs = this.optionsTypes[index].objs.filter(item => item.uuid === uuid)[0];
        this.optionsTypes = this.optionsTypes.slice(0, 1);
        this.optionsTypes[0].objs.linkNode.forEach(item => {
          let node = {
            label: item.name,
            name: item.name,
            status: item.linkStatus,
            objs: []
          };
          this.optionsTypes.push(node);
        });
        this.breadcrumbItemChange(this.optionsTypes[0].objs.displayName);
      },
      /**
       * 点击tag标签执行二级搜索
       * @uuid 节点uuid
       * @searchType 节点dataType
       * @column 标签所在列 用在根级only
       * @status active/''标签是否为有值激活状态
       * @refresh 是否刷新首页签，点击其他页签时不需要刷新
       * @page 分页
       */
      async handleTagInfo(uuid = this.nodeUUID, searchType, column, status, refresh = true, page = 1) {
        if (status !== 'active') {
          return;
        }
        try {
          this.isRootSearch = false;
          let data = await Axios.post(
            `${baseUrl}/dw/knowledgemap/app/queryByCondition?jsonName=tySearchCondition2Json`,
            {
              maxNodesNum: this.searchParams.text.maxNode,
              eachPageNodeNum: this.searchParams.text.nodeCount,
              curPageNum: page,
              searchType: searchType,
              curNodeUUID: uuid,
              displayMode: '文字'
            }
          );
          this.nodes = data.data.nodes;
          this.searchTotal = data.data.totalNodeNum;
          this.searchPageSize = data.data.eachPageNodeNum;
          refresh ? this.handleBasicInfo(uuid, column, page) : '';
          if (this.nodes) {
            this.metaData.links.forEach(item => {
              this.nodes.forEach((obj, index) => {
                this.nodes[index].linkNode ? '' : this.nodes[index].linkNode = [];
                if (obj.dataTypeName === item.sourceNode && this.nodes[index].linkNode.map(item => item.name).indexOf(item.targetNode) === -1) {
                  //关系有值/无值
                  obj.conn = obj.conn || '';
                  let linkStatus = obj.conn.split(',').indexOf(item.targetNode) !== -1 ? 'active' : '';
                  this.nodes[index].linkType = item.linkType;
                  linkStatus === 'active'
                    ? this.nodes[index].linkNode.unshift({
                      name: item.targetNode,
                      linkStatus: linkStatus
                    })
                    : this.nodes[index].linkNode.push({
                      name: item.targetNode,
                      linkStatus: linkStatus
                    })
                } else if (obj.dataTypeName === item.targetNode && this.nodes[index].linkNode.map(item => item.name).indexOf(item.sourceNode) === -1) {
                  obj.conn = obj.conn || '';
                  let linkStatus = obj.conn.split(',').indexOf(item.sourceNode) !== -1 ? 'active' : '';
                  this.nodes[index].linkType = item.linkType;
                  linkStatus === 'active'
                    ? this.nodes[index].linkNode.unshift({
                      name: item.sourceNode,
                      linkStatus: linkStatus
                    })
                    : this.nodes[index].linkNode.push({
                      name: item.sourceNode,
                      linkStatus: linkStatus
                    })
                }
              });
            });
          }
          this.optionsTypes = this.optionsTypes.slice(0, 1);
          this.optionsTypes[0].objs.linkNode.forEach(item => {
            let node = {
              label: item.name,
              name: item.name,
              status: item.linkStatus,
              objs: []
            };
            this.optionsTypes.push(node);
          });
          this.optionsTypes.forEach(item => {
            if (item.name === searchType) {
              item.objs = this.nodes || [];
            }
          });
          // this.optionsTypes = this.optionsTypes.filter(item => typeof item.linkType !== 'undefined' || item.name === 'detail');
          this.currentTab = searchType;
          // this.optionsTypes.filter(item => item.name === searchType)[0].objs = data.data.nodes;
        } catch (e) {
          this.$Message.error('搜索非根节点出错');
        }
      },
      /**
       * tag排序
       */
      // resortTag(node) {
      //   let nodeCatch = []
      //   node.forEach(item => {
      //     item.ac
      //   })
      //   return node
      // },
      handleChangeOptionsType(name) {
        this.searchParamsOptions.dataType = name;
      },
      breadcrumbItemChange(value, optionsTypes = _.cloneDeep(this.optionsTypes)) {
        //如果搜索清空面包屑，如果点击、之前搜过调用optionsTypes，没有搜过增加optionsTypes记录
        if (value && !this.isRootSearch) {
          let index = null;
          this.breadcrumbItem.forEach((item, i) => {
            if (item.value === value) {
              index = i;
            }
          });
          if (index !== null) {
            this.breadcrumbItem.slice(0, index)
          } else {
            this.breadcrumbItem.push({
              value: value,
              optionsTypes: optionsTypes
            });
          }
        } else {
          this.breadcrumbItem = [];
          this.breadcrumbItem.push({
            value: value,
            optionsTypes: optionsTypes
          });
        }
      },
      highLightKeyword(title, info, typeName) {
        if (title) {
          // let replaceReg = new RegExp(this.keyword, 'g');
          // let replaceString = `<span class="search-keyword">${this.keyword}</span>`;
          // return title.replace(replaceReg, replaceString);
          let returnTitle = title;
          try {
            info = info.split('),(');
            info.forEach(item => {
              let exp = item.replace(/[^0-9,]/ig, "").split(',');
              exp[1] = parseInt(exp[1]) + 1;
              let str = String().substring.apply(title, exp);
              let replaceReg = new RegExp(str, 'g');
              let replaceString = `<span class='search-keyword'>${str}</span>`;
              returnTitle = returnTitle.replace(replaceReg, replaceString);
            });
            returnTitle = `${returnTitle}`;
            return returnTitle;
          } catch (e) {
            console.log('高亮info解析错误');
          }
        }
      },
      handleSearchPageChange(page) {
        if (this.currentTab === 'all') {
          this.handleSearch(this.keyword, this.searchParams.dataTypeList, page);
        } else {
          this.handleSearch(this.keyword, this.currentTab, page);
        }
      }
    },
  }
</script>

<style scoped>
  .main-search-type {
    margin: 0 0 0px .5px;
  }

  .main-search-type li {
    float: left;
    list-style: none;
    padding: 0 5px;
    text-align: center;
    cursor: pointer;
  }

  .main-search-type li.active {
    color: #fff;
    background: #3c2786;
  }

  .keyword {
    width: 85%;
    height: 38px;
  }

  .searchButton {
    width: 15%;
    height: 40px;
    border-radius: 0;
    padding: 0px;
    margin: 0 0 0 -1px;
    background-color: #E00223;
    font-size: 35px;
  }

  .second-keyword {
    width: 35%;
    height: 33px;
    float: left;
    /*margin-left: 20px;*/
  }

  .second-searchButton {
    width: 60px;
    height: 33px;
    border-radius: 0;
    background-color: #3C2786;
    font-size: 28px;
    padding: 0px;
  }

  .search-params {
    width: 54%;
    margin: 0 auto;
  }

  .searchOptions {
    width: 14%;
    height: 40px;
    margin: 0 0 0 1%;
    padding: 0;
    border-radius: 0;
  }

  .second-searchOptions {
    width: 86px;
    height: 34px;
    float: right;
    margin: 1px 20px 0 10px;
    border-radius: 0;
  }

  .form-section {
    margin-top: 18px;
  }

  .form-section-title {
    margin-bottom: 10px;
  }

  .data-type-item {
    width: 50%;
    margin: 6px 0 0 0;
    padding: 0;
    text-overflow: ellipsis;
    text-indent: 20%;
    overflow: hidden;
    white-space: nowrap;
  }

  .center {
    width: 50%;
    margin: 0 auto;
  }

  .hotKeyWord {
    cursor: pointer;
  }

  .hotKeyWord ul {
    list-style: none;
  }

  .hotKeyWord ul > li {
    float: left;
    margin: 10px 10px;
  }

  .displayType {
    margin: 1px 0 0 10px;
    float: left;
  }

  .optionsTypes {
    /*margin-left: 20px;*/
  }

  .result-list {
    min-height: 74px;
    width: 600px;
    list-style: none;
  }

  .result-list-title {
    padding-top: 7px;
    color: #0C00D3;
    font-size: 14px;
    cursor: pointer;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .result-list-tags {
    margin-top: 3px;
    font-size: 12px;
  }

  .drawer-footer {
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
  }

  .clearfix:after {
    visibility: hidden;
    display: block;
    font-size: 0;
    content: " ";
    clear: both;
    height: 0;
  }

  .detailWrapper {

  }

  .detailWrapper .detail {
    margin-top: 15px;
    border-top: 1px solid #dddfe3;
  }

  .detailWrapper .detail li {
    list-style: none;
    margin: 10px 0;
  }

  .detailWrapper .detail li .detail-key {
    font-weight: bold;
  }

</style>
<style>
  .tuanyuan-search .ivu-drawer-header {
    border-bottom: none;
    padding: 0;
  }

  .tuanyuan-search .ivu-drawer-header-inner {
    float: left;
    margin: 0px 0px 0px -26%;
    padding: 19px 13px;
    width: auto;
    cursor: pointer;
  }

  .tuanyuan-search .result-list-title .search-keyword {
    padding-top: 7px;
    color: #D20400;
    font-size: 14px;
  }

  .tuanyuan-search .result-list-tags .ivu-tag-text {
    font-size: 12px;
  }

  .tuanyuan-search .result-list-tags .ivu-tag .ivu-tag-text {
    color: #e8eaec;
  }

  .tuanyuan-search .result-list-tags .ivu-tag.active .ivu-tag-text {
    color: #515a6e;
  }

  .tuanyuan-search .optionsTypes .ivu-tabs-nav-container {
    margin-left: 20px;
  }

  .tuanyuan-search .optionsTypes .ivu-tabs-content {
    margin-left: 20px;
  }

  .tuanyuan-search .searchButton .ivu-icon-ios-search {
    font-size: 28px;
    display: block;
    width: 100%;
    color: #fff;
    text-align: center;
  }

  .tuanyuan-search .searchButton .ivu-icon-ios-loading {
    font-size: 28px;
    display: block;
    width: 100%;
    color: #fff;
    text-align: center;
  }

  .tuanyuan-search .ivu-breadcrumb .link .ivu-breadcrumb-item-link {
    cursor: pointer;
  }
</style>

