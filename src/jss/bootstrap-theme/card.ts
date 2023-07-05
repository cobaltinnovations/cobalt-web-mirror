import { CobaltTheme } from '@/jss/theme';

export const card = (theme: CobaltTheme) => {
	return {
		'.cobalt-card': {
			backgroundColor: theme.colors.n0,
			boxShadow: theme.elevation.e400,
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
				color: theme.colors.n500,
			},
			'&__body': {
				padding: '15px 30px',
			},
		},
		'.ic-card': {
			borderRadius: 4,
			border: `1px solid ${theme.colors.n100}`,
			'& .cobalt-card': {
				'&__header': {
					padding: '14px 16px',
					position: 'relative',
					borderTopLeftRadius: 4,
					borderTopRightRadius: 4,
					backgroundColor: theme.colors.n75,
					borderBottom: `1px solid ${theme.colors.n100}`,
					'& .button-container': {
						right: 16,
						top: '50%',
						display: 'flex',
						position: 'absolute',
						alignItems: 'center',
						transform: 'translateY(-50%)',
					},
				},
				'&__title.h5': {
					margin: 0,
					...theme.fonts.default,
					...theme.fonts.bodyNormal,
					fontWeight: `500 !important`,
					textTransform: 'none',
				},
				'&__body': {
					padding: '20px 16px',
					borderBottomLeftRadius: 4,
					borderBottomRightRadius: 4,
					backgroundColor: theme.colors.n0,
				},
			},
		},
		'.form-card': {
			borderRadius: 4,
			border: `1px solid ${theme.colors.n100}`,
			'& .cobalt-card': {
				'&__header': {
					padding: 16,
					position: 'relative',
					borderTopLeftRadius: 4,
					borderTopRightRadius: 4,
					backgroundColor: theme.colors.n0,
					borderBottom: `1px solid ${theme.colors.n100}`,
				},
				'&__body': {
					padding: 16,
					borderBottomLeftRadius: 4,
					borderBottomRightRadius: 4,
					backgroundColor: theme.colors.n0,
				},
			},
		},
	};
};
