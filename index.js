const core = require('@actions/core')
const github = require('@actions/github')
const { jirafyChangelog } = require('./utils/changelog')

var headRef = core.getInput('head-ref')
var baseRef = core.getInput('base-ref')
var githubToken = core.getInput('githubToken')
var octokit = new github.getOctokit(githubToken)
const { owner, repo } = github.context.repo
const gitRefRegexp = /^[.A-Za-z0-9_\-\/]+$/

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
    
    if (!!headRef && !!baseRef && gitRefRegexp.test(headRef) && gitRefRegexp.test(baseRef)) {
      var resp

      try {
        resp = await octokit.rest.repos.generateReleaseNotes({
          owner: owner,
          repo: repo,
          tag_name: headRef,
          previous_tag_name: baseRef
        })

      } catch (err) {
        core.setFailed(`Could not generate changelog between references because: ${err.message}`)
        process.exit(1)
      }

      console.log(
        '\x1b[32m%s\x1b[0m',
        `Changelog between ${baseRef} and ${headRef}:\n${resp.data.body}`,
      )
      
      const jirafiedChangelog = await jirafyChangelog(resp.data.body)
      core.setOutput('changelog', jirafiedChangelog)

    } else {
      core.setFailed('Git ref names must contain one or more numbers, strings, underscores, periods, slashes and dashes.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

try {
  run()
} catch (error) {
  core.setFailed(error.message)
}
