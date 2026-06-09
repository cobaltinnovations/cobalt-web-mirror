import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import SvgIcon from '@/components/svg-icon';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import ProviderScheduleCard from './provider-schedule-card';
import { ProviderAppointmentModalityId, ProviderSearchResultModel } from '@/lib/models';

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
	provider: ProviderSearchResultModel;
	onTitleButtonClick(): void;
	onScheduleAppointmentButtonClick(): void;
	onViewAppointmentsButtonClick(): void;
	className?: string;
}

const ProviderSearchResult = ({
	provider,
	onTitleButtonClick,
	onScheduleAppointmentButtonClick,
	onViewAppointmentsButtonClick,
	className,
}: ProviderSearchResultProps) => {
	const classes = useStyles();

	const getSupportedAppointmentModalityIconById = (providerAppointmentModalityId: ProviderAppointmentModalityId) => {
		const iconMap: Record<ProviderAppointmentModalityId, JSX.Element> = {
			[ProviderAppointmentModalityId.IN_PERSON]: <SvgIcon kit="far" icon="phone" size={16} className="me-2" />,
			[ProviderAppointmentModalityId.PHONE]: <SvgIcon kit="far" icon="phone" size={16} className="me-2" />,
			[ProviderAppointmentModalityId.VIRTUAL]: <SvgIcon kit="far" icon="phone" size={16} className="me-2" />,
		};

		return iconMap[providerAppointmentModalityId];
	};

	return (
		<div className={classNames(classes.providerResult, className)}>
			<Container fluid className="overflow-visible">
				<Row>
					<Col xl={7}>
						<div className="d-flex mb-6 mb-xl-0">
							<div
								className={classNames(classes.imageOuter, 'me-6')}
								style={{ backgroundImage: `url(${provider.imageUrl})` }}
							/>
							<div>
								<h3 className="mb-2">
									<Button
										variant="link"
										className="p-0 text-decoration-none fs-h3"
										onClick={onTitleButtonClick}
									>
										{provider.name}
									</Button>
								</h3>
								<div className="mb-4 d-flex align-items-center">
									{provider.supportedAppointmentModalities.map((supportedAppointmentModality) => (
										<div className="d-inline-flex align-items-center">
											{getSupportedAppointmentModalityIconById(
												supportedAppointmentModality.appointmentModalityId
											)}
											<p className="mb-0">{supportedAppointmentModality.description}</p>
										</div>
									))}
								</div>
								<p className={classNames(classes.description, 'mb-0 fs-large')}>
									{provider.description}
								</p>
							</div>
						</div>
						<hr className="mb-6 d-xl-none" />
					</Col>
					<Col xl={5}>
						<ProviderScheduleCard
							showCardStyle={false}
							scheduleAppointmentDescription={provider.appointmentDescription ?? ''}
							scheduleTypeId={provider.appointmentSelectionTypeId}
							firstAvailableAppointment={provider.firstAvailableAppointment ?? undefined}
							onScheduleAppointmentButtonClick={onScheduleAppointmentButtonClick}
							onViewAppointmentsButtonClick={onViewAppointmentsButtonClick}
							showMoreAppointmentsButton={provider.hasMoreAppointments}
						/>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default ProviderSearchResult;
