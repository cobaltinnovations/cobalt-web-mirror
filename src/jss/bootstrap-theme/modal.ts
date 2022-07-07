import { CobaltTheme } from '@/jss/theme';

export const modal = (theme: CobaltTheme) => {
	return {
		'.modal-content': {
			borderRadius: 5,
			border: `1px solid ${theme.colors.n100}`,
			filter: 'drop-shadow(0px 10px 18px rgba(41, 40, 39, 0.15)) drop-shadow(0px 0px 1px rgba(41, 40, 39, 0.31))',
		},
		'.cobalt-modal': {
			'&__header': {
				padding: '14px 24px',
				position: 'relative',
				borderTopLeftRadius: 5,
				borderTopRightRadius: 5,
				backgroundColor: theme.colors.n50,
				borderBottom: `1px solid ${theme.colors.n100}`,
				'& button.btn-close': {
					top: '50%',
					right: 16,
					width: 24,
					height: 24,
					opacity: 1,
					float: 'none',
					borderRadius: 20,
					textShadow: 'none',
					color: 'transparent',
					position: 'absolute',
					background: 'transparent',
					transform: 'translateY(-50%)',
					'&:before, &:after': {
						width: 18,
						height: 2,
						top: '50%',
						left: '50%',
						content: '""',
						display: 'block',
						borderRadius: 500,
						position: 'absolute',
						backgroundColor: theme.colors.n300,
					},
					'&:before': {
						transform: 'translate(-50%, -50%) rotate(-45deg)',
					},
					'&:after': {
						transform: 'translate(-50%, -50%) rotate(45deg)',
					},
					'&:not(:disabled):not(.disabled):focus, &:not(:disabled):not(.disabled):hover': {
						opacity: 1,
					},
					'&:not(:disabled):not(.disabled):hover': {
						backgroundColor: theme.colors.n100,
					},
				},
				'&--admin': {
					padding: '17px 30px',
					position: 'relative',
					backgroundColor: theme.colors.n100,
					'& button.btn-close': {
						right: 12,
						width: 44,
						top: '50%',
						height: 44,
						opacity: 1,
						position: 'absolute',
						transform: 'translateY(-50%)',
						'& span': {
							display: 'none',
						},
						'&:before, &:after': {
							width: 16,
							height: 2,
							top: '50%',
							left: '50%',
							content: '""',
							display: 'block',
							position: 'absolute',
							backgroundColor: theme.colors.n900,
						},
						'&:before': {
							transform: 'translate(-50%, -50%) rotate(-45deg)',
						},
						'&:after': {
							transform: 'translate(-50%, -50%) rotate(45deg)',
						},
						'&:not(:disabled):not(.disabled):focus, &:not(:disabled):not(.disabled):hover': {
							opacity: 1,
						},
						'&:not(:disabled):not(.disabled):hover': {
							backgroundColor: theme.colors.n100,
						},
					},
				},
			},
			'&__title': {
				margin: 0,
				...theme.fonts.h5,
				...theme.fonts.headingBold,
				'&--admin': {
					margin: 0,
					...theme.fonts.large,
					...theme.fonts.headingBold,
				},
			},
			'&__body': {
				padding: '20px 30px',
				'&--admin': {
					padding: '56px 30px',
					backgroundColor: theme.colors.n0,
					'&--small': {
						padding: 30,
						backgroundColor: theme.colors.n0,
					},
				},
			},
			'&__footer': {
				padding: '8px 24px',
				borderBottomLeftRadius: 5,
				borderBottomRightRadius: 5,
				backgroundColor: theme.colors.n50,
				borderTop: `1px solid ${theme.colors.n100}`,
				'&--admin': {
					display: 'flex',
					padding: '17px 30px',
					position: 'relative',
					backgroundColor: theme.colors.n100,
					justifyContent: 'flex-end',
				},
			},
		},
	};
};
