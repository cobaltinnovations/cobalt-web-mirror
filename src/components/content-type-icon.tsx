import React from 'react';
import { ContentTypeId } from '@/lib/models';

import SvgIcon from './svg-icon';

interface Props extends React.SVGProps<SVGSVGElement> {
	contentTypeId: ContentTypeId;
	title?: string | undefined;
}

const ContentTypeIcon = ({ contentTypeId, ...props }: Props) => {
	switch (contentTypeId) {
		case ContentTypeId.APP:
			return <SvgIcon kit="far" icon="mobile" size={16} {...props} />;
		case ContentTypeId.ARTICLE:
		case ContentTypeId.EXT_BLOG:
		case ContentTypeId.INT_BLOG:
			return <SvgIcon kit="far" icon="newspaper" size={16} {...props} />;
		case ContentTypeId.AUDIO:
			return <SvgIcon kit="far" icon="volume" size={16} {...props} />;
		case ContentTypeId.PODCAST:
			return <SvgIcon kit="far" icon="podcast" size={16} {...props} />;
		case ContentTypeId.VIDEO:
			return <SvgIcon kit="fak" icon="video" size={16} {...props} />;
		case ContentTypeId.WORKSHEET:
			return <SvgIcon kit="far" icon="clipboard-list-check" size={16} {...props} />;
		default:
			return null;
	}
};

export default ContentTypeIcon;
