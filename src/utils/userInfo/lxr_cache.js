/**
 *  联系人 缓存
 *  现在 联系人 暂时不重服务器端获取  消息记录缓存在 客户端本地
 *  类似于 微信 的 app 端逻辑 后续有机会在 加一个 从服务端获取聊天记录缓存。
 *
 *
 *
 *
 *  联系人 列表 现在去除。我发现 多维护一个数据结构 跟其他关联 会照成 很多麻烦的开销。
 *  数据之间同步也比较麻烦不堪。现在 将 聊天记录 txjl_cache.js 作为 通讯录的基础 数据 通过 func 格式化。
 *
 */

import { getToken } from "@/utils/auth.js"
import store from "@/store"
import { getUserInfo } from "@/utils/auth.js"
// 联系人列表item
class Contacts {
    // 好友基础信息

    firendId; //id默认为好友的id 每次登陆后 都会请求后端init 一次 好友列表
    likeName;
    image;
    lastMsg;

    // 扩展信息 纪录顺序等等

    lastTime // 发送最后一次消息时间

    constructor(firendId, likeName, image, lastMsg, lastTime) {
        this.firendId = firendId
        this.likeName = likeName
        this.image = image

        this.lastMsg = lastMsg
        this.lastTime = lastTime
    }
}

/**
 *  获取用户缓存的 联系人
 *
 *  缓存列表格式处理  因为一个游览器下可能登陆不同的账号这个得考虑进去
 * { userId:{},userId:{}}
 */
export function getUserContacts() {
    try {
        let items = JSON.parse(localStorage.getItem("userContacts"))
        if(!items) {
            return {}
        }
        return items
    } catch (e) {
        return {}
    }
}
import {getCurUserTxjlCache} from "@/utils/userInfo/txjl_cache"
import item from "@/views/lxr/component/item";
import  { getUserFirends } from "@/utils/userInfo/txl_cache"
// 获取用户联系人列表 通过遍历 通讯记录实现
export function getCurUserContactsCache() {

    // let items = getUserContacts();
    // try {
    //     //用户id
    //     let userId = store.state.userInfo.id
    //
    //     return items[userId];
    // } catch (e) {
    //     // 如果 store中没缓存 直接从localstore中获取
    //     return items[getUserInfo().id];
    // }


    let friends = getFriends()

    let items = getCurUserTxjlCache()
    if (!items) {
        items = {}
    }
    let result = []
    Object.keys(items).forEach(key => {
        let item = items[key] //array
        let maxSendTimeItem = item[0]
        let friendInfo = friends[key]
        maxSendTimeItem = {
            ...friendInfo,
            firendId : friendInfo.id,
            lastMsg: maxSendTimeItem.content,
            lastTime: maxSendTimeItem.sendTime
        }
        result.push(maxSendTimeItem)
    })

    return result
}

export function getFriends() {
    let friends = getUserFirends().result
    let rs = []
    Object.keys(friends).forEach(key => {
        rs = [...rs , ...friends[key]]
    })
    let result = {}
    rs.forEach(item => {
        let firendId = item.userFirends.firendId
        let firendInfo = item.userInfo
        result[firendId] = firendInfo
    })
    return result
}
/**
 * 添加联系人 好友 到 localStorage
 */
export function addContacts({ firendId, likeName, image, lastMsg, lastTime }) {
    //用户id
    let userId = store.state.userInfo.id

    let items = getUserContacts()
    //console.log(items)
    // 已缓存用户信息
    if (items[userId]) {
        // 用户好友列表 信息
        let item = items[userId]
        let filters = item.filter((item_0) => item_0.firendId === firendId)
        if (filters.length > 0) {
            // 如果缓存中已经存在这个好友的信息更新
            let old = filters[0]
            old.firendId = firendId
            old.likeName = likeName
            old.image = image
            old.lastMsg = lastMsg
            old.lastTime = lastTime
        } else {
            // 否则 刷新
            item.push(new Contacts(firendId, likeName, image, lastMsg, lastTime))
        }
    } else {
        //如果 当前登陆用户 从未在当前游览器上登陆过
        items[userId] = []
        items[userId].push(new Contacts(firendId, likeName, image, lastMsg, lastTime))
    }

    //修改纪录后进行排序 更新联系人顺序 只对当前登陆用户的缓存进行排序
    sortContacts(items[userId])
    //刷新 内存中的联系人缓存 以便Vue reView
    // store.commit("updateLxrCache", items[userId])
    //刷新本地缓存
    resetContacts(items)

    return items
}

// 对联系人 的 发送最后一次消息时间排序
export function sortContacts(items) {
    for (let i = 0; i < items.length; i++) {
        for (let y = i + 1; y < items.length; y++) {
            let i_item = items[i]
            let y_item = items[y]

            // 后者时间 大于前者时间 代表 发送消息时间 距离当前时间越小 排序应该越排在前面
            if (date(i_item.lastTime, y_item.lastTime)) {
                items[i] = y_item
                items[y] = i_item
            }
        }
    }
}

/**
 *  重置缓存的通讯录列表
 */
export function resetContacts(items) {
    localStorage.setItem("userContacts", JSON.stringify(items))
}

/**
 *  比较日期大小  date1 > date2 retrun true
 */
export function date(date1, date2) {
    return date1 > date2

}
