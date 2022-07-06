<script >
import { onMounted, onUnmounted, watch } from '@vue/runtime-core';
import { routeConfigs } from '../libs/envoy';
import { defineComponent, ref } from 'vue';
import { useSankey } from '../libs/echarts';
import { openDrawer } from '~/libs/drawer';
import JSONViewer from '../components/JSONViewer.vue';
import { useRoute } from 'vue-router';
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
      return data.map(el => {
        return {
          name: el.name,
          domains: el.domains.join(','),
          routes: el.routes.length
        }
      })
    }

    const openJSONDrawer = (row) => {
      openDrawer(JSONViewer, {
        jsondata: row
      })
    }

    const onDestinationClick = (row) => {
      console.log(row);
    }

    return {
      search: ref({}),
      listeners: ref([]),
      clusters: ref([]),
      openJSONDrawer,
      onSearch,
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
      },
      {
        title: 'Routes',
        dataIndex: 'routes',
      }],
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
