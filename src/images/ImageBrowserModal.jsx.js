import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import {
	Button,
	Flex,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader,
	Toast
} from 'fontoxml-vendor-fds/components';

import ImageGridItem from './ImageGridItem.jsx';
import ImageListItem from './ImageListItem.jsx';
import ImagePreview from './ImagePreview.jsx';
import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList.jsx';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs.jsx';
import ModalBrowserListOrGridViewMode, {
	viewModes
} from '../shared/ModalBrowserListOrGridViewMode.jsx';
import ModalBrowserPreview from '../shared/ModalBrowserPreview.jsx';
import ModalBrowserUploadButton from '../shared/ModalBrowserUploadButton.jsx';
import refreshItems from '../refreshItems.jsx';
import withModularBrowserCapabilities from '../withModularBrowserCapabilities.jsx';

const stateLabels = {
	loading: {
		title: t('Loading images…'),
		message: null
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: t('FontoXML can’t open this folder. You can try again, or try a different folder.')
	},
	empty: {
		title: t('No results'),
		message: t('This folder does not contain images that can be opened with FontoXML.')
	},
	loadingPreview: {
		title: t('Loading image preview…'),
		message: null
	},
	previewError: {
		title: t('Can’t open this image'),
		message: t('FontoXML can’t open this image. You can try again, or try a different image.')
	}
};

const uploadErrorMessages = {
	fileSizeTooLargeMessage: t(
		'This image is larger than 4 megabyte, please select another image or resize it and try again.'
	),
	serverErrorMessage: t('FontoXML can’t upload this image, please try again.')
};

class ImageBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			modalTitle: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			selectedImageId: PropTypes.string
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	submitModal = itemToSubmit => this.props.submitModal({ selectedImageId: itemToSubmit.id });

	handleFileAndFolderResultListItemSubmit = selectedItem => this.submitModal(selectedItem);

	handleRenderListItem = ({
		key,
		item,
		isSelected,
		isDisabled,
		onClick,
		onDoubleClick,
		onRef
	}) => (
		<ImageListItem
			{...this.props}
			key={key}
			item={item}
			isSelected={isSelected}
			isDisabled={isDisabled}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, item, isSelected, isDisabled, onClick, onDoubleClick }) => (
		<ImageGridItem
			{...this.props}
			key={key}
			item={item}
			isSelected={isSelected}
			isDisabled={isDisabled}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	handleRenderPreview = ({ dataUrl, heading, properties }) => (
		<ImagePreview dataUrl={dataUrl} heading={heading} properties={properties} />
	);

	handleSubmitButtonClick = () => this.submitModal(this.state.selectedItem);

	render() {
		const {
			breadcrumbItems,
			cancelModal,
			data: {
				browseContextDocumentId,
				dataProviderName,
				modalTitle,
				modalPrimaryButtonLabel
			},
			onUpdateViewMode,
			request,
			selectedItem,
			viewMode
		} = this.props;
		const hasBreadcrumbItems = breadcrumbItems.length > 0;

		return (
			<Modal size="l" isFullHeight={true}>
				<ModalHeader title={modalTitle || t('Select an image')} />

				<ModalBody>
					<ModalContent flexDirection="column">
						<ModalContentToolbar
							justifyContent={hasBreadcrumbItems ? 'space-between' : 'flex-end'}
						>
							{hasBreadcrumbItems && (
								<ModalBrowserHierarchyBreadcrumbs
									{...this.props}
									browseContextDocumentId={browseContextDocumentId}
									dataProviderName={dataProviderName}
								/>
							)}

							<Flex flex="none" spaceSize="m">
								<ModalBrowserUploadButton
									{...this.props}
									browseContextDocumentId={browseContextDocumentId}
									dataProviderName={dataProviderName}
									uploadErrorMessages={uploadErrorMessages}
								/>

								<ModalBrowserListOrGridViewMode
									onUpdateViewMode={onUpdateViewMode}
									viewMode={viewMode}
								/>
							</Flex>
						</ModalContentToolbar>

						{request.type === 'upload' &&
						request.error && (
							<ModalContent flex="none" paddingSize="m">
								<Toast
									connotation="error"
									icon="exclamation-triangle"
									content={request.error}
								/>
							</ModalContent>
						)}

						<ModalContent flexDirection="row">
							<ModalContent flexDirection="column">
								<ModalBrowserFileAndFolderResultList
									{...this.props}
									browseContextDocumentId={browseContextDocumentId}
									dataProviderName={dataProviderName}
									onItemSubmit={this.handleFileAndFolderResultListItemSubmit}
									renderListItem={this.handleRenderListItem}
									renderGridItem={this.handleRenderGridItem}
									stateLabels={stateLabels}
								/>
							</ModalContent>

							{this.props.selectedItem &&
							this.props.selectedItem.type !== 'folder' && (
								<ModalContent flexDirection="column">
									<ModalBrowserPreview
										{...this.props}
										stateLabels={stateLabels}
										renderPreview={this.handleRenderPreview}
									/>
								</ModalContent>
							)}
						</ModalContent>
					</ModalContent>
				</ModalBody>

				<ModalFooter>
					<Button type="default" label={t('Cancel')} onClick={cancelModal} />

					<Button
						type="primary"
						label={modalPrimaryButtonLabel || t('Insert')}
						isDisabled={selectedItem === null || selectedItem.type === 'folder'}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		const { data: { selectedImageId }, onUpdateInitialSelectedFileId } = this.props;
		if (selectedImageId) {
			onUpdateInitialSelectedFileId(selectedImageId);
		}

		refreshItems(
			this.props.breadcrumbItems,
			this.props.data.browseContextDocumentId,
			this.props.data.dataProviderName,
			{ id: null },
			selectedImageId || null,
			this.props.onItemSelect,
			onUpdateInitialSelectedFileId,
			this.props.onUpdateItems,
			this.props.onUpdateRequest,
			this.props.selectedItem
		);
	}
}

ImageBrowserModal = withModularBrowserCapabilities(ImageBrowserModal, viewModes[1] /* grid*/);

export default ImageBrowserModal;
