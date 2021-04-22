<template>
  <div class="home container">
    <div class="management">
      <h2>管理服务</h2>
      <ul>
        <li><abbr :title="'启动时刻：' +initTimeFormated">服务运行了</abbr>：<span class="badge">{{runningTime}}</span></li>
        <li><a class="btn btn-primary" href="/logs/">日志列表 · Logs</a></li>
        <li><a class="btn btn-danger" href="/restart" @click.prevent="handleRestart()" title="重启 Automate 服务！用于解决一些构建执行时卡住的问题">重启服务</a></li>
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
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'

let serviceInitTime = '2021-4-22'
serviceInitTime = new Date(parseInt(serviceInitTime))
function formatRunningTime(initTime) {
  var diff = new Date(Date.now() - initTime.getTime()).getTime()
  // return (diff / 1000).toFixed(0) + 's'

  var duration = moment.duration(diff)

  var days = duration.days()
  var hours = duration.hours()
  var minutes = duration.minutes()
  var seconds = duration.seconds()

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
      initTimeFormated: moment(serviceInitTime).format('YYYY-MM-DD HH:mm:ss A'),
      runningTime: formatRunningTime(serviceInitTime)
    }
  },
  mounted: function () {
    axios.get('/projects.json').then(res => {
      res.data.forEach(v => {
        this.list.push({
          title: v.title,
          url: '/build/' + v.cmd + '/' + v.config
        })
      })
    })

    setInterval(() => {
      this.runningTime = formatRunningTime(serviceInitTime)
    }, 1000);
  },
  methods: {
    handleRestart() {
      if (confirm('确定要重启 Automate 服务吗？')) {
        location.href = '/restart'
      }
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