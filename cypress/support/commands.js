const crypto = require('crypto')
const randomstring = require('randomstring')
var jiraHost = Cypress.env('JIRA_HOST')
var testJiraHost = Cypress.env("TEST_JIRA_HOST")
// before anonymization
const prodDomain = getDomain()
// after anonymization
const testDomain = getDomain(true)

Cypress.Commands.add('anonymize', (file, changelog = '', test = false) => {
    var anonymize_path = 'utility/anonymize'
    var full_anonymize_path = `cypress/fixtures/${anonymize_path}`
    var anonymized_changelog

    if (file === '') {
        throw new Error('file cannot be empty')
    }

    // if changelog is empty, read file for changelog, anonymize changelog, write it.
    if (changelog === '') {
        if (test) {
            cy.fixture(`${anonymize_path}/test/${file}`).then((changelog) => {

                anonymized_changelog = anonymize(changelog)

                cy.writeFile(`${full_anonymize_path}/test/done/${rename(file)}`, anonymized_changelog).then(() => {
                    return anonymized_changelog
                })
            })
        }

        if (!test) {
            cy.fixture(`utility/anonymize/${file}`).then((changelog) => {
                anonymized_changelog = anonymize(changelog)
                cy.writeFile(`${full_anonymize_path}/done/${rename(file)}`, anonymized_changelog).then(() => {
                    return anonymized_changelog
                })
            })
        }
    }

    // If changelog is not empty, anonymize it and write the file
    if (changelog !== '') {
        file = rename(file)

        console.log(`file name is: ${file}`)
        if (test) {
            anonymized_changelog = anonymize(changelog)
            cy.writeFile(`${full_anonymize_path}/test/done/${file}`, anonymized_changelog).then(() => {
                return anonymized_changelog
            })
        }

        if (!test) {
            anonymized_changelog = anonymize(changelog)

            cy.writeFile(`${full_anonymize_path}/done/${file}`, anonymized_changelog).then(() => {
                return anonymized_changelog
            })
        }
    }
})

Cypress.Commands.add('rename', (file) => {
    return rename(file)
})

Cypress.Commands.add('domainSwap', (changelog) => {
    return domainSwap(changelog)
})

Cypress.Commands.add('getDomain', (test = false) => {
    return getDomain(test)
})

/**
 * Renames file to established convention.
 * anonymize_ => anonymized_
 * anonymized_ => anonymized_
 * some_name => anonymized_some_name
 * @param {String} file 
 * @returns {String} Renamed File
 */
function rename(file) {
    // Check if the file name is already anonymized
    if (file.substring(0, 11) === 'anonymized_') {
        return file
    }

    // Check if file name convention is designated to be anonymized
    if (file.substring(0, 10) === 'anonymize_') {
        return 'anonymized_' + file.substring(10, file.length)
    }

    // All else, prefix with it anonymized
    return 'anonymized_' + file
}

/**
 * Anonymizes a given changelog by replacing 
 * github sha's, jira ticket references and all domains
 * @param {String} changelog 
 * @returns {String} Anonymized changelog
 */
function anonymize(changelog) {
    var revisedChangelog = replaceSHA(changelog)
    revisedChangelog = replaceJiraTickets(revisedChangelog)
    revisedChangelog = domainSwap(revisedChangelog)

    // avoids pr # generation if changelogs are equal
    if (changelog == revisedChangelog) {
        return generateMergeMessage(revisedChangelog, false)
    }
    return generateMergeMessage(revisedChangelog)
}

/**
 * Anonymizes github shas
 * @param {String} changelog 
 * @returns {String} Anonymized changelog
 */
function replaceSHA(changelog) {
    var revisedChangelog
    var regexStr = '(?:\\*\\s\\[\\`)([a-z0-9]+)(?:\\`\\]\\(http:\\/\\/github.com\\/' + prodDomain + ')(?:\\/.*)(?:\\/?)(?:commit\\/)([a-z0-9]+)(?:\\)\\s)'
    var regex = new RegExp(regexStr, 'gm')

    // Fail if the pattern doesn't match
    if (!regex.test(changelog)) console.log("replace SHA pattern did not match")

    revisedChangelog = changelog.replace(regex, function () {
        var sha = generateSha()
        return `* [\`${sha.substring(0, 7)}\`](http://github.com/${testDomain}/commit/${sha}) `
    })

    return revisedChangelog
}

/**
 * Generates a github sha
 * @returns {String} github sha
 */
function generateSha() {
    return crypto.randomBytes(20).toString('hex');
}

/**
 * Swaps all referenced jira tickets with generated ones
 * @param {String} changelog 
 * @returns {String} Anonymized changelog
 */
function replaceJiraTickets(changelog) {
    var revisedChangelog = changelog
    var regexStr = '(([A-Z]+-[0-9]+)(\\`\\]\\()(https:\\/\\/' + prodDomain + '.atlassian.net\\/browse\\/)([A-Z+-[0-9]+)(\\)))'
    
    // Replace grouped formatted jira tickets first
    var regex = new RegExp(regexStr, 'gm')
    var match = false

    if (regex.test(revisedChangelog)) {
        match = true

        revisedChangelog = revisedChangelog.replace(regex, function () {
            var jiraTicket = generateJiraTicket()
            return `${jiraTicket}\`](https://${testDomain}/browse/${jiraTicket})`
        })
    }

    // Replace single instances of jira tickets
    regex = /([a-zA-Z0-9]+)(-\d+)(?=([a-zA-Z0-9]+)(-\d+)(?=\s|\,)|\])|([a-zA-Z0-9]+)(-\d+)(?=\s|\,|\])/g

    if (regex.test(revisedChangelog)) {
        match = true
        revisedChangelog = revisedChangelog.replace(regex, function () {
            var jiraTicket = generateJiraTicket()
            return jiraTicket
        })
    }

    if (!match) console.log("No patterns matched!")
    return revisedChangelog
}

/**
 * Generates a random jira ticket
 * @returns {String} Random jira ticket
 */
function generateJiraTicket() {
    var alpha = randomstring.generate({
        length: 4,
        charset: 'alphabetic'
    }).toUpperCase()

    var numeric = randomstring.generate({
        length: 4,
        charset: 'numeric'
    })

    return `${alpha}-${numeric}`
}

/**
 * Generates a random merge message
 * @param {String} changelog 
 * @param {Boolean} generatePR 
 * @returns {String} Anonymized changelog
 */
function generateMergeMessage(changelog, generatePR = true) {
    var revisedChangelog

    try {
        const regex = /(Merge\spull\srequest\s)(#[0-9]+)(\sfrom\s)(.*)/gm

        revisedChangelog = changelog.replace(regex, function (s, m1, m2) {
            var prNumber = generatePRNumber()

            if (generatePR) {
                return `Merge pull request #${prNumber} from author/org/branch-name`
            }
            return `Merge pull request ${m2} from author/org/branch-name`
        })

    } catch (error) {
        console.log(error)
    }

    return revisedChangelog
}

/**
 * Generates a random pull request number
 * @returns {String} Random pull request number
 */
function generatePRNumber() {
    return randomstring.generate({
        length: 3,
        charset: 'numeric'
    })
}

/**
 * Swaps productiond domains for test domain
 * @param {String} changelog 
 * @returns {String} Anonymized changelog
 */
function domainSwap(changelog) {
    var revisedChangelog

    try {
        const regex = new RegExp(`(https:\/\/)(${jiraHost})`, 'g')
        revisedChangelog = changelog.replace(regex, '$1${testJiraHost}')
    } catch (error) {
        console.log(error)
    }

    return revisedChangelog
}

/**
 * Parses jiraHost environment variable for the subdomain
 * @returns {String} subdomain
 */
function getDomain(test = false) {
    const regex = /(^.*)\.atlassian.net/g
    if (test) {
        return testJiraHost.replace(regex, '$1')
    }
    return jiraHost.replace(regex, '$1')
}

