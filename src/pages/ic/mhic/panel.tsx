import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { AccountModel, PatientOrderCountModel, PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import {
	MhicAccountHeader,
	MhicCustomizeTableModal,
	MhicFilterDropdown,
	MhicNavigation,
	MhicPatientOrderShelf,
	MhicSortDropdown,
	MhicSwitchAccountModal,
} from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import useFlags from '@/hooks/use-flags';

const useStyles = createUseThemedStyles((theme) => ({
	row: {
		padding: '0 64px',
	},
}));

const MhicPanel = () => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();

	const [searchParams, setSearchParams] = useSearchParams();
	const patientOrderPanelTypeId = useMemo(() => searchParams.get('patientOrderPanelTypeId'), [searchParams]);
	const panelAccountId = useMemo(() => searchParams.get('panelAccountId'), [searchParams]);
	const searchQuery = useMemo(() => searchParams.get('searchQuery'), [searchParams]);
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const pageSize = useRef(15);

	const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
	const [panelAccounts, setPanelAccounts] = useState<AccountModel[]>([]);
	const [activePatientOrderCountsByPanelAccountId, setActivePatientOrderCountsByPanelAccountId] =
		useState<Record<string, PatientOrderCountModel>>();

	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);

	const [tableIsLoading, setTableIsLoading] = useState(false);
	const [patientOrders, setPatientOrders] = useState<PatientOrderModel[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalCountDescription, setTotalCountDescription] = useState('0');
	const [clickedPatientMrn, setClickedPatientMrn] = useState('');

	const fetchPanelAccounts = useCallback(async () => {
		try {
			const response = await integratedCareService.getPanelAccounts().fetch();

			setPanelAccounts(response.panelAccounts);
			setActivePatientOrderCountsByPanelAccountId(response.activePatientOrderCountsByPanelAccountId);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	const fetchPatientOrders = useCallback(async () => {
		try {
			setTableIsLoading(true);

			const response = await integratedCareService
				.getPatientOrders({
					...(patientOrderPanelTypeId && { patientOrderPanelTypeId }),
					...(panelAccountId && { panelAccountId }),
					...(searchQuery && { searchQuery }),
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
	}, [handleError, pageNumber, panelAccountId, patientOrderPanelTypeId, searchQuery]);

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

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));

			setSearchParams(searchParams);
			setShowSwitchAccountModal(false);
		},
		[searchParams, setSearchParams]
	);

	useEffect(() => {
		fetchPatientOrders();
	}, [fetchPatientOrders]);

	useEffect(() => {
		fetchPanelAccounts();
	}, [fetchPanelAccounts]);

	return (
		<>
			{activePatientOrderCountsByPanelAccountId && (
				<MhicSwitchAccountModal
					currentPanelAccountId={panelAccountId ?? ''}
					panelAccounts={panelAccounts}
					activePatientOrderCountsByPanelAccountId={activePatientOrderCountsByPanelAccountId}
					show={showSwitchAccountModal}
					onSwitchButtonClick={(paid) => {
						searchParams.set('panelAccountId', paid);

						setSearchParams(searchParams);
						setShowSwitchAccountModal(false);
					}}
					onHide={() => {
						setShowSwitchAccountModal(false);
					}}
				/>
			)}

			<MhicCustomizeTableModal
				show={showCustomizeTableModal}
				onHide={() => {
					setShowCustomizeTableModal(false);
				}}
				onSave={() => {
					setShowCustomizeTableModal(false);
				}}
			/>

			<MhicPatientOrderShelf
				patientMrn={clickedPatientMrn}
				onHide={() => {
					setClickedPatientMrn('');
				}}
			/>

			<MhicAccountHeader
				onSwitchButtonClick={() => {
					setShowSwitchAccountModal(true);
				}}
				onImportPatientsInputChange={handleImportPatientsInputChange}
			/>
			<MhicNavigation />
			<div className={classNames(classes.row, 'py-6 d-flex align-items-center justify-content-between')}>
				<div className="d-flex">
					<MhicFilterDropdown />
					<MhicSortDropdown />
				</div>
				<Button
					variant="light"
					onClick={() => {
						setShowCustomizeTableModal(true);
					}}
				>
					Customize View
				</Button>
			</div>
			<div className={classNames(classes.row, 'mb-8')}>
				<Table isLoading={tableIsLoading}>
					<TableHead>
						<TableRow>
							<TableCell header width={280} sticky>
								Patient
							</TableCell>
							<TableCell header>Referral Date</TableCell>
							<TableCell header>Practice</TableCell>
							<TableCell header>Referral Reason</TableCell>
							<TableCell header>Referral Status</TableCell>
							<TableCell header>Attempts</TableCell>
							<TableCell header>Last Outreach</TableCell>
							<TableCell header>Episode</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{patientOrders.map((po) => {
							return (
								<TableRow
									key={po.patientOrderId}
									onClick={() => {
										if (!po.patientMrn) {
											return;
										}

										setClickedPatientMrn(po.patientMrn);
									}}
								>
									<TableCell width={280} sticky className="py-2">
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
									<TableCell>
										<div>
											<Badge pill bg="outline-primary">
												NEW
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										<span className="fw-bold">0</span>
									</TableCell>
									<TableCell>
										<span className="fw-bold">&#8212;</span>
									</TableCell>
									<TableCell>
										<span className="fw-bold">{po.episodeDurationInDaysDescription}</span>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
			<div className={classNames(classes.row, 'pb-20')}>
				<Container fluid>
					<Row>
						<Col xs={4}>
							<div className="d-flex align-items-center">
								<p className="mb-0 fs-large fw-bold text-gray">
									Showing <span className="text-dark">{patientOrders.length}</span> of{' '}
									<span className="text-dark">{totalCountDescription}</span> Patients
								</p>
							</div>
						</Col>
						<Col xs={4}>
							<div className="d-flex justify-content-center align-items-center">
								<TablePagination
									total={totalCount}
									page={parseInt(pageNumber, 10)}
									size={pageSize.current}
									onClick={handlePaginationClick}
								/>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		</>
	);
};

export default MhicPanel;
