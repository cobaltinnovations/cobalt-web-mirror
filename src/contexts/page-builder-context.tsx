import React, { FC, createContext, useState, PropsWithChildren, useMemo } from 'react';
import { BACKGROUND_COLOR_ID, PageDetailModel, PageRowUnionModel, PageSectionDetailModel } from '@/lib/models';
import { HERO_SECTION_ID } from '@/components/admin/pages';
import { cloneDeep } from 'lodash';

type PageBuilderContextConfig = {
	page?: PageDetailModel;
	setPage: React.Dispatch<React.SetStateAction<PageDetailModel | undefined>>;
	setCurrentPageSectionId: React.Dispatch<React.SetStateAction<string>>;
	currentPageSection?: PageSectionDetailModel;
	addPageRowToCurrentPageSection(pageRow: PageRowUnionModel): void;
};

const PageBuilderContext = createContext({} as PageBuilderContextConfig);

const PageBuilderProvider: FC<PropsWithChildren> = ({ children }) => {
	const [page, setPage] = useState<PageDetailModel>();
	const [currentPageSectionId, setCurrentPageSectionId] = useState('');

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

	const value = {
		page,
		setPage,
		setCurrentPageSectionId,
		currentPageSection,
		addPageRowToCurrentPageSection,
	};

	return <PageBuilderContext.Provider value={value}>{children}</PageBuilderContext.Provider>;
};

export { PageBuilderContext, PageBuilderProvider };
