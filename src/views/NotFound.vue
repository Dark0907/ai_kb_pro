<template>
  <div class="flex flex-col items-center justify-center h-full p-4 text-center">
    <div class="max-w-md">
      <h1 class="text-6xl font-bold text-legal-secondary mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-legal-dark dark:text-white mb-4">
        {{ $t('notFound.title') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        {{ $t('notFound.message') }}
      </p>
      <router-link 
        to="/" 
        class="btn btn-primary px-6 py-3"
      >
        {{ $t('notFound.back_home') }}
      </router-link>
    </div>
  </div>
</template>
