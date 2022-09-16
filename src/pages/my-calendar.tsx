import React, { FC, useState, useCallback, useEffect, useMemo, createRef, RefObject, useLayoutEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import CalendarAppointment from '@/components/calendar-appointment';
import ConfirmCancelBookingModal from '@/components/confirm-cancel-booking-modal';
import DayContainer from '@/components/day-container';

import { appointmentService, calendarEventsService, groupSessionsService } from '@/lib/services';
import { CalendarEventGroupsModel, CALENDAR_EVENT_TYPE_ID } from '@/lib/models/calendar-event-models';
import useHandleError from '@/hooks/use-handle-error';

interface PendingCancellationModel {
	calendarEventTypeId: CALENDAR_EVENT_TYPE_ID;
	eventId: string;
}

const MyCalendar: FC = () => {
	const handleError = useHandleError();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const appointmentId = searchParams.get('appointmentId') || '';
	const groupSessionReservationId = searchParams.get('groupSessionReservationId') || '';
	const action = searchParams.get('action') || '';
	const [isCancelling, setIsCancelling] = useState(false);
	const [pendingCancellation, setPendingCancellation] = useState<PendingCancellationModel | undefined>(undefined);
	const [showConfirmCancelModal, setShowConfirmCancelModal] = useState<boolean>(false);
	const [calendarEventGroups, setCalendarEventGroups] = useState<CalendarEventGroupsModel[]>([]);
	const locationState = (location.state as { successBooking?: boolean; emailAddress?: string }) || {};

	const eventRefs = useMemo(
		() =>
			calendarEventGroups.reduce((acc, calendarEventGroup) => {
				calendarEventGroup.calendarEvents.forEach((calendarEvent) => {
					const { appointment, groupSession } = calendarEvent;

					if (appointment) {
						acc[appointment.appointmentId] = createRef<HTMLDivElement>();
					}

					if (groupSession) {
						acc[groupSession.groupSessionId] = createRef<HTMLDivElement>();
					}
				});
				return acc;
			}, {} as { [key: string]: RefObject<HTMLDivElement> }),
		[calendarEventGroups]
	);

	const fetchData = useCallback(async () => {
		const upcomingCalendarEventsResponse = await calendarEventsService.getUpcomingCalendarEvents().fetch();
		setCalendarEventGroups(upcomingCalendarEventsResponse.calendarEventGroups);
	}, []);

	useEffect(() => {
		if (groupSessionReservationId && action) {
			switch (action) {
				case 'cancel':
					setPendingCancellation({
						calendarEventTypeId: CALENDAR_EVENT_TYPE_ID.GROUP_SESSION_RESERVATION,
						eventId: groupSessionReservationId,
					});
					break;
				default:
					return;
			}
		}
	}, [action, groupSessionReservationId]);

	useEffect(() => {
		if (appointmentId && action) {
			switch (action) {
				case 'cancel':
					setPendingCancellation({
						calendarEventTypeId: CALENDAR_EVENT_TYPE_ID.APPOINTMENT,
						eventId: appointmentId,
					});
					break;
				default:
					return;
			}
		}
	}, [action, appointmentId]);

	useLayoutEffect(() => {
		if (calendarEventGroups.length === 0 || !appointmentId) {
			return;
		}

		setTimeout(() => {
			//eslint-disable-next-line @typescript-eslint/no-unused-expressions
			eventRefs[appointmentId].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
	}, [appointmentId, eventRefs, calendarEventGroups.length]);

	useEffect(() => {
		setShowConfirmCancelModal(!!pendingCancellation);
	}, [pendingCancellation]);

	return (
		<AsyncPage fetchData={fetchData}>
			<ConfirmCancelBookingModal
				show={showConfirmCancelModal}
				onHide={() => {
					setPendingCancellation(undefined);
				}}
				onConfirm={async () => {
					if (isCancelling || !pendingCancellation) {
						return;
					}

					try {
						setIsCancelling(true);

						if (
							pendingCancellation.calendarEventTypeId === CALENDAR_EVENT_TYPE_ID.GROUP_SESSION_RESERVATION
						) {
							await groupSessionsService
								.cancelGroupSessionReservation(pendingCancellation.eventId)
								.fetch();
						}

						if (pendingCancellation.calendarEventTypeId === CALENDAR_EVENT_TYPE_ID.APPOINTMENT) {
							await appointmentService.cancelAppointment(pendingCancellation.eventId).fetch();
						}

						await fetchData();

						setShowConfirmCancelModal(false);
						setPendingCancellation(undefined);
					} catch (error) {
						handleError(error);
					}

					setIsCancelling(false);
				}}
			/>

			<HeroContainer>
				<h2 className="mb-2 text-center">My Events</h2>
				<p className="text-center mb-0">
					Your booked appointments, group session seats, and more will be available here.
				</p>
			</HeroContainer>

			<div className="pb-8">
				{locationState?.successBooking ? (
					<HeroContainer className="bg-success">
						{locationState?.emailAddress ? (
							<h5 className="text-center text-light mb-0">
								Your session is reserved and we have sent a confirmation to{' '}
								{locationState?.emailAddress}.
							</h5>
						) : (
							<h5 className="text-center mb-0">Your appointment was reserved.</h5>
						)}
					</HeroContainer>
				) : null}

				{calendarEventGroups.length <= 0 && (
					<Container className="pt-5 pb-5">
						<Row>
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
								<p className="text-center mb-0">There are no scheduled events on your calendar.</p>
							</Col>
						</Row>
					</Container>
				)}

				{calendarEventGroups.map((calendarEventGroup, index) => {
					return (
						<div key={index}>
							<DayContainer className={'mb-2'}>
								<p className="mb-0 fw-bold">{calendarEventGroup.date}</p>
							</DayContainer>
							<Container>
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										{calendarEventGroup.calendarEvents.map((calendarEvent) => {
											const {
												calendarEventTypeId,
												appointment,
												groupSession,
												groupSessionReservation,
											} = calendarEvent;

											if (appointment) {
												return (
													<CalendarAppointment
														ref={eventRefs[appointment.appointmentId]}
														key={appointment.appointmentId}
														appointment={appointment}
														className="mb-2"
														onCancel={() => {
															setPendingCancellation({
																calendarEventTypeId,
																eventId: appointment.appointmentId,
															});
														}}
													/>
												);
											}

											if (groupSession && groupSessionReservation) {
												return (
													<CalendarAppointment
														ref={eventRefs[groupSession.groupSessionId]}
														key={groupSession.groupSessionId}
														groupSession={groupSession}
														className="mb-2"
														onCancel={() => {
															setPendingCancellation({
																calendarEventTypeId,
																eventId:
																	groupSessionReservation.groupSessionReservationId,
															});
														}}
													/>
												);
											}

											return null;
										})}
									</Col>
								</Row>
							</Container>
						</div>
					);
				})}
			</div>
		</AsyncPage>
	);
};

export default MyCalendar;
