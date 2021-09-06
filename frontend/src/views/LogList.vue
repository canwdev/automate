<template>
  <b-container class="logs">
    <h4>🤖 状态汇总</h4>
    <ul class="mb-5">
      <li>正在构建个数：{{ taskData.tasks }} / {{ builderConcurrent }}</li>
    </ul>


    <b-row align-h="between">
      <b-col cols="auto"><h4>📜 任务/日志列表</h4></b-col>
      <b-col cols="auto">
        <b-button-group size="sm">
          <b-button variant="success" @click="getLogList"><b-icon icon="arrow-repeat"></b-icon> 刷新</b-button>
          <b-button :disabled="this.taskData.tasks > 0" variant="danger" @click="handleDeleteAllLogs"><b-icon icon="trash"></b-icon> 删除所有日志
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <table class="table table-hover">
      <thead>
      <tr>
        <th>命令</th>
        <th>日志文件</th>
        <th>创建时间</th>
        <th>消息</th>
        <th>部署分支</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>

      <TaskRowItem
        v-for="(item, index) in logs" :key="item.timestamp"
        :item="item"
      />
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
import TaskRowItem from "@/components/TaskRowItem"
import {
  getBuildLogs,
  deleteAllLogs
} from '@/api/projects'
import {
  BuildViewItem,
  BuildStatus
} from '@/enum'

export default {
  name: 'LogList',
  components: {
    TaskRowItem
  },
  data() {
    return {
      logs: [],
      taskData: {
        tasks: []
      },
      limit: 10,
      pages: 1,
      builderConcurrent: null,
      BuildViewItem
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
    async getLogList() {
      const res = await getBuildLogs({
        offset: this.offset,
        limit: this.limit
      })
      console.log('res', res)
      const {
        list,
        taskData,
        builderConcurrent,
        limit,
        count
      } = res
      this.logs = list
      this.taskData = taskData
      this.builderConcurrent = builderConcurrent
      this.pages = Math.max(1, Math.ceil(count / limit))
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
