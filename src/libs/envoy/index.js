import axios from "./axios";

export const config_dump = async() => {
    return (await axios.get('/config_dump')).data.configs
}

export const listenerConfigs = async () => {
    const res = await config_dump();
    const lcd = res.find(d => d["@type"].endsWith("ListenersConfigDump"))

    const configs = [];
    lcd.static_listeners.forEach(ln => { configs.push(ln.listener) })
    lcd.dynamic_listeners.forEach(item => { configs.push(item.active_state.listener) })
    return configs
}

export const routeConfigs = async () => {
    const res = await config_dump();
    const rcd = res.find(d => d["@type"].endsWith("v3.RoutesConfigDump"))

    const configs = [];
    rcd.static_route_configs.forEach(item => { configs.push(item.route_config) })
    rcd.dynamic_route_configs.forEach(item => { configs.push(item.route_config) })
    return configs
}

export const clusterConfigs = async () => {
    const res = await config_dump();
    const ccd = res.find(d => d["@type"].endsWith("v3.ClustersConfigDump"))
    console.log(ccd);

    const configs = [];
    ccd.static_clusters.forEach(item => { configs.push(item.cluster) })
    ccd.dynamic_active_clusters.forEach(item => { configs.push(item.cluster) })
    return configs
}

export const listeners = async () => {
    return (await axios.get('/listeners?format=json')).data.listener_statuses;
}

export const clusters = async() => {
    return (await axios.get('/clusters?format=json')).data.cluster_statuses;
}