import Color from 'color';
import { createUseThemedStyles } from '@/jss/theme';
import radioSelected from '@/assets/icons/screening-v2/radio-selected.svg';
import radioUnselected from '@/assets/icons/screening-v2/radio-unselected.svg';
import checkboxSelected from '@/assets/icons/screening-v2/checkbox-selected.svg';
import checkboxUnselected from '@/assets/icons/screening-v2/checkbox-unselected.svg';
import checkCircleFill from '@/assets/icons/screening-v2/check-circle-fill.svg';
import cancelFill from '@/assets/icons/screening-v2/cancel-fill.svg';
import backArrowIcon from '@/assets/icons/icon-back-arrow.svg';

export const useScreeningV2Styles = createUseThemedStyles((theme) => ({
	'@global': {
		'button.screening-v2__answer': {
			border: 0,
			width: '100%',
			display: 'flex',
			marginBottom: 8,
			borderRadius: 26,
			textAlign: 'left',
			appearance: 'none',
			position: 'relative',
			...theme.fonts.default,
			color: theme.colors.n900,
			padding: '16px 68px 16px 20px',
			backgroundColor: theme.colors.n0,
			boxShadow: '0px 1px 0px 0px rgba(26, 26, 26, 0.07), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)',
			'&:before': {
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				content: '""',
				borderWidth: 1,
				position: 'absolute',
				borderStyle: 'solid',
				pointerEvents: 'none',
				borderRadius: 'inherit',
				transition: '100ms all',
				borderColor: theme.colors.n100,
			},
			'&:after': {
				right: 24,
				width: 24,
				height: 24,
				top: '50%',
				opacity: 0,
				maskSize: 24,
				content: '""',
				position: 'absolute',
				pointerEvents: 'none',
				maskPosition: 'center',
				maskRepeat: 'no-repeat',
				transition: '200ms all',
				maskImage: `url(${backArrowIcon})`,
				backgroundColor: theme.colors.p500,
				transform: 'translate(-50%, -50%) rotate(180deg)',
			},
			'&:hover': {
				'&:before': {
					borderWidth: '2px !important',
					borderColor: `${theme.colors.p500} !important`,
				},
				'&:after': {
					opacity: 1,
					transform: 'translate(0, -50%) rotate(180deg)',
				},
			},
			'&:focus': {
				outline: 'none',
				boxShadow: `0 0 0 4px ${Color(theme.colors.p500).alpha(0.24).string()}`,
			},
			'&--checked': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.p500,
				'&:before': {
					borderWidth: '2px !important',
					borderColor: `${theme.colors.p500} !important`,
				},
				'&:after': {
					backgroundColor: theme.colors.n0,
				},
			},
		},
		'.screening-v2__answer': {
			marginBottom: 8,
			position: 'relative',
			'& input[type=radio], & input[type=checkbox]': {
				top: 0,
				left: 0,
				width: 0,
				height: 0,
				opacity: 0,
				appearance: 'none',
				position: 'absolute',
				'& + label': {
					width: '100%',
					display: 'flex',
					borderRadius: 26,
					cursor: 'pointer',
					padding: '16px 20px',
					position: 'relative',
					...theme.fonts.default,
					backgroundColor: theme.colors.n0,
					boxShadow: '0px 1px 0px 0px rgba(26, 26, 26, 0.07), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)',
					'&:before': {
						width: 20,
						height: 20,
						maskSize: 20,
						content: '""',
						flexShrink: 0,
						marginRight: 16,
						display: 'inline-block',
						maskPosition: 'center',
						maskRepeat: 'no-repeat',
						transition: '200ms all',
						backgroundColor: theme.colors.n100,
					},
					'&:after': {
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						content: '""',
						borderWidth: 1,
						position: 'absolute',
						borderStyle: 'solid',
						pointerEvents: 'none',
						borderRadius: 'inherit',
						transition: '100ms all',
						borderColor: theme.colors.n100,
					},
					'&:hover': {
						backgroundColor: theme.colors.n50,
						'&:before': {
							backgroundColor: theme.colors.n300,
						},
						'&:after': {
							borderColor: theme.colors.n300,
						},
					},
				},
				'&:focus': {
					'& + label': {
						outline: 'none',
						boxShadow: `0 0 0 4px ${Color(theme.colors.p500).alpha(0.24).string()}`,
					},
				},
				'&:checked': {
					'& + label': {
						'&:before': {
							backgroundColor: theme.colors.p500,
						},
						'&:hover': {
							'&:before': {
								backgroundColor: theme.colors.p700,
							},
						},
					},
				},
			},
			'& input[type=radio] + label:before': {
				maskImage: `url(${radioUnselected})`,
			},
			'& input[type=radio]:checked + label:before': {
				maskImage: `url(${radioSelected})`,
			},
			'& input[type=checkbox] + label:before': {
				maskImage: `url(${checkboxUnselected})`,
			},
			'& input[type=checkbox]:checked + label:before': {
				maskImage: `url(${checkboxSelected})`,
			},
			'&--correct': {
				'& input[type=radio], & input[type=checkbox]': {
					'& + label:before': {
						maskImage: `url(${checkCircleFill}) !important`,
						backgroundColor: `${theme.colors.s500} !important`,
					},
				},
			},
			'&--incorrect': {
				'& input[type=radio], & input[type=checkbox]': {
					'& + label:before': {
						maskImage: `url(${cancelFill}) !important`,
						backgroundColor: `${theme.colors.n500} !important`,
					},
				},
			},
			'&--default': {
				'& input[type=radio], & input[type=checkbox]': {
					'& + label:after': {
						borderWidth: '2px !important',
						borderColor: `${theme.colors.n100} !important`,
					},
				},
			},
			'&--success': {
				'& input[type=radio], & input[type=checkbox]': {
					'& + label:after': {
						borderWidth: '2px !important',
						borderColor: `${theme.colors.s500} !important`,
					},
				},
			},
			'&--danger': {
				'& input[type=radio], & input[type=checkbox]': {
					'& + label:after': {
						borderWidth: '2px !important',
						borderColor: `${theme.colors.d500} !important`,
					},
				},
			},
		},
	},
}));
