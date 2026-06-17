import React, { useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import ProviderScheduleCard from '@/components/provider-schedule-card';
import ProviderScheduleModal from './provider-schedule-modal';
import AsyncWrapper from './async-page';
import { Clinic, Provider, ProviderAppointmentModalityId, ProviderAppointmentSelectionTypeId } from '@/lib/models';
import { useNavigate } from 'react-router-dom';
import { clinicService, providerService } from '@/lib/services';
import SvgIcon from './svg-icon';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
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
}));

interface ProviderInfoDetailProps {
	providerId?: string;
	clinicId?: string;
	scheduleAppointmentDescription: string;
	scheduleTypeId: ProviderAppointmentSelectionTypeId;
}

const ProviderInfoDetail = ({
	providerId,
	clinicId,
	scheduleAppointmentDescription,
	scheduleTypeId,
}: ProviderInfoDetailProps) => {
	const classes = useStyles();

	const navigate = useNavigate();
	const [showProviderScheduleModal, setShowProviderScheduleModal] = useState(false);
	const [provider, setProvider] = useState<Provider>();
	const [clinic, setClinc] = useState<Clinic>();

	const fetchData = useCallback(async () => {
		if (providerId) {
			const response = await providerService.getProviderById(providerId).fetch();
			setProvider(response.provider);
		} else if (clinicId) {
			const response = await clinicService.getClinicByClinicId(clinicId).fetch();
			setClinc(response.clinic);
		} else {
			throw new Error('providerId and clinicId are undefined.');
		}
	}, [clinicId, providerId]);

	return (
		<>
			<ProviderScheduleModal
				show={showProviderScheduleModal}
				onHide={() => {
					setShowProviderScheduleModal(false);
				}}
			/>

			<AsyncWrapper fetchData={fetchData}>
				<Container>
					<Row>
						<Col xs={12} xl={7}>
							<Row>
								<div className="d-flex align-items-center">
									<div
										className={classNames(classes.imageOuter, 'me-6')}
										style={{ backgroundImage: `url(${provider?.imageUrl ?? ''})` }}
									/>
									<div>
										<h3 className="mb-2">{provider?.name ?? clinic?.description}</h3>
										<div className="d-flex align-items-center">
											{(provider?.supportedAppointmentModalities ?? []).map(
												(supportedAppointmentModality) => (
													<div
														key={supportedAppointmentModality.appointmentModalityId}
														className="me-4 d-inline-flex align-items-center"
													>
														{getSupportedAppointmentModalityIconById(
															supportedAppointmentModality.appointmentModalityId
														)}
														<p className="mb-0">
															{supportedAppointmentModality.description}
														</p>
													</div>
												)
											)}
										</div>
									</div>
								</div>
							</Row>
							<Row>
								<div dangerouslySetInnerHTML={{ __html: provider?.bio ?? clinic?.description ?? '' }} />
							</Row>
						</Col>
						<Col xs={12} xl={5}>
							<ProviderScheduleCard
								scheduleAppointmentDescription={scheduleAppointmentDescription}
								scheduleTypeId={scheduleTypeId}
								onViewAppointmentsButtonClick={() => {
									setShowProviderScheduleModal(true);
								}}
								onScheduleAppointmentButtonClick={() => {
									navigate('/provider-confirm-appointment-time');
								}}
							/>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

const getSupportedAppointmentModalityIconById = (providerAppointmentModalityId: ProviderAppointmentModalityId) => {
	const iconMap: Record<ProviderAppointmentModalityId, JSX.Element> = {
		[ProviderAppointmentModalityId.IN_PERSON]: <SvgIcon kit="far" icon="location-dot" size={16} className="me-2" />,
		[ProviderAppointmentModalityId.PHONE]: <SvgIcon kit="far" icon="phone" size={16} className="me-2" />,
		[ProviderAppointmentModalityId.VIRTUAL]: <SvgIcon kit="far" icon="laptop-mobile" size={16} className="me-2" />,
	};

	return iconMap[providerAppointmentModalityId];
};

export default ProviderInfoDetail;
