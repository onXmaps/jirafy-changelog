/// <reference types="Cypress" />
const { jirafyChangelog,
    toUpperJiraTickets, addJiraLinksToChangelog,
    stripBrackets, addCommaSpaceBetweenJiraTickets,
    surroundTicketListWithBrackets } = require('../../utils/changelog')
const owner = 'onxmaps'
const repo = 'jirafy-changelog'

describe('Jirafy Changelog', () => {
    context('changelog', () => {
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
            cy.fixture('stripBrackets/input-brackets.md').then((input) => {
                cy.wrap({ stripBrackets })
                    .invoke('stripBrackets', input)
                    .then((actualChangelog) => {
                        cy.fixture('stripBrackets/output-without-brackets.md').then((expectedChangelog) => {
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
        
        it('ensures markdown links are added to jira tickets', () => {
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
 
        it('ensures a changelog is correctly and completely jirafied', () => {
            cy.fixture('jirafyChangelog/input-original-changelog-before-jirafy.md').then((input) => {
                cy.wrap({ jirafyChangelog })
                    .invoke('jirafyChangelog', input)
                    .then((actualChangelog) => {
                        cy.fixture('jirafyChangelog/output-changelog-after-jirafy.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it.skip('[SDET-609] fails if known issues are still present', () => {
            cy.fixture('jirafyChangelog/known-issues/sdet-609/input-sdet-609.md').then((input) => {
                cy.wrap({ jirafyChangelog })
                    .invoke('jirafyChangelog', input)
                    .then((actualChangelog) => {
                        cy.fixture('jirafyChangelog/known-issues/sdet-609/output-sdet-609.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })
    })
})
