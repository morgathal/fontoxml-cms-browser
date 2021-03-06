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
import documentsManager from 'fontoxml-documents/documentsManager';
import t from 'fontoxml-localization/t';

import DocumentGridItem from './DocumentGridItem.jsx';
import DocumentListItem from './DocumentListItem.jsx';
import DocumentWithLinkSelectorPreview from './DocumentWithLinkSelectorPreview.jsx';
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
		title: t('Loading documents…'),
		message: null
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: t('FontoXML can’t open this folder. You can try again, or try a different folder.')
	},
	empty: {
		title: t('No results'),
		message: t('This folder does not contain files that can be opened with FontoXML.')
	},
	loadingPreview: {
		title: t('Loading document preview…'),
		message: null
	},
	previewError: {
		title: t('Can’t open this document'),
		message: t(
			'FontoXML can’t open this document. You can try again, or try a different document.'
		)
	}
};

function getSubmitModalData(itemToSubmit) {
	return {
		documentId: itemToSubmit.documentId,
		nodeId: itemToSubmit.nodeId
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(selectedItem && selectedItem.documentId && selectedItem.nodeId);
}

class DocumentWithLinkSelectorBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			documentId: PropTypes.string,
			insertOperationName: PropTypes.string,
			linkableElementsQuery: PropTypes.string.isRequired,
			modalIcon: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string,
			nodeId: PropTypes.string
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	handleKeyDown = event => {
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (!this.props.isSubmitButtonDisabled) {
					this.props.submitModal(getSubmitModalData(this.props.selectedItem));
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
			item={item}
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
			item={item}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	handleLoadIsDone = () => {
		this.props.onItemIsLoaded(this.props.selectedItem.id);
	};

	handleSubmitButtonClick = () =>
		this.props.submitModal(getSubmitModalData(this.props.selectedItem));

	render() {
		const {
			cancelModal,
			data: {
				browseContextDocumentId,
				linkableElementsQuery,
				modalIcon,
				modalPrimaryButtonLabel,
				modalTitle
			},
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
			<Modal size="m" isFullHeight={true} onKeyDown={this.handleKeyDown}>
				<ModalHeader icon={modalIcon} title={modalTitle || t('Select a link')} />

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
								selectedItem.id &&
								selectedItem.type !== 'folder' && (
									<ModalContent flexDirection="column">
										<DocumentWithLinkSelectorPreview
											linkableElementsQuery={linkableElementsQuery}
											onItemIsErrored={onItemIsErrored}
											onItemSelect={onItemSelect}
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
						label={modalPrimaryButtonLabel || t('Insert')}
						isDisabled={isSubmitButtonDisabled}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		const {
			data: { browseContextDocumentId, documentId, nodeId },
			onInitialSelectedItemIdChange,
			refreshItems
		} = this.props;

		if (documentId) {
			onInitialSelectedItemIdChange({
				id: documentsManager.getRemoteDocumentId(documentId),
				documentId,
				nodeId
			});
		}

		refreshItems(browseContextDocumentId, { id: null });
	}
}

DocumentWithLinkSelectorBrowserModal = withModularBrowserCapabilities(VIEWMODES.LIST)(
	DocumentWithLinkSelectorBrowserModal
);
DocumentWithLinkSelectorBrowserModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(DocumentWithLinkSelectorBrowserModal);

export default DocumentWithLinkSelectorBrowserModal;
