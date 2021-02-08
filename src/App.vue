<template>
    <div id="app">
        <keep-alive>
            <router-view />
        </keep-alive>

      <!-- 拨打页面  -->
        <van-popup  v-model:show="show" round :lazy-render="false">
          <call ref="call"></call>
        </van-popup>

      <!--  预拨打 等待同意还是拒绝   top 下拉界面 -->
      <van-popup v-model:show="preShow" position="top" :style="{ height: '20%' }" :lazy-render="false" >
        <pre-call ref="preCall"/>
      </van-popup>

    </div>
</template>

<script>
import {mapState} from "vuex";
import { Popup } from 'vant';
import PreCall from "@/views/liaotian/component/precall"
 import Call from "@/views/liaotian/component/call"
  export  default  {
    name:"app",
    components:{
      Call,
      [Popup.name]:Popup,
      PreCall
    },
    watch: {
      // 拒绝接听,关闭接听 释放资源
      close: function(newVal) {

        this.preShow = false;
        this.show = false;
        this.$store.call = "close"
        this.$store.preCall = "close"
        this.$store.callState = 0
        this.$store.answer = ""

        this.$refs.preCall.close()
        this.$refs.call.close()
      },
      call: function (newVal) {
        if (newVal === "close") {
          return
        }
        console.log("call 开始拨打电话了 newVal =",newVal)
        this.preShow = false
        this.show = true

        // 如果是1 代表主动拨打
        if (this.callState === 1) {
          this.$refs.call.init(newVal.toUser)
        }
        // 如果是2 代表接听其他用户拨打 后 弹出下拉选择框后 点击了同意拨打
        else if (this.callState === 2) {
          this.$refs.call.passive()
        }

      },
      preCall: function (newVal) {
        if (newVal === "close" || this.callState === 1 ) {
          return
        }
        console.log("当前用户被人拨打电话")

        this.preShow = true;
        this.show = false;
        this.$refs.preCall.init(newVal)
      }
    },
    computed: {
      ...mapState(["call","preCall","callState","close"]),
    },
    data() {
      return {
        preShow: false,
        show:false
      }
    }
  }
</script>
<style>
* {
    margin: 0;
    padding: 0;
}
body,html{
  height:100%;
  width:100%;
}
body {
    box-sizing: border-box;
    background: #f4f4f4;
}
</style>
