# Automate · 自动化

简单的 **大前端** 项目自动化编译和部署工具（~~本质就是基于`shelljs`的一堆脚本合集🤣~~）

## 安装配置

```sh
# 一般配置
npm install
npm start

# 作为后台服务
pm2 start ecosystem.config.js

# 基于命令行的手动部署
node deploy_nuxt.js
```

## 目前实现的功能

- 支持 GET 方法触发部署（网页）
- 支持 POST 方法触发部署（WebHook）

### 支持的项目

- [VuePress](./deploy_vuepress.js)
  - 暂不支持配置，通过修改源码的方式自定义
- [Nuxt.js](./deploy_nuxt.js)
  - 支持配置文件，参考 [default.json](config_deploy_nuxt/default.json)
  - 使用7z打包完整包（包括`node_modules`约20MB+）并自动ssh发送服务器解压，几乎不占用线上服务器资源，避免死机！
- 可以通过编写相应js文件进行扩展

> 警告：暂不支持任务队列，请勿同时编译相同项目！

## 使用 GET 方法触发部署

- 示例: 直接访问 `http://xxx.top:8100/build/deploy_nuxt.js/remo-website-stage.json`

  - 相当于执行 `node deploy_nuxt.js remo-website-stage.json`

## 使用 POST 方法触发部署（WebHook）


- 示例: POST http://xxx.top:8100/build/deploy_vuepress.js/0

  - 相当于执行 `node deploy_vuepress.js`


- 示例: POST http://xxx.top:8100/build/deploy_nuxt.js/default.json

  - 相当于执行 `node deploy_nuxt.js default.json`

- 示例: POST http://xxx.top:8100/build/deploy_nuxt.js/remo-website-branch.json?branches=prod,stage

  - `remo-website-branch.json` 中的 `branch` 将被替换成WebHook中的分支名，例如当推送`stage`分支时，POST的body中含有`"ref":"refs/heads/stage"`，最后的结果为：`remo-website-stage.json`
  - `branches` 包含了你想构建哪几个分支，用半角逗号隔开。这些分支必须有对应的json配置文件，如果推送的分支不在这里面，则不执行构建


## deploy_nuxt.js 备注

- 目前不支持自动创建项目，请手动克隆项目至 `./projects/<your_project_name>` 下，并在 `config_deploy_nuxt` 目录中编写配置文件
- 服务器需要安装node、npm、pm2、7z(p7zip-full)
- 具体使用方式请阅读源码 😂