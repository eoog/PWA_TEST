import {Box, Fade}                     from "@mui/material";
import React                           from "react";
import {Menu, MenuItem, useProSidebar} from "react-pro-sidebar";
import HomeOutlinedIcon                from "@mui/icons-material/HomeOutlined";
import {useLocation, useNavigate}      from "react-router-dom";

export default function SidebarMenu() {
  const {collapseSidebar, collapsed} = useProSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItemStyle = (path) => ({
    backgroundColor: location.pathname === path ? "darkgray" : "white",
    opacity: 0.4,
    color: "black",
    textDecoration: "none"
  });

  const menuItems = [
    {
      path: "/",
      label: "선정성-대시보드",
      icon: <HomeOutlinedIcon/>
    },
    {
      path: "/board",
      label: "선정성-검출 이미지",
      icon: <HomeOutlinedIcon/>
    },
    {
      path: "/text-result",
      label: "도박성 텍스트 결과",
      icon: <HomeOutlinedIcon/>
    }
  ];

  return (
      <Box sx={{
        boxShadow: 0,
        textOverflow: 'ellipsis',
        backgroundColor: "#FBFBFB"
      }}>
        <Menu>
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
                    <img src={require('../../images/meer.ico')} alt="meer"/>
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

          {menuItems.map((item) => (
              <MenuItem
                  key={item.path}
                  style={getMenuItemStyle(item.path)}
                  icon={item.icon}
                  onClick={() => navigate(item.path)}
              >
                <p style={{textDecoration: "none"}}>{item.label}</p>
              </MenuItem>
          ))}
        </Menu>
      </Box>
  );
}