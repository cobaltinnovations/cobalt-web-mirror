import React, { FC, useCallback, useState } from 'react';
import { Row, Col, OffcanvasProps } from 'react-bootstrap';
import { CareResourceLocationModel, PatientOrderModel } from '@/lib/models';
import { PreviewCanvas } from '@/components/preview-canvas';
import useHandleError from '@/hooks/use-handle-error';
import Loader from '@/components/loader';
import { CareResourceAccordion } from '@/components/integrated-care/patient';
import useAccount from '@/hooks/use-account';

interface Props extends OffcanvasProps {
	patientOrder: PatientOrderModel;
}

export const MhicCareResourcePreviewModal: FC<Props> = ({ patientOrder, ...props }) => {
	const { institution } = useAccount();
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [careResourceLocations, setCareResourceLocations] = useState<CareResourceLocationModel[]>([]);

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);
			setCareResourceLocations([]);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError]);

	const handleOnEnter = useCallback(() => {
		fetchData();
	}, [fetchData]);

	return (
		<PreviewCanvas
			title={`Preview Resources for ${patientOrder.patientDisplayName}`}
			onEnter={handleOnEnter}
			{...props}
		>
			{isLoading ? (
				<Row>
					<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
						<Loader />
					</Col>
				</Row>
			) : (
				<Row className="mb-10">
					<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
						<h4 className="mb-1">Schedule with a recommended resource</h4>
						<p className="mb-10">
							These resources are covered by your insurance and were recommended based on your responses
							to the assessment. If you have any questions, please feel free to call us at{' '}
							{institution.integratedCarePhoneNumberDescription}{' '}
							{institution.integratedCareAvailabilityDescription} or discuss with your primary care
							provider.
						</p>
						<CareResourceAccordion className="mb-4" />
						<CareResourceAccordion className="mb-4" />
						<CareResourceAccordion />
						{careResourceLocations.map(() => (
							<CareResourceAccordion className="mb-4" />
						))}
					</Col>
				</Row>
			)}
		</PreviewCanvas>
	);
};
