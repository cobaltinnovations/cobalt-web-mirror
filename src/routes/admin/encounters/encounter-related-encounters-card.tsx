import React from 'react';
import { Card } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import { CareEncounterListModel, CareEncounterStatusId } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	item: {
		padding: '20px 16px',
		display: 'flex',
		alignItems: 'center',
		color: theme.colors.n900,
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		'&:not(:last-child)': {
			borderBottom: `1px solid ${theme.colors.border}`,
		},
	},
}));

interface Props {
	careEncounters: CareEncounterListModel[];
}

export const EncounterRelatedEncountersCard = ({ careEncounters }: Props) => {
	const classes = useStyles();

	if (careEncounters.length === 0) {
		return null;
	}

	return (
		<Card bsPrefix="ic-card">
			<Card.Body className="p-0 overflow-hidden">
				<ul className="list-unstyled mb-0">
					{careEncounters.map((careEncounter) => (
						<li key={careEncounter.careEncounterId} className={classes.item}>
							<span className="fw-bold">
								{careEncounter.closedAtDescription
									? `${careEncounter.createdDateDescription} - ${careEncounter.closedAtDescription}`
									: careEncounter.createdDateDescription}
							</span>
							<span
								className={`ms-4 ${
									careEncounter.careEncounterStatusId === CareEncounterStatusId.OPEN
										? 'text-info'
										: 'text-gray'
								}`}
							>
								{careEncounter.careEncounterStatusDisplayLabel}
							</span>
						</li>
					))}
				</ul>
			</Card.Body>
		</Card>
	);
};
