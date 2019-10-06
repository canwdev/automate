# Automate · 自动化系统

简单的大前端项目自动化编译和部署工具（其实就是一堆脚本合集）

## 安装配置

```sh
# 一般配置
npm install
npm start

# 基于命令行的部署
node deploy_nuxt.js
```

## 目前支持的项目类型：

- [VuePress](./deploy_note.js)
- [Nuxt.js(支持使用配置文件)](./deploy_nuxt.js)

你也可以通过编写相应js文件进行扩展

## 支持使用 GET 方法部署

首先运行 `npm start` 启动服务，然后访问`http://localhost:8100/build/deploy_nuxt/default.json`

警告：请勿同时编译相同项目！

后续可能开放支持 WebHooks 的 POST 方法 

## deploy_nuxt.js 备注

- 目前不支持自动创建项目，请手动克隆项目至 `./projects/<your_project_name>` 下，并在 `config_deploy_nuxt` 目录中编写配置文件
- 服务器需要安装node、npm、pm2、7z(p7zip-full)
- 具体使用方式请阅读源码 😂