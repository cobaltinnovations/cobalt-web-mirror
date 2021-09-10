import React, { FC } from 'react';
import useHeaderTitle from '@/hooks/use-header-title';
import { Container } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { Disposition, formatDisposition } from '@/pages/pic/utils';
import { useGetDispositions, useGetAppointments } from '@/hooks/pic-hooks';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import Loader from '@/components/loader';
import { DashboardIndex } from '@/pages/pic/mhic-dashboard/dashboard-index';
import { DashboardDetail } from '@/pages/pic/mhic-dashboard/dashboard-detail';
import { MHICAssessmentWrapper } from '@/pages/pic/mhic-dashboard/mhic-assessment-wrapper';

const useStyles = createUseStyles({
	tableWrapper: {
		maxWidth: '1400px!important',
	},
});

export const DashboardWrapper: FC = () => {
	useHeaderTitle(null);
	const { path } = useRouteMatch();
	const classes = useStyles();

	const { data: rawDispositions, isLoading: dispositionsLoading, isError: dispositionsError } = useGetDispositions();

	const patientIds = rawDispositions ? rawDispositions.map((d: Disposition) => d.patient.cobaltAccountId) : [];

	const appointments = useGetAppointments(patientIds);

	if (dispositionsLoading) {
		return (
			<Container className={classes.tableWrapper}>
				<Loader />
			</Container>
		);
	}

	if (dispositionsError) {
		return (
			<Container className={classes.tableWrapper}>
				<p>Error Loading patients</p>
			</Container>
		);
	}

	const dispositions = rawDispositions.map((d: Disposition, i: number) => {
		const formatted = formatDisposition(d);
		const dispAppointments = appointments[i].isLoading ? [] : appointments[i].data;
		return {
			...formatted,
			appointments: dispAppointments,
		};
	});

	return (
		<Container className={classes.tableWrapper}>
			<Switch>
				<Route exact path={path}>
					<DashboardIndex dispositions={dispositions} />
				</Route>
				<Route exact path={`${path}/disposition/:id`}>
					<DashboardDetail dispositions={dispositions} />
				</Route>
				<Route path={`${path}/disposition/:id/assessment`}>
					<MHICAssessmentWrapper />
				</Route>
			</Switch>
		</Container>
	);
};
