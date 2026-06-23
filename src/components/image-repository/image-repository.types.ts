export enum IMAGE_REPOSITORY_SCREEN_ID {
	SCREEN_ONE = 'screenOne',
	SCREEN_TWO = 'screenTwo',
	SCREEN_THREE = 'screenThree',
}

export interface ImageRepositoryScreenProps {
	onNavigate(nextScreenId: IMAGE_REPOSITORY_SCREEN_ID): void;
}
