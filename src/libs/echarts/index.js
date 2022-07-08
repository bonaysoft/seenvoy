import { build, dispose } from "./sankey"

export const useSankey = () => {
    return {
        build,
        dispose
    }
}