<template>
  <v-container grid-list-xl pa0>
    <v-layout row wrap pa0>
      <v-flex xs12>
        <h1>Welcome back {{displayName}}</h1>
        <p>This page uses the default layout which is a Vue component with a sidebar</p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

  export default {
    components: {},
    meteor: {
      displayName() {
        if (this.$store.state.user.profile) {
          return this.$store.state.user.profile.displayName;
        }
      },
    },
  };
</script>
