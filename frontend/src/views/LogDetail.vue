<template>
  <b-container class="logs">
    <h2>日志详情</h2>

    <ul>
      <li>
        <b-button-group size="sm">
          <router-link class="btn btn-secondary" to="/logs">
            <b-icon icon="arrow-left"></b-icon> 返回日志列表
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
            <b-icon icon="arrow-repeat"></b-icon> 立即刷新
          </b-button>
          <b-button variant="info" v-if="itAutoRefresh" @click="stopAutoRefresh">
            <b-icon icon="pause-fill"></b-icon> 暂停自动刷新
          </b-button>
          <b-button variant="warning" v-else @click="startAutoRefresh">
            <b-icon icon="play-fill"></b-icon> 开启自动刷新
          </b-button>
        </b-button-group>
      </li>
    </ul>

    <div class="log-content">
      <img v-show="isLoading" class="loading-img" src="~@/assets/images/loading.gif" alt="">
      <textarea readonly placeholder="Empty" :value="content"></textarea>
    </div>

    <b-progress :max="100" :variant="itAutoRefresh ? 'info':'warning'" show-progress :animated="Boolean(itAutoRefresh)">
      <b-progress-bar :value="100">
        <div v-if="itAutoRefresh">日志 <span id='sec'>5</span>s 刷新一次</div>
        <div v-else>刷新已暂停</div>
      </b-progress-bar>

    </b-progress>

  </b-container>
</template>

<script>
import {logDetail} from '@/api/projects'

export default {
  name: "LogDetail",
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
          this.stopAutoRefresh()
          this.getLogDetail()
        } else {
          this.startAutoRefresh()
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      content: null,
      itAutoRefresh: null,
      isLoading: false
    }
  },
  mounted() {
    this.isLoading = true
    setTimeout(() => {
      this.getLogDetail()
    }, 500)
    document.addEventListener("visibilitychange", this.handleVisibilitychange);
  },
  beforeDestroy() {
    this.stopAutoRefresh()
    document.removeEventListener("visibilitychange", this.handleVisibilitychange);
  },
  methods: {
    async getLogDetail() {
      this.isLoading = true
      try {
        this.content = await logDetail(this.logName, {raw: this.isRaw})
      } catch (e) {
        console.error(e)
      } finally {
        setTimeout(() => {
          this.isLoading = false
        }, 500)
      }
    },
    startAutoRefresh() {
      this.itAutoRefresh = setInterval(this.getLogDetail, 5000)
    },
    stopAutoRefresh() {
      clearInterval(this.itAutoRefresh)
      this.itAutoRefresh = null
    },
    refreshNow() {
      this.stopAutoRefresh()
      this.getLogDetail()
      this.startAutoRefresh()
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
    handleVisibilitychange(evt) {
      // console.log(evt, document.hidden)
      if (document.hidden) {
        this.stopAutoRefresh()
      } else {
        this.startAutoRefresh()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.log-content {
  width: 100%;
  height: 460px;
  position: relative;
  margin: 0 0 10px;

  .loading-img {
    position: absolute;
    right: 10px;
    top: 10px;
    display: block;
  }

  textarea {
    font-family: monospace;
    font-size: 12px;
    width: 100%;
    height: 100%;
    display: block;
    padding: 9.5px;
    line-height: 1.42857143;
    color: #333;
    word-break: break-all;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

li {
  margin-bottom: 5px;
}

.logs {
  margin-bottom: 10px;
}
</style>
