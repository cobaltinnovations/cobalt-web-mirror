import { useCopyTextToClipboard } from '@/hooks/use-copy-text-to-clipboard';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { createUseThemedStyles } from '@/jss/theme';
import { GroupSessionModel, GroupSessionReservationModel } from '@/lib/models';
import React, { useCallback } from 'react';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { HEADER_HEIGHT } from './header-v2';
import mediaQueries from '@/jss/media-queries';
import InlineAlert from './inline-alert';
import { useNavigate } from 'react-router-dom';
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

interface GroupSessionProps {
	groupSession: Partial<GroupSessionModel>;
	groupSessionReservation?: GroupSessionReservationModel;
	onCancelReservation?: () => void;
	onReserveSeat?: () => void;
}

const GroupSession = ({
	groupSession,
	groupSessionReservation,
	onCancelReservation,
	onReserveSeat,
}: GroupSessionProps) => {
	const navigate = useNavigate();
	const classes = useStyles();
	const copyTextToClipboard = useCopyTextToClipboard();
	const placeholderImage = useRandomPlaceholderImage();

	const handleCopyLinkButtonClick = useCallback(() => {
		copyTextToClipboard(
			`https://${window.location.host}/group-sessions/${groupSession.urlName}?immediateAccess=true`,
			{
				successTitle: 'Copied!',
				successDescription: 'The URL for this session was copied to your clipboard',
				errorTitle: 'Failed to copy link',
				errorDesctiption: 'Please try again.',
			}
		);
	}, [copyTextToClipboard, groupSession.urlName]);

	const totalSeats = (groupSession.seatsReserved ?? 0) + (groupSession.seatsAvailable ?? 0);

	return (
		<Container className="pb-0 pt-8 py-lg-16" fluid="lg">
			<Row>
				<Col lg={7} className="mb-6 mb-lg-0">
					<Container className="p-lg-0">
						<Row className="mb-8 mb-lg-11">
							<Col>
								<div
									className={classes.imageOuter}
									style={{ backgroundImage: `url(${groupSession.imageUrl ?? placeholderImage})` }}
								/>
							</Col>
						</Row>
						<Row>
							<Col>
								<h2 className="mb-2 mb-lg-3">{groupSession.title}</h2>
								<p className="mb-6 text-muted">with {groupSession.facilitatorName}</p>
								<div
									className="mb-6 mb-lg-10"
									dangerouslySetInnerHTML={{ __html: groupSession.description ?? '' }}
								/>

								{(groupSession.tags ?? []).length > 0 && (
									<div className="d-flex flex-wrap">
										{groupSession.tags?.map((tag) => {
											return (
												<Badge
													key={tag.tagId}
													pill
													bg="outline-dark"
													className="mb-2 me-2 fs-default text-nowrap"
												>
													{tag.name}
												</Badge>
											);
										})}
									</div>
								)}
							</Col>
						</Row>
					</Container>
				</Col>
				<Col lg={5}>
					<Container fluid className={classes.schedulingOuter}>
						<Container className="p-lg-0">
							{groupSessionReservation ? (
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
														window.open(
															groupSession.videoconferenceUrl,
															'_blank',
															'noopener, noreferrer'
														);
													},
												},
											]}
										/>
									</Col>
								</Row>
							) : null}
							<Row className="mb-6">
								<Col>
									<p className="mb-1 fw-bold">
										{moment(groupSession.startDateTime, 'YYYY-MM-DD[T]HH:mm').format(
											'MMM D[,] YYYY'
										)}
									</p>
									<p className="mb-0">
										{moment(groupSession.startDateTime, 'YYYY-MM-DD[T]HH:mm').format('hh:mmA')} -{' '}
										{moment(groupSession.endDateTime, 'YYYY-MM-DD[T]HH:mm').format('hh:mmA')}
									</p>
								</Col>
							</Row>
							<Row className="mb-6">
								<Col>
									<p className="mb-1 fw-bold">{groupSession.seatsAvailableDescription}</p>
									{totalSeats > 0 && <p className="mb-0">{totalSeats} seats total</p>}
								</Col>
							</Row>
							<Row className="mb-8">
								<Col>
									<p className="mb-1 fw-bold text-danger">[TODO]: Online Video Call</p>
									<p className="mb-0 text-danger">[TODO]: Attend this session virtually</p>
								</Col>
							</Row>
							<Row>
								<Col>
									{groupSessionReservation ? (
										<Button
											variant="danger"
											className="mb-3 d-block w-100"
											onClick={onCancelReservation}
										>
											Cancel My Reservation
										</Button>
									) : (
										<Button className="mb-3 d-block w-100" onClick={onReserveSeat}>
											Reserve My Seat
										</Button>
									)}
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
	);
};

export default GroupSession;
