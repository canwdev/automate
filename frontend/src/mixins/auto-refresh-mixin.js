export default {
  data() {
    return {
      itAutoRefresh: null,
      isStopRefresh: false,
      refreshMs: 5000,
      erroredTimes: 0
    }
  },
  watch: {
    // 如果错误大于5次，则停止刷新
    erroredTimes(val) {
      if(val >= 5) {
        this.disableAutoRefresh()
      }
    }
  },
  mounted() {
    document.addEventListener("visibilitychange", this.handleVisibilitychange);

    // 打开页面30分钟后自动停止刷新
    this.stopTl = setTimeout(() => {
      this.disableAutoRefresh()
    }, 30 * 1000 * 1000)
  },
  beforeDestroy() {
    clearTimeout(this.stopTl)
    document.removeEventListener("visibilitychange", this.handleVisibilitychange);
    this.pauseAutoRefresh()
  },
  methods: {
    startAutoRefresh() {
      if (this.isStopRefresh) {
        return
      }
      this.itAutoRefresh = setInterval(this.fnRefresh, this.refreshMs)
    },
    pauseAutoRefresh() {
      clearInterval(this.itAutoRefresh)
      this.itAutoRefresh = null
    },
    disableAutoRefresh() {
      this.pauseAutoRefresh()
      this.isStopRefresh = true
    },
    enableAutoRefresh() {
      this.isStopRefresh = false
      this.refreshNow()
    },
    async refreshNow() {
      this.pauseAutoRefresh()
      await this.fnRefresh()
      this.startAutoRefresh()
    },
    async fnRefresh() {
      console.log('fnRefresh')
    },
    handleVisibilitychange(evt) {
      // console.log(evt, document.hidden)
      if (document.hidden) {
        this.pauseAutoRefresh()
      } else {
        if (this.isStopRefresh) {
          return
        }
        this.refreshNow()
      }
    }
  }
}
