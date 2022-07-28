# Anonymize utility
When collecting new data sets for unit tests, you will usually want to anonymize the data first because it may contain information from private repositories such as repository names, branches, authors, commit sha's, pr numbers, etc or references to jira tickets and domains.

## Using anonymize utility
In the `cypress/fixtures/` directory there are sub-directories `anonymize` and `convert_me`. Use both of these directories when using the utility. Both the `anonymize` and `convert_me` directories also have a `test` sub-directory. These `test` sub-directories are for the utility unit tests to keep those test files separate from the files generated when using the utility. 

The non-test directories are for the actual usage of the anonymize utility.

### How do I use the anonymize utility?
In the `./integration/anonymize.spec.js` file, under the `Utility usage` context you'll find two tests. Depending on your needs, you may use both tests as a one or two step process.

### (Step 1) Anonymize a changelog
- Add your data to a `.md` file(s) in the `./utility/anonymize` directory
- Run the test `anonymize changelog then jirafy it`. (The anonymized file(s) will be output into the `./utility/anonymize/done` directory and prefixed as "anonymized_")

### (Step 2) Run a changelog function on anonymized changelog
- Move your `anonymized_*` file(s) to the `convert_me` directory
- Modify the test `convert anonymized changelog` and replace reference to function `jirafyChangelog` to desired imported function

Example

```
it('convert anonymized changelog', () => {
    ...
    ...
    cy.wrap({ yourNewFunction })
        .invoke('yourNewFunction', changelog)
```