<template>
    <div class="item">
        <div @click="dianji(item)" v-for="(item, idex) in list" :key="item.firendId">
            <div >
                <div v-if="item.unAckMessageCount > 0" class="red">{{item.unAckMessageCount}}</div>
                <img :src="item.image" />
            </div>
            <div>
                <div class="top">{{ item.likeName }}</div>
                <div class="bottom">{{ item.lastMsg }}</div>
            </div>
            <div>
                {{ formatDateStr(item.lastTime) }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {};
    },
    components: {},
    props: {
        list: {
            type: Array,
        },
    },
    watch: {},
    computed: {},
    methods: {
        dianji(item) {

            this.$router.push({ path: "/liaotian", query: { ...item } });
        },
        formatDateStr(dateStr) {
            // 该消息时间
            let date = new Date(dateStr);
            let time = date.toLocaleTimeString();
            return time;
        }
    },
    created() {},
    mounted() {},
};
</script>

<style lang="less" scoped>
.item {
    > div {
        padding: 0.05rem;
        background-color: #ffffff;
        border-top: #eeeeee 1px solid;
        display: flex;

        > div:nth-of-type(1) {
            display: flex;
            justify-content: center;
            width: 20%;
            > img {
                width: 0.5rem;
                height: 0.5rem;
            }
          position: relative;
          > div:nth-last-of-type(1) {
            font-size: 10px;
            text-align: center;
            line-height: 0.2rem;
            color: #eeeeee;
            position: absolute;
            right: 4px;
            top: -5px;
            width: 0.2rem;
            height: 0.2rem;
            background: red;
            border-radius: 50%;
          }
        }
        > div:nth-of-type(2) {
            > div:nth-of-type(1) {
                font-size: 0.15rem;
            }
            > div:nth-of-type(2) {
                font-size: 0.13rem;
                color: #aeacac;
            }
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            flex: 1;
        }
        > div:nth-of-type(3) {
            font-size: 0.11rem;
            color: #838080;
        }
    }
}
</style>
