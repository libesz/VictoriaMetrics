import React, {FC, useRef, useState} from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, IconButton, TextField, Typography, FormControlLabel,
  Tooltip, Switch } from "@material-ui/core";
import QueryEditor from "./QueryEditor";
import {TimeSelector} from "./TimeSelector";
import {useAppDispatch, useAppState} from "../../../state/common/StateContext";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SecurityIcon from "@material-ui/icons/Security";
import {AuthDialog} from "./AuthDialog";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import Portal from "@material-ui/core/Portal";
import {saveToStorage} from "../../../utils/storage";
import {useGraphDispatch, useGraphState} from "../../../state/graph/GraphStateContext";
import debounce from "lodash.debounce";

const QueryConfigurator: FC = () => {
  const {serverUrl, query, queryHistory, time: {duration}, queryControls: {autocomplete, nocache}} = useAppState();
  const dispatch = useAppDispatch();

  const onChangeAutocomplete = () => {
    dispatch({type: "TOGGLE_AUTOCOMPLETE"});
    saveToStorage("AUTOCOMPLETE", !autocomplete);
  };
  const onChangeCache = () => {
    dispatch({type: "NO_CACHE"});
    saveToStorage("NO_CACHE", !nocache);
  };

  const { yaxis } = useGraphState();
  const graphDispatch = useGraphDispatch();

  const onChangeYaxisLimits = () => { graphDispatch({type: "TOGGLE_ENABLE_YAXIS_LIMITS"}); };

  const setMinLimit = ({target: {value}}: {target: {value: string}}) => {
    graphDispatch({type: "SET_YAXIS_LIMITS", payload: [+value, yaxis.limits.range[1]]});
  };
  const setMaxLimit = ({target: {value}}: {target: {value: string}}) => {
    graphDispatch({type: "SET_YAXIS_LIMITS", payload: [yaxis.limits.range[0], +value]});
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const queryContainer = useRef<HTMLDivElement>(null);

  const onSetDuration = (dur: string) => dispatch({type: "SET_DURATION", payload: dur});
  
  const onRunQuery = () => {
    const { values } = queryHistory;
    if (query === values[values.length - 1]) return;
    dispatch({type: "RUN_QUERY"});
    dispatch({type: "SET_QUERY_HISTORY_INDEX", payload: values.length});
    dispatch({type: "SET_QUERY_HISTORY_VALUES", payload: [...values, query]});
  };
  const onSetQuery = (newQuery: string) => {
    if (query === newQuery) return;
    dispatch({type: "SET_QUERY", payload: newQuery});
  };
  const setHistoryIndex = (step: number) => {
    const index = queryHistory.index + step;
    if (index < -1 || index > queryHistory.values.length) return;
    dispatch({type: "SET_QUERY_HISTORY_INDEX", payload: index});
    onSetQuery(queryHistory.values[index] || "");
  };
  const onSetServer = ({target: {value}}: {target: {value: string}}) => {
    dispatch({type: "SET_SERVER", payload: value});
  };

  return <>
    <Accordion expanded={expanded} onChange={() => setExpanded(prev => !prev)}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon/>}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Box mr={2}><Typography variant="h6" component="h2">Query Configuration</Typography></Box>
        <Box flexGrow={1} onClick={e => e.stopPropagation()} onFocusCapture={e => e.stopPropagation()}>
          <Portal disablePortal={!expanded} container={queryContainer.current}>
            <Box display="flex" alignItems="center">
              <Box width="100%">
                <QueryEditor server={serverUrl} query={query} oneLiner={!expanded} autocomplete={autocomplete}
                  queryHistory={queryHistory} setHistoryIndex={setHistoryIndex} runQuery={onRunQuery} setQuery={onSetQuery}/>
              </Box>
              <Tooltip title="Execute Query">
                <IconButton onClick={onRunQuery}><PlayCircleOutlineIcon /></IconButton>
              </Tooltip>
            </Box>
          </Portal>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box display="grid" gridGap={16}>
              <Box display="flex" alignItems="center">
                <TextField variant="outlined" fullWidth label="Server URL" value={serverUrl}
                  inputProps={{style: {fontFamily: "Monospace"}}}
                  onChange={onSetServer}/>
                <Box>
                  <Tooltip title="Request Auth Settings">
                    <IconButton onClick={() => setDialogOpen(true)}><SecurityIcon/></IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box flexGrow={1} ><div ref={queryContainer} />{/* for portal QueryEditor */}</Box>
            </Box>
          </Grid>
          <Grid item xs={8} md={6} >
            <Box style={{
              borderRadius: "4px",
              borderColor: "#b9b9b9",
              borderStyle: "solid",
              borderWidth: "1px",
              height: "100%",}}>
              <TimeSelector setDuration={onSetDuration} duration={duration}/>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box px={1} display="flex" alignItems="center" minHeight={52}>
              <Box><FormControlLabel
                control={<Switch size="small" checked={autocomplete} onChange={onChangeAutocomplete}/>} label="Enable autocomplete"
              /></Box>
              <Box ml={4}><FormControlLabel
                control={<Switch size="small" checked={!nocache} onChange={onChangeCache}/>} label="Enable cache"
              /></Box>
              <Box ml={4} display="flex" alignItems="center">
                <FormControlLabel
                  control={<Switch size="small" checked={yaxis.limits.enable} onChange={onChangeYaxisLimits}/>}
                  label="fix the limits for y-axis"
                />
                {yaxis.limits.enable && <Box display="grid" gridTemplateColumns="120px 120px" gridGap={10}>
                  <TextField label="Min" type="number" size="small" variant="outlined"
                    defaultValue={yaxis.limits.range[0]} onChange={debounce(setMinLimit, 750)}/>
                  <TextField label="Max" type="number" size="small" variant="outlined"
                    defaultValue={yaxis.limits.range[1]} onChange={debounce(setMaxLimit, 750)}/>
                </Box>}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
    <AuthDialog open={dialogOpen} onClose={() => setDialogOpen(false)}/>
  </>;
};

export default QueryConfigurator;