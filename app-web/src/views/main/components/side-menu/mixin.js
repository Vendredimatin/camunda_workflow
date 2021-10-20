export default {
  methods: {
    showTitle(item) {
      return (item.meta && item.meta.title) || item.name;
    },
    showChildren(item) {
      return item.children && item.children.length !== 0;
    }
  }
};
