import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { AccountSource, AccountSourceDisplayStyleId, INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb } from '@/lib/models';
import { institutionService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import Blurb from '@/components/blurb';
import HalfLayout from '@/components/half-layout';
import InlineAlert from '@/components/inline-alert';
import { ReactComponent as Illustration } from '@/assets/illustrations/sign-in.svg';

export interface SignInCobaltProps {
	onAccountSourceClick: (accountSource: AccountSource) => Promise<void>;
}

const accountSourceVariantMap = {
	[AccountSourceDisplayStyleId.PRIMARY]: 'primary',
	[AccountSourceDisplayStyleId.SECONDARY]: 'outline-primary',
	[AccountSourceDisplayStyleId.TERTIARY]: 'link',
};

export const SignInCobalt = ({ onAccountSourceClick }: SignInCobaltProps) => {
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
		<HalfLayout
			leftColChildren={(className: string) => (
				<div className={className}>
					<h1 className="mb-6 text-center">Welcome to Cobalt</h1>
					<p className="mb-6 mb-lg-8 fs-large text-center">
						Cobalt is a mental health and wellness platform created by and for {institution?.name}{' '}
						employees.
					</p>
					<hr className="mb-6 mb-lg-8" />
					<p className="mb-6 text-center">Select your sign in method to continue.</p>
					<div className="mb-8 mb-lg-10">
						{accountSources
							.filter((accountSource) => accountSource.visible)
							.map((accountSource, index) => {
								const isLast = accountSources.length - 1 === index;
								let variant =
									accountSourceVariantMap[accountSource.accountSourceDisplayStyleId] || 'primary';

								return (
									<>
										{accountSource.supplementMessage && (
											<InlineAlert
												className="mb-6 text-left"
												variant={(accountSource.supplementMessageStyle as 'primary') ?? 'info'}
												title={accountSource.supplementMessage}
											/>
										)}
										<Button
											key={`account-source-${index}`}
											size="lg"
											className={classNames('d-block w-100 text-decoration-none', {
												'mb-3': !isLast,
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
					<AsyncWrapper fetchData={fetchData}>
						{institutionBlurbs && institutionBlurbs?.[INSTITUTION_BLURB_TYPE_ID.INTRO] && (
							<Row>
								<Col>
									<Blurb
										modalTitle={institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].title ?? ''}
										modalDestription={
											institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].description ?? ''
										}
										speechBubbleTitle={
											institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].title ?? ''
										}
										speechBubbleDestription={
											institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].shortDescription ?? ''
										}
										teamMemberImageUrl={
											institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO]
												.institutionTeamMembers?.[0].imageUrl ?? ''
										}
									/>
								</Col>
							</Row>
						)}
					</AsyncWrapper>
				</div>
			)}
			rightColChildren={(className) => <Illustration className={className} />}
		/>
	);
};
