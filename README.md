# Automate · 自动化

> 简单的**大前端**项目自动化编译和部署工具（本质就是基于`shelljs`的脚本合集 🐚）

## ⚙ 安装说明

```sh
# 一般配置
npm install
npm start

# 作为后台服务
pm2 start ecosystem.config.js

# 基于命令行的手动部署
node deploy_nuxt.js
```

## ✨ 目前实现的功能

- 支持 GET 方法触发部署（网页）
- 支持 POST 方法触发部署（WebHook）
- 现已支持简单的**任务队列**，暂不支持停止任务！

## 🎈 支持的项目

- [Nuxt.js](./deploy_nuxt.md)
- [VueCLI3](./deploy_vuecli3.js)
- [VuePress](./deploy_vuepress.js)
- [基于 git 部署的项目](./deploy_git.js)
- 💎 可以通过编写相应js文件进行扩展
- 有些项目需要手动 clone 至 `./projects`。
- ⚠ 警告：`./projects` 中是项目的原始文件，不建议改动！若在未提交修改前执行部署，修改的内容将会丢失！

## 使用说明

> TODO: 完善该文档

### 🕹 直接执行文件

使用 `node deploy_*.js` 的方式执行，它可以直接运行或者在终端询问配置文件位置。

### 🕹 使用 GET 方法触发部署

- 示例: 访问 `http://xxx.top:8100/build/deploy_nuxt.js/example-prod.json?pwd=123`

  > 相当于执行 `node deploy_nuxt.js example-prod.json`

### 🕹 使用 POST 方法触发部署，适用于 WebHook

- 直接运行： POST `http://xxx.top:8100/build/deploy_null.js/0?pwd=123`

  > 相当于在终端执行 `node deploy_null.js`

- 带配置运行： POST `http://xxx.top:8100/build/deploy_nuxt.js/example.json?pwd=123`

  > 相当于在终端执行 `node deploy_nuxt.js example.json`

- 指定分支构建：POST `http://xxx.top:8100/build/deploy_nuxt.js/example-branch.json?branches=prod,stage&pwd=123`

  > `example-branch.json` 中的 `branch` 将被替换成 WebHook POST body 中的分支名，例如当推送`stage`分支时，POST 的 body 中含有`"ref":"refs/heads/stage"`，最后的结果为：`example-stage.json`
  
  > `branches` 包含了你想构建哪几个分支，用半角逗号隔开。这些分支必须有对应的json配置文件，如果推送的分支不在这里面，则不执行构建。

### 项目列表文件

将 `public/projects.demo.json` 重命名为 `public/projects.json`，即可在 Web 服务首页看到构建列表。