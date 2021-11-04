<template>
  <div class="page-content tk-container _with-padding">
    <div class="flex items-center justify-between">
      <h4>🤖 状态汇总</h4>
      <div>
        <TkLoading size="xs" :visible="isLoading" ></TkLoading>
      </div>
    </div>
    <ul >
      <li>正在构建个数：{{ taskData.executing || 0 }}/{{ taskData.tasks || 0 }}</li>
      <li>最大并行数量：{{ taskData.concurrent || 0 }}</li>
    </ul>


    <div class="flex items-center justify-between">
      <h4>📜 任务/日志列表</h4>
      <div >
        <div class="button-group">
          <TkButton variant="success" @click="refreshNow">
            🔁
            刷新
          </TkButton>
          <TkButton variant="info" v-if="itAutoRefresh" @click="disableAutoRefresh">
            ⏸️
            停止自动刷新
          </TkButton>
          <TkButton variant="warning" v-else @click="enableAutoRefresh">
            ▶️
            开启自动刷新
          </TkButton>
          <TkButton :disabled="this.taskData.tasks > 0" theme="error" @click="handleDeleteAllLogs">
            🗑️
            删除所有日志
          </TkButton>
        </div>
      </div>
    </div>

    <div class="custom-table">
      <div class="table-head">
        <div class="t-col _cmd">命令</div>
        <div class="t-col _time">创建时间</div>
        <div class="t-col _branch">分支</div>
        <div class="t-col _state">状态</div>
        <div class="t-col _action">操作</div>

      </div>
      <div class="table-body">
        <TaskRowItem
            v-for="(item, index) in logs" :key="item.timestamp"
            :item="item"
            @delete="handleDelete"
            @restart="handleRestart"
            @abort="handleAbort"
        />
      </div>
    </div>

    <TkPager
        :page-size="limit"
        :offset.sync="page"
        :total="allCount"
        show-extra-info
    />

  </div>
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
  BuildStatus
} from '@/enum'
import autoRefreshMixin from '@/mixins/auto-refresh-mixin'

const requestDelay = 500

export default {
  name: 'BuildList',
  mixins: [autoRefreshMixin],
  components: {
    TaskRowItem
  },
  data() {
    return {
      logs: [],
      taskData: {
      },
      limit: 10,
      allCount: 1,
      isLoading: false,
    }
  },
  computed: {
    page: {
      get() {
        let page = Number(this.$route.query.page) || 0
        return page
      },
      set(val) {
        this.$router.push({
          query: {
            ...this.$route.query,
            page: val
          }
        }).catch(e=>{})
      }
    }
  },
  watch: {
    page() {
      this.refreshNow()
    }
  },
  mounted() {
    // this.getLogList()
    this.refreshNow()
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
          offset: this.page * this.limit,
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
        this.allCount = count

        this.erroredTimes = 0
      } catch (e) {
        console.error(e)
        this.erroredTimes++
      } finally {
        setTimeout(() => {
          this.isLoading = false
        }, 100)
      }
    },
    async handleDeleteAllLogs() {
      this.$prompt.create({
        propsData: {
          title: '⚠️ 警告',
          content: '确定要删除所有日志吗？此操作不可逆',
        }
      }).onConfirm(async (context) => {
        await deleteAllLogs()
        setTimeout(() => {
          this.refreshNow()
        }, requestDelay)
      })

    },
    handleDelete(item) {
      this.$prompt.create({
        propsData: {
          title: '⚠️ 警告',
          content: `确定要删除 ${item.logName} 吗？`,
        }
      }).onConfirm(async (context) => {
        await deleteLog({
          id: item.id
        })
        setTimeout(() => {
          this.refreshNow()
        }, requestDelay)
      })
    },
    handleRestart(item) {
      this.$prompt.create({
        propsData: {
          title: '⚠️ 警告',
          content: `确定要重新运行 ${item.logName} 吗？`,
        }
      }).onConfirm(async (context) => {
        await buildProject({
          cmd: item.command
        })
        setTimeout(() => {
          this.refreshNow()
        }, requestDelay)
      })
    },
    handleAbort(item) {
      this.$prompt.create({
        propsData: {
          title: '⚠️ 警告',
          content: `确定要立即终止 ${item.logName} 吗？`,
        }
      }).onConfirm(async (context) => {
        await abortBuild({
          id: item.id
        })
        setTimeout(() => {
          this.refreshNow()
        }, requestDelay)
      })

    }
  }
}
</script>
