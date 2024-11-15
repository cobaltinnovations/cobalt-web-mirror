import React, { FC, useCallback, useState } from 'react';
import { Row, Col, OffcanvasProps } from 'react-bootstrap';
import { CareResourceLocationModel, PatientOrderModel } from '@/lib/models';
import { PreviewCanvas } from '@/components/preview-canvas';
import useHandleError from '@/hooks/use-handle-error';
import Loader from '@/components/loader';

interface Props extends OffcanvasProps {
	patientOrder: PatientOrderModel;
}

export const MhicCareResourcePreviewModal: FC<Props> = ({ patientOrder, ...props }) => {
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
					<Col>
						<Loader />
					</Col>
				</Row>
			) : (
				<Row>
					<Col>
						{careResourceLocations.map(() => (
							<p>TODO</p>
						))}
					</Col>
				</Row>
			)}
		</PreviewCanvas>
	);
};
