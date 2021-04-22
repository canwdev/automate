<template>
  <b-container>

    <div class="management">
      <h2>管理服务</h2>
      <ul>
        <li><abbr :title="'启动时刻：' +initTimeFormatted">服务运行了</abbr>：<span class="badge">{{runningTime}}</span></li>
        <li><a class="btn btn-primary" href="/logs/">日志列表 · Logs</a></li>
        <li><button class="btn btn-danger" @click="handleRestart()" title="重启 Automate 服务！用于解决一些构建执行时卡住的问题">重启服务</button></li>
      </ul>
    </div>

    <div class="builder">
      <h2>点击一项立即开始<abbr title="点击立即开始构建该项。警告：启动后不支持停止，请勿重复点击！">构建</abbr></h2>

      <ul>
        <li v-for="(v,i) in list" :key="i">
          <a class="btn btn-default" :class="{'btn-info': v.title}" :href="v.url" :title="v.url" @click.prevent="handleBuild(v.url)">{{v.title || v.url}}</a>
        </li>
      </ul>

      <ul v-if="list.length===0">
        <li>暂无配置，可以将 <a href="/projects.demo.json">/projects.demo.json</a> 重命名为 projects.json 以查看效果。</li>
        <li>注意：示例文件都是无效的，即使尝试运行也会报错，具体请参考 README.md。</li>
      </ul>
    </div>
  </b-container>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import {
  getServiceInfo,
  restartService
} from '@/api/server'

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
  components: {
  },
  data() {
    return {
      list: [],
      initTime: null,
      runningTime: '-'
    }
  },
  computed: {
    initTimeFormatted() {
      return moment(this.initTime).format('YYYY-MM-DD HH:mm:ss A')
    }
  },
  mounted() {
    /*axios.get('/projects.json').then(res => {
      res.data.forEach(v => {
        this.list.push({
          title: v.title,
          url: '/build/' + v.cmd + '/' + v.config
        })
      })
    })

    setInterval(() => {
      this.runningTime = formatRunningTime(serviceInitTime)
    }, 1000);*/

    this.getInfo()
  },
  beforeDestroy() {
    clearInterval(this.timeTick)
  },
  methods: {
    async getInfo() {
      const {initTime} = await getServiceInfo()
      this.initTime = new Date(initTime)
      this.startTimeTick()
    },
    startTimeTick() {
      clearInterval(this.timeTick)
      this.timeTick = setInterval(() => {
        this.runningTime = formatRunningTime(this.initTime)
      }, 1000)
    },
    handleRestart() {
      this.$bvModal.msgBoxConfirm('确定要重启服务吗？', {
        title: 'Please Confirm',
      })
          .then(async value => {
            if (!value) {
              return
            }

            const {message} = await restartService()

            this.$bvToast.toast(message, {
              variant: 'info',
              title: 'Service Restart'
            })
            console.log('value', value)
          })
          .catch(err => {
            // An error occurred
          })
    },
    handleBuild(url) {
      if (confirm('确定要开始构建 ' + url + ' ?')) {
        axios.get(url).then(res => {
          console.log(res.data)
          location.href = '/logs/' + res.data.buildLogName
        }).catch(e => {
          console.error(e)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
li {
  margin-bottom: 5px;
}
</style>
