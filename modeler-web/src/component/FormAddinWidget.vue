<template>
  <div>
    <AddinCommentWidget
      :active="widgetAnnotationComment"
      :classProp="classProp"
      @commentAddin="commentAddin"
    >

    </AddinCommentWidget>
    <AddinActionWidget
      :classProp="classProp"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </AddinActionWidget>
  </div>
</template>

<script>
import AddinActionWidget from '@/component/addin_action_widget';
import AddinCommentWidget from '@/component/addin_comment_widget';

export default {
  name: "FormAddinWidget",
  props: [
    'classProps',
    'widgetAnnotationComment',
  ],
  components: {
    AddinActionWidget,
    AddinCommentWidget,
  },
  data() {
    return {
      classProp: '',
    }
  },
  created() {
    this.classProp = this.classProps || '';
  },
  mounted() {

  },
  methods: {
    copyAddin(){
      this.$emit('copyAddin');
    },

    deleteAddin(){
      this.$emit('deleteAddin');
      // if(this.name == 'DragItem'){
      //   return this.$refs.addinComponent.deleteItem()
      // }else{
      // }
    },

    commentAddin(){
      this.$emit('commentAddin');
    }
  }
}
</script>
