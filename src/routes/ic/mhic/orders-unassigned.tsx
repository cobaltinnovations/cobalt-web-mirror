import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import {
	LoaderFunctionArgs,
	defer,
	useNavigate,
	useParams,
	useRevalidator,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';

import FileInputButton from '@/components/file-input-button';
import {
	MhicAssignOrderModal,
	MhicGenerateOrdersModal,
	MhicPageHeader,
	MhicPatientOrderTable,
} from '@/components/integrated-care/mhic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import config from '@/lib/config';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';

import {
	PatientOrderAssignmentStatusId,
	PatientOrderOutreachStatusId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderTriageStatusId,
} from '@/lib/models';
import TabBar from '@/components/tab-bar';

import { ReactComponent as UploadIcon } from '@/assets/icons/icon-upload.svg';
import { MhicShelfOutlet } from '@/components/integrated-care/mhic';

const unassignedTabsConfig = [
	{
		tabTitle: 'No Outreach (New)',
		routePath: 'new',
		apiParameters: {
			patientOrderOutreachStatusId: PatientOrderOutreachStatusId.NO_OUTREACH,
		},
	},
	{
		tabTitle: 'Waiting for Consent',
		routePath: 'pending-consent',
		apiParameters: {
			// TODO: WAITING_FOR_CONSENT query
		},
	},
	{
		tabTitle: 'Need Assessment',
		routePath: 'need-assessment',
		apiParameters: {
			patientOrderTriageStatusId: PatientOrderTriageStatusId.NEEDS_ASSESSMENT,
		},
	},
	{
		tabTitle: 'Safety Planning',
		routePath: 'safety-planning',
		apiParameters: {
			patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
		},
	},
	{
		tabTitle: 'MHP',
		routePath: 'mhp',
		apiParameters: {
			patientOrderTriageStatusId: PatientOrderTriageStatusId.MHP,
		},
	},
	{
		tabTitle: 'Specialty',
		routePath: 'specialty-care',
		apiParameters: {
			patientOrderTriageStatusId: PatientOrderTriageStatusId.SPECIALTY_CARE,
		},
	},
];

const uiTabs = unassignedTabsConfig.map((tabConfig) => {
	return {
		title: tabConfig.tabTitle,
		value: tabConfig.routePath,
	};
});

interface MhicOrdersUnassignedLoaderData {
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicOrdersUnassignedLoaderData() {
	return useRouteLoaderData('mhic-orders-unassigned') as MhicOrdersUnassignedLoaderData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const pageNumber = url.searchParams.get('pageNumber') ?? 0;

	const apiParameters = unassignedTabsConfig.find((c) => c.routePath === params.activeTab)?.apiParameters;

	return defer({
		patientOrdersListPromise: integratedCareService
			.getPatientOrders({
				pageSize: '15',
				patientOrderAssignmentStatusId: PatientOrderAssignmentStatusId.UNASSIGNED,
				...apiParameters,
				...(pageNumber && { pageNumber }),
			})
			.fetch()
			.then((r) => r.findResult),
	});
}

export const Component = () => {
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const { patientOrdersListPromise } = useMhicOrdersUnassignedLoaderData();
	const [searchParams, setSearchParams] = useSearchParams();
	const { activeTab = uiTabs[0].value } = useParams<{ activeTab: string }>();
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const navigate = useNavigate();
	const [totalCount, setTotalCount] = useState(0);
	const [totalCountDescription, setTotalCountDescription] = useState('');
	const revalidator = useRevalidator();

	const [showGenerateOrdersModal, setShowGenerateOrdersModal] = useState(false);

	const [selectAll, setSelectAll] = useState(false);
	const [selectedPatientOrderIds, setSelectedPatientOrderIds] = useState<string[]>([]);
	const [showAssignOrderModal, setShowAssignOrderModal] = useState(false);

	const handleImportButtonChange = useCallback(
		(file: File) => {
			const fileReader = new FileReader();

			fileReader.addEventListener('load', async () => {
				const fileContent = fileReader.result;

				try {
					if (typeof fileContent !== 'string') {
						throw new Error('Could not read file.');
					}

					await integratedCareService.importPatientOrders({ csvContent: fileContent }).fetch();

					revalidator.revalidate();

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
		[addFlag, handleError, revalidator]
	);

	const handleAssignOrdersSave = useCallback(
		async (patientOrderCount: number, panelAccountDisplayName: string) => {
			revalidator.revalidate();

			setSelectedPatientOrderIds([]);
			setShowAssignOrderModal(false);

			addFlag({
				variant: 'success',
				title: 'Patients assigned',
				description: `${patientOrderCount} Patients were assigned to ${panelAccountDisplayName}`,
				actions: [],
			});
		},
		[addFlag, revalidator]
	);

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

	useEffect(() => {
		patientOrdersListPromise.then((result) => {
			setTotalCount(result.totalCount);
			setTotalCountDescription(result.totalCountDescription);
		});
	}, [patientOrdersListPromise]);

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

			<MhicAssignOrderModal
				patientOrderIds={selectedPatientOrderIds}
				show={showAssignOrderModal}
				onHide={() => {
					setShowAssignOrderModal(false);
				}}
				onSave={handleAssignOrdersSave}
			/>

			<Container fluid className="px-8 py-8">
				<Row className="mb-8">
					<Col>
						<MhicPageHeader
							className="mb-6"
							title="Unassigned"
							description={`${totalCountDescription ?? 0} Order${totalCount === 1 ? '' : 's'}`}
						>
							<div className="d-flex align-items-center">
								{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
									<Button
										className="me-2"
										variant="outline-primary"
										onClick={() => {
											setShowGenerateOrdersModal(true);
										}}
									>
										Generate
									</Button>
								)}
								<FileInputButton className="me-2" accept=".csv" onChange={handleImportButtonChange}>
									<Button as="div" variant="outline-primary" className="d-flex align-items-center">
										<UploadIcon className="me-2" />
										Import
									</Button>
								</FileInputButton>
								<Button
									onClick={() => {
										// fetchPanelAccounts();
										setShowAssignOrderModal(true);
									}}
									disabled={selectedPatientOrderIds.length <= 0}
								>
									Assign{' '}
									{selectedPatientOrderIds.length > 0 && <>({selectedPatientOrderIds.length})</>}
								</Button>
							</div>
						</MhicPageHeader>
						<hr />
						<TabBar
							key="mhic-orders-unassigned-tabbar"
							value={activeTab}
							tabs={uiTabs}
							onTabClick={(value) => {
								navigate({
									pathname: '/ic/mhic/orders/unassigned/' + value,
								});
							}}
						/>
					</Col>
				</Row>
				<Row>
					<Col>
						<MhicPatientOrderTable
							patientOrderFindResultPromise={patientOrdersListPromise}
							selectAll={selectAll}
							onSelectAllChange={setSelectAll}
							selectedPatientOrderIds={selectedPatientOrderIds}
							onSelectPatientOrderIdsChange={setSelectedPatientOrderIds}
							pageNumber={parseInt(pageNumber, 10)}
							pageSize={15}
							onPaginationClick={handlePaginationClick}
							columnConfig={{
								checkbox: true,
								flag: true,
								patient: true,
								referralDate: true,
								practice: true,
								referralReason: true,
								outreachNumber: true,
								episode: true,
							}}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
