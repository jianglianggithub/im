<template>
  <div>
    <van-nav-bar fixed placeholder :title="model.likeName" left-arrow @click-left="onClickLeft">
    </van-nav-bar>


    <van-pull-refresh   ref="refresh" :head-height="50" v-model="loading" @refresh="onRefresh">
      <div ref="wrapper" class="wrapper">
        <div v-for="item in record[model.firendId]" :key="item.id">
          <div>
            <img v-if="item.type === '0'" :src="model.image"/>
          </div>

          <div :class="[item.type === '1' ? 'you' : 'zuo']">

            <van-loading v-if="item.type === '1' && item.sendSuccess === 1"
                         size="18"
                         color="#1989fa"
                         type="spinner"/>

            <div class="content">{{ item.content }}</div>

            <van-loading v-if="item.type === '0'  && item.sendSuccess === 1"
                         size="18"
                         color="#1989fa"
                         type="spinner"/>


          </div>
          <div>
            <img v-if="item.type === '1'" :src="userInfo.image"/>
          </div>
        </div>
      </div>

    </van-pull-refresh>

    <tab-bar @call="call" @sendOk="sendOk" :model="model"/>
  </div>
</template>

<script>
import {NavBar} from "vant";
import TabBar from "./component/tabbar";
import {mapState} from "vuex";
import {getCurUserTxjlCache, sortTxjl, updateMessageStatus, getRecordByPage} from "@/utils/userInfo/txjl_cache.js";
import {ackMessage} from "@/utils/api";
import {PullRefresh} from "vant";
import {Loading} from 'vant';
import {uuid} from "@/utils/utils";
import Vue from "vue";
import {addTxjl} from "@/utils/userInfo/txjl_cache.js";
/**
 *  经过思考 聊天记录无法全部缓存在 store中 否则赵成比较严重的内存浪费
 *  当前策略。将受到的消息 全部缓存到 localstoreg
 *  监听路由发生改变 的时候 获取 对方的userId 从本地 存储中获取对应的纪录
 *  加载到 data :{ msg:{ userId :[],userID:[]  } }
 *  以这种方式缓存
 *  如果受到服务端的消息时候 更新本地缓存 并且 将消息缓存到store 中 然后watch store中的缓存发生改变的时候 也改变本地缓存
 */

export default {
  data() {
    return {
      startIndex: 0,
      endIndex: 10,

      // 分页是每个用户隔离的 否则会出现混乱的情况
      page: {},
      loading: false,
      // 聊天着信息
      model: {},
      /*
         record 结构

          {
              // 某个用户的消息 排序规则 是 sendTime 越大 index
              receiveUid:[
                  { 每一个消息 },
                  { 每一个消息 }
              ],
               receiveUid:[
                  { 每一个消息 },
                  { 每一个消息 }
              ]
         }
      */
      record: {},

      // 用于缓存 对应好友是否是 第一次点进来 因为如果 不是第一次点进来的话 会重复通过
      // beforeRouteEnter 导致多次加载问题
      init: {},
      show:false
    };
  },
  components: {
    [NavBar.name]: NavBar,
    TabBar,
    [PullRefresh.name]: PullRefresh,
    [Loading.name]: Loading,


  },
  props: {},
  // 这个比 直接监听route好  由于组件一直在有cache 导致route 不管到了哪个页面都在一直监听
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建

    next((vm) => {
      vm.model = {...to.query};
      // 每个好友进来只第一次加载 后续需要手动 下拉才刷新
      if (!vm.init[vm.model.firendId]) {
        vm.init[vm.model.firendId] = true
        vm.page[vm.model.firendId] = {startIndex: vm.startIndex, endIndex: vm.endIndex}
        // 渲染聊天记录
        vm.getCurUserData(vm.startIndex, vm.endIndex)

      }

    });


  },

  watch: {
    unReadMsgEvent: function (msg) {
      console.log("收到联系人消息 发生改变了", msg);
      // 重置 联系人页面
      this.$store.commit("resetLxrPageCache")

      this.resetCurPageView(msg, msg.sendUid);

    },

    // 回调成功后 将localStorege 中 该id 的消息 变为 回调成功
    // 缓存中也是
    notifySendMessageAck: function ({messageId, firendId}, oldV) {

      setTimeout(() => {
        console.log(`messageId = ${messageId}  firendId = ${firendId} 发送成功 回调`)
        let items = this.record[firendId]
        if (items) {
          let filter = items.filter(item => item.id === messageId)
          if (filter.length) {
            let condition = filter[0]
            console.log(`找到ack message  = ${condition}`)
            condition.sendSuccess = 2;
            // 修改本地缓存
            addTxjl(condition)
          }
        } else {
          console.log(`ackSendMessage 缓存中信息不存在无法更新`)
        }
      }, 500)

    }
  },
  computed: {
    ...mapState(["userInfo", "unReadMsgEvent", "notifySendMessageAck"]),
  },
  methods: {
    call() {

      // 修改为拨打状态
      this.$store.commit("updateCallState",1)
      // 更改为拨打状态弹出 拨打页面
      this.$store.commit("call",{toUser:this.model})

      // 缓存拨打的用户信息
      //this.$store.commit("callUserInfo",{...this.model})

    },
    resetCurPageView(msg, firendId) {
      //NULL 值处理未做。

      this.record[firendId] = [...this.record[firendId], msg]
      //see 上面
      ++this.page[firendId].startIndex

      // 让vue感知到变化
      this.resetRecordView();
      // 当页面渲染后在设置 否则 滚动条还没变你设置的是 添加元素之前的 所以没用
      this.$nextTick(() => {
        document.documentElement.scrollTop = document.documentElement.scrollHeight
      });
    },
    /* 解决 发送消息 显示问题

      当发送消息后。由于 startIndex 和 endIndex 实际发生了改变。
      但是 这里没有改变会出现 发送消息后 再次下拉刷新 会有意想不到的问题。


    * */
    sendOk(msg) {
      console.log("sendOK")
      let firendId = this.model.firendId;
      this.resetCurPageView(msg, firendId);

    },
    // 刷新视图
    resetRecordView() {
      this.record = JSON.parse(JSON.stringify(this.record))
    },
    onRefresh() {
      setTimeout(() => {
        this.getCurUserData(
            this.page[this.model.firendId].startIndex,
            this.page[this.model.firendId].endIndex
        )
        this.loading = false;
      }, 300)
    },
    onClickLeft() {
      this.$router.back(1);
    },

    // 获取当前用户的聊天数据
    getCurUserData(startIndex, endIndex) {
      this.model = {...this.$route.query};


      let friendId = this.model.firendId;
      // 存的是 index 越小 消息的sendTime 越大
      let pageCache = getRecordByPage(startIndex, endIndex, friendId).reverse();
      console.log("pageCache = ",pageCache,`startIndex = ${startIndex} endIndex = ${endIndex}  friendId = ${friendId}`)


      this.page[friendId].startIndex += pageCache.length
      this.page[friendId].endIndex += pageCache.length

      // 拿到本地缓存的好友聊天记录
      let tmp;
      if (this.record[friendId]) {
        tmp = [...pageCache, ...this.record[friendId]];
      } else {
        tmp = pageCache
      }
      // 对消息记录进行排序
      //sortTxjl(tmp);

      //reset
      this.record[friendId] = tmp;

      this.resetRecordView();
      this.ackMessage(pageCache)

    },
    //  将当前用户 与这个联系人的消息 本地的纪录 全部设为 已读
    ackMessage(msgs) {
      console.log("等待ackMeesage 的消息",msgs)
      let ids = msgs
                  .filter(msg => !msg.status && msg.type === "0")
                  .map(msg => msg.id)
                  .join()

      if (!ids) {
        return
      }
      console.log("等待ackMeesage 的消息 ids",ids)
      // 更新成功后 将本地local 缓存设置ack = 1
      if (ackMessage(ids)) {
        updateMessageStatus(ids, this.model.firendId)
      }
    }
  },
  created() {


  },
  mounted() {
    let pull = this.$refs.refresh
    let node = pull.$el;
    let w = window.innerWidth
    let h = window.innerHeight
    node.style.height = (h -100) +"px"




  },
};
</script>

<style lang="less" scoped>
.wrapper {
  overflow-y: auto;

  .test {
    width: 100px;
  }

  > div {
    margin-bottom: 5px;
    font-size: 14px;
    display: flex;

    > div {
      > img {
        width: 0.5rem;
        height: 0.5rem;
      }
    }

    > div:nth-of-type(1) {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 20%;
    }

    .you {
      justify-content: flex-end;
      align-items: center;
      position: relative;

      > .content {
        border-radius: 8px;
        border: 1px solid #989898;
        box-shadow: -2px 2px 5px #ccc;
        background: -webkit-gradient(linear,
        50% 0%,
        50% 100%,
        from(#e4ffa7),
        color-stop(0.1, #bced50),
        color-stop(0.4, #aed943),
        color-stop(0.8, #a7d143),
        to(#99bf40));
      }
    }

    .you::before {
      content: "";
      position: absolute;
      right: -12px;
      width: 0;
      height: 0;
      border: 6px solid;
      border-color: transparent transparent transparent #bced50;
      z-index: 1;
    }

    .you::after {
      content: "";
      position: absolute;
      right: -14px;

      width: 0;
      height: 0;
      border: 7px solid;
      z-index: 0;
      border-color: transparent transparent transparent #989898;
    }

    .zuo {
      position: relative;
      align-items: center;

      > .content {
        border-radius: 8px;
        border: 1px solid #989898;
        background: -webkit-gradient(linear,
        50% 0%,
        50% 100%,
        from(#ffffff),
        color-stop(0.1, #eae8e8),
        color-stop(0.4, #e3e3e3),
        color-stop(0.8, #dfdfdf),
        to(#d9d9d9));
        box-shadow: 2px 2px 2px #cccccc;
      }
    }

    .zuo::before {
      content: "";
      position: absolute;
      left: -12px;
      width: 0;
      height: 0;
      top: 30%;
      border: 6px solid;
      border-color: transparent #e3e3e3 transparent transparent;
      z-index: 1;
    }

    .zuo::after {
      content: "";
      position: absolute;
      left: -14px;
      top: 30%;
      width: 0;
      height: 0;
      border: 7px solid;
      z-index: 0;
      border-color: transparent #989898 transparent transparent;
    }

    > div:nth-of-type(2) {
      letter-spacing: 1px;

      > div {
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 7px;
        padding-right: 7px;
      }

      display: flex;
      border-radius: 5px;
      flex: 1;
    }

    > div:nth-of-type(3) {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 20%;
    }
  }
}

</style>
