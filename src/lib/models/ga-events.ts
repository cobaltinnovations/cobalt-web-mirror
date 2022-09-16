export enum AnalyticsEventCategory {
	Screening = 'Screening',
	Content = 'Content',
	ProviderSearch = 'Provider Search',
}

export enum ScreeningEventActions {
	PromptForPhoneNumber = 'Prompted for Phone Number',
	UserSkipPhoneNumberPrompt = 'User Skipped Phone Number Prompt',
}

export enum ContentEventActions {
	UserClickFilterPill = 'User Clicked Filter Pill',
	UserApplyFilter = 'User Applied Filter',
}

export enum ProviderSearchEventActions {
	UserClickFilterPill = 'User Clicked Filter Pill',
	UserApplyFilter = 'User Applied Filter',
	UserResetFilters = 'User Reset Filters',
}
