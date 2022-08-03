<script >
import { onMounted, onUnmounted, watch } from '@vue/runtime-core';
import { routeConfigs } from '../libs/envoy';
import { defineComponent, ref, computed } from 'vue';
import { openDrawer } from '~/libs/drawer';
import JSONViewer from '../components/JSONViewer.vue';
import { useRoute, useRouter } from 'vue-router';
import { usePaginationS } from '~/libs/pagination';
export default defineComponent({
  setup() {
    const { data, pagination, loading, handleTableChange, run } = usePaginationS(routeConfigs)
    const onSearch = (search) => run(search)
    const dataSource = computed(() => {
      return data.value?.items.map((el, idx) => { el.key = idx; return el })
    });
    const inner_format = (ln) => {
      console.log(ln);
      let data = [];
      data.push(...ln.virtual_hosts)
      return data.map((el, idx) => {
        return {
          key: idx,
          name: el.name,
          domains: el.domains.join(','),
          routes: el.routes,
          routesCount: el.routes.length
        }
      })
    }
    const routeFormat = (routes) => {
      return routes.map((route, idx) => {
        return {
          key: idx,
          name: route.name,
          match: Object.keys(route.match).map(key => `${key}: ${route.match[key]}`).join(','),
          route: route.route,
        }
      })
    }

    const openJSONDrawer = (row) => {
      openDrawer(JSONViewer, {
        modelValue: row
      })
    }

    const router = useRouter();
    const onDestinationClick = (cluster) => {
      router.push({ name: 'Clusters', query: { name: cluster } })
    }

    return {
      search: ref({}),
      listeners: ref([]),
      clusters: ref([]),
      openJSONDrawer,
      onSearch,
      onDestinationClick,
      inner_format,
      routeFormat,
      dataSource,
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Opeartion',
          key: 'action',
        },
      ],
      innerColumns: [{
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Domains',
        dataIndex: 'domains',
        ellipsis: true,
      },
      {
        title: 'Routes',
        dataIndex: 'routesCount',
        width: 80,
      }],
      routeColumns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Match',
          dataIndex: 'match',
        },
        {
          title: 'DestCluster',
          dataIndex: ['route', 'cluster'],
          key: 'destination',
        },
        {
          title: 'Timeout',
          dataIndex: ['route', 'timeout'],
          key: 'timeout',
          width: 80,
        },
      ],
      loading,
      pagination,
      handleTableChange
    };
  },
});

</script>

<template>
  <div style="height: 100%">
    <a-form layout="inline" :model="search" @submit="onSearch(search)">
      <a-form-item label="Name">
        <a-input style="width: 200px" v-model:value="search.name"> </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">Search</a-button>
      </a-form-item>
    </a-form>

    <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :pagination="pagination" :defaultExpandedRowKeys="[0]"
      @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a @click="openJSONDrawer(record)">View</a>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <a-table size="small" :columns="innerColumns" :data-source="inner_format(record)" :pagination="false">
          <template #expandedRowRender="{ record }">
            <a-table size="small" :columns="routeColumns" :data-source="routeFormat(record.routes)" :pagination="false">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'destination'">
                  <a @click="onDestinationClick(record.route.cluster)">{{ record.route.cluster }}</a>
                </template>
              </template>
            </a-table>
          </template>
        </a-table>
      </template>
    </a-table>
  </div>
</template>

<style>
</style>
