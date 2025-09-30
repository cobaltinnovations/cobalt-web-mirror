import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Modal, Row } from 'react-bootstrap';

import {
	AccountSource,
	AccountSourceDisplayStyleId,
	AccountSourceId,
	AnalyticsNativeEventTypeId,
	INSTITUTION_BLURB_TYPE_ID,
	InstitutionBlurb,
} from '@/lib/models';
import { analyticsService, institutionService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import Blurb from '@/components/blurb';
import HalfLayout from '@/components/half-layout';
import InlineAlert from '@/components/inline-alert';
import SvgIcon from '@/components/svg-icon';
import SignInVideoModal from '@/components/sign-in-video-modal';

export interface SignInCobaltProps {
	onAccountSourceClick: (accountSource: AccountSource) => Promise<void>;
}

const accountSourceVariantMap = {
	[AccountSourceDisplayStyleId.PRIMARY]: 'primary',
	[AccountSourceDisplayStyleId.SECONDARY]: 'outline-primary',
	[AccountSourceDisplayStyleId.TERTIARY]: 'link',
};

export const SignInCobalt = ({ onAccountSourceClick }: SignInCobaltProps) => {
	const navigate = useNavigate();
	const { institution, accountSources } = useAccount();
	const [institutionBlurbs, setInstitutionBlurbs] = useState<Record<INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb>>();
	const [showPrivacyModal, setShowPrivacyModal] = useState(false);
	const [showVideoModal, setShowVideoModal] = useState(false);

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

	const showSignUpLogInUi = useMemo(() => {
		const visibleAccountSources = accountSources.filter(({ visible }) => visible);
		const containsEmailPassword = !!visibleAccountSources.find(
			({ accountSourceId }) => accountSourceId === AccountSourceId.EMAIL_PASSWORD
		);

		if (visibleAccountSources.length === 1 && containsEmailPassword) {
			return true;
		}

		return false;
	}, [accountSources]);

	return (
		<>
			<Modal
				centered
				show={showPrivacyModal}
				onHide={() => {
					setShowPrivacyModal(false);
				}}
			>
				<Modal.Body className="p-0">
					<div className="pt-10 px-8">
						<h3 className="mb-4">More about your privacy</h3>
						<div dangerouslySetInnerHTML={{ __html: institution.signInPrivacyDetail ?? '' }} />
					</div>
					<div className="px-8 pt-6 pb-8 text-right">
						<Button
							onClick={() => {
								setShowPrivacyModal(false);
							}}
						>
							Dismiss
						</Button>
					</div>
				</Modal.Body>
			</Modal>

			{institution.signInVideoId && (
				<SignInVideoModal
					videoId={institution.signInVideoId}
					show={showVideoModal}
					onHide={() => {
						setShowVideoModal(false);
					}}
				/>
			)}

			<HalfLayout
				leftColChildren={(className) => (
					<div className={className}>
						<h1 className="mb-6 text-center">{institution.signInTitle ?? 'Welcome to Cobalt'}</h1>
						<p className="mb-6 mb-lg-8 fs-large text-center">
							{institution.signInDescription ??
								`Cobalt is a mental health and wellness platform created by and for ${institution?.name} employees.`}
						</p>
						{institution.signInVideoId && (
							<Button
								size="lg"
								variant="outline-primary"
								className="d-flex align-items-center justify-content-center mb-6 mb-lg-8 d-block w-100"
								onClick={() => {
									setShowVideoModal(true);
								}}
							>
								<SvgIcon kit="fas" icon="play" size={16} className="me-2" />
								{institution.signInVideoCta ?? 'Watch our video'}
							</Button>
						)}
						<hr className="mb-6 mb-lg-8" />
						<p className="mb-6 text-center">
							{institution.signInDirection ?? 'Select your sign in method to continue.'}
						</p>
						{showSignUpLogInUi ? (
							<div className="mb-8 mb-lg-10">
								<Button
									size="lg"
									variant="primary"
									className="mb-3 d-block w-100 text-decoration-none"
									onClick={() => {
										navigate('/sign-up');
									}}
								>
									Sign up
								</Button>
								<Button
									size="lg"
									variant="outline-primary"
									className="d-block w-100 text-decoration-none"
									onClick={() => {
										analyticsService.persistEvent(
											AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE,
											{
												accountSourceId: AccountSourceId.EMAIL_PASSWORD,
											}
										);

										navigate('/sign-in/email');
									}}
								>
									Log in
								</Button>
							</div>
						) : (
							<div className="mb-8 mb-lg-10">
								{accountSources
									.filter((accountSource) => accountSource.visible)
									.map((accountSource, index) => {
										const isLast = accountSources.length - 1 === index;
										let variant =
											accountSourceVariantMap[accountSource.accountSourceDisplayStyleId] ||
											'primary';

										return (
											<React.Fragment key={accountSource.accountSourceId}>
												{accountSource.supplementMessage && (
													<InlineAlert
														className="mb-6 text-left"
														variant={
															(accountSource.supplementMessageStyle as 'primary') ??
															'info'
														}
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
											</React.Fragment>
										);
									})}
							</div>
						)}

						{institution.signInPrivacyOverview && (
							<InlineAlert
								title="About your privacy"
								description={institution.signInPrivacyOverview}
								action={
									institution.signInPrivacyDetail
										? {
												title: 'Learn more',
												onClick: () => {
													setShowPrivacyModal(true);
												},
										  }
										: undefined
								}
							/>
						)}

						{institution.signInCrisisButtonVisible && (
							<InlineAlert
								title="If you are in crisis"
								description="Contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
							/>
						)}

						{institution.signInQuoteVisible && institutionBlurbs && (
							<AsyncWrapper fetchData={fetchData}>
								<Row>
									<Col>
										<Blurb
											modalTitle={institution.signInQuoteTitle ?? ''}
											modalDestription={institution.signInQuoteDetail ?? ''}
											speechBubbleTitle={institution.signInQuoteTitle ?? ''}
											speechBubbleDestription={institution.signInQuoteBlurb ?? ''}
											teamMemberImageUrl={
												institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO]
													.institutionTeamMembers?.[0].imageUrl ?? ''
											}
										/>
									</Col>
								</Row>
							</AsyncWrapper>
						)}
					</div>
				)}
			/>
		</>
	);
};
