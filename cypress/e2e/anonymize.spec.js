/// <reference types="Cypress" />
const { jirafyChangelog } = require('../../utils/changelog')

describe.skip('Anonymize Utility', () => {
    // Utility unit tests read from /test and write to /test/done
    context('utility unit tests', () => {
        it('anonymize', () => {
            cy.task('getFiles', { test: true }).then((files) => {
                files.forEach(file => {
                    cy.anonymize(file, '', true)
                })
            })
        })

        it('anonymize check - equal', () => {
            cy.anonymize('test_base.md', '', true).then(() => {
                cy.fixture('utility/anonymize/test/done/anonymized_test_base.md').then((anonymized) => {
                    cy.fixture('utility/anonymize/test/test_base.md').then((base) => {
                        expect(base).to.equal(anonymized)
                    })
                })
            })
        })

        it('anonymize check - not equal', () => {
            cy.anonymize('test_not_equal_base.md', '', true).then(() => {
                cy.fixture('utility/anonymize/test/done/anonymized_test_not_equal_base.md').then((anonymized) => {
                    cy.fixture('utility/anonymize/test/test_not_equal_base.md').then((base) => {
                        expect(base).not.to.be.equal(anonymized)
                    })
                })
            })
        })

        it('rename anonymize', () => {
            // filename naming convention indicates its designated to be anonymized
            cy.rename('anonymize_rename_test.md').then((f) => {
                expect(f).to.equal('anonymized_rename_test.md')
            })
        })

        it('rename anonymized', () => {
            // file name naming convention indicates already anonymized
            cy.rename('anonymized_rename_test.md').then((f) => {
                expect(f).to.equal('anonymized_rename_test.md')
            })
        })

        it('rename unanonymized', () => {
            // unconventional file name designated to be anonymized
            cy.rename('another_rename_test.md').then((f) => {
                expect(f).to.equal('anonymized_another_rename_test.md')
            })
        })


        it('parse domain from jira host', () => {
            cy.getDomain(true).then((domain) => {
                expect(domain).to.equal('arglebargle')
            })
        })

        it('Jirafy changelog then anonymize', () => {
            // Get files in directory
            cy.task('getFiles', { test: true }).then((files) => {

                // Check for file count
                cy.log(`files ${files}`)

                // loop through each file, read its contents, jirafy it, anonymize it and write file to /done
                files.forEach(file => {
                    cy.log('anonymizing file', file)

                    cy.fixture(`utility/anonymize/test/${file}`).then((changelog) => {

                        cy.wrap({ jirafyChangelog })
                            .invoke('jirafyChangelog', changelog)
                            .then((jirafied_changelog) => {
                                cy.log(jirafied_changelog)

                                cy.anonymize(file, jirafied_changelog, true).then((anonymized_changelog) => {
                                    cy.log('anonymized_changelog is', anonymized_changelog)
                                })
                            })
                    })
                })
            })
        })

        it('convert anonymized changelog', () => {
            // Get files in directory
            cy.task('getFiles', { test: true, convert: true }).then((files) => {

                // Check for file count
                expect(files).length.to.be.greaterThan(0, 'convert_me directory is empty')
                cy.log(`files ${files}`)

                // loop through each file, read its contents, jirafy it, anonymize it and write file to /done
                files.forEach(file => {
                    cy.log('converting file', file)

                    cy.fixture(`utility/convert_me/test/${file}`).then((changelog) => {

                        cy.wrap({ jirafyChangelog })
                            .invoke('jirafyChangelog', changelog)
                            .then((modified_changelog) => {
                                cy.log(modified_changelog)
                                cy.writeFile(`cypress/fixtures/utility/convert_me/test/done/${file}`, modified_changelog)
                            })
                    })
                })
            })
        })
    })

    context('Utility usage', () => {
        // Utility usage context read from anonymize or convert_me respectively and write to /done
        it('anonymize changelog then jirafy it', () => {
            // Get files in directory
            cy.task('getFiles', { test: false, convert: false }).then((files) => {

                // Check for file count
                cy.log(`files ${files}`)

                // loop through each file, read its contents, jirafy it, anonymize it and write file to /done
                files.forEach(file => {
                    cy.log('anonymizing file', file)

                    cy.fixture(`utility/anonymize/${file}`).then((changelog) => {

                        cy.anonymize(file, '').then((anonymized_changelog) => {

                            cy.wrap({ jirafyChangelog })
                                .invoke('jirafyChangelog', anonymized_changelog)
                                .then((jirafied_changelog) => {
                                    cy.log(jirafied_changelog)

                                    cy.rename(file).then((f) => {
                                        cy.writeFile(`cypress/fixtures/utility/anonymize/done/${f}`, jirafied_changelog)
                                    })
                                })
                        })
                    })
                })
            })
        })

        it('convert anonymized changelog', () => {
            // Get files in directory
            cy.task('getFiles', { test: false, convert: true }).then((files) => {

                // Check for file count
                expect(files).length.to.be.greaterThan(0, 'convert_me directory is empty')
                cy.log(`files ${files}`)

                // loop through each file, read its contents, jirafy it, anonymize it and write file to /done
                files.forEach(file => {
                    cy.log('converting file', file)

                    cy.fixture(`utility/convert_me/${file}`).then((changelog) => {
                        cy.wrap({ jirafyChangelog })
                            .invoke('jirafyChangelog', changelog)
                            .then((modified_changelog) => {
                                cy.log(modified_changelog)
                                cy.writeFile(`cypress/fixtures/utility/convert_me/done/${file}`, modified_changelog)
                            })
                    })
                })
            })
        })
    })
})
