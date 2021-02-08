<template>
    <div>
        <div class="wrapper">
            <div v-if="model" class="top">
                <div class="left">
                    <img :src="model.image" />
                </div>
                <div class="rigth">
                    <div>{{ model.likeName }}</div>
                    <div>{{ "账号:  " + model.uname }}</div>
                </div>
            </div>
        </div>

        <van-cell-group class="buttom">
            <van-cell  v-for="(item,index) in list" :key="index" :title="item"  icon="shop-o" />
           
        </van-cell-group>
    </div>
</template>

<script>
import { Cell, CellGroup } from "vant";
export default {
    data() {
        return {
            model: null,
            list:["支付","相册"]
        };
    },
    components: {
        [Cell.name]: Cell,
        [CellGroup.name]: CellGroup,
    },
    props: {},
    watch: {},
    computed: {},
    methods: {
        async initModel() {
            let data = await this.$http.get("/httpServer/user/info");
            this.model = data.data;
        },
    },
    created() {
        this.initModel();
    },
    mounted() {},
};
</script>

<style lang="less" scoped>
.wrapper {
    background: #ffffff;
}
.top {
    width: 3.3rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    height: 1.2rem;
    > .left {
        margin-right: 0.15rem;
        > img {
            width: 0.6rem;
            height: 0.6rem;
        }
    }
    > .rigth {
        > div:nth-of-type(1) {
            font-size: 18px;
            font-weight: 560;
        }
        > div:nth-of-type(2) {
            font-size: 0.13rem;
        }
        height: 0.6rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
}
.buttom {
    margin-top: 0.13rem;
}

</style>
