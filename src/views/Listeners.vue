<script >
import { listenerConfigs } from '../libs/envoy';
import { defineComponent, ref, computed } from 'vue';
import { openDrawer } from '~/libs/drawer';
import JSONViewer from '../components/JSONViewer.vue';
import Graph from '../components/Graph.vue';
import { useRouter } from 'vue-router';
import { usePaginationS } from '~/libs/pagination';
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'PORT',
    dataIndex: ['address', 'socket_address', 'port_value'],
    key: 'port',
  },
  {
    title: 'DIRECTION',
    dataIndex: 'traffic_direction',
    key: 'direction',
  },
  {
    title: 'Opeartion',
    key: 'action',
  },
]
const innerColumns = [{
  title: 'FilterName',
  dataIndex: 'name',
},
{
  title: 'Match',
  dataIndex: 'match',
},
{
  title: 'To',
  dataIndex: 'totype',
},
{
  title: 'DESTINATION',
  dataIndex: 'destination',
  key: 'destination',
}]

export default defineComponent({
  setup() {
    const { data, pagination, loading, run, handleTableChange } = usePaginationS(listenerConfigs)
    const onSearch = (search) => run(search)
    const dataSource = computed(() => data.value?.items.map(el => {
      el.name = el.name || `${el.address.socket_address.address}_${el.address.socket_address.port_value}`;
      el.key = el.name
      return el
    }));

    const matchFormat = (filter_chain_match) => {
      if (!filter_chain_match || Object.keys(filter_chain_match) == 0) return 'ALL'

      const keyFormats = {
        'transport_protocol': 'Trans',
        'application_protocols': 'App',
        'server_names': 'SNI',
        'prefix_ranges': 'Addr',
        'destination_port': 'DestPort',
      }
      let matchArr = []
      Object.keys(filter_chain_match).forEach(key => {
        let value = filter_chain_match[key]
        if (key == 'prefix_ranges') {
          let addr = []
          filter_chain_match[key].forEach(el => {
            addr.push(`${el.address_prefix}/${el.prefix_len}`)
          });
          value = addr.join(',')
        }

        matchArr.push(`${keyFormats[key] || key}: ${value}`)
      });

      return matchArr.join('; ')
    }

    const inner_format = (ln) => {
      console.log(ln);
      let data = [];
      if (ln.default_filter_chain) {
        data.push(ln.default_filter_chain)
      }
      data.push(...ln.filter_chains)
      return data.map(el => {
        const finalFilter = el.filters.at(-1)
        const cfg = finalFilter.typed_config
        return {
          name: finalFilter.name,
          match: matchFormat(el.filter_chain_match),
          totype: cfg.cluster ? 'Cluster' : 'Route',
          destination: cfg.cluster || (cfg.route_config ? cfg.route_config.name : cfg.rds.route_config_name)
        }
      })
    }

    const openDrawerWith = (type, row) => {
      const components = { json: JSONViewer, graph: Graph }
      openDrawer(components[type], {
        modelValue: row
      })
    }

    const router = useRouter();
    const onDestinationClick = (row) => {
      console.log(row);
      router.push({ name: `${row.totype}s`, query: { name: row.destination } })
    }

    return {
      search: ref({ direction: '' }),
      listeners: ref([]),
      clusters: ref([]),
      openDrawerWith,
      onDestinationClick,
      onSearch,
      inner_format,
      dataSource,
      columns,
      innerColumns,
      loading,
      pagination,
      handleTableChange,
    }
  },
});

</script>

<template>
  <div style="height: 100%">
    <a-form layout="inline" :model="search" @submit="onSearch(search)">
      <a-form-item label="Direction">
        <a-select ref="select" style="width: 150px" v-model:value="search.direction">
          <a-select-option value="">ALL</a-select-option>
          <a-select-option value="INBOUND">INBOUND</a-select-option>
          <a-select-option value="OUTBOUND">OUTBOUND</a-select-option>
          <a-select-option value="UNSPECIFIED">UNSPECIFIED</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="Name">
        <a-input style="width: 200px" v-model:value="search.name"> </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">Search</a-button>
      </a-form-item>
    </a-form>

    <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :pagination="pagination"
      @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="openDrawerWith('json', record)">View</a>
            <a @click="openDrawerWith('graph', record)">Graph</a>
          </a-space>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <a-table size="small" :columns="innerColumns" :data-source="inner_format(record)" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'destination'">
              <a @click="onDestinationClick(record)">{{ record.destination }}</a>
            </template>
            <template v-else-if="column.key === 'operation'">
              <span class="table-operation">
                <a>Pause</a>
                <a>Stop</a>
                <a-dropdown>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item>Action 1</a-menu-item>
                      <a-menu-item>Action 2</a-menu-item>
                    </a-menu>
                  </template>
                  <a>
                    More
                    <down-outlined />
                  </a>
                </a-dropdown>
              </span>
            </template>
          </template>
        </a-table>
      </template>
    </a-table>
  </div>
</template>

<style>
</style>
