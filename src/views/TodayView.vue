<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { mdiCheckCircleOutline, mdiClockOutline, mdiPauseCircleOutline, mdiRecordCircle, mdiSleep } from '@mdi/js'
import { useMatchesStore } from '@/stores/matches'
import MatchCard from '@/components/MatchCard.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import { formatDateLong, isMatchUpcoming, todayIso } from '@/utils/date'

const matchesStore = useMatchesStore()

onMounted(() => {
  matchesStore.fetchToday()
})

const live = computed(() => matchesStore.today.filter((m) => m.status === 'live'))
const upcoming = computed(() =>
  matchesStore.today.filter((m) => m.status === 'scheduled' && isMatchUpcoming(m.date, m.time)),
)
const finished = computed(() =>
  matchesStore.today.filter((m) => m.status === 'finished' || (m.status === 'scheduled' && !isMatchUpcoming(m.date, m.time))),
)
</script>

<template>
  <div>
    <SectionHeader title="Jogos de hoje" :subtitle="formatDateLong(todayIso())" :icon="mdiClockOutline" />

    <LoadingSkeleton v-if="matchesStore.todayLoading" :count="6" />
    <ErrorState v-else-if="matchesStore.todayError" :message="matchesStore.todayError" @retry="matchesStore.fetchToday" />
    <EmptyState
      v-else-if="matchesStore.today.length === 0"
      title="Nenhum jogo hoje"
      message="Não há partidas programadas para o dia de hoje."
      :icon="mdiSleep"
    />
    <div v-else class="space-y-10">
      <section v-if="live.length > 0">
        <SectionHeader title="Ao vivo" :icon="mdiRecordCircle" />
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MatchCard v-for="m in live" :key="m.id" :match="m" :show-date="false" />
        </div>
      </section>

      <section>
        <SectionHeader title="Em breve" :icon="mdiPauseCircleOutline" />
        <EmptyState v-if="upcoming.length === 0" title="Sem jogos futuros hoje" message="Todos os jogos de hoje já começaram ou terminaram." :icon="mdiPauseCircleOutline" />
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MatchCard v-for="m in upcoming" :key="m.id" :match="m" :show-date="false" />
        </div>
      </section>

      <section>
        <SectionHeader title="Encerrados" :icon="mdiCheckCircleOutline" />
        <EmptyState v-if="finished.length === 0" title="Nenhum jogo encerrado ainda" message="Os resultados aparecerão aqui conforme os jogos terminam." :icon="mdiCheckCircleOutline" />
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MatchCard v-for="m in finished" :key="m.id" :match="m" :show-date="false" />
        </div>
      </section>
    </div>
  </div>
</template>
