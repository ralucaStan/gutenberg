/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import {
	Button,
	MenuItem,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';
import { decodeEntities } from '@wordpress/html-entities';

export default function RenameMenuItem( { template, onClose } ) {
	const [ title, setTitle ] = useState(
		decodeEntities( template.title.rendered )
	);

	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const {
		editEntityRecord,
		__experimentalSaveSpecifiedEntityEdits: saveSpecifiedEntityEdits,
	} = useDispatch( coreStore );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	if ( template.type === 'wp_template' && ! template.is_custom ) {
		return null;
	}

	async function onTemplateRename( event ) {
		event.preventDefault();

		try {
			await editEntityRecord( 'postType', template.type, template.id, {
				title,
			} );

			// Update state before saving rerenders the list.
			setTitle( '' );
			setIsModalOpen( false );
			onClose();

			// Persist edited entity.
			await saveSpecifiedEntityEdits(
				'postType',
				template.type,
				template.id,
				[ 'title' ], // Only save title to avoid persisting other edits.
				{
					throwOnError: true,
				}
			);

			createSuccessNotice( __( 'Entity renamed.' ), {
				type: 'snackbar',
			} );
		} catch ( error ) {
			const errorMessage =
				error.message && error.code !== 'unknown_error'
					? error.message
					: __( 'An error occurred while renaming the entity.' );

			createErrorNotice( errorMessage, { type: 'snackbar' } );
		}
	}

	return (
		<>
			<MenuItem onClick={ () => setIsModalOpen( true ) }>
				{ __( 'Rename' ) }
			</MenuItem>
			{ isModalOpen && (
				<Modal
					title={ __( 'Rename' ) }
					onRequestClose={ () => {
						setIsModalOpen( false );
					} }
					overlayClassName="edit-site-list__rename-modal"
				>
					<form onSubmit={ onTemplateRename }>
						<VStack spacing="5">
							<TextControl
								__nextHasNoMarginBottom
								label={ __( 'Name' ) }
								value={ title }
								onChange={ setTitle }
								required
							/>

							<HStack justify="right">
								<Button
									variant="tertiary"
									onClick={ () => {
										setIsModalOpen( false );
									} }
								>
									{ __( 'Cancel' ) }
								</Button>

								<Button variant="primary" type="submit">
									{ __( 'Save' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
				</Modal>
			) }
		</>
	);
}
