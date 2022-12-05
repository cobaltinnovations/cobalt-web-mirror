import classNames from 'classnames';
import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { ReactComponent as CopyIcon } from '@/assets/icons/copy.svg';

interface CopyToClipboardButtonProps extends ButtonProps {
	text?: string;
	iconSize?: number;
}

export const CopyToClipboardButton = ({
	text,
	iconSize = 24,
	className,
	...buttonProps
}: CopyToClipboardButtonProps) => {
	if (!navigator?.clipboard) {
		return null;
	}

	return (
		<Button
			variant="primary"
			size="sm"
			onClick={() => {
				if (!text) {
					return;
				}

				navigator.clipboard.writeText(text);
			}}
			className={classNames('px-2', className)}
			{...buttonProps}
		>
			<CopyIcon width={iconSize} height={iconSize} />
		</Button>
	);
};
