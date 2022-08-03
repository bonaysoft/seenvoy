import { db } from "./db";

const typeGetters = {
    "type.googleapis.com/envoy.extensions.filters.network.tcp_proxy.v3.TcpProxy": (obj) => {
        return { type: "cluster", value: obj.cluster };
    },
    "type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager": (obj) => {
        return { type: "route", value: obj.rds?.route_config_name || 'Inline Route' };
    }
}

const typeHandlers = {
    'type.googleapis.com/envoy.config.listener.v3.Listener': async (config) => {
        let chains = [];
        if (config.default_filter_chain) { chains.push(config.default_filter_chain) }
        chains.push(...config.filter_chains)
        console.log('chains:', chains);

        const result = []
        for (const chain of chains) {
            for (const filter of chain.filters) {
                const fType = filter.typed_config["@type"]
                if (!typeGetters[fType]) continue

                const target = typeGetters[fType](filter.typed_config)
                console.log('fType:', fType, target);
                const links = await useConfigRelationship(await findTargetConfig(target))
                result.push(...links)
                result.push({ source: `listener: ${config.name}`, target: `${target.type}: ${target.value}`, value: 1 })
            }
        }

        console.log("Listener result:", result);
        return result
    },
    'type.googleapis.com/envoy.config.route.v3.RouteConfiguration': async (config) => {
        const result = []
        if (!config.virtual_hosts) return result;

        for (const route of config.virtual_hosts) {
            for (const route_entry of route.routes) {
                const target = route_entry.route.cluster
                const links = await useConfigRelationship(await findTargetConfig({ type: 'cluster', value: target }))
                result.push(...links)
                result.push({ source: `route: ${config.name}`, target: `cluster: ${target}`, value: 1 })
            }
        }
        console.log("RouteConfiguration result:", result);
        return result
    },
    'type.googleapis.com/envoy.config.cluster.v3.Cluster': async (config) => {
        if (config.type == 'EDS') {
            return await useConfigRelationship(await findTargetConfig({ type: 'endpoint', value: config.eds_cluster_config.service_name }))
        }

        return []
    },
    'type.googleapis.com/envoy.config.endpoint.v3.ClusterLoadAssignment': async (config) => {
        const result = []
        if (!config.endpoints) return result;

        for (const endpoint of config.endpoints) {
            for (const lb_endpoint of endpoint.lb_endpoints) {
                const target = lb_endpoint.endpoint.address.socket_address.address
                result.push({ source: `cluster: ${config.cluster_name}`, target: `endpoint: ${target}`, value: 1 })
            }
        }
        console.log("ClusterLoadAssignment result:", result);
        return result
    }
}

export const findTargetConfig = async (target) => {
    if (target.type === 'route') {
        return await db.routes.get({ name: target.value })
    }

    if (target.type === 'cluster') {
        return await db.clusters.get({ name: target.value })
    }

    if (target.type === 'endpoint') {
        return await db.endpoints.get({ cluster_name: target.value })
    }
}

export const useConfigRelationship = async (cfg) => {
    const type = cfg["@type"];
    console.log('cfg:', cfg);
    console.log('type:', type);
    if (!typeHandlers[type]) return []
    return await typeHandlers[type](cfg)
}