import React from 'react';
import { byPrefixAndName, IconName, IconPrefix } from '@awesome.me/kit-c75e843088/icons';

type SvgIconProps = {
	kit: IconPrefix;
	icon: IconName;
	title?: string;
	size?: number | string;
	className?: string;
	style?: React.CSSProperties;
};

const SvgIcon = ({ kit, icon, title, size, className, style }: SvgIconProps) => {
	const iconPack = byPrefixAndName[kit];

	if (!iconPack) {
		console.warn(`SvgIcon: ${kit} is not a valid kit.`);
		return null;
	}

	const iconDefinition = iconPack[icon];

	if (!iconDefinition) {
		console.warn(`SvgIcon: ${icon} is not a valid icon in the ${kit} kit.`);
		return null;
	}

	const [width, height, , , pathData] = iconDefinition.icon;
	const titleId = title ? `${icon}-title` : undefined;

	return (
		<svg
			width={size ?? 24}
			height={size ?? 24}
			viewBox={`0 0 ${width} ${height}`}
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			style={{ overflow: 'visible', ...style }}
			role={title ? 'img' : undefined}
			aria-hidden={title ? undefined : 'true'}
			aria-labelledby={titleId}
			focusable="false"
		>
			{title && <title id={titleId}>{title}</title>}
			<path d={typeof pathData === 'string' ? pathData : pathData[0]} />
		</svg>
	);
};

export const maskImageSvg = ({ kit, icon }: { kit: IconPrefix; icon: IconName }) => {
	const iconPack = byPrefixAndName[kit];

	if (!iconPack) {
		console.warn(`SvgIcon: ${kit} is not a valid kit.`);
		return null;
	}

	const iconDefinition = iconPack[icon];

	if (!iconDefinition) {
		console.warn(`SvgIcon: ${icon} is not a valid icon in the ${kit} kit.`);
		return null;
	}

	const [width, height, , , pathData] = iconDefinition.icon;

	const makePaths = (d: string | string[]) => {
		return Array.isArray(d) ? d.map((p) => `<path d="${p}"/>`).join('') : `<path d="${d}"/>`;
	};

	const svg = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 ${width} ${height}"
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
		>
			${makePaths(pathData)}
		</svg>
	`;
	const svgData = encodeURIComponent(svg);

	return `url(data:image/svg+xml;utf8,${svgData})`;
};

export default SvgIcon;
