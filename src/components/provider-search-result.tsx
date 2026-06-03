import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import SvgIcon from '@/components/svg-icon';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import ProviderScheduleCard from './provider-schedule-card';
import { ProviderAppointmentSelectionTypeId } from '@/lib/models';

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
	scheduleTypeId: ProviderAppointmentSelectionTypeId;
	onViewAppointmentsButtonClick(): void;
	showMoreAppointmentsButton?: boolean;
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
	showMoreAppointmentsButton,
	className,
}: ProviderSearchResultProps) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.providerResult, className)}>
			<Container fluid className="overflow-visible">
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
						<ProviderScheduleCard
							showCardStyle={false}
							scheduleAppointmentDescription={scheduleAppointmentDescription}
							scheduleTypeId={scheduleTypeId}
							onViewAppointmentsButtonClick={onViewAppointmentsButtonClick}
							showMoreAppointmentsButton={showMoreAppointmentsButton}
						/>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default ProviderSearchResult;
