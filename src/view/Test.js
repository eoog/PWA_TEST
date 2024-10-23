import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Divider} from "@mui/material";

const EXTENSION_IDENTIFIER = "URL_HISTORY_TRACKER_f7e8d9c6b5a4";

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
                    <Typography>{children}</Typography>
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

const Test = () => {
    const [urlHistory, setUrlHistory] = useState([]);
    const [value, setValue] = useState(0);

    // 데이터 요청 함수
    const requestUrlsAndContent = () => {
        window.postMessage(
            {
                type: "REQUEST_URLS_AND_CONTENT",
                source: "PWA",
                identifier: EXTENSION_IDENTIFIER,
            },
            "*"
        );
    };

    useEffect(() => {
        let mounted = true;

        const messageListener = (event) => {
            if (
                mounted &&
                event.data.type === "URLS_AND_CONTENT_FROM_EXTENSION" &&
                event.data.source === EXTENSION_IDENTIFIER
            ) {
                setUrlHistory(event.data.data);
            }
        };

        window.addEventListener("message", messageListener);

        setTimeout(() => {
            if (mounted) {
                requestUrlsAndContent();
            }
        }, 100);

        const intervalId = setInterval(() => {
            if (mounted) {
                requestUrlsAndContent();
            }
        }, 10000); // 10초

        return () => {
            mounted = false;
            clearInterval(intervalId);
            window.removeEventListener("message", messageListener);
        };
    }, []);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
       <>
           <Box sx={{
               flexGrow: 1,
               m: 5,
               bgcolor: "beige",
               display: "flex",
               boxShadow: 1,
               borderRadius: 2,
               height: "90vh",  // 부모 Box의 높이를 지정 (화면의 80%로 예시)
           }}>
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
                           <Typography variant="h6">URL: {item.url}</Typography>
                           <Divider />
                           <Box sx={{ p: 1, maxWidth: "100%", height: "100%", overflow: "auto" }}>
                               {item.content
                                   ? item.content + "@@@---끝---@@@@"
                                   : "No content available"}
                           </Box>
                       </TabPanel>
                   ))}
               </Box>
           </Box>

       </>
    );
};

export default Test;