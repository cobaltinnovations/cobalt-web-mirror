import classNames from 'classnames';
import React, { useMemo } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { ReactComponent as Illustration } from '@/assets/illustrations/sign-in.svg';
import { ReactComponent as Logo } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { InlineAlert } from '@/components/inline-alert';
import useAccount from '@/hooks/use-account';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';
import { AccountSourceDisplayStyleId } from '@/lib/models';

import { SignInCobaltProps } from './sign-in-cobalt';
import { useSearchParams } from 'react-router-dom';

const useSignInPatientStyles = createUseThemedStyles((theme) => ({
	signInOuter: {
		display: 'flex',
	},
	formOuter: {
		flex: 1,
		flexShrink: 0,
	},
	illustrationOuter: {
		flex: 1,
		flexShrink: 0,
		paddingTop: 155,
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
		'& svg': {
			width: '90%',
			margin: '0 auto',
			display: 'block',
		},
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
	signIn: {
		paddingTop: 112,
		[mediaQueries.lg]: {
			paddingTop: 40,
		},
	},
	signInInner: {
		maxWidth: 360,
		margin: '0 auto',
	},
}));

const accountSourceVariantMap = {
	[AccountSourceDisplayStyleId.PRIMARY]: 'primary',
	[AccountSourceDisplayStyleId.SECONDARY]: 'outline-primary',
	[AccountSourceDisplayStyleId.TERTIARY]: 'link',
};

export const SignInPatient = ({ onAccountSourceClick }: SignInCobaltProps) => {
	const [searchParams] = useSearchParams();
	const myChartError = useMemo(() => searchParams.get('myChartError') ?? '', [searchParams]);

	const { institution, accountSources } = useAccount();
	const classes = useSignInPatientStyles();

	return (
		<div className={classes.signInOuter}>
			<div className={classes.formOuter}>
				<Container className={classes.signIn}>
					<Row className="mb-2">
						<Col>
							<div className={classes.signInInner}>
								<div className="mb-10">
									<Logo className="text-primary" width={151.11} height={20} />
								</div>
								<h1 className="mb-6">Welcome to {institution?.name}</h1>
								<h4 className="mb-6">
									The {institution?.integratedCareProgramName} program connects you to the correct
									level of mental healthcare
								</h4>
								<hr className="mb-6" />
								<h3 className="mb-4">Sign in</h3>
								<p className="mb-6">
									Click "Sign In With {institution?.myChartName}" below, then enter your details to
									sign in.
								</p>
								<div className="text-center mb-8">
									{accountSources.map((accountSource, index) => {
										const isLast = accountSources.length - 1 === index;
										let variant =
											accountSourceVariantMap[accountSource.accountSourceDisplayStyleId] ||
											'primary';

										return (
											<Button
												key={`account-source-${index}`}
												variant={variant}
												size="lg"
												className={classNames('d-block w-100', {
													'mb-4': !isLast,
												})}
												data-testid={`signIn-${accountSource.accountSourceId}`}
												onClick={() => {
													onAccountSourceClick(accountSource);
												}}
											>
												{accountSource.authenticationDescription}
											</Button>
										);
									})}
								</div>
								{myChartError && (
									<InlineAlert
										className="mb-4"
										variant="flag-danger"
										title="MPM Permissions"
										description={`You must accept all ${institution.myChartName} permissions to sign in.`}
									/>
								)}
								<InlineAlert
									variant="info"
									title="If you are in crisis"
									description="Contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
								/>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
			<div className={classes.illustrationOuter}>
				<Illustration />
			</div>
		</div>
	);
};
