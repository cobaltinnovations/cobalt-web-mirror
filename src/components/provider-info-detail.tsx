import React, { useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import ProviderScheduleCard from '@/components/provider-schedule-card';
import ProviderScheduleModal from './provider-schedule-modal';
import { institutionReferrersService } from '@/lib/services';
import AsyncWrapper from './async-page';
import { InstitutionReferrer, ProviderAppointmentSelectionTypeId } from '@/lib/models';

interface ProviderInfoDetailProps {
	urlName: string;
	scheduleAppointmentDescription: string;
	scheduleTypeId: ProviderAppointmentSelectionTypeId;
}

const ProviderInfoDetail = ({ urlName, scheduleAppointmentDescription, scheduleTypeId }: ProviderInfoDetailProps) => {
	const [showProviderScheduleModal, setShowProviderScheduleModal] = useState(false);
	const [institutionReferrer, setinstitutionReferrer] = useState<InstitutionReferrer>();

	const fetchData = useCallback(async () => {
		const response = await institutionReferrersService.getReferrerByUrlName(urlName).fetch();
		setinstitutionReferrer(response.institutionReferrer);
	}, [urlName]);

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
						<Col xs={7}>
							<Row>
								<div
									className="pageContentMarkup"
									dangerouslySetInnerHTML={{ __html: institutionReferrer?.pageContent ?? '' }}
								/>
							</Row>
						</Col>
						<Col xs={5}>
							<ProviderScheduleCard
								scheduleAppointmentDescription={scheduleAppointmentDescription}
								scheduleTypeId={scheduleTypeId}
								onViewAppointmentsButtonClick={() => {
									setShowProviderScheduleModal(true);
								}}
							/>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default ProviderInfoDetail;
