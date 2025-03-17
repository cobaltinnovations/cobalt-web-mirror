import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TagGroup, TagRowModel } from '@/lib/models';
import { pagesService, tagService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { PageSectionShelfPage } from '@/components/admin/pages';
import AsyncWrapper from '@/components/async-page';
import InputHelper from '@/components/input-helper';

interface RowSettingsTagProps {
	onBackButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onDeleteButtonClick(): void;
}

export const RowSettingsTag = ({ onBackButtonClick, onDeleteButtonClick }: RowSettingsTagProps) => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const tagRow = useMemo(() => currentPageRow as TagRowModel | undefined, [currentPageRow]);
	const [tagGroupOptions, setTagGroupOptions] = useState<TagGroup[]>([]);
	const [formValues, setFormValues] = useState({ tagId: '' });

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
		setFormValues({ tagId: tagRow?.tag.tagId ?? '' });
	}, [tagRow?.tag.tagId]);

	const handleTagSelectChange = async (tagId: string) => {
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const { pageRow } = await pagesService.updateTagRow(currentPageRow.pageRowId, { tagId }).fetch();
			updatePageRow(pageRow);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<PageSectionShelfPage
			showBackButton
			onBackButtonClick={onBackButtonClick}
			showDeleteButton
			onDeleteButtonClick={onDeleteButtonClick}
			title="Tag"
		>
			<AsyncWrapper fetchData={fetchData}>
				<InputHelper
					as="select"
					label="Tag"
					value={formValues.tagId}
					onChange={({ currentTarget }) => {
						setFormValues((previousValue) => ({
							...previousValue,
							tagId: currentTarget.value,
						}));

						handleTagSelectChange(currentTarget.value);
					}}
					required
				>
					<option value="" disabled>
						Select tag...
					</option>
					{tagGroupOptions.map((tg) => (
						<optgroup key={tg.tagGroupId} label={tg.name}>
							{(tg.tags ?? []).map((t) => (
								<option key={t.tagId} value={t.tagId}>
									{t.name}
								</option>
							))}
						</optgroup>
					))}
				</InputHelper>
			</AsyncWrapper>
		</PageSectionShelfPage>
	);
};
