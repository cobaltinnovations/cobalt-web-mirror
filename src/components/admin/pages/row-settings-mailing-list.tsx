import React, { useMemo } from 'react';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { MailingListRowModel } from '@/lib/models';

export const RowSettingsMailingList = () => {
	const { currentPageRow } = usePageBuilderContext();
	const mailingListRow = useMemo(() => currentPageRow as MailingListRowModel | undefined, [currentPageRow]);

	return <p>[TODO]: Row Settings Mailing List: {mailingListRow?.mailingListId}</p>;
};
