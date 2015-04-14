# Issue Pigeon Firefox Add-on

The Issue Pigeon Firefox Add-on knows how to find the home for issues and bugs you may find in some well-known projects websites.

It will pre-fill bugreports or issue forms with text and feature any referenced links based on text selections you make prior to clicking the `Issue Pigeon` context menu entry.

## Usage

Basic usage is described above.

Furthermore you can specify your own additional project definitions based on existing reporting methods defined at [knownOrigins reportFeedbackInformation.js](https://github.com/anaran/IssuePigeonFirefox/search?utf8=%E2%9C%93&q=knownOrigins+reportFeedbackInformation.js&type=Code)

Use the `Extend Issue Pigeon` context menu entry to specify and save your own JSON declarations. Declarations will be verified with `JSON.parse` prior to saving.

A Help link is also provided, pointingto this user documentation.

## Feedback

You will be given the opportunity to open github issues (via clickable notifications) when `Issue Pigeon` cannot find a way to report your issue or detects other problems.

## Contributing

See [README.md](./README.html), contribute at [github](https://github.com/anaran/IssuePigeonFirefox/blob/master/README.md)
