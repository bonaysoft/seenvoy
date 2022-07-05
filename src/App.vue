<template>
    <a-layout class="layout" :style="{ height: '100vh', overflow: 'auto' }">
        <a-layout-header>
            <div class="logo">Seenvoy</div>


        </a-layout-header>
        <a-layout-content style="padding: 0">
            <div :style="{ background: '#fff', height: '100vh' }">
                <router-view></router-view>
            </div>
        </a-layout-content>
    </a-layout>
</template>
<script>
import { defineComponent, ref } from 'vue';
export default defineComponent({
    setup() {
        return {
            selectedKeys: ref(['2']),
        };
    },

});
</script>
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