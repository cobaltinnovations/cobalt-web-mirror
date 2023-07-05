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

import { PatientOrderResponse, integratedCareService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';

import TabBar from '@/components/tab-bar';
import { MhicComments, MhicContactHistory, MhicOrderDetails } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-content-copy.svg';

import { Await } from 'react-router-dom';

import Loader from '@/components/loader';
import { MhicPatientOrderShelfActions } from '@/components/integrated-care/mhic/mhic-patient-order-shelf-actions';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';

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
}

function loadShelfData(patientOrderId: string, isPolling = false) {
	const request = integratedCareService.getPatientOrder(patientOrderId);
	const patientOrderPromise = request.fetch({ isPolling });

	return {
		getResponseChecksum: () => patientOrderPromise.then(() => request.cobaltResponseChecksum),
		patientOrderPromise,
	};
}

export async function loader({ params }: LoaderFunctionArgs) {
	const patientOrderId = params.patientOrderId;

	if (!patientOrderId) {
		throw new Error('Unknown Patient Order');
	}

	return defer(loadShelfData(patientOrderId));
}

enum TAB_KEYS {
	ORDER_DETAILS = 'ORDER_DETAILS',
	CONTACT_HISOTRY = 'CONTACT_HISOTRY',
	COMMENTS = 'COMMENTS',
}

export const Component = () => {
	const matches = useMatches();
	const patientOrderId = useMemo(() => {
		const id = matches[matches.length - 1].params.patientOrderId;
		if (!id) {
			throw new Error('Unknonw patient order');
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
	const [tabKey, setTabKey] = useState(TAB_KEYS.ORDER_DETAILS);
	const [patientOrderResponse, setPatientORderResponse] = useState<PatientOrderResponse | null>(null);

	useEffect(() => {
		shelfData?.patientOrderPromise.then((response) => setPatientORderResponse(response));
	}, [shelfData?.patientOrderPromise]);

	return (
		<Suspense fallback={<Loader />}>
			<Await resolve={!!patientOrderResponse || shelfData?.patientOrderPromise}>
				<Tab.Container
					id="shelf-tabs"
					defaultActiveKey={TAB_KEYS.ORDER_DETAILS}
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
									{ value: TAB_KEYS.ORDER_DETAILS, title: 'Order Details' },
									{ value: TAB_KEYS.CONTACT_HISOTRY, title: 'Contact History' },
									{ value: TAB_KEYS.COMMENTS, title: 'Comments' },
								]}
								onTabClick={(value) => {
									setTabKey(value as TAB_KEYS);
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
		borderBottom: `1px solid ${theme.colors.n100}`,
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
					className={classNames(classes.shelfCloseButton, 'p-2 position-absolute')}
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
							<CopyIcon width={20} height={20} />
						</Button>
					</CopyToClipboard>
					<span className="text-n300 me-2">|</span>
					<p className="mb-0">
						Phone:{' '}
						<span className="fw-bold">
							{patientOrderResponse.patientOrder.patientPhoneNumberDescription}
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
				<Tab.Pane eventKey={TAB_KEYS.ORDER_DETAILS} className={classes.tabPane}>
					<MhicOrderDetails
						patientOrder={patientOrderResponse.patientOrder}
						pastPatientOrders={patientOrderResponse.associatedPatientOrders}
					/>
				</Tab.Pane>
				<Tab.Pane eventKey={TAB_KEYS.CONTACT_HISOTRY} className={classes.tabPane}>
					<MhicContactHistory patientOrder={patientOrderResponse.patientOrder} />
				</Tab.Pane>
				<Tab.Pane eventKey={TAB_KEYS.COMMENTS} className={classes.commentsPane}>
					<MhicComments patientOrder={patientOrderResponse.patientOrder} />
				</Tab.Pane>
			</Tab.Content>
		</>
	);
};
