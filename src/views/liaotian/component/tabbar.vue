<template>
  <div class="wrapper">
      <div @click="$emit('call')"><i class="iconfont icon-luyin"></i></div>
      <div>

          <input type="text" v-model="message" />


      </div>
      <div>
        <div>
          <i class="iconfont icon-biaoqing"></i>
        </div>
        <div>
          <van-button @click="dianji" type="primary" size="mini">发送</van-button>
        </div>
      </div>
  </div>
</template>

<script>
import { Button } from 'vant';
import { Field } from 'vant';
import { addTxjl } from "@/utils/userInfo/txjl_cache";
import { uuid } from "@/utils/utils";
import { mapState } from "vuex";
import { sendMsg } from "@/utils/api";

export default {
  name: "tabbar",
  data() {


    return {
      message:""
    }
  },
  props:{
    model:{
      type:Object,
      default:{}
    }
  },
  methods:{
    dianji() {
      let message = this.message

      if (!message) {
        return
      }
      console.log("userinfo ",this.userInfo)
      let firendId = this.model.firendId;
      let msg = {
        id:uuid(),
        content:message,
        sendTime: new Date().getTime(),
        status: 0,
        sendUid:this.userInfo.id,
        receiveUid:firendId,
        type:"1",
        sendSuccess : 1
      };


      let sendState = sendMsg(msg.content,msg.receiveUid,msg.sendTime,msg.id);
      // 发送失败将 状态改为发送失败
      if (!sendState) {
        msg.sendSuccess = 4
      }

      console.log(`消息发送${sendState ? "√成功" :"×失败"} sendState = ${sendState}`,msg)
      addTxjl(msg)

      this.$emit("sendOk",msg,sendState)
    }
  },
  components:{
    [Field.name]:Field,
    [Button.name]:Button
  },
  computed:{
    ...mapState(["userInfo"])
  }
}
</script>

<style lang="less" scoped>
  .wrapper {
    height: 50px;
    display: flex;
    background: #e7e7e7;
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    align-items: center;

    > div:nth-of-type(1) {
      width: 10%;
      display: flex;
      justify-content: center;
    }
    > div:nth-of-type(2) {
      flex: 1;
      display: flex;
      justify-content: center;

      > input {
        height: 30px;
        width: 100%;
        border: #f6f6f6 1px solid;
      }
    }
    > div:nth-of-type(3) {
      display: flex;
      width: 25%;
      align-items: center;
      > div {
        display: flex;
        justify-content: space-around;
        width: 45%;

      }
    }
  }
  i {
    font-size: 25px;
  }
</style>
