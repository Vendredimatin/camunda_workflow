<template>
  <!--  单对象控件  -->
  <Operation
    v-if="name === 'Operation'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Operation>
  <TextInput
    v-else-if="name === 'TextInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </TextInput>
  <EncodeInput
    v-else-if="name === 'EncodeInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </EncodeInput>
  <NumberInput
    v-else-if="name === 'NumberInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </NumberInput>
  <DateInput
    v-else-if="name === 'DateInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DateInput>
  <CheckBox
    v-else-if="name === 'CheckBox'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </CheckBox>
  <RadioButton
    v-else-if="name === 'RadioButton'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </RadioButton>
  <Label
    v-else-if="name === 'Label'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Label>
  <CompoundLabel
    v-else-if="name === 'CompoundLabel'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </CompoundLabel>
  <SwitchComponent
    v-else-if="name === 'Switch'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SwitchComponent>
  <HyperLink
    v-else-if="name === 'HyperLink'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </HyperLink>
  <SelectInput
    v-else-if="name === 'SelectInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SelectInput>
  <Iframe
    v-else-if="name === 'Iframe'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Iframe>
  <SingleObjectSelector
    v-else-if="name === 'SingleObjectSelector'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SingleObjectSelector>
  <SingleObjectModal
    v-else-if="name === 'SingleObjectModal'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SingleObjectModal>
  <MultiObjectsTag
    v-else-if="name === 'MultiObjectsTag'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </MultiObjectsTag>
  <Attachments
    v-else-if="name === 'Attachments'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Attachments>
  <ProgressBar
    v-else-if="name === 'ProgressBar'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </ProgressBar>
  <D_Rate
    v-else-if="name === 'D_Rate'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </D_Rate>
  <Liked
    v-else-if="name === 'Liked'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Liked>
  <IconComponent
    v-else-if="name === 'icon'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </IconComponent>
  <DynamicDigitalLabel
    v-else-if="name === 'DynamicDigitalLabel'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DynamicDigitalLabel>
  <RichTextEditor
    v-else-if="name === 'RichTextEditor'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </RichTextEditor>
  <DynamicParameterFrame
    v-else-if="name === 'DynamicParameterFrame'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DynamicParameterFrame>
  <MultiFilesList
    v-else-if="name === 'MultiFilesList'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </MultiFilesList>

  <!--  多对象控件  -->
  <Grid
    v-else-if="name === 'Grid'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @mousedown.native="onDragStart"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Grid>
  <SimpleTable
    v-else-if="name === 'SimpleTable'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID}"
    @click.native.stop="activeAddin"
    @mousedown.native="onDragStart"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SimpleTable>
  <WatchMessage
    v-else-if="name === 'WatchMessage'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </WatchMessage>
  <SearchBox
    v-else-if="name === 'SearchBox'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SearchBox>
  <FormEngine
    v-else-if="name === 'FormEngine'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </FormEngine>
  <JoinCascaderTree
    v-else-if="name === 'JoinCascaderTree'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </JoinCascaderTree>
  <RelationTree
    v-else-if="name === 'RelationTree'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </RelationTree>
  <SelfJoinsTree
    v-else-if="name === 'SelfJoinsTree'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SelfJoinsTree>
  <MultiObjPicture
    v-else-if="name === 'MultiObjPicture'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </MultiObjPicture>
  <SelfCode
    v-else-if="name === 'SelfCode'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SelfCode>

  <!--  时间序列控件  -->
  <TimeSeriesSelect
    v-else-if="name === 'TimeSeriesSelect'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </TimeSeriesSelect>
  <TimeSeriesCharts
    v-else-if="name === 'TimeSeriesCharts'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </TimeSeriesCharts>
  <TimeSeriesBoard
    v-else-if="name === 'TimeSeriesBoard'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </TimeSeriesBoard>

  <!--  模型点选控件  -->
  <OrgUserSelect
    v-else-if="name === 'OrgUserSelect'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </OrgUserSelect>
  <EntitiesAttrSelect
    v-else-if="name === 'EntitiesAttrSelect'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </EntitiesAttrSelect>
  <FormSelect
    v-else-if="name === 'FormSelect'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </FormSelect>

  <!--  可视化控件  -->
  <EchartBar
    v-else-if="name === 'EchartBar'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </EchartBar>
  <ScatterChart
    v-else-if="name === 'ScatterChart'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </ScatterChart>
  <PieChart
    v-else-if="name === 'PieChart'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </PieChart>
  <MapChart
    v-else-if="name === 'MapChart'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </MapChart>
  <GaugeChart
    v-else-if="name === 'GaugeChart'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </GaugeChart>
  <DynamicMap
    v-else-if="name === 'DynamicMap'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DynamicMap>
  <EChart
    v-else-if="name === 'EChart'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </EChart>

  <!--  布局控件  -->
  <Row
    v-else-if="name === 'row'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @showEditBox="showEditBox"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Row>
  <ColRows
    v-else-if="name === 'colRows'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @showEditBox="showEditBox"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </ColRows>
  <Col
    v-else-if="name === 'col'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Col>
  <Tab
    v-else-if="name === 'Tab'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Tab>
  <GroupBox
    v-else-if="name === 'GroupBox'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </GroupBox>
  <DragLayout
    v-else-if="name === 'DragLayout'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout"
    :class="{'active': uuid === activeUUID && activate, 'vue-draggable-addin': this.addin.self.properties.layoutDraggable}"
    @click.native.stop="activeAddin"
    @mousedown.native="onDragStart"
    @showEditBox="showEditBox"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @activeAddinFormLayout="activeAddinFormLayout"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DragLayout>
  <DragItem
    v-else-if="name === 'DragItem'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @mousedown.native="onDragStart"
    @showEditBox="showEditBox"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @activeAddinFormLayout="activeAddinFormLayout"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
    @LayoutItemConfigChange="LayoutItemConfigChange"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :classProps="'vue-drag-item'"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DragItem>
  <!-- sdk控件 -->
  <AssembleAddin
    v-else-if="name === 'AssembleAddin'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </AssembleAddin>
</template>

<script>
//DWFENGINEVERSION1.0
import Operation from './Operation';
import TextInput from './TextInput';
import EncodeInput from './EncodeInput';
import NumberInput from './NumberInput';
import DateInput from './DateInput';
import CheckBox from './CheckBox';
import RadioButton from './RadioButton';
import Label from './Label';
import CompoundLabel from './CompoundLabel';
import SwitchComponent from './Switch';
import HyperLink from './HyperLink';
import SelectInput from './SelectInput';
import Iframe from './Iframe';
import SingleObjectSelector from './SingleObjectSelector';
import SingleObjectModal from './SingleObjectModal';
import MultiObjectsTag from './MultiObjectsTag';
import Attachments from './Attachments';
import ProgressBar from './ProgressBar';
import D_Rate from './D_Rate';
import Liked from './Liked';
import IconComponent from './icon';
import DynamicDigitalLabel from './DynamicDigitalLabel';
import RichTextEditor from './RichTextEditor';
import DynamicParameterFrame from './DynamicParameterFrame';
import MultiFilesList from './MultiFilesList';
import Grid from "./Grid";
import SimpleTable from "./SimpleTable"
import WatchMessage from "./WatchMessage";
import SearchBox from "./SearchBox";
import FormEngine from "./FormEngine";
import JoinCascaderTree from "./JoinCascaderTree";
import RelationTree from "./RelationTree";
import SelfJoinsTree from "./SelfJoinsTree";
import MultiObjPicture from "./MultiObjPicture";
import SelfCode from "./SelfCode";
import TimeSeriesSelect from "./TimeSeriesSelect";
import TimeSeriesCharts from "./TimeSeriesCharts";
import TimeSeriesBoard from "./TimeSeriesBoard";
import OrgUserSelect from "./OrgUserSelect";
import EntitiesAttrSelect from "./EntitiesAttrSelect";
import FormSelect from "./FormSelect";
import EchartBar from "./EchartBar";
import ScatterChart from "./_ScatterChart";
import PieChart from "./_PieChart";
import MapChart from "./_MapChart";
import GaugeChart from "./_GaugeChart";
import DynamicMap from "./DynamicMap";
import EChart from "./EChart";
import Row from "./row";
import ColRows from "./colRows";
import Col from "./col";
import Tab from "./Tab";
import GroupBox from "./GroupBox";
import DragLayout from "./DragLayout";
import DragItem from "./DragItem";
import AssembleAddin from "./AssembleAddin";
import FormAddinWidget from "../../component/FormAddinWidget";
import _ from "lodash";
import {uuid} from "@/util/assist";

const visualCharts = [
  "addin_EchartBar",
  "addin_EChart",
  "addin_BarChart",
  "addin_LineChart",
  "addin_ScatterChart",
  "addin_PieChart",
  "addin_MapChart",
  "addin_MapCityChart",
  "addin_ParallelChart",
  "addin_CalendarChart",
  "addin_GaugeChart",
  "addin_CheckBox",
  "addin_RadioButton",
];
const timeseries = [
  "addin_TimeSeriesCharts",
  "addin_TimeSeriesBoard"
];
export default {
  name: "FormAddinList",
  data() {
    return {
      name: '',
      args: {},
      uuid: '',
      activate: true,
      DWFADDINARGSVERSION: null,
      // propsData: {},
    }
  },
  props: [
    'addin',
    'basicArgs',
    'activeUUID',
    'store',
    'itemValue',
    'attributes',
    'relation',
    'editExtendInfo',
    'widgetAnnotation',
    'checkResult',
    'query_oprs',
    'route',
    'router',
    'root',
    'Message',
    'echarts',
    'formCanvas',
    'dwf_ctx',
    'formEngine'
  ],
  created() {
    this.name = this.addin.self.elementType.replace("addin_", "");
    this.uuid = this.addin.self.uuid;
    this.DWFADDINARGSVERSION = this.addin.self.DWFADDINARGSVERSION;
    this.addin.self.properties.uuid = this.uuid;
  },
  provide() {
    return {
      setBasicArgs: this.setBasicArgs
    }
  },
  inject: [
    'ReloadAddin',
    'GenerateID'
  ],
  components: {
    FormAddinWidget,
    DragItem,
    DragLayout,
    GroupBox,
    Tab,
    EChart,
    DynamicMap,
    GaugeChart,
    MapChart,
    PieChart,
    ScatterChart,
    EchartBar,
    FormSelect,
    EntitiesAttrSelect,
    OrgUserSelect,
    TimeSeriesBoard,
    TimeSeriesCharts,
    TimeSeriesSelect,
    SelfCode,
    MultiObjPicture,
    SelfJoinsTree,
    RelationTree,
    JoinCascaderTree,
    FormEngine,
    SearchBox,
    WatchMessage,
    Grid,
    SimpleTable,
    Label,
    RadioButton,
    NumberInput,
    Operation,
    TextInput,
    DateInput,
    CheckBox,
    CompoundLabel,
    SwitchComponent,
    HyperLink,
    SelectInput,
    Iframe,
    SingleObjectSelector,
    SingleObjectModal,
    MultiObjectsTag,
    Attachments,
    ProgressBar,
    D_Rate,
    Liked,
    IconComponent,
    DynamicDigitalLabel,
    RichTextEditor,
    DynamicParameterFrame,
    MultiFilesList,
    Row,
    ColRows,
    Col,
    AssembleAddin,
    EncodeInput
  },
  mounted() {
    this.addin.self.properties = this.getArgs();
    this.addin.obj = this.$refs.addinComponent;
    this.formCanvas.jsonUUID[this.uuid] = this.addin;

    try {
      if (this.addin.obj && this.addin.self && this.addin.self.properties && this.addin.self.elementType != 'addin_col') {
        this.addin.obj.$el.style.marginTop = this.addin.self.properties.row_space + 'px';
        this.addin.obj.$el.style.marginBottom = this.addin.self.properties.row_space + 'px';
        this.addin.obj.$el.style.marginLeft = this.addin.self.properties.col_space + 'px';
        this.addin.obj.$el.style.marginRight = this.addin.self.properties.col_space + 'px';
      }
    } catch (e) {
      console.log(e)
    }
  },
  watch: {
    activeUUID(val){
      if(this.formEngine && val){
        this.activate = false;
      }
    }
  },
  computed: {
    widgetAnnotationComment() {
      return !!this.propsData.widgetAnnotation[this.uuid];
    },

    propsData() {
      return {
        addin: this.addin,
        basicArgs: this.basicArgs,
        activeUUID: this.activeUUID,
        argsProps: this.addin.self.properties,
        store: this.store,
        itemValue: this.itemValue,
        attributes: this.attributes,
        relation: this.relation,
        editExtendInfo: this.editExtendInfo,
        widgetAnnotation: this.widgetAnnotation,
        checkResult: this.checkResult,
        query_oprs: this.query_oprs,
        route: this.route,
        router: this.router,
        root: this.root,
        Message: this.Message,
        echarts: this.echarts,
        formCanvas: this.formCanvas,
        dwf_ctx: this.dwf_ctx,
      }
    }
  },

  methods: {
    /**
     *@description获取控件args
     *@params
     *@date 2020/8/25
     *@return
     */
    getArgs() {
      return this.$refs.addinComponent.getArgs();
    },

    /**
     *@description设置控件args
     *@params
     *@date 2020/8/25
     *@return
     */
    setArgs(args) {
      return this.$refs.addinComponent.setArgs(args);
    },

    /**
     *@description用于初次拖入控件使用basicArgs
     *@params
     *@date 2020/9/7
     *@return
     */
    setBasicArgs(args) {
      args = {
        ...args,
        ...this.addin.self.properties,
      }
      // 判断是否为新拖入的控件,生成id并继承表单设置
      if (!this.addin.self.properties.id) {
        for (var i in this.basicArgs) {
          if (i in args) {
            args[i] = this.basicArgs[i] !== undefined ? this.basicArgs[i] : args[i];
          }
          switch (this.DWFADDINARGSVERSION) {
            case 1:
              //增加标签控件px功能
              if ('label_width' in args && (i === 'labelWidthUnit' || i === 'label_widthByPx')) {
                args[i] = this.basicArgs[i] !== undefined ? this.basicArgs[i] : args[i];
              }
              break;
            default:
              break;
          }
        }
        if (this.name === 'AssembleAddin') {
          args.id = this.GenerateID(this.addin.self.properties._ASSEMBLECONFIG.name);
        } else {
          args.id = this.GenerateID(this.name);
        }
      }else{
        //旧控件兼容处理
        switch (this.DWFADDINARGSVERSION) {
          case 1:
            break;
          default:
            'label_width' in args && !('labelWidthUnit' in args) ? (args['labelWidthUnit'] = '%', args['label_widthByPx'] = 200) : '';
            break;
        }
      }
      return args;
    },

    /**
     *@description激活控件
     *@params
     *@date 2020/8/25
     *@return
     */
    activeAddin(type = null, addin = this.$refs.addinComponent, uuid = this.uuid) {
      if (this.name === 'row') {
        this.$refs.addinComponent.initSplit();
      }
      if (this.name === 'row' && type !== 'col') {
        this.$refs.addinComponent.activeCol = '';
      }
      if (this.name === 'colRows' && type !== 'row') {
        this.$refs.addinComponent.activeRow = '';
      }
      if (this.name === 'FormEngine' && this.addin.self.properties.componentOid) {
        let group = null;
        this.editExtendInfo.componentGroup.forEach(componentGroup => {
          if (!group && componentGroup.children.length !== 0) {
            group = componentGroup.children.find(component => component.oid === this.addin.self.properties.componentOid);
          }
        })
        if (group) {
          this.setArgs({
            viewName: group.viewName,
            groupDisplayName: group.groupDisplayName,
            groupOid: group.groupOid,
            componentOid: group.oid,
            componentDisplayName: group.displayName,
          })
        }
      }
      this.$refs.addinComponent.t_edit = false;
      let containerFormEngine = uuid;

      //增加对圆角列内元素不隐藏的功能
      try {
        document.querySelectorAll("[addinname='col'][addin='layout'].hidden").forEach(col => {
          col.childNodes[0].style.overflow = 'hidden'
        });
        let _this = this;
        setTimeout(() => {
          let parN = _this.$refs.addinComponent.$el.parentNode;
          while (parN && parN.getAttribute){
            if(parN.getAttribute('addinname') === 'col' && parN.getAttribute('addin') === 'layout'){
              parN.querySelector('.ivu-col').style.overflow = 'visible';
            }
            parN = parN.parentNode;
          }
        }, 0)
      }catch (e){
        console.log(`col-overflow-error${e}`)
      }
      //卡片嵌套获取顶层卡片
      try {
        let parN = this.$refs.addinComponent.$el.parentNode;
        while (parN && parN.getAttribute){
          if(parN.getAttribute('addinname') === 'FormEngine' && parN.getAttribute('formEngineUUID')){
            containerFormEngine = parN.getAttribute('formEngineUUID');
          }
          parN = parN.parentNode;
        }
      }catch (e){
        console.log(`form-engine-error${e}`)
      }
      if(containerFormEngine !== uuid){
        this.$emit('activeAddin');
      }else if (uuid === this.uuid) {
        this.resizeAddin(this.itemValue.data);
        this.formCanvas.activeAddin(null, addin, uuid);
        this.$refs.addinComponent.actEdit = true;
      } else {
        this.$emit('activeAddin', null, addin, uuid);
      }
    },
    /**
     *@descriptionresize视图控件
     *@params
     *@date 2020/9/15
     *@return
     */
    resizeAddin(addin) {
      if (addin.self) {
        if ((visualCharts.indexOf(addin.self.elementType) >= 0) && addin.obj && addin.obj.resizeChart) {
          addin.obj.resizeChart();
        }
        if ((timeseries.indexOf(addin.self.elementType) >= 0) && addin.obj && addin.obj.resizeChart) {
          addin.obj.resizeChart();
        }
      }
      if (addin.elements && addin.elements.length) {
        addin.elements.forEach(element => {
          this.resizeAddin(element)
        });
      }
    },
    /**
     *@description激活控件from布局控件
     *@params
     *@date 2020/8/25
     *@return
     */
    activeAddinFormLayout(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },
    /**
     *@description通过修改jsonData从布局控件移除子控件
     *@params deleteButton：是否是点击删除按钮的删除
     *@date 2020/8/31
     *@return
     */
    removeAddin(uuid, parentUUID, deleteButton = false) {
      // this.formCanvas.removeAddin(uuid, parentUUID)
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },
    /**
     *@description删除复制控件
     *@params
     *@date 2020/8/25
     *@return
     */
    copyAddin(addin = this.ReloadAddin(this.addin), parentUUID) {
      // this.formCanvas.removeAddin(addin, parentUUID)
      this.$emit('copyAddin', addin, parentUUID);
    },

    deleteAddin() {
      // if (this.name == 'DragItem') {
      //   return this.$refs.addinComponent.deleteItem()
      // } else {
      //   this.removeAddin(this.uuid)
      // }
      this.removeAddin(this.uuid, undefined, true);
    },

    commentAddin(addin = this.$refs.addinComponent) {
      this.formCanvas.commentAddin(addin)
      // this.$emit('commentAddin', addin);
    },

    /**
     *@description行列中显示内部editbox使用
     *@params:type:'col','row'
     *@params:addin
     *@date 2020/9/1
     *@return
     */
    showEditBox(type, addin) {
      this.formCanvas.showEditBox(type, addin)
      // this.$emit('showEditBox', type, addin);
    },

    /**
     *@description多列多行内部拖拽使用
     *@params
     *@date 2020/9/7
     *@return
     */
    layoutSelfDrag() {
      this.formCanvas.layoutSelfDrag();
      // this.$emit('layoutSelfDrag')
    },

    /**
     *@description拖拽块args配置事件
     *@params
     *@date 2020/9/15
     *@return
     */
    LayoutItemConfigChange(args) {
      this.$emit('LayoutItemConfigChange', args);
    },
    /**
     *@description记录json历史
     *@params
     *@date 2020/9/8
     *@return
     */
    snapShotHistory() {
      this.formCanvas.snapShotHistory();
      // this.$emit('snapShotHistory');
    },

    onDragStart(e) {
      if (this.name === 'Grid' && !this.addin.self.properties.draggable) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      //冻结拖拽池情况下
      if (this.name === 'DragLayout' && !this.addin.self.properties.layoutDraggable && e.target.className === 'vue-grid-layout') {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      //冻结拖拽池情况下
      if (this.name === 'DragItem' && this.addin.self.properties.static && e.target.className.indexOf('vue-drag-item') !== -1) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    }
  }
}
</script>

<style scoped>
.addin {
  position: relative;
  padding: 5px !important;
}

.addin.active {
  border: 0 solid #2d8cf0;
  background: #abd1f9;
}

.addin.active:hover {
  background: #abd1f9;
}

.addin:hover {
  background: #ddecfc;
}

.addin.addin-layout.active {
  border: 1px solid #1AB395 !important;
  background: #a3e1d5;
}

.addin.addin-layout:hover {
  background: #e2f4ef;
}

.addin.addin-layout.active:hover {
  background: #a3e1d5;
}

.addin-wrapper {
  padding: 5px !important;
}

.addin-wrapper.active, .addin-wrapper:hover {
  background: #ddecfc;
}

.addin-wrapper.active {
  border: 3px solid #2d8cf0;
}
</style>
<style>
.addin label {
  /*fix bug 6642*/
  word-break: break-all;
}

.dragArea.addin-layout {
  display: inherit;
  align-items: inherit;
  justify-content: inherit;
  flex-direction: inherit;
  flex-wrap: inherit;
}

.editBox .ivu-select-dropdown100 .ivu-select-dropdown {
  width: 100% !important;
  left: 0px !important;
}

.addin label.msize {
  word-break: break-all;
}

.addin[addinname="Operation"] {
  max-width: 100%;
}

.addin-operation {
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
