import React from 'react';
import { ContentTypeId } from '@/lib/models';

import { ReactComponent as AppIcon } from '@/assets/icons/icon-app.svg';
import { ReactComponent as ArticleIcon } from '@/assets/icons/icon-article.svg';
import { ReactComponent as AudioIcon } from '@/assets/icons/icon-audio.svg';
import { ReactComponent as PodcastIcon } from '@/assets/icons/icon-podcast.svg';
import { ReactComponent as VideoIcon } from '@/assets/icons/icon-video.svg';
import { ReactComponent as WorksheetIcon } from '@/assets/icons/icon-worksheet.svg';

interface Props extends React.SVGProps<SVGSVGElement> {
	contentTypeId: ContentTypeId;
	title?: string | undefined;
}

const ContentTypeIcon = ({ contentTypeId, ...props }: Props) => {
	switch (contentTypeId) {
		case ContentTypeId.APP:
			return <AppIcon {...props} />;
		case ContentTypeId.ARTICLE:
		case ContentTypeId.EXT_BLOG:
		case ContentTypeId.INT_BLOG:
			return <ArticleIcon {...props} />;
		case ContentTypeId.AUDIO:
			return <AudioIcon {...props} />;
		case ContentTypeId.PODCAST:
			return <PodcastIcon {...props} />;
		case ContentTypeId.VIDEO:
			return <VideoIcon {...props} />;
		case ContentTypeId.WORKSHEET:
			return <WorksheetIcon {...props} />;
		default:
			return null;
	}
};

export default ContentTypeIcon;
