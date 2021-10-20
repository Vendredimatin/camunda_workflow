export const tableMixin = {
    data() {
        return {
            tableHeight: 450,
            tableHeights: '450px',
            gridHeights: '450px',
            cardHeights: '450px',
            codeHeights: '450px',
            cardHeight: 450
        }
    },
    mounted() {
        let _this = this
        this.init()
        window.onresize = function(){
            _this.init()
            _this.resizeHeight()
            _this.uerRightFunc()
            _this.authUserRightFunc()
        }
    },
    computed: {
        isResize() {
            return {
                filteredAppData: this.filteredAppData,
                filteredUserGroups: this.filteredUserGroups,
                filteredClasses: this.filteredClasses
            }
        }
    },
    watch: {
        // 点击刷新按钮，自适应失效fix
        refreshAtable(val){
            val ? this.$nextTick(() => {this.resizeHeight()}) : ''
        },
        isResize() {
            this.$nextTick(() => {this.resizeHeight()})
        },
        // 授权右侧模块初次显示高度设置
        'currentRow.oid': function(val, oldVal){
            if(oldVal)return
            this.$nextTick(() => {
                this.resizeHeight()
            })
        },
        'currentRow.id': function(val, oldVal){
            if(oldVal)return
            this.$nextTick(() => {
                this.resizeHeight()
            })
        },
        // 用户组右侧高度
        'allUserList.length': function(val, oldVal){
            this.userRightFunc()
        },
        authCardShow: function(val, oldVal){
            if(!val)return
            this.authUserRightFunc()
        }
    },
    methods: {
        init() {
            this.$nextTick(() => {
                // 底部页码高度
                let pageHeight = 76
                // 当前滚动模块距离视窗顶部的高度
                let topHeight = 0
                console.log('9999999999999999')
                // iview table
                if(this.$refs.viewTable){
                    let el = this.$refs.viewTable.$el ? this.$refs.viewTable.$el : this.$refs.viewTable
                    topHeight = el.getBoundingClientRect().top
                    // 设置表格高度
                    this.tableHeight = window.innerHeight - pageHeight - topHeight
                    this.tableHeights = window.innerHeight - pageHeight - topHeight + 'px'
                    
                }
                // 功能授权
                if(this.$refs.treeTable){
                    let el = this.$refs.treeTable.$el ? this.$refs.treeTable.$el : this.$refs.treeTable
                    topHeight = el.getBoundingClientRect().top
                    // 设置表格高度
                    // this.tableHeight = window.innerHeight - topHeight
                    this.tableHeights = window.innerHeight - topHeight - 20 + 'px'
                    
                }
    
                if(this.$refs.userTable){
                    topHeight = this.$refs.userTable.$el.getBoundingClientRect().top
                    pageHeight = 45
                    // 设置表格高度
                    this.tableHeight = window.innerHeight - pageHeight - topHeight
                }
                if(this.$refs.globalTable){
                    topHeight = this.$refs.globalTable.$el.getBoundingClientRect().top
                    // 设置表格高度
                    this.tableHeight = window.innerHeight - pageHeight - topHeight
                }
                // 功能模型，实体类操作
                if(this.$refs.selfTable){
                    topHeight = this.$refs.selfTable.getBoundingClientRect().top
                    // 设置表格高度
                    this.tableHeights = window.innerHeight - pageHeight - topHeight + 'px'
                }
                // if(this.$refs.commonGrid)this.gridHeights = window.innerHeight - this.$refs.commonGrid.$el.offsetTop - 150 + 'px'
                if(this.$refs.commonGrid){
                    topHeight = this.$refs.commonGrid.$el.getBoundingClientRect().top
                    this.gridHeights = window.innerHeight - pageHeight - topHeight + 'px'
                }
                
                // 授权模块，ant table
                // this.resizeHeight()
                // 解决小屏双层滚动条
                // authTreeList.forEach((item) => {
                //     item.style.height = 'initial'
                // })
                // 代码装配
                if(this.$refs.codeAssenble){
                    topHeight = this.$refs.codeAssenble.$el.getBoundingClientRect().top
                    pageHeight = 45
                    this.codeHeights = window.innerHeight - pageHeight - topHeight + 'px'
                }
                
            })
        },
        resizeHeight(pageHeight = 76, topHeight = 0) {
            // 授权模块，ant table
            let antTableList = document.querySelectorAll('.ant-table-body')
            if(antTableList.length){
                antTableList.forEach((item) => {
                    // 大小屏底部边距看起来不统一
                    topHeight = item.parentNode.getBoundingClientRect().top
                    item.style.overflow = 'auto'
                    let hasEmpty = item.nextSibling
                    if(hasEmpty !== null){
                        item.style.display = 'none'
                        hasEmpty.style.height = window.innerHeight - pageHeight - topHeight + 'px'
                    }else{
                        item.style.display = 'block'
                        item.style.height = window.innerHeight - pageHeight - topHeight + 'px'
                    }
                })
            }
        },
        userRightFunc() {
            this.$nextTick((pageHeight = 56, topHeight = 0) => {
                if(this.$refs.userRight){
                    topHeight = this.$refs.userRight.getBoundingClientRect().top
                    this.cardHeights = window.innerHeight - pageHeight - topHeight - 46 + 'px'
                }
            })
        },
        authUserRightFunc() {
            this.$nextTick((pageHeight = 56, topHeight = 0) => {
                if(this.$refs.authUserRight){
                    topHeight = this.$refs.authUserRight.getBoundingClientRect().top
                    this.cardHeights = window.innerHeight - topHeight -20 + 'px'
                }
            })
        }
    }
}