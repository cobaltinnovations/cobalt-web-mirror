import React, { FC } from 'react';

import fonts from '@/jss/fonts';

import config from '@/lib/config';
import { createUseThemedStyles } from '@/jss/theme';

const useRenderJsonStyles = createUseThemedStyles((theme) => ({
	renderJson: {
		padding: 16,
		...fonts.xxs,
		marginTop: 24,
		borderRadius: 4,
		backgroundColor: theme.colors.gray200,
		border: `1px solid ${theme.colors.gray400}`,
	},
}));

interface RenderJsonProps {
	json: any;
}

const RenderJson: FC<RenderJsonProps> = (props) => {
	const classes = useRenderJsonStyles();

	if (config.COBALT_WEB_SHOW_DEBUG === 'true') {
		return <pre className={classes.renderJson}>{JSON.stringify(props.json, null, 4)}</pre>;
	}

	return null;
};

export default RenderJson;
