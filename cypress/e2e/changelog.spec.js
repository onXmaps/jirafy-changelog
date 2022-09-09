/// <reference types="Cypress" />
const { jirafyChangelog,
    toUpperJiraTickets, addMarkupToChangelog,
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
                    'Authorization': `Bearer ${Cypress.env('githubToken')}`
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
                    'Authorization': `Bearer ${Cypress.env('githubToken')}`
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
            cy.fixture('brackets/anonymized_changelog_brackets.md').then((ch_b) => {
                cy.wrap({ stripBrackets })
                    .invoke('stripBrackets', ch_b)
                    .then((ch_n_b) => {
                        cy.fixture('brackets/anonymized_changelog_brackets_none.md').then((expectedChangelog) => {
                            expect(ch_n_b).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures jira tickets referenced are surrounded by brackets', () => {
            cy.fixture('brackets/anonymized_changelog_brackets_none.md').then((ch_n_b) => {
                cy.wrap({ surroundTicketListWithBrackets })
                    .invoke('surroundTicketListWithBrackets', ch_n_b)
                    .then((ch_b) => {
                        cy.fixture('brackets/anonymized_changelog_brackets.md').then((expectedChangelog) => {
                            expect(ch_b).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures references to jira tickets are uppercase', () => {
            cy.fixture('lowercase/anonymized_changelog_lowercase.md').then((ch_l) => {
                cy.wrap({ toUpperJiraTickets })
                    .invoke('toUpperJiraTickets', ch_l)
                    .then((ch_u) => {
                        cy.fixture('lowercase/anonymized_changelog_lowercase_none.md').then((expectedChangelog) => {
                            expect(ch_u).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures jira tickets referenced are displayed with proper and spacing', () => {
            cy.fixture('comma_space/anonymized_changelog_comma_space_no.md').then((ch_c_s_b) => {
                cy.wrap({ addCommaSpaceBetweenJiraTickets })
                    .invoke('addCommaSpaceBetweenJiraTickets', ch_c_s_b)
                    .then((ch_c_s) => {
                        cy.fixture('comma_space/anonymized_changelog_comma_space.md').then((expectedChangelog) => {
                            expect(ch_c_s).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures referenced jira tickets include markup', () => {
            cy.fixture('markup/anonymized_changelog_markup_no.md').then((ch_m_n) => {
                cy.wrap({ addMarkupToChangelog })
                    .invoke('addMarkupToChangelog', ch_m_n)
                    .then((ch_m) => {
                        cy.fixture('markup/anonymized_changelog_markup.md').then((expectedChangelog) => {
                            expect(ch_m).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures branch references containing jira tickets are are identified', () => {
            cy.fixture('branch_reference/anonymized_changelog_branch_reference_base.md').then((ch_b_r_b) => {
                cy.wrap({ jirafyChangelog })
                    .invoke('jirafyChangelog', ch_b_r_b)
                    .then((actualChangelog) => {
                        cy.fixture('branch_reference/anonymized_changelog_branch_reference.md').then((expectedChangelog) => {
                            expect(actualChangelog).to.equal(expectedChangelog)
                        })
                    })
            })
        })
    })
})
