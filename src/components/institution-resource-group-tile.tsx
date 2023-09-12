import React from 'react';
import { Link } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';
import { InstitutionResourceGroup } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	headerWrapper: {
		borderRadius: 8,
		border: `1px solid ${theme.colors.border}`,
		marginBottom: 20,
		alignItems: 'center',
		display: 'flex',
		justifyContent: 'center',
		height: 200,
		background: ({ institutionResourceGroup }: InstitutionResourceTileProps) => {
			const bgColor = theme.colors[institutionResourceGroup.backgroundColorValueName] || theme.colors.p100;

			if (institutionResourceGroup.imageUrl) {
				return `${bgColor} url(${institutionResourceGroup.imageUrl}) no-repeat center center / cover`;
			}

			return bgColor;
		},
		color: ({ institutionResourceGroup }: InstitutionResourceTileProps) => {
			return theme.colors[institutionResourceGroup.textColorValueName] || theme.colors.p700;
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
					{!institutionResourceGroup.imageUrl && <h3 className="mb-0">{institutionResourceGroup.name}</h3>}
				</div>

				<h3 className="mb-2">{institutionResourceGroup.name}</h3>

				<div className="text-body" dangerouslySetInnerHTML={{ __html: institutionResourceGroup.description }} />
			</div>
		</Link>
	);
};

export default InstitutionResourceGroupTile;
