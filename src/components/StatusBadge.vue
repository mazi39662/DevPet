<template>
  <div class="status-badge" :class="[status, size]">
    <span class="indicator"></span>
    <span class="label">{{ label || status }}</span>
  </div>
</template>

<script setup lang="ts">
import type { AgentStatus } from '../types/status';

withDefaults(
  defineProps<{
    status: AgentStatus;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    label: '',
    size: 'md',
  }
);
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  font-weight: 600;
  text-transform: capitalize;
  user-select: none;
}

.status-badge.sm {
  font-size: 11px;
  padding: 2px 7px;
}
.status-badge.md {
  font-size: 12px;
  padding: 4px 10px;
}
.status-badge.lg {
  font-size: 14px;
  padding: 6px 14px;
}

.indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

/* Colors */
.idle {
  background: rgba(108, 92, 231, 0.15);
  color: #a29bfe;
  border: 1px solid rgba(108, 92, 231, 0.3);
}
.idle .indicator {
  background: #a29bfe;
}

.thinking {
  background: rgba(9, 132, 227, 0.15);
  color: #74b9ff;
  border: 1px solid rgba(9, 132, 227, 0.3);
}
.thinking .indicator {
  background: #74b9ff;
  box-shadow: 0 0 6px #74b9ff;
  animation: pulse 1.5s infinite;
}

.working {
  background: rgba(0, 184, 148, 0.15);
  color: #55efc4;
  border: 1px solid rgba(0, 184, 148, 0.3);
}
.working .indicator {
  background: #55efc4;
  box-shadow: 0 0 6px #55efc4;
  animation: pulse 1s infinite;
}

.completed {
  background: rgba(253, 203, 110, 0.15);
  color: #ffeaa7;
  border: 1px solid rgba(253, 203, 110, 0.3);
}
.completed .indicator {
  background: #ffeaa7;
  box-shadow: 0 0 6px #ffeaa7;
}

.error {
  background: rgba(214, 48, 49, 0.15);
  color: #ff7675;
  border: 1px solid rgba(214, 48, 49, 0.3);
}
.error .indicator {
  background: #ff7675;
  box-shadow: 0 0 6px #ff7675;
}

.waiting {
  background: rgba(225, 112, 85, 0.15);
  color: #fab1a0;
  border: 1px solid rgba(225, 112, 85, 0.3);
}
.waiting .indicator {
  background: #fab1a0;
}

.unknown {
  background: rgba(178, 190, 195, 0.1);
  color: #b2bec3;
  border: 1px solid rgba(178, 190, 195, 0.2);
}
.unknown .indicator {
  background: #b2bec3;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
