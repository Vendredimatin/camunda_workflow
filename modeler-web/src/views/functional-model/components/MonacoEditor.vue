<template>
  <div ref="monaco" class="monaco-editor-component" :style="{'width': width, 'height': height + 'px'}">

  </div>
</template>
<script>
import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'

export default {
  props: [
    'value',
    'lang',
    'width',
    'height'
  ],
  data() {
    return {
      editFlag: false,
      editor: null,
    }
  },
  beforeDestroy() {
    this.editor.dispose();
  },
  created() {

  },
  mounted() {
    this.initMonacoEditor();
  },
  computed: {

  },
  watch: {
    value(val){
      if(!this.editFlag){
        this.editor.setValue(val);
        this.editFlag = false;
      }
    },
    lang(val){
      if(val){
        this.initMonacoEditor();
      }
    }
  },
  methods: {
    /**
     *@description初始化编辑器
     *@params
     *@date 2020/12/16
     *@return
     */
    initMonacoEditor(){
      this.editor ? this.editor.dispose() : '';

      //配置语言环境
      // this.MonacoEnvironment = {
      //   getWorkerUrl: function (moduleId, label) {
      // if (label === 'json') {
      //   return './json.worker.bundle.js';
      // }
      // if (label === 'css') {
      //   return './css.worker.bundle.js';
      // }
      // if (label === 'html') {
      //   return './html.worker.bundle.js';
      // }
      // if (label === 'typescript' || label === 'javascript') {
      //   return './ts.worker.bundle.js';
      // }
      // return './editor.worker.bundle.js';
      // return './ts.worker.bundle.js';
      //   }
      // }
      // 创建编辑器
      this.editor = monaco.editor.create(this.$refs.monaco, {
        value: this.value || '',
        language: this.lang == 'java' ? 'javascript' : this.lang,
        wordBasedSuggestions: this.lang == 'html' ? true : false,
        automaticLayout: true,
        contextmenu: false,
        lightbulb: { enabled: false },
        // formatOnType: true
      })
      this.editor.onDidChangeModelContent(() => {
        this.editFlag = true;
        this.$emit('input', this.editor.getValue());
      })
      this.editor.layout();
      window.DWFMONACOEDITOR.type = this.lang;
    },

    /**
    *@description格式化代码
    *@params
    *@date 2020/12/21
    *@return
    */
    format(){
      this.editor.trigger('anyString', 'editor.action.formatDocument');
      // this.editor.getAction('editor.action.formatDocument').run();
    },

    setValue(val){
      this.editor.setValue(val);
      // this.$emit('input', this.editor.getValue());
    },

    getError(){
      return monaco.editor.getModelMarkers();
    }
  }
}
</script>
<style scoped>
.monaco-editor-component{
  border: 1px solid #ddd;
}
</style>
