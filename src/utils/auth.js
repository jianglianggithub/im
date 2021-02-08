const TokenKey = "token"

export function getToken() {
    return localStorage.getItem(TokenKey)
}

export function setToken(token) {
    localStorage.setItem(TokenKey, "Bearer " + token)
}

export function setUserInfo(userinfo) {
    localStorage.setItem("userInfo", JSON.stringify(userinfo))
}
export function getUserInfo() {
    let userInfo = localStorage.getItem("userInfo")
    if (userInfo) {
        return JSON.parse(userInfo)
    }
    return {}
}

export function removeToken() {
    localStorage.removeItem(TokenKey)
}
