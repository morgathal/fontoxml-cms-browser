import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from 'fontoxml-vendor-fds/components';

import ImageGridItem from './ImageGridItem.jsx';
import ImageListItem from './ImageListItem.jsx';
import ModalBrowserFileAndFolderResultList from '../../ModalBrowserFileAndFolderResultList.jsx';
import refreshItems, { rootFolder } from '../../refreshItems.jsx';
import withModularBrowserCapabilities from '../../withModularBrowserCapabilities.jsx';

const getLabels = isInEditFlow => ({
	modalTitle: isInEditFlow ? t('Replace image') : t('Add image'),
	states: {
		loading: {
			title: t('Loading images…'),
			message: null
		},
		browseError: {
			title: t('Can’t open this folder'),
			message: t(
				'FontoXML can’t open this folder. You can try again, or try a different folder.'
			)
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
			message: t(
				'FontoXML can’t open this image. You can try again, or try a different image.'
			)
		}
	},
	cancelButtonLabel: t('Cancel'),
	submitButtonLabel: isInEditFlow ? t('Replace') : t('Add'),
	upload: {
		buttonLabel: t('Upload'),
		fileSizeTooLargeMessage: t(
			'This image is larger than 4 megabyte, please select another image or resize it and try again.'
		),
		serverErrorMessage: t('FontoXML can’t upload this image, please try again.')
	}
});

class FxImageBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			selectedImageId: PropTypes.string
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	labels = getLabels(this.props.data.selectedImageId !== null);

	handleRenderListItem = ({ key, item, isSelected, isDisabled, onClick, onDoubleClick }) => (
		<ImageListItem
			{...this.props}
			key={key}
			item={item}
			isSelected={isSelected}
			isDisabled={isDisabled}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
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

	onSubmit = selectedItem => {
		this.props.submitModal({ selectedImageId: selectedItem.id });
	};

	handleSubmitButtonClick = () => this.onSubmit(this.props.selectedItem);

	render() {
		return (
			<Modal size="l" isFullHeight={true}>
				<ModalHeader title={this.labels.modalTitle} />

				<ModalBody>
					<ModalContent>
						<ModalContent flexDirection="column" isScrollContainer>
							<ModalBrowserFileAndFolderResultList
								{...this.props}
								labels={this.labels}
								renderListItem={this.handleRenderListItem}
								renderGridItem={this.handleRenderGridItem}
								onSubmit={this.onSubmit}
							/>
						</ModalContent>
					</ModalContent>
				</ModalBody>

				<ModalFooter>
					<Button
						type="default"
						label={this.labels.cancelButtonLabel}
						onClick={this.props.cancelModal}
					/>

					<Button
						type="primary"
						label={this.labels.submitButtonLabel}
						isDisabled={this.props.selectedItem === null}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		refreshItems(this.props, rootFolder);
	}
}

FxImageBrowserModal = withModularBrowserCapabilities(FxImageBrowserModal, 'grid');

export default FxImageBrowserModal;
