import React, { useState, useEffect } from "react";
import axios from "axios";
import FileDetails from "./FileDetails";
import { List, ListItem, Typography, Card, CardContent, Box } from "@mui/material";
import { backendAdd } from "../index";

const FileList = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(backendAdd("/files"));
        setFiles(res.data.result);
      } catch (err) {
        console.error("Failed to fetch files", err);
      }
    };
    fetchFiles();
  }, []);

  return (
    <Box sx={{ margin: 4 }}>
      {files.length === 0 ? (
        <Typography variant="body1">No files uploaded yet</Typography>
      ) : (
        <List>
          {files.map(file => (
            <ListItem key={file.id} button="true">
              <Card variant="outlined" sx={{ width: '100%', display: 'flex' }}>
                <CardContent sx={{width: '65%'}}>
                  <Typography variant="h6">{file.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Description:</strong> {file.descr || 'No description'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Uploaded At:</strong> {new Date(file.uploaded).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardContent sx={{width: '35%'}}>
                  <img src={backendAdd(`/files/${file.id}/download`)} alt={file.name} style={{ maxWidth: '100%' }} />
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileList;
