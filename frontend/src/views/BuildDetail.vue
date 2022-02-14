<template>
  <div class="page-content tk-container _with-padding ">

    <div class="flex items-center justify-between">
      <div>
        <div class="button-group">
          <TkButton @click="$router.push(`/logs`)">
            ⬅️ 返回日志列表
          </TkButton>

          <template v-if="isRaw">
            <TkButton
                theme="white"
                @click.prevent="viewRaw(false)" class="mr-2">
              ◀️
            </TkButton>
          </template>
          <template v-else>
            <TkButton
                theme="white"
                variant="info" @click.prevent="viewRaw()">📃 源文件
            </TkButton>
          </template>
        </div>
      </div>
      <div><h4>📜 日志详情</h4></div>
      <div>
        <div class="button-group">
          <TkButton
              theme="white"
              @click="refreshNow">
            🔁
            刷新
          </TkButton>
          <TkButton
              theme="info"
              v-if="itAutoRefresh" @click="disableAutoRefresh">
            ⏸️
            停止自动刷新
          </TkButton>
          <TkButton
              theme="warning"
              v-else @click="enableAutoRefresh">
            ▶️
            开启自动刷新
          </TkButton>
        </div>
      </div>
    </div>

    <div class="flex justify-between">
      <ul>
        <li>构建状态：{{ BuildStatusText[buildItem.buildStatus] }}</li>
        <li>id：{{ buildItem.id }}</li>
        <li>创建时间：{{ formatTime(buildItem.timestamp) }}</li>
      </ul>
      <ul>
        <li>命令：{{ buildItem.command }}</li>
        <li>分支：{{ buildItem.branch || '-' }}</li>
        <li>消息：
          <b-link v-if="buildItem.message" @click.prevent="viewMessage(buildItem)">点击查看</b-link>
          <span v-else>-</span>
        </li>
      </ul>
      <ul>
        <li>日志名称：{{ buildItem.logName }}</li>
      </ul>
    </div>

    <div class="progress-bar" v-if="itAutoRefresh" :class="[itAutoRefresh ? 'info':'warning']">
      <div v-if="itAutoRefresh">日志 <span id='sec'>{{ refreshMs / 1000 }}</span>s 刷新一次</div>
      <div v-else>刷新已停止</div>
    </div>

    <div class="log-content">
      <TkLoading class="loading-img" size="xs" :visible="isLoading"></TkLoading>
      <TkInput
          class="text-mono"
          type="textarea"
          :value="logTxt"
          placeholder="日志为空，可能是任务还没有开始执行"
          readonly
      ></TkInput>

    </div>

  </div>
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

      this.$prompt.create({
        propsData: {
          title: 'Message',
          content: messageVNode,
        }
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
  }

  textarea {
    font-size: 12px;
    width: 100%;
    height: 500px;
    display: block;
    color: inherit;
    background-color: inherit;
    word-break: break-all;
    word-wrap: break-word;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

.logs {
  margin-bottom: 10px;
}

.progress-bar {
  background: #ccc;
  text-align: center;
  padding: 2px;
  border-radius: $border-radius;
  font-size: 12px;

  &.info {
    background: $info;
  }

  &.warning {
    background: $warning;
  }
}
</style>