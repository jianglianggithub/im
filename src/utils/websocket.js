import http from "./request"
import store from "@/store"
import {getToken} from "@/utils/auth.js"
import {Toast} from "vant"
import {uuid} from "./utils.js"

import Const from "./const.js"
import {addTxjl, sortTxjl} from "./userInfo/txjl_cache.js"


import {login, pullUnReadMsg, pullContactRecord , pullFriends} from "./api"
import {string2Bytes, Utf8ArrayToStr, ab2str} from "@/utils/utils.js"

import {getUserInfo} from "@/utils/auth.js"
import {websocketonmessage} from "@/utils/handle";
import {sendHeartbeat} from "./api";

/**
 *      服务端netty的空闲状态监测的 目的是为了防止 下线用户但是没有处罚close事件才有的
 *      而这样会导致 在线用户 也会处于挂机状态被close 这种情况 自动重连
 *
 *
 *
 *
 *      当连接失败 会回调 erro => close
 *      但是如果只是服务端 close 会 只回调close
 *
 *
 *
 *
 *       断线重连还有一个方法就是在 路由里面监听 webSocket TAG 是否连接成功 如果不是 重新连接
 *        这个方法可以 把 刷新的时候 连接就断开了的问题解决。
 */

export let wrapper = {
    websocket: null,
    sendHeartbeatCount: 0
}

export async function initWebSocket() {
    // 更新重连的次数
    store.commit("updatereConnecCount")
    console.log("websocket 重新连接")
    let data = await getUrl()
    console.log("服务端获取的 url => " , data)
    wrapper.websocket = new WebSocket("ws://" + data.data + "/ws?token=" + `${getToken()}`)
    wrapper.websocket.onmessage = websocketonmessage
    wrapper.websocket.onopen = websocketonopen
    wrapper.websocket.onerror = websocketonerror
    wrapper.websocket.onclose = websocketclose

}

// 打开成功
function websocketonopen() {
    /**
     * 给当前连接设置一个全局标识符。
     * 因为可能会存在一个用户 断线后重新连接
     * 那么 服务端会将老的channel 进行关闭 那么 收到 close 事件后
     * 将当前websocket = null 的时候 可能这个 channel 其实是重新连接的
     * 会造成 重复连接后关闭 的bug
     *
     * 只要每次连接后刷新一遍连接的uuid 关闭的时候 查询关闭的 通道对应的 websocket 通道和当前 的版本id是否匹配
     * 如果不匹配则不close()
     */
    wrapper.websocket.uuid = uuid()

    console.log("websocket 连接成功", wrapper.websocket)
    // 连接成功
    store.commit("updateWebsocketState", true)
    // 清空重连次数
    store.commit("updatereConnecCount", true)

    //清空状态
    oldToast = null

    let loginIndex = Toast.loading({
        message: "登录中",
        forbidClick: true,
    })

    // 发送登录请求,向服务端注册自己
    login()
    loginIndex.close()


    // 每次ws打开后 很有可能有未签收的消息 放到这里主要是考虑 被动式拉取 比主动式拉取 更优雅“智能”
    pullUnReadMsg()

    // 拉取联系人纪录
    // pullContactRecord()

    // 拉取好友列表
    pullFriends()
    // 心跳
    sendHeartbeat()
}

let oldToast = null

// 发生错误
function websocketonerror(e) {
    console.log("websocket 发生错误", e)
    let targetWebsocket = e.target
    //表示已经经过了erro事件处理
    targetWebsocket.websocketonerror = true;

    // 必须在erro事件中做这个处理 如果 在erro不做 等着close一起做
    // 可能会 重连之后  在回调了close 出现问题
    wrapper.websocket = null
    store.commit("updateWebsocketState", false)


    if (store.state.reconnecCount < 5) {
        // 如果重连了很多次 提示会存在多层 关闭之前打开的 提示层 然后再次提示
        if (oldToast) {
            oldToast.close()
        }
        oldToast = Toast.loading({
            message: "尝试重新连接服务端中 重连次数:" + store.state.reconnecCount,
            forbidClick: true,
        })
        // 1秒后再次重新尝试 否则这个上面这个lading提示根本显示不出来 因为 递归调用回调太快了
        setTimeout(() => {
            initWebSocket()
        }, 1000)
    } else {
        console.log("连接服务端失败 重连次数:" + store.state.reconnecCount)
        Toast("连接webSocket服务端失败")
    }
    //情况发送心跳包次数
    wrapper.sendHeartbeatCount = 0

}

// 断开连接 [这个断开连接 连接报错 或者服务端主动断开连接都会 回调这个参数]
function websocketclose(e) {
    console.log("断开连接", e, wrapper.websocket, "erroEvent = ", e)
    let targetWebsocket = e.target
    /*
        如果标识符相同 代表不是重新连接 导致服务端关闭的老的通道
        可能出现 就是 当发送消息失败 立刻从新连接 这个时候 webSocket 引用的 socket不是之前的 webSocket了
        但是close 事件是触发之前的websocket 所以会把当前好的 webSocket给关闭掉
        close 事件是异步的

        初始化连接失败也要更新状态并且 滞空 wbeSocket 引用
    * */
    if (targetWebsocket.uuid === wrapper.websocket.uuid) {

        console.log("服务端回溯的close事件与当前websocket uuid 一致通道关闭")

        wrapper.websocket = null
        store.commit("updateWebsocketState", false)

        // console.log("websocket close 事件重连")
        // setTimeout(() => {
        //     initWebSocket()
        // }, 1000)
        // //情况发送心跳包次数
        // wrapper.sendHeartbeatCount = 0
    }
    if (!oldToast && !targetWebsocket.websocketonerror) {
        Toast("服务端webSocket通道已关闭")
    }


}

// 获取连接的websocket 的nettyNode 节点地址
function getUrl() {
    return http.get("/httpServer/nacos/getWebSocketServer")
}




