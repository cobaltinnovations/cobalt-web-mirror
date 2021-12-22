import React, { FC, useState, useCallback, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';
import useAccount from '@/hooks/use-account';
import { ReactComponent as ContentCopyIcon } from '@/assets/icons/icon-content-copy.svg';
import CopyToClipboard from 'react-copy-to-clipboard';
import useAlert from '@/hooks/use-alert';
import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import StudioEvent from '@/components/studio-event';
import CollectEmailModal from '@/components/collect-email-modal';
import ConfirmGroupEventBookingModal from '@/components/confirm-group-event-booking-modal';
import ConfirmCancelBookingModal from '@/components/confirm-cancel-booking-modal';

import { groupSessionsService } from '@/lib/services';
import { GroupSessionModel, GroupSessionReservationModel } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';

const InTheStudioGroupSessionScheduled: FC = () => {
	const handleError = useHandleError();
	const history = useHistory<{ passedAssessment?: boolean }>();
	const { groupSessionId } = useParams<{ groupSessionId?: string }>();
	const { account, setAccount } = useAccount();
	const { showAlert } = useAlert();
	const [isBooking, setIsBooking] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);

	const [session, setSession] = useState<GroupSessionModel>();
	const [reservation, setReservation] = useState<GroupSessionReservationModel>();
	const [collectedEmail, setCollectedEmail] = useState(account?.emailAddress ?? '');

	const [showCollectEmailModal, setShowCollectEmailModal] = useState(false);
	const [showConfirmReservationModal, setShowConfirmReservationModal] = useState(false);
	const [showConfirmCancelModal, setShowConfirmCancelModal] = useState<boolean>(false);

	useHeaderTitle(session?.title || '');

	/* --------------------------------------------------------- */
	/* Page blocking data call */
	/* --------------------------------------------------------- */
	const fetchData = useCallback(async () => {
		if (!groupSessionId) {
			throw new Error('groupSessionId is required.');
		}

		const { groupSession, groupSessionReservation } = await groupSessionsService.getGroupSessionById(groupSessionId).fetch();

		setSession(groupSession);
		setReservation(groupSessionReservation);
	}, [groupSessionId]);

	/* --------------------------------------------------------- */
	/* Prepopulate the email modal with the accounts email */
	/* --------------------------------------------------------- */
	useEffect(() => {
		if (account?.emailAddress) {
			setCollectedEmail(account.emailAddress);
		}
	}, [account]);

	/* --------------------------------------------------------- */
	/* This fires after you complete the sessions assessment */
	/* --------------------------------------------------------- */
	useEffect(() => {
		if (typeof history.location.state?.passedAssessment !== 'boolean') {
			return;
		}

		if (history.location.state.passedAssessment) {
			setShowCollectEmailModal(true);
		} else {
			window.alert('Based on your answer(s), this session does not seem like a good match. Please join us in another.');
		}
	}, [account, history.location.state]);

	function handleReserveButtonClick() {
		if (session?.assessmentId) {
			history.push(`/intake-assessment?groupSessionId=${session.groupSessionId}`);
		}

		setShowCollectEmailModal(true);
	}

	return (
		<AsyncPage fetchData={fetchData}>
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
				<ConfirmGroupEventBookingModal
					externalUrl={session.scheduleUrl}
					show={showConfirmReservationModal}
					onHide={() => {
						setShowConfirmReservationModal(false);
					}}
					groupEventName={session.title}
					dateTime={session.startDateTimeDescription}
					onConfirm={async () => {
						if (isBooking) {
							return;
						}

						try {
							setIsBooking(true);

							const response = await groupSessionsService.reserveGroupSession(session.groupSessionId, collectedEmail).fetch();

							setAccount(response.account);
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

						await groupSessionsService.cancelGroupSessionReservation(reservation.groupSessionReservationId).fetch();
						await fetchData();

						setShowConfirmCancelModal(false);
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
						title: 'home',
					},
					{
						to: '/in-the-studio',
						title: 'in the studio',
					},
					{
						to: `/group-session-scheduled/${session?.groupSessionId}`,
						title: session?.title || '',
					},
				]}
			/>

			{reservation && (
				<Container fluid className="bg-success p-0">
					<Container className="pt-4 pb-5">
						<Row>
							<Col>
								<h6 className="text-white text-center mb-1">you've reserved a place for this event</h6>
								<p className="text-white text-center mb-3">Join us at {session?.startDateTimeDescription}</p>
								<div className="d-flex align-items-center justify-content-center">
									<Link className="text-decoration-none" to="/my-calendar">
										<Button as="div" variant="light" size="sm" className="mr-2">
											view calendar
										</Button>
									</Link>
									<Button as="a" variant="light" size="sm" href={session?.videoconferenceUrl || ''} target="_blank">
										join now
									</Button>
								</div>
							</Col>
						</Row>
					</Container>
				</Container>
			)}

			{session && (
				<Container fluid="md">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<StudioEvent groupEvent={session} />
						</Col>
					</Row>
				</Container>
			)}

			<Container className="pt-5 pb-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<p className="mb-0">{session?.description}</p>
					</Col>
				</Row>
				<Row className="mt-5 text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{reservation ? (
							<Button
								variant="outline-primary"
								onClick={() => {
									setShowConfirmCancelModal(true);
								}}
							>
								Cancel Reservation
							</Button>
						) : (
							<Button disabled={session?.seatsAvailable === 0} variant="primary" onClick={handleReserveButtonClick}>
								{session?.seatsAvailable === 0 ? 'No seats available' : 'Reserve a Place'}
							</Button>
						)}
						<CopyToClipboard
							onCopy={() => {
								showAlert({
									variant: 'success',
									text: 'the link was copied to your clipboard',
								});
							}}
							text={`https://${window.location.host}/in-the-studio/group-session-scheduled/${session?.groupSessionId}?immediateAccess=true`}
						>
							<Button className="p-3 ml-2">
								<ContentCopyIcon height={24} width={24} />
							</Button>
						</CopyToClipboard>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default InTheStudioGroupSessionScheduled;
