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
    const regex = /([A-Za-z0-9]+-\d+)/g
    stories = [...changelog.matchAll(regex)]
  } catch (error) {
    core.setFailed(error.message)
  }

  const duplicates = stories.map((m) => m[0])

  return [...new Set(duplicates)]
}

/**
 * Add Jira markup to changelog
 * @param {String} changelog
 * @returns {String} Modified changelog that includes Jira ticket hyperlink(s)
 */
function jirafyChangelog(changelog) {
  var revisedChangelog

  try {
    // (\[?)([A-Za-z0-9]+-\d+)(\]?)(?=\s) SDET-525
    const regex = /(\[?)([A-Za-z0-9]+-\d+)(\]?)/gm
    revisedChangelog = changelog.replace(regex, ` [\`$2\`](https://${jiraHost}/browse/$2)`)
  } catch (error) {
    core.setFailed(error.message)
  }

  return revisedChangelog
}

module.exports = {
  parseChangelogForJiraTickets,
  jirafyChangelog,
}
