<template>
  <b-container>

    <div class="management">
      <h3>管理服务</h3>
      <ul>

        <li><span v-if="serverInfo">{{ serverInfo.name }}: v{{ serverInfo.version }}</span> (前端版本：v{{frontendVer}})</li>
        <li><abbr :title="'启动时刻：' +initTimeFormatted">服务运行了</abbr>：<span class="badge">{{ runningTime }}</span></li>
        <li>
          <router-link class="btn btn-primary" to="/logs">任务/日志列表</router-link>
        </li>
        <li>
          <button class="btn btn-danger" @click="handleRestart()" title="重启 Automate 服务！用于解决一些构建执行时卡住的问题">重启服务</button>
        </li>
      </ul>
    </div>

    <div class="builder">
      <h3>构建</h3>

      <ul v-if="buildList.length">
        <li v-for="(item,index) in buildList" :key="index">
          <button class="btn btn-info"
                  @click.prevent="handleBuild(item)">{{ item.title }}
          </button>
        </li>
      </ul>

      <ul v-else>
        <li>暂无配置(./configs/build-list.yml)</li>
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
  getBuildList,
  buildProject
} from '@/api/projects'
import pkg from '../../package.json'

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
      const {list} = await getBuildList()
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

        this.$bvToast.toast(message, {
          variant: 'info',
          toaster: 'b-toaster-top-center',
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
          innerHTML: `cmd: ${item.cmd}<br> args: ${item.args || ''}`
        }
      })

      this.$bvModal.msgBoxConfirm(messageVNode, {
        autoFocusButton: 'ok',
        title: `确定要开始构建: ${item.title}`,
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

        this.$router.push({
          name: 'LogDetail',
          params: {
            logName: res.logName
          }
        })
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
