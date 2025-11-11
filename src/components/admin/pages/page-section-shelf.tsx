import React, { useCallback, useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ROW_TYPE_ID } from '@/lib/models';
import {
	HERO_SECTION_ID,
	PageSectionShelfPage,
	RowSelectionForm,
	RowSettingsGroupSessions,
	RowSettingsMailingList,
	RowSettingsOneColumn,
	RowSettingsResources,
	RowSettingsTag,
	RowSettingsTagGroup,
	RowSettingsThreeColumns,
	RowSettingsTwoColumns,
	SectionHeroSettingsForm,
	SectionSettingsForm,
} from '@/components/admin/pages';
import { createUseThemedStyles } from '@/jss/theme/create-use-themed-styles';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import ConfirmDialog from '@/components/confirm-dialog';

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
}

export const PageSectionShelf = ({ onEditButtonClick, onDeleteButtonClick }: SectionShelfProps) => {
	useStyles();
	const handleError = useHandleError();

	const {
		setCurrentPageSectionId,
		currentPageSection,
		setCurrentPageRowId,
		currentPageRow,
		deletePageRow,
		setIsSaving,
	} = usePageBuilderContext();
	const [pageState, setPageState] = useState<PAGE_STATES | ROW_TYPE_ID>(PAGE_STATES.SECTION_SETTINGS);
	const [isNext, setIsNext] = useState(true);
	const [showRowDeleteModal, setShowRowDeleteModal] = useState(false);

	useEffect(() => {
		setIsNext(false);
		setPageState(PAGE_STATES.SECTION_SETTINGS);
	}, [currentPageSection?.pageSectionId]);

	const handleRowBack = useCallback(() => {
		setCurrentPageRowId('');
		setIsNext(false);
		setPageState(PAGE_STATES.SECTION_SETTINGS);
	}, [setCurrentPageRowId]);

	// Auto open row if one is set, typically from publish errors.
	useEffect(() => {
		if (!currentPageRow) {
			return;
		}

		setIsNext(true);
		setPageState(currentPageRow.rowTypeId);
	}, [currentPageRow]);

	const handleRowDelete = useCallback(async () => {
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			await pagesService.deletePageRow(currentPageRow.pageRowId).fetch();

			deletePageRow(currentPageRow.pageRowId);
			setShowRowDeleteModal(false);
			handleRowBack();
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [currentPageRow, deletePageRow, handleError, handleRowBack, setIsSaving]);

	return (
		<>
			<ConfirmDialog
				show={showRowDeleteModal}
				size="lg"
				titleText="Delete Row"
				bodyText="Are you sure you want to delete this row?"
				dismissText="Cancel"
				confirmText="Delete"
				destructive
				onHide={() => {
					setShowRowDeleteModal(false);
				}}
				onConfirm={handleRowDelete}
			/>

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
								{currentPageSection && (
									<>
										{currentPageSection.pageSectionId === HERO_SECTION_ID ? (
											<SectionHeroSettingsForm />
										) : (
											<SectionSettingsForm
												onAddRowButtonClick={() => {
													setCurrentPageRowId('');
													setIsNext(true);
													setPageState(PAGE_STATES.ADD_ROW);
												}}
												onRowButtonClick={(pageRow) => {
													setCurrentPageRowId(pageRow.pageRowId);
												}}
											/>
										)}
									</>
								)}
							</PageSectionShelfPage>
						)}

						{pageState === PAGE_STATES.ADD_ROW && (
							<PageSectionShelfPage
								showBackButton
								onBackButtonClick={handleRowBack}
								showCloseButton
								onCloseButtonButtonClick={() => {
									setCurrentPageSectionId('');
								}}
								title="Select row type to add"
								bodyClassName="pt-0"
							>
								<RowSelectionForm />
							</PageSectionShelfPage>
						)}

						{pageState === ROW_TYPE_ID.RESOURCES && (
							<RowSettingsResources
								onBackButtonClick={handleRowBack}
								onDeleteButtonClick={() => {
									setShowRowDeleteModal(true);
								}}
							/>
						)}

						{pageState === ROW_TYPE_ID.GROUP_SESSIONS && (
							<RowSettingsGroupSessions
								onBackButtonClick={handleRowBack}
								onDeleteButtonClick={() => {
									setShowRowDeleteModal(true);
								}}
							/>
						)}

						{pageState === ROW_TYPE_ID.TAG_GROUP && (
							<RowSettingsTagGroup
								onBackButtonClick={handleRowBack}
								onDeleteButtonClick={() => {
									setShowRowDeleteModal(true);
								}}
							/>
						)}

						{pageState === ROW_TYPE_ID.TAG && (
							<RowSettingsTag
								onBackButtonClick={handleRowBack}
								onDeleteButtonClick={() => {
									setShowRowDeleteModal(true);
								}}
							/>
						)}

						{pageState === ROW_TYPE_ID.ONE_COLUMN_IMAGE && (
							<PageSectionShelfPage
								showBackButton
								onBackButtonClick={handleRowBack}
								showDeleteButton
								onDeleteButtonClick={() => {
									setShowRowDeleteModal(true);
								}}
								showCloseButton
								onCloseButtonButtonClick={() => {
									setCurrentPageSectionId('');
									setCurrentPageRowId('');
								}}
								title="Custom Row (1 Item)"
								bodyClassName="pt-0"
							>
								<RowSettingsOneColumn />
							</PageSectionShelfPage>
						)}

						{pageState === ROW_TYPE_ID.TWO_COLUMN_IMAGE && (
							<PageSectionShelfPage
								showBackButton
								onBackButtonClick={handleRowBack}
								showDeleteButton
								onDeleteButtonClick={() => {
									setShowRowDeleteModal(true);
								}}
								showCloseButton
								onCloseButtonButtonClick={() => {
									setCurrentPageSectionId('');
									setCurrentPageRowId('');
								}}
								title="Custom Row (2 Items)"
								bodyClassName="pt-0"
							>
								<RowSettingsTwoColumns />
							</PageSectionShelfPage>
						)}

						{pageState === ROW_TYPE_ID.THREE_COLUMN_IMAGE && (
							<PageSectionShelfPage
								showBackButton
								onBackButtonClick={handleRowBack}
								showDeleteButton
								onDeleteButtonClick={() => {
									setShowRowDeleteModal(true);
								}}
								showCloseButton
								onCloseButtonButtonClick={() => {
									setCurrentPageSectionId('');
									setCurrentPageRowId('');
								}}
								title="Custom Row (3 Items)"
								bodyClassName="pt-0"
							>
								<RowSettingsThreeColumns />
							</PageSectionShelfPage>
						)}

						{pageState === ROW_TYPE_ID.MAILING_LIST && (
							<PageSectionShelfPage
								showBackButton
								onBackButtonClick={handleRowBack}
								showDeleteButton
								onDeleteButtonClick={() => {
									setShowRowDeleteModal(true);
								}}
								showCloseButton
								onCloseButtonButtonClick={() => {
									setCurrentPageSectionId('');
									setCurrentPageRowId('');
								}}
								title="Subscribe"
							>
								<RowSettingsMailingList />
							</PageSectionShelfPage>
						)}
					</>
				</CSSTransition>
			</TransitionGroup>
		</>
	);
};
