import React, { useMemo } from 'react';

import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import { ActivePatientOrderCountModel, PatientOrderStatusId } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	navigation: {
		display: 'flex',
		padding: '0 64px',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
		'& button': {
			border: 0,
			fontWeight: 500,
			appearance: 'none',
			padding: '18px 10px',
			position: 'relative',
			alignItems: 'center',
			display: 'inline-flex',
			textDecoration: 'none',
			color: theme.colors.n500,
			backgroundColor: 'transparent',
			'&:after': {
				left: 10,
				right: 10,
				bottom: 0,
				height: 2,
				content: '""',
				display: 'none',
				position: 'absolute',
				backgroundColor: theme.colors.p700,
			},
			'&:hover': {
				color: theme.colors.p700,
			},
			'&:first-of-type': {
				paddingLeft: 0,
				'&:after': {
					left: 0,
				},
			},
			'&:last-of-type': {
				paddingRight: 0,
				'&:after': {
					right: 0,
				},
			},
			'&.first-link-of-section': {
				paddingLeft: 20,
				'&:after': {
					left: 20,
				},
			},
			'&.last-link-of-section': {
				paddingRight: 20,
				borderRight: `1px solid ${theme.colors.n100}`,
				'&:after': {
					right: 20,
				},
			},
			'&.active': {
				color: theme.colors.p700,
				'&:after': {
					display: 'block',
				},
			},
		},
	},
	countBubble: {
		marginLeft: 4,
		padding: '0 8px',
		borderRadius: 32,
		...theme.fonts.default,
		color: theme.colors.p500,
		...theme.fonts.headingBold,
		backgroundColor: theme.colors.p50,
	},
}));

interface Props {
	patientOrderPanelTypeId: string;
	orderCountsByStatusId?: Record<PatientOrderStatusId, ActivePatientOrderCountModel>;
	onClick(patientOrderPanelTypeId: string): void;
}

export const MhicNavigation = ({ patientOrderPanelTypeId, orderCountsByStatusId, onClick }: Props) => {
	const classes = useStyles();

	const linkSections = useMemo(
		() => [
			{
				links: [
					{
						patientOrderPanelTypeId: 'NEED_ASSESSMENT',
						title: 'Need Assessment',
						count: '0',
					},
				],
			},
			{
				links: [
					{
						patientOrderPanelTypeId: 'SAFETY_PLANNING',
						title: 'Safety Planning',
						count: '0',
					},
					{
						patientOrderPanelTypeId: 'SPECIALTY_CARE',
						title: 'Specialty Care',
						count: '0',
					},
					{
						patientOrderPanelTypeId: 'BHP',
						title: 'Behavioral Health Provider',
						count: '0',
					},
				],
			},
			{
				links: [
					{
						patientOrderPanelTypeId: 'CLOSED',
						title: 'Closed',
						count: orderCountsByStatusId?.[PatientOrderStatusId.CLOSED].countDescription ?? '0',
					},
				],
			},
		],
		[orderCountsByStatusId]
	);

	return (
		<nav className={classes.navigation}>
			{linkSections.map((section, sectionIndex) => {
				const isFirstSection = sectionIndex === 0;
				const isLastSection = sectionIndex === linkSections.length - 1;

				return (
					<React.Fragment key={sectionIndex}>
						{section.links.map((link, linkIndex) => {
							const isFirstLink = linkIndex === 0;
							const isLastLink = linkIndex === section.links.length - 1;

							return (
								<button
									key={linkIndex}
									onClick={() => {
										onClick(link.patientOrderPanelTypeId);
									}}
									className={classNames({
										'first-link-of-section': isFirstLink && !isFirstSection,
										'last-link-of-section': isLastLink && !isLastSection,
										active: patientOrderPanelTypeId === link.patientOrderPanelTypeId,
									})}
								>
									<span>{link.title}</span>
									{link.count && parseInt(link.count, 10) > 0 && (
										<span className={classes.countBubble}>{link.count}</span>
									)}
								</button>
							);
						})}
					</React.Fragment>
				);
			})}
		</nav>
	);
};
