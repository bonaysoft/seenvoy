import axios from "./axios";

export const config_dump = async (include_eds) => {
    let url = "/config_dump";
    if (include_eds) {
        url += "?include_eds";
    }

    return (await axios.get(url)).data.configs
}

export const statistic = async () => {
    const res = await config_dump(true);
    const lcd = res.find(d => d["@type"].endsWith("ListenersConfigDump"))
    const rcd = res.find(d => d["@type"].endsWith("v3.RoutesConfigDump"))
    const ccd = res.find(d => d["@type"].endsWith("v3.ClustersConfigDump"))
    const ecd = res.find(d => d["@type"].endsWith("EndpointsConfigDump"))

    return {
        listeners: { static: lcd.static_listeners.length, dynamic: lcd.dynamic_listeners.length },
        routes: { static: rcd.static_route_configs.length, dynamic: rcd.dynamic_route_configs.length },
        clusters: { static: ccd.static_clusters.length, dynamic: ccd.dynamic_active_clusters.length },
        endpoints: { static: ecd.static_endpoint_configs.length, dynamic: ecd.dynamic_endpoint_configs.length },
    }
}

export const bootstrapConfig = async () => {
    const res = await config_dump();
    const bcd = res.find(d => d["@type"].endsWith("BootstrapConfigDump"))
    return bcd.bootstrap
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

export const endpointConfigs = async () => {
    const res = await config_dump(true);
    const ecd = res.find(d => d["@type"].endsWith("v3.EndpointsConfigDump"))
    console.log(ecd);

    const configs = [];
    ecd.static_endpoint_configs.forEach(item => { configs.push(item.endpoint_config) })
    ecd.dynamic_endpoint_configs.forEach(item => { configs.push(item.endpoint_config) })
    return configs
}

export class Configs {
    configs;
    constructor(configs) {
        this.configs = configs
    }
    getBootstrapConfig() {
        return this.configs.find(d => d["@type"].endsWith("BootstrapConfigDump")).bootstrap
    }
    getListenerConfigs() {
        const lcd = this.configs.find(d => d["@type"].endsWith("ListenersConfigDump"))
        const configs = [];
        lcd.static_listeners.forEach(ln => { configs.push(ln.listener) })
        lcd.dynamic_listeners.forEach(item => { configs.push(item.active_state.listener) })
        return configs
    }
    getRouteConfigs() {
        const rcd = this.configs.find(d => d["@type"].endsWith("v3.RoutesConfigDump"))
        const configs = [];
        rcd.static_route_configs.forEach(item => { configs.push(item.route_config) })
        rcd.dynamic_route_configs.forEach(item => { configs.push(item.route_config) })
        return configs
    }
    getClusterConfigs() {
        const ccd = this.configs.find(d => d["@type"].endsWith("v3.ClustersConfigDump"))
        const configs = [];
        ccd.static_clusters.forEach(item => { configs.push(item.cluster) })
        ccd.dynamic_active_clusters.forEach(item => { configs.push(item.cluster) })
        return configs
    }
    getEndpointConfigs() {
        const ecd = this.configs.find(d => d["@type"].endsWith("v3.EndpointsConfigDump"))
        const configs = [];
        ecd.static_endpoint_configs.forEach(item => { configs.push(item.endpoint_config) })
        ecd.dynamic_endpoint_configs.forEach(item => { configs.push(item.endpoint_config) })
        return configs
    }
}

export const listeners = async () => {
    return (await axios.get('/listeners?format=json')).data.listener_statuses;
}

export const clusterStatuses = async () => {
    return (await axios.get('/clusters?format=json')).data.cluster_statuses;
}

export const buildEndpointName = (endpoint) => {
    const addr = endpoint.address;
    return addr.socket_address ? `${addr.socket_address.address}:${addr.socket_address.port_value}` : addr.pipe.path
}

export * from "./relation";