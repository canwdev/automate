<template>
  <b-container class="about">
    <h2>状态</h2>
    <p class="task-tip">任务队列中的任务个数：<abbr style="font-size: 20px;" title="该数字不会自动刷新，请手动刷新页面">0</abbr>
    </p>

    <h2>日志列表</h2>
    <b-table striped hover :items="logs"></b-table>
  </b-container>
</template>

<script>
import moment from 'moment'
import {
  listLogs
} from '../api/server'

export default {
  name: 'Logs',
  data() {
    return {
      logs: []
    }
  },
  created() {
    this.getLogList()
  },
  methods: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss A')
    },
    async getLogList() {
      const list = await listLogs()
      console.log('list',list)
      this.logs = list
    }
  }
}
</script>
