import axios from "./axios";
import { count, db, query } from "./db";

export const fetch_config_dump = async (include_eds) => {
    let url = "/config_dump";
    if (include_eds) {
        url += "?include_eds";
    }

    return (await axios.get(url)).data.configs.map(config => { config.key = config["@type"]; return config })
}

export const sync_config_dump = async (include_eds) => {
    const configs = await fetch_config_dump(include_eds);
    console.log(configs);
    const cfg = new Configs(configs)

    try {
        await db.bootstrap.clear()
        await db.listeners.clear()
        await db.routes.clear()
        await db.clusters.clear()
        await db.endpoints.clear()
        await db.bootstrap.add(cfg.getBootstrapConfig());
        await db.listeners.bulkAdd(cfg.getListenerConfigs())
        await db.routes.bulkAdd(cfg.getRouteConfigs())
        await db.clusters.bulkAdd(cfg.getClusterConfigs())
        await db.endpoints.bulkAdd(cfg.getEndpointConfigs())
    } catch (error) {
        console.log(error);
    }
}

export const statistic = async () => {
    return {
        listeners: await count('listeners'),
        routes: await count('routes'),
        clusters: await count('clusters'),
        endpoints: await count('endpoints'),
    }
}

export const bootstrapConfig = async () => {
    return await db.bootstrap.toCollection().last()
}

export const listenerConfigs = async (param) => { return query('listeners', param) }

export const routeConfigs = async (param) => { return query('routes', param) }

export const clusterConfigs = async (param) => { return query('clusters', param) }

export const endpointConfigs = async (param) => { return query('endpoints', param) }

export const inject = (key, value) => { return (el) => { el[key] = value; return el } }

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
        lcd.static_listeners.forEach(ln => { ln.listener._static = true; configs.push(ln.listener) })
        lcd.dynamic_listeners.forEach(item => { configs.push(item.active_state.listener) })
        return configs
    }
    getRouteConfigs() {
        const rcd = this.configs.find(d => d["@type"].endsWith("v3.RoutesConfigDump"))
        const configs = [];
        rcd.static_route_configs.forEach(item => { item.route_config._static = true; configs.push(item.route_config) })
        rcd.dynamic_route_configs.forEach(item => { configs.push(item.route_config) })
        return configs
    }
    getClusterConfigs() {
        const ccd = this.configs.find(d => d["@type"].endsWith("v3.ClustersConfigDump"))
        const configs = [];
        ccd.static_clusters.forEach(item => { item.cluster._static = true; configs.push(item.cluster) })
        ccd.dynamic_active_clusters.forEach(item => { configs.push(item.cluster) })
        return configs
    }
    getEndpointConfigs() {
        const ecd = this.configs.find(d => d["@type"].endsWith("v3.EndpointsConfigDump"))
        const configs = [];
        ecd.static_endpoint_configs.forEach(item => { item.endpoint_config._static = true; configs.push(item.endpoint_config) })
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