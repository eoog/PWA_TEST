import { Box, Fade } from "@mui/material";
import React from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
  SubMenu,
} from "react-pro-sidebar";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArticleIcon from "@mui/icons-material/Article";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import {Link} from "react-router-dom";

export default function Example() {
  const { collapseSidebar, collapsed } = useProSidebar();

  return (
      <Box sx={{ boxShadow: 1, textOverflow: 'ellipsis', backgroundColor: "#FBFBFB"}}>
        <Sidebar backgroundColor="#FBFBFB">
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
                          bgcolor: "#000000",
                        }}
                    ></Box>
                    <Box
                        sx={{
                          color: "black",
                          mt: 2,
                        }}
                    >
                      Knowwhersoft
                    </Box>
                    <Box
                        sx={{
                          color: "gray",
                          mt: 1,
                          fontSize: 12,
                        }}
                    >
                      knowwhersoft
                    </Box>
                  </Box>
                </Fade>
            )}
            <Link to="/">
            <MenuItem style={{backgroundColor:"darkgray" , opacity : 0.4 , color:"black"}} icon={<HomeOutlinedIcon />}>선정성</MenuItem>
            </Link>
            <Link to="/a">
              <MenuItem style={{backgroundColor:"darkgray" , opacity : 0.4 , color:"black"}} icon={<HomeOutlinedIcon />}>선정성</MenuItem>
            </Link>
            {/*<Link to="/a">*/}
            {/*  <MenuItem style={{backgroundColor:"darkgray" , opacity : 0.4 , color:"black"}} icon={<HomeOutlinedIcon />}>선정성</MenuItem>*/}
            {/*</Link>*/}
            {/*<SubMenu icon={<FolderSharedIcon />} label="Projects">*/}
            {/*  <MenuItem icon={<ArticleIcon />}> Project 1</MenuItem>*/}
            {/*  <MenuItem icon={<ArticleIcon />}> Project-Project-Project</MenuItem>*/}
            {/*  <MenuItem icon={<AddCircleOutlineIcon />}>Add Project</MenuItem>*/}
            {/*</SubMenu>*/}
            {/*<MenuItem icon={<PersonOutlineIcon />}>My Page</MenuItem>*/}
          </Menu>
        </Sidebar>
      </Box>
  );
}