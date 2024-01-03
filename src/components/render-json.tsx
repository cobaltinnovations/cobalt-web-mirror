import React, { FC } from 'react';

import config from '@/config/config';
import { createUseThemedStyles } from '@/jss/theme';

const useRenderJsonStyles = createUseThemedStyles((theme) => ({
	renderJson: {
		padding: 16,
		...theme.fonts.small,
		marginTop: 24,
		borderRadius: 4,
		backgroundColor: theme.colors.n100,
		border: `1px solid ${theme.colors.border}`,
	},
}));

interface RenderJsonProps {
	json: any;
}

const RenderJson: FC<RenderJsonProps> = (props) => {
	const classes = useRenderJsonStyles();

	if (config.showDebug) {
		return <pre className={classes.renderJson}>{JSON.stringify(props.json, null, 4)}</pre>;
	}

	return null;
};

export default RenderJson;
