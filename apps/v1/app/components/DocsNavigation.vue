<script setup lang="ts">
import { useClassName } from '@/lib/utils'

const cn = useClassName('docs-nav')

interface NavItem {
  title: string
  href: string
  items?: NavItem[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs/introduction' },
      { title: 'Installation', href: '/docs/installation' },
    ]
  },
  {
    title: 'Components',
    items: [
      { title: 'Overview', href: '/docs/components' },
      { title: 'Button', href: '/docs/components/button' },
    ]
  }
]

const route = useRoute()
const isActive = (href: string) => href === route.path
</script>

<template>
  <nav :class="cn.b()">
    <div :class="cn.e('content')">
      <!-- Mobile theme toggle -->
      <div :class="cn.e('mobile-actions')">
        <ThemeToggle />
      </div>
      
      <div 
        v-for="section in navigation" 
        :key="section.title"
        :class="cn.e('section')"
      >
        <h4 :class="cn.e('section-title')">
          {{ section.title }}
        </h4>
        
        <ul :class="cn.e('section-list')">
          <li 
            v-for="item in section.items"
            :key="item.href"
            :class="cn.e('item')"
          >
            <NuxtLink 
              :to="item.href"
              :class="[
                cn.e('link'),
                cn.em('link', 'active', isActive(item.href))
              ]"
            >
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;

.docs-nav {
  width: 280px;
  height: 100vh;
  overflow-y: auto;
  background-color: var(--background-color);
  
  &__content {
    padding: var(--spacing-6) 0;
  }
  
  &__mobile-actions {
    padding: 0 var(--spacing-4);
    margin-bottom: var(--spacing-4);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: var(--spacing-4);
    
    @media (min-width: 769px) {
      display: none;
    }
  }
  
  &__section {
    padding: 0 var(--spacing-4);
    margin-bottom: var(--spacing-6);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  &__section-title {
    @include text('text-xs-semibold');
    color: var(--muted-foreground-color);
    margin: 0 0 var(--spacing-2) 0;
    padding: var(--spacing-2) var(--spacing-2);
  }
  
  &__section-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  
  &__link {
    position: relative;
    @include text('text-sm-medium');
    color: var(--foreground-color);
    display: block;
    padding: var(--spacing-2) var(--spacing-2);
    text-decoration: none;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    
    &:hover {
      color: var(--primary-color);
      background-color: var(--muted-color);
      border-radius: var(--radius-lg);
    }
    
    &--active {
      color: var(--primary-color);
      background-color: var(--muted-color);
      border-radius: var(--radius-lg);
    }
    
    &:focus-visible {
      @include focus-ring;
    }
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .docs-nav {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-modal);
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    box-shadow: var(--shadow-lg);
    
    &--open {
      transform: translateX(0);
    }
  }
}

// Custom scrollbar styling
.docs-nav {
  scrollbar-width: thin;
  scrollbar-color: var(--muted-foreground-color) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--muted-foreground-color);
    border-radius: 3px;
    opacity: 0.3;
    
    &:hover {
      opacity: 0.6;
    }
  }
}
</style>
