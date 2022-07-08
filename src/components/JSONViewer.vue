<script>
import { ref } from '@vue/reactivity';
import JsonViewer from 'vue-json-viewer'
export default {
    components: {
        JsonViewer,
    },
    props: {
        modelValue: Object,
        close: Function,
    },
    setup(props) {
        const drawerVisible = ref(true)
        const onClose = () => {
            drawerVisible.value = false
            props.close()
        }

        console.log(112233, props.modelValue);
        return {
            drawerVisible,
            onClose
        };
    },
}
</script>

<template>
    <a-drawer title="JSONViewer" size="large" :visible="drawerVisible" @close="onClose" width="950" destroyOnClose>
        <json-viewer :value="modelValue" :expand-depth="5" copyable sort></json-viewer>
    </a-drawer>
</template>

<style>
</style>