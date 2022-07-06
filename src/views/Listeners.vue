<script >
import { onMounted, onUnmounted } from '@vue/runtime-core';
import { listenerConfigs } from '../libs/envoy';
import { defineComponent, ref } from 'vue';
import { openDrawer } from '~/libs/drawer';
import JSONViewer from '../components/JSONViewer.vue';
import { useRouter } from 'vue-router';
export default defineComponent({
  setup() {
    const dataSource = ref([])
    onMounted(() => {
      listenerConfigs().then(data => {
        console.log(data);
        dataSource.value = data.map(el => {
          el.name = el.name || `${el.address.socket_address.address}_${el.address.socket_address.port_value}`;
          el.key = el.name
          el.traffic_direction = el.traffic_direction || 'UNSPECIFIED'
          return el
        })
      });
    });

    const inner_format = (ln) => {
      console.log(ln);
      let data = [];
      if (ln.default_filter_chain) {
        data.push(ln.default_filter_chain)
      }
      data.push(...ln.filter_chains)
      return data.map(el => {
        const match = el.filter_chain_match ? `Trans: ${el.filter_chain_match.transport_protocol}; App: ${el.filter_chain_match.application_protocols?.join(',')}` : 'ALL'
        const finalFilter = el.filters.at(-1)
        const cfg = finalFilter.typed_config

        return {
          name: finalFilter.name,
          match,
          totype: cfg.cluster ? 'Cluster' : 'Route',
          destination: cfg.cluster || (cfg.route_config ? cfg.route_config.name : cfg.rds.route_config_name)
        }
      })
    }

    const openJSONDrawer = (row) => {
      openDrawer(JSONViewer, {
        jsondata: row
      })
    }

    const router = useRouter();
    const onDestinationClick = (row) => {
      console.log(row);
      router.push({ name: `${row.totype}s`, query: { name: row.destination } })
    }

    return {
      search: ref({}),
      listeners: ref([]),
      clusters: ref([]),
      openJSONDrawer,
      onDestinationClick,
      inner_format,
      dataSource,
      columns: [
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
      ],
      innerColumns: [{
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
      }],
      pagination: {
        pageSize: 50,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      },
    }
  },
});

</script>

<template>
  <div style="height: 100%">
    <a-form layout="inline" :model="search">
      <a-form-item label="Listener">
        <a-select ref="select" style="width: 120px" v-model:value="search.listener" :options="listeners">
        </a-select>
      </a-form-item>
      <a-form-item label="Cluster">
        <a-select ref="select" style="width: 120px" v-model:value="search.cluster" :options="clusters">
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary">Search</a-button>
      </a-form-item>
    </a-form>

    <a-table :dataSource="dataSource" :columns="columns" :pagination="pagination">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a @click="openJSONDrawer(record)">View</a>
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
