import colors from '@/jss/colors';
import fonts from '@/jss/fonts';
import { boxShadow } from '@/jss/mixins';

export const card = {
	'.cobalt-card': {
		backgroundColor: colors.white,
		...boxShadow,
		'&__header': {
			padding: '15px 30px',
			borderBottom: `1px solid ${colors.border}`,
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
			color: colors.gray600,
		},
		'&__body': {
			padding: '15px 30px',
		},
	},
};
