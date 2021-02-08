import Vue from "vue"
import VueRouter from "vue-router"
import { getToken, setToken, removeToekn } from "@/utils/auth"
Vue.use(VueRouter)
import store from "@/store"
const routes = [
    {
        path: "/",
        redirect: "/shouye",
    },
    {
        path: "/shouye",
        redirect: "/shouye/lxr",
        component: () => import("@/views/shouye/shouye.vue"),

        children: [
            //联系人
            { path: "lxr", component: () => import("@/views/lxr/lxr.vue") },
            //通讯录
            { path: "txl", component: () => import("@/views/txl/txl.vue") },
            //发现
            { path: "fx", component: () => import("@/views/fx/fx.vue") },
            //我的
            { path: "wd", component: () => import("@/views/wd/wd.vue"), meta: { aaa: "!11" } },
        ],
    },
    { path: "/liaotian", component: () => import("@/views/liaotian/liaotian.vue") },
    { path: "/register", component: () => import("@/views/login/reigster.vue"), meta: { noAuth: true } },
    { path: "/login", component: () => import("@/views/login/login.vue"), meta: { noAuth: true } },
    //{ path: "/gaode", component: () => import("@/views/amap/gaode.vue"), meta: { noAuth: true } },
]

const router = new VueRouter({
    routes,
})
//解决连续点2次path 一样会报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err)
}

router.beforeEach((to, from, next) => {

    if (to.path !== "/shouye/wd" && !to.meta.noAuth && !getToken()) {
        store.commit("updateIsRegister", true)
        next({ path: `/shouye/wd` })
    } else {
        next()
    }
})

if (!getToken()) {
    store.commit("updateIsRegister", true)
} else {
    store.commit("updateIsRegister", false)
}

export default router
