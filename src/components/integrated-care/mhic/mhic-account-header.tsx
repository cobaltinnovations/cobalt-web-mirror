import React, { useMemo } from 'react';
import { Button } from 'react-bootstrap';

import { AccountModel, PatientOrderCountModel } from '@/lib/models';
import { ReactComponent as SwapIcon } from '@/assets/icons/icon-swap.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	accountHeader: {
		display: 'flex',
		padding: '21px 0',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottom: `1px solid ${theme.colors.border}`,
	},
}));

interface MhicAccountHeaderProps {
	currentPanelAccountId: string;
	panelAccounts: AccountModel[];
	activePatientOrderCountsByPanelAccountId: Record<string, PatientOrderCountModel>;
	overallActivePatientOrdersCountDescription: string;
	onSwitchButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicAccountHeader = ({
	currentPanelAccountId,
	panelAccounts,
	activePatientOrderCountsByPanelAccountId,
	overallActivePatientOrdersCountDescription,
	onSwitchButtonClick,
}: MhicAccountHeaderProps) => {
	const classes = useStyles();

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
		<header className={classes.accountHeader}>
			<div className="d-flex align-items-center justift-content-between">
				<h3 className="mb-0 me-2">{currentAccountName}</h3>
				<p className="m-0 fs-large text-muted">({currentCount} Patients)</p>
				<Button variant="link" className="p-2" onClick={onSwitchButtonClick}>
					<SwapIcon />
				</Button>
			</div>
		</header>
	);
};
