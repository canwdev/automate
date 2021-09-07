<template>
  <b-container class="logs">
    <b-row align-h="between">
      <b-col cols="auto"><h4>🤖 状态汇总</h4></b-col>
      <b-col cols="auto"><span v-show="isLoading">刷新中...</span></b-col>
    </b-row>
    <ul class="mb-5">
      <li>正在构建个数：{{ taskData.executing || 0 }}/{{ taskData.tasks || 0 }}</li>
      <li>最大并行数量：{{ taskData.concurrent || 0 }}</li>
    </ul>


    <b-row align-h="between">
      <b-col cols="auto"><h4>📜 任务/日志列表</h4></b-col>
      <b-col cols="auto">
        <b-button-group size="sm">
          <b-button variant="success" @click="refreshNow">
            <b-icon icon="arrow-repeat"></b-icon>
            刷新
          </b-button>
          <b-button variant="info" v-if="itAutoRefresh" @click="stopAutoRefresh">
            <b-icon icon="pause-fill"></b-icon>
            暂停自动刷新
          </b-button>
          <b-button variant="warning" v-else @click="refreshNow">
            <b-icon icon="play-fill"></b-icon>
            开启自动刷新
          </b-button>
          <b-button :disabled="this.taskData.tasks > 0" variant="danger" @click="handleDeleteAllLogs">
            <b-icon icon="trash"></b-icon>
            删除所有日志
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <table class="table table-hover">
      <thead>
      <tr>
        <th>命令</th>
        <th>创建时间</th>
        <th>消息</th>
        <th>分支</th>
        <th>状态</th>
        <th>日志</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>

      <TaskRowItem
        v-for="(item, index) in logs" :key="item.timestamp"
        :item="item"
        @delete="handleDelete"
        @restart="handleRestart"
        @abort="handleAbort"
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
  getBuildList,
  deleteAllLogs,
  deleteLog,
  buildProject,
  abortBuild
} from '@/api/projects'
import {
  BuildInstance,
  BuildStatus
} from '@/enum'
import {notifyError} from "@/utils/notify"
import autoRefreshMixin from '@/mixins/auto-refresh-mixin'

export default {
  name: 'LogList',
  mixins: [autoRefreshMixin],
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
      isLoading: false,
      BuildInstance
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
      this.refreshNow()
    }
  },
  created() {
    // this.getLogList()
  },
  methods: {
    linkGen(pageNum) {
      return pageNum === 1 ? '?' : `?page=${pageNum}`
    },
    fnRefresh() {
      return this.getLogList()
    },
    async getLogList() {
      try {
        this.isLoading = true
        const res = await getBuildList({
          offset: this.offset,
          limit: this.limit
        })
        // console.log('res', res)
        const {
          list,
          taskData,
          limit,
          count
        } = res
        this.logs = list
        this.taskData = taskData
        this.pages = Math.max(1, Math.ceil(count / limit))
      } catch (e) {
        console.error(e)
        notifyError(e)
      } finally {
        setTimeout(() => {
          this.isLoading = false
        }, 100)
      }
    },
    async handleDeleteAllLogs() {

      this.$bvModal.msgBoxConfirm('确定要删除所有日志吗？此操作不可逆', {
        title: '⚠警告⚠️',
      }).then(async value => {
        if (!value) {
          return
        }

        await deleteAllLogs()
        await this.refreshNow()
      })

    },
    handleDelete(item) {
      this.$bvModal.msgBoxConfirm(`确定要删除 ${item.logName} 吗？`, {
        title: '⚠警告⚠️',
      }).then(async value => {
        if (!value) {
          return
        }
        await deleteLog({
          id: item.id
        })
        await this.refreshNow()
      })
    },
    handleRestart(item) {
      this.$bvModal.msgBoxConfirm(`确定要重新运行 ${item.logName} 吗？`, {
        autoFocusButton: 'ok',
        title: '确认',
      }).then(async value => {
        if (!value) {
          return
        }

        await buildProject({
          cmd: item.command
        })
        await this.refreshNow()
      })
    },
    handleAbort(item) {
      this.$bvModal.msgBoxConfirm(`确定要立即终止 ${item.logName} 吗？`, {
        title: '⚠警告⚠️',
      }).then(async value => {
        if (!value) {
          return
        }
        await abortBuild({
          id: item.id
        })
        await this.refreshNow()
      })
    }
  }
}
</script>
