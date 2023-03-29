import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import useFetchPatientOrders from '@/pages/ic/hooks/use-fetch-patient-orders';
import { MhicPatientOrderTable } from '@/components/integrated-care/mhic';

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

const MhicOverview = () => {
	const classes = useStyles();
	const [searchParams, setSearchParams] = useSearchParams();
	const { isLoadingOrders, patientOrders = [], totalCount, totalCountDescription } = useFetchPatientOrders();
	const pageNumber = searchParams.get('pageNumber') ?? '0';

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	return (
		<Container fluid className="py-11 overflow-visible">
			<Row className="mb-8">
				<Col>
					<h3>Welcome back, Ava</h3>
				</Col>
			</Row>
			<Row className="mb-14">
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
			<Row>
				<Col>
					<h4 className="mb-6">My Prioirities</h4>
					<MhicPatientOrderTable
						isLoading={isLoadingOrders}
						patientOrders={patientOrders}
						selectAll={false}
						totalPatientOrdersCount={totalCount}
						totalPatientOrdersDescription={totalCountDescription}
						pageNumber={parseInt(pageNumber, 10)}
						pageSize={15}
						onPaginationClick={handlePaginationClick}
						columnConfig={{
							flag: true,
							patient: true,
							referralDate: true,
							outreachNumber: true,
							lastOutreach: true,
							episode: true,
						}}
					/>
				</Col>
			</Row>
		</Container>
	);
};

export default MhicOverview;
