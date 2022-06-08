# Anonymize utility
Because changelogs can contain sensitive information, we created a utility to anonymize 
the changelogs so they can be checked in as test data.

What data is anonymized?
Github data
- github domains
- github commit sha
- pull request numbers

Jira data
- jira domains
- jira tickets

## Using anonymize utility
In the `cypress/fixtures/` directory there are subdirectories `anonymize` and `convert_me` directory. Move `.md` file in the respective root subdirectory to either anonymize fully or run a single utility function against a file. When the file is processed, it will be written to the `/test/done` directory.

`utility/anonymize` 

// cypress/fixtures COMPLETED
// cypress/fixtures/changelog.md

// cypress/fixtures/utility/anonymize COMPLETED
// cypress/fixtures/utility/anonymize/test
// cypress/fixtures/utility/anonymize/test/done (these files get generated, and used in assertion)

// cypress/fixtures/utility/convert_me COMPLETED
// cypress/fixtures/utility/convert_me/test/test_convert_me.md
// cypress/fixtures/utility/convert_me/test/done/test_convert_me.md (file is auto generated and used in assertion)