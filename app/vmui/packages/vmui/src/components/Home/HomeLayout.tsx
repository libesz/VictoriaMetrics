import React, {FC} from "react";
import {AppBar, Box, CircularProgress, Fade, Link, Toolbar, Typography} from "@material-ui/core";
import {ExecutionControls} from "./Configurator/ExecutionControls";
import {DisplayTypeSwitch} from "./Configurator/DisplayTypeSwitch";
import GraphView from "./Views/GraphView";
import TableView from "./Views/TableView";
import {useAppState} from "../../state/common/StateContext";
import QueryConfigurator from "./Configurator/QueryConfigurator";
import {useFetchQuery} from "./Configurator/useFetchQuery";
import JsonView from "./Views/JsonView";
import {UrlCopy} from "./UrlCopy";
import {Alert} from "@material-ui/lab";

const HomeLayout: FC = () => {

  const {displayType, time: {period}} = useAppState();

  const {fetchUrl, isLoading, liveData, graphData, error} = useFetchQuery();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box display="flex">
            <Typography variant="h5">
              <span style={{fontWeight: "bolder"}}>VM</span>
              <span style={{fontWeight: "lighter"}}>UI</span>
            </Typography>
            <div style={{
              fontSize: "10px",
              marginTop: "-2px"
            }}>
              <div>BETA</div>
            </div>
          </Box>
          <div style={{
            fontSize: "10px",
            position: "absolute",
            top: "40px",
            opacity: ".4"
          }}>
            <Link color="inherit" href="https://github.com/VictoriaMetrics/VictoriaMetrics/issues/new" target="_blank">
              Create an issue
            </Link>
          </div>
          <Box ml={4} flexGrow={1}>
            <ExecutionControls/>
          </Box>
          <DisplayTypeSwitch/>
          <UrlCopy url={fetchUrl}/>
        </Toolbar>
      </AppBar>
      <Box p={2} display="grid" gridTemplateRows="auto 1fr" gridGap={"20px"} style={{minHeight: "calc(100vh - 64px)"}}>
        <Box>
          <QueryConfigurator/>
        </Box>
        <Box height={"100%"}>
          {isLoading && <Fade in={isLoading} style={{
            transitionDelay: isLoading ? "300ms" : "0ms",
          }}>
            <Box alignItems="center" justifyContent="center" flexDirection="column" display="flex"
              style={{
                width: "100%",
                maxWidth: "calc(100vw - 32px)",
                position: "absolute",
                height: "50%",
                background: "linear-gradient(rgba(255,255,255,.7), rgba(255,255,255,.7), rgba(255,255,255,0))"
              }}>
              <CircularProgress/>
            </Box>
          </Fade>}
          {<Box height={"100%"} p={3} bgcolor={"#fff"}>
            {error &&
            <Alert color="error" severity="error" style={{fontSize: "14px"}}>
              {error}
            </Alert>}
            {graphData && period && (displayType === "chart") &&
              <GraphView data={graphData}/>}
            {liveData && (displayType === "code") && <JsonView data={liveData}/>}
            {liveData && (displayType === "table") && <TableView data={liveData}/>}
          </Box>}
        </Box>
      </Box>
    </>
  );
};

export default HomeLayout;