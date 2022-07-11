<script>
import { defineComponent, onMounted, ref } from "@vue/runtime-core";
import { bootstrapConfig, statistic } from "../libs/envoy";

export default defineComponent({
    setup() {
        const object2array = (obj, excludes) => {
            let objKeys = Object.keys(obj)
            if (excludes) {
                objKeys = objKeys.filter(k => !excludes.includes(k))
            }

            return objKeys.map(key => {
                return {
                    name: key,
                    value: obj[key]
                }
            })
        }

        const stats = ref({
            listeners: {},
            clusters: {},
            routes: {},
            endpoints: {},
        });
        const infos = ref([]);
        onMounted(() => {
            statistic().then(data => {
                console.log(data);
                stats.value = data
            })
            bootstrapConfig().then(data => {
                console.log(data);

                infos.value.push({ title: 'Admin', rows: object2array(data.admin) })
                infos.value.push({ title: 'Node', rows: object2array(data.node, ['metadata', 'extensions']) })
                infos.value.push({ title: 'NodeMetadata', rows: object2array(data.node.metadata) })
                infos.value.push({ title: 'NodeExtensions', rows: data.node.extensions.map(el => { return { name: el.name, value: el.category } }) })
                infos.value.push({ title: 'Tracing', rows: object2array(data.tracing.http) })
            });
        });

        return {
            stats,
            infos,
        };
    },
});

</script>

<template>
    <div class="container">
        <a-card title="Overview" class="overview" :bordered="false" :headStyle="{ padingLeft: 0 }">
            <a-row>
                <a-col :span="4">
                    <a-statistic title="Listeners" :value="stats.listeners.dynamic" style="margin-right: 50px" />
                </a-col>
                <a-col :span="4">
                    <a-statistic title="Routes" :value="stats.routes.dynamic" style="margin-right: 50px" />
                </a-col>
                <a-col :span="4">
                    <a-statistic title="Clusters" :value="stats.clusters.dynamic" style="margin-right: 50px" />
                </a-col>
                <a-col :span="4">
                    <a-statistic title="Endpoints" :value="stats.endpoints.dynamic" style="margin-right: 50px" />
                </a-col>
            </a-row>
        </a-card>
        <a-card v-for="(info, idx) in infos" :key="idx" :title="info.title" :bordered="false">
            <a-descriptions :column="1" bordered>
                <a-descriptions-item v-for="(row, key) in info.rows" :key="key" :label="row.name">
                    <json-viewer v-if="typeof row.value === 'object'" :value="row.value" :expand-depth="5">
                    </json-viewer>
                    <span v-else>{{ row.value }}</span>
                </a-descriptions-item>
            </a-descriptions>
        </a-card>
    </div>
</template>

<style scoped>
/* .container {
    width: 800px;
    margin: 0 auto;
} */
</style>