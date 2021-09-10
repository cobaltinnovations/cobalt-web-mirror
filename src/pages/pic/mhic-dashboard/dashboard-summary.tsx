import React, { FC } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { ReactComponent as Flag } from '@/assets/pic/flag_icon.svg';
import { ReactComponent as Safety } from '@/assets/pic/safety_icon.svg';
import PatientImportButton from './patient-import-button';
import { FormattedDispositionWithAppointments, FlagType } from '@/pages/pic/utils';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';

interface Props {
	dispositions: FormattedDispositionWithAppointments[];
}

export const DashboardSummary: FC<Props> = ({ dispositions }) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const patientCount = dispositions.length;
	const flaggedCount = dispositions.filter((disposition: FormattedDispositionWithAppointments) => disposition.flag?.type === FlagType.General).length;
	const riskCount = dispositions.filter((disposition: FormattedDispositionWithAppointments) => disposition.flag?.type === FlagType.Safety).length;

	return (
		<Row className="justify-content-center font-weight-semi-bold mt-2">
			<Col sm={'auto'} className="px-2 my-1 border-right align-self-center">
				{/* TODO replace generic 'MHIC Panel' with signed in Mhic Name once available */}
				MHIC Panel
			</Col>
			<Col className="my-1 align-self-center">
				<ul className={'d-flex list-unstyled align-self-center align-items-center mb-0 font-weight-semi-bold'}>
					<li className={'pl-5'}>{t('mhic.header.patientCount', { count: patientCount })}</li>
					<li className={'pl-5'}>
						<Flag />
						{t('mhic.header.flaggedCount', { count: flaggedCount })}
					</li>
					<li className={'pl-5 text-danger'}>
						<Safety />
						{t('mhic.header.riskCount', { count: riskCount })}
					</li>
				</ul>
			</Col>
			<Col className="text-right">
				<PatientImportButton
					onUploadSuccess={() => {
						queryClient.invalidateQueries();
					}}
				/>
			</Col>
		</Row>
	);
};
