import axios from "axios"


import {getToken,removeToken} from "./auth"
import { Toast } from "vant"

const service = axios.create({
    baseURL: "http://127.0.0.1:17770", // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 50000, // request timeout
})


// request interceptor
service.interceptors.request.use(
    (config) => {
        let token = getToken()
        if (token) {
            config.headers["Authorization"] = token
        }
        return config
    },
    (error) => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    (response) => {
        const res = response.data



        if (res.code !== 0) {
            if (res.code === 401) {
                console.log("401 了")
                removeToken()
                location.reload()
            } else {

                Toast(res.message)
                return Promise.reject(new Error(res.message || "Error"))
            }
        } else {
            return res
        }
    },
    // 这个是处理http响应头不为200  ， 但是后端一般返回都是200 而是通过code指定 所以这个地方没啥用
    (error) => {
        return Promise.reject(error)
    }
)

export default service
