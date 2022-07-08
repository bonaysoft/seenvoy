<script >
import { onMounted, onUnmounted, watch } from '@vue/runtime-core';
import { routeConfigs } from '../libs/envoy';
import { defineComponent, ref } from 'vue';
import { openDrawer } from '~/libs/drawer';
import JSONViewer from '../components/JSONViewer.vue';
import { useRoute, useRouter } from 'vue-router';
export default defineComponent({
  setup() {
    const route = useRoute();
    const dataSource = ref([])
    const dataRefresh = (search) => {
      console.log(search);
      routeConfigs().then(data => {
        data = search.name ? data.filter(el => el.name == search.name) : data
        dataSource.value = data.map((el, idx) => { el.key = idx; return el })
      });
    }

    onMounted(() => dataRefresh(route.query));
    watch(route, (to) => dataRefresh(to.query))
    const onSearch = (search) => dataRefresh(search)
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
