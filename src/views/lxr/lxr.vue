<template>
  <div>
    <van-nav-bar title="联系人" left-text=""></van-nav-bar>

    <van-pull-refresh
        v-if="userLxrCache && !lxrPageIsLoading"
        class="scrol"
        v-model="isLoading"
        @refresh="onRefresh"
    >
      <item :list="userLxrCache"></item>
    </van-pull-refresh>
  </div>
</template>


<script>

/**
 联系人这块 需要实现小红点 采用被动式 触发
 组件实例化的时候 向服务端 获取  最新的凡是有聊天记录的联系人
 并 在 client 端 的txjlCache 中 获取对应的联系人 的缓存对应未 ack的消息总数
 这个数 就可以 做未读消息 的 个数

 做法  每次点击 联系人 就 去做一遍 本地cache遍历 更新 unReadAckMessageCount 到每一个item中

 因为 如果收到 消息首先也是写入到 localStoreg 中
 这样每次点击的时候 就遍历一次即可



 联系人列表要 动态 的更新
 基于store 的 监听机制实现
 如果发送消息  和接收到消息后重新刷新 userLxrCache 列表
 */

import {initWebSocket} from "@/utils/websocket.js";
import {PullRefresh} from "vant";
import item from "./component/item";
import {NavBar} from "vant";
import {getCurUserContactsCache} from "@/utils/userInfo/lxr_cache.js"

import {addContacts} from "@/utils/userInfo/lxr_cache.js";
import {mapState} from "vuex";
import {getFirendUnAckMessageCount} from "@/utils/userInfo/txjl_cache";
import {recoveryFirendRecord} from "@/utils/api";

export default {
  name: "lxr",
  data() {
    return {
      isLoading: false,
      userLxrCache: null
    };
  },
  components: {
    [NavBar.name]: NavBar,
    [PullRefresh.name]: PullRefresh,
    item,
  },
  props: {},
  watch: {

    lxrPageIsLoading(newVal, oldVal) {
      if (newVal) {
        this.loading = this.$msg.loading({
          duration: 0,
          message: "消息恢复中···",
          forbidClick: true
        })
      } else {
        console.log("colse ", this.loading)
        // close
        if (this.loading) {
          this.$msg.clear(this.loading)
        }
      }
    },
    resetLxrPageCache: function (newVal) {
      console.log("resetLxrPageCache 重设联系人列表")
      this.initLxr();
    }
  },

  beforeRouteEnter(to, from, next) {


    next((vm) => {
      vm.initLxr()

    });


  },

  computed: {
    ...mapState(["lxrPageIsLoading", "resetLxrPageCache"])
  },
  methods: {
    async onRefresh() {
      this.initLxr()
      this.isLoading = false;
      this.$msg("刷新成功");

    },

    // 初始化联系人列表
    initLxr() {
      // //console.log("开始初始化联系人列表");
      // let data = await this.$http.get(
      //     "/httpServer/user/getFriendsAndRecord"
      // );
      // let lxrs = data.data;
      //
      // //console.log(data);
      // lxrs.forEach((lxr) => {
      //     //console.log("初始化联系人列表后 刷新本地缓存中", lxr);
      //     // 缓存到localstore
      //
      //     addContacts({
      //       firendId: lxr.firendId,
      //       likeName: lxr.likeName,
      //         image: lxr.image,
      //         lastMsg: lxr.lastMsg,
      //         lastTime: lxr.lastTime,
      //     });
      // });


      // 获取本地缓存 然后 扩展未读消息字段
      let userLxrCache = getCurUserContactsCache()

      console.log("userLxrCache  initLxr  初始化联系人列表", userLxrCache)

      // 等待拉取好友纪录items
      // let items = []

      // 获取txjlcache 中 对应好友 未读消息个数 添加未读消息字段
      // userLxrCache.forEach(item => {
      //   let firendId = item.firendId;
      //   let unAckMessageCount = getFirendUnAckMessageCount(firendId)
      //   if (unAckMessageCount !== -1) {
      //     item.unAckMessageCount = unAckMessageCount;
      //   }
      //   // -1 代表对应的消息不存在
      //   else {
      //     items.push(firendId)
      //   }
      //
      // })


      /*
      *   这一步是判断哪些有聊天记录的好友但是 本地没有聊天记录 那么从服务端恢复到本地
      *
      * */
      // if (items.length) {
      //   // 显示加载层 禁止用户点击页面
      //   this.$store.state.lxrPageIsLoading = true
      //   setTimeout(() => {
      //     let firends = items.join()
      //     //像服务端拉取
      //     recoveryFirendRecord(firends)
      //   }, 2000)
      //
      // }


      this.userLxrCache = userLxrCache
    },
  },
  created() {

  },
  mounted() {
  },
};
</script>

<style scoped>
.scrol {
  overflow: visible;
}
</style>
