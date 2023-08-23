import React from 'react';
import { Link, To } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';
import { COLOR_IDS, InstitutionResourceGroup } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	headerWrapper: {
		borderRadius: 8,
		marginBottom: 20,
		alignItems: 'center',
		display: 'flex',
		justifyContent: 'center',
		height: 200,
		backgroundColor: ({ institutionResourceGroup }: InstitutionResourceTileProps) => {
			switch (institutionResourceGroup.colorId) {
				case COLOR_IDS.BRAND_PRIMARY:
				default:
					return theme.colors.p100;
			}
		},
		color: ({ institutionResourceGroup }: InstitutionResourceTileProps) => {
			switch (institutionResourceGroup.colorId) {
				case COLOR_IDS.BRAND_PRIMARY:
				default:
					return theme.colors.p700;
			}
		},
	},
}));

interface InstitutionResourceTileProps {
	institutionResourceGroup: InstitutionResourceGroup;
}

const InstitutionResourceGroupTile = ({ institutionResourceGroup }: InstitutionResourceTileProps) => {
	const classes = useStyles({ institutionResourceGroup });

	return (
		<Link
			to={{
				pathname: '/institution-resources/' + institutionResourceGroup.urlName,
			}}
			className="text-decoration-none"
		>
			<div>
				<div className={classes.headerWrapper}>
					<h3 className="mb-0">{institutionResourceGroup.name}</h3>
				</div>

				<div dangerouslySetInnerHTML={{ __html: institutionResourceGroup.description }}></div>
			</div>
		</Link>
	);
};

export default InstitutionResourceGroupTile;
