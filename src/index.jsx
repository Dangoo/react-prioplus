import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

function getClientRect (node) {
	let box = node.getBoundingClientRect();
	let computedStyle = window.getComputedStyle(node);
	box.outerWidth = box.width + parseInt(computedStyle.marginLeft, 10) + parseInt(computedStyle.marginRight, 10);
	box.outerHeight = box.height + parseInt(computedStyle.marginTop, 10) + parseInt(computedStyle.marginBottom, 10);
	return box;
}

function shuffle (array, predicate) {
	return array.reduce((acc, item, index) => {
		console.log(item);
		if (predicate(item, index)){
			return [item, ...acc];
		}
		return acc.concat(item);
	}, [])
}

/*var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;*/

export class Item extends React.Component {
	handleClick = () => {
		this.props.onClick();
	}
	render () {
		let cn = classNames('item', {'active': this.props.isActive},this.props.className);
		return (
			<li className={cn} onClick={this.handleClick} ref={this.props.index}>{this.props.children}</li>
		);
	}
}

export class ItemList extends React.Component {
	render () {
		let cn = classNames('itemList', this.props.className);
		return (
			<ul className={cn}>
				{this.props.children}
			</ul>
		);
	}
}

export default class PrioPlus extends React.Component {
	state = {
		overlayOpen: false,
		items: []
	};

	parentNode = '';

	toggleOverlay = (e) => {
		this.setState( { overlayOpen: !this.state.overlayOpen } );
	}

	countElements = (items, space = 0) => {
		let count = 0;

		for(var i = 0; i < items.length; i++){
			const item = items[i];
			if (item.props.clientRect) {
				space -= item.props.clientRect.outerWidth;
				if(space < 0) {
					break;
				}
			}
			count = i + 1;
		};
		return count;
	}

	splitItems = (items, splitCount = items.length) => {
		const visibleItems = items.slice(0, splitCount);
		const storedItems = items.slice(splitCount);

		return {
			visibleItems: visibleItems,
			storedItems: storedItems
		}
	}

	initItems = (parentNode, children = []) => {
		const childNodes = [].slice.call(parentNode.children);
		let itemOrder = [];

		const items = children.map((item, index) => {
			return React.cloneElement(item, {
				key: index,
				clientRect: getClientRect(childNodes[index]),
				onClick: this.handleSwitch.bind(this, item, index)
			});
		});

		const order = items.map((item, index)=>{
			return index;
		})

		this.setState({items: items, order: order});
	}

	toggleChildActive = (item, index, array) => {
		let tempArray = array.slice();
		tempArray[index] = React.cloneElement(array[index], {isActive: !item.props.isActive});
		return tempArray;
	}

	handleSwitch = (item, i) => {
		const newOrder = shuffle(this.state.order, (item) => item === i);

		const updatedItems = this.toggleChildActive(item, i, this.state.items);
		console.log(updatedItems);

		const newState = shuffle(updatedItems, (item, index) => {
			return this.state.order.indexOf(i) === index;
		});

		this.setState({
			items: newState,
			order: newOrder
		})
	}

	handleResize = (e) => {
		this.forceUpdate();
	}

	componentDidMount () {
		this.parentNode = ReactDOM.findDOMNode(this.refs.itemList);
		this.initItems(this.parentNode, this.props.children);

		window.addEventListener('resize', this.handleResize);
	}

	componentWillUnmount () {
		window.removeEventListener('resize', this.handleResize);
	}

	render () {
		const parentNodeWidth = this.parentNode && parseInt(window.getComputedStyle(this.parentNode).width);
		let items = {};

		if (this.state.items.length) {
			const count = this.countElements(this.state.items, parentNodeWidth);
			items = this.splitItems(this.state.items, count);
		}

		const cn = classNames('prioPlus', this.props.classNames);
		const cnButton = classNames('listTrigger', {'active': this.state.overlayOpen});
		const cnList = classNames({'open': this.state.overlayOpen});

		return (
			<div className={cn}>
				<ItemList ref="itemList">
					{items.visibleItems || this.props.children}
				</ItemList>
				<button className={cnButton} onClick={this.toggleOverlay}>
					<ItemList className={cnList}>
						{items.storedItems}
					</ItemList>
				</button>
			</div>
		);
	}
}
