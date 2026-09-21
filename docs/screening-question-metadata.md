# Screening question metadata

## Footer callouts

Screening questions can opt into the existing blue information-alert presentation for `footerText` by supplying this metadata:

```json
{
	"footerCallout": {
		"title": "How we use this information",
		"displayTypeId": "PRIMARY"
	}
}
```

The callout title comes from `footerCallout.title`, and its body comes from the question's existing `footerText`. Missing or invalid metadata keeps the ordinary footer presentation. The callout does not change the question's answer control or submission behavior; single-select questions with `preferAutosubmit=true` continue to render as buttons and submit as soon as an option is selected.

## Institution location groups

The institution-locations API may return an optional `groupName` for each location. The Booking V2 provider employer selector renders locations with a group name inside an `<optgroup>` and keeps locations without a group as ordinary options. Provider matching continues to use the selected location ID; the group is presentation-only and does not imply location inheritance.
