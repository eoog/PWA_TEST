import { Box, Fade } from "@mui/material";
import React from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
} from "react-pro-sidebar";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Link, useLocation } from "react-router-dom";

export default function Example() {
  const { collapseSidebar, collapsed } = useProSidebar();
  const location = useLocation(); // 현재 경로를 가져오기

  // 링크에 따라 배경 색상을 결정하는 함수
  const getMenuItemStyle = (path) => {
    return location.pathname === path
        ? { backgroundColor: "darkgray", opacity: 0.4, color: "black" , textDecoration: "none"}
        : { backgroundColor: "white", opacity: 0.4, color: "black" , textDecoration: "none" };
  };

  return (
      <Box sx={{ boxShadow: 1, textOverflow: 'ellipsis', backgroundColor: "#FBFBFB" }}>
        <Sidebar>
          <Menu>
            <MenuItem
                icon={<MenuOutlinedIcon />}
                onClick={() => {
                  collapseSidebar();
                }}
            ></MenuItem>

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
            {/*<Link to="/dection">*/}
            {/*  <MenuItem style={getMenuItemStyle("/dection")} icon={<HomeOutlinedIcon />}>*/}
            {/*    <p style={{textDecoration:"none"}}>선정성-일정간격 캡쳐</p>*/}
            {/*  </MenuItem>*/}
            {/*</Link>*/}
            <Link to="/dection_save_image">
              <MenuItem style={getMenuItemStyle("/dection_save_image")} icon={<HomeOutlinedIcon />}>
                선정성 - 검출 이미지
              </MenuItem>
            </Link>
            <Link to="/a">
              <MenuItem style={getMenuItemStyle("/a")} icon={<HomeOutlinedIcon />}>
                룰루랄라
              </MenuItem>
            </Link>
            <Link to="/test">
              <MenuItem style={{backgroundColor:"white" , opacity : 0.4 , color:"black"}} icon={<HomeOutlinedIcon />}>테스트</MenuItem>
            </Link>
          </Menu>
        </Sidebar>
      </Box>
  );
}