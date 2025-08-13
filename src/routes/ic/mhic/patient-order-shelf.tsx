import {
	LoaderFunctionArgs,
	RouteObject,
	defer,
	useLoaderData,
	useLocation,
	useMatches,
	useNavigate,
} from 'react-router-dom';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Tab } from 'react-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';

import { PatientOrderResponse, analyticsService, integratedCareService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';

import TabBar from '@/components/tab-bar';
import { MhicComments, MhicContactHistory, MhicOrderDetails } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import SvgIcon from '@/components/svg-icon';

import { Await } from 'react-router-dom';

import Loader from '@/components/loader';
import { MhicPatientOrderShelfActions } from '@/components/integrated-care/mhic/mhic-patient-order-shelf-actions';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';
import useHandleError from '@/hooks/use-handle-error';
import { AnalyticsNativeEventMhicOrderDetailSectionId, AnalyticsNativeEventTypeId } from '@/lib/models';

export const mhicShelfRouteObject: RouteObject = {
	path: ':patientOrderId',
	lazy: () => import('@/routes/ic/mhic/patient-order-shelf'),
	handle: {
		isMhicPatientOrderShelf: true,
	},
};

export function useMhicPatientOrdereShelfLoaderData() {
	const matches = useMatches();

	return matches.find((m) => (m.handle as Record<string, boolean>)?.['isMhicPatientOrderShelf'])
		?.data as MhicPatientOrderShelfLoaderData;
}

interface MhicPatientOrderShelfLoaderData {
	getResponseChecksum: () => Promise<string | undefined>;
	patientOrderPromise: Promise<PatientOrderResponse>;
	patientOrderAbort(): void;
}

function loadShelfData(patientOrderId: string, isPolling = false) {
	const request = integratedCareService.getPatientOrder(patientOrderId);
	const patientOrderPromise = request.fetch({ isPolling });
	const patientOrderAbort = request.abort;

	return {
		getResponseChecksum: () => patientOrderPromise.then(() => request.cobaltResponseChecksum),
		patientOrderPromise,
		patientOrderAbort,
	};
}

export async function loader({ params }: LoaderFunctionArgs) {
	const patientOrderId = params.patientOrderId;

	if (!patientOrderId) {
		throw new Error('Unknown Patient Order');
	}

	return defer(loadShelfData(patientOrderId));
}

export const Component = () => {
	const handleError = useHandleError();
	const matches = useMatches();
	const patientOrderId = useMemo(() => {
		const id = matches[matches.length - 1].params.patientOrderId;
		if (!id) {
			throw new Error('Unknown patient order');
		}

		return id;
	}, [matches]);

	const pollingFn = useCallback(() => {
		return loadShelfData(patientOrderId, true);
	}, [patientOrderId]);

	const { data: shelfData } = usePolledLoaderData({
		useLoaderHook: useLoaderData as () => MhicPatientOrderShelfLoaderData,
		immediateUpdate: true,
		pollingFn,
	});
	const [tabKey, setTabKey] = useState(AnalyticsNativeEventMhicOrderDetailSectionId.ORDER_DETAILS);
	const [patientOrderResponse, setPatientOrderResponse] = useState<PatientOrderResponse | null>(null);

	useEffect(() => {
		const fetchPatientOrder = async () => {
			try {
				const response = await shelfData?.patientOrderPromise;
				setPatientOrderResponse(response);

				analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ORDER_DETAIL, {
					patientOrderId: response.patientOrder.patientOrderId,
					sectionId: AnalyticsNativeEventMhicOrderDetailSectionId.ORDER_DETAILS,
				});
			} catch (error) {
				handleError(error);
			}
		};

		fetchPatientOrder();
	}, [handleError, shelfData?.patientOrderPromise]);

	useEffect(() => {
		return () => {
			shelfData?.patientOrderAbort();
		};
	}, [shelfData]);

	return (
		<Suspense fallback={<Loader />}>
			<Await resolve={!!patientOrderResponse || shelfData?.patientOrderPromise}>
				<Tab.Container
					id="shelf-tabs"
					defaultActiveKey={AnalyticsNativeEventMhicOrderDetailSectionId.ORDER_DETAILS}
					activeKey={tabKey}
					mountOnEnter
					unmountOnExit
				>
					<ShelfContent
						patientOrderResponse={patientOrderResponse}
						tabBar={
							<TabBar
								key="mhic-shelf-tabbar"
								hideBorder
								value={tabKey}
								tabs={[
									{
										value: AnalyticsNativeEventMhicOrderDetailSectionId.ORDER_DETAILS,
										title: 'Order Details',
									},
									{
										value: AnalyticsNativeEventMhicOrderDetailSectionId.CONTACT_HISTORY,
										title: 'Contact History',
									},
									{ value: AnalyticsNativeEventMhicOrderDetailSectionId.COMMENTS, title: 'Comments' },
								]}
								onTabClick={(value) => {
									setTabKey(value as AnalyticsNativeEventMhicOrderDetailSectionId);

									if (!patientOrderResponse) {
										return;
									}

									analyticsService.persistEvent(
										AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ORDER_DETAIL,
										{
											patientOrderId: patientOrderResponse?.patientOrder.patientOrderId,
											sectionId: value as AnalyticsNativeEventMhicOrderDetailSectionId,
										}
									);
								}}
							/>
						}
					/>
				</Tab.Container>
			</Await>
		</Suspense>
	);
};

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		padding: '28px 32px 0',
		position: 'relative',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	shelfCloseButton: {
		top: 20,
		right: 24,
	},

	tabContent: {
		flex: 1,
		overflow: 'hidden',
	},
	tabPane: {
		height: '100%',
		overflowY: 'auto',
	},
	commentsPane: {
		height: '100%',
	},
}));

const ShelfContent = ({
	tabBar,
	patientOrderResponse,
}: {
	tabBar: React.ReactNode;
	patientOrderResponse: PatientOrderResponse | null;
}) => {
	const classes = useStyles();
	const navigate = useNavigate();
	const location = useLocation();
	const { addFlag } = useFlags();

	if (!patientOrderResponse) {
		return null;
	}

	return (
		<>
			<div className={classes.header}>
				<MhicPatientOrderShelfActions patientOrder={patientOrderResponse.patientOrder} />

				<Button
					variant="light"
					className={classNames(classes.shelfCloseButton, 'p-2 border-0 position-absolute')}
					onClick={() => {
						navigate({
							pathname: '..',
							search: location.search,
						});
					}}
				>
					<CloseIcon width={20} height={20} className="d-block" />
				</Button>

				<div className="mb-2 d-flex align-items-center">
					<h4 className="mb-0 me-2">{patientOrderResponse.patientOrder.patientDisplayName}</h4>
					{patientOrderResponse.patientOrder.totalOutreachCount === 0 && (
						<Badge pill bg="outline-primary">
							New
						</Badge>
					)}
				</div>
				<div className="d-flex align-items-center">
					<p className="mb-0">
						MRN: <span className="fw-bold">{patientOrderResponse.patientOrder.patientMrn}</span>
					</p>
					<CopyToClipboard
						onCopy={() => {
							addFlag({
								variant: 'success',
								title: 'Copied!',
								description: 'The MRN was copied to your clipboard',
								actions: [],
							});
						}}
						text={patientOrderResponse.patientOrder.patientMrn ?? ''}
					>
						<Button variant="link" className="p-2">
							<SvgIcon kit="far" icon="copy" size={20} />
						</Button>
					</CopyToClipboard>
					<span className="text-n300 me-2">|</span>
					<p className="mb-0">
						Phone:{' '}
						<span className="fw-bold">
							{patientOrderResponse.patientOrder.patientPhoneNumberDescription ?? 'Unknown'}
						</span>
					</p>
					<span className="text-n300 mx-2">|</span>
					<p className="mb-0">
						MHIC:{' '}
						<span className="fw-bold">
							{patientOrderResponse.patientOrder.panelAccountDisplayName ?? 'Unassigned'}
						</span>
					</p>
				</div>
				<div>{tabBar}</div>
			</div>
			<Tab.Content className={classes.tabContent}>
				<Tab.Pane
					eventKey={AnalyticsNativeEventMhicOrderDetailSectionId.ORDER_DETAILS}
					className={classes.tabPane}
				>
					<MhicOrderDetails
						patientOrder={patientOrderResponse.patientOrder}
						pastPatientOrders={patientOrderResponse.associatedPatientOrders}
					/>
				</Tab.Pane>
				<Tab.Pane
					eventKey={AnalyticsNativeEventMhicOrderDetailSectionId.CONTACT_HISTORY}
					className={classes.tabPane}
				>
					<MhicContactHistory patientOrder={patientOrderResponse.patientOrder} />
				</Tab.Pane>
				<Tab.Pane
					eventKey={AnalyticsNativeEventMhicOrderDetailSectionId.COMMENTS}
					className={classes.commentsPane}
				>
					<MhicComments patientOrder={patientOrderResponse.patientOrder} />
				</Tab.Pane>
			</Tab.Content>
		</>
	);
};
