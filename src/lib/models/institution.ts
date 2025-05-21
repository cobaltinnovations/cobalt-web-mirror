import { CobaltColorName } from '@/jss/theme';
import { AccountSourceId } from './account';
import { SupportRoleId } from './provider';

export enum AnonymousAccountExpirationStrategyId {
	DEFAULT = 'DEFAULT',
	SINGLE_SESSION = 'SINGLE_SESSION',
}

export enum FeatureId {
	THERAPY = 'THERAPY',
	MEDICATION_PRESCRIBER = 'MEDICATION_PRESCRIBER',
	GROUP_SESSIONS = 'GROUP_SESSIONS',
	COACHING = 'COACHING',
	SELF_HELP_RESOURCES = 'SELF_HELP_RESOURCES',
	SPIRITUAL_SUPPORT = 'SPIRITUAL_SUPPORT',
	CRISIS_SUPPORT = 'CRISIS_SUPPORT',
	MHP = 'MHP',
	MENTAL_HEALTH_PROVIDERS = 'MENTAL_HEALTH_PROVIDERS',
	INSTITUTION_RESOURCES = 'INSTITUTION_RESOURCES',
	PSYCHOLOGIST = 'PSYCHOLOGIST',
	PSYCHIATRIST = 'PSYCHIATRIST',
	MSW = 'MSW',
	PSYCHOTHERAPIST = 'PSYCHOTHERAPIST',
	RESOURCE_NAVIGATOR = 'RESOURCE_NAVIGATOR',
	COUNSELING_SERVICES = 'COUNSELING_SERVICES',
	COURSE = 'COURSE',
}

export interface Institution {
	additionalNavigationItems: AdditionalNavigationItem[];
	alerts: InstitutionAlert[];
	anonymousAccountExpirationStrategyId: AnonymousAccountExpirationStrategyId;
	anonymousEnabled: boolean;
	contactUsEnabled: boolean;
	contentScreeningFlowId?: string;
	emailSignupEnabled: boolean;
	ga4MeasurementId?: string;
	groupSessionsScreeningFlowId?: string;
	groupSessionDefaultIntakeScreeningFlowId: string;
	userSubmittedContentEnabled: boolean;
	userSubmittedGroupSessionEnabled: boolean;
	userSubmittedGroupSessionRequestEnabled: boolean;
	institutionId: string;
	integratedCareEnabled: boolean;
	integratedCareIntakeScreeningFlowId?: string;
	integratedCareScreeningFlowId?: string;
	name: string;
	providerTriageScreeningFlowId?: string;
	requireConsentForm: boolean;
	supportEmailAddress: string;
	supportEnabled: boolean;
	recommendedContentEnabled: boolean;
	groupSessionRequestsEnabled: boolean;
	features: InstitutionFeature[];
	featuresEnabled: boolean;
	featureScreeningFlowId?: string;
	featuredTopicCenterId?: string;
	featuredSecondaryTopicCenterId?: string;
	hasTakenFeatureScreening: boolean;
	takeFeatureScreening: boolean;
	userExperienceTypeId: UserExperienceTypeId;
	patientUserExperienceBaseUrl: string;
	staffUserExperienceBaseUrl: string;
	integratedCarePhoneNumber: string;
	integratedCarePhoneNumberDescription: string;
	integratedCareAvailabilityDescription: string;
	integratedCareProgramName: string;
	myChartName: string;
	myChartDefaultUrl: string;
	myChartInstructionsUrl: string;
	clinicalSupportPhoneNumber: string;
	clinicalSupportPhoneNumberDescription: string;
	techSupportPhoneNumber: string;
	techSupportPhoneNumberDescription: string;
	faqEnabled: boolean;
	epicFhirEnabled: boolean;
	externalContactUsUrl: string;
	privacyPolicyUrl?: string;
	secureFilesharingPlatformName?: string;
	secureFilesharingPlatformUrl?: string;
	tableauEnabled?: boolean;
	contentAudiencesEnabled?: boolean;
	resourcePacketsEnabled?: boolean;
	integratedCarePatientDemographicsRequired: boolean;
	integratedCarePatientCarePreferenceVisible: boolean;
	integratedCareCallCenterName?: string;
	integratedCareMhpTriageOverviewOverride?: string;
	integratedCareBookingInsuranceRequirements?: string;
	landingPageTaglineOverride?: string;
	onboardingScreeningFlowId?: string;
	preferLegacyTopicCenters?: boolean;
}

export interface InstitutionFeature {
	description: string;
	featureId: FeatureId;
	name: string;
	navDescription: string;
	navVisible: boolean;
	landingPageVisible: boolean;
	navigationHeaderId: string;
	recommended: boolean;
	supportRoleIds: SupportRoleId[];
	urlName: string;
	locationPromptRequired: boolean;
	treatmentDescription?: string;
	subtitle?: string;
	bannerMessage?: string;
	bannerMessageDisplayTypeId?: DisplayTypeId;
	recommendationTitleOverride?: string;
	recommendationDescriptionOverride?: string;
	recommendationBookingTitleOverride?: string;
	recommendationBookingUrlOverride?: string;
}

export enum DisplayTypeId {
	PRIMARY = 'PRIMARY',
	SECONDARY = 'SECONDARY',
	SUCCESS = 'SUCCESS',
	DANGER = 'DANGER',
	WARNING = 'WARNING',
	INFO = 'INFO',
	DARK = 'DARK',
	LIGHT = 'LIGHT',
}

export interface AdditionalNavigationItem {
	iconName?: string;
	imageUrl?: string;
	name: string;
	pageId?: string;
	pageUrlName?: string;
	topicCenterId?: string;
	url: string;
}

export enum AccountSourceDisplayStyleId {
	PRIMARY = 'PRIMARY',
	SECONDARY = 'SECONDARY',
	TERTIARY = 'TERTIARY',
}

export enum UserExperienceTypeId {
	STAFF = 'STAFF',
	PATIENT = 'PATIENT',
}

export interface AccountSource {
	accountSourceDisplayStyleId: AccountSourceDisplayStyleId;
	accountSourceId: AccountSourceId;
	authenticationDescription: string;
	description: string;
	supplementMessage?: string;
	supplementMessageStyle?: string;
	ssoUrl?: string;
	visible: boolean;
}

export enum INSTITUTION_BLURB_TYPE_ID {
	INTRO = 'INTRO',
	TEAM = 'TEAM',
	ABOUT = 'ABOUT',
}

export interface InstitutionBlurb {
	institutionBlurbId: string;
	institutionId: string;
	institutionBlurbTypeId: INSTITUTION_BLURB_TYPE_ID;
	title: string;
	description: string;
	shortDescription: string;
	institutionTeamMembers: InstitutionTeamMember[];
}

export interface InstitutionTeamMember {
	institutionTeamMemberId: string;
	institutionId: string;
	title: string;
	subtitle?: string;
	name: string;
	imageUrl: string;
}

export interface InstitutionLocation {
	institutionId: string;
	institutionLocationId: string;
	name: string;
	shortName?: string;
}

export enum AlertTypeId {
	INFORMATION = 'INFORMATION',
	WARNING = 'WARNING',
	ERROR = 'ERROR',
}

export interface InstitutionAlert {
	alertId: string;
	alertTypeId: AlertTypeId;
	title: string;
	message: string;
}

export interface InstitutionResourceGroup {
	institutionResourceGroupId: string;
	institutionId: string;
	name: string;
	urlName: string;
	description: string;
	backgroundColorId: string;
	backgroundColorValueName: CobaltColorName;
	backgroundColorValueCssRepresentation: string;
	textColorId: string;
	textColorValueName: CobaltColorName;
	textColorValueCssRepresentation: string;
	imageUrl?: string;
}

export interface InstitutionResource {
	institutionResourceId: string;
	institutionId: string;
	name: string;
	urlName: string;
	description: string;
	url: string;
	imageUrl: string;
}
