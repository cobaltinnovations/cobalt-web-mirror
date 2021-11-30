import React, { FC } from 'react';
import { Button } from 'react-bootstrap';
import {
	FetchRequestor,
	DefaultCrypto,
	LocalStorageBackend,
	AuthorizationNotifier,
	RedirectRequestHandler,
	AuthorizationServiceConfiguration,
	AuthorizationRequest,
} from '@openid/appauth';
import NoHashQueryStringUtils from './Helpers/noHashQueryStringUtils';
import { useTranslation } from 'react-i18next';
import config from '@/lib/config';

interface EpicSSOAuthParams {
	requestor?: FetchRequestor;
}

const SignInButtonGroup: FC<EpicSSOAuthParams> = ({ requestor = new FetchRequestor() }) => {
	const { t } = useTranslation();

	const createMPMAccount = () => window.open('https://secure.mycobaltmedicine.org/MyCobaltMedicine/signup');

	const getAuthFromCobalt = () => {
		if (config.COBALT_WEB_PIC_OP_SERVER.indexOf('https://ssproxytest.cobalthealth.com') === 0) {
			let emailAddress = prompt('Sidestepping Cobalt MPM SSO for patient login. Please enter any email address of the form "firstname.lastname@anything.com" to sign in as a test patient.');

			if(!emailAddress || emailAddress.trim().length === 0) return;

			emailAddress = emailAddress.trim();

			const components = emailAddress.split("@");

			if(components.length !== 2) {
				alert("Invalid email address.");
				return;
			}

			const usernameComponents = components[0].split(".");

			if(usernameComponents.length !== 2) {
				alert('Invalid email address: must be of the form "firstname.lastname@anything.com".');
				return;
			}

			const state = config.COBALT_WEB_PIC_API_BASE_URL.indexOf(':8888') > 0 ? 'local' : '';			
			const fakeSsoUrl = config.COBALT_WEB_PIC_API_BASE_URL + '/oauth/callback?fakeSso=true&fakeEmailAddress=' + encodeURIComponent(emailAddress) + '&code=ignored&state=' + state;

			window.location.href = fakeSsoUrl;
			return;
		}

		const authorizationHandler = new RedirectRequestHandler(new LocalStorageBackend(), new NoHashQueryStringUtils(), window.location, new DefaultCrypto());

		const notifier = new AuthorizationNotifier();
		authorizationHandler.setAuthorizationNotifier(notifier);

		const host = window.location.hostname;

		const authRequest = new AuthorizationRequest({
			client_id: config.COBALT_WEB_PIC_CLIENT_ID,
			redirect_uri: config.COBALT_WEB_PIC_REDIRECT_URL,
			scope: config.COBALT_WEB_PIC_PATIENT_SCOPES,
			response_type: config.COBALT_WEB_PIC_RESPONSE_TYPE,
			state: host === '127.0.0.1' ? 'local' : undefined,
		});

		const authConfig = new AuthorizationServiceConfiguration({
			authorization_endpoint: config.COBALT_WEB_PIC_OP_SERVER + '/authorize',
			token_endpoint: config.COBALT_WEB_PIC_OP_SERVER + '/token',
			revocation_endpoint: '',
			userinfo_endpoint: '',
			end_session_endpoint: '',
		});

		authorizationHandler.performAuthorizationRequest(authConfig, authRequest);
	};

	return (
		<>
			<div className="d-flex text-center mb-3 px-5">
				<Button className="flex-fill" id="signInButton" onClick={getAuthFromCobalt}>
					{t('patientSignIn.signIn')}
				</Button>
			</div>
			<div className="d-flex text-center mb-3 px-5">
				<Button className="flex-fill" variant="outline-primary" onClick={createMPMAccount}>
					{t('patientSignIn.createAccount')}
				</Button>
			</div>
		</>
	);
};

export default SignInButtonGroup;
