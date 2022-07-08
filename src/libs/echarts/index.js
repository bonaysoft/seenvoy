import { build, dispose } from "./graph"

export const useGraph = () => {
    return {
        build,
        dispose
    }
}