import React, { useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ROW_TYPE_ID } from '@/lib/models';
import {
	HERO_SECTION_ID,
	PageSectionShelfPage,
	RowSelectionForm,
	RowSettingsOneColumn,
	RowSettingsResources,
	RowSettingsThreeColumns,
	RowSettingsTwoColumns,
	SectionHeroSettingsForm,
	SectionSettingsForm,
} from '@/components/admin/pages';
import { createUseThemedStyles } from '@/jss/theme/create-use-themed-styles';
import usePageBuilderContext from '@/hooks/use-page-builder-context';

const PAGE_TRANSITION_DURATION_MS = 600;

const useStyles = createUseThemedStyles({
	'@global': {
		'.right-to-left-enter, .right-to-left-enter-active, .right-to-left-exit, .right-to-left-exit-active, .left-to-right-enter, .left-to-right-enter-active, .left-to-right-exit, .left-to-right-exit-active':
			{
				top: 0,
				left: 0,
				right: 0,
				position: 'absolute',
			},
		'.right-to-left-enter': {
			opacity: 0,
			transform: 'translateX(100%)',
		},
		'.right-to-left-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.right-to-left-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.right-to-left-exit-active': {
			opacity: 0,
			transform: 'translateX(-100%)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.left-to-right-enter ': {
			opacity: 0,
			transform: 'translateX(-100%)',
		},
		'.left-to-right-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.left-to-right-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.left-to-right-exit-active': {
			opacity: 0,
			transform: 'translateX(100%)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
	},
});

interface SectionShelfProps {
	onEditButtonClick(): void;
	onDeleteButtonClick(): void;
}

enum PAGE_STATES {
	SECTION_SETTINGS = 'SECTION_SETTINGS',
	ADD_ROW = 'ADD_ROW',
	RESOURCES_ROW_SETTINGS = 'RESOURCES_ROW_SETTINGS',
	GROUP_SESSIONS_ROW_SETTINGS = 'GROUP_SESSIONS_ROW_SETTINGS',
	TAG_GROUP_ROW_SETTINGS = 'TAG_GROUP_ROW_SETTINGS',
	ONE_COLUMN_ROW_SETTINGS = 'ONE_COLUMN_ROW_SETTINGS',
	TWO_COLUMN_ROW_SETTINGS = 'TWO_COLUMN_ROW_SETTINGS',
	THREE_COLUMN_ROW_SETTINGS = 'THREE_COLUMN_ROW_SETTINGS',
}

export const PageSectionShelf = ({ onEditButtonClick, onDeleteButtonClick }: SectionShelfProps) => {
	useStyles();
	const [pageState, setPageState] = useState(PAGE_STATES.SECTION_SETTINGS);
	const [isNext, setIsNext] = useState(true);
	const { setCurrentPageSectionId, currentPageSection, setCurrentPageRowId } = usePageBuilderContext();

	useEffect(() => {
		setIsNext(false);
		setPageState(PAGE_STATES.SECTION_SETTINGS);
	}, [currentPageSection?.pageSectionId]);

	return (
		<TransitionGroup
			component={null}
			childFactory={(child) =>
				React.cloneElement(child, {
					classNames: isNext ? 'right-to-left' : 'left-to-right',
					timeout: PAGE_TRANSITION_DURATION_MS,
				})
			}
		>
			<CSSTransition key={pageState} timeout={PAGE_TRANSITION_DURATION_MS}>
				<>
					{pageState === PAGE_STATES.SECTION_SETTINGS && (
						<PageSectionShelfPage
							showEditButton={currentPageSection?.pageSectionId !== HERO_SECTION_ID}
							onEditButtonClick={onEditButtonClick}
							showDeleteButton={currentPageSection?.pageSectionId !== HERO_SECTION_ID}
							onDeleteButtonClick={onDeleteButtonClick}
							showCloseButton
							onCloseButtonButtonClick={() => {
								setCurrentPageSectionId('');
							}}
							title={currentPageSection?.name ?? ''}
							bodyClassName={currentPageSection?.pageSectionId !== HERO_SECTION_ID ? 'pt-0' : ''}
						>
							{currentPageSection?.pageSectionId === HERO_SECTION_ID ? (
								<SectionHeroSettingsForm />
							) : (
								<SectionSettingsForm
									onAddRowButtonClick={() => {
										setIsNext(true);
										setPageState(PAGE_STATES.ADD_ROW);
									}}
									onRowButtonClick={(pageRow) => {
										setCurrentPageRowId(pageRow.pageRowId);
										setIsNext(true);
										if (pageRow.rowTypeId === ROW_TYPE_ID.RESOURCES) {
											setPageState(PAGE_STATES.RESOURCES_ROW_SETTINGS);
										}
										if (pageRow.rowTypeId === ROW_TYPE_ID.GROUP_SESSIONS) {
											setPageState(PAGE_STATES.GROUP_SESSIONS_ROW_SETTINGS);
										}
										if (pageRow.rowTypeId === ROW_TYPE_ID.TAG_GROUP) {
											setPageState(PAGE_STATES.TAG_GROUP_ROW_SETTINGS);
										}
										if (pageRow.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_IMAGE) {
											setPageState(PAGE_STATES.ONE_COLUMN_ROW_SETTINGS);
										}
										if (pageRow.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_IMAGE) {
											setPageState(PAGE_STATES.TWO_COLUMN_ROW_SETTINGS);
										}
										if (pageRow.rowTypeId === ROW_TYPE_ID.THREE_COLUMN_IMAGE) {
											setPageState(PAGE_STATES.THREE_COLUMN_ROW_SETTINGS);
										}
									}}
								/>
							)}
						</PageSectionShelfPage>
					)}

					{pageState === PAGE_STATES.ADD_ROW && (
						<PageSectionShelfPage
							showBackButton
							onBackButtonClick={() => {
								setIsNext(false);
								setPageState(PAGE_STATES.SECTION_SETTINGS);
							}}
							title="Select row type to add"
							bodyClassName="pt-0"
						>
							<RowSelectionForm
								onRowAdded={() => {
									setIsNext(false);
									setPageState(PAGE_STATES.SECTION_SETTINGS);
								}}
							/>
						</PageSectionShelfPage>
					)}

					{pageState === PAGE_STATES.RESOURCES_ROW_SETTINGS && (
						<PageSectionShelfPage
							showBackButton
							onBackButtonClick={() => {
								setCurrentPageRowId('');
								setIsNext(false);
								setPageState(PAGE_STATES.SECTION_SETTINGS);
							}}
							showDeleteButton
							title="Resources (N)"
						>
							<RowSettingsResources />
						</PageSectionShelfPage>
					)}

					{pageState === PAGE_STATES.ONE_COLUMN_ROW_SETTINGS && (
						<PageSectionShelfPage
							showBackButton
							onBackButtonClick={() => {
								setCurrentPageRowId('');
								setIsNext(false);
								setPageState(PAGE_STATES.SECTION_SETTINGS);
							}}
							showDeleteButton
							title="Custom Row (1 Item)"
							bodyClassName="pt-0"
						>
							<RowSettingsOneColumn />
						</PageSectionShelfPage>
					)}

					{pageState === PAGE_STATES.TWO_COLUMN_ROW_SETTINGS && (
						<PageSectionShelfPage
							showBackButton
							onBackButtonClick={() => {
								setCurrentPageRowId('');
								setIsNext(false);
								setPageState(PAGE_STATES.SECTION_SETTINGS);
							}}
							showDeleteButton
							title="Custom Row (2 Items)"
							bodyClassName="pt-0"
						>
							<RowSettingsTwoColumns />
						</PageSectionShelfPage>
					)}

					{pageState === PAGE_STATES.THREE_COLUMN_ROW_SETTINGS && (
						<PageSectionShelfPage
							showBackButton
							onBackButtonClick={() => {
								setCurrentPageRowId('');
								setIsNext(false);
								setPageState(PAGE_STATES.SECTION_SETTINGS);
							}}
							showDeleteButton
							title="Custom Row (3 Items)"
							bodyClassName="pt-0"
						>
							<RowSettingsThreeColumns />
						</PageSectionShelfPage>
					)}
				</>
			</CSSTransition>
		</TransitionGroup>
	);
};
