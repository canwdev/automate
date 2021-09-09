<template>
  <b-container class="logs">

    <b-row align-h="between">
      <b-col cols="auto">
        <b-button-group size="sm">
          <router-link class="btn btn-secondary" to="/logs">
            <b-icon icon="arrow-left"></b-icon>
            返回日志列表
          </router-link>

          <template v-if="isRaw">
            <b-button variant="info" @click.prevent="viewRaw(false)" class="mr-2">
              <b-icon icon="arrow90deg-left"></b-icon>
            </b-button>
          </template>
          <template v-else>
            <b-button variant="info" @click.prevent="viewRaw()">源文件</b-button>
          </template>
        </b-button-group>
      </b-col>
      <b-col cols="auto"><h4>📜 日志详情</h4></b-col>
      <b-col cols="auto">
        <b-button-group size="sm">
          <b-button @click="refreshNow">
            <b-icon icon="arrow-repeat"></b-icon>
            刷新
          </b-button>
          <b-button variant="info" v-if="itAutoRefresh" @click="disableAutoRefresh">
            <b-icon icon="pause-fill"></b-icon>
            停止自动刷新
          </b-button>
          <b-button variant="warning" v-else @click="enableAutoRefresh">
            <b-icon icon="play-fill"></b-icon>
            开启自动刷新
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <b-container class="mt-3 mb-2">
      <b-row>
        <b-col>构建状态：{{ BuildStatusText[buildItem.buildStatus] }}</b-col>
        <b-col>id：{{ buildItem.id }}</b-col>
        <b-col>创建时间：{{ formatTime(buildItem.timestamp) }}</b-col>
      </b-row>
      <b-row>
        <b-col>命令：{{ buildItem.command }}</b-col>
        <b-col>分支：{{ buildItem.branch || '-' }}</b-col>
        <b-col>消息：<b-link v-if="buildItem.message" @click.prevent="viewMessage(buildItem)">点击查看</b-link>
          <span v-else>-</span>
        </b-col>
      </b-row>
      <b-row>
        <b-col>日志名称：{{ buildItem.logName }}</b-col>
      </b-row>
    </b-container>

    <b-progress v-if="itAutoRefresh" :max="100" :variant="itAutoRefresh ? 'info':'warning'" show-progress :animated="Boolean(itAutoRefresh)">
      <b-progress-bar :value="100">
        <div v-if="itAutoRefresh">日志 <span id='sec'>{{ refreshMs / 1000 }}</span>s 刷新一次</div>
        <div v-else>刷新已停止</div>
      </b-progress-bar>

    </b-progress>

    <div class="log-content">
      <transition name="fade">
        <b-spinner class="loading-img" small v-show="isLoading" variant="primary"></b-spinner>
      </transition>
      <b-form-textarea
        rows="3"
        max-rows="9999"
        :value="logTxt"
        placeholder="日志为空，可能是任务还没有开始执行"
        readonly
      ></b-form-textarea>

    </div>

  </b-container>
</template>

<script>
import {getBuildDetail} from '@/api/projects'
import autoRefreshMixin from '@/mixins/auto-refresh-mixin'
import moment from "moment"
import {
  BuildStatusText,
  isItemDone
} from '@/enum'

export default {
  name: "BuildDetail",
  mixins: [autoRefreshMixin],
  data() {
    return {
      logTxt: null,
      buildItem: {},
      isLoading: false,
      BuildStatusText
    }
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    isRaw() {
      return this.$route.query.isRaw
    }
  },
  watch: {
    isRaw: {
      handler(val) {
        if (val) {
          this.pauseAutoRefresh()
          this.getBuildDetail()
        } else {
          this.refreshNow()
        }
      },
      immediate: true
    }
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    },
    async getBuildDetail() {
      this.isLoading = true
      try {
        const res = await getBuildDetail({
          id: this.id,
          raw: this.isRaw
        })
        const {item, logTxt} = res
        this.buildItem = item || {}
        this.logTxt = logTxt
        this.erroredTimes = 0

        if (isItemDone(item)) {
          this.disableAutoRefresh()
        }
      } catch (e) {
        console.error(e)
        this.erroredTimes++
      } finally {
        setTimeout(() => {
          this.isLoading = false
        }, 500)
      }
    },
    fnRefresh() {
      this.getBuildDetail()
    },
    viewRaw(isRaw = true) {
      const query = {...this.$route.query}
      if (isRaw) {
        query.isRaw = true
      } else {
        delete query.isRaw
      }

      this.$router.push({
        name: this.$route.name,
        params: this.$route.params,
        query
      })
    },
    viewMessage(item) {
      // console.log(item)
      const h = this.$createElement
      const messageVNode = h('div', {
        domProps: {
          innerHTML: `<center><textarea cols="40" rows="5" readonly>${item.message}</textarea></center>`
        }
      })

      this.$bvModal.msgBoxOk(messageVNode, {
        autoFocusButton: 'ok',
        title: `Message`,
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.log-content {
  width: 100%;
  position: relative;
  margin: 10px 0 10px;

  .loading-img {
    position: absolute;
    right: 10px;
    top: 10px;
    display: block;
  }

  textarea {
    font-family: monospace;
    font-size: 12px;
    //width: 100%;
    //height: 100%;
    display: block;
    //padding: 9.5px;
    //line-height: 1.42857143;
    color: #333;
    background-color: #fbfbfb;
    //word-break: break-all;
    //word-wrap: break-word;
    //border: 1px solid #ccc;
    //border-radius: 4px;
  }
}

li {
  margin-bottom: 5px;
}

.logs {
  margin-bottom: 10px;
}
</style>
