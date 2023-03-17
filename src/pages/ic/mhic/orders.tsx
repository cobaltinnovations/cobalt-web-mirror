import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { matchPath, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import config from '@/lib/config';
import { AccountModel, PatientOrderCountModel, PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import FileInputButton from '@/components/file-input-button';
import { MhicGenerateOrdersModal, MhicNavigation, MhicPatientOrderTable } from '@/components/integrated-care/mhic';

import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';

const MhicOrders = () => {
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const panelAccountId = useMemo(() => searchParams.get('panelAccountId'), [searchParams]);
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const pageSize = useRef(15);

	const [panelAccounts, setPanelAccounts] = useState<AccountModel[]>([]);
	const [activePatientOrderCountsByPanelAccountId, setActivePatientOrderCountsByPanelAccountId] =
		useState<Record<string, PatientOrderCountModel>>();
	const [overallActivePatientOrdersCountDescription, setOverallActivePatientOrdersCountDescription] = useState('0');
	const [showGenerateOrdersModal, setShowGenerateOrdersModal] = useState(false);
	const [tableIsLoading, setTableIsLoading] = useState(false);
	const [patientOrders, setPatientOrders] = useState<PatientOrderModel[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalCountDescription, setTotalCountDescription] = useState('0');

	const [selectAll, setSelectAll] = useState(false);
	const [selectedPatientOrderIds, setSelectedPatientOrderIds] = useState<string[]>([]);

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
			setTableIsLoading(true);

			const response = await integratedCareService
				.getPatientOrders({
					...(panelAccountId && { panelAccountId }),
					...(pageNumber && { pageNumber }),
					pageSize: String(pageSize.current),
				})
				.fetch();

			setPatientOrders(response.findResult.patientOrders);
			setTotalCount(response.findResult.totalCount);
			setTotalCountDescription(response.findResult.totalCountDescription);
		} catch (error) {
			handleError(error);
		} finally {
			setTableIsLoading(false);
		}
	}, [handleError, pageNumber, panelAccountId]);

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

	const clearSelections = useCallback(() => {
		setSelectAll(false);
		setSelectedPatientOrderIds([]);
	}, []);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);

			clearSelections();
		},
		[clearSelections, searchParams, setSearchParams]
	);

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
							navigate('/ic/mhic/orders');
							clearSelections();
						},
						isActive: !!matchPath('/ic/mhic/orders', pathname) && panelAccountId === null,
					},
					{
						title: 'Unassigned',
						description: '[TODO]',
						icon: () => <DotIcon className="text-n300" />,
						onClick: () => {
							window.alert('[TODO]: Unassigned query param?');
							clearSelections();
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
								navigate(`/ic/mhic/orders?panelAccountId=${panelAccount.accountId}`);
								clearSelections();
							},
							isActive:
								!!matchPath('/ic/mhic/orders', pathname) && panelAccountId === panelAccount.accountId,
						};
					}),
				]}
			>
				<div className="py-8 d-flex align-items-center justify-content-between">
					<div className="d-flex align-items-end">
						<h2 className="m-0">
							Pending Orders{' '}
							<span className="text-gray fs-large fw-normal">
								{totalCountDescription} {totalCount === 1 ? 'Order' : 'Orders'}
							</span>
						</h2>
					</div>
					<div>
						{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
							<Button
								className="me-4"
								variant="outline-primary"
								onClick={() => {
									setShowGenerateOrdersModal(true);
								}}
							>
								Generate
							</Button>
						)}
						<FileInputButton
							className="me-4 d-inline-flex"
							accept=".csv"
							onChange={handleImportPatientsInputChange}
						>
							Import
						</FileInputButton>
						<Button
							onClick={() => {
								window.alert('[TODO]: Assign Orders');
							}}
							disabled={selectedPatientOrderIds.length <= 0}
						>
							Assign Orders{' '}
							{selectedPatientOrderIds.length > 0 && <>({selectedPatientOrderIds.length})</>}
						</Button>
					</div>
				</div>
				<MhicPatientOrderTable
					isLoading={tableIsLoading}
					patientOrders={patientOrders}
					selectAll={selectAll}
					onSelectAllChange={setSelectAll}
					selectedPatientOrderIds={selectedPatientOrderIds}
					onSelectPatientOrderIdsChange={setSelectedPatientOrderIds}
					totalPatientOrdersCount={totalCount}
					totalPatientOrdersDescription={totalCountDescription}
					pageNumber={parseInt(pageNumber, 10)}
					pageSize={pageSize.current}
					onPaginationClick={handlePaginationClick}
					columnConfig={{
						checkbox: true,
						flag: true,
						patient: true,
						referralDate: true,
						practice: true,
						referralReason: true,
						assessmentStatus: false,
						outreachNumber: true,
						lastOutreach: false,
						assessmentScheduled: false,
						assessmentCompleted: false,
						completedBy: false,
						triage: false,
						resources: false,
						checkInScheduled: false,
						checkInResponse: false,
						episode: true,
						assignedMhic: false,
					}}
				/>
			</MhicNavigation>
		</>
	);
};

export default MhicOrders;
