<script >
import { onMounted, onUnmounted } from '@vue/runtime-core';
import { clusters, config_dump, listeners } from '../libs/envoy';
import { defineComponent, ref } from 'vue';
import { useSankey } from '../libs/echarts';
export default defineComponent({
  setup() {
    const sankey = useSankey();
    onMounted(() => {
      config_dump().then((data) => {
        sankey.build("container", data);
      });
      
      listeners().then(console.log);
      clusters().then(console.log);
    });

    onUnmounted(() => {
      // echart.dispose;
    });

    const handleChange = (e) => {
      console.log(e);
    };

    return {
      search: ref({}),
      listeners: ref([]),
      clusters: ref([]),
      handleChange,
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

    <div id="container" style="height: 100%"></div>
  </div>
</template>

<style>
</style>
