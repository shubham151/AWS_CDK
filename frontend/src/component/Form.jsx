import React, { useState } from 'react';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';

function Form() {
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null);

    const handleTextInputChange = (e) => {
        setTextInput(e.target.value);
    };

    const handleFileInputChange = (e) => {
        setFileInput(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!fileInput) {
            alert('Please select a file.');
            return;
        }

        AWS.config.update({
            accessKeyId: process.env.ACCESS_ID_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
            region: process.env.REGION
        });

        const dynamoDB = new AWS.DynamoDB.DocumentClient();
        const s3 = new AWS.S3();

        // Upload file to S3
        const s3Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileInput.name,
            Body: fileInput
        };

        try {
            const s3Response = await s3.upload(s3Params).promise();
            const dynamoParams = {
                TableName: process.env.TABLE_NAME,
                Item: {
                    id: nanoid(),
                    input: `${s3Response.Bucket}/${textInput}`,
                    filePath: s3Response.Key
                },
            };

            await dynamoDB.put(dynamoParams).promise();

            console.log('Data saved to DynamoDB and file uploaded to S3.');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-md shadow-md">
            <form>
                <div className="mb-4">
                    <label htmlFor="text-input" className="block text-gray-700 font-bold mb-2">Text Input:</label>
                    <input
                        type="text"
                        id="text-input"
                        value={textInput}
                        onChange={handleTextInputChange}
                        className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="file-input" className="block text-gray-700 font-bold mb-2">File Input:</label>
                    <input
                        type="file"
                        id="file-input"
                        onChange={handleFileInputChange}
                        className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <button type="button" onClick={handleUpload} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Upload
                </button>
            </form>
        </div>
    );
}

export default Form;
