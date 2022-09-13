/// <reference types="Cypress" />
const core = require('@actions/core')
var jiraHost = core.getInput('jiraHost') || process.env.JIRA_HOST || Cypress.env('TEST_JIRA_HOST')

const { jirafyChangelog,
    toUpperJiraTickets, addJiraLinksToChangelog,
    stripBrackets, addCommaSpaceBetweenJiraTickets,
    surroundTicketListWithBrackets } = require('../../utils/changelog')
const owner = 'onxmaps'
const repo = 'jirafy-changelog'

describe('Jirafy Changelog', () => {
    context('changelog', () => {
        // TODO verify
        it('github api changelog - different tag', () => {
            cy.request({
                method: 'POST',
                url: `https://api.github.com/repos/${owner}/${repo}/releases/generate-notes`,
                headers: {
                    'Authorization': `Bearer ${Cypress.env('GITHUB_TOKEN')}`
                },
                body: {
                    owner: owner,
                    repo: repo,
                    tag_name: 'v1.3.0',
                    target_commitish: 'main',
                    previous_tag_name: 'v1.2.0'
                }
            }).then((resp) => {
                cy.fixture('changelog/output-changelog-different-tag.md').then((expectedChangelog) => {
                    expect(resp.body.body).to.equal(expectedChangelog)
                })
            })
        })

        // TODO verify
        it('github api changelog - same tag', () => {
            cy.request({
                method: 'POST',
                url: `https://api.github.com/repos/${owner}/${repo}/releases/generate-notes`,
                headers: {
                    'Authorization': `Bearer ${Cypress.env('GITHUB_TOKEN')}`
                },
                body: {
                    owner: owner,
                    repo: repo,
                    tag_name: 'v1.3.0',
                    target_commitish: 'main',
                    previous_tag_name: 'v1.3.0'
                }
            }).then((resp) => {
                cy.fixture('changelog/output-changelog-same-tag.md').then((expectedChangelog) => {
                    expect(resp.body.body).to.equal(expectedChangelog)
                })
            })
        })
    })

    context('formatting', () => {
        it('ensures changelog is stripped of brackets', () => {
            cy.fixture('brackets/input-brackets.md').then((input) => {
                cy.wrap({ stripBrackets })
                    .invoke('stripBrackets', input)
                    .then((actualChangelog) => {
                        cy.fixture('brackets/output-without-brackets.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures jira tickets referenced are surrounded by brackets', () => {
            cy.fixture('surroundTicketListWithBrackets/input-without-brackets.md').then((input) => {
                cy.wrap({ surroundTicketListWithBrackets })
                    .invoke('surroundTicketListWithBrackets', input)
                    .then((actualChangelog) => {
                        cy.fixture('surroundTicketListWithBrackets/output-normalized-brackets.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures references to jira tickets are uppercase', () => {
            cy.fixture('toUpperJiraTickets/input-before-uppercasing-jira-key.md').then((input) => {
                cy.wrap({ toUpperJiraTickets })
                    .invoke('toUpperJiraTickets', input)
                    .then((actualChangelog) => {
                        cy.fixture('toUpperJiraTickets/output-uppercase-jira-key.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures jira tickets referenced are displayed with proper comma and spacing', () => {
            cy.fixture('addCommaSpaceBetweenJiraTickets/input-multiple-tickets.md').then((input) => {
                cy.wrap({ addCommaSpaceBetweenJiraTickets })
                    .invoke('addCommaSpaceBetweenJiraTickets', input)
                    .then((actualChangelog) => {
                        cy.fixture('addCommaSpaceBetweenJiraTickets/output-multiple-tickets-normalized-separators.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        // TODO create data and verify
        it('ensures referenced jira tickets include markup', () => {
            cy.fixture('addJiraLinksToChangelog/input-before-adding-links.md').then((input) => {
                cy.wrap({ addJiraLinksToChangelog })
                    .invoke('addJiraLinksToChangelog', input)
                    .then((actualChangelog) => {
                        cy.fixture('addJiraLinksToChangelog/output-after-adding-links.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        // TODO verify
        it('ensures branch references containing jira tickets are identified', () => {
            cy.fixture('branch_reference/anonymized_changelog_branch_reference_base.md').then((input) => {
                cy.wrap({ jirafyChangelog })
                    .invoke('jirafyChangelog', input)
                    .then((actualChangelog) => {
                        cy.fixture('branch_reference/anonymized_changelog_branch_reference.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })
    })
})
