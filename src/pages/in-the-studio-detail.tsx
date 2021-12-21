import React, { FC, useCallback, useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import moment from 'moment';

import useHeaderTitle from '@/hooks/use-header-title';
import useAccount from '@/hooks/use-account';

import AsyncPage from '@/components/async-page';
import StudioEvent from '@/components/studio-event';
import CollectEmailModal from '@/components/collect-email-modal';
import ConfirmGroupEventBookingModal from '@/components/confirm-group-event-booking-modal';
import ConfirmCancelBookingModal from '@/components/confirm-cancel-booking-modal';
import Breadcrumb from '@/components/breadcrumb';

import { groupEventService, appointmentService } from '@/lib/services';
import { GroupEvent } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';

interface RouteParams {
	groupEventId: string;
}

const InTheStudioDetail: FC = () => {
	const handleError = useHandleError();
	const { groupEventId } = useParams<RouteParams>();
	const { account, isAnonymous } = useAccount();

	const [isBooking, setIsBooking] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [groupEvent, setGroupEvent] = useState<GroupEvent | null>(null);
	const [collectedEmail, setCollectedEmail] = useState(account?.emailAddress ?? '');
	const [showCollectEmailModal, setShowCollectEmailModal] = useState(false);
	const [showConfirmReservationModal, setShowConfirmReservationModal] = useState<boolean>(false);
	const [showConfirmCancelModal, setShowConfirmCancelModal] = useState<boolean>(false);

	useHeaderTitle(groupEvent?.name ?? '');

	const fetchData = useCallback(async () => {
		if (!groupEventId) return;

		const response = await groupEventService.fetchGroupEvent(groupEventId).fetch();
		setGroupEvent(response.groupEvent);
	}, [groupEventId]);

	useEffect(() => {
		if (account?.emailAddress) {
			setCollectedEmail(account.emailAddress);
		}
	}, [account]);

	const existingAppointmentDate = useMemo(() => {
		const startMoment = moment(groupEvent?.appointment?.localStartDate);
		const [hours, minutes] = (groupEvent?.appointment?.localStartTime ?? '00:00').split(':').map(parseInt);
		startMoment.set({ hours, minutes });

		return startMoment.format('hh:mma on dddd');
	}, [groupEvent]);

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

			<ConfirmCancelBookingModal
				show={showConfirmCancelModal}
				onHide={() => {
					setShowConfirmCancelModal(false);
				}}
				onConfirm={async () => {
					if (isCancelling || !groupEvent || !groupEvent.appointment) {
						return;
					}

					try {
						setIsCancelling(true);

						await appointmentService.cancelAppointment(groupEvent?.appointment?.appointmentId).fetch();

						await fetchData();

						setShowConfirmCancelModal(false);
					} catch (error) {
						handleError(error);
					}

					setIsCancelling(false);
				}}
			/>

			{groupEvent && (
				<ConfirmGroupEventBookingModal
					show={showConfirmReservationModal}
					onHide={() => {
						setShowConfirmReservationModal(false);
					}}
					groupEventName={groupEvent.name}
					dateTime={groupEvent.timeDescription}
					onConfirm={async () => {
						if (isBooking) {
							return;
						}

						try {
							setIsBooking(true);
							await appointmentService
								.createAppointment({
									providerId: groupEvent.provider ? groupEvent.provider.providerId : undefined,
									date: groupEvent.localStartDate,
									time: groupEvent.localStartTime,
									emailAddress: collectedEmail,
									groupEventId: groupEvent.groupEventId,
									groupEventTypeId: groupEvent.groupEventTypeId,
								})
								.fetch();

							await fetchData();

							setShowConfirmReservationModal(false);
						} catch (error) {
							handleError(error);
						}

						setIsBooking(false);
					}}
				/>
			)}

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
						to: '/#',
						title: 'event',
					},
				]}
			/>

			{groupEvent?.appointment && (
				<Container fluid className="bg-success p-0">
					<Container className="pt-4 pb-5">
						<Row>
							<Col>
								<h6 className="text-white text-center mb-1">you've reserved a place for this event</h6>
								<p className="text-white text-center mb-3">Join us at {existingAppointmentDate}</p>
								<div className="d-flex align-items-center justify-content-center">
									<Link className="text-decoration-none" to="/my-calendar">
										<Button as="div" variant="light" size="sm" className="mr-2">
											view calendar
										</Button>
									</Link>
									<Button as="a" variant="light" size="sm" href={groupEvent.appointment.videoconferenceUrl} target="_blank">
										join now
									</Button>
								</div>
							</Col>
						</Row>
					</Container>
				</Container>
			)}

			{groupEvent && (
				<Container fluid="md">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<StudioEvent groupEvent={groupEvent} />
						</Col>
					</Row>
				</Container>
			)}

			<Container className="pt-5 pb-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<p
							className="mb-0"
							dangerouslySetInnerHTML={{
								__html: groupEvent?.description ?? '',
							}}
						/>
					</Col>
				</Row>
				<Row className="mt-5 text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{groupEvent?.appointment ? (
							<Button
								variant="outline-primary"
								onClick={() => {
									setShowConfirmCancelModal(true);
								}}
							>
								Cancel Reservation
							</Button>
						) : (
							<Button
								disabled={groupEvent?.seatsAvailable === 0}
								variant="primary"
								onClick={() => {
									setShowCollectEmailModal(true);
								}}
							>
								{groupEvent?.seatsAvailable === 0 ? 'No seats available' : 'Reserve a Place'}
							</Button>
						)}
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default InTheStudioDetail;
