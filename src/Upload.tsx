import { useState } from 'react';
import tempLogo from './assets/TempLogo.png';
import './Upload.css';

function Upload() {
    {/* 
        state to hold selected file 
        file is the variable used to store the file    
        setFile is the function used to update the file variable

        more research into "states" will be needed
    */ } 
    const [file, setFile] = useState<File | null>(null);

    {/* 
        handleFileChange is the name of the function that handles file input changes
        event: React.ChangeEvent<HTMLInputElement> is the parameter the function takes

        this video explains the basic set up for file uploading along 
        with other features i may implement later, but this iss 
        https://www.youtube.com/watch?v=pWd6Enu2Pjs
    */ } 
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        /* check that .files exists and it has at least one file in it, if so, set file */
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    return (
        <>
            {/* display logo */}
            <div>
                <img src={tempLogo} className="logo" alt="Temp logo" />
            </div>

            {/* upload functionality */}
            <div className="upload-container">
                {/* file input */}
                <input
                    type="file"
                    accept="video/*"
                    /* onChange is an event handler that calls handleFileChange*/
                    onChange={handleFileChange}
                    id="video-upload"
                    style={{ display: 'none' }}
                />

                {/* styled label as button */} 
                <label htmlFor="video-upload" className="upload-button">
                    Upload Video
                </label>

                {/* display selected file name */}  
                {file && (
                    <div className="file-info">
                        Selected file: {file.name}
                    </div>
                )}
            </div>
        </>
    );
}

export default Upload;