<script setup lang="ts">
import { onMounted } from 'vue'
import { mdiShieldAccount } from '@mdi/js'
import { useTeamsStore } from '@/stores/teams'
import TeamCard from '@/components/TeamCard.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'

const teamsStore = useTeamsStore()

onMounted(() => {
  teamsStore.fetchTeams()
})
</script>

<template>
  <div>
    <SectionHeader title="Equipes" subtitle="Conheça as equipes das Olimpíadas Internas" :icon="mdiShieldAccount" />

    <LoadingSkeleton v-if="teamsStore.loading" variant="entity" :count="6" />
    <ErrorState v-else-if="teamsStore.error" :message="teamsStore.error" @retry="() => teamsStore.fetchTeams(true)" />
    <EmptyState v-else-if="teamsStore.teams.length === 0" title="Nenhuma equipe cadastrada" :icon="mdiShieldAccount" />
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <TeamCard v-for="team in teamsStore.teams" :key="team.id" :team="team" />
    </div>
  </div>
</template>
