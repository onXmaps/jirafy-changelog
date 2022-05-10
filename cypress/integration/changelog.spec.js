/// <reference types="Cypress" />
const { jirafyChangelog, parseChangelogForJiraTickets, toUpperJiraTickets, addMarkupToChangelog, 
        stripBrackets, addCommaSpaceBetweenJiraTickets, surroundTicketListWithBrackets } = require('../../utils/changelog')

describe('Jirafy Changelog', () => {
    var jiraTickets
    var baseChangelog

    before(() => {
        cy.exec('./changelog.sh v1.2.0 v1.0.0 onXmaps').then((r) => {
            cy.log('Base changelog', r.stdout)
            baseChangelog = r.stdout
        })
    })

    context('changelog', () => {
        it('ensures accurate changelog is generated', () => {
            cy.fixture('changelog.md').then((expected_changelog) => {
                expect(baseChangelog).to.equal(expected_changelog)
            })
        })

        it('ensures changelog is not generated when there are no changes', () => {
            cy.exec('./changelog.sh v1.2.0 2f18fe6 onXmaps').then((r) => {
                console.log(r)
                cy.log(r.stdout)
                expect(r.stdout).to.equal('No Changes.')
            })
        })
    })

    context('formatting', () => {
        beforeEach(() => {
            cy.wrap({ jirafyChangelog })
                .invoke('jirafyChangelog', baseChangelog)
                .then((changelog) => {
                    cy.wrap({ parseChangelogForJiraTickets })
                        .invoke('parseChangelogForJiraTickets', changelog)
                        .then((tickets) => {
                            jiraTickets = tickets
                        })
                })
        })

        it('ensures changelog is stripped of brackets', () => {
            cy.fixture('changelog_brackets.md').then((ch_b) => {
                cy.wrap({ stripBrackets })
                    .invoke('stripBrackets', ch_b)
                    .then((ch_n_b) => {
                        cy.fixture('changelog_brackets_no.md').then((expectedChangelog) => {
                            expect(ch_n_b).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures references to jira tickets are uppercase', () => {
            cy.fixture('changelog_lowercase.md').then((ch_l) => {
                cy.wrap({ toUpperJiraTickets })
                    .invoke('toUpperJiraTickets', ch_l)
                    .then((ch_u) => {
                        cy.fixture('changelog_lowercase_no.md').then((expectedChangelog) => {
                            expect(ch_u).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensure jira tickets referenced are displayed with proper and spacing', () => {
            cy.fixture('changelog_comma_space_no.md').then((ch_c_s_b) => {
                cy.wrap({ addCommaSpaceBetweenJiraTickets })
                    .invoke('addCommaSpaceBetweenJiraTickets', ch_c_s_b)
                    .then((ch_c_s) => {
                        cy.fixture('changelog_comma_space.md').then((expectedChangelog) => {
                            expect(ch_c_s).to.equal(expectedChangelog)
                        })
                    })
            })
        })


        it('ensure jira tickets referenced are surrounded by brackets', () => {
            cy.fixture('changelog_brackets_no.md').then((ch_n_b) => {
                cy.wrap({ surroundTicketListWithBrackets })
                    .invoke('surroundTicketListWithBrackets', ch_n_b)
                    .then((ch_c_w_b) => {
                        cy.fixture('changelog_brackets.md').then((expectedChangelog) => {
                            expect(ch_c_w_b).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensure referenced jira tickets include markup', () => {
            cy.fixture('changelog_markup_no.md').then((ch_m_n) => {
                cy.wrap({ addMarkupToChangelog })
                    .invoke('addMarkupToChangelog', ch_m_n)
                    .then((ch_m) => {
                        cy.fixture('changelog_markup.md').then((expectedChangelog) => {
                            expect(ch_m).to.equal(expectedChangelog)
                        })
                    })
            })
        })

        it('ensures branch references are not identified as jira tickets', () => {
            jiraTickets.forEach((ticket) => {
                expect(ticket).to.not.equal('changelog-1')
            })
        })
    })
})
