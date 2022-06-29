import { CobaltTheme } from '@/jss/theme';

export const modal = (theme: CobaltTheme) => {
	return {
		'.modal-content': {
			border: 0,
			borderRadius: 0,
		},
		'.cobalt-modal': {
			'&__header': {
				position: 'relative',
				padding: '25px 25px 0',
				'& button.btn-close': {
					top: 19,
					right: 15,
					width: 40,
					height: 40,
					opacity: 1,
					float: 'none',
					borderRadius: 20,
					textShadow: 'none',
					color: 'transparent',
					position: 'absolute',
					'&:before, &:after': {
						width: 28,
						height: 3,
						top: '50%',
						left: '50%',
						content: '""',
						display: 'block',
						position: 'absolute',
						backgroundColor: theme.colors.black,
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
						backgroundColor: theme.colors.gray100,
					},
				},
				'&--admin': {
					padding: '17px 30px',
					position: 'relative',
					backgroundColor: theme.colors.gray100,
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
							backgroundColor: theme.colors.dark,
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
							backgroundColor: theme.colors.gray100,
						},
					},
				},
			},
			'&__title': {
				margin: 0,
				...theme.fonts.large,
				'&--admin': {
					margin: 0,
					...theme.fonts.large,
					...theme.fonts.headingBold,
				},
			},
			'&__body': {
				padding: '15px 25px',
				'&--admin': {
					padding: '56px 30px',
					backgroundColor: theme.colors.white,
					'&--small': {
						padding: 30,
						backgroundColor: theme.colors.white,
					},
				},
			},
			'&__footer': {
				display: 'flex',
				padding: '0 20px 25px',
				justifyContent: 'space-between',
				'&--admin': {
					display: 'flex',
					padding: '17px 30px',
					position: 'relative',
					backgroundColor: theme.colors.gray100,
					justifyContent: 'flex-end',
				},
			},
		},
	};
};
