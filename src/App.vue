<script>
import { defineComponent, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sync_config } from './libs/envoy';
export default defineComponent({
    setup() {
        const route = useRoute();
        const router = useRouter();
        const handleClick = (e) => {
            router.push({ name: e.key })
        };

        const lastSync = ref('');
        const onSync = (e) => {
            console.log(e);
            sync_config(true).then(() => {
                console.log('sync success');
                localStorage.setItem("lastSync", new Date().toISOString());
            });
        };

        const selectedKeys = ref([]);
        watch(route, (to) => {
            selectedKeys.value = [to.name]
            lastSync.value = localStorage.getItem("lastSync");
        })
        return {
            selectedKeys,
            handleClick,
            lastSync,
            onSync,
        };
    },
});
</script>

<template>
    <a-layout class="layout">
        <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
            <div class="logo">Seenvoy</div>

            <a-menu theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }" v-model:selectedKeys="selectedKeys"
                @click="handleClick">
                <a-menu-item key="Overview">Overview</a-menu-item>
                <a-menu-item key="Listeners">Listeners</a-menu-item>
                <a-menu-item key="Routes">Routes</a-menu-item>
                <a-menu-item key="Clusters">Clusters</a-menu-item>
                <!-- <a-menu-item key="Endpoints">Endpoints</a-menu-item> -->
            </a-menu>
            <div style="float: right">
                LastSync: {{ lastSync }} <a-button size="small" @click="onSync">Sync</a-button>
            </div>
        </a-layout-header>
        <a-layout-content :style="{ padding: '0 50px', marginTop: '84px' }">
            <div :style="{ background: '#fff', padding: '24px', minHeight: '900px' }">
                <router-view></router-view>
            </div>
        </a-layout-content>
    </a-layout>
</template>
<style>
html,
body {
    height: 100%;
    margin: 0;
}

#app {
    /* font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%; */
    /* margin-top: 60px; */
}

#app .logo {
    float: left;
    color: #fff;
    width: 100px;
    font-size: 20px;
    font-weight: bold;
}

.ant-row-rtl #app .logo {
    float: right;
    margin: 16px 0 16px 24px;
}
</style>