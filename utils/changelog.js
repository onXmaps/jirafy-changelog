const core = require('@actions/core')
var jiraHost = core.getInput('jiraHost') || process.env.JIRA_HOST || Cypress.env('JIRA_HOST')

/**
 * Parses given changelog for Jira tickets
 * @param {String} changelog
 * @returns {Array} Jira tickets parsed from the changelog. Removes duplicates.
 */
function parseChangelogForJiraTickets(changelog) {
  var stories

  try {
    const regex = /([A-Za-z0-9]+-\d+)(?=\]|\,)|([A-Za-z0-9]+-\d+)(?=\`|\s)/gm
    stories = [...changelog.matchAll(regex)]
  } catch (error) {
    console.log(error)
    core.setFailed(error.message)
  }

  const duplicates = stories.map((m) => m[0])
  return [...new Set(duplicates)]
}

/**
 * Enhances a given changelog with consideration of referenced to Jira Tickets
 * @param {String} changelog
 * @returns {String} Modified changelog
 */
 function jirafyChangelog(changelog) {
  return formatChangelog(changelog)
}

/**
 * Formats the given changelog for output
 * @param {String} changelog 
 * @returns Modified changelog
 */
function formatChangelog(changelog) {
  var revisedChangelog = stripBrackets(changelog)
  revisedChangelog = toUpperJiraTickets(revisedChangelog)
  revisedChangelog = addCommaSpaceBetweenJiraTickets(revisedChangelog)
  return surroundTicketListWithBrackets(revisedChangelog)
}

/**
 * Strips referenced jira tickets that are already surrounded by brackets
 * @param {String} changelog 
 * @returns Modified changelog
 */
function stripBrackets(changelog) {
  var revisedChangelog

  try {
    const regex = /(\[?)([a-zA-Z0-9]+)(-\d+)(\]?)(?=\s|\,)/g
    revisedChangelog = changelog.replace(regex, '$2$3')
  } catch(error) {
    console.log(error)
    core.setFailed(error.message)
  }

  return revisedChangelog
}

/**
 * Formats referenced jira tickets to uppercase
 * @param {String} changelog
 * @returns {String} Modified changelog
 */
 function toUpperJiraTickets(changelog) {
  var revisedChangelog

  try {
    const regex = /([a-zA-Z0-9]+)(-\d+)(?=\s|\,)/g
    revisedChangelog = changelog.replace(regex, (p1) => p1.toUpperCase())
  } catch (error) {
    console.log(error)
    core.setFailed(error.message)
  }

  return revisedChangelog
}

/**
 * Separates referenced Jira Tickets with a comma space format
 * @param {String} changelog 
 * @returns Modified changelog
 */
function addCommaSpaceBetweenJiraTickets(changelog) {
  var revisedChangelog

  try {
    const regex = /([A-Z0-9]+-\d+)(\,?|\,?\s?)(?=[A-Z0-9]+-\d+)/g
    revisedChangelog = changelog.replace(regex, '$1, ')
  } catch(error) {
    console.log(error)
    core.setFailed(error.message)
  }

  return revisedChangelog
}

/**
 * Surrounds jira ticket list with brackets
 * @param {String} changelog 
 * @returns Modified changelog
 */
function surroundTicketListWithBrackets(changelog) {
  var revisedChangelog

  try {
    const regex = /((?:[A-Z0-9]+-\d+\,\s)*(?:[A-Z0-9]+-\d+))/g
    revisedChangelog = changelog.replace(regex, '[$1]')
  } catch(error) {
    console.log(error)
    core.setFailed(error.message)
  }

  return revisedChangelog
}

/**
 * Adds markup to a given changelog for referenced Jira Tickets
 * @param {String} changelog
 * @returns {String} Modified changelog
 */
 function addMarkupToChangelog(changelog) {
  var revisedChangelog

  try {
    const regex = /([A-Z0-9]+-\d+)/g
    revisedChangelog = changelog.replace(regex, `[\`$1\`](https://${jiraHost}/browse/$1)`)
  } catch (error) {
    console.log(error)
    core.setFailed(error.message)
  }

  return revisedChangelog
}

module.exports = {
  parseChangelogForJiraTickets,
  jirafyChangelog,
  addMarkupToChangelog,
  toUpperJiraTickets,
  stripBrackets,
  addCommaSpaceBetweenJiraTickets,
  surroundTicketListWithBrackets
}
