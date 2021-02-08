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
                v-model="name"
                name="name"
                label="网名"
                placeholder="网名"
                :rules="[{ required: true, message: '请填写网名' }]"
            />
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
            <van-field
                name="uploader"
                label="头像上传"
                :rules="[{ required: true, message: '请上传头像' }]"
            >
                <template #input>
                    <van-uploader v-model="uploader" />
                </template>
            </van-field>

            <van-field
                readonly
                clickable
                name="calendar"
                :value="shengri"
                label="生日"
                placeholder="点击选择生日"
                @click="showCalendar = true"
            />
            <van-calendar
                :min-date="minDate"
                v-model="showCalendar"
                @confirm="onConfirm"
            />
            <van-button
                class="submit"
                round
                block
                type="primary"
                native-type="submit"
            >
                提交
            </van-button>
        </van-form>
    </div>
</template>

<script>
import { NavBar } from "vant";
import { Form } from "vant";
import { Button } from "vant";
import { Field } from "vant";
import { Uploader } from "vant";
import { Calendar } from "vant";

export default {
    data() {
        return {
            username: "",
            password: "",
            name: "",
            showCalendar: false,
            shengri: undefined,
            uploader: undefined,
        };
    },
    components: {
        [NavBar.name]: NavBar,
        [Form.name]: Form,
        [Button.name]: Button,
        [Field.name]: Field,
        [Uploader.name]: Uploader,
        [Calendar.name]: Calendar,
    },
    props: {},
    watch: {},
    computed: {
        minDate() {
            let date = new Date();
            date.setFullYear(1970, 1, 1);
            return date;
        },
    },
    methods: {
        clickLeft() {
            this.$router.push("/shouye/wode");
        },
        async onSubmit(data) {
            if (data.uploader.length > 1) {
                this.$msg("图片最多选择1张");
                return;
            }
            let msg1 = this.$msg.loading({
                message: "加载中...",
                forbidClick: true,
            });
            console.log(data);
            let fromCommit = new FormData();
            fromCommit.append("file", data.uploader[0].file);
            fromCommit.append("name", data.name);
            fromCommit.append("username", data.username);
            fromCommit.append("password", data.password);
            fromCommit.append("calendar", data.calendar);
            let res = await this.$http.post(
                "/httpServer/user/register",
                fromCommit
            );
            msg1.clear();
            let msg2 = this.$msg.success("注册成功");

            //没考虑注册不成功情况 不成功直接弹出提示即可
            setTimeout(() => {
                msg2.clear();
                this.$router.push("/login");
            }, 1000);
        },
        onConfirm(date) {
            this.shengri = date.toLocaleDateString();
            this.showCalendar = false;
        },
    },
    created() {},
    mounted() {},
};
</script>

<style lang="less" scoped>
.submit {
    margin-top: 0.1rem;
}
.form {
    > div {
        margin-bottom: 0.02rem;
    }
    margin-top: 0.02rem;
    padding: 0 0.1rem;
}
</style>
