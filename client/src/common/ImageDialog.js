import React from 'react';
import {Dialog, IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import sampleImg from '../css/spinner.svg'

const ImageDialog = ({imageInDialog, setImageInDialog}) => {
    return (
        <Dialog open={imageInDialog}
                sx={{'& .MuiDialog-paper': {backgroundColor: 'rgba(255,255,255,0)'}}}>
            <img alt={'Image is not loaded'}
                 className={'user-select-none'}
                 src={imageInDialog ? typeof imageInDialog === 'string' ?
                     imageInDialog.startsWith('data:image/') ? imageInDialog : imageInDialog.startsWith('https://')? imageInDialog : `data:image/jpeg;base64, ${imageInDialog}` :
                     URL.createObjectURL(imageInDialog) : sampleImg}/>
            <IconButton
                aria-label="close"
                onClick={() => setImageInDialog(null)}
                sx={() => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white',
                    backgroundColor: 'rgba(126,126,126,0.75)',
                    '&:hover': {
                        backgroundColor: 'rgba(106,106,106,0.8)'
                    }
                })}
            >
                <CloseIcon />
            </IconButton>
        </Dialog>
    );
}

export default ImageDialog