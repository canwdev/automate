# Automate

> 简易的前端自动化编译部署工具（本质就是 🐚 `shelljs` 的脚本合集）

## ⚙ 安装说明

- 将 `./configs/password.demo.json` 重命名为 `password.json`；该文件为登录密码，默认用户和密码都是 `admin`
- 将 `./public/projects.demo.json` 重命名为 `projects.json`；该文件为示例项目配置文件

```sh
# 安装依赖
yarn install
# 启动服务
yarn start

# 使用 pm2 作为后台服务
pm2 start ecosystem.config.js

# 基于命令行的手动部署
node deploy_nuxt.js
```

## ✨ 功能

- 支持手动触发部署
- 支持 GET/POST API 触发部署，适用于网页与 WebHook
- 支持简单的任务队列，但暂不支持停止

## 🐚 支持构建的项目

- [Nuxt.js](./deploy_nuxt.md)
- [VueCLI3](./deploy_vuecli3.js)
- [VuePress](./deploy_vuepress.js)
- [基于 git 部署的项目](./deploy_git.js)
- 🎈 可以通过编写相应 JS 脚本进行扩展
- ⚠ 有些项目需要手动 clone 至 `./projects`
- ⚠ 警告：`./projects` 中是项目的原始文件，不建议改动。若在未提交修改前执行部署，修改的内容将会丢失

---

## 🔮  使用方式

### 🕹 手动部署

- 在网页（默认为`http://localhost:8100/`） 点击项目按钮开始部署
- 使用 `node deploy_*.js` 的方式执行，它可以直接运行或者在终端询问配置文件位置。

### 🕹 使用 GET 方法触发部署

- 示例: `http://xxx.top:8100/build/deploy_nuxt.js/example-prod.json?pwd=123`

  > 相当于执行 `node deploy_nuxt.js example-prod.json`

### 🕹 使用 POST 方法触发部署，适用于 WebHook

- 简单运行： POST `http://xxx.top:8100/build/deploy_null.js/0?pwd=123`

  > 相当于在终端执行 `node deploy_null.js`

- 带配置运行： POST `http://xxx.top:8100/build/deploy_nuxt.js/example.json?pwd=123`

  > 相当于在终端执行 `node deploy_nuxt.js example.json`

- 指定分支构建：POST `http://xxx.top:8100/build/deploy_nuxt.js/example-branch.json?branches=prod,stage&pwd=123`

  > `example-branch.json` 中的 `branch` 将被替换成 WebHook POST body 中的分支名，例如当推送`stage`分支时，POST 的 body 中含有`"ref":"refs/heads/stage"`，最后的结果为：`example-stage.json`
  
  > `branches` 包含了你想构建哪几个分支，用半角逗号隔开。这些分支必须有对应的json配置文件，如果推送的分支不在这里面，则不执行构建。