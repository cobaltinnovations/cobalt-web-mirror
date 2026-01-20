import React, { useCallback, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Helmet } from '@/components/helmet';
import { LoaderFunctionArgs, useLoaderData, useLocation, useNavigate, useRevalidator } from 'react-router-dom';

import GroupSession from '@/components/group-session';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import { analyticsService, groupSessionsService } from '@/lib/services';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import moment from 'moment';
import Cookies from 'js-cookie';
import { AnalyticsNativeEventTypeId } from '@/lib/models';
import useAccount from '@/hooks/use-account';

export enum GroupSessionDetailNavigationSource {
	HOME_PAGE = 'HOME_PAGE',
	GROUP_SESSION_LIST = 'GROUP_SESSION_LIST',
	GROUP_SESSION_COLLECTION = 'GROUP_SESSION_COLLECTION',
	TOPIC_CENTER = 'TOPIC_CENTER',
	ADMIN_LIST = 'ADMIN_LIST',
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const urlName = params.groupSessionIdOrUrlName;

	if (!urlName) {
		throw new Error('Unknown Session Id or Url Name');
	}

	const { groupSession, groupSessionReservation } = await groupSessionsService
		.getGroupSessionByIdOrUrlName(urlName)
		.fetch();

	analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_GROUP_SESSION_DETAIL, {
		groupSessionId: groupSession.groupSessionId,
	});

	return { groupSession, groupSessionReservation };
};

export const Component = () => {
	const { groupSession, groupSessionReservation } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const handleError = useHandleError();
	const revalidator = useRevalidator();
	const location = useLocation();
	const { institution } = useAccount();

	const navigationSource =
		(location.state?.navigationSource as GroupSessionDetailNavigationSource) ??
		GroupSessionDetailNavigationSource.GROUP_SESSION_LIST;
	const topicCenterPath = location.state?.topicCenterPath ?? '';
	const { createScreeningSession, renderedCollectPhoneModal, renderedPreScreeningLoader } = useScreeningFlow({
		screeningFlowId: groupSession.screeningFlowId,
		groupSessionId: groupSession.groupSessionId,
		instantiateOnLoad: false,
		checkCompletionState: false,
	});

	const navigate = useNavigate();
	const { addFlag } = useFlags();

	const [confirmModalIsShowing, setConfirmModalIsShowing] = useState(false);
	const [cancelModalIsShowing, setCancelModalIsShowing] = useState(false);

	const handleReserveButtonClick = useCallback(() => {
		if (groupSession.screeningFlowId) {
			Cookies.set('groupSessionDetailNavigationSource', navigationSource);
			if (navigationSource === GroupSessionDetailNavigationSource.TOPIC_CENTER && topicCenterPath) {
				Cookies.set('groupSessionDetailFromTopicCenterPath', topicCenterPath);
			}
			groupSession.groupSessionCollectionUrlName &&
				Cookies.set('groupSessionCollectionUrlName', groupSession.groupSessionCollectionUrlName);
			createScreeningSession();
			return;
		}

		setConfirmModalIsShowing(true);
	}, [
		createScreeningSession,
		groupSession.groupSessionCollectionUrlName,
		groupSession.screeningFlowId,
		navigationSource,
		topicCenterPath,
	]);

	const handleModalConfirmButtonClick = useCallback(async () => {
		try {
			await groupSessionsService.reserveGroupSession(groupSession.groupSessionId).fetch();
			revalidator.revalidate();

			setConfirmModalIsShowing(false);
			addFlag({
				variant: 'success',
				title: 'Your seat is reserved',
				description: 'This session was added to your events list',
				actions: [
					{
						title: 'View My Events',
						onClick: () => {
							navigate('/my-calendar');
						},
					},
				],
			});
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, groupSession.groupSessionId, handleError, navigate, revalidator]);

	const handleModalCancelButtonClick = useCallback(async () => {
		try {
			if (!groupSessionReservation) {
				throw new Error('groupSessionReservation is undefined');
			}

			await groupSessionsService
				.cancelGroupSessionReservation(groupSessionReservation.groupSessionReservationId)
				.fetch();
			revalidator.revalidate();

			setCancelModalIsShowing(false);
			addFlag({
				variant: 'success',
				title: 'Your reservation has been canceled',
				description: 'This session was removed from your events list',
				actions: [
					{
						title: 'View My Events',
						onClick: () => {
							navigate('/my-calendar');
						},
					},
				],
			});
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, groupSessionReservation, handleError, navigate, revalidator]);

	const groupSessionTime = (
		<p className="mb-0">
			{moment(groupSession.startDateTime, 'YYYY-MM-DD[T]HH:mm').format('MMM D[,] YYYY')} &bull;{' '}
			{groupSession.startTimeDescription} - {groupSession.endTimeDescription}
		</p>
	);

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Group Session Detail</title>
			</Helmet>

			{renderedCollectPhoneModal}

			<Modal
				show={confirmModalIsShowing}
				centered
				onHide={() => {
					setConfirmModalIsShowing(false);
				}}
			>
				<Modal.Header closeButton>
					<Modal.Title>Confirm Reservation</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-0 fw-bold">{groupSession.title}</p>
					{groupSessionTime}
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button
						variant="outline-primary"
						className="me-2"
						onClick={() => {
							setConfirmModalIsShowing(false);
						}}
					>
						Cancel
					</Button>
					<Button variant="primary" type="submit" onClick={handleModalConfirmButtonClick}>
						Confirm
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal
				show={cancelModalIsShowing}
				centered
				onHide={() => {
					setCancelModalIsShowing(false);
				}}
			>
				<Modal.Header closeButton>
					<Modal.Title>Cancel Reservation</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-4 fw-bold">Are you sure you want to cancel this reservation?</p>
					<p className="mb-0 fw-bold">Reservation Details</p>
					<p className="mb-0">{groupSession.title}</p>

					{groupSessionTime}
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button
						variant="outline-primary"
						className="me-2"
						onClick={() => {
							setCancelModalIsShowing(false);
						}}
					>
						No, Don't Cancel
					</Button>
					<Button variant="primary" type="submit" onClick={handleModalCancelButtonClick}>
						Yes, Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			<GroupSession
				groupSession={groupSession}
				groupSessionReservation={groupSessionReservation}
				onReserveSeat={handleReserveButtonClick}
				onCancelReservation={() => {
					setCancelModalIsShowing(true);
				}}
			/>
		</>
	);
};
