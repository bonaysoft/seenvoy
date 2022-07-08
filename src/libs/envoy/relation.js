import { Configs } from ".";

const typeGetters = {
    "type.googleapis.com/envoy.extensions.filters.network.tcp_proxy.v3.TcpProxy": (obj) => {
        return { type: "cluster", value: obj.cluster };
    },
    "type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager": (obj) => {
        return { type: "route", value: obj.rds?.route_config_name || 'Inline Route' };
    }
}

const typeHandlers = {
    'type.googleapis.com/envoy.config.listener.v3.Listener': (config, config_dump) => {
        let chains = [];
        if (config.default_filter_chain) {
            chains.push(config.default_filter_chain)
        }
        chains.push(...config.filter_chains)
        console.log(chains);

        const result = []
        chains.forEach(chain => {
            console.log(chain);
            chain.filters.forEach(async filter => {
                const fType = filter.typed_config["@type"]
                console.log(fType);
                if (!typeGetters[fType]) return

                const target = typeGetters[fType](filter.typed_config)
                const links = useConfigRelationship(findTargetConfig(target, config_dump), config_dump)
                result.push(...links)

                result.push({ source: `listener: ${config.name}`, target: `${target.type}: ${target.value}`, value: 1 })
            })
        })
        return result
    },
    'type.googleapis.com/envoy.config.route.v3.RouteConfiguration': (config, config_dump) => {
        const result = []
        config.virtual_hosts.forEach(vh => {
            vh.routes.forEach(route => {
                const target = route.route.cluster
                // console.log(target);
                const links = useConfigRelationship(findTargetConfig({ type: 'cluster', value: target }, config_dump), config_dump)
                result.push(...links)

                result.push({ source: `route: ${config.name}`, target: `cluster: ${target}`, value: 1 })
            })
        })
        return result
    },
    'type.googleapis.com/envoy.config.cluster.v3.Cluster': (config, config_dump) => {
        if (config.type == 'EDS') {
            return useConfigRelationship(findTargetConfig({ type: 'endpoint', value: config.eds_cluster_config.service_name }, config_dump), config_dump)
        }

        return []
    },
    'type.googleapis.com/envoy.config.endpoint.v3.ClusterLoadAssignment': (config, config_dump) => {
        const result = []
        config.endpoints?.forEach(endpoint => {
            endpoint.lb_endpoints.forEach(lb_endpoint => {
                const target = lb_endpoint.endpoint.address.socket_address.address
                result.push({ source: `cluster: ${config.cluster_name}`, target: `endpoint: ${target}`, value: 1 })
            })
        }
        )
        return result
    }
}

export const findTargetConfig = (target, config_dump) => {
    const configTool = new Configs(config_dump);
    if (target.type === 'route') {
        return configTool.getRouteConfigs().find(c => c.name === target.value)
    }

    if (target.type === 'cluster') {
        return configTool.getClusterConfigs().find(c => c.name === target.value)
    }

    if (target.type === 'endpoint') {
        return configTool.getEndpointConfigs().find(c => c.cluster_name === target.value)
    }
}

export const useConfigRelationship = (cfg, config_dump) => {
    const type = cfg["@type"];
    console.log(type, cfg, config_dump);
    if (!typeHandlers[type]) return []
    const links = typeHandlers[type](cfg, config_dump)
    console.log(links);
    return links;
}