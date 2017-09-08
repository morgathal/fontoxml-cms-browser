import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	SpinnerIcon,
	StateMessage,
	VirtualGrid,
	VirtualList
} from 'fontoxml-vendor-fds/components';

import refreshItems from '../refreshItems.jsx';

class ModalBrowserFileAndFolderResultList extends Component {
	static defaultProps = {
		breadcrumbItems: [],
		browseContextDocumentId: null,
		initialSelectedItemId: null,
		onItemSubmit: () => {},
		selectedItem: null
	};

	static propTypes = {
		browseContextDocumentId: PropTypes.string,
		dataProviderName: PropTypes.string.isRequired,
		onItemSubmit: PropTypes.func,
		renderGridItem: PropTypes.func.isRequired,
		renderListItem: PropTypes.func.isRequired,
		stateLabels: PropTypes.shape({
			browseError: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			empty: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			loading: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired
		}).isRequired,

		// from withModularBrowserCapabilities
		breadcrumbItems: PropTypes.array,
		initialSelectedItemId: PropTypes.string,
		items: PropTypes.array.isRequired,
		onItemSelect: PropTypes.func.isRequired,
		onUpdateInitialSelectedItemId: PropTypes.func.isRequired,
		onUpdateItems: PropTypes.func.isRequired,
		onUpdateRequest: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired,
		selectedItem: PropTypes.object,
		viewMode: PropTypes.object.isRequired
	};

	handleItemDoubleClick = item =>
		item.type === 'folder'
			? refreshItems(
					this.props.breadcrumbItems,
					this.props.browseContextDocumentId,
					this.props.dataProviderName,
					item,
					this.props.initialSelectedItemId,
					this.props.onItemSelect,
					this.props.onUpdateInitialSelectedItemId,
					this.props.onUpdateItems,
					this.props.onUpdateRequest,
					this.props.selectedItem
				)
			: this.props.onItemSubmit(item);

	render() {
		const {
			items,
			onItemSelect,
			renderGridItem,
			renderListItem,
			request,
			selectedItem,
			stateLabels,
			viewMode
		} = this.props;

		if ((request.type === 'browse' || request.type === 'upload') && request.busy) {
			return <StateMessage visual={<SpinnerIcon />} {...stateLabels.loading} />;
		}

		if (request.type === 'browse' && request.error) {
			return (
				<StateMessage
					connotation="warning"
					visual="exclamation-triangle"
					{...stateLabels.browseError}
				/>
			);
		}

		if (items.length === 0) {
			return <StateMessage visual="folder-open-o" {...stateLabels.empty} />;
		}

		if (viewMode.name === 'list') {
			return (
				<VirtualList
					estimatedItemHeight={30}
					items={items}
					onItemClick={onItemSelect}
					onItemDoubleClick={this.handleItemDoubleClick}
					paddingSize="m"
					renderItem={renderListItem}
					selectedItems={selectedItem === null ? [] : [selectedItem]}
				/>
			);
		}

		// else the viewMode.name is 'grid'
		return (
			<VirtualGrid
				estimatedRowHeight={86}
				items={items}
				onItemClick={onItemSelect}
				onItemDoubleClick={this.handleItemDoubleClick}
				paddingSize="m"
				renderItem={renderGridItem}
				selectedItems={selectedItem === null ? [] : [selectedItem]}
			/>
		);
	}
}

export default ModalBrowserFileAndFolderResultList;