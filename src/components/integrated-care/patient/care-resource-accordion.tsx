import { createUseThemedStyles } from '@/jss/theme';
import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	button: {
		border: 0,
		padding: 16,
		display: 'flex',
		appearance: 'none',
		alignItems: 'center',
		background: 'transparent',
		justifyContent: 'between',
		backgroundColor: theme.colors.n75,
	},
}));

export const CareResourceAccordion = () => {
	const classes = useStyles();
	const [show, setShow] = useState(true);

	return (
		<div>
			<button
				className={classes.button}
				onClick={() => {
					setShow(!show);
				}}
			>
				Resource Name
			</button>
			<Collapse in={show}>
				<div>
					<div>
						<p className="m-0">description</p>
					</div>
				</div>
			</Collapse>
		</div>
	);
};
