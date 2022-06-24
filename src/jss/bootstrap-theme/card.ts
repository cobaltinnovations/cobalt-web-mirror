import fonts from '@/jss/fonts';
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
				...fonts.m,
				...fonts.nunitoSansBold,
				textTransform: 'lowercase',
			},
			'&__subtitle.h6': {
				margin: 0,
				...fonts.xxs,
				...fonts.karlaRegular,
				textTransform: 'lowercase',
				color: theme.colors.gray600,
			},
			'&__body': {
				padding: '15px 30px',
			},
		},
	};
};
