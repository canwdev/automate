<template>
  <b-container class="logs">
    <h2>日志详情</h2>
    <p><router-link to="/logs">返回日志列表</router-link></p>
    <p>源文件：<a href="/logs/?raw=true" class="cur-help" title="源文件不会自动刷新">/logs/{{ logName }}</a></p>

    <div class="log-content">
      <pre id="log">{{content}}</pre>
    </div>

    <b-progress :max="100" variant="warning" show-progress animated>
      <b-progress-bar :value="100">
        <div>日志输出 <span id='sec'>5</span>s 刷新一次</div>
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
    }
  },
  data() {
    return {
      content: null
    }
  },
  created() {
    this.getLogDetail()
  },
  mounted() {
    this.itv = setInterval(this.getLogDetail, 5000)
  },
  beforeDestroy() {
    clearInterval(this.itv)
  },
  methods: {
    async getLogDetail() {
      this.content = await logDetail(this.logName)
    }
  }
}
</script>

<style lang="scss" scoped>
.log-content {
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.42857143;
  color: #333;
  word-break: break-all;
  word-wrap: break-word;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
