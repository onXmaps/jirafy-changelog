const core = require('@actions/core')
const github = require('@actions/github')
const { jirafyChangelog } = require('./utils/changelog')

var headRef = core.getInput('head-ref')
var baseRef = core.getInput('base-ref')
var myToken = core.getInput('myToken')
var octokit = new github.getOctokit(myToken)
const { owner, repo } = github.context.repo
const regexp = /^[.A-Za-z0-9_-]*$/

async function run() {
  try {
    if (!headRef) {
      headRef = github.context.sha
    }

    if (!baseRef) {
      const latestRelease = await octokit.rest.repos.getLatestRelease({
        owner: owner,
        repo: repo,
      })

      if (latestRelease) {
        baseRef = latestRelease.data.tag_name
      } else {
        core.setFailed(`There are no releases on ${owner}/${repo}. Tags are not releases.`)
      }
    }

    if (!!headRef && !!baseRef && regexp.test(headRef) && regexp.test(baseRef)) {
      var resp

      try {
        resp = await octokit.rest.repos.generateReleaseNotes({
          owner: owner,
          repo: repo,
          tag_name: tag,
          target_commitish: 'main',
          previous_tag_name: previousTag
        })

        //resp = await generateReleaseNotes(owner, repo, baseRef, headRef)
      } catch (err) {
        core.setFailed(`Could not generate changelog between references because: ${err.message}`)
        process.exit(1)
      }

      console.log(
        '\x1b[32m%s\x1b[0m',
        `Changelog between ${baseRef} and ${headRef}:\n${resp.data.body}`,
      )

      core.setOutput('changelog', jirafyChangelog(resp.data.body))

    } else {
      core.setFailed('Branch names must contain only numbers, strings, underscores, periods, and dashes.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

/**
 * Generate a name and body describing a release via Github generate-notes API.
 * @param {*} owner 
 * @param {*} repo 
 * @param {*} previousTag 
 * @param {*} tag 
 * @returns Object { name, body }
 */
// async function generateReleaseNotes(owner, repo, previousTag, tag) {  
//   return await octokit.request(`POST /repos/${owner}/${repo}/releases/generate-notes`, {
//     owner: owner,
//     repo: repo,
//     tag_name: tag,
//     target_commitish: 'main',
//     previous_tag_name: previousTag
//   })
// }

try {
  run()
} catch (error) {
  core.setFailed(error.message)
}
