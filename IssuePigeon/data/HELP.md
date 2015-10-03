# Issue Pigeon Firefox Add-on Help

also available in [Deutsch](HELP-de.md)

The Issue Pigeon Firefox Add-on knows how to find the home for issues
and bugs you may find in some well-known project websites.

It will pre-fill bugreports or issue forms with text and feature any
referenced links based on text selections you make prior to clicking
![Issue Pigeon Logo](icon48.png) and then the `Fly` menu entry.

## Usage

Basic usage is described above.

Furthermore you can specify your own additional project definitions
based on existing reporting methods defined at
[Known Site Definitions](known-origins.js).

Click the `Settings` menu entry to specify and save your own JSON
declarations.

See the description under `Settings`.

Declarations will be verified with
`JSON.parse` and syntax errors marked prior to saving.

A Help link is also provided, pointing to this user documentation.

## Feedback

You will be given the opportunity to open github issues (via clickable
notifications) when `Issue Pigeon` cannot find a way to report your
issue or detects other problems.

## Contributing

You can contribute to this add-on at
[github](https://github.com/anaran/IssuePigeonFirefox)
