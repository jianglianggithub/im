<template>
    <div>
        <van-nav-bar
            @click-left="clickLeft"
            class="aaa"
            :left-arrow="true"
            title="注册"
            left-text="返回"
        >
        </van-nav-bar>
        <van-form class="form" @submit="onSubmit">
            <van-field
                v-model="username"
                name="username"
                label="用户名"
                placeholder="用户名"
                :rules="[{ required: true, message: '请填写用户名' }]"
            />
            <van-field
                v-model="password"
                type="password"
                name="password"
                label="密码"
                placeholder="密码"
                :rules="[{ required: true, message: '请填写密码' }]"
            />
            <van-button
                class="submit"
                round
                block
                type="primary"
                native-type="submit"
            >
                登录
            </van-button>
        </van-form>
    </div>
</template>

<script>
import { getToken, setToken, removeToekn, setUserInfo } from "@/utils/auth";

import { NavBar } from "vant";
import { Form } from "vant";
import { Button } from "vant";
import { Field } from "vant";

import { initWebSocket } from "@/utils/websocket.js";
export default {
    data() {
        return {
            username: "qq237784669",
            password: "123456",
        };
    },
    components: {
        [NavBar.name]: NavBar,
        [Form.name]: Form,
        [Button.name]: Button,
        [Field.name]: Field,
    },
    props: {},
    watch: {},
    computed: {},
    methods: {
        clickLeft() {
            this.$router.push("/shouye/wode");
        },
        async onSubmit(data) {
            let res = await this.$http.get(
                `/register/login/login?username=${data.username}&password=${data.password}`
            );
            console.log("data = ", res.data);
            if (res.data) {
                let msg1 = this.$msg.success("登录成功");
                setToken(res.data.token);

                //用户信息缓存 store
                let userInfo = res.data.userInfo;

                //登录成功后 改变 需要注册状态 再次重新回到 /shouye/wode 路由时 显示个人信息
                this.$store.commit("updateIsRegister", false);
                this.$store.commit("updateUserInfo", userInfo);
                // 缓存到localStore的原因 主要是为了防止当前token 有缓存的情况下刷新游览器 那么 store 中的信息就没了
                setUserInfo(userInfo);

                setTimeout(() => {
                    msg1.clear();
                    this.$router.push("/shouye/wd");

                    setTimeout(() => {
                        // 登录成功后 初始化 webSocket连接
                        initWebSocket();
                    }, 500);
                }, 1000);


            }
        },
    },
    created() {},
    mounted() {},
};
</script>

<style lang="less" scoped>
.form {
    > div {
        margin-bottom: 0.02rem;
    }
    margin-top: 0.1rem;
    padding: 0 0.1rem;
}
.submit {
    margin-top: 0.1rem;
}
</style>
