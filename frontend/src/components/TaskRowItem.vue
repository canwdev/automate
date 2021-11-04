<template>
  <div class="table-row">
    <div class="t-col _cmd">{{ item.command }}</div>
    <div class="t-col _time">{{ formatTime(item.timestamp) }}</div>

    <div class="t-col _branch">{{ item.branch || '-' }}</div>
    <div class="t-col _state">
      <span
        :class="colorClass"
      >{{ BuildStatusText[item.buildStatus] || '-' }}</span>
    </div>
    <div class="t-col _action">
      <div class="button-group">
        <TkButton
            theme="info"
            @click="$router.push(`/log/${item.id}`)"
        >详情
        </TkButton>
        <TkButton
          v-if="item.buildStatus === BuildStatus.RUNNING"
          theme="error"
          @click="$emit('abort', item)"
        >终止
        </TkButton>
        <TkButton
          v-if="isItemDone"
          theme="success"
          @click="$emit('restart', item)"
        >重启
        </TkButton>
        <TkButton
          v-if="isItemDone"
          theme="warning"
          @click="$emit('delete', item)"
        >删除
        </TkButton>
      </div>
    </div>
  </div>
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
        return 'text-error'
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
  }
}
</script>

<style scoped>

</style>
