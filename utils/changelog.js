const core = require('@actions/core')
const jiraHost = core.getInput('jiraHost') || process.env.JIRA_HOST

/**
 * Parses given changelog for Jira tickets
 * @param {String} changelog
 * @returns {Array} Jira tickets parsed from the changelog. Removes duplicates.
 */
function parseChangelogForJiraTickets(changelog) {
  var stories

  try {
    const regex = /([A-Za-z0-9]+-\d+)(?=`)/g
    stories = [...changelog.matchAll(regex)]
  } catch (error) {
    console.log(error)
    core.setFailed(error.message)
  }

  const duplicates = stories.map((m) => m[0])

  return [...new Set(duplicates)]
}

/**
 * Adds markup to a given changelog for referenced Jira Tickets
 * @param {String} changelog
 * @returns {String} Modified changelog
 */
function addMarkupToChangelog(changelog) {
  var revisedChangelog

  try {
    const regex = /(\[?)([A-Za-z0-9]+-\d+)(\]?)(?=\s)/gm
    revisedChangelog = changelog.replace(regex, ` [\`$2\`](https://${jiraHost}/browse/$2)`)
  } catch (error) {
    console.log(error)
    core.setFailed(error.message)
  }

  console.log('markup changelog: ', revisedChangelog)
  return revisedChangelog
}

/**
 * Formats referenced jira tickets to uppercase
 * @param {String} changelog
 * @returns {String} Modified changelog
 */
function formatJiraTickets(changelog) {
  var revisedChangelog

  try {
    const regex = /([A-Za-z0-9]+-\d+)(?=`)/g
    revisedChangelog = changelog.replace(regex, (p1) => p1.toUpperCase())
  } catch (error) {
    console.log(error)
    core.setFailed(error.message)
  }

  console.log('format Jira changelog: ', revisedChangelog)
  return revisedChangelog
}

/**
 * Add Jira markup to changelog
 * @param {String} changelog
 * @returns {String} Modified changelog
 */
function jirafyChangelog(changelog) {
  var revisedChangelog = addMarkupToChangelog(changelog)
  var formattedChangelog = formatJiraTickets(revisedChangelog)

  return formattedChangelog
}

module.exports = {
  parseChangelogForJiraTickets,
  jirafyChangelog,
  addMarkupToChangelog,
  formatJiraTickets,
}
