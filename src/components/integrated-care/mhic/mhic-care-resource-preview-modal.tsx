import React, { FC, useCallback, useState } from 'react';
import { Row, Col, OffcanvasProps } from 'react-bootstrap';
import { APIProvider } from '@vis.gl/react-google-maps';

import { CareResourceLocationModel, PatientOrderModel } from '@/lib/models';
import { institutionService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { PreviewCanvas } from '@/components/preview-canvas';
import Loader from '@/components/loader';
import { CareResourceAccordion } from '@/components/integrated-care/patient';

interface Props extends OffcanvasProps {
	patientOrder: PatientOrderModel;
}

export const MhicCareResourcePreviewModal: FC<Props> = ({ patientOrder, ...props }) => {
	const { institution } = useAccount();
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [careResourceLocations, setCareResourceLocations] = useState<CareResourceLocationModel[]>([]);
	const [mapsKey, setMapsKey] = useState('');

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);

			const response = await institutionService.getGoogleMapsApiKey(institution.institutionId).fetch();

			setMapsKey(response.googleMapsPlatformApiKey);
			setCareResourceLocations([]);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError, institution.institutionId]);

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
						{mapsKey && (
							<APIProvider apiKey={mapsKey}>
								{careResourceLocations.map((crl) => (
									<CareResourceAccordion careResourceLocation={crl} className="mb-4" />
								))}
							</APIProvider>
						)}
					</Col>
				</Row>
			)}
		</PreviewCanvas>
	);
};
