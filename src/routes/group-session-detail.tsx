import React, { useCallback, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { Badge, Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { groupSessionsService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';
import { useCopyTextToClipboard } from '@/hooks/use-copy-text-to-clipboard';
import { HEADER_HEIGHT } from '@/components/header-v2';
import InlineAlert from '@/components/inline-alert';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import moment from 'moment';

const baseSpacerSize = 4;
const containerPaddingMultiplier = 16;
const containerTopPadding = containerPaddingMultiplier * baseSpacerSize;

const useStyles = createUseThemedStyles((theme) => ({
	imageOuter: {
		borderRadius: 4,
		overflow: 'hidden',
		paddingBottom: '55%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n500,
	},
	schedulingOuter: {
		borderRadius: 8,
		position: 'sticky',
		padding: '32px 24px',
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
		top: HEADER_HEIGHT + containerTopPadding,
		[mediaQueries.lg]: {
			top: 'auto',
			borderRadius: 0,
			boxShadow: 'none',
			position: 'static',
			padding: '32px 0 40px',
			borderTop: `1px solid ${theme.colors.n100}`,
		},
	},
}));

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { groupSession, groupSessionReservation } = await groupSessionsService
		.getGroupSessionById((params as { groupSessionId: string }).groupSessionId)
		.fetch();

	return { groupSession, groupSessionReservation };
};

export const Component = () => {
	const { groupSession, groupSessionReservation } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

	const classes = useStyles();
	const navigate = useNavigate();
	const { addFlag } = useFlags();
	const copyTextToClipboard = useCopyTextToClipboard();
	const [confirmModalIsShowing, setConfirmModalIsShowing] = useState(false);
	const [cancelModalIsShowing, setCancelModalIsShowing] = useState(false);

	const handleModalConfirmButtonClick = useCallback(() => {
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
	}, [addFlag, navigate]);

	const handleModalCancelButtonClick = useCallback(() => {
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
	}, [addFlag, navigate]);

	const handleCopyLinkButtonClick = useCallback(() => {
		copyTextToClipboard(
			`https://${window.location.host}/in-the-studio/group-session-scheduled/${'XXX'}?immediateAccess=true`,
			{
				successTitle: 'Copied!',
				successDescription: 'The URL for this session was copied to your clipboard',
				errorTitle: 'Failed to copy link',
				errorDesctiption: 'Please try again.',
			}
		);
	}, [copyTextToClipboard]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Group Session - Internal</title>
			</Helmet>

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
					<p className="mb-0 fw-bold">Praesent Sollicitudin Lacus</p>
					<p className="mb-0">Tuesday Oct 27 &bull; 10-10:30AM</p>
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
					<p className="mb-0">Praesent Sollicitudin Lacus</p>
					<p className="mb-0">Tuesday Oct 27 &bull; 10-10:30AM</p>
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

			<Container className="pb-0 pt-8 py-lg-16" fluid="lg">
				<Row>
					<Col lg={7} className="mb-6 mb-lg-0">
						<Container className="p-lg-0">
							<Row className="mb-8 mb-lg-11">
								<Col>
									<div
										className={classes.imageOuter}
										style={{ backgroundImage: `url(${'https://placehold.co/1696x944'})` }}
									/>
								</Col>
							</Row>
							<Row>
								<Col>
									<h2 className="mb-2 mb-lg-3">{groupSession.title}</h2>
									<p className="mb-6 text-muted">with {groupSession.facilitatorName}</p>
									<p className="mb-6 mb-lg-10 fs-large">{groupSession.description}</p>
									<div className="d-flex flex-wrap">
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
									</div>
								</Col>
							</Row>
						</Container>
					</Col>
					<Col lg={5}>
						<Container fluid className={classes.schedulingOuter}>
							<Container className="p-lg-0">
								<Row className="mb-8">
									<Col>
										<InlineAlert
											variant="success"
											title="Your seat is reserved"
											action={[
												{
													title: 'View My Events',
													onClick: () => {
														navigate('/my-calendar');
													},
												},
												{
													title: 'Join Now',
													onClick: () => {
														window.alert('TODO: Join session');
													},
												},
											]}
										/>
									</Col>
								</Row>
								<Row className="mb-6">
									<Col>
										<p className="mb-1 fw-bold">
											{moment(groupSession.startDateTime, 'YYYY-MM-DD[T]HH:mm').format(
												'MMM D[,] YYYY'
											)}
										</p>
										<p className="mb-0">
											{moment(groupSession.startDateTime, 'YYYY-MM-DD[T]HH:mm').format('hh:mmA')}{' '}
											- {moment(groupSession.endDateTime, 'YYYY-MM-DD[T]HH:mm').format('hh:mmA')}
										</p>
									</Col>
								</Row>
								<Row className="mb-6">
									<Col>
										<p className="mb-1 fw-bold">{groupSession.seatsAvailableDescription}</p>
										<p className="mb-0">
											{(groupSession.seatsReserved ?? 0) + (groupSession.seatsAvailable ?? 0)}{' '}
											seats total
										</p>
									</Col>
								</Row>
								<Row className="mb-8">
									<Col>
										<p className="mb-1 fw-bold">Online Video Call</p>
										<p className="mb-0">Attend this session virtually</p>
									</Col>
								</Row>
								<Row>
									<Col>
										<Button
											variant="danger"
											className="mb-3 d-block w-100"
											onClick={() => {
												setCancelModalIsShowing(true);
											}}
										>
											Cancel My Reservation
										</Button>
										<Button
											className="mb-3 d-block w-100"
											onClick={() => {
												setConfirmModalIsShowing(true);
											}}
										>
											Reserve My Seat
										</Button>
										<Button
											variant="outline-primary"
											className="d-block w-100"
											onClick={handleCopyLinkButtonClick}
										>
											Copy Session Link
										</Button>
									</Col>
								</Row>
							</Container>
						</Container>
					</Col>
				</Row>
			</Container>
		</>
	);
};
