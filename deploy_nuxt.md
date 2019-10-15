# deploy_nuxt.js 使用说明

- 支持配置文件，参考 [default.json](config_nuxt/default.json)
- 使用7z打包完整包（包括`node_modules`约20MB+）并自动ssh发送服务器解压，几乎不占用线上服务器资源，避免死机！
- 目前不支持自动创建项目，请手动克隆项目至 `./projects/<your_project_name>` 下，并在 `config_nuxt` 目录中编写配置文件
- 服务器需要安装node、npm、pm2、7z(p7zip-full)
- 具体使用方式请阅读[源码](./deploy_nuxt.js)

## 使用步骤

1. 进入 projects 文件夹，克隆项目，并切换到要发布的分支
2. 修改json配置文件（config_nuxt/???.json）
3. 直接运行 node deploy_nuxt.js 或者带参数运行 node deploy_nuxt.js ???.json