<template>
    <div>
        <ul class="ul">
            <li
                @click="dianji(item, index)"
                v-for="(item, index) in list"
                :key="index"
                :class="[curIndex === index ? 'isActive' : '']"
            >
                <span :class="item.iconfont"></span>
                {{ item.name }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            curIndex: 0,
            list: [
                {
                    name: "联系人",
                    path: "/shouye/lxr",
                    iconfont: "iconfont icon-xinxi",
                },
                {
                    name: "通讯录",
                    path: "/shouye/txl",
                    iconfont: "iconfont icon-tongxunlu",
                },
                {
                    name: "发现",
                    path: "/shouye/fx",
                    iconfont: "iconfont icon-faxian1",
                },
                {
                    name: "我的",
                    path: "/shouye/wd",
                    iconfont: "iconfont icon-wode",
                },
            ],
        };
    },
    components: {},
    props: {},
    watch: {},
    computed: {},
    methods: {
        dianji(item,index) {
            console.log("点击事件触发 index = "+ index)
            this.curIndex = index;
            this.$router.push(item.path)
        }
    },
    created() {},
    mounted() {},
};
</script>

<style lang="less" scoped>
.ul {
    display: flex;
    position: fixed;
    left: 0;
    width: 3.75rem;

    bottom: 0;
    height: 0.5rem;
    justify-content: space-around;
    align-items: center;
    background: #ffffff;
    > li {
        width: 0.5rem;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}
.isActive {
    color: #d56aea;
}
</style>
