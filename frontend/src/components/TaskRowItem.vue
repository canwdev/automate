<template>
  <tr>
    <td>{{ item.command }}</td>
    <td>{{ formatTime(item.timestamp) }}</td>
    <td>
      <b-link v-if="item.message" @click.prevent="viewMessage(item)">点击查看</b-link>
      <span v-else>-</span>
    </td>
    <td>{{ item.branch || '-' }}</td>
    <td>
      <span
        :class="colorClass"
      >{{ BuildStatusText[item.buildStatus] || '-' }}</span>
    </td>
    <td>
      <b-link :to="`/log/${item.id}`" :title="item.logName">点击查看</b-link>
    </td>
    <td>
      <b-button-group size="sm">
        <b-button
          v-if="item.buildStatus === BuildStatus.RUNNING"
          variant="danger"
          @click="$emit('abort', item)"
        >终止
        </b-button>
        <b-button
          v-if="isItemDone"
          variant="success"
          @click="$emit('restart', item)"
        >重启
        </b-button>
        <b-button
          v-if="isItemDone"
          variant="warning"
          @click="$emit('delete', item)"
        >删除
        </b-button>
        <span v-if="item.buildStatus === BuildStatus.WAITING">排队中...</span>
      </b-button-group>
    </td>
  </tr>
</template>

<script>
import moment from "moment"
import {
  BuildStatus,
  BuildStatusText,
  isItemDone
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
      BuildStatus,
      BuildStatusText
    }
  },
  computed: {
    isItemDone() {
      return isItemDone(this.item)
    },
    colorClass() {
      if (this.item.buildStatus === BuildStatus.ERRORED) {
        return 'text-danger'
      }
      if (this.item.buildStatus === BuildStatus.RUNNING) {
        return 'text-success'
      }
    }
  },
  methods: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
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
  }
}
</script>

<style scoped>

</style>
