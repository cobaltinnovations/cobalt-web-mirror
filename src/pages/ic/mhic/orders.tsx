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
import { cloneDeep } from 'lodash';

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

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
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
						},
						isActive: !!matchPath('/ic/mhic/orders', pathname) && panelAccountId === null,
					},
					{
						title: 'Unassigned',
						description: '[TODO]',
						icon: () => <DotIcon className="text-n300" />,
						onClick: () => {
							window.alert('[TODO]: Unassigned query param?');
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
							},
							isActive:
								!!matchPath('/ic/mhic/orders', pathname) && panelAccountId === panelAccount.accountId,
						};
					}),
				]}
			>
				<div className="py-6">
					{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
						<Button
							className="me-4"
							variant="outline-primary"
							onClick={() => {
								setShowGenerateOrdersModal(true);
							}}
						>
							Generate Patient Orders
						</Button>
					)}
					<FileInputButton className="d-inline-flex" accept=".csv" onChange={handleImportPatientsInputChange}>
						Import Patients
					</FileInputButton>
				</div>
				<div className="mb-8">
					<Table isLoading={tableIsLoading}>
						<TableHead>
							<TableRow>
								<TableCell header width={64} sticky className="align-items-center">
									<Form.Check
										className="no-label"
										type="checkbox"
										name="orders"
										id="orders--select-all"
										label=""
										value="SELECT_ALL"
										checked={false}
										onChange={() => {
											window.alert('[TODO]: Select All');
										}}
									/>
								</TableCell>
								<TableCell header width={280} sticky stickyOffset={64}>
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
									<TableRow key={po.patientOrderId}>
										<TableCell header width={64} sticky className="align-items-center">
											<Form.Check
												className="no-label"
												type="checkbox"
												name="orders"
												id={`orders--${po.patientOrderId}`}
												label=""
												value={po.patientOrderId}
												checked={selectedPatientOrderIds.includes(po.patientOrderId)}
												onChange={({ currentTarget }) => {
													const selectedPatientOrderIdsClone =
														cloneDeep(selectedPatientOrderIds);

													const targetIndex = selectedPatientOrderIdsClone.findIndex(
														(poId) => poId === currentTarget.value
													);

													if (targetIndex > -1) {
														selectedPatientOrderIdsClone.splice(targetIndex, 1);
													} else {
														selectedPatientOrderIdsClone.push(currentTarget.value);
													}

													setSelectedPatientOrderIds(selectedPatientOrderIdsClone);
												}}
											/>
										</TableCell>
										<TableCell width={280} sticky stickyOffset={64} className="py-2">
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
										<TableCell className="text-right">
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
