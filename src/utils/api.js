/**
 *  api 接口
 */


import {wrapper,initWebSocket} from "./websocket"
import Const from "@/utils/const";
import {stringToBytes} from "@/utils/utils";
import { Toast } from "vant"

let protoRoot = require("@/proto/proto.js")
export const model = protoRoot.lookup("Model")



export function sendWebRtcMessage(obj) {
    console.log("sendWebRtcMessage message =  ",obj)
    let msgObj = model.create({event: Const.EventType_13,content: stringToBytes(JSON.stringify(obj))})
    return sendWebSocketMsg(msgObj,false)
}


export function ackMessage(ids) {
    console.log("ackMessage ids = ",ids)
    let msgObj = model.create({event: Const.EventType_8,content: stringToBytes(ids)})
    return sendWebSocketMsg(msgObj,true)
}

/**
 * 登录
 */
export function login() {
    console.log("发起登录请求websocket")
    let msgObj = model.create({
        event: Const.EventType_4,
    })
    return sendWebSocketMsg(msgObj)
}

export function sendMsg(msg, receiver,sendTime,messageId) {
    let msgObj = model.create({
        event: Const.EventType_2,
        receiver: receiver,
        sendTime: sendTime,
        messageId: messageId,
        content: stringToBytes(msg),
    })
    return sendWebSocketMsg(msgObj)
}

// 拉取未读的消息
export function pullUnReadMsg() {
    console.log("通道打开后开始拉取未读消息事件")
    let msgObj = model.create({
        event: Const.EventType_7,
    })

    return sendWebSocketMsg(msgObj)
}

export function pullFriends() {
    console.log("通道打开后拉取好友列表")
    let msgObj = model.create({
        event: Const.EventType_14,
    })
    return sendWebSocketMsg(msgObj)
}

export function pullContactRecord() {
    console.log("拉取联系人纪录消息事件")
    let msgObj = model.create({
        event: Const.EventType_9,
    })
    return sendWebSocketMsg(msgObj)
}

// 发送心跳
export function sendHeartbeat() {
    console.log("clinet发送心跳包 当前次数 : " + ++wrapper.sendHeartbeatCount)
    let msgObj = model.create({
        event: Const.EventType_1,
    })
    // 字节数组
    let buffer = model.encode(msgObj).finish()
    if (wrapper.websocket) {
        wrapper.websocket.send(buffer)

        setTimeout(() => {
            sendHeartbeat()
        }, 20 * 1000) // defualt 20s send one
        return true
    }

    return false
}


// 恢复指定好友的聊天记录
export async function recoveryFirendRecord(firendId) {
    console.log("恢复指定好友的聊天记录 firendIds = " + firendId )
    let msgObj = model.create({
        event: Const.EventType_10,
        receiver: firendId
    })
    return sendWebSocketMsg(msgObj)
}



// 通用send
export function sendWebSocketMsg(msgObj,resend = true) {
    // 字节数组
    let buffer =  model.encode(msgObj).finish()
    if (wrapper.websocket) {
        try {
            wrapper.websocket.send(buffer)
            return true
        }catch (e) {
            // 当发送失败只有一种可能性 就是断网 或者断开了连接 这个时候 直接通过 红色感叹号 点击后重连 再次发送
            console.log("webSocket 消息发送失败",e)
            return false
        }
    }

   Toast(` wrapper.websocket = null webSocket消息发送失败`)

    if (resend) {
        initWebSocket().then(() => {
            setTimeout(() => {
                sendWebSocketMsg(msgObj)
            },1000)
        })
    }

    return false
}



