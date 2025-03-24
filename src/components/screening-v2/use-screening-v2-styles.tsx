import Color from 'color';
import { createUseThemedStyles } from '@/jss/theme';
import radioSelected from '@/assets/icons/screening-v2/radio-selected.svg';
import radioUnselected from '@/assets/icons/screening-v2/radio-unselected.svg';
import checkboxSelected from '@/assets/icons/screening-v2/checkbox-selected.svg';
import checkboxUnselected from '@/assets/icons/screening-v2/checkbox-unselected.svg';

export const useScreeningV2Styles = createUseThemedStyles((theme) => ({
	'@global': {
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
						backgroundColor: theme.colors.n100,
					},
					'&:after': {
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						content: '""',
						position: 'absolute',
						pointerEvents: 'none',
						borderRadius: 'inherit',
						border: `1px solid ${theme.colors.n100}`,
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
		},
	},
}));
