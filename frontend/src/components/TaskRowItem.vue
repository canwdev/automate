<template>
  <tr>
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
    <td>
      <b-button
        v-if="item.buildStatus === BuildStatus.RUNNING"
        size="sm" variant="warning"
      >Abort</b-button>
      <b-button
        v-if="isItemDone"
        size="sm" variant="success"
      >Retry</b-button>
      <b-button
        v-if="isItemDone"
        size="sm" variant="danger"
      >删除</b-button>
      <span v-if="item.buildStatus === BuildStatus.WAITING">排队中...</span>
    </td>
  </tr>
</template>

<script>
import moment from "moment"
import {
  BuildStatus
} from '@/enum'

export default {
  name: "TaskRowItem",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      BuildStatus
    }
  },
  computed: {
    isItemDone() {
      return this.item.buildStatus === BuildStatus.FINISH ||
        this.item.buildStatus === BuildStatus.ERRORED
    }
  },
  methods: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    },
  }
}
</script>

<style scoped>

</style>
