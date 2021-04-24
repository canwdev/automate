<template>
  <b-container class="logs">
    <h2>状态</h2>
    <p class="task-tip">任务队列中的任务个数：<abbr style="font-size: 20px;" title="该数字不会自动刷新，请手动刷新页面">{{ tasks.length }}</abbr>
    </p>

    <h2>日志列表</h2>
    <table class="table table-hover">
      <thead>
      <tr>
        <th>#</th>
        <th>命令</th>
        <th>日志文件</th>
        <th>创建时间</th>
        <th>Message</th>
        <th>部署分支</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, index) in logs" :key="item.timestamp">
        <th scope="row">{{ index + 1 }}</th>
        <td>{{ item.command }}</td>
        <td><router-link :to="`/log/${item.logName}`">{{ item.logName }}</router-link></td>
        <td>{{ formatTime(item.timestamp) }}</td>
        <td>
          <b-link v-if="item.message" @click.prevent="viewMessage(item)">点击查看</b-link>
          <span v-else>-</span>
        </td>
        <td>{{ item.branch || '-' }}</td>
      </tr>
      </tbody>
    </table>
  </b-container>
</template>

<script>
import moment from 'moment'
import {
  listLogs
} from '@/api/projects'

export default {
  name: 'Logs',
  data() {
    return {
      logs: [],
      tasks: []
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
      const {list, tasks} = await listLogs()
      // console.log('list',list)
      this.logs = list
      this.tasks = tasks
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
    }
  }
}
</script>
