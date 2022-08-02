import axios from "./axios";
import { db } from "./db";

export const config_dump = async (include_eds) => {
    let url = "/config_dump";
    if (include_eds) {
        url += "?include_eds";
    }

    return (await axios.get(url)).data.configs.map(config => { config.key = config["@type"]; return config })
}

export const sync_config = async (include_eds) => {
    const configs = await config_dump(include_eds);
    const cfg = new Configs(configs)
    await db.bootstrap.clear()
    await db.listeners.clear()
    await db.routes.clear()
    await db.clusters.clear()
    await db.endpoints.clear()

    try {
        await db.bootstrap.add(cfg.getBootstrapConfig());
        await db.listeners.bulkAdd(cfg.getListenerConfigs())
        await db.routes.bulkAdd(cfg.getRouteConfigs())
        await db.clusters.bulkAdd(cfg.getClusterConfigs())
        await db.endpoints.bulkAdd(cfg.getEndpointConfigs())
    } catch (error) {
        console.log(error);
    }
}

export const config_dump_cache = async (key) => {
    console.log('start', key);
    const ret = await db.configs.get({ "key": key })
    console.log('end', ret);
    return ret
}

export const statistic = async () => {
    // const lcd = await config_dump_cache("type.googleapis.com/envoy.admin.v3.ListenersConfigDump")
    // const rcd = await config_dump_cache("type.googleapis.com/envoy.admin.v3.RoutesConfigDump")
    // const ccd = await config_dump_cache("type.googleapis.com/envoy.admin.v3.ClustersConfigDump")
    // const ecd = await config_dump_cache("type.googleapis.com/envoy.admin.v3.EndpointsConfigDump")

    return {
        listeners: { static: lcd.static_listeners.length, dynamic: lcd.dynamic_listeners.length },
        routes: { static: rcd.static_route_configs.length, dynamic: rcd.dynamic_route_configs.length },
        clusters: { static: ccd.static_clusters.length, dynamic: ccd.dynamic_active_clusters.length },
        endpoints: { static: ecd.static_endpoint_configs.length, dynamic: ecd.dynamic_endpoint_configs.length },
    }
}

export const query = async (table, param) => {
    param.page_no = param.page_no || 1
    param.page_size = param.page_size || 20
    const { page_no, page_size } = param
    const offset = (page_no - 1) * page_size

    let sometable = db[table]
    if (param.name) {
        sometable = sometable.where("name").equalsIgnoreCase(param.name)
    }

    const configs = await sometable.offset(offset).limit(page_size).toArray()
    return { items: configs, total: await sometable.count() }
}

export const bootstrapConfig = async () => {
    return await db.bootstrap.toCollection().last()
}

export const listenerConfigs = async (param) => { return query('listeners', param) }

export const routeConfigs = async (param) => { return query('routes', param) }

export const clusterConfigs = async (param) => { return query('clusters', param) }

export const endpointConfigs = async (param) => { return query('endpoints', param) }

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