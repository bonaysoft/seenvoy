<script >
import { onMounted, onUnmounted } from '@vue/runtime-core';
import { endpointConfigs } from '../libs/envoy';
import { defineComponent, ref } from 'vue';
import { openDrawer } from '~/libs/drawer';
import JSONViewer from '../components/JSONViewer.vue';
export default defineComponent({
  setup() {
    const dataSource = ref([])
    onMounted(() => {
      endpointConfigs().then(data => {
        console.log(data);
        dataSource.value = data.map((el, idx) => { el.key = idx; return el })
      });
    });

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
      onDestinationClick,
      dataSource,
      columns: [
        {
          title: 'Name',
          dataIndex: 'cluster_name',
          key: 'name',
        },
        {
          title: 'Opeartion',
          key: 'action',
        },
      ],
    };
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

    <a-table :dataSource="dataSource" :columns="columns">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a @click="openJSONDrawer(record)">View</a>
        </template>
      </template>
    </a-table>
  </div>
</template>

<style>
</style>
