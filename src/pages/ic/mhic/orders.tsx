import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { matchPath, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import config from '@/lib/config';
import { AccountModel, PatientOrderCountModel, PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import FileInputButton from '@/components/file-input-button';
import { MhicGenerateOrdersModal, MhicNavigation } from '@/components/integrated-care/mhic';

import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';
import { ReactComponent as FlagIcon } from '@/assets/icons/icon-flag.svg';

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
				<div className="mb-8">
					<Table isLoading={tableIsLoading}>
						<TableHead>
							<TableRow>
								<TableCell header width={56} sticky className="ps-6 pe-0 align-items-start">
									<Form.Check
										className="no-label"
										type="checkbox"
										name="orders"
										id="orders--select-all"
										label=""
										value="SELECT_ALL"
										checked={selectAll}
										onChange={({ currentTarget }) => {
											if (currentTarget.checked) {
												const allPatientOrderIds = cloneDeep(patientOrders).map(
													(order) => order.patientOrderId
												);

												setSelectedPatientOrderIds(allPatientOrderIds);
											} else {
												setSelectedPatientOrderIds([]);
											}

											setSelectAll(currentTarget.checked);
										}}
									/>
								</TableCell>
								<TableCell
									header
									width={44}
									stickyOffset={56}
									sticky
									className="align-items-center"
								></TableCell>
								<TableCell header width={320} sticky stickyOffset={100} stickyBorder>
									Patient
								</TableCell>
								<TableCell header>Referral Date</TableCell>
								<TableCell header>Practice</TableCell>
								<TableCell header>Referral Reason</TableCell>
								<TableCell header className="text-right">
									Outreach #
								</TableCell>
								<TableCell header className="text-right">
									Episode
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{patientOrders.map((po) => {
								return (
									<TableRow
										key={po.patientOrderId}
										onClick={() => {
											if (!po.patientOrderId) {
												return;
											}

											searchParams.set('openPatientOrderId', po.patientOrderId);
											setSearchParams(searchParams);
										}}
										highlighted={selectedPatientOrderIds.includes(po.patientOrderId)}
									>
										<TableCell header width={56} sticky className="ps-6 pe-0 align-items-start">
											<Form.Check
												className="no-label"
												type="checkbox"
												name="orders"
												id={`orders--${po.patientOrderId}`}
												label=""
												value={po.patientOrderId}
												checked={selectedPatientOrderIds.includes(po.patientOrderId)}
												onClick={(event) => {
													event.stopPropagation();
												}}
												onChange={({ currentTarget }) => {
													const selectedPatientOrderIdsClone =
														cloneDeep(selectedPatientOrderIds);

													const targetIndex = selectedPatientOrderIdsClone.findIndex(
														(orderId) => orderId === currentTarget.value
													);

													if (targetIndex > -1) {
														selectedPatientOrderIdsClone.splice(targetIndex, 1);
													} else {
														selectedPatientOrderIdsClone.push(currentTarget.value);
													}

													const allAreSelected = patientOrders.every((order) =>
														selectedPatientOrderIdsClone.includes(order.patientOrderId)
													);

													if (allAreSelected) {
														setSelectAll(true);
													} else {
														setSelectAll(false);
													}

													setSelectedPatientOrderIds(selectedPatientOrderIdsClone);
												}}
											/>
										</TableCell>
										<TableCell
											width={44}
											sticky
											stickyOffset={56}
											className="px-0 align-items-center"
										>
											<div className="w-100 d-flex align-items-center justify-content-end">
												<span className="text-gray">0</span>
												<FlagIcon className="text-warning" />
											</div>
										</TableCell>
										<TableCell width={320} sticky stickyOffset={100} stickyBorder className="py-2">
											<span className="d-block fw-bold">{po.patientDisplayName}</span>
											<span className="d-block text-gray">{po.patientMrn}</span>
										</TableCell>
										<TableCell>
											<span className="fw-bold">{po.orderDateDescription}</span>
										</TableCell>
										<TableCell>
											<span className="fw-bold">{po.referringPracticeName}</span>
										</TableCell>
										<TableCell>
											<span className="fw-bold">{po.reasonForReferral}</span>
										</TableCell>
										<TableCell className="text-right">
											<span className="fw-bold text-danger">[TODO]: 0</span>
										</TableCell>
										<TableCell className="text-right text-nowrap">
											<span className="fw-bold">{po.episodeDurationInDaysDescription}</span>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
				<div className="pb-20">
					<Container fluid>
						<Row>
							<Col xs={{ span: 4, offset: 4 }}>
								<div className="d-flex justify-content-center align-items-center">
									<TablePagination
										total={totalCount}
										page={parseInt(pageNumber, 10)}
										size={pageSize.current}
										onClick={handlePaginationClick}
									/>
								</div>
							</Col>
							<Col xs={4}>
								<div className="d-flex justify-content-end align-items-center">
									<p className="mb-0 fs-large fw-bold text-gray">
										<span className="text-dark">{patientOrders.length}</span> of{' '}
										<span className="text-dark">{totalCountDescription}</span> Patients
									</p>
								</div>
							</Col>
						</Row>
					</Container>
				</div>
			</MhicNavigation>
		</>
	);
};

export default MhicOrders;
