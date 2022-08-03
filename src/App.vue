<script>
import { defineComponent, watch, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sync_config_dump } from './libs/envoy';
export default defineComponent({
    setup() {
        const route = useRoute();
        const router = useRouter();
        const loading = ref(false);
        const spinning = ref(false);
        const handleClick = (e) => {
            router.push({ name: e.key })
        };

        const lastSync = ref(localStorage.getItem("lastSync"));
        const onSync = (e) => {
            console.log(e);
            loading.value = true;
            sync_config_dump(true).then(() => {
                console.log('sync success');
                lastSync.value = new Date().toLocaleString()
                localStorage.setItem("lastSync", lastSync.value);
                loading.value = false;
                spinning.value = false
            });
        };

        onMounted(() => {
            if (!lastSync.value) {
                spinning.value = true
                onSync()
            }
        });

        const selectedKeys = ref([]);
        watch(route, (to) => {
            selectedKeys.value = [to.name]
            lastSync.value = localStorage.getItem("lastSync");
        })
        return {
            selectedKeys,
            handleClick,
            lastSync,
            loading,
            spinning,
            onSync,
        };
    },
});
</script>

<template>
    <a-layout class="layout">
        <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
            <div class="logo">Seenvoy</div>
            <div class="menubar">
                <a-menu theme="dark" mode="horizontal" :style="{ width: '80%', lineHeight: '64px' }"
                    v-model:selectedKeys="selectedKeys" @click="handleClick">
                    <a-menu-item key="Overview">Overview</a-menu-item>
                    <a-menu-item key="Listeners">Listeners</a-menu-item>
                    <a-menu-item key="Routes">Routes</a-menu-item>
                    <a-menu-item key="Clusters">Clusters</a-menu-item>
                    <!-- <a-menu-item key="Endpoints">Endpoints</a-menu-item> -->
                </a-menu>
            </div>
            <div class="syncbar">
                <span v-show="lastSync" style="margin-right: 10px">LastSync: {{ lastSync }} </span>
                <a-button type="primary" size="small" :loading="loading" @click="onSync">Sync</a-button>
            </div>
        </a-layout-header>
        <a-layout-content :style="{ padding: '0 50px', marginTop: '84px' }">
            <div :style="{ background: '#fff', padding: '24px', minHeight: '900px' }">
                <a-spin :spinning="spinning">
                    <router-view></router-view>
                </a-spin>
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

.menubar {
    display: inline-block;
    width: 50%;
}

.syncbar {
    display: block;
    float: right;
    color: #fff;
}
</style>