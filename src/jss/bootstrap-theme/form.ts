import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

export const form = {
	'.cobalt-form': {
		'&__group': {
			marginBottom: 25,
		},
		'&__label': {
			...fonts.xl,
			marginBottom: 15,
			color: colors.dark,
			...fonts.nunitoSansBold,
		},
		'&__control': {
			flex: 1,
			padding: 0,
			...fonts.xs,
			width: '100%',
			textIndent: 15,
			borderRadius: 0,
			display: 'block',
			appearance: 'none',
			color: colors.dark,
			lineHeight: 'normal',
			...fonts.karlaRegular,
			backgroundColor: colors.white,
			border: `1px solid ${colors.border}`,
			'&:hover': {
				border: `1px solid ${colors.primary}`,
			},
			'&:disabled': {
				backgroundColor: colors.gray300,
				'&:hover': {
					border: `1px solid ${colors.gray500}`,
				},
			},
			'&:focus': {
				outline: 'none',
			},
			'&[type=date], &[type=datetime-local], &[type=email], &[type=month], &[type=number], &[type=password], &[type=search], &[type=tel], &[type=text], &[type=time], &[type=url], &[type=week]': {
				height: 54,
				lineHeight: '5.4rem',
			},
			'&[type=date]': {
				textIndent: 0,
				paddingLeft: 15,
				paddingRight: 15,
			},
			'&[type=search]': {
				paddingRight: 15,
			},
		},
		'&__control-full': {
			flex: 1,
			border: 0,
			padding: 0,
			height: 70,
			...fonts.xs,
			width: '100%',
			borderRadius: 0,
			display: 'block',
			appearance: 'none',
			color: colors.dark,
			lineHeight: 'normal',
			...fonts.karlaRegular,
			backgroundColor: 'transparent',
			'&:focus': {
				outline: 'none',
			},
		},
		'&__check': {
			marginBottom: 5,
			'&-inline': {
				marginRight: 24,
				display: 'inline-flex',
			},
			'& input[type=checkbox], & input[type=radio]': {
				width: 0,
				height: 0,
				opacity: 0,
				'& + label': {
					...fonts.l,
					padding: '15px 20px 15px 60px',
					width: '100%',
					borderRadius: 500,
					cursor: 'pointer',
					position: 'relative',
					color: colors.primary,
					...fonts.nunitoSansBold,
					backgroundColor: colors.white,
					'&:before': {
						left: 15,
						width: 25,
						height: 25,
						top: '50%',
						content: '""',
						borderRadius: '50%',
						position: 'absolute',
						transform: 'translateY(-50%)',
						border: `2px solid ${colors.background}`,
					},
				},
				'&:checked + label': {
					color: colors.white,
					backgroundColor: colors.secondary,
					'&:before': {
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						backgroundColor: colors.white,
						backgroundSize: '12.5px 8.75px',
						border: `2px solid ${colors.white}`,
						backgroundImage: 'url(/static/images/icon-checkmark-orange.svg)',
					},
				},
			},
		},
	},
	'textarea.cobalt-form__control': {
		height: 260,
		padding: 15,
		textIndent: 0,
		resize: 'none',
	},
	'select.cobalt-form__control': {
		textIndent: 0,
	},
	'.input-group': {
		'& .input-group__radio > input + label': {
			borderRight: 0,
		},
		'& .input-group__radio:first-child > input + label': {
			borderTopLeftRadius: 500,
			borderBottomLeftRadius: 500,
		},
		'& .input-group__radio:last-child > input + label': {
			borderTopRightRadius: 500,
			borderBottomRightRadius: 500,
			border: `1px solid ${colors.border}`,
		},
		'&__radio': {
			'& input': {
				display: 'none',
				'& + label': {
					padding: 16,
					backgroundColor: 'transparent',
					border: `1px solid ${colors.border}`,
					...fonts.xxs,
					...fonts.karlaBold,
				},
				'&:checked + label': {
					color: colors.white,
					backgroundColor: colors.secondary,
					border: `1px solid ${colors.secondary}`,
				},
			},
		},
	},
};

export const modalForm = {
	'.cobalt-modal-form': {
		'&__check': {
			'&-inline': {
				marginRight: 24,
				display: 'inline-flex',
			},
			'& input[type=checkbox]': {
				'& + label:before': {
					backgroundColor: colors.secondary,
				},
				'&:checked + label': {
					'&:before': {
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						backgroundImage: 'url(/static/images/icon-checkmark-white.svg)',
					},
				},
			},
			'& input[type=radio]': {
				'& + label:before': {
					border: `2px solid ${colors.secondary}`,
					padding: 2,
					borderRadius: '50%',
				},
				'&:checked + label:before': {
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					backgroundImage: 'url(/static/images/icon-radio-orange.svg)',
				},
			},
			'& input[type=checkbox], & input[type=radio]': {
				width: 0,
				height: 0,
				opacity: 0,
				'& + label': {
					...fonts.xs,
					...fonts.karlaRegular,
					padding: '6px 0 6px 32px',
					width: '100%',
					cursor: 'pointer',
					position: 'relative',
					'&:before': {
						left: 0,
						width: 18,
						height: 18,
						top: '50%',
						content: '""',
						position: 'absolute',
						transform: 'translateY(-50%)',
					},
				},
			},
			'& input[type=checkbox][disabled], & input[type=radio][disabled]': {
				'& + label': {
					cursor: 'default',
					color: 'inherit',
					'&:before': {
						backgroundColor: colors.gray300,
						backgroundImage: null,
						border: 'none',
					},
				},
			},
		},
	},
};
