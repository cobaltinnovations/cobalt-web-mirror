import React, { FC } from 'react';
import { PatientTable } from '@/pages/pic/mhic-dashboard/patient-table';
import { FormattedDispositionWithAppointments } from '@/pages/pic/utils';
import { DashboardSummary } from '@/pages/pic/mhic-dashboard/dashboard-summary';

interface Props {
	dispositions: FormattedDispositionWithAppointments[];
}

export const DashboardIndex: FC<Props> = ({ dispositions }) => {
	return (
		<>
			<DashboardSummary dispositions={dispositions} />
			<PatientTable dispositions={dispositions} />
		</>
	);
};
