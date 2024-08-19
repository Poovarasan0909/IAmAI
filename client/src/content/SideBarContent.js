import React, {useContext, useEffect, useState} from 'react';
import styled from "styled-components";
import {Box, IconButton, Typography, useTheme} from "@mui/material";
import { Sidebar, Menu, MenuItem} from "react-pro-sidebar";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import useIsMobile from "../hooks/useIsMobile";
import {UserContext} from "../context/UserContext";
import {getRequest} from "../API_helper/APIs";
import {useNavigate} from "react-router-dom";


const SideBarContent = ({isCollapsed,updateIsCollapsed, reformatResponse, setResponse, setQuestion, historyList, setHistoryList}) => {
    const { state, setState } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
       console.log("SideBarContent_entered......", state.user?._id)
        const userId = state.user?._id;
       if(userId) {
         getRequest(`getUserDataById/${userId}`).then((res) => {
            console.log(res.data, "Dsdssdssdsdsd")
             setHistoryList(res.data.reverse());
        })
           }
    }, [state]);

    const handleOnHistoryResponse = (response, prompt) => {
        if (document.getElementById("response_element"))
            document.getElementById("response_element").innerHTML = '';
        setResponse(true);
        setQuestion(prompt);
        const formattedResponse = reformatResponse(response);
        setTimeout(() => {
            formattedResponse.forEach(element =>
                document.getElementById("response_element")?.appendChild(element)
            );
        }, 400)
        if(isMobile)
            updateIsCollapsed(!isCollapsed);
    }

    const makeFirstLetterCaps = (value) => {
        const firstChar = value.charAt(0).toUpperCase();
        return firstChar + value.substring(1);
    }
    const isMobile = useIsMobile();
    return(
    <Container>
        {isMobile && isCollapsed ?<></>
            :
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
                {!isCollapsed && (<>
                        {state.user ? <>
                            <div>
                                <b>History</b>
                            </div>
                            {historyList && historyList.map((his) => (
                                <div
                                    className={'truncate cursor-pointer py-1 px-2 border-l-2 rounded hover:bg-blue-200'}
                                    onClick={() => handleOnHistoryResponse(his.response, his.prompt)}>
                                    {makeFirstLetterCaps(his.prompt)}
                                </div>
                            ))
                            }</> :
                            <div className={'text-center mt-12'}>
                                <h6>Sign in to access additional benefits.</h6>
                                <button
                                    className={`cursor-pointer mr-3 inline-flex items-center rounded-full lg:px-4 py-1 text-1xl font-mono font-semibold text-blue-600
                            hover:text-white border-2 border-blue-600 hover:bg-blue-600 transition ease-in-out delay-150 hover:translate-y-1 hover:scale-75 duration-300 focus:bg-transparent max-md:px-1`}
                                    onClick={() => navigate("/IAmAI/signin")}>
                                    Sign in
                                </button>
                            </div>
                        }
                    </>
                )}
                </Menu>
                {!isCollapsed && <small className={'absolute bottom-0 '}> Developed by <u>Poovarasan</u></small>}
            </Sidebar>
        </Box>}
    </Container>
    );
}

export default SideBarContent;

const Item = ({title, to, icon, selected, setSelected}) => {
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