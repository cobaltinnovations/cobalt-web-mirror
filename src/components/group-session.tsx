import { useCopyTextToClipboard } from '@/hooks/use-copy-text-to-clipboard';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { createUseThemedStyles } from '@/jss/theme';
import {
	GroupSessionLearnMoreMethodId,
	GroupSessionLocationTypeId,
	GroupSessionModel,
	GroupSessionReservationModel,
} from '@/lib/models';
import { GroupSessionSchedulingSystemId } from '@/lib/services';
import React, { useCallback } from 'react';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { HEADER_HEIGHT } from './header-v2';
import mediaQueries from '@/jss/media-queries';
import InlineAlert from './inline-alert';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import { WysiwygDisplay } from './wysiwyg-basic';
import { ReactComponent as CalendarIcon } from '@/assets/icons/icon-calendar.svg';
import { ReactComponent as ChairIcon } from '@/assets/icons/chair-fill.svg';
import { ReactComponent as ClockIcon } from '@/assets/icons/schedule.svg';
import { ReactComponent as DevicesIcon } from '@/assets/icons/devices.svg';
import { ReactComponent as LocationIcon } from '@/assets/icons/icon-location-on.svg';
import classNames from 'classnames';

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
			borderTop: `1px solid ${theme.colors.border}`,
		},
	},
}));

const learnMoreTypeUrlPrefix = {
	[GroupSessionLearnMoreMethodId.EMAIL]: 'mailto:',
	[GroupSessionLearnMoreMethodId.PHONE]: 'tel:',
	[GroupSessionLearnMoreMethodId.URL]: '',
};

const learnMoreCallToAction = {
	[GroupSessionLearnMoreMethodId.EMAIL]: 'Email to learn more',
	[GroupSessionLearnMoreMethodId.PHONE]: 'Call to learn more',
	[GroupSessionLearnMoreMethodId.URL]: 'Click to learn more',
};

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
		copyTextToClipboard(`https://${window.location.host}/group-sessions/${groupSession.urlName}`, {
			successTitle: 'Copied!',
			successDescription: 'The URL for this session was copied to your clipboard',
			errorTitle: 'Failed to copy link',
			errorDesctiption: 'Please try again.',
		});
	}, [copyTextToClipboard, groupSession.urlName]);

	const isPastEndDateTime = moment(groupSession.endDateTime).isBefore(moment());

	const isExternal = groupSession.groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL;

	const showSeatAlert =
		typeof groupSession.seatsAvailable !== 'undefined' &&
		typeof groupSession.seats !== 'undefined' &&
		(groupSession.seatsAvailable <= 5 || groupSession.seatsAvailable / groupSession.seats <= 0.1);

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
								<WysiwygDisplay className="mb-6 mb-lg-10" html={groupSession.description ?? ''} />

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
									{isPastEndDateTime && (
										<InlineAlert className="mb-6" variant="warning" title="Group Session Ended" />
									)}

									<div className="d-flex">
										{isExternal ? (
											<CalendarIcon height={20} width={20} className="text-primary me-4" />
										) : (
											<ClockIcon height={20} width={20} className="text-primary me-4" />
										)}

										{groupSession.singleSessionFlag ? (
											<div>
												<p className="mb-1 fw-bold">{groupSession.startDateDescription}</p>
												<p className="mb-0">
													{groupSession.startTimeDescription} -{' '}
													{groupSession.endTimeDescription}
												</p>
											</div>
										) : (
											<div>
												<p className="mb-1 fw-bold">
													{groupSession.startDateDescription} -{' '}
													{groupSession.endDateDescription}
												</p>
												<p className="mb-0">{groupSession.dateTimeDescription}</p>
											</div>
										)}
									</div>
								</Col>
							</Row>
							{groupSession.seats && (
								<Row className="mb-6">
									<Col>
										<div className="d-flex">
											<ChairIcon className="text-primary me-4" />

											{isExternal ? (
												<p className="mb-0">{groupSession.seats} offered</p>
											) : (
												<div className="w-100">
													<p
														className={classNames('fw-bold', {
															'mb-1': !showSeatAlert,
															'mb-4': showSeatAlert,
														})}
													>
														{groupSession.seatsDescription}
													</p>
													{showSeatAlert && (
														<InlineAlert
															variant="warning"
															title={groupSession.seatsAvailableDescription ?? ''}
														/>
													)}
												</div>
											)}
										</div>
									</Col>
								</Row>
							)}
							<Row className="mb-8">
								<Col>
									{groupSession.groupSessionLocationTypeId === GroupSessionLocationTypeId.VIRTUAL ? (
										<div className="d-flex">
											<DevicesIcon className="text-primary me-4" />
											<div>
												<p className="mb-1 fw-bold">Online Video Call</p>
												<p className="mb-0">Attend this session virtually</p>
											</div>
										</div>
									) : (
										<div className="d-flex">
											<LocationIcon className="text-primary me-4" />
											<div>
												<p className="mb-0 fw-bold">In person</p>
												{groupSession.inPersonLocation && (
													<p className="mt-1 mb-0">{groupSession.inPersonLocation}</p>
												)}
											</div>
										</div>
									)}
								</Col>
							</Row>
							{!groupSessionReservation && groupSession.registrationEndDateTime && (
								<Row className="mb-8">
									<Col>
										<InlineAlert
											title={
												groupSession.registrationEndDateTimeHasPassed
													? 'Registration has ended'
													: `Registration ends ${groupSession.registrationEndDateTimeDescription}`
											}
											variant={
												groupSession.registrationEndDateTimeHasPassed ? 'danger' : 'warning'
											}
											description={
												groupSession.registrationEndDateTimeHasPassed &&
												`Registration ended on ${groupSession.registrationEndDateTimeDescription}`
											}
										/>
									</Col>
								</Row>
							)}
							<Row>
								<Col>
									{isPastEndDateTime ||
									groupSession.registrationEndDateTimeHasPassed ? null : groupSessionReservation ? (
										<Button
											variant="danger"
											className="mb-3 d-block w-100"
											onClick={onCancelReservation}
										>
											Cancel My Reservation
										</Button>
									) : isExternal ? (
										<Button
											className="d-block w-100 text-center text-decoration-none"
											href={
												learnMoreTypeUrlPrefix[groupSession.groupSessionLearnMoreMethodId!] +
												groupSession.learnMoreDescription
											}
											target="_blank"
										>
											{learnMoreCallToAction[groupSession.groupSessionLearnMoreMethodId!]}
										</Button>
									) : (
										<Button
											className="mb-3 d-block w-100"
											onClick={onReserveSeat}
											disabled={
												typeof groupSession.seatsAvailable !== 'undefined'
													? groupSession.seatsAvailable <= 0
													: false
											}
										>
											{groupSession.groupSessionLocationTypeId ===
											GroupSessionLocationTypeId.VIRTUAL
												? 'Reserve My Virtual Seat'
												: 'Reserve My Seat'}
										</Button>
									)}

									{!isPastEndDateTime && !isExternal && (
										<Button
											variant="outline-primary"
											className="d-block w-100"
											onClick={handleCopyLinkButtonClick}
										>
											Copy Session Link
										</Button>
									)}
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
