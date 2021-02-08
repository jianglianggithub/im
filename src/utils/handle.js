
/*
*   处理服务端 消息
*
* */

import { addContacts } from "@/utils/userInfo/lxr_cache.js";
// 收到消息
import {Utf8ArrayToStr} from "@/utils/utils";
import Const from "@/utils/const";
import {addTxjl} from "@/utils/userInfo/txjl_cache";
import store from "@/store";
import {model} from "@/utils/api";
import {getUserInfo} from "@/utils/auth";

export function websocketonmessage(data) {
    // console.log("收到消息解码前", data)
    let reader = new FileReader()
    reader.readAsArrayBuffer(data.data)
    reader.onload = () => {
        const buf = new Uint8Array(reader.result)
        const res = model.decode(buf)
        let event = res.event
        let data = Utf8ArrayToStr(res.content)

        switch (event) {
            case Const.EventType_7:
                data = JSON.parse(data)
                console.log("【事件】收到未读消息", data)
                handleUnReadMsg(data)
                break
            case Const.EventType_5:
                console.log("【事件】登录成功事件消息", data)
                handleLoginSuucess(data)
                break
            // case Const.EventType_9:
            //     data = JSON.parse(data)
            //     console.log("【事件】收到联系人纪录消息", data)
            //     handleContactsRecordMsg(data)
            //     break
            case Const.EventType_10:
                data = JSON.parse(data)
                console.log("【事件】收到拉取指定联系人(有历史消息但是本地没有聊天记录的用户)", data)
                handleRecoveryFriendRecordMsg(data)
                break
            case Const.EventType_11:
                data = JSON.parse(data)
                console.log("【事件】客户端发送消息服务端ACK", data)
                handleSendMessageAck(data)
                break
            case Const.EventType_12:
                data = JSON.parse(data)
                console.log("【事件】收到联系人消息事件", data)
                handleFirendMsg(data)
                break
            case Const.EventType_13:
                data = JSON.parse(data)
                handleWebRtcMsg(data)
                break
            case Const.EventType_14:
                data = JSON.parse(data)
                console.log("【事件】收到通讯录消息事件", data)
                handleFriends(data)
                break
            default:
                console.log(`【事件】${event} 事件类型无法处理没有对应的策略`)
        }
    }
}
import  WebRtcConst from "@/utils/webrtc"

export function handleWebRtcMsg(data) {
    let eventType = data.eventType

    if (eventType === WebRtcConst.WebRtcEventType_3) {
        let action = data.action
        let actionEventType = action.eventType

        // 拨打的用户拒绝接听或者不在线
        if (actionEventType === WebRtcConst.WebRtcActionEventType_3) {

        }
        // 发起视频邀请 弹出选择框 [确认，取消] 后续事宜
        else if (actionEventType === WebRtcConst.WebRtcActionEventType_2) {
            // 设置为接听电话中
            store.commit("updateCallState",2)
            store.commit("preCall",data)
            console.log("接收到 拨打电话请求 preCall ",data)
        }
    }else if (eventType === WebRtcConst.WebRtcEventType_2) {
        let answer = data.answer
        store.commit("answer",answer)
    } else if (eventType === WebRtcConst.WebRtcEventType_4) {
        store.commit("updateicecandidate",data.iceCondidate)
    }else if (eventType === WebRtcConst.WebRtcEventType_5) {
        console.log("搜到服务端发送过来的close 事件")
        store.state.close = {}

    }



}

/**
 * item.type = 0  是因为 这个func 处理的都是接收的消息 所以type 100% = 0
 */
export function handleFirendMsg(item) {
    if (!item.type) {
        item.type  = "0";
    }
    let {insertSuccess,insert } = insertMsg(item);

    // 添加到 本地存储成功才添加的缓存 否则可能 本地数据已经存在了
    if (insertSuccess) {
        // reset 唤醒监听组件
        store.state.unReadMsgEvent = insert
        // 唤醒联系人页面 重新刷新LxrInfoCache
        store.commit("resetLxrPageCache")
    }
}

export function handleSendMessageAck(data) {
    store.state.notifySendMessageAck = data;

}

export function handleRecoveryFriendRecordMsg(data) {
    handleUnReadMsg(data) // 逻辑是相同的。
    // 将加载页面停止加载
    store.state.lxrPageIsLoading = false
}

import  { addFirend } from "@/utils/userInfo/txl_cache"

export function handleFriends(data) {
    addFirend(data)
}
//
// export function handleContactsRecordMsg(data) {
//
//     data.forEach(lxr => {
//         addContacts({
//             firendId: lxr.firendId,
//             likeName: lxr.likeName,
//             image: lxr.image,
//             lastMsg: lxr.lastMsg,
//             lastTime: lxr.lastTime,
//         });
//     })
//
//
//
// }


//处理未读的消息

export function handleUnReadMsg(data) {

    // 遍历加入本地存储中去
    data.forEach((item) => {

        insertMsg(item)

    })
}
// 登录成功
export function handleLoginSuucess(data) {
    // ignore
}


function  insertMsg(item) {
    let insert = {
        id: item.id,
        content: item.msgBody,
        sendTime: item.sendTime,
        status: item.ack,
        sendUid: item.sendUid,
        receiveUid: item.receiveUid,
        type: item.type,
    }
    // 新增到localStoreg

    let insertSuccess = addTxjl(insert)


    return {insertSuccess,insert };
}
