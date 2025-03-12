import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	AccountModel,
	AppointmentModel,
	BetaFeature,
	BetaFeatureId,
	BetaStatusId,
	PersonalizationDetails,
	Institution,
	AccountSupportRole,
	AccountFeature,
	AccountSourceId,
} from '@/lib/models';

export interface AccountResponse {
	account: AccountModel;
}

export interface PatientAccountFormData {
	firstName: string;
	lastName: string;
	birthdate: string;
	phoneNumber: string;
	emailAddress: string;
	genderIdentityId: string;
	raceId: string;
	ethnicityId: string;
	languageCode: string;
	timeZone: string;
	insuranceId: string;
	address: {
		streetAddress1: string;
		streetAddress2: string;
		locality: string;
		region: string;
		postalCode: string;
		postalName: string;
		countryCode: string;
	};
}

export type EpicMatchStep = 'STEP_1' | 'STEP_2' | 'STEP_3' | 'FINISH';

export interface EpicMatchRespone {
	topMatchScore: number;
	topMatchScoreDescription: string;
	topMatchPercentage: number; // between 0 and 1, used for progressbar
	topMatchPercentageDescription: string;
	topMatchConfidence: string;
	topMatchConfidenceDescription: string;
	matchCount: number; // if we have 2 or more matches that meet threshold, that triggers the "multiple matches" failure mode
	matchCountDescription: string;
	matchScoreThreshold: number;
	matchScoreThresholdDescription: string;
	appliedToCurrentAccount: boolean;
	account: AccountModel; // if appliedToCurrentAccount is true then we'll have the new account
}

export interface AccountWithTokenResponse extends AccountResponse {
	accessToken: string;
	destinationUrl?: string;
}

export interface AccountWithInstitutionResponse extends AccountResponse {
	institution: Institution;
}

export interface UpdateEmailAddressForAccountIdData {
	emailAddress: string;
}

export interface UpdatePhoneNumberForAccountIdData {
	phoneNumber: string;
}

export interface RequestAccessTokenData {
	emailAddress: string;
	password: string;
}

export interface EpicPatientData {
	firstName: string;
	lastName: string;
	middleInitial: string;
	dateOfBirth: string;
	address: {
		line1: string;
		line2?: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
	};
	emailAddress: string;
	phoneNumber: string;
	phoneType?: 'MOBILE' | 'HOME';
	nationalIdentifier: string;
	gender?: 'MALE' | 'FEMALE';
}

export interface CreateAnonymousAccountRequestBody {
	accountSourceId: AccountSourceId;
}

export interface InviteAccountRequestBody {
	subdomain: string;
	accountSourceId: string;
	emailAddress: string;
	password: string;
}

export interface ResetPasswordRequestBody {
	passwordResetToken: string;
	password: string;
	confirmPassword: string;
}

export const accountService = {
	account(accountId?: string) {
		return httpSingleton.orchestrateRequest<AccountWithInstitutionResponse>({
			method: 'get',
			url: `/accounts/${accountId}?supplements=CAPABILITIES`,
		});
	},
	createAnonymousAccount(data?: CreateAnonymousAccountRequestBody) {
		return httpSingleton.orchestrateRequest<AccountWithTokenResponse>({
			method: 'post',
			url: '/accounts',
			data,
		});
	},
	getMyChartAccount(myChartAccessToken: string) {
		return httpSingleton.orchestrateRequest<AccountWithTokenResponse>({
			method: 'post',
			url: `/accounts/mychart`,
			data: {
				myChartAccessToken,
			},
		});
	},
	updateEmailAddressForAccountId(accountId: string, data: UpdateEmailAddressForAccountIdData) {
		return httpSingleton.orchestrateRequest<AccountResponse>({
			method: 'put',
			url: `/accounts/${accountId}/email-address`,
			data,
		});
	},
	updatePhoneNumberForAccountId(accountId: string, data: UpdatePhoneNumberForAccountIdData) {
		return httpSingleton.orchestrateRequest<AccountResponse>({
			method: 'put',
			url: `/accounts/${accountId}/phone-number`,
			data,
		});
	},
	getAccountSession(accountSessionId: string) {
		return httpSingleton.orchestrateRequest<string>({
			method: 'get',
			url: `/account-sessions/${accountSessionId}/text`,
		});
	},
	getEmailPasswordAccessToken(data: RequestAccessTokenData) {
		return httpSingleton.orchestrateRequest<AccountWithTokenResponse>({
			method: 'post',
			url: 'accounts/email-password-access-token',
			data,
		});
	},
	epicMatch(
		matchStep: EpicMatchStep,
		data: Partial<EpicPatientData>,
		{
			providerId,
			epicDepartmentId,
			applyToCurrentAccount = false,
		}: { providerId: string; epicDepartmentId: string; applyToCurrentAccount: boolean }
	) {
		return httpSingleton.orchestrateRequest<EpicMatchRespone>({
			method: 'post',
			url: `/epic/patient-match`,
			data: {
				matchStep,
				applyToCurrentAccount,
				providerId,
				epicDepartmentId,
				...data,
			},
		});
	},
	inviteAccount(data: InviteAccountRequestBody) {
		return httpSingleton.orchestrateRequest<{ accountInviteId: string }>({
			method: 'post',
			url: '/accounts/invite',
			data,
		});
	},
	claimInvite(accountInviteId: string) {
		return httpSingleton.orchestrateRequest<{ inviteExpired: boolean }>({
			method: 'put',
			url: `/accounts/claim-invite/${accountInviteId}`,
		});
	},
	resendInvite(accountInviteId: string) {
		return httpSingleton.orchestrateRequest({
			method: 'post',
			url: `/accounts/resend-invite/${accountInviteId}`,
		});
	},
	sendForgotPasswordEmail(emailAddress: string) {
		return httpSingleton.orchestrateRequest({
			method: 'post',
			url: 'accounts/forgot-password',
			data: { emailAddress },
		});
	},
	resetPassword(data: ResetPasswordRequestBody) {
		return httpSingleton.orchestrateRequest({
			method: 'post',
			url: '/accounts/reset-password',
			data,
		});
	},
	getBetaFeatures(accountId: string) {
		return httpSingleton.orchestrateRequest<{ betaFeatureAlerts: BetaFeature[] }>({
			method: 'get',
			url: `/accounts/${accountId}/beta-feature-alerts`,
		});
	},
	updateBetaFeatureAlert(accountId: string, betaFeatureId: BetaFeatureId, betaFeatureAlertStatusId: BetaStatusId) {
		return httpSingleton.orchestrateRequest<{ betaFeature: BetaFeature }>({
			method: 'put',
			url: `/accounts/${accountId}/beta-feature-alerts`,
			data: {
				betaFeatureId,
				betaFeatureAlertStatusId,
			},
		});
	},
	updateBetaStatus(accountId: string, betaStatusId: BetaStatusId) {
		return httpSingleton.orchestrateRequest<{ betaStatusId: BetaStatusId }>({
			method: 'put',
			url: `/accounts/${accountId}/beta-status`,
			data: { betaStatusId },
		});
	},
	getAppointmentDetailsForAccount(accountId: string, appointmentId: string) {
		return httpSingleton.orchestrateRequest<{
			account: AccountModel;
			appointment: AppointmentModel;
			appointments: AppointmentModel[];
			assessment: PersonalizationDetails;
		}>({
			method: 'GET',
			url: `/accounts/${accountId}/appointment-details/${appointmentId}`,
		});
	},
	postRoleRequest(accountId: string, roleId: string) {
		return httpSingleton.orchestrateRequest<unknown>({
			method: 'POST',
			url: `/accounts/${accountId}/role-request`,
			data: { roleId },
		});
	},
	getFederatedLogoutUrl(accountId: string) {
		return httpSingleton.orchestrateRequest<{ federatedLogoutUrl?: string }>({
			method: 'GET',
			url: `/accounts/${accountId}/federated-logout-url`,
		});
	},
	postEmailVerificationCode(
		accountId: string,
		data: { emailAddress: string; accountEmailVerificationFlowTypeId: string; forceVerification?: boolean }
	) {
		return httpSingleton.orchestrateRequest<{ verified: boolean }>({
			method: 'POST',
			url: `/accounts/${accountId}/email-verification-code`,
			data,
		});
	},
	getCheckEmailVerification(accountId: string, searchParams?: { emailAddress?: string }) {
		const params = new URLSearchParams(searchParams);

		return httpSingleton.orchestrateRequest<{ verified: boolean }>({
			method: 'GET',
			url: `/accounts/${accountId}/check-email-verification?${params.toString()}`,
		});
	},
	postApplyEmailVerificationCode(accountId: string, data: { emailAddress: string; code: string }) {
		return httpSingleton.orchestrateRequest<{ verified: boolean }>({
			method: 'POST',
			url: `/accounts/${accountId}/apply-email-verification-code`,
			data,
		});
	},
	acceptConsent(accountId: string) {
		return httpSingleton.orchestrateRequest<AccountResponse>({
			method: 'PUT',
			url: `/accounts/${accountId}/consent-form-accepted`,
		});
	},
	rejectConsent(accountId: string) {
		return httpSingleton.orchestrateRequest<AccountResponse>({
			method: 'PUT',
			url: `/accounts/${accountId}/consent-form-rejected`,
		});
	},
	patchPatientAccount(accountId: string, data: Partial<PatientAccountFormData>) {
		return httpSingleton.orchestrateRequest<AccountResponse>({
			method: 'PATCH',
			url: `/accounts/${accountId}`,
			data,
		});
	},
	setAccountLocation(accountId: string, data: { accountId: string; institutionLocationId: string }) {
		return httpSingleton.orchestrateRequest<AccountResponse>({
			method: 'PUT',
			url: `/accounts/${accountId}/location`,
			data,
		});
	},
	getRecommendedSupportRoles(accountId: string) {
		return httpSingleton.orchestrateRequest<{ supportRoles: AccountSupportRole[] }>({
			method: 'GET',
			url: `/accounts/${accountId}/recommended-support-roles`,
		});
	},
	getRecommendedFeatures(accountId: string) {
		return httpSingleton.orchestrateRequest<{
			features: AccountFeature[];
			appointmentScheduledByFeatureId: {
				[featureId: string]: boolean;
			};
		}>({
			method: 'GET',
			url: `/accounts/${accountId}/provider-triage-recommended-features`,
		});
	},
	getBookingRequirements(accountId: string) {
		return httpSingleton.orchestrateRequest<{ myChartConnectionRequired: boolean }>({
			method: 'GET',
			url: `/accounts/${accountId}/provider-booking-requirements`,
		});
	},
};
