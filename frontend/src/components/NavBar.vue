<template>
  <div>
    <TkNavBar>
      <template slot="left">
        <router-link to="/" target="_top" class="site-title"
                     title="🔮 Node.js 自动化编译部署工具!"
        >Automate CI
        </router-link>
      </template>
      <template slot="right">
        <TkButton flat v-if="!token" @click="isShowLogin = true">登录</TkButton>
        <TkButton flat v-else @click="clearAuth"><span class="text-error">注销</span></TkButton>
      </template>

    </TkNavBar>

    <TkModalDialog
        v-model="isShowLogin"
        show-close
    >
      <TkCard solid>
        <form class="login-form" ref="form" @submit.stop.prevent="submitLogin">
          <div
              class="form-row"
          >
            <div class="form-title">用户名</div>
            <TkInput
                id="name-input"
                v-model="form.username"
                required
            ></TkInput>
          </div>

          <div class="form-row">
            <div class="form-title">密码</div>
            <TkInput
                type="password"
                v-model="form.password"
                required
            ></TkInput>
          </div>
          <div align="right">
            <TkButton type="submit">提交</TkButton>
          </div>
        </form>
      </TkCard>
    </TkModalDialog>
  </div>
</template>

<script>
import {getToken, removeToken} from '@/utils/auth'
import {getAuth} from '@/api/user'

export default {
  data() {
    return {
      isShowLogin: false,
      form: {
        username: '',
        password: ''
      },
    }
  },
  computed: {
    token: {
      get() {
        return this.$store.state.token
      },
      set(val) {
        this.$store.commit('setToken', val)
      }
    }
  },
  mounted() {
    this.token = getToken()
  },
  methods: {
    async submitLogin() {
      const {
        token,
        username
      } = await getAuth({
        username: this.form.username,
        password: this.form.password
      })
      this.token = token
      // this.isShowLogin = false
      location.reload()
    },
    clearAuth() {
      this.$prompt.create({
        propsData: {
          title: '⚠️ 警告',
          content: `确定要注销吗？`,
          useHTML: true,
          fixed: true,
        }
      }).onConfirm(async (context) => {
        removeToken()
        location.reload()
      })


    }
  }
};
</script>

<style lang="scss" scoped>
.site-navbar {
  margin: 0 0 20px;
  border-bottom: 1px solid #eee;
}

.site-title {
  display: block;
  color: #F44336;
  text-shadow: 4px 4px 0 #FFEB3B;
  font-weight: 600;
  transition: all .3s;
  font-size: 18px;
  text-decoration: none;
}

.site-title:hover {
  text-decoration: none;
  text-shadow: -4px 4px 0 #FFEB3B;
}

.login-form {
  padding: 10px;

  .form-row {
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    .form-title {
      width: 70px;
    }
  }
}
</style>
