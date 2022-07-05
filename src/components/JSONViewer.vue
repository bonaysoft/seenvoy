<script>
import { ref } from '@vue/reactivity';
import JsonViewer from 'vue-json-viewer'
export default {
    components: {
        JsonViewer,
    },
    props: {
        jsondata: Object
    },
    setup(props) {
        const drawerVisible = ref(true)
        const onClose = () => {
            drawerVisible.value = false
        }

        console.log(112233, props.jsondata);
        return {
            drawerVisible,
            onClose
        };
    },
}
</script>

<template>
    <a-drawer title="JSONViewer" size="large" :visible="drawerVisible" @close="onClose" width="950">
        <json-viewer :value="jsondata" :expand-depth="5" copyable sort></json-viewer>
    </a-drawer>
</template>

<style>
</style>