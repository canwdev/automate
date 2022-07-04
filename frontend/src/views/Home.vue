<template>
  <div class="page-content tk-container _with-padding">

    <div class="management">
      <h4>🕹️ 管理服务</h4>
      <ul>

        <li><span v-if="serverInfo">{{ serverInfo.name }}: v{{ serverInfo.version }}</span> (前端版本：v{{ frontendVer }})</li>
        <li>🖥 <abbr :title="'启动时刻：' + initTimeFormatted">服务运行了</abbr>：<span class="badge">{{ runningTime }}</span></li>
        <li>
          <TkButton autofocus @click="$router.push(`/logs`)">
            任务/日志列表
          </TkButton>
        </li>
        <li>
          <TkButton theme="error" @click="handleRestart()" title="强制重启服务，需要 PM2 支持">重启服务(PM2)</TkButton>
        </li>
      </ul>
    </div>

    <div class="builder-wrap">
      <h4>🔮 部署</h4>

      <ul v-if="buildList.length">
        <template v-for="(item, index) in buildList">

          <div v-if="item.split" :key="index" class="split-line">
            <div v-if="item.title">{{item.title}}</div>
          </div>
          <li v-else :key="index">
            <TkButton theme="info" @click.prevent="showBuildDialog(item)">{{ item.title }}
            </TkButton>
          </li>
        </template>

      </ul>

      <ul v-else>
        <li>暂无配置(./config/project-list.yml)</li>
      </ul>
    </div>

    <TkModalDialog v-model="isShowBuildDialog" show-close>
      <TkCard v-if="curItem">
        <h4>确认：{{ curItem.title }}</h4>
        <form @submit.prevent="handleBuild" class="form-wrap">
          <div class="form-row">
            <div class="form-title">命令：</div>
            <TkInput class="text-mono text-small" name="build_command" type="text" v-model="curItem.cmd" required>
            </TkInput>
          </div>
          <div class="form-row">
            <div class="form-title">参数：</div>
            <TkInput class="text-mono text-small" name="build_args" type="text" v-model="curItem.args"></TkInput>
          </div>

          <div class="action-row">
            <TkButton autofocus type="submit">开始部署</TkButton>
          </div>
        </form>
      </TkCard>
    </TkModalDialog>
  </div>
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
    (minutes > 0 ? (minutes + ' 分 ') : '') // +
    // seconds + ' 秒'
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
      frontendVer: pkg.version,
      isShowBuildDialog: false,
      curItem: null
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
      const { initTime } = data
      this.serverInfo = data
      this.initTime = new Date(initTime)
      this.startTimeTick()
      this.runningTime = formatRunningTime(this.initTime)
    },
    async getList() {
      const { list } = await getProjectList()
      this.buildList = list
    },
    startTimeTick() {
      clearInterval(this.timeTick)
      this.timeTick = setInterval(() => {
        this.runningTime = formatRunningTime(this.initTime)
      }, 60 * 1000)
    },
    handleRestart() {
      this.$prompt.create({
        propsData: {
          title: '确定要重启服务吗？',
          content: '',
        }
      }).onConfirm(async (context) => {
        const { message } = await restartService()

        this.$toast.info(`${message}: 服务重启，页面即将刷新...`)

        setTimeout(() => {
          location.reload()
        }, 1500)
      })
    },
    showBuildDialog(item) {
      this.curItem = item
      this.isShowBuildDialog = true
    },
    async handleBuild() {
      const item = this.curItem

      this.isShowBuildDialog = false
      this.curItem = null
      // const h = this.$createElement
      // const messageVNode = h('div', {
      //   domProps: {
      //     innerHTML: `命令：${item.cmd}<br> 参数：${item.args || ''}`
      //   }
      // })

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


    }
  }
}
</script>

<style lang="scss" scoped>
.split-line {
  margin-top: 20px;
  padding-bottom: 5px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(132, 132, 132, 0.7);
  font-weight: bold;
  font-size: 18px;
  margin-left: -30px
}
.builder-wrap {
  &>ul {
    margin: 0
  }
}
</style>
