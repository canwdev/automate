<template>
  <b-container class="logs">
    <h2>状态</h2>
    <p class="task-tip">任务队列中的任务个数：<abbr style="font-size: 20px;" title="该数字不会自动刷新，请手动刷新页面">{{ tasks.length }}</abbr>
    </p>

    <b-row align-h="between">
      <b-col cols="auto"><h2>日志列表</h2></b-col>
      <b-col cols="auto">
        <b-button-group size="sm">
          <b-button variant="success" @click="getLogList">Refresh</b-button>
          <b-button :disabled="this.tasks.length > 0" variant="danger" @click="handleDeleteAllLogs">Delete all
            logs
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>

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
        <td>
          <router-link :to="`/log/${item.logName}`">{{ item.logName }}</router-link>
        </td>
        <td>{{ formatTime(item.timestamp) }}</td>
        <td>
          <b-link v-if="item.message" @click.prevent="viewMessage(item)">点击查看</b-link>
          <span v-else>-</span>
        </td>
        <td>{{ item.branch || '-' }}</td>
      </tr>
      </tbody>
    </table>

    <b-pagination-nav
        class="mx-auto"
        first-number
        last-number
        :link-gen="linkGen"
        :number-of-pages="pages"
        use-router
    ></b-pagination-nav>

  </b-container>
</template>

<script>
import moment from 'moment'
import {
  listLogs,
  deleteAllLogs
} from '@/api/projects'

export default {
  name: 'Logs',
  data() {
    return {
      logs: [],
      tasks: [],
      limit: 10,
      pages: 1,
    }
  },
  computed: {
    offset() {
      let page = Number(this.$route.query.page) || 0
      if (page > 1) {
        page = page - 1
      }
      return page * this.limit
    }
  },
  watch: {
    offset() {
      this.getLogList()
    }
  },
  created() {
    this.getLogList()
  },
  methods: {
    linkGen(pageNum) {
      return pageNum === 1 ? '?' : `?page=${pageNum}`
    },
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss A')
    },
    async getLogList() {
      const {
        list,
        tasks,
        limit,
        length
      } = await listLogs({
        offset: this.offset,
        limit: this.limit
      })
      // console.log('list',list)
      this.logs = list
      this.tasks = tasks
      this.pages = Math.max(1, Math.ceil(length / limit))
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
    async handleDeleteAllLogs() {

      this.$bvModal.msgBoxConfirm('确定要删除所有日志吗？', {
        title: 'Please Confirm',
      }).then(async value => {
        if (!value) {
          return
        }

        await deleteAllLogs()
        await this.getLogList()
      })

    }
  }
}
</script>
