import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Divider, CircularProgress, Alert } from "@mui/material";

const EXTENSION_IDENTIFIER = "URL_HISTORY_TRACKER_f7e8d9c6b5a4";
const PWA_URL = process.env.REACT_APP_PWA_URL || "localhost:3000";

// TabPanel 컴포넌트
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        "aria-controls": `vertical-tabpanel-${index}`,
    };
}

const Test2 = () => {
    const [urlHistory, setUrlHistory] = useState([]);
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 데이터 요청 함수
    const requestUrlsAndContent = useCallback(() => {
        try {
            window.postMessage(
                {
                    type: "REQUEST_URLS_AND_CONTENT",
                    source: "PWA",
                    identifier: EXTENSION_IDENTIFIER,
                },
                "*"
            );
        } catch (err) {
            setError("Failed to request data from extension");
        }
    }, []);

    // 실시간 컨텐츠 업데이트 처리
    const handleContentChange = useCallback((newContent) => {
        setUrlHistory(prevHistory => {
            const index = prevHistory.findIndex(item => item.url === newContent.url);
            if (index === -1) {
                return [...prevHistory, newContent];
            }
            const newHistory = [...prevHistory];
            newHistory[index] = { ...newHistory[index], content: newContent.content };
            return newHistory;
        });
    }, []);

    useEffect(() => {
        let mounted = true;

        const messageListener = (event) => {
            if (!mounted) return;

            if (event.data.source === EXTENSION_IDENTIFIER) {
                setLoading(false);

                if (event.data.type === "URLS_AND_CONTENT_FROM_EXTENSION") {
                    setUrlHistory(event.data.data);
                    setError(null);
                } else if (event.data.type === "CONTENT_CHANGED") {
                    handleContentChange(event.data.data);
                    setError(null);
                }
            }
        };

        window.addEventListener("message", messageListener);

        // 초기 데이터 요청
        const initialRequestTimeout = setTimeout(() => {
            if (mounted) {
                requestUrlsAndContent();
            }
        }, 100);

        // 주기적 데이터 갱신
        const intervalId = setInterval(() => {
            if (mounted) {
                requestUrlsAndContent();
            }
        }, 10000);

        return () => {
            mounted = false;
            clearTimeout(initialRequestTimeout);
            clearInterval(intervalId);
            window.removeEventListener("message", messageListener);
        };
    }, [requestUrlsAndContent, handleContentChange]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // 컨텐츠가 현재 PWA인지 확인
    const isCurrentPWA = (url) => {
        try {
            return url.includes(PWA_URL);
        } catch {
            return false;
        }
    };

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
                <>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={value}
                        onChange={handleChange}
                        aria-label="URL History Tabs"
                        sx={{
                            borderRight: 1,
                            borderColor: "divider",
                            minWidth: "300px"
                        }}
                    >
                        {urlHistory.map((item, index) => (
                            <Tab
                                key={index}
                                label={item.title || `No Title (${index + 1})`}
                                {...a11yProps(index)}
                            />
                        ))}
                    </Tabs>

                    <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                        {urlHistory.map((item, index) => (
                            <TabPanel value={value} index={index} key={index}>
                                <Typography variant="h6" sx={{ p: 1, maxWidth: "100%" }}>
                                    URL: {item.url}
                                </Typography>
                                <Divider />
                                <Box sx={{
                                    p: 1,
                                    maxWidth: "100%",
                                    height: "100%",
                                    overflow: "auto",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word"
                                }}>
                                    {isCurrentPWA(item.url) ? (
                                        <Alert severity="info">현재 PWA 페이지입니다</Alert>
                                    ) : (
                                        item.content || '컨텐츠가 없습니다.'
                                    )}
                                </Box>
                            </TabPanel>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default Test2;