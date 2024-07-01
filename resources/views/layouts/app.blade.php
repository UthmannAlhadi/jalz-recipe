<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <title>{{ config('app.name', 'Jalz Recipe') }}</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- Scripts -->
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  @vite('resources/js/app.js')
</head>


<body class="font-sans antialiased bg-gray-50 dark:bg-slate-900 min-h-screen">
  <!-- Sidebar -->
  {{-- @include('layouts.sidebar') --}}
  <!-- Navigation -->
  @include('layouts.navigation')



  <!-- Content -->
  <div class="w-full h-full px-4 min sm:px-6 md:px-8 lg:ps-72 bg-gray-50">
    {{ $slot }}
  </div>
  <!-- End Content -->
</body>

</html>
