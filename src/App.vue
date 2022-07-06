<script>
import { defineComponent, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export default defineComponent({
    setup() {
        const route = useRoute();
        const router = useRouter();
        const handleClick = (e) => {
            router.push({ name: e.key })
        };

        const selectedKeys = ref([]);
        watch(route, (to) => {
            selectedKeys.value = [to.name]
        })
        return {
            selectedKeys,
            handleClick,
        };
    },
});
</script>

<template>
    <a-layout class="layout" :style="{ height: '100vh', overflow: 'auto' }">
        <a-layout-header>
            <div class="logo">Seenvoy</div>

            <a-menu theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }" v-model:selectedKeys="selectedKeys"
                @click="handleClick">
                <a-menu-item key="Overview">Overview</a-menu-item>
                <a-menu-item key="Listeners">Listeners</a-menu-item>
                <a-menu-item key="Routes">Routes</a-menu-item>
                <a-menu-item key="Clusters">Clusters</a-menu-item>
                <!-- <a-menu-item key="Endpoints">Endpoints</a-menu-item> -->
            </a-menu>
        </a-layout-header>
        <a-layout-content style="padding: 0">
            <div :style="{ background: '#fff' }">
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

#app .ant-layout-header {
    padding: 0 10px;
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

[data-theme='dark'] .site-layout-content {
    background: #141414;
}
</style>