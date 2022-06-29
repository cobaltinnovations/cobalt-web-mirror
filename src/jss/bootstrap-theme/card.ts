import { boxShadow } from '@/jss/mixins';
import { CobaltTheme } from '@/jss/theme';

export const card = (theme: CobaltTheme) => {
	return {
		'.cobalt-card': {
			backgroundColor: theme.colors.white,
			...boxShadow,
			'&__header': {
				padding: '15px 30px',
				borderBottom: `1px solid ${theme.colors.border}`,
			},
			'&__title.h5': {
				margin: 0,
				...theme.fonts.large,
				...theme.fonts.headingBold,
				textTransform: 'lowercase',
			},
			'&__subtitle.h6': {
				margin: 0,
				...theme.fonts.small,
				...theme.fonts.bodyNormal,
				textTransform: 'lowercase',
				color: theme.colors.gray600,
			},
			'&__body': {
				padding: '15px 30px',
			},
		},
	};
};
