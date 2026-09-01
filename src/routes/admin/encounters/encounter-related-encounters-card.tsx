import React from 'react';
import { Card } from 'react-bootstrap';
import { Link, useLocation, useParams } from 'react-router-dom';

import { createUseThemedStyles } from '@/jss/theme';
import { CareEncounterStatusId } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	item: {
		'&:not(:last-child)': {
			borderBottom: `1px solid ${theme.colors.border}`,
		},
	},
	link: {
		width: '100%',
		padding: '16px',
		display: 'flex',
		alignItems: 'center',
		color: theme.colors.n900,
		textDecoration: 'none',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		'&:hover, &:focus, &:active': {
			color: theme.colors.n900,
			textDecoration: 'none',
			backgroundColor: theme.colors.n75,
		},
	},
}));

interface CareEncounterHistoryItem {
	careEncounterId: string;
	careEncounterStatusId: CareEncounterStatusId;
	careEncounterStatusDisplayLabel: string;
	createdDateDescription: string;
	closedAtDescription?: string;
}

interface Props {
	careEncounters: CareEncounterHistoryItem[];
}

export const EncounterRelatedEncountersCard = ({ careEncounters }: Props) => {
	const classes = useStyles();
	const location = useLocation();
	const { encounterId } = useParams<{ encounterId: string }>();

	if (careEncounters.length === 0) {
		return null;
	}

	return (
		<Card bsPrefix="ic-card">
			<Card.Body className="p-0 overflow-hidden">
				<ul className="list-unstyled mb-0">
					{careEncounters.map((careEncounter) => {
						const dateDescription = careEncounter.closedAtDescription
							? `${careEncounter.createdDateDescription} - ${careEncounter.closedAtDescription}`
							: careEncounter.createdDateDescription;

						return (
							<li key={careEncounter.careEncounterId} className={classes.item}>
								<Link
									className={classes.link}
									to={{
										pathname: `/admin/encounters/${careEncounter.careEncounterId}`,
										search: location.search,
									}}
									aria-label={`View encounter from ${dateDescription}`}
									aria-current={careEncounter.careEncounterId === encounterId ? 'page' : undefined}
								>
									<span className="fw-semibold">{dateDescription}</span>
									<span
										className={`ms-4 ${
											careEncounter.careEncounterStatusId === CareEncounterStatusId.OPEN
												? 'text-success'
												: 'text-gray'
										}`}
									>
										{careEncounter.careEncounterStatusDisplayLabel}
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</Card.Body>
		</Card>
	);
};
