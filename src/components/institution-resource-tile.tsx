import React from 'react';
import { Link } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	imageOuter: {
		borderRadius: 8,
		marginBottom: 20,
		overflow: 'hidden',
		paddingBottom: '66.66%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n500,
	},
}));

interface InstitutionResourceTileProps {
	imageUrl: string;
	to: string;
	title: string;
	description: string;
}

const InstitutionResourceTile = ({ imageUrl, to, title, description }: InstitutionResourceTileProps) => {
	const classes = useStyles();

	return (
		<div>
			<div className={classes.imageOuter} style={{ backgroundImage: `url(${imageUrl})` }} />
			<div>
				<h3 className="mb-2">
					<Link to={to} className="text-decoration-none">
						{title}
					</Link>
				</h3>
				<p className="mb-0 fs-large">{description}</p>
			</div>
		</div>
	);
};

export default InstitutionResourceTile;
