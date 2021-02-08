<template>
    <div class="wrapper" ref="wrapper">
      <div class="top">
        <video ref="remote" autoplay  ></video>
        <video ref="local" autoplay  ></video>
      </div>

      <div class="botton">
        <div @click="closeCall">
          <i class="iconfont icon-dianhua"></i>
        </div>

      </div>
    </div>
</template>

<script>
import {getFriends} from "@/utils/userInfo/lxr_cache";

let kurentoUtils = require('kurento-utils');
console.log("kurentoUtils",kurentoUtils)
import { getUserInfo } from "@/utils/auth.js"
import {sendWebRtcMessage} from "@/utils/api"
import WebRtcEventType,{  getInit,options } from "@/utils/webrtc"
import {mapState} from "vuex";

export default {
  name: "call",
  data() {

    return {
      webRtcPeer:null,
      toUser:null
    }
  },
  mounted() {
    let call = this.$refs.wrapper

    let w = window.innerWidth
    let h = window.innerHeight
    call.style.height = (h - h * 0.1) +"px";
    call.style.width = (w - w * 0.1) + "px";

  },
  watch:{
    answer: function (newVal) {
      // 如果
      if (!this.webRtcPeer || !this.toUser) {
        this.$msg("收到Answer 但是 会话已经中断？")
        return
      }

      console.log("收到answer",newVal)
      this.webRtcPeer.processAnswer(newVal,(error) => {

        if (error) {
          console.log("收到answer erro",error)
        }

      })
    },
    icecandidate: function (newVal) {
      console.log("收到服务端icecandidate事件",newVal)

        this.webRtcPeer.addIceCandidate(JSON.parse(newVal),function (error)  {
          if (error) {
            console.log("处理icecandidate 失败",error)
          }
        })


    }
  },
  computed: {
    ...mapState(["callState","preCall","answer","icecandidate"]),
  },
  methods:{

    // 关闭拨打电话页面
    // 将 webRtcPeer 释放
    // 给服务端发送请求发送Close 事件 通知对方 也将webRtcPeer 也close
    closeCall() {
      let wrapper = this.preCall;
      wrapper.eventType = WebRtcEventType.WebRtcEventType_5;

      this.$store.state.close = {}

      console.log("closeCall wrapper",wrapper)

      sendWebRtcMessage(wrapper)
    },
    close() {
      this.webRtcPeer.dispose();
      this.webRtcPeer = null
      this.toUser = null
    },
  //  主动拨打时 发起
    init(toUser) {
      if (!toUser) {
        this.$msg("拨打用户为NULL",toUser)
        return
      }
      if (this.toUser) {
        this.$msg("拨打或者接听中 无法发起电话拨打 toUser 为 真")
        return;
      }

      this.toUser = toUser

      let ops = this.getOps()
      this.initPeer(ops,this.doOffer)
    },
    // 默认参数
    getOps() {
        return options(
            this.$refs.remote,
            this.$refs.local,
            this.onIceCandidate,
            this.oncandidategatheringdone,
            this.onMessage,
            this.onOpen,
            this.onbufferedamountlow,
            this.onClosed,
            this.onerror
        )

    },
    onMessage(){
      console.log("onMessage 收到消息",arguments)
    },
    onOpen(){
      console.log("onOpen dateChannel 打开了",arguments)
    },
    onbufferedamountlow(){
      console.log("onbufferedamountlow",arguments)
    },
    onClosed(){
      console.log("onClosed",arguments)
    },
    onerror(){
      console.log("onerror",arguments)
    },

    initPeer(ops,callback) {
      console.log("发起initPeer 开始 ",ops,callback)
      this.webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(ops,
          (error) => {

            if (error) {
              this.$msg(JSON.stringify(error))
              return
            }
            this.webRtcPeer.generateOffer(callback)

          } );

    },

    /**
     *  当sdp 创建好后 发起视频聊天
     */
    doOffer(error, offerSdp) {
      console.log("doOffer",error,offerSdp)
      if (error) {
        this.$msg(JSON.stringify(error))
        return
      }

      let wrapper = getInit()
      wrapper.eventType = WebRtcEventType.WebRtcEventType_3;
      wrapper.sdp = offerSdp
      wrapper.action.eventType = WebRtcEventType.WebRtcActionEventType_1
      let userInfo = getUserInfo();
      console.log("getUserinfo",userInfo)
      if (!userInfo || !userInfo.id) {
        this.$msg("getUserInfo id 为null 无法 发起聊天")
        return
      }
      wrapper.action.from = userInfo.id
      wrapper.action.to = this.toUser.id

      // 因为拨打方 没有percall 如果不设置的话 在 close 为拨打方主动close 的话 会存在 NULL Point
      this.$store.commit("preCall",wrapper)
      console.log("发起视频聊天data",wrapper)
      sendWebRtcMessage(wrapper)

    },
    onIceCandidate(candidate) {
      console.log("icecandidate 准备好了 ",candidate)
      let wrapper = getInit()
      wrapper.eventType = WebRtcEventType.WebRtcEventType_4;
      wrapper.iceCondidate = candidate

      sendWebRtcMessage(wrapper)
    },

    //  每个 webrtc peer 的icecandidate 不只有一个会有多个。
    oncandidategatheringdone() {
      console.log("当前用户ICE candidate 全部准备完毕")
    },


    // 被动拨打时发起
    passive() {
      let fromCallUserId = this.preCall.action.from
      let ops = this.getOps()
      let items =getFriends()
      let callUserInfo = items[fromCallUserId]

      if (!callUserInfo) {
        this.$msg("拨打用户信息未找到无法接听来电")
        return
      }
      this.toUser = callUserInfo
      this.initPeer(ops,this.doAnswer)
    },
    // 允许接听 其实接听也是创建 offer 之所以分开是 怕后面改来改去 直接裂开
    doAnswer(error, offerSdp) {

      if (error) {
        this.$msg(JSON.stringify(error))
        return
      }
      // 该缓存是在 接收到 用户拨打时候 set 到 store 的
      let wrapper = this.preCall
      wrapper.sdp = offerSdp
      wrapper.action.eventType = WebRtcEventType.WebRtcActionEventType_2
      wrapper.action.allow = true
      console.log("接听聊天返回服务端数据",wrapper)
      sendWebRtcMessage(wrapper)


    }
  }
}
</script>

<style lang="less" scoped>
  .wrapper {

      background: #202126;
    > .top {
      width: 100%;
      height: 70%;
      position: relative;
      > video:nth-of-type(1) {
        object-fit:fill;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #9a6e3a;
      }

      > video:nth-of-type(2) {
        object-fit:fill;
        position: absolute;
        left: 0;
        width: 30%;
        height: 30%;
        background: #63a35c;
      }
    }
    > .botton {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 30%;
      > div {
        display: flex;
        justify-content: center;
        align-items: center;
        > i {
          font-size: 25px;
        }

        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #b33d3d;
      }
    }
  }
</style>
