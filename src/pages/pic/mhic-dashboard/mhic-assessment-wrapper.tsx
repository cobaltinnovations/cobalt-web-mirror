import React, { FC } from 'react';
import { useGetAssessmentByDispositionId, useGetDispositionById } from '@/hooks/pic-hooks';
import { useParams } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import { MHICAssessment } from '@/pages/pic/assessment/assessment-wrapper';

interface PathParams {
	id: string;
}
export const MHICAssessmentWrapper: FC = () => {
	const { id: dispositionId } = useParams<PathParams>();

	const { data: disposition, isLoading: dispositionLoading } = useGetDispositionById(dispositionId);
	const { data: assessment, isLoading: assessmentLoading } = useGetAssessmentByDispositionId(dispositionId);

	const isLoading = dispositionLoading || assessmentLoading;

	if (isLoading || !assessment) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	const patientName = `${disposition.patient.firstName} ${disposition.patient.lastName}`;

	return (
		<Container>
			<h3>Assessment for {patientName}</h3>
			<MHICAssessment patientName={patientName} assessment={assessment} disposition={disposition} />
		</Container>
	);
};
