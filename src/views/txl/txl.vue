<template>
    <div>
        <van-nav-bar
            :fixed="true"
            :placeholder="true"
            title="通讯录"
            left-text=""
        >
        </van-nav-bar>

        <van-index-bar
            :index-list="model.initials"
            v-if="model"
            :sticky-offset-top="30"
        >
            <div v-for="item in model.initials" :key="item">
                <!-- 每一行的title 字母 跟item本身绑定 因为这个是唯一的   -->
                <van-index-anchor :index="item"  />
                 <!-- cell 跟 好友id绑定 重新渲染id一致 view不会渲染 -->
                <div
                    :class="['cell',  index !== model.result[item].length - 1  ? 'xhx':'']"
                    v-for="(children,index) in model.result[item]"
                    :title="children.userInfo.likeName"
                    :key="children.userInfo.id"
                >
                   <img :src="children.userInfo.image" />
                   {{ children.userInfo.likeName }}
                </div>
            </div>
        </van-index-bar>
    </div>
</template>

<script>
import { IndexBar, IndexAnchor, Cell } from "vant";
import { NavBar } from "vant";
import  { getUserFirends } from "@/utils/userInfo/txl_cache"
export default {
    data() {
        return {
            model: null,
        };
    },
    components: {
        [NavBar.name]: NavBar,
        [IndexBar.name]: IndexBar,
        [IndexAnchor.name]: IndexAnchor,
        [Cell.name]: Cell,
    },
    props: {},
    watch: {},
    computed: {},
    methods: {
         initModel() {


            this.model = getUserFirends();
            console.log(this.model);
        },
    },
    created() {
        console.log("通讯录开始初始化");
        this.initModel();
    },
    mounted() {},
};
</script>

<style lang="less" scoped>
.cell {
    width: 100%;
    background: #ffffff;
    height: 40px;
    display: flex;
    align-items: center;
    font-size: 0.16rem;
    > img {
        width: 0.38rem;
        height: 0.38rem;
        margin-left: 0.15rem;
        margin-right: 0.15rem;
    }
}
.xhx {
    border-bottom: #f4f4f4 1px solid;
}
</style>
