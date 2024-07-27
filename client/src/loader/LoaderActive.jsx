import React from 'react'
import ReactLoading from 'react-loading';


const LoaderActive = () => (
    <div className={"center"}>
        <ReactLoading type={'bubbles'} color={'green'} height={167} width={275} />
    </div>
)

export default LoaderActive