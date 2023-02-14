import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import classNames from 'classnames';

import {
	MhicAccountHeader,
	MhicFilterDropdown,
	MhicNavigation,
	MhicSortDropdown,
} from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';

import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';

const useStyles = createUseThemedStyles((theme) => ({
	row: {
		padding: '0 64px',
	},
}));

const MhicPanel = () => {
	const classes = useStyles();

	return (
		<>
			<MhicAccountHeader />
			<MhicNavigation />
			<div className={classNames(classes.row, 'py-6 d-flex align-items-center justify-content-between')}>
				<div className="d-flex">
					<MhicFilterDropdown />
					<MhicSortDropdown />
				</div>
				<Button
					variant="light"
					onClick={() => {
						window.alert('[TODO]: Open customization modal');
					}}
				>
					Customize View
				</Button>
			</div>
			<div className={classNames(classes.row)}>
				<Table>
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
						<TableRow>
							<TableCell width={280} sticky className="py-2">
								<span className="d-block fw-bold">Lastname, Firstname</span>
								<span className="d-block text-gray">1A2B3C4D5E</span>
							</TableCell>
							<TableCell>
								<span className="fw-bold">Jan 30, 2023</span>
							</TableCell>
							<TableCell>
								<span className="fw-bold">[Practice Name]</span>
							</TableCell>
							<TableCell>
								<span className="fw-bold">[Reason]</span>
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
								<span className="fw-bold">1 Day</span>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell width={280} sticky className="py-2">
								<span className="d-block">Lastname, Firstname</span>
								<span className="d-block text-gray">1A2B3C4D5E</span>
							</TableCell>
							<TableCell>Jan 30, 2023</TableCell>
							<TableCell>[Practice Name]</TableCell>
							<TableCell>[Reason]</TableCell>
							<TableCell>
								<div>
									<Badge pill bg="outline-dark">
										INSURANCE
									</Badge>
								</div>
							</TableCell>
							<TableCell>0</TableCell>
							<TableCell>&#8212;</TableCell>
							<TableCell>1 Day</TableCell>
						</TableRow>
						<TableRow>
							<TableCell width={280} sticky className="py-2">
								<span className="d-block">Lastname, Firstname</span>
								<span className="d-block text-gray">1A2B3C4D5E</span>
							</TableCell>
							<TableCell>Jan 30, 2023</TableCell>
							<TableCell>[Practice Name]</TableCell>
							<TableCell>[Reason]</TableCell>
							<TableCell>
								<div>
									<Badge pill bg="outline-success">
										SCHEDULED
									</Badge>
								</div>
							</TableCell>
							<TableCell>0</TableCell>
							<TableCell>&#8212;</TableCell>
							<TableCell>1 Day</TableCell>
						</TableRow>
						<TableRow>
							<TableCell width={280} sticky className="py-2">
								<span className="d-block">Lastname, Firstname</span>
								<span className="d-block text-gray">1A2B3C4D5E</span>
							</TableCell>
							<TableCell>Jan 30, 2023</TableCell>
							<TableCell>[Practice Name]</TableCell>
							<TableCell>[Reason]</TableCell>
							<TableCell>
								<div>
									<Badge pill bg="outline-warning">
										FINAL
									</Badge>
								</div>
							</TableCell>
							<TableCell>0</TableCell>
							<TableCell>&#8212;</TableCell>
							<TableCell>1 Day</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		</>
	);
};

export default MhicPanel;
