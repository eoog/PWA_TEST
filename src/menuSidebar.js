import { Box, Fade } from "@mui/material";
import React from "react";
import {
  Menu,
  MenuItem,
  useProSidebar,
} from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Link, useLocation } from "react-router-dom";

export default function MenuSidebar() {
  const { collapseSidebar, collapsed } = useProSidebar();
  const location = useLocation(); // 현재 경로를 가져오기

  // 링크에 따라 배경 색상을 결정하는 함수
  const getMenuItemStyle = (path) => {
    return location.pathname === path
        ? { backgroundColor: "darkgray", opacity: 0.4, color: "black" , textDecoration: "none"}
        : { backgroundColor: "white", opacity: 0.4, color: "black" , textDecoration: "none" };
  };

  return (
      <Box sx={{ boxShadow: 0, textOverflow: 'ellipsis', backgroundColor: "#FBFBFB" }}>
          <Menu>
            {/*<MenuItem*/}
            {/*    icon={<MenuOutlinedIcon />}*/}
            {/*    onClick={() => {*/}
            {/*      collapseSidebar();*/}
            {/*    }}*/}
            {/*></MenuItem>*/}

            {!collapsed && (
                <Fade in={!collapsed} timeout={1200}>
                  <Box
                      sx={{
                        height: 170,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                  >
                    <Box
                        sx={{
                          width: 85,
                          height: 85,
                          borderRadius: 85,
                          bgcolor: "#fffff",
                        }}
                    >
                      <img src={require('./meer.ico')} />
                    </Box>
                    <Box
                        sx={{
                          color: "black",
                          mt: 2,
                        }}
                    >
                      Knowwheresoft
                    </Box>
                    <Box
                        sx={{
                          color: "gray",
                          mt: 1,
                          fontSize: 12,
                        }}
                    >
                      knowwheresoft
                    </Box>
                  </Box>
                </Fade>
            )}
            <Link to="/">
              <MenuItem style={getMenuItemStyle("/")} icon={<HomeOutlinedIcon />}>
                <p style={{textDecoration:"none"}}>선정성-대시보드</p>
              </MenuItem>
            </Link>
            <Link to="/board">
              <MenuItem style={getMenuItemStyle("/board")} icon={<HomeOutlinedIcon />}>
                <p style={{textDecoration:"none"}}>선정성-검출 이미지</p>
              </MenuItem>
            </Link>
            <Link to="/text">
              <MenuItem style={getMenuItemStyle("/text")} icon={<HomeOutlinedIcon />}>
                <p style={{textDecoration:"none"}}>탭 정보(텍스트)</p>
              </MenuItem>
            </Link>
          </Menu>
      </Box>
  );
}