<script >
import { defineComponent, ref } from 'vue';
import { onMounted, onUnmounted } from '@vue/runtime-core';
import { config_dump, useConfigRelationship } from '../libs/envoy';
import { useGraph } from '../libs/echarts';
export default defineComponent({
  props: {
    modelValue: Object,
    close: Function,
  },
  setup(props) {
    const graph = useGraph();
    onMounted(async () => {
      console.log(112233, props.modelValue);
      const cfg = props.modelValue;
      const cd = await config_dump(true)
      const rdata = useConfigRelationship(cfg, cd);
      console.log(2233, rdata);

      let tMap = {}
      rdata.forEach(el => { tMap[el.target] = 1; tMap[el.source] = 1; });
      let data = Object.keys(tMap).map(key => { return { name: key, category: `${key.split(':').at(0)}` } })
      console.log(12311, data);

      graph.build("container", { data: data, links: rdata });
    });

    onUnmounted(() => {
      graph.dispose();
    });

    const drawerVisible = ref(true)
    const onClose = () => {
      drawerVisible.value = false
      props.close()
    }

    return {
      drawerVisible,
      onClose
    };
  },
});

</script>

<template>
  <a-drawer title="Graph" size="large" :visible="drawerVisible" @close="onClose" width="950" destroyOnClose>
    <div id="container" style="height: 100%"></div>
  </a-drawer>
</template>

<style>
</style>
