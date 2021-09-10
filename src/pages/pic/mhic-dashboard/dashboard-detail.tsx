import React, { FC } from 'react';
import { DetailTable } from '@/pages/pic/mhic-dashboard/detail-table';
import { PatientTable } from '@/pages/pic/mhic-dashboard/patient-table';
import { FormattedDispositionWithAppointments } from '@/pages/pic/utils';
import { DashboardSummary } from '@/pages/pic/mhic-dashboard/dashboard-summary';
import { useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

interface Props {
	dispositions: FormattedDispositionWithAppointments[];
}

interface ParamTypes {
	id: string;
}

export const DashboardDetail: FC<Props> = ({ dispositions }) => {
	const { id: selectedDispositionId } = useParams<ParamTypes>();

	const selectedDisposition = dispositions.find((d) => d.id === selectedDispositionId);

	return (
		<>
			<DashboardSummary dispositions={dispositions} />
			{selectedDisposition ? (
				<DetailTable selectedDisposition={selectedDisposition} dispositions={dispositions} />
			) : (
				<PatientTable dispositions={dispositions} />
			)}
		</>
	);
};
