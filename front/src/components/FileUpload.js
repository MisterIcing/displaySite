import React, {useState} from 'react';
import axios from 'axios'
import {TextField, Button, Typography, Input, Card, Box } from '@mui/material';
import { backendAdd } from '../index';

//File uploading component
const FileUpload = () => {
    //Variables
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [descr, setDescr] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
  
    //Functions
    const handleLoading = () => {
      setLoading(true);
    }
    const onFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    const onNameChange = (e) => {
      setName(e.target.value);
    };
  
    const onDescrChange = (e) => {
      setDescr(e.target.value);
    };
  
    //Main function to interact with backend
    const onSubmit = async (e) => {
      e.preventDefault();
  
      //Only required field is file
      if (!file) {
        setMessage('Please select a file to upload');
        setLoading(false);
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('descr', descr);
  
      try {
        const res = await axios.post(backendAdd('/upload'), formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('File uploaded successfully!');
      } catch (err) {
        console.error(err);
        setMessage('Failed to upload file');  
      }
      setLoading(false);
    };
  
    return (
      <Card sx={{margin: 2, padding: 2}}>
        <Typography variant='h5'>Upload a File</Typography>
        <form onSubmit={onSubmit}>
          <Box sx={{marginBottom: 2}}>
            <label>File: </label>
            <Input type="file" onChange={onFileChange} inputProps={{accept: '*'}} />
          </Box>
          <Box sx={{marginBottom: 2}}>
            <TextField
              label='File name (optional)'
              variant='outlined'
              value={name}
              onChange={onNameChange}
            />
          </Box>
          <Box sx={{marginBottom: 2}}>
            <TextField 
              label="File description (optional)"
              variant='outlined'
              value={descr}
              onChange={onDescrChange}
              multiline
            />
          </Box>
          <Button variant='contained' color='primary' type="submit" onClick={handleLoading}>Upload</Button>
        </form>
        {message && (
          <Typography variant='body1' color='success' sx={{marginTop: 2}}>{message}</Typography>
        )}
      </Card>
    );
  };
  
  export default FileUpload;