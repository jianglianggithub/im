<template>
  <div class="wrapper">
      <div v-if="model">
        <div>
          <img style="width: 30px;height: 30px" :src="model.image" />
        </div>
        <div>
          {{model.likeName}}
        </div>
        <div>
          <van-button :size="'small'" @click="callee(1)" type="primary">接听</van-button>
          <van-button :size="'small'" @click="callee(0)" type="danger">取消</van-button>
        </div>
      </div>
  </div>
</template>

<script>
import { Button } from 'vant';
import  { getFriends } from "@/utils/userInfo/lxr_cache"
import WebRtcEventType from "@/utils/webrtc";
import {sendWebRtcMessage} from "@/utils/api";
export default {
  name: "precall",
  data() {
    return {
      model:null,
      callUserId: null
    }
  },
  components:{
    [Button.name]:Button
  },
  methods:{
    close() {
      this.model = null
      this.callUserId = null
    },
    // 弹出下拉 选择框后 渲染 拨打方用户信息
    init(model) {
      // 查询 拨打用户id的好友信息
      console.log("收到请求拨打电话 callWrapper = ",model)
      let callUserId = model.action.from;

      let items =getFriends()
      let callUserInfo = items[callUserId]
      if (!callUserInfo) {
        this.$msg("拨打用户信息未找到无法接听来电")
        return
      }

      this.callUserId = callUserId
      this.model = callUserInfo

    },
    callee(p) {
      if (p) {
        // 同意之后 关闭 preCall 窗口 开启 call窗口
        this.$store.commit("call",{})

      } else {
        // 回复拨打方拒绝接听消息
        // 该缓存是在 接收到 用户拨打时候 set 到 store 的
        let wrapper = this.preCall
        wrapper.action.eventType = WebRtcEventType.WebRtcActionEventType_2
        wrapper.action.allow = false
        console.log("【拒绝接听聊天】返回服务端数据",wrapper)
        sendWebRtcMessage(wrapper)
        // 刷新事件
        this.$store.state.close = {}

      }
    }
  }
}
</script>

<style lang="less" scoped>
  .wrapper {
    background: #202126;
    width: 100%;
    height: 100%;

    > div {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      > div {
        width: 100%;
        text-align: center;
      }
      >div:nth-of-type(2) {
        color: #fffdef;
        font-size: 14px;
      }

      >div:nth-of-type(3) {
        width: 40%;
        display: flex;
        justify-content: space-around;
      }
    }
  }
</style>
