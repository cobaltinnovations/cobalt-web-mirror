import { createUseStyles } from 'react-jss';
import colors from '@/jss/colors';

const usePICCobaltStyles = createUseStyles({
	radioButton: {
		width: '100%',
		paddingTop: '0.5em',
		paddingBottom: '0.5em',
		paddingRight: '1em',
		paddingLeft: '1em',
		height: '3.25em',
		alignItems: 'center',
		'& label': {
			border: '2px solid' + colors.background,
			height: '20px',
			width: '20px',
			borderRadius: '50%',
			marginTop: '0.5em',
			marginBottom: '0.5em',
			float: 'left',
			display: 'flex',
		},
		'& input[type="checkbox"]': {
			display: 'none',
			width: '0',
			height: '0',
			marginLeft: '0',
		},
		'& input[type="checkbox"]:checked + label': {
			background: colors.primary,
			color: colors.white,
		},
		'& input[type="radio"]': {
			display: 'none',
			width: '0',
			height: '0',
			marginLeft: '0',
		},
		textAlign: 'left',
		display: 'flex',
	},
	centeredButton: {
		extend: 'radioButton',
		justifyContent: 'center',
		textAlign: 'center',
		'&.active': {
			background: colors.primary,
			color: colors.white,
		},
	},
	radioButtonText: {
		fontFamily: 'Nunito Sans',
		justifyContent: 'center',
		marginLeft: '0.75em',
		marginTop: '0.5em',
		marginBottom: '0.5em',
	},
	hideCheckbox: {
		'& input': {
			display: 'none',
		},
	},
	low: {
		padding: '0.01px 9px',
		background: colors.success,
		borderRadius: '50%',
		transform: 'scale(0.1, 0.1)',
	},
	medium: {
		padding: '0.01px 9px',
		background: colors.secondary,
		borderRadius: '50%',
		transform: 'scale(0.1, 0.1)',
	},
	high: {
		padding: '0.01px 9px',
		background: colors.danger,
		borderRadius: '50%',
		transform: 'scale(0.1, 0.1)',
	},
	cursor: {
		cursor: 'pointer',
	},
});

export default usePICCobaltStyles;
