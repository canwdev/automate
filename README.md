# Automate CI

> 警告: 个人项目，仅供娱乐。请勿用于正式环境。

## ✨ 功能

> 简易的自动化编译部署工具
> 
> 通过 🐚 `shelljs` 执行脚本来完成部署工作，脚本可以完全自定义
> 
> 目前仅支持在 Linux 系统上运行

- 支持网页/命令行触发部署
- 支持 POST API 触发部署，用于 WebHook
- 支持简单任务队列

## ⚙ 安装 & 配置

```sh
# 安装依赖
yarn install
# 启动服务
yarn start

# 使用 pm2 作为后台服务
pm2 start ecosystem.config.js

# 基于命令行的手动部署
node deploy_nuxt.js

# 前端 Web 界面
cd frontend
yarn install
## 构建前端生产版本
yarn build
```

- 将 `./config/project-list-demo.yml` 复制为 `project-list.yml`，该文件为项目配置目录
- 若要自定义配置，创建 `./config/config.json`，内容参考 `./config/index.js`
- 默认用户名密码均为 `admin`

## 🖥️ 支持构建的项目

- [Nuxt.js](./deploy_nuxt.md)
- [Vue CLI 3](./deploy_vuecli3.js)
- [VuePress](./deploy_vuepress.js)
- [基于 git 部署的项目](./deploy_git.js)
- ⚠ 可以通过自行编写 JS 脚本进行扩展
- ⚠ 项目需要手动 clone 至 `./projects` 目录
- ⚠ 注意：`./projects` 中是项目的原始文件，请勿修改。若在未提交代码之前执行部署操作，修改将丢失

---

## 🔮 用法

### 🕹 手动部署

- 在终端执行 `node deploy_*.js` 命令
- 在前端页面（默认为`http://localhost:8100/`）点击项目按钮开始部署

### 🕹 使用 POST 方法触发部署

#### 参数说明

```
POST /api/build/

query: {
    cmd, // Node.js 命令
    args, // 参数
    username, // 用户名
    password, // 密码
    br_limit // 限定分支
}

body: {
    ref: 'refs/heads/master'
    ... // WebHook 推送数据
}
```

#### 简单运行

```
POST http://localhost:8100/api/build
	?cmd=deploy_demo.js&args=demo_arg
	&username=admin&password=admin
```

相当于在终端运行 `node deploy_demo.js`

#### 带配置运行

```
POST http://localhost:8100/api/build
	?cmd=deploy_nuxt.js&args=example.json
	&username=admin&password=admin
```
相当于在终端执行 `node deploy_nuxt.js example.json`

#### 限定构建分支

```
POST http://localhost:8100/api/build
	?cmd=deploy_nuxt.js&args=example-__branch__.json
    &br_limit=prod,stage
    &username=admin&password=admin
```

其中，`__branch__` 将被替换成 WebHook POST 消息体中 `ref` 指定的分支名。

例如当推送 `stage` 分支时，POST 消息中含有`"ref":"refs/heads/stage"`，替换后的结果为：`example-stage.json`

`br_limit` 包含了你想限定构建的几个分支，用半角逗号隔开。这些分支必须有对应的 json 配置文件，如果POST消息里的分支不是其中的某个分支，则不会执行构建。
