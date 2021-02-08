import Vue from "vue"
import Vuex from "vuex"
import { getUserInfo } from "@/utils/auth.js"
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        // websocket是否成功连接
        webSocketState: false,
        // 用于在我的路由视图中显示注册还是显示 我的详情
        isRegister: false,
        userInfo: getUserInfo(),
        //websocket重连服务端次数
        reconnecCount: 0,


        /*
            拉取到未读消息 状态感知 。如果 当前用户收到了消息 那么监听组件 重localStoreg 重新获取新数据即可。

            在 联系人page,聊天page  比如当前用户静止在 前面的2个页面之一的一个页面。
            这个时候 收到了 某个用户消息
            则需要 动态触发一个事件来 渲染页面 【因为收到消息 消息是保存在laocalStoreg中的 需要手动读取】
        */
        // 消息本体
        unReadMsgEvent: {},

        lxrPageIsLoading: false,
        // 当发送消息 接收到消息后 将 联系人列表刷新 这个时候最新的消息 已不是之前的了。
        resetLxrPageCache: false,
        // 服务端回调用户发送的 消息 成功 返回 消息id
        notifySendMessageAck: {},



        //发起拨打电话动作
        call:{},
        // 只是为了唤起 选择接听还是拒绝的 top 的一个动作  默认就是 webRtcWrapper Class 的 对象
        preCall:{},
        //  0 : 默认状态 1 : 拨打中  2 : 接听中
        callState: 0,
        // 服务端返回answer
        answer:"",
        close:{},
        // 拨打的用户信息
        callUserInfo:{},
        icecandidate:""
    },
    getters: {},
    mutations: {
        updateWebsocketState(state, param) {
            state.webSocketState = param
        },
        updateIsRegister(state, param) {
            state.isRegister = param
        },
        updateUserInfo(state, param) {
            state.userInfo = param
        },
        updatereConnecCount(state, param) {
            state.reconnecCount = state.reconnecCount + 1
            //登录成功后清空计数
            if (param) {
                state.reconnecCount = 0
            }
        },

        resetLxrPageCache(state) {
            let reset = state.resetLxrPageCache;
            state.resetLxrPageCache = !reset;
        },
        call(state,param) {
            state.call = param
        },
        preCall(state,param) {
            state.preCall = param
        },
        updateCallState(state,param) {
            state.callState = param
        },
        answer(state,param) {
            state.answer = param
        },
        callUserInfo(state,param){
            state.callUserInfo = param
        },
        updateicecandidate(state,param) {
            state.icecandidate = param
        }
    },
    actions: {},
    modules: {},
})
