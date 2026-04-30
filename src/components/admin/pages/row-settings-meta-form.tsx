import React, { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { BACKGROUND_COLOR_ID, PageRowBaseModel, ROW_PADDING_ID } from '@/lib/models';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';

interface RowSettingsMetaFormProps {
	nameInputRef?: RefObject<HTMLInputElement>;
}

export const RowSettingsMetaForm = ({ nameInputRef }: RowSettingsMetaFormProps) => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const pageRow = useMemo(() => currentPageRow as PageRowBaseModel | undefined, [currentPageRow]);
	const [formValues, setFormValues] = useState({
		name: '',
		backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
		paddingTopId: ROW_PADDING_ID.MEDIUM,
		paddingBottomId: ROW_PADDING_ID.MEDIUM,
	});

	useEffect(() => {
		if (!pageRow) {
			return;
		}

		setFormValues({
			name: pageRow.name ?? '',
			backgroundColorId: pageRow.backgroundColorId ?? BACKGROUND_COLOR_ID.WHITE,
			paddingTopId: pageRow.paddingTopId ?? ROW_PADDING_ID.MEDIUM,
			paddingBottomId: pageRow.paddingBottomId ?? ROW_PADDING_ID.MEDIUM,
		});
	}, [pageRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (pr: PageRowBaseModel, fv: typeof formValues) => {
		setIsSaving(true);

		try {
			const { pageRow: updatedPageRow } = await pagesService
				.updatePageRow(pr.pageRowId, {
					name: fv.name,
					backgroundColorId: fv.backgroundColorId,
					paddingTopId: fv.paddingTopId,
					paddingBottomId: fv.paddingBottomId,
				})
				.fetch();

			updatePageRow(updatedPageRow);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	});

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setFormValues((previousValue) => {
				const newValue = {
					...previousValue,
					[currentTarget.name]: currentTarget.value,
				};

				if (pageRow) {
					debouncedSubmission(pageRow, newValue);
				}

				return newValue;
			});
		},
		[debouncedSubmission, pageRow]
	);

	if (!pageRow) {
		return null;
	}

	return (
		<>
			<InputHelper
				ref={nameInputRef}
				className="mb-4"
				type="text"
				label="Row name"
				name="name"
				value={formValues.name}
				onChange={handleInputChange}
				required
			/>
			<InputHelper
				className="mb-6"
				as="select"
				label="Background color"
				name="backgroundColorId"
				value={formValues.backgroundColorId}
				onChange={handleInputChange}
			>
				<option value={BACKGROUND_COLOR_ID.WHITE}>White</option>
				<option value={BACKGROUND_COLOR_ID.NEUTRAL}>Neutral</option>
			</InputHelper>
			<div className="d-flex gap-4 mb-6">
				<div className="flex-grow-1">
					<InputHelper
						className="mb-0"
						as="select"
						label="Padding top"
						name="paddingTopId"
						value={formValues.paddingTopId}
						onChange={handleInputChange}
					>
						<option value={ROW_PADDING_ID.NONE}>None</option>
						<option value={ROW_PADDING_ID.SMALL}>Small</option>
						<option value={ROW_PADDING_ID.MEDIUM}>Medium</option>
						<option value={ROW_PADDING_ID.LARGE}>Large</option>
					</InputHelper>
				</div>
				<div className="flex-grow-1">
					<InputHelper
						className="mb-0"
						as="select"
						label="Padding bottom"
						name="paddingBottomId"
						value={formValues.paddingBottomId}
						onChange={handleInputChange}
					>
						<option value={ROW_PADDING_ID.NONE}>None</option>
						<option value={ROW_PADDING_ID.SMALL}>Small</option>
						<option value={ROW_PADDING_ID.MEDIUM}>Medium</option>
						<option value={ROW_PADDING_ID.LARGE}>Large</option>
					</InputHelper>
				</div>
			</div>
			<hr />
		</>
	);
};
