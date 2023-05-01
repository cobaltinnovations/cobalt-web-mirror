import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row, Tab } from 'react-bootstrap';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import useFetchPatientOrders from '@/pages/ic/hooks/use-fetch-patient-orders';
import TabBar from '@/components/tab-bar';
import { MhicInlineAlert, MhicPageHeader, MhicPatientOrderTable } from '@/components/integrated-care/mhic';

import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone-2.svg';
import { ReactComponent as TherapyIcon } from '@/assets/icons/icon-therapy.svg';

const useStyles = createUseThemedStyles((theme) => ({
	overviewCard: {
		padding: 16,
		display: 'flex',
		borderRadius: 8,
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
	iconOuter: {
		width: 48,
		flexShrink: 0,
		marginRight: 16,
	},
	icon: {
		width: 48,
		height: 48,
		display: 'flex',
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
}));

enum TAB_KEYS {
	NEW_PATIENTS = 'NEW_PATIENTS',
	VOICEMAILS = 'VOICEMAILS',
	FOLLOW_UPS = 'FOLLOW_UPS',
	ASSESSMENTS = 'ASSESSMENTS',
	RESOURCES = 'RESOURCES',
}

const MhicOverview = () => {
	const classes = useStyles();
	const { account } = useAccount();
	const navigate = useNavigate();

	const [tabKey, setTabKey] = useState(TAB_KEYS.NEW_PATIENTS);
	const { isLoadingOrders, patientOrders = [], totalCount, totalCountDescription } = useFetchPatientOrders();

	return (
		<Container fluid className="py-8 overflow-visible">
			<Row className="mb-8">
				<Col>
					<MhicPageHeader title={`Welcome back, ${account?.firstName ?? 'MHIC'}`} />
				</Col>
			</Row>
			<Row className="mb-9">
				<Col>
					<MhicInlineAlert
						variant="danger"
						title="2 orders require safety planning"
						description="Please review these orders first"
						action={{
							title: 'View Safety Planning',
							onClick: () => {
								navigate('/ic/mhic/my-patients?patientOrderStatusId=SAFETY_PLANNING');
							},
						}}
					/>
				</Col>
			</Row>
			<Row className="mb-10">
				<Col>
					<div className={classes.overviewCard}>
						<div className={classes.iconOuter}>
							<div className={classNames(classes.icon, 'bg-a50')}>
								<ClipboardIcon className="text-secondary" width={24} height={24} />
							</div>
						</div>
						<div>
							<p className="mb-0">New Patients</p>
							<h4 className="mb-0">3</h4>
						</div>
					</div>
				</Col>
				<Col>
					<div className={classes.overviewCard}>
						<div className={classes.iconOuter}>
							<div className={classNames(classes.icon, 'bg-w50')}>
								<TherapyIcon className="text-warning" width={24} height={24} />
							</div>
						</div>
						<div>
							<p className="mb-0">Voicemail Tasks</p>
							<h4 className="mb-0">3</h4>
						</div>
					</div>
				</Col>
				<Col>
					<div className={classes.overviewCard}>
						<div className={classes.iconOuter}>
							<div className={classNames(classes.icon, 'bg-p50')}>
								<PhoneIcon className="text-primary" width={24} height={24} />
							</div>
						</div>
						<div>
							<p className="mb-0">Follow Ups</p>
							<h4 className="mb-0">2</h4>
						</div>
					</div>
				</Col>
				<Col>
					<div className={classes.overviewCard}>
						<div className={classes.iconOuter}>
							<div className={classNames(classes.icon, 'bg-s50')}>
								<EventIcon className="text-success" width={24} height={24} />
							</div>
						</div>
						<div>
							<p className="mb-0">Scheduled Assessments</p>
							<h4 className="mb-0">2</h4>
						</div>
					</div>
				</Col>
			</Row>
			<Row className="mb-5">
				<Col>
					<h4 className="mb-2">My Prioirities</h4>
					<Tab.Container id="shelf-tabs" defaultActiveKey={TAB_KEYS.NEW_PATIENTS} activeKey={tabKey}>
						<TabBar
							className="mb-5"
							value={tabKey}
							tabs={[
								{
									value: TAB_KEYS.NEW_PATIENTS,
									title: 'New Patients (8)',
								},
								{
									value: TAB_KEYS.VOICEMAILS,
									title: 'Voicemails (4)',
								},
								{
									value: TAB_KEYS.FOLLOW_UPS,
									title: 'Follow Up (3)',
								},
								{
									value: TAB_KEYS.ASSESSMENTS,
									title: 'Assessments (3)',
								},
								{
									value: TAB_KEYS.RESOURCES,
									title: 'Resources (4)',
								},
							]}
							onTabClick={(value) => {
								setTabKey(value as TAB_KEYS);
							}}
						/>
						<Tab.Content>
							<Tab.Pane eventKey={TAB_KEYS.NEW_PATIENTS}>
								<MhicPatientOrderTable
									isLoading={isLoadingOrders}
									patientOrders={patientOrders}
									selectAll={false}
									totalPatientOrdersCount={totalCount}
									totalPatientOrdersDescription={totalCountDescription}
									pageNumber={0}
									pageSize={15}
									onPaginationClick={() => {
										return;
									}}
									columnConfig={{
										flag: true,
										patient: true,
										practice: true,
										referralReason: true,
										outreachNumber: true,
										episode: true,
									}}
								/>
							</Tab.Pane>
							<Tab.Pane eventKey={TAB_KEYS.VOICEMAILS}>
								<MhicPatientOrderTable
									isLoading={isLoadingOrders}
									patientOrders={patientOrders}
									selectAll={false}
									totalPatientOrdersCount={totalCount}
									totalPatientOrdersDescription={totalCountDescription}
									pageNumber={0}
									pageSize={15}
									onPaginationClick={() => {
										return;
									}}
									columnConfig={{
										flag: true,
										patient: true,
										referralDate: true,
										outreachNumber: true,
										lastOutreach: true,
										episode: true,
									}}
								/>
							</Tab.Pane>
							<Tab.Pane eventKey={TAB_KEYS.FOLLOW_UPS}>
								<MhicPatientOrderTable
									isLoading={isLoadingOrders}
									patientOrders={patientOrders}
									selectAll={false}
									totalPatientOrdersCount={totalCount}
									totalPatientOrdersDescription={totalCountDescription}
									pageNumber={0}
									pageSize={15}
									onPaginationClick={() => {
										return;
									}}
									columnConfig={{
										flag: true,
										patient: true,
										referralDate: true,
										outreachNumber: true,
										lastOutreach: true,
										episode: true,
									}}
								/>
							</Tab.Pane>
							<Tab.Pane eventKey={TAB_KEYS.ASSESSMENTS}>
								<MhicPatientOrderTable
									isLoading={isLoadingOrders}
									patientOrders={patientOrders}
									selectAll={false}
									totalPatientOrdersCount={totalCount}
									totalPatientOrdersDescription={totalCountDescription}
									pageNumber={0}
									pageSize={15}
									onPaginationClick={() => {
										return;
									}}
									columnConfig={{
										flag: true,
										patient: true,
										assessmentScheduled: true,
										episode: true,
									}}
								/>
							</Tab.Pane>
							<Tab.Pane eventKey={TAB_KEYS.RESOURCES}>
								<MhicPatientOrderTable
									isLoading={isLoadingOrders}
									patientOrders={patientOrders}
									selectAll={false}
									totalPatientOrdersCount={totalCount}
									totalPatientOrdersDescription={totalCountDescription}
									pageNumber={0}
									pageSize={15}
									onPaginationClick={() => {
										return;
									}}
									columnConfig={{
										flag: true,
										patient: true,
										assessmentCompleted: true,
										completedBy: true,
										triage: true,
										episode: true,
									}}
								/>
							</Tab.Pane>
						</Tab.Content>
					</Tab.Container>
				</Col>
			</Row>
		</Container>
	);
};

export default MhicOverview;
