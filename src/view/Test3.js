import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Divider, CircularProgress, Alert, Switch, FormControlLabel} from "@mui/material";

const EXTENSION_IDENTIFIER = "URL_HISTORY_TRACKER_f7e8d9c6b5a4";
const PWA_URL = process.env.REACT_APP_PWA_URL || "localhost:3000";

const Test3 = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(false);
    }, []);

    // 에러 처리
    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{
            flexGrow: 1,
            m: 5,
            bgcolor: "beige",
            display: "flex",
            boxShadow: 1,
            borderRadius: 2,
            height: "90vh",
        }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ m: 2 }}>
                    탭 내용이 들어올 자리
                </Box>
            )}
        </Box>
    );
};

export default Test3;