import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { PageSectionModel } from '@/lib/models';
import { HERO_SECTION_ID } from '@/components/admin/pages/section-hero-settings-form';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	sectionButton: {
		padding: 24,
		cursor: 'pointer',
		borderBottom: `1px solid ${theme.colors.n100}`,
		'&.active': {
			backgroundColor: theme.colors.n75,
		},
	},
}));

interface LayoutTabProps {
	sections: PageSectionModel[];
	currentSection?: PageSectionModel;
	onSectionClick(section: PageSectionModel): void;
	onAddSection(): void;
}

export const LayoutTab = ({ sections, currentSection, onSectionClick, onAddSection }: LayoutTabProps) => {
	const classes = useStyles();

	const handleHeroSectionClick = () => {
		const heroSection = {
			pageSectionId: HERO_SECTION_ID,
			pageId: 'xxxx-xxxx-xxxx-xxxx',
			name: 'Hero',
			headline: '',
			description: '',
			backgroundColorId: '',
			displayOrder: 0,
		};

		onSectionClick(heroSection);
	};

	return (
		<>
			<div
				className={classNames(classes.sectionButton, {
					active: currentSection?.pageSectionId === HERO_SECTION_ID,
				})}
				onClick={handleHeroSectionClick}
			>
				Hero
			</div>
			{sections.map((section) => (
				<div
					key={section.pageSectionId}
					className={classNames(classes.sectionButton, {
						active: currentSection?.pageSectionId === section.pageSectionId,
					})}
					onClick={() => onSectionClick(section)}
				>
					{section.name}
				</div>
			))}
			<div className="p-6 text-right">
				<Button variant="outline-primary" onClick={onAddSection}>
					Add Section
				</Button>
			</div>
		</>
	);
};
