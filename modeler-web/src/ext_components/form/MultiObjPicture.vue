<template>
  <!--
        建模时的预览前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
    <!--
            插件前端实现区域
    -->
    <span
            :style="{'height': args.basic_height * args.height + 'px', 'width': '100%', 'display': 'inline-block', 'color': args.main_fontColor}"
    >
      <span
              :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'text-align': 'left','overflow':'hidden'}"
      >
        <!-- v-if="displayAttribute.valueType=='LocalFile'" -->
        <div class="multi-object-preview">
          <!-- 以媒体形式展示 -->
          <div>
            <Card
                    v-for="(item,index) in pagedData"
                    :style="{'display': 'inline-block','margin':args.unitMargin+'px','padding':arg_unitPadding,
                    'width':arg_unitWidthType?'':arg_unitWidth()}"
                    :bordered="args.unitBordered"
                    :dis-hover="!args.unitHovered"
            >
              <!-- 对象展示区 -->
              <div @click="handleObjClick(item)"
                   :style="{'text-align':'center','height':arg_unitHeight,
            'width':arg_unitWidthType?arg_unitWidth():'100%',
            'overflow': 'hidden'}"
              >
                <div
                        class="img_div"
                        v-if="item.objType == 'image'"
                        :style="{'height':arg_unitHeight}"
                >
                  <div
                          :style="{'width':arg_selectedScalingType,'height':'100%',
                    backgroundImage: 'url('+item.displayValue+')',
                    'background-repeat': 'no-repeat',
                    'background-size': imageBackgroundSize,}"
                  ></div>
                  <div>
                    <!-- 遮罩部分 -->
                    <div class="mask">
                      <div style="text-align: right;">
                        <a
                                href="#"
                                class="unit-predict"
                                v-if="args.unitPredictable"
                                @click="cpIdx=index;isShowing=true;"
                        >
                          <Icon type="ios-eye-outline" title="预览"/>
                        </a>
                        <a
                                class="unit-download"
                                v-if="args.unitDownloadable"
                                target="_blank"
                                :href="item.displayValue"
                                :download="item.fileName"
                        >
                          <Icon type="ios-download" title="下载"/>
                        </a>
                      </div>
                      <h3 :style="{'text-align':'center','margin-top':(args.unitHeight-40)/3 +'px'}">{{item.tipValue}}</h3>

                    </div>
                  </div>
                </div>

                <a
                        v-if="item.objType == 'file'"
                        :href="item.displayValue"
                        @mouseover="overImg = true"
                        @mouseleave="overImg = false"
                        :style="{'width':arg_selectedScalingType}"
                >{{ value }}</a>
                <video
                        v-if="item.objType == 'video'"
                        controls="controls"
                        :src="item.displayValue"
                        @mouseover="overImg = true"
                        @mouseleave="overImg = false"
                        :style="{'width':arg_selectedScalingType,'controls':'true','controlslist':'nodownload'}"
                ></video>
                <audio
                        v-if="item.objType == 'audio'"
                        controls="controls"
                        :src="item.displayValue"
                        @mouseover="overImg = true"
                        @mouseleave="overImg = false"
                        :style="{'width':arg_selectedScalingType}"
                ></audio>
                <iframe
                        v-if="item.objType == 'docu'"
                        controls="controls"
                        :src="item.displayValue"
                        @mouseover="overImg = true"
                        @mouseleave="overImg = false"
                        :style="{'width':arg_selectedScalingType,'frameborder':'1'}"
                ></iframe>
              </div>
              <!-- 标签内置 -->
              <div
                      @click="handleObjClick(item)"
                      v-if="args.unitLabelEmbed"
                      :style="{'width':arg_unitWidthType?arg_unitWidth():'100%',
                'height':args.unitLabelEnbedHeight+'px',
                'text-align':'center',
                'position':'absolute','bottom':arg_unitPadding,
                'background-color':'rgba(0,0,0,0.6)','color':'white'}"
              >
                <div :style="{'width':'100%','font-size': args_lablesize,'line-height':args.unitLabelEnbedHeight+'px'}">{{item.labelValue}}</div>
              </div>
              <!-- 标签未内置 -->
              <div v-else style="text-align:center;height:30px">
                <h3 :style="{'margin':'0 auto','font-size': args_lablesize}">{{item.labelValue}}</h3>
              </div>
            </Card>
          </div>


          <div v-if="args.unitPageable" style="margin-top: 10px; float: right;">
            <Page
                    show-sizer
                    show-elevator
                    show-total
                    placement="top"
                    :page-size-opts="args.pageSizeOpts"
                    :pageSize="args.pageSize"
                    :total="objList.length"
                    :current="pageIndex"
                    @on-change="changePage"
                    @on-page-size-change="changePageSize"
            ></Page>
          </div>

          <!-- 画廊 -->
          <div v-if="isShowing" class="gallery mask" style="background:black; padding: 30px;">
             <div style="position: absolute;text-align: right;top: -3px;right: 1px;">
                <a
                        class="unit-download"
                        v-if="args.unitDownloadable"
                        target="_blank"
                        :href="imageObjList[cpIdx].displayValue"
                        :download="imageObjList[cpIdx].fileName"
                >
                  <Icon type="ios-download" title="下载"/>
                </a>
                <a @click="isShowing = false" href="javascript:void(0)">
                  <Icon type="ios-close-circle" title="关闭"/>
                </a>
            </div>
            <div
                    class="o-sldie-container"
            >
              <div
                      class="only-slide"
                      @mouseover="hoverPrevNextVisible"
                      @mouseleave="hoverPrevNextHide"
              >
                <div class="o-slide-wapper">
                  <transition :name="slideAnimate" tag="div">
                    <div
                            class="o-slide-item"
                            :key="isShowing"
                            :style="{ backgroundRepeat: 'no-repeat',backgroundImage: 'url(' + imageObjList[cpIdx].displayValue + ')' }"
                    >
                      <div
                              v-if="!imageObjList"
                              class="no-pic"
                              :style="{ lineHeight: slideViewHeight + 'px' }"
                      >暂无图片</div>
                      <span
                              v-if="prevNextVisible && imageObjList[cpIdx].labelValue"
                      >{{imageObjList[cpIdx].labelValue}}</span>
                    </div>
                  </transition>
                </div>
                <div class="o-prev" @click="cutPage('prev');" v-if="prevNextVisible">
                  <img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCODNERjI0OTc4RTkxMUU3QjlEQkU0NDIyMTVBRTlCRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCODNERjI0QTc4RTkxMUU3QjlEQkU0NDIyMTVBRTlCRiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkI4M0RGMjQ3NzhFOTExRTdCOURCRTQ0MjIxNUFFOUJGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkI4M0RGMjQ4NzhFOTExRTdCOURCRTQ0MjIxNUFFOUJGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/fXlQgAAAZlJREFUeNrs2+GtgkAMB3DOCRjBDXQERmCEcwJXcQNwAzZgBNzEEbCXwCeDHHetaXttcnnJi3m5/y96Qulz8zxXJdepKrwMwAAMwAAMwAAMwACSyzmHuqDusCZYb1gdrHr5PU2FS+GchbyXbv6uCWOfm/vnArARfi1PBcDiDAjh4Yf/8ZKz2kMwInyoQSVAZPgnHIIvdYfgzmd+rR5rn6wOwaPhVQGkhFcDkBpeBUBOePEAueFFA2CEFwuAFV4kAGZ4cQDY4UUBUIQXA0AVXgQAZXj2ANThWQPAaqnDUwJg9AOaiPt5XzGtfzRELiBdawbYe3tfYY1cETCeC4R21U0sAuLXoI84DKdUBCkXQmQIki6FSRCk3QyhI0i8HUZFkNoQQUOQ3BJDQZDeFM1G0NAWz0LQ8mAkGUHTo7EkBG0PRw8jqBuROYqgckYoEmFUPSQViXBVOyTlnOsj+gmt2iGpSASyISlug5J+q6NM9RFwuSGwx1hhP80yORZmAwf4+48VgOTdZ/81VngZgAEYgAEYgAEYQLn1EWAAQFrgEZNBEzkAAAAASUVORK5CYII="
                          alt
                  >
                </div>
                <div class="o-next" @click="cutPage('next');" v-if="prevNextVisible">
                  <img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBMzA5Mzc1Njc4RTkxMUU3OUM5RUJCQUI2ODQ1RDNERiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBMzA5Mzc1Nzc4RTkxMUU3OUM5RUJCQUI2ODQ1RDNERiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkEzMDkzNzU0NzhFOTExRTc5QzlFQkJBQjY4NDVEM0RGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkEzMDkzNzU1NzhFOTExRTc5QzlFQkJBQjY4NDVEM0RGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+bVSsJwAAAaFJREFUeNrsmoFtwkAMRXOoAzAKHYEN2KDpBO1GMEI3aDYANmCDdoOrUwWpagWBO//K32dLlqUkSu4/InOxnXLOXcu26Bq3ABAAAkAACAABIAC0aw+oG6eUvqPsNF8lbMRP4js5Pmg+p3onO94A4dO9d/mv9doAqtaJAiC+ypettwIAmQM2V85ttd8Ei0nwbea8CQgLYBI8SBjMQwAnwaX4Ps9b7y4J/lggFIJ5AGgIFACQEGgAoCBQAUBAoAOgDYESgCYEWgBaEKgBaECgB1ALwQWAGghuAJRCcAWgBELtOhOqO3yuCZZCkPAuvpq59FH84K4qLPA+JaxvEFddSzBbFp8gHJvtC4wVZQlPM5cNGg8ylQSvlNN/29brv8DN4j3uA+4S720neLd4T98CReK9fA0Wi/dQD6gSz14RqhbPXBNUEc9aFVYTz9gXUBXP1hlSF8/UG4SIZ+kOw8SbB4AWzzwkpSKeeUiqm2YGnz0PSZ2si/+PGaE94rVnSoJjjX+cBPuYYLxY+wFhfQEWi3H5ABAAAkAACAABIAA0a18CDAB6UWSzZ1MpswAAAABJRU5ErkJggg=="
                          alt
                  >
                </div>
                <div class="pagination">{{ cpIdx + 1 }}/{{ imageObjList.length }}</div>
              </div>
              <div class="o-preview">
                <div class="o-preview-wapper">
                  <ul :style="{ left: previewLeft + 'px'}" ref="hidebox">
                    <li
                            v-for="(item, index) in imageObjList"
                            :key="index"
                            @click="clickPreview(index);"
                            :style="{ opacity: cpIdx == index ? 1 : 0.4 ,'border':cpIdx == index ?'red solid 2px':'white solid 2px'}"
                    >
                      <div
                              class="preview-img"
                              :style="{ backgroundImage: 'url(' + item.displayValue + ')' }"
                      ></div>
                    </li>
                    <li class="preview-no-pic" v-if="!imageObjList.length">暂无图片</li>
                  </ul>
                </div>
                <div class="o-preview-prev" @click="cutPreview('prev');">《</div>
                <div class="o-preview-next" @click="cutPreview('next');">》</div>
              </div>
            </div>
          </div>
        </div>
      </span>
    </span>
    <!--
            属性编辑框区域
            需要该插件获取attributes, router, route, root, query_oprs, itemValue的prop
            对于不需要设置目标属性的插件,可以将attributes去掉
            对于不需要设置事件的插件,可以将router, route, root, query_oprs去掉
    -->
    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox"
              v-model="args"
              :itemValue="itemValue"
              :store="store"
              :attributes="filter_attributes"
              :router="router"
              :route="route"
              :root="root"
              :query_oprs="query_oprs"
              :targetclass="itemValue.data.targetClass"
      >
        <div slot="attribute">
          <!--
                        属性选项放置区域
                        一般一个控件的prop都属于属性选项
          -->
          <p class="margin1">展示属性</p>
          <Select class="margin1" clearable filterable v-model="args.displayAttribute">
            <OptionGroup label="系统属性" v-if="attributes_sys">
            <Option
                    v-for="item in attributes_sys"
                    :value="item.attributeName + '|' + item.valueType"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="类属性" v-if="attributes_def">
            <Option
                    v-for="item in attributes_def"
                    :value="item.attributeName + '|' + item.valueType"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="关联类系统属性" v-if="attributes_relationSys">
            <Option
                    v-for="item in attributes_relationSys"
                    :value="item.attributeName + '|' + item.valueType"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="关联类属性" v-if="attributes_relationDef">
            <Option
                    v-for="item in attributes_relationDef"
                    :value="item.attributeName + '|' + item.valueType"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="左类系统属性" v-if="attributes_leftSys">
            <Option
                    v-for="item in attributes_leftSys"
                    :value="item.attributeName + '|' + item.valueType"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="左类属性" v-if="attributes_leftDef">
            <Option
                    v-for="item in attributes_leftDef"
                    :value="item.attributeName + '|' + item.valueType"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="右类系统属性" v-if="attributes_rightSys">
            <Option
                    v-for="item in attributes_rightSys"
                    :value="item.attributeName + '|' + item.valueType"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="右类属性" v-if="attributes_rightDef">
            <Option
                    v-for="item in attributes_rightDef"
                    :value="item.attributeName + '|' + item.valueType"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
          </Select>
          <p class="margin1">提示属性</p>
          <Select class="margin1" clearable filterable v-model="args.tipAttribute">
            <OptionGroup label="系统属性" v-if="strAttributes_sys">
            <Option
                    v-for="item in strAttributes_sys"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="类属性" v-if="strAttributes_def">
            <Option
                    v-for="item in strAttributes_def"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="关联类系统属性" v-if="strAttributes_relationSys">
            <Option
                    v-for="item in strAttributes_relationSys"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="关联类属性" v-if="strAttributes_relationDef">
            <Option
                    v-for="item in strAttributes_relationDef"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="左类系统属性" v-if="strAttributes_leftSys">
            <Option
                    v-for="item in strAttributes_leftSys"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="左类属性" v-if="strAttributes_leftDef">
            <Option
                    v-for="item in strAttributes_leftDef"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="右类系统属性" v-if="strAttributes_rightSys">
            <Option
                    v-for="item in strAttributes_rightSys"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="右类属性" v-if="strAttributes_rightDef">
            <Option
                    v-for="item in strAttributes_rightDef"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
          </Select>


          <p class="margin1">标签属性</p>
          <Select class="margin1" clearable filterable v-model="args.labelAttribute">
            <OptionGroup label="系统属性" v-if="strAttributes_sys">
            <Option
                    v-for="item in strAttributes_sys"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="类属性" v-if="strAttributes_def">
            <Option
                    v-for="item in strAttributes_def"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="关联类系统属性" v-if="strAttributes_relationSys">
            <Option
                    v-for="item in strAttributes_relationSys"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="关联类属性" v-if="strAttributes_relationDef">
            <Option
                    v-for="item in strAttributes_relationDef"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="左类系统属性" v-if="strAttributes_leftSys">
            <Option
                    v-for="item in strAttributes_leftSys"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="左类属性" v-if="strAttributes_leftDef">
            <Option
                    v-for="item in strAttributes_leftDef"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="右类系统属性" v-if="strAttributes_rightSys">
            <Option
                    v-for="item in strAttributes_rightSys"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
            <OptionGroup label="右类属性" v-if="strAttributes_rightDef">
            <Option
                    v-for="item in strAttributes_rightDef"
                    :value="item.attributeName"
                    :key="item.attributeName"
                    :label="item.displayName"
            >
              <span>{{ item.displayName }}</span>
              <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
            </Option>
            </OptionGroup>
          </Select>

          <p class="margin1">标签文本大小</p>
          <Input class="margin1" v-model="args.lableSize" type="number">
              <Select v-model="args.lableSizeType" slot="append" style="width: 70px;">
                  <Option value="px">px</Option>
                  <Option value="rem">rem</Option>
              </Select>
          </Input>
          <Row class="margin1">
            <Col span="12" class="margin1">
              <Checkbox v-model="args.unitLabelEmbed">内置标签高度</Checkbox>
            </Col>
            <Col :style="{'display':args.unitLabelEmbed?'':'none'}">
<!--              <p class="margin1">内置高度</p>-->
              <Input clas="margin1" number v-model="args.unitLabelEnbedHeight" type="number">
                <span slot="append">px</span>
              </Input>
            </Col>
          </Row>

          <Row class="margin1">
            <Col span="12" class="margin1">
              <Checkbox v-model="args.unitBordered">有边框</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.unitHovered">悬停阴影</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.unitPredictable">可预览</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.unitPageable">分页</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.unitDownloadable">可下载</Checkbox>
            </Col>

          </Row>
          <!-- <Row>
            <Col span="24" class="margin1">过滤条件</Col>
            <Col span="24" class="margin1">
              <Input type="textarea" :rows="4" v-model="args.query"/>
            </Col>
          </Row> -->
        </div>
        <div slot="layout">
          <!--
                        样式选项放置区域
                        仅有涉及到高度,宽度,对齐等样式的选项放在这里
          -->
          <p class="margin1">媒体展示</p>

            <p class="margin1">缩放方式</p>
            <Select v-model="args.selectedScalingType">
              <Option
                      v-for="iType in scalingType"
                      :value="iType.value"
                      :key="iType.value"
              >{{iType.label}}</Option>
            </Select>


          <span class="margin1"></span>
          <p class="margin1">布局方式</p>
          <Select v-model="args.selectedLayoutType">
            <Option
                    v-for="iType in layoutType"
                    :value="iType.value"
                    :key="iType.value"
            >{{iType.label}}</Option>
          </Select>

          <p class="margin1">媒体单元大小</p>
          <span class="margin1">
            <p class="margin1">宽度</p>
            <Input class="margin1" number v-model="args.unitWidth" type="number">
              <Select v-model="args.unitWidthType" slot="append" style="width: 70px;">
                <Option value="percentage">%</Option>
                <Option value="px">px</Option>
              </Select>
            </Input>

            <p lass="margin1">高度</p>
            <Input class="margin1" number v-model="args.unitHeight" type="number">
              <span slot="append">px</span>
            </Input>
            <p class="margin1">间隔</p>
            <Input class="margin1" number v-model="args.unitMargin" type="number">
              <span slot="append">px</span>
            </Input>
            <p class="margin1">内边距</p>
            <Input class="margin1" number v-model="args.unitPadding" type="number">
              <span slot="append">px</span>
            </Input>
          </span>
        </div>
        <div slot="operation">
          <!--
                        事件选项放置区域
          -->
        </div>
      </EditBox>
    </span>
  </section>
  <!--
        插件的拖拽图标样式
        :addinName="name"不可去除
  -->
  <section v-else :addinName="name">
    <span style="text-align:center">
      <div class="form-addin-icon">
        <i class="iconfont">&#xe66b;</i>
      </div>
      <!-- 设置插件的中文名,名字长度小于等于3时使用 -->
      <!-- <div class="form-addin-name">
                表单点选器
      </div>-->
      <!-- 设置插件的中文名,名字长度大于3时使用 -->

      <Tooltip class="form-addin-name" content="多媒体展示" style="width: 100%;" :transfer="true">多媒体</Tooltip>
    </span>
  </section>
</template>

<script>
  import {getEntity} from "@/api/data-model/EntityModeling";
  import {getRelation} from '@/api/data-model/RelationModeling';
  import "@/styles/component/iconfont.css";
  import {mapGetters, mapActions} from "vuex";
  import EditBox from "./_EditBox.vue";
  import {getAllEntities, getAllRelations} from "@/api/others";
  import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from "../../libs/utils";
  // 设置插件英文名, 该name需要与插件文件名一致
  const name = "MultiObjPicture";

  export default {
    name: name,
    /*
       根据需要使用props
       一般情况下都需要itemValue,
       需要设置目标属性时需要attributes
       需要设置事件时需要query_oprs, route, router, root, Message
       需要用到store时需要store
       */
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" ,
      "itemValue",
      "attributes",
      "query_oprs",
      "route",
      "router",
      "root",
      "store",
      "Message",
      "relation"
    ],
    data() {
      return {
        times: 0,
        name: name,
        attributes_sys: null,
        attributes_def: null,
        strAttributes_sys: null,
        strAttributes_def: null,
        attributes_relationSys: null,
        attributes_relationDef: null,
        strAttributes_relationSys: null,
        strAttributes_relationDef: null,
        attributes_leftSys: null,
        attributes_leftDef: null,
        strAttributes_leftSys: null,
        strAttributes_leftDef: null,
        attributes_rightSys: null,
        attributes_rightDef: null,
        strAttributes_rightSys: null,
        strAttributes_rightDef: null,
        t_preview: true,
        t_edit: false,

        // 属性配置项,按需设置

      actEdit: false,
      args: {
          targetClass: "", // 目标类
          bindTargetClass: '',
          displayAttribute: "", //被展示的属性
          labelAttribute: "", //标签属性
          tipAttribute: "", //提示属性

          id: "", // 控件代号,一般为必须
          label_color: "initial", // 标签背景颜色
          main_fontColor: "initial", // 主区域字体颜色
          main_color: "initial", // 主区域背景颜色
          main_width: 3, // 标签与主区域的占比为 label_width : main_width
          hided: false, // 是否隐藏

          // 以下为不在属性编辑框中设置,但默认要有的配置项
          title: "多媒体", // 插件中文名,需要填入默认值
          // basic_height: 30, // 基础高度,会从全局继承
          col: false, // 是否不占满全部
          cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null, // 目标数据类型
          events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: ["单对象点击"], // 支持的事件列表,元素为事件中文名

          //
          width: 100,
          widthType: '%',
          unitWidth: "250",
          unitHeight: "200",
          unitMargin: "10",
          unitPadding: "0",
          unitWidthType: "px", // 宽度表示方式"px" or "percentage"
          lableSize: 14,// 标签文字大小
          lableSizeType: 'px',// 标签文字大小单位
          unitBordered: true, //有边框
          unitHovered: true, //有悬停阴影
          unitPredictable: true, //可预览
          unitPageable: false, //可分页
          unitDownloadable: true, //可下载
          unitLabelPosition: 0, //标签文本位置
          unitLabelEmbed: true, //标签文本是否内置
          unitLabelEnbedHeight: 30, //内置标签高度
          selectedScalingType: 1, //1拉伸,2平铺,3原始
          selectedLayoutType: "Grid",
          query: "",
          pageSize: 10,
          pageSizeOpts: [10, 25, 50, 100, 200, 500],
          filterQuery: '',
        },
        pageIndex: 1,

        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ["String", "LocalFile"],

        // 需要设置目标属性时使用
        attrMap: {},
        clickedObj: [],

        open: ["1", "2"],

        // 需要动态设置高度时使用
        timer: null,

        value: "",
        attributesList: [],
        strAttributesList: [],
        labelCollapsed: true, //标签设置是否折叠
        scalingType: [
          {
            value: 1,
            label: "拉伸"
          },
          {
            value: 2,
            label: "平铺"
          },
          {
            value: 3,
            label: "原始"
          }
        ],
        layoutType: [
          {
            value: "Grid",
            label: "宫格布局"
          }
        ],
        selectList: [],

        isShowing: false,
        slideAnimate: "",
        cpIdx: 0,
        previewLeft: 0,
        currWidth: 0,
        prevNextVisible: false,
        slideViewWidth: 700,
        slideViewHeight: 300,

        objList: [
          {
            fileName: "fileName1",
            objType: "image",
            labelValue: "label1",
            displayValueIcon: "ios-image",
            tipValue: "tip1",
            displayValue:
              "https://file.iviewui.com/dist/2ecd3b0452aa197097d5131afacab7b8.png"
          },
          {
            fileName: "fileName2",
            objType: "image",
            labelValue: "label2",
            tipValue: "tip2",
            displayValueIcon: "ios-image-outline",
            displayValue:
              "https://file.iviewui.com/dist/2ecd3b0452aa197097d5131afacab7b8.png"
          },
          {
            fileName: "fileName3",
            objType: "video",
            labelValue: "label3",
            tipValue: "tip3",
            displayValueIcon: "ios-film-outline",
            displayValue:
              "http://v.cic.tsinghua.edu.cn/vod/video/a/8/2019326113042343_m_high.mp4"
          },
          {
            fileName: "fileName4",
            objType: "audio",
            labelValue: "label4",
            tipValue: "tip4",
            displayValueIcon: "ios-musical-note-outline",
            displayValue:
              "http://v.cic.tsinghua.edu.cn/vod/video/a/8/2019326113042343_m_high.mp4"
          },
          {
            fileName: "fileName5",
            objType: "video",
            labelValue: "label5",
            tipValue: "tip6",
            displayValueIcon: "ios-film-outline",
            displayValue:
              "http://v.cic.tsinghua.edu.cn/vod/video/a/8/2019326113042343_m_high.mp4"
          },
          {
            fileName: "fileName6",
            objType: "docu",
            labelValue: "label6",
            tipValue: "tip7",
            displayValueIcon: "ios-film-outline",
            displayValue:
              "http://ise.thss.tsinghua.edu.cn/IEDE/coursewares/2019/20190313_Tsinghua_Kris_Singh_webinar.pdf"
          }
        ],
        imageObjList: [],
        relationsList: [],
        queryData: {
          query: {query: "",}, // 查询条件
          targetClass: "",    // 目标类名
          formName: "",   //
          uuid: ""
        },
      };
    },
    components: {
      EditBox
    },
    inject: [
      'setBasicArgs'
    ],
    created() {
      //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
      if (this.t_preview) {

        let that = this;
        if (this.itemValue) {
          // 需要设置目标属性时使用,不用可删去
          if (this.attributes) {
            if (this.relation) {
              this.attributes[1].forEach(
                x => (that.attrMap["relation_" + x.attributeName] = x)
              );
              this.attributes[2].forEach(
                x => (that.attrMap["left_" + x.attributeName] = x)
              );
              this.attributes[3].forEach(
                x => (that.attrMap["right_" + x.attributeName] = x)
              );
            } else {
              this.attributes.forEach(x => (that.attrMap[x.attributeName] = x));
            }
          }

        }

      }

    },
    mounted() {
      if (this.t_preview) {

        // 关联类
        this.relationsList = [];
        let allRe = this.Relations();

        if(allRe && allRe.length > 0) {

          allRe.forEach((val) => {
            let eachItem = {
              value: val.className,
              label: val.displayName
            };
            this.relationsList.push(eachItem);
          });

        } else {
          this.getErrorIDBRe();
        }

        // 缺省绑定类为当前表单目标类
        if (this.args.bindTargetClass == '') {
          if (this.itemValue.data.isRelation) {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
          } else {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
          }
        }

        // 需要动态设置高度时使用,不用可删去
        if (this.args.bindTargetClass && !/\&/.test(this.args.bindTargetClass)) {
          this.args.bindTargetClass = this.relationsList.filter(item => item.className === this.args.bindTargetClass).length === 0 ? this.args.bindTargetClass + '&e' : this.args.bindTargetClass + '&r'
        }
        if (this.args.bindTargetClass != "") this.targetClass = this.args.bindTargetClass.split('\&')[0];
        this.setHeight();

        this.initData();
      }
    },
    watch: {
      imageObjList: {
        handler(val, oldVal) {
          this.cpIdx = 0;
        },
        deep: true
      },
      // 需要设置目标属性时使用,不用可删去
      arg_name(val) {
        if (val in this.attrMap) {
          this.args.targetDataType = this.attrMap[val].valueType;
          if (this.relation) {
            if (val.startsWith("left_"))
              this.args.label =
                (this.relation.leftRole != ""
                  ? this.relation.leftRole
                  : this.relation.leftClass) +
                "的" +
                this.attrMap[val].displayName;
            if (val.startsWith("right_"))
              this.args.label =
                (this.relation.rightRole != ""
                  ? this.relation.rightRole
                  : this.relation.rightClass) +
                "的" +
                this.attrMap[val].displayName;
            if (val.startsWith("relation_"))
              this.args.label = this.attrMap[val].displayName;
          } else this.args.label = this.attrMap[val].displayName;
        } else this.args.targetDataType = null;
      },

      'args.bindTargetClass'(newRefClass) {
        if (newRefClass) {
          let type = newRefClass.split('\&')[1];
          newRefClass = newRefClass.split('\&')[0];
          if (type == 'r') {
            let temReAttr = [];
            let temLAttr = [];
            let temRAttr = [];
            this.resetAttribute();
            getRelation(newRefClass).then(response => {
              if (response.success) {
                let res = response.data;
                temReAttr = res.attributes
                .filter(
                  x => x.valueType == "String" || x.valueType == "LocalFile"
                )
                this.attributes_relationSys = temReAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
                this.attributes_relationDef = temReAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
                let strTemReAttr = temReAttr.filter(x => x.valueType == "String");
                this.strAttributes_relationSys = strTemReAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
                this.strAttributes_relationDef = strTemReAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);

                temReAttr = temReAttr.map(val => {
                  val.attributeName = `relation_${val.attributeName}`;
                  val.displayName = `relation_${val.displayName}`;
                  return val
                });
                if ('leftClass' in res) {
                  getEntity(res.leftClass).then(mes => {
                    if (mes.success) {
                      let resL = mes.data;
                      temLAttr = resL.attributes
                      .filter(
                        x => x.valueType == "String" || x.valueType == "LocalFile"
                      )
                      this.attributes_leftSys = temLAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.attributes_leftDef = temLAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      let strTemLAttr = temLAttr.filter(x => x.valueType == "String");
                      this.strAttributes_leftSys = strTemLAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.strAttributes_leftDef = strTemLAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      temLAttr = temLAttr.map(val => {
                        val.attributeName = `left_${val.attributeName}`;
                        val.displayName = `left_${val.displayName}`;
                        return val
                      });
                    }
                  }).catch(error => {
                    this.$Message.error(error.response.data.message);
                  });
                }
                // 判断左右关联实体类不是同一个类
                if ('rightClass' in res) {
                  getEntity(res.rightClass).then(mes => {
                    if (mes.success) {
                      let resR = mes.data;
                      temRAttr = resR.attributes
                      .filter(
                        x => x.valueType == "String" || x.valueType == "LocalFile"
                      )
                      this.attributes_rightSys = temRAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.attributes_rightDef = temRAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                      let strTemRAttr = temRAttr.filter(x => x.valueType == "String");
                      this.strAttributes_rightSys = strTemRAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                      this.strAttributes_rightDef = strTemRAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);

                      temRAttr = temRAttr.map(val => {
                        val.attributeName = `right_${val.attributeName}`;
                        val.displayName = `right_${val.displayName}`;
                        return val
                      });
                    }
                  });
                  setTimeout(() => {
                    this.attributesList = temReAttr.concat(temLAttr, temRAttr);
                    this.strAttributesList = this.attributesList.filter(
                      x => x.valueType == "String"
                    );
                  }, 500)
                } else {
                  this.$Message.warning(response.message);
                }
              }
            })
            this.queryData.relationClass = newRefClass;
            this.queryData.query.type = "relation";
          } else {
            // 获取RefClass的属性数组refClassAttributes
            getEntity(newRefClass)
            .then(res => {
              this.resetAttribute();
              this.attributesList = res.data.attributes.filter(
                x => x.valueType == "String" || x.valueType == "LocalFile"
              );
              this.strAttributesList = this.attributesList.filter(
                x => x.valueType == "String"
              );
              this.attributes_sys = this.attributesList.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.attributes_def = this.attributesList.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
              this.strAttributes_sys = this.strAttributesList.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
              this.strAttributes_def = this.strAttributesList.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            })
            .catch(error => {
              this.$Message.error(error.response.data.message);
            });
            this.queryData.targetClass = newRefClass;
          }
        }
      }
    },
    computed: {
      ...mapGetters("DWF_form", [
        "Entities",
        "getEntity",
        "QueryResultAll",
        "Relations",
        "RelationAttrList",]
      ),

      pagedData() {
        if (!this.args.unitPageable) return this.objList;
        else {
          let pdata = this.objList.slice(
            (this.pageIndex - 1) * this.args.pageSize,
            this.pageIndex * this.args.pageSize
          );
          return pdata;
        }
      },

      arg_unitPadding() {
        return this.args.unitPadding + "px";
      },
      arg_unitLabelEmbedHeight() {
        return this.args.unitWidth * 0.2 + "px";
      },
      args_lablesize() {
        return this.args.lableSize + this.args.lableSizeType + '!important';
      },
      imageBackgroundSize() {
        if (this.args.selectedScalingType === 1) return "100% 100%";
        if (this.args.selectedScalingType === 2) return "contain";
        if (this.args.selectedScalingType === 3) return "";
      },
      arg_selectedScalingType() {
        if (this.args.selectedScalingType === 1) return "100%";
        if (this.args.selectedScalingType === 2) return "100%";
        if (this.args.selectedScalingType === 3) return "";
      },
      arg_unitWidthType() {
        if (this.args.unitWidthType === "percentage") return false;
        else return true;
      },
      arg_unitHeight() {
        return this.args.unitHeight + "px";
      },

      // 需要设置目标属性时使用,不用可删去
      arg_name() {
        return this.args.name;
      },
      // 需要设置目标属性时使用,不用可删去
      filter_attributes() {
        return this.attributes
          ? this.relation
            ? [
              "relation",
              this.attributes[1].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[2].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[3].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              )
            ]
            : this.attributes.filter(
              x => this.dataTypes.indexOf(x.valueType) > -1
            )
          : [];
      },
      arg_height() {
        return this.args.height * this.args.basic_height;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
      },
    },
    // 销毁函数,清除生成的内存占用
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    methods: {
      resetAttribute() {
        this.attributes_sys = null;
        this.attributes_def = null;
        this.strAttributes_sys = null;
        this.strAttributes_def = null;
        this.attributes_relationSys = null;
        this.attributes_relationDef = null;
        this.strAttributes_relationSys = null;
        this.strAttributes_relationDef = null;
        this.attributes_leftSys = null;
        this.attributes_leftDef = null;
        this.strAttributes_leftSys = null;
        this.strAttributes_leftDef = null;
        this.attributes_rightSys = null;
        this.attributes_rightDef = null;
        this.strAttributes_rightSys = null;
        this.strAttributes_rightDef = null;
      },

      getErrorIDBRe() {

        this.relationsList = [];
        // 关联类
        let promiseRe = new Promise((resolve, reject) => {
          getAllRelations()
          .then(response => {
            let res = response.data;
            resolve(res);

            if (!res.success) {
              const title = "提示";
              const content = "<p>服务器繁忙, 关联类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val, index, val_arr) => {
                let eachItem = {
                  value: val.className,
                  label: val.displayName
                };
                this.relationsList.push(eachItem);
              });
            }
          })
          .catch(e => {
            console.log(e);
            reject(e);
          });

        })

      },

      initData() {
        this.objList.forEach(x => {
          if (x.objType == "image") {
            this.imageObjList.push(x);
          }
        });
        // console.log("imageObjList", this.imageObjList);
        this.moveablePreviewResetWidth();

        if (this.imageObjList.length > 0) {
          this.cpIdx = 0;
        }
      },
      changeUnitWidth() {
        if (this.args.unitWidthType === "percentage") {
          this.args.unitWidth = this.args.colWidth / (100 / this.args.unitWidth);
        }
      },
      changePage(pageId) {
        this.pageIndex = pageId;
      },
      changePageSize(pageSize) {
        this.args.pageSize = pageSize;
      },
      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        return;
        // if (!this.$refs.main) return;
        // let that = this;
        // this.timer = setInterval(() => {
        //   if (!that.$refs.main) {
        //     clearInterval(that.timer);
        //     that.timer = null;
        //     return;
        //   }
        //   // 改成你需要的样式
        //   var dom = that.$refs.main.querySelector(".i-input .ivu-input");
        //   if (dom) {
        //     dom.style.height = that.arg_height + "px";
        //     clearInterval(that.timer);
        //     that.timer = null;
        //   }
        //   that.times += 30;
        //   if (that.times > 60 * 1000) {
        //     clearInterval(that.timer);
        //     that.timer = null;
        //   }
        // }, 30);
      },

      setDisplayType(type) {
        this.t_preview = type == 0;
        //   this.initTestData();
        return this;
      },

      getFormName() {
        return this.args.name;
      },

      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        if ("name" in args) this.args_name = this.args.name;
        if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
        if ('targetClass' in args && this.args.targetClass) this.args.bindTargetClass = this.args.targetClass;
        return this;
      },

      getArgs() {
        return this.args;
      },

      getAllow() {
        return null;
      },

      getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },

      arg_unitWidth() {
        if (this.args.unitWidthType === "percentage") {
          return this.args.unitWidth + "%";
        } else {
          return this.args.unitWidth + "px";
        }
      },


      // 画廊
      cutPage(type) {
        switch (type) {
          case "prev":
            if (this.cpIdx == 0) {
              this.cpIdx =
                this.imageObjList.length == 0 ? 0 : this.imageObjList.length - 1;
              this.moveablePreviewResetWidth();
            } else {
              this.cpIdx--;
            }
            this.slideAnimate = "slideright";
            break;
          case "next":
            if (this.cpIdx == this.imageObjList.length - 1) {
              this.cpIdx = 0;
              this.moveablePreviewResetWidth();
            } else {
              this.cpIdx++;
            }
            this.slideAnimate = "slideleft";
            break;
        }
      },
      cutPreview(type) {
        if (this.imageObjList.length == 0) return;
        let pvw = this.slideViewWidth - 70;
        let sw = 85;
        try {
          let hideBoxWidth = this.$refs.hidebox.getBoundingClientRect().width;
        } catch (error) {
          console.log(error)
        }
        switch (type) {
          case "prev":
            if (this.previewLeft == 0) return;
            this.previewLeft += sw;
            this.currWidth += sw;
            break;
          case "next":
            if (this.currWidth - pvw <= 5) return;
            this.previewLeft -= sw;
            this.currWidth -= sw;
            break;
        }
      },
      clickPreview(index) {
        if (this.cpIdx == index) return;
        if (this.cpIdx < index) {
          this.slideAnimate = "slideleft";
        } else {
          this.slideAnimate = "slideright";
        }
        // this.isShowing = !this.isShowing;
        this.cpIdx = index;
      },

      // reset width
      moveablePreviewResetWidth() {
        let self = this;
        self.previewLeft = 0;
        self.$nextTick(() => {
          try {
            self.currWidth = self.$refs.hidebox.getBoundingClientRect().width;
          } catch (error) {
            console.log(error)
          }
        });
      },
      // prevNextBtn vieible
      hoverPrevNextVisible() {
        if (this.imageObjList.length == 0) return;
        this.prevNextVisible = true;
      },
      hoverPrevNextHide() {
        if (this.imageObjList.length == 0) return;
        this.prevNextVisible = false;
      },
      handleObjClick(item) {
        console.log("click item", item);
      },
      getSelected() {
        return this.clickedObj;
      }
    }
  };
</script>

<style scoped>
  section {
    display: inline-block;
    width: 100%;
    vertical-align: top;
  }

  p {
    margin: 10px 0;
  }

  .margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    vertical-align: middle;
    background: rgba(101, 101, 101, 0.6);
    color: #ffffff;
    opacity: 0;
    width: 100%;
    height: 100%;
  }

  .gallery.mask {
    opacity: 1;
  }

  .img_div {
    position: relative;
  }

  .img_div div:hover .mask {
    opacity: 1;
  }

  a:link {
    color: white;
  }

  a:visited {
    color: white;
  }

  a:hover {
    color: rgb(101, 156, 201);
  }

  a:active {
    color: white;
  }
</style>
<style scoped>
  ul {
    list-style: none;
  }

  .clear:after {
    content: "";
    height: 0;
    display: block;
    clear: both;
  }

  .no-album {
    background: #f5f5f5;
    color: #969696 !important;
  }

  .no-pic {
    background: #eee;
    font-size: 14px;
    height: 100%;
    text-align: center;
    color: #969696;
    line-height: 100%;
    vertical-align: middle;
  }

  .preview-img {
    width: 100%;
    height: 100%;
    background-size: 100% auto;
    background-position: center center;
    background-repeat: no-repeat;
    background-color: #eee;
  }

  .preview-no-pic {
    text-align: center;
    font-size: 14px;
    color: #969696;
    background: #eee;
  }

  .o-slide-item {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .o-slide-item {
    background-size: auto 100%;
    background-repeat: no-repeat no-repeat;
  }

  .o-sldie-container {
    margin-bottom: 100px;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    /* background: white; */
  }

  .only-slide {
    position: relative;
    width: 100%;
    height: 80%;
    overflow: hidden;
  }

  .o-slide-wapper {
    width: auto;
    height: 100%;
    white-space: nowrap;
  }

  .o-slide-item {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    vertical-align: top;
    background-size: 100% auto;
    background-position: center center;
    background-repeat: no-repeat;
  }

  .o-slide-item span {
    position: absolute;
    left: 10px;
    bottom: 10px;
    display: inline-block;
    padding: 3px 10px;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    border-radius: 3px;
    max-width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
  }

  .o-prev,
  .o-next {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto 0;
    width: 55px;
    height: 55px;
    font-size: 20px;
    line-height: 55px;
    color: #fff;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.4);
    text-align: center;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .o-prev img,
  .o-next img {
    vertical-align: middle;
    display: inline-block;
    width: 32px;
    height: 32px;
  }

  .o-prev {
    left: 10px;
  }

  .o-next {
    right: 10px;
  }

  .pagination {
    position: absolute;
    right: 6px;
    bottom: 6px;
    font-size: 12px;
    color: #fff;
    text-shadow: 0 0 7px rgba(0, 0, 0, 0.9);
  }

  .o-preview {
    margin-top: 15px;
    width: 100%;
    height: 60px;
    padding: 0 35px;
    line-height: 60px;
    position: relative;
    box-sizing: border-box;
  }

  .o-preview-wapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .o-preview-wapper ul {
    position: absolute;
    top: 0;
    left: 0;
    width: auto;
    height: 100%;
    padding: 0;
    margin: 0;
    white-space: nowrap;
    text-align: left;
    transition: all 0.3s;
  }

  .o-preview-wapper ul li {
    vertical-align: top;
    display: inline-block;
    width: 80px;
    height: 100%;
    margin-right: 5px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .o-preview-wapper ul li:hover {
    opacity: 1 !important;
  }

  .o-preview-wapper ul li img {
    width: 100%;
    height: 100%;
  }

  .o-preview-prev,
  .o-preview-next {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto 0;
    width: 35px;
    height: 100%;
    font-size: 28px;
    line-height: 60px;
    color: #454545;
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.2s;
  }

  .o-preview-prev:hover,
  .o-preview-next:hover {
    opacity: 1;
  }

  .o-preview-prev {
    left: 0;
    text-align: left;
  }

  .o-preview-next {
    right: 0;
    text-align: right;
  }

  .slideleft-enter-active {
    animation: slideLeftEnter 0.5s;
  }

  .slideleft-leave-active {
    animation: slideLeftLeave 0.5s;
  }

  @keyframes slideLeftEnter {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideLeftLeave {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  .slideright-enter-active {
    animation: slideRightEnter 0.5s;
  }

  .slideright-leave-active {
    animation: slideRightLeave 0.5s;
  }

  @keyframes slideRightEnter {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideRightLeave {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }
</style>
<style>
  .multi-object-preview {
    position: relative;
  }

  .multi-object-preview .ivu-card-body {
    padding: 0px !important;
  }

  .multi-object-preview .mask .ivu-icon {
    padding: 5px 10px;
    font-size: 30px !important;
  }
</style>
