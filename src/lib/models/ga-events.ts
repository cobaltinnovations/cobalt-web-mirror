export enum AnalyticsEventCategory {
	LeftNav = 'LeftNav',
	Screening = 'Screening',
	Content = 'Content',
	TopicCenter = 'TopicCenter',
	ProviderSearch = 'Provider Search',
	Crisis = 'Crisis',
}

export enum LeftNavEventActions {
	UserClickLeftNavItem = 'User Clicked Left Nav item',
}

export enum ScreeningEventActions {
	PromptForPhoneNumber = 'Prompted for Phone Number',
	UserSkipPhoneNumberPrompt = 'User Skipped Phone Number Prompt',
}

export enum ContentEventActions {
	UserClickFilterPill = 'User Clicked Filter Pill',
	UserApplyFilter = 'User Applied Filter',
}

export enum TopicCenterEventActions {
	UserClickReserveGroupSession = 'User Clicked on Group Session',
	UserClickReserveGroupSessionByRequest = 'User Clicked on Group Session By Request',
	UserClickPinboardNoteTitleUrl = 'User Clicked on Pinboard Note Title Link',
	UserClickPinboardNoteContentUrl = 'User Clicked on Pinboard Note Content Link',
	UserClickOnYourTimeContent = 'User Clicked on Link to On Your Time',
}

export enum ProviderSearchEventActions {
	UserClickFilterPill = 'User Clicked Filter Pill',
	UserApplyFilter = 'User Applied Filter',
	UserResetFilters = 'User Reset Filters',
}

export enum CrisisEventActions {
	UserClickCrisisHeader = 'User Clicked Crisis Link in Header',
	UserClickCrisisMenu = 'User Clicked Crisis Link in Menu',
	UserClickCrisisError = 'User Clicked Crisis Link in Error Modal',
	UserClickCrisisFeedback = 'User Clicked Crisis Link on Feedback Form',
	UserClickCrisisICAssessment = 'User Clicked Crisis Link in IC Assessment Intro',
	UserClickCrisisTelResource = 'User Clicked Crisis Resource Telephone Link',
	PresentScreeningCrisis = 'Presented Crisis from Screening',
}
