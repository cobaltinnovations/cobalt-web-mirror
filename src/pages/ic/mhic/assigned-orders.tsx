import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderModel, PatientOrderStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import { MhicCustomizeTableModal, MhicFilterDropdown, MhicSortDropdown } from '@/components/integrated-care/mhic';

const MhicAssignedOrders = () => {
	const handleError = useHandleError();

	const [searchParams, setSearchParams] = useSearchParams();
	const patientOrderPanelTypeId = useMemo(() => searchParams.get('patientOrderPanelTypeId'), [searchParams]);
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const pageSize = useRef(15);

	const [tableIsLoading, setTableIsLoading] = useState(false);
	const [patientOrders, setPatientOrders] = useState<PatientOrderModel[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalCountDescription, setTotalCountDescription] = useState('0');

	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);

	const fetchPatientOrders = useCallback(async () => {
		try {
			setTableIsLoading(true);

			const response = await integratedCareService
				.getPatientOrders({
					...(patientOrderPanelTypeId && { patientOrderPanelTypeId }),
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
	}, [handleError, pageNumber, patientOrderPanelTypeId]);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	useEffect(() => {
		fetchPatientOrders();
	}, [fetchPatientOrders]);

	return (
		<>
			<MhicCustomizeTableModal
				show={showCustomizeTableModal}
				onHide={() => {
					setShowCustomizeTableModal(false);
				}}
				onSave={() => {
					setShowCustomizeTableModal(false);
				}}
			/>

			<div className="py-6 d-flex align-items-center justify-content-between">
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
			<div className="mb-8">
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
										if (!po.patientOrderId) {
											return;
										}

										setSearchParams({
											...searchParams,
											openPatientOrderId: po.patientOrderId,
										});
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
											{po.patientOrderStatusId === PatientOrderStatusId.OPEN && (
												<Badge pill bg="outline-primary">
													New
												</Badge>
											)}
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
			<div className="pb-20">
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

export default MhicAssignedOrders;
