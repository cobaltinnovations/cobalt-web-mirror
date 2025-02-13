import React, { FC, createContext, useState, PropsWithChildren, useMemo, useEffect } from 'react';
import { BACKGROUND_COLOR_ID, PageDetailModel, PageRowUnionModel, PageSectionDetailModel } from '@/lib/models';
import { HERO_SECTION_ID } from '@/components/admin/pages';
import { cloneDeep } from 'lodash';
import moment from 'moment';

type PageBuilderContextConfig = {
	page?: PageDetailModel;
	setPage: React.Dispatch<React.SetStateAction<PageDetailModel | undefined>>;
	setCurrentPageSectionId: React.Dispatch<React.SetStateAction<string>>;
	currentPageSection?: PageSectionDetailModel;
	addPageSection(pageSection: PageSectionDetailModel): void;
	updatePageSection(pageSection: PageSectionDetailModel): void;
	deletePageSection(pageSectionId: string): void;
	addPageRowToCurrentPageSection(pageRow: PageRowUnionModel): void;
	setCurrentPageRowId: React.Dispatch<React.SetStateAction<string>>;
	currentPageRow?: PageRowUnionModel;
	updatePageRow(pageRow: PageRowUnionModel): void;
	deletePageRow(pageRowId: string): void;
	isSaving: boolean;
	setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
	lastSaved: string;
};

const PageBuilderContext = createContext({} as PageBuilderContextConfig);

const PageBuilderProvider: FC<PropsWithChildren> = ({ children }) => {
	const [page, setPage] = useState<PageDetailModel>();
	const [currentPageSectionId, setCurrentPageSectionId] = useState('');
	const [currentPageRowId, setCurrentPageRowId] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState(page?.lastUpdatedDescription ?? '');

	const currentPageSection = useMemo(() => {
		if (!page) {
			return undefined;
		}

		// Create fake section for "Hero"
		if (currentPageSectionId === HERO_SECTION_ID) {
			return {
				pageSectionId: HERO_SECTION_ID,
				pageId: page.pageId,
				name: 'Hero',
				headline: '',
				description: '',
				backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
				displayOrder: 0,
				pageRows: [],
			};
		}

		return page.pageSections.find((ps) => ps.pageSectionId === currentPageSectionId);
	}, [currentPageSectionId, page]);

	const addPageSection = (pageSection: PageSectionDetailModel) => {
		setPage((previousValue) => {
			if (!previousValue) {
				return undefined;
			}

			return {
				...previousValue,
				pageSections: [...previousValue.pageSections, pageSection],
			};
		});
	};

	const updatePageSection = (pageSection: PageSectionDetailModel) => {
		setPage((previousValue) => {
			if (!previousValue) {
				return undefined;
			}

			return {
				...previousValue,
				pageSections: previousValue.pageSections.map((ps) =>
					ps.pageSectionId === pageSection.pageSectionId ? pageSection : ps
				),
			};
		});
	};

	const deletePageSection = (pageSectionId: string) => {
		setPage((previousValue) => {
			if (!previousValue) {
				return undefined;
			}

			return {
				...previousValue,
				pageSections: previousValue.pageSections.filter((ps) => ps.pageSectionId !== pageSectionId),
			};
		});
	};

	const addPageRowToCurrentPageSection = (pageRow: PageRowUnionModel) => {
		if (!page) {
			return;
		}

		const pageClone = cloneDeep(page);
		pageClone.pageSections = pageClone.pageSections.map((ps) => {
			if (ps.pageSectionId === currentPageSectionId) {
				return {
					...ps,
					pageRows: [...ps.pageRows, pageRow],
				};
			}

			return ps;
		});

		setPage(pageClone);
	};

	const currentPageRow = useMemo(() => {
		if (!page) {
			return undefined;
		}

		if (!currentPageSection) {
			return undefined;
		}

		return currentPageSection.pageRows.find((pr) => pr.pageRowId === currentPageRowId);
	}, [currentPageRowId, currentPageSection, page]);

	const updatePageRow = (pageRow: PageRowUnionModel) => {
		if (!page) {
			return undefined;
		}

		if (!currentPageSection) {
			return undefined;
		}

		setPage((previousValue) => {
			if (!previousValue) {
				return undefined;
			}

			return {
				...previousValue,
				pageSections: previousValue.pageSections.map((ps) =>
					ps.pageSectionId === currentPageSectionId
						? {
								...ps,
								pageRows: ps.pageRows.map((pr) => (pr.pageRowId === pageRow.pageRowId ? pageRow : pr)),
						  }
						: ps
				),
			};
		});
	};

	const deletePageRow = (pageRowId: string) => {
		if (!page) {
			return undefined;
		}

		if (!currentPageSection) {
			return undefined;
		}

		setPage((previousValue) => {
			if (!previousValue) {
				return undefined;
			}

			return {
				...previousValue,
				pageSections: previousValue.pageSections.map((ps) =>
					ps.pageSectionId === currentPageSectionId
						? {
								...ps,
								pageRows: ps.pageRows.filter((pr) => pr.pageRowId !== pageRowId),
						  }
						: ps
				),
			};
		});
	};

	useEffect(() => {
		if (!isSaving) {
			const momentDate = moment(new Date());
			setLastSaved(momentDate.format('MMM DD, yyyy @ h:mm:ss a'));
		}
	}, [isSaving]);

	const value = {
		page,
		setPage,
		setCurrentPageSectionId,
		currentPageSection,
		addPageSection,
		updatePageSection,
		deletePageSection,
		addPageRowToCurrentPageSection,
		setCurrentPageRowId,
		currentPageRow,
		updatePageRow,
		deletePageRow,
		isSaving,
		setIsSaving,
		lastSaved,
	};

	return <PageBuilderContext.Provider value={value}>{children}</PageBuilderContext.Provider>;
};

export { PageBuilderContext, PageBuilderProvider };
