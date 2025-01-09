import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import {backendAdd} from '../index';

const FileDetail = (props) => {
  const {fileId} = props;
  // const { id } = useParams(); // Grab the file id from the URL
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFile = async () => {
      try {
        // Fetch file metadata
        const res = await axios.get(backendAdd(`/files/${fileId}`));
        console.log(res)
        setFile(res.data.result);
      } catch (err) {
        setError('Failed to fetch file');
      }
    };

    fetchFile();
  }, [fileId]);

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  if (!file) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const isImage = file.path.match(/\.(jpeg|jpg|gif|png)$/);

  return (
    <Box sx={{ margin: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4">{file.name}</Typography>
          <Typography variant="body1"><strong>Description:</strong> {file.descr || 'No description'}</Typography>
          <Typography variant="body1"><strong>Uploaded At:</strong> {new Date(file.uploadedAt).toLocaleString()}</Typography>
          
          {isImage ? (
            <Box sx={{ marginTop: 2 }}>
              {/* Display the image directly */}
              <img src={backendAdd(`/files/${fileId}/download`)} alt={file.name} style={{ maxWidth: '100%' }} />
            </Box>
          ) : (
            <Button
              sx={{ marginTop: 2 }}
              variant="contained"
              color="primary"
              href={backendAdd(`/files/${fileId}/download`)}
              download
            >
              Download File
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FileDetail;
