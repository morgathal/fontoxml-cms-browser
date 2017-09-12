import PropTypes from 'prop-types';
import React, { Component } from 'react';

import documentsManager from 'fontoxml-documents/documentsManager';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import NodePreviewWithLinkSelector from 'fontoxml-fx/NodePreviewWithLinkSelector.jsx';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class DocumentWithLinkSelectorPreview extends Component {
	static defaultProps = {
		initialNodeId: null,
		initialSelectedItemId: null,
		selectedItem: null
	};

	static propTypes = {
		linkableElementsQuery: PropTypes.string.isRequired,
		initialNodeId: PropTypes.string,
		stateLabels: PropTypes.shape({
			previewError: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			loadingPreview: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired
		}).isRequired,

		// from withModularBrowserCapabilities
		initialSelectedItemId: PropTypes.string,
		loadItem: PropTypes.func.isRequired,
		onItemSelect: PropTypes.func.isRequired,
		selectedItem: PropTypes.object
	};

	isMountedInDOM = false;

	state = { isErrored: false, isLoading: true };

	handleLoadDocumentId = documentId => {
		if (!this.isMountedInDOM) {
			return;
		}

		let nodeId = getNodeId(documentsManager.getDocumentNode(documentId).documentElement);
		if (
			this.props.initialNodeId !== null &&
			this.props.initialSelectedItemId === this.props.selectedItem.id
		) {
			nodeId = this.props.initialNodeId;
		}

		this.props.onItemSelect({ ...this.props.selectedItem, documentId, nodeId });
		this.setState({ isErrored: false, isLoading: false });
	};

	handleLoadError = error => {
		if (!error) {
			return;
		}

		if (this.isMountedInDOM) {
			this.setState({ isErrored: true, isLoading: false });
		}
	};

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.selectedItem.id === this.props.selectedItem.id &&
			nextProps.selectedItem.nodeId
		) {
			return;
		}

		this.setState({ isErrored: false, isLoading: true });

		this.props
			.loadItem(nextProps.selectedItem.id)
			.then(this.handleLoadDocumentId, this.handleLoadError);
	}

	handleSelectedNodeChange = nodeId =>
		this.props.onItemSelect({ ...this.props.selectedItem, nodeId });

	render() {
		const { linkableElementsQuery, selectedItem, stateLabels } = this.props;

		if (this.state.isErrored) {
			return (
				<StateMessage
					connotation="warning"
					paddingSize="m"
					visual="exclamation-triangle"
					{...stateLabels.previewError}
				/>
			);
		}

		if (this.state.isLoading) {
			return (
				<StateMessage
					paddingSize="m"
					visual={<SpinnerIcon />}
					{...stateLabels.loadingPreview}
				/>
			);
		}

		return (
			<NodePreviewWithLinkSelector
				documentId={selectedItem.documentId}
				onSelectedNodeChange={this.handleSelectedNodeChange}
				selector={linkableElementsQuery}
				selectedNodeId={selectedItem.nodeId}
			/>
		);
	}

	componentDidMount() {
		this.isMountedInDOM = true;

		this.props
			.loadItem(this.props.selectedItem.id)
			.then(this.handleLoadDocumentId, this.handleLoadError);
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default DocumentWithLinkSelectorPreview;
