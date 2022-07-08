<script >
import { onMounted, onUnmounted } from '@vue/runtime-core';
import { buildEndpointName, clusterConfigs, clusterStatuses, endpointConfigs } from '../libs/envoy';
import { defineComponent, ref, watch } from 'vue';
import { openDrawer } from '~/libs/drawer';
import JSONViewer from '../components/JSONViewer.vue';
import { useRoute } from 'vue-router';
export default defineComponent({
  setup() {
    const route = useRoute();
    const dataSource = ref([])
    const dataRefresh = async (search) => {
      const eds = await endpointConfigs();
      let epConfigs = []
      eds.forEach(ed => {
        ed.endpoints?.forEach(el => {
          el.lb_endpoints.forEach(ep => {
            if (!epConfigs[ed.cluster_name]) {
              epConfigs[ed.cluster_name] = {}
            }
            epConfigs[ed.cluster_name][buildEndpointName(ep.endpoint)] = ep
          })
        });
      });

      const statuses = await clusterStatuses();
      let clusterEndpoints = []
      statuses.forEach(el => {
        el.host_statuses?.map(endpoint => {
          endpoint.config = epConfigs[el.name][buildEndpointName(endpoint)]
        })
        clusterEndpoints[el.name] = el
      });

      let data = await clusterConfigs()
      data = search.name ? data.filter(el => el.name == search.name) : data
      dataSource.value = data.map((el, idx) => {
        return { key: idx, cluster: el, endpoint: clusterEndpoints[el.name], endpoints_count: clusterEndpoints[el.name].host_statuses?.length || 0 }
      })
      console.log(dataSource.value);
    };

    onMounted(() => dataRefresh(route.query));
    watch(route, (to) => dataRefresh(to.query))
    const onSearch = (search) => dataRefresh(search)

    const openJSONDrawer = (row) => {
      openDrawer(JSONViewer, {
        modelValue: row
      })
    }

    const inner_format = (endpoint) => {
      console.log(endpoint);
      return endpoint.host_statuses?.map(el => {
        return {
          locality: Object.values(el.locality).join('/') || '-',
          endpoint: buildEndpointName(el),
          status: el.health_status.eds_health_status,
          outlier_check: el.health_status.failed_outlier_check || 'OK',
          raw: el.config,
        }
      })
    }

    return {
      search: ref({}),
      onSearch,
      listeners: ref([]),
      clusters: ref([]),
      openJSONDrawer,
      inner_format,
      dataSource,
      columns: [
        {
          title: 'Name',
          dataIndex: ['cluster', 'name'],
          key: 'name',
        },
        {
          title: 'Type',
          dataIndex: ['cluster', 'type'],
          key: 'type',
        },
        {
          title: 'Endpoints',
          dataIndex: 'endpoints_count',
        },
        {
          title: 'Opeartion',
          key: 'action',
        },
      ],
      innerColumns: [{
        title: 'LOCALITY',
        dataIndex: 'locality',
      }, {
        title: 'ENDPOINT',
        dataIndex: 'endpoint',
      },
      {
        title: 'STATUS',
        dataIndex: 'status',
      },
      {
        title: 'OUTLIER CHECK',
        dataIndex: 'outlier_check',
      },
      {
        title: 'Opeartion',
        key: 'action',
      },],
      pagination: {
        pageSize: 50,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      },
    };
  },
});

</script>

<template>
  <div style="height: 100%">
    <a-form layout="inline" :model="search">
      <a-form-item label="Name">
        <a-input style="width: 120px" v-model:value="search.name"> </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSearch(search)">Search</a-button>
      </a-form-item>
    </a-form>

    <a-table :dataSource="dataSource" :columns="columns" :pagination="pagination" :defaultExpandedRowKeys="[0]">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a @click="openJSONDrawer(record.cluster)">View</a>
        </template>
      </template>

      <template #expandedRowRender="{ record }">
        <a-table size="small" :columns="innerColumns" :data-source="inner_format(record.endpoint)" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <span class="table-operation">
                <a @click="openJSONDrawer(record.raw)">View</a>
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
