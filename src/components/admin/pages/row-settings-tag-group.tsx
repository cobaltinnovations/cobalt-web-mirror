import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TagGroup, TagGroupRowModel } from '@/lib/models';
import { pagesService, tagService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { PageSectionShelfPage, RowSettingsMetaForm } from '@/components/admin/pages';
import AsyncWrapper from '@/components/async-page';
import InputHelper from '@/components/input-helper';

interface RowSettingsTagGroupProps {
	onDeleteButtonClick(): void;
}

export const RowSettingsTagGroup = ({ onDeleteButtonClick }: RowSettingsTagGroupProps) => {
	const handleError = useHandleError();
	const { setCurrentPageSectionId, currentPageRow, setCurrentPageRowId, updatePageRow, setIsSaving } =
		usePageBuilderContext();
	const resourcesRow = useMemo(() => currentPageRow as TagGroupRowModel | undefined, [currentPageRow]);
	const [tagGroupOptions, setTagGroupOptions] = useState<TagGroup[]>([]);
	const [formValues, setFormValues] = useState({ tagGroupId: '' });

	const fetchData = useCallback(async () => {
		setTagGroupOptions([]);

		try {
			const { tagGroups } = await tagService.getTagGroups().fetch();
			setTagGroupOptions(tagGroups);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	useEffect(() => {
		setFormValues({ tagGroupId: resourcesRow?.tagGroup.tagGroupId ?? '' });
	}, [resourcesRow?.tagGroup.tagGroupId]);

	const handleTagGroupSelectChange = async (tagGroupId: string) => {
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const { pageRow } = await pagesService.updateTagGroupRow(currentPageRow.pageRowId, { tagGroupId }).fetch();
			updatePageRow(pageRow);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<PageSectionShelfPage
			showDeleteButton
			onDeleteButtonClick={onDeleteButtonClick}
			showCloseButton
			onCloseButtonButtonClick={() => {
				setCurrentPageSectionId('');
				setCurrentPageRowId('');
			}}
			title={resourcesRow?.name ?? 'Tag Group'}
		>
			<AsyncWrapper fetchData={fetchData}>
				<RowSettingsMetaForm />
				<InputHelper
					as="select"
					label="Tag"
					value={formValues.tagGroupId}
					onChange={({ currentTarget }) => {
						setFormValues((previousValue) => ({
							...previousValue,
							tagGroupId: currentTarget.value,
						}));

						handleTagGroupSelectChange(currentTarget.value);
					}}
					required
				>
					<option value="" disabled>
						Select tag...
					</option>
					{tagGroupOptions.map((tg) => (
						<option key={tg.tagGroupId} value={tg.tagGroupId}>
							{tg.name}
						</option>
					))}
				</InputHelper>
			</AsyncWrapper>
		</PageSectionShelfPage>
	);
};
