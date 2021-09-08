<template>
  <b-container>

    <div class="management">
      <h4>🕹️ 管理服务</h4>
      <ul>

        <li><span v-if="serverInfo">{{ serverInfo.name }}: v{{ serverInfo.version }}</span> (前端版本：v{{frontendVer}})</li>
        <li><abbr :title="'启动时刻：' +initTimeFormatted">服务运行了</abbr>：<span class="badge">{{ runningTime }}</span></li>
        <li>
          <router-link class="btn btn-primary" to="/logs">任务/日志列表</router-link>
        </li>
        <li>
          <button class="btn btn-danger" @click="handleRestart()" title="强制重启服务，需要 PM2 支持">重启服务(PM2)</button>
        </li>
      </ul>
    </div>

    <div class="builder">
      <h4>🔮 部署</h4>

      <ul v-if="buildList.length">
        <li v-for="(item,index) in buildList" :key="index">
          <button class="btn btn-info"
                  @click.prevent="handleBuild(item)">{{ item.title }}
          </button>
        </li>
      </ul>

      <ul v-else>
        <li>暂无配置(./config/project-list.yml)</li>
      </ul>
    </div>
  </b-container>
</template>

<script>
import moment from 'moment'
import {
  getServiceInfo,
  restartService
} from '@/api/server'
import {
  getProjectList,
  buildProject
} from '@/api/projects'
import pkg from '../../package.json'
import {notifyError} from "@/utils/notify"

function formatRunningTime(initTime) {
  const diff = new Date(Date.now() - initTime.getTime()).getTime()
  // return (diff / 1000).toFixed(0) + 's'

  const duration = moment.duration(diff)

  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()
  const seconds = duration.seconds()

  return (days > 0 ? (days + ' 天 ') : '') +
      (hours > 0 ? (hours + ' 小时 ') : '') +
      (minutes > 0 ? (minutes + ' 分 ') : '') +
      seconds + ' 秒'
}

export default {
  name: 'Home',
  components: {},
  data() {
    return {
      buildList: [],
      initTime: null,
      runningTime: '-',
      serverInfo: null,
      frontendVer: pkg.version
    }
  },
  computed: {
    initTimeFormatted() {
      return moment(this.initTime).format('YYYY-MM-DD HH:mm:ss A')
    }
  },
  created() {
    this.getInfo()
    this.getList()
  },
  beforeDestroy() {
    clearInterval(this.timeTick)
  },
  methods: {
    async getInfo() {
      const data = await getServiceInfo()
      const {initTime} = data
      this.serverInfo = data
      this.initTime = new Date(initTime)
      this.startTimeTick()
    },
    async getList() {
      const {list} = await getProjectList()
      this.buildList = list
    },
    startTimeTick() {
      clearInterval(this.timeTick)
      this.timeTick = setInterval(() => {
        this.runningTime = formatRunningTime(this.initTime)
      }, 1000)
    },
    handleRestart() {
      this.$bvModal.msgBoxConfirm('确定要重启服务吗？', {
        title: '确认',
      }).then(async value => {
        if (!value) {
          return
        }

        const {message} = await restartService()

        notifyError({
          message,
          title: '服务重启，页面即将刷新...'
        })

        setTimeout(() => {
          location.reload()
        }, 1500)
      }).catch(err => {
      })
    },
    handleBuild(item) {
      const h = this.$createElement
      const messageVNode = h('div', {
        domProps: {
          innerHTML: `命令：${item.cmd}<br> 参数：${item.args || ''}`
        }
      })

      this.$bvModal.msgBoxConfirm(messageVNode, {
        autoFocusButton: 'ok',
        title: `请确认开始部署: ${item.title}`,
      }).then(async value => {
        if (!value) {
          return
        }

        const res = await buildProject(item)
        console.log('res', res)
        // axios.get(url).then(res => {
        //   console.log(res.data)
        //   location.href = '/logs/' + res.data.buildLogName
        // }).catch(e => {
        //   console.error(e)
        // })

        setTimeout(() => {
          this.$router.push({
            name: 'BuildDetail',
            params: {
              id: res.id
            }
          })
        }, 800)


      }).catch(() => {
      })
    }
  }
}
</script>

<style lang="scss" scoped>
li {
  margin-bottom: 5px;
}
</style>
