import React, { RefObject, Suspense, createRef, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import {
	Await,
	LoaderFunctionArgs,
	defer,
	useAsyncValue,
	useLocation,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';

import CalendarAppointment from '@/components/calendar-appointment';
import ConfirmCancelBookingModal from '@/components/confirm-cancel-booking-modal';
import DayContainer from '@/components/day-container';
import HeroContainer from '@/components/hero-container';

import useHandleError from '@/hooks/use-handle-error';
import {
	CALENDAR_EVENT_TYPE_ID,
	CalendarEventGroupModel,
	CalendarEventGroupsModel,
} from '@/lib/models/calendar-event-models';
import { appointmentService, calendarEventsService, groupSessionsService } from '@/lib/services';
import Loader from '@/components/loader';

interface PendingCancellationModel {
	calendarEventTypeId: CALENDAR_EVENT_TYPE_ID;
	eventId: string;
}

interface MyCalendarLoderData {
	calendarEventGroupsPromise: Promise<CalendarEventGroupModel[]>;
}

export const useMyCalendarLoaderData = () => {
	return useRouteLoaderData('my-calendar') as MyCalendarLoderData;
};

export async function loader({ request }: LoaderFunctionArgs) {
	const upcomingCalendarEventsRequest = await calendarEventsService.getUpcomingCalendarEvents();
	request.signal.addEventListener('abort', () => {
		upcomingCalendarEventsRequest.abort();
	});

	const upcomingCalendarEventsResponse = upcomingCalendarEventsRequest.fetch();

	return defer({
		calendarEventGroupsPromise: upcomingCalendarEventsResponse.then((response) => response.calendarEventGroups),
	});
}

export const Component = () => {
	const handleError = useHandleError();
	const location = useLocation();
	const { calendarEventGroupsPromise } = useMyCalendarLoaderData();
	const [searchParams, setSearchParams] = useSearchParams();
	const appointmentId = searchParams.get('appointmentId') || '';
	const groupSessionReservationId = searchParams.get('groupSessionReservationId') || '';
	const action = searchParams.get('action') || '';
	const [isCancelling, setIsCancelling] = useState(false);
	const [pendingCancellation, setPendingCancellation] = useState<PendingCancellationModel | undefined>(undefined);
	const [showConfirmCancelModal, setShowConfirmCancelModal] = useState<boolean>(false);

	const locationState = (location.state as { successBooking?: boolean; emailAddress?: string }) || {};

	const sourceEventId = groupSessionReservationId || appointmentId;
	useEffect(() => {
		if (!sourceEventId || !action) {
			setPendingCancellation(undefined);
			setShowConfirmCancelModal(false);
			return;
		}

		switch (action) {
			case 'cancel':
				setPendingCancellation({
					calendarEventTypeId: groupSessionReservationId
						? CALENDAR_EVENT_TYPE_ID.GROUP_SESSION_RESERVATION
						: CALENDAR_EVENT_TYPE_ID.APPOINTMENT,
					eventId: sourceEventId,
				});
				setShowConfirmCancelModal(true);
				break;

			default:
				return;
		}
	}, [action, groupSessionReservationId, sourceEventId]);

	const clearAction = () => {
		searchParams.delete('action');
		setSearchParams(searchParams, { replace: true });
		setPendingCancellation(undefined);
		setShowConfirmCancelModal(false);
	};

	return (
		<>
			<Helmet>
				<title>Cobalt | My Events</title>
			</Helmet>

			<ConfirmCancelBookingModal
				show={showConfirmCancelModal}
				onHide={() => {
					clearAction();
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

						clearAction();
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

				<Suspense fallback={<Loader />}>
					<Await resolve={calendarEventGroupsPromise}>
						<CalendarEventGroups
							sourceEventId={groupSessionReservationId || appointmentId}
							onCancel={(nextPending) => {
								setPendingCancellation(nextPending);
								setShowConfirmCancelModal(true);
							}}
						/>
					</Await>
				</Suspense>
			</div>
		</>
	);
};

interface CalendarEventGroupsProps {
	sourceEventId?: string;
	onCancel: (pendingCancellation: PendingCancellationModel) => void;
}

const CalendarEventGroups = ({ sourceEventId, onCancel }: CalendarEventGroupsProps) => {
	const calendarEventGroups = useAsyncValue() as CalendarEventGroupsModel[];

	const eventRefs = useMemo(
		() =>
			calendarEventGroups.reduce((acc, calendarEventGroup) => {
				calendarEventGroup.calendarEvents.forEach((calendarEvent) => {
					const { appointment, groupSessionReservation } = calendarEvent;

					if (appointment) {
						acc[appointment.appointmentId] = createRef<HTMLDivElement>();
					}

					if (groupSessionReservation) {
						acc[groupSessionReservation.groupSessionReservationId] = createRef<HTMLDivElement>();
					}
				});
				return acc;
			}, {} as { [key: string]: RefObject<HTMLDivElement> }),
		[calendarEventGroups]
	);

	useLayoutEffect(() => {
		if (calendarEventGroups.length === 0 || !sourceEventId) {
			return;
		}

		eventRefs[sourceEventId]?.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	}, [sourceEventId, eventRefs, calendarEventGroups.length]);

	return (
		<>
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
														onCancel({
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
													ref={eventRefs[groupSessionReservation.groupSessionReservationId]}
													key={groupSession.groupSessionId}
													groupSession={groupSession}
													className="mb-2"
													onCancel={() => {
														onCancel({
															calendarEventTypeId,
															eventId: groupSessionReservation.groupSessionReservationId,
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
		</>
	);
};
