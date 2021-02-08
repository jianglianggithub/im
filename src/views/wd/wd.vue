<template>
    <div>
        <van-nav-bar title="我的" left-text=""> </van-nav-bar>

        <register v-if="isRegister"></register>
        <wo-de v-else></wo-de>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { NavBar } from "vant";
import Register from "@/views/login/index.vue";
import WoDe from "./components/wode.vue";
export default {
    data() {
        return {};
    },
    computed: {
        ...mapState(["isRegister"])
    },
    components: {
        [NavBar.name]: NavBar,
        Register,
        WoDe,
    },
    props: {},
    watch: {},
    methods: {},
    created() {
        console.log(this);
    },
    mounted() {},
};
</script>

<style scoped>
</style>
