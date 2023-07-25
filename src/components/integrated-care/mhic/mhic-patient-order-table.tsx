import { cloneDeep } from 'lodash';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Await, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Col, Container, Form, Row } from 'react-bootstrap';

import {
	PatientOrderCareTypeId,
	PatientOrderConsentStatusId,
	PatientOrderDispositionId,
	PatientOrderModel,
	PatientOrderResourcingStatusId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderScreeningStatusId,
} from '@/lib/models';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';

import { ReactComponent as FlagIcon } from '@/assets/icons/icon-flag.svg';
import { ReactComponent as FilledCircleIcon } from '@/assets/icons/icon-filled-circle.svg';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import { PatientOrdersListResponse } from '@/lib/services';
import NoData from '@/components/no-data';

const dispositionVariantMap = {
	[PatientOrderDispositionId.OPEN]: 'success',
	[PatientOrderDispositionId.CLOSED]: 'light',
	[PatientOrderDispositionId.ARCHIVED]: 'dark',
};

const useStyles = createUseThemedStyles((theme) => ({
	[`${PatientOrderDispositionId.OPEN}-row`]: {
		backgroundColor: theme.colors.s50,
	},
	[`${PatientOrderDispositionId.CLOSED}-row`]: {
		backgroundColor: theme.colors.n50,
	},
	[`${PatientOrderDispositionId.ARCHIVED}-row`]: {
		backgroundColor: theme.colors.n50,
	},
	[`${PatientOrderDispositionId.OPEN}-icon`]: {
		fill: theme.colors.s500,
	},
	[`${PatientOrderDispositionId.CLOSED}-icon`]: {
		fill: theme.colors.n50,
	},
	[`${PatientOrderDispositionId.ARCHIVED}-icon`]: {
		fill: theme.colors.n50,
	},
}));

export type MhicPatientOrderTableColumnConfig = {
	checkbox?: boolean;
	flag?: boolean;
	patient?: boolean;
	assignedMhic?: boolean;
	mrn?: boolean;
	referralDate?: boolean;
	preferredPhone?: boolean;
	practice?: boolean;
	orderState?: boolean;
	referralReason?: boolean;
	insurance?: boolean;
	assessmentStatus?: boolean;
	outreachNumber?: boolean;
	lastOutreach?: boolean;
	assessmentCompleted?: boolean;
	consent?: boolean;
	assessmentScheduled?: boolean;
	triage?: boolean;
	resources?: boolean;
	checkInScheduled?: boolean;
	checkInResponse?: boolean;
	episodeClosed?: boolean;
	episode?: boolean;
};

interface MhicPatientOrderTableProps {
	patientOrderFindResultPromise: Promise<PatientOrdersListResponse['findResult']>;
	selectAll: boolean;
	onSelectAllChange?(value: boolean): void;
	selectedPatientOrderIds?: string[];
	onSelectPatientOrderIdsChange?(selectedPatientOrderIds: string[]): void;
	pageNumber: number;
	pageSize: number;
	onPaginationClick(pageIndex: number): void;
	columnConfig: MhicPatientOrderTableColumnConfig;
	isLoading?: boolean;
	coloredRows?: boolean;
	showPagination?: boolean;
}

export const MhicPatientOrderTable = ({
	patientOrderFindResultPromise,
	selectAll,
	onSelectAllChange,
	selectedPatientOrderIds = [],
	onSelectPatientOrderIdsChange,
	pageNumber,
	pageSize,
	onPaginationClick,
	columnConfig,
	isLoading = false,
	coloredRows = false,
	showPagination = true,
}: MhicPatientOrderTableProps) => {
	const classes = useStyles();
	const location = useLocation();
	const navigate = useNavigate();

	const [didLoad, setDidLoad] = useState(false);
	const [patientOrders, setPatientOrders] = useState<PatientOrderModel[]>([]);

	const [totalPatientOrdersCount, setTotalPatientOrdersCount] = useState(0);
	const [totalPatientOrdersDescription, setTotalPatientOrdersDescription] = useState('0');

	const patientColumnOffset = useMemo(() => {
		let offset = 0;

		if (columnConfig.checkbox) {
			offset += 56;
		}
		if (columnConfig.flag) {
			offset += 44;
		}

		return offset;
	}, [columnConfig.checkbox, columnConfig.flag]);

	const mhicColumnOffset = useMemo(() => {
		let offset = 0;

		if (columnConfig.checkbox) {
			offset += 56;
		}
		if (columnConfig.flag) {
			offset += 44;
		}
		if (columnConfig.patient) {
			offset += 240;
		}

		return offset;
	}, [columnConfig.checkbox, columnConfig.flag, columnConfig.patient]);

	const getFlagCount = useCallback((patientOrder: PatientOrderModel) => {
		let count = 0;

		if (patientOrder.patientBelowAgeThreshold) {
			count++;
		}
		if (patientOrder.mostRecentEpisodeClosedWithinDateThreshold) {
			count++;
		}
		if (
			patientOrder.patientOrderSafetyPlanningStatusId === PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING
		) {
			count++;
		}
		if (!patientOrder.patientAddressRegionAccepted) {
			count++;
		}
		if (!patientOrder.primaryPlanAccepted) {
			count++;
		}

		return count;
	}, []);

	const getFlagColor = useCallback((patientOrder: PatientOrderModel) => {
		if (
			patientOrder.patientOrderSafetyPlanningStatusId === PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING
		) {
			return 'text-danger';
		}

		return 'text-warning';
	}, []);

	useEffect(() => {
		if (!patientOrderFindResultPromise) {
			return;
		}

		// TODO: Perhaps better moving resolution behind <Await />
		patientOrderFindResultPromise
			.then((response) => {
				setPatientOrders(response.patientOrders);
				setTotalPatientOrdersCount(response.totalCount);
				setTotalPatientOrdersDescription(response.totalCountDescription);
			})
			.catch((e) => {
				setPatientOrders([]);
				setTotalPatientOrdersCount(0);
				setTotalPatientOrdersDescription('0');
			})
			.finally(() => {
				setDidLoad(true);
			});
	}, [patientOrderFindResultPromise]);

	return (
		<>
			<div className="mb-8">
				<Table isLoading={isLoading}>
					<TableHead>
						<TableRow>
							{columnConfig.checkbox && (
								<TableCell
									header
									width={56}
									sticky
									className="ps-6 pe-0 align-items-start"
									stickyBorder={
										!columnConfig.flag && !columnConfig.patient && !columnConfig.assignedMhic
									}
								>
									<Form.Check
										className="no-label"
										type="checkbox"
										name="orders"
										id="orders--select-all"
										label=""
										value="SELECT_ALL"
										checked={selectAll}
										onChange={({ currentTarget }) => {
											onSelectAllChange?.(currentTarget.checked);

											if (!currentTarget.checked) {
												onSelectPatientOrderIdsChange?.([]);
												return;
											}

											patientOrderFindResultPromise.then((list) => {
												const allPatientOrderIds = list.patientOrders.map(
													(order) => order.patientOrderId
												);

												onSelectPatientOrderIdsChange?.(allPatientOrderIds);
											});
										}}
									/>
								</TableCell>
							)}
							{columnConfig.flag && (
								<TableCell
									header
									width={44}
									stickyOffset={columnConfig.checkbox ? 56 : 0}
									sticky
									stickyBorder={!columnConfig.patient && !columnConfig.assignedMhic}
									className="align-items-center"
								></TableCell>
							)}
							{columnConfig.patient && (
								<TableCell
									header
									width={240}
									sticky
									stickyOffset={patientColumnOffset}
									stickyBorder={!columnConfig.assignedMhic}
								>
									Patient
								</TableCell>
							)}
							{columnConfig.assignedMhic && (
								<TableCell header width={280} sticky stickyOffset={mhicColumnOffset} stickyBorder>
									Assigned MHIC
								</TableCell>
							)}
							{columnConfig.mrn && <TableCell header>MRN</TableCell>}
							{columnConfig.referralDate && <TableCell header>Referral Date</TableCell>}
							{columnConfig.preferredPhone && <TableCell header>Pref. Phone</TableCell>}
							{columnConfig.practice && <TableCell header>Practice</TableCell>}
							{columnConfig.referralReason && <TableCell header>Referral Reason</TableCell>}
							{columnConfig.insurance && <TableCell header>Insurance</TableCell>}
							{columnConfig.orderState && <TableCell header>Order State</TableCell>}
							{columnConfig.assessmentStatus && <TableCell header>Assessment Status</TableCell>}
							{columnConfig.outreachNumber && (
								<TableCell header className="text-right">
									Outreach #
								</TableCell>
							)}
							{columnConfig.lastOutreach && <TableCell header>Last Outreach</TableCell>}
							{columnConfig.assessmentCompleted && <TableCell header>Assess. Completed</TableCell>}
							{columnConfig.consent && <TableCell header>Consent</TableCell>}
							{columnConfig.assessmentScheduled && <TableCell header>Assess. Scheduled</TableCell>}
							{columnConfig.triage && <TableCell header>Triage</TableCell>}
							{columnConfig.resources && <TableCell header>Resources</TableCell>}
							{columnConfig.checkInScheduled && <TableCell header>Check-In Scheduled</TableCell>}
							{columnConfig.checkInResponse && <TableCell header>Check-In Response</TableCell>}
							{columnConfig.episodeClosed && <TableCell header>Episode Closed</TableCell>}
							{columnConfig.episode && (
								<TableCell header className="text-right">
									Episode
								</TableCell>
							)}
						</TableRow>
					</TableHead>
					<TableBody>
						<Suspense>
							<Await resolve={didLoad || patientOrderFindResultPromise}>
								{!isLoading && patientOrders.length === 0 && (
									<TableRow>
										<TableCell colSpan={Object.values(columnConfig).filter((v) => v).length}>
											<NoData
												className="bg-white border-0"
												title="No Orders"
												description="There are 0 orders matching your selection"
												actions={[]}
											/>
										</TableCell>
									</TableRow>
								)}
								{patientOrders.map((po) => {
									return (
										<TableRow
											key={po.patientOrderId}
											onClick={() => {
												if (!po.patientOrderId) {
													return;
												}

												navigate({
													pathname: location.pathname + '/' + po.patientOrderId,
													search: location.search,
												});
											}}
											highlighted={selectedPatientOrderIds.includes(po.patientOrderId)}
											className={classNames({
												[classes[`${po.patientOrderDispositionId}-row`]]: coloredRows,
											})}
										>
											{columnConfig.checkbox && (
												<TableCell
													header
													width={56}
													sticky
													stickyBorder={
														!columnConfig.flag &&
														!columnConfig.patient &&
														!columnConfig.assignedMhic
													}
													className="ps-6 pe-0 align-items-start"
												>
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
																selectedPatientOrderIdsClone.includes(
																	order.patientOrderId
																)
															);

															if (allAreSelected) {
																onSelectAllChange?.(true);
															} else {
																onSelectAllChange?.(false);
															}

															onSelectPatientOrderIdsChange?.(
																selectedPatientOrderIdsClone
															);
														}}
													/>
												</TableCell>
											)}
											{columnConfig.flag && (
												<TableCell
													width={44}
													sticky
													stickyBorder={!columnConfig.patient && !columnConfig.assignedMhic}
													stickyOffset={columnConfig.checkbox ? 56 : 0}
													className="px-0 flex-row align-items-center justify-content-end"
												>
													{getFlagCount(po) > 0 && (
														<>
															<span className="text-gray">{getFlagCount(po)}</span>
															<FlagIcon className={getFlagColor(po)} />
														</>
													)}
												</TableCell>
											)}
											{columnConfig.patient && (
												<TableCell
													width={240}
													sticky
													stickyOffset={patientColumnOffset}
													stickyBorder={!columnConfig.assignedMhic}
													className="py-2"
												>
													<span className="d-block text-nowrap">{po.patientDisplayName}</span>
													<span className="d-block text-nowrap text-gray">
														{po.patientMrn}
													</span>
												</TableCell>
											)}
											{columnConfig.assignedMhic && (
												<TableCell
													width={280}
													sticky
													stickyOffset={mhicColumnOffset}
													stickyBorder
												>
													<span className="text-nowrap text-truncate">
														{po.panelAccountDisplayName ?? 'Unassigned'}
													</span>
												</TableCell>
											)}
											{columnConfig.mrn && <TableCell header>{po.patientMrn}</TableCell>}
											{columnConfig.referralDate && (
												<TableCell width={144}>
													<span className="text-nowrap text-truncate">
														{po.orderDateDescription}
													</span>
												</TableCell>
											)}
											{columnConfig.preferredPhone && (
												<TableCell header>{po.patientPhoneNumberDescription}</TableCell>
											)}

											{columnConfig.practice && (
												<TableCell width={240}>
													<span className="text-nowrap text-truncate">
														{po.referringPracticeName}
													</span>
												</TableCell>
											)}
											{columnConfig.referralReason && (
												<TableCell width={320}>
													<span className="text-nowrap text-truncate">
														{po.reasonForReferral}
													</span>
												</TableCell>
											)}
											{columnConfig.insurance && (
												<TableCell width={240} className="py-2">
													<span className="d-block text-nowrap text-truncate">
														{po.primaryPayorName}
													</span>
													<span className="d-block text-gray text-nowrap text-truncate">
														{po.primaryPlanName}
													</span>
												</TableCell>
											)}
											{columnConfig.orderState && (
												<TableCell>
													<div>
														<Badge
															pill
															bg={
																'outline-' +
																dispositionVariantMap[po.patientOrderDispositionId]
															}
														>
															<FilledCircleIcon
																className={
																	classes[`${po.patientOrderDispositionId}-icon`]
																}
															/>
															{'  '} {po.patientOrderDispositionDescription}
														</Badge>
													</div>
												</TableCell>
											)}
											{columnConfig.assessmentStatus && (
												<TableCell
													width={140}
													className="flex-row align-items-center justify-content-start"
												>
													{po.patientOrderScreeningStatusId ===
														PatientOrderScreeningStatusId.NOT_SCREENED && (
														<Badge pill bg="outline-dark" className="text-nowrap">
															{po.patientOrderScreeningStatusDescription}
														</Badge>
													)}
													{po.patientOrderScreeningStatusId ===
														PatientOrderScreeningStatusId.SCHEDULED && (
														<Badge pill bg="outline-success" className="text-nowrap">
															{po.patientOrderScreeningStatusDescription}
														</Badge>
													)}
													{po.patientOrderScreeningStatusId ===
														PatientOrderScreeningStatusId.IN_PROGRESS && (
														<Badge pill bg="outline-secondary" className="text-nowrap">
															{po.patientOrderScreeningStatusDescription}
														</Badge>
													)}
													{po.patientOrderScreeningStatusId ===
														PatientOrderScreeningStatusId.COMPLETE && (
														<Badge pill bg="outline-primary" className="text-nowrap">
															{po.patientOrderScreeningStatusDescription}
														</Badge>
													)}
												</TableCell>
											)}
											{columnConfig.outreachNumber && (
												<TableCell width={116} className="text-right">
													<span className="text-nowrap text-truncate">
														{po.totalOutreachCountDescription}
													</span>
												</TableCell>
											)}
											{columnConfig.lastOutreach && (
												<TableCell width={170}>
													<span className="text-nowrap text-truncate">
														{po.mostRecentTotalOutreachDateTimeDescription ?? '-'}
													</span>
												</TableCell>
											)}
											{columnConfig.assessmentCompleted && (
												<TableCell width={170}>
													<span className="text-nowrap text-truncate">
														{po.mostRecentScreeningSessionCompletedAtDescription ?? '-'}
													</span>
												</TableCell>
											)}
											{columnConfig.consent && (
												<TableCell width={170}>
													<span className="text-nowrap text-truncate">
														{po.patientOrderConsentStatusId ===
															PatientOrderConsentStatusId.UNKNOWN && '-'}
														{po.patientOrderConsentStatusId ===
															PatientOrderConsentStatusId.CONSENTED && 'Yes'}
														{po.patientOrderConsentStatusId ===
															PatientOrderConsentStatusId.REJECTED && 'No'}
													</span>
												</TableCell>
											)}
											{columnConfig.assessmentScheduled && (
												<TableCell width={170}>
													<span className="text-nowrap text-truncate">
														{po.patientOrderScheduledScreeningScheduledDateTimeDescription ??
															'-'}
													</span>
												</TableCell>
											)}
											{columnConfig.triage && (
												<TableCell className="flex-row align-items-center justify-content-start">
													{po.patientOrderCareTypeId ===
														PatientOrderCareTypeId.SUBCLINICAL && (
														<Badge pill bg="outline-dark" className="text-nowrap">
															{po.patientOrderCareTypeDescription}
														</Badge>
													)}
													{po.patientOrderCareTypeId === PatientOrderCareTypeId.SPECIALTY && (
														<Badge pill bg="outline-warning" className="text-nowrap">
															{po.patientOrderCareTypeDescription}
														</Badge>
													)}
													{po.patientOrderCareTypeId ===
														PatientOrderCareTypeId.COLLABORATIVE && (
														<Badge pill bg="outline-primary" className="text-nowrap">
															{po.patientOrderCareTypeDescription}
														</Badge>
													)}
												</TableCell>
											)}
											{columnConfig.resources && (
												<TableCell className="flex-row align-items-center justify-content-start">
													{po.patientOrderResourcingStatusId ===
														PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
														<Badge pill bg="outline-danger" className="text-nowrap me-2">
															Need
														</Badge>
													)}
												</TableCell>
											)}
											{columnConfig.checkInScheduled && (
												<TableCell width={180}>
													<span className="text-nowrap text-truncate">
														{po.resourceCheckInScheduledAtDateTimeDescription}
													</span>
												</TableCell>
											)}
											{columnConfig.checkInResponse && (
												<TableCell width={172}>
													<span className="text-nowrap text-truncate">
														{po.patientOrderResourceCheckInResponseStatusDescription}
													</span>
												</TableCell>
											)}
											{columnConfig.episodeClosed && (
												<TableCell width={170} className="text-right">
													<span className="text-nowrap text-truncate">
														{po.episodeClosedAtDescription ?? '-'}
													</span>
												</TableCell>
											)}
											{columnConfig.episode && (
												<TableCell width={120} className="text-right">
													<span className="text-nowrap text-truncate">
														{po.episodeDurationInDaysDescription}
													</span>
												</TableCell>
											)}
										</TableRow>
									);
								})}
							</Await>
						</Suspense>
					</TableBody>
				</Table>
			</div>
			{showPagination && (
				<div className="pb-20">
					<Container fluid>
						<Row>
							<Col xs={{ span: 4, offset: 4 }}>
								<div className="d-flex justify-content-center align-items-center">
									<TablePagination
										total={totalPatientOrdersCount ?? 0}
										page={pageNumber}
										size={pageSize}
										onClick={onPaginationClick}
									/>
								</div>
							</Col>
							<Col xs={4}>
								<div className="d-flex justify-content-end align-items-center">
									<p className="mb-0 fw-semibold text-gray">
										<span className="text-dark">{patientOrders.length}</span> of{' '}
										<span className="text-dark">{totalPatientOrdersDescription}</span> Patients
									</p>
								</div>
							</Col>
						</Row>
					</Container>
				</div>
			)}
		</>
	);
};
