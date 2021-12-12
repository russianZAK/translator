const axios = require('axios')
const vscode = require('vscode')
const md5 = require('md5')
const appid = vscode.workspace.getConfiguration().get('translate.appid')
const secret = vscode.workspace.getConfiguration().get('translate.secret')

module.exports = {
 
  translate(q, from, to) {
    var salt = Math.random()
    return axios({
      method: 'get',
      url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
      params: {
        q,
        appid,
        from,
        to,
        salt,
        sign: md5(appid + q + salt + secret)
      }
    })
  }
}
