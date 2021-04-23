const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')

module.exports = {
  async getBuildList(req, res, next) {
    const docPath = path.join(__dirname, '../../configs/build-list-demo.yml')

    let doc = {}
    if (fs.existsSync(docPath)) {
      doc = yaml.load(fs.readFileSync(docPath, 'utf8'));
    }

    try {
      res.sendData(doc)
    } catch (e) {
      next(e)
    }
  }
}
