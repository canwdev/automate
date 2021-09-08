<template>
  <b-container class="logs">
    <h4>📜 日志详情</h4>

    <ul>
      <li>
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
            <b-button variant="info" @click.prevent="viewRaw()">查看日志源文件</b-button>
          </template>
        </b-button-group>

        <span v-if="isRaw">
          <abbr title="源文件不会自动刷新">日志源文件</abbr>: {{ logName }}
        </span>

      </li>

      <li>
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
      </li>
    </ul>

    <b-progress :max="100" :variant="itAutoRefresh ? 'info':'warning'" show-progress :animated="Boolean(itAutoRefresh)">
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
        :value="content"
        placeholder="日志为空，可能是任务还没有开始执行"
        readonly
      ></b-form-textarea>

    </div>

  </b-container>
</template>

<script>
import {logDetail} from '@/api/projects'
import autoRefreshMixin from '@/mixins/auto-refresh-mixin'

export default {
  name: "LogDetail",
  mixins: [autoRefreshMixin],
  computed: {
    logName() {
      return this.$route.params.logName
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
          this.getLogDetail()
        } else {
          this.refreshNow()
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      content: null,
      isLoading: false
    }
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    async getLogDetail() {
      this.isLoading = true
      try {
        this.content = await logDetail(this.logName, {raw: this.isRaw})
        this.erroredTimes = 0
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
      this.getLogDetail()
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
    }
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
