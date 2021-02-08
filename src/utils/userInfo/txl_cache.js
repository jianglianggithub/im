/**
 *  通讯录缓存   通讯录当前 还没有缓存
 */

import { getToken } from "@/utils/auth.js"

class Friend {
    id
    imgurl
    name
    lastMsg
    constructor(id, imgurl, name, lastMsg) {
        this.id = id
        this.imgurl = imgurl
        this.name = name
        this.lastMsg = lastMsg
    }
}

/**
 *  获取用户缓存的 好友列表
 *
 *  缓存列表格式处理  因为一个游览器下可能登陆不同的账号这个得考虑进去
 * { userId:[],userId:[] }
 */
export function getUserFirends() {
    try {
        let items = JSON.parse(localStorage.getItem("userFirends"))
        if (!items) {
            return {}
        }
        return items
    } catch (e) {
        return {}
    }
}

/**
 * 添加通讯录到 localStorage
 */
export function addFirend(obj) {

    resetFirends(obj)

}

/**
 *  重置缓存的联系人列表
 */
export function resetFirends(items) {
    localStorage.setItem("userFirends", JSON.stringify(items))
}

// function sort(items) {
//     for(let i = 0; i < items.length; i++) {
//         let item = items[i]
//         for(let y = i + 1; y < items.length; y++) {
//             let item_last = items[y]
//             if (item.id > item_last.id) {
//                 items[i] = item_last;
//                 items[y] = item;
//             }
//         }
//     }
// }
