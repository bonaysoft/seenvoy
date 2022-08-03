import Dexie from 'dexie';

export const db = new Dexie('seenvoy');
db.version(7).stores({
    bootstrap: '++',
    listeners: '++, name, _static, traffic_direction, address.socket_address.port_value',
    routes: '++, name, _static',
    clusters: '++, name, _static',
    endpoints: '++, name, cluster_name, _static',
});

export const query = async (table, param) => {
    param.page_no = param.page_no || 1
    param.page_size = param.page_size || 20
    const { page_no, page_size } = param
    const offset = (page_no - 1) * page_size

    let sometable = db[table]
    if (param.name) {
        sometable = sometable.filter(el => el.name?.includes(param.name))
    }
    if (param.direction) {
        sometable = sometable.filter(el => el.traffic_direction === param.direction)
    }

    const total = await sometable.count();
    const items = await sometable.offset(offset).limit(page_size).toArray()
    return { items, total  }
}

export const count = async (table) => {
    return {
        static: await db[table].filter(el => el._static).count(),
        dynamic: await db[table].filter(el => !el._static).count(),
        total: await db[table].count(),
    }
}