<template>
  <b-container class="logs">
    <h2>日志详情</h2>

    <ul>
      <li>
        <router-link to="/logs">
          <b-button size="sm">返回日志列表</b-button>
        </router-link>
      </li>
      <li v-if="isRaw">
        <b-button size="sm" @click.prevent="viewRaw(false)" class="mr-2">
          <b-icon icon="arrow90deg-left"></b-icon>
        </b-button>

        <abbr title="源文件不会自动刷新">日志源文件</abbr>: {{ logName }}
      </li>
      <li v-else>
        <b-button size="sm" @click.prevent="viewRaw()">查看日志源文件</b-button>
      </li>
      <li>
        <b-button-group size="sm">
          <b-button variant="success" @click="getLogDetail" title="刷新日志">
            <b-icon icon="arrow-repeat"></b-icon>
          </b-button>
          <b-button variant="danger" v-if="itAutoRefresh" @click="stopAutoRefresh" title="停止自动刷新">
            <b-icon icon="stop-circle"></b-icon>
          </b-button>
          <b-button variant="info" v-else @click="startAutoRefresh" title="开启自动刷新">
            <b-icon icon="play-circle"></b-icon>
          </b-button>
        </b-button-group>
      </li>
    </ul>

    <div class="log-content">
      <img v-show="isLoading" class="loading-img" src="~@/assets/images/loading.gif" alt="">
      <textarea readonly placeholder="Empty" :value="content"></textarea>
    </div>

    <b-progress v-if="itAutoRefresh" :max="100" variant="info" show-progress animated>
      <b-progress-bar :value="100">
        <div>日志 <span id='sec'>5</span>s 刷新一次</div>
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
    this.getLogDetail()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
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
  height: 500px;
  position: relative;
  margin: 0 0 10px;

  .loading-img {
    position: absolute;
    right: 10px;
    top: 10px;
    display: block;
  }

  textarea {
    width: 100%;
    height: 100%;
    display: block;
    padding: 9.5px;
    font-size: 13px;
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
</style>
