<template>
    <div>
        <p>99666666</p>
        <p>{{ finalPath }}</p>
    </div>
</template>
<script>
export default {
    data() {
        return {
            finalPath: localStorage.getItem("sysName")
        }
    }
}
</script>
