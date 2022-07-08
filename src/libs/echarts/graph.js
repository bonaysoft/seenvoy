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
            legend: [ // 增加图示标签，我们可以点击图示隐藏相关节点
                {
                    x: 'right',
                    show: true,
                    data: ['listener', 'route', 'cluster', 'endpoint']
                }
            ],
            // animation: false,
            series: [
                {
                    type: 'graph', // 类型设置为关系图
                    // legendHoverLink: true,  // 可以点击图例来隐藏一个组
                    layout: 'force',
                    categories: [
                        { name: 'listener', symbolSize: 180 },
                        { name: 'route', symbolSize: 120 },
                        { name: 'cluster', symbolSize: 60 },
                        { name: 'endpoint', symbolSize: 30 }
                    ],
                    force: {
                        repulsion: [1000, 1200], //每个节点之间的斥力因子，越大离的越远
                        layoutAnimation: true,
                        friction: 0.3, //刷新时节点的移动速度，越大越快，0 - 1 之间
                        edgeLength: [100, 130] //两节点之间的距离
                    },
                    label: {
                        show: true, // 节点圆盘上的文字
                        fontStyle: 'italic', //文字风格，normal，italic，oblique 三种可选
                        fontSize: 12,
                        color: '#000000',
                    },
                    symbolSize: 60, //全局节点尺寸
                    itemStyle: {  // 给节点加上阴影，显着立体
                        shadowColor: '#C0C0C0',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    //让节点可以通过鼠标拖拽和移动的设置
                    roam: true, //开启鼠标平移及缩放
                    draggable: true, //节点是否支持鼠标拖拽。
                    edgeSymbol: ['circle', 'arrow'],//两节点连线的样式
                    edgeSymbolSize: [5, 10],
                    cursor: 'pointer', //鼠标悬浮时在图形元素上时鼠标的样式
                    labelLayout: {
                        moveOverlap: 'shiftX', //标签重叠时，挪动标签防止重叠
                        draggable: true //节点标签是否允许鼠标拖拽定位
                    },
                    emphasis: {
                        scale: true, //节点放大效果
                        focus: 'adjacency'
                    },
                    lineStyle: {
                        color: '#3d3d3f',
                        width: 2,
                        curveness: 0 //节点连线的曲率，0-1 越大越弯。
                    },
                    force: {
                        repulsion: 200,
                        edgeLength: 420,
                    },
                    focusNodeAdjacency: true,
                    edgeLabel: {
                        fontSize: 20, //关系（也即线）上的标签字体大小
                    },
                    data: data.data,
                    links: data.links,
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

export const dispose = () => {
    echarts.dispose()
}