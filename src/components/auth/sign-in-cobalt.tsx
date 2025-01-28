import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { ReactComponent as Logo } from '@/assets/logos/logo-cobalt-horizontal.svg';
import useAccount from '@/hooks/use-account';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';
import { AccountSource, AccountSourceDisplayStyleId, INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb } from '@/lib/models';
import { institutionService } from '@/lib/services';

import AsyncWrapper from '@/components/async-page';
import Blurb from '@/components/blurb';
import InlineAlert from '@/components/inline-alert';

export interface SignInCobaltProps {
	onAccountSourceClick: (accountSource: AccountSource) => Promise<void>;
}

const useSignInCobaltStyles = createUseThemedStyles((theme) => ({
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

const accountSourceVariantMap = {
	[AccountSourceDisplayStyleId.PRIMARY]: 'primary',
	[AccountSourceDisplayStyleId.SECONDARY]: 'outline-primary',
	[AccountSourceDisplayStyleId.TERTIARY]: 'link',
};

export const SignInCobalt = ({ onAccountSourceClick }: SignInCobaltProps) => {
	const classes = useSignInCobaltStyles();
	const { institution, accountSources } = useAccount();

	const [institutionBlurbs, setInstitutionBlurbs] = useState<Record<INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb>>();

	const fetchData = useCallback(async () => {
		try {
			const { institutionBlurbsByInstitutionBlurbTypeId } = await institutionService
				.getInstitutionBlurbs()
				.fetch();

			setInstitutionBlurbs(institutionBlurbsByInstitutionBlurbTypeId);
		} catch (error) {
			// don't throw
		}
	}, []);

	return (
		<Container fluid className={classes.signInOuter}>
			<Container className={classes.signIn}>
				<Row className="mb-2">
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

							<div className="text-center mb-3">
								{accountSources.map((accountSource, index) => {
									const isLast = accountSources.length - 1 === index;
									let variant =
										accountSourceVariantMap[accountSource.accountSourceDisplayStyleId] || 'primary';

									return (
										<>
											{accountSource.supplementMessage && (
												<InlineAlert
													className="mb-4 text-left"
													variant={
														(accountSource.supplementMessageStyle as 'primary') ?? 'info'
													}
													title={accountSource.supplementMessage}
												/>
											)}
											<Button
												key={`account-source-${index}`}
												className={classNames('d-block w-100', {
													'mb-4': !isLast,
												})}
												variant={variant}
												data-testid={`signIn-${accountSource.accountSourceId}`}
												onClick={() => {
													onAccountSourceClick(accountSource);
												}}
											>
												{accountSource.authenticationDescription}
											</Button>
										</>
									);
								})}
							</div>
						</div>
					</Col>
				</Row>
				<AsyncWrapper fetchData={fetchData}>
					{institutionBlurbs && institutionBlurbs?.[INSTITUTION_BLURB_TYPE_ID.INTRO] && (
						<Row>
							<Col>
								<Blurb
									modalTitle={institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].title ?? ''}
									modalDestription={
										institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].description ?? ''
									}
									speechBubbleTitle={institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].title ?? ''}
									speechBubbleDestription={
										institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].shortDescription ?? ''
									}
									teamMemberImageUrl={
										institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].institutionTeamMembers?.[0]
											.imageUrl ?? ''
									}
								/>
							</Col>
						</Row>
					)}
				</AsyncWrapper>
			</Container>
		</Container>
	);
};
