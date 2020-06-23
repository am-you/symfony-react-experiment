import React from 'react';

const ItemList = ({ name, data, symbol, ...rest }) => {
	return (
		<li className="list-items" {...rest}>
			{name}
			<span className="list-item">
				{data}
				{symbol && data > 0 ? <small>{symbol}</small> : ''}
			</span>
		</li>
	)
}

export default ItemList;
