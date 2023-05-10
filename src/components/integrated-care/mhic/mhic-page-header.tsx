import React, { PropsWithChildren, ReactNode } from 'react';

interface MhicPageHeaderProps {
	title: string;
	description?: string | ReactNode;
	className?: string;
}

export const MhicPageHeader = ({ title, description, className, children }: PropsWithChildren<MhicPageHeaderProps>) => {
	return (
		<div className={className}>
			<div className="d-flex align-items-center justify-content-between">
				<h3 className="mb-0">{title}</h3>
				{children}
			</div>
			{description && <p className="mb-0 fs-large text-gray">{description}</p>}
		</div>
	);
};
