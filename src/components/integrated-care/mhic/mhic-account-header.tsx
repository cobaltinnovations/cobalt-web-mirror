import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';

import config from '@/lib/config';
import { AccountModel, PatientOrderCountModel } from '@/lib/models';
import FileInputButton from '@/components/file-input-button';
import { MhicGenerateOrdersModal } from '@/components/integrated-care/mhic';
import { ReactComponent as SwapIcon } from '@/assets/icons/icon-swap.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	accountHeader: {
		display: 'flex',
		padding: '19px 64px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
}));

interface MhicAccountHeaderProps {
	currentPanelAccountId: string;
	panelAccounts: AccountModel[];
	activePatientOrderCountsByPanelAccountId: Record<string, PatientOrderCountModel>;
	overallActivePatientOrdersCountDescription: string;
	onSwitchButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onImportPatientsInputChange(file: File): void;
}

export const MhicAccountHeader = ({
	currentPanelAccountId,
	panelAccounts,
	activePatientOrderCountsByPanelAccountId,
	overallActivePatientOrdersCountDescription,
	onSwitchButtonClick,
	onImportPatientsInputChange,
}: MhicAccountHeaderProps) => {
	const classes = useStyles();
	const [showGenerateOrdersModal, setShowGenerateOrdersModal] = useState(false);

	const currentAccountName = useMemo(
		() => panelAccounts.find((pa) => pa.accountId === currentPanelAccountId)?.displayName ?? 'All',
		[currentPanelAccountId, panelAccounts]
	);

	const currentCount = useMemo(
		() =>
			currentPanelAccountId
				? activePatientOrderCountsByPanelAccountId[currentPanelAccountId]?.activePatientOrderCountDescription
				: overallActivePatientOrdersCountDescription,
		[activePatientOrderCountsByPanelAccountId, currentPanelAccountId, overallActivePatientOrdersCountDescription]
	);

	return (
		<>
			<MhicGenerateOrdersModal
				show={showGenerateOrdersModal}
				onHide={() => {
					setShowGenerateOrdersModal(false);
				}}
				onSave={() => {
					setShowGenerateOrdersModal(false);
				}}
			/>

			<header className={classes.accountHeader}>
				<div className="d-flex align-items-center justift-content-between">
					<h3 className="mb-0 me-2">{currentAccountName}</h3>
					<p className="m-0 fs-large text-muted">({currentCount} Patients)</p>
					<Button variant="link" className="p-2" onClick={onSwitchButtonClick}>
						<SwapIcon />
					</Button>
				</div>
				<div className="d-flex align-items-center">
					{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
						<Button
							className="me-2"
							variant="outline-primary"
							onClick={() => {
								setShowGenerateOrdersModal(true);
							}}
						>
							Generate Patient Orders
						</Button>
					)}
					<FileInputButton accept=".csv" onChange={onImportPatientsInputChange}>
						Import Patients
					</FileInputButton>
				</div>
			</header>
		</>
	);
};
