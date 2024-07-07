<x-app-layout>

  <!-- Grid -->
  <div
    class="mt-6 md:mt-12 flex justify-center items-center sm:grid-cols-2 lg:grid-cols-1 md:gap-6 lg:gap-3 xl:gap-6 lg:items-center">
    <!-- Card -->
    <div
      class="flex flex-col mb-10 lg:w-2/5 sm:w-full md:w-full bg-purple-vue border-2 border-violet-900 text-center shadow-xl md:p-2 dark:bg-neutral-900 dark:border-violet-700">

      <!-- Title Recipe -->
      <div class="border-b-white border-b-2">
        <p class="my-4 font-bold text-3xl md:text-4xl xl:text-5xl  text-white dark:text-neutral-200">
          Cucur Pulo
        </p>
      </div>

      <!-- Time & Servings -->
      <div class="flex flex-row justify-center items-center mb-2">
        <p class="mt-2 text-xs text-gray-200 dark:text-neutral-500">TOTAL TIME: <span class="text-sm text-white">15
            MINUTES</span></p>
        <p class="mt-2 text-xs ml-6 text-gray-200 dark:text-neutral-500">YIELD: <span class="text-sm text-white">4
            SERVINGS</span></p>
      </div>
      <!-- End Top Content -->


      <div class="bg-white">
        <!-- Mid Content -->
        <div class="mt-4">
          <div class="border-b border-gray-400">
            <div class="">
              <p class="text-sm my-4 text-left ml-2 text-gray-600">Hello, everyone! I would like to share this simple
                and nostalgic recipe with all my dearest viewers. Actually, "Cucur Pulo" is a favourite teatime snacks
                during our childhood days especially prepared by my late mother.</p>
            </div>
            <div>
              <p class="flex justify-start items-start text-gray-400 mt-4 ml-4">INGREDIENTS</p>
            </div>
            <div>
              <p class="flex justify-start items-start text-black mt-6 font-bold my-2 ml-4">Cucur Pulo:</p>
            </div>

            <!-- Checkbox Recipe -->
            <div class="flex my-2 ml-4">
              <input type="checkbox"
                class="shrink-0 mt-0.5 border-gray-700 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                id="hs-checked-1">
              <label for="hs-checked-1" class="text-sm text-gray-500 ms-3 dark:text-neutral-400">5 tbs <span
                  class="text-gray-900 font-semibold">sugar</span> </label>
            </div>

            <div class="flex my-2 ml-4">
              <input type="checkbox"
                class="shrink-0 mt-0.5 border-gray-700 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                id="hs-checked-2">
              <label for="hs-checked-2" class="text-sm text-gray-500 ms-3 dark:text-neutral-400">5 tbs <span
                  class="text-gray-900 font-semibold">margarine/butter</span> </label>
            </div>

            <div class="flex my-2 ml-4">
              <input type="checkbox"
                class="shrink-0 mt-0.5 border-gray-700 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                id="hs-checked-3">
              <label for="hs-checked-2" class="text-sm text-gray-500 ms-3 dark:text-neutral-400">2 cups/300 gm <span
                  class="text-gray-900 font-semibold">all purpose flour (sieved)</span> </label>
            </div>

            <div class="flex my-2 ml-4">
              <input type="checkbox"
                class="shrink-0 mt-0.5 border-gray-700 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                id="hs-checked-4">
              <label for="hs-checked-2" class="text-sm text-gray-500 ms-3 dark:text-neutral-400">1 tbs <span
                  class="text-gray-900 font-semibold">baking powder</span> </label>
            </div>

            <div class="flex my-2 ml-4">
              <input type="checkbox"
                class="shrink-0 mt-0.5 border-gray-700 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                id="hs-checked-5">
              <label for="hs-checked-2" class="text-sm text-gray-500 ms-3 dark:text-neutral-400">1/2 tsp <span
                  class="text-gray-900 font-semibold">salt</span> </label>
            </div>

            <div class="flex my-2 ml-4">
              <input type="checkbox"
                class="shrink-0 mt-0.5 border-gray-700 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                id="hs-checked-6">
              <label for="hs-checked-2" class="text-sm text-gray-500 ms-3 dark:text-neutral-400">1 tsp <span
                  class="text-gray-900 font-semibold">vanilla essence</span> </label>
            </div>

            <div class="flex my-2 ml-4">
              <input type="checkbox"
                class="shrink-0 mt-0.5 border-gray-700 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                id="hs-checked-7">
              <label for="hs-checked-2" class="text-sm text-gray-500 ms-3 dark:text-neutral-400">1 cup/250 ml <span
                  class="text-gray-900 font-semibold">cold water</span> </label>
            </div>

            <div class="flex my-2 ml-4">
              <input type="checkbox"
                class="shrink-0 mt-0.5 border-gray-700 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                id="hs-checked-8">
              <label for="hs-checked-2" class="text-sm text-gray-500 ms-3 dark:text-neutral-400">1 <span
                  class="text-gray-900 font-semibold">egg</span> </label>
            </div>
          </div>
        </div>
        <!-- End Mid Content -->

        <!-- Bottom Content -->
        <div>
          <p class="flex justify-start items-start text-gray-400 mt-4 ml-4">INSTRUCTIONS</p>
        </div>

        <!-- Approach -->
        <div class="mx-2 mt-4">
          <!-- Item -->
          <div class="flex items-center align-middle pb-4 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="size-4 fill-[#734060]" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M9.283 4.002H7.971L6.072 5.385v1.271l1.834-1.318h.065V12h1.312z" />
            </svg>
            <!-- Right Content -->
            <div class="flex items-center align-middle mx-2 ">
              <p class="text-sm lg:text-sm text-gray-500 text-left">
                Prepare all ingredients and utensils needed.
              </p>
            </div>
            <!-- End Right Content -->
          </div>
          <!-- End Item -->

          <!-- Item -->
          <div class="flex items-center align-middle pb-4 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="size-4 fill-[#734060]" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.646 6.24c0-.691.493-1.306 1.336-1.306.756 0 1.313.492 1.313 1.236 0 .697-.469 1.23-.902 1.705l-2.971 3.293V12h5.344v-1.107H7.268v-.077l1.974-2.22.096-.107c.688-.763 1.287-1.428 1.287-2.43 0-1.266-1.031-2.215-2.613-2.215-1.758 0-2.637 1.19-2.637 2.402v.065h1.271v-.07Z" />
            </svg>
            <!-- Right Content -->
            <div class="flex items-center align-middle mx-2 ">
              <p class="text-sm lg:text-sm text-gray-500 text-left">
                Mix sugar and margarine. (Do not beat).
              </p>
            </div>
            <!-- End Right Content -->
          </div>
          <!-- End Item -->

          <!-- Item -->
          <div class="flex items-center align-middle pb-4 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="size-4 fill-[#734060]" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8.082.414c.92 0 1.535.54 1.541 1.318.012.791-.615 1.36-1.588 1.354-.861-.006-1.482-.469-1.54-1.066H5.104c.047 1.177 1.05 2.144 2.754 2.144 1.653 0 2.954-.937 2.93-2.396-.023-1.278-1.031-1.846-1.734-1.916v-.07c.597-.1 1.505-.739 1.482-1.876-.03-1.177-1.043-2.074-2.637-2.062-1.675.006-2.59.984-2.625 2.12h1.248c.036-.556.557-1.054 1.348-1.054.785 0 1.348.486 1.348 1.195.006.715-.563 1.237-1.342 1.237h-.838v1.072h.879Z" />
            </svg>
            <!-- Right Content -->
            <div class="flex items-center align-middle mx-2 ">
              <p class="text-sm lg:text-sm text-gray-500 text-left">
                Add egg, then vanilla essence and mix well.
              </p>
            </div>
            <!-- End Right Content -->
          </div>
          <!-- End Item -->

          <!-- Item -->
          <div class="flex items-center align-middle pb-4 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="size-4 fill-[#734060]" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M7.519 5.057c-.886 1.418-1.772 2.838-2.542 4.265v1.12H8.85V12h1.26v-1.559h1.007V9.334H10.11V4.002H8.176zM6.225 9.281v.053H8.85V5.063h-.065c-.867 1.33-1.787 2.806-2.56 4.218" />
            </svg>
            <!-- Right Content -->
            <div class="flex items-center align-middle mx-2 ">
              <p class="text-sm lg:text-sm text-gray-500 text-left">
                Mix flour, baking powder and salt. Add them in stages to ensure smooth mixing.
              </p>
            </div>
            <!-- End Right Content -->
          </div>
          <!-- End Item -->

          <!-- Item -->
          <div class="flex items-center align-middle pb-4 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="size-4 fill-[#734060]" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8.006 4.158c1.74 0 2.924-1.119 2.924-2.806 0-1.641-1.178-2.584-2.56-2.584-.897 0-1.442.421-1.612.68h-.064l.193-2.344h3.621V4.002H5.791L5.445 8.63h1.149c.193-.358.668-.809 1.435-.809.85 0 1.582.604 1.582 1.57 0 1.085-.779 1.682-1.57 1.682-.697 0-1.389-.31-1.53-1.031H5.276c.065 1.213 1.149 2.115 2.72 2.115Z" />
            </svg>
            <!-- Right Content -->
            <div class="flex items-center align-middle mx-2 ">
              <p class="text-sm lg:text-sm text-gray-500 text-left">
                Add in cold water in stages and mix well.
              </p>
            </div>
            <!-- End Right Content -->
          </div>
          <!-- End Item -->

          <!-- Item -->
          <div class="flex items-center align-middle pb-4 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="size-4 fill-[#734060]" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.21 3.855c-1.868 0-3.116 1.395-3.116 4.407 0 1.183.228 2.039.597 2.642.569.926 1.477 1.254 2.409 1.254 1.629 0 2.847-1.013 2.847-2.783 0-1.676-1.254-2.555-2.508-2.555-1.125 0-1.752.61-1.98 1.155h-.082c-.012-1.946.727-3.036 1.805-3.036.802 0 1.213.457 1.312.815h1.29c-.06-.908-.962-1.899-2.573-1.899Zm-.099 4.008c-.92 0-1.564.65-1.564 1.576 0 1.032.703 1.635 1.558 1.635.868 0 1.553-.533 1.553-1.629 0-1.06-.744-1.582-1.547-1.582" />
            </svg>
            <!-- Right Content -->
            <div class="flex items-center align-middle mx-2 ">
              <p class="text-sm lg:text-sm text-gray-500 text-left">
                Leave the batter in about 15 mins before frying. (While waiting, heat up the oil)
              </p>
            </div>
            <!-- End Right Content -->
          </div>
          <!-- End Item -->

          <!-- Item -->
          <div class="flex items-center align-middle pb-4 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="size-4 fill-[#734060]" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.37 5.11h3.972v.07L6.025 12H7.42l3.258-6.85V4.002H5.369v1.107Z" />
            </svg>
            <!-- Right Content -->
            <div class="flex items-center align-middle mx-2 ">
              <p class="text-sm lg:text-sm text-gray-500 text-left">
                Use spoon to scoop in the batter for frying.
              </p>
            </div>
            <!-- End Right Content -->
          </div>
          <!-- End Item -->
        </div>
        <!-- End Bottom Content -->

        <div class="bg-[#F2F2F2] py-2 pb-4">
          <div>
            <p class="flex justify-start items-start text-gray-400 mt-4 ml-4 mb-2">NOTES</p>
          </div>
          <div class="flex bg-white mx-4 pt-1 pb-1 my-1 items-center align-middle ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              class="size-5 ml-3 fill-[#734060]">
              <path fill-rule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clip-rule="evenodd" />
            </svg>
            <p class="flex justify-start items-start text-sm lg:text-sm text-gray-600 my-1 ml-1">tbs -> table spoon</p>
          </div>
          <div class="flex bg-white mx-4 pt-1 pb-1 my-1 items-center align-middle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              class="size-5 ml-3 fill-[#734060]">
              <path fill-rule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clip-rule="evenodd" />
            </svg>
            <p class="flex justify-start items-start text-sm lg:text-sm text-gray-600 my-1 ml-1">tsp -> tea spoon</p>
          </div>
          <div class="flex flex-row justify-center items-center">
            <p class="mt-2 text-xs text-gray-500 dark:text-neutral-500">PREP TIME: <span
                class="text-sm text-black font-bold">5
                minutes</span></p>
            <p class="mt-2 text-xs ml-6 text-gray-500 dark:text-neutral-500">COOK TIME: <span
                class="text-sm text-black font-bold">8 minutes</span></p>
            <p class="mt-2 text-xs ml-6 text-gray-500 dark:text-neutral-500">CATEGORY: <span
                class="text-sm text-black font-bold">Snacks</span></p>
          </div>
          <div class="flex flex-row justify-center items-center">
            <p class="mt-2 text-xs text-gray-500 dark:text-neutral-500">METHOD: <span
                class="text-sm text-black font-bold">Deep fry</span></p>
            <p class="mt-2 text-xs ml-6 text-gray-500 dark:text-neutral-500">CUISINE: <span
                class="text-sm text-black font-bold">Sarawakian</span></p>
          </div>
        </div>
        <!-- Footer Content -->

      </div>
    </div>

    <!-- End Card -->
  </div>

</x-app-layout>
