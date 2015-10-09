import React from 'react';
import ReactDOM from 'react-dom';
import PrioPlus, {Item} from './index';

ReactDOM.render(
	<PrioPlus>
		<Item>Item0</Item>
		<Item>Item1</Item>
		<Item>Item2</Item>
		<Item>Item3</Item>
		<Item>Item4</Item>
		<Item>Item5</Item>
		<Item>Item6</Item>
	</PrioPlus>
, document.querySelector('.js_prioplus'));
