export enum AnalyticsEventCategory {
	LeftNav = 'LeftNav',
	Screening = 'Screening',
	Content = 'Content',
	TopicCenter = 'TopicCenter',
	ProviderSearch = 'Provider Search',
	Crisis = 'Crisis',
}

export enum MainNavEventActions {
	UserClickNavItem = 'nav-click',
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
	UserClickGroupSession = 'topic-center-group-session-click',
	UserClickGroupSessionByRequest = 'topic-center-group-session-by-request-click',
	UserClickPinboardNote = 'topic-center-community-connections-click',
	UserClickOnYourTimeContent = 'topic-center-resources-click',
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
