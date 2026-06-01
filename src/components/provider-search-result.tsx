import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import classNames from 'classnames';

import SvgIcon from '@/components/svg-icon';
import ProviderNextAppointmentCard, { SCHEDULE_TYPE_ID } from '@/components/provider-next-appointment-card';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	providerResult: {
		borderRadius: 8,
		padding: '32px 24px',
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
		display: 'flex',
	},
	imageOuter: {
		width: 120,
		height: 120,
		flexShrink: 0,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		[mediaQueries.md]: {
			width: 64,
			height: 64,
		},
	},
	description: {
		display: '-webkit-box',
		'-webkit-line-clamp': 3,
		'line-clamp': 3,
		'-webkit-box-orient': 'vertical',
		'box-orient': 'vertical',
		overflow: 'hidden',
	},
}));

interface ProviderSearchResultProps {
	imageUrl: string;
	title: string;
	onTitleButtonClick(): void;
	description: string;
	scheduleAppointmentDescription: string;
	scheduleTypeId: SCHEDULE_TYPE_ID;
	onViewAppointmentsButtonClick(): void;
	className?: string;
}

const ProviderSearchResult = ({
	imageUrl,
	title,
	onTitleButtonClick,
	description,
	scheduleAppointmentDescription,
	scheduleTypeId,
	onViewAppointmentsButtonClick,
	className,
}: ProviderSearchResultProps) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.providerResult, className)}>
			<Row>
				<Col xl={7}>
					<div className="d-flex mb-6 mb-xl-0">
						<div
							className={classNames(classes.imageOuter, 'me-6')}
							style={{ backgroundImage: `url(${imageUrl})` }}
						/>
						<div>
							<h3 className="mb-2">
								<Button
									variant="link"
									className="p-0 text-decoration-none fs-h3"
									onClick={onTitleButtonClick}
								>
									{title}
								</Button>
							</h3>
							<div className="mb-4 d-flex align-items-center">
								<SvgIcon kit="far" icon="phone" size={16} className="me-2" />{' '}
								<p className="mb-0">Phone</p>
							</div>
							<p className={classNames(classes.description, 'mb-0 fs-large')}>{description}</p>
						</div>
					</div>
					<hr className="mb-6 d-xl-none" />
				</Col>
				<Col xl={5}>
					<p className="mb-2 fs-large">
						<strong>Schedule Appointment</strong>
					</p>
					<p className="mb-4">{scheduleAppointmentDescription}</p>
					<ProviderNextAppointmentCard scheduleTypeId={scheduleTypeId} />
					<Button
						variant="link"
						className="d-block w-100 text-decoration-none"
						onClick={onViewAppointmentsButtonClick}
					>
						View more appointments
					</Button>
				</Col>
			</Row>
		</div>
	);
};

export default ProviderSearchResult;
