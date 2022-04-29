/// <reference types="Cypress" />
const { jirafyChangelog, parseChangelogForJiraTickets, uppercaseJiraTickets } = require('../../utils/changelog')

describe('Jirafy Changelog', () => {
    
    const changelog_lowercase = "* [`7e3cb59`](http://github.com/onXmaps/jirafy-changelog/commit/7e3cb591882985c010b7134b9554c7c4a4c6d5b0) [jirafy-2] Add github workflows - Merge pull request #2 from coltdorsey/colt/add-github-workflows \
    * [`718a2e8`](http://github.com/onXmaps/jirafy-changelog/commit/718a2e84911bddcb1e7df6182bcbd233f6c195b3) [JIRAFY-3] Use published action - Merge pull request #3 from coltdorsey/colt/use-published-action \
    * [`fcd361c`](http://github.com/onXmaps/jirafy-changelog/commit/fcd361c85f0cd1a20163c90ba51fce7b489537eb) [jirafy-4] Readme update & version bump - Merge pull request #4 from coltdorsey/release/v1.1.0 \
    * [`4f94449`](http://github.com/onXmaps/jirafy-changelog/commit/4f94449419698e134785e58ceac74702ab47781b) [JIRAFY-5] Readme example release update - Merge pull request #5 from coltdorsey/colt/readme-example-release \
    * [`58e69be`](http://github.com/onXmaps/jirafy-changelog/commit/58e69be6433c786c2618536dc1d1dbbdde30a461) [JIRAFY-6] Image reference fix - Merge pull request #6 from coltdorsey/colt/image-reference-fix \
    * [`1109803`](http://github.com/onXmaps/jirafy-changelog/commit/110980389e537555e257b5a1b07a683a3966eef8) Configure Renovate - Merge pull request #1 from coltdorsey/renovate/configure \
    * [`76bc40f`](http://github.com/onXmaps/jirafy-changelog/commit/76bc40f804cdfe7e42d12c985576fdec21e269a8) Update coltdorsey/jirafy-changelog action to v1.1.0 - Merge pull request #8 from coltdorsey/renovate/coltdorsey-jirafy-changelog-1.x \
    * [`af798a0`](http://github.com/onXmaps/jirafy-changelog/commit/af798a09f8f97c858c4631f760ab995889144779) Update dependency prettier to v2.5.1 - Merge pull request #13 from coltdorsey/renovate/prettier-2.x \
    * [`802f2d5`](http://github.com/onXmaps/jirafy-changelog/commit/802f2d59003a81855c0367afe521979424d7039c) Update dependency eslint to v8.4.1 - Merge pull request #11 from coltdorsey/renovate/eslint-8.x \
    * [`2616445`](http://github.com/onXmaps/jirafy-changelog/commit/26164452d005d08b01bc266abc49de2eae70260c) Update dependency @vercel/ncc to v0.33.0 - Merge pull request #10 from coltdorsey/renovate/vercel-ncc-0.x \
    * [`ce73404`](http://github.com/onXmaps/jirafy-changelog/commit/ce73404ce5cb38c9c6a86b6188a790e76a7575fb) [sdet-486] Updating references - Merge pull request #22 from onXmaps/colt/update-references"

    var jiraTickets

    beforeEach(() => {
        cy.wrap({ jirafyChangelog })
            .invoke('jirafyChangelog', changelog_lowercase)
            .then((changelog) => {
                cy.wrap({ parseChangelogForJiraTickets })
                    .invoke('parseChangelogForJiraTickets', changelog)
                    .then((tickets) => {
                        jiraTickets = tickets
                    })
            })
    })

    context('formatting', () => {
        it('ensures references to jira tickets are uppercase', () => {
            jiraTickets.forEach((ticket) => {
                expect(ticket).to.equal(ticket.toUpperCase())
            })
        })

        it('ensures branch references are omitted from jirafication', () => {
            jiraTickets.forEach((ticket) => {
                expect(ticket).to.not.equal('changelog-1')
            })
        })
    })
})
