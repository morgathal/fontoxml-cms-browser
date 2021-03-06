import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader
} from 'fds/components';
import t from 'fontoxml-localization/t';

import DocumentGridItem from './DocumentGridItem.jsx';
import DocumentListItem from './DocumentListItem.jsx';
import DocumentPreview from './DocumentPreview.jsx';
import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList.jsx';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs.jsx';
import ModalBrowserListOrGridViewMode, {
	VIEWMODES
} from '../shared/ModalBrowserListOrGridViewMode.jsx';
import ModalBrowserPagination from '../shared/ModalBrowserPagination.jsx';
import withInsertOperationNameCapabilities from '../withInsertOperationNameCapabilities.jsx';
import withModularBrowserCapabilities from '../withModularBrowserCapabilities.jsx';

const stateLabels = {
	loading: {
		title: t('Loading templates…'),
		message: null
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: null
	},
	empty: {
		title: t('No results'),
		message: t('This folder does not contain files that can be opened with FontoXML.')
	},
	loadingPreview: {
		title: t('Loading template preview…'),
		message: null
	},
	previewError: {
		title: t('Can’t open this template'),
		message: t(
			'FontoXML can’t open this template. You can try again, or try a different template.'
		)
	}
};

function getSubmitModalData(itemToSubmit) {
	return {
		remoteDocumentId: itemToSubmit.id,
		label: itemToSubmit.label
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(selectedItem && selectedItem.type !== 'folder');
}

class DocumentTemplateBrowserModal extends Component {
	static defaultProps = {
		remoteDocumentId: null
	};

	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			insertOperationName: PropTypes.string,
			modalIcon: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string
		}).isRequired,
		remoteDocumentId: PropTypes.string,
		submitModal: PropTypes.func.isRequired
	};

	handleKeyDown = event => {
		const { selectedItem } = this.props;
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (!this.props.isSubmitButtonDisabled) {
					this.props.submitModal(getSubmitModalData(selectedItem));
				}
				break;
		}
	};

	handleRenderListItem = ({ key, item, onClick, onDoubleClick, onRef }) => (
		<DocumentListItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={this.props.selectedItem && this.props.selectedItem.id === item.id}
			item={item.icon || item.type === 'folder' ? item : { ...item, icon: 'file-o' }}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, item, onClick, onDoubleClick }) => (
		<DocumentGridItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={this.props.selectedItem && this.props.selectedItem.id === item.id}
			item={item.icon || item.type === 'folder' ? item : { ...item, icon: 'file-o' }}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	handleFileAndFolderResultListItemSubmit = selectedItem => {
		this.props.determineAndHandleItemSubmitForSelectedItem(selectedItem);
	};

	handleLoadIsDone = () => {
		this.props.onItemIsLoaded(this.props.selectedItem.id);
	};

	handleSubmitButtonClick = () =>
		this.props.submitModal(getSubmitModalData(this.props.selectedItem));

	render() {
		const {
			cancelModal,
			data: { browseContextDocumentId, modalIcon, modalPrimaryButtonLabel, modalTitle },
			hierarchyItems,
			isSubmitButtonDisabled,
			items,
			onItemIsErrored,
			onItemSelect,
			onPageBackward,
			onPageForward,
			onViewModeChange,
			refreshItems,
			request,
			selectedItem,
			viewMode
		} = this.props;
		const hasHierarchyItems = hierarchyItems.length > 0;

		return (
			<Modal size="m" onKeyDown={this.handleKeyDown}>
				<ModalHeader icon={modalIcon} title={modalTitle || t('Select a template')} />

				<ModalBody>
					<ModalContent flexDirection="column">
						<ModalContentToolbar
							justifyContent={hasHierarchyItems ? 'space-between' : 'flex-end'}
						>
							{hasHierarchyItems && (
								<ModalBrowserHierarchyBreadcrumbs
									browseContextDocumentId={browseContextDocumentId}
									hierarchyItems={hierarchyItems}
									refreshItems={refreshItems}
									request={request}
								/>
							)}

							<ModalBrowserListOrGridViewMode
								onViewModeChange={onViewModeChange}
								viewMode={viewMode}
							/>
						</ModalContentToolbar>

						<ModalContent flexDirection="row">
							<ModalContent flexDirection="column">
								<ModalBrowserFileAndFolderResultList
									browseContextDocumentId={browseContextDocumentId}
									items={items}
									onItemSelect={onItemSelect}
									onItemSubmit={this.handleFileAndFolderResultListItemSubmit}
									refreshItems={refreshItems}
									renderListItem={this.handleRenderListItem}
									renderGridItem={this.handleRenderGridItem}
									request={request}
									selectedItem={selectedItem}
									stateLabels={stateLabels}
									viewMode={viewMode}
								/>
							</ModalContent>

							{selectedItem &&
								selectedItem.type !== 'folder' && (
									<ModalContent flexDirection="column">
										<DocumentPreview
											onItemIsErrored={onItemIsErrored}
											onLoadIsDone={this.handleLoadIsDone}
											selectedItem={selectedItem}
											stateLabels={stateLabels}
										/>
									</ModalContent>
								)}
						</ModalContent>
					</ModalContent>

					<ModalBrowserPagination
						handlePageBackward={onPageBackward}
						handlePageForward={onPageForward}
					/>

				</ModalBody>

				<ModalFooter>
					<Button type="default" label={t('Cancel')} onClick={cancelModal} />

					<Button
						type="primary"
						label={modalPrimaryButtonLabel || t('Select')}
						isDisabled={isSubmitButtonDisabled}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		const {
			data: { browseContextDocumentId },
			onInitialSelectedItemIdChange,
			refreshItems,
			remoteDocumentId
		} = this.props;

		if (remoteDocumentId) {
			onInitialSelectedItemIdChange({ id: remoteDocumentId });
		}

		refreshItems(browseContextDocumentId, { id: null });
	}
}

DocumentTemplateBrowserModal = withModularBrowserCapabilities(VIEWMODES.LIST)(
	DocumentTemplateBrowserModal
);
DocumentTemplateBrowserModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(DocumentTemplateBrowserModal);

export default DocumentTemplateBrowserModal;
