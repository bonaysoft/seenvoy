import * as echarts from "echarts";

const buildSankeyData = (data) => {
    const buildDataItem = (item) => {
        return { name: item.name }
    }

    const lcd = data.find(d => d["@type"].endsWith("ListenersConfigDump"))
    const rcd = data.find(d => d["@type"].endsWith("v3.RoutesConfigDump"))
    console.log(lcd);
    console.log(rcd);

    const result = new Array()
    // lcd.static_listeners.forEach(ln => { listeners.push(buildDataItem(ln.listener)) })
    lcd.dynamic_listeners.forEach(item => { result.push(buildDataItem(item.active_state.listener)) })
    rcd.dynamic_route_configs.forEach(item => { result.push(buildDataItem(item.route_config)) })
    console.log(result);
    return result

    return [{ "name": "outbound|8080||aws-map-tag-north.openfaas-fn.svc.cluster.local" }, { "name": "10.21.230.4:8080" }, { "name": "10.21.241.156:8080" }, { "name": "10.21.248.81:8080" }, { "name": "outbound|8080||cmdb-sync-baidu-spec-inventory.openfaas-fn.svc.cluster.local" }]
}

const buildSankeyLinks = (raw_data) => {
    const lcd = raw_data.find(d => d["@type"].endsWith("ListenersConfigDump"))
    const rcd = raw_data.find(d => d["@type"].endsWith("v3.RoutesConfigDump"))
    lcd.dynamic_listeners.forEach(item => {
        console.log('fc', item.active_state.listener.filter_chains);
    })

    const sankeyLinks = [];


    return sankeyLinks;
    return [{ "source": "0.0.0.0_8080", "target": "8080", "value": 58 }, { "source": "8080", "target": "PassthroughCluster", "value": 1 }, { "source": "8080", "target": "outbound|8080||apollo-api.openfaas-fn.svc.cluster.local", "value": 1 }, { "source": "outbound|8080||apollo-api.openfaas-fn.svc.cluster.local", "target": "10.21.230.27:8080", "value": 1 }, { "source": "8080", "target": "outbound|8080||app-api.openfaas-fn.svc.cluster.local", "value": 1 }]
}

export const build = (domid, data) => {
    var dom = document.getElementById(domid);
    var chart = echarts.init(dom);
    var app = {};
    var option;

    console.log(data);
    chart.setOption(
        (option = {
            // title: {
            //     text: 'Sankey Diagram'
            // },
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove'
            },
            series: [
                {
                    type: 'sankey',
                    data: buildSankeyData(data),
                    links: buildSankeyLinks(data),
                    emphasis: {
                        focus: 'adjacency'
                    },
                    nodeAlign: 'left',
                    levels: [
                        {
                            depth: 0,
                            itemStyle: {
                                color: '#fbb4ae'
                            },
                            lineStyle: {
                                color: 'source',
                                opacity: 0.6
                            }
                        },
                        {
                            depth: 1,
                            itemStyle: {
                                color: '#b3cde3'
                            },
                            lineStyle: {
                                color: 'source',
                                opacity: 0.6
                            }
                        },
                        {
                            depth: 2,
                            itemStyle: {
                                color: '#ccebc5'
                            },
                            lineStyle: {
                                color: 'source',
                                opacity: 0.6
                            }
                        },
                        {
                            depth: 3,
                            itemStyle: {
                                color: '#decbe4'
                            },
                            lineStyle: {
                                color: 'source',
                                opacity: 0.6
                            }
                        }
                    ],
                    lineStyle: {
                        color: 'source',
                        curveness: 0.5
                    }
                }
            ]
        })
    );

    if (option && typeof option === 'object') {
        chart.setOption(option);
    }
    window.onresize = function () {
        //自适应大小
        chart.resize();
    };
}