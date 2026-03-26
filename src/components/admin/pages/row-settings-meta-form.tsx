import React, { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { BACKGROUND_COLOR_ID, PageRowBaseModel } from '@/lib/models';
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
	});

	useEffect(() => {
		if (!pageRow) {
			return;
		}

		setFormValues({
			name: pageRow.name ?? '',
			backgroundColorId: pageRow.backgroundColorId ?? BACKGROUND_COLOR_ID.WHITE,
		});
	}, [pageRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (pr: PageRowBaseModel, fv: typeof formValues) => {
		setIsSaving(true);

		try {
			const { pageRow: updatedPageRow } = await pagesService
				.updatePageRow(pr.pageRowId, {
					name: fv.name,
					backgroundColorId: fv.backgroundColorId,
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
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
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
			<Form.Group className="mb-6">
				<Form.Label className="mb-2">Background color</Form.Label>
				<Form.Check
					type="radio"
					id="row-background-color--white"
					label="White"
					name="backgroundColorId"
					value={BACKGROUND_COLOR_ID.WHITE}
					checked={formValues.backgroundColorId === BACKGROUND_COLOR_ID.WHITE}
					onChange={handleInputChange}
				/>
				<Form.Check
					type="radio"
					id="row-background-color--neutral"
					label="Neutral"
					name="backgroundColorId"
					value={BACKGROUND_COLOR_ID.NEUTRAL}
					checked={formValues.backgroundColorId === BACKGROUND_COLOR_ID.NEUTRAL}
					onChange={handleInputChange}
				/>
			</Form.Group>
			<hr />
		</>
	);
};
