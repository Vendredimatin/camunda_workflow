<template>
  <div ref="main" class="editBox">
    <h1 style="font-size: 14px;">{{ editBoxConfigData.title || args.title }}</h1>
    <hr/>
    <Tabs v-model="property" name="editBox" :animated="false" size="small" @on-click="tabClick">
      <TabPane label="属性" name="property" tab="editBox">
        <!-- 控件代号 -->
        <div v-if="'id' in args">
          <p class="margin1">控件代号</p>
          <Input class="margin1" v-model="args.id" placeholder="控件唯一识别ID"/>
        </div>
        <!--
            目标属性
            目前只支持实体类属性
         -->
        <div v-if="'name' in args">
          <p class="margin1">目标属性</p>
          <div style="display: inline-block;width: calc(100% - 40px)">
            <Select v-if="!isRelation" class="margin1 editbox-name" filterable clearable v-model="args_name" ref="nameSelectBox">
              <OptionGroup label="系统属性">
                <Option v-for="item in c_attributes_sys" :key="item.id" :value="item.attributeName">{{ item.displayName
                  }}&nbsp&nbsp{{ item.attributeName }}
                </Option>
              </OptionGroup>
              <OptionGroup label="类属性">
                <Option v-for="item in c_attributes_def" :key="item.id" :value="item.attributeName">{{ item.displayName
                  }}&nbsp&nbsp{{ item.attributeName }}
                </Option>
                <Option v-show="addin_name !== 'Attachments'" value="-1" key="-1">自定义</Option>
              </OptionGroup>
            </Select>
            <Select v-else class="margin1 editbox-name" filterable clearable v-model="args_name" ref="nameSelectBox">
              <OptionGroup label="关联类系统属性">
                <Option v-for="item in c_attributes_relationSys" :key="item.id"
                        :value="'relation_' + item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName
                  }}
                </Option>
              </OptionGroup>
              <OptionGroup label="关联类属性">
                <Option v-for="item in c_attributes_relationDef" :key="item.id"
                        :value="'relation_' + item.attributeName">{{ item.displayName }}&nbsp&nbsp{{ item.attributeName
                  }}
                </Option>
                <Option v-show="addin_name !== 'Attachments'" value="-1" key="-1">自定义</Option>
              </OptionGroup>
              <OptionGroup label="左类系统属性">
                <Option v-for="item in c_attributes_leftSys" :key="item.id" :value="'left_' + item.attributeName">{{
                  item.displayName }}&nbsp&nbsp{{ item.attributeName }}
                </Option>
              </OptionGroup>
              <OptionGroup label="左类属性">
                <Option v-for="item in c_attributes_leftDef" :key="item.id" :value="'left_' + item.attributeName">{{
                  item.displayName }}&nbsp&nbsp{{ item.attributeName }}
                </Option>
              </OptionGroup>
              <OptionGroup label="右类系统属性">
                <Option v-for="item in c_attributes_rightSys" :key="item.id" :value="'right_' + item.attributeName">{{
                  item.displayName }}&nbsp&nbsp{{ item.attributeName }}
                </Option>
              </OptionGroup>
              <OptionGroup label="右类属性">
                <Option v-for="item in c_attributes_rightDef" :key="item.id" :value="'right_' + item.attributeName">{{
                  item.displayName }}&nbsp&nbsp{{ item.attributeName }}
                </Option>
              </OptionGroup>
            </Select>
          </div>
          <div style="display: inline-block;width: 35px">
            <div>
              <Button icon="md-add" size="small" type="primary"
                      @click="addAttr"
                      :disabled="classCategory === 'ExternalItemClass' || targetclass === 'Component'"
                      style=" margin-left: 3px ;margin-right: 3px;">
              </Button>
            </div>
          </div>
          <Input class="margin1" v-show="args_name == '-1'" v-model="args.name" placeholder="自定义输入目标属性"/>
        </div>

        <div v-if="!editBoxConfigData.hideTargetClass">
          <!-- 目标绑定类 -->
          <div v-if="('bindTargetClass' in args && addin_name !== 'CheckBox' && addin_name !== 'RadioButton' && addin_name !== 'SelectInput') || args.useDictionary">
            <p class="margin1" v-if="addin_name !== 'SingleObjectSelector' && addin_name !== 'SingleObjectModal' && addin_name !== 'MultiObjectsTag' && addin_name !== 'CheckBox' && addin_name !== 'RadioButton' && addin_name !== 'SelectInput'">目标类</p>
            <p class="margin1" v-else>引用类</p>
            <Select ref="selectGoal" v-model="args.bindTargetClass" filterable clearable
                    class="editbox-targetClass"
                    @on-clear="clearBindTargetClass"
                    @on-change="handleBindTargetClassChange">
              <OptionGroup label="实体类">
                <Option v-for="item in entitiesList" :value="item.value" :key="item.id" :label="item.label">
                  <span>{{ item.label }}</span>
                  <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                </Option>
              </OptionGroup>
              <OptionGroup label="关联类">
                <Option v-for="item in relationsList" :value="item.value" :key="item.id" :label="item.label">
                  <span>{{ item.label }}</span>
                  <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
                </Option>
              </OptionGroup>
            </Select>
          </div>

          <!-- 显示字段 -->
          <div v-if="'labelAttr' in args && args.useDictionary">
            <p class="margin1">浏览字段</p>
            <Select ref="labelAttrSelect" class="editbox-targetClass margin1" v-model="args.labelAttr" filterable multiple clearable v-if="reloadSelect">
              <OptionGroup label="系统属性" v-if="refClassAttributes_sys">
                <Option v-for="(attr, index) in refClassAttributes_sys" :value="attr.attributeName" :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="类属性" v-if="refClassAttributes_def">
                <Option v-for="(attr, index) in refClassAttributes_def" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="关联类系统属性" v-if="refClassAttributes_relationSys">
                <Option v-for="(attr, index) in refClassAttributes_relationSys" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="关联类属性" v-if="refClassAttributes_relationDef">
                <Option v-for="(attr, index) in refClassAttributes_relationDef" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="左类属性" v-if="refClassAttributes_leftDef">
                <Option v-for="(attr, index) in refClassAttributes_leftDef" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="右类属性" v-if="refClassAttributes_rightDef">
                <Option v-for="(attr, index) in refClassAttributes_rightDef" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
            </Select>
          </div>

          <!-- 回填字段 -->
          <div v-if="'valueAttr' in args && args.useDictionary">
            <p class="margin1">回填字段</p>
            <Select v-if="reloadSelect" ref="valueAttrSelect" class="editbox-targetClass margin1" v-model="args.valueAttr" filterable :multiple="args.noNumber" clearable>
              <OptionGroup label="系统属性" v-if="filter_refClassAttributes_sys">
                <Option v-for="(attr, index) in filter_refClassAttributes_sys" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="类属性" v-if="filter_refClassAttributes_def">
                <Option v-for="(attr, index) in filter_refClassAttributes_def" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="关联类系统属性" v-if="filter_refClassAttributes_relationSys">
                <Option v-for="(attr, index) in filter_refClassAttributes_relationSys" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="关联类属性" v-if="filter_refClassAttributes_relationDef">
                <Option v-for="(attr, index) in filter_refClassAttributes_relationDef" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="左类属性" v-if="filter_refClassAttributes_leftDef">
                <Option v-for="(attr, index) in filter_refClassAttributes_leftDef" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
              <OptionGroup label="右类属性" v-if="filter_refClassAttributes_rightDef">
                <Option v-for="(attr, index) in filter_refClassAttributes_rightDef" :value="attr.attributeName"
                        :key="index || ''" :label="attr.displayName">{{ attr.displayName }}&nbsp&nbsp{{ attr.attributeName }}</Option>
              </OptionGroup>
            </Select>
          </div>
          <Spin fix v-if="spinShow"></Spin>
        </div>

        <!-- 标签名称 -->
        <div v-if="'label' in args">
          <p class="margin1">标签名称</p>
          <Input class="margin1" v-model="args.label" placeholder="控件标签,位于控件前"/>
        </div>
        <!-- 日期格式 -->
        <div v-if="'format' in args && args.isMobile !== true">
          <p class="margin1">日期格式</p>
          <Select class="margin1" v-model="args.format" filterable @on-change="changeDateFormat">
            <Option v-for="item in formatList" :value="item.value" :key="item.value">{{item.name}}</Option>
          </Select>
        </div>
        <!-- 默认值 -->
        <div v-if="'defaultValue' in args">
          <p v-show="addin_name !== 'DateInput'" class="margin1">默认值</p>
          <div v-show="addin_name === 'DateInput'">
            <span class="margin1">默认值</span>
            <i-switch size="small" style="float: right; margin-left: 6px;" v-model="args.setNow"
                      @on-change="setNowTime"/>
            <span style="float: right">当前时间</span>
          </div>
          <InputNumber class="margin1" v-model="args.defaultValue"
                       @on-change="value => defaultValueChange(value, 'number')" placeholder="默认值"
                       v-if="(addin_name === 'NumberInput' || addin_name === 'D_Rate'|| addin_name === 'Stepper')" style="width: 100%"/>
          <DatePicker class="margin1" :format="args.format" :type="args.defaultDateType" v-model="args.defaultValue"
                      @on-change="value => defaultValueChange(value, 'date')" :disabled="args.setNow == true"
                      placeholder="默认值"
                      v-else-if="addin_name === 'DateInput'" style="width: 100%"/>
          <Input class="margin1" v-model="args.defaultValue" placeholder="默认值" v-else style="width: 100%"/>
        </div>
        <!--
            验证规则
            rules待补充
         -->
        <div v-if="'rule' in args">
          <p class="margin1">验证规则</p>
          <Select class="margin1" clearable v-model="args_rule">
            <Option v-for="item in rules" :key="item.id" :value="item.value">{{ item.label }}</Option>
            <Option value="-1">自定义</Option>
          </Select>
          <Input class="margin1" v-show="args_rule == '-1'" v-model="args.rule" placeholder="自定义输入验证规则"/>
        </div>
        <!-- 验证错误提示信息 -->
        <div v-if="'ruleMessage' in args">
          <p class="margin1">验证提示信息</p>
          <Input class="margin1" v-model="args.ruleMessage"/>
        </div>


        <slot name="attribute"></slot>
        <div v-if="('filterQuery' in args && addin_name !== 'CheckBox' && addin_name !== 'RadioButton' && addin_name !== 'SelectInput' && !editBoxConfigData.hideFilterQuery) || args.useDictionary">
          <p class="margin1">过滤条件</p>
          <Input class="margin1" v-model="args.filterQuery" type="textarea" placeholder="输入过滤条件" :rows="10"
                 :disabled="!args.bindTargetClass"
                 @on-focus="inputQuery"></Input>
          <FilterQueryCommonModal
                  :args="args"
                  :itemValue="itemValue"
                  :refClass="args.bindTargetClass"
                  :targetClass="targetclass"
                  ref="filterQuery_modal"
                  :root="root"
                  :store="store"
                  @generatorFilterQuery="getFilterQuery">
          </FilterQueryCommonModal>
        </div>
        <div v-if="addin_name == 'EncodeInput'">
          <p class="margin1">自定义前缀生成器</p>
          <Input class="margin1" v-model="args.encodePrefix" type="textarea" placeholder="输入生成规则" :rows="10"
                 @on-focus="encodeQuery"></Input>
          <FilterQueryEncodeModal
                  :args="args"
                  :itemValue="itemValue"
                  :refClass="args.bindTargetClass"
                  :targetClass="targetclass"
                  ref="filterQuery_modal"
                  :root="root"
                  :store="store"
                  @generatorEncodePrefix="getEncodePrefix">
          </FilterQueryEncodeModal>
        </div>
        <!-- 开关区域 -->

      <div v-if="'showBadge' in args">
        <div class="margin1" >
            显示徽标
            <i-switch style="float: right" v-model="args.showBadge" @on-change="closeBadge" />
        </div>
        <div v-show="args.showBadge">
          <div class="margin1" >
              徽标类型
            <Select v-model="args.badge_type" filterable clearable @on-change="changeBadgeType">
              <Option v-for="item in badgeTypes" :value="item.value" :key="item.value" :label="item.label">
                {{ item.label }}
              </Option>
            </Select>
          </div>
          <div v-show="args.badge_type!='dot'">
            <p  class="margin1">徽标大小</p>
            <Input class="margin1" v-model="args.badge_size" type="number">
              <Select v-model="args.badge_stype" slot="append" style="width: 70px;">
                <Option value="px">px</Option>
                <Option value="rem">rem</Option>
              </Select>
            </Input>

          </div>
          <div class="margin1">
            <p class="margin1" style="float: left; margin-right: 15px;">徽标颜色:</p>
            <ColorPicker v-model="args.badge_color" alpha/>
          </div>
          <div v-if="args.badge_type=='icon'">
            <p class="margin1">徽标图标</p>
            <Select v-model="args.badge_icon" filterable clearable>
              <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                <van-icon :name="`${item.value}`" size=20></van-icon>
                <span style="float:right;color:#ccc">{{ item.label }}</span>
              </Option>
            </Select>
          </div>
          <div v-else>
            <div v-if="args.badge_type=='number'">
              <p class="margin1">绑定属性</p>
              <Select v-model="args.badge_atrr" filterable clearable @on-change="badgeBindAttr">
                <OptionGroup v-for="group in badgeNumberTypeList" :label="group.groupName" :key="group.groupName">
                  <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                    <span>{{ item.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                  </Option>
                </OptionGroup>
              </Select>
              <p class="margin1">显示数值</p>
              <InputNumber class="margin1" style="width: 100%" :max="1e20" :min="-1e20" v-model="args.badge_content" type="number" :disabled="args.badge_atrr!=''&&args.badge_atrr!=undefined">
              </InputNumber>
              <p class="margin1">最大值</p>
              <InputNumber class="margin1" style="width: 100%" :max="1e20" :min="-1e20"  v-model="args.badge_max" type="number">
              </InputNumber>
            </div>
            <div v-else-if="args.badge_type=='text'">
                <p class="margin1">绑定属性</p>
                <Select v-model="args.badge_atrr" filterable clearable @on-change="badgeBindAttr">
                  <OptionGroup v-for="group in badgeAttrList" :label="group.groupName" :key="group.groupName">
                    <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                      <span>{{ item.displayName }}</span>
                      <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                    </Option>
                  </OptionGroup>
                </Select>
                <p class="margin1">显示内容</p>
                <Input class="margin1" v-model="args.badge_content" :disabled="args.badge_atrr!=''&&args.badge_atrr!=undefined"/>
            </div>
            <div v-else>
                <p class="margin1">绑定属性</p>
                <Select v-model="args.badge_atrr" filterable clearable>
                  <OptionGroup v-for="group in badgeBooleanTypeList" :label="group.groupName" :key="group.groupName">
                    <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                      <span>{{ item.displayName }}</span>
                      <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                    </Option>
                  </OptionGroup>
                </Select>

            </div>
          </div>
        </div>
      </div>
        <div v-if="'dynamic' in args">
          <div class="margin1" style="margin: 10px 0 10px 0">
            {{ addin_name == 'JoinCascaderTree' ? '目录监听' : '动态响应' }}
            <i-switch style="float: right" v-model="args.dynamic" :disabled="addin_name === 'DynamicDigitalLabel' && !!args.bindTargetClass"/>
          </div>
        </div>
         <div v-if="'needCheckDuplic' in args">
          <div class="margin1" style="margin: 10px 0 10px 0">
            值判重
            <i-switch style="float: right" v-model="args.needCheckDuplic"/>
          </div>
        </div>
      </TabPane>
      <TabPane v-if="addin_name !== 'WatchMessage'" label="样式" name="style" tab="editBox">
        <!--
            整体高度
            相对高度, 1为单位行高,在表单的基础配置中设置
         -->
        <div v-if="'height' in args">
          <p class="margin1">整体高度</p>
          <!-- <InputNumber class="margin1" :min="1" v-model="args.height" style="display: inline-block; width: 100%"
              placeholder="相对值,单位行高为1" /> -->
          <Input v-if="addin_name !== 'SimpleTable'" class="margin1" v-model="args.height" type="number">
            <Select v-model="args.heightType" slot="append" style="width: 70px;">
              <Option value="px">px</Option>
              <Option value="vw">vw</Option>
              <Option value="vh">vh</Option>
              <Option value="rem">rem</Option>
            </Select>
          </Input>
          <Input v-else class="margin1" v-model="args.height" type="number">
            <Select v-model="args.heightType" slot="append" style="width: 70px;">
              <Option value="px">px</Option>
            </Select>
          </Input>
        </div>
        <!-- 缺省高度 布局空间所有 -->
        <div v-if="'basic_height' in args">
          <p class="margin1">单位行高</p>
          <InputNumber class="margin1" :min="20" v-model="args.basic_height"
                       style="display: inline-block; width: 100%"/>
        </div>
        <!-- 整体宽度 -->
        <div v-if="'width' in args">
          <p class="margin1">整体宽度</p>
          <Input class="margin1" v-model="args.width" type="number">
            <Select v-model="args.widthType" slot="append" style="width: 70px;">
              <Option value="%">%</Option>
              <Option value="px">px</Option>
              <Option value="vw">vw</Option>
              <Option value="vh">vh</Option>
              <Option value="rem">rem</Option>
            </Select>
          </Input>
        </div>

        <!-- 背景图片 -->
        <div v-if="'imgOrigin' in args">
          <p class="margin1">背景图片地址源</p>
          <Select class="margin1" v-model="args.imgOrigin" @on-change="switchOrigin">
            <Option value="imgBase">图片库</Option>
            <Option value="imgSelf">自定义</Option>
          </Select>
          <Input class="margin1" type="textarea" :autosize="true" v-model="args.back_picture" @on-focus="chooseOrigin"/>
          <!-- 图片库编辑弹窗 -->
          <ImgEditModal ref="img_modal" @transferImg="getImgUrl"></ImgEditModal>
        </div>
        <!-- 背景图片显示方式 -->
        <div v-if="'bgStyle' in args">
          <p class="margin1">背景图片显示方式</p>
          <Select class="margin1" v-model="args.bgStyle" @on-change="changeBgStyle">
            <Option v-for="item in bgStyleList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <Input class="margin1" v-show="showPercentNumber" v-model="args.bgPercent" type="number"
                 @on-change="changeBgPercent">
            <span slot="append">%</span>
          </Input>
        </div>
        <!-- 背景颜色 -->
        <div v-if="'back_color' in args">
          <div class="margin1">
            <p class="margin1" style="float: left; margin-right: 15px;">背景颜色:</p>
            <ColorPicker v-model="args.back_color" alpha/>
          </div>
        </div>
        <!-- 标签字体样式 -->
        <div v-if="'label_fontColor' in args">
          <div class="margin1" style="margin: 10px 0 10px 0">
            标签字体颜色
            <ColorPicker v-model="args.label_fontColor"/>
          </div>
        </div>
        <div v-if="'lfsize' in args">
          <p class="margin1">标签文本大小</p>
          <Input class="margin1" v-model="args.lfsize" type="number">
            <Select v-model="args.lfsizeType" slot="append" style="width: 70px;">
              <Option value="px">px</Option>
              <Option value="rem">rem</Option>
            </Select>
          </Input>
        </div>
        <!-- 内容字体样式 -->
        <div v-if="'txt_fontColor' in args">
          <div class="margin1" style="margin: 10px 0 10px 0">
            内容字体颜色
            <ColorPicker v-model="args.txt_fontColor"/>
          </div>
        </div>
        <div v-if="'fsize' in args">
          <p class="margin1">内容文本大小</p>
          <Input class="margin1" v-model="args.fsize" type="number">
            <Select v-model="args.fsizeType" slot="append" style="width: 70px;">
              <Option value="px">px</Option>
              <Option value="rem">rem</Option>
            </Select>
          </Input>
        </div>
        <div v-if="'txt_bgColor' in args">
          <div class="margin1" style="margin: 10px 0 10px 0">
            输入框背景颜色
            <ColorPicker v-model="args.txt_bgColor" alpha/>
          </div>
        </div>
        <!--
            元素排列方式
            待处理
         -->
        <!--
            元素之间对齐
            待处理
         -->
        <!-- 标签:主区域占比 -->
        <div v-if="'label_width' in args">
          <p class="margin1" v-show="args.labelWidthUnit === '%'">标签与主区域</p>
          <p class="margin1" v-show="args.labelWidthUnit === 'px'">标签宽度</p>
          <div v-show="args.labelWidthUnit === '%'">
            <InputNumber style="width: 50px;text-align: center" :min="1" v-model="args.label_width"/>
            <span> : </span>
            <div style="display: inline-block;height: 32px;line-height: 32px;vertical-align: middle;margin: 0px;padding: 0px;width: calc(100% - 62px);">
              <InputNumber class="margin1" v-model="args.main_width" :min="0" style="width: calc(100% - 60px);height: 32px;margin: 0px;top: 0px;border-radius: 4px 0 0 4px;">
              </InputNumber>
              <Select class="labelWidthUnit" v-model="args.labelWidthUnit"  style="width: 60px;background-color: #f8f8f9;">
                <Option value="%">比例</Option>
                <Option value="px">px</Option>
              </Select>
            </div>
          </div>
          <div v-show="args.labelWidthUnit === 'px'">
            <InputNumber class="margin1" v-model="args.label_widthByPx" :min="0" style="width: calc(100% - 60px);height: 32px;margin: 0px;top: 0px;border-radius: 4px 0 0 4px;">
            </InputNumber>
            <Select class="labelWidthUnit" v-model="args.labelWidthUnit"  style="width: 60px;background-color: #f8f8f9;">
              <Option value="%">比例</Option>
              <Option value="px">px</Option>
            </Select>
<!--            <Input class="margin1" v-model="args.label_widthByPx" type="number" style="width: 100%;height: 32px;">-->
<!--              <Select v-model="args.labelWidthUnit" slot="append" style="width: 60px;">-->
<!--                <Option value="%">比例</Option>-->
<!--                <Option value="px">px</Option>-->
<!--              </Select>-->
<!--            </Input>-->
          </div>
        </div>
        <!-- 对齐方式 -->
        <div>
          <p v-if="'label_align' in args || 'main_align' in args" class="margin1">对齐方式</p>
          <Row>
            <Col span="12" v-if="'label_align' in args">
              <div class="margin1">
                <div style="text-align: center">
                  <Button :type="args.label_align == 0 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 0"></Button>
                  <Button :type="args.label_align == 3 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 3"></Button>
                  <Button :type="args.label_align == 6 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 6"></Button>
                </div>
                <div style="text-align: center">
                  <Button :type="args.label_align == 1 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 1"></Button>
                  <Button :type="args.label_align == 4 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 4"></Button>
                  <Button :type="args.label_align == 7 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 7"></Button>
                </div>
                <div style="text-align: center">
                  <Button :type="args.label_align == 2 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 2"></Button>
                  <Button :type="args.label_align == 5 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 5"></Button>
                  <Button :type="args.label_align == 8 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.label_align = 8"></Button>
                </div>
              </div>
              <div style="text-align: center">
                <p class="margin1">标签区域</p>
              </div>
            </Col>
            <Col span="12" v-if="'main_align' in args &&  addin_name !== 'DynamicMap' && addin_name !== 'DynamicParameterFrame' && addin_name !== 'DragItem'">
              <div class="margin1">
                <!-- <div style="text-align: center">
                    <Button :type="args.main_align == 0 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 0"></Button>
                    <Button :type="args.main_align == 3 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 3"></Button>
                    <Button :type="args.main_align == 6 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 6"></Button>
                </div> -->
                <div style="text-align: center">
                  <Button :type="args.main_align == 1 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 1"></Button>
                  <Button :type="args.main_align == 4 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 4"></Button>
                  <Button :type="args.main_align == 7 ? 'primary' : 'default'"
                          style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 7"></Button>
                </div>
                <!-- <div style="text-align: center">
                    <Button :type="args.main_align == 2 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 2"></Button>
                    <Button :type="args.main_align == 5 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 5"></Button>
                    <Button :type="args.main_align == 8 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0" @click="args.main_align = 8"></Button>
                </div> -->
              </div>
              <div style="text-align: center">
                <p class="margin1">主区域</p>
              </div>
            </Col>
          </Row>
        </div>
        <!-- 整体布局方式 -->
        <div v-if="'structural_layout' in args" >
          <p class="margin1">布局</p>
          <Select v-model="args.structural_layout">
            <Option v-for="layout in structural_layoutList" :key="layout.value" :value="layout.value">{{ layout.label }}</Option>
          </Select>
        </div>
        <!--
            缺省文本
            布局空间所有
            待处理
         -->
        <!--
            标签区域
            待处理
         -->
        <!--
            分组背景
            待处理
         -->
        <!--
            主区域
            待处理
         -->
        <slot name="layout"></slot>
        <!-- 开关区域 -->
        <div v-if="'required' in args">
          <div class="margin1" style="margin: 10px 0 10px 0">
            必填
            <i-switch style="float: right" v-model="args.required"/>
          </div>
        </div>
        <div v-if="'readonly' in args">
          <div class="margin1" style="margin: 10px 0 10px 0">
            只读
            <i-switch style="float: right" v-model="args.readonly" :disabled="args.readonlyDisabled"/>
          </div>
        </div>
        <div v-if="'hided' in args">
          <div class="margin1" style="margin: 10px 0 10px 0">
            隐藏
            <i-switch style="float: right" v-model="args.hided"/>
          </div>
        </div>
        <div v-if="'width' in args" style="height: 60px"/>
      </TabPane>
      <TabPane v-if="'events' in args" label="事件" name="event" tab="editBox">
        <div v-if="showEventTab" v-for="(item, index) in args.events" :key="index" class="margin1">
          <Row class="margin1">
            <Col span="12">
<!--              <Row v-if="item.tmp" type="flex" align="middle">-->
<!--                <Col span="18">-->
<!--                  <Select v-model="item.name">-->
<!--                    <Option v-for="(eItem, _index) in leftEvents" :key="_index" :value="eItem">{{ eItem }}</Option>-->
<!--                  </Select>-->
<!--                </Col>-->
<!--                <Col span="6"><span>事件</span></Col>-->
<!--              </Row>-->
              <span>{{ item.name }}事件</span>
            </Col>
            <!--            <Col span="9">-->
            <!--              <Button style="float: right; margin-left: 10px"-->
            <!--                      size="small" type="gohst" icon="md-close" @click="cancelEvent(index)"></Button>-->
            <!--              <Button v-if="item.tmp" style="float: right; margin-left: 10px"-->
            <!--                      size="small" type="primary" icon="md-checkmark" @click="confirmEvent(index)"></Button>-->
            <!--            </Col>-->
          </Row>

          <BindOperationBar
            :index="index"
            ref="bindOperation_bar"
            :opr_path="item.opr_path"
            :opr_type="item.opr_type"
            :opr_name="item.name"
            :opr_sys_path="item.opr_sys_path"
            :opr_showMessage="item.opr_showMessage"
            :form_targetclass="targetclass"
            :form_json="itemValue"
            :load_query_oprs="query_oprs"
            :bindGlobalOpr="bindGlobalOpr"
            :bindLocalOpr="bindLocalOpr"
            :route="route"
            :router="router"
            :root="root"
            v-on:on-change="handleChangeEventOfOperationBar"
            style="width:100%">
          </BindOperationBar>
          <!--          <hr/>-->
        </div>
        <!--        <div v-if="leftEvents.length > 0" class="margin1" style="text-align: center">-->
        <!--          <Button type="primary" @click="createEvent">新增事件</Button>-->
        <!--        </div>-->
        <slot name="operation"></slot>
      </TabPane>
      <TabPane v-if="!('hideWidgetAnnotation' in args)" label="批注" name="widgetAnnotation" tab="editBox">
        <br>
        <div>
          <Input type="textarea" v-model="widgetAnnotationCommit" @on-change="widgetAnnotationChange"></Input>
        </div>
      </TabPane>
    </Tabs>
    <div style="height: 30px"/>
    <Spin size="large" fix v-if="editSpin"></Spin>
  </div>
</template>

<script>
  import BindOperationBar from "./subcomponent/BindOperationBar.vue"
  import ImgEditModal from './subcomponent/ImgCommonModal'
  import { getEntity } from "@/api/data-model/EntityModeling";
  import { getRelation } from '@/api/data-model/RelationModeling';
  import {mapGetters, mapActions} from "vuex";
  import FilterQueryCommonModal from './subcomponent/FilterQueryCommonModal'
  import FilterQueryEncodeModal from './subcomponent/FilterQueryEncodeModal'
  import {getAllEntities, getAllRelations, getEntryOperations} from '@/api/others.js';
  import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
  import vantIconData from "@/views/functional-model/components/vantIcon.js";
  import _ from "lodash";

  export default {
    components: {BindOperationBar, ImgEditModal, FilterQueryCommonModal, FilterQueryEncodeModal},
    model: {
      prop: 'args',
      event: 'change',
    },
    props: {
      itemValue: Object,
      args: Object,
      addinName: String,
      attributes: Array,
      targetclass: String,
      route: Object,
      router: Object,
      root: Object,
      store: Object,
      dataTypes: Array,
      Message: Object,
      widgetAnnotation: Object,
      editExtendInfo: Object,
      editBoxConfig: Object,
    },
    data() {
      return {
        query_oprs: [],
        open: ["1", "3"],
        property: 'property',
        widgetAnnotationCommit: '',
        isExEn: false,
        editSpin: false,
        firstLoad: true,
        spinShow: false,
        showEventTab: false,
        reloadSelect: true,
        labelAttrCache: [],
        valueAttrCache: null,
        bindGlobalOpr: null,
        bindLocalOpr: null,
        queryData: {
          query: {
            query: "",
            startIndex: 0,
            pageSize: 3
          }, // 查询条件
          targetClass: "",    // 目标类名
          formName: "",   //
          fresh: true,
          uuid: ""
        },
        objectList: [],
        // args: {
        //     label_width: 2,
        //     main_width: 3,
        //     label_align: 4,
        //     main_align: 4,
        //     basic_height: 30,
        //     label: "",
        //     name: "",
        //     height: 1,
        //     col: true,
        //     rows: 3,
        //     cols: 3,
        //     targetDataType: null,

        //     filter_c_attributes: [],
        // },
        defaultDateType: 'date',
        formatList: [
          {
            value: "yyyy-MM-dd",
            name: "年月日"
          },
          {
            value: "yyyy-MM-dd HH:mm:ss",
            name: "年月日时分秒"
          },
          {
            value: "yyyy",
            name: "年"
          },
          {
            value: "yyyy-MM",
            name: "年月"
          },
          {
            value: "HH:mm:ss",
            name: "时分秒",
          },
          {
            value: "HH:mm",
            name: "时分",
          }
        ],
        // 对齐方式,布局插件使用
        alignList: [
          {value: 1, name: "靠左对齐"},
          {value: 4, name: "居中对齐"},
          {value: 7, name: "靠右对齐"},
          {value: 0, name: "左上对齐"},
          {value: 2, name: "左下对齐"},
          {value: 3, name: "顶部对齐"},
          {value: 5, name: "底部对齐"},
          {value: 6, name: "右上对齐"},
          {value: 8, name: "右下对齐"}
        ],
        bgStyleList: [
          {
            value: 'auto',
            label: '图片宽高填充'
          },
          {
            value: 'cover',
            label: '拉伸充满容器'
          }, {
            value: 'contain',
            label: '宽高比适合于容器'
          }, {
            value: 'repeat',
            label: '重复填充'
          }, {
            value: 'repeat-x',
            label: '水平重复填充'
          }, {
            value: 'repeat-y',
            label: '垂直重复填充'
          }, {
            value: 'percentage',
            label: '百分比填充'
          }
        ],

        badgeTypes: [{
            value: 'dot',
            label: "点"
          },
          {
            value: 'icon',
            label: "图标"
          },
          {
            value: 'number',
            label: "数字"
          },
          {
            value: 'text',
            label: "文本"
          },
        ],
        // 验证规则
        rules: [],

        args_name: "",
        args_rule: "",

        leftEvents: [],

        isRelation: false,

        entitiesList: [],
        relationsList: [],
        attrMap: {},
        c_attributes_sys: [],
        c_attributes_def: [],
        c_attributes_relationSys: [],
        c_attributes_relationDef: [],
        c_attributes_leftSys: [],
        c_attributes_leftDef: [],
        c_attributes_rightSys: [],
        c_attributes_rightDef: [],

        refClassAttributes_sys: [],
        refClassAttributes_def: [],
        refClassAttributes_relationSys: [],
        refClassAttributes_relationDef: [],
        refClassAttributes_leftSys: [],
        refClassAttributes_leftDef: [],
        refClassAttributes_rightSys: [],
        refClassAttributes_rightDef: [],

        badgeAttrList: [],
        badgeNumberTypeList: [],
        badgeBooleanTypeList: [],

        structural_layoutList: [
          {
            value: 'horizontal',
            label: '水平'
          },
          {
            value: 'vertical',
            label: '垂直'
          }
        ],
        classCategory: '',
        bindTargetClass: '',
        editBoxConfigData: {
          title: '',
          hideTargetClass: false,
          hideFilterQuery: false,
        },
        addin_name: '',
        sysEventPath: ['save', 'edit', 'delete'], //可绑定后处理操作的系统事件
      }
    },
    created() {
      this.$store = this.store;
      this.editBoxConfigData = this.editBoxConfig ? this.editBoxConfig : this.editBoxConfigData;
      this.addin_name = this.addinName;
      let self = this;
      this.c_attributes = _.cloneDeep(this.attributes);

      this.iconList = vantIconData;
      // if(!localStorage.getItem('query_oprs')) this.loadQueryOprList();
      // 加载目标属性
      if (this.c_attributes && this.c_attributes.length == 4 && this.c_attributes[0] == "relation") this.isRelation = true;
      if (this.c_attributes) {
        if (this.isRelation) {
          let n1 = this.args.name ? this.c_attributes[1].filter(x => "relation_" + x.attributeName == this.args.name).length > 0 ? this.args.name : "-1" : '';
          let n2 = this.args.name ? this.c_attributes[2].filter(x => "left_" + x.attributeName == this.args.name).length > 0 ? this.args.name : "-1" : '';
          let n3 = this.args.name ? this.c_attributes[3].filter(x => "right_" + x.attributeName == this.args.name).length > 0 ? this.args.name : "-1" : '';
          if (n1 != '-1') {
            this.args_name = n1;
          } else if (n2 != '-1') {
            this.args_name = n2;
          } else if (n3 != '-1') {
            this.args_name = n3;
          } else {
            this.args_name = '-1';
          }
          this.c_attributes[1].forEach(x => this.attrMap['relation_' + x.attributeName] = x);
          this.c_attributes[2].forEach(x => this.attrMap['left_' + x.attributeName] = x);
          this.c_attributes[3].forEach(x => this.attrMap['right_' + x.attributeName] = x);
        } else {
          let n1 = this.args.name ? this.c_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1" : '';
          this.args_name = n1;
          this.c_attributes.forEach(x => this.attrMap[x.attributeName] = x);
        }
        this.initAttributes();
      }

      // 数据字典
      if ("labelAttr" in this.args) this.labelAttrCache = this.args.labelAttr;
      if ("valueAttr" in this.args) this.valueAttrCache = this.args.valueAttr;
      // 加载验证规则
      this.args_rule = this.rules.filter(x => x.value == this.args.rule).length > 0 ? this.args.rule : "-1";
      // 加载事件列表
      if (this.args.eventRange) this.args.eventRange.forEach(x => this.leftEvents.push(x));
      if (this.args.events) {
        // for (var i = this.args.events.length - 1; i >= 0; i--) {
        //   if (this.args.events[i].tmp || !this.args.events[i].name || !this.args.events[i].opr_path || !this.args.events[i].opr_type)
        //     this.args.events.splice(i, 1);
        // }
        // this.args.events.push({opr_path: '', opr_type: '', name: '', tmp: true});
        this.args.events.forEach(x => {
          if (x.tmp || !x.name || !x.opr_path || !x.opr_type){
          }else{
            let idx = this.leftEvents.findIndex(y => x.name == y);
            if (idx > -1) this.leftEvents.splice(idx, 1);
          }
        })
      }
      if (this.args.eventRange && this.args.eventRange.length !== 0) {
        let eventMap = this.args.events.map(item => item.name);
        for (let i = 0; i < this.args.eventRange.length; i++) {
          if (eventMap.findIndex(item => item === this.args.eventRange[i]) === -1) this.args.events.push({
            opr_path: '',
            opr_type: '',
            name: this.args.eventRange[i],
          })
        }
      }


      // 绑定目标类 获取全部实体类&关联类 优先从store获取
      // this.entitiesList = [];
      // this.relationsList = [];
      if('bindTargetClass' in this.args) {

        this.editSpin = true;
        this.entitiesList = [];
        this.relationsList = [];

        let allEn = this.Entities();
        let allRe = this.Relations();

        if(allEn && allEn.length > 0) {

          allEn.forEach((val) => {
            let eachItem = {
              value: val.className + "&e",
              label: val.displayName,
              id: val.id
            };
            this.entitiesList.push(eachItem);
          });

          this.editSpin = false;

        } else {
          this.getErrorIDBEn();
        }

        if(allRe && allRe.length > 0) {

          allRe.forEach((val) => {
            let eachItem = {
              value: val.className + "&r",
              label: val.displayName,
              id: val.id
            };
            this.relationsList.push(eachItem);
          });

          this.editSpin = false;

        } else {
          this.getErrorIDBRe();
        }

      }

      // if ('bindTargetClass' in this.args) {
        // console.log('获取IDB数据11111111')
        // // 实体类
        // var openRequest = window.indexedDB.open('entityDB', 1);
        // let enDB = null;
        // openRequest.onsuccess = function (e) {

        //   enDB = e.target.result;
        //   let transaction = enDB.transaction(['entity'], 'readwrite');
        //   let objectStore = transaction.objectStore('entity');
        //   objectStore.openCursor().onsuccess = function(event) {
        //     const cursor = event.target.result;
        //     if (cursor) {
        //       let val = cursor.value;
        //       let eachItem = {
        //         value: val.className + "&e",
        //         label: val.displayName,
        //         id: val.id
        //       };
        //       self.entitiesList.push(eachItem);
        //       cursor.continue();
        //     }
        //   }

        //   objectStore.openCursor().onerror = function(event) {

        //     console.log('IDB游标遍历失败');
        //     self.getErrorIDBEn();

        //   }

        // };

        // // IDB打开失败 api获取实体类数据
        // openRequest.onerror = function(e) {

        //   console.log('IDB打开失败');
        //   self.getErrorIDBEn();

        // }

        // // 关联类
        // var openReRequest = window.indexedDB.open('relationDB', 1);
        // let reDB = null;
        // openReRequest.onsuccess = function (e) {

        //   reDB = e.target.result;
        //   let transaction = reDB.transaction(['relation'], 'readwrite');
        //   let objectStore = transaction.objectStore('relation');
        //   objectStore.openCursor().onsuccess = function(event) {
        //     const cursor = event.target.result;
        //     if (cursor) {
        //       let val = cursor.value;
        //       let eachItem = {
        //         value: val.className + "&r",
        //         label: val.displayName,
        //         id: val.id
        //       };
        //       self.relationsList.push(eachItem);
        //       cursor.continue();
        //     }
        //   }

        //   objectStore.openCursor().onerror = function(event) {
        //     self.getErrorIDBRe();
        //   }

        // };

        // // IDB打开失败 api获取关联类数据
        // openReRequest.onerror = function(e) {

        //   console.log('IDB打开失败');
        //   self.getErrorIDBRe();

        // }


      // }
      if(this.args.bindTargetClass && this.args.bindTargetClass != '' && this.args.bindTargetClass != undefined) {
        this.handleBindTargetClassChange(this.args.bindTargetClass);
      } else {
        if((this.addin_name == 'CheckBox' || this.addin_name == 'RadioButton' || this.addin_name == 'SelectInput') && this.args.useDictionary) {
          this.firstLoad = false;
        }
      }

      if ('showBadge' in this.args) {
        this.initBadgeAttr()
      }
    },
    mounted() {
      try {
        this.widgetAnnotationCommit = this.widgetAnnotation[this.args.uuid];
      } catch (e) {
        console.log(`${e}初始化批注失败`)
      }
      this.classCategory = this.editExtendInfo && this.editExtendInfo.classCategory ? this.editExtendInfo.classCategory : '';
    },
    computed: {
      ...mapGetters("DWF_form", ["QueryResultAll", "Entities", "Relations"]),
      arg_name() {
        return this.args.name;
      },
      filter_refClassAttributes_sys: function () {
        return this.refClassAttributes_sys
        // return this.args.targetDataType == null || this.refClassAttributes_sys == null ? this.refClassAttributes_sys : (this.refClassAttributes_sys.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_sys.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_sys.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_def: function () {
        return this.refClassAttributes_def
        // return this.args.targetDataType == null || this.refClassAttributes_def == null ? this.refClassAttributes_def : (this.refClassAttributes_def.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_def.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_def.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_relationSys: function () {
        return this.refClassAttributes_relationSys
        // return this.args.targetDataType == null || this.refClassAttributes_relationSys == null ? this.refClassAttributes_relationSys : (this.refClassAttributes_relationSys.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_relationSys.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_relationSys.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_relationDef: function () {
        return this.refClassAttributes_relationDef
        // return this.args.targetDataType == null || this.refClassAttributes_relationDef == null ? this.refClassAttributes_relationDef : (this.refClassAttributes_relationDef.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_relationDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_relationDef.filter(attr => attr.valueType === "String")) : []);
      },
      filter_refClassAttributes_leftDef: function () {
        return this.refClassAttributes_leftDef
        // return this.args.targetDataType == null || this.refClassAttributes_leftDef == null ? this.refClassAttributes_leftDef : (this.refClassAttributes_leftDef.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_leftDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_leftDef.filter(attr => attr.valueType === "String")) : []);
      },
      filter_refClassAttributes_rightDef: function () {
        return  this.refClassAttributes_rightDef
        // return this.args.targetDataType == null || this.refClassAttributes_rightDef == null ? this.refClassAttributes_rightDef : (this.refClassAttributes_rightDef.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_rightDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_rightDef.filter(attr => attr.valueType === "String")) : []);
      },
      showPercentNumber() {
        return this.args.bgStyle == 'percentage' ? true : false;
      }
    },
    watch: {
      args: {
        immediate: true,
        handler(val) {
          this.$emit("change", val);
        }, deep: false
      },
      'args.labelAttr'(val) {
        if(val && val.length > 0) this.combineObjData();
      },

      'args.valueAttr'(val) {
        if(val && val.length > 0) this.combineObjData();
      },
      'args.useDictionary'(val) {
        if(val) {
          if(this.args.bindTargetClass && this.args.labelAttr.length > 0 && (this.queryData.targetClass || this.queryData.relationClass)) {
            this.combineObjData();
          } else {
            this.args.bindTargetClass = '';
            // this.$refs["selectGoal"].clearSingleSelect();
            if(this.addin_name == 'SelectInput') {
              this.args.selectList = []
            } else {
              this.args.list = [{label: "默认选项", value: "默认选项"}];
            }
          }
        }else{
          this.args.bindTargetClass = '';
          this.args.labelAttr = [];
          this.args.valueAttr = [];
        }
      },
      'args.filterQuery'(val) {
        // if(val && val != '') {
          if(this.addin_name == 'SelectInput' || this.addin_name == 'CheckBox' || this.addin_name == 'RadioButton') {
            this.queryData.query.query = val;
            this.combineObjData();
          }
        // }
      },
      args_name(val) {
        if (val != "-1") {
          this.args.name = val;
        }
        // }else{
        //   this.args.name = '';
        // }
      },
      arg_name(val, oldVal) {
        if (this.args_name == "-1" && this.args.label == oldVal) this.args.label = val;
      },
    },
    methods: {
      ...mapActions("DWF_form", ["handleQueryData"]),
      initAttributes() {
        this.c_attributes = _.cloneDeep(this.attributes);
        if (this.isRelation) {
          this.c_attributes_relationSys = this.c_attributes[1].filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
          this.c_attributes_relationDef = this.c_attributes[1].filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
          this.c_attributes_leftSys = this.c_attributes[2].filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          this.c_attributes_leftDef = this.c_attributes[2].filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
          this.c_attributes_rightSys = this.c_attributes[3].filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          this.c_attributes_rightDef = this.c_attributes[3].filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
        } else {
          this.c_attributes_sys = this.c_attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          this.c_attributes_def = this.c_attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
        }
        // 添加属性后，需要添加attrMap，检测当前数据类型，判断当前半星是否禁用
        this.$emit('setAttrMap')
      },

      resetAttribute(){
        this.refClassAttributes_sys = [];
        this.refClassAttributes_def = [];
        this.refClassAttributes_relationSys = [];
        this.refClassAttributes_relationDef = [];
        this.refClassAttributes_leftSys = [];
        this.refClassAttributes_leftDef = [];
        this.refClassAttributes_rightSys = [];
        this.refClassAttributes_rightDef = [];
      },

      changeBadgeType() {
        console.log('type', this.args.badge_type)
        this.args.badge_max = null
        this.args.badge_content = null
        this.args.badge_atrr=undefined
      },
      badgeBindAttr(val) {
        if (val && val != '') {
          this.args.badge_content = ''
        }

      },
      // tab切换
      async tabClick(name) {

        if(name == 'event') {
          this.editSpin = true;
          try {

            this.bindGlobalOpr = await getEntryOperations('Root');
            this.bindLocalOpr = await getEntryOperations(this.targetclass);
            this.showEventTab = true;
            this.editSpin = false;

          } catch (error) {
            this.showEventTab = true;
            this.editSpin = false;
            console.log(error);
          }

        }

      },

      // IDB连接打开失败 api拉取数据
      getErrorIDBEn() {

        this.entitiesList = [];

        let promiseE = new Promise((resolve, reject) => {
          getAllEntities({needOperationCount: false})
          .then(response => {
            let res = response.data;
            resolve(res);

            this.editSpin = false;
            if (!res.success) {
              const title = "提示";
              const content = "<p>服务器繁忙, 实体类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val, index, val_arr) => {
                let eachItem = {
                  value: val.className + "&e",
                  label: val.displayName,
                  id: val.id
                };
                this.entitiesList.push(eachItem);
              });

              if(this.args.bindTargetClass == '' && sessionStorage.getItem('targetClassType') == 'entity') {

                this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';

              }

            }
          })
          .catch(e => {
            console.log(e);
            this.editSpin = false;
            reject(e);
          });
        })

      },

      getErrorIDBRe() {

        this.relationsList = [];
        // 关联类
        let promiseRe = new Promise((resolve, reject) => {
          getAllRelations()
          .then(response => {
            let res = response.data;
            resolve(res);
            this.editSpin = false;

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
                  value: val.className + "&r",
                  label: val.displayName,
                  id: val.id
                };
                this.relationsList.push(eachItem);
              });

              if(this.args.bindTargetClass == '' && sessionStorage.getItem('targetClassType') == 'relation') {

                this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';

              }
            }
          })
          .catch(e => {
            console.log(e);
            this.editSpin = false;
            reject(e);
          });

        })

      },

      async combineObjData() {
        // 用于下拉框插件实际展示的对象数组，经过浏览字段与回填字段的格式转换
        await this.handleQueryData(this.queryData);
        this.objectList = this.QueryResultAll(this.queryData) || [];
        let returnFormat = Object.prototype.toString.call(this.args.valueAttr) === "[object Array]" ? this.args.valueAttr : [this.args.valueAttr];
        let list = this.objectList.map(object => {
          return {
            // label:下拉框回填显示项
            label: this.args.labelAttr.length !== 0 ?
              (this.args.labelAttr.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // value:点选器返回值
            value: returnFormat.length !== 0 ?
              (returnFormat.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid
          }
        }) || [];
        if(list) {
          // if(list.length > 100) {
            if(this.addin_name == 'SelectInput') {
              // this.args.selectList = list.splice(0, 100);
              if(this.args.selfOptions.length !== 0 && !this.args.useDictionary){

              }else{
                this.args.selectList = list;
              }
            } else {
              // this.args.list = list.splice(0, 100);
              this.args.list = list;
            }
          // } else {
          //   if(this.addin_name == 'SelectInput') {
          //     this.args.selectList = list;
          //   } else {
          //     this.args.list = list;
          //   }
          // }
        }
      },

      freshAttr(attr, attrName, displayName) {
        console.log('freshAttr', attr, attrName, displayName)
        if (this.dataTypes && this.dataTypes.length !== 0) {
        //   if (this.isRelation) {
        //     attr[1] = attr[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1);
        //     attr[2] = attr[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1);
        //     attr[3] = attr[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1);
        //   } else {
        //     attr = attr.filter(x => this.dataTypes.indexOf(x.valueType) > -1);
        //   }
        }
        // this.c_attributes = attr;
        this.$nextTick(() => {
          this.initAttributes();
          //新建属性是否在控件支持属性列表中
          let exist = false;
          if(!this.isRelation){
            exist = this.c_attributes_sys.find(attr => attr.attributeName === attrName) || this.c_attributes_def.find(attr => attr.attributeName === attrName)
          }else{
            exist = this.c_attributes_leftSys.find(attr => attr.attributeName === attrName) || this.c_attributes_leftDef.find(attr => attr.attributeName === attrName) ||
              this.c_attributes_rightSys.find(attr => attr.attributeName === attrName) || this.c_attributes_rightDef.find(attr => attr.attributeName === attrName) ||
              this.c_attributes_relationSys.find(attr => attr.attributeName === attrName) || this.c_attributes_relationDef.find(attr => attr.attributeName === attrName)
          }
          this.$nextTick(() => {
            if(exist){
              this.args_name = this.isRelation ? `relation_${attrName}` : attrName;
              this.$refs.nameSelectBox.setQuery(this.args_name);
              this.$refs.nameSelectBox.$el.querySelector('.ivu-select-input').click();
              this.args.label = displayName;
            }
          })
        });
        //单对象下拉框用的一个事件，用来返回最新的属性列表
        this.$emit('editBoxfreshAttr', attr)
      },
      setNowTime(value) {
        if (value == true) {
          this.args.defaultValue = new Date();
        } else {
          this.args.defaultValue = null;
        }
      },
      addAttr() {
        console.log("addAttr:", this.root);
        if (this.root) {
          this.root.addAttr(this);
        }
      },
      async loadQueryOprList() {

        let gOpr = [];
        let lOpr = [];

        try {
          this.bindGlobalOpr = await getEntryOperations('Root');
          gOpr = this.bindGlobalOpr.data.data.queryOprConfigs;
        } catch (error) {
          gOpr = [];
        }

        try {
          this.bindLocalOpr = await getEntryOperations(this.targetclass);
          lOpr = this.bindLocalOpr.data.data.queryOprConfigs;
        } catch (error) {
          lOpr = [];
        }

        this.query_oprs = gOpr.concat(lOpr);
        if(this.$refs.bindOperation_bar) {

          this.$refs.bindOperation_bar.forEach(bar => {
            try {
              bar.freshOpr(this.bindGlobalOpr, this.bindLocalOpr);
            } catch (error) {
              console.log(error)
            }
          })
        }
      },
      async handleChangeEventOfOperationBar(event, type = null) {
        if(!type){
          this.bindGlobalOpr = await getEntryOperations('Root');
          this.bindLocalOpr = await getEntryOperations(this.targetclass);
        }

        // this.loadQueryOprList();

        this.args.events[event.index].opr_path = event.conf.opr_path;
        this.args.events[event.index].opr_type = event.conf.opr_type;
        /**
        *@description增加系统操作时提示信息开关和后处理脚本，通过创建一个新uuid事件绑定到系统操作上
        *@params
        *@date 2021/1/5
        *@return
        */
        if(event.conf.opr_type === 'sys'){
          this.args.events[event.index].opr_showMessage = event.conf.opr_showMessage;
          this.args.events[event.index].opr_sys_path = event.conf.opr_sys_path ? event.conf.opr_sys_path : '';
        }
        this.$emit('handleChangeEventOfOperationBar', event)
        this.showEventTab = false;
        this.$nextTick(async () => {
          this.showEventTab = true;
        })
      },

      createEvent() {
        let idx = this.args.events.length;
        if (idx > 0 && this.args.events[idx - 1].tmp) {
          if (this.$Message) this.$Message.warning("请先完成当前事件的添加");
          return;
        }
        this.args.events.push({opr_path: '', opr_type: '', name: '', tmp: true});
      },

      confirmEvent(index) {
        if (this.args.events[index].name == '') {
          if (this.$Message) this.$Message.warning("请选择目标事件");
          return;
        }
        delete this.args.events[index].tmp;
        let idx = this.leftEvents.findIndex(x => x == this.args.events[index].name);
        if (idx > -1) this.leftEvents.splice(idx, 1);
      },

      cancelEvent(index) {
        let idx = this.leftEvents.findIndex(x => x == this.args.events[index].name);
        if (idx == -1) this.leftEvents.push(this.args.events[index].name);
        this.args.events.splice(index, 1);
      },

      switchOrigin(value) {
        this.args.back_picture = '';
      },

      // 选择背景图片来源
      chooseOrigin() {
        if (this.args.imgOrigin == 'imgBase') {
          this.$refs.img_modal.editModal(this.args.back_picture, '图片');
        }

      },

      changeBgStyle(value) {

        if (value == 'auto' || value == 'cover' || value == 'contain') {

          this.args.bgRepeat = 'no-repeat';
          this.args.bgSize = value;

        } else if (value.indexOf('repeat') != -1) {

          this.args.bgSize = 'auto';
          this.args.bgRepeat = value;

        } else if (value == 'percentage') {

          this.args.bgRepeat = 'repeat';
          this.args.bgPercent = 100;
          this.args.bgSize = '100%';

        } else {
          console.log(value)
        }

      },
      // 选择背景图片
      getImgUrl(data, index) {

        if (data == null) {
          this.args.back_picture = '';
        } else {

          this.args.back_picture = data.oid;
        }

        this.args.picActIndex = index;

      },
      changeBgPercent(e) {

        this.args.bgSize = `${e.target.value}%`;

      },
      inputQuery() {
        if (this.args.bindTargetClass) {

          if(this.args.bindTargetClass.split('&')[1] == 'e') {

            let finClass = this.isExEn === true ? 'ex_en' : 'en';
            this.$refs.filterQuery_modal.initModal(this.args.filterQuery, this.args.bindTargetClass.split('&')[0], '', false, finClass);
          } else {
            this.$refs.filterQuery_modal.initModal(this.args.filterQuery, this.args.bindTargetClass.split('&')[0], '', false, 're');
          }

        } else {
          this.$refs.filterQuery_modal.initModal(this.args.filterQuery, '');
        }
        // if(this.args.filterQuery != '') {
        // }
      },
      encodeQuery() {
          if(!this.isRelation) {
            let finClass = this.isExEn === true ? 'ex_en' : 'en';
            this.$refs.filterQuery_modal.initModal(this.args.encodePrefix, this.targetclass, '', false, finClass);
          } else {
            this.$refs.filterQuery_modal.initModal(this.args.encodePrefix, this.targetclass, '', false, 're');
          }
      },

      changeDateFormat(e) {
        if(e == 'yyyy') {
          this.args.defaultDateType = 'year';
        } else if(e == 'yyyy-MM') {
          this.args.defaultDateType = 'month';
        } else if(e == 'yyyy-MM-dd') {
          this.args.defaultDateType = 'date';
        } else {
          this.args.defaultDateType = 'datetime';
        }
      },
      defaultValueChange(value, type) {
        switch (type) {
          case 'date':
            if (value && this.args.name && this.args.isMobile != true) {
              setTimeout(() => {
                this.args.defaultValue = value;
              }, 10)
            }
            break;
          case 'number':
            if (value && this.args.name) {
              if (this.attrMap[this.args.name].valueType !== 'Double') {
                let parseValue = parseInt(value);
                setTimeout(() => {
                  this.args.defaultValue = parseValue;
                }, 10)
              }
            }
            break;
          default:
            break;
        }
      },
      //生成过滤条件
      getFilterQuery(finallyFilterQuery) {
        this.args.filterQuery = finallyFilterQuery;
      },
      //生成编码前缀
      getEncodePrefix(finallyFilterQuery) {
        this.args.encodePrefix = finallyFilterQuery;
        this.$emit('exportCode')
      },

      async handleBindTargetClassChange(val) {
        this.bindTargetClass = val;
        console.log(val)
        this.$emit('handleBindTargetClassChange', val);
        if(!val || val == undefined) return;
        let type = val.split('&')[1];
        val = val.split('&')[0];
        console.log(val)

        if(type == 'r') {
          let isRealRe = this.relationsList.findIndex(r => { return r.className == val });
          if(isRealRe == -1) {
            type = 'e';
          }
        }
        if(val && val != undefined) {

          if(type == 'e') {

            getEntity(val).then(res => {

              this.isExEn = res.data.classCategory == 'ItemClass' ? false : true;

              if((this.addin_name == 'CheckBox' || this.addin_name == 'RadioButton' || this.addin_name == 'SelectInput') && this.args.useDictionary) {

                this.resetAttribute();
                this.refClassAttributes = res.data.attributes;
                this.refClassAttributes_sys = this.refClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                this.refClassAttributes_def = this.refClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                if(!this.firstLoad) {
                  this.$refs["labelAttrSelect"].clearSingleSelect();
                  this.$refs["valueAttrSelect"].clearSingleSelect();
                  this.args.labelAttr = [];
                  if(this.args.noNumber) {
                    this.arg.valueAttr = [];
                  } else {
                    this.arg.valueAttr = '';
                  }
                  this.firstLoad = false;

                } else {
                  this.firstLoad = false;
                }

              }

            }).catch(error => {
              this.$Message.error(error.response.data.message);
            });

          }

        }
        console.log(type)

        if(this.addin_name == 'CheckBox' || this.addin_name == 'RadioButton' || this.addin_name == 'SelectInput') {

          if(type == 'r'){
            let temReAttr = [];
            let temLAttr = [];
            let temRAttr = [];
            this.spinShow = true;
            this.resetAttribute();
            let response = await getRelation(val);
            console.log(response)
            // getRelation(val).then(response => {
              if(response.success) {
                let res = response.data;
                this.refClassAttributes_relationSys = res.attributes.filter(item => SYS_RELATION_ATTRIBUTES(item.attributeName) !== -1);
                this.refClassAttributes_relationDef = res.attributes.filter(item => SYS_RELATION_ATTRIBUTES(item.attributeName) === -1);
                temReAttr = res.attributes.map(val => {
                  val.attributeName = `relation_${val.attributeName}`;
                  val.displayName = `relation_${val.displayName}`;
                  return val
                });
                // if ('leftClass' in res) {
                  let mes = await getEntity(res.leftClass);
                  // await getEntity(res.leftClass).then(mes => {
                    if (mes.success) {
                      let resL = mes.data;
                      this.refClassAttributes_leftSys = resL.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item.attributeName) !== -1);
                      this.refClassAttributes_leftDef = resL.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item.attributeName) === -1);
                      temLAttr = resL.attributes.map(val => {
                        val.attributeName = `left_${val.attributeName}`;
                        val.displayName = `left_${val.displayName}`;
                        return val
                      });
                    }else {
                      this.spinShow = false;
                    }
                  // }).catch(error => {
                  //   this.$Message.error(error.response.data.message);
                  // });
                // }
                // 判断左右关联实体类不是同一个类
                // if('rightClass' in res) {
                  let rmes = await getEntity(res.rightClass);
                  // await getEntity(res.rightClass).then(mes => {
                    if(rmes.success) {
                      let resR = rmes.data;
                      this.refClassAttributes_rightSys = resR.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item.attributeName) !== -1);
                      this.refClassAttributes_rightDef = resR.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item.attributeName) === -1);
                      temRAttr = resR.attributes.map(val => {
                        val.attributeName = `right_${val.attributeName}`;
                        val.displayName = `right_${val.displayName}`;
                        return val
                      });
                    }else {
                      this.spinShow = false;
                    }
                  // });
                  this.reloadSelect = false;
                  setTimeout(() => {
                    this.refClassAttributes = temReAttr.concat(temLAttr, temRAttr);
                    this.reloadSelect = true;
                    this.spinShow = false;
                    if(!this.firstLoad) {

                      this.$refs["labelAttrSelect"].clearSingleSelect();
                      this.$refs["valueAttrSelect"].clearSingleSelect();
                      this.args.labelAttr = [];
                      if(this.args.noNumber) {
                        this.arg.valueAttr = [];
                      } else {
                        this.args.valueAttr = '';
                      }
                      this.firstLoad = false;

                    } else {

                      this.$nextTick(() => {

                        this.args.labelAttr = this.labelAttrCache;
                        this.args.valueAttr = this.valueAttrCache;

                      })

                    }
                  }, 500)
                // }
              }else {
                this.spinShow = false;
              }
            // })
            this.queryData.relationClass = val;
            this.queryData.query.type = "relation";

          }else{
            this.queryData.targetClass = val;
            delete this.queryData.relationClass;
            delete this.queryData.leftClass;
            delete this.queryData.rightClass;
            delete this.queryData.query.type;
          }
          this.queryData.query.query = this.args.filterQuery;
          this.combineObjData();
        }
      },

      clearBindTargetClass(val) {
        this.bindTargetClass = val;
        this.$emit('clearBindTargetClass', val);
        if(this.addin_name == 'CheckBox' || this.addin_name == 'RadioButton' || this.addin_name == 'SelectInput') {
          this.$refs["labelAttrSelect"].clearSingleSelect();
          this.$refs["valueAttrSelect"].clearSingleSelect();
          this.args.labelAttr = [];
          if(this.args.noNumber) {
            this.args.valueAttr = [];
          } else {
            this.args.valueAttr = '';
          }
          this.args.filterQuery = '';
        }
        let clearFilterQuery = ['DynamicDigitalLabel', 'Grid', 'MultiObjectsTag', 'FormEngine', 'MultiObjPicture', 'PieChart', 'EchartBar', 'GaugeChart', 'ScatterChart', 'DynamicMap', 'MapChart','Table']
        if(clearFilterQuery.includes(this.addinName)){
          this.args.filterQuery = '';
        }
      },

      widgetAnnotationChange(val) {
        this.widgetAnnotation[this.args.uuid] = this.widgetAnnotationCommit;
      },
      initBadgeAttr() {
        if(!this.attributes) return
        let b_attr = _.cloneDeep(this.attributes);
        console.log(this.isRelation)

        if (this.isRelation) {
            let reTypeAttr = b_attr[1];
            let numReTypeAttr = reTypeAttr.filter(item => {
              return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
            })

            let reTypeLAttr = b_attr[2]
            let numLTypeAttr = reTypeLAttr.filter(item => {
              return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
            })
            let reTypeRAttr = b_attr[3]
            let numRTypeAttr = reTypeRAttr.filter(item => {
              return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
            })

            let boolReTypeAttr = reTypeAttr.filter(item => {
              return item.valueType == 'Boolean'
            })
            let boolLTypeAttr = reTypeLAttr.filter(item => {
              return item.valueType == 'Boolean'
            })
            let boolRTypeAttr = reTypeRAttr.filter(item => {
              return item.valueType == 'Boolean'
            })

            let groupReItem = {
              groupName: '关联类',
              groupType: 'relation_',
              attrList: reTypeAttr
            }
            let groupNumReItem = {
              groupName: '关联类',
              groupType: 'relation_',
              attrList: numReTypeAttr
            }
            let groupBoolReItem = {
              groupName: '关联类',
              groupType: 'relation_',
              attrList: boolReTypeAttr
            }
            let groupLItem = {
              groupName: '左实体类',
              groupType: 'left_',
              attrList: reTypeLAttr
            }
            let groupNumLItem = {
              groupName: '左实体类',
              groupType: 'left_',
              attrList: numLTypeAttr
            }
            let groupBoolLItem = {
              groupName: '左实体类',
              groupType: 'left_',
              attrList: boolLTypeAttr
            }
            let groupRItem = {
              groupName: '右实体类',
              groupType: 'right_',
              attrList: reTypeRAttr
            }
            let groupNumRItem = {
              groupName: '右实体类',
              groupType: 'right_',
              attrList: numRTypeAttr
            }
            let groupBoolRItem = {
              groupName: '右实体类',
              groupType: 'right_',
              attrList: boolRTypeAttr
            }

            let sysReAttr = {
              groupName: '关联类系统属性',
              groupType: 'relation_',
              attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1)
            };
            let selfReAttr = {
              groupName: '关联类类属性',
              groupType: 'relation_',
              attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1)
            };

            this.badgeAttrList.push(sysReAttr, selfReAttr, groupLItem, groupRItem);
            this.badgeNumberTypeList.push(groupNumReItem, groupNumLItem, groupNumRItem);
            this.badgeBooleanTypeList.push(groupBoolReItem, groupBoolLItem, groupBoolRItem);

        } else {
          let numTypeAttr = b_attr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })
          let boolTypeAttr = b_attr.filter(item => {
            return item.valueType == 'Boolean'
          })

          let groupNumItem = {
            groupName: '类属性',
            groupType: '',
            attrList: numTypeAttr
          }

          let sysAttr = {
            groupName: '系统属性',
            groupType: '',
            attrList: b_attr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1)
          };
          let selfAttr = {
            groupName: '类属性',
            groupType: '',
            attrList: b_attr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1)
          };

          this.badgeAttrList.push(sysAttr, selfAttr);
          this.badgeNumberTypeList.push(groupNumItem);
          this.badgeBooleanTypeList.push({
            groupName: '类属性',
            groupType: '',
            attrList: boolTypeAttr
          })
        }
        console.log(this.badgeAttrList, this.badgeNumberTypeList)
      },
      closeBadge() {
        if (this.args.showBadge == false) {
          this.args.badge_type = 'dot'
          this.args.badge_max = null
          this.args.badge_content = null
          this.args.badge_atrr = null
        }
      },

      goTab(tab) {
        this.property = tab;
      }
    }
  }
</script>

<style>
  .margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
    font-size: 12px;
  }

  .ivu-collapse-content > .ivu-collapse-content-box {
    padding-top: 0px;
    padding-bottom: 0px;
  }

  .editbox-name .ivu-select-dropdown,
  .editbox-targetClass .ivu-select-dropdown {
    width: 100%!important;
  }

  .editbox-targetClass .ivu-select-dropdown {
    width: 100%!important;
  }

  .editBox .ivu-tabs.ivu-tabs-mini {
    overflow: visible;
  }

  .editBox .ivu-tabs-tab {
    color: #515a6e !important;
  }

  .editBox .ivu-tabs-nav .ivu-tabs-tab-active {
    color: #2d8cf0 !important;
  }

  .editBox .margin1 .ivu-collapse-header {
    font-size: 12px;
  }

  .editBox * {
    font-size: 12px !important;
  }

  .labelWidthUnit .ivu-select-selection{
    background: inherit;
    border-radius: 0px 4px 4px 0;
  }

  .labelWidthUnit .ivu-select-selection{
    border-left: none;
  }

  .labelWidthUnit .ivu-select-selection:hover{
    border-color: #dcdee2;
  }
  .labelWidthUnit .ivu-select-selection.ivu-select-selection-focused{
    border-color: #dcdee2;
    box-shadow: none;
  }
  .labelWidthUnit.ivu-select-visible .ivu-select-selection{
    border-color: #dcdee2;
    box-shadow: none;
  }
  /*.labelWidthUnit.ivu-select-visible .ivu-select-selection {*/
  /*  border-color: none;*/
  /*}*/
</style>
