import React, {useEffect, useState} from 'react';
import styled from "styled-components";
import {Box, IconButton, Typography, useTheme} from "@mui/material";
import { Sidebar, Menu, MenuItem} from "react-pro-sidebar";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {Card} from 'react-bootstrap'

const SideBarContent = ({isCollapsed,updateIsCollapsed}) => {

    return(
    <Container>
        <Box className="sideBar">
            <Sidebar collapsed={isCollapsed} style={{height:'100vh'}}>
                <Menu iconShape="square">
                  <MenuItem
                      onClick={()=> updateIsCollapsed(!isCollapsed)}
                      icon={isCollapsed ?  <MenuOutlinedIcon /> : undefined}
                      style={{
                      margin: "10px 0 20px 0",
                  }}>
                      {!isCollapsed && (
                          <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              ml="15px"
                          >
                              <Typography variant="h3">
                                  <h1 className="title">IAmAI</h1>
                              </Typography>
                              <IconButton onClick={() => updateIsCollapsed(!isCollapsed)}>
                                  <MenuOutlinedIcon />
                              </IconButton>
                          </Box>
                      )}
                  </MenuItem>
                {!isCollapsed && (
                    <Box mb="25px">
                        <Box textAlign="center">
                            <Typography
                                variant="h6"
                                color={'gray'}
                                fontWeight="bold"
                                sx={{ m: "10px 0 0 0" }}
                            >
                             Coming Soon....
                            </Typography>
                         <br/>
                            <Card>
                                <Card.Body style={{padding : '0 20px'}}>
                                    Developed by <u>Poovarasan</u>
                                </Card.Body>
                            </Card>
                        </Box>
                    </Box>
                )}

                </Menu>
            </Sidebar>
        </Box>
    </Container>
    );
}

export default SideBarContent;

const Item = ({ title, to, icon, selected, setSelected }) => {
    // const theme = useTheme();
    // const colors = tokens(theme.palette.mode);
    return (
        <MenuItem
            active={selected === title}
            style={{
                color: 'gray',
            }}
            onClick={() => setSelected(title)}
            icon={icon}
        >
            <Typography>{title}</Typography>
            {/*<Link to={to} />*/}
        </MenuItem>
    );
};
const Container = styled.div`
  height: 10vh;
`;