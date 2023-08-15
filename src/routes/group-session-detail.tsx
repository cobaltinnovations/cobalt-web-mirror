import React, { useCallback, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { LoaderFunctionArgs, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';

import CollectEmailModal from '@/components/collect-email-modal';
import GroupSession from '@/components/group-session';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import { groupSessionsService } from '@/lib/services';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import useAccount from '@/hooks/use-account';
import moment from 'moment';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { groupSession, groupSessionReservation } = await groupSessionsService
		.getGroupSessionById((params as { groupSessionId: string }).groupSessionId)
		.fetch();

	return { groupSession, groupSessionReservation };
};

export const Component = () => {
	const { account } = useAccount();
	const { groupSession, groupSessionReservation } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const handleError = useHandleError();
	const revalidator = useRevalidator();
	const { startScreeningFlow } = useScreeningFlow({
		screeningFlowId: groupSession.screeningFlowId,
		groupSessionId: groupSession.groupSessionId,
		instantiateOnLoad: false,
		checkCompletionState: false,
	});

	const navigate = useNavigate();
	const { addFlag } = useFlags();

	const [collectedEmail, setCollectedEmail] = useState(account?.emailAddress ?? '');
	const [showCollectEmailModal, setShowCollectEmailModal] = useState(false);
	const [confirmModalIsShowing, setConfirmModalIsShowing] = useState(false);
	const [cancelModalIsShowing, setCancelModalIsShowing] = useState(false);

	const handleReserveButtonClick = useCallback(() => {
		if (groupSession.screeningFlowId) {
			startScreeningFlow();
			return;
		}

		setShowCollectEmailModal(true);
	}, [groupSession.screeningFlowId, startScreeningFlow]);

	const handleModalConfirmButtonClick = useCallback(async () => {
		try {
			await groupSessionsService.reserveGroupSession(groupSession.groupSessionId, collectedEmail).fetch();
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
	}, [addFlag, collectedEmail, groupSession.groupSessionId, handleError, navigate, revalidator]);

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
			{moment(groupSession.startDateTime, 'YYYY-MM-DD[T]HH:mm').format('hh:mmA')} -{' '}
			{moment(groupSession.endDateTime, 'YYYY-MM-DD[T]HH:mm').format('hh:mmA')}
		</p>
	);

	return (
		<>
			<Helmet>
				<title>Cobalt | Group Session Detail</title>
			</Helmet>

			<CollectEmailModal
				show={showCollectEmailModal}
				collectedEmail={collectedEmail}
				onHide={() => {
					setShowCollectEmailModal(false);
				}}
				onSubmitEmail={(email) => {
					setCollectedEmail(email);
					setShowCollectEmailModal(false);
					setConfirmModalIsShowing(true);
				}}
			/>

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
