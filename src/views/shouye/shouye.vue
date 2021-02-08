<template>
    <div>
        <keep-alive>
            <router-view />
        </keep-alive>

        <van-tabbar v-model="active" @change="onChange">
            <van-tabbar-item to="/shouye/lxr">
                联系人
                <template #icon>
                    <span class="iconfont icon-xinxi"></span>
                </template>
            </van-tabbar-item>

            <van-tabbar-item to="/shouye/txl">
                通讯录
                <template #icon>
                    <span class="iconfont icon-tongxunlu"></span>
                </template>
            </van-tabbar-item>
            <van-tabbar-item to="/shouye/fx">
                发现
                <template #icon>
                    <span class="iconfont icon-faxian1"></span>
                </template>
            </van-tabbar-item>
            <van-tabbar-item to="/shouye/wd">
                我的
                <template #icon>
                    <span class="iconfont icon-wode"></span>
                </template>
            </van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script>
import { Tabbar, TabbarItem } from "vant";
import { mapState } from "vuex";
export default {
    data() {
        return {
            active: 0,
        };
    },
    components: {
        [Tabbar.name]: Tabbar,
        [TabbarItem.name]: TabbarItem,
    },
    props: {},
    watch: {},
    computed: {
        ...mapState(["isRegister"]),
    },
    methods: {
        onChange(active) {
            let path = this.$route.path;
            console.log("active = " + active + " path = " + path);
            if (path === "/shouye/wd") {
                this.active = 3;
            } else {
                //this.active = active;
            }
        },
    },
    created() {},
    mounted() {
        if (this.$route.path === "/shouye/wd") {
            console.log("初始化router = /shouye/wode active = 3");
            this.active = 3;
        }
    },
};
</script>

<style lang="less" scoped>
</style>
