import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useSubdomain from '@/hooks/use-subdomain';
import useHeaderTitle from '@/hooks/use-header-title';

import { accountService } from '@/lib/services';

import { ReactComponent as LogoIconText } from '@/assets/logos/logo-icon-and-text.svg';
import useHandleError from '@/hooks/use-handle-error';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';

const useSignInStyles = createUseThemedStyles((theme) => ({
	logoIconText: {
		'& path': {
			fill: theme.colors.primary,
		},
	},
}));

const SignIn: FC = () => {
	useHeaderTitle(null);

	const handleError = useHandleError();
	const { accountSources, subdomainInstitution } = useAccount();
	const subdomain = useSubdomain();
	const classes = useSignInStyles();
	const history = useHistory();

	async function handleEnterAnonymouslyButtonClick() {
		try {
			const { accessToken } = await accountService
				.createAnonymousAccount({
					...(subdomain ? { subdomain } : {}),
				})
				.fetch();

			history.replace({
				pathname: '/auth',
				search: '?' + new URLSearchParams({ accessToken }).toString(),
			});
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<Container className="pt-20">
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<div className="d-flex justify-content-center mb-12">
						<LogoIconText className={classes.logoIconText} />
					</div>

					<p className="mb-2 text-center font-size-m font-weight-bold">Sign in</p>
					<>
						{subdomainInstitution?.ssoEnabled && (
							<div className="d-flex text-center mb-3 px-5">
								<Button
									className="flex-fill"
									variant="primary"
									onClick={() => {
										if (accountSources && accountSources.length === 1) {
											const firstAccountSource = accountSources[0];
											window.location.href = firstAccountSource.ssoUrl;
										} else {
											history.push('/sign-in-sso');
										}
									}}
								>
									with my Single-Sign-On Account
								</Button>
							</div>
						)}

						{subdomainInstitution?.emailEnabled && (
							<div className="d-flex text-center mb-3 px-5">
								<Button
									className="flex-fill"
									variant="outline-primary"
									onClick={() => {
										history.push('/sign-in-email');
									}}
								>
									with my email
								</Button>
							</div>
						)}

						{subdomainInstitution?.anonymousEnabled && (
							<div className="d-flex text-center mb-3 px-5">
								<Button
									className="flex-fill"
									variant="outline-primary"
									onClick={handleEnterAnonymouslyButtonClick}
								>
									anonymously
								</Button>
							</div>
						)}

						{subdomainInstitution?.emailEnabled && (
							<div className="text-center mb-3 px-5">
								<Button
									variant="link"
									onClick={() => {
										history.push('/sign-up');
									}}
								>
									sign up
								</Button>
							</div>
						)}
					</>
				</Col>
			</Row>
		</Container>
	);
};

export default SignIn;
