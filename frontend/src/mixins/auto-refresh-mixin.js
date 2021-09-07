export default {
  data() {
    return {
      itAutoRefresh: null,
      refreshMs: 5000
    }
  },
  mounted() {
    this.refreshNow()
    document.addEventListener("visibilitychange", this.handleVisibilitychange);
  },
  beforeDestroy() {
    this.stopAutoRefresh()
    document.removeEventListener("visibilitychange", this.handleVisibilitychange);
  },
  methods: {
    startAutoRefresh() {
      this.itAutoRefresh = setInterval(this.fnRefresh, this.refreshMs)
    },
    stopAutoRefresh() {
      clearInterval(this.itAutoRefresh)
      this.itAutoRefresh = null
    },
    async refreshNow() {
      this.stopAutoRefresh()
      await this.fnRefresh()
      this.startAutoRefresh()
    },
    async fnRefresh() {
      console.log('fnRefresh')
    },
    handleVisibilitychange(evt) {
      // console.log(evt, document.hidden)
      if (document.hidden) {
        this.stopAutoRefresh()
      } else {
        this.refreshNow()
      }
    }
  }
}
