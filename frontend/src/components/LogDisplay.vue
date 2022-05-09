<template>
  <div class="log-display-wrap">
    <TkInput
      v-if="isTextarea"
      class="text-mono"
      type="textarea"
      :value="value"
      :placeholder="placeholder"
      readonly
    ></TkInput>
    <div v-else class="log-display-richtext text-mono">
      <div class="log-display-content">
        <div v-for="(line, index) in parsedLines" :key="index" class="log-line">
          <span v-for="(s, sIndex) in line.spans" :key="sIndex" :style="s.css"
            >{{ s.text }}
          </span>
        </div>

        <div v-if="!parsedLines.length" class="log-line">{{ placeholder }}</div>
      </div>
    </div>
    <div class="config-row">
      <TkSwitch v-model="isTextarea" checkbox size="sm">纯文本</TkSwitch>
      <TkButton size="xs" @click="copyText">复制</TkButton>
    </div>
  </div>
</template>

<script>
import ansi from "ansicolor";
export default {
  name: "LogDisplay",
  props: {
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: "日志为空，可能是任务还没有开始执行",
    },
  },
  data() {
    return {
      isTextarea: false,
    };
  },
  computed: {
    parsedLines() {
      if (this.isTextarea) {
        return [];
      }
      if (!this.value) {
        return [];
      }
      const lines = this.value.split("\n");
      const resultLines = lines.map((line) => ansi.parse(line));
      return resultLines;
    },
  },
  methods: {
    copyText() {
      let text
      if (this.isTextarea) {
        text = this.value
      } else {
        const lines = this.value.split("\n");
        const resultLines = lines.map((line) => ansi.strip(line));
        text = resultLines.join("\n")
      }

      const input = document.createElement('textarea')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('Copy')
      document.body.removeChild(input)
      this.$toast.success(`已复制 ${this.isTextarea ? '(原始文本)': ''}`)
    }
  }
};
</script>

<style lang="scss">
.log-display-wrap {
  textarea {
    font-size: 12px;
    width: 100%;
    height: 500px;
    display: block;
    color: inherit;
    background-color: inherit;
    word-break: break-all;
    word-wrap: break-word;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .log-display-richtext {
    font-size: 12px;
    width: 100%;
    height: 500px;
    display: block;
    color: inherit;
    background-color: inherit;
    word-break: break-all;
    word-wrap: break-word;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: auto;
    padding: 10px;
    box-sizing: border-box;
    resize: both;

    &__content {
      margin: 0;
    }
    .log-line {
      white-space: pre;
    }
  }
  .config-row {
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &>* {
      &+* {
        margin-left: 20px;
      }
    }
  }
}
</style>