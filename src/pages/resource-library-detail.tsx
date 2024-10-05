import React, { FC, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';

import { analyticsService, contentService } from '@/lib/services';
import { AnalyticsNativeEventTypeId, Content } from '@/lib/models';

import ResourceDisplay, { ResourceDisplaySkeleton } from '@/components/resource-display';

const ResourceLibraryDetail: FC = () => {
	const { contentId } = useParams<{
		contentId: string;
	}>();
	const [item, setItem] = useState<Content>();

	const fetchData = useCallback(async () => {
		if (!contentId) {
			throw new Error('contentId is undefined.');
		}

		const contentResponse = await contentService.fetchContent(contentId).fetch();

		setItem(contentResponse.content);

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY_DETAIL, {
			contentId: contentId,
		});
	}, [contentId]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Resource Library</title>
			</Helmet>

			<Breadcrumb
				breadcrumbs={[
					{
						to: '/',
						title: 'Home',
					},
					{
						to: '/resource-library',
						title: 'Resource Library',
					},
					{
						to: '/#',
						title: item?.title ?? 'Content',
					},
				]}
			/>

			<AsyncPage fetchData={fetchData} loadingComponent={<ResourceDisplaySkeleton />}>
				<ResourceDisplay trackView content={item} />
			</AsyncPage>
		</>
	);
};

export default ResourceLibraryDetail;
