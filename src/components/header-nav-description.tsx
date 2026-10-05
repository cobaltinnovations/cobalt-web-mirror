import React from 'react';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles(() => ({
	content: { '& p:last-of-type': { marginBottom: 0 } },
}));

export const HeaderNavDescription = ({
	description,
	descriptionHtml,
}: {
	description: string;
	descriptionHtml?: string;
}) => {
	const classes = useStyles();
	if (descriptionHtml) {
		return <div className={`${classes.content} text-gray`} dangerouslySetInnerHTML={{ __html: descriptionHtml }} />;
	}
	return description ? <p className="mb-0 text-gray">{description}</p> : null;
};
