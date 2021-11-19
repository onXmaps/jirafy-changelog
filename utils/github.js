const core = require('@actions/core')
const github = require('@actions/github')

function getJiraCodeFromPRTitle() {
  let titleArr = []
  try {
    const pattern = '(^[A-Z]+-d+)*(,s)*([A-Z]+-d+)*'
    const regex = new RegExp(pattern)
    const title =
      github.context.payload &&
      github.context.payload.pull_request &&
      github.context.payload.pull_request.title

    console.log('CL: ', title)

    core.info('PR Title is: ' + title)
    const isValid = regex.test(title)
    if (!isValid) {
      core.setFailed(
        `Pull request title "${title}" does not match regex pattern "${pattern}".`,
      )
    }

    const result = title.match(pattern)
    console.log(result)
  } catch (error) {
    core.setFailed(error.message)
  }
  return titleArr
}

module.exports = { getJiraCodeFromPRTitle }
