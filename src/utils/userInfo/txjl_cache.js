import store from "@/store"
import { getUserInfo } from "@/utils/auth.js"
import { recoveryFirendRecord } from "@/utils/api"
// 聊天记录
class Record {
    // 消息id
    id
    // 消息体
    content
    // 发送时间
    sendTime
    // 是否发送成功收到回执  db  ack字段
    status
    // 是接收方还是发送方  1= 发送方 0 = 接收方
    type
    // 该字段是用来标记 用户发送消息 等待服务端回调字段 初始发送消息时
    // 该字段默认为 0 【测试添加的数据】  发送中 = 1  发送成功服务端回调后= 2  发送失败 = 3 【1=发送中 的状态】
    sendSuccess

    constructor(id, content, sendTime, status, type,sendSuccess) {
        this.id = id
        this.content = content
        this.sendTime = sendTime
        this.status = status
        this.type = type
        this.sendSuccess = sendSuccess
    }
}

/**
 *  获取当前用户缓存在本地的 聊天消息
 *
 *  缓存列表格式处理  因为一个游览器下可能登陆不同的账号这个得考虑进去
 *  {
 *      ## 当前设备登录的用户id
 *      userId: {
 *
 *           “receiveUid”:[ {} , {} , {} ]
 *
 *              ps:数组内每个item为消息block , key = 发送人 + "_" + 接收人
 *              查询的时候 直接 可以 通过key来确定 当前用户和对方的聊天记录
 *
 *      }
 *  }
 */
export function getUserTxjl() {
    try {
        let items = JSON.parse(localStorage.getItem("userTxjl"))
        if (!items) {
            return {}
        }
        return items
    } catch (e) {
        return {}
    }
}

// 获取当前用户的所有聊天记录
export function getCurUserTxjlCache() {
    let items = getUserTxjl()
    try {
        //用户id
        let userId = store.state.userInfo.id

        return items[userId]
    } catch (e) {
        // 如果 store中没缓存 直接从localstore中获取
        return items[getUserInfo().id]
    }
}

/**
 * 添加 好友聊天记录 到 localStorage
 */
export function addTxjl({ id, content, sendTime, status, sendUid, receiveUid, type ,sendSuccess = 0 }) {
    let insertSuccess = false

    //用户id
    let userId = store.state.userInfo.id

    let items = getUserTxjl()
    let target = [];
    // 已缓存用户信息
    if (items[userId]) {
        // 当前用户 缓存
        let item = items[userId]

        /**
         *  可能接收人是 自己 可能发送人是自己
         * */
        // 查看当前用户Id 与 接受人用户id 的缓存
        target = item[receiveUid]

        // 如果接收人缓存不存在 那么查看发送人缓存
        if (!target) {
            target = item[sendUid]
        }

        // 如果当前用户与接收方用户聊天记录不存在
        if (!target) {
            // init
            target = []
            // 保证 当前用户:{ 聊天人用户1:[],聊天人用户2:[]  } 当前用户 与聊天人用户不为同一个id
            item[ receiveUid === userId ? sendUid : receiveUid ] = target;
        }

        // 判断当前消息是否已存在当前缓存了
        let filters = target.filter((item_0) => item_0.id === id)

        // 已经缓存了
        if (filters.length > 0) {
            // 如果缓存中已经存在这个好友的信息更新
            console.log(`txjl_cache push message 消息已经存在 正在更新原有消息 messageId = ${id}`)
            let condition = filters[0]
            condition.sendSuccess = sendSuccess
        } else {
            // 否则 添加到记录中

            target.push(
                new Record(id,
                    content,
                    sendTime,
                    status,
                    type ,
                    sendSuccess
                )
            )

            insertSuccess = true
        }
    } else {
        //如果 当前登陆用户 从未在当前游览器上登陆过
        items[userId] = {}
        items[userId][ receiveUid === userId ? sendUid : receiveUid ] = target
        target.push(new Record(id, content, sendTime, status, type,sendSuccess))
        insertSuccess = true
    }

    //修改纪录后进行排序 更新联系人顺序 只对当前登陆用户的缓存进行排序
    sortTxjl(target)

    // 聊天记录缓存暂时不 缓存到 store 因为数据量过大导致占用的内存过于庞大
    // 每次直接从本地缓存中获取

    //刷新本地缓存
    resetTxjl(items)
    return insertSuccess
}

export function updateMessageStatus(ids,firendId) {
    console.log("更新消息本地ack缓存ing")
    //用户id
    let userId = store.state.userInfo.id
    let items = getUserTxjl();
    let item = items[userId]
    ids.split(",").forEach(id => {

        let msg = item[firendId].filter(msg => msg.id === id)
        if (msg.length) {
            msg[0].status = 1
            if (msg.length !== 1) {
                console.log(`更新消息ack状态 找到 id 对应的消息但是找到多个 id = ${id}`)
            }
        }else {
            console.log(`更新消息ack状态 未找到消息id 对应本地缓存中的消息 更新id = ${id}`)
        }
    })
    resetTxjl(items)
}


export function getRecordByPage(startIndex,endIndex , firendId) {

    let items = getCurUserTxjlCache()
    let item = items[firendId]

    // 可能直接从 通讯录点进来没有消息记录 会不存在与这个联系人的聊天记录
    if (!item) {
        return []
    }



    if (endIndex > item.length) {
        endIndex = item.length
    }



    return item.slice(startIndex,endIndex) // slice endIndex 不包括这个索引
}

/**
 *  重置缓存的通讯录列表
 */
export function resetTxjl(items) {
    localStorage.setItem("userTxjl", JSON.stringify(items))
}

export function sortTxjl(items) {

    for (let i = 0; i < items.length; i++) {
        for (let x = i + 1; x < items.length; x++) {
            let i_item = items[i]
            let x_item = items[x]
            // 前者时间 小于 后者 时间 那么交换
            if (date(i_item, x_item)) {
                items[x] = i_item
                items[i] = x_item
            }
        }
    }
}

export function date(i_item, x_item) {


    return i_item.sendTime < x_item.sendTime;
}


// 获取 对应好友未读消息个数
export function getFirendUnAckMessageCount(firendId) {
    let items = getCurUserTxjlCache();
    if (!items) {
        items = {}
    }

    if (items[firendId]) {
        let item = items[firendId]
        let unAckMessageCount = item.filter(record => record.status === 0 && record.type === 0)

        return unAckMessageCount.length;
    } else {
        /**
            如果 消息记录存在 但是 呢 本地没有和这个联系人的纪录
            那么 出现的情况可能是
            比如我现在 在设备A 聊天 后面我切换到了设备B
            那么设备B没有该联系人的纪录
            但是获取到了  历史聊天记录
            这个时候 需要恢复纪录 这里采取异步的做法
            因为 h5 好像是无法 阻塞 UI 线程 加载视图的


            为了让ui线程停止被用户点击 在异步拉取到消息 缓存到 本地的时候 让 联系人页面处于抑制加载状态


            目前的做法 采取 一次性拉取 所有 这样有联系人纪录 没有本地缓存的 纪录 否则不好处理
         */
           // recoveryFirendRecord(firendId)
    }

    return -1
}



