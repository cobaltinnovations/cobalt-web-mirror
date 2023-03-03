import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import config from '@/lib/config';
import { AccountModel, PatientOrderCountModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import FileInputButton from '@/components/file-input-button';
import { MhicGenerateOrdersModal, MhicNavigation } from '@/components/integrated-care/mhic';
import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';

const MhicOrders = () => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();

	const [panelAccounts, setPanelAccounts] = useState<AccountModel[]>([]);
	const [activePatientOrderCountsByPanelAccountId, setActivePatientOrderCountsByPanelAccountId] =
		useState<Record<string, PatientOrderCountModel>>();
	const [overallActivePatientOrdersCountDescription, setOverallActivePatientOrdersCountDescription] = useState('0');

	const [showGenerateOrdersModal, setShowGenerateOrdersModal] = useState(false);

	const fetchPanelAccounts = useCallback(async () => {
		try {
			const response = await integratedCareService.getPanelAccounts().fetch();

			setPanelAccounts(response.panelAccounts);
			setActivePatientOrderCountsByPanelAccountId(response.activePatientOrderCountsByPanelAccountId);
			setOverallActivePatientOrdersCountDescription(response.overallActivePatientOrderCountDescription);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	const fetchPatientOrders = useCallback(async () => {
		try {
			const response = await integratedCareService.getPatientOrders({}).fetch();
			console.log(response);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	const handleImportPatientsInputChange = useCallback(
		(file: File) => {
			const fileReader = new FileReader();

			fileReader.addEventListener('load', async () => {
				const fileContent = fileReader.result;

				try {
					if (typeof fileContent !== 'string') {
						throw new Error('Could not read file.');
					}

					await integratedCareService.importPatientOrders({ csvContent: fileContent }).fetch();
					await Promise.all([fetchPanelAccounts(), fetchPatientOrders()]);

					addFlag({
						variant: 'success',
						title: 'Your patients were imported!',
						description: 'These patients are now available to view.',
						actions: [],
					});
				} catch (error) {
					handleError(error);
				}
			});

			fileReader.readAsText(file);
		},
		[addFlag, fetchPanelAccounts, fetchPatientOrders, handleError]
	);

	useEffect(() => {
		fetchPatientOrders();
	}, [fetchPatientOrders]);

	useEffect(() => {
		fetchPanelAccounts();
	}, [fetchPanelAccounts]);

	return (
		<>
			<MhicGenerateOrdersModal
				show={showGenerateOrdersModal}
				onHide={() => {
					setShowGenerateOrdersModal(false);
				}}
				onSave={() => {
					addFlag({
						variant: 'success',
						title: 'Your patient orders were generated!',
						description: 'You can now import these patient orders.',
						actions: [],
					});
					setShowGenerateOrdersModal(false);
				}}
			/>

			<MhicNavigation
				navigationItems={[
					{
						title: 'All',
						description: overallActivePatientOrdersCountDescription,
						icon: () => <DotIcon className="text-n300" />,
						onClick: () => {
							return;
						},
					},
					{
						title: 'Unassigned',
						description: '[TODO]',
						icon: () => <DotIcon className="text-n300" />,
						onClick: () => {
							return;
						},
					},
					...panelAccounts.map((panelAccount) => {
						return {
							title: panelAccount.displayName ?? '',
							description:
								activePatientOrderCountsByPanelAccountId?.[panelAccount.accountId]
									.activePatientOrderCountDescription,
							icon: () => <DotIcon className="text-n300" />,
							onClick: () => {
								return;
							},
						};
					}),
				]}
			>
				<div className="py-6">
					<FileInputButton className="d-inline-flex" accept=".csv" onChange={handleImportPatientsInputChange}>
						Import Patients
					</FileInputButton>
					{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
						<Button
							variant="outline-primary"
							onClick={() => {
								setShowGenerateOrdersModal(true);
							}}
						>
							Generate Patient Orders
						</Button>
					)}
				</div>
			</MhicNavigation>
		</>
	);
};

export default MhicOrders;
