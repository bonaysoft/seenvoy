import { computed } from 'vue';
import { usePagination } from 'vue-request';
import { useRoute } from 'vue-router';

export const usePaginationS = (service) => {
    const route = useRoute();
    const { data, run, loading, current, pageSize, total, } = usePagination(service, {
        defaultParams: [
            {
                page_size: 20,
                ...route.query
            },
        ],
        pagination: {
            currentKey: 'page_no',
            pageSizeKey: 'page_size',
        },
    });

    const pagination = computed(() => ({
        total: total.value,
        current: current.value,
        pageSize: pageSize.value,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    }));

    const handleTableChange = (pag, filters, sorter) => {
        run({
            page_no: pag?.current,
            page_size: pag.pageSize,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
        });
    };

    return {
        data,
        loading,
        pagination,
        handleTableChange,
        run,
    }
}