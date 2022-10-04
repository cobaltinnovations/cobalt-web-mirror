import React, { FC, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import classNames from 'classnames';

import { accountService, institutionService } from '@/lib/services';
import useSubdomain from '@/hooks/use-subdomain';
import useHandleError from '@/hooks/use-handle-error';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-small.svg';
import { AccountSource, ACCOUNT_SOURCE_DISPLAY_STYLE_ID, ACOUNT_SOURCE_ID } from '@/lib/models';
import AsyncPage from '@/components/async-page';

const useSignInStyles = createUseThemedStyles((theme) => ({
	signInOuter: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
	signIn: {
		paddingTop: 96,
		[mediaQueries.lg]: {
			paddingTop: 32,
		},
	},
	signInInner: {
		maxWidth: 408,
		margin: '0 auto',
	},
}));

const SignIn: FC = () => {
	const handleError = useHandleError();
	const { institution, processAccessToken } = useAccount();
	const subdomain = useSubdomain();
	const classes = useSignInStyles();
	const navigate = useNavigate();

	const [searchParams] = useSearchParams();
	const accountSourceId = searchParams.get('accountSourceId');

	const [accountSources, setAccountSources] = useState<AccountSource[]>([]);

	const fetchAccountSources = useCallback(async () => {
		try {
			const response = await institutionService
				.getAccountSources({
					...(subdomain && { subdomain }),
					...(accountSourceId && { accountSourceId }),
				})
				.fetch();

			setAccountSources(response.accountSources);
		} catch (error) {
			handleError(error);
		}
	}, [accountSourceId, handleError, subdomain]);

	const handleEnterAnonymouslyButtonClick = async () => {
		try {
			const { accessToken } = await accountService
				.createAnonymousAccount({
					...(subdomain && { subdomain }),
				})
				.fetch();

			processAccessToken(accessToken);
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<Container fluid className={classes.signInOuter}>
			<Container className={classes.signIn}>
				<Row>
					<Col>
						<div className={classes.signInInner}>
							<div className="mb-6 text-center">
								<Logo className="text-primary" />
							</div>

							<h1 className="mb-4 text-center">
								Connecting {institution?.name} employees to mental health resources
							</h1>
							<p className="mb-6 mb-lg-8 fs-large text-center">
								Find the right level of mental healthcare, personalized for you.
							</p>
							<hr className="mb-6" />
							<h2 className="mb-6 text-center">Sign in with</h2>

							<AsyncPage fetchData={fetchAccountSources}>
								<div className="text-center mb-3">
									{accountSources.map((accountSource, index) => {
										const isLast = accountSources.length - 1 === index;
										let variant = 'primary';

										switch (accountSource.accountSourceDisplayStyleId) {
											case ACCOUNT_SOURCE_DISPLAY_STYLE_ID.PRIMARY:
												variant = 'primary';
												break;
											case ACCOUNT_SOURCE_DISPLAY_STYLE_ID.SECONDARY:
												variant = 'outline-primary';
												break;
											case ACCOUNT_SOURCE_DISPLAY_STYLE_ID.TERTIARY:
												variant = 'link';
												break;
											default:
												variant = 'primary';
										}

										return (
											<Button
												key={`account-source-${index}`}
												className={classNames('d-block w-100', {
													'mb-4': !isLast,
												})}
												variant={variant}
												onClick={() => {
													if (accountSource.accountSourceId === ACOUNT_SOURCE_ID.ANONYMOUS) {
														handleEnterAnonymouslyButtonClick();
													} else if (
														accountSource.accountSourceId ===
														ACOUNT_SOURCE_ID.EMAIL_PASSWORD
													) {
														navigate('/sign-in/options');
													} else if (accountSource.ssoUrl) {
														window.location.href = accountSource.ssoUrl;
													}
												}}
											>
												{accountSource.authenticationDescription}
											</Button>
										);
									})}
								</div>
							</AsyncPage>
						</div>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default SignIn;
