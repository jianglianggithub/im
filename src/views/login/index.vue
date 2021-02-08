<template>
    <div class="wrapper">
        <van-button
            @click="register"
            type="primary"
            :block="true"
            size="large"
            :round="true"
            >注册</van-button
        >
        <van-button
            @click="login"
            type="primary"
            :block="true"
            size="large"
            :round="true"
            >登录</van-button
        >
    </div>
</template>

<script>
import { Button } from "vant";
export default {
    data() {
        return {};
    },
    components: {
        [Button.name]: Button,
    },
    props: {},
    watch: {},
    computed: {},
    methods: {
        login() {
            this.$router.push("/login");
        },
        register() {
            console.log("注册");
            this.$router.push("/register");
        },
    },
    created() {},
    mounted() {},
};
</script>

<style lang="less" scoped>
.wrapper {
    margin: 0 auto;
    width: 3.4rem;
    margin-top: 50%;
    > button {
        margin-top: 0.1rem;
    }
}
</style>
