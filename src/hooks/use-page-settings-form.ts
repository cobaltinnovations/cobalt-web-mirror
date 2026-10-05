import { useCallback, useEffect, useRef, useState } from 'react';
import { PAGE_LOCATION_ID, PageDetailModel } from '@/lib/models/pages-models';
import { pagesService } from '@/lib/services/pages-service';
import useDebouncedAsyncFunction from './use-debounced-async-function';

interface PageSettingsFormValues {
	pageName: string;
	friendlyUrl: string;
	pageLocationId: PAGE_LOCATION_ID;
}

const getFormValues = (page?: PageDetailModel): PageSettingsFormValues => ({
	pageName: page?.name ?? '',
	friendlyUrl: page?.urlName ?? '',
	pageLocationId: page?.pageLocationId ?? PAGE_LOCATION_ID.UNCATEGORIZED,
});

export const usePageSettingsForm = ({
	page,
	onSaved,
	onSavingChange,
	onError,
}: {
	page?: PageDetailModel;
	onSaved(page: PageDetailModel): void;
	onSavingChange(isSaving: boolean): void;
	onError(error: unknown): void;
}) => {
	const [formValues, setFormValues] = useState(() => getFormValues(page));
	const formValuesRef = useRef(formValues);
	const formPageIdRef = useRef(page?.pageId);
	const pageRef = useRef(page);
	pageRef.current = page;
	const confirmedUrlsRef = useRef(new Map(page ? [[page.pageId, page.urlName]] : []));
	const hasUnsavedChangesRef = useRef(false);
	const persistenceQueueRef = useRef<Promise<void>>(Promise.resolve());
	const pendingPersistenceCountRef = useRef(0);
	const callbacksRef = useRef({ onSaved, onSavingChange, onError });
	callbacksRef.current = { onSaved, onSavingChange, onError };

	const persistFormValues = useCallback(async (pageId: string, values: PageSettingsFormValues, urlName?: string) => {
		pendingPersistenceCountRef.current += 1;
		callbacksRef.current.onSavingChange(true);
		const persistence = persistenceQueueRef.current.then(async () => {
			// Autosaves use the confirmed URL when they execute, never an earlier form snapshot.
			const confirmedUrl = confirmedUrlsRef.current.get(pageId) ?? values.friendlyUrl;
			const { page: savedPage } = await pagesService
				.updatePageSettings(pageId, {
					name: values.pageName,
					urlName: urlName ?? confirmedUrl,
					pageLocationId: values.pageLocationId,
				})
				.fetch();

			confirmedUrlsRef.current.set(pageId, savedPage.urlName);
			if (pageRef.current?.pageId !== pageId) return;
			if (
				formValuesRef.current.pageName === values.pageName &&
				formValuesRef.current.pageLocationId === values.pageLocationId
			) {
				const savedValues = getFormValues(savedPage);
				formValuesRef.current = savedValues;
				hasUnsavedChangesRef.current = false;
				setFormValues(savedValues);
			} else {
				const latestValues = { ...formValuesRef.current, friendlyUrl: savedPage.urlName };
				formValuesRef.current = latestValues;
				setFormValues(latestValues);
			}
			pageRef.current = savedPage;
			callbacksRef.current.onSaved(savedPage);
		});
		// A failed autosave must not prevent the next edit from being persisted.
		persistenceQueueRef.current = persistence.catch(() => undefined);
		try {
			await persistence;
		} finally {
			pendingPersistenceCountRef.current -= 1;
			if (pendingPersistenceCountRef.current === 0) callbacksRef.current.onSavingChange(false);
		}
	}, []);

	const debouncedSubmission = useDebouncedAsyncFunction(async (pageId: string, values: PageSettingsFormValues) => {
		try {
			await persistFormValues(pageId, values);
		} catch (error) {
			callbacksRef.current.onError(error);
		}
	});

	useEffect(() => {
		const nextPageId = page?.pageId;
		if (formPageIdRef.current && formPageIdRef.current !== nextPageId) {
			void debouncedSubmission.flush();
		}
		if (formPageIdRef.current === nextPageId && hasUnsavedChangesRef.current) return;
		if (page && (formPageIdRef.current !== nextPageId || !confirmedUrlsRef.current.has(page.pageId))) {
			confirmedUrlsRef.current.set(page.pageId, page.urlName);
		}
		const nextValues = getFormValues(page);
		formPageIdRef.current = nextPageId;
		formValuesRef.current = nextValues;
		hasUnsavedChangesRef.current = false;
		setFormValues(nextValues);
	}, [page, debouncedSubmission]);

	useEffect(() => () => void debouncedSubmission.flush(), [debouncedSubmission]);

	const setLocalValues = useCallback((values: PageSettingsFormValues) => {
		formValuesRef.current = values;
		hasUnsavedChangesRef.current = true;
		setFormValues(values);
	}, []);

	const changeValues = useCallback(
		(patch: Partial<PageSettingsFormValues>) => {
			const values = { ...formValuesRef.current, ...patch };
			setLocalValues(values);
			if (pageRef.current) debouncedSubmission(pageRef.current.pageId, values);
		},
		[debouncedSubmission, setLocalValues]
	);

	const saveUrl = useCallback(
		async (pageId: string, urlName: string) => {
			if (pageRef.current?.pageId !== pageId) throw new Error('The page being edited has changed.');
			// Flush both the debounce and the in-flight queue before capturing the URL edit.
			await debouncedSubmission.flush();
			await persistenceQueueRef.current;
			if (pageRef.current?.pageId !== pageId) throw new Error('The page being edited has changed.');
			await persistFormValues(pageId, formValuesRef.current, urlName);
		},
		[debouncedSubmission, persistFormValues]
	);

	return { formValues, changeValues, saveUrl };
};
