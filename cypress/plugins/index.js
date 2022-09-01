/**
 * @type {Cypress.PluginConfig}
 */

const core = require('@actions/core')

// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  require('dotenv').config()
  config.env = config.env || {}

  // process.env.JIRA_HOST is a production variable.
  // For unit tests, we want to set this as a 
  // cypress env variable too 
  config.env.JIRA_HOST = process.env.JIRA_HOST
  config.env.myToken = process.env.MYTOKEN
  console.log("JIRA_HOST: " + config.env.JIRA_HOST)

  const fs = require('fs')

  on('task', {
    // Returns filenames in utility/anonymize or utility/convert_me
    getFiles({test = false, convert = false}) {
      var directory = 'utility/anonymize'

      if(convert) {
        directory = 'utility/convert_me'
      }
      
      if(test) {
        directory = `${directory}/test`
      }

      console.log("getFiles directory: ", `${config.fixturesFolder}/${directory}`)
      const contents = fs.readdirSync(`${config.fixturesFolder}/${directory}`, { withFileTypes: true })

      return contents.filter(c => c.isFile()).map(c => c.name)
    },
  })

  return config
}
