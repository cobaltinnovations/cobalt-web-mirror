import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as CalendarIcon } from '@/assets/icons/icon-calendar.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone-2.svg';
import { ReactComponent as EnvelopeIcon } from '@/assets/icons/envelope.svg';

const useStyles = createUseThemedStyles((theme) => ({
	overviewCard: {
		display: 'flex',
		borderRadius: 8,
		padding: '20px 16px',
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
	iconOuter: {
		width: 40,
		flexShrink: 0,
		marginRight: 16,
	},
	icon: {
		width: 40,
		height: 40,
		display: 'flex',
		borderRadius: '50%',
		alignItems: 'center',
		justifyContent: 'center',
	},
}));

const MhicOverview = () => {
	const classes = useStyles();

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
							<div className={classNames(classes.icon, 'bg-s50')}>
								<CalendarIcon className="text-success" width={24} height={24} />
							</div>
						</div>
						<div>
							<h4 className="mb-0">3</h4>
							<p className="mb-4">Assessments Scheduled</p>
							<hr className="mb-4" />
							<p className="mb-0">
								<Link to="/#" className="fw-normal">
									View Scheduled
								</Link>
							</p>
						</div>
					</div>
				</Col>
				<Col>
					<div className={classes.overviewCard}>
						<div className={classes.iconOuter}>
							<div className={classNames(classes.icon, 'bg-w50')}>
								<PhoneIcon className="text-warning" width={24} height={24} />
							</div>
						</div>
						<div>
							<h4 className="mb-0">3</h4>
							<p className="mb-4">Due for Outreach</p>
							<hr className="mb-4" />
							<p className="mb-0">
								<Link to="/#" className="fw-normal">
									View Outreach
								</Link>
							</p>
						</div>
					</div>
				</Col>
				<Col>
					<div className={classes.overviewCard}>
						<div className={classes.iconOuter}>
							<div className={classNames(classes.icon, 'bg-p50')}>
								<EnvelopeIcon className="text-primary" width={24} height={24} />
							</div>
						</div>
						<div>
							<h4 className="mb-0">2</h4>
							<p className="mb-4">Need Resources</p>
							<hr className="mb-4" />
							<p className="mb-0">
								<Link to="/#" className="fw-normal">
									View Resources
								</Link>
							</p>
						</div>
					</div>
				</Col>
			</Row>
			<Row>
				<Col>
					<h3 className="mb-6">
						Follow Up <span className="text-gray">(6)</span>
					</h3>
					<Table isLoading={false}>
						<TableHead>
							<TableRow>
								<TableCell header width={280} sticky>
									Patient
								</TableCell>
								<TableCell header>Referral Date</TableCell>
								<TableCell header className="text-right">
									Outreach #
								</TableCell>
								<TableCell header>Last Outreach</TableCell>
								<TableCell header className="text-right">
									Episode
								</TableCell>
								<TableCell />
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1 day</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1 day</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1 day</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1 day</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">4 days</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Col>
			</Row>
		</Container>
	);
};

export default MhicOverview;
