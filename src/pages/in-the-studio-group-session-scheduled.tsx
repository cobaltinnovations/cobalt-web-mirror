import React, { useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';

import { groupSessionsService } from '@/lib/services';
import { GroupSessionModel, GroupSessionReservationModel } from '@/lib/models';

import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import CollectEmailModal from '@/components/collect-email-modal';
import ConfirmGroupSessionBookingModal from '@/components/confirm-group-session-booking-modal';
import ConfirmCancelBookingModal from '@/components/confirm-cancel-booking-modal';
import BackgroundImageContainer from '@/components/background-image-container';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as ContentCopyIcon } from '@/assets/icons/icon-content-copy.svg';
import { SkeletonButton, SkeletonImage, SkeletonText } from '@/components/skeleton-loaders';
import useFlags from '@/hooks/use-flags';
import { queryClient } from '@/app-providers';

const useStyles = createUseThemedStyles((theme) => ({
	mediaContainer: {
		height: 350,
		[mediaQueries.lg]: {
			height: 210,
		},
	},
	badge: {
		right: 32,
		bottom: 24,
		position: 'absolute',
		[mediaQueries.lg]: {
			right: 16,
			bottom: 16,
		},
	},
}));

const InTheStudioGroupSessionScheduled = () => {
	const handleError = useHandleError();
	const location = useLocation();
	const navigate = useNavigate();
	const { groupSessionId } = useParams<{ groupSessionId?: string }>();
	const { account } = useAccount();
	const { addFlag } = useFlags();
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();
	const [isBooking, setIsBooking] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);

	const [session, setSession] = useState<GroupSessionModel>();
	const [reservation, setReservation] = useState<GroupSessionReservationModel>();
	const [collectedEmail, setCollectedEmail] = useState('');

	const [showCollectEmailModal, setShowCollectEmailModal] = useState(false);
	const [showConfirmReservationModal, setShowConfirmReservationModal] = useState(false);
	const [showConfirmCancelModal, setShowConfirmCancelModal] = useState<boolean>(false);

	/* --------------------------------------------------------- */
	/* Page blocking data call */
	/* --------------------------------------------------------- */
	const fetchData = useCallback(async () => {
		if (!groupSessionId) {
			throw new Error('groupSessionId is required.');
		}

		const { groupSession, groupSessionReservation } = await groupSessionsService
			.getGroupSessionById(groupSessionId)
			.fetch();

		setSession(groupSession);
		setReservation(groupSessionReservation);

		/* --------------------------------------------------------- */
		/* This fires after you complete the sessions assessment */
		/* --------------------------------------------------------- */
		const locationState = (location.state as { passedAssessment?: boolean }) || {};
		if (typeof locationState?.passedAssessment !== 'boolean') {
			return;
		}

		if (locationState.passedAssessment) {
			setShowCollectEmailModal(true);
			navigate(location.pathname, {
				replace: true,
				state: {
					passedAssessment: undefined,
				},
			});
		} else {
			window.alert(
				'Based on your answer(s), this session does not seem like a good match. Please join us in another.'
			);
		}
	}, [groupSessionId, location.pathname, location.state, navigate]);

	function handleReserveButtonClick() {
		if (session?.assessmentId) {
			navigate(`/intake-assessment?groupSessionId=${session.groupSessionId}`);
		}

		setShowCollectEmailModal(true);
	}

	return (
		<AsyncPage
			fetchData={fetchData}
			loadingComponent={
				<>
					<Breadcrumb
						breadcrumbs={[
							{
								to: '/',
								title: 'Home',
							},
							{
								to: '/in-the-studio',
								title: 'Group Sessions',
							},
							{
								to: `/#`,
								title: 'Loading...',
							},
						]}
					/>
					<Container className="pb-12">
						<Row className="justify-content-center">
							<Col md={10} lg={8} xl={6}>
								<SkeletonImage height={350} className={classNames(classes.mediaContainer, 'mb-6')} />
								<SkeletonText type="p" width="35%" className="mb-1" />
								<SkeletonText type="p" width="50%" className="mb-1" />
								<SkeletonText type="p" width="25%" className="mb-6" />
								<hr className="mb-6 " />
								<SkeletonText type="p" numberOfLines={3} className="mb-10" />
								<div className="text-center">
									<SkeletonButton />
								</div>
							</Col>
						</Row>
					</Container>
				</>
			}
		>
			<CollectEmailModal
				show={showCollectEmailModal}
				collectedEmail={collectedEmail}
				onHide={() => {
					setShowCollectEmailModal(false);
				}}
				onSubmitEmail={(email) => {
					setCollectedEmail(email);
					setShowCollectEmailModal(false);
					setShowConfirmReservationModal(true);
				}}
			/>

			{session && (
				<ConfirmGroupSessionBookingModal
					externalUrl={session.scheduleUrl}
					show={showConfirmReservationModal}
					onHide={() => {
						setShowConfirmReservationModal(false);
					}}
					groupSessionName={session.title}
					dateTime={session.startDateTimeDescription}
					onConfirm={async () => {
						if (isBooking) {
							return;
						}

						try {
							setIsBooking(true);

							await groupSessionsService
								.reserveGroupSession(session.groupSessionId, collectedEmail)
								.fetch();

							queryClient.invalidateQueries(['account', account?.accountId]);
							await fetchData();

							setShowConfirmReservationModal(false);
						} catch (error) {
							handleError(error);
						}

						setIsBooking(false);
					}}
				/>
			)}

			<ConfirmCancelBookingModal
				show={showConfirmCancelModal}
				onHide={() => {
					setShowConfirmCancelModal(false);
				}}
				onConfirm={async () => {
					if (isCancelling || !session || !reservation) {
						return;
					}

					try {
						setIsCancelling(true);

						await groupSessionsService
							.cancelGroupSessionReservation(reservation.groupSessionReservationId)
							.fetch();
						await fetchData();

						navigate(location.pathname, {
							replace: true,
							state: {
								passedAssessment: undefined,
							},
						});

						setShowConfirmCancelModal(false);
						addFlag({
							variant: 'success',
							title: 'Your reservation has been canceled',
							description: 'This session was removed from your events list',
							actions: [
								{
									title: 'View My Events',
									onClick: () => navigate('/my-calendar'),
								},
							],
						});
					} catch (error) {
						handleError(error);
					}

					setIsCancelling(false);
				}}
			/>

			<Breadcrumb
				breadcrumbs={[
					{
						to: '/',
						title: 'Home',
					},
					{
						to: '/in-the-studio',
						title: 'Group Sessions',
					},
					{
						to: `/group-session-scheduled/${session?.groupSessionId}`,
						title: session?.title || '',
					},
				]}
			/>

			{reservation && (
				<Container fluid className="bg-success p-0">
					<Container className="py-5">
						<Row>
							<Col>
								<h6 className="mb-1 text-white text-center">
									You've reserved a place for this session
								</h6>
								<p className="mb-4 text-white text-center">
									Join us {session?.startDateTimeDescription}
								</p>
								<div className="d-flex align-items-center justify-content-center">
									<Link className="text-decoration-none" to="/my-calendar">
										<Button as="div" variant="light" className="me-2">
											View Calendar
										</Button>
									</Link>
									<Button
										as="a"
										variant="light"
										className="text-decoration-none"
										href={session?.videoconferenceUrl || ''}
										target="_blank"
										rel="noreferrer noopener"
									>
										Join Now
									</Button>
								</div>
							</Col>
						</Row>
					</Container>
				</Container>
			)}

			<Container className="mb-4 mb-lg-10">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<BackgroundImageContainer
							className={classes.mediaContainer}
							imageUrl={session?.imageUrl || placeholderImage}
						>
							<div className="h-100 position-relative">
								{session?.seatsAvailable && session.seatsAvailable <= 20 ? (
									<Badge as="div" bg="outline-secondary" pill className={classes.badge}>
										{session.seatsAvailableDescription}
									</Badge>
								) : null}
							</div>
						</BackgroundImageContainer>
					</Col>
				</Row>
			</Container>

			<Container className="pb-12">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h4 className="mb-0 mb-lg-1">{session?.title}</h4>
						<p className={session?.facilitatorName ? 'mb-0 mb-lg-1' : 'mb-3 mb-lg-5'}>
							{session?.appointmentTimeDescription}
						</p>
						{session?.facilitatorName && (
							<p className="mb-3 mb-lg-5 text-muted">with {session?.facilitatorName}</p>
						)}
						<hr className="mb-2 mb-lg-4" />
						<div
							className="wysiwyg-display"
							dangerouslySetInnerHTML={{ __html: session?.description || '' }}
						/>
						<div className="mt-10 text-center">
							{reservation ? (
								<Button
									variant="danger"
									onClick={() => {
										setShowConfirmCancelModal(true);
									}}
								>
									Cancel Reservation
								</Button>
							) : (
								<Button
									disabled={session?.seatsAvailable === 0}
									variant="primary"
									onClick={handleReserveButtonClick}
								>
									{session?.seatsAvailable === 0 ? 'No Seats Available' : 'Reserve a Place'}
								</Button>
							)}
							<CopyToClipboard
								onCopy={() => {
									addFlag({
										variant: 'success',
										title: 'Copied!',
										description: 'The URL for this session was copied to your clipboard',
										actions: [],
									});
								}}
								text={`https://${window.location.host}/in-the-studio/group-session-scheduled/${session?.groupSessionId}?immediateAccess=true`}
							>
								<Button variant="outline-primary" className="ms-2 p-2">
									<ContentCopyIcon />
								</Button>
							</CopyToClipboard>
						</div>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default InTheStudioGroupSessionScheduled;
