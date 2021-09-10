import React, { FC } from 'react';

export const TableBody: FC = React.memo(({ children }) => {
	return <tbody>{children}</tbody>;
});
