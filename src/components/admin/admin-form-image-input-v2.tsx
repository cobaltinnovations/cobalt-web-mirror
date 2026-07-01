import React, { FC, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';

import ImageRepository from '@/components/image-repository/image-repository';
import type { ImageModel } from '@/lib/models';

export interface AdminFormImageInputV2Props {
	value?: ImageModel;
	className?: string;
	buttonClassName?: string;
	disabled?: boolean;
	onChange(image?: ImageModel): void;
}

export const AdminFormImageInputV2: FC<AdminFormImageInputV2Props> = ({
	value,
	className,
	buttonClassName,
	disabled = false,
	onChange,
}) => {
	const [showImageRepository, setShowImageRepository] = useState(false);

	const handleImageSelect = useCallback(
		(image: ImageModel) => {
			onChange(image);
		},
		[onChange]
	);

	const handleClearImage = useCallback(() => {
		onChange(undefined);
	}, [onChange]);

	return (
		<>
			<div className={className}>
				{value ? (
					<>
						<img
							src={value.url}
							className="mb-3 w-100 d-block"
							alt={value.imageAltText ?? value.filename}
						/>
						<Button type="button" variant="outline-primary" onClick={handleClearImage} disabled={disabled}>
							Clear Image
						</Button>
					</>
				) : (
					<Button
						type="button"
						variant="primary"
						className={buttonClassName}
						onClick={() => {
							setShowImageRepository(true);
						}}
						disabled={disabled}
					>
						Add Image
					</Button>
				)}
			</div>

			<ImageRepository
				show={showImageRepository}
				onHide={() => {
					setShowImageRepository(false);
				}}
				onImageSelect={handleImageSelect}
			/>
		</>
	);
};
